
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/GoodsModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9Hb29kc01vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMkNBQXNDO0FBRXRDO0lBQXlDLCtCQUFVO0lBRS9DO1FBQUEsWUFDSSxpQkFBTyxTQUNWO1FBSEQsV0FBSyxHQUFnQixFQUFFLENBQUM7O0lBR3hCLENBQUM7SUFFRCwrQkFBUyxHQUFULFVBQVUsSUFBUztRQUNmLGlCQUFNLFNBQVMsWUFBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0FWQSxBQVVDLENBVndDLG9CQUFVLEdBVWxEOztBQUNZLFFBQUEsV0FBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHb29kc1R5cGUgfSBmcm9tIFwiLi4vbWFuYWdlci9EZWZpbmVcIjtcbmltcG9ydCBEYXRhTW9kdWxlIGZyb20gXCIuL0RhdGFNb2R1bGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29vZHNNb2R1bGUgZXh0ZW5kcyBEYXRhTW9kdWxlIHtcbiAgICBnb29kczogR29vZHNUeXBlW10gPSBbXTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwYXJzZURhdGEoZGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIHN1cGVyLnBhcnNlRGF0YShkYXRhKTtcbiAgICAgICAgdGhpcy5nb29kcyA9IGRhdGEuZ29vZHM7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGdvb2RzTW9kdWxlID0gbmV3IEdvb2RzTW9kdWxlKCk7Il19