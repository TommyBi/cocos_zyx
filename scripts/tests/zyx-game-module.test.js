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
let boardRulesVersion;

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
  boardRulesVersion = moduleExports.BOARD_RULES_VERSION;
});

test('V12云端余额乱序不回滚，本局道具不受账号库存刷新影响，也不会带入下一局', () => {
  const store = installCcStub(); const module = createModule(store);
  const base = { playerId: 'shop-player', level: 1, experience: 0, highestSingleGameScore: 100 };
  module.applyCloudProfile({ ...base, assetRevision: 5, moodBeanBalance: 20, inventory: { hammer: 9, magicWand: 9 } });
  assert.equal(module.hammerCount, 0);
  module.applyRoundTools({ hammer: { acquired: 1, used: 0, owned: 1 }, magicWand: { acquired: 0, used: 0, owned: 0 } });
  assert.equal(module.applyCloudProfile({ ...base, assetRevision: 4, moodBeanBalance: 40, inventory: { hammer: 0, magicWand: 0 } }), false);
  module.applyCloudProfile({ ...base, assetRevision: 6, moodBeanBalance: 23, inventory: { hammer: 0, magicWand: 0 } });
  assert.equal(module.hammerCount, 1); assert.equal(module.moodBeanBalance, 23);
  module.resetRound(); assert.equal(module.hammerCount, 0); assert.equal(module.roundToolClaims.hammer, 0);
});

function createModule(store) {
  store.clear();
  store.set('zyx_data_generation', 'mood_bean_v5_20261112');
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
  store.set('zyx_pending_tool_exchange', '{"actionId":"old_purchase"}');
  store.set('zyx_tool_reward_hammer', 'old_claim');
  store.set('zyx_pending_stamina_share_id', 'old_share');
  store.set('zyx_data_generation','mood_bean_v1');
  const reset = ensureDataGeneration();
  assert.strictEqual(reset, true);
  assert.ok(!store.has('zyx_happy_bottle_count'));
  assert.ok(!store.has('zyx_current_happy_bottle_progress'));
  assert.ok(!store.has('zyx_unlocked_albums'));
  assert.ok(!store.has('zyx_unlocked_album_arts'));
  assert.ok(!store.has('zyx_daily_moods'));
  assert.ok(!store.has('zyx_level'));
  for(const key of ['zyx_pending_tool_exchange','zyx_tool_reward_hammer','zyx_pending_stamina_share_id']) assert.ok(!store.has(key));
  assert.strictEqual(store.get('zyx_data_generation'), 'mood_bean_v5_20261112');

  // 清空后首次启动是完整新档。
  const module = new ZyxGameModuleClass();
  module.refreshPersistentProgress();
  assert.strictEqual(module.moodBeanBalance, 0);
  assert.strictEqual(module.level, 1);
  assert.strictEqual(module.experience, 0);
});

test('写入当前代际标记后，正常重启不会再次清空新档', () => {
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

test('消除 10 个表情块未满一颗，经验独立累计且不预支云端资产', () => {
  const store = installCcStub();
  const module = createModule(store);
  module.resetRound();
  module.roundCollectedMoodBeans = 10;
  const settlement = module.finishRound();
  assert.strictEqual(settlement.roundCollectedMoodBeans, 10);
  assert.strictEqual(settlement.roundBonusMoodBeans, 0);
  assert.strictEqual(settlement.roundEarnedMoodBeans, 0);
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

test('整颗奖励与表情经验分离，多颗与余量均正确，每局从零开始', () => {
  const module = createModule(installCcStub());
  const economy = require('../../server/src/economyConfig');
  for (const [blocks, expected] of [[99,0],[100,1],[9999,99],[10000,100],[10001,100],[33726,337],[999999,9999]]) {
    module.resetRound();
    assert.equal(module.roundCollectedMoodBeans, 0);
    module.roundCollectedMoodBeans = blocks;
    const result = module.finishRound();
    assert.equal(result.roundEarnedMoodBeans, expected);
    assert.equal(economy.collectedBlocksToBeans(blocks), expected);
    assert.equal(result.gainedExperience, blocks);
    assert.equal(module.getDisplayMoodBeanBalance(), 0, '服务端确认前不预支余额');
  }
  module.resetRound();
  assert.equal(module.roundCollectedMoodBeans, 0, '上一局未满进度不得带入新局');
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

test('服务端开局配置在 resetRound 生成棋盘前生效，并且只消费一次', () => {
  const store = installCcStub();
  const module = createModule(store);
  module.setRoundSeedOverride(99);

  module.setRoundSeed(123456, true);
  module.resetRound();
  assert.strictEqual(module.roundSeed, 123456);
  assert.strictEqual(module.isTutorialRound(), true, '服务端教学标记优先于本地挑战次数');

  module.setRoundSeed(123456, false);
  module.resetRound();
  assert.strictEqual(module.roundSeed, 123456);
  assert.strictEqual(module.isTutorialRound(), false);
  assert.strictEqual(module.appendNextRow(), true);
  module.resolveBoard();
  const { replayRound } = require(path.join(repoRoot, 'server', 'src', 'gameEngine.js'));
  const replay = replayRound(123456, false, module.roundActions);
  assert.strictEqual(replay.valid, true);
  assert.strictEqual(replay.score, module.score, '客户端与服务端必须使用同一随机序列');
  assert.strictEqual(replay.collectedMoodBeans, module.roundCollectedMoodBeans);

  module.resetRound();
  assert.strictEqual(module.roundSeed, 99, '下一局不得复用上一局的服务端种子');
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
  module.score = 188;
  // 放一个 size=8 的 piece 在 row 9（底部行），col 0，覆盖整行；stampMood=1 使消除时收集豆。
  module.pieces.push({
    id: 999, row: 9, col: 0, size: 8, color: 1,
    stampMood: 1, stampCell: 0, collectibleType: 0, collectibleCell: 0,
  });
  const result = module.eliminateFullRows();
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

function boardPiece(id, row, col, size, extra = {}) {
  return { id, row, col, size, color: 1, stampMood: 1, stampCell: 0, collectibleType: 0, collectibleCell: 0, ...extra };
}

test('连续成功操作依次升到 1/2/4/8/10 倍，无消除的有效操作后归零', () => {
  const module = createModule(installCcStub());
  module.resetRound();
  for (let action = 1; action <= 7; action++) {
    module.beginPlayerAction();
    module.pieces = [boardPiece(action, 9, 0, 8)];
    const result = module.eliminateFullRows();
    assert.strictEqual(result.combo, Math.min(action, 5));
    assert.strictEqual(result.gainedScore, [12, 24, 48, 96, 120][Math.min(action, 5) - 1]);
    module.finishPlayerAction();
  }
  module.beginPlayerAction();
  module.pieces = [boardPiece(100, 9, 0, 1)];
  module.resolveBoard();
  module.finishPlayerAction();
  assert.strictEqual(module.combo, 0);
  module.beginPlayerAction();
  module.pieces = [boardPiece(101, 9, 0, 8)];
  assert.strictEqual(module.eliminateFullRows().gainedScore, 12);
  module.resetRound();
  assert.strictEqual(module.combo, 0);
});

test('V18教学三次真实移动依次产生 12/24/48 分，服务端按跨操作连消重放', () => {
  const module = createModule(installCcStub());
  module.setRoundSeed(42, true);
  module.resetRound();
  for (let step = 0; step < 3; step++) {
    const move = module.getTutorialMove(step);
    assert.strictEqual(module.movePiece(move.id, move.offset), true);
    const result = module.resolveBoard();
    module.finishPlayerAction();
    assert.strictEqual(result.gainedScore, [12, 24, 48][step]);
    assert.strictEqual(module.combo, step + 1);
    // 普通点击/无效移动不会被记为一次失败操作。
    assert.strictEqual(module.movePiece(999, 1), false);
    assert.strictEqual(module.combo, step + 1);
    const { replayRound } = require(path.join(repoRoot, 'server', 'src', 'gameEngine.js'));
    const replay = replayRound(42, true, module.roundActions);
    assert.strictEqual(replay.valid, true);
    assert.strictEqual(replay.score, module.score);
  }
});

test('同一次操作的自动补排不打断也不重复增加 combo', () => {
  const module = createModule(installCcStub());
  module.resetRound();
  module.rulesVersion = 17; module.roundActions[0].version = 17;
  for (let action = 1; action <= 2; action++) {
    module.beginPlayerAction();
    module.pieces = [boardPiece(action, 9, 0, 8)];
    assert.strictEqual(module.resolveBoard().gainedScore, action * 10);
    module.nextPieces = [];
    assert.strictEqual(module.appendNextRow(), true);
    assert.strictEqual(module.resolveBoard().clearedRows, 0);
    module.pieces = [boardPiece(100 + action, 9, 0, 8)];
    assert.strictEqual(module.resolveBoard().gainedScore, action * 10, '补排后消除沿用本次倍率');
    module.finishPlayerAction();
    assert.strictEqual(module.combo, action);
  }
});

test('V12 Good 三连在整次操作结束后奖励，与双排叠加且重复 finish 不再领取', () => {
  const module = createModule(installCcStub());
  module.resetRound();
  module.rulesVersion = 12; module.roundActions[0].version = 12;
  for (let action = 1; action <= 6; action++) {
    module.beginPlayerAction();
    module.pieces = [boardPiece(100 + action, 9, 0, 8)];
    if (action === 3) module.pieces.push(boardPiece(200, 8, 0, 8));
    module.resolveBoard();
    assert.strictEqual(module.pieces.filter(p => p.bomb).length, 0, '尚未完成操作不得生成次生道具');
    const rewards = module.finishPlayerAction();
    assert.strictEqual(rewards.length, action === 3 ? 2 : action > 3 ? 1 : 0);
    assert.deepStrictEqual(module.finishPlayerAction(), []);
  }
});

test('V12 真实教学第三次成功给炸弹，主动引爆续连且与服务端事件重放一致', () => {
  const module = createModule(installCcStub());
  module.setRoundSeed(4, true);
  module.resetRound();
  module.rulesVersion = 12; module.roundActions[0].version = 12;
  for (let step = 0; step < 3; step++) {
    const move = module.getTutorialMove(step);
    module.movePiece(move.id, move.offset);
    module.resolveBoard();
    module.finishPlayerAction();
  }
  assert.strictEqual(module.combo, 3);
  const bomb = module.pieces.find(p => p.bomb);
  assert.ok(bomb);
  module.detonateBomb(bomb.id);
  module.resolveBoard();
  module.finishPlayerAction();
  assert.strictEqual(module.combo, 3, '仅爆破也保留已有 combo，但不升级');
  const { replayRound } = require(path.join(repoRoot, 'server', 'src', 'gameEngine.js'));
  const replay = replayRound(4, true, module.roundActions);
  assert.strictEqual(replay.valid, true);
  assert.strictEqual(replay.score, module.score);
  assert.strictEqual(replay.collectedMoodBeans, module.roundCollectedMoodBeans);
});

test('偶数宽横块的爆破范围以整块中央对称覆盖两侧邻块', () => {
  const module = createModule(installCcStub());
  module.resetRound();
  module.pieces = [boardPiece(100, 9, 2, 2, { bomb: true }), boardPiece(101, 9, 1, 1), boardPiece(102, 9, 4, 1), boardPiece(103, 9, 5, 1)];
  assert.deepStrictEqual(module.detonateBomb(100).removedPieceIds, [100, 101, 102]);
  assert.deepStrictEqual(module.pieces.map(p => p.id), [103]);
});

test('V12 同次操作两轮掉落消除累计两排，稳定后只发一枚炸弹；全清仍保留奖励', () => {
  const module = createModule(installCcStub());
  module.resetRound();
  module.rulesVersion = 12; module.roundActions[0].version = 12;
  // 中间满行先消；上方右半块随后落到底行，与左半块拼满，产生第二次消除。
  module.pieces = [boardPiece(100, 9, 0, 4), boardPiece(101, 8, 0, 8), boardPiece(102, 7, 4, 4)];
  const result = module.resolveBoard();
  assert.strictEqual(result.clearedRows, 2);
  assert.strictEqual(result.gainedScore, 20);
  module.finishPlayerAction();
  assert.strictEqual(module.pieces.length, 1);
  assert.strictEqual(module.pieces[0].bomb, true);
  assert.strictEqual(module.pieces[0].row, 9);
  assert.strictEqual(module.pieces[0].size, 1);
  const bombId = module.pieces[0].id;
  module.resolveBoard();
  assert.strictEqual(module.pieces.length, 1, '无新消除不重复奖励');
  assert.strictEqual(module.pieces[0].id, bombId);
});

test('V12 同时清两排为基础分 20，炸弹附着在幸存普通横块，随移动保留', () => {
  const module = createModule(installCcStub());
  module.resetRound();
  module.rulesVersion = 12; module.roundActions[0].version = 12;
  module.pieces = [boardPiece(100, 9, 0, 8), boardPiece(101, 8, 0, 8), boardPiece(102, 7, 2, 2)];
  const result = module.resolveBoard();
  assert.strictEqual(result.clearedRows, 2);
  assert.strictEqual(result.gainedScore, 20);
  module.finishPlayerAction();
  const bomb = module.getPiece(102);
  assert.strictEqual(bomb.bomb, true);
  assert.strictEqual(bomb.size, 2);
  assert.strictEqual(module.movePiece(102, 1), true);
  assert.strictEqual(bomb.size, 2);
  assert.strictEqual(bomb.col, 3);
});

test('炸弹按横块中心的 3×3 范围移除相交整块，收豆一次且不能重复引爆', () => {
  const module = createModule(installCcStub());
  module.resetRound();
  module.pieces = [
    boardPiece(100, 8, 1, 3, { bomb: true }),
    boardPiece(101, 7, 0, 2), // 和范围左边缘相交，整块移除。
    boardPiece(102, 9, 3, 3), // 和范围右边缘相交，整块移除。
    boardPiece(103, 7, 4, 2), // 横向超出。
    boardPiece(104, 6, 3, 1), // 纵向超出。
  ];
  const before = module.roundCollectedMoodBeans;
  const blast = module.detonateBomb(100);
  assert.deepStrictEqual(blast.removedPieceIds, [100, 101, 102]);
  assert.deepStrictEqual(module.pieces.map(p => p.id), [103, 104]);
  assert.strictEqual(module.roundCollectedMoodBeans - before, 3);
  assert.strictEqual(module.detonateBomb(100), null);
  assert.strictEqual(module.detonateBomb(103), null, '普通块不可冒充炸弹');
  assert.deepStrictEqual(module.roundActions, [{ type: 'rules', version: boardRulesVersion }, { type: 'bomb', id: 100 }]);
});

test('多种种子的真实移动、连消、奖励炸弹与爆破，客户端和服务端重放一致', () => {
  const { replayRound } = require(path.join(repoRoot, 'server', 'src', 'gameEngine.js'));
  let detonated = 0;
  for (const seed of [3, 42, 20261105, 789]) {
    const module = createModule(installCcStub());
    module.setRoundSeed(seed, false);
    module.resetRound();
    for (let turn = 0; turn < 65; turn++) {
      const bomb = module.pieces.find(p => p.bomb);
      const hint = module.findEliminationHint();
      if (bomb) { module.detonateBomb(bomb.id); detonated++; module.resolveBoard(); }
      else if (hint && turn % 3 !== 0) { module.movePiece(hint.id, hint.offset); module.resolveBoard(); }
      if (!module.appendTurnRows()) break;
      module.resolveBoard();
      module.finishPlayerAction();
      const replay = replayRound(seed, false, module.roundActions);
      assert.strictEqual(replay.valid, true, `seed=${seed}, turn=${turn}`);
      assert.strictEqual(replay.score, module.score, `score seed=${seed}, turn=${turn}`);
      assert.strictEqual(replay.collectedMoodBeans, module.roundCollectedMoodBeans, `beans seed=${seed}, turn=${turn}`);
    }
  }
  assert.ok(detonated > 0, '必须覆盖真实开局获得奖励后引爆的完整路径');
  assert.strictEqual(replayRound(42, false, [{ type: 'bomb', id: 1 }]).valid, false);
});

test('V17真实对局清屏减压、满12行升难、气球再减压；前后端续玩重放一致', () => {
  const { finishTurn } = require('../fixtures/rescue-security-helper.cjs');
  const { replayBoardEngine } = require('../../server/src/replayBoardEngine');
  const store = installCcStub();
  const seed = 42, board = createModule(store);
  board.resetBoard(seed, false, 17);
  const rescues = [];
  let reliefStartRows;
  for (let step = 0; step < 110 && !board.isGameOver(); step++) {
    const elapsedMs = 60000 + rescues.length * 40000;
    if (board.difficultyActionCount >= 48 && !board.reliefRowsRemaining && board.canOfferRoundRescue(elapsedMs)) {
      const kind = board.offerRoundRescue(elapsedMs);
      if (rescues.length === 1) assert.ok(board.roundClearedRows - reliefStartRows >= 12);
      rescues.push(kind);
      assert.ok(kind === 'clear' ? board.applyClearRescue(elapsedMs) : board.applyBalloonRescue(elapsedMs));
      finishTurn(board, false);
      assert.equal(board.reliefRowsRemaining, 12);
      reliefStartRows = board.roundClearedRows;
      if (rescues.length === 2) break;
    }
    const hint = board.findEliminationHint();
    const bomb = board.pieces.find(piece => piece.bomb);
    if (hint) assert.ok(board.movePiece(hint.id, hint.offset));
    else if (bomb) assert.ok(board.detonateBomb(bomb.id));
    else {
      const move = board.pieces.map(piece => {
        const range = board.getMoveRange(piece.id);
        return { id: piece.id, offset: range.min || range.max };
      }).find(move => move.offset);
      assert.ok(move && board.movePiece(move.id, move.offset));
    }
    finishTurn(board);
  }
  assert.deepStrictEqual(rescues, ['clear', 'balloon']);
  const replay = replayBoardEngine(seed, false, board.roundActions, 17, false, true, true, true);
  assert.ok(replay.valid && replay.ready);
  const restored = createModule(store);
  restored.restoreRound({ roundId: 'v17-wave', rulesVersion: 17, seed, isTutorial: false,
    heartRescueEligible: false, actions: board.roundActions, elapsedMs: 100000 });
  for (const field of ['pieces', 'nextPieces', 'secondNextPieces', 'score', 'roundClearedRows', 'reliefRowsRemaining', 'randomState']) {
    assert.deepStrictEqual(replay.board[field], board[field], `server: ${field}`);
    assert.deepStrictEqual(restored[field], board[field], `resume: ${field}`);
  }
});


test('复活卡库存跟随云端资产版本持久化，重开不补回，用旧回执不能回滚扣卡', () => {
  const store = installCcStub(), module = createModule(store);
  const base = { playerId: 'revive-card-player', level: 1, experience: 0, highestSingleGameScore: 0, moodBeanBalance: 0 };
  module.applyCloudProfile({ ...base, assetRevision: 2, inventory: { hammer: 0, magicWand: 0, reviveCard: 2 } });
  module.resetRound(); assert.equal(module.reviveCardCount, 2);
  module.applyCloudProfile({ ...base, assetRevision: 3, inventory: { hammer: 0, magicWand: 0, reviveCard: 1 } });
  assert.equal(module.applyCloudProfile({ ...base, assetRevision: 2, inventory: { hammer: 0, magicWand: 0, reviveCard: 2 } }), false);
  module.resetRound(); assert.equal(module.reviveCardCount, 1); assert.equal(store.get('zyx_revive_card_inventory'), '1');
  module.resetLocalAccount(); assert.equal(module.reviveCardCount, 0);
});
