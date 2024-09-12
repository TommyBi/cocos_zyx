
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
        this.node.width = 84 * info[0];
        this.uImgBg.node.width = this.node.width;
        this.uImgBg.node.x = this.uImgBg.node.width / 2;
        this.uImgDiamond.x = this.uImgBg.node.width / 2;
        this.ulblUniqueId.node.x = this.node.width / 2;
        this.uImgDiamond.active = this.contentType === TypeDefine_1.gridContentType.DIAMOND;
        this.ulblUniqueId.string = this.uniqueId.toString();
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
        property(cc.Sprite)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHcmlkQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCxtREFBaUU7QUFDakUsNENBQThDO0FBQzlDLGtEQUFpRDtBQUNqRCxxREFBb0Q7QUFDcEQsNkNBQXdDO0FBRWxDLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRTVDLE9BQU87QUFFUDtJQUF3Qyw4QkFBWTtJQUFwRDtRQUFBLHFFQXNNQztRQW5NRyxpQkFBVyxHQUFZLElBQUksQ0FBQztRQUc1QixZQUFNLEdBQWMsSUFBSSxDQUFDO1FBR3pCLGtCQUFZLEdBQWEsSUFBSSxDQUFDO1FBRXRCLFVBQUksR0FBYSxxQkFBUSxDQUFDLEdBQUcsQ0FBQztRQUM5QixpQkFBVyxHQUFvQiw0QkFBZSxDQUFDLEtBQUssQ0FBQztRQUN0RCxjQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXBCLFNBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQixTQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFekIsTUFBTTtRQUNFLGVBQVMsR0FBVyxDQUFDLENBQUM7UUFFOUIsU0FBUztRQUNELGFBQU8sR0FBVyxDQUFDLENBQUM7UUFFNUIsU0FBUztRQUNELGlCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBRWhDLFVBQVU7UUFDRixpQkFBVyxHQUFXLElBQUksQ0FBQzs7SUEwS3ZDLENBQUM7SUF4S0csMkJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJ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QyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDNUQsNkJBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDNUQ7UUFFRCxhQUFhO1FBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFL0IsMkJBQVksQ0FBQyxRQUFRLENBQUMsa0JBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQUksSUFBSSxDQUFDLEdBQUcseUNBQVEsRUFBRSw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFsTUQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzttREFDVTtJQUc1QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDOzhDQUNLO0lBR3pCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7b0RBQ1c7SUFUYixVQUFVO1FBRDlCLE9BQU87T0FDYSxVQUFVLENBc005QjtJQUFELGlCQUFDO0NBdE1ELEFBc01DLENBdE11QyxFQUFFLENBQUMsU0FBUyxHQXNNbkQ7a0JBdE1vQixVQUFVIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgenl4R2FtZU1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL1p5eEdhbWVNb2R1bGVcIjtcbmltcG9ydCB7IGdyaWRDb250ZW50VHlwZSwgZ3JpZFNpemUgfSBmcm9tIFwiLi4vZGVmaW5lL1R5cGVEZWZpbmVcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gXCIuLi9tYW5hZ2VyL0RlZmluZVwiO1xuaW1wb3J0IHsgdWltYW5hZ2VyIH0gZnJvbSBcIi4uL21hbmFnZXIvVWltYW5hZ2VyXCI7XG5pbXBvcnQgeyBldmVudE1hbmFnZXIgfSBmcm9tIFwiLi4vdXRpbC9FdmVudE1hbmFnZXJcIjtcbmltcG9ydCBOZXdVdGlscyBmcm9tIFwiLi4vdXRpbC9OZXdVdGlsc1wiO1xuXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG4vLyDmoLzlrZDnu4Tku7ZcbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaeXhHcmlkQ29tIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdEaWFtb25kOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5TcHJpdGUpXG4gICAgdUltZ0JnOiBjYy5TcHJpdGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxVbmlxdWVJZDogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBzaXplOiBncmlkU2l6ZSA9IGdyaWRTaXplLk9ORTtcbiAgICBwcml2YXRlIGNvbnRlbnRUeXBlOiBncmlkQ29udGVudFR5cGUgPSBncmlkQ29udGVudFR5cGUuRU1QVFk7XG4gICAgcHVibGljIHVuaXF1ZUlkOiBudW1iZXIgPSAwO1xuXG4gICAgcHJpdmF0ZSByb3c6IG51bWJlciA9IC0xO1xuICAgIHByaXZhdGUgY29sOiBudW1iZXIgPSAtMTtcblxuICAgIC8vIOS+v+WunOmHj1xuICAgIHByaXZhdGUgb2Zmc2V0Q250OiBudW1iZXIgPSAwO1xuXG4gICAgLy8g5Yid5aeL54K55Ye75L2N572uXG4gICAgcHJpdmF0ZSBvcmlnaW5YOiBudW1iZXIgPSAwO1xuXG4gICAgLy8g5qC85a2Q5Y6f5aeL5L2N572uXG4gICAgcHJpdmF0ZSBvcmlnaW5HcmlkWDogbnVtYmVyID0gMDtcblxuICAgIC8vIOagvOWtkOWIoOmZpOeahOaXtumXtFxuICAgIHByaXZhdGUgdGltZURlbEdyaWQ6IG51bWJlciA9IDAuMTg7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgdGhpcy5vblRvdWNoU3RhcnQsIHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfTU9WRSwgdGhpcy5vblRvdWNoTW92ZSwgdGhpcyk7XG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25Ub3VjaEVuZCwgdGhpcyk7XG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9DQU5DRUwsIHRoaXMub25Ub3VjaEVuZCwgdGhpcyk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7IH1cblxuICAgIGluaXQoaW5mbzogW2dyaWRTaXplLCBncmlkQ29udGVudFR5cGUsIG51bWJlcl0pIHtcbiAgICAgICAgLy8g5qC85a2Q57G75Z6L5Z+656GA5bGe5oCnXG4gICAgICAgIHRoaXMuc2l6ZSA9IGluZm9bMF07XG4gICAgICAgIHRoaXMuY29udGVudFR5cGUgPSBpbmZvWzFdO1xuICAgICAgICB0aGlzLnVuaXF1ZUlkID0gaW5mb1syXTtcblxuICAgICAgICBpZiAodGhpcy5jb250ZW50VHlwZSA9PT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIOagvOWtkOWkluinguWwuuWvuFxuICAgICAgICB0aGlzLm5vZGUud2lkdGggPSA4NCAqIGluZm9bMF07XG4gICAgICAgIHRoaXMudUltZ0JnLm5vZGUud2lkdGggPSB0aGlzLm5vZGUud2lkdGg7XG4gICAgICAgIHRoaXMudUltZ0JnLm5vZGUueCA9IHRoaXMudUltZ0JnLm5vZGUud2lkdGggLyAyO1xuICAgICAgICB0aGlzLnVJbWdEaWFtb25kLnggPSB0aGlzLnVJbWdCZy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgdGhpcy51bGJsVW5pcXVlSWQubm9kZS54ID0gdGhpcy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgdGhpcy51SW1nRGlhbW9uZC5hY3RpdmUgPSB0aGlzLmNvbnRlbnRUeXBlID09PSBncmlkQ29udGVudFR5cGUuRElBTU9ORDtcbiAgICAgICAgdGhpcy51bGJsVW5pcXVlSWQuc3RyaW5nID0gdGhpcy51bmlxdWVJZC50b1N0cmluZygpO1xuXG4gICAgICAgIGNvbnN0IHNraW5VcmwgPSBgaW1hZ2VzL2dyaWQvY29sb3JfJHtOZXdVdGlscy5yYW5kb21JbnRJbmNsdXNpdmUoMSwgMTMpfWA7XG4gICAgICAgIE5ld1V0aWxzLnNldFNwcml0ZUZyYW1lQnlVcmwodGhpcy51SW1nQmcsIHNraW5VcmwpO1xuICAgIH1cblxuICAgIHNldFJvd0NlbChyb3c6IG51bWJlciwgY29sOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5yb3cgPSByb3c7XG4gICAgICAgIHRoaXMuY29sID0gY29sO1xuICAgIH1cblxuICAgIG1vdmVVcCgpIHtcbiAgICAgICAgdGhpcy5yb3cgLT0gMTtcbiAgICB9XG5cbiAgICBtb3ZlRG93bigpIHtcbiAgICAgICAgdGhpcy5yb3cgKz0gMTtcbiAgICB9XG5cbiAgICAvLyDliKDpmaRcbiAgICBlbGltaW5hdGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IGdyaWRTaXplLlpFUk87XG4gICAgICAgIHRoaXMuY29udGVudFR5cGUgPSBncmlkQ29udGVudFR5cGUuRU1QVFk7XG4gICAgICAgIHRoaXMudW5pcXVlSWQgPSAtMTtcbiAgICAgICAgY2MudHdlZW4odGhpcy5ub2RlKVxuICAgICAgICAgICAgLnRvKHRoaXMudGltZURlbEdyaWQsIHsgb3BhY2l0eTogMCB9KVxuICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5yZW1vdmVGcm9tUGFyZW50KCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkICE9PSAtMSkgcmV0dXJuO1xuICAgICAgICB6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCA9IHRoaXMudW5pcXVlSWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib25Ub3VjaFN0YXJ0XCIsIHRoaXMudW5pcXVlSWQsIGUudG91Y2guZ2V0TG9jYXRpb24oKS54KTtcbiAgICAgICAgdGhpcy5vcmlnaW5YID0gZS50b3VjaC5nZXRMb2NhdGlvbigpLng7XG4gICAgICAgIHRoaXMub3JpZ2luR3JpZFggPSB0aGlzLm5vZGUueDtcbiAgICAgICAgdGhpcy5vZmZzZXRDbnQgPSAwO1xuICAgIH1cblxuICAgIG9uVG91Y2hNb3ZlKGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkICE9PSB0aGlzLnVuaXF1ZUlkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGR4ID0gZS50b3VjaC5nZXRMb2NhdGlvbigpLnggLSB0aGlzLm9yaWdpblg7XG5cbiAgICAgICAgY29uc3QgY2FuTW92ZSA9IHRoaXMuY2hlY2tNb3ZlKGR4KTtcbiAgICAgICAgaWYgKGNhbk1vdmUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMjU1O1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm9yaWdpbkdyaWRYICsgenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogdGhpcy5vZmZzZXRDbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUub3BhY2l0eSA9IDEwMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uVG91Y2hFbmQoZSkge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IHRoaXMudW5pcXVlSWQpIHJldHVybjtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblRvdWNoRW5kXCIsIHRoaXMudW5pcXVlSWQpO1xuICAgICAgICBjb25zdCBkeCA9IGUudG91Y2guZ2V0TG9jYXRpb24oKS54IC0gdGhpcy5vcmlnaW5YO1xuICAgICAgICBsZXQgY2FuTW92ZSA9IHRoaXMuY2hlY2tNb3ZlKGR4KTtcblxuICAgICAgICB0aGlzLm5vZGUub3BhY2l0eSA9IDI1NTtcblxuICAgICAgICBpZiAoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlQ3Jvc3NXaXNlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IHRoaXMub3JpZ2luR3JpZFg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmo4DmtYvmmK/lkKblj6/ku6Xnp7vliqgsIOagh+iusOeKtuaAgVxuICAgIGNoZWNrTW92ZShkeDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOWunumZheS4iuaTjeS9nOeahOS9jeenu+agvOWtkOepuumXtFxuICAgICAgICBjb25zdCBvZmZzZXRDbnQgPSBNYXRoLmZsb29yKE1hdGguYWJzKGR4KSAvIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCk7XG5cbiAgICAgICAgLy8g55CG6K665LiK5pyA5aSn5YWB6K645Y+R55Sf55qE5pyA5aSn5L2N56e756m66Ze0XG4gICAgICAgIGNvbnN0IHJvd0RhdGEgPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XTtcbiAgICAgICAgbGV0IG1heE9mZnNldENudCA9IDA7XG4gICAgICAgIGlmIChkeCA+IDApIHtcbiAgICAgICAgICAgIC8vIOWQkeWPs+enu+WKqFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY29sICsgdGhpcy5zaXplOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvd0RhdGFbaV1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWF4T2Zmc2V0Q250Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDlkJHlt6bnp7vliqhcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvd0RhdGFbaV1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWF4T2Zmc2V0Q250Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhg5pa55ZCROiR7ZHggLyBNYXRoLmFicyhkeCkgPiAwID8gJ+WPsycgOiAn5bemJ30g5ouW5YqoOiAke29mZnNldENudH0sIOacgOWkpzogJHttYXhPZmZzZXRDbnR9YCk7XG4gICAgICAgIGlmIChNYXRoLmFicyhvZmZzZXRDbnQpIDw9IG1heE9mZnNldENudCkge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXRDbnQgPSBkeCAvIE1hdGguYWJzKGR4KSAqIG9mZnNldENudDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXRDbnQgPSBkeCAvIE1hdGguYWJzKGR4KSAqIG1heE9mZnNldENudDtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWunumZheWPkeeUn+aoquWQkeenu+WKqFxuICAgIG1vdmVDcm9zc1dpc2UoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9mZnNldENudCA9PT0gMCkge1xuICAgICAgICAgICAgLy8g5rKh5pyJ5Y+R55Sf5a6e6ZmF55qE5L2N56e7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5rKh5pyJ5Y+R55Sf5a6e6ZmF5L2N56e7LCDmoLzlrZDpgInkuK3nirbmgIHlj5bmtognKTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkID0gLTE7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub2Zmc2V0Q250ID4gMCkge1xuICAgICAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKGDlj7MgLT4gJHt0aGlzLm9mZnNldENudH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVpbWFuYWdlci5zaG93VGlwcyhg5bem56e7IDwtICR7LXRoaXMub2Zmc2V0Q250fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5oyq6LWw55qE5L2N572u572u5Li656m6XG4gICAgICAgIGZvciAobGV0IGNvbCA9IHRoaXMuY29sOyBjb2wgPCB0aGlzLmNvbCArIHRoaXMuc2l6ZTsgY29sKyspIHtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddW2NvbF0gPSBbMCwgMCwgMF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmlrDnmoTkvY3nva4g572u5Li65b2T5YmN5qC85a2QXG4gICAgICAgIGNvbnN0IG5ld1N0YXJ0Q29sID0gdGhpcy5jb2wgKyB0aGlzLm9mZnNldENudDtcbiAgICAgICAgY29uc3QgbmV3RW5kID0gbmV3U3RhcnRDb2wgKyB0aGlzLnNpemU7XG4gICAgICAgIGZvciAobGV0IGNvbCA9IG5ld1N0YXJ0Q29sOyBjb2wgPCBuZXdFbmQ7IGNvbCsrKSB7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdWzBdID0gdGhpcy5zaXplO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd11bY29sXVsxXSA9IHRoaXMuY29udGVudFR5cGU7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdWzJdID0gdGhpcy51bmlxdWVJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjb2xcbiAgICAgICAgdGhpcy5zZXRSb3dDZWwodGhpcy5yb3csIHRoaXMuY29sICsgdGhpcy5vZmZzZXRDbnQpO1xuICAgICAgICB0aGlzLm9yaWdpbkdyaWRYID0gdGhpcy5ub2RlLng7XG5cbiAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5aWVhfQ0hFQ0tfTUVSR0UpO1xuICAgICAgICBjb25zb2xlLmxvZyhg56ysJHt0aGlzLnJvd33ooYzlj5HnlJ/np7vliqjvvJpgLCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvKTtcbiAgICB9XG59XG4iXX0=