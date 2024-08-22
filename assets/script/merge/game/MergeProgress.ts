import { gameModule } from "../dataModule/GameModule";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MergeProgress extends cc.Component {

    @property(cc.Label)
    ulblTar: cc.Label = null;

    @property(cc.Node)
    uImgBar: cc.Node = null;

    onLoad() {
        this.uImgBar.width = 0;
        this.ulblTar.node.color = new cc.Color().fromHEX('#4b91e4');        
    }

    updateProress(): void {
        const totalW = 585;
        const tar = gameModule.getMaxValue();
        const tarW = Math.floor(tar / 15 * totalW);
        cc.tween(this.uImgBar)
            .to(0.3, { width: tarW }, { easing: cc.easing.cubicInOut })
            .start();
    }

}
