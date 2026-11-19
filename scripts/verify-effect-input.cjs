/** 本地真实游戏的多指输入与炸弹/闪电演出压力检查；夹具不保存、不提交成绩。 */
const {chromium}=require(process.env.PLAYWRIGHT_PATH || '/Users/liuyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('output/lightning-input-20261117');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const results=[];
 try {for(const [width,height] of [[390,844],[320,568],[768,1024]]) {
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:1});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:7466/?localApi=1&autostart=1&toolVisuals=1');await page.waitForFunction(()=>window.__toolVisualPreview&&!window.__toolVisualPreview.locked,{},{timeout:30000});
  const touch=async(type,active,changed)=>page.evaluate(({type,active,changed})=>{
    const canvas=document.getElementById('GameCanvas');
    const make=p=>new Touch({identifier:p.id,target:canvas,clientX:p.x,clientY:p.y,pageX:p.x,pageY:p.y,screenX:p.x,screenY:p.y,force:0.5});
    canvas.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:active.map(make),targetTouches:active.map(make),changedTouches:changed.map(make)}));
  },{type,active,changed});
  for(const kind of ['bomb','lightning','chain']) {
   await page.evaluate(kind=>{
    const g=window.__toolVisualPreview,b=__require('ZyxGameModule').zyxGameModule;
    g.locked=false;g.tutorialStep=-1;g.clearTutorialGuide();g.firstGameBombGuide=false;g.cancelEliminationHint();g.resetHapticTouch=()=>{};
    b.resetBoard(742,false,13);b.cloudRoundId='';g.captureProgress=()=>{};g.tryShowRoundRescue=()=>false;
    const p=(id,row,col,size,extra={})=>({id,row,col,size,color:2,stampMood:0,stampCell:0,collectibleType:0,collectibleCell:0,...extra});
    b.pieces=[p(100,9,0,1,{bomb:true}),p(102,6,0,3),p(103,5,4,3),p(104,4,1,2),p(105,3,5,1),p(106,2,1,1)];
    if(kind==='lightning')b.pieces.push(p(101,8,0,1,{lightning:true}));
    if(kind==='chain')b.pieces.push(p(101,8,1,1,{bomb:true}),p(107,7,1,1,{lightning:true}));
    g.renderAll();g.displayedRoundMoods=0;
    window.__effectTrace={sounds:[],firstArc:null,lastArc:null,done:false};
    const audio=__require('AudioManager').audioManager;
    if(!window.__originalPlaySound)window.__originalPlaySound=audio.playSound.bind(audio);
    audio.playSound=name=>{window.__effectTrace.sounds.push(name);window.__originalPlaySound(name);};
    const clip=__require('AssetLoader').getAudioClip('effects',__require('AssetLoader').ASSET_PATHS.effects.lightningSound);
    if(!clip)throw Error('点击声未预载');
    function frame(){const trace=window.__effectTrace;if(trace.done)return;const arcs=g.pieceLayer.children.filter(n=>n.name==='lightningArc');if(arcs.length){if(trace.firstArc===null)trace.firstArc=performance.now();trace.lastArc=performance.now();}requestAnimationFrame(frame);}requestAnimationFrame(frame);
   },kind);
   await page.waitForTimeout(150);
   const points=await page.evaluate(()=>{const g=__toolVisualPreview;const screen=id=>{const n=g.pieceLayer.getChildByName('piece_'+id),p=n.convertToWorldSpaceAR(cc.v2());return{x:p.x/cc.winSize.width*innerWidth,y:(1-p.y/cc.winSize.height)*innerHeight};};return{drag:screen(102),bomb:screen(100),cell:__require('ZyxGameModule').CELL_SIZE/cc.winSize.width*innerWidth};});
   const finger=(p,id)=>({x:p.x,y:p.y,id});
   const held={x:points.drag.x+points.cell*.45,y:points.drag.y};
   await touch('touchstart',[finger(points.drag,1)],[finger(points.drag,1)]);
   await touch('touchmove',[finger(held,1)],[finger(held,1)]);
   assert.equal(await page.evaluate(()=>__toolVisualPreview.pieceLayer.getChildByName('piece_102').getComponent(__require('ZyxGridCom').default).touching),true,'第一个触点必须实际开始拖拽');
   await touch('touchstart',[finger(held,1),finger(points.bomb,2)],[finger(points.bomb,2)]);
   await touch('touchend',[finger(held,1)],[finger(points.bomb,2)]);
   await page.waitForFunction(()=>__toolVisualPreview.locked,{},{timeout:3000});
   assert.equal(await page.evaluate(()=>__toolVisualPreview.pieceLayer.getChildByName('piece_102').getComponent(__require('ZyxGridCom').default).touching),false,'起爆必须立即撤销另一根手指的旧拖拽');
   await touch('touchstart',[finger(held,1),finger(points.drag,4)],[finger(points.drag,4)]);
   await touch('touchmove',[finger(held,1),finger({x:points.drag.x+10,y:points.drag.y},4)],[finger({x:points.drag.x+10,y:points.drag.y},4)]);
   await touch('touchend',[finger(held,1)],[finger({x:points.drag.x+10,y:points.drag.y},4)]);
   assert.equal(await page.evaluate(()=>__require('ZyxGameModule').zyxGameModule.moveCount),0,'演出中新按下的触点也必须被拦截');
   for(let i=0;i<5;i++)await touch('touchmove',[finger({x:held.x+(i%2?15:-15),y:held.y},1)],[finger({x:held.x+(i%2?15:-15),y:held.y},1)]);
   await page.waitForFunction(()=>!__toolVisualPreview.locked,{},{timeout:15000});
   const before=await page.evaluate(()=>{const b=__require('ZyxGameModule').zyxGameModule;return{moves:b.moveCount,bombs:b.roundActions.filter(a=>a.type==='bomb').length,score:b.score,pieces:JSON.stringify(b.pieces)};});
   await touch('touchend',[],[finger(held,1)]);await page.waitForTimeout(100);
   const after=await page.evaluate(()=>{const b=__require('ZyxGameModule').zyxGameModule;return{moves:b.moveCount,bombs:b.roundActions.filter(a=>a.type==='bomb').length,score:b.score,pieces:JSON.stringify(b.pieces)};});assert.deepEqual(after,before,'动画结束后才松手不得重放旧动作');assert.equal(after.moves,0);assert.equal(after.bombs,1);
   const trace=await page.evaluate(()=>{window.__effectTrace.done=true;return window.__effectTrace;});assert.ok(trace.sounds.includes(kind === 'bomb' ? 'bomb' : 'lightning'));assert.ok(trace.sounds.includes('bomb'));
   if(kind!=='bomb'){const duration=trace.lastArc-trace.firstArc;assert.ok(duration>=550&&duration<=780,JSON.stringify(trace));}
   const next=await page.evaluate(()=>{const g=__toolVisualPreview,b=__require('ZyxGameModule').zyxGameModule;for(const piece of b.pieces){if(piece.bomb)continue;const range=b.getMoveRange(piece.id),offset=range.max>=1?1:range.min<=-1?-1:0;if(!offset)continue;const p=g.pieceLayer.getChildByName('piece_'+piece.id).convertToWorldSpaceAR(cc.v2());return{x:p.x/cc.winSize.width*innerWidth,y:(1-p.y/cc.winSize.height)*innerHeight,offset};}return null;});assert.ok(next,'演出结束应有可操作色块');
   await touch('touchstart',[finger(next,3)],[finger(next,3)]);await touch('touchmove',[finger({x:next.x+next.offset*points.cell,y:next.y},3)],[finger({x:next.x+next.offset*points.cell,y:next.y},3)]);await touch('touchend',[],[finger({x:next.x+next.offset*points.cell,y:next.y},3)]);
   await page.waitForFunction(()=>__require('ZyxGameModule').zyxGameModule.moveCount===1,{},{timeout:3000});await page.waitForFunction(()=>!__toolVisualPreview.locked,{},{timeout:15000});
   results.push({width,height,kind,multiTouchCancelled:true,releaseAfterUnlockIgnored:true,newTouchDuringEffectBlocked:true,newDragWorks:true,arcMs:trace.firstArc===null?null:Math.round(trace.lastArc-trace.firstArc),userSound:true});
  }
  assert.deepEqual(errors,[]);await page.screenshot({path:path.join(out,'ready-'+width+'.png')});await context.close();
 }
 fs.writeFileSync(path.join(out,'input-results.json'),JSON.stringify(results,null,2));console.log('Effect input checks passed:',results.length,'Web DOM multi-touch scenarios');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
