"use strict";
cc._RF.push(module, 'ff575bO8YtMEauFEhjl6YgO', 'ZyxComTop');
// script/merge/zyxGame/ZyxComTop.ts

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
var PlayerModule_1 = require("../dataModule/PlayerModule");
var ZyxGameModule_1 = require("../dataModule/ZyxGameModule");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ZyxComTop = /** @class */ (function (_super) {
    __extends(ZyxComTop, _super);
    function ZyxComTop() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uImgExpBar = null;
        _this.ulblLv = null;
        _this.ulblExp = null;
        _this.uImgAvatar = null;
        _this.ulblDiamond = null;
        _this.ulblStar = null;
        return _this;
    }
    ZyxComTop.prototype.onLoad = function () {
    };
    ZyxComTop.prototype.start = function () {
    };
    ZyxComTop.prototype.init = function () {
        this.ulblStar.string = "" + ZyxGameModule_1.zyxGameModule.gameInfo.star;
        this.ulblLv.string = "" + PlayerModule_1.playerModule.lv;
        this.ulblExp.string = PlayerModule_1.playerModule.exp + "/" + PlayerModule_1.playerModule.expTar;
        this.ulblDiamond.string = "" + PlayerModule_1.playerModule.diamond;
        this.ulblStar.string = "" + PlayerModule_1.playerModule.star;
    };
    __decorate([
        property(cc.Node)
    ], ZyxComTop.prototype, "uImgExpBar", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxComTop.prototype, "ulblLv", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxComTop.prototype, "ulblExp", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxComTop.prototype, "uImgAvatar", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxComTop.prototype, "ulblDiamond", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxComTop.prototype, "ulblStar", void 0);
    ZyxComTop = __decorate([
        ccclass
    ], ZyxComTop);
    return ZyxComTop;
}(cc.Component));
exports.default = ZyxComTop;

cc._RF.pop();