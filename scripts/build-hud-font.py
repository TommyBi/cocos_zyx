"""生成局内 HUD 专用 BMFont，使用与全局 UI 相同的 OFL 字体来源。"""
import json
import math
from pathlib import Path
from uuid import uuid5, NAMESPACE_URL
from io import BytesIO
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/bundles/game/images/formal'
SOURCE = ROOT / 'docs/art-sources/fonts/leaderboard-v1'
SIZE, CELL, COLS = 96, 128, 8
CHARS = ''.join(dict.fromkeys('0123456789.%+ 本局得分最高当前进度集满再颗开心豆新纪录万亿收'))

def uid(name):
    return str(uuid5(NAMESPACE_URL, 'cocos-zyx/hud-v1/' + name))

latin_data = BytesIO()
instantiateVariableFont(TTFont(SOURCE / 'Nunito-wght.ttf'), {'wght': 400}).save(latin_data)
latin_data.seek(0)
latin = ImageFont.truetype(latin_data, SIZE)
chinese = ImageFont.truetype(str(SOURCE / 'ChillRoundF-v3.0.ttf'), SIZE)
height = math.ceil(len(CHARS) / COLS) * CELL
atlas = Image.new('RGBA', (COLS * CELL, height))
draw = ImageDraw.Draw(atlas)
entries = []
for index, char in enumerate(CHARS):
    font = latin if ord(char) < 128 else chinese
    stroke = 0
    x, y = (index % COLS) * CELL, (index // COLS) * CELL
    # 同一字体共享基线，保证小数点落在底部，不随各字形边界上下跳动。
    box = font.getbbox(char, anchor='ls', stroke_width=stroke)
    width = box[2] - box[0]
    draw.text((x + 4 - box[0], y + 4 - box[1]), char, anchor='ls',
              font=font, fill='white', stroke_width=stroke, stroke_fill='white')
    advance = max(4, math.ceil(font.getlength(char)))
    entries.append(f'char id={ord(char)} x={x + 4} y={y + 4} width={max(1, width)} height={max(1, box[3] - box[1])} xoffset={box[0]} yoffset={92 + box[1]} xadvance={advance} page=0 chnl=15')

atlas_path = OUT / 'hud_glyphs_v1.png'
atlas.save(atlas_path, optimize=True)
fnt = OUT / 'hud_round_v1.fnt'
fnt.write_text('\n'.join([
    'info face="ZyxHudRounded" size=96 bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=0,0',
    f'common lineHeight=120 base=92 scaleW={atlas.width} scaleH={atlas.height} pages=1 packed=0',
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
