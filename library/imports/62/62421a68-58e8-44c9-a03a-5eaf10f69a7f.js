"use strict";
cc._RF.push(module, '62421poWOhEyaA6Xq8Q9pp/', 'Tips');
// script/merge/pulicCom/Tips.ts

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
// 提示消息
var Tips = /** @class */ (function (_super) {
    __extends(Tips, _super);
    function Tips() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblTips = null;
        _this.uImgBg = null;
        return _this;
    }
    Tips.prototype.onLoad = function () {
        this.node.opacity = 0;
    };
    Tips.prototype.start = function () {
    };
    Tips.prototype.showTips = function (msg) {
        var _this = this;
        this.ulblTips.string = msg;
        this.node.y = -200;
        this.node.opacity = 0;
        cc.tween(this.node)
            .to(0.6, { opacity: 255, y: 0 }, { easing: 'cubicInOut' })
            .delay(1)
            .to(0.8, { opacity: 0, y: 50 }, { easing: 'cubicInOut' })
            .call(function () {
            _this.node.removeFromParent();
        })
            .start();
    };
    __decorate([
        property(cc.Label)
    ], Tips.prototype, "ulblTips", void 0);
    __decorate([
        property(cc.Sprite)
    ], Tips.prototype, "uImgBg", void 0);
    Tips = __decorate([
        ccclass
    ], Tips);
    return Tips;
}(cc.Component));
exports.default = Tips;

cc._RF.pop();