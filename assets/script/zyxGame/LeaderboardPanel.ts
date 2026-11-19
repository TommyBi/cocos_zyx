import { BUTTON_COLORS, BUTTON_TEXT_COLOR, formatDisplayNickname, uimanager } from '../manager/UIManager';
import { cloudService, LeaderboardEntry, LeaderboardResult, LeaderboardType } from '../manager/CloudService';
import { applyRoundedAvatarMask, createAvatarFrame, createMoodBeanMascot } from './MoodArt';
import { ASSET_PATHS, getSpriteFrame, loadRemoteTexture, prepareFeature } from '../manager/AssetLoader';

const LIST_WIDTH = 584;
const ROW_HEIGHT = 82;
const ROW_GAP = 10;
// 四条完整记录与半条下一记录，明确提示列表可以继续滑动。
const LIST_HEIGHT = ROW_HEIGHT * 4.5 + ROW_GAP * 4;
const GOLD = new cc.Color(248, 205, 103);
const LEAF = new cc.Color(190, 218, 139);
const CREAM = new cc.Color(255, 248, 228);
let leaderboardOpening = false;

/** 最高分与当前开心豆余额双榜；每次打开、切换都读取服务端当前值。 */
export async function showLeaderboardPanel(ensureProfile: () => Promise<void>, authorizeProfile: () => Promise<any>): Promise<void> {
    if (leaderboardOpening) return;
    leaderboardOpening = true;
    try {
        await ensureProfile();
        await authorizeProfile();
        await prepareFeature('leaderboard');
        await renderLeaderboard();
    } catch (error) {
        uimanager.showToast('排行榜连接中，请稍后重试');
    } finally {
        leaderboardOpening = false;
    }
}

async function renderLeaderboard(): Promise<void> {
    let root: cc.Node = null;
    let body: cc.Node = null;
    let selected: LeaderboardType = null;
    let requestId = 0;
    let top = 0;
    const tabs: { type: LeaderboardType; node: cc.Node }[] = [];
    const clearBody = (): void => {
        body.children.slice().forEach(child => child.destroy());
        body.removeAllChildren();
    };
    const select = async (type: LeaderboardType, retry: boolean = false): Promise<void> => {
        if (selected === type && !retry) return;
        selected = type;
        const id = ++requestId;
        tabs.forEach(tab => {
            const active = tab.type === type;
            const fill = active ? (type === 'beans' ? LEAF : GOLD) : new cc.Color(255, 239, 206);
            uimanager.drawRect(tab.node, 286, 70, fill, 18);
            if (active) uimanager.drawButtonSurface(tab.node, 286, 70, fill, 18);
        });
        clearBody();
        text(body, '正在查看排行榜…', 0, top - 380, 24, 480, 42).node.name = 'leaderboardLoading';
        try {
            const result = await cloudService.getLeaderboard(type);
            // 关闭或快速切换后，迟到的响应不能覆盖当前页签。
            if (!cc.isValid(root, true) || selected !== type || id !== requestId) return;
            clearBody();
            body.name = 'leaderboardBody_' + type;
            if (result.entries.length) {
                createPodium(body, result.entries.slice(0, 3), top, type);
                createEntryList(body, result, top - 466 - LIST_HEIGHT / 2, type);
            } else {
                createMoodBeanMascot(body, 0, top - 320, 110);
                text(body, type === 'beans' ? '收集开心豆，点亮你的名次' : '暂无排行，快来挑战', 0, top - 425, 24, 480, 42);
            }
            createSelfItem(body, result, -top + 76, type);
        } catch (error) {
            if (!cc.isValid(root, true) || selected !== type || id !== requestId) return;
            clearBody();
            text(body, '排行榜暂时没有连接上', 0, top - 355, 24, 480, 42);
            uimanager.createButton(body, '重新查看', 0, top - 430, 230, 64, BUTTON_COLORS.green,
                () => { void select(type, true); });
        }
    };
    root = uimanager.showModal('排行榜', '', [], panel => {
        top = panel.height / 2;
        for (const name of ['modalTitleShadow', 'modalTitlePlate']) {
            const oldTitle = panel.getChildByName(name);
            if (oldTitle) { oldTitle.removeFromParent(); oldTitle.destroy(); }
        }
        const title = art(panel, 'leaderboardTitle', ASSET_PATHS.home.leaderboardTitle, 420, 140, 0, top - 4);
        title.addComponent(cc.BlockInputEvents);
        // 依据奖杯右侧牌匾的可用区域对齐，并补偿圆体的视觉基线。
        text(title, '排行榜', 34, 0, 44, 246, 54).node.name = 'leaderboardTitleText';
        const track = uimanager.createRect(panel, 'leaderboardTabs', LIST_WIDTH, 80,
            new cc.Color(228, 193, 137), 255, 22, 0, top - 100);
        track.addComponent(cc.BlockInputEvents);
        for (const type of ['power', 'beans'] as LeaderboardType[]) {
            const tab = uimanager.createRect(track, 'leaderboardTab_' + type, 286, 70,
                CREAM, 255, 18, type === 'power' ? -145 : 145, 2);
            tab.addComponent(cc.Button);
            const caption = text(tab, type === 'power' ? '积分榜' : '开心榜', 0, 0, 25, 160, 46);
            caption.overflow = cc.Label.Overflow.NONE;
            uimanager.applyTypography(caption);
            (caption as any)._forceUpdateRenderData();
            const iconSize = 46, gap = 10;
            const iconX = -(caption.node.width + gap) / 2;
            caption.node.x = (iconSize + gap) / 2;
            if (type === 'beans') createMoodBeanMascot(tab, iconX, 0, iconSize);
            else createTrophy(tab, iconX, 0, iconSize);
            tab.on(cc.Node.EventType.TOUCH_END, () => { void select(type); });
            tabs.push({ type, node: tab });
        }
        body = new cc.Node('leaderboardBody');
        panel.addChild(body);
    }, 740, false, true, 640, {
        closeOnBlank: true,
        onDismiss: () => { ++requestId; selected = null; },
    });
    await select('power');
}

function text(parent: cc.Node, value: string, x: number, y: number, size: number,
    width: number, height: number = 40, nickname: boolean = false): cc.Label {
    const label = uimanager.createLabel(parent, value, x, y, size, BUTTON_TEXT_COLOR, width, height);
    label.enableWrapText = false;
    uimanager.applyTypography(label);
    if (nickname) label.node.name = 'leaderNickname';
    return label;
}

function number(value: number): string {
    return String(Math.max(0, Math.floor(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function art(parent: cc.Node, name: string, path: string, width: number, height: number,
    x: number, y: number): cc.Node {
    const node = new cc.Node(name);
    parent.addChild(node);
    node.setPosition(x, y);
    const sprite = node.addComponent(cc.Sprite);
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    sprite.trim = false;
    sprite.spriteFrame = getSpriteFrame('home', path);
    node.setContentSize(width, height);
    return node;
}

function createTrophy(parent: cc.Node, x: number, y: number, size: number): void {
    const node = art(parent, 'leaderboardTrophy', ASSET_PATHS.home.rankEntry, size, size, x, y);
    node.getComponent(cc.Sprite).trim = true;
    const frame = node.getComponent(cc.Sprite).spriteFrame;
    uimanager.fitSpriteFrameInside(node, frame, size, size);
}

function createAvatar(parent: cc.Node, entry: { avatarUrl?: string }, x: number, y: number,
    size: number, withFrame: boolean = true): void {
    if (withFrame) createAvatarFrame(parent, 'leaderAvatarFrame', x, y, size);
    const mask = new cc.Node('leaderAvatarMask');
    const inner = withFrame ? size - 12 : size;
    mask.setContentSize(inner, inner);
    mask.setPosition(x, y);
    parent.addChild(mask);
    applyRoundedAvatarMask(mask, withFrame ? 15 / 64 : 0.16);
    if (!withFrame) uimanager.createRect(mask, 'avatarFill', inner, inner, CREAM);
    createMoodBeanMascot(mask, 0, -2, inner - 4);
    if (entry.avatarUrl) loadRemoteTexture(entry.avatarUrl).then(texture => {
        if (!cc.isValid(mask, true)) return;
        mask.children.slice().forEach(child => {
            if (child.name === 'avatarFill') return;
            child.removeFromParent();
            child.destroy();
        });
        const node = new cc.Node('leaderAvatar');
        mask.addChild(node);
        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = new cc.SpriteFrame(texture);
        // 等比铺满裁切区，横图和竖图均不留下空边。
        const rect = sprite.spriteFrame.getRect();
        const scale = Math.max(inner / Math.max(1, rect.width), inner / Math.max(1, rect.height));
        node.setContentSize(rect.width * scale, rect.height * scale);
    }).catch(() => undefined);
}

/** 图标与数字按实际文字宽度排在一起，短数字也不会留下空列。 */
function createValue(parent: cc.Node, value: number, type: LeaderboardType, x: number, y: number,
    size: number, maxWidth: number, rightAligned: boolean = false): cc.Node {
    const group = new cc.Node('leaderboardValue');
    parent.addChild(group);
    group.setContentSize(1, size + 12);
    group.setAnchorPoint(rightAligned ? 1 : 0.5, 0.5);
    group.setPosition(x, y);
    const layout = group.addComponent(cc.Layout);
    layout.type = cc.Layout.Type.HORIZONTAL;
    layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
    layout.spacingX = 6;
    if (type === 'beans') {
        const icon = new cc.Node('valueBean');
        icon.setContentSize(size * 0.85, size + 8);
        group.addChild(icon);
        createMoodBeanMascot(icon, 0, 0, size * 0.85);
    }
    const label = text(group, number(value), 0, 0, size, 1, size + 12);
    label.overflow = cc.Label.Overflow.NONE;
    uimanager.applyTypography(label);
    label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    const fit = (): void => {
        if (!cc.isValid(group, true)) return;
        layout.updateLayout();
        group.scale = Math.min(1, maxWidth / Math.max(1, group.width));
    };
    label.node.on(cc.Node.EventType.SIZE_CHANGED, fit);
    fit();
    return group;
}

let podiumAvatarOpening: cc.SpriteFrame = null;

/** 头像开口保留底部圆章的遮挡；三档美术共用同一坐标和一张运行时蒙版。 */
function getPodiumAvatarOpening(): cc.SpriteFrame {
    if (podiumAvatarOpening) return podiumAvatarOpening;
    const size = 128, width = 252, height = 244, radius = 44;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const px = (x + 0.5) / size * width - width / 2;
            const py = (y + 0.5) / size * height - height / 2;
            const qx = Math.abs(px) - (width / 2 - radius);
            const qy = Math.abs(py) - (height / 2 - radius);
            const rounded = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) <= radius;
            const behindMedal = Math.hypot(px, py - (378 - 232)) <= 50;
            const offset = (y * size + x) * 4;
            data[offset] = data[offset + 1] = data[offset + 2] = 255;
            data[offset + 3] = rounded && !behindMedal ? 255 : 0;
        }
    }
    const texture = new cc.Texture2D();
    texture.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, size, size);
    podiumAvatarOpening = new cc.SpriteFrame(texture);
    return podiumAvatarOpening;
}

function createPodium(parent: cc.Node, entries: LeaderboardEntry[], top: number, type: LeaderboardType): void {
    const slots = [
        { index: 1, x: -192, width: 184, path: ASSET_PATHS.home.leaderboardSilver },
        { index: 2, x: 192, width: 184, path: ASSET_PATHS.home.leaderboardBronze },
        { index: 0, x: 0, width: 202, path: ASSET_PATHS.home.leaderboardGold },
    ];
    for (const slot of slots) {
        const entry = entries[slot.index];
        if (!entry) continue;
        const height = slot.width * 704 / 512;
        const podium = new cc.Node('leaderPodium_' + slot.index);
        parent.addChild(podium);
        podium.setContentSize(slot.width, height);
        podium.setPosition(slot.x, top - 418 + height / 2);
        podium.addComponent(cc.BlockInputEvents);
        const py = (pixel: number): number => height / 2 - pixel / 704 * height;
        const avatarX = -3 / 512 * slot.width, avatarY = py(232);
        // 照片比可见开口多铺一圈，由前景框体压边，避免缩放后的接缝。
        createAvatar(podium, entry, avatarX, avatarY, slot.width * 264 / 512, false);
        const foreground = new cc.Node('leaderAvatarFrameOverlay');
        podium.addChild(foreground);
        foreground.zIndex = 1;
        foreground.setPosition(avatarX, avatarY);
        foreground.setContentSize(slot.width * 252 / 512, height * 244 / 704);
        const frameMask = foreground.addComponent(cc.Mask);
        frameMask.type = cc.Mask.Type.IMAGE_STENCIL;
        frameMask.spriteFrame = getPodiumAvatarOpening();
        frameMask.alphaThreshold = 0.5;
        frameMask.inverted = true;
        art(foreground, 'leaderPodiumArt', slot.path, slot.width, height, -avatarX, -avatarY);
        text(podium, String(entry.rank), 0, py(378), 24, 36, 36);
        createValue(podium, entry.value, type, 0, py(484), slot.index === 0 ? 32 : 28, slot.width * 0.75).zIndex = 2;
        text(podium, formatDisplayNickname(entry.nickname), 0, py(594),
            slot.index === 0 ? 21 : 20, slot.width * 0.83, 32, true);
    }
}

function createEntryList(parent: cc.Node, result: LeaderboardResult, y: number, type: LeaderboardType): void {
    // 表头占用领奖台下方原有留白，固定在滚动区域之外。
    const header = uimanager.createRect(parent, 'leaderboardColumns', LIST_WIDTH, 30,
        type === 'beans' ? LEAF : GOLD, 255, 10, 0, y + LIST_HEIGHT / 2 + 20);
    const headerColor = new cc.Color(125, 91, 63);
    text(header, '排名', -263, 0, 20, 54, 28).node.color = headerColor;
    const userHeading = text(header, '用户', -163, 0, 20, 214, 28);
    userHeading.node.setAnchorPoint(0, 0.5);
    userHeading.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    userHeading.node.color = headerColor;
    const valueHeading = text(header, type === 'beans' ? '开心豆' : '积分', 270, 0, 20, 158, 28);
    valueHeading.node.setAnchorPoint(1, 0.5);
    valueHeading.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
    valueHeading.node.color = headerColor;
    const view = new cc.Node('leaderboardScroll');
    view.setContentSize(LIST_WIDTH, LIST_HEIGHT); view.setPosition(0, y); parent.addChild(view);
    view.addComponent(cc.Mask).type = cc.Mask.Type.RECT;
    const scroll = view.addComponent(cc.ScrollView); scroll.horizontal = false; scroll.vertical = true;
    const content = new cc.Node('content'); content.width = LIST_WIDTH; content.setAnchorPoint(0.5, 1); view.addChild(content);
    const entries = result.entries.slice(3);
    content.height = Math.max(LIST_HEIGHT, entries.length * (ROW_HEIGHT + ROW_GAP) - ROW_GAP);
    entries.forEach((entry, index) => {
        const isSelf = entry.playerId === result.self.playerId;
        const row = uimanager.createRect(content, 'leaderboard_' + entry.playerId, LIST_WIDTH, ROW_HEIGHT,
            isSelf ? new cc.Color(218, 234, 177) : new cc.Color(255, 234, 193), 255, 16,
            0, -ROW_HEIGHT / 2 - index * (ROW_HEIGHT + ROW_GAP));
        const g = row.getComponent(cc.Graphics);
        g.strokeColor = isSelf ? new cc.Color(159, 186, 111) : new cc.Color(216, 177, 120);
        g.lineWidth = 2; g.roundRect(-291, -40, 582, 80, 15); g.stroke();
        text(row, String(entry.rank), -263, 0, 25, 42, 38);
        createAvatar(row, entry, -207, 0, 60);
        const nickname = text(row, formatDisplayNickname(entry.nickname), -163, 0, 24, 214, 38, true);
        nickname.node.setAnchorPoint(0, 0.5); nickname.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        if (isSelf) {
            const me = uimanager.createRect(row, 'leaderboardMe', 29, 27, LEAF, 255, 11, 76, 0);
            text(me, '我', 0, 0, 17, 27, 25);
        }
        createValue(row, entry.value, type, 270, 0, 27, 158, true);
    });
    content.y = LIST_HEIGHT / 2; scroll.content = content;
}

function createSelfItem(parent: cc.Node, result: LeaderboardResult, y: number, type: LeaderboardType): void {
    const self = result.self;
    const card = uimanager.createRect(parent, 'selfItem', LIST_WIDTH, 104,
        type === 'beans' ? new cc.Color(219, 234, 181) : new cc.Color(255, 226, 154), 255, 20, 0, y);
    card.addComponent(cc.BlockInputEvents);
    const g = card.getComponent(cc.Graphics);
    g.strokeColor = type === 'beans' ? new cc.Color(163, 185, 122) : new cc.Color(216, 169, 88);
    g.lineWidth = 2; g.roundRect(-291, -51, 582, 102, 19); g.stroke();
    createAvatar(card, self, -246, 0, 70);
    const caption = text(card, '我的排名', -192, 20, 19, 200, 28);
    caption.node.setAnchorPoint(0, 0.5); caption.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    const ranking = text(card, self.onBoard && self.rank ? `第 ${self.rank} 名` : '未上榜', -192, -16, 29, 200, 40);
    ranking.node.setAnchorPoint(0, 0.5); ranking.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    g.strokeColor = type === 'beans' ? new cc.Color(184, 203, 143) : new cc.Color(232, 189, 113);
    g.lineWidth = 1; g.moveTo(50, -31); g.lineTo(50, 31); g.stroke();
    text(card, type === 'beans' ? '当前拥有' : '最高分', 163, 22, 19, 202, 28);
    const value = type === 'beans' ? (self.moodBeanBalance === undefined ? self.value : self.moodBeanBalance) : self.bestScore;
    createValue(card, value, type, 163, -17, 32, 202);
}
