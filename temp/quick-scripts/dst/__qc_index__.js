
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/__qc_index__.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}
require('./assets/script/merge/dataModule/DataModule');
require('./assets/script/merge/dataModule/GameModule');
require('./assets/script/merge/dataModule/GoodsModule');
require('./assets/script/merge/dataModule/PlayerModule');
require('./assets/script/merge/dataModule/ZyxGameModule');
require('./assets/script/merge/define/TypeDefine');
require('./assets/script/merge/game/Coin');
require('./assets/script/merge/game/Game');
require('./assets/script/merge/game/GoodsCom');
require('./assets/script/merge/game/GoodsList');
require('./assets/script/merge/game/MergeProgress');
require('./assets/script/merge/game/MergeScene');
require('./assets/script/merge/game/Slot');
require('./assets/script/merge/manager/AudioMgr');
require('./assets/script/merge/manager/Define');
require('./assets/script/merge/manager/Uimanager');
require('./assets/script/merge/pulicCom/Tips');
require('./assets/script/merge/pulicCom/TouchEffect');
require('./assets/script/merge/util/EventManager');
require('./assets/script/merge/util/NewUtils');
require('./assets/script/merge/util/logger');
require('./assets/script/merge/zyxGame/ZyxAccountDialog');
require('./assets/script/merge/zyxGame/ZyxComTop');
require('./assets/script/merge/zyxGame/ZyxGame');
require('./assets/script/merge/zyxGame/ZyxGridCom');
require('./assets/script/merge/zyxGame/ZyxLineCom');
require('./assets/script/merge/zyxGame/ZyxMainScene');
require('./assets/script/merge/zyxGame/ZyxRewardItem');

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