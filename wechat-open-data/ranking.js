'use strict';

function readScore(list, key) {
    const item = (Array.isArray(list) ? list : []).find(entry => entry && entry.key === key);
    if (!item || typeof item.value !== 'string' || !/^\d+$/.test(item.value)) return null;
    const value = Number(item.value);
    return Number.isSafeInteger(value) ? value : null;
}

function readOwner(list, key) {
    const item = (Array.isArray(list) ? list : []).find(entry => entry && entry.key === `${key}_owner`);
    return item && typeof item.value === 'string' ? item.value : '';
}

function rankFriends(data, key, self, selfScore, selfOwner) {
    const unique = new Map();
    (Array.isArray(data) ? data : []).forEach(user => {
        const id = user && (user.openid || user.openId);
        const score = user && readScore(user.KVDataList, key);
        if (!id || score === null) return;
        unique.set(id, { id, nickname: user.nickname || user.nickName || '微信好友', avatarUrl: user.avatarUrl || '',
            score, owner: readOwner(user.KVDataList, key) });
    });
    const own = selfOwner && Array.from(unique.values()).find(entry => entry.owner === selfOwner);
    const reportedId = self && (self.openId || self.openid);
    // selfOpenId是查询别名，不是好友结果中的真实openid，不能作为额外用户加入榜单。
    const selfId = own ? own.id : reportedId === 'selfOpenId' ? '' : reportedId;
    if (selfId && selfScore !== null) {
        unique.set(selfId, { id: selfId, nickname: self.nickName || self.nickname || '我',
            avatarUrl: self.avatarUrl || '', score: selfScore });
    }
    const entries = Array.from(unique.values()).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    entries.forEach((entry, index) => {
        entry.rank = index > 0 && entry.score === entries[index - 1].score ? entries[index - 1].rank : index + 1;
        entry.isSelf = entry.id === selfId;
    });
    return { entries, self: entries.find(entry => entry.isSelf) || (self && selfScore !== null
        ? { nickname: self.nickName || self.nickname || '我', avatarUrl: self.avatarUrl || '', score: selfScore, rank: 0, isSelf: true }
        : null) };
}

module.exports = { readScore, readOwner, rankFriends };
