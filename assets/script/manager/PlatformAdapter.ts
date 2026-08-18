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
