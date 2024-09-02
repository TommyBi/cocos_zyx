
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
            // 状态信息
            gameInfo: {
                adTimes: 3,
                score: 0,
                exp: 0,
                diamond: 0,
                star: 0,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvZGF0YU1vZHVsZS9QbGF5ZXJNb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFzQztBQUN0QywyQ0FBMEM7QUFDMUMsNkNBQTRDO0FBQzVDLGlEQUFnRDtBQUVoRDtJQUEwQyxnQ0FBVTtJQUFwRDtRQUFBLHFFQW1EQztRQWxERyxPQUFPO1FBQ1AsYUFBTyxHQUFXLENBQUMsQ0FBQztRQUNwQixVQUFJLEdBQVcsQ0FBQyxDQUFDO1FBQ2pCLFlBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsVUFBSSxHQUFXLENBQUMsQ0FBQztRQUVqQixPQUFPO1FBQ1AsY0FBUSxHQUFXLEVBQUUsQ0FBQztRQUN0QixZQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLFFBQUUsR0FBVyxDQUFDLENBQUM7UUFDZixTQUFHLEdBQVcsQ0FBQyxDQUFDO1FBQ2hCLFlBQU0sR0FBVyxDQUFDLENBQUM7O0lBdUN2QixDQUFDO0lBckNHLGdDQUFTLEdBQVQsVUFBVSxJQUFTO1FBQ2YsaUJBQU0sU0FBUyxZQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCw0QkFBSyxHQUFMLFVBQU0sRUFBWTtRQUNkLElBQU0sU0FBUyxHQUFHO1lBQ2QsT0FBTztZQUNQLE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxFQUFFLENBQUM7WUFDUCxJQUFJLEVBQUUsQ0FBQztZQUNQLE1BQU0sRUFBRSxDQUFDO1lBRVQsT0FBTztZQUNQLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsRUFBRSxFQUFFLENBQUM7WUFDTCxHQUFHLEVBQUUsRUFBRTtZQUNQLE1BQU0sRUFBRSxHQUFHO1lBRVgsT0FBTztZQUNQLFFBQVEsRUFBRTtnQkFDTixPQUFPLEVBQUUsQ0FBQztnQkFDVixLQUFLLEVBQUUsQ0FBQztnQkFDUixHQUFHLEVBQUUsQ0FBQztnQkFDTixPQUFPLEVBQUUsQ0FBQztnQkFDVixJQUFJLEVBQUUsQ0FBQzthQUNWO1NBQ0osQ0FBQTtRQUVELHVCQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLHlCQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pDLDZCQUFhLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRW5DLFVBQVUsQ0FBQztZQUNQLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUNmLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNiLENBQUM7SUFDTCxtQkFBQztBQUFELENBbkRBLEFBbURDLENBbkR5QyxvQkFBVSxHQW1EbkQ7O0FBQ1ksUUFBQSxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUkvQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnRkciLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGF0YU1vZHVsZSBmcm9tICcuL0RhdGFNb2R1bGUnO1xuaW1wb3J0IHsgZ2FtZU1vZHVsZSB9IGZyb20gJy4vR2FtZU1vZHVsZSc7XG5pbXBvcnQgeyBnb29kc01vZHVsZSB9IGZyb20gJy4vR29vZHNNb2R1bGUnO1xuaW1wb3J0IHsgenl4R2FtZU1vZHVsZSB9IGZyb20gJy4vWnl4R2FtZU1vZHVsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllck1vZHVsZSBleHRlbmRzIERhdGFNb2R1bGUge1xuICAgIC8vIOi1hOa6kOS/oeaBr1xuICAgIGRpYW1vbmQ6IG51bWJlciA9IDA7XG4gICAgc3RhcjogbnVtYmVyID0gMDtcbiAgICBoYW1tZXI6IG51bWJlciA9IDA7XG4gICAgYm9tYjogbnVtYmVyID0gMDtcblxuICAgIC8vIOeOqeWutuS/oeaBr1xuICAgIG5pY2tOYW1lOiBzdHJpbmcgPSAnJztcbiAgICBhdmF0YXI6IHN0cmluZyA9ICcnO1xuICAgIGx2OiBudW1iZXIgPSAwO1xuICAgIGV4cDogbnVtYmVyID0gMDtcbiAgICBleHBUYXI6IG51bWJlciA9IDA7XG5cbiAgICBwYXJzZURhdGEoZGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIHN1cGVyLnBhcnNlRGF0YShkYXRhKTtcbiAgICB9XG5cbiAgICBsb2dpbihjYjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbG9naW5EYXRhID0ge1xuICAgICAgICAgICAgLy8g6LWE5rqQ5L+h5oGvXG4gICAgICAgICAgICBkaWFtb25kOiAxMCxcbiAgICAgICAgICAgIHN0YXI6IDMsXG4gICAgICAgICAgICBib21iOiAzLFxuICAgICAgICAgICAgaGFtbWVyOiAzLFxuXG4gICAgICAgICAgICAvLyDnjqnlrrbkv6Hmga9cbiAgICAgICAgICAgIG5pY2tOYW1lOiAn5rWL6K+V55So5oi3JyxcbiAgICAgICAgICAgIGF2YXRhcjogJycsXG4gICAgICAgICAgICBsdjogMSxcbiAgICAgICAgICAgIGV4cDogMTAsXG4gICAgICAgICAgICBleHBUYXI6IDEwMCxcblxuICAgICAgICAgICAgLy8g54q25oCB5L+h5oGvXG4gICAgICAgICAgICBnYW1lSW5mbzoge1xuICAgICAgICAgICAgICAgIGFkVGltZXM6IDMsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDAsXG4gICAgICAgICAgICAgICAgZXhwOiAwLFxuICAgICAgICAgICAgICAgIGRpYW1vbmQ6IDAsXG4gICAgICAgICAgICAgICAgc3RhcjogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cblxuICAgICAgICBnYW1lTW9kdWxlLnBhcnNlRGF0YShsb2dpbkRhdGEpO1xuICAgICAgICBnb29kc01vZHVsZS5wYXJzZURhdGEobG9naW5EYXRhKTtcbiAgICAgICAgenl4R2FtZU1vZHVsZS5wYXJzZURhdGEobG9naW5EYXRhKTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNiICYmIGNiKCk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBwbGF5ZXJNb2R1bGUgPSBuZXcgUGxheWVyTW9kdWxlKCk7XG5cblxuXG4vKipcbi8vIOWIneWni+WMlueahOetueeggemFjee9rlxuICAgICAgICAgICAgc2xvdERhdGE6IFtcbiAgICAgICAgICAgICAgICBbMSwgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzIsIDIsIDIsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFsxLCAxLCAyLCAyLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMiwgMiwgMiwgMywgMywgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgXSxcblxuICAgICAgICAgICAgLy8g5aWW5Yqx5YWR5o2i6YWN572u5L+h5oGvXG4gICAgICAgICAgICBnb29kczogW3tcbiAgICAgICAgICAgICAgICBpZDogMSxcbiAgICAgICAgICAgICAgICBzdGFyOiAxLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAnMeebkue6uOW3vicsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTEnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaWQ6IDIsXG4gICAgICAgICAgICAgICAgc3RhcjogMyxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJzHnrrHniZvlpbYnLFxuICAgICAgICAgICAgICAgIGRlc2M6ICfllYblk4EyJyxcbiAgICAgICAgICAgICAgICB1cmw6IGBgLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGlkOiAzLFxuICAgICAgICAgICAgICAgIHN0YXI6IDUsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICfkuIDnrrHnuqLniZsnLFxuICAgICAgICAgICAgICAgIGRlc2M6ICfllYblk4EzJyxcbiAgICAgICAgICAgICAgICB1cmw6IGBgLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGlkOiA0LFxuICAgICAgICAgICAgICAgIHN0YXI6IDUsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICfkuIDnrrHppbzlubInLFxuICAgICAgICAgICAgICAgIGRlc2M6ICfllYblk4E0JyxcbiAgICAgICAgICAgICAgICB1cmw6IGBgLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGlkOiA1LFxuICAgICAgICAgICAgICAgIHN0YXI6IDgsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICB1c2VkOiAwLFxuICAgICAgICAgICAgICAgIG5hbWU6ICfmmJ/lt7TlhYsxMDDliLgnLFxuICAgICAgICAgICAgICAgIGRlc2M6ICfllYblk4E1JyxcbiAgICAgICAgICAgICAgICB1cmw6IGBgLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGlkOiA2LFxuICAgICAgICAgICAgICAgIHN0YXI6IDEwLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAn55S15a2Q5omL6KGoJyxcbiAgICAgICAgICAgICAgICBkZXNjOiAn5ZWG5ZOBNicsXG4gICAgICAgICAgICAgICAgdXJsOiBgYCxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpZDogNyxcbiAgICAgICAgICAgICAgICBzdGFyOiAxMCxcbiAgICAgICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgICAgIHVzZWQ6IDAsXG4gICAgICAgICAgICAgICAgbmFtZTogJ+WMl+S6rDHml6XmuLgnLFxuICAgICAgICAgICAgICAgIGRlc2M6ICfllYblk4E3JyxcbiAgICAgICAgICAgICAgICB1cmw6IGBgLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGlkOiA4LFxuICAgICAgICAgICAgICAgIHN0YXI6IDIwLFxuICAgICAgICAgICAgICAgIHRvdGFsOiAxMDAsXG4gICAgICAgICAgICAgICAgdXNlZDogMCxcbiAgICAgICAgICAgICAgICBuYW1lOiAnNeWFi+m7hOmHkScsXG4gICAgICAgICAgICAgICAgZGVzYzogJ+WVhuWTgTgnLFxuICAgICAgICAgICAgICAgIHVybDogYGAsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gKi8iXX0=