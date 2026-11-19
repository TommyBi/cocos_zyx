# 复活卡 · 美术候选 v1

2026-11-16生成候选；用户随后明确认可第二款并授权实现。2026-11-17已采用第二次生成结果（本目录归档名candidate-v1），运行图为effects分包的revive_card_v2.png，玩法交付见 [复活卡交付](../../revive-card-2026-11-17.md)。

## 视觉提案

奶油纸质票卡、鼠尾草绿描边和回转箭头、暖粉爱心与小芽，采用二维手绘、哑光纸感。名称与25开心豆售价由游戏文字区展示，不嵌入图标。候选图由内置 ImageGen 生成，保留透明通道；已在奶油色背景检查大图及96px、64px展示，见 review-preview-v1.png。

## 用户要求的后续范围（美术认可后实现）

- 商城新增复活卡，25开心豆购买一张。
- 每局首次复活保留当前看广告提示。
- 广告复活后再次失败，有复活卡时提示使用，消耗一张额外复活一次；无卡直接结算。
- 每局复活卡仅增加一次机会；最终结算核验覆盖用卡事实，库存消费与重放一致。
- 后续实现须兼容已有存档、未结算进度和旧版结算，不重置玩家资产。

## 生成方式与提示词

使用内置 image_gen，未使用CLI。初始提示词如下，第二次编辑仅要求移除图外光晕、保留主体并输出透明背景。

```text
Use case: stylized-concept.
Asset type: a single standalone illustrated inventory/shop item icon for a gentle Japanese anime inspired cozy mobile puzzle game, named Revival Card (复活卡). This is a visual proposal for review, not a complete app screen.
Primary request: Design ONE charming paper revival ticket, whose silhouette immediately reads as a usable card and whose central symbol means a second chance. Landscape rounded rectangular cream paper ticket, slightly tilted about 8 degrees, small semicircular ticket notches at the middle of the two short edges. A restrained sage green hand-drawn outer contour and one inner outline. A large warm dusty pink heart in the center, hugged by ONE open circular sage green return arrow, with an unambiguously connected tangent and clean arrowhead at the upper right, symbolizing life returning. A tiny two-leaf sprout sits on the top edge as a friendly touch. The heart and return arrow should be bold and spacious enough to remain recognizable at 64px. The heart is flat with simple tender watercolor shading, no shine or white highlights.
Style/medium: 二维手绘、日式动漫插画、柔和唯美、温暖治愈、自然可爱、哑光质感、轻柔阴影. Delicate warm brown-green natural ink outlines with slight organic variation, cream paper grain, gentle gouache color blocks, flat 2D illustration. Refined, lovable, calm, polished through drawing rather than volume. Cream, muted sage green, and warm petal pink palette.
Composition: only one isolated card, centered with 12 percent transparent padding around its entire silhouette. Mostly front-facing, no visible extruded edge. Clear silhouette, no background badge, no surrounding panel, no scene, no duplicated miniatures, no detached sparkles.
Text: NO text, NO letters, NO numbers, NO price, NO watermark. Name and price will be rendered separately by game UI.
Output: true transparent alpha background PNG, clean silhouette, subtle paper texture inside opaque card only. All parts wholly in frame.
Avoid: 3D render, clay, plastic, glossy, specular highlights, jelly/candy finish, beveled/extruded UI, thick lower-right shadow, strong gradients, gold metal, realistic lighting, medical cross, skulls, wings, elaborate filigree, dense small detail.
```

