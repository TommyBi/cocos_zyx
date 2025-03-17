/**
 * 功能：
 * 1、先创建路由实例
 * 2、注册中间件
 * 3、注册路由
 * 4、监听端口
 * 5、启动服务
 * 6、创建数据库连接池
 * ------------------
 *
 * others:
 *  1、app.use(helmet()); 强制使用https,生产环境中使用
 *  2、所有请求都会触发routerMiddleware的公共中间件
 *  
 * ------------------
 * 业务相关：
 *  1、登录 正常用户会先在客户端登录，获取微信临时code值后，透传服务器获取用户唯一id，并拉取/注册用户数据，但实际本地调试时，可以mock用户登录，通过携带userId模拟用户登录, 数据库中，userId和openId是一对一关系
 * ------------------
 * 安装依赖:
 *  npm install express
 *  npm install mysql2
 *  npm install helmet
 *  npm install axios
 *  npm install nodemon
 *  npm install body-parser
 */
const loginManager = require('./loginManager');
const sqlManager = require('./sqlManager');
const util = require('./util');
const express = require('express');
const helmet = require('helmet');
const app = express();

// 使用helmet 中间件增强express应用安全性, 会强制使用https
app.use(helmet());

// 创建路由实例 后面还需要注册路由，即绑定什么样的地址是 user 或 game
const user = express.Router();
const game = express.Router();

// 公共路由中间件
function routerMiddleware(req, res, next) {
    console.log('routerMiddleware');
    next();
}
app.use(routerMiddleware);

// 登录路由
app.all('/login', async (req, res) => {
    const query = req.query;
    console.log(`login :`, query);
    try {
        if (query.code) {
            // 用户真实登录( 前端透传code -> 服务器获取用户唯一openid -> 注册/登录 -> 返回用户信息 )
            const wxUserInfo = await loginManager.loginAction(query.code);
            const userId = await sqlManager.queryUserByOpenId(wxUserInfo.openid);
            if (!userId) {
                // 需要注册
                const result = await sqlManager.registerUser(wxUserInfo.openid, wxUserInfo.nickname, wxUserInfo.avatarurl);
                res.json({ success: true, data: result });
            } else {
                const userInfo = await sqlManager.queryUserByUserId(query.userId);
                res.json({ success: true, data: userInfo });
            }
        } else if (query.userId) {
            // mock用户登录    
            const userInfo = await sqlManager.queryUserByUserId(query.userId);
            if (!userInfo) {
                // 注册用户
                const nickName = util.produceNickName();
                const result = await sqlManager.registerUser(-1, nickName, '');
                res.json({ success: true, data: result });
            } else {
                // 用户登录
                res.json({ success: true, data: userInfo });
            }
        }
    } catch (err) {
        console.error('登录失败:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 用户相关路由
user.all('/chat', (req, res) => {
    res.send('user chat');
});

// 游戏相关路由
game.all('/rank', (req, res) => {
    res.send('game api');
});

// 注册路由
app.use('/user', user);
app.use('/game', game);

// 监听端口
app.listen(8080, () => {
    console.log('server start at localhost 8080');
});