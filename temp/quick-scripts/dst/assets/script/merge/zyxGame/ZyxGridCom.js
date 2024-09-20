
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHcmlkQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCxtREFBaUU7QUFDakUsZ0RBQTJEO0FBQzNELDRDQUE4QztBQUM5QyxrREFBaUQ7QUFDakQscURBQW9EO0FBQ3BELDZDQUF3QztBQUVsQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxPQUFPO0FBRVA7SUFBd0MsOEJBQVk7SUFBcEQ7UUFBQSxxRUE0TUM7UUF6TUcsaUJBQVcsR0FBWSxJQUFJLENBQUM7UUFHNUIsWUFBTSxHQUFZLElBQUksQ0FBQztRQUd2QixrQkFBWSxHQUFhLElBQUksQ0FBQztRQUV0QixVQUFJLEdBQWEscUJBQVEsQ0FBQyxHQUFHLENBQUM7UUFDOUIsaUJBQVcsR0FBb0IsNEJBQWUsQ0FBQyxLQUFLLENBQUM7UUFDdEQsY0FBUSxHQUFXLENBQUMsQ0FBQztRQUVwQixTQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDakIsU0FBRyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXpCLE1BQU07UUFDRSxlQUFTLEdBQVcsQ0FBQyxDQUFDO1FBRTlCLFNBQVM7UUFDRCxhQUFPLEdBQVcsQ0FBQyxDQUFDO1FBRTVCLFNBQVM7UUFDRCxpQkFBVyxHQUFXLENBQUMsQ0FBQztRQUVoQyxVQUFVO1FBQ0YsaUJBQVcsR0FBVyxJQUFJLENBQUM7O0lBZ0x2QyxDQUFDO0lBOUtHLDJCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxF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QUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDNUQsNkJBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDNUQ7UUFFRCxhQUFhO1FBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFL0IsMkJBQVksQ0FBQyxRQUFRLENBQUMsa0JBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQUksSUFBSSxDQUFDLEdBQUcseUNBQVEsRUFBRSw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUF4TUQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzttREFDVTtJQUc1QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzhDQUNLO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7b0RBQ1c7SUFUYixVQUFVO1FBRDlCLE9BQU87T0FDYSxVQUFVLENBNE05QjtJQUFELGlCQUFDO0NBNU1ELEFBNE1DLENBNU11QyxFQUFFLENBQUMsU0FBUyxHQTRNbkQ7a0JBNU1vQixVQUFVIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgenl4R2FtZU1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL1p5eEdhbWVNb2R1bGVcIjtcbmltcG9ydCB7IGdyaWRDb250ZW50VHlwZSwgZ3JpZFNpemUgfSBmcm9tIFwiLi4vZGVmaW5lL1R5cGVEZWZpbmVcIjtcbmltcG9ydCB7IGF1ZGlvTWdyLCBTSEFLRV9UWVBFIH0gZnJvbSBcIi4uL21hbmFnZXIvQXVkaW9NZ3JcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gXCIuLi9tYW5hZ2VyL0RlZmluZVwiO1xuaW1wb3J0IHsgdWltYW5hZ2VyIH0gZnJvbSBcIi4uL21hbmFnZXIvVWltYW5hZ2VyXCI7XG5pbXBvcnQgeyBldmVudE1hbmFnZXIgfSBmcm9tIFwiLi4vdXRpbC9FdmVudE1hbmFnZXJcIjtcbmltcG9ydCBOZXdVdGlscyBmcm9tIFwiLi4vdXRpbC9OZXdVdGlsc1wiO1xuXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG4vLyDmoLzlrZDnu4Tku7ZcbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaeXhHcmlkQ29tIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdEaWFtb25kOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdCZzogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFVuaXF1ZUlkOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIHNpemU6IGdyaWRTaXplID0gZ3JpZFNpemUuT05FO1xuICAgIHByaXZhdGUgY29udGVudFR5cGU6IGdyaWRDb250ZW50VHlwZSA9IGdyaWRDb250ZW50VHlwZS5FTVBUWTtcbiAgICBwdWJsaWMgdW5pcXVlSWQ6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIHJvdzogbnVtYmVyID0gLTE7XG4gICAgcHJpdmF0ZSBjb2w6IG51bWJlciA9IC0xO1xuXG4gICAgLy8g5L6/5a6c6YePXG4gICAgcHJpdmF0ZSBvZmZzZXRDbnQ6IG51bWJlciA9IDA7XG5cbiAgICAvLyDliJ3lp4vngrnlh7vkvY3nva5cbiAgICBwcml2YXRlIG9yaWdpblg6IG51bWJlciA9IDA7XG5cbiAgICAvLyDmoLzlrZDljp/lp4vkvY3nva5cbiAgICBwcml2YXRlIG9yaWdpbkdyaWRYOiBudW1iZXIgPSAwO1xuXG4gICAgLy8g5qC85a2Q5Yig6Zmk55qE5pe26Ze0XG4gICAgcHJpdmF0ZSB0aW1lRGVsR3JpZDogbnVtYmVyID0gMC4xODtcblxuICAgIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCB0aGlzLm9uVG91Y2hTdGFydCwgdGhpcyk7XG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9NT1ZFLCB0aGlzLm9uVG91Y2hNb3ZlLCB0aGlzKTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vblRvdWNoRW5kLCB0aGlzKTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0NBTkNFTCwgdGhpcy5vblRvdWNoRW5kLCB0aGlzKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHsgfVxuXG4gICAgaW5pdChpbmZvOiBbZ3JpZFNpemUsIGdyaWRDb250ZW50VHlwZSwgbnVtYmVyXSkge1xuICAgICAgICAvLyDmoLzlrZDnsbvlnovln7rnoYDlsZ7mgKdcbiAgICAgICAgdGhpcy5zaXplID0gaW5mb1swXTtcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZSA9IGluZm9bMV07XG4gICAgICAgIHRoaXMudW5pcXVlSWQgPSBpbmZvWzJdO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbnRlbnRUeXBlID09PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOagvOWtkOWkluinguWwuuWvuFxuICAgICAgICBjb25zdCBub2RlV2lkdGggPSA4NCAqIGluZm9bMF07XG4gICAgICAgIHRoaXMubm9kZS53aWR0aCA9IG5vZGVXaWR0aDtcbiAgICAgICAgdGhpcy51SW1nQmcud2lkdGggPSB0aGlzLm5vZGUud2lkdGg7XG4gICAgICAgIHRoaXMudUltZ0JnLnggPSBub2RlV2lkdGggLyAyO1xuICAgICAgICB0aGlzLnVJbWdEaWFtb25kLnggPSB0aGlzLnVJbWdCZy53aWR0aCAvIDI7XG4gICAgICAgIHRoaXMudWxibFVuaXF1ZUlkLm5vZGUueCA9IHRoaXMubm9kZS53aWR0aCAvIDI7XG4gICAgICAgIHRoaXMudUltZ0RpYW1vbmQuYWN0aXZlID0gdGhpcy5jb250ZW50VHlwZSA9PT0gZ3JpZENvbnRlbnRUeXBlLkRJQU1PTkQ7XG4gICAgICAgIHRoaXMudWxibFVuaXF1ZUlkLnN0cmluZyA9IHRoaXMudW5pcXVlSWQudG9TdHJpbmcoKTtcblxuICAgICAgICBjb25zdCBza2luVXJsID0gYGltYWdlcy9ncmlkL2NvbG9yXyR7TmV3VXRpbHMucmFuZG9tSW50SW5jbHVzaXZlKDEsIDEzKX1gO1xuICAgICAgICBOZXdVdGlscy5zZXRTcHJpdGVGcmFtZUJ5VXJsKHRoaXMudUltZ0JnLmdldENvbXBvbmVudChjYy5TcHJpdGUpLCBza2luVXJsKTtcbiAgICB9XG5cbiAgICBzZXRSb3dDZWwocm93OiBudW1iZXIsIGNvbDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMucm93ID0gcm93O1xuICAgICAgICB0aGlzLmNvbCA9IGNvbDtcbiAgICB9XG5cbiAgICBtb3ZlVXAoKSB7XG4gICAgICAgIHRoaXMucm93IC09IDE7XG4gICAgfVxuXG4gICAgbW92ZURvd24oKSB7XG4gICAgICAgIHRoaXMucm93ICs9IDE7XG4gICAgfVxuXG4gICAgLy8g5Yig6ZmkXG4gICAgZWxpbWluYXRlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnNpemUgPSBncmlkU2l6ZS5aRVJPO1xuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlID0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZO1xuICAgICAgICB0aGlzLnVuaXF1ZUlkID0gLTE7XG4gICAgICAgIGNjLnR3ZWVuKHRoaXMubm9kZSlcbiAgICAgICAgICAgIC50byh0aGlzLnRpbWVEZWxHcmlkLCB7IG9wYWNpdHk6IDAgfSlcbiAgICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUucmVtb3ZlRnJvbVBhcmVudCgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGFydCgpO1xuICAgIH1cblxuICAgIG9uVG91Y2hTdGFydChlKSB7XG4gICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCAhPT0gLTEpIHJldHVybjtcbiAgICAgICAgenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgPSB0aGlzLnVuaXF1ZUlkO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uVG91Y2hTdGFydFwiLCB0aGlzLnVuaXF1ZUlkLCBlLnRvdWNoLmdldExvY2F0aW9uKCkueCk7XG4gICAgICAgIHRoaXMub3JpZ2luWCA9IGUudG91Y2guZ2V0TG9jYXRpb24oKS54O1xuICAgICAgICB0aGlzLm9yaWdpbkdyaWRYID0gdGhpcy5ub2RlLng7XG4gICAgICAgIHRoaXMub2Zmc2V0Q250ID0gMDtcblxuICAgICAgICBhdWRpb01nci5zaGFrZShTSEFLRV9UWVBFLkxJR0hUKTtcbiAgICB9XG5cbiAgICBvblRvdWNoTW92ZShlKTogdm9pZCB7XG4gICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCAhPT0gdGhpcy51bmlxdWVJZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBkeCA9IGUudG91Y2guZ2V0TG9jYXRpb24oKS54IC0gdGhpcy5vcmlnaW5YO1xuXG4gICAgICAgIGNvbnN0IGNhbk1vdmUgPSB0aGlzLmNoZWNrTW92ZShkeCk7XG4gICAgICAgIGlmIChjYW5Nb3ZlKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUub3BhY2l0eSA9IDI1NTtcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gdGhpcy5vcmlnaW5HcmlkWCArIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqIHRoaXMub2Zmc2V0Q250O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdGhpcy5ub2RlLm9wYWNpdHkgPSAxMDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblRvdWNoRW5kKGUpIHtcbiAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkICE9PSB0aGlzLnVuaXF1ZUlkKSByZXR1cm47XG4gICAgICAgIGNvbnNvbGUubG9nKFwib25Ub3VjaEVuZFwiLCB0aGlzLnVuaXF1ZUlkKTtcbiAgICAgICAgLy8gY29uc3QgZHggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueCAtIHRoaXMub3JpZ2luWDtcbiAgICAgICAgLy8gbGV0IGNhbk1vdmUgPSB0aGlzLmNoZWNrTW92ZShkeCk7XG5cbiAgICAgICAgLy8gdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG5cbiAgICAgICAgLy8gaWYgKGNhbk1vdmUpIHtcbiAgICAgICAgLy8gICAgIHRoaXMubW92ZUNyb3NzV2lzZSgpO1xuICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm9yaWdpbkdyaWRYO1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ+aXoOazleenu+WKqCcpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgdGhpcy5tb3ZlQ3Jvc3NXaXNlKCk7XG4gICAgfVxuXG4gICAgLy8g5qOA5rWL5piv5ZCm5Y+v5Lul56e75YqoLCDmoIforrDnirbmgIFcbiAgICBjaGVja01vdmUoZHg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvLyDlrp7pmYXkuIrmk43kvZznmoTkvY3np7vmoLzlrZDnqbrpl7RcbiAgICAgICAgY29uc3Qgb2Zmc2V0Q250ID0gTWF0aC5mbG9vcihNYXRoLmFicyhkeCkgLyB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGgpO1xuXG4gICAgICAgIC8vIOeQhuiuuuS4iuacgOWkp+WFgeiuuOWPkeeUn+eahOacgOWkp+S9jeenu+epuumXtFxuICAgICAgICBjb25zdCByb3dEYXRhID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd107XG4gICAgICAgIGxldCBtYXhPZmZzZXRDbnQgPSAwO1xuICAgICAgICBpZiAoZHggPiAwKSB7XG4gICAgICAgICAgICAvLyDlkJHlj7Pnp7vliqhcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbCArIHRoaXMuc2l6ZTsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChyb3dEYXRhW2ldWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1heE9mZnNldENudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5ZCR5bem56e75YqoXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jb2wgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChyb3dEYXRhW2ldWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1heE9mZnNldENudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coYOaWueWQkToke2R4IC8gTWF0aC5hYnMoZHgpID4gMCA/ICflj7MnIDogJ+W3pid9IOaLluWKqDogJHtvZmZzZXRDbnR9LCDmnIDlpKc6ICR7bWF4T2Zmc2V0Q250fWApO1xuICAgICAgICBpZiAoTWF0aC5hYnMob2Zmc2V0Q250KSA8PSBtYXhPZmZzZXRDbnQpIHtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0Q250ID0gZHggLyBNYXRoLmFicyhkeCkgKiBvZmZzZXRDbnQ7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0Q250ID0gZHggLyBNYXRoLmFicyhkeCkgKiBtYXhPZmZzZXRDbnQ7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlrp7pmYXlj5HnlJ/mqKrlkJHnp7vliqhcbiAgICBtb3ZlQ3Jvc3NXaXNlKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vZmZzZXRDbnQgPT09IDAgfHwgIXRoaXMub2Zmc2V0Q250KSB7XG4gICAgICAgICAgICAvLyDmsqHmnInlj5HnlJ/lrp7pmYXnmoTkvY3np7tcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmsqHmnInlj5HnlJ/lrp7pmYXkvY3np7ssIOagvOWtkOmAieS4reeKtuaAgeWPlua2iCcpO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgPSAtMTtcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gdGhpcy5vcmlnaW5HcmlkWDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vZmZzZXRDbnQgPiAwKSB7XG4gICAgICAgICAgICB1aW1hbmFnZXIuc2hvd1RpcHMoYOWPsyAtPiAke3RoaXMub2Zmc2V0Q250fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKGDlt6bnp7sgPC0gJHstdGhpcy5vZmZzZXRDbnR9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmjKrotbDnmoTkvY3nva7nva7kuLrnqbpcbiAgICAgICAgZm9yIChsZXQgY29sID0gdGhpcy5jb2w7IGNvbCA8IHRoaXMuY29sICsgdGhpcy5zaXplOyBjb2wrKykge1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd11bY29sXSA9IFswLCAwLCAwXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaWsOeahOS9jee9riDnva7kuLrlvZPliY3moLzlrZBcbiAgICAgICAgY29uc3QgbmV3U3RhcnRDb2wgPSB0aGlzLmNvbCArIHRoaXMub2Zmc2V0Q250O1xuICAgICAgICBjb25zdCBuZXdFbmQgPSBuZXdTdGFydENvbCArIHRoaXMuc2l6ZTtcbiAgICAgICAgZm9yIChsZXQgY29sID0gbmV3U3RhcnRDb2w7IGNvbCA8IG5ld0VuZDsgY29sKyspIHtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddW2NvbF1bMF0gPSB0aGlzLnNpemU7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdWzFdID0gdGhpcy5jb250ZW50VHlwZTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddW2NvbF1bMl0gPSB0aGlzLnVuaXF1ZUlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIGNvbFxuICAgICAgICB0aGlzLnNldFJvd0NlbCh0aGlzLnJvdywgdGhpcy5jb2wgKyB0aGlzLm9mZnNldENudCk7XG4gICAgICAgIHRoaXMub3JpZ2luR3JpZFggPSB0aGlzLm5vZGUueDtcblxuICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLlpZWF9DSEVDS19NRVJHRSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGDnrKwke3RoaXMucm93feihjOWPkeeUn+enu+WKqO+8mmAsIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8pO1xuICAgIH1cbn1cbiJdfQ==