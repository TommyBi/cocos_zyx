const { stageRelease } = require('./lib/wechat-cdn-release');

/**
 * 将微信构建产物 remote/ 同步到 server/cdn/remote，供 API 以
 * https://api.tcjstory.cn/v1/cocos-zyx/cdn/ 对外提供。
 *
 * 用法：先 npm run build:wechat，再 npm run sync:wechat-cdn
 * 然后把 server/cdn 部署到线上容器（或整份 server 目录按既有 Compose 发布）。
 */

const { manifest, stagedManifestPath } = stageRelease();
console.log(`Staged CDN release ${manifest.releaseId}`);
console.log(`Files: ${manifest.files.length}, bytes: ${manifest.totalBytes}`);
if (stagedManifestPath) {
    console.log(`Manifest: ${stagedManifestPath}`);
    console.log(`Public base: ${manifest.cdnBase}`);
} else {
    console.log('No remote bundles in this build; CDN staging is not required.');
}
