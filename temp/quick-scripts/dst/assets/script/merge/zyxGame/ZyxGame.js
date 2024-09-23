
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
        _this.ulblDiamond = null;
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
        // 
        _this.starMeasures = 10;
        return _this;
    }
    ZyxGame.prototype.onLoad = function () {
        this.uBtnClean.on(cc.Node.EventType.TOUCH_END, this.test, this);
        this.uBtnBomb.on(cc.Node.EventType.TOUCH_END, this.useBomb, this);
        this.uBtnHammer.on(cc.Node.EventType.TOUCH_END, this.useHammer, this);
        EventManager_1.eventManager.on(Define_1.EventType.ZYX_CHECK_MERGE, this.check, this);
        EventManager_1.eventManager.on(Define_1.EventType.ZYX_RESET_GAME, this.resetGame, this);
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
            diamond: 0,
            adTimes: 3,
            exp: 0,
            uniqueId: 9,
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
        this.ulblDiamond.string = "" + ZyxGameModule_1.zyxGameModule.gameInfo.diamond;
        this.ulblStarCnt.string = "" + ZyxGameModule_1.zyxGameModule.gameInfo.star;
        this.ulblAdCnt.string = "(" + ZyxGameModule_1.zyxGameModule.gameInfo.adTimes + ")";
        this.ulblHammerCnt.string = "x" + PlayerModule_1.playerModule.hammer;
        this.ulblBombCnt.string = "x" + PlayerModule_1.playerModule.bomb;
        this.uImgStarBar.width = ZyxGameModule_1.zyxGameModule.gameInfo.score % this.starMeasures * this.starBarLength / this.starMeasures;
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
    ZyxGame.prototype.collectGoods = function (contentType) {
        if (contentType === TypeDefine_1.gridContentType.DIAMOND) {
            this.addDimaond();
        }
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
    // 加钻
    ZyxGame.prototype.addDimaond = function () {
        ZyxGameModule_1.zyxGameModule.gameInfo.diamond += 1;
        this.ulblDiamond.string = ZyxGameModule_1.zyxGameModule.gameInfo.diamond.toString();
    };
    ZyxGame.prototype.test = function () {
        console.log(ZyxGameModule_1.zyxGameModule.gridInfo);
        Uimanager_1.uimanager.showTips('分享');
        WxApiManager_1.wxApiManager.share();
    };
    // 使用炸弹
    ZyxGame.prototype.useBomb = function () {
        Uimanager_1.uimanager.showTips('使用炸弹');
        WxApiManager_1.wxApiManager.share();
    };
    // 使用卡皮巴拉
    ZyxGame.prototype.useHammer = function () {
        Uimanager_1.uimanager.showTips('使用卡皮巴拉');
        WxApiManager_1.wxApiManager.share();
    };
    __decorate([
        property(cc.Label)
    ], ZyxGame.prototype, "ulblScore", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxGame.prototype, "ulblMaxScore", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxGame.prototype, "ulblDiamond", void 0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUEwRDtBQUMxRCw2REFBNEQ7QUFDNUQsbURBQXVEO0FBQ3ZELGdEQUFzRTtBQUN0RSw0Q0FBOEM7QUFDOUMsa0RBQWlEO0FBQ2pELHFEQUFvRDtBQUNwRCxxREFBb0Q7QUFDcEQsMkNBQXNDO0FBQ3RDLDJDQUFzQztBQUdoQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxVQUFVO0FBRVY7SUFBcUMsMkJBQVk7SUFBakQ7UUFBQSxxRUFzZkM7UUFuZkcsZUFBUyxHQUFhLElBQUksQ0FBQztRQUczQixrQkFBWSxHQUFhLElBQUksQ0FBQztRQUc5QixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixtQkFBYSxHQUFhLElBQUksQ0FBQztRQUcvQixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixlQUFTLEdBQWEsSUFBSSxDQUFDO1FBRzNCLGlCQUFXLEdBQVksSUFBSSxDQUFDO1FBRzVCLGdCQUFVLEdBQVksSUFBSSxDQUFDO1FBRzNCLGNBQVEsR0FBWSxJQUFJLENBQUM7UUFHekIsZUFBUyxHQUFZLElBQUksQ0FBQztRQUcxQixjQUFRLEdBQVksSUFBSSxDQUFDO1FBR3pCLGFBQU8sR0FBWSxJQUFJLENBQUM7UUFFaEIsV0FBSyxHQUFjLEVBQUUsQ0FBQztRQUU5QixxREFBcUQ7UUFDN0MsbUJBQWEsR0FBWSxLQUFLLENBQUM7UUFFdkMsNEJBQTRCO1FBQ3BCLGdCQUFVLEdBQVksS0FBSyxDQUFDO1FBRXBDLFNBQVM7UUFDRCxrQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUMzQixrQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUMzQixzQkFBZ0IsR0FBVyxJQUFJLENBQUM7UUFFeEMsdUJBQXVCO1FBQ2YsbUJBQWEsR0FBVyxHQUFHLENBQUM7UUFDcEMsR0FBRztRQUNLLGtCQUFZLEdBQVcsRUFBRSxDQUFDOztJQTZidEMsQ0FBQztJQTNiRyx3QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdEUsMkJBQVksQ0FBQyxFQUFFLENBQUMsa0JBQVMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCwyQkFBWSxDQUFDLEVBQUUsQ0FBQyxrQkFBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWhFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsdUJBQUssR0FBTDtJQUVBLENBQUM7SUFFRCwyQkFBUyxHQUFUO1FBQ0ksNkJBQWEsQ0FBQyxRQUFRLEdBQUc7WUFDckIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFD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LFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsNkJBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUUsNkJBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLDZCQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlFLDZCQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5RSw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEMsNkJBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsNEJBQWUsQ0FBQyxLQUFLLENBQUM7WUFDNUQsNkJBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzNDO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hDLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxJ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QUM7NENBQ007SUF2Q1AsT0FBTztRQUQzQixPQUFPO09BQ2EsT0FBTyxDQXNmM0I7SUFBRCxjQUFDO0NBdGZELEFBc2ZDLENBdGZvQyxFQUFFLENBQUMsU0FBUyxHQXNmaEQ7a0JBdGZvQixPQUFPIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGxheWVyTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvUGxheWVyTW9kdWxlXCI7XG5pbXBvcnQgeyB6eXhHYW1lTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvWnl4R2FtZU1vZHVsZVwiO1xuaW1wb3J0IHsgZ3JpZENvbnRlbnRUeXBlIH0gZnJvbSBcIi4uL2RlZmluZS9UeXBlRGVmaW5lXCI7XG5pbXBvcnQgeyBhdWRpb01nciwgU0hBS0VfVFlQRSwgU291bmRUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvQXVkaW9NZ3JcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gXCIuLi9tYW5hZ2VyL0RlZmluZVwiO1xuaW1wb3J0IHsgdWltYW5hZ2VyIH0gZnJvbSBcIi4uL21hbmFnZXIvVWltYW5hZ2VyXCI7XG5pbXBvcnQgeyBldmVudE1hbmFnZXIgfSBmcm9tIFwiLi4vdXRpbC9FdmVudE1hbmFnZXJcIjtcbmltcG9ydCB7IHd4QXBpTWFuYWdlciB9IGZyb20gXCIuLi91dGlsL1d4QXBpTWFuYWdlclwiO1xuaW1wb3J0IFp5eEdyaWRDb20gZnJvbSBcIi4vWnl4R3JpZENvbVwiO1xuaW1wb3J0IFp5eExpbmVDb20gZnJvbSBcIi4vWnl4TGluZUNvbVwiO1xuXG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbi8vIOa4uOaIj+S4u+eOqeazleWcuuaZr1xuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFp5eEdhbWUgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxTY29yZTogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxNYXhTY29yZTogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxEaWFtb25kOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFN0YXJDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsSGFtbWVyQ250OiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibEJvbWJDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsQWRDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdTdGFyQmFyOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCdG5IYW1tZXI6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0bkJvbWI6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0bkNsZWFuOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCb3hHcmlkOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCb3hOZXc6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBncmlkczogY2MuTm9kZVtdID0gW107XG5cbiAgICAvLyDmjonokL3lj5HnlJ/mg4XlhrXvvIjmjonokL3pnIDopoHoh6rlupXlkJHkuIrmo4DmtYvvvIzkuIDova7mo4DmtYvlkI7lho3mo4DmtYvkuIvkuIDova7vvIznm7TliLDmnIDnu4jlj6/ku6Xlj5HnlJ/mjonokL3nmoTmg4XlhrXlhajpg6jmo4DmtYvlrozmr5XvvIlcbiAgICBwcml2YXRlIGhhc0Ryb3BBY3Rpb246IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8vIOaYr+WQpuW3sue7j+eUn+S6p+S6huaWsOeahCAtIOmYsuatoui/m+ihjOaXoOmZkOW+queOr+eUn+aIkOWSjOajgOa1i1xuICAgIHByaXZhdGUgaGFzUHJvZHVjZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLy8g5qC85a2Q5o6J6JC95pe26Ze0XG4gICAgcHJpdmF0ZSB0aW1lR3JpZERyb3A6IG51bWJlciA9IDAuMjtcbiAgICBwcml2YXRlIHRpbWVXYWl0RHJvcDogbnVtYmVyID0gNjAwO1xuICAgIHByaXZhdGUgdGltZVNob3dOZXdHcmlkczogbnVtYmVyID0gMC40NDtcblxuICAgIC8vIHN0YXIgYmFyIHRvdGFsTGVuZ3RoXG4gICAgcHJpdmF0ZSBzdGFyQmFyTGVuZ3RoOiBudW1iZXIgPSA1MDA7XG4gICAgLy8gXG4gICAgcHJpdmF0ZSBzdGFyTWVhc3VyZXM6IG51bWJlciA9IDEwO1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLnVCdG5DbGVhbi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMudGVzdCwgdGhpcyk7XG4gICAgICAgIHRoaXMudUJ0bkJvbWIub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLnVzZUJvbWIsIHRoaXMpO1xuICAgICAgICB0aGlzLnVCdG5IYW1tZXIub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLnVzZUhhbW1lciwgdGhpcyk7XG5cbiAgICAgICAgZXZlbnRNYW5hZ2VyLm9uKEV2ZW50VHlwZS5aWVhfQ0hFQ0tfTUVSR0UsIHRoaXMuY2hlY2ssIHRoaXMpO1xuICAgICAgICBldmVudE1hbmFnZXIub24oRXZlbnRUeXBlLlpZWF9SRVNFVF9HQU1FLCB0aGlzLnJlc2V0R2FtZSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5pbml0VUkoKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcblxuICAgIH1cblxuICAgIHJlc2V0R2FtZSgpOiB2b2lkIHtcbiAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mbyA9IFtcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMywgMSwgMV0sIFszLCAxLCAxXSwgWzMsIDEsIDFdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMSwgMSwgMl0sIFsxLCAxLCAzXSwgWzEsIDEsIDRdLCBbMSwgMSwgNV0sIFsxLCAxLCA2XSwgWzEsIDEsIDddLCBbMSwgMSwgOF0sIFswLCAwLCAwXV0sXG4gICAgICAgIF1cbiAgICAgICAgenl4R2FtZU1vZHVsZS5nYW1lSW5mbyA9IHtcbiAgICAgICAgICAgIHNjb3JlOiAwLFxuICAgICAgICAgICAgc3RhcjogMCxcbiAgICAgICAgICAgIGRpYW1vbmQ6IDAsXG4gICAgICAgICAgICBhZFRpbWVzOiAzLFxuICAgICAgICAgICAgZXhwOiAwLFxuICAgICAgICAgICAgdW5pcXVlSWQ6IDksXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZU5leHRHcmlkKCk7XG5cbiAgICAgICAgdGhpcy5oYXNQcm9kdWNlID0gZmFsc2U7XG4gICAgICAgIHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkID0gLTE7XG5cbiAgICAgICAgdGhpcy5pbml0VUkoKTtcblxuICAgICAgICBjb25zb2xlLmxvZygnZ3JpZEluZm86ICcsIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8pO1xuICAgIH1cblxuICAgIGluaXRVSSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51bGJsU2NvcmUuc3RyaW5nID0gYCR7enl4R2FtZU1vZHVsZS5nYW1lSW5mby5zY29yZX1gO1xuICAgICAgICB0aGlzLnVsYmxNYXhTY29yZS5zdHJpbmcgPSBgQkVTVO+8miR7enl4R2FtZU1vZHVsZS5zY29yZVJlY29yZH1gO1xuICAgICAgICB0aGlzLnVsYmxNYXhTY29yZS5ub2RlLmFjdGl2ZSA9IHp5eEdhbWVNb2R1bGUuc2NvcmVSZWNvcmQgPiAwO1xuICAgICAgICB0aGlzLnVsYmxEaWFtb25kLnN0cmluZyA9IGAke3p5eEdhbWVNb2R1bGUuZ2FtZUluZm8uZGlhbW9uZH1gO1xuICAgICAgICB0aGlzLnVsYmxTdGFyQ250LnN0cmluZyA9IGAke3p5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc3Rhcn1gO1xuICAgICAgICB0aGlzLnVsYmxBZENudC5zdHJpbmcgPSBgKCR7enl4R2FtZU1vZHVsZS5nYW1lSW5mby5hZFRpbWVzfSlgO1xuICAgICAgICB0aGlzLnVsYmxIYW1tZXJDbnQuc3RyaW5nID0gYHgke3BsYXllck1vZHVsZS5oYW1tZXJ9YDtcbiAgICAgICAgdGhpcy51bGJsQm9tYkNudC5zdHJpbmcgPSBgeCR7cGxheWVyTW9kdWxlLmJvbWJ9YDtcbiAgICAgICAgdGhpcy51SW1nU3RhckJhci53aWR0aCA9IHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmUgJSB0aGlzLnN0YXJNZWFzdXJlcyAqIHRoaXMuc3RhckJhckxlbmd0aCAvIHRoaXMuc3Rhck1lYXN1cmVzO1xuXG4gICAgICAgIHRoaXMuaW5pdENoZXNzQm9hcmQoKTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGF1ZGlvTWdyLnBsYXlCR00oU291bmRUeXBlLlpZWF9NVVNJQ19HQU1FKTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfVxuXG4gICAgLy8g5Yid5aeL5YyW5qOL55uY5L+h5oGvXG4gICAgYXN5bmMgaW5pdENoZXNzQm9hcmQoKSB7XG4gICAgICAgIHRoaXMudUJveEdyaWQuZGVzdHJveUFsbENoaWxkcmVuKCk7XG4gICAgICAgIHRoaXMuZ3JpZHMgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvLmxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XS5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGF3YWl0IHRoaXMucHJvZHVjZUdyaWQoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51Qm94R3JpZC5hZGRDaGlsZChncmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogY29sLCB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiAoMTAgLSByb3cpIC0genl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5zZXRSb3dDZWwocm93LCBjb2wpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkcy5wdXNoKGdyaWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsxXSAhPSBncmlkQ29udGVudFR5cGUuRU1QVFkgJiYgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMl0gIT09IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2wgLSAxXVsyXSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBncmlkID0gYXdhaXQgdGhpcy5wcm9kdWNlR3JpZCh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudUJveEdyaWQuYWRkQ2hpbGQoZ3JpZCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogY29sLCB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiAoMTAgLSByb3cpIC0genl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoKSk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnNldFJvd0NlbChyb3csIGNvbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHMucHVzaChncmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDliqDovb3kuIvkuIDooYxcbiAgICBsb2FkTmV4dCgpIHtcbiAgICAgICAgdGhpcy5tb3ZlVXAoKTtcblxuICAgICAgICB0aGlzLnByb2R1Y2VSb3coKTtcbiAgICB9XG5cbiAgICAvLyDnlJ/miJDmlrDnmoTkuIDooYxcbiAgICBhc3luYyBwcm9kdWNlUm93KCkge1xuICAgICAgICAvLyDliZTpmaTpobbpg6jnqbrkvZnnmoTkuIDooYxcbiAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mby5zaGlmdCgpO1xuXG4gICAgICAgIC8vIOWwhuaWsOeahOS4gOaOkueahOaVsOaNrui/m+ihjOaLt+i0neW5tuS9v+eUqFxuICAgICAgICBjb25zdCBuZXdEYXRhID0genl4R2FtZU1vZHVsZS5jb3B5TmV3R3JpZERhdGEoKTtcblxuICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvLnB1c2gobmV3RGF0YSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSA5O1xuICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2ldWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGF3YWl0IHRoaXMucHJvZHVjZUdyaWQoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51Qm94R3JpZC5hZGRDaGlsZChncmlkKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5zZXRQb3NpdGlvbihuZXcgY2MuVmVjMih6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiBpLCAtODQpKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuc2V0Um93Q2VsKHJvdywgaSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHMucHVzaChncmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXVsxXSAhPSBncmlkQ29udGVudFR5cGUuRU1QVFkgJiYgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2ldWzJdICE9PSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11baSAtIDFdWzJdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGF3YWl0IHRoaXMucHJvZHVjZUdyaWQoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2ldKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVCb3hHcmlkLmFkZENoaWxkKGdyaWQpO1xuICAgICAgICAgICAgICAgIGdyaWQuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogaSwgLTg0KSk7XG4gICAgICAgICAgICAgICAgZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuc2V0Um93Q2VsKHJvdywgaSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkcy5wdXNoKGdyaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5bGV56S65paw5qC85a2QXG4gICAgICAgIHRoaXMuc2hvd05ld0dyaWRzKCk7XG4gICAgfVxuXG4gICAgLy8g55Sf5oiQ5qC85a2QXG4gICAgYXN5bmMgcHJvZHVjZUdyaWQoZ3JpZEluZm86IG51bWJlcltdKSB7XG4gICAgICAgIGNvbnN0IGdyaWQgPSBhd2FpdCB1aW1hbmFnZXIubG9hZFByZWZhYigncHJlZmFiL3p5eC91Q29tR3JpZCcpO1xuICAgICAgICBjb25zdCBncmlkTm9kZSA9IGNjLmluc3RhbnRpYXRlKGdyaWQpO1xuICAgICAgICBncmlkTm9kZS5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuaW5pdChncmlkSW5mbyk7XG4gICAgICAgIHJldHVybiBncmlkTm9kZTtcbiAgICB9XG5cbiAgICAvLyDlsZXnpLrmlrDmoLzlrZBcbiAgICBzaG93TmV3R3JpZHMoKTogdm9pZCB7XG4gICAgICAgIGxldCBzaG93RW5kaW5nOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ3JpZCA9IHRoaXMuZ3JpZHNbaV07XG4gICAgICAgICAgICBpZiAoZ3JpZC55ICE9PSAtODQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY2MudHdlZW4oZ3JpZClcbiAgICAgICAgICAgICAgICAudG8odGhpcy50aW1lU2hvd05ld0dyaWRzLCB7IHk6IGdyaWQueSArIDg0IH0sIHsgZWFzaW5nOiAnY3ViaWNJbk91dCcgfSlcbiAgICAgICAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaG93RW5kaW5nKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIHNob3dFbmRpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIOS4i+S4gOaOkuWxleekuuWujOaIkO+8jOW8gOWni+ajgOa1i+aYr+WQpuWPr+S7pei/m+ihjOWQiOaIkFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrKCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuc3RhcnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlTmV4dEdyaWQoKTtcbiAgICB9XG5cbiAgICAvLyDnlJ/miJDkuYvliY3vvIzlhYjkuIrnp7tcbiAgICBtb3ZlVXAoKTogdm9pZCB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ3JpZCA9IHRoaXMuZ3JpZHNbaV07XG4gICAgICAgICAgICBjYy50d2VlbihncmlkKVxuICAgICAgICAgICAgICAgIC50byh0aGlzLnRpbWVTaG93TmV3R3JpZHMsIHsgeTogZ3JpZC55ICsgODQgfSwgeyBlYXNpbmc6ICdjdWJpY0luT3V0JyB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuXG4gICAgICAgICAgICBncmlkLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5tb3ZlVXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWIt+aWsOS4i+S4gOWxguagvOWtkOeahOS/oeaBr1xuICAgIGFzeW5jIHVwZGF0ZU5leHRHcmlkKCkge1xuICAgICAgICAvLyDmlbDmja7liLfmlrBcbiAgICAgICAgenl4R2FtZU1vZHVsZS5wcm9kdWNlKCk7XG5cbiAgICAgICAgLy8g5bGV56S65Yi35pawXG4gICAgICAgIHRoaXMudUJveE5ldy5kZXN0cm95QWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUubmV4dEdyaWRJbmZvW2ldWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGluZSA9IGF3YWl0IHRoaXMucHJvZHVjZU5ld0xpbmUoenl4R2FtZU1vZHVsZS5uZXh0R3JpZEluZm9baV1bMF0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVCb3hOZXcuYWRkQ2hpbGQobGluZSk7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogaSwgMCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoenl4R2FtZU1vZHVsZS5uZXh0R3JpZEluZm9baV1bMV0gIT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZICYmIHp5eEdhbWVNb2R1bGUubmV4dEdyaWRJbmZvW2ldWzJdICE9PSB6eXhHYW1lTW9kdWxlLm5leHRHcmlkSW5mb1tpIC0gMV1bMl0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lID0gYXdhaXQgdGhpcy5wcm9kdWNlTmV3TGluZSh6eXhHYW1lTW9kdWxlLm5leHRHcmlkSW5mb1tpXVswXSk7XG4gICAgICAgICAgICAgICAgdGhpcy51Qm94TmV3LmFkZENoaWxkKGxpbmUpO1xuICAgICAgICAgICAgICAgIGxpbmUuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogaSwgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcHJvZHVjZU5ld0xpbmUoc2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBhd2FpdCB1aW1hbmFnZXIubG9hZFByZWZhYigncHJlZmFiL3p5eC91Q29tTmV4dExpbmUnKTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNjLmluc3RhbnRpYXRlKGxpbmUpO1xuICAgICAgICBub2RlLmdldENvbXBvbmVudChaeXhMaW5lQ29tKS5zZXRXKHNpemUgKiB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGgpO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICAvLyDlvqrnjq/mo4DmtYvmmK/lkKblj6/ku6XmjonokL3lkozmtojpmaRcbiAgICBjaGVjaygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kcm9wKDkpO1xuICAgIH1cblxuICAgIC8vIOi/m+ihjOWQiOaIkOaTjeS9nCAtIOWQiOaIkOaTjeS9nOaYr+S4gOi9rua2iOmZpOajgOa1i+eahOacgOWQjuS4gOS4quWKqOS9nFxuICAgIG1lcmdlKCk6IHZvaWQge1xuICAgICAgICBsZXQgbWVyZ2VUaW1lcyA9IDA7XG4gICAgICAgIC8vIOajgOa1i+avj+S4gOihjOaYr+WQpuacieWPr+S7pea2iOmZpOeahOagvOWtkFxuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvLmxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0RhdGEgPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd107XG4gICAgICAgICAgICBsZXQgaGFzRW1wdHlHcmlkID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJvd0RhdGEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocm93RGF0YVtqXVsxXSA9PT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhc0VtcHR5R3JpZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5aaC5p6c5rKh5pyJ56m65qC85a2Q77yM6YKj5bCx5Y+v5Lul6L+b6KGM5raI6ZmkXG4gICAgICAgICAgICBjb25zdCB1bmlxdWVJZHMgPSBbXTtcbiAgICAgICAgICAgIGlmICghaGFzRW1wdHlHcmlkKSB7XG4gICAgICAgICAgICAgICAgbWVyZ2VUaW1lcysrO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcm93RGF0YS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodW5pcXVlSWRzLmluZGV4T2Yocm93RGF0YVtqXVsyXSkgPT09IC0xICYmIHJvd0RhdGFbal1bMl0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXF1ZUlkcy5wdXNoKHJvd0RhdGFbal1bMl0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2pdID0gWzAsIDAsIDBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5raI6ZmkXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVuaXF1ZUlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZUlkID0gdW5pcXVlSWRzW2ldO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxpbWluYXRlR3JpZCh1bmlxdWVJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWVyZ2VUaW1lcyA+IDApIHtcbiAgICAgICAgICAgIHVpbWFuYWdlci5zaG93VGlwcygn55m855Sf5raI6Zmk77yM5oyB57ut5LiL5LiA6L2u5qOA5rWLJyk7XG4gICAgICAgICAgICBhdWRpb01nci5zaGFrZShTSEFLRV9UWVBFLkhFQVZZKTtcbiAgICAgICAgICAgIHRoaXMuYWRkU2NvcmUobWVyZ2VUaW1lcyk7XG4gICAgICAgICAgICB0aGlzLmNoZWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBpc0dhbWVPdmVyID0gdGhpcy5jaGVja0dhbWVPdmVyKCk7XG4gICAgICAgICAgICBjb25zdCBpc0dyaWRFbXB0eSA9IHRoaXMuY2hlY2tHcmlkRW1wdHkoKTtcblxuICAgICAgICAgICAgaWYgKGlzR2FtZU92ZXIpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc1Byb2R1Y2UpIHtcbiAgICAgICAgICAgICAgICAvLyDmsqHmnInlj6/ku6Xov5vooYzmtojpmaTnmoTkuobvvIzlubbkuJTov5jmnKrlsZXnpLrmlrDnlJ/miJDnmoTkuIDmjpLvvIzliJnlsZXnpLrkuIvkuIDmjpJcbiAgICAgICAgICAgICAgICB0aGlzLmhhc1Byb2R1Y2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE5leHQoKTtcbiAgICAgICAgICAgICAgICB1aW1hbmFnZXIuc2hvd1RpcHMoJ+WxleekuuS4i+S4gOihjCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0dyaWRFbXB0eSkge1xuICAgICAgICAgICAgICAgIC8vIOaWsOeUn+aIkOeahOW3sue7j+WxleekuuS6hu+8jOS4lOayoeacieWPr+WQiOaIkO+8jOS4lOWcuuS4iuayoeacieaji+WtkFxuICAgICAgICAgICAgICAgIHRoaXMuaGFzUHJvZHVjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkTmV4dCgpO1xuICAgICAgICAgICAgICAgIHVpbWFuYWdlci5zaG93VGlwcygn5qOL55uY5Li656m677yM5bGV56S65LiL5LiA6KGMJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIOaWsOeUn+aIkOeahOS4gOaOkuW3sue7j+Wxleekuui/h+S6hu+8jOS4lOW3sue7j+ayoeacieWPr+WQiOaIkO+8jOS4lOWcuuS4iui/mOacieaji+WtkFxuICAgICAgICAgICAgICAgIHRoaXMuaGFzUHJvZHVjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkID0gLTE7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FjdGlvbiBvdmVyOicsIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5b2T5YmN5Zy65pmv5Lit5piv5ZCm5bey57uP5Li656m6XG4gICAgY2hlY2tHcmlkRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpc0VtcHR5ID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvWzldLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBncmlkRGF0YSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bOV1baV07XG4gICAgICAgICAgICBpZiAoZ3JpZERhdGFbMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgIGlzRW1wdHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNFbXB0eTtcbiAgICB9XG5cbiAgICAvLyDmtojpmaRcbiAgICBlbGltaW5hdGVHcmlkKHVuaXF1ZUlEOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkc1tpXS5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkudW5pcXVlSWQgPT09IHVuaXF1ZUlEKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+a2iOmZpCcsIHVuaXF1ZUlEKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RHb29kcyh0aGlzLmdyaWRzW2ldLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5jb250ZW50VHlwZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkc1tpXS5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuZWxpbWluYXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb2xsZWN0R29vZHMoY29udGVudFR5cGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKGNvbnRlbnRUeXBlID09PSBncmlkQ29udGVudFR5cGUuRElBTU9ORCkge1xuICAgICAgICAgICAgdGhpcy5hZGREaW1hb25kKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmo4DmtYvlvZPliY3ooYznmoTkuIrkuIDooYzmmK/lkKbmnInmjonokL3mg4XlhrXvvIzlpoLmnpzmnInliJnov5vooYzmjonokL3mk43kvZxcbiAgICBkcm9wKHJvdyk6IHZvaWQge1xuICAgICAgICBpZiAocm93ID09PSA5KSB7XG4gICAgICAgICAgICB0aGlzLmhhc0Ryb3BBY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyb3cgPT09IDApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0Ryb3BBY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5oyB57ut5o6J6JC95qOA5rWLJyk7XG4gICAgICAgICAgICAgICAgYXVkaW9NZ3IucGxheVNvdW5kKFNvdW5kVHlwZS5aWVhfRFJPUCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVjaygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXJnZSgpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMudGltZVdhaXREcm9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDg7IGNvbCsrKSB7XG4gICAgICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMV0gPT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSAmJiB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3JvdyAtIDFdW2NvbF1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgIC8vIOajgOa1i+aYr+WQpuWPr+S7peaOieiQvVxuICAgICAgICAgICAgICAgIGNvbnN0IGhhc0Ryb3AgPSB0aGlzLmRyb3BHcmlkKHJvdyAtIDEsIGNvbCk7XG4gICAgICAgICAgICAgICAgaWYgKGhhc0Ryb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXNEcm9wQWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRyb3Aocm93IC0gMSk7XG4gICAgfVxuXG4gICAgZHJvcEdyaWQocm93OiBudW1iZXIsIGNvbDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOajgOa1i+WvueW6lOeahOepuuagvOWtkOaYr+WQpuWPr+S7peWuuee6s+aOieS4i+adpeeahOagvOWtkOexu+Wei1xuICAgICAgICBjb25zdCB1bmlxdWVJRCA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzJdO1xuICAgICAgICBjb25zdCBjaGVja0NvbHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11baV1bMl0gPT09IHVuaXF1ZUlEKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tDb2xzLnB1c2goaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2FuRHJvcCA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hlY2tDb2xzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjb2wgPSBjaGVja0NvbHNbaV07XG4gICAgICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3cgKyAxXVtjb2xdWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICBjYW5Ecm9wID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aaC5p6c5Y+v5Lul5o6J6JC977yM6YKj5bCx5bCG5pWw5o2u6L+b6KGM5Lqk5o2i77yM5ZCM5pe25pu05paw5qC85a2Q55qE6Ieq6Lqr5bGe5oCn5ZKM5L2N572u5L+h5oGvXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hlY2tDb2xzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjb2wgPSBjaGVja0NvbHNbaV07XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3JvdyArIDFdW2NvbF1bMF0gPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVswXTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93ICsgMV1bY29sXVsxXSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzFdO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3cgKyAxXVtjb2xdWzJdID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMl07XG5cbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzBdID0gMDtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzFdID0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ+aOieiQvTonLCB1bmlxdWVJRCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBncmlkID0gdGhpcy5ncmlkc1tpXTtcbiAgICAgICAgICAgIGlmIChncmlkLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS51bmlxdWVJZCA9PT0gdW5pcXVlSUQpIHtcbiAgICAgICAgICAgICAgICBncmlkLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5tb3ZlRG93bigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhclkgPSB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiAoMTAgLSByb3cgLSAxKSAtIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aDtcbiAgICAgICAgICAgICAgICBjYy50d2VlbihncmlkKVxuICAgICAgICAgICAgICAgICAgICAudG8odGhpcy50aW1lR3JpZERyb3AsIHsgeTogdGFyWSB9LCB7IGVhc2luZzogJ3F1YXJ0SW4nIH0pXG4gICAgICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNhbkRyb3A7XG4gICAgfVxuXG4gICAgLy8g5qOA6aqM5piv5ZCm57uT5p2fXG4gICAgY2hlY2tHYW1lT3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuY2hlY2tHYW1lT3ZlcigpKSB7XG4gICAgICAgICAgICB1aW1hbmFnZXIuc2hvd0dhbWVPdmVyKCk7XG4gICAgICAgICAgICBhdWRpb01nci5zdG9wQkdNKCk7XG4gICAgICAgICAgICBhdWRpb01nci5zaGFrZShTSEFLRV9UWVBFLkhFQVZZKTtcbiAgICAgICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuWllYX0VORCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8g5Yqg5YiGXG4gICAgYWRkU2NvcmUoc2NvcmU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICAvLyDlvZPliY3liIbmlbBcbiAgICAgICAgenl4R2FtZU1vZHVsZS5nYW1lSW5mby5zY29yZSArPSBzY29yZTtcbiAgICAgICAgdGhpcy51bGJsU2NvcmUuc3RyaW5nID0genl4R2FtZU1vZHVsZS5nYW1lSW5mby5zY29yZS50b1N0cmluZygpO1xuXG4gICAgICAgIC8vIOacgOmrmOWIhuabtOaWsFxuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5nYW1lSW5mby5zY29yZSA+PSB6eXhHYW1lTW9kdWxlLnNjb3JlUmVjb3JkKSB7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLnNjb3JlUmVjb3JkID0genl4R2FtZU1vZHVsZS5nYW1lSW5mby5zY29yZTtcbiAgICAgICAgICAgIHRoaXMudWxibE1heFNjb3JlLnN0cmluZyA9IGBCRVNU77yaJHt6eXhHYW1lTW9kdWxlLnNjb3JlUmVjb3JkfWA7XG4gICAgICAgICAgICB0aGlzLnVsYmxNYXhTY29yZS5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmmJ/mmJ9cbiAgICAgICAgY29uc3QgdGFyVyA9IHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmUgJSB0aGlzLnN0YXJNZWFzdXJlcyAqIHRoaXMuc3RhckJhckxlbmd0aCAvIHRoaXMuc3Rhck1lYXN1cmVzO1xuICAgICAgICBjYy50d2Vlbih0aGlzLnVJbWdTdGFyQmFyKVxuICAgICAgICAgICAgLnRvKDAuNSwgeyB3aWR0aDogdGFyVyB9KVxuICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgICAgIGlmICh0YXJXID09PSAwKSB7XG4gICAgICAgICAgICAvLyDmmJ/mmJ/mlbDph48rMSAgIFxuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5nYW1lSW5mby5zdGFyICs9IDE7XG4gICAgICAgICAgICB0aGlzLnVsYmxTdGFyQ250LnN0cmluZyA9IHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc3Rhci50b1N0cmluZygpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvLyDliqDpkrtcbiAgICBhZGREaW1hb25kKCk6IHZvaWQge1xuICAgICAgICB6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLmRpYW1vbmQgKz0gMTtcbiAgICAgICAgdGhpcy51bGJsRGlhbW9uZC5zdHJpbmcgPSB6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLmRpYW1vbmQudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICB0ZXN0KCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvKTtcbiAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKCfliIbkuqsnKTtcbiAgICAgICAgd3hBcGlNYW5hZ2VyLnNoYXJlKCk7XG4gICAgfVxuXG4gICAgLy8g5L2/55So54K45by5XG4gICAgdXNlQm9tYigpOiB2b2lkIHtcbiAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKCfkvb/nlKjngrjlvLknKTtcbiAgICAgICAgd3hBcGlNYW5hZ2VyLnNoYXJlKCk7XG4gICAgfVxuXG4gICAgLy8g5L2/55So5Y2h55qu5be05ouJXG4gICAgdXNlSGFtbWVyKCk6dm9pZCB7XG4gICAgICAgIHVpbWFuYWdlci5zaG93VGlwcygn5L2/55So5Y2h55qu5be05ouJJyk7XG4gICAgICAgIHd4QXBpTWFuYWdlci5zaGFyZSgpO1xuICAgIH1cblxufVxuIl19