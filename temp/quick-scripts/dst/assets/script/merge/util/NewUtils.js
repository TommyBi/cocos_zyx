
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