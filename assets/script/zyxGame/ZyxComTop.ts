import { playerModule } from "../dataModule/PlayerModule";
import { zyxGameModule } from "../dataModule/ZyxGameModule";
import { uimanager } from "../manager/Uimanager";

const { ccclass, property } = cc._decorator;

// 游戏顶部信息栏 - 参考截图2/3风格
// 左侧：SCORE分数 | 中间：头像+Lv等级 | 右侧：BEST最高分 + 暂停按钮
@ccclass
export default class ZyxComTop extends cc.Component {

    @property(cc.Node)
    uImgExpBar: cc.Node = null;

    @property(cc.Label)
    ulblLv: cc.Label = null;

    @property(cc.Label)
    ulblExp: cc.Label = null;

    @property(cc.Node)
    uImgAvatar: cc.Node = null;

    @property(cc.Label)
    ulblDiamond: cc.Label = null;

    @property(cc.Label)
    ulblFlower: cc.Label = null;

    private topBarNode: cc.Node = null;

    onLoad() { }

    start() { }

    init(): void {
        // 如果使用预制体绑定方式，更新预制体绑定的Label
        if (this.ulblFlower) {
            this.ulblFlower.string = `${zyxGameModule.gameInfo.flower}`;
        }
        if (this.ulblLv) {
            this.ulblLv.string = `Lv.${String(playerModule.lv).padStart(2, '0')}`;
        }
        if (this.ulblExp) {
            this.ulblExp.string = `${playerModule.exp}/${playerModule.expTar}`;
        }
        if (this.ulblDiamond) {
            this.ulblDiamond.string = `${playerModule.diamond}`;
        }

        // 用代码构建更美观的顶部栏（覆盖/增强预制体）
        this.buildTopBar();
    }

    private buildTopBar(): void {
        const W = this.node.width || cc.winSize.width;
        const H = this.node.height || 120;

        // 清除旧的topBar
        if (this.topBarNode) {
            this.topBarNode.destroy();
        }

        this.topBarNode = new cc.Node('topBar');
        this.topBarNode.width = W;
        this.topBarNode.height = H;
        this.topBarNode.setAnchorPoint(0.5, 0.5);
        this.node.addChild(this.topBarNode);

        // ======== 左侧：SCORE ========
        const scoreBox = uimanager.createRect(this.topBarNode, 'scoreBox', 160, 80, new cc.Color(0, 0, 0, 0), 255, 0, -W * 0.32, 8);
        uimanager.createLabel(scoreBox, 'SCORE', 0, 20, 18, new cc.Color(180, 160, 230), true, 140, 28);
        const scoreLbl = uimanager.createLabel(scoreBox, `${zyxGameModule.gameInfo.score}`, 0, -12, 36, new cc.Color(255, 255, 255), true, 140, 48);

        // 保存scoreLbl引用以便后续更新
        this['_scoreLbl'] = scoreLbl;

        // ======== 中间：头像 + Lv ========
        // 头像圆形背景
        const avatarBg = uimanager.createCircle(this.topBarNode, 'avatarBg', 46, new cc.Color(90, 70, 160), 0, 6, 255);
        const avatarInner = uimanager.createCircle(avatarBg, 'avatarInner', 40, new cc.Color(120, 100, 180), 0, 0, 255);

        // Lv 标签
        const lvStr = `Lv.${String(playerModule.lv).padStart(2, '0')}`;
        const lvNode = uimanager.createRect(this.topBarNode, 'lvBg', 86, 26, new cc.Color(40, 30, 90), 220, 13, 0, -38);
        uimanager.createLabel(lvNode, lvStr, 0, 0, 16, new cc.Color(255, 220, 100), true, 76, 24);

        // ======== 右侧：BEST + 暂停按钮 ========
        const bestBox = uimanager.createRect(this.topBarNode, 'bestBox', 170, 80, new cc.Color(0, 0, 0, 0), 255, 0, W * 0.28, 8);

        uimanager.createLabel(bestBox, 'BEST', -20, 20, 18, new cc.Color(255, 200, 80), true, 100, 28);

        const bestVal = zyxGameModule.scoreRecord > 0 ? `${zyxGameModule.scoreRecord}` : '0';
        const bestLbl = uimanager.createLabel(bestBox, bestVal, 0, -12, 32, new cc.Color(255, 220, 80), true, 150, 44);

        // 保存bestLbl引用
        this['_bestLbl'] = bestLbl;

        // 暂停按钮（右侧紫色圆角方形）
        const pauseBtn = uimanager.createRect(this.topBarNode, 'pauseBtn', 56, 56, new cc.Color(140, 90, 210), 220, 14, W * 0.42, 8);
        uimanager.createLabel(pauseBtn, 'II', 0, 0, 24, new cc.Color(255, 255, 255), true, 40, 40);
        pauseBtn.on(cc.Node.EventType.TOUCH_END, () => {
            uimanager.showSettings();
        });
        pauseBtn.addComponent(cc.Button);

        // 暂停按钮点击效果
        pauseBtn.on(cc.Node.EventType.TOUCH_START, () => {
            cc.tween(pauseBtn).to(0.08, { scale: 0.9 }).start();
        });
        pauseBtn.on(cc.Node.EventType.TOUCH_END, () => {
            cc.tween(pauseBtn).to(0.12, { scale: 1.0 }, { easing: 'backOut' }).start();
        });
        pauseBtn.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.tween(pauseBtn).to(0.12, { scale: 1.0 }).start();
        });
    }

    /** 外部调用：更新分数显示 */
    updateScore(score: number): void {
        const lbl = this['_scoreLbl'];
        if (lbl && lbl.isValid) {
            lbl.getComponent(cc.Label).string = `${score}`;
        }
    }

    /** 外部调用：更新最高分显示 */
    updateBest(best: number): void {
        const lbl = this['_bestLbl'];
        if (lbl && lbl.isValid) {
            lbl.getComponent(cc.Label).string = `${best}`;
            lbl.active = best > 0;
        }
    }
}
