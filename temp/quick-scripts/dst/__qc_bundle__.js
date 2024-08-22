
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/__qc_index__.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}
require('./assets/script/merge/dataModule/DataModule');
require('./assets/script/merge/dataModule/GameModule');
require('./assets/script/merge/dataModule/GoodsModule');
require('./assets/script/merge/dataModule/PlayerModule');
require('./assets/script/merge/define/TypeDefine');
require('./assets/script/merge/game/Coin');
require('./assets/script/merge/game/Game');
require('./assets/script/merge/game/GoodsCom');
require('./assets/script/merge/game/GoodsList');
require('./assets/script/merge/game/MergeProgress');
require('./assets/script/merge/game/MergeScene');
require('./assets/script/merge/game/Slot');
require('./assets/script/merge/manager/AudioMgr');
require('./assets/script/merge/manager/Define');
require('./assets/script/merge/manager/Uimanager');
require('./assets/script/merge/pulicCom/TouchEffect');
require('./assets/script/merge/util/EventManager');
require('./assets/script/merge/util/NewUtils');
require('./assets/script/merge/util/logger');

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
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/DataModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'a9783XxZiJAGobx47+4NsqL', 'DataModule');
// script/merge/dataModule/DataModule.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataModule = /** @class */ (function () {
    function DataModule() {
        this.mData = null;
    }
    DataModule.prototype.parseData = function (data) {
        this.mData = data;
    };
    return DataModule;
}());
exports.default = DataModule;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9EYXRhTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7SUFHSTtRQUZPLFVBQUssR0FBRyxJQUFJLENBQUM7SUFFRyxDQUFDO0lBRXhCLDhCQUFTLEdBQVQsVUFBVSxJQUFTO1FBQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FSQSxBQVFDLElBQUEiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRhTW9kdWxlIHtcbiAgICBwdWJsaWMgbURhdGEgPSBudWxsO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCkgeyB9XG5cbiAgICBwYXJzZURhdGEoZGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMubURhdGEgPSBkYXRhO1xuICAgIH1cbn1cbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/define/TypeDefine.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '26083HQUZhNsJndxpxVjML2', 'TypeDefine');
// script/merge/define/TypeDefine.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAYER = void 0;
// 层级
var LAYER;
(function (LAYER) {
    LAYER["UI"] = "ui";
    LAYER["DIALOG"] = "dialog";
    LAYER["TIP"] = "tip";
    LAYER["GUIDE"] = "guide";
})(LAYER = exports.LAYER || (exports.LAYER = {}));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGVmaW5lL1R5cGVEZWZpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsS0FBSztBQUNMLElBQVksS0FLWDtBQUxELFdBQVksS0FBSztJQUNiLGtCQUFTLENBQUE7SUFDVCwwQkFBaUIsQ0FBQTtJQUNqQixvQkFBVyxDQUFBO0lBQ1gsd0JBQWUsQ0FBQTtBQUNuQixDQUFDLEVBTFcsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBS2hCIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5bGC57qnXG5leHBvcnQgZW51bSBMQVlFUiB7XG4gICAgVUkgPSAndWknLFxuICAgIERJQUxPRyA9ICdkaWFsb2cnLFxuICAgIFRJUCA9ICd0aXAnLFxuICAgIEdVSURFID0gJ2d1aWRlJyxcbn1cblxuIl19
//------QC-SOURCE-SPLIT------

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
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/manager/AudioMgr.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b545bFTIb1JV5LuLuiz55fk', 'AudioMgr');
// script/merge/manager/AudioMgr.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioMgr = exports.SoundType = exports.MusicType = void 0;
// 背景音乐类型
var MusicType;
(function (MusicType) {
})(MusicType = exports.MusicType || (exports.MusicType = {}));
// 音效类型
var SoundType;
(function (SoundType) {
    SoundType["MOVE_COIN"] = "moveCoin";
    SoundType["PRODUCE_COIN"] = "produceCoin";
    SoundType["MERGE_COIN"] = "mergeCoin";
    SoundType["ERROR"] = "error";
})(SoundType = exports.SoundType || (exports.SoundType = {}));
var AudioMgr = /** @class */ (function () {
    function AudioMgr() {
        this.soundClipCache = {};
        this.audioIds = {};
        // 音量
        this.musicVolume = null;
        this.soundVolume = null;
        this.curBgMusic = null;
        this.canPlayMusic = true;
        this.canPlaySound = true; //!GameConfig.DEBUG;
        // 当前播放的背景音乐的播放索引
        this.musicId = -1;
    }
    AudioMgr.prototype.init = function () {
        cc.log("audioMgr init");
        this.curBgMusic = null;
        this.musicVolume = 0.2;
        this.soundVolume = 1.0;
        this.canPlayMusic = true;
        this.canPlaySound = true;
    };
    // 音乐
    AudioMgr.prototype.playBGM = function (music, force) {
        // 如果已经播放着就不播放了
        if (this.curBgMusic && this.curBgMusic == music)
            return;
        this.curBgMusic = music;
        if (this.canPlayMusic) {
            this.stopBGM();
            cc.resources.load(music, function (err, clip) {
                if (this.curBGMUrl == music) {
                    cc.audioEngine.stopAll();
                    this.bgmAudioID = cc.audioEngine.play(clip, true, this.bgmVolume);
                }
                else {
                    console.log("播放背景音乐失败:", err);
                }
            }.bind(this));
        }
    };
    AudioMgr.prototype.stopBGM = function () {
        cc.audioEngine.stop(this.musicId);
    };
    // /**
    //  * 同步加载声音资源
    //  * @param url 
    //  */
    // async preloadAudioClip(soundName: string) {
    //     if (!this._sfxEnabled) {
    //         return;
    //     }
    //     cc.resources.preload(`sounds/${soundName}`, cc.AudioClip)
    // }
    // 播放音效
    AudioMgr.prototype.playSound = function (soundType, volume, ext, loop, isFromNet, onStart) {
        var _this = this;
        if (volume === void 0) { volume = this.soundVolume; }
        if (ext === void 0) { ext = ".mp3"; }
        if (loop === void 0) { loop = false; }
        if (isFromNet === void 0) { isFromNet = false; }
        if (this.canPlaySound) {
            var url_1 = "sounds/" + soundType;
            if (this.soundClipCache["" + url_1]) {
                var audioId = cc.audioEngine.play(this.soundClipCache["" + url_1], loop, volume);
                onStart && onStart();
            }
            else {
                if (isFromNet) {
                    if (!url_1.startsWith("https://")) {
                        onStart && onStart();
                        return;
                    }
                    cc.assetManager.loadRemote(url_1, { ext: ext }, function (err, clip) {
                        if (!err) {
                            var audioId = cc.audioEngine.play(clip, loop, volume);
                            _this.audioIds[url_1] = audioId;
                        }
                        else {
                            console.error(err);
                        }
                        onStart && onStart();
                    });
                }
                else {
                    cc.resources.load(url_1, (function (err, clip) {
                        if (!err) {
                            var audioId = cc.audioEngine.play(clip, loop, volume);
                            _this.soundClipCache["" + url_1] = clip;
                            _this.audioIds[url_1] = audioId;
                        }
                        else {
                            console.error(err);
                        }
                        onStart && onStart();
                    }));
                }
            }
        }
        else {
            onStart && onStart();
        }
    };
    AudioMgr.prototype.stopSoundByUrl = function (url) {
        var audioId = this.audioIds[url];
        if (audioId != null) {
            cc.audioEngine.stop(audioId);
        }
    };
    AudioMgr.prototype.stopSound = function (audioId) {
        console.log("audioId", audioId);
        if (audioId != null) {
            cc.audioEngine.stop(audioId);
        }
    };
    // 暂停
    AudioMgr.prototype.pauseBGM = function () {
        if (this.musicId >= 0) {
            cc.audioEngine.pause(this.musicId);
        }
    };
    // 恢复
    AudioMgr.prototype.resumeBGM = function () {
        if (this.musicId >= 0) {
            cc.audioEngine.resume(this.musicId);
        }
    };
    // 卸载音效
    AudioMgr.prototype.uncache = function (url) {
        var audioUrl = cc.url.raw(url);
        cc.audioEngine.uncache(audioUrl);
        this.soundClipCache["" + url] = undefined;
    };
    AudioMgr.prototype.uncacheAll = function () {
        cc.audioEngine.uncacheAll();
        this.soundClipCache = {};
    };
    AudioMgr.prototype.pauseAll = function () {
        console.log('Pause All Sound');
        cc.audioEngine.pauseAll();
    };
    AudioMgr.prototype.resumeAll = function () {
        console.log('Resum All Sound');
        cc.audioEngine.resumeAll();
    };
    AudioMgr.prototype.stopAll = function () {
        cc.audioEngine.stopAll();
    };
    AudioMgr.prototype.clean = function () {
        this.stopAll();
        this.uncacheAll();
        this.curBgMusic = '';
        this.musicId = -1;
    };
    AudioMgr.Instance = new AudioMgr();
    return AudioMgr;
}());
exports.default = AudioMgr;
exports.audioMgr = AudioMgr.Instance;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9BdWRpb01nci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTO0FBQ1QsSUFBWSxTQUVYO0FBRkQsV0FBWSxTQUFTO0FBRXJCLENBQUMsRUFGVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUVwQjtBQUVELE9BQU87QUFDUCxJQUFZLFNBTVg7QUFORCxXQUFZLFNBQVM7SUFDakIsbUNBQXNCLENBQUE7SUFDdEIseUNBQTRCLENBQUE7SUFDNUIscUNBQXdCLENBQUE7SUFDeEIsNEJBQWUsQ0FBQTtBQUVuQixDQUFDLEVBTlcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFNcEI7QUFFRDtJQUdJO1FBR1EsbUJBQWMsR0FBRyxFQUV4QixDQUFDO1FBQ00sYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUV0QixLQUFLO1FBQ0csZ0JBQVcsR0FBVyxJQUFJLENBQUE7UUFDMUIsZ0JBQVcsR0FBVyxJQUFJLENBQUE7UUFFMUIsZUFBVSxHQUFRLElBQUksQ0FBQztRQUN2QixpQkFBWSxHQUFZLElBQUksQ0FBQztRQUM3QixpQkFBWSxHQUFZLElBQUksQ0FBQyxDQUFBLG9CQUFvQjtRQUV6RCxpQkFBaUI7UUFDVCxZQUFPLEdBQVcsQ0FBQyxDQUFDLENBQUM7SUFoQjdCLENBQUM7SUFrQkQsdUJBQUksR0FBSjtRQUNJLEVBQUUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFFdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFFdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUVELEtBQUs7SUFDRSwwQkFBTyxHQUFkLFVBQWUsS0FBSyxFQUFFLEtBQUs7UUFDdkIsZUFBZTtRQUNmLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLEtBQUs7WUFBRSxPQUFPO1FBRXhELElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsVUFBVSxHQUFHLEVBQUUsSUFBSTtnQkFDeEMsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLEtBQUssRUFBRTtvQkFDekIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDckU7cUJBQU07b0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUE7aUJBQ2hDO1lBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0lBQ0wsQ0FBQztJQUVNLDBCQUFPLEdBQWQ7UUFDSSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELE1BQU07SUFDTixjQUFjO0lBQ2QsaUJBQWlCO0lBQ2pCLE1BQU07SUFDTiw4Q0FBOEM7SUFDOUMsK0JBQStCO0lBQy9CLGtCQUFrQjtJQUNsQixRQUFRO0lBRVIsZ0VBQWdFO0lBQ2hFLElBQUk7SUFFSixPQUFPO0lBQ0EsNEJBQVMsR0FBaEIsVUFBaUIsU0FBaUIsRUFBRSxNQUE4QixFQUFFLEdBQW9CLEVBQUUsSUFBcUIsRUFBRSxTQUEwQixFQUFFLE9BQWtCO1FBQS9KLGlCQXNDQztRQXRDbUMsdUJBQUEsRUFBQSxTQUFjLElBQUksQ0FBQyxXQUFXO1FBQUUsb0JBQUEsRUFBQSxZQUFvQjtRQUFFLHFCQUFBLEVBQUEsWUFBcUI7UUFBRSwwQkFBQSxFQUFBLGlCQUEwQjtRQUN2SSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsSUFBTSxLQUFHLEdBQUcsWUFBVSxTQUFXLENBQUM7WUFFbEMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUcsS0FBSyxDQUFDLEVBQUU7Z0JBQy9CLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBRyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2pGLE9BQU8sSUFBSSxPQUFPLEVBQUUsQ0FBQzthQUN4QjtpQkFBTTtnQkFDSCxJQUFJLFNBQVMsRUFBRTtvQkFDWCxJQUFJLENBQUMsS0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDN0IsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO3dCQUNyQixPQUFPO3FCQUNWO29CQUNELEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxVQUFDLEdBQUcsRUFBRSxJQUFrQjt3QkFDbEUsSUFBSSxDQUFDLEdBQUcsRUFBRTs0QkFDTixJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUN4RCxLQUFJLENBQUMsUUFBUSxDQUFDLEtBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQzt5QkFDaEM7NkJBQU07NEJBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzt5QkFDdEI7d0JBQ0QsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUN6QixDQUFDLENBQUMsQ0FBQztpQkFDTjtxQkFBTTtvQkFDSCxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFHLEVBQUUsQ0FBQyxVQUFDLEdBQUcsRUFBRSxJQUFrQjt3QkFDNUMsSUFBSSxDQUFDLEdBQUcsRUFBRTs0QkFDTixJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUN4RCxLQUFJLENBQUMsY0FBYyxDQUFDLEtBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDOzRCQUNyQyxLQUFJLENBQUMsUUFBUSxDQUFDLEtBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQzt5QkFDaEM7NkJBQU07NEJBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzt5QkFDdEI7d0JBQ0QsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUN6QixDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNQO2FBQ0o7U0FDSjthQUFNO1lBQ0gsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO1NBQ3hCO0lBQ0wsQ0FBQztJQUNNLGlDQUFjLEdBQXJCLFVBQXNCLEdBQUc7UUFDckIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFDakIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBRU0sNEJBQVMsR0FBaEIsVUFBaUIsT0FBTztRQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoQyxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFDakIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBRUQsS0FBSztJQUNFLDJCQUFRLEdBQWY7UUFDSSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFFO1lBQ25CLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN0QztJQUNMLENBQUM7SUFFRCxLQUFLO0lBQ0UsNEJBQVMsR0FBaEI7UUFDSSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFFO1lBQ25CLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFRCxPQUFPO0lBQ1AsMEJBQU8sR0FBUCxVQUFRLEdBQUc7UUFDUCxJQUFNLFFBQVEsR0FBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUcsR0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQzlDLENBQUM7SUFFRCw2QkFBVSxHQUFWO1FBQ0ksRUFBRSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsMkJBQVEsR0FBUjtRQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvQixFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRCw0QkFBUyxHQUFUO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQy9CLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVELDBCQUFPLEdBQVA7UUFDSSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRCx3QkFBSyxHQUFMO1FBQ0ksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQXRLYSxpQkFBUSxHQUFhLElBQUksUUFBUSxFQUFFLENBQUM7SUF1S3RELGVBQUM7Q0F4S0QsQUF3S0MsSUFBQTtrQkF4S29CLFFBQVE7QUF5S2hCLFFBQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDog4zmma/pn7PkuZDnsbvlnotcbmV4cG9ydCBlbnVtIE11c2ljVHlwZSB7XG5cbn1cblxuLy8g6Z+z5pWI57G75Z6LXG5leHBvcnQgZW51bSBTb3VuZFR5cGUge1xuICAgIE1PVkVfQ09JTiA9ICdtb3ZlQ29pbicsXG4gICAgUFJPRFVDRV9DT0lOID0gJ3Byb2R1Y2VDb2luJyxcbiAgICBNRVJHRV9DT0lOID0gJ21lcmdlQ29pbicsXG4gICAgRVJST1IgPSAnZXJyb3InLFxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1ZGlvTWdyIHtcbiAgICBwdWJsaWMgc3RhdGljIEluc3RhbmNlOiBBdWRpb01nciA9IG5ldyBBdWRpb01ncigpO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNvdW5kQ2xpcENhY2hlID0ge1xuXG4gICAgfTtcbiAgICBwcml2YXRlIGF1ZGlvSWRzID0ge307XG5cbiAgICAvLyDpn7Pph49cbiAgICBwcml2YXRlIG11c2ljVm9sdW1lOiBudW1iZXIgPSBudWxsXG4gICAgcHJpdmF0ZSBzb3VuZFZvbHVtZTogbnVtYmVyID0gbnVsbFxuXG4gICAgcHJpdmF0ZSBjdXJCZ011c2ljOiBhbnkgPSBudWxsO1xuICAgIHByaXZhdGUgY2FuUGxheU11c2ljOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIGNhblBsYXlTb3VuZDogYm9vbGVhbiA9IHRydWU7Ly8hR2FtZUNvbmZpZy5ERUJVRztcblxuICAgIC8vIOW9k+WJjeaSreaUvueahOiDjOaZr+mfs+S5kOeahOaSreaUvue0ouW8lVxuICAgIHByaXZhdGUgbXVzaWNJZDogbnVtYmVyID0gLTE7XG5cbiAgICBpbml0KCkge1xuICAgICAgICBjYy5sb2coXCJhdWRpb01nciBpbml0XCIpO1xuICAgICAgICB0aGlzLmN1ckJnTXVzaWMgPSBudWxsO1xuXG4gICAgICAgIHRoaXMubXVzaWNWb2x1bWUgPSAwLjI7XG4gICAgICAgIHRoaXMuc291bmRWb2x1bWUgPSAxLjA7XG5cbiAgICAgICAgdGhpcy5jYW5QbGF5TXVzaWMgPSB0cnVlO1xuICAgICAgICB0aGlzLmNhblBsYXlTb3VuZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8g6Z+z5LmQXG4gICAgcHVibGljIHBsYXlCR00obXVzaWMsIGZvcmNlKSB7XG4gICAgICAgIC8vIOWmguaenOW3sue7j+aSreaUvuedgOWwseS4jeaSreaUvuS6hlxuICAgICAgICBpZiAodGhpcy5jdXJCZ011c2ljICYmIHRoaXMuY3VyQmdNdXNpYyA9PSBtdXNpYykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuY3VyQmdNdXNpYyA9IG11c2ljO1xuICAgICAgICBpZiAodGhpcy5jYW5QbGF5TXVzaWMpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcEJHTSgpO1xuICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQobXVzaWMsIGZ1bmN0aW9uIChlcnIsIGNsaXApIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJCR01VcmwgPT0gbXVzaWMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJnbUF1ZGlvSUQgPSBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIHRydWUsIHRoaXMuYmdtVm9sdW1lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuaSreaUvuiDjOaZr+mfs+S5kOWksei0pTpcIiwgZXJyKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcEJHTSgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcCh0aGlzLm11c2ljSWQpO1xuICAgIH1cblxuICAgIC8vIC8qKlxuICAgIC8vICAqIOWQjOatpeWKoOi9veWjsOmfs+i1hOa6kFxuICAgIC8vICAqIEBwYXJhbSB1cmwgXG4gICAgLy8gICovXG4gICAgLy8gYXN5bmMgcHJlbG9hZEF1ZGlvQ2xpcChzb3VuZE5hbWU6IHN0cmluZykge1xuICAgIC8vICAgICBpZiAoIXRoaXMuX3NmeEVuYWJsZWQpIHtcbiAgICAvLyAgICAgICAgIHJldHVybjtcbiAgICAvLyAgICAgfVxuXG4gICAgLy8gICAgIGNjLnJlc291cmNlcy5wcmVsb2FkKGBzb3VuZHMvJHtzb3VuZE5hbWV9YCwgY2MuQXVkaW9DbGlwKVxuICAgIC8vIH1cblxuICAgIC8vIOaSreaUvumfs+aViFxuICAgIHB1YmxpYyBwbGF5U291bmQoc291bmRUeXBlOiBzdHJpbmcsIHZvbHVtZTogYW55ID0gdGhpcy5zb3VuZFZvbHVtZSwgZXh0OiBzdHJpbmcgPSBcIi5tcDNcIiwgbG9vcDogYm9vbGVhbiA9IGZhbHNlLCBpc0Zyb21OZXQ6IGJvb2xlYW4gPSBmYWxzZSwgb25TdGFydD86IEZ1bmN0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmNhblBsYXlTb3VuZCkge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYHNvdW5kcy8ke3NvdW5kVHlwZX1gO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdWRpb0lkID0gY2MuYXVkaW9FbmdpbmUucGxheSh0aGlzLnNvdW5kQ2xpcENhY2hlW2Ake3VybH1gXSwgbG9vcCwgdm9sdW1lKTtcbiAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRnJvbU5ldCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXVybC5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNjLmFzc2V0TWFuYWdlci5sb2FkUmVtb3RlKHVybCwgeyBleHQ6IGV4dCB9LCAoZXJyLCBjbGlwOiBjYy5BdWRpb0NsaXApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXVkaW9JZCA9IGNjLmF1ZGlvRW5naW5lLnBsYXkoY2xpcCwgbG9vcCwgdm9sdW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvSWRzW3VybF0gPSBhdWRpb0lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQodXJsLCAoKGVyciwgY2xpcDogY2MuQXVkaW9DbGlwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF1ZGlvSWQgPSBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIGxvb3AsIHZvbHVtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0gPSBjbGlwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9JZHNbdXJsXSA9IGF1ZGlvSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25TdGFydCAmJiBvblN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHN0b3BTb3VuZEJ5VXJsKHVybCkge1xuICAgICAgICBsZXQgYXVkaW9JZCA9IHRoaXMuYXVkaW9JZHNbdXJsXTtcbiAgICAgICAgaWYgKGF1ZGlvSWQgIT0gbnVsbCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcChhdWRpb0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wU291bmQoYXVkaW9JZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImF1ZGlvSWRcIiwgYXVkaW9JZCk7XG4gICAgICAgIGlmIChhdWRpb0lkICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3AoYXVkaW9JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmmoLlgZxcbiAgICBwdWJsaWMgcGF1c2VCR00oKSB7XG4gICAgICAgIGlmICh0aGlzLm11c2ljSWQgPj0gMCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGF1c2UodGhpcy5tdXNpY0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOaBouWkjVxuICAgIHB1YmxpYyByZXN1bWVCR00oKSB7XG4gICAgICAgIGlmICh0aGlzLm11c2ljSWQgPj0gMCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucmVzdW1lKHRoaXMubXVzaWNJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDljbjovb3pn7PmlYhcbiAgICB1bmNhY2hlKHVybCkge1xuICAgICAgICBjb25zdCBhdWRpb1VybDogYW55ID0gY2MudXJsLnJhdyh1cmwpO1xuICAgICAgICBjYy5hdWRpb0VuZ2luZS51bmNhY2hlKGF1ZGlvVXJsKTtcbiAgICAgICAgdGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0gPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdW5jYWNoZUFsbCgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUudW5jYWNoZUFsbCgpO1xuICAgICAgICB0aGlzLnNvdW5kQ2xpcENhY2hlID0ge307XG4gICAgfVxuXG4gICAgcGF1c2VBbGwoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQYXVzZSBBbGwgU291bmQnKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGF1c2VBbGwoKTtcbiAgICB9XG5cbiAgICByZXN1bWVBbGwoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSZXN1bSBBbGwgU291bmQnKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucmVzdW1lQWxsKCk7XG4gICAgfVxuXG4gICAgc3RvcEFsbCgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xuICAgIH1cblxuICAgIGNsZWFuKCkge1xuICAgICAgICB0aGlzLnN0b3BBbGwoKTtcbiAgICAgICAgdGhpcy51bmNhY2hlQWxsKCk7XG4gICAgICAgIHRoaXMuY3VyQmdNdXNpYyA9ICcnO1xuICAgICAgICB0aGlzLm11c2ljSWQgPSAtMTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgYXVkaW9NZ3IgPSBBdWRpb01nci5JbnN0YW5jZTsiXX0=
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/MergeProgress.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '77cddiCwBxKFLf9oKyUt+gA', 'MergeProgress');
// script/merge/game/MergeProgress.ts

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
var GameModule_1 = require("../dataModule/GameModule");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var MergeProgress = /** @class */ (function (_super) {
    __extends(MergeProgress, _super);
    function MergeProgress() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblTar = null;
        _this.uImgBar = null;
        return _this;
    }
    MergeProgress.prototype.onLoad = function () {
        this.uImgBar.width = 0;
        this.ulblTar.node.color = new cc.Color().fromHEX('#4b91e4');
    };
    MergeProgress.prototype.updateProress = function () {
        var totalW = 585;
        var tar = GameModule_1.gameModule.getMaxValue();
        var tarW = Math.floor(tar / 15 * totalW);
        cc.tween(this.uImgBar)
            .to(0.3, { width: tarW }, { easing: cc.easing.cubicInOut })
            .start();
    };
    __decorate([
        property(cc.Label)
    ], MergeProgress.prototype, "ulblTar", void 0);
    __decorate([
        property(cc.Node)
    ], MergeProgress.prototype, "uImgBar", void 0);
    MergeProgress = __decorate([
        ccclass
    ], MergeProgress);
    return MergeProgress;
}(cc.Component));
exports.default = MergeProgress;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9NZXJnZVByb2dyZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEQUFzRDtBQUVoRCxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUEyQyxpQ0FBWTtJQUF2RDtRQUFBLHFFQXNCQztRQW5CRyxhQUFPLEdBQWEsSUFBSSxDQUFDO1FBR3pCLGFBQU8sR0FBWSxJQUFJLENBQUM7O0lBZ0I1QixDQUFDO0lBZEcsOEJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxxQ0FBYSxHQUFiO1FBQ0ksSUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ25CLElBQU0sR0FBRyxHQUFHLHVCQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUNqQixFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDMUQsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQWpCRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2tEQUNNO0lBR3pCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7a0RBQ007SUFOUCxhQUFhO1FBRGpDLE9BQU87T0FDYSxhQUFhLENBc0JqQztJQUFELG9CQUFDO0NBdEJELEFBc0JDLENBdEIwQyxFQUFFLENBQUMsU0FBUyxHQXNCdEQ7a0JBdEJvQixhQUFhIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2FtZU1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL0dhbWVNb2R1bGVcIjtcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lcmdlUHJvZ3Jlc3MgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxUYXI6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdCYXI6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLnVJbWdCYXIud2lkdGggPSAwO1xuICAgICAgICB0aGlzLnVsYmxUYXIubm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigpLmZyb21IRVgoJyM0YjkxZTQnKTsgICAgICAgIFxuICAgIH1cblxuICAgIHVwZGF0ZVByb3Jlc3MoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHRvdGFsVyA9IDU4NTtcbiAgICAgICAgY29uc3QgdGFyID0gZ2FtZU1vZHVsZS5nZXRNYXhWYWx1ZSgpO1xuICAgICAgICBjb25zdCB0YXJXID0gTWF0aC5mbG9vcih0YXIgLyAxNSAqIHRvdGFsVyk7XG4gICAgICAgIGNjLnR3ZWVuKHRoaXMudUltZ0JhcilcbiAgICAgICAgICAgIC50bygwLjMsIHsgd2lkdGg6IHRhclcgfSwgeyBlYXNpbmc6IGNjLmVhc2luZy5jdWJpY0luT3V0IH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbn1cbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/Slot.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'dcad5zWGmVAHYWaggo3w0WB', 'Slot');
// script/merge/game/Slot.ts

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
var GameModule_1 = require("../dataModule/GameModule");
var AudioMgr_1 = require("../manager/AudioMgr");
var Define_1 = require("../manager/Define");
var Uimanager_1 = require("../manager/Uimanager");
var EventManager_1 = require("../util/EventManager");
var Coin_1 = require("./Coin");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Slot = /** @class */ (function (_super) {
    __extends(Slot, _super);
    function Slot() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // 当前筹码槽位的索引
        _this.idx = 0;
        // 筹码的坐标位置
        _this.coinOriginalPos = [
            [58, 197],
            [58, 178],
            [58, 159.3],
            [58, 140],
            [58, 121],
            [58, 102],
            [58, 83],
            [58, 64],
            [58, 45],
            [58, 26],
        ];
        _this.coin0 = null;
        _this.coin1 = null;
        _this.coin2 = null;
        _this.coin3 = null;
        _this.coin4 = null;
        _this.coin5 = null;
        _this.coin6 = null;
        _this.coin7 = null;
        _this.coin8 = null;
        _this.coin9 = null;
        _this.uImgSlotSelect = null;
        _this.uImgSlotMerge = null;
        return _this;
        // update (dt) {}
    }
    Slot.prototype.onLoad = function () {
        // 添加点击事件
        this.node.on(cc.Node.EventType.TOUCH_END, this.selectAction, this);
        EventManager_1.eventManager.on(Define_1.EventType.MOVE_COIN, this.onMove, this);
        EventManager_1.eventManager.on(Define_1.EventType.MOVE_END, this.onMoveEnd, this);
        EventManager_1.eventManager.on(Define_1.EventType.CHECK_MERGE, this.onUpdateMergeStatus, this);
        EventManager_1.eventManager.on(Define_1.EventType.MERGE_COIN, this.onMerge, this);
        EventManager_1.eventManager.on(Define_1.EventType.MOVE_CHECK_FAIL, this.canNotMove, this);
        EventManager_1.eventManager.on(Define_1.EventType.CANCEL_SELECT, this.onDeSelect, this);
    };
    Slot.prototype.start = function () {
    };
    // 格式化数据
    Slot.prototype.formatData = function (idx, data) {
        var _this = this;
        this.idx = idx;
        var _loop_1 = function (i) {
            // data
            if (data[i] !== 0) {
                this_1["coin" + i].getComponent(Coin_1.default).init(this_1.idx, data[i], function () {
                    _this["coin" + i].active = true;
                });
            }
            else {
                this_1["coin" + i].active = false;
            }
            // pos
            this_1["coin" + i].setPosition(cc.v2(this_1.coinOriginalPos[i][0], this_1.coinOriginalPos[i][1]));
        };
        var this_1 = this;
        for (var i = 0; i < 10; i++) {
            _loop_1(i);
        }
        this.node.setSiblingIndex(this.idx);
    };
    // 选择行为
    Slot.prototype.selectAction = function () {
        if (GameModule_1.gameModule.curSelectSlotIdx === -1) {
            // 初次选择行为
            this.onSelect();
        }
        else if (GameModule_1.gameModule.curSelectSlotIdx === this.idx) {
            // 取消选择行为
            this.onDeSelect();
        }
        else {
            // 移动行为 当前节点为目标节点
            this.onCheckMove();
        }
    };
    // 选中当前槽位
    Slot.prototype.onSelect = function () {
        var slotData = GameModule_1.gameModule.slotData[this.idx];
        // 选中了空的槽位
        if (slotData[0] === 0) {
            console.log('选中了空的槽位');
            return;
        }
        // 合并效果中，不可选中
        if (GameModule_1.gameModule.mergeLock) {
            console.log('正在合并中，无法选中');
            return;
        }
        GameModule_1.gameModule.curSelectSlotIdx = this.idx;
        this.uImgSlotSelect.active = true;
        this.node.setSiblingIndex(8);
        // 挑选待操作筹码的索引
        GameModule_1.gameModule.curSelectCoinIdxs = [];
        for (var i = 9; i >= 0; i--) {
            if (slotData[i] === 0)
                continue;
            if (GameModule_1.gameModule.curSelectCoinIdxs.length === 0) {
                GameModule_1.gameModule.curSelectCoinIdxs.push(i);
            }
            else if (slotData[i] === slotData[GameModule_1.gameModule.curSelectCoinIdxs[GameModule_1.gameModule.curSelectCoinIdxs.length - 1]]) {
                GameModule_1.gameModule.curSelectCoinIdxs.push(i);
            }
            else {
                break;
            }
        }
        console.log("\u9009\u4E2D\u4E86\u7B2C" + this.idx + "\u4E2A\u69FD\u7684", GameModule_1.gameModule.curSelectCoinIdxs);
        // 对待操作筹码的显示效果进行展示
        for (var i = 0; i < GameModule_1.gameModule.curSelectCoinIdxs.length; i++) {
            var tarPosY = this.coinOriginalPos[GameModule_1.gameModule.curSelectCoinIdxs[i]][1] + 25;
            cc.tween(this["coin" + GameModule_1.gameModule.curSelectCoinIdxs[i]])
                .to(0.5, { y: tarPosY }, { easing: 'backOut' })
                .start();
        }
    };
    // 取消选中
    Slot.prototype.onDeSelect = function () {
        console.log('取消选择');
        for (var i = 0; i < 10; i++) {
            // data
            var tarPosY = this.coinOriginalPos[i][1];
            cc.tween(this["coin" + i])
                .to(0.5, { y: tarPosY }, { easing: 'backOut' })
                .start();
        }
        this.uImgSlotSelect.active = false;
        // 重置选中状态
        GameModule_1.gameModule.curSelectSlotIdx = -1;
    };
    // 移动
    Slot.prototype.onCheckMove = function () {
        // 如果当前槽位已满则不允许移动
        if (GameModule_1.gameModule.slotData[this.idx].indexOf(0) === -1) {
            console.log('筹码数量已满，不可移动');
            EventManager_1.eventManager.dispatch(Define_1.EventType.MOVE_CHECK_FAIL);
            return;
        }
        // 如果当前槽位最近的筹码与当前选中的待移动筹码类型不一致 不允许移动
        var curSlotInfo = GameModule_1.gameModule.getFirstVaildNumBySlotIdx(this.idx);
        var curSelectCoinInfo = GameModule_1.gameModule.getCurSelectSlotInfo();
        if (curSlotInfo.vaildNum !== -1 && curSlotInfo.vaildNum !== curSelectCoinInfo.num) {
            console.log('筹码类型不一致, 不可移动');
            EventManager_1.eventManager.dispatch(Define_1.EventType.MOVE_CHECK_FAIL);
            return;
        }
        if (GameModule_1.gameModule.moveLock) {
            console.log('正在移动中，无法产生更多移动');
            return;
        }
        // 确定可以移动的筹码数量
        var moveCnt = Math.min(curSlotInfo.vaildSpace, curSelectCoinInfo.cnt);
        // 确定移动到的目标位置
        var tarPos = [];
        // 目标槽位发生数据变动的位置索引集
        var tarIdxArr = [];
        // 原槽位发生数据变动的槽位索引集
        var srcIdxArr = [];
        var startPosIdx = curSlotInfo.vaildIdx + 1;
        for (var i = 0; i < moveCnt; i++) {
            var oriPosX = this.coinOriginalPos[startPosIdx][0];
            var oriPosY = this.coinOriginalPos[startPosIdx][1];
            var globalPos = this.node.convertToWorldSpaceAR(cc.v2(oriPosX, oriPosY));
            tarPos.push(globalPos);
            tarIdxArr.push(startPosIdx);
            srcIdxArr.push(GameModule_1.gameModule.curSelectCoinIdxs[i]);
            startPosIdx++;
        }
        // 通知待移动的槽位进行筹码移动
        var eventData = {
            // 实际移动数量
            moveCnt: moveCnt,
            // 目标移动的节点对应位置(低->高)
            tarPos: tarPos,
            // 目标槽位实际发生数据变动的筹码索引集(低->低)
            tarIdxArr: tarIdxArr,
            // 原槽位实际发生移动的筹码索引集(高->低)
            srcIdxArr: srcIdxArr,
            // 实际发生的筹码类型
            numType: curSelectCoinInfo.num,
            // 目标槽位索引
            tarSlotIdx: this.idx,
        };
        EventManager_1.eventManager.dispatch(Define_1.EventType.MOVE_COIN, eventData);
    };
    // 移动检测失败，提示不可移动
    Slot.prototype.canNotMove = function () {
        var _this = this;
        if (GameModule_1.gameModule.curSelectSlotIdx !== this.idx)
            return;
        if (GameModule_1.gameModule.curSelectSlotIdx === -1)
            return;
        AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.ERROR);
        var _loop_2 = function (i) {
            var coinNode = this_2["coin" + GameModule_1.gameModule.curSelectCoinIdxs[i]];
            var oriPosX = coinNode.x;
            cc.tween(coinNode)
                .to(0.05, { x: oriPosX - 10 })
                .to(0.1, { x: oriPosX + 10 })
                .to(0.1, { x: oriPosX - 10 })
                .to(0.05, { x: oriPosX })
                .call(function () {
                if (i === GameModule_1.gameModule.curSelectCoinIdxs.length - 1) {
                    _this.onDeSelect();
                }
            })
                .start();
        };
        var this_2 = this;
        for (var i = 0; i < GameModule_1.gameModule.curSelectCoinIdxs.length; i++) {
            _loop_2(i);
        }
    };
    // 开始进行移动
    Slot.prototype.onMove = function (e) {
        var _this = this;
        var eventData = e.data;
        if (this.idx !== GameModule_1.gameModule.curSelectSlotIdx)
            return;
        console.log("onMove: " + GameModule_1.gameModule.curSelectSlotIdx + " -> " + eventData.tarSlotIdx);
        AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.MOVE_COIN);
        GameModule_1.gameModule.moveLock = true;
        var moveCnt = eventData.moveCnt;
        var tarWorldPos = eventData.tarPos;
        var tarLocalPos = [];
        for (var i = tarWorldPos.length - 1; i >= 0; i--) {
            tarLocalPos.push(this.node.convertToNodeSpaceAR(tarWorldPos[i]));
        }
        // 由高到低的进行移动
        var startIdx = GameModule_1.gameModule.curSelectCoinIdxs[0];
        var _loop_3 = function (i) {
            cc.tween(this_3["coin" + startIdx])
                .delay(0.03 * i)
                .to(0.1, { position: tarLocalPos[i] })
                .call(function () {
                if (i === moveCnt - 1) {
                    GameModule_1.gameModule.tidySlotData({
                        tarSlotIdx: eventData.tarSlotIdx,
                        numType: eventData.numType,
                        srcIdxArr: eventData.srcIdxArr,
                        tarIdxArr: eventData.tarIdxArr,
                    });
                    _this.onDeSelect();
                    GameModule_1.gameModule.moveLock = false;
                }
            })
                .start();
            startIdx--;
        };
        var this_3 = this;
        for (var i = 0; i < moveCnt; i++) {
            _loop_3(i);
        }
    };
    Slot.prototype.onMoveEnd = function () {
        console.log('onMoveEnd');
        this.formatData(this.idx, GameModule_1.gameModule.slotData[this.idx]);
    };
    // 刷新合成状态
    Slot.prototype.onUpdateMergeStatus = function () {
        var canMerge = GameModule_1.gameModule.checkCanMergeBySlot(this.idx);
        this.uImgSlotMerge.active = canMerge;
        this.showMergeHintAction(canMerge);
    };
    // 提示合成
    Slot.prototype.showMergeHintAction = function (canMerge) {
        var _this = this;
        if (canMerge) {
            this.uImgSlotMerge.opacity = 0;
            cc.tween(this.uImgSlotMerge)
                .to(1, { opacity: 255 })
                .to(1, { opacity: 0 })
                .call(function () { _this.showMergeHintAction(canMerge); })
                .start();
        }
        else {
            cc.tween(this.uImgSlotMerge).stop();
            this.uImgSlotMerge.active = canMerge;
        }
    };
    // 合成
    Slot.prototype.onMerge = function () {
        var _this = this;
        var canMerge = GameModule_1.gameModule.checkCanMergeBySlot(this.idx);
        if (!canMerge)
            return;
        AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.MERGE_COIN);
        GameModule_1.gameModule.mergeLock += 1;
        var _loop_4 = function (i) {
            cc.tween(this_4["coin" + i])
                .delay(0.05 * (9 - i))
                .to(0.1, { scale: 0 })
                .call(function () {
                _this["coin" + i].active = false;
                _this["coin" + i].scale = 1;
                if (i === 0) {
                    _this.onMergeFinish();
                }
            })
                .start();
        };
        var this_4 = this;
        // 合成效果
        for (var i = 9; i >= 0; i--) {
            _loop_4(i);
        }
    };
    // 合成结束
    Slot.prototype.onMergeFinish = function () {
        var _this = this;
        // 合成目标值
        var mergeTargetValue = GameModule_1.gameModule.slotData[this.idx][0] + 1;
        // 合成后的数据
        GameModule_1.gameModule.slotData[this.idx] = [mergeTargetValue, mergeTargetValue, 0, 0, 0, 0, 0, 0, 0, 0];
        console.log("\u69FD" + this.idx + " \u5408\u6210" + mergeTargetValue);
        this.coin0.scale = 0;
        this.coin1.scale = 0;
        this.coin0.getComponent(Coin_1.default).init(this.idx, mergeTargetValue, function () {
            _this.coin0.active = true;
        });
        this.coin1.getComponent(Coin_1.default).init(this.idx, mergeTargetValue, function () {
            _this.coin1.active = true;
        });
        cc.tween(this.coin0)
            .to(0.5, { scale: 1 }, { easing: 'backOut' })
            .start();
        cc.tween(this.coin1)
            .to(0.5, { scale: 1 }, { easing: 'backOut' })
            .call(function () {
            GameModule_1.gameModule.mergeLock -= 1;
            if (GameModule_1.gameModule.mergeLock < 0)
                GameModule_1.gameModule.mergeLock = 0;
            if (GameModule_1.gameModule.mergeLock === 0) {
                EventManager_1.eventManager.dispatch(Define_1.EventType.MERGE_END);
            }
        })
            .start();
        this.uImgSlotMerge.active = false;
        EventManager_1.eventManager.dispatch(Define_1.EventType.CHECK_MERGE);
    };
    // 生成筹码
    Slot.prototype.produce = function (newCoin, startGlobalPos, startPosIdx) {
        return __awaiter(this, void 0, void 0, function () {
            var localPosSrc, dealCnt, _loop_5, this_5, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(this.idx, newCoin);
                        // 不需要生成就不操作了
                        if (newCoin.length === 0) {
                            console.log(this.idx + "\u69FD\u65E0\u65B0\u7B79\u7801");
                            AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.ERROR);
                            return [2 /*return*/];
                        }
                        console.log(this.idx + " \u751F\u6210\u4E86", newCoin);
                        localPosSrc = this.node.convertToNodeSpaceAR(startGlobalPos);
                        dealCnt = 0;
                        _loop_5 = function (i) {
                            var newCoinNode, coin, tarPosIdx, posTar, tarPos;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this_5.produceCoin()];
                                    case 1:
                                        newCoinNode = _a.sent();
                                        coin = newCoinNode.getComponent(Coin_1.default);
                                        this_5.node.addChild(newCoinNode);
                                        coin.node.setPosition(localPosSrc);
                                        coin.node.active = false;
                                        coin.init(this_5.idx, newCoin[i], function () { coin.node.active = true; });
                                        tarPosIdx = startPosIdx + dealCnt;
                                        posTar = this_5.coinOriginalPos[startPosIdx + dealCnt];
                                        tarPos = cc.v2(posTar[0], posTar[1]);
                                        GameModule_1.gameModule.produceLock += 1;
                                        cc.tween(coin.node)
                                            .delay(0.1 * dealCnt)
                                            .to(0.5, { position: tarPos }, { easing: 'cubicInOut' })
                                            .call(function () {
                                            _this["coin" + tarPosIdx].getComponent(Coin_1.default).init(_this.idx, newCoin[i], function () {
                                                _this["coin" + tarPosIdx].active = true;
                                                coin.node.active = false;
                                                coin.node.destroy();
                                            });
                                            GameModule_1.gameModule.produceLock -= 1;
                                            if (GameModule_1.gameModule.produceLock < 0)
                                                GameModule_1.gameModule.produceLock = 0;
                                        })
                                            .start();
                                        dealCnt++;
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_5 = this;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < newCoin.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_5(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Slot.prototype.produceCoin = function () {
        return __awaiter(this, void 0, Promise, function () {
            var coinPrefab, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/merge/coin')];
                    case 1:
                        coinPrefab = _a.sent();
                        coin = cc.instantiate(coinPrefab);
                        return [2 /*return*/, coin];
                }
            });
        });
    };
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "coin0", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "coin1", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "coin2", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "coin3", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "coin4", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "coin5", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "coin6", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "coin7", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "coin8", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "coin9", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "uImgSlotSelect", void 0);
    __decorate([
        property(cc.Node)
    ], Slot.prototype, "uImgSlotMerge", void 0);
    Slot = __decorate([
        ccclass
    ], Slot);
    return Slot;
}(cc.Component));
exports.default = Slot;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9TbG90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEQUFzRDtBQUN0RCxnREFBMEQ7QUFDMUQsNENBQThDO0FBQzlDLGtEQUFpRDtBQUNqRCxxREFBb0Q7QUFDcEQsK0JBQTBCO0FBRXBCLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRzVDO0lBQWtDLHdCQUFZO0lBQTlDO1FBQUEscUVBb2JDO1FBbmJHLFlBQVk7UUFDWixTQUFHLEdBQVcsQ0FBQyxDQUFDO1FBQ2hCLFVBQVU7UUFDVixxQkFBZSxHQUFlO1lBQzFCLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUNULENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUNULENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQztZQUNYLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUNULENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUNULENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUNULENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNSLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNSLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNSLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztTQUNYLENBQUM7UUFHRixXQUFLLEdBQVksSUFBSSxDQUFDO1FBR3RCLFdBQUssR0FBWSxJQUFJLENBQUM7UUFHdEIsV0FBSyxHQUFZLElBQUksQ0FBQztRQUd0QixXQUFLLEdBQVksSUFBSSxDQUFDO1FBR3RCLFdBQUssR0FBWSxJQUFJLENBQUM7UUFHdEIsV0FBSyxHQUFZLElBQUksQ0FBQztRQUd0QixXQUFLLEdBQVksSUFBSSxDQUFDO1FBR3RCLFdB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QXBiaUMsRUFBRSxDQUFDLFNBQVMsR0FvYjdDO2tCQXBib0IsSUFBSSIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdhbWVNb2R1bGUgfSBmcm9tICcuLi9kYXRhTW9kdWxlL0dhbWVNb2R1bGUnO1xuaW1wb3J0IHsgU291bmRUeXBlLCBhdWRpb01nciB9IGZyb20gJy4uL21hbmFnZXIvQXVkaW9NZ3InO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSAnLi4vbWFuYWdlci9EZWZpbmUnO1xuaW1wb3J0IHsgdWltYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlci9VaW1hbmFnZXInO1xuaW1wb3J0IHsgZXZlbnRNYW5hZ2VyIH0gZnJvbSAnLi4vdXRpbC9FdmVudE1hbmFnZXInO1xuaW1wb3J0IENvaW4gZnJvbSAnLi9Db2luJztcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsb3QgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIC8vIOW9k+WJjeetueeggeanveS9jeeahOe0ouW8lVxuICAgIGlkeDogbnVtYmVyID0gMDtcbiAgICAvLyDnrbnnoIHnmoTlnZDmoIfkvY3nva5cbiAgICBjb2luT3JpZ2luYWxQb3M6IG51bWJlcltdW10gPSBbXG4gICAgICAgIFs1OCwgMTk3XSxcbiAgICAgICAgWzU4LCAxNzhdLFxuICAgICAgICBbNTgsIDE1OS4zXSxcbiAgICAgICAgWzU4LCAxNDBdLFxuICAgICAgICBbNTgsIDEyMV0sXG4gICAgICAgIFs1OCwgMTAyXSxcbiAgICAgICAgWzU4LCA4M10sXG4gICAgICAgIFs1OCwgNjRdLFxuICAgICAgICBbNTgsIDQ1XSxcbiAgICAgICAgWzU4LCAyNl0sXG4gICAgXTtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW4wOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW4xOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW4yOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW4zOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW40OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW41OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW42OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW43OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW44OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW45OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdTbG90U2VsZWN0OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdTbG90TWVyZ2U6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5zZWxlY3RBY3Rpb24sIHRoaXMpO1xuICAgICAgICBldmVudE1hbmFnZXIub24oRXZlbnRUeXBlLk1PVkVfQ09JTiwgdGhpcy5vbk1vdmUsIHRoaXMpO1xuICAgICAgICBldmVudE1hbmFnZXIub24oRXZlbnRUeXBlLk1PVkVfRU5ELCB0aGlzLm9uTW92ZUVuZCwgdGhpcyk7XG4gICAgICAgIGV2ZW50TWFuYWdlci5vbihFdmVudFR5cGUuQ0hFQ0tfTUVSR0UsIHRoaXMub25VcGRhdGVNZXJnZVN0YXR1cywgdGhpcyk7XG4gICAgICAgIGV2ZW50TWFuYWdlci5vbihFdmVudFR5cGUuTUVSR0VfQ09JTiwgdGhpcy5vbk1lcmdlLCB0aGlzKTtcbiAgICAgICAgZXZlbnRNYW5hZ2VyLm9uKEV2ZW50VHlwZS5NT1ZFX0NIRUNLX0ZBSUwsIHRoaXMuY2FuTm90TW92ZSwgdGhpcyk7XG4gICAgICAgIGV2ZW50TWFuYWdlci5vbihFdmVudFR5cGUuQ0FOQ0VMX1NFTEVDVCwgdGhpcy5vbkRlU2VsZWN0LCB0aGlzKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICB9XG5cbiAgICAvLyDmoLzlvI/ljJbmlbDmja5cbiAgICBmb3JtYXREYXRhKGlkeDogbnVtYmVyLCBkYXRhOiBudW1iZXJbXSk6IHZvaWQge1xuICAgICAgICB0aGlzLmlkeCA9IGlkeDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgICAgIC8vIGRhdGFcbiAgICAgICAgICAgIGlmIChkYXRhW2ldICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpc1tgY29pbiR7aX1gXS5nZXRDb21wb25lbnQoQ29pbikuaW5pdCh0aGlzLmlkeCwgZGF0YVtpXSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2Bjb2luJHtpfWBdLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXNbYGNvaW4ke2l9YF0uYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHBvc1xuICAgICAgICAgICAgdGhpc1tgY29pbiR7aX1gXS5zZXRQb3NpdGlvbihjYy52Mih0aGlzLmNvaW5PcmlnaW5hbFBvc1tpXVswXSwgdGhpcy5jb2luT3JpZ2luYWxQb3NbaV1bMV0pKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ub2RlLnNldFNpYmxpbmdJbmRleCh0aGlzLmlkeCk7XG4gICAgfVxuXG4gICAgLy8g6YCJ5oup6KGM5Li6XG4gICAgc2VsZWN0QWN0aW9uKCkge1xuICAgICAgICBpZiAoZ2FtZU1vZHVsZS5jdXJTZWxlY3RTbG90SWR4ID09PSAtMSkge1xuICAgICAgICAgICAgLy8g5Yid5qyh6YCJ5oup6KGM5Li6XG4gICAgICAgICAgICB0aGlzLm9uU2VsZWN0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZ2FtZU1vZHVsZS5jdXJTZWxlY3RTbG90SWR4ID09PSB0aGlzLmlkeCkge1xuICAgICAgICAgICAgLy8g5Y+W5raI6YCJ5oup6KGM5Li6XG4gICAgICAgICAgICB0aGlzLm9uRGVTZWxlY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOenu+WKqOihjOS4uiDlvZPliY3oioLngrnkuLrnm67moIfoioLngrlcbiAgICAgICAgICAgIHRoaXMub25DaGVja01vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOmAieS4reW9k+WJjeanveS9jVxuICAgIG9uU2VsZWN0KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzbG90RGF0YSA9IGdhbWVNb2R1bGUuc2xvdERhdGFbdGhpcy5pZHhdO1xuXG4gICAgICAgIC8vIOmAieS4reS6huepuueahOanveS9jVxuICAgICAgICBpZiAoc2xvdERhdGFbMF0gPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfpgInkuK3kuobnqbrnmoTmp73kvY0nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWQiOW5tuaViOaenOS4re+8jOS4jeWPr+mAieS4rVxuICAgICAgICBpZiAoZ2FtZU1vZHVsZS5tZXJnZUxvY2spIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmraPlnKjlkIjlubbkuK3vvIzml6Dms5XpgInkuK0nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVNb2R1bGUuY3VyU2VsZWN0U2xvdElkeCA9IHRoaXMuaWR4O1xuICAgICAgICB0aGlzLnVJbWdTbG90U2VsZWN0LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMubm9kZS5zZXRTaWJsaW5nSW5kZXgoOCk7XG5cbiAgICAgICAgLy8g5oyR6YCJ5b6F5pON5L2c562556CB55qE57Si5byVXG4gICAgICAgIGdhbWVNb2R1bGUuY3VyU2VsZWN0Q29pbklkeHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAoc2xvdERhdGFbaV0gPT09IDApIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBpZiAoZ2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBnYW1lTW9kdWxlLmN1clNlbGVjdENvaW5JZHhzLnB1c2goaSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNsb3REYXRhW2ldID09PSBzbG90RGF0YVtnYW1lTW9kdWxlLmN1clNlbGVjdENvaW5JZHhzW2dhbWVNb2R1bGUuY3VyU2VsZWN0Q29pbklkeHMubGVuZ3RoIC0gMV1dKSB7XG4gICAgICAgICAgICAgICAgZ2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4cy5wdXNoKGkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKGDpgInkuK3kuobnrKwke3RoaXMuaWR4feS4quanveeahGAsIGdhbWVNb2R1bGUuY3VyU2VsZWN0Q29pbklkeHMpO1xuXG4gICAgICAgIC8vIOWvueW+heaTjeS9nOetueeggeeahOaYvuekuuaViOaenOi/m+ihjOWxleekulxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdhbWVNb2R1bGUuY3VyU2VsZWN0Q29pbklkeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHRhclBvc1kgPSB0aGlzLmNvaW5PcmlnaW5hbFBvc1tnYW1lTW9kdWxlLmN1clNlbGVjdENvaW5JZHhzW2ldXVsxXSArIDI1O1xuICAgICAgICAgICAgY2MudHdlZW4odGhpc1tgY29pbiR7Z2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4c1tpXX1gXSlcbiAgICAgICAgICAgICAgICAudG8oMC41LCB7IHk6IHRhclBvc1kgfSwgeyBlYXNpbmc6ICdiYWNrT3V0JyB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlj5bmtojpgInkuK1cbiAgICBvbkRlU2VsZWN0KCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygn5Y+W5raI6YCJ5oupJyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICAgICAgLy8gZGF0YVxuICAgICAgICAgICAgY29uc3QgdGFyUG9zWSA9IHRoaXMuY29pbk9yaWdpbmFsUG9zW2ldWzFdO1xuICAgICAgICAgICAgY2MudHdlZW4odGhpc1tgY29pbiR7aX1gXSlcbiAgICAgICAgICAgICAgICAudG8oMC41LCB7IHk6IHRhclBvc1kgfSwgeyBlYXNpbmc6ICdiYWNrT3V0JyB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVJbWdTbG90U2VsZWN0LmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIOmHjee9rumAieS4reeKtuaAgVxuICAgICAgICBnYW1lTW9kdWxlLmN1clNlbGVjdFNsb3RJZHggPSAtMTtcbiAgICB9XG5cbiAgICAvLyDnp7vliqhcbiAgICBvbkNoZWNrTW92ZSgpOiB2b2lkIHtcbiAgICAgICAgLy8g5aaC5p6c5b2T5YmN5qe95L2N5bey5ruh5YiZ5LiN5YWB6K6456e75YqoXG4gICAgICAgIGlmIChnYW1lTW9kdWxlLnNsb3REYXRhW3RoaXMuaWR4XS5pbmRleE9mKDApID09PSAtMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+etueeggeaVsOmHj+W3sua7oe+8jOS4jeWPr+enu+WKqCcpO1xuICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5NT1ZFX0NIRUNLX0ZBSUwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aaC5p6c5b2T5YmN5qe95L2N5pyA6L+R55qE562556CB5LiO5b2T5YmN6YCJ5Lit55qE5b6F56e75Yqo562556CB57G75Z6L5LiN5LiA6Ie0IOS4jeWFgeiuuOenu+WKqFxuICAgICAgICBjb25zdCBjdXJTbG90SW5mbyA9IGdhbWVNb2R1bGUuZ2V0Rmlyc3RWYWlsZE51bUJ5U2xvdElkeCh0aGlzLmlkeCk7XG4gICAgICAgIGNvbnN0IGN1clNlbGVjdENvaW5JbmZvID0gZ2FtZU1vZHVsZS5nZXRDdXJTZWxlY3RTbG90SW5mbygpO1xuICAgICAgICBpZiAoY3VyU2xvdEluZm8udmFpbGROdW0gIT09IC0xICYmIGN1clNsb3RJbmZvLnZhaWxkTnVtICE9PSBjdXJTZWxlY3RDb2luSW5mby5udW0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfnrbnnoIHnsbvlnovkuI3kuIDoh7QsIOS4jeWPr+enu+WKqCcpO1xuICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5NT1ZFX0NIRUNLX0ZBSUwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdhbWVNb2R1bGUubW92ZUxvY2spIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmraPlnKjnp7vliqjkuK3vvIzml6Dms5XkuqfnlJ/mm7TlpJrnp7vliqgnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOehruWumuWPr+S7peenu+WKqOeahOetueeggeaVsOmHj1xuICAgICAgICBjb25zdCBtb3ZlQ250ID0gTWF0aC5taW4oY3VyU2xvdEluZm8udmFpbGRTcGFjZSwgY3VyU2VsZWN0Q29pbkluZm8uY250KTtcblxuICAgICAgICAvLyDnoa7lrprnp7vliqjliLDnmoTnm67moIfkvY3nva5cbiAgICAgICAgY29uc3QgdGFyUG9zOiBjYy5WZWMyW10gPSBbXTtcblxuICAgICAgICAvLyDnm67moIfmp73kvY3lj5HnlJ/mlbDmja7lj5jliqjnmoTkvY3nva7ntKLlvJXpm4ZcbiAgICAgICAgY29uc3QgdGFySWR4QXJyOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICAvLyDljp/mp73kvY3lj5HnlJ/mlbDmja7lj5jliqjnmoTmp73kvY3ntKLlvJXpm4ZcbiAgICAgICAgY29uc3Qgc3JjSWR4QXJyOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgICAgIGxldCBzdGFydFBvc0lkeDogbnVtYmVyID0gY3VyU2xvdEluZm8udmFpbGRJZHggKyAxO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1vdmVDbnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgb3JpUG9zWCA9IHRoaXMuY29pbk9yaWdpbmFsUG9zW3N0YXJ0UG9zSWR4XVswXTtcbiAgICAgICAgICAgIGNvbnN0IG9yaVBvc1kgPSB0aGlzLmNvaW5PcmlnaW5hbFBvc1tzdGFydFBvc0lkeF1bMV07XG4gICAgICAgICAgICBjb25zdCBnbG9iYWxQb3MgPSB0aGlzLm5vZGUuY29udmVydFRvV29ybGRTcGFjZUFSKGNjLnYyKG9yaVBvc1gsIG9yaVBvc1kpKTtcbiAgICAgICAgICAgIHRhclBvcy5wdXNoKGdsb2JhbFBvcyk7XG4gICAgICAgICAgICB0YXJJZHhBcnIucHVzaChzdGFydFBvc0lkeCk7XG4gICAgICAgICAgICBzcmNJZHhBcnIucHVzaChnYW1lTW9kdWxlLmN1clNlbGVjdENvaW5JZHhzW2ldKTtcbiAgICAgICAgICAgIHN0YXJ0UG9zSWR4Kys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpgJrnn6XlvoXnp7vliqjnmoTmp73kvY3ov5vooYznrbnnoIHnp7vliqhcbiAgICAgICAgY29uc3QgZXZlbnREYXRhID0ge1xuICAgICAgICAgICAgLy8g5a6e6ZmF56e75Yqo5pWw6YePXG4gICAgICAgICAgICBtb3ZlQ250LFxuICAgICAgICAgICAgLy8g55uu5qCH56e75Yqo55qE6IqC54K55a+55bqU5L2N572uKOS9ji0+6auYKVxuICAgICAgICAgICAgdGFyUG9zLFxuICAgICAgICAgICAgLy8g55uu5qCH5qe95L2N5a6e6ZmF5Y+R55Sf5pWw5o2u5Y+Y5Yqo55qE562556CB57Si5byV6ZuGKOS9ji0+5L2OKVxuICAgICAgICAgICAgdGFySWR4QXJyLFxuICAgICAgICAgICAgLy8g5Y6f5qe95L2N5a6e6ZmF5Y+R55Sf56e75Yqo55qE562556CB57Si5byV6ZuGKOmrmC0+5L2OKVxuICAgICAgICAgICAgc3JjSWR4QXJyLFxuICAgICAgICAgICAgLy8g5a6e6ZmF5Y+R55Sf55qE562556CB57G75Z6LXG4gICAgICAgICAgICBudW1UeXBlOiBjdXJTZWxlY3RDb2luSW5mby5udW0sXG4gICAgICAgICAgICAvLyDnm67moIfmp73kvY3ntKLlvJVcbiAgICAgICAgICAgIHRhclNsb3RJZHg6IHRoaXMuaWR4LFxuICAgICAgICB9XG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuTU9WRV9DT0lOLCBldmVudERhdGEpO1xuICAgIH1cblxuICAgIC8vIOenu+WKqOajgOa1i+Wksei0pe+8jOaPkOekuuS4jeWPr+enu+WKqFxuICAgIGNhbk5vdE1vdmUoKTogdm9pZCB7XG4gICAgICAgIGlmIChnYW1lTW9kdWxlLmN1clNlbGVjdFNsb3RJZHggIT09IHRoaXMuaWR4KSByZXR1cm47XG4gICAgICAgIGlmIChnYW1lTW9kdWxlLmN1clNlbGVjdFNsb3RJZHggPT09IC0xKSByZXR1cm47XG4gICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuRVJST1IpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY29pbk5vZGUgPSB0aGlzW2Bjb2luJHtnYW1lTW9kdWxlLmN1clNlbGVjdENvaW5JZHhzW2ldfWBdO1xuICAgICAgICAgICAgY29uc3Qgb3JpUG9zWCA9IGNvaW5Ob2RlLng7XG4gICAgICAgICAgICBjYy50d2Vlbihjb2luTm9kZSlcbiAgICAgICAgICAgICAgICAudG8oMC4wNSwgeyB4OiBvcmlQb3NYIC0gMTAgfSlcbiAgICAgICAgICAgICAgICAudG8oMC4xLCB7IHg6IG9yaVBvc1ggKyAxMCB9KVxuICAgICAgICAgICAgICAgIC50bygwLjEsIHsgeDogb3JpUG9zWCAtIDEwIH0pXG4gICAgICAgICAgICAgICAgLnRvKDAuMDUsIHsgeDogb3JpUG9zWCB9KVxuICAgICAgICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGdhbWVNb2R1bGUuY3VyU2VsZWN0Q29pbklkeHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkRlU2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5byA5aeL6L+b6KGM56e75YqoXG4gICAgb25Nb3ZlKGUpIHtcbiAgICAgICAgY29uc3QgZXZlbnREYXRhID0gZS5kYXRhO1xuICAgICAgICBpZiAodGhpcy5pZHggIT09IGdhbWVNb2R1bGUuY3VyU2VsZWN0U2xvdElkeCkgcmV0dXJuO1xuICAgICAgICBjb25zb2xlLmxvZyhgb25Nb3ZlOiAke2dhbWVNb2R1bGUuY3VyU2VsZWN0U2xvdElkeH0gLT4gJHtldmVudERhdGEudGFyU2xvdElkeH1gKTtcblxuICAgICAgICBhdWRpb01nci5wbGF5U291bmQoU291bmRUeXBlLk1PVkVfQ09JTik7XG5cbiAgICAgICAgZ2FtZU1vZHVsZS5tb3ZlTG9jayA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgbW92ZUNudCA9IGV2ZW50RGF0YS5tb3ZlQ250O1xuICAgICAgICBjb25zdCB0YXJXb3JsZFBvczogY2MuVmVjMltdID0gZXZlbnREYXRhLnRhclBvcztcbiAgICAgICAgY29uc3QgdGFyTG9jYWxQb3M6IGNjLlZlYzJbXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gdGFyV29ybGRQb3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIHRhckxvY2FsUG9zLnB1c2godGhpcy5ub2RlLmNvbnZlcnRUb05vZGVTcGFjZUFSKHRhcldvcmxkUG9zW2ldKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnlLHpq5jliLDkvY7nmoTov5vooYznp7vliqhcbiAgICAgICAgbGV0IHN0YXJ0SWR4ID0gZ2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4c1swXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtb3ZlQ250OyBpKyspIHtcbiAgICAgICAgICAgIGNjLnR3ZWVuKHRoaXNbYGNvaW4ke3N0YXJ0SWR4fWBdKVxuICAgICAgICAgICAgICAgIC5kZWxheSgwLjAzICogaSlcbiAgICAgICAgICAgICAgICAudG8oMC4xLCB7IHBvc2l0aW9uOiB0YXJMb2NhbFBvc1tpXSB9KVxuICAgICAgICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IG1vdmVDbnQgLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lTW9kdWxlLnRpZHlTbG90RGF0YSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyU2xvdElkeDogZXZlbnREYXRhLnRhclNsb3RJZHgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtVHlwZTogZXZlbnREYXRhLm51bVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjSWR4QXJyOiBldmVudERhdGEuc3JjSWR4QXJyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcklkeEFycjogZXZlbnREYXRhLnRhcklkeEFycixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkRlU2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lTW9kdWxlLm1vdmVMb2NrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpXG5cbiAgICAgICAgICAgIHN0YXJ0SWR4LS07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk1vdmVFbmQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdvbk1vdmVFbmQnKTtcbiAgICAgICAgdGhpcy5mb3JtYXREYXRhKHRoaXMuaWR4LCBnYW1lTW9kdWxlLnNsb3REYXRhW3RoaXMuaWR4XSk7XG4gICAgfVxuXG4gICAgLy8g5Yi35paw5ZCI5oiQ54q25oCBXG4gICAgb25VcGRhdGVNZXJnZVN0YXR1cygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2FuTWVyZ2UgPSBnYW1lTW9kdWxlLmNoZWNrQ2FuTWVyZ2VCeVNsb3QodGhpcy5pZHgpO1xuICAgICAgICB0aGlzLnVJbWdTbG90TWVyZ2UuYWN0aXZlID0gY2FuTWVyZ2U7XG4gICAgICAgIHRoaXMuc2hvd01lcmdlSGludEFjdGlvbihjYW5NZXJnZSk7XG4gICAgfVxuXG4gICAgLy8g5o+Q56S65ZCI5oiQXG4gICAgc2hvd01lcmdlSGludEFjdGlvbihjYW5NZXJnZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoY2FuTWVyZ2UpIHtcbiAgICAgICAgICAgIHRoaXMudUltZ1Nsb3RNZXJnZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgICAgIGNjLnR3ZWVuKHRoaXMudUltZ1Nsb3RNZXJnZSlcbiAgICAgICAgICAgICAgICAudG8oMSwgeyBvcGFjaXR5OiAyNTUgfSlcbiAgICAgICAgICAgICAgICAudG8oMSwgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoKCkgPT4geyB0aGlzLnNob3dNZXJnZUhpbnRBY3Rpb24oY2FuTWVyZ2UpIH0pXG4gICAgICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYy50d2Vlbih0aGlzLnVJbWdTbG90TWVyZ2UpLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMudUltZ1Nsb3RNZXJnZS5hY3RpdmUgPSBjYW5NZXJnZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWQiOaIkFxuICAgIG9uTWVyZ2UoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNhbk1lcmdlID0gZ2FtZU1vZHVsZS5jaGVja0Nhbk1lcmdlQnlTbG90KHRoaXMuaWR4KTtcbiAgICAgICAgaWYgKCFjYW5NZXJnZSkgcmV0dXJuO1xuXG4gICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuTUVSR0VfQ09JTik7XG5cbiAgICAgICAgZ2FtZU1vZHVsZS5tZXJnZUxvY2sgKz0gMTtcblxuICAgICAgICAvLyDlkIjmiJDmlYjmnpxcbiAgICAgICAgZm9yIChsZXQgaSA9IDk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjYy50d2Vlbih0aGlzW2Bjb2luJHtpfWBdKVxuICAgICAgICAgICAgICAgIC5kZWxheSgwLjA1ICogKDkgLSBpKSlcbiAgICAgICAgICAgICAgICAudG8oMC4xLCB7IHNjYWxlOiAwIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2Bjb2luJHtpfWBdLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2Bjb2luJHtpfWBdLnNjYWxlID0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25NZXJnZUZpbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWQiOaIkOe7k+adn1xuICAgIG9uTWVyZ2VGaW5pc2goKTogdm9pZCB7XG4gICAgICAgIC8vIOWQiOaIkOebruagh+WAvFxuICAgICAgICBjb25zdCBtZXJnZVRhcmdldFZhbHVlID0gZ2FtZU1vZHVsZS5zbG90RGF0YVt0aGlzLmlkeF1bMF0gKyAxO1xuXG4gICAgICAgIC8vIOWQiOaIkOWQjueahOaVsOaNrlxuICAgICAgICBnYW1lTW9kdWxlLnNsb3REYXRhW3RoaXMuaWR4XSA9IFttZXJnZVRhcmdldFZhbHVlLCBtZXJnZVRhcmdldFZhbHVlLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXTtcblxuICAgICAgICBjb25zb2xlLmxvZyhg5qe9JHt0aGlzLmlkeH0g5ZCI5oiQJHttZXJnZVRhcmdldFZhbHVlfWApO1xuXG4gICAgICAgIHRoaXMuY29pbjAuc2NhbGUgPSAwO1xuICAgICAgICB0aGlzLmNvaW4xLnNjYWxlID0gMDtcbiAgICAgICAgdGhpcy5jb2luMC5nZXRDb21wb25lbnQoQ29pbikuaW5pdCh0aGlzLmlkeCwgbWVyZ2VUYXJnZXRWYWx1ZSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb2luMC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb2luMS5nZXRDb21wb25lbnQoQ29pbikuaW5pdCh0aGlzLmlkeCwgbWVyZ2VUYXJnZXRWYWx1ZSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb2luMS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBjYy50d2Vlbih0aGlzLmNvaW4wKVxuICAgICAgICAgICAgLnRvKDAuNSwgeyBzY2FsZTogMSB9LCB7IGVhc2luZzogJ2JhY2tPdXQnIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICAgICAgY2MudHdlZW4odGhpcy5jb2luMSlcbiAgICAgICAgICAgIC50bygwLjUsIHsgc2NhbGU6IDEgfSwgeyBlYXNpbmc6ICdiYWNrT3V0JyB9KVxuICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGdhbWVNb2R1bGUubWVyZ2VMb2NrIC09IDE7XG4gICAgICAgICAgICAgICAgaWYgKGdhbWVNb2R1bGUubWVyZ2VMb2NrIDwgMCkgZ2FtZU1vZHVsZS5tZXJnZUxvY2sgPSAwO1xuICAgICAgICAgICAgICAgIGlmIChnYW1lTW9kdWxlLm1lcmdlTG9jayA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLk1FUkdFX0VORCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGFydCgpO1xuXG4gICAgICAgIHRoaXMudUltZ1Nsb3RNZXJnZS5hY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLkNIRUNLX01FUkdFKTtcbiAgICB9XG5cbiAgICAvLyDnlJ/miJDnrbnnoIFcbiAgICBhc3luYyBwcm9kdWNlKG5ld0NvaW46IG51bWJlcltdLCBzdGFydEdsb2JhbFBvczogY2MuVmVjMiwgc3RhcnRQb3NJZHg6IG51bWJlcikge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmlkeCwgbmV3Q29pbik7XG4gICAgICAgIC8vIOS4jemcgOimgeeUn+aIkOWwseS4jeaTjeS9nOS6hlxuICAgICAgICBpZiAobmV3Q29pbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke3RoaXMuaWR4feanveaXoOaWsOetueeggWApO1xuICAgICAgICAgICAgYXVkaW9NZ3IucGxheVNvdW5kKFNvdW5kVHlwZS5FUlJPUik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgJHt0aGlzLmlkeH0g55Sf5oiQ5LqGYCwgbmV3Q29pbik7XG5cbiAgICAgICAgLy8g5rS+5Y+R562556CB5pWI5p6c55qE6LW35aeL5L2N572uXG4gICAgICAgIGNvbnN0IGxvY2FsUG9zU3JjID0gdGhpcy5ub2RlLmNvbnZlcnRUb05vZGVTcGFjZUFSKHN0YXJ0R2xvYmFsUG9zKTtcbiAgICAgICAgLy8g5bey57uP5aSE55CG55qE562556CBXG4gICAgICAgIGxldCBkZWFsQ250ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdDb2luLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyDnlJ/miJDkuIDkuKrooajnjrDnlKjnmoTmlrDnrbnnoIFcbiAgICAgICAgICAgIGNvbnN0IG5ld0NvaW5Ob2RlID0gYXdhaXQgdGhpcy5wcm9kdWNlQ29pbigpO1xuICAgICAgICAgICAgY29uc3QgY29pbiA9IG5ld0NvaW5Ob2RlLmdldENvbXBvbmVudChDb2luKTtcbiAgICAgICAgICAgIHRoaXMubm9kZS5hZGRDaGlsZChuZXdDb2luTm9kZSk7XG4gICAgICAgICAgICBjb2luLm5vZGUuc2V0UG9zaXRpb24obG9jYWxQb3NTcmMpO1xuICAgICAgICAgICAgY29pbi5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgY29pbi5pbml0KHRoaXMuaWR4LCBuZXdDb2luW2ldLCAoKSA9PiB7IGNvaW4ubm9kZS5hY3RpdmUgPSB0cnVlOyB9KTtcblxuICAgICAgICAgICAgLy8g56Gu5a6a6KaB6aOe55qE55uu55qE5Zyw5Z2Q5qCHXG4gICAgICAgICAgICBjb25zdCB0YXJQb3NJZHggPSBzdGFydFBvc0lkeCArIGRlYWxDbnQ7XG4gICAgICAgICAgICBjb25zdCBwb3NUYXIgPSB0aGlzLmNvaW5PcmlnaW5hbFBvc1tzdGFydFBvc0lkeCArIGRlYWxDbnRdO1xuICAgICAgICAgICAgY29uc3QgdGFyUG9zID0gY2MudjIocG9zVGFyWzBdLCBwb3NUYXJbMV0pO1xuICAgICAgICAgICAgZ2FtZU1vZHVsZS5wcm9kdWNlTG9jayArPSAxO1xuICAgICAgICAgICAgY2MudHdlZW4oY29pbi5ub2RlKVxuICAgICAgICAgICAgICAgIC5kZWxheSgwLjEgKiBkZWFsQ250KVxuICAgICAgICAgICAgICAgIC50bygwLjUsIHsgcG9zaXRpb246IHRhclBvcyB9LCB7IGVhc2luZzogJ2N1YmljSW5PdXQnIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2Bjb2luJHt0YXJQb3NJZHh9YF0uZ2V0Q29tcG9uZW50KENvaW4pLmluaXQodGhpcy5pZHgsIG5ld0NvaW5baV0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbYGNvaW4ke3RhclBvc0lkeH1gXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29pbi5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29pbi5ub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVNb2R1bGUucHJvZHVjZUxvY2sgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdhbWVNb2R1bGUucHJvZHVjZUxvY2sgPCAwKSBnYW1lTW9kdWxlLnByb2R1Y2VMb2NrID0gMDtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuXG4gICAgICAgICAgICBkZWFsQ250Kys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBwcm9kdWNlQ29pbigpOiBQcm9taXNlPGNjLk5vZGU+IHtcbiAgICAgICAgY29uc3QgY29pblByZWZhYiA9IGF3YWl0IHVpbWFuYWdlci5sb2FkUHJlZmFiKCdwcmVmYWIvbWVyZ2UvY29pbicpO1xuICAgICAgICBjb25zdCBjb2luID0gY2MuaW5zdGFudGlhdGUoY29pblByZWZhYik7XG4gICAgICAgIHJldHVybiBjb2luO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSAoZHQpIHt9XG59XG4iXX0=
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/MergeScene.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '0af54diud5JN6SYpIPIvcRc', 'MergeScene');
// script/merge/game/MergeScene.ts

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
var PlayerModule_1 = require("../dataModule/PlayerModule");
var TypeDefine_1 = require("../define/TypeDefine");
var AudioMgr_1 = require("../manager/AudioMgr");
var Uimanager_1 = require("../manager/Uimanager");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var MergeScene = /** @class */ (function (_super) {
    __extends(MergeScene, _super);
    function MergeScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MergeScene.prototype.onLoad = function () {
        console.log('load mergeScene');
    };
    MergeScene.prototype.start = function () {
        var _this = this;
        // 初始化界面层级
        Uimanager_1.uimanager.init(this.node);
        // login
        PlayerModule_1.playerModule.login(function () {
            // 初始化音频
            AudioMgr_1.audioMgr.init();
            // 添加游戏玩法界面
            _this.initGamePanel();
        });
        this.onShow();
        this.onHide();
    };
    MergeScene.prototype.update = function () {
        Uimanager_1.uimanager.udpateLayerShow();
    };
    MergeScene.prototype.initGamePanel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prefab, gameNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/merge/game')];
                    case 1:
                        prefab = _a.sent();
                        gameNode = cc.instantiate(prefab);
                        Uimanager_1.uimanager.add(gameNode, TypeDefine_1.LAYER.UI);
                        gameNode.setPosition(new cc.Vec2(0, 0));
                        return [2 /*return*/];
                }
            });
        });
    };
    MergeScene.prototype.onShow = function () {
        wx.onShow(function () {
            console.log('onShow');
        });
    };
    MergeScene.prototype.onHide = function () {
        wx.onHide(function () {
            console.log('onHide');
        });
    };
    MergeScene = __decorate([
        ccclass
    ], MergeScene);
    return MergeScene;
}(cc.Component));
exports.default = MergeScene;
/**
 *      1、合成数字15获得1个星星，顶部显示当前星星持有总数；
 *          当合成8之前，每次发放5个，类型为2个，数字区间固定在1~7之间；
 *          当合成8之后，每次发放6个，类型为3个，数字区间固定在min~7之间；
 *          当合成10之后，每次发放7个，类型为4个，数字区间固定在min~8之间；
 *          当合成12之后，每次发放10个，类型为5个，数字区间固定在min~10之间；
 *
 *          防作弊：
 *          当今日全服合成星星总数量 > 100 || 当人单日合成总星星 > 5， 合成12后，每次发放15个，类型为7个，数字区间min~10;(趋近于无法继续达成，控制放出总量);
 *
 *
 *      2、清理规则
 *          每局可以免费整理一次；
 *          每局可以通过分享功能一次整理；
 *          每局可以通过看视频完成一次整理；
 *          以上所有方式用过后，还可以通过刷新道具整理；
 *          刷新道具可以通过邀请获得，每邀请1个人，赠送一个刷新道具，刷新道具也可以通过星星兑换获得；
 *      7、商品清单滚动播放：4个刷新道具需要1个星星、1箱金典牛奶29个星星，1包心相印湿巾需要5个星星，1本DK百科全书30个星星...商品横向滚动展示清单最右侧保留“更多奖励”按钮；
 *      8、选择实物兑换后，兑换页面填写“收件人、收件地址、联系方式”，并在确认兑换前，弹出确认收货信息的确认单以及不退不换的声明；
 *      9、添加规则页面，规则页面添加免责声明，以及不退换声明；
 *      10、添加历史星星总获得数排行榜；
 */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9NZXJnZVNjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLDJEQUEwRDtBQUMxRCxtREFBNkM7QUFDN0MsZ0RBQStDO0FBQy9DLGtEQUFpRDtBQUUzQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUF3Qyw4QkFBWTtJQUFwRDs7SUE2Q0EsQ0FBQztJQTNDRywyQkFBTSxHQUFOO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCwwQkFBSyxHQUFMO1FBQUEsaUJBZUM7UUFkRyxVQUFVO1FBQ1YscUJBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTFCLFFBQVE7UUFDUiwyQkFBWSxDQUFDLEtBQUssQ0FBQztZQUNmLFFBQVE7WUFDUixtQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRWhCLFdBQVc7WUFDWCxLQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELDJCQUFNLEdBQU47UUFDSSxxQkFBUyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFSyxrQ0FBYSxHQUFuQjs7Ozs7NEJBQ21CLHFCQUFNLHFCQUFTLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEVBQUE7O3dCQUF4RCxNQUFNLEdBQUcsU0FBK0M7d0JBQ3hELFFBQVEsR0FBWSxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNqRCxxQkFBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDbEMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQzNDO0lBRUQsMkJBQU0sR0FBTjtRQUNJLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVELDJCQUFNLEdBQU47UUFDSSxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUE1Q2dCLFVBQVU7UUFEOUIsT0FBTztPQUNhLFVBQVUsQ0E2QzlCO0lBQUQsaUJBQUM7Q0E3Q0QsQUE2Q0MsQ0E3Q3VDLEVBQUUsQ0FBQyxTQUFTLEdBNkNuRDtrQkE3Q29CLFVBQVU7QUErQy9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkciLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnYW1lTW9kdWxlIH0gZnJvbSAnLi4vZGF0YU1vZHVsZS9HYW1lTW9kdWxlJztcbmltcG9ydCB7IHBsYXllck1vZHVsZSB9IGZyb20gJy4uL2RhdGFNb2R1bGUvUGxheWVyTW9kdWxlJztcbmltcG9ydCB7IExBWUVSIH0gZnJvbSAnLi4vZGVmaW5lL1R5cGVEZWZpbmUnO1xuaW1wb3J0IHsgYXVkaW9NZ3IgfSBmcm9tICcuLi9tYW5hZ2VyL0F1ZGlvTWdyJztcbmltcG9ydCB7IHVpbWFuYWdlciB9IGZyb20gJy4uL21hbmFnZXIvVWltYW5hZ2VyJztcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lcmdlU2NlbmUgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnbG9hZCBtZXJnZVNjZW5lJyk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIC8vIOWIneWni+WMlueVjOmdouWxgue6p1xuICAgICAgICB1aW1hbmFnZXIuaW5pdCh0aGlzLm5vZGUpO1xuXG4gICAgICAgIC8vIGxvZ2luXG4gICAgICAgIHBsYXllck1vZHVsZS5sb2dpbigoKSA9PiB7XG4gICAgICAgICAgICAvLyDliJ3lp4vljJbpn7PpopFcbiAgICAgICAgICAgIGF1ZGlvTWdyLmluaXQoKTtcblxuICAgICAgICAgICAgLy8g5re75Yqg5ri45oiP546p5rOV55WM6Z2iXG4gICAgICAgICAgICB0aGlzLmluaXRHYW1lUGFuZWwoKTtcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLm9uU2hvdygpO1xuICAgICAgICB0aGlzLm9uSGlkZSgpO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgdWltYW5hZ2VyLnVkcGF0ZUxheWVyU2hvdygpO1xuICAgIH1cblxuICAgIGFzeW5jIGluaXRHYW1lUGFuZWwoKSB7XG4gICAgICAgIGNvbnN0IHByZWZhYiA9IGF3YWl0IHVpbWFuYWdlci5sb2FkUHJlZmFiKCdwcmVmYWIvbWVyZ2UvZ2FtZScpO1xuICAgICAgICBjb25zdCBnYW1lTm9kZTogY2MuTm9kZSA9IGNjLmluc3RhbnRpYXRlKHByZWZhYik7XG4gICAgICAgIHVpbWFuYWdlci5hZGQoZ2FtZU5vZGUsIExBWUVSLlVJKTtcbiAgICAgICAgZ2FtZU5vZGUuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoMCwgMCkpO1xuICAgIH1cblxuICAgIG9uU2hvdygpOiB2b2lkIHtcbiAgICAgICAgd3gub25TaG93KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvblNob3cnKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBvbkhpZGUoKTogdm9pZCB7XG4gICAgICAgIHd4Lm9uSGlkZSgoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnb25IaWRlJyk7XG4gICAgICAgIH0pXG4gICAgfVxufVxuXG4vKipcbiAqICAgICAgMeOAgeWQiOaIkOaVsOWtlzE16I635b6XMeS4quaYn+aYn++8jOmhtumDqOaYvuekuuW9k+WJjeaYn+aYn+aMgeacieaAu+aVsO+8m1xuICogICAgICAgICAg5b2T5ZCI5oiQOOS5i+WJje+8jOavj+asoeWPkeaUvjXkuKrvvIznsbvlnovkuLoy5Liq77yM5pWw5a2X5Yy66Ze05Zu65a6a5ZyoMX435LmL6Ze077ybXG4gKiAgICAgICAgICDlvZPlkIjmiJA45LmL5ZCO77yM5q+P5qyh5Y+R5pS+NuS4qu+8jOexu+Wei+S4ujPkuKrvvIzmlbDlrZfljLrpl7Tlm7rlrprlnKhtaW5+N+S5i+mXtO+8m1xuICogICAgICAgICAg5b2T5ZCI5oiQMTDkuYvlkI7vvIzmr4/mrKHlj5HmlL435Liq77yM57G75Z6L5Li6NOS4qu+8jOaVsOWtl+WMuumXtOWbuuWumuWcqG1pbn445LmL6Ze077ybXG4gKiAgICAgICAgICDlvZPlkIjmiJAxMuS5i+WQju+8jOavj+asoeWPkeaUvjEw5Liq77yM57G75Z6L5Li6NeS4qu+8jOaVsOWtl+WMuumXtOWbuuWumuWcqG1pbn4xMOS5i+mXtO+8m1xuICpcbiAqICAgICAgICAgIOmYsuS9nOW8iu+8mlxuICogICAgICAgICAg5b2T5LuK5pel5YWo5pyN5ZCI5oiQ5pif5pif5oC75pWw6YePID4gMTAwIHx8IOW9k+S6uuWNleaXpeWQiOaIkOaAu+aYn+aYnyA+IDXvvIwg5ZCI5oiQMTLlkI7vvIzmr4/mrKHlj5HmlL4xNeS4qu+8jOexu+Wei+S4ujfkuKrvvIzmlbDlrZfljLrpl7RtaW5+MTA7KOi2i+i/keS6juaXoOazlee7p+e7rei+vuaIkO+8jOaOp+WItuaUvuWHuuaAu+mHjyk7XG4gKlxuICpcbiAqICAgICAgMuOAgea4heeQhuinhOWImVxuICogICAgICAgICAg5q+P5bGA5Y+v5Lul5YWN6LS55pW055CG5LiA5qyh77ybXG4gKiAgICAgICAgICDmr4/lsYDlj6/ku6XpgJrov4fliIbkuqvlip/og73kuIDmrKHmlbTnkIbvvJtcbiAqICAgICAgICAgIOavj+WxgOWPr+S7pemAmui/h+eci+inhumikeWujOaIkOS4gOasoeaVtOeQhu+8m1xuICogICAgICAgICAg5Lul5LiK5omA5pyJ5pa55byP55So6L+H5ZCO77yM6L+Y5Y+v5Lul6YCa6L+H5Yi35paw6YGT5YW35pW055CG77ybXG4gKiAgICAgICAgICDliLfmlrDpgZPlhbflj6/ku6XpgJrov4fpgoDor7fojrflvpfvvIzmr4/pgoDor7cx5Liq5Lq677yM6LWg6YCB5LiA5Liq5Yi35paw6YGT5YW377yM5Yi35paw6YGT5YW35Lmf5Y+v5Lul6YCa6L+H5pif5pif5YWR5o2i6I635b6X77ybXG4gKiAgICAgIDfjgIHllYblk4HmuIXljZXmu5rliqjmkq3mlL7vvJo05Liq5Yi35paw6YGT5YW36ZyA6KaBMeS4quaYn+aYn+OAgTHnrrHph5HlhbjniZvlpbYyOeS4quaYn+aYn++8jDHljIXlv4Pnm7jljbDmub/lt77pnIDopoE15Liq5pif5pif77yMMeacrERL55m+56eR5YWo5LmmMzDkuKrmmJ/mmJ8uLi7llYblk4HmqKrlkJHmu5rliqjlsZXnpLrmuIXljZXmnIDlj7Pkvqfkv53nlZnigJzmm7TlpJrlpZblirHigJ3mjInpkq7vvJtcbiAqICAgICAgOOOAgemAieaLqeWunueJqeWFkeaNouWQju+8jOWFkeaNoumhtemdouWhq+WGmeKAnOaUtuS7tuS6uuOAgeaUtuS7tuWcsOWdgOOAgeiBlOezu+aWueW8j+KAne+8jOW5tuWcqOehruiupOWFkeaNouWJje+8jOW8ueWHuuehruiupOaUtui0p+S/oeaBr+eahOehruiupOWNleS7peWPiuS4jemAgOS4jeaNoueahOWjsOaYju+8m1xuICogICAgICA544CB5re75Yqg6KeE5YiZ6aG16Z2i77yM6KeE5YiZ6aG16Z2i5re75Yqg5YWN6LSj5aOw5piO77yM5Lul5Y+K5LiN6YCA5o2i5aOw5piO77ybXG4gKiAgICAgIDEw44CB5re75Yqg5Y6G5Y+y5pif5pif5oC76I635b6X5pWw5o6S6KGM5qac77ybXG4gKi9cbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/manager/Define.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b316ef97uJJrLtjj1+6n+lc', 'Define');
// script/merge/manager/Define.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["MOVE_COIN"] = "move_coin";
    EventType["MOVE_END"] = "move_end";
    EventType["CHECK_MERGE"] = "check_merge";
    EventType["MERGE_COIN"] = "merge_coin";
    EventType["MERGE_END"] = "merge_end";
    EventType["MOVE_CHECK_FAIL"] = "move_check_fail";
    EventType["CANCEL_SELECT"] = "CANCEL_SELECT";
})(EventType = exports.EventType || (exports.EventType = {}));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9EZWZpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBWSxTQVFYO0FBUkQsV0FBWSxTQUFTO0lBQ2pCLG9DQUF1QixDQUFBO0lBQ3ZCLGtDQUFxQixDQUFBO0lBQ3JCLHdDQUEyQixDQUFBO0lBQzNCLHNDQUF5QixDQUFBO0lBQ3pCLG9DQUF1QixDQUFBO0lBQ3ZCLGdEQUFtQyxDQUFBO0lBQ25DLDRDQUErQixDQUFBO0FBQ25DLENBQUMsRUFSVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQVFwQiIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIEV2ZW50VHlwZSB7XG4gICAgTU9WRV9DT0lOID0gJ21vdmVfY29pbicsXG4gICAgTU9WRV9FTkQgPSAnbW92ZV9lbmQnLFxuICAgIENIRUNLX01FUkdFID0gJ2NoZWNrX21lcmdlJyxcbiAgICBNRVJHRV9DT0lOID0gJ21lcmdlX2NvaW4nLFxuICAgIE1FUkdFX0VORCA9ICdtZXJnZV9lbmQnLFxuICAgIE1PVkVfQ0hFQ0tfRkFJTCA9ICdtb3ZlX2NoZWNrX2ZhaWwnLFxuICAgIENBTkNFTF9TRUxFQ1QgPSAnQ0FOQ0VMX1NFTEVDVCcsXG59XG5cbi8vIOWVhuWTgeS/oeaBr1xuZXhwb3J0IHR5cGUgR29vZHNUeXBlID0ge1xuICAgIGlkOiBudW1iZXIsXG4gICAgc3RhcjogbnVtYmVyLFxuICAgIHRvdGFsOiBudW1iZXIsXG4gICAgdXNlZDogbnVtYmVyLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBkZXNjOiBzdHJpbmcsXG4gICAgdXJsOiBzdHJpbmcsXG59Il19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/manager/Uimanager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'f6b0eaEb8lOraTr9sfkeyyf', 'Uimanager');
// script/merge/manager/Uimanager.ts

"use strict";
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
exports.uimanager = void 0;
var TypeDefine_1 = require("../define/TypeDefine");
var Uimanager = /** @class */ (function () {
    function Uimanager() {
        // 层级依托的场景
        this.scene = null;
        // 层级
        this.layerArr = [];
    }
    Object.defineProperty(Uimanager, "instance", {
        get: function () {
            if (!this._ins) {
                this._ins = new Uimanager();
            }
            return this._ins;
        },
        enumerable: false,
        configurable: true
    });
    Uimanager.prototype.init = function (node) {
        this.scene = node;
        this.initLayer();
    };
    Uimanager.prototype.initLayer = function () {
        this.layerArr = [];
        // UI层
        var node_ui = new cc.Node(TypeDefine_1.LAYER.UI);
        node_ui.width = this.scene.width;
        node_ui.height = this.scene.height;
        this.scene.addChild(node_ui);
        this.layerArr.push(node_ui);
        // 弹窗层
        var node_dialog = new cc.Node(TypeDefine_1.LAYER.DIALOG);
        node_dialog.width = this.scene.width;
        node_dialog.height = this.scene.height;
        this.scene.addChild(node_dialog);
        this.layerArr.push(node_dialog);
        // 提示层
        var node_tip = new cc.Node(TypeDefine_1.LAYER.TIP);
        node_tip.width = this.scene.width;
        node_tip.height = this.scene.height;
        this.scene.addChild(node_tip);
        this.layerArr.push(node_tip);
        // 引导层
        var node_guide = new cc.Node(TypeDefine_1.LAYER.GUIDE);
        node_guide.width = this.scene.width;
        node_guide.height = this.scene.height;
        this.scene.addChild(node_guide);
        this.layerArr.push(node_guide);
    };
    Uimanager.prototype.getLayer = function (name) {
        var node = this.scene.getChildByName(name);
        return node;
    };
    Uimanager.prototype.add = function (node, layerType) {
        var layerNode = this.getLayer(layerType);
        if (!layerNode) {
            console.warn('UIManager: 没有这个层级', layerType);
            return;
        }
        layerNode.addChild(node);
    };
    // 动态显示需要的层级
    Uimanager.prototype.udpateLayerShow = function () {
        for (var i = 0; i < this.layerArr.length; i++) {
            this.layerArr[i].active = this.layerArr[i].childrenCount > 0;
        }
    };
    /**
     * 预制件加载
     * @param path
     */
    Uimanager.prototype.loadPrefab = function (path) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var load;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    load = function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            return [2 /*return*/, new Promise(function (rsv, rjt) {
                                                    var tot = setTimeout(function () {
                                                        console.debug("[loadPefab timeout] " + path + "\u52A0\u8F7D\u8D85\u65F6");
                                                        rjt("loadPefab \u8FDE\u63A5\u8D85\u65F6" + path);
                                                    }, 10000);
                                                    cc.resources.load(path, function (err, res) {
                                                        clearTimeout(tot);
                                                        if (err) {
                                                            rjt(err);
                                                        }
                                                        else {
                                                            rsv(res);
                                                        }
                                                    });
                                                })];
                                        });
                                    }); };
                                    return [4 /*yield*/, load().then(function (res) {
                                            resolve(res);
                                        })
                                            .catch(function (err) {
                                            reject(err);
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    return Uimanager;
}());
exports.default = Uimanager;
exports.uimanager = Uimanager.instance;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9VaW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQTZDO0FBRTdDO0lBZ0JJO1FBTkEsVUFBVTtRQUNWLFVBQUssR0FBWSxJQUFJLENBQUM7UUFFdEIsS0FBSztRQUNMLGFBQVEsR0FBYyxFQUFFLENBQUM7SUFFVCxDQUFDO0lBZGpCLHNCQUFrQixxQkFBUTthQUExQjtZQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQzthQUMvQjtZQUVELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixDQUFDOzs7T0FBQTtJQVVELHdCQUFJLEdBQUosVUFBSyxJQUFhO1FBQ2QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRCw2QkFBUyxHQUFUO1FBQ0ksSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbkIsTUFBTTtRQUNOLElBQU0sT0FBTyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDakMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU1QixNQUFNO1FBQ04sSUFBTSxXQUFXLEdBQUcsSUFBSSxFQUFF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QUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQUMsR0FBRyxFQUFFLEdBQUc7d0RBQzdCLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3REFFbEIsSUFBSSxHQUFHLEVBQUU7NERBQ0wsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lEQUNaOzZEQUFNOzREQUNILEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt5REFDWjtvREFDTCxDQUFDLENBQUMsQ0FBQztnREFDUCxDQUFDLENBQUMsRUFBQTs7eUNBQUEsQ0FBQTtvQ0FFRixxQkFBTSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUFHOzRDQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7d0NBQ2pCLENBQUMsQ0FBQzs2Q0FDRyxLQUFLLENBQUMsVUFBQyxHQUFHOzRDQUNQLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzt3Q0FDaEIsQ0FBQyxDQUFDLEVBQUE7O29DQUxOLFNBS00sQ0FBQzs7Ozt5QkFDVixDQUFDLEVBQUM7OztLQUNOO0lBQ0wsZ0JBQUM7QUFBRCxDQTVHQSxBQTRHQyxJQUFBOztBQUNZLFFBQUEsU0FBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMQVlFUiB9IGZyb20gJy4uL2RlZmluZS9UeXBlRGVmaW5lJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVWltYW5hZ2VyIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zOiBVaW1hbmFnZXI7XG4gICAgcHVibGljIHN0YXRpYyBnZXQgaW5zdGFuY2UoKSB7XG4gICAgICAgIGlmICghdGhpcy5faW5zKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnMgPSBuZXcgVWltYW5hZ2VyKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5faW5zO1xuICAgIH1cblxuICAgIC8vIOWxgue6p+S+neaJmOeahOWcuuaZr1xuICAgIHNjZW5lOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIC8vIOWxgue6p1xuICAgIGxheWVyQXJyOiBjYy5Ob2RlW10gPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKCkgeyB9XG5cbiAgICBpbml0KG5vZGU6IGNjLk5vZGUpIHtcbiAgICAgICAgdGhpcy5zY2VuZSA9IG5vZGU7XG4gICAgICAgIHRoaXMuaW5pdExheWVyKCk7XG4gICAgfVxuXG4gICAgaW5pdExheWVyKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmxheWVyQXJyID0gW107XG5cbiAgICAgICAgLy8gVUnlsYJcbiAgICAgICAgY29uc3Qgbm9kZV91aSA9IG5ldyBjYy5Ob2RlKExBWUVSLlVJKTtcbiAgICAgICAgbm9kZV91aS53aWR0aCA9IHRoaXMuc2NlbmUud2lkdGg7XG4gICAgICAgIG5vZGVfdWkuaGVpZ2h0ID0gdGhpcy5zY2VuZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQobm9kZV91aSk7XG4gICAgICAgIHRoaXMubGF5ZXJBcnIucHVzaChub2RlX3VpKTtcblxuICAgICAgICAvLyDlvLnnqpflsYJcbiAgICAgICAgY29uc3Qgbm9kZV9kaWFsb2cgPSBuZXcgY2MuTm9kZShMQVlFUi5ESUFMT0cpO1xuICAgICAgICBub2RlX2RpYWxvZy53aWR0aCA9IHRoaXMuc2NlbmUud2lkdGg7XG4gICAgICAgIG5vZGVfZGlhbG9nLmhlaWdodCA9IHRoaXMuc2NlbmUuaGVpZ2h0O1xuICAgICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKG5vZGVfZGlhbG9nKTtcbiAgICAgICAgdGhpcy5sYXllckFyci5wdXNoKG5vZGVfZGlhbG9nKTtcblxuICAgICAgICAvLyDmj5DnpLrlsYJcbiAgICAgICAgY29uc3Qgbm9kZV90aXAgPSBuZXcgY2MuTm9kZShMQVlFUi5USVApO1xuICAgICAgICBub2RlX3RpcC53aWR0aCA9IHRoaXMuc2NlbmUud2lkdGg7XG4gICAgICAgIG5vZGVfdGlwLmhlaWdodCA9IHRoaXMuc2NlbmUuaGVpZ2h0O1xuICAgICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKG5vZGVfdGlwKTtcbiAgICAgICAgdGhpcy5sYXllckFyci5wdXNoKG5vZGVfdGlwKTtcblxuICAgICAgICAvLyDlvJXlr7zlsYJcbiAgICAgICAgY29uc3Qgbm9kZV9ndWlkZSA9IG5ldyBjYy5Ob2RlKExBWUVSLkdVSURFKTtcbiAgICAgICAgbm9kZV9ndWlkZS53aWR0aCA9IHRoaXMuc2NlbmUud2lkdGg7XG4gICAgICAgIG5vZGVfZ3VpZGUuaGVpZ2h0ID0gdGhpcy5zY2VuZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQobm9kZV9ndWlkZSk7XG4gICAgICAgIHRoaXMubGF5ZXJBcnIucHVzaChub2RlX2d1aWRlKTtcbiAgICB9XG5cbiAgICBnZXRMYXllcihuYW1lOiBMQVlFUik6IGNjLk5vZGUge1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5zY2VuZS5nZXRDaGlsZEJ5TmFtZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgYWRkKG5vZGU6IGNjLk5vZGUsIGxheWVyVHlwZTogTEFZRVIpIHtcbiAgICAgICAgY29uc3QgbGF5ZXJOb2RlID0gdGhpcy5nZXRMYXllcihsYXllclR5cGUpO1xuXG4gICAgICAgIGlmICghbGF5ZXJOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1VJTWFuYWdlcjog5rKh5pyJ6L+Z5Liq5bGC57qnJywgbGF5ZXJUeXBlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxheWVyTm9kZS5hZGRDaGlsZChub2RlKTtcbiAgICB9XG5cbiAgICAvLyDliqjmgIHmmL7npLrpnIDopoHnmoTlsYLnuqdcbiAgICB1ZHBhdGVMYXllclNob3coKTogdm9pZCB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sYXllckFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5sYXllckFycltpXS5hY3RpdmUgPSB0aGlzLmxheWVyQXJyW2ldLmNoaWxkcmVuQ291bnQgPiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6aKE5Yi25Lu25Yqg6L29XG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBhc3luYyBsb2FkUHJlZmFiKHBhdGg6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkID0gYXN5bmMgKCkgPT4gbmV3IFByb21pc2UoKHJzdiwgcmp0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG90ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYFtsb2FkUGVmYWIgdGltZW91dF0gJHtwYXRofeWKoOi9vei2heaXtmApXG4gICAgICAgICAgICAgICAgICAgIHJqdChgbG9hZFBlZmFiIOi/nuaOpei2heaXtiR7cGF0aH1gKTtcbiAgICAgICAgICAgICAgICB9LCAxMDAwMCk7XG4gICAgICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQocGF0aCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0b3QpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJqdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnN2KHJlcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGF3YWl0IGxvYWQoKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgdWltYW5hZ2VyID0gVWltYW5hZ2VyLmluc3RhbmNlO1xuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/util/logger.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ceb40nCofFAQac+7tmvBl9q', 'logger');
// script/merge/util/logger.ts

"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.Init = function (isDebug) {
        this.DEBUG_LOG = isDebug;
    };
    Logger.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (Logger.DEBUG_LOG) {
            console.log.apply(console, args);
        }
    };
    Logger.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, args);
    };
    Logger.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (Logger.DEBUG_LOG) {
            console.warn.apply(console, args);
        }
    };
    Logger.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.error.apply(console, args);
    };
    Logger.assert = function (assertion, message) {
        var optionalParams = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            optionalParams[_i - 2] = arguments[_i];
        }
        if (Logger.DEBUG_LOG) {
            console.assert.apply(console, __spreadArrays([assertion, message], optionalParams));
        }
    };
    Logger.DEBUG_LOG = true; //打印
    return Logger;
}());
exports.Logger = Logger;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBO0lBQUE7SUFpQ0EsQ0FBQztJQTdCUSxXQUFJLEdBQVgsVUFBWSxPQUFlO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFFTSxZQUFLLEdBQVo7UUFBYSxjQUFjO2FBQWQsVUFBYyxFQUFkLHFCQUFjLEVBQWQsSUFBYztZQUFkLHlCQUFjOztRQUN6QixJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDcEIsT0FBTyxDQUFDLEdBQUcsT0FBWCxPQUFPLEVBQVEsSUFBSSxFQUFFO1NBQ3RCO0lBQ0gsQ0FBQztJQUVNLFdBQUksR0FBWDtRQUFZLGNBQWM7YUFBZCxVQUFjLEVBQWQscUJBQWMsRUFBZCxJQUFjO1lBQWQseUJBQWM7O1FBQ3hCLE9BQU8sQ0FBQyxHQUFHLE9BQVgsT0FBTyxFQUFRLElBQUksRUFBRTtJQUN2QixDQUFDO0lBRU0sV0FBSSxHQUFYO1FBQVksY0FBYzthQUFkLFVBQWMsRUFBZCxxQkFBYyxFQUFkLElBQWM7WUFBZCx5QkFBYzs7UUFDeEIsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxJQUFJLE9BQVosT0FBTyxFQUFTLElBQUksRUFBRTtTQUN2QjtJQUNILENBQUM7SUFFTSxZQUFLLEdBQVo7UUFBYSxjQUFjO2FBQWQsVUFBYyxFQUFkLHFCQUFjLEVBQWQsSUFBYztZQUFkLHlCQUFjOztRQUN6QixPQUFPLENBQUMsS0FBSyxPQUFiLE9BQU8sRUFBVSxJQUFJLEVBQUU7SUFDekIsQ0FBQztJQUVNLGFBQU0sR0FBYixVQUFjLFNBQW1CLEVBQUUsT0FBZ0I7UUFBRSx3QkFBd0I7YUFBeEIsVUFBd0IsRUFBeEIscUJBQXdCLEVBQXhCLElBQXdCO1lBQXhCLHVDQUF3Qjs7UUFDM0UsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxNQUFNLE9BQWQsT0FBTyxrQkFBUSxTQUFTLEVBQUUsT0FBTyxHQUFLLGNBQWMsR0FBRTtTQUN2RDtJQUNILENBQUM7SUE5QmMsZ0JBQVMsR0FBVyxJQUFJLENBQUMsQ0FBQSxJQUFJO0lBK0I5QyxhQUFDO0NBakNELEFBaUNDLElBQUE7QUFqQ1ksd0JBQU0iLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJcbmV4cG9ydCBjbGFzcyBMb2dnZXIge1xuXG4gIHByaXZhdGUgc3RhdGljIERFQlVHX0xPRzpib29sZWFuID0gdHJ1ZTsvL+aJk+WNsFxuXG4gIHN0YXRpYyBJbml0KGlzRGVidWc6Ym9vbGVhbil7XG4gICAgdGhpcy5ERUJVR19MT0cgPSBpc0RlYnVnO1xuICB9XG5cbiAgc3RhdGljIGRlYnVnKC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKExvZ2dlci5ERUJVR19MT0cpIHtcbiAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBpbmZvKC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gIH1cblxuICBzdGF0aWMgd2FybiguLi5hcmdzOiBhbnlbXSkge1xuICAgIGlmIChMb2dnZXIuREVCVUdfTE9HKSB7XG4gICAgICBjb25zb2xlLndhcm4oLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGVycm9yKC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgY29uc29sZS5lcnJvciguLi5hcmdzKTtcbiAgfVxuXG4gIHN0YXRpYyBhc3NlcnQoYXNzZXJ0aW9uPzogYm9vbGVhbiwgbWVzc2FnZT86IHN0cmluZywgLi4ub3B0aW9uYWxQYXJhbXM6IGFueVtdKTogdm9pZCB7XG4gICAgaWYgKExvZ2dlci5ERUJVR19MT0cpIHtcbiAgICAgIGNvbnNvbGUuYXNzZXJ0KGFzc2VydGlvbiwgbWVzc2FnZSwgLi4ub3B0aW9uYWxQYXJhbXMpO1xuICAgIH1cbiAgfVxufVxuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/Coin.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '6cba59FrPtA0YaVzatN4FVJ', 'Coin');
// script/merge/game/Coin.ts

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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Coin = /** @class */ (function (_super) {
    __extends(Coin, _super);
    function Coin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblNum = null;
        _this.uImgBg = null;
        return _this;
        // update (dt) {}
    }
    Coin.prototype.onLoad = function () {
        this.ulblNum.string = '-';
    };
    Coin.prototype.init = function (slotIdx, cnt, cb) {
        var _this = this;
        var url = "images/coin/" + cnt;
        cc.resources.load(url, cc.SpriteFrame, (function (err, spriteFrame) {
            if (err) {
                console.error('url:', url, '/err:');
                return;
            }
            _this.uImgBg.spriteFrame = spriteFrame;
            cb && cb();
        }));
        // this.ulblNum.string = `${slotIdx}-${cnt}`;
        this.ulblNum.string = "" + cnt;
    };
    Coin.prototype.start = function () {
    };
    __decorate([
        property(cc.Label)
    ], Coin.prototype, "ulblNum", void 0);
    __decorate([
        property(cc.Sprite)
    ], Coin.prototype, "uImgBg", void 0);
    Coin = __decorate([
        ccclass
    ], Coin);
    return Coin;
}(cc.Component));
exports.default = Coin;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9Db2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRzVDO0lBQWtDLHdCQUFZO0lBQTlDO1FBQUEscUVBZ0NDO1FBOUJPLGFBQU8sR0FBYSxJQUFJLENBQUM7UUFHekIsWUFBTSxHQUFjLElBQUksQ0FBQzs7UUEwQjdCLGlCQUFpQjtJQUNyQixDQUFDO0lBekJHLHFCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7SUFDOUIsQ0FBQztJQUVELG1CQUFJLEdBQUosVUFBSyxPQUFlLEVBQUUsR0FBVyxFQUFFLEVBQVc7UUFBOUMsaUJBY0M7UUFiRyxJQUFNLEdBQUcsR0FBVyxpQkFBZSxHQUFLLENBQUM7UUFDekMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFDLEdBQUcsRUFBRSxXQUEyQjtZQUNyRSxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3BDLE9BQU87YUFDVjtZQUVELEtBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUN0QyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUE7UUFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosNkNBQTZDO1FBQzdDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUcsR0FBSyxDQUFDO0lBQ25DLENBQUM7SUFFRCxvQkFBSyxHQUFMO0lBRUEsQ0FBQztJQTNCRztRQURILFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO3lDQUNVO0lBR3pCO1FBREgsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7d0NBQ1M7SUFMWixJQUFJO1FBRHhCLE9BQU87T0FDYSxJQUFJLENBZ0N4QjtJQUFELFdBQUM7Q0FoQ0QsQUFnQ0MsQ0FoQ2lDLEVBQUUsQ0FBQyxTQUFTLEdBZ0M3QztrQkFoQ29CLElBQUkiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29pbiBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgICAgICB1bGJsTnVtOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuU3ByaXRlKVxuICAgICAgICB1SW1nQmc6IGNjLlNwcml0ZSA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMudWxibE51bS5zdHJpbmcgPSAnLSc7XG4gICAgfVxuXG4gICAgaW5pdChzbG90SWR4OiBudW1iZXIsIGNudDogbnVtYmVyLCBjYjpGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGBpbWFnZXMvY29pbi8ke2NudH1gO1xuICAgICAgICBjYy5yZXNvdXJjZXMubG9hZCh1cmwsIGNjLlNwcml0ZUZyYW1lLCAoKGVyciwgc3ByaXRlRnJhbWU6IGNjLlNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigndXJsOicsIHVybCwgJy9lcnI6Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVJbWdCZy5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgY2IgJiYgY2IoKVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gdGhpcy51bGJsTnVtLnN0cmluZyA9IGAke3Nsb3RJZHh9LSR7Y250fWA7XG4gICAgICAgIHRoaXMudWxibE51bS5zdHJpbmcgPSBgJHtjbnR9YDtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcblxuICAgIH1cblxuICAgIC8vIHVwZGF0ZSAoZHQpIHt9XG59XG4iXX0=
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/util/EventManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ea7fbBwaBVK96i8sl/y0ydr', 'EventManager');
// script/merge/util/EventManager.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventManager = exports.GameEvent = exports.EventManager = void 0;
var EventManager = /** @class */ (function (_super) {
    __extends(EventManager, _super);
    function EventManager() {
        return _super.call(this) || this;
    }
    EventManager.prototype.dispatch = function (type, data) {
        this.dispatchEvent(new GameEvent(type, data));
    };
    EventManager.Instance = new EventManager();
    return EventManager;
}(cc.EventTarget));
exports.EventManager = EventManager;
// 游戏事件
var GameEvent = /** @class */ (function (_super) {
    __extends(GameEvent, _super);
    function GameEvent(type, data) {
        if (data === void 0) { data = null; }
        var _this = _super.call(this, type, true) || this;
        _this.data = null;
        _this.type = '';
        _this.type = type;
        _this.data = data;
        return _this;
    }
    return GameEvent;
}(cc.Event.EventCustom));
exports.GameEvent = GameEvent;
exports.eventManager = EventManager.Instance;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9FdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0lBQWtDLGdDQUFjO0lBRzVDO2VBQ0ksaUJBQU87SUFDWCxDQUFDO0lBRUQsK0JBQVEsR0FBUixVQUFTLElBQVksRUFBRSxJQUFVO1FBQzdCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDakQsQ0FBQztJQVJzQixxQkFBUSxHQUFpQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBU3ZFLG1CQUFDO0NBVkQsQUFVQyxDQVZpQyxFQUFFLENBQUMsV0FBVyxHQVUvQztBQVZZLG9DQUFZO0FBWXpCLE9BQU87QUFDUDtJQUErQiw2QkFBb0I7SUFHL0MsbUJBQVksSUFBWSxFQUFFLElBQWdCO1FBQWhCLHFCQUFBLEVBQUEsV0FBZ0I7UUFBMUMsWUFDSSxrQkFBTSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBR3BCO1FBTk0sVUFBSSxHQUFRLElBQUksQ0FBQztRQUNqQixVQUFJLEdBQVcsRUFBRSxDQUFDO1FBR3JCLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOztJQUNyQixDQUFDO0lBQ0wsZ0JBQUM7QUFBRCxDQVJBLEFBUUMsQ0FSOEIsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBUWxEO0FBUlksOEJBQVM7QUFVVCxRQUFBLFlBQVksR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlciBleHRlbmRzIGNjLkV2ZW50VGFyZ2V0IHtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEluc3RhbmNlOiBFdmVudE1hbmFnZXIgPSBuZXcgRXZlbnRNYW5hZ2VyKCk7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoKHR5cGU6IHN0cmluZywgZGF0YT86IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEdhbWVFdmVudCh0eXBlLCBkYXRhKSlcbiAgICB9XG59XG5cbi8vIOa4uOaIj+S6i+S7tlxuZXhwb3J0IGNsYXNzIEdhbWVFdmVudCBleHRlbmRzIGNjLkV2ZW50LkV2ZW50Q3VzdG9tIHtcbiAgICBwdWJsaWMgZGF0YTogYW55ID0gbnVsbDtcbiAgICBwdWJsaWMgdHlwZTogc3RyaW5nID0gJyc7XG4gICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBkYXRhOiBhbnkgPSBudWxsKSB7XG4gICAgICAgIHN1cGVyKHR5cGUsIHRydWUpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGV2ZW50TWFuYWdlciA9IEV2ZW50TWFuYWdlci5JbnN0YW5jZTtcbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/Game.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '650a2ldzTZM6Joa8EAO498E', 'Game');
// script/merge/game/Game.ts

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
var GameModule_1 = require("../dataModule/GameModule");
var AudioMgr_1 = require("../manager/AudioMgr");
var Define_1 = require("../manager/Define");
var Uimanager_1 = require("../manager/Uimanager");
var EventManager_1 = require("../util/EventManager");
var GoodsList_1 = require("./GoodsList");
var MergeProgress_1 = require("./MergeProgress");
var Slot_1 = require("./Slot");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Game = /** @class */ (function (_super) {
    __extends(Game, _super);
    function Game() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uBoxSlot = null;
        _this.uBtnProduce = null;
        _this.uBtnTidyUp = null;
        _this.uBtnMerge = null;
        _this.uBar = null;
        _this.uPanel = null;
        _this.ulblStar = null;
        // 缓存槽位的节点
        _this.slots = [];
        return _this;
    }
    Game.prototype.onLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.uBtnMerge.on(cc.Node.EventType.TOUCH_END, this.onMerge, this);
                        this.uBtnProduce.on(cc.Node.EventType.TOUCH_END, this.onProduce, this);
                        this.uBtnTidyUp.on(cc.Node.EventType.TOUCH_END, this.onTidy, this);
                        EventManager_1.eventManager.on(Define_1.EventType.CHECK_MERGE, this.updateBtn, this);
                        EventManager_1.eventManager.on(Define_1.EventType.MERGE_END, this.updateProgress, this);
                        return [4 /*yield*/, this.addSlot()];
                    case 1:
                        _a.sent();
                        // 加载当前槽筹码状态
                        this.formatSlotData();
                        this.updateBtn();
                        // 加载合成进度
                        this.updateProgress();
                        // 加载商品
                        this.uPanel.getComponent(GoodsList_1.default).initGoods();
                        // 主界面的元素信息
                        this.ulblStar.string = "x " + GameModule_1.gameModule.star;
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.start = function () {
    };
    // 初始化预制组件
    Game.prototype.addSlot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var slotW, slotH, dx, dy, i, row, col, slotPrefab, slot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        slotW = 116;
                        slotH = 212;
                        dx = (608 - slotW * 4) / 3;
                        dy = (this.uBoxSlot.height - slotH * 2) + slotH;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 8)) return [3 /*break*/, 4];
                        row = Math.floor(i / 4);
                        col = i % 4;
                        return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/merge/slot')];
                    case 2:
                        slotPrefab = _a.sent();
                        slot = cc.instantiate(slotPrefab);
                        this.uBoxSlot.addChild(slot);
                        slot.x = col * slotW + dx * col;
                        slot.y = -slotH - dy * row;
                        this.slots.push(slot);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // 格式化填充游戏数据
    Game.prototype.formatSlotData = function () {
        for (var i = 0; i < 8; i++) {
            this.slots[i].getComponent(Slot_1.default).formatData(i, GameModule_1.gameModule.slotData[i]);
        }
        EventManager_1.eventManager.dispatch(Define_1.EventType.CHECK_MERGE);
    };
    // 更新按钮的显示状态
    Game.prototype.updateBtn = function () {
        var canMerge = GameModule_1.gameModule.checkCanMerge();
        this.uBtnMerge.active = canMerge.length > 0;
    };
    // 更新进度
    Game.prototype.updateProgress = function () {
        this.uBar.getComponent(MergeProgress_1.default).updateProress();
    };
    // 合成
    Game.prototype.onMerge = function () {
        if (!GameModule_1.gameModule.canOperate)
            return;
        EventManager_1.eventManager.dispatch(Define_1.EventType.MERGE_COIN);
        // 点击合成后，提前主动隐藏掉“合成”按钮避免连点
        this.uBtnMerge.active = false;
    };
    // 发牌
    Game.prototype.onProduce = function () {
        if (!GameModule_1.gameModule.canOperate)
            return;
        AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.PRODUCE_COIN);
        var startPosIdxs = [];
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 10; j++) {
                if (GameModule_1.gameModule.slotData[i][j] === 0) {
                    startPosIdxs.push(j);
                    break;
                }
                if (j === 9) {
                    startPosIdxs.push(9);
                }
            }
        }
        var newCoinData = GameModule_1.gameModule.produceNewCoinData();
        for (var i = 0; i < this.slots.length; i++) {
            this.slots[i].getComponent(Slot_1.default).produce(newCoinData[i], this.node.convertToWorldSpaceAR(this.uBtnProduce.getPosition()), startPosIdxs[i]);
        }
        GameModule_1.gameModule.mergeProduceData(newCoinData);
        // 发牌完成，检测是否可以合成
        EventManager_1.eventManager.dispatch(Define_1.EventType.CHECK_MERGE);
    };
    // 整理
    Game.prototype.onTidy = function () {
        if (!GameModule_1.gameModule.canOperate)
            return;
        // 获得额外次数 
        if (GameModule_1.gameModule.extraChance < 2) {
            // 分享获得
            wx.shareAppMessage({
                title: '我觉得你不行',
            });
        }
        if (GameModule_1.gameModule.extraChance < 4) {
            // 通过看广告获得
        }
    };
    Game.prototype.doTidy = function () {
        // 如果当前有选中情况，取消当前选中的状态
        if (GameModule_1.gameModule.curSelectSlotIdx !== -1) {
            EventManager_1.eventManager.dispatch(Define_1.EventType.CANCEL_SELECT);
        }
        GameModule_1.gameModule.tidyData();
        this.formatSlotData();
    };
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uBoxSlot", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uBtnProduce", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uBtnTidyUp", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uBtnMerge", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uBar", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uPanel", void 0);
    __decorate([
        property(cc.Label)
    ], Game.prototype, "ulblStar", void 0);
    Game = __decorate([
        ccclass
    ], Game);
    return Game;
}(cc.Component));
exports.default = Game;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9HYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEQUFzRDtBQUV0RCxnREFBMEQ7QUFDMUQsNENBQThDO0FBQzlDLGtEQUFpRDtBQUNqRCxxREFBb0Q7QUFDcEQseUNBQW9DO0FBQ3BDLGlEQUE0QztBQUM1QywrQkFBMEI7QUFFcEIsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFHNUM7SUFBa0Msd0JBQVk7SUFBOUM7UUFBQSxxRUFvS0M7UUFsS0csY0FBUSxHQUFZLElBQUksQ0FBQztRQUd6QixpQkFBVyxHQUFZLElBQUksQ0FBQztRQUc1QixnQkFBVSxHQUFZLElBQUksQ0FBQztRQUczQixlQUFTLEdBQVksSUFBSSxDQUFDO1FBRzFCLFVBQUksR0FBWSxJQUFJLENBQUM7UUFHckIsWUFBTSxHQUFZLElBQUksQ0FBQztRQUd2QixjQUFRLEdBQWEsSUFBSSxDQUFDO1FBRTFCLFVBQVU7UUFDRixXQUFLLEdBQVcsRUFBRSxDQUFDOztJQTZJL0IsQ0FBQztJQTNJUyxxQkFBTSxHQUFaOzs7Ozt3QkFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDbkUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ3ZFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FB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MENBQ087SUFHekI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs2Q0FDVTtJQUc1QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzRDQUNTO0lBRzNCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7MkNBQ1E7SUFHMUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztzQ0FDRztJQUdyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO3dDQUNLO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7MENBQ087SUFwQlQsSUFBSTtRQUR4QixPQUFPO09BQ2EsSUFBSSxDQW9LeEI7SUFBRCxXQUFDO0NBcEtELEFBb0tDLENBcEtpQyxFQUFFLENBQUMsU0FBUyxHQW9LN0M7a0JBcEtvQixJQUFJIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2FtZU1vZHVsZSB9IGZyb20gJy4uL2RhdGFNb2R1bGUvR2FtZU1vZHVsZSc7XG5pbXBvcnQgeyBwbGF5ZXJNb2R1bGUgfSBmcm9tICcuLi9kYXRhTW9kdWxlL1BsYXllck1vZHVsZSc7XG5pbXBvcnQgeyBTb3VuZFR5cGUsIGF1ZGlvTWdyIH0gZnJvbSAnLi4vbWFuYWdlci9BdWRpb01ncic7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tICcuLi9tYW5hZ2VyL0RlZmluZSc7XG5pbXBvcnQgeyB1aW1hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2VyL1VpbWFuYWdlcic7XG5pbXBvcnQgeyBldmVudE1hbmFnZXIgfSBmcm9tICcuLi91dGlsL0V2ZW50TWFuYWdlcic7XG5pbXBvcnQgR29vZHNMaXN0IGZyb20gJy4vR29vZHNMaXN0JztcbmltcG9ydCBNZXJnZVByb2dyZXNzIGZyb20gJy4vTWVyZ2VQcm9ncmVzcyc7XG5pbXBvcnQgU2xvdCBmcm9tICcuL1Nsb3QnO1xuXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJveFNsb3Q6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0blByb2R1Y2U6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0blRpZHlVcDogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1QnRuTWVyZ2U6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJhcjogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1UGFuZWw6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxTdGFyOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICAvLyDnvJPlrZjmp73kvY3nmoToioLngrlcbiAgICBwcml2YXRlIHNsb3RzOiBTbG90W10gPSBbXTtcblxuICAgIGFzeW5jIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy51QnRuTWVyZ2Uub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uTWVyZ2UsIHRoaXMpO1xuICAgICAgICB0aGlzLnVCdG5Qcm9kdWNlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vblByb2R1Y2UsIHRoaXMpO1xuICAgICAgICB0aGlzLnVCdG5UaWR5VXAub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uVGlkeSwgdGhpcyk7XG5cbiAgICAgICAgZXZlbnRNYW5hZ2VyLm9uKEV2ZW50VHlwZS5DSEVDS19NRVJHRSwgdGhpcy51cGRhdGVCdG4sIHRoaXMpO1xuICAgICAgICBldmVudE1hbmFnZXIub24oRXZlbnRUeXBlLk1FUkdFX0VORCwgdGhpcy51cGRhdGVQcm9ncmVzcywgdGhpcyk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5hZGRTbG90KCk7XG5cbiAgICAgICAgLy8g5Yqg6L295b2T5YmN5qe9562556CB54q25oCBXG4gICAgICAgIHRoaXMuZm9ybWF0U2xvdERhdGEoKTtcbiAgICAgICAgdGhpcy51cGRhdGVCdG4oKTtcblxuICAgICAgICAvLyDliqDovb3lkIjmiJDov5vluqZcbiAgICAgICAgdGhpcy51cGRhdGVQcm9ncmVzcygpO1xuXG4gICAgICAgIC8vIOWKoOi9veWVhuWTgVxuICAgICAgICB0aGlzLnVQYW5lbC5nZXRDb21wb25lbnQoR29vZHNMaXN0KS5pbml0R29vZHMoKTtcblxuICAgICAgICAvLyDkuLvnlYzpnaLnmoTlhYPntKDkv6Hmga9cbiAgICAgICAgdGhpcy51bGJsU3Rhci5zdHJpbmcgPSBgeCAke2dhbWVNb2R1bGUuc3Rhcn1gO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuXG4gICAgfVxuXG4gICAgLy8g5Yid5aeL5YyW6aKE5Yi257uE5Lu2XG4gICAgYXN5bmMgYWRkU2xvdCgpIHtcbiAgICAgICAgY29uc3Qgc2xvdFcgPSAxMTY7XG4gICAgICAgIGNvbnN0IHNsb3RIID0gMjEyO1xuICAgICAgICBjb25zdCBkeCA9ICg2MDggLSBzbG90VyAqIDQpIC8gMztcbiAgICAgICAgY29uc3QgZHkgPSAodGhpcy51Qm94U2xvdC5oZWlnaHQgLSBzbG90SCAqIDIpICsgc2xvdEg7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoaSAvIDQpO1xuICAgICAgICAgICAgY29uc3QgY29sID0gaSAlIDQ7XG5cbiAgICAgICAgICAgIGNvbnN0IHNsb3RQcmVmYWIgPSBhd2FpdCB1aW1hbmFnZXIubG9hZFByZWZhYigncHJlZmFiL21lcmdlL3Nsb3QnKTtcbiAgICAgICAgICAgIGNvbnN0IHNsb3QgPSBjYy5pbnN0YW50aWF0ZShzbG90UHJlZmFiKTtcbiAgICAgICAgICAgIHRoaXMudUJveFNsb3QuYWRkQ2hpbGQoc2xvdCk7XG4gICAgICAgICAgICBzbG90LnggPSBjb2wgKiBzbG90VyArIGR4ICogY29sO1xuICAgICAgICAgICAgc2xvdC55ID0gLXNsb3RIIC0gZHkgKiByb3c7XG5cbiAgICAgICAgICAgIHRoaXMuc2xvdHMucHVzaChzbG90KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOagvOW8j+WMluWhq+WFhea4uOaIj+aVsOaNrlxuICAgIHByaXZhdGUgZm9ybWF0U2xvdERhdGEoKTogdm9pZCB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnNsb3RzW2ldLmdldENvbXBvbmVudChTbG90KS5mb3JtYXREYXRhKGksIGdhbWVNb2R1bGUuc2xvdERhdGFbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuQ0hFQ0tfTUVSR0UpO1xuICAgIH1cblxuICAgIC8vIOabtOaWsOaMiemSrueahOaYvuekuueKtuaAgVxuICAgIHVwZGF0ZUJ0bigpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2FuTWVyZ2UgPSBnYW1lTW9kdWxlLmNoZWNrQ2FuTWVyZ2UoKTtcbiAgICAgICAgdGhpcy51QnRuTWVyZ2UuYWN0aXZlID0gY2FuTWVyZ2UubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICAvLyDmm7TmlrDov5vluqZcbiAgICB1cGRhdGVQcm9ncmVzcygpIHtcbiAgICAgICAgdGhpcy51QmFyLmdldENvbXBvbmVudChNZXJnZVByb2dyZXNzKS51cGRhdGVQcm9yZXNzKCk7XG4gICAgfVxuXG4gICAgLy8g5ZCI5oiQXG4gICAgb25NZXJnZSgpIHtcbiAgICAgICAgaWYgKCFnYW1lTW9kdWxlLmNhbk9wZXJhdGUpIHJldHVybjtcblxuICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLk1FUkdFX0NPSU4pO1xuICAgICAgICAvLyDngrnlh7vlkIjmiJDlkI7vvIzmj5DliY3kuLvliqjpmpDol4/mjonigJzlkIjmiJDigJ3mjInpkq7pgb/lhY3ov57ngrlcbiAgICAgICAgdGhpcy51QnRuTWVyZ2UuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8g5Y+R54mMXG4gICAgb25Qcm9kdWNlKCkge1xuICAgICAgICBpZiAoIWdhbWVNb2R1bGUuY2FuT3BlcmF0ZSkgcmV0dXJuO1xuXG4gICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuUFJPRFVDRV9DT0lOKTtcblxuICAgICAgICBjb25zdCBzdGFydFBvc0lkeHM6IG51bWJlcltdID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZ2FtZU1vZHVsZS5zbG90RGF0YVtpXVtqXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydFBvc0lkeHMucHVzaChqKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGogPT09IDkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRQb3NJZHhzLnB1c2goOSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV3Q29pbkRhdGEgPSBnYW1lTW9kdWxlLnByb2R1Y2VOZXdDb2luRGF0YSgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2xvdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuc2xvdHNbaV0uZ2V0Q29tcG9uZW50KFNsb3QpLnByb2R1Y2UoXG4gICAgICAgICAgICAgICAgbmV3Q29pbkRhdGFbaV0sXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLmNvbnZlcnRUb1dvcmxkU3BhY2VBUih0aGlzLnVCdG5Qcm9kdWNlLmdldFBvc2l0aW9uKCkpLFxuICAgICAgICAgICAgICAgIHN0YXJ0UG9zSWR4c1tpXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVNb2R1bGUubWVyZ2VQcm9kdWNlRGF0YShuZXdDb2luRGF0YSk7XG5cbiAgICAgICAgLy8g5Y+R54mM5a6M5oiQ77yM5qOA5rWL5piv5ZCm5Y+v5Lul5ZCI5oiQXG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuQ0hFQ0tfTUVSR0UpO1xuICAgIH1cblxuICAgIC8vIOaVtOeQhlxuICAgIG9uVGlkeSgpIHtcbiAgICAgICAgaWYgKCFnYW1lTW9kdWxlLmNhbk9wZXJhdGUpIHJldHVybjtcblxuICAgICAgICAvLyDojrflvpfpop3lpJbmrKHmlbAgXG4gICAgICAgIGlmIChnYW1lTW9kdWxlLmV4dHJhQ2hhbmNlIDwgMikge1xuICAgICAgICAgICAgLy8g5YiG5Lqr6I635b6XXG4gICAgICAgICAgICB3eC5zaGFyZUFwcE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAn5oiR6KeJ5b6X5L2g5LiN6KGMJyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZ2FtZU1vZHVsZS5leHRyYUNoYW5jZSA8IDQpIHtcbiAgICAgICAgICAgIC8vIOmAmui/h+eci+W5v+WRiuiOt+W+l1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkb1RpZHkoKTogdm9pZCB7XG4gICAgICAgIC8vIOWmguaenOW9k+WJjeaciemAieS4reaDheWGte+8jOWPlua2iOW9k+WJjemAieS4reeahOeKtuaAgVxuICAgICAgICBpZiAoZ2FtZU1vZHVsZS5jdXJTZWxlY3RTbG90SWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5DQU5DRUxfU0VMRUNUKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVNb2R1bGUudGlkeURhdGEoKTtcbiAgICAgICAgdGhpcy5mb3JtYXRTbG90RGF0YSgpO1xuICAgIH1cbn1cbiJdfQ==
//------QC-SOURCE-SPLIT------

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
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/PlayerModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b9091AjnB9Hj67aGxm4Vaq5', 'PlayerModule');
// script/merge/dataModule/PlayerModule.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerModule = void 0;
var DataModule_1 = require("./DataModule");
var GameModule_1 = require("./GameModule");
var GoodsModule_1 = require("./GoodsModule");
var PlayerModule = /** @class */ (function (_super) {
    __extends(PlayerModule, _super);
    function PlayerModule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PlayerModule.prototype.parseData = function (data) {
        _super.prototype.parseData.call(this, data);
    };
    PlayerModule.prototype.login = function (cb) {
        var loginData = {
            star: 0,
            // 初始化的筹码配置
            slotData: [
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 2, 2, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 3, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
            // 奖励兑换配置信息
            goods: [{
                    id: 1,
                    star: 1,
                    total: 100,
                    used: 0,
                    name: '1盒纸巾',
                    desc: '商品1',
                    url: "",
                }, {
                    id: 2,
                    star: 3,
                    total: 100,
                    used: 0,
                    name: '1箱牛奶',
                    desc: '商品2',
                    url: "",
                }, {
                    id: 3,
                    star: 5,
                    total: 100,
                    used: 0,
                    name: '一箱红牛',
                    desc: '商品3',
                    url: "",
                }, {
                    id: 4,
                    star: 5,
                    total: 100,
                    used: 0,
                    name: '一箱饼干',
                    desc: '商品4',
                    url: "",
                }, {
                    id: 5,
                    star: 8,
                    total: 100,
                    used: 0,
                    name: '星巴克100券',
                    desc: '商品5',
                    url: "",
                }, {
                    id: 6,
                    star: 10,
                    total: 100,
                    used: 0,
                    name: '电子手表',
                    desc: '商品6',
                    url: "",
                }, {
                    id: 7,
                    star: 10,
                    total: 100,
                    used: 0,
                    name: '北京1日游',
                    desc: '商品7',
                    url: "",
                }, {
                    id: 8,
                    star: 20,
                    total: 100,
                    used: 0,
                    name: '5克黄金',
                    desc: '商品8',
                    url: "",
                }
            ]
        };
        GameModule_1.gameModule.parseData(loginData);
        GoodsModule_1.goodsModule.parseData(loginData);
        cb && cb();
    };
    return PlayerModule;
}(DataModule_1.default));
exports.default = PlayerModule;
exports.playerModule = new PlayerModule();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9QbGF5ZXJNb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFzQztBQUN0QywyQ0FBMEM7QUFDMUMsNkNBQTRDO0FBRTVDO0lBQTBDLGdDQUFVO0lBQXBEOztJQStGQSxDQUFDO0lBN0ZHLGdDQUFTLEdBQVQsVUFBVSxJQUFTO1FBQ2YsaUJBQU0sU0FBUyxZQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCw0QkFBSyxHQUFMLFVBQU0sRUFBWTtRQUNkLElBQU0sU0FBUyxHQUFHO1lBQ2QsSUFBSSxFQUFFLENBQUM7WUFFUCxXQUFXO1lBQ1gsUUFBUSxFQUFFO2dCQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDOUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzlCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFD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LG1CQUFDO0FBQUQsQ0EvRkEsQUErRkMsQ0EvRnlDLG9CQUFVLEdBK0ZuRDs7QUFDWSxRQUFBLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERhdGFNb2R1bGUgZnJvbSAnLi9EYXRhTW9kdWxlJztcbmltcG9ydCB7IGdhbWVNb2R1bGUgfSBmcm9tICcuL0dhbWVNb2R1bGUnO1xuaW1wb3J0IHsgZ29vZHNNb2R1bGUgfSBmcm9tICcuL0dvb2RzTW9kdWxlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyTW9kdWxlIGV4dGVuZHMgRGF0YU1vZHVsZSB7XG5cbiAgICBwYXJzZURhdGEoZGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIHN1cGVyLnBhcnNlRGF0YShkYXRhKTtcbiAgICB9XG5cbiAgICBsb2dpbihjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbG9naW5EYXRhID0ge1xuICAgICAgICAgICAgc3RhcjogMCxcblxuICAgICAgICAgICAgLy8g5Yid5aeL5YyW55qE562556CB6YWN572uXG4gICAgICAgICAgICBzbG90RGF0YTogW1xuICAgICAgICAgICAgICAgIFsxLCAxLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMiwgMiwgMiwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzEsIDEsIDIsIDIsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFsyLCAyLCAyLCAzLCAzLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICBdLFxuXG4gICAgICAgICAgICAvLyDlpZblirHlhZHmjaLphY3nva7kv6Hmga9cbiAgICAgICAgICAgIGdvb2RzOiBbe1xuICAgICAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgICAgIHN0YXI6IDEsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICcx55uS57q45be+JyxcbiAgICAgICAgICAgICAgICBkZXNjOiAn5ZWG5ZOBMScsXG4gICAgICAgICAgICAgICAgdXJsOiBgYCxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpZDogMixcbiAgICAgICAgICAgICAgICBzdGFyOiAzLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAnMeeuseeJm+WlticsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTInLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDMsXG4gICAgICAgICAgICAgICAgc3RhcjogNSxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+S4gOeusee6oueJmycsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTMnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDQsXG4gICAgICAgICAgICAgICAgc3RhcjogNSxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+S4gOeusemlvOW5sicsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTQnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDUsXG4gICAgICAgICAgICAgICAgc3RhcjogOCxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+aYn+W3tOWFizEwMOWIuCcsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTUnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDYsXG4gICAgICAgICAgICAgICAgc3RhcjogMTAsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICfnlLXlrZDmiYvooagnLFxuICAgICAgICAgICAgICAgIGRlc2M6ICfllYblk4E2JyxcbiAgICAgICAgICAgICAgICB1cmw6IGBgLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGlkOiA3LFxuICAgICAgICAgICAgICAgIHN0YXI6IDEwLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAn5YyX5LqsMeaXpea4uCcsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTcnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDgsXG4gICAgICAgICAgICAgICAgc3RhcjogMjAsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICc15YWL6buE6YeRJyxcbiAgICAgICAgICAgICAgICBkZXNjOiAn5ZWG5ZOBOCcsXG4gICAgICAgICAgICAgICAgdXJsOiBgYCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVNb2R1bGUucGFyc2VEYXRhKGxvZ2luRGF0YSk7XG4gICAgICAgIGdvb2RzTW9kdWxlLnBhcnNlRGF0YShsb2dpbkRhdGEpO1xuICAgICAgICBjYiAmJiBjYigpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBwbGF5ZXJNb2R1bGUgPSBuZXcgUGxheWVyTW9kdWxlKCk7XG5cbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/GoodsModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'beefbM59wVK1oMpVwTVCzYm', 'GoodsModule');
// script/merge/dataModule/GoodsModule.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.goodsModule = void 0;
var DataModule_1 = require("./DataModule");
var GoodsModule = /** @class */ (function (_super) {
    __extends(GoodsModule, _super);
    function GoodsModule() {
        var _this = _super.call(this) || this;
        _this.goods = [];
        return _this;
    }
    GoodsModule.prototype.parseData = function (data) {
        _super.prototype.parseData.call(this, data);
        this.goods = data.goods;
    };
    return GoodsModule;
}(DataModule_1.default));
exports.default = GoodsModule;
exports.goodsModule = new GoodsModule();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9Hb29kc01vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMkNBQXNDO0FBRXRDO0lBQXlDLCtCQUFVO0lBRS9DO1FBQUEsWUFDSSxpQkFBTyxTQUNWO1FBSEQsV0FBSyxHQUFnQixFQUFFLENBQUM7O0lBR3hCLENBQUM7SUFFRCwrQkFBUyxHQUFULFVBQVUsSUFBUztRQUNmLGlCQUFNLFNBQVMsWUFBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0FWQSxBQVVDLENBVndDLG9CQUFVLEdBVWxEOztBQUNZLFFBQUEsV0FBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHb29kc1R5cGUgfSBmcm9tIFwiLi4vbWFuYWdlci9EZWZpbmVcIjtcbmltcG9ydCBEYXRhTW9kdWxlIGZyb20gXCIuL0RhdGFNb2R1bGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29vZHNNb2R1bGUgZXh0ZW5kcyBEYXRhTW9kdWxlIHtcbiAgICBnb29kczogR29vZHNUeXBlW10gPSBbXTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwYXJzZURhdGEoZGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIHN1cGVyLnBhcnNlRGF0YShkYXRhKTtcbiAgICAgICAgdGhpcy5nb29kcyA9IGRhdGEuZ29vZHM7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGdvb2RzTW9kdWxlID0gbmV3IEdvb2RzTW9kdWxlKCk7Il19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/GameModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '64566mmcFVMhZE7goFc3ntd', 'GameModule');
// script/merge/dataModule/GameModule.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameModule = void 0;
var Define_1 = require("../manager/Define");
var EventManager_1 = require("../util/EventManager");
var NewUtils_1 = require("../util/NewUtils");
var DataModule_1 = require("./DataModule");
var GameModule = /** @class */ (function (_super) {
    __extends(GameModule, _super);
    function GameModule() {
        var _this = _super.call(this) || this;
        // 用户的筹码槽位数据 1~10
        _this.slotData = [];
        // 当前正在选中的筹码槽位
        _this.curSelectSlotIdx = -1;
        // 当前选中的筹码信息
        _this.curSelectCoinIdxs = [];
        // 移动锁
        _this.moveLock = false;
        // 合成引用计数
        _this.mergeLock = 0;
        // 生成筹码效果引用计数
        _this.produceLock = 0;
        // 当前星星数
        _this.star = 0;
        // 每回合额外获得的次数
        _this.extraChance = 0;
        return _this;
    }
    GameModule.prototype.parseData = function (data) {
        _super.prototype.parseData.call(this, data);
        this.slotData = data.slotData;
        this.star = data.star;
    };
    Object.defineProperty(GameModule.prototype, "canOperate", {
        // 交互操作的检测，当前如果有正在发生的交互行为，则不允许触发更多的行为
        get: function () {
            // 正在有移动行为发生
            if (this.moveLock) {
                console.log('正在进行移动操作');
                return false;
            }
            // 正在进行合成操作
            if (this.mergeLock !== 0) {
                console.log('正在进行合成操作');
                return false;
            }
            if (this.produceLock !== 0) {
                console.log('正在发放筹码操作');
                return false;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @description 通过槽id 获取第一个有效的筹码信息
     * @param slotIdx: 需要获取第一个有效的筹码信息的槽id
     * @return vaildNum: 该槽位的有效数字、vaildIdx: 有效数字的索引、vaildSPace: 剩余可容纳的筹码空间
     */
    GameModule.prototype.getFirstVaildNumBySlotIdx = function (slotIdx) {
        var slotData = this.slotData[slotIdx];
        var vaildNum = -1;
        var vaildIdx = -1;
        var vaildSpace = 10;
        for (var i = 9; i >= 0; i--) {
            if (slotData[i] === 0)
                continue;
            vaildNum = slotData[i];
            vaildIdx = i;
            vaildSpace = 9 - i;
            break;
        }
        return { vaildNum: vaildNum, vaildIdx: vaildIdx, vaildSpace: vaildSpace };
    };
    /**
     * @description 获取当前选中的待移动的槽位筹码信息
     * @returns slotIdx: 当前选中的槽位索引、  cnt: 待移动的筹码数量、  num: 待移动的数字类型
     */
    GameModule.prototype.getCurSelectSlotInfo = function () {
        if (this.curSelectSlotIdx === -1)
            return null;
        var cnt = this.curSelectCoinIdxs.length;
        var num = this.slotData[this.curSelectSlotIdx][this.curSelectCoinIdxs[0]];
        return { slotIdx: this.curSelectSlotIdx, cnt: cnt, num: num };
    };
    // 重置当前筹码选择状态
    GameModule.prototype.resetSelectStatus = function () {
        exports.gameModule.curSelectSlotIdx = -1;
        exports.gameModule.curSelectCoinIdxs = [];
    };
    // 筹码移动完成，整理移动后的数据
    GameModule.prototype.tidySlotData = function (ed) {
        for (var i = 0; i < ed.srcIdxArr.length; i++) {
            this.slotData[this.curSelectSlotIdx][ed.srcIdxArr[i]] = 0;
            this.slotData[ed.tarSlotIdx][ed.tarIdxArr[i]] = ed.numType;
        }
        // 刷新筹码显示情况
        EventManager_1.eventManager.dispatch(Define_1.EventType.MOVE_END, ed);
        // 重置当前选中状态
        this.resetSelectStatus();
        // 检测是否可以合成
        EventManager_1.eventManager.dispatch(Define_1.EventType.CHECK_MERGE);
    };
    // 检测是否有可以合成的槽位
    GameModule.prototype.checkCanMerge = function () {
        var result = [];
        for (var i = 0; i < 8; i++) {
            var can = this.checkCanMergeBySlot(i);
            if (can)
                result.push(i);
        }
        return result;
    };
    // 通过槽位来检测是否可以进行合成
    GameModule.prototype.checkCanMergeBySlot = function (slotId) {
        var slotData = this.slotData[slotId];
        for (var i = 0; i < 10; i++) {
            if (slotData[i] === 0)
                return false;
            if (i === 0)
                continue;
            if (slotData[i] !== slotData[i - 1]) {
                return false;
            }
        }
        return true;
    };
    // 获取当前最大数字
    GameModule.prototype.getMaxValue = function () {
        var maxValue = 0;
        for (var i = 0; i < this.slotData.length; i++) {
            for (var j = 0; j < this.slotData[i].length; j++) {
                if (this.slotData[i][j] > maxValue) {
                    maxValue = this.slotData[i][j];
                }
            }
        }
        return maxValue;
    };
    // 获取当前最小数字
    GameModule.prototype.getMinValue = function () {
        var minValue = -1;
        for (var i = 0; i < this.slotData.length; i++) {
            for (var j = 0; j < this.slotData[i].length; j++) {
                if (minValue === -1 && this.slotData[i][j] !== 0) {
                    minValue = this.slotData[i][j];
                }
                if (this.slotData[i][j] < minValue && this.slotData[i][j] !== 0) {
                    minValue = this.slotData[i][j];
                }
            }
        }
        return minValue;
    };
    GameModule.prototype.getSpaceBySlot = function (id) {
        if (!this.slotData[id])
            return;
        for (var i = 0; i < this.slotData[id].length; i++) {
            if (this.slotData[id][i] === 0) {
                return 10 - i;
            }
        }
        return 0;
    };
    // 获取当前剩余空间
    GameModule.prototype.getSpace = function () {
        var space = 0;
        for (var i = 0; i < 8; i++) {
            space += this.getSpaceBySlot(i);
        }
        return space;
    };
    //TODO: 生成新的筹码数据 （服务器逻辑）
    GameModule.prototype.produceNewCoinData = function () {
        var maxValue = this.getMaxValue();
        var space = this.getSpace();
        if (maxValue >= 15) {
            console.warn('当前已合成15');
            return;
        }
        if (space === 0) {
            console.warn('没有剩余空间，无法生成新数字');
            return;
        }
        if (maxValue < 5) {
            return this.produceStrategyOne(maxValue, space);
        }
        else if (maxValue < 10) {
            return this.produceStrategyTwo(maxValue, space);
        }
        else if (maxValue < 14) {
            return this.produceStrategyThree(maxValue, space);
        }
        else if (maxValue < 15) {
            return this.produceStrategyFour(maxValue, space);
        }
    };
    /**
     * @description 小于5 策略
     * 1、生成数量 min(space*30,8);
     * 2、生成类型 <= 3
     * 3、最小数 = 当前场景最小数-1
     *
     * @param max: 当前场景中最大的筹码数值
     * @param space: 当前总的空间数
     * @returns
     */
    GameModule.prototype.produceStrategyOne = function (max, space) {
        console.log('策略1:<5');
        // 场景中最小值
        var min = Math.min(1, this.getMinValue());
        // 总共需要生成的数字数量
        var totalCnt = Math.floor(Math.min(25, space * 0.6));
        if (totalCnt === 0)
            totalCnt = 1;
        // 新生成的数字类型限定在比当前场景中最大的数字小1
        var limitMax = max - 1 > 0 ? max - 1 : 1;
        // 生成数字的类型数量 1、2、3、4
        var typeCnt = totalCnt >= 4 ? 4 : totalCnt;
        typeCnt = Math.min(typeCnt, limitMax - min + 1);
        // 数字种类
        var types = NewUtils_1.default.randomIntArrFromSection(typeCnt, min, limitMax);
        // 生成全部的随机筹码值
        var allNewCoin = NewUtils_1.default.randomIntArrFromArr(totalCnt, types);
        // 确定当前的剩余空间情况
        var spaceInfo = [];
        for (var i = 0; i < 8; i++) {
            var perSlotSpace = this.getSpaceBySlot(i);
            spaceInfo.push(perSlotSpace);
        }
        // 随机将已经生成的数字填充到相应的空位置处(一定是可以放得下的，剩余空间>=生成的数字数量)
        var result = [[], [], [], [], [], [], [], []];
        do {
            var slotIdx = NewUtils_1.default.randomIntInclusive(0, 7);
            if (spaceInfo[slotIdx] === 0)
                continue;
            result[slotIdx].push(allNewCoin.shift());
            spaceInfo[slotIdx]--;
        } while (allNewCoin.length > 0);
        return result;
    };
    // 小于10的策略
    GameModule.prototype.produceStrategyTwo = function (max, space) {
        console.log('策略2:5<=x<10');
        // 场景中最小值
        var min = Math.min(3, this.getMinValue());
        // 总共需要生成的数字数量
        var totalCnt = Math.floor(Math.min(22, space * 0.6));
        if (totalCnt === 0)
            totalCnt = 1;
        // 最大值 7
        var limitMax = Math.min(max - 1, 7);
        // 生成数字的类型数量(既不能超过可生成的总数量，也不能超过当前允许出现的类型上限)
        var typeCnt = totalCnt >= 3 ? 3 : totalCnt;
        typeCnt = Math.min(typeCnt, limitMax - min + 1);
        // 实际生成的种类
        var types = NewUtils_1.default.randomIntArrFromSection(typeCnt, min, limitMax);
        // 生成全部的随机筹码值
        var allNewCoin = NewUtils_1.default.randomIntArrFromArr(totalCnt, types);
        // 确定当前的剩余空间情况
        var spaceInfo = [];
        for (var i = 0; i < 8; i++) {
            var perSlotSpace = this.getSpaceBySlot(i);
            spaceInfo.push(perSlotSpace);
        }
        // 随机将已经生成的数字填充到相应的空位置处(一定是可以放得下的，剩余空间>=生成的数字数量)
        var result = [[], [], [], [], [], [], [], []];
        do {
            var slotIdx = NewUtils_1.default.randomIntInclusive(0, 7);
            if (spaceInfo[slotIdx] === 0)
                continue;
            result[slotIdx].push(allNewCoin.shift());
            spaceInfo[slotIdx]--;
        } while (allNewCoin.length > 0);
        return result;
    };
    // 小于14的策略
    GameModule.prototype.produceStrategyThree = function (max, space) {
        console.log('策略3: 10<x<14');
        // 场景中最小值
        var min = Math.min(8, this.getMinValue());
        // 总共需要生成的数字数量
        var totalCnt = Math.floor(Math.min(20, space * 0.6));
        if (totalCnt === 0)
            totalCnt = 1;
        // 最大值 9~11
        var limitMax = Math.min(max - 1, 11);
        // 生成数字的类型数量(既不能超过可生成的总数量，也不能超过当前允许出现的类型上限)
        var typeCnt = totalCnt >= 3 ? 3 : totalCnt;
        typeCnt = Math.min(typeCnt, limitMax - min + 1);
        // 数字种类
        var types = NewUtils_1.default.randomIntArrFromSection(typeCnt, min, limitMax);
        // 生成全部的随机筹码值
        var allNewCoin = NewUtils_1.default.randomIntArrFromArr(totalCnt, types);
        // 确定当前的剩余空间情况
        var spaceInfo = [];
        for (var i = 0; i < 8; i++) {
            var perSlotSpace = this.getSpaceBySlot(i);
            spaceInfo.push(perSlotSpace);
        }
        // 随机将已经生成的数字填充到相应的空位置处(一定是可以放得下的，剩余空间>=生成的数字数量)
        var result = [[], [], [], [], [], [], [], []];
        do {
            var slotIdx = NewUtils_1.default.randomIntInclusive(0, 7);
            if (spaceInfo[slotIdx] === 0)
                continue;
            result[slotIdx].push(allNewCoin.shift());
            spaceInfo[slotIdx]--;
        } while (allNewCoin.length > 0);
        return result;
    };
    // 小于15的策略
    GameModule.prototype.produceStrategyFour = function (max, space) {
        console.log('策略1:<15');
        // 场景中最小值
        var min = Math.min(11, this.getMinValue());
        // 总共需要生成的数字数量
        var totalCnt = Math.floor(Math.min(25, space * 0.8));
        if (totalCnt === 0)
            totalCnt = 1;
        // 最大值11~13
        var limitMax = Math.min(max - 1, 11);
        // 生成数字的类型数量 min~9
        var typeCnt = totalCnt >= 3 ? 3 : totalCnt;
        // 数字种类
        var types = NewUtils_1.default.randomIntArrFromSection(typeCnt, min, limitMax);
        // 生成全部的随机筹码值
        var allNewCoin = NewUtils_1.default.randomIntArrFromArr(totalCnt, types);
        // 确定当前的剩余空间情况
        var spaceInfo = [];
        for (var i = 0; i < 8; i++) {
            var perSlotSpace = this.getSpaceBySlot(i);
            spaceInfo.push(perSlotSpace);
        }
        // 随机将已经生成的数字填充到相应的空位置处(一定是可以放得下的，剩余空间>=生成的数字数量)
        var result = [[], [], [], [], [], [], [], []];
        do {
            var slotIdx = NewUtils_1.default.randomIntInclusive(0, 7);
            if (spaceInfo[slotIdx] === 0)
                continue;
            result[slotIdx].push(allNewCoin.shift());
            spaceInfo[slotIdx]--;
        } while (allNewCoin.length > 0);
        return result;
    };
    // TODO: 新生成的数据和原有数据进行合成
    GameModule.prototype.mergeProduceData = function (newData) {
        for (var slotIdx = 0; slotIdx < 8; slotIdx++) {
            var newSlotData = NewUtils_1.default.deepClone(newData[slotIdx]);
            for (var j = 0; j < 10; j++) {
                if (this.slotData[slotIdx][j] === 0 && newSlotData.length > 0) {
                    var newCoinData = newSlotData.shift();
                    this.slotData[slotIdx][j] = newCoinData;
                }
            }
        }
    };
    /*
     * TODO: 梳理棋盘数据(服务器逻辑)
     * @description: 保留场景中最大的8个种类数，每种数最多保留10个，其余都扔掉
     */
    GameModule.prototype.tidyData = function () {
        // 1、记录每种类型数字的持有总数
        var dataMap = {};
        for (var i = 0; i < this.slotData.length; i++) {
            for (var j = 0; j < 10; j++) {
                if (this.slotData[i][j] !== 0) {
                    if (dataMap["" + this.slotData[i][j]]) {
                        dataMap["" + this.slotData[i][j]] += 1;
                    }
                    else {
                        dataMap["" + this.slotData[i][j]] = 1;
                    }
                }
            }
        }
        console.log('dataMap:', dataMap);
        // 2、根据每种数字类型，创建一个长度为10的类型，数量不足10补足0
        var allData = [];
        for (var key in dataMap) {
            if (dataMap[key] > 10) {
                dataMap[key] = 10;
            }
            var perTypeData = [];
            for (var i = 0; i < 10; i++) {
                if (i <= dataMap[key] - 1) {
                    perTypeData.push(Number(key));
                }
                else {
                    perTypeData.push(0);
                }
            }
            allData.push(perTypeData);
        }
        // 3、将所有类型的数组从大到小有序排列
        allData.sort(function (a, b) {
            return b[0] - a[0];
        });
        // 最终标准格式化
        if (allData.length > 8) {
            // 类型超过8种 取前八
            this.slotData = allData.slice(0, 7);
        }
        else {
            // 不足8种，补足8种
            for (var i = 0; i < 8; i++) {
                if (allData.length <= i) {
                    allData.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                }
            }
            this.slotData = allData;
        }
        console.log('整理后的slotData:', allData, this.slotData);
    };
    return GameModule;
}(DataModule_1.default));
exports.default = GameModule;
exports.gameModule = new GameModule();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9HYW1lTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FBOEM7QUFDOUMscURBQStEO0FBQy9ELDZDQUF3QztBQUN4QywyQ0FBc0M7QUFFdEM7SUFBd0MsOEJBQVU7SUFzQjlDO1FBQUEsWUFDSSxpQkFBTyxTQUNWO1FBdkJELGlCQUFpQjtRQUNWLGNBQVEsR0FBRyxFQUFFLENBQUM7UUFFckIsY0FBYztRQUNkLHNCQUFnQixHQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzlCLFlBQVk7UUFDWix1QkFBaUIsR0FBYSxFQUFFLENBQUM7UUFFakMsTUFBTTtRQUNOLGNBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsU0FBUztRQUNULGVBQVMsR0FBVyxDQUFDLENBQUM7UUFDdEIsYUFBYTtRQUNiLGlCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBRXhCLFFBQVE7UUFDUixVQUFJLEdBQVcsQ0FBQyxDQUFDO1FBRWpCLGFBQWE7UUFDYixpQkFBVyxHQUFXLENBQUMsQ0FBQzs7SUFJeEIsQ0FBQztJQUVELDhCQUFTLEdBQVQsVUFBVSxJQUFTO1FBQ2YsaUJBQU0sU0FBUyxZQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUdELHNCQUFJLGtDQUFVO1FBRGQscUNBQXFDO2FBQ3JDO1lBQ0ksWUFBWTtZQUNaLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN4QixPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUVELFdBQVc7WUFDWCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxFQUFFO2dCQUN0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QUNoRDthQUNKO1lBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7U0FDM0I7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFDTCxpQkFBQztBQUFELENBMWRBLEFBMGRDLENBMWR1QyxvQkFBVSxHQTBkakQ7O0FBQ1ksUUFBQSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gJy4uL21hbmFnZXIvRGVmaW5lJztcbmltcG9ydCB7IGV2ZW50TWFuYWdlciwgR2FtZUV2ZW50IH0gZnJvbSAnLi4vdXRpbC9FdmVudE1hbmFnZXInO1xuaW1wb3J0IE5ld1V0aWxzIGZyb20gJy4uL3V0aWwvTmV3VXRpbHMnO1xuaW1wb3J0IERhdGFNb2R1bGUgZnJvbSAnLi9EYXRhTW9kdWxlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZU1vZHVsZSBleHRlbmRzIERhdGFNb2R1bGUge1xuICAgIC8vIOeUqOaIt+eahOetueeggeanveS9jeaVsOaNriAxfjEwXG4gICAgcHVibGljIHNsb3REYXRhID0gW107XG5cbiAgICAvLyDlvZPliY3mraPlnKjpgInkuK3nmoTnrbnnoIHmp73kvY1cbiAgICBjdXJTZWxlY3RTbG90SWR4OiBudW1iZXIgPSAtMTtcbiAgICAvLyDlvZPliY3pgInkuK3nmoTnrbnnoIHkv6Hmga9cbiAgICBjdXJTZWxlY3RDb2luSWR4czogbnVtYmVyW10gPSBbXTtcblxuICAgIC8vIOenu+WKqOmUgVxuICAgIG1vdmVMb2NrOiBib29sZWFuID0gZmFsc2U7XG4gICAgLy8g5ZCI5oiQ5byV55So6K6h5pWwXG4gICAgbWVyZ2VMb2NrOiBudW1iZXIgPSAwO1xuICAgIC8vIOeUn+aIkOetueeggeaViOaenOW8leeUqOiuoeaVsFxuICAgIHByb2R1Y2VMb2NrOiBudW1iZXIgPSAwO1xuXG4gICAgLy8g5b2T5YmN5pif5pif5pWwXG4gICAgc3RhcjogbnVtYmVyID0gMDtcblxuICAgIC8vIOavj+WbnuWQiOmineWkluiOt+W+l+eahOasoeaVsFxuICAgIGV4dHJhQ2hhbmNlOiBudW1iZXIgPSAwO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcGFyc2VEYXRhKGRhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBzdXBlci5wYXJzZURhdGEoZGF0YSk7XG4gICAgICAgIHRoaXMuc2xvdERhdGEgPSBkYXRhLnNsb3REYXRhO1xuICAgICAgICB0aGlzLnN0YXIgPSBkYXRhLnN0YXI7XG4gICAgfVxuXG4gICAgLy8g5Lqk5LqS5pON5L2c55qE5qOA5rWL77yM5b2T5YmN5aaC5p6c5pyJ5q2j5Zyo5Y+R55Sf55qE5Lqk5LqS6KGM5Li677yM5YiZ5LiN5YWB6K646Kem5Y+R5pu05aSa55qE6KGM5Li6XG4gICAgZ2V0IGNhbk9wZXJhdGUoKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOato+WcqOacieenu+WKqOihjOS4uuWPkeeUn1xuICAgICAgICBpZiAodGhpcy5tb3ZlTG9jaykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+ato+WcqOi/m+ihjOenu+WKqOaTjeS9nCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5q2j5Zyo6L+b6KGM5ZCI5oiQ5pON5L2cXG4gICAgICAgIGlmICh0aGlzLm1lcmdlTG9jayAhPT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+ato+WcqOi/m+ihjOWQiOaIkOaTjeS9nCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvZHVjZUxvY2sgIT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmraPlnKjlj5HmlL7nrbnnoIHmk43kvZwnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiDpgJrov4fmp71pZCDojrflj5bnrKzkuIDkuKrmnInmlYjnmoTnrbnnoIHkv6Hmga9cbiAgICAgKiBAcGFyYW0gc2xvdElkeDog6ZyA6KaB6I635Y+W56ys5LiA5Liq5pyJ5pWI55qE562556CB5L+h5oGv55qE5qe9aWRcbiAgICAgKiBAcmV0dXJuIHZhaWxkTnVtOiDor6Xmp73kvY3nmoTmnInmlYjmlbDlrZfjgIF2YWlsZElkeDog5pyJ5pWI5pWw5a2X55qE57Si5byV44CBdmFpbGRTUGFjZTog5Ymp5L2Z5Y+v5a6557qz55qE562556CB56m66Ze0XG4gICAgICovXG4gICAgZ2V0Rmlyc3RWYWlsZE51bUJ5U2xvdElkeChzbG90SWR4OiBudW1iZXIpOiB7IHZhaWxkTnVtOiBudW1iZXIsIHZhaWxkSWR4OiBudW1iZXIsIHZhaWxkU3BhY2U6IG51bWJlciB9IHtcbiAgICAgICAgY29uc3Qgc2xvdERhdGEgPSB0aGlzLnNsb3REYXRhW3Nsb3RJZHhdO1xuXG4gICAgICAgIGxldCB2YWlsZE51bTogbnVtYmVyID0gLTE7XG4gICAgICAgIGxldCB2YWlsZElkeDogbnVtYmVyID0gLTE7XG4gICAgICAgIGxldCB2YWlsZFNwYWNlOiBudW1iZXIgPSAxMDtcblxuICAgICAgICBmb3IgKGxldCBpID0gOTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGlmIChzbG90RGF0YVtpXSA9PT0gMCkgY29udGludWU7XG5cbiAgICAgICAgICAgIHZhaWxkTnVtID0gc2xvdERhdGFbaV07XG4gICAgICAgICAgICB2YWlsZElkeCA9IGk7XG4gICAgICAgICAgICB2YWlsZFNwYWNlID0gOSAtIGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHZhaWxkTnVtLCB2YWlsZElkeCwgdmFpbGRTcGFjZSB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiDojrflj5blvZPliY3pgInkuK3nmoTlvoXnp7vliqjnmoTmp73kvY3nrbnnoIHkv6Hmga9cbiAgICAgKiBAcmV0dXJucyBzbG90SWR4OiDlvZPliY3pgInkuK3nmoTmp73kvY3ntKLlvJXjgIEgIGNudDog5b6F56e75Yqo55qE562556CB5pWw6YeP44CBICBudW06IOW+heenu+WKqOeahOaVsOWtl+exu+Wei1xuICAgICAqL1xuICAgIGdldEN1clNlbGVjdFNsb3RJbmZvKCk6IHsgc2xvdElkeDogbnVtYmVyLCBjbnQ6IG51bWJlciwgbnVtOiBudW1iZXIgfSB7XG4gICAgICAgIGlmICh0aGlzLmN1clNlbGVjdFNsb3RJZHggPT09IC0xKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgY250ID0gdGhpcy5jdXJTZWxlY3RDb2luSWR4cy5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG51bSA9IHRoaXMuc2xvdERhdGFbdGhpcy5jdXJTZWxlY3RTbG90SWR4XVt0aGlzLmN1clNlbGVjdENvaW5JZHhzWzBdXTtcbiAgICAgICAgcmV0dXJuIHsgc2xvdElkeDogdGhpcy5jdXJTZWxlY3RTbG90SWR4LCBjbnQsIG51bSB9O1xuICAgIH1cblxuICAgIC8vIOmHjee9ruW9k+WJjeetueeggemAieaLqeeKtuaAgVxuICAgIHJlc2V0U2VsZWN0U3RhdHVzKCk6IHZvaWQge1xuICAgICAgICBnYW1lTW9kdWxlLmN1clNlbGVjdFNsb3RJZHggPSAtMTtcbiAgICAgICAgZ2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4cyA9IFtdO1xuICAgIH1cblxuICAgIC8vIOetueeggeenu+WKqOWujOaIkO+8jOaVtOeQhuenu+WKqOWQjueahOaVsOaNrlxuICAgIHRpZHlTbG90RGF0YShlZDogeyB0YXJTbG90SWR4OiBudW1iZXIsIG51bVR5cGU6IG51bWJlciwgc3JjSWR4QXJyOiBudW1iZXJbXSwgdGFySWR4QXJyOiBudW1iZXJbXSB9KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWQuc3JjSWR4QXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnNsb3REYXRhW3RoaXMuY3VyU2VsZWN0U2xvdElkeF1bZWQuc3JjSWR4QXJyW2ldXSA9IDA7XG4gICAgICAgICAgICB0aGlzLnNsb3REYXRhW2VkLnRhclNsb3RJZHhdW2VkLnRhcklkeEFycltpXV0gPSBlZC5udW1UeXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5Yi35paw562556CB5pi+56S65oOF5Ya1XG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuTU9WRV9FTkQsIGVkKTtcblxuICAgICAgICAvLyDph43nva7lvZPliY3pgInkuK3nirbmgIFcbiAgICAgICAgdGhpcy5yZXNldFNlbGVjdFN0YXR1cygpO1xuXG4gICAgICAgIC8vIOajgOa1i+aYr+WQpuWPr+S7peWQiOaIkFxuICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLkNIRUNLX01FUkdFKTtcbiAgICB9XG5cbiAgICAvLyDmo4DmtYvmmK/lkKbmnInlj6/ku6XlkIjmiJDnmoTmp73kvY1cbiAgICBjaGVja0Nhbk1lcmdlKCk6IG51bWJlcltdIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjYW4gPSB0aGlzLmNoZWNrQ2FuTWVyZ2VCeVNsb3QoaSk7XG4gICAgICAgICAgICBpZiAoY2FuKSByZXN1bHQucHVzaChpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g6YCa6L+H5qe95L2N5p2l5qOA5rWL5piv5ZCm5Y+v5Lul6L+b6KGM5ZCI5oiQXG4gICAgY2hlY2tDYW5NZXJnZUJ5U2xvdChzbG90SWQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBzbG90RGF0YSA9IHRoaXMuc2xvdERhdGFbc2xvdElkXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoc2xvdERhdGFbaV0gPT09IDApIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChpID09PSAwKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmIChzbG90RGF0YVtpXSAhPT0gc2xvdERhdGFbaSAtIDFdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8g6I635Y+W5b2T5YmN5pyA5aSn5pWw5a2XXG4gICAgZ2V0TWF4VmFsdWUoKTogbnVtYmVyIHtcbiAgICAgICAgbGV0IG1heFZhbHVlID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNsb3REYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuc2xvdERhdGFbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zbG90RGF0YVtpXVtqXSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlID0gdGhpcy5zbG90RGF0YVtpXVtqXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXhWYWx1ZTtcbiAgICB9XG5cbiAgICAvLyDojrflj5blvZPliY3mnIDlsI/mlbDlrZdcbiAgICBnZXRNaW5WYWx1ZSgpOiBudW1iZXIge1xuICAgICAgICBsZXQgbWluVmFsdWUgPSAtMTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNsb3REYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuc2xvdERhdGFbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAobWluVmFsdWUgPT09IC0xICYmIHRoaXMuc2xvdERhdGFbaV1bal0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWluVmFsdWUgPSB0aGlzLnNsb3REYXRhW2ldW2pdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zbG90RGF0YVtpXVtqXSA8IG1pblZhbHVlICYmIHRoaXMuc2xvdERhdGFbaV1bal0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWluVmFsdWUgPSB0aGlzLnNsb3REYXRhW2ldW2pdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pblZhbHVlO1xuICAgIH1cblxuICAgIGdldFNwYWNlQnlTbG90KGlkOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBpZiAoIXRoaXMuc2xvdERhdGFbaWRdKSByZXR1cm47XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zbG90RGF0YVtpZF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNsb3REYXRhW2lkXVtpXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxMCAtIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvLyDojrflj5blvZPliY3liankvZnnqbrpl7RcbiAgICBnZXRTcGFjZSgpOiBudW1iZXIge1xuICAgICAgICBsZXQgc3BhY2UgPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgc3BhY2UgKz0gdGhpcy5nZXRTcGFjZUJ5U2xvdChpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3BhY2U7XG4gICAgfVxuXG4gICAgLy9UT0RPOiDnlJ/miJDmlrDnmoTnrbnnoIHmlbDmja4g77yI5pyN5Yqh5Zmo6YC76L6R77yJXG4gICAgcHJvZHVjZU5ld0NvaW5EYXRhKCk6IG51bWJlcltdW10ge1xuICAgICAgICBjb25zdCBtYXhWYWx1ZSA9IHRoaXMuZ2V0TWF4VmFsdWUoKTtcbiAgICAgICAgY29uc3Qgc3BhY2UgPSB0aGlzLmdldFNwYWNlKCk7XG5cbiAgICAgICAgaWYgKG1heFZhbHVlID49IDE1KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ+W9k+WJjeW3suWQiOaIkDE1Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3BhY2UgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybign5rKh5pyJ5Ymp5L2Z56m66Ze077yM5peg5rOV55Sf5oiQ5paw5pWw5a2XJylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXhWYWx1ZSA8IDUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2R1Y2VTdHJhdGVneU9uZShtYXhWYWx1ZSwgc3BhY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKG1heFZhbHVlIDwgMTApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2R1Y2VTdHJhdGVneVR3byhtYXhWYWx1ZSwgc3BhY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKG1heFZhbHVlIDwgMTQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2R1Y2VTdHJhdGVneVRocmVlKG1heFZhbHVlLCBzcGFjZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobWF4VmFsdWUgPCAxNSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvZHVjZVN0cmF0ZWd5Rm91cihtYXhWYWx1ZSwgc3BhY2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIOWwj+S6jjUg562W55WlXG4gICAgICogMeOAgeeUn+aIkOaVsOmHjyBtaW4oc3BhY2UqMzAsOCk7XG4gICAgICogMuOAgeeUn+aIkOexu+WeiyA8PSAzXG4gICAgICogM+OAgeacgOWwj+aVsCA9IOW9k+WJjeWcuuaZr+acgOWwj+aVsC0xXG4gICAgICogXG4gICAgICogQHBhcmFtIG1heDog5b2T5YmN5Zy65pmv5Lit5pyA5aSn55qE562556CB5pWw5YC8XG4gICAgICogQHBhcmFtIHNwYWNlOiDlvZPliY3mgLvnmoTnqbrpl7TmlbBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcm9kdWNlU3RyYXRlZ3lPbmUobWF4OiBudW1iZXIsIHNwYWNlOiBudW1iZXIpOiBudW1iZXJbXVtdIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+etlueVpTE6PDUnKTtcbiAgICAgICAgLy8g5Zy65pmv5Lit5pyA5bCP5YC8XG4gICAgICAgIGxldCBtaW4gPSBNYXRoLm1pbigxLCB0aGlzLmdldE1pblZhbHVlKCkpO1xuXG4gICAgICAgIC8vIOaAu+WFsemcgOimgeeUn+aIkOeahOaVsOWtl+aVsOmHj1xuICAgICAgICBsZXQgdG90YWxDbnQgPSBNYXRoLmZsb29yKE1hdGgubWluKDI1LCBzcGFjZSAqIDAuNikpO1xuICAgICAgICBpZiAodG90YWxDbnQgPT09IDApIHRvdGFsQ250ID0gMTtcblxuICAgICAgICAvLyDmlrDnlJ/miJDnmoTmlbDlrZfnsbvlnovpmZDlrprlnKjmr5TlvZPliY3lnLrmma/kuK3mnIDlpKfnmoTmlbDlrZflsI8xXG4gICAgICAgIGNvbnN0IGxpbWl0TWF4ID0gbWF4IC0gMSA+IDAgPyBtYXggLSAxIDogMTtcblxuICAgICAgICAvLyDnlJ/miJDmlbDlrZfnmoTnsbvlnovmlbDph48gMeOAgTLjgIEz44CBNFxuICAgICAgICBsZXQgdHlwZUNudCA9IHRvdGFsQ250ID49IDQgPyA0IDogdG90YWxDbnQ7XG4gICAgICAgIHR5cGVDbnQgPSBNYXRoLm1pbih0eXBlQ250LCBsaW1pdE1heCAtIG1pbiArIDEpO1xuXG4gICAgICAgIC8vIOaVsOWtl+enjeexu1xuICAgICAgICBjb25zdCB0eXBlcyA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21TZWN0aW9uKHR5cGVDbnQsIG1pbiwgbGltaXRNYXgpO1xuXG4gICAgICAgIC8vIOeUn+aIkOWFqOmDqOeahOmaj+acuuetueeggeWAvFxuICAgICAgICBsZXQgYWxsTmV3Q29pbiA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21BcnIodG90YWxDbnQsIHR5cGVzKTtcblxuICAgICAgICAvLyDnoa7lrprlvZPliY3nmoTliankvZnnqbrpl7Tmg4XlhrVcbiAgICAgICAgbGV0IHNwYWNlSW5mbyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGVyU2xvdFNwYWNlID0gdGhpcy5nZXRTcGFjZUJ5U2xvdChpKTtcbiAgICAgICAgICAgIHNwYWNlSW5mby5wdXNoKHBlclNsb3RTcGFjZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpmo/mnLrlsIblt7Lnu4/nlJ/miJDnmoTmlbDlrZfloavlhYXliLDnm7jlupTnmoTnqbrkvY3nva7lpIQo5LiA5a6a5piv5Y+v5Lul5pS+5b6X5LiL55qE77yM5Ymp5L2Z56m66Ze0Pj3nlJ/miJDnmoTmlbDlrZfmlbDph48pXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtbXSwgW10sIFtdLCBbXSwgW10sIFtdLCBbXSwgW11dO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBzbG90SWR4ID0gTmV3VXRpbHMucmFuZG9tSW50SW5jbHVzaXZlKDAsIDcpO1xuICAgICAgICAgICAgaWYgKHNwYWNlSW5mb1tzbG90SWR4XSA9PT0gMCkgY29udGludWU7XG5cbiAgICAgICAgICAgIHJlc3VsdFtzbG90SWR4XS5wdXNoKGFsbE5ld0NvaW4uc2hpZnQoKSk7XG4gICAgICAgICAgICBzcGFjZUluZm9bc2xvdElkeF0tLTtcbiAgICAgICAgfSB3aGlsZSAoYWxsTmV3Q29pbi5sZW5ndGggPiAwKVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g5bCP5LqOMTDnmoTnrZbnlaVcbiAgICBwcm9kdWNlU3RyYXRlZ3lUd28obWF4OiBudW1iZXIsIHNwYWNlOiBudW1iZXIpOiBudW1iZXJbXVtdIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+etlueVpTI6NTw9eDwxMCcpO1xuXG4gICAgICAgIC8vIOWcuuaZr+S4reacgOWwj+WAvFxuICAgICAgICBsZXQgbWluID0gTWF0aC5taW4oMywgdGhpcy5nZXRNaW5WYWx1ZSgpKTtcblxuICAgICAgICAvLyDmgLvlhbHpnIDopoHnlJ/miJDnmoTmlbDlrZfmlbDph49cbiAgICAgICAgbGV0IHRvdGFsQ250ID0gTWF0aC5mbG9vcihNYXRoLm1pbigyMiwgc3BhY2UgKiAwLjYpKTtcbiAgICAgICAgaWYgKHRvdGFsQ250ID09PSAwKSB0b3RhbENudCA9IDE7XG5cbiAgICAgICAgLy8g5pyA5aSn5YC8IDdcbiAgICAgICAgY29uc3QgbGltaXRNYXggPSBNYXRoLm1pbihtYXggLSAxLCA3KTtcblxuICAgICAgICAvLyDnlJ/miJDmlbDlrZfnmoTnsbvlnovmlbDph48o5pei5LiN6IO96LaF6L+H5Y+v55Sf5oiQ55qE5oC75pWw6YeP77yM5Lmf5LiN6IO96LaF6L+H5b2T5YmN5YWB6K645Ye6546w55qE57G75Z6L5LiK6ZmQKVxuICAgICAgICBsZXQgdHlwZUNudCA9IHRvdGFsQ250ID49IDMgPyAzIDogdG90YWxDbnQ7XG4gICAgICAgIHR5cGVDbnQgPSBNYXRoLm1pbih0eXBlQ250LCBsaW1pdE1heCAtIG1pbiArIDEpO1xuXG4gICAgICAgIC8vIOWunumZheeUn+aIkOeahOenjeexu1xuICAgICAgICBjb25zdCB0eXBlcyA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21TZWN0aW9uKHR5cGVDbnQsIG1pbiwgbGltaXRNYXgpO1xuXG4gICAgICAgIC8vIOeUn+aIkOWFqOmDqOeahOmaj+acuuetueeggeWAvFxuICAgICAgICBsZXQgYWxsTmV3Q29pbiA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21BcnIodG90YWxDbnQsIHR5cGVzKTtcblxuICAgICAgICAvLyDnoa7lrprlvZPliY3nmoTliankvZnnqbrpl7Tmg4XlhrVcbiAgICAgICAgbGV0IHNwYWNlSW5mbyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGVyU2xvdFNwYWNlID0gdGhpcy5nZXRTcGFjZUJ5U2xvdChpKTtcbiAgICAgICAgICAgIHNwYWNlSW5mby5wdXNoKHBlclNsb3RTcGFjZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpmo/mnLrlsIblt7Lnu4/nlJ/miJDnmoTmlbDlrZfloavlhYXliLDnm7jlupTnmoTnqbrkvY3nva7lpIQo5LiA5a6a5piv5Y+v5Lul5pS+5b6X5LiL55qE77yM5Ymp5L2Z56m66Ze0Pj3nlJ/miJDnmoTmlbDlrZfmlbDph48pXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtbXSwgW10sIFtdLCBbXSwgW10sIFtdLCBbXSwgW11dO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBzbG90SWR4ID0gTmV3VXRpbHMucmFuZG9tSW50SW5jbHVzaXZlKDAsIDcpO1xuICAgICAgICAgICAgaWYgKHNwYWNlSW5mb1tzbG90SWR4XSA9PT0gMCkgY29udGludWU7XG5cbiAgICAgICAgICAgIHJlc3VsdFtzbG90SWR4XS5wdXNoKGFsbE5ld0NvaW4uc2hpZnQoKSk7XG4gICAgICAgICAgICBzcGFjZUluZm9bc2xvdElkeF0tLTtcbiAgICAgICAgfSB3aGlsZSAoYWxsTmV3Q29pbi5sZW5ndGggPiAwKVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICB9XG5cbiAgICAvLyDlsI/kuo4xNOeahOetlueVpVxuICAgIHByb2R1Y2VTdHJhdGVneVRocmVlKG1heDogbnVtYmVyLCBzcGFjZTogbnVtYmVyKTogbnVtYmVyW11bXSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfnrZbnlaUzOiAxMDx4PDE0Jyk7XG5cbiAgICAgICAgLy8g5Zy65pmv5Lit5pyA5bCP5YC8XG4gICAgICAgIGxldCBtaW4gPSBNYXRoLm1pbig4LCB0aGlzLmdldE1pblZhbHVlKCkpO1xuXG4gICAgICAgIC8vIOaAu+WFsemcgOimgeeUn+aIkOeahOaVsOWtl+aVsOmHj1xuICAgICAgICBsZXQgdG90YWxDbnQgPSBNYXRoLmZsb29yKE1hdGgubWluKDIwLCBzcGFjZSAqIDAuNikpO1xuICAgICAgICBpZiAodG90YWxDbnQgPT09IDApIHRvdGFsQ250ID0gMTtcblxuICAgICAgICAvLyDmnIDlpKflgLwgOX4xMVxuICAgICAgICBjb25zdCBsaW1pdE1heCA9IE1hdGgubWluKG1heCAtIDEsIDExKTtcblxuICAgICAgICAvLyDnlJ/miJDmlbDlrZfnmoTnsbvlnovmlbDph48o5pei5LiN6IO96LaF6L+H5Y+v55Sf5oiQ55qE5oC75pWw6YeP77yM5Lmf5LiN6IO96LaF6L+H5b2T5YmN5YWB6K645Ye6546w55qE57G75Z6L5LiK6ZmQKVxuICAgICAgICBsZXQgdHlwZUNudCA9IHRvdGFsQ250ID49IDMgPyAzIDogdG90YWxDbnQ7XG4gICAgICAgIHR5cGVDbnQgPSBNYXRoLm1pbih0eXBlQ250LCBsaW1pdE1heCAtIG1pbiArIDEpO1xuXG4gICAgICAgIC8vIOaVsOWtl+enjeexu1xuICAgICAgICBjb25zdCB0eXBlcyA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21TZWN0aW9uKHR5cGVDbnQsIG1pbiwgbGltaXRNYXgpO1xuXG4gICAgICAgIC8vIOeUn+aIkOWFqOmDqOeahOmaj+acuuetueeggeWAvFxuICAgICAgICBsZXQgYWxsTmV3Q29pbiA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21BcnIodG90YWxDbnQsIHR5cGVzKTtcblxuICAgICAgICAvLyDnoa7lrprlvZPliY3nmoTliankvZnnqbrpl7Tmg4XlhrVcbiAgICAgICAgbGV0IHNwYWNlSW5mbyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGVyU2xvdFNwYWNlID0gdGhpcy5nZXRTcGFjZUJ5U2xvdChpKTtcbiAgICAgICAgICAgIHNwYWNlSW5mby5wdXNoKHBlclNsb3RTcGFjZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpmo/mnLrlsIblt7Lnu4/nlJ/miJDnmoTmlbDlrZfloavlhYXliLDnm7jlupTnmoTnqbrkvY3nva7lpIQo5LiA5a6a5piv5Y+v5Lul5pS+5b6X5LiL55qE77yM5Ymp5L2Z56m66Ze0Pj3nlJ/miJDnmoTmlbDlrZfmlbDph48pXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtbXSwgW10sIFtdLCBbXSwgW10sIFtdLCBbXSwgW11dO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBzbG90SWR4ID0gTmV3VXRpbHMucmFuZG9tSW50SW5jbHVzaXZlKDAsIDcpO1xuICAgICAgICAgICAgaWYgKHNwYWNlSW5mb1tzbG90SWR4XSA9PT0gMCkgY29udGludWU7XG5cbiAgICAgICAgICAgIHJlc3VsdFtzbG90SWR4XS5wdXNoKGFsbE5ld0NvaW4uc2hpZnQoKSk7XG4gICAgICAgICAgICBzcGFjZUluZm9bc2xvdElkeF0tLTtcbiAgICAgICAgfSB3aGlsZSAoYWxsTmV3Q29pbi5sZW5ndGggPiAwKVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g5bCP5LqOMTXnmoTnrZbnlaVcbiAgICBwcm9kdWNlU3RyYXRlZ3lGb3VyKG1heDogbnVtYmVyLCBzcGFjZTogbnVtYmVyKTogbnVtYmVyW11bXSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfnrZbnlaUxOjwxNScpO1xuXG4gICAgICAgIC8vIOWcuuaZr+S4reacgOWwj+WAvFxuICAgICAgICBsZXQgbWluID0gTWF0aC5taW4oMTEsIHRoaXMuZ2V0TWluVmFsdWUoKSk7XG5cbiAgICAgICAgLy8g5oC75YWx6ZyA6KaB55Sf5oiQ55qE5pWw5a2X5pWw6YePXG4gICAgICAgIGxldCB0b3RhbENudCA9IE1hdGguZmxvb3IoTWF0aC5taW4oMjUsIHNwYWNlICogMC44KSk7XG4gICAgICAgIGlmICh0b3RhbENudCA9PT0gMCkgdG90YWxDbnQgPSAxO1xuXG4gICAgICAgIC8vIOacgOWkp+WAvDExfjEzXG4gICAgICAgIGNvbnN0IGxpbWl0TWF4ID0gTWF0aC5taW4obWF4IC0gMSwgMTEpO1xuXG4gICAgICAgIC8vIOeUn+aIkOaVsOWtl+eahOexu+Wei+aVsOmHjyBtaW5+OVxuICAgICAgICBsZXQgdHlwZUNudCA9IHRvdGFsQ250ID49IDMgPyAzIDogdG90YWxDbnQ7XG5cbiAgICAgICAgLy8g5pWw5a2X56eN57G7XG4gICAgICAgIGNvbnN0IHR5cGVzID0gTmV3VXRpbHMucmFuZG9tSW50QXJyRnJvbVNlY3Rpb24odHlwZUNudCwgbWluLCBsaW1pdE1heCk7XG5cbiAgICAgICAgLy8g55Sf5oiQ5YWo6YOo55qE6ZqP5py6562556CB5YC8XG4gICAgICAgIGxldCBhbGxOZXdDb2luID0gTmV3VXRpbHMucmFuZG9tSW50QXJyRnJvbUFycih0b3RhbENudCwgdHlwZXMpO1xuXG4gICAgICAgIC8vIOehruWumuW9k+WJjeeahOWJqeS9meepuumXtOaDheWGtVxuICAgICAgICBsZXQgc3BhY2VJbmZvID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwZXJTbG90U3BhY2UgPSB0aGlzLmdldFNwYWNlQnlTbG90KGkpO1xuICAgICAgICAgICAgc3BhY2VJbmZvLnB1c2gocGVyU2xvdFNwYWNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmaj+acuuWwhuW3sue7j+eUn+aIkOeahOaVsOWtl+Whq+WFheWIsOebuOW6lOeahOepuuS9jee9ruWkhCjkuIDlrprmmK/lj6/ku6XmlL7lvpfkuIvnmoTvvIzliankvZnnqbrpl7Q+PeeUn+aIkOeahOaVsOWtl+aVsOmHjylcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW1tdLCBbXSwgW10sIFtdLCBbXSwgW10sIFtdLCBbXV07XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNvbnN0IHNsb3RJZHggPSBOZXdVdGlscy5yYW5kb21JbnRJbmNsdXNpdmUoMCwgNyk7XG4gICAgICAgICAgICBpZiAoc3BhY2VJbmZvW3Nsb3RJZHhdID09PSAwKSBjb250aW51ZTtcblxuICAgICAgICAgICAgcmVzdWx0W3Nsb3RJZHhdLnB1c2goYWxsTmV3Q29pbi5zaGlmdCgpKTtcbiAgICAgICAgICAgIHNwYWNlSW5mb1tzbG90SWR4XS0tO1xuICAgICAgICB9IHdoaWxlIChhbGxOZXdDb2luLmxlbmd0aCA+IDApXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiDmlrDnlJ/miJDnmoTmlbDmja7lkozljp/mnInmlbDmja7ov5vooYzlkIjmiJBcbiAgICBtZXJnZVByb2R1Y2VEYXRhKG5ld0RhdGE6IG51bWJlcltdW10pOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgc2xvdElkeCA9IDA7IHNsb3RJZHggPCA4OyBzbG90SWR4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Nsb3REYXRhID0gTmV3VXRpbHMuZGVlcENsb25lKG5ld0RhdGFbc2xvdElkeF0pO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2xvdERhdGFbc2xvdElkeF1bal0gPT09IDAgJiYgbmV3U2xvdERhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdDb2luRGF0YSA9IG5ld1Nsb3REYXRhLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2xvdERhdGFbc2xvdElkeF1bal0gPSBuZXdDb2luRGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFRPRE86IOais+eQhuaji+ebmOaVsOaNrijmnI3liqHlmajpgLvovpEpXG4gICAgICogQGRlc2NyaXB0aW9uOiDkv53nlZnlnLrmma/kuK3mnIDlpKfnmoQ45Liq56eN57G75pWw77yM5q+P56eN5pWw5pyA5aSa5L+d55WZMTDkuKrvvIzlhbbkvZnpg73miZTmjolcbiAgICAgKi9cbiAgICB0aWR5RGF0YSgpOiB2b2lkIHtcbiAgICAgICAgLy8gMeOAgeiusOW9leavj+enjeexu+Wei+aVsOWtl+eahOaMgeacieaAu+aVsFxuICAgICAgICBjb25zdCBkYXRhTWFwID0ge307XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zbG90RGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2xvdERhdGFbaV1bal0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFNYXBbYCR7dGhpcy5zbG90RGF0YVtpXVtqXX1gXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YU1hcFtgJHt0aGlzLnNsb3REYXRhW2ldW2pdfWBdICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhTWFwW2Ake3RoaXMuc2xvdERhdGFbaV1bal19YF0gPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdkYXRhTWFwOicsIGRhdGFNYXApO1xuXG4gICAgICAgIC8vIDLjgIHmoLnmja7mr4/np43mlbDlrZfnsbvlnovvvIzliJvlu7rkuIDkuKrplb/luqbkuLoxMOeahOexu+Wei++8jOaVsOmHj+S4jei2szEw6KGl6LazMFxuICAgICAgICBjb25zdCBhbGxEYXRhOiBudW1iZXJbXVtdID0gW107XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGRhdGFNYXApIHtcbiAgICAgICAgICAgIGlmIChkYXRhTWFwW2tleV0gPiAxMCkge1xuICAgICAgICAgICAgICAgIGRhdGFNYXBba2V5XSA9IDEwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwZXJUeXBlRGF0YSA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPD0gZGF0YU1hcFtrZXldIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICBwZXJUeXBlRGF0YS5wdXNoKE51bWJlcihrZXkpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwZXJUeXBlRGF0YS5wdXNoKDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWxsRGF0YS5wdXNoKHBlclR5cGVEYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDPjgIHlsIbmiYDmnInnsbvlnovnmoTmlbDnu4Tku47lpKfliLDlsI/mnInluo/mjpLliJdcbiAgICAgICAgYWxsRGF0YS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYlswXSAtIGFbMF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOacgOe7iOagh+WHhuagvOW8j+WMllxuICAgICAgICBpZiAoYWxsRGF0YS5sZW5ndGggPiA4KSB7XG4gICAgICAgICAgICAvLyDnsbvlnovotoXov4c456eNIOWPluWJjeWFq1xuICAgICAgICAgICAgdGhpcy5zbG90RGF0YSA9IGFsbERhdGEuc2xpY2UoMCwgNyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDkuI3otrM456eN77yM6KGl6LazOOenjVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoYWxsRGF0YS5sZW5ndGggPD0gaSkge1xuICAgICAgICAgICAgICAgICAgICBhbGxEYXRhLnB1c2goWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2xvdERhdGEgPSBhbGxEYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ+aVtOeQhuWQjueahHNsb3REYXRhOicsIGFsbERhdGEsIHRoaXMuc2xvdERhdGEpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBnYW1lTW9kdWxlID0gbmV3IEdhbWVNb2R1bGUoKTtcbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/pulicCom/TouchEffect.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ba1070sT7NPqKINxiKgj14u', 'TouchEffect');
// script/merge/pulicCom/TouchEffect.ts

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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var TouchEffect = /** @class */ (function (_super) {
    __extends(TouchEffect, _super);
    function TouchEffect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.scaleTime = 0.07;
        _this.initScaleX = 1;
        _this.initScaleY = 1;
        _this.dS = 0.9;
        return _this;
        // update (dt) {}
    }
    TouchEffect.prototype.onLoad = function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    };
    TouchEffect.prototype.start = function () {
        this.initScaleX = this.node.scaleX;
        this.initScaleY = this.node.scaleY;
        cc.tween(this.node).stop();
    };
    TouchEffect.prototype.onTouchStart = function () {
        var tarScaleX = this.node.scaleX * 0.9;
        var tarScaleY = this.node.scaleY * 0.9;
        cc.tween(this.node)
            .to(this.scaleTime, { scaleX: tarScaleX, scaleY: tarScaleY })
            .to(this.scaleTime, { scaleX: this.initScaleX, scaleY: this.initScaleY })
            .start();
    };
    TouchEffect.prototype.onTouchEnd = function () {
        cc.tween(this.node)
            .to(this.scaleTime, { scaleX: this.initScaleX, scaleY: this.initScaleY })
            .start();
    };
    __decorate([
        property()
    ], TouchEffect.prototype, "scaleTime", void 0);
    TouchEffect = __decorate([
        ccclass
    ], TouchEffect);
    return TouchEffect;
}(cc.Component));
exports.default = TouchEffect;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvcHVsaWNDb20vVG91Y2hFZmZlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU0sSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFHNUM7SUFBeUMsK0JBQVk7SUFBckQ7UUFBQSxxRUFvQ0M7UUFsQ1csZUFBUyxHQUFXLElBQUksQ0FBQztRQUV6QixnQkFBVSxHQUFHLENBQUMsQ0FBQztRQUNmLGdCQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRWYsUUFBRSxHQUFHLEdBQUcsQ0FBQzs7UUE0QmpCLGlCQUFpQjtJQUNyQixDQUFDO0lBM0JHLDRCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxvRUFBb0U7SUFDeEUsQ0FBQztJQUVELDJCQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDbkMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVELGtDQUFZLEdBQVo7UUFDSSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDekMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ3pDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNkLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7YUFDNUQsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ3hFLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxnQ0FBVSxHQUFWO1FBQ0ksRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2QsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ3hFLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUEvQkQ7UUFEQyxRQUFRLEVBQUU7a0RBQ3NCO0lBRmhCLFdBQVc7UUFEL0IsT0FBTztPQUNhLFdBQVcsQ0FvQy9CO0lBQUQsa0JBQUM7Q0FwQ0QsQUFvQ0MsQ0FwQ3dDLEVBQUUsQ0FBQyxTQUFTLEdBb0NwRDtrQkFwQ29CLFdBQVciLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG91Y2hFZmZlY3QgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIEBwcm9wZXJ0eSgpXG4gICAgcHJpdmF0ZSBzY2FsZVRpbWU6IG51bWJlciA9IDAuMDc7XG5cbiAgICBwcml2YXRlIGluaXRTY2FsZVggPSAxO1xuICAgIHByaXZhdGUgaW5pdFNjYWxlWSA9IDE7XG5cbiAgICBwcml2YXRlIGRTID0gMC45O1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIHRoaXMub25Ub3VjaFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgLy8gdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vblRvdWNoRW5kLCB0aGlzKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5pbml0U2NhbGVYID0gdGhpcy5ub2RlLnNjYWxlWDtcbiAgICAgICAgdGhpcy5pbml0U2NhbGVZID0gdGhpcy5ub2RlLnNjYWxlWTtcbiAgICAgICAgY2MudHdlZW4odGhpcy5ub2RlKS5zdG9wKCk7XG4gICAgfVxuXG4gICAgb25Ub3VjaFN0YXJ0KCkge1xuICAgICAgICBjb25zdCB0YXJTY2FsZVggPSB0aGlzLm5vZGUuc2NhbGVYICogMC45O1xuICAgICAgICBjb25zdCB0YXJTY2FsZVkgPSB0aGlzLm5vZGUuc2NhbGVZICogMC45O1xuICAgICAgICBjYy50d2Vlbih0aGlzLm5vZGUpXG4gICAgICAgICAgICAudG8odGhpcy5zY2FsZVRpbWUsIHsgc2NhbGVYOiB0YXJTY2FsZVgsIHNjYWxlWTogdGFyU2NhbGVZIH0pXG4gICAgICAgICAgICAudG8odGhpcy5zY2FsZVRpbWUsIHsgc2NhbGVYOiB0aGlzLmluaXRTY2FsZVgsIHNjYWxlWTogdGhpcy5pbml0U2NhbGVZIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBvblRvdWNoRW5kKCkge1xuICAgICAgICBjYy50d2Vlbih0aGlzLm5vZGUpXG4gICAgICAgICAgICAudG8odGhpcy5zY2FsZVRpbWUsIHsgc2NhbGVYOiB0aGlzLmluaXRTY2FsZVgsIHNjYWxlWTogdGhpcy5pbml0U2NhbGVZIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgKGR0KSB7fVxufVxuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/util/NewUtils.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '85100MR3/pMT5YtpOTF2CAl', 'NewUtils');
// script/merge/util/NewUtils.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NewUtils = /** @class */ (function () {
    function NewUtils() {
    }
    /**
     * 深拷贝
     * @example
     * let src = { a: 123, b: { c: [1, 2, 3], d: "ceshi" } };
     * let tar = Util.deepClone(src);
     * tar.b.c[0] = 2;
     * console.log(`obj:`, tar, `src:`, src);
     */
    NewUtils.deepClone = function (obj, cache) {
        if (cache === void 0) { cache = new WeakMap(); }
        // 普通类型，直接返回
        if (typeof obj !== 'object')
            return obj;
        if (obj === null)
            return obj;
        // 防止循环引用，程序进入死循环
        if (cache.get(obj))
            return cache.get(obj);
        if (obj instanceof Date)
            return new Date(obj);
        if (obj instanceof RegExp)
            return new RegExp(obj);
        // 找到所属原型上的constructor，所属原型上的constructor指向当前对象的构造函数
        var cloneObj = new obj.constructor();
        // 缓存拷贝的对象，用于处理循环引用的情况
        cache.set(obj, cloneObj);
        for (var key in obj) {
            if (obj[key]) {
                cloneObj[key] = this.deepClone(obj[key], cache); // 递归拷贝
            }
        }
        return cloneObj;
    };
    NewUtils.randomIntInclusive = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    // 去重 - 随机生成指定数量指定区间的数组
    NewUtils.randomIntArrFromSection = function (cnt, min, max) {
        var result = [];
        do {
            var v = this.randomIntInclusive(min, max);
            if (result.indexOf(v) === -1) {
                result.push(v);
            }
        } while (result.length < cnt);
        return result;
    };
    // 不去重 - 随机生成指定数量指定区间的数组
    NewUtils.randomIntArrInclusive = function (cnt, min, max) {
        var result = [];
        do {
            result.push(this.randomIntInclusive(min, max));
        } while (result.length < cnt);
        return result;
    };
    // 从给定的数组中随机生成一组指定数量的数组
    NewUtils.randomIntArrFromArr = function (cnt, srcArr) {
        var result = [];
        do {
            var index = this.randomIntInclusive(0, srcArr.length - 1);
            result.push(srcArr[index]);
        } while (result.length < cnt);
        return result;
    };
    return NewUtils;
}());
exports.default = NewUtils;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9OZXdVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0lBQUE7SUFxRUEsQ0FBQztJQXBFRzs7Ozs7OztPQU9HO0lBQ0ksa0JBQVMsR0FBaEIsVUFBaUIsR0FBRyxFQUFFLEtBQXFCO1FBQXJCLHNCQUFBLEVBQUEsWUFBWSxPQUFPLEVBQUU7UUFDdkMsWUFBWTtRQUNaLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUTtZQUFFLE9BQU8sR0FBRyxDQUFDO1FBQ3hDLElBQUksR0FBRyxLQUFLLElBQUk7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUU3QixpQkFBaUI7UUFDakIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxJQUFJLEdBQUcsWUFBWSxJQUFJO1lBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxJQUFJLEdBQUcsWUFBWSxNQUFNO1lBQUUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVsRCxtREFBbUQ7UUFDbkQsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkMsc0JBQXNCO1FBQ3RCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pCLEtBQUssSUFBTSxHQUFHLElBQUksR0FBRyxFQUFFO1lBQ25CLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNWLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU87YUFDM0Q7U0FDSjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTSwyQkFBa0IsR0FBekIsVUFBMEIsR0FBRyxFQUFFLEdBQUc7UUFDOUIsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDN0QsQ0FBQztJQUVELHVCQUF1QjtJQUNoQixnQ0FBdUIsR0FBOUIsVUFBK0IsR0FBVyxFQUFFLEdBQVcsRUFBRSxHQUFXO1FBQ2hFLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNsQixHQUFHO1lBQ0MsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM1QyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEI7U0FDSixRQUFRLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1FBRTlCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCx3QkFBd0I7SUFDakIsOEJBQXFCLEdBQTVCLFVBQTZCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztRQUN0QyxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsR0FBRztZQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2xELFFBQVEsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7UUFDOUIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELHVCQUF1QjtJQUNoQiw0QkFBbUIsR0FBMUIsVUFBMkIsR0FBRyxFQUFFLE1BQU07UUFDbEMsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEdBQUc7WUFDQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM5QixRQUFRLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1FBQzlCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTCxlQUFDO0FBQUQsQ0FyRUEsQUFxRUMsSUFBQSIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ld1V0aWxzIHtcbiAgICAvKipcbiAgICAgKiDmt7Hmi7fotJ1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGxldCBzcmMgPSB7IGE6IDEyMywgYjogeyBjOiBbMSwgMiwgM10sIGQ6IFwiY2VzaGlcIiB9IH07XG4gICAgICogbGV0IHRhciA9IFV0aWwuZGVlcENsb25lKHNyYyk7XG4gICAgICogdGFyLmIuY1swXSA9IDI7XG4gICAgICogY29uc29sZS5sb2coYG9iajpgLCB0YXIsIGBzcmM6YCwgc3JjKTtcbiAgICAgKi9cbiAgICBzdGF0aWMgZGVlcENsb25lKG9iaiwgY2FjaGUgPSBuZXcgV2Vha01hcCgpKSB7XG4gICAgICAgIC8vIOaZrumAmuexu+Wei++8jOebtOaOpei/lOWbnlxuICAgICAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHJldHVybiBvYmo7XG4gICAgICAgIGlmIChvYmogPT09IG51bGwpIHJldHVybiBvYmo7XG5cbiAgICAgICAgLy8g6Ziy5q2i5b6q546v5byV55So77yM56iL5bqP6L+b5YWl5q275b6q546vXG4gICAgICAgIGlmIChjYWNoZS5nZXQob2JqKSkgcmV0dXJuIGNhY2hlLmdldChvYmopO1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuIG5ldyBEYXRlKG9iaik7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiBuZXcgUmVnRXhwKG9iaik7XG5cbiAgICAgICAgLy8g5om+5Yiw5omA5bGe5Y6f5Z6L5LiK55qEY29uc3RydWN0b3LvvIzmiYDlsZ7ljp/lnovkuIrnmoRjb25zdHJ1Y3RvcuaMh+WQkeW9k+WJjeWvueixoeeahOaehOmAoOWHveaVsFxuICAgICAgICBjb25zdCBjbG9uZU9iaiA9IG5ldyBvYmouY29uc3RydWN0b3IoKTtcbiAgICAgICAgLy8g57yT5a2Y5ou36LSd55qE5a+56LGh77yM55So5LqO5aSE55CG5b6q546v5byV55So55qE5oOF5Ya1XG4gICAgICAgIGNhY2hlLnNldChvYmosIGNsb25lT2JqKTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqW2tleV0pIHtcbiAgICAgICAgICAgICAgICBjbG9uZU9ialtrZXldID0gdGhpcy5kZWVwQ2xvbmUob2JqW2tleV0sIGNhY2hlKTsgLy8g6YCS5b2S5ou36LSdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2xvbmVPYmo7XG4gICAgfVxuXG4gICAgc3RhdGljIHJhbmRvbUludEluY2x1c2l2ZShtaW4sIG1heCkge1xuICAgICAgICBtaW4gPSBNYXRoLmNlaWwobWluKTtcbiAgICAgICAgbWF4ID0gTWF0aC5mbG9vcihtYXgpO1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgICB9XG5cbiAgICAvLyDljrvph40gLSDpmo/mnLrnlJ/miJDmjIflrprmlbDph4/mjIflrprljLrpl7TnmoTmlbDnu4RcbiAgICBzdGF0aWMgcmFuZG9tSW50QXJyRnJvbVNlY3Rpb24oY250OiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlcltdIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnJhbmRvbUludEluY2x1c2l2ZShtaW4sIG1heCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YodikgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKHJlc3VsdC5sZW5ndGggPCBjbnQpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g5LiN5Y676YeNIC0g6ZqP5py655Sf5oiQ5oyH5a6a5pWw6YeP5oyH5a6a5Yy66Ze055qE5pWw57uEXG4gICAgc3RhdGljIHJhbmRvbUludEFyckluY2x1c2l2ZShjbnQsIG1pbiwgbWF4KTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5yYW5kb21JbnRJbmNsdXNpdmUobWluLCBtYXgpKTtcbiAgICAgICAgfSB3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IGNudCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g5LuO57uZ5a6a55qE5pWw57uE5Lit6ZqP5py655Sf5oiQ5LiA57uE5oyH5a6a5pWw6YeP55qE5pWw57uEXG4gICAgc3RhdGljIHJhbmRvbUludEFyckZyb21BcnIoY250LCBzcmNBcnIpOiBudW1iZXJbXSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZG9tSW50SW5jbHVzaXZlKDAsIHNyY0Fyci5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHNyY0FycltpbmRleF0pO1xuICAgICAgICB9IHdoaWxlIChyZXN1bHQubGVuZ3RoIDwgY250KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59XG4iXX0=
//------QC-SOURCE-SPLIT------
