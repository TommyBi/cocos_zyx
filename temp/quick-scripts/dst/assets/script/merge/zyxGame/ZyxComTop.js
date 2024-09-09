
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxComTop.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhDb21Ub3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQTBEO0FBQzFELDZEQUE0RDtBQUV0RCxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUF1Qyw2QkFBWTtJQUFuRDtRQUFBLHFFQW1DQztRQWhDRyxnQkFBVSxHQUFZLElBQUksQ0FBQztRQUczQixZQUFNLEdBQWEsSUFBSSxDQUFDO1FBR3hCLGFBQU8sR0FBYSxJQUFJLENBQUM7UUFHekIsZ0JBQVUsR0FBWSxJQUFJLENBQUM7UUFHM0IsaUJBQVcsR0FBYSxJQUFJLENBQUM7UUFHN0IsY0FBUSxHQUFhLElBQUksQ0FBQzs7SUFpQjlCLENBQUM7SUFmRywwQkFBTSxHQUFOO0lBRUEsQ0FBQztJQUVELHlCQUFLLEdBQUw7SUFFQSxDQUFDO0lBRUQsd0JBQUksR0FBSjtRQUNJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEtBQUcsNkJBQWEsQ0FBQyxRQUFRLENBQUMsSUFBTSxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUcsMkJBQVksQ0FBQyxFQUFJLENBQUM7UUFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQU0sMkJBQVksQ0FBQyxHQUFHLFNBQUksMkJBQVksQ0FBQyxNQUFRLENBQUM7UUFDbkUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBRywyQkFBWSxDQUFDLE9BQVMsQ0FBQztRQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFHLDJCQUFZLENBQUMsSUFBTSxDQUFDO0lBQ2xELENBQUM7SUEvQkQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDUztJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzZDQUNLO0lBR3hCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7OENBQ007SUFHekI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDUztJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2tEQUNVO0lBRzdCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7K0NBQ087SUFsQlQsU0FBUztRQUQ3QixPQUFPO09BQ2EsU0FBUyxDQW1DN0I7SUFBRCxnQkFBQztDQW5DRCxBQW1DQyxDQW5Dc0MsRUFBRSxDQUFDLFNBQVMsR0FtQ2xEO2tCQW5Db0IsU0FBUyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHBsYXllck1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL1BsYXllck1vZHVsZVwiO1xuaW1wb3J0IHsgenl4R2FtZU1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL1p5eEdhbWVNb2R1bGVcIjtcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFp5eENvbVRvcCBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1SW1nRXhwQmFyOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibEx2OiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibEV4cDogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUltZ0F2YXRhcjogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibERpYW1vbmQ6IGNjLkxhYmVsID0gbnVsbDsgXG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFN0YXI6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIG9uTG9hZCgpIHtcblxuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuXG4gICAgfVxuXG4gICAgaW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51bGJsU3Rhci5zdHJpbmcgPSBgJHt6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLnN0YXJ9YDtcbiAgICAgICAgdGhpcy51bGJsTHYuc3RyaW5nID0gYCR7cGxheWVyTW9kdWxlLmx2fWA7XG4gICAgICAgIHRoaXMudWxibEV4cC5zdHJpbmcgPSBgJHtwbGF5ZXJNb2R1bGUuZXhwfS8ke3BsYXllck1vZHVsZS5leHBUYXJ9YDtcbiAgICAgICAgdGhpcy51bGJsRGlhbW9uZC5zdHJpbmcgPSBgJHtwbGF5ZXJNb2R1bGUuZGlhbW9uZH1gO1xuICAgICAgICB0aGlzLnVsYmxTdGFyLnN0cmluZyA9IGAke3BsYXllck1vZHVsZS5zdGFyfWA7XG4gICAgfVxufVxuIl19