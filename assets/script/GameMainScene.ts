import { BUTTON_COLORS, uimanager } from './manager/Uimanager';
import { cloudService, LeaderboardEntry, LeaderboardResult } from './manager/CloudService';
import { settingsPanel } from './manager/SettingsPanel';
import { HAPPY_BOTTLE_TARGET, zyxGameModule } from './dataModule/ZyxGameModule';
import ZyxGame, { SettlementExitRequest } from './zyxGame/ZyxGame';
import {
    createMoodCanvasBackground,
    createExperienceToken,
    drawMoodBlockMaterial,
    createMoodStamp,
    createMoodToken,
    createMoodWatermarkWall,
    createWishBottle,
    getMoodColor,
    MOOD_COLORS,
    playBottleBurp,
    presentWishBottleAbsoluteProgress,
    setWishBottleProgressImmediately,
} from './zyxGame/MoodArt';
import { ART_ALBUMS, renderAlbumShelf, renderAlbumView, syncRealmCloudState } from './zyxGame/ArtAlbum';
import { playBookPageTransition } from './zyxGame/BookTransition';
import { ensureAlbumArtReady, ensureGameResourcesReady, ensureHomeReady, ensureRealmReady, isBundleReady, loadSpriteFrame } from './manager/AssetLoader';
import { registerSystemShare } from './manager/ShareReward';
import { audioManager, MusicName } from './manager/AudioManager';

const { ccclass } = cc._decorator;
declare const wx: any;

/** 开始页与核心玩法之间的唯一场景入口。 */
@ccclass
export default class GameMainScene extends cc.Component {
    private screen: cc.Node = null;
    private profileNameLabel: cc.Label = null;
    private profileAvatarContent: cc.Node = null;
    private profileAuthorizationButton: cc.Node = null;
    private profileLevelLabel: cc.Label = null;
    private profileExperienceFill: cc.Node = null;
    private profileExperienceLabel: cc.Label = null;
    private profileExperienceTrackWidth: number = 238;
    private profileExperienceFillWidth: number = 192;
    private profileExperienceFillLeft: number = -88;
    private nativeWeChatProfileButton: any = null;
    private homeMoodBottle: cc.Node = null;
    private homeMoodCountLabel: cc.Label = null;
    /** 示意棋盘/手势层；结算满瓶演出期间隐藏，结束后再淡入恢复循环。 */
    private homeDemoLayer: cc.Node = null;
    private homeDemoClock: cc.Node = null;
    private homeDemoPlaying: boolean = false;
    private startHomeDemoLoop: () => void = null;
    private startButton: cc.Node = null;
    private happyBottleCountLabel: cc.Label = null;
    private happyBottleCountBadge: cc.Node = null;
    private happyBottleCountCard: cc.Node = null;
    private cloudProfileReady: boolean = false;
    private roundStartedAt: number = 0;
    private gmBubble: cc.Node = null;
    private albumArtIndex: number = 0;
    private currentAlbumId: string = ART_ALBUMS[0] ? ART_ALBUMS[0].id : 'album_city';
    private albumArrowHoldDirection: number = 0;
    private albumArrowHoldRepeated: boolean = false;
    private albumArrowHoldDelay: () => void = null;
    private albumArrowRepeatTick: () => void = null;
    private albumArrowNavigate: (direction: number) => void = null;
    private bookTransitionLayer: cc.Node = null;
    private bookTransitioning: boolean = false;
    private gameAssetsLoading: boolean = false;
    private realmAssetsLoading: boolean = false;
    private albumAssetsLoading: boolean = false;

    public onLoad(): void {
        uimanager.init(this.node);
        registerSystemShare();
        cc.debug.setDisplayStats(false);
        const canvas = this.node.getComponent(cc.Canvas);
        const frame = cc.view.getFrameSize();
        if (canvas && frame.width > frame.height) {
            // 桌面横屏预览继续固定高度；微信竖屏按场景默认配置固定宽度，避免窄屏横向裁切。
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }
        this.node.on(cc.Node.EventType.TOUCH_END, this.handleGlobalAlbumTouchEnd, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.handleGlobalAlbumTouchCancel, this, true);
        this.createGmBubble();
    }

    public start(): void {
        const search = typeof window !== 'undefined'
            && window.location
            && typeof window.location.search === 'string'
            ? window.location.search
            : '';
        const seedMatch = search.match(/[?&]seed=(\d+)/);
        zyxGameModule.setRoundSeedOverride(seedMatch ? Number(seedMatch[1]) : 0);
        if (search.indexOf('autostart=1') >= 0) {
            this.startGame();
            return;
        }
        ensureHomeReady()
            .then(() => this.showHome())
            .catch((error: Error) => this.showResourceLoadFailure('首页', () => this.start()));
    }

    public onDestroy(): void {
        this.stopAlbumArrowHold();
        if (this.bookTransitionLayer && cc.isValid(this.bookTransitionLayer)) {
            this.stopScreenTweens(this.bookTransitionLayer);
            this.bookTransitionLayer.destroy();
        }
        this.bookTransitionLayer = null;
        this.bookTransitioning = false;
        this.node.off(cc.Node.EventType.TOUCH_END, this.handleGlobalAlbumTouchEnd, this, true);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.handleGlobalAlbumTouchCancel, this, true);
        this.destroyNativeWeChatProfileButton();
    }

    private showHome(): void {
        uimanager.closeModal();
        this.replaceScreen('home');
        zyxGameModule.refreshPersistentProgress();
        const width = cc.winSize.width;
        const height = cc.winSize.height;
        const safeArea = uimanager.getSafeAreaMetrics();
        const heightDelta = height - 1334;
        // 首页以“标题—整理演示—开始操作”自上而下收束，避免标题过高、底部按钮过轻。
        const titleY = 356 + Math.max(0, Math.min(64, heightDelta * 0.24));
        // 演示区与说明整体上提 15px；棋盘动画在演示区内再上提 10px，拉开文字呼吸感。
        const moodSceneY = -27 + Math.max(-16, Math.min(34, heightDelta * 0.1));
        const tipY = -304 - Math.max(-10, Math.min(24, heightDelta * 0.07));
        const startY = -440 - Math.max(-14, Math.min(32, heightDelta * 0.09));
        const profileY = height / 2 - Math.max(32, safeArea.top) - 65;

        createMoodCanvasBackground(this.screen, width, height);
        createMoodWatermarkWall(this.screen, width, height);
        const profile = this.createHomeProfile(profileY);
        this.createHappyBottleCount(profile);
        this.bootstrapCloudProfile();

        this.createHomeTitleLogo(titleY);
        this.createHomeMoodScene(moodSceneY);
        this.createHomeFeatureEntries();
        this.createHomeSettingsEntry();
        this.createHomeRotatingTip(tipY);

        this.startButton = uimanager.createButton(
            this.screen,
            '开始消除',
            0,
            startY,
            462,
            136,
            BUTTON_COLORS.green,
            () => this.startGame(),
            40,
        );
        this.decorateStartButton();
        this.createStartButtonGuide();
        this.preloadGameResourcesSilently();
    }

    /** 首页可交互后立即预热消除分包；失败不打扰用户，点击开始时会自动重试。 */
    private preloadGameResourcesSilently(): void {
        ensureGameResourcesReady()
            .catch((error: Error) => cc.warn('Game resource preload failed', error));
    }

    /** 首页正式艺术字标题：位图保持等比显示，不再使用程序文字。 */
    private createHomeTitleLogo(centerY: number): void {
        const logo = new cc.Node('homeTitleLogo');
        logo.setPosition(0, centerY + 6);
        logo.setContentSize(560, 190);
        logo.zIndex = 65;
        this.screen.addChild(logo);

        const sprite = logo.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        loadSpriteFrame('home', 'images/home_title_logo_v1', (error, frame) => {
            if (error || !frame || !cc.isValid(logo)) return;
            sprite.spriteFrame = frame;
            uimanager.fitSpriteFrameInside(logo, frame, 560, 190);
            logo.opacity = 0;
            logo.scale = 0.9;
            cc.tween(logo).to(0.28, { opacity: 255, scale: 1 }, { easing: 'backOut' }).start();
        });
    }

    /** 档案卡右侧独立资产区：只保留区域底与数量底，不再给瓶子叠圆环。 */
    private createHappyBottleCount(profile: cc.Node): void {
        const cardWidth = 116;
        const cardHeight = 84;
        const cardX = 184;
        const card = uimanager.createRect(profile, 'happyBottleCount', cardWidth, cardHeight, new cc.Color(237, 244, 222), 255, 18, cardX, 0);
        card.zIndex = 25;
        this.happyBottleCountCard = card;
        const borderNode = new cc.Node('happyBottleCountBorder');
        borderNode.zIndex = 2;
        card.addChild(borderNode);
        const border = borderNode.addComponent(cc.Graphics);
        border.strokeColor = new cc.Color(126, 175, 146, 150);
        border.lineWidth = 1.5;
        border.roundRect(-cardWidth / 2 + 1.5, -cardHeight / 2 + 1.5, cardWidth - 3, cardHeight - 3, 16.5);
        border.stroke();

        this.drawHudHappyBottle(card, -31, -1);

        const name = uimanager.createLabel(card, '开心瓶', 27, 18, 13, MOOD_COLORS.cocoaSoft, 54, 20);
        this.makeCartoonBold(name, new cc.Color(255, 249, 232), 0.55);
        const badge = uimanager.createRect(card, 'happyBottleBadge', 54, 30, MOOD_COLORS.honey, 255, 15, 27, -14);
        badge.zIndex = 8;
        this.happyBottleCountBadge = badge;
        const badgeBorderNode = new cc.Node('happyBottleBadgeBorder');
        badgeBorderNode.zIndex = 2;
        badge.addChild(badgeBorderNode);
        const badgeBorder = badgeBorderNode.addComponent(cc.Graphics);
        badgeBorder.strokeColor = new cc.Color(124, 83, 54, 94);
        badgeBorder.lineWidth = 1.2;
        badgeBorder.roundRect(-26, -13, 52, 26, 13);
        badgeBorder.stroke();
        this.happyBottleCountLabel = uimanager.createLabel(
            badge,
            String(zyxGameModule.happyBottleCount),
            0,
            1,
            24,
            MOOD_COLORS.cocoa,
            50,
            26,
        );
        this.makeCartoonBold(this.happyBottleCountLabel, new cc.Color(255, 246, 224), 0.7);
        this.layoutHappyBottleCountBadge();
        card.addComponent(cc.Button);
        card.on(cc.Node.EventType.TOUCH_START, () => {
            cc.Tween.stopAllByTarget(card);
            cc.tween(card).to(0.06, { scale: 0.96 }).start();
        }, this);
        card.on(cc.Node.EventType.TOUCH_END, () => {
            cc.Tween.stopAllByTarget(card);
            cc.tween(card).to(0.12, { scale: 1 }, { easing: 'backOut' }).start();
            this.showWorryFreeRealm();
        }, this);
        card.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.Tween.stopAllByTarget(card);
            cc.tween(card).to(0.1, { scale: 1 }).start();
        }, this);
    }

    /** 数量保持在固定胶囊内，位数增加时只缩字号，不改变卡片布局。 */
    private layoutHappyBottleCountBadge(countOverride?: number): void {
        if (!this.happyBottleCountBadge || !this.happyBottleCountLabel) return;
        if (!cc.isValid(this.happyBottleCountBadge) || !cc.isValid(this.happyBottleCountLabel.node)) return;
        const count = Math.max(0, Math.floor(
            Number.isFinite(countOverride) ? countOverride : zyxGameModule.happyBottleCount,
        ));
        this.happyBottleCountLabel.string = String(count);
        const digits = String(count).length;
        this.happyBottleCountLabel.node.setPosition(0, 1);
        this.happyBottleCountLabel.node.width = 50;
        this.happyBottleCountLabel.node.height = 26;
        this.happyBottleCountLabel.fontSize = digits >= 4 ? 16 : (digits >= 3 ? 20 : 24);
    }

    /** 小尺寸开心瓶：只画瓶体和彩球，不附加圆环或落地阴影。 */
    private drawHudHappyBottle(parent: cc.Node, x: number, y: number): void {
        const icon = new cc.Node('hudHappyBottle');
        icon.setPosition(x, y);
        icon.zIndex = 16;
        parent.addChild(icon);
        const g = icon.addComponent(cc.Graphics);

        // 瓶身：暖玻璃底 + 深描边，保证小尺寸可读。
        g.fillColor = new cc.Color(255, 244, 220, 230);
        g.strokeColor = new cc.Color(120, 82, 58, 235);
        g.lineWidth = 3.2;
        g.moveTo(-11, 14);
        g.lineTo(-11, 6);
        g.bezierCurveTo(-11, 1, -18, -2, -18, -10);
        g.lineTo(-18, -20);
        g.bezierCurveTo(-18, -26, -10, -28, 0, -28);
        g.bezierCurveTo(10, -28, 18, -26, 18, -20);
        g.lineTo(18, -10);
        g.bezierCurveTo(18, -2, 11, 1, 11, 6);
        g.lineTo(11, 14);
        g.close();
        g.fill();
        g.stroke();

        // 瓶内少量彩球，避免缩成一团色块。
        const balls = [
            { x: -6, y: -16, color: new cc.Color(241, 194, 85) },
            { x: 5, y: -17, color: new cc.Color(126, 190, 157) },
            { x: 0, y: -8, color: new cc.Color(239, 151, 105) },
            { x: -7, y: -6, color: new cc.Color(111, 171, 196) },
            { x: 6, y: -5, color: new cc.Color(228, 154, 151) },
        ];
        for (const ball of balls) {
            g.fillColor = new cc.Color(70, 50, 44, 70);
            g.circle(ball.x + 0.6, ball.y - 0.8, 5.2);
            g.fill();
            g.fillColor = ball.color;
            g.circle(ball.x, ball.y, 5);
            g.fill();
            g.fillColor = new cc.Color(255, 255, 255, 150);
            g.ellipse(ball.x - 1.4, ball.y + 1.4, 1.8, 1.2);
            g.fill();
        }

        g.fillColor = new cc.Color(255, 255, 255, 100);
        g.roundRect(-13, -18, 3.5, 22, 1.5);
        g.fill();

        g.fillColor = new cc.Color(255, 244, 220, 235);
        g.strokeColor = new cc.Color(120, 82, 58, 235);
        g.lineWidth = 2.8;
        g.roundRect(-9, 12, 18, 10, 3);
        g.fill();
        g.stroke();

        g.fillColor = new cc.Color(194, 132, 78);
        g.strokeColor = new cc.Color(109, 72, 49);
        g.lineWidth = 2.4;
        g.roundRect(-11, 20, 22, 9, 3);
        g.fill();
        g.stroke();
    }

    private updateHappyBottleCount(): void {
        this.layoutHappyBottleCountBadge();
        if (this.happyBottleCountCard) this.pulseRewardTarget(this.happyBottleCountCard);
    }

    /** 首次进入时匿名建档，失败不影响离线玩法；下次进首页会自动重试。 */
    private async bootstrapCloudProfile(): Promise<void> {
        if (this.cloudProfileReady) return;
        try {
            const profile = await cloudService.bootstrap(
                this.profileNameLabel ? this.profileNameLabel.string : '解忧玩家',
                '',
                {
                    level: zyxGameModule.level,
                    experience: zyxGameModule.experience,
                    happyBottleBalance: zyxGameModule.happyBottleCount,
                    happyBottleProgress: zyxGameModule.happyBottleProgress,
                    totalHappyBottles: zyxGameModule.happyBottleCount,
                    highestSingleGameScore: zyxGameModule.bestScore,
                },
            );
            this.cloudProfileReady = true;
            this.applyCloudProfile(profile);
        } catch (error) {
            // 网络短暂不可用时继续使用本地缓存，不打断玩家进入游戏。
        }
    }

    private applyCloudProfile(profile: any): void {
        zyxGameModule.applyCloudProfile(profile);
        if (this.profileNameLabel) this.profileNameLabel.string = profile.nickname;
        this.updateHappyBottleCount();
        this.updateHomeExperienceDisplay(profile.level, profile.experience, zyxGameModule.getExperienceTargetForLevel(profile.level));
        if (this.homeMoodBottle) {
            setWishBottleProgressImmediately(this.homeMoodBottle, profile.happyBottleProgress, HAPPY_BOTTLE_TARGET);
        }
        if (this.homeMoodCountLabel) this.homeMoodCountLabel.string = `${profile.happyBottleProgress}/${HAPPY_BOTTLE_TARGET}`;
    }

    private async submitSettlementToCloud(settlement: SettlementExitRequest['settlement'], startedAt: number): Promise<void> {
        try {
            if (!this.cloudProfileReady) await this.bootstrapCloudProfile();
            if (!this.cloudProfileReady) return;
            const profile = await cloudService.submitSettlement(
                `round_${startedAt}_${settlement.roundScore}_${settlement.roundMoodCount}`,
                startedAt,
                Date.now(),
                settlement.roundScore,
                settlement.roundMoodCount,
            );
            this.applyCloudProfile(profile);
        } catch (error) {
            // 本局本地结算已完成；云端重试留待下次联网进入时处理。
        }
    }

    private async showLeaderboard(): Promise<void> {
        try {
            if (!this.cloudProfileReady) await this.bootstrapCloudProfile();
            const result = await cloudService.getLeaderboard('power');
            this.renderLeaderboard(result);
        } catch (error) {
            uimanager.showToast('排行榜连接中，请稍后重试');
        }
    }

    private renderLeaderboard(initial: LeaderboardResult, pageIndex: number = 0): void {
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
                        this.renderLeaderboard(result);
                    }).catch(() => uimanager.showToast('榜单刷新失败'));
                }, 18);
                tab.opacity = active ? 255 : 185;
            };
            paintTab('实力榜', -101, 'power');
            paintTab('开心榜', 101, 'happiness');
            const valueName = current.type === 'power' ? '单局最高分' : '本周开心瓶';
            current.entries.slice(safePageIndex * pageSize, (safePageIndex + 1) * pageSize)
                .forEach((entry, index) => this.createLeaderboardRow(panel, entry, valueName, centerY + 100 - index * 38));
            uimanager.createLabel(panel, `第 ${safePageIndex + 1}/${totalPages} 页 · 前 ${current.entries.length} 名`, 0, centerY - 142, 14, MOOD_COLORS.cocoaSoft, 260, 24);
            const selfText = current.self.isRanked
                ? `我的排名：第 ${current.self.rank} 名 · ${valueName} ${current.self.value}`
                : `暂未上榜 · ${valueName} ${current.self.value}${current.self.distanceToRank200 > 0 ? ` · 距前200还差 ${current.self.distanceToRank200}` : ''}`;
            uimanager.createLabel(panel, selfText, 0, centerY - 170, 16, MOOD_COLORS.cocoa, 430, 28);
        };
        const actions: any[] = [];
        if (safePageIndex > 0) actions.push({ text: '上一页', color: BUTTON_COLORS.yellow, onClick: () => this.renderLeaderboard(current, safePageIndex - 1) });
        if (safePageIndex < totalPages - 1) actions.push({ text: '下一页', color: BUTTON_COLORS.yellow, onClick: () => this.renderLeaderboard(current, safePageIndex + 1) });
        actions.push({ text: '关闭', color: BUTTON_COLORS.green, onClick: () => undefined });
        uimanager.showModal('本周排行榜', `${current.weekId} · 周一 00:00 结算`, actions, render, 350);
    }

    private createLeaderboardRow(parent: cc.Node, entry: LeaderboardEntry, valueName: string, y: number): void {
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

    /** 首页功能入口：右侧统一工具架，入口距屏幕边缘保留安全留白。 */
    private createHomeFeatureEntries(): void {
        const safeArea = uimanager.getSafeAreaMetrics();
        const cardWidth = 118;
        // 入口块高 126；上下各留 18，中间缝 12，避免顶边贴图标。
        const entryHeight = 126;
        const railPadY = 18;
        const entryGap = 12;
        const railHeight = railPadY * 2 + entryHeight * 2 + entryGap;
        const topEntryY = railHeight / 2 - railPadY - entryHeight / 2;
        const bottomEntryY = -railHeight / 2 + railPadY + entryHeight / 2;
        const edgeInset = 15 + safeArea.right;
        const entryX = this.screen.width / 2 - edgeInset - cardWidth / 2;
        const rail = uimanager.createRect(this.screen, 'homeFeatureRail', cardWidth, railHeight, new cc.Color(239, 220, 178), 230, 26, entryX, 72);
        rail.zIndex = 125;
        const railBorder = new cc.Node('homeFeatureRailBorder');
        railBorder.zIndex = 2;
        rail.addChild(railBorder);
        const railGraphics = railBorder.addComponent(cc.Graphics);
        railGraphics.strokeColor = new cc.Color(144, 108, 76, 142);
        railGraphics.lineWidth = 1.8;
        railGraphics.roundRect(-cardWidth / 2 + 2, -railHeight / 2 + 2, cardWidth - 4, railHeight - 4, 24);
        railGraphics.stroke();
        this.createHomeFeatureIcon(
            rail,
            'realmEntry',
            '解忧秘境',
            topEntryY,
            new cc.Color(229, 149, 108),
            'images/realm_entry_portal_v3',
            () => this.showWorryFreeRealm(),
        );
        this.createHomeFeatureIcon(
            rail,
            'rankEntry',
            '排行榜',
            bottomEntryY,
            new cc.Color(105, 164, 190),
            'images/rank_entry_trophy_v2',
            () => this.showLeaderboard(),
        );
    }

    /** 右下角独立设置入口：用高对比度的软糖按钮承接全局设置。 */
    private createHomeSettingsEntry(): void {
        const safeArea = uimanager.getSafeAreaMetrics();
        const buttonWidth = 104;
        const buttonHeight = 88;
        const x = this.screen.width / 2 - safeArea.right - 15 - buttonWidth / 2;
        const y = -this.screen.height / 2 + safeArea.bottom + 95;
        const entry = uimanager.createRect(this.screen, 'settingsEntry', buttonWidth, buttonHeight, MOOD_COLORS.mistBlue, 255, 24, x, y);
        entry.zIndex = 150;
        uimanager.drawButtonSurface(entry, buttonWidth, buttonHeight, MOOD_COLORS.mistBlue, 24);
        const gear = this.drawSettingsGear(entry);
        const title = uimanager.createLabel(entry, '设置', 0, -27, 18, new cc.Color(255, 250, 237), 76, 26);
        this.makeCartoonBold(title, new cc.Color(55, 91, 107), 1.1);
        entry.addComponent(cc.Button);
        entry.on(cc.Node.EventType.TOUCH_START, () => {
            cc.Tween.stopAllByTarget(entry);
            cc.Tween.stopAllByTarget(gear);
            cc.tween(entry).to(0.07, { scale: 0.93 }).start();
            cc.tween(gear).to(0.07, { angle: 12 }).start();
        }, this);
        entry.on(cc.Node.EventType.TOUCH_END, () => {
            cc.Tween.stopAllByTarget(entry);
            cc.Tween.stopAllByTarget(gear);
            cc.tween(entry).to(0.12, { scale: 1 }, { easing: 'backOut' }).start();
            cc.tween(gear).to(0.16, { angle: 0 }, { easing: 'backOut' }).start();
            this.showSettings();
        }, this);
        entry.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.Tween.stopAllByTarget(entry);
            cc.Tween.stopAllByTarget(gear);
            cc.tween(entry).to(0.1, { scale: 1 }).start();
            cc.tween(gear).to(0.1, { angle: 0 }).start();
        }, this);
    }

    private drawSettingsGear(parent: cc.Node): cc.Node {
        const gear = new cc.Node('settingsGearGlyph');
        gear.setPosition(0, 14);
        gear.zIndex = 4;
        parent.addChild(gear);
        const g = gear.addComponent(cc.Graphics);
        g.fillColor = MOOD_COLORS.cream;
        g.strokeColor = MOOD_COLORS.cocoa;
        g.lineWidth = 2.6;
        const points: cc.Vec2[] = [];
        for (let index = 0; index < 32; index++) {
            const phase = index % 4;
            const radius = phase === 1 || phase === 2 ? 21 : 16.5;
            const angle = Math.PI / 2 + index * Math.PI * 2 / 32;
            points.push(new cc.Vec2(Math.cos(angle) * radius, Math.sin(angle) * radius));
        }
        g.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach((point) => g.lineTo(point.x, point.y));
        g.close();
        g.fill();
        g.stroke();
        g.fillColor = MOOD_COLORS.honey;
        g.circle(0, 0, 10);
        g.fill();
        g.strokeColor = MOOD_COLORS.cocoa;
        g.lineWidth = 1.8;
        g.circle(0, 0, 10);
        g.stroke();
        g.fillColor = MOOD_COLORS.cocoa;
        g.circle(-3.8, 2.2, 1.35);
        g.circle(3.8, 2.2, 1.35);
        g.fill();
        g.strokeColor = MOOD_COLORS.cocoa;
        g.lineWidth = 1.6;
        g.moveTo(-4, -1.4);
        g.quadraticCurveTo(0, -5.2, 4, -1.4);
        g.stroke();
        return gear;
    }

    private showSettings(): void {
        settingsPanel.show();
    }

    /** 全流程都可访问的 GM 悬浮气泡；附着在场景根节点，不会随页面切换销毁。可拖动，轻点打开面板。 */
    private createGmBubble(): void {
        if (this.gmBubble && cc.isValid(this.gmBubble)) return;
        const safeArea = uimanager.getSafeAreaMetrics();
        const bubbleWidth = 88;
        const bubbleHeight = 48;
        const halfW = bubbleWidth / 2;
        const halfH = bubbleHeight / 2;
        const defaultX = -cc.winSize.width / 2 + safeArea.left + halfW + 16;
        const defaultY = cc.winSize.height / 2 - safeArea.top - 168;
        const saved = this.loadGmBubblePosition(defaultX, defaultY);
        const bubble = uimanager.createRect(this.node, 'gmFloatingBubble', bubbleWidth, bubbleHeight, new cc.Color(225, 127, 102), 255, 24, saved.x, saved.y);
        // 位于游戏 UI 之上，但让模态弹窗完整遮住它，避免打断暂停/设置上下文。
        bubble.zIndex = 1000;
        uimanager.drawButtonSurface(bubble, bubbleWidth, bubbleHeight, new cc.Color(225, 127, 102), 24);
        const tail = new cc.Node('gmBubbleTail');
        tail.setPosition(-25, -26);
        tail.zIndex = -1;
        bubble.addChild(tail);
        const tailGraphics = tail.addComponent(cc.Graphics);
        tailGraphics.fillColor = new cc.Color(180, 82, 69);
        tailGraphics.moveTo(-7, 8);
        tailGraphics.lineTo(12, 8);
        tailGraphics.lineTo(-2, -8);
        tailGraphics.close();
        tailGraphics.fill();
        const label = uimanager.createLabel(bubble, 'GM', -5, 1, 21, cc.Color.WHITE, 54, 30);
        const outline = label.node.addComponent(cc.LabelOutline);
        outline.color = new cc.Color(130, 64, 54);
        outline.width = 1.2;
        const dot = uimanager.createCircle(bubble, 'gmBubbleDot', 5, new cc.Color(255, 227, 115), 28, 13);
        dot.zIndex = 60;
        bubble.addComponent(cc.Button);

        const dragThreshold = 8;
        let dragging = false;
        let moved = false;
        let startLocal = cc.v2(0, 0);
        let origin = cc.v2(0, 0);

        const clampBubble = (x: number, y: number) => {
            const area = uimanager.getSafeAreaMetrics();
            const minX = -cc.winSize.width / 2 + area.left + halfW + 8;
            const maxX = cc.winSize.width / 2 - area.right - halfW - 8;
            const minY = -cc.winSize.height / 2 + area.bottom + halfH + 8;
            const maxY = cc.winSize.height / 2 - area.top - halfH - 8;
            return cc.v2(
                Math.max(minX, Math.min(maxX, x)),
                Math.max(minY, Math.min(maxY, y)),
            );
        };
        bubble.setPosition(clampBubble(bubble.x, bubble.y));

        bubble.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            dragging = true;
            moved = false;
            startLocal = event.getLocation();
            origin = bubble.getPosition();
            cc.tween(bubble).stop();
            cc.tween(bubble).to(0.07, { scale: 0.92 }).start();
            event.stopPropagation();
        }, this);
        bubble.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (!dragging) return;
            const loc = event.getLocation();
            const dx = loc.x - startLocal.x;
            const dy = loc.y - startLocal.y;
            if (!moved && (dx * dx + dy * dy) < dragThreshold * dragThreshold) return;
            moved = true;
            const next = clampBubble(origin.x + dx, origin.y + dy);
            bubble.setPosition(next);
            event.stopPropagation();
        }, this);
        bubble.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            dragging = false;
            cc.tween(bubble).stop();
            cc.tween(bubble).to(0.1, { scale: 1 }).start();
            if (moved) {
                this.saveGmBubblePosition(bubble.x, bubble.y);
            } else {
                settingsPanel.showGm(
                    (progressAdded) => this.refreshGmInventoryDisplays(progressAdded || 0),
                    () => this.pushGmProfileToCloud(),
                    () => this.resetAccountFromGm(),
                );
            }
            event.stopPropagation();
        }, this);
        bubble.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            dragging = false;
            cc.tween(bubble).stop();
            cc.tween(bubble).to(0.1, { scale: 1 }).start();
            if (moved) this.saveGmBubblePosition(bubble.x, bubble.y);
        }, this);
        this.gmBubble = bubble;
    }

    private loadGmBubblePosition(defaultX: number, defaultY: number): { x: number; y: number } {
        try {
            const raw = cc.sys.localStorage.getItem('zyx_gm_bubble_pos_v1');
            if (!raw) return { x: defaultX, y: defaultY };
            const parsed = JSON.parse(raw);
            const x = Number(parsed && parsed.x);
            const y = Number(parsed && parsed.y);
            if (!Number.isFinite(x) || !Number.isFinite(y)) return { x: defaultX, y: defaultY };
            return { x, y };
        } catch (e) {
            return { x: defaultX, y: defaultY };
        }
    }

    private saveGmBubblePosition(x: number, y: number): void {
        try {
            cc.sys.localStorage.setItem('zyx_gm_bubble_pos_v1', JSON.stringify({ x, y }));
        } catch (e) {
            // ignore quota / private mode
        }
    }

    private refreshGmInventoryDisplays(progressAdded: number = 0): void {
        this.updateHomeExperienceDisplay(
            zyxGameModule.level,
            zyxGameModule.experience,
            zyxGameModule.getExperienceTarget(),
        );
        if (this.homeMoodBottle && cc.isValid(this.homeMoodBottle)) {
            const slot = zyxGameModule.happyBottleProgress;
            if (progressAdded > 0) {
                const prevAbs = Number((this.homeMoodBottle as any).absoluteProgress);
                const fromAbs = Number.isFinite(prevAbs) ? prevAbs : Math.max(0, slot - progressAdded);
                const toAbs = fromAbs + progressAdded;
                const completedDelta = Math.floor(toAbs / HAPPY_BOTTLE_TARGET)
                    - Math.floor(fromAbs / HAPPY_BOTTLE_TARGET);
                const flyTarget = this.getHappyBottleFlyTargetLocal(this.homeMoodBottle);
                let visualBottleCount = Math.max(0, zyxGameModule.happyBottleCount - completedDelta);
                if (completedDelta > 0) {
                    this.layoutHappyBottleCountBadge(visualBottleCount);
                    this.setHomeDemoActive(false);
                } else {
                    this.updateHappyBottleCount();
                }
                presentWishBottleAbsoluteProgress(this.homeMoodBottle, toAbs, HAPPY_BOTTLE_TARGET, {
                    flyTargetLocal: flyTarget,
                    onCompletedBottle: () => {
                        visualBottleCount += 1;
                        this.layoutHappyBottleCountBadge(visualBottleCount);
                        if (this.happyBottleCountCard) this.pulseRewardTarget(this.happyBottleCountCard);
                    },
                    onSlotProgress: (shown) => {
                        if (this.homeMoodCountLabel) {
                            this.homeMoodCountLabel.string = `${Math.min(shown, HAPPY_BOTTLE_TARGET)}/${HAPPY_BOTTLE_TARGET}`;
                        }
                    },
                    onPresentationComplete: () => {
                        if (completedDelta <= 0) return;
                        this.updateHappyBottleCount();
                        this.setHomeDemoActive(true);
                    },
                });
            } else {
                this.updateHappyBottleCount();
                setWishBottleProgressImmediately(this.homeMoodBottle, slot, HAPPY_BOTTLE_TARGET);
                if (this.homeMoodCountLabel) {
                    this.homeMoodCountLabel.string = `${slot}/${HAPPY_BOTTLE_TARGET}`;
                }
            }
        } else {
            this.updateHappyBottleCount();
            if (this.homeMoodCountLabel) {
                this.homeMoodCountLabel.string = `${zyxGameModule.happyBottleProgress}/${HAPPY_BOTTLE_TARGET}`;
            }
        }
        const game = this.screen ? this.screen.getComponent(ZyxGame) : null;
        if (game) game.refreshInventoryHud(progressAdded);
    }

    /** GM 发放后把开心瓶/进度绝对值写回云端，避免下次进游戏被旧档案覆盖。 */
    private async pushGmProfileToCloud(): Promise<void> {
        try {
            if (!this.cloudProfileReady) {
                // 只拿 token；已有账号时 bootstrap 仍是旧服务端值，不 apply，下面用本地 GM 结果覆盖写回。
                await cloudService.bootstrap(
                    this.profileNameLabel ? this.profileNameLabel.string : '解忧玩家',
                    '',
                    {
                        level: zyxGameModule.level,
                        experience: zyxGameModule.experience,
                        happyBottleBalance: zyxGameModule.happyBottleCount,
                        happyBottleProgress: zyxGameModule.happyBottleProgress,
                        totalHappyBottles: zyxGameModule.happyBottleCount,
                        highestSingleGameScore: zyxGameModule.bestScore,
                    },
                );
                this.cloudProfileReady = true;
            }
            const synced = await cloudService.syncDebugProfile({
                happyBottleBalance: zyxGameModule.happyBottleCount,
                happyBottleProgress: zyxGameModule.happyBottleProgress,
                totalHappyBottles: zyxGameModule.happyBottleCount,
                level: zyxGameModule.level,
                experience: zyxGameModule.experience,
                highestSingleGameScore: zyxGameModule.bestScore,
            });
            this.applyCloudProfile(synced);
        } catch (error) {
            uimanager.showToast('本地已保存，云端同步失败');
        }
    }

    /** GM：清空本地与云端账号进度。 */
    private async resetAccountFromGm(): Promise<void> {
        zyxGameModule.resetLocalAccount();
        this.refreshGmInventoryDisplays(0);
        try {
            if (!this.cloudProfileReady) {
                await cloudService.bootstrap(
                    this.profileNameLabel ? this.profileNameLabel.string : '解忧玩家',
                    '',
                    {
                        level: 1,
                        experience: 0,
                        happyBottleBalance: 0,
                        happyBottleProgress: 0,
                        totalHappyBottles: 0,
                        highestSingleGameScore: 0,
                    },
                );
                this.cloudProfileReady = true;
            }
            const profile = await cloudService.resetAccount();
            this.applyCloudProfile(profile);
            uimanager.showToast('账号已重置');
        } catch (error) {
            uimanager.showToast('本地已重置，云端同步失败');
        }
    }

    private createHomeFeatureIcon(
        parent: cc.Node,
        name: string,
        title: string,
        y: number,
        color: cc.Color,
        resourcePath: string,
        onClick: () => void,
    ): void {
        const entry = new cc.Node(name);
        entry.width = 110;
        entry.height = 126;
        entry.setPosition(0, y);
        entry.zIndex = 10;
        parent.addChild(entry);

        const iconBase = uimanager.createRect(entry, 'featureIconBase', 86, 86, color, 255, 20, 0, 20);
        uimanager.drawButtonSurface(iconBase, 86, 86, color, 20);
        this.loadHomeFeatureIcon(iconBase, resourcePath, 70, 0, 2);
        const titleLabel = uimanager.createLabel(entry, title, 0, -44, 19, MOOD_COLORS.cocoa, 108, 29);
        this.makeCartoonBold(titleLabel, new cc.Color(255, 249, 231), 1.15);
        entry.addComponent(cc.Button);
        entry.on(cc.Node.EventType.TOUCH_START, () => {
            cc.tween(entry).stop();
            cc.tween(entry).to(0.07, { scale: 0.94 }).start();
        }, this);
        entry.on(cc.Node.EventType.TOUCH_END, () => {
            cc.tween(entry).stop();
            cc.tween(entry).to(0.12, { scale: 1 }).start();
            onClick();
        }, this);
        entry.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.tween(entry).stop();
            cc.tween(entry).to(0.12, { scale: 1 }).start();
        }, this);
    }

    private loadHomeFeatureIcon(parent: cc.Node, resourcePath: string, iconSize: number, x: number, y: number): void {
        const icon = new cc.Node('featureIconArt');
        icon.setPosition(x, y);
        icon.setContentSize(iconSize, iconSize);
        icon.zIndex = 8;
        parent.addChild(icon);
        const sprite = icon.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        loadSpriteFrame('home', resourcePath, (error, frame) => {
            if (error || !frame || !cc.isValid(icon)) return;
            sprite.spriteFrame = frame;
            icon.width = iconSize;
            icon.height = iconSize;
        });
    }

    private drawBookFeatureGlyph(parent: cc.Node, x: number, y: number): void {
        const glyph = new cc.Node('realmBookGlyph');
        glyph.setPosition(x, y);
        parent.addChild(glyph);
        const g = glyph.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(244, 185, 98);
        g.strokeColor = MOOD_COLORS.cocoaSoft;
        g.lineWidth = 2;
        g.roundRect(-28, -20, 25, 42, 5);
        g.fill();
        g.stroke();
        g.roundRect(3, -20, 25, 42, 5);
        g.fill();
        g.stroke();
        g.fillColor = new cc.Color(255, 242, 201, 150);
        g.roundRect(-20, 4, 12, 12, 3);
        g.fill();
        g.fillColor = new cc.Color(126, 179, 146);
        g.roundRect(10, -14, 11, 28, 3);
        g.fill();
    }

    private drawRankFeatureGlyph(parent: cc.Node, x: number, y: number): void {
        const glyph = new cc.Node('rankTrophyGlyph');
        glyph.setPosition(x, y);
        parent.addChild(glyph);
        const g = glyph.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(255, 230, 153);
        g.strokeColor = new cc.Color(150, 105, 56);
        g.lineWidth = 2.4;
        g.roundRect(-16, -12, 32, 27, 10);
        g.fill();
        g.stroke();
        g.strokeColor = new cc.Color(150, 105, 56);
        g.lineWidth = 3;
        g.arc(-17, 4, 11, Math.PI / 2, Math.PI * 1.5, true);
        g.stroke();
        g.arc(17, 4, 11, Math.PI * 1.5, Math.PI / 2, true);
        g.stroke();
        g.fillColor = new cc.Color(244, 181, 60);
        g.roundRect(-5, -25, 10, 14, 3);
        g.fill();
        g.roundRect(-17, -31, 34, 9, 4);
        g.fill();
    }

    private createHomeMoodScene(centerY: number): void {
        const stage = new cc.Node('homeMoodScene');
        // 演示棋盘与开心瓶构成同一条“整理后收入瓶中”的因果链。
        stage.width = 560;
        stage.height = 390;
        stage.setPosition(0, centerY);
        stage.zIndex = 30;
        this.screen.addChild(stage);

        const demoLayer = new cc.Node('homeDemoLayer');
        demoLayer.setAnchorPoint(0.5, 0.5);
        demoLayer.zIndex = 10;
        stage.addChild(demoLayer);
        this.homeDemoLayer = demoLayer;

        const cellSize = 46;
        const cellGap = 4;
        const boardLeft = -138;
        // 棋盘动画本体在已上移的演示区中再向上抬 10px；说明文字保持原局部坐标。
        const bottomY = 160;
        const upperY = bottomY + cellSize + cellGap;
        const boardCenterX = boardLeft + cellSize * 3;
        const boardCenterY = (bottomY + upperY) / 2;
        const boardWidth = cellSize * 6 + 20;
        const boardHeight = cellSize * 2 + cellGap + 20;
        // 底板与每个逻辑格子的留白完全一致，格子永远不会越过底板边缘。
        const shadow = uimanager.createRect(demoLayer, 'homeDemoBoardShadow', boardWidth + 8, boardHeight + 8, new cc.Color(78, 53, 46), 34, 18, boardCenterX, boardCenterY - 5);
        shadow.zIndex = -2;
        const board = uimanager.createRect(demoLayer, 'homeDemoBoard', boardWidth, boardHeight, new cc.Color(102, 75, 65), 226, 17, boardCenterX, boardCenterY);
        board.zIndex = -1;
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 6; col++) {
                uimanager.createRect(
                    demoLayer,
                    `homeDemoCell_${row}_${col}`,
                    cellSize - 4,
                    cellSize - 4,
                    new cc.Color(255, 247, 226),
                    238,
                    10,
                    boardLeft + (col + 0.5) * cellSize,
                    row === 0 ? bottomY : upperY,
                );
            }
        }

        const leftPiece = this.createHomeDemoPiece(demoLayer, 8, 2, cellSize, boardLeft, 0, bottomY, true);
        const rightPiece = this.createHomeDemoPiece(demoLayer, 6, 2, cellSize, boardLeft, 4, bottomY, false);
        const movingPiece = this.createHomeDemoPiece(demoLayer, 1, 2, cellSize, boardLeft, 3, upperY, true);
        const movingStartX = movingPiece.x;
        const movingTargetX = boardLeft + (2 + 1) * cellSize;
        const hand = this.createHomeDemoHand(demoLayer, movingStartX, upperY + 42);

        const softGlow = uimanager.createCircle(demoLayer, 'sceneGlow', 62, new cc.Color(255, 236, 170, 48), 210, 18);
        softGlow.zIndex = -1;
        cc.tween(softGlow)
            .repeatForever(cc.tween().to(1.8, { scale: 1.06 }).to(1.8, { scale: 0.94 }))
            .start();

        const bottle = createWishBottle(
            stage,
            0,
            -33,
            zyxGameModule.happyBottleProgress,
            HAPPY_BOTTLE_TARGET,
            0.88,
        );
        // 示意飞入层在瓶身之下，进度文案在瓶身之上；瓶内球堆只反映真实存档。
        bottle.zIndex = 60;
        bottle.opacity = 0;
        bottle.scale = 0.72;
        cc.tween(bottle).to(0.34, { scale: 0.88, opacity: 255 }, { easing: 'backOut' }).start();
        this.homeMoodBottle = bottle;

        const demoTip = uimanager.createLabel(demoLayer, '左右挪动 · 落进瓶里', boardCenterX, 105, 17, MOOD_COLORS.cocoaSoft, 280, 28);
        this.makeCartoonBold(demoTip, MOOD_COLORS.cocoaSoft, 0.55);
        const bottleTitle = uimanager.createLabel(stage, '正在收集开心瓶', 0, -160, 18, MOOD_COLORS.cocoaSoft, 180, 28);
        bottleTitle.node.zIndex = 220;
        this.makeCartoonBold(bottleTitle, MOOD_COLORS.cocoaSoft, 0.55);
        this.homeMoodCountLabel = uimanager.createLabel(
            stage,
            `${zyxGameModule.happyBottleProgress}/${HAPPY_BOTTLE_TARGET}`,
            0,
            -191,
            24,
            MOOD_COLORS.cocoa,
            160,
            32,
        );
        this.homeMoodCountLabel.node.zIndex = 220;
        this.makeCartoonBold(this.homeMoodCountLabel, MOOD_COLORS.cocoa, 0.8);

        const demoPieces = [leftPiece, rightPiece, movingPiece];
        const demoClock = new cc.Node('homeDemoClock');
        stage.addChild(demoClock);
        this.homeDemoClock = demoClock;
        const resetDemo = (): void => {
            if (!this.homeDemoPlaying) return;
            for (const child of demoLayer.children.slice()) {
                if (child.name.indexOf('homeDemoTransient') === 0) child.destroy();
            }
            // 不碰瓶身进度：示意只播手势，真实进度由结算/GM 驱动，避免打断满瓶上飞。
            for (const piece of demoPieces) {
                cc.Tween.stopAllByTarget(piece);
                piece.opacity = 255;
                piece.scale = 1;
                piece.scaleX = 1;
                piece.scaleY = 1;
            }
            movingPiece.setPosition(movingStartX, upperY);
            cc.Tween.stopAllByTarget(hand);
            hand.setPosition(movingStartX, upperY + 42);
            hand.opacity = 0;
            hand.scale = 1;
        };
        const playDrag = (): void => {
            if (!this.homeDemoPlaying) return;
            hand.opacity = 255;
            cc.tween(hand)
                .to(0.2, { y: upperY + 23, scale: 0.88 }, { easing: 'quadOut' })
                .to(0.88, { x: movingTargetX }, { easing: 'cubicInOut' })
                .to(0.16, { y: upperY + 39, scale: 1 }, { easing: 'backOut' })
                .start();
            cc.tween(movingPiece)
                .delay(0.2)
                .to(0.88, { x: movingTargetX }, { easing: 'cubicInOut' })
                .start();
        };
        const playDrop = (): void => {
            if (!this.homeDemoPlaying) return;
            cc.tween(movingPiece).to(0.44, { y: bottomY }, { easing: 'quadIn' }).start();
            cc.tween(hand).to(0.25, { opacity: 0, y: upperY + 56 }, { easing: 'quadOut' }).start();
        };
        const playClear = (): void => {
            if (!this.homeDemoPlaying) return;
            this.playHomeDemoClear(demoLayer, demoPieces, boardCenterX, bottomY, cellSize);
        };
        const playCollect = (): void => {
            if (!this.homeDemoPlaying) return;
            this.playHomeMoodFlight(demoLayer, bottle, leftPiece, 8, 0);
            this.playHomeMoodFlight(demoLayer, bottle, movingPiece, 1, 1);
        };
        const startDemoLoop = (): void => {
            if (!this.homeDemoClock || !cc.isValid(this.homeDemoClock)) return;
            cc.Tween.stopAllByTarget(this.homeDemoClock);
            this.homeDemoPlaying = true;
            resetDemo();
            cc.tween(this.homeDemoClock)
                .repeatForever(
                    cc.tween()
                        .call(resetDemo)
                        .delay(0.58)
                        .call(playDrag)
                        .delay(1.42)
                        .call(playDrop)
                        .delay(0.54)
                        .call(playClear)
                        .delay(0.22)
                        .call(playCollect)
                        .delay(2.45),
                )
                .start();
        };
        this.startHomeDemoLoop = startDemoLoop;
        startDemoLoop();
    }

    /** 结算/满瓶演出时隐藏示意层并停表；结束后淡入再恢复循环。 */
    private setHomeDemoActive(active: boolean): void {
        if (!this.homeDemoLayer || !cc.isValid(this.homeDemoLayer)) return;
        cc.Tween.stopAllByTarget(this.homeDemoLayer);
        if (!active) {
            this.homeDemoPlaying = false;
            if (this.homeDemoClock && cc.isValid(this.homeDemoClock)) {
                cc.Tween.stopAllByTarget(this.homeDemoClock);
            }
            for (const child of this.homeDemoLayer.children.slice()) {
                if (child.name.indexOf('homeDemoTransient') === 0) {
                    cc.Tween.stopAllByTarget(child);
                    child.destroy();
                }
            }
            cc.tween(this.homeDemoLayer)
                .to(0.18, { opacity: 0 }, { easing: 'sineOut' })
                .call(() => {
                    if (this.homeDemoLayer && cc.isValid(this.homeDemoLayer)) this.homeDemoLayer.active = false;
                })
                .start();
            return;
        }
        this.homeDemoLayer.active = true;
        this.homeDemoLayer.opacity = 0;
        cc.tween(this.homeDemoLayer)
            .to(0.4, { opacity: 255 }, { easing: 'sineOut' })
            .call(() => {
                if (this.startHomeDemoLoop) this.startHomeDemoLoop();
            })
            .start();
    }

    /** 满瓶飞向顶部资源图标：目标点必须在瓶子父节点坐标系内。 */
    private getHappyBottleFlyTargetLocal(bottle: cc.Node): cc.Vec2 {
        if (!bottle || !cc.isValid(bottle) || !bottle.parent) {
            return cc.v2(0, 420);
        }
        if (this.happyBottleCountCard && cc.isValid(this.happyBottleCountCard)) {
            return this.getNodePositionInParent(this.happyBottleCountCard, bottle.parent);
        }
        return cc.v2(bottle.x + 40, bottle.y + 420);
    }

    private getNodePositionInParent(node: cc.Node, parent: cc.Node): cc.Vec2 {
        if (!node || !parent || !cc.isValid(node) || !cc.isValid(parent)) return cc.v2(0, 0);
        return parent.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(0, 0)));
    }

    private createHomeDemoPiece(
        parent: cc.Node,
        mood: number,
        size: number,
        cellSize: number,
        boardLeft: number,
        col: number,
        y: number,
        hasStamp: boolean,
    ): cc.Node {
        const node = new cc.Node(`homeDemoPiece_${mood}`);
        // 色块与格子之间预留完整描边与投影安全区，材质高光不会压到相邻格子。
        node.width = size * cellSize - 10;
        node.height = cellSize - 10;
        node.setPosition(boardLeft + (col + size / 2) * cellSize, y);
        node.zIndex = 20;
        (node as any).demoMood = mood;
        parent.addChild(node);
        const color = getMoodColor(mood);
        drawMoodBlockMaterial(node, color);
        if (hasStamp) createMoodStamp(node, mood, cellSize, 0, 152);
        return node;
    }

    private createHomeDemoHand(parent: cc.Node, x: number, y: number): cc.Node {
        const node = new cc.Node('homeDemoHand');
        node.width = 46;
        node.height = 56;
        node.setPosition(x, y);
        node.zIndex = 80;
        parent.addChild(node);
        const halo = uimanager.createCircle(node, 'handHalo', 23, new cc.Color(239, 151, 105, 62));
        cc.tween(halo)
            .repeatForever(cc.tween().to(0.5, { scale: 1.14, opacity: 80 }).to(0.5, { scale: 0.9, opacity: 220 }))
            .start();
        const g = node.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(255, 249, 229);
        g.strokeColor = MOOD_COLORS.cocoaSoft;
        g.lineWidth = 2;
        g.circle(0, -4, 14);
        g.fill();
        g.stroke();
        g.roundRect(-5, -1, 10, 31, 5);
        g.fill();
        g.stroke();
        g.fillColor = new cc.Color(239, 151, 105);
        g.circle(0, 23, 3.8);
        g.fill();
        return node;
    }

    private playHomeDemoClear(
        stage: cc.Node,
        pieces: cc.Node[],
        boardCenterX: number,
        rowY: number,
        cellSize: number,
    ): void {
        const flash = uimanager.createRect(
            stage,
            'homeDemoTransientFlash',
            cellSize * 6 - 4,
            cellSize - 6,
            new cc.Color(255, 224, 134),
            0,
            12,
            boardCenterX,
            rowY,
        );
        flash.zIndex = 55;
        cc.tween(flash)
            .to(0.1, { opacity: 215, scaleX: 1.03 }, { easing: 'quadOut' })
            .to(0.28, { opacity: 0, scaleX: 1.08 }, { easing: 'quadIn' })
            .call(() => flash.destroy())
            .start();
        for (const piece of pieces) {
            cc.tween(piece)
                .to(0.1, { scaleX: 1.03, scaleY: 0.72 }, { easing: 'quadOut' })
                .to(0.3, { opacity: 0, scale: 0.78 }, { easing: 'quadIn' })
                .start();
            this.spawnHomeDemoShards(stage, piece);
        }
    }

    private spawnHomeDemoShards(stage: cc.Node, piece: cc.Node): void {
        const color = getMoodColor(Number((piece as any).demoMood) || 1);
        for (let index = 0; index < 5; index++) {
            const shard = uimanager.createRect(
                stage,
                `homeDemoTransientShard_${index}`,
                10 + (index % 2) * 4,
                8 + ((index + 1) % 3) * 3,
                color,
                220,
                3,
                piece.x + (index - 2) * (piece.width / 6),
                piece.y + (index % 2 === 0 ? 8 : -8),
            );
            shard.zIndex = 58;
            cc.tween(shard)
                .delay(0.08)
                .to(0.48, {
                    x: shard.x + (index - 2) * 22,
                    y: shard.y - 35 - index * 5,
                    angle: -(index - 2) * 48,
                    opacity: 0,
                    scale: 0.5,
                }, { easing: 'quadIn' })
                .call(() => shard.destroy())
                .start();
        }
    }

    /**
     * 首页示意：表情飞入瓶口并轻晃瓶盖。
     * 纯视觉，不调用进度写入，不改「X/666」；真实数据只在对局结算 / GM / 云端同步更新。
     */
    private playHomeMoodFlight(
        stage: cc.Node,
        bottle: cc.Node,
        piece: cc.Node,
        moodIndex: number,
        order: number,
    ): void {
        const start = new cc.Vec2(piece.x + piece.width / 2 - 22, piece.y);
        // 落点固定在瓶口，绝不飞向瓶底文案区。
        const target = new cc.Vec2(bottle.x + (order === 0 ? -10 : 10), bottle.y + 56);
        const control = new cc.Vec2((start.x + target.x) / 2, Math.max(start.y, target.y) + 88 + order * 10);
        const token = createMoodToken(stage, moodIndex, start.x, start.y, 30, 0);
        token.name = `homeDemoTransientMood_${order}`;
        token.zIndex = 45;
        const state = { t: 0 };
        const delay = order * 0.2;
        cc.tween(token).delay(delay).to(0.12, { opacity: 255, scale: 1.1 }, { easing: 'backOut' }).start();
        cc.tween(state)
            .delay(delay + 0.04)
            .to(0.9, { t: 1 }, {
                easing: 'quadIn',
                onUpdate: () => {
                    if (!cc.isValid(token)) return;
                    const inverse = 1 - state.t;
                    token.x = inverse * inverse * start.x + 2 * inverse * state.t * control.x + state.t * state.t * target.x;
                    token.y = inverse * inverse * start.y + 2 * inverse * state.t * control.y + state.t * state.t * target.y;
                    token.scale = 1.1 - state.t * 0.6;
                    token.angle = -state.t * 180;
                    if (state.t > 0.7) {
                        token.zIndex = 35;
                        token.opacity = Math.floor(255 * (1 - (state.t - 0.7) / 0.3));
                    }
                },
            })
            .call(() => {
                if (cc.isValid(token)) token.destroy();
                if (!cc.isValid(bottle)) return;
                playBottleBurp(bottle);
                this.spawnHomeDemoBottleSplash(stage, bottle, moodIndex, order);
            })
            .start();
    }

    /** 瓶口附近的示意彩点，停留在上半瓶，不改球堆进度、不挡底部文案。 */
    private spawnHomeDemoBottleSplash(
        stage: cc.Node,
        bottle: cc.Node,
        moodIndex: number,
        order: number,
    ): void {
        const color = getMoodColor(moodIndex);
        for (let index = 0; index < 3; index++) {
            const spark = uimanager.createCircle(
                stage,
                `homeDemoTransientSplash_${order}_${index}`,
                4 + index,
                new cc.Color(color.r, color.g, color.b, 210),
                bottle.x + (index - 1) * 8,
                bottle.y + 40,
            );
            spark.zIndex = 35;
            cc.tween(spark)
                .to(0.26, {
                    x: spark.x + (index - 1) * 10,
                    y: bottle.y + 22 - index * 3,
                    opacity: 0,
                    scale: 0.35,
                }, { easing: 'quadOut' })
                .call(() => {
                    if (cc.isValid(spark)) spark.destroy();
                })
                .start();
        }
    }

    private createHomeProfile(panelY: number): cc.Node {
        const panelX = -102;
        uimanager.createRect(this.screen, 'profileShadow', 506, 114, new cc.Color(78, 53, 46), 32, 28, panelX, panelY - 5);
        const panel = uimanager.createRect(this.screen, 'profileCard', 500, 108, new cc.Color(255, 249, 232), 244, 26, panelX, panelY);

        const avatarX = -202;
        const avatarFrame = new cc.Node('avatarRoundedFrame');
        avatarFrame.width = 86;
        avatarFrame.height = 82;
        avatarFrame.setPosition(avatarX, 0);
        avatarFrame.zIndex = 10;
        panel.addChild(avatarFrame);
        const avatarFrameGraphics = avatarFrame.addComponent(cc.Graphics);
        avatarFrameGraphics.fillColor = new cc.Color(255, 239, 190);
        avatarFrameGraphics.strokeColor = MOOD_COLORS.cocoaSoft;
        avatarFrameGraphics.lineWidth = 4;
        avatarFrameGraphics.roundRect(-41, -39, 82, 78, 20);
        avatarFrameGraphics.fill();
        avatarFrameGraphics.stroke();

        const avatarMask = new cc.Node('avatarMask');
        avatarMask.width = 68;
        avatarMask.height = 64;
        avatarMask.setPosition(avatarX, 0);
        avatarMask.zIndex = 20;
        panel.addChild(avatarMask);
        const mask = avatarMask.addComponent(cc.Mask);
        mask.type = cc.Mask.Type.RECT;

        this.profileAvatarContent = new cc.Node('avatarContent');
        this.profileAvatarContent.width = 68;
        this.profileAvatarContent.height = 64;
        avatarMask.addChild(this.profileAvatarContent);
        this.drawDefaultAvatar();

        const avatarHit = new cc.Node('avatarAuthorizationButton');
        avatarHit.width = 86;
        avatarHit.height = 82;
        avatarHit.setPosition(avatarX, 0);
        avatarHit.zIndex = 60;
        avatarHit.addComponent(cc.Button);
        panel.addChild(avatarHit);
        avatarHit.on(cc.Node.EventType.TOUCH_END, () => this.requestWeChatProfile(), this);

        this.profileNameLabel = uimanager.createLabel(panel, '顺心朋友', -151, 20, 22, MOOD_COLORS.cocoa, 150, 30);
        this.profileNameLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        this.profileNameLabel.node.setAnchorPoint(0, 0.5);
        this.profileNameLabel.node.setPosition(-151, 20);

        this.profileAuthorizationButton = uimanager.createButton(
            panel,
            '授权',
            70,
            20,
            64,
            32,
            BUTTON_COLORS.green,
            () => this.requestWeChatProfile(),
            14,
        );
        this.profileAuthorizationButton.name = 'profileAuthorizationButton';

        const target = zyxGameModule.getExperienceTarget();
        const ratio = Math.max(0, Math.min(1, zyxGameModule.experience / target));
        const trackWidth = this.profileExperienceTrackWidth;
        const trackX = -11;
        const trackY = -20;
        uimanager.createRect(panel, 'experienceTrack', trackWidth, 30, new cc.Color(87, 79, 72), 220, 10, trackX, trackY);
        const fillWidth = Math.max(8, this.profileExperienceFillWidth * ratio);
        this.profileExperienceFill = uimanager.createRect(
            panel,
            'experienceFill',
            fillWidth,
            20,
            MOOD_COLORS.sage,
            255,
            7,
            this.profileExperienceFillLeft + fillWidth / 2,
            trackY,
        );
        this.profileExperienceLabel = uimanager.createLabel(
            panel,
            `经验 ${zyxGameModule.experience}/${target}`,
            8,
            trackY,
            16,
            cc.Color.WHITE,
            190,
            25,
        );
        this.makeCartoonBold(this.profileExperienceLabel, new cc.Color(65, 58, 53), 0.85);
        const levelBadge = uimanager.createRect(panel, 'levelBadge', 72, 34, MOOD_COLORS.cocoa, 255, 11, -126, trackY);
        levelBadge.zIndex = 12;
        this.profileLevelLabel = uimanager.createLabel(levelBadge, `Lv.${zyxGameModule.level}`, 0, 0, 17, cc.Color.WHITE, 66, 28);

        const stored = cc.sys.localStorage.getItem('zyx_wechat_profile');
        let hasCachedProfile = false;
        if (stored) {
            try {
                const profile = JSON.parse(stored);
                this.applyWeChatProfile(profile.nickName || '顺心朋友', profile.avatarUrl || '');
                hasCachedProfile = true;
            } catch (error) {
                cc.warn('Invalid cached WeChat profile', error);
            }
        }
        this.profileAuthorizationButton.active = !hasCachedProfile;
        this.configureWeChatProfileAccess(panelX + 70, panelY + 20, 64, 32, hasCachedProfile);
        return panel;
    }

    private drawDefaultAvatar(): void {
        if (!this.profileAvatarContent || !cc.isValid(this.profileAvatarContent)) return;
        this.profileAvatarContent.removeAllChildren();
        const avatar = new cc.Node('defaultAvatar');
        avatar.width = 68;
        avatar.height = 64;
        this.profileAvatarContent.addChild(avatar);
        const g = avatar.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(246, 210, 126);
        g.roundRect(-34, -32, 68, 64, 14);
        g.fill();

        // 默认头像是一张完整的圆角方形插画，而不是再塞进圆形头像套娃。
        g.fillColor = new cc.Color(126, 190, 157);
        g.roundRect(-22, -34, 44, 21, 10);
        g.fill();
        g.fillColor = new cc.Color(255, 239, 190);
        g.roundRect(-22, -19, 44, 42, 17);
        g.fill();
        g.fillColor = MOOD_COLORS.cocoa;
        g.circle(-8, 1, 2.2);
        g.circle(8, 1, 2.2);
        g.fill();
        g.strokeColor = MOOD_COLORS.cocoa;
        g.lineWidth = 2;
        g.arc(0, -4, 8, 0.15 * Math.PI, 0.85 * Math.PI, false);
        g.stroke();
        g.fillColor = new cc.Color(239, 151, 105);
        g.ellipse(-14, -5, 5, 2.5);
        g.ellipse(14, -5, 5, 2.5);
        g.fill();
        g.fillColor = new cc.Color(255, 226, 125);
        g.moveTo(-17, 20);
        g.lineTo(-7, 14);
        g.lineTo(0, 24);
        g.lineTo(7, 14);
        g.lineTo(17, 20);
        g.lineTo(14, 27);
        g.lineTo(-14, 27);
        g.close();
        g.fill();
    }

    private requestWeChatProfile(): void {
        const wxApi = this.getWeChatApi();
        if (!wxApi) {
            uimanager.showToast('微信小游戏中点击「授权」即可同步头像昵称');
            return;
        }
        if (this.nativeWeChatProfileButton) {
            uimanager.showToast('请点击右侧「授权」同步微信资料');
            return;
        }
        this.configureWeChatProfileAccess(-2, 613, 72, 34, false);
    }

    /**
     * 官方推荐流程：先检查 scope.userInfo；已授权直接读取，未授权再创建原生按钮。
     * 原生按钮必须承接真实用户点击，所以不能只用 Cocos 的触摸回调替代。
     */
    private configureWeChatProfileAccess(
        centerX: number,
        centerY: number,
        width: number,
        height: number,
        hasCachedProfile: boolean,
    ): void {
        const wxApi = this.getWeChatApi();
        if (!wxApi) return;
        if (this.profileAuthorizationButton) this.profileAuthorizationButton.active = !hasCachedProfile;

        const createAuthorizationButton = (): void => {
            if (!this.profileAuthorizationButton || !cc.isValid(this.profileAuthorizationButton)) return;
            this.profileAuthorizationButton.active = true;
            this.createNativeWeChatProfileButton(centerX, centerY, width, height);
        };
        if (typeof wxApi.getSetting !== 'function') {
            createAuthorizationButton();
            return;
        }
        wxApi.getSetting({
            success: (result: any) => {
                const authorized = !!(result && result.authSetting && result.authSetting['scope.userInfo']);
                if (!authorized || typeof wxApi.getUserInfo !== 'function') {
                    createAuthorizationButton();
                    return;
                }
                wxApi.getUserInfo({
                    success: (response: any) => this.handleWeChatProfileResponse(response),
                    fail: createAuthorizationButton,
                });
            },
            fail: createAuthorizationButton,
        });
    }

    private createNativeWeChatProfileButton(
        centerX: number,
        centerY: number,
        width: number,
        height: number,
    ): void {
        const wxApi = this.getWeChatApi();
        if (!wxApi || typeof wxApi.createUserInfoButton !== 'function' || this.nativeWeChatProfileButton) return;
        const system = typeof wxApi.getSystemInfoSync === 'function'
            ? wxApi.getSystemInfoSync()
            : { windowWidth: cc.winSize.width, windowHeight: cc.winSize.height };
        const scaleX = system.windowWidth / cc.winSize.width;
        const scaleY = system.windowHeight / cc.winSize.height;
        const nativeButton = wxApi.createUserInfoButton({
            type: 'text',
            text: '授权',
            lang: 'zh_CN',
            withCredentials: false,
            style: {
                left: (centerX - width / 2 + cc.winSize.width / 2) * scaleX,
                top: (cc.winSize.height / 2 - centerY - height / 2) * scaleY,
                width: width * scaleX,
                height: height * scaleY,
                lineHeight: height * scaleY,
                backgroundColor: '#69B581',
                color: '#FFFFFF',
                textAlign: 'center',
                fontSize: Math.max(12, 15 * scaleY),
                borderRadius: 10 * Math.min(scaleX, scaleY),
                borderWidth: 1,
                borderColor: '#477E5A',
            },
        });
        this.nativeWeChatProfileButton = nativeButton;
        nativeButton.onTap((response: any) => {
            uimanager.tapFeedback();
            if (response && response.userInfo) {
                this.handleWeChatProfileResponse(response);
                return;
            }
            uimanager.showToast('未授权微信资料，继续使用默认头像');
        });
    }

    private handleWeChatProfileResponse(response: any): void {
        const info = response && response.userInfo ? response.userInfo : response;
        if (!info || (!info.nickName && !info.avatarUrl)) {
            uimanager.showToast('没有获取到微信资料，请稍后再试');
            return;
        }
        this.applyWeChatProfile(info.nickName || '顺心朋友', info.avatarUrl || '');
        cc.sys.localStorage.setItem('zyx_wechat_profile', JSON.stringify({
            nickName: info.nickName || '顺心朋友',
            avatarUrl: info.avatarUrl || '',
        }));
        if (this.profileAuthorizationButton && cc.isValid(this.profileAuthorizationButton)) {
            this.profileAuthorizationButton.active = false;
        }
        this.destroyNativeWeChatProfileButton();
        uimanager.showToast('微信资料已同步');
    }

    private destroyNativeWeChatProfileButton(): void {
        if (!this.nativeWeChatProfileButton) return;
        if (typeof this.nativeWeChatProfileButton.destroy === 'function') {
            this.nativeWeChatProfileButton.destroy();
        }
        this.nativeWeChatProfileButton = null;
    }

    private getWeChatApi(): any {
        if (typeof wx !== 'undefined') return wx;
        if (typeof window !== 'undefined' && (window as any).wx) return (window as any).wx;
        return null;
    }

    private applyWeChatProfile(nickName: string, avatarUrl: string): void {
        if (this.profileNameLabel) this.profileNameLabel.string = nickName;
        cloudService.bootstrap(nickName, avatarUrl).then((profile) => this.applyCloudProfile(profile)).catch(() => undefined);
        if (!avatarUrl || !this.profileAvatarContent || !cc.isValid(this.profileAvatarContent)) return;
        const content = this.profileAvatarContent;
        cc.assetManager.loadRemote(avatarUrl, { ext: '.png' }, (error: Error, texture: cc.Texture2D) => {
            if (error || !texture || !cc.isValid(content)) return;
            content.removeAllChildren();
            const spriteNode = new cc.Node('wechatAvatar');
            spriteNode.width = 68;
            spriteNode.height = 64;
            content.addChild(spriteNode);
            const sprite = spriteNode.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = new cc.SpriteFrame(texture);
            spriteNode.width = 68;
            spriteNode.height = 64;
        });
    }

    private createHomeRotatingTip(centerY: number): void {
        const pill = uimanager.createRect(this.screen, 'homeTipPill', 600, 56, new cc.Color(255, 249, 232), 230, 28, 0, centerY);
        const tips = [
            '左右拖动心情块，让它落进合适的位置',
            '填满一整行，就能把烦恼轻轻消掉',
            '带表情的心情块消除后，会飞进开心瓶',
            '装满 666 个表情，就能得到一枚开心瓶',
        ];
        let index = 0;
        const label = uimanager.createLabel(pill, tips[index], 0, 0, 23, new cc.Color(45, 42, 39), 568, 40);
        this.makeCartoonBold(label, new cc.Color(45, 42, 39), 0.7);
        cc.tween(label.node)
            .repeatForever(
                cc.tween()
                    .delay(4.2)
                    .to(0.38, { opacity: 0 }, { easing: 'sineIn' })
                    .call(() => {
                        index = (index + 1) % tips.length;
                        label.string = tips[index];
                    })
                    .to(0.42, { opacity: 255 }, { easing: 'sineOut' }),
            )
            .start();
    }

    /** 主操作按钮：用游戏里的笑脸方块作低对比水印，文字保持最高阅读层级。 */
    private decorateStartButton(): void {
        if (!this.startButton || !cc.isValid(this.startButton)) return;
        const watermark = new cc.Node('startButtonMoodWatermark');
        watermark.setPosition(-155, 4);
        watermark.angle = -8;
        watermark.zIndex = 18;
        this.startButton.addChild(watermark);
        const g = watermark.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(255, 255, 255, 20);
        g.strokeColor = new cc.Color(255, 255, 255, 42);
        g.lineWidth = 4;
        g.roundRect(-46, -43, 92, 86, 22);
        g.fill();
        g.stroke();
        g.fillColor = new cc.Color(255, 255, 255, 72);
        g.circle(-14, 8, 4);
        g.circle(14, 8, 4);
        g.fill();
        g.strokeColor = new cc.Color(255, 255, 255, 74);
        g.lineWidth = 4;
        g.moveTo(-18, -7);
        g.quadraticCurveTo(0, -24, 18, -7);
        g.stroke();
        g.fillColor = new cc.Color(255, 255, 255, 36);
        g.ellipse(-27, -4, 7, 3.5);
        g.ellipse(27, -4, 7, 3.5);
        g.fill();

        const labelNode = this.startButton.getChildByName('label');
        const label = labelNode ? labelNode.getComponent(cc.Label) : null;
        if (!label || !labelNode) return;
        labelNode.x = 34;
        labelNode.width = 330;
        labelNode.height = 92;
        label.fontSize = 48;
        label.lineHeight = 60;
        this.makeCartoonBold(label, new cc.Color(46, 99, 68), 1.8);
    }

    private createStartButtonGuide(): void {
        if (!this.startButton || !cc.isValid(this.startButton)) return;
        const button = this.startButton;
        const restX = button.x + 244;
        const restY = button.y - 142;
        const hoverX = button.x + 188;
        const hoverY = button.y - 57;
        const pressX = button.x + 181;
        const pressY = button.y - 48;
        const hand = this.createStartGuideHand(this.screen, restX, restY);
        hand.name = 'startButtonGuideHand';
        hand.opacity = 0;
        hand.scale = 0.76;

        cc.tween(hand)
            .repeatForever(
                cc.tween()
                    .delay(2.4)
                    .call(() => {
                        if (!cc.isValid(hand)) return;
                        hand.setPosition(restX, restY);
                        hand.opacity = 0;
                        hand.scale = 0.76;
                    })
                    .to(1.05, { x: hoverX, y: hoverY, opacity: 248, scale: 0.86 }, { easing: 'sineOut' })
                    .delay(0.35)
                    .to(0.16, { x: pressX, y: pressY, scale: 0.8 }, { easing: 'sineInOut' })
                    .call(() => {
                        if (!cc.isValid(button)) return;
                        cc.tween(button)
                            .to(0.1, { scale: 0.965 }, { easing: 'sineOut' })
                            .to(0.22, { scale: 1 }, { easing: 'backOut' })
                            .start();
                        this.playStartGuideTapRipple(button.x + 143, button.y + 2);
                    })
                    .delay(0.38)
                    .to(0.26, { x: hoverX, y: hoverY, scale: 0.86 }, { easing: 'sineOut' })
                    .to(0.72, { x: restX, y: restY + 14, opacity: 0, scale: 0.76 }, { easing: 'sineIn' })
                    .delay(1.8),
            )
            .start();
    }

    /** 首页开始按钮专用指引手：可爱扁平版，贴合暖色消除风。 */
    private createStartGuideHand(parent: cc.Node, x: number, y: number): cc.Node {
        const node = new cc.Node('startGuideHand');
        node.width = 128;
        node.height = 128;
        node.setAnchorPoint(0.5, 0.5);
        node.setPosition(x, y);
        node.zIndex = 180;
        parent.addChild(node);

        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        loadSpriteFrame('home', 'images/start_guide_hand_v3', (error, frame) => {
            if (error || !frame || !cc.isValid(node)) {
                cc.warn('Start guide hand failed to load', error);
                this.drawCuteGuideHandFallback(node);
                return;
            }
            sprite.spriteFrame = frame;
            uimanager.fitSpriteFrameInside(node, frame, 128, 128);
        });
        return node;
    }

    /** 素材未就绪时的程序化可爱小手，避免指引空白。 */
    private drawCuteGuideHandFallback(node: cc.Node): void {
        const g = node.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(90, 64, 52, 40);
        g.ellipse(6, -34, 28, 10);
        g.fill();
        g.fillColor = new cc.Color(246, 215, 184);
        g.strokeColor = new cc.Color(120, 82, 58);
        g.lineWidth = 4;
        g.roundRect(-18, -28, 44, 36, 16);
        g.fill();
        g.stroke();
        g.roundRect(-6, 4, 16, 42, 8);
        g.fill();
        g.stroke();
        g.fillColor = new cc.Color(255, 248, 230);
        g.strokeColor = new cc.Color(120, 82, 58);
        g.roundRect(-22, -40, 52, 18, 9);
        g.fill();
        g.stroke();
        g.fillColor = new cc.Color(126, 190, 157);
        g.roundRect(-18, -36, 44, 6, 3);
        g.fill();
    }

    private playStartGuideTapRipple(x: number, y: number): void {
        if (!this.screen || !cc.isValid(this.screen)) return;
        [0, 0.1, 0.2].forEach((delay, index) => {
            const ripple = new cc.Node('startGuideTapRipple');
            ripple.width = 72;
            ripple.height = 72;
            ripple.setPosition(x, y);
            ripple.scale = 0.28;
            ripple.opacity = 0;
            ripple.zIndex = 170;
            this.screen.addChild(ripple);
            const graphics = ripple.addComponent(cc.Graphics);
            graphics.strokeColor = index === 0
                ? new cc.Color(255, 255, 245, 235)
                : new cc.Color(116, 190, 171, 205);
            graphics.lineWidth = index === 0 ? 4 : 2.5;
            graphics.circle(0, 0, 30);
            graphics.stroke();
            cc.tween(ripple)
                .delay(delay)
                .to(0.06, { opacity: 220 })
                .to(0.62, { scale: 1.2 + index * 0.12, opacity: 0 }, { easing: 'sineOut' })
                .call(() => ripple.destroy())
                .start();
        });
    }

    private handleSettlementExit(request: SettlementExitRequest): void {
        const submittedRoundStartedAt = this.roundStartedAt;
        if (request.restart) {
            this.submitSettlementToCloud(request.settlement, submittedRoundStartedAt);
            this.startGame();
            return;
        }
        this.showHome();
        this.playSettlementRewardReturn(request, () => {
            this.submitSettlementToCloud(request.settlement, submittedRoundStartedAt);
        });
    }

    /** 结算关闭后先回主页：表情飞中央开心瓶，经验飞顶部经验条。 */
    private playSettlementRewardReturn(request: SettlementExitRequest, onComplete: () => void): void {
        const settlement = request.settlement;
        if (!this.screen || !cc.isValid(this.screen)) {
            onComplete();
            return;
        }

        // 满瓶上飞期间先藏起示意消除，避免 reset/飞入抢戏。
        this.setHomeDemoActive(false);

        this.updateHomeExperienceDisplay(
            settlement.levelBefore,
            settlement.experienceBefore,
            settlement.experienceTargetBefore,
        );
        const absoluteStart = settlement.wishProgressBefore;
        const absoluteEnd = settlement.wishProgressBefore + settlement.roundMoodCount;
        if (this.homeMoodBottle) {
            setWishBottleProgressImmediately(
                this.homeMoodBottle,
                absoluteStart,
                HAPPY_BOTTLE_TARGET,
            );
        }
        if (this.homeMoodCountLabel) {
            this.homeMoodCountLabel.string = `${absoluteStart % HAPPY_BOTTLE_TARGET}/${HAPPY_BOTTLE_TARGET}`;
        }
        // 结算时模块已写入终值；动画期间从「完成前数量」逐瓶加回，配合上飞反馈。
        let visualBottleCount = Math.max(0, zyxGameModule.happyBottleCount - settlement.completedHappyBottles);
        this.layoutHappyBottleCountBadge(visualBottleCount);

        const finishSettlementPresentation = (): void => {
            this.updateHomeExperienceDisplay(
                settlement.levelAfter,
                settlement.experienceAfter,
                settlement.experienceTargetAfter,
            );
            if (this.homeMoodCountLabel) {
                this.homeMoodCountLabel.string = `${settlement.wishProgressAfter}/${HAPPY_BOTTLE_TARGET}`;
            }
            this.updateHappyBottleCount();
            this.setHomeDemoActive(true);
            onComplete();
        };

        const hasMood = settlement.roundMoodCount > 0;
        const hasExperience = settlement.gainedExperience > 0;
        if (!hasMood && !hasExperience) {
            this.scheduleOnce(finishSettlementPresentation, request.restart ? 0.45 : 0.2);
            return;
        }

        const rewardLayer = new cc.Node('settlementRewardReturn');
        rewardLayer.width = this.screen.width;
        rewardLayer.height = this.screen.height;
        rewardLayer.setAnchorPoint(0.5, 0.5);
        rewardLayer.zIndex = 2600;
        this.screen.addChild(rewardLayer);

        const softVeil = uimanager.createRect(
            rewardLayer,
            'rewardSoftVeil',
            rewardLayer.width,
            rewardLayer.height,
            new cc.Color(72, 53, 47),
            0,
        );
        softVeil.zIndex = -2;
        cc.tween(softVeil).to(0.16, { opacity: 58 }).delay(0.78).to(0.38, { opacity: 0 }).start();

        // 经验条在档案卡顶部；表情飞主页中央瓶，满瓶再飞向右上角数量入口（瓶子父节点坐标）。
        const experienceTarget = this.getNodePositionInScreen(this.profileExperienceFill);
        const moodTarget = this.getNodePositionInScreen(this.homeMoodBottle);
        const flyTarget = this.getHappyBottleFlyTargetLocal(this.homeMoodBottle);
        const moodVisualCount = hasMood
            ? Math.min(16, Math.max(4, 3 + Math.ceil(Math.sqrt(settlement.roundMoodCount) * 1.6)))
            : 0;
        const experienceVisualCount = hasExperience
            ? Math.min(16, Math.max(4, 3 + Math.ceil(Math.sqrt(settlement.gainedExperience) * 1.6)))
            : 0;
        let experienceArrivals = 0;
        let moodArrivals = 0;
        let seed = Math.max(1, settlement.roundScore * 31 + settlement.roundMoodCount * 17);
        const random = (): number => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        let moodPresentationDone = !hasMood;
        let experiencePresentationDone = !hasExperience;
        let presentationFinished = false;
        const tryFinishPresentation = (): void => {
            if (presentationFinished || !moodPresentationDone || !experiencePresentationDone) return;
            presentationFinished = true;
            if (cc.isValid(rewardLayer)) rewardLayer.destroy();
            this.scheduleOnce(finishSettlementPresentation, 0.18);
        };

        const presentHomeBottle = (absolute: number, onComplete?: () => void): void => {
            if (!this.homeMoodBottle || !cc.isValid(this.homeMoodBottle)) {
                if (onComplete) onComplete();
                return;
            }
            presentWishBottleAbsoluteProgress(this.homeMoodBottle, absolute, HAPPY_BOTTLE_TARGET, {
                flyTargetLocal: flyTarget,
                onCompletedBottle: () => {
                    visualBottleCount += 1;
                    this.layoutHappyBottleCountBadge(visualBottleCount);
                    if (this.happyBottleCountCard) this.pulseRewardTarget(this.happyBottleCountCard);
                },
                onSlotProgress: (slot) => {
                    if (this.homeMoodCountLabel) {
                        this.homeMoodCountLabel.string = `${Math.min(slot, HAPPY_BOTTLE_TARGET)}/${HAPPY_BOTTLE_TARGET}`;
                    }
                    if (slot > 0 && slot < HAPPY_BOTTLE_TARGET) playBottleBurp(this.homeMoodBottle);
                },
                onPresentationComplete: onComplete,
            });
        };

        const spawnToken = (
            isExperience: boolean,
            resourceIndex: number,
            delayBase: number,
        ): void => {
            const scatterX = -235 + random() * 470;
            const scatterY = -70 + random() * 330;
            const size = 38 + random() * 11;
            const token = isExperience
                ? createExperienceToken(rewardLayer, scatterX, scatterY, size, 0)
                : createMoodToken(rewardLayer, 1 + (resourceIndex % 6), scatterX, scatterY, size, 0);
            token.scale = 0.35;
            token.angle = 18 - random() * 36;
            const target = isExperience ? experienceTarget : moodTarget;
            const delay = delayBase + random() * 0.08;
            this.animateRewardToken(token, target, delay, random, () => {
                if (isExperience) {
                    experienceArrivals++;
                    this.updateExperienceRewardProgress(settlement, experienceArrivals / experienceVisualCount);
                    this.pulseRewardTarget(this.profileExperienceFill);
                    if (experienceArrivals >= experienceVisualCount) {
                        experiencePresentationDone = true;
                        tryFinishPresentation();
                    }
                    return;
                }
                moodArrivals++;
                const ratio = moodArrivals / moodVisualCount;
                const absolute = absoluteStart + Math.round((absoluteEnd - absoluteStart) * ratio);
                presentHomeBottle(absolute, moodArrivals >= moodVisualCount ? () => {
                    moodPresentationDone = true;
                    tryFinishPresentation();
                } : undefined);
            });
        };

        for (let index = 0; index < moodVisualCount; index++) {
            spawnToken(false, index, 0.04 + index * 0.03);
        }
        for (let index = 0; index < experienceVisualCount; index++) {
            spawnToken(true, index, 0.1 + index * 0.03);
        }

        tryFinishPresentation();
    }

    private animateRewardToken(
        token: cc.Node,
        target: cc.Vec2,
        delay: number,
        random: () => number,
        onArrive: () => void,
    ): void {
        const start = new cc.Vec2(token.x, token.y);
        const control = new cc.Vec2(
            (start.x + target.x) / 2 + (random() - 0.5) * 160,
            Math.max(start.y, target.y) + 105 + random() * 90,
        );
        const state = { t: 0 };
        cc.tween(token)
            .delay(delay)
            .to(0.2, { opacity: 255, scale: 1.08 }, { easing: 'backOut' })
            .delay(0.2)
            .start();
        cc.tween(state)
            .delay(delay + 0.4)
            .to(0.58, { t: 1 }, {
                easing: 'quadIn',
                onUpdate: () => {
                    if (!cc.isValid(token)) return;
                    const inverse = 1 - state.t;
                    token.x = inverse * inverse * start.x
                        + 2 * inverse * state.t * control.x
                        + state.t * state.t * target.x;
                    token.y = inverse * inverse * start.y
                        + 2 * inverse * state.t * control.y
                        + state.t * state.t * target.y;
                    token.scale = 1.08 - state.t * 0.58;
                    token.angle -= 5.5;
                },
            })
            .call(() => {
                onArrive();
                if (cc.isValid(token)) token.destroy();
            })
            .start();
    }

    private updateExperienceRewardProgress(settlement: SettlementExitRequest['settlement'], ratio: number): void {
        if (ratio >= 0.999) {
            this.updateHomeExperienceDisplay(
                settlement.levelAfter,
                settlement.experienceAfter,
                settlement.experienceTargetAfter,
            );
            return;
        }
        let level = settlement.levelBefore;
        let experience = settlement.experienceBefore + Math.round(settlement.gainedExperience * ratio);
        let target = zyxGameModule.getExperienceTargetForLevel(level);
        while (experience >= target) {
            experience -= target;
            level++;
            target = zyxGameModule.getExperienceTargetForLevel(level);
        }
        this.updateHomeExperienceDisplay(level, experience, target);
    }

    private updateHomeExperienceDisplay(level: number, experience: number, target: number): void {
        if (this.profileLevelLabel) this.profileLevelLabel.string = `Lv.${level}`;
        if (this.profileExperienceLabel) this.profileExperienceLabel.string = `经验 ${experience}/${target}`;
        if (!this.profileExperienceFill || !cc.isValid(this.profileExperienceFill)) return;
        const ratio = Math.max(0, Math.min(1, experience / Math.max(1, target)));
        const fillWidth = Math.max(8, this.profileExperienceFillWidth * ratio);
        this.profileExperienceFill.width = fillWidth;
        this.profileExperienceFill.x = this.profileExperienceFillLeft + fillWidth / 2;
        uimanager.drawRect(this.profileExperienceFill, fillWidth, 20, MOOD_COLORS.sage, 7, 255);
    }

    private getNodePositionInScreen(node: cc.Node): cc.Vec2 {
        if (!node || !cc.isValid(node) || !this.screen) return cc.v2(0, 0);
        return this.screen.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(0, 0)));
    }

    private pulseRewardTarget(node: cc.Node): void {
        if (!node || !cc.isValid(node)) return;
        cc.Tween.stopAllByTarget(node);
        node.scale = 1;
        cc.tween(node).to(0.08, { scale: 1.08 }).to(0.14, { scale: 1 }, { easing: 'backOut' }).start();
    }

    private makeCartoonBold(label: cc.Label, color: cc.Color, width: number): void {
        const outline = label.node.getComponent(cc.LabelOutline) || label.node.addComponent(cc.LabelOutline);
        outline.color = color;
        outline.width = width;
    }

    /** 解忧秘境：开心瓶开册，册内画作再按顺序点亮。 */
    private showWorryFreeRealm(): void {
        if (this.realmAssetsLoading) return;
        this.stopAlbumArrowHold();
        this.realmAssetsLoading = true;
        if (!isBundleReady('realm')) uimanager.showToast('正在加载解忧秘境…');
        Promise.all([
            ensureRealmReady(),
            syncRealmCloudState().catch((error: Error) => cc.warn('Realm cloud sync failed', error)),
        ]).then(() => {
            this.realmAssetsLoading = false;
            this.renderWorryFreeRealm();
        }).catch((error: Error) => {
            this.realmAssetsLoading = false;
            this.showResourceLoadFailure('解忧秘境', () => this.showWorryFreeRealm());
        });
    }

    private renderWorryFreeRealm(): void {
        this.replaceScreen('worryFreeRealm');
        createMoodCanvasBackground(this.screen, this.screen.width, this.screen.height);
        renderAlbumShelf({
            screen: this.screen,
            onBack: () => this.showHome(),
            onOpenAlbum: (albumId) => this.playRealmTransition(albumId),
            drawMiniBottle: (parent, x, y) => this.drawMiniBottle(parent, x, y),
        });
    }

    /** 从列表进入画册：合拢书页、切换内容，再完整展开。 */
    private playRealmTransition(albumId: string): void {
        if (this.bookTransitioning || this.albumAssetsLoading) return;
        this.currentAlbumId = albumId;
        this.albumArtIndex = 0;
        this.albumAssetsLoading = true;
        if (!isBundleReady('album-art')) uimanager.showToast('正在加载画册内容…');
        ensureAlbumArtReady().then(() => {
            this.albumAssetsLoading = false;
            this.playAlbumBookTransition(() => this.showArtAlbum(0));
        }).catch((error: Error) => {
            this.albumAssetsLoading = false;
            this.showResourceLoadFailure('画册', () => this.playRealmTransition(albumId));
        });
    }

    /** 从画册详情返回列表，复用完全相同的书页层。 */
    private returnToAlbumShelf(): void {
        if (this.bookTransitioning) return;
        this.playAlbumBookTransition(() => this.renderWorryFreeRealm());
    }

    private playAlbumBookTransition(onCovered: () => void): void {
        if (this.bookTransitioning) return;
        this.bookTransitioning = true;
        this.stopAlbumArrowHold();
        this.bookTransitionLayer = playBookPageTransition({
            host: this.node,
            onCovered,
            onComplete: () => {
                this.bookTransitionLayer = null;
                this.bookTransitioning = false;
            },
        });
    }

    private showArtAlbum(artIndex: number = this.albumArtIndex): void {
        this.albumArtIndex = Math.max(0, artIndex);
        this.replaceScreen('artAlbum');
        renderAlbumView({
            screen: this.screen,
            albumId: this.currentAlbumId,
            artIndex: this.albumArtIndex,
            onBackToShelf: () => this.returnToAlbumShelf(),
            onShowArt: (nextIndex) => this.showArtAlbum(nextIndex),
            onArrowPressStart: (direction) => this.startAlbumArrowHold(direction),
            onArrowPressEnd: (direction) => this.finishAlbumArrowPress(direction),
            onArrowNavigatorReady: (navigate) => this.albumArrowNavigate = navigate,
            drawMiniBottle: (parent, x, y) => this.drawMiniBottle(parent, x, y),
        });
    }

    private startAlbumArrowHold(direction: number): void {
        if (direction !== -1 && direction !== 1) return;
        this.stopAlbumArrowHold();
        this.albumArrowHoldDirection = direction;
        this.albumArrowHoldRepeated = false;
        this.albumArrowHoldDelay = () => {
            if (this.albumArrowHoldDirection !== direction) return;
            this.albumArrowHoldRepeated = true;
            if (!this.stepAlbumArt(direction)) {
                this.stopAlbumArrowHold();
                return;
            }
            this.albumArrowRepeatTick = () => {
                if (this.albumArrowHoldDirection !== direction || !this.stepAlbumArt(direction)) {
                    this.stopAlbumArrowHold();
                }
            };
            this.schedule(this.albumArrowRepeatTick, 0.42);
        };
        this.scheduleOnce(this.albumArrowHoldDelay, 0.46);
    }

    private finishAlbumArrowPress(direction: number): boolean {
        if (this.albumArrowHoldDirection !== direction) return false;
        const shouldNavigateOnce = !this.albumArrowHoldRepeated;
        this.stopAlbumArrowHold();
        return shouldNavigateOnce;
    }

    private stepAlbumArt(direction: number): boolean {
        const album = ART_ALBUMS.find((candidate) => candidate.id === this.currentAlbumId);
        if (!album) return false;
        const nextIndex = this.albumArtIndex + direction;
        if (nextIndex < 0 || nextIndex >= album.arts.length) return false;
        if (!this.albumArrowNavigate) return false;
        this.albumArrowNavigate(direction);
        return true;
    }

    private stopAlbumArrowHold(): void {
        if (this.albumArrowHoldDelay) this.unschedule(this.albumArrowHoldDelay);
        if (this.albumArrowRepeatTick) this.unschedule(this.albumArrowRepeatTick);
        this.albumArrowHoldDirection = 0;
        this.albumArrowHoldRepeated = false;
        this.albumArrowHoldDelay = null;
        this.albumArrowRepeatTick = null;
    }

    private handleGlobalAlbumTouchEnd(): void {
        if (this.albumArrowHoldRepeated) this.stopAlbumArrowHold();
    }

    private handleGlobalAlbumTouchCancel(): void {
        if (this.albumArrowHoldDirection !== 0) this.stopAlbumArrowHold();
    }

    private drawMiniBottle(parent: cc.Node, x: number, y: number): void {
        this.drawHudHappyBottle(parent, x, y);
        const icon = parent.getChildByName('hudHappyBottle');
        if (icon) {
            icon.name = 'miniHappyBottle';
            icon.scale = 0.72;
        }
    }

    private startGame(): void {
        if (this.gameAssetsLoading) return;
        this.gameAssetsLoading = true;
        if (!isBundleReady('game-assets')) uimanager.showToast('正在加载消除资源…');
        ensureGameResourcesReady()
            .then(() => {
                this.gameAssetsLoading = false;
                this.roundStartedAt = Date.now();
                this.replaceScreen('game');
                const game = this.screen.addComponent(ZyxGame);
                game.initialize((request) => this.handleSettlementExit(request));
            })
            .catch((error: Error) => {
                this.gameAssetsLoading = false;
                this.showResourceLoadFailure('消除玩法', () => this.startGame());
            });
    }

    private showResourceLoadFailure(feature: string, retry: () => void): void {
        uimanager.showModal(
            '资源加载失败',
            `${feature}资源未能加载，请检查网络后重试。`,
            [{ text: '重新加载', color: BUTTON_COLORS.green, onClick: retry }],
            null,
            0,
            false,
            true,
        );
    }

    private stopScreenTweens(root: cc.Node): void {
        const nodes = [root];
        while (nodes.length > 0) {
            const node = nodes.pop();
            if (!node) continue;
            cc.Tween.stopAllByTarget(node);
            const waterTweenState = (node as any).waterTweenState;
            if (waterTweenState) cc.Tween.stopAllByTarget(waterTweenState);
            nodes.push(...node.children);
        }
    }

    private replaceScreen(name: string): void {
        if (name !== 'artAlbum') {
            this.stopAlbumArrowHold();
            this.albumArrowNavigate = null;
        }
        this.destroyNativeWeChatProfileButton();
        if (this.screen && this.screen.isValid) {
            this.stopScreenTweens(this.screen);
            this.screen.destroy();
        }
        this.profileNameLabel = null;
        this.profileAvatarContent = null;
        this.profileAuthorizationButton = null;
        this.profileLevelLabel = null;
        this.profileExperienceFill = null;
        this.profileExperienceLabel = null;
        this.homeMoodBottle = null;
        this.homeMoodCountLabel = null;
        this.homeDemoLayer = null;
        this.homeDemoClock = null;
        this.homeDemoPlaying = false;
        this.startHomeDemoLoop = null;
        this.startButton = null;
        this.happyBottleCountLabel = null;
        this.happyBottleCountBadge = null;
        this.happyBottleCountCard = null;
        this.screen = new cc.Node(name);
        this.screen.width = cc.winSize.width;
        this.screen.height = cc.winSize.height;
        this.screen.setAnchorPoint(0.5, 0.5);
        this.node.addChild(this.screen);
        const music: MusicName = name === 'game'
            ? 'game'
            : (name === 'worryFreeRealm' || name === 'artAlbum' ? 'puzzle' : 'main');
        audioManager.playMusic(music);
    }
}
