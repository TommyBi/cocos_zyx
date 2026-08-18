import { vibrateShortLight } from './PlatformAdapter';

export type GameSettingsSnapshot = {
    soundEnabled: boolean;
    soundVolume: number;
    vibrationEnabled: boolean;
};

const STORAGE_KEY = 'zyx_game_settings_v1';

/**
 * 跨首页与局内共享的偏好设置。
 *
 * Cocos 的音频引擎使用全局音量，所以把「音效开关」解释为效果音和音乐的总开关；
 * 后续接入新音效时无需再为每个节点补一套开关逻辑。
 */
export default class GameSettings {
    private static _instance: GameSettings;

    public static get instance(): GameSettings {
        if (!this._instance) this._instance = new GameSettings();
        return this._instance;
    }

    private loaded: boolean = false;
    private state: GameSettingsSnapshot = {
        soundEnabled: true,
        soundVolume: 0.7,
        vibrationEnabled: true,
    };

    public get soundEnabled(): boolean {
        this.ensureLoaded();
        return this.state.soundEnabled;
    }

    public get soundVolume(): number {
        this.ensureLoaded();
        return this.state.soundVolume;
    }

    public get vibrationEnabled(): boolean {
        this.ensureLoaded();
        return this.state.vibrationEnabled;
    }

    public getSnapshot(): GameSettingsSnapshot {
        this.ensureLoaded();
        return {
            soundEnabled: this.state.soundEnabled,
            soundVolume: this.state.soundVolume,
            vibrationEnabled: this.state.vibrationEnabled,
        };
    }

    public setSoundEnabled(enabled: boolean): void {
        this.ensureLoaded();
        this.state.soundEnabled = !!enabled;
        this.persist();
        this.applyAudioVolume();
    }

    public setSoundVolume(volume: number): void {
        this.ensureLoaded();
        this.state.soundVolume = Math.max(0, Math.min(1, Number(volume) || 0));
        this.persist();
        this.applyAudioVolume();
    }

    public setVibrationEnabled(enabled: boolean): void {
        this.ensureLoaded();
        this.state.vibrationEnabled = !!enabled;
        this.persist();
    }

    /** 供需要触感反馈的交互统一调用，关闭震动后不再触发微信 API。 */
    public vibrateLight(): void {
        this.ensureLoaded();
        if (!this.state.vibrationEnabled) return;
        vibrateShortLight();
    }

    private ensureLoaded(): void {
        if (this.loaded) return;
        this.loaded = true;
        try {
            const raw = cc.sys.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const stored = JSON.parse(raw) as Partial<GameSettingsSnapshot>;
                this.state.soundEnabled = stored.soundEnabled !== false;
                this.state.soundVolume = Math.max(0, Math.min(1, Number(stored.soundVolume)));
                if (!Number.isFinite(this.state.soundVolume)) this.state.soundVolume = 0.7;
                this.state.vibrationEnabled = stored.vibrationEnabled !== false;
            }
        } catch (error) {
            // 解析失败时采用默认设置，不阻断游戏初始化。
        }
        this.applyAudioVolume();
    }

    private persist(): void {
        try {
            cc.sys.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            // 无痕模式或存储满时仍保持本次会话内的设置有效。
        }
    }

    private applyAudioVolume(): void {
        const audioEngine: any = typeof cc !== 'undefined' ? (cc as any).audioEngine : null;
        if (!audioEngine) return;
        const volume = this.state.soundEnabled ? this.state.soundVolume : 0;
        if (typeof audioEngine.setEffectsVolume === 'function') audioEngine.setEffectsVolume(volume);
        if (typeof audioEngine.setMusicVolume === 'function') audioEngine.setMusicVolume(volume);
    }
}

export const gameSettings = GameSettings.instance;
