/**
 * GM 悬浮气泡（Web Debug 专用）。
 *
 * 本目录（assets/script/gm/）是 GM 能力的唯一载体：微信构建前由 scripts/strip-gm-code.js
 * 整体剥离，微信产物不包含任何 GM UI、调试接口调用与相关文案；
 * 运行时另有 GmAccess.isGmEnvironmentAvailable 双条件守卫（CC_DEBUG && isBrowser）。
 *
 * 全流程都可访问的悬浮气泡：附着在场景根节点，不随页面切换销毁。可拖动，轻点打开补给面板。
 */
import { uimanager } from '../manager/UIManager';
import { showGmSupplyPanel } from './GmPanel';
import { pushDebugProfileToCloud, GmCloudHooks } from './GmCloudApi';

export type GmBubbleHooks = GmCloudHooks & {
    /** 发放或重置后刷新首页/局内 HUD。 */
    refreshInventoryDisplays: () => void;
};

let gmBubble: cc.Node = null;

function loadBubblePosition(defaultX: number, defaultY: number): { x: number; y: number } {
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

function saveBubblePosition(x: number, y: number): void {
    try {
        cc.sys.localStorage.setItem('zyx_gm_bubble_pos_v1', JSON.stringify({ x, y }));
    } catch (e) {
        // ignore quota / private mode
    }
}

/** 只在 GM 环境下由场景调用；重复调用幂等。 */
export function attachGmBubble(parent: cc.Node, hooks: GmBubbleHooks): void {
    if (gmBubble && cc.isValid(gmBubble)) return;
    const safeArea = uimanager.getSafeAreaMetrics();
    const bubbleWidth = 88;
    const bubbleHeight = 48;
    const halfW = bubbleWidth / 2;
    const halfH = bubbleHeight / 2;
    const defaultX = -cc.winSize.width / 2 + safeArea.left + halfW + 16;
    const defaultY = cc.winSize.height / 2 - safeArea.top - 168;
    const saved = loadBubblePosition(defaultX, defaultY);
    const bubble = uimanager.createRect(parent, 'gmFloatingBubble', bubbleWidth, bubbleHeight, new cc.Color(225, 127, 102), 255, 24, saved.x, saved.y);
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
    });
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
    });
    bubble.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
        dragging = false;
        cc.tween(bubble).stop();
        cc.tween(bubble).to(0.1, { scale: 1 }).start();
        if (moved) {
            saveBubblePosition(bubble.x, bubble.y);
        } else {
            showGmSupplyPanel(
                () => hooks.refreshInventoryDisplays(),
                () => pushDebugProfileToCloud(hooks),
            );
        }
        event.stopPropagation();
    });
    bubble.on(cc.Node.EventType.TOUCH_CANCEL, () => {
        dragging = false;
        cc.tween(bubble).stop();
        cc.tween(bubble).to(0.1, { scale: 1 }).start();
        if (moved) saveBubblePosition(bubble.x, bubble.y);
    });
    gmBubble = bubble;
}
