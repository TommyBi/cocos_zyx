
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGVmaW5lL1R5cGVEZWZpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsS0FBSztBQUNMLElBQVksS0FLWDtBQUxELFdBQVksS0FBSztJQUNiLGtCQUFTLENBQUE7SUFDVCwwQkFBaUIsQ0FBQTtJQUNqQixvQkFBVyxDQUFBO0lBQ1gsd0JBQWUsQ0FBQTtBQUNuQixDQUFDLEVBTFcsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBS2hCO0FBWUQsa0JBQWtCO0FBQ2xCLElBQVksUUFNWDtBQU5ELFdBQVksUUFBUTtJQUNoQix1Q0FBUSxDQUFBO0lBQ1IscUNBQU8sQ0FBQTtJQUNQLHFDQUFPLENBQUE7SUFDUCx5Q0FBUyxDQUFBO0lBQ1QsdUNBQVEsQ0FBQTtBQUNaLENBQUMsRUFOVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQU1uQjtBQUVELFVBQVU7QUFDVixJQUFZLGVBV1g7QUFYRCxXQUFZLGVBQWU7SUFDdkIsTUFBTTtJQUNOLHVEQUFTLENBQUE7SUFDVCxTQUFTO0lBQ1QseURBQVUsQ0FBQTtJQUNWLEtBQUs7SUFDTCwyREFBVyxDQUFBO0lBQ1gsUUFBUTtJQUNSLHFEQUFRLENBQUE7SUFDUixRQUFRO0lBQ1IseURBQVUsQ0FBQTtBQUNkLENBQUMsRUFYVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQVcxQiIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIi8vIOWxgue6p1xuZXhwb3J0IGVudW0gTEFZRVIge1xuICAgIFVJID0gJ3VpJyxcbiAgICBESUFMT0cgPSAnZGlhbG9nJyxcbiAgICBUSVAgPSAndGlwJyxcbiAgICBHVUlERSA9ICdndWlkZScsXG59XG5cbi8vIOa4uOaIj+i/m+ihjOS4reeahOS/oeaBr1xuZXhwb3J0IHR5cGUgdHlwZUdhbWVJbmZvID0ge1xuICAgIC8vIOeKtuaAgeS/oeaBr1xuICAgIGFkVGltZXM6IG51bWJlciwgLy8g5Ymp5L2Z5pKt5pS+5bm/5ZGK55qE5qyh5pWwXG4gICAgc2NvcmU6IG51bWJlcixcbiAgICBleHA6IG51bWJlcixcbiAgICBkaWFtb25kOiBudW1iZXIsXG4gICAgc3RhcjogbnVtYmVyLFxufVxuXG4vLyDmoLzlrZDnmoTlsLrlr7jnsbvlnosg56m65qC85a2Q5bC65a+45Li6MFxuZXhwb3J0IGVudW0gZ3JpZFNpemUge1xuICAgIFpFUk8gPSAwLFxuICAgIE9ORSA9IDEsXG4gICAgVFdPID0gMixcbiAgICBUSFJFRSA9IDMsXG4gICAgRk9VUiA9IDQsXG59XG5cbi8vIOagvOWtkOeahOeJqeWTgeexu+Wei1xuZXhwb3J0IGVudW0gZ3JpZENvbnRlbnRUeXBlIHtcbiAgICAvLyDnqbrmoLzlrZBcbiAgICBFTVBUWSA9IDAsXG4gICAgLy8g5rKh5pyJ5LuA5LmI54mp5ZOBXG4gICAgTk9STUFMID0gMSxcbiAgICAvLyDpkrvnn7NcbiAgICBESUFNT05EID0gMixcbiAgICAvLyDpgZPlhbct54K45by5XG4gICAgQk9NQiA9IDMsXG4gICAgLy8g6YGT5YW3LemUpOWtkFxuICAgIEhBTU1FUiA9IDQsXG59XG4iXX0=