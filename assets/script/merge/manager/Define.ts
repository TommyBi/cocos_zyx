export enum EventType {
    MOVE_COIN = 'move_coin',
    MOVE_END = 'move_end',
    CHECK_MERGE = 'check_merge',
    MERGE_COIN = 'merge_coin',
    MERGE_END = 'merge_end',
    MOVE_CHECK_FAIL = 'move_check_fail',
    CANCEL_SELECT = 'CANCEL_SELECT',
}

// 商品信息
export type GoodsType = {
    id: number,
    star: number,
    total: number,
    used: number,
    name: string,
    desc: string,
    url: string,
}