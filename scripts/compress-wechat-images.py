"""仅无损压缩生成的微信包 PNG；保持尺寸、像素和色彩配置，较小才替换。"""
from io import BytesIO
from pathlib import Path
import json
import struct
import zlib
import zopfli.zlib

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
    # 字库等至多256种颜色的图可精确索引编码，给新增界面留出主包空间。
    # 不量化颜色；透明度逐色保留，随后逐像素和色彩元数据复核。
    colors = image.convert('RGBA').getcolors(256)
    if colors and 'sBIT' not in image.info:
        palette = [color for _, color in sorted(colors, reverse=True)]
        indices = {color: index for index, color in enumerate(palette)}
        indexed = Image.frombytes('P', image.size,
            bytes(indices[color] for color in image.convert('RGBA').getdata()))
        rgb = [channel for color in palette for channel in color[:3]]
        indexed.putpalette(rgb + [0] * (768 - len(rgb)))
        palette_buffer = BytesIO()
        indexed.save(palette_buffer, 'PNG', optimize=True, compress_level=9, pnginfo=metadata,
            transparency=bytes(color[3] for color in palette), icc_profile=image.info.get('icc_profile'))
        if len(palette_buffer.getvalue()) < len(compressed):
            compressed = palette_buffer.getvalue()
    if len(compressed) < len(original):
        check = Image.open(BytesIO(compressed))
        assert check.size == image.size and check.convert('RGBA').tobytes() == image.convert('RGBA').tobytes(), path
        for key in ('icc_profile', 'gamma', 'srgb', 'chromaticity'):
            assert check.info.get(key) == image.info.get(key), (path, key)
        path.write_bytes(compressed)
        changed += 1
        after += len(compressed)
    else:
        after += len(original)
# 主包大PNG进一步优化DEFLATE，不重采样、不更换PNG过滤器或色彩信息。
# pip install -r scripts/requirements-wechat-images.txt
recompressed = 0
for path in sorted(ROOT.rglob('*.png')):
    if 'subpackages' in path.parts or path.stat().st_size < 64 * 1024:
        continue
    original = path.read_bytes()
    chunks = []
    offset = 8
    while offset < len(original):
        length = struct.unpack('>I', original[offset:offset + 4])[0]
        chunks.append((original[offset + 4:offset + 8], original[offset + 8:offset + 8 + length]))
        offset += length + 12
    encoded = b''.join(data for kind, data in chunks if kind == b'IDAT')
    raw = zlib.decompress(encoded)
    optimized = zopfli.zlib.compress(raw, numiterations=5)
    assert zlib.decompress(optimized) == raw, path
    if len(optimized) >= len(encoded):
        continue
    result = bytearray(original[:8])
    written = False
    for kind, data in chunks:
        if kind == b'IDAT':
            if written:
                continue
            data = optimized
            written = True
        result.extend(struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data)))
    old_image = Image.open(BytesIO(original))
    new_image = Image.open(BytesIO(result))
    assert new_image.size == old_image.size and new_image.convert('RGBA').tobytes() == old_image.convert('RGBA').tobytes(), path
    assert new_image.info == old_image.info, path
    path.write_bytes(result)
    after -= len(original) - len(result)
    recompressed += 1
print(json.dumps({'pngFilesCompressed': changed, 'deflateFilesRecompressed': recompressed, 'beforeBytes': before, 'afterBytes': after, 'savedBytes': before - after}))
