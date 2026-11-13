#!/usr/bin/env python3
"""将已审核的 ImageGen 原图缩至运行尺寸；只处理尺寸和 PNG 压缩，保留 alpha。

python3 scripts/build-leaderboard-art.py
原图及生成提示词保留在 docs/art-sources/leaderboard-v2，重建不改变已有 UUID。
"""
import json
from pathlib import Path
import uuid
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/art-sources/leaderboard-v2'
TARGET = ROOT / 'assets/bundles/home/images/leaderboard'
ASSETS = [
    ('title_v2', 'title', (840, 280)),
    ('podium_gold_v2', 'podium-gold', (384, 528)),
    ('podium_silver_v2', 'podium-silver', (384, 528)),
    ('podium_bronze_v2', 'podium-bronze', (384, 528)),
]


def write_json(path, data):
    path.write_text(json.dumps(data, indent=2) + '\n')


def main():
    TARGET.mkdir(exist_ok=True)
    folder_meta = Path(str(TARGET) + '.meta')
    if not folder_meta.exists():
        meta = json.loads((TARGET.parent.with_suffix('.meta')).read_text())
        meta['uuid'] = str(uuid.uuid4())
        write_json(folder_meta, meta)
    total = 0
    for name, source, size in ASSETS:
        image = Image.open(SOURCE / (source + '-source.png')).convert('RGBA')
        image = image.resize(size, Image.Resampling.LANCZOS)
        output = TARGET / (name + '.png')
        image.save(output, optimize=True, compress_level=9)
        meta_path = Path(str(output) + '.meta')
        if meta_path.exists():
            meta = json.loads(meta_path.read_text())
            frame = meta['subMetas'][name]
        else:
            meta = json.loads((TARGET.parent / 'home_title_logo_v1.png.meta').read_text())
            meta['uuid'] = str(uuid.uuid4())
            frame = next(iter(meta['subMetas'].values()))
            frame['uuid'] = str(uuid.uuid4())
        meta.update(width=size[0], height=size[1], packable=False)
        frame.update(rawTextureUuid=meta['uuid'], trimType='custom', offsetX=0, offsetY=0,
                     trimX=0, trimY=0, width=size[0], height=size[1], rawWidth=size[0], rawHeight=size[1])
        meta['subMetas'] = {name: frame}
        write_json(meta_path, meta)
        total += output.stat().st_size
    print(f'Leaderboard: {len(ASSETS)} transparent assets, {total / 1024:.1f} KiB in home bundle')


if __name__ == '__main__':
    main()
