import { typeOrderData, typeOrderGoodsData } from "../define/TypeDefine";
import { uimanager } from "../manager/Uimanager";
import NewUtils from "../util/NewUtils";
import DataModule from "./DataModule";

export default class OrderModule extends DataModule {
    orders: typeOrderData[] = [];

    parseData(data: any): void {
        super.parseData(data);
        this.orders = data.orders;
    }

    // 通过订单idd获取订单数据
    getOrderData(orderId: number): typeOrderData {
        for (let i = 0; i < this.orders.length; i++) {
            if (this.orders[i].orderId === orderId) {
                return this.orders[i];
            }
        }

        return null;
    }

    // 通过订单id和订单物品类型，获取订单中物品的收集情况
    getGoodsData(orderId: number, goodsId: number): typeOrderGoodsData {
        for (let i = 0; i < this.orders.length; i++) {
            if (this.orders[i].orderId === orderId) {
                for (let j = 0; j < this.orders[i].goods.length; j++) {
                    if (this.orders[i].goods[j].goodsId === goodsId) {
                        return this.orders[i].goods[j];
                    }
                }
            }
        }

        return null;
    }

    // 收集订单物品
    collectGoods(orderId: number, goodsId: number, collectCnt: number): void {
        for (let i = 0; i < this.orders.length; i++) {
            if (this.orders[i].orderId === orderId) {
                for (let j = 0; j < this.orders[i].goods.length; j++) {
                    if (this.orders[i].goods[j].goodsId === goodsId) {
                        this.orders[i].goods[j].schedule += collectCnt;
                    }
                }
            }
        }
    }

    // 检查订单是否完成
    checkOrderFinish(orderId: number): boolean {
        let isFinish = true;
        let orderData = this.getOrderData(orderId);
        if (!orderData) return;

        for (let i = 0; i < orderData.goods.length; i++) {
            if (orderData.goods[i].schedule < orderData.goods[i].tarCnt) {
                isFinish = false;
                break;
            }
        }

        return isFinish;
    }

    // 交付订单
    submitOrder(orderId: number, cb: Function): void {
        // TODO: 交付订单
        const newOrderData = this.getOrderData(orderId);
        for (let i = 0; i < this.orders.length; i++) {
            if (this.orders[i].orderId === orderId) {
                this.orders[i] = newOrderData;
            }
        }

        cb && cb(newOrderData ? newOrderData.orderId : null);
    }

    svr_produceNewOrder(data: any): typeOrderData {
        const orderData: typeOrderData = {
            orderId: NewUtils.randomIntInclusive(1, 1000),
            goods: [
                { goodsId: NewUtils.randomIntInclusive(7, 25), tarCnt: NewUtils.randomIntInclusive(1, 5), schedule: 0 },
                { goodsId: NewUtils.randomIntInclusive(7, 25), tarCnt: NewUtils.randomIntInclusive(1, 5), schedule: 0 },
            ],
            score: 100,
        };

        return orderData;
    }
}
export const orderModule = new OrderModule();