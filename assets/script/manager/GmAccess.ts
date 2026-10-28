/**
 * GM 环境判定（R0）：只有「Web 平台 + Debug 构建」允许出现 GM 入口。
 *
 * - 微信小游戏（开发版/体验版/正式版）isBrowser 为 false，一律不可用；
 * - Web 正式构建 CC_DEBUG 为 false，不可用；
 * - 禁止只判断 isBrowser，也禁止用隐藏按钮/透明入口绕过。
 */

declare const CC_DEBUG: boolean;

export function isGmEnvironmentAvailable(): boolean {
    return typeof CC_DEBUG !== 'undefined' && CC_DEBUG === true && cc.sys.isBrowser === true;
}
