
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
var Define_1 = require("../manager/Define");
var Uimanager_1 = require("../manager/Uimanager");
var EventManager_1 = require("../util/EventManager");
var ZyxGridCom_1 = require("./ZyxGridCom");
var ZyxLineCom_1 = require("./ZyxLineCom");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 游戏主玩法场景
var ZyxGame = /** @class */ (function (_super) {
    __extends(ZyxGame, _super);
    function ZyxGame() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblScore = null;
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
        return _this;
    }
    ZyxGame.prototype.onLoad = function () {
        this.initUI();
        this.uBtnClean.on(cc.Node.EventType.TOUCH_END, this.test, this);
        EventManager_1.eventManager.on(Define_1.EventType.ZYX_CHECK_MERGE, this.check, this);
        EventManager_1.eventManager.on(Define_1.EventType.ZYX_RESET_GAME, this.resetGame, this);
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
            [[1, 1, 2], [1, 1, 3], [1, 1, 4], [1, 1, 5], [1, 1, 6], [1, 1, 7], [1, 1, 8], [1, 1, 9]],
        ];
        ZyxGameModule_1.zyxGameModule.produce();
        this.initUI();
    };
    ZyxGame.prototype.initUI = function () {
        this.ulblScore.string = "" + ZyxGameModule_1.zyxGameModule.gameInfo.score;
        this.ulblDiamond.string = "" + ZyxGameModule_1.zyxGameModule.gameInfo.diamond;
        this.ulblStarCnt.string = "" + ZyxGameModule_1.zyxGameModule.gameInfo.star;
        this.ulblAdCnt.string = "(" + ZyxGameModule_1.zyxGameModule.gameInfo.adTimes + ")";
        this.ulblHammerCnt.string = "" + PlayerModule_1.playerModule.hammer;
        this.ulblBombCnt.string = "" + PlayerModule_1.playerModule.bomb;
        this.initChessBoard();
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
                this.grids[i].getComponent(ZyxGridCom_1.default).eliminate();
                this.grids.splice(i, 1);
                break;
            }
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
            return true;
        }
        return false;
    };
    // 加分
    ZyxGame.prototype.addScore = function (score) {
        ZyxGameModule_1.zyxGameModule.gameInfo.score += score;
        this.ulblScore.string = ZyxGameModule_1.zyxGameModule.gameInfo.score.toString();
    };
    ZyxGame.prototype.test = function () {
        console.log(ZyxGameModule_1.zyxGameModule.gridInfo);
    };
    __decorate([
        property(cc.Label)
    ], ZyxGame.prototype, "ulblScore", void 0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUEwRDtBQUMxRCw2REFBNEQ7QUFDNUQsbURBQXVEO0FBQ3ZELDRDQUE4QztBQUM5QyxrREFBaUQ7QUFDakQscURBQW9EO0FBQ3BELDJDQUFzQztBQUN0QywyQ0FBc0M7QUFHaEMsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFFNUMsVUFBVTtBQUVWO0lBQXFDLDJCQUFZO0lBQWpEO1FBQUEscUVBa2FDO1FBL1pHLGVBQVMsR0FBYSxJQUFJLENBQUM7UUFHM0IsaUJBQVcsR0FBYSxJQUFJLENBQUM7UUFHN0IsaUJBQVcsR0FBYSxJQUFJLENBQUM7UUFHN0IsbUJBQWEsR0FBYSxJQUFJLENBQUM7UUFHL0IsaUJBQVcsR0FBYSxJQUFJLENBQUM7UUFHN0IsZUFBUyxHQUFhLElBQUksQ0FBQztRQUczQixpQkFBVyxHQUFZLElBQUksQ0FBQztRQUc1QixnQkFBVSxHQUFZLElBQUksQ0FBQztRQUczQixjQUFRLEdBQVksSUFBSSxDQUFDO1FBR3pCLGVBQVMsR0FBWSxJQUFJLENBQUM7UUFHMUIsY0FBUSxHQUFZLElBQUksQ0FBQztRQUd6QixhQUFPLEdBQVksSUFBSSxDQUFDO1FBRWhCLFdBQUssR0FBYyxFQUFFLENBQUM7UUFFOUIscURBQXFEO1FBQzdDLG1CQUFhLEdBQVksS0FBSyxDQUFDO1FBRXZDLDRCQUE0QjtRQUNwQixnQkFBVSxHQUFZLEtBQUssQ0FBQztRQUVwQyxTQUFTO1FBQ0Qsa0JBQVksR0FBVyxHQUFHLENBQUM7UUFDM0Isa0JBQVksR0FBVyxHQUFHLENBQUM7UUFDM0Isc0JBQWdCLEdBQVcsSUFBSSxDQUFDOztJQWlYNUMsQ0FBQztJQS9XRyx3QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFaEUsMkJBQVksQ0FBQyxFQUFFLENBQUMsa0JBQVMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCwyQkFBWSxDQUFDLEVBQUUsQ0FBQyxrQkFBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCx1QkFBSyxHQUFMO0lBRUEsQ0FBQztJQUVELDJCQUFTLEdBQVQ7UUFDSSw2QkFBYSxDQUFDLFFBQVEsR0FBRztZQUNyQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUs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R3pCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7NENBQ007SUFwQ1AsT0FBTztRQUQzQixPQUFPO09BQ2EsT0FBTyxDQWthM0I7SUFBRCxjQUFDO0NBbGFELEFBa2FDLENBbGFvQyxFQUFFLENBQUMsU0FBUyxHQWthaEQ7a0JBbGFvQixPQUFPIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGxheWVyTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvUGxheWVyTW9kdWxlXCI7XG5pbXBvcnQgeyB6eXhHYW1lTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvWnl4R2FtZU1vZHVsZVwiO1xuaW1wb3J0IHsgZ3JpZENvbnRlbnRUeXBlIH0gZnJvbSBcIi4uL2RlZmluZS9UeXBlRGVmaW5lXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwiLi4vbWFuYWdlci9EZWZpbmVcIjtcbmltcG9ydCB7IHVpbWFuYWdlciB9IGZyb20gXCIuLi9tYW5hZ2VyL1VpbWFuYWdlclwiO1xuaW1wb3J0IHsgZXZlbnRNYW5hZ2VyIH0gZnJvbSBcIi4uL3V0aWwvRXZlbnRNYW5hZ2VyXCI7XG5pbXBvcnQgWnl4R3JpZENvbSBmcm9tIFwiLi9aeXhHcmlkQ29tXCI7XG5pbXBvcnQgWnl4TGluZUNvbSBmcm9tIFwiLi9aeXhMaW5lQ29tXCI7XG5cblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuLy8g5ri45oiP5Li7546p5rOV5Zy65pmvXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWnl4R2FtZSBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFNjb3JlOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibERpYW1vbmQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsU3RhckNudDogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxIYW1tZXJDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsQm9tYkNudDogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxBZENudDogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUltZ1N0YXJCYXI6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0bkhhbW1lcjogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1QnRuQm9tYjogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1QnRuQ2xlYW46IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJveEdyaWQ6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJveE5ldzogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBwcml2YXRlIGdyaWRzOiBjYy5Ob2RlW10gPSBbXTtcblxuICAgIC8vIOaOieiQveWPkeeUn+aDheWGte+8iOaOieiQvemcgOimgeiHquW6leWQkeS4iuajgOa1i++8jOS4gOi9ruajgOa1i+WQjuWGjeajgOa1i+S4i+S4gOi9ru+8jOebtOWIsOacgOe7iOWPr+S7peWPkeeUn+aOieiQveeahOaDheWGteWFqOmDqOajgOa1i+WujOavle+8iVxuICAgIHByaXZhdGUgaGFzRHJvcEFjdGlvbjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLy8g5piv5ZCm5bey57uP55Sf5Lqn5LqG5paw55qEIC0g6Ziy5q2i6L+b6KGM5peg6ZmQ5b6q546v55Sf5oiQ5ZKM5qOA5rWLXG4gICAgcHJpdmF0ZSBoYXNQcm9kdWNlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvLyDmoLzlrZDmjonokL3ml7bpl7RcbiAgICBwcml2YXRlIHRpbWVHcmlkRHJvcDogbnVtYmVyID0gMC4yO1xuICAgIHByaXZhdGUgdGltZVdhaXREcm9wOiBudW1iZXIgPSA2MDA7XG4gICAgcHJpdmF0ZSB0aW1lU2hvd05ld0dyaWRzOiBudW1iZXIgPSAwLjQ0O1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLmluaXRVSSgpO1xuXG4gICAgICAgIHRoaXMudUJ0bkNsZWFuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy50ZXN0LCB0aGlzKTtcblxuICAgICAgICBldmVudE1hbmFnZXIub24oRXZlbnRUeXBlLlpZWF9DSEVDS19NRVJHRSwgdGhpcy5jaGVjaywgdGhpcyk7XG4gICAgICAgIGV2ZW50TWFuYWdlci5vbihFdmVudFR5cGUuWllYX1JFU0VUX0dBTUUsIHRoaXMucmVzZXRHYW1lLCB0aGlzKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcblxuICAgIH1cblxuICAgIHJlc2V0R2FtZSgpOiB2b2lkIHtcbiAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mbyA9IFtcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMywgMSwgMV0sIFszLCAxLCAxXSwgWzMsIDEsIDFdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMSwgMSwgMl0sIFsxLCAxLCAzXSwgWzEsIDEsIDRdLCBbMSwgMSwgNV0sIFsxLCAxLCA2XSwgWzEsIDEsIDddLCBbMSwgMSwgOF0sIFsxLCAxLCA5XV0sXG4gICAgICAgIF1cbiAgICAgICAgenl4R2FtZU1vZHVsZS5wcm9kdWNlKCk7XG5cbiAgICAgICAgdGhpcy5pbml0VUkoKTtcbiAgICB9XG5cbiAgICBpbml0VUkoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudWxibFNjb3JlLnN0cmluZyA9IGAke3p5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmV9YDtcbiAgICAgICAgdGhpcy51bGJsRGlhbW9uZC5zdHJpbmcgPSBgJHt6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLmRpYW1vbmR9YDtcbiAgICAgICAgdGhpcy51bGJsU3RhckNudC5zdHJpbmcgPSBgJHt6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLnN0YXJ9YDtcbiAgICAgICAgdGhpcy51bGJsQWRDbnQuc3RyaW5nID0gYCgke3p5eEdhbWVNb2R1bGUuZ2FtZUluZm8uYWRUaW1lc30pYDtcbiAgICAgICAgdGhpcy51bGJsSGFtbWVyQ250LnN0cmluZyA9IGAke3BsYXllck1vZHVsZS5oYW1tZXJ9YDtcbiAgICAgICAgdGhpcy51bGJsQm9tYkNudC5zdHJpbmcgPSBgJHtwbGF5ZXJNb2R1bGUuYm9tYn1gO1xuXG4gICAgICAgIHRoaXMuaW5pdENoZXNzQm9hcmQoKTtcbiAgICB9XG5cbiAgICAvLyDliJ3lp4vljJbmo4vnm5jkv6Hmga9cbiAgICBhc3luYyBpbml0Q2hlc3NCb2FyZCgpIHtcbiAgICAgICAgdGhpcy51Qm94R3JpZC5kZXN0cm95QWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgdGhpcy5ncmlkcyA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8ubGVuZ3RoOyByb3crKykge1xuICAgICAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddLmxlbmd0aDsgY29sKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY29sID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBncmlkID0gYXdhaXQgdGhpcy5wcm9kdWNlR3JpZCh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVCb3hHcmlkLmFkZENoaWxkKGdyaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZC5zZXRQb3NpdGlvbihuZXcgY2MuVmVjMih6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiBjb2wsIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqICgxMCAtIHJvdykgLSB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnNldFJvd0NlbChyb3csIGNvbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzLnB1c2goZ3JpZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzFdICE9IGdyaWRDb250ZW50VHlwZS5FTVBUWSAmJiB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsyXSAhPT0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbCAtIDFdWzJdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdyaWQgPSBhd2FpdCB0aGlzLnByb2R1Y2VHcmlkKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51Qm94R3JpZC5hZGRDaGlsZChncmlkKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5zZXRQb3NpdGlvbihuZXcgY2MuVmVjMih6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiBjb2wsIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqICgxMCAtIHJvdykgLSB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGgpKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuc2V0Um93Q2VsKHJvdywgY29sKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkcy5wdXNoKGdyaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWKoOi9veS4i+S4gOihjFxuICAgIGxvYWROZXh0KCkge1xuICAgICAgICB0aGlzLm1vdmVVcCgpO1xuXG4gICAgICAgIHRoaXMucHJvZHVjZVJvdygpO1xuICAgIH1cblxuICAgIC8vIOeUn+aIkOaWsOeahOS4gOihjFxuICAgIGFzeW5jIHByb2R1Y2VSb3coKSB7XG4gICAgICAgIC8vIOWJlOmZpOmhtumDqOepuuS9meeahOS4gOihjFxuICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvLnNoaWZ0KCk7XG5cbiAgICAgICAgLy8g5bCG5paw55qE5LiA5o6S55qE5pWw5o2u6L+b6KGM5ou36LSd5bm25L2/55SoXG4gICAgICAgIGNvbnN0IG5ld0RhdGEgPSB6eXhHYW1lTW9kdWxlLmNvcHlOZXdHcmlkRGF0YSgpO1xuXG4gICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8ucHVzaChuZXdEYXRhKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IDk7XG4gICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11baV1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBncmlkID0gYXdhaXQgdGhpcy5wcm9kdWNlR3JpZCh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11baV0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVCb3hHcmlkLmFkZENoaWxkKGdyaWQpO1xuICAgICAgICAgICAgICAgICAgICBncmlkLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqIGksIC04NCkpO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5zZXRSb3dDZWwocm93LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkcy5wdXNoKGdyaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2ldWzFdICE9IGdyaWRDb250ZW50VHlwZS5FTVBUWSAmJiB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11baV1bMl0gIT09IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpIC0gMV1bMl0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBncmlkID0gYXdhaXQgdGhpcy5wcm9kdWNlR3JpZCh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11baV0pO1xuICAgICAgICAgICAgICAgIHRoaXMudUJveEdyaWQuYWRkQ2hpbGQoZ3JpZCk7XG4gICAgICAgICAgICAgICAgZ3JpZC5zZXRQb3NpdGlvbihuZXcgY2MuVmVjMih6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiBpLCAtODQpKTtcbiAgICAgICAgICAgICAgICBncmlkLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5zZXRSb3dDZWwocm93LCBpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzLnB1c2goZ3JpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlsZXnpLrmlrDmoLzlrZBcbiAgICAgICAgdGhpcy5zaG93TmV3R3JpZHMoKTtcbiAgICB9XG5cbiAgICAvLyDnlJ/miJDmoLzlrZBcbiAgICBhc3luYyBwcm9kdWNlR3JpZChncmlkSW5mbzogbnVtYmVyW10pIHtcbiAgICAgICAgY29uc3QgZ3JpZCA9IGF3YWl0IHVpbWFuYWdlci5sb2FkUHJlZmFiKCdwcmVmYWIvenl4L3VDb21HcmlkJyk7XG4gICAgICAgIGNvbnN0IGdyaWROb2RlID0gY2MuaW5zdGFudGlhdGUoZ3JpZCk7XG4gICAgICAgIGdyaWROb2RlLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5pbml0KGdyaWRJbmZvKTtcbiAgICAgICAgcmV0dXJuIGdyaWROb2RlO1xuICAgIH1cblxuICAgIC8vIOWxleekuuaWsOagvOWtkFxuICAgIHNob3dOZXdHcmlkcygpOiB2b2lkIHtcbiAgICAgICAgbGV0IHNob3dFbmRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBncmlkID0gdGhpcy5ncmlkc1tpXTtcbiAgICAgICAgICAgIGlmIChncmlkLnkgIT09IC04NCkgY29udGludWU7XG4gICAgICAgICAgICBjYy50d2VlbihncmlkKVxuICAgICAgICAgICAgICAgIC50byh0aGlzLnRpbWVTaG93TmV3R3JpZHMsIHsgeTogZ3JpZC55ICsgODQgfSwgeyBlYXNpbmc6ICdjdWJpY0luT3V0JyB9KVxuICAgICAgICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3dFbmRpbmcpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0VuZGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g5LiL5LiA5o6S5bGV56S65a6M5oiQ77yM5byA5aeL5qOA5rWL5piv5ZCm5Y+v5Lul6L+b6KGM5ZCI5oiQXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2soKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVOZXh0R3JpZCgpO1xuICAgIH1cblxuICAgIC8vIOeUn+aIkOS5i+WJje+8jOWFiOS4iuenu1xuICAgIG1vdmVVcCgpOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBncmlkID0gdGhpcy5ncmlkc1tpXTtcbiAgICAgICAgICAgIGNjLnR3ZWVuKGdyaWQpXG4gICAgICAgICAgICAgICAgLnRvKHRoaXMudGltZVNob3dOZXdHcmlkcywgeyB5OiBncmlkLnkgKyA4NCB9LCB7IGVhc2luZzogJ2N1YmljSW5PdXQnIH0pXG4gICAgICAgICAgICAgICAgLnN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLm1vdmVVcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Yi35paw5LiL5LiA5bGC5qC85a2Q55qE5L+h5oGvXG4gICAgYXN5bmMgdXBkYXRlTmV4dEdyaWQoKSB7XG4gICAgICAgIC8vIOaVsOaNruWIt+aWsFxuICAgICAgICB6eXhHYW1lTW9kdWxlLnByb2R1Y2UoKTtcblxuICAgICAgICAvLyDlsZXnpLrliLfmlrBcbiAgICAgICAgdGhpcy51Qm94TmV3LmRlc3Ryb3lBbGxDaGlsZHJlbigpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5uZXh0R3JpZEluZm9baV1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5lID0gYXdhaXQgdGhpcy5wcm9kdWNlTmV3TGluZSh6eXhHYW1lTW9kdWxlLm5leHRHcmlkSW5mb1tpXVswXSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudUJveE5ldy5hZGRDaGlsZChsaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgbGluZS5zZXRQb3NpdGlvbihuZXcgY2MuVmVjMih6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiBpLCAwKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh6eXhHYW1lTW9kdWxlLm5leHRHcmlkSW5mb1tpXVsxXSAhPSBncmlkQ29udGVudFR5cGUuRU1QVFkgJiYgenl4R2FtZU1vZHVsZS5uZXh0R3JpZEluZm9baV1bMl0gIT09IHp5eEdhbWVNb2R1bGUubmV4dEdyaWRJbmZvW2kgLSAxXVsyXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBhd2FpdCB0aGlzLnByb2R1Y2VOZXdMaW5lKHp5eEdhbWVNb2R1bGUubmV4dEdyaWRJbmZvW2ldWzBdKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVCb3hOZXcuYWRkQ2hpbGQobGluZSk7XG4gICAgICAgICAgICAgICAgbGluZS5zZXRQb3NpdGlvbihuZXcgY2MuVmVjMih6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiBpLCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBwcm9kdWNlTmV3TGluZShzaXplOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgbGluZSA9IGF3YWl0IHVpbWFuYWdlci5sb2FkUHJlZmFiKCdwcmVmYWIvenl4L3VDb21OZXh0TGluZScpO1xuICAgICAgICBjb25zdCBub2RlID0gY2MuaW5zdGFudGlhdGUobGluZSk7XG4gICAgICAgIG5vZGUuZ2V0Q29tcG9uZW50KFp5eExpbmVDb20pLnNldFcoc2l6ZSAqIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCk7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cblxuICAgIC8vIOW+queOr+ajgOa1i+aYr+WQpuWPr+S7peaOieiQveWSjOa2iOmZpFxuICAgIGNoZWNrKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmRyb3AoOSk7XG4gICAgfVxuXG4gICAgLy8g6L+b6KGM5ZCI5oiQ5pON5L2cIC0g5ZCI5oiQ5pON5L2c5piv5LiA6L2u5raI6Zmk5qOA5rWL55qE5pyA5ZCO5LiA5Liq5Yqo5L2cXG4gICAgbWVyZ2UoKTogdm9pZCB7XG4gICAgICAgIGxldCBtZXJnZVRpbWVzID0gMDtcbiAgICAgICAgLy8g5qOA5rWL5q+P5LiA6KGM5piv5ZCm5pyJ5Y+v5Lul5raI6Zmk55qE5qC85a2QXG4gICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8ubGVuZ3RoOyByb3crKykge1xuICAgICAgICAgICAgY29uc3Qgcm93RGF0YSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XTtcbiAgICAgICAgICAgIGxldCBoYXNFbXB0eUdyaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcm93RGF0YS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChyb3dEYXRhW2pdWzFdID09PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzRW1wdHlHcmlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInnqbrmoLzlrZDvvIzpgqPlsLHlj6/ku6Xov5vooYzmtojpmaRcbiAgICAgICAgICAgIGNvbnN0IHVuaXF1ZUlkcyA9IFtdO1xuICAgICAgICAgICAgaWYgKCFoYXNFbXB0eUdyaWQpIHtcbiAgICAgICAgICAgICAgICBtZXJnZVRpbWVzKys7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dEYXRhLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1bmlxdWVJZHMuaW5kZXhPZihyb3dEYXRhW2pdWzJdKSA9PT0gLTEgJiYgcm93RGF0YVtqXVsyXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5pcXVlSWRzLnB1c2gocm93RGF0YVtqXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bal0gPSBbMCwgMCwgMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDmtojpmaRcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5pcXVlSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdW5pcXVlSWQgPSB1bmlxdWVJZHNbaV07XG4gICAgICAgICAgICAgICAgdGhpcy5lbGltaW5hdGVHcmlkKHVuaXF1ZUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXJnZVRpbWVzID4gMCkge1xuICAgICAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKCfnmbznlJ/mtojpmaTvvIzmjIHnu63kuIvkuIDova7mo4DmtYsnKTtcbiAgICAgICAgICAgIHRoaXMuYWRkU2NvcmUobWVyZ2VUaW1lcyk7XG4gICAgICAgICAgICB0aGlzLmNoZWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBpc0dhbWVPdmVyID0gdGhpcy5jaGVja0dhbWVPdmVyKCk7XG4gICAgICAgICAgICBjb25zdCBpc0dyaWRFbXB0eSA9IHRoaXMuY2hlY2tHcmlkRW1wdHkoKTtcblxuICAgICAgICAgICAgaWYgKGlzR2FtZU92ZXIpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc1Byb2R1Y2UpIHtcbiAgICAgICAgICAgICAgICAvLyDmsqHmnInlj6/ku6Xov5vooYzmtojpmaTnmoTkuobvvIzlubbkuJTov5jmnKrlsZXnpLrmlrDnlJ/miJDnmoTkuIDmjpLvvIzliJnlsZXnpLrkuIvkuIDmjpJcbiAgICAgICAgICAgICAgICB0aGlzLmhhc1Byb2R1Y2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE5leHQoKTtcbiAgICAgICAgICAgICAgICB1aW1hbmFnZXIuc2hvd1RpcHMoJ+WxleekuuS4i+S4gOihjCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0dyaWRFbXB0eSkge1xuICAgICAgICAgICAgICAgIC8vIOaWsOeUn+aIkOeahOW3sue7j+WxleekuuS6hu+8jOS4lOayoeacieWPr+WQiOaIkO+8jOS4lOWcuuS4iuayoeacieaji+WtkFxuICAgICAgICAgICAgICAgIHRoaXMuaGFzUHJvZHVjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkTmV4dCgpO1xuICAgICAgICAgICAgICAgIHVpbWFuYWdlci5zaG93VGlwcygn5qOL55uY5Li656m677yM5bGV56S65LiL5LiA6KGMJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIOaWsOeUn+aIkOeahOS4gOaOkuW3sue7j+Wxleekuui/h+S6hu+8jOS4lOW3sue7j+ayoeacieWPr+WQiOaIkO+8jOS4lOWcuuS4iui/mOacieaji+WtkFxuICAgICAgICAgICAgICAgIHRoaXMuaGFzUHJvZHVjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkID0gLTE7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FjdGlvbiBvdmVyOicsIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5b2T5YmN5Zy65pmv5Lit5piv5ZCm5bey57uP5Li656m6XG4gICAgY2hlY2tHcmlkRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpc0VtcHR5ID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvWzldLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBncmlkRGF0YSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bOV1baV07XG4gICAgICAgICAgICBpZiAoZ3JpZERhdGFbMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgIGlzRW1wdHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNFbXB0eTtcbiAgICB9XG5cbiAgICAvLyDmtojpmaRcbiAgICBlbGltaW5hdGVHcmlkKHVuaXF1ZUlEOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkc1tpXS5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkudW5pcXVlSWQgPT09IHVuaXF1ZUlEKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+a2iOmZpCcsIHVuaXF1ZUlEKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzW2ldLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5lbGltaW5hdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOajgOa1i+W9k+WJjeihjOeahOS4iuS4gOihjOaYr+WQpuacieaOieiQveaDheWGte+8jOWmguaenOacieWImei/m+ihjOaOieiQveaTjeS9nFxuICAgIGRyb3Aocm93KTogdm9pZCB7XG4gICAgICAgIGlmIChyb3cgPT09IDkpIHtcbiAgICAgICAgICAgIHRoaXMuaGFzRHJvcEFjdGlvbiA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvdyA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzRHJvcEFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmjIHnu63mjonokL3mo4DmtYsnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lcmdlKCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcy50aW1lV2FpdERyb3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgODsgY29sKyspIHtcbiAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsxXSA9PT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZICYmIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93IC0gMV1bY29sXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgLy8g5qOA5rWL5piv5ZCm5Y+v5Lul5o6J6JC9XG4gICAgICAgICAgICAgICAgY29uc3QgaGFzRHJvcCA9IHRoaXMuZHJvcEdyaWQocm93IC0gMSwgY29sKTtcbiAgICAgICAgICAgICAgICBpZiAoaGFzRHJvcCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc0Ryb3BBY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJvcChyb3cgLSAxKTtcbiAgICB9XG5cbiAgICBkcm9wR3JpZChyb3c6IG51bWJlciwgY29sOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLy8g5qOA5rWL5a+55bqU55qE56m65qC85a2Q5piv5ZCm5Y+v5Lul5a6557qz5o6J5LiL5p2l55qE5qC85a2Q57G75Z6LXG4gICAgICAgIGNvbnN0IHVuaXF1ZUlEID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMl07XG4gICAgICAgIGNvbnN0IGNoZWNrQ29scyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXVsyXSA9PT0gdW5pcXVlSUQpIHtcbiAgICAgICAgICAgICAgICBjaGVja0NvbHMucHVzaChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjYW5Ecm9wID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGVja0NvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGNoZWNrQ29sc1tpXTtcbiAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3JvdyArIDFdW2NvbF1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgIGNhbkRyb3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpoLmnpzlj6/ku6XmjonokL3vvIzpgqPlsLHlsIbmlbDmja7ov5vooYzkuqTmjaLvvIzlkIzml7bmm7TmlrDmoLzlrZDnmoToh6rouqvlsZ7mgKflkozkvY3nva7kv6Hmga9cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGVja0NvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGNoZWNrQ29sc1tpXTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93ICsgMV1bY29sXVswXSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzBdO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3cgKyAxXVtjb2xdWzFdID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMV07XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3JvdyArIDFdW2NvbF1bMl0gPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsyXTtcblxuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMF0gPSAwO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMV0gPSBncmlkQ29udGVudFR5cGUuRU1QVFk7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsyXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygn5o6J6JC9OicsIHVuaXF1ZUlEKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmdyaWRzW2ldO1xuICAgICAgICAgICAgaWYgKGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnVuaXF1ZUlkID09PSB1bmlxdWVJRCkge1xuICAgICAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFyWSA9IHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqICgxMCAtIHJvdyAtIDEpIC0genl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoO1xuICAgICAgICAgICAgICAgIGNjLnR3ZWVuKGdyaWQpXG4gICAgICAgICAgICAgICAgICAgIC50byh0aGlzLnRpbWVHcmlkRHJvcCwgeyB5OiB0YXJZIH0sIHsgZWFzaW5nOiAncXVhcnRJbicgfSlcbiAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2FuRHJvcDtcbiAgICB9XG5cbiAgICAvLyDmo4DpqozmmK/lkKbnu5PmnZ9cbiAgICBjaGVja0dhbWVPdmVyKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5jaGVja0dhbWVPdmVyKCkpIHtcbiAgICAgICAgICAgIHVpbWFuYWdlci5zaG93R2FtZU92ZXIoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyDliqDliIZcbiAgICBhZGRTY29yZShzY29yZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmUgKz0gc2NvcmU7XG4gICAgICAgIHRoaXMudWxibFNjb3JlLnN0cmluZyA9IHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmUudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICB0ZXN0KCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvKTtcbiAgICB9XG59XG4iXX0=