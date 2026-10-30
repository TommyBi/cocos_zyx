/**
 * 把微信构建出的 remote 目录上传到游戏自己的 OSS 桶。
 * 对象键固定为 cocos-zyx/remote/...，对应 https://cdn.tcjstory.cn/cocos-zyx/remote/...
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
const remoteRoot = path.join(repoRoot, 'build', 'wechatgame', 'remote');
const BUCKET = 'tcjstory-cocos-zyx';
const REGION = 'oss-cn-beijing';
const KEY_PREFIX = 'cocos-zyx/remote/';

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
    const canonicalHeaders = `x-oss-object-acl:private\n`;
    const stringToSign = `PUT\n\n${mime}\n${date}\n${canonicalHeaders}/${BUCKET}/${objectKey}`;
    const signature = crypto.createHmac('sha1', accessKeySecret).update(stringToSign).digest('base64');
    const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
    return new Promise((resolve, reject) => {
        const request = https.request({
            host: `${BUCKET}.${REGION}.aliyuncs.com`,
            method: 'PUT',
            path: `/${encodedKey}`,
            headers: {
                Date: date,
                'Content-Type': mime,
                'Content-Length': body.length,
                'Cache-Control': cacheControl,
                'x-oss-object-acl': 'private',
                Authorization: `OSS ${accessKeyId}:${signature}`,
            },
        }, (response) => {
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode < 300) resolve();
                else reject(new Error(`上传 ${objectKey} 失败：HTTP ${response.statusCode} ${Buffer.concat(chunks).toString('utf8').slice(0, 300)}`));
            });
        });
        request.on('error', reject);
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
    if (!fs.existsSync(remoteRoot)) throw new Error('没有 build/wechatgame/remote，请先执行 npm run build:wechat');

    const files = walk(remoteRoot);
    if (files.length === 0) throw new Error('remote 目录是空的');
    for (const filePath of files) {
        const relative = path.relative(remoteRoot, filePath).split(path.sep).join('/');
        if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`非法路径：${relative}`);
        const objectKey = `${KEY_PREFIX}${relative}`;
        if (!objectKey.startsWith(KEY_PREFIX)) throw new Error(`拒绝写入前缀之外：${objectKey}`);
        await putObject(accessKeyId, accessKeySecret, objectKey, fs.readFileSync(filePath), contentType(filePath));
        console.log(`uploaded ${objectKey}`);
    }
    console.log(`完成：${files.length} 个文件已上传到 oss://${BUCKET}/${KEY_PREFIX}`);
    console.log('旧文件未删除。');
}

main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});
