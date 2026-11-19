import { BUTTON_COLORS, BUTTON_TEXT_COLOR, formatDisplayNickname, uimanager } from './manager/UIManager';
import { getWxApi, requestWeChatUserProfile, hasWeChatProfileAuthorization, rememberWeChatProfileAuthorization } from './manager/PlatformAdapter';
import { cloudService, CloudProfile, RoundSettlementResult, StaminaState, ActiveRound, ResumeRoundResult, getApiBase } from './manager/CloudService';
import { roundProgress } from './manager/RoundProgress';
import { settingsPanel } from './manager/SettingsPanel';
import { zyxGameModule } from './dataModule/ZyxGameModule';
import { BOARD_RULES_VERSION } from './dataModule/BoardEngine';
import ZyxGame, { SettlementExitRequest } from './zyxGame/ZyxGame';
import {
    createMoodBean,
    createMoodBeanMascot,
    createAvatarFrame,
    applyRoundedAvatarMask,
    createStaminaBolt,
    createMoodCanvasBackground,
    createGameRoomBackground,
    drawMoodBlockMaterial,
    createMoodStamp,
    createMoodWatermarkWall,
    getMoodColor,
    MOOD_COLORS,
} from './zyxGame/MoodArt';
import { showLeaderboardPanel } from './zyxGame/LeaderboardPanel';
import HomeFriendRanking from './zyxGame/HomeFriendRanking';
import { postFriendMessage, syncConfirmedFriendScore } from './manager/WeChatFriends';
import { showShopPanel, drawShopBag, refreshShopPanel } from './zyxGame/ShopPanel';
import {
    ASSET_PATHS,
    getSpriteFrame,
    isFeatureReady,
    loadRemoteTexture,
    prepareFeature,
    prepareMoodBeanArt,
    prepareTypography,
} from './manager/AssetLoader';
import {
    getRewardOfferActionText,
    getRewardOfferFailToast,
    getRewardOfferIcon,
    playVerifiedRewardVideo,
    registerSystemShare,
    requestRewardOffer,
} from './manager/ShareReward';
import { audioManager } from './manager/AudioManager';
import { isGmEnvironmentAvailable } from './manager/GmAccess';
import { flushPendingRoundSettlements as flushSettlementQueue } from './manager/SettlementSync';
import {
    DESIGN_HEIGHT,
    DESIGN_WIDTH,
    ViewportRect,
    calculateStageLayout,
    insetGameRegion,
    chooseViewportSegment,
    segmentToWorld,
    shouldFitHeight,
} from './manager/ResponsiveLayout';

const { ccclass } = cc._decorator;
const PENDING_START_ROUND_ID_KEY = 'zyx_pending_start_round_id';
const PENDING_STAMINA_SHARE_ID_KEY = 'zyx_pending_stamina_share_id';
const CLIENT_VERSION = '2026.11.19.05';

// GM 模块只在「Web 平台 + Debug 构建」存在：微信构建前 scripts/strip-gm-code.js 会把 assets/script/gm/
// 整体剥离，因此这里必须用动态 require（守卫内），不能用静态 import，否则微信包仍会携带 GM 代码。
declare function require(path: string): any;

/** 开始页与核心玩法之间的唯一场景入口。 */
@ccclass
export default class GameMainScene extends cc.Component {
    private screen: cc.Node = null;
    private backdrop: cc.Node = null;
    private profileNameLabel: cc.Label = null;
    private profileAvatarContent: cc.Node = null;
    private profileAvatarUrl: string = '';
    private currentCloudProfile: CloudProfile = null;
    private profileAuthorizationInFlight: boolean = false;
    private profileLevelLabel: cc.Label = null;
    private profileExperienceFill: cc.Node = null;
    private profileExperienceLabel: cc.Label = null;
    private profileExperienceTrackWidth: number = 238;
    private profileExperienceFillWidth: number = 210;
    private profileExperienceFillLeft: number = -133;
    private homeMoodBeanIcon: cc.Node = null;
    /** 示意棋盘/手势层；结算开心豆回流期间隐藏，结束后再淡入恢复循环。 */
    private homeDemoLayer: cc.Node = null;
    private homeDemoClock: cc.Node = null;
    private homeDemoPlaying: boolean = false;
    private startHomeDemoLoop: () => void = null;
    private homeFriendRanking: HomeFriendRanking = null;
    private startButton: cc.Node = null;
    private startStaminaRecoveryLabel: cc.Label = null;
    private startStaminaTimer: cc.Label = null;
    private startStaminaSuffix: cc.Label = null;
    private moodBeanCountLabel: cc.Label = null;
    private moodBeanCountCard: cc.Node = null;
    private cloudProfileReady: boolean = false;
    private cloudProfileBootstrapPromise: Promise<void> = null;
    private foregroundRefresh: Promise<void> = null;
    private gameAssetsLoading: boolean = false;
    private stamina: StaminaState = null;
    private serverClockOffsetMs: number = 0;
    private staminaLabel: cc.Label = null;
    private staminaRecoveryLabel: cc.Label = null;
    private staminaIcon: cc.Node = null;
    private shareClaimInFlight: boolean = false;
    private activeRoundId: string = '';
    private launchActiveRound: ActiveRound | undefined = undefined;
    private gameHiddenAt = 0;
    private settlementReceipts: { [roundId: string]: RoundSettlementResult } = {};
    private pendingSettlementPresentation: { roundId: string; request: SettlementExitRequest } = null;
    private wxShowHandler: (() => void) = null;
    private wxNetworkHandler: ((res: any) => void) = null;
    private networkOnlineHandler: (() => void) = null;
    private viewportResizeHandler: () => void = null;
    private viewportRefreshPending: boolean = false;

    public onLoad(): void {
        audioManager.enterScene('silent');
        const balloonPreview = typeof CC_DEBUG !== 'undefined' && CC_DEBUG && typeof window !== 'undefined'
            && /(?:^|[?&])balloonDemo=1(?:&|$)/.test(window.location.search);
        audioManager.setPreviewMuted(balloonPreview);
        uimanager.init(this.node);
        registerSystemShare();
        cc.debug.setDisplayStats(false);
        const canvas = this.node.getComponent(cc.Canvas);
        if (canvas) this.configureCanvas(canvas);
        // R0：GM 只允许出现在「Web 平台 + Debug 构建」；微信任何版本与 Web 正式包都不创建节点。
        // gm 目录在微信构建产物中不存在，守卫外绝不执行 require。
        if (isGmEnvironmentAvailable()) {
            const gm = require('./gm/GmBubble');
            gm.attachGmBubble(this.node, {
                refreshInventoryDisplays: () => this.refreshGmInventoryDisplays(),
                applyServerProfile: (profile: any) => this.applyCloudProfile(profile),
                ensureCloudProfileReady: () => this.ensureCloudProfileReadyForGm(),
            });
        }
        // R2：回到前台与网络恢复都是队列补传触发时机。
        const wxApi = getWxApi();
        if (wxApi) {
            if (typeof wxApi.onShow === 'function') {
                this.wxShowHandler = () => this.refreshAfterReconnect();
                wxApi.onShow(this.wxShowHandler);
            }
            if (typeof wxApi.onNetworkStatusChange === 'function') {
                this.wxNetworkHandler = (res: any) => {
                    if (res && res.isConnected) this.refreshAfterReconnect();
                };
                wxApi.onNetworkStatusChange(this.wxNetworkHandler);
            }
            if (typeof wxApi.onWindowResize === 'function') {
                this.viewportResizeHandler = () => this.scheduleViewportRefresh();
                wxApi.onWindowResize(this.viewportResizeHandler);
            }
        }
        if (!this.viewportResizeHandler) this.viewportResizeHandler = () => this.scheduleViewportRefresh();
        if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
            window.addEventListener('resize', this.viewportResizeHandler);
            this.networkOnlineHandler = () => this.refreshAfterReconnect();
            window.addEventListener('online', this.networkOnlineHandler);
        }
        cc.game.on(cc.game.EVENT_HIDE, this.saveBeforeHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.restoreAfterShow, this);
        roundProgress.onStorageFailure = () => uimanager.showToast('本机存储空间不足，请保持联网保存进度');
        roundProgress.onConflict = () => {
            this.enterHome(() => uimanager.showModal('进度已更新', '这局已在别处更新或结束。\n回到首页确认最新进度后，再接着玩吧。',
                [{ text: '知道了', color: BUTTON_COLORS.green, onClick: () => undefined }]));
            this.activeRoundId = '';
        };
        this.schedule(this.updateStaminaStatus, 1);
    }

    public start(): void {
        // 小游戏启动器会在 onLoad 后应用动态图集默认值；start 仍早于本项目的首个 Sprite UI。
        if (cc.dynamicAtlasManager) {
            cc.dynamicAtlasManager.enabled = false;
            cc.dynamicAtlasManager.reset();
        }
        this.launch();
        prepareTypography().then(() => {
            if (!cc.isValid(this.node)) return;
            uimanager.refreshTypography(this.node);
        }).catch((error) => {
            cc.warn('[字体] 使用可读字体继续启动', error);
        });
    }

    private launch(): void {
        const search = typeof window !== 'undefined'
            && window.location
            && typeof window.location.search === 'string'
            ? window.location.search
            : '';
        const seedMatch = search.match(/[?&]seed=(\d+)/);
        zyxGameModule.setRoundSeedOverride(seedMatch ? Number(seedMatch[1]) : 0);
        this.showLaunchLoading();
        const cached = this.readCachedCloudProfile();
        if (cached) {
            roundProgress.bind(cached.playerId);
            const local = roundProgress.getOfflineRound();
            if (local && !zyxGameModule.getPendingRoundSettlements().some(record => record.roundId === local.roundId)) {
                this.showRestoringGame();
                void prepareFeature('game').catch(() => undefined);
            }
        }
        this.bootstrapCloudProfile().then(async () => {
            if (!cc.isValid(this.node)) return;
            if (!this.cloudProfileReady && this.currentCloudProfile) {
                const local = roundProgress.getOfflineRound();
                if (local && !zyxGameModule.getPendingRoundSettlements().some(record => record.roundId === local.roundId)) {
                    try {
                        await prepareFeature('game');
                        this.enterRestoredGame(local);
                        return;
                    } catch (_) { /* 保留本机记录，联网后仍可核验恢复。 */ }
                }
            }
            let active = this.launchActiveRound;
            this.launchActiveRound = undefined;
            if (this.cloudProfileReady && active === undefined) active = await cloudService.getActiveRound().catch(() => null);
            if (active && (!active.mode || active.mode === 'main') && !zyxGameModule.getPendingRoundSettlements().some(record => record.roundId === active.roundId)) {
                await this.resumeSavedRound(active);
                return;
            }
            const previewHome = typeof CC_DEBUG !== 'undefined' && CC_DEBUG && /(?:^|[?&])home=1(?:&|$)/.test(search);
            if (search.indexOf('autostart=1') >= 0 || (!previewHome && zyxGameModule.shouldEnterGameOnLaunch())) {
                const started = await this.startGame(true, null, active);
                if (!started && (!this.screen || this.screen.name !== 'home')) this.enterHome(() => {
                    if (this.stamina && this.getStaminaPreview().current < 1) this.showStaminaEmptyModal();
                });
                return;
            }
            this.enterHome();
        });
    }

    private saveBeforeHide(): void {
        if (this.screen && this.screen.name === 'gameRestoring') return;
        const game = this.screen && this.screen.getComponent(ZyxGame);
        if (game) {
            game.captureProgress(true);
            if (!this.gameHiddenAt) this.gameHiddenAt = Date.now();
        }
    }

    private restoreAfterShow(): void {
        const game = this.screen && this.screen.getComponent(ZyxGame);
        if (game && this.gameHiddenAt) {
            game.resumeAfterBackground(Math.max(0, Date.now() - this.gameHiddenAt));
            game.captureProgress(true);
        }
        this.gameHiddenAt = 0;
    }

    private refreshAfterReconnect(): void {
        if (this.foregroundRefresh || this.gameAssetsLoading || !this.screen
            || this.screen.name === 'launchLoading' || this.screen.name === 'gameRestoring') return;
        const game = this.screen.getComponent(ZyxGame);
        if (game && game.isRewardPending()) return;
        // 首页交由续玩核验本机尾部；同时发起存档同步可能抢用正在换新的会话。
        if (game) void roundProgress.sync(true);
        this.foregroundRefresh = this.refreshCloudProfile().then(async () => {
            if (!cc.isValid(this.node)) return;
            await this.flushPendingRoundSettlements();
            if (cc.isValid(this.node)) await this.restoreUnsettledRound();
        }).catch(error => cc.warn('[云同步] 恢复失败', error)).finally(() => { this.foregroundRefresh = null; });
    }

    /** 网络/前台恢复时直接续玩；正在进行的棋盘不重复抢占会话。 */
    private async restoreUnsettledRound(): Promise<void> {
        if (!this.cloudProfileReady || this.gameAssetsLoading || !this.screen || this.screen.name !== 'home') return;
        try {
            const active = await cloudService.getActiveRound();
            if (!this.screen || this.screen.name !== 'home' || this.gameAssetsLoading) return;
            if (active && (!active.mode || active.mode === 'main')
                && !zyxGameModule.getPendingRoundSettlements().some(record => record.roundId === active.roundId)) {
                await this.resumeSavedRound(active);
            }
        } catch (_) { /* 保留存档，下一次联网恢复时重试。 */ }
    }

    private async resumeSavedRound(active: ActiveRound): Promise<void> {
        if (this.gameAssetsLoading) return;
        this.gameAssetsLoading = true;
        try {
            this.showRestoringGame();
            const restored = roundProgress.resume(active).catch(async error => {
                if (!error || error.businessCode !== 'ROUND_SESSION_CONFLICT' || !cc.isValid(this.node)) throw error;
                const latest = await cloudService.getActiveRound();
                if (!latest || latest.roundId !== active.roundId || latest.generation === active.generation
                    || zyxGameModule.getPendingRoundSettlements().some(record => record.roundId === latest.roundId)) throw error;
                return roundProgress.resume(latest);
            });
            const [saved] = await Promise.all([restored, prepareFeature('game')]);
            if (!cc.isValid(this.node)) return;
            this.enterRestoredGame(saved);
        } catch (error) {
            if (typeof CC_DEBUG !== 'undefined' && CC_DEBUG) cc.warn('[续玩] 恢复失败', error);
            if (!cc.isValid(this.node)) return;
            const report = (): void => {
                uimanager.showToast(error && error.businessCode === 'ROUND_SESSION_CONFLICT'
                    ? '进度刚刚更新，请再次点击开始查看' : '暂时没能恢复，存档已保留，请联网后重试');
            };
            if (this.screen && this.screen.name === 'gameRestoring') this.enterHome(report);
            else report();
        } finally { this.gameAssetsLoading = false; }
    }

    private enterRestoredGame(saved: ResumeRoundResult): void {
        this.activeRoundId = saved.roundId;
        zyxGameModule.cloudRoundId = saved.roundId;
        cc.sys.localStorage.removeItem(PENDING_START_ROUND_ID_KEY);
        this.replaceScreen('game');
        this.screen.addComponent(ZyxGame).initialize(
            request => this.handleSettlementExit(request),
            (settlement, startedAt) => this.submitSettlementToCloud(settlement, startedAt),
            () => this.startGame(false, 'current'), this.currentCloudProfile, saved, () => this.enterHome(),
        );
        if (saved.rulesVersion < BOARD_RULES_VERSION) {
            uimanager.showToast('已恢复旧规则对局\n暂停后可重新开始体验新版', 3.5);
        }
    }

    private showRestoringGame(): void {
        if (this.screen && this.screen.name === 'gameRestoring') return;
        this.replaceScreen('gameRestoring');
        this.screen.addComponent(ZyxGame).showRestoring();
    }

    /** 首包内的轻量启动反馈；不加载首页贴图或音乐，避免新用户为看不到的首页资源付费。 */
    private showLaunchLoading(): void {
        this.replaceScreen('launchLoading');
        const launchScreen = this.screen;
        uimanager.createLabel(this.screen, '正在准备快乐消除…', 0, -50, 22, MOOD_COLORS.cocoa, 360, 36);
        prepareMoodBeanArt().then(() => {
            if (!cc.isValid(launchScreen) || this.screen !== launchScreen) return;
            const mascot = createMoodBeanMascot(launchScreen, 0, 32, 96);
            cc.tween(mascot)
                .repeatForever(cc.tween().to(0.42, { y: 46 }, { easing: 'sineOut' }).to(0.42, { y: 32 }, { easing: 'sineIn' }))
                .start();
        }).catch(error => cc.warn('[资源] 启动角色暂未就绪', error));
    }

    public onDestroy(): void {
        cc.game.off(cc.game.EVENT_HIDE, this.saveBeforeHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.restoreAfterShow, this);
        roundProgress.onConflict = null;
        roundProgress.onStorageFailure = null;
        audioManager.dispose();
        this.unschedule(this.updateStaminaStatus);
        const wxApi = getWxApi();
        if (wxApi) {
            if (this.wxShowHandler && typeof wxApi.offShow === 'function') wxApi.offShow(this.wxShowHandler);
            if (this.wxNetworkHandler && typeof wxApi.offNetworkStatusChange === 'function') {
                wxApi.offNetworkStatusChange(this.wxNetworkHandler);
            }
            if (this.viewportResizeHandler && typeof wxApi.offWindowResize === 'function') {
                wxApi.offWindowResize(this.viewportResizeHandler);
            }
        }
        if (this.viewportResizeHandler && typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
            window.removeEventListener('resize', this.viewportResizeHandler);
            if (this.networkOnlineHandler) window.removeEventListener('online', this.networkOnlineHandler);
        }
        this.wxShowHandler = null;
        this.wxNetworkHandler = null;
    }

    private configureCanvas(canvas: cc.Canvas): void {
        const frame = cc.view.getFrameSize();
        const fitHeight = shouldFitHeight(frame.width, frame.height);
        canvas.fitWidth = !fitHeight;
        canvas.fitHeight = fitHeight;
        cc.view.setDesignResolutionSize(
            DESIGN_WIDTH,
            DESIGN_HEIGHT,
            fitHeight ? cc.ResolutionPolicy.FIXED_HEIGHT : cc.ResolutionPolicy.FIXED_WIDTH,
        );
    }

    private scheduleViewportRefresh(): void {
        if (this.viewportRefreshPending) return;
        this.viewportRefreshPending = true;
        this.scheduleOnce(() => {
            this.viewportRefreshPending = false;
            const canvas = this.node.getComponent(cc.Canvas);
            if (canvas) this.configureCanvas(canvas);
            this.scheduleOnce(() => {
                if (!this.screen || !cc.isValid(this.screen)) return;
                if (this.screen.name === 'home') {
                    this.showHome();
                } else if (this.screen.name === 'launchLoading') {
                    this.showLaunchLoading();
                } else {
                    this.renderBackdrop(this.screen.name);
                    this.applyStageLayout(this.screen);
                }
            }, 0);
        }, 0);
    }

    private readViewportSegments(): ViewportRect[] {
        if (typeof window === 'undefined') return [];
        try {
            const source: any = window as any;
            const reported = (source.viewport && source.viewport.segments)
                || (source.visualViewport && source.visualViewport.segments)
                || (typeof source.getWindowSegments === 'function' ? source.getWindowSegments() : null);
            if (!reported || reported.length < 2) return [];
            return Array.prototype.map.call(reported, (rect: any) => ({
                x: Number(rect.left !== undefined ? rect.left : rect.x),
                y: Number(rect.top !== undefined ? rect.top : rect.y),
                width: Number(rect.width),
                height: Number(rect.height),
            }));
        } catch (_) {
            return [];
        }
    }

    private getStageRegion(): ViewportRect {
        const full = { x: 0, y: 0, width: cc.winSize.width, height: cc.winSize.height };
        const segment = chooseViewportSegment(this.readViewportSegments());
        if (!segment || typeof window === 'undefined') return full;
        const frame = cc.view.getFrameSize();
        const viewportWidth = Number((window as any).innerWidth) || frame.width;
        const viewportHeight = Number((window as any).innerHeight) || frame.height;
        const world = segmentToWorld(segment, viewportWidth, viewportHeight, full.width, full.height);
        const safe = uimanager.getSafeAreaMetrics();
        const left = Math.max(world.x - world.width / 2, -full.width / 2 + safe.left);
        const right = Math.min(world.x + world.width / 2, full.width / 2 - safe.right);
        const bottom = Math.max(world.y - world.height / 2, -full.height / 2 + safe.bottom);
        const top = Math.min(world.y + world.height / 2, full.height / 2 - safe.top);
        if (!(right > left) || !(top > bottom)) return full;
        return { x: (left + right) / 2, y: (top + bottom) / 2, width: right - left, height: top - bottom };
    }

    private applyStageLayout(screen: cc.Node): void {
        const game = screen.name === 'game';
        const region = game
            ? insetGameRegion(this.getStageRegion(), cc.winSize.width, cc.winSize.height, uimanager.getSafeAreaMetrics())
            : this.getStageRegion();
        const stage = calculateStageLayout(region, game);
        screen.setPosition(stage.x, stage.y);
        screen.setContentSize(stage.width, stage.height);
        screen.scale = stage.scale;
        const gameComponent = game ? screen.getComponent(ZyxGame) : null;
        if (gameComponent) gameComponent.refreshLayout();
        uimanager.refreshModalLayout();
    }

    private renderBackdrop(name: string): void {
        if (this.backdrop && cc.isValid(this.backdrop)) this.backdrop.destroy();
        this.backdrop = new cc.Node('viewportBackdrop');
        this.backdrop.setContentSize(cc.winSize.width, cc.winSize.height);
        this.backdrop.zIndex = -100;
        this.node.addChild(this.backdrop);
        if (name === 'home') {
            createMoodCanvasBackground(this.backdrop, cc.winSize.width, cc.winSize.height);
            createMoodWatermarkWall(this.backdrop, cc.winSize.width, cc.winSize.height);
        } else if (name === 'game') {
            createGameRoomBackground(this.backdrop, cc.winSize.width, cc.winSize.height);
        } else {
            const color = name === 'gameRestoring' ? new cc.Color(255, 239, 204) : new cc.Color(255, 247, 225);
            uimanager.createRect(this.backdrop, 'launchBackground', cc.winSize.width, cc.winSize.height, color);
        }
    }

    private enterHome(onReady?: () => void): void {
        audioManager.enterScene('silent');
        if (!isFeatureReady('home') && !this.pendingSettlementPresentation) uimanager.showToast('正在加载首页…');
        prepareFeature('home')
            .then(() => {
                this.showHome();
                if (onReady) onReady();
            })
            .catch((error) => {
                cc.error('首页初始化失败', error);
                this.showResourceLoadFailure('首页', () => this.enterHome(onReady));
            });
    }

    private showHome(): void {
        uimanager.closeModal();
        this.replaceScreen('home');
        zyxGameModule.refreshPersistentProgress();
        const width = this.screen.width;
        const height = this.screen.height;
        const safeArea = uimanager.getSafeAreaMetrics();
        const heightDelta = height - 1334;
        // 首页以“标题—整理演示—开始操作”自上而下收束，避免标题过高、底部按钮过轻。
        const titleY = 380 + Math.max(0, Math.min(80, heightDelta * 0.25));
        const friendY = -104 + Math.max(0, Math.min(28, heightDelta * 0.08));
        const tipY = -height / 2 + safeArea.bottom + 68;
        const startY = -475 - Math.max(-14, Math.min(32, heightDelta * 0.09));
        const profileY = height / 2 - Math.max(32, safeArea.top) - 64;

        const profile = this.createHomeProfile(profileY);
        this.createMoodBeanCount(profile);
        this.bootstrapCloudProfile();
        // R2：每次进入首页都触发队列补传；cloudProfileReady 只能跳过重复建档，不能跳过补传。
        this.flushPendingRoundSettlements();

        this.createHomeTitleLogo(titleY);
        const title = this.screen.getChildByName('homeTitleLogo');
        // 演示组合的视觉中心比原点高42px，按标题下沿与好友卡上沿的中点放置。
        const demoCenterY = (title.y - title.height / 2 + friendY + 230) / 2;
        this.createHomeMoodScene(demoCenterY - 42);
        const friendModule = new cc.Node('homeFriendRanking');
        friendModule.setPosition(0, friendY);
        friendModule.zIndex = 90;
        this.screen.addChild(friendModule);
        this.homeFriendRanking = friendModule.addComponent(HomeFriendRanking);
        this.createHomeFeatureEntries();
        this.createHomeSettingsEntry();
        this.createHomeRotatingTip(tipY);
        const version = uimanager.createLabel(this.screen, `v${CLIENT_VERSION}`,
            width / 2 - safeArea.right - 22, -height / 2 + safeArea.bottom + 22,
            16, MOOD_COLORS.cocoaSoft, 240, 28);
        version.node.name = 'clientVersion';
        version.node.setAnchorPoint(1, 0.5);
        version.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
        version.enableWrapText = false;

        this.startButton = uimanager.createButton(
            this.screen,
            '开 始',
            0,
            startY,
            462,
            136,
            BUTTON_COLORS.green,
            () => this.startGame(),
            24,
        );
        this.decorateStartButton();
        const countdown = new cc.Node('startStaminaCountdown');
        this.startButton.addChild(countdown);
        countdown.setPosition(0, this.startButton.height / 2 + 25);
        const countdownLayout = countdown.addComponent(cc.Layout);
        countdownLayout.type = cc.Layout.Type.HORIZONTAL;
        countdownLayout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        countdownLayout.spacingX = 2;
        this.startStaminaRecoveryLabel = uimanager.createLabel(countdown, '', 0, 0, 21, MOOD_COLORS.cocoaSoft, 1, 34);
        this.startStaminaTimer = uimanager.createLabel(countdown, '', 0, 0, 21, new cc.Color(48, 132, 70), 1, 34);
        this.startStaminaSuffix = uimanager.createLabel(countdown, '', 0, 0, 21, MOOD_COLORS.cocoaSoft, 1, 34);
        this.startStaminaTimer.node.color = new cc.Color(48, 132, 70);
        this.startStaminaRecoveryLabel.node.color = this.startStaminaSuffix.node.color = MOOD_COLORS.cocoaSoft;
        for (const label of [this.startStaminaRecoveryLabel, this.startStaminaTimer, this.startStaminaSuffix]) {
            label.overflow = cc.Label.Overflow.NONE;
            label.enableWrapText = false;
            uimanager.applyTypography(label);
        }
        this.createStartButtonGuide();
        this.updateStaminaStatus();
        this.preloadGameResourcesSilently();
    }

    private applyStaminaState(state: StaminaState): void {
        if (!state) return;
        this.stamina = state;
        const serverTime = Date.parse(state.serverTime);
        this.serverClockOffsetMs = Number.isFinite(serverTime) ? serverTime - Date.now() : 0;
        this.updateStaminaStatus();
    }

    private getStaminaPreview(): { current: number; secondsToNext: number } {
        if (!this.stamina) return { current: 0, secondsToNext: 0 };
        const max = Math.max(1, this.stamina.max || 10);
        const current = Math.max(0, Math.floor(this.stamina.current || 0));
        const recoveryAt = this.stamina.nextRecoveryAt ? Date.parse(this.stamina.nextRecoveryAt) : NaN;
        if (current >= max || !Number.isFinite(recoveryAt)) return { current, secondsToNext: 0 };
        const now = Date.now() + this.serverClockOffsetMs;
        const interval = Math.max(1, this.stamina.regenSeconds || 300) * 1000;
        const recovered = now >= recoveryAt ? 1 + Math.floor((now - recoveryAt) / interval) : 0;
        const preview = Math.min(max, current + recovered);
        if (preview >= max) return { current: preview, secondsToNext: 0 };
        const nextAt = recoveryAt + recovered * interval;
        return { current: preview, secondsToNext: Math.max(0, Math.ceil((nextAt - now) / 1000)) };
    }

    private updateStaminaStatus(): void {
        if (this.staminaLabel && cc.isValid(this.staminaLabel.node)) {
            if (!this.stamina) {
                this.staminaLabel.string = '—/10';
            } else {
                const preview = this.getStaminaPreview();
                this.staminaLabel.string = `${preview.current}/${this.stamina.max}`;
            }
        }
        if (this.staminaRecoveryLabel && cc.isValid(this.staminaRecoveryLabel.node)) {
            const showRecovery = !!this.stamina && this.getStaminaPreview().current < this.stamina.max;
            this.staminaRecoveryLabel.node.active = showRecovery;
            if (showRecovery) {
                const seconds = this.getStaminaPreview().secondsToNext;
                const minutesText = String(Math.floor(seconds / 60)).padStart(2, '0');
                const secondsText = String(seconds % 60).padStart(2, '0');
                this.staminaRecoveryLabel.string = `${minutesText}:${secondsText} 后恢复`;
            }
        }
        if (this.startStaminaRecoveryLabel && cc.isValid(this.startStaminaRecoveryLabel.node, true)) {
            const text = this.getChallengeStaminaText();
            const parts = text.match(/^(.*?)(\d{2}:\d{2})(.*)$/);
            this.startStaminaRecoveryLabel.string = parts ? parts[1] : text;
            this.startStaminaTimer.string = parts ? parts[2] : '';
            this.startStaminaSuffix.string = parts ? parts[3] : '';
            for (const label of [this.startStaminaRecoveryLabel, this.startStaminaTimer, this.startStaminaSuffix]) {
                (label as any)._forceUpdateRenderData();
            }
            const group = this.startStaminaRecoveryLabel.node.parent;
            group.getComponent(cc.Layout).updateLayout();
            group.scale = Math.min(1, 540 / Math.max(1, group.width));
        }
        refreshShopPanel();
    }

    private getChallengeStaminaText(): string {
        if (!this.stamina) return '正在同步体力…';
        const preview = this.getStaminaPreview();
        const max = this.stamina.max || 10;
        const amount = `体力 ${preview.current}/${max}`;
        if (preview.current >= max) return `${amount} · 体力已满`;
        if (preview.secondsToNext <= 0) return `${amount} · 等待同步恢复时间`;
        const minutes = String(Math.floor(preview.secondsToNext / 60)).padStart(2, '0');
        const seconds = String(preview.secondsToNext % 60).padStart(2, '0');
        return `${amount} · ${minutes}:${seconds} 后恢复1点`;
    }

    private showStaminaInfo(): void {
        if (!this.stamina) {
            uimanager.showToast('体力正在同步，请稍后再试');
            return;
        }
        const preview = this.getStaminaPreview();
        if (preview.current === 0) {
            this.showStaminaEmptyModal();
            return;
        }
        if (preview.current > this.stamina.max) {
            uimanager.showToast('额外体力已保留 · 低于上限后自动恢复');
            return;
        }
        if (preview.current >= this.stamina.max) {
            uimanager.showToast('体力已满 · 每 5 分钟恢复 1 点');
            return;
        }
        const minutes = Math.max(1, Math.ceil(preview.secondsToNext / 60));
        uimanager.showToast(`体力 ${preview.current}/${this.stamina.max} · 约 ${minutes} 分钟后恢复 1 点`);
    }

    private showStaminaEmptyModal(): void {
        const preview = this.getStaminaPreview();
        const minutes = Math.max(1, Math.ceil(preview.secondsToNext / 60));
        const available = !this.stamina || this.stamina.shareAvailableToday !== false;
        const offerAction = getRewardOfferActionText();
        const videoEnabled = offerAction === '看视频';
        uimanager.showModal(
            '体力不足',
            available
                ? `下一点约 ${minutes} 分钟后恢复。\n${videoEnabled ? '完整看视频' : '分享给朋友'}，立即获得 5 点体力。`
                : `下一点约 ${minutes} 分钟后恢复。\n今天的${videoEnabled ? '视频' : '分享'}体力已领取，明天再来吧。`,
            available
                ? [
                    { text: `${offerAction}得 5 体力`, color: BUTTON_COLORS.yellow, onClick: () => this.requestStaminaReward() },
                    { text: '稍后再来', color: BUTTON_COLORS.green, onClick: () => undefined },
                ]
                : [{ text: '知道了', color: BUTTON_COLORS.green, onClick: () => undefined }],
            null,
            0,
            false,
            true,
        );
    }

    private async requestStaminaReward(): Promise<void> {
        if (this.shareClaimInFlight) return;
        this.shareClaimInFlight = true;
        try {
            if (getRewardOfferIcon() === 'video') {
                const rewarded = await playVerifiedRewardVideo('5 点体力', 'legacy',
                    () => cloudService.prepareRewardIntent('stamina', undefined, false), async intent => {
                        await cloudService.completeRewardIntent(intent);
                        cloudService.rememberRewardIntent('stamina', intent.intentId);
                    });
                this.shareClaimInFlight = false;
                if (rewarded) await this.claimSharedStamina();
                else uimanager.showToast(getRewardOfferFailToast('stamina'));
                return;
            }
            const intent = await cloudService.prepareRewardIntent('stamina');
            if (intent.completed) { this.shareClaimInFlight = false; await this.claimSharedStamina(); return; }
            requestRewardOffer((rewarded) => {
                if (!rewarded) {
                    this.shareClaimInFlight = false;
                    uimanager.showToast(getRewardOfferFailToast('stamina')); return;
                }
                void cloudService.completeRewardIntent(intent).then(() => {
                    this.shareClaimInFlight = false; void this.claimSharedStamina();
                }).catch(error => { this.shareClaimInFlight = false; uimanager.showToast(error.message || '奖励尚未确认，请重试'); });
            }, '5 点体力');
        } catch (error) { this.shareClaimInFlight = false; uimanager.showToast(error.message || '奖励暂不可用，请稍后重试'); }
    }

    private async claimSharedStamina(): Promise<void> {
        if (this.shareClaimInFlight) return;
        this.shareClaimInFlight = true;
        const storage = cc.sys.localStorage;
        let requestSent = false;
        try {
            let claimId = storage.getItem(PENDING_STAMINA_SHARE_ID_KEY) || '';
            if (!/^share_[a-z0-9_]{8,80}$/.test(claimId)) {
                claimId = `share_${Date.now()}_${Math.floor(Math.random() * 1000000000).toString(36)}`;
                storage.setItem(PENDING_STAMINA_SHARE_ID_KEY, claimId);
            }
            requestSent = true;
            const result = await cloudService.claimSharedStamina(claimId);
            storage.removeItem(PENDING_STAMINA_SHARE_ID_KEY);
            this.applyStaminaState(result.stamina);
            uimanager.showToast(result.previousDay ? '此前奖励已确认，今天仍可领取'
                : result.duplicate ? '体力已到账' : `体力 +${result.awarded}`);
        } catch (error) {
            if (error && (error as any).stamina) this.applyStaminaState((error as any).stamina);
            const code = error && (error as any).businessCode;
            if (code === 'STAMINA_SHARE_DAILY_LIMIT') {
                storage.removeItem(PENDING_STAMINA_SHARE_ID_KEY);
                uimanager.showToast('今天的奖励体力已领取');
            } else if (code === 'STAMINA_FULL') {
                storage.removeItem(PENDING_STAMINA_SHARE_ID_KEY);
                uimanager.showToast('体力已满，暂时无需补充');
            } else {
                uimanager.showToast(requestSent ? '体力领取未确认，请联网后重试' : '存储空间不足，清理后再领取');
            }
        } finally {
            this.shareClaimInFlight = false;
        }
    }

    /** 服务端确认扣点后，绿色体力闪电沿三次贝塞尔曲线飞向开始按钮。 */
    private playStartStaminaFlight(): Promise<void> {
        if (!this.screen || this.screen.name !== 'home' || !this.staminaIcon || !this.startButton
            || !cc.isValid(this.staminaIcon) || !cc.isValid(this.startButton)) return Promise.resolve();
        const start = this.getNodePositionInScreen(this.staminaIcon);
        const end = this.getNodePositionInScreen(this.startButton);
        const control1 = cc.v2(start.x + 105, start.y - 118);
        const control2 = cc.v2(end.x + 118, end.y + 145);
        const bolt = createStaminaBolt(this.screen, start.x, start.y, 50);
        bolt.zIndex = 2900;
        const state = { t: 0 };
        return new Promise((resolve) => {
            cc.tween(state)
                .to(0.3, { t: 1 }, {
                    easing: 'cubicInOut',
                    onUpdate: () => {
                        if (!cc.isValid(bolt)) return;
                        const t = state.t;
                        const inverse = 1 - t;
                        bolt.x = inverse * inverse * inverse * start.x
                            + 3 * inverse * inverse * t * control1.x
                            + 3 * inverse * t * t * control2.x
                            + t * t * t * end.x;
                        bolt.y = inverse * inverse * inverse * start.y
                            + 3 * inverse * inverse * t * control1.y
                            + 3 * inverse * t * t * control2.y
                            + t * t * t * end.y;
                        bolt.scale = 1 - t * 0.48;
                        bolt.angle = -t * 26;
                    },
                })
                .call(() => {
                    if (cc.isValid(bolt)) bolt.destroy();
                    resolve();
                })
                .start();
        });
    }

    /** 首页可交互后预热主包内局内资源；点击开始时仍以同一 Promise 为准。 */
    private preloadGameResourcesSilently(): void {
        prepareFeature('game')
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
        const frame = getSpriteFrame('home', ASSET_PATHS.home.title);
        sprite.spriteFrame = frame;
        uimanager.fitSpriteFrameInside(logo, frame, 560, 190);
        logo.opacity = 0;
        logo.scale = 0.9;
        cc.tween(logo).to(0.28, { opacity: 255, scale: 1 }, { easing: 'backOut' }).start();
    }

    /** 资源共用一套带图标圆章的胶囊，避免体力与开心豆呈现为两种组件。 */
    private createHomeResourceCapsule(
        profile: cc.Node,
        name: string,
        x: number,
        fill: cc.Color,
        borderColor: cc.Color,
        iconFill: cc.Color,
    ): cc.Node {
        const cardWidth = 148;
        const cardHeight = 58;
        const resourceY = 24;
        uimanager.createRect(profile, `${name}Shadow`, cardWidth, cardHeight, new cc.Color(91, 73, 57), 22, 23, x, resourceY - 3);
        const card = uimanager.createRect(profile, name, cardWidth, cardHeight, fill, 255, 23, x, resourceY);
        const borderNode = new cc.Node(`${name}Border`);
        borderNode.zIndex = 2;
        card.addChild(borderNode);
        const border = borderNode.addComponent(cc.Graphics);
        border.strokeColor = borderColor;
        border.lineWidth = 1.6;
        border.roundRect(-cardWidth / 2 + 1, -cardHeight / 2 + 1, cardWidth - 2, cardHeight - 2, 22);
        border.stroke();
        const iconPlate = uimanager.createCircle(card, `${name}IconPlate`, 21, iconFill, -50, 0);
        iconPlate.zIndex = 3;
        const plateBorder = iconPlate.getComponent(cc.Graphics);
        plateBorder.strokeColor = borderColor;
        plateBorder.lineWidth = 1.1;
        plateBorder.circle(0, 0, 20);
        plateBorder.stroke();
        return card;
    }

    /** 档案卡右侧并列展示体力与服务端确认的开心豆余额。 */
    private createMoodBeanCount(profile: cc.Node): void {
        const staminaCard = this.createHomeResourceCapsule(
            profile, 'staminaCount', 244,
            new cc.Color(255, 237, 197), new cc.Color(201, 155, 82, 175), new cc.Color(255, 249, 226),
        );
        this.staminaIcon = createStaminaBolt(staminaCard, -50, 0, 38);
        this.staminaLabel = uimanager.createLabel(staminaCard, '—/10', 20, 0, 23, MOOD_COLORS.cocoa, 104, 29);
        uimanager.applyTypography(this.staminaLabel);
        this.staminaRecoveryLabel = uimanager.createLabel(staminaCard, '', 0, -52, 18, new cc.Color(48, 132, 70), 148, 28);
        uimanager.applyTypography(this.staminaRecoveryLabel);
        staminaCard.addComponent(cc.Button);
        staminaCard.on(cc.Node.EventType.TOUCH_END, () => this.showStaminaInfo(), this);

        const card = this.createHomeResourceCapsule(
            profile, 'moodBeanCount', 75,
            new cc.Color(255, 243, 215), new cc.Color(205, 173, 103, 175), new cc.Color(255, 250, 230),
        );
        card.zIndex = 25;
        this.moodBeanCountCard = card;
        const icon = createMoodBeanMascot(card, -50, -1, 40);
        icon.zIndex = 16;
        this.moodBeanCountLabel = uimanager.createLabel(
            card,
            String(zyxGameModule.getDisplayMoodBeanBalance()),
            20,
            0,
            23,
            MOOD_COLORS.cocoa,
            104,
            29,
        );
        uimanager.applyTypography(this.moodBeanCountLabel);
        this.layoutMoodBeanCountBadge();
    }

    /** 数量保持在固定胶囊内，位数增加时只缩字号。 */
    private layoutMoodBeanCountBadge(countOverride?: number): void {
        if (!this.moodBeanCountLabel || !cc.isValid(this.moodBeanCountLabel.node)) return;
        // 开心豆余额只采用服务端确认值。
        const count = Math.max(0, Math.floor(
            Number.isFinite(countOverride) ? countOverride : zyxGameModule.getDisplayMoodBeanBalance(),
        ));
        this.moodBeanCountLabel.string = String(count);
        const digits = String(count).length;
        this.moodBeanCountLabel.fontSize = digits >= 6 ? 21 : (digits >= 4 ? 25 : 29);
    }

    private updateMoodBeanCount(): void {
        this.layoutMoodBeanCountBadge();
        if (this.moodBeanCountCard) this.pulseRewardTarget(this.moodBeanCountCard);
    }

    /** 首次进入时匿名建档；服务端体力未确认前不能开始新局。 */
    private async bootstrapCloudProfile(): Promise<void> {
        if (this.cloudProfileReady) return;
        if (this.cloudProfileBootstrapPromise) return this.cloudProfileBootstrapPromise;
        // 任何云同步之前先把本地持久化进度读进模块，避免“本地有旧进度、云端未建档”时
        // 用模块内默认零值创建云档案，再被 applyCloudProfile 回写覆盖本地存档。
        zyxGameModule.refreshPersistentProgress();
        this.cloudProfileBootstrapPromise = (async () => {
            try {
                // R1：bootstrap 只提交身份资料；经济数据由服务端权威档案下发，不再上报本地数值。
                const session = await cloudService.bootstrapSession(
                    this.profileNameLabel ? this.profileNameLabel.string : '解忧玩家',
                    '', this.screen && ['launchLoading', 'gameRestoring'].includes(this.screen.name),
                );
                this.launchActiveRound = session.activeRound;
                this.cloudProfileReady = true;
                this.applyCloudProfile(session.profile);
                this.flushPendingRoundSettlements(false);
            } catch (error) {
                // 网络短暂不可用时继续使用本地缓存，不打断玩家进入游戏。
                if (!error || ![401, 403].includes(error.status)) {
                    const cached = this.readCachedCloudProfile();
                    if (cached) this.applyCloudProfile(cached);
                }
            } finally {
                this.cloudProfileBootstrapPromise = null;
            }
        })();
        return this.cloudProfileBootstrapPromise;
    }

    private readCachedCloudProfile(): CloudProfile {
        try {
            const cached = JSON.parse(cc.sys.localStorage.getItem('zyx_confirmed_profile_' + getApiBase()) || 'null');
            return cached && cached.token && cached.token === cc.sys.localStorage.getItem('zyx_cloud_token') ? cached.profile : null;
        } catch (_) { return null; }
    }

    private async refreshCloudProfile(): Promise<void> {
        if (!this.cloudProfileReady) return this.bootstrapCloudProfile();
        try {
            const profile = await cloudService.bootstrap(this.profileNameLabel ? this.profileNameLabel.string : '', '');
            this.applyCloudProfile(profile);
        } catch (error) {
            // 留在已有页面，下一次开局仍会由服务端校验体力。
        }
    }

    private applyCloudProfile(profile: CloudProfile): void {
        if (!profile) return;
        if (!zyxGameModule.applyCloudProfile(profile)) return;
        this.currentCloudProfile = profile;
        try {
            cc.sys.localStorage.setItem('zyx_confirmed_profile_' + getApiBase(), JSON.stringify({ profile, token: cc.sys.localStorage.getItem('zyx_cloud_token') }));
        } catch (_) { /* 资产仍以云端确认值为准；缓存不影响在线流程。 */ }
        roundProgress.bind(profile.playerId);
        syncConfirmedFriendScore(profile.playerId, profile.highestSingleGameScore);
        if (this.profileNameLabel) {
            this.profileNameLabel.string = formatDisplayNickname(profile.nickname);
            uimanager.applyTypography(this.profileNameLabel);
        }
        if (this.profileAvatarContent && cc.isValid(this.profileAvatarContent)
            && this.profileAvatarUrl !== (profile.avatarUrl || '')) {
            this.renderProfileAvatar(this.profileAvatarContent, profile.avatarUrl || '');
        }
        this.applyStaminaState(profile.stamina);
        this.updateStaminaStatus();
        this.updateMoodBeanCount();
        const game = this.screen && this.screen.getComponent(ZyxGame);
        if (game && game.node && cc.isValid(game.node)) game.refreshInventoryHud();
        refreshShopPanel();
        // 开心豆余额和经验只展示服务端确认值，避免预支待同步奖励。
        const display = zyxGameModule.getDisplayLevelAndExperience();
        this.updateHomeExperienceDisplay(display.level, display.experience, display.target);
    }

    /**
     * R2：所有对局结算都走同一条路径——先入队，再由统一工作器提交。
     * 结束本局时立即持久化记录，再由服务端按开局凭证结算。
     */
    private submitSettlementToCloud(settlement: SettlementExitRequest['settlement'], startedAt: number): void {
        if (!this.activeRoundId) {
            cc.error('结算缺少服务端开局 ID');
            return;
        }
        const record = {
            roundId: this.activeRoundId,
            sessionToken: roundProgress.token,
            startedAt,
            endedAt: Date.now(),
            score: settlement.roundScore,
            collectedMoodBeanCount: settlement.roundCollectedMoodBeans,
            actions: zyxGameModule.roundActions.slice(),
        };
        zyxGameModule.enqueuePendingRoundSettlement(record);
        roundProgress.clear(record.roundId);
        this.flushPendingRoundSettlements();
    }

    /**
     * 统一补传工作器入口（single-flight）。触发时机：bootstrap 成功、进入首页、
     * 微信 onShow、网络恢复和新结算入队后。
     * bootstrap 流程内部调用时传 allowBootstrap=false，避免等待自身造成死锁。
     */
    private async flushPendingRoundSettlements(allowBootstrap: boolean = true): Promise<void> {
        if (!this.cloudProfileReady) {
            if (!allowBootstrap) return;
            await this.bootstrapCloudProfile();
            if (!this.cloudProfileReady) return;
        }
        const outcome = await flushSettlementQueue(
            (record) => cloudService.submitSettlement(
                record.roundId,
                record.startedAt,
                record.endedAt,
                record.score,
                record.collectedMoodBeanCount,
                record.actions,
                record.sessionToken,
            ),
            {
                onSettled: (record, result) => {
                    if (result && result.settlement && result.settlement.profile) {
                        this.applyCloudProfile(result.settlement.profile);
                        if (record.roundId === this.activeRoundId
                            || (this.pendingSettlementPresentation && record.roundId === this.pendingSettlementPresentation.roundId)) {
                            this.settlementReceipts[record.roundId] = result as RoundSettlementResult;
                            this.tryPresentConfirmedSettlement();
                        }
                    }
                },
                onDeadLetter: (record) => {
                    if (this.pendingSettlementPresentation && record.roundId === this.pendingSettlementPresentation.roundId) {
                        this.pendingSettlementPresentation = null;
                    }
                    uimanager.showToast('有一局记录未获服务端确认，未计入开心豆');
                },
            },
        );
        if (outcome.deadLettered > 0) {
            // 坏记录被永久隔离后，重新拉取服务端档案校正本地展示，不伪装成功。
            try {
                const refreshed = await cloudService.bootstrap(
                    this.profileNameLabel ? this.profileNameLabel.string : '',
                    '',
                );
                this.applyCloudProfile(refreshed);
            } catch (error) {
                // 校正失败不打断后续触发，下次补传时会再次尝试。
            }
        }
    }

    /** 首页功能入口：右侧统一工具架，入口距屏幕边缘保留安全留白。 */
    private createHomeFeatureEntries(): void {
        const safeArea = uimanager.getSafeAreaMetrics();
        const cardWidth = 118;
        // 排行在上、商城在下，沿用同一工具架和点击热区。
        const entryHeight = 126;
        const railPadY = 18;
        const railHeight = railPadY * 2 + entryHeight * 2 + 18;
        const contentRight = Math.min(this.screen.width / 2 - safeArea.right, DESIGN_WIDTH / 2);
        const entryX = contentRight - 15 - cardWidth / 2;
        const rail = uimanager.createRect(this.screen, 'homeFeatureRail', cardWidth, railHeight, new cc.Color(239, 220, 178), 230, 26, entryX, 0);
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
            'rankEntry',
            '排行榜',
            72,
            new cc.Color(105, 164, 190),
            ASSET_PATHS.home.rankEntry,
            () => showLeaderboardPanel(
                () => this.bootstrapCloudProfile(),
                () => this.authorizeWeChatProfile(false),
            ),
        );
        this.createHomeFeatureIcon(rail, 'shopEntry', '商城', -72, MOOD_COLORS.honey, null,
            () => showShopPanel(() => this.refreshCloudProfile(), profile => this.applyCloudProfile(profile), {
                staminaText: () => this.getChallengeStaminaText(),
                staminaAmount: () => this.stamina ? `当前体力 ${this.getStaminaPreview().current}/${this.stamina.max}` : '体力同步中…',
                start: () => this.startGame(),
            }));
    }

    /** 右下角独立设置入口：用高对比度的软糖按钮承接全局设置。 */
    private createHomeSettingsEntry(): void {
        const safeArea = uimanager.getSafeAreaMetrics();
        const buttonWidth = 104;
        const buttonHeight = 104;
        const contentRight = Math.min(this.screen.width / 2 - safeArea.right, DESIGN_WIDTH / 2);
        const x = contentRight - 15 - buttonWidth / 2;
        const y = -this.screen.height / 2 + safeArea.bottom + 190;
        const entry = uimanager.createRect(this.screen, 'settingsEntry', buttonWidth, buttonHeight, MOOD_COLORS.mistBlue, 255, 24, x, y);
        entry.zIndex = 150;
        uimanager.drawButtonSurface(entry, buttonWidth, buttonHeight, MOOD_COLORS.mistBlue, 24);
        const gear = this.drawSettingsGear(entry);
        const title = uimanager.createLabel(entry, '设置', 0, -24, 28, BUTTON_TEXT_COLOR, 90, 38);
        uimanager.applyTypography(title);
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

    private refreshGmInventoryDisplays(): void {
        // R2：展示口径 = 服务端确认基准 + 剩余 pending 推算值。
        const display = zyxGameModule.getDisplayLevelAndExperience();
        this.updateHomeExperienceDisplay(display.level, display.experience, display.target);
        this.updateMoodBeanCount();
        const game = this.screen ? this.screen.getComponent(ZyxGame) : null;
        if (game) game.refreshInventoryHud();
    }

    /** GM 专用：确保已完成云端建档拿到 token；已有账号时不用服务端旧值覆盖本地 GM 结果。 */
    private async ensureCloudProfileReadyForGm(): Promise<void> {
        if (this.cloudProfileReady) return;
        await cloudService.bootstrap(
            this.profileNameLabel ? this.profileNameLabel.string : '解忧玩家',
            '',
        );
        this.cloudProfileReady = true;
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
        if (resourcePath) this.loadHomeFeatureIcon(iconBase, resourcePath, 70, 0, 2);
        else drawShopBag(iconBase);
        const titleLabel = uimanager.createLabel(entry, title, 0, -44, 24, MOOD_COLORS.cocoa, 108, 32);
        uimanager.applyTypography(titleLabel);
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
        sprite.spriteFrame = getSpriteFrame('home', resourcePath);
        icon.width = iconSize;
        icon.height = iconSize;
    }

    private createHomeMoodScene(centerY: number): void {
        const stage = new cc.Node('homeMoodScene');
        // 演示棋盘与开心豆构成同一条“消除后变成开心豆”的因果链。
        stage.width = 560;
        stage.height = 390;
        stage.setPosition(0, centerY);
        stage.zIndex = 30;
        this.screen.addChild(stage);

        const demoLayer = new cc.Node('homeDemoLayer');
        demoLayer.setAnchorPoint(0.5, 0.5);
        demoLayer.zIndex = 10;
        demoLayer.setPosition(-62, -110);
        demoLayer.scale = 0.8;
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

        // 开心豆收纳位：放大同一位豆伙伴；结算开心豆飞回这里。
        const beanIcon = createMoodBeanMascot(stage, 145, demoLayer.y + boardCenterY * demoLayer.scale, 106);
        beanIcon.zIndex = 60;
        beanIcon.opacity = 0;
        beanIcon.scale = 0.72;
        cc.tween(beanIcon).to(0.34, { scale: 1, opacity: 255 }, { easing: 'backOut' }).start();
        this.homeMoodBeanIcon = beanIcon;

        const demoTip = uimanager.createLabel(demoLayer, '左右挪动 · 收集开心豆', boardCenterX, 105, 20, MOOD_COLORS.cocoaSoft, 280, 28);
        uimanager.applyTypography(demoTip);

        const demoPieces = [leftPiece, rightPiece, movingPiece];
        const demoClock = new cc.Node('homeDemoClock');
        stage.addChild(demoClock);
        this.homeDemoClock = demoClock;
        const resetDemo = (): void => {
            if (!this.homeDemoPlaying) return;
            for (const child of demoLayer.children.slice()) {
                if (child.name.indexOf('homeDemoTransient') === 0) child.destroy();
            }
            // 不碰真实数值：示意只播手势，真实进度由结算/GM/云端驱动。
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
            this.playHomeMoodFlight(demoLayer, beanIcon, leftPiece, 8, 0);
            this.playHomeMoodFlight(demoLayer, beanIcon, movingPiece, 1, 1);
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

    /** 结算开心豆回流期间隐藏示意层并停表；结束后淡入再恢复循环。 */
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
     * 首页示意：心情块消除后变成开心豆，飞入开心豆收纳位。
     * 纯视觉，不调用进度写入；真实数据只在对局结算 / GM / 云端同步更新。
     */
    private playHomeMoodFlight(
        stage: cc.Node,
        beanIcon: cc.Node,
        piece: cc.Node,
        moodIndex: number,
        order: number,
    ): void {
        const start = new cc.Vec2(piece.x + piece.width / 2 - 22, piece.y);
        // 棋盘层有位移和0.8倍缩放，终点必须转换到碎片所在层，不能直接使用豆子的父层坐标。
        const target = stage.convertToNodeSpaceAR(beanIcon.convertToWorldSpaceAR(cc.v2(0, 4)));
        const control = new cc.Vec2((start.x + target.x) / 2, Math.max(start.y, target.y) + 88 + order * 10);
        const token = createMoodBean(stage, moodIndex, start.x, start.y, 36, 0);
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
                    if (state.t > 0.9) {
                        token.opacity = Math.floor(255 * (1 - (state.t - 0.9) / 0.1));
                    }
                },
            })
            .call(() => {
                if (cc.isValid(token)) token.destroy();
                if (!cc.isValid(beanIcon)) return;
                cc.Tween.stopAllByTarget(beanIcon);
                beanIcon.angle = 0;
                cc.tween(beanIcon)
                    .to(0.1, { angle: -9, scale: 1.05 }, { easing: 'sineOut' })
                    .to(0.16, { angle: 8, scale: 1.02 }, { easing: 'sineInOut' })
                    .to(0.14, { angle: -4, scale: 1 }, { easing: 'sineInOut' })
                    .to(0.12, { angle: 0 }, { easing: 'sineOut' })
                    .start();
                this.spawnHomeDemoBeanSparkles(stage, beanIcon, moodIndex, order);
            })
            .start();
    }

    /** 收纳位附近的示意彩点；纯表现，不改任何数值。 */
    private spawnHomeDemoBeanSparkles(
        stage: cc.Node,
        beanIcon: cc.Node,
        moodIndex: number,
        order: number,
    ): void {
        const color = getMoodColor(moodIndex);
        const target = stage.convertToNodeSpaceAR(beanIcon.convertToWorldSpaceAR(cc.v2(0, 18)));
        for (let index = 0; index < 3; index++) {
            const spark = uimanager.createCircle(
                stage,
                `homeDemoTransientSplash_${order}_${index}`,
                4 + index,
                new cc.Color(color.r, color.g, color.b, 210),
                target.x + (index - 1) * 8,
                target.y,
            );
            spark.zIndex = 35;
            cc.tween(spark)
                .to(0.26, {
                    x: spark.x + (index - 1) * 10,
                    y: target.y + 18 + index * 3,
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
        const panelX = 0;
        uimanager.createRect(this.screen, 'profileShadow', 674, 128, new cc.Color(78, 53, 46), 32, 28, panelX, panelY - 5);
        const panel = uimanager.createRect(this.screen, 'profileCard', 666, 122, new cc.Color(255, 249, 232), 246, 26, panelX, panelY);

        const avatarX = -274;
        const avatarFrame = createAvatarFrame(panel, 'avatarRoundedFrame', avatarX, 0, 92);
        avatarFrame.zIndex = 10;

        const avatarMask = new cc.Node('avatarMask');
        avatarMask.width = 68;
        avatarMask.height = 64;
        avatarMask.setPosition(avatarX, 0);
        avatarMask.zIndex = 20;
        panel.addChild(avatarMask);
        applyRoundedAvatarMask(avatarMask);

        this.profileAvatarContent = new cc.Node('avatarContent');
        this.profileAvatarContent.width = 68;
        this.profileAvatarContent.height = 64;
        avatarMask.addChild(this.profileAvatarContent);
        this.drawDefaultAvatar();
        this.profileAvatarUrl = '';
        const avatarTouch = uimanager.createRect(panel, 'avatarTouch', 104, 104, cc.Color.WHITE, 0, 22, avatarX, 0);
        avatarTouch.zIndex = 30;
        avatarTouch.addComponent(cc.Button);
        const avatarNodes = [avatarFrame, avatarMask];
        const restoreAvatar = (): void => avatarNodes.forEach((node) => {
            cc.Tween.stopAllByTarget(node);
            cc.tween(node).to(0.1, { scale: 1 }).start();
        });
        avatarTouch.on(cc.Node.EventType.TOUCH_START, () => avatarNodes.forEach((node) => {
            cc.Tween.stopAllByTarget(node);
            cc.tween(node).to(0.07, { scale: 0.92 }).start();
        }), this);
        avatarTouch.on(cc.Node.EventType.TOUCH_END, () => {
            restoreAvatar();
            this.showUserProfileModal();
        }, this);
        avatarTouch.on(cc.Node.EventType.TOUCH_CANCEL, restoreAvatar, this);

        this.profileNameLabel = uimanager.createLabel(panel, '解忧玩家', -210, 22, 28, MOOD_COLORS.cocoa, 200, 36);
        this.profileNameLabel.node.name = 'profileNickname';
        this.profileNameLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        this.profileNameLabel.node.setAnchorPoint(0, 0.5);
        this.profileNameLabel.node.setPosition(-210, 22);
        this.profileNameLabel.enableWrapText = false;

        // R2：首页等级与经验按展示口径渲染（服务端确认基准 + 剩余 pending 推算值）。
        const displayProgress = zyxGameModule.getDisplayLevelAndExperience();
        const target = displayProgress.target;
        const ratio = Math.max(0, Math.min(1, displayProgress.experience / target));
        const trackWidth = this.profileExperienceTrackWidth;
        const trackX = -19;
        const trackY = -28;
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
            `经验 ${displayProgress.experience}/${target}`,
            -18,
            trackY,
            16,
            cc.Color.WHITE,
            190,
            25,
        );
        uimanager.applyTypography(this.profileExperienceLabel);
        const levelBadge = uimanager.createRect(panel, 'levelBadge', 72, 34, MOOD_COLORS.cocoa, 255, 11, -181, trackY);
        levelBadge.zIndex = 12;
        this.profileLevelLabel = uimanager.createLabel(levelBadge, `Lv.${displayProgress.level}`, 0, 0, 17, cc.Color.WHITE, 66, 28);

        if (this.currentCloudProfile) {
            this.profileNameLabel.string = formatDisplayNickname(this.currentCloudProfile.nickname);
            uimanager.applyTypography(this.profileNameLabel);
            this.renderProfileAvatar(this.profileAvatarContent, this.currentCloudProfile.avatarUrl || '');
        }
        return panel;
    }

    private drawDefaultAvatar(content: cc.Node = this.profileAvatarContent, width: number = 68, height: number = 64): void {
        if (!content || !cc.isValid(content)) return;
        content.removeAllChildren();
        const avatar = createMoodBeanMascot(content, 0, -2, Math.min(width, height) * 0.92);
        avatar.name = 'defaultAvatar';
    }

    private renderProfileAvatar(content: cc.Node, avatarUrl: string, width: number = 68, height: number = 64): void {
        if (!content || !cc.isValid(content)) return;
        if (content === this.profileAvatarContent) this.profileAvatarUrl = avatarUrl;
        this.drawDefaultAvatar(content, width, height);
        if (!avatarUrl) return;
        loadRemoteTexture(avatarUrl).then((texture) => {
            if (!cc.isValid(content)) return;
            if (content === this.profileAvatarContent && this.profileAvatarUrl !== avatarUrl) return;
            content.removeAllChildren();
            const spriteNode = new cc.Node('wechatAvatar');
            content.addChild(spriteNode);
            const sprite = spriteNode.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = new cc.SpriteFrame(texture);
            uimanager.fitSpriteFrameInside(spriteNode, sprite.spriteFrame, width, height);
        }).catch(() => undefined);
    }

    /** 授权必须由按钮点击直接进入；成功写回服务端后才替换游戏内资料。 */
    private async authorizeWeChatProfile(force: boolean = true): Promise<CloudProfile> {
        const current = this.currentCloudProfile;
        if (!force && current && hasWeChatProfileAuthorization(current.playerId, current.avatarUrl)) return current;
        if (this.profileAuthorizationInFlight) return null;
        this.profileAuthorizationInFlight = true;
        let failureStage = '微信授权';
        try {
            const wechatProfile = await requestWeChatUserProfile(() => uimanager.showWeChatAuthorizationSheet());
            failureStage = '保存微信资料';
            const profile = await cloudService.updateWeChatProfile(wechatProfile.nickName, wechatProfile.avatarUrl);
            this.applyCloudProfile(profile);
            rememberWeChatProfileAuthorization(profile.playerId);
            uimanager.showToast('授权成功，昵称和头像已更新');
            return profile;
        } catch (error) {
            const detail = error && (error as any).message ? (error as any).message : String(error || '未知错误');
            // 正式构建可能裁剪 cc.warn；console.error 与原生弹窗确保真实错误始终可见。
            if (typeof console !== 'undefined' && typeof console.error === 'function') {
                console.error(`[${failureStage}失败]`, error);
            }
            const wxApi = getWxApi();
            if (wxApi && typeof wxApi.showModal === 'function') {
                wxApi.showModal({
                    title: `${failureStage}失败`,
                    content: detail,
                    showCancel: false,
                    confirmText: '知道了',
                });
            } else {
                uimanager.showToast(`${failureStage}失败：${detail}`);
            }
            return null;
        } finally {
            this.profileAuthorizationInFlight = false;
        }
    }

    private async showUserProfileModal(): Promise<void> {
        await this.bootstrapCloudProfile();
        const profile = this.currentCloudProfile;
        const nickname = formatDisplayNickname(profile ? profile.nickname : (this.profileNameLabel ? this.profileNameLabel.string : '解忧玩家'));
        const avatarUrl = profile ? profile.avatarUrl : '';
        uimanager.showModal(
            '用户信息',
            '',
            [
                {
                    text: '修改',
                    color: BUTTON_COLORS.yellow,
                    closeOnClick: false,
                    onClick: () => {
                        this.authorizeWeChatProfile().then((updated) => {
                            if (updated) this.showUserProfileModal();
                        });
                    },
                },
                { text: '关闭', color: BUTTON_COLORS.green, onClick: () => undefined },
            ],
            (panel, centerY) => {
                createAvatarFrame(panel, 'profileModalAvatarFrame', 0, centerY + 40, 136);
                const maskNode = new cc.Node('profileModalAvatarMask');
                maskNode.width = 112;
                maskNode.height = 112;
                maskNode.setPosition(0, centerY + 40);
                panel.addChild(maskNode);
                applyRoundedAvatarMask(maskNode);
                const content = new cc.Node('profileModalAvatar');
                content.width = 112;
                content.height = 112;
                maskNode.addChild(content);
                this.renderProfileAvatar(content, avatarUrl || '', 112, 112);
                const name = uimanager.createLabel(panel, nickname, 0, centerY - 48, 28, MOOD_COLORS.cocoa, 420, 48);
                uimanager.applyTypography(name);
            },
            220,
            false,
            true,
        );
    }

    private createHomeRotatingTip(centerY: number): void {
        const pill = uimanager.createRect(this.screen, 'homeTipPill', 600, 56, new cc.Color(255, 249, 232), 230, 28, 0, centerY);
        const tips = [
            '左右拖动心情块，让它落进合适的位置',
            '填满一整行，就能把烦恼轻轻消掉',
            '消除带表情的心情块，收集开心豆',
            '挑战更高分，看看能排第几名',
        ];
        let index = 0;
        const label = uimanager.createLabel(pill, tips[index], 0, 0, 23, new cc.Color(45, 42, 39), 568, 40);
        uimanager.applyTypography(label);
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
        labelNode.active = false;
        const art = new cc.Node('startWordmark');
        this.startButton.addChild(art);
        art.zIndex = 80; art.setPosition(0, 4);
        const sprite = art.addComponent(cc.Sprite);
        sprite.spriteFrame = getSpriteFrame('home', ASSET_PATHS.home.startWordmark);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        uimanager.fitSpriteFrameInside(art, sprite.spriteFrame, 270, 112);

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
        const frame = getSpriteFrame('home', ASSET_PATHS.home.guideHand);
        sprite.spriteFrame = frame;
        uimanager.fitSpriteFrameInside(node, frame, 128, 128);
        return node;
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
        const roundId = this.activeRoundId;
        this.activeRoundId = '';
        if (request.restart) {
            delete this.settlementReceipts[roundId];
            this.startGame().then((started) => { if (!started) this.enterHome(); });
            return;
        }
        this.pendingSettlementPresentation = { roundId, request };
        this.enterHome(() => {
            this.tryPresentConfirmedSettlement();
            if (this.pendingSettlementPresentation) {
                uimanager.showToast('本局收集已保存，实际奖励待云端确认');
            }
        });
    }

    private tryPresentConfirmedSettlement(): void {
        const pending = this.pendingSettlementPresentation;
        if (!pending || !this.screen || this.screen.name !== 'home') return;
        const receipt = this.settlementReceipts[pending.roundId];
        if (!receipt || !receipt.settlement || !receipt.settlement.profile) return;
        delete this.settlementReceipts[pending.roundId];
        this.pendingSettlementPresentation = null;
        const remote = receipt.settlement;
        const profile = this.currentCloudProfile || remote.profile;
        const confirmedRequest: SettlementExitRequest = {
            restart: false,
            settlement: {
                ...pending.request.settlement,
                roundEarnedMoodBeans: remote.awardedMoodBeans,
                gainedExperience: remote.gainedExperience,
                moodBeanBalanceBefore: Math.max(0, profile.moodBeanBalance - remote.awardedMoodBeans),
                moodBeanBalanceAfter: profile.moodBeanBalance,
                levelAfter: profile.level,
                experienceAfter: profile.experience,
                experienceTargetAfter: zyxGameModule.getExperienceTargetForLevel(profile.level),
            },
        };
        this.playSettlementRewardReturn(confirmedRequest, () => {
            // 服务端确认后，展示真正到账的本局收集奖励。
        });
    }

    /** 服务端确认后，仅演出开心豆回流；等级经验保持当前权威档案值。 */
    private playSettlementRewardReturn(request: SettlementExitRequest, onComplete: () => void): void {
        const settlement = request.settlement;
        if (!this.screen || !cc.isValid(this.screen)) { onComplete(); return; }
        const earned = settlement.roundEarnedMoodBeans;
        if (earned <= 0) { onComplete(); return; }
        this.setHomeDemoActive(false);
        const balanceEnd = zyxGameModule.getDisplayMoodBeanBalance();
        const balanceStart = Math.max(0, balanceEnd - earned);
        this.layoutMoodBeanCountBadge(balanceStart);
        const rewardLayer = new cc.Node('settlementRewardReturn');
        rewardLayer.setContentSize(this.screen.width, this.screen.height);
        rewardLayer.addComponent(cc.BlockInputEvents);
        rewardLayer.zIndex = 2600;
        this.screen.addChild(rewardLayer);
        const veil = uimanager.createRect(rewardLayer, 'rewardSoftVeil', rewardLayer.width, rewardLayer.height, new cc.Color(72, 53, 47), 0);
        veil.zIndex = -2;
        cc.tween(veil).to(0.16, { opacity: 58 }).delay(0.78).to(0.38, { opacity: 0 }).start();
        const target = this.getNodePositionInScreen(this.homeMoodBeanIcon);
        const count = Math.min(16, Math.max(4, 3 + Math.ceil(Math.sqrt(earned) * 1.6)));
        let arrivals = 0;
        let seed = Math.max(1, settlement.roundScore * 31 + earned * 17);
        const random = (): number => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
        for (let index = 0; index < count; index++) {
            const token = createMoodBean(rewardLayer, 1 + index % 6, -235 + random() * 470, -70 + random() * 330, 38 + random() * 11, 0);
            token.scale = 0.35;
            token.angle = 18 - random() * 36;
            this.animateRewardToken(token, target, 0.04 + index * 0.03 + random() * 0.08, random, () => {
                arrivals++;
                const shown = balanceStart + Math.round((balanceEnd - balanceStart) * arrivals / count);
                this.layoutMoodBeanCountBadge(shown);
                this.pulseRewardTarget(this.homeMoodBeanIcon);
                if (arrivals === count) {
                    rewardLayer.destroy();
                    // 动画过程中可能收到补传/兑换回执，结束时重新读取当前余额。
                    this.updateMoodBeanCount();
                    this.setHomeDemoActive(true);
                    onComplete();
                }
            });
        }
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

    private async startGame(profileBootstrapHandled: boolean = false, replacement: ActiveRound | 'current' = null, knownActive?: ActiveRound): Promise<boolean> {
        if (this.gameAssetsLoading) return false;
        this.gameAssetsLoading = true;
        try {
            if (!profileBootstrapHandled || !this.cloudProfileReady) await this.bootstrapCloudProfile();
            if (!this.cloudProfileReady) { uimanager.showToast('需要联网确认进度后才能开始'); return false; }
            let active = knownActive === undefined ? await cloudService.getActiveRound() : knownActive;
            if (active && zyxGameModule.getPendingRoundSettlements().some(record => record.roundId === active.roundId)) {
                await this.flushPendingRoundSettlements();
                active = await cloudService.getActiveRound();
                if (active && zyxGameModule.getPendingRoundSettlements().some(record => record.roundId === active.roundId)) {
                    uimanager.showToast('上一局结果正在同步，请联网后重试'); return false;
                }
            }
            if (active && replacement === 'current' && (active.roundId !== this.activeRoundId || !roundProgress.token)) {
                uimanager.showToast('这局状态已更新，请返回首页确认最新进度'); return false;
            }
            if (active && replacement && replacement !== 'current'
                && (active.roundId !== replacement.roundId || active.generation !== replacement.generation)) {
                uimanager.showToast('进度刚刚更新，请再次点击开始确认'); return false;
            }
            if (active && !replacement) {
                this.gameAssetsLoading = false;
                await this.resumeSavedRound(active);
                return !!this.screen && this.screen.name === 'game';
            }
            if (this.stamina && this.getStaminaPreview().current < 1
                && !cc.sys.localStorage.getItem(PENDING_START_ROUND_ID_KEY)) {
                this.showStaminaEmptyModal();
                return false;
            }
            // 队列满时先补传，避免新局结束后无法持久化结算记录。
            if (!zyxGameModule.canAcceptPendingRoundSettlement()) {
                uimanager.showToast('正在同步进度…');
                await this.flushPendingRoundSettlements();
                if (!zyxGameModule.canAcceptPendingRoundSettlement()) {
                    uimanager.showToast('需要联网同步进度后继续');
                    return false;
                }
            }
            if (!isFeatureReady('game')) uimanager.showToast('正在加载消除资源…');
            try {
                await prepareFeature('game');
            } catch (error) {
                uimanager.showToast('消除资源加载失败，请检查网络后重试');
                return false;
            }
            const storage = cc.sys.localStorage;
            let roundId = storage.getItem(PENDING_START_ROUND_ID_KEY) || '';
            if (!/^round_[a-z0-9_]{8,80}$/.test(roundId)) {
                roundId = `round_${Date.now()}_${Math.floor(Math.random() * 1000000000).toString(36)}`;
                storage.setItem(PENDING_START_ROUND_ID_KEY, roundId);
            }
            let started;
            try {
                // 明确选择重开但本机没有租约时，先取得当前云端租约，再原子替换。
                if (active && (roundProgress.roundId !== active.roundId || !roundProgress.token)) {
                    active = await roundProgress.resume(active, true);
                }
                started = await cloudService.startRound(roundId, active ? { replaceRoundId: active.roundId,
                    replacementGeneration: active.generation,
                    replaceSessionToken: roundProgress.roundId === active.roundId ? roundProgress.token : undefined } : undefined);
            } catch (error) {
                if (error && (error as any).stamina) this.applyStaminaState((error as any).stamina);
                if (error && (error as any).businessCode === 'ROUND_RESUME_REQUIRED') {
                    storage.removeItem(PENDING_START_ROUND_ID_KEY);
                    this.gameAssetsLoading = false;
                    const saved = await cloudService.getActiveRound();
                    if (saved) { await this.resumeSavedRound(saved); return !!this.screen && this.screen.name === 'game'; }
                } else if (error && (error as any).businessCode === 'STAMINA_EMPTY') {
                    this.showStaminaEmptyModal();
                } else if (error && ((error as any).businessCode === 'BOARD_RULES_UNSUPPORTED'
                    || (error as any).businessCode === 'ROUND_COLLECTION_RULE_CONFLICT'
                    || (error as any).businessCode === 'ROUND_ALREADY_SETTLED')) {
                    // 旧版未完成的开局凭证不能切换规则；清除待开局标记，允许下一次申请新局。
                    storage.removeItem(PENDING_START_ROUND_ID_KEY);
                    uimanager.showToast('对局状态已更新，请重新开始');
                } else if (error && (error as any).businessCode === 'COLLECTION_RULE_UNSUPPORTED') {
                    uimanager.showToast((error as Error).message);
                } else {
                    uimanager.showToast('开局校验失败，请联网后重试');
                }
                return false;
            }
            if (!started || started.roundId !== roundId) {
                uimanager.showToast('开局校验失败，请重试');
                return false;
            }
            roundProgress.begin(started, this.currentCloudProfile.playerId);
            this.applyStaminaState(started.stamina);
            this.activeRoundId = roundId;
            zyxGameModule.cloudRoundId = roundId;
            if (started.profile) this.applyCloudProfile(started.profile);
            // 开局配置必须在 resetRound 前登记，由 resetRound 在生成棋盘前一次性消费。
            if (started.seed) zyxGameModule.setRoundSeed(started.seed, started.isTutorial === true, started.heartRescueEligible === true);
            await this.playStartStaminaFlight();
            if (this.pendingSettlementPresentation) {
                delete this.settlementReceipts[this.pendingSettlementPresentation.roundId];
                this.pendingSettlementPresentation = null;
            }
            this.replaceScreen('game');
            const game = this.screen.addComponent(ZyxGame);
            game.initialize(
                (request) => this.handleSettlementExit(request),
                (settlement, startedAt) => this.submitSettlementToCloud(settlement, startedAt),
                () => this.startGame(false, 'current'),
                this.currentCloudProfile,
                null, () => this.enterHome(),
            );
            storage.removeItem(PENDING_START_ROUND_ID_KEY);
            return true;
        } catch (error) {
            cc.error('开局失败', error);
            uimanager.showToast('开局失败，请重试');
            return false;
        } finally {
            this.gameAssetsLoading = false;
        }
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
        if (this.homeFriendRanking) postFriendMessage('friends:hide');
        this.homeFriendRanking = null;
        audioManager.enterScene(name === 'home' ? 'home' : name === 'game' ? 'game' : 'silent');
        if (this.screen && this.screen.isValid) {
            this.stopScreenTweens(this.screen);
            this.screen.destroy();
        }
        this.profileNameLabel = null;
        this.profileAvatarContent = null;
        this.profileLevelLabel = null;
        this.profileExperienceFill = null;
        this.profileExperienceLabel = null;
        this.homeMoodBeanIcon = null;
        this.homeDemoLayer = null;
        this.homeDemoClock = null;
        this.homeDemoPlaying = false;
        this.startHomeDemoLoop = null;
        this.startButton = null;
        this.startStaminaRecoveryLabel = null;
        this.staminaLabel = null;
        this.staminaRecoveryLabel = null;
        this.staminaIcon = null;
        this.moodBeanCountLabel = null;
        this.moodBeanCountCard = null;
        this.screen = new cc.Node(name);
        this.screen.setAnchorPoint(0.5, 0.5);
        this.node.addChild(this.screen);
        this.applyStageLayout(this.screen);
        this.renderBackdrop(name);
        uimanager.init(this.screen);

    }
}
