import { MoveRange } from '../dataModule/ZyxGameModule';

const { ccclass } = cc._decorator;
const DRAG_SNAP_THRESHOLD = 0.4;

export type GridCallbacks = {
    canInteract: () => boolean;
    onInteract: () => void;
    getMoveRange: (id: number) => MoveRange;
    onMove: (id: number, offset: number) => void;
    onTap: (id: number) => void;
    onDragColumns?: (id: number, offset: number | null) => void;
};

/** 单个横向色块的手势组件。 */
@ccclass
export default class ZyxGridCom extends cc.Component {
    private pieceId: number = 0;
    private cellSize: number = 0;
    private callbacks: GridCallbacks = null;
    private touching: boolean = false;
    private touchId: number = null;
    private originTouchX: number = 0;
    private originNodeX: number = 0;
    private offset: number = 0;
    private range: MoveRange = { min: 0, max: 0 };

    public onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    public onDestroy(): void {
        this.cancelTouch();
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    public initialize(pieceId: number, cellSize: number, callbacks: GridCallbacks): void {
        this.pieceId = pieceId;
        this.cellSize = cellSize;
        this.callbacks = callbacks;
    }

    public onDisable(): void { this.cancelTouch(); }

    /** 在锁输入时立即撤销已按住的手势，不能等到松手才检查当前锁。 */
    public cancelTouch(): boolean {
        if (!this.touching) return false;
        this.touching = false; this.touchId = null; this.offset = 0;
        if (this.callbacks && this.callbacks.onDragColumns) this.callbacks.onDragColumns(this.pieceId, null);
        cc.Tween.stopAllByTarget(this.node);
        this.node.x = this.originNodeX; this.node.scale = 1; this.node.zIndex = 10;
        const stamp = this.node.getChildByName('moodStamp');
        if (stamp) { cc.Tween.stopAllByTarget(stamp); stamp.opacity = 172; stamp.scale = 1; }
        return true;
    }

    private onTouchStart(event: cc.Event.EventTouch): void {
        if (this.touching || !this.node.parent || !this.callbacks || !this.callbacks.canInteract()) return;
        this.callbacks.onInteract();
        this.touching = true;
        this.touchId = event.touch.getID ? event.touch.getID() : 0;
        this.offset = 0;
        this.originTouchX = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation()).x;
        this.originNodeX = this.node.x;
        this.range = this.callbacks.getMoveRange(this.pieceId);
        if (this.callbacks.onDragColumns) this.callbacks.onDragColumns(this.pieceId, 0);
        this.node.zIndex = 100;
        const stamp = this.node.getChildByName('moodStamp');
        if (stamp) cc.tween(stamp).to(0.08, { opacity: 222, scale: 1.12 }).start();
        cc.tween(this.node).to(0.06, { scale: 1.04 }).start();
    }

    private onTouchMove(event: cc.Event.EventTouch): void {
        if (!this.canContinueTouch(event)) return;
        this.updateDragPosition(event);
    }

    /** 多指操作中另一根手指引爆时，已开始的拖动也立即失效；不覆盖正在播放的节点位置。 */
    private canContinueTouch(event: cc.Event.EventTouch): boolean {
        if (!this.touching || this.touchId !== (event.touch.getID ? event.touch.getID() : 0)) return false;
        if (this.node.parent && this.callbacks && this.callbacks.canInteract()) return true;
        this.touching = false;
        this.touchId = null;
        if (this.callbacks && this.callbacks.onDragColumns) this.callbacks.onDragColumns(this.pieceId, null);
        this.node.zIndex = 10;
        return false;
    }

    /** 连续跟随手指，同时缓存松手时要吸附到的最近合法格。 */
    private updateDragPosition(event: cc.Event.EventTouch): void {
        const dx = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation()).x - this.originTouchX;
        const cellOffset = dx / this.cellSize;
        const direction = cellOffset < 0 ? -1 : 1;
        const requested = Math.abs(cellOffset) < DRAG_SNAP_THRESHOLD
            ? 0
            : direction * Math.floor(Math.abs(cellOffset) + 1 - DRAG_SNAP_THRESHOLD);
        this.offset = Math.max(this.range.min, Math.min(this.range.max, requested));
        if (this.callbacks.onDragColumns) this.callbacks.onDragColumns(this.pieceId, this.offset);
        const visualOffset = Math.max(this.range.min, Math.min(this.range.max, cellOffset));
        this.node.x = this.originNodeX + visualOffset * this.cellSize;
    }

    private onTouchEnd(event: cc.Event.EventTouch): void {
        if (!this.canContinueTouch(event)) return;
        this.updateDragPosition(event);
        this.finishTouch(this.offset !== 0, this.offset === 0);
    }

    private finishTouch(commitMove: boolean, triggerTap: boolean): void {
        this.touching = false;
        this.touchId = null;
        if (this.callbacks.onDragColumns) this.callbacks.onDragColumns(this.pieceId, null);
        this.node.zIndex = 10;
        this.node.x = this.originNodeX + (commitMove ? this.offset * this.cellSize : 0);
        const stamp = this.node.getChildByName('moodStamp');
        if (stamp) cc.tween(stamp).to(0.08, { opacity: 172, scale: 1 }).start();
        cc.tween(this.node).to(0.08, { scale: 1 }).start();

        if (commitMove) this.callbacks.onMove(this.pieceId, this.offset);
        else if (triggerTap) this.callbacks.onTap(this.pieceId);
    }

    /** Cocos 在节点外松手也会派发 CANCEL；已有合法横移时仍应完成吸附。 */
    private onTouchCancel(event: cc.Event.EventTouch): void {
        if (!this.canContinueTouch(event)) return;
        this.updateDragPosition(event);
        this.finishTouch(this.offset !== 0, false);
    }
}
