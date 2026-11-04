import { LeaderboardEntry } from '../manager/CloudService';

/** 只用开局时的真实前 200 名快照推算本局进度，不写入正式排名。 */
export function getRankChaseState(entries: LeaderboardEntry[], playerId: string, score: number) {
    const rivals = entries.filter((entry) => entry.playerId !== playerId && entry.value > 0)
        .sort((a, b) => b.value - a.value || a.rank - b.rank);
    const ahead = rivals.filter((entry) => entry.value >= score);
    const above = ahead.length > 0 ? ahead[ahead.length - 1] : null;
    const below = rivals.find((entry) => entry.value < score) || null;
    // 前 200 名之外无法从快照得知实际名次，不编造全服排名。
    const outsideBoard = entries.length >= 200 && above === rivals[rivals.length - 1];
    return {
        above,
        below,
        rank: score > 0 && !outsideBoard ? ahead.length + 1 : null,
        gap: above ? above.value - score + 1 : 0,
    };
}

export function getOvertakenRivals(entries: LeaderboardEntry[], playerId: string, before: number, after: number): LeaderboardEntry[] {
    return entries.filter((entry) => entry.playerId !== playerId && entry.value >= before && entry.value < after)
        .sort((a, b) => a.value - b.value || b.rank - a.rank);
}
