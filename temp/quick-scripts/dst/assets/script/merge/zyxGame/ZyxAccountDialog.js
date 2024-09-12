
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxAccountDialog.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
        // 重置游戏
        ZyxGameModule_1.zyxGameModule.gameInfo = {
            adTimes: 3,
            score: 0,
            exp: 0,
            diamond: 0,
            star: 0,
        };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhBY2NvdW50RGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCw0Q0FBOEM7QUFDOUMscURBQW9EO0FBRTlDLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRTVDLE9BQU87QUFFUDtJQUE4QyxvQ0FBWTtJQUExRDtRQUFBLHFFQXdDQztRQXJDRyxlQUFTLEdBQWEsSUFBSSxDQUFDO1FBRzNCLGVBQVMsR0FBYSxJQUFJLENBQUM7UUFHM0IsVUFBSSxHQUFZLElBQUksQ0FBQztRQUdyQixZQUFNLEdBQVksSUFBSSxDQUFDOztJQTRCM0IsQ0FBQztJQTFCRyxpQ0FBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELGdDQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyx1QkFBTSw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFPLENBQUM7SUFDakUsQ0FBQztJQUVELGdDQUFLLEdBQUw7UUFBQSxpQkFpQkM7UUFoQkcsT0FBTztRQUNQLDZCQUFhLENBQUMsUUFBUSxHQUFHO1lBQ3JCLE9BQU8sRUFBRSxDQUFDO1lBQ1YsS0FBSyxFQUFFLENBQUM7WUFDUixHQUFHLEVBQUUsQ0FBQztZQUNOLE9BQU8sRUFBRSxDQUFDO1lBQ1YsSUFBSSxFQUFFLENBQUM7U0FDVixDQUFBO1FBQ0QsMkJBQVksQ0FBQyxRQUFRLENBQUMsa0JBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUVoRCxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDZCxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ3JCLElBQUksQ0FBQztZQUNGLEtBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEIsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQXBDRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO3VEQUNRO0lBRzNCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7dURBQ1E7SUFHM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztrREFDRztJQUdyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO29EQUNLO0lBWk4sZ0JBQWdCO1FBRHBDLE9BQU87T0FDYSxnQkFBZ0IsQ0F3Q3BDO0lBQUQsdUJBQUM7Q0F4Q0QsQUF3Q0MsQ0F4QzZDLEVBQUUsQ0FBQyxTQUFTLEdBd0N6RDtrQkF4Q29CLGdCQUFnQiIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHp5eEdhbWVNb2R1bGUgfSBmcm9tIFwiLi4vZGF0YU1vZHVsZS9aeXhHYW1lTW9kdWxlXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwiLi4vbWFuYWdlci9EZWZpbmVcIjtcbmltcG9ydCB7IGV2ZW50TWFuYWdlciB9IGZyb20gXCIuLi91dGlsL0V2ZW50TWFuYWdlclwiO1xuXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG4vLyDnu5PnrpfnlYzpnaJcbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaeXhBY2NvdW50RGlhbG9nIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsVGl0bGU6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsU2NvcmU6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCb3g6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0bk9rOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy51QnRuT2sub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLmNsb3NlLCB0aGlzKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy51bGJsU2NvcmUuc3RyaW5nID0gYOW+l+WIhu+8miR7enl4R2FtZU1vZHVsZS5nYW1lSW5mby5zY29yZX1gO1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICAvLyDph43nva7muLjmiI9cbiAgICAgICAgenl4R2FtZU1vZHVsZS5nYW1lSW5mbyA9IHtcbiAgICAgICAgICAgIGFkVGltZXM6IDMsXG4gICAgICAgICAgICBzY29yZTogMCxcbiAgICAgICAgICAgIGV4cDogMCxcbiAgICAgICAgICAgIGRpYW1vbmQ6IDAsXG4gICAgICAgICAgICBzdGFyOiAwLFxuICAgICAgICB9XG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuWllYX1JFU0VUX0dBTUUpO1xuXG4gICAgICAgIGNjLnR3ZWVuKHRoaXMubm9kZSlcbiAgICAgICAgICAgIC50bygwLjIsIHsgc2NhbGU6IDAgfSlcbiAgICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGFydCgpO1xuICAgIH1cbn1cbiJdfQ==