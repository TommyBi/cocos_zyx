"use strict";
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
var Uimanager_1 = require("../manager/Uimanager");
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
        _this.gridsWidth = 84;
        // 掉落发生情况（掉落需要自底向上检测，一轮检测后再检测下一轮，直到最终可以发生掉落的情况全部检测完毕）
        _this.hasDropAction = false;
        return _this;
    }
    ZyxGame.prototype.onLoad = function () {
        this.initUI();
        this.uBoxGrid.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.uBoxGrid.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        ZyxGameModule_1.zyxGameModule.lock = false;
    };
    ZyxGame.prototype.start = function () {
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
                        grid.setPosition(new cc.Vec2(this.gridsWidth * col, this.gridsWidth * (10 - row) - this.gridsWidth));
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
                        grid.setPosition(new cc.Vec2(this.gridsWidth * col, this.gridsWidth * (10 - row) - this.gridsWidth));
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
    ZyxGame.prototype.onTouchStart = function (e) {
        var posStart = e.currentTarget.getPosition();
        console.log('onTouchStart', posStart);
    };
    ZyxGame.prototype.onTouchEnd = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (ZyxGameModule_1.zyxGameModule.lock)
                    return [2 /*return*/];
                ZyxGameModule_1.zyxGameModule.lock = true;
                this.moveUp();
                this.produceRow();
                return [2 /*return*/];
            });
        });
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
                        newData = ZyxGameModule_1.zyxGameModule.produce();
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
                        grid.setPosition(new cc.Vec2(this.gridsWidth * i, -84));
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
                        grid.setPosition(new cc.Vec2(this.gridsWidth * i, -84));
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
    // 生成之前，先上移
    ZyxGame.prototype.moveUp = function () {
        for (var i = 0; i < this.grids.length; i++) {
            var grid = this.grids[i];
            cc.tween(grid)
                .to(0.5, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                .start();
            grid.getComponent(ZyxGridCom_1.default).moveUp();
        }
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
                .to(0.5, { y: grid.y + 84 }, { easing: 'cubicInOut' })
                .call(function () {
                if (showEnding)
                    return;
                showEnding = true;
                _this.hasDropAction = false;
                _this.drop(9);
            })
                .start();
        }
    };
    // 进行合成操作
    ZyxGame.prototype.merge = function () {
        console.log('merge');
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
            this.drop(9);
        }
        else {
            ZyxGameModule_1.zyxGameModule.lock = false;
            this.checkGameOver();
        }
    };
    // 消除
    ZyxGame.prototype.eliminateGrid = function (uniqueID) {
        for (var i = 0; i < this.grids.length; i++) {
            if (this.grids[i].getComponent(ZyxGridCom_1.default).uniqueId === uniqueID) {
                console.log('eliminateGrid', uniqueID, this.grids);
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
                }, 400);
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
        console.log('gridInfo over:', ZyxGameModule_1.zyxGameModule.gridInfo);
        for (var i = 0; i < this.grids.length; i++) {
            var grid = this.grids[i];
            if (grid.getComponent(ZyxGridCom_1.default).uniqueId === uniqueID) {
                grid.getComponent(ZyxGridCom_1.default).setRowCel(row + 1, col);
                var tarY = this.gridsWidth * (10 - row - 1) - this.gridsWidth;
                cc.tween(grid)
                    .to(0.4, { y: tarY }, { easing: 'quartIn' })
                    .start();
            }
        }
        return canDrop;
    };
    // 检验是否结束
    ZyxGame.prototype.checkGameOver = function () {
        if (ZyxGameModule_1.zyxGameModule.checkGameOver()) {
            ZyxGameModule_1.zyxGameModule.lock = true;
            Uimanager_1.uimanager.showGameOver();
        }
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