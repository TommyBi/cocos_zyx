"use strict";
cc._RF.push(module, 'beefbM59wVK1oMpVwTVCzYm', 'GoodsModule');
// script/merge/dataModule/GoodsModule.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.goodsModule = void 0;
var DataModule_1 = require("./DataModule");
var GoodsModule = /** @class */ (function (_super) {
    __extends(GoodsModule, _super);
    function GoodsModule() {
        var _this = _super.call(this) || this;
        _this.goods = [];
        return _this;
    }
    GoodsModule.prototype.parseData = function (data) {
        _super.prototype.parseData.call(this, data);
        this.goods = data.goods;
    };
    return GoodsModule;
}(DataModule_1.default));
exports.default = GoodsModule;
exports.goodsModule = new GoodsModule();

cc._RF.pop();