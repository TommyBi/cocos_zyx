import DataModule from './DataModule';
import { gameModule } from './GameModule';
import { goodsModule } from './GoodsModule';

export default class PlayerModule extends DataModule {

    parseData(data: any): void {
        super.parseData(data);
    }

    login(cb: Function): void {
        const loginData = {
            star: 0,

            // 初始化的筹码配置
            slotData: [
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 2, 2, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 3, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],

            // 奖励兑换配置信息
            goods: [{
                id: 1,
                star: 1,
                total: 100,
                used: 0,
                name: '1盒纸巾',
                desc: '商品1',
                url: ``,
            }, {
                id: 2,
                star: 3,
                total: 100,
                used: 0,
                name: '1箱牛奶',
                desc: '商品2',
                url: ``,
            }, {
                id: 3,
                star: 5,
                total: 100,
                used: 0,
                name: '一箱红牛',
                desc: '商品3',
                url: ``,
            }, {
                id: 4,
                star: 5,
                total: 100,
                used: 0,
                name: '一箱饼干',
                desc: '商品4',
                url: ``,
            }, {
                id: 5,
                star: 8,
                total: 100,
                used: 0,
                name: '星巴克100券',
                desc: '商品5',
                url: ``,
            }, {
                id: 6,
                star: 10,
                total: 100,
                used: 0,
                name: '电子手表',
                desc: '商品6',
                url: ``,
            }, {
                id: 7,
                star: 10,
                total: 100,
                used: 0,
                name: '北京1日游',
                desc: '商品7',
                url: ``,
            }, {
                id: 8,
                star: 20,
                total: 100,
                used: 0,
                name: '5克黄金',
                desc: '商品8',
                url: ``,
            }
            ]
        }

        gameModule.parseData(loginData);
        goodsModule.parseData(loginData);
        cb && cb();
    }
}
export const playerModule = new PlayerModule();

