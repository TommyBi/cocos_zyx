import { uimanager } from '../manager/UIManager';
import { MOOD_COLORS } from './MoodArt';

export type BookTransitionOptions = {
    host: cc.Node;
    onCovered: () => void;
    onComplete: () => void;
};

const CLOSE_DURATION = 0.36;
const OPEN_DURATION = 0.44;

/**
 * 独立于业务 screen 的书页转场层。
 * 书页合拢后切换底层内容，再向两侧展开；整个过程拦截输入。
 */
export function playBookPageTransition(options: BookTransitionOptions): cc.Node {
    const { host, onCovered, onComplete } = options;
    const width = host.width || cc.winSize.width;
    const height = host.height || cc.winSize.height;
    const pageWidth = width / 2 + 48;
    const openLeftX = -width / 2 - pageWidth / 2 - 12;
    const openRightX = -openLeftX;
    const closedLeftX = -width / 4;
    const closedRightX = width / 4;

    const layer = new cc.Node('bookPageTransitionLayer');
    layer.width = width;
    layer.height = height;
    layer.setAnchorPoint(0.5, 0.5);
    layer.zIndex = 5000;
    layer.addComponent(cc.BlockInputEvents);
    host.addChild(layer);

    const dim = uimanager.createRect(layer, 'bookTransitionDim', width, height, MOOD_COLORS.cocoa, 0);
    dim.zIndex = 1;
    const leftPage = createPage(layer, 'bookPageLeft', pageWidth, height + 88, true, openLeftX);
    const rightPage = createPage(layer, 'bookPageRight', pageWidth, height + 88, false, openRightX);
    const seamShadow = uimanager.createRect(layer, 'bookSeamShadow', 30, height + 20, MOOD_COLORS.cocoa, 0);
    seamShadow.zIndex = 4;
    const seam = uimanager.createRect(layer, 'bookGoldenSeam', 4, height + 20, new cc.Color(215, 168, 75), 0);
    seam.zIndex = 5;

    const finish = (): void => {
        if (cc.isValid(layer)) layer.destroy();
        onComplete();
    };
    const openPages = (): void => {
        if (!cc.isValid(layer)) return;
        cc.tween(dim).to(OPEN_DURATION, { opacity: 0 }, { easing: 'sineInOut' }).start();
        cc.tween(seamShadow).to(0.2, { opacity: 0 }, { easing: 'sineOut' }).start();
        cc.tween(seam).to(0.2, { opacity: 0 }, { easing: 'sineOut' }).start();
        cc.tween(leftPage)
            .to(OPEN_DURATION, { x: openLeftX }, { easing: 'sineInOut' })
            .start();
        cc.tween(rightPage)
            .to(OPEN_DURATION, { x: openRightX }, { easing: 'sineInOut' })
            .call(finish)
            .start();
    };

    cc.tween(dim).to(0.16, { opacity: 112 }, { easing: 'sineOut' }).start();
    cc.tween(seamShadow).delay(0.18).to(0.16, { opacity: 84 }).start();
    cc.tween(seam).delay(0.2).to(0.14, { opacity: 225 }).start();
    cc.tween(leftPage)
        .to(CLOSE_DURATION, { x: closedLeftX }, { easing: 'sineInOut' })
        .start();
    cc.tween(rightPage)
        .to(CLOSE_DURATION, { x: closedRightX }, { easing: 'sineInOut' })
        .call(() => {
            onCovered();
            cc.tween(layer).delay(0.06).call(openPages).start();
        })
        .start();
    return layer;
}

function createPage(
    parent: cc.Node,
    name: string,
    width: number,
    height: number,
    isLeft: boolean,
    x: number,
): cc.Node {
    const paper = isLeft ? new cc.Color(255, 247, 226) : new cc.Color(250, 239, 214);
    const page = uimanager.createRect(parent, name, width, height, paper, 255, 0, x, 0);
    page.zIndex = 2;

    const innerX = isLeft ? width / 2 - 10 : -width / 2 + 10;
    const shade = uimanager.createRect(page, 'pageFoldShadow', 28, height, MOOD_COLORS.cocoa, 24, 0, innerX, 0);
    shade.zIndex = 2;
    const marginX = isLeft ? width / 2 - 48 : -width / 2 + 48;
    const margin = uimanager.createRect(page, 'pageGoldenMargin', 2, height - 88, new cc.Color(215, 168, 75), 76, 0, marginX, 0);
    margin.zIndex = 3;

    const texture = new cc.Node('pagePaperTexture');
    texture.zIndex = 1;
    page.addChild(texture);
    const graphics = texture.addComponent(cc.Graphics);
    graphics.strokeColor = new cc.Color(164, 116, 67, 20);
    graphics.lineWidth = 1.2;
    for (let index = -3; index <= 3; index++) {
        const y = index * height * 0.11;
        const outerX = isLeft ? -width / 2 + 34 : width / 2 - 34;
        const nearSpineX = isLeft ? width / 2 - 66 : -width / 2 + 66;
        graphics.moveTo(outerX, y - 16);
        graphics.bezierCurveTo(outerX * 0.45, y + 8, nearSpineX * 0.42, y - 7, nearSpineX, y + 12);
        graphics.stroke();
    }
    return page;
}
