import { gameSettings } from './GameSettings';
import { getWxApi } from './PlatformAdapter';

export type ModalAction = {
    text: string;
    color: cc.Color;
    onClick: () => void;
    icon?: (button: cc.Node) => void;
    /** 微信授权等依赖直接点击手势的操作，不能在调用前销毁弹窗。 */
    closeOnClick?: boolean;
};

export type ModalDecoration = (panel: cc.Node, centerY: number) => void;

export type ModalDismissOptions = {
    /** 仅遮罩、空白和关闭钮触发；操作按钮继续使用各自的 onClick。 */
    onDismiss?: () => void;
    closeOnBlank?: boolean;
};

export type SafeAreaMetrics = {
    top: number;
    bottom: number;
    left: number;
    right: number;
    /** 微信右上角胶囊底边距屏幕顶部的设计坐标距离。 */
    menuBottom: number;
    /** 微信右上角胶囊左边缘相对屏幕中心的设计坐标；无胶囊时等于屏幕右边缘。 */
    menuLeft: number;
};

/** 全游戏只使用这三种动作色：黄=主要获取，绿=继续/确认，红=暂停/退出。 */
export const BUTTON_COLORS = {
    yellow: new cc.Color(244, 181, 60),
    green: new cc.Color(105, 181, 129),
    red: new cc.Color(226, 104, 95),
};
export const BUTTON_TEXT_COLOR = new cc.Color(88, 61, 55);

/** 昵称只在展示层截断，服务端仍保存完整微信资料；按 Unicode 字符计数，避免拆散表情。 */
export function formatDisplayNickname(nickname: string): string {
    const characters = Array.from(typeof nickname === 'string' ? nickname.trim() : '');
    return characters.length > 7 ? `${characters.slice(0, 7).join('')}...` : characters.join('');
}

/** 只保留核心流程需要的轻量 UI 工厂与弹窗。 */
export default class UIManager {
    private static _instance: UIManager;

    public static get instance(): UIManager {
        if (!this._instance) this._instance = new UIManager();
        return this._instance;
    }

    private scene: cc.Node = null;
    private modal: cc.Node = null;
    private toast: cc.Node = null;
    private hapticRoot: cc.Node = null;
    private hapticTouchStart: cc.Vec2 = null;
    private hapticTouchMoved: boolean = false;

    public init(scene: cc.Node): void {
        this.scene = scene;
        if (this.hapticRoot === scene) return;
        this.unbindGlobalHaptics();
        this.hapticRoot = scene;
        if (!this.hapticRoot) return;
        this.hapticRoot.on(cc.Node.EventType.TOUCH_START, this.handleHapticTouchStart, this, true);
        this.hapticRoot.on(cc.Node.EventType.TOUCH_MOVE, this.handleHapticTouchMove, this, true);
        this.hapticRoot.on(cc.Node.EventType.TOUCH_END, this.handleHapticTouchEnd, this, true);
        this.hapticRoot.on(cc.Node.EventType.TOUCH_CANCEL, this.handleHapticTouchCancel, this, true);
    }

    /** 非 cc.Button 的点击区域（例如轮播侧击、滑杆）也通过这个入口保持反馈一致。 */
    public tapFeedback(): void {
        gameSettings.vibrateLight();
    }

    private unbindGlobalHaptics(): void {
        if (!this.hapticRoot || !cc.isValid(this.hapticRoot)) return;
        this.hapticRoot.off(cc.Node.EventType.TOUCH_START, this.handleHapticTouchStart, this, true);
        this.hapticRoot.off(cc.Node.EventType.TOUCH_MOVE, this.handleHapticTouchMove, this, true);
        this.hapticRoot.off(cc.Node.EventType.TOUCH_END, this.handleHapticTouchEnd, this, true);
        this.hapticRoot.off(cc.Node.EventType.TOUCH_CANCEL, this.handleHapticTouchCancel, this, true);
    }

    private handleHapticTouchStart(event: cc.Event.EventTouch): void {
        this.hapticTouchStart = event.getLocation();
        this.hapticTouchMoved = false;
    }

    private handleHapticTouchMove(event: cc.Event.EventTouch): void {
        if (!this.hapticTouchStart || this.hapticTouchMoved) return;
        const point = event.getLocation();
        const dx = point.x - this.hapticTouchStart.x;
        const dy = point.y - this.hapticTouchStart.y;
        this.hapticTouchMoved = dx * dx + dy * dy > 144;
    }

    private handleHapticTouchEnd(event: cc.Event.EventTouch): void {
        if (!this.hapticTouchMoved && this.hasInteractiveButtonAncestor((event as any).target)) {
            this.tapFeedback();
        }
        this.resetHapticTouch();
    }

    private handleHapticTouchCancel(): void {
        this.resetHapticTouch();
    }

    private resetHapticTouch(): void {
        this.hapticTouchStart = null;
        this.hapticTouchMoved = false;
    }

    private hasInteractiveButtonAncestor(target: cc.Node): boolean {
        let node = target;
        while (node) {
            const button = node.getComponent(cc.Button);
            if (button) return button.enabled && button.interactable;
            if (node === this.hapticRoot) break;
            node = node.parent;
        }
        return false;
    }

    /**
     * 将微信物理像素安全区换算成当前 Cocos 设计坐标。
     * Web 与不支持相关 API 的旧基础库返回 0，不改变现有布局。
     */
    public getSafeAreaMetrics(): SafeAreaMetrics {
        const empty = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            menuBottom: 0,
            menuLeft: cc.winSize.width / 2,
        };
        const wxApi = getWxApi();
        if (!wxApi) return empty;

        let windowInfo: any = null;
        try {
            if (typeof wxApi.getWindowInfo === 'function') windowInfo = wxApi.getWindowInfo();
            else if (typeof wxApi.getSystemInfoSync === 'function') windowInfo = wxApi.getSystemInfoSync();
        } catch (error) {
            return empty;
        }
        if (!windowInfo || !windowInfo.windowWidth || !windowInfo.windowHeight) return empty;

        const scaleX = cc.winSize.width / windowInfo.windowWidth;
        const scaleY = cc.winSize.height / windowInfo.windowHeight;
        const safeArea = windowInfo.safeArea || {
            left: 0,
            top: 0,
            right: windowInfo.windowWidth,
            bottom: windowInfo.windowHeight,
        };
        let menuBottom = 0;
        let menuLeft = cc.winSize.width / 2;
        try {
            if (typeof wxApi.getMenuButtonBoundingClientRect === 'function') {
                const menuRect = wxApi.getMenuButtonBoundingClientRect();
                if (menuRect && Number.isFinite(menuRect.bottom)) {
                    menuBottom = menuRect.bottom * scaleY;
                    menuLeft = menuRect.left * scaleX - cc.winSize.width / 2;
                }
            }
        } catch (error) {
            menuBottom = 0;
            menuLeft = cc.winSize.width / 2;
        }
        return {
            top: Math.max(0, Number(safeArea.top) || 0) * scaleY,
            bottom: Math.max(0, windowInfo.windowHeight - (Number(safeArea.bottom) || windowInfo.windowHeight)) * scaleY,
            left: Math.max(0, Number(safeArea.left) || 0) * scaleX,
            right: Math.max(0, windowInfo.windowWidth - (Number(safeArea.right) || windowInfo.windowWidth)) * scaleX,
            menuBottom,
            menuLeft,
        };
    }

    public createRect(
        parent: cc.Node,
        name: string,
        width: number,
        height: number,
        color: cc.Color,
        opacity: number = 255,
        radius: number = 0,
        x: number = 0,
        y: number = 0,
    ): cc.Node {
        const node = new cc.Node(name);
        node.width = width;
        node.height = height;
        node.opacity = opacity;
        node.setAnchorPoint(0.5, 0.5);
        node.setPosition(x, y);
        parent.addChild(node);
        this.drawRect(node, width, height, color, radius, opacity);
        return node;
    }

    public createCircle(
        parent: cc.Node,
        name: string,
        radius: number,
        color: cc.Color,
        x: number = 0,
        y: number = 0,
    ): cc.Node {
        const node = new cc.Node(name);
        node.width = radius * 2;
        node.height = radius * 2;
        node.setAnchorPoint(0.5, 0.5);
        node.setPosition(x, y);
        parent.addChild(node);
        const graphics = node.addComponent(cc.Graphics);
        graphics.fillColor = color;
        graphics.circle(0, 0, radius);
        graphics.fill();
        return node;
    }

    /** 将自动裁边后的 SpriteFrame 等比放入目标区域，避免 CUSTOM 模式拉伸有效图形。 */
    public fitSpriteFrameInside(node: cc.Node, frame: cc.SpriteFrame, maxWidth: number, maxHeight: number): void {
        if (!node || !frame) return;
        const rect = frame.getRect();
        const sourceWidth = Math.max(1, rect.width);
        const sourceHeight = Math.max(1, rect.height);
        const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
        node.setContentSize(sourceWidth * scale, sourceHeight * scale);
    }

    public createLabel(
        parent: cc.Node,
        text: string,
        x: number,
        y: number,
        fontSize: number,
        color: cc.Color,
        width: number = 300,
        height: number = 54,
    ): cc.Label {
        const node = new cc.Node('label');
        node.width = width;
        node.height = height;
        node.color = color;
        node.zIndex = 50;
        node.setAnchorPoint(0.5, 0.5);
        node.setPosition(x, y);
        parent.addChild(node);

        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = Math.max(fontSize + 8, Math.min(height, fontSize * 1.3));
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.SHRINK;
        label.enableWrapText = true;
        label.fontFamily = 'PingFang SC';
        label.cacheMode = cc.Label.CacheMode.CHAR;
        (label as any).isSystemFontUsed = true;
        // cc.Label 在 addComponent/string 初始化时会重置节点尺寸，尺寸必须最后写入。
        node.width = width;
        node.height = height;
        return label;
    }

    public createButton(
        parent: cc.Node,
        text: string,
        x: number,
        y: number,
        width: number,
        height: number,
        color: cc.Color,
        onClick: () => void,
        fontSize: number = 24,
    ): cc.Node {
        const button = this.createRect(parent, `button_${text}`, width, height, color, 255, 16, x, y);
        button.addComponent(cc.Button);
        this.drawButtonSurface(button, width, height, color, Math.min(20, height * 0.26));
        const label = this.createLabel(button, text, 0, 2, fontSize, BUTTON_TEXT_COLOR, width - 24, height - 10);
        label.enableBold = true;

        button.on(cc.Node.EventType.TOUCH_START, () => {
            if (!button.getComponent(cc.Button).interactable) return;
            cc.tween(button).stop();
            cc.tween(button).to(0.07, { scale: 0.95 }).start();
        });
        button.on(cc.Node.EventType.TOUCH_END, () => {
            if (!button.getComponent(cc.Button).interactable) return;
            cc.tween(button).stop();
            cc.tween(button).to(0.1, { scale: 1 }).start();
            onClick();
        });
        button.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.tween(button).stop();
            cc.tween(button).to(0.1, { scale: 1 }).start();
        });
        return button;
    }

    /** 与参考美术一致的软厚边按钮表面；高光只停留在左上角，不使用生硬长条。 */
    public drawButtonSurface(
        node: cc.Node,
        width: number,
        height: number,
        color: cc.Color,
        radius: number = 16,
    ): void {
        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        const dark = new cc.Color(
            Math.round(color.r * 0.66),
            Math.round(color.g * 0.66),
            Math.round(color.b * 0.66),
        );
        graphics.clear();
        graphics.fillColor = new cc.Color(64, 42, 36, 38);
        graphics.roundRect(-width / 2 + 2, -height / 2 - 5, width - 4, height, radius);
        graphics.fill();
        graphics.fillColor = dark;
        graphics.roundRect(-width / 2, -height / 2 - 1, width, height, radius);
        graphics.fill();
        graphics.fillColor = color;
        graphics.strokeColor = new cc.Color(dark.r, dark.g, dark.b, 225);
        graphics.lineWidth = 2.4;
        graphics.roundRect(-width / 2, -height / 2 + 5, width, height - 7, radius);
        graphics.fill();
        graphics.stroke();
        graphics.fillColor = new cc.Color(255, 255, 255, 26);
        graphics.roundRect(-width / 2 + 5, -height / 2 + 13, width - 10, height - 22, Math.max(7, radius - 5));
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 255, 255, 178);
        graphics.ellipse(-width / 2 + 20, height / 2 - 15, 9, 5);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 255, 255, 88);
        graphics.ellipse(-width / 2 + 31, height / 2 - 17, 5, 2.6);
        graphics.fill();
    }

    public showToast(message: string): void {
        if (!this.scene) return;
        if (this.toast && this.toast.isValid) this.toast.destroy();

        const toast = this.createRect(this.scene, 'toast', 430, 70, new cc.Color(90, 64, 58), 238, 18, 0, 365);
        toast.zIndex = 3000;
        this.createLabel(toast, message, 0, 0, 24, cc.Color.WHITE, 390, 52);
        this.toast = toast;
        toast.opacity = 0;
        toast.y -= 16;
        cc.tween(toast)
            .to(0.18, { opacity: 255, y: toast.y + 16 })
            .delay(1.1)
            .to(0.18, { opacity: 0, y: toast.y + 28 })
            .call(() => toast.destroy())
            .start();
    }

    /**
     * 首次微信资料授权的底部说明层。真正的点击由全屏透明 UserInfoButton 承接，
     * 这里只负责展示熟悉的授权上下文，不放置另一套可见原生按钮。
     */
    public showWeChatAuthorizationSheet(): () => void {
        if (!this.scene || !this.scene.isValid) return () => undefined;
        const root = new cc.Node('wechatAuthorizationSheet');
        root.width = this.scene.width;
        root.height = this.scene.height;
        root.zIndex = 2200;
        root.addComponent(cc.BlockInputEvents);
        this.scene.addChild(root);
        const mask = this.createRect(root, 'mask', root.width, root.height, new cc.Color(35, 35, 35), 150);
        mask.addComponent(cc.BlockInputEvents);

        const safeArea = this.getSafeAreaMetrics();
        let panelBottom = -root.height / 2 + 24 + safeArea.bottom;
        const canvas = this.scene.getComponent(cc.Canvas) ? this.scene : this.scene.parent;
        if (canvas) {
            const bottomLeft = root.convertToNodeSpaceAR(
                canvas.convertToWorldSpaceAR(cc.v2(-cc.winSize.width / 2, -cc.winSize.height / 2)),
            );
            const topRight = root.convertToNodeSpaceAR(
                canvas.convertToWorldSpaceAR(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2)),
            );
            mask.setPosition((bottomLeft.x + topRight.x) / 2, (bottomLeft.y + topRight.y) / 2);
            mask.setContentSize(Math.abs(topRight.x - bottomLeft.x), Math.abs(topRight.y - bottomLeft.y));
            this.drawRect(mask, mask.width, mask.height, new cc.Color(35, 35, 35), 0, 150);
            panelBottom = bottomLeft.y + 24 + safeArea.bottom;
        }

        const panelHeight = 290;
        const panelY = panelBottom + panelHeight / 2;
        const panelWidth = Math.min(640, Math.max(320, root.width - 40));
        const panel = this.createRect(root, 'authorizationPanel', panelWidth, panelHeight,
            new cc.Color(255, 252, 244), 255, 28, 0, panelY);
        this.createRect(panel, 'sheetHandle', 64, 6, new cc.Color(215, 211, 204), 255, 3, 0, 121);
        const title = this.createLabel(panel, '微信授权', 0, 72, 30, new cc.Color(45, 42, 39), 440, 42);
        title.enableBold = true;
        this.createLabel(panel, '使用你的微信昵称和头像\n用于游戏资料与排行榜展示', 0, 16, 22,
            new cc.Color(112, 105, 98), panelWidth - 80, 66);
        this.createButton(panel, '微信一键授权', 0, -82, Math.min(480, panelWidth - 80), 74,
            BUTTON_COLORS.green, () => undefined, 26);

        mask.opacity = 0;
        panel.y = panelY - 46;
        panel.opacity = 0;
        cc.tween(mask).to(0.14, { opacity: 150 }).start();
        cc.tween(panel).to(0.18, { y: panelY, opacity: 255 }, { easing: 'quadOut' }).start();
        let closed = false;
        return () => {
            if (closed) return;
            closed = true;
            if (!cc.isValid(root)) return;
            cc.Tween.stopAllByTarget(panel);
            cc.Tween.stopAllByTarget(mask);
            cc.tween(panel).to(0.14, { y: panelY - 32, opacity: 0 }, { easing: 'quadIn' }).start();
            cc.tween(mask).to(0.14, { opacity: 0 }).start();
            cc.tween(root).delay(0.14).call(() => {
                if (cc.isValid(root)) root.destroy();
            }).start();
        };
    }

    public showModal(
        title: string,
        message: string,
        actions: ModalAction[],
        decoration: ModalDecoration = null,
        contentHeight: number = 0,
        horizontalActions: boolean = false,
        dismissible: boolean = false,
        panelWidth: number = 560,
        dismissOptions: ModalDismissOptions = {},
    ): cc.Node {
        if (!this.scene) return null;
        if (this.toast && this.toast.isValid) {
            cc.Tween.stopAllByTarget(this.toast);
            this.toast.destroy();
            this.toast = null;
        }
        this.closeModal();

        const root = new cc.Node('modal');
        root.width = this.scene.width;
        root.height = this.scene.height;
        root.setAnchorPoint(0.5, 0.5);
        root.zIndex = 2000;
        root.addComponent(cc.BlockInputEvents);
        this.scene.addChild(root);
        this.modal = root;

        const mask = this.createRect(root, 'mask', root.width, root.height, new cc.Color(65, 46, 40), 190);
        mask.addComponent(cc.BlockInputEvents);
        this.refreshModalLayout();
        mask.opacity = 0;
        cc.tween(mask).to(0.14, { opacity: 190 }).start();
        const actionRows = actions.length === 0 ? 0 : (horizontalActions ? 1 : actions.length);
        const panelHeight = 300 + actionRows * 92 + contentHeight;
        const panel = this.createRect(root, 'panel', panelWidth, panelHeight, new cc.Color(211, 164, 98), 255, 26, 0, 0);
        if (dismissible) {
            const dismiss = (): void => {
                if (this.modal !== root) return;
                this.closeModal();
                if (dismissOptions.onDismiss) dismissOptions.onDismiss();
            };
            mask.on(cc.Node.EventType.TOUCH_END, dismiss, this);
            panel.addComponent(cc.BlockInputEvents);
            this.createModalCloseButton(panel, panelHeight, dismiss);
            if (dismissOptions.closeOnBlank) {
                panel.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
                    if (event.target === panel) dismiss();
                }, this);
            }
        }
        this.createRect(panel, 'panelInner', panelWidth - 20, panelHeight - 20, new cc.Color(255, 244, 220), 255, 22);
        this.createModalTitlePlate(panel, title, panelHeight);
        this.createLabel(panel, message, 0, panelHeight / 2 - 150, 24, new cc.Color(124, 92, 76), panelWidth - 90, 82);

        let startY = panelHeight / 2 - 245;
        if (decoration && contentHeight > 0) {
            const contentCenterY = panelHeight / 2 - 235 - contentHeight / 2;
            decoration(panel, contentCenterY);
            startY = contentCenterY - contentHeight / 2 - 70;
        }
        if (horizontalActions && actions.length > 0) {
            const buttonWidth = actions.length === 2 ? 214 : Math.min(420, Math.floor(480 / actions.length) - 12);
            const gap = 18;
            const totalWidth = actions.length * buttonWidth + (actions.length - 1) * gap;
            const left = -totalWidth / 2 + buttonWidth / 2;
            actions.forEach((action, index) => {
                let button: cc.Node = null;
                button = this.createButton(
                    panel,
                    action.text,
                    left + index * (buttonWidth + gap),
                    startY,
                    buttonWidth,
                    72,
                    action.color,
                    () => {
                        cc.Tween.stopAllByTarget(button);
                        if (action.closeOnClick !== false) this.closeModal();
                        action.onClick();
                    },
                    24,
                );
                if (action.icon) action.icon(button);
            });
        } else {
            actions.forEach((action, index) => {
                let button: cc.Node = null;
                button = this.createButton(panel, action.text, 0, startY - index * 92, 420, 72, action.color, () => {
                    cc.Tween.stopAllByTarget(button);
                    if (action.closeOnClick !== false) this.closeModal();
                    action.onClick();
                }, 24);
                if (action.icon) action.icon(button);
            });
        }

        panel.scale = 0.82;
        panel.opacity = 0;
        cc.tween(panel).to(0.18, { scale: 1, opacity: 255 }, { easing: 'backOut' }).start();
        return root;
    }

    /** 圆角方形关闭钮：矢量边缘与叉号，避免细线圆环和文字字形缩放后的锯齿。 */
    private createModalCloseButton(panel: cc.Node, panelHeight: number, onClose: () => void): void {
        const button = this.createRect(
            panel,
            'modalCloseButton',
            56,
            56,
            new cc.Color(255, 232, 176),
            255,
            17,
            panel.width / 2 - 25,
            panelHeight / 2 - 25,
        );
        button.zIndex = 80;
        // 图形保持 56，触摸热区单独放大到 72。
        button.width = 72;
        button.height = 72;
        const graphics = button.getComponent(cc.Graphics);
        graphics.clear();
        graphics.fillColor = new cc.Color(88, 61, 55, 48);
        graphics.roundRect(-28, -30, 56, 56, 17);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 232, 176);
        graphics.strokeColor = new cc.Color(137, 98, 76);
        graphics.lineWidth = 3;
        graphics.roundRect(-28, -28, 56, 56, 17);
        graphics.fill();
        graphics.stroke();
        graphics.strokeColor = new cc.Color(88, 61, 55);
        graphics.lineWidth = 4.5;
        graphics.lineCap = cc.Graphics.LineCap.ROUND;
        graphics.moveTo(-10, -10);
        graphics.lineTo(10, 10);
        graphics.moveTo(10, -10);
        graphics.lineTo(-10, 10);
        graphics.stroke();
        button.addComponent(cc.Button);
        button.on(cc.Node.EventType.TOUCH_START, () => {
            cc.Tween.stopAllByTarget(button);
            cc.tween(button).to(0.06, { scale: 0.9 }).start();
        }, this);
        button.on(cc.Node.EventType.TOUCH_END, () => {
            cc.Tween.stopAllByTarget(button);
            onClose();
        }, this);
        button.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.Tween.stopAllByTarget(button);
            cc.tween(button).to(0.1, { scale: 1 }).start();
        }, this);
    }

    /** 所有业务弹窗共用的跨框标题牌；宽度随标题长度伸缩。 */
    private createModalTitlePlate(panel: cc.Node, title: string, panelHeight: number): void {
        const plateWidth = Math.max(220, Math.min(500, 96 + title.length * 44));
        const plateHeight = 76;
        const plateY = panelHeight / 2 - 4;
        const shadow = this.createRect(
            panel,
            'modalTitleShadow',
            plateWidth + 6,
            plateHeight + 4,
            new cc.Color(88, 61, 55),
            118,
            24,
            0,
            plateY - 6,
        );
        shadow.zIndex = 18;
        const plate = this.createRect(
            panel,
            'modalTitlePlate',
            plateWidth,
            plateHeight,
            new cc.Color(220, 155, 70),
            255,
            23,
            0,
            plateY,
        );
        plate.zIndex = 20;
        const inner = this.createRect(
            plate,
            'modalTitlePlateInner',
            plateWidth - 12,
            plateHeight - 12,
            new cc.Color(245, 199, 102),
            255,
            19,
            0,
            2,
        );
        this.createCircle(plate, 'modalTitleRivetLeft', 3.2, new cc.Color(255, 244, 220), -plateWidth / 2 + 22, 2);
        this.createCircle(plate, 'modalTitleRivetRight', 3.2, new cc.Color(255, 244, 220), plateWidth / 2 - 22, 2);
        this.createLabel(inner, title, 0, 0, 36, new cc.Color(90, 64, 58), plateWidth - 54, 52);
    }

    public closeModal(): void {
        const root = this.modal;
        this.modal = null;
        if (!root || !root.isValid) return;
        const panel = root.getChildByName('panel');
        const mask = root.getChildByName('mask');
        if (!panel) {
            root.destroy();
            return;
        }
        // 新弹窗可以立即创建；关闭中的旧层级退到其后，不拦截新面板。
        root.zIndex = 1999;
        cc.Tween.stopAllByTarget(panel);
        cc.tween(panel).to(0.14, { scale: 0.86, opacity: 0 }, { easing: 'quadIn' }).start();
        if (mask) {
            cc.Tween.stopAllByTarget(mask);
            cc.tween(mask).to(0.14, { opacity: 0 }).start();
        }
        cc.tween(root).delay(0.14).call(() => {
            if (cc.isValid(root)) root.destroy();
        }).start();
    }

    /** 遮罩覆盖整个画布；面板仍使用安全区舞台的位置与缩放。 */
    public refreshModalLayout(): void {
        if (!this.modal || !this.modal.isValid || !this.scene) return;
        const mask = this.modal.getChildByName('mask');
        if (!mask) return;
        const canvas = this.scene.getComponent(cc.Canvas) ? this.scene : this.scene.parent;
        if (!canvas) return;
        const bottomLeft = this.modal.convertToNodeSpaceAR(
            canvas.convertToWorldSpaceAR(cc.v2(-cc.winSize.width / 2, -cc.winSize.height / 2)),
        );
        const topRight = this.modal.convertToNodeSpaceAR(
            canvas.convertToWorldSpaceAR(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2)),
        );
        mask.setPosition((bottomLeft.x + topRight.x) / 2, (bottomLeft.y + topRight.y) / 2);
        mask.setContentSize(Math.abs(topRight.x - bottomLeft.x), Math.abs(topRight.y - bottomLeft.y));
        this.drawRect(mask, mask.width, mask.height, new cc.Color(65, 46, 40), 0, 190);
    }

    public drawRect(node: cc.Node, width: number, height: number, color: cc.Color, radius: number = 0, opacity: number = 255): void {
        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        graphics.clear();
        graphics.fillColor = new cc.Color(color.r, color.g, color.b, opacity);
        if (radius > 0) graphics.roundRect(-width / 2, -height / 2, width, height, radius);
        else graphics.rect(-width / 2, -height / 2, width, height);
        graphics.fill();
    }
}

export const uimanager = UIManager.instance;
