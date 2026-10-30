import { gameSettings } from './GameSettings';
import { ASSET_PATHS, BundleName, getAudioClip, loadMusicClip } from './AssetLoader';

export type MusicName = 'main' | 'game';
export type SoundName = 'break' | 'move' | 'hammer' | 'magicWand';

type AudioResource = { bundle: BundleName; path: string };

const SOUND_RESOURCES: { [key in SoundName]: AudioResource } = {
    break: { bundle: 'game', path: ASSET_PATHS.game.breakSound },
    move: { bundle: 'game', path: ASSET_PATHS.game.moveSound },
    hammer: { bundle: 'game', path: ASSET_PATHS.game.hammerSound },
    magicWand: { bundle: 'game', path: ASSET_PATHS.game.magicWandSound },
};

const LOOP_BACKGROUND_MUSIC = true;

/** 只负责播放策略；具体音频归属和加载缓存由 AssetLoader 统一管理。 */
export default class AudioManager {
    private static _instance: AudioManager;

    public static get instance(): AudioManager {
        if (!this._instance) this._instance = new AudioManager();
        return this._instance;
    }

    private currentMusic: MusicName = null;
    private musicLoadName: MusicName = null;
    private musicRequestId: number = 0;
    private musicAudioId: number = -1;

    /** 切换并循环播放逻辑场景对应的背景音乐。曲目从 CDN 远程 Bundle 拉取，不阻塞界面。 */
    public playMusic(name: MusicName): void {
        if (this.currentMusic === name && (cc.audioEngine.isMusicPlaying() || this.musicLoadName === name)) {
            this.applySettings();
            return;
        }
        this.currentMusic = name;
        this.musicLoadName = name;
        const requestId = ++this.musicRequestId;
        loadMusicClip(name)
            .then((clip) => {
                if (requestId !== this.musicRequestId || this.currentMusic !== name) return;
                cc.audioEngine.stopMusic();
                this.startMusicLoop(name, clip, requestId);
            })
            .catch((error: Error) => {
                cc.warn('背景音乐加载失败', name, error);
            })
            .then(() => {
                if (this.musicLoadName === name && requestId === this.musicRequestId) this.musicLoadName = null;
            });
    }

    /** 部分 Web/小游戏容器会忽略底层 loop 标志，结束回调负责无缝补播。 */
    private startMusicLoop(name: MusicName, clip: cc.AudioClip, requestId: number): void {
        if (requestId !== this.musicRequestId || this.currentMusic !== name) return;
        this.applySettings();
        const audioId = cc.audioEngine.playMusic(clip, LOOP_BACKGROUND_MUSIC);
        this.musicAudioId = audioId;

        const engine: any = cc.audioEngine;
        if (typeof engine.setLoop === 'function') engine.setLoop(audioId, true);
        if (typeof engine.setFinishCallback !== 'function') return;
        engine.setFinishCallback(audioId, () => {
            if (
                requestId !== this.musicRequestId
                || this.currentMusic !== name
                || this.musicAudioId !== audioId
            ) return;
            if (typeof engine.isPlaying === 'function' && engine.isPlaying(audioId)) return;
            this.startMusicLoop(name, clip, requestId);
        });
    }

    /** 音效只在设置允许时播放；加载期间关闭声音也不会补播。 */
    public playSound(name: SoundName): void {
        if (!gameSettings.soundEnabled || gameSettings.soundVolume <= 0) return;
        const clip = this.getClip(SOUND_RESOURCES[name]);
        if (!gameSettings.soundEnabled || gameSettings.soundVolume <= 0) return;
        cc.audioEngine.playEffect(clip, false);
    }

    /** 设置面板调用此方法，让当前音乐和仍在播放的效果音立即响应开关/音量。 */
    public applySettings(): void {
        const enabled = gameSettings.soundEnabled && gameSettings.soundVolume > 0;
        const volume = enabled ? gameSettings.soundVolume : 0;
        cc.audioEngine.setMusicVolume(volume);
        cc.audioEngine.setEffectsVolume(volume);
        if (!enabled) {
            cc.audioEngine.stopAllEffects();
        }
    }

    private getClip(resource: AudioResource): cc.AudioClip {
        return getAudioClip(resource.bundle, resource.path);
    }
}

export const audioManager = AudioManager.instance;
