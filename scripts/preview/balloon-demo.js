(async function(){
 const heartDemo=new URLSearchParams(location.search).get('heartDemo')==='1';
 const clearDemo=new URLSearchParams(location.search).get('rescueDemo')==='clear';
 const trace=await fetch(heartDemo?'/__heart_fixture.json':clearDemo?'/__clear_fixture.json':'/__balloon_fixture.json').then(r=>r.json());
 const wait=()=>new Promise(r=>setTimeout(r,120));
 function findGame(node){const game=(node._components||[]).find(c=>c.beanCollectionHud);if(game)return game;for(const child of node.children||[]){const g=findGame(child);if(g)return g}return null}
 let game;
 for(let i=0;i<350;i++){if(window.cc&&cc.director.getScene())game=findGame(cc.director.getScene());if(game&&!game.locked)break;await wait()}
 if(!game||game.locked)throw new Error('本地预览尚未就绪，请刷新重试');
 const board=window.__require('ZyxGameModule').zyxGameModule;
 game.tutorialStep=-1;game.clearTutorialGuide();game.cancelEliminationHint();game.dismissRoundRescuePrompt(false);
 board.resetBoard(trace.seed,false);
 const finalOffer=trace.actions.filter(a=>['rescueOffer','heartOffer'].includes(a.type)).at(-1);
 for(const action of trace.actions.slice(1)){
  if(action===finalOffer)break;
  switch(action.type){case'move':board.movePiece(action.id,action.offset);break;case'bomb':board.detonateBomb(action.id);break;case'rise':board.appendTurnRows();break;case'append':board.appendNextRow();break;case'settle':board.applyGravity();board.eliminateFullRows();break;case'finish':board.finishPlayerAction();break;case'rescueOffer':board.offerRoundRescue(action.elapsedMs);break;case'rescueDismiss':board.dismissRoundRescue();break;default:throw new Error('Unsupported demo action')}
 }
 // 演示局不提交成绩或奖励；普通试玩链接使用真实本地新局。
 game.onRoundFinished=()=>{};
 game.displayedRoundMoods=board.roundCollectedMoodBeans;game.beanCollectionHud.complete(board.roundCollectedMoodBeans);
 game.locked=false;game.renderAll();game.rankExpanded=true;game.rankExpansion.progress=1;game.applyRankLayout();
 function hideGM(n){if(n.name==='gmFloatingBubble')n.active=false;(n.children||[]).forEach(hideGM)}hideGM(cc.director.getScene());
 board.roundStartedAt=Date.now()-finalOffer.elapsedMs;
 if(heartDemo){board.heartRescueEligible=true;game.renderAll();game.updateBoardDangerState();}else if(!game.tryShowRoundRescue())throw new Error('演示救场未出现');
 if(game.rescueBalloon){game.rescueBalloon.elapsed=3.4;game.rescueBalloon.update(0,false);game.handleRoundRescueClick();}
 window.__previewGame=game;
 const controls=document.createElement('div');controls.style.cssText='position:fixed;bottom:5px;left:50%;transform:translateX(-50%);z-index:99999;white-space:nowrap;background:#fff6e0dd;color:#775649;font:12px sans-serif;border:1px solid #d3a462;border-radius:12px;padding:5px 10px;';
 const label=document.createTextNode((heartDemo?'暖心气球':clearDemo?'清屏':'热气球')+'演示 · 不计成绩　');controls.appendChild(label);
 const replay=document.createElement('a');replay.href=location.href;replay.textContent='重播';replay.style.color='#42785c';controls.appendChild(replay);
 const music=document.createElement('a');music.href='#';music.textContent='　试听音乐';music.style.color='#42785c';let listening=false;music.onclick=event=>{event.preventDefault();listening=!listening;__require('AudioManager').audioManager.setPreviewMuted(!listening);music.textContent=listening?'　关闭音乐':'　试听音乐';};controls.appendChild(music);
 const normal=document.createElement('a');normal.href='/?localApi=1&home=1';normal.textContent='　返回首页';normal.style.color='#42785c';controls.appendChild(normal);document.body.appendChild(controls);
})().catch(error=>{console.error(error);const n=document.createElement('p');n.textContent=error.message;n.style.cssText='position:fixed;top:0;z-index:99999;background:white;color:#775649;padding:12px';document.body.appendChild(n)});
