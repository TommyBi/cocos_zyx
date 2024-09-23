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
}

export const wxApiManager = WxApiManager.Instance;
