/**
 * 阶段 A-6：官方画作资源转换。
 *
 * 1. 备份 750×1000 母版到 docs/art-sources/archive/formal/（只备份一次）。
 * 2. 750×1000 → 居中裁切 750×900 → 等比缩放 650×780（保持文件名与 UUID）。
 * 3. 生成 130×156 像素预览 preview_N.png（邻近采样，不进入动态 atlas）。
 * 4. 程序生成两册主题画框 700×830 PNG（画框与原画分离，按册复用）。
 *
 * 运行：node scripts/convert-artwork.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const bundlesRoot = path.join(projectRoot, 'assets', 'bundles');
const archiveRoot = path.join(projectRoot, 'docs', 'art-sources', 'archive', 'formal');

const THEMES = [
    { bundle: 'realm_art_1', theme: 'theme_1', count: 48 },
    { bundle: 'realm_art_2', theme: 'theme_2', count: 12 },
];

const ART_WIDTH = 650;
const ART_HEIGHT = 780;
const PREVIEW_WIDTH = 130;
const PREVIEW_HEIGHT = 156;
const FRAME_WIDTH = 700;
const FRAME_HEIGHT = 830;

function sips(args) {
    execFileSync('sips', args, { stdio: 'pipe' });
}

/** 保持 uuid 不变，只更新 meta 中记录的尺寸，避免 60 幅画引用失效。 */
function updateMetaDimensions(metaPath, width, height) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    meta.width = width;
    meta.height = height;
    Object.keys(meta.subMetas || {}).forEach((key) => {
        const sub = meta.subMetas[key];
        sub.width = width;
        sub.height = height;
        sub.rawWidth = width;
        sub.rawHeight = height;
        sub.trimX = 0;
        sub.trimY = 0;
    });
    fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
}

function createSpriteMeta(name, width, height, filterMode) {
    const textureUuid = crypto.randomUUID();
    return {
        ver: '2.3.7',
        uuid: textureUuid,
        importer: 'texture',
        type: 'sprite',
        wrapMode: 'clamp',
        filterMode,
        premultiplyAlpha: false,
        genMipmaps: false,
        packable: false,
        width,
        height,
        platformSettings: {},
        subMetas: {
            [name]: {
                ver: '1.0.6',
                uuid: crypto.randomUUID(),
                importer: 'sprite-frame',
                rawTextureUuid: textureUuid,
                trimType: 'auto',
                trimThreshold: 1,
                rotated: false,
                offsetX: 0,
                offsetY: 0,
                trimX: 0,
                trimY: 0,
                width,
                height,
                rawWidth: width,
                rawHeight: height,
                borderTop: 0,
                borderBottom: 0,
                borderLeft: 0,
                borderRight: 0,
                subMetas: {},
            },
        },
    };
}

// ---------- 纯 JS PNG 编码（RGBA、filter 0） ----------
const CRC_TABLE = (() => {
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
    }
    return table;
})();

function crc32(buffer) {
    let crc = -1;
    for (let index = 0; index < buffer.length; index++) {
        crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[index]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // RGBA
    const stride = width * 4 + 1;
    const raw = Buffer.alloc(stride * height);
    for (let y = 0; y < height; y++) {
        raw[y * stride] = 0;
        rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
    }
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        pngChunk('IHDR', ihdr),
        pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
        pngChunk('IEND', Buffer.alloc(0)),
    ]);
}

// ---------- 主题画框 ----------
function roundedRectContains(x, y, left, top, right, bottom, radius) {
    if (x < left || x >= right || y < top || y >= bottom) return false;
    const innerLeft = left + radius;
    const innerRight = right - radius;
    const innerTop = top + radius;
    const innerBottom = bottom - radius;
    if ((x >= innerLeft && x < innerRight) || (y >= innerTop && y < innerBottom)) return true;
    const cx = x < innerLeft ? innerLeft : innerRight;
    const cy = y < innerTop ? innerTop : innerBottom;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
}

/**
 * 画框：外环木质 + 内压边阴影 + 角花点缀，中央 650×780 透明露出画作。
 * 四季物语：奶油木色；京城掠影：深胡桃木 + 铜色包角。
 */
function generateFrame(style) {
    const rgba = Buffer.alloc(FRAME_WIDTH * FRAME_HEIGHT * 4);
    const insetX = (FRAME_WIDTH - ART_WIDTH) / 2;
    const insetY = (FRAME_HEIGHT - ART_HEIGHT) / 2;
    const palette = style === 'season'
        ? { light: [232, 206, 168], mid: [212, 178, 134], dark: [166, 128, 90], corner: [146, 108, 66], liner: [250, 240, 220] }
        : { light: [126, 102, 86], mid: [104, 82, 68], dark: [72, 56, 48], corner: [176, 132, 84], liner: [216, 200, 178] };

    for (let y = 0; y < FRAME_HEIGHT; y++) {
        for (let x = 0; x < FRAME_WIDTH; x++) {
            const offset = (y * FRAME_WIDTH + x) * 4;
            const inOuter = roundedRectContains(x, y, 0, 0, FRAME_WIDTH, FRAME_HEIGHT, 26);
            const inArt = x >= insetX && x < insetX + ART_WIDTH && y >= insetY && y < insetY + ART_HEIGHT;
            if (!inOuter || inArt) continue;

            const distanceToArt = Math.min(
                Math.abs(x - insetX),
                Math.abs(x - (insetX + ART_WIDTH - 1)),
                Math.abs(y - insetY),
                Math.abs(y - (insetY + ART_HEIGHT - 1)),
            );
            const distanceToEdge = Math.min(x, FRAME_WIDTH - 1 - x, y, FRAME_HEIGHT - 1 - y);
            let color = palette.mid;
            if (distanceToArt <= 3) color = palette.dark; // 内压边阴影
            else if (distanceToEdge <= 3) color = palette.light; // 外缘高光
            else if (distanceToEdge >= 10 && distanceToArt >= 10) color = palette.mid;
            // 铜色/深木包角。
            const cornerRange = 30;
            const nearCorner = (x < cornerRange || x >= FRAME_WIDTH - cornerRange)
                && (y < cornerRange || y >= FRAME_HEIGHT - cornerRange);
            if (nearCorner && distanceToArt > 3 && distanceToEdge > 2) color = palette.corner;

            rgba[offset] = color[0];
            rgba[offset + 1] = color[1];
            rgba[offset + 2] = color[2];
            rgba[offset + 3] = 255;
        }
    }
    return encodePng(FRAME_WIDTH, FRAME_HEIGHT, rgba);
}

function writeAsset(filePath, buffer, meta) {
    fs.writeFileSync(filePath, buffer);
    fs.writeFileSync(`${filePath}.meta`, `${JSON.stringify(meta, null, 2)}\n`);
}

function createFolderMeta() {
    return {
        ver: '1.1.3',
        uuid: crypto.randomUUID(),
        importer: 'folder',
        isBundle: false,
        bundleName: '',
        priority: 1,
        compressionType: {},
        optimizeHotUpdate: {},
        inlineSpriteFrames: {},
        isRemoteBundle: {},
        subMetas: {},
    };
}

function main() {
    fs.mkdirSync(archiveRoot, { recursive: true });
    let converted = 0;
    THEMES.forEach(({ bundle, theme, count }) => {
        const directory = path.join(bundlesRoot, bundle, 'albums', 'art', theme);
        for (let index = 1; index <= count; index++) {
            const picture = path.join(directory, `pic_${index}.jpg`);
            const metaPath = `${picture}.meta`;
            const backup = path.join(archiveRoot, `${theme}_pic_${index}.jpg`);
            if (!fs.existsSync(backup)) fs.copyFileSync(picture, backup);

            // 居中裁切 750×900，再等比缩放到 650×780，禁止直接拉伸。
            sips(['-c', '900', '750', picture]);
            sips(['-z', String(ART_HEIGHT), String(ART_WIDTH), picture]);
            updateMetaDimensions(metaPath, ART_WIDTH, ART_HEIGHT);

            const preview = path.join(directory, `preview_${index}.png`);
            sips(['-s', 'format', 'png', '-z', String(PREVIEW_HEIGHT), String(PREVIEW_WIDTH), picture, '--out', preview]);
            writeAsset(preview, fs.readFileSync(preview), createSpriteMeta(`preview_${index}`, PREVIEW_WIDTH, PREVIEW_HEIGHT, 'point'));
            converted++;
        }
    });

    const framesDirectory = path.join(bundlesRoot, 'realm', 'albums', 'frames');
    fs.mkdirSync(framesDirectory, { recursive: true });
    if (!fs.existsSync(`${framesDirectory}.meta`)) {
        fs.writeFileSync(`${framesDirectory}.meta`, `${JSON.stringify(createFolderMeta(), null, 2)}\n`);
    }
    const frameSeason = path.join(framesDirectory, 'frame_season.png');
    const frameCity = path.join(framesDirectory, 'frame_city.png');
    writeAsset(frameSeason, generateFrame('season'), createSpriteMeta('frame_season', FRAME_WIDTH, FRAME_HEIGHT, 'bilinear'));
    writeAsset(frameCity, generateFrame('city'), createSpriteMeta('frame_city', FRAME_WIDTH, FRAME_HEIGHT, 'bilinear'));

    console.log(`Artwork converted: ${converted} pictures → ${ART_WIDTH}×${ART_HEIGHT}, ${converted} previews → ${PREVIEW_WIDTH}×${PREVIEW_HEIGHT}, 2 frames → ${FRAME_WIDTH}×${FRAME_HEIGHT}.`);
}

main();
