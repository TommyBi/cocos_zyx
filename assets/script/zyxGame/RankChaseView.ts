import { CloudProfile, LeaderboardEntry } from '../manager/CloudService';
import { uimanager } from '../manager/UIManager';
import { loadRemoteTexture } from '../manager/AssetLoader';
import { audioManager } from '../manager/AudioManager';
import { getOvertakenRivals, getRankChaseState } from '../dataModule/RankChase';
import { GAME_RANK_PANEL_WIDTH } from '../manager/ResponsiveLayout';
import { applyRoundedAvatarMask, createAvatarFrame, createMoodBeanMascot, MOOD_COLORS } from './MoodArt';

const STEP = 112;
const ROW_OFFSET = 16;
const PANEL_HEIGHT = 420;
const TOGGLE_Y = -181;
const BOOKMARK_TRAVEL = 64;
let panelFrame: cc.SpriteFrame = null;

/** 共享圆角九宫格纹理，让底板与文字一样真正跟随透明度过渡。 */
function getPanelFrame(): cc.SpriteFrame {
    if (panelFrame) return panelFrame;
    const size = 64;
    const radius = 22;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = Math.max(Math.abs(x + 0.5 - size / 2) - (size / 2 - radius), 0);
            const dy = Math.max(Math.abs(y + 0.5 - size / 2) - (size / 2 - radius), 0);
            const offset = (y * size + x) * 4;
            data[offset] = data[offset + 1] = data[offset + 2] = 255;
            data[offset + 3] = Math.round(Math.max(0, Math.min(1, radius + 0.5 - Math.hypot(dx, dy))) * 255);
        }
    }
    const texture = new cc.Texture2D();
    texture.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, size, size);
    panelFrame = new cc.SpriteFrame(texture);
    panelFrame.insetTop = panelFrame.insetBottom = panelFrame.insetLeft = panelFrame.insetRight = radius;
    return panelFrame;
}

/** 头像下仅显示分数；使用开局快照，本局只在本地推进。 */
export default class RankChaseView {
    public root: cc.Node;
    private above: cc.Node;
    private self: cc.Node;
    private selfAvatar: cc.Node;
    private below: cc.Node;
    private selfScore: cc.Label;
    private entries: LeaderboardEntry[] = null;
    private score = 0;
    private animating = false;
    private disposed = false;
    private bookmark: cc.Node;
    private bookmarkReveal = { progress: 0 };
    private bookmarkX = 0;
    private celebration: cc.Node = null;
    private celebrationMotion: { progress: number } = null;

    constructor(parent: cc.Node, private profile: CloudProfile, snapshot: Promise<LeaderboardEntry[]>, onToggle: () => void) {
        this.root = new cc.Node('rankChase');
        this.root.setContentSize(GAME_RANK_PANEL_WIDTH, PANEL_HEIGHT);
        this.root.zIndex = 160;
        this.root.opacity = 0;
        parent.addChild(this.root);
        const shadow = this.createPlate(this.root, 'chasePanelShadow', GAME_RANK_PANEL_WIDTH, PANEL_HEIGHT,
            new cc.Color(68, 92, 61), 0, -5);
        shadow.opacity = 38;
        shadow.zIndex = -3;
        const rim = this.createPlate(this.root, 'chasePanelRim', GAME_RANK_PANEL_WIDTH, PANEL_HEIGHT,
            new cc.Color(123, 153, 107));
        rim.zIndex = -2;
        const panel = this.createPlate(this.root, 'chasePanel', GAME_RANK_PANEL_WIDTH - 4, PANEL_HEIGHT - 4,
            new cc.Color(224, 237, 198), 0, 1);
        panel.zIndex = -1;
        const collapse = this.createPlate(this.root, 'chaseCollapse', 52, 44, new cc.Color(202, 220, 171), 0, TOGGLE_Y);
        collapse.addComponent(cc.Button).transition = cc.Button.Transition.NONE;
        collapse.on(cc.Node.EventType.TOUCH_END, onToggle);
        uimanager.createLabel(collapse, '‹', 0, 1, 34, MOOD_COLORS.cocoa, 44, 42);
        this.bookmark = new cc.Node('rankChaseBookmark');
        this.bookmark.setContentSize(64, 44);
        this.bookmark.zIndex = 160;
        this.bookmark.active = false;
        parent.addChild(this.bookmark);
        this.bookmark.addComponent(cc.Button).transition = cc.Button.Transition.NONE;
        uimanager.drawButtonSurface(this.bookmark, 64, 44, new cc.Color(194, 217, 151), 12);
        this.bookmark.on(cc.Node.EventType.TOUCH_START, () => {
            cc.Tween.stopAllByTarget(this.bookmark);
            cc.tween(this.bookmark).to(0.07, { scale: 0.94 }).start();
        });
        this.bookmark.on(cc.Node.EventType.TOUCH_END, () => {
            cc.Tween.stopAllByTarget(this.bookmark);
            cc.tween(this.bookmark).to(0.1, { scale: 1 }).start();
            if (this.bookmarkReveal.progress === 1) onToggle();
        });
        this.bookmark.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.Tween.stopAllByTarget(this.bookmark);
            cc.tween(this.bookmark).to(0.1, { scale: 1 }).start();
        });
        uimanager.createLabel(this.bookmark, '›', 0, 1, 32, MOOD_COLORS.cocoa, 40, 40);
        this.above = this.createSlot('chaseAbove', STEP + ROW_OFFSET);
        this.self = this.createSlot('chaseSelf', ROW_OFFSET);
        this.below = this.createSlot('chaseBelow', -STEP + ROW_OFFSET);
        this.above.opacity = 220;
        this.below.opacity = 170;
        this.selfAvatar = this.setAvatar(this.self, profile ? profile.avatarUrl : '', 64);
        const badge = uimanager.createRect(this.self, 'chaseSelfBadge', 28, 26,
            MOOD_COLORS.honey, 255, 12, 26, 27);
        badge.zIndex = 90;
        const me = uimanager.createLabel(badge, '我', 0, 0, 18, MOOD_COLORS.cocoa, 26, 26);
        uimanager.applyTypography(me);
        this.selfScore = this.createScore(this.self, 0, -50, 26);
        snapshot.then((entries) => {
            if (this.disposed || !cc.isValid(this.root)) return;
            // 独立复制，其他界面刷新榜单也不会改变本局对手与分数。
            this.entries = entries.map((entry) => ({ ...entry }));
            this.render();
        }).catch(() => undefined);
    }

    public setPosition(x: number, y: number): void {
        this.root.setPosition(x, y);
    }

    public setExpansion(progress: number, bookmarkX: number, y: number): void {
        this.root.active = progress > 0;
        this.root.opacity = Math.round(255 * progress);
        this.bookmarkX = bookmarkX;
        this.bookmark.y = y + TOGGLE_Y;
        this.updateBookmark();
    }

    /** 页签独立收展：面板完全退出后才能出现，页签退出后才交还面板入场。 */
    public setBookmarkVisible(visible: boolean, onComplete: () => void = null): void {
        if (this.disposed || (visible && this.root.active)) return;
        cc.Tween.stopAllByTarget(this.bookmarkReveal);
        const target = visible ? 1 : 0;
        if (this.bookmarkReveal.progress === target) {
            this.updateBookmark();
            if (onComplete) onComplete();
            return;
        }
        cc.tween(this.bookmarkReveal)
            .to(visible ? 0.18 : 0.12, { progress: target }, {
                easing: 'sineOut',
                onUpdate: () => {
                    if (!this.disposed) this.updateBookmark();
                },
            })
            .call(() => {
                if (this.disposed) return;
                this.updateBookmark();
                if (onComplete) onComplete();
            }).start();
    }

    private updateBookmark(): void {
        const progress = this.bookmarkReveal.progress;
        this.bookmark.active = progress > 0;
        this.bookmark.x = this.bookmarkX - BOOKMARK_TRAVEL * (1 - progress);
        this.bookmark.opacity = Math.round(255 * progress);
    }

    public updateScore(score: number): void {
        if (this.disposed) return;
        const passed = this.entries && score > this.score
            ? getOvertakenRivals(this.entries, this.profile ? this.profile.playerId : '', this.score, score).length : 0;
        this.score = score;
        this.selfScore.string = String(score);
        // 动画中再加分只更新最终落点，不排队播放旧名次。
        if (this.animating) return;
        if (passed > 0) this.playOvertake();
        else this.render();
    }

    public dispose(): void {
        this.disposed = true;
        this.stopCelebration();
        cc.Tween.stopAllByTarget(this.bookmarkReveal);
        for (const node of [this.root, this.bookmark, this.selfAvatar, this.above, this.below]) cc.Tween.stopAllByTarget(node);
    }

    private createPlate(parent: cc.Node, name: string, width: number, height: number,
        color: cc.Color, x: number = 0, y: number = 0): cc.Node {
        const node = new cc.Node(name);
        node.setContentSize(width, height);
        node.setPosition(x, y);
        node.color = color;
        parent.addChild(node);
        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = getPanelFrame();
        sprite.type = cc.Sprite.Type.SLICED;
        node.setContentSize(width, height);
        return node;
    }

    private createScore(parent: cc.Node, value: number, y: number, size: number = 24): cc.Label {
        const label = uimanager.createLabel(parent, String(value), 0, y, size, MOOD_COLORS.cocoa, 80, 34);
        uimanager.applyTypography(label);
        return label;
    }

    private createSlot(name: string, y: number): cc.Node {
        const slot = new cc.Node(name);
        slot.setPosition(0, y);
        this.root.addChild(slot);
        return slot;
    }

    private setAvatar(slot: cc.Node, url: string, size: number): cc.Node {
        const frame = createAvatarFrame(slot, 'chaseAvatar', 0, 0, size);
        const mask = new cc.Node('chaseAvatarMask');
        mask.setContentSize(size - 10, size - 10);
        frame.addChild(mask);
        applyRoundedAvatarMask(mask);
        createMoodBeanMascot(mask, 0, -1, size - 12);
        if (!url) return frame;
        loadRemoteTexture(url).then((texture) => {
            if (this.disposed || !cc.isValid(mask)) return;
            for (const child of mask.children.slice()) child.destroy();
            mask.removeAllChildren();
            const node = new cc.Node('chaseRemoteAvatar');
            mask.addChild(node);
            const sprite = node.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = new cc.SpriteFrame(texture);
            uimanager.fitSpriteFrameInside(node, sprite.spriteFrame, size - 10, size - 10);
        }).catch(() => undefined);
        return frame;
    }

    private renderRival(slot: cc.Node, entry: LeaderboardEntry, size: number): void {
        const key = entry ? entry.playerId : '';
        if ((slot as any).entryKey === key) return;
        (slot as any).entryKey = key;
        for (const child of slot.children.slice()) child.destroy();
        slot.removeAllChildren();
        slot.active = !!entry;
        if (entry) {
            this.setAvatar(slot, entry.avatarUrl, size);
            this.createScore(slot, entry.value, -size / 2 - 19);
        }
    }

    private render(): void {
        if (!this.entries) return;
        const state = getRankChaseState(this.entries, this.profile ? this.profile.playerId : '', this.score);
        this.renderRival(this.above, state.above, 56);
        this.renderRival(this.below, state.below, 52);
    }

    private playOvertake(): void {
        this.playCelebration(audioManager.playOvertake());
        cc.Tween.stopAllByTarget(this.above);
        cc.Tween.stopAllByTarget(this.below);
        this.animating = true;
        this.self.zIndex = 80;
        cc.tween(this.above).to(0.2, { y: STEP + ROW_OFFSET - 20, opacity: 0 }, { easing: 'sineInOut' }).start();
        cc.tween(this.below).to(0.2, { y: -STEP + ROW_OFFSET - 16, opacity: 0 }, { easing: 'sineInOut' }).start();
        cc.tween(this.selfAvatar)
            .to(0.12, { scale: 1.12, y: 14 }, { easing: 'sineOut' })
            .to(0.18, { y: STEP, scale: 1.08 }, { easing: 'sineOut' })
            .to(0.22, { y: 0, scale: 1 }, { easing: 'sineInOut' })
            .call(() => {
                if (this.disposed || !cc.isValid(this.root)) return;
                this.animating = false;
                this.render();
                this.above.setPosition(0, STEP + ROW_OFFSET + 8);
                this.below.setPosition(0, -STEP + ROW_OFFSET + 8);
                cc.tween(this.above).to(0.18, { y: STEP + ROW_OFFSET, opacity: 220 }, { easing: 'sineOut' }).start();
                cc.tween(this.below).to(0.18, { y: -STEP + ROW_OFFSET, opacity: 170 }, { easing: 'sineOut' }).start();
            })
            .start();
    }

    private stopCelebration(): void {
        if (this.celebrationMotion) cc.Tween.stopAllByTarget(this.celebrationMotion);
        this.celebrationMotion = null;
        if (this.celebration && cc.isValid(this.celebration)) this.celebration.destroy();
        this.celebration = null;
    }

    /** 哑光纸彩带从头像两侧扬起，留出脸部与分数；末段随欢呼渐隐。 */
    private playCelebration(duration: number): void {
        this.stopCelebration();
        const node = new cc.Node('rankVictoryRibbons');
        this.selfAvatar.addChild(node);
        node.zIndex = 120;
        this.celebration = node;
        const motion = this.celebrationMotion = { progress: 0 };
        const g = node.addComponent(cc.Graphics);
        const colors = [new cc.Color(235, 164, 153), new cc.Color(241, 204, 116),
            new cc.Color(154, 197, 170), new cc.Color(186, 174, 207)];
        const draw = (): void => {
            if (this.disposed || !cc.isValid(node)) return;
            const t = motion.progress;
            const rise = 1 - Math.pow(1 - Math.min(1, t / 0.18), 3);
            const drift = Math.max(0, t - 0.18) * 20;
            node.opacity = Math.round(255 * Math.min(1, (1 - t) / 0.32));
            g.clear();
            g.lineCap = cc.Graphics.LineCap.ROUND;
            for (let i = 0; i < 4; i++) {
                const side = i % 2 ? 1 : -1;
                const outer = i > 1 ? 1 : 0;
                const x = side * (24 + outer * 9);
                const sway = Math.sin(t * Math.PI * 4 + i) * 3 * rise;
                g.strokeColor = colors[i]; g.lineWidth = outer ? 4 : 6;
                g.moveTo(x, 13);
                g.bezierCurveTo(x + side * 13 * rise, 26 + 40 * rise - drift,
                    x + side * (27 + sway) * rise, 15 + 53 * rise - drift,
                    x + side * (11 + sway) * rise, 14 + 31 * rise - drift);
                g.bezierCurveTo(x + side * (2 + sway) * rise, 12 + 21 * rise - drift,
                    x + side * (24 + sway) * rise, 6 + 19 * rise - drift,
                    x + side * (14 + sway) * rise, 3 + 8 * rise - drift);
                g.stroke();
            }
            for (let i = 0; i < 12; i++) {
                const side = i % 2 ? 1 : -1;
                const x = side * (29 + (i % 4) * 7) * rise + Math.sin(t * 9 + i) * 3;
                const y = 24 + (18 + (i % 5) * 8) * rise - drift * (0.8 + i % 3 * 0.3);
                const angle = i * 1.7 + t * (i % 2 ? 5 : -5);
                const ux = Math.cos(angle) * 2.8, uy = Math.sin(angle) * 2.8;
                const vx = -Math.sin(angle) * 1.5, vy = Math.cos(angle) * 1.5;
                g.fillColor = colors[i % colors.length];
                g.moveTo(x + ux + vx, y + uy + vy); g.lineTo(x - ux + vx, y - uy + vy);
                g.lineTo(x - ux - vx, y - uy - vy); g.lineTo(x + ux - vx, y + uy - vy);
                g.close(); g.fill();
            }
            const starY = 37 + 12 * rise - drift * 0.2;
            for (let i = 0; i < 10; i++) {
                const angle = Math.PI / 2 + i * Math.PI / 5;
                const radius = (i % 2 ? 4.5 : 9) * rise;
                const x = Math.cos(angle) * radius, y = starY + Math.sin(angle) * radius;
                if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
            }
            g.close(); g.fillColor = new cc.Color(250, 218, 134); g.fill();
            g.strokeColor = new cc.Color(203, 161, 91); g.lineWidth = 1.2; g.stroke();
        };
        draw();
        cc.tween(motion).to(duration, { progress: 1 }, { onUpdate: draw } as any)
            .call(() => { if (this.celebration === node) this.stopCelebration(); }).start();
    }
}
