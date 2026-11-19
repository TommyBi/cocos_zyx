const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
let UIManager, bitmap;
const SHRINK = 2, NONE = 0;
test.before(() => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-typography-'));
    try {
        execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/manager/UIManager.ts',
            '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck'], { stdio: 'pipe' });
    } catch (_) { /* Cocos 类型由运行时桩提供。 */ }
    class BitmapFont {}
    bitmap = Object.assign(new BitmapFont(), { fontSize: 48,
        _fntConfig: { fontDefDictionary: Object.fromEntries(Array.from('分享好友清空色块一二三', c => [c.codePointAt(0), {}])) } });
    const exports = {};
    vm.runInNewContext(fs.readFileSync(path.join(out, 'UIManager.js'), 'utf8'), {
        exports, cc: { BitmapFont, Color: class {}, Label: { Overflow: { SHRINK, NONE }, CacheMode: { NONE } } },
        require: name => name.endsWith('AssetLoader') ? {
            ASSET_PATHS: { game: {}, home: {} }, isTypographyReady: () => true,
            isFeatureReady: () => true, getBitmapFont: () => bitmap, getTTFFont: () => ({ name: 'body' }),
        } : {},
    });
    UIManager = exports.default;
});

test('两行BMFont保持业务行距，重复绑定不叠加补偿，字号缩小时行距同比缩小', () => {
    const ui = new UIManager();
    const label = { string: '分享好友\n清空色块', fontSize: 26, lineHeight: 34, overflow: SHRINK };
    const renderedLeading = () => label.lineHeight * label.fontSize / bitmap.fontSize;
    ui.applyTypography(label);
    assert.equal(renderedLeading(), 34);
    ui.applyTypography(label); ui.applyTypography(label);
    assert.equal(renderedLeading(), 34);
    label.fontSize = 13;
    assert.equal(renderedLeading(), 17);
});

test('自定义行距、换成动态字体或NONE布局再切回时，还原原始设计行距', () => {
    const ui = new UIManager();
    const label = { string: '一\n二\n三', fontSize: 24, lineHeight: 32, overflow: SHRINK };
    ui.applyTypography(label);
    label.lineHeight = 40; ui.applyTypography(label);
    assert.equal(label.lineHeight * label.fontSize / bitmap.fontSize, 40);
    label.string = '𠮷\n😀'; ui.applyTypography(label);
    assert.equal(label.font.name, 'body'); assert.equal(label.lineHeight, 40);
    label.string = '一\n二\n三'; ui.applyTypography(label);
    assert.equal(label.lineHeight * label.fontSize / bitmap.fontSize, 40);
    label.overflow = NONE; ui.applyTypography(label);
    assert.equal(label.lineHeight, 40);
    label.overflow = SHRINK; ui.applyTypography(label);
    assert.equal(label.lineHeight * label.fontSize / bitmap.fontSize, 40);
});
