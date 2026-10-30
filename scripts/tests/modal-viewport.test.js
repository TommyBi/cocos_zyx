const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
let UIManager;
test.before(() => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-modal-'));
  global.cc = { Color: class {}, Canvas: class {}, v2: (x, y) => ({ x, y }) };
  try {
    execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/manager/UIManager.ts', '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck'], { stdio: 'pipe' });
  } catch (_) { /* 独立编译不载入 Cocos 类型，使用生成的 JS 验证几何行为。 */ }
  UIManager = require(path.join(out, 'UIManager.js')).default;
});

class Node {
  constructor(parent = null, x = 0, y = 0, scale = 1) { Object.assign(this, { parent, x, y, scale, isValid: true }); }
  convertToWorldSpaceAR(p) {
    const local = { x: this.x + p.x * this.scale, y: this.y + p.y * this.scale };
    return this.parent ? this.parent.convertToWorldSpaceAR(local) : local;
  }
  convertToNodeSpaceAR(p) {
    const local = this.parent ? this.parent.convertToNodeSpaceAR(p) : p;
    return { x: (local.x - this.x) / this.scale, y: (local.y - this.y) / this.scale };
  }
  setPosition(x, y) { Object.assign(this, { x, y }); }
  setContentSize(width, height) { Object.assign(this, { width, height }); }
  getComponent(type) { return this.isCanvas && type === cc.Canvas ? {} : null; }
}

test('安全区、缩放、偏移与窗口变化后，弹窗遮罩始终覆盖完整画布', () => {
  const canvas = new Node(null, 320, 480);
  canvas.isCanvas = true;
  const stage = new Node(canvas);
  const modal = new Node(stage);
  const mask = new Node(modal);
  modal.getChildByName = () => mask;
  const ui = new UIManager();
  ui.scene = stage;
  ui.modal = modal;
  ui.drawRect = () => {};
  for (const [width, height, x, y, scale] of [[750, 1623, 0, -50, 1], [750, 1334, 0, -40, 0.8], [1778, 1334, -450, 60, 0.6], [750, 1623, 0, -50, 1]]) {
    cc.winSize = { width, height };
    Object.assign(stage, { x, y, scale });
    ui.refreshModalLayout();
    for (const sign of [-1, 1]) {
      const actual = mask.convertToWorldSpaceAR({ x: sign * mask.width / 2, y: sign * mask.height / 2 });
      const expected = canvas.convertToWorldSpaceAR({ x: sign * width / 2, y: sign * height / 2 });
      assert.ok(Math.abs(actual.x - expected.x) < 0.000001);
      assert.ok(Math.abs(actual.y - expected.y) < 0.000001);
    }
    assert.equal(modal.x, 0);
    assert.equal(modal.y, 0);
  }
  // 启动页初始化时 UI 宿主就是 Canvas，而不是其内部的安全区舞台。
  ui.scene = canvas;
  modal.parent = canvas;
  ui.refreshModalLayout();
  assert.equal(mask.x, 0);
  assert.equal(mask.y, 0);
  assert.equal(mask.width, cc.winSize.width);
  assert.equal(mask.height, cc.winSize.height);
});
