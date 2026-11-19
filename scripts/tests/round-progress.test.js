const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { replayBoardEngine } = require('../../server/src/replayBoardEngine');
let output, Progress, rebuildRound, store, calls, cloud;
const tick = () => new Promise(resolve => setImmediate(resolve));
function started(id='round_a') { return { roundId:id, seed:42,isTutorial:false,rulesVersion:10,sessionToken:'lease_a',generation:0 }; }
function actions(count) { return [{type:'rules',version:10},...Array.from({length:count},()=>({type:'finish'}))]; }
function setup() {
 store=new Map();calls=[];
 cloud={ saveRoundProgress: request=>{calls.push(request);return Promise.resolve({actionCount:request.actions.length,operationCount:request.actions.length-1});} };
 const module={exports:{}};
 vm.runInNewContext(fs.readFileSync(path.join(output,'manager/RoundProgress.js'),'utf8'),{module,exports:module.exports,cc:{sys:{localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)}}},require:specifier=>specifier.endsWith('BoardEngine') ? require('../../server/src/boardEngine') : ({cloudService:cloud,getApiBase:()=> 'isolated-local'}),Date,Promise,Math});
 Progress=module.exports.RoundProgress;
 const progress=new Progress(); progress.begin(started(),'player-a');return progress;
}
test.before(()=>{
 output=fs.mkdtempSync(path.join(os.tmpdir(),'zyx-client-progress-'));
 try {execFileSync('npx',['--yes','-p','typescript@4.9.5','tsc','assets/script/manager/RoundProgress.ts','assets/script/dataModule/RoundReplay.ts','--outDir',output,'--module','commonjs','--target','es2017','--skipLibCheck'],{stdio:'pipe'});}catch(_){/* Cocos 声明缺省，使用生成后的实际代码。 */}
 rebuildRound=require(path.join(output,'dataModule/RoundReplay.js')).rebuildRound;
});

test('每步先本地保存，100步才上传，自动内部记录不能作为100次操作计数',async()=>{
 const p=setup();p.capture(actions(99),99,1000);await tick();assert.equal(calls.length,0);
 const local=JSON.parse([...store.values()][0]);assert.equal(local.actions.length,100);
 p.capture(actions(100),100,1100);await tick();assert.equal(calls.length,1);
 p.capture(actions(110),100,1200);await tick();assert.equal(calls.length,1);
 p.capture(actions(200),200,2000);await tick();assert.equal(calls.length,2);
});

test('同步串行合并，途中新增100步在成功后继续上传，旧局迟到确认不污染新局',async()=>{
 const p=setup();let resolve;cloud.saveRoundProgress=request=>{calls.push(request);return new Promise(r=>{resolve=r;});};
 p.capture(actions(100),100,1000);p.capture(actions(200),200,2000);assert.equal(calls.length,1);
 resolve({actionCount:101,operationCount:100});await tick();assert.equal(calls.length,2);assert.equal(calls[1].actions.length,201);
 p.begin(started('round_b'),'player-a');resolve({actionCount:201,operationCount:200});await tick();
 assert.equal(p.roundId,'round_b');assert.match([...store.values()][0],/round_b/);
});

test('断网保留记录、后台强制补存不足100步、恢复联网可重试',async()=>{
 const p=setup();cloud.saveRoundProgress=async request=>{calls.push(request);throw Error('offline');};
 p.capture(actions(7),7,1000,true);await tick();assert.equal(calls.length,1);assert.match(p.message(),/联网后自动同步/);
 const cold=new Progress();cold.bind('player-a');assert.equal(cold.roundId,'round_a');
 cloud.saveRoundProgress=async request=>{calls.push(request);return {actionCount:request.actions.length,operationCount:7};};
 await cold.sync(true);assert.equal(calls.length,2);assert.match(cold.message(),/进度已同步/);
});

test('账号隔离，清理已结算的局不会误删另一局；会话冲突只提示一次并停传',async()=>{
 const p=setup();p.bind('player-b');assert.equal(p.roundId,null);p.bind('player-a');assert.equal(p.roundId,'round_a');
 p.clear('different');assert.equal(p.roundId,'round_a');let conflicts=0;p.onConflict=()=>conflicts++;
 cloud.saveRoundProgress=async()=>{throw Object.assign(Error('stale'),{businessCode:'ROUND_SESSION_CONFLICT'});};
 p.capture(actions(100),100,1000);await tick();await p.sync(true);assert.equal(conflicts,1);assert.equal(p.token,undefined);
 p.clear('round_a');assert.equal(p.roundId,null);
});

test('恢复超时使用同一请求ID与相同本地尾部，核验返回后才替换本地存档',async()=>{
 const p=setup();p.capture(actions(7),7,1000);const attempts=[];
 cloud.resumeRound=async request=>{attempts.push(JSON.parse(JSON.stringify(request)));if(attempts.length===1)throw Error('lost response');return {...started(),...request,generation:1,sessionToken:'lease_b',actionCount:8,operationCount:7};};
 const active={...started(),actionCount:1};await assert.rejects(p.resume(active));assert.equal(p.token,'lease_a');
 await p.resume({...active,generation:1});assert.equal(attempts.length,2);assert.deepEqual(attempts[0],attempts[1]);assert.equal(p.token,'lease_b');
});

test('多端代次不同直接恢复云端，不上传旧设备分支',async()=>{
 const p=setup();p.capture(actions(7),7,1000);const attempts=[];
 cloud.resumeRound=async request=>{attempts.push(request);return {...started(),actions:actions(3),actionCount:4,operationCount:3,generation:2,sessionToken:'server_lease'};};
 await p.resume({...started(),generation:1,actionCount:4});assert.equal(attempts[0].actions,undefined);
});

for (const businessCode of ['PROGRESS_INVALID', 'PROGRESS_CONFLICT']) {
 test(`本机操作核验失败（${businessCode}）时自动恢复云端确认点`, async () => {
  const progress = setup();
  progress.capture(actions(7), 7, 1000);
  const attempts = [];
  const saved = { ...started(), actions: actions(3), actionCount: 4, operationCount: 3,
   generation: 1, sessionToken: 'server_lease' };
  cloud.resumeRound = async request => {
   attempts.push(request);
   assert.equal(progress.token, 'lease_a');
   if (request.actions) throw Object.assign(Error('local actions rejected'), { businessCode });
   return saved;
  };
  const result = await progress.resume({ ...started(), actionCount: 4 });
  assert.equal(result, saved);
  assert.equal(attempts.length, 2);
  assert.equal(attempts[0].actions.length, 8);
  assert.notEqual(attempts[1].requestId, attempts[0].requestId);
  assert.equal(attempts[1].roundId, attempts[0].roundId);
  assert.equal(attempts[1].expectedGeneration, attempts[0].expectedGeneration);
  assert.equal(attempts[1].actions, undefined);
  assert.equal(attempts[1].elapsedMs, undefined);
  assert.equal(progress.token, 'server_lease');
 });
}

test('云端确认点恢复超时仍保留本机操作，重试使用同一个云端恢复请求', async () => {
 const progress = setup();
 progress.capture(actions(7), 7, 1000);
 const attempts = [];
 cloud.resumeRound = async request => {
  attempts.push(request);
  if (request.actions) throw Object.assign(Error('local actions rejected'), { businessCode: 'PROGRESS_INVALID' });
  if (attempts.length === 2) throw Error('lost response');
  return { ...started(), actions: actions(3), actionCount: 4, generation: 1, sessionToken: 'server_lease' };
 };
 const active = { ...started(), actionCount: 4 };
 await assert.rejects(progress.resume(active), /lost response/);
 assert.equal(progress.token, 'lease_a');
 assert.equal(JSON.parse([...store.values()][0]).actions.length, 8);
 await progress.resume({ ...active, generation: 1 });
 assert.equal(attempts.length, 3);
 assert.deepEqual(attempts[2], attempts[1]);
});

test('已同步的本地记录不重复上传重放；同动作仍有未同步修改时保留核验', async () => {
 const progress = setup();
 const base = { ...started(), startedAt: Date.now() - 2000, rulesVersion: 17 };
 const confirmed = [{ type: 'rules', version: 17 }];
 progress.begin({ ...base, actions: confirmed, actionCount: 1 }, 'player-a');
 assert.equal(progress.getOfflineRound().rulesVersion, 17);
 const attempts = [];
 cloud.resumeRound = async request => {
  attempts.push(request);
  return { ...base, actions: confirmed, actionCount: 1, generation: attempts.length, sessionToken: 'new_lease' };
 };
 await progress.resume({ ...base, actionCount: 1 });
 assert.equal(attempts[0].actions, undefined);
 progress.capture(confirmed.concat({ type: 'finish' }), 1, 500);
 await progress.resume({ ...base, generation: 1, actionCount: 2 });
 assert.equal(attempts[1].actions.length, 2);
});

test('切换账号后不写入迟到的续玩结果', async () => {
 const progress = setup();
 let resolve;
 cloud.resumeRound = () => new Promise(done => { resolve = done; });
 const restoring = progress.resume({ ...started(), actionCount: 1 });
 progress.begin(started('round_b'), 'player-b');
 resolve({ ...started(), actions: actions(3), sessionToken: 'new_lease' });
 await assert.rejects(restoring, error => error.businessCode === 'ACCOUNT_CHANGED');
 assert.equal(progress.roundId, 'round_b');
 assert.equal(progress.token, 'lease_a');
 assert.match([...store.entries()].find(([key]) => key.endsWith('player-b'))[1], /round_b/);
});

test('恢复手绘救场后的种子/下一排/连消/复活日志，可继续操作并由服务端重放核验',()=>{
 for(const fixture of ['board-v10-heart-replay.json','board-v9-clear-replay.json','board-v9-balloon-replay.json']){
  const trace=require('../fixtures/'+fixture);const version=trace.actions[0].version;
  const board=rebuildRound(trace.seed,trace.tutorial,trace.actions,version,true);
  assert.equal(board.score,trace.score);assert.equal(board.roundCollectedMoodBeans,trace.raw);
  assert.equal(board.roundActions.length,trace.actions.length);
  for(let turn=0;turn<4&&!board.isGameOver();turn++){
   const hint=board.findEliminationHint()||board.pieces.map(p=>({id:p.id,offset:board.getMoveRange(p.id).min||board.getMoveRange(p.id).max})).find(p=>p.offset);
   if(!hint)break;assert.ok(board.movePiece(hint.id,hint.offset));board.resolveBoard();if(!board.appendTurnRows())break;board.resolveBoard();board.finishPlayerAction();
   const replay=replayBoardEngine(trace.seed,trace.tutorial,board.roundActions,version,true);
   assert.equal(replay.valid,true);assert.equal(replay.score,board.score);assert.equal(replay.collectedMoodBeans,board.roundCollectedMoodBeans);
  }
 }
});

test('断网冷启动只继续本账号环境内7天有效主线局，已失效会话重启不能复活',()=>{
 const p=setup();p.begin({...started(),startedAt:Date.now()-1000,mode:'main'},'player-a');
 p.updateTools({hammer:{acquired:3,used:3,owned:0},magicWand:{acquired:1,used:0,owned:1}});
 const cold=new Progress();cold.bind('player-a');assert.equal(cold.getOfflineRound().roundId,'round_a');
 assert.equal(cold.getOfflineRound().roundTools.magicWand.owned,1);
 cold.invalidateSession();const stale=new Progress();stale.bind('player-a');assert.equal(stale.getOfflineRound(),null);
 p.begin({...started(),startedAt:Date.now()-8*86400000},'player-a');assert.equal(p.getOfflineRound(),null);
 p.begin({...started(),startedAt:Date.now(),mode:'pk'},'player-a');assert.equal(p.getOfflineRound(),null);
});
