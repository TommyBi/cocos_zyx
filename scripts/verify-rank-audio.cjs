/** 本地演示中检查真实音频输出、排名彩带和两种救场；不提交演示成绩。 */
const {chromium}=require('/Users/liuyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const out=process.env.AUDIO_VERIFY_OUTPUT||'output/rank-audio-20261118';
const voiceVersion=process.env.COMBO_AUDIO_VERSION||'v4';
const viewports=process.env.AUDIO_VERIFY_ONE_VIEWPORT==='1'?[[390,844]]:[[390,844],[320,568],[768,1024]];
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const results=[];
 try{for(const [width,height]of viewports){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:7468/?localApi=1&autostart=1&toolVisuals=1');await page.waitForFunction(()=>window.__toolVisualPreview&&!__toolVisualPreview.locked,{}, {timeout:30000});
  await page.getByRole('button',{name:'Wow',exact:true}).click();
  await page.waitForFunction(()=>window.__previewAudioDiagnostics().owner,{}, {timeout:10000});
  await page.evaluate(()=>{
   const audio=__require('AudioManager').audioManager;audio.webFocused=true;audio.appVisible=true;audio.enterScene('game');
   window.__sounds=[];const original=cc.audioEngine.playEffect.bind(cc.audioEngine);
   cc.audioEngine.playEffect=(clip,loop)=>{
    const id=original(clip,loop),element=cc.audioEngine._id2audio[id]._element;
    const trace={name:clip.name,duration:clip.duration,loop,start:performance.now(),maxRms:0,context:element._context?.state,loaded:clip.loaded};__sounds.push(trace);
    if(element._gainObj){
     const analyser=element._context.createAnalyser(),silent=element._context.createGain();analyser.fftSize=1024;silent.gain.value=0;
     element._gainObj.connect(analyser);analyser.connect(silent);silent.connect(element._context.destination);
     const buf=new Float32Array(1024);let remaining=Math.ceil((clip.duration+.1)*60);
     function sample(){analyser.getFloatTimeDomainData(buf);const rms=Math.sqrt(buf.reduce((s,v)=>s+v*v,0)/buf.length);trace.maxRms=Math.max(trace.maxRms,rms);if(remaining-->0)requestAnimationFrame(sample);else{element._gainObj.disconnect(analyser);analyser.disconnect();silent.disconnect();}}
     requestAnimationFrame(sample);
    }
    return id;
   };
  });
  for(const word of ['Wow','Good','Great','Perfect']){await page.getByRole('button',{name:word,exact:true}).click();await page.waitForTimeout(1150);}
  const voices=await page.evaluate(()=>__sounds.filter(s=>s.name.startsWith('combo_')));
  assert.equal(voices.length,4);for(const s of voices){assert.ok(s.name.endsWith('_'+voiceVersion));assert.equal(s.loaded,true);assert.equal(s.context,'running');assert.ok(s.maxRms>.001,JSON.stringify(s));}
  await page.getByRole('button',{name:'超越彩带',exact:true}).click();await page.waitForTimeout(650);
  const early=await page.evaluate(()=>{const r=__toolVisualPreview.rankChase;return{exists:!!r.celebration,opacity:r.celebration?.opacity,motion:r.celebrationMotion?.progress,faceY:r.selfAvatar.y,scoreY:r.selfScore.node.y};});assert.equal(early.exists,true);
  await page.screenshot({path:`${out}/victory-ribbons-${width}.png`});
  await page.waitForTimeout(1700);
  const fade=await page.evaluate(()=>__toolVisualPreview.rankChase.celebration?.opacity);assert.ok(fade>0&&fade<200,String(fade));
  await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>!!__toolVisualPreview.rankChase.celebration),false);
  const cheer=await page.evaluate(()=>__sounds.filter(s=>s.name==='sound_huanhu'));assert.equal(cheer.length,1);assert.equal(cheer[0].duration,2.873469);assert.ok(cheer[0].maxRms>.001);
  // 真正跨过快照里的多个对手只庆祝一次；同分和普通加分不庆祝。
  await page.evaluate(()=>{const r=__toolVisualPreview.rankChase;r.score=0;r.entries=[{playerId:'demo-a',rank:1,value:100},{playerId:'demo-b',rank:2,value:50}];r.updateScore(50);r.updateScore(101);r.updateScore(150);});
  await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>__sounds.filter(s=>s.name==='sound_huanhu').length),2);
  await page.getByRole('button',{name:'急救闪电',exact:true}).click();await page.waitForTimeout(180);await page.screenshot({path:`${out}/emergency-lightning-${width}.png`});await page.waitForTimeout(1250);
  assert.equal(await page.evaluate(()=>__sounds.filter(s=>s.name==='sound_shandian').length),1);
  await page.getByRole('button',{name:'爱心消除',exact:true}).click();await page.waitForFunction(()=>__sounds.some(s=>s.name==='sound_tool2'),{}, {timeout:8000});
  await page.screenshot({path:`${out}/heart-clear-${width}.png`});await page.waitForFunction(()=>!__toolVisualPreview.locked,{}, {timeout:15000});
  const sounds=await page.evaluate(()=>__sounds);assert.equal(sounds.filter(s=>s.name==='sound_tool2').length,1);
  assert.deepEqual(errors,[]);results.push({width,height,voices,early,fade,cheerDuration:cheer[0].duration,oneCheerPerOvertake:true,emergencySound:true,heartUsesWand:true,pageErrors:errors});await context.close();
 }
 fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify(results,null,2));console.log('Rank/audio output verified on',results.length,'viewport sizes');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
