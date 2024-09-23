import { playerModule } from '../dataModule/PlayerModule';
import { LAYER } from '../define/TypeDefine';
import { audioMgr, SoundType } from '../manager/AudioMgr';
import { uimanager } from '../manager/Uimanager';
import { wxApiManager } from '../util/WxApiManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MergeScene extends cc.Component {

    @property(cc.Node)
    uBtnStart: cc.Node = null;

    onLoad() {
        console.log('load mergeScene');
        this.uBtnStart.on(cc.Node.EventType.TOUCH_END, this.onStart, this);
        this.uBtnStart.active = false;
    }

    start() {
        // 初始化界面层级
        uimanager.init(this.node);

        // login
        playerModule.login(() => {
            // 初始化音频
            audioMgr.init();

            // 初始化界面UI
            this.initUI();
        })

        wxApiManager.onShow();
        wxApiManager.onHide();
    }

    update() {
        uimanager.udpateLayerShow();
    }

    onStart(): void {
        this.initGamePanel();
    }


    // 初始化游戏主场景信息
    initUI(): void {
        this.uBtnStart.active = true;
        this.initTopCom();
    }

    async initTopCom() {
        const topPre = await uimanager.loadPrefab('prefab/zyx/uComTop');
        const topNode = cc.instantiate(topPre);
        uimanager.add(topNode, LAYER.UI);
        topNode.setPosition(new cc.Vec2(0, 0));
    }

    // 初始化游戏界面
    async initGamePanel() {
        audioMgr.playSound(SoundType.ZYX_DROP);
        const prefab = await uimanager.loadPrefab('prefab/merge/game');
        const gameNode: cc.Node = cc.instantiate(prefab);
        uimanager.add(gameNode, LAYER.UI);
        gameNode.setPosition(new cc.Vec2(0, 0));
    }


}

/**
 *      1、合成数字15获得1个星星，顶部显示当前星星持有总数；
 *          当合成8之前，每次发放5个，类型为2个，数字区间固定在1~7之间；
 *          当合成8之后，每次发放6个，类型为3个，数字区间固定在min~7之间；
 *          当合成10之后，每次发放7个，类型为4个，数字区间固定在min~8之间；
 *          当合成12之后，每次发放10个，类型为5个，数字区间固定在min~10之间；
 *
 *          防作弊：
 *          当今日全服合成星星总数量 > 100 || 当人单日合成总星星 > 5， 合成12后，每次发放15个，类型为7个，数字区间min~10;(趋近于无法继续达成，控制放出总量);
 *
 *
 *      2、清理规则
 *          每局可以免费整理一次；
 *          每局可以通过分享功能一次整理；
 *          每局可以通过看视频完成一次整理；
 *          以上所有方式用过后，还可以通过刷新道具整理；
 *          刷新道具可以通过邀请获得，每邀请1个人，赠送一个刷新道具，刷新道具也可以通过星星兑换获得；
 *      7、商品清单滚动播放：4个刷新道具需要1个星星、1箱金典牛奶29个星星，1包心相印湿巾需要5个星星，1本DK百科全书30个星星...商品横向滚动展示清单最右侧保留“更多奖励”按钮；
 *      8、选择实物兑换后，兑换页面填写“收件人、收件地址、联系方式”，并在确认兑换前，弹出确认收货信息的确认单以及不退不换的声明；
 *      9、添加规则页面，规则页面添加免责声明，以及不退换声明；
 *      10、添加历史星星总获得数排行榜；
 */
