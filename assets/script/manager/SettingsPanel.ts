import { HAPPY_BOTTLE_TARGET, zyxGameModule } from '../dataModule/ZyxGameModule';
import { BUTTON_COLORS, ModalAction, uimanager } from './UIManager';
import { gameSettings } from './GameSettings';
import { audioManager } from './AudioManager';

export type SettingsPanelOptions = {
    /** 局内暂停时，将继续、重开、结束直接追加在设置项下方。 */
    actions?: ModalAction[];
};

const COCOA = new cc.Color(101, 70, 58);
const COCOA_SOFT = new cc.Color(137, 98, 76);
const CREAM = new cc.Color(255, 247, 228);
const SAGE = new cc.Color(111, 182, 139);
const MUTED = new cc.Color(185, 165, 145);

/** 首页和暂停页共用的设置面板。 */
export default class SettingsPanel {
    private static _instance: SettingsPanel;

    public static get instance(): SettingsPanel {
        if (!this._instance) this._instance = new SettingsPanel();
        return this._instance;
    }

    public show(options: SettingsPanelOptions = {}): void {
        const render = (panel: cc.Node, centerY: number): void => {
            this.createSoundRow(panel, centerY + 154);
            this.createVolumeRow(panel, centerY + 74);
            this.createVibrationRow(panel, centerY - 6);
        };
        const actions = options.actions && options.actions.length > 0 ? options.actions : [
            {
                text: '完成',
                color: BUTTON_COLORS.green,
                onClick: () => undefined,
            },
        ];
        uimanager.showModal('设   置', '', actions, render, 260);
    }

    /** GM 只由全局悬浮气泡打开；发放后由场景回调同步云端与 HUD。 */
    public showGm(
        onInventoryChanged?: (progressAdded?: number) => void,
        onSyncCloud?: () => void | Promise<void>,
    ): void {
        const render = (panel: cc.Node, centerY: number): void => {
            const inventory = uimanager.createRect(panel, 'gmInventorySummary', 438, 84, new cc.Color(232, 241, 221), 255, 18, 0, centerY + 92);
            const inventoryLabel = uimanager.createLabel(inventory, '', 0, 0, 18, COCOA, 410, 68);
            inventoryLabel.enableWrapText = true;
            const updateInventory = (): void => {
                inventoryLabel.string = `收集 ${zyxGameModule.happyBottleProgress}/${HAPPY_BOTTLE_TARGET}   ·   开心瓶 ${zyxGameModule.happyBottleCount}`
                    + `\n解压锤 ${zyxGameModule.hammerCount}   ·   魔法棒 ${zyxGameModule.colorPurifierCount}`;
            };
            updateInventory();

            const afterGrant = (progressAdded: number, toast: string, syncCloud: boolean): void => {
                gameSettings.vibrateLight();
                updateInventory();
                if (onInventoryChanged) onInventoryChanged(progressAdded);
                uimanager.showToast(toast);
                if (syncCloud && onSyncCloud) Promise.resolve(onSyncCloud()).catch(() => undefined);
            };

            this.createFlatButton(panel, 'grantBottleProgress', '表情  +10', -111, centerY - 6, 206, 58, new cc.Color(236, 177, 68), () => {
                const result = zyxGameModule.grantDebugHappyBottleProgress(10);
                const toast = result.completedBottles > 0
                    ? `收集进度 +${result.added}，装满开心瓶 ×${result.completedBottles}`
                    : `收集进度 +${result.added} → ${result.progress}/${HAPPY_BOTTLE_TARGET}`;
                afterGrant(result.added, toast, true);
            }, 20);
            this.createFlatButton(panel, 'grantHappyBottle', '开心瓶  +1', 111, centerY - 6, 206, 58, new cc.Color(244, 196, 98), () => {
                zyxGameModule.grantDebugInventory(1, 0, 0);
                afterGrant(0, '开心瓶 +1', true);
            }, 20);
            this.createFlatButton(panel, 'grantHammer', '解压锤  +1', -111, centerY - 76, 206, 58, new cc.Color(124, 181, 145), () => {
                zyxGameModule.grantDebugInventory(0, 1, 0);
                afterGrant(0, '解压锤 +1', false);
            }, 19);
            this.createFlatButton(panel, 'grantMagicWand', '魔法棒  +1', 111, centerY - 76, 206, 58, new cc.Color(105, 164, 186), () => {
                zyxGameModule.grantDebugInventory(0, 0, 1);
                afterGrant(0, '魔法棒 +1', false);
            }, 19);
        };
        uimanager.showModal('GM 补给', '点击按钮，资源会直接加入背包', [], render, 280, false, true);
    }

    private createSoundRow(parent: cc.Node, y: number): void {
        const row = this.createSettingRow(parent, '声音', y);
        const state = uimanager.createLabel(row, '', 89, 0, 15, COCOA_SOFT, 90, 24);
        const update = (): void => {
            state.string = gameSettings.soundEnabled ? '已开启' : '已关闭';
        };
        update();
        this.createSwitch(row, 176, 0, gameSettings.soundEnabled, (enabled) => {
            gameSettings.setSoundEnabled(enabled);
            audioManager.applySettings();
            if (enabled) gameSettings.vibrateLight();
            update();
        });
    }

    private createVolumeRow(parent: cc.Node, y: number): void {
        const row = this.createSettingRow(parent, '音量', y, 70);
        const value = uimanager.createLabel(row, '', 158, 19, 15, COCOA_SOFT, 64, 22);
        const slider = new cc.Node('volumeSlider');
        const sliderWidth = 250;
        slider.width = sliderWidth;
        slider.height = 40;
        slider.setPosition(45, -13);
        slider.zIndex = 65;
        row.addChild(slider);
        uimanager.createRect(slider, 'volumeTrack', sliderWidth, 12, new cc.Color(209, 194, 169), 255, 6);
        const fill = uimanager.createRect(slider, 'volumeFill', 1, 12, BUTTON_COLORS.yellow, 255, 6);
        const thumb = uimanager.createCircle(slider, 'volumeThumb', 13, new cc.Color(255, 249, 231));
        const thumbBorderNode = new cc.Node('volumeThumbBorder');
        thumb.addChild(thumbBorderNode);
        const thumbBorder = thumbBorderNode.addComponent(cc.Graphics);
        thumbBorder.strokeColor = new cc.Color(158, 111, 61, 215);
        thumbBorder.lineWidth = 1.7;
        thumbBorder.circle(0, 0, 12.1);
        thumbBorder.stroke();
        const update = (): void => {
            const volume = gameSettings.soundVolume;
            value.string = `${Math.round(volume * 100)}%`;
            const fillWidth = sliderWidth * volume;
            fill.active = fillWidth > 0.5;
            if (fill.active) {
                fill.width = fillWidth;
                fill.x = -sliderWidth / 2 + fillWidth / 2;
                uimanager.drawRect(fill, fillWidth, 12, BUTTON_COLORS.yellow, 6);
            }
            thumb.x = -sliderWidth / 2 + fillWidth;
        };
        const updateFromTouch = (event: cc.Event.EventTouch): void => {
            const point = event.touch.getLocation();
            const local = slider.convertToNodeSpaceAR(point);
            const volume = Math.max(0, Math.min(1, (local.x + sliderWidth / 2) / sliderWidth));
            gameSettings.setSoundVolume(volume);
            audioManager.applySettings();
            update();
        };
        let dragging = false;
        slider.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            dragging = true;
            updateFromTouch(event);
        });
        slider.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (dragging) updateFromTouch(event);
        });
        slider.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (dragging) updateFromTouch(event);
            dragging = false;
            uimanager.tapFeedback();
        });
        slider.on(cc.Node.EventType.TOUCH_CANCEL, () => dragging = false);
        update();
    }

    private createVibrationRow(parent: cc.Node, y: number): void {
        const row = this.createSettingRow(parent, '震动', y);
        const state = uimanager.createLabel(row, '', 89, 0, 15, COCOA_SOFT, 90, 24);
        const update = (): void => {
            state.string = gameSettings.vibrationEnabled ? '已开启' : '已关闭';
        };
        update();
        this.createSwitch(row, 176, 0, gameSettings.vibrationEnabled, (enabled) => {
            gameSettings.setVibrationEnabled(enabled);
            if (enabled) gameSettings.vibrateLight();
            update();
        });
    }

    private createSettingRow(parent: cc.Node, title: string, y: number, height: number = 62): cc.Node {
        const row = uimanager.createRect(parent, `setting_${title}`, 438, height, CREAM, 255, 17, 0, y);
        uimanager.createLabel(row, title, -168, 0, 21, COCOA, 96, 30).horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        return row;
    }

    private createSwitch(parent: cc.Node, x: number, y: number, initial: boolean, onChange: (enabled: boolean) => void): void {
        const switchWidth = 72;
        const switchHeight = 38;
        const thumbTravel = 17;
        const node = uimanager.createRect(parent, 'settingSwitch', switchWidth, switchHeight, initial ? SAGE : MUTED, 255, 19, x, y);
        node.addComponent(cc.Button);

        const trackOutline = new cc.Node('switchTrackOutline');
        trackOutline.zIndex = 1;
        node.addChild(trackOutline);
        const trackGraphics = trackOutline.addComponent(cc.Graphics);
        trackGraphics.strokeColor = new cc.Color(101, 70, 58, 42);
        trackGraphics.lineWidth = 1.2;
        trackGraphics.roundRect(-switchWidth / 2 + 0.8, -switchHeight / 2 + 0.8, switchWidth - 1.6, switchHeight - 1.6, 18.2);
        trackGraphics.stroke();

        const thumb = new cc.Node('switchThumb');
        thumb.width = 28;
        thumb.height = 28;
        thumb.zIndex = 2;
        thumb.setPosition(initial ? thumbTravel : -thumbTravel, 0);
        node.addChild(thumb);
        const shadow = uimanager.createCircle(thumb, 'switchThumbShadow', 14, new cc.Color(91, 63, 50, 38), 0, -2);
        shadow.zIndex = -1;
        const surface = uimanager.createCircle(thumb, 'switchThumbSurface', 14, new cc.Color(255, 250, 237));
        surface.zIndex = 1;
        const outlineNode = new cc.Node('switchThumbOutline');
        outlineNode.zIndex = 2;
        thumb.addChild(outlineNode);
        const outline = outlineNode.addComponent(cc.Graphics);
        outline.strokeColor = new cc.Color(111, 81, 67, 90);
        outline.lineWidth = 1.2;
        outline.circle(0, 0, 13.3);
        outline.stroke();
        const highlight = uimanager.createCircle(thumb, 'switchThumbHighlight', 3, new cc.Color(255, 255, 255, 190), -5, 5);
        highlight.zIndex = 3;

        let enabled = initial;
        const paint = (): void => {
            uimanager.drawRect(node, switchWidth, switchHeight, enabled ? SAGE : MUTED, switchHeight / 2);
            cc.Tween.stopAllByTarget(thumb);
            cc.tween(thumb)
                .to(0.14, { x: enabled ? thumbTravel : -thumbTravel }, { easing: 'sineOut' })
                .start();
        };
        node.on(cc.Node.EventType.TOUCH_START, () => {
            cc.Tween.stopAllByTarget(node);
            cc.tween(node).to(0.06, { scale: 0.96 }).start();
        });
        node.on(cc.Node.EventType.TOUCH_END, () => {
            enabled = !enabled;
            paint();
            cc.Tween.stopAllByTarget(node);
            cc.tween(node).to(0.12, { scale: 1 }, { easing: 'backOut' }).start();
            onChange(enabled);
        });
        node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            cc.Tween.stopAllByTarget(node);
            cc.tween(node).to(0.1, { scale: 1 }).start();
        });
    }

    private createFlatButton(
        parent: cc.Node,
        name: string,
        text: string,
        x: number,
        y: number,
        width: number,
        height: number,
        color: cc.Color,
        onClick: () => void,
        fontSize: number,
    ): cc.Node {
        const button = uimanager.createRect(parent, name, width, height, color, 255, Math.min(17, height / 2), x, y);
        button.addComponent(cc.Button);
        // 一个节点只保留一层 Graphics，避免 Cocos 2.4 的后绘制组件吞掉底色。
        uimanager.drawButtonSurface(button, width, height, color, Math.min(17, height / 2));
        const label = uimanager.createLabel(button, text, 0, 1, fontSize, cc.Color.WHITE, width - 20, height - 8);
        const outline = label.node.addComponent(cc.LabelOutline);
        outline.color = new cc.Color(Math.round(color.r * 0.48), Math.round(color.g * 0.48), Math.round(color.b * 0.48));
        outline.width = 1;
        button.on(cc.Node.EventType.TOUCH_START, () => cc.tween(button).to(0.06, { scale: 0.96 }).start());
        button.on(cc.Node.EventType.TOUCH_END, () => {
            cc.tween(button).to(0.1, { scale: 1 }).start();
            onClick();
        });
        button.on(cc.Node.EventType.TOUCH_CANCEL, () => cc.tween(button).to(0.1, { scale: 1 }).start());
        return button;
    }
}

export const settingsPanel = SettingsPanel.instance;
