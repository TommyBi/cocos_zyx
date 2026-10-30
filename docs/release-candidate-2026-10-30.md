# 2026-10-30 本地候选包核对

- 范围：删除秘境客户端实现与资源、服务端路由及新库表；保留旧开心豆余额且不返还旧秘境投入。新增服务端体力开局校验：30 点上限、每 10 分钟恢复 1 点、每局消耗 1 点。体力耗尽可每天分享补充一次 5 点。首页以玫红闪电与开心豆胶囊并排展示资源，扣点后闪电飞入开始按钮。权益货币和每日活动额度未实现。手机、平板、横屏与折叠屏分区适配规则见 [`responsive-layout.md`](responsive-layout.md)。
- 本地测试：`npm test` 通过（客户端 47 项、服务端 12 项）；TypeScript 类型检查、`npm run build:web`、`npm run build:wechat`、`git diff --check` 通过。微信包主包 3.47 MB、首页分包 1.79 MB、远程分包 0，GM 产物检查通过。
- 本地预览：Web 在 `http://localhost:7457/`，API 在 `http://localhost:8080/`；API 使用从 `server/data/game.sqlite` 复制的 `server/data/preview.sqlite`，原库未改。Web 预览产物的 `index.html` 临时写入本地 API 覆盖，仅供本机调试。实测首页资源栏、300 毫秒开局动画、棋盘与弹窗完整；隔离预览档案体力耗尽后出现分享弹窗，模拟分享后服务端入账，顶部由 `0/30` 更新至 `5/30`，无浏览器错误日志。
- 候选源码指纹：`942a80cc37243919741c2ece76b4dc878e24e30ff08e83c3f8c702c12c63e469`（`/private/tmp/cocos-zyx-stamina-header-source.json`）；微信产物指纹：`d8376f2b24cc7d532f4ac000a6c81192f3f98b7606e50fe1c873d145e40af5c9`（`/private/tmp/cocos-zyx-stamina-header-wechat-artifact.json`）。
- 现网只读核对：服务端目录 `src/index.js` 与运行中 `tcjstory-cocos-zyx-cocos_zyx_api-1` 容器内代码哈希均为 `4ff4f1c65f4bf44699d6474a21d013b4b4e32b3a1acf70119e43f552a79be66d`；本地候选该文件哈希为 `2f3bb2794604b594f412dc6cda482400e2c744f3c252339db8be254942e16253`。现网尚未更新。
- 尚未执行：生产数据库备份、旧秘境表手工清理、服务端发布、微信体验版上传及真机验收。发布顺序应先更新服务端并验收 `/games/start` 与 `/stamina/share-claim`，再上传微信包。普通微信分享无法提供服务端独立验真凭证，权益活动上线前须接入可信广告完成回调和微信身份。发布前按 `tcjstory-deploy` 流程核对完整现网源码、运行镜像和业务数据备份；不得上传本机预览数据库或 Web 调试覆盖。
