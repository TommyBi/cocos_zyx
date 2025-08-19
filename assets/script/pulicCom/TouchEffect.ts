const { ccclass, property } = cc._decorator;

@ccclass
export default class TouchEffect extends cc.Component {
    @property()
    private scaleTime: number = 0.07;

    private initScaleX = 1;
    private initScaleY = 1;

    private dS = 0.9;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    start() {
        this.initScaleX = this.node.scaleX;
        this.initScaleY = this.node.scaleY;
        cc.tween(this.node).stop();
    }

    onTouchStart() {
        const tarScaleX = this.node.scaleX * 0.9;
        const tarScaleY = this.node.scaleY * 0.9;
        cc.tween(this.node)
            .to(this.scaleTime, { scaleX: tarScaleX, scaleY: tarScaleY })
            .to(this.scaleTime, { scaleX: this.initScaleX, scaleY: this.initScaleY })
            .start();
    }

    onTouchEnd() {
        cc.tween(this.node)
            .to(this.scaleTime, { scaleX: this.initScaleX, scaleY: this.initScaleY })
            .start();
    }

    // update (dt) {}
}
