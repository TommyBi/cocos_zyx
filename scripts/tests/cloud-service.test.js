const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
let cloud;
let store;
test.before(() => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-cloud-'));
    try {
        execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/manager/CloudService.ts', '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck'], { stdio: 'pipe' });
    } catch (_) { /* Cocos 类型在独立编译时不可见，检查 JS 产物。 */ }
    store = new Map();
    global.cc = { sys: { localStorage: { getItem: (k) => store.get(k), setItem: (k, v) => store.set(k, v) } } };
    cloud = require(path.join(out, 'CloudService.js'));
});
test.afterEach(() => { delete global.wx; store.clear(); });
test('浏览器覆盖仅接受本机 API，忽略陈旧远程配置', () => {
    store.set('zyx_api_base_override', 'http://localhost:8080/v1/cocos-zyx/');
    assert.equal(cloud.getApiBase(), 'http://localhost:8080/v1/cocos-zyx');
    store.set('zyx_api_base_override', 'https://old.invalid');
    assert.equal(cloud.getApiBase(), 'https://api.tcjstory.cn/v1/cocos-zyx');
});
test('微信请求忽略残留 localhost，使用正式 HTTPS 与 Authorization', async () => {
    store.set('zyx_api_base_override', 'http://localhost:8080/v1/cocos-zyx');
    store.set('zyx_cloud_token', 'test-token');
    global.wx = { request: (options) => {
        assert.equal(options.url, 'https://api.tcjstory.cn/v1/cocos-zyx/games/start');
        assert.equal(options.header.Authorization, 'Bearer test-token');
        options.success({ statusCode: 200, data: { code: 0, data: { roundId: 'test', stamina: { current: 29 } } } });
    } };
    assert.equal(cloud.isLocalApiOverrideActive(), false);
    assert.equal((await cloud.cloudService.startRound('test')).stamina.current, 29);
});
