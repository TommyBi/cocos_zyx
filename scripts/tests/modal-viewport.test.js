const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
let UIManager;
let formatDisplayNickname;
test.before(() => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-modal-'));
  global.cc = { Color: class {}, Canvas: class {}, v2: (x, y) => ({ x, y }) };
  try {
    execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/manager/UIManager.ts', '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck'], { stdio: 'pipe' });
  } catch (_) { /* 独立编译不载入 Cocos 类型，使用生成的 JS 验证几何行为。 */ }
  const exported = require(path.join(out, 'UIManager.js'));
  UIManager = exported.default;
  formatDisplayNickname = exported.formatDisplayNickname;
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

test('共用按钮统一棕色与打包字体字重，结算奖励不展示云端到账小字', () => {
  const uiSource = fs.readFileSync(path.join(__dirname, '../../assets/script/manager/UIManager.ts'), 'utf8');
  const gameSource = fs.readFileSync(path.join(__dirname, '../../assets/script/zyxGame/ZyxGame.ts'), 'utf8');
  const buttonStart = uiSource.indexOf('public createButton(');
  const buttonEnd = uiSource.indexOf('public drawButtonSurface(', buttonStart);
  const buttonFactory = uiSource.slice(buttonStart, buttonEnd);
  assert.ok(buttonStart >= 0 && buttonEnd > buttonStart);
  assert.match(buttonFactory, /BUTTON_TEXT_COLOR/);
  assert.match(buttonFactory, /this\.applyTypography\(label, true\)/);
  assert.doesNotMatch(buttonFactory, /label\.enableBold = true/);
  assert.doesNotMatch(buttonFactory, /cc\.Color\.WHITE/);
  assert.doesNotMatch(gameSource, /本局收集 · 到账以云端为准/);
});

test('全游戏昵称最多展示7个字，超出部分使用三个点截断', () => {
  assert.equal(formatDisplayNickname('美丽的企鹅'), '美丽的企鹅');
  assert.equal(formatDisplayNickname('一二三四五六七'), '一二三四五六七');
  assert.equal(formatDisplayNickname('一二三四五六七八九'), '一二三四五六七...');
  assert.equal(formatDisplayNickname('一二三四五六😀八'), '一二三四五六😀...');
  const mainSource = fs.readFileSync(path.join(__dirname, '../../assets/script/GameMainScene.ts'), 'utf8');
  const boardSource = fs.readFileSync(path.join(__dirname, '../../assets/script/zyxGame/LeaderboardPanel.ts'), 'utf8');
  assert.match(mainSource, /formatDisplayNickname\(profile\.nickname\)/);
  assert.match(boardSource, /formatDisplayNickname\(entry\.nickname\)/);
});

test('首页头像节点完整创建，排行榜和关闭按钮保持统一实现', () => {
  const uiSource = fs.readFileSync(path.join(__dirname, '../../assets/script/manager/UIManager.ts'), 'utf8');
  const boardSource = fs.readFileSync(path.join(__dirname, '../../assets/script/zyxGame/LeaderboardPanel.ts'), 'utf8');
  const artSource = fs.readFileSync(path.join(__dirname, '../../assets/script/zyxGame/MoodArt.ts'), 'utf8');
  const mainSource = fs.readFileSync(path.join(__dirname, '../../assets/script/GameMainScene.ts'), 'utf8');
  assert.match(mainSource, /this\.profileAvatarContent = new cc\.Node\('avatarContent'\)/);
  assert.match(boardSource, /applyRoundedAvatarMask\(mask(?:,|\))/);
  assert.match(boardSource, /uimanager\.showModal\('排行榜'/);
  assert.match(boardSource, /true,\s*640,\s*\{/);
  assert.match(artSource, /mask\.type = cc\.Mask\.Type\.IMAGE_STENCIL/);
  const closeStart = uiSource.indexOf('private createModalCloseButton(');
  const closeEnd = uiSource.indexOf('private createModalTitlePlate(', closeStart);
  const closeButton = uiSource.slice(closeStart, closeEnd);
  assert.match(closeButton, /this\.createRect\(/);
  assert.match(closeButton, /graphics\.roundRect\(/);
  assert.match(closeButton, /graphics\.lineCap = cc\.Graphics\.LineCap\.ROUND/);
  assert.doesNotMatch(closeButton, /this\.createCircle\(|createLabel\(button, '×'/);
});

test('弹窗关闭使用快速缩小淡出，并在动画后销毁旧层级', () => {
  const panel = {};
  const mask = {};
  const root = {
    isValid: true,
    zIndex: 2000,
    destroyed: false,
    getChildByName: (name) => name === 'panel' ? panel : mask,
    destroy() { this.destroyed = true; this.isValid = false; },
  };
  const calls = [];
  const previous = { tween: cc.tween, Tween: cc.Tween, isValid: cc.isValid };
  cc.Tween = { stopAllByTarget: (target) => calls.push(['stop', target]) };
  cc.isValid = (target) => target.isValid;
  cc.tween = (target) => ({
    to(duration, properties, options) { calls.push(['to', target, duration, properties, options]); return this; },
    delay(duration) { calls.push(['delay', target, duration]); return this; },
    call(callback) { callback(); return this; },
    start() { return this; },
  });
  try {
    const ui = new UIManager();
    ui.modal = root;
    ui.closeModal();
    assert.equal(ui.modal, null);
    assert.equal(root.zIndex, 1999);
    assert.ok(calls.some((call) => call[0] === 'to' && call[1] === panel && call[2] === 0.14 && call[3].scale === 0.86 && call[3].opacity === 0));
    assert.ok(calls.some((call) => call[0] === 'to' && call[1] === mask && call[3].opacity === 0));
    assert.equal(root.destroyed, true);
  } finally {
    cc.tween = previous.tween;
    cc.Tween = previous.Tween;
    cc.isValid = previous.isValid;
  }
});
