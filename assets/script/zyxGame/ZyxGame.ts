import {
    BOARD_COLS,
    BOARD_ROWS,
    BoardPiece,
    CELL_SIZE,
    HAPPY_BOTTLE_TARGET,
    EliminateResult,
    GravityMove,
    RoundSettlement,
    TutorialMove,
    zyxGameModule,
} from '../dataModule/ZyxGameModule';
import { BUTTON_COLORS, uimanager } from '../manager/UIManager';
import { settingsPanel } from '../manager/SettingsPanel';
import { gameSettings } from '../manager/GameSettings';
import { audioManager } from '../manager/AudioManager';
import {
    USE_SHARE_INSTEAD_OF_VIDEO,
    getRewardOfferFailToast,
    getRewardOfferIcon,
    requestShareReward,
} from '../manager/ShareReward';
import { ASSET_PATHS, getSkeletonData, getSpriteFrame } from '../manager/AssetLoader';
import ZyxGridCom from './ZyxGridCom';
import {
    createHammerGlyph,
    createPauseGlyph,
    createPurifierGlyph,
    createShareGlyph,
    createVideoGlyph,
    decorateActionButton,
} from './GlyphFactory';
import {
    createGameRoomBackground,
    createExperienceToken,
    createMoodStamp,
    createMoodToken,
    createWishBottle,
    drawMoodBlockMaterial,
    getMoodColor,
    getMoodName,
    MOOD_COLORS,
    playBottleBurp,
    presentWishBottleAbsoluteProgress,
} from './MoodArt';
import { getWxApi } from '../manager/PlatformAdapter';

const { ccclass } = cc._decorator;
const NEXT_PREVIEW_HEIGHT = 42;
const NEXT_PREVIEW_OPACITY = 220;
const TOOL_BUTTON_SIZE = 88;
// 竖屏节奏：资源区贴近棋盘顶部，棋盘/下一排/道具区之间分别保留可辨认的独立留白。
const BOARD_CENTER_Y = 140;
const NEXT_ROW_CENTER_Y = -330;
const TOOL_DOCK_CENTER_Y = -505;
const BOTTOM_TIP_Y = -618;
const ROUND_RESCUE_COOLDOWN_MS = 60 * 1000;
const HUD_VALUE_COLOR = new cc.Color(112, 78, 65);
const HUD_LABEL_COLOR = new cc.Color(132, 96, 80);

export type SettlementExitRequest = {
    restart: boolean;
    settlement: RoundSettlement;
};

@ccclass
export default class ZyxGame extends cc.Component {
    private boardRoot: cc.Node = null;
    private pieceLayer: cc.Node = null;
    private nextLayer: cc.Node = null;
    private scoreLabel: cc.Label = null;
    private bestLabel: cc.Label = null;
    private roundMoodLabel: cc.Label = null;
    private recordTagLabel: cc.Label = null;
    private recordTagOnLeft: boolean = false;
    private scoreColumnX: number = 70;
    private moodStageLabel: cc.Label = null;
    private hammerButton: cc.Node = null;
    private hammerIcon: cc.Node = null;
    private hammerCountLabel: cc.Label = null;
    private purifierButton: cc.Node = null;
    private purifierIcon: cc.Node = null;
    private purifierCountLabel: cc.Label = null;
    private moodBottle: cc.Node = null;
    private toolDragFollower: cc.Node = null;
    private toolSelectionPrompt: cc.Node = null;
    private toolWiggleNodes: cc.Node[] = [];
    private hintHand: cc.Node = null;
    private hintPieceId: number = 0;
    private hintTipBeforeGuide: string = '';
    private clearSpineData: sp.SkeletonData = null;
    private locked: boolean = true;
    private hammerMode: boolean = false;
    private purifierMode: boolean = false;
    private toolDragging: boolean = false;
    private toolTouchStart: cc.Vec2 = null;
    private rewardedAdLoading: boolean = false;
    private lastRoundRescueOfferedAt: number = 0;
    private roundRescuePrompt: cc.Node = null;
    private roundRescueCountdownState: { progress: number } = null;
    private roundRescueInteractive: boolean = false;
    private boardDangerHalo: cc.Node = null;
    private reviveUsed: boolean = false;
    private onSettlementExit: (request: SettlementExitRequest) => void = null;
    private pieceColors: { [key: number]: cc.Color } = {};
    private displayedRoundMoods: number = 0;
    private idleSeconds: number = 0;
    private tipIndex: number = 0;
    private tipSeconds: number = 0;
    private tutorialStep: number = -1;
    private tutorialGuideRoot: cc.Node = null;
    private tutorialNpc: cc.Node = null;
    private tutorialBubbleGroup: cc.Node = null;
    private tutorialBubble: cc.Node = null;
    private tutorialSpeechLabel: cc.Label = null;
    private tutorialHand: cc.Node = null;
    private tutorialSourceMarker: cc.Node = null;
    private tutorialTargetMarker: cc.Node = null;
    private tutorialDimMask: cc.Node = null;
    private tutorialFocusPieceId: number = 0;
    private tutorialTypingState: { value: number } = null;
    private tutorialRestoreCallback: () => void = null;

    public initialize(onSettlementExit: (request: SettlementExitRequest) => void): void {
        this.onSettlementExit = onSettlementExit;
        this.node.width = cc.winSize.width;
        this.node.height = cc.winSize.height;
        this.node.setAnchorPoint(0.5, 0.5);
        uimanager.init(this.node.parent);

        zyxGameModule.resetRound();
        this.tutorialStep = zyxGameModule.isTutorialRound() ? 0 : -1;
        this.reviveUsed = false;
        this.displayedRoundMoods = 0;
        this.loadEffectAssets();
        this.buildUI();
        this.renderAll();
        this.locked = false;
        if (this.isTutorialGuidedStep()) this.showTutorialStep();
    }

    public onDestroy(): void {
        this.clearTutorialGuide();
    }

    public update(dt: number): void {
        if (!this.node || !this.node.isValid) return;
        this.updateRotatingTip(dt);
        if (this.isTutorialGuidedStep()) return;
        if (this.locked || this.hammerMode || this.purifierMode || this.hintHand) return;
        this.idleSeconds += dt;
        if (this.idleSeconds >= 8) {
            this.idleSeconds = 0;
            this.playEliminationHint();
        }
    }

    /** 供场景根部 GM 气泡在发放道具后同步当前 HUD；可选同步收集瓶进度。 */
    public refreshInventoryHud(progressAdded: number = 0): void {
        this.updateHud();
        if (!this.moodBottle || !cc.isValid(this.moodBottle)) return;
        const absolute = zyxGameModule.happyBottleProgress + this.displayedRoundMoods;
        if (progressAdded > 0) {
            const prevAbs = Number((this.moodBottle as any).absoluteProgress);
            const fromAbs = Number.isFinite(prevAbs) ? prevAbs : Math.max(0, absolute - progressAdded);
            presentWishBottleAbsoluteProgress(this.moodBottle, fromAbs + progressAdded, HAPPY_BOTTLE_TARGET, {
                flyTargetLocal: cc.v2(this.moodBottle.x + 40, this.moodBottle.y + 320),
            });
            return;
        }
        presentWishBottleAbsoluteProgress(this.moodBottle, absolute, HAPPY_BOTTLE_TARGET, {
            flyTargetLocal: cc.v2(this.moodBottle.x + 40, this.moodBottle.y + 320),
        });
    }

    private buildUI(): void {
        this.clearTutorialGuide();
        this.stopBoardDangerGlow();
        this.node.removeAllChildren();
        this.buildBackground();

        const safeArea = uimanager.getSafeAreaMetrics();
        const boardTopY = BOARD_CENTER_Y + BOARD_ROWS * CELL_SIZE / 2;
        const preferredTopY = boardTopY + 94 / 2 + 24;
        const topY = Math.min(preferredTopY, this.node.height / 2 - safeArea.top - 50);
        const bottomTipY = Math.max(BOTTOM_TIP_Y, -this.node.height / 2 + safeArea.bottom + 36);
        const hasWeChatCapsule = safeArea.menuLeft < this.node.width / 2 - 12;
        const hudGap = hasWeChatCapsule ? 10 : 22;
        const scoreCardWidth = hasWeChatCapsule ? 270 : 288;
        const bottleCardWidth = hasWeChatCapsule ? 190 : 230;
        const pauseWidth = 64;
        const hudWidth = scoreCardWidth + bottleCardWidth + hudGap;
        const centeredHudLeft = -hudWidth / 2;
        const capsuleHudLeft = safeArea.menuLeft - 8 - hudWidth;
        const safeLeft = -this.node.width / 2 + safeArea.left + 12;
        const hudLeft = hasWeChatCapsule
            ? Math.max(safeLeft, Math.min(centeredHudLeft, capsuleHudLeft))
            : centeredHudLeft;
        const leftCardX = hudLeft + scoreCardWidth / 2;
        const bottleCardX = hudLeft + scoreCardWidth + hudGap + bottleCardWidth / 2;
        const pauseX = this.node.width / 2 - safeArea.right - 12 - pauseWidth / 2;
        uimanager.createRect(this.node, 'scoreCompareShadow', scoreCardWidth + 6, 100, new cc.Color(78, 53, 46), 34, 22, leftCardX, topY - 5);
        const scoreCard = uimanager.createRect(
            this.node,
            'scoreCompareCard',
            scoreCardWidth,
            94,
            new cc.Color(255, 249, 232),
            238,
            20,
            leftCardX,
            topY,
        );
        const scoreColumnX = scoreCardWidth / 4;
        this.scoreColumnX = scoreColumnX;
        uimanager.createLabel(scoreCard, '本局', -scoreColumnX, 27, 15, HUD_LABEL_COLOR, 90, 24);
        uimanager.createLabel(scoreCard, '最高', scoreColumnX, 27, 15, HUD_LABEL_COLOR, 90, 24);
        uimanager.createRect(scoreCard, 'scoreDivider', 2, 54, MOOD_COLORS.creamDeep, 180, 1, 0, -2);
        this.scoreLabel = uimanager.createLabel(scoreCard, '0', -scoreColumnX, -6, 32, HUD_VALUE_COLOR, 110, 38);
        this.bestLabel = uimanager.createLabel(scoreCard, '0', scoreColumnX, -6, 32, HUD_VALUE_COLOR, 110, 38);
        this.makeHintLabelBold(this.scoreLabel, HUD_VALUE_COLOR, 1.1);
        this.makeHintLabelBold(this.bestLabel, HUD_VALUE_COLOR, 1.1);
        this.recordTagOnLeft = false;
        this.recordTagLabel = uimanager.createLabel(scoreCard, '最高记录', scoreColumnX, -37, 12, HUD_LABEL_COLOR, 124, 18);

        uimanager.createRect(this.node, 'bottleCardShadow', bottleCardWidth + 6, 100, new cc.Color(78, 53, 46), 30, 20, bottleCardX, topY - 5);
        uimanager.createRect(this.node, 'bottleCard', bottleCardWidth, 94, new cc.Color(239, 232, 187), 246, 19, bottleCardX, topY);
        const bottleX = bottleCardX - bottleCardWidth * 0.32;
        this.moodBottle = createWishBottle(
            this.node,
            bottleX,
            topY + 2,
            zyxGameModule.happyBottleProgress + this.displayedRoundMoods,
            HAPPY_BOTTLE_TARGET,
            hasWeChatCapsule ? 0.31 : 0.35,
        );
        const bottleTextX = bottleCardX + bottleCardWidth * 0.16;
        const bottleTextWidth = hasWeChatCapsule ? 88 : 112;
        uimanager.createLabel(this.node, '本局收集', bottleTextX, topY + 27, 14, HUD_LABEL_COLOR, bottleTextWidth, 22);
        this.roundMoodLabel = uimanager.createLabel(this.node, '0', bottleTextX, topY - 7, 30, HUD_VALUE_COLOR, bottleTextWidth, 36);
        this.makeHintLabelBold(this.roundMoodLabel, HUD_VALUE_COLOR, 1.05);

        const pauseButton = uimanager.createButton(
            this.node,
            '',
            pauseX,
            bottomTipY,
            pauseWidth,
            pauseWidth,
            BUTTON_COLORS.red,
            () => this.pauseGame(),
            25,
        );
        pauseButton.name = 'pauseButton';
        pauseButton.zIndex = 180;
        createPauseGlyph(pauseButton, 0, 1, 0.82);

        const tipWidth = Math.min(566, this.node.width - safeArea.left - safeArea.right - pauseWidth - 50);
        const tipRight = pauseX - pauseWidth / 2 - 14;
        const tipX = tipRight - tipWidth / 2;
        const tipPill = uimanager.createRect(this.node, 'tipPill', tipWidth, 48, new cc.Color(255, 249, 232), 218, 22, tipX, bottomTipY);
        this.moodStageLabel = uimanager.createLabel(tipPill, '拖动心情块左右移动，填满一行就能消除', 0, 0, 18, HUD_VALUE_COLOR, tipWidth - 36, 34);
        this.makeHintLabelBold(this.moodStageLabel, HUD_VALUE_COLOR, 0.7);

        this.createBoard();
        this.createNextRowPreview();
        this.createToolBar();
        if (this.tutorialStep >= 0) this.createTutorialNpcGuide();
    }

    private buildBackground(): void {
        createGameRoomBackground(this.node, this.node.width, this.node.height);
    }

    private createBoard(): void {
        const boardWidth = BOARD_COLS * CELL_SIZE;
        const boardHeight = BOARD_ROWS * CELL_SIZE;
        const boardY = BOARD_CENTER_Y;
        const shadow = uimanager.createRect(
            this.node,
            'boardShadow',
            boardWidth + 12,
            boardHeight + 12,
            new cc.Color(69, 46, 41),
            34,
            20,
            0,
            boardY - 6,
        );
        shadow.zIndex = 5;

        this.boardRoot = new cc.Node('boardViewport');
        this.boardRoot.width = boardWidth;
        this.boardRoot.height = boardHeight;
        this.boardRoot.setAnchorPoint(0.5, 0.5);
        this.boardRoot.setPosition(0, boardY);
        this.boardRoot.zIndex = 20;
        this.node.addChild(this.boardRoot);
        const viewportMask = this.boardRoot.addComponent(cc.Mask);
        viewportMask.type = cc.Mask.Type.RECT;

        const surface = new cc.Node('boardSurface');
        surface.width = boardWidth;
        surface.height = boardHeight;
        surface.zIndex = 0;
        this.boardRoot.addChild(surface);
        this.drawBoardSurface(surface, boardWidth, boardHeight);

        this.pieceLayer = new cc.Node('pieces');
        this.pieceLayer.width = boardWidth;
        this.pieceLayer.height = boardHeight;
        this.pieceLayer.setAnchorPoint(0.5, 0.5);
        this.pieceLayer.zIndex = 10;
        this.boardRoot.addChild(this.pieceLayer);

        const frame = new cc.Node('boardFrame');
        frame.width = boardWidth + 18;
        frame.height = boardHeight + 18;
        frame.setPosition(0, boardY);
        frame.zIndex = 100;
        this.node.addChild(frame);
        this.drawBoardFrame(frame, boardWidth, boardHeight);
    }

    /** 教学 NPC 放在棋盘上半部留白区，靠近操作区但不遮挡下方色块。 */
    private createTutorialNpcGuide(): void {
        const root = new cc.Node('tutorialGuide');
        root.width = BOARD_COLS * CELL_SIZE;
        root.height = BOARD_ROWS * CELL_SIZE;
        root.setAnchorPoint(0.5, 0.5);
        root.zIndex = 190;
        this.node.addChild(root);
        this.tutorialGuideRoot = root;

        const guideY = BOARD_CENTER_Y + BOARD_ROWS * CELL_SIZE / 2 - 174;
        const npc = new cc.Node('happyBlockGuide');
        npc.width = 70;
        npc.height = 70;
        npc.setPosition(-252, guideY);
        npc.zIndex = 30;
        root.addChild(npc);
        drawMoodBlockMaterial(npc, getMoodColor(1));
        (npc as any).tutorialBaseY = guideY;
        this.drawHappyTutorialFace(npc);
        this.tutorialNpc = npc;
        this.startTutorialNpcIdle();

        const bubbleGroup = new cc.Node('tutorialBubbleGroup');
        bubbleGroup.width = root.width;
        bubbleGroup.height = root.height;
        bubbleGroup.zIndex = 20;
        root.addChild(bubbleGroup);
        this.tutorialBubbleGroup = bubbleGroup;

        uimanager.createRect(bubbleGroup, 'tutorialBubbleShadow', 438, 98, new cc.Color(72, 48, 43), 54, 24, 43, guideY - 5);
        const bubble = uimanager.createRect(
            bubbleGroup,
            'tutorialBubble',
            432,
            92,
            new cc.Color(255, 249, 232),
            252,
            22,
            40,
            guideY,
        );
        bubble.zIndex = 20;
        const bubbleGraphics = bubble.getComponent(cc.Graphics);
        bubbleGraphics.strokeColor = new cc.Color(239, 151, 105, 188);
        bubbleGraphics.lineWidth = 2.5;
        bubbleGraphics.roundRect(-214, -44, 428, 88, 21);
        bubbleGraphics.stroke();
        this.tutorialBubble = bubble;

        const tail = new cc.Node('tutorialBubbleTail');
        tail.setPosition(-180, guideY - 7);
        tail.zIndex = 21;
        bubbleGroup.addChild(tail);
        const tailGraphics = tail.addComponent(cc.Graphics);
        tailGraphics.fillColor = new cc.Color(255, 249, 232);
        tailGraphics.strokeColor = new cc.Color(239, 151, 105, 188);
        tailGraphics.lineWidth = 2.5;
        tailGraphics.moveTo(0, 15);
        tailGraphics.lineTo(-27, -1);
        tailGraphics.lineTo(0, -14);
        tailGraphics.close();
        tailGraphics.fill();
        tailGraphics.stroke();

        this.tutorialSpeechLabel = uimanager.createLabel(
            bubble,
            '',
            0,
            -1,
            20,
            HUD_VALUE_COLOR,
            382,
            70,
        );
        this.makeHintLabelBold(this.tutorialSpeechLabel, new cc.Color(255, 249, 232), 0.55);
    }

    /** 弯眼、张嘴和腮红让 NPC 明确传达“开心”，避免之前近似困倦的表情。 */
    private drawHappyTutorialFace(parent: cc.Node): void {
        const face = new cc.Node('happyGuideFace');
        face.width = 52;
        face.height = 46;
        face.setPosition(0, -1);
        face.zIndex = 8;
        parent.addChild(face);
        const graphics = face.addComponent(cc.Graphics);
        graphics.strokeColor = new cc.Color(92, 63, 55);
        graphics.lineWidth = 3.2;
        graphics.lineCap = cc.Graphics.LineCap.ROUND;
        graphics.moveTo(-16, 7);
        graphics.bezierCurveTo(-13, 13, -8, 13, -5, 7);
        graphics.moveTo(5, 7);
        graphics.bezierCurveTo(8, 13, 13, 13, 16, 7);
        graphics.stroke();

        graphics.fillColor = new cc.Color(105, 68, 60);
        graphics.moveTo(-12, -3);
        graphics.bezierCurveTo(-7, -1, 7, -1, 12, -3);
        graphics.bezierCurveTo(10, -15, -10, -15, -12, -3);
        graphics.close();
        graphics.fill();
        graphics.fillColor = new cc.Color(242, 135, 125);
        graphics.ellipse(0, -11, 6.5, 2.8);
        graphics.fill();
        graphics.fillColor = new cc.Color(242, 151, 124, 172);
        graphics.ellipse(-19, -4, 5, 2.5);
        graphics.ellipse(19, -4, 5, 2.5);
        graphics.fill();
    }

    private startTutorialNpcIdle(): void {
        const npc = this.tutorialNpc;
        if (!npc || !cc.isValid(npc)) return;
        const baseY = Number((npc as any).tutorialBaseY) || npc.y;
        cc.Tween.stopAllByTarget(npc);
        npc.y = baseY;
        npc.scaleX = 1;
        npc.scaleY = 1;
        cc.tween(npc)
            .repeatForever(
                cc.tween()
                    .to(0.86, { y: baseY + 3, scale: 1.025 }, { easing: 'sineInOut' })
                    .to(0.86, { y: baseY, scale: 1 }, { easing: 'sineInOut' }),
            )
            .start();
    }

    /** 每次真实消除都让 NPC 做一次双段庆祝跳。 */
    private playTutorialNpcBounce(): void {
        const npc = this.tutorialNpc;
        if (!npc || !cc.isValid(npc)) return;
        const baseY = Number((npc as any).tutorialBaseY) || npc.y;
        cc.Tween.stopAllByTarget(npc);
        npc.y = baseY;
        npc.scaleX = 1;
        npc.scaleY = 1;
        cc.tween(npc)
            .to(0.11, { y: baseY + 28, scaleX: 0.92, scaleY: 1.12 }, { easing: 'quadOut' })
            .to(0.13, { y: baseY - 2, scaleX: 1.1, scaleY: 0.9 }, { easing: 'quadIn' })
            .to(0.09, { y: baseY + 12, scaleX: 0.96, scaleY: 1.06 }, { easing: 'quadOut' })
            .to(0.12, { y: baseY, scaleX: 1, scaleY: 1 }, { easing: 'backOut' })
            .call(() => this.startTutorialNpcIdle())
            .start();
    }

    /** 第三步完成后，用一次完整庆祝过渡把控制权交还给玩家。 */
    private playTutorialCompletionTransition(): void {
        const group = this.tutorialBubbleGroup;
        const bubble = this.tutorialBubble;
        const npc = this.tutorialNpc;
        if (!group || !bubble || !npc || !cc.isValid(group) || !cc.isValid(npc)) {
            this.finishTutorialTransition();
            return;
        }

        if (this.tutorialTypingState) cc.Tween.stopAllByTarget(this.tutorialTypingState);
        this.tutorialTypingState = null;
        if (this.tutorialSpeechLabel) this.tutorialSpeechLabel.string = '';
        cc.Tween.stopAllByTarget(group);
        cc.Tween.stopAllByTarget(npc);
        group.opacity = 255;
        group.scale = 1;
        npc.opacity = 255;

        cc.tween(npc)
            .to(0.44, { y: 0, scale: 1.08 }, { easing: 'backOut' })
            .start();
        cc.tween(group)
            .to(0.44, { x: -bubble.x, y: -bubble.y, scale: 1.1 }, { easing: 'backOut' })
            .call(() => {
                this.setTutorialSpeech('接下来开始你的快乐时间吧！');
                this.scheduleOnce(() => this.playTutorialFarewell(), 1.35);
            })
            .start();
    }

    /** NPC 连跳两次，气泡同步呼吸，遮罩在庆祝动作中渐隐。 */
    private playTutorialFarewell(): void {
        const group = this.tutorialBubbleGroup;
        const npc = this.tutorialNpc;
        const mask = this.tutorialDimMask;

        if (mask && cc.isValid(mask)) {
            cc.Tween.stopAllByTarget(mask);
            cc.tween(mask)
                .to(0.76, { opacity: 0 }, { easing: 'sineOut' })
                .call(() => {
                    if (cc.isValid(mask)) mask.destroy();
                    if (this.tutorialDimMask === mask) this.tutorialDimMask = null;
                })
                .start();
        }

        if (group && cc.isValid(group)) {
            cc.Tween.stopAllByTarget(group);
            cc.tween(group)
                .to(0.12, { scale: 1.15 }, { easing: 'quadOut' })
                .to(0.14, { scale: 1.1 }, { easing: 'quadIn' })
                .to(0.12, { scale: 1.15 }, { easing: 'quadOut' })
                .to(0.14, { scale: 1.1 }, { easing: 'quadIn' })
                .to(0.22, { opacity: 0, scale: 0.92 }, { easing: 'quadIn' })
                .start();
        }

        if (!npc || !cc.isValid(npc)) {
            this.scheduleOnce(() => this.finishTutorialTransition(), 0.76);
            return;
        }
        cc.Tween.stopAllByTarget(npc);
        const baseY = npc.y;
        cc.tween(npc)
            .to(0.12, { y: baseY + 30, scaleX: 0.92, scaleY: 1.12 }, { easing: 'quadOut' })
            .to(0.14, { y: baseY, scaleX: 1.08, scaleY: 0.92 }, { easing: 'quadIn' })
            .to(0.12, { y: baseY + 24, scaleX: 0.94, scaleY: 1.1 }, { easing: 'quadOut' })
            .to(0.14, { y: baseY, scaleX: 1.06, scaleY: 0.94 }, { easing: 'quadIn' })
            .to(0.22, { opacity: 0, scale: 0.82 }, { easing: 'quadIn' })
            .call(() => this.finishTutorialTransition())
            .start();
    }

    private finishTutorialTransition(): void {
        this.tutorialStep = -1;
        this.clearTutorialGuide();
        if (this.moodStageLabel) {
            this.moodStageLabel.string = '快乐时间开始啦：留意下一排，继续填满整行';
            this.moodStageLabel.node.opacity = 255;
        }
        this.updateHud();
        this.appendTutorialOpeningRows();
    }

    /** 三排数据同步入场，避免教学结束后棋盘只剩孤零零的一排。 */
    private appendTutorialOpeningRows(): void {
        for (let index = 0; index < 3; index++) {
            if (!zyxGameModule.appendNextRow()) {
                this.handleChallengeFailed('整理台暂时放满了');
                return;
            }
        }
        this.animateAppendedRow(() => {
            this.resolveStableBoard(1, () => {
                if (zyxGameModule.isGameOver()) {
                    this.handleChallengeFailed('整理台暂时放满了');
                    return;
                }
                this.locked = false;
                this.idleSeconds = 0;
            });
        });
    }

    private isTutorialGuidedStep(): boolean {
        return this.tutorialStep >= 0
            && this.tutorialStep < 3
            && !!zyxGameModule.getTutorialMove(this.tutorialStep);
    }

    private getTutorialSpeech(): string {
        const messages = [
            '第 1 步：把 3 格块向左拖，补满第二排。',
            '第 2 步：把 2 格块向右拖，补满下一排。',
            '第 3 步：把 1 格块向左拖，补满最后一排。',
        ];
        return messages[this.tutorialStep] || '';
    }

    private showTutorialStep(): void {
        if (!this.isTutorialGuidedStep()) return;
        if (this.tutorialRestoreCallback) {
            this.unschedule(this.tutorialRestoreCallback);
            this.tutorialRestoreCallback = null;
        }
        this.clearTutorialMoveGuide();
        this.setTutorialSpeech(this.getTutorialSpeech());
        this.showTutorialMoveGuide(zyxGameModule.getTutorialMove(this.tutorialStep));
        this.updateHud();
    }

    /** 用高亮空位 + 循环小手表达横向拖动；不替玩家移动真实色块。 */
    private showTutorialMoveGuide(move: TutorialMove): void {
        if (!move || !this.boardRoot || !this.pieceLayer) return;
        const piece = zyxGameModule.getPiece(move.id);
        const pieceNode = this.pieceLayer.getChildByName(`piece_${move.id}`);
        if (!piece || !pieceNode) return;

        const dimMask = new cc.Node('tutorialDimMask');
        dimMask.width = BOARD_COLS * CELL_SIZE;
        dimMask.height = BOARD_ROWS * CELL_SIZE;
        dimMask.zIndex = 50;
        this.pieceLayer.addChild(dimMask);
        const dimGraphics = dimMask.addComponent(cc.Graphics);
        dimGraphics.fillColor = new cc.Color(25, 20, 18, 148);
        dimGraphics.rect(-dimMask.width / 2, -dimMask.height / 2, dimMask.width, dimMask.height);
        dimGraphics.fill();
        this.tutorialDimMask = dimMask;
        this.tutorialFocusPieceId = move.id;
        pieceNode.zIndex = 90;

        const target = this.getPiecePosition(move.targetRow, move.targetCol, move.pieceSize);
        const targetMarker = new cc.Node('tutorialTargetMarker');
        targetMarker.width = move.pieceSize * CELL_SIZE - 12;
        targetMarker.height = CELL_SIZE - 12;
        targetMarker.setPosition(target);
        targetMarker.zIndex = 70;
        this.pieceLayer.addChild(targetMarker);
        const targetGraphics = targetMarker.addComponent(cc.Graphics);
        targetGraphics.fillColor = new cc.Color(255, 221, 104, 72);
        targetGraphics.strokeColor = new cc.Color(239, 151, 105, 238);
        targetGraphics.lineWidth = 4;
        targetGraphics.roundRect(
            -targetMarker.width / 2,
            -targetMarker.height / 2,
            targetMarker.width,
            targetMarker.height,
            14,
        );
        targetGraphics.fill();
        targetGraphics.stroke();
        cc.tween(targetMarker)
            .repeatForever(
                cc.tween()
                    .to(0.48, { opacity: 150, scale: 0.96 }, { easing: 'sineInOut' })
                    .to(0.48, { opacity: 255, scale: 1.03 }, { easing: 'sineInOut' }),
            )
            .start();
        this.tutorialTargetMarker = targetMarker;

        const origin = this.getPiecePosition(piece.row, piece.col, piece.size);
        const sourceMarker = new cc.Node('tutorialSourceMarker');
        sourceMarker.width = pieceNode.width + 16;
        sourceMarker.height = pieceNode.height + 16;
        sourceMarker.setPosition(0, 0);
        sourceMarker.zIndex = -1;
        pieceNode.addChild(sourceMarker);
        const sourceGraphics = sourceMarker.addComponent(cc.Graphics);
        sourceGraphics.strokeColor = new cc.Color(255, 203, 104, 92);
        sourceGraphics.lineWidth = 12;
        sourceGraphics.roundRect(
            -sourceMarker.width / 2,
            -sourceMarker.height / 2,
            sourceMarker.width,
            sourceMarker.height,
            20,
        );
        sourceGraphics.stroke();
        sourceGraphics.strokeColor = new cc.Color(255, 244, 196, 210);
        sourceGraphics.lineWidth = 3;
        sourceGraphics.roundRect(
            -sourceMarker.width / 2 + 3,
            -sourceMarker.height / 2 + 3,
            sourceMarker.width - 6,
            sourceMarker.height - 6,
            17,
        );
        sourceGraphics.stroke();
        sourceMarker.opacity = 190;
        cc.tween(sourceMarker)
            .repeatForever(
                cc.tween()
                    .to(0.5, { opacity: 118, scale: 1.045 }, { easing: 'sineInOut' })
                    .to(0.5, { opacity: 210, scale: 1 }, { easing: 'sineInOut' }),
            )
            .start();
        this.tutorialSourceMarker = sourceMarker;

        const hand = this.createHintHand(this.pieceLayer, origin.x, origin.y + 44);
        hand.name = 'tutorialDragHand';
        this.tutorialHand = hand;
        const targetX = origin.x + move.offset * CELL_SIZE;
        cc.tween(hand)
            .repeatForever(
                cc.tween()
                    .to(0.16, { y: origin.y + 24, scale: 0.9, opacity: 255 }, { easing: 'quadOut' })
                    .to(0.64, { x: targetX, y: origin.y + 24 }, { easing: 'cubicInOut' })
                    .to(0.13, { y: origin.y + 42, scale: 1 }, { easing: 'backOut' })
                    .delay(0.34)
                    .to(0.3, { x: origin.x, opacity: 0 }, { easing: 'quadIn' })
                    .call(() => {
                        if (!cc.isValid(hand)) return;
                        hand.setPosition(origin.x, origin.y + 44);
                        hand.opacity = 255;
                    })
                    .delay(0.22),
            )
            .start();
    }

    private setTutorialSpeech(message: string): void {
        if (!this.tutorialSpeechLabel) return;
        if (this.tutorialTypingState) cc.Tween.stopAllByTarget(this.tutorialTypingState);
        const state = { value: 0 };
        this.tutorialTypingState = state;
        this.tutorialSpeechLabel.string = '';
        cc.tween(state)
            .to(Math.max(0.45, Math.min(1.5, message.length * 0.055)), { value: message.length }, {
                easing: 'linear',
                onUpdate: () => {
                    if (!this.tutorialSpeechLabel || this.tutorialTypingState !== state) return;
                    this.tutorialSpeechLabel.string = message.slice(0, Math.floor(state.value));
                },
            })
            .call(() => {
                if (this.tutorialSpeechLabel && this.tutorialTypingState === state) {
                    this.tutorialSpeechLabel.string = message;
                }
            })
            .start();
    }

    private showTutorialCorrection(message: string, resetBoard: boolean): void {
        if (!this.isTutorialGuidedStep()) return;
        if (this.tutorialRestoreCallback) this.unschedule(this.tutorialRestoreCallback);
        this.clearTutorialMoveGuide();
        if (resetBoard) this.renderBoard();
        this.setTutorialSpeech(message);
        this.showTutorialMoveGuide(zyxGameModule.getTutorialMove(this.tutorialStep));
        if (this.tutorialBubble && cc.isValid(this.tutorialBubble)) {
            const bubble = this.tutorialBubble;
            const originY = bubble.y;
            cc.Tween.stopAllByTarget(bubble);
            bubble.scale = 1;
            cc.tween(bubble)
                .to(0.11, { y: originY + 6, scale: 1.025 }, { easing: 'quadOut' })
                .to(0.16, { y: originY, scale: 1 }, { easing: 'backOut' })
                .start();
        }
        this.tutorialRestoreCallback = () => {
            this.tutorialRestoreCallback = null;
            this.showTutorialStep();
        };
        this.scheduleOnce(this.tutorialRestoreCallback, 1.65);
    }

    private cancelTutorialRestore(): void {
        if (!this.tutorialRestoreCallback) return;
        this.unschedule(this.tutorialRestoreCallback);
        this.tutorialRestoreCallback = null;
    }

    private cancelTutorialHand(): void {
        if (this.tutorialHand && cc.isValid(this.tutorialHand)) {
            cc.Tween.stopAllByTarget(this.tutorialHand);
            this.tutorialHand.destroy();
        }
        this.tutorialHand = null;
    }

    private clearTutorialMoveGuide(preserveDimMask: boolean = false): void {
        this.cancelTutorialHand();
        if (this.tutorialFocusPieceId > 0 && this.pieceLayer && cc.isValid(this.pieceLayer)) {
            const focus = this.pieceLayer.getChildByName(`piece_${this.tutorialFocusPieceId}`);
            if (focus) focus.zIndex = 10;
        }
        const guideNodes = [this.tutorialSourceMarker, this.tutorialTargetMarker];
        if (!preserveDimMask) guideNodes.push(this.tutorialDimMask);
        guideNodes.forEach((node) => {
            if (!node || !cc.isValid(node)) return;
            cc.Tween.stopAllByTarget(node);
            node.destroy();
        });
        this.tutorialSourceMarker = null;
        this.tutorialTargetMarker = null;
        if (!preserveDimMask) this.tutorialDimMask = null;
        this.tutorialFocusPieceId = 0;
    }

    private clearTutorialGuide(): void {
        if (this.tutorialRestoreCallback) this.unschedule(this.tutorialRestoreCallback);
        this.tutorialRestoreCallback = null;
        this.clearTutorialMoveGuide();
        if (this.tutorialTypingState) cc.Tween.stopAllByTarget(this.tutorialTypingState);
        this.tutorialTypingState = null;
        if (this.tutorialGuideRoot && cc.isValid(this.tutorialGuideRoot)) this.tutorialGuideRoot.destroy();
        this.tutorialGuideRoot = null;
        this.tutorialNpc = null;
        this.tutorialBubbleGroup = null;
        this.tutorialBubble = null;
        this.tutorialSpeechLabel = null;
    }

    private drawBoardSurface(node: cc.Node, width: number, height: number): void {
        const graphics = node.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(249, 239, 220);
        graphics.roundRect(-width / 2, -height / 2, width, height, 18);
        graphics.fill();

        graphics.strokeColor = new cc.Color(111, 83, 72, 88);
        graphics.lineWidth = 3.15;
        for (let col = 1; col < BOARD_COLS; col++) {
            const x = -width / 2 + col * CELL_SIZE;
            graphics.moveTo(x, -height / 2);
            graphics.lineTo(x, height / 2);
        }
        for (let row = 1; row < BOARD_ROWS; row++) {
            const y = height / 2 - row * CELL_SIZE;
            graphics.moveTo(-width / 2, y);
            graphics.lineTo(width / 2, y);
        }
        graphics.stroke();

    }

    private drawBoardFrame(node: cc.Node, width: number, height: number): void {
        const graphics = node.addComponent(cc.Graphics);
        graphics.strokeColor = new cc.Color(91, 65, 57, 232);
        graphics.lineWidth = 12;
        graphics.roundRect(-width / 2, -height / 2, width, height, 18);
        graphics.stroke();
        graphics.strokeColor = new cc.Color(255, 244, 218, 86);
        graphics.lineWidth = 1.5;
        graphics.roundRect(-width / 2 + 7, -height / 2 + 7, width - 14, height - 14, 11);
        graphics.stroke();
    }

    private createNextRowPreview(): void {
        const boardWidth = BOARD_COLS * CELL_SIZE;
        const root = new cc.Node('nextRow');
        root.width = boardWidth + 52;
        root.height = 114;
        root.setAnchorPoint(0.5, 0.5);
        root.setPosition(0, NEXT_ROW_CENTER_Y);
        root.zIndex = 80;
        this.node.addChild(root);

        uimanager.createRect(
            root,
            'nextPreviewShieldShadow',
            boardWidth + 44,
            116,
            new cc.Color(78, 53, 46),
            22,
            14,
            0,
            -4,
        );
        uimanager.createRect(
            root,
            'nextPreviewShield',
            boardWidth + 38,
            112,
            new cc.Color(250, 237, 211),
            255,
            14,
            0,
            0,
        );
        uimanager.createRect(root, 'nextPreviewLip', boardWidth + 12, 2, MOOD_COLORS.cocoaSoft, 28, 1, 0, 55);

        this.nextLayer = new cc.Node('nextPieces');
        this.nextLayer.width = boardWidth;
        this.nextLayer.height = NEXT_PREVIEW_HEIGHT;
        this.nextLayer.setAnchorPoint(0.5, 0.5);
        this.nextLayer.setPosition(0, 22);
        this.nextLayer.zIndex = 5;
        root.addChild(this.nextLayer);
        uimanager.createRect(root, 'nextRowLabelBg', 128, 32, new cc.Color(255, 249, 232), 255, 16, 0, -34);
        const nextLabel = uimanager.createLabel(root, '下一排', 0, -34, 18, new cc.Color(45, 42, 39), 120, 30);
        this.makeHintLabelBold(nextLabel, new cc.Color(45, 42, 39), 0.65);
    }

    private createToolBar(): void {
        const dockY = TOOL_DOCK_CENTER_Y;
        uimanager.createRect(
            this.node,
            'toolDockShadow',
            300,
            134,
            new cc.Color(70, 46, 40),
            52,
            28,
            0,
            dockY - 7,
        );
        const dock = uimanager.createRect(
            this.node,
            'toolDock',
            292,
            128,
            new cc.Color(255, 247, 226),
            248,
            26,
            0,
            dockY,
        );
        dock.zIndex = 90;
        const dockGraphics = dock.getComponent(cc.Graphics);
        dockGraphics.strokeColor = new cc.Color(151, 111, 87, 132);
        dockGraphics.lineWidth = 2;
        dockGraphics.roundRect(-144, -62, 288, 124, 24);
        dockGraphics.stroke();
        uimanager.createRect(dock, 'toolDockTab', 102, 24, new cc.Color(245, 220, 177), 255, 12, 0, 52);
        const dockTitle = uimanager.createLabel(dock, '解压工具', 0, 52, 14, HUD_LABEL_COLOR, 96, 22);
        this.makeHintLabelBold(dockTitle, HUD_LABEL_COLOR, 0.55);

        this.hammerButton = uimanager.createRect(
            dock,
            'reliefToolButton',
            TOOL_BUTTON_SIZE,
            TOOL_BUTTON_SIZE,
            BUTTON_COLORS.yellow,
            255,
            23,
            -53,
            -10,
        );
        uimanager.drawButtonSurface(this.hammerButton, TOOL_BUTTON_SIZE, TOOL_BUTTON_SIZE, BUTTON_COLORS.yellow, 23);
        this.hammerButton.addComponent(cc.Button);
        this.hammerButton.name = 'hammerToolButton';
        this.hammerIcon = createHammerGlyph(this.hammerButton, 0, -1, 0.84);
        this.hammerCountLabel = this.createToolCountBadge(this.hammerButton, 'hammerCountBadge');

        this.purifierButton = uimanager.createRect(
            dock,
            'purifierToolButton',
            TOOL_BUTTON_SIZE,
            TOOL_BUTTON_SIZE,
            BUTTON_COLORS.green,
            255,
            23,
            53,
            -10,
        );
        uimanager.drawButtonSurface(this.purifierButton, TOOL_BUTTON_SIZE, TOOL_BUTTON_SIZE, BUTTON_COLORS.green, 23);
        this.purifierButton.addComponent(cc.Button);
        this.purifierIcon = createPurifierGlyph(this.purifierButton, 0, -1, 0.84);
        this.purifierCountLabel = this.createToolCountBadge(this.purifierButton, 'purifierCountBadge');

        this.bindToolGestures();
        this.bindPurifierGesture();
    }

    private createToolCountBadge(button: cc.Node, name: string): cc.Label {
        const badge = uimanager.createCircle(button, name, 17, BUTTON_COLORS.red, 35, 34);
        const badgeGraphics = badge.getComponent(cc.Graphics);
        badgeGraphics.strokeColor = cc.Color.WHITE;
        badgeGraphics.lineWidth = 2;
        badgeGraphics.circle(0, 0, 16);
        badgeGraphics.stroke();
        const label = uimanager.createLabel(badge, '0', 0, 0, 17, cc.Color.WHITE, 26, 24);
        this.makeHintLabelBold(label, new cc.Color(126, 45, 41), 0.8);
        return label;
    }

    /** 用同色描边增加中文字重；白字则搭配深色描边保证在任意背景上清楚。 */
    private makeHintLabelBold(label: cc.Label, outlineColor: cc.Color, width: number): void {
        if (!label || !label.node) return;
        const outline = label.node.getComponent(cc.LabelOutline) || label.node.addComponent(cc.LabelOutline);
        outline.color = outlineColor;
        outline.width = width;
    }

    private bindToolGestures(): void {
        this.hammerButton.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            if (this.locked) return;
            if (this.isTutorialGuidedStep()) {
                this.showTutorialCorrection('先完成当前拖拽，工具稍后就能使用。', false);
                return;
            }
            this.markInteraction();
            this.toolDragging = false;
            this.toolTouchStart = event.touch.getLocation();
            cc.tween(this.hammerButton).stop();
            cc.tween(this.hammerButton).to(0.07, { scale: 0.96 }).start();
        }, this);
        this.hammerButton.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (!this.toolTouchStart || this.locked || zyxGameModule.hammerCount <= 0) return;
            const point = event.touch.getLocation();
            const dx = point.x - this.toolTouchStart.x;
            const dy = point.y - this.toolTouchStart.y;
            if (!this.toolDragging) {
                if (dx * dx + dy * dy < 196) return;
                this.toolDragging = true;
                this.setToolSelectionMode('hammer');
            }
            this.showToolDragFollower(point);
        }, this);
        this.hammerButton.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            cc.tween(this.hammerButton).stop();
            cc.tween(this.hammerButton).to(0.1, { scale: 1 }).start();
            if (!this.toolTouchStart) return;
            if (this.toolDragging) {
                const targetId = this.findPieceAtWorldPoint(event.touch.getLocation());
                this.clearToolDragFollower();
                this.toolTouchStart = null;
                this.toolDragging = false;
                if (targetId > 0) this.useReliefTool(targetId);
                else {
                    this.setToolSelectionMode(null);
                    uimanager.showToast('把解压锤放到一个心情块上');
                }
                return;
            }
            this.toolTouchStart = null;
            this.showHammerInfoModal();
        }, this);
        this.hammerButton.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            this.toolTouchStart = null;
            this.toolDragging = false;
            this.clearToolDragFollower();
            cc.tween(this.hammerButton).stop();
            cc.tween(this.hammerButton).to(0.1, { scale: 1 }).start();
        }, this);
    }

    private bindPurifierGesture(): void {
        this.purifierButton.on(cc.Node.EventType.TOUCH_START, () => {
            if (this.locked) return;
            if (this.isTutorialGuidedStep()) {
                this.showTutorialCorrection('先完成当前拖拽，工具稍后就能使用。', false);
                return;
            }
            this.markInteraction();
            cc.tween(this.purifierButton).stop();
            cc.tween(this.purifierButton).to(0.07, { scale: 0.96 }).start();
        }, this);
        this.purifierButton.on(cc.Node.EventType.TOUCH_END, () => {
            cc.tween(this.purifierButton).stop();
            cc.tween(this.purifierButton).to(0.1, { scale: 1 }).start();
            if (!this.locked && !this.isTutorialGuidedStep()) this.showPurifierInfoModal();
        }, this);
        this.purifierButton.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.tween(this.purifierButton).stop();
            cc.tween(this.purifierButton).to(0.1, { scale: 1 }).start();
        }, this);
    }

    private showToolDragFollower(worldPoint: cc.Vec2): void {
        if (!this.toolDragFollower || !cc.isValid(this.toolDragFollower)) {
            this.toolDragFollower = createHammerGlyph(this.node, 0, 0, 0.72);
            this.toolDragFollower.name = 'toolDragFollower';
            this.toolDragFollower.zIndex = 1200;
        }
        const local = this.node.convertToNodeSpaceAR(worldPoint);
        this.toolDragFollower.setPosition(local.x + 20, local.y + 24);
    }

    private clearToolDragFollower(): void {
        if (this.toolDragFollower && cc.isValid(this.toolDragFollower)) this.toolDragFollower.destroy();
        this.toolDragFollower = null;
    }

    /** 道具获得与手动选择共用同一套待使用状态，避免“有库存但还要再点一次”的断层。 */
    private setToolSelectionMode(mode: 'hammer' | 'magicWand' | null): void {
        this.stopToolSelectionFeedback();
        this.hammerMode = mode === 'hammer';
        this.purifierMode = mode === 'magicWand';
        this.updateHud();

        if (!mode) {
            this.restoreDefaultPlayTip();
            return;
        }

        const prompt = mode === 'hammer'
            ? '请选择要敲掉的格子'
            : '请选择要消除颜色的色块';
        this.showToolSelectionPrompt(prompt);
        this.startPieceSelectionWiggle();
    }

    private showToolSelectionPrompt(message: string): void {
        if (this.toolSelectionPrompt && cc.isValid(this.toolSelectionPrompt)) {
            this.toolSelectionPrompt.destroy();
        }
        const prompt = uimanager.createRect(
            this.node,
            'toolSelectionPrompt',
            430,
            66,
            new cc.Color(83, 61, 53),
            224,
            24,
            0,
            0,
        );
        prompt.zIndex = 1400;
        const label = uimanager.createLabel(prompt, message, 0, 0, 24, cc.Color.WHITE, 390, 42);
        this.makeHintLabelBold(label, new cc.Color(83, 61, 53), 1.1);
        this.toolSelectionPrompt = prompt;
        cc.tween(prompt)
            .repeatForever(
                cc.tween()
                    .to(0.62, { opacity: 255, scale: 1.025 }, { easing: 'sineInOut' })
                    .to(0.62, { opacity: 184, scale: 0.985 }, { easing: 'sineInOut' }),
            )
            .start();
    }

    private startPieceSelectionWiggle(): void {
        this.stopPieceSelectionWiggle();
        if (!this.pieceLayer) return;
        const pieces = this.pieceLayer.children.filter((node) => node.name.indexOf('piece_') === 0);
        pieces.forEach((node, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            node.angle = direction * 0.8;
            this.toolWiggleNodes.push(node);
            cc.tween(node)
                .delay((index % 6) * 0.018)
                .repeatForever(
                    cc.tween()
                        .to(0.13, { angle: -direction * 1.25 }, { easing: 'sineInOut' })
                        .to(0.13, { angle: direction * 1.05 }, { easing: 'sineInOut' }),
                )
                .start();
        });
    }

    private stopPieceSelectionWiggle(): void {
        const nodes = this.toolWiggleNodes.slice();
        if (this.pieceLayer && cc.isValid(this.pieceLayer)) {
            this.pieceLayer.children.forEach((node) => {
                if (node.name.indexOf('piece_') !== 0 || nodes.indexOf(node) >= 0) return;
                nodes.push(node);
            });
        }
        nodes.forEach((node) => {
            if (!node || !cc.isValid(node)) return;
            cc.Tween.stopAllByTarget(node);
            node.angle = 0;
            node.scale = 1;
        });
        this.toolWiggleNodes = [];
    }

    private stopToolSelectionFeedback(): void {
        this.stopPieceSelectionWiggle();
        if (this.toolSelectionPrompt && cc.isValid(this.toolSelectionPrompt)) {
            cc.Tween.stopAllByTarget(this.toolSelectionPrompt);
            this.toolSelectionPrompt.destroy();
        }
        this.toolSelectionPrompt = null;
    }

    private findPieceAtWorldPoint(worldPoint: cc.Vec2): number {
        if (!this.pieceLayer) return 0;
        for (const node of this.pieceLayer.children) {
            if (node.name.indexOf('piece_') !== 0) continue;
            if (node.getBoundingBoxToWorld().contains(worldPoint)) return Number(node.name.substring(6)) || 0;
        }
        return 0;
    }

    private loadEffectAssets(): void {
        this.clearSpineData = getSkeletonData('game', ASSET_PATHS.game.rewardSpine);
    }

    private renderAll(): void {
        this.renderBoard();
        this.renderNextRow();
        this.updateHud();
    }

    private renderBoard(): void {
        if (!this.pieceLayer) return;
        this.stopPieceSelectionWiggle();
        this.pieceLayer.removeAllChildren();
        this.pieceColors = {};
        for (const piece of zyxGameModule.pieces) this.createPieceView(piece);
        if (this.hammerMode || this.purifierMode) this.startPieceSelectionWiggle();
    }

    private createPieceView(piece: BoardPiece, startRow: number = piece.row): cc.Node {
        const width = piece.size * CELL_SIZE - 4;
        const height = CELL_SIZE - 4;
        const node = new cc.Node(`piece_${piece.id}`);
        node.width = width;
        node.height = height;
        node.setAnchorPoint(0.5, 0.5);
        node.setPosition(this.getPiecePosition(startRow, piece.col, piece.size));
        node.zIndex = 10;
        this.pieceLayer.addChild(node);

        const color = this.getPieceColor(piece.color);
        this.pieceColors[piece.id] = color;
        this.drawPiece(node, color, 1);
        if (piece.stampMood > 0) {
            createMoodStamp(node, piece.stampMood, CELL_SIZE, piece.stampCell, 132);
        }

        const component = node.addComponent(ZyxGridCom);
        component.initialize(piece.id, CELL_SIZE, {
            canInteract: () => !this.locked,
            onInteract: () => this.markInteraction(),
            getMoveRange: (id) => zyxGameModule.getMoveRange(id),
            onMove: (id, offset) => this.movePiece(id, offset),
            onTap: (id) => this.tapPiece(id),
        });
        node.scale = 0.95;
        cc.tween(node).to(0.12, { scale: 1 }).start();
        return node;
    }

    private drawPiece(node: cc.Node, color: cc.Color, alpha: number): void {
        drawMoodBlockMaterial(node, color, alpha);
    }

    private getPiecePosition(row: number, col: number, size: number): cc.Vec2 {
        const boardWidth = BOARD_COLS * CELL_SIZE;
        const boardHeight = BOARD_ROWS * CELL_SIZE;
        return new cc.Vec2(
            -boardWidth / 2 + col * CELL_SIZE + size * CELL_SIZE / 2,
            boardHeight / 2 - row * CELL_SIZE - CELL_SIZE / 2,
        );
    }

    private renderNextRow(): void {
        if (!this.nextLayer) return;
        this.nextLayer.removeAllChildren();
        const nodes = this.createNextRowPreviewNodes(NEXT_PREVIEW_OPACITY);
        for (const node of nodes) this.startNextRowPulse(node);
    }

    private createNextRowPreviewNodes(initialOpacity: number): cc.Node[] {
        const nodes: cc.Node[] = [];
        if (!this.nextLayer) return nodes;

        const previewWidth = BOARD_COLS * CELL_SIZE;
        for (const piece of zyxGameModule.nextPieces) {
            const width = piece.size * CELL_SIZE - 12;
            const x = -previewWidth / 2 + piece.col * CELL_SIZE + piece.size * CELL_SIZE / 2;
            const preview = new cc.Node(`next_${piece.col}`);
            preview.width = width;
            preview.height = NEXT_PREVIEW_HEIGHT;
            preview.opacity = initialOpacity;
            preview.setAnchorPoint(0.5, 0.5);
            preview.setPosition(x, 0);
            const moodColor = getMoodColor(piece.color);
            drawMoodBlockMaterial(preview, moodColor);
            this.nextLayer.addChild(preview);
            nodes.push(preview);
        }
        return nodes;
    }

    private animateAppendedRow(onComplete: () => void): void {
        const previousNodes = this.nextLayer ? this.nextLayer.children.slice() : [];
        for (const node of previousNodes) {
            cc.Tween.stopAllByTarget(node);
            cc.tween(node)
                .to(0.18, { opacity: 0, scaleY: 0.82 }, { easing: 'sineIn' })
                .call(() => node.destroy())
                .start();
        }

        const nextNodes = this.createNextRowPreviewNodes(0);
        for (const node of nextNodes) {
            node.scaleY = 0.82;
            cc.tween(node)
                .delay(0.16)
                .to(0.22, { opacity: NEXT_PREVIEW_OPACITY, scaleY: 1 }, { easing: 'sineOut' })
                .call(() => this.startNextRowPulse(node))
                .start();
        }

        for (const piece of zyxGameModule.pieces) {
            let node = this.pieceLayer.getChildByName(`piece_${piece.id}`);
            if (!node) node = this.createPieceView(piece, BOARD_ROWS);

            const target = this.getPiecePosition(piece.row, piece.col, piece.size);
            cc.Tween.stopAllByTarget(node);
            node.angle = 0;
            node.scale = 1;
            cc.tween(node)
                .to(0.44, { x: target.x, y: target.y }, { easing: 'cubicInOut' })
                .start();
        }
        this.scheduleOnce(onComplete, 0.46);
    }

    /** 下一排是决策预告：用柔和呼吸持续提醒，但不抢当前棋盘的操作焦点。 */
    private startNextRowPulse(node: cc.Node): void {
        if (!node || !cc.isValid(node)) return;
        const pulse = (): void => {
            if (!cc.isValid(node)) return;
            cc.tween(node)
                .to(0.52, { opacity: 255, scaleY: 1.1 }, { easing: 'sineInOut' })
                .to(0.52, { opacity: 178, scaleY: 0.98 }, { easing: 'sineInOut' })
                .call(pulse)
                .start();
        };
        pulse();
    }

    private animateGravityMoves(moves: GravityMove[], onComplete: () => void): void {
        let longestDuration = 0;
        for (const move of moves) {
            const piece = zyxGameModule.getPiece(move.id);
            const node = this.pieceLayer.getChildByName(`piece_${move.id}`);
            if (!piece || !node) continue;

            const distance = move.toRow - move.fromRow;
            // 消行后直接匀速落位，避免 quadIn 的慢启动看起来像掉落卡住。
            const duration = Math.min(0.18, 0.055 + distance * 0.02);
            const target = this.getPiecePosition(piece.row, piece.col, piece.size);
            longestDuration = Math.max(longestDuration, duration);
            cc.Tween.stopAllByTarget(node);
            node.angle = 0;
            node.scale = 1;
            cc.tween(node).to(duration, { x: target.x, y: target.y }).start();
        }

        if (longestDuration > 0) {
            this.scheduleOnce(onComplete, longestDuration);
        } else {
            onComplete();
        }
    }

    private animatePieceRemoval(pieceIds: number[], onComplete: () => void): void {
        let hasAnimation = false;
        for (const id of pieceIds) {
            const node = this.pieceLayer.getChildByName(`piece_${id}`);
            if (!node) continue;

            hasAnimation = true;
            cc.tween(node).stop();
            node.opacity = 255;
            const color = this.pieceColors[id];
            const fadeState = { alpha: 1, scale: node.scale };
            cc.tween(fadeState)
                .to(0.3, { alpha: 0, scale: 0.78 }, {
                    onUpdate: () => {
                        node.scale = fadeState.scale;
                        if (color) this.drawPiece(node, color, fadeState.alpha);
                    },
                } as any)
                .call(() => {
                    delete this.pieceColors[id];
                    node.destroy();
                })
                .start();
        }

        if (hasAnimation) {
            this.scheduleOnce(onComplete, 0.32);
        } else {
            onComplete();
        }
    }

    private animateColorPurifierRemoval(pieceIds: number[], colorIndex: number, onComplete: () => void): void {
        const color = this.getPieceColor(colorIndex);
        const pulse = new cc.Node('colorPurifierWave');
        pulse.width = 150;
        pulse.height = 150;
        pulse.zIndex = 24;
        pulse.scale = 0.4;
        pulse.opacity = 190;
        this.boardRoot.addChild(pulse);
        const pulseGraphics = pulse.addComponent(cc.Graphics);
        pulseGraphics.strokeColor = new cc.Color(color.r, color.g, color.b, 138);
        pulseGraphics.lineWidth = 12;
        pulseGraphics.circle(0, 0, 62);
        pulseGraphics.stroke();
        pulseGraphics.strokeColor = new cc.Color(255, 247, 220, 116);
        pulseGraphics.lineWidth = 4;
        pulseGraphics.circle(0, 0, 48);
        pulseGraphics.stroke();
        cc.tween(pulse)
            .to(0.46, { scale: 4.8, opacity: 0 }, { easing: 'quadOut' })
            .call(() => pulse.destroy())
            .start();

        let longestDelay = 0;
        pieceIds.forEach((id, index) => {
            const node = this.pieceLayer.getChildByName(`piece_${id}`);
            if (!node) return;
            const delay = Math.min(index, 10) * 0.018;
            longestDelay = Math.max(longestDelay, delay);
            const direction = index % 2 === 0 ? 1 : -1;
            const state = { alpha: 1, scale: 1, rotation: 0 };
            const update = () => {
                if (!cc.isValid(node)) return;
                node.opacity = Math.round(255 * state.alpha);
                node.scale = state.scale;
                node.angle = -state.rotation;
            };
            cc.Tween.stopAllByTarget(node);
            cc.tween(state)
                .delay(delay)
                .to(0.09, { scale: 1.1 }, { easing: 'quadOut', onUpdate: update })
                .to(0.25, {
                    alpha: 0,
                    scale: 0.18,
                    rotation: direction * 28,
                }, { easing: 'backIn', onUpdate: update })
                .call(() => {
                    delete this.pieceColors[id];
                    if (cc.isValid(node)) node.destroy();
                })
                .start();
        });

        this.scheduleOnce(onComplete, longestDelay + 0.36);
    }

    /** 满行先整体亮起，再由 Spine 光爆与碎片共同完成消除。 */
    private playRowClearEffects(rows: number[]): void {
        for (const row of rows) this.playRowClearEffect(row);
    }

    private playRowClearEffect(row: number): void {
        if (!this.boardRoot) return;

        const boardWidth = BOARD_COLS * CELL_SIZE;
        const rowY = this.getPiecePosition(row, 0, 1).y;
        const flash = new cc.Node(`rowFlash_${row}`);
        flash.width = boardWidth;
        flash.height = CELL_SIZE - 4;
        flash.setAnchorPoint(0.5, 0.5);
        flash.setPosition(0, rowY);
        flash.zIndex = 30;
        this.boardRoot.addChild(flash);

        const flashState = { alpha: 0, scaleX: 0.16 };
        const updateFlash = () => {
            if (!cc.isValid(flash)) return;
            flash.scaleX = flashState.scaleX;
            this.drawRowFlash(flash, flashState.alpha);
        };
        updateFlash();
        cc.tween(flashState)
            .to(0.08, { alpha: 0.72, scaleX: 1 }, { easing: 'quadOut', onUpdate: updateFlash })
            .to(0.22, { alpha: 0, scaleX: 1.04 }, { easing: 'quadIn', onUpdate: updateFlash })
            .call(() => flash.destroy())
            .start();

        if (this.playSpineRowBurst(rowY, boardWidth)) return;
        this.playFallbackRowSweep(rowY, boardWidth, row);
    }

    private playSpineRowBurst(rowY: number, boardWidth: number): boolean {
        if (!this.clearSpineData) return false;

        const positions = [-boardWidth * 0.24, boardWidth * 0.24];
        for (let index = 0; index < positions.length; index++) {
            const node = new cc.Node(`rowSpine_${index}`);
            node.setPosition(positions[index], rowY);
            node.opacity = 175;
            node.scaleX = 0.78;
            node.scaleY = 0.42;
            node.zIndex = 34;
            this.boardRoot.addChild(node);

            const skeleton = node.addComponent(sp.Skeleton);
            skeleton.skeletonData = this.clearSpineData;
            skeleton.premultipliedAlpha = false;
            skeleton.timeScale = 1.7;
            skeleton.setAnimation(0, index === 0 ? 'action' : 'action2', false);
            skeleton.setCompleteListener(() => {
                if (cc.isValid(node)) node.destroy();
            });
            this.scheduleOnce(() => {
                if (cc.isValid(node)) node.destroy();
            }, 0.62);
        }
        return true;
    }

    private playFallbackRowSweep(rowY: number, boardWidth: number, row: number): void {
        const sweepWidth = CELL_SIZE * 1.55;
        const sweep = new cc.Node(`rowSweep_${row}`);
        sweep.width = sweepWidth;
        sweep.height = CELL_SIZE - 10;
        sweep.setAnchorPoint(0.5, 0.5);
        sweep.zIndex = 31;
        this.boardRoot.addChild(sweep);

        const startX = -boardWidth / 2 - sweepWidth / 2;
        const endX = boardWidth / 2 + sweepWidth / 2;
        const sweepState = { alpha: 0, x: startX };
        const updateSweep = () => {
            if (!cc.isValid(sweep)) return;
            sweep.setPosition(sweepState.x, rowY);
            this.drawRowSweep(sweep, sweepState.alpha);
        };
        updateSweep();
        cc.tween(sweepState)
            .to(0.05, { alpha: 0.72, x: startX + 34 }, { easing: 'quadOut', onUpdate: updateSweep })
            .to(0.2, { alpha: 0.68, x: endX - 34 }, { easing: 'sineInOut', onUpdate: updateSweep })
            .to(0.05, { alpha: 0, x: endX }, { easing: 'quadIn', onUpdate: updateSweep })
            .call(() => sweep.destroy())
            .start();
    }

    private drawRowFlash(node: cc.Node, alpha: number): void {
        const safeAlpha = Math.max(0, Math.min(1, alpha));
        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        const width = node.width;
        const height = node.height;
        graphics.clear();

        graphics.fillColor = new cc.Color(244, 190, 77, Math.round(72 * safeAlpha));
        graphics.roundRect(-width / 2, -height / 2, width, height, 16);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 226, 151, Math.round(126 * safeAlpha));
        graphics.roundRect(-width / 2, -9, width, 18, 9);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 255, 255, Math.round(230 * safeAlpha));
        graphics.roundRect(-width / 2, -2, width, 4, 2);
        graphics.fill();
    }

    private drawRowSweep(node: cc.Node, alpha: number): void {
        const safeAlpha = Math.max(0, Math.min(1, alpha));
        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        const width = node.width;
        const height = node.height;
        graphics.clear();

        graphics.fillColor = new cc.Color(239, 161, 91, Math.round(48 * safeAlpha));
        graphics.roundRect(-width / 2, -height / 2, width, height, 20);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 225, 146, Math.round(116 * safeAlpha));
        graphics.roundRect(-width * 0.28, -height / 2, width * 0.56, height, 16);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 255, 255, Math.round(238 * safeAlpha));
        graphics.roundRect(-6, -height / 2, 12, height, 6);
        graphics.fill();
    }

    private animateHammerRemoval(id: number, onComplete: () => void): void {
        const pieceNode = this.pieceLayer.getChildByName(`piece_${id}`);
        const color = this.pieceColors[id];
        if (!pieceNode || !color) {
            onComplete();
            return;
        }

        cc.tween(pieceNode).stop();
        const strike = createHammerGlyph(this.pieceLayer, pieceNode.x + 42, pieceNode.y + 62, 0.88);
        strike.name = `hammerStrike_${id}`;
        strike.angle = 68;
        strike.zIndex = 45;

        cc.tween(pieceNode)
            .to(0.1, { scale: 1.08 }, { easing: 'quadOut' })
            .start();
        cc.tween(strike)
            .to(0.1, {
                x: pieceNode.x + 7,
                y: pieceNode.y + 13,
                angle: 12,
                scale: 1.08,
            }, { easing: 'quadIn' })
            .call(() => {
                if (!cc.isValid(pieceNode)) return;
                this.drawPieceCracks(pieceNode);
                this.playHammerImpact(pieceNode.x, pieceNode.y);
            })
            .delay(0.065)
            .call(() => {
                if (!cc.isValid(pieceNode)) return;
                this.spawnPieceShards(pieceNode, color, id, false);
                delete this.pieceColors[id];
                pieceNode.destroy();
            })
            .to(0.12, {
                y: pieceNode.y + 42,
                angle: 32,
                scale: 0.72,
            }, { easing: 'quadOut' })
            .call(() => strike.destroy())
            .start();

        this.scheduleOnce(onComplete, 0.67);
    }

    private drawPieceCracks(node: cc.Node): void {
        const graphics = node.getComponent(cc.Graphics);
        if (!graphics) return;

        const width = node.width;
        const height = node.height;
        graphics.strokeColor = new cc.Color(255, 250, 224, 235);
        graphics.lineWidth = 3;
        graphics.moveTo(4, height / 2 - 5);
        graphics.lineTo(-5, 12);
        graphics.lineTo(7, 2);
        graphics.lineTo(-8, -11);
        graphics.lineTo(-2, -height / 2 + 4);
        graphics.moveTo(-5, 12);
        graphics.lineTo(-Math.min(width / 2 - 6, 34), 2);
        graphics.moveTo(7, 2);
        graphics.lineTo(Math.min(width / 2 - 6, 42), -8);
        graphics.stroke();
    }

    private spawnPieceShards(pieceNode: cc.Node, color: cc.Color, id: number, rowClear: boolean): void {
        const targetShardWidth = rowClear ? 20 : 24;
        const minColumns = rowClear ? 4 : 3;
        const maxColumns = rowClear ? 12 : 10;
        const columns = Math.max(minColumns, Math.min(maxColumns, Math.ceil(pieceNode.width / targetShardWidth)));
        const rows = rowClear ? 5 : 4;
        const shardWidth = pieceNode.width / columns;
        const shardHeight = pieceNode.height / rows;
        let shardIndex = 0;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const index = shardIndex++;
                const shard = new cc.Node(`pieceShard_${id}_${index}`);
                shard.width = shardWidth + 0.6;
                shard.height = shardHeight + 0.6;
                shard.setAnchorPoint(0.5, 0.5);
                const startX = pieceNode.x - pieceNode.width / 2 + shardWidth * (col + 0.5);
                const startY = pieceNode.y + pieceNode.height / 2 - shardHeight * (row + 0.5);
                shard.setPosition(startX, startY);
                shard.zIndex = 28;
                this.pieceLayer.addChild(shard);

                const side = rowClear
                    ? (startX < 0 ? -1 : 1)
                    : (startX < pieceNode.x ? -1 : 1);
                const spread = side * (
                    rowClear
                        ? 16 + (index % 4) * 7
                        : 28 + (index % 4) * 10
                ) + ((index * 7) % 9) - 4;
                const lift = rowClear
                    ? 10 + ((index * 7) % 20)
                    : 26 + ((index * 11) % 29);
                const fall = rowClear
                    ? 78 + ((index * 13) % 43)
                    : 112 + ((index * 17) % 62);
                const spinDirection = (index + row + col) % 2 === 0 ? 1 : -1;
                const turn = spinDirection * (
                    rowClear
                        ? 46 + (index % 7) * 18
                        : 62 + (index % 8) * 22
                );
                const startRotation = ((index * 13) % 19) - 9;
                // 碎片只走一次「爆散并消失」；不再先落一半、再进入第二段下坠。
                const burstDuration = 0.28 + (index % 4) * 0.015;
                const burstY = startY + lift * 0.42 - fall * 0.24;
                const shardState = {
                    x: startX,
                    y: startY,
                    rotation: startRotation,
                    scale: 1,
                    alpha: 1,
                };
                const updateShard = () => {
                    if (!cc.isValid(shard)) return;
                    shard.setPosition(shardState.x, shardState.y);
                    shard.angle = -shardState.rotation;
                    shard.scale = shardState.scale;
                    this.drawPieceShard(shard, color, shardState.alpha, index);
                };
                updateShard();
                cc.tween(shardState)
                    .to(burstDuration, {
                        x: startX + spread,
                        y: burstY,
                        rotation: turn,
                        scale: 0.22 + (index % 4) * 0.045,
                        alpha: 0,
                    }, { easing: 'quadOut', onUpdate: updateShard })
                    .call(() => shard.destroy())
                    .start();
            }
        }
    }

    private drawPieceShard(node: cc.Node, color: cc.Color, alpha: number, index: number): void {
        const safeAlpha = Math.max(0, Math.min(1, alpha));
        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        const width = node.width;
        const height = node.height;
        const cutA = Math.min(4, 1.2 + ((index * 5) % 4));
        const cutB = Math.min(4, 1 + ((index * 7) % 5));
        const tone = ((index * 3) % 5 - 2) * 7;
        const red = Math.max(0, Math.min(255, color.r + tone));
        const green = Math.max(0, Math.min(255, color.g + tone));
        const blue = Math.max(0, Math.min(255, color.b + tone));
        graphics.clear();
        graphics.fillColor = new cc.Color(red, green, blue, Math.round(255 * safeAlpha));
        graphics.moveTo(-width / 2 + cutA, -height / 2);
        graphics.lineTo(width / 2 - cutB, -height / 2 + cutA * 0.25);
        graphics.lineTo(width / 2, height / 2 - cutA);
        graphics.lineTo(cutB * 0.25, height / 2);
        graphics.lineTo(-width / 2 + cutB, height / 2 - cutB * 0.25);
        graphics.lineTo(-width / 2, -cutA);
        graphics.lineTo(-width / 2 + cutA, -height / 2);
        graphics.fill();

        graphics.strokeColor = new cc.Color(255, 255, 255, Math.round(92 * safeAlpha));
        graphics.lineWidth = 1.3;
        graphics.moveTo(-width / 2 + cutB + 1, height / 2 - cutB * 0.25 - 1);
        graphics.lineTo(cutB * 0.25, height / 2 - 1);
        graphics.lineTo(width / 2 - 1, height / 2 - cutA);
        graphics.stroke();

        graphics.strokeColor = new cc.Color(
            Math.round(color.r * 0.62),
            Math.round(color.g * 0.62),
            Math.round(color.b * 0.62),
            Math.round(78 * safeAlpha),
        );
        graphics.lineWidth = 1;
        graphics.moveTo(-width / 2 + cutA, -height / 2 + 1);
        graphics.lineTo(width / 2 - cutB, -height / 2 + cutA * 0.25 + 1);
        graphics.stroke();

        if (index % 4 === 0) {
            graphics.fillColor = new cc.Color(255, 255, 255, Math.round(145 * safeAlpha));
            graphics.circle(width * 0.12, height * 0.08, Math.max(0.9, Math.min(width, height) * 0.06));
            graphics.fill();
        }
    }

    private createHammerToolDemo(panel: cc.Node, centerY: number): void {
        const stage = uimanager.createRect(
            panel,
            'hammerDemoStage',
            430,
            132,
            new cc.Color(255, 250, 234),
            255,
            24,
            0,
            centerY,
        );
        const block = new cc.Node('hammerDemoBlock');
        block.width = 112;
        block.height = 66;
        block.setPosition(62, -9);
        stage.addChild(block);
        const color = getMoodColor(3);
        drawMoodBlockMaterial(block, color);

        const hammer = createHammerGlyph(stage, -72, 31, 0.72);
        hammer.angle = 54;
        const play = (): void => {
            if (!cc.isValid(stage) || !cc.isValid(hammer) || !cc.isValid(block)) return;
            cc.Tween.stopAllByTarget(block);
            block.opacity = 255;
            block.scale = 1;
            block.angle = 0;
            hammer.setPosition(-72, 31);
            hammer.angle = 54;
            hammer.scale = 0.72;
            cc.tween(hammer)
                .delay(0.26)
                .to(0.32, { x: 35, y: 12, angle: 8, scale: 0.82 }, { easing: 'quadIn' })
                .call(() => {
                    if (!cc.isValid(block)) return;
                    block.scale = 1.08;
                    this.spawnToolDemoShards(stage, block.x, block.y, color, 12);
                    cc.tween(block)
                        .to(0.1, { scale: 0.82, opacity: 0 }, { easing: 'quadIn' })
                        .start();
                })
                .to(0.2, { x: -20, y: 42, angle: 32, scale: 0.7 }, { easing: 'quadOut' })
                .delay(0.78)
                .call(play)
                .start();
        };
        play();
    }

    private createMagicWandToolDemo(panel: cc.Node, centerY: number): void {
        const stage = uimanager.createRect(
            panel,
            'magicWandDemoStage',
            430,
            132,
            new cc.Color(255, 250, 234),
            255,
            24,
            0,
            centerY,
        );
        const matchingColor = getMoodColor(2);
        const otherColor = getMoodColor(4);
        const positions = [-132, -45, 42, 129];
        const blocks = positions.map((x, index) => {
            const block = new cc.Node(`magicDemoBlock_${index}`);
            block.width = 66;
            block.height = 52;
            block.setPosition(x, -23);
            stage.addChild(block);
            drawMoodBlockMaterial(block, index === 1 ? otherColor : matchingColor);
            return block;
        });
        const wand = createPurifierGlyph(stage, -126, 35, 0.68);
        wand.angle = 8;

        const play = (): void => {
            if (!cc.isValid(stage) || !cc.isValid(wand)) return;
            blocks.forEach((block) => {
                if (!cc.isValid(block)) return;
                cc.Tween.stopAllByTarget(block);
                block.opacity = 255;
                block.scale = 1;
            });
            wand.setPosition(-126, 35);
            wand.angle = 8;
            wand.scale = 0.68;
            cc.tween(wand)
                .delay(0.28)
                .to(0.58, { x: 122, y: 35, angle: -8, scale: 0.74 }, { easing: 'sineInOut' })
                .call(() => {
                    [blocks[0], blocks[2], blocks[3]].forEach((block, index) => {
                        if (!cc.isValid(block)) return;
                        cc.tween(block)
                            .delay(index * 0.045)
                            .to(0.1, { scale: 1.12 }, { easing: 'quadOut' })
                            .call(() => this.spawnToolDemoShards(stage, block.x, block.y, matchingColor, 8))
                            .to(0.14, { scale: 0.76, opacity: 0 }, { easing: 'quadIn' })
                            .start();
                    });
                })
                .to(0.2, { y: 48, scale: 0.62 }, { easing: 'quadOut' })
                .delay(0.88)
                .call(play)
                .start();
        };
        play();
    }

    private spawnToolDemoShards(
        parent: cc.Node,
        x: number,
        y: number,
        color: cc.Color,
        count: number,
    ): void {
        for (let index = 0; index < count; index++) {
            const shard = new cc.Node(`toolDemoShard_${index}`);
            shard.width = 10 + (index % 3) * 3;
            shard.height = 8 + (index % 2) * 4;
            shard.setPosition(x + ((index * 17) % 24) - 12, y + ((index * 11) % 18) - 9);
            shard.zIndex = 20;
            parent.addChild(shard);
            const state = {
                x: shard.x,
                y: shard.y,
                rotation: (index * 19) % 32 - 16,
                scale: 1,
                alpha: 1,
            };
            const direction = index % 2 === 0 ? 1 : -1;
            const update = (): void => {
                if (!cc.isValid(shard)) return;
                shard.setPosition(state.x, state.y);
                shard.angle = -state.rotation;
                shard.scale = state.scale;
                this.drawPieceShard(shard, color, state.alpha, index);
            };
            update();
            cc.tween(state)
                .to(0.12, {
                    x: state.x + direction * (18 + (index % 4) * 6),
                    y: state.y + 16 + (index % 3) * 6,
                    rotation: direction * (44 + index * 7),
                }, { easing: 'quadOut', onUpdate: update })
                .to(0.44, {
                    x: state.x + direction * (31 + (index % 4) * 8),
                    y: state.y - 48 - (index % 3) * 12,
                    rotation: direction * (96 + index * 11),
                    scale: 0.28,
                    alpha: 0,
                }, { easing: 'quadIn', onUpdate: update })
                .call(() => shard.destroy())
                .start();
        }
    }

    private playHammerImpact(x: number, y: number): void {
        const impact = new cc.Node('hammerImpact');
        impact.width = 108;
        impact.height = 108;
        impact.setAnchorPoint(0.5, 0.5);
        impact.setPosition(x, y);
        impact.zIndex = 44;
        this.pieceLayer.addChild(impact);

        const impactState = { alpha: 1, scale: 0.34 };
        const updateImpact = () => {
            if (!cc.isValid(impact)) return;
            impact.scale = impactState.scale;
            const graphics = impact.getComponent(cc.Graphics) || impact.addComponent(cc.Graphics);
            graphics.clear();
            graphics.strokeColor = new cc.Color(255, 225, 127, Math.round(235 * impactState.alpha));
            graphics.lineWidth = 5;
            graphics.circle(0, 0, 28);
            graphics.stroke();
            graphics.strokeColor = new cc.Color(255, 255, 255, Math.round(190 * impactState.alpha));
            graphics.lineWidth = 3;
            for (let index = 0; index < 8; index++) {
                const angle = index * Math.PI / 4;
                graphics.moveTo(Math.cos(angle) * 35, Math.sin(angle) * 35);
                graphics.lineTo(Math.cos(angle) * 50, Math.sin(angle) * 50);
            }
            graphics.stroke();
        };
        updateImpact();
        cc.tween(impactState)
            .to(0.22, { alpha: 0, scale: 1.3 }, { easing: 'quadOut', onUpdate: updateImpact })
            .call(() => impact.destroy())
            .start();
    }

    private animateRowShatter(pieceIds: number[]): void {
        const targets: { id: number; node: cc.Node; color: cc.Color }[] = [];
        for (const id of pieceIds) {
            const node = this.pieceLayer.getChildByName(`piece_${id}`);
            const color = this.pieceColors[id];
            if (!node || !color) continue;
            targets.push({ id, node, color });
            cc.tween(node).stop();
            cc.tween(node)
                .to(0.045, { scaleX: 1.03, scaleY: 0.72 }, { easing: 'quadOut' })
                .start();
        }

        this.scheduleOnce(() => {
            for (const target of targets) {
                if (!cc.isValid(target.node)) continue;
                this.spawnPieceShards(target.node, target.color, target.id, true);
                delete this.pieceColors[target.id];
                target.node.destroy();
            }
        }, 0.05);
    }

    private animateElimination(result: EliminateResult, onComplete: () => void): void {
        this.updateHud();
        const rewardText = result.collectedMoodTypes.length > 0
            ? ` · 表情 +${result.collectedMoodTypes.length}`
            : '';
        uimanager.showToast(`捋顺 ${result.clearedRows} 行${rewardText}`);
        audioManager.playSound('break');
        this.playTutorialNpcBounce();
        this.playRowClearEffects(result.clearedRowIndexes);
        this.playMoodCollect(result.removedPieceIds);
        this.animateRowShatter(result.removedPieceIds);
        // 满行已在逻辑层移除，剩余格子可与压扁/爆散特效同帧开始掉落。
        onComplete();
    }

    private playMoodCollect(pieceIds: number[]): void {
        let rewardIndex = 0;
        for (const id of pieceIds) {
            const pieceNode = this.pieceLayer.getChildByName(`piece_${id}`);
            const stamp = pieceNode ? pieceNode.getChildByName('moodStamp') : null;
            if (!pieceNode || !stamp) continue;

            const moodIndex = Number((stamp as any).moodIndex) || 1;
            const worldStart = pieceNode.convertToWorldSpaceAR(stamp.getPosition());
            const start = this.node.convertToNodeSpaceAR(worldStart);
            const token = createMoodToken(this.node, moodIndex, start.x, start.y, 35, 0);
            token.zIndex = 900;
            const target = this.moodBottle ? this.moodBottle.getPosition() : new cc.Vec2(30, 560);
            const control = new cc.Vec2(
                start.x + (target.x - start.x) * 0.42 + (rewardIndex % 2 === 0 ? -55 : 55),
                Math.max(start.y, target.y) + 150,
            );
            const state = { t: 0 };
            const delay = rewardIndex * 0.08;
            rewardIndex++;
            cc.tween(token)
                .delay(delay)
                .to(0.08, { opacity: 255, scale: 1.18 }, { easing: 'backOut' })
                .start();
            cc.tween(state)
                .delay(delay + 0.04)
                .to(0.52, { t: 1 }, {
                    easing: 'quadIn',
                    onUpdate: () => {
                        if (!cc.isValid(token)) return;
                        const oneMinus = 1 - state.t;
                        token.x = oneMinus * oneMinus * start.x
                            + 2 * oneMinus * state.t * control.x
                            + state.t * state.t * target.x;
                        token.y = oneMinus * oneMinus * start.y
                            + 2 * oneMinus * state.t * control.y
                            + state.t * state.t * target.y;
                        token.scale = 1.18 - state.t * 0.55;
                        token.angle = -state.t * 220;
                    },
                })
                .call(() => {
                    this.displayedRoundMoods++;
                    this.updateHudNumber(this.roundMoodLabel, this.displayedRoundMoods);
                    playBottleBurp(this.moodBottle);
                    this.addMoodInsideBottle();
                    if (cc.isValid(token)) token.destroy();
                })
                .start();
        }
    }

    private addMoodInsideBottle(): void {
        if (!this.moodBottle || !cc.isValid(this.moodBottle)) return;
        const absolute = zyxGameModule.happyBottleProgress + this.displayedRoundMoods;
        presentWishBottleAbsoluteProgress(this.moodBottle, absolute, HAPPY_BOTTLE_TARGET, {
            flyTargetLocal: cc.v2(this.moodBottle.x + 40, this.moodBottle.y + 320),
            onSlotProgress: (slot) => {
                // 局内右侧文案仍是本局收集数；瓶身进度用绝对量驱动满瓶上飞。
                if (slot >= HAPPY_BOTTLE_TARGET) playBottleBurp(this.moodBottle);
            },
        });
    }

    private resolveStableBoard(chain: number, onStable: () => void): void {
        const gravityMoves = zyxGameModule.applyGravity();
        if (gravityMoves.length > 0) {
            this.animateGravityMoves(gravityMoves, () => this.resolveStableBoard(chain, onStable));
            return;
        }

        const elimination = zyxGameModule.eliminateFullRows(chain);
        if (elimination.clearedRows > 0) {
            gameSettings.vibrateLight();
            this.animateElimination(elimination, () => this.resolveStableBoard(chain + 1, onStable));
            return;
        }

        this.updateBoardDangerState();
        onStable();
    }

    private appendNextRowAndResolve(): void {
        if (!zyxGameModule.appendNextRow()) {
            this.handleChallengeFailed('整理台暂时放满了');
            return;
        }

        this.animateAppendedRow(() => {
            this.resolveStableBoard(1, () => {
                this.ensureMinimumOccupiedRows(2, () => {
                    if (zyxGameModule.isGameOver()) {
                        this.handleChallengeFailed('整理台暂时放满了');
                        return;
                    }
                    if (this.tryShowRoundRescue()) return;
                    this.locked = false;
                    this.idleSeconds = 0;
                });
            });
        });
    }

    /** 连消可能把刚升起的一排再次清掉；持续补排并完整结算，直到场上至少保留两排。 */
    private ensureMinimumOccupiedRows(minimumRows: number, onReady: () => void): void {
        if (zyxGameModule.getOccupiedRowCount() >= minimumRows) {
            onReady();
            return;
        }
        if (!zyxGameModule.appendNextRow()) {
            this.handleChallengeFailed('整理台暂时放满了');
            return;
        }
        this.animateAppendedRow(() => {
            this.resolveStableBoard(1, () => this.ensureMinimumOccupiedRows(minimumRows, onReady));
        });
    }

    private tryShowRoundRescue(): boolean {
        if (!zyxGameModule.hasEnteredRescueZone(2)) return false;
        const now = Date.now();
        if (now - this.lastRoundRescueOfferedAt < ROUND_RESCUE_COOLDOWN_MS) return false;
        this.lastRoundRescueOfferedAt = now;
        this.markInteraction();
        this.showRoundRescuePrompt();
        this.locked = false;
        this.idleSeconds = 0;
        return true;
    }

    /** 用场内倒计时提示代替强弹窗；提示层本身不遮挡棋盘操作。 */
    private showRoundRescuePrompt(): void {
        this.dismissRoundRescuePrompt(false);
        this.roundRescueInteractive = false;

        const safeArea = uimanager.getSafeAreaMetrics();
        const iconX = this.node.width / 2 - safeArea.right - 66;
        const iconY = Math.max(
            TOOL_DOCK_CENTER_Y + 6,
            -this.node.height / 2 + safeArea.bottom + 128,
        );
        const bubbleWidth = 312;
        const bubbleX = Math.max(
            -this.node.width / 2 + safeArea.left + bubbleWidth / 2 + 16,
            Math.min(
                this.node.width / 2 - safeArea.right - bubbleWidth / 2 - 16,
                iconX - 104,
            ),
        );

        const prompt = new cc.Node('roundRescuePrompt');
        prompt.width = this.node.width;
        prompt.height = this.node.height;
        prompt.setAnchorPoint(0.5, 0.5);
        prompt.setPosition(68, 0);
        prompt.opacity = 0;
        prompt.zIndex = 720;
        this.node.addChild(prompt);
        this.roundRescuePrompt = prompt;

        uimanager.createRect(
            prompt,
            'roundRescueBubbleShadow',
            bubbleWidth + 6,
            72,
            new cc.Color(72, 48, 43),
            58,
            22,
            bubbleX + 3,
            iconY + 97,
        );
        const bubble = uimanager.createRect(
            prompt,
            'roundRescueBubble',
            bubbleWidth,
            68,
            new cc.Color(255, 249, 232),
            252,
            21,
            bubbleX,
            iconY + 101,
        );
        const bubbleGraphics = bubble.getComponent(cc.Graphics);
        bubbleGraphics.strokeColor = new cc.Color(220, 113, 91, 178);
        bubbleGraphics.lineWidth = 2;
        bubbleGraphics.roundRect(-bubbleWidth / 2 + 1, -33, bubbleWidth - 2, 66, 20);
        bubbleGraphics.stroke();

        const pointer = new cc.Node('roundRescueBubblePointer');
        pointer.setPosition(iconX - bubbleX, -33);
        bubble.addChild(pointer);
        const pointerGraphics = pointer.addComponent(cc.Graphics);
        pointerGraphics.fillColor = new cc.Color(255, 249, 232, 252);
        pointerGraphics.moveTo(-11, 0);
        pointerGraphics.lineTo(11, 0);
        pointerGraphics.lineTo(0, -17);
        pointerGraphics.close();
        pointerGraphics.fill();

        const bubbleLabel = uimanager.createLabel(
            bubble,
            '分享给好友，清除全部色块',
            0,
            1,
            20,
            HUD_VALUE_COLOR,
            bubbleWidth - 34,
            40,
        );
        this.makeHintLabelBold(bubbleLabel, new cc.Color(255, 249, 232), 0.72);

        const icon = new cc.Node('roundRescueLightningButton');
        icon.width = 122;
        icon.height = 122;
        icon.setAnchorPoint(0.5, 0.5);
        icon.setPosition(iconX, iconY);
        icon.zIndex = 3;
        prompt.addChild(icon);
        const button = icon.addComponent(cc.Button);
        button.transition = cc.Button.Transition.NONE;
        button.interactable = false;
        icon.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            this.handleRoundRescueClick();
        }, this);

        const ring = new cc.Node('roundRescueCountdownRing');
        ring.width = 118;
        ring.height = 118;
        ring.zIndex = 1;
        icon.addChild(ring);

        const heartbeat = new cc.Node('roundRescueHeartbeat');
        heartbeat.width = 90;
        heartbeat.height = 90;
        heartbeat.zIndex = 2;
        icon.addChild(heartbeat);
        this.drawRoundRescueLightning(heartbeat);
        cc.tween(heartbeat)
            .repeatForever(
                cc.tween()
                    .to(0.1, { scale: 1.17 }, { easing: 'quadOut' })
                    .to(0.1, { scale: 0.98 }, { easing: 'quadIn' })
                    .to(0.08, { scale: 1.1 }, { easing: 'quadOut' })
                    .to(0.12, { scale: 1 }, { easing: 'backOut' })
                    .delay(0.56),
            )
            .start();

        const countdownState = { progress: 1 };
        this.roundRescueCountdownState = countdownState;
        const updateCountdown = () => {
            if (!cc.isValid(ring) || this.roundRescueCountdownState !== countdownState) return;
            this.drawRoundRescueCountdown(ring, countdownState.progress);
        };
        updateCountdown();
        cc.tween(countdownState)
            .to(10, { progress: 0 }, { easing: 'linear', onUpdate: updateCountdown })
            .call(() => {
                if (this.roundRescueCountdownState !== countdownState) return;
                this.dismissRoundRescuePrompt(true);
            })
            .start();

        cc.tween(prompt)
            .to(0.38, { x: 0, opacity: 255 }, { easing: 'backOut' })
            .call(() => {
                if (this.roundRescuePrompt !== prompt || !cc.isValid(prompt)) return;
                this.roundRescueInteractive = true;
                button.interactable = true;
            })
            .start();
    }

    private handleRoundRescueClick(): void {
        if (
            !this.roundRescueInteractive
            || this.locked
            || this.rewardedAdLoading
            || !this.roundRescuePrompt
        ) return;
        this.dismissRoundRescuePrompt(false);
        this.setToolSelectionMode(null);
        this.requestRoundRescue();
    }

    private dismissRoundRescuePrompt(animated: boolean): void {
        const prompt = this.roundRescuePrompt;
        const countdownState = this.roundRescueCountdownState;
        this.roundRescueInteractive = false;
        this.roundRescuePrompt = null;
        this.roundRescueCountdownState = null;
        if (countdownState) cc.Tween.stopAllByTarget(countdownState);
        if (!prompt || !cc.isValid(prompt)) return;

        cc.Tween.stopAllByTarget(prompt);
        if (!animated) {
            prompt.destroy();
            return;
        }
        cc.tween(prompt)
            .to(0.28, { x: 104, opacity: 0 }, { easing: 'sineIn' })
            .call(() => {
                if (cc.isValid(prompt)) prompt.destroy();
            })
            .start();
    }

    /** 危险状态只由棋盘高度决定，与一次性的福利入口生命周期解耦。 */
    private updateBoardDangerState(): void {
        if (zyxGameModule.hasEnteredRescueZone(2)) this.startBoardDangerGlow();
        else this.stopBoardDangerGlow();
    }

    private startBoardDangerGlow(): void {
        if (this.boardDangerHalo && cc.isValid(this.boardDangerHalo)) return;
        if (!this.boardRoot || !cc.isValid(this.boardRoot)) return;
        const boardWidth = BOARD_COLS * CELL_SIZE;
        const boardHeight = BOARD_ROWS * CELL_SIZE;

        const halo = new cc.Node('roundRescueBoardHalo');
        halo.width = boardWidth + 86;
        halo.height = boardHeight + 86;
        halo.setPosition(0, BOARD_CENTER_Y);
        halo.zIndex = 8;
        halo.opacity = 88;
        halo.scale = 0.998;
        this.node.addChild(halo);
        this.boardDangerHalo = halo;
        const haloGraphics = halo.addComponent(cc.Graphics);
        haloGraphics.strokeColor = new cc.Color(221, 45, 45, 24);
        haloGraphics.lineWidth = 44;
        haloGraphics.roundRect(-boardWidth / 2 - 13, -boardHeight / 2 - 13, boardWidth + 26, boardHeight + 26, 32);
        haloGraphics.stroke();
        haloGraphics.strokeColor = new cc.Color(239, 58, 48, 68);
        haloGraphics.lineWidth = 22;
        haloGraphics.roundRect(-boardWidth / 2 - 8, -boardHeight / 2 - 8, boardWidth + 16, boardHeight + 16, 27);
        haloGraphics.stroke();
        haloGraphics.strokeColor = new cc.Color(255, 118, 86, 228);
        haloGraphics.lineWidth = 6;
        haloGraphics.roundRect(-boardWidth / 2 - 3, -boardHeight / 2 - 3, boardWidth + 6, boardHeight + 6, 22);
        haloGraphics.stroke();

        cc.tween(halo)
            .repeatForever(
                cc.tween()
                    .to(0.34, { opacity: 255, scale: 1.01 }, { easing: 'sineInOut' })
                    .to(0.3, { opacity: 66, scale: 0.998 }, { easing: 'sineInOut' })
                    .delay(0.12),
            )
            .start();
    }

    private stopBoardDangerGlow(): void {
        const halo = this.boardDangerHalo;
        this.boardDangerHalo = null;
        if (!halo || !cc.isValid(halo)) return;
        cc.Tween.stopAllByTarget(halo);
        halo.destroy();
    }

    private drawRoundRescueLightning(node: cc.Node): void {
        const graphics = node.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(105, 70, 58, 78);
        graphics.circle(2, -4, 43);
        graphics.fill();
        graphics.fillColor = new cc.Color(91, 181, 128, 255);
        graphics.circle(0, 0, 43);
        graphics.fill();
        graphics.strokeColor = new cc.Color(218, 246, 207, 255);
        graphics.lineWidth = 4;
        graphics.circle(0, 0, 40);
        graphics.stroke();

        graphics.fillColor = new cc.Color(255, 224, 99, 255);
        graphics.moveTo(7, 31);
        graphics.lineTo(-17, 2);
        graphics.lineTo(-4, 2);
        graphics.lineTo(-12, -31);
        graphics.lineTo(20, 7);
        graphics.lineTo(6, 7);
        graphics.close();
        graphics.fill();
        graphics.strokeColor = new cc.Color(255, 249, 221, 255);
        graphics.lineWidth = 3;
        graphics.moveTo(7, 31);
        graphics.lineTo(-17, 2);
        graphics.lineTo(-4, 2);
        graphics.lineTo(-12, -31);
        graphics.lineTo(20, 7);
        graphics.lineTo(6, 7);
        graphics.close();
        graphics.stroke();
    }

    private drawRoundRescueCountdown(node: cc.Node, progress: number): void {
        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        const safeProgress = Math.max(0, Math.min(1, progress));
        graphics.clear();
        graphics.lineCap = cc.Graphics.LineCap.ROUND;
        graphics.strokeColor = new cc.Color(86, 59, 51, 94);
        graphics.lineWidth = 9;
        graphics.circle(0, 0, 53);
        graphics.stroke();
        if (safeProgress <= 0) return;
        graphics.strokeColor = safeProgress > 0.34
            ? new cc.Color(255, 214, 96, 255)
            : new cc.Color(255, 104, 78, 255);
        graphics.lineWidth = 9;
        graphics.arc(
            0,
            0,
            53,
            -Math.PI / 2,
            -Math.PI / 2 + Math.PI * 2 * safeProgress,
            false,
        );
        graphics.stroke();
    }

    private requestRoundRescue(): void {
        if (this.rewardedAdLoading) return;
        this.rewardedAdLoading = true;
        this.locked = true;
        this.showRewardOffer((rewarded) => {
            this.rewardedAdLoading = false;
            if (!rewarded) {
                this.locked = false;
                this.idleSeconds = 0;
                uimanager.showToast(getRewardOfferFailToast('rescue'));
                return;
            }
            this.applyRoundRescue();
        });
    }

    private applyRoundRescue(): void {
        const removedPieceIds = zyxGameModule.removeAllPieces();
        this.setToolSelectionMode(null);
        this.locked = true;
        this.playEmergencyClearEffect(removedPieceIds, () => {
            this.resolveStableBoard(1, () => {
                this.updateHud();
                uimanager.showToast('整理台已全部清空，自动补足两排');
                this.appendNextRowAndResolve();
            });
        });
    }

    private updateHud(): void {
        const isNewRecord = zyxGameModule.score > zyxGameModule.startingBestScore;
        const scoreColor = isNewRecord ? MOOD_COLORS.coral : HUD_VALUE_COLOR;
        this.setLabelTone(this.scoreLabel, scoreColor, 1.1);
        this.setLabelTone(this.bestLabel, HUD_VALUE_COLOR, 1.1);
        this.setLabelTone(this.roundMoodLabel, HUD_VALUE_COLOR, 1.05);
        this.updateHudNumber(this.scoreLabel, zyxGameModule.score);
        this.updateHudNumber(this.bestLabel, zyxGameModule.bestScore);
        this.updateHudNumber(this.roundMoodLabel, this.displayedRoundMoods);
        this.updateRecordTag(isNewRecord);
        const hammerColor = this.hammerMode ? BUTTON_COLORS.green : BUTTON_COLORS.yellow;
        uimanager.drawButtonSurface(this.hammerButton, TOOL_BUTTON_SIZE, TOOL_BUTTON_SIZE, hammerColor, 23);
        if (this.hammerIcon) this.hammerIcon.angle = this.hammerMode ? -8 : 0;
        if (this.hammerCountLabel) this.hammerCountLabel.string = String(zyxGameModule.hammerCount);
        const purifierColor = this.purifierMode ? BUTTON_COLORS.yellow : BUTTON_COLORS.green;
        uimanager.drawButtonSurface(this.purifierButton, TOOL_BUTTON_SIZE, TOOL_BUTTON_SIZE, purifierColor, 23);
        if (this.purifierIcon) this.purifierIcon.angle = this.purifierMode ? -8 : 0;
        if (this.purifierCountLabel) this.purifierCountLabel.string = String(zyxGameModule.colorPurifierCount);
        const toolOpacity = this.isTutorialGuidedStep() ? 118 : 255;
        if (this.hammerButton) this.hammerButton.opacity = toolOpacity;
        if (this.purifierButton) this.purifierButton.opacity = toolOpacity;
    }

    private setLabelTone(label: cc.Label, color: cc.Color, outlineWidth: number): void {
        if (!label || !label.node) return;
        label.node.color = color;
        this.makeHintLabelBold(label, color, outlineWidth);
    }

    private updateHudNumber(label: cc.Label, value: number): void {
        if (!label || !label.node) return;
        const nextValue = String(value);
        if (label.string === nextValue) return;
        label.string = nextValue;
        const node = label.node;
        cc.Tween.stopAllByTarget(node);
        node.scale = 1;
        cc.tween(node)
            .to(0.1, { scale: 1.14 }, { easing: 'quadOut' })
            .to(0.12, { scale: 0.97 }, { easing: 'quadInOut' })
            .to(0.12, { scale: 1 }, { easing: 'backOut' })
            .start();
    }

    private updateRecordTag(isNewRecord: boolean): void {
        if (!this.recordTagLabel) return;
        const node = this.recordTagLabel.node;
        if (!isNewRecord) {
            if (this.recordTagOnLeft) cc.Tween.stopAllByTarget(node);
            this.recordTagOnLeft = false;
            node.x = this.scoreColumnX;
            node.opacity = 255;
            node.color = HUD_LABEL_COLOR;
            this.recordTagLabel.string = '最高记录';
            return;
        }

        this.recordTagLabel.string = '新纪录，继续保持';
        node.color = MOOD_COLORS.coral;
        if (this.recordTagOnLeft) return;
        this.recordTagOnLeft = true;
        cc.Tween.stopAllByTarget(node);
        node.x = this.scoreColumnX;
        node.opacity = 80;
        cc.tween(node)
            .to(0.3, { x: -84, opacity: 255 }, { easing: 'backOut' })
            .to(0.12, { x: -this.scoreColumnX }, { easing: 'quadInOut' })
            .start();
    }

    private movePiece(id: number, offset: number): void {
        if (this.locked || this.hammerMode || this.purifierMode) {
            this.renderBoard();
            if (this.hammerMode) uimanager.showToast('解压锤已就绪，请点一下目标格子');
            if (this.purifierMode) uimanager.showToast('魔法棒已就绪，请点一下目标颜色');
            return;
        }
        if (this.isTutorialGuidedStep()) {
            const expected = zyxGameModule.getTutorialMove(this.tutorialStep);
            if (!expected || expected.id !== id) {
                const size = expected ? expected.pieceSize : 1;
                this.showTutorialCorrection(`这块先休息一下吧～请拖动亮亮的 ${size} 格块，跟着小手走！`, true);
                return;
            }
            if (expected.offset !== offset) {
                this.showTutorialCorrection('方向差一点点～跟着小手把亮亮的色块拖过去吧！', true);
                return;
            }
            this.cancelTutorialRestore();
            this.clearTutorialMoveGuide(this.tutorialStep === 2);
            if (!zyxGameModule.movePiece(id, offset)) {
                this.showTutorialCorrection('差一点点就到啦～把亮亮的色块完整放进空位吧！', true);
                return;
            }
            audioManager.playSound('move');
            this.resolveTutorialTurn();
            return;
        }
        if (!zyxGameModule.movePiece(id, offset)) {
            this.renderBoard();
            return;
        }
        audioManager.playSound('move');
        this.resolveTurn();
    }

    private tapPiece(id: number): void {
        if (this.locked) return;
        if (this.isTutorialGuidedStep()) {
            const expected = zyxGameModule.getTutorialMove(this.tutorialStep);
            const size = expected ? expected.pieceSize : 1;
            this.showTutorialCorrection(`轻轻按住亮亮的 ${size} 格块，再跟着小手拖一小步哦～`, true);
            return;
        }
        if (this.purifierMode) {
            this.useColorPurifierTool(id);
            return;
        }
        if (!this.hammerMode) {
            uimanager.showToast('按住色块左右拖动');
            return;
        }
        this.useReliefTool(id);
    }

    private useReliefTool(id: number): void {
        if (!zyxGameModule.useHammer(id)) {
            uimanager.showToast('本局解压锤已经用完');
            this.setToolSelectionMode(null);
            return;
        }

        this.setToolSelectionMode(null);
        this.markInteraction();
        audioManager.playSound('hammer');
        gameSettings.vibrateLight();
        uimanager.showToast('这个心结已经敲开了');
        this.resolveTurn([id], true);
    }

    private useColorPurifierTool(id: number): void {
        const piece = zyxGameModule.getPiece(id);
        if (!piece) return;
        const colorIndex = piece.color;
        const removedPieceIds = zyxGameModule.useColorPurifier(colorIndex);
        if (removedPieceIds.length === 0) {
            uimanager.showToast('本局魔法棒已经用完');
            this.setToolSelectionMode(null);
            return;
        }

        this.setToolSelectionMode(null);
        this.markInteraction();
        this.locked = true;
        audioManager.playSound('magicWand');
        gameSettings.vibrateLight();
        uimanager.showToast(`${getMoodName(colorIndex)}色块已全部净空`);
        this.animateColorPurifierRemoval(removedPieceIds, colorIndex, () => {
            this.resolveStableBoard(1, () => this.appendNextRowAndResolve());
        });
    }

    private showHammerInfoModal(): void {
        if (this.locked) return;
        this.setToolSelectionMode(null);
        this.markInteraction();
        this.locked = true;
        const owned = zyxGameModule.hammerCount > 0;
        const actions = owned
            ? [
                {
                    text: '立即使用',
                    color: BUTTON_COLORS.green,
                    onClick: () => {
                        this.locked = false;
                        this.toggleHammer();
                    },
                },
                { text: '先不用', color: BUTTON_COLORS.red, onClick: () => { this.locked = false; } },
            ]
            : [
                {
                    text: '获取',
                    color: BUTTON_COLORS.yellow,
                    onClick: () => {
                        this.locked = false;
                        this.requestRewardedHammer();
                    },
                    icon: (button) => decorateActionButton(button, getRewardOfferIcon()),
                },
                { text: '先不用', color: BUTTON_COLORS.red, onClick: () => { this.locked = false; } },
            ];
        uimanager.showModal(
            '解压锤',
            '敲掉一个挡路色块',
            actions,
            (panel, centerY) => this.createHammerToolDemo(panel, centerY),
            148,
        );
    }

    private toggleHammer(): void {
        if (this.locked) return;
        if (zyxGameModule.hammerCount <= 0) {
            this.requestRewardedHammer();
            return;
        }
        this.markInteraction();
        const nextMode = this.hammerMode ? null : 'hammer';
        this.setToolSelectionMode(nextMode);
        if (!nextMode) uimanager.showToast('已收起解压锤');
    }

    private requestRewardedHammer(): void {
        if (this.locked || this.rewardedAdLoading) return;
        if (zyxGameModule.hammerCount > 0) {
            this.setToolSelectionMode('hammer');
            return;
        }
        this.markInteraction();
        this.rewardedAdLoading = true;
        this.locked = true;
        this.showRewardOffer((rewarded) => {
            this.rewardedAdLoading = false;
            this.locked = false;
            if (!rewarded) {
                uimanager.showToast(getRewardOfferFailToast('tool'));
                return;
            }
            zyxGameModule.grantRewardedHammer();
            this.setToolSelectionMode('hammer');
        });
    }

    private showPurifierInfoModal(): void {
        if (this.locked) return;
        this.setToolSelectionMode(null);
        this.markInteraction();
        this.locked = true;
        const owned = zyxGameModule.colorPurifierCount > 0;
        const actions = owned
            ? [
                {
                    text: '选择颜色',
                    color: BUTTON_COLORS.green,
                    onClick: () => {
                        this.locked = false;
                        this.toggleColorPurifier();
                    },
                },
                { text: '先不用', color: BUTTON_COLORS.red, onClick: () => { this.locked = false; } },
            ]
            : [
                {
                    text: '获取',
                    color: BUTTON_COLORS.yellow,
                    onClick: () => {
                        this.locked = false;
                        this.requestRewardedColorPurifier();
                    },
                    icon: (button) => decorateActionButton(button, getRewardOfferIcon()),
                },
                { text: '先不用', color: BUTTON_COLORS.red, onClick: () => { this.locked = false; } },
            ];
        uimanager.showModal(
            '魔法棒',
            '选中一种颜色，同色一起消失',
            actions,
            (panel, centerY) => this.createMagicWandToolDemo(panel, centerY),
            148,
        );
    }

    private toggleColorPurifier(): void {
        if (this.locked) return;
        if (zyxGameModule.colorPurifierCount <= 0) {
            this.requestRewardedColorPurifier();
            return;
        }
        this.markInteraction();
        const nextMode = this.purifierMode ? null : 'magicWand';
        this.setToolSelectionMode(nextMode);
        if (!nextMode) uimanager.showToast('已收起魔法棒');
    }

    private requestRewardedColorPurifier(): void {
        if (this.locked || this.rewardedAdLoading) return;
        if (zyxGameModule.colorPurifierCount > 0) {
            this.setToolSelectionMode('magicWand');
            return;
        }
        this.markInteraction();
        this.rewardedAdLoading = true;
        this.locked = true;
        this.showRewardOffer((rewarded) => {
            this.rewardedAdLoading = false;
            this.locked = false;
            if (!rewarded) {
                uimanager.showToast(getRewardOfferFailToast('tool'));
                return;
            }
            zyxGameModule.grantRewardedColorPurifier();
            this.setToolSelectionMode('magicWand');
        });
    }

    /** 统一获取入口：当前分享；开关关闭后仍走完整激励视频实现。 */
    private showRewardOffer(onResult: (rewarded: boolean) => void): void {
        if (USE_SHARE_INSTEAD_OF_VIDEO) {
            requestShareReward(onResult);
            return;
        }
        this.showRewardedVideo(onResult);
    }

    /** 保留完整激励视频链路，待用户量达标后把 USE_SHARE_INSTEAD_OF_VIDEO 改为 false 即可恢复。 */
    private showRewardedVideo(onResult: (rewarded: boolean) => void): void {
        const wxApi = getWxApi();
        const runtime = typeof window !== 'undefined' ? window as any : null;
        const adUnitId = runtime && runtime.__ZYX_REWARDED_AD_UNIT_ID__
            ? String(runtime.__ZYX_REWARDED_AD_UNIT_ID__)
            : '';

        if (!wxApi || typeof wxApi.createRewardedVideoAd !== 'function') {
            uimanager.showModal(
                '看视频获得一次机会',
                '网页预览使用模拟奖励；接入微信广告位后会播放真实激励视频。',
                [
                    { text: '模拟观看完成', color: BUTTON_COLORS.green, onClick: () => onResult(true) },
                    { text: '稍后再说', color: BUTTON_COLORS.red, onClick: () => onResult(false) },
                ],
            );
            return;
        }
        if (!adUnitId) {
            uimanager.showToast('请先配置激励视频广告位');
            onResult(false);
            return;
        }

        let ad: any = null;
        try {
            ad = wxApi.createRewardedVideoAd({ adUnitId });
        } catch (error) {
            uimanager.showToast('视频组件初始化失败，请稍后再试');
            onResult(false);
            return;
        }

        let completed = false;
        const cleanup = (): void => {
            if (!ad) return;
            if (typeof ad.offClose === 'function') ad.offClose(onClose);
            if (typeof ad.offError === 'function') ad.offError(onError);
        };
        const finish = (rewarded: boolean, errorMessage: string = ''): void => {
            if (completed) return;
            completed = true;
            cleanup();
            if (errorMessage) uimanager.showToast(errorMessage);
            onResult(rewarded);
        };
        const onClose = (result: any): void => {
            // 旧版基础库可能不返回 result；明确返回 isEnded=false 时才视作中途退出。
            finish(!result || result.isEnded !== false);
        };
        const onError = (): void => {
            finish(false, '视频暂时没有准备好，请稍后再试');
        };

        if (!ad || typeof ad.onClose !== 'function' || typeof ad.onError !== 'function') {
            finish(false, '当前微信版本暂不支持激励视频');
            return;
        }
        ad.onClose(onClose);
        ad.onError(onError);
        try {
            const showResult = ad.show();
            if (showResult && typeof showResult.catch === 'function') {
                showResult.catch(() => {
                    if (completed) return;
                    try {
                        const loadResult = ad.load();
                        if (!loadResult || typeof loadResult.then !== 'function') {
                            onError();
                            return;
                        }
                        loadResult
                            .then(() => {
                                if (completed) return;
                                const retryResult = ad.show();
                                if (retryResult && typeof retryResult.catch === 'function') {
                                    retryResult.catch(onError);
                                }
                            })
                            .catch(onError);
                    } catch (error) {
                        onError();
                    }
                });
            }
        } catch (error) {
            onError();
        }
    }

    private markInteraction(): void {
        this.idleSeconds = 0;
        this.cancelEliminationHint();
        if (this.isTutorialGuidedStep()) this.cancelTutorialHand();
    }

    private playEliminationHint(): void {
        if (this.locked || this.hammerMode || this.purifierMode || this.isTutorialGuidedStep() || !this.pieceLayer) return;
        const hint = zyxGameModule.findEliminationHint();
        if (!hint) return;
        const piece = zyxGameModule.getPiece(hint.id);
        const node = this.pieceLayer.getChildByName(`piece_${hint.id}`);
        if (!piece || !node) return;

        this.cancelEliminationHint();
        this.hintPieceId = hint.id;
        const origin = this.getPiecePosition(piece.row, piece.col, piece.size);
        const targetX = origin.x + hint.offset * CELL_SIZE;
        if (this.moodStageLabel) {
            this.hintTipBeforeGuide = this.moodStageLabel.string;
            this.moodStageLabel.string = '跟着小手挪动，就能消除一行';
            this.moodStageLabel.node.opacity = 255;
        }
        this.hintHand = this.createHintHand(this.pieceLayer, origin.x, origin.y + 42);
        const hand = this.hintHand;

        cc.tween(hand)
            .to(0.18, { y: origin.y + 22, scale: 0.9 }, { easing: 'quadOut' })
            .to(0.55, { x: targetX, y: origin.y + 22 }, { easing: 'cubicInOut' })
            .to(0.13, { y: origin.y + 39, scale: 1 }, { easing: 'backOut' })
            .delay(0.24)
            .to(0.38, { x: origin.x, opacity: 0 }, { easing: 'quadIn' })
            .call(() => this.finishEliminationHint())
            .start();
        cc.tween(node)
            .delay(0.18)
            .to(0.55, { x: targetX }, { easing: 'cubicInOut' })
            .delay(0.2)
            .to(0.46, { x: origin.x }, { easing: 'cubicInOut' })
            .start();
    }

    private createHintHand(parent: cc.Node, x: number, y: number): cc.Node {
        const node = new cc.Node('eliminationHintHand');
        node.width = 62;
        node.height = 72;
        node.setPosition(x, y);
        node.zIndex = 400;
        parent.addChild(node);
        const halo = new cc.Node('hintHandHalo');
        halo.width = 80;
        halo.height = 80;
        halo.zIndex = -1;
        node.addChild(halo);
        const haloGraphics = halo.addComponent(cc.Graphics);
        haloGraphics.fillColor = new cc.Color(239, 151, 105, 74);
        haloGraphics.circle(0, 0, 34);
        haloGraphics.fill();
        cc.tween(halo)
            .repeatForever(cc.tween().to(0.45, { scale: 1.18, opacity: 80 }).to(0.45, { scale: 0.9, opacity: 220 }))
            .start();
        const g = node.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(80, 55, 49, 38);
        g.circle(5, -7, 21);
        g.fill();
        g.fillColor = new cc.Color(255, 248, 224);
        g.strokeColor = new cc.Color(105, 76, 64);
        g.lineWidth = 2.5;
        g.circle(0, -3, 19);
        g.fill();
        g.stroke();
        g.roundRect(-7, -4, 14, 43, 7);
        g.fill();
        g.stroke();
        g.fillColor = new cc.Color(241, 183, 124);
        g.circle(0, 30, 5);
        g.fill();
        return node;
    }

    private cancelEliminationHint(): void {
        if (this.hintPieceId > 0 && this.pieceLayer) {
            const piece = zyxGameModule.getPiece(this.hintPieceId);
            const node = this.pieceLayer.getChildByName(`piece_${this.hintPieceId}`);
            if (piece && node) {
                cc.Tween.stopAllByTarget(node);
                node.setPosition(this.getPiecePosition(piece.row, piece.col, piece.size));
            }
        }
        if (this.hintHand && cc.isValid(this.hintHand)) {
            cc.Tween.stopAllByTarget(this.hintHand);
            this.hintHand.destroy();
        }
        this.hintHand = null;
        this.hintPieceId = 0;
        this.restoreTipAfterGuide();
    }

    private finishEliminationHint(): void {
        const hand = this.hintHand;
        this.hintHand = null;
        this.hintPieceId = 0;
        if (hand && cc.isValid(hand)) hand.destroy();
        this.idleSeconds = 0;
        this.restoreTipAfterGuide();
    }

    private restoreTipAfterGuide(): void {
        if (!this.hintTipBeforeGuide || !this.moodStageLabel) return;
        this.moodStageLabel.string = this.hintTipBeforeGuide;
        this.hintTipBeforeGuide = '';
    }

    private restoreDefaultPlayTip(): void {
        if (!this.moodStageLabel) return;
        this.moodStageLabel.string = '拖动心情块左右移动，填满一行就能消除';
        this.moodStageLabel.node.opacity = 255;
        this.tipSeconds = 0;
    }

    private updateRotatingTip(dt: number): void {
        if (!this.moodStageLabel || this.hammerMode || this.purifierMode || this.isTutorialGuidedStep()) return;
        this.tipSeconds += dt;
        const beginner = zyxGameModule.challengeCount <= 10;
        const interval = beginner ? 10 : 30;
        if (this.tipSeconds < interval) return;
        this.tipSeconds = 0;

        const playTips = [
            '左右拖动心情块，填满一行就能消除',
            '带表情的色块消除后，会飞进顶部瓶子',
            '解压锤能敲掉一个挡路的心情块',
            '魔法棒能让场上全部同色色块一起消失',
            '八秒没操作时，小手会提示一次可消除移动',
            '留意下一排，提前为新色块腾出位置',
        ];
        const warmTips = [
            '你不需要一直坚强，慢一点也没关系',
            '今天已经很努力了，剩下的交给明天',
            '真正的顺利，是心里始终有一个方向',
            '有人惦记的晚风，总会比别处温柔',
            '把复杂的事一件件放好，生活会慢慢清晰',
        ];
        const source = beginner ? playTips : warmTips;
        this.tipIndex = (this.tipIndex + 1) % source.length;
        const node = this.moodStageLabel.node;
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .to(0.38, { opacity: 0 })
            .call(() => this.moodStageLabel.string = source[this.tipIndex])
            .to(0.42, { opacity: 255 })
            .start();
    }

    private resolveTurn(removedPieceIds: number[] = [], shatter: boolean = false): void {
        this.locked = true;
        this.updateHud();
        const beginResolution = () => {
            this.resolveStableBoard(1, () => this.appendNextRowAndResolve());
        };

        if (removedPieceIds.length > 0) {
            if (shatter) this.animateHammerRemoval(removedPieceIds[0], beginResolution);
            else this.animatePieceRemoval(removedPieceIds, beginResolution);
        } else {
            beginResolution();
        }
    }

    /** 教学前三步只结算重力与消除，不补随机新行；第三步完成后再接回正式回合。 */
    private resolveTutorialTurn(): void {
        this.locked = true;
        this.updateHud();
        const clearedRowsBefore = zyxGameModule.roundClearedRows;
        this.resolveStableBoard(1, () => {
            if (zyxGameModule.roundClearedRows <= clearedRowsBefore) {
                cc.error(`[新手教学] 第 ${this.tutorialStep + 1} 步没有产生消除`);
                this.locked = false;
                this.showTutorialCorrection('差一点点就成功啦～让亮亮的色块完整住进空位吧！', true);
                return;
            }
            this.tutorialStep++;
            this.idleSeconds = 0;
            if (this.isTutorialGuidedStep()) {
                this.locked = false;
                this.showTutorialStep();
                return;
            }

            this.playTutorialCompletionTransition();
        });
    }

    private handleChallengeFailed(reason: string): void {
        this.dismissRoundRescuePrompt(false);
        this.cancelEliminationHint();
        this.setToolSelectionMode(null);
        this.locked = true;
        if (this.reviveUsed) {
            this.finishGame(reason);
            return;
        }
        this.showReviveModal(reason);
    }

    private showReviveModal(reason: string): void {
        this.locked = true;
        const modal = uimanager.showModal(
            '再给心情一次机会',
            USE_SHARE_INSTEAD_OF_VIDEO
                ? '是否需要复活，创造更高纪录？\n分享给好友后，将清理棋盘上半区后继续挑战。'
                : '是否需要复活，创造更高纪录？\n看完视频，将清理棋盘上半区后继续挑战。',
            [
                {
                    text: '复活',
                    color: BUTTON_COLORS.yellow,
                    onClick: () => this.requestRevive(reason),
                    icon: (button) => decorateActionButton(button, getRewardOfferIcon()),
                },
                {
                    text: '不需要',
                    color: BUTTON_COLORS.red,
                    onClick: () => this.finishGame(reason),
                },
            ],
            (panel, centerY) => {
                const badge = uimanager.createRect(
                    panel,
                    'revivePreview',
                    390,
                    108,
                    new cc.Color(255, 238, 191),
                    255,
                    26,
                    0,
                    centerY,
                );
                if (USE_SHARE_INSTEAD_OF_VIDEO) createShareGlyph(badge, -128, 0, 0.92);
                else createVideoGlyph(badge, -128, 0, 0.92);
                const label = uimanager.createLabel(
                    badge,
                    '闪电清理上半区\n保留下半区继续挑战',
                    58,
                    0,
                    21,
                    HUD_VALUE_COLOR,
                    270,
                    76,
                );
                this.makeHintLabelBold(label, new cc.Color(255, 249, 232), 0.65);
            },
            160,
        );
        const panel = modal && modal.getChildByName('panel');
        if (panel) {
            const footer = uimanager.createLabel(
                panel,
                '每次挑战仅有一次复活机会',
                0,
                -panel.height / 2 + 29,
                17,
                HUD_LABEL_COLOR,
                460,
                30,
            );
            this.makeHintLabelBold(footer, new cc.Color(255, 249, 232), 0.45);
        }
    }

    private requestRevive(reason: string): void {
        if (this.rewardedAdLoading) return;
        this.rewardedAdLoading = true;
        this.locked = true;
        this.showRewardOffer((rewarded) => {
            this.rewardedAdLoading = false;
            if (!rewarded) {
                uimanager.showToast(getRewardOfferFailToast('revive'));
                this.showReviveModal(reason);
                return;
            }
            this.reviveUsed = true;
            this.performRevive();
        });
    }

    private performRevive(): void {
        const removedPieceIds = zyxGameModule.removeTopRowsForRevive(8);
        this.setToolSelectionMode(null);
        this.locked = true;
        this.playEmergencyClearEffect(removedPieceIds, () => {
            this.resolveStableBoard(1, () => {
                this.updateHud();
                uimanager.showToast('已清理顶部 8 排，自动补入一排');
                this.appendNextRowAndResolve();
            });
        });
    }

    /** 两种紧急救场共用同一条演出时间线：闪电、云团与碎裂同时发生。 */
    private playEmergencyClearEffect(pieceIds: number[], onComplete: () => void): void {
        this.playEmergencyLightning();
        this.playEmergencyClouds();
        this.animateEmergencyShatter(pieceIds);
        // 旧流程串行约 3.6s；现在 1.18s 就进入补行，清除速度提升超过一倍。
        this.scheduleOnce(onComplete, 1.18);
    }

    private playEmergencyLightning(): void {
        if (!this.boardRoot || !cc.isValid(this.boardRoot)) return;

        const boardWidth = BOARD_COLS * CELL_SIZE;
        const boardHeight = BOARD_ROWS * CELL_SIZE;
        const flash = new cc.Node('emergencyBoardFlash');
        flash.width = boardWidth;
        flash.height = boardHeight;
        flash.setPosition(0, 0);
        flash.zIndex = 68;
        flash.opacity = 0;
        this.boardRoot.addChild(flash);
        const flashGraphics = flash.addComponent(cc.Graphics);
        flashGraphics.fillColor = new cc.Color(255, 239, 153, 148);
        flashGraphics.rect(-boardWidth / 2, -boardHeight / 2, boardWidth, boardHeight);
        flashGraphics.fill();
        cc.tween(flash)
            .delay(0.04)
            .to(0.07, { opacity: 220 })
            .to(0.055, { opacity: 38 })
            .to(0.07, { opacity: 245 })
            .to(0.055, { opacity: 42 })
            .to(0.08, { opacity: 255 })
            .to(0.24, { opacity: 0 }, { easing: 'quadOut' })
            .call(() => {
                if (cc.isValid(flash)) flash.destroy();
            })
            .start();

        const strikeXs = [-196, 0, 196];
        strikeXs.forEach((x, index) => {
            const bolt = new cc.Node(`emergencyLightning_${index}`);
            bolt.setPosition(x, 28);
            bolt.zIndex = 98;
            bolt.opacity = 0;
            bolt.scale = 0.82;
            this.boardRoot.addChild(bolt);
            const graphics = bolt.addComponent(cc.Graphics);
            const drawBolt = (color: cc.Color, width: number): void => {
                graphics.strokeColor = color;
                graphics.lineWidth = width;
                graphics.lineCap = cc.Graphics.LineCap.ROUND;
                graphics.moveTo(22, 330);
                graphics.lineTo(-28, 224);
                graphics.lineTo(22, 224);
                graphics.lineTo(-30, 92);
                graphics.lineTo(26, 92);
                graphics.lineTo(-24, -58);
                graphics.lineTo(18, -58);
                graphics.lineTo(-18, -296);
                graphics.stroke();
            };
            drawBolt(new cc.Color(215, 126, 30, 145), 42);
            drawBolt(new cc.Color(249, 194, 53, 248), 25);
            drawBolt(new cc.Color(255, 255, 224, 255), 9);
            graphics.fillColor = new cc.Color(255, 228, 114, 245);
            graphics.circle(-42, 178, 11);
            graphics.circle(38, 72, 9);
            graphics.circle(-34, -122, 8);
            graphics.fill();

            cc.tween(bolt)
                .delay(0.03 + index * 0.055)
                .to(0.07, { opacity: 255, scale: 1.2 }, { easing: 'backOut' })
                .to(0.055, { opacity: 66, scale: 0.98 })
                .to(0.07, { opacity: 255, scale: 1.14 })
                .to(0.055, { opacity: 62, scale: 0.99 })
                .to(0.08, { opacity: 255, scale: 1.24 })
                .delay(0.08)
                .to(0.2, { opacity: 0, scale: 1.34 }, { easing: 'quadOut' })
                .call(() => {
                    if (cc.isValid(bolt)) bolt.destroy();
                })
                .start();
            this.playEmergencySpineBurst(x, 116, index);
            this.playEmergencySpineBurst(x * 0.72, -154, index + 3);
        });

        cc.Tween.stopAllByTarget(this.boardRoot);
        const originX = this.boardRoot.x;
        cc.tween(this.boardRoot)
            .delay(0.08)
            .to(0.045, { x: originX - 18 })
            .to(0.045, { x: originX + 17 })
            .to(0.045, { x: originX - 14 })
            .to(0.045, { x: originX + 12 })
            .to(0.045, { x: originX - 9 })
            .to(0.045, { x: originX + 7 })
            .to(0.065, { x: originX })
            .start();
    }

    /** 六片亮色大云团交叠遮盖棋盘，不再使用黑灰小烟点。 */
    private playEmergencyClouds(): void {
        if (!this.boardRoot || !cc.isValid(this.boardRoot)) return;

        const boardHeight = BOARD_ROWS * CELL_SIZE;
        const cloudRoot = new cc.Node('emergencyCloudBank');
        cloudRoot.width = BOARD_COLS * CELL_SIZE;
        cloudRoot.height = boardHeight;
        cloudRoot.setPosition(0, 0);
        cloudRoot.zIndex = 86;
        this.boardRoot.addChild(cloudRoot);

        const clouds = [
            { x: -205, y: 232, radius: 150, delay: 0.00, drift: -26 },
            { x: 18, y: 214, radius: 178, delay: 0.025, drift: 18 },
            { x: 222, y: 156, radius: 152, delay: 0.05, drift: 28 },
            { x: -216, y: -46, radius: 166, delay: 0.035, drift: -22 },
            { x: 12, y: -92, radius: 188, delay: 0.01, drift: 16 },
            { x: 226, y: -122, radius: 158, delay: 0.06, drift: 30 },
        ];

        clouds.forEach((config, index) => {
            const cloud = new cc.Node(`emergencyCloud_${index}`);
            cloud.setPosition(config.x, config.y);
            cloud.opacity = 0;
            cloud.scale = 0.5;
            cloudRoot.addChild(cloud);
            const graphics = cloud.addComponent(cc.Graphics);
            const radius = config.radius;

            graphics.fillColor = new cc.Color(220, 207, 177, 36);
            graphics.circle(-radius * 0.3, -radius * 0.2, radius * 0.72);
            graphics.circle(radius * 0.32, -radius * 0.2, radius * 0.68);
            graphics.fill();
            graphics.fillColor = new cc.Color(250, 246, 224, 244);
            graphics.circle(-radius * 0.48, -radius * 0.02, radius * 0.48);
            graphics.circle(-radius * 0.14, radius * 0.22, radius * 0.66);
            graphics.circle(radius * 0.28, radius * 0.17, radius * 0.58);
            graphics.circle(radius * 0.48, -radius * 0.12, radius * 0.48);
            graphics.circle(radius * 0.02, -radius * 0.24, radius * 0.7);
            graphics.fill();
            graphics.fillColor = new cc.Color(255, 254, 242, 150);
            graphics.circle(-radius * 0.22, radius * 0.34, radius * 0.3);
            graphics.circle(radius * 0.25, radius * 0.3, radius * 0.2);
            graphics.fill();

            cc.tween(cloud)
                .delay(config.delay)
                .to(0.18, { opacity: 242, scale: 1.08 }, { easing: 'backOut' })
                .delay(0.32)
                .to(0.44, {
                    x: config.x + config.drift,
                    y: config.y + 48,
                    opacity: 0,
                    scale: 1.38,
                }, { easing: 'quadOut' })
                .start();
        });

        this.scheduleOnce(() => {
            if (cc.isValid(cloudRoot)) cloudRoot.destroy();
        }, 1.05);
    }

    private playEmergencySpineBurst(x: number, y: number, index: number): void {
        if (!this.clearSpineData || !this.boardRoot) return;
        const node = new cc.Node(`emergencySpine_${index}`);
        node.setPosition(x, y);
        node.opacity = 245;
        node.scaleX = 1.42;
        node.scaleY = 1.22;
        node.zIndex = 94;
        this.boardRoot.addChild(node);
        const skeleton = node.addComponent(sp.Skeleton);
        skeleton.skeletonData = this.clearSpineData;
        skeleton.premultipliedAlpha = false;
        skeleton.timeScale = 1.65;
        skeleton.setAnimation(0, index % 2 === 0 ? 'action' : 'action2', false);
        skeleton.setCompleteListener(() => {
            if (cc.isValid(node)) node.destroy();
        });
        this.scheduleOnce(() => {
            if (cc.isValid(node)) node.destroy();
        }, 0.86);
    }

    private animateEmergencyShatter(pieceIds: number[]): void {
        if (!this.pieceLayer || pieceIds.length === 0) return;
        const targets = pieceIds
            .map((id) => ({
                id,
                node: this.pieceLayer.getChildByName(`piece_${id}`),
                color: this.pieceColors[id],
            }))
            .filter((target) => !!target.node)
            .sort((left, right) => right.node.y - left.node.y);
        if (targets.length === 0) return;

        targets.forEach((target, index) => {
            const delay = 0.075 + (index % 3) * 0.012;
            cc.Tween.stopAllByTarget(target.node);
            cc.tween(target.node)
                .to(0.055, {
                    scale: 1.16,
                    angle: index % 2 === 0 ? -4 : 4,
                }, { easing: 'quadOut' })
                .start();
            this.scheduleOnce(() => {
                if (!cc.isValid(target.node)) return;
                target.node.scaleX = 1.18;
                target.node.scaleY = 0.68;
                // 使用锤子的强爆散参数，比普通消行的碎片飞得更大、更远。
                this.spawnPieceShards(target.node, target.color, target.id, false);
                delete this.pieceColors[target.id];
                target.node.destroy();
            }, delay);
        });
    }

    private pauseGame(): void {
        if (this.locked) return;
        this.markInteraction();
        this.setToolSelectionMode(null);
        this.locked = true;
        settingsPanel.show({
            actions: [
            {
                text: '继续游戏',
                color: BUTTON_COLORS.green,
                onClick: () => {
                    this.locked = false;
                    this.idleSeconds = 0;
                    if (this.isTutorialGuidedStep()) this.showTutorialStep();
                },
            },
            {
                text: '重新开始',
                color: BUTTON_COLORS.yellow,
                onClick: () => this.restartFromPause(),
            },
            {
                text: '结束本局',
                color: BUTTON_COLORS.red,
                onClick: () => this.finishGame('今天先整理到这里'),
            },
            ],
        });
    }

    private finishGame(_reason: string): void {
        this.dismissRoundRescuePrompt(false);
        this.stopBoardDangerGlow();
        this.cancelEliminationHint();
        this.setToolSelectionMode(null);
        this.locked = true;
        const settlement = zyxGameModule.finishRound();
        this.updateHud();
        uimanager.showModal('本局结算', this.getSettlementMessage(settlement), [
            {
                text: '返回',
                color: BUTTON_COLORS.yellow,
                onClick: () => this.leaveSettlement(false, settlement),
                icon: (button) => decorateActionButton(button, 'back'),
            },
            {
                text: '再来一次',
                color: BUTTON_COLORS.green,
                onClick: () => this.leaveSettlement(true, settlement),
                icon: (button) => decorateActionButton(button, 'restart'),
            },
        ], (panel, centerY) => {
            const scoreCaption = uimanager.createLabel(panel, '本局得分', 0, centerY + 104, 18, HUD_LABEL_COLOR, 240, 28);
            this.makeHintLabelBold(scoreCaption, new cc.Color(255, 249, 232), 0.55);
            const score = uimanager.createLabel(panel, String(settlement.roundScore), 0, centerY + 48, 68, HUD_VALUE_COLOR, 360, 82);
            this.makeHintLabelBold(score, new cc.Color(255, 249, 232), 1.15);
            score.node.scale = 0.72;
            cc.tween(score.node).to(0.3, { scale: 1 }, { easing: 'backOut' }).start();

            const moodChip = uimanager.createRect(
                panel,
                'settlementMoodReward',
                194,
                62,
                new cc.Color(255, 239, 203),
                255,
                20,
                -106,
                centerY - 56,
            );
            createMoodToken(moodChip, 1, -57, 0, 36);
            const moodValue = uimanager.createLabel(moodChip, `×${settlement.roundMoodCount}`, 24, 0, 23, HUD_VALUE_COLOR, 112, 34);
            this.makeHintLabelBold(moodValue, new cc.Color(255, 249, 232), 0.6);

            const experienceChip = uimanager.createRect(
                panel,
                'settlementExperienceReward',
                194,
                62,
                new cc.Color(220, 239, 222),
                255,
                20,
                106,
                centerY - 56,
            );
            createExperienceToken(experienceChip, -57, 0, 36);
            const experienceValue = uimanager.createLabel(experienceChip, `×${settlement.gainedExperience}`, 24, 0, 23, HUD_VALUE_COLOR, 112, 34);
            this.makeHintLabelBold(experienceValue, new cc.Color(255, 249, 232), 0.6);
        }, 250, true);
    }

    private leaveSettlement(restart: boolean, settlement: RoundSettlement): void {
        if (this.onSettlementExit) {
            this.onSettlementExit({ restart, settlement });
            return;
        }
        if (restart) this.restartGame();
    }

    private restartGame(): void {
        this.dismissRoundRescuePrompt(false);
        this.stopBoardDangerGlow();
        zyxGameModule.resetRound();
        this.tutorialStep = zyxGameModule.isTutorialRound() ? 0 : -1;
        this.reviveUsed = false;
        this.displayedRoundMoods = 0;
        if (this.roundMoodLabel) this.roundMoodLabel.string = '0';
        this.stopToolSelectionFeedback();
        this.hammerMode = false;
        this.purifierMode = false;
        this.tipSeconds = 0;
        this.tipIndex = 0;
        this.cancelEliminationHint();
        this.buildUI();
        this.renderAll();
        this.locked = false;
        if (this.isTutorialGuidedStep()) this.showTutorialStep();
    }

    private restartFromPause(): void {
        zyxGameModule.finishRound();
        this.restartGame();
    }

    private getPieceColor(index: number): cc.Color {
        return getMoodColor(index);
    }

    private getSettlementMessage(settlement: RoundSettlement): string {
        const moods = settlement.roundMoodCount;
        const praise = moods > 0
            ? '你把纷乱一点点整理好了，真的很棒。'
            : '愿意再试一次，本身就已经很了不起。';
        return praise;
    }
}
