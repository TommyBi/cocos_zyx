/**
 * 落盘故障注入测试（A-Review-返工-1 修复一）。
 *
 * 验证：关键经济事务在 COMMIT 到 sql.js 内存后，如果写盘失败，
 * 接口必须返回 500 且保留“未持久化”状态；使用相同 roundId/actionId 重试时
 * 不得直接返回内存结果，只有数据库文件实际包含该记录后才能返回 200，
 * 且经济扣减/奖励不得重复执行。
 *
 * 故障注入方式：把数据库所在目录 chmod 为只读（0o555），
 * 原子落盘的临时文件创建会失败；恢复 0o755 后写盘恢复。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const initSqlJs = require('sql.js');

const { start } = require('../src/index.js');

let server;
let baseUrl;
let dbDir;
let dbFilePath;

test.before(async () => {
  dbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-persist-fault-'));
  dbFilePath = path.join(dbDir, 'fault.sqlite');
  const app = await start(dbFilePath);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise((resolve) => {
  fs.chmodSync(dbDir, 0o755);
  server.close(resolve);
}));

async function api(apiPath, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}/v1/cocos-zyx${apiPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (_e) {
    payload = { raw: text };
  }
  return { status: response.status, payload };
}

/** 用全新的数据库实例直接读取落盘文件，不走服务进程内存。 */
async function readDisk(sql, params = []) {
  if (!fs.existsSync(dbFilePath)) return [];
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

async function bootstrap(deviceId) {
  return api('/players/bootstrap', {
    method: 'POST',
    body: { deviceId, nickname: '故障注入玩家', avatarUrl: '' },
  });
}

test('结算：写盘失败返回 500；同 roundId 重试只在真正落盘后返回 200 且只奖励一次', async () => {
  const boot = await bootstrap('fault_settle_device');
  assert.strictEqual(boot.status, 200);
  const token = boot.payload.data.token;

  const startedAt = Date.now() - 120000;
  const endedAt = Date.now();
  const roundId = `round_${startedAt}_150_15`;
  const body = {
    roundId,
    startedAt,
    endedAt,
    score: 150,
    collectedMoodBeanCount: 15,
    totalClears: 9,
    maxChain: 1,
    placedPieces: 5,
  };

  // 1. 数据库目录只读 → 结算应返回 500。
  fs.chmodSync(dbDir, 0o555);
  const first = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(first.status, 500, '写盘失败必须返回 500');

  // 2. 磁盘文件不含该结算记录。
  const rowsAfterFailure = await readDisk(
    'SELECT round_id, awarded_mood_beans FROM round_settlements WHERE round_id = ?',
    [roundId],
  );
  assert.strictEqual(rowsAfterFailure.length, 0, '写盘失败时数据库文件不得包含该记录');

  // 3. 恢复目录可写。
  fs.chmodSync(dbDir, 0o755);

  // 4. 用相同 roundId 重试：不得直接返回内存结果，必须先落盘成功后返回 200。
  const retry = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(retry.status, 200, '落盘恢复后重试应成功');
  assert.strictEqual(retry.payload.data.duplicate, true, '内存中已有事务，标记为幂等重放');

  // 5. 数据库文件确实包含该记录，且只奖励一次。
  const rowsAfterRetry = await readDisk(
    'SELECT round_id, awarded_mood_beans FROM round_settlements WHERE round_id = ?',
    [roundId],
  );
  assert.strictEqual(rowsAfterRetry.length, 1, '重试成功后落盘文件必须包含该记录');
  assert.strictEqual(rowsAfterRetry[0].awarded_mood_beans, 15, '奖励按规则只发放一次（一块一豆）');

  // 6. 服务端账户余额只反映一次奖励。
  const state = await api('/realm/state', { token });
  assert.strictEqual(state.status, 200);
  assert.strictEqual(state.payload.data.moodBeanBalance, 15, '余额只增加一次');

  // 7. 再次重放：此时已真正落盘，仍应返回 200 且余额不变。
  const replay = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(replay.status, 200);
  assert.strictEqual(replay.payload.data.duplicate, true);
  const stateAfterReplay = await api('/realm/state', { token });
  assert.strictEqual(stateAfterReplay.payload.data.moodBeanBalance, 15, '重放不得重复发放奖励');
});

test('拼画：写盘失败返回 500；同 actionId 重试只在真正落盘后返回 200 且只扣一次', async () => {
  // 先正常结算一局，给玩家提供足够的豆用于拼画（一块一豆：200 豆）。
  const boot = await bootstrap('fault_contribute_device');
  const token = boot.payload.data.token;
  const settleStart = Date.now() - 120000;
  const settleEnd = Date.now();
  await api('/games/settlements', {
    method: 'POST',
    token,
    body: {
      roundId: `round_${settleStart}_2000_200`,
      startedAt: settleStart,
      endedAt: settleEnd,
      score: 2000,
      collectedMoodBeanCount: 200,
      totalClears: 30,
      maxChain: 2,
      placedPieces: 8,
    },
  });

  const actionId = `art_${settleEnd}_50`;
  const contributeBody = { artId: 'album_season_art_0', requestedBeans: 50 };

  // 1. 目录只读 → 拼画应返回 500。
  fs.chmodSync(dbDir, 0o555);
  const first = await api('/realm/arts/contribute', { method: 'POST', token, body: { actionId, ...contributeBody } });
  assert.strictEqual(first.status, 500, '写盘失败必须返回 500');

  // 2. 磁盘无该 action 记录。
  const rowsAfterFailure = await readDisk(
    'SELECT action_id, result_json FROM official_art_actions WHERE action_id = ?',
    [actionId],
  );
  assert.strictEqual(rowsAfterFailure.length, 0, '写盘失败时数据库文件不得包含该拼画记录');

  // 3. 恢复可写。
  fs.chmodSync(dbDir, 0o755);

  // 4. 同 actionId 重试：必须先落盘成功后返回 200。
  const retry = await api('/realm/arts/contribute', { method: 'POST', token, body: { actionId, ...contributeBody } });
  assert.strictEqual(retry.status, 200, '落盘恢复后重试应成功');
  assert.strictEqual(retry.payload.data.duplicate, true, '内存中已有事务，标记为幂等重放');

  // 5. 磁盘包含该记录，且只扣一次。
  const rowsAfterRetry = await readDisk(
    'SELECT action_id, result_json FROM official_art_actions WHERE action_id = ?',
    [actionId],
  );
  assert.strictEqual(rowsAfterRetry.length, 1, '重试成功后落盘文件必须包含该记录');
  const result = JSON.parse(rowsAfterRetry[0].result_json);
  assert.strictEqual(result.filledCells, 50, '投入只生效一次');

  const state = await api('/realm/state', { token });
  // 200 豆奖励；投入 50 一次后应为 150。
  assert.strictEqual(state.payload.data.moodBeanBalance, 150, '开心豆只扣除一次');
});

test('新玩家建档：写盘失败返回 500；同 deviceId 重试只在真正落盘后返回 200', async () => {
  // 全新设备，目录只读 → 建档应返回 500。
  fs.chmodSync(dbDir, 0o555);
  const deviceId = `fault_bootstrap_${Date.now()}`;
  const first = await bootstrap(deviceId);
  assert.strictEqual(first.status, 500, '建档写盘失败必须返回 500');

  // 磁盘无该玩家。
  const playersAfterFailure = await readDisk(
    'SELECT device_id, mood_bean_balance, level FROM players WHERE device_id = ?',
    [deviceId],
  );
  assert.strictEqual(playersAfterFailure.length, 0, '写盘失败时数据库文件不得包含该玩家');

  // 恢复可写。
  fs.chmodSync(dbDir, 0o755);

  // 同 deviceId 重试：必须先落盘成功后返回 200。
  const retry = await bootstrap(deviceId);
  assert.strictEqual(retry.status, 200, '落盘恢复后建档重试应成功');

  const playersAfterRetry = await readDisk(
    'SELECT device_id, mood_bean_balance, level FROM players WHERE device_id = ?',
    [deviceId],
  );
  assert.strictEqual(playersAfterRetry.length, 1, '重试成功后落盘文件必须包含该玩家');
  assert.strictEqual(playersAfterRetry[0].mood_bean_balance, 0, '新玩家一律 0 豆');
  assert.strictEqual(playersAfterRetry[0].level, 1, '新玩家一律 Lv.1');
});
