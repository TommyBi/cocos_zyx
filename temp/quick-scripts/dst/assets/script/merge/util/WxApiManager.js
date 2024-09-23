
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/util/WxApiManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
    WxApiManager.prototype.share = function () {
        if (!this.checkWxEnv)
            return;
        wx.shareAppMessage({
            title: '别卷啦，快来卡皮一下吧~',
        });
    };
    WxApiManager.Instance = new WxApiManager();
    return WxApiManager;
}(cc.EventTarget));
exports.WxApiManager = WxApiManager;
exports.wxApiManager = WxApiManager.Instance;

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9XeEFwaU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0lBQWtDLGdDQUFjO0lBRzVDO2VBQ0ksaUJBQU87SUFDWCxDQUFDO0lBR0Qsc0JBQVksb0NBQVU7UUFEdEIsU0FBUzthQUNUO1lBQ0ksT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsQ0FBQzs7O09BQUE7SUFFRCw2QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO1lBQUUsT0FBTztRQUM3QixFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFRCw2QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO1lBQUUsT0FBTztRQUM3QixFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFRCw0QkFBSyxHQUFMO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO1lBQUUsT0FBTztRQUM3QixFQUFFLENBQUMsZUFBZSxDQUFDO1lBQ2YsS0FBSyxFQUFFLGNBQWM7U0FDeEIsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQTlCc0IscUJBQVEsR0FBaUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQStCdkUsbUJBQUM7Q0FoQ0QsQUFnQ0MsQ0FoQ2lDLEVBQUUsQ0FBQyxXQUFXLEdBZ0MvQztBQWhDWSxvQ0FBWTtBQWtDWixRQUFBLFlBQVksR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIFd4QXBpTWFuYWdlciBleHRlbmRzIGNjLkV2ZW50VGFyZ2V0IHtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEluc3RhbmNlOiBXeEFwaU1hbmFnZXIgPSBuZXcgV3hBcGlNYW5hZ2VyKCk7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIC8vIOajgOafpeW+ruS/oeeOr+Wig1xuICAgIHByaXZhdGUgZ2V0IGNoZWNrV3hFbnYoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB3aW5kb3dbJ3d4J107XG4gICAgfVxuXG4gICAgb25TaG93KCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuY2hlY2tXeEVudikgcmV0dXJuO1xuICAgICAgICB3eC5vblNob3coKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ29uU2hvdycpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIG9uSGlkZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmNoZWNrV3hFbnYpIHJldHVybjtcbiAgICAgICAgd3gub25IaWRlKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvbkhpZGUnKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBzaGFyZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmNoZWNrV3hFbnYpIHJldHVybjtcbiAgICAgICAgd3guc2hhcmVBcHBNZXNzYWdlKHtcbiAgICAgICAgICAgIHRpdGxlOiAn5Yir5Y235ZWm77yM5b+r5p2l5Y2h55qu5LiA5LiL5ZCnficsXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5leHBvcnQgY29uc3Qgd3hBcGlNYW5hZ2VyID0gV3hBcGlNYW5hZ2VyLkluc3RhbmNlO1xuIl19