# 烦恼排排消

> **给接手的 AI agent**：请先读 `docs/agent-handoff-phase-a.md`（阶段 A 交接：架构、部署、踩坑清单），再动代码。

一个面向微信小游戏的 Cocos Creator 2.4.13 回合制左右消除游戏。玩家在“心情整理所”中移动柔软心情块，填满整行后消除；带表情的心情块被消除时会显现为 1 颗同色、同表情的开心豆并飞入局内收集位。开心豆是唯一的长期收集物，可以在“时空秘境”里逐格拼出官方画作，拼满后熨烫定型、解锁高清原画。

当前版本处于“开心豆 + 官方拼画”阶段 A：核心玩法、首页、结算、救场、复活、广告道具、云档案/周榜、开心豆经济、650×780 官方拼画与主题画框已经贯通。旧开心瓶经济与毛玻璃解锁已随数据代际 `mood_bean_v1` 整体退役，所有玩家从新档开始。调色铺、彩豆与 DIY 画板属于阶段 B，尚未实施。真实广告位、真机授权与生命周期、埋点和投放配置仍待补齐，不能视为可直接提审上线版本。

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
- 首页显示等级经验、开心豆余额、时空秘境/排行榜入口和微信头像昵称授权。

## 开心豆与官方拼画

- 结算时本局收集的开心豆全额入账（第一版无额外奖励时 `入账 = 本局收集`）；云端按 `roundId` 幂等结算，离线时进入本地待提交队列 `zyx_pending_round_settlements`，联网后自动补传。
- 时空秘境中的画册按等级开放（第一册 Lv.1，第二册 Lv.5），册内画作按顺序拼画，前一幅未定型时不能投入后一幅。
- 每幅官方画作是 650×780 的 130×156 逻辑豆位拼画（共 20,280 个豆位），1 颗开心豆恰好填充 1 个豆位；填充顺序由画作焦点与稳定种子确定，任何设备重进都一致。
- 投入由服务端权威扣减并按 `actionId` 幂等；余额不足或剩余豆位不足时服务端安全裁剪，绝不出现负数或越界。拼画操作第一版要求在线。
- 拼满 20,280 个豆位后播放熨烫定型演出并显示 650×780 高清原画；重进后直接展示已定型画作。
- 画框与原画分离：每册画册复用一套 700×830 主题画框（四季物语奶油木、京城掠影深胡桃木），只解码当前画作与左右邻居。
- 服务端权威数据：开心豆余额、官方画作进度与完成状态、本周开心豆排行（接口枚举仍沿用 `happiness`，玩家文案为“本周开心豆”）。

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

微信构建脚本会在 Cocos 构建后固定写入正式 AppID、竖屏方向与基础库版本。发布包为“主包 + 分包”结构：消除玩法资源在主包，首页、秘境核心与各册画作大图各自独立分包，由 `AssetLoader` 按 Feature 边界加载，`resources` 在微信平台关闭 JSON 合并和 MD5 文件名，以兼容 Cocos Creator 2.4.13 与当前微信开发者工具的预编译链。

运行测试（客户端存档与开心豆经济单测 + 服务端接口集成测试）：

```bash
npm test
```

画作资源转换（750×1000 母版 → 650×780 运行图 + 130×156 像素预览 + 主题画框；母版归档在 `docs/art-sources/archive/formal/`）：

```bash
node scripts/convert-artwork.js
```

## 核心结构

```text
assets/
├── scene/game.fire                        # 唯一启动场景
└── script/
    ├── GameMainScene.ts                   # 首页、云、秘境、排行榜与玩法切换
    ├── dataModule/
    │   ├── ZyxGameModule.ts               # 棋盘、重力、消除、计分、开心豆与存档
    │   └── MoodBeanConfig.ts              # 开心豆/拼画集中配置与确定性填充顺序
    ├── manager/
    │   ├── AssetLoader.ts                 # 唯一资源入口：Feature → Bundle → 同步取资源
    │   ├── AudioManager.ts                # 音乐与音效
    │   ├── CloudService.ts                # 云档案 / 结算 / 周榜 / 秘境拼画
    │   ├── GameSettings.ts                # 本地设置
    │   ├── PlatformAdapter.ts             # 微信平台 API 唯一访问入口
    │   ├── SettingsPanel.ts               # 设置面板与 GM 补给（发放开心豆/道具）
    │   ├── ShareReward.ts                 # 分享代替激励视频的奖励链路
    │   ├── UIManager.ts                   # UI 工厂与弹窗
    │   └── WeChatProfileController.ts     # 微信头像昵称授权
    └── zyxGame/
        ├── ArtAlbum.ts                    # 时空秘境画册与 130×156 官方拼画
        ├── BookTransition.ts              # 画册翻页转场
        ├── GlyphFactory.ts                # 局内小图标绘制工厂
        ├── LeaderboardPanel.ts            # 周排行榜弹窗
        ├── MoodArt.ts                     # 10 种心情、开心豆与程序美术
        ├── ZyxGame.ts                     # 玩法编排与界面
        └── ZyxGridCom.ts                  # 左右拖动手势
server/
└── src/index.js                           # 云档案、开心豆结算、周榜与官方拼画事务
```

## 设计与生产文档

- [`docs/stage-a-code-review-remediation-2026-08-21.md`](docs/stage-a-code-review-remediation-2026-08-21.md)：阶段 A 上线前代码审查整改基线；覆盖 Web-only GM、清洁建档、离线队列、放弃重开、拼画幂等、可靠落盘和真机性能，R0～R6 为上线阻断项。
- [`docs/mood-bean-visual-spec-v1.md`](docs/mood-bean-visual-spec-v1.md)：开心豆的正式概念、单颗图标母版、十种颜色/表情继承规则、局内飞行动画和小尺寸验收标准。
- [`docs/mood-bean-artwork-diy-implementation-plan-v1.md`](docs/mood-bean-artwork-diy-implementation-plan-v1.md)：最新实施基线；阶段 A 先完成开心豆、650×780 秘境拼画与主题画框并强制停止，阶段 B 等另行布置后再实现 10:1 调色与 DIY 画板。
- [`docs/project-handoff-2026-08-03.md`](docs/project-handoff-2026-08-03.md)：开心瓶版本的现有实现状态、代码审查结论和历史设计差距；实施新方案时用于定位旧代码，不作为新产品规则。
- [`docs/formal-ui-implementation-v2.md`](docs/formal-ui-implementation-v2.md)：当前已落地的正式 UI 规范、资源清单和交互验收标准。
- [`docs/v1.1-worktree-audit-2026-08-03.md`](docs/v1.1-worktree-audit-2026-08-03.md)：v1.1 工作区审计；产品方向已定为方案 B。
- [`docs/game-iteration-development-plan.md`](docs/game-iteration-development-plan.md)：早期迭代方案（历史，勿恢复日瓶/周瓶）。
- [`docs/formal-art-generation-spec-v1.md`](docs/formal-art-generation-spec-v1.md)：早期美术生成规范（历史，正式实现以 formal-ui-v2 为准）。
