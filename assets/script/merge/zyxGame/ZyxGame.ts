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

    // 掉落发生情况（掉落需要自底向上检测，一轮检测后再检测下一轮，直到最终可以发生掉落的情况全部检测完毕）
    private hasDropAction: boolean = false;

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
            for (let col = 0; col < zyxGameModule.gridInfo[row].length; col++) {
                if (col === 0) {
                    if (zyxGameModule.gridInfo[row][col][1] !== gridContentType.EMPTY) {
                        const grid = await this.produceGrid(zyxGameModule.gridInfo[row][col]);
                        this.uBoxGrid.addChild(grid);
                        grid.setPosition(new cc.Vec2(this.gridsWidth * col, this.gridsWidth * (10 - row) - this.gridsWidth));
                        grid.getComponent(ZyxGridCom).setRowCel(row, col);
                        this.grids.push(grid);
                    }
                } else if (zyxGameModule.gridInfo[row][col][1] != gridContentType.EMPTY && zyxGameModule.gridInfo[row][col][2] !== zyxGameModule.gridInfo[row][col - 1][2]) {
                    const grid = await this.produceGrid(zyxGameModule.gridInfo[row][col]);
                    this.uBoxGrid.addChild(grid);
                    grid.setPosition(new cc.Vec2(this.gridsWidth * col, this.gridsWidth * (10 - row) - this.gridsWidth));
                    grid.getComponent(ZyxGridCom).setRowCel(row, col);
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
                    grid.setPosition(new cc.Vec2(this.gridsWidth * i, -84));
                    grid.getComponent(ZyxGridCom).setRowCel(row, i);
                    this.grids.push(grid);
                }
            } else if (zyxGameModule.gridInfo[row][i][1] != gridContentType.EMPTY && zyxGameModule.gridInfo[row][i][2] !== zyxGameModule.gridInfo[row][i - 1][2]) {
                const grid = await this.produceGrid(zyxGameModule.gridInfo[row][i]);
                this.uBoxGrid.addChild(grid);
                grid.setPosition(new cc.Vec2(this.gridsWidth * i, -84));
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

    merge(): void {
        
    }

    // 自动掉落与合并检测
    drop(row): void {
        if (row === 0) {
            if (this.hasDropAction) {
                this.hasDropAction = false;
                console.log('新一轮检测');
                this.drop(9);
            } else {
                this.merge();
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
        console.log('gridInfo over:', zyxGameModule.gridInfo);


        for (let i = 0; i < this.grids.length; i++) {
            const grid = this.grids[i];
            if (grid.getComponent(ZyxGridCom).uniqueId === uniqueID) {
                grid.getComponent(ZyxGridCom).setRowCel(row + 1, col);
                const tarY = this.gridsWidth * (10 - row - 1) - this.gridsWidth;
                cc.tween(grid)
                    .to(0.25, { y: tarY }, { easing: 'quartIn' })
                    .start();
            }
        }

        return canDrop;
    }
}
