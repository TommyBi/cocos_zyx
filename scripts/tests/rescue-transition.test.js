const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
let gameSource;
let responsiveLayout;
let balloonSource;
test.before(() => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-rescue-transition-'));
    try {
        execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/zyxGame/ZyxGame.ts',
            '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck', '--experimentalDecorators'], { stdio: 'pipe' });
    } catch (_) { /* 独立编译不载入 Cocos 类型，使用产物验证交互时序。 */ }
    gameSource = fs.readFileSync(path.join(out, 'zyxGame/ZyxGame.js'), 'utf8');
    responsiveLayout = require(path.join(out, 'manager/ResponsiveLayout.js'));
    balloonSource = fs.readFileSync(path.join(out, 'zyxGame/RescueBalloon.js'), 'utf8');
});

function harness(deps = {}, storage = {}) {
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
            sys: { localStorage: storage },
            _decorator: { ccclass: (value) => value }, Color: class {}, Component: class {},
            isValid: (node) => node.isValid !== false,
            Node: class { setContentSize() {} addComponent() {} destroy() { this.isValid = false; } },
            BlockInputEvents: class {},
            v2: (x, y) => ({ x, y }),
            Tween: { stopAllByTarget() {} },
            tween(target) {
                const tween = { target, moves: [], delay() { return this; }, to(duration, properties, options) { this.moves.push({ duration, properties, options }); return this; }, call(callback) { this.done = callback; return this; }, start() { return this; } };
                tweens.push(tween); return tween;
            },
        },
        require: (name) => name.endsWith('ResponsiveLayout') ? responsiveLayout : deps[name] || {},
    });
    const game = new exported.default();
    game.node = { isValid: true, width: 750 };
    game.locked = false;
    game.roundRescuePrompt = null;
    game.setToolSelectionMode = () => events.push('selection');
    return { game, tweens, events, prompt, drawer, explanation, mask };
}

test('右侧我可以只收起说明和遮罩，倒计时按钮保留；另点按钮才请求分享', () => {
    const { game, tweens, events, prompt, explanation, drawer, mask } = harness();
    game.roundRescuePrompt = prompt; game.roundRescueInteractive = game.roundRescueGuideVisible = true;
    game.balloonPhase = 'flying'; game.roundRescueCountdownState = { progress: 0.5 };
    game.markInteraction = () => {};
    game.requestRoundRescue = () => events.push('reward');
    game.acknowledgeRoundRescue(); game.acknowledgeRoundRescue();
    assert.equal(tweens.length, 1); assert.equal(tweens[0].target, explanation);
    tweens[0].done(); tweens[1].done();
    assert.equal(mask.active, false); assert.equal(prompt.isValid, true);
    assert.equal(game.roundRescueCountdownState.progress, 0.5);
    assert.equal(game.roundRescueInteractive, true); assert.equal(game.roundRescueGuideVisible, false);
    assert.deepEqual(events, ['explanation']);
    game.handleScreenClearRescueClick(); game.handleScreenClearRescueClick();
    assert.equal(tweens[2].target, drawer); assert.equal(game.locked, true);
    tweens[2].done(); assert.equal(tweens[3].target, mask);
    assert.deepEqual(events, ['explanation', 'selection']);
    tweens[3].done();
    assert.equal(prompt.active, false);
    assert.deepEqual(events, ['explanation', 'selection', 'reward']);
});

test('右侧倒计时与气球一致，普通掉落继续计时，暂停和分享冻结，超时结束机会', () => {
    const { game } = harness(); let redraws = 0, dismissed = 0;
    game.roundRescueCountdownState = { progress: 1, started: true, redraw: () => redraws++ };
    game.balloonPhase = 'flying'; game.updateRotatingTip = () => {};
    game.isTutorialGuidedStep = () => false; game.locked = true;
    game.update(1); assert.equal(game.roundRescueCountdownState.progress, 0.9);
    game.pauseMenuOpen = true; game.update(3); assert.equal(redraws, 1);
    game.pauseMenuOpen = false; game.balloonPhase = 'sharing'; game.update(3); assert.equal(redraws, 1);
    game.balloonPhase = 'flying'; game.dismissRoundRescuePrompt = () => dismissed++;
    game.update(10); assert.equal(dismissed, 1);
});

test('取消清屏分享恢复同一个按钮与剩余倒计时，成功回调只能清屏一次', () => {
    const callbacks = []; let cleared = 0;
    const { game, prompt } = harness({'../manager/UIManager': {uimanager: {showToast() {}}},
        '../manager/ShareReward': {getRewardOfferFailToast: () => ''}});
    game.node.addChild = () => {};
    game.roundRescuePrompt = prompt; game.balloonPhase = 'dialog';
    game.roundRescueCountdownState = {progress: 0.45};
    game.refreshRoundRescueLayout = () => {};
    game.showRewardOffer = cb => callbacks.push(cb);
    game.applyScreenClearRescue = () => {cleared++; game.balloonPhase = 'none';};
    game.requestRoundRescue(); callbacks[0](false); callbacks[0](true);
    assert.equal(cleared, 0); assert.equal(prompt.active, true);
    assert.equal(game.roundRescueCountdownState.progress, 0.45);
    assert.equal(game.roundRescueInteractive, true); assert.equal(game.locked, false);
    game.balloonPhase = 'dialog'; game.requestRoundRescue(); callbacks[1](true); callbacks[1](true);
    assert.equal(cleared, 1);
});

test('热气球点击只打开一次弹窗，拒绝后保留剩余飞行时间并恢复输入', () => {
    let actions, dismiss, opened = 0;
    const { game } = harness({
        '../manager/UIManager': { BUTTON_COLORS: {yellow: {}, green: {}}, uimanager: { showModal(_title, _message, a, _d, _h, _horizontal, _dismissible, _width, options) {
            opened++; actions = a; dismiss = options.onDismiss; return { isValid: true };
        } } },
        '../manager/ShareReward': { getRewardOfferIcon: () => 'share' },
    });
    game.markInteraction = () => {};
    game.rescueBalloon = { elapsed: 4.25 };
    game.balloonPhase = 'flying';
    game.handleRoundRescueClick(); game.handleRoundRescueClick();
    assert.equal(opened, 1); assert.equal(game.locked, true);
    assert.equal(actions[0].text, '才不要'); assert.equal(actions[1].text, '帮帮我');
    actions[0].onClick();
    assert.equal(game.balloonPhase, 'flying'); assert.equal(game.locked, false);
    assert.equal(game.rescueBalloon.elapsed, 4.25);
    game.handleRoundRescueClick(); dismiss();
    assert.equal(game.balloonPhase, 'flying'); assert.equal(game.locked, false);
});

test('分享期间旧弹窗拒绝回调不解锁，取消后迟到成功回调不能触发救援', () => {
    let actions, callback, rescued = 0;
    const { game } = harness({
        '../manager/UIManager': { BUTTON_COLORS: {}, uimanager: { showToast() {}, showModal(_t, _m, a) { actions = a; return {}; } } },
        '../manager/ShareReward': { getRewardOfferIcon: () => 'share', getRewardOfferFailToast: () => '' },
    });
    game.node.addChild = () => {};
    game.markInteraction = () => {};
    game.rescueBalloon = { elapsed: 5 };
    game.balloonPhase = 'flying';
    game.showRewardOffer = cb => callback = cb;
    game.applyRoundRescue = () => rescued++;
    game.handleRoundRescueClick(); actions[1].onClick();
    assert.equal(game.balloonPhase, 'sharing'); assert.equal(game.locked, true);
    actions[0].onClick();
    assert.equal(game.balloonPhase, 'sharing'); assert.equal(game.locked, true);
    callback(false); assert.equal(game.balloonPhase, 'flying'); assert.equal(game.locked, false);
    callback(true); assert.equal(rescued, 0);
});

test('普通掉落锁不延长热气球飞行，暂停菜单和分享才暂停飞行', () => {
    const { game } = harness(); const calls = [];
    game.updateRotatingTip = () => {}; game.isTutorialGuidedStep = () => false;
    game.rescueBalloon = { update(_dt, fly) { calls.push(fly); return false; } };
    game.balloonPhase = 'flying'; game.locked = true; game.update(0.1);
    game.pauseMenuOpen = true; game.update(0.1);
    game.pauseMenuOpen = false; game.balloonPhase = 'sharing'; game.update(0.1);
    assert.deepEqual(calls, [true, false, false]);
});

test('气球全部落地200ms后同步播放标准范围爆炸，全部受击块使用同一爆破结果', () => {
    const blasts = [], shatters = [], scheduled = [], drops = [];
    const targets = [{id: 1, row: 5, col: 2, size: 1}, {id: 2, row: 6, col: 3, size: 1}];
    const result = {removedPieceIds: [1, 2, 3, 4], detonatedBombs: [...targets, {id: 3, row: 7, col: 4, size: 1}]};
    let applied = 0, faded = 0;
    const { game, tweens } = harness({
        '../dataModule/ZyxGameModule': {BOARD_ROWS: 10, CELL_SIZE: 76, zyxGameModule: {
            getBalloonTargets: () => targets,
            applyBalloonRescue: () => { applied++; return result; },
        }},
        './RewardArt': {createBombBadge: () => {
            const drop = {isValid: true, setPosition() {}, destroy() { this.isValid = false; }};
            drops.push(drop); return drop;
        }},
        './BombEffect': {playBombEffect: (...args) => blasts.push(args), bombPlaybackDuration: () => 1.18},
    });
    game.pieceLayer = {convertToNodeSpaceAR: p => p};
    game.rescueBalloon = {root: {convertToWorldSpaceAR: p => p}, fadeOut: () => faded++};
    game.getPiecePosition = (row, col) => ({x: col * 76, y: -row * 76});
    game.scheduleOnce = (callback, delay) => scheduled.push({callback, delay});
    game.animateRowShatter = (...args) => shatters.push(args);
    game.applyRoundRescue();
    assert.equal(applied, 0); assert.equal(game.locked, true);
    const lastLanding = Math.max(...tweens.map((tween, index) => index * 0.13 + tween.moves[0].duration));
    assert.ok(Math.abs(scheduled[0].delay - lastLanding - 0.2) < 1e-9);
    scheduled[0].callback();
    assert.equal(applied, 1); assert.equal(faded, 1);
    assert.ok(drops.every(p => !p.isValid));
    assert.equal(blasts.length, 3, '旧炸弹也要播放爆炸');
    assert.ok(blasts.every(args => args[2] === 76 && args[3] === 0 && args[5] === true));
    assert.deepEqual(shatters, [[result.removedPieceIds, result.detonatedBombs, true]]);
    assert.equal(scheduled[1].delay, 1.18);
    assert.equal(game.locked, true, '演出结束前保持输入保护');
});

test('矢量序列飞行恰好15秒，暂停保留姿态、时间与剩余航程，出口淡隐', () => {
    const methods = ['clear','ellipse','fill','stroke','moveTo','bezierCurveTo','quadraticCurveTo','roundRect','lineTo','close','circle'];
    class Graphics {} methods.forEach(key => Graphics.prototype[key] = () => {});
    Graphics.LineCap = { ROUND: 1 }; Graphics.LineJoin = { ROUND: 1 };
    class Node { constructor() { this.isValid = true; } setContentSize() {} addComponent() { return new Graphics(); } on() {} }
    Node.EventType = { TOUCH_END: 'touchend' };
    const exports = {};
    vm.runInNewContext(balloonSource, {exports, Math, cc: {Node, Graphics, Color: class {}, isValid: () => true},
        require: () => ({MOOD_COLORS: {}})});
    const b = new exports.RescueBalloon({addChild() {}}, 76, () => {});
    assert.equal(b.update(4, true), false);
    const pose = [b.root.x, b.root.y, b.root.angle]; b.update(60, false);
    assert.equal(b.elapsed, 4); assert.deepEqual([b.root.x, b.root.y, b.root.angle], pose);
    assert.equal(b.update(6, true), false); assert.equal(b.elapsed, 10);
    assert.equal(b.update(4.5, true), false); assert.ok(b.root.opacity > 0 && b.root.opacity < 255);
    assert.equal(b.update(0.5, true), true); assert.equal(b.elapsed, 15); assert.equal(b.root.opacity, 0);
});

test('气球炸弹是抛物线，落点精确，爆炸渐隐不被每帧位置刷新覆盖', () => {
    class Graphics {};
    ['clear','ellipse','fill','stroke','moveTo','bezierCurveTo','quadraticCurveTo','roundRect','lineTo','close','circle']
        .forEach(key => Graphics.prototype[key] = () => {});
    Graphics.LineCap = {ROUND: 1}; Graphics.LineJoin = {ROUND: 1};
    class Node {constructor() {this.isValid = true;} setContentSize() {} addComponent() {return new Graphics();} on() {}}
    Node.EventType = {TOUCH_END: 'touchend'};
    const exports = {};
    vm.runInNewContext(balloonSource, {exports, Math, cc: {Node, Graphics, Color: class {}, v2: (x, y) => ({x, y})}, require: () => ({})});
    const from = {x: -180, y: 250}, to = {x: 220, y: -250};
    const position = t => exports.getBalloonBombPosition(from, to, t);
    assert.deepEqual({...position(0)}, from); assert.deepEqual({...position(1)}, to);
    assert.ok(position(0.1).y > from.y, '抛出时先形成可见弧顶');
    const samples = [0, 0.25, 0.5, 0.75, 1].map(position);
    const curvature = samples.slice(0, 3).map((p, i) => samples[i + 2].y - 2 * samples[i + 1].y + p.y);
    assert.ok(curvature.every(value => Math.abs(value - curvature[0]) < 1e-9), '二阶差分恒定，不能用正弦代替抛物线');
    const b = new exports.RescueBalloon({addChild() {}}, 76, () => {}); b.update(3.4, true);
    b.fadeOut(); b.update(0.16, false); assert.ok(b.root.opacity > 100 && b.root.opacity < 150);
    b.update(0.16, false); assert.equal(b.root.opacity, 0);
});

test('窗口变化后棋盘、边框、下一排和危险光效同轴，追赶底板保持垂直居中', () => {
    const { game } = harness();
    const node = (x = 0, y = 0) => ({ x, y, setPosition(x, y) { Object.assign(this, { x, y }); } });
    game.layout = responsiveLayout.calculateGameLayout(1390, 760);
    const parts = {
        boardShadow: node(game.layout.boardX, game.layout.boardY - 6),
        boardFrame: node(game.layout.boardX, game.layout.boardY),
        nextRow: node(game.layout.boardX, game.layout.nextY),
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
        assert.equal(game.boardRoot.x, game.layout.boardX);
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
        assert.equal(part.x, game.layout.boardX * 0.4);
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
    assert.equal(reveals.at(-1)[1], -335);
    game.hudRoot = node(); game.footerRoot = node(); game.roundRescuePrompt = null;
    game.node.height = 1560;
    game.refreshLayout();
    assert.equal(game.boardRoot.x, 0);
    assert.equal(game.rankChase.y, game.boardRoot.y);
    game.setRankExpanded(true);
    game.rankExpansion.progress = 1;
    tweens[2].done();
    assert.equal(game.boardRoot.x, game.layout.boardX);
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


test('逻辑结算与爆炸尾部独立锁输入，掉落结束不能提前解除演出输入保护', () => {
    const {game}=harness();
    game.bombAnimationLocks=1;game.locked=false;
    assert.equal(game.resolutionLocked,false);
    assert.equal(game.locked,true);
    game.bombAnimationLocks=0;assert.equal(game.locked,false);
    game.locked=true;assert.equal(game.locked,true);
});


test('补给写入幂等ID失败时不发请求、不冻结棋盘', async () => {
    const messages=[];const {game}=harness({'../manager/UIManager':{uimanager:{showToast:s=>messages.push(s)}}},
        {getItem(){throw new Error('quota');}});
    game.locked=true;await game.confirmRewardedTool('hammer');
    assert.equal(game.locked,false);assert.deepEqual(messages,['存储空间不足，清理后再领取']);
});

test('道具永久业务错误取消选择并解锁，不陷入只能重复确认的死循环', async () => {
    for(const businessCode of ['TOOL_PAYLOAD_CONFLICT','TOOL_REQUEST_INVALID','ROUND_NOT_ACTIVE']) {
        let retries=0;const messages=[];const {game}=harness({
            '../dataModule/ZyxGameModule':{zyxGameModule:{cloudRoundId:'qa_round',roundActions:[]}},
            '../manager/CloudService':{cloudService:{useTool:async()=>{throw Object.assign(new Error('状态已变化'),{businessCode});}}},
            '../manager/UIManager':{uimanager:{showToast:s=>messages.push(s)}}
        });
        game.locked=true;game.setToolSelectionMode=()=>{};
        assert.equal(await game.confirmToolUse('hammer',1,()=>retries++),null);
        assert.equal(game.locked,false);assert.equal(retries,0);assert.equal(messages.length,1);
    }
});
