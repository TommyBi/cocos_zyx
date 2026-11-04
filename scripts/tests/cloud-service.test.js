const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
let cloud;
let platform;
let store;
test.before(() => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-cloud-'));
    try {
        execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/manager/CloudService.ts', '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck'], { stdio: 'pipe' });
    } catch (_) { /* Cocos 类型在独立编译时不可见，检查 JS 产物。 */ }
    store = new Map();
    global.cc = { sys: { localStorage: { getItem: (k) => store.get(k), setItem: (k, v) => store.set(k, v) } } };
    cloud = require(path.join(out, 'CloudService.js'));
    platform = require(path.join(out, 'PlatformAdapter.js'));
});
test.afterEach(() => { delete global.wx; store.clear(); });

// ── 浏览器环境：统一走 Staging ──

test('浏览器 Web 预览默认连 Staging', () => {
    assert.equal(cloud.getApiBase(), 'https://staging-api.tcjstory.cn/v1/cocos-zyx');
    assert.equal(cloud.getEnvName(), 'staging');
    assert.equal(cloud.isLocalApiOverrideActive(), true);
});

test('浏览器忽略残留 localStorage override，仍走 Staging', () => {
    store.set('zyx_api_base_override', 'http://localhost:8080/v1/cocos-zyx/');
    assert.equal(cloud.getApiBase(), 'https://staging-api.tcjstory.cn/v1/cocos-zyx');
    assert.equal(cloud.getEnvName(), 'staging');
});

// ── 微信环境 ──

test('微信正式版（release）使用 Production API', async () => {
    store.set('zyx_cloud_token', 'test-token');
    global.wx = {
        getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
        request: (options) => {
            assert.equal(options.url, 'https://api.tcjstory.cn/v1/cocos-zyx/games/start');
            assert.equal(options.header.Authorization, 'Bearer test-token');
            options.success({ statusCode: 200, data: { code: 0, data: { roundId: 'test', stamina: { current: 29 } } } });
        },
    };
    assert.equal(cloud.getEnvName(), 'production');
    assert.equal(cloud.isLocalApiOverrideActive(), false);
    assert.equal((await cloud.cloudService.startRound('test')).stamina.current, 29);
});

test('微信体验版（trial）使用 Staging API', async () => {
    store.set('zyx_cloud_token', 'test-token');
    global.wx = {
        getAccountInfoSync: () => ({ miniProgram: { envVersion: 'trial' } }),
        request: (options) => {
            assert.equal(options.url, 'https://staging-api.tcjstory.cn/v1/cocos-zyx/games/start');
            options.success({ statusCode: 200, data: { code: 0, data: { roundId: 'test', stamina: { current: 29 } } } });
        },
    };
    assert.equal(cloud.getEnvName(), 'staging');
    assert.equal(cloud.isLocalApiOverrideActive(), true);
    assert.equal((await cloud.cloudService.startRound('test')).stamina.current, 29);
});

test('微信开发版（develop）使用 Staging API', async () => {
    store.set('zyx_cloud_token', 'test-token');
    global.wx = {
        getAccountInfoSync: () => ({ miniProgram: { envVersion: 'develop' } }),
        request: (options) => {
            assert.equal(options.url, 'https://staging-api.tcjstory.cn/v1/cocos-zyx/games/start');
            options.success({ statusCode: 200, data: { code: 0, data: { roundId: 'test', stamina: { current: 29 } } } });
        },
    };
    assert.equal(cloud.getEnvName(), 'staging');
    assert.equal((await cloud.cloudService.startRound('test')).stamina.current, 29);
});

test('微信 getAccountInfoSync 不可用时安全兜底到 Production', () => {
    global.wx = { request: () => {} };
    assert.equal(cloud.getApiBase(), 'https://api.tcjstory.cn/v1/cocos-zyx');
    assert.equal(cloud.getEnvName(), 'production');
});

test('资料更新只走独立接口并携带微信昵称头像', async () => {
    store.set('zyx_cloud_token', 'test-token');
    global.wx = {
        getAccountInfoSync: () => ({ miniProgram: { envVersion: 'trial' } }),
        request: (options) => {
            assert.equal(options.url, 'https://staging-api.tcjstory.cn/v1/cocos-zyx/players/profile');
            assert.deepEqual(options.data, { nickname: '微信玩家', avatarUrl: 'https://thirdwx.qlogo.cn/avatar.png' });
            options.success({ statusCode: 200, data: { code: 0, data: { profile: { nickname: '微信玩家' } } } });
        },
    };
    const profile = await cloud.cloudService.updateWeChatProfile('微信玩家', 'https://thirdwx.qlogo.cn/avatar.png');
    assert.equal(profile.nickname, '微信玩家');
});

test('微信建档携带一次性 loginCode，清缓存后 deviceId 改变仍提交微信身份', async () => {
    const bodies = [];
    let loginSeq = 0;
    global.wx = {
        getAccountInfoSync: () => ({ miniProgram: { envVersion: 'develop' } }),
        login: (options) => options.success({ code: `login_code_${++loginSeq}` }),
        request: (options) => {
            assert.equal(options.url, 'https://staging-api.tcjstory.cn/v1/cocos-zyx/players/bootstrap');
            bodies.push(options.data);
            options.success({ statusCode: 200, data: { code: 0, data: { token: `token_${loginSeq}`, profile: { playerId: 'stable_player' } } } });
        },
    };
    assert.equal((await cloud.cloudService.bootstrap('', '')).playerId, 'stable_player');
    store.clear();
    assert.equal((await cloud.cloudService.bootstrap('', '')).playerId, 'stable_player');
    assert.equal(bodies[0].loginCode, 'login_code_1');
    assert.equal(bodies[1].loginCode, 'login_code_2');
    assert.ok(bodies[0].deviceId);
    assert.ok(bodies[1].deviceId);
    assert.notEqual(bodies[0].deviceId, bodies[1].deviceId);
});

test('wx.login 失败时不发建档请求，不静默创建新的设备账号', async () => {
    let requested = false;
    global.wx = {
        login: (options) => options.fail({ errMsg: 'login:fail test' }),
        request: () => { requested = true; },
    };
    await assert.rejects(cloud.cloudService.bootstrap('', ''), /login:fail test/);
    assert.equal(requested, false);
});

test('已授权玩家直接读取微信资料，不重复创建原生授权按钮', async () => {
    let buttonCreated = false;
    global.wx = {
        getSetting: (options) => options.success({ authSetting: { 'scope.userInfo': true } }),
        getUserInfo: (options) => options.success({
            userInfo: { nickName: '  已授权玩家  ', avatarUrl: 'https://thirdwx.qlogo.cn/avatar.png' },
        }),
        createUserInfoButton: () => { buttonCreated = true; },
    };
    assert.deepEqual(await platform.requestWeChatUserProfile(), {
        nickName: '已授权玩家', avatarUrl: 'https://thirdwx.qlogo.cn/avatar.png',
    });
    assert.equal(buttonCreated, false);
});

test('未授权玩家使用全屏透明原生按钮，授权成功销毁按钮并收起底部说明层', async () => {
    let tap;
    let destroyed = 0;
    let sheetShown = 0;
    let sheetHidden = 0;
    let getUserProfileCalled = false;
    global.wx = {
        getSetting: (options) => options.success({ authSetting: { 'scope.userInfo': false } }),
        getUserInfo: () => { throw new Error('未授权时不得直接读取资料'); },
        getWindowInfo: () => ({ windowWidth: 390, windowHeight: 844 }),
        createUserInfoButton: (options) => {
            assert.equal(options.type, 'text');
            assert.equal(options.text, '');
            assert.equal(options.style.left, 0);
            assert.equal(options.style.top, 0);
            assert.equal(options.style.width, 390);
            assert.equal(options.style.height, 844);
            assert.equal(options.style.backgroundColor, 'rgba(0,0,0,0)');
            assert.equal(options.style.borderWidth, 0);
            return { onTap: (callback) => { tap = callback; }, destroy: () => { destroyed++; } };
        },
        getUserProfile: () => { getUserProfileCalled = true; },
    };
    const pending = platform.requestWeChatUserProfile(() => {
        sheetShown++;
        return () => { sheetHidden++; };
    });
    tap({ userInfo: { nickName: '  微信玩家  ', avatarUrl: 'https://thirdwx.qlogo.cn/avatar.png' } });
    assert.deepEqual(await pending, { nickName: '微信玩家', avatarUrl: 'https://thirdwx.qlogo.cn/avatar.png' });
    assert.equal(destroyed, 1);
    assert.equal(sheetShown, 1);
    assert.equal(sheetHidden, 1);
    assert.equal(getUserProfileCalled, false);
});

test('原生授权拒绝返回真实错误并收起说明层，旧容器才使用 getUserProfile 兜底', async () => {
    let tap;
    let sheetHidden = 0;
    global.wx = {
        createUserInfoButton: () => ({ onTap: (callback) => { tap = callback; }, destroy: () => undefined }),
    };
    const denied = platform.requestWeChatUserProfile(() => () => { sheetHidden++; });
    tap({ errMsg: 'getUserInfo:fail auth deny' });
    await assert.rejects(denied, /auth deny/);
    assert.equal(sheetHidden, 1);
    global.wx = {
        getUserProfile: (options) => options.success({ userInfo: { nickName: '旧版玩家', avatarUrl: '' } }),
    };
    assert.deepEqual(await platform.requestWeChatUserProfile(), { nickName: '旧版玩家', avatarUrl: '' });
});

test('原生授权按钮创建异常时也清理底部说明层', async () => {
    let sheetHidden = 0;
    global.wx = {
        createUserInfoButton: () => { throw new Error('create button failed'); },
    };
    await assert.rejects(
        platform.requestWeChatUserProfile(() => () => { sheetHidden++; }),
        /create button failed/,
    );
    assert.equal(sheetHidden, 1);
});

test('Web 与无效微信昵称不会伪装授权成功', async () => {
    await assert.rejects(platform.requestWeChatUserProfile(), /不支持/);
    global.wx = { getUserProfile: (options) => options.success({ userInfo: { nickName: ' ', avatarUrl: '' } }) };
    await assert.rejects(platform.requestWeChatUserProfile(), /有效的微信昵称/);
});
