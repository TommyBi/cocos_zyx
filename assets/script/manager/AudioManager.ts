import { gameSettings } from './GameSettings';
import { BundleName, loadAudioClip } from './AssetLoader';

export type MusicName = 'main' | 'game' | 'puzzle';
export type SoundName = 'break' | 'changePic' | 'move' | 'hammer' | 'magicWand';

type AudioResource = { bundle: BundleName; path: string };

const MUSIC_RESOURCES: { [key in MusicName]: AudioResource } = {
    main: { bundle: 'home', path: 'sound/music_main' },
    game: { bundle: 'game-assets', path: 'sound/music_game' },
    puzzle: { bundle: 'realm', path: 'sound/music_puzzle' },
};

const SOUND_RESOURCES: { [key in SoundName]: AudioResource } = {
    break: { bundle: 'game-assets', path: 'sound/sound_break' },
    changePic: { bundle: 'realm', path: 'sound/sound_change_pic' },
    move: { bundle: 'game-assets', path: 'sound/sound_move' },
    hammer: { bundle: 'game-assets', path: 'sound/sound_tool1' },
    magicWand: { bundle: 'game-assets', path: 'sound/sound_tool2' },
};

type ClipCallback = (clip: cc.AudioClip | null) => void;
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

    /** 切换并循环播放逻辑场景对应的背景音乐。重复请求同一首时不会重头播放。 */
    public playMusic(name: MusicName): void {
        if (this.currentMusic === name && cc.audioEngine.isMusicPlaying()) {
            this.applySettings();
            return;
        }
        this.currentMusic = name;
        const requestId = ++this.musicRequestId;
        this.loadClip(MUSIC_RESOURCES[name], (clip) => {
            if (!clip || requestId !== this.musicRequestId || this.currentMusic !== name) return;
            cc.audioEngine.stopMusic();
            this.applySettings();
            cc.audioEngine.playMusic(clip, LOOP_BACKGROUND_MUSIC);
        });
    }

    /** 音效只在设置允许时播放；加载期间关闭声音也不会补播。 */
    public playSound(name: SoundName): void {
        if (!gameSettings.soundEnabled || gameSettings.soundVolume <= 0) return;
        this.loadClip(SOUND_RESOURCES[name], (clip) => {
            if (!clip || !gameSettings.soundEnabled || gameSettings.soundVolume <= 0) return;
            cc.audioEngine.playEffect(clip, false);
        });
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

    private loadClip(resource: AudioResource, onComplete: ClipCallback): void {
        loadAudioClip(resource.bundle, resource.path, (error, clip) => {
            if (error || !clip) {
                cc.warn(`Audio failed to load: ${resource.bundle}/${resource.path}`, error);
                onComplete(null);
                return;
            }
            onComplete(clip);
        });
    }
}

export const audioManager = AudioManager.instance;
