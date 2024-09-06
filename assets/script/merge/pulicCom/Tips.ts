const { ccclass, property } = cc._decorator;

// 提示消息
@ccclass
export default class Tips extends cc.Component {

    @property(cc.Label)
    ulblTips: cc.Label = null;

    @property(cc.Sprite)
    uImgBg: cc.Sprite = null;

    onLoad() { }

    start() {

    }
}
