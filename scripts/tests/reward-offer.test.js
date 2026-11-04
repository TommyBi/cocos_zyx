const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
let shareReward;
let videoReward;

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
    const compiledPath = path.join(out, 'ShareReward.js');
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

test('默认关闭激励视频，所有奖励仍走分享且分享图标与文案不变', () => {
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
    Date.now = () => now;
    global.wx = {
        shareAppMessage: () => { shareCount++; },
        createRewardedVideoAd: () => { adCount++; },
        onShow: (callback) => { onShow = callback; },
    };
    try {
        shareReward.requestRewardOffer((rewarded) => results.push(rewarded));
        now += 3001;
        onShow();
    } finally {
        Date.now = realNow;
    }
    assert.equal(shareCount, 1);
    assert.equal(adCount, 0);
    assert.deepEqual(results, [true]);
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

test('救场入口位于棋盘右上方，消除操作提示在闲置3秒后出现', () => {
    const game = fs.readFileSync(path.join(repoRoot, 'assets/script/zyxGame/ZyxGame.ts'), 'utf8');
    assert.match(game, /const iconY = this\.layout\.boardY \+ BOARD_ROWS \* CELL_SIZE \/ 2 - 92;/);
    assert.match(game, /iconX - 72 - bubbleWidth \/ 2/);
    assert.match(game, /this\.idleSeconds >= 3/);
    assert.doesNotMatch(game, /this\.idleSeconds >= 8/);
});
