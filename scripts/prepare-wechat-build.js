const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { CDN_ROOT, assertCdnRoot } = require('./wechat-remote');

assertCdnRoot(CDN_ROOT);

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
const ignoreRemote = (Array.isArray(packOptions.ignore) ? packOptions.ignore : [])
    .filter((item) => !(item && item.type === 'folder' && item.value === 'remote'));
ignoreRemote.push({ type: 'folder', value: 'remote' });
projectConfig.packOptions = Object.assign({}, packOptions, {
    ignore: ignoreRemote,
    include: Array.isArray(packOptions.include) ? packOptions.include : [],
});
fs.writeFileSync(projectConfigPath, `${JSON.stringify(projectConfig, null, 4)}\n`);

const subpackagesRoot = path.join(buildRoot, 'subpackages');
const subpackageNames = fs.readdirSync(subpackagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
const expectedSubpackages = ['home'];
if (JSON.stringify(subpackageNames) !== JSON.stringify(expectedSubpackages)) {
    throw new Error(`Cocos 构建分包必须且只能是 ${expectedSubpackages.join(', ')}，实际为 ${subpackageNames.join(', ')}`);
}

const gameConfig = JSON.parse(fs.readFileSync(gameConfigPath, 'utf8'));
gameConfig.deviceOrientation = 'portrait';
gameConfig.subpackages = expectedSubpackages.map((name) => ({ name, root: `subpackages/${name}/` }));
fs.writeFileSync(gameConfigPath, `${JSON.stringify(gameConfig, null, 4)}\n`);

const settingsSource = fs.readFileSync(settingsPath, 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(settingsSource, sandbox, { filename: settingsPath, timeout: 1000 });
const settings = sandbox.window._CCSettings;
const expectedRemoteBundles = ['music'];
if (!settings || !Array.isArray(settings.remoteBundles)
    || settings.remoteBundles.slice().sort().join(',') !== expectedRemoteBundles.join(',')) {
    throw new Error(`远程 Bundle 必须且只能是 ${expectedRemoteBundles.join(', ')}，实际为 ${settings && settings.remoteBundles}`);
}
settings.server = CDN_ROOT;
if (!Array.isArray(settings.subpackages) || settings.subpackages.slice().sort().join(',') !== expectedSubpackages.join(',')) {
    throw new Error(`Cocos 分包声明错误：${settings && settings.subpackages}`);
}
const settingsLiteral = `window._CCSettings=${JSON.stringify(settings)};`;
const settingsWithoutServer = settingsSource.replace(/window\._CCSettings\s*=\s*\{[\s\S]*?\};/, settingsLiteral);
if (settingsWithoutServer === settingsSource) throw new Error('无法更新微信 settings.js 分包声明');
fs.writeFileSync(settingsPath, settingsWithoutServer);

const finalSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(settingsPath, 'utf8'), finalSandbox, { filename: settingsPath, timeout: 1000 });
const finalSettings = finalSandbox.window._CCSettings;
if (!finalSettings || JSON.stringify(finalSettings.subpackages) !== JSON.stringify(expectedSubpackages)) {
    throw new Error(`最终 settings.js 分包声明错误：${finalSettings && finalSettings.subpackages}`);
}
if (finalSettings.server !== CDN_ROOT) {
    throw new Error(`最终 settings.js 远程地址错误：${finalSettings.server}`);
}
if (JSON.stringify(finalSettings.remoteBundles) !== JSON.stringify(expectedRemoteBundles)) {
    throw new Error(`最终 settings.js 远程 Bundle 错误：${finalSettings.remoteBundles}`);
}
const finalGameConfig = JSON.parse(fs.readFileSync(gameConfigPath, 'utf8'));
if (JSON.stringify(finalGameConfig.subpackages.map((item) => item.name)) !== JSON.stringify(expectedSubpackages)) {
    throw new Error(`最终 game.json 分包声明错误：${finalGameConfig.subpackages}`);
}

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
const remoteRoot = path.join(buildRoot, 'remote');
const remoteMusicRoot = path.join(remoteRoot, 'music');
if (!fs.existsSync(remoteMusicRoot)) {
    throw new Error('背景音乐远程 Bundle 没有生成到 build/wechatgame/remote/music');
}
if (fs.existsSync(path.join(buildRoot, 'assets', 'music'))) {
    throw new Error('音乐 Bundle 被打进了主包');
}
const remoteNames = fs.readdirSync(remoteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
if (JSON.stringify(remoteNames) !== JSON.stringify(expectedRemoteBundles)) {
    throw new Error(`remote 目录必须且只能包含 ${expectedRemoteBundles.join(', ')}，实际为 ${remoteNames.join(', ')}`);
}

function walkFiles(target, files = []) {
    if (!fs.existsSync(target)) return files;
    fs.readdirSync(target, { withFileTypes: true }).forEach((entry) => {
        const absolute = path.join(target, entry.name);
        if (entry.isDirectory()) walkFiles(absolute, files);
        else files.push(absolute);
    });
    return files;
}

const packedOversizedAudio = walkFiles(buildRoot).filter((filePath) => {
    if (filePath.startsWith(`${remoteRoot}${path.sep}`)) return false;
    return filePath.endsWith('.mp3') && fs.statSync(filePath).size > 128 * 1024;
});
if (packedOversizedAudio.length > 0) {
    throw new Error(`超过 128KB 的音频仍在代码包内：${packedOversizedAudio.join(', ')}`);
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
const remoteBytes = dirSizeBytes(remoteRoot);
const mainBytes = totalBytes - subpackageBytes - remoteBytes;
if (mainBytes > 4 * 1024 * 1024) {
    throw new Error(`微信主包超过 4MB：${formatMb(mainBytes)}`);
}

console.log(`Prepared WeChat mini game: ${APP_ID}`);
console.log(`Main package: ${formatMb(mainBytes)} (music excluded)`);
subpackageSizes.forEach(({ name, bytes }) => console.log(`Subpackage ${name}: ${formatMb(bytes)}`));
console.log(`Remote music: ${formatMb(remoteBytes)} -> ${CDN_ROOT}remote/music/`);
console.log('Upload build/wechatgame/remote to the CDN. Do not publish it from the API origin.');
