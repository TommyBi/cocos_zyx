const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
let Grid;
test.before(() => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-drag-'));
  global.cc = {
    _decorator: { ccclass: (cls) => cls }, Component: class {},
    tween: () => ({ to() { return this; }, start() {} }),
  };
  try {
    execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/zyxGame/ZyxGridCom.ts', '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--experimentalDecorators', '--skipLibCheck'], { stdio: 'pipe' });
  } catch (_) { /* Cocos 全局类型不参与独立编译，验证生成的行为。 */ }
  Grid = require(path.join(out, 'zyxGame/ZyxGridCom.js')).default;
});
test('舞台缩放和平移后，手指移动一格仍只移动一个逻辑格', () => {
  for (const scale of [0.48, 0.7, 1, 1.25]) {
    const grid = new Grid();
    grid.node = { x: 0, parent: { convertToNodeSpaceAR: (point) => ({ x: (point.x - 90) / scale }) }, getChildByName: () => null };
    let moved;
    grid.initialize(7, 80, { canInteract: () => true, onInteract() {}, getMoveRange: () => ({ min: -3, max: 3 }), onMove: (id, offset) => { moved = { id, offset }; }, onTap() {} });
    const event = (x) => ({ touch: { getLocation: () => ({ x, y: 0 }) } });
    grid.onTouchStart(event(90));
    grid.onTouchMove(event(90 + 80 * scale));
    assert.ok(Math.abs(grid.node.x - 80) < 0.000001);
    grid.onTouchEnd(event(90 + 80 * scale));
    assert.deepEqual(moved, { id: 7, offset: 1 });
  }
});
