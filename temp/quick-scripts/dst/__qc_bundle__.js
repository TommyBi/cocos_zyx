
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/__qc_index__.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}
require('./assets/script/merge/dataModule/DataModule');
require('./assets/script/merge/dataModule/GameModule');
require('./assets/script/merge/dataModule/GoodsModule');
require('./assets/script/merge/dataModule/PlayerModule');
require('./assets/script/merge/dataModule/ZyxGameModule');
require('./assets/script/merge/define/TypeDefine');
require('./assets/script/merge/game/Coin');
require('./assets/script/merge/game/Game');
require('./assets/script/merge/game/GoodsCom');
require('./assets/script/merge/game/GoodsList');
require('./assets/script/merge/game/MergeProgress');
require('./assets/script/merge/game/MergeScene');
require('./assets/script/merge/game/Slot');
require('./assets/script/merge/manager/AudioMgr');
require('./assets/script/merge/manager/Define');
require('./assets/script/merge/manager/Uimanager');
require('./assets/script/merge/pulicCom/Tips');
require('./assets/script/merge/pulicCom/TouchEffect');
require('./assets/script/merge/util/EventManager');
require('./assets/script/merge/util/NewUtils');
require('./assets/script/merge/util/WxApiManager');
require('./assets/script/merge/util/logger');
require('./assets/script/merge/zyxGame/ZyxAccountDialog');
require('./assets/script/merge/zyxGame/ZyxComTop');
require('./assets/script/merge/zyxGame/ZyxGame');
require('./assets/script/merge/zyxGame/ZyxGridCom');
require('./assets/script/merge/zyxGame/ZyxLineCom');
require('./assets/script/merge/zyxGame/ZyxMainScene');
require('./assets/script/merge/zyxGame/ZyxRewardItem');

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
//------QC-SOURCE-SPLIT------

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
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/PlayerModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b9091AjnB9Hj67aGxm4Vaq5', 'PlayerModule');
// script/merge/dataModule/PlayerModule.ts

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
exports.playerModule = void 0;
var DataModule_1 = require("./DataModule");
var GameModule_1 = require("./GameModule");
var GoodsModule_1 = require("./GoodsModule");
var ZyxGameModule_1 = require("./ZyxGameModule");
var PlayerModule = /** @class */ (function (_super) {
    __extends(PlayerModule, _super);
    function PlayerModule() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // 资源信息
        _this.diamond = 0;
        _this.star = 0;
        _this.hammer = 0;
        _this.bomb = 0;
        // 玩家信息
        _this.nickName = '';
        _this.avatar = '';
        _this.lv = 0;
        _this.exp = 0;
        _this.expTar = 0;
        return _this;
    }
    PlayerModule.prototype.parseData = function (data) {
        _super.prototype.parseData.call(this, data);
    };
    PlayerModule.prototype.login = function (cb) {
        var loginData = {
            // 资源信息
            diamond: 10,
            star: 3,
            bomb: 3,
            hammer: 3,
            // 玩家信息
            nickName: '测试用户',
            avatar: '',
            lv: 1,
            exp: 10,
            expTar: 100,
            scoreRecord: 10,
            // 状态信息
            gameInfo: {
                adTimes: 3,
                score: 0,
                exp: 0,
                diamond: 0,
                star: 0,
                // 格子当前使用到的唯一索引值
                uniqueId: 9,
                goods: {},
            },
        };
        GameModule_1.gameModule.parseData(loginData);
        GoodsModule_1.goodsModule.parseData(loginData);
        ZyxGameModule_1.zyxGameModule.parseData(loginData);
        setTimeout(function () {
            cb && cb();
        }, 1000);
    };
    return PlayerModule;
}(DataModule_1.default));
exports.default = PlayerModule;
exports.playerModule = new PlayerModule();
/**
// 初始化的筹码配置
            slotData: [
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 2, 2, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 3, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],

            // 奖励兑换配置信息
            goods: [{
                id: 1,
                star: 1,
                total: 100,
                used: 0,
                name: '1盒纸巾',
                desc: '商品1',
                url: ``,
            }, {
                id: 2,
                star: 3,
                total: 100,
                used: 0,
                name: '1箱牛奶',
                desc: '商品2',
                url: ``,
            }, {
                id: 3,
                star: 5,
                total: 100,
                used: 0,
                name: '一箱红牛',
                desc: '商品3',
                url: ``,
            }, {
                id: 4,
                star: 5,
                total: 100,
                used: 0,
                name: '一箱饼干',
                desc: '商品4',
                url: ``,
            }, {
                id: 5,
                star: 8,
                total: 100,
                used: 0,
                name: '星巴克100券',
                desc: '商品5',
                url: ``,
            }, {
                id: 6,
                star: 10,
                total: 100,
                used: 0,
                name: '电子手表',
                desc: '商品6',
                url: ``,
            }, {
                id: 7,
                star: 10,
                total: 100,
                used: 0,
                name: '北京1日游',
                desc: '商品7',
                url: ``,
            }, {
                id: 8,
                star: 20,
                total: 100,
                used: 0,
                name: '5克黄金',
                desc: '商品8',
                url: ``,
            }
            ]
 */ 

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9QbGF5ZXJNb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFzQztBQUN0QywyQ0FBMEM7QUFDMUMsNkNBQTRDO0FBQzVDLGlEQUFnRDtBQUVoRDtJQUEwQyxnQ0FBVTtJQUFwRDtRQUFBLHFFQXVEQztRQXRERyxPQUFPO1FBQ1AsYUFBTyxHQUFXLENBQUMsQ0FBQztRQUNwQixVQUFJLEdBQVcsQ0FBQyxDQUFDO1FBQ2pCLFlBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsVUFBSSxHQUFXLENBQUMsQ0FBQztRQUVqQixPQUFPO1FBQ1AsY0FBUSxHQUFXLEVBQUUsQ0FBQztRQUN0QixZQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLFFBQUUsR0FBVyxDQUFDLENBQUM7UUFDZixTQUFHLEdBQVcsQ0FBQyxDQUFDO1FBQ2hCLFlBQU0sR0FBVyxDQUFDLENBQUM7O0lBMkN2QixDQUFDO0lBekNHLGdDQUFTLEdBQVQsVUFBVSxJQUFTO1FBQ2YsaUJBQU0sU0FBUyxZQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCw0QkFBSyxHQUFMLFVBQU0sRUFBWTtRQUNkLElBQU0sU0FBUyxHQUFHO1lBQ2QsT0FBTztZQUNQLE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxFQUFFLENBQUM7WUFDUCxJQUFJLEVBQUUsQ0FBQztZQUNQLE1BQU0sRUFBRSxDQUFDO1lBRVQsT0FBTztZQUNQLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsRUFBRSxFQUFFLENBQUM7WUFDTCxHQUFHLEVBQUUsRUFBRTtZQUNQLE1BQU0sRUFBRSxHQUFHO1lBQ1gsV0FBVyxFQUFFLEVBQUU7WUFFZixPQUFPO1lBQ1AsUUFBUSxFQUFFO2dCQUNOLE9BQU8sRUFBRSxDQUFDO2dCQUNWLEtBQUssRUFBRSxDQUFDO2dCQUNSLEdBQUcsRUFBRSxDQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDO2dCQUNWLElBQUksRUFBRSxDQUFDO2dCQUNQLGdCQUFnQjtnQkFDaEIsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsS0FBSyxFQUFFLEVBQUU7YUFDWjtTQUNKLENBQUE7UUFFRCx1QkFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoQyx5QkFBVyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqQyw2QkFBYSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVuQyxVQUFVLENBQUM7WUFDUCxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7UUFDZixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDYixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQXZEQSxBQXVEQyxDQXZEeUMsb0JBQVUsR0F1RG5EOztBQUNZLFFBQUEsWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7QUFJL0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0ZHIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERhdGFNb2R1bGUgZnJvbSAnLi9EYXRhTW9kdWxlJztcbmltcG9ydCB7IGdhbWVNb2R1bGUgfSBmcm9tICcuL0dhbWVNb2R1bGUnO1xuaW1wb3J0IHsgZ29vZHNNb2R1bGUgfSBmcm9tICcuL0dvb2RzTW9kdWxlJztcbmltcG9ydCB7IHp5eEdhbWVNb2R1bGUgfSBmcm9tICcuL1p5eEdhbWVNb2R1bGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJNb2R1bGUgZXh0ZW5kcyBEYXRhTW9kdWxlIHtcbiAgICAvLyDotYTmupDkv6Hmga9cbiAgICBkaWFtb25kOiBudW1iZXIgPSAwO1xuICAgIHN0YXI6IG51bWJlciA9IDA7XG4gICAgaGFtbWVyOiBudW1iZXIgPSAwO1xuICAgIGJvbWI6IG51bWJlciA9IDA7XG5cbiAgICAvLyDnjqnlrrbkv6Hmga9cbiAgICBuaWNrTmFtZTogc3RyaW5nID0gJyc7XG4gICAgYXZhdGFyOiBzdHJpbmcgPSAnJztcbiAgICBsdjogbnVtYmVyID0gMDtcbiAgICBleHA6IG51bWJlciA9IDA7XG4gICAgZXhwVGFyOiBudW1iZXIgPSAwO1xuXG4gICAgcGFyc2VEYXRhKGRhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBzdXBlci5wYXJzZURhdGEoZGF0YSk7XG4gICAgfVxuXG4gICAgbG9naW4oY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGxvZ2luRGF0YSA9IHtcbiAgICAgICAgICAgIC8vIOi1hOa6kOS/oeaBr1xuICAgICAgICAgICAgZGlhbW9uZDogMTAsXG4gICAgICAgICAgICBzdGFyOiAzLFxuICAgICAgICAgICAgYm9tYjogMyxcbiAgICAgICAgICAgIGhhbW1lcjogMyxcblxuICAgICAgICAgICAgLy8g546p5a625L+h5oGvXG4gICAgICAgICAgICBuaWNrTmFtZTogJ+a1i+ivleeUqOaItycsXG4gICAgICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICAgICAgbHY6IDEsXG4gICAgICAgICAgICBleHA6IDEwLFxuICAgICAgICAgICAgZXhwVGFyOiAxMDAsXG4gICAgICAgICAgICBzY29yZVJlY29yZDogMTAsXG5cbiAgICAgICAgICAgIC8vIOeKtuaAgeS/oeaBr1xuICAgICAgICAgICAgZ2FtZUluZm86IHtcbiAgICAgICAgICAgICAgICBhZFRpbWVzOiAzLFxuICAgICAgICAgICAgICAgIHNjb3JlOiAwLFxuICAgICAgICAgICAgICAgIGV4cDogMCxcbiAgICAgICAgICAgICAgICBkaWFtb25kOiAwLFxuICAgICAgICAgICAgICAgIHN0YXI6IDAsXG4gICAgICAgICAgICAgICAgLy8g5qC85a2Q5b2T5YmN5L2/55So5Yiw55qE5ZSv5LiA57Si5byV5YC8XG4gICAgICAgICAgICAgICAgdW5pcXVlSWQ6IDksXG4gICAgICAgICAgICAgICAgZ29vZHM6IHt9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVNb2R1bGUucGFyc2VEYXRhKGxvZ2luRGF0YSk7XG4gICAgICAgIGdvb2RzTW9kdWxlLnBhcnNlRGF0YShsb2dpbkRhdGEpO1xuICAgICAgICB6eXhHYW1lTW9kdWxlLnBhcnNlRGF0YShsb2dpbkRhdGEpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2IgJiYgY2IoKTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IHBsYXllck1vZHVsZSA9IG5ldyBQbGF5ZXJNb2R1bGUoKTtcblxuXG5cbi8qKlxuLy8g5Yid5aeL5YyW55qE562556CB6YWN572uXG4gICAgICAgICAgICBzbG90RGF0YTogW1xuICAgICAgICAgICAgICAgIFsxLCAxLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMiwgMiwgMiwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzEsIDEsIDIsIDIsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFsyLCAyLCAyLCAzLCAzLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICBdLFxuXG4gICAgICAgICAgICAvLyDlpZblirHlhZHmjaLphY3nva7kv6Hmga9cbiAgICAgICAgICAgIGdvb2RzOiBbe1xuICAgICAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgICAgIHN0YXI6IDEsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICcx55uS57q45be+JyxcbiAgICAgICAgICAgICAgICBkZXNjOiAn5ZWG5ZOBMScsXG4gICAgICAgICAgICAgICAgdXJsOiBgYCxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpZDogMixcbiAgICAgICAgICAgICAgICBzdGFyOiAzLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAnMeeuseeJm+WlticsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTInLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDMsXG4gICAgICAgICAgICAgICAgc3RhcjogNSxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+S4gOeusee6oueJmycsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTMnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDQsXG4gICAgICAgICAgICAgICAgc3RhcjogNSxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+S4gOeusemlvOW5sicsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTQnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDUsXG4gICAgICAgICAgICAgICAgc3RhcjogOCxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+aYn+W3tOWFizEwMOWIuCcsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTUnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDYsXG4gICAgICAgICAgICAgICAgc3RhcjogMTAsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICfnlLXlrZDmiYvooagnLFxuICAgICAgICAgICAgICAgIGRlc2M6ICfllYblk4E2JyxcbiAgICAgICAgICAgICAgICB1cmw6IGBgLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGlkOiA3LFxuICAgICAgICAgICAgICAgIHN0YXI6IDEwLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAn5YyX5LqsMeaXpea4uCcsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTcnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDgsXG4gICAgICAgICAgICAgICAgc3RhcjogMjAsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICc15YWL6buE6YeRJyxcbiAgICAgICAgICAgICAgICBkZXNjOiAn5ZWG5ZOBOCcsXG4gICAgICAgICAgICAgICAgdXJsOiBgYCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAqLyJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/define/TypeDefine.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '26083HQUZhNsJndxpxVjML2', 'TypeDefine');
// script/merge/define/TypeDefine.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gridContentType = exports.gridSize = exports.LAYER = void 0;
// 层级
var LAYER;
(function (LAYER) {
    LAYER["UI"] = "ui";
    LAYER["DIALOG"] = "dialog";
    LAYER["TIP"] = "tip";
    LAYER["GUIDE"] = "guide";
})(LAYER = exports.LAYER || (exports.LAYER = {}));
// 格子的尺寸类型 空格子尺寸为0
var gridSize;
(function (gridSize) {
    gridSize[gridSize["ZERO"] = 0] = "ZERO";
    gridSize[gridSize["ONE"] = 1] = "ONE";
    gridSize[gridSize["TWO"] = 2] = "TWO";
    gridSize[gridSize["THREE"] = 3] = "THREE";
    gridSize[gridSize["FOUR"] = 4] = "FOUR";
})(gridSize = exports.gridSize || (exports.gridSize = {}));
// 格子的物品类型
var gridContentType;
(function (gridContentType) {
    // 空格子
    gridContentType[gridContentType["EMPTY"] = 0] = "EMPTY";
    // 没有什么物品
    gridContentType[gridContentType["NORMAL"] = 1] = "NORMAL";
    // 钻石
    gridContentType[gridContentType["DIAMOND"] = 2] = "DIAMOND";
    // 道具-炸弹
    gridContentType[gridContentType["BOMB"] = 3] = "BOMB";
    // 道具-锤子
    gridContentType[gridContentType["HAMMER"] = 4] = "HAMMER";
    // 道具 - 山竹
    gridContentType[gridContentType["MANGOSTEEN"] = 5] = "MANGOSTEEN";
    // 道具 - 葡萄
    gridContentType[gridContentType["GRAPE"] = 6] = "GRAPE";
    // 道具 - 苹果
    gridContentType[gridContentType["APPLE"] = 7] = "APPLE";
    // 道具 - 鱼腥草
    gridContentType[gridContentType["FISHGRASS"] = 8] = "FISHGRASS";
    // 道具 - 菠萝
    gridContentType[gridContentType["PINEAPPLE"] = 9] = "PINEAPPLE";
    // 道具 - 桃子
    gridContentType[gridContentType["PEACH"] = 10] = "PEACH";
    // 道具 - 水草
    gridContentType[gridContentType["WATERPLANT"] = 11] = "WATERPLANT";
})(gridContentType = exports.gridContentType || (exports.gridContentType = {}));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGVmaW5lL1R5cGVEZWZpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsS0FBSztBQUNMLElBQVksS0FLWDtBQUxELFdBQVksS0FBSztJQUNiLGtCQUFTLENBQUE7SUFDVCwwQkFBaUIsQ0FBQTtJQUNqQixvQkFBVyxDQUFBO0lBQ1gsd0JBQWUsQ0FBQTtBQUNuQixDQUFDLEVBTFcsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBS2hCO0FBZUQsa0JBQWtCO0FBQ2xCLElBQVksUUFNWDtBQU5ELFdBQVksUUFBUTtJQUNoQix1Q0FBUSxDQUFBO0lBQ1IscUNBQU8sQ0FBQTtJQUNQLHFDQUFPLENBQUE7SUFDUCx5Q0FBUyxDQUFBO0lBQ1QsdUNBQVEsQ0FBQTtBQUNaLENBQUMsRUFOVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQU1uQjtBQUVELFVBQVU7QUFDVixJQUFZLGVBeUJYO0FBekJELFdBQVksZUFBZTtJQUN2QixNQUFNO0lBQ04sdURBQVMsQ0FBQTtJQUNULFNBQVM7SUFDVCx5REFBVSxDQUFBO0lBQ1YsS0FBSztJQUNMLDJEQUFXLENBQUE7SUFDWCxRQUFRO0lBQ1IscURBQVEsQ0FBQTtJQUNSLFFBQVE7SUFDUix5REFBVSxDQUFBO0lBQ1YsVUFBVTtJQUNWLGlFQUFjLENBQUE7SUFDZCxVQUFVO0lBQ1YsdURBQVMsQ0FBQTtJQUNULFVBQVU7SUFDVix1REFBUyxDQUFBO0lBQ1QsV0FBVztJQUNYLCtEQUFhLENBQUE7SUFDYixVQUFVO0lBQ1YsK0RBQWEsQ0FBQTtJQUNiLFVBQVU7SUFDVix3REFBVSxDQUFBO0lBQ1YsVUFBVTtJQUNWLGtFQUFlLENBQUE7QUFDbkIsQ0FBQyxFQXpCVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQXlCMUIiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDlsYLnuqdcbmV4cG9ydCBlbnVtIExBWUVSIHtcbiAgICBVSSA9ICd1aScsXG4gICAgRElBTE9HID0gJ2RpYWxvZycsXG4gICAgVElQID0gJ3RpcCcsXG4gICAgR1VJREUgPSAnZ3VpZGUnLFxufVxuXG4vLyDmuLjmiI/ov5vooYzkuK3nmoTkv6Hmga9cbmV4cG9ydCB0eXBlIHR5cGVHYW1lSW5mbyA9IHtcbiAgICAvLyDnirbmgIHkv6Hmga9cbiAgICBhZFRpbWVzOiBudW1iZXIsIC8vIOWJqeS9meaSreaUvuW5v+WRiueahOasoeaVsFxuICAgIHNjb3JlOiBudW1iZXIsXG4gICAgZXhwOiBudW1iZXIsXG4gICAgLy8g5b2T5YmN5Zue5ZCI57Sv6K6h5b6X5Yiw55qE5pif5pifXG4gICAgc3RhcjogbnVtYmVyLFxuICAgIC8vIOagvOWtkOW9k+WJjeS9v+eUqOWIsOeahOWUr+S4gOe0ouW8leWAvFxuICAgIHVuaXF1ZUlkOiBudW1iZXIsXG4gICAgZ29vZHM6IG9iamVjdCxcbn1cblxuLy8g5qC85a2Q55qE5bC65a+457G75Z6LIOepuuagvOWtkOWwuuWvuOS4ujBcbmV4cG9ydCBlbnVtIGdyaWRTaXplIHtcbiAgICBaRVJPID0gMCxcbiAgICBPTkUgPSAxLFxuICAgIFRXTyA9IDIsXG4gICAgVEhSRUUgPSAzLFxuICAgIEZPVVIgPSA0LFxufVxuXG4vLyDmoLzlrZDnmoTnianlk4HnsbvlnotcbmV4cG9ydCBlbnVtIGdyaWRDb250ZW50VHlwZSB7XG4gICAgLy8g56m65qC85a2QXG4gICAgRU1QVFkgPSAwLFxuICAgIC8vIOayoeacieS7gOS5iOeJqeWTgVxuICAgIE5PUk1BTCA9IDEsXG4gICAgLy8g6ZK755+zXG4gICAgRElBTU9ORCA9IDIsXG4gICAgLy8g6YGT5YW3LeeCuOW8uVxuICAgIEJPTUIgPSAzLFxuICAgIC8vIOmBk+WFty3plKTlrZBcbiAgICBIQU1NRVIgPSA0LFxuICAgIC8vIOmBk+WFtyAtIOWxseeruVxuICAgIE1BTkdPU1RFRU4gPSA1LFxuICAgIC8vIOmBk+WFtyAtIOiRoeiQhFxuICAgIEdSQVBFID0gNixcbiAgICAvLyDpgZPlhbcgLSDoi7nmnpxcbiAgICBBUFBMRSA9IDcsXG4gICAgLy8g6YGT5YW3IC0g6bG86IWl6I2JXG4gICAgRklTSEdSQVNTID0gOCxcbiAgICAvLyDpgZPlhbcgLSDoj6DokJ1cbiAgICBQSU5FQVBQTEUgPSA5LFxuICAgIC8vIOmBk+WFtyAtIOahg+WtkFxuICAgIFBFQUNIID0gMTAsXG4gICAgLy8g6YGT5YW3IC0g5rC06I2JXG4gICAgV0FURVJQTEFOVCA9IDExLFxufVxuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/Game.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '650a2ldzTZM6Joa8EAO498E', 'Game');
// script/merge/game/Game.ts

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
var GoodsList_1 = require("./GoodsList");
var MergeProgress_1 = require("./MergeProgress");
var Slot_1 = require("./Slot");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Game = /** @class */ (function (_super) {
    __extends(Game, _super);
    function Game() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uBoxSlot = null;
        _this.uBtnProduce = null;
        _this.uBtnTidyUp = null;
        _this.uBtnMerge = null;
        _this.uBar = null;
        _this.uPanel = null;
        _this.ulblStar = null;
        // 缓存槽位的节点
        _this.slots = [];
        return _this;
    }
    Game.prototype.onLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.uBtnMerge.on(cc.Node.EventType.TOUCH_END, this.onMerge, this);
                        this.uBtnProduce.on(cc.Node.EventType.TOUCH_END, this.onProduce, this);
                        this.uBtnTidyUp.on(cc.Node.EventType.TOUCH_END, this.onTidy, this);
                        EventManager_1.eventManager.on(Define_1.EventType.CHECK_MERGE, this.updateBtn, this);
                        EventManager_1.eventManager.on(Define_1.EventType.MERGE_END, this.updateProgress, this);
                        return [4 /*yield*/, this.addSlot()];
                    case 1:
                        _a.sent();
                        // 加载当前槽筹码状态
                        this.formatSlotData();
                        this.updateBtn();
                        // 加载合成进度
                        this.updateProgress();
                        // 加载商品
                        this.uPanel.getComponent(GoodsList_1.default).initGoods();
                        // 主界面的元素信息
                        this.ulblStar.string = "x " + GameModule_1.gameModule.star;
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.start = function () {
    };
    // 初始化预制组件
    Game.prototype.addSlot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var slotW, slotH, dx, dy, i, row, col, slotPrefab, slot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        slotW = 116;
                        slotH = 212;
                        dx = (608 - slotW * 4) / 3;
                        dy = (this.uBoxSlot.height - slotH * 2) + slotH;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 8)) return [3 /*break*/, 4];
                        row = Math.floor(i / 4);
                        col = i % 4;
                        return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/merge/slot')];
                    case 2:
                        slotPrefab = _a.sent();
                        slot = cc.instantiate(slotPrefab);
                        this.uBoxSlot.addChild(slot);
                        slot.x = col * slotW + dx * col;
                        slot.y = -slotH - dy * row;
                        this.slots.push(slot);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // 格式化填充游戏数据
    Game.prototype.formatSlotData = function () {
        for (var i = 0; i < 8; i++) {
            this.slots[i].getComponent(Slot_1.default).formatData(i, GameModule_1.gameModule.slotData[i]);
        }
        EventManager_1.eventManager.dispatch(Define_1.EventType.CHECK_MERGE);
    };
    // 更新按钮的显示状态
    Game.prototype.updateBtn = function () {
        var canMerge = GameModule_1.gameModule.checkCanMerge();
        this.uBtnMerge.active = canMerge.length > 0;
    };
    // 更新进度
    Game.prototype.updateProgress = function () {
        this.uBar.getComponent(MergeProgress_1.default).updateProress();
    };
    // 合成
    Game.prototype.onMerge = function () {
        if (!GameModule_1.gameModule.canOperate)
            return;
        EventManager_1.eventManager.dispatch(Define_1.EventType.MERGE_COIN);
        // 点击合成后，提前主动隐藏掉“合成”按钮避免连点
        this.uBtnMerge.active = false;
    };
    // 发牌
    Game.prototype.onProduce = function () {
        if (!GameModule_1.gameModule.canOperate)
            return;
        AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.PRODUCE_COIN);
        var startPosIdxs = [];
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 10; j++) {
                if (GameModule_1.gameModule.slotData[i][j] === 0) {
                    startPosIdxs.push(j);
                    break;
                }
                if (j === 9) {
                    startPosIdxs.push(9);
                }
            }
        }
        var newCoinData = GameModule_1.gameModule.produceNewCoinData();
        for (var i = 0; i < this.slots.length; i++) {
            this.slots[i].getComponent(Slot_1.default).produce(newCoinData[i], this.node.convertToWorldSpaceAR(this.uBtnProduce.getPosition()), startPosIdxs[i]);
        }
        GameModule_1.gameModule.mergeProduceData(newCoinData);
        // 发牌完成，检测是否可以合成
        EventManager_1.eventManager.dispatch(Define_1.EventType.CHECK_MERGE);
    };
    // 整理
    Game.prototype.onTidy = function () {
        if (!GameModule_1.gameModule.canOperate)
            return;
        // 获得额外次数 
        if (GameModule_1.gameModule.extraChance < 2) {
            // 分享获得
            wx.shareAppMessage({
                title: '我觉得你不行',
            });
        }
        if (GameModule_1.gameModule.extraChance < 4) {
            // 通过看广告获得
        }
    };
    Game.prototype.doTidy = function () {
        // 如果当前有选中情况，取消当前选中的状态
        if (GameModule_1.gameModule.curSelectSlotIdx !== -1) {
            EventManager_1.eventManager.dispatch(Define_1.EventType.CANCEL_SELECT);
        }
        GameModule_1.gameModule.tidyData();
        this.formatSlotData();
    };
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uBoxSlot", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uBtnProduce", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uBtnTidyUp", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uBtnMerge", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uBar", void 0);
    __decorate([
        property(cc.Node)
    ], Game.prototype, "uPanel", void 0);
    __decorate([
        property(cc.Label)
    ], Game.prototype, "ulblStar", void 0);
    Game = __decorate([
        ccclass
    ], Game);
    return Game;
}(cc.Component));
exports.default = Game;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9HYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEQUFzRDtBQUN0RCxnREFBMEQ7QUFDMUQsNENBQThDO0FBQzlDLGtEQUFpRDtBQUNqRCxxREFBb0Q7QUFDcEQseUNBQW9DO0FBQ3BDLGlEQUE0QztBQUM1QywrQkFBMEI7QUFFcEIsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFHNUM7SUFBa0Msd0JBQVk7SUFBOUM7UUFBQSxxRUFvS0M7UUFsS0csY0FBUSxHQUFZLElBQUksQ0FBQztRQUd6QixpQkFBVyxHQUFZLElBQUksQ0FBQztRQUc1QixnQkFBVSxHQUFZLElBQUksQ0FBQztRQUczQixlQUFTLEdBQVksSUFBSSxDQUFDO1FBRzFCLFVBQUksR0FBWSxJQUFJLENBQUM7UUFHckIsWUFBTSxHQUFZLElBQUksQ0FBQztRQUd2QixjQUFRLEdBQWEsSUFBSSxDQUFDO1FBRTFCLFVBQVU7UUFDRixXQUFLLEdBQVcsRUFBRSxDQUFDOztJQTZJL0IsQ0FBQztJQTNJUyxxQkFBTSxHQUFaOzs7Ozt3QkFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDbkUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ3ZFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FB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MENBQ087SUFHekI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs2Q0FDVTtJQUc1QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzRDQUNTO0lBRzNCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7MkNBQ1E7SUFHMUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztzQ0FDRztJQUdyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO3dDQUNLO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7MENBQ087SUFwQlQsSUFBSTtRQUR4QixPQUFPO09BQ2EsSUFBSSxDQW9LeEI7SUFBRCxXQUFDO0NBcEtELEFBb0tDLENBcEtpQyxFQUFFLENBQUMsU0FBUyxHQW9LN0M7a0JBcEtvQixJQUFJIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2FtZU1vZHVsZSB9IGZyb20gJy4uL2RhdGFNb2R1bGUvR2FtZU1vZHVsZSc7XG5pbXBvcnQgeyBTb3VuZFR5cGUsIGF1ZGlvTWdyIH0gZnJvbSAnLi4vbWFuYWdlci9BdWRpb01ncic7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tICcuLi9tYW5hZ2VyL0RlZmluZSc7XG5pbXBvcnQgeyB1aW1hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2VyL1VpbWFuYWdlcic7XG5pbXBvcnQgeyBldmVudE1hbmFnZXIgfSBmcm9tICcuLi91dGlsL0V2ZW50TWFuYWdlcic7XG5pbXBvcnQgR29vZHNMaXN0IGZyb20gJy4vR29vZHNMaXN0JztcbmltcG9ydCBNZXJnZVByb2dyZXNzIGZyb20gJy4vTWVyZ2VQcm9ncmVzcyc7XG5pbXBvcnQgU2xvdCBmcm9tICcuL1Nsb3QnO1xuXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJveFNsb3Q6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0blByb2R1Y2U6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0blRpZHlVcDogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1QnRuTWVyZ2U6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJhcjogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1UGFuZWw6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxTdGFyOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICAvLyDnvJPlrZjmp73kvY3nmoToioLngrlcbiAgICBwcml2YXRlIHNsb3RzOiBTbG90W10gPSBbXTtcblxuICAgIGFzeW5jIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy51QnRuTWVyZ2Uub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uTWVyZ2UsIHRoaXMpO1xuICAgICAgICB0aGlzLnVCdG5Qcm9kdWNlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vblByb2R1Y2UsIHRoaXMpO1xuICAgICAgICB0aGlzLnVCdG5UaWR5VXAub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uVGlkeSwgdGhpcyk7XG5cbiAgICAgICAgZXZlbnRNYW5hZ2VyLm9uKEV2ZW50VHlwZS5DSEVDS19NRVJHRSwgdGhpcy51cGRhdGVCdG4sIHRoaXMpO1xuICAgICAgICBldmVudE1hbmFnZXIub24oRXZlbnRUeXBlLk1FUkdFX0VORCwgdGhpcy51cGRhdGVQcm9ncmVzcywgdGhpcyk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5hZGRTbG90KCk7XG5cbiAgICAgICAgLy8g5Yqg6L295b2T5YmN5qe9562556CB54q25oCBXG4gICAgICAgIHRoaXMuZm9ybWF0U2xvdERhdGEoKTtcbiAgICAgICAgdGhpcy51cGRhdGVCdG4oKTtcblxuICAgICAgICAvLyDliqDovb3lkIjmiJDov5vluqZcbiAgICAgICAgdGhpcy51cGRhdGVQcm9ncmVzcygpO1xuXG4gICAgICAgIC8vIOWKoOi9veWVhuWTgVxuICAgICAgICB0aGlzLnVQYW5lbC5nZXRDb21wb25lbnQoR29vZHNMaXN0KS5pbml0R29vZHMoKTtcblxuICAgICAgICAvLyDkuLvnlYzpnaLnmoTlhYPntKDkv6Hmga9cbiAgICAgICAgdGhpcy51bGJsU3Rhci5zdHJpbmcgPSBgeCAke2dhbWVNb2R1bGUuc3Rhcn1gO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuXG4gICAgfVxuXG4gICAgLy8g5Yid5aeL5YyW6aKE5Yi257uE5Lu2XG4gICAgYXN5bmMgYWRkU2xvdCgpIHtcbiAgICAgICAgY29uc3Qgc2xvdFcgPSAxMTY7XG4gICAgICAgIGNvbnN0IHNsb3RIID0gMjEyO1xuICAgICAgICBjb25zdCBkeCA9ICg2MDggLSBzbG90VyAqIDQpIC8gMztcbiAgICAgICAgY29uc3QgZHkgPSAodGhpcy51Qm94U2xvdC5oZWlnaHQgLSBzbG90SCAqIDIpICsgc2xvdEg7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoaSAvIDQpO1xuICAgICAgICAgICAgY29uc3QgY29sID0gaSAlIDQ7XG5cbiAgICAgICAgICAgIGNvbnN0IHNsb3RQcmVmYWIgPSBhd2FpdCB1aW1hbmFnZXIubG9hZFByZWZhYigncHJlZmFiL21lcmdlL3Nsb3QnKTtcbiAgICAgICAgICAgIGNvbnN0IHNsb3QgPSBjYy5pbnN0YW50aWF0ZShzbG90UHJlZmFiKTtcbiAgICAgICAgICAgIHRoaXMudUJveFNsb3QuYWRkQ2hpbGQoc2xvdCk7XG4gICAgICAgICAgICBzbG90LnggPSBjb2wgKiBzbG90VyArIGR4ICogY29sO1xuICAgICAgICAgICAgc2xvdC55ID0gLXNsb3RIIC0gZHkgKiByb3c7XG5cbiAgICAgICAgICAgIHRoaXMuc2xvdHMucHVzaChzbG90KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOagvOW8j+WMluWhq+WFhea4uOaIj+aVsOaNrlxuICAgIHByaXZhdGUgZm9ybWF0U2xvdERhdGEoKTogdm9pZCB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnNsb3RzW2ldLmdldENvbXBvbmVudChTbG90KS5mb3JtYXREYXRhKGksIGdhbWVNb2R1bGUuc2xvdERhdGFbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuQ0hFQ0tfTUVSR0UpO1xuICAgIH1cblxuICAgIC8vIOabtOaWsOaMiemSrueahOaYvuekuueKtuaAgVxuICAgIHVwZGF0ZUJ0bigpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2FuTWVyZ2UgPSBnYW1lTW9kdWxlLmNoZWNrQ2FuTWVyZ2UoKTtcbiAgICAgICAgdGhpcy51QnRuTWVyZ2UuYWN0aXZlID0gY2FuTWVyZ2UubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICAvLyDmm7TmlrDov5vluqZcbiAgICB1cGRhdGVQcm9ncmVzcygpIHtcbiAgICAgICAgdGhpcy51QmFyLmdldENvbXBvbmVudChNZXJnZVByb2dyZXNzKS51cGRhdGVQcm9yZXNzKCk7XG4gICAgfVxuXG4gICAgLy8g5ZCI5oiQXG4gICAgb25NZXJnZSgpIHtcbiAgICAgICAgaWYgKCFnYW1lTW9kdWxlLmNhbk9wZXJhdGUpIHJldHVybjtcblxuICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLk1FUkdFX0NPSU4pO1xuICAgICAgICAvLyDngrnlh7vlkIjmiJDlkI7vvIzmj5DliY3kuLvliqjpmpDol4/mjonigJzlkIjmiJDigJ3mjInpkq7pgb/lhY3ov57ngrlcbiAgICAgICAgdGhpcy51QnRuTWVyZ2UuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8g5Y+R54mMXG4gICAgb25Qcm9kdWNlKCkge1xuICAgICAgICBpZiAoIWdhbWVNb2R1bGUuY2FuT3BlcmF0ZSkgcmV0dXJuO1xuXG4gICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuUFJPRFVDRV9DT0lOKTtcblxuICAgICAgICBjb25zdCBzdGFydFBvc0lkeHM6IG51bWJlcltdID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZ2FtZU1vZHVsZS5zbG90RGF0YVtpXVtqXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydFBvc0lkeHMucHVzaChqKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGogPT09IDkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRQb3NJZHhzLnB1c2goOSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV3Q29pbkRhdGEgPSBnYW1lTW9kdWxlLnByb2R1Y2VOZXdDb2luRGF0YSgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2xvdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuc2xvdHNbaV0uZ2V0Q29tcG9uZW50KFNsb3QpLnByb2R1Y2UoXG4gICAgICAgICAgICAgICAgbmV3Q29pbkRhdGFbaV0sXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLmNvbnZlcnRUb1dvcmxkU3BhY2VBUih0aGlzLnVCdG5Qcm9kdWNlLmdldFBvc2l0aW9uKCkpLFxuICAgICAgICAgICAgICAgIHN0YXJ0UG9zSWR4c1tpXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVNb2R1bGUubWVyZ2VQcm9kdWNlRGF0YShuZXdDb2luRGF0YSk7XG5cbiAgICAgICAgLy8g5Y+R54mM5a6M5oiQ77yM5qOA5rWL5piv5ZCm5Y+v5Lul5ZCI5oiQXG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuQ0hFQ0tfTUVSR0UpO1xuICAgIH1cblxuICAgIC8vIOaVtOeQhlxuICAgIG9uVGlkeSgpIHtcbiAgICAgICAgaWYgKCFnYW1lTW9kdWxlLmNhbk9wZXJhdGUpIHJldHVybjtcblxuICAgICAgICAvLyDojrflvpfpop3lpJbmrKHmlbAgXG4gICAgICAgIGlmIChnYW1lTW9kdWxlLmV4dHJhQ2hhbmNlIDwgMikge1xuICAgICAgICAgICAgLy8g5YiG5Lqr6I635b6XXG4gICAgICAgICAgICB3eC5zaGFyZUFwcE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAn5oiR6KeJ5b6X5L2g5LiN6KGMJyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZ2FtZU1vZHVsZS5leHRyYUNoYW5jZSA8IDQpIHtcbiAgICAgICAgICAgIC8vIOmAmui/h+eci+W5v+WRiuiOt+W+l1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkb1RpZHkoKTogdm9pZCB7XG4gICAgICAgIC8vIOWmguaenOW9k+WJjeaciemAieS4reaDheWGte+8jOWPlua2iOW9k+WJjemAieS4reeahOeKtuaAgVxuICAgICAgICBpZiAoZ2FtZU1vZHVsZS5jdXJTZWxlY3RTbG90SWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5DQU5DRUxfU0VMRUNUKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVNb2R1bGUudGlkeURhdGEoKTtcbiAgICAgICAgdGhpcy5mb3JtYXRTbG90RGF0YSgpO1xuICAgIH1cbn1cbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/GoodsModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'beefbM59wVK1oMpVwTVCzYm', 'GoodsModule');
// script/merge/dataModule/GoodsModule.ts

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
exports.goodsModule = void 0;
var DataModule_1 = require("./DataModule");
var GoodsModule = /** @class */ (function (_super) {
    __extends(GoodsModule, _super);
    function GoodsModule() {
        var _this = _super.call(this) || this;
        _this.goods = [];
        return _this;
    }
    GoodsModule.prototype.parseData = function (data) {
        _super.prototype.parseData.call(this, data);
        this.goods = data.goods;
    };
    return GoodsModule;
}(DataModule_1.default));
exports.default = GoodsModule;
exports.goodsModule = new GoodsModule();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9Hb29kc01vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMkNBQXNDO0FBRXRDO0lBQXlDLCtCQUFVO0lBRS9DO1FBQUEsWUFDSSxpQkFBTyxTQUNWO1FBSEQsV0FBSyxHQUFnQixFQUFFLENBQUM7O0lBR3hCLENBQUM7SUFFRCwrQkFBUyxHQUFULFVBQVUsSUFBUztRQUNmLGlCQUFNLFNBQVMsWUFBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0FWQSxBQVVDLENBVndDLG9CQUFVLEdBVWxEOztBQUNZLFFBQUEsV0FBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHb29kc1R5cGUgfSBmcm9tIFwiLi4vbWFuYWdlci9EZWZpbmVcIjtcbmltcG9ydCBEYXRhTW9kdWxlIGZyb20gXCIuL0RhdGFNb2R1bGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29vZHNNb2R1bGUgZXh0ZW5kcyBEYXRhTW9kdWxlIHtcbiAgICBnb29kczogR29vZHNUeXBlW10gPSBbXTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwYXJzZURhdGEoZGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIHN1cGVyLnBhcnNlRGF0YShkYXRhKTtcbiAgICAgICAgdGhpcy5nb29kcyA9IGRhdGEuZ29vZHM7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGdvb2RzTW9kdWxlID0gbmV3IEdvb2RzTW9kdWxlKCk7Il19
//------QC-SOURCE-SPLIT------

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
        // 新生成的次数
        _this.produceTimes = 0;
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
    // 生产格子，服务器逻辑 返回格式为[gridsize][contentType][uniqueId]
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
                // 判断剩余空间是否仍然没有空格子区域
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
        this.produceTimes++;
        console.log('produce', arr);
        return arr;
        // const a = [[2, 1, 10], [2, 1, 10], [2, 1, 11], [2, 1, 11], [2, 1, 12], [2, 1, 12], [2, 1, 13], [2, 1, 13]];
        // return a;
    };
    // 获得随机生成格子的类型
    ZyxGameModule.prototype.getContentType = function (hasProducedDiamond) {
        if (hasProducedDiamond)
            return TypeDefine_1.gridContentType.NORMAL;
        if (this.produceTimes % 6 === 0 && Math.random() <= 0.5) {
            return TypeDefine_1.gridContentType.DIAMOND;
        }
        else {
            return TypeDefine_1.gridContentType.NORMAL;
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9aeXhHYW1lTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBK0U7QUFDL0UsNkNBQXdDO0FBQ3hDLDJDQUFzQztBQUV0QztJQUEyQyxpQ0FBVTtJQWtDakQ7UUFBQSxZQUNJLGlCQUFPLFNBQ1Y7UUFsQ0QsYUFBYTtRQUNiLGNBQVEsR0FBaUIsSUFBSSxDQUFDO1FBRTlCLCtDQUErQztRQUMvQyxjQUFRLEdBQVU7WUFDZCxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDM0YsQ0FBQztRQUVGLE1BQU07UUFDTix3QkFBa0IsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUVoQyxPQUFPO1FBQ1AsZ0JBQVUsR0FBVyxFQUFFLENBQUM7UUFFeEIsUUFBUTtRQUNELGtCQUFZLEdBQVUsRUFBRSxDQUFDO1FBRWhDLFNBQVM7UUFDRixrQkFBWSxHQUFXLENBQUMsQ0FBQztRQUVoQyxRQUFRO1FBQ0QsaUJBQVcsR0FBVyxDQUFDLENBQUM7O0lBSS9CLENBQUM7SUFFRCxpQ0FBUyxHQUFULFVBQVUsSUFBUztRQUNmLGlCQUFNLFNBQVMsWUFBQyxJQUFJLENBQUMsQ0FBQztRQUV0QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJO1lBQzdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUs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QUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDOUI7UUFDRCxPQUFPLFdBQVcsQ0FBQztJQUN2QixDQUFDO0lBQ0wsb0JBQUM7QUFBRCxDQXhKQSxBQXdKQyxDQXhKMEMsb0JBQVUsR0F3SnBEOztBQUNZLFFBQUEsYUFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBncmlkQ29udGVudFR5cGUsIGdyaWRTaXplLCB0eXBlR2FtZUluZm8gfSBmcm9tICcuLi9kZWZpbmUvVHlwZURlZmluZSc7XG5pbXBvcnQgTmV3VXRpbHMgZnJvbSAnLi4vdXRpbC9OZXdVdGlscyc7XG5pbXBvcnQgRGF0YU1vZHVsZSBmcm9tICcuL0RhdGFNb2R1bGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaeXhHYW1lTW9kdWxlIGV4dGVuZHMgRGF0YU1vZHVsZSB7XG5cbiAgICAvLyDmuLjmiI/ov5vooYzkuK3nmoTotYTmupDmlbDmja5cbiAgICBnYW1lSW5mbzogdHlwZUdhbWVJbmZvID0gbnVsbDtcblxuICAgIC8vIOa4uOaIj+i/m+ihjOS4reeahOaji+ebmOaVsOaNriBbZ3JpZFNpemUsIGNvbnRlbnRUeXBlLCB1bmlxdWVJRF1cbiAgICBncmlkSW5mbzogYW55W10gPSBbXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgXTtcblxuICAgIC8vIOaTjeS9nOmUgVxuICAgIHNlbGVjdEdpcmRVbmlxdWVJZDogbnVtYmVyID0gLTE7XG5cbiAgICAvLyDmoLzlrZDlrr3luqZcbiAgICBncmlkc1dpZHRoOiBudW1iZXIgPSA4NDtcblxuICAgIC8vIOS4i+S4gOaOkuS/oeaBr1xuICAgIHB1YmxpYyBuZXh0R3JpZEluZm86IGFueVtdID0gW107XG5cbiAgICAvLyDmlrDnlJ/miJDnmoTmrKHmlbBcbiAgICBwdWJsaWMgcHJvZHVjZVRpbWVzOiBudW1iZXIgPSAwO1xuXG4gICAgLy8g5Y6G5Y+y5pyA6auY5YiGXG4gICAgcHVibGljIHNjb3JlUmVjb3JkOiBudW1iZXIgPSAwO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcGFyc2VEYXRhKGRhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBzdXBlci5wYXJzZURhdGEoZGF0YSk7XG5cbiAgICAgICAgdGhpcy5nYW1lSW5mbyA9IGRhdGEuZ2FtZUluZm87XG4gICAgICAgIHRoaXMuZ3JpZEluZm8gPSBkYXRhLmdyaWRJbmZvIHx8IFtcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF1dLFxuICAgICAgICAgICAgW1swLCAwLCAwXSwgWzAsIDAsIDBdLCBbMCwgMCwgMF0sIFswLCAwLCAwXSwgWzIsIDEsIDFdLCBbMiwgMSwgMV0sIFswLCAwLCAwXSwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFtbMSwgMSwgMl0sIFsxLCAxLCAzXSwgWzEsIDEsIDRdLCBbMSwgMSwgNV0sIFsxLCAxLCA2XSwgWzEsIDEsIDddLCBbMCwgMCwgMF0sIFswLCAwLCAwXV0sXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuc2NvcmVSZWNvcmQgPSBkYXRhLnNjb3JlUmVjb3JkIHx8IDA7XG5cbiAgICAgICAgdGhpcy5wcm9kdWNlKCk7XG4gICAgfVxuXG4gICAgLy8g55Sf5Lqn5qC85a2Q77yM5pyN5Yqh5Zmo6YC76L6RIOi/lOWbnuagvOW8j+S4ultncmlkc2l6ZV1bY29udGVudFR5cGVdW3VuaXF1ZUlkXVxuICAgIHByb2R1Y2UoKTogbnVtYmVyW11bXSB7XG5cbiAgICAgICAgLy8g56Gu5a6a6KaB55Sf5oiQ55qE5pWw5a2X57uE5ZCIIG5NYXggPD0gNztcbiAgICAgICAgY29uc3QgYXJyID0gW107XG4gICAgICAgIGxldCBoYXNQcm9kdWNlZERpYW1vbmQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgLy8g55Sf5oiQ5paw5qC85a2QXG4gICAgICAgICAgICBsZXQgbmV3TnVtID0gTmV3VXRpbHMucmFuZG9tSW50SW5jbHVzaXZlKDAsIDEwKTtcbiAgICAgICAgICAgIGlmIChuZXdOdW0gPj0gMCAmJiBuZXdOdW0gPCA0KSB7XG4gICAgICAgICAgICAgICAgbmV3TnVtID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3TnVtID49IDQgJiYgbmV3TnVtIDwgNikge1xuICAgICAgICAgICAgICAgIG5ld051bSA9IDE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld051bSA+PSA2ICYmIG5ld051bSA8IDgpIHtcbiAgICAgICAgICAgICAgICBuZXdOdW0gPSAyO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdOdW0gPj0gOCAmJiBuZXdOdW0gPCAxMCkge1xuICAgICAgICAgICAgICAgIG5ld051bSA9IDM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld051bSA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICBuZXdOdW0gPSA0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV3TnVtID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goWzAsIDAsIDBdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5Yik5pat5Ymp5L2Z56m66Ze05piv5ZCm5LuN54S25rKh5pyJ56m65qC85a2Q5Yy65Z+fXG4gICAgICAgICAgICAgICAgY29uc3Qgc3VyU3BhY2UgPSA4IC0gYXJyLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBlbXB0eUdyaWQgPSBhcnIuZmlsdGVyKHggPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geCAmJiB4WzFdID09PSBncmlkQ29udGVudFR5cGUuRU1QVFk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBpZiAoc3VyU3BhY2UgPD0gbmV3TnVtICYmIGVtcHR5R3JpZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdXJTcGFjZTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChbMCwgMCwgMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOepuumXtOi2s+Wkn++8jOmCo+WwseWwhuWvueW6lOaVsOmHj+eahOagvOWtkOi/m+ihjOWhq+WFhVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gdGhpcy5nZXRDb250ZW50VHlwZShoYXNQcm9kdWNlZERpYW1vbmQpO1xuICAgICAgICAgICAgICAgIGlmIChjb250ZW50VHlwZSA9PT0gZ3JpZENvbnRlbnRUeXBlLkRJQU1PTkQpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzUHJvZHVjZWREaWFtb25kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHN1clNwYWNlID49IG5ld051bSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVJbmZvLnVuaXF1ZUlkKys7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV3TnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKFtuZXdOdW0sIGNvbnRlbnRUeXBlLCB0aGlzLmdhbWVJbmZvLnVuaXF1ZUlkXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSB3aGlsZSAoYXJyLmxlbmd0aCA8IDgpO1xuXG4gICAgICAgIHRoaXMubmV4dEdyaWRJbmZvID0gYXJyO1xuICAgICAgICB0aGlzLnByb2R1Y2VUaW1lcysrO1xuICAgICAgICBjb25zb2xlLmxvZygncHJvZHVjZScsIGFycik7XG4gICAgICAgIHJldHVybiBhcnI7XG5cbiAgICAgICAgLy8gY29uc3QgYSA9IFtbMiwgMSwgMTBdLCBbMiwgMSwgMTBdLCBbMiwgMSwgMTFdLCBbMiwgMSwgMTFdLCBbMiwgMSwgMTJdLCBbMiwgMSwgMTJdLCBbMiwgMSwgMTNdLCBbMiwgMSwgMTNdXTtcbiAgICAgICAgLy8gcmV0dXJuIGE7XG4gICAgfVxuXG4gICAgLy8g6I635b6X6ZqP5py655Sf5oiQ5qC85a2Q55qE57G75Z6LXG4gICAgZ2V0Q29udGVudFR5cGUoaGFzUHJvZHVjZWREaWFtb25kOiBib29sZWFuKTogZ3JpZENvbnRlbnRUeXBlIHtcbiAgICAgICAgaWYgKGhhc1Byb2R1Y2VkRGlhbW9uZCkgcmV0dXJuIGdyaWRDb250ZW50VHlwZS5OT1JNQUw7XG4gICAgICAgIGlmICh0aGlzLnByb2R1Y2VUaW1lcyAlIDYgPT09IDAgJiYgTWF0aC5yYW5kb20oKSA8PSAwLjUpIHtcbiAgICAgICAgICAgIHJldHVybiBncmlkQ29udGVudFR5cGUuRElBTU9ORDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBncmlkQ29udGVudFR5cGUuTk9STUFMO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5qOA5p+l5ri45oiP5piv5ZCm57uT5p2fXG4gICAgY2hlY2tHYW1lT3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGlzR2FtZU92ZXIgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgdGhpcy5ncmlkSW5mb1swXS5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkSW5mb1swXVtjb2xdWzFdICE9PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgICAgICBpc0dhbWVPdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNHYW1lT3ZlcjtcbiAgICB9XG5cbiAgICAvLyDlsIbmlrDmoLzlrZDnmoTmlbDmja7ov5Tlm55cbiAgICBjb3B5TmV3R3JpZERhdGEoKTogbnVtYmVyW11bXSB7XG4gICAgICAgIGNvbnN0IG5ld0dyaWRJbmZvID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5uZXh0R3JpZEluZm8ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdyaWRJbmZvID0gWzAsIDAsIDBdO1xuICAgICAgICAgICAgZ3JpZEluZm9bMF0gPSB0aGlzLm5leHRHcmlkSW5mb1tpXVswXTtcbiAgICAgICAgICAgIGdyaWRJbmZvWzFdID0gdGhpcy5uZXh0R3JpZEluZm9baV1bMV07XG4gICAgICAgICAgICBncmlkSW5mb1syXSA9IHRoaXMubmV4dEdyaWRJbmZvW2ldWzJdO1xuICAgICAgICAgICAgbmV3R3JpZEluZm8ucHVzaChncmlkSW5mbyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld0dyaWRJbmZvO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCB6eXhHYW1lTW9kdWxlID0gbmV3IFp5eEdhbWVNb2R1bGUoKTtcbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/manager/Define.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b316ef97uJJrLtjj1+6n+lc', 'Define');
// script/merge/manager/Define.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["MOVE_COIN"] = "move_coin";
    EventType["MOVE_END"] = "move_end";
    EventType["CHECK_MERGE"] = "check_merge";
    EventType["MERGE_COIN"] = "merge_coin";
    EventType["MERGE_END"] = "merge_end";
    EventType["MOVE_CHECK_FAIL"] = "move_check_fail";
    EventType["CANCEL_SELECT"] = "CANCEL_SELECT";
    EventType["ZYX_CHECK_MERGE"] = "zyx_check_merge";
    EventType["ZYX_RESET_GAME"] = "zyx_reset_game";
    EventType["ZYX_MOVE_GRID"] = "zyx_move_grid";
})(EventType = exports.EventType || (exports.EventType = {}));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9EZWZpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBWSxTQWFYO0FBYkQsV0FBWSxTQUFTO0lBQ2pCLG9DQUF1QixDQUFBO0lBQ3ZCLGtDQUFxQixDQUFBO0lBQ3JCLHdDQUEyQixDQUFBO0lBQzNCLHNDQUF5QixDQUFBO0lBQ3pCLG9DQUF1QixDQUFBO0lBQ3ZCLGdEQUFtQyxDQUFBO0lBQ25DLDRDQUErQixDQUFBO0lBRy9CLGdEQUFtQyxDQUFBO0lBQ25DLDhDQUFpQyxDQUFBO0lBQ2pDLDRDQUErQixDQUFBO0FBQ25DLENBQUMsRUFiVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQWFwQiIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIEV2ZW50VHlwZSB7XG4gICAgTU9WRV9DT0lOID0gJ21vdmVfY29pbicsXG4gICAgTU9WRV9FTkQgPSAnbW92ZV9lbmQnLFxuICAgIENIRUNLX01FUkdFID0gJ2NoZWNrX21lcmdlJyxcbiAgICBNRVJHRV9DT0lOID0gJ21lcmdlX2NvaW4nLFxuICAgIE1FUkdFX0VORCA9ICdtZXJnZV9lbmQnLFxuICAgIE1PVkVfQ0hFQ0tfRkFJTCA9ICdtb3ZlX2NoZWNrX2ZhaWwnLFxuICAgIENBTkNFTF9TRUxFQ1QgPSAnQ0FOQ0VMX1NFTEVDVCcsXG5cblxuICAgIFpZWF9DSEVDS19NRVJHRSA9ICd6eXhfY2hlY2tfbWVyZ2UnLFxuICAgIFpZWF9SRVNFVF9HQU1FID0gJ3p5eF9yZXNldF9nYW1lJyxcbiAgICBaWVhfTU9WRV9HUklEID0gJ3p5eF9tb3ZlX2dyaWQnLFxufVxuXG4vLyDllYblk4Hkv6Hmga9cbmV4cG9ydCB0eXBlIEdvb2RzVHlwZSA9IHtcbiAgICBpZDogbnVtYmVyLFxuICAgIHN0YXI6IG51bWJlcixcbiAgICB0b3RhbDogbnVtYmVyLFxuICAgIHVzZWQ6IG51bWJlcixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgZGVzYzogc3RyaW5nLFxuICAgIHVybDogc3RyaW5nLFxufSJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/pulicCom/TouchEffect.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ba1070sT7NPqKINxiKgj14u', 'TouchEffect');
// script/merge/pulicCom/TouchEffect.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var TouchEffect = /** @class */ (function (_super) {
    __extends(TouchEffect, _super);
    function TouchEffect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.scaleTime = 0.07;
        _this.initScaleX = 1;
        _this.initScaleY = 1;
        _this.dS = 0.9;
        return _this;
        // update (dt) {}
    }
    TouchEffect.prototype.onLoad = function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    };
    TouchEffect.prototype.start = function () {
        this.initScaleX = this.node.scaleX;
        this.initScaleY = this.node.scaleY;
        cc.tween(this.node).stop();
    };
    TouchEffect.prototype.onTouchStart = function () {
        var tarScaleX = this.node.scaleX * 0.9;
        var tarScaleY = this.node.scaleY * 0.9;
        cc.tween(this.node)
            .to(this.scaleTime, { scaleX: tarScaleX, scaleY: tarScaleY })
            .to(this.scaleTime, { scaleX: this.initScaleX, scaleY: this.initScaleY })
            .start();
    };
    TouchEffect.prototype.onTouchEnd = function () {
        cc.tween(this.node)
            .to(this.scaleTime, { scaleX: this.initScaleX, scaleY: this.initScaleY })
            .start();
    };
    __decorate([
        property()
    ], TouchEffect.prototype, "scaleTime", void 0);
    TouchEffect = __decorate([
        ccclass
    ], TouchEffect);
    return TouchEffect;
}(cc.Component));
exports.default = TouchEffect;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvcHVsaWNDb20vVG91Y2hFZmZlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU0sSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFHNUM7SUFBeUMsK0JBQVk7SUFBckQ7UUFBQSxxRUFvQ0M7UUFsQ1csZUFBUyxHQUFXLElBQUksQ0FBQztRQUV6QixnQkFBVSxHQUFHLENBQUMsQ0FBQztRQUNmLGdCQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRWYsUUFBRSxHQUFHLEdBQUcsQ0FBQzs7UUE0QmpCLGlCQUFpQjtJQUNyQixDQUFDO0lBM0JHLDRCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxvRUFBb0U7SUFDeEUsQ0FBQztJQUVELDJCQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDbkMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVELGtDQUFZLEdBQVo7UUFDSSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDekMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ3pDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNkLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7YUFDNUQsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ3hFLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxnQ0FBVSxHQUFWO1FBQ0ksRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2QsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ3hFLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUEvQkQ7UUFEQyxRQUFRLEVBQUU7a0RBQ3NCO0lBRmhCLFdBQVc7UUFEL0IsT0FBTztPQUNhLFdBQVcsQ0FvQy9CO0lBQUQsa0JBQUM7Q0FwQ0QsQUFvQ0MsQ0FwQ3dDLEVBQUUsQ0FBQyxTQUFTLEdBb0NwRDtrQkFwQ29CLFdBQVciLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG91Y2hFZmZlY3QgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIEBwcm9wZXJ0eSgpXG4gICAgcHJpdmF0ZSBzY2FsZVRpbWU6IG51bWJlciA9IDAuMDc7XG5cbiAgICBwcml2YXRlIGluaXRTY2FsZVggPSAxO1xuICAgIHByaXZhdGUgaW5pdFNjYWxlWSA9IDE7XG5cbiAgICBwcml2YXRlIGRTID0gMC45O1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIHRoaXMub25Ub3VjaFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgLy8gdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vblRvdWNoRW5kLCB0aGlzKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5pbml0U2NhbGVYID0gdGhpcy5ub2RlLnNjYWxlWDtcbiAgICAgICAgdGhpcy5pbml0U2NhbGVZID0gdGhpcy5ub2RlLnNjYWxlWTtcbiAgICAgICAgY2MudHdlZW4odGhpcy5ub2RlKS5zdG9wKCk7XG4gICAgfVxuXG4gICAgb25Ub3VjaFN0YXJ0KCkge1xuICAgICAgICBjb25zdCB0YXJTY2FsZVggPSB0aGlzLm5vZGUuc2NhbGVYICogMC45O1xuICAgICAgICBjb25zdCB0YXJTY2FsZVkgPSB0aGlzLm5vZGUuc2NhbGVZICogMC45O1xuICAgICAgICBjYy50d2Vlbih0aGlzLm5vZGUpXG4gICAgICAgICAgICAudG8odGhpcy5zY2FsZVRpbWUsIHsgc2NhbGVYOiB0YXJTY2FsZVgsIHNjYWxlWTogdGFyU2NhbGVZIH0pXG4gICAgICAgICAgICAudG8odGhpcy5zY2FsZVRpbWUsIHsgc2NhbGVYOiB0aGlzLmluaXRTY2FsZVgsIHNjYWxlWTogdGhpcy5pbml0U2NhbGVZIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBvblRvdWNoRW5kKCkge1xuICAgICAgICBjYy50d2Vlbih0aGlzLm5vZGUpXG4gICAgICAgICAgICAudG8odGhpcy5zY2FsZVRpbWUsIHsgc2NhbGVYOiB0aGlzLmluaXRTY2FsZVgsIHNjYWxlWTogdGhpcy5pbml0U2NhbGVZIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgKGR0KSB7fVxufVxuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/util/NewUtils.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '85100MR3/pMT5YtpOTF2CAl', 'NewUtils');
// script/merge/util/NewUtils.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NewUtils = /** @class */ (function () {
    function NewUtils() {
    }
    /**
     * 深拷贝
     * @example
     * let src = { a: 123, b: { c: [1, 2, 3], d: "ceshi" } };
     * let tar = Util.deepClone(src);
     * tar.b.c[0] = 2;
     * console.log(`obj:`, tar, `src:`, src);
     */
    NewUtils.deepClone = function (obj, cache) {
        if (cache === void 0) { cache = new WeakMap(); }
        // 普通类型，直接返回
        if (typeof obj !== 'object')
            return obj;
        if (obj === null)
            return obj;
        // 防止循环引用，程序进入死循环
        if (cache.get(obj))
            return cache.get(obj);
        if (obj instanceof Date)
            return new Date(obj);
        if (obj instanceof RegExp)
            return new RegExp(obj);
        // 找到所属原型上的constructor，所属原型上的constructor指向当前对象的构造函数
        var cloneObj = new obj.constructor();
        // 缓存拷贝的对象，用于处理循环引用的情况
        cache.set(obj, cloneObj);
        for (var key in obj) {
            if (obj[key]) {
                cloneObj[key] = this.deepClone(obj[key], cache); // 递归拷贝
            }
        }
        return cloneObj;
    };
    NewUtils.randomIntInclusive = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    // 去重 - 随机生成指定数量指定区间的数组
    NewUtils.randomIntArrFromSection = function (cnt, min, max) {
        var result = [];
        do {
            var v = this.randomIntInclusive(min, max);
            if (result.indexOf(v) === -1) {
                result.push(v);
            }
        } while (result.length < cnt);
        return result;
    };
    // 不去重 - 随机生成指定数量指定区间的数组
    NewUtils.randomIntArrInclusive = function (cnt, min, max) {
        var result = [];
        do {
            result.push(this.randomIntInclusive(min, max));
        } while (result.length < cnt);
        return result;
    };
    // 从给定的数组中随机生成一组指定数量的数组
    NewUtils.randomIntArrFromArr = function (cnt, srcArr) {
        var result = [];
        do {
            var index = this.randomIntInclusive(0, srcArr.length - 1);
            result.push(srcArr[index]);
        } while (result.length < cnt);
        return result;
    };
    // 计算数组元素之和
    NewUtils.sumArrayNum = function (arr) {
        var sum = 0;
        for (var i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    };
    // 替换spriteFrame
    NewUtils.setSpriteFrameByUrl = function (node, url) {
        cc.resources.load(url, cc.SpriteFrame, (function (err, spriteFrame) {
            if (err) {
                console.error('url:', url, '/err:');
                return;
            }
            node.spriteFrame = spriteFrame;
        }));
    };
    return NewUtils;
}());
exports.default = NewUtils;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9OZXdVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0lBQUE7SUEwRkEsQ0FBQztJQXpGRzs7Ozs7OztPQU9HO0lBQ0ksa0JBQVMsR0FBaEIsVUFBaUIsR0FBRyxFQUFFLEtBQXFCO1FBQXJCLHNCQUFBLEVBQUEsWUFBWSxPQUFPLEVBQUU7UUFDdkMsWUFBWTtRQUNaLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUTtZQUFFLE9BQU8sR0FBRyxDQUFDO1FBQ3hDLElBQUksR0FBRyxLQUFLLElBQUk7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUU3QixpQkFBaUI7UUFDakIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxJQUFJLEdBQUcsWUFBWSxJQUFJO1lBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxJQUFJLEdBQUcsWUFBWSxNQUFNO1lBQUUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVsRCxtREFBbUQ7UUFDbkQsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkMsc0JBQXNCO1FBQ3RCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pCLEtBQUssSUFBTSxHQUFHLElBQUksR0FBRyxFQUFFO1lBQ25CLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNWLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU87YUFDM0Q7U0FDSjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTSwy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ZmF1bHQgY2xhc3MgTmV3VXRpbHMge1xuICAgIC8qKlxuICAgICAqIOa3seaLt+i0nVxuICAgICAqIEBleGFtcGxlXG4gICAgICogbGV0IHNyYyA9IHsgYTogMTIzLCBiOiB7IGM6IFsxLCAyLCAzXSwgZDogXCJjZXNoaVwiIH0gfTtcbiAgICAgKiBsZXQgdGFyID0gVXRpbC5kZWVwQ2xvbmUoc3JjKTtcbiAgICAgKiB0YXIuYi5jWzBdID0gMjtcbiAgICAgKiBjb25zb2xlLmxvZyhgb2JqOmAsIHRhciwgYHNyYzpgLCBzcmMpO1xuICAgICAqL1xuICAgIHN0YXRpYyBkZWVwQ2xvbmUob2JqLCBjYWNoZSA9IG5ldyBXZWFrTWFwKCkpIHtcbiAgICAgICAgLy8g5pmu6YCa57G75Z6L77yM55u05o6l6L+U5ZueXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JykgcmV0dXJuIG9iajtcbiAgICAgICAgaWYgKG9iaiA9PT0gbnVsbCkgcmV0dXJuIG9iajtcblxuICAgICAgICAvLyDpmLLmraLlvqrnjq/lvJXnlKjvvIznqIvluo/ov5vlhaXmrbvlvqrnjq9cbiAgICAgICAgaWYgKGNhY2hlLmdldChvYmopKSByZXR1cm4gY2FjaGUuZ2V0KG9iaik7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gbmV3IERhdGUob2JqKTtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIG5ldyBSZWdFeHAob2JqKTtcblxuICAgICAgICAvLyDmib7liLDmiYDlsZ7ljp/lnovkuIrnmoRjb25zdHJ1Y3Rvcu+8jOaJgOWxnuWOn+Wei+S4iueahGNvbnN0cnVjdG9y5oyH5ZCR5b2T5YmN5a+56LGh55qE5p6E6YCg5Ye95pWwXG4gICAgICAgIGNvbnN0IGNsb25lT2JqID0gbmV3IG9iai5jb25zdHJ1Y3RvcigpO1xuICAgICAgICAvLyDnvJPlrZjmi7fotJ3nmoTlr7nosaHvvIznlKjkuo7lpITnkIblvqrnjq/lvJXnlKjnmoTmg4XlhrVcbiAgICAgICAgY2FjaGUuc2V0KG9iaiwgY2xvbmVPYmopO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmpba2V5XSkge1xuICAgICAgICAgICAgICAgIGNsb25lT2JqW2tleV0gPSB0aGlzLmRlZXBDbG9uZShvYmpba2V5XSwgY2FjaGUpOyAvLyDpgJLlvZLmi7fotJ1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjbG9uZU9iajtcbiAgICB9XG5cbiAgICBzdGF0aWMgcmFuZG9tSW50SW5jbHVzaXZlKG1pbiwgbWF4KTogbnVtYmVyIHtcbiAgICAgICAgbWluID0gTWF0aC5jZWlsKG1pbik7XG4gICAgICAgIG1heCA9IE1hdGguZmxvb3IobWF4KTtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gICAgfVxuXG4gICAgLy8g5Y676YeNIC0g6ZqP5py655Sf5oiQ5oyH5a6a5pWw6YeP5oyH5a6a5Yy66Ze055qE5pWw57uEXG4gICAgc3RhdGljIHJhbmRvbUludEFyckZyb21TZWN0aW9uKGNudDogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXJbXSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5yYW5kb21JbnRJbmNsdXNpdmUobWluLCBtYXgpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKHYpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChyZXN1bHQubGVuZ3RoIDwgY250KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIOS4jeWOu+mHjSAtIOmaj+acuueUn+aIkOaMh+WumuaVsOmHj+aMh+WumuWMuumXtOeahOaVsOe7hFxuICAgIHN0YXRpYyByYW5kb21JbnRBcnJJbmNsdXNpdmUoY250LCBtaW4sIG1heCk6IG51bWJlcltdIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMucmFuZG9tSW50SW5jbHVzaXZlKG1pbiwgbWF4KSk7XG4gICAgICAgIH0gd2hpbGUgKHJlc3VsdC5sZW5ndGggPCBjbnQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIOS7jue7meWumueahOaVsOe7hOS4remaj+acuueUn+aIkOS4gOe7hOaMh+WumuaVsOmHj+eahOaVsOe7hFxuICAgIHN0YXRpYyByYW5kb21JbnRBcnJGcm9tQXJyKGNudCwgc3JjQXJyKTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnJhbmRvbUludEluY2x1c2l2ZSgwLCBzcmNBcnIubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaChzcmNBcnJbaW5kZXhdKTtcbiAgICAgICAgfSB3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IGNudCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g6K6h566X5pWw57uE5YWD57Sg5LmL5ZKMXG4gICAgc3RhdGljIHN1bUFycmF5TnVtKGFycjogbnVtYmVyW10pOiBudW1iZXIge1xuICAgICAgICBsZXQgc3VtID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBhcnJbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1bTtcbiAgICB9XG5cbiAgICAvLyDmm7/mjaJzcHJpdGVGcmFtZVxuICAgIHN0YXRpYyBzZXRTcHJpdGVGcmFtZUJ5VXJsKG5vZGU6IGNjLlNwcml0ZSwgdXJsOiBzdHJpbmcpIHtcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQodXJsLCBjYy5TcHJpdGVGcmFtZSwgKChlcnIsIHNwcml0ZUZyYW1lOiBjYy5TcHJpdGVGcmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3VybDonLCB1cmwsICcvZXJyOicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbm9kZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICB9KSk7XG4gICAgfVxufVxuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/DataModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'a9783XxZiJAGobx47+4NsqL', 'DataModule');
// script/merge/dataModule/DataModule.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataModule = /** @class */ (function () {
    function DataModule() {
        this.mData = null;
    }
    DataModule.prototype.parseData = function (data) {
        this.mData = data;
    };
    return DataModule;
}());
exports.default = DataModule;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9EYXRhTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7SUFHSTtRQUZPLFVBQUssR0FBRyxJQUFJLENBQUM7SUFFRyxDQUFDO0lBRXhCLDhCQUFTLEdBQVQsVUFBVSxJQUFTO1FBQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FSQSxBQVFDLElBQUEiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRhTW9kdWxlIHtcbiAgICBwdWJsaWMgbURhdGEgPSBudWxsO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCkgeyB9XG5cbiAgICBwYXJzZURhdGEoZGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMubURhdGEgPSBkYXRhO1xuICAgIH1cbn1cbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/MergeScene.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '0af54diud5JN6SYpIPIvcRc', 'MergeScene');
// script/merge/game/MergeScene.ts

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
var TypeDefine_1 = require("../define/TypeDefine");
var AudioMgr_1 = require("../manager/AudioMgr");
var Uimanager_1 = require("../manager/Uimanager");
var WxApiManager_1 = require("../util/WxApiManager");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var MergeScene = /** @class */ (function (_super) {
    __extends(MergeScene, _super);
    function MergeScene() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uBtnStart = null;
        return _this;
    }
    MergeScene.prototype.onLoad = function () {
        console.log('load mergeScene');
        this.uBtnStart.on(cc.Node.EventType.TOUCH_END, this.onStart, this);
        this.uBtnStart.active = false;
    };
    MergeScene.prototype.start = function () {
        var _this = this;
        // 初始化界面层级
        Uimanager_1.uimanager.init(this.node);
        // login
        PlayerModule_1.playerModule.login(function () {
            // 初始化音频
            AudioMgr_1.audioMgr.init();
            // 初始化界面UI
            _this.initUI();
        });
        WxApiManager_1.wxApiManager.onShow();
        WxApiManager_1.wxApiManager.onHide();
    };
    MergeScene.prototype.update = function () {
        Uimanager_1.uimanager.udpateLayerShow();
    };
    MergeScene.prototype.onStart = function () {
        this.initGamePanel();
    };
    // 初始化游戏主场景信息
    MergeScene.prototype.initUI = function () {
        this.uBtnStart.active = true;
        this.initTopCom();
    };
    MergeScene.prototype.initTopCom = function () {
        return __awaiter(this, void 0, void 0, function () {
            var topPre, topNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/zyx/uComTop')];
                    case 1:
                        topPre = _a.sent();
                        topNode = cc.instantiate(topPre);
                        Uimanager_1.uimanager.add(topNode, TypeDefine_1.LAYER.UI);
                        topNode.setPosition(new cc.Vec2(0, 0));
                        return [2 /*return*/];
                }
            });
        });
    };
    // 初始化游戏界面
    MergeScene.prototype.initGamePanel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prefab, gameNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.ZYX_DROP);
                        return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/merge/game')];
                    case 1:
                        prefab = _a.sent();
                        gameNode = cc.instantiate(prefab);
                        Uimanager_1.uimanager.add(gameNode, TypeDefine_1.LAYER.UI);
                        gameNode.setPosition(new cc.Vec2(0, 0));
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        property(cc.Node)
    ], MergeScene.prototype, "uBtnStart", void 0);
    MergeScene = __decorate([
        ccclass
    ], MergeScene);
    return MergeScene;
}(cc.Component));
exports.default = MergeScene;
/**
 *      1、合成数字15获得1个星星，顶部显示当前星星持有总数；
 *          当合成8之前，每次发放5个，类型为2个，数字区间固定在1~7之间；
 *          当合成8之后，每次发放6个，类型为3个，数字区间固定在min~7之间；
 *          当合成10之后，每次发放7个，类型为4个，数字区间固定在min~8之间；
 *          当合成12之后，每次发放10个，类型为5个，数字区间固定在min~10之间；
 *
 *          防作弊：
 *          当今日全服合成星星总数量 > 100 || 当人单日合成总星星 > 5， 合成12后，每次发放15个，类型为7个，数字区间min~10;(趋近于无法继续达成，控制放出总量);
 *
 *
 *      2、清理规则
 *          每局可以免费整理一次；
 *          每局可以通过分享功能一次整理；
 *          每局可以通过看视频完成一次整理；
 *          以上所有方式用过后，还可以通过刷新道具整理；
 *          刷新道具可以通过邀请获得，每邀请1个人，赠送一个刷新道具，刷新道具也可以通过星星兑换获得；
 *      7、商品清单滚动播放：4个刷新道具需要1个星星、1箱金典牛奶29个星星，1包心相印湿巾需要5个星星，1本DK百科全书30个星星...商品横向滚动展示清单最右侧保留“更多奖励”按钮；
 *      8、选择实物兑换后，兑换页面填写“收件人、收件地址、联系方式”，并在确认兑换前，弹出确认收货信息的确认单以及不退不换的声明；
 *      9、添加规则页面，规则页面添加免责声明，以及不退换声明；
 *      10、添加历史星星总获得数排行榜；
 */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9NZXJnZVNjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUEwRDtBQUMxRCxtREFBNkM7QUFDN0MsZ0RBQTBEO0FBQzFELGtEQUFpRDtBQUNqRCxxREFBb0Q7QUFFOUMsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFHNUM7SUFBd0MsOEJBQVk7SUFBcEQ7UUFBQSxxRUE0REM7UUF6REcsZUFBUyxHQUFZLElBQUksQ0FBQzs7SUF5RDlCLENBQUM7SUF2REcsMkJBQU0sR0FBTjtRQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDbEMsQ0FBQztJQUVELDBCQUFLLEdBQUw7UUFBQSxpQkFlQztRQWRHLFVBQVU7UUFDVixxQkFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFMUIsUUFBUTtRQUNSLDJCQUFZLENBQUMsS0FBSyxDQUFDO1lBQ2YsUUFBUTtZQUNSLG1CQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFaEIsVUFBVTtZQUNWLEtBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQTtRQUVGLDJCQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEIsMkJBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsMkJBQU0sR0FBTjtRQUNJLHFCQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELDRCQUFPLEdBQVA7UUFDSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUdELGFBQWE7SUFDYiwyQkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUssK0JBQVUsR0FBaEI7Ozs7OzRCQUNtQixxQkFBTSxxQkFBUyxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFBOzt3QkFBekQsTUFBTSxHQUFHLFNBQWdEO3dCQUN6RCxPQUFPLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDdkMscUJBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGtCQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ2pDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUMxQztJQUVELFVBQVU7SUFDSixrQ0FBYSxHQUFuQjs7Ozs7O3dCQUNJLG1CQUFRLENBQUMsU0FBUyxDQUFDLG9CQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3hCLHFCQUFNLHFCQUFTLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEVBQUE7O3dCQUF4RCxNQUFNLEdBQUcsU0FBK0M7d0JBQ3hELFFBQVEsR0FBWSxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNqRCxxQkFBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDbEMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQzNDO0lBdEREO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7aURBQ1E7SUFIVCxVQUFVO1FBRDlCLE9BQU87T0FDYSxVQUFVLENBNEQ5QjtJQUFELGlCQUFDO0NBNURELEFBNERDLENBNUR1QyxFQUFFLENBQUMsU0FBUyxHQTREbkQ7a0JBNURvQixVQUFVO0FBOEQvQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGxheWVyTW9kdWxlIH0gZnJvbSAnLi4vZGF0YU1vZHVsZS9QbGF5ZXJNb2R1bGUnO1xuaW1wb3J0IHsgTEFZRVIgfSBmcm9tICcuLi9kZWZpbmUvVHlwZURlZmluZSc7XG5pbXBvcnQgeyBhdWRpb01nciwgU291bmRUeXBlIH0gZnJvbSAnLi4vbWFuYWdlci9BdWRpb01ncic7XG5pbXBvcnQgeyB1aW1hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2VyL1VpbWFuYWdlcic7XG5pbXBvcnQgeyB3eEFwaU1hbmFnZXIgfSBmcm9tICcuLi91dGlsL1d4QXBpTWFuYWdlcic7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXJnZVNjZW5lIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCdG5TdGFydDogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdsb2FkIG1lcmdlU2NlbmUnKTtcbiAgICAgICAgdGhpcy51QnRuU3RhcnQub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uU3RhcnQsIHRoaXMpO1xuICAgICAgICB0aGlzLnVCdG5TdGFydC5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgLy8g5Yid5aeL5YyW55WM6Z2i5bGC57qnXG4gICAgICAgIHVpbWFuYWdlci5pbml0KHRoaXMubm9kZSk7XG5cbiAgICAgICAgLy8gbG9naW5cbiAgICAgICAgcGxheWVyTW9kdWxlLmxvZ2luKCgpID0+IHtcbiAgICAgICAgICAgIC8vIOWIneWni+WMlumfs+mikVxuICAgICAgICAgICAgYXVkaW9NZ3IuaW5pdCgpO1xuXG4gICAgICAgICAgICAvLyDliJ3lp4vljJbnlYzpnaJVSVxuICAgICAgICAgICAgdGhpcy5pbml0VUkoKTtcbiAgICAgICAgfSlcblxuICAgICAgICB3eEFwaU1hbmFnZXIub25TaG93KCk7XG4gICAgICAgIHd4QXBpTWFuYWdlci5vbkhpZGUoKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHVpbWFuYWdlci51ZHBhdGVMYXllclNob3coKTtcbiAgICB9XG5cbiAgICBvblN0YXJ0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmluaXRHYW1lUGFuZWwoKTtcbiAgICB9XG5cblxuICAgIC8vIOWIneWni+WMlua4uOaIj+S4u+WcuuaZr+S/oeaBr1xuICAgIGluaXRVSSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51QnRuU3RhcnQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbml0VG9wQ29tKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdFRvcENvbSgpIHtcbiAgICAgICAgY29uc3QgdG9wUHJlID0gYXdhaXQgdWltYW5hZ2VyLmxvYWRQcmVmYWIoJ3ByZWZhYi96eXgvdUNvbVRvcCcpO1xuICAgICAgICBjb25zdCB0b3BOb2RlID0gY2MuaW5zdGFudGlhdGUodG9wUHJlKTtcbiAgICAgICAgdWltYW5hZ2VyLmFkZCh0b3BOb2RlLCBMQVlFUi5VSSk7XG4gICAgICAgIHRvcE5vZGUuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoMCwgMCkpO1xuICAgIH1cblxuICAgIC8vIOWIneWni+WMlua4uOaIj+eVjOmdolxuICAgIGFzeW5jIGluaXRHYW1lUGFuZWwoKSB7XG4gICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuWllYX0RST1ApO1xuICAgICAgICBjb25zdCBwcmVmYWIgPSBhd2FpdCB1aW1hbmFnZXIubG9hZFByZWZhYigncHJlZmFiL21lcmdlL2dhbWUnKTtcbiAgICAgICAgY29uc3QgZ2FtZU5vZGU6IGNjLk5vZGUgPSBjYy5pbnN0YW50aWF0ZShwcmVmYWIpO1xuICAgICAgICB1aW1hbmFnZXIuYWRkKGdhbWVOb2RlLCBMQVlFUi5VSSk7XG4gICAgICAgIGdhbWVOb2RlLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKDAsIDApKTtcbiAgICB9XG5cblxufVxuXG4vKipcbiAqICAgICAgMeOAgeWQiOaIkOaVsOWtlzE16I635b6XMeS4quaYn+aYn++8jOmhtumDqOaYvuekuuW9k+WJjeaYn+aYn+aMgeacieaAu+aVsO+8m1xuICogICAgICAgICAg5b2T5ZCI5oiQOOS5i+WJje+8jOavj+asoeWPkeaUvjXkuKrvvIznsbvlnovkuLoy5Liq77yM5pWw5a2X5Yy66Ze05Zu65a6a5ZyoMX435LmL6Ze077ybXG4gKiAgICAgICAgICDlvZPlkIjmiJA45LmL5ZCO77yM5q+P5qyh5Y+R5pS+NuS4qu+8jOexu+Wei+S4ujPkuKrvvIzmlbDlrZfljLrpl7Tlm7rlrprlnKhtaW5+N+S5i+mXtO+8m1xuICogICAgICAgICAg5b2T5ZCI5oiQMTDkuYvlkI7vvIzmr4/mrKHlj5HmlL435Liq77yM57G75Z6L5Li6NOS4qu+8jOaVsOWtl+WMuumXtOWbuuWumuWcqG1pbn445LmL6Ze077ybXG4gKiAgICAgICAgICDlvZPlkIjmiJAxMuS5i+WQju+8jOavj+asoeWPkeaUvjEw5Liq77yM57G75Z6L5Li6NeS4qu+8jOaVsOWtl+WMuumXtOWbuuWumuWcqG1pbn4xMOS5i+mXtO+8m1xuICpcbiAqICAgICAgICAgIOmYsuS9nOW8iu+8mlxuICogICAgICAgICAg5b2T5LuK5pel5YWo5pyN5ZCI5oiQ5pif5pif5oC75pWw6YePID4gMTAwIHx8IOW9k+S6uuWNleaXpeWQiOaIkOaAu+aYn+aYnyA+IDXvvIwg5ZCI5oiQMTLlkI7vvIzmr4/mrKHlj5HmlL4xNeS4qu+8jOexu+Wei+S4ujfkuKrvvIzmlbDlrZfljLrpl7RtaW5+MTA7KOi2i+i/keS6juaXoOazlee7p+e7rei+vuaIkO+8jOaOp+WItuaUvuWHuuaAu+mHjyk7XG4gKlxuICpcbiAqICAgICAgMuOAgea4heeQhuinhOWImVxuICogICAgICAgICAg5q+P5bGA5Y+v5Lul5YWN6LS55pW055CG5LiA5qyh77ybXG4gKiAgICAgICAgICDmr4/lsYDlj6/ku6XpgJrov4fliIbkuqvlip/og73kuIDmrKHmlbTnkIbvvJtcbiAqICAgICAgICAgIOavj+WxgOWPr+S7pemAmui/h+eci+inhumikeWujOaIkOS4gOasoeaVtOeQhu+8m1xuICogICAgICAgICAg5Lul5LiK5omA5pyJ5pa55byP55So6L+H5ZCO77yM6L+Y5Y+v5Lul6YCa6L+H5Yi35paw6YGT5YW35pW055CG77ybXG4gKiAgICAgICAgICDliLfmlrDpgZPlhbflj6/ku6XpgJrov4fpgoDor7fojrflvpfvvIzmr4/pgoDor7cx5Liq5Lq677yM6LWg6YCB5LiA5Liq5Yi35paw6YGT5YW377yM5Yi35paw6YGT5YW35Lmf5Y+v5Lul6YCa6L+H5pif5pif5YWR5o2i6I635b6X77ybXG4gKiAgICAgIDfjgIHllYblk4HmuIXljZXmu5rliqjmkq3mlL7vvJo05Liq5Yi35paw6YGT5YW36ZyA6KaBMeS4quaYn+aYn+OAgTHnrrHph5HlhbjniZvlpbYyOeS4quaYn+aYn++8jDHljIXlv4Pnm7jljbDmub/lt77pnIDopoE15Liq5pif5pif77yMMeacrERL55m+56eR5YWo5LmmMzDkuKrmmJ/mmJ8uLi7llYblk4HmqKrlkJHmu5rliqjlsZXnpLrmuIXljZXmnIDlj7Pkvqfkv53nlZnigJzmm7TlpJrlpZblirHigJ3mjInpkq7vvJtcbiAqICAgICAgOOOAgemAieaLqeWunueJqeWFkeaNouWQju+8jOWFkeaNoumhtemdouWhq+WGmeKAnOaUtuS7tuS6uuOAgeaUtuS7tuWcsOWdgOOAgeiBlOezu+aWueW8j+KAne+8jOW5tuWcqOehruiupOWFkeaNouWJje+8jOW8ueWHuuehruiupOaUtui0p+S/oeaBr+eahOehruiupOWNleS7peWPiuS4jemAgOS4jeaNoueahOWjsOaYju+8m1xuICogICAgICA544CB5re75Yqg6KeE5YiZ6aG16Z2i77yM6KeE5YiZ6aG16Z2i5re75Yqg5YWN6LSj5aOw5piO77yM5Lul5Y+K5LiN6YCA5o2i5aOw5piO77ybXG4gKiAgICAgIDEw44CB5re75Yqg5Y6G5Y+y5pif5pif5oC76I635b6X5pWw5o6S6KGM5qac77ybXG4gKi9cbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/Coin.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '6cba59FrPtA0YaVzatN4FVJ', 'Coin');
// script/merge/game/Coin.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Coin = /** @class */ (function (_super) {
    __extends(Coin, _super);
    function Coin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblNum = null;
        _this.uImgBg = null;
        return _this;
        // update (dt) {}
    }
    Coin.prototype.onLoad = function () {
        this.ulblNum.string = '-';
    };
    Coin.prototype.init = function (slotIdx, cnt, cb) {
        var _this = this;
        var url = "images/coin/" + cnt;
        cc.resources.load(url, cc.SpriteFrame, (function (err, spriteFrame) {
            if (err) {
                console.error('url:', url, '/err:');
                return;
            }
            _this.uImgBg.spriteFrame = spriteFrame;
            cb && cb();
        }));
        // this.ulblNum.string = `${slotIdx}-${cnt}`;
        this.ulblNum.string = "" + cnt;
    };
    Coin.prototype.start = function () {
    };
    __decorate([
        property(cc.Label)
    ], Coin.prototype, "ulblNum", void 0);
    __decorate([
        property(cc.Sprite)
    ], Coin.prototype, "uImgBg", void 0);
    Coin = __decorate([
        ccclass
    ], Coin);
    return Coin;
}(cc.Component));
exports.default = Coin;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9Db2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRzVDO0lBQWtDLHdCQUFZO0lBQTlDO1FBQUEscUVBZ0NDO1FBOUJPLGFBQU8sR0FBYSxJQUFJLENBQUM7UUFHekIsWUFBTSxHQUFjLElBQUksQ0FBQzs7UUEwQjdCLGlCQUFpQjtJQUNyQixDQUFDO0lBekJHLHFCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7SUFDOUIsQ0FBQztJQUVELG1CQUFJLEdBQUosVUFBSyxPQUFlLEVBQUUsR0FBVyxFQUFFLEVBQVc7UUFBOUMsaUJBY0M7UUFiRyxJQUFNLEdBQUcsR0FBVyxpQkFBZSxHQUFLLENBQUM7UUFDekMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFDLEdBQUcsRUFBRSxXQUEyQjtZQUNyRSxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3BDLE9BQU87YUFDVjtZQUVELEtBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUN0QyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUE7UUFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosNkNBQTZDO1FBQzdDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUcsR0FBSyxDQUFDO0lBQ25DLENBQUM7SUFFRCxvQkFBSyxHQUFMO0lBRUEsQ0FBQztJQTNCRztRQURILFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO3lDQUNVO0lBR3pCO1FBREgsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7d0NBQ1M7SUFMWixJQUFJO1FBRHhCLE9BQU87T0FDYSxJQUFJLENBZ0N4QjtJQUFELFdBQUM7Q0FoQ0QsQUFnQ0MsQ0FoQ2lDLEVBQUUsQ0FBQyxTQUFTLEdBZ0M3QztrQkFoQ29CLElBQUkiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29pbiBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgICAgICB1bGJsTnVtOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuU3ByaXRlKVxuICAgICAgICB1SW1nQmc6IGNjLlNwcml0ZSA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMudWxibE51bS5zdHJpbmcgPSAnLSc7XG4gICAgfVxuXG4gICAgaW5pdChzbG90SWR4OiBudW1iZXIsIGNudDogbnVtYmVyLCBjYjpGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGBpbWFnZXMvY29pbi8ke2NudH1gO1xuICAgICAgICBjYy5yZXNvdXJjZXMubG9hZCh1cmwsIGNjLlNwcml0ZUZyYW1lLCAoKGVyciwgc3ByaXRlRnJhbWU6IGNjLlNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigndXJsOicsIHVybCwgJy9lcnI6Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVJbWdCZy5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgY2IgJiYgY2IoKVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gdGhpcy51bGJsTnVtLnN0cmluZyA9IGAke3Nsb3RJZHh9LSR7Y250fWA7XG4gICAgICAgIHRoaXMudWxibE51bS5zdHJpbmcgPSBgJHtjbnR9YDtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcblxuICAgIH1cblxuICAgIC8vIHVwZGF0ZSAoZHQpIHt9XG59XG4iXX0=
//------QC-SOURCE-SPLIT------

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
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/MergeProgress.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '77cddiCwBxKFLf9oKyUt+gA', 'MergeProgress');
// script/merge/game/MergeProgress.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
var GameModule_1 = require("../dataModule/GameModule");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var MergeProgress = /** @class */ (function (_super) {
    __extends(MergeProgress, _super);
    function MergeProgress() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblTar = null;
        _this.uImgBar = null;
        return _this;
    }
    MergeProgress.prototype.onLoad = function () {
        this.uImgBar.width = 0;
        this.ulblTar.node.color = new cc.Color().fromHEX('#4b91e4');
    };
    MergeProgress.prototype.updateProress = function () {
        var totalW = 585;
        var tar = GameModule_1.gameModule.getMaxValue();
        var tarW = Math.floor(tar / 15 * totalW);
        cc.tween(this.uImgBar)
            .to(0.3, { width: tarW }, { easing: cc.easing.cubicInOut })
            .start();
    };
    __decorate([
        property(cc.Label)
    ], MergeProgress.prototype, "ulblTar", void 0);
    __decorate([
        property(cc.Node)
    ], MergeProgress.prototype, "uImgBar", void 0);
    MergeProgress = __decorate([
        ccclass
    ], MergeProgress);
    return MergeProgress;
}(cc.Component));
exports.default = MergeProgress;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9NZXJnZVByb2dyZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEQUFzRDtBQUVoRCxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUEyQyxpQ0FBWTtJQUF2RDtRQUFBLHFFQXNCQztRQW5CRyxhQUFPLEdBQWEsSUFBSSxDQUFDO1FBR3pCLGFBQU8sR0FBWSxJQUFJLENBQUM7O0lBZ0I1QixDQUFDO0lBZEcsOEJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxxQ0FBYSxHQUFiO1FBQ0ksSUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ25CLElBQU0sR0FBRyxHQUFHLHVCQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUNqQixFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDMUQsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQWpCRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2tEQUNNO0lBR3pCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7a0RBQ007SUFOUCxhQUFhO1FBRGpDLE9BQU87T0FDYSxhQUFhLENBc0JqQztJQUFELG9CQUFDO0NBdEJELEFBc0JDLENBdEIwQyxFQUFFLENBQUMsU0FBUyxHQXNCdEQ7a0JBdEJvQixhQUFhIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2FtZU1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL0dhbWVNb2R1bGVcIjtcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lcmdlUHJvZ3Jlc3MgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxUYXI6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdCYXI6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLnVJbWdCYXIud2lkdGggPSAwO1xuICAgICAgICB0aGlzLnVsYmxUYXIubm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigpLmZyb21IRVgoJyM0YjkxZTQnKTsgICAgICAgIFxuICAgIH1cblxuICAgIHVwZGF0ZVByb3Jlc3MoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHRvdGFsVyA9IDU4NTtcbiAgICAgICAgY29uc3QgdGFyID0gZ2FtZU1vZHVsZS5nZXRNYXhWYWx1ZSgpO1xuICAgICAgICBjb25zdCB0YXJXID0gTWF0aC5mbG9vcih0YXIgLyAxNSAqIHRvdGFsVyk7XG4gICAgICAgIGNjLnR3ZWVuKHRoaXMudUltZ0JhcilcbiAgICAgICAgICAgIC50bygwLjMsIHsgd2lkdGg6IHRhclcgfSwgeyBlYXNpbmc6IGNjLmVhc2luZy5jdWJpY0luT3V0IH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbn1cbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/GoodsList.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'c429fRntiVHaLkAc6vP2F5Q', 'GoodsList');
// script/merge/game/GoodsList.ts

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
var GoodsModule_1 = require("../dataModule/GoodsModule");
var Uimanager_1 = require("../manager/Uimanager");
var GoodsCom_1 = require("./GoodsCom");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GoodsList = /** @class */ (function (_super) {
    __extends(GoodsList, _super);
    function GoodsList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.label = null;
        _this.uPanel = null;
        return _this;
    }
    GoodsList.prototype.onLoad = function () {
    };
    GoodsList.prototype.initGoods = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, goods;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.uPanel.content.removeAllChildren();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < GoodsModule_1.goodsModule.goods.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.produceGoods()];
                    case 2:
                        goods = _a.sent();
                        goods.getComponent(GoodsCom_1.default).init(i);
                        this.uPanel.content.addChild(goods);
                        goods.x = i * goods.width + goods.width / 2;
                        this.uPanel.content.width = (i + 1) * goods.width;
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GoodsList.prototype.produceGoods = function () {
        return __awaiter(this, void 0, Promise, function () {
            var coinPrefab, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/merge/goodsCom')];
                    case 1:
                        coinPrefab = _a.sent();
                        coin = cc.instantiate(coinPrefab);
                        return [2 /*return*/, coin];
                }
            });
        });
    };
    __decorate([
        property(cc.Label)
    ], GoodsList.prototype, "label", void 0);
    __decorate([
        property(cc.ScrollView)
    ], GoodsList.prototype, "uPanel", void 0);
    GoodsList = __decorate([
        ccclass
    ], GoodsList);
    return GoodsList;
}(cc.Component));
exports.default = GoodsList;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9Hb29kc0xpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseURBQXdEO0FBQ3hELGtEQUFpRDtBQUNqRCx1Q0FBa0M7QUFFNUIsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFHNUM7SUFBdUMsNkJBQVk7SUFBbkQ7UUFBQSxxRUE0QkM7UUF6QkcsV0FBSyxHQUFhLElBQUksQ0FBQztRQUd2QixZQUFNLEdBQWtCLElBQUksQ0FBQzs7SUFzQmpDLENBQUM7SUFwQkcsMEJBQU0sR0FBTjtJQUVBLENBQUM7SUFFSyw2QkFBUyxHQUFmOzs7Ozs7d0JBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzt3QkFDL0IsQ0FBQyxHQUFHLENBQUM7Ozs2QkFBRSxDQUFBLENBQUMsR0FBRyx5QkFBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUE7d0JBQzFCLHFCQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQTs7d0JBQWpDLEtBQUssR0FBRyxTQUF5Qjt3QkFDdkMsS0FBSyxDQUFDLFlBQVksQ0FBQyxrQkFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3BDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7d0JBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDOzs7d0JBTFIsQ0FBQyxFQUFFLENBQUE7Ozs7OztLQU9wRDtJQUVLLGdDQUFZLEdBQWxCO3VDQUFzQixPQUFPOzs7OzRCQUNOLHFCQUFNLHFCQUFTLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLEVBQUE7O3dCQUFoRSxVQUFVLEdBQUcsU0FBbUQ7d0JBQ2hFLElBQUksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUN4QyxzQkFBTyxJQUFJLEVBQUM7Ozs7S0FDZjtJQXhCRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzRDQUNJO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUM7NkNBQ0s7SUFOWixTQUFTO1FBRDdCLE9BQU87T0FDYSxTQUFTLENBNEI3QjtJQUFELGdCQUFDO0NBNUJELEFBNEJDLENBNUJzQyxFQUFFLENBQUMsU0FBUyxHQTRCbEQ7a0JBNUJvQixTQUFTIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ29vZHNNb2R1bGUgfSBmcm9tIFwiLi4vZGF0YU1vZHVsZS9Hb29kc01vZHVsZVwiO1xuaW1wb3J0IHsgdWltYW5hZ2VyIH0gZnJvbSBcIi4uL21hbmFnZXIvVWltYW5hZ2VyXCI7XG5pbXBvcnQgR29vZHNDb20gZnJvbSBcIi4vR29vZHNDb21cIjtcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdvb2RzTGlzdCBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgbGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5TY3JvbGxWaWV3KVxuICAgIHVQYW5lbDogY2MuU2Nyb2xsVmlldyA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG5cbiAgICB9XG5cbiAgICBhc3luYyBpbml0R29vZHMoKSB7XG4gICAgICAgIHRoaXMudVBhbmVsLmNvbnRlbnQucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnb29kc01vZHVsZS5nb29kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ29vZHMgPSBhd2FpdCB0aGlzLnByb2R1Y2VHb29kcygpO1xuICAgICAgICAgICAgZ29vZHMuZ2V0Q29tcG9uZW50KEdvb2RzQ29tKS5pbml0KGkpO1xuICAgICAgICAgICAgdGhpcy51UGFuZWwuY29udGVudC5hZGRDaGlsZChnb29kcyk7XG4gICAgICAgICAgICBnb29kcy54ID0gaSAqIGdvb2RzLndpZHRoICsgZ29vZHMud2lkdGggLyAyO1xuICAgICAgICAgICAgdGhpcy51UGFuZWwuY29udGVudC53aWR0aCA9IChpICsgMSkgKiBnb29kcy53aWR0aDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHByb2R1Y2VHb29kcygpOiBQcm9taXNlPGNjLk5vZGU+IHtcbiAgICAgICAgY29uc3QgY29pblByZWZhYiA9IGF3YWl0IHVpbWFuYWdlci5sb2FkUHJlZmFiKCdwcmVmYWIvbWVyZ2UvZ29vZHNDb20nKTtcbiAgICAgICAgY29uc3QgY29pbiA9IGNjLmluc3RhbnRpYXRlKGNvaW5QcmVmYWIpO1xuICAgICAgICByZXR1cm4gY29pbjtcbiAgICB9XG59XG4iXX0=
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/Slot.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9TbG90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEQUFzRDtBQUN0RCxnREFBMEQ7QUFDMUQsNENBQThDO0FBQzlDLGtEQUFpRDtBQUNqRCxxREFBb0Q7QUFDcEQsK0JBQTBCO0FBRXBCLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRzVDO0lBQWtDLHdCQUFZO0lBQTlDO1FBQUEscUVBb2JDO1FBbmJHLFlBQVk7UUFDWixTQUFHLEdBQVcsQ0FBQyxDQUFDO1FBQ2hCLFVBQVU7UUFDVixxQkFBZSxHQUFlO1lBQzFCLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUNULENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUNULENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQztZQUNYLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUNULENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUNULENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUNULENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNSLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNSLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNSLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztTQUNYLENBQUM7UUFHRixXQUFLLEdBQVksSUFBSSxDQUFDO1FBR3RCLFdBQUssR0FBWSxJQUFJLENBQUM7UUFHdEIsV0FBSyxHQUFZLElBQUksQ0FBQztRQUd0QixXQUFLLEdBQVksSUFBSSxDQUFDO1FBR3RCLFdBQUssR0FBWSxJQUFJLENBQUM7UUFHdEIsV0FBSyxHQUFZLElBQUksQ0FBQztRQUd0QixXQUFLLEdBQVksSUFBSSxDQUFDO1FBR3RCLFdB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QXBiaUMsRUFBRSxDQUFDLFNBQVMsR0FvYjdDO2tCQXBib0IsSUFBSSIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdhbWVNb2R1bGUgfSBmcm9tICcuLi9kYXRhTW9kdWxlL0dhbWVNb2R1bGUnO1xuaW1wb3J0IHsgU291bmRUeXBlLCBhdWRpb01nciB9IGZyb20gJy4uL21hbmFnZXIvQXVkaW9NZ3InO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSAnLi4vbWFuYWdlci9EZWZpbmUnO1xuaW1wb3J0IHsgdWltYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlci9VaW1hbmFnZXInO1xuaW1wb3J0IHsgZXZlbnRNYW5hZ2VyIH0gZnJvbSAnLi4vdXRpbC9FdmVudE1hbmFnZXInO1xuaW1wb3J0IENvaW4gZnJvbSAnLi9Db2luJztcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsb3QgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIC8vIOW9k+WJjeetueeggeanveS9jeeahOe0ouW8lVxuICAgIGlkeDogbnVtYmVyID0gMDtcbiAgICAvLyDnrbnnoIHnmoTlnZDmoIfkvY3nva5cbiAgICBjb2luT3JpZ2luYWxQb3M6IG51bWJlcltdW10gPSBbXG4gICAgICAgIFs1OCwgMTk3XSxcbiAgICAgICAgWzU4LCAxNzhdLFxuICAgICAgICBbNTgsIDE1OS4zXSxcbiAgICAgICAgWzU4LCAxNDBdLFxuICAgICAgICBbNTgsIDEyMV0sXG4gICAgICAgIFs1OCwgMTAyXSxcbiAgICAgICAgWzU4LCA4M10sXG4gICAgICAgIFs1OCwgNjRdLFxuICAgICAgICBbNTgsIDQ1XSxcbiAgICAgICAgWzU4LCAyNl0sXG4gICAgXTtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW4wOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW4xOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW4yOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW4zOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW40OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW41OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW42OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW43OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW44OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvaW45OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdTbG90U2VsZWN0OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdTbG90TWVyZ2U6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5zZWxlY3RBY3Rpb24sIHRoaXMpO1xuICAgICAgICBldmVudE1hbmFnZXIub24oRXZlbnRUeXBlLk1PVkVfQ09JTiwgdGhpcy5vbk1vdmUsIHRoaXMpO1xuICAgICAgICBldmVudE1hbmFnZXIub24oRXZlbnRUeXBlLk1PVkVfRU5ELCB0aGlzLm9uTW92ZUVuZCwgdGhpcyk7XG4gICAgICAgIGV2ZW50TWFuYWdlci5vbihFdmVudFR5cGUuQ0hFQ0tfTUVSR0UsIHRoaXMub25VcGRhdGVNZXJnZVN0YXR1cywgdGhpcyk7XG4gICAgICAgIGV2ZW50TWFuYWdlci5vbihFdmVudFR5cGUuTUVSR0VfQ09JTiwgdGhpcy5vbk1lcmdlLCB0aGlzKTtcbiAgICAgICAgZXZlbnRNYW5hZ2VyLm9uKEV2ZW50VHlwZS5NT1ZFX0NIRUNLX0ZBSUwsIHRoaXMuY2FuTm90TW92ZSwgdGhpcyk7XG4gICAgICAgIGV2ZW50TWFuYWdlci5vbihFdmVudFR5cGUuQ0FOQ0VMX1NFTEVDVCwgdGhpcy5vbkRlU2VsZWN0LCB0aGlzKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICB9XG5cbiAgICAvLyDmoLzlvI/ljJbmlbDmja5cbiAgICBmb3JtYXREYXRhKGlkeDogbnVtYmVyLCBkYXRhOiBudW1iZXJbXSk6IHZvaWQge1xuICAgICAgICB0aGlzLmlkeCA9IGlkeDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgICAgIC8vIGRhdGFcbiAgICAgICAgICAgIGlmIChkYXRhW2ldICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpc1tgY29pbiR7aX1gXS5nZXRDb21wb25lbnQoQ29pbikuaW5pdCh0aGlzLmlkeCwgZGF0YVtpXSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2Bjb2luJHtpfWBdLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXNbYGNvaW4ke2l9YF0uYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHBvc1xuICAgICAgICAgICAgdGhpc1tgY29pbiR7aX1gXS5zZXRQb3NpdGlvbihjYy52Mih0aGlzLmNvaW5PcmlnaW5hbFBvc1tpXVswXSwgdGhpcy5jb2luT3JpZ2luYWxQb3NbaV1bMV0pKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ub2RlLnNldFNpYmxpbmdJbmRleCh0aGlzLmlkeCk7XG4gICAgfVxuXG4gICAgLy8g6YCJ5oup6KGM5Li6XG4gICAgc2VsZWN0QWN0aW9uKCkge1xuICAgICAgICBpZiAoZ2FtZU1vZHVsZS5jdXJTZWxlY3RTbG90SWR4ID09PSAtMSkge1xuICAgICAgICAgICAgLy8g5Yid5qyh6YCJ5oup6KGM5Li6XG4gICAgICAgICAgICB0aGlzLm9uU2VsZWN0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZ2FtZU1vZHVsZS5jdXJTZWxlY3RTbG90SWR4ID09PSB0aGlzLmlkeCkge1xuICAgICAgICAgICAgLy8g5Y+W5raI6YCJ5oup6KGM5Li6XG4gICAgICAgICAgICB0aGlzLm9uRGVTZWxlY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOenu+WKqOihjOS4uiDlvZPliY3oioLngrnkuLrnm67moIfoioLngrlcbiAgICAgICAgICAgIHRoaXMub25DaGVja01vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOmAieS4reW9k+WJjeanveS9jVxuICAgIG9uU2VsZWN0KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzbG90RGF0YSA9IGdhbWVNb2R1bGUuc2xvdERhdGFbdGhpcy5pZHhdO1xuXG4gICAgICAgIC8vIOmAieS4reS6huepuueahOanveS9jVxuICAgICAgICBpZiAoc2xvdERhdGFbMF0gPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfpgInkuK3kuobnqbrnmoTmp73kvY0nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWQiOW5tuaViOaenOS4re+8jOS4jeWPr+mAieS4rVxuICAgICAgICBpZiAoZ2FtZU1vZHVsZS5tZXJnZUxvY2spIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmraPlnKjlkIjlubbkuK3vvIzml6Dms5XpgInkuK0nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVNb2R1bGUuY3VyU2VsZWN0U2xvdElkeCA9IHRoaXMuaWR4O1xuICAgICAgICB0aGlzLnVJbWdTbG90U2VsZWN0LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMubm9kZS5zZXRTaWJsaW5nSW5kZXgoOCk7XG5cbiAgICAgICAgLy8g5oyR6YCJ5b6F5pON5L2c562556CB55qE57Si5byVXG4gICAgICAgIGdhbWVNb2R1bGUuY3VyU2VsZWN0Q29pbklkeHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAoc2xvdERhdGFbaV0gPT09IDApIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBpZiAoZ2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBnYW1lTW9kdWxlLmN1clNlbGVjdENvaW5JZHhzLnB1c2goaSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNsb3REYXRhW2ldID09PSBzbG90RGF0YVtnYW1lTW9kdWxlLmN1clNlbGVjdENvaW5JZHhzW2dhbWVNb2R1bGUuY3VyU2VsZWN0Q29pbklkeHMubGVuZ3RoIC0gMV1dKSB7XG4gICAgICAgICAgICAgICAgZ2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4cy5wdXNoKGkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKGDpgInkuK3kuobnrKwke3RoaXMuaWR4feS4quanveeahGAsIGdhbWVNb2R1bGUuY3VyU2VsZWN0Q29pbklkeHMpO1xuXG4gICAgICAgIC8vIOWvueW+heaTjeS9nOetueeggeeahOaYvuekuuaViOaenOi/m+ihjOWxleekulxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdhbWVNb2R1bGUuY3VyU2VsZWN0Q29pbklkeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHRhclBvc1kgPSB0aGlzLmNvaW5PcmlnaW5hbFBvc1tnYW1lTW9kdWxlLmN1clNlbGVjdENvaW5JZHhzW2ldXVsxXSArIDI1O1xuICAgICAgICAgICAgY2MudHdlZW4odGhpc1tgY29pbiR7Z2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4c1tpXX1gXSlcbiAgICAgICAgICAgICAgICAudG8oMC41LCB7IHk6IHRhclBvc1kgfSwgeyBlYXNpbmc6ICdiYWNrT3V0JyB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlj5bmtojpgInkuK1cbiAgICBvbkRlU2VsZWN0KCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygn5Y+W5raI6YCJ5oupJyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICAgICAgLy8gZGF0YVxuICAgICAgICAgICAgY29uc3QgdGFyUG9zWSA9IHRoaXMuY29pbk9yaWdpbmFsUG9zW2ldWzFdO1xuICAgICAgICAgICAgY2MudHdlZW4odGhpc1tgY29pbiR7aX1gXSlcbiAgICAgICAgICAgICAgICAudG8oMC41LCB7IHk6IHRhclBvc1kgfSwgeyBlYXNpbmc6ICdiYWNrT3V0JyB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVJbWdTbG90U2VsZWN0LmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIOmHjee9rumAieS4reeKtuaAgVxuICAgICAgICBnYW1lTW9kdWxlLmN1clNlbGVjdFNsb3RJZHggPSAtMTtcbiAgICB9XG5cbiAgICAvLyDnp7vliqhcbiAgICBvbkNoZWNrTW92ZSgpOiB2b2lkIHtcbiAgICAgICAgLy8g5aaC5p6c5b2T5YmN5qe95L2N5bey5ruh5YiZ5LiN5YWB6K6456e75YqoXG4gICAgICAgIGlmIChnYW1lTW9kdWxlLnNsb3REYXRhW3RoaXMuaWR4XS5pbmRleE9mKDApID09PSAtMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+etueeggeaVsOmHj+W3sua7oe+8jOS4jeWPr+enu+WKqCcpO1xuICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5NT1ZFX0NIRUNLX0ZBSUwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aaC5p6c5b2T5YmN5qe95L2N5pyA6L+R55qE562556CB5LiO5b2T5YmN6YCJ5Lit55qE5b6F56e75Yqo562556CB57G75Z6L5LiN5LiA6Ie0IOS4jeWFgeiuuOenu+WKqFxuICAgICAgICBjb25zdCBjdXJTbG90SW5mbyA9IGdhbWVNb2R1bGUuZ2V0Rmlyc3RWYWlsZE51bUJ5U2xvdElkeCh0aGlzLmlkeCk7XG4gICAgICAgIGNvbnN0IGN1clNlbGVjdENvaW5JbmZvID0gZ2FtZU1vZHVsZS5nZXRDdXJTZWxlY3RTbG90SW5mbygpO1xuICAgICAgICBpZiAoY3VyU2xvdEluZm8udmFpbGROdW0gIT09IC0xICYmIGN1clNsb3RJbmZvLnZhaWxkTnVtICE9PSBjdXJTZWxlY3RDb2luSW5mby5udW0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfnrbnnoIHnsbvlnovkuI3kuIDoh7QsIOS4jeWPr+enu+WKqCcpO1xuICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5NT1ZFX0NIRUNLX0ZBSUwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdhbWVNb2R1bGUubW92ZUxvY2spIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmraPlnKjnp7vliqjkuK3vvIzml6Dms5XkuqfnlJ/mm7TlpJrnp7vliqgnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOehruWumuWPr+S7peenu+WKqOeahOetueeggeaVsOmHj1xuICAgICAgICBjb25zdCBtb3ZlQ250ID0gTWF0aC5taW4oY3VyU2xvdEluZm8udmFpbGRTcGFjZSwgY3VyU2VsZWN0Q29pbkluZm8uY250KTtcblxuICAgICAgICAvLyDnoa7lrprnp7vliqjliLDnmoTnm67moIfkvY3nva5cbiAgICAgICAgY29uc3QgdGFyUG9zOiBjYy5WZWMyW10gPSBbXTtcblxuICAgICAgICAvLyDnm67moIfmp73kvY3lj5HnlJ/mlbDmja7lj5jliqjnmoTkvY3nva7ntKLlvJXpm4ZcbiAgICAgICAgY29uc3QgdGFySWR4QXJyOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICAvLyDljp/mp73kvY3lj5HnlJ/mlbDmja7lj5jliqjnmoTmp73kvY3ntKLlvJXpm4ZcbiAgICAgICAgY29uc3Qgc3JjSWR4QXJyOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgICAgIGxldCBzdGFydFBvc0lkeDogbnVtYmVyID0gY3VyU2xvdEluZm8udmFpbGRJZHggKyAxO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1vdmVDbnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgb3JpUG9zWCA9IHRoaXMuY29pbk9yaWdpbmFsUG9zW3N0YXJ0UG9zSWR4XVswXTtcbiAgICAgICAgICAgIGNvbnN0IG9yaVBvc1kgPSB0aGlzLmNvaW5PcmlnaW5hbFBvc1tzdGFydFBvc0lkeF1bMV07XG4gICAgICAgICAgICBjb25zdCBnbG9iYWxQb3MgPSB0aGlzLm5vZGUuY29udmVydFRvV29ybGRTcGFjZUFSKGNjLnYyKG9yaVBvc1gsIG9yaVBvc1kpKTtcbiAgICAgICAgICAgIHRhclBvcy5wdXNoKGdsb2JhbFBvcyk7XG4gICAgICAgICAgICB0YXJJZHhBcnIucHVzaChzdGFydFBvc0lkeCk7XG4gICAgICAgICAgICBzcmNJZHhBcnIucHVzaChnYW1lTW9kdWxlLmN1clNlbGVjdENvaW5JZHhzW2ldKTtcbiAgICAgICAgICAgIHN0YXJ0UG9zSWR4Kys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpgJrnn6XlvoXnp7vliqjnmoTmp73kvY3ov5vooYznrbnnoIHnp7vliqhcbiAgICAgICAgY29uc3QgZXZlbnREYXRhID0ge1xuICAgICAgICAgICAgLy8g5a6e6ZmF56e75Yqo5pWw6YePXG4gICAgICAgICAgICBtb3ZlQ250LFxuICAgICAgICAgICAgLy8g55uu5qCH56e75Yqo55qE6IqC54K55a+55bqU5L2N572uKOS9ji0+6auYKVxuICAgICAgICAgICAgdGFyUG9zLFxuICAgICAgICAgICAgLy8g55uu5qCH5qe95L2N5a6e6ZmF5Y+R55Sf5pWw5o2u5Y+Y5Yqo55qE562556CB57Si5byV6ZuGKOS9ji0+5L2OKVxuICAgICAgICAgICAgdGFySWR4QXJyLFxuICAgICAgICAgICAgLy8g5Y6f5qe95L2N5a6e6ZmF5Y+R55Sf56e75Yqo55qE562556CB57Si5byV6ZuGKOmrmC0+5L2OKVxuICAgICAgICAgICAgc3JjSWR4QXJyLFxuICAgICAgICAgICAgLy8g5a6e6ZmF5Y+R55Sf55qE562556CB57G75Z6LXG4gICAgICAgICAgICBudW1UeXBlOiBjdXJTZWxlY3RDb2luSW5mby5udW0sXG4gICAgICAgICAgICAvLyDnm67moIfmp73kvY3ntKLlvJVcbiAgICAgICAgICAgIHRhclNsb3RJZHg6IHRoaXMuaWR4LFxuICAgICAgICB9XG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuTU9WRV9DT0lOLCBldmVudERhdGEpO1xuICAgIH1cblxuICAgIC8vIOenu+WKqOajgOa1i+Wksei0pe+8jOaPkOekuuS4jeWPr+enu+WKqFxuICAgIGNhbk5vdE1vdmUoKTogdm9pZCB7XG4gICAgICAgIGlmIChnYW1lTW9kdWxlLmN1clNlbGVjdFNsb3RJZHggIT09IHRoaXMuaWR4KSByZXR1cm47XG4gICAgICAgIGlmIChnYW1lTW9kdWxlLmN1clNlbGVjdFNsb3RJZHggPT09IC0xKSByZXR1cm47XG4gICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuRVJST1IpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY29pbk5vZGUgPSB0aGlzW2Bjb2luJHtnYW1lTW9kdWxlLmN1clNlbGVjdENvaW5JZHhzW2ldfWBdO1xuICAgICAgICAgICAgY29uc3Qgb3JpUG9zWCA9IGNvaW5Ob2RlLng7XG4gICAgICAgICAgICBjYy50d2Vlbihjb2luTm9kZSlcbiAgICAgICAgICAgICAgICAudG8oMC4wNSwgeyB4OiBvcmlQb3NYIC0gMTAgfSlcbiAgICAgICAgICAgICAgICAudG8oMC4xLCB7IHg6IG9yaVBvc1ggKyAxMCB9KVxuICAgICAgICAgICAgICAgIC50bygwLjEsIHsgeDogb3JpUG9zWCAtIDEwIH0pXG4gICAgICAgICAgICAgICAgLnRvKDAuMDUsIHsgeDogb3JpUG9zWCB9KVxuICAgICAgICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGdhbWVNb2R1bGUuY3VyU2VsZWN0Q29pbklkeHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkRlU2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5byA5aeL6L+b6KGM56e75YqoXG4gICAgb25Nb3ZlKGUpIHtcbiAgICAgICAgY29uc3QgZXZlbnREYXRhID0gZS5kYXRhO1xuICAgICAgICBpZiAodGhpcy5pZHggIT09IGdhbWVNb2R1bGUuY3VyU2VsZWN0U2xvdElkeCkgcmV0dXJuO1xuICAgICAgICBjb25zb2xlLmxvZyhgb25Nb3ZlOiAke2dhbWVNb2R1bGUuY3VyU2VsZWN0U2xvdElkeH0gLT4gJHtldmVudERhdGEudGFyU2xvdElkeH1gKTtcblxuICAgICAgICBhdWRpb01nci5wbGF5U291bmQoU291bmRUeXBlLk1PVkVfQ09JTik7XG5cbiAgICAgICAgZ2FtZU1vZHVsZS5tb3ZlTG9jayA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgbW92ZUNudCA9IGV2ZW50RGF0YS5tb3ZlQ250O1xuICAgICAgICBjb25zdCB0YXJXb3JsZFBvczogY2MuVmVjMltdID0gZXZlbnREYXRhLnRhclBvcztcbiAgICAgICAgY29uc3QgdGFyTG9jYWxQb3M6IGNjLlZlYzJbXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gdGFyV29ybGRQb3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIHRhckxvY2FsUG9zLnB1c2godGhpcy5ub2RlLmNvbnZlcnRUb05vZGVTcGFjZUFSKHRhcldvcmxkUG9zW2ldKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnlLHpq5jliLDkvY7nmoTov5vooYznp7vliqhcbiAgICAgICAgbGV0IHN0YXJ0SWR4ID0gZ2FtZU1vZHVsZS5jdXJTZWxlY3RDb2luSWR4c1swXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtb3ZlQ250OyBpKyspIHtcbiAgICAgICAgICAgIGNjLnR3ZWVuKHRoaXNbYGNvaW4ke3N0YXJ0SWR4fWBdKVxuICAgICAgICAgICAgICAgIC5kZWxheSgwLjAzICogaSlcbiAgICAgICAgICAgICAgICAudG8oMC4xLCB7IHBvc2l0aW9uOiB0YXJMb2NhbFBvc1tpXSB9KVxuICAgICAgICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IG1vdmVDbnQgLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lTW9kdWxlLnRpZHlTbG90RGF0YSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyU2xvdElkeDogZXZlbnREYXRhLnRhclNsb3RJZHgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtVHlwZTogZXZlbnREYXRhLm51bVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjSWR4QXJyOiBldmVudERhdGEuc3JjSWR4QXJyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcklkeEFycjogZXZlbnREYXRhLnRhcklkeEFycixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkRlU2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lTW9kdWxlLm1vdmVMb2NrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpXG5cbiAgICAgICAgICAgIHN0YXJ0SWR4LS07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk1vdmVFbmQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdvbk1vdmVFbmQnKTtcbiAgICAgICAgdGhpcy5mb3JtYXREYXRhKHRoaXMuaWR4LCBnYW1lTW9kdWxlLnNsb3REYXRhW3RoaXMuaWR4XSk7XG4gICAgfVxuXG4gICAgLy8g5Yi35paw5ZCI5oiQ54q25oCBXG4gICAgb25VcGRhdGVNZXJnZVN0YXR1cygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2FuTWVyZ2UgPSBnYW1lTW9kdWxlLmNoZWNrQ2FuTWVyZ2VCeVNsb3QodGhpcy5pZHgpO1xuICAgICAgICB0aGlzLnVJbWdTbG90TWVyZ2UuYWN0aXZlID0gY2FuTWVyZ2U7XG4gICAgICAgIHRoaXMuc2hvd01lcmdlSGludEFjdGlvbihjYW5NZXJnZSk7XG4gICAgfVxuXG4gICAgLy8g5o+Q56S65ZCI5oiQXG4gICAgc2hvd01lcmdlSGludEFjdGlvbihjYW5NZXJnZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoY2FuTWVyZ2UpIHtcbiAgICAgICAgICAgIHRoaXMudUltZ1Nsb3RNZXJnZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgICAgIGNjLnR3ZWVuKHRoaXMudUltZ1Nsb3RNZXJnZSlcbiAgICAgICAgICAgICAgICAudG8oMSwgeyBvcGFjaXR5OiAyNTUgfSlcbiAgICAgICAgICAgICAgICAudG8oMSwgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoKCkgPT4geyB0aGlzLnNob3dNZXJnZUhpbnRBY3Rpb24oY2FuTWVyZ2UpIH0pXG4gICAgICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYy50d2Vlbih0aGlzLnVJbWdTbG90TWVyZ2UpLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMudUltZ1Nsb3RNZXJnZS5hY3RpdmUgPSBjYW5NZXJnZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWQiOaIkFxuICAgIG9uTWVyZ2UoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNhbk1lcmdlID0gZ2FtZU1vZHVsZS5jaGVja0Nhbk1lcmdlQnlTbG90KHRoaXMuaWR4KTtcbiAgICAgICAgaWYgKCFjYW5NZXJnZSkgcmV0dXJuO1xuXG4gICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuTUVSR0VfQ09JTik7XG5cbiAgICAgICAgZ2FtZU1vZHVsZS5tZXJnZUxvY2sgKz0gMTtcblxuICAgICAgICAvLyDlkIjmiJDmlYjmnpxcbiAgICAgICAgZm9yIChsZXQgaSA9IDk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjYy50d2Vlbih0aGlzW2Bjb2luJHtpfWBdKVxuICAgICAgICAgICAgICAgIC5kZWxheSgwLjA1ICogKDkgLSBpKSlcbiAgICAgICAgICAgICAgICAudG8oMC4xLCB7IHNjYWxlOiAwIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2Bjb2luJHtpfWBdLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2Bjb2luJHtpfWBdLnNjYWxlID0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25NZXJnZUZpbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWQiOaIkOe7k+adn1xuICAgIG9uTWVyZ2VGaW5pc2goKTogdm9pZCB7XG4gICAgICAgIC8vIOWQiOaIkOebruagh+WAvFxuICAgICAgICBjb25zdCBtZXJnZVRhcmdldFZhbHVlID0gZ2FtZU1vZHVsZS5zbG90RGF0YVt0aGlzLmlkeF1bMF0gKyAxO1xuXG4gICAgICAgIC8vIOWQiOaIkOWQjueahOaVsOaNrlxuICAgICAgICBnYW1lTW9kdWxlLnNsb3REYXRhW3RoaXMuaWR4XSA9IFttZXJnZVRhcmdldFZhbHVlLCBtZXJnZVRhcmdldFZhbHVlLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXTtcblxuICAgICAgICBjb25zb2xlLmxvZyhg5qe9JHt0aGlzLmlkeH0g5ZCI5oiQJHttZXJnZVRhcmdldFZhbHVlfWApO1xuXG4gICAgICAgIHRoaXMuY29pbjAuc2NhbGUgPSAwO1xuICAgICAgICB0aGlzLmNvaW4xLnNjYWxlID0gMDtcbiAgICAgICAgdGhpcy5jb2luMC5nZXRDb21wb25lbnQoQ29pbikuaW5pdCh0aGlzLmlkeCwgbWVyZ2VUYXJnZXRWYWx1ZSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb2luMC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb2luMS5nZXRDb21wb25lbnQoQ29pbikuaW5pdCh0aGlzLmlkeCwgbWVyZ2VUYXJnZXRWYWx1ZSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb2luMS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBjYy50d2Vlbih0aGlzLmNvaW4wKVxuICAgICAgICAgICAgLnRvKDAuNSwgeyBzY2FsZTogMSB9LCB7IGVhc2luZzogJ2JhY2tPdXQnIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICAgICAgY2MudHdlZW4odGhpcy5jb2luMSlcbiAgICAgICAgICAgIC50bygwLjUsIHsgc2NhbGU6IDEgfSwgeyBlYXNpbmc6ICdiYWNrT3V0JyB9KVxuICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGdhbWVNb2R1bGUubWVyZ2VMb2NrIC09IDE7XG4gICAgICAgICAgICAgICAgaWYgKGdhbWVNb2R1bGUubWVyZ2VMb2NrIDwgMCkgZ2FtZU1vZHVsZS5tZXJnZUxvY2sgPSAwO1xuICAgICAgICAgICAgICAgIGlmIChnYW1lTW9kdWxlLm1lcmdlTG9jayA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLk1FUkdFX0VORCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGFydCgpO1xuXG4gICAgICAgIHRoaXMudUltZ1Nsb3RNZXJnZS5hY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLkNIRUNLX01FUkdFKTtcbiAgICB9XG5cbiAgICAvLyDnlJ/miJDnrbnnoIFcbiAgICBhc3luYyBwcm9kdWNlKG5ld0NvaW46IG51bWJlcltdLCBzdGFydEdsb2JhbFBvczogY2MuVmVjMiwgc3RhcnRQb3NJZHg6IG51bWJlcikge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmlkeCwgbmV3Q29pbik7XG4gICAgICAgIC8vIOS4jemcgOimgeeUn+aIkOWwseS4jeaTjeS9nOS6hlxuICAgICAgICBpZiAobmV3Q29pbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke3RoaXMuaWR4feanveaXoOaWsOetueeggWApO1xuICAgICAgICAgICAgYXVkaW9NZ3IucGxheVNvdW5kKFNvdW5kVHlwZS5FUlJPUik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgJHt0aGlzLmlkeH0g55Sf5oiQ5LqGYCwgbmV3Q29pbik7XG5cbiAgICAgICAgLy8g5rS+5Y+R562556CB5pWI5p6c55qE6LW35aeL5L2N572uXG4gICAgICAgIGNvbnN0IGxvY2FsUG9zU3JjID0gdGhpcy5ub2RlLmNvbnZlcnRUb05vZGVTcGFjZUFSKHN0YXJ0R2xvYmFsUG9zKTtcbiAgICAgICAgLy8g5bey57uP5aSE55CG55qE562556CBXG4gICAgICAgIGxldCBkZWFsQ250ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdDb2luLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyDnlJ/miJDkuIDkuKrooajnjrDnlKjnmoTmlrDnrbnnoIFcbiAgICAgICAgICAgIGNvbnN0IG5ld0NvaW5Ob2RlID0gYXdhaXQgdGhpcy5wcm9kdWNlQ29pbigpO1xuICAgICAgICAgICAgY29uc3QgY29pbiA9IG5ld0NvaW5Ob2RlLmdldENvbXBvbmVudChDb2luKTtcbiAgICAgICAgICAgIHRoaXMubm9kZS5hZGRDaGlsZChuZXdDb2luTm9kZSk7XG4gICAgICAgICAgICBjb2luLm5vZGUuc2V0UG9zaXRpb24obG9jYWxQb3NTcmMpO1xuICAgICAgICAgICAgY29pbi5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgY29pbi5pbml0KHRoaXMuaWR4LCBuZXdDb2luW2ldLCAoKSA9PiB7IGNvaW4ubm9kZS5hY3RpdmUgPSB0cnVlOyB9KTtcblxuICAgICAgICAgICAgLy8g56Gu5a6a6KaB6aOe55qE55uu55qE5Zyw5Z2Q5qCHXG4gICAgICAgICAgICBjb25zdCB0YXJQb3NJZHggPSBzdGFydFBvc0lkeCArIGRlYWxDbnQ7XG4gICAgICAgICAgICBjb25zdCBwb3NUYXIgPSB0aGlzLmNvaW5PcmlnaW5hbFBvc1tzdGFydFBvc0lkeCArIGRlYWxDbnRdO1xuICAgICAgICAgICAgY29uc3QgdGFyUG9zID0gY2MudjIocG9zVGFyWzBdLCBwb3NUYXJbMV0pO1xuICAgICAgICAgICAgZ2FtZU1vZHVsZS5wcm9kdWNlTG9jayArPSAxO1xuICAgICAgICAgICAgY2MudHdlZW4oY29pbi5ub2RlKVxuICAgICAgICAgICAgICAgIC5kZWxheSgwLjEgKiBkZWFsQ250KVxuICAgICAgICAgICAgICAgIC50bygwLjUsIHsgcG9zaXRpb246IHRhclBvcyB9LCB7IGVhc2luZzogJ2N1YmljSW5PdXQnIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2Bjb2luJHt0YXJQb3NJZHh9YF0uZ2V0Q29tcG9uZW50KENvaW4pLmluaXQodGhpcy5pZHgsIG5ld0NvaW5baV0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbYGNvaW4ke3RhclBvc0lkeH1gXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29pbi5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29pbi5ub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVNb2R1bGUucHJvZHVjZUxvY2sgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdhbWVNb2R1bGUucHJvZHVjZUxvY2sgPCAwKSBnYW1lTW9kdWxlLnByb2R1Y2VMb2NrID0gMDtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuXG4gICAgICAgICAgICBkZWFsQ250Kys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBwcm9kdWNlQ29pbigpOiBQcm9taXNlPGNjLk5vZGU+IHtcbiAgICAgICAgY29uc3QgY29pblByZWZhYiA9IGF3YWl0IHVpbWFuYWdlci5sb2FkUHJlZmFiKCdwcmVmYWIvbWVyZ2UvY29pbicpO1xuICAgICAgICBjb25zdCBjb2luID0gY2MuaW5zdGFudGlhdGUoY29pblByZWZhYik7XG4gICAgICAgIHJldHVybiBjb2luO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSAoZHQpIHt9XG59XG4iXX0=
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/GoodsCom.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b87589+qj5GgbqZ/w8AZBbf', 'GoodsCom');
// script/merge/game/GoodsCom.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
var GoodsModule_1 = require("../dataModule/GoodsModule");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GoodsCom = /** @class */ (function (_super) {
    __extends(GoodsCom, _super);
    function GoodsCom() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.label = null;
        _this.uImgGoods = null;
        _this.ulblName = null;
        _this.ulblStar = null;
        _this.ulblInventory = null;
        _this.uBtnGet = null;
        // 商品列表中的索引
        _this.idx = -1;
        return _this;
    }
    Object.defineProperty(GoodsCom.prototype, "goodsData", {
        // 当前最新的商品信息状态
        get: function () {
            return GoodsModule_1.goodsModule.goods[this.idx];
        },
        enumerable: false,
        configurable: true
    });
    GoodsCom.prototype.onLoad = function () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onSelect, this);
        this.uBtnGet.on(cc.Node.EventType.TOUCH_END, this.onGet, this);
    };
    GoodsCom.prototype.init = function (idx) {
        this.idx = idx;
        this.formatGoodsInfo();
    };
    GoodsCom.prototype.formatGoodsInfo = function () {
        var _this = this;
        var goodsInfo = this.goodsData;
        var url = "images/goods/img_goods_" + goodsInfo.id;
        cc.resources.load(url, cc.SpriteFrame, (function (err, spriteFrame) {
            if (err) {
                console.error('url:', url, '/err:');
                return;
            }
            _this.uImgGoods.spriteFrame = spriteFrame;
        }));
        this.ulblName.string = goodsInfo.name;
        this.ulblStar.string = "x " + goodsInfo.star;
    };
    // 展示商品详情页
    GoodsCom.prototype.onSelect = function () {
        console.log('[DEBUG] 显示商品详情', this.goodsData);
    };
    // 兑换
    GoodsCom.prototype.onGet = function () {
        console.log("[DEBUG] \u5151\u6362\u5546\u54C1" + this.goodsData.name);
    };
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "label", void 0);
    __decorate([
        property(cc.Sprite)
    ], GoodsCom.prototype, "uImgGoods", void 0);
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "ulblName", void 0);
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "ulblStar", void 0);
    __decorate([
        property(cc.Label)
    ], GoodsCom.prototype, "ulblInventory", void 0);
    __decorate([
        property(cc.Node)
    ], GoodsCom.prototype, "uBtnGet", void 0);
    GoodsCom = __decorate([
        ccclass
    ], GoodsCom);
    return GoodsCom;
}(cc.Component));
exports.default = GoodsCom;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9Hb29kc0NvbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5REFBd0Q7QUFHbEQsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFHNUM7SUFBc0MsNEJBQVk7SUFBbEQ7UUFBQSxxRUFnRUM7UUE3REcsV0FBSyxHQUFhLElBQUksQ0FBQztRQUd2QixlQUFTLEdBQWMsSUFBSSxDQUFDO1FBRzVCLGNBQVEsR0FBYSxJQUFJLENBQUM7UUFHMUIsY0FBUSxHQUFhLElBQUksQ0FBQztRQUcxQixtQkFBYSxHQUFhLElBQUksQ0FBQztRQUcvQixhQUFPLEdBQVksSUFBSSxDQUFDO1FBRXhCLFdBQVc7UUFDWCxTQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7O0lBMkNyQixDQUFDO0lBeENHLHNCQUFJLCtCQUFTO1FBRGIsY0FBYzthQUNkO1lBQ0ksT0FBTyx5QkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsQ0FBQzs7O09BQUE7SUFFRCx5QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELHVCQUFJLEdBQUosVUFBSyxHQUFXO1FBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELGtDQUFlLEdBQWY7UUFBQSxpQkFlQztRQWRHLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFakMsSUFBTSxHQUFHLEdBQVcsNEJBQTBCLFNBQVMsQ0FBQyxFQUFJLENBQUM7UUFDN0QsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFDLEdBQUcsRUFBRSxXQUEyQjtZQUNyRSxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3BDLE9BQU87YUFDVjtZQUVELEtBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxPQUFLLFNBQVMsQ0FBQyxJQUFNLENBQUM7SUFDakQsQ0FBQztJQUVELFVBQVU7SUFDViwyQkFBUSxHQUFSO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELEtBQUs7SUFDTCx3QkFBSyxHQUFMO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQU0sQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUE1REQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzsyQ0FDSTtJQUd2QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDOytDQUNRO0lBRzVCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7OENBQ087SUFHMUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs4Q0FDTztJQUcxQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO21EQUNZO0lBRy9CO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7NkNBQ007SUFsQlAsUUFBUTtRQUQ1QixPQUFPO09BQ2EsUUFBUSxDQWdFNUI7SUFBRCxlQUFDO0NBaEVELEFBZ0VDLENBaEVxQyxFQUFFLENBQUMsU0FBUyxHQWdFakQ7a0JBaEVvQixRQUFRIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ29vZHNNb2R1bGUgfSBmcm9tIFwiLi4vZGF0YU1vZHVsZS9Hb29kc01vZHVsZVwiO1xuaW1wb3J0IHsgR29vZHNUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvRGVmaW5lXCI7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb29kc0NvbSBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgbGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5TcHJpdGUpXG4gICAgdUltZ0dvb2RzOiBjYy5TcHJpdGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxOYW1lOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFN0YXI6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsSW52ZW50b3J5OiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1QnRuR2V0OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIC8vIOWVhuWTgeWIl+ihqOS4reeahOe0ouW8lVxuICAgIGlkeDogbnVtYmVyID0gLTE7XG5cbiAgICAvLyDlvZPliY3mnIDmlrDnmoTllYblk4Hkv6Hmga/nirbmgIFcbiAgICBnZXQgZ29vZHNEYXRhKCk6IEdvb2RzVHlwZSB7XG4gICAgICAgIHJldHVybiBnb29kc01vZHVsZS5nb29kc1t0aGlzLmlkeF07XG4gICAgfVxuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uU2VsZWN0LCB0aGlzKTtcbiAgICAgICAgdGhpcy51QnRuR2V0Lm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vbkdldCwgdGhpcyk7XG4gICAgfVxuXG4gICAgaW5pdChpZHg6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmlkeCA9IGlkeDtcbiAgICAgICAgdGhpcy5mb3JtYXRHb29kc0luZm8oKTtcbiAgICB9XG5cbiAgICBmb3JtYXRHb29kc0luZm8oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGdvb2RzSW5mbyA9IHRoaXMuZ29vZHNEYXRhO1xuXG4gICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYGltYWdlcy9nb29kcy9pbWdfZ29vZHNfJHtnb29kc0luZm8uaWR9YDtcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQodXJsLCBjYy5TcHJpdGVGcmFtZSwgKChlcnIsIHNwcml0ZUZyYW1lOiBjYy5TcHJpdGVGcmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3VybDonLCB1cmwsICcvZXJyOicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy51SW1nR29vZHMuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMudWxibE5hbWUuc3RyaW5nID0gZ29vZHNJbmZvLm5hbWU7XG4gICAgICAgIHRoaXMudWxibFN0YXIuc3RyaW5nID0gYHggJHtnb29kc0luZm8uc3Rhcn1gO1xuICAgIH1cblxuICAgIC8vIOWxleekuuWVhuWTgeivpuaDhemhtVxuICAgIG9uU2VsZWN0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHXSDmmL7npLrllYblk4Hor6bmg4UnLCB0aGlzLmdvb2RzRGF0YSk7XG4gICAgfVxuXG4gICAgLy8g5YWR5o2iXG4gICAgb25HZXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbREVCVUddIOWFkeaNouWVhuWTgSR7dGhpcy5nb29kc0RhdGEubmFtZX1gKTtcbiAgICB9XG59XG4iXX0=
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/manager/Uimanager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'f6b0eaEb8lOraTr9sfkeyyf', 'Uimanager');
// script/merge/manager/Uimanager.ts

"use strict";
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
exports.uimanager = void 0;
var TypeDefine_1 = require("../define/TypeDefine");
var Tips_1 = require("../pulicCom/Tips");
var Uimanager = /** @class */ (function () {
    function Uimanager() {
        // 层级依托的场景
        this.scene = null;
        // 层级
        this.layerArr = [];
    }
    Object.defineProperty(Uimanager, "instance", {
        get: function () {
            if (!this._ins) {
                this._ins = new Uimanager();
            }
            return this._ins;
        },
        enumerable: false,
        configurable: true
    });
    Uimanager.prototype.init = function (node) {
        this.scene = node;
        this.initLayer();
    };
    Uimanager.prototype.initLayer = function () {
        this.layerArr = [];
        // UI层
        var node_ui = new cc.Node(TypeDefine_1.LAYER.UI);
        node_ui.width = this.scene.width;
        node_ui.height = this.scene.height;
        this.scene.addChild(node_ui);
        this.layerArr.push(node_ui);
        // 弹窗层
        var node_dialog = new cc.Node(TypeDefine_1.LAYER.DIALOG);
        node_dialog.width = this.scene.width;
        node_dialog.height = this.scene.height;
        this.scene.addChild(node_dialog);
        this.layerArr.push(node_dialog);
        // 提示层
        var node_tip = new cc.Node(TypeDefine_1.LAYER.TIP);
        node_tip.width = this.scene.width;
        node_tip.height = this.scene.height;
        this.scene.addChild(node_tip);
        this.layerArr.push(node_tip);
        // 引导层
        var node_guide = new cc.Node(TypeDefine_1.LAYER.GUIDE);
        node_guide.width = this.scene.width;
        node_guide.height = this.scene.height;
        this.scene.addChild(node_guide);
        this.layerArr.push(node_guide);
    };
    Uimanager.prototype.getLayer = function (name) {
        var node = this.scene.getChildByName(name);
        return node;
    };
    Uimanager.prototype.add = function (node, layerType) {
        var layerNode = this.getLayer(layerType);
        if (!layerNode) {
            console.warn('UIManager: 没有这个层级', layerType);
            return;
        }
        layerNode.addChild(node);
    };
    // 动态显示需要的层级
    Uimanager.prototype.udpateLayerShow = function () {
        for (var i = 0; i < this.layerArr.length; i++) {
            this.layerArr[i].active = this.layerArr[i].childrenCount > 0;
        }
    };
    /**
     * 预制件加载
     * @param path
     */
    Uimanager.prototype.loadPrefab = function (path) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var load;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    load = function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            return [2 /*return*/, new Promise(function (rsv, rjt) {
                                                    var tot = setTimeout(function () {
                                                        console.debug("[loadPefab timeout] " + path + "\u52A0\u8F7D\u8D85\u65F6");
                                                        rjt("loadPefab \u8FDE\u63A5\u8D85\u65F6" + path);
                                                    }, 10000);
                                                    cc.resources.load(path, function (err, res) {
                                                        clearTimeout(tot);
                                                        if (err) {
                                                            rjt(err);
                                                        }
                                                        else {
                                                            rsv(res);
                                                        }
                                                    });
                                                })];
                                        });
                                    }); };
                                    return [4 /*yield*/, load().then(function (res) {
                                            resolve(res);
                                        })
                                            .catch(function (err) {
                                            reject(err);
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 显示提示
     * @param msg
     */
    Uimanager.prototype.showTips = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var tipsPrefab, tipsNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadPrefab('prefab/com/tips')];
                    case 1:
                        tipsPrefab = _a.sent();
                        tipsNode = cc.instantiate(tipsPrefab);
                        this.add(tipsNode, TypeDefine_1.LAYER.TIP);
                        tipsNode.getComponent(Tips_1.default).showTips(msg);
                        tipsNode.setPosition(0, 0);
                        return [2 /*return*/];
                }
            });
        });
    };
    /** 结算 */
    Uimanager.prototype.showGameOver = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prefab, accountNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exports.uimanager.showTips('游戏结束');
                        return [4 /*yield*/, this.loadPrefab('prefab/zyx/accountDialog')];
                    case 1:
                        prefab = _a.sent();
                        accountNode = cc.instantiate(prefab);
                        this.add(accountNode, TypeDefine_1.LAYER.UI);
                        accountNode.setPosition(0, 0);
                        return [2 /*return*/];
                }
            });
        });
    };
    return Uimanager;
}());
exports.default = Uimanager;
exports.uimanager = Uimanager.instance;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9VaW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQTZDO0FBQzdDLHlDQUFvQztBQUVwQztJQWdCSTtRQU5BLFVBQVU7UUFDVixVQUFLLEdBQVksSUFBSSxDQUFDO1FBRXRCLEtBQUs7UUFDTCxhQUFRLEdBQWMsRUFBRSxDQUFDO0lBRVQsQ0FBQztJQWRqQixzQkFBa0IscUJBQVE7YUFBMUI7WUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDWixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7YUFDL0I7WUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFVRCx3QkFBSSxHQUFKLFVBQUssSUFBYTtRQUNkLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQsNkJBQVMsR0FBVDtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBRW5CLE1BQU07UUFDTixJQUFNLE9BQU8sR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFNUIsTUFBTTtRQUNOLElBQU0sV0FBVyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDckMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVoQyxNQUFNO1FBQ04sSUFBTSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsUUFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUNsQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTdCLE1BQU07UUFDTixJQUFNLFVBQVUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QyxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3BDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELDRCQUFRLEdBQVIsVUFBUyxJQUFXO1FBQ2hCLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCx1QkFBRyxHQUFILFVBQUksSUFBYSxFQUFFLFNBQWdCO1FBQy9CLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFM0MsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDN0MsT0FBTztTQUNWO1FBRUQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsWUFBWTtJQUNaLG1DQUFlLEdBQWY7UUFDSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1NBQ2hFO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNHLDhCQUFVLEdBQWhCLFVBQWlCLElBQVk7dUNBQUcsT0FBTzs7O2dCQUNuQyxzQkFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFPLE9BQU8sRUFBRSxNQUFNOzs7Ozs7b0NBQy9CLElBQUksR0FBRzs7NENBQVksc0JBQUEsSUFBSSxPQUFPLENBQUMsVUFBQyxHQUFHLEVBQUUsR0FBRztvREFDMUMsSUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDO3dEQUNuQixPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF1QixJQUFJLDZCQUFNLENBQUMsQ0FBQTt3REFDaEQsR0FBRyxDQUFDLHVDQUFpQixJQUFNLENBQUMsQ0FBQztvREFDakMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO29EQUNWLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFDLEdBQUcsRUFBRSxHQUFHO3dEQUM3QixZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7d0RBRWxCLElBQUksR0FBRyxFQUFFOzREQUNMLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt5REFDWjs2REFBTTs0REFDSCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7eURBQ1o7b0RBQ0wsQ0FBQyxDQUFDLENBQUM7Z0RBQ1AsQ0FBQyxDQUFDLEVBQUE7O3lDQUFBLENBQUE7b0NBRUYscUJBQU0sSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsR0FBRzs0Q0FDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dDQUNqQixDQUFDLENBQUM7NkNBQ0csS0FBSyxDQUFDLFVBQUMsR0FBRzs0Q0FDUCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7d0NBQ2hCLENBQUMsQ0FBQyxFQUFBOztvQ0FMTixTQUtNLENBQUM7Ozs7eUJBQ1YsQ0FBQyxFQUFDOzs7S0FDTjtJQUVEOzs7T0FHRztJQUNHLDRCQUFRLEdBQWQsVUFBZSxHQUFXOzs7Ozs0QkFDSCxxQkFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEVBQUE7O3dCQUFyRCxVQUFVLEdBQUcsU0FBd0M7d0JBQ3JELFFBQVEsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUM1QyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUM5QixRQUFRLENBQUMsWUFBWSxDQUFDLGNBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDMUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQzlCO0lBRUQsU0FBUztJQUNILGdDQUFZLEdBQWxCOzs7Ozs7d0JBQ0ksaUJBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ1oscUJBQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxFQUFBOzt3QkFBMUQsTUFBTSxHQUFHLFNBQWlEO3dCQUMxRCxXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsa0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDaEMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQ2pDO0lBQ0wsZ0JBQUM7QUFBRCxDQWpJQSxBQWlJQyxJQUFBOztBQUNZLFFBQUEsU0FBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMQVlFUiB9IGZyb20gJy4uL2RlZmluZS9UeXBlRGVmaW5lJztcbmltcG9ydCBUaXBzIGZyb20gJy4uL3B1bGljQ29tL1RpcHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVaW1hbmFnZXIge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnM6IFVpbWFuYWdlcjtcbiAgICBwdWJsaWMgc3RhdGljIGdldCBpbnN0YW5jZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbnMpIHtcbiAgICAgICAgICAgIHRoaXMuX2lucyA9IG5ldyBVaW1hbmFnZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnM7XG4gICAgfVxuXG4gICAgLy8g5bGC57qn5L6d5omY55qE5Zy65pmvXG4gICAgc2NlbmU6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgLy8g5bGC57qnXG4gICAgbGF5ZXJBcnI6IGNjLk5vZGVbXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoKSB7IH1cblxuICAgIGluaXQobm9kZTogY2MuTm9kZSkge1xuICAgICAgICB0aGlzLnNjZW5lID0gbm9kZTtcbiAgICAgICAgdGhpcy5pbml0TGF5ZXIoKTtcbiAgICB9XG5cbiAgICBpbml0TGF5ZXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMubGF5ZXJBcnIgPSBbXTtcblxuICAgICAgICAvLyBVSeWxglxuICAgICAgICBjb25zdCBub2RlX3VpID0gbmV3IGNjLk5vZGUoTEFZRVIuVUkpO1xuICAgICAgICBub2RlX3VpLndpZHRoID0gdGhpcy5zY2VuZS53aWR0aDtcbiAgICAgICAgbm9kZV91aS5oZWlnaHQgPSB0aGlzLnNjZW5lLmhlaWdodDtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGRDaGlsZChub2RlX3VpKTtcbiAgICAgICAgdGhpcy5sYXllckFyci5wdXNoKG5vZGVfdWkpO1xuXG4gICAgICAgIC8vIOW8ueeql+WxglxuICAgICAgICBjb25zdCBub2RlX2RpYWxvZyA9IG5ldyBjYy5Ob2RlKExBWUVSLkRJQUxPRyk7XG4gICAgICAgIG5vZGVfZGlhbG9nLndpZHRoID0gdGhpcy5zY2VuZS53aWR0aDtcbiAgICAgICAgbm9kZV9kaWFsb2cuaGVpZ2h0ID0gdGhpcy5zY2VuZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQobm9kZV9kaWFsb2cpO1xuICAgICAgICB0aGlzLmxheWVyQXJyLnB1c2gobm9kZV9kaWFsb2cpO1xuXG4gICAgICAgIC8vIOaPkOekuuWxglxuICAgICAgICBjb25zdCBub2RlX3RpcCA9IG5ldyBjYy5Ob2RlKExBWUVSLlRJUCk7XG4gICAgICAgIG5vZGVfdGlwLndpZHRoID0gdGhpcy5zY2VuZS53aWR0aDtcbiAgICAgICAgbm9kZV90aXAuaGVpZ2h0ID0gdGhpcy5zY2VuZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQobm9kZV90aXApO1xuICAgICAgICB0aGlzLmxheWVyQXJyLnB1c2gobm9kZV90aXApO1xuXG4gICAgICAgIC8vIOW8leWvvOWxglxuICAgICAgICBjb25zdCBub2RlX2d1aWRlID0gbmV3IGNjLk5vZGUoTEFZRVIuR1VJREUpO1xuICAgICAgICBub2RlX2d1aWRlLndpZHRoID0gdGhpcy5zY2VuZS53aWR0aDtcbiAgICAgICAgbm9kZV9ndWlkZS5oZWlnaHQgPSB0aGlzLnNjZW5lLmhlaWdodDtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGRDaGlsZChub2RlX2d1aWRlKTtcbiAgICAgICAgdGhpcy5sYXllckFyci5wdXNoKG5vZGVfZ3VpZGUpO1xuICAgIH1cblxuICAgIGdldExheWVyKG5hbWU6IExBWUVSKTogY2MuTm9kZSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLnNjZW5lLmdldENoaWxkQnlOYW1lKG5hbWUpO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICBhZGQobm9kZTogY2MuTm9kZSwgbGF5ZXJUeXBlOiBMQVlFUikge1xuICAgICAgICBjb25zdCBsYXllck5vZGUgPSB0aGlzLmdldExheWVyKGxheWVyVHlwZSk7XG5cbiAgICAgICAgaWYgKCFsYXllck5vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignVUlNYW5hZ2VyOiDmsqHmnInov5nkuKrlsYLnuqcnLCBsYXllclR5cGUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGF5ZXJOb2RlLmFkZENoaWxkKG5vZGUpO1xuICAgIH1cblxuICAgIC8vIOWKqOaAgeaYvuekuumcgOimgeeahOWxgue6p1xuICAgIHVkcGF0ZUxheWVyU2hvdygpOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxheWVyQXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmxheWVyQXJyW2ldLmFjdGl2ZSA9IHRoaXMubGF5ZXJBcnJbaV0uY2hpbGRyZW5Db3VudCA+IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDpooTliLbku7bliqDovb1cbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqL1xuICAgIGFzeW5jIGxvYWRQcmVmYWIocGF0aDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWQgPSBhc3luYyAoKSA9PiBuZXcgUHJvbWlzZSgocnN2LCByanQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3QgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgW2xvYWRQZWZhYiB0aW1lb3V0XSAke3BhdGh95Yqg6L296LaF5pe2YClcbiAgICAgICAgICAgICAgICAgICAgcmp0KGBsb2FkUGVmYWIg6L+e5o6l6LaF5pe2JHtwYXRofWApO1xuICAgICAgICAgICAgICAgIH0sIDEwMDAwKTtcbiAgICAgICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChwYXRoLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRvdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmp0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByc3YocmVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgYXdhaXQgbG9hZCgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOaYvuekuuaPkOekulxuICAgICAqIEBwYXJhbSBtc2dcbiAgICAgKi9cbiAgICBhc3luYyBzaG93VGlwcyhtc2c6IHN0cmluZykge1xuICAgICAgICBjb25zdCB0aXBzUHJlZmFiID0gYXdhaXQgdGhpcy5sb2FkUHJlZmFiKCdwcmVmYWIvY29tL3RpcHMnKTtcbiAgICAgICAgY29uc3QgdGlwc05vZGUgPSBjYy5pbnN0YW50aWF0ZSh0aXBzUHJlZmFiKTtcbiAgICAgICAgdGhpcy5hZGQodGlwc05vZGUsIExBWUVSLlRJUCk7XG4gICAgICAgIHRpcHNOb2RlLmdldENvbXBvbmVudChUaXBzKS5zaG93VGlwcyhtc2cpO1xuICAgICAgICB0aXBzTm9kZS5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICB9XG5cbiAgICAvKiog57uT566XICovXG4gICAgYXN5bmMgc2hvd0dhbWVPdmVyKCkge1xuICAgICAgICB1aW1hbmFnZXIuc2hvd1RpcHMoJ+a4uOaIj+e7k+adnycpO1xuICAgICAgICBjb25zdCBwcmVmYWIgPSBhd2FpdCB0aGlzLmxvYWRQcmVmYWIoJ3ByZWZhYi96eXgvYWNjb3VudERpYWxvZycpO1xuICAgICAgICBjb25zdCBhY2NvdW50Tm9kZSA9IGNjLmluc3RhbnRpYXRlKHByZWZhYik7XG4gICAgICAgIHRoaXMuYWRkKGFjY291bnROb2RlLCBMQVlFUi5VSSk7XG4gICAgICAgIGFjY291bnROb2RlLnNldFBvc2l0aW9uKDAsIDApO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCB1aW1hbmFnZXIgPSBVaW1hbmFnZXIuaW5zdGFuY2U7XG4iXX0=
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/util/WxApiManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'eb26chNJvdCfJGmYGbMrQpV', 'WxApiManager');
// script/merge/util/WxApiManager.ts

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
exports.wxApiManager = exports.WxApiManager = void 0;
var WxApiManager = /** @class */ (function (_super) {
    __extends(WxApiManager, _super);
    function WxApiManager() {
        return _super.call(this) || this;
    }
    Object.defineProperty(WxApiManager.prototype, "checkWxEnv", {
        // 检查微信环境
        get: function () {
            return window['wx'];
        },
        enumerable: false,
        configurable: true
    });
    WxApiManager.prototype.onShow = function () {
        if (!this.checkWxEnv)
            return;
        wx.onShow(function () {
            console.log('onShow');
        });
    };
    WxApiManager.prototype.onHide = function () {
        if (!this.checkWxEnv)
            return;
        wx.onHide(function () {
            console.log('onHide');
        });
    };
    WxApiManager.prototype.share = function (title) {
        if (!this.checkWxEnv)
            return;
        wx.shareAppMessage({
            title: title,
        });
    };
    WxApiManager.Instance = new WxApiManager();
    return WxApiManager;
}(cc.EventTarget));
exports.WxApiManager = WxApiManager;
exports.wxApiManager = WxApiManager.Instance;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9XeEFwaU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0lBQWtDLGdDQUFjO0lBRzVDO2VBQ0ksaUJBQU87SUFDWCxDQUFDO0lBR0Qsc0JBQVksb0NBQVU7UUFEdEIsU0FBUzthQUNUO1lBQ0ksT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsQ0FBQzs7O09BQUE7SUFFRCw2QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO1lBQUUsT0FBTztRQUM3QixFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFRCw2QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO1lBQUUsT0FBTztRQUM3QixFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFRCw0QkFBSyxHQUFMLFVBQU0sS0FBYTtRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtZQUFFLE9BQU87UUFDN0IsRUFBRSxDQUFDLGVBQWUsQ0FBQztZQUNmLEtBQUssRUFBRSxLQUFLO1NBQ2YsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQTlCc0IscUJBQVEsR0FBaUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQStCdkUsbUJBQUM7Q0FoQ0QsQUFnQ0MsQ0FoQ2lDLEVBQUUsQ0FBQyxXQUFXLEdBZ0MvQztBQWhDWSxvQ0FBWTtBQWtDWixRQUFBLFlBQVksR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIFd4QXBpTWFuYWdlciBleHRlbmRzIGNjLkV2ZW50VGFyZ2V0IHtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEluc3RhbmNlOiBXeEFwaU1hbmFnZXIgPSBuZXcgV3hBcGlNYW5hZ2VyKCk7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIC8vIOajgOafpeW+ruS/oeeOr+Wig1xuICAgIHByaXZhdGUgZ2V0IGNoZWNrV3hFbnYoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB3aW5kb3dbJ3d4J107XG4gICAgfVxuXG4gICAgb25TaG93KCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuY2hlY2tXeEVudikgcmV0dXJuO1xuICAgICAgICB3eC5vblNob3coKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ29uU2hvdycpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIG9uSGlkZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmNoZWNrV3hFbnYpIHJldHVybjtcbiAgICAgICAgd3gub25IaWRlKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvbkhpZGUnKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBzaGFyZSh0aXRsZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5jaGVja1d4RW52KSByZXR1cm47XG4gICAgICAgIHd4LnNoYXJlQXBwTWVzc2FnZSh7XG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5leHBvcnQgY29uc3Qgd3hBcGlNYW5hZ2VyID0gV3hBcGlNYW5hZ2VyLkluc3RhbmNlO1xuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/manager/AudioMgr.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b545bFTIb1JV5LuLuiz55fk', 'AudioMgr');
// script/merge/manager/AudioMgr.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioMgr = exports.SHAKE_TYPE = exports.SoundType = exports.MusicType = void 0;
// 背景音乐类型
var MusicType;
(function (MusicType) {
})(MusicType = exports.MusicType || (exports.MusicType = {}));
// 音效类型
var SoundType;
(function (SoundType) {
    SoundType["MOVE_COIN"] = "moveCoin";
    SoundType["PRODUCE_COIN"] = "produceCoin";
    SoundType["MERGE_COIN"] = "mergeCoin";
    SoundType["ERROR"] = "error";
    SoundType["ZYX_START"] = "sound_start";
    SoundType["ZYX_END"] = "sound_endding";
    SoundType["ZYX_DROP"] = "sound_drop";
    SoundType["ZYX_MUSIC_MAIN"] = "music_main1";
    SoundType["ZYX_MUSIC_GAME"] = "music_game";
})(SoundType = exports.SoundType || (exports.SoundType = {}));
// 震动类型
var SHAKE_TYPE;
(function (SHAKE_TYPE) {
    SHAKE_TYPE["HEAVY"] = "heavy";
    SHAKE_TYPE["MEDIUM"] = "medium";
    SHAKE_TYPE["LIGHT"] = "light";
    SHAKE_TYPE["SUPER_HEAVY"] = "";
})(SHAKE_TYPE = exports.SHAKE_TYPE || (exports.SHAKE_TYPE = {}));
var AudioMgr = /** @class */ (function () {
    function AudioMgr() {
        this.soundClipCache = {};
        this.audioIds = {};
        // 音量
        this.musicVolume = null;
        this.soundVolume = null;
        this.curBgMusicUrl = null;
        this.canPlayMusic = true;
        this.canPlaySound = true; //!GameConfig.DEBUG;
        // 当前播放的背景音乐的播放索引
        this.musicId = -1;
    }
    AudioMgr.prototype.init = function () {
        cc.log("audioMgr init");
        this.curBgMusicUrl = null;
        this.musicVolume = 0.2;
        this.soundVolume = 1.0;
        this.canPlayMusic = true;
        this.canPlaySound = true;
    };
    // 音乐
    AudioMgr.prototype.playBGM = function (url) {
        var _this = this;
        // 如果已经播放着就不播放了
        if (this.curBgMusicUrl && this.curBgMusicUrl == url)
            return;
        this.curBgMusicUrl = url;
        if (this.canPlayMusic) {
            this.stopBGM();
            cc.resources.load("sounds/" + url, function (err, clip) {
                if (_this.curBgMusicUrl == url) {
                    cc.audioEngine.stopAll();
                    _this.musicId = cc.audioEngine.play(clip, true, _this.musicVolume);
                }
                else {
                    console.log("播放背景音乐失败:", err);
                }
            });
        }
    };
    AudioMgr.prototype.stopBGM = function () {
        cc.audioEngine.stop(this.musicId);
    };
    // /**
    //  * 同步加载声音资源
    //  * @param url 
    //  */
    // async preloadAudioClip(soundName: string) {
    //     if (!this._sfxEnabled) {
    //         return;
    //     }
    //     cc.resources.preload(`sounds/${soundName}`, cc.AudioClip)
    // }
    // 播放音效
    AudioMgr.prototype.playSound = function (soundType, volume, ext, loop, isFromNet, onStart) {
        var _this = this;
        if (volume === void 0) { volume = this.soundVolume; }
        if (ext === void 0) { ext = ".mp3"; }
        if (loop === void 0) { loop = false; }
        if (isFromNet === void 0) { isFromNet = false; }
        if (this.canPlaySound) {
            var url_1 = "sounds/" + soundType;
            if (this.soundClipCache["" + url_1]) {
                var audioId = cc.audioEngine.play(this.soundClipCache["" + url_1], loop, volume);
                onStart && onStart();
            }
            else {
                if (isFromNet) {
                    if (!url_1.startsWith("https://")) {
                        onStart && onStart();
                        return;
                    }
                    cc.assetManager.loadRemote(url_1, { ext: ext }, function (err, clip) {
                        if (!err) {
                            var audioId = cc.audioEngine.play(clip, loop, volume);
                            _this.audioIds[url_1] = audioId;
                        }
                        else {
                            console.error(err);
                        }
                        onStart && onStart();
                    });
                }
                else {
                    cc.resources.load(url_1, (function (err, clip) {
                        if (!err) {
                            var audioId = cc.audioEngine.play(clip, loop, volume);
                            _this.soundClipCache["" + url_1] = clip;
                            _this.audioIds[url_1] = audioId;
                        }
                        else {
                            console.error(err);
                        }
                        onStart && onStart();
                    }));
                }
            }
        }
        else {
            onStart && onStart();
        }
    };
    AudioMgr.prototype.stopSoundByUrl = function (url) {
        var audioId = this.audioIds[url];
        if (audioId != null) {
            cc.audioEngine.stop(audioId);
        }
    };
    AudioMgr.prototype.stopSound = function (audioId) {
        console.log("audioId", audioId);
        if (audioId != null) {
            cc.audioEngine.stop(audioId);
        }
    };
    // 暂停
    AudioMgr.prototype.pauseBGM = function () {
        if (this.musicId >= 0) {
            cc.audioEngine.pause(this.musicId);
        }
    };
    // 恢复
    AudioMgr.prototype.resumeBGM = function () {
        if (this.musicId >= 0) {
            cc.audioEngine.resume(this.musicId);
        }
    };
    // 卸载音效
    AudioMgr.prototype.uncache = function (url) {
        var audioUrl = cc.url.raw(url);
        cc.audioEngine.uncache(audioUrl);
        this.soundClipCache["" + url] = undefined;
    };
    AudioMgr.prototype.uncacheAll = function () {
        cc.audioEngine.uncacheAll();
        this.soundClipCache = {};
    };
    AudioMgr.prototype.pauseAll = function () {
        console.log('Pause All Sound');
        cc.audioEngine.pauseAll();
    };
    AudioMgr.prototype.resumeAll = function () {
        console.log('Resum All Sound');
        cc.audioEngine.resumeAll();
    };
    AudioMgr.prototype.stopAll = function () {
        cc.audioEngine.stopAll();
    };
    AudioMgr.prototype.clean = function () {
        this.stopAll();
        this.uncacheAll();
        this.curBgMusicUrl = '';
        this.musicId = -1;
    };
    AudioMgr.prototype.shake = function (type) {
        if (!window['wx'])
            return;
        if (type === SHAKE_TYPE.SUPER_HEAVY) {
            wx.vibrateLong();
        }
        else {
            wx.vibrateShort({ type: type });
        }
    };
    AudioMgr.Instance = new AudioMgr();
    return AudioMgr;
}());
exports.default = AudioMgr;
exports.audioMgr = AudioMgr.Instance;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9BdWRpb01nci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTO0FBQ1QsSUFBWSxTQUVYO0FBRkQsV0FBWSxTQUFTO0FBRXJCLENBQUMsRUFGVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUVwQjtBQUVELE9BQU87QUFDUCxJQUFZLFNBWVg7QUFaRCxXQUFZLFNBQVM7SUFDakIsbUNBQXNCLENBQUE7SUFDdEIseUNBQTRCLENBQUE7SUFDNUIscUNBQXdCLENBQUE7SUFDeEIsNEJBQWUsQ0FBQTtJQUVmLHNDQUF5QixDQUFBO0lBQ3pCLHNDQUF5QixDQUFBO0lBQ3pCLG9DQUF1QixDQUFBO0lBRXZCLDJDQUE4QixDQUFBO0lBQzlCLDBDQUE2QixDQUFBO0FBQ2pDLENBQUMsRUFaVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQVlwQjtBQUVELE9BQU87QUFDUCxJQUFZLFVBS1g7QUFMRCxXQUFZLFVBQVU7SUFDbEIsNkJBQWUsQ0FBQTtJQUNmLCtCQUFpQixDQUFBO0lBQ2pCLDZCQUFlLENBQUE7SUFDZiw4QkFBZ0IsQ0FBQTtBQUNwQixDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7QUFFRDtJQUdJO1FBR1EsbUJBQWMsR0FBRyxFQUV4QixDQUFDO1FBQ00sYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUV0QixLQUFLO1FBQ0csZ0JBQVcsR0FBVyxJQUFJLENBQUE7UUFDMUIsZ0JBQVcsR0FBVyxJQUFJLENBQUE7UUFFMUIsa0JBQWEsR0FBUSxJQUFJLENBQUM7UUFDMUIsaUJBQVksR0FBWSxJQUFJLENBQUM7UUFDN0IsaUJBQVksR0FBWSxJQUFJLENBQUMsQ0FBQSxvQkFBb0I7UUFFekQsaUJBQWlCO1FBQ1QsWUFBTyxHQUFXLENBQUMsQ0FBQyxDQUFDO0lBaEI3QixDQUFDO0lBa0JELHVCQUFJLEdBQUo7UUFDSSxF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QyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvQixFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRCwwQkFBTyxHQUFQO1FBQ0ksRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsd0JBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCx3QkFBSyxHQUFMLFVBQU0sSUFBZ0I7UUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPO1FBQzFCLElBQUksSUFBSSxLQUFLLFVBQVUsQ0FBQyxXQUFXLEVBQUU7WUFDakMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ3BCO2FBQU07WUFDSCxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxNQUFBLEVBQUUsQ0FBQyxDQUFDO1NBQzdCO0lBQ0wsQ0FBQztJQS9LYSxpQkFBUSxHQUFhLElBQUksUUFBUSxFQUFFLENBQUM7SUFnTHRELGVBQUM7Q0FqTEQsQUFpTEMsSUFBQTtrQkFqTG9CLFFBQVE7QUFrTGhCLFFBQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDog4zmma/pn7PkuZDnsbvlnotcbmV4cG9ydCBlbnVtIE11c2ljVHlwZSB7XG5cbn1cblxuLy8g6Z+z5pWI57G75Z6LXG5leHBvcnQgZW51bSBTb3VuZFR5cGUge1xuICAgIE1PVkVfQ09JTiA9ICdtb3ZlQ29pbicsXG4gICAgUFJPRFVDRV9DT0lOID0gJ3Byb2R1Y2VDb2luJyxcbiAgICBNRVJHRV9DT0lOID0gJ21lcmdlQ29pbicsXG4gICAgRVJST1IgPSAnZXJyb3InLFxuXG4gICAgWllYX1NUQVJUID0gJ3NvdW5kX3N0YXJ0JyxcbiAgICBaWVhfRU5EID0gJ3NvdW5kX2VuZGRpbmcnLFxuICAgIFpZWF9EUk9QID0gJ3NvdW5kX2Ryb3AnLFxuXG4gICAgWllYX01VU0lDX01BSU4gPSAnbXVzaWNfbWFpbjEnLFxuICAgIFpZWF9NVVNJQ19HQU1FID0gJ211c2ljX2dhbWUnLFxufVxuXG4vLyDpnIfliqjnsbvlnotcbmV4cG9ydCBlbnVtIFNIQUtFX1RZUEUge1xuICAgIEhFQVZZID0gJ2hlYXZ5JyxcbiAgICBNRURJVU0gPSAnbWVkaXVtJyxcbiAgICBMSUdIVCA9ICdsaWdodCcsXG4gICAgU1VQRVJfSEVBVlkgPSAnJyxcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXVkaW9NZ3Ige1xuICAgIHB1YmxpYyBzdGF0aWMgSW5zdGFuY2U6IEF1ZGlvTWdyID0gbmV3IEF1ZGlvTWdyKCk7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuICAgIHByaXZhdGUgc291bmRDbGlwQ2FjaGUgPSB7XG5cbiAgICB9O1xuICAgIHByaXZhdGUgYXVkaW9JZHMgPSB7fTtcblxuICAgIC8vIOmfs+mHj1xuICAgIHByaXZhdGUgbXVzaWNWb2x1bWU6IG51bWJlciA9IG51bGxcbiAgICBwcml2YXRlIHNvdW5kVm9sdW1lOiBudW1iZXIgPSBudWxsXG5cbiAgICBwcml2YXRlIGN1ckJnTXVzaWNVcmw6IGFueSA9IG51bGw7XG4gICAgcHJpdmF0ZSBjYW5QbGF5TXVzaWM6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgY2FuUGxheVNvdW5kOiBib29sZWFuID0gdHJ1ZTsvLyFHYW1lQ29uZmlnLkRFQlVHO1xuXG4gICAgLy8g5b2T5YmN5pKt5pS+55qE6IOM5pmv6Z+z5LmQ55qE5pKt5pS+57Si5byVXG4gICAgcHJpdmF0ZSBtdXNpY0lkOiBudW1iZXIgPSAtMTtcblxuICAgIGluaXQoKSB7XG4gICAgICAgIGNjLmxvZyhcImF1ZGlvTWdyIGluaXRcIik7XG4gICAgICAgIHRoaXMuY3VyQmdNdXNpY1VybCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5tdXNpY1ZvbHVtZSA9IDAuMjtcbiAgICAgICAgdGhpcy5zb3VuZFZvbHVtZSA9IDEuMDtcblxuICAgICAgICB0aGlzLmNhblBsYXlNdXNpYyA9IHRydWU7XG4gICAgICAgIHRoaXMuY2FuUGxheVNvdW5kID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyDpn7PkuZBcbiAgICBwdWJsaWMgcGxheUJHTSh1cmwpIHtcbiAgICAgICAgLy8g5aaC5p6c5bey57uP5pKt5pS+552A5bCx5LiN5pKt5pS+5LqGXG4gICAgICAgIGlmICh0aGlzLmN1ckJnTXVzaWNVcmwgJiYgdGhpcy5jdXJCZ011c2ljVXJsID09IHVybCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuY3VyQmdNdXNpY1VybCA9IHVybDtcbiAgICAgICAgaWYgKHRoaXMuY2FuUGxheU11c2ljKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BCR00oKTtcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKGBzb3VuZHMvJHt1cmx9YCwgKGVyciwgY2xpcDogY2MuQXVkaW9DbGlwKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VyQmdNdXNpY1VybCA9PSB1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm11c2ljSWQgPSBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIHRydWUsIHRoaXMubXVzaWNWb2x1bWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5pKt5pS+6IOM5pmv6Z+z5LmQ5aSx6LSlOlwiLCBlcnIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcEJHTSgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcCh0aGlzLm11c2ljSWQpO1xuICAgIH1cblxuICAgIC8vIC8qKlxuICAgIC8vICAqIOWQjOatpeWKoOi9veWjsOmfs+i1hOa6kFxuICAgIC8vICAqIEBwYXJhbSB1cmwgXG4gICAgLy8gICovXG4gICAgLy8gYXN5bmMgcHJlbG9hZEF1ZGlvQ2xpcChzb3VuZE5hbWU6IHN0cmluZykge1xuICAgIC8vICAgICBpZiAoIXRoaXMuX3NmeEVuYWJsZWQpIHtcbiAgICAvLyAgICAgICAgIHJldHVybjtcbiAgICAvLyAgICAgfVxuXG4gICAgLy8gICAgIGNjLnJlc291cmNlcy5wcmVsb2FkKGBzb3VuZHMvJHtzb3VuZE5hbWV9YCwgY2MuQXVkaW9DbGlwKVxuICAgIC8vIH1cblxuICAgIC8vIOaSreaUvumfs+aViFxuICAgIHB1YmxpYyBwbGF5U291bmQoc291bmRUeXBlOiBzdHJpbmcsIHZvbHVtZTogYW55ID0gdGhpcy5zb3VuZFZvbHVtZSwgZXh0OiBzdHJpbmcgPSBcIi5tcDNcIiwgbG9vcDogYm9vbGVhbiA9IGZhbHNlLCBpc0Zyb21OZXQ6IGJvb2xlYW4gPSBmYWxzZSwgb25TdGFydD86IEZ1bmN0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmNhblBsYXlTb3VuZCkge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYHNvdW5kcy8ke3NvdW5kVHlwZX1gO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdWRpb0lkID0gY2MuYXVkaW9FbmdpbmUucGxheSh0aGlzLnNvdW5kQ2xpcENhY2hlW2Ake3VybH1gXSwgbG9vcCwgdm9sdW1lKTtcbiAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRnJvbU5ldCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXVybC5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNjLmFzc2V0TWFuYWdlci5sb2FkUmVtb3RlKHVybCwgeyBleHQ6IGV4dCB9LCAoZXJyLCBjbGlwOiBjYy5BdWRpb0NsaXApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXVkaW9JZCA9IGNjLmF1ZGlvRW5naW5lLnBsYXkoY2xpcCwgbG9vcCwgdm9sdW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvSWRzW3VybF0gPSBhdWRpb0lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQodXJsLCAoKGVyciwgY2xpcDogY2MuQXVkaW9DbGlwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF1ZGlvSWQgPSBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIGxvb3AsIHZvbHVtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0gPSBjbGlwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9JZHNbdXJsXSA9IGF1ZGlvSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25TdGFydCAmJiBvblN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHN0b3BTb3VuZEJ5VXJsKHVybCkge1xuICAgICAgICBsZXQgYXVkaW9JZCA9IHRoaXMuYXVkaW9JZHNbdXJsXTtcbiAgICAgICAgaWYgKGF1ZGlvSWQgIT0gbnVsbCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcChhdWRpb0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wU291bmQoYXVkaW9JZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImF1ZGlvSWRcIiwgYXVkaW9JZCk7XG4gICAgICAgIGlmIChhdWRpb0lkICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3AoYXVkaW9JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmmoLlgZxcbiAgICBwdWJsaWMgcGF1c2VCR00oKSB7XG4gICAgICAgIGlmICh0aGlzLm11c2ljSWQgPj0gMCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGF1c2UodGhpcy5tdXNpY0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOaBouWkjVxuICAgIHB1YmxpYyByZXN1bWVCR00oKSB7XG4gICAgICAgIGlmICh0aGlzLm11c2ljSWQgPj0gMCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucmVzdW1lKHRoaXMubXVzaWNJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDljbjovb3pn7PmlYhcbiAgICB1bmNhY2hlKHVybCkge1xuICAgICAgICBjb25zdCBhdWRpb1VybDogYW55ID0gY2MudXJsLnJhdyh1cmwpO1xuICAgICAgICBjYy5hdWRpb0VuZ2luZS51bmNhY2hlKGF1ZGlvVXJsKTtcbiAgICAgICAgdGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0gPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdW5jYWNoZUFsbCgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUudW5jYWNoZUFsbCgpO1xuICAgICAgICB0aGlzLnNvdW5kQ2xpcENhY2hlID0ge307XG4gICAgfVxuXG4gICAgcGF1c2VBbGwoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQYXVzZSBBbGwgU291bmQnKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGF1c2VBbGwoKTtcbiAgICB9XG5cbiAgICByZXN1bWVBbGwoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSZXN1bSBBbGwgU291bmQnKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucmVzdW1lQWxsKCk7XG4gICAgfVxuXG4gICAgc3RvcEFsbCgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xuICAgIH1cblxuICAgIGNsZWFuKCkge1xuICAgICAgICB0aGlzLnN0b3BBbGwoKTtcbiAgICAgICAgdGhpcy51bmNhY2hlQWxsKCk7XG4gICAgICAgIHRoaXMuY3VyQmdNdXNpY1VybCA9ICcnO1xuICAgICAgICB0aGlzLm11c2ljSWQgPSAtMTtcbiAgICB9XG5cbiAgICBzaGFrZSh0eXBlOiBTSEFLRV9UWVBFKSB7XG4gICAgICAgIGlmICghd2luZG93Wyd3eCddKSByZXR1cm47XG4gICAgICAgIGlmICh0eXBlID09PSBTSEFLRV9UWVBFLlNVUEVSX0hFQVZZKSB7XG4gICAgICAgICAgICB3eC52aWJyYXRlTG9uZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd3gudmlicmF0ZVNob3J0KHsgdHlwZSB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBhdWRpb01nciA9IEF1ZGlvTWdyLkluc3RhbmNlOyJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/pulicCom/Tips.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '62421poWOhEyaA6Xq8Q9pp/', 'Tips');
// script/merge/pulicCom/Tips.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 提示消息
var Tips = /** @class */ (function (_super) {
    __extends(Tips, _super);
    function Tips() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblTips = null;
        _this.uImgBg = null;
        return _this;
    }
    Tips.prototype.onLoad = function () {
        this.node.opacity = 0;
    };
    Tips.prototype.start = function () {
    };
    Tips.prototype.showTips = function (msg) {
        var _this = this;
        this.ulblTips.string = msg;
        this.node.y = -200;
        this.node.opacity = 0;
        cc.tween(this.node)
            .to(0.6, { opacity: 255, y: 0 }, { easing: 'cubicInOut' })
            .delay(1)
            .to(0.8, { opacity: 0, y: 50 }, { easing: 'cubicInOut' })
            .call(function () {
            _this.node.removeFromParent();
        })
            .start();
    };
    __decorate([
        property(cc.Label)
    ], Tips.prototype, "ulblTips", void 0);
    __decorate([
        property(cc.Sprite)
    ], Tips.prototype, "uImgBg", void 0);
    Tips = __decorate([
        ccclass
    ], Tips);
    return Tips;
}(cc.Component));
exports.default = Tips;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvcHVsaWNDb20vVGlwcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxPQUFPO0FBRVA7SUFBa0Msd0JBQVk7SUFBOUM7UUFBQSxxRUE2QkM7UUExQkcsY0FBUSxHQUFhLElBQUksQ0FBQztRQUcxQixZQUFNLEdBQWMsSUFBSSxDQUFDOztJQXVCN0IsQ0FBQztJQXJCRyxxQkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxvQkFBSyxHQUFMO0lBRUEsQ0FBQztJQUVELHVCQUFRLEdBQVIsVUFBUyxHQUFXO1FBQXBCLGlCQVlDO1FBWEcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUN0QixFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDZCxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLENBQUM7YUFDekQsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNSLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsQ0FBQzthQUN4RCxJQUFJLENBQUM7WUFDRixLQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQXpCRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzBDQUNPO0lBRzFCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7d0NBQ0s7SUFOUixJQUFJO1FBRHhCLE9BQU87T0FDYSxJQUFJLENBNkJ4QjtJQUFELFdBQUM7Q0E3QkQsQUE2QkMsQ0E3QmlDLEVBQUUsQ0FBQyxTQUFTLEdBNkI3QztrQkE3Qm9CLElBQUkiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG4vLyDmj5DnpLrmtojmga9cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaXBzIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB1bGJsVGlwczogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLlNwcml0ZSlcbiAgICB1SW1nQmc6IGNjLlNwcml0ZSA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMDtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcblxuICAgIH1cblxuICAgIHNob3dUaXBzKG1zZzogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMudWxibFRpcHMuc3RyaW5nID0gbXNnO1xuICAgICAgICB0aGlzLm5vZGUueSA9IC0yMDA7XG4gICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgY2MudHdlZW4odGhpcy5ub2RlKVxuICAgICAgICAgICAgLnRvKDAuNiwgeyBvcGFjaXR5OiAyNTUsIHk6IDAgfSwgeyBlYXNpbmc6ICdjdWJpY0luT3V0JyB9KVxuICAgICAgICAgICAgLmRlbGF5KDEpXG4gICAgICAgICAgICAudG8oMC44LCB7IG9wYWNpdHk6IDAsIHk6IDUwIH0sIHsgZWFzaW5nOiAnY3ViaWNJbk91dCcgfSlcbiAgICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUucmVtb3ZlRnJvbVBhcmVudCgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGFydCgpO1xuICAgIH1cbn1cbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxMainScene.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '384e0soW69C1KpfJCgBwNkn', 'ZyxMainScene');
// script/merge/zyxGame/ZyxMainScene.ts

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
var TypeDefine_1 = require("../define/TypeDefine");
var AudioMgr_1 = require("../manager/AudioMgr");
var Uimanager_1 = require("../manager/Uimanager");
var ZyxComTop_1 = require("./ZyxComTop");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 游戏主场景
var ZyxMainScene = /** @class */ (function (_super) {
    __extends(ZyxMainScene, _super);
    function ZyxMainScene() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uBtnStart = null;
        _this.topCom = null;
        return _this;
    }
    ZyxMainScene.prototype.onLoad = function () {
        console.log('load ZyxMainScene');
        this.uBtnStart.on(cc.Node.EventType.TOUCH_END, this.onStart, this);
        this.uBtnStart.active = false;
    };
    ZyxMainScene.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 初始化界面层级
                        Uimanager_1.uimanager.init(this.node);
                        return [4 /*yield*/, this.initTopCom()];
                    case 1:
                        _a.sent();
                        // login
                        PlayerModule_1.playerModule.login(function () {
                            // 初始化音频
                            AudioMgr_1.audioMgr.init();
                            _this.initUI();
                            AudioMgr_1.audioMgr.playBGM(AudioMgr_1.SoundType.ZYX_MUSIC_MAIN);
                        });
                        this.onShow();
                        this.onHide();
                        return [2 /*return*/];
                }
            });
        });
    };
    ZyxMainScene.prototype.update = function () {
        Uimanager_1.uimanager.udpateLayerShow();
    };
    ZyxMainScene.prototype.onStart = function () {
        AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.ZYX_START);
        AudioMgr_1.audioMgr.stopBGM();
        this.initGamePanel();
    };
    // 初始化游戏主场景信息
    ZyxMainScene.prototype.initUI = function () {
        this.uBtnStart.active = true;
        this.topCom.getComponent(ZyxComTop_1.default).init();
    };
    // 初始化顶部信息
    ZyxMainScene.prototype.initTopCom = function () {
        return __awaiter(this, void 0, void 0, function () {
            var topPre, topNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/zyx/uComTop')];
                    case 1:
                        topPre = _a.sent();
                        topNode = cc.instantiate(topPre);
                        Uimanager_1.uimanager.add(topNode, TypeDefine_1.LAYER.UI);
                        topNode.setPosition(new cc.Vec2(0, cc.winSize.height / 2 - topNode.height / 2 - 50));
                        this.topCom = topNode;
                        return [2 /*return*/];
                }
            });
        });
    };
    // 初始化游戏界面
    ZyxMainScene.prototype.initGamePanel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prefab, gameNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/zyx/zyxGame')];
                    case 1:
                        prefab = _a.sent();
                        gameNode = cc.instantiate(prefab);
                        Uimanager_1.uimanager.add(gameNode, TypeDefine_1.LAYER.UI);
                        gameNode.setPosition(new cc.Vec2(0, 0));
                        return [2 /*return*/];
                }
            });
        });
    };
    ZyxMainScene.prototype.onShow = function () {
        if (!window['wx'])
            return;
        wx.onShow(function () {
            console.log('onShow');
        });
    };
    ZyxMainScene.prototype.onHide = function () {
        if (!window['wx'])
            return;
        wx.onHide(function () {
            console.log('onHide');
        });
    };
    __decorate([
        property(cc.Node)
    ], ZyxMainScene.prototype, "uBtnStart", void 0);
    ZyxMainScene = __decorate([
        ccclass
    ], ZyxMainScene);
    return ZyxMainScene;
}(cc.Component));
exports.default = ZyxMainScene;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhNYWluU2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQTBEO0FBQzFELG1EQUE2QztBQUM3QyxnREFBMEQ7QUFDMUQsa0RBQWlEO0FBQ2pELHlDQUFvQztBQUU5QixJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxRQUFRO0FBRVI7SUFBMEMsZ0NBQVk7SUFBdEQ7UUFBQSxxRUFpRkM7UUE5RUcsZUFBUyxHQUFZLElBQUksQ0FBQztRQUVuQixZQUFNLEdBQWMsSUFBSSxDQUFDOztJQTRFcEMsQ0FBQztJQTFFRyw2QkFBTSxHQUFOO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBRUssNEJBQUssR0FBWDs7Ozs7O3dCQUNJLFVBQVU7d0JBQ1YscUJBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUUxQixxQkFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUE7O3dCQUF2QixTQUF1QixDQUFDO3dCQUV4QixRQUFRO3dCQUNSLDJCQUFZLENBQUMsS0FBSyxDQUFDOzRCQUNmLFFBQVE7NEJBQ1IsbUJBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs0QkFFaEIsS0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFDOzRCQUVkLG1CQUFRLENBQUMsT0FBTyxDQUFDLG9CQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQy9DLENBQUMsQ0FBQyxDQUFBO3dCQUVGLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDZCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Ozs7O0tBQ2pCO0lBRUQsNkJBQU0sR0FBTjtRQUNJLHFCQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELDhCQUFPLEdBQVA7UUFDSSxtQkFBUSxDQUFDLFNBQVMsQ0FBQyxvQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hDLG1CQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFHRCxhQUFhO0lBQ2IsNkJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxtQkFBUyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELFVBQVU7SUFDSixpQ0FBVSxHQUFoQjs7Ozs7NEJBQ21CLHFCQUFNLHFCQUFTLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEVBQUE7O3dCQUF6RCxNQUFNLEdBQUcsU0FBZ0Q7d0JBQ3pELE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUN2QyxxQkFBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsa0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDakMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUVyRixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQzs7Ozs7S0FDekI7SUFFRCxVQUFVO0lBQ0osb0NBQWEsR0FBbkI7Ozs7OzRCQUNtQixxQkFBTSxxQkFBUyxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFBOzt3QkFBekQsTUFBTSxHQUFHLFNBQWdEO3dCQUN6RCxRQUFRLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDeEMscUJBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ2xDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUMzQztJQUVELDZCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUFFLE9BQU87UUFDMUIsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBRUQsNkJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTztRQUMxQixFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUE3RUQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzttREFDUTtJQUhULFlBQVk7UUFEaEMsT0FBTztPQUNhLFlBQVksQ0FpRmhDO0lBQUQsbUJBQUM7Q0FqRkQsQUFpRkMsQ0FqRnlDLEVBQUUsQ0FBQyxTQUFTLEdBaUZyRDtrQkFqRm9CLFlBQVkiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwbGF5ZXJNb2R1bGUgfSBmcm9tICcuLi9kYXRhTW9kdWxlL1BsYXllck1vZHVsZSc7XG5pbXBvcnQgeyBMQVlFUiB9IGZyb20gJy4uL2RlZmluZS9UeXBlRGVmaW5lJztcbmltcG9ydCB7IGF1ZGlvTWdyLCBTb3VuZFR5cGUgfSBmcm9tICcuLi9tYW5hZ2VyL0F1ZGlvTWdyJztcbmltcG9ydCB7IHVpbWFuYWdlciB9IGZyb20gJy4uL21hbmFnZXIvVWltYW5hZ2VyJztcbmltcG9ydCBaeXhDb21Ub3AgZnJvbSAnLi9aeXhDb21Ub3AnO1xuXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG4vLyDmuLjmiI/kuLvlnLrmma9cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaeXhNYWluU2NlbmUgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0blN0YXJ0OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIHB1YmxpYyB0b3BDb206IFp5eENvbVRvcCA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdsb2FkIFp5eE1haW5TY2VuZScpO1xuICAgICAgICB0aGlzLnVCdG5TdGFydC5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25TdGFydCwgdGhpcyk7XG4gICAgICAgIHRoaXMudUJ0blN0YXJ0LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGFzeW5jIHN0YXJ0KCkge1xuICAgICAgICAvLyDliJ3lp4vljJbnlYzpnaLlsYLnuqdcbiAgICAgICAgdWltYW5hZ2VyLmluaXQodGhpcy5ub2RlKTtcblxuICAgICAgICBhd2FpdCB0aGlzLmluaXRUb3BDb20oKTtcblxuICAgICAgICAvLyBsb2dpblxuICAgICAgICBwbGF5ZXJNb2R1bGUubG9naW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8g5Yid5aeL5YyW6Z+z6aKRXG4gICAgICAgICAgICBhdWRpb01nci5pbml0KCk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5pdFVJKCk7XG5cbiAgICAgICAgICAgIGF1ZGlvTWdyLnBsYXlCR00oU291bmRUeXBlLlpZWF9NVVNJQ19NQUlOKTtcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLm9uU2hvdygpO1xuICAgICAgICB0aGlzLm9uSGlkZSgpO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgdWltYW5hZ2VyLnVkcGF0ZUxheWVyU2hvdygpO1xuICAgIH1cblxuICAgIG9uU3RhcnQoKTogdm9pZCB7XG4gICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuWllYX1NUQVJUKTtcbiAgICAgICAgYXVkaW9NZ3Iuc3RvcEJHTSgpO1xuICAgICAgICB0aGlzLmluaXRHYW1lUGFuZWwoKTtcbiAgICB9XG5cblxuICAgIC8vIOWIneWni+WMlua4uOaIj+S4u+WcuuaZr+S/oeaBr1xuICAgIGluaXRVSSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51QnRuU3RhcnQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50b3BDb20uZ2V0Q29tcG9uZW50KFp5eENvbVRvcCkuaW5pdCgpO1xuICAgIH1cblxuICAgIC8vIOWIneWni+WMlumhtumDqOS/oeaBr1xuICAgIGFzeW5jIGluaXRUb3BDb20oKSB7XG4gICAgICAgIGNvbnN0IHRvcFByZSA9IGF3YWl0IHVpbWFuYWdlci5sb2FkUHJlZmFiKCdwcmVmYWIvenl4L3VDb21Ub3AnKTtcbiAgICAgICAgY29uc3QgdG9wTm9kZSA9IGNjLmluc3RhbnRpYXRlKHRvcFByZSk7XG4gICAgICAgIHVpbWFuYWdlci5hZGQodG9wTm9kZSwgTEFZRVIuVUkpO1xuICAgICAgICB0b3BOb2RlLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKDAsIGNjLndpblNpemUuaGVpZ2h0IC8gMiAtIHRvcE5vZGUuaGVpZ2h0IC8gMiAtIDUwKSk7XG5cbiAgICAgICAgdGhpcy50b3BDb20gPSB0b3BOb2RlO1xuICAgIH1cblxuICAgIC8vIOWIneWni+WMlua4uOaIj+eVjOmdolxuICAgIGFzeW5jIGluaXRHYW1lUGFuZWwoKSB7XG4gICAgICAgIGNvbnN0IHByZWZhYiA9IGF3YWl0IHVpbWFuYWdlci5sb2FkUHJlZmFiKCdwcmVmYWIvenl4L3p5eEdhbWUnKTtcbiAgICAgICAgY29uc3QgZ2FtZU5vZGUgPSBjYy5pbnN0YW50aWF0ZShwcmVmYWIpO1xuICAgICAgICB1aW1hbmFnZXIuYWRkKGdhbWVOb2RlLCBMQVlFUi5VSSk7XG4gICAgICAgIGdhbWVOb2RlLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKDAsIDApKTtcbiAgICB9XG5cbiAgICBvblNob3coKTogdm9pZCB7XG4gICAgICAgIGlmICghd2luZG93Wyd3eCddKSByZXR1cm47XG4gICAgICAgIHd4Lm9uU2hvdygoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnb25TaG93Jyk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgb25IaWRlKCk6IHZvaWQge1xuICAgICAgICBpZiAoIXdpbmRvd1snd3gnXSkgcmV0dXJuO1xuICAgICAgICB3eC5vbkhpZGUoKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ29uSGlkZScpO1xuICAgICAgICB9KVxuICAgIH1cbn0iXX0=
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxComTop.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ff575bO8YtMEauFEhjl6YgO', 'ZyxComTop');
// script/merge/zyxGame/ZyxComTop.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
var PlayerModule_1 = require("../dataModule/PlayerModule");
var ZyxGameModule_1 = require("../dataModule/ZyxGameModule");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ZyxComTop = /** @class */ (function (_super) {
    __extends(ZyxComTop, _super);
    function ZyxComTop() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uImgExpBar = null;
        _this.ulblLv = null;
        _this.ulblExp = null;
        _this.uImgAvatar = null;
        _this.ulblDiamond = null;
        _this.ulblStar = null;
        return _this;
    }
    ZyxComTop.prototype.onLoad = function () {
    };
    ZyxComTop.prototype.start = function () {
    };
    ZyxComTop.prototype.init = function () {
        this.ulblStar.string = "" + ZyxGameModule_1.zyxGameModule.gameInfo.star;
        this.ulblLv.string = "" + PlayerModule_1.playerModule.lv;
        this.ulblExp.string = PlayerModule_1.playerModule.exp + "/" + PlayerModule_1.playerModule.expTar;
        this.ulblDiamond.string = "" + PlayerModule_1.playerModule.diamond;
        this.ulblStar.string = "" + PlayerModule_1.playerModule.star;
    };
    __decorate([
        property(cc.Node)
    ], ZyxComTop.prototype, "uImgExpBar", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxComTop.prototype, "ulblLv", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxComTop.prototype, "ulblExp", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxComTop.prototype, "uImgAvatar", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxComTop.prototype, "ulblDiamond", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxComTop.prototype, "ulblStar", void 0);
    ZyxComTop = __decorate([
        ccclass
    ], ZyxComTop);
    return ZyxComTop;
}(cc.Component));
exports.default = ZyxComTop;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhDb21Ub3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQTBEO0FBQzFELDZEQUE0RDtBQUV0RCxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUF1Qyw2QkFBWTtJQUFuRDtRQUFBLHFFQW1DQztRQWhDRyxnQkFBVSxHQUFZLElBQUksQ0FBQztRQUczQixZQUFNLEdBQWEsSUFBSSxDQUFDO1FBR3hCLGFBQU8sR0FBYSxJQUFJLENBQUM7UUFHekIsZ0JBQVUsR0FBWSxJQUFJLENBQUM7UUFHM0IsaUJBQVcsR0FBYSxJQUFJLENBQUM7UUFHN0IsY0FBUSxHQUFhLElBQUksQ0FBQzs7SUFpQjlCLENBQUM7SUFmRywwQkFBTSxHQUFOO0lBRUEsQ0FBQztJQUVELHlCQUFLLEdBQUw7SUFFQSxDQUFDO0lBRUQsd0JBQUksR0FBSjtRQUNJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEtBQUcsNkJBQWEsQ0FBQyxRQUFRLENBQUMsSUFBTSxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUcsMkJBQVksQ0FBQyxFQUFJLENBQUM7UUFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQU0sMkJBQVksQ0FBQyxHQUFHLFNBQUksMkJBQVksQ0FBQyxNQUFRLENBQUM7UUFDbkUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBRywyQkFBWSxDQUFDLE9BQVMsQ0FBQztRQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFHLDJCQUFZLENBQUMsSUFBTSxDQUFDO0lBQ2xELENBQUM7SUEvQkQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDUztJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzZDQUNLO0lBR3hCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7OENBQ007SUFHekI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDUztJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2tEQUNVO0lBRzdCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7K0NBQ087SUFsQlQsU0FBUztRQUQ3QixPQUFPO09BQ2EsU0FBUyxDQW1DN0I7SUFBRCxnQkFBQztDQW5DRCxBQW1DQyxDQW5Dc0MsRUFBRSxDQUFDLFNBQVMsR0FtQ2xEO2tCQW5Db0IsU0FBUyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHBsYXllck1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL1BsYXllck1vZHVsZVwiO1xuaW1wb3J0IHsgenl4R2FtZU1vZHVsZSB9IGZyb20gXCIuLi9kYXRhTW9kdWxlL1p5eEdhbWVNb2R1bGVcIjtcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFp5eENvbVRvcCBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1SW1nRXhwQmFyOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibEx2OiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibEV4cDogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUltZ0F2YXRhcjogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibERpYW1vbmQ6IGNjLkxhYmVsID0gbnVsbDsgXG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFN0YXI6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIG9uTG9hZCgpIHtcblxuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuXG4gICAgfVxuXG4gICAgaW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51bGJsU3Rhci5zdHJpbmcgPSBgJHt6eXhHYW1lTW9kdWxlLmdhbWVJbmZvLnN0YXJ9YDtcbiAgICAgICAgdGhpcy51bGJsTHYuc3RyaW5nID0gYCR7cGxheWVyTW9kdWxlLmx2fWA7XG4gICAgICAgIHRoaXMudWxibEV4cC5zdHJpbmcgPSBgJHtwbGF5ZXJNb2R1bGUuZXhwfS8ke3BsYXllck1vZHVsZS5leHBUYXJ9YDtcbiAgICAgICAgdGhpcy51bGJsRGlhbW9uZC5zdHJpbmcgPSBgJHtwbGF5ZXJNb2R1bGUuZGlhbW9uZH1gO1xuICAgICAgICB0aGlzLnVsYmxTdGFyLnN0cmluZyA9IGAke3BsYXllck1vZHVsZS5zdGFyfWA7XG4gICAgfVxufVxuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/util/EventManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ea7fbBwaBVK96i8sl/y0ydr', 'EventManager');
// script/merge/util/EventManager.ts

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
exports.eventManager = exports.GameEvent = exports.EventManager = void 0;
var EventManager = /** @class */ (function (_super) {
    __extends(EventManager, _super);
    function EventManager() {
        return _super.call(this) || this;
    }
    EventManager.prototype.dispatch = function (type, data) {
        this.dispatchEvent(new GameEvent(type, data));
    };
    EventManager.Instance = new EventManager();
    return EventManager;
}(cc.EventTarget));
exports.EventManager = EventManager;
// 游戏事件
var GameEvent = /** @class */ (function (_super) {
    __extends(GameEvent, _super);
    function GameEvent(type, data) {
        if (data === void 0) { data = null; }
        var _this = _super.call(this, type, true) || this;
        _this.data = null;
        _this.type = '';
        _this.type = type;
        _this.data = data;
        return _this;
    }
    return GameEvent;
}(cc.Event.EventCustom));
exports.GameEvent = GameEvent;
exports.eventManager = EventManager.Instance;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9FdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0lBQWtDLGdDQUFjO0lBRzVDO2VBQ0ksaUJBQU87SUFDWCxDQUFDO0lBRUQsK0JBQVEsR0FBUixVQUFTLElBQVksRUFBRSxJQUFVO1FBQzdCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDakQsQ0FBQztJQVJzQixxQkFBUSxHQUFpQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBU3ZFLG1CQUFDO0NBVkQsQUFVQyxDQVZpQyxFQUFFLENBQUMsV0FBVyxHQVUvQztBQVZZLG9DQUFZO0FBWXpCLE9BQU87QUFDUDtJQUErQiw2QkFBb0I7SUFHL0MsbUJBQVksSUFBWSxFQUFFLElBQWdCO1FBQWhCLHFCQUFBLEVBQUEsV0FBZ0I7UUFBMUMsWUFDSSxrQkFBTSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBR3BCO1FBTk0sVUFBSSxHQUFRLElBQUksQ0FBQztRQUNqQixVQUFJLEdBQVcsRUFBRSxDQUFDO1FBR3JCLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOztJQUNyQixDQUFDO0lBQ0wsZ0JBQUM7QUFBRCxDQVJBLEFBUUMsQ0FSOEIsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBUWxEO0FBUlksOEJBQVM7QUFVVCxRQUFBLFlBQVksR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlciBleHRlbmRzIGNjLkV2ZW50VGFyZ2V0IHtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEluc3RhbmNlOiBFdmVudE1hbmFnZXIgPSBuZXcgRXZlbnRNYW5hZ2VyKCk7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoKHR5cGU6IHN0cmluZywgZGF0YT86IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEdhbWVFdmVudCh0eXBlLCBkYXRhKSlcbiAgICB9XG59XG5cbi8vIOa4uOaIj+S6i+S7tlxuZXhwb3J0IGNsYXNzIEdhbWVFdmVudCBleHRlbmRzIGNjLkV2ZW50LkV2ZW50Q3VzdG9tIHtcbiAgICBwdWJsaWMgZGF0YTogYW55ID0gbnVsbDtcbiAgICBwdWJsaWMgdHlwZTogc3RyaW5nID0gJyc7XG4gICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBkYXRhOiBhbnkgPSBudWxsKSB7XG4gICAgICAgIHN1cGVyKHR5cGUsIHRydWUpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGV2ZW50TWFuYWdlciA9IEV2ZW50TWFuYWdlci5JbnN0YW5jZTtcbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/util/logger.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ceb40nCofFAQac+7tmvBl9q', 'logger');
// script/merge/util/logger.ts

"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.Init = function (isDebug) {
        this.DEBUG_LOG = isDebug;
    };
    Logger.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (Logger.DEBUG_LOG) {
            console.log.apply(console, args);
        }
    };
    Logger.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, args);
    };
    Logger.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (Logger.DEBUG_LOG) {
            console.warn.apply(console, args);
        }
    };
    Logger.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.error.apply(console, args);
    };
    Logger.assert = function (assertion, message) {
        var optionalParams = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            optionalParams[_i - 2] = arguments[_i];
        }
        if (Logger.DEBUG_LOG) {
            console.assert.apply(console, __spreadArrays([assertion, message], optionalParams));
        }
    };
    Logger.DEBUG_LOG = true; //打印
    return Logger;
}());
exports.Logger = Logger;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBO0lBQUE7SUFpQ0EsQ0FBQztJQTdCUSxXQUFJLEdBQVgsVUFBWSxPQUFlO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFFTSxZQUFLLEdBQVo7UUFBYSxjQUFjO2FBQWQsVUFBYyxFQUFkLHFCQUFjLEVBQWQsSUFBYztZQUFkLHlCQUFjOztRQUN6QixJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDcEIsT0FBTyxDQUFDLEdBQUcsT0FBWCxPQUFPLEVBQVEsSUFBSSxFQUFFO1NBQ3RCO0lBQ0gsQ0FBQztJQUVNLFdBQUksR0FBWDtRQUFZLGNBQWM7YUFBZCxVQUFjLEVBQWQscUJBQWMsRUFBZCxJQUFjO1lBQWQseUJBQWM7O1FBQ3hCLE9BQU8sQ0FBQyxHQUFHLE9BQVgsT0FBTyxFQUFRLElBQUksRUFBRTtJQUN2QixDQUFDO0lBRU0sV0FBSSxHQUFYO1FBQVksY0FBYzthQUFkLFVBQWMsRUFBZCxxQkFBYyxFQUFkLElBQWM7WUFBZCx5QkFBYzs7UUFDeEIsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxJQUFJLE9BQVosT0FBTyxFQUFTLElBQUksRUFBRTtTQUN2QjtJQUNILENBQUM7SUFFTSxZQUFLLEdBQVo7UUFBYSxjQUFjO2FBQWQsVUFBYyxFQUFkLHFCQUFjLEVBQWQsSUFBYztZQUFkLHlCQUFjOztRQUN6QixPQUFPLENBQUMsS0FBSyxPQUFiLE9BQU8sRUFBVSxJQUFJLEVBQUU7SUFDekIsQ0FBQztJQUVNLGFBQU0sR0FBYixVQUFjLFNBQW1CLEVBQUUsT0FBZ0I7UUFBRSx3QkFBd0I7YUFBeEIsVUFBd0IsRUFBeEIscUJBQXdCLEVBQXhCLElBQXdCO1lBQXhCLHVDQUF3Qjs7UUFDM0UsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxNQUFNLE9BQWQsT0FBTyxrQkFBUSxTQUFTLEVBQUUsT0FBTyxHQUFLLGNBQWMsR0FBRTtTQUN2RDtJQUNILENBQUM7SUE5QmMsZ0JBQVMsR0FBVyxJQUFJLENBQUMsQ0FBQSxJQUFJO0lBK0I5QyxhQUFDO0NBakNELEFBaUNDLElBQUE7QUFqQ1ksd0JBQU0iLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJcbmV4cG9ydCBjbGFzcyBMb2dnZXIge1xuXG4gIHByaXZhdGUgc3RhdGljIERFQlVHX0xPRzpib29sZWFuID0gdHJ1ZTsvL+aJk+WNsFxuXG4gIHN0YXRpYyBJbml0KGlzRGVidWc6Ym9vbGVhbil7XG4gICAgdGhpcy5ERUJVR19MT0cgPSBpc0RlYnVnO1xuICB9XG5cbiAgc3RhdGljIGRlYnVnKC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKExvZ2dlci5ERUJVR19MT0cpIHtcbiAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBpbmZvKC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gIH1cblxuICBzdGF0aWMgd2FybiguLi5hcmdzOiBhbnlbXSkge1xuICAgIGlmIChMb2dnZXIuREVCVUdfTE9HKSB7XG4gICAgICBjb25zb2xlLndhcm4oLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGVycm9yKC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgY29uc29sZS5lcnJvciguLi5hcmdzKTtcbiAgfVxuXG4gIHN0YXRpYyBhc3NlcnQoYXNzZXJ0aW9uPzogYm9vbGVhbiwgbWVzc2FnZT86IHN0cmluZywgLi4ub3B0aW9uYWxQYXJhbXM6IGFueVtdKTogdm9pZCB7XG4gICAgaWYgKExvZ2dlci5ERUJVR19MT0cpIHtcbiAgICAgIGNvbnNvbGUuYXNzZXJ0KGFzc2VydGlvbiwgbWVzc2FnZSwgLi4ub3B0aW9uYWxQYXJhbXMpO1xuICAgIH1cbiAgfVxufVxuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxLineCom.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '05b9cpMY9tNoKTFozkcF+5r', 'ZyxLineCom');
// script/merge/zyxGame/ZyxLineCom.ts

"use strict";
// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
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
Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ZyxLineCom = /** @class */ (function (_super) {
    __extends(ZyxLineCom, _super);
    function ZyxLineCom() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uImgLine = null;
        return _this;
        // update (dt) {}
    }
    // onLoad () {}
    ZyxLineCom.prototype.start = function () {
    };
    ZyxLineCom.prototype.setW = function (width) {
        this.uImgLine.width = width;
    };
    __decorate([
        property(cc.Node)
    ], ZyxLineCom.prototype, "uImgLine", void 0);
    ZyxLineCom = __decorate([
        ccclass
    ], ZyxLineCom);
    return ZyxLineCom;
}(cc.Component));
exports.default = ZyxLineCom;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhMaW5lQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvQkFBb0I7QUFDcEIsNEVBQTRFO0FBQzVFLG1CQUFtQjtBQUNuQixzRkFBc0Y7QUFDdEYsOEJBQThCO0FBQzlCLHNGQUFzRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWhGLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRzVDO0lBQXdDLDhCQUFZO0lBQXBEO1FBQUEscUVBZUM7UUFaRyxjQUFRLEdBQVksSUFBSSxDQUFDOztRQVd6QixpQkFBaUI7SUFDckIsQ0FBQztJQVhHLGVBQWU7SUFFZiwwQkFBSyxHQUFMO0lBRUEsQ0FBQztJQUVELHlCQUFJLEdBQUosVUFBSyxLQUFhO1FBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2hDLENBQUM7SUFURDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2dEQUNPO0lBSFIsVUFBVTtRQUQ5QixPQUFPO09BQ2EsVUFBVSxDQWU5QjtJQUFELGlCQUFDO0NBZkQsQUFlQyxDQWZ1QyxFQUFFLENBQUMsU0FBUyxHQWVuRDtrQkFmb0IsVUFBVSIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIi8vIExlYXJuIFR5cGVTY3JpcHQ6XG4vLyAgLSBodHRwczovL2RvY3MuY29jb3MuY29tL2NyZWF0b3IvMi40L21hbnVhbC9lbi9zY3JpcHRpbmcvdHlwZXNjcmlwdC5odG1sXG4vLyBMZWFybiBBdHRyaWJ1dGU6XG4vLyAgLSBodHRwczovL2RvY3MuY29jb3MuY29tL2NyZWF0b3IvMi40L21hbnVhbC9lbi9zY3JpcHRpbmcvcmVmZXJlbmNlL2F0dHJpYnV0ZXMuaHRtbFxuLy8gTGVhcm4gbGlmZS1jeWNsZSBjYWxsYmFja3M6XG4vLyAgLSBodHRwczovL2RvY3MuY29jb3MuY29tL2NyZWF0b3IvMi40L21hbnVhbC9lbi9zY3JpcHRpbmcvbGlmZS1jeWNsZS1jYWxsYmFja3MuaHRtbFxuXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWnl4TGluZUNvbSBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1SW1nTGluZTogY2MuTm9kZSA9IG51bGw7XG4gICAgLy8gb25Mb2FkICgpIHt9XG5cbiAgICBzdGFydCgpIHtcblxuICAgIH1cblxuICAgIHNldFcod2lkdGg6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnVJbWdMaW5lLndpZHRoID0gd2lkdGg7XG4gICAgfVxuXG4gICAgLy8gdXBkYXRlIChkdCkge31cbn1cbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxRewardItem.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '58f9eKomoVBuayMe+FsK7xm', 'ZyxRewardItem');
// script/merge/zyxGame/ZyxRewardItem.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ZyxRewardItem = /** @class */ (function (_super) {
    __extends(ZyxRewardItem, _super);
    function ZyxRewardItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uImgGoods = null;
        _this.ulblCnt = null;
        return _this;
    }
    ZyxRewardItem.prototype.onLoad = function () { };
    ZyxRewardItem.prototype.start = function () {
    };
    __decorate([
        property(cc.Sprite)
    ], ZyxRewardItem.prototype, "uImgGoods", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxRewardItem.prototype, "ulblCnt", void 0);
    ZyxRewardItem = __decorate([
        ccclass
    ], ZyxRewardItem);
    return ZyxRewardItem;
}(cc.Component));
exports.default = ZyxRewardItem;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhSZXdhcmRJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRzVDO0lBQTJDLGlDQUFZO0lBQXZEO1FBQUEscUVBYUM7UUFWRyxlQUFTLEdBQWMsSUFBSSxDQUFDO1FBRzVCLGFBQU8sR0FBYSxJQUFJLENBQUM7O0lBTzdCLENBQUM7SUFMRyw4QkFBTSxHQUFOLGNBQVcsQ0FBQztJQUVaLDZCQUFLLEdBQUw7SUFFQSxDQUFDO0lBVEQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztvREFDUTtJQUc1QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2tEQUNNO0lBTlIsYUFBYTtRQURqQyxPQUFPO09BQ2EsYUFBYSxDQWFqQztJQUFELG9CQUFDO0NBYkQsQUFhQyxDQWIwQyxFQUFFLENBQUMsU0FBUyxHQWF0RDtrQkFib0IsYUFBYSIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaeXhSZXdhcmRJdGVtIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eShjYy5TcHJpdGUpXG4gICAgdUltZ0dvb2RzOiBjYy5TcHJpdGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxDbnQ6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIG9uTG9hZCgpIHsgfVxuXG4gICAgc3RhcnQoKSB7XG5cbiAgICB9XG59XG4iXX0=
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxGridCom.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '91c73UehBpGm6f6owMD6XWE', 'ZyxGridCom');
// script/merge/zyxGame/ZyxGridCom.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
var ZyxGameModule_1 = require("../dataModule/ZyxGameModule");
var TypeDefine_1 = require("../define/TypeDefine");
var AudioMgr_1 = require("../manager/AudioMgr");
var Define_1 = require("../manager/Define");
var Uimanager_1 = require("../manager/Uimanager");
var EventManager_1 = require("../util/EventManager");
var NewUtils_1 = require("../util/NewUtils");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 格子组件
var ZyxGridCom = /** @class */ (function (_super) {
    __extends(ZyxGridCom, _super);
    function ZyxGridCom() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uImgDiamond = null;
        _this.uImgBg = null;
        _this.uImgBgLine = null;
        _this.ulblUniqueId = null;
        _this.size = TypeDefine_1.gridSize.ONE;
        _this.contentType = TypeDefine_1.gridContentType.EMPTY;
        _this.uniqueId = 0;
        _this.row = -1;
        _this.col = -1;
        // 便宜量
        _this.offsetCnt = 0;
        // 初始点击位置
        _this.originX = 0;
        // 格子原始位置
        _this.originGridX = 0;
        // 格子删除的时间
        _this.timeDelGrid = 0.18;
        return _this;
    }
    ZyxGridCom.prototype.onLoad = function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    };
    ZyxGridCom.prototype.start = function () { };
    ZyxGridCom.prototype.init = function (info) {
        // 格子类型基础属性
        this.size = info[0];
        this.contentType = info[1];
        this.uniqueId = info[2];
        if (this.contentType === TypeDefine_1.gridContentType.EMPTY) {
            this.node.active = false;
            return;
        }
        // 格子外观尺寸
        var nodeWidth = 84 * info[0];
        this.node.width = nodeWidth;
        this.uImgBg.width = this.node.width;
        this.uImgBg.x = nodeWidth / 2;
        this.uImgBgLine.width = this.node.width - 8;
        this.uImgBgLine.x = nodeWidth / 2;
        this.uImgDiamond.x = this.uImgBg.width / 2;
        this.ulblUniqueId.node.x = this.node.width / 2;
        this.ulblUniqueId.string = this.uniqueId.toString();
        this.ulblUniqueId.node.active = false;
        if (this.contentType === TypeDefine_1.gridContentType.DIAMOND) {
            this.uImgDiamond.active = true;
        }
        else {
            this.uImgDiamond.active = false;
        }
        var skinUrl = "images/grid/color_" + NewUtils_1.default.randomIntInclusive(1, 13);
        NewUtils_1.default.setSpriteFrameByUrl(this.uImgBg.getComponent(cc.Sprite), skinUrl);
    };
    ZyxGridCom.prototype.setRowCel = function (row, col) {
        this.row = row;
        this.col = col;
    };
    ZyxGridCom.prototype.moveUp = function () {
        this.row -= 1;
    };
    ZyxGridCom.prototype.moveDown = function () {
        this.row += 1;
    };
    // 删除
    ZyxGridCom.prototype.eliminate = function () {
        var _this = this;
        this.size = TypeDefine_1.gridSize.ZERO;
        this.contentType = TypeDefine_1.gridContentType.EMPTY;
        this.uniqueId = -1;
        cc.tween(this.node)
            .to(this.timeDelGrid, { opacity: 0 })
            .call(function () {
            _this.node.removeFromParent();
        })
            .start();
    };
    ZyxGridCom.prototype.onTouchStart = function (e) {
        if (ZyxGameModule_1.zyxGameModule.selectGirdUniqueId !== -1)
            return;
        ZyxGameModule_1.zyxGameModule.selectGirdUniqueId = this.uniqueId;
        console.log("onTouchStart", this.uniqueId, e.touch.getLocation().x);
        this.originX = e.touch.getLocation().x;
        this.originGridX = this.node.x;
        this.offsetCnt = 0;
        AudioMgr_1.audioMgr.shake(AudioMgr_1.SHAKE_TYPE.LIGHT);
    };
    ZyxGridCom.prototype.onTouchMove = function (e) {
        if (ZyxGameModule_1.zyxGameModule.selectGirdUniqueId !== this.uniqueId)
            return;
        var dx = e.touch.getLocation().x - this.originX;
        var canMove = this.checkMove(dx);
        if (canMove) {
            this.node.opacity = 255;
            this.node.x = this.originGridX + ZyxGameModule_1.zyxGameModule.gridsWidth * this.offsetCnt;
        }
        else {
            // this.node.opacity = 100;
        }
        var moveAction = {
            action: 'move',
            node: this.node,
        };
        EventManager_1.eventManager.dispatch(Define_1.EventType.ZYX_MOVE_GRID, moveAction);
    };
    ZyxGridCom.prototype.onTouchEnd = function (e) {
        if (ZyxGameModule_1.zyxGameModule.selectGirdUniqueId !== this.uniqueId)
            return;
        console.log("onTouchEnd", this.uniqueId);
        // const dx = e.touch.getLocation().x - this.originX;
        // let canMove = this.checkMove(dx);
        // this.node.opacity = 255;
        // if (canMove) {
        //     this.moveCrossWise();
        // } else {
        //     this.node.x = this.originGridX;
        //     console.log('无法移动');
        // }
        var moveAction = {
            action: 'done',
            node: this.node,
        };
        EventManager_1.eventManager.dispatch(Define_1.EventType.ZYX_MOVE_GRID, moveAction);
        this.moveCrossWise();
    };
    // 检测是否可以移动, 标记状态
    ZyxGridCom.prototype.checkMove = function (dx) {
        // 实际上操作的位移格子空间
        var offsetCnt = Math.floor(Math.abs(dx) / ZyxGameModule_1.zyxGameModule.gridsWidth);
        // 理论上最大允许发生的最大位移空间
        var rowData = ZyxGameModule_1.zyxGameModule.gridInfo[this.row];
        var maxOffsetCnt = 0;
        if (dx > 0) {
            // 向右移动
            for (var i = this.col + this.size; i < 8; i++) {
                if (rowData[i][1] !== TypeDefine_1.gridContentType.EMPTY) {
                    break;
                }
                maxOffsetCnt++;
            }
        }
        else {
            // 向左移动
            for (var i = this.col - 1; i >= 0; i--) {
                if (rowData[i][1] !== TypeDefine_1.gridContentType.EMPTY) {
                    break;
                }
                maxOffsetCnt++;
            }
        }
        console.log("\u65B9\u5411:" + (dx / Math.abs(dx) > 0 ? '右' : '左') + " \u62D6\u52A8: " + offsetCnt + ", \u6700\u5927: " + maxOffsetCnt);
        if (Math.abs(offsetCnt) <= maxOffsetCnt) {
            this.offsetCnt = dx / Math.abs(dx) * offsetCnt;
            return true;
        }
        else {
            this.offsetCnt = dx / Math.abs(dx) * maxOffsetCnt;
            return false;
        }
    };
    // 实际发生横向移动
    ZyxGridCom.prototype.moveCrossWise = function () {
        if (this.offsetCnt === 0 || !this.offsetCnt) {
            // 没有发生实际的位移
            console.log('没有发生实际位移, 格子选中状态取消');
            ZyxGameModule_1.zyxGameModule.selectGirdUniqueId = -1;
            this.node.x = this.originGridX;
            return;
        }
        if (this.offsetCnt > 0) {
            Uimanager_1.uimanager.showTips("\u53F3 -> " + this.offsetCnt);
        }
        else {
            Uimanager_1.uimanager.showTips("\u5DE6\u79FB <- " + -this.offsetCnt);
        }
        // 挪走的位置置为空
        for (var col = this.col; col < this.col + this.size; col++) {
            ZyxGameModule_1.zyxGameModule.gridInfo[this.row][col] = [0, 0, 0];
        }
        // 新的位置 置为当前格子
        var newStartCol = this.col + this.offsetCnt;
        var newEnd = newStartCol + this.size;
        for (var col = newStartCol; col < newEnd; col++) {
            ZyxGameModule_1.zyxGameModule.gridInfo[this.row][col][0] = this.size;
            ZyxGameModule_1.zyxGameModule.gridInfo[this.row][col][1] = this.contentType;
            ZyxGameModule_1.zyxGameModule.gridInfo[this.row][col][2] = this.uniqueId;
        }
        // update col
        this.setRowCel(this.row, this.col + this.offsetCnt);
        this.originGridX = this.node.x;
        EventManager_1.eventManager.dispatch(Define_1.EventType.ZYX_CHECK_MERGE);
        console.log("\u7B2C" + this.row + "\u884C\u53D1\u751F\u79FB\u52A8\uFF1A", ZyxGameModule_1.zyxGameModule.gridInfo);
    };
    __decorate([
        property(cc.Node)
    ], ZyxGridCom.prototype, "uImgDiamond", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGridCom.prototype, "uImgBg", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxGridCom.prototype, "uImgBgLine", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxGridCom.prototype, "ulblUniqueId", void 0);
    ZyxGridCom = __decorate([
        ccclass
    ], ZyxGridCom);
    return ZyxGridCom;
}(cc.Component));
exports.default = ZyxGridCom;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhHcmlkQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCxtREFBaUU7QUFDakUsZ0RBQTJEO0FBQzNELDRDQUE4QztBQUM5QyxrREFBaUQ7QUFDakQscURBQW9EO0FBQ3BELDZDQUF3QztBQUVsQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxPQUFPO0FBRVA7SUFBd0MsOEJBQVk7SUFBcEQ7UUFBQSxxRUFxT0M7UUFsT0csaUJBQVcsR0FBWSxJQUFJLENBQUM7UUFHNUIsWUFBTSxHQUFZLElBQUksQ0FBQztRQUd2QixnQkFBVSxHQUFZLElBQUksQ0FBQztRQUczQixrQkFBWSxHQUFhLElBQUksQ0FBQztRQUV0QixVQUFJLEdBQWEscUJBQVEsQ0FBQyxHQUFHLENBQUM7UUFDL0IsaUJBQVcsR0FBb0IsNEJBQWUsQ0FBQyxLQUFLLENBQUM7UUFDckQsY0FBUSxHQUFXLENBQUMsQ0FBQztRQUVwQixTQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDakIsU0FBRyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXpCLE1BQU07UUFDRSxlQUFTLEdBQVcsQ0FBQyxDQUFDO1FBRTlCLFNBQVM7UUFDRCxhQUFPLEdBQVcsQ0FBQyxDQUFDO1FBRTVCLFNBQVM7UUFDRCxpQkFBVyxHQUFXLENBQUMsQ0FBQztRQUVoQyxVQUFVO1FBQ0YsaUJBQVcsR0FBVyxJQUFJLENBQUM7O0lBc012QyxDQUFDO0lBcE1HLDJCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxJQUFJ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V0FBVztRQUNYLEtBQUssSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ3hELDZCQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDckQ7UUFFRCxjQUFjO1FBQ2QsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzlDLElBQU0sTUFBTSxHQUFHLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLEtBQUssSUFBSSxHQUFHLEdBQUcsV0FBVyxFQUFFLEdBQUcsR0FBRyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDN0MsNkJBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDckQsNkJBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDNUQsNkJBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDNUQ7UUFFRCxhQUFhO1FBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFL0IsMkJBQVksQ0FBQyxRQUFRLENBQUMsa0JBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQUksSUFBSSxDQUFDLEdBQUcseUNBQVEsRUFBRSw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFqT0Q7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzttREFDVTtJQUc1QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzhDQUNLO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7a0RBQ1M7SUFHM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztvREFDVztJQVpiLFVBQVU7UUFEOUIsT0FBTztPQUNhLFVBQVUsQ0FxTzlCO0lBQUQsaUJBQUM7Q0FyT0QsQUFxT0MsQ0FyT3VDLEVBQUUsQ0FBQyxTQUFTLEdBcU9uRDtrQkFyT29CLFVBQVUiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6eXhHYW1lTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvWnl4R2FtZU1vZHVsZVwiO1xuaW1wb3J0IHsgZ3JpZENvbnRlbnRUeXBlLCBncmlkU2l6ZSB9IGZyb20gXCIuLi9kZWZpbmUvVHlwZURlZmluZVwiO1xuaW1wb3J0IHsgYXVkaW9NZ3IsIFNIQUtFX1RZUEUgfSBmcm9tIFwiLi4vbWFuYWdlci9BdWRpb01nclwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvRGVmaW5lXCI7XG5pbXBvcnQgeyB1aW1hbmFnZXIgfSBmcm9tIFwiLi4vbWFuYWdlci9VaW1hbmFnZXJcIjtcbmltcG9ydCB7IGV2ZW50TWFuYWdlciB9IGZyb20gXCIuLi91dGlsL0V2ZW50TWFuYWdlclwiO1xuaW1wb3J0IE5ld1V0aWxzIGZyb20gXCIuLi91dGlsL05ld1V0aWxzXCI7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbi8vIOagvOWtkOe7hOS7tlxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFp5eEdyaWRDb20gZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUltZ0RpYW1vbmQ6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUltZ0JnOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVJbWdCZ0xpbmU6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHVsYmxVbmlxdWVJZDogY2MuTGFiZWwgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBzaXplOiBncmlkU2l6ZSA9IGdyaWRTaXplLk9ORTtcbiAgICBwdWJsaWMgY29udGVudFR5cGU6IGdyaWRDb250ZW50VHlwZSA9IGdyaWRDb250ZW50VHlwZS5FTVBUWTtcbiAgICBwdWJsaWMgdW5pcXVlSWQ6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIHJvdzogbnVtYmVyID0gLTE7XG4gICAgcHJpdmF0ZSBjb2w6IG51bWJlciA9IC0xO1xuXG4gICAgLy8g5L6/5a6c6YePXG4gICAgcHJpdmF0ZSBvZmZzZXRDbnQ6IG51bWJlciA9IDA7XG5cbiAgICAvLyDliJ3lp4vngrnlh7vkvY3nva5cbiAgICBwcml2YXRlIG9yaWdpblg6IG51bWJlciA9IDA7XG5cbiAgICAvLyDmoLzlrZDljp/lp4vkvY3nva5cbiAgICBwcml2YXRlIG9yaWdpbkdyaWRYOiBudW1iZXIgPSAwO1xuXG4gICAgLy8g5qC85a2Q5Yig6Zmk55qE5pe26Ze0XG4gICAgcHJpdmF0ZSB0aW1lRGVsR3JpZDogbnVtYmVyID0gMC4xODtcblxuICAgIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCB0aGlzLm9uVG91Y2hTdGFydCwgdGhpcyk7XG4gICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9NT1ZFLCB0aGlzLm9uVG91Y2hNb3ZlLCB0aGlzKTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vblRvdWNoRW5kLCB0aGlzKTtcbiAgICAgICAgdGhpcy5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0NBTkNFTCwgdGhpcy5vblRvdWNoRW5kLCB0aGlzKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHsgfVxuXG4gICAgaW5pdChpbmZvOiBbZ3JpZFNpemUsIGdyaWRDb250ZW50VHlwZSwgbnVtYmVyXSkge1xuICAgICAgICAvLyDmoLzlrZDnsbvlnovln7rnoYDlsZ7mgKdcbiAgICAgICAgdGhpcy5zaXplID0gaW5mb1swXTtcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZSA9IGluZm9bMV07XG4gICAgICAgIHRoaXMudW5pcXVlSWQgPSBpbmZvWzJdO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbnRlbnRUeXBlID09PSBncmlkQ29udGVudFR5cGUuRU1QVFkpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOagvOWtkOWkluinguWwuuWvuFxuICAgICAgICBjb25zdCBub2RlV2lkdGggPSA4NCAqIGluZm9bMF07XG4gICAgICAgIHRoaXMubm9kZS53aWR0aCA9IG5vZGVXaWR0aDtcbiAgICAgICAgdGhpcy51SW1nQmcud2lkdGggPSB0aGlzLm5vZGUud2lkdGg7XG4gICAgICAgIHRoaXMudUltZ0JnLnggPSBub2RlV2lkdGggLyAyO1xuICAgICAgICB0aGlzLnVJbWdCZ0xpbmUud2lkdGggPSB0aGlzLm5vZGUud2lkdGggLSA4O1xuICAgICAgICB0aGlzLnVJbWdCZ0xpbmUueCA9IG5vZGVXaWR0aCAvIDI7XG4gICAgICAgIHRoaXMudUltZ0RpYW1vbmQueCA9IHRoaXMudUltZ0JnLndpZHRoIC8gMjtcbiAgICAgICAgdGhpcy51bGJsVW5pcXVlSWQubm9kZS54ID0gdGhpcy5ub2RlLndpZHRoIC8gMjtcblxuICAgICAgICB0aGlzLnVsYmxVbmlxdWVJZC5zdHJpbmcgPSB0aGlzLnVuaXF1ZUlkLnRvU3RyaW5nKCk7XG4gICAgICAgIHRoaXMudWxibFVuaXF1ZUlkLm5vZGUuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuY29udGVudFR5cGUgPT09IGdyaWRDb250ZW50VHlwZS5ESUFNT05EKSB7XG4gICAgICAgICAgICB0aGlzLnVJbWdEaWFtb25kLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVJbWdEaWFtb25kLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2tpblVybCA9IGBpbWFnZXMvZ3JpZC9jb2xvcl8ke05ld1V0aWxzLnJhbmRvbUludEluY2x1c2l2ZSgxLCAxMyl9YDtcbiAgICAgICAgTmV3VXRpbHMuc2V0U3ByaXRlRnJhbWVCeVVybCh0aGlzLnVJbWdCZy5nZXRDb21wb25lbnQoY2MuU3ByaXRlKSwgc2tpblVybCk7XG4gICAgfVxuXG4gICAgc2V0Um93Q2VsKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xuICAgICAgICB0aGlzLnJvdyA9IHJvdztcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XG4gICAgfVxuXG4gICAgbW92ZVVwKCkge1xuICAgICAgICB0aGlzLnJvdyAtPSAxO1xuICAgIH1cblxuICAgIG1vdmVEb3duKCkge1xuICAgICAgICB0aGlzLnJvdyArPSAxO1xuICAgIH1cblxuICAgIC8vIOWIoOmZpFxuICAgIGVsaW1pbmF0ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zaXplID0gZ3JpZFNpemUuWkVSTztcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZSA9IGdyaWRDb250ZW50VHlwZS5FTVBUWTtcbiAgICAgICAgdGhpcy51bmlxdWVJZCA9IC0xO1xuICAgICAgICBjYy50d2Vlbih0aGlzLm5vZGUpXG4gICAgICAgICAgICAudG8odGhpcy50aW1lRGVsR3JpZCwgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnJlbW92ZUZyb21QYXJlbnQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBvblRvdWNoU3RhcnQoZSkge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IC0xKSByZXR1cm47XG4gICAgICAgIHp5eEdhbWVNb2R1bGUuc2VsZWN0R2lyZFVuaXF1ZUlkID0gdGhpcy51bmlxdWVJZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblRvdWNoU3RhcnRcIiwgdGhpcy51bmlxdWVJZCwgZS50b3VjaC5nZXRMb2NhdGlvbigpLngpO1xuICAgICAgICB0aGlzLm9yaWdpblggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueDtcbiAgICAgICAgdGhpcy5vcmlnaW5HcmlkWCA9IHRoaXMubm9kZS54O1xuICAgICAgICB0aGlzLm9mZnNldENudCA9IDA7XG5cbiAgICAgICAgYXVkaW9NZ3Iuc2hha2UoU0hBS0VfVFlQRS5MSUdIVCk7XG4gICAgfVxuXG4gICAgb25Ub3VjaE1vdmUoZSk6IHZvaWQge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IHRoaXMudW5pcXVlSWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgZHggPSBlLnRvdWNoLmdldExvY2F0aW9uKCkueCAtIHRoaXMub3JpZ2luWDtcblxuICAgICAgICBjb25zdCBjYW5Nb3ZlID0gdGhpcy5jaGVja01vdmUoZHgpO1xuICAgICAgICBpZiAoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IHRoaXMub3JpZ2luR3JpZFggKyB6eXhHYW1lTW9kdWxlLmdyaWRzV2lkdGggKiB0aGlzLm9mZnNldENudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoaXMubm9kZS5vcGFjaXR5ID0gMTAwO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1vdmVBY3Rpb24gPSB7XG4gICAgICAgICAgICBhY3Rpb246ICdtb3ZlJyxcbiAgICAgICAgICAgIG5vZGU6IHRoaXMubm9kZSxcbiAgICAgICAgfVxuICAgICAgICBldmVudE1hbmFnZXIuZGlzcGF0Y2goRXZlbnRUeXBlLlpZWF9NT1ZFX0dSSUQsIG1vdmVBY3Rpb24pO1xuICAgIH1cblxuICAgIG9uVG91Y2hFbmQoZSkge1xuICAgICAgICBpZiAoenl4R2FtZU1vZHVsZS5zZWxlY3RHaXJkVW5pcXVlSWQgIT09IHRoaXMudW5pcXVlSWQpIHJldHVybjtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblRvdWNoRW5kXCIsIHRoaXMudW5pcXVlSWQpO1xuICAgICAgICAvLyBjb25zdCBkeCA9IGUudG91Y2guZ2V0TG9jYXRpb24oKS54IC0gdGhpcy5vcmlnaW5YO1xuICAgICAgICAvLyBsZXQgY2FuTW92ZSA9IHRoaXMuY2hlY2tNb3ZlKGR4KTtcblxuICAgICAgICAvLyB0aGlzLm5vZGUub3BhY2l0eSA9IDI1NTtcblxuICAgICAgICAvLyBpZiAoY2FuTW92ZSkge1xuICAgICAgICAvLyAgICAgdGhpcy5tb3ZlQ3Jvc3NXaXNlKCk7XG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICB0aGlzLm5vZGUueCA9IHRoaXMub3JpZ2luR3JpZFg7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygn5peg5rOV56e75YqoJyk7XG4gICAgICAgIC8vIH1cblxuXG4gICAgICAgIGxldCBtb3ZlQWN0aW9uID0ge1xuICAgICAgICAgICAgYWN0aW9uOiAnZG9uZScsXG4gICAgICAgICAgICBub2RlOiB0aGlzLm5vZGUsXG4gICAgICAgIH1cbiAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5aWVhfTU9WRV9HUklELCBtb3ZlQWN0aW9uKTtcblxuICAgICAgICB0aGlzLm1vdmVDcm9zc1dpc2UoKTtcbiAgICB9XG5cbiAgICAvLyDmo4DmtYvmmK/lkKblj6/ku6Xnp7vliqgsIOagh+iusOeKtuaAgVxuICAgIGNoZWNrTW92ZShkeDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOWunumZheS4iuaTjeS9nOeahOS9jeenu+agvOWtkOepuumXtFxuICAgICAgICBjb25zdCBvZmZzZXRDbnQgPSBNYXRoLmZsb29yKE1hdGguYWJzKGR4KSAvIHp5eEdhbWVNb2R1bGUuZ3JpZHNXaWR0aCk7XG5cbiAgICAgICAgLy8g55CG6K665LiK5pyA5aSn5YWB6K645Y+R55Sf55qE5pyA5aSn5L2N56e756m66Ze0XG4gICAgICAgIGNvbnN0IHJvd0RhdGEgPSB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XTtcbiAgICAgICAgbGV0IG1heE9mZnNldENudCA9IDA7XG4gICAgICAgIGlmIChkeCA+IDApIHtcbiAgICAgICAgICAgIC8vIOWQkeWPs+enu+WKqFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY29sICsgdGhpcy5zaXplOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvd0RhdGFbaV1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWF4T2Zmc2V0Q250Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDlkJHlt6bnp7vliqhcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvd0RhdGFbaV1bMV0gIT09IGdyaWRDb250ZW50VHlwZS5FTVBUWSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWF4T2Zmc2V0Q250Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhg5pa55ZCROiR7ZHggLyBNYXRoLmFicyhkeCkgPiAwID8gJ+WPsycgOiAn5bemJ30g5ouW5YqoOiAke29mZnNldENudH0sIOacgOWkpzogJHttYXhPZmZzZXRDbnR9YCk7XG4gICAgICAgIGlmIChNYXRoLmFicyhvZmZzZXRDbnQpIDw9IG1heE9mZnNldENudCkge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXRDbnQgPSBkeCAvIE1hdGguYWJzKGR4KSAqIG9mZnNldENudDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXRDbnQgPSBkeCAvIE1hdGguYWJzKGR4KSAqIG1heE9mZnNldENudDtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWunumZheWPkeeUn+aoquWQkeenu+WKqFxuICAgIG1vdmVDcm9zc1dpc2UoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9mZnNldENudCA9PT0gMCB8fCAhdGhpcy5vZmZzZXRDbnQpIHtcbiAgICAgICAgICAgIC8vIOayoeacieWPkeeUn+WunumZheeahOS9jeenu1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+ayoeacieWPkeeUn+WunumZheS9jeenuywg5qC85a2Q6YCJ5Lit54q25oCB5Y+W5raIJyk7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLnNlbGVjdEdpcmRVbmlxdWVJZCA9IC0xO1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm9yaWdpbkdyaWRYO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9mZnNldENudCA+IDApIHtcbiAgICAgICAgICAgIHVpbWFuYWdlci5zaG93VGlwcyhg5Y+zIC0+ICR7dGhpcy5vZmZzZXRDbnR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1aW1hbmFnZXIuc2hvd1RpcHMoYOW3puenuyA8LSAkey10aGlzLm9mZnNldENudH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaMqui1sOeahOS9jee9rue9ruS4uuepulxuICAgICAgICBmb3IgKGxldCBjb2wgPSB0aGlzLmNvbDsgY29sIDwgdGhpcy5jb2wgKyB0aGlzLnNpemU7IGNvbCsrKSB7XG4gICAgICAgICAgICB6eXhHYW1lTW9kdWxlLmdyaWRJbmZvW3RoaXMucm93XVtjb2xdID0gWzAsIDAsIDBdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5paw55qE5L2N572uIOe9ruS4uuW9k+WJjeagvOWtkFxuICAgICAgICBjb25zdCBuZXdTdGFydENvbCA9IHRoaXMuY29sICsgdGhpcy5vZmZzZXRDbnQ7XG4gICAgICAgIGNvbnN0IG5ld0VuZCA9IG5ld1N0YXJ0Q29sICsgdGhpcy5zaXplO1xuICAgICAgICBmb3IgKGxldCBjb2wgPSBuZXdTdGFydENvbDsgY29sIDwgbmV3RW5kOyBjb2wrKykge1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd11bY29sXVswXSA9IHRoaXMuc2l6ZTtcbiAgICAgICAgICAgIHp5eEdhbWVNb2R1bGUuZ3JpZEluZm9bdGhpcy5yb3ddW2NvbF1bMV0gPSB0aGlzLmNvbnRlbnRUeXBlO1xuICAgICAgICAgICAgenl4R2FtZU1vZHVsZS5ncmlkSW5mb1t0aGlzLnJvd11bY29sXVsyXSA9IHRoaXMudW5pcXVlSWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgY29sXG4gICAgICAgIHRoaXMuc2V0Um93Q2VsKHRoaXMucm93LCB0aGlzLmNvbCArIHRoaXMub2Zmc2V0Q250KTtcbiAgICAgICAgdGhpcy5vcmlnaW5HcmlkWCA9IHRoaXMubm9kZS54O1xuXG4gICAgICAgIGV2ZW50TWFuYWdlci5kaXNwYXRjaChFdmVudFR5cGUuWllYX0NIRUNLX01FUkdFKTtcbiAgICAgICAgY29uc29sZS5sb2coYOesrCR7dGhpcy5yb3d96KGM5Y+R55Sf56e75Yqo77yaYCwgenl4R2FtZU1vZHVsZS5ncmlkSW5mbyk7XG4gICAgfVxufVxuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxAccountDialog.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ef5253/VKlPL5QaowdjMHpL', 'ZyxAccountDialog');
// script/merge/zyxGame/ZyxAccountDialog.ts

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
Object.defineProperty(exports, "__esModule", { value: true });
var ZyxGameModule_1 = require("../dataModule/ZyxGameModule");
var Define_1 = require("../manager/Define");
var EventManager_1 = require("../util/EventManager");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 结算界面
var ZyxAccountDialog = /** @class */ (function (_super) {
    __extends(ZyxAccountDialog, _super);
    function ZyxAccountDialog() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ulblTitle = null;
        _this.ulblScore = null;
        _this.uBox = null;
        _this.uBtnOk = null;
        return _this;
    }
    ZyxAccountDialog.prototype.onLoad = function () {
        this.uBtnOk.on(cc.Node.EventType.TOUCH_END, this.close, this);
    };
    ZyxAccountDialog.prototype.start = function () {
        this.ulblScore.string = "\u5F97\u5206\uFF1A" + ZyxGameModule_1.zyxGameModule.gameInfo.score;
    };
    ZyxAccountDialog.prototype.close = function () {
        var _this = this;
        EventManager_1.eventManager.dispatch(Define_1.EventType.ZYX_RESET_GAME);
        cc.tween(this.node)
            .to(0.2, { scale: 0 })
            .call(function () {
            _this.node.destroy();
        })
            .start();
    };
    __decorate([
        property(cc.Label)
    ], ZyxAccountDialog.prototype, "ulblTitle", void 0);
    __decorate([
        property(cc.Label)
    ], ZyxAccountDialog.prototype, "ulblScore", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxAccountDialog.prototype, "uBox", void 0);
    __decorate([
        property(cc.Node)
    ], ZyxAccountDialog.prototype, "uBtnOk", void 0);
    ZyxAccountDialog = __decorate([
        ccclass
    ], ZyxAccountDialog);
    return ZyxAccountDialog;
}(cc.Component));
exports.default = ZyxAccountDialog;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhBY2NvdW50RGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUE0RDtBQUM1RCw0Q0FBOEM7QUFDOUMscURBQW9EO0FBRTlDLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRTVDLE9BQU87QUFFUDtJQUE4QyxvQ0FBWTtJQUExRDtRQUFBLHFFQWdDQztRQTdCRyxlQUFTLEdBQWEsSUFBSSxDQUFDO1FBRzNCLGVBQVMsR0FBYSxJQUFJLENBQUM7UUFHM0IsVUFBSSxHQUFZLElBQUksQ0FBQztRQUdyQixZQUFNLEdBQVksSUFBSSxDQUFDOztJQW9CM0IsQ0FBQztJQWxCRyxpQ0FBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELGdDQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyx1QkFBTSw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFPLENBQUM7SUFDakUsQ0FBQztJQUVELGdDQUFLLEdBQUw7UUFBQSxpQkFTQztRQVJHLDJCQUFZLENBQUMsUUFBUSxDQUFDLGtCQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFaEQsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2QsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNyQixJQUFJLENBQUM7WUFDRixLQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLENBQUMsQ0FBQzthQUNELEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUE1QkQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzt1REFDUTtJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO3VEQUNRO0lBRzNCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7a0RBQ0c7SUFHckI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztvREFDSztJQVpOLGdCQUFnQjtRQURwQyxPQUFPO09BQ2EsZ0JBQWdCLENBZ0NwQztJQUFELHVCQUFDO0NBaENELEFBZ0NDLENBaEM2QyxFQUFFLENBQUMsU0FBUyxHQWdDekQ7a0JBaENvQixnQkFBZ0IiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6eXhHYW1lTW9kdWxlIH0gZnJvbSBcIi4uL2RhdGFNb2R1bGUvWnl4R2FtZU1vZHVsZVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIi4uL21hbmFnZXIvRGVmaW5lXCI7XG5pbXBvcnQgeyBldmVudE1hbmFnZXIgfSBmcm9tIFwiLi4vdXRpbC9FdmVudE1hbmFnZXJcIjtcblxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcblxuLy8g57uT566X55WM6Z2iXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWnl4QWNjb3VudERpYWxvZyBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFRpdGxlOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdWxibFNjb3JlOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB1Qm94OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCdG5PazogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMudUJ0bk9rLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5jbG9zZSwgdGhpcyk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMudWxibFNjb3JlLnN0cmluZyA9IGDlvpfliIbvvJoke3p5eEdhbWVNb2R1bGUuZ2FtZUluZm8uc2NvcmV9YDtcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKEV2ZW50VHlwZS5aWVhfUkVTRVRfR0FNRSk7XG5cbiAgICAgICAgY2MudHdlZW4odGhpcy5ub2RlKVxuICAgICAgICAgICAgLnRvKDAuMiwgeyBzY2FsZTogMCB9KVxuICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgfVxufVxuIl19
//------QC-SOURCE-SPLIT------
