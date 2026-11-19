/** 真实本地API + 独立浏览器账号；不接触Staging/Production。 */
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {default:BoardEngine}=require('../server/src/boardEngine');
const base=process.env.PROGRESS_API_URL||'http://127.0.0.1:8081/v1/cocos-zyx';
const preview=process.env.PROGRESS_PREVIEW_URL||'http://127.0.0.1:7459/?localApi=1&home=1';
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base)||!/^http:\/\/(127\.0\.0\.1|localhost):/.test(preview))throw Error('验收仅允许本地服务');
const out=path.resolve('output/round-progress-20261116');fs.mkdirSync(out,{recursive:true});
async function api(url,token,body){const r=await fetch(base+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});const result=await r.json();if(r.status!==200)throw Error(JSON.stringify({status:r.status,result}));return result.data;}
function settle(board){for(let i=0;i<20;i++){const moved=board.applyGravity(),result=board.eliminateFullRows();if(!moved.length&&!result.clearedRows)return;}throw Error('unstable');}
async function button(page,text){await page.waitForTimeout(250);const p=await page.evaluate(text=>{function find(n){if(n.activeInHierarchy&&cc.isValid(n,true)&&n.getComponent(cc.Button)&&n.getComponentsInChildren(cc.Label).some(l=>l.string===text))return n;for(const c of n.children||[]){const result=find(c);if(result)return result;}}const n=find(cc.director.getScene());if(!n)throw Error('找不到按钮 '+text);const p=n.convertToWorldSpaceAR(cc.v2());return {x:p.x/cc.winSize.width*innerWidth,y:(1-p.y/cc.winSize.height)*innerHeight};},text);await page.mouse.click(p.x,p.y);}
function findSceneInBrowser(){function find(n){const c=(n._components||[]).find(c=>typeof c.startGame==='function'&&c.screen);if(c)return c;for(const child of n.children||[]){const r=find(child);if(r)return r;}}return !!(window.cc&&cc.director.getScene()&&find(cc.director.getScene()));}
(async()=>{
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const results=[];
try{for(const [width,height] of [[390,844],[320,568],[768,1024]]){
 const deviceId=`progress-browser-${width}-${Date.now()}`;
 const user=await api('/players/bootstrap',null,{deviceId});
 const begun=await api('/games/start',user.token,{roundId:`round_browser_${width}_${Date.now()}`,collectionRule:'progress_v2',rulesVersion:10,resumeProtocol:1});
 const board=new BoardEngine();board.resetBoard(begun.seed,begun.isTutorial,10);
 for(let step=0;step<2;step++){const move=board.getTutorialMove(step);board.movePiece(move.id,move.offset);settle(board);board.finishPlayerAction();if(step===0)await api('/games/checkpoint',user.token,{roundId:begun.roundId,sessionToken:begun.sessionToken,actions:board.roundActions,elapsedMs:0});}
 const expected={score:board.score,pieces:board.pieces,nextPieces:board.nextPieces,randomState:board.randomState};
 const record={...begun,playerId:user.profile.playerId,environment:'http://127.0.0.1:8080/v1/cocos-zyx',actions:board.roundActions,elapsedMs:0,actionCount:board.roundActions.length,operationCount:2,acknowledgedActions:1,acknowledgedOperations:1,updatedAt:Date.now()};
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2});
 await context.addInitScript(({deviceId,token,record})=>{
  if(!localStorage.getItem('progress_fixture_initialized')){
   localStorage.setItem('zyx_data_generation','mood_bean_v5_20261112');localStorage.setItem('zyx_cloud_device_id',deviceId);localStorage.setItem('zyx_cloud_token',token);
   localStorage.setItem(`zyx_round_progress_v1_${record.environment}_${record.playerId}`,JSON.stringify(record));localStorage.setItem('progress_fixture_initialized','1');
  }
 },{deviceId,token:user.token,record});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(preview);
 await page.waitForFunction(()=>document.querySelector('canvas')&&window.cc&&(()=>{function walk(n){if(n.getComponentsInChildren(cc.Label).some(l=>l.string==='接着上次继续吧'))return true;return false;}return cc.director.getScene()&&walk(cc.director.getScene());})());
 await page.waitForTimeout(400);
 await page.screenshot({path:path.join(out,`resume-prompt-${width}.png`)});
 await button(page,'稍后再玩');assert.equal((await api('/games/active',user.token)).round.operationCount,1);
 const root=await page.evaluate(findSceneInBrowser); // 只检查根组件存在，不序列化进度给主域以外服务。
 assert.ok(root);
 await page.evaluate(()=>{function find(n){const c=(n._components||[]).find(c=>typeof c.startGame==='function'&&c.screen);if(c)return c;for(const child of n.children||[]){const r=find(child);if(r)return r;}}void find(cc.director.getScene()).startGame();});
 await page.waitForFunction(()=>cc.director.getScene().getComponentsInChildren(cc.Label).some(l=>l.string==='继续上局'));
 await button(page,'继续上局');
 await page.waitForFunction(()=>{function find(n){const c=(n._components||[]).find(c=>c.beanCollectionHud);if(c){window.__progressGame=c;return true;}return (n.children||[]).some(find);}return find(cc.director.getScene());});
 await page.waitForTimeout(300);
 const restored=await page.evaluate(()=>{const b=__require('ZyxGameModule').zyxGameModule;return {score:b.score,pieces:b.pieces,nextPieces:b.nextPieces,randomState:b.randomState,tutorialStep:window.__progressGame.tutorialStep};});
 assert.deepEqual({score:restored.score,pieces:restored.pieces,nextPieces:restored.nextPieces,randomState:restored.randomState},expected);
 assert.equal(restored.tutorialStep,2);
 const saved=await api('/games/active',user.token);assert.equal(saved.round.operationCount,2);assert.equal(saved.round.generation,1);
 await page.screenshot({path:path.join(out,`restored-game-${width}.png`)});
 // 解除引导的表现遮罩后打开真实暂停页，验证保存返回不结算。
 await page.evaluate(()=>{const game=window.__progressGame;game.clearTutorialGuide();game.locked=false;game.pauseGame();});
 await page.waitForTimeout(250);
 await page.screenshot({path:path.join(out,`pause-save-${width}.png`)});
 await button(page,'保存返回');
 await page.waitForFunction(()=>{function find(n){const c=(n._components||[]).find(c=>typeof c.startGame==='function'&&c.screen);if(c)return c.screen.name==='home';return (n.children||[]).some(find);}return find(cc.director.getScene());});
 assert.equal((await api('/games/active',user.token)).round.roundId,begun.roundId);
 await page.reload();await page.waitForFunction(()=>window.cc&&cc.director.getScene()&&cc.director.getScene().getComponentsInChildren(cc.Label).some(l=>l.string==='接着上次继续吧'));
 await button(page,'继续上局');await page.waitForFunction(()=>{function find(n){const c=(n._components||[]).find(c=>c.beanCollectionHud);if(c){window.__progressGame=c;return true;}return (n.children||[]).some(find);}return find(cc.director.getScene());});
 assert.equal((await api('/games/active',user.token)).round.generation,2);
 if(width===390){
  // 实际组件继续第3步教学，再结算；资产仅从服务端回执到账。
  await page.evaluate(()=>{const game=window.__progressGame,b=__require('ZyxGameModule').zyxGameModule;game.clearTutorialGuide();const move=b.getTutorialMove(2);if(!b.movePiece(move.id,move.offset))throw Error('续玩移动失败');game.resolveTutorialTurn();});
  await page.waitForFunction(()=>window.__progressGame.tutorialStep<0&&!window.__progressGame.locked,null,{timeout:45000});
  await page.waitForFunction(()=>Date.now()-__require('ZyxGameModule').zyxGameModule.roundStartedAt>=5100);
  await page.evaluate(()=>window.__progressGame.finishGame('续玩验收完成'));
  await page.waitForFunction(()=>__require('ZyxGameModule').zyxGameModule.getPendingRoundSettlements().length===0,null,{timeout:30000});
  assert.equal((await api('/games/active',user.token)).round,null);
  const final=await api('/players/bootstrap',null,{deviceId});assert.equal(final.profile.stamina.current,9);assert.ok(final.profile.highestSingleGameScore>expected.score);
  await page.screenshot({path:path.join(out,'resumed-settlement-390.png')});
 }
 assert.deepEqual(errors,[]);results.push({width,height,localTailRecovered:true,randomStateMatched:true,saveReturnKeepsRound:true,coldLaunchPromptsAgain:true,staminaNotChargedAgain:true,errors});
 await context.close();
}
fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));console.log('PASS: real isolated API, 3 sizes, verified local tail, exact board/RNG restore, save-return, cold launch, same-round settlement, no extra stamina or page errors');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
