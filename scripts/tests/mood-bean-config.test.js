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

test('每块推进1%，每100块一颗，满格后保留余量', () => {
  assert.equal(config.MOOD_BLOCKS_PER_PERCENT, 1);
  assert.equal(config.MOOD_BLOCKS_PER_BEAN, 100);
  for (const [blocks, beans, percent] of [[0,0,'0%'],[1,0,'1%'],[99,0,'99%'],[100,1,'0%'],[101,1,'1%'],[9999,99,'99%'],[10000,100,'0%'],[20001,200,'1%'],[999999,9999,'99%']]) {
    const state = config.getMoodCollection(blocks);
    assert.equal(state.beans, beans);
    assert.equal(state.percent, percent);
  }
});

test('发布重置使用新代际，后续保留新档', () => {
  assert.strictEqual(config.DATA_GENERATION, 'mood_bean_v5_20261112');
  assert.strictEqual(config.MOOD_BEAN_BALANCE_KEY, 'zyx_mood_bean_balance');
  assert.strictEqual(config.PENDING_ROUND_SETTLEMENTS_KEY, 'zyx_pending_round_settlements');
});
