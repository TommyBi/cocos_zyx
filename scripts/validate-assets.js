const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const bundlesRoot = path.join(projectRoot, 'assets', 'bundles');
const scriptsRoot = path.join(projectRoot, 'assets', 'script');

const EXPECTED_BUNDLES = {
    game: 'none',
    home: 'subpackage',
    realm: 'subpackage',
    realm_art_1: 'subpackage',
    realm_art_2: 'subpackage',
};

/** 画作大图按主题拆成独立分包：主题名 → 所属 bundle 与画作数量。 */
const EXPECTED_ART_THEMES = [
    { bundle: 'realm_art_1', theme: 'theme_1', count: 48 },
    { bundle: 'realm_art_2', theme: 'theme_2', count: 12 },
];

const REQUIRED_FILES = [
    'game/images/formal/game_room_bg_v3.jpg',
    'game/images/formal/relief_hammer_v2.png',
    'game/images/formal/magic_wand_v1.png',
    'game/spine/get_1.json',
    'game/spine/get_1.atlas',
    'game/spine/get_1.png',
    'game/sound/music_game.mp3',
    'game/sound/sound_break.mp3',
    'game/sound/sound_move.mp3',
    'game/sound/sound_tool1.mp3',
    'game/sound/sound_tool2.mp3',
    'home/images/home_studio_bg_v3.jpg',
    'home/images/home_title_logo_v1.png',
    'home/images/realm_entry_portal_v3.png',
    'home/images/rank_entry_trophy_v2.png',
    'home/images/start_guide_hand_v3.png',
    'home/sound/music_main.mp3',
    'realm/albums/covers/icon_lock.png',
    'realm/albums/covers/title/title_1.png',
    'realm/albums/covers/title/title_2.png',
    'realm/albums/effects/album-blur.effect',
    'realm/sound/music_puzzle.mp3',
    'realm/sound/sound_change_pic.mp3',
];

function fail(message) {
    throw new Error(`[资源规范] ${message}`);
}

function walk(root) {
    if (!fs.existsSync(root)) return [];
    const files = [];
    const stack = [root];
    while (stack.length > 0) {
        const current = stack.pop();
        fs.readdirSync(current, { withFileTypes: true }).forEach((entry) => {
            const absolute = path.join(current, entry.name);
            if (entry.isDirectory()) stack.push(absolute);
            else files.push(absolute);
        });
    }
    return files.sort();
}

function relativeTo(root, absolute) {
    return path.relative(root, absolute).split(path.sep).join('/');
}

function readJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        fail(`${relativeTo(projectRoot, filePath)} 不是合法 JSON`);
    }
}

function validateBundleLayout() {
    const actual = fs.readdirSync(bundlesRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    const expected = Object.keys(EXPECTED_BUNDLES).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        fail(`Bundle 目录必须且只能是 ${expected.join(', ')}，实际为 ${actual.join(', ')}`);
    }

    expected.forEach((name) => {
        const meta = readJson(path.join(bundlesRoot, `${name}.meta`));
        if (!meta.isBundle || meta.bundleName !== name) fail(`${name}.meta 的 Bundle 名称或开关错误`);
        if (meta.compressionType.wechatgame !== EXPECTED_BUNDLES[name]) {
            fail(`${name} 的微信打包类型必须为 ${EXPECTED_BUNDLES[name]}`);
        }
        if (meta.isRemoteBundle.wechatgame === true) fail(`${name} 禁止配置为远程 Bundle`);
    });
}

function validateRequiredFiles() {
    REQUIRED_FILES.forEach((relativePath) => {
        const absolute = path.join(bundlesRoot, relativePath);
        if (!fs.existsSync(absolute)) fail(`缺少运行必需资源：assets/bundles/${relativePath}`);
        if (!fs.existsSync(`${absolute}.meta`)) fail(`缺少资源 meta：assets/bundles/${relativePath}.meta`);
    });

    EXPECTED_ART_THEMES.forEach(({ bundle, theme, count }) => {
        const directory = path.join(bundlesRoot, bundle, 'albums', 'art', theme);
        const pictures = fs.readdirSync(directory).filter((name) => /^pic_\d+\.jpg$/.test(name));
        if (pictures.length !== count) fail(`${theme} 应有 ${count} 幅画，实际为 ${pictures.length}`);
        for (let index = 1; index <= count; index += 1) {
            const picture = path.join(directory, `pic_${index}.jpg`);
            if (!fs.existsSync(picture) || !fs.existsSync(`${picture}.meta`)) {
                fail(`${theme} 缺少 pic_${index}.jpg 或对应 meta`);
            }
            if (readJson(`${picture}.meta`).packable !== false) {
                fail(`${theme}/pic_${index}.jpg 是画作大图，禁止进入动态 atlas`);
            }
        }
    });
}

function validateMetasAndJunk() {
    const allFiles = walk(bundlesRoot);
    const uuids = new Map();
    allFiles.forEach((filePath) => {
        const relative = relativeTo(projectRoot, filePath);
        if (path.basename(filePath) === '.DS_Store') fail(`禁止提交系统文件：${relative}`);
        if (!filePath.endsWith('.meta') && !fs.existsSync(`${filePath}.meta`)) {
            fail(`资源没有配套 meta：${relative}`);
        }
        if (!filePath.endsWith('.meta')) return;
        const meta = readJson(filePath);
        if (!meta.uuid) fail(`meta 缺少 uuid：${relative}`);
        if (uuids.has(meta.uuid)) fail(`重复 uuid：${relative} 与 ${uuids.get(meta.uuid)}`);
        uuids.set(meta.uuid, relative);
    });

    const directories = [bundlesRoot];
    while (directories.length > 0) {
        const current = directories.pop();
        fs.readdirSync(current, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .forEach((entry) => {
                const directory = path.join(current, entry.name);
                if (!fs.existsSync(`${directory}.meta`)) {
                    fail(`目录没有配套 meta：${relativeTo(projectRoot, directory)}`);
                }
                directories.push(directory);
            });
    }
}

function pngDimensions(buffer) {
    if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpegDimensions(buffer) {
    if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
    let offset = 2;
    while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) {
            offset += 1;
            continue;
        }
        const marker = buffer[offset + 1];
        const length = buffer.readUInt16BE(offset + 2);
        if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
            return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
        }
        if (length < 2) break;
        offset += 2 + length;
    }
    return null;
}

function validateTextureDimensions() {
    walk(bundlesRoot)
        .filter((filePath) => /\.(png|jpe?g)$/i.test(filePath))
        .forEach((filePath) => {
            const buffer = fs.readFileSync(filePath);
            const size = /\.png$/i.test(filePath) ? pngDimensions(buffer) : jpegDimensions(buffer);
            if (!size) fail(`无法读取图片尺寸：${relativeTo(projectRoot, filePath)}`);
            if (size.width > 2048 || size.height > 2048) {
                fail(`图片超过 2048×2048：${relativeTo(projectRoot, filePath)} (${size.width}×${size.height})`);
            }
        });

    const sceneEntry = fs.readFileSync(path.join(scriptsRoot, 'GameMainScene.ts'), 'utf8');
    if (!/dynamicAtlasManager\.enabled\s*=\s*false\b/.test(sceneEntry)
        || !/dynamicAtlasManager\.reset\(\)/.test(sceneEntry)) {
        fail('场景 onLoad 必须关闭并清空微信运行时动态 atlas');
    }
}

function validateLoadingBoundary() {
    const loaderPath = path.join(scriptsRoot, 'manager', 'AssetLoader.ts');
    walk(scriptsRoot)
        .filter((filePath) => filePath.endsWith('.ts') && filePath !== loaderPath)
        .forEach((filePath) => {
            const source = fs.readFileSync(filePath, 'utf8');
            if (/cc\.(resources|assetManager)\b/.test(source)) {
                fail(`只能由 AssetLoader 访问 Cocos 资源 API：${relativeTo(projectRoot, filePath)}`);
            }
            if (/['"](?:game-assets|album-art|album-covers)['"]/.test(source)) {
                fail(`仍引用旧 Bundle：${relativeTo(projectRoot, filePath)}`);
            }
        });
}

function validateAssetPathManifest() {
    const loaderSource = fs.readFileSync(path.join(scriptsRoot, 'manager', 'AssetLoader.ts'), 'utf8');
    const blockMatch = /export const ASSET_PATHS = \{([\s\S]*?)\n\};/.exec(loaderSource);
    if (!blockMatch) fail('无法解析 AssetLoader.ts 的 ASSET_PATHS，清单格式变化后需同步更新本校验');

    const manifest = new Map();
    const sectionPattern = /(\w+):\s*\{([^}]*)\}/g;
    let section;
    while ((section = sectionPattern.exec(blockMatch[1]))) {
        const bundle = section[1];
        if (!Object.prototype.hasOwnProperty.call(EXPECTED_BUNDLES, bundle)) {
            fail(`ASSET_PATHS 出现未登记的 Bundle：${bundle}`);
        }
        const entryPattern = /(\w+):\s*'([^']+)'/g;
        let entry;
        while ((entry = entryPattern.exec(section[2]))) {
            manifest.set(`${bundle}/${entry[2]}`, true);
        }
    }
    if (manifest.size === 0) fail('ASSET_PATHS 解析结果为空，清单格式变化后需同步更新本校验');

    // 正向：代码引用的每个资源都必须真实存在，且显式登记进 REQUIRED_FILES。
    const CANDIDATE_EXTS = ['.png', '.jpg', '.mp3', '.json', '.effect', '.atlas'];
    manifest.forEach((_value, key) => {
        const found = CANDIDATE_EXTS.find((ext) => fs.existsSync(path.join(bundlesRoot, `${key}${ext}`)));
        if (!found) fail(`ASSET_PATHS 引用的资源不存在：assets/bundles/${key}.*`);
        if (REQUIRED_FILES.indexOf(`${key}${found}`) === -1) {
            fail(`ASSET_PATHS 引用的 ${key}${found} 未登记进 REQUIRED_FILES`);
        }
    });

    // 反向：REQUIRED_FILES 每项都必须被代码引用（spine 的 .atlas/.png 伴随文件按主路径折算）。
    REQUIRED_FILES.forEach((relativePath) => {
        const base = relativePath.replace(/\.(png|jpe?g|mp3|json|effect|atlas)$/, '');
        if (!manifest.has(base)) fail(`REQUIRED_FILES 登记的 ${relativePath} 没有被 ASSET_PATHS 引用`);
    });

    // 画作主题分包路由必须与 EXPECTED_ART_THEMES 一一对应。
    EXPECTED_ART_THEMES.forEach(({ bundle, theme }) => {
        const routePattern = new RegExp(`prefix:\\s*'albums/art/${theme}/',\\s*bundle:\\s*'${bundle}'`);
        if (!routePattern.test(loaderSource)) {
            fail(`AssetLoader 的画作分包路由缺少 'albums/art/${theme}/' → '${bundle}'`);
        }
    });
}

validateBundleLayout();
validateRequiredFiles();
validateMetasAndJunk();
validateTextureDimensions();
validateLoadingBoundary();
validateAssetPathManifest();
console.log('Asset architecture OK: game(main), home/realm/realm_art_1/realm_art_2(subpackage), max texture 2048.');
