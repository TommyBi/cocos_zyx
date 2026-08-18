import { uimanager } from './UIManager';
import { getWxApi } from './PlatformAdapter';

/**
 * 微信头像昵称授权控制器。
 *
 * 从 GameMainScene 抽出：负责 scope.userInfo 检查、原生 UserInfoButton 的
 * 创建/销毁与资料回调整理；拿到资料后通过 host.onProfile 交回宿主应用。
 */
export type WeChatProfileHost = {
    /** Cocos 侧的「授权」提示按钮；未创建或已销毁时返回 null。 */
    getAuthorizationButton: () => cc.Node | null;
    /** 拿到微信资料后交给宿主应用（昵称头像 UI、云端 bootstrap 等）。 */
    onProfile: (nickName: string, avatarUrl: string) => void;
};

export default class WeChatProfileController {
    private host: WeChatProfileHost;
    private nativeButton: any = null;

    constructor(host: WeChatProfileHost) {
        this.host = host;
    }

    public hasNativeButton(): boolean {
        return !!this.nativeButton;
    }

    /**
     * 官方推荐流程：先检查 scope.userInfo；已授权直接读取，未授权再创建原生按钮。
     * 原生按钮必须承接真实用户点击，所以不能只用 Cocos 的触摸回调替代。
     */
    public requestAuthorization(
        centerX: number,
        centerY: number,
        width: number,
        height: number,
        hasCachedProfile: boolean,
    ): void {
        const wxApi = getWxApi();
        if (!wxApi) return;
        const authButton = this.host.getAuthorizationButton();
        if (authButton) authButton.active = !hasCachedProfile;

        const createAuthorizationButton = (): void => {
            const button = this.host.getAuthorizationButton();
            if (!button) return;
            button.active = true;
            this.createNativeButton(centerX, centerY, width, height);
        };
        if (typeof wxApi.getSetting !== 'function') {
            createAuthorizationButton();
            return;
        }
        wxApi.getSetting({
            success: (result: any) => {
                const authorized = !!(result && result.authSetting && result.authSetting['scope.userInfo']);
                if (!authorized || typeof wxApi.getUserInfo !== 'function') {
                    createAuthorizationButton();
                    return;
                }
                wxApi.getUserInfo({
                    success: (response: any) => this.handleProfileResponse(response),
                    fail: createAuthorizationButton,
                });
            },
            fail: createAuthorizationButton,
        });
    }

    private createNativeButton(centerX: number, centerY: number, width: number, height: number): void {
        const wxApi = getWxApi();
        if (!wxApi || typeof wxApi.createUserInfoButton !== 'function' || this.nativeButton) return;
        const system = typeof wxApi.getSystemInfoSync === 'function'
            ? wxApi.getSystemInfoSync()
            : { windowWidth: cc.winSize.width, windowHeight: cc.winSize.height };
        const scaleX = system.windowWidth / cc.winSize.width;
        const scaleY = system.windowHeight / cc.winSize.height;
        const nativeButton = wxApi.createUserInfoButton({
            type: 'text',
            text: '授权',
            lang: 'zh_CN',
            withCredentials: false,
            style: {
                left: (centerX - width / 2 + cc.winSize.width / 2) * scaleX,
                top: (cc.winSize.height / 2 - centerY - height / 2) * scaleY,
                width: width * scaleX,
                height: height * scaleY,
                lineHeight: height * scaleY,
                backgroundColor: '#69B581',
                color: '#FFFFFF',
                textAlign: 'center',
                fontSize: Math.max(12, 15 * scaleY),
                borderRadius: 10 * Math.min(scaleX, scaleY),
                borderWidth: 1,
                borderColor: '#477E5A',
            },
        });
        this.nativeButton = nativeButton;
        nativeButton.onTap((response: any) => {
            uimanager.tapFeedback();
            if (response && response.userInfo) {
                this.handleProfileResponse(response);
                return;
            }
            uimanager.showToast('未授权微信资料，继续使用默认头像');
        });
    }

    private handleProfileResponse(response: any): void {
        const info = response && response.userInfo ? response.userInfo : response;
        if (!info || (!info.nickName && !info.avatarUrl)) {
            uimanager.showToast('没有获取到微信资料，请稍后再试');
            return;
        }
        this.host.onProfile(info.nickName || '顺心朋友', info.avatarUrl || '');
        cc.sys.localStorage.setItem('zyx_wechat_profile', JSON.stringify({
            nickName: info.nickName || '顺心朋友',
            avatarUrl: info.avatarUrl || '',
        }));
        const button = this.host.getAuthorizationButton();
        if (button) button.active = false;
        this.destroyNativeButton();
        uimanager.showToast('微信资料已同步');
    }

    public destroyNativeButton(): void {
        if (!this.nativeButton) return;
        if (typeof this.nativeButton.destroy === 'function') {
            this.nativeButton.destroy();
        }
        this.nativeButton = null;
    }
}
