/** 首页冷启动与跨页面角色一致性验收，仅操作独立本地测试浏览器。 */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const out = path.resolve('output/unified-ui-verification');
fs.mkdirSync(out, { recursive: true });

(async () => {
    const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const results = {};
    try {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        // 只调整该浏览器收到的完成局数，让冷启动直接走首页资源加载路径。
        await page.route('**/players/bootstrap', async route => {
            const response = await route.fetch();
            const body = await response.json();
            body.data.profile.gameCount = 3;
            await route.fulfill({ response, json: body });
        });
        await page.route('**/leaderboards?type=power', route => route.fulfill({ json: { code: 0, data: {
            entries: [{ playerId: 'identity-rival', rank: 1, nickname: '开心朋友', value: 3000, avatarUrl: '' }],
            self: { rank: null, bestScore: 0, onBoard: false },
        } } }));
        await page.goto('http://localhost:7457/?localApi=1', { waitUntil: 'load' });
        await page.waitForFunction(() => {
            function find(n) {
                const c = (n._components || []).find(c => c.screen && c.screen.name === 'home');
                if (c) { window.__identityScene = c; return true; }
                return (n.children || []).some(find);
            }
            return window.cc && cc.director.getScene() && find(cc.director.getScene());
        }, null, { timeout: 30000 });
        await page.evaluate(() => {
            function hide(n) { if (n.name === 'gmFloatingBubble') n.active = false; for (const c of n.children || []) hide(c); }
            hide(cc.director.getScene());
            window.__beanIdentity = () => {
                const items = [];
                function walk(n) {
                    if (n.name === 'moodBeanMascot' || n.name === 'defaultAvatar' || n.name.startsWith('moodBean_')) {
                        const sprite = n.getComponent(cc.Sprite);
                        items.push({ name: n.name, uuid: sprite && sprite.spriteFrame && sprite.spriteFrame._uuid });
                    }
                    for (const c of n.children || []) walk(c);
                }
                walk(cc.director.getScene());
                return items;
            };
        });
        await page.waitForTimeout(450);
        results.home = await page.evaluate(() => window.__beanIdentity());
        assert.ok(results.home.some(i => i.name === 'defaultAvatar'));
        assert.ok(results.home.length >= 3);
        const uuid = results.home[0].uuid;
        assert.ok(uuid && results.home.every(i => i.uuid === uuid));
        await page.screenshot({ path: path.join(out, 'home-unified-bean.png') });

        await page.evaluate(async () => {
            await window.__require('LeaderboardPanel').showLeaderboardPanel(async () => {}, async () => {});
        });
        await page.waitForTimeout(300);
        results.leaderboard = await page.evaluate(() => window.__beanIdentity());
        assert.ok(results.leaderboard.length > results.home.length);
        assert.ok(results.leaderboard.every(i => i.uuid === uuid));
        await page.screenshot({ path: path.join(out, 'leaderboard-unified-bean.png') });

        await page.evaluate(async () => {
            window.__require('UIManager').uimanager.closeModal();
            await window.__identityScene.startGame();
        });
        await page.waitForFunction(() => window.__identityScene.screen.name === 'game');
        await page.waitForTimeout(5200);
        await page.evaluate(() => {
            const game = window.__identityScene.screen._components.find(c => c.beanCollectionHud);
            game.finishGame('视觉验收');
        });
        await page.waitForTimeout(350);
        results.settlement = await page.evaluate(() => window.__beanIdentity());
        assert.ok(results.settlement.some(i => i.name === 'moodBean_1'));
        assert.ok(results.settlement.every(i => i.uuid === uuid));
        await page.screenshot({ path: path.join(out, 'settlement-unified-bean.png') });
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(out, 'identity-results.json'), JSON.stringify({ ...results, errors }, null, 2));
        console.log('PASS: cold home, leaderboard and settlement use one bean sprite');
        await context.close();
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
