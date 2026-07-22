import { LAYER, typeRankResult } from '../define/TypeDefine';
import Tips from '../pulicCom/Tips';
import { audioMgr } from './AudioMgr';

export default class Uimanager {
    private static _ins: Uimanager;
    public static get instance() {
        if (!this._ins) {
            this._ins = new Uimanager();
        }
        return this._ins;
    }

    // 层级依托的场景
    scene: cc.Node = null;

    // 层级
    layerArr: cc.Node[] = [];

    private gmEntry: cc.Node = null;

    constructor() { }

    init(node: cc.Node) {
        this.scene = node;
        this.initLayer();
    }

    initLayer(): void {
        this.layerArr = [];

        const layers = [
            { name: LAYER.UI },
            { name: LAYER.GUIDE },
            { name: LAYER.DIALOG },
            { name: LAYER.TIP },
        ];

        for (const layer of layers) {
            const node = new cc.Node(layer.name);
            node.width = this.scene.width;
            node.height = this.scene.height;
            node.setAnchorPoint(0.5, 0.5);
            this.scene.addChild(node);
            this.layerArr.push(node);
        }
    }

    getLayer(name: LAYER): cc.Node {
        return this.scene.getChildByName(name);
    }

    add(node: cc.Node, layerType: LAYER) {
        const layerNode = this.getLayer(layerType);
        if (!layerNode) {
            console.warn('UIManager: 没有这个层级', layerType);
            return;
        }
        layerNode.addChild(node);
    }

    udpateLayerShow(): void {
        for (let i = 0; i < this.layerArr.length; i++) {
            this.layerArr[i].active = this.layerArr[i].childrenCount > 0;
        }
    }

    async loadPrefab(path: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const load = () => new Promise((rsv, rjt) => {
                const tot = setTimeout(() => {
                    console.debug(`[loadPefab timeout] ${path}加载超时`);
                    rjt(`loadPefab 连接超时${path}`);
                }, 10000);
                cc.resources.load(path, (err, res) => {
                    clearTimeout(tot);
                    if (err) {
                        rjt(err);
                    } else {
                        rsv(res);
                    }
                });
            });
            await load().then((res) => resolve(res)).catch((err) => reject(err));
        });
    }

    async showTips(msg: string) {
        const tipsPrefab = await this.loadPrefab('prefab/com/tips');
        const tipsNode = cc.instantiate(tipsPrefab);
        this.add(tipsNode, LAYER.TIP);
        tipsNode.getComponent(Tips).showTips(msg);
        tipsNode.setPosition(0, 0);
    }

    /** 结算界面 - 参考图1风格 */
    async showGameOver() {
        uimanager.showTips('游戏结束');
        const prefab = await this.loadPrefab('prefab/zyx/accountDialog');
        const accountNode = cc.instantiate(prefab);
        this.add(accountNode, LAYER.UI);
        accountNode.setPosition(0, 0);
    }

    // ======== 设置弹窗 - 参考图4 ========
    showSettings(onReplay?: () => void, onHome?: () => void): cc.Node {
        const root = this.createModalRoot('settingsDialog');
        const panelW = 560;
        const panelH = 660;

        // 面板背景（紫色圆角）
        const panel = this.createRect(root, 'panel', panelW, panelH, new cc.Color(94, 64, 157), 255, 20, 0, 30);

        // 内部亮色面板
        this.createRect(panel, 'panelLight', panelW - 16, panelH - 16, new cc.Color(120, 82, 190), 220, 16, 0, 0);

        this.createLabel(panel, '设置', 0, 250, 42, new cc.Color(255, 255, 255), true, 360, 56);

        // 关闭按钮 X
        const close = this.createButton(panel, '\u2715', 230, 258, 60, 60, new cc.Color(112, 78, 180), () => root.destroy(), 32, 14);

        // 设置项行
        this.createSettingRow(panel, 'MUSIC', 140, audioMgr.getMusicEnabled(), (value) => audioMgr.setMusicEnabled(value));
        this.createSettingRow(panel, 'SOUND', 55, audioMgr.getSoundEnabled(), (value) => audioMgr.setSoundEnabled(value));
        this.createSettingRow(panel, 'VIBRATE', -30, audioMgr.getVibrateEnabled(), (value) => audioMgr.setVibrateEnabled(value));

        // 分隔线
        this.createRect(panel, 'divider', panelW - 80, 2, new cc.Color(150, 120, 210), 200, 1, 0, -95);

        if (onReplay) {
            const replayY = onHome ? -170 : -200;
            this.createButton(panel, '重新开始', 0, replayY, 420, 78, new cc.Color(250, 167, 20), () => {
                root.destroy();
                onReplay();
            }, 30, 16);
        }

        if (onHome) {
            this.createButton(panel, '返回主页', 0, -260, 420, 70, new cc.Color(70, 155, 222), () => {
                root.destroy();
                onHome();
            }, 28, 14);
        }

        // Privacy Policy
        if (!onHome) {
            this.createLabel(panel, 'Privacy Policy', 0, -280, 24, new cc.Color(206, 188, 245), false, 260, 40);
        }

        return root;
    }

    // ======== 广告救援弹窗 ========
    showAdRescue(onConfirm: () => void, onCancel?: () => void): cc.Node {
        const root = this.createModalRoot('rescueDialog');
        const panelW = 560;
        const panelH = 520;

        const panel = this.createRect(root, 'panel', panelW, panelH, new cc.Color(77, 55, 143), 255, 18, 0, 10);

        // 标题
        this.createLabel(panel, '\u7a7a\u95f4\u544a\u6025', 0, 195, 38, new cc.Color(255, 255, 255), true, 360, 52);

        // 描述文字
        this.createLabel(panel, '\u770b\u4e00\u6bb5\u5e7f\u544a\uff0c\u7acb\u5373\u6e05\u9664\u4e0b\u65b9 5 \u6392\u3002', 0, 135, 26, new cc.Color(229, 219, 255), false, 460, 42);

        // 示意图区域：展示5排被消除的效果
        const demo = this.createRect(panel, 'demo', 380, 160, new cc.Color(35, 28, 78), 230, 12, 0, 20);
        for (let i = 0; i < 5; i++) {
            const color = [
                new cc.Color(65, 215, 120),
                new cc.Color(255, 214, 55),
                new cc.Color(255, 105, 181),
                new cc.Color(255, 111, 39),
                new cc.Color(42, 200, 255),
            ][i];
            const w = 380 - i * 50;
            this.createRect(demo, `line${i}`, w, 26, color, 255, 8, 0, 56 - i * 30);
        }

        // 确认按钮
        this.createButton(panel, '\u770b\u5e7f\u544a\u6e05\u9664', 0, -115, 380, 72, new cc.Color(250, 167, 20), () => {
            root.destroy();
            onConfirm();
        }, 28, 14);

        // 取消按钮
        this.createButton(panel, '\u6682\u65f6\u4e0d\u7528', 0, -200, 300, 58, new cc.Color(96, 76, 148), () => {
            root.destroy();
            if (onCancel) onCancel();
        }, 22, 10);

        return root;
    }

    // ======== 排行榜弹窗 - 前500 + 底部固定自己排名 ========
    showLeaderboard(rankData: typeRankResult): cc.Node {
        const root = this.createModalRoot('rankDialog');
        const panelW = 620;
        const panelH = 900;

        // 面板背景
        const panel = this.createRect(root, 'panel', panelW, panelH, new cc.Color(35, 32, 84), 255, 18, 0, 0);
        this.createRect(panel, 'panelLight', panelW - 12, panelH - 12, new cc.Color(75, 53, 145), 150, 16, 0, 0);

        // 标题
        this.createLabel(panel, '\u6392\u884c\u699c', 0, 385, 38, new cc.Color(255, 255, 255), true, 340, 54);

        // 关闭按钮
        const close = this.createButton(panel, '\u2715', 255, 390, 56, 56, new cc.Color(94, 64, 157), () => root.destroy(), 28, 12);

        // 表头
        const header = this.createRect(panel, 'rankHeader', panelW - 50, 50, new cc.Color(24, 22, 62), 220, 8, 0, 338);
        this.createLabel(header, '\u6392\u540d', -205, 0, 20, new cc.Color(182, 208, 255), true, 80, 36);
        this.createLabel(header, '\u73a9\u5bb6', -50, 0, 20, new cc.Color(182, 208, 255), true, 200, 36);
        this.createLabel(header, '\u5206\u6570', 205, 0, 20, new cc.Color(182, 208, 255), true, 100, 36);

        // 滚动区域
        const viewH = 600;
        const scrollRoot = new cc.Node('rankScroll');
        scrollRoot.width = panelW - 50;
        scrollRoot.height = viewH;
        scrollRoot.setAnchorPoint(0.5, 0.5);
        scrollRoot.setPosition(0, 18);
        panel.addChild(scrollRoot);
        scrollRoot.addComponent(cc.Mask).type = cc.Mask.Type.RECT;

        const scrollView = scrollRoot.addComponent(cc.ScrollView);
        scrollView.horizontal = false;
        scrollView.vertical = true;
        scrollView.inertia = true;
        scrollView.brake = 0.75;

        // 列表数据（最多500条）
        const list = (rankData.list || []).slice(0, 500);
        const rowH = 58;
        const content = new cc.Node('rankContent');
        content.setAnchorPoint(0.5, 1);
        content.width = panelW - 50;
        content.height = Math.max(viewH, list.length * rowH);
        content.y = viewH / 2;
        scrollRoot.addChild(content);
        scrollView.content = content;

        // 渲染排行列表
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const y = -i * rowH - rowH / 2;
            const isTop3 = i < 3;
            const rowColor = i % 2 === 0 ? new cc.Color(43, 39, 99) : new cc.Color(54, 44, 116);

            const row = this.createRect(content, `rankRow${i}`, panelW - 60, 48, rowColor, 210, 8, 0, y);

            // 排名（前三名特殊颜色）
            let rankColor = new cc.Color(255, 218, 81);
            if (isTop3) {
                rankColor = i === 0 ? new cc.Color(255, 215, 0) : i === 1 ? new cc.Color(192, 192, 192) : new cc.Color(205, 127, 50);
            }
            this.createLabel(row, `${item.rank || i + 1}`, -215, 0, 20, rankColor, true, 80, 34);

            // 玩家名
            this.createLabel(row, item.nickName || '\u6d88\u9664\u73a9\u5bb6', -45, 0, 20, new cc.Color(255, 255, 255), false, 210, 34);

            // 分数
            this.createLabel(row, `${item.score || 0}`, 205, 0, 20, new cc.Color(82, 224, 255), true, 100, 34);
        }

        if (list.length === 0) {
            this.createLabel(scrollRoot, '\u6682\u65e0\u6392\u884c\u6570\u636e', 0, 0, 26, new cc.Color(218, 210, 255), false, 320, 48);
        }

        // 底部固定自己的排名栏
        const mineText = rankData.selfRank > 0 && rankData.selfRank <= 2000
            ? `\u6211\u7684\u6392\u540d  ${rankData.selfRank}    \u6700\u9ad8\u5206  ${rankData.selfScore || 0}`
            : `\u6211\u7684\u6392\u540d  \u672a\u4e0a\u699c    \u6700\u9ad8\u5206  ${rankData.selfScore || 0}`;
        const mine = this.createRect(panel, 'mineRank', panelW - 20, 68, new cc.Color(20, 18, 55), 240, 12, 0, -400);
        this.createLabel(mine, mineText, 0, 0, 22, new cc.Color(255, 255, 255), true, 520, 42);

        return root;
    }

    showGmEntry(onOpen: () => void): cc.Node {
        const layer = this.getLayer(LAYER.GUIDE);
        if (!layer) return null;
        if (this.gmEntry) this.gmEntry.destroy();

        const x = -this.scene.width / 2 + 58;
        const y = this.scene.height / 2 - 88;
        this.gmEntry = this.createButton(layer, 'GM', x, y, 72, 46, new cc.Color(33, 34, 82), onOpen, 20, 12);
        this.gmEntry.zIndex = 9999;
        return this.gmEntry;
    }

    hideGmEntry(): void {
        if (this.gmEntry) {
            this.gmEntry.destroy();
            this.gmEntry = null;
        }
    }

    showGmPanel(actions: {
        onAddHammer: (count: number) => void,
        onAddDrill: (count: number) => void,
        onClearRows: () => void,
        getStats: () => string,
    }): cc.Node {
        const root = this.createModalRoot('gmDialog');
        const panelW = 520;
        const panelH = 520;

        const panel = this.createRect(root, 'panel', panelW, panelH, new cc.Color(33, 34, 82), 255, 18, 0, 0);
        this.createRect(panel, 'panelLight', panelW - 14, panelH - 14, new cc.Color(56, 48, 126), 210, 16, 0, 0);
        this.createLabel(panel, 'GM 面板', 0, 200, 36, new cc.Color(255, 255, 255), true, 320, 50);

        this.createButton(panel, '\u2715', 210, 205, 54, 54, new cc.Color(70, 60, 145), () => root.destroy(), 28, 12);

        const statsNode = this.createLabel(panel, actions.getStats(), 0, 130, 22, new cc.Color(218, 224, 255), false, 420, 80);
        const statsLabel = statsNode.getComponent(cc.Label);
        const refresh = () => {
            statsLabel.string = actions.getStats();
        };

        this.createButton(panel, '锤子 +1', 0, 55, 360, 58, new cc.Color(250, 167, 20), () => {
            actions.onAddHammer(1);
            refresh();
            this.showTips('已发放锤子 x1');
        }, 24, 14);

        this.createButton(panel, '锤子 +5', 0, -20, 360, 58, new cc.Color(70, 155, 222), () => {
            actions.onAddHammer(5);
            refresh();
            this.showTips('已发放锤子 x5');
        }, 24, 14);

        this.createButton(panel, '电钻 +1', 0, -95, 360, 58, new cc.Color(72, 197, 232), () => {
            actions.onAddDrill(1);
            refresh();
            this.showTips('已发放电钻 x1');
        }, 24, 14);

        this.createButton(panel, '测试清除 5 排', 0, -170, 360, 58, new cc.Color(122, 82, 196), () => {
            actions.onClearRows();
            refresh();
        }, 22, 14);

        this.createLabel(panel, '仅测试阶段显示', 0, -230, 20, new cc.Color(186, 178, 230), false, 300, 34);
        return root;
    }

    // ======== UI 组件工厂方法 ========
    // 注意：Cocos Creator 2D 坐标系，锚点默认 0.5,0.5，位置是相对父节点的偏移

    private createSettingRow(parent: cc.Node, label: string, y: number, checked: boolean, onChange: (value: boolean) => void): void {
        // 图标
        const iconText = label === 'MUSIC' ? '\u266a' : label === 'SOUND' ? '))' : '▯';
        this.createLabel(parent, iconText, -210, y, 36, new cc.Color(255, 255, 255), true, 60, 52);
        // 文字
        this.createLabel(parent, label, -105, y, 28, new cc.Color(255, 255, 255), true, 200, 46);
        // 开关
        this.createToggle(parent, 190, y, checked, onChange);
        // 分割线
        this.createRect(parent, `line_${label}`, 450, 2, new cc.Color(137, 103, 205), 180, 0, 0, y - 55);
    }

    private createToggle(parent: cc.Node, x: number, y: number, checked: boolean, onChange: (value: boolean) => void): cc.Node {
        const node = new cc.Node('toggle');
        node.width = 110;
        node.height = 52;
        node.setPosition(x, y);
        node.setAnchorPoint(0.5, 0.5);
        parent.addChild(node);

        const knob = new cc.Node('knob');
        knob.width = 44;
        knob.height = 44;
        knob.setAnchorPoint(0.5, 0.5);
        node.addChild(knob);

        const refresh = () => {
            this.drawRect(node, 110, 52, checked ? new cc.Color(0, 214, 78) : new cc.Color(83, 61, 135), 26, 255);
            this.drawCircle(knob, 22, new cc.Color(235, 238, 240), 255);
            knob.x = checked ? 28 : -28;
        };

        refresh();
        node.on(cc.Node.EventType.TOUCH_END, () => {
            checked = !checked;
            refresh();
            onChange(checked);
        });
        return node;
    }

    /**
     * 创建按钮
     * @param parent 父节点
     * @param text 按钮文字
     * @param x x坐标（锚点0.5，相对父节点）
     * @param y y坐标
     * @param w 宽度
     * @param h 高度
     * @param color 背景色
     * @param onClick 点击回调
     * @param fontSize 字体大小（可选）
     * @param radius 圆角半径（可选）
     */
    createButton(parent: cc.Node, text: string, x: number, y: number, w: number, h: number, color: cc.Color, onClick: () => void, fontSize?: number, radius?: number): cc.Node {
        const btnRadius = radius || Math.min(w, h) * 0.16;
        const node = this.createRect(parent, `btn_${text}`, w, h, color, 255, btnRadius, x, y);
        node.on(cc.Node.EventType.TOUCH_END, onClick);
        node.addComponent(cc.Button);

        const lblFontSize = fontSize || Math.max(22, Math.floor(h * 0.42));
        this.createLabel(node, text, 0, 0, lblFontSize, new cc.Color(255, 255, 255), true, w - 20, h - 8);

        // 按钮点击效果
        node.on(cc.Node.EventType.TOUCH_START, () => {
            cc.tween(node).to(0.08, { scale: 0.95 }).start();
        });
        node.on(cc.Node.EventType.TOUCH_END, () => {
            cc.tween(node).to(0.12, { scale: 1.0 }, { easing: 'backOut' }).start();
        });
        node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.tween(node).to(0.12, { scale: 1.0 }).start();
        });

        return node;
    }

    createLabel(parent: cc.Node, text: string, x: number, y: number, fontSize: number, color: cc.Color, bold: boolean = false, w: number = 300, h: number = 50): cc.Node {
        const node = new cc.Node('text');
        node.width = w;
        node.height = h;
        node.setPosition(x, y);
        node.setAnchorPoint(0.5, 0.5);
        parent.addChild(node);

        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = Math.max(h, Math.floor(fontSize * 1.2));
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.NONE;
        label.enableWrapText = true;
        label.fontFamily = 'Arial';
        label.cacheMode = cc.Label.CacheMode.NONE;
        (label as any).isSystemFontUsed = true;
        node.color = color;
        node.opacity = 255;
        node.zIndex = 50;
        return node;
    }

    createRect(parent: cc.Node, name: string, w: number, h: number, color: cc.Color, opacity: number = 255, radius: number = 0, x: number = 0, y: number = 0): cc.Node {
        const node = new cc.Node(name);
        node.width = w;
        node.height = h;
        node.opacity = opacity;
        node.setPosition(x, y);
        node.setAnchorPoint(0.5, 0.5);
        parent.addChild(node);
        this.drawRect(node, w, h, color, radius, opacity);
        return node;
    }

    redrawRect(node: cc.Node, w: number, h: number, color: cc.Color, radius: number = 0, opacity: number = 255): void {
        this.drawRect(node, w, h, color, radius, opacity);
    }

    createCircle(parent: cc.Node, name: string, radius: number, color: cc.Color, x: number = 0, y: number = 0, opacity: number = 255): cc.Node {
        const node = new cc.Node(name);
        node.width = radius * 2;
        node.height = radius * 2;
        node.opacity = opacity;
        node.setPosition(x, y);
        node.setAnchorPoint(0.5, 0.5);
        parent.addChild(node);
        this.drawCircle(node, radius, color, opacity);
        return node;
    }

    private drawRect(node: cc.Node, w: number, h: number, color: cc.Color, radius: number = 0, opacity: number = 255): void {
        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        graphics.clear();
        const drawColor = new cc.Color(color.r, color.g, color.b, opacity);
        graphics.fillColor = drawColor;
        if (radius > 0) {
            graphics.roundRect(-w / 2, -h / 2, w, h, radius);
        } else {
            graphics.rect(-w / 2, -h / 2, w, h);
        }
        graphics.fill();
    }

    private drawCircle(node: cc.Node, radius: number, color: cc.Color, opacity: number = 255): void {
        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        graphics.clear();
        graphics.fillColor = new cc.Color(color.r, color.g, color.b, opacity);
        graphics.circle(0, 0, radius);
        graphics.fill();
    }

    private createModalRoot(name: string): cc.Node {
        const layer = this.getLayer(LAYER.DIALOG);
        if (layer) {
            const old = layer.getChildByName(name);
            if (old) old.destroy();
        }

        const root = new cc.Node(name);
        root.width = this.scene.width;
        root.height = this.scene.height;
        root.setAnchorPoint(0.5, 0.5);
        this.add(root, LAYER.DIALOG);
        root.zIndex = 1000;
        root.addComponent(cc.BlockInputEvents);
        this.swallowTouches(root);
        const mask = this.createRect(root, 'mask', root.width, root.height, new cc.Color(6, 4, 24), 210, 0, 0, 0);
        mask.addComponent(cc.BlockInputEvents);
        this.swallowTouches(mask);
        root.setPosition(0, 0);
        return root;
    }

    private swallowTouches(node: cc.Node): void {
        const stop = (event) => {
            if (event && event.stopPropagation) event.stopPropagation();
        };
        node.on(cc.Node.EventType.TOUCH_START, stop);
        node.on(cc.Node.EventType.TOUCH_MOVE, stop);
        node.on(cc.Node.EventType.TOUCH_END, stop);
        node.on(cc.Node.EventType.TOUCH_CANCEL, stop);
    }
}
export const uimanager = Uimanager.instance;
