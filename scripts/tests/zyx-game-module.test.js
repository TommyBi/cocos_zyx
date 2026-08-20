/**
 * ZyxGameModule 存档迁移与持久化读取的单元测试。
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
let HAPPY_BOTTLE_TARGET;

/** Map 版 localStorage：键缺失时与真实环境一致返回 null（Number(null) === 0 正是本次修复的陷阱）。 */
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
  HAPPY_BOTTLE_TARGET = moduleExports.HAPPY_BOTTLE_TARGET;
});

function createModule(store) {
  store.clear();
  return new ZyxGameModuleClass();
}

test('缺键时使用默认值，不误判为 0 进度', () => {
  const store = installCcStub();
  const module = createModule(store);
  module.refreshPersistentProgress();
  assert.strictEqual(module.level, 1);
  assert.strictEqual(module.experience, 0);
  assert.strictEqual(module.happyBottleCount, 0);
  assert.strictEqual(module.happyBottleProgress, 0);
});

test('仅有旧日进度键时按目标折算为整瓶与余量（readNumber fallback 回归）', () => {
  const store = installCcStub();
  const module = createModule(store);
  store.set('zyx_daily_moods', '200');
  module.refreshPersistentProgress();
  const expectedBottles = Math.floor(200 / HAPPY_BOTTLE_TARGET);
  assert.strictEqual(module.happyBottleCount, expectedBottles);
  assert.strictEqual(module.happyBottleProgress, 200 % HAPPY_BOTTLE_TARGET);
  // 迁移结果应写回永久进度键。
  assert.strictEqual(store.get('zyx_happy_bottle_count'), String(expectedBottles));
  assert.strictEqual(store.get('zyx_current_happy_bottle_progress'), String(200 % HAPPY_BOTTLE_TARGET));
});

test('二级旧键 zyx_daily_wish 也能迁移', () => {
  const store = installCcStub();
  const module = createModule(store);
  store.set('zyx_daily_wish', String(HAPPY_BOTTLE_TARGET + 4));
  module.refreshPersistentProgress();
  assert.strictEqual(module.happyBottleCount, 1);
  assert.strictEqual(module.happyBottleProgress, 4);
});

test('当前进度键存在时优先于旧键', () => {
  const store = installCcStub();
  const module = createModule(store);
  store.set('zyx_current_happy_bottle_progress', '5');
  store.set('zyx_daily_moods', '200');
  store.set('zyx_happy_bottle_count', '7');
  module.refreshPersistentProgress();
  assert.strictEqual(module.happyBottleCount, 7);
  assert.strictEqual(module.happyBottleProgress, 5);
});

test('非法字符串与缺失键一样回退到 fallback', () => {
  const store = installCcStub();
  const module = createModule(store);
  store.set('zyx_level', 'abc');
  store.set('zyx_experience', '');
  module.refreshPersistentProgress();
  assert.strictEqual(module.level, 1);
  assert.strictEqual(module.experience, 0);
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
