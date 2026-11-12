import { BUTTON_COLORS, uimanager } from './UIManager';
import { getWxApi } from './PlatformAdapter';
import { SHARE_CARDS } from './ShareConfig';

/**
 * 激励视频总开关。false 时所有奖励点位走分享；true 时统一切换为激励视频。
 * 用户量达标后，填入下方广告位 ID 并将此开关改为 true 即可。
 */
export const REWARDED_VIDEO_ENABLED = false;

/** 微信激励视频广告位 ID；所有奖励点位共用，暂未申请到时保持空字符串。 */
export const REWARDED_VIDEO_AD_UNIT_ID = '';

/** 分享发起后回到前台，间隔达到该毫秒数才视为成功（微信无分享结果回调）。 */
export const SHARE_SUCCESS_MIN_MS = 3000;

type SharePending = {
    startedAt: number;
    onResult: (rewarded: boolean) => void;
    completed: boolean;
    timeoutId: any;
};

let pending: SharePending | null = null;
let onShowHooked: boolean = false;
let systemShareRegistered: boolean = false;
const shareImageFiles: { [url: string]: string } = {};
const shareImageDownloads: { [url: string]: Promise<string> } = {};

/** CDN 保留微信来源防盗链；先用小游戏下载接口缓存，再交给原生分享读取。 */
function cacheShareImage(imageUrl: string): Promise<string> {
    if (shareImageFiles[imageUrl]) return Promise.resolve(shareImageFiles[imageUrl]);
    if (shareImageDownloads[imageUrl]) return shareImageDownloads[imageUrl];
    const wxApi = getWxApi();
    const download = new Promise<string>((resolve, reject) => {
        wxApi.downloadFile({
            url: imageUrl,
            timeout: 2500,
            success: (result: any) => {
                if (result.statusCode === 200 && result.tempFilePath) resolve(result.tempFilePath);
                else reject(new Error('分享图片下载失败'));
            },
            fail: reject,
        });
    }).then((filePath) => {
        shareImageFiles[imageUrl] = filePath;
        delete shareImageDownloads[imageUrl];
        return filePath;
    }, (error) => {
        delete shareImageDownloads[imageUrl];
        throw error;
    });
    shareImageDownloads[imageUrl] = download;
    return download;
}

function prepareShareMessage(message: { title: string; imageUrl: string; query: string }): Promise<typeof message> {
    return cacheShareImage(message.imageUrl).then(imageUrl => ({ ...message, imageUrl }));
}

/** 发起分享时才随机，保持图片和图中主文案成对。 */
function createShareMessage(from: 'system_share' | 'share_reward'): { title: string; imageUrl: string; query: string } {
    const card = SHARE_CARDS[Math.floor(Math.random() * SHARE_CARDS.length)];
    return { title: card.title, imageUrl: shareImageFiles[card.imageUrl] || card.imageUrl, query: `from=${from}` };
}

function finishPending(rewarded: boolean, toastMessage: string = ''): void {
    if (!pending || pending.completed) return;
    pending.completed = true;
    if (pending.timeoutId) {
        clearTimeout(pending.timeoutId);
        pending.timeoutId = null;
    }
    const onResult = pending.onResult;
    pending = null;
    if (toastMessage) uimanager.showToast(toastMessage);
    onResult(rewarded);
}

function resolvePendingFromShow(): void {
    if (!pending || pending.completed || !pending.startedAt) return;
    const elapsed = Date.now() - pending.startedAt;
    if (elapsed >= SHARE_SUCCESS_MIN_MS) {
        finishPending(true);
        return;
    }
    finishPending(false);
}

function ensureOnShowHook(): void {
    if (onShowHooked) return;
    const wxApi = getWxApi();
    if (!wxApi || typeof wxApi.onShow !== 'function') return;
    wxApi.onShow(() => resolvePendingFromShow());
    onShowHooked = true;
}

/** 注册微信右上角胶囊菜单里的原生“转发给朋友”。全局生命周期只注册一次。 */
export function registerSystemShare(): void {
    if (systemShareRegistered) return;
    const wxApi = getWxApi();
    if (!wxApi || typeof wxApi.onShareAppMessage !== 'function') return;

    try {
        if (typeof wxApi.showShareMenu === 'function') {
            wxApi.showShareMenu({
                withShareTicket: true,
                menus: ['shareAppMessage'],
            });
        }
        if (typeof wxApi.downloadFile === 'function') {
            SHARE_CARDS.forEach(card => cacheShareImage(card.imageUrl).catch(() => undefined));
        }
        wxApi.onShareAppMessage(() => {
            const message = createShareMessage('system_share');
            if (typeof wxApi.downloadFile !== 'function' || !message.imageUrl.startsWith('https://')) return message;
            // 基础库 2.12+ 支持三秒内异步补齐分享参数；正常情况下启动预取已经完成。
            return { ...message, promise: prepareShareMessage(message).catch(() => message) };
        });
        systemShareRegistered = true;
    } catch (error) {
        // Web 预览和旧基础库静默降级，不影响游戏启动。
    }
}

/** 当前获取奖励入口应展示的动作图标类型。 */
export function getRewardOfferIcon(): 'share' | 'video' {
    return REWARDED_VIDEO_ENABLED ? 'video' : 'share';
}

/** 奖励点位共用的动作文案，避免切换通道后仍显示“分享”。 */
export function getRewardOfferActionText(): string {
    return REWARDED_VIDEO_ENABLED ? '看视频' : '分享';
}

export function getRewardOfferFailToast(kind: 'tool' | 'rescue' | 'revive' | 'stamina'): string {
    if (!REWARDED_VIDEO_ENABLED) {
        if (kind === 'revive') return '这次分享没有完成，再试一次就可以复活啦';
        if (kind === 'rescue') return '这次分享没有完成，下次机会再试试吧';
        if (kind === 'stamina') return '分享未完成，体力没有变化';
        return '这次分享没有完成，再试一次就可以获得使用机会';
    }
    if (kind === 'revive') return '完整看完视频才能复活';
    if (kind === 'rescue') return '完整看完视频才能获得帮助';
    if (kind === 'stamina') return '完整看完视频才能获得体力';
    return '完整看完视频才能获得使用机会';
}

/** 所有奖励点位的统一入口，由总开关决定走分享还是激励视频。 */
export function requestRewardOffer(onResult: (rewarded: boolean) => void, rewardName: string = '一次机会'): void {
    if (REWARDED_VIDEO_ENABLED) {
        requestRewardedVideoReward(onResult, rewardName);
        return;
    }
    requestShareReward(onResult, rewardName);
}

/**
 * 发起一次微信分享奖励。微信无分享结果回调，回到前台后按停留时长判定。
 * Web 预览提供模拟成功/未完成，便于本地验收。
 */
export function requestShareReward(onResult: (rewarded: boolean) => void, rewardName: string = '一次机会'): void {
    if (pending && !pending.completed) {
        finishPending(false);
    }

    const wxApi = getWxApi();
    if (!wxApi || typeof wxApi.shareAppMessage !== 'function') {
        uimanager.showModal(
            `分享获得${rewardName}`,
            '网页预览使用模拟分享。\n微信里会直接拉起分享面板。',
            [
                {
                    text: '模拟分享成功',
                    color: BUTTON_COLORS.green,
                    onClick: () => onResult(true),
                },
                {
                    text: '模拟分享未完成',
                    color: BUTTON_COLORS.red,
                    onClick: () => onResult(false),
                },
            ],
            null,
            0,
            false,
            true,
        );
        return;
    }

    ensureOnShowHook();
    pending = {
        startedAt: 0,
        onResult,
        completed: false,
        timeoutId: setTimeout(() => {
            finishPending(false, '分享已取消或超时，请再试一次');
        }, 60000),
    };

    const request = pending;
    const share = (message: { title: string; imageUrl: string; query: string }): void => {
        if (pending !== request || request.completed) return;
        try {
            request.startedAt = Date.now();
            wxApi.shareAppMessage(message);
        } catch (error) {
            finishPending(false, '分享暂时不可用，请稍后再试');
        }
    };
    const message = createShareMessage('share_reward');
    if (typeof wxApi.downloadFile === 'function' && message.imageUrl.startsWith('https://')) {
        prepareShareMessage(message).then(share).catch(() => {
            if (pending === request) finishPending(false, '分享图片暂时没有加载好，请再试一次');
        });
    } else share(message);
}

/** 播放一次激励视频；只有完整观看（或旧基础库未返回观看状态）才发放奖励。 */
function requestRewardedVideoReward(onResult: (rewarded: boolean) => void, rewardName: string): void {
    const wxApi = getWxApi();
    if (!wxApi || typeof wxApi.createRewardedVideoAd !== 'function') {
        uimanager.showModal(
            `看视频获得${rewardName}`,
            '网页预览使用模拟奖励；微信里会播放真实激励视频。',
            [
                { text: '模拟观看完成', color: BUTTON_COLORS.green, onClick: () => onResult(true) },
                { text: '模拟中途关闭', color: BUTTON_COLORS.red, onClick: () => onResult(false) },
            ],
        );
        return;
    }

    const adUnitId = REWARDED_VIDEO_AD_UNIT_ID.trim();
    if (!adUnitId) {
        uimanager.showToast('请先配置激励视频广告位');
        onResult(false);
        return;
    }

    let ad: any = null;
    try {
        ad = wxApi.createRewardedVideoAd({ adUnitId });
    } catch (error) {
        uimanager.showToast('视频组件初始化失败，请稍后再试');
        onResult(false);
        return;
    }

    let completed = false;
    const cleanup = (): void => {
        if (!ad) return;
        if (typeof ad.offClose === 'function') ad.offClose(onClose);
        if (typeof ad.offError === 'function') ad.offError(onError);
    };
    const finish = (rewarded: boolean, errorMessage: string = ''): void => {
        if (completed) return;
        completed = true;
        cleanup();
        if (errorMessage) uimanager.showToast(errorMessage);
        onResult(rewarded);
    };
    const onClose = (result: any): void => {
        // 旧版基础库可能不返回 result；明确返回 isEnded=false 时才视作中途退出。
        finish(!result || result.isEnded !== false);
    };
    const onError = (): void => {
        finish(false, '视频暂时没有准备好，请稍后再试');
    };

    if (!ad || typeof ad.onClose !== 'function' || typeof ad.onError !== 'function') {
        finish(false, '当前微信版本暂不支持激励视频');
        return;
    }
    ad.onClose(onClose);
    ad.onError(onError);
    try {
        const showResult = ad.show();
        if (showResult && typeof showResult.catch === 'function') {
            showResult.catch(() => {
                if (completed) return;
                try {
                    const loadResult = ad.load();
                    if (!loadResult || typeof loadResult.then !== 'function') {
                        onError();
                        return;
                    }
                    loadResult
                        .then(() => {
                            if (completed) return;
                            const retryResult = ad.show();
                            if (retryResult && typeof retryResult.catch === 'function') {
                                retryResult.catch(onError);
                            }
                        })
                        .catch(onError);
                } catch (error) {
                    onError();
                }
            });
        }
    } catch (error) {
        onError();
    }
}
