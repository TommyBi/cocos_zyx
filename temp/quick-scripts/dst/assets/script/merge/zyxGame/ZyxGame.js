
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
                _this.hasDropAction = false;
                // 下一排展示完成，开始检测是否可以进行合成
                _this.drop(9);
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
        ZyxGameModule_1.zyxGameModule.produce();
    };
    // 循环检测是否可以掉落和消除
    ZyxGame.prototype.check = function () {
        this.hasProduce = false;
        this.drop(9);
    };
    // 进行合成操作
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
            Uimanager_1.uimanager.showTips('發生消除');
            this.addScore(mergeTimes);
            this.drop(9);
        }
        else {
            var isGameOver = this.checkGameOver();
            if (!isGameOver && !this.hasProduce) {
                this.hasProduce = true;
                this.loadNext();
            }
            else {
                ZyxGameModule_1.zyxGameModule.selectGirdUniqueId = -1;
                console.log('action over:', ZyxGameModule_1.zyxGameModule.gridInfo);
            }
        }
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
        if (row === 0) {
            if (this.hasDropAction) {
                this.hasDropAction = false;
                console.log('新一轮检测');
                this.drop(9);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUEwRDtBQUMxRCw2REFBNEQ7QUFDNUQsbURBQXVEO0FBQ3ZELDRDQUE4QztBQUM5QyxrREFBaUQ7QUFDakQscURBQW9EO0FBQ3BELDJDQUFzQztBQUVoQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxVQUFVO0FBRVY7SUFBcUMsMkJBQVk7SUFBakQ7UUFBQSxxRUE2V0M7UUExV0csZUFBUyxHQUFhLElBQUksQ0FBQztRQUczQixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixtQkFBYSxHQUFhLElBQUksQ0FBQztRQUcvQixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixlQUFTLEdBQWEsSUFBSSxDQUFDO1FBRzNCLGlCQUFXLEdBQVksSUFBSSxDQUFDO1FBRzVCLGdCQUFVLEdBQVksSUFBSSxDQUFDO1FBRzNCLGNBQVEsR0FBWSxJQUFJLENBQUM7UUFHekIsZUFBUyxHQUFZLElBQUksQ0FBQztRQUcxQixjQUFRLEdBQVksSUFBSSxDQUFDO1FBRWpCLFdBQUssR0FBYyxFQUFFLENBQUM7UUFFOUIscURBQXFEO1FBQzdDLG1CQUFhLEdBQVksS0FBSyxDQUFDO1FBRXZDLDRCQUE0QjtRQUNwQixnQkFBVSxHQUFZLEtBQUssQ0FBQztRQUVwQyxTQUFTO1FBQ0Qsa0JBQVksR0FBVyxHQUFHLENBQUM7UUFDM0Isa0JBQVksR0FBVyxHQUFHLENBQUM7UUFDM0Isc0JBQWdCLEdBQVcsSUFBSSxDQUFDOztJQStUNUMsQ0FBQztJQTdURyx3QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFaEUsMkJBQVksQ0FBQyxFQUFFLENBQUMsa0JBQVMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCwyQkFBWSxDQUFDLEVBQUUsQ0FBQyxrQkFBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCx1QkFBSyxHQUFMO0lBRUEsQ0FBQztJQUVELDJCQUFTLEdBQVQ7UUFDSSw2QkFBYSxDQUFDLFFBQVEsR0FBRztZQUNyQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFF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QUFRLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQztRQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDcEUsQ0FBQztJQUVELHNCQUFJLEdBQUo7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQXpXRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzhDQUNRO0lBRzNCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7Z0RBQ1U7SUFHN0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztnREFDVTtJQUc3QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2tEQUNZO0lBRy9CO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7Z0RBQ1U7SUFHN0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs4Q0FDUTtJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2dEQUNVO0lBRzVCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7K0NBQ1M7SUFHM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs2Q0FDTztJQUd6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzhDQUNRO0lBRzFCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7NkNBQ087SUFqQ1IsT0FBTztRQUQzQixPQUFPO09BQ2EsT0FBTyxDQTZXM0I7SUFBRCxjQUFDO0NBN1dELEFBNldDLENBN1dvQyxFQUFFLENBQUMsU0FBUyxHQTZXaEQ7a0JBN1dvQixPQUFPIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGxheWVyTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvUGxheWVyTW9kdWxlXCI7XG5pbXBvcnQgeyB6eXhHYW1lTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvWnl4R2FtZU1vZHVsZVwiO1xuaW1wb3J0IHsgZ3JpZENvbnRlbnRUeXBlIH0gZnJvbSBcIi4uL2RlZmluZS9UeXBlRGVmaW5lXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwiLi4vbWFuYWdlci9EZWZpbmVcIjtcbmltcG9ydCB7IHVpbWFuYWdlciB9IGZyb20gXCIuLi9tYW5hZ2VyL1VpbWFuYWdlclwiO1xuaW1wb3J0IHsgZXZlbnRNYW5hZ2VyIH0gZnJvbSBcIi4uL3V0aWwvRXZlbnRNYW5hZ2VyXCI7XG5pbXBvcnQgWnl4R3JpZENvbSBmcm9tIFwiLi9aeXhHcmlkQ29tXCI7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbi8vIOa4uOaIj+S4u+eOqeazleWcuuaZr1xuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFp5eEdhbWUgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxTY29yZTogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxEaWFtb25kOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFN0YXJDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsSGFtbWVyQ250OiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibEJvbWJDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsQWRDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdTdGFyQmFyOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCdG5IYW1tZXI6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0bkJvbWI6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0bkNsZWFuOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCb3hHcmlkOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIHByaXZhdGUgZ3JpZHM6IGNjLk5vZGVbXSA9IFtdO1xuXG4gICAgLy8g5o6J6JC95Y+R55Sf5oOF5Ya177yI5o6J6JC96ZyA6KaB6Ieq5bqV5ZCR5LiK5qOA5rWL77yM5LiA6L2u5qOA5rWL5ZCO5YaN5qOA5rWL5LiL5LiA6L2u77yM55u05Yiw5pyA57uI5Y+v5Lul5Y+R55Sf5o6J6JC955qE5oOF5Ya15YWo6YOo5qOA5rWL5a6M5q+V77yJXG4gICAgcHJpdmF0ZSBoYXNEcm9wQWN0aW9uOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvLyDmmK/lkKblt7Lnu4/nlJ/kuqfkuobmlrDnmoQgLSDpmLLmraLov5vooYzml6DpmZDlvqrnjq/nlJ/miJDlkozmo4DmtYtcbiAgICBwcml2YXRlIGhhc1Byb2R1Y2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8vIOagvOWtkOaOieiQveaXtumXtFxuICAgIHByaXZhdGUgdGltZUdyaWREcm9wOiBudW1iZXIgPSAwLjI7XG4gICAgcHJpdmF0ZSB0aW1lV2FpdERyb3A6IG51bWJlciA9IDYwMDtcbiAgICBwcml2YXRlIHRpbWVTaG93TmV3R3JpZHM6IG51bWJlciA9IDAuNDQ7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMuaW5pdFVJKCk7XG5cbiAgICAgICAgdGhpcy51QnRuQ2xlYW4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLnRlc3QsIHRoaXMpO1xuXG4gICAgICAgIGV2ZW50TWFuYWdlci5vbihFdmVudFR5cGUuWllYX0NIRUNLX01FUkdFLCB0aGlzLmNoZWNrLCB0aGlzKTtcbiAgICAgICAgZXZlbnRNYW5hZ2VyLm9uKEV2ZW50VHlwZS5aWVhfUkVTRVRfR0FNRSwgdGhpcy5yZXNldEdhbWUsIHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuXG4gICAgfVxuXG4gICAgcmVzZXRHYW1lKCk6IHZvaWQge1xuICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvID0gW1xuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFszLCAxLCAxXSwgWzMsIDEsIDFdLCBbMywgMSwgMV0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1sxLCAxLCAyXSwgWzEsIDEsIDNdLCBbMSwgMSwgNF0sIFsxLCAxLCA1XSwgWzEsIDEsIDZdLCBbMSwgMSwgN10sIFsxLCAxLCA4XSwgWzEsIDEsIDldXSxcbiAgICAgICAgXVxuICAgICAgICB6eXhHYW1lTW9kdWxlLnByb2R1Y2UoKTtcblxuICAgICAgICB0aGlzLmluaXRVSSgpO1xuICAgIH1cblxuICAgIGluaXRVSSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51bGJsU2NvcmUuc3RyaW5nID0gYCR7enl4R2FtZU1vZHVsZS5nYW1lSW5mby5zY29yZX1gO1xuICAgICAgICB0aGlzLnVsYmxEaWFtb25kLnN0cmluZyA9IGAke3p5eEdhbWVNb2R1bGUuZ2FtZUluZm8uZGlhbW9uZH1gO1xuICAgICAgICB0aGlzLnVsYmxTdGFyQ250LnN0cmluZyA9IGAke3p5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc3Rhcn1gO1xuICAgICAgICB0aGlzLnVsYmxBZENudC5zdHJpbmcgPSBgKCR7enl4R2FtZU1vZHVsZS5nYW1lSW5mby5hZFRpbWVzfSlgO1xuICAgICAgICB0aGlzLnVsYmxIYW1tZXJDbnQuc3RyaW5nID0gYCR7cGxheWVyTW9kdWxlLmhhbW1lcn1gO1xuICAgICAgICB0aGlzLnVsYmxCb21iQ250LnN0cmluZyA9IGAke3BsYXllck1vZHVsZS5ib21ifWA7XG5cbiAgICAgICAgdGhpcy5pbml0Q2hlc3NCb2FyZCgpO1xuICAgIH1cblxuICAgIC8vIOWIneWni+WMluaji+ebmOS/oeaBr1xuICAgIGFzeW5jIGluaXRDaGVzc0JvYXJkKCkge1xuICAgICAgICB0aGlzLnVCb3hHcmlkLmRlc3Ryb3lBbGxDaGlsZHJlbigpO1xuICAgICAgICB0aGlzLmdyaWRzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgenl4R2FtZU1vZHVsZS5ncmlkSW5mby5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd10ubGVuZ3RoOyBjb2wrKykge1xuICAgICAgICAgICAgICAgIGlmIChjb2wgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdyaWQgPSBhd2FpdCB0aGlzLnByb2R1Y2VHcmlkKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudUJveEdyaWQuYWRkQ2hpbGQoZ3JpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmlkLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqIGNvbCwgenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogKDEwIC0gcm93KSAtIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuc2V0Um93Q2VsKHJvdywgY29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHMucHVzaChncmlkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMV0gIT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZICYmIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzJdICE9PSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sIC0gMV1bMl0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGF3YWl0IHRoaXMucHJvZHVjZUdyaWQoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVCb3hHcmlkLmFkZENoaWxkKGdyaWQpO1xuICAgICAgICAgICAgICAgICAgICBncmlkLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqIGNvbCwgenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogKDEwIC0gcm93KSAtIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCkpO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5zZXRSb3dDZWwocm93LCBjb2wpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzLnB1c2goZ3JpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Yqg6L295LiL5LiA6KGMXG4gICAgbG9hZE5leHQoKSB7XG4gICAgICAgIHRoaXMubW92ZVVwKCk7XG5cbiAgICAgICAgdGhpcy5wcm9kdWNlUm93KCk7XG4gICAgfVxuXG4gICAgLy8g55Sf5oiQ5paw55qE5LiA6KGMXG4gICAgYXN5bmMgcHJvZHVjZVJvdygpIHtcbiAgICAgICAgLy8g5YmU6Zmk6aG26YOo56m65L2Z55qE5LiA6KGMXG4gICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8uc2hpZnQoKTtcblxuICAgICAgICAvLyDlsIbmlrDnmoTkuIDmjpLnmoTmlbDmja7ov5vooYzmi7fotJ3lubbkvb/nlKhcbiAgICAgICAgY29uc3QgbmV3RGF0YSA9IHp5eEdhbWVNb2R1bGUuY29weU5ld0dyaWREYXRhKCk7XG5cbiAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mby5wdXNoKG5ld0RhdGEpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gOTtcbiAgICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdyaWQgPSBhd2FpdCB0aGlzLnByb2R1Y2VHcmlkKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudUJveEdyaWQuYWRkQ2hpbGQoZ3JpZCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogaSwgLTg0KSk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnNldFJvd0NlbChyb3csIGkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzLnB1c2goZ3JpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11baV1bMV0gIT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZICYmIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXVsyXSAhPT0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2kgLSAxXVsyXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdyaWQgPSBhd2FpdCB0aGlzLnByb2R1Y2VHcmlkKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXSk7XG4gICAgICAgICAgICAgICAgdGhpcy51Qm94R3JpZC5hZGRDaGlsZChncmlkKTtcbiAgICAgICAgICAgICAgICBncmlkLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqIGksIC04NCkpO1xuICAgICAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnNldFJvd0NlbChyb3csIGkpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHMucHVzaChncmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWxleekuuaWsOagvOWtkFxuICAgICAgICB0aGlzLnNob3dOZXdHcmlkcygpO1xuICAgIH1cblxuICAgIC8vIOeUn+aIkOagvOWtkFxuICAgIGFzeW5jIHByb2R1Y2VHcmlkKGdyaWRJbmZvOiBudW1iZXJbXSkge1xuICAgICAgICBjb25zdCBncmlkID0gYXdhaXQgdWltYW5hZ2VyLmxvYWRQcmVmYWIoJ3ByZWZhYi96eXgvdUNvbUdyaWQnKTtcbiAgICAgICAgY29uc3QgZ3JpZE5vZGUgPSBjYy5pbnN0YW50aWF0ZShncmlkKTtcbiAgICAgICAgZ3JpZE5vZGUuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLmluaXQoZ3JpZEluZm8pO1xuICAgICAgICByZXR1cm4gZ3JpZE5vZGU7XG4gICAgfVxuXG4gICAgLy8g5bGV56S65paw5qC85a2QXG4gICAgc2hvd05ld0dyaWRzKCk6IHZvaWQge1xuICAgICAgICBsZXQgc2hvd0VuZGluZzogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmdyaWRzW2ldO1xuICAgICAgICAgICAgaWYgKGdyaWQueSAhPT0gLTg0KSBjb250aW51ZTtcbiAgICAgICAgICAgIGNjLnR3ZWVuKGdyaWQpXG4gICAgICAgICAgICAgICAgLnRvKHRoaXMudGltZVNob3dOZXdHcmlkcywgeyB5OiBncmlkLnkgKyA4NCB9LCB7IGVhc2luZzogJ2N1YmljSW5PdXQnIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvd0VuZGluZykgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBzaG93RW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXNEcm9wQWN0aW9uID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g5LiL5LiA5o6S5bGV56S65a6M5oiQ77yM5byA5aeL5qOA5rWL5piv5ZCm5Y+v5Lul6L+b6KGM5ZCI5oiQXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJvcCg5KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVOZXh0R3JpZCgpO1xuICAgIH1cblxuICAgIC8vIOeUn+aIkOS5i+WJje+8jOWFiOS4iuenu1xuICAgIG1vdmVVcCgpOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBncmlkID0gdGhpcy5ncmlkc1tpXTtcbiAgICAgICAgICAgIGNjLnR3ZWVuKGdyaWQpXG4gICAgICAgICAgICAgICAgLnRvKHRoaXMudGltZVNob3dOZXdHcmlkcywgeyB5OiBncmlkLnkgKyA4NCB9LCB7IGVhc2luZzogJ2N1YmljSW5PdXQnIH0pXG4gICAgICAgICAgICAgICAgLnN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLm1vdmVVcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Yi35paw5LiL5LiA5bGC5qC85a2Q55qE5L+h5oGvXG4gICAgdXBkYXRlTmV4dEdyaWQoKSB7XG4gICAgICAgIHp5eEdhbWVNb2R1bGUucHJvZHVjZSgpO1xuXG4gICAgfVxuXG4gICAgLy8g5b6q546v5qOA5rWL5piv5ZCm5Y+v5Lul5o6J6JC95ZKM5raI6ZmkXG4gICAgY2hlY2soKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaGFzUHJvZHVjZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRyb3AoOSk7XG4gICAgfVxuXG4gICAgLy8g6L+b6KGM5ZCI5oiQ5pON5L2cXG4gICAgbWVyZ2UoKTogdm9pZCB7XG4gICAgICAgIGxldCBtZXJnZVRpbWVzID0gMDtcbiAgICAgICAgLy8g5qOA5rWL5q+P5LiA6KGM5piv5ZCm5pyJ5Y+v5Lul5raI6Zmk55qE5qC85a2QXG4gICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8ubGVuZ3RoOyByb3crKykge1xuICAgICAgICAgICAgY29uc3Qgcm93RGF0YSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XTtcbiAgICAgICAgICAgIGxldCBoYXNFbXB0eUdyaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcm93RGF0YS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChyb3dEYXRhW2pdWzFdID09PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzRW1wdHlHcmlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInnqbrmoLzlrZDvvIzpgqPlsLHlj6/ku6Xov5vooYzmtojpmaRcbiAgICAgICAgICAgIGNvbnN0IHVuaXF1ZUlkcyA9IFtdO1xuICAgICAgICAgICAgaWYgKCFoYXNFbXB0eUdyaWQpIHtcbiAgICAgICAgICAgICAgICBtZXJnZVRpbWVzKys7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dEYXRhLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1bmlxdWVJZHMuaW5kZXhPZihyb3dEYXRhW2pdWzJdKSA9PT0gLTEgJiYgcm93RGF0YVtqXVsyXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5pcXVlSWRzLnB1c2gocm93RGF0YVtqXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bal0gPSBbMCwgMCwgMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDmtojpmaRcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5pcXVlSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdW5pcXVlSWQgPSB1bmlxdWVJZHNbaV07XG4gICAgICAgICAgICAgICAgdGhpcy5lbGltaW5hdGVHcmlkKHVuaXF1ZUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXJnZVRpbWVzID4gMCkge1xuICAgICAgICAgICAgdWltYW5hZ2VyLnNob3dUaXBzKCfnmbznlJ/mtojpmaQnKTtcbiAgICAgICAgICAgIHRoaXMuYWRkU2NvcmUobWVyZ2VUaW1lcyk7XG4gICAgICAgICAgICB0aGlzLmRyb3AoOSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBpc0dhbWVPdmVyID0gdGhpcy5jaGVja0dhbWVPdmVyKCk7XG4gICAgICAgICAgICBpZiAoIWlzR2FtZU92ZXIgJiYgIXRoaXMuaGFzUHJvZHVjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFzUHJvZHVjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkTmV4dCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCA9IC0xO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhY3Rpb24gb3ZlcjonLCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOa2iOmZpFxuICAgIGVsaW1pbmF0ZUdyaWQodW5pcXVlSUQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdyaWRzW2ldLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS51bmlxdWVJZCA9PT0gdW5pcXVlSUQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5raI6ZmkJywgdW5pcXVlSUQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHNbaV0uZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLmVsaW1pbmF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5qOA5rWL5b2T5YmN6KGM55qE5LiK5LiA6KGM5piv5ZCm5pyJ5o6J6JC95oOF5Ya177yM5aaC5p6c5pyJ5YiZ6L+b6KGM5o6J6JC95pON5L2cXG4gICAgZHJvcChyb3cpOiB2b2lkIHtcbiAgICAgICAgaWYgKHJvdyA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzRHJvcEFjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFzRHJvcEFjdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmlrDkuIDova7mo4DmtYsnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyb3AoOSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lcmdlKCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcy50aW1lV2FpdERyb3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgODsgY29sKyspIHtcbiAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsxXSA9PT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZICYmIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93IC0gMV1bY29sXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgLy8g5qOA5rWL5piv5ZCm5Y+v5Lul5o6J6JC9XG4gICAgICAgICAgICAgICAgY29uc3QgaGFzRHJvcCA9IHRoaXMuZHJvcEdyaWQocm93IC0gMSwgY29sKTtcbiAgICAgICAgICAgICAgICBpZiAoaGFzRHJvcCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc0Ryb3BBY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJvcChyb3cgLSAxKTtcbiAgICB9XG5cbiAgICBkcm9wR3JpZChyb3c6IG51bWJlciwgY29sOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLy8g5qOA5rWL5a+55bqU55qE56m65qC85a2Q5piv5ZCm5Y+v5Lul5a6557qz5o6J5LiL5p2l55qE5qC85a2Q57G75Z6LXG4gICAgICAgIGNvbnN0IHVuaXF1ZUlEID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMl07XG4gICAgICAgIGNvbnN0IGNoZWNrQ29scyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXVsyXSA9PT0gdW5pcXVlSUQpIHtcbiAgICAgICAgICAgICAgICBjaGVja0NvbHMucHVzaChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjYW5Ecm9wID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGVja0NvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGNoZWNrQ29sc1tpXTtcbiAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3JvdyArIDFdW2NvbF1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgIGNhbkRyb3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpoLmnpzlj6/ku6XmjonokL3vvIzpgqPlsLHlsIbmlbDmja7ov5vooYzkuqTmjaLvvIzlkIzml7bmm7TmlrDmoLzlrZDnmoToh6rouqvlsZ7mgKflkozkvY3nva7kv6Hmga9cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGVja0NvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGNoZWNrQ29sc1tpXTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93ICsgMV1bY29sXVswXSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzBdO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3cgKyAxXVtjb2xdWzFdID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMV07XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3JvdyArIDFdW2NvbF1bMl0gPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsyXTtcblxuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMF0gPSAwO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMV0gPSBncmlkQ29udGVudFR5cGUuRU1QVFk7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsyXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygn5o6J6JC9OicsIHVuaXF1ZUlEKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmdyaWRzW2ldO1xuICAgICAgICAgICAgaWYgKGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnVuaXF1ZUlkID09PSB1bmlxdWVJRCkge1xuICAgICAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFyWSA9IHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqICgxMCAtIHJvdyAtIDEpIC0genl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoO1xuICAgICAgICAgICAgICAgIGNjLnR3ZWVuKGdyaWQpXG4gICAgICAgICAgICAgICAgICAgIC50byh0aGlzLnRpbWVHcmlkRHJvcCwgeyB5OiB0YXJZIH0sIHsgZWFzaW5nOiAncXVhcnRJbicgfSlcbiAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2FuRHJvcDtcbiAgICB9XG5cbiAgICAvLyDmo4DpqozmmK/lkKbnu5PmnZ9cbiAgICBjaGVja0dhbWVPdmVyKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5jaGVja0dhbWVPdmVyKCkpIHtcbiAgICAgICAgICAgIHVpbWFuYWdlci5zaG93R2FtZU92ZXIoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyDliqDliIZcbiAgICBhZGRTY29yZShzY29yZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmUgKz0gc2NvcmU7XG4gICAgICAgIHRoaXMudWxibFNjb3JlLnN0cmluZyA9IHp5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmUudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICB0ZXN0KCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvKTtcbiAgICB9XG59XG4iXX0=