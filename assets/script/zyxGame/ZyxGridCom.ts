import { zyxGameModule } from "../dataModule/ZyxGameModule";
import { gridContentType, gridSize } from "../define/TypeDefine";
import { audioMgr, SHAKE_TYPE } from "../manager/AudioMgr";
import { EventType } from "../manager/Define";
import { uimanager } from "../manager/Uimanager";
import { eventManager } from "../util/EventManager";
import NewUtils from "../util/NewUtils";

const { ccclass, property } = cc._decorator;

// 格子组件
@ccclass
export default class ZyxGridCom extends cc.Component {

    @property(cc.Node)
    uImgGoods: cc.Node = null;

    @property(cc.Node)
    uImgBg: cc.Node = null;

    @property(cc.Node)
    uImgBgLine: cc.Node = null;

    @property(cc.Label)
    ulblUniqueId: cc.Label = null;

    private size: gridSize = gridSize.ONE;
    public contentType: gridContentType = gridContentType.EMPTY;
    public uniqueId: number = 0;

    private row: number = -1;
    private col: number = -1;

    // 便宜量
    private offsetCnt: number = 0;

    // 初始点击位置
    private originX: number = 0;

    // 格子原始位置
    private originGridX: number = 0;

    // 格子删除的时间
    private timeDelGrid: number = 0.18;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    start() { }

    init(info: [gridSize, gridContentType, number]) {
        // 格子类型基础属性
        this.size = info[0];
        this.contentType = info[1];
        this.uniqueId = info[2];

        if (this.contentType === gridContentType.EMPTY) {
            this.node.active = false;
            return;
        }

        // 格子外观尺寸
        const nodeWidth = 84 * info[0];
        this.node.width = nodeWidth;
        this.uImgBg.width = this.node.width;
        this.uImgBg.x = nodeWidth / 2;
        this.uImgBgLine.width = this.node.width - 8;
        this.uImgBgLine.x = nodeWidth / 2;
        this.ulblUniqueId.node.x = this.node.width / 2;

        this.ulblUniqueId.string = this.uniqueId.toString();
        this.ulblUniqueId.node.active = false;

        if (this.contentType !== gridContentType.NORMAL) {
            this.uImgGoods.active = true;
            const contentUrl = `images/item/img_item_${this.contentType}`;
            NewUtils.setSpriteFrameByUrl(this.uImgGoods.getComponent(cc.Sprite), contentUrl);
        } else {
            this.uImgGoods.active = false;
        }

        const skinUrl = `images/grid/color_${NewUtils.randomIntInclusive(1, 13)}`;
        NewUtils.setSpriteFrameByUrl(this.uImgBg.getComponent(cc.Sprite), skinUrl);
    }

    setRowCel(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    moveUp() {
        this.row -= 1;
    }

    moveDown() {
        this.row += 1;
    }

    // 删除
    eliminate(): void {
        this.size = gridSize.ZERO;
        this.contentType = gridContentType.EMPTY;
        this.uniqueId = -1;
        cc.tween(this.node)
            .to(this.timeDelGrid, { opacity: 0 })
            .call(() => {
                this.node.removeFromParent();
            })
            .start();
    }

    onTouchStart(e) {
        if (zyxGameModule.selectGirdUniqueId !== -1) return;
        zyxGameModule.selectGirdUniqueId = this.uniqueId;
        console.log("onTouchStart", this.uniqueId, e.touch.getLocation().x);
        this.originX = e.touch.getLocation().x;
        this.originGridX = this.node.x;
        this.offsetCnt = 0;

        audioMgr.shake(SHAKE_TYPE.LIGHT);
    }

    onTouchMove(e): void {
        if (zyxGameModule.selectGirdUniqueId !== this.uniqueId) return;
        const dx = e.touch.getLocation().x - this.originX;

        const canMove = this.checkMove(dx);
        if (canMove) {
            this.node.opacity = 255;
            this.node.x = this.originGridX + zyxGameModule.gridsWidth * this.offsetCnt;
        } else {
            // this.node.opacity = 100;
        }

        let moveAction = {
            action: 'move',
            node: this.node,
        }
        eventManager.dispatch(EventType.ZYX_MOVE_GRID, moveAction);
    }

    onTouchEnd(e) {
        if (zyxGameModule.selectGirdUniqueId !== this.uniqueId) return;
        console.log("onTouchEnd", this.uniqueId);
        // const dx = e.touch.getLocation().x - this.originX;
        // let canMove = this.checkMove(dx);

        // this.node.opacity = 255;

        // if (canMove) {
        //     this.moveCrossWise();
        // } else {
        //     this.node.x = this.originGridX;
        //     console.log('无法移动');
        // }


        let moveAction = {
            action: 'done',
            node: this.node,
        }
        eventManager.dispatch(EventType.ZYX_MOVE_GRID, moveAction);

        this.moveCrossWise();
    }

    // 检测是否可以移动, 标记状态
    checkMove(dx: number): boolean {
        // 实际上操作的位移格子空间
        const offsetCnt = Math.floor(Math.abs(dx) / zyxGameModule.gridsWidth);

        // 理论上最大允许发生的最大位移空间
        const rowData = zyxGameModule.gridInfo[this.row];
        let maxOffsetCnt = 0;
        if (dx > 0) {
            // 向右移动
            for (let i = this.col + this.size; i < 8; i++) {
                if (rowData[i][1] !== gridContentType.EMPTY) {
                    break;
                }
                maxOffsetCnt++;
            }
        } else {
            // 向左移动
            for (let i = this.col - 1; i >= 0; i--) {
                if (rowData[i][1] !== gridContentType.EMPTY) {
                    break;
                }
                maxOffsetCnt++;
            }
        }

        console.log(`方向:${dx / Math.abs(dx) > 0 ? '右' : '左'} 拖动: ${offsetCnt}, 最大: ${maxOffsetCnt}`);
        if (Math.abs(offsetCnt) <= maxOffsetCnt) {
            this.offsetCnt = dx / Math.abs(dx) * offsetCnt;
            return true;
        } else {
            this.offsetCnt = dx / Math.abs(dx) * maxOffsetCnt;
            return false;
        }
    }

    // 实际发生横向移动
    moveCrossWise(): void {
        if (this.offsetCnt === 0 || !this.offsetCnt) {
            // 没有发生实际的位移
            console.log('没有发生实际位移, 格子选中状态取消');
            zyxGameModule.selectGirdUniqueId = -1;
            this.node.x = this.originGridX;
            return;
        }
        if (this.offsetCnt > 0) {
            uimanager.showTips(`右 -> ${this.offsetCnt}`);
        } else {
            uimanager.showTips(`左移 <- ${-this.offsetCnt}`);
        }

        // 挪走的位置置为空
        for (let col = this.col; col < this.col + this.size; col++) {
            zyxGameModule.gridInfo[this.row][col] = [0, 0, 0];
        }

        // 新的位置 置为当前格子
        const newStartCol = this.col + this.offsetCnt;
        const newEnd = newStartCol + this.size;
        for (let col = newStartCol; col < newEnd; col++) {
            zyxGameModule.gridInfo[this.row][col][0] = this.size;
            zyxGameModule.gridInfo[this.row][col][1] = this.contentType;
            zyxGameModule.gridInfo[this.row][col][2] = this.uniqueId;
        }

        // update col
        this.setRowCel(this.row, this.col + this.offsetCnt);
        this.originGridX = this.node.x;

        eventManager.dispatch(EventType.ZYX_CHECK_MERGE);
        console.log(`第${this.row}行发生移动：`, zyxGameModule.gridInfo);
    }
}
