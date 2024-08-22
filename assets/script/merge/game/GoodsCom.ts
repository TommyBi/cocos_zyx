import { goodsModule } from "../dataModule/GoodsModule";
import { GoodsType } from "../manager/Define";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GoodsCom extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Sprite)
    uImgGoods: cc.Sprite = null;

    @property(cc.Label)
    ulblName: cc.Label = null;

    @property(cc.Label)
    ulblStar: cc.Label = null;

    @property(cc.Label)
    ulblInventory: cc.Label = null;

    @property(cc.Node)
    uBtnGet: cc.Node = null;

    // 商品列表中的索引
    idx: number = -1;

    // 当前最新的商品信息状态
    get goodsData(): GoodsType {
        return goodsModule.goods[this.idx];
    }

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onSelect, this);
        this.uBtnGet.on(cc.Node.EventType.TOUCH_END, this.onGet, this);
    }

    init(idx: number): void {
        this.idx = idx;
        this.formatGoodsInfo();
    }

    formatGoodsInfo(): void {
        const goodsInfo = this.goodsData;

        const url: string = `images/goods/img_goods_${goodsInfo.id}`;
        cc.resources.load(url, cc.SpriteFrame, ((err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                console.error('url:', url, '/err:');
                return;
            }

            this.uImgGoods.spriteFrame = spriteFrame;
        }));

        this.ulblName.string = goodsInfo.name;
        this.ulblStar.string = `x ${goodsInfo.star}`;
    }

    // 展示商品详情页
    onSelect() {
        console.log('[DEBUG] 显示商品详情', this.goodsData);
    }

    // 兑换
    onGet(): void {
        console.log(`[DEBUG] 兑换商品${this.goodsData.name}`);
    }
}
