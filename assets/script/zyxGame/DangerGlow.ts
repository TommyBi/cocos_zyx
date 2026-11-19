let frame: cc.SpriteFrame = null;

/** 对圆角边界求有符号距离，生成连续的内外红色辉光，不使用叠加方框。 */
export function createDangerGlow(parent: cc.Node, width: number, height: number): cc.Node {
    const fullWidth = width + 136, fullHeight = height + 136;
    if (!frame) {
        const w = 384, h = Math.round(w * fullHeight / fullWidth);
        const rgba = new Uint8Array(w * h * 4);
        const radius = 24;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const px = Math.abs((x + 0.5) / w * fullWidth - fullWidth / 2);
            const py = Math.abs((y + 0.5) / h * fullHeight - fullHeight / 2);
            const qx = px - (width / 2 + 6 - radius), qy = py - (height / 2 + 6 - radius);
            const distance = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
            const d = Math.abs(distance);
            const core = Math.exp(-d * d / 14);
            const bloom = Math.exp(-d / (distance < 0 ? 19 : 25));
            const index = (y * w + x) * 4;
            rgba[index] = 255; rgba[index + 1] = Math.round(28 + core * 105);
            rgba[index + 2] = Math.round(42 + core * 70);
            rgba[index + 3] = Math.round(Math.min(1, core * 0.8 + bloom * 0.65) * 255);
        }
        const texture = new cc.Texture2D();
        texture.initWithData(rgba, cc.Texture2D.PixelFormat.RGBA8888, w, h);
        frame = new cc.SpriteFrame(texture);
    }
    const node = new cc.Node('roundRescueBoardHalo'); parent.addChild(node);
    node.setContentSize(fullWidth, fullHeight); node.zIndex = 105;
    const sprite = node.addComponent(cc.Sprite);
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM; sprite.spriteFrame = frame;
    cc.tween(node).repeatForever(cc.tween().to(0.55, { opacity: 165 }, { easing: 'sineInOut' })
        .to(0.55, { opacity: 255 }, { easing: 'sineInOut' })).start();
    return node;
}
