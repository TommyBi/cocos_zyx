
(function () {
var scripts = [{"deps":{"./assets/script/merge/dataModule/GameModule":1,"./assets/script/merge/dataModule/GoodsModule":2,"./assets/script/merge/game/Game":3,"./assets/script/merge/dataModule/PlayerModule":4,"./assets/script/merge/pulicCom/TouchEffect":5,"./assets/script/merge/define/TypeDefine":6,"./assets/script/merge/manager/Uimanager":7,"./assets/script/merge/dataModule/ZyxGameModule":8,"./assets/script/merge/util/NewUtils":9,"./assets/script/merge/game/MergeScene":10,"./assets/script/merge/zyxGame/ZyxGame":11,"./assets/script/merge/game/GoodsCom":12,"./assets/script/merge/game/Coin":13,"./assets/script/merge/game/MergeProgress":14,"./assets/script/merge/game/Slot":15,"./assets/script/merge/manager/Define":16,"./assets/script/merge/game/GoodsList":17,"./assets/script/merge/manager/AudioMgr":18,"./assets/script/merge/dataModule/DataModule":19,"./assets/script/merge/pulicCom/Tips":20,"./assets/script/merge/zyxGame/ZyxLineCom":21,"./assets/script/merge/util/EventManager":22,"./assets/script/merge/zyxGame/ZyxComTop":23,"./assets/script/merge/util/logger":24,"./assets/script/merge/zyxGame/ZyxAccountDialog":25,"./assets/script/merge/zyxGame/ZyxRewardItem":26,"./assets/script/merge/zyxGame/ZyxMainScene":27,"./assets/script/merge/zyxGame/ZyxGridCom":28,"./assets/script/merge/util/WxApiManager":29},"path":"preview-scripts/__qc_index__.js"},{"deps":{"../manager/Define":16,"../util/EventManager":22,"../util/NewUtils":9,"./DataModule":19},"path":"preview-scripts/assets/script/merge/dataModule/GameModule.js"},{"deps":{"./DataModule":19},"path":"preview-scripts/assets/script/merge/dataModule/GoodsModule.js"},{"deps":{"../dataModule/GameModule":1,"../manager/AudioMgr":18,"../manager/Define":16,"../manager/Uimanager":7,"../util/EventManager":22,"./GoodsList":17,"./MergeProgress":14,"./Slot":15},"path":"preview-scripts/assets/script/merge/game/Game.js"},{"deps":{"./DataModule":19,"./GameModule":1,"./GoodsModule":2,"./ZyxGameModule":8},"path":"preview-scripts/assets/script/merge/dataModule/PlayerModule.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/pulicCom/TouchEffect.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/define/TypeDefine.js"},{"deps":{"../define/TypeDefine":6,"../pulicCom/Tips":20},"path":"preview-scripts/assets/script/merge/manager/Uimanager.js"},{"deps":{"../define/TypeDefine":6,"../util/NewUtils":9,"./DataModule":19},"path":"preview-scripts/assets/script/merge/dataModule/ZyxGameModule.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/util/NewUtils.js"},{"deps":{"../dataModule/PlayerModule":4,"../define/TypeDefine":6,"../manager/AudioMgr":18,"../manager/Uimanager":7,"../util/WxApiManager":29},"path":"preview-scripts/assets/script/merge/game/MergeScene.js"},{"deps":{"../dataModule/PlayerModule":4,"../dataModule/ZyxGameModule":8,"../define/TypeDefine":6,"../manager/AudioMgr":18,"../manager/Define":16,"../manager/Uimanager":7,"../util/EventManager":22,"../util/WxApiManager":29,"./ZyxGridCom":28,"./ZyxLineCom":21},"path":"preview-scripts/assets/script/merge/zyxGame/ZyxGame.js"},{"deps":{"../dataModule/GoodsModule":2},"path":"preview-scripts/assets/script/merge/game/GoodsCom.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/game/Coin.js"},{"deps":{"../dataModule/GameModule":1},"path":"preview-scripts/assets/script/merge/game/MergeProgress.js"},{"deps":{"../dataModule/GameModule":1,"../manager/AudioMgr":18,"../manager/Define":16,"../manager/Uimanager":7,"../util/EventManager":22,"./Coin":13},"path":"preview-scripts/assets/script/merge/game/Slot.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/manager/Define.js"},{"deps":{"../dataModule/GoodsModule":2,"../manager/Uimanager":7,"./GoodsCom":12},"path":"preview-scripts/assets/script/merge/game/GoodsList.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/manager/AudioMgr.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/dataModule/DataModule.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/pulicCom/Tips.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/zyxGame/ZyxLineCom.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/util/EventManager.js"},{"deps":{"../dataModule/PlayerModule":4,"../dataModule/ZyxGameModule":8},"path":"preview-scripts/assets/script/merge/zyxGame/ZyxComTop.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/util/logger.js"},{"deps":{"../dataModule/ZyxGameModule":8,"../manager/Define":16,"../util/EventManager":22},"path":"preview-scripts/assets/script/merge/zyxGame/ZyxAccountDialog.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/zyxGame/ZyxRewardItem.js"},{"deps":{"../dataModule/PlayerModule":4,"../define/TypeDefine":6,"../manager/AudioMgr":18,"../manager/Uimanager":7,"./ZyxComTop":23},"path":"preview-scripts/assets/script/merge/zyxGame/ZyxMainScene.js"},{"deps":{"../dataModule/ZyxGameModule":8,"../define/TypeDefine":6,"../manager/AudioMgr":18,"../manager/Define":16,"../manager/Uimanager":7,"../util/EventManager":22,"../util/NewUtils":9},"path":"preview-scripts/assets/script/merge/zyxGame/ZyxGridCom.js"},{"deps":{},"path":"preview-scripts/assets/script/merge/util/WxApiManager.js"}];
var entries = ["preview-scripts/__qc_index__.js"];
var bundleScript = 'preview-scripts/__qc_bundle__.js';

/**
 * Notice: This file can not use ES6 (for IE 11)
 */
var modules = {};
var name2path = {};

// Will generated by module.js plugin
// var scripts = ${scripts};
// var entries = ${entries};
// var bundleScript = ${bundleScript};

if (typeof global === 'undefined') {
    window.global = window;
}

var isJSB = typeof jsb !== 'undefined';

function getXMLHttpRequest () {
    return window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject('MSXML2.XMLHTTP');
}

function downloadText(url, callback) {
    if (isJSB) {
        var result = jsb.fileUtils.getStringFromFile(url);
        callback(null, result);
        return;
    }

    var xhr = getXMLHttpRequest(),
        errInfo = 'Load text file failed: ' + url;
    xhr.open('GET', url, true);
    if (xhr.overrideMimeType) xhr.overrideMimeType('text\/plain; charset=utf-8');
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
                callback(null, xhr.responseText);
            }
            else {
                callback({status:xhr.status, errorMessage:errInfo + ', status: ' + xhr.status});
            }
        }
        else {
            callback({status:xhr.status, errorMessage:errInfo + '(wrong readyState)'});
        }
    };
    xhr.onerror = function(){
        callback({status:xhr.status, errorMessage:errInfo + '(error)'});
    };
    xhr.ontimeout = function(){
        callback({status:xhr.status, errorMessage:errInfo + '(time out)'});
    };
    xhr.send(null);
};

function loadScript (src, cb) {
    if (typeof require !== 'undefined') {
        require(src);
        return cb();
    }

    // var timer = 'load ' + src;
    // console.time(timer);

    var scriptElement = document.createElement('script');

    function done() {
        // console.timeEnd(timer);
        // deallocation immediate whatever
        scriptElement.remove();
    }

    scriptElement.onload = function () {
        done();
        cb();
    };
    scriptElement.onerror = function () {
        done();
        var error = 'Failed to load ' + src;
        console.error(error);
        cb(new Error(error));
    };
    scriptElement.setAttribute('type','text/javascript');
    scriptElement.setAttribute('charset', 'utf-8');
    scriptElement.setAttribute('src', src);

    document.head.appendChild(scriptElement);
}

function loadScripts (srcs, cb) {
    var n = srcs.length;

    srcs.forEach(function (src) {
        loadScript(src, function () {
            n--;
            if (n === 0) {
                cb();
            }
        });
    })
}

function formatPath (path) {
    let destPath = window.__quick_compile_project__.destPath;
    if (destPath) {
        let prefix = 'preview-scripts';
        if (destPath[destPath.length - 1] === '/') {
            prefix += '/';
        }
        path = path.replace(prefix, destPath);
    }
    return path;
}

window.__quick_compile_project__ = {
    destPath: '',

    registerModule: function (path, module) {
        path = formatPath(path);
        modules[path].module = module;
    },

    registerModuleFunc: function (path, func) {
        path = formatPath(path);
        modules[path].func = func;

        var sections = path.split('/');
        var name = sections[sections.length - 1];
        name = name.replace(/\.(?:js|ts|json)$/i, '');
        name2path[name] = path;
    },

    require: function (request, path) {
        var m, requestScript;

        path = formatPath(path);
        if (path) {
            m = modules[path];
            if (!m) {
                console.warn('Can not find module for path : ' + path);
                return null;
            }
        }

        if (m) {
            let depIndex = m.deps[request];
            // dependence script was excluded
            if (depIndex === -1) {
                return null;
            }
            else {
                requestScript = scripts[ m.deps[request] ];
            }
        }
        
        let requestPath = '';
        if (!requestScript) {
            // search from name2path when request is a dynamic module name
            if (/^[\w- .]*$/.test(request)) {
                requestPath = name2path[request];
            }

            if (!requestPath) {
                if (CC_JSB) {
                    return require(request);
                }
                else {
                    console.warn('Can not find deps [' + request + '] for path : ' + path);
                    return null;
                }
            }
        }
        else {
            requestPath = formatPath(requestScript.path);
        }

        let requestModule = modules[requestPath];
        if (!requestModule) {
            console.warn('Can not find request module for path : ' + requestPath);
            return null;
        }

        if (!requestModule.module && requestModule.func) {
            requestModule.func();
        }

        if (!requestModule.module) {
            console.warn('Can not find requestModule.module for path : ' + path);
            return null;
        }

        return requestModule.module.exports;
    },

    run: function () {
        entries.forEach(function (entry) {
            entry = formatPath(entry);
            var module = modules[entry];
            if (!module.module) {
                module.func();
            }
        });
    },

    load: function (cb) {
        var self = this;

        var srcs = scripts.map(function (script) {
            var path = formatPath(script.path);
            modules[path] = script;

            if (script.mtime) {
                path += ("?mtime=" + script.mtime);
            }
            return path;
        });

        console.time && console.time('load __quick_compile_project__');
        // jsb can not analysis sourcemap, so keep separate files.
        if (bundleScript && !isJSB) {
            downloadText(formatPath(bundleScript), function (err, bundleSource) {
                console.timeEnd && console.timeEnd('load __quick_compile_project__');
                if (err) {
                    console.error(err);
                    return;
                }

                let evalTime = 'eval __quick_compile_project__ : ' + srcs.length + ' files';
                console.time && console.time(evalTime);
                var sources = bundleSource.split('\n//------QC-SOURCE-SPLIT------\n');
                for (var i = 0; i < sources.length; i++) {
                    if (sources[i]) {
                        window.eval(sources[i]);
                        // not sure why new Function cannot set breakpoints precisely
                        // new Function(sources[i])()
                    }
                }
                self.run();
                console.timeEnd && console.timeEnd(evalTime);
                cb();
            })
        }
        else {
            loadScripts(srcs, function () {
                self.run();
                console.timeEnd && console.timeEnd('load __quick_compile_project__');
                cb();
            });
        }
    }
};

// Polyfill for IE 11
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}
})();
    