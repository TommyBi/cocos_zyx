const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('/Users/liuyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=require('node:path').resolve(__dirname,'../..');
const {replayRound}=require(root+'/server/src/gameEngine');
const out=root+'/output/heart-letter-20261114';fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 page.on('pageerror',e=>errors.push(e.message));
 const profile={playerId:'isolated-rescue-qa',nickname:'快乐小狐狸',registeredAt:new Date(Date.now()-8*86400000).toISOString(),avatarUrl:'',level:1,experience:0,moodBeanBalance:0,totalMoodBeans:0,highestSingleGameScore:0,gameCount:10,inventory:{hammer:3,magicWand:3},stamina:{current:10,max:10,updatedAt:Date.now(),regenSeconds:300,serverTime:new Date().toISOString(),shareAvailableToday:true}};
 await page.route('**/*',async r=>{const u=new URL(r.request().url());
 if(r.request().method()==='OPTIONS')return r.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'}});
 if(u.pathname.includes('/v1/cocos-zyx/')){
 let data={profile};
 if(u.pathname.endsWith('/health'))data={capabilities:['bean-collection-progress','adaptive-combo-v2','bean-collection-1pct','bean-tool-shop','difficulty-ramp-2x','difficulty-pressure-v4','rising-rows-v5','balloon-rescue-v6','balloon-blast-v7','random-rescue-v8','rescue-scoring-v9','heart-rescue-v10']};
 else if(u.pathname.endsWith('/players/bootstrap'))data={token:'qa-token',profile,serverTime:new Date().toISOString()};
 else if(u.pathname.endsWith('/games/start'))data={roundId:r.request().postDataJSON().roundId,seed:1,isTutorial:false,collectionRule:'progress_v2',rulesVersion:10,heartRescueEligible:true,stamina:profile.stamina,profile};
 else if(u.pathname.endsWith('/leaderboards'))data={entries:[],self:{rank:null,bestScore:0,onBoard:false}};
 return r.fulfill({json:{code:0,data},headers:{'Access-Control-Allow-Origin':'*'}});
 }
 if(!['localhost','127.0.0.1'].includes(u.hostname))return r.abort();return r.continue();});

 await page.goto('http://localhost:7458/?localApi=1&home=1&v=20261114.07');
 await page.waitForFunction(()=>window.cc&&cc.find('Canvas')&&cc.find('Canvas').getComponentsInChildren(cc.Label).some(l=>l.node.name==='clientVersion'));
 assert.equal(await page.evaluate(()=>!!cc.find('Canvas').getComponentsInChildren(cc.Sprite).find(s=>s.node.name==='startWordmark')),true);
 await page.screenshot({path:out+'/home-start-wordmark.png'});
 await page.goto('http://localhost:7458/?localApi=1&balloonDemo=1&heartDemo=1');
 await page.waitForFunction(()=>window.__previewGame&&__previewGame.boardDangerHalo);
 const before=await page.evaluate(()=>({score:__require('ZyxGameModule').zyxGameModule.score,turn:__require('ZyxGameModule').zyxGameModule.turn}));
 await page.screenshot({path:out+'/danger-glow.png'});
 await page.waitForFunction(()=>__previewGame.warmBalloonActive,null,{timeout:6000});
 const warm=await page.evaluate(()=>({seconds:__previewGame.dangerSeconds,score:__require('ZyxGameModule').zyxGameModule.score,warm:__previewGame.rescueBalloon.warm}));
 assert.ok(warm.seconds>=2);assert.equal(warm.warm,true);assert.ok(warm.score<500);
 await page.waitForTimeout(2400);await page.screenshot({path:out+'/warm-balloon.png'});
 await page.evaluate(()=>__previewGame.handleRoundRescueClick());await page.waitForTimeout(300);
 await page.waitForFunction(()=>__previewGame.balloonModal.getComponentsInChildren(cc.Label).filter(l=>l.string).length>=2);
 const typing=await page.evaluate(()=>__previewGame.balloonModal.getComponentsInChildren(cc.Button)[0].interactable);
 assert.equal(typing,false);await page.screenshot({path:out+'/typing.png'});
 await page.waitForFunction(()=>__previewGame.balloonModal.getComponentsInChildren(cc.Button)[0].interactable,null,{timeout:15000});
 const message=await page.evaluate(()=>{const modal=__previewGame.balloonModal;return {texts:modal.getComponentsInChildren(cc.Label).map(l=>l.string),buttons:modal.getComponentsInChildren(cc.Button).map(b=>b.node.name)}});
 assert.ok(message.texts.some(t=>t.includes('9天的喜爱')));assert.equal(message.buttons.length,1);
 assert.ok(message.texts.includes('收下祝福'));assert.ok(!message.texts.includes('开心豆的留言'));
 await page.screenshot({path:out+'/message.png'});
 const thank=await page.evaluate(()=>{const btn=__previewGame.balloonModal.getComponentsInChildren(cc.Button)[0].node;const world=btn.convertToWorldSpaceAR(cc.v2(0,0)),r=document.querySelector('canvas').getBoundingClientRect();return {x:r.left+world.x/cc.winSize.width*r.width,y:r.top+r.height-world.y/cc.winSize.height*r.height}});
 await page.mouse.click(thank.x,thank.y);
 await page.waitForFunction(()=>!!__previewGame.pieceLayer.getChildByName('heartWave'),null,{timeout:6000});
 await page.waitForTimeout(100);await page.screenshot({path:out+'/heart-waves.png'});
 await page.waitForFunction(()=>!__previewGame.locked&&!__previewGame.warmBalloonActive,null,{timeout:10000});
 const state=await page.evaluate(()=>{const b=__require('ZyxGameModule').zyxGameModule;return {score:b.score,raw:b.roundCollectedMoodBeans,actions:b.roundActions,seed:b.roundSeed,turn:b.turn,movable:b.pieces.some(p=>{const r=b.getMoveRange(p.id);return r.min||r.max})}});
 assert.equal(state.turn-before.turn,1);assert.ok(state.movable);
 fs.writeFileSync(out+'/browser-state.json',JSON.stringify(state,null,2));
 assert.deepEqual(replayRound(state.seed,false,state.actions,10,true),{valid:true,score:state.score,collectedMoodBeans:state.raw});
 assert.equal(state.actions.filter(a=>a.type==='heart').length,1);
 await page.screenshot({path:out+'/after.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser-proof.json',JSON.stringify({before,warm,message,state,errors},null,2));console.log(JSON.stringify({before,warm,message,after:{score:state.score,rows:state.turn-before.turn,movable:state.movable},errors}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
