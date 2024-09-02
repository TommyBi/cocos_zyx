import { playerModule } from "../dataModule/PlayerModule";
import { zyxGameModule } from "../dataModule/ZyxGameModule";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ZyxComTop extends cc.Component {

    @property(cc.Node)
    uImgExpBar: cc.Node = null;
    
    @property(cc.Label)
    ulblLv: cc.Label = null;

    @property(cc.Label)
    ulblExp: cc.Label = null;

    @property(cc.Node)
    uImgAvatar: cc.Node = null;

    @property(cc.Label)
    ulblDiamond: cc.Label = null; 

    @property(cc.Label)
    ulblStar: cc.Label = null;

    onLoad() {

    }

    start() {

    }

    init(): void {
        this.ulblStar.string = `${zyxGameModule.gameInfo.star}`;
        this.ulblLv.string = `${playerModule.lv}`;
        this.ulblExp.string = `${playerModule.exp}/${playerModule.expTar}`;
        this.ulblDiamond.string = `${playerModule.diamond}`;
        this.ulblStar.string = `${playerModule.star}`;
    }
}
