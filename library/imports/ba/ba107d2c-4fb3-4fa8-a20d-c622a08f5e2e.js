"use strict";
cc._RF.push(module, 'ba1070sT7NPqKINxiKgj14u', 'TouchEffect');
// script/merge/pulicCom/TouchEffect.ts

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
var TouchEffect = /** @class */ (function (_super) {
    __extends(TouchEffect, _super);
    function TouchEffect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.scaleTime = 0.07;
        _this.initScaleX = 1;
        _this.initScaleY = 1;
        _this.dS = 0.9;
        return _this;
        // update (dt) {}
    }
    TouchEffect.prototype.onLoad = function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    };
    TouchEffect.prototype.start = function () {
        this.initScaleX = this.node.scaleX;
        this.initScaleY = this.node.scaleY;
        cc.tween(this.node).stop();
    };
    TouchEffect.prototype.onTouchStart = function () {
        var tarScaleX = this.node.scaleX * 0.9;
        var tarScaleY = this.node.scaleY * 0.9;
        cc.tween(this.node)
            .to(this.scaleTime, { scaleX: tarScaleX, scaleY: tarScaleY })
            .to(this.scaleTime, { scaleX: this.initScaleX, scaleY: this.initScaleY })
            .start();
    };
    TouchEffect.prototype.onTouchEnd = function () {
        cc.tween(this.node)
            .to(this.scaleTime, { scaleX: this.initScaleX, scaleY: this.initScaleY })
            .start();
    };
    __decorate([
        property()
    ], TouchEffect.prototype, "scaleTime", void 0);
    TouchEffect = __decorate([
        ccclass
    ], TouchEffect);
    return TouchEffect;
}(cc.Component));
exports.default = TouchEffect;

cc._RF.pop();