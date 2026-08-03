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

/** 在色块左侧逻辑格内绘制线稿表情，不使用圆形徽章和腮红。 */
export function createMoodStamp(
    parent: cc.Node,
    moodIndex: number,
    cellSize: number,
    stampCell: number = 0,
    opacity: number = 128,
): cc.Node {
    const node = new cc.Node('moodStamp');
    node.width = 32;
    node.height = 32;
    node.opacity = Math.max(96, Math.min(210, opacity));
    node.setAnchorPoint(0.5, 0.5);
    node.setPosition(-parent.width / 2 + (stampCell + 0.5) * cellSize, -1);
    node.zIndex = 4;
    (node as any).moodIndex = moodIndex;
    parent.addChild(node);

    drawMoodFace(node, moodIndex, 25, new cc.Color(MOOD_COLORS.cocoa.r, MOOD_COLORS.cocoa.g, MOOD_COLORS.cocoa.b, 236));
    return node;
}

/** 独立的圆形表情代币，用于飞入瓶子和瓶内堆叠。 */
export function createMoodToken(
    parent: cc.Node,
    moodIndex: number,
    x: number,
    y: number,
    size: number = 38,
    opacity: number = 255,
): cc.Node {
    const node = new cc.Node(`moodToken_${moodIndex}`);
    node.width = size;
    node.height = size;
    node.opacity = opacity;
    node.setAnchorPoint(0.5, 0.5);
    node.setPosition(x, y);
    node.zIndex = 80;
    (node as any).moodIndex = moodIndex;
    parent.addChild(node);

    const graphics = node.addComponent(cc.Graphics);
    const color = getMoodColor(moodIndex);
    graphics.fillColor = new cc.Color(78, 52, 48, 42);
    graphics.circle(1.5, -2, size * 0.47);
    graphics.fill();
    graphics.fillColor = color;
    graphics.strokeColor = new cc.Color(255, 247, 222, 210);
    graphics.lineWidth = Math.max(1.4, size * 0.055);
    graphics.circle(0, 0, size * 0.43);
    graphics.fill();
    graphics.stroke();
    graphics.fillColor = new cc.Color(255, 255, 255, 78);
    graphics.ellipse(-size * 0.12, size * 0.17, size * 0.18, size * 0.09);
    graphics.fill();
    drawMoodFace(node, moodIndex, size * 0.58, MOOD_COLORS.cocoa);
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
    g.lineWidth = Math.max(1.4, 2 * s);
    g.lineCap = cc.Graphics.LineCap.ROUND;

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

export function getWishLabel(progress: number, target: number): string {
    if (progress <= 0) return '等一个好心情';
    if (progress >= target) return '今日已装满';
    if (progress >= Math.ceil(target / 2)) return '已经过半';
    return '慢慢收集';
}

/** 可缩放的正式表情瓶；瓶盖单独成节点，方便播放“打嗝”动画。 */
export function createWishBottle(
    parent: cc.Node,
    x: number,
    y: number,
    progress: number,
    target: number,
    scale: number = 1,
): cc.Node {
    const node = new cc.Node('wishBottle');
    node.width = 190;
    node.height = 250;
    node.setAnchorPoint(0.5, 0.5);
    node.setPosition(x, y);
    node.scale = scale;
    node.zIndex = 90;
    parent.addChild(node);

    const ratio = Math.max(0, Math.min(1, progress / target));
    const shadow = node.addComponent(cc.Graphics);
    shadow.fillColor = new cc.Color(85, 55, 47, 35);
    shadow.ellipse(0, -98, 118, 25);
    shadow.fill();

    const bottle = new cc.Node('bottleBody');
    bottle.width = 176;
    bottle.height = 220;
    bottle.setPosition(0, -8);
    node.addChild(bottle);
    const g = bottle.addComponent(cc.Graphics);
    g.fillColor = new cc.Color(197, 231, 220, 70);
    g.strokeColor = new cc.Color(94, 121, 111, 205);
    g.lineWidth = 4;
    g.moveTo(-35, 88);
    g.lineTo(-35, 65);
    g.bezierCurveTo(-35, 51, -72, 44, -76, 12);
    g.lineTo(-76, -61);
    g.bezierCurveTo(-76, -88, -53, -101, 0, -101);
    g.bezierCurveTo(53, -101, 76, -88, 76, -61);
    g.lineTo(76, 12);
    g.bezierCurveTo(72, 44, 35, 51, 35, 65);
    g.lineTo(35, 88);
    g.close();
    g.fill();
    g.stroke();

    g.fillColor = new cc.Color(255, 255, 255, 90);
    g.roundRect(-59, -65, 12, 112, 6);
    g.fill();
    g.fillColor = new cc.Color(255, 255, 255, 54);
    g.ellipse(15, 58, 30, 10);
    g.fill();
    g.strokeColor = new cc.Color(255, 255, 255, 125);
    g.lineWidth = 2;
    g.moveTo(-48, 53);
    g.bezierCurveTo(-61, 24, -61, -34, -48, -70);
    g.stroke();

    const waterFill = new cc.Node('bottleWaterFill');
    waterFill.width = 140;
    waterFill.height = 150;
    waterFill.zIndex = 2;
    bottle.addChild(waterFill);
    drawBottleWaterFill(waterFill, ratio);

    const neck = new cc.Node('bottleNeck');
    neck.width = 72;
    neck.height = 35;
    neck.setPosition(0, 81);
    node.addChild(neck);
    const neckG = neck.addComponent(cc.Graphics);
    neckG.fillColor = new cc.Color(219, 241, 233, 98);
    neckG.strokeColor = new cc.Color(94, 121, 111, 205);
    neckG.lineWidth = 4;
    neckG.roundRect(-34, -18, 68, 36, 9);
    neckG.fill();
    neckG.stroke();

    const cap = new cc.Node('bottleCap');
    cap.width = 82;
    cap.height = 32;
    cap.setPosition(0, 109);
    cap.zIndex = 12;
    node.addChild(cap);
    const capG = cap.addComponent(cc.Graphics);
    capG.fillColor = new cc.Color(121, 79, 52, 45);
    capG.roundRect(-40, -16, 80, 31, 9);
    capG.fill();
    capG.fillColor = new cc.Color(194, 132, 78);
    capG.strokeColor = new cc.Color(109, 72, 49);
    capG.lineWidth = 3;
    capG.roundRect(-41, -12, 82, 26, 8);
    capG.fill();
    capG.stroke();
    capG.fillColor = new cc.Color(255, 226, 166, 85);
    capG.roundRect(-31, 4, 55, 5, 2);
    capG.fill();

    return node;
}

function mixChannel(from: number, to: number, ratio: number): number {
    return Math.round(from + (to - from) * ratio);
}

function getBottleWaterColor(ratio: number): cc.Color {
    if (ratio <= 0.5) {
        const t = ratio / 0.5;
        return new cc.Color(
            mixChannel(MOOD_COLORS.coral.r, MOOD_COLORS.honey.r, t),
            mixChannel(MOOD_COLORS.coral.g, MOOD_COLORS.honey.g, t),
            mixChannel(MOOD_COLORS.coral.b, MOOD_COLORS.honey.b, t),
        );
    }
    const t = (ratio - 0.5) / 0.5;
    return new cc.Color(
        mixChannel(MOOD_COLORS.honey.r, MOOD_COLORS.sage.r, t),
        mixChannel(MOOD_COLORS.honey.g, MOOD_COLORS.sage.g, t),
        mixChannel(MOOD_COLORS.honey.b, MOOD_COLORS.sage.b, t),
    );
}

function drawBottleWaterFill(node: cc.Node, ratio: number): void {
    const safeRatio = Math.max(0, Math.min(1, ratio));
    const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
    graphics.clear();
    node.opacity = safeRatio <= 0 ? 0 : 255;
    if (safeRatio <= 0) {
        (node as any).progressRatio = 0;
        return;
    }

    const samples = [
        { y: -82, halfWidth: 51 },
        { y: -72, halfWidth: 61 },
        { y: -54, halfWidth: 66 },
        { y: 8, halfWidth: 67 },
        { y: 28, halfWidth: 59 },
        { y: 45, halfWidth: 44 },
        { y: 56, halfWidth: 28 },
    ];
    const waterY = samples[0].y + (samples[samples.length - 1].y - samples[0].y) * safeRatio;
    let upperIndex = 1;
    while (upperIndex < samples.length && samples[upperIndex].y < waterY) upperIndex++;
    const lower = samples[Math.max(0, upperIndex - 1)];
    const upper = samples[Math.min(samples.length - 1, upperIndex)];
    const segmentRatio = upper.y === lower.y ? 0 : (waterY - lower.y) / (upper.y - lower.y);
    const waterHalfWidth = lower.halfWidth + (upper.halfWidth - lower.halfWidth) * segmentRatio;

    const color = getBottleWaterColor(safeRatio);
    graphics.fillColor = new cc.Color(color.r, color.g, color.b, 192);
    graphics.moveTo(-samples[0].halfWidth, samples[0].y);
    for (const sample of samples.slice(1)) {
        if (sample.y >= waterY) break;
        graphics.lineTo(-sample.halfWidth, sample.y);
    }
    graphics.lineTo(-waterHalfWidth, waterY);
    graphics.quadraticCurveTo(0, waterY + 4, waterHalfWidth, waterY);
    for (const sample of samples.slice().reverse()) {
        if (sample.y >= waterY || sample.y <= samples[0].y) continue;
        graphics.lineTo(sample.halfWidth, sample.y);
    }
    graphics.lineTo(samples[0].halfWidth, samples[0].y);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = new cc.Color(255, 255, 255, 152);
    graphics.lineWidth = 2.2;
    graphics.moveTo(-waterHalfWidth + 3, waterY + 1);
    graphics.quadraticCurveTo(0, waterY + 5, waterHalfWidth - 3, waterY + 1);
    graphics.stroke();
    (node as any).progressRatio = safeRatio;
}

/** 将飞入瓶子的表情换算为进度增长，不在瓶内堆叠圆形代币。 */
export function updateWishBottleProgress(bottle: cc.Node, progress: number, target: number): void {
    if (!bottle || !cc.isValid(bottle)) return;
    const body = bottle.getChildByName('bottleBody');
    const fill = body && body.getChildByName('bottleWaterFill');
    if (!fill) return;
    const ratio = Math.max(0, Math.min(1, progress / Math.max(1, target)));
    const state = { ratio: Number((fill as any).progressRatio) || 0 };
    const previousState = (fill as any).waterTweenState;
    if (previousState) cc.Tween.stopAllByTarget(previousState);
    (fill as any).waterTweenState = state;
    cc.tween(state)
        .to(0.26, { ratio }, {
            easing: 'sineOut',
            onUpdate: () => drawBottleWaterFill(fill, state.ratio),
        })
        .start();
}

/** 奖励回流动画开始前同步设置水位，避免先展示结算后的最终值再跳回旧值。 */
export function setWishBottleProgressImmediately(bottle: cc.Node, progress: number, target: number): void {
    if (!bottle || !cc.isValid(bottle)) return;
    const body = bottle.getChildByName('bottleBody');
    const fill = body && body.getChildByName('bottleWaterFill');
    if (!fill) return;
    const previousState = (fill as any).waterTweenState;
    if (previousState) cc.Tween.stopAllByTarget(previousState);
    drawBottleWaterFill(fill, Math.max(0, Math.min(1, progress / Math.max(1, target))));
}

/** 同时支持顶部小瓶与结算大瓶的瓶盖反馈。 */
export function playBottleBurp(bottle: cc.Node): void {
    if (!bottle || !cc.isValid(bottle)) return;
    const cap = bottle.getChildByName('bottleCap');
    if (!cap) return;
    const baseY = 109;
    cc.Tween.stopAllByTarget(cap);
    cap.y = baseY;
    cap.rotation = 0;
    cc.tween(cap)
        .to(0.07, { y: baseY + 18, rotation: 8, scale: 1.06 }, { easing: 'backOut' })
        .to(0.1, { y: baseY - 3, rotation: -3, scale: 0.98 }, { easing: 'quadIn' })
        .to(0.08, { y: baseY, rotation: 0, scale: 1 }, { easing: 'backOut' })
        .start();
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
    cc.resources.load('images/formal/home_studio_bg_v3', cc.SpriteFrame, (error: Error, frame: cc.SpriteFrame) => {
        if (error || !frame || !cc.isValid(illustration)) {
            cc.warn('Home studio background failed to load', error);
            return;
        }
        sprite.spriteFrame = frame;
        illustration.width = width;
        illustration.height = height;
        cc.tween(illustration).to(0.2, { opacity: 255 }, { easing: 'sineOut' }).start();
    });
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
    cc.resources.load('images/formal/game_room_bg_v3', cc.SpriteFrame, (error: Error, frame: cc.SpriteFrame) => {
        if (error || !frame || !cc.isValid(illustration)) {
            cc.warn('Game room background failed to load', error);
            return;
        }
        sprite.spriteFrame = frame;
        illustration.width = width;
        illustration.height = height;
        cc.tween(illustration).to(0.2, { opacity: 255 }, { easing: 'sineOut' }).start();
    });

    return root;
}

export function createMoodWatermarkWall(parent: cc.Node, width: number, height: number): cc.Node {
    const root = new cc.Node('moodWatermarkWall');
    root.width = width;
    root.height = height;
    root.zIndex = -20;
    parent.addChild(root);

    const layer = new cc.Node('watermarkLayer');
    layer.width = width + 480;
    layer.height = height + 480;
    layer.rotation = -21;
    layer.setPosition(-42, 42);
    root.addChild(layer);

    const spacing = 202;
    const columns = Math.ceil(layer.width / spacing) + 2;
    const rows = Math.ceil(layer.height / spacing) + 2;
    const positiveMoods = [1, 2, 3, 4, 5, 6, 1, 2];
    const gentleNegativeMoods = [7, 8, 9, 10];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const diagonalSeed = row + col;
            const sizeVariation = ((diagonalSeed * 37 + 11) % 21) / 100;
            const size = 74 * (0.9 + sizeVariation);
            const x = -layer.width / 2 + 70 + col * spacing;
            const y = layer.height / 2 - 70 - row * spacing;
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
            bg.fillColor = new cc.Color(moodColor.r, moodColor.g, moodColor.b, 48);
            bg.strokeColor = new cc.Color(
                Math.round(moodColor.r * 0.66),
                Math.round(moodColor.g * 0.66),
                Math.round(moodColor.b * 0.66),
                24,
            );
            bg.lineWidth = 1.6;
            bg.roundRect(-size / 2, -size / 2, size, size, size * 0.25);
            bg.fill();
            bg.stroke();
            drawMoodFace(tile, moodIndex, size * 0.46, new cc.Color(88, 61, 55, 38));
        }
    }

    cc.tween(layer)
        .repeatForever(
            cc.tween()
                .to(8, { x: 42, y: -42 }, { easing: 'sineInOut' })
                .to(8, { x: -42, y: 42 }, { easing: 'sineInOut' }),
        )
        .start();
    return root;
}
