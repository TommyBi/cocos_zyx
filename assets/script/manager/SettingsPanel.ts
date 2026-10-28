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

}

export const settingsPanel = SettingsPanel.instance;
