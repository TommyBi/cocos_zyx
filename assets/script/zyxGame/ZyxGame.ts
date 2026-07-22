import { playerModule } from "../dataModule/PlayerModule";
import { zyxGameModule } from "../dataModule/ZyxGameModule";
import { GRID_WIDTH, gridContentType } from "../define/TypeDefine";
import { audioMgr, SHAKE_TYPE, SoundType } from "../manager/AudioMgr";
import { EventType } from "../manager/Define";
import { uimanager } from "../manager/Uimanager";
import { eventManager } from "../util/EventManager";
import { Logger } from "../util/logger";
import NewUtils from "../util/NewUtils";
import { wxApiManager } from "../util/WxApiManager";
import ZyxGridCom from "./ZyxGridCom";
import ZyxLineCom from "./ZyxLineCom";
import ZyxComTop from "./ZyxComTop";


const { ccclass, property } = cc._decorator;

// 游戏主玩法场景
@ccclass
export default class ZyxGame extends cc.Component {

    @property(cc.Node)
    uImgBg: cc.Node = null;

    @property(cc.Label)
    ulblScore: cc.Label = null;

    @property(cc.Label)
    ulblMaxScore: cc.Label = null;

    @property(cc.Label)
    ulblFlowerCnt: cc.Label = null;

    @property(cc.Label)
    ulblHammerCnt: cc.Label = null;

    @property(cc.Label)
    ulblBombCnt: cc.Label = null;

    @property(cc.Label)
    ulblAdCnt: cc.Label = null;

    @property(cc.Node)
    uImgFlowerBar: cc.Node = null;

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

    @property(cc.Node)
    uImgSelectedBg: cc.Node = null;

    private grids: cc.Node[] = [];

    // 掉落发生情况
    private hasDropAction: boolean = false;

    // 是否已经生产了新的 - 防止进行无限循环生成和检测
    private hasProduce: boolean = false;

    // 格子掉落时间
    private timeGridDrop: number = 0.2;
    private timeWaitDrop: number = 300;
    private timeShowNewGrids: number = 0.44;

    // Flower bar totalLength
    private flowerBarLength: number = 500;

    // 一颗花朵对应的层数
    private flowerMeasures: number = 100;
    private comboTimes: number = 0;
    private hammerColorIndex: number = 1;
    private isRescueShowing: boolean = false;
    private lastRescueAt: number = 0;
    private rescueCooldownMs: number = 60 * 1000;
    private gameHud: cc.Node = null;
    private difficultyBadge: cc.Node = null;
    private difficultyLabel: cc.Label = null;
    private lastShownDifficulty: number = 1;
    private drillToolButton: cc.Node = null;
    private drillCountLabel: cc.Label = null;
    private drillProgressRoot: cc.Node = null;
    private drillProgressFill: cc.Node = null;
    private drillProgressIcon: cc.Node = null;
    private drillColorTip: cc.Node = null;
    private drillProgressWidth: number = 456;
    private currentDrillProgressWidth: number = 0;

    // 锤子消除动画时长
    private static HAMMER_ELIMINATE_DURATION = 0.28;

    onLoad() {
        if (this.uBtnClean) this.uBtnClean.on(cc.Node.EventType.TOUCH_END, this.openSettings, this);
        if (this.uBtnHammer) this.uBtnHammer.on(cc.Node.EventType.TOUCH_END, this.useHammer, this);

        eventManager.on(EventType.ZYX_CHECK_MERGE, this.check, this);
        eventManager.on(EventType.ZYX_RESET_GAME, this.resetGame, this);
        eventManager.on(EventType.ZYX_MOVE_GRID, this.moveGrid, this);

        this.initUI();
    }

    onDestroy(): void {
        eventManager.off(EventType.ZYX_CHECK_MERGE, this.check, this);
        eventManager.off(EventType.ZYX_RESET_GAME, this.resetGame, this);
        eventManager.off(EventType.ZYX_MOVE_GRID, this.moveGrid, this);
        uimanager.hideGmEntry();
        if (this.drillColorTip) this.drillColorTip.destroy();
    }

    start() {
    }

    resetGame(): void {
        zyxGameModule.resetRound();
        this.comboTimes = 0;
        this.hasProduce = false;
        this.isRescueShowing = false;
        if (this.drillColorTip) {
            this.drillColorTip.destroy();
            this.drillColorTip = null;
        }

        this.initUI();
    }

    initUI(): void {
        // 将场景节点高与舞台可见高保持一致
        this.node.height = cc.winSize.height;
        this.uImgBg.height = this.node.height;

        this.ulblScore.string = `${zyxGameModule.gameInfo.score}`;
        this.ulblMaxScore.string = `${zyxGameModule.scoreRecord}`;
        this.ulblMaxScore.node.active = zyxGameModule.scoreRecord > 0;
        this.ulblFlowerCnt.string = `${zyxGameModule.gameInfo.flower}`;
        this.ulblAdCnt.string = `(${zyxGameModule.gameInfo.adTimes})`;
        this.ulblHammerCnt.string = `x${playerModule.hammer}`;
        if (this.ulblBombCnt) this.ulblBombCnt.node.active = false;
        if (this.uBtnBomb) this.uBtnBomb.active = false;

        this.uImgSelectedBg.active = false;
        this.layoutGameBoard();
        this.layoutToolButtons();
        this.buildGameHud();
        uimanager.showGmEntry(() => this.openGmPanel());

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
        this.refreshHammerView();
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
                    grid.setPosition(new cc.Vec2(zyxGameModule.gridsWidth * i, -GRID_WIDTH));
                    grid.getComponent(ZyxGridCom).setRowCel(row, i);
                    this.grids.push(grid);
                }
            } else if (zyxGameModule.gridInfo[row][i][1] != gridContentType.EMPTY && zyxGameModule.gridInfo[row][i][2] !== zyxGameModule.gridInfo[row][i - 1][2]) {
                const grid = await this.produceGrid(zyxGameModule.gridInfo[row][i]);
                this.uBoxGrid.addChild(grid);
                grid.setPosition(new cc.Vec2(zyxGameModule.gridsWidth * i, -GRID_WIDTH));
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
            if (grid.y !== -GRID_WIDTH) continue;
            cc.tween(grid)
                .to(this.timeShowNewGrids, { y: grid.y + GRID_WIDTH }, { easing: 'cubicInOut' })
                .call(() => {
                    if (showEnding) return;
                    showEnding = true;
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
                .to(this.timeShowNewGrids, { y: grid.y + GRID_WIDTH }, { easing: 'cubicInOut' })
                .start();
            grid.getComponent(ZyxGridCom).moveUp();
        }
    }

    // 刷新下一层格子的信息
    async updateNextGrid() {
        const serverProduced = await zyxGameModule.produceByServer(playerModule.token, this.comboTimes);
        if (!serverProduced) {
            zyxGameModule.produce(this.comboTimes);
        }
        this.showDifficultyEvent();

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

        zyxGameModule.recordMergeResult(mergeTimes);

        if (mergeTimes > 0) {
            audioMgr.playSound(SoundType.ZYX_MERGE);
            audioMgr.shake(SHAKE_TYPE.HEAVY);
            this.addScore(mergeTimes);
            this.check();
        } else {
            this.comboTimes = 0;
            if (this.tryShowRescue()) return;

            const isGameOver = this.checkGameOver();
            const isGridEmpty = this.checkGridEmpty();

            if (isGameOver) return;

            if (!this.hasProduce) {
                this.hasProduce = true;
                this.loadNext();
            } else if (isGridEmpty) {
                this.hasProduce = true;
                this.loadNext();
            } else {
                this.hasProduce = false;
                zyxGameModule.selectGirdUniqueId = -1;
                this.refreshHammerView();
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

    // 消除单个格子节点
    eliminateGrid(uniqueID: number): void {
        for (let i = 0; i < this.grids.length; i++) {
            if (this.grids[i].getComponent(ZyxGridCom).uniqueId === uniqueID) {
                this.collectGoods(this.grids[i].getComponent(ZyxGridCom).contentType, this.grids[i]);
                this.grids[i].getComponent(ZyxGridCom).eliminate();
                this.grids.splice(i, 1);
                break;
            }
        }
    }

    // 收集物品
    collectGoods(contentType, sourceNode?: cc.Node): void {
        if (contentType === gridContentType.DRILL_FRAGMENT) {
            this.playDrillFragmentFly(sourceNode);
        }
    }

    // 检测当前行的上一行是否有掉落情况，如果有则进行掉落操作
    drop(row): void {
        if (row === 9) {
            this.hasDropAction = false;
        }

        if (row === 0) {
            if (this.hasDropAction) {
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

        // 数据交换
        for (let i = 0; i < checkCols.length; i++) {
            const col = checkCols[i];
            zyxGameModule.gridInfo[row + 1][col][0] = zyxGameModule.gridInfo[row][col][0];
            zyxGameModule.gridInfo[row + 1][col][1] = zyxGameModule.gridInfo[row][col][1];
            zyxGameModule.gridInfo[row + 1][col][2] = zyxGameModule.gridInfo[row][col][2];
            if (zyxGameModule.gridInfo[row][col][3] !== undefined) {
                zyxGameModule.gridInfo[row + 1][col][3] = zyxGameModule.gridInfo[row][col][3];
            } else if (zyxGameModule.gridInfo[row + 1][col].length > 3) {
                zyxGameModule.gridInfo[row + 1][col].length = 3;
            }

            zyxGameModule.gridInfo[row][col][0] = 0;
            zyxGameModule.gridInfo[row][col][1] = gridContentType.EMPTY;
            zyxGameModule.gridInfo[row][col][2] = 0;
            if (zyxGameModule.gridInfo[row][col].length > 3) zyxGameModule.gridInfo[row][col].length = 3;
        }

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
            playerModule.submitScore(zyxGameModule.gameInfo.score);
            uimanager.showGameOver();
            audioMgr.stopBGM();
            audioMgr.shake(SHAKE_TYPE.HEAVY);
            audioMgr.playSound(SoundType.ZYX_END);
            return true;
        }
        return false;
    }

    // 加分：每消除1排得2分，多排 2n*2，再乘以连消次数
    addScore(mergeRows: number): void {
        this.comboTimes++;
        // 基础分：1排=2分，n排=2n*2
        const baseScore = mergeRows === 1 ? 2 : mergeRows * 2 * 2;
        // 连消加成
        const addScore = baseScore * this.comboTimes;

        zyxGameModule.gameInfo.score += addScore;
        const difficultyChanged = zyxGameModule.refreshDifficultyByScore();
        this.ulblScore.string = zyxGameModule.gameInfo.score.toString();
        this.showFloatingScore(addScore);
        this.updateDifficultyHud(difficultyChanged);
        if (difficultyChanged) uimanager.showTips(`难度提升到 ${zyxGameModule.gameInfo.difficultyLevel}`);

        // 同步顶部栏分数显示
        const scene = cc.director.getScene();
        if (scene) {
            const topCom = scene.getChildByName('Canvas')?.getChildByName('ui')?.getChildByName('uComTop');
            if (topCom) {
                const topScript = topCom.getComponent(ZyxComTop);
                if (topScript) topScript.updateScore(zyxGameModule.gameInfo.score);
            }
        }

        // 最高分更新
        if (zyxGameModule.gameInfo.score >= zyxGameModule.scoreRecord) {
            zyxGameModule.scoreRecord = zyxGameModule.gameInfo.score;
            this.ulblMaxScore.string = `${zyxGameModule.scoreRecord}`;
            this.ulblMaxScore.node.active = true;
            // 同步顶部栏最高分
            const scene2 = cc.director.getScene();
            if (scene2) {
                const topCom2 = scene2.getChildByName('Canvas')?.getChildByName('ui')?.getChildByName('uComTop');
                if (topCom2) {
                    const topScript2 = topCom2.getComponent(ZyxComTop);
                    if (topScript2) topScript2.updateBest(zyxGameModule.scoreRecord);
                }
            }
        }

        this.updateDrillProgress(false);
    }

    // 移动格子中，提示当前移动的位置
    moveGrid(e): void {
        this.uImgSelectedBg.active = e.data.action === 'move';
        const gridGlobalPos = e.data.node.parent.convertToWorldSpaceAR(e.data.node.getPosition());
        this.uImgSelectedBg.x = this.node.convertToNodeSpaceAR(gridGlobalPos).x;
        this.uImgSelectedBg.width = e.data.node.width;
    }

    openSettings(): void {
        uimanager.showSettings(
            () => this.resetGame(),
            () => eventManager.dispatch(EventType.ZYX_BACK_HOME),
        );
    }

    openGmPanel(): void {
        uimanager.showGmPanel({
            onAddHammer: (count: number) => {
                playerModule.hammer += count;
                this.ulblHammerCnt.string = `x${playerModule.hammer}`;
                this.refreshHammerView();
            },
            onAddDrill: (count: number) => {
                playerModule.drill += count;
                this.refreshDrillTool();
            },
            onClearRows: () => {
                this.clearBottomRowsByAd(5);
            },
            getStats: () => {
                const state = zyxGameModule.difficultyState;
                const largeRatio = Math.round((state.largeCellRatio || 0) * 100);
                return `锤子 x${playerModule.hammer}  电钻 x${playerModule.drill}\n难度 ${state.level || 1}  堆叠 ${state.stackHeight || 0}/10  大块 ${largeRatio}%`;
            },
        });
    }

    // ======== 锤子道具：消除所有指定颜色的色块 ========
    useHammer(): void {
        if (zyxGameModule.selectGirdUniqueId !== -1) return;
        if (playerModule.hammer <= 0) {
            uimanager.showTips('锤子不足');
            return;
        }

        const uniqueIds = this.getUniqueIdsBySkin(this.hammerColorIndex);
        if (uniqueIds.length === 0) {
            this.refreshHammerView();
            uimanager.showTips('场上没有这个颜色');
            return;
        }

        playerModule.hammer--;
        this.ulblHammerCnt.string = `x${playerModule.hammer}`;

        // 锤子消除：短促淡出，后续再触发自然掉落
        audioMgr.playSound(SoundType.ZYX_HAMMER);
        audioMgr.shake(SHAKE_TYPE.MEDIUM);
        this.clearUniqueIds(uniqueIds, ZyxGame.HAMMER_ELIMINATE_DURATION);

        setTimeout(() => {
            this.refreshHammerView();
            this.check();
        }, ZyxGame.HAMMER_ELIMINATE_DURATION * 1000 + 100);
    }

    private layoutToolButtons(): void {
        const toolY = -cc.winSize.height / 2 + 185;
        if (this.uBtnHammer) {
            this.uBtnHammer.active = true;
            this.uBtnHammer.setPosition(-105, toolY);
        }
        if (this.uBtnClean) {
            this.uBtnClean.active = false;
        }
        if (this.uBtnBomb) this.uBtnBomb.active = false;
        this.buildDrillTool(toolY);
    }

    private layoutGameBoard(): void {
        const H = cc.winSize.height;
        const boardW = 672;
        const boardH = 840;
        const boardLeft = -boardW / 2;
        const boardTop = Math.min(H / 2 - 245, 430);
        const boardBottom = boardTop - boardH;

        const gridBg = this.node.getChildByName('uBoxGridBg');
        if (gridBg) gridBg.setPosition(boardLeft - 4, boardBottom - 4);
        if (this.uBoxGrid) this.uBoxGrid.setPosition(boardLeft, boardBottom);
        if (this.uImgSelectedBg) this.uImgSelectedBg.setPosition(0, boardBottom + boardH / 2);
        if (this.uBoxNew) this.uBoxNew.setPosition(boardLeft, boardBottom - 10);

        const progressBg = this.node.getChildByName('uImgFlowerBarBg');
        const progressPanel = this.node.getChildByName('img_common_tilte_bg');
        const flowerNode = this.node.getChildByName('uImgFlower');
        const progressY = boardBottom - 62;
        if (progressPanel) progressPanel.active = false;
        if (progressBg) progressBg.active = false;
        if (flowerNode) flowerNode.active = false;
        if (this.uImgFlowerBar) this.uImgFlowerBar.active = false;
        this.buildDrillProgress(progressY);

        this.hideLegacyHud();
    }

    private hideLegacyHud(): void {
        const scoreNode = this.node.getChildByName('uNodeScore');
        if (scoreNode) scoreNode.active = false;

        const orderTip = this.node.children.find((child) => {
            const label = child.getComponent(cc.Label);
            return label && label.string.indexOf('完成订单') !== -1;
        });
        if (orderTip) orderTip.active = false;
    }

    private buildDrillProgress(y: number): void {
        if (this.drillProgressRoot) this.drillProgressRoot.destroy();

        const root = new cc.Node('drillProgressRoot');
        root.width = 620;
        root.height = 68;
        root.setAnchorPoint(0.5, 0.5);
        root.setPosition(0, y);
        root.zIndex = 18;
        this.node.addChild(root);
        this.drillProgressRoot = root;

        uimanager.createRect(root, 'drillPanel', 600, 56, new cc.Color(246, 249, 255), 245, 10, 10, 0);
        uimanager.createRect(root, 'drillBarBg', this.drillProgressWidth, 26, new cc.Color(52, 23, 13), 245, 13, 34, 0);

        const fill = new cc.Node('drillBarFill');
        fill.width = this.drillProgressWidth;
        fill.height = 22;
        fill.setAnchorPoint(0, 0.5);
        fill.setPosition(34 - this.drillProgressWidth / 2, 0);
        root.addChild(fill);
        this.drillProgressFill = fill;

        const icon = new cc.Node('drillProgressIcon');
        icon.width = 58;
        icon.height = 58;
        icon.setAnchorPoint(0.5, 0.5);
        icon.setPosition(34 - this.drillProgressWidth / 2 - 44, 0);
        root.addChild(icon);
        this.drillProgressIcon = icon;
        this.drawDrillIcon(icon, 0.9);

        this.updateDrillProgress(false);
    }

    private buildDrillTool(y: number): void {
        if (this.drillToolButton) this.drillToolButton.destroy();

        const button = uimanager.createRect(this.node, 'drillToolButton', 116, 92, new cc.Color(44, 44, 92), 245, 18, 105, y);
        button.zIndex = 25;
        button.on(cc.Node.EventType.TOUCH_END, () => this.useDrill());
        button.addComponent(cc.Button);
        this.drillToolButton = button;

        const icon = new cc.Node('drillIcon');
        icon.width = 58;
        icon.height = 58;
        icon.setAnchorPoint(0.5, 0.5);
        icon.setPosition(0, 12);
        button.addChild(icon);
        this.drawDrillIcon(icon, 0.85);

        uimanager.createLabel(button, '电钻', 0, -24, 18, new cc.Color(226, 242, 255), true, 76, 24);
        const countNode = uimanager.createLabel(button, `x${playerModule.drill}`, 32, -36, 20, new cc.Color(255, 218, 82), true, 60, 26);
        this.drillCountLabel = countNode.getComponent(cc.Label);
        this.refreshDrillTool();
    }

    private refreshDrillTool(): void {
        if (this.drillCountLabel) this.drillCountLabel.string = `x${playerModule.drill}`;
    }

    private updateDrillProgress(animated: boolean = true): void {
        if (!this.drillProgressFill) return;

        const ratio = Math.max(0, Math.min(1, zyxGameModule.gameInfo.drillFragments / 20));
        const width = Math.max(0, this.drillProgressWidth * ratio);
        const redraw = (w: number) => {
            const g = this.drillProgressFill.getComponent(cc.Graphics) || this.drillProgressFill.addComponent(cc.Graphics);
            g.clear();
            if (w <= 0) return;
            g.fillColor = new cc.Color(72, 207, 255);
            g.roundRect(0, -11, w, 22, 11);
            g.fill();
            g.fillColor = new cc.Color(190, 245, 255, 120);
            g.roundRect(8, 2, Math.max(0, w - 16), 5, 3);
            g.fill();
        };

        if (!animated) {
            redraw(width);
            this.currentDrillProgressWidth = width;
            return;
        }

        const state = { w: this.currentDrillProgressWidth || 0 };
        cc.tween(state)
            .to(0.28, { w: width }, {
                progress: (start, end, current, ratio) => {
                    const value = start + (end - start) * ratio;
                    redraw(value);
                    return value;
                },
            })
            .call(() => {
                this.currentDrillProgressWidth = width;
            })
            .start();
    }

    private playDrillFragmentFly(sourceNode?: cc.Node): void {
        if (!this.drillProgressIcon) return;

        const fly = new cc.Node('drillFragmentFly');
        fly.width = 44;
        fly.height = 44;
        fly.zIndex = 120;
        this.node.addChild(fly);
        this.drawDrillIcon(fly, 0.58);

        if (sourceNode && sourceNode.parent) {
            const worldPos = sourceNode.parent.convertToWorldSpaceAR(sourceNode.getPosition());
            fly.setPosition(this.node.convertToNodeSpaceAR(worldPos));
        } else {
            fly.setPosition(0, 0);
        }

        const targetWorld = this.drillProgressIcon.parent.convertToWorldSpaceAR(this.drillProgressIcon.getPosition());
        const targetLocal = this.node.convertToNodeSpaceAR(targetWorld);
        cc.tween(fly)
            .to(0.42, { x: targetLocal.x, y: targetLocal.y, scale: 0.72 }, { easing: 'quadInOut' })
            .call(() => {
                fly.destroy();
                const gainedDrill = zyxGameModule.addDrillFragment(1);
                if (gainedDrill) {
                    playerModule.drill += 1;
                    this.refreshDrillTool();
                    uimanager.showTips('获得电钻 x1');
                }
                this.updateDrillProgress(true);
                this.pulseDrillIcon();
                audioMgr.playSound(SoundType.ZYX_HAMMER);
            })
            .start();
    }

    private pulseDrillIcon(): void {
        if (!this.drillProgressIcon) return;
        cc.tween(this.drillProgressIcon)
            .to(0.06, { angle: -10, scale: 1.12 })
            .to(0.06, { angle: 10, scale: 1.12 })
            .to(0.08, { angle: 0, scale: 1 })
            .start();
    }

    private drawDrillIcon(node: cc.Node, scale: number = 1): void {
        node.removeAllChildren();
        const g = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        g.clear();
        const s = scale;

        g.fillColor = new cc.Color(28, 34, 70);
        g.circle(0, 0, 29 * s);
        g.fill();

        g.lineWidth = 5 * s;
        g.strokeColor = new cc.Color(255, 255, 255);
        g.fillColor = new cc.Color(66, 211, 255);
        g.roundRect(-15 * s, -5 * s, 34 * s, 16 * s, 6 * s);
        g.fill();
        g.stroke();

        g.fillColor = new cc.Color(255, 183, 55);
        g.circle(-20 * s, 6 * s, 9 * s);
        g.fill();

        g.fillColor = new cc.Color(245, 250, 255);
        g.moveTo(19 * s, -12 * s);
        g.lineTo(35 * s, -3 * s);
        g.lineTo(19 * s, 9 * s);
        g.close();
        g.fill();

        g.strokeColor = new cc.Color(40, 68, 112);
        g.lineWidth = 3 * s;
        g.moveTo(22 * s, -8 * s);
        g.lineTo(32 * s, -3 * s);
        g.lineTo(22 * s, 6 * s);
        g.stroke();
    }

    private useDrill(): void {
        if (zyxGameModule.selectGirdUniqueId !== -1) return;
        if (playerModule.drill <= 0) {
            uimanager.showTips('电钻不足');
            return;
        }

        const colors = this.getAliveSkinIndexes();
        if (colors.length === 0) {
            uimanager.showTips('场上没有可切割色块');
            return;
        }

        this.showDrillColorTip(colors);
    }

    private showDrillColorTip(colors: number[]): void {
        if (this.drillColorTip) {
            this.drillColorTip.destroy();
            this.drillColorTip = null;
            return;
        }

        const tip = new cc.Node('drillColorTip');
        tip.width = Math.max(150, colors.length * 52 + 28);
        tip.height = 70;
        tip.setAnchorPoint(0.5, 0.5);
        tip.zIndex = 90;
        const basePos = this.drillToolButton ? this.drillToolButton.getPosition() : new cc.Vec2(105, -cc.winSize.height / 2 + 275);
        tip.setPosition(basePos.x, basePos.y + 90);
        this.node.addChild(tip);
        this.drillColorTip = tip;

        uimanager.redrawRect(tip, tip.width, tip.height, new cc.Color(18, 20, 58), 16, 245);
        uimanager.createLabel(tip, '选择颜色', 0, 22, 16, new cc.Color(224, 232, 255), true, 120, 24);

        const startX = -(colors.length - 1) * 26;
        for (let i = 0; i < colors.length; i++) {
            const skinIndex = colors[i];
            const swatch = uimanager.createCircle(tip, `drillColor${skinIndex}`, 18, this.getColorBySkin(skinIndex), startX + i * 52, -12, 255);
            swatch.on(cc.Node.EventType.TOUCH_END, () => {
                if (this.drillColorTip) {
                    this.drillColorTip.destroy();
                    this.drillColorTip = null;
                }
                this.applyDrill(skinIndex);
            });
        }
    }

    private async applyDrill(skinIndex: number): Promise<void> {
        const targets = [];
        for (let i = 0; i < this.grids.length; i++) {
            const gridCom = this.grids[i].getComponent(ZyxGridCom);
            if (gridCom.skinIndex === skinIndex && gridCom.getSize() > 1) {
                targets.push(this.grids[i]);
            }
        }

        if (targets.length === 0) {
            uimanager.showTips('这个颜色已是小格子');
            return;
        }

        playerModule.drill -= 1;
        this.refreshDrillTool();
        audioMgr.shake(SHAKE_TYPE.MEDIUM);
        audioMgr.playSound(SoundType.ZYX_HAMMER);

        for (let i = 0; i < targets.length; i++) {
            await this.splitGridToSingles(targets[i], skinIndex);
        }

        setTimeout(() => {
            this.refreshHammerView();
            this.check();
        }, 120);
    }

    private async splitGridToSingles(gridNode: cc.Node, skinIndex: number): Promise<void> {
        const gridCom = gridNode.getComponent(ZyxGridCom);
        const row = gridCom.getRow();
        const uniqueId = gridCom.uniqueId;
        const oldContentType = gridCom.contentType;
        const y = gridNode.y;
        const cols = [];

        for (let col = 0; col < 8; col++) {
            if (zyxGameModule.gridInfo[row][col][2] === uniqueId) cols.push(col);
        }

        const gridIndex = this.grids.indexOf(gridNode);
        if (gridIndex !== -1) this.grids.splice(gridIndex, 1);
        gridNode.destroy();

        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            zyxGameModule.gameInfo.uniqueId += 1;
            const contentType = i === 0 ? oldContentType : gridContentType.NORMAL;
            const info = [1, contentType, zyxGameModule.gameInfo.uniqueId, skinIndex];
            zyxGameModule.gridInfo[row][col] = info;
            const newGrid = await this.produceGrid(info);
            this.uBoxGrid.addChild(newGrid);
            newGrid.setPosition(new cc.Vec2(zyxGameModule.gridsWidth * col, y));
            newGrid.getComponent(ZyxGridCom).setRowCel(row, col);
            newGrid.scale = 0.86;
            cc.tween(newGrid).to(0.12, { scale: 1 }, { easing: 'backOut' }).start();
            this.grids.push(newGrid);
        }
    }

    private buildGameHud(): void {
        if (this.gameHud) this.gameHud.destroy();

        const W = cc.winSize.width;
        const H = cc.winSize.height;
        const hud = new cc.Node('gameHud');
        hud.width = W;
        hud.height = 140;
        hud.zIndex = 20;
        hud.setAnchorPoint(0.5, 0.5);
        hud.setPosition(0, H / 2 - 150);
        this.node.addChild(hud);
        this.gameHud = hud;

        uimanager.createLabel(hud, 'SCORE', -W * 0.32, 28, 20, new cc.Color(206, 175, 255), true, 150, 30);
        const scoreNode = uimanager.createLabel(hud, `${zyxGameModule.gameInfo.score}`, -W * 0.32, -12, 42, new cc.Color(255, 255, 255), true, 170, 52);
        this.ulblScore = scoreNode.getComponent(cc.Label);

        uimanager.createLabel(hud, 'BEST', W * 0.21, 28, 20, new cc.Color(255, 215, 85), true, 120, 30);
        const bestNode = uimanager.createLabel(hud, `${zyxGameModule.scoreRecord || 0}`, W * 0.21, -12, 38, new cc.Color(255, 223, 75), true, 190, 50);
        this.ulblMaxScore = bestNode.getComponent(cc.Label);

        this.difficultyBadge = uimanager.createRect(hud, 'difficultyBadge', 220, 58, this.getDifficultyColor(), 245, 22, 0, -42);
        const diffText = uimanager.createLabel(this.difficultyBadge, `Lv.${zyxGameModule.gameInfo.difficultyLevel} 难度`, 0, 0, 30, new cc.Color(255, 255, 255), true, 190, 46);
        this.difficultyLabel = diffText.getComponent(cc.Label);
        this.lastShownDifficulty = zyxGameModule.gameInfo.difficultyLevel;

        const pause = uimanager.createButton(hud, 'II', W / 2 - 58, -4, 58, 58, new cc.Color(142, 78, 218), () => this.openSettings(), 26, 14);
        pause.zIndex = 2;
    }

    private updateDifficultyHud(forceBounce: boolean = false): void {
        if (!this.difficultyBadge || !this.difficultyLabel) return;

        const level = zyxGameModule.gameInfo.difficultyLevel || 1;
        this.difficultyLabel.string = `Lv.${level} 难度`;
        uimanager.redrawRect(this.difficultyBadge, this.difficultyBadge.width, this.difficultyBadge.height, this.getDifficultyColor(), 22, 245);

        if (forceBounce || this.lastShownDifficulty !== level) {
            this.difficultyLabel.fontSize = Math.min(38, 28 + level);
            cc.tween(this.difficultyBadge)
                .to(0.10, { scale: 1.34 }, { easing: 'backOut' })
                .to(0.20, { scale: 1.0 }, { easing: 'backOut' })
                .start();
            this.lastShownDifficulty = level;
        }
    }

    private showDifficultyEvent(): void {
        this.updateDifficultyHud(zyxGameModule.difficultyState.difficultyChanged);
        if (zyxGameModule.difficultyState.difficultyChanged) {
            uimanager.showTips(`难度提升到 ${zyxGameModule.difficultyState.level}`);
        }
        if (zyxGameModule.difficultyState.balanceTriggered) {
            uimanager.showTips(zyxGameModule.difficultyState.balanceReason || '动态平衡触发');
        }
    }

    private getDifficultyColor(): cc.Color {
        const level = Math.max(1, Math.min(10, zyxGameModule.gameInfo.difficultyLevel || 1));
        const t = (level - 1) / 9;
        return new cc.Color(
            Math.floor(78 + 150 * t),
            Math.floor(104 - 44 * t),
            Math.floor(226 - 130 * t),
        );
    }

    private refreshHammerView(): void {
        const colors = this.getAliveSkinIndexes();
        if (colors.length > 0 && colors.indexOf(this.hammerColorIndex) === -1) {
            this.hammerColorIndex = colors[0];
        } else if (colors.length > 0) {
            this.hammerColorIndex = colors[zyxGameModule.gameInfo.uniqueId % colors.length];
        }

        if (!this.uBtnHammer) return;
        let swatch = this.uBtnHammer.getChildByName('hammerColorSwatch');
        if (!swatch) {
            swatch = new cc.Node('hammerColorSwatch');
            swatch.width = 52;
            swatch.height = 52;
            swatch.setPosition(0, 8);
            this.uBtnHammer.addChild(swatch);
        }
        const sprite = swatch.getComponent(cc.Sprite) || swatch.addComponent(cc.Sprite);
        NewUtils.setSpriteFrameByUrl(sprite, `images/grid/color_${this.hammerColorIndex}`);
    }

    private getAliveSkinIndexes(): number[] {
        const colors = [];
        for (let i = 0; i < this.grids.length; i++) {
            const skinIndex = this.grids[i].getComponent(ZyxGridCom).skinIndex;
            if (colors.indexOf(skinIndex) === -1) colors.push(skinIndex);
        }
        return colors;
    }

    private getUniqueIdsBySkin(skinIndex: number): number[] {
        const uniqueIds = [];
        for (let i = 0; i < this.grids.length; i++) {
            const gridCom = this.grids[i].getComponent(ZyxGridCom);
            if (gridCom.skinIndex === skinIndex && uniqueIds.indexOf(gridCom.uniqueId) === -1) {
                uniqueIds.push(gridCom.uniqueId);
            }
        }
        return uniqueIds;
    }

    private clearUniqueIds(uniqueIds: number[], duration: number): void {
        // 先清除数据
        for (let row = 0; row < zyxGameModule.gridInfo.length; row++) {
            for (let col = 0; col < zyxGameModule.gridInfo[row].length; col++) {
                if (uniqueIds.indexOf(zyxGameModule.gridInfo[row][col][2]) !== -1) {
                    zyxGameModule.gridInfo[row][col] = [0, 0, 0];
                }
            }
        }

        // 再清除视图节点（带动画）
        for (let i = this.grids.length - 1; i >= 0; i--) {
            const gridCom = this.grids[i].getComponent(ZyxGridCom);
            if (uniqueIds.indexOf(gridCom.uniqueId) !== -1) {
                this.collectGoods(gridCom.contentType, this.grids[i]);
                gridCom.eliminate(duration);
                this.grids.splice(i, 1);
            }
        }
    }

    // ======== 被动救援效果 ========
    private tryShowRescue(): boolean {
        if (this.isRescueShowing) return true;
        if (!this.isNearTopRows()) return false;

        const now = Date.now();
        if (now - this.lastRescueAt < this.rescueCooldownMs) return false;

        this.isRescueShowing = true;
        this.lastRescueAt = now;
        uimanager.showAdRescue(async () => {
            const ok = await wxApiManager.showRewardedAd();
            this.isRescueShowing = false;
            if (ok) {
                this.clearBottomRowsByAd(5);
            } else {
                uimanager.showTips('广告未完成');
                this.checkGameOver();
            }
        }, () => {
            this.isRescueShowing = false;
            this.checkGameOver();
        });
        return true;
    }

    private isNearTopRows(): boolean {
        // 检测顶部2排是否有格子（游戏快消不下去的状态）
        for (let row = 0; row <= 1; row++) {
            for (let col = 0; col < zyxGameModule.gridInfo[row].length; col++) {
                if (zyxGameModule.gridInfo[row][col][1] !== gridContentType.EMPTY) {
                    return true;
                }
            }
        }
        return false;
    }

    private clearBottomRowsByAd(rows: number): void {
        const uniqueIds = [];
        const startRow = Math.max(0, zyxGameModule.gridInfo.length - rows);
        for (let row = startRow; row < zyxGameModule.gridInfo.length; row++) {
            for (let col = 0; col < zyxGameModule.gridInfo[row].length; col++) {
                const uniqueId = zyxGameModule.gridInfo[row][col][2];
                if (uniqueId !== 0 && uniqueIds.indexOf(uniqueId) === -1) uniqueIds.push(uniqueId);
            }
        }
        if (uniqueIds.length === 0) {
            uimanager.showTips('暂无可清除格子');
            return;
        }
        this.clearUniqueIds(uniqueIds, 0.45);
        uimanager.showTips('已清除 5 排');
        setTimeout(() => {
            this.refreshHammerView();
            this.check();
        }, 500);
    }

    private showFloatingScore(score: number): void {
        const node = new cc.Node('scoreFloat');
        node.width = 180;
        node.height = 70;
        node.setPosition(0, 80);
        this.node.addChild(node);
        const label = node.addComponent(cc.Label);
        label.string = `+${score}`;
        label.fontSize = 44;
        label.lineHeight = 54;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.CLAMP;
        node.color = new cc.Color(66, 217, 255);
        cc.tween(node)
            .to(0.45, { y: 140, opacity: 255 })
            .to(0.35, { y: 176, opacity: 0 })
            .call(() => node.destroy())
            .start();
    }

    private getColorBySkin(skinIndex: number): cc.Color {
        const colors = [
            new cc.Color(117, 255, 56),
            new cc.Color(255, 219, 51),
            new cc.Color(255, 112, 195),
            new cc.Color(255, 105, 35),
            new cc.Color(48, 207, 255),
        ];
        return colors[Math.max(0, Math.min(colors.length - 1, skinIndex - 1))];
    }
}
