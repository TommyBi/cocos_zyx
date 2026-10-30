/**
 * R2：离线结算队列的唯一工作器。
 *
 * 所有对局结算都走同一条路径：
 *   生成结算记录 → 先可靠写入 pending 队列 → 再尝试提交 → 服务端确定成功后删除对应记录。
 *
 * - single-flight：同一时刻最多有一个 flush 过程，并发触发直接返回 alreadyRunning；
 * - 临时错误（断网/超时/408/425/429/5xx/401）：保留当前记录并停止本次 flush，等待下次触发；
 * - 永久错误（字段损坏/明确不可重试的业务错误码）：移入 dead-letter 并继续后续记录，禁止堵塞整队列。
 */
import { zyxGameModule, PendingRoundSettlement } from '../dataModule/ZyxGameModule';
import {
    MAX_OFFLINE_SETTLEMENT_AGE_MS,
    MAX_ROUND_DURATION_MS,
    MIN_ROUND_DURATION_MS,
} from '../dataModule/MoodBeanConfig';

export type SettlementSubmitFn = (record: PendingRoundSettlement) => Promise<any>;

export type SettlementFlushHooks = {
    /** 单条记录被服务端确认后回调，通常用于以回执档案覆盖本地展示。 */
    onSettled?: (record: PendingRoundSettlement, result: any) => void;
    /** 永久失败记录被隔离时回调，通常用于提示玩家并重新拉取服务端档案。 */
    onDeadLetter?: (record: PendingRoundSettlement, reason: string) => void;
};

export type SettlementFlushOutcome = {
    alreadyRunning: boolean;
    submitted: number;
    deadLettered: number;
    /** 遇到临时错误而提前停止；队列中仍有记录等待下次触发。 */
    blocked: boolean;
};

let flushInFlight = false;

/**
 * 错误分类：禁止把整个 400～499 都视为永久错误。
 *
 * 永久错误（dead-letter）：只有明确代表"本条记录本身不可重试"的业务错误才能进入。
 * - 400：按业务错误码判断；只有 INVALID_ROUND_TIME / INVALID_ROUND_DURATION / SETTLEMENT_TOO_OLD
 *   等记录本身不可修复的错误才永久，其他 400 仍按临时处理。
 * - 409：ROUND_PAYLOAD_CONFLICT / ROUND_NOT_STARTED 为永久（同 ID 异载荷或缺少服务端开局许可）。
 * - 401：凭证失效，不在这里判定；CloudService.request 会自动 bootstrap 后重试一次。
 * - 408 / 425 / 429：按临时错误处理，保留记录并停止本次 flush。
 * - 5xx、网络失败、超时：临时错误。
 * - 无 HTTP 状态码（断网）：临时错误。
 */

/** 已知的服务端业务错误码，标识记录本身不可重试。 */
const PERMANENT_BUSINESS_CODES = new Set([
    'INVALID_ROUND_TIME',
    'INVALID_ROUND_DURATION',
    'SETTLEMENT_TOO_OLD',
    'INVALID_BEAN_AMOUNT',
    'ROUND_PAYLOAD_CONFLICT',
    'ROUND_NOT_STARTED',
]);

/** 401 凭证失效：不应在此处理，CloudService 层已自动 bootstrap 重试一次。 */
export function isAuthError(error: any): boolean {
    const status = Number(error && (error.status !== undefined ? error.status : error.statusCode));
    return status === 401;
}

/** 永久错误：记录本身不可重试，应移入 dead-letter。 */
export function isPermanentSettlementError(error: any): boolean {
    if (!error) return false;
    const status = Number(error.status !== undefined ? error.status : error.statusCode);
    if (!Number.isFinite(status) || status === 0) return false; // 无状态码 = 网络错误 = 临时

    // 401 不在队列层处理：CloudService.request 已自动 bootstrap 重试一次。
    if (status === 401) return false;

    // 408 / 425 / 429 按临时错误处理。
    if (status === 408 || status === 425 || status === 429) return false;

    // 5xx 按临时错误处理。
    if (status >= 500) return false;

    // 400 / 409：按业务错误码分类。只有明确的永久业务错误码才进入 dead-letter。
    if (status >= 400 && status < 500) {
        const businessCode = error.businessCode;
        if (businessCode && PERMANENT_BUSINESS_CODES.has(businessCode)) return true;
        // 没有 businessCode 的 400 默认按临时处理（不盲目丢弃）。
        // 409 没有 businessCode 也不随意丢弃，按临时处理。
        return false;
    }

    return false;
}

/** 客户端侧坏记录识别：字段损坏或超出离线补传窗口的记录永远不可能被服务端接受。 */
export function isPendingSettlementRecordValid(record: any): boolean {
    if (!record || typeof record.roundId !== 'string' || record.roundId.length === 0) return false;
    const startedAt = Number(record.startedAt);
    const endedAt = Number(record.endedAt);
    if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt)) return false;
    const duration = endedAt - startedAt;
    if (duration < MIN_ROUND_DURATION_MS || duration > MAX_ROUND_DURATION_MS) return false;
    if (!Number.isFinite(Number(record.score)) || Number(record.score) < 0) return false;
    if (!Number.isFinite(Number(record.collectedMoodBeanCount)) || Number(record.collectedMoodBeanCount) < 0) return false;
    if (startedAt < Date.now() - MAX_OFFLINE_SETTLEMENT_AGE_MS) return false;
    return true;
}

/** 清空待提交队列；返回本次 flush 的统计结果。 */
export async function flushPendingRoundSettlements(
    submit: SettlementSubmitFn,
    hooks: SettlementFlushHooks = {},
): Promise<SettlementFlushOutcome> {
    if (flushInFlight) {
        return { alreadyRunning: true, submitted: 0, deadLettered: 0, blocked: false };
    }
    flushInFlight = true;
    const outcome: SettlementFlushOutcome = { alreadyRunning: false, submitted: 0, deadLettered: 0, blocked: false };
    try {
        while (true) {
            const queue = zyxGameModule.getPendingRoundSettlements();
            if (queue.length === 0) break;
            const record = queue[0];
            if (!isPendingSettlementRecordValid(record)) {
                // 队列读取已保证 roundId 合法，直接按键隔离。
                const reason = '记录字段损坏或超出离线补传窗口';
                zyxGameModule.movePendingRoundSettlementToDeadLetter(record.roundId, reason);
                outcome.deadLettered++;
                if (hooks.onDeadLetter) hooks.onDeadLetter(record, reason);
                continue;
            }
            try {
                const result = await submit(record);
                zyxGameModule.removePendingRoundSettlement(record.roundId);
                outcome.submitted++;
                if (hooks.onSettled) hooks.onSettled(record, result);
            } catch (error) {
                if (isPermanentSettlementError(error)) {
                    const reason = error && error.message ? error.message : '服务端拒绝该记录';
                    zyxGameModule.movePendingRoundSettlementToDeadLetter(record.roundId, reason);
                    outcome.deadLettered++;
                    if (hooks.onDeadLetter) hooks.onDeadLetter(record, reason);
                    continue;
                }
                // 临时错误：保留当前记录并停止本次 flush，等待下次触发。
                outcome.blocked = true;
                break;
            }
        }
        return outcome;
    } finally {
        flushInFlight = false;
    }
}
