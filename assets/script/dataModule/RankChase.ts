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

/** 复用本局真实榜单快照；明确分行，昵称不允许挤出额外短行。 */
export function getReviveChaseMessage(entries: LeaderboardEntry[], playerId: string, score: number): string {
    const state = getRankChaseState(entries, playerId, score);
    if (state.above) {
        const characters = Array.from((state.above.nickname || '前方选手').replace(/\s+/g, ' ').trim());
        const name = characters.length > 7 ? characters.slice(0, 6).join('') + '…' : characters.join('');
        const target = state.rank === null && entries.length >= 200 ? '距离上榜选手' : '距离下一名';
        return `${target} ${name}\n仅剩 ${state.gap} 分\n这怎么能忍！`;
    }
    return entries.some(entry => entry.playerId !== playerId && entry.value > 0)
        ? '已经冲到前面啦！\n复活继续加分，\n把纪录再抬高一点！'
        : '整理台还没收拾完呢！\n复活再消几排，\n把这一局玩个痛快！';
}
