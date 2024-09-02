"use strict";
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
        this.onShow();
        this.onHide();
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
                    case 0: return [4 /*yield*/, Uimanager_1.uimanager.loadPrefab('prefab/merge/game')];
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
    MergeScene.prototype.onShow = function () {
        if (!window['wx'])
            return;
        wx.onShow(function () {
            console.log('onShow');
        });
    };
    MergeScene.prototype.onHide = function () {
        if (!window['wx'])
            return;
        wx.onHide(function () {
            console.log('onHide');
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