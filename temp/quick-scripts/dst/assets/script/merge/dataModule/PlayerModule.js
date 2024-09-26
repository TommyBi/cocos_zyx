
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
var ZyxGameModule_1 = require("./ZyxGameModule");
var PlayerModule = /** @class */ (function (_super) {
    __extends(PlayerModule, _super);
    function PlayerModule() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // 资源信息
        _this.diamond = 0;
        _this.star = 0;
        _this.hammer = 0;
        _this.bomb = 0;
        // 玩家信息
        _this.nickName = '';
        _this.avatar = '';
        _this.lv = 0;
        _this.exp = 0;
        _this.expTar = 0;
        return _this;
    }
    PlayerModule.prototype.parseData = function (data) {
        _super.prototype.parseData.call(this, data);
    };
    PlayerModule.prototype.login = function (cb) {
        var loginData = {
            // 资源信息
            diamond: 10,
            star: 3,
            bomb: 3,
            hammer: 3,
            // 玩家信息
            nickName: '测试用户',
            avatar: '',
            lv: 1,
            exp: 10,
            expTar: 100,
            scoreRecord: 10,
            // 状态信息
            gameInfo: {
                adTimes: 3,
                score: 0,
                exp: 0,
                diamond: 0,
                star: 0,
                // 格子当前使用到的唯一索引值
                uniqueId: 9,
                goods: {},
            },
        };
        GameModule_1.gameModule.parseData(loginData);
        GoodsModule_1.goodsModule.parseData(loginData);
        ZyxGameModule_1.zyxGameModule.parseData(loginData);
        setTimeout(function () {
            cb && cb();
        }, 1000);
    };
    return PlayerModule;
}(DataModule_1.default));
exports.default = PlayerModule;
exports.playerModule = new PlayerModule();
/**
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
                url: ``,
            }, {
                id: 2,
                star: 3,
                total: 100,
                used: 0,
                name: '1箱牛奶',
                desc: '商品2',
                url: ``,
            }, {
                id: 3,
                star: 5,
                total: 100,
                used: 0,
                name: '一箱红牛',
                desc: '商品3',
                url: ``,
            }, {
                id: 4,
                star: 5,
                total: 100,
                used: 0,
                name: '一箱饼干',
                desc: '商品4',
                url: ``,
            }, {
                id: 5,
                star: 8,
                total: 100,
                used: 0,
                name: '星巴克100券',
                desc: '商品5',
                url: ``,
            }, {
                id: 6,
                star: 10,
                total: 100,
                used: 0,
                name: '电子手表',
                desc: '商品6',
                url: ``,
            }, {
                id: 7,
                star: 10,
                total: 100,
                used: 0,
                name: '北京1日游',
                desc: '商品7',
                url: ``,
            }, {
                id: 8,
                star: 20,
                total: 100,
                used: 0,
                name: '5克黄金',
                desc: '商品8',
                url: ``,
            }
            ]
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9QbGF5ZXJNb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFzQztBQUN0QywyQ0FBMEM7QUFDMUMsNkNBQTRDO0FBQzVDLGlEQUFnRDtBQUVoRDtJQUEwQyxnQ0FBVTtJQUFwRDtRQUFBLHFFQXVEQztRQXRERyxPQUFPO1FBQ1AsYUFBTyxHQUFXLENBQUMsQ0FBQztRQUNwQixVQUFJLEdBQVcsQ0FBQyxDQUFDO1FBQ2pCLFlBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsVUFBSSxHQUFXLENBQUMsQ0FBQztRQUVqQixPQUFPO1FBQ1AsY0FBUSxHQUFXLEVBQUUsQ0FBQztRQUN0QixZQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLFFBQUUsR0FBVyxDQUFDLENBQUM7UUFDZixTQUFHLEdBQVcsQ0FBQyxDQUFDO1FBQ2hCLFlBQU0sR0FBVyxDQUFDLENBQUM7O0lBMkN2QixDQUFDO0lBekNHLGdDQUFTLEdBQVQsVUFBVSxJQUFTO1FBQ2YsaUJBQU0sU0FBUyxZQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCw0QkFBSyxHQUFMLFVBQU0sRUFBWTtRQUNkLElBQU0sU0FBUyxHQUFHO1lBQ2QsT0FBTztZQUNQLE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxFQUFFLENBQUM7WUFDUCxJQUFJLEVBQUUsQ0FBQztZQUNQLE1BQU0sRUFBRSxDQUFDO1lBRVQsT0FBTztZQUNQLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsRUFBRSxFQUFFLENBQUM7WUFDTCxHQUFHLEVBQUUsRUFBRTtZQUNQLE1BQU0sRUFBRSxHQUFHO1lBQ1gsV0FBVyxFQUFFLEVBQUU7WUFFZixPQUFPO1lBQ1AsUUFBUSxFQUFFO2dCQUNOLE9BQU8sRUFBRSxDQUFDO2dCQUNWLEtBQUssRUFBRSxDQUFDO2dCQUNSLEdBQUcsRUFBRSxDQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDO2dCQUNWLElBQUksRUFBRSxDQUFDO2dCQUNQLGdCQUFnQjtnQkFDaEIsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsS0FBSyxFQUFFLEVBQUU7YUFDWjtTQUNKLENBQUE7UUFFRCx1QkFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoQyx5QkFBVyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqQyw2QkFBYSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVuQyxVQUFVLENBQUM7WUFDUCxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7UUFDZixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDYixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQXZEQSxBQXVEQyxDQXZEeUMsb0JBQVUsR0F1RG5EOztBQUNZLFFBQUEsWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7QUFJL0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0ZHIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERhdGFNb2R1bGUgZnJvbSAnLi9EYXRhTW9kdWxlJztcbmltcG9ydCB7IGdhbWVNb2R1bGUgfSBmcm9tICcuL0dhbWVNb2R1bGUnO1xuaW1wb3J0IHsgZ29vZHNNb2R1bGUgfSBmcm9tICcuL0dvb2RzTW9kdWxlJztcbmltcG9ydCB7IHp5eEdhbWVNb2R1bGUgfSBmcm9tICcuL1p5eEdhbWVNb2R1bGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJNb2R1bGUgZXh0ZW5kcyBEYXRhTW9kdWxlIHtcbiAgICAvLyDotYTmupDkv6Hmga9cbiAgICBkaWFtb25kOiBudW1iZXIgPSAwO1xuICAgIHN0YXI6IG51bWJlciA9IDA7XG4gICAgaGFtbWVyOiBudW1iZXIgPSAwO1xuICAgIGJvbWI6IG51bWJlciA9IDA7XG5cbiAgICAvLyDnjqnlrrbkv6Hmga9cbiAgICBuaWNrTmFtZTogc3RyaW5nID0gJyc7XG4gICAgYXZhdGFyOiBzdHJpbmcgPSAnJztcbiAgICBsdjogbnVtYmVyID0gMDtcbiAgICBleHA6IG51bWJlciA9IDA7XG4gICAgZXhwVGFyOiBudW1iZXIgPSAwO1xuXG4gICAgcGFyc2VEYXRhKGRhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBzdXBlci5wYXJzZURhdGEoZGF0YSk7XG4gICAgfVxuXG4gICAgbG9naW4oY2I6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGxvZ2luRGF0YSA9IHtcbiAgICAgICAgICAgIC8vIOi1hOa6kOS/oeaBr1xuICAgICAgICAgICAgZGlhbW9uZDogMTAsXG4gICAgICAgICAgICBzdGFyOiAzLFxuICAgICAgICAgICAgYm9tYjogMyxcbiAgICAgICAgICAgIGhhbW1lcjogMyxcblxuICAgICAgICAgICAgLy8g546p5a625L+h5oGvXG4gICAgICAgICAgICBuaWNrTmFtZTogJ+a1i+ivleeUqOaItycsXG4gICAgICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICAgICAgbHY6IDEsXG4gICAgICAgICAgICBleHA6IDEwLFxuICAgICAgICAgICAgZXhwVGFyOiAxMDAsXG4gICAgICAgICAgICBzY29yZVJlY29yZDogMTAsXG5cbiAgICAgICAgICAgIC8vIOeKtuaAgeS/oeaBr1xuICAgICAgICAgICAgZ2FtZUluZm86IHtcbiAgICAgICAgICAgICAgICBhZFRpbWVzOiAzLFxuICAgICAgICAgICAgICAgIHNjb3JlOiAwLFxuICAgICAgICAgICAgICAgIGV4cDogMCxcbiAgICAgICAgICAgICAgICBkaWFtb25kOiAwLFxuICAgICAgICAgICAgICAgIHN0YXI6IDAsXG4gICAgICAgICAgICAgICAgLy8g5qC85a2Q5b2T5YmN5L2/55So5Yiw55qE5ZSv5LiA57Si5byV5YC8XG4gICAgICAgICAgICAgICAgdW5pcXVlSWQ6IDksXG4gICAgICAgICAgICAgICAgZ29vZHM6IHt9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVNb2R1bGUucGFyc2VEYXRhKGxvZ2luRGF0YSk7XG4gICAgICAgIGdvb2RzTW9kdWxlLnBhcnNlRGF0YShsb2dpbkRhdGEpO1xuICAgICAgICB6eXhHYW1lTW9kdWxlLnBhcnNlRGF0YShsb2dpbkRhdGEpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2IgJiYgY2IoKTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IHBsYXllck1vZHVsZSA9IG5ldyBQbGF5ZXJNb2R1bGUoKTtcblxuXG5cbi8qKlxuLy8g5Yid5aeL5YyW55qE562556CB6YWN572uXG4gICAgICAgICAgICBzbG90RGF0YTogW1xuICAgICAgICAgICAgICAgIFsxLCAxLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMiwgMiwgMiwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzEsIDEsIDIsIDIsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFsyLCAyLCAyLCAzLCAzLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICBdLFxuXG4gICAgICAgICAgICAvLyDlpZblirHlhZHmjaLphY3nva7kv6Hmga9cbiAgICAgICAgICAgIGdvb2RzOiBbe1xuICAgICAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgICAgIHN0YXI6IDEsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICcx55uS57q45be+JyxcbiAgICAgICAgICAgICAgICBkZXNjOiAn5ZWG5ZOBMScsXG4gICAgICAgICAgICAgICAgdXJsOiBgYCxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpZDogMixcbiAgICAgICAgICAgICAgICBzdGFyOiAzLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAnMeeuseeJm+WlticsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTInLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDMsXG4gICAgICAgICAgICAgICAgc3RhcjogNSxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+S4gOeusee6oueJmycsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTMnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDQsXG4gICAgICAgICAgICAgICAgc3RhcjogNSxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+S4gOeusemlvOW5sicsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTQnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDUsXG4gICAgICAgICAgICAgICAgc3RhcjogOCxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+aYn+W3tOWFizEwMOWIuCcsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTUnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDYsXG4gICAgICAgICAgICAgICAgc3RhcjogMTAsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICfnlLXlrZDmiYvooagnLFxuICAgICAgICAgICAgICAgIGRlc2M6ICfllYblk4E2JyxcbiAgICAgICAgICAgICAgICB1cmw6IGBgLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGlkOiA3LFxuICAgICAgICAgICAgICAgIHN0YXI6IDEwLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAn5YyX5LqsMeaXpea4uCcsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTcnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDgsXG4gICAgICAgICAgICAgICAgc3RhcjogMjAsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICc15YWL6buE6YeRJyxcbiAgICAgICAgICAgICAgICBkZXNjOiAn5ZWG5ZOBOCcsXG4gICAgICAgICAgICAgICAgdXJsOiBgYCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAqLyJdfQ==