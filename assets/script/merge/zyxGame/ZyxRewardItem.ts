const { ccclass, property } = cc._decorator;

@ccclass
export default class ZyxRewardItem extends cc.Component {

    @property(cc.Sprite)
    uImgGoods: cc.Sprite = null;

    @property(cc.Label)
    ulblCnt: cc.Label = null;

    onLoad() { }

    start() {

    }
}
