import { GRID_WIDTH, gridContentType, typeDifficultyState, typeGameInfo } from '../define/TypeDefine';
import { httpManager } from '../util/HttpManager';
import NewUtils from '../util/NewUtils';
import DataModule from './DataModule';
import { typeDifficultyProduceResult, zyxDifficultyController } from './ZyxDifficultyController';

export default class ZyxGameModule extends DataModule {

    // 游戏进行中的资源数据
    gameInfo: typeGameInfo = null;

    // 游戏进行中的棋盘数据 [gridSize, contentType, uniqueID]
    gridInfo: any[] = [
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
    ];

    // 操作锁
    selectGirdUniqueId: number = -1;

    // 格子宽度
    gridsWidth: number = GRID_WIDTH;

    // 下一排信息
    public nextGridInfo: any[] = [];

    // 钻石的层级间隔
    public diamondInterval: number = 10;

    // 历史最高分
    public scoreRecord: number = 0;

    // 当前难度控制状态
    public difficultyState: typeDifficultyState = this.createDefaultDifficultyState();

    constructor() {
        super();
    }

    parseData(data: any): void {
        super.parseData(data);

        this.gameInfo = this.normalizeGameInfo(data.gameInfo || this.createDefaultGameInfo());
        this.gridInfo = data.gridInfo || [
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [2, 1, 1], [2, 1, 1], [0, 0, 0], [0, 0, 0]],
            [[1, 1, 2], [1, 1, 3], [1, 1, 4], [1, 1, 5], [1, 1, 6], [1, 1, 7], [0, 0, 0], [0, 0, 0]],
        ];
        this.scoreRecord = data.scoreRecord || data.highScore || 0;
        this.difficultyState = this.createDefaultDifficultyState();
        this.difficultyState.level = this.gameInfo.difficultyLevel;
        this.difficultyState.generatedRows = this.gameInfo.generatedRows;
        this.difficultyState.noMergeStreak = this.gameInfo.noMergeStreak;
        this.difficultyState.reliefRows = this.gameInfo.reliefRows;

        this.produce();
    }

    createDefaultGameInfo(): typeGameInfo {
        return {
            adTimes: 3,
            score: 0,
            flower: 0,
            uniqueId: 9,
            difficultyLevel: 1,
            generatedRows: 0,
            noMergeStreak: 0,
            reliefRows: 0,
            clearCount: 0,
            drillSpawnCharge: 0,
            drillFragments: 0,
        };
    }

    createDefaultDifficultyState(): typeDifficultyState {
        return {
            level: 1,
            generatedRows: 0,
            noMergeStreak: 0,
            reliefRows: 0,
            balanceTriggered: false,
            balanceReason: '',
            targetFill: 3,
            stackHeight: 0,
            largeCellRatio: 0,
            difficultyChanged: false,
        };
    }

    normalizeGameInfo(info: any): typeGameInfo {
        const defaultInfo = this.createDefaultGameInfo();
        return {
            adTimes: info.adTimes !== undefined ? info.adTimes : defaultInfo.adTimes,
            score: info.score !== undefined ? info.score : defaultInfo.score,
            flower: info.flower !== undefined ? info.flower : defaultInfo.flower,
            uniqueId: info.uniqueId !== undefined ? info.uniqueId : defaultInfo.uniqueId,
            difficultyLevel: info.difficultyLevel !== undefined ? info.difficultyLevel : defaultInfo.difficultyLevel,
            generatedRows: info.generatedRows !== undefined ? info.generatedRows : defaultInfo.generatedRows,
            noMergeStreak: info.noMergeStreak !== undefined ? info.noMergeStreak : defaultInfo.noMergeStreak,
            reliefRows: info.reliefRows !== undefined ? info.reliefRows : defaultInfo.reliefRows,
            clearCount: info.clearCount !== undefined ? info.clearCount : defaultInfo.clearCount,
            drillSpawnCharge: info.drillSpawnCharge !== undefined ? info.drillSpawnCharge : defaultInfo.drillSpawnCharge,
            drillFragments: info.drillFragments !== undefined ? info.drillFragments : defaultInfo.drillFragments,
        };
    }

    createEmptyGridInfo(): any[] {
        return [
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
        ];
    }

    resetRound(): void {
        this.gridInfo = this.createEmptyGridInfo();
        this.gameInfo = this.createDefaultGameInfo();
        this.difficultyState = this.createDefaultDifficultyState();
        this.selectGirdUniqueId = -1;
        this.produce();
    }

    // 生产格子，服务器逻辑 返回格式为[gridsize][contentType][uniqueId][]
    produce(comboTimes: number = 0): number[][] {
        const result = zyxDifficultyController.produceSegments({
            score: this.gameInfo.score,
            gridInfo: this.gridInfo,
            previousLevel: this.gameInfo.difficultyLevel,
            generatedRows: this.gameInfo.generatedRows,
            noMergeStreak: this.gameInfo.noMergeStreak,
            reliefRows: this.gameInfo.reliefRows,
            comboTimes,
        });

        const arr: number[][] = [];
        let hasProducedDiamond: boolean = false;
        let shouldAttachDrillFragment = this.gameInfo.drillSpawnCharge >= 5;
        for (let i = 0; i < result.segments.length && arr.length < 8; i++) {
            const newNum = result.segments[i];
            if (newNum <= 0) {
                arr.push([0, 0, 0]);
            } else {
                let contentType = this.getContentType(hasProducedDiamond);
                if (shouldAttachDrillFragment && i === result.drillFragmentIndex) {
                    contentType = gridContentType.DRILL_FRAGMENT;
                    shouldAttachDrillFragment = false;
                    this.gameInfo.drillSpawnCharge = Math.max(0, this.gameInfo.drillSpawnCharge - 5);
                }
                if (contentType === gridContentType.DIAMOND) {
                    hasProducedDiamond = true;
                }
                this.gameInfo.uniqueId++;
                const safeSize = Math.min(newNum, 8 - arr.length);
                for (let j = 0; j < safeSize; j++) {
                    arr.push([newNum, contentType, this.gameInfo.uniqueId]);
                }
            }
        }

        while (arr.length < 8) {
            arr.push([0, 0, 0]);
        }

        this.nextGridInfo = arr;
        this.applyDifficultyResult(result);
        this.diamondInterval++;
        console.log('produce', arr, this.difficultyState);
        return arr;
    }

    async produceByServer(token: string, comboTimes: number = 0): Promise<boolean> {
        if (!token || !httpManager.getOnline()) return false;

        try {
            const res = await httpManager.post('/produce', {
                token,
                gridInfo: this.gridInfo,
                gameInfo: this.gameInfo,
                difficultyState: this.difficultyState,
                comboTimes,
                diamondInterval: this.diamondInterval,
            }, 800);
            const data = res.data || res;
            if (!data || !Array.isArray(data.nextGridInfo) || data.nextGridInfo.length !== 8) return false;

            this.nextGridInfo = data.nextGridInfo;
            this.gameInfo = this.normalizeGameInfo(data.gameInfo || this.gameInfo);
            if (data.uniqueId !== undefined) this.gameInfo.uniqueId = data.uniqueId;
            if (data.diamondInterval !== undefined) this.diamondInterval = data.diamondInterval;
            this.applyRemoteDifficultyState(data.difficultyState || data);
            return true;
        } catch (e) {
            console.warn('produce fallback to local', e);
            return false;
        }
    }

    recordMergeResult(mergeRows: number): void {
        if (mergeRows > 0) {
            this.gameInfo.noMergeStreak = 0;
            this.gameInfo.clearCount += mergeRows;
            this.gameInfo.drillSpawnCharge += mergeRows;
        } else {
            this.gameInfo.noMergeStreak += 1;
        }
        this.difficultyState.noMergeStreak = this.gameInfo.noMergeStreak;
    }

    refreshDifficultyByScore(): boolean {
        const oldLevel = this.gameInfo.difficultyLevel || 1;
        const nextLevel = zyxDifficultyController.getLevel(this.gameInfo.score, this.gameInfo.generatedRows);
        this.gameInfo.difficultyLevel = nextLevel;
        this.difficultyState.level = nextLevel;
        this.difficultyState.difficultyChanged = oldLevel !== nextLevel;
        return oldLevel !== nextLevel;
    }

    private applyDifficultyResult(result: typeDifficultyProduceResult): void {
        this.gameInfo.difficultyLevel = result.level;
        this.gameInfo.generatedRows = result.generatedRows;
        this.gameInfo.noMergeStreak = result.noMergeStreak;
        this.gameInfo.reliefRows = result.reliefRows;
        this.difficultyState = {
            level: result.level,
            generatedRows: result.generatedRows,
            noMergeStreak: result.noMergeStreak,
            reliefRows: result.reliefRows,
            balanceTriggered: result.balanceTriggered,
            balanceReason: result.balanceReason,
            targetFill: result.targetFill,
            stackHeight: result.pressure.stackHeight,
            largeCellRatio: result.pressure.largeCellRatio,
            difficultyChanged: result.difficultyChanged,
        };
    }

    private applyRemoteDifficultyState(data: any): void {
        this.difficultyState = {
            level: data.level || this.gameInfo.difficultyLevel || 1,
            generatedRows: data.generatedRows || this.gameInfo.generatedRows || 0,
            noMergeStreak: data.noMergeStreak || this.gameInfo.noMergeStreak || 0,
            reliefRows: data.reliefRows || this.gameInfo.reliefRows || 0,
            balanceTriggered: !!data.balanceTriggered,
            balanceReason: data.balanceReason || '',
            targetFill: data.targetFill || 3,
            stackHeight: data.stackHeight || 0,
            largeCellRatio: data.largeCellRatio || 0,
            difficultyChanged: !!data.difficultyChanged,
        };
        this.gameInfo.difficultyLevel = this.difficultyState.level;
        this.gameInfo.generatedRows = this.difficultyState.generatedRows;
        this.gameInfo.noMergeStreak = this.difficultyState.noMergeStreak;
        this.gameInfo.reliefRows = this.difficultyState.reliefRows;
    }

    addDrillFragment(count: number = 1): boolean {
        this.gameInfo.drillFragments += count;
        if (this.gameInfo.drillFragments >= 20) {
            this.gameInfo.drillFragments -= 20;
            return true;
        }
        return false;
    }

    // 获得随机生成格子的类型
    getContentType(hasProducedDiamond: boolean): gridContentType {
        if (hasProducedDiamond) return gridContentType.NORMAL;

        // 生成订单道具的权重是19，普通格子权重是80，钻石权重是（5 + 层级间隔）
        const randomNum = NewUtils.randomIntInclusive(1, 100);
        if (randomNum <= 5) {
            // 钻石
            const contnetType = this.diamondInterval > 50 ? gridContentType.DIAMOND : gridContentType.NORMAL;
            if (contnetType === gridContentType.DIAMOND) this.diamondInterval = 0;
            return contnetType;
        } else {
            // 普通格子
            return gridContentType.NORMAL;
        }
    }

    getRandomNumberWithWeights(excludedNumbers) {
        // 创建一个包含7到25的数组
        const allNumbers = Array.from({ length: 19 }, (_, i) => i + 7);

        // 创建一个包含所有数字及其权重的对象数组
        const weightedNumbers = [];

        // 遍历所有数字，设置参数数组中的数字权重为60，其他为40
        allNumbers.forEach(number => {
            const weight = excludedNumbers.includes(number) ? 60 : 40;
            // 将每个数字根据其权重添加到数组中多次
            for (let i = 0; i < weight; i++) {
                weightedNumbers.push(number);
            }
        });

        // 从带有权重的数组中随机选择一个数字
        const randomIndex = Math.floor(Math.random() * weightedNumbers.length);
        return weightedNumbers[randomIndex];
    }

    // 检查游戏是否结束
    checkGameOver(): boolean {
        let isGameOver = false;
        for (let col = 0; col < this.gridInfo[0].length; col++) {
            if (this.gridInfo[0][col][1] !== gridContentType.EMPTY) {
                isGameOver = true;
            }
        }
        return isGameOver;
    }

    // 将新格子的数据返回
    copyNewGridData(): number[][] {
        const newGridInfo = [];
        for (let i = 0; i < this.nextGridInfo.length; i++) {
            const gridInfo = [0, 0, 0];
            gridInfo[0] = this.nextGridInfo[i][0];
            gridInfo[1] = this.nextGridInfo[i][1];
            gridInfo[2] = this.nextGridInfo[i][2];
            if (this.nextGridInfo[i][3] !== undefined) gridInfo[3] = this.nextGridInfo[i][3];
            newGridInfo.push(gridInfo);
        }
        return newGridInfo;
    }
}
export const zyxGameModule = new ZyxGameModule();
