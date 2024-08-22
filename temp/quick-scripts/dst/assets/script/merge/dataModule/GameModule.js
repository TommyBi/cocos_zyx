
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/GameModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '64566mmcFVMhZE7goFc3ntd', 'GameModule');
// script/merge/dataModule/GameModule.ts

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
exports.gameModule = void 0;
var Define_1 = require("../manager/Define");
var EventManager_1 = require("../util/EventManager");
var NewUtils_1 = require("../util/NewUtils");
var DataModule_1 = require("./DataModule");
var GameModule = /** @class */ (function (_super) {
    __extends(GameModule, _super);
    function GameModule() {
        var _this = _super.call(this) || this;
        // 用户的筹码槽位数据 1~10
        _this.slotData = [];
        // 当前正在选中的筹码槽位
        _this.curSelectSlotIdx = -1;
        // 当前选中的筹码信息
        _this.curSelectCoinIdxs = [];
        // 移动锁
        _this.moveLock = false;
        // 合成引用计数
        _this.mergeLock = 0;
        // 生成筹码效果引用计数
        _this.produceLock = 0;
        // 当前星星数
        _this.star = 0;
        // 每回合额外获得的次数
        _this.extraChance = 0;
        return _this;
    }
    GameModule.prototype.parseData = function (data) {
        _super.prototype.parseData.call(this, data);
        this.slotData = data.slotData;
        this.star = data.star;
    };
    Object.defineProperty(GameModule.prototype, "canOperate", {
        // 交互操作的检测，当前如果有正在发生的交互行为，则不允许触发更多的行为
        get: function () {
            // 正在有移动行为发生
            if (this.moveLock) {
                console.log('正在进行移动操作');
                return false;
            }
            // 正在进行合成操作
            if (this.mergeLock !== 0) {
                console.log('正在进行合成操作');
                return false;
            }
            if (this.produceLock !== 0) {
                console.log('正在发放筹码操作');
                return false;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @description 通过槽id 获取第一个有效的筹码信息
     * @param slotIdx: 需要获取第一个有效的筹码信息的槽id
     * @return vaildNum: 该槽位的有效数字、vaildIdx: 有效数字的索引、vaildSPace: 剩余可容纳的筹码空间
     */
    GameModule.prototype.getFirstVaildNumBySlotIdx = function (slotIdx) {
        var slotData = this.slotData[slotIdx];
        var vaildNum = -1;
        var vaildIdx = -1;
        var vaildSpace = 10;
        for (var i = 9; i >= 0; i--) {
            if (slotData[i] === 0)
                continue;
            vaildNum = slotData[i];
            vaildIdx = i;
            vaildSpace = 9 - i;
            break;
        }
        return { vaildNum: vaildNum, vaildIdx: vaildIdx, vaildSpace: vaildSpace };
    };
    /**
     * @description 获取当前选中的待移动的槽位筹码信息
     * @returns slotIdx: 当前选中的槽位索引、  cnt: 待移动的筹码数量、  num: 待移动的数字类型
     */
    GameModule.prototype.getCurSelectSlotInfo = function () {
        if (this.curSelectSlotIdx === -1)
            return null;
        var cnt = this.curSelectCoinIdxs.length;
        var num = this.slotData[this.curSelectSlotIdx][this.curSelectCoinIdxs[0]];
        return { slotIdx: this.curSelectSlotIdx, cnt: cnt, num: num };
    };
    // 重置当前筹码选择状态
    GameModule.prototype.resetSelectStatus = function () {
        exports.gameModule.curSelectSlotIdx = -1;
        exports.gameModule.curSelectCoinIdxs = [];
    };
    // 筹码移动完成，整理移动后的数据
    GameModule.prototype.tidySlotData = function (ed) {
        for (var i = 0; i < ed.srcIdxArr.length; i++) {
            this.slotData[this.curSelectSlotIdx][ed.srcIdxArr[i]] = 0;
            this.slotData[ed.tarSlotIdx][ed.tarIdxArr[i]] = ed.numType;
        }
        // 刷新筹码显示情况
        EventManager_1.eventManager.dispatch(Define_1.EventType.MOVE_END, ed);
        // 重置当前选中状态
        this.resetSelectStatus();
        // 检测是否可以合成
        EventManager_1.eventManager.dispatch(Define_1.EventType.CHECK_MERGE);
    };
    // 检测是否有可以合成的槽位
    GameModule.prototype.checkCanMerge = function () {
        var result = [];
        for (var i = 0; i < 8; i++) {
            var can = this.checkCanMergeBySlot(i);
            if (can)
                result.push(i);
        }
        return result;
    };
    // 通过槽位来检测是否可以进行合成
    GameModule.prototype.checkCanMergeBySlot = function (slotId) {
        var slotData = this.slotData[slotId];
        for (var i = 0; i < 10; i++) {
            if (slotData[i] === 0)
                return false;
            if (i === 0)
                continue;
            if (slotData[i] !== slotData[i - 1]) {
                return false;
            }
        }
        return true;
    };
    // 获取当前最大数字
    GameModule.prototype.getMaxValue = function () {
        var maxValue = 0;
        for (var i = 0; i < this.slotData.length; i++) {
            for (var j = 0; j < this.slotData[i].length; j++) {
                if (this.slotData[i][j] > maxValue) {
                    maxValue = this.slotData[i][j];
                }
            }
        }
        return maxValue;
    };
    // 获取当前最小数字
    GameModule.prototype.getMinValue = function () {
        var minValue = -1;
        for (var i = 0; i < this.slotData.length; i++) {
            for (var j = 0; j < this.slotData[i].length; j++) {
                if (minValue === -1 && this.slotData[i][j] !== 0) {
                    minValue = this.slotData[i][j];
                }
                if (this.slotData[i][j] < minValue && this.slotData[i][j] !== 0) {
                    minValue = this.slotData[i][j];
                }
            }
        }
        return minValue;
    };
    GameModule.prototype.getSpaceBySlot = function (id) {
        if (!this.slotData[id])
            return;
        for (var i = 0; i < this.slotData[id].length; i++) {
            if (this.slotData[id][i] === 0) {
                return 10 - i;
            }
        }
        return 0;
    };
    // 获取当前剩余空间
    GameModule.prototype.getSpace = function () {
        var space = 0;
        for (var i = 0; i < 8; i++) {
            space += this.getSpaceBySlot(i);
        }
        return space;
    };
    //TODO: 生成新的筹码数据 （服务器逻辑）
    GameModule.prototype.produceNewCoinData = function () {
        var maxValue = this.getMaxValue();
        var space = this.getSpace();
        if (maxValue >= 15) {
            console.warn('当前已合成15');
            return;
        }
        if (space === 0) {
            console.warn('没有剩余空间，无法生成新数字');
            return;
        }
        if (maxValue < 5) {
            return this.produceStrategyOne(maxValue, space);
        }
        else if (maxValue < 10) {
            return this.produceStrategyTwo(maxValue, space);
        }
        else if (maxValue < 14) {
            return this.produceStrategyThree(maxValue, space);
        }
        else if (maxValue < 15) {
            return this.produceStrategyFour(maxValue, space);
        }
    };
    /**
     * @description 小于5 策略
     * 1、生成数量 min(space*30,8);
     * 2、生成类型 <= 3
     * 3、最小数 = 当前场景最小数-1
     *
     * @param max: 当前场景中最大的筹码数值
     * @param space: 当前总的空间数
     * @returns
     */
    GameModule.prototype.produceStrategyOne = function (max, space) {
        console.log('策略1:<5');
        // 场景中最小值
        var min = Math.min(1, this.getMinValue());
        // 总共需要生成的数字数量
        var totalCnt = Math.floor(Math.min(25, space * 0.6));
        if (totalCnt === 0)
            totalCnt = 1;
        // 新生成的数字类型限定在比当前场景中最大的数字小1
        var limitMax = max - 1 > 0 ? max - 1 : 1;
        // 生成数字的类型数量 1、2、3、4
        var typeCnt = totalCnt >= 4 ? 4 : totalCnt;
        typeCnt = Math.min(typeCnt, limitMax - min + 1);
        // 数字种类
        var types = NewUtils_1.default.randomIntArrFromSection(typeCnt, min, limitMax);
        // 生成全部的随机筹码值
        var allNewCoin = NewUtils_1.default.randomIntArrFromArr(totalCnt, types);
        // 确定当前的剩余空间情况
        var spaceInfo = [];
        for (var i = 0; i < 8; i++) {
            var perSlotSpace = this.getSpaceBySlot(i);
            spaceInfo.push(perSlotSpace);
        }
        // 随机将已经生成的数字填充到相应的空位置处(一定是可以放得下的，剩余空间>=生成的数字数量)
        var result = [[], [], [], [], [], [], [], []];
        do {
            var slotIdx = NewUtils_1.default.randomIntInclusive(0, 7);
            if (spaceInfo[slotIdx] === 0)
                continue;
            result[slotIdx].push(allNewCoin.shift());
            spaceInfo[slotIdx]--;
        } while (allNewCoin.length > 0);
        return result;
    };
    // 小于10的策略
    GameModule.prototype.produceStrategyTwo = function (max, space) {
        console.log('策略2:5<=x<10');
        // 场景中最小值
        var min = Math.min(3, this.getMinValue());
        // 总共需要生成的数字数量
        var totalCnt = Math.floor(Math.min(22, space * 0.6));
        if (totalCnt === 0)
            totalCnt = 1;
        // 最大值 7
        var limitMax = Math.min(max - 1, 7);
        // 生成数字的类型数量(既不能超过可生成的总数量，也不能超过当前允许出现的类型上限)
        var typeCnt = totalCnt >= 3 ? 3 : totalCnt;
        typeCnt = Math.min(typeCnt, limitMax - min + 1);
        // 实际生成的种类
        var types = NewUtils_1.default.randomIntArrFromSection(typeCnt, min, limitMax);
        // 生成全部的随机筹码值
        var allNewCoin = NewUtils_1.default.randomIntArrFromArr(totalCnt, types);
        // 确定当前的剩余空间情况
        var spaceInfo = [];
        for (var i = 0; i < 8; i++) {
            var perSlotSpace = this.getSpaceBySlot(i);
            spaceInfo.push(perSlotSpace);
        }
        // 随机将已经生成的数字填充到相应的空位置处(一定是可以放得下的，剩余空间>=生成的数字数量)
        var result = [[], [], [], [], [], [], [], []];
        do {
            var slotIdx = NewUtils_1.default.randomIntInclusive(0, 7);
            if (spaceInfo[slotIdx] === 0)
                continue;
            result[slotIdx].push(allNewCoin.shift());
            spaceInfo[slotIdx]--;
        } while (allNewCoin.length > 0);
        return result;
    };
    // 小于14的策略
    GameModule.prototype.produceStrategyThree = function (max, space) {
        console.log('策略3: 10<x<14');
        // 场景中最小值
        var min = Math.min(8, this.getMinValue());
        // 总共需要生成的数字数量
        var totalCnt = Math.floor(Math.min(20, space * 0.6));
        if (totalCnt === 0)
            totalCnt = 1;
        // 最大值 9~11
        var limitMax = Math.min(max - 1, 11);
        // 生成数字的类型数量(既不能超过可生成的总数量，也不能超过当前允许出现的类型上限)
        var typeCnt = totalCnt >= 3 ? 3 : totalCnt;
        typeCnt = Math.min(typeCnt, limitMax - min + 1);
        // 数字种类
        var types = NewUtils_1.default.randomIntArrFromSection(typeCnt, min, limitMax);
        // 生成全部的随机筹码值
        var allNewCoin = NewUtils_1.default.randomIntArrFromArr(totalCnt, types);
        // 确定当前的剩余空间情况
        var spaceInfo = [];
        for (var i = 0; i < 8; i++) {
            var perSlotSpace = this.getSpaceBySlot(i);
            spaceInfo.push(perSlotSpace);
        }
        // 随机将已经生成的数字填充到相应的空位置处(一定是可以放得下的，剩余空间>=生成的数字数量)
        var result = [[], [], [], [], [], [], [], []];
        do {
            var slotIdx = NewUtils_1.default.randomIntInclusive(0, 7);
            if (spaceInfo[slotIdx] === 0)
                continue;
            result[slotIdx].push(allNewCoin.shift());
            spaceInfo[slotIdx]--;
        } while (allNewCoin.length > 0);
        return result;
    };
    // 小于15的策略
    GameModule.prototype.produceStrategyFour = function (max, space) {
        console.log('策略1:<15');
        // 场景中最小值
        var min = Math.min(11, this.getMinValue());
        // 总共需要生成的数字数量
        var totalCnt = Math.floor(Math.min(25, space * 0.8));
        if (totalCnt === 0)
            totalCnt = 1;
        // 最大值11~13
        var limitMax = Math.min(max - 1, 11);
        // 生成数字的类型数量 min~9
        var typeCnt = totalCnt >= 3 ? 3 : totalCnt;
        // 数字种类
        var types = NewUtils_1.default.randomIntArrFromSection(typeCnt, min, limitMax);
        // 生成全部的随机筹码值
        var allNewCoin = NewUtils_1.default.randomIntArrFromArr(totalCnt, types);
        // 确定当前的剩余空间情况
        var spaceInfo = [];
        for (var i = 0; i < 8; i++) {
            var perSlotSpace = this.getSpaceBySlot(i);
            spaceInfo.push(perSlotSpace);
        }
        // 随机将已经生成的数字填充到相应的空位置处(一定是可以放得下的，剩余空间>=生成的数字数量)
        var result = [[], [], [], [], [], [], [], []];
        do {
            var slotIdx = NewUtils_1.default.randomIntInclusive(0, 7);
            if (spaceInfo[slotIdx] === 0)
                continue;
            result[slotIdx].push(allNewCoin.shift());
            spaceInfo[slotIdx]--;
        } while (allNewCoin.length > 0);
        return result;
    };
    // TODO: 新生成的数据和原有数据进行合成
    GameModule.prototype.mergeProduceData = function (newData) {
        for (var slotIdx = 0; slotIdx < 8; slotIdx++) {
            var newSlotData = NewUtils_1.default.deepClone(newData[slotIdx]);
            for (var j = 0; j < 10; j++) {
                if (this.slotData[slotIdx][j] === 0 && newSlotData.length > 0) {
                    var newCoinData = newSlotData.shift();
                    this.slotData[slotIdx][j] = newCoinData;
                }
            }
        }
    };
    /*
     * TODO: 梳理棋盘数据(服务器逻辑)
     * @description: 保留场景中最大的8个种类数，每种数最多保留10个，其余都扔掉
     */
    GameModule.prototype.tidyData = function () {
        // 1、记录每种类型数字的持有总数
        var dataMap = {};
        for (var i = 0; i < this.slotData.length; i++) {
            for (var j = 0; j < 10; j++) {
                if (this.slotData[i][j] !== 0) {
                    if (dataMap["" + this.slotData[i][j]]) {
                        dataMap["" + this.slotData[i][j]] += 1;
                    }
                    else {
                        dataMap["" + this.slotData[i][j]] = 1;
                    }
                }
            }
        }
        console.log('dataMap:', dataMap);
        // 2、根据每种数字类型，创建一个长度为10的类型，数量不足10补足0
        var allData = [];
        for (var key in dataMap) {
            if (dataMap[key] > 10) {
                dataMap[key] = 10;
            }
            var perTypeData = [];
            for (var i = 0; i < 10; i++) {
                if (i <= dataMap[key] - 1) {
                    perTypeData.push(Number(key));
                }
                else {
                    perTypeData.push(0);
                }
            }
            allData.push(perTypeData);
        }
        // 3、将所有类型的数组从大到小有序排列
        allData.sort(function (a, b) {
            return b[0] - a[0];
        });
        // 最终标准格式化
        if (allData.length > 8) {
            // 类型超过8种 取前八
            this.slotData = allData.slice(0, 7);
        }
        else {
            // 不足8种，补足8种
            for (var i = 0; i < 8; i++) {
                if (allData.length <= i) {
                    allData.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                }
            }
            this.slotData = allData;
        }
        console.log('整理后的slotData:', allData, this.slotData);
    };
    return GameModule;
}(DataModule_1.default));
exports.default = GameModule;
exports.gameModule = new GameModule();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9HYW1lTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FBOEM7QUFDOUMscURBQStEO0FBQy9ELDZDQUF3QztBQUN4QywyQ0FBc0M7QUFFdEM7SUFBd0MsOEJBQVU7SUFzQjlDO1FBQUEsWUFDSSxpQkFBTyxTQUNWO1FBdkJELGlCQUFpQjtRQUNWLGNBQVEsR0FBRyxFQUFFLENBQUM7UUFFckIsY0FBYztRQUNkLHNCQUFnQixHQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzlCLFlBQVk7UUFDWix1QkFBaUIsR0FBYSxFQUFFLENBQUM7UUFFakMsTUFBTTtRQUNOLGNBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsU0FBUztRQUNULGVBQVMsR0FBVyxDQUFDLENBQUM7UUFDdEIsYUFBYTtRQUNiLGlCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBRXhCLFFBQVE7UUFDUixVQUFJLEdBQVcsQ0FBQyxDQUFDO1FBRWpCLGFBQWE7UUFDYixpQkFBVyxHQUFXLENBQUMsQ0FBQzs7SUFJeEIsQ0FBQztJQUVELDhCQUFTLEdBQVQsVUFBVSxJQUFTO1FBQ2YsaUJBQU0sU0FBUyxZQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUdELHNCQUFJLGtDQUFVO1FBRGQscUNBQXFDO2FBQ3JDO1lBQ0ksWUFBWTtZQUNaLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN4QixPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUVELFdBQVc7WUFDWCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxFQUFFO2dCQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN4QixPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUVELElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3hCLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQzs7O09BQUE7SUFFRDs7OztPQUlHO0lBQ0gsOENBQXlCLEdBQXpCLFVBQTBCLE9BQWU7UUFDckMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV4QyxJQUFJLFFBQVEsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLFFBQVEsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLFVBQVUsR0FBVyxFQUFFLENBQUM7UUFFNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6QixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUFFLFNBQVM7WUFFaEMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkIsTUFBTTtTQUNUO1FBRUQsT0FBTyxFQUFFLFFBQVEsVUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7T0FHRztJQUNILHlDQUFvQixHQUFwQjtRQUNJLElBQUksSUFBSSxDQUFDLGdCQUFnQixLQUFLLENBQUMsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQzlDLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7UUFDMUMsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEtBQUEsRUFBRSxHQUFHLEtBQUEsRUFBRSxDQUFDO0lBQ3hELENBQUM7SUFFRCxhQUFhO0lBQ2Isc0NBQWlCLEdBQWpCO1FBQ0ksa0JBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxrQkFBVSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLGlDQUFZLEdBQVosVUFBYSxFQUFxRjtRQUM5RixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO1NBQzlEO1FBRUQsV0FBVztRQUNYLDJCQUFZLENBQUMsUUFBUSxDQUFDLGtCQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTlDLFdBQVc7UUFDWCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUV6QixXQUFXO1FBQ1gsMkJBQVksQ0FBQyxRQUFRLENBQUMsa0JBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsZUFBZTtJQUNmLGtDQUFhLEdBQWI7UUFDSSxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QixJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsSUFBSSxHQUFHO2dCQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDM0I7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLHdDQUFtQixHQUFuQixVQUFvQixNQUFjO1FBQzlCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6QixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQUUsU0FBUztZQUN0QixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLEtBQUssQ0FBQzthQUNoQjtTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFdBQVc7SUFDWCxnQ0FBVyxHQUFYO1FBQ0ksSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUU7b0JBQ2hDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNsQzthQUVKO1NBRUo7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRUQsV0FBVztJQUNYLGdDQUFXLEdBQVg7UUFDSSxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5QyxJQUFJLFFBQVEsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2xDO2dCQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQzdELFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNsQzthQUVKO1NBRUo7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRUQsbUNBQWMsR0FBZCxVQUFlLEVBQVU7UUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQUUsT0FBTztRQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDL0MsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDNUIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2pCO1NBQ0o7UUFFRCxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCxXQUFXO0lBQ1gsNkJBQVEsR0FBUjtRQUNJLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEIsS0FBSyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsd0JBQXdCO0lBQ3hCLHVDQUFrQixHQUFsQjtRQUNJLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFOUIsSUFBSSxRQUFRLElBQUksRUFBRSxFQUFFO1lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsT0FBTztTQUNWO1FBRUQsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1lBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1lBQzlCLE9BQU87U0FDVjtRQUVELElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtZQUNkLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNuRDthQUFNLElBQUksUUFBUSxHQUFHLEVBQUUsRUFBRTtZQUN0QixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDbkQ7YUFBTSxJQUFJLFFBQVEsR0FBRyxFQUFFLEVBQUU7WUFDdEIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3JEO2FBQU0sSUFBSSxRQUFRLEdBQUcsRUFBRSxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNwRDtJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSCx1Q0FBa0IsR0FBbEIsVUFBbUIsR0FBVyxFQUFFLEtBQWE7UUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixTQUFTO1FBQ1QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFMUMsY0FBYztRQUNkLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBSSxRQUFRLEtBQUssQ0FBQztZQUFFLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFFakMsMkJBQTJCO1FBQzNCLElBQU0sUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFM0Msb0JBQW9CO1FBQ3BCLElBQUksT0FBTyxHQUFHLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQzNDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRWhELE9BQU87UUFDUCxJQUFNLEtBQUssR0FBRyxrQkFBUSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFdkUsYUFBYTtRQUNiLElBQUksVUFBVSxHQUFHLGtCQUFRLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRS9ELGNBQWM7UUFDZCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDaEM7UUFFRCxnREFBZ0Q7UUFDaEQsSUFBTSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDaEQsR0FBRztZQUNDLElBQU0sT0FBTyxHQUFHLGtCQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQUUsU0FBUztZQUV2QyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1NBQ3hCLFFBQVEsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7UUFFL0IsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELFVBQVU7SUFDVix1Q0FBa0IsR0FBbEIsVUFBbUIsR0FBVyxFQUFFLEtBQWE7UUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUUzQixTQUFTO1FBQ1QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFMUMsY0FBYztRQUNkLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBSSxRQUFRLEtBQUssQ0FBQztZQUFFLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFFakMsUUFBUTtRQUNSLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV0QywyQ0FBMkM7UUFDM0MsSUFBSSxPQUFPLEdBQUcsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDM0MsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFaEQsVUFBVTtRQUNWLElBQU0sS0FBSyxHQUFHLGtCQUFRLENBQUMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV2RSxhQUFhO1FBQ2IsSUFBSSxVQUFVLEdBQUcsa0JBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFL0QsY0FBYztRQUNkLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNoQztRQUVELGdEQUFnRDtRQUNoRCxJQUFNLE1BQU0sR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNoRCxHQUFHO1lBQ0MsSUFBTSxPQUFPLEdBQUcsa0JBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFBRSxTQUFTO1lBRXZDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDekMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDeEIsUUFBUSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztRQUUvQixPQUFPLE1BQU0sQ0FBQztJQUVsQixDQUFDO0lBRUQsVUFBVTtJQUNWLHlDQUFvQixHQUFwQixVQUFxQixHQUFXLEVBQUUsS0FBYTtRQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRTVCLFNBQVM7UUFDVCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUUxQyxjQUFjO1FBQ2QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFJLFFBQVEsS0FBSyxDQUFDO1lBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUVqQyxXQUFXO1FBQ1gsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXZDLDJDQUEyQztRQUMzQyxJQUFJLE9BQU8sR0FBRyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUMzQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVoRCxPQUFPO1FBQ1AsSUFBTSxLQUFLLEdBQUcsa0JBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXZFLGFBQWE7UUFDYixJQUFJLFVBQVUsR0FBRyxrQkFBUSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUvRCxjQUFjO1FBQ2QsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEIsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsZ0RBQWdEO1FBQ2hELElBQU0sTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELEdBQUc7WUFDQyxJQUFNLE9BQU8sR0FBRyxrQkFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUFFLFNBQVM7WUFFdkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN6QyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztTQUN4QixRQUFRLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO1FBRS9CLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxVQUFVO0lBQ1Ysd0NBQW1CLEdBQW5CLFVBQW9CLEdBQVcsRUFBRSxLQUFhO1FBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFdkIsU0FBUztRQUNULElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBRTNDLGNBQWM7UUFDZCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksUUFBUSxLQUFLLENBQUM7WUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRWpDLFdBQVc7UUFDWCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFdkMsa0JBQWtCO1FBQ2xCLElBQUksT0FBTyxHQUFHLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBRTNDLE9BQU87UUFDUCxJQUFNLEtBQUssR0FBRyxrQkFBUSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFdkUsYUFBYTtRQUNiLElBQUksVUFBVSxHQUFHLGtCQUFRLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRS9ELGNBQWM7UUFDZCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDaEM7UUFFRCxnREFBZ0Q7UUFDaEQsSUFBTSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDaEQsR0FBRztZQUNDLElBQU0sT0FBTyxHQUFHLGtCQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQUUsU0FBUztZQUV2QyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1NBQ3hCLFFBQVEsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7UUFFL0IsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELHdCQUF3QjtJQUN4QixxQ0FBZ0IsR0FBaEIsVUFBaUIsT0FBbUI7UUFDaEMsS0FBSyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUMxQyxJQUFNLFdBQVcsR0FBRyxrQkFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN6RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN6QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUMzRCxJQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO2lCQUMzQzthQUNKO1NBQ0o7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsNkJBQVEsR0FBUjtRQUNJLGtCQUFrQjtRQUNsQixJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzNDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQzNCLElBQUksT0FBTyxDQUFDLEtBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUcsQ0FBQyxFQUFFO3dCQUNuQyxPQUFPLENBQUMsS0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUMxQzt5QkFBTTt3QkFDSCxPQUFPLENBQUMsS0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUN6QztpQkFDSjthQUNKO1NBQ0o7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVqQyxvQ0FBb0M7UUFDcEMsSUFBTSxPQUFPLEdBQWUsRUFBRSxDQUFDO1FBQy9CLEtBQUssSUFBTSxHQUFHLElBQUksT0FBTyxFQUFFO1lBQ3ZCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNyQjtZQUVELElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUN2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN6QixJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUN2QixXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUNqQztxQkFBTTtvQkFDSCxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN2QjthQUNKO1lBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUM3QjtRQUVELHFCQUFxQjtRQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxVQUFVO1FBQ1YsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNwQixhQUFhO1lBQ2IsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN2QzthQUFNO1lBQ0gsWUFBWTtZQUNaLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hCLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNoRDthQUNKO1lBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7U0FDM0I7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFDTCxpQkFBQztBQUFELENBMWRBLEFBMGRDLENBMWR1QyxvQkFBVSxHQTBkakQ7O0FBQ1ksUUFBQSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gJy4uL21hbmFnZXIvRGVmaW5lJztcbmltcG9ydCB7IGV2ZW50TWFuYWdlciwgR2FtZUV2ZW50IH0gZnJvbSAnLi4vdXRpbC9FdmVudE1hbmFnZXInO1xuaW1wb3J0IE5ld1V0aWxzIGZyb20gJy4uL3V0aWwvTmV3VXRpbHMnO1xuaW1wb3J0IERhdGFNb2R1bGUgZnJvbSAnLi9EYXRhTW9kdWxlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZU1vZHVsZSBleHRlbmRzIERhdGFNb2R1bGUge1xuICAgIC8vIOeUqOaIt+eahOetueeggeanveS9jeaVsOaNriAxfjEwXG4gICAgcHVibGljIHNsb3REYXRhID0gW107XG5cbiAgICAvLyDlvZPliY3mraPlnKjpgInkuK3nmoTnrbnnoIHmp73kvY1cbiAgICBjdXJTZWxlY3RTbG90SWR4OiBudW1iZXIgPSAtMTtcbiAgICAvLyDlvZPliY3pgInkuK3nmoTnrbnnoIHkv6Hmga9cbiAgICBjdXJTZWxlY3RDb2luSWR4czogbnVtYmVyW10gPSBbXTtcblxuICAgIC8vIOenu+WKqOmUgVxuICAgIG1vdmVMb2NrOiBib29sZWFuID0gZmFsc2U7XG4gICAgLy8g5ZCI5oiQ5byV55So6K6h5pWwXG4gICAgbWVyZ2VMb2NrOiBudW1iZXIgPSAwO1xuICAgIC8vIOeUn+aIkOetueeggeaViOaenOW8leeUqOiuoeaVsFxuICAgIHByb2R1Y2VMb2NrOiBudW1iZXIgPSAwO1xuXG4gICAgLy8g5b2T5YmN5pif5pif5pWwXG4gICAgc3RhcjogbnVtYmVyID0gMDtcblxuICAgIC8vIOavj+WbnuWQiOmineWkluiOt+W+l+eahOasoeaVsFxuICAgIGV4dHJhQ2hhbmNlOiBudW1iZXIgPSAwO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcGFyc2VEYXRhKGRhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBzdXBlci5wYXJzZURhdGEoZGF0YSk7XG4gICAgICAgIHRoaXMuc2xvdERhdGEgPSBkYXRhLnNsb3REYXRhO1xuICAgICAgICB0aGlzLnN0YXIgPSBkYXRhLnN0YXI7XG4gICAgfVxuXG4gICAgLy8g5Lqk5LqS5pON5L2c55qE5qOA5rWL77yM5b2T5YmN5aaC5p6c5pyJ5q2j5Zyo5Y+R55Sf55qE5Lqk5LqS6KGM5Li677yM5YiZ5LiN5YWB6K646Kem5Y+R5pu05aSa55qE6KGM5Li6XG4gICAgZ2V0IGNhbk9wZXJhdGUoKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOato+WcqOacieenu+WKqOihjOS4uuWPkeeUn1xuICAgICAgICBpZiAodGhpcy5tb3ZlTG9jaykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+ato+WcqOi/m+ihjOenu+WKqOaTjeS9nCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5q2j5Zyo6L+b6KGM5ZCI5oiQ5pON5L2cXG4gICAgICAgIGlmICh0aGlzLm1lcmdlTG9jayAhPT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+ato+WcqOi/m+ihjOWQiOaIkOaTjeS9nCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvZHVjZUxvY2sgIT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmraPlnKjlj5HmlL7nrbnnoIHmk43kvZwnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiDpgJrov4fmp71pZCDojrflj5bnrKzkuIDkuKrmnInmlYjnmoTnrbnnoIHkv6Hmga9cbiAgICAgKiBAcGFyYW0gc2xvdElkeDog6ZyA6KaB6I635Y+W56ys5LiA5Liq5pyJ5pWI55qE562556CB5L+h5oGv55qE5qe9aWRcbiAgICAgKiBAcmV0dXJuIHZhaWxkTnVtOiDor6Xmp73kvY3nmoTmnInmlYjmlbDlrZfjgIF2YWlsZElkeDog5pyJ5pWI5pWw5a2X55qE57Si5byV44CBdmFpbGRTUGFjZTog5Ymp5L2Z5Y+v5a6557qz55qE562556CB56m66Ze0XG4gICAgICovXG4gICAgZ2V0Rmlyc3RWYWlsZE51bUJ5U2xvdElkeChzbG90SWR4OiBudW1iZXIpOiB7IHZhaWxkTnVtOiBudW1iZXIsIHZhaWxkSWR4OiBudW1iZXIsIHZhaWxkU3BhY2U6IG51bWJlciB9IHtcbiAgICAgICAgY29uc3Qgc2xvdERhdGEgPSB0aGlzLnNsb3REYXRhW3Nsb3RJZHhdO1xuXG4gICAgICAgIGxldCB2YWlsZE51bTogbnVtYmVyID0gLTE7XG4gICAgICAgIGxldCB2YWlsZElkeDogbnVtYmVyID0gLTE7XG4gICAgICAgIGxldCB2YWlsZFNwYWNlOiBudW1iZXIgPSAxMDtcblxuICAgICAgICBmb3IgKGxldCBpID0gOTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGlmIChzbG90RGF0YVtpXSA9PT0gMCkgY29udGludWU7XG5cbiAgICAgICAgICAgIHZhaWxkTnVtID0gc2xvdERhdGFbaV07XG4gICAgICAgICAgICB2YWlsZElkeCA9IGk7XG4gICAgICAgICAgICB2YWlsZFNwYWNlID0gOSAtIGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHZhaWxkTnVtLCB2YWlsZElkeCwgdmFpbGRTcGFjZSB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiDojrflj5blvZPliY3pgInkuK3nmoTlvoXnp7vliqjnmoTmp73kvY3nrbnnoIHkv6Hmga9cbiAgICAgKiBAcmV0dXJucyBzbG90SWR4OiDlvZPliY3pgInkuK3nmoTmp73kvY3ntKLlvJXjgIEgIGNudDog5b6F56e75Yqo55qE562556CB5pWw6YeP44CBICBudW06IOW+heenu+WKqOeahOaVsOWtl+exu+Wei1xuICAgICAqL1xuICAgIGdldEN1clNlbGVjdFNsb3RJbmZvKCk6IHsgc2xvdElkeDogbnVtYmVyLCBjbnQ6IG51bWJlciwgbnVtOiBudW1iZXIgfSB7XG4gICAgICAgIGlmICh0aGlzLmN1clNlbGVjdFNsb3RJZHggPT09IC0xKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgY250ID0gdGhpcy5jdXJTZWxlY3RDb2luSWR4cy5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG51bSA9IHRoaXMuc2xvdERhdGFbdGhpcy5jdXJTZWxlY3RTbG90SWR4XVt0aGlzLmN1clNlbGVjdENvaW5JZHhzWzBdXTtcbiAgICAgICAgcmV0dXJuIHsgc2xvdElkeDogdGhpcy5jdXJTZWxlY3RTbG90SWR4LCBjbnQsIG51bSB9O1xuICAgIH1cblxuICAgIC8vIOmHjee9ruW9k+WJjeetueeggemAieaLqeeKtuaAgVxuICAgIHJlc2V0U2VsZWN0U3RhdHVzKCk6IHZvaWQge1xuICAgICAgICBnYW1lTW9kdWxlLmN1clNlbGVjdFNsb3RJZHggPSAtMTtcbiAgICAgICAgZ2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4cyA9IFtdO1xuICAgIH1cblxuICAgIC8vIOetueeggeenu+WKqOWujOaIkO+8jOaVtOeQhuenu+WKqOWQjueahOaVsOaNrlxuICAgIHRpZHlTbG90RGF0YShlZDogeyB0YXJTbG90SWR4OiBudW1iZXIsIG51bVR5cGU6IG51bWJlciwgc3JjSWR4QXJyOiBudW1iZXJbXSwgdGFySWR4QXJyOiBudW1iZXJbXSB9KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWQuc3JjSWR4QXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnNsb3REYXRhW3RoaXMuY3VyU2VsZWN0U2xvdElkeF1bZWQuc3JjSWR4QXJyW2ldXSA9IDA7XG4gICAgICAgICAgICB0aGlzLnNsb3REYXRhW2VkLnRhclNsb3RJZHhdW2VkLnRhcklkeEFycltpXV0gPSBlZC5udW1UeXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5Yi35paw562556CB5pi+56S65oOF5Ya1XG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuTU9WRV9FTkQsIGVkKTtcblxuICAgICAgICAvLyDph43nva7lvZPliY3pgInkuK3nirbmgIFcbiAgICAgICAgdGhpcy5yZXNldFNlbGVjdFN0YXR1cygpO1xuXG4gICAgICAgIC8vIOajgOa1i+aYr+WQpuWPr+S7peWQiOaIkFxuICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLkNIRUNLX01FUkdFKTtcbiAgICB9XG5cbiAgICAvLyDmo4DmtYvmmK/lkKbmnInlj6/ku6XlkIjmiJDnmoTmp73kvY1cbiAgICBjaGVja0Nhbk1lcmdlKCk6IG51bWJlcltdIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjYW4gPSB0aGlzLmNoZWNrQ2FuTWVyZ2VCeVNsb3QoaSk7XG4gICAgICAgICAgICBpZiAoY2FuKSByZXN1bHQucHVzaChpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g6YCa6L+H5qe95L2N5p2l5qOA5rWL5piv5ZCm5Y+v5Lul6L+b6KGM5ZCI5oiQXG4gICAgY2hlY2tDYW5NZXJnZUJ5U2xvdChzbG90SWQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBzbG90RGF0YSA9IHRoaXMuc2xvdERhdGFbc2xvdElkXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoc2xvdERhdGFbaV0gPT09IDApIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChpID09PSAwKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmIChzbG90RGF0YVtpXSAhPT0gc2xvdERhdGFbaSAtIDFdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8g6I635Y+W5b2T5YmN5pyA5aSn5pWw5a2XXG4gICAgZ2V0TWF4VmFsdWUoKTogbnVtYmVyIHtcbiAgICAgICAgbGV0IG1heFZhbHVlID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNsb3REYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuc2xvdERhdGFbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zbG90RGF0YVtpXVtqXSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlID0gdGhpcy5zbG90RGF0YVtpXVtqXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXhWYWx1ZTtcbiAgICB9XG5cbiAgICAvLyDojrflj5blvZPliY3mnIDlsI/mlbDlrZdcbiAgICBnZXRNaW5WYWx1ZSgpOiBudW1iZXIge1xuICAgICAgICBsZXQgbWluVmFsdWUgPSAtMTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNsb3REYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuc2xvdERhdGFbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAobWluVmFsdWUgPT09IC0xICYmIHRoaXMuc2xvdERhdGFbaV1bal0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWluVmFsdWUgPSB0aGlzLnNsb3REYXRhW2ldW2pdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zbG90RGF0YVtpXVtqXSA8IG1pblZhbHVlICYmIHRoaXMuc2xvdERhdGFbaV1bal0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWluVmFsdWUgPSB0aGlzLnNsb3REYXRhW2ldW2pdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pblZhbHVlO1xuICAgIH1cblxuICAgIGdldFNwYWNlQnlTbG90KGlkOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBpZiAoIXRoaXMuc2xvdERhdGFbaWRdKSByZXR1cm47XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zbG90RGF0YVtpZF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNsb3REYXRhW2lkXVtpXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxMCAtIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvLyDojrflj5blvZPliY3liankvZnnqbrpl7RcbiAgICBnZXRTcGFjZSgpOiBudW1iZXIge1xuICAgICAgICBsZXQgc3BhY2UgPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgc3BhY2UgKz0gdGhpcy5nZXRTcGFjZUJ5U2xvdChpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3BhY2U7XG4gICAgfVxuXG4gICAgLy9UT0RPOiDnlJ/miJDmlrDnmoTnrbnnoIHmlbDmja4g77yI5pyN5Yqh5Zmo6YC76L6R77yJXG4gICAgcHJvZHVjZU5ld0NvaW5EYXRhKCk6IG51bWJlcltdW10ge1xuICAgICAgICBjb25zdCBtYXhWYWx1ZSA9IHRoaXMuZ2V0TWF4VmFsdWUoKTtcbiAgICAgICAgY29uc3Qgc3BhY2UgPSB0aGlzLmdldFNwYWNlKCk7XG5cbiAgICAgICAgaWYgKG1heFZhbHVlID49IDE1KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ+W9k+WJjeW3suWQiOaIkDE1Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3BhY2UgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybign5rKh5pyJ5Ymp5L2Z56m66Ze077yM5peg5rOV55Sf5oiQ5paw5pWw5a2XJylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXhWYWx1ZSA8IDUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2R1Y2VTdHJhdGVneU9uZShtYXhWYWx1ZSwgc3BhY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKG1heFZhbHVlIDwgMTApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2R1Y2VTdHJhdGVneVR3byhtYXhWYWx1ZSwgc3BhY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKG1heFZhbHVlIDwgMTQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2R1Y2VTdHJhdGVneVRocmVlKG1heFZhbHVlLCBzcGFjZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobWF4VmFsdWUgPCAxNSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvZHVjZVN0cmF0ZWd5Rm91cihtYXhWYWx1ZSwgc3BhY2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIOWwj+S6jjUg562W55WlXG4gICAgICogMeOAgeeUn+aIkOaVsOmHjyBtaW4oc3BhY2UqMzAsOCk7XG4gICAgICogMuOAgeeUn+aIkOexu+WeiyA8PSAzXG4gICAgICogM+OAgeacgOWwj+aVsCA9IOW9k+WJjeWcuuaZr+acgOWwj+aVsC0xXG4gICAgICogXG4gICAgICogQHBhcmFtIG1heDog5b2T5YmN5Zy65pmv5Lit5pyA5aSn55qE562556CB5pWw5YC8XG4gICAgICogQHBhcmFtIHNwYWNlOiDlvZPliY3mgLvnmoTnqbrpl7TmlbBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcm9kdWNlU3RyYXRlZ3lPbmUobWF4OiBudW1iZXIsIHNwYWNlOiBudW1iZXIpOiBudW1iZXJbXVtdIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+etlueVpTE6PDUnKTtcbiAgICAgICAgLy8g5Zy65pmv5Lit5pyA5bCP5YC8XG4gICAgICAgIGxldCBtaW4gPSBNYXRoLm1pbigxLCB0aGlzLmdldE1pblZhbHVlKCkpO1xuXG4gICAgICAgIC8vIOaAu+WFsemcgOimgeeUn+aIkOeahOaVsOWtl+aVsOmHj1xuICAgICAgICBsZXQgdG90YWxDbnQgPSBNYXRoLmZsb29yKE1hdGgubWluKDI1LCBzcGFjZSAqIDAuNikpO1xuICAgICAgICBpZiAodG90YWxDbnQgPT09IDApIHRvdGFsQ250ID0gMTtcblxuICAgICAgICAvLyDmlrDnlJ/miJDnmoTmlbDlrZfnsbvlnovpmZDlrprlnKjmr5TlvZPliY3lnLrmma/kuK3mnIDlpKfnmoTmlbDlrZflsI8xXG4gICAgICAgIGNvbnN0IGxpbWl0TWF4ID0gbWF4IC0gMSA+IDAgPyBtYXggLSAxIDogMTtcblxuICAgICAgICAvLyDnlJ/miJDmlbDlrZfnmoTnsbvlnovmlbDph48gMeOAgTLjgIEz44CBNFxuICAgICAgICBsZXQgdHlwZUNudCA9IHRvdGFsQ250ID49IDQgPyA0IDogdG90YWxDbnQ7XG4gICAgICAgIHR5cGVDbnQgPSBNYXRoLm1pbih0eXBlQ250LCBsaW1pdE1heCAtIG1pbiArIDEpO1xuXG4gICAgICAgIC8vIOaVsOWtl+enjeexu1xuICAgICAgICBjb25zdCB0eXBlcyA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21TZWN0aW9uKHR5cGVDbnQsIG1pbiwgbGltaXRNYXgpO1xuXG4gICAgICAgIC8vIOeUn+aIkOWFqOmDqOeahOmaj+acuuetueeggeWAvFxuICAgICAgICBsZXQgYWxsTmV3Q29pbiA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21BcnIodG90YWxDbnQsIHR5cGVzKTtcblxuICAgICAgICAvLyDnoa7lrprlvZPliY3nmoTliankvZnnqbrpl7Tmg4XlhrVcbiAgICAgICAgbGV0IHNwYWNlSW5mbyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGVyU2xvdFNwYWNlID0gdGhpcy5nZXRTcGFjZUJ5U2xvdChpKTtcbiAgICAgICAgICAgIHNwYWNlSW5mby5wdXNoKHBlclNsb3RTcGFjZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpmo/mnLrlsIblt7Lnu4/nlJ/miJDnmoTmlbDlrZfloavlhYXliLDnm7jlupTnmoTnqbrkvY3nva7lpIQo5LiA5a6a5piv5Y+v5Lul5pS+5b6X5LiL55qE77yM5Ymp5L2Z56m66Ze0Pj3nlJ/miJDnmoTmlbDlrZfmlbDph48pXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtbXSwgW10sIFtdLCBbXSwgW10sIFtdLCBbXSwgW11dO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBzbG90SWR4ID0gTmV3VXRpbHMucmFuZG9tSW50SW5jbHVzaXZlKDAsIDcpO1xuICAgICAgICAgICAgaWYgKHNwYWNlSW5mb1tzbG90SWR4XSA9PT0gMCkgY29udGludWU7XG5cbiAgICAgICAgICAgIHJlc3VsdFtzbG90SWR4XS5wdXNoKGFsbE5ld0NvaW4uc2hpZnQoKSk7XG4gICAgICAgICAgICBzcGFjZUluZm9bc2xvdElkeF0tLTtcbiAgICAgICAgfSB3aGlsZSAoYWxsTmV3Q29pbi5sZW5ndGggPiAwKVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g5bCP5LqOMTDnmoTnrZbnlaVcbiAgICBwcm9kdWNlU3RyYXRlZ3lUd28obWF4OiBudW1iZXIsIHNwYWNlOiBudW1iZXIpOiBudW1iZXJbXVtdIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+etlueVpTI6NTw9eDwxMCcpO1xuXG4gICAgICAgIC8vIOWcuuaZr+S4reacgOWwj+WAvFxuICAgICAgICBsZXQgbWluID0gTWF0aC5taW4oMywgdGhpcy5nZXRNaW5WYWx1ZSgpKTtcblxuICAgICAgICAvLyDmgLvlhbHpnIDopoHnlJ/miJDnmoTmlbDlrZfmlbDph49cbiAgICAgICAgbGV0IHRvdGFsQ250ID0gTWF0aC5mbG9vcihNYXRoLm1pbigyMiwgc3BhY2UgKiAwLjYpKTtcbiAgICAgICAgaWYgKHRvdGFsQ250ID09PSAwKSB0b3RhbENudCA9IDE7XG5cbiAgICAgICAgLy8g5pyA5aSn5YC8IDdcbiAgICAgICAgY29uc3QgbGltaXRNYXggPSBNYXRoLm1pbihtYXggLSAxLCA3KTtcblxuICAgICAgICAvLyDnlJ/miJDmlbDlrZfnmoTnsbvlnovmlbDph48o5pei5LiN6IO96LaF6L+H5Y+v55Sf5oiQ55qE5oC75pWw6YeP77yM5Lmf5LiN6IO96LaF6L+H5b2T5YmN5YWB6K645Ye6546w55qE57G75Z6L5LiK6ZmQKVxuICAgICAgICBsZXQgdHlwZUNudCA9IHRvdGFsQ250ID49IDMgPyAzIDogdG90YWxDbnQ7XG4gICAgICAgIHR5cGVDbnQgPSBNYXRoLm1pbih0eXBlQ250LCBsaW1pdE1heCAtIG1pbiArIDEpO1xuXG4gICAgICAgIC8vIOWunumZheeUn+aIkOeahOenjeexu1xuICAgICAgICBjb25zdCB0eXBlcyA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21TZWN0aW9uKHR5cGVDbnQsIG1pbiwgbGltaXRNYXgpO1xuXG4gICAgICAgIC8vIOeUn+aIkOWFqOmDqOeahOmaj+acuuetueeggeWAvFxuICAgICAgICBsZXQgYWxsTmV3Q29pbiA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21BcnIodG90YWxDbnQsIHR5cGVzKTtcblxuICAgICAgICAvLyDnoa7lrprlvZPliY3nmoTliankvZnnqbrpl7Tmg4XlhrVcbiAgICAgICAgbGV0IHNwYWNlSW5mbyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGVyU2xvdFNwYWNlID0gdGhpcy5nZXRTcGFjZUJ5U2xvdChpKTtcbiAgICAgICAgICAgIHNwYWNlSW5mby5wdXNoKHBlclNsb3RTcGFjZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpmo/mnLrlsIblt7Lnu4/nlJ/miJDnmoTmlbDlrZfloavlhYXliLDnm7jlupTnmoTnqbrkvY3nva7lpIQo5LiA5a6a5piv5Y+v5Lul5pS+5b6X5LiL55qE77yM5Ymp5L2Z56m66Ze0Pj3nlJ/miJDnmoTmlbDlrZfmlbDph48pXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtbXSwgW10sIFtdLCBbXSwgW10sIFtdLCBbXSwgW11dO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBzbG90SWR4ID0gTmV3VXRpbHMucmFuZG9tSW50SW5jbHVzaXZlKDAsIDcpO1xuICAgICAgICAgICAgaWYgKHNwYWNlSW5mb1tzbG90SWR4XSA9PT0gMCkgY29udGludWU7XG5cbiAgICAgICAgICAgIHJlc3VsdFtzbG90SWR4XS5wdXNoKGFsbE5ld0NvaW4uc2hpZnQoKSk7XG4gICAgICAgICAgICBzcGFjZUluZm9bc2xvdElkeF0tLTtcbiAgICAgICAgfSB3aGlsZSAoYWxsTmV3Q29pbi5sZW5ndGggPiAwKVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICB9XG5cbiAgICAvLyDlsI/kuo4xNOeahOetlueVpVxuICAgIHByb2R1Y2VTdHJhdGVneVRocmVlKG1heDogbnVtYmVyLCBzcGFjZTogbnVtYmVyKTogbnVtYmVyW11bXSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfnrZbnlaUzOiAxMDx4PDE0Jyk7XG5cbiAgICAgICAgLy8g5Zy65pmv5Lit5pyA5bCP5YC8XG4gICAgICAgIGxldCBtaW4gPSBNYXRoLm1pbig4LCB0aGlzLmdldE1pblZhbHVlKCkpO1xuXG4gICAgICAgIC8vIOaAu+WFsemcgOimgeeUn+aIkOeahOaVsOWtl+aVsOmHj1xuICAgICAgICBsZXQgdG90YWxDbnQgPSBNYXRoLmZsb29yKE1hdGgubWluKDIwLCBzcGFjZSAqIDAuNikpO1xuICAgICAgICBpZiAodG90YWxDbnQgPT09IDApIHRvdGFsQ250ID0gMTtcblxuICAgICAgICAvLyDmnIDlpKflgLwgOX4xMVxuICAgICAgICBjb25zdCBsaW1pdE1heCA9IE1hdGgubWluKG1heCAtIDEsIDExKTtcblxuICAgICAgICAvLyDnlJ/miJDmlbDlrZfnmoTnsbvlnovmlbDph48o5pei5LiN6IO96LaF6L+H5Y+v55Sf5oiQ55qE5oC75pWw6YeP77yM5Lmf5LiN6IO96LaF6L+H5b2T5YmN5YWB6K645Ye6546w55qE57G75Z6L5LiK6ZmQKVxuICAgICAgICBsZXQgdHlwZUNudCA9IHRvdGFsQ250ID49IDMgPyAzIDogdG90YWxDbnQ7XG4gICAgICAgIHR5cGVDbnQgPSBNYXRoLm1pbih0eXBlQ250LCBsaW1pdE1heCAtIG1pbiArIDEpO1xuXG4gICAgICAgIC8vIOaVsOWtl+enjeexu1xuICAgICAgICBjb25zdCB0eXBlcyA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21TZWN0aW9uKHR5cGVDbnQsIG1pbiwgbGltaXRNYXgpO1xuXG4gICAgICAgIC8vIOeUn+aIkOWFqOmDqOeahOmaj+acuuetueeggeWAvFxuICAgICAgICBsZXQgYWxsTmV3Q29pbiA9IE5ld1V0aWxzLnJhbmRvbUludEFyckZyb21BcnIodG90YWxDbnQsIHR5cGVzKTtcblxuICAgICAgICAvLyDnoa7lrprlvZPliY3nmoTliankvZnnqbrpl7Tmg4XlhrVcbiAgICAgICAgbGV0IHNwYWNlSW5mbyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGVyU2xvdFNwYWNlID0gdGhpcy5nZXRTcGFjZUJ5U2xvdChpKTtcbiAgICAgICAgICAgIHNwYWNlSW5mby5wdXNoKHBlclNsb3RTcGFjZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpmo/mnLrlsIblt7Lnu4/nlJ/miJDnmoTmlbDlrZfloavlhYXliLDnm7jlupTnmoTnqbrkvY3nva7lpIQo5LiA5a6a5piv5Y+v5Lul5pS+5b6X5LiL55qE77yM5Ymp5L2Z56m66Ze0Pj3nlJ/miJDnmoTmlbDlrZfmlbDph48pXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtbXSwgW10sIFtdLCBbXSwgW10sIFtdLCBbXSwgW11dO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBzbG90SWR4ID0gTmV3VXRpbHMucmFuZG9tSW50SW5jbHVzaXZlKDAsIDcpO1xuICAgICAgICAgICAgaWYgKHNwYWNlSW5mb1tzbG90SWR4XSA9PT0gMCkgY29udGludWU7XG5cbiAgICAgICAgICAgIHJlc3VsdFtzbG90SWR4XS5wdXNoKGFsbE5ld0NvaW4uc2hpZnQoKSk7XG4gICAgICAgICAgICBzcGFjZUluZm9bc2xvdElkeF0tLTtcbiAgICAgICAgfSB3aGlsZSAoYWxsTmV3Q29pbi5sZW5ndGggPiAwKVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g5bCP5LqOMTXnmoTnrZbnlaVcbiAgICBwcm9kdWNlU3RyYXRlZ3lGb3VyKG1heDogbnVtYmVyLCBzcGFjZTogbnVtYmVyKTogbnVtYmVyW11bXSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfnrZbnlaUxOjwxNScpO1xuXG4gICAgICAgIC8vIOWcuuaZr+S4reacgOWwj+WAvFxuICAgICAgICBsZXQgbWluID0gTWF0aC5taW4oMTEsIHRoaXMuZ2V0TWluVmFsdWUoKSk7XG5cbiAgICAgICAgLy8g5oC75YWx6ZyA6KaB55Sf5oiQ55qE5pWw5a2X5pWw6YePXG4gICAgICAgIGxldCB0b3RhbENudCA9IE1hdGguZmxvb3IoTWF0aC5taW4oMjUsIHNwYWNlICogMC44KSk7XG4gICAgICAgIGlmICh0b3RhbENudCA9PT0gMCkgdG90YWxDbnQgPSAxO1xuXG4gICAgICAgIC8vIOacgOWkp+WAvDExfjEzXG4gICAgICAgIGNvbnN0IGxpbWl0TWF4ID0gTWF0aC5taW4obWF4IC0gMSwgMTEpO1xuXG4gICAgICAgIC8vIOeUn+aIkOaVsOWtl+eahOexu+Wei+aVsOmHjyBtaW5+OVxuICAgICAgICBsZXQgdHlwZUNudCA9IHRvdGFsQ250ID49IDMgPyAzIDogdG90YWxDbnQ7XG5cbiAgICAgICAgLy8g5pWw5a2X56eN57G7XG4gICAgICAgIGNvbnN0IHR5cGVzID0gTmV3VXRpbHMucmFuZG9tSW50QXJyRnJvbVNlY3Rpb24odHlwZUNudCwgbWluLCBsaW1pdE1heCk7XG5cbiAgICAgICAgLy8g55Sf5oiQ5YWo6YOo55qE6ZqP5py6562556CB5YC8XG4gICAgICAgIGxldCBhbGxOZXdDb2luID0gTmV3VXRpbHMucmFuZG9tSW50QXJyRnJvbUFycih0b3RhbENudCwgdHlwZXMpO1xuXG4gICAgICAgIC8vIOehruWumuW9k+WJjeeahOWJqeS9meepuumXtOaDheWGtVxuICAgICAgICBsZXQgc3BhY2VJbmZvID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwZXJTbG90U3BhY2UgPSB0aGlzLmdldFNwYWNlQnlTbG90KGkpO1xuICAgICAgICAgICAgc3BhY2VJbmZvLnB1c2gocGVyU2xvdFNwYWNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmaj+acuuWwhuW3sue7j+eUn+aIkOeahOaVsOWtl+Whq+WFheWIsOebuOW6lOeahOepuuS9jee9ruWkhCjkuIDlrprmmK/lj6/ku6XmlL7lvpfkuIvnmoTvvIzliankvZnnqbrpl7Q+PeeUn+aIkOeahOaVsOWtl+aVsOmHjylcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW1tdLCBbXSwgW10sIFtdLCBbXSwgW10sIFtdLCBbXV07XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNvbnN0IHNsb3RJZHggPSBOZXdVdGlscy5yYW5kb21JbnRJbmNsdXNpdmUoMCwgNyk7XG4gICAgICAgICAgICBpZiAoc3BhY2VJbmZvW3Nsb3RJZHhdID09PSAwKSBjb250aW51ZTtcblxuICAgICAgICAgICAgcmVzdWx0W3Nsb3RJZHhdLnB1c2goYWxsTmV3Q29pbi5zaGlmdCgpKTtcbiAgICAgICAgICAgIHNwYWNlSW5mb1tzbG90SWR4XS0tO1xuICAgICAgICB9IHdoaWxlIChhbGxOZXdDb2luLmxlbmd0aCA+IDApXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiDmlrDnlJ/miJDnmoTmlbDmja7lkozljp/mnInmlbDmja7ov5vooYzlkIjmiJBcbiAgICBtZXJnZVByb2R1Y2VEYXRhKG5ld0RhdGE6IG51bWJlcltdW10pOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgc2xvdElkeCA9IDA7IHNsb3RJZHggPCA4OyBzbG90SWR4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Nsb3REYXRhID0gTmV3VXRpbHMuZGVlcENsb25lKG5ld0RhdGFbc2xvdElkeF0pO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2xvdERhdGFbc2xvdElkeF1bal0gPT09IDAgJiYgbmV3U2xvdERhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdDb2luRGF0YSA9IG5ld1Nsb3REYXRhLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2xvdERhdGFbc2xvdElkeF1bal0gPSBuZXdDb2luRGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFRPRE86IOais+eQhuaji+ebmOaVsOaNrijmnI3liqHlmajpgLvovpEpXG4gICAgICogQGRlc2NyaXB0aW9uOiDkv53nlZnlnLrmma/kuK3mnIDlpKfnmoQ45Liq56eN57G75pWw77yM5q+P56eN5pWw5pyA5aSa5L+d55WZMTDkuKrvvIzlhbbkvZnpg73miZTmjolcbiAgICAgKi9cbiAgICB0aWR5RGF0YSgpOiB2b2lkIHtcbiAgICAgICAgLy8gMeOAgeiusOW9leavj+enjeexu+Wei+aVsOWtl+eahOaMgeacieaAu+aVsFxuICAgICAgICBjb25zdCBkYXRhTWFwID0ge307XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zbG90RGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2xvdERhdGFbaV1bal0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFNYXBbYCR7dGhpcy5zbG90RGF0YVtpXVtqXX1gXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YU1hcFtgJHt0aGlzLnNsb3REYXRhW2ldW2pdfWBdICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhTWFwW2Ake3RoaXMuc2xvdERhdGFbaV1bal19YF0gPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdkYXRhTWFwOicsIGRhdGFNYXApO1xuXG4gICAgICAgIC8vIDLjgIHmoLnmja7mr4/np43mlbDlrZfnsbvlnovvvIzliJvlu7rkuIDkuKrplb/luqbkuLoxMOeahOexu+Wei++8jOaVsOmHj+S4jei2szEw6KGl6LazMFxuICAgICAgICBjb25zdCBhbGxEYXRhOiBudW1iZXJbXVtdID0gW107XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGRhdGFNYXApIHtcbiAgICAgICAgICAgIGlmIChkYXRhTWFwW2tleV0gPiAxMCkge1xuICAgICAgICAgICAgICAgIGRhdGFNYXBba2V5XSA9IDEwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwZXJUeXBlRGF0YSA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPD0gZGF0YU1hcFtrZXldIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICBwZXJUeXBlRGF0YS5wdXNoKE51bWJlcihrZXkpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwZXJUeXBlRGF0YS5wdXNoKDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWxsRGF0YS5wdXNoKHBlclR5cGVEYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDPjgIHlsIbmiYDmnInnsbvlnovnmoTmlbDnu4Tku47lpKfliLDlsI/mnInluo/mjpLliJdcbiAgICAgICAgYWxsRGF0YS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYlswXSAtIGFbMF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOacgOe7iOagh+WHhuagvOW8j+WMllxuICAgICAgICBpZiAoYWxsRGF0YS5sZW5ndGggPiA4KSB7XG4gICAgICAgICAgICAvLyDnsbvlnovotoXov4c456eNIOWPluWJjeWFq1xuICAgICAgICAgICAgdGhpcy5zbG90RGF0YSA9IGFsbERhdGEuc2xpY2UoMCwgNyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDkuI3otrM456eN77yM6KGl6LazOOenjVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoYWxsRGF0YS5sZW5ndGggPD0gaSkge1xuICAgICAgICAgICAgICAgICAgICBhbGxEYXRhLnB1c2goWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2xvdERhdGEgPSBhbGxEYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ+aVtOeQhuWQjueahHNsb3REYXRhOicsIGFsbERhdGEsIHRoaXMuc2xvdERhdGEpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBnYW1lTW9kdWxlID0gbmV3IEdhbWVNb2R1bGUoKTtcbiJdfQ==