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
    // 当前回合累计得到的花朵
    flower: number,
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
    // 经验
    exp = 5,
    // 星星
    flower = 6,

    // 道具 - 常规订单物品
    vegetables_7 = 7,
    vetetables_8 = 8,
    vegetables_9 = 9,
    vegetables_10 = 10,
    vegetables_11 = 11,
    vegetables_12 = 12,
    vegetables_13 = 13,
    vegetables_14 = 14,
    vegetables_15 = 15,
    vegetables_16 = 16,
    vegetables_17 = 17,
    vegetables_18 = 18,
    vegetables_19 = 19,
    vegetables_20 = 20,
    vegetables_21 = 21,
    vegetables_22 = 22,
    vegetables_23 = 23,
    vegetables_24 = 24,
    vegetables_25 = 25,
    
}

// 订单中的道具信息
export type typeOrderGoodsData = {
    goodsId: number,
    tarCnt: number,
    schedule: number
}

// 订单数据
export type typeOrderData = {
    goods: typeOrderGoodsData[],
    orderId: number,
    score: number,
}