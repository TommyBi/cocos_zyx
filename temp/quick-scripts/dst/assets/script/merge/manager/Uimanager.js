
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9VaW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQTZDO0FBRTdDO0lBZ0JJO1FBTkEsVUFBVTtRQUNWLFVBQUssR0FBWSxJQUFJLENBQUM7UUFFdEIsS0FBSztRQUNMLGFBQVEsR0FBYyxFQUFFLENBQUM7SUFFVCxDQUFDO0lBZGpCLHNCQUFrQixxQkFBUTthQUExQjtZQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQzthQUMvQjtZQUVELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixDQUFDOzs7T0FBQTtJQVVELHdCQUFJLEdBQUosVUFBSyxJQUFhO1FBQ2QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRCw2QkFBUyxHQUFUO1FBQ0ksSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbkIsTUFBTTtRQUNOLElBQU0sT0FBTyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDakMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU1QixNQUFNO1FBQ04sSUFBTSxXQUFXLEdBQUcsSUFBSSxFQUFF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QUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQUMsR0FBRyxFQUFFLEdBQUc7d0RBQzdCLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3REFFbEIsSUFBSSxHQUFHLEVBQUU7NERBQ0wsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lEQUNaOzZEQUFNOzREQUNILEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt5REFDWjtvREFDTCxDQUFDLENBQUMsQ0FBQztnREFDUCxDQUFDLENBQUMsRUFBQTs7eUNBQUEsQ0FBQTtvQ0FFRixxQkFBTSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUFHOzRDQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7d0NBQ2pCLENBQUMsQ0FBQzs2Q0FDRyxLQUFLLENBQUMsVUFBQyxHQUFHOzRDQUNQLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzt3Q0FDaEIsQ0FBQyxDQUFDLEVBQUE7O29DQUxOLFNBS00sQ0FBQzs7Ozt5QkFDVixDQUFDLEVBQUM7OztLQUNOO0lBQ0wsZ0JBQUM7QUFBRCxDQTVHQSxBQTRHQyxJQUFBOztBQUNZLFFBQUEsU0FBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMQVlFUiB9IGZyb20gJy4uL2RlZmluZS9UeXBlRGVmaW5lJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVWltYW5hZ2VyIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zOiBVaW1hbmFnZXI7XG4gICAgcHVibGljIHN0YXRpYyBnZXQgaW5zdGFuY2UoKSB7XG4gICAgICAgIGlmICghdGhpcy5faW5zKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnMgPSBuZXcgVWltYW5hZ2VyKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5faW5zO1xuICAgIH1cblxuICAgIC8vIOWxgue6p+S+neaJmOeahOWcuuaZr1xuICAgIHNjZW5lOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIC8vIOWxgue6p1xuICAgIGxheWVyQXJyOiBjYy5Ob2RlW10gPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKCkgeyB9XG5cbiAgICBpbml0KG5vZGU6IGNjLk5vZGUpIHtcbiAgICAgICAgdGhpcy5zY2VuZSA9IG5vZGU7XG4gICAgICAgIHRoaXMuaW5pdExheWVyKCk7XG4gICAgfVxuXG4gICAgaW5pdExheWVyKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmxheWVyQXJyID0gW107XG5cbiAgICAgICAgLy8gVUnlsYJcbiAgICAgICAgY29uc3Qgbm9kZV91aSA9IG5ldyBjYy5Ob2RlKExBWUVSLlVJKTtcbiAgICAgICAgbm9kZV91aS53aWR0aCA9IHRoaXMuc2NlbmUud2lkdGg7XG4gICAgICAgIG5vZGVfdWkuaGVpZ2h0ID0gdGhpcy5zY2VuZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQobm9kZV91aSk7XG4gICAgICAgIHRoaXMubGF5ZXJBcnIucHVzaChub2RlX3VpKTtcblxuICAgICAgICAvLyDlvLnnqpflsYJcbiAgICAgICAgY29uc3Qgbm9kZV9kaWFsb2cgPSBuZXcgY2MuTm9kZShMQVlFUi5ESUFMT0cpO1xuICAgICAgICBub2RlX2RpYWxvZy53aWR0aCA9IHRoaXMuc2NlbmUud2lkdGg7XG4gICAgICAgIG5vZGVfZGlhbG9nLmhlaWdodCA9IHRoaXMuc2NlbmUuaGVpZ2h0O1xuICAgICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKG5vZGVfZGlhbG9nKTtcbiAgICAgICAgdGhpcy5sYXllckFyci5wdXNoKG5vZGVfZGlhbG9nKTtcblxuICAgICAgICAvLyDmj5DnpLrlsYJcbiAgICAgICAgY29uc3Qgbm9kZV90aXAgPSBuZXcgY2MuTm9kZShMQVlFUi5USVApO1xuICAgICAgICBub2RlX3RpcC53aWR0aCA9IHRoaXMuc2NlbmUud2lkdGg7XG4gICAgICAgIG5vZGVfdGlwLmhlaWdodCA9IHRoaXMuc2NlbmUuaGVpZ2h0O1xuICAgICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKG5vZGVfdGlwKTtcbiAgICAgICAgdGhpcy5sYXllckFyci5wdXNoKG5vZGVfdGlwKTtcblxuICAgICAgICAvLyDlvJXlr7zlsYJcbiAgICAgICAgY29uc3Qgbm9kZV9ndWlkZSA9IG5ldyBjYy5Ob2RlKExBWUVSLkdVSURFKTtcbiAgICAgICAgbm9kZV9ndWlkZS53aWR0aCA9IHRoaXMuc2NlbmUud2lkdGg7XG4gICAgICAgIG5vZGVfZ3VpZGUuaGVpZ2h0ID0gdGhpcy5zY2VuZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQobm9kZV9ndWlkZSk7XG4gICAgICAgIHRoaXMubGF5ZXJBcnIucHVzaChub2RlX2d1aWRlKTtcbiAgICB9XG5cbiAgICBnZXRMYXllcihuYW1lOiBMQVlFUik6IGNjLk5vZGUge1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5zY2VuZS5nZXRDaGlsZEJ5TmFtZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgYWRkKG5vZGU6IGNjLk5vZGUsIGxheWVyVHlwZTogTEFZRVIpIHtcbiAgICAgICAgY29uc3QgbGF5ZXJOb2RlID0gdGhpcy5nZXRMYXllcihsYXllclR5cGUpO1xuXG4gICAgICAgIGlmICghbGF5ZXJOb2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1VJTWFuYWdlcjog5rKh5pyJ6L+Z5Liq5bGC57qnJywgbGF5ZXJUeXBlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxheWVyTm9kZS5hZGRDaGlsZChub2RlKTtcbiAgICB9XG5cbiAgICAvLyDliqjmgIHmmL7npLrpnIDopoHnmoTlsYLnuqdcbiAgICB1ZHBhdGVMYXllclNob3coKTogdm9pZCB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sYXllckFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5sYXllckFycltpXS5hY3RpdmUgPSB0aGlzLmxheWVyQXJyW2ldLmNoaWxkcmVuQ291bnQgPiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6aKE5Yi25Lu25Yqg6L29XG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBhc3luYyBsb2FkUHJlZmFiKHBhdGg6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkID0gYXN5bmMgKCkgPT4gbmV3IFByb21pc2UoKHJzdiwgcmp0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG90ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYFtsb2FkUGVmYWIgdGltZW91dF0gJHtwYXRofeWKoOi9vei2heaXtmApXG4gICAgICAgICAgICAgICAgICAgIHJqdChgbG9hZFBlZmFiIOi/nuaOpei2heaXtiR7cGF0aH1gKTtcbiAgICAgICAgICAgICAgICB9LCAxMDAwMCk7XG4gICAgICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQocGF0aCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0b3QpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJqdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnN2KHJlcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGF3YWl0IGxvYWQoKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgdWltYW5hZ2VyID0gVWltYW5hZ2VyLmluc3RhbmNlO1xuIl19