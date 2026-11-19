/** 隔离本地API：真实领取/消费/续玩协议，视频仅使用Web模拟。 */
const { chromium } = require('/Users/liuyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs');
const { default: BoardEngine } = require('../server/src/boardEngine');
const out = 'output/ux-fixes-20261118', apiBase = 'http://127.0.0.1:8085/v1/cocos-zyx';
async function api(route, token, body) {
    const r = await fetch(apiBase + route, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (token || '') }, body: body ? JSON.stringify(body) : undefined });
    const data = await r.json(); assert.equal(r.status, 200, JSON.stringify(data)); return data.data;
}
async function waitGame(page) {
    await page.waitForFunction(() => {
        if (!window.cc || !cc.director.getScene()) return false;
        const components = cc.director.getScene().getComponentsInChildren(cc.Component);
        window.__uxGame = components.find(c => c.hammerButton && c.pieceLayer);
        window.__uxMain = components.find(c => c.restoreUnsettledRound && c.startGame);
        return __uxMain && __uxMain.screen && __uxMain.screen.name === 'game' && __uxGame && cc.isValid(__uxGame.node) && __uxGame.node === __uxMain.screen && !__uxGame.locked;
    }, {}, { timeout: 30000 });
}
async function click(page, text) {
    await page.waitForTimeout(220);
    const point = await page.evaluate(text => {
        const b = cc.director.getScene().getComponentsInChildren(cc.Button).find(b => b.node.activeInHierarchy && b.node.getComponentsInChildren(cc.Label).some(l => l.string === text));
        if (!b) throw Error('Missing button: ' + text + ' state=' + JSON.stringify({screen:__uxMain.screen.name,locked:__uxGame.locked,hammer:__uxGame.hammerMode,wand:__uxGame.purifierMode,labels:cc.director.getScene().getComponentsInChildren(cc.Label).filter(l=>l.node.activeInHierarchy).map(l=>l.string)}));
        const p = b.node.convertToWorldSpaceAR(cc.v2()); return { x: p.x / cc.winSize.width * innerWidth, y: (1 - p.y / cc.winSize.height) * innerHeight };
    }, text);
    await page.mouse.click(point.x, point.y);
}
async function clickNode(page, field) {
    await page.waitForTimeout(500);
    const p = await page.evaluate(field => { const p = __uxGame[field].convertToWorldSpaceAR(cc.v2()); return { x: p.x / cc.winSize.width * innerWidth, y: (1 - p.y / cc.winSize.height) * innerHeight }; }, field);
    await page.mouse.click(p.x, p.y);
}
(async () => {
    const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const results = [];
    try {
        for (const [width, height] of [[390, 844], [320, 568], [768, 1024]]) {
            const deviceId = 'ux_' + width + '_' + Date.now(), user = await api('/players/bootstrap', '', { deviceId });
            const started = await api('/games/start', user.token, { roundId: 'ux_round_' + width + '_' + Date.now(), rulesVersion: 14, collectionRule: 'progress_v2', resumeProtocol: 1, securityProtocol: 1 });
            const board = new BoardEngine(); board.resetBoard(started.seed, started.isTutorial, 14);
            for (let i = 0; i < 3; i++) { const move = board.getTutorialMove(i); board.movePiece(move.id, move.offset); board.resolveBoard(); board.finishPlayerAction(); }
            for (let i = 0; i < 3; i++) board.appendNextRow(); board.resolveBoard(); board.finishPlayerAction();
            await api('/games/checkpoint', user.token, { roundId: started.roundId, sessionToken: started.sessionToken, actions: board.roundActions, elapsedMs: 0 });
            const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
            await context.addInitScript(({ deviceId, token }) => { localStorage.setItem('zyx_data_generation', 'mood_bean_v5_20261112'); localStorage.setItem('zyx_cloud_device_id', deviceId); localStorage.setItem('zyx_cloud_token', token); }, { deviceId, token: user.token });
            const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
            await page.goto('http://127.0.0.1:7467/?localApi=1&home=1'); await waitGame(page);
            assert.equal(await page.evaluate(() => !!__require('UIManager').uimanager.modal), false);
            // 中途关闭不发放，也不进入目标选择。
            await clickNode(page, 'hammerButton'); await click(page, '视频获得（3/3）'); await click(page, '模拟中途关闭');
            await page.waitForFunction(() => !__uxGame.locked);
            assert.deepEqual(await page.evaluate(() => [__uxGame.hammerMode, __require('ZyxGameModule').zyxGameModule.roundToolClaims.hammer]), [false, 0]);
            for (let n = 0; n < 3; n++) for (const item of ['hammer', 'magicWand']) {
                await clickNode(page, item === 'hammer' ? 'hammerButton' : 'purifierButton');
                await click(page, `视频获得（${3 - n}/3）`); await click(page, '模拟观看完成');
                await page.waitForFunction(item => !__uxGame.locked && (item === 'hammer' ? __uxGame.hammerMode : __uxGame.purifierMode), item);
                await page.waitForTimeout(450);
                assert.equal(await page.evaluate(() => !!__uxGame.toolSelectionPrompt), true);
                if (n === 0) await page.screenshot({ path: `${out}/${item}-selected-${width}.png` });
                const target = await page.evaluate(item => {
                    const m = __require('ZyxGameModule').zyxGameModule;
                    const counts = {}; m.pieces.forEach(p => counts[p.color] = (counts[p.color] || 0) + 1);
                    const piece = m.pieces.slice().sort((a, b) => item === 'hammer' ? a.row - b.row : counts[b.color] - counts[a.color])[0];
                    const p = __uxGame.pieceLayer.getChildByName('piece_' + piece.id).convertToWorldSpaceAR(cc.v2());
                    return { x: p.x / cc.winSize.width * innerWidth, y: (1 - p.y / cc.winSize.height) * innerHeight };
                }, item);
                await page.mouse.click(target.x, target.y);
                try { await page.waitForFunction(() => !__uxGame.locked && !__uxGame.hammerMode && !__uxGame.purifierMode, {}, { timeout: 20000 }); }
                catch (e) { console.log(JSON.stringify(await page.evaluate(() => ({locked:__uxGame.locked,hammer:__uxGame.hammerMode,wand:__uxGame.purifierMode,tutorial:__uxGame.tutorialStep,modal:!!__require('UIManager').uimanager.modal,labels:cc.director.getScene().getComponentsInChildren(cc.Label).map(l=>l.string),actions:__require('ZyxGameModule').zyxGameModule.roundActions.slice(-8)})))); await page.screenshot({path:`${out}/failure.png`}); throw e; }
            }
            assert.deepEqual(await page.evaluate(() => __require('ZyxGameModule').zyxGameModule.roundToolClaims), { hammer: 3, magicWand: 3 });
            await page.evaluate(() => __uxGame.captureProgress(true)); await page.waitForTimeout(500);
            const before = await page.evaluate(() => ({ round: __require('ZyxGameModule').zyxGameModule.cloudRoundId, score: __require('ZyxGameModule').zyxGameModule.score, stamina: __uxMain.stamina.current }));
            await page.reload(); await waitGame(page);
            assert.deepEqual(await page.evaluate(() => ({ round: __require('ZyxGameModule').zyxGameModule.cloudRoundId, score: __require('ZyxGameModule').zyxGameModule.score, stamina: __uxMain.stamina.current })), before);
            assert.equal(await page.evaluate(() => !!__require('UIManager').uimanager.modal), false);
            // 首页开始及恢复联网都直接续玩，不出现继续游戏弹窗，不扣体力。
            await page.evaluate(() => __uxMain.enterHome()); await page.waitForFunction(() => __uxMain.screen.name === 'home');
            await page.evaluate(() => __uxMain.startGame()); await waitGame(page);
            assert.equal(await page.evaluate(() => !!__require('UIManager').uimanager.modal), false);
            await page.evaluate(() => __uxMain.enterHome()); await page.waitForFunction(() => __uxMain.screen.name === 'home');
            await page.evaluate(() => window.dispatchEvent(new Event('online'))); await waitGame(page); await page.waitForTimeout(400);
            assert.equal(await page.evaluate(() => __uxMain.stamina.current), before.stamina);
            // 正常游戏中验证气球弹窗及按钮真实边界。
            await page.evaluate(() => { __uxGame.balloonPhase = 'flying'; __uxGame.handleRoundRescueClick(); }); await page.waitForTimeout(400);
            const gap = await page.evaluate(() => {
                const panel = __require('UIManager').uimanager.modal.getChildByName('panel');
                const body = panel.children.find(n => n.getComponent(cc.Label) && n.getComponent(cc.Label).string.startsWith('棋盘太挤'));
                const buttons = panel.children.filter(n => n.getComponent(cc.Button) && n.getChildByName('label'));
                return { gap: body.y - body.height / 2 - (buttons[0].y + buttons[0].height / 2), inside: buttons.every(b => b.y - b.height / 2 > -panel.height / 2 + 20) };
            });
            assert.ok(gap.gap >= 48 && gap.inside); await page.screenshot({ path: `${out}/balloon-spacing-${width}.png` });
            await click(page, '才不要'); assert.deepEqual(errors, []);
            results.push({ width, height, cancelledVideoNoReward: true, toolVideoClaimsAndUsesEach: 3, autoSelected: true, coldResume: true, startDirectResume: true, networkDirectResume: true, staminaPreserved: true, balloonGap: gap.gap, pageErrors: errors });
            await context.close();
        }
        fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify(results, null, 2)); console.log('Verified UX fixes on', results.length, 'viewport sizes');
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
