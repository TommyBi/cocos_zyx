// 是否为开发环境
export const isDev: boolean = false;

// 服务器地址 - 开发环境
export const svrUrlDev = 'http://127.0.0.1:8080/api';
// 服务器地址 - 正式环境
export const svrUrlPro = 'https://api.tcjstory.cn/v1/xiaochu-fannao/api';

// 微信小游戏 AppId。appsecret 只允许放在服务端环境变量中。
export const wxAppId = 'wxdc39c78bfd045896';

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
    // 当前难度等级
    difficultyLevel: number,
    // 已生成的新行数量
    generatedRows: number,
    // 连续未发生消除次数
    noMergeStreak: number,
    // 动态降难剩余行数
    reliefRows: number,
    // 当前回合累计消除次数，用于控制电钻碎片生成
    clearCount: number,
    // 电钻碎片生成蓄力，每 5 次消除生成 1 个碎片
    drillSpawnCharge: number,
    // 当前回合电钻碎片收集进度，满 20 个获得 1 个电钻
    drillFragments: number,
}

export type typeDifficultyState = {
    level: number,
    generatedRows: number,
    noMergeStreak: number,
    reliefRows: number,
    balanceTriggered: boolean,
    balanceReason: string,
    targetFill: number,
    stackHeight: number,
    largeCellRatio: number,
    difficultyChanged: boolean,
}

export type typeRankItem = {
    rank: number,
    nickName: string,
    avatar?: string,
    score: number,
}

export type typeRankResult = {
    list: typeRankItem[],
    selfRank: number,
    selfScore: number,
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
    // 电钻碎片
    DRILL_FRAGMENT = 7,
}

// 格子宽高单位长度
export const GRID_WIDTH = 85;
