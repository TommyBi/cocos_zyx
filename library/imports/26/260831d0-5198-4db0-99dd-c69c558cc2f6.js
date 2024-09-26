"use strict";
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