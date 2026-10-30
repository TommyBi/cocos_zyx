/**
 * 开心豆与存档配置的单元测试。
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
const configSource = path.join(repoRoot, 'assets', 'script', 'dataModule', 'MoodBeanConfig.ts');

let config;

test.before(() => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-config-test-'));
  try {
    execFileSync('npx', [
      '--yes', '-p', 'typescript@4.9.5', 'tsc', configSource,
      '--outDir', outDir,
      '--module', 'commonjs',
      '--target', 'es2017',
      '--skipLibCheck',
    ], { stdio: 'pipe' });
  } catch (error) {
    // 以产物为准。
  }
  const compiled = path.join(outDir, 'MoodBeanConfig.js');
  assert.ok(fs.existsSync(compiled), `tsc 未产出 ${compiled}`);
  config = require(compiled);
});

test('一块一豆：固定语义常量存在且为 1', () => {
  assert.strictEqual(config.MOOD_BEANS_PER_MOOD_BLOCK, 1);
});

test('继续使用当前数据代际，保留已有消除进度', () => {
  assert.strictEqual(config.DATA_GENERATION, 'mood_bean_v1');
  assert.strictEqual(config.MOOD_BEAN_BALANCE_KEY, 'zyx_mood_bean_balance');
  assert.strictEqual(config.PENDING_ROUND_SETTLEMENTS_KEY, 'zyx_pending_round_settlements');
});
