const fs = require('fs');
const path = require('path');

const APP_ID = 'wxdc39c78bfd045896';
const buildRoot = path.resolve(__dirname, '..', 'build', 'wechatgame');
const projectConfigPath = path.join(buildRoot, 'project.config.json');
const gameConfigPath = path.join(buildRoot, 'game.json');

if (!fs.existsSync(projectConfigPath) || !fs.existsSync(gameConfigPath)) {
    throw new Error('微信小游戏构建产物不存在，请先执行 Cocos wechatgame 构建。');
}

const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
projectConfig.appid = APP_ID;
projectConfig.compileType = 'game';
projectConfig.libVersion = '3.15.2';
projectConfig.projectname = '烦恼排排消';
projectConfig.setting = Object.assign({}, projectConfig.setting, {
    es6: true,
    minified: true,
    urlCheck: true,
});
fs.writeFileSync(projectConfigPath, `${JSON.stringify(projectConfig, null, 4)}\n`);

const gameConfig = JSON.parse(fs.readFileSync(gameConfigPath, 'utf8'));
gameConfig.deviceOrientation = 'portrait';
fs.writeFileSync(gameConfigPath, `${JSON.stringify(gameConfig, null, 4)}\n`);

console.log(`Prepared WeChat mini game: ${APP_ID}`);
