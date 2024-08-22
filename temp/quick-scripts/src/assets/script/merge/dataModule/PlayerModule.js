"use strict";
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