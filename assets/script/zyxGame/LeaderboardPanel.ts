import { BUTTON_COLORS, uimanager } from '../manager/UIManager';
import { cloudService, LeaderboardEntry, LeaderboardResult } from '../manager/CloudService';
import { MOOD_COLORS } from './MoodArt';

/**
 * 周排行榜弹窗。
 * 从 GameMainScene 抽出：榜单渲染只依赖 cloudService/uimanager，
 * 云端档案是否就绪由调用方通过 ensureProfile 保证。
 */
export async function showLeaderboardPanel(ensureProfile: () => Promise<void>): Promise<void> {
    try {
        await ensureProfile();
        const result = await cloudService.getLeaderboard('power');
        renderLeaderboard(result);
    } catch (error) {
        uimanager.showToast('排行榜连接中，请稍后重试');
    }
}

function renderLeaderboard(initial: LeaderboardResult, pageIndex: number = 0): void {
    let current = initial;
    const pageSize = 8;
    const totalPages = Math.max(1, Math.ceil(current.entries.length / pageSize));
    const safePageIndex = Math.max(0, Math.min(totalPages - 1, pageIndex));
    const render = (panel: cc.Node, centerY: number): void => {
        const tabs = uimanager.createRect(panel, 'leaderboardTabs', 410, 44, new cc.Color(245, 231, 200), 255, 14, 0, centerY + 154);
        const paintTab = (text: string, x: number, type: 'power' | 'happiness'): void => {
            const active = current.type === type;
            const tab = uimanager.createButton(tabs, text, x, 0, 192, 38, active ? BUTTON_COLORS.yellow : new cc.Color(171, 150, 132), () => {
                cloudService.getLeaderboard(type).then((result) => {
                    uimanager.closeModal();
                    renderLeaderboard(result);
                }).catch(() => uimanager.showToast('榜单刷新失败'));
            }, 18);
            tab.opacity = active ? 255 : 185;
        };
        paintTab('实力榜', -101, 'power');
        paintTab('开心榜', 101, 'happiness');
        const valueName = current.type === 'power' ? '单局最高分' : '本周开心瓶';
        current.entries.slice(safePageIndex * pageSize, (safePageIndex + 1) * pageSize)
            .forEach((entry, index) => createLeaderboardRow(panel, entry, valueName, centerY + 100 - index * 38));
        uimanager.createLabel(panel, `第 ${safePageIndex + 1}/${totalPages} 页 · 前 ${current.entries.length} 名`, 0, centerY - 142, 14, MOOD_COLORS.cocoaSoft, 260, 24);
        const selfText = current.self.isRanked
            ? `我的排名：第 ${current.self.rank} 名 · ${valueName} ${current.self.value}`
            : `暂未上榜 · ${valueName} ${current.self.value}${current.self.distanceToRank200 > 0 ? ` · 距前200还差 ${current.self.distanceToRank200}` : ''}`;
        uimanager.createLabel(panel, selfText, 0, centerY - 170, 16, MOOD_COLORS.cocoa, 430, 28);
    };
    const actions: any[] = [];
    if (safePageIndex > 0) actions.push({ text: '上一页', color: BUTTON_COLORS.yellow, onClick: () => renderLeaderboard(current, safePageIndex - 1) });
    if (safePageIndex < totalPages - 1) actions.push({ text: '下一页', color: BUTTON_COLORS.yellow, onClick: () => renderLeaderboard(current, safePageIndex + 1) });
    actions.push({ text: '关闭', color: BUTTON_COLORS.green, onClick: () => undefined });
    uimanager.showModal('本周排行榜', `${current.weekId} · 周一 00:00 结算`, actions, render, 350);
}

function createLeaderboardRow(parent: cc.Node, entry: LeaderboardEntry, valueName: string, y: number): void {
    const colors: { [key: string]: cc.Color } = {
        gold: new cc.Color(250, 215, 119),
        silver: new cc.Color(213, 220, 228),
        bronze: new cc.Color(229, 179, 131),
        normal: new cc.Color(255, 248, 228),
    };
    const row = uimanager.createRect(parent, `leaderboard_${entry.rank}`, 430, 34, colors[entry.rewardTier] || colors.normal, 255, 10, 0, y);
    const rank = entry.rank <= 3 ? ['金杯', '银杯', '铜杯'][entry.rank - 1] : String(entry.rank);
    uimanager.createLabel(row, rank, -180, 0, entry.rank <= 3 ? 20 : 15, MOOD_COLORS.cocoa, 44, 28);
    uimanager.createCircle(row, 'leaderAvatar', 11, new cc.Color(130, 185, 168), -138, 0);
    uimanager.createLabel(row, entry.nickname, -42, 0, 16, MOOD_COLORS.cocoa, 140, 28).horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    uimanager.createLabel(row, `${valueName} ${entry.value}`, 112, 0, 14, MOOD_COLORS.cocoaSoft, 130, 28);
    uimanager.createLabel(row, entry.rewardTier === 'normal' ? '▣' : '♜', 184, 0, 18, MOOD_COLORS.cocoa, 30, 28);
}
