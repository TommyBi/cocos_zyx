/**
 * R2：离线结算队列工作器（SettlementSync）的单元测试。
 *
 * 覆盖整改基线 5.1/5.4：
 * - 单一队列、single-flight（并发触发不会产生第二个工作器）；
 * - 临时错误（断网/超时/5xx）保留记录并停止本次 flush；
 * - 永久错误（字段损坏/明确 4xx/超龄）移入 dead-letter 并继续后续记录，不堵塞整队列。
 *
 * 运行：npm run test:module（仓库根目录）
 * 与 zyx-game-module.test.js 相同的 tsc 编译方式。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
const syncSource = path.join(repoRoot, 'assets', 'script', 'manager', 'SettlementSync.ts');

let sync;
let zyxGameModule;

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

function validRecord(roundId, overrides = {}) {
  const endedAt = Date.now();
  return {
    roundId,
    startedAt: endedAt - 60 * 1000,
    endedAt,
    score: 100,
    collectedMoodBeanCount: 10,
    ...overrides,
  };
}

test.before(() => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-sync-test-'));
  try {
    execFileSync('npx', [
      '--yes', '-p', 'typescript@4.9.5', 'tsc', syncSource,
      '--outDir', outDir,
      '--module', 'commonjs',
      '--target', 'es2017',
      '--skipLibCheck',
    ], { stdio: 'pipe' });
  } catch (error) {
    // cc 全局类型缺失会让 tsc 返回非零，但默认仍会产出 JS，以产物为准。
  }
  const compiled = path.join(outDir, 'manager', 'SettlementSync.js');
  assert.ok(fs.existsSync(compiled), `tsc 未产出 ${compiled}`);
  installCcStub();
  sync = require(compiled);
  zyxGameModule = require(path.join(outDir, 'dataModule', 'ZyxGameModule.js')).zyxGameModule;
});

test.beforeEach(() => {
  const store = installCcStub();
  store.clear();
  store.set('zyx_data_generation', 'mood_bean_v1');
});

test('两条记录都成功提交后队列清空，并按顺序回调', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_a'));
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_b'));
  const settled = [];
  const outcome = await sync.flushPendingRoundSettlements(
    async (record) => ({ settlement: { profile: { roundId: record.roundId } } }),
    { onSettled: (record) => settled.push(record.roundId) },
  );
  assert.strictEqual(outcome.alreadyRunning, false);
  assert.strictEqual(outcome.submitted, 2);
  assert.strictEqual(outcome.deadLettered, 0);
  assert.strictEqual(outcome.blocked, false);
  assert.deepStrictEqual(settled, ['round_a', 'round_b']);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 0);
});

test('400 带永久业务错误码（INVALID_ROUND_TIME）进入 dead-letter，后续记录仍能成功提交', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_bad'));
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_good'));
  const deadLetters = [];
  const submitted = [];
  const outcome = await sync.flushPendingRoundSettlements(
    async (record) => {
      if (record.roundId === 'round_bad') {
        const error = new Error('对局时间异常');
        error.status = 400;
        error.businessCode = 'INVALID_ROUND_TIME';
        throw error;
      }
      submitted.push(record.roundId);
      return {};
    },
    { onDeadLetter: (record, reason) => deadLetters.push([record.roundId, reason]) },
  );
  assert.strictEqual(outcome.submitted, 1);
  assert.strictEqual(outcome.deadLettered, 1);
  assert.deepStrictEqual(submitted, ['round_good']);
  assert.strictEqual(deadLetters.length, 1);
  assert.strictEqual(deadLetters[0][0], 'round_bad');
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 0);
  assert.strictEqual(zyxGameModule.getDeadRoundSettlements().length, 1);
  assert.strictEqual(zyxGameModule.getDeadRoundSettlements()[0].record.roundId, 'round_bad');
});

test('409 带永久业务错误码（ROUND_PAYLOAD_CONFLICT）进入 dead-letter', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_409_perm'));
  const outcome = await sync.flushPendingRoundSettlements(
    async () => {
      const error = new Error('同 ID 异载荷冲突');
      error.status = 409;
      error.businessCode = 'ROUND_PAYLOAD_CONFLICT';
      throw error;
    },
    {},
  );
  assert.strictEqual(outcome.deadLettered, 1);
  assert.strictEqual(outcome.blocked, false);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 0);
  assert.strictEqual(zyxGameModule.getDeadRoundSettlements().length, 1);
});

test('旧结算缺少服务端开局许可时进入 dead-letter，不堵塞后续记录', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_without_start'));
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_valid'));
  const submitted = [];
  const outcome = await sync.flushPendingRoundSettlements(async (record) => {
    if (record.roundId === 'round_without_start') {
      const error = new Error('缺少服务端开局记录');
      error.status = 409;
      error.businessCode = 'ROUND_NOT_STARTED';
      throw error;
    }
    submitted.push(record.roundId);
    return {};
  });
  assert.strictEqual(outcome.deadLettered, 1);
  assert.strictEqual(outcome.submitted, 1);
  assert.deepStrictEqual(submitted, ['round_valid']);
});

test('409 无业务错误码按临时错误处理，不盲目丢弃', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_409_nocode'));
  const outcome = await sync.flushPendingRoundSettlements(
    async () => {
      const error = new Error('冲突');
      error.status = 409;
      throw error;
    },
    {},
  );
  assert.strictEqual(outcome.blocked, true);
  assert.strictEqual(outcome.deadLettered, 0);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 1);
});

test('401 凭证失效按临时错误处理，不进入 dead-letter', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_401'));
  const outcome = await sync.flushPendingRoundSettlements(
    async () => {
      const error = new Error('凭证失效');
      error.status = 401;
      throw error;
    },
    {},
  );
  assert.strictEqual(outcome.blocked, true);
  assert.strictEqual(outcome.deadLettered, 0);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 1);
});

test('408 请求超时按临时错误处理，保留记录并停止 flush', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_408'));
  const outcome = await sync.flushPendingRoundSettlements(
    async () => {
      const error = new Error('请求超时');
      error.status = 408;
      throw error;
    },
    {},
  );
  assert.strictEqual(outcome.blocked, true);
  assert.strictEqual(outcome.deadLettered, 0);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 1);
});

test('429 限流按临时错误处理，保留记录并停止 flush', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_429'));
  const outcome = await sync.flushPendingRoundSettlements(
    async () => {
      const error = new Error('请求过于频繁');
      error.status = 429;
      throw error;
    },
    {},
  );
  assert.strictEqual(outcome.blocked, true);
  assert.strictEqual(outcome.deadLettered, 0);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 1);
});

test('400 无业务错误码按临时错误处理，不盲目丢弃', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_400_nocode'));
  const outcome = await sync.flushPendingRoundSettlements(
    async () => {
      const error = new Error('参数错误');
      error.status = 400;
      throw error;
    },
    {},
  );
  assert.strictEqual(outcome.blocked, true);
  assert.strictEqual(outcome.deadLettered, 0);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 1);
});

test('临时错误（5xx/断网）保留当前记录并停止本次 flush，后续记录不提前提交', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_first'));
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_second'));
  const attempted = [];
  const outcome = await sync.flushPendingRoundSettlements(
    async (record) => {
      attempted.push(record.roundId);
      const error = new Error('云端服务暂不可用');
      error.status = 500;
      throw error;
    },
    {},
  );
  assert.strictEqual(outcome.blocked, true);
  assert.strictEqual(outcome.submitted, 0);
  // 只尝试了第一条就停止，两条记录都保留在队列中等待下次触发。
  assert.deepStrictEqual(attempted, ['round_first']);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 2);
});

test('无状态网络错误（无 HTTP status）按临时错误处理', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_net'));
  const outcome = await sync.flushPendingRoundSettlements(
    async () => { throw new Error('网络连接失败'); },
    {},
  );
  assert.strictEqual(outcome.blocked, true);
  assert.strictEqual(outcome.deadLettered, 0);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 1);
});

test('字段损坏的记录直接进入 dead-letter，不向服务端发送，不堵塞后续记录', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_corrupt', { endedAt: Date.now() - 60 * 1000, startedAt: Date.now() }));
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_ok'));
  const attempted = [];
  const outcome = await sync.flushPendingRoundSettlements(
    async (record) => {
      attempted.push(record.roundId);
      return {};
    },
    {},
  );
  assert.strictEqual(outcome.deadLettered, 1);
  assert.strictEqual(outcome.submitted, 1);
  assert.deepStrictEqual(attempted, ['round_ok']);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 0);
});

test('single-flight：flush 进行中再次触发返回 alreadyRunning，不产生第二个工作器', async () => {
  zyxGameModule.enqueuePendingRoundSettlement(validRecord('round_a'));
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const firstFlush = sync.flushPendingRoundSettlements(async () => {
    await gate;
    return {};
  }, {});
  const secondFlush = await sync.flushPendingRoundSettlements(async () => ({}), {});
  assert.strictEqual(secondFlush.alreadyRunning, true);
  release();
  const firstOutcome = await firstFlush;
  assert.strictEqual(firstOutcome.alreadyRunning, false);
  assert.strictEqual(firstOutcome.submitted, 1);
  assert.strictEqual(zyxGameModule.getPendingRoundSettlements().length, 0);
});
