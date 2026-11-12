/**
 * 把微信构建出的 remote 目录上传到游戏自己的 OSS 桶。
 * --share 只上传 share-assets/20261112/manifest.json 列出的三张压缩分享图。
 * 音乐写入 cocos-zyx/remote/...；分享图写入 cocos-zyx/share/20261112/ 下带内容哈希的文件名。
 * 只追加文件，不删除桶内已有对象，也不访问其他桶。
 *
 * 凭证放在项目根目录 .oss.local.env（已 gitignore），不要写进仓库或聊天。
 */
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, '.oss.local.env');
const publishShare = process.argv[2] === '--share';
if (process.argv[2] && !publishShare) throw new Error('仅支持无参数或 --share');
const remoteRoot = publishShare ? path.join(repoRoot, 'share-assets', '20261112')
    : path.join(repoRoot, 'build', 'wechatgame-cdn', 'remote');
const BUCKET = 'tcjstory-cocos-zyx';
const REGION = 'oss-cn-beijing';
const KEY_PREFIX = publishShare ? 'cocos-zyx/share/20261112/' : 'cocos-zyx/remote/';

function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`缺少 ${filePath}。请按脚本顶部说明在本机创建，不要把密钥发到聊天里。`);
    }
    const env = {};
    fs.readFileSync(filePath, 'utf8').split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
        const index = trimmed.indexOf('=');
        env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
    });
    return env;
}

function walk(dir, files = []) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const absolute = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(absolute, files);
        else files.push(absolute);
    });
    return files;
}

function contentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.json') return 'application/json';
    if (ext === '.js') return 'application/javascript';
    if (ext === '.mp3') return 'audio/mpeg';
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.atlas') return 'text/plain; charset=utf-8';
    return 'application/octet-stream';
}

function putObject(accessKeyId, accessKeySecret, objectKey, body, mime) {
    const date = new Date().toUTCString();
    const cacheControl = 'public, max-age=31536000, immutable';
    const canonicalHeaders = `${publishShare ? 'x-oss-forbid-overwrite:true\n' : ''}x-oss-object-acl:private\n`;
    const stringToSign = `PUT\n\n${mime}\n${date}\n${canonicalHeaders}/${BUCKET}/${objectKey}`;
    const signature = crypto.createHmac('sha1', accessKeySecret).update(stringToSign).digest('base64');
    const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
    return new Promise((resolve, reject) => {
        const request = https.request({
            host: `${BUCKET}.${REGION}.aliyuncs.com`,
            agent: false,
            method: 'PUT',
            path: `/${encodedKey}`,
            headers: {
                Date: date,
                'Content-Type': mime,
                'Content-Length': body.length,
                'Cache-Control': cacheControl,
                'x-oss-object-acl': 'private',
                ...(publishShare ? { 'x-oss-forbid-overwrite': 'true' } : {}),
                Authorization: `OSS ${accessKeyId}:${signature}`,
            },
        }, (response) => {
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode < 300) resolve();
                else if (publishShare && response.statusCode === 409) resolve(); // 不覆盖同名对象，随后校验 CDN 内容。
                else reject(new Error(`上传 ${objectKey} 失败：HTTP ${response.statusCode} ${Buffer.concat(chunks).toString('utf8').slice(0, 300)}`));
            });
        });
        request.on('error', reject);
        request.setTimeout(20000, () => request.destroy(new Error(`上传超时：${objectKey}`)));
        request.end(body);
    });
}

async function main() {
    const env = loadEnv(envPath);
    const accessKeyId = env.OSS_ACCESS_KEY_ID || '';
    const accessKeySecret = env.OSS_ACCESS_KEY_SECRET || '';
    if (!accessKeyId || !accessKeySecret) throw new Error('.oss.local.env 里缺少 OSS_ACCESS_KEY_ID 或 OSS_ACCESS_KEY_SECRET');
    if (env.OSS_BUCKET && env.OSS_BUCKET !== BUCKET) throw new Error(`只允许上传到 ${BUCKET}`);
    if (env.OSS_REGION && env.OSS_REGION !== REGION) throw new Error(`只允许上传到 ${REGION}`);
    if (!fs.existsSync(remoteRoot)) throw new Error(`资源目录不存在：${remoteRoot}`);

    const cards = publishShare ? JSON.parse(fs.readFileSync(path.join(remoteRoot, 'manifest.json'), 'utf8')) : [];
    if (publishShare && (cards.length !== 3 || new Set(cards.map(card => card.file)).size !== 3)) {
        throw new Error('分享清单必须包含三张不同图片');
    }
    const files = publishShare ? cards.map(card => {
        if (!/^(burst|comeback|rank)\.[a-f0-9]{12}\.jpg$/.test(card.file)) throw new Error('分享图片文件名无效');
        const file = path.join(remoteRoot, card.file);
        const body = fs.readFileSync(file);
        const hash = crypto.createHash('sha256').update(body).digest('hex');
        if (hash !== card.sha256 || body.length !== card.bytes || card.width !== 500 || card.height !== 400
            || body.length > 96 * 1024 || card.imageUrl !== `https://cdn.tcjstory.cn/${KEY_PREFIX}${card.file}`) {
            throw new Error(`分享图片与清单不一致：${card.file}`);
        }
        return file;
    }) : walk(remoteRoot);
    if (files.length === 0) throw new Error('remote 目录是空的');
    for (const filePath of files) {
        const relative = path.relative(remoteRoot, filePath).split(path.sep).join('/');
        if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`非法路径：${relative}`);
        const objectKey = `${KEY_PREFIX}${relative}`;
        if (!objectKey.startsWith(KEY_PREFIX)) throw new Error(`拒绝写入前缀之外：${objectKey}`);
        await putObject(accessKeyId, accessKeySecret, objectKey, fs.readFileSync(filePath), contentType(filePath));
        console.log(`uploaded ${objectKey}`);
    }
    if (publishShare) {
        for (const card of cards) {
            const response = await fetch(card.imageUrl, {
                headers: { Referer: 'https://servicewechat.com/wxdc39c78bfd045896/0/page-frame.html' },
                signal: AbortSignal.timeout(20000),
            });
            const body = Buffer.from(await response.arrayBuffer());
            if (!response.ok || crypto.createHash('sha256').update(body).digest('hex') !== card.sha256) {
                throw new Error(`CDN 分享图片校验失败：${card.file} (HTTP ${response.status})`);
            }
            console.log(`verified ${card.imageUrl} (${card.bytes} bytes, WeChat Referer)`);
        }
    }
    console.log(`完成：${files.length} 个文件已上传到 oss://${BUCKET}/${KEY_PREFIX}`);
    console.log('旧文件未删除。');
}

main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});
