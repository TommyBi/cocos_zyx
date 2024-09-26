
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxGame.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '227d6ZY3XNCDbSywxs/Ei3N', 'ZyxGame');
// script/merge/zyxGame/ZyxGame.ts

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
var ZyxGameModule_1 = require("../dataModule/ZyxGameModule");
var TypeDefine_1 = require("../define/TypeDefine");
var AudioMgr_1 = require("../manager/AudioMgr");
var Define_1 = require("../manager/Define");
var Uimanager_1 = require("../manager/Uimanager");
var EventManager_1 = require("../util/EventManager");
var WxApiManager_1 = require("../util/WxApiManager");
var ZyxGridCom_1 = require("./ZyxGridCom");
var ZyxLineCom_1 = require("./ZyxLineCom");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 游戏主玩法场景
var ZyxGame = /** @class */ (function (_super) {
    __extends(ZyxGame, _super);
    function ZyxGame() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblScore = null;
        _this.ulblMaxScore = null;
        _this.ulblStarCnt = null;
        _this.ulblHammerCnt = null;
        _this.ulblBombCnt = null;
        _this.ulblAdCnt = null;
        _this.uImgStarBar = null;
        _this.uBtnHammer = null;
        _this.uBtnBomb = null;
        _this.uBtnClean = null;
        _this.uBoxGrid = null;
        _this.uBoxNew = null;
        _this.uNodeBasket = null;
        _this.uImgSelectedBg = null;
        _this.grids = [];
        // 掉落发生情况（掉落需要自底向上检测，一轮检测后再检测下一轮，直到最终可以发生掉落的情况全部检测完毕）
        _this.hasDropAction = false;
        // 是否已经生产了新的 - 防止进行无限循环生成和检测
        _this.hasProduce = false;
        // 格子掉落时间
        _this.timeGridDrop = 0.2;
        _this.timeWaitDrop = 600;
        _this.timeShowNewGrids = 0.44;
        // star bar totalLength
        _this.starBarLength = 500;
        // 一颗星星对应的层数
        _this.starMeasures = 100;
        return _this;
    }
    ZyxGame.prototype.onLoad = function () {
        this.uBtnClean.on(cc.Node.EventType.TOUCH_END, this.test, this);
        this.uBtnBomb.on(cc.Node.EventType.TOUCH_END, this.useBomb, this);
        this.uBtnHammer.on(cc.Node.EventType.TOUCH_END, this.useHammer, this);
        EventManager_1.eventManager.on(Define_1.EventType.ZYX_CHECK_MERGE, this.check, this);
        EventManager_1.eventManager.on(Define_1.EventType.ZYX_RESET_GAME, this.resetGame, this);
        EventManager_1.eventManager.on(Define_1.EventType.ZYX_MOVE_GRID, this.moveGrid, this);
        this.initUI();
    };
    ZyxGame.prototype.start = function () {
    };
    ZyxGame.prototype.resetGame = function () {
        ZyxGameModule_1.zyxGameModule.gridInfo = [
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [3, 1, 1], [3, 1, 1], [3, 1, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[1, 1, 2], [1, 1, 3], [1, 1, 4], [1, 1, 5], [1, 1, 6], [1, 1, 7], [1, 1, 8], [0, 0, 0]],
        ];
        ZyxGameModule_1.zyxGameModule.gameInfo = {
            score: 0,
            star: 0,
            adTimes: 3,
            exp: 0,
            uniqueId: 9,
            goods: {}
        };
        this.updateNextGrid();
        this.hasProduce = false;
        ZyxGameModule_1.zyxGameModule.selectGirdUniqueId = -1;
        this.initUI();
        console.log('gridInfo: ', ZyxGameModule_1.zyxGameModule.gridInfo);
    };
    ZyxGame.prototype.initUI = function () {
        this.ulblScore.string = "" + ZyxGameModule_1.zyxGameModule.gameInfo.score;
        this.ulblMaxScore.string = "BEST\uFF1A" + ZyxGameModule_1.zyxGameModule.scoreRecord;
        this.ulblMaxScore.node.active = ZyxGameModule_1.zyxGameModule.scoreRecord > 0;
        this.ulblStarCnt.string = "" + ZyxGameModule_1.zyxGameModule.gameInfo.star;
        this.ulblAdCnt.string = "(" + ZyxGameModule_1.zyxGameModule.gameInfo.adTimes + ")";
        this.ulblHammerCnt.string = "x" + PlayerModule_1.playerModule.hammer;
        this.ulblBombCnt.string = "x" + PlayerModule_1.playerModule.bomb;
        this.uImgStarBar.width = ZyxGameModule_1.zyxGameModule.gameInfo.score % this.starMeasures * this.starBarLength / this.starMeasures;
        this.uImgSelectedBg.active = false;
        this.initChessBoard();
        setTimeout(function () {
            AudioMgr_1.audioMgr.playBGM(AudioMgr_1.SoundType.ZYX_MUSIC_GAME);
        }, 1000);
    };
    // 初始化棋盘信息
    ZyxGame.prototype.initChessBoard = function () {
        return __awaiter(this, void 0, void 0, function () {
            var row, col, grid, grid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.uBoxGrid.destroyAllChildren();
                        this.grids = [];
                        row = 0;
                        _a.label = 1;
                    case 1:
                        if (!(row < ZyxGameModule_1.zyxGameModule.gridInfo.length)) return [3 /*break*/, 9];
                        col = 0;
                        _a.label = 2;
                    case 2:
                        if (!(col < ZyxGameModule_1.zyxGameModule.gridInfo[row].length)) return [3 /*break*/, 8];
                        if (!(col === 0)) return [3 /*break*/, 5];
                        if (!(ZyxGameModule_1.zyxGameModule.gridInfo[row][col][1] !== TypeDefine_1.gridContentType.EMPTY)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.produceGrid(ZyxGameModule_1.zyxGameModule.gridInfo[row][col])];
                    case 3:
                        grid = _a.sent();
                        this.uBoxGrid.addChild(grid);
                        grid.setPosition(new cc.Vec2(ZyxGameModule_1.zyxGameModule.gridsWidth * col, ZyxGameModule_1.zyxGameModule.gridsWidth * (10 - row) - ZyxGameModule_1.zyxGameModule.gridsWidth));
                        grid.getComponent(ZyxGridCom_1.default).setRowCel(row, col);
                        this.grids.push(grid);
                        _a.label = 4;
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        if (!(ZyxGameModule_1.zyxGameModule.gridInfo[row][col][1] != TypeDefine_1.gridContentType.EMPTY && ZyxGameModule_1.zyxGameModule.gridInfo[row][col][2] !== ZyxGameModule_1.zyxGameModule.gridInfo[row][col - 1][2])) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.produceGrid(ZyxGameModule_1.zyxGameModule.gridInfo[row][col])];
                    case 6:
                        grid = _a.sent();
                        this.uBoxGrid.addChild(grid);
                        grid.setPosition(new cc.Vec2(ZyxGameModule_1.zyxGameModule.gridsWidth * col, ZyxGameModule_1.zyxGameModule.gridsWidth * (10 - row) - ZyxGameModule_1.zyxGameModule.gridsWidth));
                        grid.getComponent(ZyxGridCom_1.default).setRowCel(row, col);
                        this.grids.push(grid);
                        _a.label = 7;
                    case 7:
                        col++;
                        return [3 /*break*/, 2];
                    case 8:
                        row++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // 加载下一行
    ZyxGame.prototype.loadNext = function () {
        this.moveUp();
        this.produceRow();
    };
    // 生成新的一行
    ZyxGame.prototype.produceRow = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newData, i, row, grid, grid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 剔除顶部空余的一行
                        ZyxGameModule_1.zyxGameModule.gridInfo.shift();
                        newData = ZyxGameModule_1.zyxGameModule.copyNewGridData();
                        ZyxGameModule_1.zyxGameModule.gridInfo.push(newData);
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 8)) return [3 /*break*/, 7];
                        row = 9;
                        if (!(i === 0)) return [3 /*break*/, 4];
                        if (!(ZyxGameModule_1.zyxGameModule.gridInfo[row][i][1] !== TypeDefine_1.gridContentType.EMPTY)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.produceGrid(ZyxGameModule_1.zyxGameModule.gridInfo[row][i])];
                    case 2:
                        grid = _a.sent();
                        this.uBoxGrid.addChild(grid);
                        grid.setPosition(new cc.Vec2(ZyxGameModule_1.zyxGameModule.gridsWidth * i, -84));
                        grid.getComponent(ZyxGridCom_1.default).setRowCel(row, i);
                        this.grids.push(grid);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4:
                        if (!(ZyxGameModule_1.zyxGameModule.gridInfo[row][i][1] != TypeDefine_1.gridContentType.EMPTY && ZyxGameModule_1.zyxGameModule.gridInfo[row][i][2] !== ZyxGameModule_1.zyxGameModule.gridInfo[row][i - 1][2])) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.produceGrid(ZyxGameModule_1.zyxGameModule.gridInfo[row][i])];
                    case 5:
                        grid = _a.sent();
                        this.uBoxGrid.addChild(grid);
                        grid.setPosition(new cc.Vec2(ZyxGameModule_1.zyxGameModule.gridsWidth * i, -84));
                        grid.getComponent(ZyxGridCom_1.default).setRowCel(row, i);
                        this.grids.push(grid);
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7:
                        // 展示新格子
                        this.showNewGrids();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 生成格子
    ZyxGame.prototype.produceGrid = function (gridInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var grid, gridNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/zyx/uComGrid')];
                    case 1:
                        grid = _a.sent();
                        gridNode = cc.instantiate(grid);
                        gridNode.getComponent(ZyxGridCom_1.default).init(gridInfo);
                        return [2 /*return*/, gridNode];
                }
            });
        });
    };
    // 展示新格子
    ZyxGame.prototype.showNewGrids = function () {
        var _this = this;
        var showEnding = false;
        for (var i = 0; i < this.grids.length; i++) {
            var grid = this.grids[i];
            if (grid.y !== -84)
                continue;
            cc.tween(grid)
                .to(this.timeShowNewGrids, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                .call(function () {
                if (showEnding)
                    return;
                showEnding = true;
                // 下一排展示完成，开始检测是否可以进行合成
                _this.check();
            })
                .start();
        }
        this.updateNextGrid();
    };
    // 生成之前，先上移
    ZyxGame.prototype.moveUp = function () {
        for (var i = 0; i < this.grids.length; i++) {
            var grid = this.grids[i];
            cc.tween(grid)
                .to(this.timeShowNewGrids, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                .start();
            grid.getComponent(ZyxGridCom_1.default).moveUp();
        }
    };
    // 刷新下一层格子的信息
    ZyxGame.prototype.updateNextGrid = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, line, line;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 数据刷新
                        ZyxGameModule_1.zyxGameModule.produce();
                        // 展示刷新
                        this.uBoxNew.destroyAllChildren();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 8)) return [3 /*break*/, 7];
                        if (!(i === 0)) return [3 /*break*/, 4];
                        if (!(ZyxGameModule_1.zyxGameModule.nextGridInfo[i][1] !== TypeDefine_1.gridContentType.EMPTY)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.produceNewLine(ZyxGameModule_1.zyxGameModule.nextGridInfo[i][0])];
                    case 2:
                        line = _a.sent();
                        this.uBoxNew.addChild(line);
                        line.setPosition(new cc.Vec2(ZyxGameModule_1.zyxGameModule.gridsWidth * i, 0));
                        _a.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4:
                        if (!(ZyxGameModule_1.zyxGameModule.nextGridInfo[i][1] != TypeDefine_1.gridContentType.EMPTY && ZyxGameModule_1.zyxGameModule.nextGridInfo[i][2] !== ZyxGameModule_1.zyxGameModule.nextGridInfo[i - 1][2])) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.produceNewLine(ZyxGameModule_1.zyxGameModule.nextGridInfo[i][0])];
                    case 5:
                        line = _a.sent();
                        this.uBoxNew.addChild(line);
                        line.setPosition(new cc.Vec2(ZyxGameModule_1.zyxGameModule.gridsWidth * i, 0));
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ZyxGame.prototype.produceNewLine = function (size) {
        return __awaiter(this, void 0, void 0, function () {
            var line, node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/zyx/uComNextLine')];
                    case 1:
                        line = _a.sent();
                        node = cc.instantiate(line);
                        node.getComponent(ZyxLineCom_1.default).setW(size * ZyxGameModule_1.zyxGameModule.gridsWidth);
                        return [2 /*return*/, node];
                }
            });
        });
    };
    // 循环检测是否可以掉落和消除
    ZyxGame.prototype.check = function () {
        this.drop(9);
    };
    // 进行合成操作 - 合成操作是一轮消除检测的最后一个动作
    ZyxGame.prototype.merge = function () {
        var mergeTimes = 0;
        // 检测每一行是否有可以消除的格子
        for (var row = 0; row < ZyxGameModule_1.zyxGameModule.gridInfo.length; row++) {
            var rowData = ZyxGameModule_1.zyxGameModule.gridInfo[row];
            var hasEmptyGrid = false;
            for (var j = 0; j < rowData.length; j++) {
                if (rowData[j][1] === TypeDefine_1.gridContentType.EMPTY) {
                    hasEmptyGrid = true;
                    break;
                }
            }
            // 如果没有空格子，那就可以进行消除
            var uniqueIds = [];
            if (!hasEmptyGrid) {
                mergeTimes++;
                for (var j = 0; j < rowData.length; j++) {
                    if (uniqueIds.indexOf(rowData[j][2]) === -1 && rowData[j][2] !== 0) {
                        uniqueIds.push(rowData[j][2]);
                    }
                    ZyxGameModule_1.zyxGameModule.gridInfo[row][j] = [0, 0, 0];
                }
            }
            // 消除
            for (var i = 0; i < uniqueIds.length; i++) {
                var uniqueId = uniqueIds[i];
                this.eliminateGrid(uniqueId);
            }
        }
        if (mergeTimes > 0) {
            Uimanager_1.uimanager.showTips('發生消除，持续下一轮检测');
            AudioMgr_1.audioMgr.shake(AudioMgr_1.SHAKE_TYPE.HEAVY);
            this.addScore(mergeTimes);
            this.check();
        }
        else {
            var isGameOver = this.checkGameOver();
            var isGridEmpty = this.checkGridEmpty();
            if (isGameOver)
                return;
            if (!this.hasProduce) {
                // 没有可以进行消除的了，并且还未展示新生成的一排，则展示下一排
                this.hasProduce = true;
                this.loadNext();
                Uimanager_1.uimanager.showTips('展示下一行');
            }
            else if (isGridEmpty) {
                // 新生成的已经展示了，且没有可合成，且场上没有棋子
                this.hasProduce = true;
                this.loadNext();
                Uimanager_1.uimanager.showTips('棋盘为空，展示下一行');
            }
            else {
                // 新生成的一排已经展示过了，且已经没有可合成，且场上还有棋子
                this.hasProduce = false;
                ZyxGameModule_1.zyxGameModule.selectGirdUniqueId = -1;
                console.log('action over:', ZyxGameModule_1.zyxGameModule.gridInfo);
            }
        }
    };
    // 当前场景中是否已经为空
    ZyxGame.prototype.checkGridEmpty = function () {
        var isEmpty = true;
        for (var i = 0; i < ZyxGameModule_1.zyxGameModule.gridInfo[9].length; i++) {
            var gridData = ZyxGameModule_1.zyxGameModule.gridInfo[9][i];
            if (gridData[1] !== TypeDefine_1.gridContentType.EMPTY) {
                isEmpty = false;
                break;
            }
        }
        return isEmpty;
    };
    // 消除
    ZyxGame.prototype.eliminateGrid = function (uniqueID) {
        for (var i = 0; i < this.grids.length; i++) {
            if (this.grids[i].getComponent(ZyxGridCom_1.default).uniqueId === uniqueID) {
                console.log('消除', uniqueID);
                this.collectGoods(this.grids[i].getComponent(ZyxGridCom_1.default).contentType);
                this.grids[i].getComponent(ZyxGridCom_1.default).eliminate();
                this.grids.splice(i, 1);
                break;
            }
        }
    };
    // 收集物品
    ZyxGame.prototype.collectGoods = function (contentType) {
    };
    // 检测当前行的上一行是否有掉落情况，如果有则进行掉落操作
    ZyxGame.prototype.drop = function (row) {
        var _this = this;
        if (row === 9) {
            this.hasDropAction = false;
        }
        if (row === 0) {
            if (this.hasDropAction) {
                console.log('持续掉落检测');
                AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.ZYX_DROP);
                this.check();
            }
            else {
                setTimeout(function () {
                    _this.merge();
                }, this.timeWaitDrop);
            }
            return;
        }
        for (var col = 0; col < 8; col++) {
            if (ZyxGameModule_1.zyxGameModule.gridInfo[row][col][1] === TypeDefine_1.gridContentType.EMPTY && ZyxGameModule_1.zyxGameModule.gridInfo[row - 1][col][1] !== TypeDefine_1.gridContentType.EMPTY) {
                // 检测是否可以掉落
                var hasDrop = this.dropGrid(row - 1, col);
                if (hasDrop) {
                    this.hasDropAction = true;
                }
                continue;
            }
        }
        this.drop(row - 1);
    };
    ZyxGame.prototype.dropGrid = function (row, col) {
        // 检测对应的空格子是否可以容纳掉下来的格子类型
        var uniqueID = ZyxGameModule_1.zyxGameModule.gridInfo[row][col][2];
        var checkCols = [];
        for (var i = 0; i < 8; i++) {
            if (ZyxGameModule_1.zyxGameModule.gridInfo[row][i][2] === uniqueID) {
                checkCols.push(i);
            }
        }
        var canDrop = true;
        for (var i = 0; i < checkCols.length; i++) {
            var col_1 = checkCols[i];
            if (ZyxGameModule_1.zyxGameModule.gridInfo[row + 1][col_1][1] !== TypeDefine_1.gridContentType.EMPTY) {
                canDrop = false;
                return false;
            }
        }
        // 如果可以掉落，那就将数据进行交换，同时更新格子的自身属性和位置信息
        for (var i = 0; i < checkCols.length; i++) {
            var col_2 = checkCols[i];
            ZyxGameModule_1.zyxGameModule.gridInfo[row + 1][col_2][0] = ZyxGameModule_1.zyxGameModule.gridInfo[row][col_2][0];
            ZyxGameModule_1.zyxGameModule.gridInfo[row + 1][col_2][1] = ZyxGameModule_1.zyxGameModule.gridInfo[row][col_2][1];
            ZyxGameModule_1.zyxGameModule.gridInfo[row + 1][col_2][2] = ZyxGameModule_1.zyxGameModule.gridInfo[row][col_2][2];
            ZyxGameModule_1.zyxGameModule.gridInfo[row][col_2][0] = 0;
            ZyxGameModule_1.zyxGameModule.gridInfo[row][col_2][1] = TypeDefine_1.gridContentType.EMPTY;
            ZyxGameModule_1.zyxGameModule.gridInfo[row][col_2][2] = 0;
        }
        console.log('掉落:', uniqueID);
        for (var i = 0; i < this.grids.length; i++) {
            var grid = this.grids[i];
            if (grid.getComponent(ZyxGridCom_1.default).uniqueId === uniqueID) {
                grid.getComponent(ZyxGridCom_1.default).moveDown();
                var tarY = ZyxGameModule_1.zyxGameModule.gridsWidth * (10 - row - 1) - ZyxGameModule_1.zyxGameModule.gridsWidth;
                cc.tween(grid)
                    .to(this.timeGridDrop, { y: tarY }, { easing: 'quartIn' })
                    .start();
            }
        }
        return canDrop;
    };
    // 检验是否结束
    ZyxGame.prototype.checkGameOver = function () {
        if (ZyxGameModule_1.zyxGameModule.checkGameOver()) {
            Uimanager_1.uimanager.showGameOver();
            AudioMgr_1.audioMgr.stopBGM();
            AudioMgr_1.audioMgr.shake(AudioMgr_1.SHAKE_TYPE.HEAVY);
            AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.ZYX_END);
            return true;
        }
        return false;
    };
    // 加分
    ZyxGame.prototype.addScore = function (score) {
        // 当前分数
        ZyxGameModule_1.zyxGameModule.gameInfo.score += score;
        this.ulblScore.string = ZyxGameModule_1.zyxGameModule.gameInfo.score.toString();
        // 最高分更新
        if (ZyxGameModule_1.zyxGameModule.gameInfo.score >= ZyxGameModule_1.zyxGameModule.scoreRecord) {
            ZyxGameModule_1.zyxGameModule.scoreRecord = ZyxGameModule_1.zyxGameModule.gameInfo.score;
            this.ulblMaxScore.string = "BEST\uFF1A" + ZyxGameModule_1.zyxGameModule.scoreRecord;
            this.ulblMaxScore.node.active = true;
        }
        // 星星
        var tarW = ZyxGameModule_1.zyxGameModule.gameInfo.score % this.starMeasures * this.starBarLength / this.starMeasures;
        cc.tween(this.uImgStarBar)
            .to(0.5, { width: tarW })
            .start();
        if (tarW === 0) {
            // 星星数量+1   
            ZyxGameModule_1.zyxGameModule.gameInfo.star += 1;
            this.ulblStarCnt.string = ZyxGameModule_1.zyxGameModule.gameInfo.star.toString();
        }
    };
    // 移动格子中，提示当前移动的位置
    ZyxGame.prototype.moveGrid = function (e) {
        this.uImgSelectedBg.active = e.data.action === 'move';
        var gridGlobalPos = e.data.node.parent.convertToWorldSpaceAR(e.data.node.getPosition());
        this.uImgSelectedBg.x = this.node.convertToNodeSpaceAR(gridGlobalPos).x;
        this.uImgSelectedBg.width = e.data.node.width;
    };
    ZyxGame.prototype.test = function () {
        console.log(ZyxGameModule_1.zyxGameModule.gridInfo);
        Uimanager_1.uimanager.showTips('分享');
        WxApiManager_1.wxApiManager.share('别卷啦，快来卡皮一下吧~');
    };
    // 使用炸弹
    ZyxGame.prototype.useBomb = function () {
        Uimanager_1.uimanager.showTips('使用炸弹');
        WxApiManager_1.wxApiManager.share('别卷啦，快来卡皮一下吧~');
    };
    // 使用卡皮巴拉
    ZyxGame.prototype.useHammer = function () {
        Uimanager_1.uimanager.showTips('使用卡皮巴拉');
        WxApiManager_1.wxApiManager.share('别卷啦，快来卡皮一下吧~');
    };
    __decorate([
        property(cc.Label)
    ], ZyxGame.prototype, "ulblScore", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxGame.prototype, "ulblMaxScore", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxGame.prototype, "ulblStarCnt", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxGame.prototype, "ulblHammerCnt", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxGame.prototype, "ulblBombCnt", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxGame.prototype, "ulblAdCnt", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGame.prototype, "uImgStarBar", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGame.prototype, "uBtnHammer", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGame.prototype, "uBtnBomb", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGame.prototype, "uBtnClean", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGame.prototype, "uBoxGrid", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGame.prototype, "uBoxNew", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGame.prototype, "uNodeBasket", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGame.prototype, "uImgSelectedBg", void 0);
    ZyxGame = __decorate([
        ccclass
    ], ZyxGame);
    return ZyxGame;
}(cc.Component));
exports.default = ZyxGame;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUEwRDtBQUMxRCw2REFBNEQ7QUFDNUQsbURBQXVEO0FBQ3ZELGdEQUFzRTtBQUN0RSw0Q0FBOEM7QUFDOUMsa0RBQWlEO0FBQ2pELHFEQUFvRDtBQUNwRCxxREFBb0Q7QUFDcEQsMkNBQXNDO0FBQ3RDLDJDQUFzQztBQUdoQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxVQUFVO0FBRVY7SUFBcUMsMkJBQVk7SUFBakQ7UUFBQSxxRUE0ZkM7UUF6ZkcsZUFBUyxHQUFhLElBQUksQ0FBQztRQUczQixrQkFBWSxHQUFhLElBQUksQ0FBQztRQUc5QixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixtQkFBYSxHQUFhLElBQUksQ0FBQztRQUcvQixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixlQUFTLEdBQWEsSUFBSSxDQUFDO1FBRzNCLGlCQUFXLEdBQVksSUFBSSxDQUFDO1FBRzVCLGdCQUFVLEdBQVksSUFBSSxDQUFDO1FBRzNCLGNBQVEsR0FBWSxJQUFJLENBQUM7UUFHekIsZUFBUyxHQUFZLElBQUksQ0FBQztRQUcxQixjQUFRLEdBQVksSUFBSSxDQUFDO1FBR3pCLGFBQU8sR0FBWSxJQUFJLENBQUM7UUFHeEIsaUJBQVcsR0FBWSxJQUFJLENBQUM7UUFHNUIsb0JBQWMsR0FBWSxJQUFJLENBQUM7UUFFdkIsV0FBSyxHQUFjLEVBQUUsQ0FBQztRQUU5QixxREFBcUQ7UUFDN0MsbUJBQWEsR0FBWSxLQUFLLENBQUM7UUFFdkMsNEJBQTRCO1FBQ3BCLGdCQUFVLEdBQVksS0FBSyxDQUFDO1FBRXBDLFNBQVM7UUFDRCxrQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUMzQixrQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUMzQixzQkFBZ0IsR0FBVyxJQUFJLENBQUM7UUFFeEMsdUJBQXVCO1FBQ2YsbUJBQWEsR0FBVyxHQUFHLENBQUM7UUFFcEMsWUFBWTtRQUNKLGtCQUFZLEdBQVcsR0FBRyxDQUFDOztJQStidkMsQ0FBQztJQTdiRyx3QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdEUsMkJBQVksQ0FBQyxFQUFFLENBQUMsa0JBQVMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCwyQkFBWSxDQUFDLEVBQUUsQ0FBQyxrQkFBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hFLDJCQUFZLENBQUMsRUFBRSxDQUFDLGtCQUFTLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCx1QkFBSyxHQUFMO0lBRUEsQ0FBQztJQUVELDJCQUFTLEdBQVQ7UUFDSSw2QkFBYSxDQUFDLFFBQVEsR0FBRztZQUNyQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFD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QUFFLENBQUMsSUFBSSxDQUFDO2dEQUNVO0lBRzVCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7K0NBQ1M7SUFHM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs2Q0FDTztJQUd6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzhDQUNRO0lBRzFCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7NkNBQ087SUFHekI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs0Q0FDTTtJQUd4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2dEQUNVO0lBRzVCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7bURBQ2E7SUExQ2QsT0FBTztRQUQzQixPQUFPO09BQ2EsT0FBTyxDQTRmM0I7SUFBRCxjQUFDO0NBNWZELEFBNGZDLENBNWZvQyxFQUFFLENBQUMsU0FBUyxHQTRmaEQ7a0JBNWZvQixPQUFPIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGxheWVyTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvUGxheWVyTW9kdWxlXCI7XG5pbXBvcnQgeyB6eXhHYW1lTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvWnl4R2FtZU1vZHVsZVwiO1xuaW1wb3J0IHsgZ3JpZENvbnRlbnRUeXBlIH0gZnJvbSBcIi4uL2RlZmluZS9UeXBlRGVmaW5lXCI7XG5pbXBvcnQgeyBhdWRpb01nciwgU0hBS0VfVFlQRSwgU291bmRUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvQXVkaW9NZ3JcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gXCIuLi9tYW5hZ2VyL0RlZmluZVwiO1xuaW1wb3J0IHsgdWltYW5hZ2VyIH0gZnJvbSBcIi4uL21hbmFnZXIvVWltYW5hZ2VyXCI7XG5pbXBvcnQgeyBldmVudE1hbmFnZXIgfSBmcm9tIFwiLi4vdXRpbC9FdmVudE1hbmFnZXJcIjtcbmltcG9ydCB7IHd4QXBpTWFuYWdlciB9IGZyb20gXCIuLi91dGlsL1d4QXBpTWFuYWdlclwiO1xuaW1wb3J0IFp5eEdyaWRDb20gZnJvbSBcIi4vWnl4R3JpZENvbVwiO1xuaW1wb3J0IFp5eExpbmVDb20gZnJvbSBcIi4vWnl4TGluZUNvbVwiO1xuXG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbi8vIOa4uOaIj+S4u+eOqeazleWcuuaZr1xuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFp5eEdhbWUgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxTY29yZTogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxNYXhTY29yZTogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxTdGFyQ250OiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibEhhbW1lckNudDogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxCb21iQ250OiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibEFkQ250OiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1SW1nU3RhckJhcjogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1QnRuSGFtbWVyOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCdG5Cb21iOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCdG5DbGVhbjogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1Qm94R3JpZDogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1Qm94TmV3OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVOb2RlQmFza2V0OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdTZWxlY3RlZEJnOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIHByaXZhdGUgZ3JpZHM6IGNjLk5vZGVbXSA9IFtdO1xuXG4gICAgLy8g5o6J6JC95Y+R55Sf5oOF5Ya177yI5o6J6JC96ZyA6KaB6Ieq5bqV5ZCR5LiK5qOA5rWL77yM5LiA6L2u5qOA5rWL5ZCO5YaN5qOA5rWL5LiL5LiA6L2u77yM55u05Yiw5pyA57uI5Y+v5Lul5Y+R55Sf5o6J6JC955qE5oOF5Ya15YWo6YOo5qOA5rWL5a6M5q+V77yJXG4gICAgcHJpdmF0ZSBoYXNEcm9wQWN0aW9uOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvLyDmmK/lkKblt7Lnu4/nlJ/kuqfkuobmlrDnmoQgLSDpmLLmraLov5vooYzml6DpmZDlvqrnjq/nlJ/miJDlkozmo4DmtYtcbiAgICBwcml2YXRlIGhhc1Byb2R1Y2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8vIOagvOWtkOaOieiQveaXtumXtFxuICAgIHByaXZhdGUgdGltZUdyaWREcm9wOiBudW1iZXIgPSAwLjI7XG4gICAgcHJpdmF0ZSB0aW1lV2FpdERyb3A6IG51bWJlciA9IDYwMDtcbiAgICBwcml2YXRlIHRpbWVTaG93TmV3R3JpZHM6IG51bWJlciA9IDAuNDQ7XG5cbiAgICAvLyBzdGFyIGJhciB0b3RhbExlbmd0aFxuICAgIHByaXZhdGUgc3RhckJhckxlbmd0aDogbnVtYmVyID0gNTAwO1xuXG4gICAgLy8g5LiA6aKX5pif5pif5a+55bqU55qE5bGC5pWwXG4gICAgcHJpdmF0ZSBzdGFyTWVhc3VyZXM6IG51bWJlciA9IDEwMDtcblxuICAgIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy51QnRuQ2xlYW4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLnRlc3QsIHRoaXMpO1xuICAgICAgICB0aGlzLnVCdG5Cb21iLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy51c2VCb21iLCB0aGlzKTtcbiAgICAgICAgdGhpcy51QnRuSGFtbWVyLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy51c2VIYW1tZXIsIHRoaXMpO1xuXG4gICAgICAgIGV2ZW50TWFuYWdlci5vbihFdmVudFR5cGUuWllYX0NIRUNLX01FUkdFLCB0aGlzLmNoZWNrLCB0aGlzKTtcbiAgICAgICAgZXZlbnRNYW5hZ2VyLm9uKEV2ZW50VHlwZS5aWVhfUkVTRVRfR0FNRSwgdGhpcy5yZXNldEdhbWUsIHRoaXMpO1xuICAgICAgICBldmVudE1hbmFnZXIub24oRXZlbnRUeXBlLlpZWF9NT1ZFX0dSSUQsIHRoaXMubW92ZUdyaWQsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuaW5pdFVJKCk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG5cbiAgICB9XG5cbiAgICByZXNldEdhbWUoKTogdm9pZCB7XG4gICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8gPSBbXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzMsIDEsIDFdLCBbMywgMSwgMV0sIFszLCAxLCAxXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzEsIDEsIDJdLCBbMSwgMSwgM10sIFsxLCAxLCA0XSwgWzEsIDEsIDVdLCBbMSwgMSwgNl0sIFsxLCAxLCA3XSwgWzEsIDEsIDhdLCBbMCwgMCwgMF1dLFxuICAgICAgICBdXG4gICAgICAgIHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8gPSB7XG4gICAgICAgICAgICBzY29yZTogMCxcbiAgICAgICAgICAgIHN0YXI6IDAsXG4gICAgICAgICAgICBhZFRpbWVzOiAzLFxuICAgICAgICAgICAgZXhwOiAwLFxuICAgICAgICAgICAgdW5pcXVlSWQ6IDksXG4gICAgICAgICAgICBnb29kczoge31cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlTmV4dEdyaWQoKTtcblxuICAgICAgICB0aGlzLmhhc1Byb2R1Y2UgPSBmYWxzZTtcbiAgICAgICAgenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgPSAtMTtcblxuICAgICAgICB0aGlzLmluaXRVSSgpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdncmlkSW5mbzogJywgenl4R2FtZU1vZHVsZS5ncmlkSW5mbyk7XG4gICAgfVxuXG4gICAgaW5pdFVJKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnVsYmxTY29yZS5zdHJpbmcgPSBgJHt6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLnNjb3JlfWA7XG4gICAgICAgIHRoaXMudWxibE1heFNjb3JlLnN0cmluZyA9IGBCRVNU77yaJHt6eXhHYW1lTW9kdWxlLnNjb3JlUmVjb3JkfWA7XG4gICAgICAgIHRoaXMudWxibE1heFNjb3JlLm5vZGUuYWN0aXZlID0genl4R2FtZU1vZHVsZS5zY29yZVJlY29yZCA+IDA7XG4gICAgICAgIHRoaXMudWxibFN0YXJDbnQuc3RyaW5nID0gYCR7enl4R2FtZU1vZHVsZS5nYW1lSW5mby5zdGFyfWA7XG4gICAgICAgIHRoaXMudWxibEFkQ250LnN0cmluZyA9IGAoJHt6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLmFkVGltZXN9KWA7XG4gICAgICAgIHRoaXMudWxibEhhbW1lckNudC5zdHJpbmcgPSBgeCR7cGxheWVyTW9kdWxlLmhhbW1lcn1gO1xuICAgICAgICB0aGlzLnVsYmxCb21iQ250LnN0cmluZyA9IGB4JHtwbGF5ZXJNb2R1bGUuYm9tYn1gO1xuICAgICAgICB0aGlzLnVJbWdTdGFyQmFyLndpZHRoID0genl4R2FtZU1vZHVsZS5nYW1lSW5mby5zY29yZSAlIHRoaXMuc3Rhck1lYXN1cmVzICogdGhpcy5zdGFyQmFyTGVuZ3RoIC8gdGhpcy5zdGFyTWVhc3VyZXM7XG5cbiAgICAgICAgdGhpcy51SW1nU2VsZWN0ZWRCZy5hY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmluaXRDaGVzc0JvYXJkKCk7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBhdWRpb01nci5wbGF5QkdNKFNvdW5kVHlwZS5aWVhfTVVTSUNfR0FNRSk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH1cblxuICAgIC8vIOWIneWni+WMluaji+ebmOS/oeaBr1xuICAgIGFzeW5jIGluaXRDaGVzc0JvYXJkKCkge1xuICAgICAgICB0aGlzLnVCb3hHcmlkLmRlc3Ryb3lBbGxDaGlsZHJlbigpO1xuICAgICAgICB0aGlzLmdyaWRzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgenl4R2FtZU1vZHVsZS5ncmlkSW5mby5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd10ubGVuZ3RoOyBjb2wrKykge1xuICAgICAgICAgICAgICAgIGlmIChjb2wgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdyaWQgPSBhd2FpdCB0aGlzLnByb2R1Y2VHcmlkKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudUJveEdyaWQuYWRkQ2hpbGQoZ3JpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqIGNvbCwgenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogKDEwIC0gcm93KSAtIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuc2V0Um93Q2VsKHJvdywgY29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHMucHVzaChncmlkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMV0gIT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZICYmIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzJdICE9PSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sIC0gMV1bMl0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGF3YWl0IHRoaXMucHJvZHVjZUdyaWQoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVCb3hHcmlkLmFkZENoaWxkKGdyaWQpO1xuICAgICAgICAgICAgICAgICAgICBncmlkLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqIGNvbCwgenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogKDEwIC0gcm93KSAtIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCkpO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5zZXRSb3dDZWwocm93LCBjb2wpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzLnB1c2goZ3JpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Yqg6L295LiL5LiA6KGMXG4gICAgbG9hZE5leHQoKSB7XG4gICAgICAgIHRoaXMubW92ZVVwKCk7XG5cbiAgICAgICAgdGhpcy5wcm9kdWNlUm93KCk7XG4gICAgfVxuXG4gICAgLy8g55Sf5oiQ5paw55qE5LiA6KGMXG4gICAgYXN5bmMgcHJvZHVjZVJvdygpIHtcbiAgICAgICAgLy8g5YmU6Zmk6aG26YOo56m65L2Z55qE5LiA6KGMXG4gICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8uc2hpZnQoKTtcblxuICAgICAgICAvLyDlsIbmlrDnmoTkuIDmjpLnmoTmlbDmja7ov5vooYzmi7fotJ3lubbkvb/nlKhcbiAgICAgICAgY29uc3QgbmV3RGF0YSA9IHp5eEdhbWVNb2R1bGUuY29weU5ld0dyaWREYXRhKCk7XG5cbiAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mby5wdXNoKG5ld0RhdGEpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gOTtcbiAgICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdyaWQgPSBhd2FpdCB0aGlzLnByb2R1Y2VHcmlkKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudUJveEdyaWQuYWRkQ2hpbGQoZ3JpZCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogaSwgLTg0KSk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnNldFJvd0NlbChyb3csIGkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzLnB1c2goZ3JpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11baV1bMV0gIT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZICYmIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXVsyXSAhPT0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2kgLSAxXVsyXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdyaWQgPSBhd2FpdCB0aGlzLnByb2R1Y2VHcmlkKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXSk7XG4gICAgICAgICAgICAgICAgdGhpcy51Qm94R3JpZC5hZGRDaGlsZChncmlkKTtcbiAgICAgICAgICAgICAgICBncmlkLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqIGksIC04NCkpO1xuICAgICAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnNldFJvd0NlbChyb3csIGkpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHMucHVzaChncmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWxleekuuaWsOagvOWtkFxuICAgICAgICB0aGlzLnNob3dOZXdHcmlkcygpO1xuICAgIH1cblxuICAgIC8vIOeUn+aIkOagvOWtkFxuICAgIGFzeW5jIHByb2R1Y2VHcmlkKGdyaWRJbmZvOiBudW1iZXJbXSkge1xuICAgICAgICBjb25zdCBncmlkID0gYXdhaXQgdWltYW5hZ2VyLmxvYWRQcmVmYWIoJ3ByZWZhYi96eXgvdUNvbUdyaWQnKTtcbiAgICAgICAgY29uc3QgZ3JpZE5vZGUgPSBjYy5pbnN0YW50aWF0ZShncmlkKTtcbiAgICAgICAgZ3JpZE5vZGUuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLmluaXQoZ3JpZEluZm8pO1xuICAgICAgICByZXR1cm4gZ3JpZE5vZGU7XG4gICAgfVxuXG4gICAgLy8g5bGV56S65paw5qC85a2QXG4gICAgc2hvd05ld0dyaWRzKCk6IHZvaWQge1xuICAgICAgICBsZXQgc2hvd0VuZGluZzogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmdyaWRzW2ldO1xuICAgICAgICAgICAgaWYgKGdyaWQueSAhPT0gLTg0KSBjb250aW51ZTtcbiAgICAgICAgICAgIGNjLnR3ZWVuKGdyaWQpXG4gICAgICAgICAgICAgICAgLnRvKHRoaXMudGltZVNob3dOZXdHcmlkcywgeyB5OiBncmlkLnkgKyA4NCB9LCB7IGVhc2luZzogJ2N1YmljSW5PdXQnIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvd0VuZGluZykgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBzaG93RW5kaW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDkuIvkuIDmjpLlsZXnpLrlrozmiJDvvIzlvIDlp4vmo4DmtYvmmK/lkKblj6/ku6Xov5vooYzlkIjmiJBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVjaygpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZU5leHRHcmlkKCk7XG4gICAgfVxuXG4gICAgLy8g55Sf5oiQ5LmL5YmN77yM5YWI5LiK56e7XG4gICAgbW92ZVVwKCk6IHZvaWQge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmdyaWRzW2ldO1xuICAgICAgICAgICAgY2MudHdlZW4oZ3JpZClcbiAgICAgICAgICAgICAgICAudG8odGhpcy50aW1lU2hvd05ld0dyaWRzLCB7IHk6IGdyaWQueSArIDg0IH0sIHsgZWFzaW5nOiAnY3ViaWNJbk91dCcgfSlcbiAgICAgICAgICAgICAgICAuc3RhcnQoKTtcblxuICAgICAgICAgICAgZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkubW92ZVVwKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDliLfmlrDkuIvkuIDlsYLmoLzlrZDnmoTkv6Hmga9cbiAgICBhc3luYyB1cGRhdGVOZXh0R3JpZCgpIHtcbiAgICAgICAgLy8g5pWw5o2u5Yi35pawXG4gICAgICAgIHp5eEdhbWVNb2R1bGUucHJvZHVjZSgpO1xuXG4gICAgICAgIC8vIOWxleekuuWIt+aWsFxuICAgICAgICB0aGlzLnVCb3hOZXcuZGVzdHJveUFsbENoaWxkcmVuKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLm5leHRHcmlkSW5mb1tpXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBhd2FpdCB0aGlzLnByb2R1Y2VOZXdMaW5lKHp5eEdhbWVNb2R1bGUubmV4dEdyaWRJbmZvW2ldWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51Qm94TmV3LmFkZENoaWxkKGxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBsaW5lLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqIGksIDApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHp5eEdhbWVNb2R1bGUubmV4dEdyaWRJbmZvW2ldWzFdICE9IGdyaWRDb250ZW50VHlwZS5FTVBUWSAmJiB6eXhHYW1lTW9kdWxlLm5leHRHcmlkSW5mb1tpXVsyXSAhPT0genl4R2FtZU1vZHVsZS5uZXh0R3JpZEluZm9baSAtIDFdWzJdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZSA9IGF3YWl0IHRoaXMucHJvZHVjZU5ld0xpbmUoenl4R2FtZU1vZHVsZS5uZXh0R3JpZEluZm9baV1bMF0pO1xuICAgICAgICAgICAgICAgIHRoaXMudUJveE5ldy5hZGRDaGlsZChsaW5lKTtcbiAgICAgICAgICAgICAgICBsaW5lLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqIGksIDApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHByb2R1Y2VOZXdMaW5lKHNpemU6IG51bWJlcikge1xuICAgICAgICBjb25zdCBsaW5lID0gYXdhaXQgdWltYW5hZ2VyLmxvYWRQcmVmYWIoJ3ByZWZhYi96eXgvdUNvbU5leHRMaW5lJyk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjYy5pbnN0YW50aWF0ZShsaW5lKTtcbiAgICAgICAgbm9kZS5nZXRDb21wb25lbnQoWnl4TGluZUNvbSkuc2V0VyhzaXplICogenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoKTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgLy8g5b6q546v5qOA5rWL5piv5ZCm5Y+v5Lul5o6J6JC95ZKM5raI6ZmkXG4gICAgY2hlY2soKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZHJvcCg5KTtcbiAgICB9XG5cbiAgICAvLyDov5vooYzlkIjmiJDmk43kvZwgLSDlkIjmiJDmk43kvZzmmK/kuIDova7mtojpmaTmo4DmtYvnmoTmnIDlkI7kuIDkuKrliqjkvZxcbiAgICBtZXJnZSgpOiB2b2lkIHtcbiAgICAgICAgbGV0IG1lcmdlVGltZXMgPSAwO1xuICAgICAgICAvLyDmo4DmtYvmr4/kuIDooYzmmK/lkKbmnInlj6/ku6XmtojpmaTnmoTmoLzlrZBcbiAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgenl4R2FtZU1vZHVsZS5ncmlkSW5mby5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgICAgICBjb25zdCByb3dEYXRhID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddO1xuICAgICAgICAgICAgbGV0IGhhc0VtcHR5R3JpZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dEYXRhLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvd0RhdGFbal1bMV0gPT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICBoYXNFbXB0eUdyaWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWmguaenOayoeacieepuuagvOWtkO+8jOmCo+WwseWPr+S7pei/m+ihjOa2iOmZpFxuICAgICAgICAgICAgY29uc3QgdW5pcXVlSWRzID0gW107XG4gICAgICAgICAgICBpZiAoIWhhc0VtcHR5R3JpZCkge1xuICAgICAgICAgICAgICAgIG1lcmdlVGltZXMrKztcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJvd0RhdGEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVuaXF1ZUlkcy5pbmRleE9mKHJvd0RhdGFbal1bMl0pID09PSAtMSAmJiByb3dEYXRhW2pdWzJdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1bmlxdWVJZHMucHVzaChyb3dEYXRhW2pdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtqXSA9IFswLCAwLCAwXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOa2iOmZpFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bmlxdWVJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmlxdWVJZCA9IHVuaXF1ZUlkc1tpXTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsaW1pbmF0ZUdyaWQodW5pcXVlSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lcmdlVGltZXMgPiAwKSB7XG4gICAgICAgICAgICB1aW1hbmFnZXIuc2hvd1RpcHMoJ+eZvOeUn+a2iOmZpO+8jOaMgee7reS4i+S4gOi9ruajgOa1iycpO1xuICAgICAgICAgICAgYXVkaW9NZ3Iuc2hha2UoU0hBS0VfVFlQRS5IRUFWWSk7XG4gICAgICAgICAgICB0aGlzLmFkZFNjb3JlKG1lcmdlVGltZXMpO1xuICAgICAgICAgICAgdGhpcy5jaGVjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaXNHYW1lT3ZlciA9IHRoaXMuY2hlY2tHYW1lT3ZlcigpO1xuICAgICAgICAgICAgY29uc3QgaXNHcmlkRW1wdHkgPSB0aGlzLmNoZWNrR3JpZEVtcHR5KCk7XG5cbiAgICAgICAgICAgIGlmIChpc0dhbWVPdmVyKSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNQcm9kdWNlKSB7XG4gICAgICAgICAgICAgICAgLy8g5rKh5pyJ5Y+v5Lul6L+b6KGM5raI6Zmk55qE5LqG77yM5bm25LiU6L+Y5pyq5bGV56S65paw55Sf5oiQ55qE5LiA5o6S77yM5YiZ5bGV56S65LiL5LiA5o6SXG4gICAgICAgICAgICAgICAgdGhpcy5oYXNQcm9kdWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWROZXh0KCk7XG4gICAgICAgICAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKCflsZXnpLrkuIvkuIDooYwnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNHcmlkRW1wdHkpIHtcbiAgICAgICAgICAgICAgICAvLyDmlrDnlJ/miJDnmoTlt7Lnu4/lsZXnpLrkuobvvIzkuJTmsqHmnInlj6/lkIjmiJDvvIzkuJTlnLrkuIrmsqHmnInmo4vlrZBcbiAgICAgICAgICAgICAgICB0aGlzLmhhc1Byb2R1Y2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE5leHQoKTtcbiAgICAgICAgICAgICAgICB1aW1hbmFnZXIuc2hvd1RpcHMoJ+aji+ebmOS4uuepuu+8jOWxleekuuS4i+S4gOihjCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDmlrDnlJ/miJDnmoTkuIDmjpLlt7Lnu4/lsZXnpLrov4fkuobvvIzkuJTlt7Lnu4/msqHmnInlj6/lkIjmiJDvvIzkuJTlnLrkuIrov5jmnInmo4vlrZBcbiAgICAgICAgICAgICAgICB0aGlzLmhhc1Byb2R1Y2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCA9IC0xO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhY3Rpb24gb3ZlcjonLCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOW9k+WJjeWcuuaZr+S4reaYr+WQpuW3sue7j+S4uuepulxuICAgIGNoZWNrR3JpZEVtcHR5KCk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaXNFbXB0eSA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1s5XS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ3JpZERhdGEgPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvWzldW2ldO1xuICAgICAgICAgICAgaWYgKGdyaWREYXRhWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICBpc0VtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzRW1wdHk7XG4gICAgfVxuXG4gICAgLy8g5raI6ZmkXG4gICAgZWxpbWluYXRlR3JpZCh1bmlxdWVJRDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZHNbaV0uZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnVuaXF1ZUlkID09PSB1bmlxdWVJRCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmtojpmaQnLCB1bmlxdWVJRCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0R29vZHModGhpcy5ncmlkc1tpXS5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuY29udGVudFR5cGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHNbaV0uZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLmVsaW1pbmF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5pS26ZuG54mp5ZOBXG4gICAgY29sbGVjdEdvb2RzKGNvbnRlbnRUeXBlKTogdm9pZCB7XG4gICAgfVxuXG4gICAgLy8g5qOA5rWL5b2T5YmN6KGM55qE5LiK5LiA6KGM5piv5ZCm5pyJ5o6J6JC95oOF5Ya177yM5aaC5p6c5pyJ5YiZ6L+b6KGM5o6J6JC95pON5L2cXG4gICAgZHJvcChyb3cpOiB2b2lkIHtcbiAgICAgICAgaWYgKHJvdyA9PT0gOSkge1xuICAgICAgICAgICAgdGhpcy5oYXNEcm9wQWN0aW9uID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocm93ID09PSAwKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNEcm9wQWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+aMgee7reaOieiQveajgOa1iycpO1xuICAgICAgICAgICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuWllYX0RST1ApO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2soKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVyZ2UoKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzLnRpbWVXYWl0RHJvcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCA4OyBjb2wrKykge1xuICAgICAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzFdID09PSBncmlkQ29udGVudFR5cGUuRU1QVFkgJiYgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3cgLSAxXVtjb2xdWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAvLyDmo4DmtYvmmK/lkKblj6/ku6XmjonokL1cbiAgICAgICAgICAgICAgICBjb25zdCBoYXNEcm9wID0gdGhpcy5kcm9wR3JpZChyb3cgLSAxLCBjb2wpO1xuICAgICAgICAgICAgICAgIGlmIChoYXNEcm9wKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFzRHJvcEFjdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcm9wKHJvdyAtIDEpO1xuICAgIH1cblxuICAgIGRyb3BHcmlkKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvLyDmo4DmtYvlr7nlupTnmoTnqbrmoLzlrZDmmK/lkKblj6/ku6XlrrnnurPmjonkuIvmnaXnmoTmoLzlrZDnsbvlnotcbiAgICAgICAgY29uc3QgdW5pcXVlSUQgPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsyXTtcbiAgICAgICAgY29uc3QgY2hlY2tDb2xzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2ldWzJdID09PSB1bmlxdWVJRCkge1xuICAgICAgICAgICAgICAgIGNoZWNrQ29scy5wdXNoKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNhbkRyb3AgPSB0cnVlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoZWNrQ29scy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY29sID0gY2hlY2tDb2xzW2ldO1xuICAgICAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93ICsgMV1bY29sXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgY2FuRHJvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWmguaenOWPr+S7peaOieiQve+8jOmCo+WwseWwhuaVsOaNrui/m+ihjOS6pOaNou+8jOWQjOaXtuabtOaWsOagvOWtkOeahOiHqui6q+WxnuaAp+WSjOS9jee9ruS/oeaBr1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoZWNrQ29scy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY29sID0gY2hlY2tDb2xzW2ldO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3cgKyAxXVtjb2xdWzBdID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMF07XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3JvdyArIDFdW2NvbF1bMV0gPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsxXTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93ICsgMV1bY29sXVsyXSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzJdO1xuXG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVswXSA9IDA7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsxXSA9IGdyaWRDb250ZW50VHlwZS5FTVBUWTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzJdID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCfmjonokL06JywgdW5pcXVlSUQpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ3JpZCA9IHRoaXMuZ3JpZHNbaV07XG4gICAgICAgICAgICBpZiAoZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkudW5pcXVlSWQgPT09IHVuaXF1ZUlEKSB7XG4gICAgICAgICAgICAgICAgZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJZID0genl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogKDEwIC0gcm93IC0gMSkgLSB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGg7XG4gICAgICAgICAgICAgICAgY2MudHdlZW4oZ3JpZClcbiAgICAgICAgICAgICAgICAgICAgLnRvKHRoaXMudGltZUdyaWREcm9wLCB7IHk6IHRhclkgfSwgeyBlYXNpbmc6ICdxdWFydEluJyB9KVxuICAgICAgICAgICAgICAgICAgICAuc3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjYW5Ecm9wO1xuICAgIH1cblxuICAgIC8vIOajgOmqjOaYr+WQpue7k+adn1xuICAgIGNoZWNrR2FtZU92ZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmNoZWNrR2FtZU92ZXIoKSkge1xuICAgICAgICAgICAgdWltYW5hZ2VyLnNob3dHYW1lT3ZlcigpO1xuICAgICAgICAgICAgYXVkaW9NZ3Iuc3RvcEJHTSgpO1xuICAgICAgICAgICAgYXVkaW9NZ3Iuc2hha2UoU0hBS0VfVFlQRS5IRUFWWSk7XG4gICAgICAgICAgICBhdWRpb01nci5wbGF5U291bmQoU291bmRUeXBlLlpZWF9FTkQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIOWKoOWIhlxuICAgIGFkZFNjb3JlKHNjb3JlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgLy8g5b2T5YmN5YiG5pWwXG4gICAgICAgIHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmUgKz0gc2NvcmU7XG4gICAgICAgIHRoaXMudWxibFNjb3JlLnN0cmluZyA9IHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmUudG9TdHJpbmcoKTtcblxuICAgICAgICAvLyDmnIDpq5jliIbmm7TmlrBcbiAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmUgPj0genl4R2FtZU1vZHVsZS5zY29yZVJlY29yZCkge1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5zY29yZVJlY29yZCA9IHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmU7XG4gICAgICAgICAgICB0aGlzLnVsYmxNYXhTY29yZS5zdHJpbmcgPSBgQkVTVO+8miR7enl4R2FtZU1vZHVsZS5zY29yZVJlY29yZH1gO1xuICAgICAgICAgICAgdGhpcy51bGJsTWF4U2NvcmUubm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pif5pifXG4gICAgICAgIGNvbnN0IHRhclcgPSB6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLnNjb3JlICUgdGhpcy5zdGFyTWVhc3VyZXMgKiB0aGlzLnN0YXJCYXJMZW5ndGggLyB0aGlzLnN0YXJNZWFzdXJlcztcbiAgICAgICAgY2MudHdlZW4odGhpcy51SW1nU3RhckJhcilcbiAgICAgICAgICAgIC50bygwLjUsIHsgd2lkdGg6IHRhclcgfSlcbiAgICAgICAgICAgIC5zdGFydCgpO1xuICAgICAgICBpZiAodGFyVyA9PT0gMCkge1xuICAgICAgICAgICAgLy8g5pif5pif5pWw6YePKzEgICBcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc3RhciArPSAxO1xuICAgICAgICAgICAgdGhpcy51bGJsU3RhckNudC5zdHJpbmcgPSB6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLnN0YXIudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy8g56e75Yqo5qC85a2Q5Lit77yM5o+Q56S65b2T5YmN56e75Yqo55qE5L2N572uXG4gICAgbW92ZUdyaWQoZSk6IHZvaWQge1xuICAgICAgICB0aGlzLnVJbWdTZWxlY3RlZEJnLmFjdGl2ZSA9IGUuZGF0YS5hY3Rpb24gPT09ICdtb3ZlJztcbiAgICAgICAgY29uc3QgZ3JpZEdsb2JhbFBvcyA9IGUuZGF0YS5ub2RlLnBhcmVudC5jb252ZXJ0VG9Xb3JsZFNwYWNlQVIoZS5kYXRhLm5vZGUuZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgIHRoaXMudUltZ1NlbGVjdGVkQmcueCA9IHRoaXMubm9kZS5jb252ZXJ0VG9Ob2RlU3BhY2VBUihncmlkR2xvYmFsUG9zKS54O1xuICAgICAgICB0aGlzLnVJbWdTZWxlY3RlZEJnLndpZHRoID0gZS5kYXRhLm5vZGUud2lkdGg7XG4gICAgfVxuXG4gICAgdGVzdCgpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coenl4R2FtZU1vZHVsZS5ncmlkSW5mbyk7XG4gICAgICAgIHVpbWFuYWdlci5zaG93VGlwcygn5YiG5LqrJyk7XG4gICAgICAgIHd4QXBpTWFuYWdlci5zaGFyZSgn5Yir5Y235ZWm77yM5b+r5p2l5Y2h55qu5LiA5LiL5ZCnficpO1xuICAgIH1cblxuICAgIC8vIOS9v+eUqOeCuOW8uVxuICAgIHVzZUJvbWIoKTogdm9pZCB7XG4gICAgICAgIHVpbWFuYWdlci5zaG93VGlwcygn5L2/55So54K45by5Jyk7XG4gICAgICAgIHd4QXBpTWFuYWdlci5zaGFyZSgn5Yir5Y235ZWm77yM5b+r5p2l5Y2h55qu5LiA5LiL5ZCnficpO1xuICAgIH1cblxuICAgIC8vIOS9v+eUqOWNoeearuW3tOaLiVxuICAgIHVzZUhhbW1lcigpOiB2b2lkIHtcbiAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKCfkvb/nlKjljaHnmq7lt7Tmi4knKTtcbiAgICAgICAgd3hBcGlNYW5hZ2VyLnNoYXJlKCfliKvljbfllabvvIzlv6vmnaXljaHnmq7kuIDkuIvlkKd+Jyk7XG4gICAgfVxuXG59XG4iXX0=