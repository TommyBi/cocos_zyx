"""仅无损压缩生成的微信包 PNG；保持尺寸、像素和色彩配置，较小才替换。"""
from io import BytesIO
from pathlib import Path
import json
import struct

from PIL import Image
from PIL.PngImagePlugin import PngInfo

ROOT = Path(__file__).resolve().parents[1] / 'build/wechatgame'
before = after = changed = 0
for path in sorted(ROOT.rglob('*.png')):
    original = path.read_bytes()
    before += len(original)
    image = Image.open(BytesIO(original))
    # 索引色和独立透明度保留原编码；RGBA 的 alpha 原样保留。
    if image.mode not in ('RGB', 'RGBA') or 'transparency' in image.info:
        after += len(original)
        continue
    buffer = BytesIO()
    metadata = PngInfo()
    offset = 8
    while offset < len(original):
        length = struct.unpack('>I', original[offset:offset + 4])[0]
        kind = original[offset + 4:offset + 8]
        if kind in (b'gAMA', b'sRGB', b'cHRM', b'sBIT'):
            metadata.add(kind, original[offset + 8:offset + 8 + length])
        offset += length + 12
    image.save(buffer, 'PNG', optimize=True, compress_level=9, pnginfo=metadata, icc_profile=image.info.get('icc_profile'))
    compressed = buffer.getvalue()
    if len(compressed) < len(original):
        check = Image.open(BytesIO(compressed))
        assert check.size == image.size and check.mode == image.mode and check.tobytes() == image.tobytes(), path
        for key in ('icc_profile', 'gamma', 'srgb', 'chromaticity'):
            assert check.info.get(key) == image.info.get(key), (path, key)
        path.write_bytes(compressed)
        changed += 1
        after += len(compressed)
    else:
        after += len(original)
print(json.dumps({'pngFilesCompressed': changed, 'beforeBytes': before, 'afterBytes': after, 'savedBytes': before - after}))
