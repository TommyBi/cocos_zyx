// 插件脚本会在游戏启动前执行：为非像素风 UI 开启 WebGL 的 MSAA。
(function () {
    if (typeof cc === 'undefined' || !cc.macro) return;
    cc.macro.ENABLE_WEBGL_ANTIALIAS = true;
}());
