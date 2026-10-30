/** 关键经济事务必须先落盘再返回成功；重试不得重复扣体力或发币。 */
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

test.before(async () => {
  realDateNow = Date.now;
  clock = Date.parse('2026-10-28T10:00:00.000Z');
  Date.now = () => clock;
  const dbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-persist-fault-'));
  dbFilePath = path.join(dbDir, 'fault.sqlite');
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
  return { status: response.status, payload: await response.json() };
}

async function bootstrap(deviceId) {
  const result = await api('/players/bootstrap', {
    method: 'POST',
    body: { deviceId, nickname: '故障注入玩家', avatarUrl: '' },
  });
  assert.equal(result.status, 200);
  return result.payload.data;
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

/** 只让数据库原子写盘的临时文件打开失败，避免依赖 chmod / 操作系统权限。 */
async function withPersistFailure(fn) {
  const realOpenSync = fs.openSync;
  fs.openSync = (target, ...args) => {
    if (String(target) === `${dbFilePath}.tmp`) throw new Error('injected persist failure');
    return realOpenSync(target, ...args);
  };
  try { return await fn(); } finally { fs.openSync = realOpenSync; }
}

test('开局写盘失败后重试同一 roundId，只扣一次体力', async () => {
  const { token, profile } = await bootstrap('fault_start_device');
  assert.equal(profile.stamina.current, 30);
  const body = { roundId: 'fault_start_round' };
  await withPersistFailure(async () => {
    const first = await api('/games/start', { method: 'POST', token, body });
    assert.equal(first.status, 500);
    const roundsOnDisk = await readDisk('SELECT round_id FROM game_rounds WHERE round_id = ?', [body.roundId]);
    assert.equal(roundsOnDisk.length, 0);
  });
  const retry = await api('/games/start', { method: 'POST', token, body });
  assert.equal(retry.status, 200);
  assert.equal(retry.payload.data.duplicate, true);
  assert.equal(retry.payload.data.stamina.current, 29);
  const onDisk = await readDisk('SELECT stamina_current FROM players WHERE device_id = ?', ['fault_start_device']);
  assert.equal(onDisk[0].stamina_current, 29);
  const roundsOnDisk = await readDisk('SELECT round_id FROM game_rounds WHERE round_id = ?', [body.roundId]);
  assert.equal(roundsOnDisk.length, 1);
});

test('结算写盘失败后重试同一 roundId，只发一次开心豆', async () => {
  const { token } = await bootstrap('fault_settle_device');
  const roundId = 'fault_settle_round';
  const startResult = await api('/games/start', { method: 'POST', token, body: { roundId } });
  assert.equal(startResult.status, 200);
  clock += 10 * 1000;
  const body = {
    roundId,
    startedAt: clock - 60 * 1000,
    endedAt: clock,
    score: 150,
    collectedMoodBeanCount: 15,
  };
  await withPersistFailure(async () => {
    const first = await api('/games/settlements', { method: 'POST', token, body });
    assert.equal(first.status, 500);
    const rows = await readDisk('SELECT round_id FROM round_settlements WHERE round_id = ?', [roundId]);
    assert.equal(rows.length, 0);
  });
  const retry = await api('/games/settlements', { method: 'POST', token, body });
  assert.equal(retry.status, 200);
  assert.equal(retry.payload.data.duplicate, true);
  assert.equal(retry.payload.data.settlement.awardedMoodBeans, 15);
  const rows = await readDisk('SELECT awarded_mood_beans FROM round_settlements WHERE round_id = ?', [roundId]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].awarded_mood_beans, 15);
  const balance = await readDisk('SELECT mood_bean_balance FROM players WHERE device_id = ?', ['fault_settle_device']);
  assert.equal(balance[0].mood_bean_balance, 15);
});

test('分享领取写盘失败后重试同一 claimId，只补一次体力', async () => {
  const { token } = await bootstrap('fault_share_device');
  for (let index = 0; index < 30; index++) {
    const startResult = await api('/games/start', { method: 'POST', token, body: { roundId: `fault_share_round_${index}` } });
    assert.equal(startResult.status, 200);
  }
  const body = { claimId: 'share_fault_claim_001' };
  await withPersistFailure(async () => {
    const first = await api('/stamina/share-claim', { method: 'POST', token, body });
    assert.equal(first.status, 500);
    const rows = await readDisk('SELECT claim_id FROM stamina_share_claims WHERE claim_id = ?', [body.claimId]);
    assert.equal(rows.length, 0);
  });
  const retry = await api('/stamina/share-claim', { method: 'POST', token, body });
  assert.equal(retry.status, 200);
  assert.equal(retry.payload.data.duplicate, true);
  assert.equal(retry.payload.data.stamina.current, 5);
  const claims = await readDisk('SELECT claim_id FROM stamina_share_claims WHERE claim_id = ?', [body.claimId]);
  assert.equal(claims.length, 1);
  const onDisk = await readDisk('SELECT stamina_current FROM players WHERE device_id = ?', ['fault_share_device']);
  assert.equal(onDisk[0].stamina_current, 5);
});
