/** 本地隔离的无头浏览器视觉验收；用户已明确授权，不操作用户现有浏览器。 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const out = path.resolve('output/unified-ui-verification');
fs.mkdirSync(out, { recursive: true });

(async () => {
    const browser = await chromium.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
        args: ['--autoplay-policy=no-user-gesture-required', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    });
    const results = [];
    try {
        for (const [width, height] of [[390,844], [320,568], [768,1024], [540,900], [1024,768]]) {
            const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            await page.route('**/leaderboards?type=power', route => route.fulfill({ json: { code: 0, data: {
                entries: [
                    { playerId: 'visual-top', rank: 1, nickname: '暖心朋友', value: 10000, avatarUrl: '' },
                    { playerId: 'visual-above', rank: 2, nickname: '开心朋友', value: 3000, avatarUrl: '' },
                    { playerId: 'visual-below', rank: 3, nickname: '顺心朋友', value: 2000, avatarUrl: '' },
                ], self: { rank: null, bestScore: 0, onBoard: false },
            } } }));
            await page.goto('http://localhost:7457/?localApi=1', { waitUntil: 'load' });
            await page.waitForFunction(() => {
                function find(n) {
                    const c = (n._components || []).find(c => c.beanCollectionHud);
                    if (c) { window.__beanQaGame = c; return true; }
                    return (n.children || []).some(find);
                }
                return window.cc && cc.director.getScene() && find(cc.director.getScene());
            }, null, { timeout: 30000 });
            // 视觉截图按正式界面查看；Web 专用调试气泡不是产品 UI。
            await page.evaluate(() => {
                function hide(n) { if (n.name === 'gmFloatingBubble') n.active = false; for (const c of n.children || []) hide(c); }
                hide(cc.director.getScene());
            });
            if (width === 390) {
                await page.evaluate(() => window.__beanQaGame.movePiece(1, -1));
                await page.waitForFunction(() => {
                    const g = window.__beanQaGame;
                    return g.displayedRoundMoods === 3 && g.beanCollectionHud.percent.string === '3%';
                }, null, { timeout: 8000 });
                results.push({ realElimination: await page.evaluate(() => ({
                    percent: window.__beanQaGame.beanCollectionHud.percent.string,
                    beans: window.__beanQaGame.beanCollectionHud.count.string,
                    score: window.__beanQaGame.scoreLabel.string,
                })) });
            }
            await page.evaluate(() => {
                const g = window.__beanQaGame;
                g.beanCollectionHud.complete(337);
                g.scoreLabel.string = '2400';
                g.bestLabel.string = '最高 4800';
                g.scoreLabel.node.color = new cc.Color(112, 78, 65);
                g.updateRecordTag(false);
                g.clearTutorialGuide();
                g.tutorialStep = -1;
                g.setRankExpanded(true, 0.05);
                g.rankChase.updateScore(2400);
            });
            await page.waitForTimeout(600);
            const dimensions = await page.evaluate(() => {
                const g = window.__beanQaGame;
                const rect = document.querySelector('canvas').getBoundingClientRect();
                const visible = cc.view.getVisibleSize();
                const a = g.hudRoot.convertToWorldSpaceAR(cc.v2(-g.hudRoot.width / 2 - 8, -84));
                const b = g.hudRoot.convertToWorldSpaceAR(cc.v2(g.hudRoot.width / 2 + 8, 84));
                const hud = g.beanCollectionHud;
                const rectOf = n => {
                    const a = n.convertToWorldSpaceAR(cc.v2(-n.width / 2, -n.height / 2));
                    const b = n.convertToWorldSpaceAR(cc.v2(n.width / 2, n.height / 2));
                    return { left: a.x, right: b.x, bottom: a.y, top: b.y };
                };
                const header = rectOf(g.hudRoot);
                const board = rectOf(g.node.getChildByName('boardFrame'));
                const rank = rectOf(g.rankChase.root);
                const beanUuid = hud.icon.getComponent(cc.Sprite).spriteFrame._uuid;
                const mascots = [];
                function collect(n) {
                    if (n.name === 'moodBeanMascot') {
                        const sprite = n.getComponent(cc.Sprite);
                        mascots.push({ name: n.name, uuid: sprite && sprite.spriteFrame._uuid });
                    }
                    for (const child of n.children || []) collect(child);
                }
                collect(g.node);
                const panelNames = [g.hudRoot.getChildByName('scoreCompareCard'), hud.root,
                    g.node.getChildByName('toolDock'), g.node.getChildByName('nextRow').getChildByName('nextPreviewShield')];
                const panelFrames = panelNames.map(n => n.getChildByName('gamePanelSkin').getComponent(cc.Sprite).spriteFrame);
                return {
                    visible: { width: visible.width, height: visible.height },
                    canvas: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                    clip: { x: rect.x + a.x / visible.width * rect.width,
                        y: rect.bottom - b.y / visible.height * rect.height,
                        width: (b.x - a.x) / visible.width * rect.width,
                        height: (b.y - a.y) / visible.height * rect.height },
                    percent: hud.percent.string, count: hud.count.string,
                    font: hud.percent.font && hud.percent.font.name,
                    header, board, rank, beanUuid, mascots, sharedPanel: panelFrames.every(f => f === panelFrames[0]),
                    bounds: [hud.percent, hud.count, g.scoreLabel, g.bestLabel].map(l => ({
                        text: l.string, width: l.node.width, parentWidth: l.node.parent.width,
                        x: l.node.x, fontSize: l.fontSize, renderedFontSize: l._actualFontSize,
                        bitmapFont: l.font instanceof cc.BitmapFont,
                    })),
                };
            });
            assert.equal(dimensions.percent, '37%');
            assert.equal(dimensions.count, '本局 +3');
            assert.ok(dimensions.bounds.every(b => b.bitmapFont), 'HUD 必须实际使用位图字体');
            assert.ok(dimensions.bounds.every(b => Math.abs(b.x) + b.width / 2 <= b.parentWidth / 2 + 1));
            assert.ok(dimensions.sharedPanel, '顶部两卡、道具栏和下一排必须共用同一背板');
            assert.ok(dimensions.mascots.length >= 3, '必须覆盖排行头像');
            assert.ok(dimensions.mascots.every(m => m.uuid === dimensions.beanUuid), '排行与收集必须共用同一豆子');
            const scale = (dimensions.header.right - dimensions.header.left) / 738;
            assert.ok(Math.abs((dimensions.rank.left - dimensions.header.left) / scale - 8) < 0.1);
            assert.ok(Math.abs((dimensions.header.right - dimensions.board.right) / scale - 8) < 0.1);
            await page.screenshot({ path: path.join(out, `screen-${width}x${height}.png`) });
            if (width === 390) {
                const clip = dimensions.clip;
                await page.screenshot({ path: path.join(out, 'hud-reference-state.png'), clip });
                await page.evaluate(() => window.__beanQaGame.setRankExpanded(false, 0.05));
                await page.waitForTimeout(350);
                assert.ok(await page.evaluate(() => {
                    const g = window.__beanQaGame;
                    return g.boardRoot.x === 0 && g.hudRoot.x === 0 && g.hudRoot.width === 642;
                }), '排行收起后顶部和棋盘必须重新居中');
                await page.screenshot({ path: path.join(out, 'screen-collapsed.png') });
                await page.evaluate(() => window.__beanQaGame.setRankExpanded(true, 0.05));
                await page.waitForTimeout(350);
                await page.evaluate(() => {
                    const g = window.__beanQaGame;
                    g.beanCollectionHud.complete(0); g.scoreLabel.string = '0'; g.bestLabel.string = '最高 0';
                });
                await page.waitForTimeout(60);
                await page.screenshot({ path: path.join(out, 'hud-empty-state.png'), clip });
                // 只操作展示对象，不更改任何经济数据或棋盘状态。
                const animation = await page.evaluate(async () => {
                    const hud = window.__beanQaGame.beanCollectionHud;
                    hud.complete(99);
                    hud.collectTo(201);
                    const seen = [];
                    for (let i = 0; i < 32; i++) {
                        await new Promise(r => setTimeout(r, 60));
                        seen.push({ percent: hud.percent.string, count: hud.count.string });
                    }
                    return { seen, percent: hud.percent.string, count: hud.count.string };
                });
                assert.equal(animation.count, '本局 +2');
                assert.equal(animation.percent, '1%');
                assert.ok(animation.seen.some(s => s.percent === '100%'));
                results.push({ animation });
                await page.evaluate(() => {
                    const g = window.__beanQaGame;
                    g.beanCollectionHud.complete(999999999);
                    g.updateHudNumber(g.scoreLabel, 999999999);
                    g.scoreLabel.fontSize = 46;
                    g.bestLabel.string = '最高 9.99亿';
                });
                await page.waitForTimeout(120);
                assert.ok(await page.evaluate(() => {
                    const node = window.__beanQaGame.scoreLabel.node;
                    return node.width * node.scale <= node.parent.width - 24;
                }), '大分数弹跳时也必须保留卡片内边距');
                await page.screenshot({ path: path.join(out, 'hud-large-numbers.png'), clip });
            }
            assert.deepEqual(errors, [], `页面异常：${errors.join(', ')}`);
            results.push({ viewport: { width, height }, ...dimensions, errors });
            await context.close();
        }
        fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
        console.log(`PASS: ${out}`);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
