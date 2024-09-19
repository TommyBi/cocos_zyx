
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxGridCom.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '91c73UehBpGm6f6owMD6XWE', 'ZyxGridCom');
// script/merge/zyxGame/ZyxGridCom.ts

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
var TypeDefine_1 = require("../define/TypeDefine");
var Define_1 = require("../manager/Define");
var Uimanager_1 = require("../manager/Uimanager");
var EventManager_1 = require("../util/EventManager");
var NewUtils_1 = require("../util/NewUtils");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 格子组件
var ZyxGridCom = /** @class */ (function (_super) {
    __extends(ZyxGridCom, _super);
    function ZyxGridCom() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uImgDiamond = null;
        _this.uImgBg = null;
        _this.ulblUniqueId = null;
        _this.size = TypeDefine_1.gridSize.ONE;
        _this.contentType = TypeDefine_1.gridContentType.EMPTY;
        _this.uniqueId = 0;
        _this.row = -1;
        _this.col = -1;
        // 便宜量
        _this.offsetCnt = 0;
        // 初始点击位置
        _this.originX = 0;
        // 格子原始位置
        _this.originGridX = 0;
        // 格子删除的时间
        _this.timeDelGrid = 0.18;
        return _this;
    }
    ZyxGridCom.prototype.onLoad = function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    };
    ZyxGridCom.prototype.start = function () { };
    ZyxGridCom.prototype.init = function (info) {
        // 格子类型基础属性
        this.size = info[0];
        this.contentType = info[1];
        this.uniqueId = info[2];
        if (this.contentType === TypeDefine_1.gridContentType.EMPTY) {
            this.node.active = false;
            return;
        }
        // 格子外观尺寸
        var nodeWidth = 84 * info[0];
        this.node.width = nodeWidth;
        this.uImgBg.width = this.node.width;
        this.uImgBg.x = nodeWidth / 2;
        this.uImgDiamond.x = this.uImgBg.width / 2;
        this.ulblUniqueId.node.x = this.node.width / 2;
        this.uImgDiamond.active = this.contentType === TypeDefine_1.gridContentType.DIAMOND;
        this.ulblUniqueId.string = this.uniqueId.toString();
        var skinUrl = "images/grid/color_" + NewUtils_1.default.randomIntInclusive(1, 13);
        NewUtils_1.default.setSpriteFrameByUrl(this.uImgBg.getComponent(cc.Sprite), skinUrl);
    };
    ZyxGridCom.prototype.setRowCel = function (row, col) {
        this.row = row;
        this.col = col;
    };
    ZyxGridCom.prototype.moveUp = function () {
        this.row -= 1;
    };
    ZyxGridCom.prototype.moveDown = function () {
        this.row += 1;
    };
    // 删除
    ZyxGridCom.prototype.eliminate = function () {
        var _this = this;
        this.size = TypeDefine_1.gridSize.ZERO;
        this.contentType = TypeDefine_1.gridContentType.EMPTY;
        this.uniqueId = -1;
        cc.tween(this.node)
            .to(this.timeDelGrid, { opacity: 0 })
            .call(function () {
            _this.node.removeFromParent();
        })
            .start();
    };
    ZyxGridCom.prototype.onTouchStart = function (e) {
        if (ZyxGameModule_1.zyxGameModule.selectGirdUniqueId !== -1)
            return;
        ZyxGameModule_1.zyxGameModule.selectGirdUniqueId = this.uniqueId;
        console.log("onTouchStart", this.uniqueId, e.touch.getLocation().x);
        this.originX = e.touch.getLocation().x;
        this.originGridX = this.node.x;
        this.offsetCnt = 0;
    };
    ZyxGridCom.prototype.onTouchMove = function (e) {
        if (ZyxGameModule_1.zyxGameModule.selectGirdUniqueId !== this.uniqueId)
            return;
        var dx = e.touch.getLocation().x - this.originX;
        var canMove = this.checkMove(dx);
        if (canMove) {
            this.node.opacity = 255;
            this.node.x = this.originGridX + ZyxGameModule_1.zyxGameModule.gridsWidth * this.offsetCnt;
        }
        else {
            this.node.opacity = 100;
        }
    };
    ZyxGridCom.prototype.onTouchEnd = function (e) {
        if (ZyxGameModule_1.zyxGameModule.selectGirdUniqueId !== this.uniqueId)
            return;
        console.log("onTouchEnd", this.uniqueId);
        var dx = e.touch.getLocation().x - this.originX;
        var canMove = this.checkMove(dx);
        this.node.opacity = 255;
        if (canMove) {
            this.moveCrossWise();
        }
        else {
            this.node.x = this.originGridX;
        }
    };
    // 检测是否可以移动, 标记状态
    ZyxGridCom.prototype.checkMove = function (dx) {
        // 实际上操作的位移格子空间
        var offsetCnt = Math.floor(Math.abs(dx) / ZyxGameModule_1.zyxGameModule.gridsWidth);
        // 理论上最大允许发生的最大位移空间
        var rowData = ZyxGameModule_1.zyxGameModule.gridInfo[this.row];
        var maxOffsetCnt = 0;
        if (dx > 0) {
            // 向右移动
            for (var i = this.col + this.size; i < 8; i++) {
                if (rowData[i][1] !== TypeDefine_1.gridContentType.EMPTY) {
                    break;
                }
                maxOffsetCnt++;
            }
        }
        else {
            // 向左移动
            for (var i = this.col - 1; i >= 0; i--) {
                if (rowData[i][1] !== TypeDefine_1.gridContentType.EMPTY) {
                    break;
                }
                maxOffsetCnt++;
            }
        }
        console.log("\u65B9\u5411:" + (dx / Math.abs(dx) > 0 ? '右' : '左') + " \u62D6\u52A8: " + offsetCnt + ", \u6700\u5927: " + maxOffsetCnt);
        if (Math.abs(offsetCnt) <= maxOffsetCnt) {
            this.offsetCnt = dx / Math.abs(dx) * offsetCnt;
            return true;
        }
        else {
            this.offsetCnt = dx / Math.abs(dx) * maxOffsetCnt;
            return false;
        }
    };
    // 实际发生横向移动
    ZyxGridCom.prototype.moveCrossWise = function () {
        if (this.offsetCnt === 0 || !this.offsetCnt) {
            // 没有发生实际的位移
            console.log('没有发生实际位移, 格子选中状态取消');
            ZyxGameModule_1.zyxGameModule.selectGirdUniqueId = -1;
            return;
        }
        if (this.offsetCnt > 0) {
            Uimanager_1.uimanager.showTips("\u53F3 -> " + this.offsetCnt);
        }
        else {
            Uimanager_1.uimanager.showTips("\u5DE6\u79FB <- " + -this.offsetCnt);
        }
        // 挪走的位置置为空
        for (var col = this.col; col < this.col + this.size; col++) {
            ZyxGameModule_1.zyxGameModule.gridInfo[this.row][col] = [0, 0, 0];
        }
        // 新的位置 置为当前格子
        var newStartCol = this.col + this.offsetCnt;
        var newEnd = newStartCol + this.size;
        for (var col = newStartCol; col < newEnd; col++) {
            ZyxGameModule_1.zyxGameModule.gridInfo[this.row][col][0] = this.size;
            ZyxGameModule_1.zyxGameModule.gridInfo[this.row][col][1] = this.contentType;
            ZyxGameModule_1.zyxGameModule.gridInfo[this.row][col][2] = this.uniqueId;
        }
        // update col
        this.setRowCel(this.row, this.col + this.offsetCnt);
        this.originGridX = this.node.x;
        EventManager_1.eventManager.dispatch(Define_1.EventType.ZYX_CHECK_MERGE);
        console.log("\u7B2C" + this.row + "\u884C\u53D1\u751F\u79FB\u52A8\uFF1A", ZyxGameModule_1.zyxGameModule.gridInfo);
    };
    __decorate([
        property(cc.Node)
    ], ZyxGridCom.prototype, "uImgDiamond", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGridCom.prototype, "uImgBg", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxGridCom.prototype, "ulblUniqueId", void 0);
    ZyxGridCom = __decorate([
        ccclass
    ], ZyxGridCom);
    return ZyxGridCom;
}(cc.Component));
exports.default = ZyxGridCom;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHcmlkQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCxtREFBaUU7QUFDakUsNENBQThDO0FBQzlDLGtEQUFpRDtBQUNqRCxxREFBb0Q7QUFDcEQsNkNBQXdDO0FBRWxDLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRTVDLE9BQU87QUFFUDtJQUF3Qyw4QkFBWTtJQUFwRDtRQUFBLHFFQXNNQztRQW5NRyxpQkFBVyxHQUFZLElBQUksQ0FBQztRQUc1QixZQUFNLEdBQVksSUFBSSxDQUFDO1FBR3ZCLGtCQUFZLEdBQWEsSUFBSSxDQUFDO1FBRXRCLFVBQUksR0FBYSxxQkFBUSxDQUFDLEdBQUcsQ0FBQztRQUM5QixpQkFBVyxHQUFvQiw0QkFBZSxDQUFDLEtBQUssQ0FBQztRQUN0RCxjQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXBCLFNBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQixTQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFekIsTUFBTTtRQUNFLGVBQVMsR0FBVyxDQUFDLENBQUM7UUFFOUIsU0FBUztRQUNELGFBQU8sR0FBVyxDQUFDLENBQUM7UUFFNUIsU0FBUztRQUNELGlCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBRWhDLFVBQVU7UUFDRixpQkFBVyxHQUFXLElBQUksQ0FBQzs7SUEwS3ZDLENBQUM7SUF4S0csMkJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJ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LENBQUMsSUFBSSxDQUFDO1lBQ3JELDZCQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQzVELDZCQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQzVEO1FBRUQsYUFBYTtRQUNiLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRS9CLDJCQUFZLENBQUMsUUFBUSxDQUFDLGtCQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFJLElBQUksQ0FBQyxHQUFHLHlDQUFRLEVBQUUsNkJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBbE1EO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7bURBQ1U7SUFHNUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDSztJQUd2QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO29EQUNXO0lBVGIsVUFBVTtRQUQ5QixPQUFPO09BQ2EsVUFBVSxDQXNNOUI7SUFBRCxpQkFBQztDQXRNRCxBQXNNQyxDQXRNdUMsRUFBRSxDQUFDLFNBQVMsR0FzTW5EO2tCQXRNb0IsVUFBVSIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHp5eEdhbWVNb2R1bGUgfSBmcm9tIFwiLi4vZGF0YU1vZHVsZS9aeXhHYW1lTW9kdWxlXCI7XG5pbXBvcnQgeyBncmlkQ29udGVudFR5cGUsIGdyaWRTaXplIH0gZnJvbSBcIi4uL2RlZmluZS9UeXBlRGVmaW5lXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwiLi4vbWFuYWdlci9EZWZpbmVcIjtcbmltcG9ydCB7IHVpbWFuYWdlciB9IGZyb20gXCIuLi9tYW5hZ2VyL1VpbWFuYWdlclwiO1xuaW1wb3J0IHsgZXZlbnRNYW5hZ2VyIH0gZnJvbSBcIi4uL3V0aWwvRXZlbnRNYW5hZ2VyXCI7XG5pbXBvcnQgTmV3VXRpbHMgZnJvbSBcIi4uL3V0aWwvTmV3VXRpbHNcIjtcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuLy8g5qC85a2Q57uE5Lu2XG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWnl4R3JpZENvbSBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1SW1nRGlhbW9uZDogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1SW1nQmc6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxVbmlxdWVJZDogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBzaXplOiBncmlkU2l6ZSA9IGdyaWRTaXplLk9ORTtcbiAgICBwcml2YXRlIGNvbnRlbnRUeXBlOiBncmlkQ29udGVudFR5cGUgPSBncmlkQ29udGVudFR5cGUuRU1QVFk7XG4gICAgcHVibGljIHVuaXF1ZUlkOiBudW1iZXIgPSAwO1xuXG4gICAgcHJpdmF0ZSByb3c6IG51bWJlciA9IC0xO1xuICAgIHByaXZhdGUgY29sOiBudW1iZXIgPSAtMTtcblxuICAgIC8vIOS+v+WunOmHj1xuICAgIHByaXZhdGUgb2Zmc2V0Q250OiBudW1iZXIgPSAwO1xuXG4gICAgLy8g5Yid5aeL54K55Ye75L2N572uXG4gICAgcHJpdmF0ZSBvcmlnaW5YOiBudW1iZXIgPSAwO1xuXG4gICAgLy8g5qC85a2Q5Y6f5aeL5L2N572uXG4gICAgcHJpdmF0ZSBvcmlnaW5HcmlkWDogbnVtYmVyID0gMDtcblxuICAgIC8vIOagvOWtkOWIoOmZpOeahOaXtumXtFxuICAgIHByaXZhdGUgdGltZURlbEdyaWQ6IG51bWJlciA9IDAuMTg7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgdGhpcy5vblRvdWNoU3RhcnQsIHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfTU9WRSwgdGhpcy5vblRvdWNoTW92ZSwgdGhpcyk7XG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25Ub3VjaEVuZCwgdGhpcyk7XG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9DQU5DRUwsIHRoaXMub25Ub3VjaEVuZCwgdGhpcyk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7IH1cblxuICAgIGluaXQoaW5mbzogW2dyaWRTaXplLCBncmlkQ29udGVudFR5cGUsIG51bWJlcl0pIHtcbiAgICAgICAgLy8g5qC85a2Q57G75Z6L5Z+656GA5bGe5oCnXG4gICAgICAgIHRoaXMuc2l6ZSA9IGluZm9bMF07XG4gICAgICAgIHRoaXMuY29udGVudFR5cGUgPSBpbmZvWzFdO1xuICAgICAgICB0aGlzLnVuaXF1ZUlkID0gaW5mb1syXTtcblxuICAgICAgICBpZiAodGhpcy5jb250ZW50VHlwZSA9PT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmoLzlrZDlpJbop4LlsLrlr7hcbiAgICAgICAgY29uc3Qgbm9kZVdpZHRoID0gODQgKiBpbmZvWzBdO1xuICAgICAgICB0aGlzLm5vZGUud2lkdGggPSBub2RlV2lkdGg7XG4gICAgICAgIHRoaXMudUltZ0JnLndpZHRoID0gdGhpcy5ub2RlLndpZHRoO1xuICAgICAgICB0aGlzLnVJbWdCZy54ID0gbm9kZVdpZHRoIC8gMjtcbiAgICAgICAgdGhpcy51SW1nRGlhbW9uZC54ID0gdGhpcy51SW1nQmcud2lkdGggLyAyO1xuICAgICAgICB0aGlzLnVsYmxVbmlxdWVJZC5ub2RlLnggPSB0aGlzLm5vZGUud2lkdGggLyAyO1xuICAgICAgICB0aGlzLnVJbWdEaWFtb25kLmFjdGl2ZSA9IHRoaXMuY29udGVudFR5cGUgPT09IGdyaWRDb250ZW50VHlwZS5ESUFNT05EO1xuICAgICAgICB0aGlzLnVsYmxVbmlxdWVJZC5zdHJpbmcgPSB0aGlzLnVuaXF1ZUlkLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgY29uc3Qgc2tpblVybCA9IGBpbWFnZXMvZ3JpZC9jb2xvcl8ke05ld1V0aWxzLnJhbmRvbUludEluY2x1c2l2ZSgxLCAxMyl9YDtcbiAgICAgICAgTmV3VXRpbHMuc2V0U3ByaXRlRnJhbWVCeVVybCh0aGlzLnVJbWdCZy5nZXRDb21wb25lbnQoY2MuU3ByaXRlKSwgc2tpblVybCk7XG4gICAgfVxuXG4gICAgc2V0Um93Q2VsKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xuICAgICAgICB0aGlzLnJvdyA9IHJvdztcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XG4gICAgfVxuXG4gICAgbW92ZVVwKCkge1xuICAgICAgICB0aGlzLnJvdyAtPSAxO1xuICAgIH1cblxuICAgIG1vdmVEb3duKCkge1xuICAgICAgICB0aGlzLnJvdyArPSAxO1xuICAgIH1cblxuICAgIC8vIOWIoOmZpFxuICAgIGVsaW1pbmF0ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zaXplID0gZ3JpZFNpemUuWkVSTztcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZSA9IGdyaWRDb250ZW50VHlwZS5FTVBUWTtcbiAgICAgICAgdGhpcy51bmlxdWVJZCA9IC0xO1xuICAgICAgICBjYy50d2Vlbih0aGlzLm5vZGUpXG4gICAgICAgICAgICAudG8odGhpcy50aW1lRGVsR3JpZCwgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnJlbW92ZUZyb21QYXJlbnQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBvblRvdWNoU3RhcnQoZSkge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IC0xKSByZXR1cm47XG4gICAgICAgIHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkID0gdGhpcy51bmlxdWVJZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblRvdWNoU3RhcnRcIiwgdGhpcy51bmlxdWVJZCwgZS50b3VjaC5nZXRMb2NhdGlvbigpLngpO1xuICAgICAgICB0aGlzLm9yaWdpblggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueDtcbiAgICAgICAgdGhpcy5vcmlnaW5HcmlkWCA9IHRoaXMubm9kZS54O1xuICAgICAgICB0aGlzLm9mZnNldENudCA9IDA7XG4gICAgfVxuXG4gICAgb25Ub3VjaE1vdmUoZSk6IHZvaWQge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IHRoaXMudW5pcXVlSWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgZHggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueCAtIHRoaXMub3JpZ2luWDtcblxuICAgICAgICBjb25zdCBjYW5Nb3ZlID0gdGhpcy5jaGVja01vdmUoZHgpO1xuICAgICAgICBpZiAoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IHRoaXMub3JpZ2luR3JpZFggKyB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiB0aGlzLm9mZnNldENudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMTAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Ub3VjaEVuZChlKSB7XG4gICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCAhPT0gdGhpcy51bmlxdWVJZCkgcmV0dXJuO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uVG91Y2hFbmRcIiwgdGhpcy51bmlxdWVJZCk7XG4gICAgICAgIGNvbnN0IGR4ID0gZS50b3VjaC5nZXRMb2NhdGlvbigpLnggLSB0aGlzLm9yaWdpblg7XG4gICAgICAgIGxldCBjYW5Nb3ZlID0gdGhpcy5jaGVja01vdmUoZHgpO1xuXG4gICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMjU1O1xuXG4gICAgICAgIGlmIChjYW5Nb3ZlKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVDcm9zc1dpc2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gdGhpcy5vcmlnaW5HcmlkWDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOajgOa1i+aYr+WQpuWPr+S7peenu+WKqCwg5qCH6K6w54q25oCBXG4gICAgY2hlY2tNb3ZlKGR4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLy8g5a6e6ZmF5LiK5pON5L2c55qE5L2N56e75qC85a2Q56m66Ze0XG4gICAgICAgIGNvbnN0IG9mZnNldENudCA9IE1hdGguZmxvb3IoTWF0aC5hYnMoZHgpIC8genl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoKTtcblxuICAgICAgICAvLyDnkIborrrkuIrmnIDlpKflhYHorrjlj5HnlJ/nmoTmnIDlpKfkvY3np7vnqbrpl7RcbiAgICAgICAgY29uc3Qgcm93RGF0YSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddO1xuICAgICAgICBsZXQgbWF4T2Zmc2V0Q250ID0gMDtcbiAgICAgICAgaWYgKGR4ID4gMCkge1xuICAgICAgICAgICAgLy8g5ZCR5Y+z56e75YqoXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jb2wgKyB0aGlzLnNpemU7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocm93RGF0YVtpXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtYXhPZmZzZXRDbnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWQkeW3puenu+WKqFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY29sIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAocm93RGF0YVtpXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtYXhPZmZzZXRDbnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKGDmlrnlkJE6JHtkeCAvIE1hdGguYWJzKGR4KSA+IDAgPyAn5Y+zJyA6ICflt6YnfSDmi5bliqg6ICR7b2Zmc2V0Q250fSwg5pyA5aSnOiAke21heE9mZnNldENudH1gKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG9mZnNldENudCkgPD0gbWF4T2Zmc2V0Q250KSB7XG4gICAgICAgICAgICB0aGlzLm9mZnNldENudCA9IGR4IC8gTWF0aC5hYnMoZHgpICogb2Zmc2V0Q250O1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9mZnNldENudCA9IGR4IC8gTWF0aC5hYnMoZHgpICogbWF4T2Zmc2V0Q250O1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5a6e6ZmF5Y+R55Sf5qiq5ZCR56e75YqoXG4gICAgbW92ZUNyb3NzV2lzZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub2Zmc2V0Q250ID09PSAwIHx8ICF0aGlzLm9mZnNldENudCkge1xuICAgICAgICAgICAgLy8g5rKh5pyJ5Y+R55Sf5a6e6ZmF55qE5L2N56e7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5rKh5pyJ5Y+R55Sf5a6e6ZmF5L2N56e7LCDmoLzlrZDpgInkuK3nirbmgIHlj5bmtognKTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkID0gLTE7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub2Zmc2V0Q250ID4gMCkge1xuICAgICAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKGDlj7MgLT4gJHt0aGlzLm9mZnNldENudH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVpbWFuYWdlci5zaG93VGlwcyhg5bem56e7IDwtICR7LXRoaXMub2Zmc2V0Q250fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5oyq6LWw55qE5L2N572u572u5Li656m6XG4gICAgICAgIGZvciAobGV0IGNvbCA9IHRoaXMuY29sOyBjb2wgPCB0aGlzLmNvbCArIHRoaXMuc2l6ZTsgY29sKyspIHtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddW2NvbF0gPSBbMCwgMCwgMF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmlrDnmoTkvY3nva4g572u5Li65b2T5YmN5qC85a2QXG4gICAgICAgIGNvbnN0IG5ld1N0YXJ0Q29sID0gdGhpcy5jb2wgKyB0aGlzLm9mZnNldENudDtcbiAgICAgICAgY29uc3QgbmV3RW5kID0gbmV3U3RhcnRDb2wgKyB0aGlzLnNpemU7XG4gICAgICAgIGZvciAobGV0IGNvbCA9IG5ld1N0YXJ0Q29sOyBjb2wgPCBuZXdFbmQ7IGNvbCsrKSB7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdWzBdID0gdGhpcy5zaXplO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd11bY29sXVsxXSA9IHRoaXMuY29udGVudFR5cGU7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdWzJdID0gdGhpcy51bmlxdWVJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjb2xcbiAgICAgICAgdGhpcy5zZXRSb3dDZWwodGhpcy5yb3csIHRoaXMuY29sICsgdGhpcy5vZmZzZXRDbnQpO1xuICAgICAgICB0aGlzLm9yaWdpbkdyaWRYID0gdGhpcy5ub2RlLng7XG5cbiAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5aWVhfQ0hFQ0tfTUVSR0UpO1xuICAgICAgICBjb25zb2xlLmxvZyhg56ysJHt0aGlzLnJvd33ooYzlj5HnlJ/np7vliqjvvJpgLCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvKTtcbiAgICB9XG59XG4iXX0=