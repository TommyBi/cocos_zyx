"use strict";
cc._RF.push(module, 'b87589+qj5GgbqZ/w8AZBbf', 'GoodsCom');
// script/merge/game/GoodsCom.ts

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var GoodsModule_1 = require("../dataModule/GoodsModule");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GoodsCom = /** @class */ (function (_super) {
    __extends(GoodsCom, _super);
    function GoodsCom() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.label = null;
        _this.uImgGoods = null;
        _this.ulblName = null;
        _this.ulblStar = null;
        _this.ulblInventory = null;
        _this.uBtnGet = null;
        // 商品列表中的索引
        _this.idx = -1;
        return _this;
    }
    Object.defineProperty(GoodsCom.prototype, "goodsData", {
        // 当前最新的商品信息状态
        get: function () {
            return GoodsModule_1.goodsModule.goods[this.idx];
        },
        enumerable: false,
        configurable: true
    });
    GoodsCom.prototype.onLoad = function () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onSelect, this);
        this.uBtnGet.on(cc.Node.EventType.TOUCH_END, this.onGet, this);
    };
    GoodsCom.prototype.init = function (idx) {
        this.idx = idx;
        this.formatGoodsInfo();
    };
    GoodsCom.prototype.formatGoodsInfo = function () {
        var _this = this;
        var goodsInfo = this.goodsData;
        var url = "images/goods/img_goods_" + goodsInfo.id;
        cc.resources.load(url, cc.SpriteFrame, (function (err, spriteFrame) {
            if (err) {
                console.error('url:', url, '/err:');
                return;
            }
            _this.uImgGoods.spriteFrame = spriteFrame;
        }));
        this.ulblName.string = goodsInfo.name;
        this.ulblStar.string = "x " + goodsInfo.star;
    };
    // 展示商品详情页
    GoodsCom.prototype.onSelect = function () {
        console.log('[DEBUG] 显示商品详情', this.goodsData);
    };
    // 兑换
    GoodsCom.prototype.onGet = function () {
        console.log("[DEBUG] \u5151\u6362\u5546\u54C1" + this.goodsData.name);
    };
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "label", void 0);
    __decorate([
        property(cc.Sprite)
    ], GoodsCom.prototype, "uImgGoods", void 0);
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "ulblName", void 0);
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "ulblStar", void 0);
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "ulblInventory", void 0);
    __decorate([
        property(cc.Node)
    ], GoodsCom.prototype, "uBtnGet", void 0);
    GoodsCom = __decorate([
        ccclass
    ], GoodsCom);
    return GoodsCom;
}(cc.Component));
exports.default = GoodsCom;

cc._RF.pop();