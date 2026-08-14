const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..', '..');
const buildRoot = path.join(projectRoot, 'build', 'wechatgame');
const remoteRoot = path.join(buildRoot, 'remote');
const settingsPath = path.join(buildRoot, 'src', 'settings.js');
const manifestPath = path.join(projectRoot, 'build', 'wechat-cdn-release-manifest.json');
const cdnRoot = path.join(projectRoot, 'server', 'cdn');
const cdnRemoteRoot = path.join(cdnRoot, 'remote');
const cdnReleaseRoot = path.join(cdnRoot, 'releases');

function readSettings() {
    if (!fs.existsSync(settingsPath)) {
        throw new Error(`微信构建设置不存在：${settingsPath}`);
    }
    const source = fs.readFileSync(settingsPath, 'utf8');
    const sandbox = { window: {} };
    vm.runInNewContext(source, sandbox, { filename: settingsPath, timeout: 1000 });
    const settings = sandbox.window._CCSettings;
    if (!settings || typeof settings !== 'object') {
        throw new Error('无法从 build/wechatgame/src/settings.js 读取 _CCSettings');
    }
    return settings;
}

function listFiles(root, current = root) {
    if (!fs.existsSync(current)) return [];
    const output = [];
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const absolutePath = path.join(current, entry.name);
        if (entry.isDirectory()) output.push(...listFiles(root, absolutePath));
        else output.push(path.relative(root, absolutePath).split(path.sep).join('/'));
    }
    return output.sort();
}

function sha256(absolutePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(absolutePath)).digest('hex');
}

function validateRemoteBundle(bundleName, version) {
    if (!/^[a-f0-9]+$/i.test(version || '')) {
        throw new Error(`远程 Bundle ${bundleName} 缺少有效的 MD5 版本号`);
    }
    const bundleRoot = path.join(remoteRoot, bundleName);
    const configName = `config.${version}.json`;
    const configPath = path.join(bundleRoot, configName);
    if (!fs.existsSync(configPath)) {
        throw new Error(`远程 Bundle 入口不存在：remote/${bundleName}/${configName}`);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.name !== bundleName) {
        throw new Error(`Bundle 配置名称不一致：期望 ${bundleName}，实际 ${config.name || '<empty>'}`);
    }
    if (fs.existsSync(path.join(bundleRoot, 'config.json')) || fs.existsSync(path.join(bundleRoot, 'res.zip'))) {
        throw new Error(`remote/${bundleName} 包含无版本入口，请保持微信构建 md5Cache=true`);
    }

    let zipPath = null;
    if (config.isZip) {
        if (!/^[a-f0-9]+$/i.test(config.zipVersion || '')) {
            throw new Error(`ZIP Bundle ${bundleName} 缺少 zipVersion`);
        }
        zipPath = `remote/${bundleName}/res.${config.zipVersion}.zip`;
        if (!fs.existsSync(path.join(buildRoot, zipPath))) {
            throw new Error(`ZIP 资源不存在：${zipPath}`);
        }
    }
    return {
        version,
        configPath: `remote/${bundleName}/${configName}`,
        zipPath,
        isZip: Boolean(config.isZip),
    };
}

function buildManifest() {
    const settings = readSettings();
    const remoteBundles = Array.isArray(settings.remoteBundles)
        ? settings.remoteBundles.slice().sort()
        : [];
    const actualBundles = (fs.existsSync(remoteRoot) ? fs.readdirSync(remoteRoot, { withFileTypes: true }) : [])
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    if (JSON.stringify(actualBundles) !== JSON.stringify(remoteBundles)) {
        throw new Error(`远程 Bundle 声明与目录不一致：settings=${remoteBundles.join(',')} files=${actualBundles.join(',')}`);
    }

    const bundles = {};
    remoteBundles.forEach((bundleName) => {
        bundles[bundleName] = validateRemoteBundle(bundleName, settings.bundleVers && settings.bundleVers[bundleName]);
    });

    const files = listFiles(remoteRoot).map((relativePath) => {
        const absolutePath = path.join(remoteRoot, relativePath);
        const stat = fs.statSync(absolutePath);
        return {
            path: `remote/${relativePath}`,
            bytes: stat.size,
            sha256: sha256(absolutePath),
        };
    });
    const releaseHash = crypto.createHash('sha256')
        .update(JSON.stringify({ bundles, files }))
        .digest('hex');

    return {
        schemaVersion: 1,
        releaseId: releaseHash.slice(0, 16),
        createdAt: new Date().toISOString(),
        cdnBase: settings.server,
        bundles,
        totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
        files,
    };
}

function writeManifest() {
    const manifest = buildManifest();
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    return manifest;
}

function readAndVerifyManifest() {
    if (!fs.existsSync(manifestPath)) {
        throw new Error('CDN 发布清单不存在，请先执行 npm run build:wechat');
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const current = buildManifest();
    if (manifest.releaseId !== current.releaseId) {
        throw new Error('CDN 发布清单与当前构建产物不一致，请重新执行 npm run build:wechat');
    }
    return manifest;
}

function copyDir(source, destination) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
        const from = path.join(source, entry.name);
        const to = path.join(destination, entry.name);
        if (entry.isDirectory()) copyDir(from, to);
        else fs.copyFileSync(from, to);
    }
}

function stageRelease() {
    const manifest = readAndVerifyManifest();
    if (manifest.files.length === 0) return { manifest, stagedManifestPath: null };
    // 版本化资源只增量合并，不删除旧文件，确保已发布客户端仍可命中旧 hash。
    copyDir(remoteRoot, cdnRemoteRoot);
    fs.mkdirSync(cdnReleaseRoot, { recursive: true });
    const stagedManifestPath = path.join(cdnReleaseRoot, `${manifest.releaseId}.json`);
    fs.copyFileSync(manifestPath, stagedManifestPath);

    manifest.files.forEach((file) => {
        const stagedPath = path.join(cdnRoot, file.path);
        if (!fs.existsSync(stagedPath) || sha256(stagedPath) !== file.sha256) {
            throw new Error(`本地 CDN 暂存校验失败：${file.path}`);
        }
    });
    return { manifest, stagedManifestPath };
}

module.exports = {
    buildRoot,
    cdnRoot,
    manifestPath,
    remoteRoot,
    readAndVerifyManifest,
    stageRelease,
    writeManifest,
};
