# 烦恼排排消

一个面向微信小游戏的 Cocos Creator 2.4.13 回合制左右消除游戏。玩家在“心情整理所”中移动柔软心情块，填满整行后收集其中的表情；表情会沿贝塞尔曲线飞入顶部心情瓶，每个表情同时提供 1 点长期经验。

当前版本已经形成可完整体验的微信小游戏垂直切片：核心玩法、首页、结算、救场、复活和广告道具流程已经贯通；微信开发者工具预览编译与模拟器运行通过，黑屏修复版 `0.1.1` 已上传至 AppID `wxdc39c78bfd045896`。刘海安全区、胶囊避让及长短屏布局已接入并完成多尺寸模拟，但真实广告位、真机授权与生命周期、云存档、埋点和投放配置仍待补齐，不能视为可直接提审上线版本。

## 玩法

- 在当前行左右拖动色块。
- 色块受重力下落，填满一整行后自动消除并计分。
- 解压锤和魔法棒均可通过激励视频获得 1 次使用机会；顺心瓶赠送的道具会保留在库存中。领取后直接进入目标选择，解压锤同时支持从图标拖放到目标。
- 棋盘接近顶部时，每个复活阶段提供一次广告救场，自动净化数量最多的一种颜色。
- 首次失败可看视频复活一次，清除棋盘上半区；复活后再次失败直接结算。
- 顶部堆满时进入复活/结算流程；也可以从暂停菜单主动结束本局。
- 部分心情块带有可收集表情；整体保持积极/消极约 3:2。
- 表情在消除时飞入顶部许愿瓶，并触发瓶盖“打嗝”反馈。
- 每个表情固定获得 1 点经验；每日心情瓶最多记录 666 个表情。
- 有可消除机会且 8 秒无操作时，小手会演示一次移动并自动复位。
- 前 10 次挑战以玩法提示为主，之后切换为低频暖心文案。
- 首页显示左对齐的等级经验、可按周切换的顺心瓶面板和微信头像昵称授权入口；装满的单瓶可领取随机道具，整周装满会进入庆祝状态。

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

微信构建脚本会在 Cocos 构建后固定写入正式 AppID、竖屏方向与基础库版本。当前发布包使用本地单包，`resources` 在微信平台关闭 JSON 合并和 MD5 文件名，以兼容 Cocos Creator 2.4.13 与当前微信开发者工具的预编译链。

## 核心结构

```text
assets/
├── scene/game.fire                  # 唯一启动场景
└── script/
    ├── GameMainScene.ts             # 开始页与玩法切换
    ├── dataModule/ZyxGameModule.ts  # 棋盘、重力、消除、计分
    ├── manager/Uimanager.ts         # 最小 UI 工厂与弹窗
    └── zyxGame/
        ├── MoodArt.ts               # 10 种心情、表情瓶、动态水印墙与正式代码美术
        ├── ZyxGame.ts               # 玩法编排与界面
        └── ZyxGridCom.ts            # 左右拖动手势
```

## 设计与生产文档

- [`docs/project-handoff-2026-08-03.md`](docs/project-handoff-2026-08-03.md)：当前最可信的项目状态、代码审查结论、设计差距和下一轮优先级。新对话应先读此文件。
- [`docs/game-iteration-development-plan.md`](docs/game-iteration-development-plan.md)：可执行迭代方案、难度、IAA、微信适配与埋点计划。
- [`docs/formal-art-generation-spec-v1.md`](docs/formal-art-generation-spec-v1.md)：正式 UI、原画、心情块、心情印、许愿瓶和分享海报生成规范。
- [`docs/formal-ui-implementation-v2.md`](docs/formal-ui-implementation-v2.md)：当前已落地的正式 UI 规范、资源清单和交互验收标准。
