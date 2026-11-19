/** 真实本地API与隔离浏览器账号验收，不访问Staging/Production，不发起广告或分享。 */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { firstFailure, secondFailure, untilFailure } = require('./fixtures/revival-card-helper.cjs');
const { replayBoardEngine } = require('../server/src/replayBoardEngine');
const apiBase = process.env.CARD_API_URL || 'http://127.0.0.1:8082/v1/cocos-zyx';
const preview = process.env.CARD_PREVIEW_URL || 'http://127.0.0.1:7460/?localApi=1&home=1';
if (![apiBase, preview].every(url => /^http:\/\/(127\.0\.0\.1|localhost):/.test(url))) throw Error('仅允许本地验收');
const out = path.resolve('output/revive-card-20261116'); fs.mkdirSync(out, { recursive: true });
async function api(route, token, body) {
    const response = await fetch(apiBase + route, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const result = await response.json(); assert.equal(response.status, 200, JSON.stringify(result)); return result.data;
}
async function button(page, text) {
    await page.waitForTimeout(230);
    const p = await page.evaluate(text => {
        const nodes = cc.director.getScene().getComponentsInChildren(cc.Button);
        const button = nodes.find(b => b.node.activeInHierarchy && b.node.getComponentsInChildren(cc.Label).some(l => l.string === text));
        if (!button) throw Error('找不到按钮 ' + text);
        const p = button.node.convertToWorldSpaceAR(cc.v2()); return { x: p.x / cc.winSize.width * innerWidth, y: (1 - p.y / cc.winSize.height) * innerHeight };
    }, text); await page.mouse.click(p.x, p.y);
}
async function restoreFailure(page, started, board) {
    await page.evaluate(({ started, actions }) => {
        const game = window.__cardGame, model = __require('ZyxGameModule').zyxGameModule;
        __require('UIManager').uimanager.closeModal(); game.clearTutorialGuide(); game.tutorialStep = -1;
        const elapsedMs = Math.max(0, Date.now() - started.startedAt - 100);
        model.restoreRound({ ...started, actions, elapsedMs });
        game.reviveUsed = actions.some(a => a.type === 'revive'); game.reviveCardUsed = actions.some(a => a.type === 'reviveCard');
        game.settlementReported = false; game.renderAll(); game.handleChallengeFailed('复活卡验收');
    }, { started, actions: board.roundActions });
}
(async () => {
    const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const results = [];
    try {
        for (const [width, height] of [[390, 844], [320, 568], [768, 1024]]) {
            const deviceId = `card_browser_${width}_${Date.now()}`;
            const user = await api('/players/bootstrap', null, { deviceId });
            await api('/debug/profile', user.token, { moodBeanBalance: 100, totalMoodBeans: 100 });
            const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
            await context.addInitScript(({ deviceId, token }) => {
                localStorage.setItem('zyx_data_generation', 'mood_bean_v5_20261112'); localStorage.setItem('zyx_cloud_device_id', deviceId); localStorage.setItem('zyx_cloud_token', token);
            }, { deviceId, token: user.token });
            const page = await context.newPage(), errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(preview);
            await page.waitForFunction(() => {
                function find(n) { const c = (n._components || []).find(c => c.homeFriendRanking); if (c) { window.__cardScene = c; return true; } return (n.children || []).some(find); }
                return window.cc && cc.director.getScene() && find(cc.director.getScene());
            });
            await page.evaluate(() => {
                function hide(n) { if (n.name === 'gmFloatingBubble') n.active = false; n.children.forEach(hide); } hide(cc.director.getScene());
                __require('ShopPanel').showShopPanel(() => __cardScene.refreshCloudProfile(), p => __cardScene.applyCloudProfile(p));
            });
            await page.waitForTimeout(300);
            const scrollPoint = await page.evaluate(() => {
                const view = __require('UIManager').uimanager.modal.getComponentsInChildren(cc.ScrollView)[0].node;
                const p = view.convertToWorldSpaceAR(cc.v2()); return { x: p.x / cc.winSize.width * innerWidth, y: (1 - p.y / cc.winSize.height) * innerHeight };
            });
            await page.mouse.move(scrollPoint.x, scrollPoint.y + height * 0.12);
            await page.mouse.down(); await page.mouse.move(scrollPoint.x, scrollPoint.y - height * 0.18, { steps: 15 }); await page.mouse.up();
            await page.waitForTimeout(700);
            const shop = await page.evaluate(() => {
                const ui = __require('UIManager').uimanager;
                const scroll = ui.modal.getComponentsInChildren(cc.ScrollView)[0]; scroll.stopAutoScroll(); scroll.scrollToBottom(0);
                const card = scroll.content.getChildByName('shopCard_reviveCard');
                const price = card.getComponentsInChildren(cc.Label).find(l => l.node.name === 'shopPrice');
                const art = card.getChildByName('toolPedestal').getChildByName('shopToolArt').getComponent(cc.Sprite);
                const p = card.convertToWorldSpaceAR(cc.v2());
                return { price: price.string, hasIcon: !!art.spriteFrame, spriteUuid: art.spriteFrame._uuid, y: p.y,
                    scrollOffset: scroll.getScrollOffset().y, labels: card.getComponentsInChildren(cc.Label).map(l => l.string),
                    panel: (() => { const n = ui.modal.getChildByName('panel'); const lo = n.convertToWorldSpaceAR(cc.v2(-n.width / 2, -n.height / 2)); const hi = n.convertToWorldSpaceAR(cc.v2(n.width / 2, n.height / 2)); return { y: lo.y, height: hi.y - lo.y }; })(), height: cc.winSize.height };
            });
            assert.equal(shop.price, '25'); assert.equal(shop.hasIcon, true); assert.ok(shop.scrollOffset > 0); assert.ok(shop.labels.includes('已拥有 0 张'));
            assert.ok(shop.panel.y >= 0 && shop.panel.y + shop.panel.height <= shop.height + 1);
            await page.screenshot({ path: path.join(out, `shop-card-${width}.png`) });
            // 实际兑换按钮点击，随后检查服务器到账；“兑换”同文按钮在列表外，因此定位具体节点。
            const buy = await page.evaluate(() => {
                const n = __require('UIManager').uimanager.modal.getComponentsInChildren(cc.ScrollView)[0].content.getChildByName('shopCard_reviveCard').getChildByName('shopExchange_reviveCard');
                const p = n.convertToWorldSpaceAR(cc.v2()); return { x: p.x / cc.winSize.width * innerWidth, y: (1 - p.y / cc.winSize.height) * innerHeight };
            });
            await page.mouse.click(buy.x, buy.y);
            await page.waitForFunction(() => __require('UIManager').uimanager.modal.name === 'shopExchangeSuccess');
            await page.waitForTimeout(300); await page.screenshot({ path: path.join(out, `purchase-success-${width}.png`) });
            const bought = await api('/players/bootstrap', null, { deviceId }); assert.equal(bought.profile.inventory.reviveCard, 1); assert.equal(bought.profile.moodBeanBalance, 75);
            await api('/shop/exchanges', user.token, { actionId: `browser_extra_card_${width}`, item: 'reviveCard' });
            await page.evaluate(async () => { __require('UIManager').uimanager.closeModal(); await __cardScene.startGame(); });
            await page.waitForFunction(() => {
                const g = __cardScene.screen.getComponents(cc.Component).find(c => c.beanCollectionHud); if (g) { window.__cardGame = g; return true; } return false;
            });
            const started = (await api('/games/active', user.token)).round;
            await page.waitForTimeout(5200);
            const first = firstFailure(started); await restoreFailure(page, started, first);
            await page.waitForTimeout(300);
            const firstPrompt = await page.evaluate(() => __require('UIManager').uimanager.modal.getComponentsInChildren(cc.Label).map(l => l.string));
            assert.ok(firstPrompt.some(text => text.includes('复活') && !text.includes('复活卡'))); assert.ok(!firstPrompt.includes('使用复活卡'));
            await page.screenshot({ path: path.join(out, `first-revive-${width}.png`) });
            // 隔离验收仅模拟广告/分享完成回调，执行真实 requestRevive/清理/补排代码，不发外部分享。
            await page.evaluate(() => { __require('UIManager').uimanager.closeModal(); __cardGame.showRewardOffer = done => done(true); __cardGame.requestRevive('首次复活验收'); });
            await page.waitForFunction(() => __cardGame.reviveUsed && !__cardGame.locked);
            const adActions = await page.evaluate(() => __require('ZyxGameModule').zyxGameModule.roundActions);
            const adReplay = replayBoardEngine(started.seed, started.isTutorial, adActions, 11, started.heartRescueEligible, true, true);
            assert.equal(adReplay.valid, true); assert.equal(adReplay.ready, true);
            const second = untilFailure(adReplay.board); await restoreFailure(page, started, second); await page.waitForTimeout(300);
            assert.equal(await page.evaluate(() => __require('UIManager').uimanager.modal.getComponentsInChildren(cc.Label).some(l => l.string === '使用复活卡')), true);
            await page.screenshot({ path: path.join(out, `second-revive-${width}.png`) });
            const requests = []; let abort = width !== 768;
            await page.route('**/games/revive-card', async route => {
                requests.push(route.request().postDataJSON());
                const response = await route.fetch();
                if (abort) { abort = false; await route.abort('failed'); } else await route.fulfill({ response });
            });
            await button(page, '使用复活卡');
            if (width !== 768) {
                await page.waitForFunction(() => __require('UIManager').uimanager.modal && __require('UIManager').uimanager.modal.getComponentsInChildren(cc.Label).some(l => l.string === '复活待确认'));
                assert.equal((await api('/players/bootstrap', null, { deviceId })).profile.inventory.reviveCard, 1);
                if (width === 320) {
                    // 丢响应后直接杀页重载，从云端恢复已扣卡的完整棋盘。
                    await page.reload();
                    await page.waitForFunction(() => window.cc && cc.director.getScene() && cc.director.getScene().getComponentsInChildren(cc.Label).some(l => l.string === '继续上局'));
                    await button(page, '继续上局');
                    await page.waitForFunction(() => {
                        function find(n) { const c = (n._components || []).find(c => c.beanCollectionHud); if (c) { window.__cardGame = c; return true; } return (n.children || []).some(find); }
                        return find(cc.director.getScene());
                    });
                } else {
                    await page.screenshot({ path: path.join(out, `pending-revive-${width}.png`) });
                    await button(page, '重新确认');
                    await page.waitForFunction(() => __cardGame.reviveCardUsed && !__cardGame.locked);
                    assert.equal(requests.length, 2); assert.deepEqual(requests[0], requests[1]);
                }
            } else await page.waitForFunction(() => __cardGame.reviveCardUsed && !__cardGame.locked);
            await page.waitForTimeout(300);
            const state = await page.evaluate(() => {
                const b = __require('ZyxGameModule').zyxGameModule; return { actions: b.roundActions, pieces: b.pieces, nextPieces: b.nextPieces, score: b.score, random: b.randomState,
                    cardUsed: __cardGame.reviveCardUsed, inventory: b.reviveCardCount, errors: [] };
            });
            const replay = replayBoardEngine(started.seed, started.isTutorial, state.actions, 11, started.heartRescueEligible, true, true);
            assert.equal(replay.valid, true); assert.equal(state.cardUsed, true); assert.equal(state.inventory, 1);
            assert.deepEqual(state.pieces, replay.board.pieces); assert.deepEqual(state.nextPieces, replay.board.nextPieces); assert.equal(state.random, replay.board.randomState);
            await page.screenshot({ path: path.join(out, `revived-game-${width}.png`) });
            const third = untilFailure(replay.board); await restoreFailure(page, started, third);
            await page.waitForFunction(() => __require('UIManager').uimanager.modal.getComponentsInChildren(cc.Label).some(l => l.string === '本局结算'));
            await page.waitForFunction(() => __require('ZyxGameModule').zyxGameModule.getPendingRoundSettlements().length === 0);
            assert.equal((await api('/games/active', user.token)).round, null);
            assert.equal((await api('/players/bootstrap', null, { deviceId })).profile.inventory.reviveCard, 1);
            await page.waitForTimeout(300); await page.screenshot({ path: path.join(out, `third-failure-settlement-${width}.png`) });
            let noCardDirectSettlement = false;
            if (width === 768) {
                // 独立测试账号归零后重开，第二次失败无卡应直接结算，不出现购买或用卡提示。
                await api('/debug/reset', user.token, {});
                await page.evaluate(async () => { __require('UIManager').uimanager.closeModal(); await __cardScene.startGame(); });
                await page.waitForFunction(() => {
                    const g = __cardScene.screen.getComponents(cc.Component).find(c => c.beanCollectionHud);
                    if (g) { window.__cardGame = g; return true; } return false;
                });
                const noCardStart = (await api('/games/active', user.token)).round;
                await page.waitForTimeout(5200);
                await restoreFailure(page, noCardStart, secondFailure(noCardStart));
                await page.waitForFunction(() => __require('UIManager').uimanager.modal.getComponentsInChildren(cc.Label).some(l => l.string === '本局结算'));
                await page.waitForFunction(() => __require('ZyxGameModule').zyxGameModule.getPendingRoundSettlements().length === 0);
                assert.equal((await api('/games/active', user.token)).round, null);
                assert.equal((await api('/players/bootstrap', null, { deviceId })).profile.inventory.reviveCard, 0);
                noCardDirectSettlement = true;
                await page.screenshot({ path: path.join(out, 'no-card-direct-settlement-768.png') });
            }
            assert.deepEqual(errors, []);
            results.push({ width, height, shop, firstUsesExistingRewardOffer: true, realAdReviveCallbackAndRefill: true, extraRevivalOnce: true, noCardDirectSettlement,
                requestCount: requests.length, coldRestoreAfterLostResponse: width === 320, inventoryAfter: 1, finalSettlementAccepted: true, errors });
            await context.close();
        }
        fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(results, null, 2));
        console.log('PASS: real API and UI at 3 sizes; shop scroll, 25 bean purchase, first reward offer, card retry/cold restore, exactly one extra revival, authoritative final settlement');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
