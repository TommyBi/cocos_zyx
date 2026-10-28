/**
 * R0 客户端侧：GM 只允许出现在「Web 平台 + Debug 构建」。
 *
 * 双保险：
 * - 运行时：GmAccess.isGmEnvironmentAvailable 必须同时要求 CC_DEBUG 与 cc.sys.isBrowser；
 * - 构建时：全部 GM UI/云接口/文案隔离在 assets/script/gm/，微信构建前由
 *   scripts/strip-gm-code.js 物理剥离，产物经 scripts/check-wechat-gm.js 验收。
 *
 * 运行：npm run test:module（仓库根目录）
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
const gmAccessSource = path.join(repoRoot, 'assets', 'script', 'manager', 'GmAccess.ts');
const mainSceneSource = path.join(repoRoot, 'assets', 'script', 'GameMainScene.ts');
const settingsPanelSource = path.join(repoRoot, 'assets', 'script', 'manager', 'SettingsPanel.ts');
const cloudServiceSource = path.join(repoRoot, 'assets', 'script', 'manager', 'CloudService.ts');
const gmDir = path.join(repoRoot, 'assets', 'script', 'gm');
const packageJsonPath = path.join(repoRoot, 'package.json');

const { hideGmCode, restoreGmCode } = require('../strip-gm-code');
const { scanForGmKeywords, GM_FORBIDDEN_KEYWORDS } = require('../check-wechat-gm');

let gmAccess;

function installCcStub(isBrowser) {
  global.cc = {
    sys: { isBrowser },
    log: () => {},
    warn: () => {},
  };
}

test.before(() => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-gm-test-'));
  try {
    execFileSync('npx', [
      '--yes', '-p', 'typescript@4.9.5', 'tsc', gmAccessSource,
      '--outDir', outDir,
      '--module', 'commonjs',
      '--target', 'es2017',
      '--skipLibCheck',
    ], { stdio: 'pipe' });
  } catch (error) {
    // 以产物为准。
  }
  const compiled = path.join(outDir, 'GmAccess.js');
  assert.ok(fs.existsSync(compiled), `tsc 未产出 ${compiled}`);
  gmAccess = require(compiled);
});

test.afterEach(() => {
  delete global.CC_DEBUG;
  delete global.cc;
});

test('CC_DEBUG 未定义（微信正式/体验版构建）时 GM 不可用', () => {
  installCcStub(true);
  assert.strictEqual(gmAccess.isGmEnvironmentAvailable(), false);
});

test('CC_DEBUG=false 的 Web 正式构建 GM 不可用', () => {
  installCcStub(true);
  global.CC_DEBUG = false;
  assert.strictEqual(gmAccess.isGmEnvironmentAvailable(), false);
});

test('CC_DEBUG=true 但非浏览器（微信小游戏开发版）GM 不可用', () => {
  installCcStub(false);
  global.CC_DEBUG = true;
  assert.strictEqual(gmAccess.isGmEnvironmentAvailable(), false);
});

test('仅 Web Debug（CC_DEBUG=true 且 isBrowser）GM 可用', () => {
  installCcStub(true);
  global.CC_DEBUG = true;
  assert.strictEqual(gmAccess.isGmEnvironmentAvailable(), true);
});

test('GameMainScene.onLoad 只在 GM 环境守卫内动态加载 GM 气泡模块', () => {
  const source = fs.readFileSync(mainSceneSource, 'utf8');
  assert.ok(
    /if \(isGmEnvironmentAvailable\(\)\) \{[\s\S]*?require\('\.\/gm\/GmBubble'\)/.test(source),
    'GM 气泡必须在 isGmEnvironmentAvailable() 守卫内通过动态 require 加载',
  );
  // 静态 import 会让微信构建把 GM 代码打进主包，必须禁止。
  assert.ok(
    !/import\s+.*from\s+'\.\/gm\//.test(source) && !/import\s+.*from\s+'\.\.\/gm\//.test(source),
    'GameMainScene 不得静态 import gm/ 目录',
  );
});

test('普通设置面板不包含任何 GM 入口', () => {
  const source = fs.readFileSync(settingsPanelSource, 'utf8');
  const showMatch = source.match(/public show\(options[\s\S]*?\n    \}/);
  assert.ok(showMatch, '未找到 SettingsPanel.show');
  const body = showMatch[0];
  assert.ok(!body.includes('showGm'), '普通设置面板不得引用 GM 面板');
  for (const keyword of GM_FORBIDDEN_KEYWORDS) {
    assert.ok(!source.includes(keyword), `SettingsPanel 不得包含 GM 关键词：${keyword}`);
  }
  assert.ok(!source.includes('grantMoodBeans'), '普通设置面板不得包含 GM 发放按钮');
});

test('GM 敏感字符串只存在于 assets/script/gm/ 目录', () => {
  assert.ok(fs.existsSync(gmDir), 'GM 代码必须隔离在 assets/script/gm/');
  const scriptRoot = path.join(repoRoot, 'assets', 'script');
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (absolute === gmDir) continue; // gm/ 是白名单
        walk(absolute);
        continue;
      }
      if (!entry.name.endsWith('.ts')) continue;
      const content = fs.readFileSync(absolute, 'utf8');
      for (const keyword of GM_FORBIDDEN_KEYWORDS) {
        if (content.includes(keyword)) offenders.push(`${absolute}: ${keyword}`);
      }
    }
  };
  walk(scriptRoot);
  assert.deepStrictEqual(offenders, [], `gm/ 之外检出 GM 关键词：\n${offenders.join('\n')}`);
});

test('CloudService 不携带调试路由路径，只提供通用已认证入口', () => {
  const source = fs.readFileSync(cloudServiceSource, 'utf8');
  for (const keyword of GM_FORBIDDEN_KEYWORDS) {
    assert.ok(!source.includes(keyword), `CloudService 不得包含 GM 关键词：${keyword}`);
  }
  assert.ok(
    /public async postAuthenticated\(/.test(source),
    'CloudService 必须提供 postAuthenticated 供 gm/ 调试模块使用',
  );
});

test('微信构建脚本串联 GM 剥离与产物字符串检查', () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  assert.ok(
    pkg.scripts['build:wechat'].includes('build-wechat.js'),
    'build:wechat 必须由 scripts/build-wechat.js 编排',
  );
  const orchestrator = fs.readFileSync(path.join(repoRoot, 'scripts', 'build-wechat.js'), 'utf8');
  assert.ok(orchestrator.includes('hideGmCode'), '构建前必须剥离 GM 代码');
  assert.ok(orchestrator.includes('restoreGmCode'), '构建后必须恢复 GM 代码');
  assert.ok(orchestrator.includes('check-wechat-gm.js'), '构建后必须执行产物 GM 字符串检查');
});

test('strip-gm-code：hide 移出 gm 目录并清理缓存，restore 完整恢复', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-gm-strip-'));
  const gmFixtureDir = path.join(fixture, 'assets', 'script', 'gm');
  fs.mkdirSync(gmFixtureDir, { recursive: true });
  fs.writeFileSync(path.join(gmFixtureDir, 'GmBubble.ts'), '// gm');
  fs.writeFileSync(path.join(fixture, 'assets', 'script', 'gm.meta'), '{}');
  const cacheDir = path.join(fixture, 'temp', 'quick-scripts', 'dst', 'assets', 'script', 'gm');
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(path.join(cacheDir, 'GmBubble.js'), '// stale');

  hideGmCode(fixture);
  assert.ok(!fs.existsSync(gmFixtureDir), 'hide 后 gm 目录必须离开 assets');
  assert.ok(!fs.existsSync(cacheDir), 'hide 必须清理 quick-scripts 旧缓存');
  assert.ok(fs.existsSync(path.join(fixture, '.gm-quarantine', 'gm', 'GmBubble.ts')), '隔离区保留源码');

  const restored = restoreGmCode(fixture);
  assert.strictEqual(restored, true);
  assert.ok(fs.existsSync(path.join(gmFixtureDir, 'GmBubble.ts')), 'restore 后 gm 目录恢复');
  assert.ok(fs.existsSync(path.join(fixture, 'assets', 'script', 'gm.meta')), 'restore 后 gm.meta 恢复');
  assert.ok(!fs.existsSync(path.join(fixture, '.gm-quarantine')), '隔离区清空');
  // 重复 restore 幂等。
  assert.strictEqual(restoreGmCode(fixture), false);
});

test('check-wechat-gm：产物含 GM 关键词时检出，干净产物通过', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-gm-check-'));
  fs.writeFileSync(path.join(fixture, 'game.js'), 'var a = 1;');
  assert.deepStrictEqual(scanForGmKeywords(fixture), [], '干净产物不得有误报');

  fs.writeFileSync(path.join(fixture, 'dirty.js'), 'this.request("/debug/profile");');
  const violations = scanForGmKeywords(fixture);
  assert.strictEqual(violations.length, 1);
  assert.strictEqual(violations[0].keyword, 'debug/profile');

  // Creator 构建会把非 ASCII 字符串转义为 \uXXXX，转义形式同样必须检出。
  fs.writeFileSync(path.join(fixture, 'escaped.js'), 'showModal("GM \\u8865\\u7ed9");');
  const escapedViolations = scanForGmKeywords(fixture);
  assert.ok(escapedViolations.some((item) => item.keyword === 'GM 补给'), '转义形式的中文关键词必须检出');
});
