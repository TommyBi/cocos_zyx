/** 开心豆与对局结算的集中配置。 */

/** 1 个带心情符号的色块被消除，产生 1 颗开心豆。 */
export const MOOD_BEANS_PER_MOOD_BLOCK = 1;

// 本地存档键。保留当前数据代际，避免删除秘境时重置玩家的消除进度。
export const DATA_GENERATION_KEY = 'zyx_data_generation';
export const DATA_GENERATION = 'mood_bean_v1';
export const MOOD_BEAN_BALANCE_KEY = 'zyx_mood_bean_balance';
export const PENDING_ROUND_SETTLEMENTS_KEY = 'zyx_pending_round_settlements';
export const DEAD_ROUND_SETTLEMENTS_KEY = 'zyx_dead_round_settlements';

/** 待提交结算队列满员时，必须先同步，不能静默丢弃对局。 */
export const PENDING_ROUND_SETTLEMENTS_LIMIT = 100;

/** 时间戳与服务端风控规则共同约束异常结算。 */
export const MIN_ROUND_DURATION_MS = 5 * 1000;
export const MAX_ROUND_DURATION_MS = 4 * 60 * 60 * 1000;
export const MAX_OFFLINE_SETTLEMENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;
