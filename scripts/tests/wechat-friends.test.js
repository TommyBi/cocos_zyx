const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { readScore, readOwner, rankFriends } = require('../../wechat-open-data/ranking');
let modulePath, homePath;
const key = 'zyx_best_score_v1';
const user = (id, value) => ({ openid: id, nickname: id, KVDataList: [{ key, value }] });

test.before(() => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-friends-'));
    try {
        execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/manager/WeChatFriends.ts',
            '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck'], { stdio: 'pipe' });
    } catch (_) { /* 独立编译缺少 Cocos 声明，生成代码仍可执行。 */ }
    modulePath = path.join(out, 'WeChatFriends.js');
    const homeOut = path.join(out, 'home');
    try {
        execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/zyxGame/HomeFriendRanking.ts',
            '--outDir', homeOut, '--module', 'commonjs', '--target', 'es2017', '--experimentalDecorators', '--noResolve'],
        { stdio: 'pipe' });
    } catch (_) { /* 依赖在下面注入，测试编译后的实际组件。 */ }
    homePath = path.join(homeOut, 'HomeFriendRanking.js');
});
test.afterEach(() => { delete global.wx; });
function fresh() { delete require.cache[modulePath]; return require(modulePath); }

test('分数按数值降序、并列同名次；排除无成绩与损坏记录，自己只出现一次', () => {
    const result = rankFriends([user('a', '90'), user('b', '1000'), user('c', '1000'), user('d', '0'),
        user('e', 'NaN'), user('f', '-10'), user('g', '1.5'), user('h', '9007199254740992'), user('me', '10')],
    key, { openId: 'me', nickName: '自己' }, 90);
    assert.deepEqual(result.entries.map(e => [e.id, e.score, e.rank]),
        [['b', 1000, 1], ['c', 1000, 1], ['a', 90, 3], ['me', 90, 3], ['d', 0, 5]]);
    assert.equal(result.self.nickname, '自己');
    assert.equal(result.self.isSelf, true);
    assert.equal(readScore([{ key: 'other', value: '8' }], key), null);
});

test('开发/体验云分数使用独立 key；零分新玩家也写入，拒绝无效分数', () => {
    const calls = [];
    global.wx = { getAccountInfoSync: () => ({ miniProgram: { envVersion: 'trial' } }),
        setUserCloudStorage: opts => calls.push(opts) };
    const friends = fresh();
    friends.syncConfirmedFriendScore('p', 0);
    assert.deepEqual(calls[0].KVDataList, [{ key: 'zyx_best_score_staging_v1', value: '0' },
        { key: 'zyx_best_score_staging_v1_owner', value: 'p' }]);
    for (const value of [-1, NaN, Infinity, 1.5]) friends.syncConfirmedFriendScore('q', value);
    assert.equal(calls.length, 1);
});

test('成绩写入串行合并；失败可重试；成功后不重复写入低分', () => {
    const calls = [], callbacks = [];
    global.wx = { getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
        setUserCloudStorage: opts => calls.push(opts) };
    const friends = fresh();
    friends.syncConfirmedFriendScore('p', 50, () => callbacks.push('done'));
    friends.syncConfirmedFriendScore('p', 100);
    friends.syncConfirmedFriendScore('p', 80);
    assert.equal(calls.length, 1);
    calls[0].success();
    assert.equal(calls[1].KVDataList[0].value, '100');
    calls[1].fail();
    friends.syncConfirmedFriendScore('p', 100, () => callbacks.push('retry'));
    assert.equal(calls.length, 3);
    calls[2].success();
    friends.syncConfirmedFriendScore('p', 90);
    assert.equal(calls.length, 3);
    assert.deepEqual(callbacks, ['retry']);
});

test('主域只发送指令与 key，平台不可用可降级', () => {
    const messages = [];
    global.wx = { getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
        getOpenDataContext: () => ({ postMessage: message => messages.push(message) }) };
    const friends = fresh();
    assert.equal(friends.postFriendMessage('friends:show'), true);
    assert.deepEqual(messages, [{ type: 'friends:show', key }]);
    delete global.wx;
    assert.equal(friends.postFriendMessage('friends:show'), false);
});

function openData(options = {}) {
    let listener;
    const calls = [], painted = [], images = [], draws = [], warnings = [];
    let depth = 0;
    // 严格列举小游戏 Canvas 基础接口，不再用 Proxy 把缺失接口伪装成可调用函数。
    const ctx = { fillText: value => painted.push(String(value)), measureText: value => ({ width: value.length * 12 }),
        drawImage: (...args) => { if (options.failDraw) throw Error('native image not ready'); draws.push(args); },
        save: () => depth++, restore: () => { depth--; assert.ok(depth >= 0); } };
    for (const name of ['beginPath', 'arc', 'clip', 'fillRect', 'fill', 'moveTo', 'lineTo', 'bezierCurveTo',
        'closePath', 'stroke', 'clearRect', 'scale']) ctx[name] = () => {};
    if (options.noClip) delete ctx.clip;
    // 真微信开放域尺寸只读；主域已在发送show前设置尺寸。
    const canvas = Object.defineProperties({ getContext: () => ctx }, {
        width: { get: () => 398 }, height: { get: () => 320 },
    });
    const wx = { getSharedCanvas: () => canvas, onMessage: cb => { listener = cb; },
        getFriendCloudStorage: opts => calls.push(['friend', opts]),
        getUserInfo: opts => calls.push(['self', opts]), getUserCloudStorage: opts => calls.push(['score', opts]),
        createImage: () => { const image = { width: 128, height: 96 }; images.push(image); return image; } };
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../../wechat-open-data/index.js'), 'utf8'),
        { wx, require: () => ({ readScore, readOwner, rankFriends }), Map, Promise,
            console: { warn: (...args) => warnings.push(args) } });
    return { send: message => listener(message), calls, painted, images, draws, warnings, depth: () => depth };
}
const tick = () => new Promise(resolve => setImmediate(resolve));

test('开放域滑动列表到首尾、不额外请求，固定自身名次；隐藏后迟到请求不会重绘', async () => {
    const env = openData();
    env.send({ type: 'friends:show', key });
    env.calls[0][1].success({ data: Array.from({ length: 8 }, (_, i) => user(`好友${i}`, String(800 - i * 100))) });
    env.calls[1][1].success({ data: [{ openId: 'me' }] });
    env.calls[2][1].success({ KVDataList: [{ key, value: '50' }] });
    await tick();
    assert.ok(env.painted.includes('我 · 第9名'));
    assert.ok(env.painted.includes('好友0'));
    env.painted.length = 0;
    env.send({ type: 'friends:scroll', delta: 234 });
    assert.ok(env.painted.includes('好友3'));
    assert.ok(!env.painted.includes('好友0'));
    assert.ok(env.painted.includes('我 · 第9名'));
    env.painted.length = 0;
    env.send({ type: 'friends:scroll', delta: 99999 });
    assert.ok(env.painted.includes('好友7'));
    assert.ok(env.painted.includes('我 · 第9名'));
    env.send({ type: 'friends:scroll', delta: NaN });
    env.painted.length = 0;
    env.send({ type: 'friends:scroll', delta: -99999 });
    assert.ok(env.painted.includes('好友0'));
    assert.equal(env.calls.length, 3, '滑动不重新读取微信关系链');
    env.send({ type: 'friends:hide' });
    env.send({ type: 'friends:show', key });
    env.send({ type: 'friends:hide' });
    const before = env.painted.length;
    env.calls[3][1].success({ data: [user('迟到记录', '9999')] });
    env.calls[4][1].success({ data: [{ openId: 'me' }] });
    env.calls[5][1].success({ KVDataList: [] });
    await tick();
    assert.equal(env.painted.length, before);
});

test('读取失败提示下次返回首页，重新进入才请求，空榜明确邀请', async () => {
    const env = openData();
    env.send({ type: 'friends:show', key });
    env.calls[0][1].fail({ errMsg: 'denied' });
    await tick();
    assert.ok(env.painted.includes('好友排名暂时没加载出来'));
    env.send({ type: 'friends:hide' });
    env.send({ type: 'friends:show', key });
    env.calls[3][1].success({ data: [] }); env.calls[4][1].success({ data: [] });
    env.calls[5][1].success({ KVDataList: [] });
    await tick();
    assert.ok(env.painted.includes('邀请好友一起消除吧'));
});

test('开放域直接加载微信返回的头像URL，加载后重绘58px头像并中心裁切；同头像复用缓存', async () => {
    const env = openData();
    env.send({ type: 'friends:show', key });
    env.calls[0][1].success({ data: [{ ...user('friend', '900'), avatarUrl: 'https://wx.qlogo.cn/friend/132' }] });
    env.calls[1][1].success({ data: [{ openId: 'me', avatarUrl: 'https://wx.qlogo.cn/me/132' }] });
    env.calls[2][1].success({ KVDataList: [{ key, value: '100' }] });
    await tick();
    assert.deepEqual(env.images.map(image => image.src), ['https://wx.qlogo.cn/friend/132', 'https://wx.qlogo.cn/me/132']);
    env.images.forEach(image => image.onload());
    assert.equal(env.images.length, 2);
    assert.ok(env.draws.some(args => args[0].src.includes('/friend/') && args[1] === 16 && args[2] === 0
        && args[3] === 96 && args[4] === 96 && args[7] === 58 && args[8] === 58));
    const before = env.draws.length;
    env.send({ type: 'friends:hide' });
    env.images[0].onload();
    assert.equal(env.draws.length, before);
});

test('缺少 ellipse/clip 的微信 Canvas 仍绘制头像、昵称和已有分数，绘图状态栈归零', async () => {
    const env = openData({ noClip: true });
    env.send({ type: 'friends:show', key });
    env.calls[0][1].success({ data: [{ ...user('好友', '3660'), avatarUrl: 'https://wx.qlogo.cn/a/132' }] });
    env.calls[1][1].success({ data: [{ openId: 'me', nickName: '自己' }] });
    env.calls[2][1].success({ KVDataList: [{ key, value: '1280' }] });
    await tick();
    env.images[0].onload();
    assert.ok(env.painted.includes('好友'));
    assert.ok(env.painted.includes('3,660'));
    assert.ok(env.painted.includes('1,280'));
    assert.ok(env.painted.includes('我 · 第2名'));
    assert.ok(env.draws.length > 0);
    assert.equal(env.depth(), 0);
    assert.deepEqual(env.warnings, []);
});

test('原生头像 drawImage 异常不吞掉昵称和成绩，不污染后续绘图裁切', async () => {
    const env = openData({ failDraw: true });
    env.send({ type: 'friends:show', key });
    env.calls[0][1].success({ data: [{ ...user('好友', '900'), avatarUrl: 'https://wx.qlogo.cn/a/132' }] });
    env.calls[1][1].success({ data: [{ openId: 'me' }] });
    env.calls[2][1].success({ KVDataList: [{ key, value: '100' }] });
    await tick();
    env.painted.length = 0;
    env.images[0].onload();
    assert.ok(env.painted.includes('好友'));
    assert.ok(env.painted.includes('900'));
    assert.ok(env.painted.includes('我 · 第2名'));
    assert.equal(env.depth(), 0);
    assert.equal(env.warnings.length, 1);
    assert.match(env.warnings[0][0], /avatar/);
    assert.ok(!env.painted.includes('好友排名暂时没加载出来'));
});

test('主域从屏幕默认尺寸设置榜单宽高后再发show，8fps贴图，重入不清空画布，销毁释放纹理', () => {
    const uploads = [], messages = [], sizeWrites = [];
    let released = 0;
    const dimensions = { width: 390, height: 844 };
    const canvas = new Proxy(dimensions, { set: (obj, name, value) => {
        sizeWrites.push([name, value]); obj[name] = value; return true;
    } });
    class Texture { setPremultiplyAlpha() {} initWithElement(value) { uploads.push(value); } destroy() { released++; } }
    class SpriteFrame { destroy() { released++; } }
    const sprite = { spriteFrame: null, _activateMaterial() {} };
    const cc = { _decorator: { ccclass: cls => cls }, Component: class {}, Texture2D: Texture, SpriteFrame,
        Sprite: { SizeMode: { CUSTOM: 0 } }, macro: { BlendFactor: { ONE: 1 } } };
    const module = { exports: {} };
    vm.runInNewContext(fs.readFileSync(homePath, 'utf8'), { cc, module, exports: module.exports,
        require: name => name.includes('PlatformAdapter') ? { getWxApi: () => ({ getOpenDataContext: () => ({ canvas }) }) }
            : name.includes('WeChatFriends') ? { postFriendMessage: type => {
                assert.equal(canvas.width, 398); assert.equal(canvas.height, 320);
                messages.push(type); return true;
            } } : {} });
    const home = new module.exports.default();
    home.view = { active: false, width: 398, height: 320, addComponent: () => sprite };
    home.placeholder = { active: true };
    home.showRanking();
    assert.deepEqual(messages, ['friends:show']);
    assert.deepEqual(sizeWrites, [['width', 398], ['height', 320]]);
    home.update(0);
    assert.equal(uploads[0], canvas);
    home.update(0.01);
    assert.equal(uploads.length, 1);
    home.update(0.12);
    assert.equal(uploads.length, 2);
    home.showRanking();
    assert.equal(sizeWrites.length, 2, '同尺寸重入不重置画布');
    home.view.active = false;
    home.update(1);
    assert.equal(uploads.length, 2);
    home.onDestroy();
    assert.equal(released, 2);
    assert.equal(sprite.spriteFrame, null);
});

test('微信返回selfOpenId别名时以账号托管标记识别自身，不能重复入榜或按同名同头像猜测', () => {
    const me = { ...user('real-id', '1750'), nickname: '同名', avatarUrl: 'same',
        KVDataList: [{ key, value: '1750' }, { key: `${key}_owner`, value: 'player-123' }] };
    const other = { ...user('other-id', '3000'), nickname: '同名', avatarUrl: 'same' };
    const self = { openId: 'selfOpenId', nickName: '同名', avatarUrl: 'same' };
    const result = rankFriends([other, me], key, self, 1750, 'player-123');
    assert.equal(result.entries.length, 2);
    assert.equal(result.self.id, 'real-id');
    assert.equal(result.self.rank, 2);
    assert.equal(result.entries.filter(entry => entry.isSelf).length, 1);
    const pending = rankFriends([other], key, self, 1750, 'player-123');
    assert.equal(pending.entries.length, 1);
    assert.equal(pending.self.rank, 0, '未匹配时只显示已有分数，名次等待同步');
    assert.ok(!pending.entries.some(entry => entry.id === 'selfOpenId'));
});
