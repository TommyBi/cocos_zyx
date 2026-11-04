import { BUTTON_COLORS, formatDisplayNickname, uimanager } from '../manager/UIManager';
import { cloudService, LeaderboardEntry, LeaderboardResult } from '../manager/CloudService';
import { applyRoundedAvatarMask, createAvatarFrame, createMoodBeanMascot, MOOD_COLORS } from './MoodArt';
import { loadRemoteTexture } from '../manager/AssetLoader';

const LIST_WIDTH = 540;
const LIST_TOP_OFFSET = 382;
const SELF_CENTER_OFFSET = -232;
const SELF_HEIGHT = 88;
const LIST_HEIGHT = LIST_TOP_OFFSET - (SELF_CENTER_OFFSET + SELF_HEIGHT / 2 + 16);
const LIST_CENTER_OFFSET = LIST_TOP_OFFSET - LIST_HEIGHT / 2;
const ROW_HEIGHT = 110;
const AVATAR_SIZE = 90;
const RANK_LEFT = -245;
const AVATAR_CENTER = -165;
const PLAYER_LEFT = -95;
const PLAYER_WIDTH = 210;
const SCORE_CENTER = 185;

/**
 * 永久单局最高分排行榜弹窗。
 * 列表展示全服前 200 名；自己的成绩固定在列表下方独立卡片，
 * 未上榜时显示「未上榜」并展示单局最高分。无周期与结算概念。
 */
export async function showLeaderboardPanel(
    ensureProfile: () => Promise<void>,
    authorizeProfile: () => Promise<any>,
): Promise<void> {
    try {
        // 授权与建档并行；需要首次授权时由原生用户信息按钮承接真实点击。
        const authorization = authorizeProfile();
        await ensureProfile();
        // 无论授权成功、取消还是当前平台不支持，都继续展示排行榜。
        await authorization;
        const result = await cloudService.getLeaderboard('power');
        renderLeaderboard(result);
    } catch (error) {
        uimanager.showToast('排行榜连接中，请稍后重试');
    }
}

function renderLeaderboard(result: LeaderboardResult): void {
    const decoration = (panel: cc.Node, centerY: number): void => {
        createListHeader(panel, centerY + 414);
        createEntryList(panel, result.entries, centerY + LIST_CENTER_OFFSET);
        createSelfItem(panel, result, centerY + SELF_CENTER_OFFSET);
    };
    uimanager.showModal(
        '排行榜',
        '',
        [{ text: '关闭', color: BUTTON_COLORS.green, onClick: () => undefined }],
        decoration,
        520,
        false,
        true,
        600,
    );
}

/** 列表列头：排名 / 玩家 / 最高分。 */
function createListHeader(panel: cc.Node, y: number): void {
    const rank = uimanager.createLabel(panel, '排名', RANK_LEFT, y, 34, MOOD_COLORS.cocoaSoft, 74, 46);
    rank.node.setAnchorPoint(0, 0.5);
    rank.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    rank.enableBold = true;
    const player = uimanager.createLabel(panel, '玩家', PLAYER_LEFT, y, 34, MOOD_COLORS.cocoaSoft, PLAYER_WIDTH, 46);
    player.node.setAnchorPoint(0, 0.5);
    player.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    player.enableBold = true;
    const score = uimanager.createLabel(panel, '最高分', SCORE_CENTER, y, 34, MOOD_COLORS.cocoaSoft, 130, 46);
    score.node.setAnchorPoint(0.5, 0.5);
    score.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    score.enableBold = true;
}

/** 可滚动榜单：仅承载前 200 名，自己不在此重复展示。 */
function createEntryList(panel: cc.Node, entries: LeaderboardEntry[], centerY: number): void {
    const view = new cc.Node('leaderboardScroll');
    view.width = LIST_WIDTH;
    view.height = LIST_HEIGHT;
    view.setAnchorPoint(0.5, 0.5);
    view.setPosition(0, centerY);
    panel.addChild(view);
    const mask = view.addComponent(cc.Mask);
    mask.type = cc.Mask.Type.RECT;
    const scroll = view.addComponent(cc.ScrollView);
    scroll.horizontal = false;
    scroll.vertical = true;
    (scroll as any).bounce = true;

    const content = new cc.Node('content');
    content.width = LIST_WIDTH;
    content.setAnchorPoint(0.5, 1);
    const layout = content.addComponent(cc.Layout);
    layout.type = cc.Layout.Type.VERTICAL;
    layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
    layout.paddingTop = 2;
    layout.spacingY = 10;
    view.addChild(content);
    scroll.content = content;

    if (entries.length === 0) {
        content.height = 100;
        uimanager.createLabel(content, '暂无排行，快来挑战', 0, -40, 20, MOOD_COLORS.cocoaSoft, LIST_WIDTH - 40, 40);
        return;
    }
    for (const entry of entries) createLeaderboardRow(content, entry);
    content.setPosition(0, LIST_HEIGHT / 2);
}

function createLeaderboardRow(parent: cc.Node, entry: LeaderboardEntry): void {
    const tierColors: { [key: string]: cc.Color } = {
        gold: new cc.Color(250, 215, 119),
        silver: new cc.Color(213, 220, 228),
        bronze: new cc.Color(229, 179, 131),
        normal: new cc.Color(255, 248, 228),
    };
    const row = uimanager.createRect(
        parent,
        `leaderboard_${entry.rank}`,
        LIST_WIDTH,
        ROW_HEIGHT,
        tierColors[entry.rewardTier] || tierColors.normal,
        255,
        18,
        0,
        0,
    );
    const rankLabel = uimanager.createLabel(row, String(entry.rank), RANK_LEFT, 0, entry.rank <= 3 ? 30 : 26, MOOD_COLORS.cocoa, 64, 42);
    rankLabel.node.setAnchorPoint(0, 0.5);
    rankLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    rankLabel.enableBold = true;
    createAvatarFrame(row, 'leaderAvatarFrame', AVATAR_CENTER, 0, AVATAR_SIZE);
    const avatarMask = new cc.Node('leaderAvatarMask');
    avatarMask.width = AVATAR_SIZE;
    avatarMask.height = AVATAR_SIZE;
    avatarMask.setPosition(AVATAR_CENTER, 0);
    row.addChild(avatarMask);
    applyRoundedAvatarMask(avatarMask);
    // 加载前后都有完整的开心豆默认头像，远程头像失败时也不会留下空白框。
    createMoodBeanMascot(avatarMask, 0, -2, 78);
    if (entry.avatarUrl) {
        loadRemoteTexture(entry.avatarUrl).then((texture) => {
            if (!cc.isValid(avatarMask)) return;
            avatarMask.removeAllChildren();
            const avatar = new cc.Node('leaderAvatar');
            avatarMask.addChild(avatar);
            const sprite = avatar.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = new cc.SpriteFrame(texture);
            uimanager.fitSpriteFrameInside(avatar, sprite.spriteFrame, AVATAR_SIZE, AVATAR_SIZE);
        }).catch(() => undefined);
    }
    const nickname = uimanager.createLabel(row, formatDisplayNickname(entry.nickname), PLAYER_LEFT, 0, 26, MOOD_COLORS.cocoa, PLAYER_WIDTH, 42);
    nickname.node.setAnchorPoint(0, 0.5);
    nickname.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    nickname.enableBold = true;
    const score = uimanager.createLabel(row, `${entry.value}`, SCORE_CENTER, 0, 26, MOOD_COLORS.cocoa, 100, 42);
    score.node.setAnchorPoint(0.5, 0.5);
    score.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    score.enableBold = true;
}

/** 自己的成绩卡片：固定在列表下方，描边与榜单区分，未上榜单独标注。 */
function createSelfItem(panel: cc.Node, result: LeaderboardResult, y: number): void {
    const self = result.self;
    const card = uimanager.createRect(panel, 'selfItem', LIST_WIDTH, SELF_HEIGHT, new cc.Color(255, 232, 176), 255, 18, 0, y);
    const graphics = card.getComponent(cc.Graphics);
    graphics.strokeColor = new cc.Color(211, 164, 98, 255);
    graphics.lineWidth = 2.5;
    graphics.roundRect(-LIST_WIDTH / 2 + 2, -42, LIST_WIDTH - 4, 84, 17);
    graphics.stroke();

    const title = self.onBoard && self.rank ? `我的排名：第 ${self.rank} 名` : '我的排名：未上榜';
    const rankLabel = uimanager.createLabel(card, title, -LIST_WIDTH / 2 + 20, 0, 24, MOOD_COLORS.cocoa, 270, 48);
    rankLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    rankLabel.node.setAnchorPoint(0, 0.5);
    rankLabel.enableBold = true;
    const scoreLabel = uimanager.createLabel(card, `最高分 ${self.bestScore}`, LIST_WIDTH / 2 - 20, 0, 24, MOOD_COLORS.cocoa, 190, 48);
    scoreLabel.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
    scoreLabel.node.setAnchorPoint(1, 0.5);
    scoreLabel.enableBold = true;
}
