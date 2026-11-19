# 开心豆正式形象 · 2026-11-14

用户本次要求使用最后附图完成全游戏替换。采用无耳朵、双叶芽的二维手绘哑光笑脸；此前v2圆豆与v3叶帽长豆仅为历史候选，不再作为待接入项。

- 审核源图：`no-ears-avatar-candidate-v4.png`，与本次附图一致。
- 透明母版：`no-ears-transparent-v4.png`，内置image_gen仅去除背景，提示词见`runtime-extraction-prompt.txt`。
- 运行资源：`assets/bundles/game/images/formal/bean_hud_mascot_v1.png`，256×256，保留原纹理与SpriteFrame UUID以覆盖所有现有角色引用；通过sips进行构建尺寸缩放。
- 首页、头像、排行榜、局内收集、飞豆、商城、结算、暖心留言与启动加载页共用同一张角色贴图。玩家已授权微信照片继续按原逻辑显示。

发布与验证结果见`output/current-wechat-release.json`及发布说明。
