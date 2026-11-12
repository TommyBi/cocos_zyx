/** 独立临时数据库 + 真实本地 API + 本地构建验收；不改用户存档、不访问外网。 */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
process.env.ENABLE_GM_ROUTES = '1';
delete process.env.ALLOW_LEGACY_ROUND_STARTS;
const { start } = require('../server/src/index');
const out = path.resolve(process.env.QA_OUTPUT || 'output/shop-verification');
fs.mkdirSync(out, { recursive: true });
(async () => {
    const dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-shop-browser-')), 'shop.sqlite');
    const apiServer = (await start(dbPath)).listen(0, '127.0.0.1');
    await new Promise(resolve => apiServer.once('listening', resolve));
    const apiBase = `http://127.0.0.1:${apiServer.address().port}`;
    const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
        args: ['--autoplay-policy=no-user-gesture-required', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    try {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
        const page = await context.newPage();
        const errors = [], exchanges = [], starts = [];
        let seeded = false, loseExchangeResponse = false, failNextUse = false;
        let holdSettlement = null;
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', async route => {
            const url = new URL(route.request().url());
            if (url.pathname.startsWith('/v1/cocos-zyx/')) {
                if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
                const forwarded = apiBase + url.pathname + url.search;
                let response;
                if (url.pathname.endsWith('/games/start')) {
                    // 固定当前V5长局夹具，保证能覆盖两颗奖励；随机源仅作用于独立测试服务。
                    const original = crypto.randomBytes;
                    const seed = Buffer.alloc(4); seed.writeUInt32BE(starts.length === 0 ? 2175734977 : 3);
                    try {
                        crypto.randomBytes = (size, ...args) => size === 4 ? Buffer.from(seed) : original(size, ...args);
                        response = await route.fetch({ url: forwarded });
                    } finally { crypto.randomBytes = original; }
                } else response = await route.fetch({ url: forwarded });
                const json = await response.json();
                if (url.pathname.endsWith('/games/settlements') && holdSettlement) await holdSettlement;
                if (url.pathname.endsWith('/players/bootstrap')) {
                    if (!seeded) {
                        seeded = true;
                        const seed = await fetch(`${apiBase}/v1/cocos-zyx/debug/profile`, { method: 'POST', headers: {
                            'Content-Type': 'application/json', Authorization: `Bearer ${json.data.token}` }, body: JSON.stringify({ moodBeanBalance: 60, totalMoodBeans: 60 }) });
                        json.data.profile = (await seed.json()).data.profile;
                    }
                    json.data.profile.gameCount = 3;
                }
                if (url.pathname.endsWith('/games/start')) starts.push(json);
                if (url.pathname.endsWith('/shop/exchanges')) {
                    exchanges.push({ request: route.request().postDataJSON(), result: json });
                    if (loseExchangeResponse) { loseExchangeResponse = false; return route.abort('failed'); }
                }
                if (url.pathname.endsWith('/games/tools/use') && failNextUse) {
                    failNextUse = false; return route.abort('failed');
                }
                return route.fulfill({ response, json, headers: { ...response.headers(), 'access-control-allow-origin': '*' } });
            }
            if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
            return route.continue();
        });
        await page.goto('http://localhost:7457/?localApi=1', { waitUntil: 'load' });
        await page.waitForFunction(() => {
            function find(n) {
                const scene = (n._components || []).find(c => c.screen && c.screen.name === 'home');
                if (scene) { window.shopScene = scene; return true; }
                return (n.children || []).some(find);
            }
            return window.cc && cc.director.getScene() && find(cc.director.getScene());
        }, null, { timeout: 30000 });
        await page.evaluate(() => {
            window.shopBoard = window.__require('ZyxGameModule').zyxGameModule;
            window.findShopNode = (name, root = cc.director.getScene()) => {
                if (root.name === name) return root;
                for (const child of root.children || []) { const found = window.findShopNode(name, child); if (found) return found; }
                return null;
            };
            window.shopPoint = name => {
                const node = window.findShopNode(name);
                const world = node.convertToWorldSpaceAR(cc.v2());
                const bounds = document.querySelector('canvas').getBoundingClientRect();
                return { x: bounds.left + world.x / cc.winSize.width * bounds.width,
                    y: bounds.top + (1 - world.y / cc.winSize.height) * bounds.height };
            };
            const gm = window.findShopNode('gmFloatingBubble'); if (gm) gm.active = false;
        });
        const click = async name => { const point = await page.evaluate(name => window.shopPoint(name), name); await page.mouse.click(point.x, point.y); };
        await page.waitForTimeout(350);
        await page.screenshot({ path: path.join(out, 'home.png') });
        await page.evaluate(()=>cc.sys.localStorage.setItem('zyx_pending_tool_exchange',JSON.stringify({actionId:'old_account_purchase',item:'hammer',playerId:'another_account'})));
        await click('shopEntry'); await page.waitForTimeout(300);
        assert.equal(await page.evaluate(()=>cc.sys.localStorage.getItem('zyx_pending_tool_exchange')),null,'跨账号旧交易不能在当前账号继续扣款');
        await page.screenshot({ path: path.join(out, 'shop.png') });
        const productArt = await page.evaluate(() => {
            if (window.findShopNode('shopWallet')) throw new Error('Old wallet row remains');
            return ['hammer', 'magicWand'].map(item => {
                const card = window.findShopNode(`shopCard_${item}`);
                const icon = card.getChildByName('toolPedestal').getChildByName('shopToolArt');
                const rect = icon.getComponent(cc.Sprite).spriteFrame.getRect();
                return { item, displayed: icon.width / icon.height, source: rect.width / rect.height };
            });
        });
        productArt.forEach(art => assert.ok(Math.abs(art.displayed - art.source) < 1e-6));
        const priceStates = [];
        for (const amount of [2, 19, 20, 60]) {
            const state = await page.evaluate(async amount => {
                const result = await window.__require('CloudService').cloudService.postAuthenticated('/debug/profile', { moodBeanBalance: amount, totalMoodBeans: 60 });
                window.shopScene.applyCloudProfile(result.profile);
                const button = window.findShopNode('shopExchange_hammer');
                return { amount, markup: button.getComponentInChildren(cc.RichText).string, enabled: button.getComponent(cc.Button).interactable };
            }, amount);
            assert.equal(state.enabled, true);
            assert.ok(state.markup.includes(`<color=${amount < 20 ? '#BD4035' : '#287638'}>${amount}</color>`));
            assert.ok(state.markup.includes('<color=#287638>20</color>'));
            priceStates.push(state);
            if (amount === 2) {
                await page.screenshot({ path: path.join(out, 'shop-low-balance.png') });
                const before = exchanges.length;
                const point = await page.evaluate(() => window.shopPoint('shopExchange_hammer'));
                await page.mouse.move(point.x,point.y); await page.mouse.down(); await page.waitForTimeout(100);
                await page.screenshot({path:path.join(out,'press-feedback.png')});
                assert.ok(await page.evaluate(()=>window.findShopNode('shopExchange_hammer').scale < .98),JSON.stringify({point,debug:await page.evaluate(()=>({scale:window.findShopNode('shopExchange_hammer').scale,win:cc.winSize,canvas:document.querySelector('canvas').getBoundingClientRect().toJSON()}))}));
                await page.mouse.up();
                await page.waitForFunction(()=>window.findShopNode('button_开始挑战'));
                await page.waitForTimeout(250);
                assert.equal(exchanges.length,before,'不足时不发兑换请求');
                assert.ok(await page.evaluate(()=>window.findShopNode('shopChallengeStamina').getComponent(cc.Label).string.includes('体力')));
                await page.screenshot({path:path.join(out,'insufficient-challenge.png')});
                await click('button_返回商城');
                await page.waitForTimeout(250);
            }
        }
        fs.writeFileSync(path.join(out, 'shop-details.json'), JSON.stringify({ productArt, priceStates }, null, 2));
        const alignment=await page.evaluate(()=>['hammer','magicWand','stamina'].map(item=>{
            const button=window.findShopNode(`shopExchange_${item}`);
            const content=button.getChildByName('shopExchangeContent');
            const icon=content.getChildByName('shopCurrencyIcon');
            return { item, x:content.x, iconWidth:icon.width, contentWidth:content.width,
                bounds:content.getBoundingBox(), price:button.getComponentInChildren(cc.RichText).string };
        }));
        alignment.forEach(a=>{assert.equal(a.x,0);assert.ok(Math.abs(a.iconWidth-27.2)<.01);});
        assert.ok(alignment[2].price.includes('>5</color>'));
        await click('shopExchange_stamina');
        await page.waitForFunction(()=>window.shopBoard.moodBeanBalance===55);
        assert.equal(await page.evaluate(()=>window.shopScene.stamina.current),11);
        // 恢复测试余额，体力兑换结果保留。
        await page.evaluate(async()=>{const r=await window.__require('CloudService').cloudService.postAuthenticated('/debug/profile',{moodBeanBalance:60,totalMoodBeans:60});window.shopScene.applyCloudProfile(r.profile);});
        // 快速重复点击同一张卡，只有一笔请求。
        const before = exchanges.length;
        const point = await page.evaluate(() => window.shopPoint('shopExchange_hammer'));
        await page.mouse.click(point.x, point.y, { clickCount: 2, delay: 5 });
        await page.waitForFunction(() => window.shopBoard.moodBeanBalance === 40);
        assert.equal(exchanges.length, before + 1);
        assert.equal(await page.evaluate(() => window.shopBoard.hammerCount), 1);
        // 模拟服务端已扣款、响应丢失；恢复后重试必须使用同一个 ID。
        loseExchangeResponse = true;
        await click('shopExchange_magicWand');
        await page.waitForFunction(() => window.findShopNode('shopExchange_magicWand').getComponentInChildren(cc.RichText).string.includes('继续确认'));
        const pending = exchanges[exchanges.length - 1].request.actionId;
        await page.screenshot({ path: path.join(out, 'shop-retry.png') });
        await click('shopExchange_magicWand');
        await page.waitForFunction(() => window.shopBoard.moodBeanBalance === 20 && window.shopBoard.colorPurifierCount === 1);
        assert.equal(exchanges[exchanges.length - 1].request.actionId, pending);
        assert.equal(exchanges[exchanges.length - 1].result.data.duplicate, true);
        await click('shopExchange_hammer');
        await page.waitForFunction(() => window.shopBoard.moodBeanBalance === 0);
        await page.screenshot({ path: path.join(out, 'shop-insufficient.png') });
        const startsBefore=starts.length;
        await click('shopExchange_hammer');
        await page.waitForFunction(()=>window.findShopNode('button_开始挑战'));
        await page.waitForTimeout(250);
        await click('button_开始挑战');
        await page.waitForFunction(() => window.shopScene.screen && window.shopScene.screen.name === 'game');
        await page.evaluate(() => {
            window.shopGame = window.shopScene.screen.getComponent(window.__require('ZyxGame').default);
        });
        assert.equal(starts.length,startsBefore+1);
        assert.equal(await page.evaluate(()=>window.shopScene.stamina.current),10);
        // 真实完成教程，进入正常局，再使用两种已兑换道具。
        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => {
                const move = window.shopBoard.getTutorialMove(window.shopGame.tutorialStep);
                window.shopGame.movePiece(move.id, move.offset);
            });
            await page.waitForFunction(step => step < 2 ? window.shopGame.tutorialStep > step && !window.shopGame.locked : window.shopGame.tutorialStep < 0 && !window.shopGame.locked, i, { timeout: 20000 });
        }
        await page.evaluate(() => window.shopGame.setRankExpanded(false, 0.12));
        await page.waitForFunction(() => window.shopGame.rankChase.bookmarkReveal.progress === 1);
        assert.equal(await page.evaluate(() => {
            const b = window.shopGame.rankChase.bookmark;
            return b.convertToWorldSpaceAR(cc.v2(-b.width / 2, 0)).x >= 0
                && b.convertToWorldSpaceAR(cc.v2(b.width / 2, 0)).x <= cc.winSize.width;
        }), true, '排行按钮必须完整显示');
        await page.screenshot({ path: path.join(out, 'rank-button.png') });
        await click('rankChaseBookmark');
        await page.waitForFunction(() => window.shopGame.rankExpansion.progress === 1);
        const wiggle = await page.evaluate(() => new Promise(resolve => {
            const badge = window.shopGame.pieceLayer.children.map(n => n.getChildByName('bombBadge')).find(Boolean);
            if (!badge) return resolve(null);
            const started = performance.now(), samples = [];
            const sample = () => {
                samples.push({ time: performance.now() - started, angle: badge.angle, x: badge.scaleX, y: badge.scaleY });
                if (performance.now() - started < 1700) requestAnimationFrame(sample);
                else resolve(samples);
            }; sample();
        }));
        assert.ok(wiggle && Math.min(...wiggle.map(s => s.angle)) < -5 && Math.max(...wiggle.map(s => s.angle)) > 5);
        assert.ok(wiggle.every(s => s.x === 1 && s.y === 1));
        fs.writeFileSync(path.join(out, 'bomb-wiggle.json'), JSON.stringify(wiggle, null, 2));
        assert.equal(await page.evaluate(() => window.shopScene.screen.getComponentsInChildren(cc.Label).some(l => l.string === '收集进度')), true);
        failNextUse = true;
        await page.evaluate(() => window.shopGame.useReliefTool(window.shopBoard.pieces[0].id));
        await page.waitForFunction(() => window.findShopNode('button_重新确认'));
        await page.waitForFunction(() => Math.abs(window.findShopNode('button_重新确认').parent.scale - 1) < 0.001);
        await click('button_重新确认');
        try { await page.waitForFunction(() => !window.shopGame.locked && window.shopBoard.hammerCount === 1, null, { timeout: 20000 }); }
        catch (error) {
            await page.screenshot({ path: path.join(out, 'tool-failure.png') });
            console.error(await page.evaluate(() => ({ locked: window.shopGame.locked, hammer: window.shopBoard.hammerCount, actions: window.shopBoard.roundActions, labels: cc.director.getScene().getComponentsInChildren(cc.Label).map(l => l.string) })));
            throw error;
        }
        await page.evaluate(() => window.shopGame.useColorPurifierTool(window.shopBoard.pieces[0].id));
        await page.waitForFunction(() => !window.shopGame.locked && window.shopBoard.colorPurifierCount === 0, null, { timeout: 20000 });
        await page.evaluate(() => window.shopGame.finishGame('QA'));
        await page.waitForTimeout(350);
        assert.equal(await page.evaluate(() => !!window.findShopNode('settlementExperienceReward')), false);
        await page.screenshot({ path: path.join(out, 'settlement.png') });
        await page.waitForFunction(() => Object.keys(window.shopScene.settlementReceipts).length > 0, null, { timeout: 20000 });
        assert.deepEqual(errors, []);
        const result = await page.evaluate(() => ({ beans: window.shopBoard.moodBeanBalance, hammer: window.shopBoard.hammerCount,
            magicWand: window.shopBoard.colorPurifierCount, actions: window.shopBoard.roundActions,
            receipts: window.shopScene.settlementReceipts }));
        fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ ...result, exchangeCount: exchanges.length, errors }, null, 2));
        // 真正点击结算返回，等待旧游戏组件完成销毁，并验证首页仍可交互。
        await click('button_返回');
        await page.waitForFunction(() => window.shopScene.screen.name === 'home' && window.findShopNode('shopEntry'));
        await page.waitForTimeout(350);
        await click('shopEntry');
        await page.waitForFunction(() => window.findShopNode('shopExchange_hammer'));
        await page.evaluate(() => window.__require('UIManager').uimanager.closeModal());
        await page.evaluate(() => window.shopScene.startGame());
        await page.waitForFunction(() => window.shopScene.screen.name === 'game');
        // 使用当前服务端种子生成真实长局记录，覆盖非零奖励和延迟结算回执。
        const expected = await page.evaluate(() => {
            const b = window.shopBoard;
            const g = window.shopScene.screen.getComponent(window.__require('ZyxGame').default);
            window.shopGame = g;
            g.cancelEliminationHint();
            if (b.isTutorialRound()) {
                for (let i = 0; i < 3; i++) { const move = b.getTutorialMove(i); b.movePiece(move.id, move.offset); b.resolveBoard(); b.finishPlayerAction(); }
                b.actionAppends = 0;
                for (let i = 0; i < 3; i++) b.appendNextRow();
                b.resolveBoard(); b.finishPlayerAction();
                g.tutorialStep = -1; g.clearTutorialGuide();
            }
            for (let i = 0; i < 600 && b.roundCollectedMoodBeans < 200; i++) {
                const hint = b.findEliminationHint();
                const bomb = b.pieces.find(p => p.bomb);
                if (hint) b.movePiece(hint.id, hint.offset);
                else if (bomb) b.detonateBomb(bomb.id);
                else {
                    const movable = b.pieces.find(p => { const r = b.getMoveRange(p.id); return r.min < 0 || r.max > 0; });
                    if (!movable) break;
                    const range = b.getMoveRange(movable.id);
                    b.movePiece(movable.id, range.max > 0 ? 1 : -1);
                }
                b.resolveBoard();
                if (!b.appendTurnRows()) break;
                b.resolveBoard();
                while (b.getOccupiedRowCount() < b.getRefillRowTarget() && b.actionAppends < 5) {
                    if (!b.appendNextRow()) break;
                    b.resolveBoard();
                }
                b.finishPlayerAction();
            }
            g.renderAll();
            return { raw: b.roundCollectedMoodBeans, beans: Math.floor(b.roundCollectedMoodBeans / 100) };
        });
        assert.ok(expected.beans >= 2, JSON.stringify(expected));
        await page.waitForTimeout(5200); // 服务端最短对局时长。
        let releaseSettlement;
        holdSettlement = new Promise(resolve => { releaseSettlement = resolve; });
        await page.evaluate(() => {window.__lastFinishedRoundId=window.shopScene.activeRoundId;window.shopGame.finishGame('长局返回验收');});
        await page.waitForTimeout(250);
        await click('button_返回');
        await page.waitForFunction(() => window.shopScene.screen.name === 'home');
        await page.waitForTimeout(300);
        releaseSettlement();
        holdSettlement = null;
        await page.waitForFunction(beans => window.shopBoard.moodBeanBalance === beans
            && !window.shopScene.pendingSettlementPresentation && !window.findShopNode('settlementRewardReturn'), expected.beans,
            { timeout: 15000 });
        await page.screenshot({ path: path.join(out, 'returned-home-reward.png') });
        await click('shopEntry');
        await page.waitForFunction(() => window.findShopNode('shopExchange_hammer'));
        await page.waitForTimeout(200);
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(out, 'return-result.json'), JSON.stringify({ expected, errors, zeroRewardReturn: true, delayedRewardReturn: true }, null, 2));
        const storageFailure=await page.evaluate(async()=>{
            const store=cc.sys.localStorage,write=store.setItem;
            store.removeItem('zyx_pending_stamina_share_id');
            store.setItem=function(key,value){if(key==='zyx_pending_stamina_share_id')throw new Error('quota');return write.call(this,key,value);};
            try {await window.shopScene.claimSharedStamina();return window.shopScene.shareClaimInFlight;}
            finally {store.setItem=write;}
        });
        assert.equal(storageFailure,false,'存储失败不能把体力领取永久锁住');
        await page.evaluate(async()=>{
            window.__require('UIManager').uimanager.closeModal();
            cc.sys.localStorage.setItem('zyx_pending_start_round_id',window.__lastFinishedRoundId);
            window.__staleStartResult=await window.shopScene.startGame();
        });
        assert.equal(await page.evaluate(()=>window.__staleStartResult),false);
        assert.equal(await page.evaluate(()=>cc.sys.localStorage.getItem('zyx_pending_start_round_id')),null,'已结算的开局标记不能堵住后续开局');
        await page.evaluate(async()=>{
            const cloud=window.__require('CloudService').cloudService;
            let state=window.shopScene.stamina;
            for(let i=0;i<state.current;i++) await cloud.startRound(`round_qa_empty_${Date.now()}_${i}`);
            await window.shopScene.refreshCloudProfile();
            window.__require('ShopPanel').showShopPanel(()=>window.shopScene.refreshCloudProfile(),p=>window.shopScene.applyCloudProfile(p),{
                staminaText:()=>window.shopScene.getChallengeStaminaText(),start:()=>window.shopScene.startGame(),
                staminaAmount:()=>`当前体力 ${window.shopScene.getStaminaPreview().current}/10`
            });
        });
        await page.waitForTimeout(250);
        await click('shopExchange_hammer');
        await page.waitForFunction(()=>window.findShopNode('button_开始挑战'));
        await page.waitForTimeout(250);
        const firstTick=await page.evaluate(()=>window.findShopNode('shopChallengeStamina').getComponent(cc.Label).string);
        await page.waitForTimeout(1200);
        const secondTick=await page.evaluate(()=>window.findShopNode('shopChallengeStamina').getComponent(cc.Label).string);
        assert.notEqual(firstTick,secondTick,'倒计时持续更新');
        await click('button_开始挑战'); await page.waitForTimeout(300);
        assert.equal(await page.evaluate(()=>window.shopScene.screen.name),'home');
        assert.equal(await page.evaluate(()=>window.shopScene.stamina.current),0);
        await page.screenshot({path:path.join(out,'stamina-empty.png')});
        await page.evaluate(()=>window.__require('UIManager').uimanager.closeModal());
        for (const viewport of (process.env.QA_FAST ? [] : [{ width: 320, height: 568 }, { width: 430, height: 932 }, { width: 768, height: 1024 }])) {
            await page.setViewportSize(viewport); await page.waitForTimeout(650);
            await page.evaluate(() => window.__require('ShopPanel').showShopPanel(async () => {}, profile => window.shopScene.applyCloudProfile(profile)));
            await page.waitForTimeout(250);
            await page.screenshot({ path: path.join(out, `shop-${viewport.width}x${viewport.height}.png`) });
        }
        console.log('PASS: shop, tools, replay, zero/two-bean settlement returns, delayed receipt, home remains interactive');
    } finally { await browser.close(); await new Promise(resolve => apiServer.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
