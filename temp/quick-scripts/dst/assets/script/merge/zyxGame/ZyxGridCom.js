
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
        this.node.width = 84 * info[0];
        this.uImgBg.node.width = this.node.width;
        this.uImgBg.node.x = this.uImgBg.node.width / 2;
        this.uImgDiamond.x = this.uImgBg.node.width / 2;
        this.uImgDiamond.active = this.contentType === TypeDefine_1.gridContentType.DIAMOND;
        var skinUrl = "images/grid/color_" + NewUtils_1.default.randomIntInclusive(1, 13);
        NewUtils_1.default.setSpriteFrameByUrl(this.uImgBg, skinUrl);
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
        cc.tween(this.node)
            .to(0.3, { opacity: 0 })
            .call(function () {
            _this.node.removeFromParent();
        })
            .start();
    };
    ZyxGridCom.prototype.onTouchStart = function (e) {
        if (ZyxGameModule_1.zyxGameModule.lock)
            return;
        ZyxGameModule_1.zyxGameModule.lock = true;
        console.log("onTouchStart", this.uniqueId, e.touch.getLocation().x);
        this.originX = e.touch.getLocation().x;
        this.originGridX = this.node.x;
        this.offsetCnt = 0;
    };
    ZyxGridCom.prototype.onTouchMove = function (e) {
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
        if (this.offsetCnt === 0)
            return;
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
        console.log("\u7B2C" + this.row + "\u884C\uFF1A", ZyxGameModule_1.zyxGameModule.gridInfo);
    };
    __decorate([
        property(cc.Node)
    ], ZyxGridCom.prototype, "uImgDiamond", void 0);
    __decorate([
        property(cc.Sprite)
    ], ZyxGridCom.prototype, "uImgBg", void 0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHcmlkQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCxtREFBaUU7QUFDakUsNENBQThDO0FBQzlDLGtEQUFpRDtBQUNqRCxxREFBb0Q7QUFDcEQsNkNBQXdDO0FBRWxDLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRTVDLE9BQU87QUFFUDtJQUF3Qyw4QkFBWTtJQUFwRDtRQUFBLHFFQW9MQztRQWpMRyxpQkFBVyxHQUFZLElBQUksQ0FBQztRQUc1QixZQUFNLEdBQWMsSUFBSSxDQUFDO1FBRWpCLFVBQUksR0FBYSxxQkFBUSxDQUFDLEdBQUcsQ0FBQztRQUM5QixpQkFBVyxHQUFvQiw0QkFBZSxDQUFDLEtBQUssQ0FBQztRQUN0RCxjQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXBCLFNBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQixTQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFekIsTUFBTTtRQUNFLGVBQVMsR0FBVyxDQUFDLENBQUM7UUFFOUIsU0FBUztRQUNELGFBQU8sR0FBVyxDQUFDLENBQUM7UUFFNUIsU0FBUztRQUNELGlCQUFXLEdBQVcsQ0FBQyxDQUFDOztJQThKcEMsQ0FBQztJQTVKRywyQkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFD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QVUsQ0FvTDlCO0lBQUQsaUJBQUM7Q0FwTEQsQUFvTEMsQ0FwTHVDLEVBQUUsQ0FBQyxTQUFTLEdBb0xuRDtrQkFwTG9CLFVBQVUiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6eXhHYW1lTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvWnl4R2FtZU1vZHVsZVwiO1xuaW1wb3J0IHsgZ3JpZENvbnRlbnRUeXBlLCBncmlkU2l6ZSB9IGZyb20gXCIuLi9kZWZpbmUvVHlwZURlZmluZVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvRGVmaW5lXCI7XG5pbXBvcnQgeyB1aW1hbmFnZXIgfSBmcm9tIFwiLi4vbWFuYWdlci9VaW1hbmFnZXJcIjtcbmltcG9ydCB7IGV2ZW50TWFuYWdlciB9IGZyb20gXCIuLi91dGlsL0V2ZW50TWFuYWdlclwiO1xuaW1wb3J0IE5ld1V0aWxzIGZyb20gXCIuLi91dGlsL05ld1V0aWxzXCI7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbi8vIOagvOWtkOe7hOS7tlxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFp5eEdyaWRDb20gZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUltZ0RpYW1vbmQ6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLlNwcml0ZSlcbiAgICB1SW1nQmc6IGNjLlNwcml0ZSA9IG51bGw7XG5cbiAgICBwcml2YXRlIHNpemU6IGdyaWRTaXplID0gZ3JpZFNpemUuT05FO1xuICAgIHByaXZhdGUgY29udGVudFR5cGU6IGdyaWRDb250ZW50VHlwZSA9IGdyaWRDb250ZW50VHlwZS5FTVBUWTtcbiAgICBwdWJsaWMgdW5pcXVlSWQ6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIHJvdzogbnVtYmVyID0gLTE7XG4gICAgcHJpdmF0ZSBjb2w6IG51bWJlciA9IC0xO1xuXG4gICAgLy8g5L6/5a6c6YePXG4gICAgcHJpdmF0ZSBvZmZzZXRDbnQ6IG51bWJlciA9IDA7XG5cbiAgICAvLyDliJ3lp4vngrnlh7vkvY3nva5cbiAgICBwcml2YXRlIG9yaWdpblg6IG51bWJlciA9IDA7XG5cbiAgICAvLyDmoLzlrZDljp/lp4vkvY3nva5cbiAgICBwcml2YXRlIG9yaWdpbkdyaWRYOiBudW1iZXIgPSAwO1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIHRoaXMub25Ub3VjaFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX01PVkUsIHRoaXMub25Ub3VjaE1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uVG91Y2hFbmQsIHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfQ0FOQ0VMLCB0aGlzLm9uVG91Y2hFbmQsIHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXJ0KCkgeyB9XG5cbiAgICBpbml0KGluZm86IFtncmlkU2l6ZSwgZ3JpZENvbnRlbnRUeXBlLCBudW1iZXJdKSB7XG4gICAgICAgIC8vIOagvOWtkOexu+Wei+WfuuehgOWxnuaAp1xuICAgICAgICB0aGlzLnNpemUgPSBpbmZvWzBdO1xuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlID0gaW5mb1sxXTtcbiAgICAgICAgdGhpcy51bmlxdWVJZCA9IGluZm9bMl07XG5cbiAgICAgICAgaWYgKHRoaXMuY29udGVudFR5cGUgPT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyDmoLzlrZDlpJbop4LlsLrlr7hcbiAgICAgICAgdGhpcy5ub2RlLndpZHRoID0gODQgKiBpbmZvWzBdO1xuICAgICAgICB0aGlzLnVJbWdCZy5ub2RlLndpZHRoID0gdGhpcy5ub2RlLndpZHRoO1xuICAgICAgICB0aGlzLnVJbWdCZy5ub2RlLnggPSB0aGlzLnVJbWdCZy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgdGhpcy51SW1nRGlhbW9uZC54ID0gdGhpcy51SW1nQmcubm9kZS53aWR0aCAvIDI7XG4gICAgICAgIHRoaXMudUltZ0RpYW1vbmQuYWN0aXZlID0gdGhpcy5jb250ZW50VHlwZSA9PT0gZ3JpZENvbnRlbnRUeXBlLkRJQU1PTkQ7XG5cbiAgICAgICAgY29uc3Qgc2tpblVybCA9IGBpbWFnZXMvZ3JpZC9jb2xvcl8ke05ld1V0aWxzLnJhbmRvbUludEluY2x1c2l2ZSgxLCAxMyl9YDtcbiAgICAgICAgTmV3VXRpbHMuc2V0U3ByaXRlRnJhbWVCeVVybCh0aGlzLnVJbWdCZywgc2tpblVybCk7XG4gICAgfVxuXG4gICAgc2V0Um93Q2VsKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xuICAgICAgICB0aGlzLnJvdyA9IHJvdztcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XG4gICAgfVxuXG4gICAgbW92ZVVwKCkge1xuICAgICAgICB0aGlzLnJvdyAtPSAxO1xuICAgIH1cblxuICAgIG1vdmVEb3duKCkge1xuICAgICAgICB0aGlzLnJvdyArPSAxO1xuICAgIH1cblxuICAgIC8vIOWIoOmZpFxuICAgIGVsaW1pbmF0ZSgpOiB2b2lkIHtcbiAgICAgICAgY2MudHdlZW4odGhpcy5ub2RlKVxuICAgICAgICAgICAgLnRvKDAuMywgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnJlbW92ZUZyb21QYXJlbnQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBvblRvdWNoU3RhcnQoZSkge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5sb2NrKSByZXR1cm47XG4gICAgICAgIHp5eEdhbWVNb2R1bGUubG9jayA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib25Ub3VjaFN0YXJ0XCIsIHRoaXMudW5pcXVlSWQsIGUudG91Y2guZ2V0TG9jYXRpb24oKS54KTtcbiAgICAgICAgdGhpcy5vcmlnaW5YID0gZS50b3VjaC5nZXRMb2NhdGlvbigpLng7XG4gICAgICAgIHRoaXMub3JpZ2luR3JpZFggPSB0aGlzLm5vZGUueDtcbiAgICAgICAgdGhpcy5vZmZzZXRDbnQgPSAwO1xuICAgIH1cblxuICAgIG9uVG91Y2hNb3ZlKGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZHggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueCAtIHRoaXMub3JpZ2luWDtcblxuICAgICAgICBjb25zdCBjYW5Nb3ZlID0gdGhpcy5jaGVja01vdmUoZHgpO1xuICAgICAgICBpZiAoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IHRoaXMub3JpZ2luR3JpZFggKyB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiB0aGlzLm9mZnNldENudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMTAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Ub3VjaEVuZChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib25Ub3VjaEVuZFwiLCB0aGlzLnVuaXF1ZUlkKTtcbiAgICAgICAgY29uc3QgZHggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueCAtIHRoaXMub3JpZ2luWDtcbiAgICAgICAgbGV0IGNhbk1vdmUgPSB0aGlzLmNoZWNrTW92ZShkeCk7XG5cbiAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG5cbiAgICAgICAgaWYgKGNhbk1vdmUpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZUNyb3NzV2lzZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm9yaWdpbkdyaWRYO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5qOA5rWL5piv5ZCm5Y+v5Lul56e75YqoLCDmoIforrDnirbmgIFcbiAgICBjaGVja01vdmUoZHg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvLyDlrp7pmYXkuIrmk43kvZznmoTkvY3np7vmoLzlrZDnqbrpl7RcbiAgICAgICAgY29uc3Qgb2Zmc2V0Q250ID0gTWF0aC5mbG9vcihNYXRoLmFicyhkeCkgLyB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGgpO1xuXG4gICAgICAgIC8vIOeQhuiuuuS4iuacgOWkp+WFgeiuuOWPkeeUn+eahOacgOWkp+S9jeenu+epuumXtFxuICAgICAgICBjb25zdCByb3dEYXRhID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd107XG4gICAgICAgIGxldCBtYXhPZmZzZXRDbnQgPSAwO1xuICAgICAgICBpZiAoZHggPiAwKSB7XG4gICAgICAgICAgICAvLyDlkJHlj7Pnp7vliqhcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbCArIHRoaXMuc2l6ZTsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChyb3dEYXRhW2ldWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1heE9mZnNldENudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5ZCR5bem56e75YqoXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jb2wgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChyb3dEYXRhW2ldWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1heE9mZnNldENudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coYOaWueWQkToke2R4IC8gTWF0aC5hYnMoZHgpID4gMCA/ICflj7MnIDogJ+W3pid9IOaLluWKqDogJHtvZmZzZXRDbnR9LCDmnIDlpKc6ICR7bWF4T2Zmc2V0Q250fWApO1xuICAgICAgICBpZiAoTWF0aC5hYnMob2Zmc2V0Q250KSA8PSBtYXhPZmZzZXRDbnQpIHtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0Q250ID0gZHggLyBNYXRoLmFicyhkeCkgKiBvZmZzZXRDbnQ7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0Q250ID0gZHggLyBNYXRoLmFicyhkeCkgKiBtYXhPZmZzZXRDbnQ7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlrp7pmYXlj5HnlJ/mqKrlkJHnp7vliqhcbiAgICBtb3ZlQ3Jvc3NXaXNlKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vZmZzZXRDbnQgPT09IDApIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMub2Zmc2V0Q250ID4gMCkge1xuICAgICAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKGDlj7MgLT4gJHt0aGlzLm9mZnNldENudH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVpbWFuYWdlci5zaG93VGlwcyhg5bem56e7IDwtICR7LXRoaXMub2Zmc2V0Q250fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5oyq6LWw55qE5L2N572u572u5Li656m6XG4gICAgICAgIGZvciAobGV0IGNvbCA9IHRoaXMuY29sOyBjb2wgPCB0aGlzLmNvbCArIHRoaXMuc2l6ZTsgY29sKyspIHtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddW2NvbF0gPSBbMCwgMCwgMF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmlrDnmoTkvY3nva4g572u5Li65b2T5YmN5qC85a2QXG4gICAgICAgIGNvbnN0IG5ld1N0YXJ0Q29sID0gdGhpcy5jb2wgKyB0aGlzLm9mZnNldENudDtcbiAgICAgICAgY29uc3QgbmV3RW5kID0gbmV3U3RhcnRDb2wgKyB0aGlzLnNpemU7XG4gICAgICAgIGZvciAobGV0IGNvbCA9IG5ld1N0YXJ0Q29sOyBjb2wgPCBuZXdFbmQ7IGNvbCsrKSB7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdWzBdID0gdGhpcy5zaXplO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd11bY29sXVsxXSA9IHRoaXMuY29udGVudFR5cGU7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdWzJdID0gdGhpcy51bmlxdWVJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjb2xcbiAgICAgICAgdGhpcy5zZXRSb3dDZWwodGhpcy5yb3csIHRoaXMuY29sICsgdGhpcy5vZmZzZXRDbnQpO1xuICAgICAgICB0aGlzLm9yaWdpbkdyaWRYID0gdGhpcy5ub2RlLng7XG5cbiAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5aWVhfQ0hFQ0tfTUVSR0UpO1xuICAgICAgICBjb25zb2xlLmxvZyhg56ysJHt0aGlzLnJvd33ooYzvvJpgLCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvKTtcbiAgICB9XG59XG4iXX0=