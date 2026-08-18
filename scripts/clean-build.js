const fs = require('fs');
const path = require('path');

const allowedTargets = new Set(['web-mobile', 'wechatgame']);
const target = process.argv[2];
if (!allowedTargets.has(target)) {
    throw new Error(`只允许清理生成目录：${Array.from(allowedTargets).join(', ')}`);
}

const buildRoot = path.resolve(__dirname, '..', 'build');
const targetPath = path.join(buildRoot, target);
fs.rmSync(targetPath, { recursive: true, force: true });
console.log(`Cleaned generated build: build/${target}`);
