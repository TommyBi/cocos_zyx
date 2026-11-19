import { ASSET_PATHS, getSpriteFrame, isFeatureReady } from '../manager/AssetLoader';
import { uimanager } from '../manager/UIManager';

const glyphFrames: { [char: string]: cc.SpriteFrame } = {};
const GLYPHS = '0123456789+×';

/** 逐字拼接绿色图片字，浮动得分与倍率不依赖系统字体。 */
export function createScoreArt(parent: cc.Node, text: string, height: number): cc.Node {
    const node = new cc.Node('scoreArt');
    parent.addChild(node);
    if (!isFeatureReady('effects')) return fallbackLabel(node, text, height, new cc.Color(83, 137, 63));
    const advance = height * 0.76;
    node.setContentSize(text.length * advance, height);
    for (let index = 0; index < text.length; index++) {
        const char = text[index];
        const glyphIndex = GLYPHS.indexOf(char);
        if (glyphIndex < 0) continue;
        if (!glyphFrames[char]) {
            const texture = getSpriteFrame('effects', ASSET_PATHS.effects.scoreDigits).getTexture();
            glyphFrames[char] = new cc.SpriteFrame(texture, new cc.Rect(
                (glyphIndex % 6) * 128, Math.floor(glyphIndex / 6) * 144, 128, 144,
            ));
        }
        const glyph = new cc.Node(`scoreGlyph_${char}`);
        node.addChild(glyph);
        glyph.setPosition((index - (text.length - 1) / 2) * advance, 0);
        const sprite = glyph.addComponent(cc.Sprite);
        sprite.spriteFrame = glyphFrames[char];
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        glyph.setContentSize(height * 128 / 144, height);
    }
    return node;
}

export function createComboArt(parent: cc.Node, combo: number): cc.Node {
    const paths = [ASSET_PATHS.effects.comboWow, ASSET_PATHS.effects.comboGood, ASSET_PATHS.effects.comboGreat, ASSET_PATHS.effects.comboPerfect];
    const node = new cc.Node('comboArt');
    parent.addChild(node);
    if (!isFeatureReady('effects')) return fallbackLabel(node, ['Wow!', 'Good!', 'Great!', 'Perfect!'][Math.max(0, Math.min(3, combo - 2))], 54, new cc.Color(237, 160, 61));
    const sprite = node.addComponent(cc.Sprite);
    sprite.spriteFrame = getSpriteFrame('effects', paths[Math.max(0, Math.min(3, combo - 2))]);
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    const rect = sprite.spriteFrame.getRect();
    const width = combo >= 5 ? 286 : 238;
    node.setContentSize(width, width * rect.height / rect.width);
    return node;
}

/** 暖色描边的小炸弹，直接附在现有普通格子上，与程序绘制的块材质一致。 */
export function createBombBadge(parent: cc.Node): cc.Node {
    const node = new cc.Node('bombBadge');
    parent.addChild(node);
    // 球身下沉 2 像素、引线向上伸出，整体轮廓在色块中央。
    node.setPosition(0, -5);
    node.setContentSize(40, 44);
    node.zIndex = 6;
    const g = node.addComponent(cc.Graphics);
    g.lineWidth = 2.2;
    g.lineCap = cc.Graphics.LineCap.ROUND;
    g.strokeColor = new cc.Color(103, 75, 62);
    g.fillColor = new cc.Color(255, 243, 201, 238);
    g.circle(0, -2, 18); g.fill();
    g.fillColor = new cc.Color(99, 112, 132);
    g.circle(0, -2, 14); g.fill(); g.stroke();
    g.fillColor = new cc.Color(126, 143, 157);
    g.ellipse(-3, 1, 9, 10); g.fill();
    g.fillColor = new cc.Color(255, 253, 228, 205);
    g.ellipse(-5, 5, 4, 2.5); g.fill();
    g.fillColor = new cc.Color(211, 168, 95);
    g.roundRect(-4, 10, 8, 5, 2); g.fill(); g.stroke();
    g.moveTo(1, 15); g.quadraticCurveTo(2, 23, 9, 20); g.stroke();
    g.strokeColor = new cc.Color(244, 175, 68);
    g.moveTo(9, 17); g.lineTo(12, 24);
    g.moveTo(7, 22); g.lineTo(14, 19);
    g.moveTo(11, 17); g.lineTo(8, 25); g.stroke();
    return node;
}

/** 分包慢或失败时直接展示文字，反馈不阻塞棋盘，后续成功后自动恢复原美术。 */
function fallbackLabel(node: cc.Node, text: string, height: number, color: cc.Color): cc.Node {
    const label = node.addComponent(cc.Label);
    label.string = text;
    label.fontSize = height * 0.78;
    label.lineHeight = height;
    uimanager.applyTypography(label);
    node.color = color;
    const outline = node.addComponent(cc.LabelOutline);
    outline.color = new cc.Color(255, 247, 217);
    outline.width = 3;
    return node;
}
