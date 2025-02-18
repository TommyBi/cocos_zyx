import { gridContentType, gridSize, typeGameInfo } from '../define/TypeDefine';
import NewUtils from '../util/NewUtils';
import DataModule from './DataModule';
import { orderModule } from './OrderModule';

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

    // 钻石的层级间隔
    public diamondInterval: number = 10;

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

    // 生产格子，服务器逻辑 返回格式为[gridsize][contentType][uniqueId][]
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
                // 判断剩余空间是否有空格子区域
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
        this.diamondInterval++;
        console.log('produce', arr);
        return arr;

        // const a = [[2, 1, 10], [2, 1, 10], [2, 1, 11], [2, 1, 11], [2, 1, 12], [2, 1, 12], [2, 1, 13], [2, 1, 13]];
        // return a;
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
        } else if (randomNum <= 19) {
            // 订单道具 60%是当前订单中相关的物品，40%是其他种类格子
            const orderGoodsIds = orderModule.getAllGoodsId();
            const contentType = this.getRandomNumberWithWeights(orderGoodsIds);
            return contentType;
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
            newGridInfo.push(gridInfo);
        }
        return newGridInfo;
    }
}
export const zyxGameModule = new ZyxGameModule();
