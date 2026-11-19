/** 本地真实渲染验证；演示棋盘不保存或提交成绩，原生广告由单元测试模拟。 */
const {chromium} = require('/Users/liuyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs');
const out = 'output/audio-drag-20261118';
(async () => {
    const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true,
        args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const results = [];
    try {
        for (const [width,height] of [[390,844],[320,568],[768,1024]]) {
            const context = await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:1});
            const page = await context.newPage(), errors = [];
            page.on('pageerror', e => errors.push(e.message));
            await page.goto('http://127.0.0.1:7468/?localApi=1&autostart=1&toolVisuals=1');
            await page.waitForFunction(() => window.__toolVisualPreview && !__toolVisualPreview.locked, {}, {timeout:30000});
            await page.waitForTimeout(350);
            await page.evaluate(() => {
                const g = __toolVisualPreview, b = __require('ZyxGameModule').zyxGameModule;
                g.tryShowRoundRescue = () => false;
                b.resetBoard(742,false,14); b.cloudRoundId = '';
                const p = (id,row,col,size) => ({id,row,col,size,color:2,stampMood:0,stampCell:0,collectibleType:0,collectibleCell:0});
                b.pieces = [p(102,9,1,2),p(103,8,4,3),p(104,7,1,2)]; g.renderAll();
                window.__dragTrace = [];
                const update = g.updateDragColumns.bind(g);
                g.updateDragColumns = (id,offset) => { __dragTrace.push({id,offset}); update(id,offset); };
            });
            await page.waitForTimeout(200);
            const point = await page.evaluate(() => {
                const g = __toolVisualPreview, p = g.pieceLayer.getChildByName('piece_102').convertToWorldSpaceAR(cc.v2());
                return {x:p.x/cc.winSize.width*innerWidth,y:(1-p.y/cc.winSize.height)*innerHeight,
                    cell:__require('ZyxGameModule').CELL_SIZE/cc.winSize.width*innerWidth};
            });
            const touch = (type,x,y) => page.evaluate(({type,x,y}) => {
                const canvas = document.getElementById('GameCanvas');
                const t = new Touch({identifier:1,target:canvas,clientX:x,clientY:y,pageX:x,pageY:y,screenX:x,screenY:y,force:0.5});
                const active = type === 'touchend' ? [] : [t];
                canvas.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:active,targetTouches:active,changedTouches:[t]}));
            }, {type,x,y});
            await touch('touchstart',point.x,point.y);
            assert.equal(await page.evaluate(() => __toolVisualPreview.dragColumnHint.active),true);
            await touch('touchmove',point.x+point.cell,point.y);
            await page.waitForTimeout(120);
            const hint = await page.evaluate(() => {
                const g = __toolVisualPreview, c = g.dragColumnHint.getComponent(cc.Graphics);
                return {active:g.dragColumnHint.active,owner:g.dragColumnPieceId,alpha:c.fillColor.a,
                    hintZ:g.dragColumnHint.zIndex,pieceZ:g.pieceLayer.zIndex,trace:__dragTrace.slice()};
            });
            assert.equal(hint.active,true); assert.equal(hint.owner,102); assert.equal(hint.alpha,48);
            assert.ok(hint.hintZ < hint.pieceZ); assert.deepEqual(hint.trace.at(-1),{id:102,offset:1});
            await page.screenshot({path:`${out}/drag-columns-${width}.png`});
            await touch('touchend',point.x+point.cell,point.y);
            assert.equal(await page.evaluate(() => __toolVisualPreview.dragColumnHint.active),false);
            await page.waitForFunction(() => !__toolVisualPreview.locked,{}, {timeout:15000});
            // 在真实音频引擎中用已预载短音频作为循环轨，隔离远端BGM下载。
            await page.evaluate(() => {
                const a = __require('AudioManager').audioManager, loader = __require('AssetLoader');
                a.enterScene('silent'); a.clearRecoveryTimers();
                a.scene='game'; a.currentMusic='game'; a.musicClip=loader.getAudioClip('effects',loader.ASSET_PATHS.effects.bombSound);
                a.previewAudioOwner=true; a.webFocused=true; a.appVisible=true; a.syncMusic();
                window.__firstMusic = a.musicAudioId;
                cc.game.emit('zyx:reward-video',true); cc.game.emit(cc.game.EVENT_HIDE); cc.game.emit(cc.game.EVENT_SHOW);
            });
            assert.equal(await page.evaluate(() => cc.audioEngine.getState(__firstMusic)),2);
            await page.evaluate(() => cc.game.emit('zyx:reward-video',false));
            await page.waitForTimeout(250);
            const recovery = await page.evaluate(() => {
                const a = __require('AudioManager').audioManager;
                return {old:__firstMusic,current:a.musicAudioId,state:cc.audioEngine.getState(a.musicAudioId)};
            });
            assert.notEqual(recovery.current,recovery.old); assert.equal(recovery.state,1);
            await page.evaluate(() => {
                window.__effects = [];
                const original = cc.audioEngine.playEffect.bind(cc.audioEngine);
                cc.audioEngine.playEffect = (clip,loop) => {
                    __effects.push({url:clip.nativeUrl,name:clip.name,loop,time:performance.now()});
                    return original(clip,loop);
                };
            });
            for (const word of ['Wow','Good','Great','Perfect']) {
                await page.getByRole('button',{name:word,exact:true}).click();
                await page.waitForTimeout(200);
                if (word === 'Perfect') await page.screenshot({path:`${out}/combo-perfect-${width}.png`});
            }
            const clips = await page.evaluate(() => __effects.map(e=>e.name));
            for (const key of ['wow','good','great','perfect']) assert.ok(clips.includes(`combo_${key}_v1`),JSON.stringify(clips));
            // 提交/持久化立即执行，只有死亡结算弹窗延迟；重复调用不得重复音效/提交。
            await page.evaluate(() => {
                const g=__toolVisualPreview,b=__require('ZyxGameModule').zyxGameModule,u=__require('UIManager').uimanager;
                if(u.modal)u.closeModal();
                g.locked=false;g.settlementReported=false;b.roundSettled=false;b.pieces[0].row=0;g.renderAll();
                window.__death={start:performance.now(),submitted:0,shown:null};
                g.onRoundFinished=()=>__death.submitted++;
                const show=g.showSettlement.bind(g);
                g.showSettlement=s=>{__death.shown=performance.now();show(s);};
                Object.getPrototypeOf(g).finishGame.call(g,'测试');
                Object.getPrototypeOf(g).finishGame.call(g,'重复测试');
            });
            await page.waitForTimeout(500);
            assert.equal(await page.evaluate(() => !!__require('UIManager').uimanager.modal),false);
            await page.waitForFunction(() => !!__require('UIManager').uimanager.modal,{}, {timeout:2500});
            const death = await page.evaluate(() => ({submitted:__death.submitted,delay:__death.shown-__death.start,
                music:__require('AudioManager').audioManager.currentMusic,
                sounds:__effects.filter(e=>e.name==='sound_gameover').length}));
            assert.equal(death.submitted,1); assert.equal(death.music,null); assert.equal(death.sounds,1);
            assert.ok(death.delay>=950 && death.delay<1600,JSON.stringify(death));
            await page.waitForTimeout(250); await page.screenshot({path:`${out}/death-settlement-${width}.png`});
            assert.deepEqual(errors,[]);
            results.push({width,height,hint,releaseClears:true,recovery,comboClips:clips,death,pageErrors:errors});
            await context.close();
        }
        fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify(results,null,2));
        console.log('Audio and drag checks passed on',results.length,'viewport sizes');
    } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
