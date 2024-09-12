import { playerModule } from "../dataModule/PlayerModule";
import { zyxGameModule } from "../dataModule/ZyxGameModule";
import { gridContentType } from "../define/TypeDefine";
import { EventType } from "../manager/Define";
import { uimanager } from "../manager/Uimanager";
import { eventManager, EventManager } from "../util/EventManager";
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

    // 掉落发生情况（掉落需要自底向上检测，一轮检测后再检测下一轮，直到最终可以发生掉落的情况全部检测完毕）
    private hasDropAction: boolean = false;

    // 是否已经生产了新的
    private hasProduce: boolean = false;

    onLoad() {
        this.initUI();

        this.uBtnClean.on(cc.Node.EventType.TOUCH_END, this.test, this);

        eventManager.on(EventType.ZYX_CHECK_MERGE, this.check, this);
        eventManager.on(EventType.ZYX_RESET_GAME, this.resetGame, this);
    }

    start() {

    }

    resetGame(): void {
        zyxGameModule.gridInfo = [
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [3, 1, 1], [3, 1, 1], [3, 1, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[1, 1, 2], [1, 1, 3], [1, 1, 4], [1, 1, 5], [1, 1, 6], [1, 1, 7], [1, 1, 8], [1, 1, 9]],
        ]

        this.initUI();
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
        this.uBoxGrid.destroyAllChildren();
        this.grids = [];

        for (let row = 0; row < zyxGameModule.gridInfo.length; row++) {
            for (let col = 0; col < zyxGameModule.gridInfo[row].length; col++) {
                if (col === 0) {
                    if (zyxGameModule.gridInfo[row][col][1] !== gridContentType.EMPTY) {
                        const grid = await this.produceGrid(zyxGameModule.gridInfo[row][col]);
                        this.uBoxGrid.addChild(grid);
                        grid.setPosition(new cc.Vec2(zyxGameModule.gridsWidth * col, zyxGameModule.gridsWidth * (10 - row) - zyxGameModule.gridsWidth));
                        grid.getComponent(ZyxGridCom).setRowCel(row, col);
                        this.grids.push(grid);
                    }
                } else if (zyxGameModule.gridInfo[row][col][1] != gridContentType.EMPTY && zyxGameModule.gridInfo[row][col][2] !== zyxGameModule.gridInfo[row][col - 1][2]) {
                    const grid = await this.produceGrid(zyxGameModule.gridInfo[row][col]);
                    this.uBoxGrid.addChild(grid);
                    grid.setPosition(new cc.Vec2(zyxGameModule.gridsWidth * col, zyxGameModule.gridsWidth * (10 - row) - zyxGameModule.gridsWidth));
                    grid.getComponent(ZyxGridCom).setRowCel(row, col);
                    this.grids.push(grid);
                }
            }
        }
    }

    produce() {
        this.moveUp();

        this.produceRow();
    }

    // 生成新的一行
    async produceRow() {
        // 剔除顶部空余的一行
        zyxGameModule.gridInfo.shift();

        // 生成新的一行数据
        const newData = zyxGameModule.produce();
        zyxGameModule.gridInfo.push(newData);
        for (let i = 0; i < 8; i++) {
            const row = 9;
            if (i === 0) {
                if (zyxGameModule.gridInfo[row][i][1] !== gridContentType.EMPTY) {
                    const grid = await this.produceGrid(zyxGameModule.gridInfo[row][i]);
                    this.uBoxGrid.addChild(grid);
                    grid.setPosition(new cc.Vec2(zyxGameModule.gridsWidth * i, -84));
                    grid.getComponent(ZyxGridCom).setRowCel(row, i);
                    this.grids.push(grid);
                }
            } else if (zyxGameModule.gridInfo[row][i][1] != gridContentType.EMPTY && zyxGameModule.gridInfo[row][i][2] !== zyxGameModule.gridInfo[row][i - 1][2]) {
                const grid = await this.produceGrid(zyxGameModule.gridInfo[row][i]);
                this.uBoxGrid.addChild(grid);
                grid.setPosition(new cc.Vec2(zyxGameModule.gridsWidth * i, -84));
                grid.getComponent(ZyxGridCom).setRowCel(row, i);
                this.grids.push(grid);
            }
        }

        // 展示新格子
        this.showNewGrids();
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
            const grid = this.grids[i];
            cc.tween(grid)
                .to(0.5, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                .start();

            grid.getComponent(ZyxGridCom).moveUp();
        }
    }

    // 展示新格子
    showNewGrids(): void {
        let showEnding: boolean = false;
        for (let i = 0; i < this.grids.length; i++) {
            const grid = this.grids[i];
            if (grid.y !== -84) continue;
            cc.tween(grid)
                .to(0.5, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                .call(() => {
                    if (showEnding) return;
                    showEnding = true;
                    this.hasDropAction = false;
                    this.drop(9);
                })
                .start();
        }
    }

    // 循环检测是否可以掉落和消除
    check(): void {
        this.hasProduce = false;
        this.drop(9);
    }

    // 进行合成操作
    merge(): void {
        let mergeTimes = 0;
        // 检测每一行是否有可以消除的格子
        for (let row = 0; row < zyxGameModule.gridInfo.length; row++) {
            const rowData = zyxGameModule.gridInfo[row];
            let hasEmptyGrid = false;
            for (let j = 0; j < rowData.length; j++) {
                if (rowData[j][1] === gridContentType.EMPTY) {
                    hasEmptyGrid = true;
                    break;
                }
            }

            // 如果没有空格子，那就可以进行消除
            const uniqueIds = [];
            if (!hasEmptyGrid) {
                mergeTimes++;
                for (let j = 0; j < rowData.length; j++) {
                    if (uniqueIds.indexOf(rowData[j][2]) === -1 && rowData[j][2] !== 0) {
                        uniqueIds.push(rowData[j][2]);
                    }

                    zyxGameModule.gridInfo[row][j] = [0, 0, 0];
                }
            }

            // 消除
            for (let i = 0; i < uniqueIds.length; i++) {
                const uniqueId = uniqueIds[i];
                this.eliminateGrid(uniqueId);
            }
        }

        if (mergeTimes > 0) {
            uimanager.showTips('發生消除');
            this.addScore(mergeTimes);
            this.drop(9);
        } else {
            const isGameOver = this.checkGameOver();
            if (!isGameOver && !this.hasProduce) {
                this.hasProduce = true;
                this.produce();
            } else {
                zyxGameModule.selectGirdUniqueId = -1;
                console.log('action over:', zyxGameModule.gridInfo);
            }
        }
    }

    // 消除
    eliminateGrid(uniqueID: number): void {
        for (let i = 0; i < this.grids.length; i++) {
            if (this.grids[i].getComponent(ZyxGridCom).uniqueId === uniqueID) {
                console.log('消除', uniqueID);
                this.grids[i].getComponent(ZyxGridCom).eliminate();
                this.grids.splice(i, 1);
                break;
            }
        }
    }

    // 检测当前行的上一行是否有掉落情况，如果有则进行掉落操作
    drop(row): void {
        if (row === 0) {
            if (this.hasDropAction) {
                this.hasDropAction = false;
                console.log('新一轮检测');
                this.drop(9);
            } else {
                setTimeout(() => {
                    this.merge();
                }, 400);
            }
            return;
        }

        for (let col = 0; col < 8; col++) {
            if (zyxGameModule.gridInfo[row][col][1] === gridContentType.EMPTY && zyxGameModule.gridInfo[row - 1][col][1] !== gridContentType.EMPTY) {
                // 检测是否可以掉落
                const hasDrop = this.dropGrid(row - 1, col);
                if (hasDrop) {
                    this.hasDropAction = true;
                }
                continue;
            }
        }

        this.drop(row - 1);
    }

    dropGrid(row: number, col: number): boolean {
        // 检测对应的空格子是否可以容纳掉下来的格子类型
        const uniqueID = zyxGameModule.gridInfo[row][col][2];
        const checkCols = [];
        for (let i = 0; i < 8; i++) {
            if (zyxGameModule.gridInfo[row][i][2] === uniqueID) {
                checkCols.push(i);
            }
        }

        let canDrop = true;
        for (let i = 0; i < checkCols.length; i++) {
            const col = checkCols[i];
            if (zyxGameModule.gridInfo[row + 1][col][1] !== gridContentType.EMPTY) {
                canDrop = false;
                return false;
            }
        }

        // 如果可以掉落，那就将数据进行交换，同时更新格子的自身属性和位置信息
        for (let i = 0; i < checkCols.length; i++) {
            const col = checkCols[i];
            zyxGameModule.gridInfo[row + 1][col][0] = zyxGameModule.gridInfo[row][col][0];
            zyxGameModule.gridInfo[row + 1][col][1] = zyxGameModule.gridInfo[row][col][1];
            zyxGameModule.gridInfo[row + 1][col][2] = zyxGameModule.gridInfo[row][col][2];

            zyxGameModule.gridInfo[row][col][0] = 0;
            zyxGameModule.gridInfo[row][col][1] = gridContentType.EMPTY;
            zyxGameModule.gridInfo[row][col][2] = 0;
        }

        console.log('掉落:', uniqueID);

        for (let i = 0; i < this.grids.length; i++) {
            const grid = this.grids[i];
            if (grid.getComponent(ZyxGridCom).uniqueId === uniqueID) {
                grid.getComponent(ZyxGridCom).moveDown();
                const tarY = zyxGameModule.gridsWidth * (10 - row - 1) - zyxGameModule.gridsWidth;
                cc.tween(grid)
                    .to(0.2, { y: tarY }, { easing: 'quartIn' })
                    .start();
            }
        }

        return canDrop;
    }

    // 检验是否结束
    checkGameOver(): boolean {
        if (zyxGameModule.checkGameOver()) {
            uimanager.showGameOver();
            return true;
        }
        return false;
    }

    // 加分
    addScore(score: number): void {
        zyxGameModule.gameInfo.score += score;
        this.ulblScore.string = zyxGameModule.gameInfo.score.toString();
    }

    test(): void {
        console.log(zyxGameModule.gridInfo);
    }
}
