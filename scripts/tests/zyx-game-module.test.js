/**
 * ZyxGameModule 心情豆新档、数据代际清空与离线补传队列的单元测试。
 *
 * 运行：npm run test:module（仓库根目录）
 *
 * 测试用 tsc 把 TypeScript 数据源编译成 CommonJS 后在 Node 中执行，
 * 并注入 Map 版 cc.sys.localStorage。cc 类型缺失导致的 tsc 类型报错
 * 不影响产物输出，因此编译失败仅以产物是否存在为准。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
const moduleSource = path.join(repoRoot, 'assets', 'script', 'dataModule', 'ZyxGameModule.ts');

let ZyxGameModuleClass;
let ensureDataGeneration;

/** Map 版 localStorage：键缺失时与真实环境一致返回 null。 */
function installCcStub() {
  const store = new Map();
  global.cc = {
    sys: {
      localStorage: {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      },
    },
    log: () => {},
    warn: () => {},
  };
  return store;
}

test.before(() => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-module-test-'));
  try {
    execFileSync('npx', [
      '--yes', '-p', 'typescript@4.9.5', 'tsc', moduleSource,
      '--outDir', outDir,
      '--module', 'commonjs',
      '--target', 'es2017',
      '--skipLibCheck',
    ], { stdio: 'pipe' });
  } catch (error) {
    // cc 全局类型缺失会让 tsc 返回非零，但默认仍会产出 JS，以产物为准。
  }
  const compiled = path.join(outDir, 'ZyxGameModule.js');
  assert.ok(fs.existsSync(compiled), `tsc 未产出 ${compiled}`);
  installCcStub();
  const moduleExports = require(compiled);
  ZyxGameModuleClass = moduleExports.default;
  ensureDataGeneration = moduleExports.ensureDataGeneration;
});

function createModule(store) {
  store.clear();
  store.set('zyx_data_generation', 'mood_bean_v1');
  return new ZyxGameModuleClass();
}

test('数据代际不匹配时一次性清空全部旧键，不做任何折算', () => {
  const store = installCcStub();
  store.clear();
  store.set('zyx_happy_bottle_count', '9');
  store.set('zyx_current_happy_bottle_progress', '33');
  store.set('zyx_unlocked_albums', '{"album_season":true}');
  store.set('zyx_unlocked_album_arts', '{"album_season_art_0":true}');
  store.set('zyx_pending_realm_unlocks', '[]');
  store.set('zyx_daily_moods', '200');
  store.set('zyx_level', '8');
  const reset = ensureDataGeneration();
  assert.strictEqual(reset, true);
  assert.ok(!store.has('zyx_happy_bottle_count'));
  assert.ok(!store.has('zyx_current_happy_bottle_progress'));
  assert.ok(!store.has('zyx_unlocked_albums'));
  assert.ok(!store.has('zyx_unlocked_album_arts'));
  assert.ok(!store.has('zyx_daily_moods'));
  assert.ok(!store.has('zyx_level'));
  assert.strictEqual(store.get('zyx_data_generation'), 'mood_bean_v1');

  // 清空后首次启动是完整新档。
  const module = new ZyxGameModuleClass();
  module.refreshPersistentProgress();
  assert.strictEqual(module.moodBeanBalance, 0);
  assert.strictEqual(module.level, 1);
  assert.strictEqual(module.experience, 0);
});

test('写入 mood_bean_v1 标记后，正常重启不会再次清空新档', () => {
  const store = installCcStub();
  const module = createModule(store);
  store.set('zyx_mood_bean_balance', '500');
  const reset = ensureDataGeneration();
  assert.strictEqual(reset, false);
  module.refreshPersistentProgress();
  assert.strictEqual(module.moodBeanBalance, 500);
});

test('旧瓶键不会被读取：只认心情豆新键', () => {
  const store = installCcStub();
  const module = createModule(store);
  store.set('zyx_happy_bottle_count', '42');
  store.set('zyx_current_happy_bottle_progress', '30');
  module.refreshPersistentProgress();
  assert.strictEqual(module.moodBeanBalance, 0);
});

test('缺键时使用默认值，非法字符串回退到安全默认', () => {
  const store = installCcStub();
  const module = createModule(store);
  store.set('zyx_level', 'abc');
  store.set('zyx_experience', '');
  store.set('zyx_mood_bean_balance', 'NaN');
  module.refreshPersistentProgress();
  assert.strictEqual(module.level, 1);
  assert.strictEqual(module.experience, 0);
  assert.strictEqual(module.moodBeanBalance, 0);
});

test('一块一豆：本局收集 10 颗，未获服务端确认前不计入可兑换余额', () => {
  const store = installCcStub();
  const module = createModule(store);
  module.resetRound();
  module.roundCollectedMoodBeans = 10;
  const settlement = module.finishRound();
  assert.strictEqual(settlement.roundCollectedMoodBeans, 10);
  assert.strictEqual(settlement.roundBonusMoodBeans, 0);
  assert.strictEqual(settlement.roundEarnedMoodBeans, 10);
  assert.strictEqual(settlement.gainedExperience, 10);
  // 结算由服务端确认，本局预览不能提前增加开心豆余额。
  assert.strictEqual(settlement.moodBeanBalanceBefore, 0);
  assert.strictEqual(settlement.moodBeanBalanceAfter, 0);
  // R2：未确认奖励不写入服务端确认基准，也不落盘。
  assert.strictEqual(module.moodBeanBalance, 0, '基准不 immediate 入账');
  assert.ok(!store.has('zyx_mood_bean_balance'), '基准不落盘');
  assert.strictEqual(module.getDisplayMoodBeanBalance(), 0, '入队前展示值不变');
  // 记录入队后依然只显示服务端确认值。
  module.enqueuePendingRoundSettlement({ roundId: 'round_credit', startedAt: 1, endedAt: 2, score: 10, collectedMoodBeanCount: 10 });
  assert.strictEqual(module.getDisplayMoodBeanBalance(), 0, '待同步记录不预支可兑换余额');
  assert.strictEqual(module.getDisplayLevelAndExperience().experience, 0, '待同步记录不预支经验');
  module.applyCloudProfile({ level: 1, experience: 10, moodBeanBalance: 5, highestSingleGameScore: 10, gameCount: 1 });
  assert.strictEqual(module.getDisplayMoodBeanBalance(), 5, '按服务端实际发放数值展示');
  assert.strictEqual(module.getDisplayLevelAndExperience().experience, 10);
});

test('重复 finishRound() 返回零增量，不重复入账', () => {
  const store = installCcStub();
  const module = createModule(store);
  module.resetRound();
  module.roundCollectedMoodBeans = 10;
  module.finishRound();
  const again = module.finishRound();
  assert.strictEqual(again.roundEarnedMoodBeans, 0);
  assert.strictEqual(again.gainedExperience, 0);
  assert.strictEqual(module.moodBeanBalance, 0, 'R2：基准不 immediate 入账');
});

test('待提交结算队列：入队去重，成功后只删除对应 roundId', () => {
  const store = installCcStub();
  const module = createModule(store);
  const first = { roundId: 'round_a', startedAt: 1, endedAt: 2, score: 100, collectedMoodBeanCount: 10 };
  const second = { roundId: 'round_b', startedAt: 3, endedAt: 4, score: 200, collectedMoodBeanCount: 20 };
  module.enqueuePendingRoundSettlement(first);
  module.enqueuePendingRoundSettlement(second);
  module.enqueuePendingRoundSettlement(first); // 重复 roundId 不重复入队
  assert.strictEqual(module.getPendingRoundSettlements().length, 2);

  module.removePendingRoundSettlement('round_a');
  const remaining = module.getPendingRoundSettlements();
  assert.strictEqual(remaining.length, 1);
  assert.strictEqual(remaining[0].roundId, 'round_b');
});

test('待提交结算队列上限 100：满员后拒绝入队且不静默丢弃', () => {
  const store = installCcStub();
  const module = createModule(store);
  for (let index = 0; index < 100; index++) {
    module.enqueuePendingRoundSettlement({
      roundId: `round_full_${index}`,
      startedAt: 1,
      endedAt: 2,
      score: 100,
      collectedMoodBeanCount: 10,
    });
  }
  assert.strictEqual(module.getPendingRoundSettlements().length, 100);
  assert.strictEqual(module.canAcceptPendingRoundSettlement(), false);
  module.enqueuePendingRoundSettlement({
    roundId: 'round_overflow',
    startedAt: 1,
    endedAt: 2,
    score: 100,
    collectedMoodBeanCount: 10,
  });
  assert.strictEqual(module.getPendingRoundSettlements().length, 100);
  assert.ok(!module.getPendingRoundSettlements().some((item) => item.roundId === 'round_overflow'));
  module.removePendingRoundSettlement('round_full_0');
  assert.strictEqual(module.canAcceptPendingRoundSettlement(), true);
});

test('dead-letter：坏记录移出活动队列并保留原因与时间，不堵塞后续记录', () => {
  const store = installCcStub();
  const module = createModule(store);
  module.enqueuePendingRoundSettlement({ roundId: 'round_bad', startedAt: 1, endedAt: 2, score: 1, collectedMoodBeanCount: 1 });
  module.enqueuePendingRoundSettlement({ roundId: 'round_good', startedAt: 3, endedAt: 4, score: 2, collectedMoodBeanCount: 2 });
  module.movePendingRoundSettlementToDeadLetter('round_bad', '对局时间异常');
  const pending = module.getPendingRoundSettlements();
  assert.strictEqual(pending.length, 1);
  assert.strictEqual(pending[0].roundId, 'round_good');
  const dead = module.getDeadRoundSettlements();
  assert.strictEqual(dead.length, 1);
  assert.strictEqual(dead[0].record.roundId, 'round_bad');
  assert.strictEqual(dead[0].reason, '对局时间异常');
  assert.ok(Number.isFinite(dead[0].deadAt));
});

test('暂停重开语义：只 resetRound 不 finishRound 时余额、经验与待提交队列均不变', () => {
  const store = installCcStub();
  const module = createModule(store);
  module.resetRound();
  module.roundCollectedMoodBeans = 10;
  module.finishRound();
  module.enqueuePendingRoundSettlement({ roundId: 'round_keep', startedAt: 1, endedAt: 2, score: 100, collectedMoodBeanCount: 10 });
  const balanceBefore = module.moodBeanBalance;
  const levelBefore = module.level;
  const experienceBefore = module.experience;
  const queueBefore = module.getPendingRoundSettlements().length;

  // 模拟修复后的 restartFromPause：直接 resetRound 开始新局，本局收集全部丢弃。
  module.resetRound();
  assert.strictEqual(module.roundCollectedMoodBeans, 0);
  assert.strictEqual(module.moodBeanBalance, balanceBefore);
  assert.strictEqual(module.level, levelBefore);
  assert.strictEqual(module.experience, experienceBefore);
  assert.strictEqual(module.getPendingRoundSettlements().length, queueBefore);
});

test('refreshPersistentProgress 恢复历史最高分，但不覆盖局内更高的内存值', () => {
  const store = installCcStub();
  const module = createModule(store);
  store.set('zyx_best_score', '800');
  module.refreshPersistentProgress();
  assert.strictEqual(module.bestScore, 800);

  module.bestScore = 1200; // 局内刚打出但未落盘的更高分
  module.refreshPersistentProgress();
  assert.strictEqual(module.bestScore, 1200);
});

test('未确认结算不增加首页余额，服务端逐局确认后才展示入账', () => {
  const store = installCcStub();
  const module = createModule(store);
  // 离线完成两局，每局 10 豆，全部进入 pending 队列。
  module.enqueuePendingRoundSettlement({ roundId: 'round_a', startedAt: 1, endedAt: 2, score: 100, collectedMoodBeanCount: 10 });
  module.enqueuePendingRoundSettlement({ roundId: 'round_b', startedAt: 3, endedAt: 4, score: 200, collectedMoodBeanCount: 10 });
  assert.strictEqual(module.getDisplayMoodBeanBalance(), 0, '未确认时不预支');

  // 第一局成功（服务端确认余额 10）；第二局提交遇到 500，仍留在队列。
  module.removePendingRoundSettlement('round_a');
  module.applyCloudProfile({ level: 1, experience: 10, moodBeanBalance: 10, highestSingleGameScore: 100 });
  assert.strictEqual(module.moodBeanBalance, 10, '基准只保存服务端确认值');
  assert.strictEqual(module.getDisplayMoodBeanBalance(), 10, '只展示已确认的 10');

  // 第二局随后成功：服务端确认 20，队列清空，展示值仍为 20，不得变 30。
  module.removePendingRoundSettlement('round_b');
  module.applyCloudProfile({ level: 2, experience: 5, moodBeanBalance: 20, highestSingleGameScore: 200 });
  assert.strictEqual(module.getDisplayMoodBeanBalance(), 20, '确认后展示值不重复叠加');
});

test('未确认结算不推高等级或经验', () => {
  const store = installCcStub();
  const module = createModule(store);
  // 基准：Lv.1，经验 5/15。
  module.applyCloudProfile({ level: 1, experience: 5, moodBeanBalance: 5, highestSingleGameScore: 0 });
  // pending 20 豆，首页保持服务端确认值。
  module.enqueuePendingRoundSettlement({ roundId: 'round_exp', startedAt: 1, endedAt: 2, score: 50, collectedMoodBeanCount: 20 });
  const display = module.getDisplayLevelAndExperience();
  assert.strictEqual(display.level, 1);
  assert.strictEqual(display.experience, 5);
  assert.strictEqual(display.target, module.getExperienceTargetForLevel(1));
  assert.strictEqual(module.level, 1, '基准等级不被 pending 推高');
  assert.strictEqual(module.experience, 5, '基准经验不被 pending 推高');

  // 服务端确认 Lv.2 经验 10 后队列清空，展示值保持一致、不重复升级。
  module.removePendingRoundSettlement('round_exp');
  module.applyCloudProfile({ level: 2, experience: 10, moodBeanBalance: 25, highestSingleGameScore: 50 });
  const confirmed = module.getDisplayLevelAndExperience();
  assert.strictEqual(confirmed.level, 2);
  assert.strictEqual(confirmed.experience, 10);
  assert.strictEqual(module.getDisplayMoodBeanBalance(), 25);
});

test('dead-letter 和待提交记录均不改变已确认展示值', () => {
  const store = installCcStub();
  const module = createModule(store);
  module.applyCloudProfile({ level: 1, experience: 0, moodBeanBalance: 10, highestSingleGameScore: 0 });
  module.enqueuePendingRoundSettlement({ roundId: 'round_dead', startedAt: 1, endedAt: 2, score: 10, collectedMoodBeanCount: 10 });
  module.enqueuePendingRoundSettlement({ roundId: 'round_alive', startedAt: 3, endedAt: 4, score: 20, collectedMoodBeanCount: 5 });
  assert.strictEqual(module.getDisplayMoodBeanBalance(), 10);

  module.movePendingRoundSettlementToDeadLetter('round_dead', '对局时间异常');
  assert.strictEqual(module.getDisplayMoodBeanBalance(), 10);
  const display = module.getDisplayLevelAndExperience();
  assert.strictEqual(display.experience, 0);
});

test('暂停重开不保存最高分：消除过程中只更新内存，只有正式结算才写入 zyx_best_score', () => {
  const store = installCcStub();
  const module = createModule(store);
  // 初始最高分 100。
  store.set('zyx_best_score', '100');
  module.resetRound();
  assert.strictEqual(module.bestScore, 100);
  assert.strictEqual(module.startingBestScore, 100);

  // 模拟局内打到 200 分：构造满行消除。
  module.score = 190;
  // 放一个 size=8 的 piece 在 row 9（底部行），col 0，覆盖整行；stampMood=1 使消除时收集豆。
  module.pieces.push({
    id: 999, row: 9, col: 0, size: 8, color: 1,
    stampMood: 1, stampCell: 0, collectibleType: 0, collectibleCell: 0,
  });
  const result = module.eliminateFullRows(1);
  assert.strictEqual(result.clearedRows, 1);
  assert.strictEqual(module.score, 200, '消除得分后应到 200');
  assert.ok(module.roundCollectedMoodBeans > 0, '消除带表情块应收集豆');
  assert.strictEqual(module.bestScore, 200, '内存 HUD 展示新纪录');
  // 关键断言：localStorage 中的 zyx_best_score 仍是 100，未落盘。
  assert.strictEqual(store.get('zyx_best_score'), '100', '消除过程不得持久化最高分');

  // 执行暂停重新开始：resetRound 从存储重新读取最高分。
  module.resetRound();
  assert.strictEqual(module.bestScore, 100, '暂停重开后最高分恢复本局开始前');
  assert.strictEqual(store.get('zyx_best_score'), '100');
  assert.strictEqual(module.score, 0);
  assert.strictEqual(module.roundCollectedMoodBeans, 0);
  assert.strictEqual(module.moodBeanBalance, 0, '不发豆');
  assert.strictEqual(module.experience, 0, '不加经验');
  assert.strictEqual(module.getPendingRoundSettlements().length, 0, '不进 pending 队列');

  // 正式结束一局 200 分后最高分应更新为 200。
  module.resetRound();
  module.score = 200;
  module.roundCollectedMoodBeans = 10;
  module.finishRound();
  assert.strictEqual(store.get('zyx_best_score'), '200', '正式结算后才持久化最高分');
  // 正式结算进入待提交队列，首页仍等服务端确认。
  module.enqueuePendingRoundSettlement({ roundId: 'round_best', startedAt: 1, endedAt: 2, score: 200, collectedMoodBeanCount: 10 });
  assert.strictEqual(module.moodBeanBalance, 0, '基准不 immediate 入账');
  assert.strictEqual(module.getDisplayMoodBeanBalance(), 0, '待提交不预支奖励');
});
