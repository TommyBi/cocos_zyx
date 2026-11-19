let moduleMap = {
'src/assets/plugin/RenderQuality.js' () { return require('src/assets/plugin/RenderQuality.js') },
'assets/internal/index.js' () { return require('assets/internal/index.js') },
'assets/game/index.js' () { return require('assets/game/index.js') },
'src/scripts/music/index.js' () { return require('src/scripts/music/index.js') },
'assets/main/index.js' () { return require('assets/main/index.js') },
// tail
};

window.__cocos_require__ = function (moduleName) {
    let func = moduleMap[moduleName];
    if (!func) {
        throw new Error(`cannot find module ${moduleName}`);
    }
    return func();
};