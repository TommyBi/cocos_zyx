# 烦恼排排消

一个面向微信小游戏的 Cocos Creator 2.4.13 回合制左右消除游戏。玩家在“心情整理所”中移动柔软心情块，填满整行后收集其中的表情；表情会沿贝塞尔曲线飞入顶部开心瓶，每个表情同时提供 1 点长期经验。进度跨日永久累积，每满 66 得到 1 枚开心瓶。

当前版本已经形成可完整体验的微信小游戏垂直切片：核心玩法、首页、结算、救场、复活、广告道具、云档案/周榜与秘境入口已经贯通；微信开发者工具预览编译与模拟器运行通过，黑屏修复版 `0.1.1` 已上传至 AppID `wxdc39c78bfd045896`。刘海安全区、胶囊避让及长短屏布局已接入并完成多尺寸模拟，但真实广告位、真机授权与生命周期、秘境云权威、离线结算补传、埋点和投放配置仍待补齐，不能视为可直接提审上线版本。

## 玩法

- 在当前行左右拖动色块。
- 色块受重力下落，填满一整行后自动消除并计分。
- 解压锤和魔法棒当前可通过「分享给好友」获得 1 次使用机会（停留不足 3 秒视为失败）；激励视频链路保留待用户量达标后恢复。库存会跨局保留。领取后直接进入目标选择，解压锤同时支持从图标拖放到目标。
- 棋盘接近顶部时，每个复活阶段提供一次分享救场，自动净化数量最多的一种颜色。
- 首次失败可分享复活一次，清除棋盘上半区；复活后再次失败直接结算。
- 顶部堆满时进入复活/结算流程；也可以从暂停菜单主动结束本局。
- 部分心情块带有可收集表情；整体保持积极/消极约 3:2。
- 表情在消除时飞入顶部开心瓶，并触发瓶盖“打嗝”反馈。
- 每个表情固定获得 1 点经验；表情进度永久累积，满 66 得到 1 枚开心瓶。
- 有可消除机会且 8 秒无操作时，小手会演示一次移动并自动复位。
- 前 10 次挑战以玩法提示为主，之后切换为低频暖心文案。
- 首页显示等级经验、开心瓶、解忧秘境/排行榜入口和微信头像昵称授权。

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

运行测试（客户端存档迁移单测 + 服务端接口集成测试）：

```bash
npm test
```

## 核心结构

```text
assets/
├── scene/game.fire                        # 唯一启动场景
└── script/
    ├── GameMainScene.ts                   # 首页、云、秘境、排行榜与玩法切换
    ├── dataModule/ZyxGameModule.ts        # 棋盘、重力、消除、计分、开心瓶与存档
    ├── manager/
    │   ├── AssetLoader.ts                 # 唯一资源入口：Feature → Bundle → 同步取资源
    │   ├── AudioManager.ts                # 音乐与音效
    │   ├── CloudService.ts                # 云档案 / 结算 / 周榜
    │   ├── GameSettings.ts                # 本地设置
    │   ├── PlatformAdapter.ts             # 微信平台 API 唯一访问入口
    │   ├── SettingsPanel.ts               # 设置面板
    │   ├── ShareReward.ts                 # 分享代替激励视频的奖励链路
    │   ├── UIManager.ts                   # UI 工厂与弹窗
    │   └── WeChatProfileController.ts     # 微信头像昵称授权
    └── zyxGame/
        ├── ArtAlbum.ts                    # 秘境画册
        ├── BookTransition.ts              # 画册翻页转场
        ├── GlyphFactory.ts                # 局内小图标绘制工厂
        ├── LeaderboardPanel.ts            # 周排行榜弹窗
        ├── MoodArt.ts                     # 10 种心情、开心瓶、动态水印墙与程序美术
        ├── ZyxGame.ts                     # 玩法编排与界面
        └── ZyxGridCom.ts                  # 左右拖动手势
```

## 设计与生产文档

- [`docs/project-handoff-2026-08-03.md`](docs/project-handoff-2026-08-03.md)：当前最可信的项目状态、代码审查结论、设计差距和下一轮优先级。新对话应先读此文件。
- [`docs/formal-ui-implementation-v2.md`](docs/formal-ui-implementation-v2.md)：当前已落地的正式 UI 规范、资源清单和交互验收标准。
- [`docs/v1.1-worktree-audit-2026-08-03.md`](docs/v1.1-worktree-audit-2026-08-03.md)：v1.1 工作区审计；产品方向已定为方案 B。
- [`docs/game-iteration-development-plan.md`](docs/game-iteration-development-plan.md)：早期迭代方案（历史，勿恢复日瓶/周瓶）。
- [`docs/formal-art-generation-spec-v1.md`](docs/formal-art-generation-spec-v1.md)：早期美术生成规范（历史，正式实现以 formal-ui-v2 为准）。
