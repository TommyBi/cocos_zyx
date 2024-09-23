
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhBY2NvdW50RGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCw0Q0FBOEM7QUFDOUMscURBQW9EO0FBRTlDLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRTVDLE9BQU87QUFFUDtJQUE4QyxvQ0FBWTtJQUExRDtRQUFBLHFFQWdDQztRQTdCRyxlQUFTLEdBQWEsSUFBSSxDQUFDO1FBRzNCLGVBQVMsR0FBYSxJQUFJLENBQUM7UUFHM0IsVUFBSSxHQUFZLElBQUksQ0FBQztRQUdyQixZQUFNLEdBQVksSUFBSSxDQUFDOztJQW9CM0IsQ0FBQztJQWxCRyxpQ0FBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELGdDQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyx1QkFBTSw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFPLENBQUM7SUFDakUsQ0FBQztJQUVELGdDQUFLLEdBQUw7UUFBQSxpQkFTQztRQVJHLDJCQUFZLENBQUMsUUFBUSxDQUFDLGtCQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFaEQsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2QsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNyQixJQUFJLENBQUM7WUFDRixLQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLENBQUMsQ0FBQzthQUNELEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUE1QkQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzt1REFDUTtJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO3VEQUNRO0lBRzNCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7a0RBQ0c7SUFHckI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztvREFDSztJQVpOLGdCQUFnQjtRQURwQyxPQUFPO09BQ2EsZ0JBQWdCLENBZ0NwQztJQUFELHVCQUFDO0NBaENELEFBZ0NDLENBaEM2QyxFQUFFLENBQUMsU0FBUyxHQWdDekQ7a0JBaENvQixnQkFBZ0IiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6eXhHYW1lTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvWnl4R2FtZU1vZHVsZVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvRGVmaW5lXCI7XG5pbXBvcnQgeyBldmVudE1hbmFnZXIgfSBmcm9tIFwiLi4vdXRpbC9FdmVudE1hbmFnZXJcIjtcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuLy8g57uT566X55WM6Z2iXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWnl4QWNjb3VudERpYWxvZyBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFRpdGxlOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFNjb3JlOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1Qm94OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCdG5PazogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMudUJ0bk9rLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5jbG9zZSwgdGhpcyk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMudWxibFNjb3JlLnN0cmluZyA9IGDlvpfliIbvvJoke3p5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmV9YDtcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5aWVhfUkVTRVRfR0FNRSk7XG5cbiAgICAgICAgY2MudHdlZW4odGhpcy5ub2RlKVxuICAgICAgICAgICAgLnRvKDAuMiwgeyBzY2FsZTogMCB9KVxuICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgfVxufVxuIl19