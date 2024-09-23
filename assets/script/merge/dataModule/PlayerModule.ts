import DataModule from './DataModule';
import { gameModule } from './GameModule';
import { goodsModule } from './GoodsModule';
import { zyxGameModule } from './ZyxGameModule';

export default class PlayerModule extends DataModule {
    // 资源信息
    diamond: number = 0;
    star: number = 0;
    hammer: number = 0;
    bomb: number = 0;

    // 玩家信息
    nickName: string = '';
    avatar: string = '';
    lv: number = 0;
    exp: number = 0;
    expTar: number = 0;

    parseData(data: any): void {
        super.parseData(data);
    }

    login(cb: Function): void {
        const loginData = {
            // 资源信息
            diamond: 10,
            star: 3,
            bomb: 3,
            hammer: 3,

            // 玩家信息
            nickName: '测试用户',
            avatar: '',
            lv: 1,
            exp: 10,
            expTar: 100,
            scoreRecord: 10,

            // 状态信息
            gameInfo: {
                adTimes: 3,
                score: 0,
                exp: 0,
                diamond: 0,
                star: 0,
                // 格子当前使用到的唯一索引值
                uniqueId: 9,
            },
        }

        gameModule.parseData(loginData);
        goodsModule.parseData(loginData);
        zyxGameModule.parseData(loginData);

        setTimeout(() => {
            cb && cb();
        }, 1000);
    }
}
export const playerModule = new PlayerModule();



/**
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
 */