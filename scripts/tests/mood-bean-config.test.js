/**
 * 心情豆集中配置与官方拼画确定性填充顺序的单元测试。
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

test('官方拼画结构参数：650×780 画作，130×156 共 20,280 豆位', () => {
  assert.strictEqual(config.ART_IMAGE_WIDTH, 650);
  assert.strictEqual(config.ART_IMAGE_HEIGHT, 780);
  assert.strictEqual(config.ART_CELL_PIXELS, 5);
  assert.strictEqual(config.ART_CELL_BLOCK, 4);
  assert.strictEqual(config.ART_CELL_GAP, 1);
  assert.strictEqual(config.ART_GRID_COLS, 130);
  assert.strictEqual(config.ART_GRID_ROWS, 156);
  assert.strictEqual(config.ART_TOTAL_CELLS, 20280);
  assert.strictEqual(config.ART_PREVIEW_WIDTH, 130);
  assert.strictEqual(config.ART_PREVIEW_HEIGHT, 156);
});

test('一块一豆：固定语义常量存在且为 1', () => {
  assert.strictEqual(config.MOOD_BEANS_PER_MOOD_BLOCK, 1);
});

test('填充顺序是 0..20279 的完整无重复排列', () => {
  const order = config.buildArtFillOrder('album_season_art_0');
  assert.strictEqual(order.length, 20280);
  const seen = new Set(order);
  assert.strictEqual(seen.size, 20280);
  for (let rank = 0; rank < 20280; rank++) {
    assert.ok(order[rank] >= 0 && order[rank] < 20280);
  }
});

test('同一画作在任何重进情况下填充顺序一致', () => {
  const first = config.buildArtFillOrder('album_season_art_0');
  const second = config.buildArtFillOrder('album_season_art_0');
  assert.deepStrictEqual(Array.from(first), Array.from(second));
});

test('填充顺序为行优先：从上到下、从左到右一排一排依次揭开', () => {
  const order = config.buildArtFillOrder('album_season_art_0');
  // rank 与豆位序号完全一致：rank = row * 130 + col。
  for (let rank = 0; rank < 20280; rank++) {
    assert.strictEqual(order[rank], rank);
  }
  // 第 0 排（豆位 0..129）必须最先填满，其次第 1 排（130..259）。
  for (let col = 0; col < 130; col++) {
    assert.strictEqual(order[col], col, `第 0 排第 ${col} 列应第 ${col} 个揭开`);
    assert.strictEqual(order[130 + col], 130 + col, `第 1 排第 ${col} 列应第 ${130 + col} 个揭开`);
  }
});

test('所有画作使用相同的行优先填充顺序', () => {
  const first = config.buildArtFillOrder('album_season_art_0');
  const second = config.buildArtFillOrder('album_city_art_3');
  assert.deepStrictEqual(Array.from(first), Array.from(second));
});

test('cell→rank 逆映射与填充顺序完全一致', () => {
  const artId = 'album_city_art_3';
  const order = config.buildArtFillOrder(artId);
  const ranks = config.buildArtCellRanks(artId);
  assert.strictEqual(ranks.length, 20280);
  for (let rank = 0; rank < 20280; rank++) {
    assert.strictEqual(ranks[order[rank]], rank);
  }
});

test('在屏飞行视觉豆上限不超过 120', () => {
  assert.ok(Number.isInteger(config.MAX_VISUAL_FLY_BEANS));
  assert.ok(config.MAX_VISUAL_FLY_BEANS >= 1);
  assert.ok(config.MAX_VISUAL_FLY_BEANS <= 120);
});
