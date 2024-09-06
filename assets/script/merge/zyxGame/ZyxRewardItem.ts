const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Sprite)
    uImgGoods: cc.Sprite = null;

    @property(cc.Label)
    ulblCnt: cc.Label = null;

    onLoad() { }

    start() {

    }
}
