/**
 * 微信小游戏 API 的唯一访问入口。
 *
 * 各业务模块不再各自 `declare const wx`，统一从这里获取句柄。
 * Web 预览或旧容器把 wx 注入到 window.wx 时也能识别；
 * 完全不支持时返回 null，由调用方决定提示或静默降级。
 */
declare const wx: any;

/** 返回微信全局对象；不存在（Web 预览）时返回 null。 */
export function getWxApi(): any {
    try {
        if (typeof wx !== 'undefined' && wx) return wx;
    } catch (error) {
        // 个别容器定义了 wx 但访问即抛错，按不存在处理。
    }
    if (typeof window !== 'undefined' && (window as any).wx) return (window as any).wx;
    return null;
}

export type WeChatUserProfile = {
    nickName: string;
    avatarUrl: string;
};

/** 按当前云账号记录成功授权，不能把另一账号的本地标记当作已授权。 */
export function hasWeChatProfileAuthorization(playerId: string, avatarUrl: string): boolean {
    if (!playerId) return false;
    if (avatarUrl) return true;
    try {
        const cached = JSON.parse(cc.sys.localStorage.getItem('zyx_wechat_profile') || 'null');
        return !!cached && cached.playerId === playerId && cached.authorized === true;
    } catch (_) { return false; }
}

export function rememberWeChatProfileAuthorization(playerId: string): void {
    try {
        cc.sys.localStorage.setItem('zyx_wechat_profile', JSON.stringify({ playerId, authorized: true }));
    } catch (_) { /* 云端资料仍可作为已授权依据，存储失败不影响此次保存。 */ }
}

function parseWeChatUserInfo(info: any): WeChatUserProfile {
    const nickName = info && typeof info.nickName === 'string' ? info.nickName.trim() : '';
    const avatarUrl = info && typeof info.avatarUrl === 'string' ? info.avatarUrl : '';
    if (!nickName) throw new Error('未获取到有效的微信昵称');
    return { nickName, avatarUrl };
}

function parseUserInfoResult(result: any): WeChatUserProfile {
    if (!result || !result.userInfo) {
        throw new Error(result && result.errMsg ? result.errMsg : '微信授权已取消');
    }
    return parseWeChatUserInfo(result.userInfo);
}

/** 未授权时必须由原生按钮发起，不能用 wx.authorize 或普通 Cocos 点击事件替代。 */
function requestWithUserInfoButton(
    wxApi: any,
    presentAuthorizationSheet?: () => (() => void),
): Promise<WeChatUserProfile> {
    return new Promise((resolve, reject) => {
        const hideAuthorizationSheet = presentAuthorizationSheet ? presentAuthorizationSheet() : () => undefined;
        const windowInfo = typeof wxApi.getWindowInfo === 'function'
            ? wxApi.getWindowInfo()
            : (typeof wxApi.getSystemInfoSync === 'function' ? wxApi.getSystemInfoSync() : {});
        const windowWidth = windowInfo.windowWidth || 375;
        const windowHeight = windowInfo.windowHeight || 667;
        let button: any = null;
        try {
            button = wxApi.createUserInfoButton({
                type: 'text',
                text: '',
                style: {
                    left: 0,
                    top: 0,
                    width: windowWidth,
                    height: windowHeight,
                    lineHeight: windowHeight,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0)',
                    borderWidth: 0,
                    color: 'rgba(0,0,0,0)',
                    textAlign: 'center',
                    fontSize: 1,
                },
            });
        } catch (error) {
            hideAuthorizationSheet();
            reject(error);
            return;
        }
        if (!button || typeof button.onTap !== 'function') {
            hideAuthorizationSheet();
            reject(new Error('微信用户信息按钮创建失败'));
            return;
        }
        let settled = false;
        const finish = (callback: () => void): void => {
            if (settled) return;
            settled = true;
            try {
                if (typeof button.destroy === 'function') button.destroy();
            } finally {
                hideAuthorizationSheet();
                callback();
            }
        };
        button.onTap((result: any) => {
            try {
                const profile = parseUserInfoResult(result);
                finish(() => resolve(profile));
            } catch (error) {
                finish(() => reject(error));
            }
        });
    });
}

/** 仅为没有原生按钮和既有授权查询能力的旧容器保留。 */
function requestWithLegacyUserProfile(wxApi: any): Promise<WeChatUserProfile> {
    if (!wxApi || typeof wxApi.getUserProfile !== 'function') {
        return Promise.reject(new Error('当前环境不支持微信资料授权'));
    }
    return new Promise((resolve, reject) => {
        wxApi.getUserProfile({
            desc: '用于展示游戏昵称、头像和排行榜信息',
            success: (result: any) => {
                try {
                    resolve(parseUserInfoResult(result));
                } catch (error) {
                    reject(error);
                }
            },
            fail: (error: any) => reject(new Error(error && error.errMsg ? error.errMsg : '微信授权已取消')),
        });
    });
}

function requestFirstAuthorization(
    wxApi: any,
    presentAuthorizationSheet?: () => (() => void),
): Promise<WeChatUserProfile> {
    if (wxApi && typeof wxApi.createUserInfoButton === 'function') {
        return requestWithUserInfoButton(wxApi, presentAuthorizationSheet);
    }
    return requestWithLegacyUserProfile(wxApi);
}

/**
 * 已授权玩家直接读取资料；未授权玩家才创建原生用户信息按钮。
 * 这是微信官方推荐顺序，也避免每次打开排行榜都强制玩家重复授权。
 */
export function requestWeChatUserProfile(presentAuthorizationSheet?: () => (() => void)): Promise<WeChatUserProfile> {
    const wxApi = getWxApi();
    if (!wxApi || typeof wxApi.getSetting !== 'function' || typeof wxApi.getUserInfo !== 'function') {
        return requestFirstAuthorization(wxApi, presentAuthorizationSheet);
    }
    return new Promise((resolve, reject) => {
        const requestFirst = (): void => {
            requestFirstAuthorization(wxApi, presentAuthorizationSheet).then(resolve, reject);
        };
        wxApi.getSetting({
            success: (setting: any) => {
                if (!setting || !setting.authSetting || setting.authSetting['scope.userInfo'] !== true) {
                    requestFirst();
                    return;
                }
                wxApi.getUserInfo({
                    success: (result: any) => {
                        try {
                            resolve(parseUserInfoResult(result));
                        } catch (error) {
                            reject(error);
                        }
                    },
                    fail: (error: any) => reject(new Error(error && error.errMsg ? error.errMsg : '读取已授权微信资料失败')),
                });
            },
            fail: requestFirst,
        });
    });
}

/**
 * 微信短震动（light）。
 * 只负责平台调用与降级；是否允许震动由 GameSettings 的开关决定。
 */
export function vibrateShortLight(): void {
    const wxApi = getWxApi();
    if (!wxApi || typeof wxApi.vibrateShort !== 'function') return;
    try {
        wxApi.vibrateShort({ type: 'light' });
    } catch (error) {
        // Web 预览及旧版基础库不支持时静默降级。
    }
}
