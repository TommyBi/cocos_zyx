// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ZyxLineCom extends cc.Component {

    @property(cc.Node)
    uImgLine: cc.Node = null;
    // onLoad () {}

    start() {

    }

    setW(width: number): void {
        this.uImgLine.width = width;
    }

    // update (dt) {}
}
