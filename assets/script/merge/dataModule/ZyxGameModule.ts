import { typeGameInfo } from '../define/TypeDefine';
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

    produce(): number[] {
        // 确定目标要生成的数字数量；
        const cnt: number = NewUtils.randomIntInclusive(2, 7);

        // 确定要生成的数字组合 nMax <= 7;
        const arr = [];
        let condition = false;
        do {
            // 生成新格子
            const newNum = NewUtils.randomIntInclusive(1, 4);

            condition = NewUtils.sumArrayNum(arr) + newNum > 7 || arr.length >= cnt;

            if (!condition) {
                arr.push(newNum);
            }

        } while (!condition);

        console.log('produce', arr);
        return arr;

    }
}
export const zyxGameModule = new ZyxGameModule();
