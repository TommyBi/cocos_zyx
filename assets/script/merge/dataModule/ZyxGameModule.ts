import { gridContentType, gridSize, typeGameInfo } from '../define/TypeDefine';
import NewUtils from '../util/NewUtils';
import DataModule from './DataModule';

export default class ZyxGameModule extends DataModule {

    // 游戏进行中的资源数据
    gameInfo: typeGameInfo = null;

    // 游戏进行中的棋盘数据
    gridInfo: any[] = [];

    constructor() {
        super();
    }

    parseData(data: any): void {
        super.parseData(data);

        this.gameInfo = data.gameInfo;
        this.gridInfo = data.gridInfo || [];
    }

    produce(): number[][] {

        // 确定要生成的数字组合 nMax <= 7;
        const arr = [];
        let condition = false;
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
                arr.push([0, 1]);
            } else {
                // 判断剩余空间是否仍然没有空格子区域
                const surSpace = 8 - arr.length;
                const emptyGrid = arr.filter(x => {
                    return x && x[1] === gridContentType.EMPTY;
                })
                if (surSpace <= newNum && emptyGrid.length === 0) {
                    for (let i = 0; i < surSpace; i++) {
                        arr.push([0, 1]);
                    }
                    break;
                }

                if (surSpace >= newNum) {
                    for (let i = 0; i < newNum; i++) {
                        arr.push([newNum, 1]);
                    }
                }
            }

        } while (arr.length < 8);

        console.log('produce', arr);
        return arr;
    }
}
export const zyxGameModule = new ZyxGameModule();
