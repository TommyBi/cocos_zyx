
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
// 格子的尺寸类型
var gridSize;
(function (gridSize) {
    gridSize[gridSize["ONE"] = 1] = "ONE";
    gridSize[gridSize["TWO"] = 2] = "TWO";
    gridSize[gridSize["THREE"] = 3] = "THREE";
    gridSize[gridSize["FOUR"] = 4] = "FOUR";
})(gridSize = exports.gridSize || (exports.gridSize = {}));
// 格子的物品类型
var gridContentType;
(function (gridContentType) {
    gridContentType[gridContentType["EMPTY"] = 0] = "EMPTY";
    gridContentType[gridContentType["NORMAL"] = 1] = "NORMAL";
    gridContentType[gridContentType["DIAMOND"] = 2] = "DIAMOND";
    gridContentType[gridContentType["BOMB"] = 3] = "BOMB";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGVmaW5lL1R5cGVEZWZpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsS0FBSztBQUNMLElBQVksS0FLWDtBQUxELFdBQVksS0FBSztJQUNiLGtCQUFTLENBQUE7SUFDVCwwQkFBaUIsQ0FBQTtJQUNqQixvQkFBVyxDQUFBO0lBQ1gsd0JBQWUsQ0FBQTtBQUNuQixDQUFDLEVBTFcsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBS2hCO0FBWUQsVUFBVTtBQUNWLElBQVksUUFLWDtBQUxELFdBQVksUUFBUTtJQUNoQixxQ0FBTyxDQUFBO0lBQ1AscUNBQU8sQ0FBQTtJQUNQLHlDQUFTLENBQUE7SUFDVCx1Q0FBUSxDQUFBO0FBQ1osQ0FBQyxFQUxXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBS25CO0FBRUQsVUFBVTtBQUNWLElBQVksZUFNWDtBQU5ELFdBQVksZUFBZTtJQUN2Qix1REFBUyxDQUFBO0lBQ1QseURBQVUsQ0FBQTtJQUNWLDJEQUFXLENBQUE7SUFDWCxxREFBUSxDQUFBO0lBQ1IseURBQVUsQ0FBQTtBQUNkLENBQUMsRUFOVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQU0xQiIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIi8vIOWxgue6p1xuZXhwb3J0IGVudW0gTEFZRVIge1xuICAgIFVJID0gJ3VpJyxcbiAgICBESUFMT0cgPSAnZGlhbG9nJyxcbiAgICBUSVAgPSAndGlwJyxcbiAgICBHVUlERSA9ICdndWlkZScsXG59XG5cbi8vIOa4uOaIj+i/m+ihjOS4reeahOS/oeaBr1xuZXhwb3J0IHR5cGUgdHlwZUdhbWVJbmZvID0ge1xuICAgIC8vIOeKtuaAgeS/oeaBr1xuICAgIGFkVGltZXM6IG51bWJlciwgLy8g5Ymp5L2Z5pKt5pS+5bm/5ZGK55qE5qyh5pWwXG4gICAgc2NvcmU6IG51bWJlcixcbiAgICBleHA6IG51bWJlcixcbiAgICBkaWFtb25kOiBudW1iZXIsXG4gICAgc3RhcjogbnVtYmVyLFxufVxuXG4vLyDmoLzlrZDnmoTlsLrlr7jnsbvlnotcbmV4cG9ydCBlbnVtIGdyaWRTaXplIHtcbiAgICBPTkUgPSAxLFxuICAgIFRXTyA9IDIsXG4gICAgVEhSRUUgPSAzLFxuICAgIEZPVVIgPSA0LFxufVxuXG4vLyDmoLzlrZDnmoTnianlk4HnsbvlnotcbmV4cG9ydCBlbnVtIGdyaWRDb250ZW50VHlwZSB7XG4gICAgRU1QVFkgPSAwLFxuICAgIE5PUk1BTCA9IDEsXG4gICAgRElBTU9ORCA9IDIsXG4gICAgQk9NQiA9IDMsXG4gICAgSEFNTUVSID0gNCxcbn1cbiJdfQ==