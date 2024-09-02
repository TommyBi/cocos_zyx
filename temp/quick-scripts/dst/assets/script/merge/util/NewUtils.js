
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9OZXdVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0lBQUE7SUE4RUEsQ0FBQztJQTdFRzs7Ozs7OztPQU9HO0lBQ0ksa0JBQVMsR0FBaEIsVUFBaUIsR0FBRyxFQUFFLEtBQXFCO1FBQXJCLHNCQUFBLEVBQUEsWUFBWSxPQUFPLEVBQUU7UUFDdkMsWUFBWTtRQUNaLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUTtZQUFFLE9BQU8sR0FBRyxDQUFDO1FBQ3hDLElBQUksR0FBRyxLQUFLLElBQUk7WUFBRSxPQUFPLEdBQUcsQ0FBQztRQUU3QixpQkFBaUI7UUFDakIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxJQUFJLEdBQUcsWUFBWSxJQUFJO1lBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxJQUFJLEdBQUcsWUFBWSxNQUFNO1lBQUUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVsRCxtREFBbUQ7UUFDbkQsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkMsc0JBQXNCO1FBQ3RCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pCLEtBQUssSUFBTSxHQUFHLElBQUksR0FBRyxFQUFFO1lBQ25CLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNWLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU87YUFDM0Q7U0FDSjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTSwyQkFBa0IsR0FBekIsVUFBMEIsR0FBRyxFQUFFLEdBQUc7UUFDOUIsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDN0QsQ0FBQztJQUVELHVCQUF1QjtJQUNoQixnQ0FBdUIsR0FBOUIsVUFBK0IsR0FBVyxFQUFFLEdBQVcsRUFBRSxHQUFXO1FBQ2hFLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNsQixHQUFHO1lBQ0MsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM1QyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEI7U0FDSixRQUFRLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1FBRTlCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCx3QkFBd0I7SUFDakIsOEJBQXFCLEdBQTVCLFVBQTZCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztRQUN0QyxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsR0FBRztZQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2xELFFBQVEsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7UUFDOUIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELHVCQUF1QjtJQUNoQiw0QkFBbUIsR0FBMUIsVUFBMkIsR0FBRyxFQUFFLE1BQU07UUFDbEMsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEdBQUc7WUFDQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM5QixRQUFRLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1FBQzlCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxXQUFXO0lBQ0osb0JBQVcsR0FBbEIsVUFBbUIsR0FBYTtRQUM1QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDWixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNqQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBQ0wsZUFBQztBQUFELENBOUVBLEFBOEVDLElBQUEiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBOZXdVdGlscyB7XG4gICAgLyoqXG4gICAgICog5rex5ou36LSdXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBsZXQgc3JjID0geyBhOiAxMjMsIGI6IHsgYzogWzEsIDIsIDNdLCBkOiBcImNlc2hpXCIgfSB9O1xuICAgICAqIGxldCB0YXIgPSBVdGlsLmRlZXBDbG9uZShzcmMpO1xuICAgICAqIHRhci5iLmNbMF0gPSAyO1xuICAgICAqIGNvbnNvbGUubG9nKGBvYmo6YCwgdGFyLCBgc3JjOmAsIHNyYyk7XG4gICAgICovXG4gICAgc3RhdGljIGRlZXBDbG9uZShvYmosIGNhY2hlID0gbmV3IFdlYWtNYXAoKSkge1xuICAgICAgICAvLyDmma7pgJrnsbvlnovvvIznm7TmjqXov5Tlm55cbiAgICAgICAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSByZXR1cm4gb2JqO1xuICAgICAgICBpZiAob2JqID09PSBudWxsKSByZXR1cm4gb2JqO1xuXG4gICAgICAgIC8vIOmYsuatouW+queOr+W8leeUqO+8jOeoi+W6j+i/m+WFpeatu+W+queOr1xuICAgICAgICBpZiAoY2FjaGUuZ2V0KG9iaikpIHJldHVybiBjYWNoZS5nZXQob2JqKTtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIERhdGUpIHJldHVybiBuZXcgRGF0ZShvYmopO1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gbmV3IFJlZ0V4cChvYmopO1xuXG4gICAgICAgIC8vIOaJvuWIsOaJgOWxnuWOn+Wei+S4iueahGNvbnN0cnVjdG9y77yM5omA5bGe5Y6f5Z6L5LiK55qEY29uc3RydWN0b3LmjIflkJHlvZPliY3lr7nosaHnmoTmnoTpgKDlh73mlbBcbiAgICAgICAgY29uc3QgY2xvbmVPYmogPSBuZXcgb2JqLmNvbnN0cnVjdG9yKCk7XG4gICAgICAgIC8vIOe8k+WtmOaLt+i0neeahOWvueixoe+8jOeUqOS6juWkhOeQhuW+queOr+W8leeUqOeahOaDheWGtVxuICAgICAgICBjYWNoZS5zZXQob2JqLCBjbG9uZU9iaik7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgICAgICAgICAgaWYgKG9ialtrZXldKSB7XG4gICAgICAgICAgICAgICAgY2xvbmVPYmpba2V5XSA9IHRoaXMuZGVlcENsb25lKG9ialtrZXldLCBjYWNoZSk7IC8vIOmAkuW9kuaLt+i0nVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNsb25lT2JqO1xuICAgIH1cblxuICAgIHN0YXRpYyByYW5kb21JbnRJbmNsdXNpdmUobWluLCBtYXgpOiBudW1iZXIge1xuICAgICAgICBtaW4gPSBNYXRoLmNlaWwobWluKTtcbiAgICAgICAgbWF4ID0gTWF0aC5mbG9vcihtYXgpO1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgICB9XG5cbiAgICAvLyDljrvph40gLSDpmo/mnLrnlJ/miJDmjIflrprmlbDph4/mjIflrprljLrpl7TnmoTmlbDnu4RcbiAgICBzdGF0aWMgcmFuZG9tSW50QXJyRnJvbVNlY3Rpb24oY250OiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlcltdIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnJhbmRvbUludEluY2x1c2l2ZShtaW4sIG1heCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YodikgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKHJlc3VsdC5sZW5ndGggPCBjbnQpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g5LiN5Y676YeNIC0g6ZqP5py655Sf5oiQ5oyH5a6a5pWw6YeP5oyH5a6a5Yy66Ze055qE5pWw57uEXG4gICAgc3RhdGljIHJhbmRvbUludEFyckluY2x1c2l2ZShjbnQsIG1pbiwgbWF4KTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5yYW5kb21JbnRJbmNsdXNpdmUobWluLCBtYXgpKTtcbiAgICAgICAgfSB3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IGNudCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8g5LuO57uZ5a6a55qE5pWw57uE5Lit6ZqP5py655Sf5oiQ5LiA57uE5oyH5a6a5pWw6YeP55qE5pWw57uEXG4gICAgc3RhdGljIHJhbmRvbUludEFyckZyb21BcnIoY250LCBzcmNBcnIpOiBudW1iZXJbXSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZG9tSW50SW5jbHVzaXZlKDAsIHNyY0Fyci5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHNyY0FycltpbmRleF0pO1xuICAgICAgICB9IHdoaWxlIChyZXN1bHQubGVuZ3RoIDwgY250KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyDorqHnrpfmlbDnu4TlhYPntKDkuYvlkoxcbiAgICBzdGF0aWMgc3VtQXJyYXlOdW0oYXJyOiBudW1iZXJbXSk6IG51bWJlciB7XG4gICAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IGFycltpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VtO1xuICAgIH1cbn1cbiJdfQ==