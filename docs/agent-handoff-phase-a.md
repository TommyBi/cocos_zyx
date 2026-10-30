# 烦恼排排消 · 当前工程交接

> 供新接手的 agent 快速了解：现状、架构、数据流、部署方式、踩过的坑。
> 更新时间：2026-10-29。

> 当前范围聚焦左右消除、结算、本周单局最高分排行榜，以及开心豆/经验收集与展示。旧秘境功能、资源和接口已从工程中移除；不得因此删除或重置玩家的生产数据。

## 1. 项目是什么

- Cocos Creator 2.4.13 小游戏「烦恼排排消」，TS 代码在 `assets/script/`，构建产物 `build/web-mobile` 与 `build/wechatgame`。
- 后端：Express + sql.js（WASM SQLite），`server/`，端口 8080，API 前缀 `/v1/cocos-zyx`。
- 构建采用消除主包与 `home` 首页分包。体力由服务端判定，规则见 [`stamina.md`](stamina.md)。

## 2. 核心概念与口径（重要，别搞混）

- **开心豆**（代码标识符仍是 `moodBean`）：1 个带表情色块消除 = 1 豆；同一色块同时给予 1 点经验。
- `moodBeanBalance` 是服务端确认的当前开心豆余额；待补传结算不预先计入余额，成功确认后才展示到账。
- 排行榜只显示服务端确认的本周单局最高分。
- 开新局须在线领取服务端开局凭证；已领取凭证的对局在途中掉线后仍可补传结算。以 [`stamina.md`](stamina.md) 为准。

## 3. 关键文件

| 文件 | 作用 |
|---|---|
| `assets/script/dataModule/MoodBeanConfig.ts` | 开心豆与本地待结算队列的集中配置 |
| `assets/script/dataModule/ZyxGameModule.ts` | 棋盘、余额、本局收集、本地进度与离线结算队列 |
| `assets/script/manager/CloudService.ts` | API 层；`PRODUCTION_API_BASE=https://api.tcjstory.cn/v1/cocos-zyx`；仅浏览器本机调试可用 `zyx_api_base_override`；微信包固定正式 HTTPS |
| `assets/script/zyxGame/MoodArt.ts` | 程序生成美术：`createMoodBean`/`createMoodBeanMascot`/`getMoodColor`，全部 `cc.Graphics`，无贴图 |
| `server/src/index.js` | 云档案、体力、结算、周榜与分享奖励 API |
| `server/src/economyConfig.js` | 服务端经济与风控参数 |
| `server/Dockerfile` `server/docker-compose.yml` | 部署（compose 项目 `tcjstory-cocos-zyx`，接 `tcjstory_gateway`，卷 `cocos_zyx_data`） |

## 4. 结算安全边界

- `bootstrap` 只提交身份资料，不接收客户端直接上报的资产绝对值。
- 一局结算先写本地待提交队列，再由单一工作器补传；服务端按玩家和 `roundId` 幂等确认并可靠落盘。
- 暂停菜单的“重新开始”放弃本局，不发放开心豆、经验或最高分。
- 体力由服务端校验。匿名设备标识可被重建；实物权益上线前需绑定可信身份并审计兑换。

> 2026-10-30 后端已发布，当前结构迁移与验证结果以 [发布记录](release-candidate-2026-10-30.md) 为准。

## 5. 部署（tcjstory.cn，按上线标准）

- 服务器：`root@8.134.218.234`，SSH 用密钥 `~/.ssh/chloeedu_tcjstory_deploy`（其它密钥都不行）。
- 目录 `/opt/tcjstory/apps/cocos-zyx/server`，`rsync -az --delete --exclude node_modules --exclude data --exclude .env` 上传。
- 构建启动：`docker compose up -d --build`（在服务器用 `setsid ... > /tmp/log 2>&1 &` 异步跑，SSH 直接跑会被 3 分钟超时杀掉；**pkill 的 pattern 不能匹配到自己 ssh 命令行，否则会自杀连接**）。
- Dockerfile 里 `npm config set registry https://registry.npmmirror.com`（不加会在 npm ci 卡死）。
- 网关：Caddyfile 已有 `handle /v1/cocos-zyx/*`（仅路由变化才运行 `/opt/tcjstory/bin/reload-gateway.sh`，不得直接重启共享网关）。
- 健康检查：`https://api.tcjstory.cn/v1/cocos-zyx/health`；Dawn 回归：`https://api.tcjstory.cn/health`。
- 生产数据卷包含玩家资产，不得因代码删减而清空；数据库结构变化应采用兼容迁移。
- 冒烟顺序：bootstrap 拿 token → 获取体力状态 → 授权开局 → 结算 → 查询排行榜（测试账号和请求格式见服务端测试）。

## 6. 构建与测试

- `npm test`（客户端模块测试与服务端 API 测试）。
- `npm run build:web` / `npm run build:wechat`（内部会先 `clean-build.js` + `validate-assets.js` 再调 Cocos Creator CLI）。
- `npm run open:wechat` 打开微信开发者工具；手机真机预览：点「预览」扫码。
- 类型检查：`npx -p typescript@4.9.5 tsc --noEmit -p tsconfig.json`。
- 资源校验：`scripts/validate-assets.js`。

## 7. 本地调试

- 服务端 `node server/src/index.js`（8080），Web `npm run serve:web`（7457）。
- 浏览器调试：往 `build/web-mobile/index.html` 注入 `localStorage.zyx_api_base_override` 指向本地 API（正式包绝不能带这个注入）。
- GM 只用于 Web Debug 本地调试；微信包及生产服务端不得暴露发放资产的 GM 入口。

## 8. 踩过的坑（别再犯）

1. **并行编辑同一文件会互相覆盖**：string_replace 同一文件必须串行，大改后 grep 验证最终内容，diff 输出不可尽信。
2. ssh+pkill 自杀、ssh 前台长跑被 3 分钟超时杀掉（用 setsid 后台 + 日志文件轮询）。
3. 服务器 8080/7457 被旧进程占用会假死；确认进程归属后再停止。
4. sql.js 数据库结构变更必须保留已有玩家资产和结算记录。

## 9. 当前待办/方向

- 当前重点是核心消除手感、体力、榜单及真机体验。
- 微信正式发布前：`api.tcjstory.cn` 需配进小程序后台合法域名。
- 开心豆外观见 `docs/mood-bean-visual-spec-v1.md`；体力规则见 `docs/stamina.md`。
