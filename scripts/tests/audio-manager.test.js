const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
let audioSource, assetSource;
const flush = () => new Promise(setImmediate);
test.before(() => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-audio-'));
    try {
        execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/manager/AudioManager.ts',
            '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck'], {stdio: 'pipe'});
    } catch (_) { /* 独立编译不载入Cocos类型，测试生成产物。 */ }
    audioSource = fs.readFileSync(path.join(out, 'AudioManager.js'), 'utf8');
    assetSource = fs.readFileSync(path.join(out, 'AssetLoader.js'), 'utf8');
});

function harness(browser = false, previewOwner = true) {
    const pending = [], active = new Map(), callbacks = new Map(), listeners = {}, appListeners = {}, docListeners = {};
    const settings = {soundEnabled: true, soundVolume: 0.7};
    let nextId = 1, musicId = -1, focused = true, settingsListener = null;
    const engine = {
        AudioState: {PLAYING: 1, PAUSED: 2, STOPPED: 3},
        getState: id => active.get(id)?.state ?? -1,
        stop(id) {active.delete(id);},
        playMusic(clip, loop) {
            active.delete(musicId); musicId = nextId++;
            active.set(musicId, {clip, loop, state: 1}); return musicId;
        },
        setFinishCallback(id, cb) {callbacks.set(id, cb);},
        setMusicVolume() {}, setEffectsVolume() {}, stopAllEffects() {},
        pause(id) {if (active.has(id)) active.get(id).state = 2;},
        resume(id) {if (active.has(id)) active.get(id).state = 1;},
    };
    const doc = {hidden: false, hasFocus: () => focused,
        addEventListener: (e, cb) => docListeners[e] = cb, removeEventListener: e => delete docListeners[e]};
    const exports = {};
    vm.runInNewContext(audioSource, {exports,
        cc: {audioEngine: engine, sys: {isBrowser: browser}, warn() {},
            game: {EVENT_HIDE: 'hide', EVENT_SHOW: 'show', on: (e, cb) => appListeners[e] = cb, off: e => delete appListeners[e]}},
        window: {__zyxPreviewAudioGranted: previewOwner,
            addEventListener: (e, cb) => listeners[e] = cb, removeEventListener: e => delete listeners[e]},
        document: doc,
        require: name => name.endsWith('GameSettings') ? {gameSettings: {...settings,
            get soundEnabled() {return settings.soundEnabled;}, get soundVolume() {return settings.soundVolume;},
            onAudioChange: cb => {settingsListener = cb; return () => settingsListener = null;}}} : {
            ASSET_PATHS: {game: {}}, loadMusicClip: name => new Promise((resolve, reject) => pending.push({name, resolve, reject})),
        },
    });
    return {audio: new exports.default(), pending, active, callbacks, listeners, appListeners, docListeners, doc,
        focus: value => focused = value, settings, changed: () => settingsListener?.()};
}

test('切换页面立即停旧轨，过期异步加载不能复活；同一页面只保留一个原生循环', async () => {
    const {audio, pending, active, callbacks} = harness();
    audio.enterScene('home'); pending[0].resolve('home'); await flush(); assert.equal(active.size, 1);
    audio.enterScene('game'); assert.equal(active.size, 0);
    audio.enterScene('home'); pending[1].resolve('stale-game'); await flush(); assert.equal(active.size, 0);
    pending[2].resolve('current-home'); await flush();
    assert.equal(active.size, 1); assert.equal([...active.values()][0].clip, 'current-home');
    audio.enterScene('home'); audio.enterScene('home'); assert.equal(pending.length, 3);
    assert.ok([...callbacks.values()].every(cb => cb === null));
    audio.enterScene('silent'); assert.equal(active.size, 0); assert.equal(audio.currentMusic, null);
});

test('音乐加载期间暂停，回执只缓存；点击继续才首次播放，不重复下载', async () => {
    const {audio, pending, active} = harness();
    audio.enterScene('game'); audio.setGamePaused(true); pending[0].resolve('game'); await flush();
    assert.equal(active.size, 0);
    audio.setGamePaused(false); assert.equal(active.size, 1); assert.equal(pending.length, 1);
});

test('暂停、静音和后台状态共同限制恢复；聚焦或微信onShow不能越过暂停和结算', async () => {
    const {audio, pending, active, listeners, appListeners, settings, changed, focus} = harness(true);
    audio.enterScene('game'); pending[0].resolve('game'); await flush(); const id = [...active.keys()][0];
    audio.setGamePaused(true); assert.equal(active.get(id).state, 2);
    focus(false); listeners.blur(); focus(true); listeners.focus(); assert.equal(active.get(id).state, 2);
    appListeners.hide(); appListeners.show(); assert.equal(active.get(id).state, 2);
    settings.soundEnabled = false; changed(); audio.setGamePaused(false); assert.equal(active.get(id).state, 2);
    settings.soundEnabled = true; changed(); assert.equal(active.get(id).state, 1);
    settings.soundVolume = 0; changed(); assert.equal(active.get(id).state, 2);
    appListeners.hide(); settings.soundVolume = 0.7; changed(); assert.equal(active.get(id).state, 2);
    appListeners.show(); assert.equal(active.get(id).state, 1);
    audio.enterScene('silent'); listeners.focus(); appListeners.show(); assert.equal(active.size, 0);
});

test('销毁取消待加载音乐并移除监听，新组件可重新初始化且没有重复回调', async () => {
    const {audio, pending, active, listeners, appListeners, docListeners} = harness(true);
    audio.enterScene('game'); audio.dispose(); pending[0].resolve('stale'); await flush();
    assert.equal(active.size, 0); assert.equal(Object.keys(listeners).length, 0);
    assert.equal(Object.keys(appListeners).length, 0); assert.equal(Object.keys(docListeners).length, 0);
    audio.enterScene('home'); pending[1].resolve('home'); await flush();
    assert.equal(active.size, 1); assert.equal(Object.keys(listeners).length, 3);
});

test('气球演示的静音不会加载或播放BGM，用户主动试听后才开始', async () => {
    const {audio, pending, active} = harness(); audio.initialize(); audio.setPreviewMuted(true); audio.enterScene('game');
    assert.equal(pending.length, 0); assert.equal(active.size, 0);
    audio.setPreviewMuted(false); assert.equal(pending.length, 1); pending[0].resolve('game'); await flush();
    assert.equal(active.size, 1); audio.setPreviewMuted(true); assert.equal([...active.values()][0].state, 2);
});

test('预览未取得播放权不得加载；失去播放权后焦点、前台和迟到加载都不能恢复音乐', async () => {
    const {audio, pending, active, listeners, appListeners} = harness(true, false);
    audio.enterScene('home'); assert.equal(pending.length, 0);
    audio.setPreviewAudioOwner(true); assert.equal(pending.length, 1);
    audio.setPreviewAudioOwner(false);
    pending[0].resolve('home'); await flush(); assert.equal(active.size, 0);
    listeners.focus(); appListeners.show(); assert.equal(active.size, 0);
    audio.setPreviewAudioOwner(true); assert.equal(active.size, 1);
    audio.setPreviewAudioOwner(false); assert.equal([...active.values()][0].state, 2);
    listeners.focus(); appListeners.show(); assert.equal([...active.values()][0].state, 2);
    audio.setPreviewAudioOwner(true); assert.equal([...active.values()][0].state, 1);
    assert.equal(pending.length, 1);
});

test('背景音乐必须等native音频就绪后才能交给播放器，元数据就绪不能提前播放', async () => {
    class AudioClip {} class SpriteFrame {}
    const clip = new AudioClip(); clip.loaded = false;
    let finishNative, ready = false;
    const exports = {};
    vm.runInNewContext(assetSource, {exports, Promise, cc: {AudioClip, SpriteFrame,
        assetManager: {getBundle: () => ({get: () => clip}), postLoadNative(asset, done) {
            assert.equal(asset, clip); finishNative = done;
        }}}});
    const loading = exports.loadMusicClip('game').then(result => {ready = true; return result;});
    await flush(); assert.equal(ready, false); assert.equal(typeof finishNative, 'function');
    clip.loaded = true; finishNative(null); assert.equal(await loading, clip); assert.equal(ready, true);
});
