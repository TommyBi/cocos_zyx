// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export class ZyxNodeCenter extends cc.Component {

    start() {
        const parent = this.node.parent;
        if (parent) {
            const parentWidth = parent.width;
            const parentHeight = parent.height;
            this.node.setPosition(parentWidth / 2, parentHeight / 2);
        }
    }
}