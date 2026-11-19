/** 对指定环境的 HTTPS 接口执行客户端协议验收。仅创建独立零积分、零豆测试档案。 */
const assert = require('node:assert/strict');
const { default: BoardEngine, BOARD_RULES_VERSION } = require('../server/src/boardEngine');

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
    assert.equal(health.apiVersion, 15);
    assert.equal(health.schemaVersion, 10);
    assert.ok(health.capabilities.includes('bean-collection-1pct'));
    assert.ok(health.capabilities.includes('rising-rows-v5'));
    assert.ok(health.capabilities.includes('balloon-rescue-v6'));
    assert.ok(health.capabilities.includes('balloon-blast-v7'));
    assert.ok(health.capabilities.includes('random-rescue-v8'));
    assert.ok(health.capabilities.includes('rescue-scoring-v9'));
    assert.ok(health.capabilities.includes('heart-rescue-v10'));
    assert.ok(health.capabilities.includes('revive-card-v11'));
    const boot = (await request('/players/bootstrap', { deviceId: id, nickname: '发布网络验收', avatarUrl: '' })).data;
    token = boot.token;
    assert.equal(boot.profile.stamina.current, 10);
    for (const item of ['hammer','magicWand','stamina','reviveCard']) {
        const rejected = await request('/shop/exchanges', { actionId:`${id}_${item}`, item }, 409);
        assert.equal(rejected.errorCode,'BEANS_INSUFFICIENT');
    }
    const startedAt = Date.now();
    const roundId = `${id}_0`;
    const firstStart = (await request('/games/start', { roundId, collectionRule: 'progress_v2', rulesVersion: BOARD_RULES_VERSION })).data;
    assert.equal(firstStart.stamina.current, 9);
    assert.equal(firstStart.rulesVersion, BOARD_RULES_VERSION);
    assert.equal(firstStart.isTutorial, true);
    const retryStart = (await request('/games/start', { roundId, collectionRule: 'progress_v2', rulesVersion: BOARD_RULES_VERSION })).data;
    assert.equal(retryStart.stamina.current, 9);
    assert.equal(retryStart.seed, firstStart.seed);
    assert.equal(retryStart.isTutorial, firstStart.isTutorial);
    const v5RoundId = `${id}_v5`;
    const v5Start = (await request('/games/start', { roundId: v5RoundId, collectionRule: 'progress_v2', rulesVersion: 5 })).data;
    assert.equal(v5Start.rulesVersion, 5);
    assert.equal(v5Start.stamina.current, 8);
    const v5Retry = (await request('/games/start', { roundId: v5RoundId, collectionRule: 'progress_v2', rulesVersion: 5 })).data;
    assert.equal(v5Retry.duplicate, true);
    assert.equal(v5Retry.stamina.current, 8);
    assert.equal(v5Retry.seed, v5Start.seed);
    const v6Start = (await request('/games/start', { roundId: `${id}_v6`, collectionRule: 'progress_v2', rulesVersion: 6 })).data;
    assert.equal(v6Start.rulesVersion, 6);
    assert.equal(v6Start.stamina.current, 7);
    const v7Start = (await request('/games/start', { roundId: `${id}_v7`, collectionRule: 'progress_v2', rulesVersion: 7 })).data;
    assert.equal(v7Start.rulesVersion, 7);
    assert.equal(v7Start.stamina.current, 6);
    const v8Start = (await request('/games/start', { roundId: `${id}_v8`, collectionRule: 'progress_v2', rulesVersion: 8 })).data;
    assert.equal(v8Start.rulesVersion, 8);
    assert.equal(v8Start.stamina.current, 5);
    for (let i = 5; i < 10; i++) await request('/games/start', { roundId: `${id}_${i}`, collectionRule: 'progress_v2', rulesVersion: BOARD_RULES_VERSION });
    assert.equal((await request('/games/start', { roundId: `${id}_empty`, collectionRule: 'progress_v2', rulesVersion: BOARD_RULES_VERSION }, 429)).errorCode, 'STAMINA_EMPTY');
    const claimId = `share_${id}`;
    assert.equal((await request('/stamina/share-claim', { claimId })).data.stamina.current, 5);
    assert.equal((await request('/stamina/share-claim', { claimId })).data.stamina.current, 5);
    assert.equal((await request('/stamina/share-claim', { claimId: `${claimId}_again` }, 429)).errorCode, 'STAMINA_SHARE_DAILY_LIMIT');
    // 后开的兼容版本对局也必须满5秒；只从首局计时会受网络耗时影响。
    await new Promise((resolve) => setTimeout(resolve, 5100));
    for (const started of [firstStart, v5Start, v6Start, v7Start, v8Start]) {
        const board = new BoardEngine();
        board.resetBoard(started.seed, started.isTutorial, started.rulesVersion);
        const settlement = {
            roundId: started.roundId, startedAt, endedAt: Date.now(), score: board.score,
            collectedMoodBeanCount: board.roundCollectedMoodBeans, actions: board.roundActions,
        };
        assert.equal((await request('/games/settlements', settlement)).data.accepted, true);
        assert.equal((await request('/games/settlements', settlement)).data.duplicate, true);
    }
    const leaderboard = (await request('/leaderboards?type=power')).data;
    assert.equal(Array.isArray(leaderboard.entries), true);
    assert.equal(leaderboard.self.bestScore, 0);
    assert.equal(leaderboard.self.rank, null);
    assert.equal(leaderboard.entries.some(entry => entry.playerId === boot.profile.playerId), false);
    await request('/realm/state', null, 404);
    await request('/rewards', null, 404);
    // GM 调试路由：Production 必须 404（隔离），Staging/Local 允许存在
    const isProduction = base === ENV_MAP.production;
    if (isProduction) {
        await request('/debug/profile', {}, 404);
        await request('/debug/reset', {}, 404);
    }
    console.log(`PASS [${isProduction ? 'production' : 'staging/local'}]: 建档、V5/V6/V7/V8/V9并行开局及结算/幂等、体力扣减/耗尽、每日分享、排行榜、退役路由${isProduction ? '与生产调试隔离' : ''}`);
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
