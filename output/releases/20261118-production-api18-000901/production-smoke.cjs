const fs=require('fs'),assert=require('node:assert/strict');
const probe=JSON.parse(fs.readFileSync('/release/probe-auth.json'));
const {default:BoardEngine}=require('/app/src/boardEngine');
const initSqlJs=require('/app/node_modules/sql.js');
const base='https://api.tcjstory.cn/v1/cocos-zyx';
async function req(path,body,status=200,token=probe.token){
 const response=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
 const result=await response.json();assert.equal(response.status,status,path+': '+(result.errorCode||result.message));return result;
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const health=(await req('/health')).data;assert.equal(health.apiVersion,18);assert.equal(health.schemaVersion,12);
 for(const c of ['round-checkpoints-v1','revive-card-v11','round-tools-lightning-v12','rising-specials-lightning-v13','reward-intents-v1','security-audit-v1'])assert.ok(health.capabilities.includes(c));
 assert.equal((await req('/players/bootstrap',{deviceId:'unauth_release_probe'},401,'')).errorCode,'WECHAT_LOGIN_REQUIRED');
 await req('/games/active',null,401,'');await req('/games/active?token='+probe.token,null,401,'');
 for(const route of ['/debug/profile','/debug/reset'])await req(route,{},404);
 for(const route of ['/admin/risks/export','/realm/state','/rewards'])await req(route,null,404);
 const quotes=[];
 for(const [item,price] of [['stamina',3],['reviveCard',25]]){
  const r=await req('/shop/exchanges',{item,actionId:'quote_'+item,price:0,quantity:999},409);
  assert.equal(r.errorCode,'BEANS_INSUFFICIENT');assert.ok(r.message.includes(String(price)));quotes.push({item,price});
 }
 const denied=await req('/games/start',{roundId:'missing_security_protocol',rulesVersion:13,collectionRule:'progress_v2',resumeProtocol:1},400);
 assert.equal(denied.errorCode,'SECURITY_PROTOCOL_REQUIRED');
 const begun=[];
 for(let version=5;version<=12;version++){
  const body={roundId:'legacy_probe_v'+version,collectionRule:'progress_v2',rulesVersion:version};
  const started=(await req('/games/start',body)).data;assert.equal(started.rulesVersion,version);assert.equal(started.stamina.current,14-version);
  const duplicate=(await req('/games/start',body)).data;assert.equal(duplicate.duplicate,true);assert.equal(duplicate.seed,started.seed);assert.equal(duplicate.stamina.current,started.stamina.current);
  begun.push({...started,localStart:Date.now()});
 }
 await sleep(5200);
 for(const started of begun){
  const board=new BoardEngine();board.resetBoard(started.seed,started.isTutorial,started.rulesVersion,started.heartRescueEligible);
  const body={roundId:started.roundId,startedAt:started.localStart,endedAt:Date.now(),score:0,collectedMoodBeanCount:0,actions:board.roundActions};
  const settled=(await req('/games/settlements',body)).data;assert.equal(settled.accepted,true);assert.equal(settled.settlement.awardedMoodBeans,0);
  assert.equal((await req('/games/settlements',body)).data.duplicate,true);
 }
 const body={roundId:'secure_probe_v13',rulesVersion:13,collectionRule:'progress_v2',resumeProtocol:1,securityProtocol:1};
 const start=(await req('/games/start',body)).data;assert.equal(start.stamina.current,1);
 assert.equal((await req('/games/start',body)).data.duplicate,true);
 const localStart=Date.now(), actions=[{type:'rules',version:13}];
 const checkpoint={roundId:start.roundId,sessionToken:start.sessionToken,actions,elapsedMs:0};
 assert.equal((await req('/games/checkpoint',checkpoint)).data.actionCount,1);
 assert.equal((await req('/games/active')).data.round.roundId,start.roundId);
 const resumeBody={roundId:start.roundId,expectedGeneration:0,requestId:'release_resume_probe'};
 const resumed=(await req('/games/resume',resumeBody)).data;assert.equal(resumed.generation,1);assert.notEqual(resumed.sessionToken,start.sessionToken);
 assert.equal((await req('/games/resume',resumeBody)).data.sessionToken,resumed.sessionToken);
 assert.equal((await req('/games/checkpoint',checkpoint,409)).errorCode,'ROUND_SESSION_CONFLICT');
 const intent=(await req('/games/reward-intents',{placement:'hammer',roundId:start.roundId,sessionToken:resumed.sessionToken,actions,elapsedMs:0})).data;
 assert.equal((await req('/games/reward-intents/complete',{intentId:intent.intentId,sessionToken:resumed.sessionToken},409)).errorCode,'REWARD_TOO_EARLY');
 await sleep(3200);
 const complete={intentId:intent.intentId,sessionToken:resumed.sessionToken};
 assert.equal((await req('/games/reward-intents/complete',complete)).data.completed,true);
 assert.equal((await req('/games/reward-intents/complete',complete)).data.duplicate,true);
 const reward={roundId:start.roundId,sessionToken:resumed.sessionToken,item:'hammer',actionId:'release_probe_hammer',intentId:intent.intentId};
 assert.equal((await req('/games/tools/reward',reward)).data.roundTools.hammer.owned,1);
 assert.equal((await req('/games/tools/reward',reward)).data.duplicate,true);
 await sleep(2200);
 const settleBody={roundId:start.roundId,sessionToken:resumed.sessionToken,startedAt:localStart,endedAt:Date.now(),score:0,collectedMoodBeanCount:0,actions};
 assert.equal((await req('/games/settlements',settleBody)).data.accepted,true);
 assert.equal((await req('/games/settlements',settleBody)).data.duplicate,true);
 assert.equal((await req('/games/active')).data.round,null);
 const boards={};
 for(const type of ['power','beans']){
  const board=(await req('/leaderboards?type='+type)).data;
  assert.equal(board.self.bestScore,0);assert.equal(board.self.rank,null);assert.ok(!board.entries.some(e=>e.playerId===probe.playerId));
  boards[type]=board;
 }
 const SQL=await initSqlJs(),db=new SQL.Database(fs.readFileSync('/data/game.sqlite'));
 for(const type of ['power','beans']){
  const field=type==='power'?'highest_single_game_score':'mood_bean_balance';
  const rows=db.exec(`SELECT player_id,${field} FROM players WHERE ${field}>0 ORDER BY ${field} DESC,updated_at ASC,player_id ASC LIMIT 200`)[0]?.values||[];
  // 排名分值和玩家集合与实际库一致；同分时另查服务端排序。
  assert.equal(boards[type].entries.length,rows.length);
  const expected=new Map(rows.map(r=>[r[0],r[1]]));
  for(const row of boards[type].entries)assert.equal(row.value,expected.get(row.playerId));
 }
 db.close();
 const dawn=await fetch('https://api.tcjstory.cn/health',{signal:AbortSignal.timeout(10000)});assert.equal(dawn.status,200);
 const result={passed:true,liveHttps:true,healthVersion:18,schemaVersion:12,legacyVersions:[5,6,7,8,9,10,11,12],currentVersion:13,startAndSettlementIdempotency:true,checkpointAndResume:true,oldSessionRejected:true,rewardObservationAndIdempotency:true,productionGuestLoginRejected:true,queryTokenRejected:true,gmAndRiskExportDisabled:true,shopQuotes:quotes,dualLeaderboardsMatchDatabase:true,probeZeroScoreAndBeans:true,dawnHealthy:true,realWeChatLoginNotReplayed:true};
 fs.writeFileSync('/release/production-smoke-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e.message);process.exitCode=1});
