import { playerModule } from "../dataModule/PlayerModule";
import { zyxGameModule } from "../dataModule/ZyxGameModule";
import { gridContentType } from "../define/TypeDefine";
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

    private grids: cc.Node[] = [];

    private gridsWidth: number = 84;

    onLoad() {
        this.initUI();

        this.uBoxGrid.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.uBoxGrid.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

        zyxGameModule.lock = false;
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

        this.initChessBoard();
    }

    // 初始化棋盘信息
    async initChessBoard() {
        for (let row = 0; row < zyxGameModule.gridInfo.length; row++) {
            for (let cel = 0; cel < zyxGameModule.gridInfo[row].length; cel++) {
                if (cel === 0) {
                    if (zyxGameModule.gridInfo[row][cel][1] !== gridContentType.EMPTY) {
                        const grid = await this.produceGrid(zyxGameModule.gridInfo[row][cel]);
                        this.uBoxGrid.addChild(grid);
                        grid.setPosition(new cc.Vec2(this.gridsWidth * cel, this.gridsWidth * (10 - row) - this.gridsWidth));
                        this.grids.push(grid);
                    }
                } else if (zyxGameModule.gridInfo[row][cel][1] != gridContentType.EMPTY && zyxGameModule.gridInfo[row][cel][2] !== zyxGameModule.gridInfo[row][cel - 1][2]) {
                    const grid = await this.produceGrid(zyxGameModule.gridInfo[row][cel]);
                    this.uBoxGrid.addChild(grid);
                    grid.setPosition(new cc.Vec2(this.gridsWidth * cel, this.gridsWidth * (10 - row) - this.gridsWidth));
                    this.grids.push(grid);
                }
            }
        }
    }

    onTouchStart(e: cc.Event): void {
        const posStart = e.currentTarget.getPosition();
        console.log('onTouchStart', posStart);
    }

    async onTouchEnd() {

        if (zyxGameModule.lock) return;
        zyxGameModule.lock = true;

        this.moveUp();

        this.produceRow();
    }

    // 生成新的一行
    async produceRow() {
        const newData = zyxGameModule.produce();
        zyxGameModule.gridInfo.push(newData);
        for (let i = 0; i < 8; i++) {
            if (i === 0 || newData[i][0] !== newData[i - 1][0]) {
                const grid = await this.produceGrid(newData[i]);
                this.uBoxGrid.addChild(grid);
                grid.setPosition(new cc.Vec2(this.uBoxGrid.width / 8 * i, -84));
                this.grids.push(grid);
            }
        }

        this.showNewGrids();

        this.dropAndCheckMerge();
    }

    // 自动掉落与合并检测
    dropAndCheckMerge(): void {

    }

    checkDrop(row, cel): boolean {
        return false
    }

    // 生成格子
    async produceGrid(gridInfo: number[]) {
        const grid = await uimanager.loadPrefab('prefab/zyx/uComGrid');
        const gridNode = cc.instantiate(grid);
        gridNode.getComponent(ZyxGridCom).init(gridInfo);
        return gridNode;
    }

    // 生成之前，先上移
    moveUp(): void {
        for (let i = 0; i < this.grids.length; i++) {
            const grids = this.grids[i];
            const grid = grids[i];
            cc.tween(grid)
                .to(0.5, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                .start();

        }
    }

    // 展示新格子
    showNewGrids(): void {
        // const grids = this.rows[this.rows.length - 1];
        // for (let i = 0; i < grids.length; i++) {
        //     const grid = grids[i];
        //     cc.tween(grid)
        //         .to(0.5, { y: grid.y + 84 }, { easing: 'cubicInOut' })
        //         .start();
        // }
    }
}
