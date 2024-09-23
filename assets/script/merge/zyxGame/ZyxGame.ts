import { playerModule } from "../dataModule/PlayerModule";
import { zyxGameModule } from "../dataModule/ZyxGameModule";
import { gridContentType } from "../define/TypeDefine";
import { audioMgr, SHAKE_TYPE, SoundType } from "../manager/AudioMgr";
import { EventType } from "../manager/Define";
import { uimanager } from "../manager/Uimanager";
import { eventManager } from "../util/EventManager";
import ZyxGridCom from "./ZyxGridCom";
import ZyxLineCom from "./ZyxLineCom";


const { ccclass, property } = cc._decorator;

// 游戏主玩法场景
@ccclass
export default class ZyxGame extends cc.Component {

    @property(cc.Label)
    ulblScore: cc.Label = null;

    @property(cc.Label)
    ulblMaxScore: cc.Label = null;

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

    @property(cc.Node)
    uBoxNew: cc.Node = null;

    private grids: cc.Node[] = [];

    // 掉落发生情况（掉落需要自底向上检测，一轮检测后再检测下一轮，直到最终可以发生掉落的情况全部检测完毕）
    private hasDropAction: boolean = false;

    // 是否已经生产了新的 - 防止进行无限循环生成和检测
    private hasProduce: boolean = false;

    // 格子掉落时间
    private timeGridDrop: number = 0.2;
    private timeWaitDrop: number = 600;
    private timeShowNewGrids: number = 0.44;

    // star bar totalLength
    private starBarLength: number = 500;
    // 
    private starMeasures: number = 10;

    onLoad() {
        this.uBtnClean.on(cc.Node.EventType.TOUCH_END, this.test, this);

        eventManager.on(EventType.ZYX_CHECK_MERGE, this.check, this);
        eventManager.on(EventType.ZYX_RESET_GAME, this.resetGame, this);

        this.initUI();
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
            [[1, 1, 2], [1, 1, 3], [1, 1, 4], [1, 1, 5], [1, 1, 6], [1, 1, 7], [1, 1, 8], [0, 0, 0]],
        ]
        zyxGameModule.gameInfo = {
            score: 0,
            star: 0,
            diamond: 0,
            adTimes: 3,
            exp: 0,
            uniqueId: 9,
        }

        this.updateNextGrid();

        this.hasProduce = false;
        zyxGameModule.selectGirdUniqueId = -1;

        this.initUI();

        console.log('gridInfo: ', zyxGameModule.gridInfo);
    }

    initUI(): void {
        this.ulblScore.string = `${zyxGameModule.gameInfo.score}`;
        this.ulblMaxScore.string = `BEST：${zyxGameModule.scoreRecord}`;
        this.ulblMaxScore.node.active = zyxGameModule.scoreRecord > 0;
        this.ulblDiamond.string = `${zyxGameModule.gameInfo.diamond}`;
        this.ulblStarCnt.string = `${zyxGameModule.gameInfo.star}`;
        this.ulblAdCnt.string = `(${zyxGameModule.gameInfo.adTimes})`;
        this.ulblHammerCnt.string = `x${playerModule.hammer}`;
        this.ulblBombCnt.string = `x${playerModule.bomb}`;
        this.uImgStarBar.width = zyxGameModule.gameInfo.score % this.starMeasures * this.starBarLength / this.starMeasures;

        this.initChessBoard();

        setTimeout(() => {
            audioMgr.playBGM(SoundType.ZYX_MUSIC_GAME);
        }, 1000);
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

    // 加载下一行
    loadNext() {
        this.moveUp();

        this.produceRow();
    }

    // 生成新的一行
    async produceRow() {
        // 剔除顶部空余的一行
        zyxGameModule.gridInfo.shift();

        // 将新的一排的数据进行拷贝并使用
        const newData = zyxGameModule.copyNewGridData();

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

    // 展示新格子
    showNewGrids(): void {
        let showEnding: boolean = false;
        for (let i = 0; i < this.grids.length; i++) {
            const grid = this.grids[i];
            if (grid.y !== -84) continue;
            cc.tween(grid)
                .to(this.timeShowNewGrids, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                .call(() => {
                    if (showEnding) return;
                    showEnding = true;

                    // 下一排展示完成，开始检测是否可以进行合成
                    this.check();
                })
                .start();
        }

        this.updateNextGrid();
    }

    // 生成之前，先上移
    moveUp(): void {
        for (let i = 0; i < this.grids.length; i++) {
            const grid = this.grids[i];
            cc.tween(grid)
                .to(this.timeShowNewGrids, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                .start();

            grid.getComponent(ZyxGridCom).moveUp();
        }
    }

    // 刷新下一层格子的信息
    async updateNextGrid() {
        // 数据刷新
        zyxGameModule.produce();

        // 展示刷新
        this.uBoxNew.destroyAllChildren();
        for (let i = 0; i < 8; i++) {
            if (i === 0) {
                if (zyxGameModule.nextGridInfo[i][1] !== gridContentType.EMPTY) {
                    const line = await this.produceNewLine(zyxGameModule.nextGridInfo[i][0]);
                    this.uBoxNew.addChild(line);
                    line.setPosition(new cc.Vec2(zyxGameModule.gridsWidth * i, 0));
                }
            } else if (zyxGameModule.nextGridInfo[i][1] != gridContentType.EMPTY && zyxGameModule.nextGridInfo[i][2] !== zyxGameModule.nextGridInfo[i - 1][2]) {
                const line = await this.produceNewLine(zyxGameModule.nextGridInfo[i][0]);
                this.uBoxNew.addChild(line);
                line.setPosition(new cc.Vec2(zyxGameModule.gridsWidth * i, 0));
            }
        }
    }

    async produceNewLine(size: number) {
        const line = await uimanager.loadPrefab('prefab/zyx/uComNextLine');
        const node = cc.instantiate(line);
        node.getComponent(ZyxLineCom).setW(size * zyxGameModule.gridsWidth);
        return node;
    }

    // 循环检测是否可以掉落和消除
    check(): void {
        this.drop(9);
    }

    // 进行合成操作 - 合成操作是一轮消除检测的最后一个动作
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
            uimanager.showTips('發生消除，持续下一轮检测');
            audioMgr.shake(SHAKE_TYPE.HEAVY);
            this.addScore(mergeTimes);
            this.check();
        } else {
            const isGameOver = this.checkGameOver();
            const isGridEmpty = this.checkGridEmpty();

            if (isGameOver) return;

            if (!this.hasProduce) {
                // 没有可以进行消除的了，并且还未展示新生成的一排，则展示下一排
                this.hasProduce = true;
                this.loadNext();
                uimanager.showTips('展示下一行');
            } else if (isGridEmpty) {
                // 新生成的已经展示了，且没有可合成，且场上没有棋子
                this.hasProduce = true;
                this.loadNext();
                uimanager.showTips('棋盘为空，展示下一行');
            } else {
                // 新生成的一排已经展示过了，且已经没有可合成，且场上还有棋子
                this.hasProduce = false;
                zyxGameModule.selectGirdUniqueId = -1;
                console.log('action over:', zyxGameModule.gridInfo);
            }
        }
    }

    // 当前场景中是否已经为空
    checkGridEmpty(): boolean {
        let isEmpty = true;
        for (let i = 0; i < zyxGameModule.gridInfo[9].length; i++) {
            const gridData = zyxGameModule.gridInfo[9][i];
            if (gridData[1] !== gridContentType.EMPTY) {
                isEmpty = false;
                break;
            }
        }
        return isEmpty;
    }

    // 消除
    eliminateGrid(uniqueID: number): void {
        for (let i = 0; i < this.grids.length; i++) {
            if (this.grids[i].getComponent(ZyxGridCom).uniqueId === uniqueID) {
                console.log('消除', uniqueID);
                this.collectGoods(this.grids[i].getComponent(ZyxGridCom).contentType);
                this.grids[i].getComponent(ZyxGridCom).eliminate();
                this.grids.splice(i, 1);
                break;
            }
        }
    }

    collectGoods(contentType): void {
        if (contentType === gridContentType.DIAMOND) {
            this.addDimaond();
        }
    }

    // 检测当前行的上一行是否有掉落情况，如果有则进行掉落操作
    drop(row): void {
        if (row === 9) {
            this.hasDropAction = false;
        }

        if (row === 0) {
            if (this.hasDropAction) {
                console.log('持续掉落检测');
                audioMgr.playSound(SoundType.ZYX_DROP);
                this.check();
            } else {
                setTimeout(() => {
                    this.merge();
                }, this.timeWaitDrop);
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
                    .to(this.timeGridDrop, { y: tarY }, { easing: 'quartIn' })
                    .start();
            }
        }

        return canDrop;
    }

    // 检验是否结束
    checkGameOver(): boolean {
        if (zyxGameModule.checkGameOver()) {
            uimanager.showGameOver();
            audioMgr.stopBGM();
            audioMgr.shake(SHAKE_TYPE.HEAVY);
            audioMgr.playSound(SoundType.ZYX_END);
            return true;
        }
        return false;
    }

    // 加分
    addScore(score: number): void {
        // 当前分数
        zyxGameModule.gameInfo.score += score;
        this.ulblScore.string = zyxGameModule.gameInfo.score.toString();

        // 最高分更新
        if (zyxGameModule.gameInfo.score >= zyxGameModule.scoreRecord) {
            zyxGameModule.scoreRecord = zyxGameModule.gameInfo.score;
            this.ulblMaxScore.string = `BEST：${zyxGameModule.scoreRecord}`;
            this.ulblMaxScore.node.active = true;
        }

        // 星星
        const tarW = zyxGameModule.gameInfo.score % this.starMeasures * this.starBarLength / this.starMeasures;
        cc.tween(this.uImgStarBar)
            .to(0.5, { width: tarW })
            .start();
        if (tarW === 0) {
            // 星星数量+1   
            zyxGameModule.gameInfo.star += 1;
            this.ulblStarCnt.string = zyxGameModule.gameInfo.star.toString();
        }

    }

    // 加钻
    addDimaond(): void {
        zyxGameModule.gameInfo.diamond += 1;
        this.ulblDiamond.string = zyxGameModule.gameInfo.diamond.toString();
    }

    test(): void {
        console.log(zyxGameModule.gridInfo);
    }
}
