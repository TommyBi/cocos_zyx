import { gridContentType, gridSize } from "../define/TypeDefine";
import NewUtils from "../util/NewUtils";

const { ccclass, property } = cc._decorator;

// 格子组件
@ccclass
export default class ZyxGridCom extends cc.Component {

    @property(cc.Node)
    uImgDiamond: cc.Node = null;

    @property(cc.Sprite)
    uImgBg: cc.Sprite = null;

    private size: gridSize = gridSize.ONE;
    private contentType: gridContentType = gridContentType.EMPTY;
    public uniqueId: number = 0;

    private row: number = -1;
    private col: number = -1;

    onLoad() { }

    start() { }

    init(info: [gridSize, gridContentType, number]) {
        this.uImgBg.node.width = 84 * info[0];
        this.uImgDiamond.x = this.uImgBg.node.width / 2;

        this.size = info[0];
        this.contentType = info[1];
        this.uniqueId = info[2];

        if (this.contentType === gridContentType.EMPTY) {
            this.node.active = false;
            return;
        }

        this.uImgDiamond.active = this.contentType === gridContentType.DIAMOND;

        const skinUrl = `images/grid/color_${NewUtils.randomIntInclusive(1, 13)}`;
        NewUtils.setSpriteFrameByUrl(this.uImgBg, skinUrl);
    }

    setRowCel(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    moveUp() {
        this.col -= 1;
    }
}
