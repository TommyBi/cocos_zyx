/**
 * 云档案与结算接口的集成测试。
 * 使用临时 sqlite 文件与随机端口，不触碰正式 data/game.sqlite。
 * 运行：npm test（server 目录下）
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { start } = require('../src/index.js');

let server;
let baseUrl;

test.before(async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-cloud-test-'));
  const app = await start(path.join(tempDir, 'test.sqlite'));
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise((resolve) => server.close(resolve)));

async function api(apiPath, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}/v1/cocos-zyx${apiPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  return { status: response.status, payload };
}

let deviceSeq = 0;
async function bootstrapPlayer(localProfile) {
  deviceSeq++;
  const { status, payload } = await api('/players/bootstrap', {
    method: 'POST',
    body: {
      deviceId: `test_device_${deviceSeq}`,
      nickname: '测试玩家',
      avatarUrl: '',
      localProfile,
    },
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(payload.code, 0);
  return payload.data;
}

function settlementBody(overrides = {}) {
  const endedAt = Date.now();
  return {
    roundId: `round_test_${Math.random().toString(36).slice(2)}`,
    startedAt: endedAt - 60 * 1000,
    endedAt,
    score: 500,
    moodCount: 70,
    ...overrides,
  };
}

test('bootstrap 使用本地进度建档，重复 bootstrap 不被零值覆盖', async () => {
  const first = await bootstrapPlayer({
    level: 3,
    experience: 40,
    happyBottleBalance: 2,
    happyBottleProgress: 10,
    totalHappyBottles: 5,
    highestSingleGameScore: 1200,
  });
  assert.ok(first.token);
  assert.strictEqual(first.profile.level, 3);
  assert.strictEqual(first.profile.experience, 40);
  assert.strictEqual(first.profile.happyBottleBalance, 2);
  assert.strictEqual(first.profile.happyBottleProgress, 10);
  assert.strictEqual(first.profile.happyBottleTarget, 66);
  assert.strictEqual(first.profile.totalHappyBottles, 5);
  assert.strictEqual(first.profile.highestSingleGameScore, 1200);

  // 同一设备再次 bootstrap：即使本地进度丢失传了零值，云档案也必须保持原值。
  deviceSeq--; // 复用同一 deviceId
  const second = await bootstrapPlayer({
    level: 1,
    experience: 0,
    happyBottleBalance: 0,
    happyBottleProgress: 0,
    totalHappyBottles: 0,
    highestSingleGameScore: 0,
  });
  assert.strictEqual(second.profile.happyBottleBalance, 2);
  assert.strictEqual(second.profile.happyBottleProgress, 10);
  assert.strictEqual(second.profile.highestSingleGameScore, 1200);
});

test('结算累积开心瓶并写入周榜', async () => {
  const { token } = await bootstrapPlayer({});
  const { status, payload } = await api('/games/settlements', {
    method: 'POST',
    token,
    body: settlementBody({ score: 500, moodCount: 70 }),
  });
  assert.strictEqual(status, 200);
  const settlement = payload.data.settlement;
  assert.strictEqual(settlement.completedHappyBottles, 1);
  assert.strictEqual(settlement.profile.happyBottleBalance, 1);
  assert.strictEqual(settlement.profile.happyBottleProgress, 70 % 66);
  assert.strictEqual(settlement.profile.highestSingleGameScore, 500);
  assert.strictEqual(settlement.profile.gameCount, 1);

  const board = await api('/leaderboards?type=power', { token });
  assert.strictEqual(board.status, 200);
  assert.strictEqual(board.payload.data.self.value, 500);
});

test('相同 roundId 重复结算幂等，不重复发奖励', async () => {
  const { token } = await bootstrapPlayer({});
  const body = settlementBody({ score: 300, moodCount: 66 });
  const first = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(first.status, 200);
  assert.strictEqual(first.payload.data.settlement.profile.happyBottleBalance, 1);

  const second = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(second.status, 200);
  assert.strictEqual(second.payload.data.duplicate, true);
  assert.strictEqual(second.payload.data.profile.happyBottleBalance, 1);
  assert.strictEqual(second.payload.data.profile.gameCount, 1);
});

test('非法时长的结算被拒绝且不占用 roundId，修正后可重新提交', async () => {
  const { token } = await bootstrapPlayer({});
  const body = settlementBody({ startedAt: Date.now() - 1000 }); // 时长不足 5 秒
  const rejected = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(rejected.status, 400);

  const fixed = await api('/games/settlements', {
    method: 'POST',
    token,
    body: { ...body, startedAt: body.endedAt - 30 * 1000 },
  });
  assert.strictEqual(fixed.status, 200);
  assert.strictEqual(fixed.payload.data.accepted, true);
});

test('拼图解锁扣瓶与记录同事务，重复解锁幂等', async () => {
  const { token } = await bootstrapPlayer({ happyBottleBalance: 2, totalHappyBottles: 2 });
  const body = { puzzlePieceId: 'album:album_season', cost: 1 };
  const first = await api('/puzzles/pieces/unlock', { method: 'POST', token, body });
  assert.strictEqual(first.status, 200);
  assert.strictEqual(first.payload.data.profile.happyBottleBalance, 1);

  const second = await api('/puzzles/pieces/unlock', { method: 'POST', token, body });
  assert.strictEqual(second.status, 200);
  assert.strictEqual(second.payload.data.duplicate, true);
  assert.strictEqual(second.payload.data.profile.happyBottleBalance, 1);

  const unlocks = await api('/puzzles/unlocks', { token });
  assert.deepStrictEqual(unlocks.payload.data.pieces, ['album:album_season']);
});
