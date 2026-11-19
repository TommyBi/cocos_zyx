import { getWxApi } from '../manager/PlatformAdapter';
import { FRIEND_SCOPE, postFriendMessage } from '../manager/WeChatFriends';
import { uimanager } from '../manager/UIManager';
import { inviteWeChatFriends } from '../manager/ShareReward';

const { ccclass } = cc._decorator;

/** 主域只绘制外框和操作，并读取开放域共享画布；好友资料始终留在开放域。 */
@ccclass
export default class HomeFriendRanking extends cc.Component {
    private view: cc.Node = null;
    private placeholder: cc.Node = null;
    private generation = 0;
    private requesting = false;
    private sharedCanvas: any = null;
    private texture: cc.Texture2D = null;
    private sprite: cc.Sprite = null;
    private elapsed = 0;
    private scrollTouch: number = null;
    private scrollY = 0;

    public onLoad(): void {
        const paper = new cc.Color(255, 250, 235);
        const ink = new cc.Color(106, 78, 62);
        const green = new cc.Color(218, 235, 204);
        const panel = uimanager.createRect(this.node, 'friendPaper', 438, 460, paper, 248, 24);
        const outline = panel.getComponent(cc.Graphics);
        outline.lineWidth = 2;
        outline.strokeColor = new cc.Color(176, 148, 112, 190);
        outline.roundRect(-218, -229, 436, 458, 24); outline.stroke();
        const title = uimanager.createLabel(panel, '微信好友最高分', 0, 195, 27, ink, 394, 36);
        title.horizontalAlign = cc.Label.HorizontalAlign.CENTER;

        this.view = new cc.Node('friendSharedCanvas');
        this.view.setContentSize(398, 320);
        this.view.setPosition(0, 10);
        panel.addChild(this.view);
        this.view.active = false;
        this.placeholder = new cc.Node('friendPermissionState');
        this.placeholder.setPosition(0, 10);
        panel.addChild(this.placeholder);
        // 只转发列表内的纵向位移，好友资料和滚动边界仍由开放域管理。
        this.view.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            const point = this.view.convertToNodeSpaceAR(event.getLocation());
            if (point.y < -74 || this.scrollTouch !== null) return; // 固定自身栏不滚动。
            this.scrollTouch = event.getID();
            this.scrollY = point.y;
        });
        this.view.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (this.scrollTouch !== event.getID()) return;
            const y = this.view.convertToNodeSpaceAR(event.getLocation()).y;
            postFriendMessage('friends:scroll', { delta: y - this.scrollY });
            this.scrollY = y;
        });
        const endScroll = (event: cc.Event.EventTouch): void => {
            if (this.scrollTouch === event.getID()) this.scrollTouch = null;
        };
        this.view.on(cc.Node.EventType.TOUCH_END, endScroll);
        this.view.on(cc.Node.EventType.TOUCH_CANCEL, endScroll);
        const invite = this.flatButton(panel, '邀请好友', 0, -192, 290, 48, green, () => inviteWeChatFriends());
        invite.name = 'inviteFriends';
        invite.getChildByName('label').x = -22;
        const share = new cc.Node('friendShareLine');
        share.setPosition(72, 0);
        invite.addChild(share);
        const pen = share.addComponent(cc.Graphics);
        pen.strokeColor = ink; pen.lineWidth = 2.2;
        pen.lineJoin = cc.Graphics.LineJoin.ROUND;
        pen.moveTo(-17, 3); pen.lineTo(17, 14); pen.lineTo(7, -16);
        pen.lineTo(-1, -5); pen.close(); pen.stroke();
        pen.moveTo(-1, -5); pen.lineTo(17, 14); pen.stroke();
        this.refresh();
    }

    private flatButton(parent: cc.Node, text: string, x: number, y: number, width: number, height: number,
        color: cc.Color, onClick: () => void): cc.Node {
        const button = uimanager.createRect(parent, `button_${text}`, width, height, color, 255, 16, x, y);
        button.addComponent(cc.Button);
        const label = uimanager.createLabel(button, text, 0, 0, 20, new cc.Color(106, 78, 62), width - 14, 32);
        label.enableWrapText = false;
        button.on(cc.Node.EventType.TOUCH_END, onClick);
        return button;
    }

    private showState(message: string, action?: string, onClick?: () => void): void {
        this.scrollTouch = null;
        if (this.view.active) postFriendMessage('friends:hide');
        this.view.active = false;
        this.placeholder.active = true;
        this.placeholder.removeAllChildren();
        uimanager.createLabel(this.placeholder, message, 0, 30, 21, new cc.Color(130, 102, 80), 398, 88);
        if (action) this.flatButton(this.placeholder, action, 0, -49, 292, 54,
            new cc.Color(225, 237, 211), onClick);
    }

    public refresh(): void {
        if (!cc.isValid(this.node) || this.requesting) return;
        const wxApi = getWxApi();
        const generation = ++this.generation;
        if (!wxApi || typeof wxApi.getOpenDataContext !== 'function') {
            this.showState('在微信里看看\n谁是好友中的消除高手'); return;
        }
        this.showState('正在准备好友排名…');
        if (typeof wxApi.getSetting !== 'function') {
            this.showState('请升级微信后查看好友排名'); return;
        }
        wxApi.getSetting({
            success: (result: any) => {
                if (!cc.isValid(this.node) || generation !== this.generation) return;
                const permission = result.authSetting && result.authSetting[FRIEND_SCOPE];
                if (permission === true) this.showRanking();
                else this.showState('和微信好友比一比分数\n允许使用朋友信息后查看',
                    permission === false ? '开启朋友权限' : '查看好友排名', () => this.authorize(permission === false));
            },
            fail: () => {
                if (cc.isValid(this.node) && generation === this.generation)
                    this.showState('暂时没能读取授权状态', '点击重试', () => this.refresh());
            },
        });
    }

    private authorize(denied: boolean): void {
        const wxApi = getWxApi();
        if (!wxApi || this.requesting) return;
        this.requesting = true;
        const finish = (): void => {
            this.requesting = false;
            if (cc.isValid(this.node)) this.refresh();
        };
        const api = denied ? 'openSetting' : 'authorize';
        if (typeof wxApi[api] !== 'function') { finish(); return; }
        wxApi[api](denied ? { success: finish, fail: finish } : { scope: FRIEND_SCOPE, success: finish, fail: finish });
    }

    private showRanking(): void {
        this.placeholder.active = false;
        this.view.active = true;
        try {
            // 微信只允许主域调整共享画布尺寸；开放域拿到的画布尺寸只读。
            // 先设置尺寸再通知重绘，避免清空已绘内容和无限等待屏幕默认尺寸。
            this.sharedCanvas = getWxApi().getOpenDataContext().canvas;
            if (!this.sharedCanvas) throw new Error('shared canvas unavailable');
            if (this.sharedCanvas.width !== this.view.width) this.sharedCanvas.width = this.view.width;
            if (this.sharedCanvas.height !== this.view.height) this.sharedCanvas.height = this.view.height;
            if (!postFriendMessage('friends:show')) throw new Error('shared canvas unavailable');
            this.elapsed = 1 / 8;
        } catch (_) {
            this.showState('好友排名暂时不可用', '点击重试', () => this.refresh());
        }
    }

    public update(dt: number): void {
        if (!this.view || !this.view.active || !this.sharedCanvas) return;
        this.elapsed += dt;
        if (this.elapsed < 1 / (this.scrollTouch === null ? 8 : 30)) return;
        this.elapsed = 0;
        // 仅使用主域已经设置好的画布尺寸，避免旧尺寸裁切。
        if (this.sharedCanvas.width !== this.view.width || this.sharedCanvas.height !== this.view.height) return;
        if (!this.texture) {
            this.texture = new cc.Texture2D();
            this.texture.setPremultiplyAlpha(true);
            this.sprite = this.view.addComponent(cc.Sprite);
            this.sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            this.sprite.srcBlendFactor = cc.macro.BlendFactor.ONE;
        }
        this.texture.initWithElement(this.sharedCanvas);
        (this.texture as any)._packable = false;
        if (!this.sprite.spriteFrame) this.sprite.spriteFrame = new cc.SpriteFrame(this.texture);
        else (this.sprite as any)._activateMaterial();
    }

    public onDestroy(): void {
        this.generation++;
        if (this.sprite && this.sprite.spriteFrame) {
            const frame = this.sprite.spriteFrame;
            this.sprite.spriteFrame = null;
            frame.destroy();
        }
        if (this.texture) this.texture.destroy();
        this.sharedCanvas = null;
    }
}
