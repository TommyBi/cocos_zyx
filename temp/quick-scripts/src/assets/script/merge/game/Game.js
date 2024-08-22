"use strict";
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