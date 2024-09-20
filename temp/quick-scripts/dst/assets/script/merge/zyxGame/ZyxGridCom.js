
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
        this.ulblUniqueId.string = this.uniqueId.toString();
        this.ulblUniqueId.node.active = false;
        if (this.contentType === TypeDefine_1.gridContentType.DIAMOND) {
            this.uImgDiamond.active = true;
        }
        else {
            this.uImgDiamond.active = false;
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHcmlkQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCxtREFBaUU7QUFDakUsZ0RBQTJEO0FBQzNELDRDQUE4QztBQUM5QyxrREFBaUQ7QUFDakQscURBQW9EO0FBQ3BELDZDQUF3QztBQUVsQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxPQUFPO0FBRVA7SUFBd0MsOEJBQVk7SUFBcEQ7UUFBQSxxRUFtTkM7UUFoTkcsaUJBQVcsR0FBWSxJQUFJLENBQUM7UUFHNUIsWUFBTSxHQUFZLElBQUksQ0FBQztRQUd2QixrQkFBWSxHQUFhLElBQUksQ0FBQztRQUV0QixVQUFJLEdBQWEscUJBQVEsQ0FBQyxHQUFHLENBQUM7UUFDL0IsaUJBQVcsR0FBb0IsNEJBQWUsQ0FBQyxLQUFLLENBQUM7UUFDckQsY0FBUSxHQUFXLENBQUMsQ0FBQztRQUVwQixTQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDakIsU0FBRyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXpCLE1BQU07UUFDRSxlQUFTLEdBQVcsQ0FBQyxDQUFDO1FBRTlCLFNBQVM7UUFDRCxhQUFPLEdBQVcsQ0FBQyxDQUFDO1FBRTVCLFNBQVM7UUFDRCxpQkFBVyxHQUFXLENBQUMsQ0FBQztRQUVoQyxVQUFVO1FBQ0YsaUJBQVcsR0FBVyxJQUFJLENBQUM7O0lBdUx2QyxDQUFDO0lBckxHLDJCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxF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ZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL1p5eEdhbWVNb2R1bGVcIjtcbmltcG9ydCB7IGdyaWRDb250ZW50VHlwZSwgZ3JpZFNpemUgfSBmcm9tIFwiLi4vZGVmaW5lL1R5cGVEZWZpbmVcIjtcbmltcG9ydCB7IGF1ZGlvTWdyLCBTSEFLRV9UWVBFIH0gZnJvbSBcIi4uL21hbmFnZXIvQXVkaW9NZ3JcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gXCIuLi9tYW5hZ2VyL0RlZmluZVwiO1xuaW1wb3J0IHsgdWltYW5hZ2VyIH0gZnJvbSBcIi4uL21hbmFnZXIvVWltYW5hZ2VyXCI7XG5pbXBvcnQgeyBldmVudE1hbmFnZXIgfSBmcm9tIFwiLi4vdXRpbC9FdmVudE1hbmFnZXJcIjtcbmltcG9ydCBOZXdVdGlscyBmcm9tIFwiLi4vdXRpbC9OZXdVdGlsc1wiO1xuXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG4vLyDmoLzlrZDnu4Tku7ZcbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaeXhHcmlkQ29tIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdEaWFtb25kOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdCZzogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFVuaXF1ZUlkOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIHNpemU6IGdyaWRTaXplID0gZ3JpZFNpemUuT05FO1xuICAgIHB1YmxpYyBjb250ZW50VHlwZTogZ3JpZENvbnRlbnRUeXBlID0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZO1xuICAgIHB1YmxpYyB1bmlxdWVJZDogbnVtYmVyID0gMDtcblxuICAgIHByaXZhdGUgcm93OiBudW1iZXIgPSAtMTtcbiAgICBwcml2YXRlIGNvbDogbnVtYmVyID0gLTE7XG5cbiAgICAvLyDkvr/lrpzph49cbiAgICBwcml2YXRlIG9mZnNldENudDogbnVtYmVyID0gMDtcblxuICAgIC8vIOWIneWni+eCueWHu+S9jee9rlxuICAgIHByaXZhdGUgb3JpZ2luWDogbnVtYmVyID0gMDtcblxuICAgIC8vIOagvOWtkOWOn+Wni+S9jee9rlxuICAgIHByaXZhdGUgb3JpZ2luR3JpZFg6IG51bWJlciA9IDA7XG5cbiAgICAvLyDmoLzlrZDliKDpmaTnmoTml7bpl7RcbiAgICBwcml2YXRlIHRpbWVEZWxHcmlkOiBudW1iZXIgPSAwLjE4O1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIHRoaXMub25Ub3VjaFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX01PVkUsIHRoaXMub25Ub3VjaE1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uVG91Y2hFbmQsIHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfQ0FOQ0VMLCB0aGlzLm9uVG91Y2hFbmQsIHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXJ0KCkgeyB9XG5cbiAgICBpbml0KGluZm86IFtncmlkU2l6ZSwgZ3JpZENvbnRlbnRUeXBlLCBudW1iZXJdKSB7XG4gICAgICAgIC8vIOagvOWtkOexu+Wei+WfuuehgOWxnuaAp1xuICAgICAgICB0aGlzLnNpemUgPSBpbmZvWzBdO1xuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlID0gaW5mb1sxXTtcbiAgICAgICAgdGhpcy51bmlxdWVJZCA9IGluZm9bMl07XG5cbiAgICAgICAgaWYgKHRoaXMuY29udGVudFR5cGUgPT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5qC85a2Q5aSW6KeC5bC65a+4XG4gICAgICAgIGNvbnN0IG5vZGVXaWR0aCA9IDg0ICogaW5mb1swXTtcbiAgICAgICAgdGhpcy5ub2RlLndpZHRoID0gbm9kZVdpZHRoO1xuICAgICAgICB0aGlzLnVJbWdCZy53aWR0aCA9IHRoaXMubm9kZS53aWR0aDtcbiAgICAgICAgdGhpcy51SW1nQmcueCA9IG5vZGVXaWR0aCAvIDI7XG4gICAgICAgIHRoaXMudUltZ0RpYW1vbmQueCA9IHRoaXMudUltZ0JnLndpZHRoIC8gMjtcbiAgICAgICAgdGhpcy51bGJsVW5pcXVlSWQubm9kZS54ID0gdGhpcy5ub2RlLndpZHRoIC8gMjtcblxuICAgICAgICB0aGlzLnVsYmxVbmlxdWVJZC5zdHJpbmcgPSB0aGlzLnVuaXF1ZUlkLnRvU3RyaW5nKCk7XG4gICAgICAgIHRoaXMudWxibFVuaXF1ZUlkLm5vZGUuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuY29udGVudFR5cGUgPT09IGdyaWRDb250ZW50VHlwZS5ESUFNT05EKSB7XG4gICAgICAgICAgICB0aGlzLnVJbWdEaWFtb25kLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVJbWdEaWFtb25kLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2tpblVybCA9IGBpbWFnZXMvZ3JpZC9jb2xvcl8ke05ld1V0aWxzLnJhbmRvbUludEluY2x1c2l2ZSgxLCAxMyl9YDtcbiAgICAgICAgTmV3VXRpbHMuc2V0U3ByaXRlRnJhbWVCeVVybCh0aGlzLnVJbWdCZy5nZXRDb21wb25lbnQoY2MuU3ByaXRlKSwgc2tpblVybCk7XG4gICAgfVxuXG4gICAgc2V0Um93Q2VsKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xuICAgICAgICB0aGlzLnJvdyA9IHJvdztcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XG4gICAgfVxuXG4gICAgbW92ZVVwKCkge1xuICAgICAgICB0aGlzLnJvdyAtPSAxO1xuICAgIH1cblxuICAgIG1vdmVEb3duKCkge1xuICAgICAgICB0aGlzLnJvdyArPSAxO1xuICAgIH1cblxuICAgIC8vIOWIoOmZpFxuICAgIGVsaW1pbmF0ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zaXplID0gZ3JpZFNpemUuWkVSTztcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZSA9IGdyaWRDb250ZW50VHlwZS5FTVBUWTtcbiAgICAgICAgdGhpcy51bmlxdWVJZCA9IC0xO1xuICAgICAgICBjYy50d2Vlbih0aGlzLm5vZGUpXG4gICAgICAgICAgICAudG8odGhpcy50aW1lRGVsR3JpZCwgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnJlbW92ZUZyb21QYXJlbnQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBvblRvdWNoU3RhcnQoZSkge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IC0xKSByZXR1cm47XG4gICAgICAgIHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkID0gdGhpcy51bmlxdWVJZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblRvdWNoU3RhcnRcIiwgdGhpcy51bmlxdWVJZCwgZS50b3VjaC5nZXRMb2NhdGlvbigpLngpO1xuICAgICAgICB0aGlzLm9yaWdpblggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueDtcbiAgICAgICAgdGhpcy5vcmlnaW5HcmlkWCA9IHRoaXMubm9kZS54O1xuICAgICAgICB0aGlzLm9mZnNldENudCA9IDA7XG5cbiAgICAgICAgYXVkaW9NZ3Iuc2hha2UoU0hBS0VfVFlQRS5MSUdIVCk7XG4gICAgfVxuXG4gICAgb25Ub3VjaE1vdmUoZSk6IHZvaWQge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IHRoaXMudW5pcXVlSWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgZHggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueCAtIHRoaXMub3JpZ2luWDtcblxuICAgICAgICBjb25zdCBjYW5Nb3ZlID0gdGhpcy5jaGVja01vdmUoZHgpO1xuICAgICAgICBpZiAoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IHRoaXMub3JpZ2luR3JpZFggKyB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiB0aGlzLm9mZnNldENudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoaXMubm9kZS5vcGFjaXR5ID0gMTAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Ub3VjaEVuZChlKSB7XG4gICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCAhPT0gdGhpcy51bmlxdWVJZCkgcmV0dXJuO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uVG91Y2hFbmRcIiwgdGhpcy51bmlxdWVJZCk7XG4gICAgICAgIC8vIGNvbnN0IGR4ID0gZS50b3VjaC5nZXRMb2NhdGlvbigpLnggLSB0aGlzLm9yaWdpblg7XG4gICAgICAgIC8vIGxldCBjYW5Nb3ZlID0gdGhpcy5jaGVja01vdmUoZHgpO1xuXG4gICAgICAgIC8vIHRoaXMubm9kZS5vcGFjaXR5ID0gMjU1O1xuXG4gICAgICAgIC8vIGlmIChjYW5Nb3ZlKSB7XG4gICAgICAgIC8vICAgICB0aGlzLm1vdmVDcm9zc1dpc2UoKTtcbiAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgLy8gICAgIHRoaXMubm9kZS54ID0gdGhpcy5vcmlnaW5HcmlkWDtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCfml6Dms5Xnp7vliqgnKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIHRoaXMubW92ZUNyb3NzV2lzZSgpO1xuICAgIH1cblxuICAgIC8vIOajgOa1i+aYr+WQpuWPr+S7peenu+WKqCwg5qCH6K6w54q25oCBXG4gICAgY2hlY2tNb3ZlKGR4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLy8g5a6e6ZmF5LiK5pON5L2c55qE5L2N56e75qC85a2Q56m66Ze0XG4gICAgICAgIGNvbnN0IG9mZnNldENudCA9IE1hdGguZmxvb3IoTWF0aC5hYnMoZHgpIC8genl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoKTtcblxuICAgICAgICAvLyDnkIborrrkuIrmnIDlpKflhYHorrjlj5HnlJ/nmoTmnIDlpKfkvY3np7vnqbrpl7RcbiAgICAgICAgY29uc3Qgcm93RGF0YSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddO1xuICAgICAgICBsZXQgbWF4T2Zmc2V0Q250ID0gMDtcbiAgICAgICAgaWYgKGR4ID4gMCkge1xuICAgICAgICAgICAgLy8g5ZCR5Y+z56e75YqoXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jb2wgKyB0aGlzLnNpemU7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocm93RGF0YVtpXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtYXhPZmZzZXRDbnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWQkeW3puenu+WKqFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY29sIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAocm93RGF0YVtpXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtYXhPZmZzZXRDbnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKGDmlrnlkJE6JHtkeCAvIE1hdGguYWJzKGR4KSA+IDAgPyAn5Y+zJyA6ICflt6YnfSDmi5bliqg6ICR7b2Zmc2V0Q250fSwg5pyA5aSnOiAke21heE9mZnNldENudH1gKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG9mZnNldENudCkgPD0gbWF4T2Zmc2V0Q250KSB7XG4gICAgICAgICAgICB0aGlzLm9mZnNldENudCA9IGR4IC8gTWF0aC5hYnMoZHgpICogb2Zmc2V0Q250O1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9mZnNldENudCA9IGR4IC8gTWF0aC5hYnMoZHgpICogbWF4T2Zmc2V0Q250O1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5a6e6ZmF5Y+R55Sf5qiq5ZCR56e75YqoXG4gICAgbW92ZUNyb3NzV2lzZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub2Zmc2V0Q250ID09PSAwIHx8ICF0aGlzLm9mZnNldENudCkge1xuICAgICAgICAgICAgLy8g5rKh5pyJ5Y+R55Sf5a6e6ZmF55qE5L2N56e7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5rKh5pyJ5Y+R55Sf5a6e6ZmF5L2N56e7LCDmoLzlrZDpgInkuK3nirbmgIHlj5bmtognKTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkID0gLTE7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IHRoaXMub3JpZ2luR3JpZFg7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub2Zmc2V0Q250ID4gMCkge1xuICAgICAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKGDlj7MgLT4gJHt0aGlzLm9mZnNldENudH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVpbWFuYWdlci5zaG93VGlwcyhg5bem56e7IDwtICR7LXRoaXMub2Zmc2V0Q250fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5oyq6LWw55qE5L2N572u572u5Li656m6XG4gICAgICAgIGZvciAobGV0IGNvbCA9IHRoaXMuY29sOyBjb2wgPCB0aGlzLmNvbCArIHRoaXMuc2l6ZTsgY29sKyspIHtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddW2NvbF0gPSBbMCwgMCwgMF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmlrDnmoTkvY3nva4g572u5Li65b2T5YmN5qC85a2QXG4gICAgICAgIGNvbnN0IG5ld1N0YXJ0Q29sID0gdGhpcy5jb2wgKyB0aGlzLm9mZnNldENudDtcbiAgICAgICAgY29uc3QgbmV3RW5kID0gbmV3U3RhcnRDb2wgKyB0aGlzLnNpemU7XG4gICAgICAgIGZvciAobGV0IGNvbCA9IG5ld1N0YXJ0Q29sOyBjb2wgPCBuZXdFbmQ7IGNvbCsrKSB7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdWzBdID0gdGhpcy5zaXplO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd11bY29sXVsxXSA9IHRoaXMuY29udGVudFR5cGU7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdWzJdID0gdGhpcy51bmlxdWVJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjb2xcbiAgICAgICAgdGhpcy5zZXRSb3dDZWwodGhpcy5yb3csIHRoaXMuY29sICsgdGhpcy5vZmZzZXRDbnQpO1xuICAgICAgICB0aGlzLm9yaWdpbkdyaWRYID0gdGhpcy5ub2RlLng7XG5cbiAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5aWVhfQ0hFQ0tfTUVSR0UpO1xuICAgICAgICBjb25zb2xlLmxvZyhg56ysJHt0aGlzLnJvd33ooYzlj5HnlJ/np7vliqjvvJpgLCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvKTtcbiAgICB9XG59XG4iXX0=