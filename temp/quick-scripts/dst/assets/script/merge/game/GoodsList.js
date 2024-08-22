
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/GoodsList.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'c429fRntiVHaLkAc6vP2F5Q', 'GoodsList');
// script/merge/game/GoodsList.ts

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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var GoodsModule_1 = require("../dataModule/GoodsModule");
var Uimanager_1 = require("../manager/Uimanager");
var GoodsCom_1 = require("./GoodsCom");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GoodsList = /** @class */ (function (_super) {
    __extends(GoodsList, _super);
    function GoodsList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.label = null;
        _this.uPanel = null;
        return _this;
    }
    GoodsList.prototype.onLoad = function () {
    };
    GoodsList.prototype.initGoods = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, goods;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.uPanel.content.removeAllChildren();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < GoodsModule_1.goodsModule.goods.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.produceGoods()];
                    case 2:
                        goods = _a.sent();
                        goods.getComponent(GoodsCom_1.default).init(i);
                        this.uPanel.content.addChild(goods);
                        goods.x = i * goods.width + goods.width / 2;
                        this.uPanel.content.width = (i + 1) * goods.width;
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GoodsList.prototype.produceGoods = function () {
        return __awaiter(this, void 0, Promise, function () {
            var coinPrefab, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/merge/goodsCom')];
                    case 1:
                        coinPrefab = _a.sent();
                        coin = cc.instantiate(coinPrefab);
                        return [2 /*return*/, coin];
                }
            });
        });
    };
    __decorate([
        property(cc.Label)
    ], GoodsList.prototype, "label", void 0);
    __decorate([
        property(cc.ScrollView)
    ], GoodsList.prototype, "uPanel", void 0);
    GoodsList = __decorate([
        ccclass
    ], GoodsList);
    return GoodsList;
}(cc.Component));
exports.default = GoodsList;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9Hb29kc0xpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseURBQXdEO0FBQ3hELGtEQUFpRDtBQUNqRCx1Q0FBa0M7QUFFNUIsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFHNUM7SUFBdUMsNkJBQVk7SUFBbkQ7UUFBQSxxRUE0QkM7UUF6QkcsV0FBSyxHQUFhLElBQUksQ0FBQztRQUd2QixZQUFNLEdBQWtCLElBQUksQ0FBQzs7SUFzQmpDLENBQUM7SUFwQkcsMEJBQU0sR0FBTjtJQUVBLENBQUM7SUFFSyw2QkFBUyxHQUFmOzs7Ozs7d0JBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzt3QkFDL0IsQ0FBQyxHQUFHLENBQUM7Ozs2QkFBRSxDQUFBLENBQUMsR0FBRyx5QkFBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUE7d0JBQzFCLHFCQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQTs7d0JBQWpDLEtBQUssR0FBRyxTQUF5Qjt3QkFDdkMsS0FBSyxDQUFDLFlBQVksQ0FBQyxrQkFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3BDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7d0JBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDOzs7d0JBTFIsQ0FBQyxFQUFFLENBQUE7Ozs7OztLQU9wRDtJQUVLLGdDQUFZLEdBQWxCO3VDQUFzQixPQUFPOzs7OzRCQUNOLHFCQUFNLHFCQUFTLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLEVBQUE7O3dCQUFoRSxVQUFVLEdBQUcsU0FBbUQ7d0JBQ2hFLElBQUksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUN4QyxzQkFBTyxJQUFJLEVBQUM7Ozs7S0FDZjtJQXhCRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzRDQUNJO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUM7NkNBQ0s7SUFOWixTQUFTO1FBRDdCLE9BQU87T0FDYSxTQUFTLENBNEI3QjtJQUFELGdCQUFDO0NBNUJELEFBNEJDLENBNUJzQyxFQUFFLENBQUMsU0FBUyxHQTRCbEQ7a0JBNUJvQixTQUFTIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ29vZHNNb2R1bGUgfSBmcm9tIFwiLi4vZGF0YU1vZHVsZS9Hb29kc01vZHVsZVwiO1xuaW1wb3J0IHsgdWltYW5hZ2VyIH0gZnJvbSBcIi4uL21hbmFnZXIvVWltYW5hZ2VyXCI7XG5pbXBvcnQgR29vZHNDb20gZnJvbSBcIi4vR29vZHNDb21cIjtcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdvb2RzTGlzdCBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgbGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5TY3JvbGxWaWV3KVxuICAgIHVQYW5lbDogY2MuU2Nyb2xsVmlldyA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG5cbiAgICB9XG5cbiAgICBhc3luYyBpbml0R29vZHMoKSB7XG4gICAgICAgIHRoaXMudVBhbmVsLmNvbnRlbnQucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnb29kc01vZHVsZS5nb29kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ29vZHMgPSBhd2FpdCB0aGlzLnByb2R1Y2VHb29kcygpO1xuICAgICAgICAgICAgZ29vZHMuZ2V0Q29tcG9uZW50KEdvb2RzQ29tKS5pbml0KGkpO1xuICAgICAgICAgICAgdGhpcy51UGFuZWwuY29udGVudC5hZGRDaGlsZChnb29kcyk7XG4gICAgICAgICAgICBnb29kcy54ID0gaSAqIGdvb2RzLndpZHRoICsgZ29vZHMud2lkdGggLyAyO1xuICAgICAgICAgICAgdGhpcy51UGFuZWwuY29udGVudC53aWR0aCA9IChpICsgMSkgKiBnb29kcy53aWR0aDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHByb2R1Y2VHb29kcygpOiBQcm9taXNlPGNjLk5vZGU+IHtcbiAgICAgICAgY29uc3QgY29pblByZWZhYiA9IGF3YWl0IHVpbWFuYWdlci5sb2FkUHJlZmFiKCdwcmVmYWIvbWVyZ2UvZ29vZHNDb20nKTtcbiAgICAgICAgY29uc3QgY29pbiA9IGNjLmluc3RhbnRpYXRlKGNvaW5QcmVmYWIpO1xuICAgICAgICByZXR1cm4gY29pbjtcbiAgICB9XG59XG4iXX0=