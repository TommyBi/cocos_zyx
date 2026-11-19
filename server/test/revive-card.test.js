process.env.ENABLE_GM_ROUTES = '1';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const initSqlJs = require('sql.js');
const { start } = require('../src/index');
const { replayBoardEngine } = require('../src/replayBoardEngine');
const { firstFailure, secondFailure, untilFailure, adRevive } = require('../../scripts/fixtures/revival-card-helper.cjs');
let server, base, dbPath, clock, realNow, sequence = 0;
test.before(async () => {
    realNow = Date.now; clock = realNow(); Date.now = () => clock;
    dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-card-')), 'test.sqlite');
    server = (await start(dbPath)).listen(0, '127.0.0.1');
    await new Promise(r => server.once('listening', r)); base = `http://127.0.0.1:${server.address().port}/v1/cocos-zyx`;
});
test.after(async () => { Date.now = realNow; await new Promise(r => server.close(r)); });
async function api(url, token, body) {
    // 固定时钟会大步跳转，且构造失败棋盘可能占用数秒。每个测试请求使用独立连接。
    const response = await fetch(base + url, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Connection: 'close', Authorization: `Bearer ${token || ''}` }, body: body ? JSON.stringify(body) : undefined });
    return { status: response.status, ...await response.json() };
}
async function player(balance = 50) {
    const deviceId = `revive_card_${++sequence}`;
    const user = (await api('/players/bootstrap', null, { deviceId })).data;
    await api('/debug/profile', user.token, { moodBeanBalance: balance, totalMoodBeans: balance });
    return { ...user, deviceId };
}
const purchase = (user, id = `card_purchase_${++sequence}`) => api('/shop/exchanges', user.token, { actionId: id, item: 'reviveCard', price: 0, quantity: 999 });
async function begun(user, version = 11) {
    const r = await api('/games/start', user.token, { roundId: `round_card_${++sequence}`, rulesVersion: version, collectionRule: 'progress_v2', resumeProtocol: 1 });
    assert.equal(r.status, 200, JSON.stringify(r)); return r.data;
}
function request(start, board, elapsedMs = 10000) {
    return { roundId: start.roundId, sessionToken: start.sessionToken, actions: JSON.parse(JSON.stringify(board.roundActions)), elapsedMs };
}
function payload(start, board, sessionToken = start.sessionToken) {
    return { roundId: start.roundId, sessionToken, startedAt: clock - 10000, endedAt: clock,
        actions: board.roundActions, score: board.score, collectedMoodBeanCount: board.roundCollectedMoodBeans };
}
async function disk(sql, params = []) {
    const SQL = await initSqlJs(); const db = new SQL.Database(fs.readFileSync(dbPath));
    const stmt = db.prepare(sql); stmt.bind(params); const rows = []; while (stmt.step()) rows.push(stmt.getAsObject()); stmt.free(); db.close(); return rows;
}

test('24豆不足、25豆恰好购买1张，伪造价格数量无效，重复及并发不透支', async () => {
    const poor = await player(24); assert.equal((await purchase(poor)).errorCode, 'BEANS_INSUFFICIENT');
    const user = await player(25); const pair = await Promise.all([purchase(user, 'card_same_purchase'), purchase(user, 'card_same_purchase')]);
    assert.ok(pair.every(r => r.status === 200)); assert.equal(pair.filter(r => r.data.duplicate).length, 1);
    assert.equal(pair[0].data.price, 25); assert.equal(pair[0].data.profile.moodBeanBalance, 0); assert.equal(pair[0].data.profile.inventory.reviveCard, 1);
    assert.equal((await purchase(user)).errorCode, 'BEANS_INSUFFICIENT');
    const fresh = (await api('/players/bootstrap', null, { deviceId: user.deviceId })).data.profile;
    assert.equal(fresh.inventory.reviveCard, 1); assert.equal(fresh.totalMoodBeans, 25);
    const race = await player(25); const results = await Promise.all([purchase(race), purchase(race)]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
    assert.equal((await api('/games/tools/reward', user.token, { roundId: 'no_round', item: 'reviveCard', actionId: 'card_free_reward' })).errorCode, 'TOOL_REQUEST_INVALID');
});

test('第一次失败不能用卡，未失败不能用卡，无卡第二次失败也不产生消费', async () => {
    const user = await player(); await purchase(user); const start = await begun(user); clock += 12000;
    const first = firstFailure(start); assert.equal((await api('/games/revive-card', user.token, request(start, first))).errorCode, 'REVIVE_CARD_UNAVAILABLE');
    const notFailed = adRevive(firstFailure(start));
    assert.equal((await api('/games/revive-card', user.token, request(start, notFailed))).errorCode, 'REVIVE_CARD_UNAVAILABLE');
    const other = await player(0); const noCard = await begun(other); clock += 12000;
    assert.equal((await api('/games/revive-card', other.token, request(noCard, secondFailure(noCard)))).errorCode, 'TOOL_INSUFFICIENT');
    assert.equal((await api('/games/settlements', other.token, payload(noCard, secondFailure(noCard)))).status, 200, '无卡仍可正常结算');
    assert.equal((await api('/players/bootstrap', null, { deviceId: user.deviceId })).data.profile.inventory.reviveCard, 1);
});

test('第二次失败用卡原子扣库存并保存完整棋盘；并发、丢响应重试、冷恢复与结算均只认一次', async () => {
    const user = await player(50); await purchase(user); await purchase(user);
    const start = await begun(user); const board = secondFailure(start); clock += 20000;
    const req = request(start, board);
    const pair = await Promise.all([api('/games/revive-card', user.token, req), api('/games/revive-card', user.token, req)]);
    assert.ok(pair.every(r => r.status === 200), JSON.stringify(pair)); assert.equal(pair.filter(r => r.data.duplicate).length, 1);
    const saved = pair[0].data.round;
    assert.equal(pair[0].data.profile.inventory.reviveCard, 1);
    assert.equal(saved.actions.filter(a => a.type === 'reviveCard').length, 1);
    const replay = replayBoardEngine(start.seed, start.isTutorial, saved.actions, 11, start.heartRescueEligible, true, true);
    assert.equal(replay.valid, true); assert.equal(replay.ready, true); assert.equal(replay.board.isGameOver(), false);
    const rows = await disk('SELECT revive_card_count FROM players WHERE player_id = ?', [user.profile.playerId]); assert.equal(rows[0].revive_card_count, 1);
    const transactions = await disk("SELECT * FROM tool_transactions WHERE player_id = ? AND kind = 'use'", [user.profile.playerId]);
    assert.equal(transactions.length, 1); assert.equal(saved.actions[transactions[0].action_index].type, 'reviveCard');
    // 消费成功但客户端没有拿到响应：冷启动恢复云端完整进度，不能回到用卡前。
    const active = (await api('/games/active', user.token)).data.round;
    const resumed = await api('/games/resume', user.token, { roundId: start.roundId, expectedGeneration: active.generation, requestId: 'resume_card_cold_1', actions: req.actions, elapsedMs: req.elapsedMs });
    assert.equal(resumed.status, 200); assert.deepEqual(resumed.data.actions, saved.actions);
    assert.equal((await api('/games/revive-card', user.token, req)).errorCode, 'ROUND_SESSION_CONFLICT');
    const after = untilFailure(replay.board);
    const nextReq = request({ ...start, sessionToken: resumed.data.sessionToken }, after);
    assert.equal((await api('/games/revive-card', user.token, nextReq)).errorCode, 'PROGRESS_CONFLICT', '同一局不能第二次用卡');
    assert.equal((await api('/games/checkpoint', user.token, nextReq)).status, 200);
    const settlement = payload(start, after, resumed.data.sessionToken);
    const result = await api('/games/settlements', user.token, settlement); assert.equal(result.status, 200, JSON.stringify(result));
    assert.equal((await api('/games/settlements', user.token, settlement)).data.duplicate, true);
    assert.equal(result.data.settlement.profile.inventory.reviveCard, 1);
    assert.equal((await disk("SELECT COUNT(*) AS count FROM tool_transactions WHERE player_id = ? AND kind = 'use'", [user.profile.playerId]))[0].count, 1);
});

test('无服务端用卡凭据的复活、第二次广告复活、超范围与伪造前缀，保存及最终结算均拒绝', async () => {
    const user = await player(); await purchase(user); const start = await begun(user); clock += 20000;
    const board = secondFailure(start); assert.ok(board.removeTopRowsForRevive(8, true).length); board.resolveBoard(); board.appendTurnRows(); board.resolveBoard(); board.finishPlayerAction();
    assert.equal((await api('/games/checkpoint', user.token, request(start, board))).errorCode, 'PROGRESS_INVALID');
    assert.notEqual((await api('/games/settlements', user.token, payload(start, board))).status, 200);
    const asAd = request(start, board); asAd.actions.find(a => a.type === 'reviveCard').type = 'revive';
    assert.notEqual((await api('/games/checkpoint', user.token, asAd)).status, 200);
    const wrong = secondFailure(start); wrong.roundActions.push({ type: 'reviveCard', rowCount: 10 });
    assert.notEqual((await api('/games/revive-card', user.token, request(start, wrong))).status, 200);
    assert.equal((await api('/players/bootstrap', null, { deviceId: user.deviceId })).data.profile.inventory.reviveCard, 1);
});

test('落盘失败后原请求重试只扣一张，重新登录可见完整复活存档', async () => {
    const user = await player(); await purchase(user); const start = await begun(user); clock += 20000;
    const req = request(start, secondFailure(start)); const realOpen = fs.openSync;
    fs.openSync = function (file, ...args) { if (String(file) === `${dbPath}.tmp`) throw Error('injected card disk failure'); return realOpen.call(this, file, ...args); };
    try { assert.equal((await api('/games/revive-card', user.token, req)).status, 500); } finally { fs.openSync = realOpen; }
    const retry = await api('/games/revive-card', user.token, req); assert.equal(retry.status, 200, JSON.stringify(retry));
    assert.equal(retry.data.duplicate, true); assert.equal(retry.data.profile.inventory.reviveCard, 0);
    assert.equal((await api('/games/active', user.token)).data.round.actionCount, retry.data.round.actions.length);
});

test('V10在途存档仍可恢复和结算，不能借新版接口增加一次复活；卡片库存不受影响', async () => {
    const user = await player(); await purchase(user); const start = await begun(user, 10); clock += 20000;
    const board = secondFailure(start);
    assert.equal((await api('/games/revive-card', user.token, request(start, board))).errorCode, 'REVIVE_CARD_UNAVAILABLE');
    assert.equal((await api('/games/checkpoint', user.token, request(start, board))).status, 200);
    const resumed = await api('/games/resume', user.token, { roundId: start.roundId, expectedGeneration: 0, requestId: 'old_v10_resume_card' });
    assert.equal(resumed.status, 200); assert.equal(resumed.data.rulesVersion, 10);
    assert.equal((await api('/games/settlements', user.token, payload(start, board, resumed.data.sessionToken))).status, 200);
    assert.equal((await api('/players/bootstrap', null, { deviceId: user.deviceId })).data.profile.inventory.reviveCard, 1);
});


test('有卡选择结算不消费，也不能跨账号或使用错误会话消费', async () => {
    const user = await player(); await purchase(user); const other = await player(); const start = await begun(user); clock += 20000;
    const board = secondFailure(start), req = request(start, board);
    assert.notEqual((await api('/games/revive-card', other.token, req)).status, 200);
    assert.equal((await api('/games/revive-card', user.token, { ...req, sessionToken: 'wrong-session' })).errorCode, 'ROUND_SESSION_CONFLICT');
    const result = await api('/games/settlements', user.token, payload(start, board));
    assert.equal(result.status, 200); assert.equal(result.data.settlement.profile.inventory.reviveCard, 1);
    assert.equal((await disk("SELECT COUNT(*) AS count FROM tool_transactions WHERE player_id = ? AND kind = 'use'", [user.profile.playerId]))[0].count, 0);
});

test('V12保留广告后卡片各一次的上限，完整复活存档可重放并继续到第三次失败', async () => {
    const user = await player(50); await purchase(user); await purchase(user);
    const start = await begun(user, 12); clock += 20000;
    const second = secondFailure(start);
    const revived = await api('/games/revive-card', user.token, request(start, second));
    assert.equal(revived.status, 200, JSON.stringify(revived));
    const result = replayBoardEngine(start.seed, start.isTutorial, revived.data.round.actions, 12, start.heartRescueEligible, true, true);
    assert.equal(result.valid, true); assert.equal(result.ready, true);
    const board = untilFailure(result.board); assert.deepEqual(board.removeTopRowsForRevive(8, true), []);
    assert.deepEqual(board.removeTopRowsForRevive(8), []);
    clock += 20000;
    const settled = await api('/games/settlements', user.token, payload(start, board));
    assert.equal(settled.status, 200, JSON.stringify(settled)); assert.equal(settled.data.settlement.profile.inventory.reviveCard, 1);
});
