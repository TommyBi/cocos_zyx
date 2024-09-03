import { playerModule } from '../dataModule/PlayerModule';
import { LAYER } from '../define/TypeDefine';
import { audioMgr } from '../manager/AudioMgr';
import { uimanager } from '../manager/Uimanager';
import ZyxComTop from './ZyxComTop';

const { ccclass, property } = cc._decorator;

// 游戏主场景
@ccclass
export default class ZyxMainScene extends cc.Component {

    @property(cc.Node)
    uBtnStart: cc.Node = null;

    public topCom: ZyxComTop = null;

    onLoad() {
        console.log('load ZyxMainScene');
        this.uBtnStart.on(cc.Node.EventType.TOUCH_END, this.onStart, this);
        this.uBtnStart.active = false;
    }

    async start() {
        // 初始化界面层级
        uimanager.init(this.node);

        await this.initTopCom();

        // login
        playerModule.login(() => {
            // 初始化音频
            audioMgr.init();

            this.initUI();
        })

        this.onShow();
        this.onHide();
    }

    update() {
        uimanager.udpateLayerShow();
    }

    onStart(): void {
        this.initGamePanel();
    }


    // 初始化游戏主场景信息
    initUI(): void {
        this.uBtnStart.active = true;
        this.topCom.getComponent(ZyxComTop).init();
    }

    // 初始化顶部信息
    async initTopCom() {
        const topPre = await uimanager.loadPrefab('prefab/zyx/uComTop');
        const topNode = cc.instantiate(topPre);
        uimanager.add(topNode, LAYER.UI);
        topNode.setPosition(new cc.Vec2(0, cc.winSize.height / 2 - topNode.height/2));

        this.topCom = topNode;
    }

    // 初始化游戏界面
    async initGamePanel() {
        const prefab = await uimanager.loadPrefab('prefab/zyx/zyxGame');
        const gameNode = cc.instantiate(prefab);
        uimanager.add(gameNode, LAYER.UI);
        gameNode.setPosition(new cc.Vec2(0, 0));
    }

    onShow(): void {
        if (!window['wx']) return;
        wx.onShow(() => {
            console.log('onShow');
        })
    }

    onHide(): void {
        if (!window['wx']) return;
        wx.onHide(() => {
            console.log('onHide');
        })
    }
}