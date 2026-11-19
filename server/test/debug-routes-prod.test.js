/**
 * R0：生产环境不得注册任何 /debug/* 路由。
 * node --test 按文件独立进程运行，本文件在加载服务前把 NODE_ENV 置为 production。
 * 期望两个调试路由返回 404（路由不存在），而不是 401/403 暗示接口仍存在。
 */
process.env.NODE_ENV = 'production';
process.env.ENABLE_GM_ROUTES = '1'; // 即使误设开关，生产环境也必须不注册

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const { start } = require('../src/index.js');

let server;
let weChatServer;
let baseUrl;
const weChatLoginCodes = new Map();

test.before(async () => {
  process.env.WECHAT_APP_SECRET = 'test-secret';
  weChatServer = http.createServer((req, res) => {
    const code = new URL(req.url, 'http://127.0.0.1').searchParams.get('js_code');
    const openid = weChatLoginCodes.get(code);
    weChatLoginCodes.delete(code);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(openid ? { openid } : { errcode: 40029, errmsg: 'invalid code' }));
  });
  weChatServer.listen(0);
  await new Promise((resolve) => weChatServer.once('listening', resolve));
  process.env.WECHAT_API_BASE_URL = `http://127.0.0.1:${weChatServer.address().port}`;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-cloud-prod-test-'));
  const app = await start(path.join(tempDir, 'test.sqlite'));
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  delete process.env.WECHAT_APP_SECRET;
  delete process.env.WECHAT_API_BASE_URL;
  await new Promise((resolve) => server.close(resolve));
  await new Promise((resolve) => weChatServer.close(resolve));
});

test('生产环境 /debug/profile 与 /debug/reset 均为 404', async () => {
  const guest = await fetch(`${baseUrl}/v1/cocos-zyx/players/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: 'prod_guard_device' }),
  });
  assert.strictEqual(guest.status, 401);
  assert.strictEqual((await guest.json()).errorCode, 'WECHAT_LOGIN_REQUIRED');

  weChatLoginCodes.set('prod_code_1', 'prod_openid');
  const boot = await fetch(`${baseUrl}/v1/cocos-zyx/players/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: 'prod_guard_device', loginCode: 'prod_code_1', nickname: '测试玩家', avatarUrl: '' }),
  });
  const bootPayload = await boot.json();
  assert.strictEqual(boot.status, 200);
  const token = bootPayload.data.token;

  for (const route of ['/debug/profile', '/debug/reset']) {
    const response = await fetch(`${baseUrl}/v1/cocos-zyx${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ moodBeanBalance: 999999 }),
    });
    assert.strictEqual(response.status, 404, `生产环境必须不注册 ${route}`);
  }

  weChatLoginCodes.set('prod_code_2', 'prod_openid');
  const state = await fetch(`${baseUrl}/v1/cocos-zyx/players/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ deviceId: 'prod_guard_device', loginCode: 'prod_code_2', nickname: '', moodBeanBalance: 999999 }),
  });
  const statePayload = await state.json();
  assert.strictEqual(statePayload.data.profile.moodBeanBalance, 0);
});
