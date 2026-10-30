/** 对正式 HTTPS 接口执行客户端协议验收。仅创建独立零积分、零豆测试档案。 */
const assert = require('node:assert/strict');
const base = process.argv[2] || 'https://api.tcjstory.cn/v1/cocos-zyx';
const id = `release_check_${Date.now()}`;
let token;
async function request(path, body, expected = 200) {
    const response = await fetch(`${base}${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(15000),
    });
    const payload = await response.json();
    assert.equal(response.status, expected, `${path}: ${payload.message || response.status}`);
    return payload;
}
(async () => {
    const health = (await request('/health')).data;
    assert.equal(health.apiVersion, 2);
    const boot = (await request('/players/bootstrap', { deviceId: id, nickname: '发布网络验收', avatarUrl: '' })).data;
    token = boot.token;
    assert.equal(boot.profile.stamina.current, 30);
    const startedAt = Date.now();
    const roundId = `${id}_0`;
    assert.equal((await request('/games/start', { roundId })).data.stamina.current, 29);
    assert.equal((await request('/games/start', { roundId })).data.stamina.current, 29);
    for (let i = 1; i < 30; i++) await request('/games/start', { roundId: `${id}_${i}` });
    assert.equal((await request('/games/start', { roundId: `${id}_empty` }, 429)).errorCode, 'STAMINA_EMPTY');
    const claimId = `share_${id}`;
    assert.equal((await request('/stamina/share-claim', { claimId })).data.stamina.current, 5);
    assert.equal((await request('/stamina/share-claim', { claimId })).data.stamina.current, 5);
    assert.equal((await request('/stamina/share-claim', { claimId: `${claimId}_again` }, 429)).errorCode, 'STAMINA_SHARE_DAILY_LIMIT');
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, 5100 - (Date.now() - startedAt))));
    const settlement = { roundId, startedAt, endedAt: Date.now(), score: 0, collectedMoodBeanCount: 0 };
    assert.equal((await request('/games/settlements', settlement)).data.accepted, true);
    assert.equal((await request('/games/settlements', settlement)).data.duplicate, true);
    assert.equal((await request('/leaderboards?type=power')).data.type, 'power');
    await request('/realm/state', null, 404);
    await request('/rewards', null, 404);
    await request('/debug/profile', {}, 404);
    console.log('PASS: HTTPS 建档、体力扣减/幂等/耗尽、每日分享、结算/幂等、排行榜、退役路由与生产调试隔离');
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
