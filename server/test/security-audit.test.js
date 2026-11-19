const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('os');
const path = require('path');
const initSqlJs = require('sql.js');
const { start } = require('../src/index');
const { BOARD_RULES_VERSION } = require('../src/boardEngine');
const { csvCell, toCsv } = require('../src/riskControl');
const { offerBoard, redeem } = require('../../scripts/fixtures/rescue-security-helper.cjs');
const { verifyReplay } = require('../src/replayService');

let server, base, dbPath, clock, realNow, sequence = 0;
test.before(async () => {
  realNow = Date.now; clock = realNow(); Date.now = () => clock;
  dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-security-')), 'test.sqlite');
  server = (await start(dbPath)).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/v1/cocos-zyx`;
});
test.after(async () => {
  Date.now = realNow; delete process.env.RISK_ADMIN_TOKEN;
  await new Promise(resolve => server.close(resolve));
});
async function api(route, token, body) {
  const response = await fetch(base + route, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, ...(await response.json()) };
}
async function player() {
  return (await api('/players/bootstrap', '', { deviceId: `security-player-${++sequence}` })).data;
}
async function rows(sql, params = []) {
  const SQL = await initSqlJs(); const db = new SQL.Database(fs.readFileSync(dbPath));
  const stmt = db.prepare(sql); stmt.bind(params); const result = [];
  while (stmt.step()) result.push(stmt.getAsObject());
  stmt.free(); db.close(); return result;
}

test('V14旧局各三次视频；V20锤分享棒视频各五次，幂等和续玩不刷新额度', async () => {
  const { default: BoardEngine } = require('../src/boardEngine');
  for (const [rulesVersion, item, limit, waitMs] of [[14, 'hammer', 3, 5000], [14, 'magicWand', 3, 5000],
      [20, 'hammer', 5, 3000], [20, 'magicWand', 5, 5000]]) {
    const user = await player(), roundId = `tool_v${rulesVersion}_${item}`;
    const begun = (await api('/games/start', user.token, { roundId, rulesVersion, collectionRule: 'progress_v2', resumeProtocol: 1, securityProtocol: 1 })).data;
    const board = new BoardEngine(); board.resetBoard(begun.seed, begun.isTutorial, rulesVersion);
    const sessionToken = begun.sessionToken, placement = item === 'hammer' ? 'hammer' : 'tool';
    for (let n = 0; n < limit; n++) {
      const proof = () => ({ roundId, sessionToken, actions: board.roundActions, elapsedMs: clock - begun.startedAt });
      const intent = await api('/games/reward-intents', user.token, { ...proof(), placement });
      assert.equal(intent.status, 200, JSON.stringify(intent));
      assert.equal(intent.data.minClaimAt - clock, waitMs);
      clock += waitMs;
      assert.equal((await api('/games/reward-intents/complete', user.token, { intentId: intent.data.intentId, sessionToken })).status, 200);
      const claim = { roundId, sessionToken, item, actionId: `${roundId}_claim_${n}`, intentId: intent.data.intentId };
      assert.equal((await api('/games/tools/reward', user.token, claim)).data.roundTools[item].acquired, n + 1);
      assert.equal((await api('/games/tools/reward', user.token, claim)).data.duplicate, true);
      const target = item === 'hammer' ? board.pieces[0].id : board.pieces[0].color;
      const used = await api('/games/tools/use', user.token, { ...proof(), item, actionId: `${roundId}_use_${n}`, actionIndex: board.roundActions.length, target });
      assert.equal(used.status, 200, JSON.stringify(used));
      board.hammerCount = board.colorPurifierCount = 1;
      if (item === 'hammer') assert.ok(board.useHammer(target));
      else assert.ok(board.useColorPurifier(target).length);
      board.resolveBoard(); board.appendTurnRows(); board.resolveBoard();
      while (board.getOccupiedRowCount() < board.getRefillRowTarget() && board.actionAppends < 5) {
        assert.ok(board.appendNextRow()); board.resolveBoard();
      }
      board.finishPlayerAction();
    }
    const exhausted = await api('/games/reward-intents', user.token, { roundId, sessionToken, placement, actions: board.roundActions, elapsedMs: clock - begun.startedAt });
    assert.equal(exhausted.errorCode, 'TOOL_REWARD_LIMIT');
    const saved = await api('/games/checkpoint', user.token, { roundId, sessionToken, actions: board.roundActions, elapsedMs: clock - begun.startedAt });
    assert.equal(saved.status, 200, JSON.stringify(saved));
    const resumed = await api('/games/resume', user.token, { roundId, expectedGeneration: 0, requestId: `${roundId}_resume`, maxRulesVersion: rulesVersion });
    assert.deepEqual(resumed.data.roundTools[item], { acquired: limit, used: limit, owned: 0 });
  }
});

test('当前规则不能省略安全协议开局，旧规则仍可开局', async () => {
  const user = await player();
  const blocked = await api('/games/start', user.token, { roundId: 'insecure_v13', rulesVersion: BOARD_RULES_VERSION, collectionRule: 'progress_v2', resumeProtocol: 1 });
  assert.equal(blocked.errorCode, 'SECURITY_PROTOCOL_REQUIRED');
  assert.equal((await api('/players/bootstrap', '', { deviceId: `security-player-${sequence}` })).data.profile.stamina.current, 10);
  const legacy = await api('/games/start', user.token, { roundId: 'legacy_v12', rulesVersion: 12, collectionRule: 'progress_v2' });
  assert.equal(legacy.status, 200);
  assert.equal(legacy.data.stamina.current, 9);
});

test('广告复活没有服务端凭据时不能写入进度，风险只记核验事实', async () => {
  const user = await player();
  const begun = await api('/games/start', user.token, { roundId: 'reward_proof_round', rulesVersion: BOARD_RULES_VERSION, collectionRule: 'progress_v2', resumeProtocol: 1, securityProtocol: 1 });
  clock += 12000;
  const actions = [{ type: 'rules', version: BOARD_RULES_VERSION }, { type: 'revive', rowCount: 8 }];
  const saved = await api('/games/checkpoint', user.token, { roundId: begun.data.roundId, sessionToken: begun.data.sessionToken, actions, elapsedMs: 10000 });
  assert.equal(saved.errorCode, 'REWARD_PROOF_REQUIRED');
  const events = await rows('SELECT code, weight FROM risk_events WHERE player_id = ?', [user.profile.playerId]);
  assert.deepEqual(events, [{ code: 'REWARD_PROOF_REQUIRED', weight: 20 }]);
});

test('省略续玩会话不能放弃旧局；奖励未到观察时间不能领取', async () => {
  const user = await player();
  const begun = await api('/games/start', user.token, { roundId: 'session_guard_round', rulesVersion: BOARD_RULES_VERSION, collectionRule: 'progress_v2', resumeProtocol: 1, securityProtocol: 1 });
  const sessionToken = begun.data.sessionToken;
  const resumed = await api('/games/resume', user.token, { roundId: begun.data.roundId, expectedGeneration: 0, requestId: 'resume_session_guard', maxRulesVersion: BOARD_RULES_VERSION });
  assert.equal(resumed.status, 200);
  const bypass = await api('/games/start', user.token, {
    roundId: 'replacement_without_session', rulesVersion: BOARD_RULES_VERSION, collectionRule: 'progress_v2', resumeProtocol: 1, securityProtocol: 1,
    replaceRoundId: begun.data.roundId, replacementGeneration: resumed.data.generation,
  });
  assert.equal(bypass.errorCode, 'ROUND_SESSION_CONFLICT');
  assert.equal((await rows('SELECT status FROM game_rounds WHERE round_id = ?', [begun.data.roundId]))[0].status, 'active');
  clock += 1000;
  const intent = await api('/games/reward-intents', user.token, {
    placement: 'hammer', roundId: begun.data.roundId, sessionToken: resumed.data.sessionToken,
    actions: resumed.data.actions, elapsedMs: 1000,
  });
  assert.equal(intent.status, 200);
  assert.equal((await api('/games/reward-intents/complete', user.token, { intentId: intent.data.intentId, sessionToken: resumed.data.sessionToken })).errorCode, 'REWARD_TOO_EARLY');
  clock += 5000;
  assert.equal((await api('/games/reward-intents/complete', user.token, { intentId: intent.data.intentId, sessionToken: resumed.data.sessionToken })).status, 200);
  const claim = { roundId: begun.data.roundId, sessionToken: resumed.data.sessionToken, item: 'hammer', actionId: 'secure_hammer_claim', intentId: intent.data.intentId };
  assert.equal((await api('/games/tools/reward', user.token, claim)).status, 200);
  assert.equal((await api('/games/tools/reward', user.token, claim)).data.duplicate, true);
  assert.equal((await api('/games/tools/reward', user.token, { ...claim, actionId: 'secure_hammer_claim_again' })).errorCode, 'TOOL_ALREADY_OWNED');
});

test('未配置管理令牌时风险接口不存在；导出表不带公式，且默认不含 openid', async () => {
  assert.equal(csvCell('=cmd'), '"\t=cmd"');
  const csv = toCsv([{ playerId: 'p', nickname: '小熊', wechatBound: 1, wechatOpenId: '', riskLevel: 'review', riskScore: 20, distinctFlaggedRounds: 1, eventCount: 1, firstSeen: 1, lastSeen: 2, highestScore: 0, beanBalance: 0, reviewStatus: 'pending', reviewNotes: '' }]);
  assert.equal(csv.includes('secret-openid'), false);
  assert.equal((await api('/admin/risks/export')).status, 404);
  process.env.RISK_ADMIN_TOKEN = 'a'.repeat(32);
  assert.equal((await api('/admin/risks/export', 'wrong-token')).status, 403);
  const exported = await api('/admin/risks/export?format=json', process.env.RISK_ADMIN_TOKEN);
  assert.equal(exported.status, 200);
  assert.ok(Array.isArray(exported.users));
  assert.ok(exported.users.every(row => row.wechatOpenId === ''));
});

test('严格重放接受救场固定补排；仍拒绝漏补、改排数、重复补排和未结束操作', async () => {
  for (const [seed, kind] of [[3, 'clear'], [1, 'balloon'], [3, 'heart']]) {
    const board = redeem(offerBoard(seed, kind), kind);
    const verify = actions => verifyReplay({ seed, tutorial: false, actions, version: 13,
      heartEligible: kind === 'heart', checkpoint: true, strict: true });
    const accepted = await verify(board.roundActions);
    assert.equal(accepted.valid, true, kind); assert.equal(accepted.ready, true, kind);
    assert.equal(accepted.score, board.score); assert.equal(accepted.collectedMoodBeans, board.roundCollectedMoodBeans);
    if (kind === 'clear') assert.equal(board.getOccupiedRowCount(), 2);
    const rise = board.roundActions.map(action => action.type).lastIndexOf('rise');
    for (const actions of [
      board.roundActions.filter((_, index) => index !== rise),
      board.roundActions.map((action, index) => index === rise ? { type: 'rise', rows: action.rows + 1 } : action),
      [...board.roundActions.slice(0, rise + 1), board.roundActions[rise], ...board.roundActions.slice(rise + 1)],
      board.roundActions.slice(0, -1),
      [...board.roundActions.slice(0, -1), { type: 'append' }, board.roundActions.at(-1)],
    ]) assert.equal((await verify(actions)).valid, false, kind + ' malformed refill');
  }
});

test('安全协议清屏只补两排后，锤子分享和魔法棒视频仍可申请、确认和领取', async () => {
  const user = await player();
  const crypto = require('crypto'), randomBytes = crypto.randomBytes;
  let begun;
  try {
    crypto.randomBytes = size => size === 4 ? Buffer.from([0, 0, 0, 1]) : randomBytes(size);
    begun = (await api('/games/start', user.token, { roundId: 'secure_clear_then_tools', rulesVersion: 13,
      collectionRule: 'progress_v2', resumeProtocol: 1, securityProtocol: 1 })).data;
  } finally { crypto.randomBytes = randomBytes; }
  assert.equal(begun.seed, 1); assert.equal(begun.isTutorial, true);
  const board = offerBoard(begun.seed, 'clear', begun.isTutorial);
  clock += 65000;
  const proof = () => ({ roundId: begun.roundId, sessionToken: begun.sessionToken,
    actions: board.roundActions, elapsedMs: 60000 });
  const rescue = await api('/games/reward-intents', user.token, { ...proof(), placement: 'rescue' });
  assert.equal(rescue.status, 200); clock += 5000;
  assert.equal((await api('/games/reward-intents/complete', user.token,
    { intentId: rescue.data.intentId, sessionToken: begun.sessionToken })).status, 200);
  redeem(board, 'clear'); assert.equal(board.getOccupiedRowCount(), 2);
  assert.equal((await api('/games/checkpoint', user.token, proof())).status, 200);
  for (const [placement, item] of [['hammer', 'hammer'], ['tool', 'magicWand']]) {
    const intent = await api('/games/reward-intents', user.token, { ...proof(), placement });
    assert.equal(intent.status, 200, intent.message); clock += 5000;
    assert.equal((await api('/games/reward-intents/complete', user.token,
      { intentId: intent.data.intentId, sessionToken: begun.sessionToken })).status, 200);
    const reward = await api('/games/tools/reward', user.token, { roundId: begun.roundId,
      sessionToken: begun.sessionToken, item, actionId: 'after_clear_' + item, intentId: intent.data.intentId });
    assert.equal(reward.status, 200); assert.equal(reward.data.roundTools[item].owned, 1);
  }
  assert.deepEqual(await rows("SELECT code FROM risk_events WHERE player_id=? AND code='PROGRESS_INVALID'", [user.profile.playerId]), []);
});
