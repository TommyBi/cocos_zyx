// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { orderModule } from "../dataModule/OrderModule";
import { EventType } from "../manager/Define";
import { eventManager } from "../util/EventManager";
import NewUtils from "../util/NewUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ZyxOrderGoodsCom extends cc.Component {

    @property(cc.Label)
    ulblCnt: cc.Label = null;

    @property(cc.Node)
    uImgGoods: cc.Node = null;

    private orderId: number = 0;
    private goodsId: number = 0;

    start() {

    }

    init(orderId: number, goodsId: number): void {
        this.orderId = orderId;
        this.goodsId = goodsId;
        this.formatGoodsInfo();
    }

    formatGoodsInfo(): void {
        const goodsData = orderModule.getGoodsData(this.orderId, this.goodsId);
        const url = `images/item/img_item_${goodsData.goodsId}`;
        NewUtils.setSpriteFrameByUrl(this.uImgGoods.getComponent(cc.Sprite), url);

        this.ulblCnt.string = `${goodsData.schedule}/${goodsData.tarCnt}`;

        // check if goods is enough
        if (goodsData.schedule >= goodsData.tarCnt) {
            // TODO: 物品收集足够
            eventManager.dispatch(EventType.ZYX_CHECK_ORDER_FINISH);
        }
    }

    add(): void {
        const goodsData = orderModule.getGoodsData(this.orderId, this.goodsId);
        orderModule.collectGoods(this.orderId, goodsData.goodsId, 1);
        this.formatGoodsInfo();
    }
}
