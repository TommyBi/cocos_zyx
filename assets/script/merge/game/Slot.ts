import { gameModule } from '../dataModule/GameModule';
import { SoundType, audioMgr } from '../manager/AudioMgr';
import { EventType } from '../manager/Define';
import { uimanager } from '../manager/Uimanager';
import { eventManager } from '../util/EventManager';
import Coin from './Coin';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Slot extends cc.Component {
    // 当前筹码槽位的索引
    idx: number = 0;
    // 筹码的坐标位置
    coinOriginalPos: number[][] = [
        [58, 197],
        [58, 178],
        [58, 159.3],
        [58, 140],
        [58, 121],
        [58, 102],
        [58, 83],
        [58, 64],
        [58, 45],
        [58, 26],
    ];

    @property(cc.Node)
    coin0: cc.Node = null;

    @property(cc.Node)
    coin1: cc.Node = null;

    @property(cc.Node)
    coin2: cc.Node = null;

    @property(cc.Node)
    coin3: cc.Node = null;

    @property(cc.Node)
    coin4: cc.Node = null;

    @property(cc.Node)
    coin5: cc.Node = null;

    @property(cc.Node)
    coin6: cc.Node = null;

    @property(cc.Node)
    coin7: cc.Node = null;

    @property(cc.Node)
    coin8: cc.Node = null;

    @property(cc.Node)
    coin9: cc.Node = null;

    @property(cc.Node)
    uImgSlotSelect: cc.Node = null;

    @property(cc.Node)
    uImgSlotMerge: cc.Node = null;

    onLoad() {
        // 添加点击事件
        this.node.on(cc.Node.EventType.TOUCH_END, this.selectAction, this);
        eventManager.on(EventType.MOVE_COIN, this.onMove, this);
        eventManager.on(EventType.MOVE_END, this.onMoveEnd, this);
        eventManager.on(EventType.CHECK_MERGE, this.onUpdateMergeStatus, this);
        eventManager.on(EventType.MERGE_COIN, this.onMerge, this);
        eventManager.on(EventType.MOVE_CHECK_FAIL, this.canNotMove, this);
        eventManager.on(EventType.CANCEL_SELECT, this.onDeSelect, this);
    }

    start() {
    }

    // 格式化数据
    formatData(idx: number, data: number[]): void {
        this.idx = idx;

        for (let i = 0; i < 10; i++) {
            // data
            if (data[i] !== 0) {
                this[`coin${i}`].getComponent(Coin).init(this.idx, data[i], () => {
                    this[`coin${i}`].active = true;
                });
            } else {
                this[`coin${i}`].active = false;
            }

            // pos
            this[`coin${i}`].setPosition(cc.v2(this.coinOriginalPos[i][0], this.coinOriginalPos[i][1]))
        }

        this.node.setSiblingIndex(this.idx);
    }

    // 选择行为
    selectAction() {
        if (gameModule.curSelectSlotIdx === -1) {
            // 初次选择行为
            this.onSelect();
        } else if (gameModule.curSelectSlotIdx === this.idx) {
            // 取消选择行为
            this.onDeSelect();
        } else {
            // 移动行为 当前节点为目标节点
            this.onCheckMove();
        }
    }

    // 选中当前槽位
    onSelect(): void {
        const slotData = gameModule.slotData[this.idx];

        // 选中了空的槽位
        if (slotData[0] === 0) {
            console.log('选中了空的槽位');
            return;
        }

        // 合并效果中，不可选中
        if (gameModule.mergeLock) {
            console.log('正在合并中，无法选中');
            return;
        }

        gameModule.curSelectSlotIdx = this.idx;
        this.uImgSlotSelect.active = true;
        this.node.setSiblingIndex(8);

        // 挑选待操作筹码的索引
        gameModule.curSelectCoinIdxs = [];
        for (let i = 9; i >= 0; i--) {
            if (slotData[i] === 0) continue;

            if (gameModule.curSelectCoinIdxs.length === 0) {
                gameModule.curSelectCoinIdxs.push(i);
            } else if (slotData[i] === slotData[gameModule.curSelectCoinIdxs[gameModule.curSelectCoinIdxs.length - 1]]) {
                gameModule.curSelectCoinIdxs.push(i);
            } else {
                break;
            }
        }

        console.log(`选中了第${this.idx}个槽的`, gameModule.curSelectCoinIdxs);

        // 对待操作筹码的显示效果进行展示
        for (let i = 0; i < gameModule.curSelectCoinIdxs.length; i++) {
            const tarPosY = this.coinOriginalPos[gameModule.curSelectCoinIdxs[i]][1] + 25;
            cc.tween(this[`coin${gameModule.curSelectCoinIdxs[i]}`])
                .to(0.5, { y: tarPosY }, { easing: 'backOut' })
                .start()
        }
    }

    // 取消选中
    onDeSelect(): void {
        console.log('取消选择');
        for (let i = 0; i < 10; i++) {
            // data
            const tarPosY = this.coinOriginalPos[i][1];
            cc.tween(this[`coin${i}`])
                .to(0.5, { y: tarPosY }, { easing: 'backOut' })
                .start()
        }

        this.uImgSlotSelect.active = false;

        // 重置选中状态
        gameModule.curSelectSlotIdx = -1;
    }

    // 移动
    onCheckMove(): void {
        // 如果当前槽位已满则不允许移动
        if (gameModule.slotData[this.idx].indexOf(0) === -1) {
            console.log('筹码数量已满，不可移动');
            eventManager.dispatch(EventType.MOVE_CHECK_FAIL);
            return;
        }

        // 如果当前槽位最近的筹码与当前选中的待移动筹码类型不一致 不允许移动
        const curSlotInfo = gameModule.getFirstVaildNumBySlotIdx(this.idx);
        const curSelectCoinInfo = gameModule.getCurSelectSlotInfo();
        if (curSlotInfo.vaildNum !== -1 && curSlotInfo.vaildNum !== curSelectCoinInfo.num) {
            console.log('筹码类型不一致, 不可移动');
            eventManager.dispatch(EventType.MOVE_CHECK_FAIL);
            return;
        }

        if (gameModule.moveLock) {
            console.log('正在移动中，无法产生更多移动');
            return;
        }

        // 确定可以移动的筹码数量
        const moveCnt = Math.min(curSlotInfo.vaildSpace, curSelectCoinInfo.cnt);

        // 确定移动到的目标位置
        const tarPos: cc.Vec2[] = [];

        // 目标槽位发生数据变动的位置索引集
        const tarIdxArr: number[] = [];
        // 原槽位发生数据变动的槽位索引集
        const srcIdxArr: number[] = [];

        let startPosIdx: number = curSlotInfo.vaildIdx + 1;
        for (let i = 0; i < moveCnt; i++) {
            const oriPosX = this.coinOriginalPos[startPosIdx][0];
            const oriPosY = this.coinOriginalPos[startPosIdx][1];
            const globalPos = this.node.convertToWorldSpaceAR(cc.v2(oriPosX, oriPosY));
            tarPos.push(globalPos);
            tarIdxArr.push(startPosIdx);
            srcIdxArr.push(gameModule.curSelectCoinIdxs[i]);
            startPosIdx++;
        }

        // 通知待移动的槽位进行筹码移动
        const eventData = {
            // 实际移动数量
            moveCnt,
            // 目标移动的节点对应位置(低->高)
            tarPos,
            // 目标槽位实际发生数据变动的筹码索引集(低->低)
            tarIdxArr,
            // 原槽位实际发生移动的筹码索引集(高->低)
            srcIdxArr,
            // 实际发生的筹码类型
            numType: curSelectCoinInfo.num,
            // 目标槽位索引
            tarSlotIdx: this.idx,
        }
        eventManager.dispatch(EventType.MOVE_COIN, eventData);
    }

    // 移动检测失败，提示不可移动
    canNotMove(): void {
        if (gameModule.curSelectSlotIdx !== this.idx) return;
        if (gameModule.curSelectSlotIdx === -1) return;
        audioMgr.playSound(SoundType.ERROR);

        for (let i = 0; i < gameModule.curSelectCoinIdxs.length; i++) {
            const coinNode = this[`coin${gameModule.curSelectCoinIdxs[i]}`];
            const oriPosX = coinNode.x;
            cc.tween(coinNode)
                .to(0.05, { x: oriPosX - 10 })
                .to(0.1, { x: oriPosX + 10 })
                .to(0.1, { x: oriPosX - 10 })
                .to(0.05, { x: oriPosX })
                .call(() => {
                    if (i === gameModule.curSelectCoinIdxs.length - 1) {
                        this.onDeSelect();
                    }
                })
                .start();
        }
    }

    // 开始进行移动
    onMove(e) {
        const eventData = e.data;
        if (this.idx !== gameModule.curSelectSlotIdx) return;
        console.log(`onMove: ${gameModule.curSelectSlotIdx} -> ${eventData.tarSlotIdx}`);

        audioMgr.playSound(SoundType.MOVE_COIN);

        gameModule.moveLock = true;

        const moveCnt = eventData.moveCnt;
        const tarWorldPos: cc.Vec2[] = eventData.tarPos;
        const tarLocalPos: cc.Vec2[] = [];
        for (let i = tarWorldPos.length - 1; i >= 0; i--) {
            tarLocalPos.push(this.node.convertToNodeSpaceAR(tarWorldPos[i]));
        }

        // 由高到低的进行移动
        let startIdx = gameModule.curSelectCoinIdxs[0];
        for (let i = 0; i < moveCnt; i++) {
            cc.tween(this[`coin${startIdx}`])
                .delay(0.03 * i)
                .to(0.1, { position: tarLocalPos[i] })
                .call(() => {
                    if (i === moveCnt - 1) {
                        gameModule.tidySlotData({
                            tarSlotIdx: eventData.tarSlotIdx,
                            numType: eventData.numType,
                            srcIdxArr: eventData.srcIdxArr,
                            tarIdxArr: eventData.tarIdxArr,
                        });
                        this.onDeSelect();
                        gameModule.moveLock = false;
                    }
                })
                .start()

            startIdx--;
        }
    }

    onMoveEnd() {
        console.log('onMoveEnd');
        this.formatData(this.idx, gameModule.slotData[this.idx]);
    }

    // 刷新合成状态
    onUpdateMergeStatus(): void {
        const canMerge = gameModule.checkCanMergeBySlot(this.idx);
        this.uImgSlotMerge.active = canMerge;
        this.showMergeHintAction(canMerge);
    }

    // 提示合成
    showMergeHintAction(canMerge: boolean): void {
        if (canMerge) {
            this.uImgSlotMerge.opacity = 0;
            cc.tween(this.uImgSlotMerge)
                .to(1, { opacity: 255 })
                .to(1, { opacity: 0 })
                .call(() => { this.showMergeHintAction(canMerge) })
                .start();
        } else {
            cc.tween(this.uImgSlotMerge).stop();
            this.uImgSlotMerge.active = canMerge;
        }
    }

    // 合成
    onMerge(): void {
        const canMerge = gameModule.checkCanMergeBySlot(this.idx);
        if (!canMerge) return;

        audioMgr.playSound(SoundType.MERGE_COIN);

        gameModule.mergeLock += 1;

        // 合成效果
        for (let i = 9; i >= 0; i--) {
            cc.tween(this[`coin${i}`])
                .delay(0.05 * (9 - i))
                .to(0.1, { scale: 0 })
                .call(() => {
                    this[`coin${i}`].active = false;
                    this[`coin${i}`].scale = 1;
                    if (i === 0) {
                        this.onMergeFinish();
                    }
                })
                .start();
        }
    }

    // 合成结束
    onMergeFinish(): void {
        // 合成目标值
        const mergeTargetValue = gameModule.slotData[this.idx][0] + 1;

        // 合成后的数据
        gameModule.slotData[this.idx] = [mergeTargetValue, mergeTargetValue, 0, 0, 0, 0, 0, 0, 0, 0];

        console.log(`槽${this.idx} 合成${mergeTargetValue}`);

        this.coin0.scale = 0;
        this.coin1.scale = 0;
        this.coin0.getComponent(Coin).init(this.idx, mergeTargetValue, () => {
            this.coin0.active = true;
        });
        this.coin1.getComponent(Coin).init(this.idx, mergeTargetValue, () => {
            this.coin1.active = true;
        });

        cc.tween(this.coin0)
            .to(0.5, { scale: 1 }, { easing: 'backOut' })
            .start();
        cc.tween(this.coin1)
            .to(0.5, { scale: 1 }, { easing: 'backOut' })
            .call(() => {
                gameModule.mergeLock -= 1;
                if (gameModule.mergeLock < 0) gameModule.mergeLock = 0;
                if (gameModule.mergeLock === 0) {
                    eventManager.dispatch(EventType.MERGE_END);
                }
            })
            .start();

        this.uImgSlotMerge.active = false;

        eventManager.dispatch(EventType.CHECK_MERGE);
    }

    // 生成筹码
    async produce(newCoin: number[], startGlobalPos: cc.Vec2, startPosIdx: number) {
        console.log(this.idx, newCoin);
        // 不需要生成就不操作了
        if (newCoin.length === 0) {
            console.log(`${this.idx}槽无新筹码`);
            audioMgr.playSound(SoundType.ERROR);
            return;
        }

        console.log(`${this.idx} 生成了`, newCoin);

        // 派发筹码效果的起始位置
        const localPosSrc = this.node.convertToNodeSpaceAR(startGlobalPos);
        // 已经处理的筹码
        let dealCnt = 0;
        for (let i = 0; i < newCoin.length; i++) {
            // 生成一个表现用的新筹码
            const newCoinNode = await this.produceCoin();
            const coin = newCoinNode.getComponent(Coin);
            this.node.addChild(newCoinNode);
            coin.node.setPosition(localPosSrc);
            coin.node.active = false;
            coin.init(this.idx, newCoin[i], () => { coin.node.active = true; });

            // 确定要飞的目的地坐标
            const tarPosIdx = startPosIdx + dealCnt;
            const posTar = this.coinOriginalPos[startPosIdx + dealCnt];
            const tarPos = cc.v2(posTar[0], posTar[1]);
            gameModule.produceLock += 1;
            cc.tween(coin.node)
                .delay(0.1 * dealCnt)
                .to(0.5, { position: tarPos }, { easing: 'cubicInOut' })
                .call(() => {
                    this[`coin${tarPosIdx}`].getComponent(Coin).init(this.idx, newCoin[i], () => {
                        this[`coin${tarPosIdx}`].active = true;
                        coin.node.active = false;
                        coin.node.destroy();
                    });
                    gameModule.produceLock -= 1;
                    if (gameModule.produceLock < 0) gameModule.produceLock = 0;
                })
                .start();

            dealCnt++;
        }
    }

    async produceCoin(): Promise<cc.Node> {
        const coinPrefab = await uimanager.loadPrefab('prefab/merge/coin');
        const coin = cc.instantiate(coinPrefab);
        return coin;
    }

    // update (dt) {}
}
