
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxRewardItem.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '58f9eKomoVBuayMe+FsK7xm', 'ZyxRewardItem');
// script/merge/zyxGame/ZyxRewardItem.ts

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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ZyxRewardItem = /** @class */ (function (_super) {
    __extends(ZyxRewardItem, _super);
    function ZyxRewardItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uImgGoods = null;
        _this.ulblCnt = null;
        return _this;
    }
    ZyxRewardItem.prototype.onLoad = function () { };
    ZyxRewardItem.prototype.start = function () {
    };
    __decorate([
        property(cc.Sprite)
    ], ZyxRewardItem.prototype, "uImgGoods", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxRewardItem.prototype, "ulblCnt", void 0);
    ZyxRewardItem = __decorate([
        ccclass
    ], ZyxRewardItem);
    return ZyxRewardItem;
}(cc.Component));
exports.default = ZyxRewardItem;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhSZXdhcmRJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRzVDO0lBQTJDLGlDQUFZO0lBQXZEO1FBQUEscUVBYUM7UUFWRyxlQUFTLEdBQWMsSUFBSSxDQUFDO1FBRzVCLGFBQU8sR0FBYSxJQUFJLENBQUM7O0lBTzdCLENBQUM7SUFMRyw4QkFBTSxHQUFOLGNBQVcsQ0FBQztJQUVaLDZCQUFLLEdBQUw7SUFFQSxDQUFDO0lBVEQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztvREFDUTtJQUc1QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2tEQUNNO0lBTlIsYUFBYTtRQURqQyxPQUFPO09BQ2EsYUFBYSxDQWFqQztJQUFELG9CQUFDO0NBYkQsQUFhQyxDQWIwQyxFQUFFLENBQUMsU0FBUyxHQWF0RDtrQkFib0IsYUFBYSIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaeXhSZXdhcmRJdGVtIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eShjYy5TcHJpdGUpXG4gICAgdUltZ0dvb2RzOiBjYy5TcHJpdGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIG9uTG9hZCgpIHsgfVxuXG4gICAgc3RhcnQoKSB7XG5cbiAgICB9XG59XG4iXX0=