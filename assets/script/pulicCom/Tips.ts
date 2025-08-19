const { ccclass, property } = cc._decorator;

// 提示消息
@ccclass
export default class Tips extends cc.Component {

    @property(cc.Label)
    ulblTips: cc.Label = null;

    @property(cc.Sprite)
    uImgBg: cc.Sprite = null;

    onLoad() {
        this.node.opacity = 0;
    }

    start() {

    }

    showTips(msg: string): void {
        this.ulblTips.string = msg;
        this.node.y = -200;
        this.node.opacity = 0;
        cc.tween(this.node)
            .to(0.6, { opacity: 255, y: 0 }, { easing: 'cubicInOut' })
            .delay(1)
            .to(0.8, { opacity: 0, y: 50 }, { easing: 'cubicInOut' })
            .call(() => {
                this.node.removeFromParent();
            })
            .start();
    }
}
