# 微信小游戏资源与 CDN 发布

## 设计目标

- 首屏只依赖微信主包和 `home` 分包，不被任何远程资源阻塞。
- 资源按功能域归属，业务代码不直接访问 `cc.resources`。
- 首页、消除和秘境等关键资源优先使用微信原生分包，不让关键玩法依赖第三方 CDN。
- 画册高清图总量超过单个微信分包容量，作为非关键内容迁移到 CDN，并使用可校验发布流程。

## Bundle 拓扑

| 单元 | 类型 | 内容 | 加载时机 |
| --- | --- | --- | --- |
| 主包 | 微信主包 | 引擎、场景、核心脚本、internal | 启动 |
| `home` | 微信分包 | 首页图片、`music_main` | 启动后进入首页 |
| `game-assets` | 微信分包 | 局内图片、Spine、`music_game`、消除/移动/道具音效 | 点击“开始消除” |
| `realm` | 微信分包 | 解忧秘境图片、`music_puzzle`、切画音效 | 点击“解忧秘境” |
| `album-art` | CDN 远程 ZIP Bundle | 画册效果、封面和高清画作 | 打开具体画册内容 |

当前微信构建只为 `album-art` 配置远程资源地址；首页启动及核心玩法不依赖 CDN。

`assets/script/manager/AssetLoader.ts` 是唯一 Bundle/资源加载入口，负责并发合并和缓存；
`assets/script/manager/AudioManager.ts` 只负责播放策略和设置面板联动。

## 发布流程

```bash
# 1. 构建微信包；四个业务 Bundle 自动生成微信分包声明
npm run build:wechat

# 2. 先发布构建生成的远程画册资源
npm run deploy:wechat-cdn

# 3. 打开开发者工具体验/上传小游戏包
npm run open:wechat
```

每次 `album-art` 的内容或版本变化后，都需要在打开开发者工具前执行
`npm run deploy:wechat-cdn`；发布脚本会按内容 hash 增量部署并校验线上文件。

CDN 发布清单位于 `build/wechat-cdn-release-manifest.json`，包含：

- 从 `_CCSettings.remoteBundles` 自动读取的远程 Bundle；
- Bundle config 版本和 ZIP 版本；
- 每个远程文件的路径、大小和 SHA-256；
- 由内容计算出的稳定 `releaseId`。

线上保留每次发布清单：

```text
/opt/tcjstory/apps/cocos-zyx/server/cdn/releases/<releaseId>.json
```

远程资源是不可变的 MD5 文件，上传时只增量合并，不删除旧 hash。这样旧版小游戏继续访问旧资源，新版小游戏访问新资源，两者不会互相覆盖。

## 配置位置

- `assets/bundles/home.meta`、`game-assets.meta`、`realm.meta`：微信分包。
- `assets/bundles/album-art.meta`：CDN 远程 ZIP Bundle。
- `settings/builder.json` 与 `package.json`：统一启用 `md5Cache=true`。
- `server/src/index.js`：CDN CORS、CORP 与不可变缓存响应头。

部署脚本默认使用本机已有密钥 `~/.ssh/chloeedu_tcjstory_deploy`；CI 或其他机器通过
`TCJSTORY_DEPLOY_KEY`、`TCJSTORY_DEPLOY_HOST`、`TCJSTORY_APP_ROOT` 覆盖，不把密钥写入仓库。
