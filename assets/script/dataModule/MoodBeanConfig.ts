/** 开心豆与对局结算的集中配置。 */

/** 每个带表情块推进 1%；每局独立累计，每满 100% 获得一颗。 */
export const MOOD_BLOCKS_PER_PERCENT = 1;
export const MOOD_BLOCKS_PER_BEAN = MOOD_BLOCKS_PER_PERCENT * 100;
export const MOOD_COLLECTION_RULE = 'progress_v2';

export function getMoodCollection(collectedBlocks: number): { beans: number; progress: number; percent: string } {
    const blocks = Math.max(0, Math.floor(collectedBlocks || 0));
    const progress = blocks % MOOD_BLOCKS_PER_BEAN;
    return { beans: Math.floor(blocks / MOOD_BLOCKS_PER_BEAN), progress,
        percent: String(progress / MOOD_BLOCKS_PER_PERCENT) + '%' };
}

// 本次发布明确全量重置；只在跨代首次启动清理，之后正常保留新档。
export const DATA_GENERATION_KEY = 'zyx_data_generation';
export const DATA_GENERATION = 'mood_bean_v5_20261112';
export const MOOD_BEAN_BALANCE_KEY = 'zyx_mood_bean_balance';
export const PENDING_ROUND_SETTLEMENTS_KEY = 'zyx_pending_round_settlements';
export const DEAD_ROUND_SETTLEMENTS_KEY = 'zyx_dead_round_settlements';

/** 待提交结算队列满员时，必须先同步，不能静默丢弃对局。 */
export const PENDING_ROUND_SETTLEMENTS_LIMIT = 100;

/** 时间戳与服务端风控规则共同约束异常结算。 */
export const MIN_ROUND_DURATION_MS = 5 * 1000;
export const MAX_ROUND_DURATION_MS = 4 * 60 * 60 * 1000;
export const MAX_OFFLINE_SETTLEMENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;
