import { ASSET_PATHS, getSpriteFrame } from '../manager/AssetLoader';
import { uimanager } from '../manager/UIManager';

/**
 * 局内小图标（glyph）绘制工厂。
 *
 * 全部是用 cc.Graphics / 贴图拼出来的纯绘制函数，不依赖 ZyxGame 的实例状态；
 * 从 ZyxGame 抽出以便局内 UI 与图标绘制各自演进。
 */

export function createHammerGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
    const node = new cc.Node('hammerGlyph');
    node.width = 82;
    node.height = 82;
    node.setAnchorPoint(0.5, 0.5);
    node.setPosition(x, y);
    node.scale = scale;
    node.angle = 0;
    node.zIndex = 55;
    parent.addChild(node);

    const shadow = new cc.Node('hammerShadow');
    shadow.zIndex = 0;
    shadow.setPosition(0, -31);
    node.addChild(shadow);
    const shadowG = shadow.addComponent(cc.Graphics);
    shadowG.fillColor = new cc.Color(73, 48, 43, 42);
    shadowG.ellipse(0, 0, 25, 6);
    shadowG.fill();

    const art = new cc.Node('hammerArt');
    art.width = 66;
    art.height = 84;
    art.setPosition(0, 3);
    art.zIndex = 2;
    node.addChild(art);
    const sprite = art.addComponent(cc.Sprite);
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    const frame = getSpriteFrame('game', ASSET_PATHS.game.hammer);
    sprite.spriteFrame = frame;
    uimanager.fitSpriteFrameInside(art, frame, 66, 84);
    // 锤子与魔法棒统一为“手柄朝左下、作用端朝右上”的视觉方向。
    art.scaleX = -Math.abs(art.scaleX || 1);
    return node;
}

export function createPurifierGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
    const node = new cc.Node('magicWandGlyph');
    node.width = 82;
    node.height = 82;
    node.setAnchorPoint(0.5, 0.5);
    node.setPosition(x, y);
    node.scale = scale;
    node.zIndex = 55;
    parent.addChild(node);

    const shadow = new cc.Node('magicWandShadow');
    shadow.zIndex = 0;
    shadow.setPosition(0, -31);
    node.addChild(shadow);
    const shadowGraphics = shadow.addComponent(cc.Graphics);
    shadowGraphics.fillColor = new cc.Color(73, 48, 43, 42);
    shadowGraphics.ellipse(0, 0, 24, 6);
    shadowGraphics.fill();

    const art = new cc.Node('magicWandArt');
    art.width = 68;
    art.height = 86;
    art.setPosition(0, 3);
    art.zIndex = 2;
    node.addChild(art);
    const sprite = art.addComponent(cc.Sprite);
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    const frame = getSpriteFrame('game', ASSET_PATHS.game.magicWand);
    sprite.spriteFrame = frame;
    uimanager.fitSpriteFrameInside(art, frame, 68, 86);
    return node;
}

export function createPauseGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
    const node = new cc.Node('pauseGlyph');
    node.setPosition(x, y);
    node.scale = scale;
    node.zIndex = 60;
    parent.addChild(node);
    const graphics = node.addComponent(cc.Graphics);
    graphics.fillColor = new cc.Color(112, 61, 55, 92);
    graphics.roundRect(-17, -20, 13, 42, 6);
    graphics.roundRect(5, -20, 13, 42, 6);
    graphics.fill();
    graphics.fillColor = new cc.Color(255, 239, 193);
    graphics.strokeColor = new cc.Color(132, 73, 62);
    graphics.lineWidth = 2;
    graphics.roundRect(-18, -17, 12, 38, 6);
    graphics.roundRect(6, -17, 12, 38, 6);
    graphics.fill();
    graphics.stroke();
    return node;
}

export function decorateActionButton(button: cc.Node, icon: 'video' | 'share' | 'back' | 'restart'): void {
    const label = button.getChildByName('label');
    const iconX = -Math.min(92, button.width * 0.34);
    if (label) {
        label.x = button.width <= 260 ? 22 : 30;
        label.width = Math.max(96, button.width - 110);
    }
    const glyphScale = button.width <= 260 ? 0.7 : 0.78;
    if (icon === 'video') createVideoGlyph(button, iconX, 2, glyphScale);
    else if (icon === 'share') createShareGlyph(button, iconX, 2, glyphScale);
    else if (icon === 'back') createBackGlyph(button, iconX, 1, glyphScale);
    else createRestartGlyph(button, iconX, 1, glyphScale);
}

/** 保留：激励视频恢复后，decorateActionButton('video') 仍可直接使用。 */
export function createVideoGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
    const node = new cc.Node('videoGlyph');
    node.setPosition(x, y);
    node.scale = scale;
    node.zIndex = 60;
    parent.addChild(node);
    const graphics = node.addComponent(cc.Graphics);
    graphics.fillColor = new cc.Color(85, 56, 49, 54);
    graphics.roundRect(-31, -23, 62, 49, 15);
    graphics.fill();
    graphics.fillColor = new cc.Color(255, 247, 220);
    graphics.strokeColor = new cc.Color(119, 78, 66);
    graphics.lineWidth = 2.4;
    graphics.roundRect(-32, -20, 64, 48, 15);
    graphics.fill();
    graphics.stroke();
    graphics.fillColor = new cc.Color(248, 194, 72);
    graphics.roundRect(-24, -13, 38, 32, 10);
    graphics.fill();
    graphics.fillColor = new cc.Color(255, 250, 224);
    graphics.moveTo(-10, -6);
    graphics.lineTo(7, 3);
    graphics.lineTo(-10, 12);
    graphics.close();
    graphics.fill();
    graphics.fillColor = new cc.Color(226, 104, 95);
    graphics.circle(23, 10, 4);
    graphics.fill();
    graphics.fillColor = new cc.Color(105, 181, 129);
    graphics.circle(23, -4, 4);
    graphics.fill();
    return node;
}

/** 分享获取入口图标：暖色纸飞机，替代当前视频图标展示。 */
export function createShareGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
    const node = new cc.Node('shareGlyph');
    node.setPosition(x, y);
    node.scale = scale;
    node.zIndex = 60;
    parent.addChild(node);
    const graphics = node.addComponent(cc.Graphics);
    graphics.fillColor = new cc.Color(85, 56, 49, 48);
    graphics.roundRect(-31, -23, 62, 49, 15);
    graphics.fill();
    graphics.fillColor = new cc.Color(255, 247, 220);
    graphics.strokeColor = new cc.Color(119, 78, 66);
    graphics.lineWidth = 2.4;
    graphics.roundRect(-32, -20, 64, 48, 15);
    graphics.fill();
    graphics.stroke();

    // 纸飞机主体
    graphics.fillColor = new cc.Color(105, 181, 129);
    graphics.moveTo(-22, -2);
    graphics.lineTo(22, 12);
    graphics.lineTo(4, -2);
    graphics.close();
    graphics.fill();
    graphics.fillColor = new cc.Color(244, 181, 60);
    graphics.moveTo(-22, -2);
    graphics.lineTo(22, 12);
    graphics.lineTo(8, -14);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = new cc.Color(90, 64, 56);
    graphics.lineWidth = 2;
    graphics.moveTo(-22, -2);
    graphics.lineTo(4, -2);
    graphics.lineTo(22, 12);
    graphics.moveTo(4, -2);
    graphics.lineTo(8, -14);
    graphics.stroke();

    // 右侧小点，暗示“发出去”
    graphics.fillColor = new cc.Color(226, 104, 95);
    graphics.circle(24, -8, 3.5);
    graphics.fill();
    graphics.fillColor = new cc.Color(248, 194, 72);
    graphics.circle(24, 4, 3.5);
    graphics.fill();
    return node;
}

/** 返回动作使用单义的左箭头，不再用容易被理解成“回首页”的房屋。 */
export function createBackGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
    const node = new cc.Node('backGlyph');
    node.setPosition(x, y);
    node.scale = scale;
    node.zIndex = 60;
    parent.addChild(node);
    const graphics = node.addComponent(cc.Graphics);
    drawActionGlyphPlate(graphics);
    graphics.strokeColor = new cc.Color(119, 78, 66);
    graphics.lineWidth = 7;
    graphics.lineCap = cc.Graphics.LineCap.ROUND;
    graphics.moveTo(14, 0);
    graphics.lineTo(-13, 0);
    graphics.moveTo(-3, 10);
    graphics.lineTo(-14, 0);
    graphics.lineTo(-3, -10);
    graphics.stroke();
    graphics.strokeColor = new cc.Color(239, 133, 104);
    graphics.lineWidth = 4;
    graphics.moveTo(14, 0);
    graphics.lineTo(-13, 0);
    graphics.moveTo(-3, 10);
    graphics.lineTo(-14, 0);
    graphics.lineTo(-3, -10);
    graphics.stroke();
    return node;
}

/** 两段首尾相接的循环箭头明确表达“重新开始”，避免弧线看成笑脸。 */
export function createRestartGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
    const node = new cc.Node('restartGlyph');
    node.setPosition(x, y);
    node.scale = scale;
    node.zIndex = 60;
    parent.addChild(node);
    const graphics = node.addComponent(cc.Graphics);
    drawActionGlyphPlate(graphics);
    graphics.strokeColor = new cc.Color(105, 181, 129);
    graphics.fillColor = new cc.Color(105, 181, 129);
    graphics.lineWidth = 4.6;
    graphics.lineCap = cc.Graphics.LineCap.ROUND;
    graphics.moveTo(-14, 4);
    graphics.bezierCurveTo(-8, 15, 8, 15, 14, 4);
    graphics.moveTo(14, -4);
    graphics.bezierCurveTo(8, -15, -8, -15, -14, -4);
    graphics.stroke();
    graphics.moveTo(14, 4);
    graphics.lineTo(5, 6);
    graphics.lineTo(11, -4);
    graphics.close();
    graphics.moveTo(-14, -4);
    graphics.lineTo(-5, -6);
    graphics.lineTo(-11, 4);
    graphics.close();
    graphics.fill();
    return node;
}

function drawActionGlyphPlate(graphics: cc.Graphics): void {
    graphics.fillColor = new cc.Color(83, 54, 47, 48);
    graphics.roundRect(-21, -20, 44, 35, 9);
    graphics.fill();
    graphics.fillColor = new cc.Color(255, 244, 214);
    graphics.strokeColor = new cc.Color(119, 78, 66);
    graphics.lineWidth = 2.5;
    graphics.roundRect(-22, -18, 44, 36, 9);
    graphics.fill();
    graphics.stroke();
}
