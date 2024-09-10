
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/manager/Define.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b316ef97uJJrLtjj1+6n+lc', 'Define');
// script/merge/manager/Define.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["MOVE_COIN"] = "move_coin";
    EventType["MOVE_END"] = "move_end";
    EventType["CHECK_MERGE"] = "check_merge";
    EventType["MERGE_COIN"] = "merge_coin";
    EventType["MERGE_END"] = "merge_end";
    EventType["MOVE_CHECK_FAIL"] = "move_check_fail";
    EventType["CANCEL_SELECT"] = "CANCEL_SELECT";
    EventType["ZYX_CHECK_MERGE"] = "zyx_check_merge";
})(EventType = exports.EventType || (exports.EventType = {}));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9EZWZpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBWSxTQVdYO0FBWEQsV0FBWSxTQUFTO0lBQ2pCLG9DQUF1QixDQUFBO0lBQ3ZCLGtDQUFxQixDQUFBO0lBQ3JCLHdDQUEyQixDQUFBO0lBQzNCLHNDQUF5QixDQUFBO0lBQ3pCLG9DQUF1QixDQUFBO0lBQ3ZCLGdEQUFtQyxDQUFBO0lBQ25DLDRDQUErQixDQUFBO0lBRy9CLGdEQUFtQyxDQUFBO0FBQ3ZDLENBQUMsRUFYVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQVdwQiIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIEV2ZW50VHlwZSB7XG4gICAgTU9WRV9DT0lOID0gJ21vdmVfY29pbicsXG4gICAgTU9WRV9FTkQgPSAnbW92ZV9lbmQnLFxuICAgIENIRUNLX01FUkdFID0gJ2NoZWNrX21lcmdlJyxcbiAgICBNRVJHRV9DT0lOID0gJ21lcmdlX2NvaW4nLFxuICAgIE1FUkdFX0VORCA9ICdtZXJnZV9lbmQnLFxuICAgIE1PVkVfQ0hFQ0tfRkFJTCA9ICdtb3ZlX2NoZWNrX2ZhaWwnLFxuICAgIENBTkNFTF9TRUxFQ1QgPSAnQ0FOQ0VMX1NFTEVDVCcsXG5cblxuICAgIFpZWF9DSEVDS19NRVJHRSA9ICd6eXhfY2hlY2tfbWVyZ2UnLFxufVxuXG4vLyDllYblk4Hkv6Hmga9cbmV4cG9ydCB0eXBlIEdvb2RzVHlwZSA9IHtcbiAgICBpZDogbnVtYmVyLFxuICAgIHN0YXI6IG51bWJlcixcbiAgICB0b3RhbDogbnVtYmVyLFxuICAgIHVzZWQ6IG51bWJlcixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgZGVzYzogc3RyaW5nLFxuICAgIHVybDogc3RyaW5nLFxufSJdfQ==