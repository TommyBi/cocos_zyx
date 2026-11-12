import { BUTTON_COLORS, ModalAction, uimanager } from './UIManager';
import { gameSettings } from './GameSettings';
import { audioManager } from './AudioManager';
import { decorateSettingsActionButton } from '../zyxGame/GlyphFactory';

export type SettingsPanelOptions = {
    /** 局内暂停时，继续和重开并排，退出居中放在下一排。 */
    actions?: ModalAction[];
    onDismiss?: () => void;
};

const COCOA = new cc.Color(101, 70, 58);
const COCOA_SOFT = new cc.Color(123, 87, 66);
const CREAM = new cc.Color(255, 251, 238);
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
        const actions = options.actions && options.actions.length > 0 ? options.actions : [
            {
                text: '完成',
                color: BUTTON_COLORS.green,
                onClick: () => undefined,
                icon: (button: cc.Node) => decorateSettingsActionButton(button, 'done'),
            },
        ];
        const twoRows = actions.length > 1;
        const render = (panel: cc.Node): void => {
            const top = panel.height / 2;
            this.createSoundRow(panel, top - 130);
            this.createVolumeRow(panel, top - 242);
            this.createVibrationRow(panel, top - 354);
            actions.forEach((action, index) => {
                const x = twoRows && index < 2 ? (index === 0 ? -122 : 122) : 0;
                const y = top - 500 - (twoRows ? Math.floor(index / 2) * 126 : 0);
                const button = uimanager.createButton(panel, action.text, x, y, 224, 100, action.color, () => {
                    if (action.closeOnClick !== false) uimanager.closeModal();
                    action.onClick();
                }, 32);
                const label = button.getChildByName('label');
                label.color = cc.Color.WHITE;
                const outline = label.addComponent(cc.LabelOutline);
                outline.color = new cc.Color(Math.round(action.color.r * 0.54), Math.round(action.color.g * 0.54), Math.round(action.color.b * 0.54));
                outline.width = 2;
                if (action.icon) action.icon(button);
            });
        };
        uimanager.showModal('设   置', '', [], render, twoRows ? 450 : 324, false, true, 560, {
            onDismiss: options.onDismiss,
            closeOnBlank: true,
        });
    }

    private createSoundRow(parent: cc.Node, y: number): void {
        const row = this.createSettingRow(parent, '声音', y);
        const state = uimanager.createLabel(row, '', 67, 0, 24, COCOA_SOFT, 100, 36);
        const update = (): void => {
            state.string = gameSettings.soundEnabled ? '已开启' : '已关闭';
        };
        update();
        this.createSwitch(row, 167, 0, gameSettings.soundEnabled, (enabled) => {
            gameSettings.setSoundEnabled(enabled);
            audioManager.applySettings();
            if (enabled) gameSettings.vibrateLight();
            update();
        });
    }

    private createVolumeRow(parent: cc.Node, y: number): void {
        const row = this.createSettingRow(parent, '音量', y);
        const value = uimanager.createLabel(row, '', 178, 22, 24, COCOA_SOFT, 76, 34);
        const slider = new cc.Node('volumeSlider');
        const sliderWidth = 268;
        slider.width = sliderWidth;
        slider.height = 52;
        slider.setPosition(57, -16);
        slider.zIndex = 65;
        row.addChild(slider);
        slider.addComponent(cc.BlockInputEvents);
        uimanager.createRect(slider, 'volumeTrack', sliderWidth, 16, new cc.Color(209, 194, 169), 255, 8);
        const fill = uimanager.createRect(slider, 'volumeFill', 1, 16, BUTTON_COLORS.yellow, 255, 8);
        const thumb = uimanager.createCircle(slider, 'volumeThumb', 18, new cc.Color(255, 249, 231));
        const thumbBorderNode = new cc.Node('volumeThumbBorder');
        thumb.addChild(thumbBorderNode);
        const thumbBorder = thumbBorderNode.addComponent(cc.Graphics);
        thumbBorder.strokeColor = new cc.Color(158, 111, 61, 215);
        thumbBorder.lineWidth = 1.7;
        thumbBorder.circle(0, 0, 17.1);
        thumbBorder.stroke();
        const update = (): void => {
            const volume = gameSettings.soundVolume;
            value.string = `${Math.round(volume * 100)}%`;
            const fillWidth = sliderWidth * volume;
            fill.active = fillWidth > 0.5;
            if (fill.active) {
                fill.width = fillWidth;
                fill.x = -sliderWidth / 2 + fillWidth / 2;
                uimanager.drawRect(fill, fillWidth, 16, BUTTON_COLORS.yellow, 8);
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
        const state = uimanager.createLabel(row, '', 67, 0, 24, COCOA_SOFT, 100, 36);
        const update = (): void => {
            state.string = gameSettings.vibrationEnabled ? '已开启' : '已关闭';
        };
        update();
        this.createSwitch(row, 167, 0, gameSettings.vibrationEnabled, (enabled) => {
            gameSettings.setVibrationEnabled(enabled);
            if (enabled) gameSettings.vibrateLight();
            update();
        });
    }

    private createSettingRow(parent: cc.Node, title: string, y: number): cc.Node {
        const row = uimanager.createRect(parent, `setting_${title}`, 468, 94, new cc.Color(222, 194, 151), 255, 22, 0, y);
        row.addComponent(cc.BlockInputEvents);
        uimanager.createRect(row, 'settingRowSurface', 464, 88, CREAM, 255, 20, 0, 2);
        const label = uimanager.createLabel(row, title, -154, 0, 30, COCOA, 96, 44);
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        label.enableBold = true;
        return row;
    }

    private createSwitch(parent: cc.Node, x: number, y: number, initial: boolean, onChange: (enabled: boolean) => void): void {
        const switchWidth = 88;
        const switchHeight = 48;
        const thumbTravel = 20;
        const node = uimanager.createRect(parent, 'settingSwitch', switchWidth, switchHeight, initial ? SAGE : MUTED, 255, 24, x, y);
        node.addComponent(cc.Button);

        const trackOutline = new cc.Node('switchTrackOutline');
        trackOutline.zIndex = 1;
        node.addChild(trackOutline);
        const trackGraphics = trackOutline.addComponent(cc.Graphics);
        trackGraphics.strokeColor = new cc.Color(101, 70, 58, 42);
        trackGraphics.lineWidth = 1.2;
        trackGraphics.roundRect(-switchWidth / 2 + 0.8, -switchHeight / 2 + 0.8, switchWidth - 1.6, switchHeight - 1.6, 23.2);
        trackGraphics.stroke();

        const thumb = new cc.Node('switchThumb');
        thumb.width = 36;
        thumb.height = 36;
        thumb.zIndex = 2;
        thumb.setPosition(initial ? thumbTravel : -thumbTravel, 0);
        node.addChild(thumb);
        const shadow = uimanager.createCircle(thumb, 'switchThumbShadow', 18, new cc.Color(91, 63, 50, 38), 0, -2);
        shadow.zIndex = -1;
        const surface = uimanager.createCircle(thumb, 'switchThumbSurface', 18, new cc.Color(255, 250, 237));
        surface.zIndex = 1;
        const outlineNode = new cc.Node('switchThumbOutline');
        outlineNode.zIndex = 2;
        thumb.addChild(outlineNode);
        const outline = outlineNode.addComponent(cc.Graphics);
        outline.strokeColor = new cc.Color(111, 81, 67, 90);
        outline.lineWidth = 1.2;
        outline.circle(0, 0, 17.3);
        outline.stroke();
        const highlight = uimanager.createCircle(thumb, 'switchThumbHighlight', 4, new cc.Color(255, 255, 255, 190), -6, 6);
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
