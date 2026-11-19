import { ASSET_PATHS, getSpriteFrame } from '../manager/AssetLoader';
import { BUTTON_TEXT_COLOR, uimanager } from '../manager/UIManager';

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

/** 按字形的实际宽度居中排列，文字在左、图标在右，间距固定。 */
function layoutActionButton(button: cc.Node, glyphWidth: number, fontSize?: number, leading: boolean = false): { x: number; scale: number } {
    const node = button.getChildByName('label');
    const label = node.getComponent(cc.Label);
    if (fontSize) {
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
    }
    label.overflow = cc.Label.Overflow.NONE;
    label.enableWrapText = false;
    uimanager.applyTypography(label);
    (label as any)._forceUpdateRenderData();
    const iconScale = Math.min(1, label.fontSize / 32);
    const iconWidth = glyphWidth * iconScale;
    const gap = 8;
    const width = iconWidth + gap + node.width;
    const fit = Math.min(1, (button.width - 32) / width);
    node.scale = fit;
    node.setPosition((leading ? 1 : -1) * (iconWidth + gap) / 2 * fit, 2);
    return { x: (leading ? -1 : 1) * (node.width + gap) / 2 * fit, scale: iconScale * fit };
}

export function decorateActionButton(button: cc.Node, icon: 'video' | 'share' | 'back' | 'restart' | 'reviveCard', fontSize?: number): void {
    const layout = layoutActionButton(button, icon === 'video' || icon === 'share' || icon === 'reviveCard' ? 64 : 44, fontSize, icon === 'video' || icon === 'reviveCard');
    if (icon === 'reviveCard') {
        const art = new cc.Node('reviveCardGlyph'); button.addChild(art); art.zIndex = 60;
        art.setPosition(layout.x, 2);
        const sprite = art.addComponent(cc.Sprite); sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = getSpriteFrame('effects', ASSET_PATHS.effects.reviveCard);
        uimanager.fitSpriteFrameInside(art, sprite.spriteFrame, 64 * layout.scale, 48 * layout.scale);
    } else if (icon === 'video') createVideoGlyph(button, layout.x, 2, layout.scale);
    else if (icon === 'share') createShareGlyph(button, layout.x, 2, layout.scale);
    else if (icon === 'back') createBackGlyph(button, layout.x, 2, layout.scale);
    else createRestartGlyph(button, layout.x, 2, layout.scale);
}

/** 设置、暂停和结算共用同一套平面线稿图标与图文顺序。 */
export function decorateSettingsActionButton(button: cc.Node, icon: 'play' | 'restart' | 'exit' | 'done'): void {
    if (icon === 'restart') {
        decorateActionButton(button, 'restart');
        return;
    }
    const layout = layoutActionButton(button, 44);
    createNavigationGlyph(button, icon, layout.x, 2, layout.scale);
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

/** 导航动作统一使用暖棕细线与圆滑曲线，不附加小底板。 */
function createNavigationGlyph(parent: cc.Node, icon: 'back' | 'restart' | 'play' | 'exit' | 'done', x: number, y: number, scale: number): cc.Node {
    const node = new cc.Node(`${icon}Glyph`);
    node.setPosition(x, y); node.scale = scale; node.zIndex = 60; parent.addChild(node);
    const g = node.addComponent(cc.Graphics);
    g.lineCap = cc.Graphics.LineCap.ROUND; g.lineJoin = cc.Graphics.LineJoin.ROUND;
    g.strokeColor = BUTTON_TEXT_COLOR; g.fillColor = new cc.Color(255, 247, 222); g.lineWidth = 2.8;
    if (icon === 'restart') {
        g.moveTo(10, 10);
        g.bezierCurveTo(4, 16, -5, 16, -10, 10);
        g.bezierCurveTo(-16, 4, -16, -4, -10, -10);
        g.bezierCurveTo(-4, -16, 5, -16, 10, -10);
        g.bezierCurveTo(13, -7, 14, -3, 14, 2);
        g.stroke();
        g.moveTo(8, -3); g.lineTo(14, 3); g.lineTo(20, -3); g.stroke();
    } else if (icon === 'play') {
        g.moveTo(-8, -13); g.lineTo(12, -2); g.quadraticCurveTo(15, 0, 12, 2);
        g.lineTo(-8, 13); g.quadraticCurveTo(-12, 15, -12, 11);
        g.lineTo(-12, -11); g.quadraticCurveTo(-12, -15, -8, -13);
        g.close(); g.fill(); g.stroke();
    } else if (icon === 'exit') {
        g.moveTo(2, 14); g.lineTo(-11, 14); g.quadraticCurveTo(-15, 14, -15, 10);
        g.lineTo(-15, -10); g.quadraticCurveTo(-15, -14, -11, -14); g.lineTo(2, -14); g.stroke();
        g.moveTo(-4, 0); g.lineTo(17, 0); g.moveTo(10, 7); g.lineTo(17, 0); g.lineTo(10, -7); g.stroke();
    } else if (icon === 'back') {
        g.moveTo(14, 0); g.lineTo(-14, 0); g.moveTo(-5, 9); g.lineTo(-14, 0); g.lineTo(-5, -9); g.stroke();
    } else {
        g.moveTo(-13, 0); g.lineTo(-4, -9); g.lineTo(14, 11); g.stroke();
    }
    return node;
}

export function createBackGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
    return createNavigationGlyph(parent, 'back', x, y, scale);
}

export function createRestartGlyph(parent: cc.Node, x: number, y: number, scale: number = 1): cc.Node {
    return createNavigationGlyph(parent, 'restart', x, y, scale);
}
