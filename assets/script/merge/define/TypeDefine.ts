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
    // 剩余播放广告的次数
    adTimes: number,
    // 当前回合中的分数
    score: number,
    // 当前回合累计得到的花朵
    flower: number,
    // 格子当前使用到的唯一索引值
    uniqueId: number,
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
    // 花朵
    flower = 6,
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