/** 隔离浏览器 + 模拟微信接口验收；样例好友不进入运行资源或线上数据。 */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const out = path.resolve(process.env.FRIEND_PREVIEW_OUTPUT || 'output/home-scroll-20261116');
fs.mkdirSync(out, { recursive: true });
const source = fs.readFileSync(path.resolve('wechat-open-data/index.js'), 'utf8');
const model = fs.readFileSync(path.resolve('wechat-open-data/ranking.js'), 'utf8');
(async () => {
    const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const results = [];
    try {
        for (const [width, height] of [[390, 844], [320, 568], [768, 1024]]) {
            const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            const profile = { playerId: 'isolated-friend-preview', nickname: '快乐的小熊', avatarUrl: '', level: 9,
                experience: 35, moodBeanBalance: 140, totalMoodBeans: 140, highestSingleGameScore: 1280,
                gameCount: 10, inventory: { hammer: 0, magicWand: 0 },
                stamina: { current: 10, max: 10, updatedAt: Date.now(), regenSeconds: 300,
                    serverTime: new Date().toISOString(), shareAvailableToday: true } };
            await page.route('**/*', async route => {
                const url = new URL(route.request().url());
                if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: {
                    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
                if (url.pathname.includes('/v1/cocos-zyx/')) return route.fulfill({ json: { code: 0,
                    data: { profile, token: 'isolated-qa', serverTime: new Date().toISOString() } },
                    headers: { 'Access-Control-Allow-Origin': '*' } });
                return route.continue();
            });
            await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:7458/?home=1&localApi=1');
            await page.waitForFunction(() => {
                function find(n) {
                    const scene = (n._components || []).find(c => c.homeFriendRanking);
                    if (scene) { window.__friendScene = scene; return true; }
                    return (n.children || []).some(find);
                }
                return window.cc && cc.director.getScene() && find(cc.director.getScene());
            });
            await page.evaluate(() => {
                function hide(n) { if (n.name === 'gmFloatingBubble') n.active = false; n.children.forEach(hide); }
                hide(cc.director.getScene());
            });
            await page.waitForTimeout(500);
            await page.screenshot({ path: path.join(out, `home-web-${width}.png`) });
            await page.evaluate(({ source, model }) => {
                const canvas = document.createElement('canvas'); canvas.width = innerWidth; canvas.height = innerHeight;
                let receive, inChild = false;
                const key = 'zyx_best_score_staging_v1';
                // 仅测试夹具：由返回的avatarUrl加载不同的头像PNG，不进入微信代码包。
                const portrait = index => {
                    const picture = document.createElement('canvas'); picture.width = 96; picture.height = 96;
                    const g = picture.getContext('2d');
                    g.fillStyle = ['#d9e9df', '#e8e0ee', '#f4dfcb', '#dbe9f0'][index % 4]; g.fillRect(0, 0, 96, 96);
                    g.fillStyle = ['#7d9b88', '#a587a7', '#ca9b75', '#7894b5'][index % 4];
                    g.beginPath(); g.ellipse(48, 94, 37, 30, 0, 0, Math.PI * 2); g.fill();
                    g.fillStyle = ['#5e493b', '#3c393a', '#6e5246'][index % 3];
                    g.beginPath(); g.ellipse(48, 42, 27, 31, 0, 0, Math.PI * 2); g.fill();
                    g.fillStyle = '#f2cbb0'; g.beginPath(); g.ellipse(48, 45, 21, 25, 0, 0, Math.PI * 2); g.fill();
                    g.fillStyle = ['#5e493b', '#3c393a', '#6e5246'][index % 3];
                    g.beginPath(); g.ellipse(45, 24, 24, 12, -0.25, 0, Math.PI * 2); g.fill();
                    g.fillStyle = '#4f4039';
                    for (const x of [40, 56]) { g.beginPath(); g.arc(x, 45, 2, 0, Math.PI * 2); g.fill(); }
                    g.strokeStyle = '#a77160'; g.lineWidth = 2; g.beginPath(); g.arc(48, 53, 7, 0.15, Math.PI - 0.15); g.stroke();
                    return picture.toDataURL('image/png');
                };
                const records = ['小满', '晚风', '快乐的小熊', '小芽', '春日', '小雨', '栗子'].map((nickname, i) => ({
                    openid: i === 2 ? 'self' : `friend-${i}`, nickname, avatarUrl: portrait(i),
                    KVDataList: [{ key, value: String([3660, 2150, 1280, 960, 850, 630, 90][i]) },
                        ...(i === 2 ? [{ key: `${key}_owner`, value: 'player-self' }] : [])],
                }));
                window.__friendFixture = { allowed: undefined, shares: [], requests: [], avatarLoads: 0,
                    mainCanvasWrites: 0, childCanvasWrites: 0, painted: [] };
                const fixture = window.__friendFixture;
                // 真微信约束：主域设置宽高；开放域画布尺寸只读。初始值为屏幕尺寸。
                for (const dimension of ['width', 'height']) {
                    const descriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, dimension);
                    Object.defineProperty(canvas, dimension, {
                        get: () => descriptor.get.call(canvas),
                        set: value => {
                            if (inChild) { fixture.childCanvasWrites++; throw Error('Cannot assign to read only canvas.'); }
                            fixture.mainCanvasWrites++; descriptor.set.call(canvas, value);
                        },
                    });
                }
                const g = canvas.getContext('2d');
                g.ellipse = undefined;
                const fillText = g.fillText.bind(g);
                g.fillText = (value, ...args) => { fixture.painted.push(String(value)); fillText(value, ...args); };
                const child = { getSharedCanvas: () => canvas, onMessage: cb => {
                    receive = message => { inChild = true; try { cb(message); } finally { inChild = false; } };
                },
                    getFriendCloudStorage: opts => { fixture.requests.push('friend'); setTimeout(() => opts.success({ data: records }), 0); },
                    getUserInfo: opts => opts.success({ data: [{ openId: 'selfOpenId', nickName: '快乐的小熊', avatarUrl: records[2].avatarUrl }] }),
                    getUserCloudStorage: opts => opts.success({ KVDataList: records[2].KVDataList }),
                    createImage: () => { const image = new Image(); image.addEventListener('load', () => fixture.avatarLoads++); return image; } };
                const module = { exports: {} }; new Function('module', model)(module);
                new Function('wx', 'require', source)(child, () => module.exports);
                const context = { canvas, postMessage: message => receive(message) };
                window.wx = { getOpenDataContext: () => context,
                    getAccountInfoSync: () => ({ miniProgram: { envVersion: 'trial' } }),
                    getSetting: opts => opts.success({ authSetting: { 'scope.WxFriendInteraction': fixture.allowed } }),
                    authorize: opts => { fixture.allowed = true; opts.success(); },
                    openSetting: opts => { fixture.allowed = true; opts.success(); },
                    shareAppMessage: message => fixture.shares.push(message) };
                window.__friendScene.homeFriendRanking.refresh();
            }, { source, model });
            await page.waitForTimeout(200);
            await page.screenshot({ path: path.join(out, `home-authorization-${width}.png`) });
            const permissionPoint = await page.evaluate(() => {
                const view = window.__friendScene.homeFriendRanking;
                const node = view.placeholder.children.find(n => n.name.startsWith('button_'));
                const p = node.convertToWorldSpaceAR(cc.v2());
                return { x: p.x / cc.winSize.width * innerWidth, y: (1 - p.y / cc.winSize.height) * innerHeight };
            });
            await page.mouse.click(permissionPoint.x, permissionPoint.y);
            await page.waitForFunction(() => window.__friendFixture.avatarLoads >= 3);
            await page.waitForTimeout(500);
            const permissionState = await page.evaluate(() => ({ allowed: window.__friendFixture.allowed,
                active: window.__friendScene.homeFriendRanking.view.active,
                placeholder: window.__friendScene.homeFriendRanking.placeholder.active,
                components: window.__friendScene.homeFriendRanking.view._components.map(c => ({ name: c.name, enabled: c.enabled, context: !!c._context })) }));
            const layout = await page.evaluate(() => {
                const scene = window.__friendScene, card = scene.homeFriendRanking.node;
                const toPixels = node => {
                    const min = node.convertToWorldSpaceAR(cc.v2(-node.width * node.anchorX, -node.height * node.anchorY));
                    const max = node.convertToWorldSpaceAR(cc.v2(node.width * (1 - node.anchorX), node.height * (1 - node.anchorY)));
                    return { left: min.x / cc.winSize.width * innerWidth,
                        top: (1 - max.y / cc.winSize.height) * innerHeight,
                        right: max.x / cc.winSize.width * innerWidth,
                        bottom: (1 - min.y / cc.winSize.height) * innerHeight };
                };
                const panel = card.getChildByName('friendPaper');
                const labels = panel.getComponentsInChildren(cc.Label).map(label => label.string);
                if (!labels.includes('微信好友最高分')) throw Error('好友榜标题不正确');
                if (panel.children.some(n => ['friend_previous', 'friend_next', 'friend_refresh'].includes(n.name)))
                    throw Error('仍有翻页或刷新按钮');
                const invite = panel.getChildByName('inviteFriends').convertToWorldSpaceAR(cc.v2());
                const title = scene.screen.getChildByName('homeTitleLogo');
                const demo = scene.screen.getChildByName('homeMoodScene');
                const demoCenter = demo.convertToWorldSpaceAR(cc.v2(0, 42));
                return { card: toPixels(panel), start: toPixels(scene.startButton),
                    title: toPixels(title), demoCenterY: (1 - demoCenter.y / cc.winSize.height) * innerHeight,
                    avatarLoads: window.__friendFixture.avatarLoads,
                    mainCanvasWrites: window.__friendFixture.mainCanvasWrites,
                    childCanvasWrites: window.__friendFixture.childCanvasWrites,
                    scoresPainted: ['3,660', '2,150', '1,280', '我 · 第3名'].every(value => window.__friendFixture.painted.includes(value)),
                    invite: { x: invite.x / cc.winSize.width * innerWidth, y: (1 - invite.y / cc.winSize.height) * innerHeight },
                    requests: window.__friendFixture.requests, shares: window.__friendFixture.shares,
                    version: toPixels(scene.screen.getChildByName('clientVersion')) };
            });
            assert.ok(layout.card.bottom < layout.start.top, '好友卡不遮挡开始按钮 ' + JSON.stringify({ width, layout }));
            assert.equal(layout.mainCanvasWrites, 2, '主域先设置画布宽高');
            assert.equal(layout.childCanvasWrites, 0, '开放域不修改只读尺寸');
            assert.equal(layout.scoresPainted, true, '缺少ellipse时仍显示好友与自身已有成绩');
            assert.ok(layout.card.left >= 0 && layout.card.right <= width, '好友卡在屏幕内');
            assert.ok(Math.abs((layout.card.left + layout.card.right) / 2 - width / 2) < 1, '好友榜水平居中');
            assert.ok(layout.card.left > (layout.card.right - layout.card.left) * 0.27, '两侧各预留入口栏');
            assert.ok(Math.abs(layout.demoCenterY - (layout.title.bottom + layout.card.top) / 2) < 1,
                '玩法示意位于标题下沿与好友榜上沿之间的视觉中点');
            await page.mouse.click(layout.invite.x, layout.invite.y);
            const shares = await page.evaluate(() => window.__friendFixture.shares);
            assert.equal(shares[0].query, 'from=friend_invite');
            layout.shares = shares;
            assert.equal(layout.requests.length, 1, JSON.stringify({ permissionPoint, permissionState, errors }));
            assert.deepEqual(errors, []);
            await page.screenshot({ path: path.join(out, `home-friends-simulated-${width}.png`) });
            const list = await page.evaluate(() => {
                const view = window.__friendScene.homeFriendRanking.view;
                const point = y => {
                    const p = view.convertToWorldSpaceAR(cc.v2(0, y));
                    return { x: p.x / cc.winSize.width * innerWidth, y: (1 - p.y / cc.winSize.height) * innerHeight };
                };
                window.__friendFixture.painted = [];
                return { start: point(-52), end: point(138) };
            });
            await page.mouse.move(list.start.x, list.start.y);
            await page.mouse.down();
            await page.mouse.move(list.end.x, list.end.y, { steps: 20 });
            await page.mouse.up();
            await page.waitForTimeout(180);
            assert.equal(await page.evaluate(() => window.__friendFixture.painted.includes('小雨')), true, '手势滑动显示后续好友');
            assert.equal(await page.evaluate(() => window.__friendFixture.requests.length), 1, '滑动不发起微信数据请求');
            await page.screenshot({ path: path.join(out, `home-friends-scrolled-simulated-${width}.png`) });
            // 实际缩放层中检查飞行终点，收集后角色必须摇晃并恢复。
            const flight = await page.evaluate(async () => {
                const scene = window.__friendScene;
                const layer = scene.homeDemoLayer, bean = scene.homeMoodBeanIcon;
                cc.Tween.stopAllByTarget(scene.homeDemoClock);
                const piece = layer.children.find(n => n.name.startsWith('homeDemoPiece_'));
                scene.playHomeMoodFlight(layer, bean, piece, 8, 7);
                const token = layer.children.find(n => n.name === 'homeDemoTransientMood_7');
                let arrivalDistance = null;
                const destroy = token.destroy;
                token.destroy = function () {
                    const p = token.convertToWorldSpaceAR(cc.v2());
                    arrivalDistance = p.sub(bean.convertToWorldSpaceAR(cc.v2(0, 4))).mag();
                    return destroy.call(token);
                };
                const samples = [];
                const endAt = performance.now() + 3400;
                while (performance.now() < endAt) {
                    if (cc.isValid(token)) {
                        const p = token.convertToWorldSpaceAR(cc.v2());
                        const target = bean.convertToWorldSpaceAR(cc.v2(0, 4));
                        samples.push({ distance: p.sub(target).mag(), angle: bean.angle });
                    } else samples.push({ distance: null, angle: bean.angle });
                    await new Promise(r => setTimeout(r, 16));
                }
                return { arrivalDistance, closest: Math.min(...samples.filter(s => s.distance !== null).map(s => s.distance)),
                    wobble: samples.some(s => Math.abs(s.angle) > 3), finalAngle: bean.angle };
            });
            assert.ok(flight.arrivalDistance !== null && flight.arrivalDistance < 1, JSON.stringify(flight));
            assert.equal(flight.wobble, true, JSON.stringify(flight));
            assert.ok(Math.abs(flight.finalAngle) < 0.1, JSON.stringify(flight));
            layout.flight = flight;
            if (width === 390) {
                await page.evaluate(() => {
                    window.__friendFixture.allowed = false;
                    window.__friendScene.homeFriendRanking.refresh();
                });
                const deniedPoint = await page.evaluate(() => {
                    const button = window.__friendScene.homeFriendRanking.placeholder.children.find(n => n.name.startsWith('button_'));
                    const p = button.convertToWorldSpaceAR(cc.v2());
                    return { x: p.x / cc.winSize.width * innerWidth, y: (1 - p.y / cc.winSize.height) * innerHeight };
                });
                await page.mouse.click(deniedPoint.x, deniedPoint.y);
                assert.equal(await page.evaluate(() => window.__friendFixture.allowed), true);
                layout.reopenedPermission = true;
            }
            const beforeReturn = await page.evaluate(() => window.__friendFixture.requests.length);
            await page.evaluate(() => window.__friendScene.showHome());
            await page.waitForTimeout(450);
            assert.equal(await page.evaluate(() => window.__friendFixture.requests.length), beforeReturn + 1,
                '每次返回首页只请求一次好友榜');
            layout.requestsOnReturn = 1;
            assert.deepEqual(errors, []);
            results.push({ width, height, ...layout, errors });
            await page.close();
        }
        fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify({ simulated: true,
            compatibility: { childCanvasSizeReadOnly: true, initialSizeIsScreen: true, ellipseUnavailable: true, selfIdIsAlias: true }, results }, null, 2));
        console.log('PASS: 3 sizes, clipped drag scrolling without requests, fixed self, centered layout, correct flight target and wobble; simulated friends only');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
