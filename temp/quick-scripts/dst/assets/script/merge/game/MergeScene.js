
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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var MergeScene = /** @class */ (function (_super) {
    __extends(MergeScene, _super);
    function MergeScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MergeScene.prototype.onLoad = function () {
        console.log('load mergeScene');
    };
    MergeScene.prototype.start = function () {
        var _this = this;
        // 初始化界面层级
        Uimanager_1.uimanager.init(this.node);
        // login
        PlayerModule_1.playerModule.login(function () {
            // 初始化音频
            AudioMgr_1.audioMgr.init();
            // 添加游戏玩法界面
            _this.initGamePanel();
        });
        this.onShow();
        this.onHide();
    };
    MergeScene.prototype.update = function () {
        Uimanager_1.uimanager.udpateLayerShow();
    };
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
        wx.onShow(function () {
            console.log('onShow');
        });
    };
    MergeScene.prototype.onHide = function () {
        wx.onHide(function () {
            console.log('onHide');
        });
    };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZ2FtZS9NZXJnZVNjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUEwRDtBQUMxRCxtREFBNkM7QUFDN0MsZ0RBQStDO0FBQy9DLGtEQUFpRDtBQUUzQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUF3Qyw4QkFBWTtJQUFwRDs7SUE2Q0EsQ0FBQztJQTNDRywyQkFBTSxHQUFOO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCwwQkFBSyxHQUFMO1FBQUEsaUJBZUM7UUFkRyxVQUFVO1FBQ1YscUJBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTFCLFFBQVE7UUFDUiwyQkFBWSxDQUFDLEtBQUssQ0FBQztZQUNmLFFBQVE7WUFDUixtQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRWhCLFdBQVc7WUFDWCxLQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELDJCQUFNLEdBQU47UUFDSSxxQkFBUyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFSyxrQ0FBYSxHQUFuQjs7Ozs7NEJBQ21CLHFCQUFNLHFCQUFTLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEVBQUE7O3dCQUF4RCxNQUFNLEdBQUcsU0FBK0M7d0JBQ3hELFFBQVEsR0FBWSxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNqRCxxQkFBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDbEMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQzNDO0lBRUQsMkJBQU0sR0FBTjtRQUNJLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVELDJCQUFNLEdBQU47UUFDSSxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUE1Q2dCLFVBQVU7UUFEOUIsT0FBTztPQUNhLFVBQVUsQ0E2QzlCO0lBQUQsaUJBQUM7Q0E3Q0QsQUE2Q0MsQ0E3Q3VDLEVBQUUsQ0FBQyxTQUFTLEdBNkNuRDtrQkE3Q29CLFVBQVU7QUErQy9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkciLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwbGF5ZXJNb2R1bGUgfSBmcm9tICcuLi9kYXRhTW9kdWxlL1BsYXllck1vZHVsZSc7XG5pbXBvcnQgeyBMQVlFUiB9IGZyb20gJy4uL2RlZmluZS9UeXBlRGVmaW5lJztcbmltcG9ydCB7IGF1ZGlvTWdyIH0gZnJvbSAnLi4vbWFuYWdlci9BdWRpb01ncic7XG5pbXBvcnQgeyB1aW1hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2VyL1VpbWFuYWdlcic7XG5cbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXJnZVNjZW5lIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblxuICAgIG9uTG9hZCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2xvYWQgbWVyZ2VTY2VuZScpO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgICAvLyDliJ3lp4vljJbnlYzpnaLlsYLnuqdcbiAgICAgICAgdWltYW5hZ2VyLmluaXQodGhpcy5ub2RlKTtcblxuICAgICAgICAvLyBsb2dpblxuICAgICAgICBwbGF5ZXJNb2R1bGUubG9naW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8g5Yid5aeL5YyW6Z+z6aKRXG4gICAgICAgICAgICBhdWRpb01nci5pbml0KCk7XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoOa4uOaIj+eOqeazleeVjOmdolxuICAgICAgICAgICAgdGhpcy5pbml0R2FtZVBhbmVsKCk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5vblNob3coKTtcbiAgICAgICAgdGhpcy5vbkhpZGUoKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHVpbWFuYWdlci51ZHBhdGVMYXllclNob3coKTtcbiAgICB9XG5cbiAgICBhc3luYyBpbml0R2FtZVBhbmVsKCkge1xuICAgICAgICBjb25zdCBwcmVmYWIgPSBhd2FpdCB1aW1hbmFnZXIubG9hZFByZWZhYigncHJlZmFiL21lcmdlL2dhbWUnKTtcbiAgICAgICAgY29uc3QgZ2FtZU5vZGU6IGNjLk5vZGUgPSBjYy5pbnN0YW50aWF0ZShwcmVmYWIpO1xuICAgICAgICB1aW1hbmFnZXIuYWRkKGdhbWVOb2RlLCBMQVlFUi5VSSk7XG4gICAgICAgIGdhbWVOb2RlLnNldFBvc2l0aW9uKG5ldyBjYy5WZWMyKDAsIDApKTtcbiAgICB9XG5cbiAgICBvblNob3coKTogdm9pZCB7XG4gICAgICAgIHd4Lm9uU2hvdygoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnb25TaG93Jyk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgb25IaWRlKCk6IHZvaWQge1xuICAgICAgICB3eC5vbkhpZGUoKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ29uSGlkZScpO1xuICAgICAgICB9KVxuICAgIH1cbn1cblxuLyoqXG4gKiAgICAgIDHjgIHlkIjmiJDmlbDlrZcxNeiOt+W+lzHkuKrmmJ/mmJ/vvIzpobbpg6jmmL7npLrlvZPliY3mmJ/mmJ/mjIHmnInmgLvmlbDvvJtcbiAqICAgICAgICAgIOW9k+WQiOaIkDjkuYvliY3vvIzmr4/mrKHlj5HmlL415Liq77yM57G75Z6L5Li6MuS4qu+8jOaVsOWtl+WMuumXtOWbuuWumuWcqDF+N+S5i+mXtO+8m1xuICogICAgICAgICAg5b2T5ZCI5oiQOOS5i+WQju+8jOavj+asoeWPkeaUvjbkuKrvvIznsbvlnovkuLoz5Liq77yM5pWw5a2X5Yy66Ze05Zu65a6a5ZyobWlufjfkuYvpl7TvvJtcbiAqICAgICAgICAgIOW9k+WQiOaIkDEw5LmL5ZCO77yM5q+P5qyh5Y+R5pS+N+S4qu+8jOexu+Wei+S4ujTkuKrvvIzmlbDlrZfljLrpl7Tlm7rlrprlnKhtaW5+OOS5i+mXtO+8m1xuICogICAgICAgICAg5b2T5ZCI5oiQMTLkuYvlkI7vvIzmr4/mrKHlj5HmlL4xMOS4qu+8jOexu+Wei+S4ujXkuKrvvIzmlbDlrZfljLrpl7Tlm7rlrprlnKhtaW5+MTDkuYvpl7TvvJtcbiAqXG4gKiAgICAgICAgICDpmLLkvZzlvIrvvJpcbiAqICAgICAgICAgIOW9k+S7iuaXpeWFqOacjeWQiOaIkOaYn+aYn+aAu+aVsOmHjyA+IDEwMCB8fCDlvZPkurrljZXml6XlkIjmiJDmgLvmmJ/mmJ8gPiA177yMIOWQiOaIkDEy5ZCO77yM5q+P5qyh5Y+R5pS+MTXkuKrvvIznsbvlnovkuLo35Liq77yM5pWw5a2X5Yy66Ze0bWlufjEwOyjotovov5Hkuo7ml6Dms5Xnu6fnu63ovr7miJDvvIzmjqfliLbmlL7lh7rmgLvph48pO1xuICpcbiAqXG4gKiAgICAgIDLjgIHmuIXnkIbop4TliJlcbiAqICAgICAgICAgIOavj+WxgOWPr+S7peWFjei0ueaVtOeQhuS4gOasoe+8m1xuICogICAgICAgICAg5q+P5bGA5Y+v5Lul6YCa6L+H5YiG5Lqr5Yqf6IO95LiA5qyh5pW055CG77ybXG4gKiAgICAgICAgICDmr4/lsYDlj6/ku6XpgJrov4fnnIvop4bpopHlrozmiJDkuIDmrKHmlbTnkIbvvJtcbiAqICAgICAgICAgIOS7peS4iuaJgOacieaWueW8j+eUqOi/h+WQju+8jOi/mOWPr+S7pemAmui/h+WIt+aWsOmBk+WFt+aVtOeQhu+8m1xuICogICAgICAgICAg5Yi35paw6YGT5YW35Y+v5Lul6YCa6L+H6YKA6K+36I635b6X77yM5q+P6YKA6K+3MeS4quS6uu+8jOi1oOmAgeS4gOS4quWIt+aWsOmBk+WFt++8jOWIt+aWsOmBk+WFt+S5n+WPr+S7pemAmui/h+aYn+aYn+WFkeaNouiOt+W+l++8m1xuICogICAgICA344CB5ZWG5ZOB5riF5Y2V5rua5Yqo5pKt5pS+77yaNOS4quWIt+aWsOmBk+WFt+mcgOimgTHkuKrmmJ/mmJ/jgIEx566x6YeR5YW454mb5aW2MjnkuKrmmJ/mmJ/vvIwx5YyF5b+D55u45Y2w5rm/5be+6ZyA6KaBNeS4quaYn+aYn++8jDHmnKxES+eZvuenkeWFqOS5pjMw5Liq5pif5pifLi4u5ZWG5ZOB5qiq5ZCR5rua5Yqo5bGV56S65riF5Y2V5pyA5Y+z5L6n5L+d55WZ4oCc5pu05aSa5aWW5Yqx4oCd5oyJ6ZKu77ybXG4gKiAgICAgIDjjgIHpgInmi6nlrp7nianlhZHmjaLlkI7vvIzlhZHmjaLpobXpnaLloavlhpnigJzmlLbku7bkurrjgIHmlLbku7blnLDlnYDjgIHogZTns7vmlrnlvI/igJ3vvIzlubblnKjnoa7orqTlhZHmjaLliY3vvIzlvLnlh7rnoa7orqTmlLbotKfkv6Hmga/nmoTnoa7orqTljZXku6Xlj4rkuI3pgIDkuI3mjaLnmoTlo7DmmI7vvJtcbiAqICAgICAgOeOAgea3u+WKoOinhOWImemhtemdou+8jOinhOWImemhtemdoua3u+WKoOWFjei0o+WjsOaYju+8jOS7peWPiuS4jemAgOaNouWjsOaYju+8m1xuICogICAgICAxMOOAgea3u+WKoOWOhuWPsuaYn+aYn+aAu+iOt+W+l+aVsOaOkuihjOamnO+8m1xuICovXG4iXX0=