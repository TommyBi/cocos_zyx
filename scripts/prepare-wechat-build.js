const fs = require('fs');
const path = require('path');
const vm = require('vm');

const APP_ID = 'wxdc39c78bfd045896';
const LIB_VERSION = '3.15.2';
const buildRoot = path.resolve(__dirname, '..', 'build', 'wechatgame');
const projectConfigPath = path.join(buildRoot, 'project.config.json');
const gameConfigPath = path.join(buildRoot, 'game.json');
const gameEntryPath = path.join(buildRoot, 'game.js');
const mainEntryPath = path.join(buildRoot, 'main.js');
const settingsPath = path.join(buildRoot, 'src', 'settings.js');

if (!fs.existsSync(projectConfigPath)
    || !fs.existsSync(gameConfigPath)
    || !fs.existsSync(gameEntryPath)
    || !fs.existsSync(mainEntryPath)
    || !fs.existsSync(settingsPath)) {
    throw new Error('微信小游戏构建产物不完整');
}

function dirSizeBytes(target) {
    if (!fs.existsSync(target)) return 0;
    return fs.readdirSync(target, { withFileTypes: true }).reduce((total, entry) => {
        const absolute = path.join(target, entry.name);
        return total + (entry.isDirectory() ? dirSizeBytes(absolute) : fs.statSync(absolute).size);
    }, 0);
}

function formatMb(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
projectConfig.appid = APP_ID;
projectConfig.compileType = 'game';
projectConfig.libVersion = LIB_VERSION;
projectConfig.projectname = '烦恼排排消';
projectConfig.setting = Object.assign({}, projectConfig.setting, {
    es6: true,
    minified: true,
    urlCheck: true,
});
const packOptions = projectConfig.packOptions && typeof projectConfig.packOptions === 'object'
    ? projectConfig.packOptions
    : {};
projectConfig.packOptions = Object.assign({}, packOptions, {
    ignore: (Array.isArray(packOptions.ignore) ? packOptions.ignore : [])
        .filter((item) => !(item && item.type === 'folder' && item.value === 'remote')),
    include: Array.isArray(packOptions.include) ? packOptions.include : [],
});
fs.writeFileSync(projectConfigPath, `${JSON.stringify(projectConfig, null, 4)}\n`);

const subpackagesRoot = path.join(buildRoot, 'subpackages');
const subpackageNames = fs.readdirSync(subpackagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
const expectedSubpackages = ['home', 'realm', 'realm_art_1', 'realm_art_2'];
if (JSON.stringify(subpackageNames) !== JSON.stringify(expectedSubpackages)) {
    throw new Error(`微信分包必须且只能是 ${expectedSubpackages.join(', ')}，实际为 ${subpackageNames.join(', ')}`);
}

const gameConfig = JSON.parse(fs.readFileSync(gameConfigPath, 'utf8'));
gameConfig.deviceOrientation = 'portrait';
gameConfig.subpackages = expectedSubpackages.map((name) => ({ name, root: `subpackages/${name}/` }));
fs.writeFileSync(gameConfigPath, `${JSON.stringify(gameConfig, null, 4)}\n`);

const settingsSource = fs.readFileSync(settingsPath, 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(settingsSource, sandbox, { filename: settingsPath, timeout: 1000 });
const settings = sandbox.window._CCSettings;
if (!settings || !Array.isArray(settings.remoteBundles) || settings.remoteBundles.length !== 0) {
    throw new Error(`构建中不应存在远程 Bundle：${settings && settings.remoteBundles}`);
}
if (!Array.isArray(settings.subpackages) || settings.subpackages.slice().sort().join(',') !== 'home,realm,realm_art_1,realm_art_2') {
    throw new Error(`Cocos 分包声明错误：${settings && settings.subpackages}`);
}
const settingsWithoutServer = settingsSource.replace(/server\s*:\s*["'][^"']*["']/, 'server:""');
fs.writeFileSync(settingsPath, settingsWithoutServer);

// cc.game.run() 会重置引擎宏；必须在渲染器初始化完成后、启动场景加载前关闭图片回收。
// 这样既不会触发 Cocos 的运行时动态 atlas，又能让异步 Bundle 的 Sprite 保留原生 PNG。
const mainEntrySource = fs.readFileSync(mainEntryPath, 'utf8');
const onStartMarker = 'var onStart = function onStart() {';
const mainEntryWithoutImageCleanup = mainEntrySource.replace(
    onStartMarker,
    `${onStartMarker}\n    cc.macro.CLEANUP_IMAGE_CACHE = false;`,
);
if (mainEntryWithoutImageCleanup === mainEntrySource) {
    throw new Error('微信模板缺少 onStart 入口，无法在场景加载前关闭 PNG 回收');
}
fs.writeFileSync(mainEntryPath, mainEntryWithoutImageCleanup);

if (!fs.existsSync(path.join(buildRoot, 'assets', 'game'))) {
    throw new Error('局内 game Bundle 没有进入主包');
}
if (fs.existsSync(path.join(buildRoot, 'assets', 'game-assets'))) {
    throw new Error('构建产物仍包含旧 game-assets Bundle');
}
if (fs.existsSync(path.join(buildRoot, 'remote'))) {
    throw new Error('构建产物出现 remote 目录，资源架构已经越界');
}

const subpackageSizes = expectedSubpackages.map((name) => ({
    name,
    bytes: dirSizeBytes(path.join(subpackagesRoot, name)),
}));
subpackageSizes.forEach(({ name, bytes }) => {
    if (bytes > 20 * 1024 * 1024) throw new Error(`分包 ${name} 超过 20MB：${formatMb(bytes)}`);
});

const totalBytes = dirSizeBytes(buildRoot);
const subpackageBytes = subpackageSizes.reduce((sum, item) => sum + item.bytes, 0);
const mainBytes = totalBytes - subpackageBytes;
if (mainBytes > 4 * 1024 * 1024) {
    throw new Error(`微信主包超过 4MB：${formatMb(mainBytes)}`);
}

console.log(`Prepared WeChat mini game: ${APP_ID}`);
console.log(`Main package: ${formatMb(mainBytes)} (game resources included)`);
subpackageSizes.forEach(({ name, bytes }) => console.log(`Subpackage ${name}: ${formatMb(bytes)}`));
console.log('Remote bundles: 0');
