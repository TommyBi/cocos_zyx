# 首页微信好友积分榜：调研、设计与接入

日期：2026-11-14，更新：2026-11-16。本地最新候选 `v2026.11.16.01`，仅完成本地修改/构建与浏览器隔离微信模拟，未上传或手机验收。此前v12已由用户确认手机可见好友信息，v13已正式发布；旧交付记录见CHANGELOG。

本次改为居中标题“微信好友最高分”与连续滑动列表，438×460纸卡、398×320共享画布、78px行距、58px头像。删除页码、翻页和刷新按钮。仅创建首页时读取一次；滑动只转发 `friends:scroll` 的纵向位移，不获取数据；成绩托管成功及微信回前台也不自动拉榜。开放域裁切可见行并限制首尾位置，固定自身底栏，主域拖动期间30fps上传贴图、静止8fps。错误提示下次回首页查看，授权入口和主域失败重试保留。三尺寸截图、滑动/请求次数/收集落点及角色轻晃证据见 `output/home-scroll-20261116/`。以下v12尺寸、翻页、回前台/写入成功刷新等记载作为历史实现记录，以本段和最新源码为准。

## 官方能力与约束

本轮直接读取了以下微信官方页面正文（网页检索服务无法展开，改用 HTTPS 获取正文核对），并核对本机 Creator 2.4.13 的 `SubContextView.js`：

- [关系链数据](https://developers.weixin.qq.com/minigame/dev/guide/open-ability/open-data.html)：只有玩过且托管过数据的用户才进入同玩好友结果。不能读取整个微信通讯录，不能把未玩过的好友伪装成榜单记录。
- [getFriendCloudStorage](https://developers.weixin.qq.com/minigame/dev/api/open-api/data/wx.getFriendCloudStorage.html)：仅在开放数据域调用，需 `scope.WxFriendInteraction`。新加微信好友的前两小时可能查不到数据。
- [权限说明](https://developers.weixin.qq.com/minigame/dev/guide/base-ability/authorize.html)、[authorize](https://developers.weixin.qq.com/minigame/dev/api/open-api/authorize/wx.authorize.html)：先查询 `getSetting`；用户点击后申请朋友权限，拒绝后可点击入口进入设置。朋友权限与主域头像昵称权限分开处理。
- [setUserCloudStorage](https://developers.weixin.qq.com/minigame/dev/api/open-api/data/wx.setUserCloudStorage.html)：主域可写当前用户托管数据，value 是字符串。每用户至多128组，每组key+value不超过1024字节，每key不超过128字节。
- [getUserCloudStorage](https://developers.weixin.qq.com/minigame/dev/api/open-api/data/wx.getUserCloudStorage.html)、[开放域 getUserInfo](https://developers.weixin.qq.com/minigame/dev/api/open-api/data/OpenDataContext-wx.getUserInfo.html)：自己的托管成绩和 `selfOpenId` 资料也在开放域内取回，自身身份按 openid 匹配，不能按昵称或头像猜测。
- [UserGameData](https://developers.weixin.qq.com/minigame/dev/api/open-api/data/UserGameData.html)：实际好友结果字段是 `openid / nickname / avatarUrl / KVDataList`，与概念教程的大小写不同；实现兼容两种资料字段。
- [shareAppMessage](https://developers.weixin.qq.com/minigame/dev/api/share/wx.shareAppMessage.html)：主动拉起转发选择，支持图片与query；接口未提供可证明分享成功的success回调，返回游戏不能证明好友已接受邀请。
- [Cocos 2.4 开放数据域](https://docs.cocos.com/creator/2.4/manual/zh/publish/publish-wechatgame-sub-domain.html)：通过共享画布展示，好友数据留在隔离域。本项目采用原生Canvas子域，避免打包第二份Cocos引擎；主域设置尺寸并以8fps上传共享贴图。
- [小游戏配置](https://developers.weixin.qq.com/minigame/dev/reference/configuration/app.html)：`game.json.openDataContext` 指向子域目录；若未来使用服务端独占写入，应配置 `disableSetUserStorageFromMiniProgram` 并更换当前客户端写入流程。
- [微信隐私配置指南](https://developers.weixin.qq.com/minigame/dev/guide/open-ability/privacy.html)：发布前需在小游戏后台按实际使用补充“微信朋友关系”等隐私披露，并完成对应用户授权流程。

## 分数与数据流程

1. 登录/bootstrap或服务端结算返回权威 `highestSingleGameScore`。
2. 主域应用有效档案后调用 `syncConfirmedFriendScore`。不读取本局实时分、本地最高分或GM展示值作为好友榜成绩来源；零分新用户也创建托管记录。
3. 正式key为 `zyx_best_score_v1`；开发/体验key为 `zyx_best_score_staging_v1`。v12在同次写入中附带 `${key}_owner`，值为服务端已确认的playerId，用于开放域精确匹配自身。两套环境均隔离。同一会话按玩家和key串行合并写入；成功后不重复上报，失败在后续档案同步时重试。首次接入的老玩家需运行新客户端一次，已有最高分才会补入微信托管数据。
4. 首页已授权时发送 `friends:show`；开放域并行读取好友数据、自己的信息及托管分数。主域既不读取也不接收好友明细、openid或排名数组。
5. 子域只排序合法非负整数，按分数降序；同分并列名次（1、1、3），同分显示顺序按openid稳定排序。自身身份优先按托管账号标记匹配好友结果；若接口直接返回真实openid也可匹配。selfOpenId查询别名不得作为额外用户加入榜单。标记未出现在好友结果时，底栏先显示已有分数及“排名同步中”，不按昵称/头像猜身份。好友榜包含自己，自身底栏不额外影响名次。
6. 首页重入、回到前台、成绩上传成功和手动刷新时更新；没有持续轮询。离开首页发送 `friends:hide`，清画布、释放头像并废弃未完成请求，局内不做关系链绘制。

这是微信托管数据的客户端同步方案，正式游戏结算仍由现有后端重放校验。本次没有新增服务端签名写微信数据的防篡改通道；好友展示适用，未来若用于领奖或其他经济权益，需要服务端调用微信写入API并独立验证。

## 展示设计

沿用 `art-direction.md`，新增模块为哑光二维纸卡，不引入高光、厚边、金属奖杯或半3D素材。颜色：奶油纸色 `#FFFAEB`、暖棕字色 `#6A4E3E`、细线 `#B09470`、芽绿 `#DAEBCC`、自身浅绿 `#E6EFD9`。外框与按钮用Cocos Graphics，头像/昵称/分数在子域Canvas绘制。

首页布局：顶部资料 → 游戏标题 → 缩小横排的消除演示＋开心豆余额 → 好友积分榜 → 体力信息＋开始；右侧原排行榜/商城仍保留。版本标识移至右下角。

按用户后续反馈，好友卡宽462、高500设计像素，水平居中，左右各预留独立入口区域，左侧留给未来活动。标题“好友积分榜”左对齐，右侧“单局最高分”交代口径。开放域列表422×320，三行直接显示名次、58像素圆形微信头像、26号昵称和28号常规分数，行距72；自己用浅绿标出，固定底栏仍能在翻页时看到。每页三人，下方“上一页 / 刷新 / 下一页”，最下方芽绿“邀请好友＋分享线稿”，文字在前。分数千分位，超长昵称省略，长分数只缩小分数字号防重叠。头像直接读取微信avatarUrl、异步加载并中心裁切，只有缺失/加载失败才显示小芽；玩法示意按标题下沿与好友榜上沿中点下移。

首次展示使用朋友权限说明＋“查看好友排名”；拒绝显示“开启朋友权限”。无好友时显示邀请提示；只有自己时说明可以邀请好友来比；失败明确重试，不用空榜掩盖错误。Web显示在微信查看提示，不注入假好友。

邀请复用已配置分享图及原生转发入口，附 `from=friend_invite`，不进入奖励分享计时，不发放体力、不声称邀请成功，也不发送聊天消息。

## 实施文件

- `assets/script/manager/WeChatFriends.ts`：环境key、权威成绩串行上报、单向消息。
- `assets/script/zyxGame/HomeFriendRanking.ts`：首页纸卡、授权状态、共享画布视图、翻页和邀请操作。
- `wechat-open-data/index.js` 与 `ranking.js`：隔离域API、排序、自身身份、头像及Canvas绘制。
- `scripts/prepare-wechat-build.js`：每次构建复制子域目录并写 `game.json.openDataContext`，纳入既有主包预算。
- `GameMainScene.ts`：首页紧凑布局、云档案同步入口和生命周期；`ShareReward.ts`：独立邀请入口。
- `scripts/tests/wechat-friends.test.js`、`reward-offer.test.js`：数据边界、竞态、失败重试、隔离域翻页和分享语义；`scripts/verify-wechat-friends.cjs`：浏览器三尺寸模拟验收。

v12在首页组件先将共享Canvas宽高设置为422×320，再发送show并以8fps更新Texture2D。相同尺寸不重复赋值，避免重入清空画布；开放域尺寸只读，仅绘制。SpriteFrame以CUSTOM模式保持节点布局。隐藏时停更，销毁时释放SpriteFrame/Texture2D。此模块交互均由主域按钮完成，不需要将触摸坐标传入开放域。

## 真机反馈与兼容修复

用户在v10真机看到页码与第一行名次，但没有头像、昵称和成绩；开发者工具重复提示只读Canvas。v11错误地将只读限制归到主域，取消主域尺寸设置后反而完全空白。**先前对画布归属的判断以及相应模拟夹具均有误，本节以v12订正为准。**

在用户当前微信工具3.15.2现场读取，主域canvas尺寸为390×844；主域设置422×320后，真实头像、昵称和已有1,750分恢复显示。开放域ellipse确实为undefined，自身getUserInfo的openId确实返回selfOpenId别名。v12在主域设置宽高，开放域不再赋值；账号标记解决别名不能去重自身的问题。

严格Canvas夹具复现缺少ellipse时，旧代码在头像占位绘制中断，尚未创建头像请求；save/clip未恢复，又使后续错误提示被裁掉。v11使用基础贝塞尔曲线绘制小芽，以try/finally恢复绘图状态；单个头像失败仍继续昵称和分数，缺少clip时显示方形头像。异步旧头像回调按缓存实例校验，读取与绘制失败分开诊断，不记录好友资料。

此前测试用Proxy把所有缺失Canvas接口伪装为空函数，浏览器又支持ellipse；v11虽改严格接口，画布尺寸归属仍模拟反了。v12单元测试将开放域宽高设为只读，主域从390×844开始，验证尺寸设置早于show。浏览器同样从屏幕尺寸启动，仅允许主域设置尺寸，禁用ellipse并返回selfOpenId别名；旧v11 Web产物在此夹具明确失败（主域写入0而非2），修复后的产物再验证头像、分数、名次和布局。真实手机与双好友仍需用户扫码确认。

## 交付与真机步骤

最新测试、构建、ZIP及微信CI扫码预览见本日CHANGELOG以及 `output/wechat-friends-canvas-owner-20261114/`；v09–v11历史交付保留。文件名含 `simulated` 的截图仅使用隔离测试好友与样例头像，不能证明微信真实关系链已连通。候选v12通过195客户端、51服务端测试；实际微信工具验收与手机/双好友验收分别记录。

微信开发者工具打开 `build/wechatgame` 后，核对 `game.json.openDataContext` 为 `openDataContext`，子域内有 `index.js`、`ranking.js`。在开放域调试面板查看调用情况。

真机用两个互为微信好友的账号：均进入新版本并完成服务端结算 → 授权朋友信息 → 回首页刷新 → 两人分数与各自真实名次正确 → 更新最高分再刷新 → 翻页固定自身名次 → 拒绝/重新开启权限 → 点击邀请能打开转发且不发奖励。体验版成绩只会出现在体验key；正式版需分别验收正式key。后台隐私配置和上述真机检查完成后，才能把本地接入标记为正式验收通过。
