# 排行榜字体来源

- 中文：寒蝉全圆体 ChillRoundF v3.0，来自 [Warren2060/ChillRound](https://github.com/Warren2060/ChillRound)，源文件路径 `ChillRoundF v3.0.ttf`，仓库提交 `46dda1602729b58de96e3fdee9f918d7aaa64727`。
- 数字：Google Fonts 的 [Nunito](https://github.com/google/fonts/tree/main/ofl/nunito)，保留 variable font 源文件，统一生成 Regular 400 字重实例。
- 两者均按随附的 SIL OFL 1.1 分发。派生的中文子集已重命名为 Zyx Happy Round Body，保留原始作者版权及许可记录。Zyx 名称仅用于区分项目衍生资源，不表示独立创作了整套字体。

使用 `python scripts/build-leaderboard-fonts.py` 重建；依赖 Pillow、fonttools。

核心 UI 使用正常字重的 TTF 子集，保留原中文字形，合入 Nunito 400 的拉丁和数字轮廓。HUD 与最初字体排版样张使用 96px 白色 BMFont 图集，中文字形不描边增粗，数字同样使用 400 字重，图集声明 bold=0。动态昵称使用常用 GB2312 中文 TTF 子集，其他字符由文本渲染器回退。所有界面文字关闭运行时模拟加粗。

本地视觉候选已覆盖首页、设置、商城、排行榜和局内。字库的 CDN 分层异步交付方案待评审，本地资源接入方式不代表最终发布策略。
