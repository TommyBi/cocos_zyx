/** 局内信息卡、下一排、道具栏共用的纯净奶油背板：固定圆角与描边，不随宽高拉伸。 */
export const GAME_PANEL_RADIUS = 24;
export const GAME_PANEL_FILL = [255, 247, 225];
let panelFrame: cc.SpriteFrame = null;

function getPanelFrame(): cc.SpriteFrame {
    if (panelFrame) return panelFrame;
    const size = 96;
    const half = 42;
    const radius = GAME_PANEL_RADIUS;
    const data = new Uint8Array(size * size * 4);
    const distance = (x: number, y: number) => {
        const qx = Math.abs(x) - (half - radius);
        const qy = Math.abs(y) - (half - radius);
        return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
    };
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const px = x + 0.5 - size / 2;
            const py = y + 0.5 - size / 2;
            const d = distance(px, py);
            const body = Math.max(0, Math.min(1, 0.5 - d));
            const shadow = Math.max(0, Math.min(1, 1.5 - distance(px, py - 4))) * 0.2;
            const alpha = body + shadow * (1 - body);
            const color = d > -2.4 ? [159, 117, 80]
                : d > -3.6 ? [255, 255, 247] : GAME_PANEL_FILL;
            const index = (y * size + x) * 4;
            for (let channel = 0; channel < 3; channel++) {
                data[index + channel] = alpha > 0
                    ? Math.round((color[channel] * body + [101, 70, 46][channel] * shadow * (1 - body)) / alpha) : 0;
            }
            data[index + 3] = Math.round(alpha * 255);
        }
    }
    const texture = new cc.Texture2D();
    texture.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, size, size);
    panelFrame = new cc.SpriteFrame(texture);
    panelFrame.insetTop = panelFrame.insetBottom = panelFrame.insetLeft = panelFrame.insetRight = 30;
    return panelFrame;
}

export function resizeGamePanel(node: cc.Node, width: number, height: number): void {
    node.setContentSize(width, height);
    const skin = node.getChildByName('gamePanelSkin');
    if (skin) skin.setContentSize(width + 12, height + 12);
}

export function createGamePanel(parent: cc.Node, name: string, width: number, height: number,
    x: number = 0, y: number = 0): cc.Node {
    const root = new cc.Node(name);
    parent.addChild(root);
    root.setPosition(x, y);
    const skin = new cc.Node('gamePanelSkin');
    skin.zIndex = -1;
    root.addChild(skin);
    const sprite = skin.addComponent(cc.Sprite);
    sprite.spriteFrame = getPanelFrame();
    sprite.type = cc.Sprite.Type.SLICED;
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    resizeGamePanel(root, width, height);
    return root;
}
