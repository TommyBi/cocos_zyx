import { BUTTON_COLORS, uimanager } from './manager/Uimanager';
import { DAILY_WISH_TARGET, zyxGameModule } from './dataModule/ZyxGameModule';
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
    setWishBottleProgressImmediately,
    updateWishBottleProgress,
} from './zyxGame/MoodArt';

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
    private nativeWeChatProfileButton: any = null;
    private homeMoodBottle: cc.Node = null;
    private homeMoodCountLabel: cc.Label = null;
    private startButton: cc.Node = null;
    private calendarPanel: cc.Node = null;
    private calendarWeekContent: cc.Node = null;
    private calendarWeekOffset: number = 0;

    public onLoad(): void {
        uimanager.init(this.node);
        cc.debug.setDisplayStats(false);
        const canvas = this.node.getComponent(cc.Canvas);
        const frame = cc.view.getFrameSize();
        if (canvas && frame.width > frame.height) {
            // 桌面横屏预览继续固定高度；微信竖屏按场景默认配置固定宽度，避免窄屏横向裁切。
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }
    }

    public start(): void {
        const search = typeof window !== 'undefined'
            && window.location
            && typeof window.location.search === 'string'
            ? window.location.search
            : '';
        if (search.indexOf('autostart=1') >= 0) {
            this.startGame();
            return;
        }
        this.showHome();
    }

    public onDestroy(): void {
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
        const titleY = 438 + Math.max(-24, Math.min(64, heightDelta * 0.2));
        const moodSceneY = 218 + Math.max(-18, Math.min(42, heightDelta * 0.12));
        const calendarY = -156 - Math.max(-10, Math.min(20, heightDelta * 0.05));
        const tipY = -334 - Math.max(-12, Math.min(28, heightDelta * 0.08));
        const startY = -414 - Math.max(-16, Math.min(38, heightDelta * 0.1));
        const profileY = height / 2 - Math.max(32, safeArea.top) - 65;

        createMoodCanvasBackground(this.screen, width, height);
        createMoodWatermarkWall(this.screen, width, height);
        this.calendarWeekOffset = 0;
        this.createHomeProfile(profileY);

        const title = uimanager.createLabel(this.screen, '烦恼排排消', 0, titleY, 66, MOOD_COLORS.cocoa, 640, 96);
        this.makeCartoonBold(title, MOOD_COLORS.cocoa, 1.2);
        this.createHomeMoodScene(moodSceneY);
        this.createCalendarPreview(calendarY);
        this.createHomeRotatingTip(tipY);

        this.startButton = uimanager.createButton(
            this.screen,
            '开始消除',
            0,
            startY,
            440,
            88,
            BUTTON_COLORS.green,
            () => this.startGame(),
            34,
        );
        this.createStartButtonGuide();
    }

    private createHomeMoodScene(centerY: number): void {
        const stage = new cc.Node('homeMoodScene');
        stage.width = 560;
        stage.height = 270;
        stage.setPosition(0, centerY);
        stage.zIndex = 30;
        this.screen.addChild(stage);

        const cellSize = 46;
        const boardLeft = -211;
        const bottomY = -5;
        const upperY = 43;
        const boardCenterX = boardLeft + cellSize * 3;
        uimanager.createRect(stage, 'homeDemoBoardShadow', cellSize * 6 + 16, cellSize * 2 + 16, new cc.Color(78, 53, 46), 34, 18, boardCenterX, 16);
        uimanager.createRect(stage, 'homeDemoBoard', cellSize * 6 + 12, cellSize * 2 + 12, new cc.Color(102, 75, 65), 226, 17, boardCenterX, 20);
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 6; col++) {
                uimanager.createRect(
                    stage,
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

        const leftPiece = this.createHomeDemoPiece(stage, 8, 2, cellSize, boardLeft, 0, bottomY, true);
        const rightPiece = this.createHomeDemoPiece(stage, 6, 2, cellSize, boardLeft, 4, bottomY, false);
        const movingPiece = this.createHomeDemoPiece(stage, 1, 2, cellSize, boardLeft, 3, upperY, true);
        const movingStartX = movingPiece.x;
        const movingTargetX = boardLeft + (2 + 1) * cellSize;
        const hand = this.createHomeDemoHand(stage, movingStartX, upperY + 42);

        const softGlow = uimanager.createCircle(stage, 'sceneGlow', 62, new cc.Color(255, 236, 170, 48), 210, 18);
        softGlow.zIndex = -1;
        cc.tween(softGlow)
            .repeatForever(cc.tween().to(1.8, { scale: 1.06 }).to(1.8, { scale: 0.94 }))
            .start();

        const bottle = createWishBottle(
            stage,
            145,
            18,
            zyxGameModule.dailyMoodCount,
            DAILY_WISH_TARGET,
            0.62,
        );
        bottle.opacity = 0;
        bottle.scale = 0.5;
        cc.tween(bottle).to(0.34, { scale: 0.62, opacity: 255 }, { easing: 'backOut' }).start();
        this.homeMoodBottle = bottle;

        uimanager.createLabel(stage, '左右挪动 · 下落成行', boardCenterX, -89, 17, MOOD_COLORS.cocoaSoft, 280, 28);
        uimanager.createLabel(stage, '今日表情瓶', 145, -94, 17, MOOD_COLORS.cocoaSoft, 130, 28);
        this.homeMoodCountLabel = uimanager.createLabel(
            stage,
            `${zyxGameModule.dailyMoodCount}/${DAILY_WISH_TARGET}`,
            145,
            -119,
            20,
            MOOD_COLORS.cocoa,
            128,
            30,
        );

        const demoPieces = [leftPiece, rightPiece, movingPiece];
        const resetDemo = (): void => {
            for (const child of stage.children.slice()) {
                if (child.name.indexOf('homeDemoTransient') === 0) child.destroy();
            }
            updateWishBottleProgress(bottle, zyxGameModule.dailyMoodCount, DAILY_WISH_TARGET);
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
            cc.tween(movingPiece).to(0.44, { y: bottomY }, { easing: 'quadIn' }).start();
            cc.tween(hand).to(0.25, { opacity: 0, y: upperY + 56 }, { easing: 'quadOut' }).start();
        };
        const playClear = (): void => this.playHomeDemoClear(stage, demoPieces, boardCenterX, bottomY, cellSize);
        const playCollect = (): void => {
            this.playHomeMoodFlight(stage, bottle, leftPiece, 8, 0);
            this.playHomeMoodFlight(stage, bottle, movingPiece, 1, 1);
        };
        resetDemo();
        cc.tween(stage)
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
        node.width = size * cellSize - 4;
        node.height = cellSize - 4;
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
                    rotation: (index - 2) * 48,
                    opacity: 0,
                    scale: 0.5,
                }, { easing: 'quadIn' })
                .call(() => shard.destroy())
                .start();
        }
    }

    private playHomeMoodFlight(
        stage: cc.Node,
        bottle: cc.Node,
        piece: cc.Node,
        moodIndex: number,
        order: number,
    ): void {
        const start = new cc.Vec2(piece.x + piece.width / 2 - 22, piece.y);
        const target = new cc.Vec2(bottle.x, bottle.y + 8);
        const control = new cc.Vec2((start.x + target.x) / 2, Math.max(start.y, target.y) + 105 + order * 12);
        const token = createMoodToken(stage, moodIndex, start.x, start.y, 30, 0);
        token.name = `homeDemoTransientMood_${order}`;
        token.zIndex = 120;
        const state = { t: 0 };
        const delay = order * 0.2;
        cc.tween(token).delay(delay).to(0.12, { opacity: 255, scale: 1.1 }, { easing: 'backOut' }).start();
        cc.tween(state)
            .delay(delay + 0.04)
            .to(0.94, { t: 1 }, {
                easing: 'quadIn',
                onUpdate: () => {
                    if (!cc.isValid(token)) return;
                    const inverse = 1 - state.t;
                    token.x = inverse * inverse * start.x + 2 * inverse * state.t * control.x + state.t * state.t * target.x;
                    token.y = inverse * inverse * start.y + 2 * inverse * state.t * control.y + state.t * state.t * target.y;
                    token.scale = 1.1 - state.t * 0.48;
                    token.rotation = state.t * 180;
                },
            })
            .call(() => {
                if (!cc.isValid(bottle)) return;
                updateWishBottleProgress(
                    bottle,
                    zyxGameModule.dailyMoodCount + order + 1,
                    DAILY_WISH_TARGET,
                );
                playBottleBurp(bottle);
                if (cc.isValid(token)) token.destroy();
            })
            .start();
    }

    private createHomeProfile(panelY: number): void {
        const panelX = -128;
        uimanager.createRect(this.screen, 'profileShadow', 352, 106, new cc.Color(78, 53, 46), 32, 28, panelX, panelY - 5);
        const panel = uimanager.createRect(this.screen, 'profileCard', 346, 102, new cc.Color(255, 249, 232), 244, 26, panelX, panelY);

        uimanager.createCircle(panel, 'avatarBorder', 39, MOOD_COLORS.cocoaSoft, -126, 1);
        const avatarMask = new cc.Node('avatarMask');
        avatarMask.width = 68;
        avatarMask.height = 68;
        avatarMask.setPosition(-126, 1);
        avatarMask.zIndex = 20;
        panel.addChild(avatarMask);
        const mask = avatarMask.addComponent(cc.Mask);
        mask.type = cc.Mask.Type.ELLIPSE;
        mask.segments = 48;

        this.profileAvatarContent = new cc.Node('avatarContent');
        this.profileAvatarContent.width = 68;
        this.profileAvatarContent.height = 68;
        avatarMask.addChild(this.profileAvatarContent);
        this.drawDefaultAvatar();

        const avatarHit = new cc.Node('avatarAuthorizationButton');
        avatarHit.width = 78;
        avatarHit.height = 78;
        avatarHit.setPosition(-126, 1);
        avatarHit.zIndex = 60;
        avatarHit.addComponent(cc.Button);
        panel.addChild(avatarHit);
        avatarHit.on(cc.Node.EventType.TOUCH_END, () => this.requestWeChatProfile(), this);

        this.profileNameLabel = uimanager.createLabel(panel, '顺心朋友', -58, 29, 22, MOOD_COLORS.cocoa, 146, 32);
        this.profileNameLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        this.profileNameLabel.node.setAnchorPoint(0, 0.5);
        this.profileNameLabel.node.setPosition(-58, 29);

        this.profileAuthorizationButton = uimanager.createButton(
            panel,
            '授权',
            126,
            29,
            72,
            34,
            BUTTON_COLORS.green,
            () => this.requestWeChatProfile(),
            15,
        );
        this.profileAuthorizationButton.name = 'profileAuthorizationButton';

        const levelBadge = uimanager.createRect(panel, 'levelBadge', 58, 30, MOOD_COLORS.cocoa, 255, 9, -29, -27);
        this.profileLevelLabel = uimanager.createLabel(levelBadge, `Lv.${zyxGameModule.level}`, 0, 0, 16, cc.Color.WHITE, 54, 26);
        const target = zyxGameModule.getExperienceTarget();
        const ratio = Math.max(0, Math.min(1, zyxGameModule.experience / target));
        uimanager.createRect(panel, 'experienceTrack', 164, 24, new cc.Color(87, 79, 72), 210, 8, 84, -27);
        const fillWidth = Math.max(8, 156 * ratio);
        this.profileExperienceFill = uimanager.createRect(panel, 'experienceFill', fillWidth, 16, MOOD_COLORS.sage, 255, 6, 6 + fillWidth / 2, -27);
        this.profileExperienceLabel = uimanager.createLabel(
            panel,
            `经验 ${zyxGameModule.experience}/${target}`,
            84,
            -27,
            13,
            cc.Color.WHITE,
            154,
            22,
        );
        this.makeCartoonBold(this.profileExperienceLabel, new cc.Color(65, 58, 53), 0.7);

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
        this.configureWeChatProfileAccess(panelX + 126, panelY + 29, 72, 34, hasCachedProfile);
    }

    private drawDefaultAvatar(): void {
        if (!this.profileAvatarContent || !cc.isValid(this.profileAvatarContent)) return;
        this.profileAvatarContent.removeAllChildren();
        const avatar = new cc.Node('defaultAvatar');
        avatar.width = 68;
        avatar.height = 68;
        this.profileAvatarContent.addChild(avatar);
        const g = avatar.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(246, 197, 95);
        g.circle(0, 0, 36);
        g.fill();
        g.fillColor = new cc.Color(255, 239, 190);
        g.circle(0, -4, 25);
        g.fill();
        g.fillColor = MOOD_COLORS.cocoa;
        g.circle(-8, 2, 2.2);
        g.circle(8, 2, 2.2);
        g.fill();
        g.strokeColor = MOOD_COLORS.cocoa;
        g.lineWidth = 2;
        g.arc(0, -4, 8, 0.15 * Math.PI, 0.85 * Math.PI, false);
        g.stroke();
        g.fillColor = new cc.Color(239, 151, 105);
        g.ellipse(-14, -5, 6, 3);
        g.ellipse(14, -5, 6, 3);
        g.fill();
        g.fillColor = new cc.Color(255, 226, 125);
        g.moveTo(-16, 23);
        g.lineTo(-5, 15);
        g.lineTo(0, 27);
        g.lineTo(7, 15);
        g.lineTo(17, 23);
        g.lineTo(13, 33);
        g.lineTo(-13, 33);
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
        if (!avatarUrl || !this.profileAvatarContent || !cc.isValid(this.profileAvatarContent)) return;
        const content = this.profileAvatarContent;
        cc.assetManager.loadRemote(avatarUrl, { ext: '.png' }, (error: Error, texture: cc.Texture2D) => {
            if (error || !texture || !cc.isValid(content)) return;
            content.removeAllChildren();
            const spriteNode = new cc.Node('wechatAvatar');
            spriteNode.width = 68;
            spriteNode.height = 68;
            content.addChild(spriteNode);
            const sprite = spriteNode.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = new cc.SpriteFrame(texture);
            spriteNode.width = 68;
            spriteNode.height = 68;
        });
    }

    private createHomeRotatingTip(centerY: number): void {
        const pill = uimanager.createRect(this.screen, 'homeTipPill', 580, 44, new cc.Color(255, 249, 232), 215, 22, 0, centerY);
        const tips = [
            '左右拖动心情块，让它落进合适的位置',
            '填满一整行，就能把烦恼轻轻消掉',
            '带表情的心情块消除后，会飞进今日表情瓶',
            '装满 666 个表情，今天的顺心瓶就会发光',
        ];
        let index = 0;
        const label = uimanager.createLabel(pill, tips[index], 0, 0, 18, new cc.Color(45, 42, 39), 548, 32);
        this.makeCartoonBold(label, new cc.Color(45, 42, 39), 0.55);
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

    /** 首页开始按钮专用的正式指引手素材；不与局内拖拽示意共用。 */
    private createStartGuideHand(parent: cc.Node, x: number, y: number): cc.Node {
        const node = new cc.Node('startGuideHand');
        node.width = 116;
        node.height = 116;
        node.setAnchorPoint(0.5, 0.5);
        node.setPosition(x, y);
        node.zIndex = 180;
        parent.addChild(node);

        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        cc.resources.load('images/formal/start_guide_hand_v2', cc.SpriteFrame, (error: Error, frame: cc.SpriteFrame) => {
            if (error || !frame || !cc.isValid(node)) {
                cc.warn('Start guide hand failed to load', error);
                return;
            }
            sprite.spriteFrame = frame;
            uimanager.fitSpriteFrameInside(node, frame, 116, 116);
        });
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
        this.showHome();
        this.playSettlementRewardReturn(request, () => {
            if (request.restart) this.startGame();
        });
    }

    /** 结算关闭后先回到真实主页，再让两类资源各自飞向经验条与今日表情瓶。 */
    private playSettlementRewardReturn(request: SettlementExitRequest, onComplete: () => void): void {
        const settlement = request.settlement;
        if (!this.screen || !cc.isValid(this.screen)) {
            onComplete();
            return;
        }

        this.updateHomeExperienceDisplay(
            settlement.levelBefore,
            settlement.experienceBefore,
            settlement.experienceTargetBefore,
        );
        if (this.homeMoodBottle) {
            setWishBottleProgressImmediately(
                this.homeMoodBottle,
                settlement.wishProgressBefore,
                DAILY_WISH_TARGET,
            );
        }
        if (this.homeMoodCountLabel) {
            this.homeMoodCountLabel.string = `${settlement.wishProgressBefore}/${DAILY_WISH_TARGET}`;
        }

        if (settlement.roundMoodCount <= 0) {
            this.scheduleOnce(onComplete, request.restart ? 0.45 : 0);
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

        const experienceTarget = this.getNodePositionInScreen(this.profileExperienceFill);
        const moodTarget = this.getNodePositionInScreen(this.homeMoodBottle);
        const visualCount = Math.min(28, Math.max(6, 4 + Math.ceil(Math.sqrt(settlement.roundMoodCount) * 2)));
        const experienceVisualCount = Math.ceil(visualCount / 2);
        const moodVisualCount = visualCount - experienceVisualCount;
        let experienceArrivals = 0;
        let moodArrivals = 0;
        let seed = Math.max(1, settlement.roundScore * 31 + settlement.roundMoodCount * 17);
        const random = (): number => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        for (let index = 0; index < visualCount; index++) {
            const isExperience = index % 2 === 0;
            const resourceIndex = isExperience ? Math.floor(index / 2) : Math.floor(index / 2);
            const scatterX = -235 + random() * 470;
            const scatterY = -70 + random() * 330;
            const size = 38 + random() * 11;
            const token = isExperience
                ? createExperienceToken(rewardLayer, scatterX, scatterY, size, 0)
                : createMoodToken(rewardLayer, 1 + (resourceIndex % 6), scatterX, scatterY, size, 0);
            token.scale = 0.35;
            token.rotation = -18 + random() * 36;
            const target = isExperience ? experienceTarget : moodTarget;
            const delay = 0.04 + index * 0.025 + random() * 0.08;

            this.animateRewardToken(token, target, delay, random, () => {
                if (isExperience) {
                    experienceArrivals++;
                    this.updateExperienceRewardProgress(settlement, experienceArrivals / experienceVisualCount);
                    this.pulseRewardTarget(this.profileExperienceFill);
                } else {
                    moodArrivals++;
                    const ratio = moodArrivals / moodVisualCount;
                    const displayedProgress = settlement.wishProgressBefore
                        + Math.round((settlement.wishProgressAfter - settlement.wishProgressBefore) * ratio);
                    updateWishBottleProgress(this.homeMoodBottle, displayedProgress, DAILY_WISH_TARGET);
                    if (this.homeMoodCountLabel) {
                        this.homeMoodCountLabel.string = `${displayedProgress}/${DAILY_WISH_TARGET}`;
                    }
                    playBottleBurp(this.homeMoodBottle);
                }
            });
        }

        this.scheduleOnce(() => {
            this.updateHomeExperienceDisplay(
                settlement.levelAfter,
                settlement.experienceAfter,
                settlement.experienceTargetAfter,
            );
            if (this.homeMoodBottle) {
                updateWishBottleProgress(this.homeMoodBottle, settlement.wishProgressAfter, DAILY_WISH_TARGET);
            }
            if (this.homeMoodCountLabel) {
                this.homeMoodCountLabel.string = `${settlement.wishProgressAfter}/${DAILY_WISH_TARGET}`;
            }
            if (cc.isValid(rewardLayer)) rewardLayer.destroy();
            onComplete();
        }, 1.86);
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
                    token.rotation += 5.5;
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
        const fillWidth = Math.max(8, 156 * ratio);
        this.profileExperienceFill.width = fillWidth;
        this.profileExperienceFill.x = 6 + fillWidth / 2;
        uimanager.drawRect(this.profileExperienceFill, fillWidth, 16, MOOD_COLORS.sage, 6, 255);
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

    private createCalendarPreview(centerY: number): void {
        uimanager.createRect(this.screen, 'calendarShadow', 636, 232, new cc.Color(83, 57, 48), 28, 25, 0, centerY - 8);
        this.calendarPanel = uimanager.createRect(
            this.screen,
            'calendarPreview',
            630,
            228,
            new cc.Color(255, 249, 232),
            244,
            24,
            0,
            centerY,
        );
        const leftArrow = uimanager.createButton(
            this.calendarPanel,
            '‹',
            -270,
            -5,
            44,
            64,
            BUTTON_COLORS.green,
            () => this.changeCalendarWeek(-1),
            34,
        );
        const rightArrow = uimanager.createButton(
            this.calendarPanel,
            '›',
            270,
            -5,
            44,
            64,
            BUTTON_COLORS.green,
            () => this.changeCalendarWeek(1),
            34,
        );
        leftArrow.name = 'previousWeekButton';
        rightArrow.name = 'nextWeekButton';
        leftArrow.zIndex = 180;
        rightArrow.zIndex = 180;
        this.renderCalendarWeek(0);
    }

    private changeCalendarWeek(offset: number): void {
        this.calendarWeekOffset += offset;
        this.renderCalendarWeek(offset);
    }

    private renderCalendarWeek(direction: number): void {
        if (!this.calendarPanel || !cc.isValid(this.calendarPanel)) return;
        const oldContent = this.calendarWeekContent;
        if (oldContent && cc.isValid(oldContent)) {
            if (direction === 0) oldContent.destroy();
            else {
                cc.tween(oldContent)
                    .to(0.18, { x: -direction * 110, opacity: 0 }, { easing: 'sineIn' })
                    .call(() => oldContent.destroy())
                    .start();
            }
        }

        const dates = this.getCalendarWeekDates(this.calendarWeekOffset);
        const tiers = dates.map((date) => zyxGameModule.getWishTierForDate(date));
        const fullCount = tiers.filter((tier) => tier >= 3).length;
        const fullWeek = fullCount === 7;
        uimanager.drawRect(
            this.calendarPanel,
            630,
            228,
            fullWeek ? new cc.Color(255, 221, 171) : new cc.Color(255, 249, 232),
            24,
            244,
        );

        const content = new cc.Node('calendarWeekContent');
        content.width = 536;
        content.height = 220;
        content.zIndex = 40;
        content.opacity = direction === 0 ? 255 : 0;
        content.x = direction === 0 ? 0 : direction * 110;
        this.calendarPanel.addChild(content);
        this.calendarWeekContent = content;

        if (direction !== 0) {
            cc.tween(content).to(0.2, { x: 0, opacity: 255 }, { easing: 'sineOut' }).start();
        }

        const firstMonth = dates[0].getMonth() + 1;
        const lastMonth = dates[6].getMonth() + 1;
        const monthTitle = firstMonth === lastMonth
            ? `${firstMonth}月顺心瓶`
            : `${firstMonth}月–${lastMonth}月顺心瓶`;
        if (fullWeek) {
            const glowSurface = uimanager.createRect(content, 'fullWeekGlow', 522, 210, new cc.Color(255, 236, 191), 118, 22, 0, 0);
            glowSurface.zIndex = -5;
            const celebration = uimanager.createRect(content, 'fullWeekCelebrationTag', 154, 32, BUTTON_COLORS.red, 255, 12, -188, 82);
            uimanager.createLabel(celebration, '本周万事大吉', 0, 0, 15, cc.Color.WHITE, 142, 26);
            uimanager.createLabel(content, monthTitle, 4, 82, 22, MOOD_COLORS.cocoa, 180, 34);
            uimanager.createLabel(content, '7/7 瓶已装满', 190, 82, 15, MOOD_COLORS.cocoaSoft, 126, 28);
        } else {
            uimanager.createLabel(content, monthTitle, -178, 82, 24, MOOD_COLORS.cocoa, 190, 36);
            uimanager.createLabel(content, `本周已装满 ${fullCount}/7 瓶`, 125, 82, 17, MOOD_COLORS.cocoaSoft, 230, 32);
        }

        const nowKey = this.getDateKey(new Date());
        const weekNames = ['一', '二', '三', '四', '五', '六', '日'];
        dates.forEach((date, index) => {
            const key = this.getDateKey(date);
            const tier = tiers[index];
            const isFull = tier >= 3;
            const isToday = key === nowKey;
            const isClaimed = isFull && zyxGameModule.isFullBottleRewardClaimed(date);
            const x = -222 + index * 74;
            uimanager.createLabel(content, weekNames[index], x, 47, 14, MOOD_COLORS.cocoaSoft, 42, 22);

            if (isFull || isToday) {
                const daySurface = uimanager.createRect(
                    content,
                    isFull ? 'fullBottleDay' : 'currentBottleDay',
                    55,
                    82,
                    isFull ? new cc.Color(210, 237, 211) : new cc.Color(255, 242, 197),
                    245,
                    18,
                    x,
                    -2,
                );
                daySurface.zIndex = 1;
            }

            if (isFull) this.createCalendarBottleGlow(content, x, 1, !isClaimed);
            const bottleProgress = isFull
                ? DAILY_WISH_TARGET
                : (isToday ? zyxGameModule.dailyMoodCount : Math.round(DAILY_WISH_TARGET * tier / 3));
            const dayBottle = createWishBottle(content, x, 2, bottleProgress, DAILY_WISH_TARGET, 0.215);
            dayBottle.name = `calendarBottle_${key}`;
            dayBottle.opacity = isToday || isFull ? 255 : 176;

            let status = `${date.getDate()}日`;
            let statusColor = MOOD_COLORS.cocoaSoft;
            if (isFull) {
                status = isClaimed ? '已领取' : '可领取';
                statusColor = isClaimed ? MOOD_COLORS.cocoaSoft : new cc.Color(48, 111, 74);
            } else if (isToday) {
                status = '收集中';
                statusColor = new cc.Color(56, 102, 75);
            }
            uimanager.createLabel(content, status, x, -55, 12, statusColor, 58, 20);

            if (isFull && !isClaimed) {
                const hitArea = new cc.Node(`claimBottle_${key}`);
                hitArea.width = 58;
                hitArea.height = 84;
                hitArea.setPosition(x, -2);
                hitArea.zIndex = 150;
                hitArea.addComponent(cc.Button);
                content.addChild(hitArea);
                const rewardDate = new Date(date.getTime());
                hitArea.on(cc.Node.EventType.TOUCH_END, () => this.claimCalendarBottle(rewardDate), this);
            }
        });

        uimanager.createLabel(
            content,
            '装满的顺心瓶会发光，点击可领取随机道具',
            0,
            -88,
            15,
            MOOD_COLORS.cocoaSoft,
            500,
            26,
        );
    }

    private createCalendarBottleGlow(parent: cc.Node, x: number, y: number, pulse: boolean): void {
        const glow = new cc.Node('calendarBottleGlow');
        glow.width = 64;
        glow.height = 76;
        glow.setPosition(x, y);
        glow.opacity = pulse ? 175 : 88;
        glow.zIndex = 2;
        parent.addChild(glow);
        const graphics = glow.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(255, 199, 70, 112);
        graphics.ellipse(0, 0, 56, 70);
        graphics.fill();
        graphics.strokeColor = new cc.Color(255, 244, 172, 210);
        graphics.lineWidth = 3;
        graphics.ellipse(0, 0, 48, 62);
        graphics.stroke();
        if (pulse) {
            cc.tween(glow)
                .repeatForever(cc.tween().to(0.72, { scale: 1.14, opacity: 95 }).to(0.72, { scale: 0.96, opacity: 190 }))
                .start();
        }
    }

    private claimCalendarBottle(date: Date): void {
        const reward = zyxGameModule.claimFullBottleReward(date);
        if (!reward) {
            uimanager.showToast('这只顺心瓶已经领取过啦');
            return;
        }
        uimanager.showToast(`顺心瓶送你 1 个「${reward}」`);
        this.renderCalendarWeek(0);
    }

    private getCalendarWeekDates(offset: number): Date[] {
        const now = new Date();
        const anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset * 7, 12);
        const day = anchor.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const monday = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + mondayOffset, 12);
        const dates: Date[] = [];
        for (let index = 0; index < 7; index++) {
            dates.push(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index, 12));
        }
        return dates;
    }

    private getDateKey(date: Date): string {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
    }

    private startGame(): void {
        this.replaceScreen('game');
        const game = this.screen.addComponent(ZyxGame);
        game.initialize((request) => this.handleSettlementExit(request));
    }

    private replaceScreen(name: string): void {
        this.destroyNativeWeChatProfileButton();
        if (this.screen && this.screen.isValid) this.screen.destroy();
        this.profileNameLabel = null;
        this.profileAvatarContent = null;
        this.profileAuthorizationButton = null;
        this.profileLevelLabel = null;
        this.profileExperienceFill = null;
        this.profileExperienceLabel = null;
        this.homeMoodBottle = null;
        this.homeMoodCountLabel = null;
        this.startButton = null;
        this.calendarPanel = null;
        this.calendarWeekContent = null;
        this.screen = new cc.Node(name);
        this.screen.width = cc.winSize.width;
        this.screen.height = cc.winSize.height;
        this.screen.setAnchorPoint(0.5, 0.5);
        this.node.addChild(this.screen);
    }
}
