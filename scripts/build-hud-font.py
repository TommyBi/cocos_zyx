"""生成局内 HUD 专用 BMFont；只分发栅格字形，不复制系统字体文件。"""
import json
import math
from pathlib import Path
from uuid import uuid5, NAMESPACE_URL
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/bundles/game/images/formal'
LATIN = '/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf'
CHINESE = '/System/Library/Fonts/STHeiti Medium.ttc'
SIZE, CELL, COLS = 96, 128, 8
CHARS = ''.join(dict.fromkeys('0123456789.%+ 本局得分最高当前进度集满再颗开心豆新纪录万亿收'))

def uid(name):
    return str(uuid5(NAMESPACE_URL, 'cocos-zyx/hud-v1/' + name))

latin = ImageFont.truetype(LATIN, SIZE)
chinese = ImageFont.truetype(CHINESE, SIZE, index=1)
height = math.ceil(len(CHARS) / COLS) * CELL
atlas = Image.new('RGBA', (COLS * CELL, height))
draw = ImageDraw.Draw(atlas)
entries = []
for index, char in enumerate(CHARS):
    font = latin if ord(char) < 128 else chinese
    stroke = 0 if ord(char) < 128 else 1
    x, y = (index % COLS) * CELL, (index // COLS) * CELL
    # 同一字体共享基线，保证小数点落在底部，不随各字形边界上下跳动。
    box = draw.textbbox((0, 0), char, font=font, stroke_width=stroke)
    width = box[2] - box[0]
    baseline_offset = -9 if ord(char) < 128 else -2
    draw.text((x + 4 - box[0], y + baseline_offset), char,
              font=font, fill='white', stroke_width=stroke, stroke_fill='white')
    advance = max(4, math.ceil(font.getlength(char)))
    entries.append(f'char id={ord(char)} x={x} y={y} width={min(CELL, width + 8)} height={SIZE} xoffset=-4 yoffset=0 xadvance={advance} page=0 chnl=15')

atlas_path = OUT / 'hud_glyphs_v1.png'
atlas.save(atlas_path, optimize=True)
fnt = OUT / 'hud_round_v1.fnt'
fnt.write_text('\n'.join([
    'info face="ZyxHudRounded" size=96 bold=1 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=0,0',
    f'common lineHeight={SIZE} base={SIZE} scaleW={atlas.width} scaleH={atlas.height} pages=1 packed=0',
    'page id=0 file="hud_glyphs_v1.png"', f'chars count={len(entries)}', *entries,
]) + '\n')

texture_uuid, frame_uuid = uid(atlas_path.name), uid(atlas_path.stem + '/frame')
meta = {'ver': '2.3.7', 'uuid': texture_uuid, 'importer': 'texture', 'type': 'sprite',
        'wrapMode': 'clamp', 'filterMode': 'bilinear', 'premultiplyAlpha': False,
        'genMipmaps': False, 'packable': False, 'width': atlas.width, 'height': atlas.height,
        'platformSettings': {}, 'subMetas': {atlas_path.stem: {
            'ver': '1.0.6', 'uuid': frame_uuid, 'importer': 'sprite-frame',
            'rawTextureUuid': texture_uuid, 'trimType': 'custom', 'trimThreshold': 1,
            'rotated': False, 'offsetX': 0, 'offsetY': 0, 'trimX': 0, 'trimY': 0,
            'width': atlas.width, 'height': atlas.height, 'rawWidth': atlas.width, 'rawHeight': atlas.height,
            'borderTop': 0, 'borderBottom': 0, 'borderLeft': 0, 'borderRight': 0, 'subMetas': {}}}}
Path(str(atlas_path) + '.meta').write_text(json.dumps(meta, indent=2) + '\n')
Path(str(fnt) + '.meta').write_text(json.dumps({'ver': '2.1.2', 'uuid': uid(fnt.name),
    'importer': 'bitmap-font', 'fontSize': SIZE, 'textureUuid': texture_uuid, 'subMetas': {}}, indent=2) + '\n')
print(f'Generated {len(CHARS)} HUD glyphs, {atlas.width}x{atlas.height}')
