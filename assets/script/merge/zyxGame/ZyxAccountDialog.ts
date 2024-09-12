import { zyxGameModule } from "../dataModule/ZyxGameModule";
import { EventType } from "../manager/Define";
import { eventManager } from "../util/EventManager";

const { ccclass, property } = cc._decorator;

// 结算界面
@ccclass
export default class ZyxAccountDialog extends cc.Component {

    @property(cc.Label)
    ulblTitle: cc.Label = null;

    @property(cc.Label)
    ulblScore: cc.Label = null;

    @property(cc.Node)
    uBox: cc.Node = null;

    @property(cc.Node)
    uBtnOk: cc.Node = null;

    onLoad() {
        this.uBtnOk.on(cc.Node.EventType.TOUCH_END, this.close, this);
    }

    start() {
        this.ulblScore.string = `得分：${zyxGameModule.gameInfo.score}`;
    }

    close() {
        // 重置游戏
        zyxGameModule.gameInfo = {
            adTimes: 3,
            score: 0,
            exp: 0,
            diamond: 0,
            star: 0,
        }
        eventManager.dispatch(EventType.ZYX_RESET_GAME);

        cc.tween(this.node)
            .to(0.2, { scale: 0 })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }
}
