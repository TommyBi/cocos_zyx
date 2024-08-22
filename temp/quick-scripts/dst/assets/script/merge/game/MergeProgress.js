
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/MergeProgress.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9NZXJnZVByb2dyZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEQUFzRDtBQUVoRCxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUEyQyxpQ0FBWTtJQUF2RDtRQUFBLHFFQXNCQztRQW5CRyxhQUFPLEdBQWEsSUFBSSxDQUFDO1FBR3pCLGFBQU8sR0FBWSxJQUFJLENBQUM7O0lBZ0I1QixDQUFDO0lBZEcsOEJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxxQ0FBYSxHQUFiO1FBQ0ksSUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ25CLElBQU0sR0FBRyxHQUFHLHVCQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUNqQixFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDMUQsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQWpCRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2tEQUNNO0lBR3pCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7a0RBQ007SUFOUCxhQUFhO1FBRGpDLE9BQU87T0FDYSxhQUFhLENBc0JqQztJQUFELG9CQUFDO0NBdEJELEFBc0JDLENBdEIwQyxFQUFFLENBQUMsU0FBUyxHQXNCdEQ7a0JBdEJvQixhQUFhIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2FtZU1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL0dhbWVNb2R1bGVcIjtcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lcmdlUHJvZ3Jlc3MgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxUYXI6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdCYXI6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLnVJbWdCYXIud2lkdGggPSAwO1xuICAgICAgICB0aGlzLnVsYmxUYXIubm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigpLmZyb21IRVgoJyM0YjkxZTQnKTsgICAgICAgIFxuICAgIH1cblxuICAgIHVwZGF0ZVByb3Jlc3MoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHRvdGFsVyA9IDU4NTtcbiAgICAgICAgY29uc3QgdGFyID0gZ2FtZU1vZHVsZS5nZXRNYXhWYWx1ZSgpO1xuICAgICAgICBjb25zdCB0YXJXID0gTWF0aC5mbG9vcih0YXIgLyAxNSAqIHRvdGFsVyk7XG4gICAgICAgIGNjLnR3ZWVuKHRoaXMudUltZ0JhcilcbiAgICAgICAgICAgIC50bygwLjMsIHsgd2lkdGg6IHRhclcgfSwgeyBlYXNpbmc6IGNjLmVhc2luZy5jdWJpY0luT3V0IH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbn1cbiJdfQ==