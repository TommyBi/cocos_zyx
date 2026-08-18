import { gameSettings } from './GameSettings';
import { ASSET_PATHS, BundleName, getAudioClip } from './AssetLoader';

export type MusicName = 'main' | 'game' | 'puzzle';
export type SoundName = 'break' | 'changePic' | 'move' | 'hammer' | 'magicWand';

type AudioResource = { bundle: BundleName; path: string };

const MUSIC_RESOURCES: { [key in MusicName]: AudioResource } = {
    main: { bundle: 'home', path: ASSET_PATHS.home.music },
    game: { bundle: 'game', path: ASSET_PATHS.game.music },
    puzzle: { bundle: 'realm', path: ASSET_PATHS.realm.music },
};

const SOUND_RESOURCES: { [key in SoundName]: AudioResource } = {
    break: { bundle: 'game', path: ASSET_PATHS.game.breakSound },
    changePic: { bundle: 'realm', path: ASSET_PATHS.realm.changePictureSound },
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
    private musicRequestId: number = 0;
    private musicAudioId: number = -1;

    /** 切换并循环播放逻辑场景对应的背景音乐。重复请求同一首时不会重头播放。 */
    public playMusic(name: MusicName): void {
        if (this.currentMusic === name && cc.audioEngine.isMusicPlaying()) {
            this.applySettings();
            return;
        }
        this.currentMusic = name;
        const requestId = ++this.musicRequestId;
        const clip = this.getClip(MUSIC_RESOURCES[name]);
        if (requestId !== this.musicRequestId || this.currentMusic !== name) return;
        cc.audioEngine.stopMusic();
        this.startMusicLoop(name, clip, requestId);
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
