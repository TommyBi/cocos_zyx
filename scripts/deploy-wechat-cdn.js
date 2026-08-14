const fs = require('fs');
const https = require('https');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { manifestPath, readAndVerifyManifest, remoteRoot, stageRelease } = require('./lib/wechat-cdn-release');

const deployHost = process.env.TCJSTORY_DEPLOY_HOST || 'root@8.134.218.234';
const deployKey = process.env.TCJSTORY_DEPLOY_KEY
    || path.join(os.homedir(), '.ssh', 'chloeedu_tcjstory_deploy');
const remoteAppRoot = process.env.TCJSTORY_APP_ROOT || '/opt/tcjstory/apps/cocos-zyx/server';
const remoteReleaseRoot = '/opt/tcjstory/apps/cocos-zyx/releases';

function run(command, args, options = {}) {
    const result = spawnSync(command, args, Object.assign({ encoding: 'utf8', stdio: 'inherit' }, options));
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${command} 退出码 ${result.status}`);
}

function sshArgs() {
    return ['-i', deployKey, '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes'];
}

function quote(value) {
    return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function verifyUrl(url, expectedSha256) {
    return new Promise((resolve, reject) => {
        const hash = require('crypto').createHash('sha256');
        const request = https.get(url, (response) => {
            if (response.statusCode !== 200) {
                response.resume();
                reject(new Error(`HTTP ${response.statusCode}: ${url}`));
                return;
            }
            response.on('data', (chunk) => hash.update(chunk));
            response.on('end', () => {
                const actual = hash.digest('hex');
                if (actual !== expectedSha256) {
                    reject(new Error(`CDN SHA-256 不一致：${url}`));
                    return;
                }
                const cacheControl = String(response.headers['cache-control'] || '');
                const resourcePolicy = String(response.headers['cross-origin-resource-policy'] || '');
                if (cacheControl.indexOf('immutable') < 0 || resourcePolicy !== 'cross-origin') {
                    reject(new Error(`CDN 响应头不符合版本化资源要求：${url}`));
                    return;
                }
                resolve();
            });
        });
        request.setTimeout(20000, () => request.destroy(new Error(`CDN 请求超时：${url}`)));
        request.on('error', reject);
    });
}

async function main() {
    stageRelease();
    const manifest = readAndVerifyManifest();
    if (manifest.files.length === 0) {
        console.log('No remote bundles in this build; CDN deployment is not required.');
        return;
    }
    if (!fs.existsSync(deployKey)) throw new Error(`部署密钥不存在：${deployKey}`);
    const releaseDir = `${remoteReleaseRoot}/cdn-${manifest.releaseId}`;
    const checksums = manifest.files.map((file) => `${file.sha256}  ${file.path}`).join('\n') + '\n';

    run('ssh', [...sshArgs(), deployHost, `mkdir -p ${quote(`${releaseDir}/remote`)} ${quote(`${remoteAppRoot}/cdn/remote`)} ${quote(`${remoteAppRoot}/cdn/releases`)}`]);
    run('rsync', ['-az', '--checksum', '-e', `ssh -i ${quote(deployKey)} -o BatchMode=yes -o StrictHostKeyChecking=yes`, `${remoteRoot}/`, `${deployHost}:${releaseDir}/remote/`]);
    run('rsync', ['-az', '-e', `ssh -i ${quote(deployKey)} -o BatchMode=yes -o StrictHostKeyChecking=yes`, manifestPath, `${deployHost}:${releaseDir}/manifest.json`]);

    run('ssh', [...sshArgs(), deployHost, `cd ${quote(releaseDir)} && sha256sum -c -`], {
        input: checksums,
        stdio: ['pipe', 'inherit', 'inherit'],
    });
    run('ssh', [...sshArgs(), deployHost,
        `cp -a ${quote(`${releaseDir}/remote/.`)} ${quote(`${remoteAppRoot}/cdn/remote/`)} && cp ${quote(`${releaseDir}/manifest.json`)} ${quote(`${remoteAppRoot}/cdn/releases/${manifest.releaseId}.json`)}`]);
    run('ssh', [...sshArgs(), deployHost, `cd ${quote(`${remoteAppRoot}/cdn`)} && sha256sum -c -`], {
        input: checksums,
        stdio: ['pipe', 'inherit', 'inherit'],
    });

    const criticalPaths = [];
    Object.keys(manifest.bundles).sort().forEach((name) => {
        criticalPaths.push(manifest.bundles[name].configPath);
        if (manifest.bundles[name].zipPath) criticalPaths.push(manifest.bundles[name].zipPath);
    });
    for (const relativePath of criticalPaths) {
        const file = manifest.files.find((candidate) => candidate.path === relativePath);
        await verifyUrl(new URL(relativePath, manifest.cdnBase).toString(), file.sha256);
    }
    run('ssh', [...sshArgs(), deployHost, `rm -rf ${quote(releaseDir)}`]);
    console.log(`Deployed CDN release ${manifest.releaseId}`);
    console.log(`Verified ${manifest.files.length} files on server and ${criticalPaths.length} public entrypoints`);
}

main().catch((error) => {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
});
