process.env.ENABLE_GM_ROUTES = '1';
delete process.env.ALLOW_LEGACY_ROUND_STARTS;
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const initSqlJs = require('sql.js');
const { start } = require('../src/index');
const { default: BoardEngine, BOARD_RULES_VERSION } = require('../src/boardEngine');
let server, base, dbPath, clock, realNow;
let seq = 0;
test.before(async () => {
  realNow = Date.now; clock = realNow(); Date.now = () => clock;
  dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-shop-test-')), 'shop.sqlite');
  server = (await start(dbPath)).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/v1/cocos-zyx`;
});
test.after(async () => { Date.now = realNow; await new Promise(resolve => server.close(resolve)); });
async function api(route, token, body) {
  const response = await fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` }, body: JSON.stringify(body) });
  return { status: response.status, ...(await response.json()) };
}
async function player(balance = 40) {
  const deviceId = `shop_test_${++seq}`;
  const boot = await api('/players/bootstrap', '', { deviceId });
  const token = boot.data.token;
  await api('/debug/profile', token, { moodBeanBalance: balance, totalMoodBeans: balance });
  return { token, deviceId };
}
function exchange(token, actionId, item = 'stamina', extra = {}) {
  return api('/shop/exchanges', token, { actionId, item, ...extra });
}
test('商城仅保留3豆体力与25豆复活卡，原子扣款、并发幂等及持久化正确', async () => {
  const { token, deviceId } = await player(28);
  const pair = await Promise.all([exchange(token, 'shop_duplicate'), exchange(token, 'shop_duplicate')]);
  assert.ok(pair.every(result => result.status === 200));
  assert.equal(pair.filter(result => result.data.duplicate === true).length, 1);
  assert.equal(pair[1].data.profile.moodBeanBalance, 25);
  assert.equal(pair[1].data.profile.stamina.current, 11);
  const card = await exchange(token, 'shop_card_1', 'reviveCard', { price: 0, quantity: 999999 });
  assert.equal(card.data.price, 25);
  assert.deepEqual(card.data.profile.inventory, { hammer: 0, magicWand: 0, reviveCard: 1 });
  assert.equal(card.data.profile.moodBeanBalance, 0);
  assert.equal(card.data.profile.totalMoodBeans, 28);
  assert.equal((await exchange(token, 'shop_duplicate')).data.profile.moodBeanBalance, 0);
  for (const item of ['hammer', 'magicWand']) assert.equal((await exchange(token, 'removed_' + item, item)).errorCode, 'TOOL_REQUEST_INVALID');
  const boot = await api('/players/bootstrap', '', { deviceId });
  assert.deepEqual(boot.data.profile.inventory, { hammer: 0, magicWand: 0, reviveCard: 1 });
  const SQL = await initSqlJs(); const disk = new SQL.Database(fs.readFileSync(dbPath));
  const row = disk.exec(`SELECT mood_bean_balance, hammer_count, wand_count, revive_card_count FROM players WHERE player_id = '${boot.data.profile.playerId}'`)[0].values[0];
  assert.deepEqual(row, [0, 0, 0, 1]); disk.close();
});
test('余额不足、并发透支、未知商品和同ID换商品均不会错误扣款', async () => {
  const { token } = await player(3);
  const results = await Promise.all([exchange(token, 'race_purchase_1'), exchange(token, 'race_purchase_2', 'stamina')]);
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  assert.equal(results.find(result => result.status === 409).errorCode, 'BEANS_INSUFFICIENT');
  const winner = results.findIndex(result => result.status === 200);
  const conflict = await exchange(token, winner === 0 ? 'race_purchase_1' : 'race_purchase_2', 'reviveCard');
  assert.equal(conflict.errorCode, 'TOOL_PAYLOAD_CONFLICT');
  assert.equal((await exchange(token, 'invalid_item', '__proto__')).errorCode, 'TOOL_REQUEST_INVALID');
  assert.equal((await exchange('', 'no_auth_id')).status, 401);
});
test('落盘失败后用原ID重试，只扣3豆并只入库一件', async () => {
  const { token } = await player(3);
  const realOpen = fs.openSync;
  fs.openSync = (target, ...args) => { if (String(target) === `${dbPath}.tmp`) throw new Error('shop persist fault'); return realOpen(target, ...args); };
  try { assert.equal((await exchange(token, 'persist_purchase')).status, 500); }
  finally { fs.openSync = realOpen; }
  const retry = await exchange(token, 'persist_purchase');
  assert.equal(retry.status, 200); assert.equal(retry.data.duplicate, true);
  assert.equal(retry.data.profile.moodBeanBalance, 0);
  assert.equal(retry.data.profile.stamina.current, 11);
});
test('当前规则禁止伪造道具动作；合法使用只扣一次，刷新/结算不返还已用道具', async () => {
  const { token, deviceId } = await player(40);
  const roundId = 'shop_tool_round';
  const begun = await api('/games/start', token, { roundId, rulesVersion: BOARD_RULES_VERSION, collectionRule: 'progress_v2', resumeProtocol: 1, securityProtocol: 1 });
  const sessionToken = begun.data.sessionToken;
  clock += 4000;
  const intent = await api('/games/reward-intents', token, { placement: 'hammer', roundId, sessionToken, actions: [{ type: 'rules', version: BOARD_RULES_VERSION }], elapsedMs: 1000 });
  assert.equal(intent.status, 200);
  assert.equal((await api('/games/reward-intents/complete', token, { intentId: intent.data.intentId, sessionToken })).errorCode, 'REWARD_TOO_EARLY');
  clock += 5000;
  assert.equal((await api('/games/reward-intents/complete', token, { intentId: intent.data.intentId, sessionToken })).status, 200);
  assert.equal((await api('/games/tools/reward', token, { roundId, item: 'hammer', actionId: 'paid_hammer_claim', sessionToken, intentId: intent.data.intentId })).status, 200);
  const board = new BoardEngine(); board.resetBoard(begun.data.seed, begun.data.isTutorial, BOARD_RULES_VERSION);
  for (let i = 0; i < 3; i++) { const move = board.getTutorialMove(i); board.movePiece(move.id, move.offset); board.resolveBoard(); board.finishPlayerAction(); }
  for (let i = 0; i < 3; i++) board.appendNextRow();
  board.resolveBoard(); board.finishPlayerAction();
  const actionIndex = board.roundActions.length;
  const id = board.pieces[0].id;
  const proof = { actions: JSON.parse(JSON.stringify(board.roundActions)), elapsedMs: 10000 };
  board.hammerCount = 1;
  assert.equal(board.useHammer(id), true);
  board.resolveBoard();
  assert.equal(board.appendTurnRows(), true);
  board.resolveBoard();
  board.finishPlayerAction();
  clock += 10000;
  const payload = { roundId, sessionToken, startedAt: clock - 10000, endedAt: clock, score: board.score, collectedMoodBeanCount: board.roundCollectedMoodBeans, actions: board.roundActions };
  const forged = await api('/games/settlements', token, payload);
  assert.equal(forged.errorCode, 'PROGRESS_INVALID');
  const body = { roundId, sessionToken, item: 'hammer', actionId: `${roundId}:use:${actionIndex}`, actionIndex, target: id, ...proof };
  assert.equal((await api('/games/tools/use', token, body)).data.profile.inventory.hammer, 0);
  const retry = await api('/games/tools/use', token, body);
  assert.equal(retry.data.duplicate, true); assert.equal(retry.data.profile.inventory.hammer, 0);
  assert.equal((await api('/games/settlements', token, payload)).status, 200);
  await exchange(token, 'after_settle_stamina', 'stamina');
  const duplicate = await api('/games/settlements', token, payload);
  const fresh = await api('/players/bootstrap', '', { deviceId });
  assert.ok(fresh.data.profile.assetRevision > duplicate.data.settlement.profile.assetRevision);
  assert.deepEqual(fresh.data.profile.inventory, { hammer: 0, magicWand: 0, reviveCard: 0 });
});
test('新开局不再支持旧免重放奖励协议；补给有幂等和每局上限', async () => {
  const { token } = await player(0);
  assert.equal((await api('/games/start', token, { roundId: 'legacy_new_round' })).errorCode, 'COLLECTION_RULE_UNSUPPORTED');
  const roundId = 'reward_limited_round';
  await api('/games/start', token, { roundId, rulesVersion: 12, collectionRule: 'progress_v2' });
  for (let i = 0; i < 3; i++) {
    const body = { roundId, item: 'hammer', actionId: `reward_claim_${i}` };
    assert.equal((await api('/games/tools/reward', token, body)).status, 200);
    assert.equal((await api('/games/tools/reward', token, body)).data.duplicate, true);
    assert.equal((await api('/games/tools/use', token, { roundId, item: 'hammer', actionId: `use_claim_${i}`, actionIndex: i + 1, target: 1 })).status, 200);
  }
  const limit = await api('/games/tools/reward', token, { roundId, item: 'hammer', actionId: 'reward_claim_overflow' });
  assert.equal(limit.errorCode, 'TOOL_REWARD_LIMIT');
});

test('V5至V21客户端可并行幂等开局、重放结算，旧协议仍不能新开局', async () => {
  for (const rulesVersion of [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, BOARD_RULES_VERSION]) {
    const { token } = await player(0);
    const roundId = `rolling_release_v${rulesVersion}`;
    const startBody = { roundId, rulesVersion, collectionRule: 'progress_v2', ...(rulesVersion >= 13 ? { securityProtocol: 1 } : {}) };
    const begun = await api('/games/start', token, startBody);
    assert.equal(begun.status, 200, `V${rulesVersion} must remain playable during rollout`);
    assert.equal(begun.data.rulesVersion, rulesVersion);
    assert.equal(begun.data.stamina.current, 9);
    const retry = await api('/games/start', token, startBody);
    assert.equal(retry.data.duplicate, true);
    assert.equal(retry.data.stamina.current, 9);
    assert.equal(retry.data.seed, begun.data.seed);
    const conflict = await api('/games/start', token, { ...startBody, rulesVersion: rulesVersion === 5 ? 6 : 5 });
    assert.equal(conflict.errorCode, 'BOARD_RULES_UNSUPPORTED');
    const board = new BoardEngine();
    board.resetBoard(begun.data.seed, begun.data.isTutorial, rulesVersion);
    for (let step = 0; step < 3; step++) {
      const move = board.getTutorialMove(step);
      board.movePiece(move.id, move.offset); board.resolveBoard(); board.finishPlayerAction();
    }
    for (let row = 0; row < 3; row++) board.appendNextRow();
    board.resolveBoard(); board.finishPlayerAction();
    assert.ok(board.score > 0);
    clock += 10000;
    const body = { roundId, startedAt: clock - 10000, endedAt: clock, score: board.score,
      collectedMoodBeanCount: board.roundCollectedMoodBeans, actions: board.roundActions };
    const settled = await api('/games/settlements', token, body);
    assert.equal(settled.status, 200);
    assert.equal(settled.data.settlement.gainedExperience, board.roundCollectedMoodBeans);
    assert.equal(settled.data.settlement.awardedMoodBeans, Math.floor(board.roundCollectedMoodBeans / 100));
    assert.equal((await api('/games/settlements', token, body)).data.duplicate, true);
    for (const oldVersion of [1, 2, 3, 4]) {
      const rejected = await api('/games/start', token, { roundId: `${roundId}_old_${oldVersion}`,
        rulesVersion: oldVersion, collectionRule: 'progress_v2' });
      assert.equal(rejected.errorCode, 'COLLECTION_RULE_UNSUPPORTED');
    }
  }
});

test('GM重置清空资产/道具/对局记录，恢复10体力，新开局重新进入教学', async () => {
  const { token, deviceId } = await player(40);
  await exchange(token, 'before_reset_hammer');
  const roundId = 'before_reset_round';
  await api('/games/start', token, { roundId, rulesVersion: BOARD_RULES_VERSION, collectionRule: 'progress_v2', securityProtocol: 1 });
  const reset = await api('/debug/reset', token, {});
  assert.equal(reset.status, 200);
  assert.equal(reset.data.profile.moodBeanBalance, 0);
  assert.deepEqual(reset.data.profile.inventory, { hammer: 0, magicWand: 0, reviveCard: 0 });
  assert.equal(reset.data.profile.stamina.current, 10);
  assert.equal(reset.data.profile.gameCount, 0);
  assert.equal(reset.data.profile.level, 1);
  const boot = await api('/players/bootstrap', '', { deviceId });
  assert.equal(boot.data.profile.playerId, reset.data.profile.playerId);
  const begun = await api('/games/start', token, { roundId: 'after_reset_round', rulesVersion: BOARD_RULES_VERSION, collectionRule: 'progress_v2', securityProtocol: 1 });
  assert.equal(begun.data.isTutorial, true);
  assert.equal(begun.data.stamina.current, 9);
});


test('3豆换1体力、与自然恢复累加、保留恢复时钟，幂等重试不能重复加体力', async () => {
  const { token } = await player(9);
  await api('/games/start', token, { roundId:'stamina_shop_round', rulesVersion:BOARD_RULES_VERSION, collectionRule:'progress_v2', securityProtocol: 1 });
  clock += 61000;
  const pair = await Promise.all([exchange(token,'stamina_same_id','stamina',{ price:0,quantity:999 }), exchange(token,'stamina_same_id','stamina')]);
  assert.ok(pair.every(r=>r.status===200));
  assert.equal(pair.filter(r=>r.data.duplicate).length,1);
  assert.equal(pair[1].data.price,3);
  assert.equal(pair[1].data.profile.moodBeanBalance,6);
  assert.equal(pair[1].data.profile.stamina.current,10);
  assert.deepEqual(pair[1].data.profile.inventory,{hammer:0,magicWand:0,reviveCard:0});
  const extra = await exchange(token,'stamina_over_max','stamina');
  assert.equal(extra.data.profile.stamina.current,11);
  assert.equal(extra.data.profile.moodBeanBalance,3);
  assert.equal(extra.data.profile.totalMoodBeans,9);
  assert.equal((await exchange(token,'stamina_same_id','stamina')).data.profile.stamina.current,11);
  for(const route of ['/games/tools/use','/games/tools/reward']) {
    assert.equal((await api(route,token,{actionId:'bad_stamina_tool',item:'stamina',roundId:'stamina_shop_round',actionIndex:1,target:1})).errorCode,'TOOL_REQUEST_INVALID');
  }
});

test('体力兑换不重置未满时的自然恢复倒计时；余额不足与并发不透支', async () => {
  const { token } = await player(3);
  for(let i=0;i<3;i++) await api('/games/start',token,{roundId:`stamina_clock_${i}`,rulesVersion:BOARD_RULES_VERSION,collectionRule:'progress_v2', securityProtocol: 1});
  clock += 61000;
  const results=await Promise.all([exchange(token,'stamina_race_one','stamina'),exchange(token,'stamina_race_two','stamina')]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  const profile=results.find(r=>r.status===200).data.profile;
  assert.equal(profile.stamina.current,8);
  assert.equal(Date.parse(profile.stamina.nextRecoveryAt)-clock,239000);
  assert.equal(profile.moodBeanBalance,0);
  assert.equal(results.find(r=>r.status===409).errorCode,'BEANS_INSUFFICIENT');
});

test('所有商城商品2豆不足、3豆恰好成功，客户端伪造价格数量不能改变扣款或发货', async () => {
  for (const item of ['stamina']) {
    const poor = await player(2);
    const refused = await exchange(poor.token, `boundary_poor_${item}`, item);
    assert.equal(refused.status, 409);
    assert.equal(refused.errorCode, 'BEANS_INSUFFICIENT');
    assert.match(refused.message, /3/);
    const { token, deviceId } = await player(3);
    const purchased = await exchange(token, `boundary_exact_${item}`, item, { price: 0, quantity: 999 });
    assert.equal(purchased.status, 200);
    assert.equal(purchased.data.price, 3);
    assert.equal(purchased.data.profile.moodBeanBalance, 0);
    assert.deepEqual(purchased.data.profile.inventory,
      { hammer: item === 'hammer' ? 1 : 0, magicWand: item === 'magicWand' ? 1 : 0, reviveCard: 0 });
    assert.equal(purchased.data.profile.stamina.current, item === 'stamina' ? 11 : 10);
    const retry = await exchange(token, `boundary_exact_${item}`, item);
    assert.equal(retry.data.duplicate, true);
    assert.equal(retry.data.profile.assetRevision, purchased.data.profile.assetRevision);
    const boot = await api('/players/bootstrap', '', { deviceId });
    assert.equal(boot.data.profile.moodBeanBalance, 0);
    assert.equal(boot.data.profile.totalMoodBeans, 3);
  }
});


test('当前规则拒绝重复复活、超过8排复活和短时间重复清屏，不能伪造救场绕过上升', async () => {
  const {token}=await player(0);const roundId='bounded_rescue_round';
  const start=await api('/games/start',token,{roundId,rulesVersion:BOARD_RULES_VERSION,collectionRule:'progress_v2', securityProtocol: 1});
  clock+=10000;
  for(const illegal of [[{type:'revive',rowCount:10}],[{type:'revive',rowCount:8},{type:'revive',rowCount:8}],[{type:'clear'},{type:'clear'}]]) {
    const result=await api('/games/settlements',token,{roundId,startedAt:clock-10000,endedAt:clock,score:0,collectedMoodBeanCount:0,
      actions:[{type:'rules',version:BOARD_RULES_VERSION},...illegal]});
    assert.equal(result.errorCode,'REPLAY_INVALID');
  }
});

test('过期未结算对局不能继续扣道具或领取补给', async () => {
  const {token}=await player(20);await exchange(token,'expired_round_hammer');
  const roundId='expired_tool_round';await api('/games/start',token,{roundId,rulesVersion:BOARD_RULES_VERSION,collectionRule:'progress_v2', securityProtocol: 1});
  clock+=8*24*60*60*1000;
  for(const route of ['/games/tools/use','/games/tools/reward']) {
    const result=await api(route,token,{roundId,item:'hammer',actionId:'expired_request_id',actionIndex:1,target:1});
    assert.equal(result.errorCode,'ROUND_NOT_ACTIVE');
  }
});

test('V12道具绑定单局：锤三次、棒一次、未使用不重复领、同ID重试和重启恢复不刷新', async () => {
  const { token, deviceId } = await player(0), roundId = 'v12_scoped_tools';
  const begun = await api('/games/start', token, { roundId, rulesVersion: 12, collectionRule: 'progress_v2', resumeProtocol: 1 });
  const sessionToken = begun.data.sessionToken;
  const reward = (item, n) => api('/games/tools/reward', token, { roundId, sessionToken, item, actionId: `v12_claim_${item}_${n}` });
  const use = (item, n) => api('/games/tools/use', token, { roundId, sessionToken, item, actionId: `v12_use_${item}_${n}`, actionIndex: n, target: 1 });
  for (let n = 1; n <= 3; n++) {
    const pair = await Promise.all([reward('hammer', n), reward('hammer', n)]);
    assert.ok(pair.every(r => r.status === 200)); assert.equal(pair.filter(r => r.data.duplicate).length, 1);
    assert.equal(pair[0].data.roundTools.hammer.acquired, n);
    assert.equal(pair[0].data.profile.inventory.hammer, 0, '领取不写跨局库存');
    if (n < 3) assert.equal((await reward('hammer', n + 10)).errorCode, 'TOOL_ALREADY_OWNED');
    assert.equal((await use('hammer', n)).data.roundTools.hammer.owned, 0);
    assert.equal((await use('hammer', n)).data.duplicate, true);
  }
  assert.equal((await reward('hammer', 4)).errorCode, 'TOOL_REWARD_LIMIT');
  assert.equal((await use('hammer', 4)).errorCode, 'TOOL_INSUFFICIENT');
  assert.equal((await reward('magicWand', 1)).data.roundTools.magicWand.owned, 1);
  assert.equal((await reward('magicWand', 2)).errorCode, 'TOOL_REWARD_LIMIT');
  const resumed = await api('/games/resume', token, { roundId, expectedGeneration: 0, requestId: 'v12_tools_resume' });
  assert.deepEqual(resumed.data.roundTools, { hammer: { acquired: 3, used: 3, owned: 0 }, magicWand: { acquired: 1, used: 0, owned: 1 } });
  const fresh = await api('/players/bootstrap', '', { deviceId });
  assert.equal(fresh.data.profile.moodBeanBalance, 0); assert.equal(fresh.data.profile.inventory.magicWand, 0);
  const other = await api('/games/start', token, { roundId: 'v12_tools_new_round', rulesVersion: 12, collectionRule: 'progress_v2', resumeProtocol: 1,
    replaceRoundId: roundId, replacementGeneration: resumed.data.generation, replaceSessionToken: resumed.data.sessionToken });
  assert.equal(other.status, 200);
  assert.equal((await api('/games/tools/use', token, { roundId: 'v12_tools_new_round', sessionToken: other.data.sessionToken,
    item: 'magicWand', actionId: 'v12_no_carry_wand', actionIndex: 1, target: 1 })).errorCode, 'TOOL_INSUFFICIENT');
});
