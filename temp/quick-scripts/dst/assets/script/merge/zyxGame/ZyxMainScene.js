
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/zyxGame/ZyxMainScene.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '384e0soW69C1KpfJCgBwNkn', 'ZyxMainScene');
// script/merge/zyxGame/ZyxMainScene.ts

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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var PlayerModule_1 = require("../dataModule/PlayerModule");
var TypeDefine_1 = require("../define/TypeDefine");
var AudioMgr_1 = require("../manager/AudioMgr");
var Uimanager_1 = require("../manager/Uimanager");
var ZyxComTop_1 = require("./ZyxComTop");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 游戏主场景
var ZyxMainScene = /** @class */ (function (_super) {
    __extends(ZyxMainScene, _super);
    function ZyxMainScene() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uBtnStart = null;
        _this.topCom = null;
        return _this;
    }
    ZyxMainScene.prototype.onLoad = function () {
        console.log('load ZyxMainScene');
        this.uBtnStart.on(cc.Node.EventType.TOUCH_END, this.onStart, this);
        this.uBtnStart.active = false;
    };
    ZyxMainScene.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 初始化界面层级
                        Uimanager_1.uimanager.init(this.node);
                        return [4 /*yield*/, this.initTopCom()];
                    case 1:
                        _a.sent();
                        // login
                        PlayerModule_1.playerModule.login(function () {
                            // 初始化音频
                            AudioMgr_1.audioMgr.init();
                            _this.initUI();
                        });
                        this.onShow();
                        this.onHide();
                        return [2 /*return*/];
                }
            });
        });
    };
    ZyxMainScene.prototype.update = function () {
        Uimanager_1.uimanager.udpateLayerShow();
    };
    ZyxMainScene.prototype.onStart = function () {
        this.initGamePanel();
    };
    // 初始化游戏主场景信息
    ZyxMainScene.prototype.initUI = function () {
        this.uBtnStart.active = true;
        this.topCom.getComponent(ZyxComTop_1.default).init();
    };
    // 初始化顶部信息
    ZyxMainScene.prototype.initTopCom = function () {
        return __awaiter(this, void 0, void 0, function () {
            var topPre, topNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/zyx/uComTop')];
                    case 1:
                        topPre = _a.sent();
                        topNode = cc.instantiate(topPre);
                        Uimanager_1.uimanager.add(topNode, TypeDefine_1.LAYER.UI);
                        topNode.setPosition(new cc.Vec2(0, cc.winSize.height / 2 - topNode.height / 2));
                        this.topCom = topNode;
                        return [2 /*return*/];
                }
            });
        });
    };
    // 初始化游戏界面
    ZyxMainScene.prototype.initGamePanel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prefab, gameNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/zyx/zyxGame')];
                    case 1:
                        prefab = _a.sent();
                        gameNode = cc.instantiate(prefab);
                        Uimanager_1.uimanager.add(gameNode, TypeDefine_1.LAYER.UI);
                        gameNode.setPosition(new cc.Vec2(0, 0));
                        return [2 /*return*/];
                }
            });
        });
    };
    ZyxMainScene.prototype.onShow = function () {
        if (!window['wx'])
            return;
        wx.onShow(function () {
            console.log('onShow');
        });
    };
    ZyxMainScene.prototype.onHide = function () {
        if (!window['wx'])
            return;
        wx.onHide(function () {
            console.log('onHide');
        });
    };
    __decorate([
        property(cc.Node)
    ], ZyxMainScene.prototype, "uBtnStart", void 0);
    ZyxMainScene = __decorate([
        ccclass
    ], ZyxMainScene);
    return ZyxMainScene;
}(cc.Component));
exports.default = ZyxMainScene;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2Uvenl4R2FtZS9aeXhNYWluU2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQTBEO0FBQzFELG1EQUE2QztBQUM3QyxnREFBK0M7QUFDL0Msa0RBQWlEO0FBQ2pELHlDQUFvQztBQUU5QixJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxRQUFRO0FBRVI7SUFBMEMsZ0NBQVk7SUFBdEQ7UUFBQSxxRUE2RUM7UUExRUcsZUFBUyxHQUFZLElBQUksQ0FBQztRQUVuQixZQUFNLEdBQWMsSUFBSSxDQUFDOztJQXdFcEMsQ0FBQztJQXRFRyw2QkFBTSxHQUFOO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBRUssNEJBQUssR0FBWDs7Ozs7O3dCQUNJLFVBQVU7d0JBQ1YscUJBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUUxQixxQkFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUE7O3dCQUF2QixTQUF1QixDQUFDO3dCQUV4QixRQUFRO3dCQUNSLDJCQUFZLENBQUMsS0FBSyxDQUFDOzRCQUNmLFFBQVE7NEJBQ1IsbUJBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs0QkFFaEIsS0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNsQixDQUFDLENBQUMsQ0FBQTt3QkFFRixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ2QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDOzs7OztLQUNqQjtJQUVELDZCQUFNLEdBQU47UUFDSSxxQkFBUyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCw4QkFBTyxHQUFQO1FBQ0ksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFHRCxhQUFhO0lBQ2IsNkJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxtQkFBUyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELFVBQVU7SUFDSixpQ0FBVSxHQUFoQjs7Ozs7NEJBQ21CLHFCQUFNLHFCQUFTLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEVBQUE7O3dCQUF6RCxNQUFNLEdBQUcsU0FBZ0Q7d0JBQ3pELE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUN2QyxxQkFBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsa0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDakMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRTlFLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDOzs7OztLQUN6QjtJQUVELFVBQVU7SUFDSixvQ0FBYSxHQUFuQjs7Ozs7NEJBQ21CLHFCQUFNLHFCQUFTLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEVBQUE7O3dCQUF6RCxNQUFNLEdBQUcsU0FBZ0Q7d0JBQ3pELFFBQVEsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUN4QyxxQkFBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDbEMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQzNDO0lBRUQsNkJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTztRQUMxQixFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFRCw2QkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPO1FBQzFCLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQXpFRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO21EQUNRO0lBSFQsWUFBWTtRQURoQyxPQUFPO09BQ2EsWUFBWSxDQTZFaEM7SUFBRCxtQkFBQztDQTdFRCxBQTZFQyxDQTdFeUMsRUFBRSxDQUFDLFNBQVMsR0E2RXJEO2tCQTdFb0IsWUFBWSIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHBsYXllck1vZHVsZSB9IGZyb20gJy4uL2RhdGFNb2R1bGUvUGxheWVyTW9kdWxlJztcbmltcG9ydCB7IExBWUVSIH0gZnJvbSAnLi4vZGVmaW5lL1R5cGVEZWZpbmUnO1xuaW1wb3J0IHsgYXVkaW9NZ3IgfSBmcm9tICcuLi9tYW5hZ2VyL0F1ZGlvTWdyJztcbmltcG9ydCB7IHVpbWFuYWdlciB9IGZyb20gJy4uL21hbmFnZXIvVWltYW5hZ2VyJztcbmltcG9ydCBaeXhDb21Ub3AgZnJvbSAnLi9aeXhDb21Ub3AnO1xuXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG4vLyDmuLjmiI/kuLvlnLrmma9cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaeXhNYWluU2NlbmUgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgdUJ0blN0YXJ0OiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIHB1YmxpYyB0b3BDb206IFp5eENvbVRvcCA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdsb2FkIFp5eE1haW5TY2VuZScpO1xuICAgICAgICB0aGlzLnVCdG5TdGFydC5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25TdGFydCwgdGhpcyk7XG4gICAgICAgIHRoaXMudUJ0blN0YXJ0LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGFzeW5jIHN0YXJ0KCkge1xuICAgICAgICAvLyDliJ3lp4vljJbnlYzpnaLlsYLnuqdcbiAgICAgICAgdWltYW5hZ2VyLmluaXQodGhpcy5ub2RlKTtcblxuICAgICAgICBhd2FpdCB0aGlzLmluaXRUb3BDb20oKTtcblxuICAgICAgICAvLyBsb2dpblxuICAgICAgICBwbGF5ZXJNb2R1bGUubG9naW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8g5Yid5aeL5YyW6Z+z6aKRXG4gICAgICAgICAgICBhdWRpb01nci5pbml0KCk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5pdFVJKCk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5vblNob3coKTtcbiAgICAgICAgdGhpcy5vbkhpZGUoKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHVpbWFuYWdlci51ZHBhdGVMYXllclNob3coKTtcbiAgICB9XG5cbiAgICBvblN0YXJ0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmluaXRHYW1lUGFuZWwoKTtcbiAgICB9XG5cblxuICAgIC8vIOWIneWni+WMlua4uOaIj+S4u+WcuuaZr+S/oeaBr1xuICAgIGluaXRVSSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51QnRuU3RhcnQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50b3BDb20uZ2V0Q29tcG9uZW50KFp5eENvbVRvcCkuaW5pdCgpO1xuICAgIH1cblxuICAgIC8vIOWIneWni+WMlumhtumDqOS/oeaBr1xuICAgIGFzeW5jIGluaXRUb3BDb20oKSB7XG4gICAgICAgIGNvbnN0IHRvcFByZSA9IGF3YWl0IHVpbWFuYWdlci5sb2FkUHJlZmFiKCdwcmVmYWIvenl4L3VDb21Ub3AnKTtcbiAgICAgICAgY29uc3QgdG9wTm9kZSA9IGNjLmluc3RhbnRpYXRlKHRvcFByZSk7XG4gICAgICAgIHVpbWFuYWdlci5hZGQodG9wTm9kZSwgTEFZRVIuVUkpO1xuICAgICAgICB0b3BOb2RlLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKDAsIGNjLndpblNpemUuaGVpZ2h0IC8gMiAtIHRvcE5vZGUuaGVpZ2h0LzIpKTtcblxuICAgICAgICB0aGlzLnRvcENvbSA9IHRvcE5vZGU7XG4gICAgfVxuXG4gICAgLy8g5Yid5aeL5YyW5ri45oiP55WM6Z2iXG4gICAgYXN5bmMgaW5pdEdhbWVQYW5lbCgpIHtcbiAgICAgICAgY29uc3QgcHJlZmFiID0gYXdhaXQgdWltYW5hZ2VyLmxvYWRQcmVmYWIoJ3ByZWZhYi96eXgvenl4R2FtZScpO1xuICAgICAgICBjb25zdCBnYW1lTm9kZSA9IGNjLmluc3RhbnRpYXRlKHByZWZhYik7XG4gICAgICAgIHVpbWFuYWdlci5hZGQoZ2FtZU5vZGUsIExBWUVSLlVJKTtcbiAgICAgICAgZ2FtZU5vZGUuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoMCwgMCkpO1xuICAgIH1cblxuICAgIG9uU2hvdygpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF3aW5kb3dbJ3d4J10pIHJldHVybjtcbiAgICAgICAgd3gub25TaG93KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvblNob3cnKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBvbkhpZGUoKTogdm9pZCB7XG4gICAgICAgIGlmICghd2luZG93Wyd3eCddKSByZXR1cm47XG4gICAgICAgIHd4Lm9uSGlkZSgoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnb25IaWRlJyk7XG4gICAgICAgIH0pXG4gICAgfVxufSJdfQ==