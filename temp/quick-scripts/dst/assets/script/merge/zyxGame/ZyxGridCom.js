
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
var AudioMgr_1 = require("../manager/AudioMgr");
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
        this.ulblUniqueId.node.active = false;
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
        AudioMgr_1.audioMgr.shake(AudioMgr_1.SHAKE_TYPE.LIGHT);
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
            // this.node.opacity = 100;
        }
    };
    ZyxGridCom.prototype.onTouchEnd = function (e) {
        if (ZyxGameModule_1.zyxGameModule.selectGirdUniqueId !== this.uniqueId)
            return;
        console.log("onTouchEnd", this.uniqueId);
        // const dx = e.touch.getLocation().x - this.originX;
        // let canMove = this.checkMove(dx);
        // this.node.opacity = 255;
        // if (canMove) {
        //     this.moveCrossWise();
        // } else {
        //     this.node.x = this.originGridX;
        //     console.log('无法移动');
        // }
        this.moveCrossWise();
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
            this.node.x = this.originGridX;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHcmlkQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCxtREFBaUU7QUFDakUsZ0RBQTJEO0FBQzNELDRDQUE4QztBQUM5QyxrREFBaUQ7QUFDakQscURBQW9EO0FBQ3BELDZDQUF3QztBQUVsQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxPQUFPO0FBRVA7SUFBd0MsOEJBQVk7SUFBcEQ7UUFBQSxxRUE2TUM7UUExTUcsaUJBQVcsR0FBWSxJQUFJLENBQUM7UUFHNUIsWUFBTSxHQUFZLElBQUksQ0FBQztRQUd2QixrQkFBWSxHQUFhLElBQUksQ0FBQztRQUV0QixVQUFJLEdBQWEscUJBQVEsQ0FBQyxHQUFHLENBQUM7UUFDOUIsaUJBQVcsR0FBb0IsNEJBQWUsQ0FBQyxLQUFLLENBQUM7UUFDdEQsY0FBUSxHQUFXLENBQUMsQ0FBQztRQUVwQixTQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDakIsU0FBRyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXpCLE1BQU07UUFDRSxlQUFTLEdBQVcsQ0FBQyxDQUFDO1FBRTlCLFNBQVM7UUFDRCxhQUFPLEdBQVcsQ0FBQyxDQUFDO1FBRTVCLFNBQVM7UUFDRCxpQkFBVyxHQUFXLENBQUMsQ0FBQztRQUVoQyxVQUFVO1FBQ0YsaUJBQVcsR0FBVyxJQUFJLENBQUM7O0lBaUx2QyxDQUFDO0lBL0tHLDJCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxF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QkFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUM1RCw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUM1RDtRQUVELGFBQWE7UUFDYixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUUvQiwyQkFBWSxDQUFDLFFBQVEsQ0FBQyxrQkFBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBSSxJQUFJLENBQUMsR0FBRyx5Q0FBUSxFQUFFLDZCQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQXpNRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO21EQUNVO0lBRzVCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7OENBQ0s7SUFHdkI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztvREFDVztJQVRiLFVBQVU7UUFEOUIsT0FBTztPQUNhLFVBQVUsQ0E2TTlCO0lBQUQsaUJBQUM7Q0E3TUQsQUE2TUMsQ0E3TXVDLEVBQUUsQ0FBQyxTQUFTLEdBNk1uRDtrQkE3TW9CLFVBQVUiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6eXhHYW1lTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvWnl4R2FtZU1vZHVsZVwiO1xuaW1wb3J0IHsgZ3JpZENvbnRlbnRUeXBlLCBncmlkU2l6ZSB9IGZyb20gXCIuLi9kZWZpbmUvVHlwZURlZmluZVwiO1xuaW1wb3J0IHsgYXVkaW9NZ3IsIFNIQUtFX1RZUEUgfSBmcm9tIFwiLi4vbWFuYWdlci9BdWRpb01nclwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvRGVmaW5lXCI7XG5pbXBvcnQgeyB1aW1hbmFnZXIgfSBmcm9tIFwiLi4vbWFuYWdlci9VaW1hbmFnZXJcIjtcbmltcG9ydCB7IGV2ZW50TWFuYWdlciB9IGZyb20gXCIuLi91dGlsL0V2ZW50TWFuYWdlclwiO1xuaW1wb3J0IE5ld1V0aWxzIGZyb20gXCIuLi91dGlsL05ld1V0aWxzXCI7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbi8vIOagvOWtkOe7hOS7tlxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFp5eEdyaWRDb20gZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUltZ0RpYW1vbmQ6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUltZ0JnOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsVW5pcXVlSWQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIHByaXZhdGUgc2l6ZTogZ3JpZFNpemUgPSBncmlkU2l6ZS5PTkU7XG4gICAgcHJpdmF0ZSBjb250ZW50VHlwZTogZ3JpZENvbnRlbnRUeXBlID0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZO1xuICAgIHB1YmxpYyB1bmlxdWVJZDogbnVtYmVyID0gMDtcblxuICAgIHByaXZhdGUgcm93OiBudW1iZXIgPSAtMTtcbiAgICBwcml2YXRlIGNvbDogbnVtYmVyID0gLTE7XG5cbiAgICAvLyDkvr/lrpzph49cbiAgICBwcml2YXRlIG9mZnNldENudDogbnVtYmVyID0gMDtcblxuICAgIC8vIOWIneWni+eCueWHu+S9jee9rlxuICAgIHByaXZhdGUgb3JpZ2luWDogbnVtYmVyID0gMDtcblxuICAgIC8vIOagvOWtkOWOn+Wni+S9jee9rlxuICAgIHByaXZhdGUgb3JpZ2luR3JpZFg6IG51bWJlciA9IDA7XG5cbiAgICAvLyDmoLzlrZDliKDpmaTnmoTml7bpl7RcbiAgICBwcml2YXRlIHRpbWVEZWxHcmlkOiBudW1iZXIgPSAwLjE4O1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIHRoaXMub25Ub3VjaFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX01PVkUsIHRoaXMub25Ub3VjaE1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uVG91Y2hFbmQsIHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfQ0FOQ0VMLCB0aGlzLm9uVG91Y2hFbmQsIHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXJ0KCkgeyB9XG5cbiAgICBpbml0KGluZm86IFtncmlkU2l6ZSwgZ3JpZENvbnRlbnRUeXBlLCBudW1iZXJdKSB7XG4gICAgICAgIC8vIOagvOWtkOexu+Wei+WfuuehgOWxnuaAp1xuICAgICAgICB0aGlzLnNpemUgPSBpbmZvWzBdO1xuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlID0gaW5mb1sxXTtcbiAgICAgICAgdGhpcy51bmlxdWVJZCA9IGluZm9bMl07XG5cbiAgICAgICAgaWYgKHRoaXMuY29udGVudFR5cGUgPT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5qC85a2Q5aSW6KeC5bC65a+4XG4gICAgICAgIGNvbnN0IG5vZGVXaWR0aCA9IDg0ICogaW5mb1swXTtcbiAgICAgICAgdGhpcy5ub2RlLndpZHRoID0gbm9kZVdpZHRoO1xuICAgICAgICB0aGlzLnVJbWdCZy53aWR0aCA9IHRoaXMubm9kZS53aWR0aDtcbiAgICAgICAgdGhpcy51SW1nQmcueCA9IG5vZGVXaWR0aCAvIDI7XG4gICAgICAgIHRoaXMudUltZ0RpYW1vbmQueCA9IHRoaXMudUltZ0JnLndpZHRoIC8gMjtcbiAgICAgICAgdGhpcy51bGJsVW5pcXVlSWQubm9kZS54ID0gdGhpcy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgdGhpcy51SW1nRGlhbW9uZC5hY3RpdmUgPSB0aGlzLmNvbnRlbnRUeXBlID09PSBncmlkQ29udGVudFR5cGUuRElBTU9ORDtcbiAgICAgICAgdGhpcy51bGJsVW5pcXVlSWQuc3RyaW5nID0gdGhpcy51bmlxdWVJZC50b1N0cmluZygpO1xuICAgICAgICB0aGlzLnVsYmxVbmlxdWVJZC5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IHNraW5VcmwgPSBgaW1hZ2VzL2dyaWQvY29sb3JfJHtOZXdVdGlscy5yYW5kb21JbnRJbmNsdXNpdmUoMSwgMTMpfWA7XG4gICAgICAgIE5ld1V0aWxzLnNldFNwcml0ZUZyYW1lQnlVcmwodGhpcy51SW1nQmcuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSksIHNraW5VcmwpO1xuICAgIH1cblxuICAgIHNldFJvd0NlbChyb3c6IG51bWJlciwgY29sOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5yb3cgPSByb3c7XG4gICAgICAgIHRoaXMuY29sID0gY29sO1xuICAgIH1cblxuICAgIG1vdmVVcCgpIHtcbiAgICAgICAgdGhpcy5yb3cgLT0gMTtcbiAgICB9XG5cbiAgICBtb3ZlRG93bigpIHtcbiAgICAgICAgdGhpcy5yb3cgKz0gMTtcbiAgICB9XG5cbiAgICAvLyDliKDpmaRcbiAgICBlbGltaW5hdGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IGdyaWRTaXplLlpFUk87XG4gICAgICAgIHRoaXMuY29udGVudFR5cGUgPSBncmlkQ29udGVudFR5cGUuRU1QVFk7XG4gICAgICAgIHRoaXMudW5pcXVlSWQgPSAtMTtcbiAgICAgICAgY2MudHdlZW4odGhpcy5ub2RlKVxuICAgICAgICAgICAgLnRvKHRoaXMudGltZURlbEdyaWQsIHsgb3BhY2l0eTogMCB9KVxuICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5yZW1vdmVGcm9tUGFyZW50KCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkICE9PSAtMSkgcmV0dXJuO1xuICAgICAgICB6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCA9IHRoaXMudW5pcXVlSWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib25Ub3VjaFN0YXJ0XCIsIHRoaXMudW5pcXVlSWQsIGUudG91Y2guZ2V0TG9jYXRpb24oKS54KTtcbiAgICAgICAgdGhpcy5vcmlnaW5YID0gZS50b3VjaC5nZXRMb2NhdGlvbigpLng7XG4gICAgICAgIHRoaXMub3JpZ2luR3JpZFggPSB0aGlzLm5vZGUueDtcbiAgICAgICAgdGhpcy5vZmZzZXRDbnQgPSAwO1xuXG4gICAgICAgIGF1ZGlvTWdyLnNoYWtlKFNIQUtFX1RZUEUuTElHSFQpO1xuICAgIH1cblxuICAgIG9uVG91Y2hNb3ZlKGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkICE9PSB0aGlzLnVuaXF1ZUlkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGR4ID0gZS50b3VjaC5nZXRMb2NhdGlvbigpLnggLSB0aGlzLm9yaWdpblg7XG5cbiAgICAgICAgY29uc3QgY2FuTW92ZSA9IHRoaXMuY2hlY2tNb3ZlKGR4KTtcbiAgICAgICAgaWYgKGNhbk1vdmUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMjU1O1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm9yaWdpbkdyaWRYICsgenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogdGhpcy5vZmZzZXRDbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGlzLm5vZGUub3BhY2l0eSA9IDEwMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uVG91Y2hFbmQoZSkge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IHRoaXMudW5pcXVlSWQpIHJldHVybjtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblRvdWNoRW5kXCIsIHRoaXMudW5pcXVlSWQpO1xuICAgICAgICAvLyBjb25zdCBkeCA9IGUudG91Y2guZ2V0TG9jYXRpb24oKS54IC0gdGhpcy5vcmlnaW5YO1xuICAgICAgICAvLyBsZXQgY2FuTW92ZSA9IHRoaXMuY2hlY2tNb3ZlKGR4KTtcblxuICAgICAgICAvLyB0aGlzLm5vZGUub3BhY2l0eSA9IDI1NTtcblxuICAgICAgICAvLyBpZiAoY2FuTW92ZSkge1xuICAgICAgICAvLyAgICAgdGhpcy5tb3ZlQ3Jvc3NXaXNlKCk7XG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICB0aGlzLm5vZGUueCA9IHRoaXMub3JpZ2luR3JpZFg7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygn5peg5rOV56e75YqoJyk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICB0aGlzLm1vdmVDcm9zc1dpc2UoKTtcbiAgICB9XG5cbiAgICAvLyDmo4DmtYvmmK/lkKblj6/ku6Xnp7vliqgsIOagh+iusOeKtuaAgVxuICAgIGNoZWNrTW92ZShkeDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOWunumZheS4iuaTjeS9nOeahOS9jeenu+agvOWtkOepuumXtFxuICAgICAgICBjb25zdCBvZmZzZXRDbnQgPSBNYXRoLmZsb29yKE1hdGguYWJzKGR4KSAvIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCk7XG5cbiAgICAgICAgLy8g55CG6K665LiK5pyA5aSn5YWB6K645Y+R55Sf55qE5pyA5aSn5L2N56e756m66Ze0XG4gICAgICAgIGNvbnN0IHJvd0RhdGEgPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XTtcbiAgICAgICAgbGV0IG1heE9mZnNldENudCA9IDA7XG4gICAgICAgIGlmIChkeCA+IDApIHtcbiAgICAgICAgICAgIC8vIOWQkeWPs+enu+WKqFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY29sICsgdGhpcy5zaXplOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvd0RhdGFbaV1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWF4T2Zmc2V0Q250Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDlkJHlt6bnp7vliqhcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvd0RhdGFbaV1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWF4T2Zmc2V0Q250Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhg5pa55ZCROiR7ZHggLyBNYXRoLmFicyhkeCkgPiAwID8gJ+WPsycgOiAn5bemJ30g5ouW5YqoOiAke29mZnNldENudH0sIOacgOWkpzogJHttYXhPZmZzZXRDbnR9YCk7XG4gICAgICAgIGlmIChNYXRoLmFicyhvZmZzZXRDbnQpIDw9IG1heE9mZnNldENudCkge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXRDbnQgPSBkeCAvIE1hdGguYWJzKGR4KSAqIG9mZnNldENudDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXRDbnQgPSBkeCAvIE1hdGguYWJzKGR4KSAqIG1heE9mZnNldENudDtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWunumZheWPkeeUn+aoquWQkeenu+WKqFxuICAgIG1vdmVDcm9zc1dpc2UoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9mZnNldENudCA9PT0gMCB8fCAhdGhpcy5vZmZzZXRDbnQpIHtcbiAgICAgICAgICAgIC8vIOayoeacieWPkeeUn+WunumZheeahOS9jeenu1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+ayoeacieWPkeeUn+WunumZheS9jeenuywg5qC85a2Q6YCJ5Lit54q25oCB5Y+W5raIJyk7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCA9IC0xO1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm9yaWdpbkdyaWRYO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9mZnNldENudCA+IDApIHtcbiAgICAgICAgICAgIHVpbWFuYWdlci5zaG93VGlwcyhg5Y+zIC0+ICR7dGhpcy5vZmZzZXRDbnR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1aW1hbmFnZXIuc2hvd1RpcHMoYOW3puenuyA8LSAkey10aGlzLm9mZnNldENudH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaMqui1sOeahOS9jee9rue9ruS4uuepulxuICAgICAgICBmb3IgKGxldCBjb2wgPSB0aGlzLmNvbDsgY29sIDwgdGhpcy5jb2wgKyB0aGlzLnNpemU7IGNvbCsrKSB7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdID0gWzAsIDAsIDBdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5paw55qE5L2N572uIOe9ruS4uuW9k+WJjeagvOWtkFxuICAgICAgICBjb25zdCBuZXdTdGFydENvbCA9IHRoaXMuY29sICsgdGhpcy5vZmZzZXRDbnQ7XG4gICAgICAgIGNvbnN0IG5ld0VuZCA9IG5ld1N0YXJ0Q29sICsgdGhpcy5zaXplO1xuICAgICAgICBmb3IgKGxldCBjb2wgPSBuZXdTdGFydENvbDsgY29sIDwgbmV3RW5kOyBjb2wrKykge1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd11bY29sXVswXSA9IHRoaXMuc2l6ZTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddW2NvbF1bMV0gPSB0aGlzLmNvbnRlbnRUeXBlO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd11bY29sXVsyXSA9IHRoaXMudW5pcXVlSWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgY29sXG4gICAgICAgIHRoaXMuc2V0Um93Q2VsKHRoaXMucm93LCB0aGlzLmNvbCArIHRoaXMub2Zmc2V0Q250KTtcbiAgICAgICAgdGhpcy5vcmlnaW5HcmlkWCA9IHRoaXMubm9kZS54O1xuXG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuWllYX0NIRUNLX01FUkdFKTtcbiAgICAgICAgY29uc29sZS5sb2coYOesrCR7dGhpcy5yb3d96KGM5Y+R55Sf56e75Yqo77yaYCwgenl4R2FtZU1vZHVsZS5ncmlkSW5mbyk7XG4gICAgfVxufVxuIl19