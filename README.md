# 烦恼排排消

> **给接手的 AI agent**：请先读 [`docs/CHANGELOG.md`](docs/CHANGELOG.md)（最新改动与不可回退边界，规则冲突时以此为准），再读 `docs/agent-handoff-phase-a.md`（架构、数据和部署交接），然后动代码。

> **视觉设计**：后续 UI 与美术必须先读 [`docs/art-direction.md`](docs/art-direction.md)。以初版稍偏手绘的日式动漫、柔和唯美、自然可爱为基准；用户已明确否定当前开心豆及近期 UI 的油亮半3D质感，不可继续作为风格样板。

一个面向微信小游戏的 Cocos Creator 2.4.13 回合制左右消除游戏。玩家在“心情整理所”中移动柔软心情块，填满整行后消除；带表情的心情块飞入局内收集环、推进百分比，每满 100% 获得一颗开心豆。

## 当前范围

- 玩家主流程聚焦左右消除、结算和永久单局最高分排行榜。
- 开心豆与经验的收集和展示保留。秘境玩法、画作资源与服务端相关接口已从工程中移除。
- 自然体力上限10点，每5分钟恢复1点，额外奖励或兑换可超过自然上限；每局消耗1点，开局由服务端校验。详细规则见 [`docs/stamina.md`](docs/stamina.md)。
- 微信代码包由消除主包、首页分包和按需加载的特效分包组成。两首背景音乐不进代码包，构建后位于 `build/wechatgame-cdn/remote/music`，发布到 CDN，不经过 API 源站。
- 首页、棋盘与弹窗按手机、平板和折叠屏窗口适配；规则和已验证尺寸见 [`docs/responsive-layout.md`](docs/responsive-layout.md)。

工程已具备微信构建和体验版上传脚本。正式提审前仍需完成微信真机授权与生命周期验收、服务域名配置和投放准备。

## 玩法

- 在当前行左右拖动色块。
- 色块受重力下落，填满一整行后自动消除并计分。
- V12道具仅当局有效：解压锤每局分享领取3次，魔法棒每局视频领取1次；点加号打开获取弹窗，领取显示1，再点图标选目标，用尽遮暗。解压锤保留拖放使用。
- 积分超过500且最高点超过底部第6排、尚未失败时，随机出现热气球投弹或右侧倒计时广告清屏，两种各50%。两者共用60秒出现CD，V12每类每局分别最多出现4次；使用、拒绝或超时都从提示出现时计CD。热气球飞行15秒，随机选取四分之一色块投弹，每枚按普通炸弹的3×3范围消除并连锁，结束后固定自然升1排；闪电清屏后一次整体升2排，两者不再补齐普通回合的最低行数。救场、解压锤、魔法棒和炸弹按实际消除色块去重，每块额外+5分，原消行与combo基础分保留；右侧清屏保留气泡和10秒倒计时，“我可以”只收起说明，再点倒计时按钮才播放视频。
- 每第5、10、15…局另有一次免费暖心气球：进入距顶部2排的危险区，内外红光显示2秒后出现；不要求分数、广告、分享或普通救场CD。点击查看开心豆留言，点“谢谢”后投下扩散爱心，沿用炸弹范围和连锁、每块+5分、结束升1排。当局最多出现一次；留言天数按首次进入游戏至今的上海自然日含当天计算。局内底部轮播提示采用1.5秒渐入、5秒停留、1.5秒渐出。
- 首次失败可看视频复活一次，清除顶部8排；再次失败有卡可使用1张复活卡再复活一次，无卡或两次用完后直接结算。
- V12每累计消除20行获得一个闪电格，消除或被炸弹波及均向最多三个幸存长块放电，原位拆成单格后正常下落连消；闪电格不能承载连消奖励炸弹。
- 冷启动自动进入有效主线残局，不重复扣体力；断网时可继续本机有效存档，联网后重放核验；失效会话不允许离线恢复。
- 顶部堆满时进入复活/结算流程；也可以从暂停菜单主动结束本局。
- 部分心情块带有可收集表情；整体保持积极/消极约 3:2。
- 每消除1个带表情心情块，收集进度增加1%；每满100%获得1颗开心豆，一局可获得多颗，未满进度不跨局。HUD显示「收集进度」与「本局 +N」，详见 [`docs/bean-collection-progress.md`](docs/bean-collection-progress.md)。
- 每个带表情的心情块同时固定获得 1 点经验；经验与开心豆分开统计、分开显示。
- 有可消除机会且连续无操作2～8秒时，小手会演示一次移动并自动复位，提示间隔随阶段渐进。
- 前 10 次挑战以玩法提示为主，之后切换为低频暖心文案。
- 首页显示等级经验、开心豆余额、排行榜入口和微信头像昵称授权。

## 开心豆、体力与排行榜

开心豆和经验在局内收集并于结算展示。体力由服务端控制开局次数；开心豆照原有规则发放，实物权益货币留待后续活动单独设计。

- 云端按 `roundId` 幂等结算；可补传的离线局进入本地待提交队列 `zyx_pending_round_settlements`。
- 排行榜包含永久单局最高分的积分榜，以及按当前开心豆余额排序的开心榜；累计获得量不参与开心榜排序。可兑换实物权益前需接入可信账号身份和兑换审计。

## 运行

要求 macOS 已安装 Cocos Creator 2.4.13，默认路径为：

```text
/Applications/Cocos/Creator/2.4.13/CocosCreator.app
```

微信打包的 PNG 无损压缩步骤还需要 Python 3 与 Pillow（`python3 -m pip install Pillow`）。

构建并启动本地预览：

```bash
npm run build:web
npm run serve:web
```

然后访问 <http://localhost:7458/>。预览从首页进入，同一个预览服务的多个页面共享音乐播放权，旧页面确认静音后新页面才开始播放。可通过 `PREVIEW_PORT` 指定预览端口，`PREVIEW_API_PORT` 指定本地 API 端口（默认 8080）。


验收 Codex 右侧预览时，先枚举当前聊天已有的游戏标签，优先复用现有标签；重新打开链接不会自动关闭旧预览。更新前保留的旧版页面可能没有音频交接协议，需直接关闭本任务遗留的旧标签，并核对实际列表。预览服务的音频连接数只统计新客户端，不能代替实际浏览器页面和音源检查。

构建微信小游戏并在微信开发者工具中打开：

```bash
npm run build:wechat
npm run open:wechat
```

微信构建脚本会在 Cocos 构建后固定写入正式 AppID、竖屏方向、基础库版本，以及背景音乐 CDN 地址 `https://cdn.tcjstory.cn/cocos-zyx/`。代码包是“主包 + 首页分包 + 特效分包”；`remote/` 已被排除，不会打进微信包。提审前把该目录上传到 CDN，并在微信后台把 `cdn.tcjstory.cn` 配进 downloadFile 合法域名。不要把这些文件放到 `api.tcjstory.cn`。

所有分享入口从三套原图文案与 CDN 图片中随机选择。分享 JPG 存在 `share-assets/20261112/`，不放进 `assets/` 或微信代码包。图片处理、发布命令和尺寸见 [`docs/sharing.md`](docs/sharing.md)。

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

2026-11-18：用户报告前端已审核通过发布后，Production已晋升同一Staging镜像至API20/V15/schema12，全部后端修改正式可用；157账号及历史数据保留。当前正式入口 `output/current-production-release.json`；[本次发布说明](output/releases/20261118-production-api20-135431/发布说明.md)。本轮未改前端，以下待晋升描述为历史状态。

2026-11-18：Staging已升级API20/V15/schema12，微信开发版本v2026.11.18.05已上传并生成扫码包。包含近期所有局内流程、音效和彩带优化；原玩家/对局数据保持。当前发布入口 `output/current-wechat-release.json`，说明 [v2026.11.18.05发布说明](output/releases/20261118-staging-v15-review-025145/发布说明.md)。Production仍API18/V13；提审准备仅Staging，审核通过且用户决定正式上线后再协调配套后端发布。当前审核路由尚待验证，规则见 [提审与正式发布约定](docs/release-policy.md)；本轮未提交审核。以下版本状态为历史记录。

2026-11-17，Staging已部署API16/V12/结构11，微信 `v2026.11.17.01` 扫码预览和开发版本上传已完成，等待用户手机验收，未提审。原64玩家与全部历史记录保留，6个测试服账号旧工具共返24豆；Production仍API13且未改。当前入口 `output/current-wechat-release.json`；发布证据 `output/releases/20261117-gameplay-v12-132009/发布说明.md`。以下本地候选与此前发布条目为历史状态。

2026-11-17新增本地候选 `v2026.11.17.01` / V12 / API16 / 结构11，待发布：道具限当局、商城仅体力/复活卡、历史锤棒每件返还3豆、独立广告位、两类救场各4次、闪电格及主线冷启动/离线续玩。V5–V11旧规则兼容，数据代际不变。线上与原发布入口未改；说明见 [`docs/gameplay-v12-2026-11-17.md`](docs/gameplay-v12-2026-11-17.md)。以下条目为对应历史候选/发布状态。

2026-11-14，本地候选升级为 V10/API13/结构8，新增每5局一次免费暖心气球，保留 V5–V9 开局及历史重放；尚未部署，使用新客户端前必须更新配套后端。首页左下角客户端序列号为 `v2026.11.14.07`；核心界面随包使用圆体 BMFont，昵称保留动态字库，已接入用户认可的第二版“开始”图片字。GM的“爱心救场演示”可直接测试危险红光、暖黄气球、留言和爱心消除；仅存在于本地Web预览，不提交成绩。

2026-11-13，Staging 已发布 API11/结构8，支持 V5–V8 并行开局、随机救场及当前开心豆余额榜。Production 仍为 API9，正式发布 V8 客户端前需要同步配套后端。微信正式版连接 Production，开发/体验版连接 Staging；Web Debug 可显式连接本机。执行 `npm run check:cloud:staging` 验证测试接口；本次发布证据见 `output/releases/20261113-staging-ui-144730/`。

音乐的场景、暂停、声音开关及前后台规则见 [音乐控制排查与修订](docs/audio-control-2026-11-12.md)。本地普通预览从首页进入；气球演示默认静音。
