
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