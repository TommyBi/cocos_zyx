
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/ZyxGameModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9aeXhHYW1lTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBK0U7QUFDL0UsNkNBQXdDO0FBQ3hDLDJDQUFzQztBQUN0Qyw2Q0FBNEM7QUFFNUM7SUFBMkMsaUNBQVU7SUFrQ2pEO1FBQUEsWUFDSSxpQkFBTyxTQUNWO1FBbENELGFBQWE7UUFDYixjQUFRLEdBQWlCLElBQUksQ0FBQztRQUU5QiwrQ0FBK0M7UUFDL0MsY0FBUSxHQUFVO1lBQ2QsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzNGLENBQUM7UUFFRixNQUFNO1FBQ04sd0JBQWtCLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFaEMsT0FBTztRQUNQLGdCQUFVLEdBQVcsRUFBRSxDQUFDO1FBRXhCLFFBQVE7UUFDRCxrQkFBWSxHQUFVLEVBQUUsQ0FBQztRQUVoQyxVQUFVO1FBQ0gscUJBQWUsR0FBVyxFQUFFLENBQUM7UUFFcEMsUUFBUTtRQUNELGlCQUFXLEdBQVcsQ0FBQyxDQUFDOztJQUkvQixDQUFDO0lBRUQsaUNBQVMsR0FBVCxVQUFVLElBQVM7UUFDZixpQkFBTSxTQUFTLFlBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSTtZQUM3QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENB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QUVELFlBQVk7SUFDWix1Q0FBZSxHQUFmO1FBQ0ksSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMvQyxJQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM5QjtRQUNELE9BQU8sV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFDTCxvQkFBQztBQUFELENBekxBLEFBeUxDLENBekwwQyxvQkFBVSxHQXlMcEQ7O0FBQ1ksUUFBQSxhQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdyaWRDb250ZW50VHlwZSwgZ3JpZFNpemUsIHR5cGVHYW1lSW5mbyB9IGZyb20gJy4uL2RlZmluZS9UeXBlRGVmaW5lJztcbmltcG9ydCBOZXdVdGlscyBmcm9tICcuLi91dGlsL05ld1V0aWxzJztcbmltcG9ydCBEYXRhTW9kdWxlIGZyb20gJy4vRGF0YU1vZHVsZSc7XG5pbXBvcnQgeyBvcmRlck1vZHVsZSB9IGZyb20gJy4vT3JkZXJNb2R1bGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaeXhHYW1lTW9kdWxlIGV4dGVuZHMgRGF0YU1vZHVsZSB7XG5cbiAgICAvLyDmuLjmiI/ov5vooYzkuK3nmoTotYTmupDmlbDmja5cbiAgICBnYW1lSW5mbzogdHlwZUdhbWVJbmZvID0gbnVsbDtcblxuICAgIC8vIOa4uOaIj+i/m+ihjOS4reeahOaji+ebmOaVsOaNriBbZ3JpZFNpemUsIGNvbnRlbnRUeXBlLCB1bmlxdWVJRF1cbiAgICBncmlkSW5mbzogYW55W10gPSBbXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgXTtcblxuICAgIC8vIOaTjeS9nOmUgVxuICAgIHNlbGVjdEdpcmRVbmlxdWVJZDogbnVtYmVyID0gLTE7XG5cbiAgICAvLyDmoLzlrZDlrr3luqZcbiAgICBncmlkc1dpZHRoOiBudW1iZXIgPSA4NDtcblxuICAgIC8vIOS4i+S4gOaOkuS/oeaBr1xuICAgIHB1YmxpYyBuZXh0R3JpZEluZm86IGFueVtdID0gW107XG5cbiAgICAvLyDpkrvnn7PnmoTlsYLnuqfpl7TpmpRcbiAgICBwdWJsaWMgZGlhbW9uZEludGVydmFsOiBudW1iZXIgPSAxMDtcblxuICAgIC8vIOWOhuWPsuacgOmrmOWIhlxuICAgIHB1YmxpYyBzY29yZVJlY29yZDogbnVtYmVyID0gMDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHBhcnNlRGF0YShkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgc3VwZXIucGFyc2VEYXRhKGRhdGEpO1xuXG4gICAgICAgIHRoaXMuZ2FtZUluZm8gPSBkYXRhLmdhbWVJbmZvO1xuICAgICAgICB0aGlzLmdyaWRJbmZvID0gZGF0YS5ncmlkSW5mbyB8fCBbXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFsyLCAxLCAxXSwgWzIsIDEsIDFdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzEsIDEsIDJdLCBbMSwgMSwgM10sIFsxLCAxLCA0XSwgWzEsIDEsIDVdLCBbMSwgMSwgNl0sIFsxLCAxLCA3XSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICBdO1xuICAgICAgICB0aGlzLnNjb3JlUmVjb3JkID0gZGF0YS5zY29yZVJlY29yZCB8fCAwO1xuXG4gICAgICAgIHRoaXMucHJvZHVjZSgpO1xuICAgIH1cblxuICAgIC8vIOeUn+S6p+agvOWtkO+8jOacjeWKoeWZqOmAu+i+kSDov5Tlm57moLzlvI/kuLpbZ3JpZHNpemVdW2NvbnRlbnRUeXBlXVt1bmlxdWVJZF1bXVxuICAgIHByb2R1Y2UoKTogbnVtYmVyW11bXSB7XG5cbiAgICAgICAgLy8g56Gu5a6a6KaB55Sf5oiQ55qE5pWw5a2X57uE5ZCIIG5NYXggPD0gNztcbiAgICAgICAgY29uc3QgYXJyID0gW107XG4gICAgICAgIGxldCBoYXNQcm9kdWNlZERpYW1vbmQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgLy8g55Sf5oiQ5paw5qC85a2QXG4gICAgICAgICAgICBsZXQgbmV3TnVtID0gTmV3VXRpbHMucmFuZG9tSW50SW5jbHVzaXZlKDAsIDEwKTtcbiAgICAgICAgICAgIGlmIChuZXdOdW0gPj0gMCAmJiBuZXdOdW0gPCA0KSB7XG4gICAgICAgICAgICAgICAgbmV3TnVtID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3TnVtID49IDQgJiYgbmV3TnVtIDwgNikge1xuICAgICAgICAgICAgICAgIG5ld051bSA9IDE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld051bSA+PSA2ICYmIG5ld051bSA8IDgpIHtcbiAgICAgICAgICAgICAgICBuZXdOdW0gPSAyO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdOdW0gPj0gOCAmJiBuZXdOdW0gPCAxMCkge1xuICAgICAgICAgICAgICAgIG5ld051bSA9IDM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld051bSA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICBuZXdOdW0gPSA0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV3TnVtID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goWzAsIDAsIDBdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5Yik5pat5Ymp5L2Z56m66Ze05piv5ZCm5pyJ56m65qC85a2Q5Yy65Z+fXG4gICAgICAgICAgICAgICAgY29uc3Qgc3VyU3BhY2UgPSA4IC0gYXJyLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBlbXB0eUdyaWQgPSBhcnIuZmlsdGVyKHggPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geCAmJiB4WzFdID09PSBncmlkQ29udGVudFR5cGUuRU1QVFk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBpZiAoc3VyU3BhY2UgPD0gbmV3TnVtICYmIGVtcHR5R3JpZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdXJTcGFjZTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChbMCwgMCwgMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOepuumXtOi2s+Wkn++8jOmCo+WwseWwhuWvueW6lOaVsOmHj+eahOagvOWtkOi/m+ihjOWhq+WFhVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gdGhpcy5nZXRDb250ZW50VHlwZShoYXNQcm9kdWNlZERpYW1vbmQpO1xuICAgICAgICAgICAgICAgIGlmIChjb250ZW50VHlwZSA9PT0gZ3JpZENvbnRlbnRUeXBlLkRJQU1PTkQpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzUHJvZHVjZWREaWFtb25kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHN1clNwYWNlID49IG5ld051bSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVJbmZvLnVuaXF1ZUlkKys7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV3TnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKFtuZXdOdW0sIGNvbnRlbnRUeXBlLCB0aGlzLmdhbWVJbmZvLnVuaXF1ZUlkXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSB3aGlsZSAoYXJyLmxlbmd0aCA8IDgpO1xuXG4gICAgICAgIHRoaXMubmV4dEdyaWRJbmZvID0gYXJyO1xuICAgICAgICB0aGlzLmRpYW1vbmRJbnRlcnZhbCsrO1xuICAgICAgICBjb25zb2xlLmxvZygncHJvZHVjZScsIGFycik7XG4gICAgICAgIHJldHVybiBhcnI7XG5cbiAgICAgICAgLy8gY29uc3QgYSA9IFtbMiwgMSwgMTBdLCBbMiwgMSwgMTBdLCBbMiwgMSwgMTFdLCBbMiwgMSwgMTFdLCBbMiwgMSwgMTJdLCBbMiwgMSwgMTJdLCBbMiwgMSwgMTNdLCBbMiwgMSwgMTNdXTtcbiAgICAgICAgLy8gcmV0dXJuIGE7XG4gICAgfVxuXG4gICAgLy8g6I635b6X6ZqP5py655Sf5oiQ5qC85a2Q55qE57G75Z6LXG4gICAgZ2V0Q29udGVudFR5cGUoaGFzUHJvZHVjZWREaWFtb25kOiBib29sZWFuKTogZ3JpZENvbnRlbnRUeXBlIHtcbiAgICAgICAgaWYgKGhhc1Byb2R1Y2VkRGlhbW9uZCkgcmV0dXJuIGdyaWRDb250ZW50VHlwZS5OT1JNQUw7XG5cbiAgICAgICAgLy8g55Sf5oiQ6K6i5Y2V6YGT5YW355qE5p2D6YeN5pivMTnvvIzmma7pgJrmoLzlrZDmnYPph43mmK84MO+8jOmSu+efs+adg+mHjeaYr++8iDUgKyDlsYLnuqfpl7TpmpTvvIlcbiAgICAgICAgY29uc3QgcmFuZG9tTnVtID0gTmV3VXRpbHMucmFuZG9tSW50SW5jbHVzaXZlKDEsIDEwMCk7XG4gICAgICAgIGlmIChyYW5kb21OdW0gPD0gNSkge1xuICAgICAgICAgICAgLy8g6ZK755+zXG4gICAgICAgICAgICBjb25zdCBjb250bmV0VHlwZSA9IHRoaXMuZGlhbW9uZEludGVydmFsID4gNTAgPyBncmlkQ29udGVudFR5cGUuRElBTU9ORCA6IGdyaWRDb250ZW50VHlwZS5OT1JNQUw7XG4gICAgICAgICAgICBpZiAoY29udG5ldFR5cGUgPT09IGdyaWRDb250ZW50VHlwZS5ESUFNT05EKSB0aGlzLmRpYW1vbmRJbnRlcnZhbCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gY29udG5ldFR5cGU7XG4gICAgICAgIH0gZWxzZSBpZiAocmFuZG9tTnVtIDw9IDE5KSB7XG4gICAgICAgICAgICAvLyDorqLljZXpgZPlhbcgNjAl5piv5b2T5YmN6K6i5Y2V5Lit55u45YWz55qE54mp5ZOB77yMNDAl5piv5YW25LuW56eN57G75qC85a2QXG4gICAgICAgICAgICBjb25zdCBvcmRlckdvb2RzSWRzID0gb3JkZXJNb2R1bGUuZ2V0QWxsR29vZHNJZCgpO1xuICAgICAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSB0aGlzLmdldFJhbmRvbU51bWJlcldpdGhXZWlnaHRzKG9yZGVyR29vZHNJZHMpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnRUeXBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5pmu6YCa5qC85a2QXG4gICAgICAgICAgICByZXR1cm4gZ3JpZENvbnRlbnRUeXBlLk5PUk1BTDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFJhbmRvbU51bWJlcldpdGhXZWlnaHRzKGV4Y2x1ZGVkTnVtYmVycykge1xuICAgICAgICAvLyDliJvlu7rkuIDkuKrljIXlkKs35YiwMjXnmoTmlbDnu4RcbiAgICAgICAgY29uc3QgYWxsTnVtYmVycyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDE5IH0sIChfLCBpKSA9PiBpICsgNyk7XG5cbiAgICAgICAgLy8g5Yib5bu65LiA5Liq5YyF5ZCr5omA5pyJ5pWw5a2X5Y+K5YW25p2D6YeN55qE5a+56LGh5pWw57uEXG4gICAgICAgIGNvbnN0IHdlaWdodGVkTnVtYmVycyA9IFtdO1xuXG4gICAgICAgIC8vIOmBjeWOhuaJgOacieaVsOWtl++8jOiuvue9ruWPguaVsOaVsOe7hOS4reeahOaVsOWtl+adg+mHjeS4ujYw77yM5YW25LuW5Li6NDBcbiAgICAgICAgYWxsTnVtYmVycy5mb3JFYWNoKG51bWJlciA9PiB7XG4gICAgICAgICAgICBjb25zdCB3ZWlnaHQgPSBleGNsdWRlZE51bWJlcnMuaW5jbHVkZXMobnVtYmVyKSA/IDYwIDogNDA7XG4gICAgICAgICAgICAvLyDlsIbmr4/kuKrmlbDlrZfmoLnmja7lhbbmnYPph43mt7vliqDliLDmlbDnu4TkuK3lpJrmrKFcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2VpZ2h0OyBpKyspIHtcbiAgICAgICAgICAgICAgICB3ZWlnaHRlZE51bWJlcnMucHVzaChudW1iZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyDku47luKbmnInmnYPph43nmoTmlbDnu4TkuK3pmo/mnLrpgInmi6nkuIDkuKrmlbDlrZdcbiAgICAgICAgY29uc3QgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3ZWlnaHRlZE51bWJlcnMubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHdlaWdodGVkTnVtYmVyc1tyYW5kb21JbmRleF07XG4gICAgfVxuXG4gICAgLy8g5qOA5p+l5ri45oiP5piv5ZCm57uT5p2fXG4gICAgY2hlY2tHYW1lT3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGlzR2FtZU92ZXIgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgdGhpcy5ncmlkSW5mb1swXS5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkSW5mb1swXVtjb2xdWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICBpc0dhbWVPdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNHYW1lT3ZlcjtcbiAgICB9XG5cbiAgICAvLyDlsIbmlrDmoLzlrZDnmoTmlbDmja7ov5Tlm55cbiAgICBjb3B5TmV3R3JpZERhdGEoKTogbnVtYmVyW11bXSB7XG4gICAgICAgIGNvbnN0IG5ld0dyaWRJbmZvID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5uZXh0R3JpZEluZm8ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdyaWRJbmZvID0gWzAsIDAsIDBdO1xuICAgICAgICAgICAgZ3JpZEluZm9bMF0gPSB0aGlzLm5leHRHcmlkSW5mb1tpXVswXTtcbiAgICAgICAgICAgIGdyaWRJbmZvWzFdID0gdGhpcy5uZXh0R3JpZEluZm9baV1bMV07XG4gICAgICAgICAgICBncmlkSW5mb1syXSA9IHRoaXMubmV4dEdyaWRJbmZvW2ldWzJdO1xuICAgICAgICAgICAgbmV3R3JpZEluZm8ucHVzaChncmlkSW5mbyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld0dyaWRJbmZvO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCB6eXhHYW1lTW9kdWxlID0gbmV3IFp5eEdhbWVNb2R1bGUoKTtcbiJdfQ==