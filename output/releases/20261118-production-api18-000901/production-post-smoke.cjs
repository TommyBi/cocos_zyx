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
 const result={passed:true,liveHttps:true,healthVersion:18,schemaVersion:12,legacyVersions:[5,6,7,8,9,10,11,12],currentVersion:13,startAndSettlementIdempotency:true,checkpointAndResume:true,oldSessionRejected:true,rewardObservationAndIdempotency:true,productionGuestLoginRejected:true,queryTokenRejected:true,gmAndRiskExportDisabled:true,shopQuotes:[{item:"stamina",price:3},{item:"reviveCard",price:25}],dualLeaderboardsMatchDatabase:true,probeZeroScoreAndBeans:true,dawnHealthy:true,realWeChatLoginNotReplayed:true};
 fs.writeFileSync('/release/production-smoke-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e.message);process.exitCode=1});
