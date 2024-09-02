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
