export const DESIGN_WIDTH = 750;
export const DESIGN_HEIGHT = 1334;
export const GAME_MIN_HEIGHT = 1390;

export type ViewportRect = { x: number; y: number; width: number; height: number };
export type StageLayout = { x: number; y: number; width: number; height: number; scale: number };

/** 保证逻辑画布至少有一块 750 × 1334 的可用区域。 */
export function shouldFitHeight(frameWidth: number, frameHeight: number): boolean {
    return frameWidth / Math.max(1, frameHeight) > DESIGN_WIDTH / DESIGN_HEIGHT;
}

/** 多屏浏览器报告的分区中选择面积最大的可见区域，避免内容跨过铰链。 */
export function chooseViewportSegment(segments: ViewportRect[]): ViewportRect | null {
    if (!segments || segments.length < 2) return null;
    let chosen: ViewportRect = null;
    for (const segment of segments) {
        if (!segment || !Number.isFinite(segment.x) || !Number.isFinite(segment.y)
            || !(segment.width > 0) || !(segment.height > 0)
            || !Number.isFinite(segment.width) || !Number.isFinite(segment.height)) continue;
        if (!chosen || segment.width * segment.height > chosen.width * chosen.height) chosen = segment;
    }
    return chosen;
}

/** 将浏览器 CSS 像素中的分区转换到 Cocos 居中坐标。 */
export function segmentToWorld(
    segment: ViewportRect,
    viewportWidth: number,
    viewportHeight: number,
    worldWidth: number,
    worldHeight: number,
): ViewportRect {
    const scaleX = worldWidth / Math.max(1, viewportWidth);
    const scaleY = worldHeight / Math.max(1, viewportHeight);
    return {
        x: (segment.x + segment.width / 2 - viewportWidth / 2) * scaleX,
        y: (viewportHeight / 2 - segment.y - segment.height / 2) * scaleY,
        width: segment.width * scaleX,
        height: segment.height * scaleY,
    };
}

/** 主舞台保持固定的可读尺寸；宽屏留出背景，窄分区等比缩小到可用区域。 */
export function calculateStageLayout(region: ViewportRect, game: boolean): StageLayout {
    const width = game ? DESIGN_WIDTH : Math.max(DESIGN_WIDTH, Math.min(900, region.width));
    const height = game ? Math.max(GAME_MIN_HEIGHT, Math.min(1560, region.height)) : Math.max(DESIGN_HEIGHT, region.height);
    const scale = Math.min(1, region.width / width, region.height / height);
    return { x: region.x, y: region.y, width, height, scale };
}

/** 外层已处理安全区。各区域按可见边界依次排布，额外高度分配到上下留白。 */
export function calculateGameLayout(height: number, boardHeight: number) {
    const extraGap = Math.max(0, height - GAME_MIN_HEIGHT) / 4;
    const top = height / 2 - 16;
    const hudY = top - 53;
    const boardTop = top - 106 - 18 - extraGap;
    const boardY = boardTop - (boardHeight + 24) / 2;
    const nextTop = boardTop - boardHeight - 24 - 18 - extraGap;
    const nextY = nextTop - 60;
    const toolY = nextTop - 120 - 22 - 74 - extraGap;
    const footerY = -height / 2 + 20 + 40;
    return { hudY, boardY, nextY, toolY, footerY };
}

/** 将全局安全边界与分屏区域相交；胶囊占用整条顶部导航区域。 */
export function insetGameRegion(region: ViewportRect, width: number, height: number,
    safe: { top: number; bottom: number; left: number; right: number; menuBottom: number }): ViewportRect {
    const left = Math.max(region.x - region.width / 2, -width / 2 + safe.left);
    const right = Math.min(region.x + region.width / 2, width / 2 - safe.right);
    const top = Math.min(region.y + region.height / 2, height / 2 - Math.max(safe.top, safe.menuBottom + (safe.menuBottom ? 12 : 0)));
    const bottom = Math.max(region.y - region.height / 2, -height / 2 + safe.bottom);
    return { x: (left + right) / 2, y: (top + bottom) / 2, width: Math.max(1, right - left), height: Math.max(1, top - bottom) };
}
