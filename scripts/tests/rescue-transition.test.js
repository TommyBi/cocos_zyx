const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
let gameSource;
let responsiveLayout;
test.before(() => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-rescue-transition-'));
    try {
        execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/zyxGame/ZyxGame.ts',
            '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck', '--experimentalDecorators'], { stdio: 'pipe' });
    } catch (_) { /* 独立编译不载入 Cocos 类型，使用产物验证交互时序。 */ }
    gameSource = fs.readFileSync(path.join(out, 'zyxGame/ZyxGame.js'), 'utf8');
    responsiveLayout = require(path.join(out, 'manager/ResponsiveLayout.js'));
});

function harness() {
    const tweens = [];
    const events = [];
    const explanation = { isValid: true, destroy() { this.isValid = false; events.push('explanation'); } };
    const drawer = { x: 309, getChildByName: () => explanation.isValid ? explanation : null };
    const mask = { x: 0, width: 750, active: true };
    const prompt = {
        isValid: true,
        getChildByName: (name) => ({ roundRescueDrawer: drawer, roundRescueMask: mask, roundRescueLight: {} }[name]),
        destroy() { this.isValid = false; events.push('destroy'); },
    };
    const exported = {};
    vm.runInNewContext(gameSource, {
        exports: exported,
        cc: {
            _decorator: { ccclass: (value) => value }, Color: class {}, Component: class {},
            isValid: (node) => node.isValid !== false,
            Tween: { stopAllByTarget() {} },
            tween(target) {
                const tween = { target, moves: [], to(duration, properties, options) { this.moves.push({ duration, properties, options }); return this; }, call(callback) { this.done = callback; return this; }, start() { return this; } };
                tweens.push(tween); return tween;
            },
        },
        require: (name) => name.endsWith('ResponsiveLayout') ? responsiveLayout : {},
    });
    const game = new exported.default();
    game.node = { isValid: true, width: 750 };
    game.locked = false;
    game.roundRescuePrompt = prompt;
    game.roundRescueInteractive = true;
    game.roundRescueGuideVisible = true;
    game.roundRescueCountdownState = { progress: 0.5 };
    game.setToolSelectionMode = () => events.push('selection');
    game.requestRoundRescue = () => events.push('reward');
    return { game, tweens, events, prompt, drawer, explanation, mask };
}

test('点击倒计时按钮先收回抽屉再撤罩，最后请求奖励；重复点击不重复触发', () => {
    const { game, tweens, events, drawer, mask } = harness();
    game.handleRoundRescueClick();
    game.handleRoundRescueClick();
    assert.equal(tweens.length, 1);
    assert.equal(tweens[0].target, drawer);
    assert.deepEqual(events, []);
    tweens[0].done();
    assert.equal(tweens[1].target, mask);
    assert.deepEqual(events, []);
    tweens[1].done();
    assert.deepEqual(events, ['destroy', 'selection', 'reward']);
    assert.equal(game.roundRescuePrompt, null);
    assert.equal(game.roundRescueCountdownState, null);
});

test('我可以只收起说明和遮罩，保留倒计时按钮；之后点击按钮才请求奖励', () => {
    const { game, tweens, events, prompt, explanation, drawer, mask } = harness();
    game.acknowledgeRoundRescue();
    game.acknowledgeRoundRescue();
    assert.equal(tweens.length, 1);
    assert.equal(tweens[0].target, explanation);
    tweens[0].done();
    assert.equal(tweens[1].target, mask);
    assert.deepEqual(events, ['explanation']);
    tweens[1].done();
    assert.equal(mask.active, false);
    assert.equal(prompt.isValid, true);
    assert.equal(game.roundRescueCountdownState.progress, 0.5);
    assert.equal(game.roundRescueInteractive, true);
    assert.equal(game.roundRescueGuideVisible, false);
    assert.equal(game.locked, false);
    assert.deepEqual(events, ['explanation']);
    game.handleRoundRescueClick();
    assert.equal(tweens[2].target, drawer);
    tweens[2].done();
    tweens[3].done();
    assert.deepEqual(events, ['explanation', 'destroy', 'selection', 'reward']);
});

test('窗口变化后棋盘、边框、下一排和危险光效同轴，追赶底板保持垂直居中', () => {
    const { game } = harness();
    const node = (x = 0, y = 0) => ({ x, y, setPosition(x, y) { Object.assign(this, { x, y }); } });
    game.layout = responsiveLayout.calculateGameLayout(1390, 760);
    const parts = {
        boardShadow: node(42, game.layout.boardY - 6),
        boardFrame: node(42, game.layout.boardY),
        nextRow: node(42, game.layout.nextY),
    };
    game.node = { width: 750, height: 1390, getChildByName: (name) => parts[name] || null };
    game.hudRoot = node();
    game.footerRoot = node();
    game.boardRoot = node();
    game.boardDangerHalo = node();
    game.rankChase = Object.assign(node(), { root: { width: 88 }, setExpansion() {}, setBookmarkVisible(_, done) { if (done) done(); } });
    game.rankExpansion.progress = 1;
    game.roundRescuePrompt = null;
    for (const height of [1560, 1390, 1480]) {
        game.node.height = height;
        game.refreshLayout();
        assert.equal(game.boardRoot.x, 42);
        assert.equal(parts.boardFrame.x, game.boardRoot.x);
        assert.equal(parts.boardShadow.x, game.boardRoot.x);
        assert.equal(parts.nextRow.x, game.boardRoot.x);
        assert.equal(game.boardDangerHalo.x, game.boardRoot.x);
        assert.equal(game.boardDangerHalo.y, game.boardRoot.y);
        assert.equal(parts.boardFrame.y, game.boardRoot.y);
        assert.equal(parts.boardShadow.y, game.boardRoot.y - 6);
        assert.equal(game.rankChase.y, game.boardRoot.y);
        assert.ok(game.rankChase.x < game.boardRoot.x);
    }
});

test('收展共用进度：棋盘和下一排居中/右移，中途反向不跳位', () => {
    const { game, tweens } = harness();
    const node = () => ({ x: 0, y: 0, setPosition(x, y) { Object.assign(this, { x, y }); } });
    const parts = { boardShadow: node(), boardFrame: node(), nextRow: node() };
    game.node = { isValid: true, width: 750, height: 1390, getChildByName: (name) => parts[name] || null };
    game.layout = responsiveLayout.calculateGameLayout(1390, 760);
    game.boardRoot = node();
    game.tutorialGuideRoot = node();
    game.boardDangerHalo = node();
    const reveals = [];
    game.rankChase = Object.assign(node(), { root: { width: 88 }, setExpansion(...args) { reveals.push(args); }, setBookmarkVisible(_, done) { if (done) done(); } });
    game.applyRankLayout();
    assert.equal(game.boardRoot.x, 0);
    assert.ok(game.rankChase.x + 44 < -375);
    game.setRankExpanded(true, 0.76);
    const expand = tweens[0];
    assert.equal(expand.moves[0].duration, 0.76);
    assert.equal(expand.moves[0].properties.progress, 1);
    game.rankExpansion.progress = 0.4;
    expand.moves[0].options.onUpdate();
    for (const part of [game.boardRoot, game.tutorialGuideRoot, game.boardDangerHalo, ...Object.values(parts)]) {
        assert.equal(part.x, 42 * 0.4);
    }
    assert.equal(reveals.at(-1)[0], 0.4);
    const before = game.boardRoot.x;
    game.setRankExpanded(false);
    assert.equal(game.boardRoot.x, before);
    assert.equal(tweens[1].target, expand.target);
    assert.equal(tweens[1].moves[0].properties.progress, 0);
    game.rankExpansion.progress = 0;
    tweens[1].moves[0].options.onUpdate();
    assert.equal(game.boardRoot.x, 0);
    assert.equal(reveals.at(-1)[1], -351);
    game.hudRoot = node(); game.footerRoot = node(); game.roundRescuePrompt = null;
    game.node.height = 1560;
    game.refreshLayout();
    assert.equal(game.boardRoot.x, 0);
    assert.equal(game.rankChase.y, game.boardRoot.y);
    game.setRankExpanded(true);
    game.rankExpansion.progress = 1;
    tweens[2].done();
    assert.equal(game.boardRoot.x, 42);
    assert.equal(game.rankChase.x, game.layout.rankX);
});

test('页签先收完才展开面板；面板完全收起才弹出页签，过期回调不抢状态', () => {
    const { game, tweens } = harness();
    const bookmarkCalls = [];
    game.rankChase = { setBookmarkVisible(visible, done) { bookmarkCalls.push({ visible, done }); } };
    game.applyRankLayout = () => {};
    game.setRankExpanded(true);
    assert.equal(tweens.length, 0, '页签尚未收完，棋盘和面板不能开始入场');
    assert.equal(bookmarkCalls[0].visible, false);
    bookmarkCalls[0].done();
    assert.equal(tweens.length, 1);
    game.rankExpansion.progress = 1;
    tweens[0].done();
    assert.equal(bookmarkCalls.length, 1);
    game.setRankExpanded(false);
    bookmarkCalls[1].done();
    assert.equal(bookmarkCalls.length, 2, '面板退出中不能弹出页签');
    game.rankExpansion.progress = 0;
    tweens[1].done();
    assert.equal(bookmarkCalls[2].visible, true);
    game.setRankExpanded(true);
    const stale = bookmarkCalls[3].done;
    game.setRankExpanded(false);
    stale();
    assert.equal(tweens.length, 2, '已反向的旧页签回调不能触发展开');
});

test('教学退场一开始同步展开，遮罩淡出与展开时长一致', () => {
    const { game, tweens } = harness();
    const calls = [];
    game.setRankExpanded = (...args) => calls.push(args);
    game.scheduleOnce = () => {};
    game.tutorialDimMask = { isValid: true };
    game.playTutorialFarewell();
    assert.deepEqual(calls, [[true, 0.76]]);
    assert.equal(tweens[0].target, game.tutorialDimMask);
    assert.equal(tweens[0].moves[0].duration, calls[0][1]);
    assert.equal(tweens[0].moves[0].properties.opacity, 0);
});
