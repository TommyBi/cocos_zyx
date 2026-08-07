const fs = require('fs');
const path = require('path');

/**
 * 将微信构建产物 remote/ 同步到 server/cdn，供 API 以
 * https://api.tcjstory.cn/v1/cocos-zyx/cdn/ 对外提供。
 *
 * 用法：先 npm run build:wechat，再 npm run sync:wechat-cdn
 * 然后把 server/cdn 部署到线上容器（或整份 server 目录按既有 Compose 发布）。
 */

const remoteRoot = path.resolve(__dirname, '..', 'build', 'wechatgame', 'remote');
const cdnRoot = path.resolve(__dirname, '..', 'server', 'cdn');

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const from = path.join(src, entry.name);
        const to = path.join(dest, entry.name);
        if (entry.isDirectory()) copyDir(from, to);
        else fs.copyFileSync(from, to);
    }
}

function wipeDir(target) {
    if (!fs.existsSync(target)) return;
    fs.rmSync(target, { recursive: true, force: true });
}

if (!fs.existsSync(remoteRoot)) {
    throw new Error(`找不到 ${remoteRoot}，请先执行 npm run build:wechat`);
}

wipeDir(cdnRoot);
copyDir(remoteRoot, cdnRoot);
console.log(`Synced remote assets -> ${cdnRoot}`);
console.log('Public base: https://api.tcjstory.cn/v1/cocos-zyx/cdn/');
console.log('Deploy server/cdn with the cocos_zyx API container before uploading the WeChat package.');
