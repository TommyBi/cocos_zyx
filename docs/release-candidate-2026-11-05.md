# 2026-11-05 连消与炸弹 · 本地提审候选

授权范围为生成本地微信提审客户端包，用户自行上传审核。本次未上传微信、未改 CDN、未部署 Staging/Production、未修改网关或业务数据。

## 交付物

- 压缩包：`build/wechat-review-20261105-combo.zip`，2,179,548 字节。
- ZIP SHA-256：`421117e540310486d02100d23dd507b970fb241da5e6585f95fe35bba83ec908`。
- 解压后导入 `wechatgame` 子目录，AppID `wxdc39c78bfd045896`，小游戏基础库 3.15.2。
- 包内包含中文导入说明、`release-info.json` 和逐文件 `SHA256SUMS.json`。归档 71 个文件，其中清单覆盖的 70 个文件逐项哈希验证通过；不含私钥、环境变量文件、数据库、GM 入口和远程音乐目录。

## 构建与指纹

- 构建：`npm run build:wechat`；Cocos Creator 2.4.13、Node v24.19.0、npm 11.17.0；TypeScript 4.9.5 使用本机缓存，测试通过临时 npx 转发运行，没有修改项目测试工具链。
- 构建前冻结 159 个源文件，完整包含未提交和未跟踪的相关源码/素材、依赖锁与构建配置；构建后源指纹验证无新增、缺失或变化。
- 源指纹：`bf0a06d3fbcc1ab0e14586889d4f12b41ae069a775ce8f46423da388539f4072`。
- 微信产物指纹：`476ed7659863db08d41b1c0ad6f17509aed735192e67e206b479ec6f6765dbb1`。
- 当前入口 `assets/main/index.js` SHA-256：`47969c22cad0e241bf3db3c6b869f129ed93afe71c427c5fcd69ca050f1a9778`。
- 主包 3,322,169 字节（3.17 MiB），首页分包 364,998 字节（0.35 MiB）。
- 证据目录：`/private/tmp/zyx-review-20261105-combo/`，含 source/artifact 清单、测试与构建日志、CDN 验证、构建内容校验和服务器基线。

## 验证

- 客户端 98 项、服务端 19 项测试通过；TypeScript、资源校验、diff 检查和正式微信 GM 隔离检查通过。
- 实际包入口包含跨操作 combo 与 Great 奖励逻辑，五张新增图片字贴图均在当前 game Bundle 中找到，逐文件内容与源码 PNG 一致。
- 当前构建引用的音乐配置为 `config.1ec15.json`。五个 CDN 文件以微信 Referer 访问均返回 HTTP 200，SHA-256 与本地一致，不需要为此修改 CDN。
- 前轮浏览器已真实拖动验证 Wow/Good/Great、Great 额外炸弹、居中图标和一次无消除后 combo 清零；本轮未进行微信开发者工具/真机验收。

## 提审前依赖：配套服务端尚未上线

只读核对得到：

- Production 容器 `7cfb66dded0b01eab5e05e3e0569def72a5dc11b97872ae03e30a1fc731ae1a2`，image `sha256:e23cd2e0fcadb2fd49a7be493b20284580976fd0e42f994a05a1b93699d247cf`。
- Staging 容器 `3fd0aaea160131468f655c43adb0b7701544a7139a7f9d525f23cd644cc671b9`，image `sha256:b1ec87ca20ccd9e0cea54eae44ba23c05d89bb2c9b5a094bd77b4d89bb028918`。
- Production 磁盘源码及两个运行容器的旧 `gameEngine.js` 均为 `97755c8fe8b19e179b234d46ce2c2382af7e1f9adf49dff0fb82f4e5baf48742`；本地新引擎为 `2d2ac81f822b8f218ebe8c3412f6053db16a7e7a6b02f0f0bcdfcb9c41d7346c`。
- Production 的 index/schema 和依赖锁与本地一致；Staging 的 index/schema 另有差异，未覆盖或修改。

因此当前候选 `readyForSubmission=false`：客户端可导入检查，但正式提审前必须发布兼容的新服务端并验证结算。否则新连消分数与炸弹操作会被旧重放规则拒绝。

后续服务端发布还需兼容既有客户端与已经开局的旧规则对局，不能将新规则直接套用于全部旧局。发布授权、版本兼容方案、运行产物及一致性数据备份需单独完成。本次没有切换服务，因此未创建服务回滚备份，也不得将本地打包记录解释为线上发布成功。
