# 微信主包 / 分包 / 远程资源说明

## 目标

主包上传体积 < 4MB。新用户先能进入核心消除；首页与解忧秘境按需加载。

## 结构

| 单元 | 类型 | 内容 |
| --- | --- | --- |
| 主包 | 本地上传 | 引擎、单场景脚本、internal |
| `home` | 微信分包 | 首页背景/标题/引导手/入口图标 |
| `realm` | 微信分包 | 解忧秘境封面等 |
| `resources` | **远程 CDN** | 局内房间背景、道具图、Spine |

远程地址：`https://api.tcjstory.cn/v1/cocos-zyx/cdn/`

## 发布步骤

```bash
npm run build:wechat
npm run sync:wechat-cdn
# 将 server/cdn 随 API 部署到线上后，再用开发者工具上传 build/wechatgame
```

开关位置：

- `assets/resources.meta` → `isRemoteBundle.wechatgame = true`
- `assets/bundles/home.meta` / `realm.meta` → `compressionType.wechatgame = subpackage`
- 构建参数 `remoteServerAddress` 写在 `package.json` 的 `build:wechat`

## 代码入口

`assets/script/manager/AssetLoader.ts` 统一 `loadBundle` / `loadSpriteFrame`。
恢复整包内置时，把 resources 的 `isRemoteBundle` 改回 `false` 并重建即可。
