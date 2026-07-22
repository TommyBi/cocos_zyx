export class WxApiManager extends cc.EventTarget {
    public static readonly Instance: WxApiManager = new WxApiManager();

    private constructor() {
        super();
    }

    // 检查微信环境
    private get checkWxEnv(): boolean {
        return window['wx'];
    }

    onShow(): void {
        if (!this.checkWxEnv) return;
        wx.onShow(() => {
            console.log('onShow');
        })
    }

    onHide(): void {
        if (!this.checkWxEnv) return;
        wx.onHide(() => {
            console.log('onHide');
        })
    }

    share(title: string): void {
        if (!this.checkWxEnv) return;
        wx.shareAppMessage({
            title: title,
        })
    }

    login(): Promise<string> {
        return new Promise((resolve) => {
            if (!this.checkWxEnv) {
                resolve('');
                return;
            }

            wx.login({
                success: (res) => {
                    resolve(res && res.code ? res.code : '');
                },
                fail: () => {
                    resolve('');
                },
            });
        });
    }

    showRewardedAd(adUnitId: string = ''): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.checkWxEnv || !wx.createRewardedVideoAd || !adUnitId) {
                resolve(true);
                return;
            }

            const ad = wx.createRewardedVideoAd({ adUnitId });
            ad.onClose((res) => {
                resolve(!res || res.isEnded);
            });
            ad.onError(() => {
                resolve(false);
            });
            ad.show().catch(() => {
                ad.load()
                    .then(() => ad.show())
                    .catch(() => resolve(false));
            });
        });
    }
}

export const wxApiManager = WxApiManager.Instance;
