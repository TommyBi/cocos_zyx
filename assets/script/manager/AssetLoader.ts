/**
 * 唯一资源入口。
 *
 * Bundle 与发布位置对应：
 * - game：主包内的消除玩法贴图、短音效和动画。
 * - home：首页分包。
 * - effects：连消大图与得分图片字分包，首屏交互后后台准备。
 * - music：背景音乐远程 Bundle。微信运行时只从 CDN 下载，不进代码包，也不走 API 源站。
 * Feature 是界面加载单元，不包含背景音乐。
 *
 * 界面只能在 prepareFeature 完成后渲染，并通过 get* 同步取得资源。
 * 背景音乐由 loadMusicClip 单独加载，失败时界面仍然可用。
 */

export type BundleName = 'game' | 'home' | 'effects' | 'music';
export type FeatureName = 'game' | 'home' | 'effects' | 'leaderboard';

type AssetSpec = {
    path: string;
    type: any;
};

export const ASSET_PATHS = {
    game: {
        background: 'images/formal/game_room_bg_v3',
        hammer: 'images/formal/relief_hammer_v2',
        magicWand: 'images/formal/magic_wand_v1',
        hudMascot: 'images/formal/bean_hud_mascot_v1',
        hudGlyphs: 'images/formal/hud_glyphs_v1',
        hudFont: 'images/formal/hud_round_v1',
        uiFont: 'fonts/zyx_happy_round_ui_v1',
        rewardSpine: 'spine/get_1',
        breakSound: 'sound/sound_break',
        moveSound: 'sound/sound_move',
        hammerSound: 'sound/sound_tool1',
        bombSound: 'sound/sound_bomb_v1',
        magicWandSound: 'sound/sound_tool2',
    },
    effects: {
        comboWow: 'images/formal/combo_wow_v1',
        comboGood: 'images/formal/combo_good_v1',
        comboGreat: 'images/formal/combo_great_v1',
        comboPerfect: 'images/formal/combo_perfect_v1',
        scoreDigits: 'images/formal/score_digits_green_v1',
    },
    home: {
        background: 'images/home_studio_bg_v3',
        title: 'images/home_title_logo_v1',
        rankEntry: 'images/rank_entry_trophy_v2',
        guideHand: 'images/start_guide_hand_v3',
        leaderboardTitle: 'images/leaderboard/title_v2',
        leaderboardGold: 'images/leaderboard/podium_gold_v2',
        leaderboardSilver: 'images/leaderboard/podium_silver_v2',
        leaderboardBronze: 'images/leaderboard/podium_bronze_v2',
        leaderboardBodyFont: 'fonts/zyx_happy_round_body_v1',
        leaderboardDisplayFont: 'fonts/zyx_happy_round_display_v1',
    },
    music: {
        main: 'music_main',
        game: 'music_game',
    },
};

const bundlePromises: { [name: string]: Promise<cc.AssetManager.Bundle> } = {};
const featurePromises: { [name: string]: Promise<void> } = {};
const readyFeatures: { [name: string]: boolean } = {};
let typographyPromise: Promise<void> = null;
let typographyReady = false;

/** 首屏共享的小字库，不为首次对局下载首页完整昵称字体或贴图。 */
export function prepareTypography(): Promise<void> {
    if (typographyPromise) return typographyPromise;
    typographyPromise = loadSpecs('game', [
        { path: ASSET_PATHS.game.uiFont, type: cc.TTFFont },
    ]).then(() => { typographyReady = true; }).catch((error) => {
        typographyPromise = null;
        throw error;
    });
    return typographyPromise;
}

export function isTypographyReady(): boolean {
    return typographyReady;
}

function loadBundle(name: BundleName): Promise<cc.AssetManager.Bundle> {
    const existing = (cc.assetManager as any).getBundle
        ? (cc.assetManager as any).getBundle(name) as cc.AssetManager.Bundle
        : null;
    if (existing) return Promise.resolve(existing);
    if (bundlePromises[name]) return bundlePromises[name];

    bundlePromises[name] = new Promise<cc.AssetManager.Bundle>((resolve, reject) => {
        cc.assetManager.loadBundle(name, (error: Error, bundle: cc.AssetManager.Bundle) => {
            if (error || !bundle) {
                delete bundlePromises[name];
                reject(new Error(`[资源] Bundle ${name} 加载失败：${error ? error.message : 'unknown error'}`));
                return;
            }
            resolve(bundle);
        });
    });
    return bundlePromises[name];
}

function waitForNativeTexture<T extends cc.Asset>(
    bundleName: BundleName,
    path: string,
    type: any,
    asset: T,
): Promise<T> {
    if (type !== cc.SpriteFrame) return Promise.resolve(asset);
    const frame = asset as any as cc.SpriteFrame;
    if (frame.textureLoaded()) return Promise.resolve(asset);
    const texture = frame.getTexture();
    if (!texture) return Promise.reject(new Error(`[资源] ${bundleName}/${path} 缺少纹理引用`));

    return new Promise<T>((resolve, reject) => {
        const onLoaded = () => resolve(asset);
        frame.once('load', onLoaded);
        cc.assetManager.postLoadNative(texture, (error: Error) => {
            if (!error) return;
            frame.off('load', onLoaded);
            reject(new Error(`[资源] ${bundleName}/${path} 原生纹理加载失败：${error.message}`));
        });
    });
}

function loadAsset<T extends cc.Asset>(bundleName: BundleName, path: string, type: any): Promise<T> {
    return loadBundle(bundleName)
        .then((bundle) => new Promise<T>((resolve, reject) => {
            const cached = bundle.get(path, type) as T;
            if (cached) {
                resolve(cached);
                return;
            }
            bundle.load(path, type, (error: Error, asset: T) => {
                if (error || !asset) {
                    reject(new Error(`[资源] ${bundleName}/${path} 加载失败：${error ? error.message : 'asset is empty'}`));
                    return;
                }
                resolve(asset);
            });
        }))
        .then((asset) => waitForNativeTexture(bundleName, path, type, asset));
}

function loadSpecs(bundleName: BundleName, specs: AssetSpec[]): Promise<void> {
    return Promise.all(specs.map((spec) => loadAsset(bundleName, spec.path, spec.type)))
        .then(() => undefined);
}

function featureSpecs(feature: FeatureName): AssetSpec[] {
    // 排行榜贴图按打开行为准备，不加入首页首屏解码队列。
    if (feature === 'leaderboard') return [
        ASSET_PATHS.home.leaderboardTitle, ASSET_PATHS.home.leaderboardGold,
        ASSET_PATHS.home.leaderboardSilver, ASSET_PATHS.home.leaderboardBronze,
    ].map(path => ({ path, type: cc.SpriteFrame }));
    if (feature === 'game') {
        return [
            { path: ASSET_PATHS.game.background, type: cc.SpriteFrame },
            { path: ASSET_PATHS.game.hammer, type: cc.SpriteFrame },
            { path: ASSET_PATHS.game.magicWand, type: cc.SpriteFrame },
            { path: ASSET_PATHS.game.hudMascot, type: cc.SpriteFrame },
            { path: ASSET_PATHS.game.hudGlyphs, type: cc.SpriteFrame },
            { path: ASSET_PATHS.game.hudFont, type: cc.BitmapFont },
            { path: ASSET_PATHS.game.uiFont, type: cc.TTFFont },
            { path: ASSET_PATHS.game.rewardSpine, type: sp.SkeletonData },
            { path: ASSET_PATHS.game.breakSound, type: cc.AudioClip },
            { path: ASSET_PATHS.game.moveSound, type: cc.AudioClip },
            { path: ASSET_PATHS.game.hammerSound, type: cc.AudioClip },
            { path: ASSET_PATHS.game.bombSound, type: cc.AudioClip },
            { path: ASSET_PATHS.game.magicWandSound, type: cc.AudioClip },
        ];
    }
    if (feature === 'effects') return [
            { path: ASSET_PATHS.effects.comboWow, type: cc.SpriteFrame },
            { path: ASSET_PATHS.effects.comboGood, type: cc.SpriteFrame },
            { path: ASSET_PATHS.effects.comboGreat, type: cc.SpriteFrame },
            { path: ASSET_PATHS.effects.comboPerfect, type: cc.SpriteFrame },
            { path: ASSET_PATHS.effects.scoreDigits, type: cc.SpriteFrame },
    ];
    if (feature === 'home') {
        return [
            { path: ASSET_PATHS.home.background, type: cc.SpriteFrame },
            { path: ASSET_PATHS.home.title, type: cc.SpriteFrame },
            { path: ASSET_PATHS.home.rankEntry, type: cc.SpriteFrame },
            { path: ASSET_PATHS.home.guideHand, type: cc.SpriteFrame },
            { path: ASSET_PATHS.home.leaderboardBodyFont, type: cc.TTFFont },
            { path: ASSET_PATHS.home.leaderboardDisplayFont, type: cc.BitmapFont },
        ];
    }
    throw new Error(`[资源] 未知 Feature：${feature}`);
}

export function prepareFeature(feature: FeatureName): Promise<void> {
    if (readyFeatures[feature]) return Promise.resolve();
    if (featurePromises[feature]) return featurePromises[feature];

    // 默认头像和钱包图标属于主包，首页也预载同一角色，不复制一套到分包。
    const shared = feature === 'home'
        ? loadSpecs('game', [ASSET_PATHS.game.hudMascot, ASSET_PATHS.game.hammer, ASSET_PATHS.game.magicWand].map(path => ({ path, type: cc.SpriteFrame })))
        : Promise.resolve();
    const bundleName: BundleName = feature === 'leaderboard' ? 'home' : feature;
    featurePromises[feature] = Promise.all([shared, loadSpecs(bundleName, featureSpecs(feature))])
        .then(() => {
            readyFeatures[feature] = true;
        })
        .catch((error: Error) => {
            delete featurePromises[feature];
            throw error;
        });
    return featurePromises[feature];
}

export function isFeatureReady(feature: FeatureName): boolean {
    return readyFeatures[feature] === true;
}

function getLoadedAsset<T extends cc.Asset>(bundleName: BundleName, path: string, type: any): T {
    const bundle = (cc.assetManager as any).getBundle
        ? (cc.assetManager as any).getBundle(bundleName) as cc.AssetManager.Bundle
        : null;
    const asset = bundle ? bundle.get(path, type) as T : null;
    if (!asset) throw new Error(`[资源] ${bundleName}/${path} 尚未准备，禁止在渲染阶段异步补图`);
    return asset;
}

export function getSpriteFrame(bundleName: BundleName, path: string): cc.SpriteFrame {
    return getLoadedAsset<cc.SpriteFrame>(bundleName, path, cc.SpriteFrame);
}

export function getBitmapFont(bundleName: BundleName, path: string): cc.BitmapFont {
    return getLoadedAsset<cc.BitmapFont>(bundleName, path, cc.BitmapFont);
}

export function getTTFFont(bundleName: BundleName, path: string): cc.TTFFont {
    return getLoadedAsset<cc.TTFFont>(bundleName, path, cc.TTFFont);
}

export function getSkeletonData(bundleName: BundleName, path: string): sp.SkeletonData {
    return getLoadedAsset<sp.SkeletonData>(bundleName, path, sp.SkeletonData);
}

export function getAudioClip(bundleName: BundleName, path: string): cc.AudioClip {
    return getLoadedAsset<cc.AudioClip>(bundleName, path, cc.AudioClip);
}

/** 背景音乐在界面就绪后单独拉取。微信平台的 music Bundle 来自 CDN。 */
export function loadMusicClip(name: 'main' | 'game'): Promise<cc.AudioClip> {
    return loadAsset<cc.AudioClip>('music', ASSET_PATHS.music[name], cc.AudioClip).then(clip => {
        // AudioClip 的元数据就绪不代表音频已解码；避免旧播放实例停掉后迟到的 native 加载又启动声音。
        if (clip.loaded) return clip;
        return new Promise<cc.AudioClip>((resolve, reject) => {
            cc.assetManager.postLoadNative(clip, (error: Error) => {
                if (error) reject(error);
                else resolve(clip);
            });
        });
    });
}

/** 微信头像是用户数据，不属于任何游戏 Bundle，但仍统一从这里进入资源系统。 */
export function loadRemoteTexture(url: string): Promise<cc.Texture2D> {
    return new Promise<cc.Texture2D>((resolve, reject) => {
        cc.assetManager.loadRemote(url, { ext: '.png' }, (error: Error, texture: cc.Texture2D) => {
            if (error || !texture) {
                reject(new Error(`[资源] 远程头像加载失败：${error ? error.message : url}`));
                return;
            }
            resolve(texture);
        });
    });
}
