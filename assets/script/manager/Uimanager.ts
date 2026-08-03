declare const wx: any;

export type ModalAction = {
    text: string;
    color: cc.Color;
    onClick: () => void;
    icon?: (button: cc.Node) => void;
};

export type ModalDecoration = (panel: cc.Node, centerY: number) => void;

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

/** 只保留核心流程需要的轻量 UI 工厂与弹窗。 */
export default class Uimanager {
    private static _instance: Uimanager;

    public static get instance(): Uimanager {
        if (!this._instance) this._instance = new Uimanager();
        return this._instance;
    }

    private scene: cc.Node = null;
    private modal: cc.Node = null;
    private toast: cc.Node = null;

    public init(scene: cc.Node): void {
        this.scene = scene;
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
        const wxApi = typeof wx !== 'undefined'
            ? wx
            : (typeof window !== 'undefined' ? (window as any).wx : null);
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

    public createResourceSprite(
        parent: cc.Node,
        name: string,
        resourcePath: string,
        width: number,
        height: number,
        x: number = 0,
        y: number = 0,
    ): cc.Node {
        const node = new cc.Node(name);
        node.width = width;
        node.height = height;
        node.setAnchorPoint(0.5, 0.5);
        node.setPosition(x, y);
        node.zIndex = -20;
        parent.addChild(node);
        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        cc.resources.load(resourcePath, cc.SpriteFrame, (error: Error, frame: cc.SpriteFrame) => {
            if (error || !frame || !cc.isValid(node)) return;
            sprite.spriteFrame = frame;
            node.width = width;
            node.height = height;
        });
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
        label.cacheMode = cc.Label.CacheMode.NONE;
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
        fontSize: number = 28,
    ): cc.Node {
        const button = this.createRect(parent, `button_${text}`, width, height, color, 255, 16, x, y);
        button.addComponent(cc.Button);
        this.drawButtonSurface(button, width, height, color, Math.min(20, height * 0.26));
        const label = this.createLabel(button, text, 0, 2, fontSize, cc.Color.WHITE, width - 24, height - 10);
        const outline = label.node.addComponent(cc.LabelOutline);
        outline.color = new cc.Color(
            Math.round(color.r * 0.48),
            Math.round(color.g * 0.48),
            Math.round(color.b * 0.48),
        );
        outline.width = 1.3;

        button.on(cc.Node.EventType.TOUCH_START, () => {
            cc.tween(button).stop();
            cc.tween(button).to(0.07, { scale: 0.95 }).start();
        });
        button.on(cc.Node.EventType.TOUCH_END, () => {
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

    public showModal(
        title: string,
        message: string,
        actions: ModalAction[],
        decoration: ModalDecoration = null,
        contentHeight: number = 0,
    ): cc.Node {
        if (!this.scene) return null;
        this.closeModal();

        const root = new cc.Node('modal');
        root.width = this.scene.width;
        root.height = this.scene.height;
        root.setAnchorPoint(0.5, 0.5);
        root.zIndex = 2000;
        root.addComponent(cc.BlockInputEvents);
        this.scene.addChild(root);
        this.modal = root;

        this.createRect(root, 'mask', root.width, root.height, new cc.Color(65, 46, 40), 190);
        const panelHeight = 300 + actions.length * 92 + contentHeight;
        const panel = this.createRect(root, 'panel', 560, panelHeight, new cc.Color(211, 164, 98), 255, 26, 0, 0);
        this.createRect(panel, 'panelInner', 540, panelHeight - 20, new cc.Color(255, 244, 220), 255, 22);
        this.createLabel(panel, title, 0, panelHeight / 2 - 72, 40, new cc.Color(90, 64, 58), 460, 64);
        this.createLabel(panel, message, 0, panelHeight / 2 - 150, 24, new cc.Color(124, 92, 76), 470, 82);

        let startY = panelHeight / 2 - 245;
        if (decoration && contentHeight > 0) {
            const contentCenterY = panelHeight / 2 - 235 - contentHeight / 2;
            decoration(panel, contentCenterY);
            startY = contentCenterY - contentHeight / 2 - 70;
        }
        actions.forEach((action, index) => {
            const button = this.createButton(panel, action.text, 0, startY - index * 92, 420, 72, action.color, () => {
                this.closeModal();
                action.onClick();
            }, 27);
            if (action.icon) action.icon(button);
        });

        panel.scale = 0.82;
        panel.opacity = 0;
        cc.tween(panel).to(0.2, { scale: 1, opacity: 255 }, { easing: 'backOut' }).start();
        return root;
    }

    public closeModal(): void {
        if (this.modal && this.modal.isValid) this.modal.destroy();
        this.modal = null;
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

export const uimanager = Uimanager.instance;
