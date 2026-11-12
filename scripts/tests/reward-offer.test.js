const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
let shareReward;
let videoReward;
let shareCards;
let compiledSharePath;

function freshShareModule(suffix) {
    const target = compiledSharePath.replace('.js', `.${suffix}.js`);
    fs.copyFileSync(compiledSharePath, target);
    return require(target);
}

test.before(() => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-reward-offer-'));
    global.cc = {
        Color: class Color {
            constructor(r, g, b, a) { Object.assign(this, { r, g, b, a }); }
        },
    };
    try {
        execFileSync('npx', [
            '--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/manager/ShareReward.ts',
            '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck',
        ], { cwd: repoRoot, stdio: 'pipe' });
    } catch (_) { /* 独立编译不载入 Cocos 类型，检查生成的 JS 行为。 */ }

    shareReward = require(path.join(out, 'ShareReward.js'));
    shareCards = require(path.join(out, 'ShareConfig.js')).SHARE_CARDS;
    const compiledPath = path.join(out, 'ShareReward.js');
    compiledSharePath = compiledPath;
    const enabledPath = path.join(out, 'ShareReward.enabled.js');
    const enabledSource = fs.readFileSync(compiledPath, 'utf8')
        .replace('exports.REWARDED_VIDEO_ENABLED = false;', 'exports.REWARDED_VIDEO_ENABLED = true;')
        .replace("exports.REWARDED_VIDEO_AD_UNIT_ID = '';", "exports.REWARDED_VIDEO_AD_UNIT_ID = 'adunit-test';");
    fs.writeFileSync(enabledPath, enabledSource);
    videoReward = require(enabledPath);
});

test.afterEach(() => {
    delete global.wx;
});

test('默认关闭激励视频，每次奖励分享随机选择匹配的 CDN 图片和原图文案', () => {
    assert.equal(shareReward.REWARDED_VIDEO_ENABLED, false);
    assert.equal(shareReward.REWARDED_VIDEO_AD_UNIT_ID, '');
    assert.equal(shareReward.getRewardOfferIcon(), 'share');
    assert.equal(shareReward.getRewardOfferActionText(), '分享');

    let onShow;
    let shareCount = 0;
    let adCount = 0;
    const results = [];
    const realNow = Date.now;
    let now = realNow();
    const realRandom = Math.random;
    const messages = [];
    Date.now = () => now;
    global.wx = {
        shareAppMessage: (message) => { shareCount++; messages.push(message); },
        createRewardedVideoAd: () => { adCount++; },
        onShow: (callback) => { onShow = callback; },
    };
    try {
        for (let index = 0; index < 3; index++) {
            Math.random = () => (index + 0.1) / 3;
            shareReward.requestRewardOffer((rewarded) => results.push(rewarded));
            now += 3001;
            onShow();
        }
    } finally {
        Date.now = realNow;
        Math.random = realRandom;
    }
    assert.equal(shareCount, 3);
    assert.equal(adCount, 0);
    assert.deepEqual(results, [true, true, true]);
    assert.deepEqual(messages, shareCards.map(card => ({ ...card, query: 'from=share_reward' })));
});

test('原生转发菜单每次调用重新随机，注册一次且不触发奖励', () => {
    let listener;
    let registrationCount = 0;
    const realRandom = Math.random;
    global.wx = {
        showShareMenu: options => assert.deepEqual(options.menus, ['shareAppMessage']),
        onShareAppMessage: callback => { listener = callback; registrationCount++; },
    };
    try {
        shareReward.registerSystemShare();
        shareReward.registerSystemShare();
        assert.equal(registrationCount, 1);
        for (let index = 0; index < 3; index++) {
            Math.random = () => (index + 0.9) / 3;
            assert.deepEqual(listener(), { ...shareCards[index], query: 'from=system_share' });
        }
    } finally { Math.random = realRandom; }
});

test('三张分享图与原文、清单和 CDN URL 对应，图片始终留在 assets 外', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'share-assets/20261112/manifest.json')));
    const crypto = require('node:crypto');
    assert.equal(shareCards.length, 3);
    assert.deepEqual(shareCards.map(card => card.title), ['这一拖，爽翻了！', '快满了？一拖翻盘！', '边消边冲榜，下一名被我超了！']);
    manifest.forEach((card, index) => {
        assert.equal(card.width / card.height, 5 / 4);
        assert.ok(card.bytes <= 96 * 1024);
        assert.deepEqual(shareCards[index], { title: card.title, imageUrl: card.imageUrl });
        assert.equal(card.imageUrl, `https://cdn.tcjstory.cn/cocos-zyx/share/20261112/${card.file}`);
        const bytes = fs.readFileSync(path.join(repoRoot, 'share-assets/20261112', card.file));
        assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), card.sha256);
    });
    const resources = fs.readdirSync(path.join(repoRoot, 'assets'), { recursive: true });
    for (const card of manifest) assert.ok(!resources.some(name => name.endsWith(card.file)));
});

test('图片下载时间不计入奖励停留时间，缓存后直接复用临时文件', async () => {
    const reward = freshShareModule('cache');
    const realNow = Date.now, realRandom = Math.random;
    const downloads = [], messages = [], results = [];
    let onShow, now = 10000;
    Date.now = () => now;
    Math.random = () => 0;
    global.wx = {
        downloadFile: options => downloads.push(options),
        shareAppMessage: message => messages.push(message),
        onShow: callback => { onShow = callback; },
    };
    try {
        reward.requestRewardOffer(value => results.push(value));
        assert.equal(downloads[0].url, shareCards[0].imageUrl);
        assert.equal(downloads[0].timeout, 2500);
        now += 5000; onShow();
        assert.deepEqual(results, []);
        downloads[0].success({ statusCode: 200, tempFilePath: 'wxfile://tmp/burst.jpg' });
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(messages[0].imageUrl, 'wxfile://tmp/burst.jpg');
        now += 2999; onShow();
        assert.deepEqual(results, [false]);
        reward.requestRewardOffer(value => results.push(value));
        assert.equal(downloads.length, 1);
        assert.equal(messages.length, 2);
        now += 3001; onShow();
        assert.deepEqual(results, [false, true]);
    } finally { Date.now = realNow; Math.random = realRandom; }
});

test('菜单预取三张 CDN 图片，共享下载并异步补齐本地路径', async () => {
    const reward = freshShareModule('prefetch');
    const downloads = [];
    const realRandom = Math.random;
    let listener;
    global.wx = {
        downloadFile: options => downloads.push(options),
        onShareAppMessage: callback => { listener = callback; },
        showShareMenu: () => undefined,
    };
    try {
        reward.registerSystemShare(); reward.registerSystemShare();
        assert.equal(downloads.length, 3);
        Math.random = () => 0;
        const waiting = listener();
        assert.ok(waiting.promise);
        assert.equal(downloads.length, 3);
        downloads.forEach((download, index) => download.success({ statusCode: 200, tempFilePath: `wxfile://tmp/card-${index}.jpg` }));
        const prepared = await waiting.promise;
        assert.deepEqual(prepared, { title: shareCards[0].title, imageUrl: 'wxfile://tmp/card-0.jpg', query: 'from=system_share' });
        for (let index = 0; index < 3; index++) {
            Math.random = () => (index + .5) / 3;
            assert.deepEqual(listener(), { title: shareCards[index].title, imageUrl: `wxfile://tmp/card-${index}.jpg`, query: 'from=system_share' });
        }
    } finally { Math.random = realRandom; }
});

test('下载失败不发奖励、不拉起无图分享，下次允许重新下载', async () => {
    const reward = freshShareModule('retry');
    const downloads = [], messages = [], results = [];
    const realNow = Date.now, realRandom = Math.random;
    let onShow, now = 10000;
    Date.now = () => now;
    Math.random = () => 0;
    global.wx = {
        downloadFile: options => downloads.push(options),
        shareAppMessage: message => messages.push(message),
        onShow: callback => { onShow = callback; },
    };
    try {
        reward.requestRewardOffer(value => results.push(value));
        downloads[0].fail(new Error('offline'));
        await new Promise(resolve => setImmediate(resolve));
        assert.deepEqual(results, [false]);
        assert.deepEqual(messages, []);
        reward.requestRewardOffer(value => results.push(value));
        assert.equal(downloads.length, 2);
        downloads[1].success({ statusCode: 200, tempFilePath: 'wxfile://tmp/retry.jpg' });
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(messages[0].imageUrl, 'wxfile://tmp/retry.jpg');
        now += 3001; onShow();
        assert.deepEqual(results, [false, true]);
    } finally { Date.now = realNow; Math.random = realRandom; }
});

test('开启后使用集中配置的广告位，完整观看只发放一次奖励', () => {
    let closeHandler;
    let offCloseCount = 0;
    let showCount = 0;
    const results = [];
    global.wx = {
        createRewardedVideoAd: (options) => {
            assert.equal(options.adUnitId, 'adunit-test');
            return {
                onClose: (callback) => { closeHandler = callback; },
                onError: () => undefined,
                offClose: () => { offCloseCount++; },
                offError: () => undefined,
                show: () => { showCount++; return Promise.resolve(); },
            };
        },
    };
    assert.equal(videoReward.getRewardOfferIcon(), 'video');
    assert.equal(videoReward.getRewardOfferActionText(), '看视频');
    videoReward.requestRewardOffer((rewarded) => results.push(rewarded), '5 点体力');
    closeHandler({ isEnded: true });
    closeHandler({ isEnded: true });
    assert.equal(showCount, 1);
    assert.equal(offCloseCount, 1);
    assert.deepEqual(results, [true]);
});

test('中途关闭或广告错误均不发奖励，后续回调不会重复结算', () => {
    let closeHandler;
    let errorHandler;
    const results = [];
    global.wx = {
        createRewardedVideoAd: () => ({
            onClose: (callback) => { closeHandler = callback; },
            onError: (callback) => { errorHandler = callback; },
            offClose: () => undefined,
            offError: () => undefined,
            show: () => Promise.resolve(),
        }),
    };
    videoReward.requestRewardOffer((rewarded) => results.push(rewarded));
    closeHandler({ isEnded: false });
    errorHandler(new Error('late error'));
    closeHandler({ isEnded: true });
    assert.deepEqual(results, [false]);
});

test('首次展示失败会先加载再重试，重试成功后等待完整观看回调', async () => {
    let closeHandler;
    let showCount = 0;
    let loadCount = 0;
    const results = [];
    global.wx = {
        createRewardedVideoAd: () => ({
            onClose: (callback) => { closeHandler = callback; },
            onError: () => undefined,
            offClose: () => undefined,
            offError: () => undefined,
            load: () => { loadCount++; return Promise.resolve(); },
            show: () => {
                showCount++;
                return showCount === 1 ? Promise.reject(new Error('not loaded')) : Promise.resolve();
            },
        }),
    };
    videoReward.requestRewardOffer((rewarded) => results.push(rewarded));
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(loadCount, 1);
    assert.equal(showCount, 2);
    assert.deepEqual(results, []);
    closeHandler({ isEnded: true });
    assert.deepEqual(results, [true]);
});

test('五个奖励点位全部接入统一双通道，不再直接调用分享或保留旧开关', () => {
    const game = fs.readFileSync(path.join(repoRoot, 'assets/script/zyxGame/ZyxGame.ts'), 'utf8');
    const main = fs.readFileSync(path.join(repoRoot, 'assets/script/GameMainScene.ts'), 'utf8');
    assert.equal((game.match(/this\.showRewardOffer\(/g) || []).length, 4);
    assert.match(game, /private showRewardOffer[\s\S]*?requestRewardOffer\(onResult\)/);
    assert.match(main, /requestRewardOffer\(\(rewarded\)/);
    for (const source of [game, main]) {
        assert.doesNotMatch(source, /requestShareReward|USE_SHARE_INSTEAD_OF_VIDEO|showRewardedVideo/);
    }
});

test('救场从右侧入场后压暗并启动倒计时，确认后先收回再撤罩', () => {
    const game = fs.readFileSync(path.join(repoRoot, 'assets/script/zyxGame/ZyxGame.ts'), 'utf8');
    const prompt = game.slice(game.indexOf('private showRoundRescuePrompt()'), game.indexOf('private refreshRoundRescueLayout()'));
    assert.match(prompt, /'roundRescueMask'/);
    assert.match(prompt, /'roundRescueLight'/);
    assert.match(prompt, /const dockX = this\.node\.width \/ 2 - 66/);
    assert.match(prompt, /'我可以'/);
    assert.ok(prompt.indexOf('{ x: dockX }') < prompt.indexOf('cc.tween(mask).to'));
    assert.ok(prompt.indexOf('acceptButton.interactable = true') < prompt.indexOf('.to(10, { progress: 0 }'));
    const close = game.slice(game.indexOf('private dismissRoundRescuePrompt('), game.indexOf('private updateBoardDangerState()'));
    assert.ok(close.indexOf('cc.tween(drawer)') < close.indexOf('cc.tween(mask)'));
    assert.ok(close.indexOf('prompt.destroy();', close.indexOf('cc.tween(mask)')) < close.indexOf('onComplete();'));
    assert.match(game, /this\.idleSeconds >= zyxGameModule\.getHintDelay\(\)/);
    const eliminate = game.slice(game.indexOf('private animateElimination('), game.indexOf('private playMoodCollect('));
    assert.doesNotMatch(eliminate, /showToast/);
    assert.match(eliminate, /this\.animateRowShatter\(result\.removedPieceIds, result\.detonatedBombs\)/);
});
