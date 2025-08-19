export default class NewUtils {
    /**
     * 深拷贝
     * @example
     * let src = { a: 123, b: { c: [1, 2, 3], d: "ceshi" } };
     * let tar = Util.deepClone(src);
     * tar.b.c[0] = 2;
     * console.log(`obj:`, tar, `src:`, src);
     */
    static deepClone(obj, cache = new WeakMap()) {
        // 普通类型，直接返回
        if (typeof obj !== 'object') return obj;
        if (obj === null) return obj;

        // 防止循环引用，程序进入死循环
        if (cache.get(obj)) return cache.get(obj);
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof RegExp) return new RegExp(obj);

        // 找到所属原型上的constructor，所属原型上的constructor指向当前对象的构造函数
        const cloneObj = new obj.constructor();
        // 缓存拷贝的对象，用于处理循环引用的情况
        cache.set(obj, cloneObj);
        for (const key in obj) {
            if (obj[key]) {
                cloneObj[key] = this.deepClone(obj[key], cache); // 递归拷贝
            }
        }

        return cloneObj;
    }

    static randomIntInclusive(min, max): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 去重 - 随机生成指定数量指定区间的数组
    static randomIntArrFromSection(cnt: number, min: number, max: number): number[] {
        const result = [];
        do {
            const v = this.randomIntInclusive(min, max);
            if (result.indexOf(v) === -1) {
                result.push(v);
            }
        } while (result.length < cnt);

        return result;
    }

    // 不去重 - 随机生成指定数量指定区间的数组
    static randomIntArrInclusive(cnt, min, max): number[] {
        const result = [];
        do {
            result.push(this.randomIntInclusive(min, max));
        } while (result.length < cnt);
        return result;
    }

    // 从给定的数组中随机生成一组指定数量的数组
    static randomIntArrFromArr(cnt, srcArr): number[] {
        const result = [];
        do {
            const index = this.randomIntInclusive(0, srcArr.length - 1);
            result.push(srcArr[index]);
        } while (result.length < cnt);
        return result;
    }

    // 计算数组元素之和
    static sumArrayNum(arr: number[]): number {
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }

    // 替换spriteFrame
    static setSpriteFrameByUrl(node: cc.Sprite, url: string) {
        cc.resources.load(url, cc.SpriteFrame, ((err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                console.error('url:', url, '/err:');
                return;
            }

            node.spriteFrame = spriteFrame;
        }));
    }
}
