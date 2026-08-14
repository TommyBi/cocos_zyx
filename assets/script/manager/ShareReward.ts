import { BUTTON_COLORS, uimanager } from './Uimanager';

declare const wx: any;

/**
 * 用户量未达标、激励视频暂不可用时，用分享代替获取道具/救场/复活。
 * 恢复看视频逻辑时，把此开关改为 false 即可；视频代码与图标均保留。
 */
export const USE_SHARE_INSTEAD_OF_VIDEO = true;

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

const SHARE_TITLE = '烦恼排排消｜整理心情，装进开心瓶';

function getWxApi(): any {
    try {
        if (typeof wx !== 'undefined') return wx;
    } catch (error) {
        return null;
    }
    return null;
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
    if (!pending || pending.completed) return;
    const elapsed = Date.now() - pending.startedAt;
    if (elapsed >= SHARE_SUCCESS_MIN_MS) {
        finishPending(true);
        return;
    }
    finishPending(false, '分享别太快哦，停留超过 3 秒再回来');
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
        wxApi.onShareAppMessage(() => ({
            title: SHARE_TITLE,
            query: 'from=system_share',
        }));
        systemShareRegistered = true;
    } catch (error) {
        // Web 预览和旧基础库静默降级，不影响游戏启动。
    }
}

/** 当前获取奖励入口应展示的动作图标类型。 */
export function getRewardOfferIcon(): 'share' | 'video' {
    return USE_SHARE_INSTEAD_OF_VIDEO ? 'share' : 'video';
}

export function getRewardOfferFailToast(kind: 'tool' | 'rescue' | 'revive'): string {
    if (USE_SHARE_INSTEAD_OF_VIDEO) {
        if (kind === 'revive') return '分享别太快哦，停留超过 3 秒再回来才能复活';
        if (kind === 'rescue') return '分享别太快哦，停留超过 3 秒再回来才能获得帮助';
        return '分享别太快哦，停留超过 3 秒再回来才能获得使用机会';
    }
    if (kind === 'revive') return '完整看完视频才能复活';
    if (kind === 'rescue') return '完整看完视频才能获得帮助';
    return '完整看完视频才能获得使用机会';
}

/**
 * 发起一次获取奖励：当前走微信分享；开关关闭后由调用方改走激励视频。
 * Web 预览提供模拟成功/过快失败，便于本地验收。
 */
export function requestShareReward(onResult: (rewarded: boolean) => void): void {
    if (pending && !pending.completed) {
        finishPending(false);
    }

    const wxApi = getWxApi();
    if (!wxApi || typeof wxApi.shareAppMessage !== 'function') {
        uimanager.showModal(
            '分享获得一次机会',
            '网页预览使用模拟分享。\n微信里会拉起分享面板，回来时根据停留是否超过 3 秒判定结果。',
            [
                {
                    text: '模拟分享成功',
                    color: BUTTON_COLORS.green,
                    onClick: () => onResult(true),
                },
                {
                    text: '模拟分享过快',
                    color: BUTTON_COLORS.red,
                    onClick: () => onResult(false),
                },
            ],
        );
        return;
    }

    ensureOnShowHook();
    pending = {
        startedAt: Date.now(),
        onResult,
        completed: false,
        timeoutId: setTimeout(() => {
            finishPending(false, '分享已取消或超时，请再试一次');
        }, 60000),
    };

    try {
        wxApi.shareAppMessage({
            title: SHARE_TITLE,
            query: 'from=share_reward',
        });
    } catch (error) {
        finishPending(false, '分享暂时不可用，请稍后再试');
    }
}
