/**
 * R0：非生产但未显式设置 ENABLE_GM_ROUTES=1 时，调试路由同样必须不存在（404）。
 * 只有“本地开发 + 显式启用”双条件同时满足才允许注册。
 */
delete process.env.NODE_ENV;
delete process.env.ENABLE_GM_ROUTES;

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { start } = require('../src/index.js');

let server;
let baseUrl;

test.before(async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-cloud-gmoff-test-'));
  const app = await start(path.join(tempDir, 'test.sqlite'));
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise((resolve) => server.close(resolve)));

test('未显式启用 ENABLE_GM_ROUTES 时调试路由为 404', async () => {
  const boot = await fetch(`${baseUrl}/v1/cocos-zyx/players/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: 'gm_off_device', nickname: '测试玩家', avatarUrl: '' }),
  });
  const bootPayload = await boot.json();
  const token = bootPayload.data.token;

  for (const route of ['/debug/profile', '/debug/reset']) {
    const response = await fetch(`${baseUrl}/v1/cocos-zyx${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ moodBeanBalance: 999999 }),
    });
    assert.strictEqual(response.status, 404, `未启用 ENABLE_GM_ROUTES 时必须不注册 ${route}`);
  }
});
