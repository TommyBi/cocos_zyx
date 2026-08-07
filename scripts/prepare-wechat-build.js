const fs = require('fs');
const path = require('path');

const APP_ID = 'wxdc39c78bfd045896';
const REMOTE_SERVER = 'https://api.tcjstory.cn/v1/cocos-zyx/cdn/';
const buildRoot = path.resolve(__dirname, '..', 'build', 'wechatgame');
const projectConfigPath = path.join(buildRoot, 'project.config.json');
const gameConfigPath = path.join(buildRoot, 'game.json');

if (!fs.existsSync(projectConfigPath) || !fs.existsSync(gameConfigPath)) {
    throw new Error('微信小游戏构建产物不存在，请先执行 Cocos wechatgame 构建。');
}

const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
projectConfig.appid = APP_ID;
projectConfig.compileType = 'game';
projectConfig.libVersion = '3.15.2';
projectConfig.projectname = '烦恼排排消';
projectConfig.setting = Object.assign({}, projectConfig.setting, {
    es6: true,
    minified: true,
    urlCheck: true,
});
fs.writeFileSync(projectConfigPath, `${JSON.stringify(projectConfig, null, 4)}\n`);

const gameConfig = JSON.parse(fs.readFileSync(gameConfigPath, 'utf8'));
gameConfig.deviceOrientation = 'portrait';

// 确保 home / realm 分包声明存在（Cocos 构建通常会写；这里做兜底）。
const subpackagesDir = path.join(buildRoot, 'subpackages');
const expectedSubs = ['home', 'realm'];
const declared = Array.isArray(gameConfig.subpackages) ? gameConfig.subpackages.slice() : [];
const declaredNames = new Set(declared.map((item) => item.name || item));
expectedSubs.forEach((name) => {
    if (!declaredNames.has(name) && fs.existsSync(path.join(subpackagesDir, name))) {
        declared.push({ name, root: `subpackages/${name}/` });
    }
});
if (declared.length > 0) gameConfig.subpackages = declared;
fs.writeFileSync(gameConfigPath, `${JSON.stringify(gameConfig, null, 4)}\n`);

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
console.log(`Remote CDN: ${REMOTE_SERVER}`);
console.log(`Package total: ${formatKb(totalBytes)}`);
console.log(`Remote resources: ${formatKb(remoteBytes)} (deploy to CDN, not in upload main package)`);
console.log(`Subpackages: ${formatKb(subBytes)} (WeChat downloads on demand)`);
console.log(`Approx main+local (excludes remote): ${formatKb(mainApprox)}`);
console.log(`Approx cold-start main (excludes remote+subpackages): ${formatKb(uploadApprox)}`);
if (uploadApprox > 4 * 1024 * 1024) {
    console.warn('WARNING: estimated main package still exceeds 4MB. Check engine/scripts size.');
}
if (!fs.existsSync(path.join(buildRoot, 'remote'))) {
    console.warn('WARNING: remote/ folder missing. Ensure resources isRemoteBundle=true and rebuild.');
}
