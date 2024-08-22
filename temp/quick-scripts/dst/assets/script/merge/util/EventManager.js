
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/util/EventManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ea7fbBwaBVK96i8sl/y0ydr', 'EventManager');
// script/merge/util/EventManager.ts

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
exports.eventManager = exports.GameEvent = exports.EventManager = void 0;
var EventManager = /** @class */ (function (_super) {
    __extends(EventManager, _super);
    function EventManager() {
        return _super.call(this) || this;
    }
    EventManager.prototype.dispatch = function (type, data) {
        this.dispatchEvent(new GameEvent(type, data));
    };
    EventManager.Instance = new EventManager();
    return EventManager;
}(cc.EventTarget));
exports.EventManager = EventManager;
// 游戏事件
var GameEvent = /** @class */ (function (_super) {
    __extends(GameEvent, _super);
    function GameEvent(type, data) {
        if (data === void 0) { data = null; }
        var _this = _super.call(this, type, true) || this;
        _this.data = null;
        _this.type = '';
        _this.type = type;
        _this.data = data;
        return _this;
    }
    return GameEvent;
}(cc.Event.EventCustom));
exports.GameEvent = GameEvent;
exports.eventManager = EventManager.Instance;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvdXRpbC9FdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0lBQWtDLGdDQUFjO0lBRzVDO2VBQ0ksaUJBQU87SUFDWCxDQUFDO0lBRUQsK0JBQVEsR0FBUixVQUFTLElBQVksRUFBRSxJQUFVO1FBQzdCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDakQsQ0FBQztJQVJzQixxQkFBUSxHQUFpQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBU3ZFLG1CQUFDO0NBVkQsQUFVQyxDQVZpQyxFQUFFLENBQUMsV0FBVyxHQVUvQztBQVZZLG9DQUFZO0FBWXpCLE9BQU87QUFDUDtJQUErQiw2QkFBb0I7SUFHL0MsbUJBQVksSUFBWSxFQUFFLElBQWdCO1FBQWhCLHFCQUFBLEVBQUEsV0FBZ0I7UUFBMUMsWUFDSSxrQkFBTSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBR3BCO1FBTk0sVUFBSSxHQUFRLElBQUksQ0FBQztRQUNqQixVQUFJLEdBQVcsRUFBRSxDQUFDO1FBR3JCLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOztJQUNyQixDQUFDO0lBQ0wsZ0JBQUM7QUFBRCxDQVJBLEFBUUMsQ0FSOEIsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBUWxEO0FBUlksOEJBQVM7QUFVVCxRQUFBLFlBQVksR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlciBleHRlbmRzIGNjLkV2ZW50VGFyZ2V0IHtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEluc3RhbmNlOiBFdmVudE1hbmFnZXIgPSBuZXcgRXZlbnRNYW5hZ2VyKCk7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoKHR5cGU6IHN0cmluZywgZGF0YT86IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEdhbWVFdmVudCh0eXBlLCBkYXRhKSlcbiAgICB9XG59XG5cbi8vIOa4uOaIj+S6i+S7tlxuZXhwb3J0IGNsYXNzIEdhbWVFdmVudCBleHRlbmRzIGNjLkV2ZW50LkV2ZW50Q3VzdG9tIHtcbiAgICBwdWJsaWMgZGF0YTogYW55ID0gbnVsbDtcbiAgICBwdWJsaWMgdHlwZTogc3RyaW5nID0gJyc7XG4gICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBkYXRhOiBhbnkgPSBudWxsKSB7XG4gICAgICAgIHN1cGVyKHR5cGUsIHRydWUpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGV2ZW50TWFuYWdlciA9IEV2ZW50TWFuYWdlci5JbnN0YW5jZTtcbiJdfQ==