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

    onLoad() { }

    start() {

    }
}
