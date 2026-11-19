/** 手绘爱心粒子：只绘制一次轮廓，再用节点变换扩散，不逐帧重建图形。 */
export function drawHeart(g: cc.Graphics, size: number, fill: boolean = true): void {
    const s = size / 32;
    g.moveTo(0, -13 * s);
    g.bezierCurveTo(-23 * s, 0, -15 * s, 20 * s, 0, 9 * s);
    g.bezierCurveTo(15 * s, 20 * s, 23 * s, 0, 0, -13 * s);
    g.close();
    if (fill) g.fill();
    g.stroke();
}

export function createHeartToken(parent: cc.Node, size: number = 32): cc.Node {
    const node = new cc.Node('heartToken');
    parent.addChild(node);
    node.setContentSize(size, size);
    const g = node.addComponent(cc.Graphics);
    g.fillColor = new cc.Color(249, 166, 166);
    g.strokeColor = new cc.Color(204, 99, 112);
    g.lineWidth = 1.5;
    drawHeart(g, size);
    return node;
}

export function playHeartWave(parent: cc.Node, center: cc.Vec2, cell: number): void {
    const root = new cc.Node('heartWave');
    root.zIndex = 145; root.setPosition(center); parent.addChild(root);
    for (let ring = 0; ring < 2; ring++) {
        const outline = new cc.Node('heartRipple'); root.addChild(outline);
        const g = outline.addComponent(cc.Graphics);
        g.strokeColor = new cc.Color(244, 132, 151, 210); g.lineWidth = 2.5;
        drawHeart(g, 38, false); outline.scale = 0.5; outline.opacity = 0;
        cc.tween(outline).delay(ring * 0.16).to(0.08, { opacity: 230 })
            .to(0.75, { scale: cell * 2.8 / 38, opacity: 0 }, { easing: 'sineOut' }).start();
    }
    for (let i = 0; i < 8; i++) {
        const heart = createHeartToken(root, i % 2 ? 12 : 17);
        const angle = i * Math.PI / 4;
        const distance = cell * (i % 2 ? 1.15 : 1.5);
        heart.scale = 0.4;
        cc.tween(heart).to(0.7, { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance,
            scale: 1, opacity: 0, angle: i % 2 ? 12 : -12 }, { easing: 'sineOut' }).start();
    }
    cc.tween(root).delay(1).call(() => { if (cc.isValid(root)) root.destroy(); }).start();
}
