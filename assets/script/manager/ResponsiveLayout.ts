export const DESIGN_WIDTH = 750;
export const DESIGN_HEIGHT = 1334;

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
    const height = game ? DESIGN_HEIGHT : Math.max(DESIGN_HEIGHT, region.height);
    const scale = Math.min(1, region.width / width, region.height / height);
    return { x: region.x, y: region.y, width, height, scale };
}
