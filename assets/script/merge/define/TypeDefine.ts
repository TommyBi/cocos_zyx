// 层级
export enum LAYER {
    UI = 'ui',
    DIALOG = 'dialog',
    TIP = 'tip',
    GUIDE = 'guide',
}

// 游戏进行中的信息
export type typeGameInfo = {
    // 状态信息
    adTimes: number, // 剩余播放广告的次数
    score: number,
    exp: number,
    // 当前回合累计得到的星星
    star: number,
    // 格子当前使用到的唯一索引值
    uniqueId: number,
    goods: object,
}

// 格子的尺寸类型 空格子尺寸为0
export enum gridSize {
    ZERO = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
}

// 格子的物品类型
export enum gridContentType {
    // 空格子
    EMPTY = 0,
    // 没有什么物品
    NORMAL = 1,
    // 钻石
    DIAMOND = 2,
    // 道具-炸弹
    BOMB = 3,
    // 道具-锤子
    HAMMER = 4,
    // 道具 - 山竹
    MANGOSTEEN = 5,
    // 道具 - 葡萄
    GRAPE = 6,
    // 道具 - 苹果
    APPLE = 7,
    // 道具 - 鱼腥草
    FISHGRASS = 8,
    // 道具 - 菠萝
    PINEAPPLE = 9,
    // 道具 - 桃子
    PEACH = 10,
    // 道具 - 水草
    WATERPLANT = 11,
}
