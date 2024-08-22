const { ccclass, property } = cc._decorator;

@ccclass
export default class Coin extends cc.Component {
    @property(cc.Label)
        ulblNum: cc.Label = null;

    @property(cc.Sprite)
        uImgBg: cc.Sprite = null;

    onLoad() {
        this.ulblNum.string = '-';
    }

    init(slotIdx: number, cnt: number, cb:Function): void {
        const url: string = `images/coin/${cnt}`;
        cc.resources.load(url, cc.SpriteFrame, ((err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                console.error('url:', url, '/err:');
                return;
            }

            this.uImgBg.spriteFrame = spriteFrame;
            cb && cb()
        }));

        // this.ulblNum.string = `${slotIdx}-${cnt}`;
        this.ulblNum.string = `${cnt}`;
    }

    start() {

    }

    // update (dt) {}
}
