import { gridContentType, gridSize, typeGameInfo } from '../define/TypeDefine';
import NewUtils from '../util/NewUtils';
import DataModule from './DataModule';

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
    gridsWidth: number = 84;

    // 下一排信息
    public nextGridInfo: any[] = [];

    // 新生成的次数
    public produceTimes: number = 0;

    // 历史最高分
    public scoreRecord: number = 0;

    constructor() {
        super();
    }

    parseData(data: any): void {
        super.parseData(data);

        this.gameInfo = data.gameInfo;
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
        this.scoreRecord = data.scoreRecord || 0;

        this.produce();
    }

    // 生产格子，服务器逻辑 返回格式为[gridsize][contentType][uniqueId]
    produce(): number[][] {

        // 确定要生成的数字组合 nMax <= 7;
        const arr = [];
        let hasProducedDiamond: boolean = false;
        do {
            // 生成新格子
            let newNum = NewUtils.randomIntInclusive(0, 10);
            if (newNum >= 0 && newNum < 4) {
                newNum = 0;
            } else if (newNum >= 4 && newNum < 6) {
                newNum = 1;
            } else if (newNum >= 6 && newNum < 8) {
                newNum = 2;
            } else if (newNum >= 8 && newNum < 10) {
                newNum = 3;
            } else if (newNum === 10) {
                newNum = 4;
            }

            if (newNum === 0) {
                arr.push([0, 0, 0]);
            } else {
                // 判断剩余空间是否仍然没有空格子区域
                const surSpace = 8 - arr.length;
                const emptyGrid = arr.filter(x => {
                    return x && x[1] === gridContentType.EMPTY;
                })
                if (surSpace <= newNum && emptyGrid.length === 0) {
                    for (let i = 0; i < surSpace; i++) {
                        arr.push([0, 0, 0]);
                    }
                    break;
                }

                // 空间足够，那就将对应数量的格子进行填充
                const contentType = this.getContentType(hasProducedDiamond);
                if (contentType === gridContentType.DIAMOND) {
                    hasProducedDiamond = true;
                }
                if (surSpace >= newNum) {
                    this.gameInfo.uniqueId++;
                    for (let i = 0; i < newNum; i++) {
                        arr.push([newNum, contentType, this.gameInfo.uniqueId]);
                    }
                }
            }

        } while (arr.length < 8);

        this.nextGridInfo = arr;
        this.produceTimes++;
        console.log('produce', arr);
        return arr;

        // const a = [[2, 1, 10], [2, 1, 10], [2, 1, 11], [2, 1, 11], [2, 1, 12], [2, 1, 12], [2, 1, 13], [2, 1, 13]];
        // return a;
    }

    // 获得随机生成格子的类型
    getContentType(hasProducedDiamond: boolean): gridContentType {
        if (hasProducedDiamond) return gridContentType.NORMAL;
        if (this.produceTimes % 6 === 0 && Math.random() <= 0.5) {
            return gridContentType.DIAMOND;
        } else {
            return gridContentType.NORMAL;
        }
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
            newGridInfo.push(gridInfo);
        }
        return newGridInfo;
    }
}
export const zyxGameModule = new ZyxGameModule();
