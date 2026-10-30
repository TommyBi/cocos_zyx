/**
 * 背景音乐等大资源的 CDN 根地址。
 * Cocos 运行时会再拼接 remote/<bundle>/，因此这里不要带 remote 目录。
 * 这些文件由 CDN 分发，禁止指到 API 源站。
 */
const CDN_ROOT = 'https://cdn.tcjstory.cn/cocos-zyx/';
const ORIGIN_HOSTS = new Set(['api.tcjstory.cn']);

function assertCdnRoot(root) {
    let url;
    try {
        url = new URL(root);
    } catch (error) {
        throw new Error(`CDN 地址不合法：${root}`);
    }
    if (url.protocol !== 'https:') throw new Error(`CDN 必须使用 https：${root}`);
    if (!root.endsWith('/')) throw new Error(`CDN 根地址必须以 / 结尾：${root}`);
    if (ORIGIN_HOSTS.has(url.hostname)) {
        throw new Error(`远程资源不能放到源站 ${url.hostname}`);
    }
    return url;
}

module.exports = {
    CDN_ROOT,
    assertCdnRoot,
};
