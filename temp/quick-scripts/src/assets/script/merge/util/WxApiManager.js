"use strict";
cc._RF.push(module, 'eb26chNJvdCfJGmYGbMrQpV', 'WxApiManager');
// script/merge/util/WxApiManager.ts

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.wxApiManager = exports.WxApiManager = void 0;
var WxApiManager = /** @class */ (function (_super) {
    __extends(WxApiManager, _super);
    function WxApiManager() {
        return _super.call(this) || this;
    }
    Object.defineProperty(WxApiManager.prototype, "checkWxEnv", {
        // 检查微信环境
        get: function () {
            return window['wx'];
        },
        enumerable: false,
        configurable: true
    });
    WxApiManager.prototype.onShow = function () {
        if (!this.checkWxEnv)
            return;
        wx.onShow(function () {
            console.log('onShow');
        });
    };
    WxApiManager.prototype.onHide = function () {
        if (!this.checkWxEnv)
            return;
        wx.onHide(function () {
            console.log('onHide');
        });
    };
    WxApiManager.prototype.share = function (title) {
        if (!this.checkWxEnv)
            return;
        wx.shareAppMessage({
            title: title,
        });
    };
    WxApiManager.Instance = new WxApiManager();
    return WxApiManager;
}(cc.EventTarget));
exports.WxApiManager = WxApiManager;
exports.wxApiManager = WxApiManager.Instance;

cc._RF.pop();