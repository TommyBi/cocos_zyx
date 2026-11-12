/** 本地构建的浏览器验收；API 全部隔离模拟，不请求外部服务。 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const { replayRound } = require('../server/src/gameEngine');
const output = path.resolve(process.env.QA_OUTPUT || 'output/game-feel-v2');
fs.mkdirSync(output, { recursive: true });
(async () => {
    const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    try {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const seed = 2654435761;
        const profile = { playerId: 'local-feel-qa', nickname: '开心朋友', avatarUrl: '', level: 1, experience: 0,
            moodBeanBalance: 0, totalMoodBeans: 0, highestSingleGameScore: 0, gameCount: 0,
            stamina: { current: 10, max: 10, updatedAt: Date.now(), regenSeconds: 300,
                serverTime: new Date().toISOString(), shareAvailableToday: true } };
        await page.route('**/*', async route => {
            const url = new URL(route.request().url());
            if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: {
                'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
            if (url.pathname.includes('/v1/cocos-zyx/')) {
                let data;
                if (url.pathname.endsWith('/health')) data = { capabilities: ['bean-collection-progress', 'adaptive-combo-v2', 'bean-collection-1pct', 'bean-tool-shop', 'difficulty-ramp-2x', 'difficulty-pressure-v4', 'rising-rows-v5'] };
                else if (url.pathname.endsWith('/players/bootstrap')) data = { token: 'local-qa-token', profile, serverTime: new Date().toISOString() };
                else if (url.pathname.endsWith('/games/start')) data = { roundId: route.request().postDataJSON().roundId,
                    seed, isTutorial: true, collectionRule: 'progress_v2', rulesVersion: 5, stamina: profile.stamina };
                else if (url.pathname.endsWith('/leaderboards')) data = { entries: [], self: { rank: null, bestScore: 0, onBoard: false } };
                else data = { profile };
                return route.fulfill({ json: { code: 0, data }, headers: { 'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
            }
            if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
            return route.continue();
        });
        await page.goto('http://localhost:7457/?localApi=1&autostart=1', { waitUntil: 'load' });
        await page.waitForFunction(() => {
            function find(node) {
                const game = (node._components || []).find(component => component.beanCollectionHud);
                if (game) { window.__feelGame = game; return true; }
                return (node.children || []).some(find);
            }
            return window.cc && cc.director.getScene() && find(cc.director.getScene());
        }, null, { timeout: 30000 });
        await page.evaluate(() => {
            window.__feelBoard = window.__require('ZyxGameModule').zyxGameModule;
            const game = window.__feelGame;
            const board = window.__feelBoard;
            window.__qaGenerationTimes = [];
            const generate = board.generateNextRow;
            board.generateNextRow = function () {
                const start = performance.now();
                const row = generate.call(this);
                window.__qaGenerationTimes.push(performance.now() - start);
                return row;
            };
            game.__qaEliminations = []; game.__qaBombs = [];
            const eliminate = game.animateElimination;
            game.animateElimination = function (result, complete) {
                this.__qaEliminations.push({ rows: result.clearedRows, cascade: result.cascade, combo: result.combo });
                return eliminate.call(this, result, complete);
            };
            const blast = game.animateBombBlasts;
            game.animateBombBlasts = function (result) {
                this.__qaBombs.push((result.detonatedBombs || []).length);
                return blast.call(this, result);
            };
            function hide(node) { if (node.name === 'gmFloatingBubble') node.active = false; for (const child of node.children || []) hide(child); }
            hide(cc.director.getScene());
        });
        for (let step = 0; step < 3; step++) {
            await page.waitForFunction(() => !window.__feelGame.locked);
            await page.evaluate(step => { const move = window.__feelBoard.getTutorialMove(step); window.__feelGame.movePiece(move.id, move.offset); }, step);
            await page.waitForFunction(step => step < 2 ? window.__feelGame.tutorialStep > step && !window.__feelGame.locked
                : window.__feelGame.tutorialStep < 0 && !window.__feelGame.locked, step, { timeout: 15000 });
        }
        assert.equal(await page.evaluate(() => window.__feelBoard.combo >= 3), true);
        const openingBomb = await page.evaluate(() => window.__feelBoard.pieces.some(piece => piece.bomb));
        assert.equal(openingBomb, true);
        await page.screenshot({ path: path.join(output, 'after-tutorial.png') });
        const highlight = page.waitForFunction(() => {
            const root = window.__feelGame.rewardFeedback;
            return root && root.isValid && root.children.some(node => {
                const label = node.getComponent(cc.Label);
                return label && /连锁|排齐消/.test(label.string);
            });
        }, null, { timeout: 60000 }).then(async () => {
            await page.waitForTimeout(80);
            await page.screenshot({ path: path.join(output, 'cascade-feedback.png') });
        });
        const actions = [];
        for (let action = 0; action < Number(process.env.QA_ACTIONS || 18); action++) {
            const result = await page.evaluate(action => {
                const board = window.__feelBoard, game = window.__feelGame;
                const hint = board.findEliminationHint(), bomb = board.pieces.find(piece => piece.bomb);
                if (bomb && (action === 0 || !hint)) { game.useBomb(bomb.id); return { type: 'bomb' }; }
                if (hint) { game.movePiece(hint.id, hint.offset); return { type: 'move' }; }
                for (const piece of board.pieces) {
                    const range = board.getMoveRange(piece.id);
                    const offset = range.min < 0 ? -1 : range.max > 0 ? 1 : 0;
                    if (offset) { game.movePiece(piece.id, offset); return { type: 'setup' }; }
                }
                return { type: 'none' };
            }, action);
            assert.notEqual(result.type, 'none');
            await page.waitForFunction(() => !window.__feelGame.locked || window.__feelBoard.isGameOver() || !!window.__require('UIManager').uimanager.modal, null, { timeout: 15000 });
            result.state = await page.evaluate(() => ({ combo: window.__feelBoard.combo, score: window.__feelBoard.score,
                moveCount: window.__feelBoard.moveCount, bombs: window.__feelBoard.pieces.filter(piece => piece.bomb).length,
                rows: window.__feelBoard.roundClearedRows, cascade: window.__feelBoard.actionCascade, stage:window.__feelBoard.getDifficulty().stage,
                riseRows:window.__feelBoard.getRiseRowCount(window.__feelBoard.difficultyActionCount+1), gameOver:window.__feelBoard.isGameOver() || (window.__feelGame.locked && !!window.__require('UIManager').uimanager.modal), preview:window.__feelGame.nextRowLabel.string }));
            actions.push(result);
            if(result.state.riseRows===2) {
                assert.equal(result.state.preview,'下两排 ↑↑');
                if(!actions.slice(0,-1).some(a=>a.state.stage===result.state.stage)) await page.screenshot({path:path.join(output,`stage-${result.state.stage}-dual-preview.png`)});
            }
            if(result.state.gameOver) break;
        }
        await highlight;
        await page.waitForFunction(() => window.__feelGame.displayedRoundMoods === window.__feelBoard.roundCollectedMoodBeans
            && !window.__feelGame.beanCollectionHud.animating, null, { timeout: 5000 });
        const snapshot = await page.evaluate(() => ({ score: window.__feelBoard.score,
            moods: window.__feelBoard.roundCollectedMoodBeans, actions: window.__feelBoard.roundActions,
            eliminations: window.__feelGame.__qaEliminations, collection: { percent: window.__feelGame.beanCollectionHud.percent.string, count: window.__feelGame.beanCollectionHud.count.string },
            bombs: window.__feelGame.__qaBombs, generationTimes: window.__qaGenerationTimes }));
        const replay = replayRound(seed, true, snapshot.actions, 5);
        assert.equal(snapshot.collection.percent, String(snapshot.moods % 100) + '%');
        assert.equal(snapshot.collection.count, '本局 +' + Math.floor(snapshot.moods / 100));
        assert.equal(replay.valid, true);
        assert.equal(replay.score, snapshot.score);
        assert.equal(replay.collectedMoodBeans, snapshot.moods);
        assert.ok(snapshot.eliminations.some(item => item.rows >= 2 || item.cascade >= 2));
        assert.ok(snapshot.bombs.some(count => count > 0));
        assert.ok(actions.every(item => item.state.bombs <= 3));
        await page.screenshot({ path: path.join(output, 'continuous-clear.png') });
        await page.setViewportSize({ width: 320, height: 568 });
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(output, 'compact-screen.png') });
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({ seed, actions,
            score: snapshot.score, collectedBlocks: snapshot.moods, collection: snapshot.collection, replayActions: snapshot.actions, eliminations: snapshot.eliminations,
            detonations: snapshot.bombs.filter(Boolean), generationTimes: snapshot.generationTimes, replay, errors }, null, 2));
        console.log(JSON.stringify({ actions: actions.length, score: snapshot.score, collectedBlocks: snapshot.moods, collection: snapshot.collection,
            doubleOrCascade: snapshot.eliminations.filter(item => item.rows >= 2 || item.cascade >= 2).length,
            detonations: snapshot.bombs.filter(Boolean), replay, errors }));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
