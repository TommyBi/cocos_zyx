const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const initSqlJs = require('sql.js');
const { start } = require('../src/index');
const { default: BoardEngine, BOARD_RULES_VERSION } = require('../src/boardEngine');
const { replayBoardEngine } = require('../src/replayBoardEngine');
const { offerBoard } = require('../../scripts/fixtures/rescue-security-helper.cjs');
let server, base, dbPath, clock, realNow, sequence = 0;
test.before(async () => {
  realNow = Date.now; clock = realNow(); Date.now = () => clock;
  dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-progress-')), 'test.sqlite');
  const app = await start(dbPath); server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve)); base = `http://127.0.0.1:${server.address().port}/v1/cocos-zyx`;
});
test.after(async () => { Date.now = realNow; await new Promise(resolve => server.close(resolve)); });
async function api(url, token, body) {
  const response = await fetch(base + url, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const payload = await response.json(); return { status: response.status, ...payload };
}
async function player() { return (await api('/players/bootstrap', null, { deviceId: `resume-player-${++sequence}` })).data; }
async function begin(token, extra = {}) { return api('/games/start', token, { roundId: `round_resume_${++sequence}`, rulesVersion: BOARD_RULES_VERSION, collectionRule: 'progress_v2', resumeProtocol: 1, securityProtocol: 1, ...extra }); }
function traces(begun) {
  const board = new BoardEngine(); board.resetBoard(begun.seed, begun.isTutorial, BOARD_RULES_VERSION);
  const result = [];
  for (let step = 0; step < 3; step++) {
    const move = board.getTutorialMove(step); assert.ok(board.movePiece(move.id, move.offset));
    settle(board); board.finishPlayerAction();
    if (step === 2) for (let row = 0; row < 3; row++) { assert.ok(board.appendNextRow()); settle(board); }
    result.push(JSON.parse(JSON.stringify(board.roundActions)));
  }
  return result;
}
function settle(board) { for (let i = 0; i < 15; i++) { const moved = board.applyGravity(); const cleared = board.eliminateFullRows(); if (!moved.length && !cleared.clearedRows) return; } throw Error('unstable'); }
const checkpoint = (begun, actions, elapsedMs = 10000) => ({ roundId: begun.roundId, sessionToken: begun.sessionToken, actions, elapsedMs });
const resume = (active, extra = {}) => ({ roundId: active.roundId, expectedGeneration: active.generation || 0, requestId: `resume_attempt_${++sequence}`, maxRulesVersion: BOARD_RULES_VERSION, ...extra });
function settlement(begun, actions, token = begun.sessionToken) {
  const score = replayBoardEngine(begun.seed, begun.isTutorial, actions, BOARD_RULES_VERSION);
  return { roundId: begun.roundId, sessionToken: token, startedAt: clock - 10000, endedAt: clock, actions, score: score.score, collectedMoodBeanCount: score.collectedMoodBeans };
}
async function disk(sql, params = []) { const SQL = await initSqlJs(); const db = new SQL.Database(fs.readFileSync(dbPath)); const stmt = db.prepare(sql); stmt.bind(params); const rows=[]; while(stmt.step()) rows.push(stmt.getAsObject()); stmt.free(); db.close(); return rows; }

test('登录可同时返回本人残局摘要，不下发日志或续玩令牌', async () => {
  const deviceId = 'resume-bootstrap-summary';
  const initial = (await api('/players/bootstrap', null, { deviceId, includeActiveRound: true })).data;
  assert.equal(initial.activeRound, null);
  const begun = (await begin(initial.token)).data;
  const classic = await api('/players/bootstrap', initial.token, { deviceId });
  assert.equal(classic.data.activeRound, undefined);
  assert.equal(classic.data.roundStart, undefined);
  const login = await api('/players/bootstrap', initial.token, { deviceId, includeActiveRound: true, includeRoundStart: true });
  const active = await api('/games/active', initial.token);
  assert.deepEqual(login.data.activeRound, active.data.round);
  assert.equal(login.data.activeRound.roundId, begun.roundId);
  assert.equal(login.data.activeRound.actions, undefined);
  assert.equal(login.data.activeRound.sessionToken, undefined);
  assert.deepEqual(login.data.roundStart, { rulesVersion: BOARD_RULES_VERSION, collectionRule: 'progress_v2', resumeProtocol: 1, securityProtocol: 1 });
});

test('V14至V21均可保存续玩；旧客户端不接管更新规则的局', async () => {
  for (const version of [14, 15, 16, 17, 18, 19, 20, BOARD_RULES_VERSION]) {
    const user=await player(),begun=(await begin(user.token,{rulesVersion:version})).data;
    const b=new BoardEngine();b.resetBoard(begun.seed,begun.isTutorial,version);
    const move=b.getTutorialMove(0);assert.ok(b.movePiece(move.id,move.offset));settle(b);b.finishPlayerAction();
    clock+=12000;
    assert.equal((await api('/games/checkpoint',user.token,checkpoint(begun,b.roundActions))).status,200);
    const legacyRequest = resume(begun, { maxRulesVersion: version >= 17 ? version - 1 : undefined });
    const legacy = await api('/games/resume', user.token, legacyRequest);
    if (version >= 16) assert.equal(legacy.errorCode, 'BOARD_RULES_UNSUPPORTED');
    const restored = version >= 16 ? await api('/games/resume', user.token, resume(begun)) : legacy;
    assert.equal(restored.status,200);assert.equal(restored.data.rulesVersion,version);
    assert.equal(restored.data.actions[0].version,version);
  }
});

test('V16保存并恢复救场退场时间和交替顺序', async () => {
  const user = await player(), begun = (await begin(user.token)).data;
  const board = offerBoard(begun.seed, 'clear', begun.isTutorial, BOARD_RULES_VERSION);
  assert.equal(board.dismissRoundRescue(70000), true);
  clock += 90000;
  const saved = await api('/games/checkpoint', user.token, checkpoint(begun, board.roundActions, 72000));
  assert.equal(saved.status, 200, JSON.stringify(saved));
  const restored = await api('/games/resume', user.token, resume(begun));
  assert.equal(restored.status, 200);
  assert.deepEqual(restored.data.actions.at(-1), { type: 'rescueDismiss', elapsedMs: 70000 });
  const replay = replayBoardEngine(begun.seed, begun.isTutorial, restored.data.actions, BOARD_RULES_VERSION, false, true, true, true);
  assert.equal(replay.valid, true);
  assert.equal(replay.board.offerRoundRescue(89999), null);
  assert.equal(replay.board.offerRoundRescue(90000), 'balloon');
});

test('保存只接受本人合法重放，忽略伪造分数，不发资产；落盘后可查步数', async () => {
  const user = await player(), other = await player(); const begun = (await begin(user.token)).data;
  assert.equal(begun.stamina.current, 9); assert.ok(begun.sessionToken);
  clock += 11000; const [a] = traces(begun);
  const saved = await api('/games/checkpoint', user.token, { ...checkpoint(begun, a), score: 999999, moodBeanBalance: 999999 });
  assert.equal(saved.status, 200); assert.equal(saved.data.operationCount, 1); assert.notEqual(saved.data.score, 999999);
  const active = (await api('/games/active', user.token)).data.round;
  assert.equal(active.roundId, begun.roundId); assert.equal(active.actionCount, a.length);
  assert.equal(active.sessionToken, undefined); assert.equal(active.actions, undefined);
  assert.equal((await api('/games/checkpoint', other.token, checkpoint(begun, a))).status, 409);
  assert.equal((await api('/games/active', other.token)).data.round, null);
  assert.equal((await api('/games/active')).status, 401);
  const rows = await disk('SELECT score, operation_count FROM round_checkpoints WHERE player_id = ?', [user.profile.playerId]);
  assert.equal(rows[0].score, saved.data.score); assert.equal(rows[0].operation_count, 1);
  const current = (await api('/players/bootstrap', null, { deviceId: (await disk('SELECT device_id FROM players WHERE player_id = ?', [user.profile.playerId]))[0].device_id })).data.profile;
  assert.equal(current.highestSingleGameScore, 0); assert.equal(current.moodBeanBalance, 0); assert.equal(current.experience, 0);
});

test('确认前缀不可改写，迟到短保存不回退；缺道具凭据/未完成回合/伪造救场/超长日志拒绝', async () => {
  const user = await player(), begun = (await begin(user.token)).data; clock += 12000;
  const [a,b] = traces(begun);
  assert.equal((await api('/games/checkpoint', user.token, checkpoint(begun,a,999999))).errorCode,'PROGRESS_INVALID');
  assert.equal((await api('/games/checkpoint', user.token, checkpoint(begun,b))).status, 200);
  const stale = await api('/games/checkpoint', user.token, checkpoint(begun,a));
  assert.equal(stale.status,200); assert.equal(stale.data.actionCount,b.length);
  const changed = JSON.parse(JSON.stringify(b)); changed[1].offset *= -1;
  assert.equal((await api('/games/checkpoint', user.token, checkpoint(begun,changed))).errorCode,'PROGRESS_CONFLICT');
  assert.equal((await api('/games/checkpoint', user.token, checkpoint(begun,[...b,{type:'hammer',id:1}]))).errorCode,'PROGRESS_INVALID');
  assert.equal((await api('/games/checkpoint', user.token, checkpoint(begun,[...b,{type:'heartOffer',elapsedMs:99999999}]))).errorCode,'PROGRESS_INVALID');
  assert.equal((await api('/games/checkpoint', user.token, checkpoint(begun,Array(100001).fill({type:'finish'})))).status>=400,true);
  const third=await player(), round=(await begin(third.token)).data; clock+=12000;
  const partial=traces(round)[0].slice(0,-1);
  assert.equal((await api('/games/checkpoint',third.token,checkpoint(round,partial))).errorCode,'PROGRESS_INVALID');
  assert.equal((await api('/games/settlements',user.token,settlement(begun,a))).errorCode,'PROGRESS_CONFLICT');
});

test('重复保存确认点保持得分和日志，允许前进时钟并拒绝回退或失效会话', async () => {
  const user = await player(), begun = (await begin(user.token)).data;
  clock += 12000;
  const [actions] = traces(begun);
  const request = checkpoint(begun, actions, 7000);
  const save = body => api('/games/checkpoint', user.token, body);
  const first = (await save(request)).data;
  clock += 1000;
  assert.deepEqual((await save(request)).data, first);
  const advanced = (await save({ ...request, elapsedMs: 8000 })).data;
  assert.deepEqual(advanced, { ...first, elapsedMs: 8000, updatedAt: clock });
  assert.equal((await save(request)).errorCode, 'PROGRESS_CONFLICT');
  assert.equal((await save({ ...request, elapsedMs: 900000 })).errorCode, 'PROGRESS_INVALID');
  const restored = await api('/games/resume', user.token, resume(begun));
  assert.deepEqual(restored.data.actions, actions);
  assert.equal((await save({ ...request, elapsedMs: 9000 })).errorCode, 'ROUND_SESSION_CONFLICT');
});

test('恢复核验本机尾部、请求幂等，更新会话后旧保存/道具/结算全部失效，不再扣体力', async () => {
  const user=await player(), begun=(await begin(user.token)).data; clock+=12000; const [a,b]=traces(begun);
  await api('/games/checkpoint',user.token,checkpoint(begun,a));
  const request=resume(begun,{actions:b,elapsedMs:10000});
  const restored=await api('/games/resume',user.token,request);
  assert.equal(restored.status,200); assert.equal(restored.data.operationCount,2); assert.notEqual(restored.data.sessionToken,begun.sessionToken);
  const duplicate=await api('/games/resume',user.token,request); assert.equal(duplicate.data.sessionToken,restored.data.sessionToken);
  assert.equal((await api('/games/resume',user.token,{...request,elapsedMs:10001})).errorCode,'PROGRESS_CONFLICT');
  assert.equal((await api('/games/checkpoint',user.token,checkpoint(begun,b))).errorCode,'ROUND_SESSION_CONFLICT');
  assert.equal((await api('/games/tools/use',user.token,{roundId:begun.roundId,sessionToken:begun.sessionToken,item:'hammer',actionIndex:b.length,target:1,actionId:'stale_tool_attempt'})).errorCode,'ROUND_SESSION_CONFLICT');
  assert.equal((await api('/games/tools/reward',user.token,{roundId:begun.roundId,sessionToken:begun.sessionToken,item:'hammer',actionId:'stale_reward_attempt'})).errorCode,'ROUND_SESSION_CONFLICT');
  assert.equal((await api('/games/settlements',user.token,settlement(begun,b))).errorCode,'ROUND_SESSION_CONFLICT');
  const settled=await api('/games/settlements',user.token,settlement(begun,b,restored.data.sessionToken));
  assert.equal(settled.status,200); assert.equal(settled.data.settlement.profile.stamina.current,9);
  const again=await api('/games/settlements',user.token,settlement(begun,b,restored.data.sessionToken));
  assert.equal(again.data.duplicate,true);
  assert.equal((await api('/games/active',user.token)).data.round,null);
  assert.equal((await api('/games/resume',user.token,request)).errorCode,'ROUND_NOT_ACTIVE');
});

test('同时恢复只有一个代次胜出，开始不能绕过未结算局；重开成功才原子放弃旧局', async () => {
  const user=await player(), begun=(await begin(user.token)).data; clock+=12000;
  const responses=await Promise.all([api('/games/resume',user.token,resume(begun)),api('/games/resume',user.token,resume(begun))]);
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
  const latest=responses.find(r=>r.status===200).data;
  assert.equal((await begin(user.token)).errorCode,'ROUND_RESUME_REQUIRED');
  assert.equal((await api('/games/start',user.token,{roundId:'bypass_old_client',rulesVersion:10,collectionRule:'progress_v2'})).errorCode,'ROUND_RESUME_REQUIRED');
  assert.equal((await begin(user.token,{replaceRoundId:begun.roundId,replacementGeneration:0})).status,409);
  assert.equal((await begin(user.token,{replaceRoundId:begun.roundId,replacementGeneration:latest.generation})).errorCode,'ROUND_SESSION_CONFLICT');
  assert.equal((await disk('SELECT status FROM game_rounds WHERE player_id=? AND round_id=?',[user.profile.playerId,begun.roundId]))[0].status,'active');
  const replaced=await begin(user.token,{replaceRoundId:begun.roundId,replacementGeneration:latest.generation,replaceSessionToken:latest.sessionToken});
  assert.equal(replaced.status,200); assert.equal(replaced.data.stamina.current,8);
  assert.equal((await api('/games/checkpoint',user.token,checkpoint(latest,latest.actions,0))).errorCode,'ROUND_NOT_ACTIVE');
  assert.equal((await disk('SELECT status FROM game_rounds WHERE player_id=? AND round_id=?',[user.profile.playerId,begun.roundId]))[0].status,'abandoned');
});

test('7天到期后不再提示但保留原始记录，客户端时间不能延长窗口', async () => {
  const user=await player(), begun=(await begin(user.token)).data; clock+=7*24*60*60*1000+1;
  assert.equal((await api('/games/active',user.token)).data.round,null);
  assert.equal((await api('/games/resume',user.token,resume(begun))).errorCode,'SETTLEMENT_TOO_OLD');
  assert.equal((await disk('SELECT COUNT(*) count FROM round_checkpoints WHERE player_id=?',[user.profile.playerId]))[0].count,1);
});

test('保存与恢复在写盘失败时不回成功，原请求重试可确认同一存档与会话', async () => {
  const user=await player(), begun=(await begin(user.token)).data; clock+=12000; const [a]=traces(begun);
  const realOpen=fs.openSync;
  fs.openSync=function(file,...args){if(String(file)===`${dbPath}.tmp`)throw Error('injected disk error');return realOpen.call(this,file,...args);};
  try {assert.equal((await api('/games/checkpoint',user.token,checkpoint(begun,a))).status,500);} finally{fs.openSync=realOpen;}
  assert.equal((await api('/games/checkpoint',user.token,checkpoint(begun,a))).status,200);
  const request=resume(begun);
  fs.openSync=function(file,...args){if(String(file)===`${dbPath}.tmp`)throw Error('injected disk error');return realOpen.call(this,file,...args);};
  try {assert.equal((await api('/games/resume',user.token,request)).status,500);} finally{fs.openSync=realOpen;}
  const retry=await api('/games/resume',user.token,request); assert.equal(retry.status,200); assert.equal(retry.data.generation,1);
  assert.equal((await disk('SELECT resume_generation FROM round_checkpoints WHERE player_id=?',[user.profile.playerId]))[0].resume_generation,1);
});
