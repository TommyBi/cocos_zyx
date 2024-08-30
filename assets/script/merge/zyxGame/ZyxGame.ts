const {ccclass, property} = cc._decorator;

// 游戏主玩法场景
@ccclass
export default class ZyxGame extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    onLoad () {}

    start () {

    }
}
