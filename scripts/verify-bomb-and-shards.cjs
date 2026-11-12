/** 本机真实首步 + 独立爆破场景；不提交演示场景结算，不访问外部接口。 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const output = path.resolve(process.env.QA_OUTPUT || 'output/bomb-and-shards');
fs.mkdirSync(output, { recursive: true });
(async () => {
    const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    try {
        const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname)
            ? route.continue() : route.abort());
        await page.goto('http://localhost:7457/?localApi=1&autostart=1&fx=gravity-bomb', { waitUntil: 'load' });
        await page.waitForFunction(() => {
            function find(node) {
                const game = (node._components || []).find(component => component.beanCollectionHud);
                if (game) { window.__fxGame = game; return !game.locked; }
                return (node.children || []).some(find);
            }
            return window.cc && cc.director.getScene() && find(cc.director.getScene());
        }, null, { timeout: 30000 });
        await page.evaluate(() => {
            const game = window.__fxGame;
            const board = window.__require('ZyxGameModule').zyxGameModule;
            window.__fxBirths = []; window.__fxDraws = 0;
            const spawn = game.spawnPieceShards, draw = game.drawPieceShard, release = game.releaseShard;
            game.releaseShard = function (node) {
                const entry = window.__fxBirths.find(entry => entry.node === node);
                if (entry && node.parent) entry.samples.push({ t: node.shardFlightTime, x: node.x, y: node.y,
                    opacity: node.opacity, scale: node.scale, angle: node.angle });
                return release.call(this, node);
            };
            game.drawPieceShard = function (...args) { window.__fxDraws++; return draw.apply(this, args); };
            game.spawnPieceShards = function (...args) {
                const previous = new Set(this.pieceLayer.children);
                spawn.apply(this, args);
                for (const node of this.pieceLayer.children) {
                    if (!previous.has(node) && node.name.startsWith('pieceShard_')) {
                        window.__fxBirths.push({ node, x: node.x, y: node.y, samples: [] });
                    }
                }
                if (!window.__fxStarted) {
                    window.__fxStarted = performance.now();
                    function sample() {
                        for (const entry of window.__fxBirths) {
                            const node = entry.node;
                            if (node.isValid && node.parent) entry.samples.push({ t: node.shardFlightTime,
                                x: node.x, y: node.y, opacity: node.opacity, scale: node.scale, angle: node.angle });
                        }
                        if (performance.now() - window.__fxStarted < 1000) requestAnimationFrame(sample);
                        else window.__fxFinished = true;
                    }
                    requestAnimationFrame(sample);
                }
            };
            function hide(node) { if (node.name === 'gmFloatingBubble') node.active = false; for (const child of node.children || []) hide(child); }
            hide(cc.director.getScene());
            const move = board.getTutorialMove(0);
            game.movePiece(move.id, move.offset);
        });
        await page.waitForFunction(() => window.__fxStarted);
        for (const time of [100, 300, 550]) {
            await page.waitForFunction(time => performance.now() - window.__fxStarted >= time, time);
            await page.screenshot({ path: path.join(output, `shards-${time}ms.png`) });
        }
        await page.waitForFunction(() => window.__fxFinished);
        const motion = await page.evaluate(() => ({ draws: window.__fxDraws,
            pool: window.__fxGame.shardPool.length,
            active: window.__fxGame.pieceLayer.children.filter(node => node.name.startsWith('pieceShard_')).length,
            traces: window.__fxBirths.map(entry => ({ x: entry.x, y: entry.y, samples: entry.samples })) }));
        fs.writeFileSync(path.join(output, 'motion.json'), JSON.stringify(motion, null, 2));
        assert.ok(motion.traces.length > 0);
        assert.equal(motion.draws, motion.traces.length, '只在出生时绘制一次');
        assert.equal(motion.active, 0);
        assert.ok(motion.pool <= 96);
        for (const entry of motion.traces) {
            assert.ok(entry.samples.some(sample => sample.y > entry.y + 1), '碎片先抛起');
            assert.ok(entry.samples.some(sample => sample.t > 0.5 && sample.y < entry.y), '随后落到出生点下方');
            const middle = entry.samples.find(sample => sample.t >= 0.25 && sample.t <= 0.36);
            assert.ok(middle && middle.opacity === 255 && middle.scale > 0.8, '中段保留质量感，不能过早缩小消失');
        }
        await page.waitForFunction(() => window.__fxGame.displayedRoundMoods === 3);
        await page.waitForFunction(() => window.__fxGame.beanCollectionHud.percent.string === '3%');
        const collection = { first: await page.evaluate(() => window.__fxGame.beanCollectionHud.percent.string) };
        assert.equal(collection.first, '3%');
        await page.evaluate(() => {
            const hud = window.__fxGame.beanCollectionHud;
            hud.complete(99); hud.collectTo(101);
        });
        await page.waitForFunction(() => window.__fxGame.beanCollectionHud.percent.string === '100%');
        await page.screenshot({ path: path.join(output, 'collection-100pct.png') });
        await page.waitForFunction(() => window.__fxGame.beanCollectionHud.percent.string === '1%');
        collection.after101 = await page.evaluate(() => ({ percent: window.__fxGame.beanCollectionHud.percent.string, count: window.__fxGame.beanCollectionHud.count.string }));
        assert.equal(collection.after101.count, '本局 +1');
        await page.evaluate(() => window.__fxGame.beanCollectionHud.collectTo(201));
        await page.waitForFunction(() => window.__fxGame.beanCollectionHud.count.string === '本局 +2'
            && window.__fxGame.beanCollectionHud.percent.string === '1%');
        collection.after201 = await page.evaluate(() => ({ percent: window.__fxGame.beanCollectionHud.percent.string, count: window.__fxGame.beanCollectionHud.count.string }));
        await page.evaluate(() => window.__fxGame.beanCollectionHud.complete(3));
        const cases = [];
        for (const scenario of ['center-chain', 'edge']) {
            const plan = await page.evaluate(scenario => {
                const game = window.__fxGame;
                game.locked = true; game.tutorialStep = -1; game.clearTutorialGuide();
                game.pieceLayer.active = false;
                const layer = new cc.Node(`fxDemo_${scenario}`);
                layer.zIndex = 10; game.boardRoot.addChild(layer);
                game.pieceLayer = layer; game.pieceColors = {};
                game.playMoodCollect = () => {};
                const piece = (id, row, col, size, bomb = false) => ({ id, row, col, size, bomb,
                    color: id % 10 + 1, stampMood: 0, stampCell: 0, collectibleType: 0, collectibleCell: 0 });
                const pieces = scenario === 'center-chain' ? [
                    piece(1001, 5, 3, 2, true), piece(1002, 4, 4, 1, true),
                    piece(1003, 5, 1, 2), piece(1004, 5, 5, 2), piece(1005, 6, 3, 1),
                    piece(1006, 6, 4, 2), piece(1007, 4, 2, 2), piece(1008, 3, 4, 2),
                    piece(1009, 3, 1, 2), piece(1010, 6, 0, 1),
                ] : [piece(2001, 9, 0, 1, true), piece(2002, 9, 1, 2), piece(2003, 8, 0, 2),
                    piece(2004, 7, 0, 1), piece(2005, 8, 3, 1)];
                const engine = new (window.__require('BoardEngine').default)();
                engine.pieces = pieces;
                for (const piece of pieces) {
                    const node = game.createPieceView(piece);
                    cc.Tween.stopAllByTarget(node); node.scale = 1;
                }
                const result = engine.detonateBomb(pieces[0].id);
                game.animateBombBlasts(result);
                game.animateRowShatter(result.removedPieceIds, result.detonatedBombs);
                const highlighted = layer.children.filter(node => node.getChildByName('bombHitFlash'))
                    .map(node => Number(node.name.replace('piece_', '')));
                window.__fxCaseStarted = performance.now();
                return { result, highlighted, untouched: pieces.filter(piece => !result.removedPieceIds.includes(piece.id)).map(piece => piece.id),
                    rangeCount: layer.children.filter(node => node.name === 'bombExplosion').length,
                    fireCount: layer.children.filter(node => node.name === 'bombExplosion' && node.getChildByName('bombFireRing')).length,
                    cloudCount: layer.children.filter(node => node.name === 'bombExplosion' && node.getChildByName('bombMushroomCap')).length,
                    debugFrames: layer.children.filter(node => node.name === 'bombExplosion' && node.getChildByName('bombRange')).length };
            }, scenario);
            assert.deepEqual(plan.highlighted.slice().sort(), plan.result.removedPieceIds.slice().sort());
            assert.equal(plan.rangeCount, plan.result.detonatedBombs.length);
            assert.equal(plan.fireCount, plan.rangeCount);
            assert.equal(plan.cloudCount, plan.rangeCount);
            assert.equal(plan.debugFrames, 0);
            for (const time of [100, 360, 600, 1000]) {
                await page.waitForFunction(time => performance.now() - window.__fxCaseStarted >= time, time);
                await page.screenshot({ path: path.join(output, `${scenario}-${time}ms.png`) });
            }
            await page.waitForFunction(() => performance.now() - window.__fxCaseStarted >= 2100);
            const remaining = await page.evaluate(() => ({
                pieces: window.__fxGame.pieceLayer.children.filter(node => /^piece_\d+$/.test(node.name))
                    .map(node => Number(node.name.replace('piece_', ''))),
                effects: window.__fxGame.pieceLayer.children.filter(node => node.name === 'bombExplosion' || node.name.startsWith('pieceShard_')).length,
                pool: window.__fxGame.shardPool.length,
            }));
            assert.deepEqual(remaining.pieces.slice().sort(), plan.untouched.slice().sort());
            assert.equal(remaining.effects, 0);
            assert.ok(remaining.pool <= 96);
            cases.push({ scenario, ...plan, remaining });
        }
        const guideAndTiming=await page.evaluate(()=>{
            const g=window.__fxGame,b=window.__require('ZyxGameModule').zyxGameModule;
            g.firstGameBombGuide=true; g.bombGuideCount=0; g.bombGuideIds.clear();
            b.pieces=Array.from({length:6},(_,i)=>({id:3001+i,row:9-Math.floor(i/3),col:i%3*3,size:1,bomb:true,color:2,stampMood:0}));
            g.renderBoard();
            const count=()=>g.pieceLayer.children.filter(n=>n.getChildByName('bombTapGuide')).length;
            const first=count();g.renderBoard();const repeated=count();
            const badgeY=g.pieceLayer.children[0].getChildByName('bombBadge').y;
            g.firstGameBombGuide=false;g.renderBoard();const later=count();
            b.pieces=[{id:4001,row:9,col:3,size:1,bomb:true,color:2,stampMood:0},
                {id:4002,row:8,col:4,size:1,bomb:true,color:3,stampMood:0},
                {id:4003,row:9,col:0,size:1,bomb:false,color:4,stampMood:0}];
            b.actionAppends=0;g.renderBoard();g.locked=false;
            window.__ignite=[];window.__fxSounds=[];window.__callbacks=[];
            const effects=window.__require('BombEffect');const play=effects.playBombEffect;
            effects.playBombEffect=function(parent,center,cell,delay,callback){
                return play(parent,center,cell,delay,()=>{window.__callbacks.push(performance.now()-window.__cinemaStart);callback();});
            };
            const settings=window.__require('GameSettings').gameSettings;
            const audio=window.__require('AudioManager').audioManager;
            settings.vibrateLight=()=>window.__ignite.push(performance.now()-window.__cinemaStart);
            audio.playSound=name=>window.__fxSounds.push(name);
            const resolve=g.resolveStableBoard;
            g.resolveStableBoard=function(...args){if(window.__gravityStarted==null) {window.__gravityStarted=performance.now()-window.__cinemaStart;window.__shardsAtGravity=this.pieceLayer.children.filter(n=>n.name.startsWith('pieceShard_')).length;}return resolve.apply(this,args);};
            window.__cinemaStart=performance.now();g.useBomb(4001);
            window.__cinemaActions=JSON.stringify(b.roundActions);
            return {first,repeated,later,badgeY,count:g.bombGuideCount};
        });
        assert.equal(guideAndTiming.first,5);assert.equal(guideAndTiming.repeated,5);
        assert.equal(guideAndTiming.later,0);assert.equal(guideAndTiming.count,5);assert.equal(guideAndTiming.badgeY,-1);
        for(const ms of [50,350,700,1050]) {
            await page.waitForFunction(ms=>performance.now()-window.__cinemaStart>=ms,ms);
            const input=await page.evaluate(()=>{
                const g=window.__fxGame,b=window.__require('ZyxGameModule').zyxGameModule;
                const before=JSON.stringify(b.roundActions);
                g.movePiece(4003,1);g.useBomb(4002);
                return {locked:g.locked, unchanged:JSON.stringify(b.roundActions)===before,
                    shards:g.pieceLayer.children.filter(n=>n.name.startsWith('pieceShard_')).length};
            });
            assert.equal(input.locked,true);assert.equal(input.unchanged,true);
        }
        await page.waitForFunction(()=>!window.__fxGame.locked,null,{timeout:20000});
        const cinema=await page.evaluate(()=>({gravityAt:window.__gravityStarted, haptics:window.__ignite,sounds:window.__fxSounds,callbacks:window.__callbacks,shardsAtGravity:window.__shardsAtGravity,
            shards:window.__fxGame.pieceLayer.children.filter(n=>/^pieceShard_400[12]_/.test(n.name)).length}));
        console.log(JSON.stringify({cinema,errors}));
        fs.writeFileSync(path.join(output,'normal-speed-input.json'),JSON.stringify({guideAndTiming,cinema,errors},null,2));
        assert.ok(cinema.gravityAt>=420 && cinema.gravityAt<800);assert.equal(cinema.haptics.length,2);assert.equal(cinema.sounds.filter(n=>n==='bomb').length,2);
        assert.ok(cinema.haptics[0]>=120 && cinema.haptics[0]<250 && cinema.haptics[1]-cinema.haptics[0]>=100 && cinema.haptics[1]-cinema.haptics[0]<200);assert.equal(cinema.shards,0);assert.ok(cinema.shardsAtGravity>0,'尾部碎片与掉落并行，不能空等动画');
        fs.writeFileSync(path.join(output,'normal-speed-input.json'),JSON.stringify({guideAndTiming,cinema},null,2));
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ motion, collection, cases, errors }, null, 2));
        console.log(JSON.stringify({ shards: motion.traces.length, draws: motion.draws, pool: motion.pool, collection,
            cases: cases.map(item => ({ scenario: item.scenario, bombs: item.rangeCount, hits: item.highlighted.length })), errors }));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
