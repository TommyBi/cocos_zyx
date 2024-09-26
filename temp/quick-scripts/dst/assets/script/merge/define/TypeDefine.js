
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