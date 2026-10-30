/** 服务端体力、结算幂等与秘境下线集成测试。只使用临时数据库。 */
process.env.ENABLE_GM_ROUTES = '1';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const initSqlJs = require('sql.js');
const { start } = require('../src/index.js');

let server;
let baseUrl;
let dbFilePath;
let clock;
let realDateNow;
let playerSeq = 0;
let roundSeq = 0;

test.before(async () => {
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

test('新账号体力为 30，客户端伪造余额被忽略', async () => {
  const boot = await newPlayer();
  assert.equal(boot.profile.moodBeanBalance, 0);
  assert.equal(boot.profile.stamina.current, 30);
  assert.equal(boot.profile.stamina.max, 30);
  assert.equal(boot.profile.stamina.regenSeconds, 600);
  assert.equal(boot.profile.stamina.nextRecoveryAt, null);
});

test('开局只扣一次体力；无服务端入局凭证的结算不能发币', async () => {
  const { token } = await newPlayer();
  const first = await startRound(token, 'round_idempotent');
  assert.equal(first.status, 200);
  assert.equal(first.payload.data.stamina.current, 29);
  assert.equal(first.payload.data.stamina.nextRecoveryAt, new Date(clock + 600000).toISOString());
  const retry = await startRound(token, 'round_idempotent');
  assert.equal(retry.status, 200);
  assert.equal(retry.payload.data.duplicate, true);
  assert.equal(retry.payload.data.stamina.current, 29);
  clock += 10 * 1000;
  const forged = await settle(token, settlementBody('round_without_ticket', 5000));
  assert.equal(forged.status, 409);
  assert.equal(forged.payload.errorCode, 'ROUND_NOT_STARTED');
  const profile = await bootstrap('test_device_2');
  assert.equal(profile.profile.moodBeanBalance, 0);
});

test('体力用尽后 10 分钟恢复 1 点，余额与冷却使用服务端时钟', async () => {
  const { token } = await newPlayer();
  for (let index = 0; index < 30; index++) {
    const result = await startRound(token, `drain_${index}`);
    assert.equal(result.status, 200);
  }
  const blocked = await startRound(token, 'drain_blocked');
  assert.equal(blocked.status, 429);
  assert.equal(blocked.payload.errorCode, 'STAMINA_EMPTY');
  assert.equal(blocked.payload.data.stamina.current, 0);
  clock += 10 * 60 * 1000;
  const recovered = await startRound(token, 'after_recovery');
  assert.equal(recovered.status, 200);
  assert.equal(recovered.payload.data.stamina.current, 0);
  const retry = await startRound(token, 'after_recovery');
  assert.equal(retry.payload.data.duplicate, true);
  assert.equal(retry.payload.data.stamina.current, 0);
});

test('分享补体力每天一次、上限 30 点，重复请求不重复加点', async () => {
  const { token } = await newPlayer();
  const early = await api('/stamina/share-claim', { method: 'POST', token, body: { claimId: 'share_too_early_001' } });
  assert.equal(early.status, 409);
  assert.equal(early.payload.errorCode, 'STAMINA_FULL');
  for (let index = 0; index < 30; index++) {
    const round = await startRound(token, `share_drain_${index}`);
    assert.equal(round.status, 200);
  }
  // 分享面板停留期间可能自然恢复 1 点，已发起的分享仍应兑现奖励。
  clock += 10 * 60 * 1000;
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
  assert.equal(power.payload.data.type, 'power');
  assert.equal(power.payload.data.self.value, 600);
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
