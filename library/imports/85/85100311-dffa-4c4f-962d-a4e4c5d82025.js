"use strict";
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
    return NewUtils;
}());
exports.default = NewUtils;

cc._RF.pop();