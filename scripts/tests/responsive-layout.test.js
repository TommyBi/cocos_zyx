const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const source = path.resolve(__dirname, '../../assets/script/manager/ResponsiveLayout.ts');
let layout;

test.before(() => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-responsive-'));
  try {
    execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', source,
      '--outDir', output, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck'], { stdio: 'pipe' });
  } catch (_error) {
    // 仓库的 Node 类型定义与此编译版本不完全一致；只需本文件产出供几何测试使用。
  }
  assert.ok(fs.existsSync(path.join(output, 'ResponsiveLayout.js')));
  layout = require(path.join(output, 'ResponsiveLayout.js'));
});

test('按实际宽高比切换固定宽度与固定高度', () => {
  assert.equal(layout.shouldFitHeight(390, 844), false);
  assert.equal(layout.shouldFitHeight(1294, 1809), true);
  assert.equal(layout.shouldFitHeight(820, 1180), true);
  assert.equal(layout.shouldFitHeight(1024, 768), true);
});

test('手机、平板和横屏舞台始终保留完整的设计高度与操作宽度', () => {
  assert.deepEqual(layout.calculateStageLayout({ x: 0, y: 0, width: 750, height: 1334 }, false),
    { x: 0, y: 0, width: 750, height: 1334, scale: 1 });
  assert.deepEqual(layout.calculateStageLayout({ x: 0, y: 0, width: 1778, height: 1334 }, false),
    { x: 0, y: 0, width: 900, height: 1334, scale: 1 });
  assert.deepEqual(layout.calculateStageLayout({ x: 0, y: 0, width: 1778, height: 1334 }, true),
    { x: 0, y: 0, width: 750, height: 1390, scale: 1334 / 1390 });
});

test('双屏优先把主舞台放在单个分区内，不跨铰链', () => {
  const left = { x: 0, y: 0, width: 580, height: 800 };
  const right = { x: 620, y: 0, width: 580, height: 800 };
  const selected = layout.chooseViewportSegment([left, right]);
  assert.deepEqual(selected, left);
  const world = layout.segmentToWorld(selected, 1200, 800, 2001, 1334);
  const stage = layout.calculateStageLayout(world, true);
  assert.ok(stage.x + stage.width * stage.scale / 2 <= world.x + world.width / 2);
  assert.ok(stage.x - stage.width * stage.scale / 2 >= world.x - world.width / 2);
  assert.equal(layout.chooseViewportSegment([left]), null);
});

test('上下分区高度不足时舞台等比缩小到可用区域', () => {
  const stage = layout.calculateStageLayout({ x: 0, y: 300, width: 750, height: 600 }, true);
  assert.ok(stage.scale < 1);
  assert.ok(stage.height * stage.scale <= 600);
  assert.ok(stage.width * stage.scale <= 750);
});


test('刘海屏、胶囊、平板和折叠分区：所有局内区域有间隔且位于安全区', () => {
  const devices = [
    [375, 667, 0, 0, 32], [390, 844, 47, 34, 87], [414, 896, 44, 34, 96],
    [430, 932, 59, 34, 99], [768, 1024, 24, 20, 64], [1024, 768, 24, 20, 64],
    [540, 720, 24, 20, 64],
  ];
  for (const [width, height, top, bottom, menuBottom] of devices) {
    const worldScale = Math.max(750 / width, 1334 / height);
    const w = width * worldScale, h = height * worldScale;
    const safe = { top: top * worldScale, bottom: bottom * worldScale, menuBottom: menuBottom * worldScale, left: 0, right: 0 };
    const region = layout.insetGameRegion({ x: 0, y: 0, width: w, height: h }, w, h, safe);
    const stage = layout.calculateStageLayout(region, true);
    const pos = layout.calculateGameLayout(stage.height, 800);
    const boxes = [
      [pos.hudY - 53, pos.hudY + 53], [pos.boardY - 412, pos.boardY + 412],
      [pos.nextY - 60, pos.nextY + 60], [pos.toolY - 74, pos.toolY + 74],
      [pos.footerY - 40, pos.footerY + 40],
    ];
    boxes.forEach(([low, high], index) => {
      assert.ok(low >= -stage.height / 2, `${width}x${height}: 区域${index}底部越界`);
      assert.ok(high <= stage.height / 2, `${width}x${height}: 区域${index}顶部越界`);
      if (index) assert.ok(boxes[index - 1][0] - high >= 16, `${width}x${height}: 区域${index}重叠`);
    });
    assert.ok(stage.y + stage.height * stage.scale / 2 <= h / 2 - safe.menuBottom + 0.000001);
    assert.ok(stage.y - stage.height * stage.scale / 2 >= -h / 2 + safe.bottom - 0.000001);
  }
});
