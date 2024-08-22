
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9OZXdVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0lBQUE7SUFxRUEsQ0FBQztJQXBFRzs7Ozs7OztPQU9HO0lBQ0ksa0JBQVMsR0FBaEIsVUFBaUIsR0FBRyxFQUFFLEtBQXFCO1FBQXJCLHNCQUFBLEVBQUEsWUFBWSxPQUFPLEVBQUU7UUFDdkMsWUFBWTtRQUNaLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUTtZQUFFLE9BQU8sR0FBRyxDQUFDO1FBQ3hDLElBQUksR0FBRyxLQUFLLElBQUk7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUU3QixpQkFBaUI7UUFDakIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxJQUFJLEdBQUcsWUFBWSxJQUFJO1lBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxJQUFJLEdBQUcsWUFBWSxNQUFNO1lBQUUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVsRCxtREFBbUQ7UUFDbkQsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkMsc0JBQXNCO1FBQ3RCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pCLEtBQUssSUFBTSxHQUFHLElBQUksR0FBRyxFQUFFO1lBQ25CLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNWLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU87YUFDM0Q7U0FDSjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTSwyQkFBa0IsR0FBekIsVUFBMEIsR0FBRyxFQUFFLEdBQUc7UUFDOUIsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDN0QsQ0FBQztJQUVELHVCQUF1QjtJQUNoQixnQ0FBdUIsR0FBOUIsVUFBK0IsR0FBVyxFQUFFLEdBQVcsRUFBRSxHQUFXO1FBQ2hFLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNsQixHQUFHO1lBQ0MsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM1QyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEI7U0FDSixRQUFRLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1FBRTlCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCx3QkFBd0I7SUFDakIsOEJBQXFCLEdBQTVCLFVBQTZCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztRQUN0QyxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsR0FBRztZQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2xELFFBQVEsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7UUFDOUIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELHVCQUF1QjtJQUNoQiw0QkFBbUIsR0FBMUIsVUFBMkIsR0FBRyxFQUFFLE1BQU07UUFDbEMsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEdBQUc7WUFDQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM5QixRQUFRLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1FBQzlCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTCxlQUFDO0FBQUQsQ0FyRUEsQUFxRUMsSUFBQSIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ld1V0aWxzIHtcbiAgICAvKipcbiAgICAgKiDmt7Hmi7fotJ1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGxldCBzcmMgPSB7IGE6IDEyMywgYjogeyBjOiBbMSwgMiwgM10sIGQ6IFwiY2VzaGlcIiB9IH07XG4gICAgICogbGV0IHRhciA9IFV0aWwuZGVlcENsb25lKHNyYyk7XG4gICAgICogdGFyLmIuY1swXSA9IDI7XG4gICAgICogY29uc29sZS5sb2coYG9iajpgLCB0YXIsIGBzcmM6YCwgc3JjKTtcbiAgICAgKi9cbiAgICBzdGF0aWMgZGVlcENsb25lKG9iaiwgY2FjaGUgPSBuZXcgV2Vha01hcCgpKSB7XG4gICAgICAgIC8vIOaZrumAmuexu+Wei++8jOebtOaOpei/lOWbnlxuICAgICAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHJldHVybiBvYmo7XG4gICAgICAgIGlmIChvYmogPT09IG51bGwpIHJldHVybiBvYmo7XG5cbiAgICAgICAgLy8g6Ziy5q2i5b6q546v5byV55So77yM56iL5bqP6L+b5YWl5q275b6q546vXG4gICAgICAgIGlmIChjYWNoZS5nZXQob2JqKSkgcmV0dXJuIGNhY2hlLmdldChvYmopO1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuIG5ldyBEYXRlKG9iaik7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiBuZXcgUmVnRXhwKG9iaik7XG5cbiAgICAgICAgLy8g5om+5Yiw5omA5bGe5Y6f5Z6L5LiK55qEY29uc3RydWN0b3LvvIzmiYDlsZ7ljp/lnovkuIrnmoRjb25zdHJ1Y3RvcuaMh+WQkeW9k+WJjeWvueixoeeahOaehOmAoOWHveaVsFxuICAgICAgICBjb25zdCBjbG9uZU9iaiA9IG5ldyBvYmouY29uc3RydWN0b3IoKTtcbiAgICAgICAgLy8g57yT5a2Y5ou36LSd55qE5a+56LGh77yM55So5LqO5aSE55CG5b6q546v5byV55So55qE5oOF5Ya1XG4gICAgICAgIGNhY2hlLnNldChvYmosIGNsb25lT2JqKTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqW2tleV0pIHtcbiAgICAgICAgICAgICAgICBjbG9uZU9ialtrZXldID0gdGhpcy5kZWVwQ2xvbmUob2JqW2tleV0sIGNhY2hlKTsgLy8g6YCS5b2S5ou36LSdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2xvbmVPYmo7XG4gICAgfVxuXG4gICAgc3RhdGljIHJhbmRvbUludEluY2x1c2l2ZShtaW4sIG1heCkge1xuICAgICAgICBtaW4gPSBNYXRoLmNlaWwobWluKTtcbiAgICAgICAgbWF4ID0gTWF0aC5mbG9vcihtYXgpO1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgICB9XG5cbiAgICAvLyDljrvph40gLSDpmo/mnLrnlJ/miJDmjIflrprmlbDph4/mjIflrprljLrpl7TnmoTmlbDnu4RcbiAgICBzdGF0aWMgcmFuZG9tSW50QXJyRnJvbVNlY3Rpb24oY250OiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlcltdIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnJhbmRvbUludEluY2x1c2l2ZShtaW4sIG1heCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YodikgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKHJlc3VsdC5sZW5ndGggPCBjbnQpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g5LiN5Y676YeNIC0g6ZqP5py655Sf5oiQ5oyH5a6a5pWw6YeP5oyH5a6a5Yy66Ze055qE5pWw57uEXG4gICAgc3RhdGljIHJhbmRvbUludEFyckluY2x1c2l2ZShjbnQsIG1pbiwgbWF4KTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5yYW5kb21JbnRJbmNsdXNpdmUobWluLCBtYXgpKTtcbiAgICAgICAgfSB3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IGNudCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g5LuO57uZ5a6a55qE5pWw57uE5Lit6ZqP5py655Sf5oiQ5LiA57uE5oyH5a6a5pWw6YeP55qE5pWw57uEXG4gICAgc3RhdGljIHJhbmRvbUludEFyckZyb21BcnIoY250LCBzcmNBcnIpOiBudW1iZXJbXSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZG9tSW50SW5jbHVzaXZlKDAsIHNyY0Fyci5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHNyY0FycltpbmRleF0pO1xuICAgICAgICB9IHdoaWxlIChyZXN1bHQubGVuZ3RoIDwgY250KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59XG4iXX0=