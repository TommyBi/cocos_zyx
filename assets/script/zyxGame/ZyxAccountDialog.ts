import { zyxGameModule } from "../dataModule/ZyxGameModule";
import { EventType } from "../manager/Define";
import { eventManager } from "../util/EventManager";

const { ccclass, property } = cc._decorator;

// 结算界面 - 参考图1风格
@ccclass
export default class ZyxAccountDialog extends cc.Component {

    @property(cc.Label)
    ulblTitle: cc.Label = null;

    @property(cc.Label)
    ulblScore: cc.Label = null;

    @property(cc.Node)
    uBox: cc.Node = null;

    @property(cc.Node)
    uBtnOk: cc.Node = null;

    onLoad() {
        this.uBtnOk.on(cc.Node.EventType.TOUCH_END, this.close, this);
    }

    start() {
        // 重新构建结算界面UI（不依赖预制体，用代码绘制更灵活）
        this.rebuildUI();
    }

    private rebuildUI(): void {
        // 清除旧内容（保留uBtnOk）
        if (this.ulblTitle) {
            this.ulblTitle.node.destroy();
            this.ulblTitle = null;
        }
        if (this.ulblScore) {
            this.ulblScore.node.destroy();
            this.ulblScore = null;
        }
        if (this.uBox) {
            this.uBox.destroy();
            this.uBox = null;
        }

        const W = this.node.width || 520;
        const H = this.node.height || 700;

        // ======== 欢迎语 ========
        const welcomeNode = this.createLabel(this.node, '\u6b22\u8fce\u5f52\u6765', 0, H * 0.36, 24, new cc.Color(220, 210, 255), false, 320, 40);

        // ======== 头像区域（圆形占位）=====
        const avatarBg = this.createCircle(this.node, 'avatarBg', 62, new cc.Color(200, 180, 230), 0, H * 0.25, 255);
        const avatarInner = this.createCircle(avatarBg, 'avatarInner', 56, new cc.Color(160, 140, 200), 0, 0, 255);

        // 昵称标签
        const nickName = zyxGameModule.scoreRecord > 0 ? '~ \u6d88\u9664\u73a9\u5bb6 ~' : '~ tommybi ~';
        this.createLabel(this.node, nickName, 0, H * 0.17, 22, new cc.Color(200, 190, 240), false, 280, 38);

        // ======== RESULT 标题 ========
        this.createLabel(this.node, 'RESULT', 0, H * 0.07, 44, new cc.Color(255, 255, 255), true, 340, 60);

        // ======== 分数显示 - 大字号醒目 ========
        const scoreStr = `${zyxGameModule.gameInfo.score}`;
        this.createLabel(this.node, scoreStr, 0, H * -0.04, 72, new cc.Color(255, 255, 255), true, 480, 100);

        // ======== BEST 分数 ========
        const bestText = `BEST  ${zyxGameModule.scoreRecord}`;
        this.createLabel(this.node, bestText, 0, H * -0.14, 28, new cc.Color(120, 100, 210), true, 300, 44);

        // ======== 再来一局按钮 ========
        // 按钮位置调整到合适的位置
        if (this.uBtnOk) {
            this.uBtnOk.setPosition(0, H * -0.28);
            this.uBtnOk.width = 380;
            this.uBtnOk.height = 86;
            // 重绘按钮背景
            this.drawRect(this.uBtnOk, 380, 86, new cc.Color(250, 167, 20), 16, 255);
            // 更新按钮文字
            const btnText = this.uBtnOk.getChildByName('text');
            if (btnText) {
                const lbl = btnText.getComponent(cc.Label);
                if (lbl) {
                    lbl.string = '\u25b6';
                    lbl.fontSize = 40;
                }
            }
        }

        // 入场动画
        this.node.scale = 0.3;
        this.node.opacity = 0;
        cc.tween(this.node)
            .to(0.35, { scale: 1.0, opacity: 255 }, { easing: 'backOut' })
            .start();
    }

    close() {
        eventManager.dispatch(EventType.ZYX_RESET_GAME);

        cc.tween(this.node)
            .to(0.2, { scale: 0 })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }

    // ======== UI 工具方法 ========
    private createLabel(parent: cc.Node, text: string, x: number, y: number, fontSize: number, color: cc.Color, bold: boolean = false, w: number = 300, h: number = 50): cc.Node {
        const node = new cc.Node('text');
        node.width = w;
        node.height = h;
        node.setPosition(x, y);
        node.setAnchorPoint(0.5, 0.5);
        parent.addChild(node);

        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = Math.floor(fontSize * 1.2);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.NONE;
        label.enableWrapText = true;
        label.fontFamily = 'Arial';
        label.cacheMode = cc.Label.CacheMode.NONE;
        (label as any).isSystemFontUsed = true;
        node.zIndex = 50;
        node.color = color;
        return node;
    }

    private createRect(parent: cc.Node, name: string, w: number, h: number, color: cc.Color, radius: number = 0, opacity: number = 255): cc.Node {
        const node = new cc.Node(name);
        node.width = w;
        node.height = h;
        node.opacity = opacity;
        node.setPosition(0, 0);
        node.setAnchorPoint(0.5, 0.5);
        parent.addChild(node);

        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        graphics.clear();
        graphics.fillColor = new cc.Color(color.r, color.g, color.b, opacity);
        if (radius > 0) {
            graphics.roundRect(-w / 2, -h / 2, w, h, radius);
        } else {
            graphics.rect(-w / 2, -h / 2, w, h);
        }
        graphics.fill();
        return node;
    }

    private createCircle(parent: cc.Node, name: string, radius: number, color: cc.Color, x: number = 0, y: number = 0, opacity: number = 255): cc.Node {
        const node = new cc.Node(name);
        node.width = radius * 2;
        node.height = radius * 2;
        node.opacity = opacity;
        node.setPosition(x, y);
        node.setAnchorPoint(0.5, 0.5);
        parent.addChild(node);

        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        graphics.clear();
        graphics.fillColor = new cc.Color(color.r, color.g, color.b, opacity);
        graphics.circle(0, 0, radius);
        graphics.fill();
        return node;
    }

    private drawRect(node: cc.Node, w: number, h: number, color: cc.Color, radius: number = 0, opacity: number = 255): void {
        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        graphics.clear();
        graphics.fillColor = new cc.Color(color.r, color.g, color.b, opacity);
        if (radius > 0) {
            graphics.roundRect(-w / 2, -h / 2, w, h, radius);
        } else {
            graphics.rect(-w / 2, -h / 2, w, h);
        }
        graphics.fill();
    }
}
