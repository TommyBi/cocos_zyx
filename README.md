# 烦恼排排消

> **给接手的 AI agent**：请先读 `docs/agent-handoff-phase-a.md`（当前架构、数据和部署交接），再动代码。

一个面向微信小游戏的 Cocos Creator 2.4.13 回合制左右消除游戏。玩家在“心情整理所”中移动柔软心情块，填满整行后消除；带表情的心情块被消除时会显现为 1 颗同色、同表情的开心豆并飞入局内收集位。

## 当前范围

- 玩家主流程聚焦左右消除、结算和本周单局最高分排行榜。
- 开心豆与经验的收集和展示保留。秘境玩法、画作资源与服务端相关接口已从工程中移除。
- 每人最多 30 点体力，每 10 分钟恢复 1 点；每局消耗 1 点，开局由服务端校验。体力不足可每天分享补充一次 5 点。详细规则见 [`docs/stamina.md`](docs/stamina.md)。
- 微信代码包由消除主包和首页分包组成。两首背景音乐不进代码包，构建后位于 `build/wechatgame/remote/music`，发布到 CDN，不经过 API 源站。
- 首页、棋盘与弹窗按手机、平板和折叠屏窗口适配；规则和已验证尺寸见 [`docs/responsive-layout.md`](docs/responsive-layout.md)。

工程已具备微信构建和体验版上传脚本。正式提审前仍需完成微信真机授权与生命周期验收、服务域名配置和投放准备。

## 玩法

- 在当前行左右拖动色块。
- 色块受重力下落，填满一整行后自动消除并计分。
- 解压锤和魔法棒当前可通过「分享给好友」获得 1 次使用机会（停留不足 3 秒视为失败）；激励视频链路保留待用户量达标后恢复。库存会跨局保留。领取后直接进入目标选择，解压锤同时支持从图标拖放到目标。
- 棋盘接近顶部时，每个复活阶段提供一次分享救场，自动净化数量最多的一种颜色。
- 首次失败可分享复活一次，清除棋盘上半区；复活后再次失败直接结算。
- 顶部堆满时进入复活/结算流程；也可以从暂停菜单主动结束本局。
- 部分心情块带有可收集表情；整体保持积极/消极约 3:2。
- 一块一豆：1 个带表情的心情块被消除，恰好产生 1 颗同色、同表情的开心豆飞入收集位，本局数量 +1；不存在任何换算倍率。
- 每个带表情的心情块同时固定获得 1 点经验；经验与开心豆分开统计、分开显示。
- 有可消除机会且 8 秒无操作时，小手会演示一次移动并自动复位。
- 前 10 次挑战以玩法提示为主，之后切换为低频暖心文案。
- 首页显示等级经验、开心豆余额、排行榜入口和微信头像昵称授权。

## 开心豆、体力与排行榜

开心豆和经验在局内收集并于结算展示。体力由服务端控制开局次数；开心豆照原有规则发放，实物权益货币留待后续活动单独设计。

- 云端按 `roundId` 幂等结算；可补传的离线局进入本地待提交队列 `zyx_pending_round_settlements`。
- 排行榜按本周单局最高分排名。可兑换实物权益前需接入可信账号身份和兑换审计。

## 运行

要求 macOS 已安装 Cocos Creator 2.4.13，默认路径为：

```text
/Applications/Cocos/Creator/2.4.13/CocosCreator.app
```

构建并启动本地预览：

```bash
npm run build:web
npm run serve:web
```

然后访问 <http://localhost:7457/>。

构建微信小游戏并在微信开发者工具中打开：

```bash
npm run build:wechat
npm run open:wechat
```

微信构建脚本会在 Cocos 构建后固定写入正式 AppID、竖屏方向、基础库版本，以及背景音乐 CDN 地址 `https://cdn.tcjstory.cn/cocos-zyx/`。代码包是“主包 + 首页分包”；`remote/` 已被排除，不会打进微信包。提审前把该目录上传到 CDN，并在微信后台把 `cdn.tcjstory.cn` 配进 downloadFile 合法域名。不要把这些文件放到 `api.tcjstory.cn`。

运行测试（客户端存档与开心豆经济单测 + 服务端接口集成测试）：

```bash
npm test
```

## 核心结构

```text
assets/
├── scene/game.fire                        # 唯一启动场景
└── script/
    ├── GameMainScene.ts                   # 首页、云、体力、排行榜与玩法切换
    ├── dataModule/
    │   ├── ZyxGameModule.ts               # 棋盘、重力、消除、计分、开心豆与存档
    │   └── MoodBeanConfig.ts              # 开心豆与待结算队列配置
    ├── manager/
    │   ├── AssetLoader.ts                 # 唯一资源入口：界面资源进包，背景音乐走 CDN
    │   ├── AudioManager.ts                # 音乐与音效
    │   ├── CloudService.ts                # 云档案 / 体力 / 结算 / 周榜
    │   ├── GameSettings.ts                # 本地设置
    │   ├── PlatformAdapter.ts             # 微信平台 API 唯一访问入口
    │   ├── SettingsPanel.ts               # 设置面板与 GM 补给（发放开心豆/道具）
    │   ├── ShareReward.ts                 # 分享代替激励视频的奖励链路
    │   └── UIManager.ts                   # UI 工厂与弹窗
    └── zyxGame/
        ├── GlyphFactory.ts                # 局内小图标绘制工厂
        ├── LeaderboardPanel.ts            # 周排行榜弹窗
        ├── MoodArt.ts                     # 10 种心情、开心豆与程序美术
        ├── ZyxGame.ts                     # 玩法编排与界面
        └── ZyxGridCom.ts                  # 左右拖动手势
server/
└── src/index.js                           # 云档案、体力、开心豆结算与周榜
```

## 设计与生产文档

- [`docs/stage-a-code-review-remediation-2026-08-21.md`](docs/stage-a-code-review-remediation-2026-08-21.md)：仍适用于核心消除玩法的安全、建档、离线结算和可靠落盘基线。
- [`docs/mood-bean-visual-spec-v1.md`](docs/mood-bean-visual-spec-v1.md)：新开心豆角色、绿色体力图标、共用资源胶囊与局内收集表现。
- [`docs/stamina.md`](docs/stamina.md)：体力与服务端开局的当前规则。
- [`docs/responsive-layout.md`](docs/responsive-layout.md)：多设备画布、分区、安全区与窗口变化规则。
- [`docs/project-handoff-2026-08-03.md`](docs/project-handoff-2026-08-03.md)：早期项目历史记录，不作为当前产品规则。
- [`docs/formal-ui-implementation-v2.md`](docs/formal-ui-implementation-v2.md)：当前已落地的正式 UI 规范、资源清单和交互验收标准。
- [`docs/v1.1-worktree-audit-2026-08-03.md`](docs/v1.1-worktree-audit-2026-08-03.md)：v1.1 工作区审计；产品方向已定为方案 B。
- [`docs/game-iteration-development-plan.md`](docs/game-iteration-development-plan.md)：早期迭代方案（历史，勿恢复日瓶/周瓶）。
- [`docs/formal-art-generation-spec-v1.md`](docs/formal-art-generation-spec-v1.md)：早期美术生成规范（历史，正式实现以 formal-ui-v2 为准）。

## 后端联调与发布状态

正式 API 已升级为核心消除协议 v2，支持体力开局、每日分享、幂等结算和最高分榜。微信包固定连接正式 HTTPS；浏览器仅允许本机 API 覆盖。执行 `npm run check:cloud` 可验证正式接口完整流程，发布与备份证据见 [2026-10-30 发布记录](docs/release-candidate-2026-10-30.md)。
