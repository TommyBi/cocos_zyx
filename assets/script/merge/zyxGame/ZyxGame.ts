import { playerModule } from "../dataModule/PlayerModule";
import { zyxGameModule } from "../dataModule/ZyxGameModule";
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

    private row: cc.Node[][] = [];

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
        this.moveUp();

        const newData = zyxGameModule.produce();
        const grids: cc.Node[] = [];
        for (let i = 0; i < 8; i++) {
            if (i === 0 || newData[i][0] !== newData[i - 1][0]) {
                const grid = await this.produceGrid(newData[i]);
                this.uBoxGrid.addChild(grid);
                grid.setPosition(new cc.Vec2(this.uBoxGrid.width / 8 * i, -84));
                grids.push(grid);
            }
        }

        this.row.push(grids);

        this.showNewGrids();
    }

    async produceGrid(gridInfo: number[]) {
        const grid = await uimanager.loadPrefab('prefab/zyx/uComGrid');
        const gridNode = cc.instantiate(grid);
        gridNode.getComponent(ZyxGridCom).init(gridInfo);
        return gridNode;
    }

    // 生成之前，先上移
    moveUp(): void {
        for (let i = 0; i < this.row.length; i++) {
            const grids = this.row[i];
            for (let j = 0; j < grids.length; j++) {
                const grid = grids[j];
                cc.tween(grid)
                    .to(0.5, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                    .start();
            }
        }
    }

    // 展示新格子
    showNewGrids(): void {
        const grids = this.row[this.row.length - 1];
        for (let i = 0; i < grids.length; i++) {
            const grid = grids[i];
            cc.tween(grid)
                .to(0.5, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                .start();
        }
    }
}
