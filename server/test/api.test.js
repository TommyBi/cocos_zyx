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
  assert.match(boot.profile.nickname, /^(美丽的|快乐的|勇敢的|温柔的|机灵的|幸运的|恬静的|活泼的|善良的|可爱的)(狐狸|天鹅|小熊|猫咪|兔子|企鹅|小鹿|松鼠|熊猫|海豚|柴犬|考拉)$/);
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
