
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
        // 是否已经生产了新的
        _this.hasProduce = false;
        return _this;
    }
    ZyxGame.prototype.onLoad = function () {
        this.initUI();
        this.uBtnClean.on(cc.Node.EventType.TOUCH_END, this.produce, this);
        EventManager_1.eventManager.on(Define_1.EventType.ZYX_CHECK_MERGE, this.check, this);
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
    ZyxGame.prototype.produce = function () {
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
    // 循环检测是否可以掉落和消除
    ZyxGame.prototype.check = function () {
        this.hasProduce = false;
        this.drop(9);
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
            console.log('掉落合成检测结束:', ZyxGameModule_1.zyxGameModule.gridInfo);
            var isGameOver = this.checkGameOver();
            if (!isGameOver && !this.hasProduce) {
                this.hasProduce = true;
                this.produce();
            }
            else {
                ZyxGameModule_1.zyxGameModule.lock = false;
            }
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
                grid.getComponent(ZyxGridCom_1.default).moveDown();
                var tarY = ZyxGameModule_1.zyxGameModule.gridsWidth * (10 - row - 1) - ZyxGameModule_1.zyxGameModule.gridsWidth;
                cc.tween(grid)
                    .to(0.2, { y: tarY }, { easing: 'quartIn' })
                    .start();
            }
        }
        return canDrop;
    };
    // 检验是否结束
    ZyxGame.prototype.checkGameOver = function () {
        if (ZyxGameModule_1.zyxGameModule.checkGameOver()) {
            ZyxGameModule_1.zyxGameModule.lock = false;
            Uimanager_1.uimanager.showGameOver();
            return true;
        }
        return false;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUEwRDtBQUMxRCw2REFBNEQ7QUFDNUQsbURBQXVEO0FBQ3ZELDRDQUE4QztBQUM5QyxrREFBaUQ7QUFDakQscURBQWtFO0FBQ2xFLDJDQUFzQztBQUVoQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxVQUFVO0FBRVY7SUFBcUMsMkJBQVk7SUFBakQ7UUFBQSxxRUFpVUM7UUE5VEcsZUFBUyxHQUFhLElBQUksQ0FBQztRQUczQixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixtQkFBYSxHQUFhLElBQUksQ0FBQztRQUcvQixpQkFBVyxHQUFhLElBQUksQ0FBQztRQUc3QixlQUFTLEdBQWEsSUFBSSxDQUFDO1FBRzNCLGlCQUFXLEdBQVksSUFBSSxDQUFDO1FBRzVCLGdCQUFVLEdBQVksSUFBSSxDQUFDO1FBRzNCLGNBQVEsR0FBWSxJQUFJLENBQUM7UUFHekIsZUFBUyxHQUFZLElBQUksQ0FBQztRQUcxQixjQUFRLEdBQVksSUFBSSxDQUFDO1FBRWpCLFdBQUssR0FBYyxFQUFFLENBQUM7UUFFOUIscURBQXFEO1FBQzdDLG1CQUFhLEdBQVksS0FBSyxDQUFDO1FBRXZDLFlBQVk7UUFDSixnQkFBVSxHQUFZLEtBQUssQ0FBQzs7SUF3UnhDLENBQUM7SUF0Ukcsd0JBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVkLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJ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QUFDLEtBQUssQ0FBQztrREFDWTtJQUcvQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2dEQUNVO0lBRzdCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7OENBQ1E7SUFHM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztnREFDVTtJQUc1QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOytDQUNTO0lBRzNCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7NkNBQ087SUFHekI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDUTtJQUcxQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzZDQUNPO0lBakNSLE9BQU87UUFEM0IsT0FBTztPQUNhLE9BQU8sQ0FpVTNCO0lBQUQsY0FBQztDQWpVRCxBQWlVQyxDQWpVb0MsRUFBRSxDQUFDLFNBQVMsR0FpVWhEO2tCQWpVb0IsT0FBTyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHBsYXllck1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL1BsYXllck1vZHVsZVwiO1xuaW1wb3J0IHsgenl4R2FtZU1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL1p5eEdhbWVNb2R1bGVcIjtcbmltcG9ydCB7IGdyaWRDb250ZW50VHlwZSB9IGZyb20gXCIuLi9kZWZpbmUvVHlwZURlZmluZVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvRGVmaW5lXCI7XG5pbXBvcnQgeyB1aW1hbmFnZXIgfSBmcm9tIFwiLi4vbWFuYWdlci9VaW1hbmFnZXJcIjtcbmltcG9ydCB7IGV2ZW50TWFuYWdlciwgRXZlbnRNYW5hZ2VyIH0gZnJvbSBcIi4uL3V0aWwvRXZlbnRNYW5hZ2VyXCI7XG5pbXBvcnQgWnl4R3JpZENvbSBmcm9tIFwiLi9aeXhHcmlkQ29tXCI7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbi8vIOa4uOaIj+S4u+eOqeazleWcuuaZr1xuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFp5eEdhbWUgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxTY29yZTogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxEaWFtb25kOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFN0YXJDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsSGFtbWVyQ250OiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibEJvbWJDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsQWRDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdTdGFyQmFyOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCdG5IYW1tZXI6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0bkJvbWI6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0bkNsZWFuOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCb3hHcmlkOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIHByaXZhdGUgZ3JpZHM6IGNjLk5vZGVbXSA9IFtdO1xuXG4gICAgLy8g5o6J6JC95Y+R55Sf5oOF5Ya177yI5o6J6JC96ZyA6KaB6Ieq5bqV5ZCR5LiK5qOA5rWL77yM5LiA6L2u5qOA5rWL5ZCO5YaN5qOA5rWL5LiL5LiA6L2u77yM55u05Yiw5pyA57uI5Y+v5Lul5Y+R55Sf5o6J6JC955qE5oOF5Ya15YWo6YOo5qOA5rWL5a6M5q+V77yJXG4gICAgcHJpdmF0ZSBoYXNEcm9wQWN0aW9uOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvLyDmmK/lkKblt7Lnu4/nlJ/kuqfkuobmlrDnmoRcbiAgICBwcml2YXRlIGhhc1Byb2R1Y2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5pbml0VUkoKTtcblxuICAgICAgICB0aGlzLnVCdG5DbGVhbi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMucHJvZHVjZSwgdGhpcyk7XG5cbiAgICAgICAgZXZlbnRNYW5hZ2VyLm9uKEV2ZW50VHlwZS5aWVhfQ0hFQ0tfTUVSR0UsIHRoaXMuY2hlY2ssIHRoaXMpO1xuXG4gICAgICAgIHp5eEdhbWVNb2R1bGUubG9jayA9IGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuXG4gICAgfVxuXG4gICAgaW5pdFVJKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnVsYmxTY29yZS5zdHJpbmcgPSBgJHt6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLnNjb3JlfWA7XG4gICAgICAgIHRoaXMudWxibERpYW1vbmQuc3RyaW5nID0gYCR7enl4R2FtZU1vZHVsZS5nYW1lSW5mby5kaWFtb25kfWA7XG4gICAgICAgIHRoaXMudWxibFN0YXJDbnQuc3RyaW5nID0gYCR7enl4R2FtZU1vZHVsZS5nYW1lSW5mby5zdGFyfWA7XG4gICAgICAgIHRoaXMudWxibEFkQ250LnN0cmluZyA9IGAoJHt6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLmFkVGltZXN9KWA7XG4gICAgICAgIHRoaXMudWxibEhhbW1lckNudC5zdHJpbmcgPSBgJHtwbGF5ZXJNb2R1bGUuaGFtbWVyfWA7XG4gICAgICAgIHRoaXMudWxibEJvbWJDbnQuc3RyaW5nID0gYCR7cGxheWVyTW9kdWxlLmJvbWJ9YDtcblxuICAgICAgICB0aGlzLmluaXRDaGVzc0JvYXJkKCk7XG4gICAgfVxuXG4gICAgLy8g5Yid5aeL5YyW5qOL55uY5L+h5oGvXG4gICAgYXN5bmMgaW5pdENoZXNzQm9hcmQoKSB7XG4gICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8ubGVuZ3RoOyByb3crKykge1xuICAgICAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddLmxlbmd0aDsgY29sKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY29sID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBncmlkID0gYXdhaXQgdGhpcy5wcm9kdWNlR3JpZCh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVCb3hHcmlkLmFkZENoaWxkKGdyaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZC5zZXRQb3NpdGlvbihuZXcgY2MuVmVjMih6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiBjb2wsIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqICgxMCAtIHJvdykgLSB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnNldFJvd0NlbChyb3csIGNvbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzLnB1c2goZ3JpZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzFdICE9IGdyaWRDb250ZW50VHlwZS5FTVBUWSAmJiB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsyXSAhPT0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbCAtIDFdWzJdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdyaWQgPSBhd2FpdCB0aGlzLnByb2R1Y2VHcmlkKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51Qm94R3JpZC5hZGRDaGlsZChncmlkKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5zZXRQb3NpdGlvbihuZXcgY2MuVmVjMih6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiBjb2wsIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqICgxMCAtIHJvdykgLSB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGgpKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuc2V0Um93Q2VsKHJvdywgY29sKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkcy5wdXNoKGdyaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb2R1Y2UoKSB7XG4gICAgICAgIHRoaXMubW92ZVVwKCk7XG5cbiAgICAgICAgdGhpcy5wcm9kdWNlUm93KCk7XG4gICAgfVxuXG4gICAgLy8g55Sf5oiQ5paw55qE5LiA6KGMXG4gICAgYXN5bmMgcHJvZHVjZVJvdygpIHtcbiAgICAgICAgLy8g5YmU6Zmk6aG26YOo56m65L2Z55qE5LiA6KGMXG4gICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm8uc2hpZnQoKTtcblxuICAgICAgICAvLyDnlJ/miJDmlrDnmoTkuIDooYzmlbDmja5cbiAgICAgICAgY29uc3QgbmV3RGF0YSA9IHp5eEdhbWVNb2R1bGUucHJvZHVjZSgpO1xuICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvLnB1c2gobmV3RGF0YSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSA5O1xuICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2ldWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGF3YWl0IHRoaXMucHJvZHVjZUdyaWQoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51Qm94R3JpZC5hZGRDaGlsZChncmlkKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5zZXRQb3NpdGlvbihuZXcgY2MuVmVjMih6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiBpLCAtODQpKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuc2V0Um93Q2VsKHJvdywgaSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHMucHVzaChncmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXVsxXSAhPSBncmlkQ29udGVudFR5cGUuRU1QVFkgJiYgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2ldWzJdICE9PSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11baSAtIDFdWzJdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGF3YWl0IHRoaXMucHJvZHVjZUdyaWQoenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2ldKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVCb3hHcmlkLmFkZENoaWxkKGdyaWQpO1xuICAgICAgICAgICAgICAgIGdyaWQuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoenl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoICogaSwgLTg0KSk7XG4gICAgICAgICAgICAgICAgZ3JpZC5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuc2V0Um93Q2VsKHJvdywgaSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkcy5wdXNoKGdyaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5bGV56S65paw5qC85a2QXG4gICAgICAgIHRoaXMuc2hvd05ld0dyaWRzKCk7XG4gICAgfVxuXG4gICAgLy8g55Sf5oiQ5qC85a2QXG4gICAgYXN5bmMgcHJvZHVjZUdyaWQoZ3JpZEluZm86IG51bWJlcltdKSB7XG4gICAgICAgIGNvbnN0IGdyaWQgPSBhd2FpdCB1aW1hbmFnZXIubG9hZFByZWZhYigncHJlZmFiL3p5eC91Q29tR3JpZCcpO1xuICAgICAgICBjb25zdCBncmlkTm9kZSA9IGNjLmluc3RhbnRpYXRlKGdyaWQpO1xuICAgICAgICBncmlkTm9kZS5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuaW5pdChncmlkSW5mbyk7XG4gICAgICAgIHJldHVybiBncmlkTm9kZTtcbiAgICB9XG5cbiAgICAvLyDnlJ/miJDkuYvliY3vvIzlhYjkuIrnp7tcbiAgICBtb3ZlVXAoKTogdm9pZCB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ3JpZCA9IHRoaXMuZ3JpZHNbaV07XG4gICAgICAgICAgICBjYy50d2VlbihncmlkKVxuICAgICAgICAgICAgICAgIC50bygwLjUsIHsgeTogZ3JpZC55ICsgODQgfSwgeyBlYXNpbmc6ICdjdWJpY0luT3V0JyB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuXG4gICAgICAgICAgICBncmlkLmdldENvbXBvbmVudChaeXhHcmlkQ29tKS5tb3ZlVXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWxleekuuaWsOagvOWtkFxuICAgIHNob3dOZXdHcmlkcygpOiB2b2lkIHtcbiAgICAgICAgbGV0IHNob3dFbmRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBncmlkID0gdGhpcy5ncmlkc1tpXTtcbiAgICAgICAgICAgIGlmIChncmlkLnkgIT09IC04NCkgY29udGludWU7XG4gICAgICAgICAgICBjYy50d2VlbihncmlkKVxuICAgICAgICAgICAgICAgIC50bygwLjUsIHsgeTogZ3JpZC55ICsgODQgfSwgeyBlYXNpbmc6ICdjdWJpY0luT3V0JyB9KVxuICAgICAgICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3dFbmRpbmcpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0VuZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFzRHJvcEFjdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyb3AoOSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOW+queOr+ajgOa1i+aYr+WQpuWPr+S7peaOieiQveWSjOa2iOmZpFxuICAgIGNoZWNrKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmhhc1Byb2R1Y2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kcm9wKDkpO1xuICAgIH1cblxuICAgIC8vIOi/m+ihjOWQiOaIkOaTjeS9nFxuICAgIG1lcmdlKCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnbWVyZ2UnKTtcbiAgICAgICAgbGV0IG1lcmdlVGltZXMgPSAwO1xuICAgICAgICAvLyDmo4DmtYvmr4/kuIDooYzmmK/lkKbmnInlj6/ku6XmtojpmaTnmoTmoLzlrZBcbiAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgenl4R2FtZU1vZHVsZS5ncmlkSW5mby5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgICAgICBjb25zdCByb3dEYXRhID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddO1xuICAgICAgICAgICAgbGV0IGhhc0VtcHR5R3JpZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dEYXRhLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvd0RhdGFbal1bMV0gPT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICBoYXNFbXB0eUdyaWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWmguaenOayoeacieepuuagvOWtkO+8jOmCo+WwseWPr+S7pei/m+ihjOa2iOmZpFxuICAgICAgICAgICAgY29uc3QgdW5pcXVlSWRzID0gW107XG4gICAgICAgICAgICBpZiAoIWhhc0VtcHR5R3JpZCkge1xuICAgICAgICAgICAgICAgIG1lcmdlVGltZXMrKztcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJvd0RhdGEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVuaXF1ZUlkcy5pbmRleE9mKHJvd0RhdGFbal1bMl0pID09PSAtMSAmJiByb3dEYXRhW2pdWzJdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1bmlxdWVJZHMucHVzaChyb3dEYXRhW2pdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtqXSA9IFswLCAwLCAwXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOa2iOmZpFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bmlxdWVJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmlxdWVJZCA9IHVuaXF1ZUlkc1tpXTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsaW1pbmF0ZUdyaWQodW5pcXVlSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lcmdlVGltZXMgPiAwKSB7XG4gICAgICAgICAgICB1aW1hbmFnZXIuc2hvd1RpcHMoJ+eZvOeUn+a2iOmZpCcpO1xuICAgICAgICAgICAgdGhpcy5kcm9wKDkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+aOieiQveWQiOaIkOajgOa1i+e7k+adnzonLCB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvKTtcbiAgICAgICAgICAgIGNvbnN0IGlzR2FtZU92ZXIgPSB0aGlzLmNoZWNrR2FtZU92ZXIoKTtcbiAgICAgICAgICAgIGlmICghaXNHYW1lT3ZlciAmJiAhdGhpcy5oYXNQcm9kdWNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNQcm9kdWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2R1Y2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5sb2NrID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmtojpmaRcbiAgICBlbGltaW5hdGVHcmlkKHVuaXF1ZUlEOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkc1tpXS5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkudW5pcXVlSWQgPT09IHVuaXF1ZUlEKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2VsaW1pbmF0ZUdyaWQnLCB1bmlxdWVJRCwgdGhpcy5ncmlkcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkc1tpXS5nZXRDb21wb25lbnQoWnl4R3JpZENvbSkuZWxpbWluYXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmo4DmtYvlvZPliY3ooYznmoTkuIrkuIDooYzmmK/lkKbmnInmjonokL3mg4XlhrXvvIzlpoLmnpzmnInliJnov5vooYzmjonokL3mk43kvZxcbiAgICBkcm9wKHJvdyk6IHZvaWQge1xuICAgICAgICBpZiAocm93ID09PSAwKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNEcm9wQWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNEcm9wQWN0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+aWsOS4gOi9ruajgOa1iycpO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJvcCg5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVyZ2UoKTtcbiAgICAgICAgICAgICAgICB9LCA0MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgODsgY29sKyspIHtcbiAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsxXSA9PT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZICYmIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93IC0gMV1bY29sXVsxXSAhPT0gZ3JpZENvbnRlbnRUeXBlLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgLy8g5qOA5rWL5piv5ZCm5Y+v5Lul5o6J6JC9XG4gICAgICAgICAgICAgICAgY29uc3QgaGFzRHJvcCA9IHRoaXMuZHJvcEdyaWQocm93IC0gMSwgY29sKTtcbiAgICAgICAgICAgICAgICBpZiAoaGFzRHJvcCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc0Ryb3BBY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJvcChyb3cgLSAxKTtcbiAgICB9XG5cbiAgICBkcm9wR3JpZChyb3c6IG51bWJlciwgY29sOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLy8g5qOA5rWL5a+55bqU55qE56m65qC85a2Q5piv5ZCm5Y+v5Lul5a6557qz5o6J5LiL5p2l55qE5qC85a2Q57G75Z6LXG4gICAgICAgIGNvbnN0IHVuaXF1ZUlEID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMl07XG4gICAgICAgIGNvbnN0IGNoZWNrQ29scyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtpXVsyXSA9PT0gdW5pcXVlSUQpIHtcbiAgICAgICAgICAgICAgICBjaGVja0NvbHMucHVzaChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjYW5Ecm9wID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGVja0NvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGNoZWNrQ29sc1tpXTtcbiAgICAgICAgICAgIGlmICh6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3JvdyArIDFdW2NvbF1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgIGNhbkRyb3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpoLmnpzlj6/ku6XmjonokL3vvIzpgqPlsLHlsIbmlbDmja7ov5vooYzkuqTmjaLvvIzlkIzml7bmm7TmlrDmoLzlrZDnmoToh6rouqvlsZ7mgKflkozkvY3nva7kv6Hmga9cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGVja0NvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGNoZWNrQ29sc1tpXTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93ICsgMV1bY29sXVswXSA9IHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bcm93XVtjb2xdWzBdO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3cgKyAxXVtjb2xdWzFdID0genl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMV07XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3JvdyArIDFdW2NvbF1bMl0gPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsyXTtcblxuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMF0gPSAwO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1tyb3ddW2NvbF1bMV0gPSBncmlkQ29udGVudFR5cGUuRU1QVFk7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3Jvd11bY29sXVsyXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygn5o6J6JC9OicsIHVuaXF1ZUlEKTtcbiAgICAgICAgY29uc29sZS5sb2coJ2dyaWRJbmZvIG92ZXI6Jywgenl4R2FtZU1vZHVsZS5ncmlkSW5mbyk7XG5cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmdyaWRzW2ldO1xuICAgICAgICAgICAgaWYgKGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLnVuaXF1ZUlkID09PSB1bmlxdWVJRCkge1xuICAgICAgICAgICAgICAgIGdyaWQuZ2V0Q29tcG9uZW50KFp5eEdyaWRDb20pLm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFyWSA9IHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCAqICgxMCAtIHJvdyAtIDEpIC0genl4R2FtZU1vZHVsZS5ncmlkc1dpZHRoO1xuICAgICAgICAgICAgICAgIGNjLnR3ZWVuKGdyaWQpXG4gICAgICAgICAgICAgICAgICAgIC50bygwLjIsIHsgeTogdGFyWSB9LCB7IGVhc2luZzogJ3F1YXJ0SW4nIH0pXG4gICAgICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNhbkRyb3A7XG4gICAgfVxuXG4gICAgLy8g5qOA6aqM5piv5ZCm57uT5p2fXG4gICAgY2hlY2tHYW1lT3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHp5eEdhbWVNb2R1bGUuY2hlY2tHYW1lT3ZlcigpKSB7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIHVpbWFuYWdlci5zaG93R2FtZU92ZXIoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iXX0=