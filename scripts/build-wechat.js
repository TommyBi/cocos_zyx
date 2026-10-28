/**
 * 微信小游戏构建编排：先物理剥离 GM 代码，再执行 Creator 构建，最后恢复源码并验收产物。
 *
 * 无论构建成功/失败/中断返回，GM 源码都会被恢复（finally），不会破坏工作区。
 * 产物验收：分包结构检查（prepare-wechat-build.js）+ GM 字符串检查（check-wechat-gm.js）。
 */
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const { hideGmCode, restoreGmCode } = require('./strip-gm-code');

const repoRoot = path.resolve(__dirname, '..');
const CREATOR_BIN = '/Applications/Cocos/Creator/2.4.13/CocosCreator.app/Contents/MacOS/CocosCreator';
const BUILD_ARGS = 'platform=wechatgame;debug=false;md5Cache=true;appid=wxdc39c78bfd045896';

hideGmCode(repoRoot);
let buildStatus = 0;
try {
    const env = Object.assign({}, process.env);
    delete env.ELECTRON_RUN_AS_NODE;
    const result = spawnSync(CREATOR_BIN, ['--path', '.', '--build', BUILD_ARGS, '--nologin', '--force'], {
        cwd: repoRoot,
        stdio: 'inherit',
        env,
    });
    if (result.error) {
        console.error(`Creator 构建启动失败：${result.error.message}`);
        buildStatus = 1;
    } else {
        buildStatus = result.status === null ? 1 : result.status;
    }
} finally {
    restoreGmCode(repoRoot);
}

if (buildStatus !== 0) {
    console.error(`微信构建失败（exit ${buildStatus}）`);
    process.exit(buildStatus);
}

// 产物验收：分包/体积/远程 Bundle 检查，再执行 GM 字符串检查。
execFileSync(process.execPath, [path.join(__dirname, 'prepare-wechat-build.js')], { cwd: repoRoot, stdio: 'inherit' });
execFileSync(process.execPath, [path.join(__dirname, 'check-wechat-gm.js')], { cwd: repoRoot, stdio: 'inherit' });
