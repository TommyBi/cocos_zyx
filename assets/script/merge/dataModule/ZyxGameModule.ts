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
    lock: boolean = false;

    // 格子当前使用到的唯一索引值
    uniqueId: number = 9;

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
            [[0, 0, 0], [0, 0, 0], [3, 1, 1], [3, 1, 1], [3, 1, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[1, 1, 2], [1, 1, 3], [1, 1, 4], [1, 1, 5], [1, 1, 6], [1, 1, 7], [1, 1, 8], [1, 1, 9]],
        ];
    }

    // 生产格子，服务器逻辑 返回格式为[gridsize][contentType]
    produce(): number[][] {

        // 确定要生成的数字组合 nMax <= 7;
        const arr = [];
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
                if (surSpace >= newNum) {
                    this.uniqueId++;
                    for (let i = 0; i < newNum; i++) {
                        arr.push([newNum, 1, this.uniqueId]);
                    }
                }
            }

        } while (arr.length < 8);

        console.log('produce', arr);
        // const a = [[2, 1, 10], [2, 1, 10], [0, 0, 0], [0, 0, 0], [0, 0, 0], [2, 1, 11], [2, 1, 11], [0, 0, 0]];
        return arr;
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
}
export const zyxGameModule = new ZyxGameModule();
