/**
 * 微信小游戏 CI 上传：使用项目根目录的上传私钥（private.{appid}.key），
 * 走 miniprogram-ci 通道，不依赖开发者工具登录态。
 *
 * 用法：
 *   node scripts/upload-wechat.js [version] [desc]
 * 默认版本号 1.3.0-yyyyMMddHHmm，默认备注为最近一轮改动摘要。
 */
const path = require('path');
const fs = require('fs');
const ci = require('miniprogram-ci');

const APP_ID = 'wxdc39c78bfd045896';
const repoRoot = path.resolve(__dirname, '..');
const buildRoot = path.join(repoRoot, 'build', 'wechatgame');
const privateKeyPath = path.join(repoRoot, `private.${APP_ID}.key`);

if (!fs.existsSync(buildRoot)) {
    throw new Error('构建产物不存在，请先执行 npm run build:wechat');
}
if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`上传私钥不存在：${privateKeyPath}`);
}

const pad = (value) => String(value).padStart(2, '0');
const now = new Date();
const version = process.argv[2]
    || `1.3.0-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
const desc = process.argv[3] || '首发 MVP：左右消除与本周单局最高分排行榜';

(async () => {
    const project = new ci.Project({
        appid: APP_ID,
        type: 'miniGame',
        projectPath: buildRoot,
        privateKeyPath,
        ignores: ['node_modules/**/*'],
    });
    await ci.upload({
        project,
        version,
        desc,
        setting: { es6: true, minified: true },
        onProgressUpdate: () => undefined,
    });
    console.log(`上传成功：${APP_ID} v${version}`);
    console.log('请到 mp.weixin.qq.com 版本管理查看体验版二维码或提交审核。');
})().catch((error) => {
    console.error(`上传失败：${error && error.message ? error.message : error}`);
    process.exit(1);
});
