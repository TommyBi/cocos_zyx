
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/dataModule/PlayerModule.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b9091AjnB9Hj67aGxm4Vaq5', 'PlayerModule');
// script/merge/dataModule/PlayerModule.ts

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
exports.playerModule = void 0;
var DataModule_1 = require("./DataModule");
var GameModule_1 = require("./GameModule");
var GoodsModule_1 = require("./GoodsModule");
var PlayerModule = /** @class */ (function (_super) {
    __extends(PlayerModule, _super);
    function PlayerModule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PlayerModule.prototype.parseData = function (data) {
        _super.prototype.parseData.call(this, data);
    };
    PlayerModule.prototype.login = function (cb) {
        var loginData = {
            star: 0,
            // 初始化的筹码配置
            slotData: [
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 2, 2, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 3, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
            // 奖励兑换配置信息
            goods: [{
                    id: 1,
                    star: 1,
                    total: 100,
                    used: 0,
                    name: '1盒纸巾',
                    desc: '商品1',
                    url: "",
                }, {
                    id: 2,
                    star: 3,
                    total: 100,
                    used: 0,
                    name: '1箱牛奶',
                    desc: '商品2',
                    url: "",
                }, {
                    id: 3,
                    star: 5,
                    total: 100,
                    used: 0,
                    name: '一箱红牛',
                    desc: '商品3',
                    url: "",
                }, {
                    id: 4,
                    star: 5,
                    total: 100,
                    used: 0,
                    name: '一箱饼干',
                    desc: '商品4',
                    url: "",
                }, {
                    id: 5,
                    star: 8,
                    total: 100,
                    used: 0,
                    name: '星巴克100券',
                    desc: '商品5',
                    url: "",
                }, {
                    id: 6,
                    star: 10,
                    total: 100,
                    used: 0,
                    name: '电子手表',
                    desc: '商品6',
                    url: "",
                }, {
                    id: 7,
                    star: 10,
                    total: 100,
                    used: 0,
                    name: '北京1日游',
                    desc: '商品7',
                    url: "",
                }, {
                    id: 8,
                    star: 20,
                    total: 100,
                    used: 0,
                    name: '5克黄金',
                    desc: '商品8',
                    url: "",
                }
            ]
        };
        GameModule_1.gameModule.parseData(loginData);
        GoodsModule_1.goodsModule.parseData(loginData);
        cb && cb();
    };
    return PlayerModule;
}(DataModule_1.default));
exports.default = PlayerModule;
exports.playerModule = new PlayerModule();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9QbGF5ZXJNb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFzQztBQUN0QywyQ0FBMEM7QUFDMUMsNkNBQTRDO0FBRTVDO0lBQTBDLGdDQUFVO0lBQXBEOztJQStGQSxDQUFDO0lBN0ZHLGdDQUFTLEdBQVQsVUFBVSxJQUFTO1FBQ2YsaUJBQU0sU0FBUyxZQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCw0QkFBSyxHQUFMLFVBQU0sRUFBWTtRQUNkLElBQU0sU0FBUyxHQUFHO1lBQ2QsSUFBSSxFQUFFLENBQUM7WUFFUCxXQUFXO1lBQ1gsUUFBUSxFQUFFO2dCQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDOUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzlCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFD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LG1CQUFDO0FBQUQsQ0EvRkEsQUErRkMsQ0EvRnlDLG9CQUFVLEdBK0ZuRDs7QUFDWSxRQUFBLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERhdGFNb2R1bGUgZnJvbSAnLi9EYXRhTW9kdWxlJztcbmltcG9ydCB7IGdhbWVNb2R1bGUgfSBmcm9tICcuL0dhbWVNb2R1bGUnO1xuaW1wb3J0IHsgZ29vZHNNb2R1bGUgfSBmcm9tICcuL0dvb2RzTW9kdWxlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyTW9kdWxlIGV4dGVuZHMgRGF0YU1vZHVsZSB7XG5cbiAgICBwYXJzZURhdGEoZGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIHN1cGVyLnBhcnNlRGF0YShkYXRhKTtcbiAgICB9XG5cbiAgICBsb2dpbihjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbG9naW5EYXRhID0ge1xuICAgICAgICAgICAgc3RhcjogMCxcblxuICAgICAgICAgICAgLy8g5Yid5aeL5YyW55qE562556CB6YWN572uXG4gICAgICAgICAgICBzbG90RGF0YTogW1xuICAgICAgICAgICAgICAgIFsxLCAxLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMiwgMiwgMiwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzEsIDEsIDIsIDIsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFsyLCAyLCAyLCAzLCAzLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICBdLFxuXG4gICAgICAgICAgICAvLyDlpZblirHlhZHmjaLphY3nva7kv6Hmga9cbiAgICAgICAgICAgIGdvb2RzOiBbe1xuICAgICAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgICAgIHN0YXI6IDEsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICcx55uS57q45be+JyxcbiAgICAgICAgICAgICAgICBkZXNjOiAn5ZWG5ZOBMScsXG4gICAgICAgICAgICAgICAgdXJsOiBgYCxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpZDogMixcbiAgICAgICAgICAgICAgICBzdGFyOiAzLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAnMeeuseeJm+WlticsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTInLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDMsXG4gICAgICAgICAgICAgICAgc3RhcjogNSxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+S4gOeusee6oueJmycsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTMnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDQsXG4gICAgICAgICAgICAgICAgc3RhcjogNSxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+S4gOeusemlvOW5sicsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTQnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDUsXG4gICAgICAgICAgICAgICAgc3RhcjogOCxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+aYn+W3tOWFizEwMOWIuCcsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTUnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDYsXG4gICAgICAgICAgICAgICAgc3RhcjogMTAsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICfnlLXlrZDmiYvooagnLFxuICAgICAgICAgICAgICAgIGRlc2M6ICfllYblk4E2JyxcbiAgICAgICAgICAgICAgICB1cmw6IGBgLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGlkOiA3LFxuICAgICAgICAgICAgICAgIHN0YXI6IDEwLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAn5YyX5LqsMeaXpea4uCcsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTcnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDgsXG4gICAgICAgICAgICAgICAgc3RhcjogMjAsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICc15YWL6buE6YeRJyxcbiAgICAgICAgICAgICAgICBkZXNjOiAn5ZWG5ZOBOCcsXG4gICAgICAgICAgICAgICAgdXJsOiBgYCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVNb2R1bGUucGFyc2VEYXRhKGxvZ2luRGF0YSk7XG4gICAgICAgIGdvb2RzTW9kdWxlLnBhcnNlRGF0YShsb2dpbkRhdGEpO1xuICAgICAgICBjYiAmJiBjYigpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBwbGF5ZXJNb2R1bGUgPSBuZXcgUGxheWVyTW9kdWxlKCk7XG5cbiJdfQ==