/** BoardEngine.ts 是唯一规则源；服务端 Docker 直接携带生成产物，不需要运行时编译器。 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-shared-engine-'));
try {
    execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc',
        path.join(root, 'assets/script/dataModule/BoardEngine.ts'), '--target', 'es2017',
        '--module', 'commonjs', '--outDir', temporary, '--skipLibCheck'], { stdio: 'inherit' });
    const generated = '// Generated from assets/script/dataModule/BoardEngine.ts; run npm run sync:engine.\n'
        + fs.readFileSync(path.join(temporary, 'BoardEngine.js'), 'utf8');
    const destination = path.join(root, 'server/src/boardEngine.js');
    if (process.argv.includes('--check')) {
        if (!fs.existsSync(destination) || fs.readFileSync(destination, 'utf8') !== generated) {
            throw new Error('共享棋盘规则产物过期，请运行 npm run sync:engine');
        }
    } else fs.writeFileSync(destination, generated);
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
