import { MoveRange } from '../dataModule/ZyxGameModule';

const { ccclass } = cc._decorator;

export type GridCallbacks = {
    canInteract: () => boolean;
    onInteract: () => void;
    getMoveRange: (id: number) => MoveRange;
    onMove: (id: number, offset: number) => void;
    onTap: (id: number) => void;
};

/** 单个横向色块的手势组件。 */
@ccclass
export default class ZyxGridCom extends cc.Component {
    private pieceId: number = 0;
    private cellSize: number = 0;
    private callbacks: GridCallbacks = null;
    private touching: boolean = false;
    private originTouchX: number = 0;
    private originNodeX: number = 0;
    private offset: number = 0;
    private range: MoveRange = { min: 0, max: 0 };

    public onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    public onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    public initialize(pieceId: number, cellSize: number, callbacks: GridCallbacks): void {
        this.pieceId = pieceId;
        this.cellSize = cellSize;
        this.callbacks = callbacks;
    }

    private onTouchStart(event: cc.Event.EventTouch): void {
        if (!this.callbacks || !this.callbacks.canInteract()) return;
        this.callbacks.onInteract();
        this.touching = true;
        this.offset = 0;
        this.originTouchX = event.touch.getLocation().x;
        this.originNodeX = this.node.x;
        this.range = this.callbacks.getMoveRange(this.pieceId);
        this.node.zIndex = 100;
        const stamp = this.node.getChildByName('moodStamp');
        if (stamp) cc.tween(stamp).to(0.08, { opacity: 222, scale: 1.12 }).start();
        cc.tween(this.node).to(0.06, { scale: 1.04 }).start();
    }

    private onTouchMove(event: cc.Event.EventTouch): void {
        if (!this.touching) return;
        const dx = event.touch.getLocation().x - this.originTouchX;
        const requested = Math.round(dx / this.cellSize);
        this.offset = Math.max(this.range.min, Math.min(this.range.max, requested));
        this.node.x = this.originNodeX + this.offset * this.cellSize;
    }

    private onTouchEnd(): void {
        if (!this.touching) return;
        this.touching = false;
        this.node.zIndex = 10;
        const stamp = this.node.getChildByName('moodStamp');
        if (stamp) cc.tween(stamp).to(0.08, { opacity: 172, scale: 1 }).start();
        cc.tween(this.node).to(0.08, { scale: 1 }).start();

        if (this.offset !== 0) this.callbacks.onMove(this.pieceId, this.offset);
        else this.callbacks.onTap(this.pieceId);
    }
}
