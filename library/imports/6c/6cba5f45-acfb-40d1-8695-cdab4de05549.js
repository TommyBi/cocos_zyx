"use strict";
cc._RF.push(module, '6cba59FrPtA0YaVzatN4FVJ', 'Coin');
// script/merge/game/Coin.ts

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
var Coin = /** @class */ (function (_super) {
    __extends(Coin, _super);
    function Coin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblNum = null;
        _this.uImgBg = null;
        return _this;
        // update (dt) {}
    }
    Coin.prototype.onLoad = function () {
        this.ulblNum.string = '-';
    };
    Coin.prototype.init = function (slotIdx, cnt, cb) {
        var _this = this;
        var url = "images/coin/" + cnt;
        cc.resources.load(url, cc.SpriteFrame, (function (err, spriteFrame) {
            if (err) {
                console.error('url:', url, '/err:');
                return;
            }
            _this.uImgBg.spriteFrame = spriteFrame;
            cb && cb();
        }));
        // this.ulblNum.string = `${slotIdx}-${cnt}`;
        this.ulblNum.string = "" + cnt;
    };
    Coin.prototype.start = function () {
    };
    __decorate([
        property(cc.Label)
    ], Coin.prototype, "ulblNum", void 0);
    __decorate([
        property(cc.Sprite)
    ], Coin.prototype, "uImgBg", void 0);
    Coin = __decorate([
        ccclass
    ], Coin);
    return Coin;
}(cc.Component));
exports.default = Coin;

cc._RF.pop();