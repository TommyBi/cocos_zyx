/** 对指定环境的 HTTPS 接口执行客户端协议验收。仅创建独立零积分、零豆测试档案。 */
const assert = require('node:assert/strict');

const ENV_MAP = {
    production: 'https://api.tcjstory.cn/v1/cocos-zyx',
    staging: 'https://staging-api.tcjstory.cn/v1/cocos-zyx',
};
const envOrUrl = process.argv[2] || 'production';
const base = ENV_MAP[envOrUrl] || envOrUrl;
console.log(`验收目标：${base}`);
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
    assert.equal(health.apiVersion, 3);
    const boot = (await request('/players/bootstrap', { deviceId: id, nickname: '发布网络验收', avatarUrl: '' })).data;
    token = boot.token;
    assert.equal(boot.profile.stamina.current, 10);
    const startedAt = Date.now();
    const roundId = `${id}_0`;
    const firstStart = (await request('/games/start', { roundId })).data;
    assert.equal(firstStart.stamina.current, 9);
    assert.equal(firstStart.isTutorial, true);
    const retryStart = (await request('/games/start', { roundId })).data;
    assert.equal(retryStart.stamina.current, 9);
    assert.equal(retryStart.seed, firstStart.seed);
    assert.equal(retryStart.isTutorial, firstStart.isTutorial);
    for (let i = 1; i < 10; i++) await request('/games/start', { roundId: `${id}_${i}` });
    assert.equal((await request('/games/start', { roundId: `${id}_empty` }, 429)).errorCode, 'STAMINA_EMPTY');
    const claimId = `share_${id}`;
    assert.equal((await request('/stamina/share-claim', { claimId })).data.stamina.current, 5);
    assert.equal((await request('/stamina/share-claim', { claimId })).data.stamina.current, 5);
    assert.equal((await request('/stamina/share-claim', { claimId: `${claimId}_again` }, 429)).errorCode, 'STAMINA_SHARE_DAILY_LIMIT');
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, 5100 - (Date.now() - startedAt))));
    const settlement = {
        roundId,
        startedAt,
        endedAt: Date.now(),
        score: 10,
        collectedMoodBeanCount: 3,
        actions: [{ type: 'move', id: 1, offset: -1 }],
    };
    assert.equal((await request('/games/settlements', settlement)).data.accepted, true);
    assert.equal((await request('/games/settlements', settlement)).data.duplicate, true);
    const leaderboard = (await request('/leaderboards?type=power')).data;
    assert.equal(Array.isArray(leaderboard.entries), true);
    assert.equal(leaderboard.self.bestScore, 10);
    await request('/realm/state', null, 404);
    await request('/rewards', null, 404);
    // GM 调试路由：Production 必须 404（隔离），Staging/Local 允许存在
    const isProduction = base === ENV_MAP.production;
    if (isProduction) {
        await request('/debug/profile', {}, 404);
    }
    console.log(`PASS [${isProduction ? 'production' : 'staging/local'}]: 建档、体力扣减/幂等/耗尽、每日分享、结算/幂等、排行榜、退役路由${isProduction ? '与生产调试隔离' : ''}`);
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
