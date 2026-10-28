/**
 * 云档案、心情豆结算与官方拼画接口的集成测试。
 * 使用临时 sqlite 文件与随机端口，不触碰正式 data/game.sqlite。
 * 运行：npm test（server 目录下）
 */
// 本文件依赖 GM 调试路由：非生产环境且显式启用时才注册，必须在加载服务前设置。
process.env.ENABLE_GM_ROUTES = '1';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const initSqlJs = require('sql.js');

const { start } = require('../src/index.js');
const economy = require('../src/economyConfig');

let server;
let baseUrl;
let dbFilePath;

test.before(async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-cloud-test-'));
  dbFilePath = path.join(tempDir, 'test.sqlite');
  const app = await start(dbFilePath);
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
    collectedMoodBeanCount: 70,
    ...overrides,
  };
}

let actionSeq = 0;
function contributeBody(overrides = {}) {
  actionSeq++;
  return {
    actionId: `action_test_${Date.now()}_${actionSeq}`,
    artId: 'album_season_art_0',
    requestedBeans: 500,
    ...overrides,
  };
}

async function settleRound(token, overrides = {}) {
  const { status, payload } = await api('/games/settlements', {
    method: 'POST',
    token,
    body: settlementBody(overrides),
  });
  assert.strictEqual(status, 200);
  return payload.data;
}

async function contribute(token, overrides = {}) {
  return await api('/realm/arts/contribute', {
    method: 'POST',
    token,
    body: contributeBody(overrides),
  });
}

test('新账号永远从零资产建档，伪造的 localProfile 被完全忽略', async () => {
  const first = await bootstrapPlayer({
    level: 1000,
    experience: 99999999,
    moodBeanBalance: 100000000,
    totalMoodBeans: 100000000,
    highestSingleGameScore: 100000000,
  });
  assert.ok(first.token);
  assert.strictEqual(first.profile.level, 1);
  assert.strictEqual(first.profile.experience, 0);
  assert.strictEqual(first.profile.moodBeanBalance, 0);
  assert.strictEqual(first.profile.totalMoodBeans, 0);
  assert.strictEqual(first.profile.highestSingleGameScore, 0);
  assert.ok(!('happyBottleBalance' in first.profile));
  assert.ok(!('happyBottleProgress' in first.profile));

  // 结算入账后再次 bootstrap：客户端伪造的大值不得覆盖服务端权威档案。
  await settleRound(first.token, { collectedMoodBeanCount: 70 });
  deviceSeq--; // 复用同一 deviceId
  const second = await bootstrapPlayer({
    level: 999,
    experience: 88888888,
    moodBeanBalance: 77777777,
    totalMoodBeans: 77777777,
    highestSingleGameScore: 66666666,
  });
  assert.strictEqual(second.profile.level, 4); // 70 经验按曲线升到 4 级
  assert.strictEqual(second.profile.moodBeanBalance, 70);
  assert.strictEqual(second.profile.totalMoodBeans, 70);
  assert.strictEqual(second.profile.highestSingleGameScore, 500);
});

test('结算由服务端计算心情豆，忽略客户端伪造的奖励值并写入周榜', async () => {
  const { token } = await bootstrapPlayer({});
  const data = await settleRound(token, {
    score: 500,
    collectedMoodBeanCount: 70,
    // 伪造字段：服务端不得采信任何客户端提交的奖励或余额。
    awardedMoodBeans: 99999,
    verifiedBonusMoodBeans: 500,
    moodBeanBalance: 8888,
  });
  const settlement = data.settlement;
  assert.strictEqual(settlement.baseMoodBeans, 70);
  assert.strictEqual(settlement.bonusMoodBeans, 0);
  assert.strictEqual(settlement.awardedMoodBeans, 70);
  assert.strictEqual(settlement.gainedExperience, 70);
  assert.strictEqual(settlement.profile.moodBeanBalance, 70);
  assert.strictEqual(settlement.profile.totalMoodBeans, 70);
  assert.strictEqual(settlement.profile.highestSingleGameScore, 500);
  assert.strictEqual(settlement.profile.gameCount, 1);

  const board = await api('/leaderboards?type=happiness', { token });
  assert.strictEqual(board.status, 200);
  assert.strictEqual(board.payload.data.self.value, 70);
});

test('相同 roundId 重复结算幂等，不重复发放心情豆和经验', async () => {
  const { token } = await bootstrapPlayer({});
  const body = settlementBody({ score: 300, collectedMoodBeanCount: 66 });
  const first = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(first.status, 200);
  assert.strictEqual(first.payload.data.settlement.profile.moodBeanBalance, 66);
  const experienceAfterFirst = first.payload.data.settlement.profile.experience;

  const second = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(second.status, 200);
  assert.strictEqual(second.payload.data.duplicate, true);
  assert.strictEqual(second.payload.data.settlement.profile.moodBeanBalance, 66);
  assert.strictEqual(second.payload.data.settlement.profile.experience, experienceAfterFirst);
  assert.strictEqual(second.payload.data.settlement.profile.gameCount, 1);
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

test('秘境状态：新账号从第一册第一幅 0 豆位开始，第二册按等级开放', async () => {
  const { token } = await bootstrapPlayer({});
  const state = await api('/realm/state', { token });
  assert.strictEqual(state.status, 200);
  const realm = state.payload.data;
  assert.strictEqual(realm.moodBeanBalance, 0);
  assert.strictEqual(realm.totalCells, 20280);
  assert.strictEqual(realm.albums.length, 2);
  assert.strictEqual(realm.albums[0].opened, true);
  assert.strictEqual(realm.albums[1].opened, false); // 需要 5 级
  assert.strictEqual(realm.albums[0].arts.length, 48);
  assert.strictEqual(realm.albums[0].arts[0].available, true);
  assert.strictEqual(realm.albums[0].arts[0].filledCells, 0);
  assert.strictEqual(realm.albums[0].arts[1].available, false);
});

test('官方拼画：余额 1000 请求 500 时余额和进度各变化 500', async () => {
  const { token } = await bootstrapPlayer({});
  await settleRound(token, { collectedMoodBeanCount: 1000 });
  const result = await contribute(token, { requestedBeans: 500 });
  assert.strictEqual(result.status, 200);
  const data = result.payload.data;
  assert.strictEqual(data.actualSpend, 500);
  assert.strictEqual(data.moodBeanBalance, 500);
  assert.strictEqual(data.filledCells, 500);
  assert.strictEqual(data.completed, false);
});

test('官方拼画：余额 100 请求 500 时实际只投入 100，余额不为负', async () => {
  const { token } = await bootstrapPlayer({});
  await settleRound(token, { collectedMoodBeanCount: 100 });
  const result = await contribute(token, { requestedBeans: 500 });
  assert.strictEqual(result.status, 200);
  const data = result.payload.data;
  assert.strictEqual(data.actualSpend, 100);
  assert.strictEqual(data.moodBeanBalance, 0);
  assert.strictEqual(data.filledCells, 100);
  assert.ok(data.moodBeanBalance >= 0);
});

test('官方拼画：剩余 20 豆位时只投入 20 并完成，进度不超过 20280', async () => {
  const { token } = await bootstrapPlayer({});
  await settleRound(token, { collectedMoodBeanCount: 3000 });
  const first = await contribute(token, { requestedBeans: 5000 });
  assert.strictEqual(first.payload.data.actualSpend, 3000); // 余额裁剪
  // 通过 GM 直接补足余额，再分次投到剩余 20
  await api('/debug/profile', { method: 'POST', token, body: { moodBeanBalance: 50000, totalMoodBeans: 50000 } });
  for (let index = 0; index < 3; index++) {
    const result = await contribute(token, { requestedBeans: 5000 });
    assert.strictEqual(result.payload.data.actualSpend, 5000);
  }
  // 已投入 3000 + 15000 = 18000，再投 5000 裁剪为 2280 完成
  const final = await contribute(token, { requestedBeans: 5000 });
  assert.strictEqual(final.payload.data.actualSpend, economy.ART_TOTAL_CELLS - 18000);
  assert.strictEqual(final.payload.data.filledCells, economy.ART_TOTAL_CELLS);
  assert.strictEqual(final.payload.data.completed, true);
  assert.ok(final.payload.data.completedAt);

  // 完成后重复投入不扣豆
  const again = await contribute(token, { requestedBeans: 500 });
  assert.strictEqual(again.status, 200);
  assert.strictEqual(again.payload.data.actualSpend, 0);
  assert.strictEqual(again.payload.data.alreadyCompleted, true);
  assert.strictEqual(again.payload.data.moodBeanBalance, 50000 - 3 * 5000 - (economy.ART_TOTAL_CELLS - 18000));
});

test('官方拼画：单次放置投入全部余额完成整幅画作，无 5000 批次上限', async () => {
  const { token } = await bootstrapPlayer({});
  // GM 直接补足 30000 豆（超过旧 5000 批次上限）。
  await api('/debug/profile', { method: 'POST', token, body: { moodBeanBalance: 30000, totalMoodBeans: 30000 } });
  const result = await contribute(token, { requestedBeans: 30000 });
  assert.strictEqual(result.status, 200);
  const data = result.payload.data;
  // 单次请求裁剪上限 = 一整幅画作豆位数，直接完成整幅。
  assert.strictEqual(data.actualSpend, economy.ART_TOTAL_CELLS);
  assert.strictEqual(data.filledCells, economy.ART_TOTAL_CELLS);
  assert.strictEqual(data.completed, true);
  assert.strictEqual(data.moodBeanBalance, 30000 - economy.ART_TOTAL_CELLS);
});

test('官方拼画：重复 actionId 不重复扣豆', async () => {
  const { token } = await bootstrapPlayer({});
  await settleRound(token, { collectedMoodBeanCount: 1000 });
  const body = contributeBody({ requestedBeans: 500 });
  const first = await api('/realm/arts/contribute', { method: 'POST', token, body });
  assert.strictEqual(first.status, 200);
  assert.strictEqual(first.payload.data.actualSpend, 500);

  const second = await api('/realm/arts/contribute', { method: 'POST', token, body });
  assert.strictEqual(second.status, 200);
  assert.strictEqual(second.payload.data.duplicate, true);
  assert.strictEqual(second.payload.data.actualSpend, 500);
  assert.strictEqual(second.payload.data.moodBeanBalance, 500);
  assert.strictEqual(second.payload.data.filledCells, 500);
});

test('官方拼画：未完成的后续画作不可投入，非法画作被拒绝', async () => {
  const { token } = await bootstrapPlayer({});
  await settleRound(token, { collectedMoodBeanCount: 1000 });
  const locked = await contribute(token, { artId: 'album_season_art_1', requestedBeans: 100 });
  assert.strictEqual(locked.status, 409);

  const unknown = await contribute(token, { artId: 'album_nowhere_art_0', requestedBeans: 100 });
  assert.strictEqual(unknown.status, 400);

  // 等级不足时第二册未开放（该玩家未结算，仍是 1 级）。
  const lowLevel = await bootstrapPlayer({});
  const secondAlbum = await contribute(lowLevel.token, { artId: 'album_city_art_0', requestedBeans: 100 });
  assert.strictEqual(secondAlbum.status, 409);
});

test('官方拼画：第一幅完成后第二幅立即可投入', async () => {
  const { token } = await bootstrapPlayer({});
  await settleRound(token, { collectedMoodBeanCount: 4000 });
  await api('/debug/profile', { method: 'POST', token, body: { moodBeanBalance: 60000, totalMoodBeans: 60000 } });
  for (let index = 0; index < 5; index++) {
    await contribute(token, { requestedBeans: 5000 });
  }
  const state = await api('/realm/state', { token });
  const arts = state.payload.data.albums[0].arts;
  assert.strictEqual(arts[0].filledCells, economy.ART_TOTAL_CELLS);
  assert.strictEqual(arts[0].available, false); // 已完成
  assert.strictEqual(arts[1].available, true);

  const next = await contribute(token, { artId: 'album_season_art_1', requestedBeans: 300 });
  assert.strictEqual(next.status, 200);
  assert.strictEqual(next.payload.data.filledCells, 300);
});

test('离线补传窗口：7 天内的对局接受补传，超过 7 天明确拒绝', async () => {
  const { token } = await bootstrapPlayer({});
  const dayMs = 24 * 60 * 60 * 1000;
  // 6.5 天前结束的真实离线对局：不再被“6 小时前开始即拒绝”的旧规则误杀。
  const recentOfflineEnd = Date.now() - 6.5 * dayMs;
  const recent = await api('/games/settlements', {
    method: 'POST',
    token,
    body: settlementBody({ startedAt: recentOfflineEnd - 60 * 1000, endedAt: recentOfflineEnd }),
  });
  assert.strictEqual(recent.status, 200);
  assert.strictEqual(recent.payload.data.settlement.awardedMoodBeans, 70);

  // 超过 7 天的异常积压被永久拒绝，客户端按不可重试错误隔离。
  const staleOfflineEnd = Date.now() - 8 * dayMs;
  const stale = await api('/games/settlements', {
    method: 'POST',
    token,
    body: settlementBody({ startedAt: staleOfflineEnd - 60 * 1000, endedAt: staleOfflineEnd }),
  });
  assert.strictEqual(stale.status, 400);
});

test('幂等按玩家隔离：两名玩家使用相同 roundId 各自正常结算', async () => {
  const playerA = await bootstrapPlayer({});
  const playerB = await bootstrapPlayer({});
  const roundId = `round_shared_${Date.now()}`;
  const bodyA = settlementBody({ roundId, score: 500, collectedMoodBeanCount: 70 });
  const firstA = await api('/games/settlements', { method: 'POST', token: playerA.token, body: bodyA });
  assert.strictEqual(firstA.status, 200);
  assert.strictEqual(firstA.payload.data.settlement.profile.moodBeanBalance, 70);

  // 玩家 B 用相同 roundId 提交自己的对局：不得命中玩家 A 的记录。
  const bodyB = settlementBody({ roundId, score: 300, collectedMoodBeanCount: 40 });
  const firstB = await api('/games/settlements', { method: 'POST', token: playerB.token, body: bodyB });
  assert.strictEqual(firstB.status, 200);
  assert.strictEqual(firstB.payload.data.duplicate, undefined);
  assert.strictEqual(firstB.payload.data.settlement.awardedMoodBeans, 40);
  assert.strictEqual(firstB.payload.data.settlement.profile.moodBeanBalance, 40);
});

test('同一玩家用相同 roundId 提交不同载荷返回 409，不改变任何数据', async () => {
  const { token } = await bootstrapPlayer({});
  const body = settlementBody({ score: 500, collectedMoodBeanCount: 70 });
  const first = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(first.status, 200);

  const conflict = await api('/games/settlements', {
    method: 'POST',
    token,
    body: { ...body, collectedMoodBeanCount: 71 },
  });
  assert.strictEqual(conflict.status, 409);

  // 冲突请求不得产生第二次入账。
  const state = await api('/realm/state', { token });
  assert.strictEqual(state.payload.data.moodBeanBalance, 70);
});

test('同一玩家用相同 roundId 和相同载荷重试，只结算一次并返回相同结果', async () => {
  const { token } = await bootstrapPlayer({});
  const body = settlementBody({ score: 300, collectedMoodBeanCount: 66 });
  const first = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(first.status, 200);
  const second = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(second.status, 200);
  assert.strictEqual(second.payload.data.duplicate, true);
  assert.strictEqual(second.payload.data.settlement.awardedMoodBeans, first.payload.data.settlement.awardedMoodBeans);
  assert.strictEqual(second.payload.data.settlement.profile.moodBeanBalance, 66);
  assert.strictEqual(second.payload.data.settlement.profile.gameCount, 1);
});

test('拼画幂等按玩家隔离：两名玩家使用相同 actionId 互不影响', async () => {
  const playerA = await bootstrapPlayer({});
  const playerB = await bootstrapPlayer({});
  await settleRound(playerA.token, { collectedMoodBeanCount: 1000 });
  await settleRound(playerB.token, { collectedMoodBeanCount: 800 });
  const actionId = `action_shared_${Date.now()}`;
  const firstA = await contribute(playerA.token, { actionId, requestedBeans: 500 });
  assert.strictEqual(firstA.status, 200);
  assert.strictEqual(firstA.payload.data.actualSpend, 500);

  // 玩家 B 使用相同 actionId：不得读取玩家 A 保存的结果。
  const firstB = await contribute(playerB.token, { actionId, requestedBeans: 300 });
  assert.strictEqual(firstB.status, 200);
  assert.strictEqual(firstB.payload.data.duplicate, undefined);
  assert.strictEqual(firstB.payload.data.actualSpend, 300);
  assert.strictEqual(firstB.payload.data.moodBeanBalance, 500);
});

test('同一玩家用相同 actionId 改变画作或投入量返回 409，不执行扣减', async () => {
  const { token } = await bootstrapPlayer({});
  await settleRound(token, { collectedMoodBeanCount: 1000 });
  const body = contributeBody({ requestedBeans: 500 });
  const first = await api('/realm/arts/contribute', { method: 'POST', token, body });
  assert.strictEqual(first.status, 200);

  const changedAmount = await api('/realm/arts/contribute', {
    method: 'POST',
    token,
    body: { ...body, requestedBeans: 400 },
  });
  assert.strictEqual(changedAmount.status, 409);

  const changedArt = await api('/realm/arts/contribute', {
    method: 'POST',
    token,
    body: { ...body, artId: 'album_season_art_1' },
  });
  assert.strictEqual(changedArt.status, 409);

  // 两次冲突请求均未扣豆。
  const state = await api('/realm/state', { token });
  assert.strictEqual(state.payload.data.moodBeanBalance, 500);
});

test('结算成功返回后数据库文件已落盘，新实例可直接读到记录', async () => {
  const { token } = await bootstrapPlayer({});
  const body = settlementBody({ collectedMoodBeanCount: 88 });
  const settled = await api('/games/settlements', { method: 'POST', token, body });
  assert.strictEqual(settled.status, 200);

  // 不调用任何优雅退出钩子，直接用新数据库实例读取同一文件。
  const SQL = await initSqlJs();
  const disk = new SQL.Database(fs.readFileSync(dbFilePath));
  const statement = disk.prepare('SELECT awarded_mood_beans FROM round_settlements WHERE round_id = ?');
  statement.bind([body.roundId]);
  assert.ok(statement.step(), '结算成功后数据库文件必须已包含该记录');
  assert.strictEqual(statement.getAsObject().awarded_mood_beans, 88);
  statement.free();
  disk.close();
});

test('拼画投入成功返回后数据库文件已落盘，新实例可直接读到进度', async () => {
  const { token } = await bootstrapPlayer({});
  await settleRound(token, { collectedMoodBeanCount: 1000 });
  const result = await contribute(token, { requestedBeans: 500 });
  assert.strictEqual(result.status, 200);

  const SQL = await initSqlJs();
  const disk = new SQL.Database(fs.readFileSync(dbFilePath));
  const statement = disk.prepare('SELECT filled_cells FROM official_art_progress WHERE art_id = ?');
  statement.bind(['album_season_art_0']);
  assert.ok(statement.step(), '投入成功后数据库文件必须已包含拼画进度');
  assert.strictEqual(statement.getAsObject().filled_cells, 500);
  statement.free();
  disk.close();
});

test('GM 重置后心情豆与拼画进度全部归零', async () => {
  const { token } = await bootstrapPlayer({});
  await settleRound(token, { collectedMoodBeanCount: 800 });
  await contribute(token, { requestedBeans: 500 });
  const reset = await api('/debug/reset', { method: 'POST', token, body: {} });
  assert.strictEqual(reset.status, 200);
  assert.strictEqual(reset.payload.data.profile.moodBeanBalance, 0);
  const state = await api('/realm/state', { token });
  assert.strictEqual(state.payload.data.albums[0].arts[0].filledCells, 0);
});
