/**
 * 统一资源加载：主包仅保留引擎与核心脚本；
 * - resources：局内核心美术，微信构建为远程包
 * - home：首页分包
 * - realm：解忧秘境分包
 */

export type BundleName = 'resources' | 'home' | 'realm';

type LoadCallback<T> = (error: Error | null, asset: T | null) => void;

const bundleCache: { [name: string]: cc.AssetManager.Bundle } = {};
const bundleWaiters: { [name: string]: Array<(error: Error | null, bundle: cc.AssetManager.Bundle | null) => void> } = {};

function getBuiltinResources(): cc.AssetManager.Bundle | null {
    return cc.resources || null;
}

export function loadBundle(name: BundleName): Promise<cc.AssetManager.Bundle> {
    return new Promise((resolve, reject) => {
        if (name === 'resources') {
            const builtin = getBuiltinResources();
            if (builtin) {
                bundleCache.resources = builtin;
                resolve(builtin);
                return;
            }
        }
        if (bundleCache[name]) {
            resolve(bundleCache[name]);
            return;
        }
        if (!bundleWaiters[name]) bundleWaiters[name] = [];
        bundleWaiters[name].push((error, bundle) => {
            if (error || !bundle) reject(error || new Error(`Bundle ${name} load failed`));
            else resolve(bundle);
        });
        if (bundleWaiters[name].length > 1) return;

        cc.assetManager.loadBundle(name, (error: Error, bundle: cc.AssetManager.Bundle) => {
            const waiters = bundleWaiters[name] || [];
            delete bundleWaiters[name];
            if (error || !bundle) {
                waiters.forEach((waiter) => waiter(error || new Error(`Bundle ${name} load failed`), null));
                return;
            }
            bundleCache[name] = bundle;
            waiters.forEach((waiter) => waiter(null, bundle));
        });
    });
}

export function loadSpriteFrame(
    bundleName: BundleName,
    path: string,
    onComplete: LoadCallback<cc.SpriteFrame>,
): void {
    loadBundle(bundleName)
        .then((bundle) => {
            bundle.load(path, cc.SpriteFrame, (error: Error, frame: cc.SpriteFrame) => {
                onComplete(error || null, frame || null);
            });
        })
        .catch((error: Error) => onComplete(error, null));
}

export function loadSkeletonData(
    bundleName: BundleName,
    path: string,
    onComplete: LoadCallback<sp.SkeletonData>,
): void {
    loadBundle(bundleName)
        .then((bundle) => {
            bundle.load(path, sp.SkeletonData, (error: Error, data: sp.SkeletonData) => {
                onComplete(error || null, data || null);
            });
        })
        .catch((error: Error) => onComplete(error, null));
}

export function preloadBundles(names: BundleName[]): Promise<void> {
    return Promise.all(names.map((name) => loadBundle(name))).then(() => undefined);
}

/** 首页进入前预拉 home；局内需要时再拉 resources。 */
export async function ensureHomeReady(): Promise<void> {
    await loadBundle('home');
}

export async function ensureGameResourcesReady(): Promise<void> {
    await loadBundle('resources');
}

export async function ensureRealmReady(): Promise<void> {
    await loadBundle('realm');
}
