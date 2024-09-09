import { LAYER } from '../define/TypeDefine';
import Tips from '../pulicCom/Tips';

export default class Uimanager {
    private static _ins: Uimanager;
    public static get instance() {
        if (!this._ins) {
            this._ins = new Uimanager();
        }

        return this._ins;
    }

    // 层级依托的场景
    scene: cc.Node = null;

    // 层级
    layerArr: cc.Node[] = [];

    constructor() { }

    init(node: cc.Node) {
        this.scene = node;
        this.initLayer();
    }

    initLayer(): void {
        this.layerArr = [];

        // UI层
        const node_ui = new cc.Node(LAYER.UI);
        node_ui.width = this.scene.width;
        node_ui.height = this.scene.height;
        this.scene.addChild(node_ui);
        this.layerArr.push(node_ui);

        // 弹窗层
        const node_dialog = new cc.Node(LAYER.DIALOG);
        node_dialog.width = this.scene.width;
        node_dialog.height = this.scene.height;
        this.scene.addChild(node_dialog);
        this.layerArr.push(node_dialog);

        // 提示层
        const node_tip = new cc.Node(LAYER.TIP);
        node_tip.width = this.scene.width;
        node_tip.height = this.scene.height;
        this.scene.addChild(node_tip);
        this.layerArr.push(node_tip);

        // 引导层
        const node_guide = new cc.Node(LAYER.GUIDE);
        node_guide.width = this.scene.width;
        node_guide.height = this.scene.height;
        this.scene.addChild(node_guide);
        this.layerArr.push(node_guide);
    }

    getLayer(name: LAYER): cc.Node {
        const node = this.scene.getChildByName(name);
        return node;
    }

    add(node: cc.Node, layerType: LAYER) {
        const layerNode = this.getLayer(layerType);

        if (!layerNode) {
            console.warn('UIManager: 没有这个层级', layerType);
            return;
        }

        layerNode.addChild(node);
    }

    // 动态显示需要的层级
    udpateLayerShow(): void {
        for (let i = 0; i < this.layerArr.length; i++) {
            this.layerArr[i].active = this.layerArr[i].childrenCount > 0;
        }
    }

    /**
     * 预制件加载
     * @param path
     */
    async loadPrefab(path: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const load = async () => new Promise((rsv, rjt) => {
                const tot = setTimeout(() => {
                    console.debug(`[loadPefab timeout] ${path}加载超时`)
                    rjt(`loadPefab 连接超时${path}`);
                }, 10000);
                cc.resources.load(path, (err, res) => {
                    clearTimeout(tot);

                    if (err) {
                        rjt(err);
                    } else {
                        rsv(res);
                    }
                });
            })

            await load().then((res) => {
                resolve(res);
            })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * 显示提示
     * @param msg
     */
    async showTips(msg: string) {
        const tipsPrefab = await this.loadPrefab('prefab/com/tips');
        const tipsNode = cc.instantiate(tipsPrefab);
        this.add(tipsNode, LAYER.TIP);
        tipsNode.getComponent(Tips).showTips(msg);
        tipsNode.setPosition(0, 0);
    }

    /** 结算 */
    async showGameOver() {
        uimanager.showTips('游戏结束');
        const prefab = await this.loadPrefab('prefab/zyx/accountDialog');
        const accountNode = cc.instantiate(prefab);
        this.add(accountNode, LAYER.UI);
        accountNode.setPosition(0, 0);
    }
}
export const uimanager = Uimanager.instance;
