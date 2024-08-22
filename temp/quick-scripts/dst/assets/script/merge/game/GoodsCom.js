
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/GoodsCom.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b87589+qj5GgbqZ/w8AZBbf', 'GoodsCom');
// script/merge/game/GoodsCom.ts

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
var GoodsModule_1 = require("../dataModule/GoodsModule");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GoodsCom = /** @class */ (function (_super) {
    __extends(GoodsCom, _super);
    function GoodsCom() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.label = null;
        _this.uImgGoods = null;
        _this.ulblName = null;
        _this.ulblStar = null;
        _this.ulblInventory = null;
        _this.uBtnGet = null;
        // 商品列表中的索引
        _this.idx = -1;
        return _this;
    }
    Object.defineProperty(GoodsCom.prototype, "goodsData", {
        // 当前最新的商品信息状态
        get: function () {
            return GoodsModule_1.goodsModule.goods[this.idx];
        },
        enumerable: false,
        configurable: true
    });
    GoodsCom.prototype.onLoad = function () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onSelect, this);
        this.uBtnGet.on(cc.Node.EventType.TOUCH_END, this.onGet, this);
    };
    GoodsCom.prototype.init = function (idx) {
        this.idx = idx;
        this.formatGoodsInfo();
    };
    GoodsCom.prototype.formatGoodsInfo = function () {
        var _this = this;
        var goodsInfo = this.goodsData;
        var url = "images/goods/img_goods_" + goodsInfo.id;
        cc.resources.load(url, cc.SpriteFrame, (function (err, spriteFrame) {
            if (err) {
                console.error('url:', url, '/err:');
                return;
            }
            _this.uImgGoods.spriteFrame = spriteFrame;
        }));
        this.ulblName.string = goodsInfo.name;
        this.ulblStar.string = "x " + goodsInfo.star;
    };
    // 展示商品详情页
    GoodsCom.prototype.onSelect = function () {
        console.log('[DEBUG] 显示商品详情', this.goodsData);
    };
    // 兑换
    GoodsCom.prototype.onGet = function () {
        console.log("[DEBUG] \u5151\u6362\u5546\u54C1" + this.goodsData.name);
    };
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "label", void 0);
    __decorate([
        property(cc.Sprite)
    ], GoodsCom.prototype, "uImgGoods", void 0);
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "ulblName", void 0);
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "ulblStar", void 0);
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "ulblInventory", void 0);
    __decorate([
        property(cc.Node)
    ], GoodsCom.prototype, "uBtnGet", void 0);
    GoodsCom = __decorate([
        ccclass
    ], GoodsCom);
    return GoodsCom;
}(cc.Component));
exports.default = GoodsCom;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9Hb29kc0NvbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5REFBd0Q7QUFHbEQsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFHNUM7SUFBc0MsNEJBQVk7SUFBbEQ7UUFBQSxxRUFnRUM7UUE3REcsV0FBSyxHQUFhLElBQUksQ0FBQztRQUd2QixlQUFTLEdBQWMsSUFBSSxDQUFDO1FBRzVCLGNBQVEsR0FBYSxJQUFJLENBQUM7UUFHMUIsY0FBUSxHQUFhLElBQUksQ0FBQztRQUcxQixtQkFBYSxHQUFhLElBQUksQ0FBQztRQUcvQixhQUFPLEdBQVksSUFBSSxDQUFDO1FBRXhCLFdBQVc7UUFDWCxTQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7O0lBMkNyQixDQUFDO0lBeENHLHNCQUFJLCtCQUFTO1FBRGIsY0FBYzthQUNkO1lBQ0ksT0FBTyx5QkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsQ0FBQzs7O09BQUE7SUFFRCx5QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELHVCQUFJLEdBQUosVUFBSyxHQUFXO1FBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELGtDQUFlLEdBQWY7UUFBQSxpQkFlQztRQWRHLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFakMsSUFBTSxHQUFHLEdBQVcsNEJBQTBCLFNBQVMsQ0FBQyxFQUFJLENBQUM7UUFDN0QsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFDLEdBQUcsRUFBRSxXQUEyQjtZQUNyRSxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3BDLE9BQU87YUFDVjtZQUVELEtBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxPQUFLLFNBQVMsQ0FBQyxJQUFNLENBQUM7SUFDakQsQ0FBQztJQUVELFVBQVU7SUFDViwyQkFBUSxHQUFSO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELEtBQUs7SUFDTCx3QkFBSyxHQUFMO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQU0sQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUE1REQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzsyQ0FDSTtJQUd2QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDOytDQUNRO0lBRzVCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7OENBQ087SUFHMUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs4Q0FDTztJQUcxQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO21EQUNZO0lBRy9CO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7NkNBQ007SUFsQlAsUUFBUTtRQUQ1QixPQUFPO09BQ2EsUUFBUSxDQWdFNUI7SUFBRCxlQUFDO0NBaEVELEFBZ0VDLENBaEVxQyxFQUFFLENBQUMsU0FBUyxHQWdFakQ7a0JBaEVvQixRQUFRIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ29vZHNNb2R1bGUgfSBmcm9tIFwiLi4vZGF0YU1vZHVsZS9Hb29kc01vZHVsZVwiO1xuaW1wb3J0IHsgR29vZHNUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvRGVmaW5lXCI7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb29kc0NvbSBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgbGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5TcHJpdGUpXG4gICAgdUltZ0dvb2RzOiBjYy5TcHJpdGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxOYW1lOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFN0YXI6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsSW52ZW50b3J5OiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1QnRuR2V0OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIC8vIOWVhuWTgeWIl+ihqOS4reeahOe0ouW8lVxuICAgIGlkeDogbnVtYmVyID0gLTE7XG5cbiAgICAvLyDlvZPliY3mnIDmlrDnmoTllYblk4Hkv6Hmga/nirbmgIFcbiAgICBnZXQgZ29vZHNEYXRhKCk6IEdvb2RzVHlwZSB7XG4gICAgICAgIHJldHVybiBnb29kc01vZHVsZS5nb29kc1t0aGlzLmlkeF07XG4gICAgfVxuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uU2VsZWN0LCB0aGlzKTtcbiAgICAgICAgdGhpcy51QnRuR2V0Lm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vbkdldCwgdGhpcyk7XG4gICAgfVxuXG4gICAgaW5pdChpZHg6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmlkeCA9IGlkeDtcbiAgICAgICAgdGhpcy5mb3JtYXRHb29kc0luZm8oKTtcbiAgICB9XG5cbiAgICBmb3JtYXRHb29kc0luZm8oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGdvb2RzSW5mbyA9IHRoaXMuZ29vZHNEYXRhO1xuXG4gICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYGltYWdlcy9nb29kcy9pbWdfZ29vZHNfJHtnb29kc0luZm8uaWR9YDtcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQodXJsLCBjYy5TcHJpdGVGcmFtZSwgKChlcnIsIHNwcml0ZUZyYW1lOiBjYy5TcHJpdGVGcmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3VybDonLCB1cmwsICcvZXJyOicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy51SW1nR29vZHMuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMudWxibE5hbWUuc3RyaW5nID0gZ29vZHNJbmZvLm5hbWU7XG4gICAgICAgIHRoaXMudWxibFN0YXIuc3RyaW5nID0gYHggJHtnb29kc0luZm8uc3Rhcn1gO1xuICAgIH1cblxuICAgIC8vIOWxleekuuWVhuWTgeivpuaDhemhtVxuICAgIG9uU2VsZWN0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHXSDmmL7npLrllYblk4Hor6bmg4UnLCB0aGlzLmdvb2RzRGF0YSk7XG4gICAgfVxuXG4gICAgLy8g5YWR5o2iXG4gICAgb25HZXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbREVCVUddIOWFkeaNouWVhuWTgSR7dGhpcy5nb29kc0RhdGEubmFtZX1gKTtcbiAgICB9XG59XG4iXX0=