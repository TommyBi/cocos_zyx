import DataModule from './DataModule';
import { gameModule } from './GameModule';
import { goodsModule } from './GoodsModule';
import { orderModule } from './OrderModule';
import { zyxGameModule } from './ZyxGameModule';

export default class PlayerModule extends DataModule {
    // 资源信息
    diamond: number = 0;
    flower: number = 0;
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
            flower: 3,
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
                flower: 0,
                // 格子当前使用到的唯一索引值
                uniqueId: 9,
                goods: {},
            },

            // 订单信息
            orders: [
                {
                    goods: [
                        {
                            goodsId: 7,
                            tarCnt: 12,
                            schedule: 0
                        }, {
                            goodsId: 8,
                            tarCnt: 5,
                            schedule: 1
                        }
                    ],
                    orderId: 1,
                    score: 110,
                },
                {
                    goods: [
                        {
                            goodsId: 9,
                            tarCnt: 10,
                            schedule: 0
                        }, {
                            goodsId: 10,
                            tarCnt: 5,
                            schedule: 1
                        }
                    ],
                    orderId: 2,
                    score: 150,
                },
            ],
        }

        gameModule.parseData(loginData);
        goodsModule.parseData(loginData);
        zyxGameModule.parseData(loginData);
        orderModule.parseData(loginData);

        setTimeout(() => {
            cb && cb();
        }, 1000);
    }
}
export const playerModule = new PlayerModule();
