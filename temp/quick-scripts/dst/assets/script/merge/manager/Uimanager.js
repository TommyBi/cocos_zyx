
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/manager/Uimanager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'f6b0eaEb8lOraTr9sfkeyyf', 'Uimanager');
// script/merge/manager/Uimanager.ts

"use strict";
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
exports.uimanager = void 0;
var TypeDefine_1 = require("../define/TypeDefine");
var Tips_1 = require("../pulicCom/Tips");
var Uimanager = /** @class */ (function () {
    function Uimanager() {
        // 层级依托的场景
        this.scene = null;
        // 层级
        this.layerArr = [];
    }
    Object.defineProperty(Uimanager, "instance", {
        get: function () {
            if (!this._ins) {
                this._ins = new Uimanager();
            }
            return this._ins;
        },
        enumerable: false,
        configurable: true
    });
    Uimanager.prototype.init = function (node) {
        this.scene = node;
        this.initLayer();
    };
    Uimanager.prototype.initLayer = function () {
        this.layerArr = [];
        // UI层
        var node_ui = new cc.Node(TypeDefine_1.LAYER.UI);
        node_ui.width = this.scene.width;
        node_ui.height = this.scene.height;
        this.scene.addChild(node_ui);
        this.layerArr.push(node_ui);
        // 弹窗层
        var node_dialog = new cc.Node(TypeDefine_1.LAYER.DIALOG);
        node_dialog.width = this.scene.width;
        node_dialog.height = this.scene.height;
        this.scene.addChild(node_dialog);
        this.layerArr.push(node_dialog);
        // 提示层
        var node_tip = new cc.Node(TypeDefine_1.LAYER.TIP);
        node_tip.width = this.scene.width;
        node_tip.height = this.scene.height;
        this.scene.addChild(node_tip);
        this.layerArr.push(node_tip);
        // 引导层
        var node_guide = new cc.Node(TypeDefine_1.LAYER.GUIDE);
        node_guide.width = this.scene.width;
        node_guide.height = this.scene.height;
        this.scene.addChild(node_guide);
        this.layerArr.push(node_guide);
    };
    Uimanager.prototype.getLayer = function (name) {
        var node = this.scene.getChildByName(name);
        return node;
    };
    Uimanager.prototype.add = function (node, layerType) {
        var layerNode = this.getLayer(layerType);
        if (!layerNode) {
            console.warn('UIManager: 没有这个层级', layerType);
            return;
        }
        layerNode.addChild(node);
    };
    // 动态显示需要的层级
    Uimanager.prototype.udpateLayerShow = function () {
        for (var i = 0; i < this.layerArr.length; i++) {
            this.layerArr[i].active = this.layerArr[i].childrenCount > 0;
        }
    };
    /**
     * 预制件加载
     * @param path
     */
    Uimanager.prototype.loadPrefab = function (path) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var load;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    load = function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            return [2 /*return*/, new Promise(function (rsv, rjt) {
                                                    var tot = setTimeout(function () {
                                                        console.debug("[loadPefab timeout] " + path + "\u52A0\u8F7D\u8D85\u65F6");
                                                        rjt("loadPefab \u8FDE\u63A5\u8D85\u65F6" + path);
                                                    }, 10000);
                                                    cc.resources.load(path, function (err, res) {
                                                        clearTimeout(tot);
                                                        if (err) {
                                                            rjt(err);
                                                        }
                                                        else {
                                                            rsv(res);
                                                        }
                                                    });
                                                })];
                                        });
                                    }); };
                                    return [4 /*yield*/, load().then(function (res) {
                                            resolve(res);
                                        })
                                            .catch(function (err) {
                                            reject(err);
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 显示提示
     * @param msg
     */
    Uimanager.prototype.showTips = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var tipsPrefab, tipsNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadPrefab('prefab/com/tips')];
                    case 1:
                        tipsPrefab = _a.sent();
                        tipsNode = cc.instantiate(tipsPrefab);
                        this.add(tipsNode, TypeDefine_1.LAYER.TIP);
                        tipsNode.getComponent(Tips_1.default).showTips(msg);
                        tipsNode.setPosition(0, 0);
                        return [2 /*return*/];
                }
            });
        });
    };
    return Uimanager;
}());
exports.default = Uimanager;
exports.uimanager = Uimanager.instance;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9VaW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQTZDO0FBQzdDLHlDQUFvQztBQUVwQztJQWdCSTtRQU5BLFVBQVU7UUFDVixVQUFLLEdBQVksSUFBSSxDQUFDO1FBRXRCLEtBQUs7UUFDTCxhQUFRLEdBQWMsRUFBRSxDQUFDO0lBRVQsQ0FBQztJQWRqQixzQkFBa0IscUJBQVE7YUFBMUI7WUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDWixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7YUFDL0I7WUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFVRCx3QkFBSSxHQUFKLFVBQUssSUFBYTtRQUNkLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQsNkJBQVMsR0FBVDtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBRW5CLE1BQU07UUFDTixJQUFNLE9BQU8sR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFNUIsTUFBTTtRQUNOLElBQU0sV0FBVyxH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LENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMQVlFUiB9IGZyb20gJy4uL2RlZmluZS9UeXBlRGVmaW5lJztcbmltcG9ydCBUaXBzIGZyb20gJy4uL3B1bGljQ29tL1RpcHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVaW1hbmFnZXIge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnM6IFVpbWFuYWdlcjtcbiAgICBwdWJsaWMgc3RhdGljIGdldCBpbnN0YW5jZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbnMpIHtcbiAgICAgICAgICAgIHRoaXMuX2lucyA9IG5ldyBVaW1hbmFnZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnM7XG4gICAgfVxuXG4gICAgLy8g5bGC57qn5L6d5omY55qE5Zy65pmvXG4gICAgc2NlbmU6IGNjLk5vZGUgPSBudWxsO1xuXG4gICAgLy8g5bGC57qnXG4gICAgbGF5ZXJBcnI6IGNjLk5vZGVbXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoKSB7IH1cblxuICAgIGluaXQobm9kZTogY2MuTm9kZSkge1xuICAgICAgICB0aGlzLnNjZW5lID0gbm9kZTtcbiAgICAgICAgdGhpcy5pbml0TGF5ZXIoKTtcbiAgICB9XG5cbiAgICBpbml0TGF5ZXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMubGF5ZXJBcnIgPSBbXTtcblxuICAgICAgICAvLyBVSeWxglxuICAgICAgICBjb25zdCBub2RlX3VpID0gbmV3IGNjLk5vZGUoTEFZRVIuVUkpO1xuICAgICAgICBub2RlX3VpLndpZHRoID0gdGhpcy5zY2VuZS53aWR0aDtcbiAgICAgICAgbm9kZV91aS5oZWlnaHQgPSB0aGlzLnNjZW5lLmhlaWdodDtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGRDaGlsZChub2RlX3VpKTtcbiAgICAgICAgdGhpcy5sYXllckFyci5wdXNoKG5vZGVfdWkpO1xuXG4gICAgICAgIC8vIOW8ueeql+WxglxuICAgICAgICBjb25zdCBub2RlX2RpYWxvZyA9IG5ldyBjYy5Ob2RlKExBWUVSLkRJQUxPRyk7XG4gICAgICAgIG5vZGVfZGlhbG9nLndpZHRoID0gdGhpcy5zY2VuZS53aWR0aDtcbiAgICAgICAgbm9kZV9kaWFsb2cuaGVpZ2h0ID0gdGhpcy5zY2VuZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQobm9kZV9kaWFsb2cpO1xuICAgICAgICB0aGlzLmxheWVyQXJyLnB1c2gobm9kZV9kaWFsb2cpO1xuXG4gICAgICAgIC8vIOaPkOekuuWxglxuICAgICAgICBjb25zdCBub2RlX3RpcCA9IG5ldyBjYy5Ob2RlKExBWUVSLlRJUCk7XG4gICAgICAgIG5vZGVfdGlwLndpZHRoID0gdGhpcy5zY2VuZS53aWR0aDtcbiAgICAgICAgbm9kZV90aXAuaGVpZ2h0ID0gdGhpcy5zY2VuZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQobm9kZV90aXApO1xuICAgICAgICB0aGlzLmxheWVyQXJyLnB1c2gobm9kZV90aXApO1xuXG4gICAgICAgIC8vIOW8leWvvOWxglxuICAgICAgICBjb25zdCBub2RlX2d1aWRlID0gbmV3IGNjLk5vZGUoTEFZRVIuR1VJREUpO1xuICAgICAgICBub2RlX2d1aWRlLndpZHRoID0gdGhpcy5zY2VuZS53aWR0aDtcbiAgICAgICAgbm9kZV9ndWlkZS5oZWlnaHQgPSB0aGlzLnNjZW5lLmhlaWdodDtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGRDaGlsZChub2RlX2d1aWRlKTtcbiAgICAgICAgdGhpcy5sYXllckFyci5wdXNoKG5vZGVfZ3VpZGUpO1xuICAgIH1cblxuICAgIGdldExheWVyKG5hbWU6IExBWUVSKTogY2MuTm9kZSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLnNjZW5lLmdldENoaWxkQnlOYW1lKG5hbWUpO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICBhZGQobm9kZTogY2MuTm9kZSwgbGF5ZXJUeXBlOiBMQVlFUikge1xuICAgICAgICBjb25zdCBsYXllck5vZGUgPSB0aGlzLmdldExheWVyKGxheWVyVHlwZSk7XG5cbiAgICAgICAgaWYgKCFsYXllck5vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignVUlNYW5hZ2VyOiDmsqHmnInov5nkuKrlsYLnuqcnLCBsYXllclR5cGUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGF5ZXJOb2RlLmFkZENoaWxkKG5vZGUpO1xuICAgIH1cblxuICAgIC8vIOWKqOaAgeaYvuekuumcgOimgeeahOWxgue6p1xuICAgIHVkcGF0ZUxheWVyU2hvdygpOiB2b2lkIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxheWVyQXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmxheWVyQXJyW2ldLmFjdGl2ZSA9IHRoaXMubGF5ZXJBcnJbaV0uY2hpbGRyZW5Db3VudCA+IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDpooTliLbku7bliqDovb1cbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqL1xuICAgIGFzeW5jIGxvYWRQcmVmYWIocGF0aDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWQgPSBhc3luYyAoKSA9PiBuZXcgUHJvbWlzZSgocnN2LCByanQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3QgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgW2xvYWRQZWZhYiB0aW1lb3V0XSAke3BhdGh95Yqg6L296LaF5pe2YClcbiAgICAgICAgICAgICAgICAgICAgcmp0KGBsb2FkUGVmYWIg6L+e5o6l6LaF5pe2JHtwYXRofWApO1xuICAgICAgICAgICAgICAgIH0sIDEwMDAwKTtcbiAgICAgICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChwYXRoLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRvdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmp0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByc3YocmVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgYXdhaXQgbG9hZCgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOaYvuekuuaPkOekulxuICAgICAqIEBwYXJhbSBtc2dcbiAgICAgKi9cbiAgICBhc3luYyBzaG93VGlwcyhtc2c6IHN0cmluZykge1xuICAgICAgICBjb25zdCB0aXBzUHJlZmFiID0gYXdhaXQgdGhpcy5sb2FkUHJlZmFiKCdwcmVmYWIvY29tL3RpcHMnKTtcbiAgICAgICAgY29uc3QgdGlwc05vZGUgPSBjYy5pbnN0YW50aWF0ZSh0aXBzUHJlZmFiKTtcbiAgICAgICAgdGhpcy5hZGQodGlwc05vZGUsIExBWUVSLlRJUCk7XG4gICAgICAgIHRpcHNOb2RlLmdldENvbXBvbmVudChUaXBzKS5zaG93VGlwcyhtc2cpO1xuICAgICAgICB0aXBzTm9kZS5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgdWltYW5hZ2VyID0gVWltYW5hZ2VyLmluc3RhbmNlO1xuIl19