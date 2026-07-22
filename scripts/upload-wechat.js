const fs = require('fs');
const path = require('path');
const os = require('os');
const childProcess = require('child_process');
const ci = require('miniprogram-ci');

const appid = 'wxdc39c78bfd045896';
const projectRoot = path.resolve(__dirname, '..');
const projectPath = path.resolve(__dirname, '..', 'build', 'wechatgame');
const privateKeyPath = process.env.WX_PRIVATE_KEY_PATH
  || '/Users/liuyang/Downloads/chromeDownload/private.wxdc39c78bfd045896.key';
const devtoolsCli = process.env.WX_DEVTOOLS_CLI
  || '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';
const args = process.argv.slice(2);

function defaultVersion() {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `0.1.${stamp}`;
}

async function main() {
  if (!fs.existsSync(projectPath)) {
    throw new Error(`Build output not found: ${projectPath}`);
  }
  const useDevtools = args.includes('--devtools') || process.env.WX_UPLOAD_TOOL === 'devtools';
  const prepareOnly = args.includes('--prepare-only');

  prepareBuild(useDevtools ? 'devtools' : 'ci');

  if (prepareOnly) {
    console.log(`Prepared WeChat build: ${projectPath}`);
    return;
  }

  if (useDevtools) {
    uploadWithDevtools();
    return;
  }

  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`Private key not found: ${privateKeyPath}`);
  }

  const version = resolveVersion();
  const desc = resolveDesc();

  const project = new ci.Project({
    appid,
    type: 'miniGame',
    projectPath,
    privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  await ci.upload({
    project,
    version,
    desc,
    setting: {
      es6: true,
      minify: true,
    },
    onProgressUpdate: (info) => {
      if (info && info.message) console.log(info.message);
    },
  });

  console.log(`Uploaded ${appid} ${version}`);
}

function resolveVersion() {
  const versionArgIndex = args.findIndex((arg) => arg === '--version' || arg === '-v');
  if (versionArgIndex >= 0 && args[versionArgIndex + 1]) return args[versionArgIndex + 1];
  const positional = args.find((arg) => !arg.startsWith('--') && arg !== 'ci');
  return process.env.WX_UPLOAD_VERSION || positional || defaultVersion();
}

function resolveDesc() {
  const descArgIndex = args.findIndex((arg) => arg === '--desc' || arg === '-d');
  if (descArgIndex >= 0 && args[descArgIndex + 1]) return args[descArgIndex + 1];
  return process.env.WX_UPLOAD_DESC || '消除烦恼功能迭代';
}

function prepareBuild(tool) {
  normalizeProjectConfig(tool);
  const patchedCount = patchMissingTextureImports();
  if (patchedCount > 0) {
    console.log(`Patched ${patchedCount} missing texture import files.`);
  }
}

function normalizeProjectConfig(tool) {
  const configPath = path.join(projectPath, 'project.config.json');
  if (!fs.existsSync(configPath)) return;

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.libVersion = process.env.WX_LIB_VERSION || process.env.WX_CI_LIB_VERSION || 'latest';
  config.appid = appid;
  config.compileType = 'game';
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

function patchMissingTextureImports() {
  const assetsRoot = path.join(projectRoot, 'assets', 'resources');
  const metas = listFiles(assetsRoot).filter((filePath) => /\.(png|jpe?g)\.meta$/i.test(filePath));
  let patchedCount = 0;

  for (const metaPath of metas) {
    let meta;
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch (error) {
      continue;
    }
    if (!meta || meta.importer !== 'texture' || !meta.uuid) continue;

    const assetPath = metaPath.slice(0, -'.meta'.length);
    const ext = path.extname(assetPath).slice(1).toLowerCase();
    const assetName = path.basename(assetPath, path.extname(assetPath));
    const uuid = meta.uuid;
    const prefix = uuid.slice(0, 2);
    const nativePath = path.join(projectPath, 'remote', 'resources', 'native', prefix, `${uuid}.${ext}`);
    const importPath = path.join(projectPath, 'remote', 'resources', 'import', prefix, `${uuid}.json`);

    if (!fs.existsSync(nativePath) || fs.existsSync(importPath)) continue;

    fs.mkdirSync(path.dirname(importPath), { recursive: true });
    const payload = [
      1,
      0,
      0,
      [['cc.Texture2D', ['_name', '_native'], 0]],
      [[0, 0, 1, 2]],
      [[0, assetName, `.${ext}`], -1],
      0,
      0,
      [],
      [],
      [],
    ];
    fs.writeFileSync(importPath, JSON.stringify(payload));
    patchedCount += 1;
  }

  return patchedCount;
}

function uploadWithDevtools() {
  if (!fs.existsSync(devtoolsCli)) {
    throw new Error(`WeChat DevTools CLI not found: ${devtoolsCli}`);
  }

  const uploadPath = path.join(os.tmpdir(), `xiaochu-fannao-upload-${appid}`);
  fs.rmSync(uploadPath, { recursive: true, force: true });
  fs.cpSync(projectPath, uploadPath, { recursive: true });

  const result = childProcess.spawnSync(devtoolsCli, [
    'upload',
    '--project',
    uploadPath,
    '--version',
    resolveVersion(),
    '--desc',
    resolveDesc(),
    '--lang',
    'zh',
  ], { encoding: 'utf8' });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  const cliOutput = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (cliOutput.includes('✖') || cliOutput.includes('[error]')) {
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function listFiles(rootPath) {
  const results = [];
  if (!fs.existsSync(rootPath)) return results;
  for (const name of fs.readdirSync(rootPath)) {
    const filePath = path.join(rootPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results.push(...listFiles(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
