// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { orderModule } from "../dataModule/OrderModule";
import { EventType } from "../manager/Define";
import { uimanager } from "../manager/Uimanager";
import { eventManager } from "../util/EventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ZyxOrderCom extends cc.Component {

    @property(cc.Node)
    uImgBg: cc.Node = null;

    @property(cc.Node)
    uImgStatus: cc.Node = null;

    @property(cc.Node)
    uBoxGoods: cc.Node = null;

    private orderId: number = 0;

    private goodsComs: cc.Node[] = [];

    onLoad() {
        eventManager.on(EventType.ZYX_CHECK_ORDER_FINISH, this.checkOrderFinish, this);
    }

    start() {

    }

    async initOrder(orderId: number = 0) {
        this.orderId = orderId;
        const orderData = orderModule.getOrderData(this.orderId);
        if (!orderData) return;

        // format goods
        this.uBoxGoods.destroyAllChildren();
        for (let i = 0; i < orderData.goods.length; i++) {
            const goodsCom = await this.produceGoods();
            this.uBoxGoods.addChild(goodsCom);
            goodsCom.setPosition(goodsCom.width * i, 0);
            goodsCom.getComponent('ZyxOrderGoodsCom').init(this.orderId, orderData.goods[i].goodsId);
        }
    }

    checkOrderFinish(e) {
        if (e.data === this.orderId) {
            const isFinish = orderModule.checkOrderFinish(this.orderId);
            if (isFinish) {
                orderModule.submitOrder(this.orderId, (newOrderId) => {
                    if (newOrderId) {
                        this.initOrder(newOrderId);
                    }
                });
            }
        }
    }

    async produceGoods() {
        const goods = await uimanager.loadPrefab('prefab/zyx/uComOrderGoodsCom');
        const goodsCom = cc.instantiate(goods);
        return goodsCom;
    }
}
