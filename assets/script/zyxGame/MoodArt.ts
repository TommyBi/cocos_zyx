import { ASSET_PATHS, getSpriteFrame } from '../manager/AssetLoader';

export type MoodVisual = {
    name: string;
    color: cc.Color;
    positive: boolean;
};

/**
 * 6 个积极表情 + 4 个轻度消极表情。
 * 消极表情只表现“需要被整理”，避免恐惧、厌恶等强刺激情绪。
 */
export const MOOD_VISUALS: MoodVisual[] = [
    { name: '欢喜', color: new cc.Color(241, 194, 85), positive: true },
    { name: '安心', color: new cc.Color(126, 190, 157), positive: true },
    { name: '期待', color: new cc.Color(239, 151, 105), positive: true },
    { name: '温柔', color: new cc.Color(228, 154, 151), positive: true },
    { name: '得意', color: new cc.Color(174, 199, 91), positive: true },
    { name: '放松', color: new cc.Color(111, 171, 196), positive: true },
    { name: '犹疑', color: new cc.Color(226, 163, 86), positive: false },
    { name: '烦躁', color: new cc.Color(205, 101, 96), positive: false },
    { name: '委屈', color: new cc.Color(137, 151, 191), positive: false },
    { name: '郁闷', color: new cc.Color(151, 124, 132), positive: false },
];

export const MOOD_COLORS = {
    cream: new cc.Color(255, 246, 224),
    creamDeep: new cc.Color(245, 220, 177),
    honey: new cc.Color(242, 188, 72),
    apricot: new cc.Color(236, 143, 78),
    coral: new cc.Color(220, 111, 98),
    cocoa: new cc.Color(88, 61, 55),
    cocoaSoft: new cc.Color(119, 86, 73),
    sage: new cc.Color(126, 179, 146),
    mistBlue: new cc.Color(111, 164, 193),
    glow: new cc.Color(255, 224, 134),
};

/** 首页、资料弹窗与排行榜共用的圆角头像框。 */
export function createAvatarFrame(parent: cc.Node, name: string, x: number, y: number, size: number = 92): cc.Node {
    const frame = new cc.Node(name);
    frame.width = size;
    frame.height = size;
    frame.setPosition(x, y);
    parent.addChild(frame);
    const graphics = frame.addComponent(cc.Graphics);
    const rectSize = size - 2;
    graphics.fillColor = new cc.Color(255, 239, 190);
    graphics.strokeColor = MOOD_COLORS.cocoaSoft;
    graphics.lineWidth = 4;
    graphics.roundRect(-rectSize / 2, -rectSize / 2, rectSize, rectSize, Math.min(28, rectSize * 22 / 90));
    graphics.fill();
    graphics.stroke();
    return frame;
}

const roundedAvatarMaskFrames: { [radius: number]: cc.SpriteFrame } = {};

/** 生成共享圆角透明蒙版，避免微信头像的矩形四角从圆角框中露出。 */
function getRoundedAvatarMaskFrame(cornerRatio: number): cc.SpriteFrame {
    const size = 64;
    const radius = Math.max(0, Math.min(size / 2, Math.round(cornerRatio * size)));
    if (roundedAvatarMaskFrames[radius]) return roundedAvatarMaskFrames[radius];
    const data = new Uint8Array(size * size * 4);
    const samples = [0.125, 0.375, 0.625, 0.875];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let coverage = 0;
            for (const sampleY of samples) {
                for (const sampleX of samples) {
                    const px = x + sampleX - size / 2;
                    const py = y + sampleY - size / 2;
                    const qx = Math.abs(px) - (size / 2 - radius);
                    const qy = Math.abs(py) - (size / 2 - radius);
                    const distance = Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
                        + Math.min(Math.max(qx, qy), 0);
                    if (distance <= radius) coverage++;
                }
            }
            const offset = (y * size + x) * 4;
            data[offset] = 255;
            data[offset + 1] = 255;
            data[offset + 2] = 255;
            data[offset + 3] = Math.round(coverage * 255 / 16);
        }
    }
    const texture = new cc.Texture2D();
    texture.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, size, size);
    const frame = new cc.SpriteFrame(texture);
    roundedAvatarMaskFrames[radius] = frame;
    return frame;
}

export function applyRoundedAvatarMask(maskNode: cc.Node, cornerRatio: number = 15 / 64): cc.Mask {
    const mask = maskNode.getComponent(cc.Mask) || maskNode.addComponent(cc.Mask);
    mask.type = cc.Mask.Type.IMAGE_STENCIL;
    mask.spriteFrame = getRoundedAvatarMaskFrame(cornerRatio);
    mask.alphaThreshold = 0.05;
    return mask;
}

export function getMoodColor(index: number): cc.Color {
    const mood = MOOD_VISUALS[Math.max(0, Math.min(MOOD_VISUALS.length - 1, index - 1))];
    return mood.color;
}

export function getMoodName(index: number): string {
    const mood = MOOD_VISUALS[Math.max(0, Math.min(MOOD_VISUALS.length - 1, index - 1))];
    return mood.name;
}

export function isPositiveMood(index: number): boolean {
    const mood = MOOD_VISUALS[Math.max(0, Math.min(MOOD_VISUALS.length - 1, index - 1))];
    return mood.positive;
}

/**
 * 统一的半立体心情块材质：左上局部反光、右下厚边和柔和接触阴影。
 * 动态长度的横块全部由程序绘制，避免拉伸位图后高光和圆角变形。
 */
export function drawMoodBlockMaterial(node: cc.Node, color: cc.Color, alpha: number = 1): void {
    const safeAlpha = Math.max(0, Math.min(1, alpha));
    const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
    const width = node.width;
    const height = node.height;
    const radius = Math.min(15, height * 0.24);
    const dark = new cc.Color(
        Math.round(color.r * 0.7),
        Math.round(color.g * 0.7),
        Math.round(color.b * 0.7),
        Math.round(255 * safeAlpha),
    );
    graphics.clear();

    graphics.fillColor = new cc.Color(73, 48, 43, Math.round(42 * safeAlpha));
    graphics.roundRect(-width / 2 + 1, -height / 2 - 4, width - 2, height, radius);
    graphics.fill();

    graphics.fillColor = dark;
    graphics.roundRect(-width / 2, -height / 2 - 1, width, height, radius);
    graphics.fill();

    graphics.fillColor = new cc.Color(color.r, color.g, color.b, Math.round(255 * safeAlpha));
    graphics.strokeColor = new cc.Color(84, 60, 54, Math.round(150 * safeAlpha));
    graphics.lineWidth = 2.3;
    graphics.roundRect(-width / 2, -height / 2 + 3, width, height - 5, radius);
    graphics.fill();
    graphics.stroke();

    graphics.fillColor = new cc.Color(255, 255, 255, Math.round(22 * safeAlpha));
    graphics.roundRect(-width / 2 + 5, -height / 2 + 9, width - 10, height - 15, Math.max(6, radius - 4));
    graphics.fill();

    graphics.fillColor = new cc.Color(dark.r, dark.g, dark.b, Math.round(62 * safeAlpha));
    graphics.roundRect(-width / 2 + 8, -height / 2 + 5, width - 16, 8, 4);
    graphics.fill();

    const shineX = -width / 2 + Math.min(18, width * 0.18);
    const shineY = height / 2 - 12;
    graphics.fillColor = new cc.Color(255, 255, 255, Math.round(176 * safeAlpha));
    graphics.ellipse(shineX, shineY, Math.min(8, width * 0.09), 4.5);
    graphics.fill();
    graphics.fillColor = new cc.Color(255, 255, 255, Math.round(92 * safeAlpha));
    graphics.ellipse(shineX + 8, shineY - 2, Math.min(5, width * 0.055), 2.5);
    graphics.fill();
}

/** 原有十款之外的二十款线稿表情，独立于颜色与豆奖励类型。 */
export const EXTRA_FACE_NAMES = [
    '眨眼', '偷笑', '大笑', '惊喜', '星星眼', '爱心眼', '害羞', '陶醉', '吹口哨', '鼓嘴',
    '困困', '打盹', '好奇', '思考', '俏皮', '小得意', '专注', '无辜', '小委屈', '松口气',
];

/** 在色块逻辑格内绘制低对比度线稿。 */
export function createMoodStamp(
    parent: cc.Node,
    moodIndex: number,
    cellSize: number,
    stampCell: number = 0,
    opacity: number = 128,
    faceIndex: number = moodIndex,
): cc.Node {
    const node = new cc.Node('moodStamp');
    node.width = 38;
    node.height = 38;
    node.opacity = Math.max(172, Math.min(235, opacity + 40));
    node.setAnchorPoint(0.5, 0.5);
    node.setPosition(-parent.width / 2 + (stampCell + 0.5) * cellSize, -1);
    node.zIndex = 4;
    (node as any).moodIndex = moodIndex;
    parent.addChild(node);

    const face = drawMoodFace(node, faceIndex, 31, new cc.Color(MOOD_COLORS.cocoa.r, MOOD_COLORS.cocoa.g, MOOD_COLORS.cocoa.b, 248));
    const idleDelay = (Math.abs(Math.round(node.x)) % 11) * 0.12 + moodIndex * 0.05;
    cc.tween(face)
        .delay(idleDelay)
        .repeatForever(
            cc.tween()
                .delay(1.7 + (moodIndex % 3) * 0.22)
                .to(0.08, { scaleY: 0.78, y: -0.5 }, { easing: 'sineIn' })
                .to(0.12, { scaleY: 1.05, y: 0.25 }, { easing: 'sineOut' })
                .to(0.15, { scaleY: 1, y: 0 }, { easing: 'sineInOut' }),
        )
        .start();
    return node;
}

/** 所有开心豆共用同一张正式角色图；moodIndex 仅保留来源信息，不再改变货币外观。 */
export function createMoodBean(
    parent: cc.Node,
    moodIndex: number,
    x: number,
    y: number,
    size: number = 40,
    opacity: number = 255,
): cc.Node {
    const node = new cc.Node(`moodBean_${moodIndex}`);
    node.opacity = opacity;
    node.setAnchorPoint(0.5, 0.5);
    node.setPosition(x, y);
    node.zIndex = 80;
    (node as any).moodIndex = moodIndex;
    parent.addChild(node);
    const sprite = node.addComponent(cc.Sprite);
    sprite.spriteFrame = getSpriteFrame('game', ASSET_PATHS.game.hudMascot);
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    node.setContentSize(size, size);
    return node;
}

/** 首页、头像、局内收集与结算都通过同一入口创建角色。 */
export function createMoodBeanMascot(
    parent: cc.Node,
    x: number,
    y: number,
    size: number = 48,
    opacity: number = 255,
): cc.Node {
    const mascot = createMoodBean(parent, 1, x, y, size, opacity);
    mascot.name = 'moodBeanMascot';
    return mascot;
}

/** 暖金色软糖闪电：五官收在完整的中腰内，不跨越右侧折口。 */
export function createStaminaBolt(parent: cc.Node, x: number, y: number, size: number = 42): cc.Node {
    const node = new cc.Node('staminaBolt');
    node.setContentSize(size, size);
    node.setPosition(x, y);
    node.zIndex = 80;
    parent.addChild(node);
    const g = node.addComponent(cc.Graphics);
    const unit = size / 42;
    const trace = (offsetX: number, offsetY: number): void => {
        g.moveTo((-3 + offsetX) * unit, (18 + offsetY) * unit);
        g.quadraticCurveTo((-1 + offsetX) * unit, (21 + offsetY) * unit, (3 + offsetX) * unit, (19 + offsetY) * unit);
        g.lineTo((11 + offsetX) * unit, (18 + offsetY) * unit);
        g.quadraticCurveTo((15 + offsetX) * unit, (18 + offsetY) * unit, (12 + offsetX) * unit, (14 + offsetY) * unit);
        g.lineTo((6 + offsetX) * unit, (5 + offsetY) * unit);
        g.lineTo((13 + offsetX) * unit, (5 + offsetY) * unit);
        g.quadraticCurveTo((17 + offsetX) * unit, (5 + offsetY) * unit, (14 + offsetX) * unit, (0 + offsetY) * unit);
        g.lineTo((-7 + offsetX) * unit, (-19 + offsetY) * unit);
        g.quadraticCurveTo((-11 + offsetX) * unit, (-22 + offsetY) * unit, (-10 + offsetX) * unit, (-17 + offsetY) * unit);
        g.lineTo((-5 + offsetX) * unit, (-5 + offsetY) * unit);
        g.lineTo((-13 + offsetX) * unit, (-5 + offsetY) * unit);
        g.quadraticCurveTo((-17 + offsetX) * unit, (-5 + offsetY) * unit, (-15 + offsetX) * unit, (-1 + offsetY) * unit);
        g.close();
    };
    g.fillColor = new cc.Color(141, 93, 40, 55);
    trace(1.2, -2);
    g.fill();
    g.fillColor = new cc.Color(248, 199, 87);
    g.strokeColor = new cc.Color(177, 122, 54);
    g.lineWidth = Math.max(1.4, size * 0.05);
    g.lineJoin = cc.Graphics.LineJoin.ROUND;
    trace(0, 0);
    g.fill(); g.stroke();
    g.fillColor = new cc.Color(255, 239, 171, 215);
    g.moveTo(-12 * unit, -2 * unit); g.lineTo(-3 * unit, 16 * unit);
    g.quadraticCurveTo(-2 * unit, 18 * unit, 0, 17 * unit);
    g.lineTo(-8 * unit, -2 * unit); g.close(); g.fill();
    g.fillColor = new cc.Color(255, 252, 229, 230);
    g.ellipse(0, 15 * unit, 3.7 * unit, 1.8 * unit); g.fill();
    g.fillColor = MOOD_COLORS.cocoa;
    g.circle(-5 * unit, 7 * unit, 1.25 * unit);
    g.circle(1 * unit, 7 * unit, 1.25 * unit); g.fill();
    g.fillColor = new cc.Color(226, 131, 89, 165);
    g.ellipse(-7.5 * unit, 3.8 * unit, 1.7 * unit, 0.9 * unit);
    g.ellipse(3.5 * unit, 3.8 * unit, 1.7 * unit, 0.9 * unit); g.fill();
    g.strokeColor = MOOD_COLORS.cocoa;
    g.lineWidth = Math.max(1, size * 0.032);
    g.lineCap = cc.Graphics.LineCap.ROUND;
    g.moveTo(-4.5 * unit, 2.5 * unit);
    g.quadraticCurveTo(-2 * unit, -0.5 * unit, 0.5 * unit, 2.5 * unit); g.stroke();
    return node;
}

/** 结算与经验条共用的经验图标：暖金星芒配青绿色外圈，和表情代币明显区分。 */
export function createExperienceToken(
    parent: cc.Node,
    x: number,
    y: number,
    size: number = 38,
    opacity: number = 255,
): cc.Node {
    const node = new cc.Node('experienceToken');
    node.width = size;
    node.height = size;
    node.opacity = opacity;
    node.setAnchorPoint(0.5, 0.5);
    node.setPosition(x, y);
    node.zIndex = 90;
    parent.addChild(node);

    const g = node.addComponent(cc.Graphics);
    const radius = size * 0.43;
    g.fillColor = new cc.Color(71, 52, 46, 48);
    g.circle(1.5, -2.2, radius + 1);
    g.fill();
    g.fillColor = new cc.Color(105, 181, 145);
    g.strokeColor = new cc.Color(255, 247, 222, 225);
    g.lineWidth = Math.max(1.5, size * 0.055);
    g.circle(0, 0, radius);
    g.fill();
    g.stroke();
    g.fillColor = new cc.Color(255, 249, 220, 238);
    g.circle(0, 0, radius * 0.68);
    g.fill();

    const star = size * 0.27;
    const inner = star * 0.36;
    g.fillColor = new cc.Color(244, 181, 60);
    g.strokeColor = new cc.Color(157, 105, 53, 205);
    g.lineWidth = Math.max(1.1, size * 0.034);
    g.moveTo(0, star);
    g.lineTo(inner, inner);
    g.lineTo(star, 0);
    g.lineTo(inner, -inner);
    g.lineTo(0, -star);
    g.lineTo(-inner, -inner);
    g.lineTo(-star, 0);
    g.lineTo(-inner, inner);
    g.close();
    g.fill();
    g.stroke();
    g.fillColor = new cc.Color(255, 255, 255, 180);
    g.ellipse(-radius * 0.28, radius * 0.32, radius * 0.18, radius * 0.09);
    g.fill();
    return node;
}

/** 统一的柔和表情语言：消极情绪也不使用尖牙、血丝或夸张哭脸。 */
export function drawMoodFace(parent: cc.Node, moodIndex: number, size: number, color: cc.Color): cc.Node {
    const node = new cc.Node('faceLines');
    node.width = size;
    node.height = size;
    node.setAnchorPoint(0.5, 0.5);
    node.zIndex = 3;
    parent.addChild(node);

    const g = node.addComponent(cc.Graphics);
    const s = size / 28;
    const lx = -5 * s;
    const rx = 5 * s;
    const eyeY = 3.5 * s;
    g.strokeColor = color;
    g.fillColor = color;
    g.lineWidth = Math.max(1.85, 2.45 * s);
    g.lineCap = cc.Graphics.LineCap.ROUND;
    g.lineJoin = cc.Graphics.LineJoin.ROUND;

    if (moodIndex > 10) {
        drawExtraMoodFace(g, moodIndex, s);
        return node;
    }

    switch (moodIndex) {
        case 1: // 欢喜
            g.arc(lx, eyeY, 2.6 * s, 0.08 * Math.PI, 0.92 * Math.PI, false);
            g.arc(rx, eyeY, 2.6 * s, 0.08 * Math.PI, 0.92 * Math.PI, false);
            g.moveTo(-6 * s, -3 * s);
            g.quadraticCurveTo(0, -10 * s, 7 * s, -2 * s);
            g.stroke();
            break;
        case 2: // 安心
            g.arc(lx, eyeY, 2.7 * s, 0, Math.PI, false);
            g.arc(rx, eyeY, 2.7 * s, 0, Math.PI, false);
            g.moveTo(-5 * s, -4 * s);
            g.quadraticCurveTo(0, -7 * s, 5 * s, -4 * s);
            g.stroke();
            break;
        case 3: // 期待
            g.circle(lx, eyeY, 1.7 * s);
            g.circle(rx, eyeY, 1.7 * s);
            g.fill();
            g.arc(0, -2 * s, 4.5 * s, 0.12 * Math.PI, 0.88 * Math.PI, false);
            g.stroke();
            break;
        case 4: // 温柔
            g.arc(lx, eyeY, 2.5 * s, 0, Math.PI, false);
            g.circle(rx, eyeY, 1.5 * s);
            g.fill();
            g.moveTo(-5 * s, -4 * s);
            g.quadraticCurveTo(0, -8 * s, 6 * s, -3 * s);
            g.stroke();
            break;
        case 5: // 得意
            g.moveTo(-8 * s, eyeY + 1 * s);
            g.lineTo(-3 * s, eyeY - 1 * s);
            g.moveTo(3 * s, eyeY - 1 * s);
            g.lineTo(8 * s, eyeY + 1 * s);
            g.moveTo(-6 * s, -4 * s);
            g.quadraticCurveTo(1 * s, -9 * s, 7 * s, -2 * s);
            g.stroke();
            break;
        case 6: // 放松
            g.moveTo(-8 * s, eyeY);
            g.quadraticCurveTo(lx, eyeY - 2 * s, -2 * s, eyeY);
            g.moveTo(2 * s, eyeY);
            g.quadraticCurveTo(rx, eyeY - 2 * s, 8 * s, eyeY);
            g.moveTo(-4 * s, -4 * s);
            g.quadraticCurveTo(0, -6 * s, 4 * s, -4 * s);
            g.stroke();
            break;
        case 7: // 犹疑
            g.circle(-3 * s, eyeY, 1.4 * s);
            g.circle(7 * s, eyeY, 1.4 * s);
            g.fill();
            g.moveTo(-6 * s, -5 * s);
            g.quadraticCurveTo(-2 * s, -8 * s, 1 * s, -5 * s);
            g.quadraticCurveTo(4 * s, -2 * s, 7 * s, -5 * s);
            g.stroke();
            break;
        case 8: // 烦躁
            g.moveTo(-8 * s, 8 * s);
            g.lineTo(-2 * s, 5 * s);
            g.moveTo(8 * s, 8 * s);
            g.lineTo(2 * s, 5 * s);
            g.circle(lx, eyeY - 1 * s, 1.3 * s);
            g.circle(rx, eyeY - 1 * s, 1.3 * s);
            g.fill();
            g.moveTo(-5 * s, -6 * s);
            g.lineTo(5 * s, -6 * s);
            g.stroke();
            break;
        case 9: // 委屈
            g.arc(lx, eyeY, 2.4 * s, Math.PI, 2 * Math.PI, false);
            g.arc(rx, eyeY, 2.4 * s, Math.PI, 2 * Math.PI, false);
            g.moveTo(-5 * s, -7 * s);
            g.quadraticCurveTo(0, -2 * s, 5 * s, -7 * s);
            g.stroke();
            break;
        default: // 郁闷
            g.moveTo(-8 * s, eyeY + 1 * s);
            g.lineTo(-3 * s, eyeY - 1 * s);
            g.moveTo(2 * s, eyeY - 1 * s);
            g.lineTo(7 * s, eyeY + 1 * s);
            g.moveTo(-5 * s, -6 * s);
            g.quadraticCurveTo(0, -3 * s, 5 * s, -6 * s);
            g.stroke();
            break;
    }
    return node;
}

function drawExtraMoodFace(g: cc.Graphics, index: number, s: number): void {
    const line = (points: number[]): void => {
        g.moveTo(points[0] * s, points[1] * s);
        for (let i = 2; i < points.length; i += 2) g.lineTo(points[i] * s, points[i + 1] * s);
        g.stroke();
    };
    const curve = (x: number, y: number, cx: number, cy: number, ex: number, ey: number): void => {
        g.moveTo(x * s, y * s);
        g.quadraticCurveTo(cx * s, cy * s, ex * s, ey * s);
        g.stroke();
    };
    const dot = (x: number, y: number, r: number = 1.4): void => {
        g.circle(x * s, y * s, r * s); g.fill();
    };
    const eyes = (): void => { dot(-5, 3); dot(5, 3); };
    const smile = (): void => curve(-5, -4, 0, -9, 5, -4);
    const closedEyes = (): void => { curve(-8, 4, -5, 0, -2, 4); curve(2, 4, 5, 0, 8, 4); };
    const cheeks = (): void => {
        line([-10, -1, -11, -3]); line([-7, -1, -8, -3]);
        line([8, -1, 7, -3]); line([11, -1, 10, -3]);
    };
    const oval = (x: number, y: number, rx: number, ry: number): void => {
        g.ellipse(x * s, y * s, rx * s, ry * s); g.stroke();
    };
    // 保持小尺寸下清晰；眉毛、腮边短线和小配饰都用同一暖棕线条。
    g.lineWidth = Math.max(1.4, 1.75 * s);
    switch (index) {
        case 11: // 眨眼
            dot(-5, 3); curve(2, 3, 5, 6, 8, 3); smile(); line([8, 7, 10, 8]); break;
        case 12: // 偷笑
            closedEyes(); curve(-4, -3, 0, -6, 4, -3); oval(3, -6, 3, 2); break;
        case 13: // 大笑
            closedEyes(); curve(-5, -3, 0, -13, 5, -3); line([-5, -3, 5, -3]); break;
        case 14: // 惊喜
            eyes(); oval(0, -5, 2.5, 3); curve(-8, 8, -5, 10, -2, 8); curve(2, 8, 5, 10, 8, 8); break;
        case 15: // 星星眼
            [-5, 5].forEach((x) => line([x, 7, x + 1.2, 4, x + 3, 3, x + 1.2, 2, x, -1, x - 1.2, 2, x - 3, 3, x - 1.2, 4, x, 7]));
            smile(); break;
        case 16: // 爱心眼
            [-5, 5].forEach((x) => {
                curve(x, 1, x - 6, 5, x - 2, 7); curve(x - 2, 7, x, 8, x, 5);
                curve(x, 5, x + 3, 10, x + 3, 5); curve(x + 3, 5, x + 3, 3, x, 1);
            }); smile(); break;
        case 17: // 害羞
            closedEyes(); smile(); cheeks(); break;
        case 18: // 陶醉
            curve(-8, 4, -5, 7, -2, 4); curve(2, 4, 5, 7, 8, 4);
            curve(-4, -4, 0, -8, 4, -4); line([-10, -1, -11, -3]); line([10, -1, 11, -3]); break;
        case 19: // 吹口哨
            dot(-5, 4); dot(5, 4); oval(1, -4, 2, 1.6); line([8, -3, 10, -1, 10, 5, 13, 4]); dot(8, -3, 1); break;
        case 20: // 鼓嘴
            eyes(); line([-3, -4, 0, -3, 3, -4]); curve(-10, 0, -13, -4, -9, -6); curve(10, 0, 13, -4, 9, -6); break;
        case 21: // 困困
            line([-8, 3, -2, 3]); line([2, 3, 8, 3]); oval(0, -5, 2, 3); line([7, 9, 11, 9, 7, 6, 11, 6]); break;
        case 22: // 打盹
            closedEyes(); line([-3, -5, 3, -5]); oval(9, 5, 2, 3); line([-10, 9, -7, 9, -10, 6, -7, 6]); break;
        case 23: // 好奇
            dot(-5, 2); dot(5, 4, 1.8); curve(-8, 7, -5, 10, -2, 7); oval(0, -5, 1.8, 1.3); break;
        case 24: // 思考
            dot(-3, 3); dot(6, 3); line([-8, 8, -2, 9]); line([3, 8, 8, 7]);
            curve(-4, -5, 0, -3, 4, -5); line([7, -7, 9, -3, 11, -4]); break;
        case 25: // 俏皮
            line([-8, 5, -3, 3, -8, 1]); dot(5, 3); curve(-5, -3, 0, -7, 6, -3);
            curve(0, -6, 3, -11, 5, -5); break;
        case 26: // 小得意
            line([-8, 4, -2, 3]); line([2, 3, 8, 4]); curve(-4, -4, 2, -7, 7, -2);
            line([-8, 8, -3, 9]); line([4, 9, 8, 8]); break;
        case 27: // 专注
            oval(-5, 3, 4, 3); oval(5, 3, 4, 3); line([-1, 3, 1, 3]); eyes(); line([-3, -5, 3, -5]); break;
        case 28: // 无辜
            oval(-5, 3, 2.5, 3); oval(5, 3, 2.5, 3); dot(-5, 2, 0.8); dot(5, 2, 0.8);
            curve(-3, -5, 0, -3, 3, -5); break;
        case 29: // 小委屈
            curve(-8, 8, -5, 5, -2, 8); curve(2, 8, 5, 5, 8, 8); eyes();
            curve(-4, -6, 0, -2, 4, -6); curve(10, 2, 7, -3, 10, -3); break;
        case 30: // 松口气
            closedEyes(); oval(0, -5, 2, 1.4); curve(7, -5, 14, -7, 11, -3); curve(8, -8, 15, -10, 13, -6); break;

    }
}

function sizeBackgroundIllustration(node: cc.Node, frame: cc.SpriteFrame, width: number, height: number): void {
    if (!frame) {
        node.setContentSize(width, height);
        return;
    }
    const rect = frame.getRect();
    const sourceWidth = Math.max(1, rect.width);
    const sourceHeight = Math.max(1, rect.height);
    // 宽屏保留完整的竖版场景，左右由程序底色补齐；其余比例等比铺满并裁边。
    const scale = width / height > 0.9
        ? height / sourceHeight
        : Math.max(width / sourceWidth, height / sourceHeight);
    node.setContentSize(sourceWidth * scale, sourceHeight * scale);
}

/** 低对比度的斜向表情墙，循环位移但不争夺交互层注意力。 */
export function createMoodCanvasBackground(parent: cc.Node, width: number, height: number): cc.Node {
    const root = new cc.Node('minimalMoodBackground');
    root.width = width;
    root.height = height;
    root.zIndex = -30;
    parent.addChild(root);

    const graphics = root.addComponent(cc.Graphics);
    graphics.fillColor = new cc.Color(250, 237, 211);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = new cc.Color(255, 204, 117, 34);
    graphics.circle(-width * 0.38, height * 0.36, width * 0.42);
    graphics.fill();
    graphics.fillColor = new cc.Color(126, 190, 157, 26);
    graphics.circle(width * 0.43, -height * 0.35, width * 0.48);
    graphics.fill();
    graphics.fillColor = new cc.Color(239, 151, 105, 20);
    graphics.roundRect(-width * 0.58, -height * 0.11, width * 1.16, 110, 55);
    graphics.fill();

    const illustration = new cc.Node('homeStudioIllustration');
    illustration.width = width;
    illustration.height = height;
    illustration.setAnchorPoint(0.5, 0.5);
    illustration.opacity = 0;
    root.addChild(illustration);
    const sprite = illustration.addComponent(cc.Sprite);
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    sprite.spriteFrame = getSpriteFrame('home', ASSET_PATHS.home.background);
    sizeBackgroundIllustration(illustration, sprite.spriteFrame, width, height);
    cc.tween(illustration).to(0.2, { opacity: 255 }, { easing: 'sineOut' }).start();
    return root;
}

/** 局内专用的日漫暖光“心情整理屋”，与首页的斜向水印墙彻底分离。 */
export function createGameRoomBackground(parent: cc.Node, width: number, height: number): cc.Node {
    const root = new cc.Node('gameRoomBackground');
    root.width = width;
    root.height = height;
    root.zIndex = -30;
    parent.addChild(root);

    const fallback = root.addComponent(cc.Graphics);
    fallback.fillColor = new cc.Color(255, 239, 204);
    fallback.rect(-width / 2, -height / 2, width, height);
    fallback.fill();

    const illustration = new cc.Node('gameRoomIllustration');
    illustration.width = width;
    illustration.height = height;
    illustration.setAnchorPoint(0.5, 0.5);
    illustration.opacity = 0;
    root.addChild(illustration);
    const sprite = illustration.addComponent(cc.Sprite);
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    sprite.spriteFrame = getSpriteFrame('game', ASSET_PATHS.game.background);
    sizeBackgroundIllustration(illustration, sprite.spriteFrame, width, height);
    cc.tween(illustration).to(0.2, { opacity: 255 }, { easing: 'sineOut' }).start();

    return root;
}

export function createMoodWatermarkWall(parent: cc.Node, width: number, height: number): cc.Node {
    const root = new cc.Node('moodWatermarkWall');
    root.width = width;
    root.height = height;
    root.zIndex = -20;
    parent.addChild(root);

    const spacing = 202;
    const layerAngle = 21;
    const angleRadians = layerAngle * Math.PI / 180;
    const angleCos = Math.cos(angleRadians);
    const angleSin = Math.sin(angleRadians);
    // 按旋转后的可视包围盒生成额外格子，确保回收边界始终在屏幕外。
    const projectedWidth = Math.abs(width * angleCos) + Math.abs(height * angleSin);
    const projectedHeight = Math.abs(width * angleSin) + Math.abs(height * angleCos);
    const columns = Math.ceil(projectedWidth / spacing) + 3;
    const rows = Math.ceil(projectedHeight / spacing) + 3;

    const layer = new cc.Node('watermarkLayer');
    layer.width = columns * spacing;
    layer.height = rows * spacing;
    layer.angle = layerAngle;
    root.addChild(layer);

    const positiveMoods = [1, 2, 3, 4, 5, 6, 1, 2];
    const gentleNegativeMoods = [7, 8, 9, 10];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const diagonalSeed = row + col;
            const sizeVariation = ((diagonalSeed * 37 + 11) % 21) / 100;
            const size = 74 * (0.9 + sizeVariation);
            const x = -layer.width / 2 + spacing / 2 + col * spacing;
            const y = layer.height / 2 - spacing / 2 - row * spacing;
            const tile = new cc.Node('watermarkMood');
            tile.width = size;
            tile.height = size;
            tile.setPosition(x, y);
            layer.addChild(tile);

            const moodIndex = diagonalSeed % 5 === 0
                ? gentleNegativeMoods[diagonalSeed % gentleNegativeMoods.length]
                : positiveMoods[diagonalSeed % positiveMoods.length];
            const moodColor = getMoodColor(moodIndex);
            const bg = tile.addComponent(cc.Graphics);
            bg.fillColor = new cc.Color(moodColor.r, moodColor.g, moodColor.b, 64);
            bg.strokeColor = new cc.Color(
                Math.round(moodColor.r * 0.66),
                Math.round(moodColor.g * 0.66),
                Math.round(moodColor.b * 0.66),
                32,
            );
            bg.lineWidth = 1.6;
            bg.roundRect(-size / 2, -size / 2, size, size, size * 0.25);
            bg.fill();
            bg.stroke();
            drawMoodFace(tile, moodIndex, size * 0.46, new cc.Color(88, 61, 55, 52));
        }
    }

    const movementX = spacing * 0.78;
    const movementY = -spacing;
    const startX = -movementX / 2;
    const startY = -movementY / 2;
    const driftSpeed = 15.75;
    const localShiftX = movementX * angleCos + movementY * angleSin;
    const localShiftY = -movementX * angleSin + movementY * angleCos;
    const halfLayerWidth = layer.width / 2;
    const halfLayerHeight = layer.height / 2;
    layer.setPosition(startX, startY);
    cc.tween(layer)
        .repeatForever(
            cc.tween()
                .to(spacing / driftSpeed, { x: startX + movementX, y: startY + movementY })
                .call(() => {
                    // 父层瞬时复位时补偿子节点坐标；仅越界格子会在屏幕外回收到左侧/顶部。
                    for (const tile of layer.children) {
                        let nextX = tile.x + localShiftX;
                        let nextY = tile.y + localShiftY;
                        if (nextX > halfLayerWidth) nextX -= layer.width;
                        if (nextY < -halfLayerHeight) nextY += layer.height;
                        tile.setPosition(nextX, nextY);
                    }
                    layer.setPosition(startX, startY);
                }),
        )
        .start();
    return root;
}
