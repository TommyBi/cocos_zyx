import { goodsModule } from "../dataModule/GoodsModule";
import { uimanager } from "../manager/Uimanager";
import GoodsCom from "./GoodsCom";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GoodsList extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.ScrollView)
    uPanel: cc.ScrollView = null;

    onLoad() {

    }

    async initGoods() {
        this.uPanel.content.removeAllChildren();
        for (let i = 0; i < goodsModule.goods.length; i++) {
            const goods = await this.produceGoods();
            goods.getComponent(GoodsCom).init(i);
            this.uPanel.content.addChild(goods);
            goods.x = i * goods.width + goods.width / 2;
            this.uPanel.content.width = (i + 1) * goods.width;
        }
    }

    async produceGoods(): Promise<cc.Node> {
        const coinPrefab = await uimanager.loadPrefab('prefab/merge/goodsCom');
        const coin = cc.instantiate(coinPrefab);
        return coin;
    }
}
