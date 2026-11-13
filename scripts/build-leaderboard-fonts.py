"""Build the leaderboard's portable fonts from the checked-in OFL sources.

Requires Pillow and fonttools. No system fonts are copied or rasterized.
"""
import json
import math
import re
from io import BytesIO
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/art-sources/fonts/leaderboard-v1'
OUT = ROOT / 'assets/bundles/home/fonts'
SIZE, CELL, COLS = 96, 128, 8
UI_TEXT = '排行榜积分榜开心榜排名玩家最高分我的排名第名未上榜当前拥有开心豆按历史最高分排名按当前拥有的开心豆排名开心豆消费后排名也会变化关闭暂无排行快来挑战：，、。…'
CHARS = ''.join(dict.fromkeys('0123456789,.: +-%/万亿' + UI_TEXT))


def uid(name):
    return str(uuid5(NAMESPACE_URL, 'cocos-zyx/leaderboard-font-v1/' + name))


def write_meta(file, properties):
    game_fonts = ROOT / 'assets/bundles/game/fonts'
    identity = 'game/' + file.name if file == game_fonts or game_fonts in file.parents else file.name
    Path(str(file) + '.meta').write_text(json.dumps({
        'uuid': uid(identity), **properties, 'subMetas': {},
    }, ensure_ascii=False, indent=2) + '\n')


def rename_font(font, family, style):
    # The subset is a derivative: do not retain ChillRoundF's reserved font name.
    names = {1: family, 2: style, 3: family + '-v1', 4: family,
             6: family.replace(' ', ''), 16: family, 17: style}
    for record in font['name'].names:
        if record.nameID in names:
            value = names[record.nameID]
            record.string = value.encode(record.getEncoding(), errors='replace')


def build_body():
    chars = set(chr(i) for i in range(32, 127)) | set(UI_TEXT)
    # GB2312 supports common simplified nicknames; other characters can use the
    # canvas text renderer's normal fallback instead of disappearing in BMFont.
    for first in range(0xA1, 0xF8):
        for second in range(0xA1, 0xFF):
            try:
                chars.update(bytes([first, second]).decode('gb2312'))
            except UnicodeDecodeError:
                pass
    font = TTFont(SOURCE / 'ChillRoundF-v3.0.ttf')
    options = subset.Options()
    options.hinting = False
    options.layout_features = []
    options.name_IDs = ['*']
    options.name_languages = ['*']
    worker = subset.Subsetter(options=options)
    worker.populate(text=''.join(chars))
    worker.subset(font)
    rename_font(font, 'Zyx Happy Round Body', 'Regular')
    target = OUT / 'zyx_happy_round_body_v1.ttf'
    font.save(target)
    write_meta(target, {'ver': '1.1.2', 'importer': 'ttf-font'})
    return len(font.getBestCmap())


def build_display(output=OUT, size=SIZE, cell=CELL, cols=COLS, chars=CHARS,
                  basename='zyx_happy_round_display_v1', stroke_width=0):
    latin = instantiateVariableFont(TTFont(SOURCE / 'Nunito-wght.ttf'), {'wght': 400}, inplace=False)
    latin_data = BytesIO()
    latin.save(latin_data)
    latin_data.seek(0)
    chinese = ImageFont.truetype(str(SOURCE / 'ChillRoundF-v3.0.ttf'), size)
    numbers = ImageFont.truetype(latin_data, size)
    atlas = Image.new('RGBA', (cols * cell, math.ceil(len(chars) / cols) * cell))
    if max(atlas.size) > 2048:
        raise ValueError('Font atlas exceeds 2048px; split the character set')
    draw = ImageDraw.Draw(atlas)
    entries = []
    for index, char in enumerate(chars):
        font = numbers if ord(char) < 128 else chinese
        stroke = 0 if ord(char) < 128 else stroke_width
        box = font.getbbox(char, anchor='ls', stroke_width=stroke)
        width, height = max(1, box[2] - box[0]), max(1, box[3] - box[1])
        if width + 8 > cell or height + 8 > cell:
            raise ValueError('Glyph exceeds cell: ' + char)
        x, y = index % cols * cell + 4, index // cols * cell + 4
        draw.text((x - box[0], y - box[1]), char, font=font, anchor='ls',
                  fill='white', stroke_width=stroke, stroke_fill='white')
        entries.append(f'char id={ord(char)} x={x} y={y} width={width} height={height} '
                       f'xoffset={box[0]} yoffset={round(size * 92 / 96) + box[1]} '
                       f'xadvance={round(font.getlength(char))} page=0 chnl=15')
    atlas_path = output / (basename + '.png')
    atlas.save(atlas_path, optimize=True)
    font_path = output / (basename + '.fnt')
    font_path.write_text('\n'.join([
        f'info face="ZyxHappyRoundDisplay" size={size} bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=0,0',
        f'common lineHeight={round(size * 1.25)} base={round(size * 92 / 96)} scaleW={atlas.width} scaleH={atlas.height} pages=1 packed=0',
        f'page id=0 file="{atlas_path.name}"', f'chars count={len(entries)}', *entries,
    ]) + '\n')
    texture_id = uid(atlas_path.name)
    texture_meta = {
        'ver': '2.3.7', 'uuid': texture_id, 'importer': 'texture', 'type': 'sprite',
        'wrapMode': 'clamp', 'filterMode': 'bilinear', 'premultiplyAlpha': False,
        'genMipmaps': False, 'packable': False, 'width': atlas.width, 'height': atlas.height,
        'platformSettings': {}, 'subMetas': {atlas_path.stem: {
            'ver': '1.0.6', 'uuid': uid(atlas_path.stem + '/frame'), 'importer': 'sprite-frame',
            'rawTextureUuid': texture_id, 'trimType': 'custom', 'trimThreshold': 1,
            'rotated': False, 'offsetX': 0, 'offsetY': 0, 'trimX': 0, 'trimY': 0,
            'width': atlas.width, 'height': atlas.height,
            'rawWidth': atlas.width, 'rawHeight': atlas.height,
            'borderTop': 0, 'borderBottom': 0, 'borderLeft': 0, 'borderRight': 0, 'subMetas': {},
        }},
    }
    Path(str(atlas_path) + '.meta').write_text(json.dumps(texture_meta, indent=2) + '\n')
    write_meta(font_path, {'ver': '2.1.2', 'importer': 'bitmap-font',
                           'fontSize': size, 'textureUuid': texture_id})
    return len(entries)


def build_global():
    output = ROOT / 'assets/bundles/game/fonts'
    output.mkdir(parents=True, exist_ok=True)
    write_meta(output, {'ver': '1.1.3', 'importer': 'folder'})
    chars = set(chr(i) for i in range(32, 127)) | set(CHARS)
    # Include every static UI string; full nicknames retain the home TTF.
    literals = re.compile(r'''(?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)''')
    for file in (ROOT / 'assets/script').rglob('*.ts'):
        for literal in literals.findall(file.read_text()):
            chars.update(c for c in literal if '\u4e00' <= c <= '\u9fff' or
                         '\u3000' <= c <= '\u303f' or '\uff00' <= c <= '\uffef' or c in '…·×›—')
    chars.update('美丽快乐勇敢温柔机灵幸运恬静活泼善良可爱小狐狸天鹅熊猫咪兔子企鹅鹿松鼠海豚柴犬考拉')
    font = TTFont(SOURCE / 'ChillRoundF-v3.0.ttf')
    chars &= set(map(chr, font.getBestCmap()))
    ordered = ''.join(sorted(chars))
    options = subset.Options()
    options.hinting = False
    options.layout_features = []
    options.name_IDs = ['*']
    options.name_languages = ['*']
    worker = subset.Subsetter(options=options)
    worker.populate(text=ordered)
    worker.subset(font)
    # Keep the original Chinese Regular contours and use matching Regular Latin.
    # Font weight is fixed in the resource; devices must not synthesize bold.
    latin = instantiateVariableFont(TTFont(SOURCE / 'Nunito-wght.ttf'), {'wght': 400})
    cmap, latin_cmap = font.getBestCmap(), latin.getBestCmap()
    latin_glyphs = latin.getGlyphSet()
    for code in range(32, 127):
        if code not in cmap or code not in latin_cmap:
            continue
        name, latin_name = cmap[code], latin_cmap[code]
        recording = DecomposingRecordingPen(latin_glyphs)
        latin_glyphs[latin_name].draw(recording)
        pen = TTGlyphPen(None)
        recording.replay(pen)
        font['glyf'][name] = pen.glyph()
        font['hmtx'][name] = latin['hmtx'][latin_name]
    font['OS/2'].usWeightClass = 400
    font['OS/2'].fsSelection = (font['OS/2'].fsSelection & ~(1 << 5)) | (1 << 6)
    font['head'].macStyle &= ~1
    rename_font(font, 'Zyx Happy Round UI', 'Regular')
    copyright_note = (font['name'].getDebugName(0) or '') + '\n' + (latin['name'].getDebugName(0) or '')
    for record in font['name'].names:
        if record.nameID == 0:
            record.string = copyright_note.encode(record.getEncoding(), errors='replace')
    file = output / 'zyx_happy_round_ui_v1.ttf'
    font.save(file)
    write_meta(file, {'ver': '1.1.2', 'importer': 'ttf-font'})
    # Remove only the superseded, generated global atlas. The original review
    # proof's home atlas remains intact.
    for name in ['zyx_happy_round_ui_display_v1.fnt', 'zyx_happy_round_ui_display_v1.png']:
        for file in [output / name, output / (name + '.meta')]:
            if file.exists():
                file.unlink()
    license_file = output / 'font-licenses.txt'
    license_file.write_text((SOURCE / 'OFL-ChillRound.txt').read_text() + '\n\n' +
                            (SOURCE / 'OFL-Nunito.txt').read_text())
    write_meta(license_file, {'ver': '2.0.2', 'importer': 'text'})
    print('Global UI glyphs:', len(ordered), 'vector font bytes:', (output / 'zyx_happy_round_ui_v1.ttf').stat().st_size)


OUT.mkdir(parents=True, exist_ok=True)
write_meta(OUT, {'ver': '1.1.3', 'importer': 'folder'})
body_count, display_count = build_body(), build_display()
build_global()
licenses = OUT / 'font-licenses.txt'
licenses.write_text((SOURCE / 'OFL-ChillRound.txt').read_text() + '\n\n' +
                    (SOURCE / 'OFL-Nunito.txt').read_text())
write_meta(licenses, {'ver': '2.0.2', 'importer': 'text'})
print(json.dumps({'bodyGlyphs': body_count, 'displayGlyphs': display_count,
                  'runtimeBytes': sum(p.stat().st_size for p in OUT.iterdir() if p.suffix != '.meta')}, indent=2))
