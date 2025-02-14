export enum EventType {
    MOVE_COIN = 'move_coin',
    MOVE_END = 'move_end',
    CHECK_MERGE = 'check_merge',
    MERGE_COIN = 'merge_coin',
    MERGE_END = 'merge_end',
    MOVE_CHECK_FAIL = 'move_check_fail',
    CANCEL_SELECT = 'CANCEL_SELECT',


    ZYX_CHECK_MERGE = 'zyx_check_merge',
    ZYX_RESET_GAME = 'zyx_reset_game',
    ZYX_MOVE_GRID = 'zyx_move_grid',

    ZYX_CHECK_ORDER_FINISH = 'zyx_check_order_finish',
}

// 商品信息
export type GoodsType = {
    id: number,
    flower: number,
    total: number,
    used: number,
    name: string,
    desc: string,
    url: string,
}