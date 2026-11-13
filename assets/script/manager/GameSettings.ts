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
 * 「声音」同时控制音乐与效果音；这里只保存偏好并通知 AudioManager，
 * 不直接访问音频引擎，避免设置和页面各维护一套播放状态。
 */
export default class GameSettings {
    private static _instance: GameSettings;

    public static get instance(): GameSettings {
        if (!this._instance) this._instance = new GameSettings();
        return this._instance;
    }

    private loaded: boolean = false;
    private audioListeners = new Set<() => void>();
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
        this.audioListeners.forEach(listener => listener());
    }

    public setSoundVolume(volume: number): void {
        this.ensureLoaded();
        this.state.soundVolume = Math.max(0, Math.min(1, Number(volume) || 0));
        this.persist();
        this.audioListeners.forEach(listener => listener());
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
    }

    public onAudioChange(listener: () => void): () => void {
        this.audioListeners.add(listener);
        return () => this.audioListeners.delete(listener);
    }

    private persist(): void {
        try {
            cc.sys.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            // 无痕模式或存储满时仍保持本次会话内的设置有效。
        }
    }

}

export const gameSettings = GameSettings.instance;
