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

 for(const size of [{width:320,height:568},{width:768,height:1024}]){
 await page.setViewportSize(size);await page.goto('http://localhost:7458/?localApi=1&balloonDemo=1&heartDemo=1');
 await page.waitForFunction(()=>window.__previewGame&&__previewGame.warmBalloonActive);
 const hud=await page.evaluate(()=>{const g=__previewGame,b=__require('ZyxGameModule').zyxGameModule;b.difficultyActionCount=100;g.renderNextRow();return {caption:!!g.beanCollectionHud.root.getChildByName('collectionCaption'),next:g.nextLayer.children.map(n=>n.name),label:g.nextRowLabel.string,pill:g.moodStageLabel.node.parent.opacity}});
 assert.equal(hud.caption,false);assert.equal(hud.label,'下一排');assert.ok(hud.next.every(n=>n.startsWith('next_0_')));assert.equal(hud.pill,218);
 await page.evaluate(()=>__previewGame.handleRoundRescueClick());
 await page.waitForFunction(()=>__previewGame.balloonModal.getComponentsInChildren(cc.Button)[0].interactable,null,{timeout:15000});
 await page.screenshot({path:out+'/letter-'+size.width+'.png'});
 results.push({size,hud});}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/layout-proof.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
