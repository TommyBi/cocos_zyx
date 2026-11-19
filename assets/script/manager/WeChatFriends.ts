import { getWxApi } from './PlatformAdapter';

export const FRIEND_SCOPE = 'scope.WxFriendInteraction';

/** 开发/体验成绩与正式成绩隔离，避免测试局覆盖正式好友榜。 */
export function friendScoreKey(): string {
    const wxApi = getWxApi();
    try {
        const env = wxApi.getAccountInfoSync().miniProgram.envVersion;
        return env === 'release' ? 'zyx_best_score_v1' : 'zyx_best_score_staging_v1';
    } catch (_) { return 'zyx_best_score_staging_v1'; }
}

type ScoreWrite = { desired: number; acknowledged: number; writing: boolean };
const writes: { [identity: string]: ScoreWrite } = {};

/** 仅传服务端档案值；串行合并写入，异步旧请求不会把新纪录覆盖回去。失败留待下次档案同步重试。 */
export function syncConfirmedFriendScore(playerId: string, score: number, onSynced?: () => void): void {
    const wxApi = getWxApi();
    if (!playerId || !Number.isSafeInteger(score) || score < 0
        || !wxApi || typeof wxApi.setUserCloudStorage !== 'function') return;
    const key = friendScoreKey();
    const identity = `${key}:${playerId}`;
    const state = writes[identity] || (writes[identity] = { desired: score, acknowledged: -1, writing: false });
    state.desired = Math.max(state.desired, score);
    if (state.writing || state.acknowledged >= state.desired) return;
    const write = (): void => {
        const value = state.desired;
        state.writing = true;
        const failed = (): void => { state.writing = false; };
        try {
            wxApi.setUserCloudStorage({
                // 微信自身资料可能只返回selfOpenId别名，用同次托管的账号标记精确识别自身。
                KVDataList: [{ key, value: String(value) }, { key: `${key}_owner`, value: playerId }],
                success: () => {
                    state.acknowledged = value;
                    state.writing = false;
                    if (state.desired > value) write();
                    else if (onSynced) onSynced();
                },
                fail: failed,
            });
        } catch (_) { failed(); }
    };
    write();
}

/** 单向通知；好友昵称、头像、openid 和排名数据始终留在开放数据域。 */
export function postFriendMessage(type: string, extra: object = {}): boolean {
    const wxApi = getWxApi();
    if (!wxApi || typeof wxApi.getOpenDataContext !== 'function') return false;
    try {
        wxApi.getOpenDataContext().postMessage({ type, key: friendScoreKey(), ...extra });
        return true;
    } catch (_) { return false; }
}
