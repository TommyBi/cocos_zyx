import { GoodsType } from "../manager/Define";
import DataModule from "./DataModule";

export default class GoodsModule extends DataModule {
    goods: GoodsType[] = [];
    constructor() {
        super();
    }

    parseData(data: any): void {
        super.parseData(data);
        this.goods = data.goods;
    }
}
export const goodsModule = new GoodsModule();