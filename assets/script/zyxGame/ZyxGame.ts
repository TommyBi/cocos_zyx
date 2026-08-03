import {
    BOARD_COLS,
    BOARD_ROWS,
    BoardPiece,
    CELL_SIZE,
    DAILY_WISH_TARGET,
    EliminateResult,
    GravityMove,
    RoundSettlement,
    zyxGameModule,
} from '../dataModule/ZyxGameModule';
import { BUTTON_COLORS, uimanager } from '../manager/Uimanager';
import ZyxGridCom from './ZyxGridCom';
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
    updateWishBottleProgress,
} from './MoodArt';

declare const wx: any;

const { ccclass } = cc._decorator;
const NEXT_PREVIEW_HEIGHT = 32;
const NEXT_PREVIEW_OPACITY = 210;
const TOOL_BUTTON_SIZE = 88;
const BOARD_CENTER_Y = 70;
const NEXT_ROW_CENTER_Y = -364;
const TOOL_DOCK_CENTER_Y = -482;
const BOTTOM_TIP_Y = -618;
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
    private roundRescueOffered: boolean = false;
    private reviveUsed: boolean = false;
    private onSettlementExit: (request: SettlementExitRequest) => void = null;
    private pieceColors: { [key: number]: cc.Color } = {};
    private displayedRoundMoods: number = 0;
    private idleSeconds: number = 0;
    private tipIndex: number = 0;
    private tipSeconds: number = 0;

    public initialize(onSettlementExit: (request: SettlementExitRequest) => void): void {
        this.onSettlementExit = onSettlementExit;
        this.node.width = cc.winSize.width;
        this.node.height = cc.winSize.height;
        this.node.setAnchorPoint(0.5, 0.5);
        uimanager.init(this.node.parent);

        zyxGameModule.resetRound();
        this.roundRescueOffered = false;
        this.reviveUsed = false;
        this.displayedRoundMoods = 0;
        this.loadEffectAssets();
        this.buildUI();
        this.renderAll();
        this.locked = false;
    }

    public update(dt: number): void {
        if (!this.node || !this.node.isValid) return;
        this.updateRotatingTip(dt);
        if (this.locked || this.hammerMode || this.purifierMode || this.hintHand) return;
        this.idleSeconds += dt;
        if (this.idleSeconds >= 8) {
            this.idleSeconds = 0;
            this.playEliminationHint();
        }
    }

    private buildUI(): void {
        this.node.removeAllChildren();
        this.buildBackground();

        const safeArea = uimanager.getSafeAreaMetrics();
        const preferredTopY = this.node.height / 2 - 108;
        const topY = Math.min(preferredTopY, this.node.height / 2 - safeArea.top - 50);
        const bottomTipY = Math.max(BOTTOM_TIP_Y, -this.node.height / 2 + safeArea.bottom + 36);
        const hasWeChatCapsule = safeArea.menuLeft < this.node.width / 2 - 12;
        const hudGap = hasWeChatCapsule ? 10 : 22;
        const scoreCardWidth = hasWeChatCapsule ? 270 : 288;
        const bottleCardWidth = hasWeChatCapsule ? 190 : 230;
        const pauseWidth = hasWeChatCapsule ? 60 : 70;
        const hudWidth = scoreCardWidth + bottleCardWidth + pauseWidth + hudGap * 2;
        const centeredHudLeft = -hudWidth / 2;
        const capsuleHudLeft = safeArea.menuLeft - 8 - hudWidth;
        const safeLeft = -this.node.width / 2 + safeArea.left + 12;
        const hudLeft = hasWeChatCapsule
            ? Math.max(safeLeft, Math.min(centeredHudLeft, capsuleHudLeft))
            : centeredHudLeft;
        const leftCardX = hudLeft + scoreCardWidth / 2;
        const bottleCardX = hudLeft + scoreCardWidth + hudGap + bottleCardWidth / 2;
        const pauseX = hudLeft + scoreCardWidth + bottleCardWidth + hudGap * 2 + pauseWidth / 2;
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
            zyxGameModule.dailyMoodCount + this.displayedRoundMoods,
            DAILY_WISH_TARGET,
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
            topY,
            pauseWidth,
            pauseWidth,
            BUTTON_COLORS.red,
            () => this.pauseGame(),
            25,
        );
        pauseButton.name = 'pauseButton';
        this.createPauseGlyph(pauseButton, 0, 1, 0.82);

        const tipPill = uimanager.createRect(this.node, 'tipPill', 590, 48, new cc.Color(255, 249, 232), 218, 22, 0, bottomTipY);
        this.moodStageLabel = uimanager.createLabel(tipPill, '拖动心情块左右移动，填满一行就能消除', 0, 0, 18, HUD_VALUE_COLOR, 548, 34);
        this.makeHintLabelBold(this.moodStageLabel, HUD_VALUE_COLOR, 0.7);

        this.createBoard();
        this.createNextRowPreview();
        this.createToolBar();
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
        this.hammerIcon = this.createHammerGlyph(this.hammerButton, 0, -1, 0.78);
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
        this.purifierIcon = this.createPurifierGlyph(this.purifierButton, 0, -1, 0.78);
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
            this.markInteraction();
            cc.tween(this.purifierButton).stop();
            cc.tween(this.purifierButton).to(0.07, { scale: 0.96 }).start();
        }, this);
        this.purifierButton.on(cc.Node.EventType.TOUCH_END, () => {
            cc.tween(this.purifierButton).stop();
            cc.tween(this.purifierButton).to(0.1, { scale: 1 }).start();
            if (!this.locked) this.showPurifierInfoModal();
        }, this);
        this.purifierButton.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.tween(this.purifierButton).stop();
            cc.tween(this.purifierButton).to(0.1, { scale: 1 }).start();
        }, this);
    }

    private showToolDragFollower(worldPoint: cc.Vec2): void {
        if (!this.toolDragFollower || !cc.isValid(this.toolDragFollower)) {
            this.toolDragFollower = this.createHammerGlyph(this.node, 0, 0, 0.72);
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
        this.toolWiggleNodes.forEach((node) => {
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
        cc.resources.load('spine/get_1', sp.SkeletonData, (error: Error, data: sp.SkeletonData) => {
            if (error || !data) {
                cc.warn('Spine clear effect failed to load', error);
                return;
            }
            this.clearSpineData = data;
        });
    }

    private createHammerGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
        const node = new cc.Node('hammerGlyph');
        node.width = 82;
        node.height = 82;
        node.setAnchorPoint(0.5, 0.5);
        node.setPosition(x, y);
        node.scale = scale;
        node.angle = 0;
        node.zIndex = 55;
        parent.addChild(node);

        const shadow = new cc.Node('hammerShadow');
        shadow.zIndex = 0;
        shadow.setPosition(0, -31);
        node.addChild(shadow);
        const shadowG = shadow.addComponent(cc.Graphics);
        shadowG.fillColor = new cc.Color(73, 48, 43, 42);
        shadowG.ellipse(0, 0, 25, 6);
        shadowG.fill();

        const art = new cc.Node('hammerArt');
        art.width = 66;
        art.height = 84;
        art.setPosition(0, 3);
        art.zIndex = 2;
        node.addChild(art);
        const sprite = art.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        cc.resources.load('images/formal/relief_hammer_v2', cc.SpriteFrame, (error: Error, frame: cc.SpriteFrame) => {
            if (error || !frame || !cc.isValid(art)) return;
            sprite.spriteFrame = frame;
            uimanager.fitSpriteFrameInside(art, frame, 66, 84);
        });
        return node;
    }

    private createPurifierGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
        const node = new cc.Node('magicWandGlyph');
        node.width = 82;
        node.height = 82;
        node.setAnchorPoint(0.5, 0.5);
        node.setPosition(x, y);
        node.scale = scale;
        node.zIndex = 55;
        parent.addChild(node);

        const shadow = new cc.Node('magicWandShadow');
        shadow.zIndex = 0;
        shadow.setPosition(0, -31);
        node.addChild(shadow);
        const shadowGraphics = shadow.addComponent(cc.Graphics);
        shadowGraphics.fillColor = new cc.Color(73, 48, 43, 42);
        shadowGraphics.ellipse(0, 0, 24, 6);
        shadowGraphics.fill();

        const art = new cc.Node('magicWandArt');
        art.width = 68;
        art.height = 86;
        art.setPosition(0, 3);
        art.zIndex = 2;
        node.addChild(art);
        const sprite = art.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        cc.resources.load('images/formal/magic_wand_v1', cc.SpriteFrame, (error: Error, frame: cc.SpriteFrame) => {
            if (error || !frame || !cc.isValid(art)) return;
            sprite.spriteFrame = frame;
            uimanager.fitSpriteFrameInside(art, frame, 68, 86);
        });
        return node;
    }

    private createPauseGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
        const node = new cc.Node('pauseGlyph');
        node.setPosition(x, y);
        node.scale = scale;
        node.zIndex = 60;
        parent.addChild(node);
        const graphics = node.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(112, 61, 55, 92);
        graphics.roundRect(-17, -20, 13, 42, 6);
        graphics.roundRect(5, -20, 13, 42, 6);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 239, 193);
        graphics.strokeColor = new cc.Color(132, 73, 62);
        graphics.lineWidth = 2;
        graphics.roundRect(-18, -17, 12, 38, 6);
        graphics.roundRect(6, -17, 12, 38, 6);
        graphics.fill();
        graphics.stroke();
        return node;
    }

    private decorateActionButton(button: cc.Node, icon: 'video' | 'home' | 'restart'): void {
        const label = button.getChildByName('label');
        if (label) {
            label.x = 30;
            label.width = 280;
        }
        if (icon === 'video') this.createVideoGlyph(button, -92, 2, 0.76);
        else if (icon === 'home') this.createHomeGlyph(button, -92, 1, 0.78);
        else this.createRestartGlyph(button, -92, 1, 0.8);
    }

    private createVideoGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
        const node = new cc.Node('videoGlyph');
        node.setPosition(x, y);
        node.scale = scale;
        node.zIndex = 60;
        parent.addChild(node);
        const graphics = node.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(85, 56, 49, 54);
        graphics.roundRect(-31, -23, 62, 49, 15);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 247, 220);
        graphics.strokeColor = new cc.Color(119, 78, 66);
        graphics.lineWidth = 2.4;
        graphics.roundRect(-32, -20, 64, 48, 15);
        graphics.fill();
        graphics.stroke();
        graphics.fillColor = new cc.Color(248, 194, 72);
        graphics.roundRect(-24, -13, 38, 32, 10);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 250, 224);
        graphics.moveTo(-10, -6);
        graphics.lineTo(7, 3);
        graphics.lineTo(-10, 12);
        graphics.close();
        graphics.fill();
        graphics.fillColor = new cc.Color(226, 104, 95);
        graphics.circle(23, 10, 4);
        graphics.fill();
        graphics.fillColor = new cc.Color(105, 181, 129);
        graphics.circle(23, -4, 4);
        graphics.fill();
        return node;
    }

    private createHomeGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
        const node = new cc.Node('homeGlyph');
        node.setPosition(x, y);
        node.scale = scale;
        node.zIndex = 60;
        parent.addChild(node);
        const graphics = node.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(83, 54, 47, 48);
        graphics.roundRect(-21, -20, 44, 35, 9);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 244, 214);
        graphics.strokeColor = new cc.Color(119, 78, 66);
        graphics.lineWidth = 2.5;
        graphics.roundRect(-22, -18, 44, 36, 9);
        graphics.fill();
        graphics.stroke();
        graphics.fillColor = new cc.Color(239, 133, 104);
        graphics.moveTo(-30, 9);
        graphics.lineTo(0, 34);
        graphics.lineTo(30, 9);
        graphics.lineTo(24, 2);
        graphics.lineTo(0, 22);
        graphics.lineTo(-24, 2);
        graphics.close();
        graphics.fill();
        graphics.stroke();
        graphics.fillColor = new cc.Color(105, 181, 129);
        graphics.roundRect(-7, -18, 14, 24, 6);
        graphics.fill();
        return node;
    }

    private createRestartGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
        const node = new cc.Node('restartGlyph');
        node.setPosition(x, y);
        node.scale = scale;
        node.zIndex = 60;
        parent.addChild(node);
        const graphics = node.addComponent(cc.Graphics);
        graphics.strokeColor = new cc.Color(255, 244, 214);
        graphics.lineWidth = 8;
        graphics.lineCap = cc.Graphics.LineCap.ROUND;
        graphics.moveTo(18, 18);
        graphics.bezierCurveTo(29, 7, 27, -10, 16, -20);
        graphics.bezierCurveTo(3, -31, -16, -27, -25, -12);
        graphics.bezierCurveTo(-34, 3, -25, 21, -8, 26);
        graphics.stroke();
        graphics.fillColor = new cc.Color(255, 244, 214);
        graphics.moveTo(-8, 35);
        graphics.lineTo(8, 24);
        graphics.lineTo(-10, 17);
        graphics.close();
        graphics.fill();
        return node;
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
        this.createNextRowPreviewNodes(NEXT_PREVIEW_OPACITY);
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
            cc.tween(node)
                .to(0.24, { opacity: 0 }, { easing: 'sineIn' })
                .call(() => node.destroy())
                .start();
        }

        for (const piece of zyxGameModule.pieces) {
            let node = this.pieceLayer.getChildByName(`piece_${piece.id}`);
            if (!node) node = this.createPieceView(piece, BOARD_ROWS);

            const target = this.getPiecePosition(piece.row, piece.col, piece.size);
            cc.tween(node).stop();
            cc.tween(node)
                .to(0.44, { x: target.x, y: target.y }, { easing: 'cubicInOut' })
                .start();
        }
        this.scheduleOnce(() => this.animateNextRowReveal(onComplete), 0.46);
    }

    private animateNextRowReveal(onComplete: () => void): void {
        const nextNodes = this.createNextRowPreviewNodes(0);
        if (nextNodes.length === 0) {
            onComplete();
            return;
        }

        for (const node of nextNodes) {
            cc.tween(node)
                .to(0.24, { opacity: NEXT_PREVIEW_OPACITY }, { easing: 'sineOut' })
                .start();
        }
        this.scheduleOnce(onComplete, 0.26);
    }

    private animateGravityMoves(moves: GravityMove[], onComplete: () => void): void {
        let longestDuration = 0;
        for (const move of moves) {
            const piece = zyxGameModule.getPiece(move.id);
            const node = this.pieceLayer.getChildByName(`piece_${move.id}`);
            if (!piece || !node) continue;

            const distance = move.toRow - move.fromRow;
            const duration = Math.min(0.28, 0.075 + distance * 0.035);
            const target = this.getPiecePosition(piece.row, piece.col, piece.size);
            longestDuration = Math.max(longestDuration, duration);
            cc.tween(node).stop();
            cc.tween(node)
                .to(duration, { x: target.x, y: target.y }, { easing: 'quadIn' })
                .start();
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
                })
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
        const strike = this.createHammerGlyph(this.pieceLayer, pieceNode.x + 42, pieceNode.y + 62, 0.88);
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
                const fadeDuration = 0.34 + (index % 4) * 0.025;
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
                    .delay(rowClear ? (index % 5) * 0.004 : 0)
                    .to(0.17, {
                        x: startX + spread * 0.55,
                        y: startY + lift,
                        rotation: turn * 0.45,
                        scale: 0.9 + (index % 3) * 0.03,
                    }, { easing: 'quadOut', onUpdate: updateShard })
                    .to(0.24, {
                        x: startX + spread * 0.82,
                        y: startY - fall * 0.38,
                        rotation: turn * 0.72,
                        scale: 0.72 + (index % 3) * 0.04,
                        alpha: 0.88,
                    }, { easing: 'quadIn', onUpdate: updateShard })
                    .to(fadeDuration, {
                        x: startX + spread,
                        y: startY - fall,
                        rotation: turn,
                        scale: 0.22 + (index % 4) * 0.045,
                        alpha: 0,
                    }, { easing: 'quadIn', onUpdate: updateShard })
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

        const hammer = this.createHammerGlyph(stage, -72, 31, 0.72);
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
        const wand = this.createPurifierGlyph(stage, -126, 35, 0.68);
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
                .to(0.08, { scaleX: 1.03, scaleY: 0.72 }, { easing: 'quadOut' })
                .start();
        }

        this.scheduleOnce(() => {
            for (const target of targets) {
                if (!cc.isValid(target.node)) continue;
                this.spawnPieceShards(target.node, target.color, target.id, true);
                delete this.pieceColors[target.id];
                target.node.destroy();
            }
        }, 0.09);
    }

    private animateElimination(result: EliminateResult, onComplete: () => void): void {
        this.updateHud();
        const rewardText = result.collectedMoodTypes.length > 0
            ? ` · 表情 +${result.collectedMoodTypes.length}`
            : '';
        uimanager.showToast(`捋顺 ${result.clearedRows} 行${rewardText}`);
        this.playRowClearEffects(result.clearedRowIndexes);
        this.playMoodCollect(result.removedPieceIds);
        this.animateRowShatter(result.removedPieceIds);
        this.scheduleOnce(onComplete, 0.095);
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
        updateWishBottleProgress(
            this.moodBottle,
            zyxGameModule.dailyMoodCount + this.displayedRoundMoods,
            DAILY_WISH_TARGET,
        );
    }

    private resolveStableBoard(chain: number, onStable: () => void): void {
        const gravityMoves = zyxGameModule.applyGravity();
        if (gravityMoves.length > 0) {
            this.animateGravityMoves(gravityMoves, () => this.resolveStableBoard(chain, onStable));
            return;
        }

        const elimination = zyxGameModule.eliminateFullRows(chain);
        if (elimination.clearedRows > 0) {
            this.animateElimination(elimination, () => this.resolveStableBoard(chain + 1, onStable));
            return;
        }

        onStable();
    }

    private appendNextRowAndResolve(): void {
        if (!zyxGameModule.appendNextRow()) {
            this.handleChallengeFailed('整理台暂时放满了');
            return;
        }

        this.animateAppendedRow(() => {
            this.resolveStableBoard(1, () => {
                if (zyxGameModule.isGameOver()) {
                    this.handleChallengeFailed('整理台暂时放满了');
                    return;
                }
                if (this.tryShowRoundRescue()) return;
                this.locked = false;
                this.idleSeconds = 0;
            });
        });
    }

    private tryShowRoundRescue(): boolean {
        if (this.roundRescueOffered || !zyxGameModule.hasEnteredRescueZone(2)) return false;
        this.roundRescueOffered = true;
        this.markInteraction();
        this.locked = true;
        uimanager.showModal(
            '给整理台腾点位置',
            '心情块距离顶部只剩两行了。\n看完视频，立即清除数量最多的一种颜色。',
            [
                {
                    text: '获取',
                    color: BUTTON_COLORS.green,
                    onClick: () => this.requestRoundRescue(),
                },
                {
                    text: '不需要',
                    color: BUTTON_COLORS.red,
                    onClick: () => {
                        this.locked = false;
                        this.idleSeconds = 0;
                    },
                },
            ],
            (panel, centerY) => {
                this.createPurifierGlyph(panel, -132, centerY + 2, 1.05);
                const badge = uimanager.createRect(
                    panel,
                    'roundRescueBadge',
                    300,
                    84,
                    new cc.Color(225, 241, 215),
                    255,
                    22,
                    76,
                    centerY,
                );
                const label = uimanager.createLabel(
                    badge,
                    '仅本局一次\n自动净化最多颜色',
                    0,
                    0,
                    20,
                    HUD_VALUE_COLOR,
                    270,
                    68,
                );
                this.makeHintLabelBold(label, new cc.Color(255, 249, 232), 0.65);
            },
            126,
        );
        return true;
    }

    private requestRoundRescue(): void {
        if (this.rewardedAdLoading) return;
        this.rewardedAdLoading = true;
        this.locked = true;
        this.showRewardedVideo((rewarded) => {
            this.rewardedAdLoading = false;
            if (!rewarded) {
                this.locked = false;
                this.idleSeconds = 0;
                uimanager.showToast('完整看完视频才能获得帮助');
                return;
            }
            this.applyRoundRescue();
        });
    }

    private applyRoundRescue(): void {
        const result = zyxGameModule.removeMostCommonColor();
        if (result.removedPieceIds.length === 0) {
            this.locked = false;
            this.idleSeconds = 0;
            return;
        }

        this.setToolSelectionMode(null);
        uimanager.showToast(`${getMoodName(result.color)}色块已自动净空`);
        this.animateColorPurifierRemoval(result.removedPieceIds, result.color, () => {
            this.resolveStableBoard(1, () => {
                this.updateHud();
                this.locked = false;
                this.idleSeconds = 0;
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
        if (this.hammerIcon) this.hammerIcon.angle = this.hammerMode ? 8 : 0;
        if (this.hammerCountLabel) this.hammerCountLabel.string = String(zyxGameModule.hammerCount);
        const purifierColor = this.purifierMode ? BUTTON_COLORS.yellow : BUTTON_COLORS.green;
        uimanager.drawButtonSurface(this.purifierButton, TOOL_BUTTON_SIZE, TOOL_BUTTON_SIZE, purifierColor, 23);
        if (this.purifierIcon) this.purifierIcon.angle = this.purifierMode ? -8 : 0;
        if (this.purifierCountLabel) this.purifierCountLabel.string = String(zyxGameModule.colorPurifierCount);
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
        if (!zyxGameModule.movePiece(id, offset)) {
            this.renderBoard();
            return;
        }
        this.resolveTurn();
    }

    private tapPiece(id: number): void {
        if (this.locked) return;
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
                    icon: (button) => this.decorateActionButton(button, 'video'),
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
        this.showRewardedVideo((rewarded) => {
            this.rewardedAdLoading = false;
            this.locked = false;
            if (!rewarded) {
                uimanager.showToast('完整看完视频才能获得使用机会');
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
                    icon: (button) => this.decorateActionButton(button, 'video'),
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
        this.showRewardedVideo((rewarded) => {
            this.rewardedAdLoading = false;
            this.locked = false;
            if (!rewarded) {
                uimanager.showToast('完整看完视频才能获得使用机会');
                return;
            }
            zyxGameModule.grantRewardedColorPurifier();
            this.setToolSelectionMode('magicWand');
        });
    }

    private showRewardedVideo(onResult: (rewarded: boolean) => void): void {
        let wxApi: any = null;
        try {
            if (typeof wx !== 'undefined') wxApi = wx;
        } catch (error) {
            wxApi = null;
        }
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
    }

    private playEliminationHint(): void {
        if (this.locked || this.hammerMode || this.purifierMode || !this.pieceLayer) return;
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
        if (!this.moodStageLabel || this.hammerMode || this.purifierMode) return;
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

    private handleChallengeFailed(reason: string): void {
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
            '是否需要复活，创造更高纪录？\n看完视频，将清理棋盘上半区后继续挑战。',
            [
                {
                    text: '复活',
                    color: BUTTON_COLORS.yellow,
                    onClick: () => this.requestRevive(reason),
                    icon: (button) => this.decorateActionButton(button, 'video'),
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
                this.createVideoGlyph(badge, -128, 0, 0.92);
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
        this.showRewardedVideo((rewarded) => {
            this.rewardedAdLoading = false;
            if (!rewarded) {
                uimanager.showToast('完整看完视频才能复活');
                this.showReviveModal(reason);
                return;
            }
            this.reviveUsed = true;
            this.roundRescueOffered = false;
            this.performRevive();
        });
    }

    private performRevive(): void {
        const removedPieceIds = zyxGameModule.removeTopHalfForRevive();
        this.setToolSelectionMode(null);
        this.locked = true;
        this.playReviveLightning(() => {
            this.animateReviveShatter(removedPieceIds, () => {
                this.resolveStableBoard(1, () => {
                    this.renderNextRow();
                    this.updateHud();
                    this.locked = false;
                    this.idleSeconds = 0;
                    uimanager.showToast('心情重新有空间了，继续创造纪录吧');
                });
            });
        });
    }

    private playReviveLightning(onComplete: () => void): void {
        if (!this.boardRoot || !cc.isValid(this.boardRoot)) {
            onComplete();
            return;
        }

        const strikeXs = [-170, 0, 170];
        strikeXs.forEach((x, index) => {
            const bolt = new cc.Node(`reviveLightning_${index}`);
            bolt.setPosition(x, 195);
            bolt.zIndex = 80;
            bolt.opacity = 0;
            bolt.scale = 0.78;
            this.boardRoot.addChild(bolt);
            const graphics = bolt.addComponent(cc.Graphics);
            const drawBolt = (color: cc.Color, width: number): void => {
                graphics.strokeColor = color;
                graphics.lineWidth = width;
                graphics.moveTo(12, 176);
                graphics.lineTo(-18, 116);
                graphics.lineTo(10, 116);
                graphics.lineTo(-14, 52);
                graphics.lineTo(14, 52);
                graphics.lineTo(-8, -24);
                graphics.stroke();
            };
            drawBolt(new cc.Color(238, 170, 63, 230), 18);
            drawBolt(new cc.Color(255, 249, 203, 255), 9);
            graphics.fillColor = new cc.Color(255, 225, 112, 230);
            graphics.circle(-27, 91, 6);
            graphics.circle(25, 73, 5);
            graphics.fill();

            cc.tween(bolt)
                .delay(index * 0.09)
                .to(0.08, { opacity: 255, scale: 1.04 }, { easing: 'backOut' })
                .to(0.07, { opacity: 105, scale: 0.95 })
                .to(0.08, { opacity: 255, scale: 1 })
                .delay(0.12)
                .to(0.16, { opacity: 0, scale: 1.08 })
                .call(() => bolt.destroy())
                .start();
            this.playReviveSpineBurst(x, 64, index);
        });

        cc.Tween.stopAllByTarget(this.boardRoot);
        const originX = this.boardRoot.x;
        cc.tween(this.boardRoot)
            .delay(0.08)
            .to(0.05, { x: originX - 7 })
            .to(0.05, { x: originX + 7 })
            .to(0.05, { x: originX - 4 })
            .to(0.05, { x: originX })
            .start();
        this.scheduleOnce(onComplete, 0.64);
    }

    private playReviveSpineBurst(x: number, y: number, index: number): void {
        if (!this.clearSpineData || !this.boardRoot) return;
        const node = new cc.Node(`reviveSpine_${index}`);
        node.setPosition(x, y);
        node.opacity = 210;
        node.scaleX = 0.82;
        node.scaleY = 0.7;
        node.zIndex = 72;
        this.boardRoot.addChild(node);
        const skeleton = node.addComponent(sp.Skeleton);
        skeleton.skeletonData = this.clearSpineData;
        skeleton.premultipliedAlpha = false;
        skeleton.timeScale = 1.45;
        skeleton.setAnimation(0, index % 2 === 0 ? 'action' : 'action2', false);
        skeleton.setCompleteListener(() => {
            if (cc.isValid(node)) node.destroy();
        });
        this.scheduleOnce(() => {
            if (cc.isValid(node)) node.destroy();
        }, 0.9);
    }

    private animateReviveShatter(pieceIds: number[], onComplete: () => void): void {
        if (!this.pieceLayer || pieceIds.length === 0) {
            onComplete();
            return;
        }
        const targets = pieceIds
            .map((id) => ({
                id,
                node: this.pieceLayer.getChildByName(`piece_${id}`),
                color: this.pieceColors[id],
            }))
            .filter((target) => !!target.node)
            .sort((left, right) => right.node.y - left.node.y);
        if (targets.length === 0) {
            onComplete();
            return;
        }

        let longestDelay = 0;
        targets.forEach((target, index) => {
            const delay = index * 0.055;
            longestDelay = delay;
            this.scheduleOnce(() => {
                if (!cc.isValid(target.node)) return;
                target.node.scaleY = 0.76;
                this.spawnPieceShards(target.node, target.color, target.id, true);
                delete this.pieceColors[target.id];
                target.node.destroy();
            }, delay);
        });
        this.scheduleOnce(onComplete, longestDelay + 0.13);
    }

    private pauseGame(): void {
        if (this.locked) return;
        this.markInteraction();
        this.setToolSelectionMode(null);
        this.locked = true;
        uimanager.showModal('已暂停', `当前分数 ${zyxGameModule.score}`, [
            {
                text: '继续游戏',
                color: BUTTON_COLORS.green,
                onClick: () => {
                    this.locked = false;
                    this.idleSeconds = 0;
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
        ]);
    }

    private finishGame(_reason: string): void {
        this.cancelEliminationHint();
        this.setToolSelectionMode(null);
        this.locked = true;
        const settlement = zyxGameModule.finishRound();
        this.updateHud();
        uimanager.showModal('本局结算', this.getSettlementMessage(settlement), [
            {
                text: '返回',
                color: BUTTON_COLORS.red,
                onClick: () => this.leaveSettlement(false, settlement),
                icon: (button) => this.decorateActionButton(button, 'home'),
            },
            {
                text: '重新再来',
                color: BUTTON_COLORS.green,
                onClick: () => this.leaveSettlement(true, settlement),
                icon: (button) => this.decorateActionButton(button, 'restart'),
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
        }, 250);
    }

    private leaveSettlement(restart: boolean, settlement: RoundSettlement): void {
        if (this.onSettlementExit) {
            this.onSettlementExit({ restart, settlement });
            return;
        }
        if (restart) this.restartGame();
    }

    private restartGame(): void {
        zyxGameModule.resetRound();
        this.roundRescueOffered = false;
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
