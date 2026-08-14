import { HAPPY_BOTTLE_TARGET, zyxGameModule } from '../dataModule/ZyxGameModule';
import { BUTTON_COLORS, ModalAction, uimanager } from './Uimanager';
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
        onResetAccount?: () => void | Promise<void>,
    ): void {
        const grant = { amount: 10 };
        const render = (panel: cc.Node, centerY: number): void => {
            const inventory = uimanager.createRect(panel, 'gmInventorySummary', 438, 74, new cc.Color(232, 241, 221), 255, 13, 0, centerY + 178);
            const inventoryLabel = uimanager.createLabel(inventory, '', 0, 0, 14, COCOA, 412, 64);
            inventoryLabel.enableWrapText = true;
            const updateInventory = (): void => {
                const lastRow = zyxGameModule.generationDebugLog.length > 0
                    ? zyxGameModule.generationDebugLog[zyxGameModule.generationDebugLog.length - 1]
                    : null;
                const boardDebug = lastRow
                    ? `种子 ${zyxGameModule.roundSeed}  ·  下一排 ${lastRow.targetCells} 格  ·  可移动 ${lastRow.movablePieces} 块`
                    : `种子 ${zyxGameModule.roundSeed || '未开局'}`;
                inventoryLabel.string = `收集中 ${zyxGameModule.happyBottleProgress}/${HAPPY_BOTTLE_TARGET}  ·  开心瓶 ${zyxGameModule.happyBottleCount}`
                    + `\n解压锤 ${zyxGameModule.hammerCount}  ·  魔法棒 ${zyxGameModule.colorPurifierCount}`
                    + `\n${boardDebug}`;
            };
            updateInventory();

            const amountCard = uimanager.createRect(panel, 'gmAmountCard', 438, 86, CREAM, 255, 15, 0, centerY + 108);
            const amountLabel = uimanager.createLabel(amountCard, '', 0, 16, 20, COCOA, 150, 34);
            let progressBtnLabel: cc.Label = null;
            let bottleBtnLabel: cc.Label = null;
            let hammerBtnLabel: cc.Label = null;
            let wandBtnLabel: cc.Label = null;
            const updateAmount = (): void => {
                amountLabel.string = `发放数量 ${grant.amount}`;
                if (progressBtnLabel) progressBtnLabel.string = `收集进度 +${grant.amount}`;
                if (bottleBtnLabel) bottleBtnLabel.string = `开心瓶 +${grant.amount}`;
                if (hammerBtnLabel) hammerBtnLabel.string = `解压锤 +${grant.amount}`;
                if (wandBtnLabel) wandBtnLabel.string = `魔法棒 +${grant.amount}`;
            };
            const setAmount = (value: number): void => {
                grant.amount = Math.max(1, Math.min(999, Math.floor(value)));
                updateAmount();
            };
            this.createFlatButton(amountCard, '数量减十', '−10', -168, 16, 70, 34, new cc.Color(187, 153, 126), () => setAmount(grant.amount - 10), 15);
            this.createFlatButton(amountCard, '数量减一', '−1', -92, 16, 56, 34, new cc.Color(187, 153, 126), () => setAmount(grant.amount - 1), 15);
            this.createFlatButton(amountCard, '数量加一', '+1', 92, 16, 56, 34, SAGE, () => setAmount(grant.amount + 1), 15);
            this.createFlatButton(amountCard, '数量加十', '+10', 168, 16, 70, 34, SAGE, () => setAmount(grant.amount + 10), 15);
            // 快捷自定义：点一下直接设成常用数量。
            const presets = [1, 5, 10, 50, 100, 666];
            presets.forEach((value, index) => {
                const x = -175 + index * 70;
                this.createFlatButton(amountCard, `preset_${value}`, String(value), x, -22, 62, 28, new cc.Color(168, 128, 92), () => setAmount(value), 14);
            });

            const afterGrant = (progressAdded?: number, toast?: string): void => {
                gameSettings.vibrateLight();
                updateInventory();
                if (onInventoryChanged) onInventoryChanged(progressAdded);
                if (toast) uimanager.showToast(toast);
                if (onSyncCloud) Promise.resolve(onSyncCloud()).catch(() => undefined);
            };

            const readButtonLabel = (button: cc.Node): cc.Label => {
                const labelNode = button.getChildByName('label');
                return labelNode ? labelNode.getComponent(cc.Label) : null;
            };
            progressBtnLabel = readButtonLabel(this.createFlatButton(panel, 'grantBottleProgress', `收集进度 +${grant.amount}`, 0, centerY + 8, 438, 50, new cc.Color(236, 177, 68), () => {
                const result = zyxGameModule.grantDebugHappyBottleProgress(grant.amount);
                const toast = result.completedBottles > 0
                    ? `收集进度 +${result.added}，装满开心瓶 ×${result.completedBottles}`
                    : `收集进度 +${result.added} → ${result.progress}/${HAPPY_BOTTLE_TARGET}`;
                afterGrant(result.added, toast);
            }, 20));
            bottleBtnLabel = readButtonLabel(this.createFlatButton(panel, 'grantHappyBottle', `开心瓶 +${grant.amount}`, 0, centerY - 54, 438, 50, new cc.Color(244, 196, 98), () => {
                zyxGameModule.grantDebugInventory(grant.amount, 0, 0);
                afterGrant(0, `开心瓶 +${grant.amount}`);
            }, 20));
            hammerBtnLabel = readButtonLabel(this.createFlatButton(panel, 'grantHammer', `解压锤 +${grant.amount}`, -111, centerY - 118, 206, 50, new cc.Color(124, 181, 145), () => {
                zyxGameModule.grantDebugInventory(0, grant.amount, 0);
                afterGrant(0, `解压锤 +${grant.amount}`);
            }, 19));
            wandBtnLabel = readButtonLabel(this.createFlatButton(panel, 'grantMagicWand', `魔法棒 +${grant.amount}`, 111, centerY - 118, 206, 50, new cc.Color(105, 164, 186), () => {
                zyxGameModule.grantDebugInventory(0, 0, grant.amount);
                afterGrant(0, `魔法棒 +${grant.amount}`);
            }, 19));
            updateAmount();
            this.createFlatButton(panel, 'resetAccount', '重置账号', 0, centerY - 182, 438, 50, new cc.Color(196, 112, 98), () => {
                uimanager.showModal('重置账号', '将清空等级、开心瓶、道具与画册解锁，并同步到服务器。此操作不可撤销。', [
                    {
                        text: '取消',
                        color: BUTTON_COLORS.yellow,
                        onClick: () => undefined,
                    },
                    {
                        text: '确认重置',
                        color: BUTTON_COLORS.red,
                        onClick: () => {
                            if (onResetAccount) Promise.resolve(onResetAccount()).then(() => updateInventory()).catch(() => undefined);
                        },
                    },
                ]);
            }, 20);
        };
        uimanager.showModal('GM 发放', '发放会同步到服务器；道具仅本地', [
            {
                text: '关闭',
                color: BUTTON_COLORS.green,
                onClick: () => undefined,
            },
        ], render, 460);
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
