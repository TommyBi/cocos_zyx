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
    diamond: number,
    star: number,
}

// 格子的尺寸类型
export enum gridSize {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
}

// 格子的物品类型
export enum gridContentType {
    EMPTY = 0,
    NORMAL = 1,
    DIAMOND = 2,
    BOMB = 3,
    HAMMER = 4,
}
