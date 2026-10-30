/**
 * 唯一资源入口。
 *
 * Bundle 与微信包一一对应：
 * - game：主包内的消除玩法资源，新用户启动时直接准备。
 * - home：首页分包，老用户进入首页时准备。
 * Feature 是业务加载单元，Bundle 是物理包。
 *
 * 界面只能在 prepareFeature 完成后渲染，并通过 get* 同步取得资源。
 * 这样资源错误会在界面创建前失败，不会留下只有节点、没有贴图的半成品 UI。
 */

export type BundleName = 'game' | 'home';
export type FeatureName = 'game' | 'home';

type AssetSpec = {
    path: string;
    type: any;
};

export const ASSET_PATHS = {
    game: {
        background: 'images/formal/game_room_bg_v3',
        hammer: 'images/formal/relief_hammer_v2',
        magicWand: 'images/formal/magic_wand_v1',
        rewardSpine: 'spine/get_1',
        music: 'sound/music_game',
        breakSound: 'sound/sound_break',
        moveSound: 'sound/sound_move',
        hammerSound: 'sound/sound_tool1',
        magicWandSound: 'sound/sound_tool2',
    },
    home: {
        background: 'images/home_studio_bg_v3',
        title: 'images/home_title_logo_v1',
        rankEntry: 'images/rank_entry_trophy_v2',
        guideHand: 'images/start_guide_hand_v3',
        music: 'sound/music_main',
    },
};

const bundlePromises: { [name: string]: Promise<cc.AssetManager.Bundle> } = {};
const featurePromises: { [name: string]: Promise<void> } = {};
const readyFeatures: { [name: string]: boolean } = {};

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
    if (feature === 'game') {
        return [
            { path: ASSET_PATHS.game.background, type: cc.SpriteFrame },
            { path: ASSET_PATHS.game.hammer, type: cc.SpriteFrame },
            { path: ASSET_PATHS.game.magicWand, type: cc.SpriteFrame },
            { path: ASSET_PATHS.game.rewardSpine, type: sp.SkeletonData },
            { path: ASSET_PATHS.game.music, type: cc.AudioClip },
            { path: ASSET_PATHS.game.breakSound, type: cc.AudioClip },
            { path: ASSET_PATHS.game.moveSound, type: cc.AudioClip },
            { path: ASSET_PATHS.game.hammerSound, type: cc.AudioClip },
            { path: ASSET_PATHS.game.magicWandSound, type: cc.AudioClip },
        ];
    }
    if (feature === 'home') {
        return [
            { path: ASSET_PATHS.home.background, type: cc.SpriteFrame },
            { path: ASSET_PATHS.home.title, type: cc.SpriteFrame },
            { path: ASSET_PATHS.home.rankEntry, type: cc.SpriteFrame },
            { path: ASSET_PATHS.home.guideHand, type: cc.SpriteFrame },
            { path: ASSET_PATHS.home.music, type: cc.AudioClip },
        ];
    }
    throw new Error(`[资源] 未知 Feature：${feature}`);
}

export function prepareFeature(feature: FeatureName): Promise<void> {
    if (readyFeatures[feature]) return Promise.resolve();
    if (featurePromises[feature]) return featurePromises[feature];

    featurePromises[feature] = loadSpecs(feature, featureSpecs(feature))
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

export function getSkeletonData(bundleName: BundleName, path: string): sp.SkeletonData {
    return getLoadedAsset<sp.SkeletonData>(bundleName, path, sp.SkeletonData);
}

export function getAudioClip(bundleName: BundleName, path: string): cc.AudioClip {
    return getLoadedAsset<cc.AudioClip>(bundleName, path, cc.AudioClip);
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
