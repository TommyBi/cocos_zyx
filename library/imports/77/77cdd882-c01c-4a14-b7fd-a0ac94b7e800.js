"use strict";
cc._RF.push(module, '77cddiCwBxKFLf9oKyUt+gA', 'MergeProgress');
// script/merge/game/MergeProgress.ts

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
var GameModule_1 = require("../dataModule/GameModule");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var MergeProgress = /** @class */ (function (_super) {
    __extends(MergeProgress, _super);
    function MergeProgress() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblTar = null;
        _this.uImgBar = null;
        return _this;
    }
    MergeProgress.prototype.onLoad = function () {
        this.uImgBar.width = 0;
        this.ulblTar.node.color = new cc.Color().fromHEX('#4b91e4');
    };
    MergeProgress.prototype.updateProress = function () {
        var totalW = 585;
        var tar = GameModule_1.gameModule.getMaxValue();
        var tarW = Math.floor(tar / 15 * totalW);
        cc.tween(this.uImgBar)
            .to(0.3, { width: tarW }, { easing: cc.easing.cubicInOut })
            .start();
    };
    __decorate([
        property(cc.Label)
    ], MergeProgress.prototype, "ulblTar", void 0);
    __decorate([
        property(cc.Node)
    ], MergeProgress.prototype, "uImgBar", void 0);
    MergeProgress = __decorate([
        ccclass
    ], MergeProgress);
    return MergeProgress;
}(cc.Component));
exports.default = MergeProgress;

cc._RF.pop();