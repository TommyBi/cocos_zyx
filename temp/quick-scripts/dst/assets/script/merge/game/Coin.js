
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/Coin.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9Db2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRzVDO0lBQWtDLHdCQUFZO0lBQTlDO1FBQUEscUVBZ0NDO1FBOUJPLGFBQU8sR0FBYSxJQUFJLENBQUM7UUFHekIsWUFBTSxHQUFjLElBQUksQ0FBQzs7UUEwQjdCLGlCQUFpQjtJQUNyQixDQUFDO0lBekJHLHFCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7SUFDOUIsQ0FBQztJQUVELG1CQUFJLEdBQUosVUFBSyxPQUFlLEVBQUUsR0FBVyxFQUFFLEVBQVc7UUFBOUMsaUJBY0M7UUFiRyxJQUFNLEdBQUcsR0FBVyxpQkFBZSxHQUFLLENBQUM7UUFDekMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFDLEdBQUcsRUFBRSxXQUEyQjtZQUNyRSxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3BDLE9BQU87YUFDVjtZQUVELEtBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUN0QyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUE7UUFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosNkNBQTZDO1FBQzdDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUcsR0FBSyxDQUFDO0lBQ25DLENBQUM7SUFFRCxvQkFBSyxHQUFMO0lBRUEsQ0FBQztJQTNCRztRQURILFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO3lDQUNVO0lBR3pCO1FBREgsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7d0NBQ1M7SUFMWixJQUFJO1FBRHhCLE9BQU87T0FDYSxJQUFJLENBZ0N4QjtJQUFELFdBQUM7Q0FoQ0QsQUFnQ0MsQ0FoQ2lDLEVBQUUsQ0FBQyxTQUFTLEdBZ0M3QztrQkFoQ29CLElBQUkiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29pbiBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgICAgICB1bGJsTnVtOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuU3ByaXRlKVxuICAgICAgICB1SW1nQmc6IGNjLlNwcml0ZSA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMudWxibE51bS5zdHJpbmcgPSAnLSc7XG4gICAgfVxuXG4gICAgaW5pdChzbG90SWR4OiBudW1iZXIsIGNudDogbnVtYmVyLCBjYjpGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGBpbWFnZXMvY29pbi8ke2NudH1gO1xuICAgICAgICBjYy5yZXNvdXJjZXMubG9hZCh1cmwsIGNjLlNwcml0ZUZyYW1lLCAoKGVyciwgc3ByaXRlRnJhbWU6IGNjLlNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigndXJsOicsIHVybCwgJy9lcnI6Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVJbWdCZy5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgY2IgJiYgY2IoKVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gdGhpcy51bGJsTnVtLnN0cmluZyA9IGAke3Nsb3RJZHh9LSR7Y250fWA7XG4gICAgICAgIHRoaXMudWxibE51bS5zdHJpbmcgPSBgJHtjbnR9YDtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcblxuICAgIH1cblxuICAgIC8vIHVwZGF0ZSAoZHQpIHt9XG59XG4iXX0=