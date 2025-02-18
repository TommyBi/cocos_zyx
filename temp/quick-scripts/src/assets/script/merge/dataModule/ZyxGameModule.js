"use strict";
cc._RF.push(module, '13772iquZdC5IRf5xG8UarI', 'ZyxGameModule');
// script/merge/dataModule/ZyxGameModule.ts

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
exports.zyxGameModule = void 0;
var TypeDefine_1 = require("../define/TypeDefine");
var NewUtils_1 = require("../util/NewUtils");
var DataModule_1 = require("./DataModule");
var OrderModule_1 = require("./OrderModule");
var ZyxGameModule = /** @class */ (function (_super) {
    __extends(ZyxGameModule, _super);
    function ZyxGameModule() {
        var _this = _super.call(this) || this;
        // 游戏进行中的资源数据
        _this.gameInfo = null;
        // 游戏进行中的棋盘数据 [gridSize, contentType, uniqueID]
        _this.gridInfo = [
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        ];
        // 操作锁
        _this.selectGirdUniqueId = -1;
        // 格子宽度
        _this.gridsWidth = 84;
        // 下一排信息
        _this.nextGridInfo = [];
        // 钻石的层级间隔
        _this.diamondInterval = 10;
        // 历史最高分
        _this.scoreRecord = 0;
        return _this;
    }
    ZyxGameModule.prototype.parseData = function (data) {
        _super.prototype.parseData.call(this, data);
        this.gameInfo = data.gameInfo;
        this.gridInfo = data.gridInfo || [
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [2, 1, 1], [2, 1, 1], [0, 0, 0], [0, 0, 0]],
            [[1, 1, 2], [1, 1, 3], [1, 1, 4], [1, 1, 5], [1, 1, 6], [1, 1, 7], [0, 0, 0], [0, 0, 0]],
        ];
        this.scoreRecord = data.scoreRecord || 0;
        this.produce();
    };
    // 生产格子，服务器逻辑 返回格式为[gridsize][contentType][uniqueId][]
    ZyxGameModule.prototype.produce = function () {
        // 确定要生成的数字组合 nMax <= 7;
        var arr = [];
        var hasProducedDiamond = false;
        do {
            // 生成新格子
            var newNum = NewUtils_1.default.randomIntInclusive(0, 10);
            if (newNum >= 0 && newNum < 4) {
                newNum = 0;
            }
            else if (newNum >= 4 && newNum < 6) {
                newNum = 1;
            }
            else if (newNum >= 6 && newNum < 8) {
                newNum = 2;
            }
            else if (newNum >= 8 && newNum < 10) {
                newNum = 3;
            }
            else if (newNum === 10) {
                newNum = 4;
            }
            if (newNum === 0) {
                arr.push([0, 0, 0]);
            }
            else {
                // 判断剩余空间是否有空格子区域
                var surSpace = 8 - arr.length;
                var emptyGrid = arr.filter(function (x) {
                    return x && x[1] === TypeDefine_1.gridContentType.EMPTY;
                });
                if (surSpace <= newNum && emptyGrid.length === 0) {
                    for (var i = 0; i < surSpace; i++) {
                        arr.push([0, 0, 0]);
                    }
                    break;
                }
                // 空间足够，那就将对应数量的格子进行填充
                var contentType = this.getContentType(hasProducedDiamond);
                if (contentType === TypeDefine_1.gridContentType.DIAMOND) {
                    hasProducedDiamond = true;
                }
                if (surSpace >= newNum) {
                    this.gameInfo.uniqueId++;
                    for (var i = 0; i < newNum; i++) {
                        arr.push([newNum, contentType, this.gameInfo.uniqueId]);
                    }
                }
            }
        } while (arr.length < 8);
        this.nextGridInfo = arr;
        this.diamondInterval++;
        console.log('produce', arr);
        return arr;
        // const a = [[2, 1, 10], [2, 1, 10], [2, 1, 11], [2, 1, 11], [2, 1, 12], [2, 1, 12], [2, 1, 13], [2, 1, 13]];
        // return a;
    };
    // 获得随机生成格子的类型
    ZyxGameModule.prototype.getContentType = function (hasProducedDiamond) {
        if (hasProducedDiamond)
            return TypeDefine_1.gridContentType.NORMAL;
        // 生成订单道具的权重是19，普通格子权重是80，钻石权重是（5 + 层级间隔）
        var randomNum = NewUtils_1.default.randomIntInclusive(1, 100);
        if (randomNum <= 5) {
            // 钻石
            var contnetType = this.diamondInterval > 50 ? TypeDefine_1.gridContentType.DIAMOND : TypeDefine_1.gridContentType.NORMAL;
            if (contnetType === TypeDefine_1.gridContentType.DIAMOND)
                this.diamondInterval = 0;
            return contnetType;
        }
        else if (randomNum <= 19) {
            // 订单道具 60%是当前订单中相关的物品，40%是其他种类格子
            var orderGoodsIds = OrderModule_1.orderModule.getAllGoodsId();
            var contentType = this.getRandomNumberWithWeights(orderGoodsIds);
            return contentType;
        }
        else {
            // 普通格子
            return TypeDefine_1.gridContentType.NORMAL;
        }
    };
    ZyxGameModule.prototype.getRandomNumberWithWeights = function (excludedNumbers) {
        // 创建一个包含7到25的数组
        var allNumbers = Array.from({ length: 19 }, function (_, i) { return i + 7; });
        // 创建一个包含所有数字及其权重的对象数组
        var weightedNumbers = [];
        // 遍历所有数字，设置参数数组中的数字权重为60，其他为40
        allNumbers.forEach(function (number) {
            var weight = excludedNumbers.includes(number) ? 60 : 40;
            // 将每个数字根据其权重添加到数组中多次
            for (var i = 0; i < weight; i++) {
                weightedNumbers.push(number);
            }
        });
        // 从带有权重的数组中随机选择一个数字
        var randomIndex = Math.floor(Math.random() * weightedNumbers.length);
        return weightedNumbers[randomIndex];
    };
    // 检查游戏是否结束
    ZyxGameModule.prototype.checkGameOver = function () {
        var isGameOver = false;
        for (var col = 0; col < this.gridInfo[0].length; col++) {
            if (this.gridInfo[0][col][1] !== TypeDefine_1.gridContentType.EMPTY) {
                isGameOver = true;
            }
        }
        return isGameOver;
    };
    // 将新格子的数据返回
    ZyxGameModule.prototype.copyNewGridData = function () {
        var newGridInfo = [];
        for (var i = 0; i < this.nextGridInfo.length; i++) {
            var gridInfo = [0, 0, 0];
            gridInfo[0] = this.nextGridInfo[i][0];
            gridInfo[1] = this.nextGridInfo[i][1];
            gridInfo[2] = this.nextGridInfo[i][2];
            newGridInfo.push(gridInfo);
        }
        return newGridInfo;
    };
    return ZyxGameModule;
}(DataModule_1.default));
exports.default = ZyxGameModule;
exports.zyxGameModule = new ZyxGameModule();

cc._RF.pop();