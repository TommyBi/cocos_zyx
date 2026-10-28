/**
 * R0：GM 代码剥离。微信构建前把 assets/script/gm/ 物理移出 assets，构建结束后恢复。
 *
 * Cocos Creator 2.4 会把 assets 下所有脚本打进主包，仅靠运行时守卫（isGmEnvironmentAvailable）
 * 只能做到“不显示”，无法做到“不携带”；微信开发版/体验版/正式版必须连 GM 代码与字符串都没有，
 * 因此构建前物理隔离是唯一可靠方案。
 *
 * 用法：
 *   node scripts/strip-gm-code.js hide      # 移出（微信构建前）
 *   node scripts/strip-gm-code.js restore   # 恢复（构建结束后，无论成败）
 */
const fs = require('fs');
const path = require('path');

const GM_DIR_REL = path.join('assets', 'script', 'gm');
const GM_META_REL = path.join('assets', 'script', 'gm.meta');
const STASH_DIR_REL = '.gm-quarantine';
// Creator 的增量脚本缓存可能残留 gm 的旧编译产物，hide 时一并清理。
const QUICK_SCRIPT_CACHE_RELS = [
    path.join('temp', 'quick-scripts', 'dst', 'assets', 'script', 'gm'),
    path.join('temp', 'quick-scripts', 'src', 'assets', 'script', 'gm'),
];

function hideGmCode(rootDir) {
    const gmDir = path.join(rootDir, GM_DIR_REL);
    const gmMeta = path.join(rootDir, GM_META_REL);
    const stashDir = path.join(rootDir, STASH_DIR_REL);
    if (!fs.existsSync(gmDir)) {
        if (fs.existsSync(path.join(stashDir, 'gm'))) return stashDir; // 已处于剥离状态，幂等
        throw new Error(`GM 目录不存在：${gmDir}`);
    }
    if (fs.existsSync(stashDir)) throw new Error(`隔离目录已存在，请先 restore：${stashDir}`);
    fs.mkdirSync(stashDir, { recursive: true });
    fs.renameSync(gmDir, path.join(stashDir, 'gm'));
    if (fs.existsSync(gmMeta)) fs.renameSync(gmMeta, path.join(stashDir, 'gm.meta'));
    for (const rel of QUICK_SCRIPT_CACHE_RELS) {
        fs.rmSync(path.join(rootDir, rel), { recursive: true, force: true });
    }
    return stashDir;
}

function restoreGmCode(rootDir) {
    const gmDir = path.join(rootDir, GM_DIR_REL);
    const gmMeta = path.join(rootDir, GM_META_REL);
    const stashDir = path.join(rootDir, STASH_DIR_REL);
    const stashedGm = path.join(stashDir, 'gm');
    if (!fs.existsSync(stashedGm)) return false; // 没有剥离过，幂等
    if (fs.existsSync(gmDir)) throw new Error(`GM 目录已存在，无法恢复：${gmDir}`);
    fs.renameSync(stashedGm, gmDir);
    const stashedMeta = path.join(stashDir, 'gm.meta');
    if (fs.existsSync(stashedMeta)) fs.renameSync(stashedMeta, gmMeta);
    fs.rmSync(stashDir, { recursive: true, force: true });
    return true;
}

module.exports = { hideGmCode, restoreGmCode, GM_DIR_REL, STASH_DIR_REL };

if (require.main === module) {
    const action = process.argv[2];
    const rootDir = path.resolve(__dirname, '..');
    if (action === 'hide') {
        hideGmCode(rootDir);
        console.log('GM code hidden: assets/script/gm -> .gm-quarantine/');
    } else if (action === 'restore') {
        const restored = restoreGmCode(rootDir);
        console.log(restored ? 'GM code restored: .gm-quarantine/ -> assets/script/gm' : 'GM code was not hidden, nothing to restore');
    } else {
        console.error('用法：node scripts/strip-gm-code.js hide|restore');
        process.exit(1);
    }
}
