import { playerModule } from './dataModule/PlayerModule';
import { zyxGameModule } from './dataModule/ZyxGameModule';
import { LAYER } from './define/TypeDefine';
import { audioMgr, SoundType } from './manager/AudioMgr';
import { EventType } from './manager/Define';
import { uimanager } from './manager/Uimanager';
import { eventManager } from './util/EventManager';
import ZyxComTop from './zyxGame/ZyxComTop';

const { ccclass, property } = cc._decorator;

// 游戏主场景
@ccclass
export default class GameMainScene extends cc.Component {

    @property(cc.Node)
    uBtnStart: cc.Node = null;

    public topCom: cc.Node = null;
    private homeNode: cc.Node = null;
    private gameNode: cc.Node = null;

    onLoad() {
        this.uBtnStart.on(cc.Node.EventType.TOUCH_END, this.onStart, this);
        this.uBtnStart.active = false;
        eventManager.on(EventType.ZYX_BACK_HOME, this.backHome, this);
    }

    onDestroy(): void {
        eventManager.off(EventType.ZYX_BACK_HOME, this.backHome, this);
    }

    async start() {
        // 初始化界面层级
        uimanager.init(this.node);

        await this.initTopCom();

        // login
        await playerModule.login();

        // 初始化音频
        audioMgr.init();

        this.initUI();

        audioMgr.playBGM(SoundType.ZYX_MUSIC_MAIN);

        this.onShow();
        this.onHide();
    }

    update() {
        uimanager.udpateLayerShow();
    }

    onStart(): void {
        audioMgr.playSound(SoundType.ZYX_START);
        audioMgr.stopBGM();
        if (this.homeNode) this.homeNode.active = false;
        if (this.topCom) this.topCom.active = false;
        zyxGameModule.resetRound();
        this.initZyxGamePanel();
    }

    backHome(): void {
        audioMgr.stopBGM();
        zyxGameModule.resetRound();
        if (this.gameNode) {
            this.gameNode.destroy();
            this.gameNode = null;
        }
        if (this.topCom) this.topCom.active = false;
        if (this.homeNode) {
            this.homeNode.active = true;
        } else {
            this.initHome();
        }
    }

    // 初始化游戏主场景信息
    initUI(): void {
        this.uBtnStart.active = false;
        this.topCom.getComponent(ZyxComTop).init();
        this.topCom.active = false;
        this.initHome();
    }

    // ======== 主页界面 ========
    initHome(): void {
        if (this.homeNode) this.homeNode.destroy();

        const home = new cc.Node('home');
        home.width = cc.winSize.width;
        home.height = cc.winSize.height;
        home.setAnchorPoint(0.5, 0.5);
        uimanager.add(home, LAYER.UI);
        this.homeNode = home;

        const W = cc.winSize.width;
        const H = cc.winSize.height;

        // 深色星空背景
        uimanager.createRect(home, 'bg', W, H, new cc.Color(15, 13, 48), 255, 0, 0, 0);

        // 装饰性星星粒子效果（用小圆点模拟）
        for (let i = 0; i < 30; i++) {
            const sx = (Math.random() - 0.5) * W * 0.9;
            const sy = (Math.random() - 0.5) * H * 0.85;
            const ss = 1 + Math.random() * 2.5;
            const star = uimanager.createCircle(home, `star${i}`, ss, new cc.Color(255, 255, 255, 120 + Math.random() * 135), sx, sy);
            // 闪烁动画
            cc.tween(star)
                .to(1.5 + Math.random() * 1.5, { opacity: 40 })
                .to(1.5 + Math.random() * 1.5, { opacity: 200 })
                .union()
                .repeatForever()
                .start();
        }

        const titleY = H * 0.17;
        uimanager.createLabel(home, '消除烦恼', 0, titleY, 60, new cc.Color(255, 255, 255), true, 540, 84);
        uimanager.createLabel(home, '左右拖动色块，清掉满行', 0, titleY - 66, 25, new cc.Color(213, 207, 245), false, 520, 44);

        const scorePanel = uimanager.createRect(home, 'bestPanel', 360, 66, new cc.Color(39, 29, 88), 180, 16, 0, titleY - 140);
        uimanager.createLabel(scorePanel, `BEST  ${zyxGameModule.scoreRecord || 0}`, 0, 0, 24, new cc.Color(255, 216, 82), true, 300, 40);

        const playY = -H * 0.08;
        uimanager.createButton(home, '开始游戏', 0, playY, 430, 96, new cc.Color(250, 167, 20), () => this.onStart(), 36, 14);
        uimanager.createLabel(home, '点击开始', 0, playY - 74, 23, new cc.Color(236, 231, 255), false, 220, 34);

        uimanager.createButton(home, '排行榜', -135, playY - 160, 210, 70, new cc.Color(67, 160, 230), () => this.openRank(), 25, 12);
        uimanager.createButton(home, '设置', 135, playY - 160, 210, 70, new cc.Color(120, 82, 190), () => uimanager.showSettings(), 25, 12);
    }

    async openRank(): Promise<void> {
        uimanager.showTips('加载排行...');
        const rankData = await playerModule.getLeaderboard(500);
        uimanager.showLeaderboard(rankData);
    }

    // 初始化顶部信息栏
    async initTopCom() {
        const topPre = await uimanager.loadPrefab('prefab/zyx/uComTop');
        const topNode = cc.instantiate(topPre);
        uimanager.add(topNode, LAYER.UI);
        topNode.setPosition(new cc.Vec2(0, cc.winSize.height / 2 - topNode.height / 2 - 50));
        this.topCom = topNode;
    }

    // 初始化游戏界面
    async initZyxGamePanel() {
        if (this.gameNode) this.gameNode.destroy();
        const prefab = await uimanager.loadPrefab('prefab/zyx/zyxGame');
        const gameNode = cc.instantiate(prefab);
        uimanager.add(gameNode, LAYER.UI);
        gameNode.setPosition(new cc.Vec2(0, 0));
        this.gameNode = gameNode;
    }

    onShow(): void {
        if (!window['wx']) return;
        wx.onShow(() => {
            console.log('onShow');
        });
    }

    onHide(): void {
        if (!window['wx']) return;
        wx.onHide(() => {
            console.log('onHide');
        });
    }
}
