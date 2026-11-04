const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const vm = require('node:vm');

let getRankChaseState;
let getOvertakenRivals;
let viewSource;
test.before(() => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-rank-chase-'));
    try {
        execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc',
            'assets/script/dataModule/RankChase.ts', 'assets/script/zyxGame/RankChaseView.ts', '--outDir', out,
            '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck'], { stdio: 'pipe' });
    } catch (_) { /* 独立编译不载入 Cocos 类型，使用生成的纯数据模块。 */ }
    ({ getRankChaseState, getOvertakenRivals } = require(path.join(out, 'dataModule/RankChase.js')));
    viewSource = fs.readFileSync(path.join(out, 'zyxGame/RankChaseView.js'), 'utf8');
});

test('一次跨多人只跃升一次，连续加分合并到最新位置；离场忽略回调', async () => {
    class Node {
        constructor(name) { Object.assign(this, { name, children: [], scale: 1, opacity: 255, isValid: true }); }
        setPosition(x, y) { Object.assign(this, { x, y }); }
        setContentSize(width, height) { Object.assign(this, { width, height }); }
        addChild(node) { this.children.push(node); }
        on() {}
        addComponent() { return {}; }
        getComponent() { return { clear() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {}, close() {}, fill() {} }; }
        removeAllChildren() { this.children = []; }
        destroy() { this.isValid = false; }
    }
    const tweens = [];
    const stopped = [];
    const ui = {
        createRect(parent, name) { const node = new Node(name); parent.addChild(node); return node; },
        createLabel(parent, string) { const node = new Node('label'); parent.addChild(node); const label = { node, string }; node.label = label; return label; },
    };
    const colors = {};
    const entries = [entry('a', 100, 1), entry('b', 60, 2), entry('c', 30, 3), entry('d', 10, 4)];
    const exported = {};
    Node.EventType = { TOUCH_END: 'touchend' };
    class Sprite {}
    Sprite.Type = { SLICED: 1 };
    Sprite.SizeMode = { CUSTOM: 1 };
    class Button {}
    Button.Transition = { NONE: 0 };
    class Texture2D { initWithData() {} }
    Texture2D.PixelFormat = { RGBA8888: 0 };
    vm.runInNewContext(viewSource, {
        exports: exported,
        cc: {
            Node, Sprite, Button, Texture2D, SpriteFrame: class {}, Color: class {}, Graphics: class {}, isValid: (node) => node.isValid,
            Tween: { stopAllByTarget: (target) => stopped.push(target) },
            tween(target) {
                const tween = { target, moves: [], options: [], to(_, properties, options) { this.moves.push(properties); this.options.push(options); return this; },
                    delay() { return this; }, call(callback) { this.done = callback; return this; }, start() { return this; } };
                tweens.push(tween);
                return tween;
            },
        },
        require(name) {
            if (name.endsWith('CloudService')) return { cloudService: { getLeaderboard: async () => ({ entries }) } };
            if (name.endsWith('UIManager')) return { uimanager: ui };
            if (name.endsWith('AssetLoader')) return {};
            if (name.endsWith('ResponsiveLayout')) return { GAME_RANK_PANEL_WIDTH: 88 };
            if (name.endsWith('RankChase')) return { getRankChaseState, getOvertakenRivals };
            return { MOOD_COLORS: colors, applyRoundedAvatarMask() {}, createMoodBeanMascot() {},
                createAvatarFrame(parent, name) { const node = new Node(name); parent.addChild(node); return node; } };
        },
    });
    const view = new exported.default(new Node('root'), { playerId: 'me', avatarUrl: '' }, Promise.resolve(entries), () => {});
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(view.root.width, 88);
    assert.equal(view.root.height, 420);
    const panel = view.root.children.find((node) => node.name === 'chasePanel');
    assert.equal(panel.width, 84);
    assert.equal(panel.height, 416);
    assert.ok(view.root.children.some((node) => node.name === 'chaseCollapse'));
    // 数据返回不能偷偷展开；显隐完全由棋盘的共享动画进度控制。
    assert.equal(view.root.opacity, 0);
    view.setExpansion(0, -353, 120);
    assert.equal(view.root.active, false);
    assert.equal(view.bookmark.active, false);
    view.setExpansion(0.5, -385, 120);
    assert.equal(view.root.opacity, 128);
    assert.equal(view.bookmark.active, false);
    view.setExpansion(1, -417, 120);
    assert.equal(view.root.active, true);
    assert.equal(view.bookmark.active, false);
    view.setBookmarkVisible(true);
    assert.equal(view.bookmark.active, false, '面板可见时不能推出页签');
    view.setExpansion(0, -351, 120);
    view.setBookmarkVisible(true);
    const reveal = tweens.at(-1);
    view.bookmarkReveal.progress = 0.5;
    reveal.options[0].onUpdate();
    assert.equal(view.root.active, false);
    assert.equal(view.bookmark.active, true);
    view.bookmarkReveal.progress = 1;
    reveal.done();
    assert.equal(view.bookmark.width, 64);
    assert.equal(view.bookmark.height, 44);
    assert.equal(view.bookmark.y, 120 - 181);
    assert.equal(view.bookmark.x, -351);
    let hidden = false;
    view.setBookmarkVisible(false, () => { hidden = true; });
    const retract = tweens.at(-1);
    view.bookmarkReveal.progress = 0.5;
    retract.options[0].onUpdate();
    assert.equal(hidden, false);
    assert.equal(view.root.active, false);
    view.bookmarkReveal.progress = 0;
    retract.done();
    assert.equal(hidden, true);
    assert.equal(view.bookmark.active, false);
    view.setExpansion(0.5, -351, 120);
    assert.equal(view.bookmark.active, false);
    // 模拟其他界面并发刷新同一响应对象；本局仍使用独立的开局快照。
    entries[1].value = 9999;
    view.updateScore(40);
    const firstJump = tweens.find((tween) => tween.target.name === 'chaseAvatar');
    assert.equal(firstJump.target.name, 'chaseAvatar');
    assert.ok(firstJump.moves.some((move) => move.y === 112));
    assert.equal(view.selfScore.string, '40');
    view.updateScore(80);
    assert.equal(view.selfScore.string, '80');
    firstJump.done();
    assert.equal(tweens.filter((tween) => tween.target === firstJump.target).length, 1);
    assert.equal(view.animating, false);
    assert.equal(view.score, 80);
    assert.equal(view.above.entryKey, 'a');
    assert.equal(view.below.entryKey, 'b');
    assert.equal(view.above.children.find((node) => node.label).label.string, '100');
    assert.equal(view.below.children.find((node) => node.label).label.string, '60');
    view.updateScore(110);
    const lastJump = tweens.filter((tween) => tween.target.name === 'chaseAvatar')[1];
    lastJump.done();
    assert.equal(view.above.active, false);
    assert.equal(view.below.active, true);
    assert.equal(view.selfScore.string, '110');
    assert.ok(!view.root.children.some((node) => node.name === 'chaseTrack'));
    view.dispose();
    assert.ok(stopped.includes(lastJump.target));
    const count = tweens.length;
    lastJump.done();
    assert.equal(tweens.length, count);
});

const entry = (playerId, value, rank) => ({ playerId, value, rank, nickname: playerId, avatarUrl: '', rewardTier: 'normal' });

test('本局分数选择相邻对手，不把自己的历史成绩当作对手', () => {
    const entries = [entry('a', 100, 1), entry('me', 90, 2), entry('b', 70, 3), entry('c', 30, 4)];
    const state = getRankChaseState(entries, 'me', 60);
    assert.equal(state.above.playerId, 'b');
    assert.equal(state.below.playerId, 'c');
    assert.equal(state.gap, 11);
    assert.equal(state.rank, 3);
    assert.deepEqual(getOvertakenRivals(entries, 'me', 60, 101).map((item) => item.playerId), ['b', 'a']);
});

test('同分仍需超过，连续加分及一次跨多人不会重复触发超越', () => {
    const entries = [entry('a', 40, 1), entry('b', 40, 2), entry('c', 30, 3)];
    assert.equal(getRankChaseState(entries, 'me', 40).gap, 1);
    assert.deepEqual(getOvertakenRivals(entries, 'me', 30, 40).map((item) => item.playerId), ['c']);
    assert.deepEqual(getOvertakenRivals(entries, 'me', 40, 50).map((item) => item.playerId), ['b', 'a']);
    assert.deepEqual(getOvertakenRivals(entries, 'me', 50, 50), []);
    assert.deepEqual(getOvertakenRivals(entries, 'me', 30, 50).map((item) => item.playerId), ['c', 'b', 'a']);
});

test('空榜、榜首与榜尾正确留空，前200名以外不编造全服名次', () => {
    assert.deepEqual(getRankChaseState([], 'me', 0), { above: null, below: null, rank: null, gap: 0 });
    const entries = [entry('a', 100, 1), entry('b', 20, 2)];
    assert.equal(getRankChaseState(entries, 'me', 110).above, null);
    assert.equal(getRankChaseState(entries, 'me', 110).rank, 1);
    assert.equal(getRankChaseState(entries, 'me', 10).below, null);
    const full = Array.from({ length: 200 }, (_, i) => entry(`p${i}`, 2000 - i * 10, i + 1));
    assert.equal(getRankChaseState(full, 'me', 1).rank, null);
    assert.equal(getRankChaseState(full, 'me', 1).above.rank, 200);
    assert.equal(getRankChaseState(full, 'me', 21).rank, 199);
});

test('开局只请求一次榜单，教学期间不展示，之后使用快照离线推进', () => {
    const source = fs.readFileSync(path.join(__dirname, '../../assets/script/zyxGame/ZyxGame.ts'), 'utf8');
    const initialize = source.slice(source.indexOf('public initialize('), source.indexOf('public onDestroy()'));
    assert.match(initialize, /if \(!zyxGameModule\.isTutorialRound\(\)\) this\.createRankChase\(\)/);
    assert.match(initialize, /this\.rankExpanded = this\.tutorialStep < 0/);
    assert.match(initialize, /this\.rankExpansion\.progress = this\.rankExpanded \? 1 : 0/);
    const view = fs.readFileSync(path.join(__dirname, '../../assets/script/zyxGame/RankChaseView.ts'), 'utf8');
    assert.doesNotMatch(view, /gapLabel|rankLabel|本局追赶|预估进度|chaseTrack|chaseGap|getLeaderboard|pending/);
    assert.equal((initialize.match(/cloudService\.getLeaderboard/g) || []).length, 1);
    assert.match(initialize, /this\.rankChaseSnapshot = cloudService\.getLeaderboard/);
    assert.match(source, /new RankChaseView\(this\.node, this\.rankChaseProfile, this\.rankChaseSnapshot,/);
});
