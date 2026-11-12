"""将三张营销海报等比适配为微信分享图；输出在 assets 外，仅发布到 CDN。"""
from io import BytesIO
from pathlib import Path
import hashlib
import json

from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'output/marketing/2026-11-05'
OUTPUT = ROOT / 'share-assets/20261112'
CDN = 'https://cdn.tcjstory.cn/cocos-zyx/share/20261112/'
CARDS = [
    ('burst', '01-爆消爽感.png', '这一拖，爽翻了！'),
    ('comeback', '02-绝境翻盘.png', '快满了？一拖翻盘！'),
    ('rank', '03-冲榜逆袭.png', '边消边冲榜，下一名被我超了！'),
]
SIZE = (500, 400)
MAX_BYTES = 96 * 1024  # 本项目的加载体积目标，不是微信接口的上限。


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    cards = []
    for card_id, filename, title in CARDS:
        source = SOURCE / filename
        image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
        background = ImageOps.fit(image, SIZE, method=Image.Resampling.LANCZOS)
        background = background.filter(ImageFilter.GaussianBlur(18))
        poster = ImageOps.contain(image, SIZE, method=Image.Resampling.LANCZOS)
        background.paste(poster, ((SIZE[0] - poster.width) // 2, 0))
        for quality in (88, 84, 80, 76):
            buffer = BytesIO()
            background.save(buffer, 'JPEG', quality=quality, optimize=True, progressive=True, subsampling=0)
            data = buffer.getvalue()
            if len(data) <= MAX_BYTES:
                break
        if len(data) > MAX_BYTES:
            raise RuntimeError(f'{filename} 压缩后仍超出目标体积')
        digest = hashlib.sha256(data).hexdigest()
        name = f'{card_id}.{digest[:12]}.jpg'
        (OUTPUT / name).write_bytes(data)
        cards.append({
            'id': card_id, 'title': title, 'file': name, 'imageUrl': CDN + name,
            'width': SIZE[0], 'height': SIZE[1], 'bytes': len(data), 'sha256': digest,
            'source': str(source.relative_to(ROOT)),
            'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'sourceBytes': source.stat().st_size,
        })
    (OUTPUT / 'manifest.json').write_text(json.dumps(cards, ensure_ascii=False, indent=2) + '\n')
    config = '/** 由 scripts/prepare-share-images.py 生成；图片仅在 CDN，不进入 Cocos 资源包。 */\n'
    config += 'export const SHARE_CARDS: ReadonlyArray<{ title: string; imageUrl: string }> = '
    config += json.dumps([{'title': c['title'], 'imageUrl': c['imageUrl']} for c in cards], ensure_ascii=False, indent=4) + ';\n'
    (ROOT / 'assets/script/manager/ShareConfig.ts').write_text(config)
    for card in cards:
        print(f"{card['file']}: {card['width']}x{card['height']}, {card['bytes']:,} bytes")


if __name__ == '__main__':
    main()
