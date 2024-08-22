"use strict";
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