/**
 * 开心豆与官方拼画的集中配置（阶段 A 唯一数值来源）。
 *
 * 与服务端 server/src/economyConfig.js 保持一致的值已用注释标出；
 * 任何节奏调节只能改这里，禁止在 UI 代码里散落魔法数字。
 */

// ---------- 开心豆（固定语义，不作为经济调节项） ----------
/** 1 个带心情符号的色块被消除 → 恰好产生 1 颗开心豆。 */
export const MOOD_BEANS_PER_MOOD_BLOCK = 1;

// ---------- 官方拼画结构（与服务端一致） ----------
/** 官方原画运行尺寸（设计像素）。 */
export const ART_IMAGE_WIDTH = 650;
export const ART_IMAGE_HEIGHT = 780;
/** 单个逻辑豆位占 5×5 设计像素：1 像素格线/间隙 + 4×4 有效色块。 */
export const ART_CELL_PIXELS = 5;
export const ART_CELL_GAP = 1;
export const ART_CELL_BLOCK = 4;
/** 逻辑豆位网格：130 列 × 156 行 = 20,280。 */
export const ART_GRID_COLS = 130;
export const ART_GRID_ROWS = 156;
export const ART_TOTAL_CELLS = ART_GRID_COLS * ART_GRID_ROWS;
/** 像素预览尺寸（与逻辑豆位一一对应）。 */
export const ART_PREVIEW_WIDTH = 130;
export const ART_PREVIEW_HEIGHT = 156;
/** 主题画框外尺寸。 */
export const ART_FRAME_WIDTH = 700;
export const ART_FRAME_HEIGHT = 830;

// ---------- 拼画经济参数（与服务端一致） ----------
/** 一次「放置」投入当前全部可放置开心豆；不设批次上限，服务端单次上限 = 一整幅画作的豆位数。 */
export const MAX_CONTRIBUTE_PER_ACTION = ART_TOTAL_CELLS;
/** 画册开放等级：第一册免费进入，第二册暂定 5 级。 */
export const ALBUM_OPEN_LEVELS: { [albumId: string]: number } = {
    album_season: 1,
    album_city: 5,
};

// ---------- 本地存档键 ----------
export const DATA_GENERATION_KEY = 'zyx_data_generation';
/** 新数据代际标记；不匹配时一次性清空全部 zyx_* 键。 */
export const DATA_GENERATION = 'mood_bean_v1';
export const MOOD_BEAN_BALANCE_KEY = 'zyx_mood_bean_balance';
export const OFFICIAL_ART_PROGRESS_CACHE_KEY = 'zyx_official_art_progress_cache';
export const PENDING_ROUND_SETTLEMENTS_KEY = 'zyx_pending_round_settlements';
/** 永久失败的结算记录隔离区：记录原因与时间，不堵塞活动队列。 */
export const DEAD_ROUND_SETTLEMENTS_KEY = 'zyx_dead_round_settlements';
/** 同一玩家最多一条未确认拼画操作；模糊失败重试必须复用原 actionId。 */
export const PENDING_REALM_ACTION_KEY = 'zyx_pending_realm_action';

// ---------- 离线结算队列 ----------
/** 待提交结算队列上限；满员时必须先联网同步才能开始新局，不得静默丢弃记录。 */
export const PENDING_ROUND_SETTLEMENTS_LIMIT = 100;

// ---------- 对局时间校验（与服务端 economyConfig 一致） ----------
/** 时间戳不是不可伪造凭据，只与收集上限、请求频率一起作为基础风控。 */
export const MIN_ROUND_DURATION_MS = 5 * 1000;
export const MAX_ROUND_DURATION_MS = 4 * 60 * 60 * 1000;
/** 离线补传窗口：7 天内的真实离线对局允许补传，超期永久隔离。 */
export const MAX_OFFLINE_SETTLEMENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// ---------- 拼画视觉 ----------
/** 单帧在屏飞行视觉豆上限：超大批量等距抽样，未显示的豆位由时序前沿兜底揭开。 */
export const MAX_VISUAL_FLY_BEANS = 120;

// ---------- 确定性填充顺序 ----------

/**
 * 画作填充顺序：从上到下、从左到右一排一排依次揭开。
 * rank 与豆位序号（row * cols + col）完全一致；顺序确定，
 * 因此只保存 filledCells 即可在任何设备恢复相同画面。
 */
export function buildArtFillOrder(artId: string): Uint32Array {
    const order = new Uint32Array(ART_TOTAL_CELLS);
    for (let cell = 0; cell < ART_TOTAL_CELLS; cell++) order[cell] = cell;
    return order;
}

/** 逆映射：豆位序号 → rank；行优先顺序下 rank 与豆位序号一致。 */
export function buildArtCellRanks(artId: string): Uint32Array {
    return buildArtFillOrder(artId);
}
