const fs = require('fs');
const path = require('path');
const { writeManifest } = require('./lib/wechat-cdn-release');

const APP_ID = 'wxdc39c78bfd045896';
const LIB_VERSION = '3.15.2';
const REMOTE_SERVER = 'https://api.tcjstory.cn/v1/cocos-zyx/cdn/';
const buildRoot = path.resolve(__dirname, '..', 'build', 'wechatgame');
const projectConfigPath = path.join(buildRoot, 'project.config.json');
const gameConfigPath = path.join(buildRoot, 'game.json');
const settingsPath = path.join(buildRoot, 'src', 'settings.js');

if (!fs.existsSync(projectConfigPath) || !fs.existsSync(gameConfigPath) || !fs.existsSync(settingsPath)) {
    throw new Error('微信小游戏构建产物不存在，请先执行 Cocos wechatgame 构建。');
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
const packIgnore = Array.isArray(packOptions.ignore) ? packOptions.ignore.slice() : [];
if (!packIgnore.some((item) => item && item.type === 'folder' && item.value === 'remote')) {
    packIgnore.push({ type: 'folder', value: 'remote' });
}
projectConfig.packOptions = Object.assign({}, packOptions, {
    ignore: packIgnore,
    include: Array.isArray(packOptions.include) ? packOptions.include : [],
});
fs.writeFileSync(projectConfigPath, `${JSON.stringify(projectConfig, null, 4)}\n`);

const gameConfig = JSON.parse(fs.readFileSync(gameConfigPath, 'utf8'));
gameConfig.deviceOrientation = 'portrait';

// 根据实际构建目录补齐分包声明，不维护容易过期的手写名称列表。
const subpackagesDir = path.join(buildRoot, 'subpackages');
const expectedSubs = fs.existsSync(subpackagesDir)
    ? fs.readdirSync(subpackagesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : [];
const declared = Array.isArray(gameConfig.subpackages) ? gameConfig.subpackages.slice() : [];
const declaredNames = new Set(declared.map((item) => item.name || item));
expectedSubs.forEach((name) => {
    if (!declaredNames.has(name) && fs.existsSync(path.join(subpackagesDir, name))) {
        declared.push({ name, root: `subpackages/${name}/` });
    }
});
if (declared.length > 0) gameConfig.subpackages = declared;
fs.writeFileSync(gameConfigPath, `${JSON.stringify(gameConfig, null, 4)}\n`);

const settingsSource = fs.readFileSync(settingsPath, 'utf8');
const usesRemoteBundles = !/remoteBundles\s*:\s*\[\s*\]/.test(settingsSource);
const targetServer = usesRemoteBundles ? REMOTE_SERVER : '';
const settingsWithServer = settingsSource.replace(/server\s*:\s*["'][^"']*["']/, `server:${JSON.stringify(targetServer)}`);
if (settingsWithServer === settingsSource && settingsSource.indexOf(`server:${JSON.stringify(targetServer)}`) < 0) {
    throw new Error('未能更新微信远程资源地址，请检查 src/settings.js 格式。');
}
fs.writeFileSync(settingsPath, settingsWithServer);

function dirSizeBytes(target) {
    if (!fs.existsSync(target)) return 0;
    let total = 0;
    const stack = [target];
    while (stack.length) {
        const current = stack.pop();
        const stat = fs.statSync(current);
        if (stat.isDirectory()) {
            fs.readdirSync(current).forEach((name) => {
                if (name === '.' || name === '..') return;
                stack.push(path.join(current, name));
            });
        } else {
            total += stat.size;
        }
    }
    return total;
}

function formatKb(bytes) {
    return `${(bytes / 1024).toFixed(1)}KB`;
}

// 上传主包大致 = 整包 - remote（远程）
const totalBytes = dirSizeBytes(buildRoot);
const remoteBytes = dirSizeBytes(path.join(buildRoot, 'remote'));
const subBytes = dirSizeBytes(subpackagesDir);
const mainApprox = Math.max(0, totalBytes - remoteBytes);
const uploadApprox = Math.max(0, totalBytes - remoteBytes - subBytes);

console.log(`Prepared WeChat mini game: ${APP_ID}`);
console.log(`Remote CDN: ${usesRemoteBundles ? REMOTE_SERVER : 'not used by this build'}`);
console.log(`Package total: ${formatKb(totalBytes)}`);
console.log(`Remote resources: ${formatKb(remoteBytes)}${remoteBytes > 0 ? ' (deploy before uploading the mini-game package)' : ''}`);
console.log(`Subpackages: ${formatKb(subBytes)} (WeChat downloads on demand)`);
console.log(`WeChat upload total (main + subpackages): ${formatKb(mainApprox)}`);
console.log(`Approx cold-start main (excludes remote+subpackages): ${formatKb(uploadApprox)}`);
if (uploadApprox > 4 * 1024 * 1024) {
    console.warn('WARNING: estimated main package still exceeds 4MB. Check engine/scripts size.');
}
const releaseManifest = writeManifest();
console.log(`CDN release: ${releaseManifest.releaseId}`);
console.log(`CDN files: ${releaseManifest.files.length}, ${formatKb(releaseManifest.totalBytes)} (SHA-256 verified manifest)`);
