const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
let source, config, layout;
test.before(() => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-bean-hud-'));
    try {
        execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc',
            'assets/script/zyxGame/BeanCollectionHud.ts', 'assets/script/manager/ResponsiveLayout.ts',
            '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck'], { stdio: 'pipe' });
    } catch (_) { /* Cocos 类型在独立编译中不可见。 */ }
    source = fs.readFileSync(path.join(out, 'zyxGame/BeanCollectionHud.js'), 'utf8');
    config = require(path.join(out, 'dataModule/MoodBeanConfig.js'));
    layout = require(path.join(out, 'manager/ResponsiveLayout.js'));
});

function harness() {
    const tweens = [];
    class Node {
        constructor(name) { Object.assign(this, { name, children: [], isValid: true, scale: 1 }); }
        addChild(node) { this.children.push(node); node.parent = this; }
        setContentSize(width, height) { Object.assign(this, { width, height }); }
        getChildByName(name) { return this.children.find(n => n.name === name); }
        setPosition(x, y) { Object.assign(this, { x, y }); }
        addComponent() { return { clear() {}, circle() {}, arc() {}, stroke() {} }; }
        destroy() { this.isValid = false; }
    }
    const ui = {
        createRect(parent, name, width, height, _color, _alpha, _r, x, y) {
            const node = new Node(name); Object.assign(node, { width, height, x, y }); parent.addChild(node); return node;
        },
        createLabel(parent, string, x, y, fontSize, _color, width, height) {
            const node = new Node('label'); Object.assign(node, { x, y, width, height }); parent.addChild(node);
            return { node, string, fontSize, enableWrapText: true };
        },
    };
    const exported = {};
    vm.runInNewContext(source, {
        exports: exported,
        require(name) {
            if (name.endsWith('MoodBeanConfig')) return config;
            if (name.endsWith('UIManager')) return { uimanager: ui };
            if (name.endsWith('AssetLoader')) return { ASSET_PATHS: { game: {} }, getSpriteFrame: () => ({}), getBitmapFont: () => ({}) };
            if (name.endsWith('GamePanel')) return {
                createGamePanel(parent, name, width, height, x = 0) { const n = new Node(name); n.setContentSize(width, height); n.setPosition(x, 0); parent.addChild(n); return n; },
                resizeGamePanel(node, width, height) { node.setContentSize(width, height); },
            };
            return { createMoodBeanMascot(parent, x, y) { const n = new Node('mascot'); n.setPosition(x, y); parent.addChild(n); return n; } };
        },
        cc: {
            Node, Color: class {}, Sprite: { SizeMode: { CUSTOM: 1 } }, Graphics: { LineCap: { ROUND: 1 } }, isValid: (node) => node && node.isValid,
            Tween: { stopAllByTarget(target) { for (const t of tweens) if (t.target === target) t.stopped = true; } },
            tween(target) {
                const t = { target, steps: [], stopped: false,
                    to(_duration, values, options) { this.steps.push(() => { Object.assign(target, values); if (options && options.onUpdate) options.onUpdate(); }); return this; },
                    call(callback) { this.steps.push(callback); return this; }, delay() { this.steps.push(() => {}); return this; }, start() { return this; },
                    step() { if (!this.stopped && this.steps.length) this.steps.shift()(); },
                    finish() { while (!this.stopped && this.steps.length) this.step(); },
                };
                tweens.push(t); return t;
            },
        },
    });
    const hud = new exported.default(new Node('hud'), 89, 442);
    return { hud, tweens, formatScore: exported.formatHudScore,
        advance: () => tweens.filter(t => t.target === hud.state && !t.stopped && t.steps.length).at(-1) };
}

test('极大分数使用万/亿保持可读，不四舍五入夸大分数', () => {
    const { formatScore } = harness();
    for (const [value, text] of [[0,'0'], [2400,'2400'], [999999,'999999'],
        [1000000,'100万'], [1234567,'123.45万'], [100000000,'1亿'], [999999999,'9.99亿']]) {
        assert.equal(formatScore(value), text);
    }
});

test('收集动画合并连续到达，满格短暂停留，多颗奖励不丢失且余量结转', () => {
    const { hud, advance } = harness();
    hud.complete(99);
    hud.collectTo(100);
    hud.collectTo(201);
    const first = advance();
    first.step(); first.step();
    assert.equal(hud.percent.string, '100%');
    assert.equal(hud.count.string, '本局 +1');
    assert.equal(hud.goal.node.opacity, 0);
    assert.ok(hud.reward.y + hud.reward.height / 2 <= hud.root.height / 2);
    assert.ok(hud.reward.y - hud.reward.height / 2 >= -hud.root.height / 2);
    first.finish();
    const second = advance();
    second.step(); second.step();
    assert.equal(hud.percent.string, '100%');
    assert.equal(hud.count.string, '本局 +2');
    second.finish();
    advance().finish();
    assert.equal(hud.percent.string, '1%');
    assert.equal(hud.count.string, '本局 +2');
});

test('结束或离场中断展示动画，不得回跳计数或继续改 UI', () => {
    const { hud, advance } = harness();
    hud.collectTo(100);
    const old = advance();
    hud.complete(201);
    assert.equal(hud.goal.node.opacity, 255);
    old.finish();
    assert.equal(hud.percent.string, '1%');
    assert.equal(hud.count.string, '本局 +2');
    hud.dispose();
    hud.collectTo(30000);
    assert.equal(hud.count.string, '本局 +2');
});

test('父组件销毁时子节点与Label.node已释放，dispose仍安全且不继续渲染', () => {
    const { hud, advance, tweens } = harness();
    hud.collectTo(100);
    const animation = advance();
    animation.step(); animation.step(); // 满格奖励文字仍在场上。
    for (const node of [hud.root, hud.icon, hud.badge, hud.reward]) node.isValid = false;
    hud.percent.node = null;
    hud.goal.node = null;
    assert.doesNotThrow(() => hud.dispose());
    assert.doesNotThrow(() => hud.dispose());
    for (const tween of tweens) assert.doesNotThrow(() => tween.finish());
    assert.doesNotThrow(() => hud.complete(232));
    assert.doesNotThrow(() => hud.resize(498));
    assert.equal(hud.animating, false);
    assert.equal(hud.reward, null);
});

test('大数字固定边界且不换行；手机、平板和折叠分区缩放后 HUD 在舞台内', () => {
    const { hud } = harness();
    for (const blocks of [9999, 999999, 999999999]) {
        hud.complete(blocks);
        assert.equal(hud.root.width, 442);
        assert.equal(hud.percent.enableWrapText, false);
        assert.equal(hud.count.enableWrapText, false);
        assert.ok(hud.count.fontSize <= 24);
        for (const label of [hud.percent, hud.count]) {
            assert.ok(Math.abs(label.node.x) + label.node.width / 2 <= label.node.parent.width / 2);
        }
    }
    for (const width of [450, 498, 546]) {
        hud.resize(width);
        assert.equal(hud.root.width, width);
        assert.ok(hud.percent.node.x + hud.percent.node.width / 2 <= width / 2 - 24);
        assert.ok(hud.badge.x - hud.badge.width / 2 >= -width / 2 + 20);
    }
    for (const [width, height] of [[320,568],[390,844],[768,1024],[540,900],[1024,768]]) {
        const stage = layout.calculateStageLayout({ x: 0, y: 0, width, height }, true);
        assert.ok(738 * stage.scale <= width, `${width}x${height} HUD 越界`);
        assert.ok(148 * stage.scale <= height);
    }
});
