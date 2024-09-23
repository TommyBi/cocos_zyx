
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/game/MergeScene.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '0af54diud5JN6SYpIPIvcRc', 'MergeScene');
// script/merge/game/MergeScene.ts

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
var WxApiManager_1 = require("../util/WxApiManager");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var MergeScene = /** @class */ (function (_super) {
    __extends(MergeScene, _super);
    function MergeScene() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uBtnStart = null;
        return _this;
    }
    MergeScene.prototype.onLoad = function () {
        console.log('load mergeScene');
        this.uBtnStart.on(cc.Node.EventType.TOUCH_END, this.onStart, this);
        this.uBtnStart.active = false;
    };
    MergeScene.prototype.start = function () {
        var _this = this;
        // 初始化界面层级
        Uimanager_1.uimanager.init(this.node);
        // login
        PlayerModule_1.playerModule.login(function () {
            // 初始化音频
            AudioMgr_1.audioMgr.init();
            // 初始化界面UI
            _this.initUI();
        });
        WxApiManager_1.wxApiManager.onShow();
        WxApiManager_1.wxApiManager.onHide();
    };
    MergeScene.prototype.update = function () {
        Uimanager_1.uimanager.udpateLayerShow();
    };
    MergeScene.prototype.onStart = function () {
        this.initGamePanel();
    };
    // 初始化游戏主场景信息
    MergeScene.prototype.initUI = function () {
        this.uBtnStart.active = true;
        this.initTopCom();
    };
    MergeScene.prototype.initTopCom = function () {
        return __awaiter(this, void 0, void 0, function () {
            var topPre, topNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/zyx/uComTop')];
                    case 1:
                        topPre = _a.sent();
                        topNode = cc.instantiate(topPre);
                        Uimanager_1.uimanager.add(topNode, TypeDefine_1.LAYER.UI);
                        topNode.setPosition(new cc.Vec2(0, 0));
                        return [2 /*return*/];
                }
            });
        });
    };
    // 初始化游戏界面
    MergeScene.prototype.initGamePanel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prefab, gameNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        AudioMgr_1.audioMgr.playSound(AudioMgr_1.SoundType.ZYX_DROP);
                        return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/merge/game')];
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
    __decorate([
        property(cc.Node)
    ], MergeScene.prototype, "uBtnStart", void 0);
    MergeScene = __decorate([
        ccclass
    ], MergeScene);
    return MergeScene;
}(cc.Component));
exports.default = MergeScene;
/**
 *      1、合成数字15获得1个星星，顶部显示当前星星持有总数；
 *          当合成8之前，每次发放5个，类型为2个，数字区间固定在1~7之间；
 *          当合成8之后，每次发放6个，类型为3个，数字区间固定在min~7之间；
 *          当合成10之后，每次发放7个，类型为4个，数字区间固定在min~8之间；
 *          当合成12之后，每次发放10个，类型为5个，数字区间固定在min~10之间；
 *
 *          防作弊：
 *          当今日全服合成星星总数量 > 100 || 当人单日合成总星星 > 5， 合成12后，每次发放15个，类型为7个，数字区间min~10;(趋近于无法继续达成，控制放出总量);
 *
 *
 *      2、清理规则
 *          每局可以免费整理一次；
 *          每局可以通过分享功能一次整理；
 *          每局可以通过看视频完成一次整理；
 *          以上所有方式用过后，还可以通过刷新道具整理；
 *          刷新道具可以通过邀请获得，每邀请1个人，赠送一个刷新道具，刷新道具也可以通过星星兑换获得；
 *      7、商品清单滚动播放：4个刷新道具需要1个星星、1箱金典牛奶29个星星，1包心相印湿巾需要5个星星，1本DK百科全书30个星星...商品横向滚动展示清单最右侧保留“更多奖励”按钮；
 *      8、选择实物兑换后，兑换页面填写“收件人、收件地址、联系方式”，并在确认兑换前，弹出确认收货信息的确认单以及不退不换的声明；
 *      9、添加规则页面，规则页面添加免责声明，以及不退换声明；
 *      10、添加历史星星总获得数排行榜；
 */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9NZXJnZVNjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUEwRDtBQUMxRCxtREFBNkM7QUFDN0MsZ0RBQTBEO0FBQzFELGtEQUFpRDtBQUNqRCxxREFBb0Q7QUFFOUMsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFHNUM7SUFBd0MsOEJBQVk7SUFBcEQ7UUFBQSxxRUE0REM7UUF6REcsZUFBUyxHQUFZLElBQUksQ0FBQzs7SUF5RDlCLENBQUM7SUF2REcsMkJBQU0sR0FBTjtRQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDbEMsQ0FBQztJQUVELDBCQUFLLEdBQUw7UUFBQSxpQkFlQztRQWRHLFVBQVU7UUFDVixxQkFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFMUIsUUFBUTtRQUNSLDJCQUFZLENBQUMsS0FBSyxDQUFDO1lBQ2YsUUFBUTtZQUNSLG1CQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFaEIsVUFBVTtZQUNWLEtBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQTtRQUVGLDJCQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEIsMkJBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsMkJBQU0sR0FBTjtRQUNJLHFCQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELDRCQUFPLEdBQVA7UUFDSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUdELGFBQWE7SUFDYiwyQkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUssK0JBQVUsR0FBaEI7Ozs7OzRCQUNtQixxQkFBTSxxQkFBUyxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFBOzt3QkFBekQsTUFBTSxHQUFHLFNBQWdEO3dCQUN6RCxPQUFPLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDdkMscUJBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGtCQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ2pDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUMxQztJQUVELFVBQVU7SUFDSixrQ0FBYSxHQUFuQjs7Ozs7O3dCQUNJLG1CQUFRLENBQUMsU0FBUyxDQUFDLG9CQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3hCLHFCQUFNLHFCQUFTLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEVBQUE7O3dCQUF4RCxNQUFNLEdBQUcsU0FBK0M7d0JBQ3hELFFBQVEsR0FBWSxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNqRCxxQkFBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDbEMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQzNDO0lBdEREO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7aURBQ1E7SUFIVCxVQUFVO1FBRDlCLE9BQU87T0FDYSxVQUFVLENBNEQ5QjtJQUFELGlCQUFDO0NBNURELEFBNERDLENBNUR1QyxFQUFFLENBQUMsU0FBUyxHQTREbkQ7a0JBNURvQixVQUFVO0FBOEQvQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGxheWVyTW9kdWxlIH0gZnJvbSAnLi4vZGF0YU1vZHVsZS9QbGF5ZXJNb2R1bGUnO1xuaW1wb3J0IHsgTEFZRVIgfSBmcm9tICcuLi9kZWZpbmUvVHlwZURlZmluZSc7XG5pbXBvcnQgeyBhdWRpb01nciwgU291bmRUeXBlIH0gZnJvbSAnLi4vbWFuYWdlci9BdWRpb01ncic7XG5pbXBvcnQgeyB1aW1hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2VyL1VpbWFuYWdlcic7XG5pbXBvcnQgeyB3eEFwaU1hbmFnZXIgfSBmcm9tICcuLi91dGlsL1d4QXBpTWFuYWdlcic7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXJnZVNjZW5lIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHVCdG5TdGFydDogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdsb2FkIG1lcmdlU2NlbmUnKTtcbiAgICAgICAgdGhpcy51QnRuU3RhcnQub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uU3RhcnQsIHRoaXMpO1xuICAgICAgICB0aGlzLnVCdG5TdGFydC5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgLy8g5Yid5aeL5YyW55WM6Z2i5bGC57qnXG4gICAgICAgIHVpbWFuYWdlci5pbml0KHRoaXMubm9kZSk7XG5cbiAgICAgICAgLy8gbG9naW5cbiAgICAgICAgcGxheWVyTW9kdWxlLmxvZ2luKCgpID0+IHtcbiAgICAgICAgICAgIC8vIOWIneWni+WMlumfs+mikVxuICAgICAgICAgICAgYXVkaW9NZ3IuaW5pdCgpO1xuXG4gICAgICAgICAgICAvLyDliJ3lp4vljJbnlYzpnaJVSVxuICAgICAgICAgICAgdGhpcy5pbml0VUkoKTtcbiAgICAgICAgfSlcblxuICAgICAgICB3eEFwaU1hbmFnZXIub25TaG93KCk7XG4gICAgICAgIHd4QXBpTWFuYWdlci5vbkhpZGUoKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHVpbWFuYWdlci51ZHBhdGVMYXllclNob3coKTtcbiAgICB9XG5cbiAgICBvblN0YXJ0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmluaXRHYW1lUGFuZWwoKTtcbiAgICB9XG5cblxuICAgIC8vIOWIneWni+WMlua4uOaIj+S4u+WcuuaZr+S/oeaBr1xuICAgIGluaXRVSSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51QnRuU3RhcnQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbml0VG9wQ29tKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdFRvcENvbSgpIHtcbiAgICAgICAgY29uc3QgdG9wUHJlID0gYXdhaXQgdWltYW5hZ2VyLmxvYWRQcmVmYWIoJ3ByZWZhYi96eXgvdUNvbVRvcCcpO1xuICAgICAgICBjb25zdCB0b3BOb2RlID0gY2MuaW5zdGFudGlhdGUodG9wUHJlKTtcbiAgICAgICAgdWltYW5hZ2VyLmFkZCh0b3BOb2RlLCBMQVlFUi5VSSk7XG4gICAgICAgIHRvcE5vZGUuc2V0UG9zaXRpb24obmV3IGNjLlZlYzIoMCwgMCkpO1xuICAgIH1cblxuICAgIC8vIOWIneWni+WMlua4uOaIj+eVjOmdolxuICAgIGFzeW5jIGluaXRHYW1lUGFuZWwoKSB7XG4gICAgICAgIGF1ZGlvTWdyLnBsYXlTb3VuZChTb3VuZFR5cGUuWllYX0RST1ApO1xuICAgICAgICBjb25zdCBwcmVmYWIgPSBhd2FpdCB1aW1hbmFnZXIubG9hZFByZWZhYigncHJlZmFiL21lcmdlL2dhbWUnKTtcbiAgICAgICAgY29uc3QgZ2FtZU5vZGU6IGNjLk5vZGUgPSBjYy5pbnN0YW50aWF0ZShwcmVmYWIpO1xuICAgICAgICB1aW1hbmFnZXIuYWRkKGdhbWVOb2RlLCBMQVlFUi5VSSk7XG4gICAgICAgIGdhbWVOb2RlLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKDAsIDApKTtcbiAgICB9XG5cblxufVxuXG4vKipcbiAqICAgICAgMeOAgeWQiOaIkOaVsOWtlzE16I635b6XMeS4quaYn+aYn++8jOmhtumDqOaYvuekuuW9k+WJjeaYn+aYn+aMgeacieaAu+aVsO+8m1xuICogICAgICAgICAg5b2T5ZCI5oiQOOS5i+WJje+8jOavj+asoeWPkeaUvjXkuKrvvIznsbvlnovkuLoy5Liq77yM5pWw5a2X5Yy66Ze05Zu65a6a5ZyoMX435LmL6Ze077ybXG4gKiAgICAgICAgICDlvZPlkIjmiJA45LmL5ZCO77yM5q+P5qyh5Y+R5pS+NuS4qu+8jOexu+Wei+S4ujPkuKrvvIzmlbDlrZfljLrpl7Tlm7rlrprlnKhtaW5+N+S5i+mXtO+8m1xuICogICAgICAgICAg5b2T5ZCI5oiQMTDkuYvlkI7vvIzmr4/mrKHlj5HmlL435Liq77yM57G75Z6L5Li6NOS4qu+8jOaVsOWtl+WMuumXtOWbuuWumuWcqG1pbn445LmL6Ze077ybXG4gKiAgICAgICAgICDlvZPlkIjmiJAxMuS5i+WQju+8jOavj+asoeWPkeaUvjEw5Liq77yM57G75Z6L5Li6NeS4qu+8jOaVsOWtl+WMuumXtOWbuuWumuWcqG1pbn4xMOS5i+mXtO+8m1xuICpcbiAqICAgICAgICAgIOmYsuS9nOW8iu+8mlxuICogICAgICAgICAg5b2T5LuK5pel5YWo5pyN5ZCI5oiQ5pif5pif5oC75pWw6YePID4gMTAwIHx8IOW9k+S6uuWNleaXpeWQiOaIkOaAu+aYn+aYnyA+IDXvvIwg5ZCI5oiQMTLlkI7vvIzmr4/mrKHlj5HmlL4xNeS4qu+8jOexu+Wei+S4ujfkuKrvvIzmlbDlrZfljLrpl7RtaW5+MTA7KOi2i+i/keS6juaXoOazlee7p+e7rei+vuaIkO+8jOaOp+WItuaUvuWHuuaAu+mHjyk7XG4gKlxuICpcbiAqICAgICAgMuOAgea4heeQhuinhOWImVxuICogICAgICAgICAg5q+P5bGA5Y+v5Lul5YWN6LS55pW055CG5LiA5qyh77ybXG4gKiAgICAgICAgICDmr4/lsYDlj6/ku6XpgJrov4fliIbkuqvlip/og73kuIDmrKHmlbTnkIbvvJtcbiAqICAgICAgICAgIOavj+WxgOWPr+S7pemAmui/h+eci+inhumikeWujOaIkOS4gOasoeaVtOeQhu+8m1xuICogICAgICAgICAg5Lul5LiK5omA5pyJ5pa55byP55So6L+H5ZCO77yM6L+Y5Y+v5Lul6YCa6L+H5Yi35paw6YGT5YW35pW055CG77ybXG4gKiAgICAgICAgICDliLfmlrDpgZPlhbflj6/ku6XpgJrov4fpgoDor7fojrflvpfvvIzmr4/pgoDor7cx5Liq5Lq677yM6LWg6YCB5LiA5Liq5Yi35paw6YGT5YW377yM5Yi35paw6YGT5YW35Lmf5Y+v5Lul6YCa6L+H5pif5pif5YWR5o2i6I635b6X77ybXG4gKiAgICAgIDfjgIHllYblk4HmuIXljZXmu5rliqjmkq3mlL7vvJo05Liq5Yi35paw6YGT5YW36ZyA6KaBMeS4quaYn+aYn+OAgTHnrrHph5HlhbjniZvlpbYyOeS4quaYn+aYn++8jDHljIXlv4Pnm7jljbDmub/lt77pnIDopoE15Liq5pif5pif77yMMeacrERL55m+56eR5YWo5LmmMzDkuKrmmJ/mmJ8uLi7llYblk4HmqKrlkJHmu5rliqjlsZXnpLrmuIXljZXmnIDlj7Pkvqfkv53nlZnigJzmm7TlpJrlpZblirHigJ3mjInpkq7vvJtcbiAqICAgICAgOOOAgemAieaLqeWunueJqeWFkeaNouWQju+8jOWFkeaNoumhtemdouWhq+WGmeKAnOaUtuS7tuS6uuOAgeaUtuS7tuWcsOWdgOOAgeiBlOezu+aWueW8j+KAne+8jOW5tuWcqOehruiupOWFkeaNouWJje+8jOW8ueWHuuehruiupOaUtui0p+S/oeaBr+eahOehruiupOWNleS7peWPiuS4jemAgOS4jeaNoueahOWjsOaYju+8m1xuICogICAgICA544CB5re75Yqg6KeE5YiZ6aG16Z2i77yM6KeE5YiZ6aG16Z2i5re75Yqg5YWN6LSj5aOw5piO77yM5Lul5Y+K5LiN6YCA5o2i5aOw5piO77ybXG4gKiAgICAgIDEw44CB5re75Yqg5Y6G5Y+y5pif5pif5oC76I635b6X5pWw5o6S6KGM5qac77ybXG4gKi9cbiJdfQ==