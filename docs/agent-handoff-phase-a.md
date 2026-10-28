# 烦恼排排消 · 阶段 A 工作交接（心情豆→开心豆 + 时空秘境官方拼画）

> 供新接手的 agent 快速了解：现状、架构、数据流、部署方式、踩过的坑。
> 更新时间：2026-08-21。当前分支 `v1.3`，大量改动未提交（git status 有几百个文件改动，包含美术资产）。

## 1. 项目是什么

- Cocos Creator 2.4.13 小游戏「烦恼排排消」，TS 代码在 `assets/script/`，构建产物 `build/web-mobile` 与 `build/wechatgame`。
- 后端：Express + sql.js（WASM SQLite），`server/`，端口 8080，API 前缀 `/v1/cocos-zyx`。
- 阶段 A 已完成：开心豆经济 + 时空秘境官方拼画（130×156 豆位 = 20,280 格，单格 5×5 设计像素，画作 650×780，画框 700×830）。

## 2. 核心概念与口径（重要，别搞混）

- **开心豆**（玩家可见文案已全部从“心情豆”改名；代码标识符仍是 `moodBean`）：1 个带表情色块消除 = 1 豆。
- ` `moodBeanBalance` = **当前拥有、尚未放入画作的开心豆**（右上角 HUD、豆篮计数同字段）。
- 画册 2 本：`album_season`（Lv.1，48 幅）、`album_city`（Lv.5，12 幅）；册内按顺序完成画作。
- 一次「放置开心豆」= **把余额全部放入当前画作**（无批次上限；服务端单次硬顶 `MAX_CONTRIBUTE_PER_ACTION=5000`）。
- 画作完成后：熨烫定型动画 → 自动切下一幅；整册完成停留 + toast 祝贺。

## 3. 关键文件

| 文件 | 作用 |
|---|---|
| `assets/script/dataModule/MoodBeanConfig.ts` | 阶段 A 唯一数值来源：豆位网格/画框尺寸/画册开放等级/填充顺序（顺序填充，rank=cell） |
| `assets/script/dataModule/ZyxGameModule.ts` | 客户端账本：余额、本局收集、画作进度缓存、`ensureDataGeneration`（代际重置，保留 `zyx_api_base_override`）、离线结算队列 |
| `assets/script/manager/CloudService.ts` | API 层；`PRODUCTION_API_BASE=https://api.tcjstory.cn/v1/cocos-zyx`；本地调试可用 localStorage 写 `zyx_api_base_override` 覆盖 |
| `assets/script/zyxGame/ArtAlbum.ts` | 秘境全部 UI：画册列表、拼画板（预览+遮罩+格线+HD 分层）、豆篮、发射动画、熨烫定型 |
| `assets/script/zyxGame/MoodArt.ts` | 程序生成美术：`createMoodBean`/`createMoodBeanCluster`/`getMoodColor`，全部 `cc.Graphics`，无贴图 |
| `server/src/index.js` | 全部 API（bootstrap/settlements/realm/state/realm/arts/contribute/leaderboards/rewards/debug），表：`players`/`official_art_progress`/`official_art_actions`（幂等） |
| `server/src/economyConfig.js` | 服务端经济参数（与 MoodBeanConfig 保持一致） |
| `server/Dockerfile` `server/docker-compose.yml` | 部署（compose 项目 `tcjstory-cocos-zyx`，接 `tcjstory_gateway`，卷 `cocos_zyx_data`） |

## 4. 拼画渲染架构（性能关键）

- 画板内部坐标固定 650×780，整体按 `frameScale` 缩放适配。
- 分层（z 序）：底板 0 < 像素预览(130×156 邻近采样) 1 < **未填遮罩** 2 < 格线 3 < HD 原画 5（完成前隐藏）。
- 遮罩 = 不透明奶油色棋盘格 + 孔位点，按 26 行一块拆 6 个 `cc.Graphics`（单 Graphics 顶点必须 < 65,535，**这是之前渲染全乱的根因**）。
- 揭示规则：只画 `rank ≥ filledCells` 的豆位；**豆子落位才揭**（不是时间前沿），累计后按 100ms 节奏用 `redrawCoverRange` **只重绘落位行所在 1~2 个分块**（全量重绘 20k 格会在真机卡死）。
- 飞行豆：500ms cubicInOut，从豆篮内随机点出发，落点缩到 5×5 格；<50 颗一次全飞，≥50 按 100ms×(总量/50) 喷 5 秒；视觉豆上限 800，超出等距抽样 + 时序前沿兜底揭示。
- **绝不创建 20,280 个节点**；动画同屏 Graphics 控制在 ~80 以内。

## 5. 部署（tcjstory.cn，按上线标准）

- 服务器：`root@8.134.218.234`，SSH 用密钥 `~/.ssh/chloeedu_tcjstory_deploy`（其它密钥都不行）。
- 目录 `/opt/tcjstory/apps/cocos-zyx/server`，`rsync -az --delete --exclude node_modules --exclude data --exclude .env` 上传。
- 构建启动：`docker compose up -d --build`（在服务器用 `setsid ... > /tmp/log 2>&1 &` 异步跑，SSH 直接跑会被 3 分钟超时杀掉；**pkill 的 pattern 不能匹配到自己 ssh 命令行，否则会自杀连接**）。
- Dockerfile 里 `npm config set registry https://registry.npmmirror.com`（不加会在 npm ci 卡死）。
- 网关：Caddyfile 已有 `handle /v1/cocos-zyx/*`（改路由后 `cd /opt/tcjstory/apps/dawn/server && docker compose restart gateway`）。
- 健康检查：`https://api.tcjstory.cn/v1/cocos-zyx/health`；Dawn 回归：`https://api.tcjstory.cn/health`。
- 数据卷有旧 schema 时 `docker compose down && docker volume rm tcjstory-cocos-zyx_cocos_zyx_data && docker compose up -d`（sql.js 无迁移逻辑）。
- 冒烟顺序：bootstrap 拿 token → Authorization: Bearer 调 settlements/realm（payload 格式见 `server/test/api.test.js` 的 settlementBody/contributeBody，时长/数值有校验，乱填会 400）。

## 6. 构建与测试

- `npm test`（客户端 `scripts/tests/*.test.js` 13 个 + `server/test/*.test.js` 12 个）。
- `npm run build:web` / `npm run build:wechat`（内部会先 `clean-build.js` + `validate-assets.js` 再调 Cocos Creator CLI）。
- `npm run open:wechat` 打开微信开发者工具；手机真机预览：点「预览」扫码。
- 类型检查：`npx -p typescript@4.9.5 tsc --noEmit -p tsconfig.json`。
- 美术转换/校验：`scripts/convert-artwork.js`（750×1000→650×780 + 130×156 preview + 画框）、`scripts/validate-assets.js`。

## 7. 本地调试

- 服务端 `node server/src/index.js`（8080），Web `npm run serve:web`（7457）。
- 浏览器调试：往 `build/web-mobile/index.html` 注入 `localStorage.zyx_api_base_override` 指向本地 API（正式包绝不能带这个注入）。
- GM 面板（设置里）有 开心豆+500/+5000、等级调整，调试拼画进度必备。

## 8. 踩过的坑（别再犯）

1. **并行编辑同一文件会互相覆盖**：string_replace 同一文件必须串行，大改后 grep 验证最终内容，diff 输出不可尽信。
2. `cc.Graphics` 顶点上限 65,535：大网格必须分块。
3. 遮罩色块必须 alpha 255 且满格，否则投入前能看穿画作。
4. ssh+pkill 自杀、ssh 前台长跑被 3 分钟超时杀掉（用 setsid 后台 + 日志文件轮询）。
5. 服务器 8080/7457 被旧进程占用会假死，`lsof -ti :<port> | xargs kill -9`。
6. sql.js 旧库无新列 → 重置数据卷。
7. 飞行/揭示时序不同步会被用户立刻看出来：揭示必须挂在“落位回调”上。

## 9. 当前待办/方向

- 阶段 A 完成；后续可能的阶段 B：画作大图欣赏页、分享、更多画册、线上域名配置到小程序后台 request 合法域名。
- 微信正式发布前：`api.tcjstory.cn` 需配进小程序后台合法域名。
- 本文件与 `docs/mood-bean-visual-spec-v1.md`、`docs/mood-bean-artwork-diy-implementation-plan-v1.md` 互为参考。
