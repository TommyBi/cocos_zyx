import { playerModule } from "../dataModule/PlayerModule";
import { zyxGameModule } from "../dataModule/ZyxGameModule";
import { LAYER } from "../define/TypeDefine";
import { uimanager } from "../manager/Uimanager";
import ZyxGridCom from "./ZyxGridCom";

const { ccclass, property } = cc._decorator;

// 游戏主玩法场景
@ccclass
export default class ZyxGame extends cc.Component {

    @property(cc.Label)
    ulblScore: cc.Label = null;

    @property(cc.Label)
    ulblDiamond: cc.Label = null;

    @property(cc.Label)
    ulblStarCnt: cc.Label = null;

    @property(cc.Label)
    ulblHammerCnt: cc.Label = null;

    @property(cc.Label)
    ulblBombCnt: cc.Label = null;

    @property(cc.Label)
    ulblAdCnt: cc.Label = null;

    @property(cc.Node)
    uImgStarBar: cc.Node = null;

    @property(cc.Node)
    uBtnHammer: cc.Node = null;

    @property(cc.Node)
    uBtnBomb: cc.Node = null;

    @property(cc.Node)
    uBtnClean: cc.Node = null;

    @property(cc.Node)
    uBoxGrid: cc.Node = null;

    onLoad() {
        this.initUI();

        this.uBoxGrid.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.uBoxGrid.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    start() {

    }

    initUI(): void {
        this.ulblScore.string = `${zyxGameModule.gameInfo.score}`;
        this.ulblDiamond.string = `${zyxGameModule.gameInfo.diamond}`;
        this.ulblStarCnt.string = `${zyxGameModule.gameInfo.star}`;
        this.ulblAdCnt.string = `(${zyxGameModule.gameInfo.adTimes})`;
        this.ulblHammerCnt.string = `${playerModule.hammer}`;
        this.ulblBombCnt.string = `${playerModule.bomb}`;
    }

    onTouchStart(e: cc.Event): void {
        const posStart = e.currentTarget.getPosition();
        console.log('onTouchStart', posStart);
    }

    async onTouchEnd() {
        const newData = zyxGameModule.produce();
        const grids = [];
        for (let i = 0; i < 8; i++) {
            if (i === 0 || newData[i][0] !== newData[i - 1][0]) {
                const grid = await this.produceGrid(newData[i]);
                this.uBoxGrid.addChild(grid);
                grid.setPosition(new cc.Vec2(this.uBoxGrid.width / 8 * i, 0));
            }
        }
    }

    async produceGrid(gridInfo: number[]) {
        const grid = await uimanager.loadPrefab('prefab/zyx/uComGrid');
        const gridNode = cc.instantiate(grid);
        gridNode.getComponent(ZyxGridCom).init(gridInfo);
        return gridNode;
    }

}
