const { chromium } = require('/Users/liuyang/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { start } = require('../../server/src/index');
const out = __dirname;
(async () => {
    const api = (await start(path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-settings-')), 'test.sqlite'))).listen(0, '127.0.0.1');
    await new Promise(resolve => api.once('listening', resolve));
    const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
        args: ['--autoplay-policy=no-user-gesture-required', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    try {
        const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
        const errors = [], requests = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', async route => {
            const url = new URL(route.request().url());
            if (url.pathname.startsWith('/v1/cocos-zyx/')) {
                if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: {
                    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
                requests.push(url.pathname);
                const response = await route.fetch({ url: `http://127.0.0.1:${api.address().port}${url.pathname}${url.search}` });
                return route.fulfill({ response, headers: { ...response.headers(), 'access-control-allow-origin': '*' } });
            }
            if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
            return route.continue();
        });
        const loadHome = async () => {
        await page.goto('http://127.0.0.1:7457/?localApi=1&home=1');
        await page.waitForFunction(() => {
            function find(n) {
                const scene = (n._components || []).find(c => c.screen && c.screen.name === 'home');
                if (scene) { window.qaScene = scene; return true; }
                return (n.children || []).some(find);
            }
            return window.cc && cc.director.getScene() && find(cc.director.getScene());
        }, null, { timeout: 30000 });
        await page.evaluate(() => {
            window.qaFind = (name, root = cc.director.getScene()) => {
                if (root.name === name && root.activeInHierarchy) return root;
                for (const child of root.children || []) { const found = window.qaFind(name, child); if (found) return found; }
                return null;
            };
            window.qaPoint = (name, x = 0, y = 0) => {
                const node = name === 'panel' ? window.__require('UIManager').uimanager.modal.getChildByName('panel') : window.qaFind(name);
                const world = node.convertToWorldSpaceAR(cc.v2(x, y));
                const rect = document.querySelector('canvas').getBoundingClientRect();
                return { x: rect.left + world.x / cc.winSize.width * rect.width, y: rect.top + (1 - world.y / cc.winSize.height) * rect.height };
            };
            const gm = window.qaFind('gmFloatingBubble'); if (gm) gm.active = false;
        });
        await page.waitForTimeout(350);
        };
        await loadHome();
        const point = (name, x = 0, y = 0) => page.evaluate(args => window.qaPoint(...args), [name, x, y]);
        const click = async (name, x = 0, y = 0) => { const p = await point(name, x, y); await page.mouse.click(p.x, p.y); };
        const openHome = async () => { await click('settingsEntry'); await page.waitForTimeout(250); };
        const isOpen = () => page.evaluate(() => !!window.__require('UIManager').uimanager.modal);
        const waitClosed = async () => {
            await page.waitForFunction(() => !window.__require('UIManager').uimanager.modal && !window.qaFind('modal'));
        };
        await page.waitForTimeout(500);
        await openHome();
        await page.screenshot({ path: path.join(out, 'home-settings-390x844.png') });
        const initialSound = await page.evaluate(() => window.__require('GameSettings').gameSettings.soundEnabled);
        const switchPoint = async row => page.evaluate(row => {
            const node = window.qaFind(row).getChildByName('settingSwitch');
            const world = node.convertToWorldSpaceAR(cc.v2());
            const rect = document.querySelector('canvas').getBoundingClientRect();
            return { x: rect.left + world.x / cc.winSize.width * rect.width, y: rect.top + (1 - world.y / cc.winSize.height) * rect.height };
        }, row);
        for (const expected of [!initialSound, initialSound]) {
            const p = await switchPoint('setting_声音'); await page.mouse.click(p.x, p.y);
            assert.equal(await page.evaluate(() => window.__require('GameSettings').gameSettings.soundEnabled), expected);
            assert.equal(await isOpen(), true);
        }
        const startPoint = await point('volumeSlider', -100, 0);
        const endPoint = await point('volumeSlider', 70, 0);
        await page.mouse.move(startPoint.x, startPoint.y); await page.mouse.down();
        await page.mouse.move(endPoint.x, endPoint.y, { steps: 8 }); await page.mouse.up();
        const volume = await page.evaluate(() => window.__require('GameSettings').gameSettings.soundVolume);
        assert.ok(volume > .7 && volume < .8, String(volume));
        assert.equal(await isOpen(), true);
        const initialVibration = await page.evaluate(() => window.__require('GameSettings').gameSettings.vibrationEnabled);
        const vibration = await switchPoint('setting_震动'); await page.mouse.click(vibration.x, vibration.y);
        assert.equal(await page.evaluate(() => window.__require('GameSettings').gameSettings.vibrationEnabled), !initialVibration);
        await click('setting_声音', -150, 0);
        assert.equal(await isOpen(), true, 'setting rows must not dismiss');
        await click('panel', 0, -115); await waitClosed();
        await openHome(); await page.mouse.click(5, 422); await waitClosed();
        await openHome(); await click('modalCloseButton'); await waitClosed();
        await openHome(); await click('button_完成'); await waitClosed();
        const startGame = async () => {
        await click('button_开 始');
        await page.waitForFunction(() => window.qaScene.screen.name === 'game');
        await page.evaluate(() => { window.qaGame = window.qaScene.screen.getComponent(window.__require('ZyxGame').default); });
        await page.waitForFunction(() => !window.qaGame.locked);
        };
        await startGame();
        const pause = async () => {
            await click('pauseButton');
            try { await page.waitForFunction(() => window.__require('UIManager').uimanager.modal && window.qaFind('button_继续'), null, { timeout: 5000 }); }
            catch (error) {
                await page.screenshot({ path: path.join(out, 'pause-failure.png') });
                console.error(await page.evaluate(() => ({ locked: window.qaGame.locked, tutorial: window.qaGame.tutorialStep, win: cc.winSize,
                    point: window.qaPoint('pauseButton'), canvas: document.querySelector('canvas').getBoundingClientRect().toJSON(),
                    modals: cc.director.getScene().getComponentsInChildren(cc.Label).map(l => l.string) })));
                throw error;
            }
            await page.waitForTimeout(250);
            assert.equal(await page.evaluate(() => window.qaGame.locked), true);
        };
        const layouts = [];
        for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 430, height: 932 }, { width: 768, height: 1024 }]) {
            await page.setViewportSize(viewport); await page.waitForTimeout(600);
            if (viewport.width !== 390) { await loadHome(); await startGame(); }
            await pause();
            const layout = await page.evaluate(() => {
                const panel = window.__require('UIManager').uimanager.modal.getChildByName('panel');
                const buttons = ['继续', '重新开始', '退出'].map(text => {
                    const node = panel.getChildByName(`button_${text}`), label = node.getChildByName('label');
                    const corners = [cc.v2(-node.width / 2, -node.height / 2), cc.v2(node.width / 2, node.height / 2)].map(p => node.convertToWorldSpaceAR(p));
                    return { text, x: node.x, y: node.y, width: node.width, height: node.height, fontSize: label.getComponent(cc.Label).fontSize,
                        color: [label.color.r, label.color.g, label.color.b], glyph: node.children.find(n => n.name.endsWith('Glyph')).name,
                        visible: corners.every(p => p.x >= 0 && p.x <= cc.winSize.width && p.y >= 0 && p.y <= cc.winSize.height) };
                });
                const rows = ['声音', '音量', '震动'].map(text => {
                    const node = panel.getChildByName(`setting_${text}`);
                    return { text, fontSize: node.getChildByName('label').getComponent(cc.Label).fontSize, height: node.height,
                        surface: !!node.getChildByName('settingRowSurface') };
                });
                const top = panel.convertToWorldSpaceAR(cc.v2(0, panel.height / 2 + 40));
                const bottom = panel.convertToWorldSpaceAR(cc.v2(0, -panel.height / 2));
                return { buttons, rows, panelVisible: top.y <= cc.winSize.height && bottom.y >= 0 };
            });
            assert.equal(layout.buttons[0].y, layout.buttons[1].y);
            assert.ok(layout.buttons[0].x < 0 && layout.buttons[1].x > 0);
            assert.equal(layout.buttons[2].x, 0);
            assert.ok(layout.buttons[2].y < layout.buttons[0].y);
            assert.equal(layout.panelVisible, true);
            layout.buttons.forEach(button => { assert.deepEqual(button.color, [255, 255, 255]); assert.equal(button.fontSize, 32); assert.ok(button.visible); });
            await page.screenshot({ path: path.join(out, `pause-settings-${viewport.width}x${viewport.height}.png`) });
            layouts.push({ viewport, ...layout });
            await click('button_继续'); await waitClosed();
            assert.equal(await page.evaluate(() => window.qaGame.locked), false);
        }
        await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(600);
        await loadHome(); await startGame();
        for (const close of ['blank', 'mask', 'close']) {
            await pause();
            if (close === 'blank') await click('panel', 0, -52);
            if (close === 'mask') await page.mouse.click(5, 422);
            if (close === 'close') await click('modalCloseButton');
            await waitClosed();
            assert.equal(await page.evaluate(() => window.qaGame.locked), false, `${close} must resume game`);
        }
        await page.evaluate(() => {
            window.qaRestartCount = 0; window.qaExitCount = 0;
            window.qaGame.restartFromPause = () => { window.qaRestartCount++; };
            window.qaGame.finishGame = () => { window.qaExitCount++; };
        });
        await pause(); await click('button_重新开始'); await waitClosed();
        assert.equal(await page.evaluate(() => window.qaRestartCount), 1);
        assert.equal(await page.evaluate(() => window.qaGame.locked), true, 'restart must not call dismiss/resume');
        await page.evaluate(() => { window.qaGame.locked = false; });
        await pause(); await click('button_退出'); await waitClosed();
        assert.equal(await page.evaluate(() => window.qaExitCount), 1);
        assert.equal(await page.evaluate(() => window.qaGame.locked), true, 'exit must not call dismiss/resume');
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ errors, volume, layouts, checks: ['sound switch', 'vibration switch', 'volume drag',
            'row input protection', 'home blank/mask/close/done', 'pause blank/mask/close/resume', 'restart/exit callbacks', 'four screen sizes'] }, null, 2));
        console.log('PASS: settings controls, dismissal/resume, action callbacks, four responsive screenshots; page errors: 0');
    } finally { await browser.close(); await new Promise(resolve => api.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
