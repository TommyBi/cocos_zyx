/**
 * 统一资源加载：每个功能域只访问自己所属的 Asset Bundle；
 * - home：首页分包（含首页音乐）
 * - game-assets：消除玩法分包（含局内美术、Spine、音乐和音效）
 * - realm：解忧秘境分包（含拼图音乐和切画音效）
 * - album-art：画册高清美术分包，进入具体画册前加载
 */

declare const wx: any;

export type BundleName = 'home' | 'game-assets' | 'realm' | 'album-art';

type LoadCallback<T> = (error: Error | null, asset: T | null) => void;

const bundleCache: { [name: string]: cc.AssetManager.Bundle } = {};
const bundleWaiters: { [name: string]: Array<(error: Error | null, bundle: cc.AssetManager.Bundle | null) => void> } = {};
const spriteFrameCache: { [key: string]: cc.SpriteFrame } = {};
const spriteFrameWaiters: { [key: string]: Array<LoadCallback<cc.SpriteFrame>> } = {};
const effectAssetCache: { [key: string]: cc.EffectAsset } = {};
const effectAssetWaiters: { [key: string]: Array<LoadCallback<cc.EffectAsset>> } = {};
const audioClipCache: { [key: string]: cc.AudioClip } = {};
const audioClipWaiters: { [key: string]: Array<LoadCallback<cc.AudioClip>> } = {};
let gameResourcesReadyPromise: Promise<void> = null;
let albumArtDownloadPatchInstalled: boolean = false;
let albumArtLocalImageParserInstalled: boolean = false;
const albumArtPinnedDownloadPaths: string[] = [];

/**
 * 部分微信开发者工具/真机基础库会把 USER_DATA_PATH 图片再次代理成 __usr__ 请求，
 * 对 unzip 目录返回 500。画册图片先从文件系统读成 ArrayBuffer，再创建内存 URL，
 * 避开这层本地 HTTP 代理；其他 Bundle 的图片仍走 Cocos 默认路径。
 */
function installAlbumArtLocalImageParser(wxApi: any): void {
    if (albumArtLocalImageParserInstalled || !wxApi || !wxApi.getFileSystemManager) return;
    if (!wxApi.env || !wxApi.env.USER_DATA_PATH || !cc.assetManager || !cc.assetManager.parser) return;

    const fileSystem = wxApi.getFileSystemManager();
    const albumCachePrefix = `${wxApi.env.USER_DATA_PATH}/gamecaches/album-art/`;
    const loadImage = (
        source: string,
        onComplete: (error: Error | null, image: HTMLImageElement | null) => void,
        revokeSource?: () => void,
    ): void => {
        const image = new Image();
        image.onload = () => {
            image.onload = null;
            image.onerror = null;
            if (revokeSource) revokeSource();
            onComplete(null, image);
        };
        image.onerror = () => {
            image.onload = null;
            image.onerror = null;
            if (revokeSource) revokeSource();
            onComplete(new Error(`Load image (${source}) failed`), null);
        };
        image.src = source;
    };

    const parseImage = (file: any, _options: any, onComplete: (error: Error | null, image: HTMLImageElement | null) => void): void => {
        const source = typeof file === 'string' ? file : '';
        if (!source.startsWith(albumCachePrefix)) {
            loadImage(source, onComplete);
            return;
        }

        fileSystem.readFile({
            filePath: source,
            success: (result: any) => {
                const buffer = result && result.data;
                if (!buffer) {
                    onComplete(new Error(`Read album image (${source}) returned no data`), null);
                    return;
                }
                if (typeof wxApi.createBufferURL === 'function') {
                    const bufferUrl = wxApi.createBufferURL(buffer);
                    loadImage(bufferUrl, onComplete, () => {
                        if (typeof wxApi.revokeBufferURL === 'function') wxApi.revokeBufferURL(bufferUrl);
                    });
                    return;
                }
                if (typeof wxApi.arrayBufferToBase64 === 'function') {
                    const mime = /\.png$/i.test(source) ? 'image/png' : 'image/jpeg';
                    loadImage(`data:${mime};base64,${wxApi.arrayBufferToBase64(buffer)}`, onComplete);
                    return;
                }
                onComplete(new Error('Current WeChat base library cannot decode cached album images'), null);
            },
            fail: (error: any) => {
                const message = error && (error.errMsg || error.message);
                onComplete(new Error(message || `Read album image (${source}) failed`), null);
            },
        });
    };

    cc.assetManager.parser.register({
        '.jpg': parseImage,
        '.jpeg': parseImage,
        '.png': parseImage,
    });
    albumArtLocalImageParserInstalled = true;
}

/**
 * Cocos 2.4 微信适配器默认先下载到 http://tmp，再异步读取；部分真机/开发者工具中
 * 临时文件在 downloadFile.success 内就已失效。画册文件改为从 CDN 请求后直接写入
 * Cocos 缓存目录，再交回引擎解析和解压。
 */
function installAlbumArtPersistentDownload(): void {
    if (albumArtDownloadPatchInstalled) return;
    const wxApi = typeof wx !== 'undefined'
        ? wx
        : (typeof window !== 'undefined' ? (window as any).wx : null);
    if (!wxApi || typeof wxApi.downloadFile !== 'function' || typeof wxApi.request !== 'function'
        || !wxApi.env || !wxApi.env.USER_DATA_PATH) return;
    installAlbumArtLocalImageParser(wxApi);
    if (!wxApi.getFileSystemManager || (wxApi.downloadFile as any).__albumArtPersistentDownload) {
        albumArtDownloadPatchInstalled = true;
        return;
    }

    const fileSystem = wxApi.getFileSystemManager();
    // Cocos 启动时已创建并验证 gamecaches 可写；部分微信环境禁止另建顶层目录。
    const downloadRoot = `${wxApi.env.USER_DATA_PATH}/gamecaches`;

    const originalDownloadFile = wxApi.downloadFile.bind(wxApi);
    const wrappedDownloadFile = (options: any): any => {
        const url = options && typeof options.url === 'string' ? options.url : '';
        const match = url.match(/\/remote\/album-art\/(config\.[a-f0-9]+\.json|res\.[a-f0-9]+\.zip)(?:\?|$)/i);
        if (!match) return originalDownloadFile(options);

        const targetPath = `${downloadRoot}/album-art-download-${match[1]}`;
        try {
            fileSystem.unlinkSync(targetPath);
        } catch (error) {
            // 首次下载没有旧文件，直接继续。
        }
        const originalSuccess = options.success;
        const originalFail = options.fail;
        let progressCallback: (progress: any) => void = null;
        const isZip = /\.zip$/i.test(match[1]);
        const requestTask = wxApi.request({
            url,
            header: options.header,
            timeout: 60000,
            dataType: isZip ? undefined : 'text',
            responseType: isZip ? 'arraybuffer' : 'text',
            success: (result: any) => {
                if (result.statusCode !== 200) {
                    if (originalFail) originalFail({ errMsg: `HTTP ${result.statusCode}` });
                    return;
                }
                try {
                    if (isZip) fileSystem.writeFileSync(targetPath, result.data);
                    else fileSystem.writeFileSync(targetPath, String(result.data), 'utf8');
                } catch (error) {
                    const message = error && ((error as any).errMsg || (error as any).message);
                    if (originalFail) originalFail({ errMsg: message || 'album-art CDN persistence failed' });
                    return;
                }
                if (albumArtPinnedDownloadPaths.indexOf(targetPath) < 0) {
                    albumArtPinnedDownloadPaths.push(targetPath);
                }
                const stableResult = Object.assign({}, result, {
                    filePath: targetPath,
                    tempFilePath: targetPath,
                });
                cc.log(`[album-art] CDN download ready: ${url} -> ${targetPath}`);
                if (progressCallback) {
                    const bytes = isZip && result.data ? result.data.byteLength : String(result.data).length;
                    progressCallback({ progress: 100, totalBytesWritten: bytes, totalBytesExpectedToWrite: bytes });
                }
                if (originalSuccess) originalSuccess(stableResult);
            },
            fail: (error: any) => {
                try {
                    fileSystem.unlinkSync(targetPath);
                } catch (unlinkError) {
                    // 下载失败时目标通常不存在。
                }
                if (originalFail) originalFail(error);
            },
        });
        return {
            abort: () => requestTask.abort && requestTask.abort(),
            onProgressUpdate: (callback: (progress: any) => void) => {
                progressCallback = callback;
            },
        };
    };
    (wrappedDownloadFile as any).__albumArtPersistentDownload = true;
    wxApi.downloadFile = wrappedDownloadFile;
    albumArtDownloadPatchInstalled = true;
}

function clearAlbumArtPinnedDownloads(delayMs: number = 0): void {
    const wxApi = typeof wx !== 'undefined'
        ? wx
        : (typeof window !== 'undefined' ? (window as any).wx : null);
    if (!wxApi || !wxApi.getFileSystemManager) return;
    const fileSystem = wxApi.getFileSystemManager();
    const targets = albumArtPinnedDownloadPaths.splice(0);
    const removeTargets = (): void => {
        targets.forEach((targetPath) => {
            try {
                fileSystem.unlinkSync(targetPath);
            } catch (error) {
                // 已被引擎移动或清理时无需处理。
            }
        });
    };
    if (delayMs > 0) setTimeout(removeTargets, delayMs);
    else removeTargets();
}

export function loadBundle(name: BundleName): Promise<cc.AssetManager.Bundle> {
    return new Promise((resolve, reject) => {
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

        if (name === 'album-art') installAlbumArtPersistentDownload();

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

export function isBundleReady(name: BundleName): boolean {
    return Boolean(bundleCache[name]);
}

export function loadSpriteFrame(
    bundleName: BundleName,
    path: string,
    onComplete: LoadCallback<cc.SpriteFrame>,
): void {
    const cacheKey = `${bundleName}:${path}`;
    const cached = spriteFrameCache[cacheKey];
    if (cached && cc.isValid(cached)) {
        onComplete(null, cached);
        return;
    }
    if (!spriteFrameWaiters[cacheKey]) spriteFrameWaiters[cacheKey] = [];
    spriteFrameWaiters[cacheKey].push(onComplete);
    if (spriteFrameWaiters[cacheKey].length > 1) return;

    const finish = (error: Error | null, frame: cc.SpriteFrame | null): void => {
        const waiters = spriteFrameWaiters[cacheKey] || [];
        delete spriteFrameWaiters[cacheKey];
        if (!error && frame) spriteFrameCache[cacheKey] = frame;
        waiters.forEach((waiter) => waiter(error, frame));
    };
    loadBundle(bundleName)
        .then((bundle) => {
            bundle.load(path, cc.SpriteFrame, (error: Error, frame: cc.SpriteFrame) => {
                finish(error || null, frame || null);
            });
        })
        .catch((error: Error) => finish(error, null));
}

export function loadEffectAsset(
    bundleName: BundleName,
    path: string,
    onComplete: LoadCallback<cc.EffectAsset>,
): void {
    const cacheKey = `${bundleName}:${path}`;
    const cached = effectAssetCache[cacheKey];
    if (cached && cc.isValid(cached)) {
        onComplete(null, cached);
        return;
    }
    if (!effectAssetWaiters[cacheKey]) effectAssetWaiters[cacheKey] = [];
    effectAssetWaiters[cacheKey].push(onComplete);
    if (effectAssetWaiters[cacheKey].length > 1) return;

    const finish = (error: Error | null, effect: cc.EffectAsset | null): void => {
        const waiters = effectAssetWaiters[cacheKey] || [];
        delete effectAssetWaiters[cacheKey];
        if (!error && effect) effectAssetCache[cacheKey] = effect;
        waiters.forEach((waiter) => waiter(error, effect));
    };
    loadBundle(bundleName)
        .then((bundle) => {
            bundle.load(path, cc.EffectAsset, (error: Error, effect: cc.EffectAsset) => {
                finish(error || null, effect || null);
            });
        })
        .catch((error: Error) => finish(error, null));
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

export function loadAudioClip(
    bundleName: BundleName,
    path: string,
    onComplete: LoadCallback<cc.AudioClip>,
): void {
    const cacheKey = `${bundleName}:${path}`;
    const cached = audioClipCache[cacheKey];
    if (cached && cc.isValid(cached)) {
        onComplete(null, cached);
        return;
    }
    if (!audioClipWaiters[cacheKey]) audioClipWaiters[cacheKey] = [];
    audioClipWaiters[cacheKey].push(onComplete);
    if (audioClipWaiters[cacheKey].length > 1) return;

    const finish = (error: Error | null, clip: cc.AudioClip | null): void => {
        const waiters = audioClipWaiters[cacheKey] || [];
        delete audioClipWaiters[cacheKey];
        if (!error && clip) audioClipCache[cacheKey] = clip;
        waiters.forEach((waiter) => waiter(error, clip));
    };
    loadBundle(bundleName)
        .then((bundle) => {
            bundle.load(path, cc.AudioClip, (error: Error, clip: cc.AudioClip) => {
                finish(error || null, clip || null);
            });
        })
        .catch((error: Error) => finish(error, null));
}

/** 入口只预拉当前功能域，其他微信分包不会阻塞首页启动。 */
export async function ensureHomeReady(): Promise<void> {
    await loadBundle('home');
}

export function ensureGameResourcesReady(): Promise<void> {
    if (gameResourcesReadyPromise) return gameResourcesReadyPromise;
    gameResourcesReadyPromise = loadBundle('game-assets')
        .then((bundle) => new Promise<void>((resolve, reject) => {
            bundle.preloadDir('', (error: Error) => {
                if (error) reject(error);
                else resolve();
            });
        }))
        .catch((error: Error) => {
            gameResourcesReadyPromise = null;
            throw error;
        });
    return gameResourcesReadyPromise;
}

export async function ensureRealmReady(): Promise<void> {
    await loadBundle('realm');
}

export async function ensureAlbumArtReady(): Promise<void> {
    try {
        await loadBundle('album-art');
        // Cocos 的配置文件缓存复制是延迟队列，留足时间后再移除下载中转文件。
        clearAlbumArtPinnedDownloads(3000);
    } catch (error) {
        clearAlbumArtPinnedDownloads();
        throw error;
    }
}
