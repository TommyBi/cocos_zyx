import { getMoodCollection, MOOD_BLOCKS_PER_BEAN } from '../dataModule/MoodBeanConfig';
import { uimanager } from '../manager/UIManager';
import { ASSET_PATHS, getBitmapFont } from '../manager/AssetLoader';
import { createMoodBeanMascot } from './MoodArt';
import { createGamePanel, resizeGamePanel } from './GamePanel';

/** 大分数优先保留字的可读尺寸，避免九位数被缩成一串小字。 */
export function formatHudScore(value: number): string {
    const number = Math.max(0, Math.floor(value || 0));
    const unit = number >= 100000000 ? 100000000 : number >= 1000000 ? 10000 : 0;
    if (!unit) return String(number);
    return String(Math.floor(number / unit * 100) / 100) + (unit === 10000 ? '万' : '亿');
}

export function applyHudFont(label: cc.Label): void {
    const size = label.fontSize;
    label.font = getBitmapFont('game', ASSET_PATHS.game.hudFont);
    label.useSystemFont = false;
    label.enableBold = false;
    label.fontSize = size;
    label.lineHeight = size;
    label.enableWrapText = false;
}

/** 本局整颗收获与当前循环进度。动画只影响展示，结算始终使用模块原始计数。 */
export default class BeanCollectionHud {
    public readonly root: cc.Node;
    public readonly icon: cc.Node;
    private ring: cc.Graphics;
    private ringNode: cc.Node;
    private percent: cc.Label;
    private goal: cc.Label;
    private count: cc.Label;
    private badge: cc.Node;
    private state = { blocks: 0 };
    private target = 0;
    private animating = false;
    private disposed = false;
    private reward: cc.Node = null;

    constructor(parent: cc.Node, x: number, width: number) {
        this.root = createGamePanel(parent, 'beanCollectionCard', width, 148, x);
        const ringX = -width / 2 + 86;
        this.ringNode = new cc.Node('collectionRing');
        this.root.addChild(this.ringNode);
        this.ringNode.setPosition(ringX, 5);
        this.ring = this.ringNode.addComponent(cc.Graphics);
        this.icon = createMoodBeanMascot(this.root, ringX, 7, 86);
        this.badge = uimanager.createRect(this.root, 'roundBeanBadge', 132, 36,
            new cc.Color(119, 78, 44), 216, 18, ringX, -46);
        this.badge.zIndex = 90;
        this.count = uimanager.createLabel(this.badge, '本局 +0', 0, 0, 24,
            new cc.Color(255, 252, 238), 120, 30);
        const textWidth = width - 198;
        const textX = 75;
        const captionPill = uimanager.createRect(this.root, 'collectionCaption', 150, 32,
            new cc.Color(106, 153, 59), 255, 16, textX, 46);
        const caption = uimanager.createLabel(captionPill, '收集进度', 0, 0, 24,
            new cc.Color(255, 255, 232), 136, 28);
        this.percent = uimanager.createLabel(this.root, '0%', textX, 0, 64,
            new cc.Color(38, 89, 29), textWidth, 70);
        this.goal = uimanager.createLabel(this.root, '集满100%再得1颗', textX, -47, 22,
            new cc.Color(117, 82, 51), textWidth, 28);
        for (const label of [this.count, caption, this.percent, this.goal]) applyHudFont(label);
        this.render(false);
    }

    /** 随排行展开调整宽度，保持可读区域与背板各有独立内边距。 */
    public resize(width: number): void {
        if (this.disposed || !cc.isValid(this.root, true)) return;
        resizeGamePanel(this.root, width, 148);
        const ringX = -width / 2 + 86;
        this.ringNode.x = this.icon.x = this.badge.x = ringX;
        this.percent.node.width = this.goal.node.width = width - 198;
    }

    public collectTo(blocks: number): void {
        if (this.disposed || !cc.isValid(this.root, true)) return;
        this.target = Math.max(this.target, Math.floor(blocks));
        this.pump();
    }

    /** 结束本局时立即对齐真实计数，不等待飞行粒子或展示动画。 */
    public complete(blocks: number): void {
        if (this.disposed || !cc.isValid(this.root, true)) return;
        cc.Tween.stopAllByTarget(this.state);
        this.clearReward();
        this.state.blocks = this.target = Math.max(0, Math.floor(blocks));
        this.animating = false;
        this.render(false);
    }

    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.animating = false;
        cc.Tween.stopAllByTarget(this.state);
        // Cocos 2.4 先销毁子节点/文字组件，再调用父组件 onDestroy；Label.node 可能已经为 null。
        const percentNode = this.percent && this.percent.node;
        for (const node of [this.icon, this.badge, percentNode]) {
            if (cc.isValid(node, true)) cc.Tween.stopAllByTarget(node);
        }
        this.clearReward(false);
    }

    private clearReward(restoreGoal: boolean = true): void {
        if (this.reward && cc.isValid(this.reward, true)) {
            cc.Tween.stopAllByTarget(this.reward);
            this.reward.destroy();
        }
        this.reward = null;
        if (restoreGoal && !this.disposed && this.goal && cc.isValid(this.goal.node, true)) this.goal.node.opacity = 255;
    }

    private pump(): void {
        if (this.disposed || !cc.isValid(this.root, true) || this.animating || this.state.blocks >= this.target) return;
        this.animating = true;
        const boundary = (Math.floor(this.state.blocks / MOOD_BLOCKS_PER_BEAN) + 1) * MOOD_BLOCKS_PER_BEAN;
        const end = Math.min(this.target, boundary);
        const full = end === boundary;
        cc.Tween.stopAllByTarget(this.percent.node);
        this.percent.node.y = -3;
        cc.tween(this.percent.node).to(0.28, { y: 0 }, { easing: 'quadOut' }).start();
        cc.tween(this.state)
            .to(0.28, { blocks: end }, { easing: 'quadOut', onUpdate: () => {
                if (!this.disposed && cc.isValid(this.root)) this.render(full && this.state.blocks >= end);
            } })
            .call(() => {
                if (this.disposed || !cc.isValid(this.root)) return;
                this.render(full);
                if (full) this.celebrate();
            })
            .delay(full ? 0.32 : 0)
            .call(() => {
                if (this.disposed || !cc.isValid(this.root)) return;
                this.animating = false;
                this.render(false);
                this.pump();
            }).start();
    }

    private render(full: boolean): void {
        const collection = getMoodCollection(this.state.blocks);
        this.percent.string = full ? '100%' : collection.percent;
        this.count.string = `本局 +${collection.beans}`;
        // 字号按位数收敛，SHRINK 仍作为超大值的最终边界；不改变卡片尺寸。
        this.count.fontSize = this.count.string.length > 7 ? 19 : 24;
        const progress = full ? 1 : collection.progress / MOOD_BLOCKS_PER_BEAN;
        const g = this.ring;
        g.clear();
        g.lineWidth = 16;
        g.lineCap = cc.Graphics.LineCap.ROUND;
        g.strokeColor = new cc.Color(220, 210, 169);
        g.circle(0, 0, 55); g.stroke();
        g.lineWidth = 12;
        g.strokeColor = new cc.Color(243, 234, 194);
        g.circle(0, 0, 55); g.stroke();
        if (progress > 0) {
            const arc = (width: number, color: cc.Color) => {
                g.lineWidth = width; g.strokeColor = color;
                if (progress >= 1) g.circle(0, 0, 55);
                else g.arc(0, 0, 55, Math.PI / 2, Math.PI / 2 - Math.PI * 2 * progress, false);
                g.stroke();
            };
            arc(16, new cc.Color(100, 155, 70));
            arc(13, new cc.Color(108, 189, 105));
            arc(6, new cc.Color(155, 216, 132));
        }
    }

    private celebrate(): void {
        for (const node of [this.icon, this.badge]) {
            cc.Tween.stopAllByTarget(node);
            node.scale = 1;
            cc.tween(node).to(0.12, { scale: 1.12 }, { easing: 'quadOut' })
                .to(0.2, { scale: 1 }, { easing: 'backOut' }).start();
        }
        this.clearReward();
        this.goal.node.opacity = 0;
        const label = uimanager.createLabel(this.root, '开心豆 +1', 75, -47, 22,
            new cc.Color(121, 89, 35), this.root.width - 198, 30);
        applyHudFont(label);
        this.reward = label.node;
        this.reward.zIndex = 20;
        cc.tween(this.reward).to(0.12, { scale: 1.06 }, { easing: 'quadOut' }).delay(0.2)
            .to(0.22, { scale: 1, opacity: 0 }).call(() => this.clearReward()).start();
    }
}
