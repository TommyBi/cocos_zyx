/**
 * GM 补给面板（Web Debug 专用）。
 *
 * 本文件位于 assets/script/gm/，微信构建前会被 scripts/strip-gm-code.js 整体剥离，
 * 微信产物中不包含任何 GM UI、调试接口调用与相关文案。
 * 面板只由全局悬浮气泡打开；发放后由场景回调同步云端与 HUD。
 */
import { zyxGameModule } from '../dataModule/ZyxGameModule';
import { BUTTON_COLORS, BUTTON_TEXT_COLOR, uimanager } from '../manager/UIManager';
import { gameSettings } from '../manager/GameSettings';

const COCOA = new cc.Color(101, 70, 58);

function createFlatButton(
    parent: cc.Node,
    name: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: cc.Color,
    onClick: () => void,
    _fontSize: number,
): cc.Node {
    const button = uimanager.createRect(parent, name, width, height, color, 255, Math.min(17, height / 2), x, y);
    button.addComponent(cc.Button);
    // 一个节点只保留一层 Graphics，避免 Cocos 2.4 的后绘制组件吞掉底色。
    uimanager.drawButtonSurface(button, width, height, color, Math.min(17, height / 2));
    const label = uimanager.createLabel(button, text, 0, 1, 24, BUTTON_TEXT_COLOR, width - 20, height - 8);
    uimanager.applyTypography(label, true);
    button.on(cc.Node.EventType.TOUCH_START, () => cc.tween(button).to(0.06, { scale: 0.96 }).start());
    button.on(cc.Node.EventType.TOUCH_END, () => {
        cc.tween(button).to(0.1, { scale: 1 }).start();
        onClick();
    });
    button.on(cc.Node.EventType.TOUCH_CANCEL, () => cc.tween(button).to(0.1, { scale: 1 }).start());
    return button;
}

/** GM 补给面板：点击按钮直接把资源加入背包，可选同步云端。 */
export function showGmSupplyPanel(
    onInventoryChanged?: () => void,
    onSyncCloud?: () => void | Promise<void>,
    onResetAccount?: () => Promise<void>,
): void {
    let resetting = false;
    const render = (panel: cc.Node, centerY: number): void => {
        const inventory = uimanager.createRect(panel, 'gmInventorySummary', 438, 84, new cc.Color(232, 241, 221), 255, 18, 0, centerY + 135);
        const inventoryLabel = uimanager.createLabel(inventory, '', 0, 0, 18, COCOA, 410, 68);
        inventoryLabel.enableWrapText = true;
        const updateInventory = (): void => {
            inventoryLabel.string = `开心豆 ${zyxGameModule.getDisplayMoodBeanBalance()}   ·   Lv.${zyxGameModule.getDisplayLevelAndExperience().level}`
                + `\n解压锤 ${zyxGameModule.hammerCount}   ·   魔法棒 ${zyxGameModule.colorPurifierCount}`;
        };
        updateInventory();

        const afterGrant = (toast: string, syncCloud: boolean): void => {
            gameSettings.vibrateLight();
            updateInventory();
            if (onInventoryChanged) onInventoryChanged();
            uimanager.showToast(toast);
            if (syncCloud && onSyncCloud) Promise.resolve(onSyncCloud()).catch(() => undefined);
        };

        createFlatButton(panel, 'grantMoodBeans', '开心豆  +500', -111, centerY + 35, 206, 58, new cc.Color(236, 177, 68), () => {
            if (resetting) return;
            zyxGameModule.grantDebugInventory(500, 0, 0);
            afterGrant('开心豆 +500', true);
        }, 20);
        createFlatButton(panel, 'grantMoodBeansLarge', '开心豆  +5000', 111, centerY + 35, 206, 58, new cc.Color(244, 196, 98), () => {
            if (resetting) return;
            zyxGameModule.grantDebugInventory(5000, 0, 0);
            afterGrant('开心豆 +5000', true);
        }, 20);
        createFlatButton(panel, 'grantHammer', '解压锤  +1', -111, centerY - 45, 206, 58, new cc.Color(124, 181, 145), () => {
            if (resetting) return;
            zyxGameModule.grantDebugInventory(0, 1, 0);
            afterGrant('解压锤 +1', true);
        }, 19);
        createFlatButton(panel, 'grantMagicWand', '魔法棒  +1', 111, centerY - 45, 206, 58, new cc.Color(105, 164, 186), () => {
            if (resetting) return;
            zyxGameModule.grantDebugInventory(0, 0, 1);
            afterGrant('魔法棒 +1', true);
        }, 19);
        createFlatButton(panel, 'resetAccount', '重置账号并体验新手', 0, centerY - 135, 438, 64, BUTTON_COLORS.red, async () => {
            if (resetting || !onResetAccount) return;
            resetting = true;
            try { await onResetAccount(); } finally { resetting = false; }
        }, 22);
        uimanager.createLabel(panel, '清空进度、豆子和道具 · 恢复10点体力\n仅限当前本地试玩账号', 0, centerY - 202, 17, COCOA, 438, 52);
    };
    uimanager.showModal('GM 补给', '补充资源，或从新手第一步重新体验', [], render, 450, false, true);
}
