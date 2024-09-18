
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
        this.node.getComponent(cc.Sprite)['_type'] = cc.Sprite.Type.SLICED;
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
        if (this.offsetCnt === 0) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHcmlkQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCxtREFBaUU7QUFDakUsNENBQThDO0FBQzlDLGtEQUFpRDtBQUNqRCxxREFBb0Q7QUFDcEQsNkNBQXdDO0FBRWxDLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRTVDLE9BQU87QUFFUDtJQUF3Qyw4QkFBWTtJQUFwRDtRQUFBLHFFQXVNQztRQXBNRyxpQkFBVyxHQUFZLElBQUksQ0FBQztRQUc1QixZQUFNLEdBQVksSUFBSSxDQUFDO1FBR3ZCLGtCQUFZLEdBQWEsSUFBSSxDQUFDO1FBRXRCLFVBQUksR0FBYSxxQkFBUSxDQUFDLEdBQUcsQ0FBQztRQUM5QixpQkFBVyxHQUFvQiw0QkFBZSxDQUFDLEtBQUssQ0FBQztRQUN0RCxjQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXBCLFNBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQixTQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFekIsTUFBTTtRQUNFLGVBQVMsR0FBVyxDQUFDLENBQUM7UUFFOUIsU0FBUztRQUNELGFBQU8sR0FBVyxDQUFDLENBQUM7UUFFNUIsU0FBUztRQUNELGlCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBRWhDLFVBQVU7UUFDRixpQkFBVyxHQUFXLElBQUksQ0FBQzs7SUEyS3ZDLENBQUM7SUF6S0csMkJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJ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Q29udGVudCI6WyJpbXBvcnQgeyB6eXhHYW1lTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvWnl4R2FtZU1vZHVsZVwiO1xuaW1wb3J0IHsgZ3JpZENvbnRlbnRUeXBlLCBncmlkU2l6ZSB9IGZyb20gXCIuLi9kZWZpbmUvVHlwZURlZmluZVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvRGVmaW5lXCI7XG5pbXBvcnQgeyB1aW1hbmFnZXIgfSBmcm9tIFwiLi4vbWFuYWdlci9VaW1hbmFnZXJcIjtcbmltcG9ydCB7IGV2ZW50TWFuYWdlciB9IGZyb20gXCIuLi91dGlsL0V2ZW50TWFuYWdlclwiO1xuaW1wb3J0IE5ld1V0aWxzIGZyb20gXCIuLi91dGlsL05ld1V0aWxzXCI7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbi8vIOagvOWtkOe7hOS7tlxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFp5eEdyaWRDb20gZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUltZ0RpYW1vbmQ6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUltZ0JnOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsVW5pcXVlSWQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIHByaXZhdGUgc2l6ZTogZ3JpZFNpemUgPSBncmlkU2l6ZS5PTkU7XG4gICAgcHJpdmF0ZSBjb250ZW50VHlwZTogZ3JpZENvbnRlbnRUeXBlID0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZO1xuICAgIHB1YmxpYyB1bmlxdWVJZDogbnVtYmVyID0gMDtcblxuICAgIHByaXZhdGUgcm93OiBudW1iZXIgPSAtMTtcbiAgICBwcml2YXRlIGNvbDogbnVtYmVyID0gLTE7XG5cbiAgICAvLyDkvr/lrpzph49cbiAgICBwcml2YXRlIG9mZnNldENudDogbnVtYmVyID0gMDtcblxuICAgIC8vIOWIneWni+eCueWHu+S9jee9rlxuICAgIHByaXZhdGUgb3JpZ2luWDogbnVtYmVyID0gMDtcblxuICAgIC8vIOagvOWtkOWOn+Wni+S9jee9rlxuICAgIHByaXZhdGUgb3JpZ2luR3JpZFg6IG51bWJlciA9IDA7XG5cbiAgICAvLyDmoLzlrZDliKDpmaTnmoTml7bpl7RcbiAgICBwcml2YXRlIHRpbWVEZWxHcmlkOiBudW1iZXIgPSAwLjE4O1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIHRoaXMub25Ub3VjaFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX01PVkUsIHRoaXMub25Ub3VjaE1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uVG91Y2hFbmQsIHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfQ0FOQ0VMLCB0aGlzLm9uVG91Y2hFbmQsIHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXJ0KCkgeyB9XG5cbiAgICBpbml0KGluZm86IFtncmlkU2l6ZSwgZ3JpZENvbnRlbnRUeXBlLCBudW1iZXJdKSB7XG4gICAgICAgIC8vIOagvOWtkOexu+Wei+WfuuehgOWxnuaAp1xuICAgICAgICB0aGlzLnNpemUgPSBpbmZvWzBdO1xuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlID0gaW5mb1sxXTtcbiAgICAgICAgdGhpcy51bmlxdWVJZCA9IGluZm9bMl07XG5cbiAgICAgICAgaWYgKHRoaXMuY29udGVudFR5cGUgPT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5qC85a2Q5aSW6KeC5bC65a+4XG4gICAgICAgIGNvbnN0IG5vZGVXaWR0aCA9IDg0ICogaW5mb1swXTtcbiAgICAgICAgdGhpcy5ub2RlLndpZHRoID0gbm9kZVdpZHRoO1xuICAgICAgICB0aGlzLnVJbWdCZy53aWR0aCA9IHRoaXMubm9kZS53aWR0aDtcbiAgICAgICAgdGhpcy51SW1nQmcueCA9IG5vZGVXaWR0aCAvIDI7XG4gICAgICAgIHRoaXMudUltZ0RpYW1vbmQueCA9IHRoaXMudUltZ0JnLndpZHRoIC8gMjtcbiAgICAgICAgdGhpcy51bGJsVW5pcXVlSWQubm9kZS54ID0gdGhpcy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgdGhpcy51SW1nRGlhbW9uZC5hY3RpdmUgPSB0aGlzLmNvbnRlbnRUeXBlID09PSBncmlkQ29udGVudFR5cGUuRElBTU9ORDtcbiAgICAgICAgdGhpcy51bGJsVW5pcXVlSWQuc3RyaW5nID0gdGhpcy51bmlxdWVJZC50b1N0cmluZygpO1xuXG4gICAgICAgIGNvbnN0IHNraW5VcmwgPSBgaW1hZ2VzL2dyaWQvY29sb3JfJHtOZXdVdGlscy5yYW5kb21JbnRJbmNsdXNpdmUoMSwgMTMpfWA7XG4gICAgICAgIE5ld1V0aWxzLnNldFNwcml0ZUZyYW1lQnlVcmwodGhpcy51SW1nQmcuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSksIHNraW5VcmwpO1xuICAgICAgICB0aGlzLm5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSlbJ190eXBlJ10gPSBjYy5TcHJpdGUuVHlwZS5TTElDRUQ7XG4gICAgfVxuXG4gICAgc2V0Um93Q2VsKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xuICAgICAgICB0aGlzLnJvdyA9IHJvdztcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XG4gICAgfVxuXG4gICAgbW92ZVVwKCkge1xuICAgICAgICB0aGlzLnJvdyAtPSAxO1xuICAgIH1cblxuICAgIG1vdmVEb3duKCkge1xuICAgICAgICB0aGlzLnJvdyArPSAxO1xuICAgIH1cblxuICAgIC8vIOWIoOmZpFxuICAgIGVsaW1pbmF0ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zaXplID0gZ3JpZFNpemUuWkVSTztcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZSA9IGdyaWRDb250ZW50VHlwZS5FTVBUWTtcbiAgICAgICAgdGhpcy51bmlxdWVJZCA9IC0xO1xuICAgICAgICBjYy50d2Vlbih0aGlzLm5vZGUpXG4gICAgICAgICAgICAudG8odGhpcy50aW1lRGVsR3JpZCwgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnJlbW92ZUZyb21QYXJlbnQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBvblRvdWNoU3RhcnQoZSkge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IC0xKSByZXR1cm47XG4gICAgICAgIHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkID0gdGhpcy51bmlxdWVJZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblRvdWNoU3RhcnRcIiwgdGhpcy51bmlxdWVJZCwgZS50b3VjaC5nZXRMb2NhdGlvbigpLngpO1xuICAgICAgICB0aGlzLm9yaWdpblggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueDtcbiAgICAgICAgdGhpcy5vcmlnaW5HcmlkWCA9IHRoaXMubm9kZS54O1xuICAgICAgICB0aGlzLm9mZnNldENudCA9IDA7XG4gICAgfVxuXG4gICAgb25Ub3VjaE1vdmUoZSk6IHZvaWQge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IHRoaXMudW5pcXVlSWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgZHggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueCAtIHRoaXMub3JpZ2luWDtcblxuICAgICAgICBjb25zdCBjYW5Nb3ZlID0gdGhpcy5jaGVja01vdmUoZHgpO1xuICAgICAgICBpZiAoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IHRoaXMub3JpZ2luR3JpZFggKyB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiB0aGlzLm9mZnNldENudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMTAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Ub3VjaEVuZChlKSB7XG4gICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCAhPT0gdGhpcy51bmlxdWVJZCkgcmV0dXJuO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uVG91Y2hFbmRcIiwgdGhpcy51bmlxdWVJZCk7XG4gICAgICAgIGNvbnN0IGR4ID0gZS50b3VjaC5nZXRMb2NhdGlvbigpLnggLSB0aGlzLm9yaWdpblg7XG4gICAgICAgIGxldCBjYW5Nb3ZlID0gdGhpcy5jaGVja01vdmUoZHgpO1xuXG4gICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMjU1O1xuXG4gICAgICAgIGlmIChjYW5Nb3ZlKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVDcm9zc1dpc2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gdGhpcy5vcmlnaW5HcmlkWDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOajgOa1i+aYr+WQpuWPr+S7peenu+WKqCwg5qCH6K6w54q25oCBXG4gICAgY2hlY2tNb3ZlKGR4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLy8g5a6e6ZmF5LiK5pON5L2c55qE5L2N56e75qC85a2Q56m66Ze0XG4gICAgICAgIGNvbnN0IG9mZnNldENudCA9IE1hdGguZmxvb3IoTWF0aC5hYnMoZHgpIC8genl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoKTtcblxuICAgICAgICAvLyDnkIborrrkuIrmnIDlpKflhYHorrjlj5HnlJ/nmoTmnIDlpKfkvY3np7vnqbrpl7RcbiAgICAgICAgY29uc3Qgcm93RGF0YSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddO1xuICAgICAgICBsZXQgbWF4T2Zmc2V0Q250ID0gMDtcbiAgICAgICAgaWYgKGR4ID4gMCkge1xuICAgICAgICAgICAgLy8g5ZCR5Y+z56e75YqoXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jb2wgKyB0aGlzLnNpemU7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocm93RGF0YVtpXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtYXhPZmZzZXRDbnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWQkeW3puenu+WKqFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY29sIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAocm93RGF0YVtpXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtYXhPZmZzZXRDbnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKGDmlrnlkJE6JHtkeCAvIE1hdGguYWJzKGR4KSA+IDAgPyAn5Y+zJyA6ICflt6YnfSDmi5bliqg6ICR7b2Zmc2V0Q250fSwg5pyA5aSnOiAke21heE9mZnNldENudH1gKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG9mZnNldENudCkgPD0gbWF4T2Zmc2V0Q250KSB7XG4gICAgICAgICAgICB0aGlzLm9mZnNldENudCA9IGR4IC8gTWF0aC5hYnMoZHgpICogb2Zmc2V0Q250O1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9mZnNldENudCA9IGR4IC8gTWF0aC5hYnMoZHgpICogbWF4T2Zmc2V0Q250O1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5a6e6ZmF5Y+R55Sf5qiq5ZCR56e75YqoXG4gICAgbW92ZUNyb3NzV2lzZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub2Zmc2V0Q250ID09PSAwKSB7XG4gICAgICAgICAgICAvLyDmsqHmnInlj5HnlJ/lrp7pmYXnmoTkvY3np7tcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmsqHmnInlj5HnlJ/lrp7pmYXkvY3np7ssIOagvOWtkOmAieS4reeKtuaAgeWPlua2iCcpO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgPSAtMTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vZmZzZXRDbnQgPiAwKSB7XG4gICAgICAgICAgICB1aW1hbmFnZXIuc2hvd1RpcHMoYOWPsyAtPiAke3RoaXMub2Zmc2V0Q250fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKGDlt6bnp7sgPC0gJHstdGhpcy5vZmZzZXRDbnR9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmjKrotbDnmoTkvY3nva7nva7kuLrnqbpcbiAgICAgICAgZm9yIChsZXQgY29sID0gdGhpcy5jb2w7IGNvbCA8IHRoaXMuY29sICsgdGhpcy5zaXplOyBjb2wrKykge1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd11bY29sXSA9IFswLCAwLCAwXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaWsOeahOS9jee9riDnva7kuLrlvZPliY3moLzlrZBcbiAgICAgICAgY29uc3QgbmV3U3RhcnRDb2wgPSB0aGlzLmNvbCArIHRoaXMub2Zmc2V0Q250O1xuICAgICAgICBjb25zdCBuZXdFbmQgPSBuZXdTdGFydENvbCArIHRoaXMuc2l6ZTtcbiAgICAgICAgZm9yIChsZXQgY29sID0gbmV3U3RhcnRDb2w7IGNvbCA8IG5ld0VuZDsgY29sKyspIHtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddW2NvbF1bMF0gPSB0aGlzLnNpemU7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdWzFdID0gdGhpcy5jb250ZW50VHlwZTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddW2NvbF1bMl0gPSB0aGlzLnVuaXF1ZUlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIGNvbFxuICAgICAgICB0aGlzLnNldFJvd0NlbCh0aGlzLnJvdywgdGhpcy5jb2wgKyB0aGlzLm9mZnNldENudCk7XG4gICAgICAgIHRoaXMub3JpZ2luR3JpZFggPSB0aGlzLm5vZGUueDtcblxuICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLlpZWF9DSEVDS19NRVJHRSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGDnrKwke3RoaXMucm93feihjOWPkeeUn+enu+WKqO+8mmAsIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8pO1xuICAgIH1cbn1cbiJdfQ==