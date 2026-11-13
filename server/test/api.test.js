// 显式开启历史协议兼容性夹具；正式服务默认只允许当前规则新开局。
process.env.ALLOW_LEGACY_ROUND_STARTS = '1';
/** 服务端体力、结算幂等与秘境下线集成测试。只使用临时数据库。 */
process.env.ENABLE_GM_ROUTES = '1';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const initSqlJs = require('sql.js');
const { start } = require('../src/index.js');

let server;
let baseUrl;
let dbFilePath;
let clock;
let realDateNow;
let playerSeq = 0;
let roundSeq = 0;
let loginCodeSeq = 0;
let weChatServer;
const weChatLoginCodes = new Map();

test.before(async () => {
  process.env.WECHAT_APP_SECRET = 'test-secret';
  weChatServer = http.createServer((req, res) => {
    const requestUrl = new URL(req.url, 'http://127.0.0.1');
    const code = requestUrl.searchParams.get('js_code');
    const openid = weChatLoginCodes.get(code);
    weChatLoginCodes.delete(code);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(openid ? { openid } : { errcode: 40029, errmsg: 'invalid code' }));
  });
  weChatServer.listen(0);
  await new Promise((resolve) => weChatServer.once('listening', resolve));
  process.env.WECHAT_API_BASE_URL = `http://127.0.0.1:${weChatServer.address().port}`;
  realDateNow = Date.now;
  clock = Date.parse('2026-10-28T10:00:00.000Z');
  Date.now = () => clock;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-economy-test-'));
  dbFilePath = path.join(tempDir, 'test.sqlite');
  const app = await start(dbFilePath);
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  Date.now = realDateNow;
  await new Promise((resolve) => server.close(resolve));
  await new Promise((resolve) => weChatServer.close(resolve));
  delete process.env.WECHAT_APP_SECRET;
  delete process.env.WECHAT_API_BASE_URL;
});

async function api(apiPath, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}/v1/cocos-zyx${apiPath}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const raw = await response.text();
  let payload;
  try { payload = JSON.parse(raw); } catch (_error) { payload = null; }
  return { status: response.status, payload };
}

async function bootstrap(deviceId) {
  const response = await api('/players/bootstrap', {
    method: 'POST',
    body: { deviceId, nickname: '测试玩家', avatarUrl: '', localProfile: { moodBeanBalance: 99999999 } },
  });
  assert.equal(response.status, 200);
  return response.payload.data;
}

async function wechatPlayer(deviceId, openid) {
  const loginCode = `test_login_code_${++loginCodeSeq}`;
  weChatLoginCodes.set(loginCode, openid);
  const response = await api('/players/bootstrap', {
    method: 'POST',
    body: { deviceId, loginCode },
  });
  assert.equal(response.status, 200);
  return response.payload.data;
}

async function newPlayer() {
  playerSeq++;
  return bootstrap(`test_device_${playerSeq}`);
}

async function startRound(token, roundId = `round_test_${++roundSeq}`) {
  return api('/games/start', { method: 'POST', token, body: { roundId } });
}

function settlementBody(roundId, collectedMoodBeanCount = 70, score = 500) {
  return {
    roundId,
    startedAt: clock - 60 * 1000,
    endedAt: clock,
    score,
    collectedMoodBeanCount,
  };
}

async function settle(token, body) {
  return api('/games/settlements', { method: 'POST', token, body });
}



async function readDisk(sql, params = []) {
  const SQL = await initSqlJs();
  const disk = new SQL.Database(fs.readFileSync(dbFilePath));
  try {
    const statement = disk.prepare(sql);
    statement.bind(params);
    const rows = [];
    while (statement.step()) rows.push(statement.getAsObject());
    statement.free();
    return rows;
  } finally {
    disk.close();
  }
}

test('新账号获得稳定默认昵称和 10 点体力，客户端伪造资料与余额被忽略', async () => {
  const boot = await newPlayer();
  assert.match(boot.profile.nickname, /^(美丽的|快乐的|勇敢的|温柔的|机灵的|幸运的|恬静的|活泼的|善良的|可爱的)小(狐狸|天鹅|熊|猫咪|兔子|企鹅|鹿|松鼠|熊猫|海豚|柴犬|考拉)$/);
  assert.equal(boot.profile.avatarUrl, '');
  assert.equal(boot.profile.moodBeanBalance, 0);
  assert.equal(boot.profile.stamina.current, 10);
  assert.equal(boot.profile.stamina.max, 10);
  assert.equal(boot.profile.stamina.regenSeconds, 300);
  assert.equal(boot.profile.stamina.nextRecoveryAt, null);
  const again = await bootstrap(`test_device_${playerSeq}`);
  assert.equal(again.profile.nickname, boot.profile.nickname);
});

test('微信清缓存更换 deviceId 后按 openid 恢复同一 playerId、token 和资料', async () => {
  const first = await wechatPlayer('wx_device_before_clear', 'openid_stable_after_cache_clear');
  const updated = await api('/players/profile', {
    method: 'POST', token: first.token,
    body: { nickname: '清缓存不丢号', avatarUrl: 'https://thirdwx.qlogo.cn/stable.png' },
  });
  assert.equal(updated.status, 200);
  const restored = await wechatPlayer('wx_device_after_clear', 'openid_stable_after_cache_clear');
  assert.equal(restored.profile.playerId, first.profile.playerId);
  assert.equal(restored.token, first.token);
  assert.equal(restored.profile.nickname, '清缓存不丢号');
  assert.equal(restored.profile.avatarUrl, 'https://thirdwx.qlogo.cn/stable.png');
  const rows = await readDisk('SELECT player_id FROM players WHERE wechat_openid = ?', ['openid_stable_after_cache_clear']);
  assert.equal(rows.length, 1);
});

test('旧设备账号首次微信登录原地绑定 openid，不清空原玩家数据', async () => {
  const legacy = await bootstrap('legacy_device_before_wechat_binding');
  const bound = await wechatPlayer('legacy_device_before_wechat_binding', 'openid_legacy_binding');
  assert.equal(bound.profile.playerId, legacy.profile.playerId);
  assert.equal(bound.token, legacy.token);
  const restored = await wechatPlayer('legacy_device_after_cache_clear', 'openid_legacy_binding');
  assert.equal(restored.profile.playerId, legacy.profile.playerId);
});

test('同一 deviceId 切换不同微信 openid 时不会串用旧账号', async () => {
  const first = await wechatPlayer('shared_device_between_wechat_accounts', 'openid_account_a');
  const second = await wechatPlayer('shared_device_between_wechat_accounts', 'openid_account_b');
  assert.notEqual(second.profile.playerId, first.profile.playerId);
  const firstRestored = await wechatPlayer('account_a_new_device', 'openid_account_a');
  assert.equal(firstRestored.profile.playerId, first.profile.playerId);
});

test('无效微信 loginCode 明确失败且不创建设备兜底账号', async () => {
  const before = await readDisk('SELECT COUNT(*) AS count FROM players');
  const response = await api('/players/bootstrap', {
    method: 'POST', body: { deviceId: 'invalid_login_code_device', loginCode: 'invalid_login_code' },
  });
  assert.equal(response.status, 502);
  assert.equal(response.payload.errorCode, 'WECHAT_LOGIN_CODE_INVALID');
  const after = await readDisk('SELECT COUNT(*) AS count FROM players');
  assert.equal(after[0].count, before[0].count);
});

test('只有显式资料接口能更新微信昵称头像，非法资料不会改变原值', async () => {
  const boot = await newPlayer();
  const deviceId = `test_device_${playerSeq}`;
  const updated = await api('/players/profile', {
    method: 'POST', token: boot.token,
    body: { nickname: '  微信玩家  ', avatarUrl: 'https://thirdwx.qlogo.cn/avatar.png' },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.payload.data.profile.nickname, '微信玩家');
  assert.equal(updated.payload.data.profile.avatarUrl, 'https://thirdwx.qlogo.cn/avatar.png');
  const invalid = await api('/players/profile', { method: 'POST', token: boot.token, body: { nickname: '', avatarUrl: '' } });
  assert.equal(invalid.status, 400);
  const again = await bootstrap(deviceId);
  assert.equal(again.profile.nickname, '微信玩家');
  assert.equal(again.profile.avatarUrl, 'https://thirdwx.qlogo.cn/avatar.png');
});

test('开局只扣一次体力；无服务端入局凭证的结算不能发币', async () => {
  const { token } = await newPlayer();
  const first = await startRound(token, 'round_idempotent');
  assert.equal(first.status, 200);
  assert.equal(first.payload.data.stamina.current, 9);
  assert.equal(first.payload.data.stamina.nextRecoveryAt, new Date(clock + 300000).toISOString());
  const retry = await startRound(token, 'round_idempotent');
  assert.equal(retry.status, 200);
  assert.equal(retry.payload.data.duplicate, true);
  assert.equal(retry.payload.data.stamina.current, 9);
  assert.equal(retry.payload.data.seed, first.payload.data.seed);
  assert.equal(retry.payload.data.isTutorial, first.payload.data.isTutorial);
  clock += 10 * 1000;
  const forged = await settle(token, settlementBody('round_without_ticket', 5000));
  assert.equal(forged.status, 409);
  assert.equal(forged.payload.errorCode, 'ROUND_NOT_STARTED');
  const profile = await bootstrap('test_device_2');
  assert.equal(profile.profile.moodBeanBalance, 0);
});

test('体力用尽后 5 分钟恢复 1 点，余额与冷却使用服务端时钟', async () => {
  const { token } = await newPlayer();
  for (let index = 0; index < 10; index++) {
    const result = await startRound(token, `drain_${index}`);
    assert.equal(result.status, 200);
  }
  const blocked = await startRound(token, 'drain_blocked');
  assert.equal(blocked.status, 429);
  assert.equal(blocked.payload.errorCode, 'STAMINA_EMPTY');
  assert.equal(blocked.payload.data.stamina.current, 0);
  clock += 5 * 60 * 1000;
  const recovered = await startRound(token, 'after_recovery');
  assert.equal(recovered.status, 200);
  assert.equal(recovered.payload.data.stamina.current, 0);
  const retry = await startRound(token, 'after_recovery');
  assert.equal(retry.payload.data.duplicate, true);
  assert.equal(retry.payload.data.stamina.current, 0);
});

test('分享补体力每天一次且允许超过上限，重复请求不重复加点', async () => {
  const fullPlayer = await newPlayer();
  const overCap = await api('/stamina/share-claim', { method: 'POST', token: fullPlayer.token, body: { claimId: 'share_over_cap_001' } });
  assert.equal(overCap.status, 200);
  assert.equal(overCap.payload.data.stamina.current, 15);
  assert.equal(overCap.payload.data.stamina.nextRecoveryAt, null);
  const spent = await startRound(fullPlayer.token, 'over_cap_spent');
  assert.equal(spent.payload.data.stamina.current, 14);
  assert.equal(spent.payload.data.stamina.nextRecoveryAt, null);
  clock += 5 * 60 * 1000;
  const stillOverCap = await startRound(fullPlayer.token, 'over_cap_spent_again');
  assert.equal(stillOverCap.payload.data.stamina.current, 13);

  const { token } = await newPlayer();
  for (let index = 0; index < 10; index++) {
    const round = await startRound(token, `share_drain_${index}`);
    assert.equal(round.status, 200);
  }
  // 分享面板停留期间可能自然恢复 1 点，已发起的分享仍应兑现奖励。
  clock += 5 * 60 * 1000;
  const first = await api('/stamina/share-claim', { method: 'POST', token, body: { claimId: 'share_first_claim_001' } });
  assert.equal(first.status, 200);
  assert.equal(first.payload.data.awarded, 5);
  assert.equal(first.payload.data.stamina.current, 6);
  assert.equal(first.payload.data.stamina.shareAvailableToday, false);
  const retry = await api('/stamina/share-claim', { method: 'POST', token, body: { claimId: 'share_first_claim_001' } });
  assert.equal(retry.status, 200);
  assert.equal(retry.payload.data.duplicate, true);
  assert.equal(retry.payload.data.stamina.current, 6);
  const second = await api('/stamina/share-claim', { method: 'POST', token, body: { claimId: 'share_second_claim_002' } });
  assert.equal(second.status, 429);
  assert.equal(second.payload.errorCode, 'STAMINA_SHARE_DAILY_LIMIT');
  const onDisk = await readDisk('SELECT stamina_current FROM players WHERE token = ?', [token]);
  assert.equal(onDisk[0].stamina_current, 6);
  const claims = await readDisk('SELECT COUNT(*) AS count FROM stamina_share_claims WHERE player_id = (SELECT player_id FROM players WHERE token = ?)', [token]);
  assert.equal(claims[0].count, 1);
});

test('每局收集的开心豆与经验正常入账，重复结算幂等，排行榜更新', async () => {
  const { token } = await newPlayer();
  const firstStart = await startRound(token, 'cap_first');
  assert.equal(firstStart.status, 200);
  clock += 10 * 1000;
  const firstBody = settlementBody('cap_first', 70, 500);
  const first = await settle(token, firstBody);
  assert.equal(first.status, 200);
  assert.equal(first.payload.data.settlement.awardedMoodBeans, 70);

  await startRound(token, 'cap_second');
  clock += 10 * 1000;
  const second = await settle(token, settlementBody('cap_second', 70, 600));
  assert.equal(second.status, 200);
  assert.equal(second.payload.data.settlement.awardedMoodBeans, 70);
  assert.equal(second.payload.data.settlement.profile.moodBeanBalance, 140);
  assert.equal(second.payload.data.settlement.profile.highestSingleGameScore, 600);
  assert.ok(second.payload.data.settlement.profile.level > 1);

  await startRound(token, 'cap_third');
  clock += 10 * 1000;
  const third = await settle(token, settlementBody('cap_third', 70, 400));
  assert.equal(third.status, 200);
  assert.equal(third.payload.data.settlement.awardedMoodBeans, 70);
  assert.equal(third.payload.data.settlement.profile.moodBeanBalance, 210);
  const same = await settle(token, settlementBody('cap_third', 70, 400));
  assert.equal(same.status, 200);
  assert.equal(same.payload.data.duplicate, true);
  assert.equal(same.payload.data.settlement.awardedMoodBeans, 70);
  const changed = await settle(token, settlementBody('cap_third', 71, 400));
  assert.equal(changed.status, 409);
  assert.equal(changed.payload.errorCode, 'ROUND_PAYLOAD_CONFLICT');

  const power = await api('/leaderboards?type=power', { token });
  assert.equal(power.status, 200);
  assert.equal(power.payload.data.self.bestScore, 600);
  assert.equal(power.payload.data.self.onBoard, true);
  assert.equal(power.payload.data.self.rank, 1);
  const oldBoard = await api('/leaderboards?type=happiness', { token });
  assert.equal(oldBoard.status, 400);
});

test('旧秘境路由与新库拼画表不再存在', async () => {
  const { token } = await newPlayer();
  const realmState = await api('/realm/state', { token });
  assert.equal(realmState.status, 404);
  const contribute = await api('/realm/arts/contribute', { method: 'POST', token, body: {} });
  assert.equal(contribute.status, 404);
  const tables = await readDisk("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'official_art_%'");
  assert.equal(tables.length, 0);
});

test('进度规则锁定到服务端开局；真实表情推进进度但未满一颗不发豆，逐局清零', async () => {
  const { token } = await newPlayer();
  for (const roundId of ['progress_round_a', 'progress_round_b']) {
    const start = await api('/games/start', { method: 'POST', token,
      body: { roundId, collectionRule: 'progress_v1' } });
    assert.equal(start.status, 200);
    assert.equal(start.payload.data.collectionRule, 'progress_v1');
    const retry = await api('/games/start', { method: 'POST', token,
      body: { roundId, collectionRule: 'progress_v1' } });
    assert.equal(retry.payload.data.stamina.current, start.payload.data.stamina.current);
    const conflict = await startRound(token, roundId);
    assert.equal(conflict.status, 409);
    assert.equal(conflict.payload.errorCode, 'ROUND_COLLECTION_RULE_CONFLICT');
    clock += 10000;
    const forged = await settle(token, settlementBody(roundId, 30000, 10));
    assert.equal(forged.status, 400);
    assert.equal(forged.payload.errorCode, 'REPLAY_INVALID');
    const actions = [{ type: 'move', id: 1, offset: -1 }];
    const replay = require('../src/gameEngine').replayRound(start.payload.data.seed, true, actions);
    const body = { ...settlementBody(roundId, replay.collectedMoodBeans, replay.score), actions, awardedMoodBeans: 999 };
    const settled = await settle(token, body);
    assert.equal(settled.status, 200);
    assert.equal(settled.payload.data.settlement.awardedMoodBeans, 0);
    assert.equal(settled.payload.data.settlement.gainedExperience, replay.collectedMoodBeans);
    assert.equal(settled.payload.data.settlement.profile.moodBeanBalance, 0);
    const repeated = await settle(token, body);
    assert.equal(repeated.payload.data.duplicate, true);
    assert.deepEqual(repeated.payload.data.settlement, settled.payload.data.settlement);
  }
});

test('长局真实重放超过两万表情块，发多颗整豆且保留原资产，重试不重复奖励', async () => {
  const { token } = await newPlayer();
  await api('/debug/profile', { method: 'POST', token, body: { moodBeanBalance: 17 } });
  const roundId = 'progress_long_round';
  const begun = await api('/games/start', { method: 'POST', token, body: { roundId, collectionRule: 'progress_v1' } });
  assert.equal(begun.status, 200);
  // 使用真实重放操作而非伪造计数；多次清台模拟长局救场，不计入收集奖励。
  const actions = [{ type: 'clear' }];
  for (let batch = 0; batch < 9999; batch++) {
    for (let i = 0; i < 9; i++) actions.push({ type: 'append' });
    actions.push({ type: 'clear' });
  }
  const replay = require('../src/gameEngine').replayRound(begun.payload.data.seed, true, actions);
  assert.equal(replay.valid, true);
  assert.ok(replay.collectedMoodBeans >= 20000);
  const beans = Math.floor(replay.collectedMoodBeans / 10000);
  clock += 10000;
  const body = { ...settlementBody(roundId, replay.collectedMoodBeans, replay.score), actions };
  assert.ok(JSON.stringify(body).length > 32768, '覆盖旧请求大小上限');
  const result = await settle(token, body);
  assert.equal(result.status, 200);
  assert.equal(result.payload.data.settlement.awardedMoodBeans, beans);
  assert.equal(result.payload.data.settlement.gainedExperience, replay.collectedMoodBeans);
  assert.equal(result.payload.data.settlement.profile.moodBeanBalance, 17 + beans);
  const duplicate = await settle(token, body);
  assert.equal(duplicate.payload.data.duplicate, true);
  assert.deepEqual(duplicate.payload.data.settlement, result.payload.data.settlement);
  const disk = await readDisk('SELECT mood_token_count, awarded_mood_beans FROM round_settlements WHERE round_id = ?', [roundId]);
  assert.equal(disk[0].mood_token_count, replay.collectedMoodBeans);
  assert.equal(disk[0].awarded_mood_beans, beans);
});

test('V2 新局绑定共享棋盘版本，真实连消炸弹完整结算，重复开局不能切换规则', async () => {
  const { token } = await newPlayer();
  const roundId = 'adaptive_combo_v2';
  const begun = await api('/games/start', { method: 'POST', token,
    body: { roundId, collectionRule: 'progress_v1', rulesVersion: 2 } });
  assert.equal(begun.status, 200);
  assert.equal(begun.payload.data.rulesVersion, 2);
  const conflict = await api('/games/start', { method: 'POST', token,
    body: { roundId, collectionRule: 'progress_v1', rulesVersion: 1 } });
  assert.equal(conflict.status, 409);
  assert.equal(conflict.payload.errorCode, 'BOARD_RULES_UNSUPPORTED');
  const { default: BoardEngine, MAX_ACTION_APPENDS } = require('../src/boardEngine');
  const board = new BoardEngine();
  board.resetBoard(begun.payload.data.seed, true, begun.payload.data.rulesVersion);
  for (let step = 0; step < 3; step++) {
    const move = board.getTutorialMove(step);
    board.movePiece(move.id, move.offset); board.resolveBoard(); board.finishPlayerAction();
  }
  for (let row = 0; row < 3; row++) board.appendNextRow();
  board.resolveBoard(); board.finishPlayerAction();
  const bomb = board.pieces.find(piece => piece.bomb);
  assert.ok(bomb);
  board.detonateBomb(bomb.id); board.resolveBoard();
  while (board.getOccupiedRowCount() < 3 && board.actionAppends < MAX_ACTION_APPENDS) {
    board.appendTurnRows(); board.resolveBoard();
  }
  board.finishPlayerAction();
  clock += 60000;
  const forged = await settle(token, { ...settlementBody(roundId, 0, 999999), actions: [] });
  assert.equal(forged.status, 400);
  assert.equal(forged.payload.errorCode, 'REPLAY_INVALID');
  const body = { ...settlementBody(roundId, board.roundCollectedMoodBeans, board.score), actions: board.roundActions };
  const settled = await settle(token, body);
  assert.equal(settled.status, 200);
  assert.equal(settled.payload.data.settlement.score, board.score);
  assert.equal(settled.payload.data.settlement.gainedExperience, board.roundCollectedMoodBeans);
  assert.equal(settled.payload.data.settlement.awardedMoodBeans, Math.floor(board.roundCollectedMoodBeans / 10000));
});

test('1% 收集规则每100表情发一豆，旧局保留原折算且结算参数不能提倍率', async () => {
  const { token } = await newPlayer();
  const { default: BoardEngine, MAX_ACTION_APPENDS } = require('../src/boardEngine');
  for (const rule of ['progress_v2', 'progress_v1']) {
    const roundId = `one_percent_${rule}`;
    // 固定棋盘种子，避免经济边界用例依赖随机局面是否提前失败。
    const crypto = require('node:crypto');
    const originalRandomBytes = crypto.randomBytes;
    const seedBytes = Buffer.alloc(4); seedBytes.writeUInt32BE(2654435761);
    let begun;
    try {
      crypto.randomBytes = (size, ...args) => size === 4 ? Buffer.from(seedBytes) : originalRandomBytes(size, ...args);
      begun = await api('/games/start', { method: 'POST', token,
        body: { roundId, collectionRule: rule, rulesVersion: 2 } });
    } finally { crypto.randomBytes = originalRandomBytes; }
    assert.equal(begun.status, 200);
    assert.equal(begun.payload.data.collectionRule, rule);
    const board = new BoardEngine();
    board.resetBoard(begun.payload.data.seed, begun.payload.data.isTutorial, begun.payload.data.rulesVersion);
    if (board.isTutorialRound()) {
      for (let step = 0; step < 3; step++) {
        const move = board.getTutorialMove(step);
        board.movePiece(move.id, move.offset); board.resolveBoard(); board.finishPlayerAction();
      }
      for (let row = 0; row < 3; row++) board.appendNextRow();
      board.resolveBoard(); board.finishPlayerAction();
    }
    for (let action = 0; action < 100 && board.roundCollectedMoodBeans < 125; action++) {
      const hint = board.findEliminationHint();
      const bomb = board.pieces.find(piece => piece.bomb);
      if (hint) board.movePiece(hint.id, hint.offset);
      else if (bomb) board.detonateBomb(bomb.id);
      else {
        const piece = board.pieces.find(piece => { const range = board.getMoveRange(piece.id); return range.min || range.max; });
        assert.ok(piece);
        const range = board.getMoveRange(piece.id);
        board.movePiece(piece.id, range.min || range.max);
      }
      board.resolveBoard();
      assert.equal(board.appendTurnRows(), true);
      board.resolveBoard();
      while (board.getOccupiedRowCount() < board.getRefillRowTarget() && board.actionAppends < MAX_ACTION_APPENDS) {
        assert.equal(board.appendNextRow(), true); board.resolveBoard();
      }
      board.finishPlayerAction();
    }
    assert.ok(board.roundCollectedMoodBeans >= 125 && board.roundCollectedMoodBeans < 10000);
    clock += 60000;
    const body = { ...settlementBody(roundId, board.roundCollectedMoodBeans, board.score),
      actions: board.roundActions, collectionRule: 'progress_v2', awardedMoodBeans: 99999 };
    const result = await settle(token, body);
    assert.equal(result.status, 200);
    const expected = rule === 'progress_v2' ? Math.floor(board.roundCollectedMoodBeans / 100) : 0;
    assert.equal(result.payload.data.settlement.awardedMoodBeans, expected);
    assert.equal(result.payload.data.settlement.gainedExperience, board.roundCollectedMoodBeans);
    const duplicate = await settle(token, body);
    assert.equal(duplicate.payload.data.duplicate, true);
    assert.equal(duplicate.payload.data.settlement.awardedMoodBeans, expected);
  }
});


test('微信绑定账号不能仅凭deviceId省略登录凭证取回token', async () => {
  const first=await wechatPlayer('protected_bound_device','openid_protected_bound');
  const attempt=await api('/players/bootstrap',{method:'POST',body:{deviceId:'protected_bound_device'}});
  assert.equal(attempt.status,401);assert.equal(attempt.payload.errorCode,'WECHAT_LOGIN_REQUIRED');
  const login=await wechatPlayer('protected_bound_device','openid_protected_bound');
  assert.equal(login.profile.playerId,first.profile.playerId);
});

test('排行榜同分并列名次与self名次一致，不发生列表第二而自己显示第一', async () => {
  const a=await newPlayer(),b=await newPlayer();
  for(const p of [a,b]) await api('/debug/profile',{method:'POST',token:p.token,body:{moodBeanBalance:0,totalMoodBeans:0,highestSingleGameScore:88888}});
  for(const p of [a,b]) {
    const result=await api('/leaderboards?type=power',{token:p.token});
    const data=result.payload.data;
    assert.equal(data.entries.find(e=>e.playerId===p.profile.playerId).rank,data.self.rank);
    assert.equal(data.entries.find(e=>e.playerId===a.profile.playerId).rank,data.entries.find(e=>e.playerId===b.profile.playerId).rank);
  }
});

test('非法JSON主体返回400，不能抛500或更改资产', async () => {
  for(const body of [[],null]) {
    const response=await fetch(`${baseUrl}/v1/cocos-zyx/shop/exchanges`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    assert.equal(response.status,400);
  }
});

test('领取响应丢失后跨北京时间日期重试同ID，不500、不重复发体力且不占新一天次数', async () => {
  const {token}=await newPlayer();const claimId='share_cross_day_retry_1';
  const first=await api('/stamina/share-claim',{method:'POST',token,body:{claimId}});
  assert.equal(first.status,200);assert.equal(first.payload.data.stamina.current,15);
  clock+=24*60*60*1000;
  const retry=await api('/stamina/share-claim',{method:'POST',token,body:{claimId}});
  assert.equal(retry.status,200);assert.equal(retry.payload.data.duplicate,true);
  assert.equal(retry.payload.data.previousDay,true);assert.equal(retry.payload.data.awarded,0);
  assert.equal(retry.payload.data.stamina.current,15);assert.equal(retry.payload.data.stamina.shareAvailableToday,true);
  const today=await api('/stamina/share-claim',{method:'POST',token,body:{claimId:'share_cross_day_new_today'}});
  assert.equal(today.status,200);assert.equal(today.payload.data.stamina.current,20);
});


for (const [version, kind] of [[6, 'balloon'], [7, 'balloon'], [8, 'balloon'], [8, 'clear']]) test(`V${version}/${kind}救场长局通过HTTP结算，漏报出现事件或重复兑换均被拒绝`, async () => {
  const { token } = await newPlayer();
  for (let i = 0; i < 2; i++) {
    const roundId = `rescue_v${version}_${kind}_prepare_${i}`;
    await startRound(token, roundId); clock += 60000;
    assert.equal((await settle(token, settlementBody(roundId, 0, 0))).status, 200);
  }
  const trace = require(`../../scripts/fixtures/board-v${version}-${kind}-replay.json`);
  const roundId = `rescue_v${version}_${kind}_http`;
  const crypto = require('node:crypto'), original = crypto.randomBytes;
  const seed = Buffer.alloc(4); seed.writeUInt32BE(trace.seed);
  const startedAt = clock;
  let begun;
  try {
    crypto.randomBytes = (size, ...args) => size === 4 ? Buffer.from(seed) : original(size, ...args);
    begun = await api('/games/start', {method: 'POST', token,
      body: {roundId, collectionRule: 'progress_v2', rulesVersion: version}});
  } finally { crypto.randomBytes = original; }
  assert.equal(begun.status, 200); assert.equal(begun.payload.data.isTutorial, false);
  clock += Math.max(120000, (trace.elapsedMs || 0) + 1000);
  const body = {...settlementBody(roundId, trace.raw, trace.score), startedAt, actions: trace.actions};
  const missing = await settle(token, {...body, actions: trace.actions.filter(a => !['balloonOffer', 'rescueOffer'].includes(a.type))});
  assert.equal(missing.payload.errorCode, 'REPLAY_INVALID');
  const repeated = trace.actions.flatMap(a => a.type === (kind === 'clear' ? 'rescueClear' : 'balloon') ? [a, a] : [a]);
  assert.equal((await settle(token, {...body, actions: repeated})).payload.errorCode, 'REPLAY_INVALID');
  if (version === 8) {
    const future = trace.actions.map(a => a.type === 'rescueOffer' ? {...a, elapsedMs: clock - startedAt + 1} : a);
    assert.equal((await settle(token, {...body, actions: future})).payload.errorCode, 'REPLAY_INVALID');
    if (kind === 'clear') {
      const early = trace.actions.map(a => a.type === 'rescueOffer' && a.kind === 'clear' ? {...a, elapsedMs: 119999} : a);
      assert.equal((await settle(token, {...body, actions: early})).payload.errorCode, 'REPLAY_INVALID');
    }
  }
  const result = await settle(token, body);
  assert.equal(result.status, 200);
  assert.equal(result.payload.data.settlement.awardedMoodBeans, Math.floor(trace.raw / 100));
  assert.equal(result.payload.data.settlement.gainedExperience, trace.raw);
  assert.equal((await settle(token, body)).payload.data.duplicate, true);
});
