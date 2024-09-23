"use strict";
cc._RF.push(module, 'ef5253/VKlPL5QaowdjMHpL', 'ZyxAccountDialog');
// script/merge/zyxGame/ZyxAccountDialog.ts

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
var ZyxGameModule_1 = require("../dataModule/ZyxGameModule");
var Define_1 = require("../manager/Define");
var EventManager_1 = require("../util/EventManager");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 结算界面
var ZyxAccountDialog = /** @class */ (function (_super) {
    __extends(ZyxAccountDialog, _super);
    function ZyxAccountDialog() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblTitle = null;
        _this.ulblScore = null;
        _this.uBox = null;
        _this.uBtnOk = null;
        return _this;
    }
    ZyxAccountDialog.prototype.onLoad = function () {
        this.uBtnOk.on(cc.Node.EventType.TOUCH_END, this.close, this);
    };
    ZyxAccountDialog.prototype.start = function () {
        this.ulblScore.string = "\u5F97\u5206\uFF1A" + ZyxGameModule_1.zyxGameModule.gameInfo.score;
    };
    ZyxAccountDialog.prototype.close = function () {
        var _this = this;
        EventManager_1.eventManager.dispatch(Define_1.EventType.ZYX_RESET_GAME);
        cc.tween(this.node)
            .to(0.2, { scale: 0 })
            .call(function () {
            _this.node.destroy();
        })
            .start();
    };
    __decorate([
        property(cc.Label)
    ], ZyxAccountDialog.prototype, "ulblTitle", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxAccountDialog.prototype, "ulblScore", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxAccountDialog.prototype, "uBox", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxAccountDialog.prototype, "uBtnOk", void 0);
    ZyxAccountDialog = __decorate([
        ccclass
    ], ZyxAccountDialog);
    return ZyxAccountDialog;
}(cc.Component));
exports.default = ZyxAccountDialog;

cc._RF.pop();