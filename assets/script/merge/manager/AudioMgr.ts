// 背景音乐类型
export enum MusicType {

}

// 音效类型
export enum SoundType {
    MOVE_COIN = 'moveCoin',
    PRODUCE_COIN = 'produceCoin',
    MERGE_COIN = 'mergeCoin',
    ERROR = 'error',

}

// 震动类型
export enum SHAKE_TYPE {
    HEAVY = 'heavy',
    MEDIUM = 'medium',
    LIGHT = 'light',
    SUPER_HEAVY = '',
}

export default class AudioMgr {
    public static Instance: AudioMgr = new AudioMgr();

    private constructor() {
    }

    private soundClipCache = {

    };
    private audioIds = {};

    // 音量
    private musicVolume: number = null
    private soundVolume: number = null

    private curBgMusic: any = null;
    private canPlayMusic: boolean = true;
    private canPlaySound: boolean = true;//!GameConfig.DEBUG;

    // 当前播放的背景音乐的播放索引
    private musicId: number = -1;

    init() {
        cc.log("audioMgr init");
        this.curBgMusic = null;

        this.musicVolume = 0.2;
        this.soundVolume = 1.0;

        this.canPlayMusic = true;
        this.canPlaySound = true;
    }

    // 音乐
    public playBGM(music, force) {
        // 如果已经播放着就不播放了
        if (this.curBgMusic && this.curBgMusic == music) return;

        this.curBgMusic = music;
        if (this.canPlayMusic) {
            this.stopBGM();
            cc.resources.load(music, function (err, clip) {
                if (this.curBGMUrl == music) {
                    cc.audioEngine.stopAll();
                    this.bgmAudioID = cc.audioEngine.play(clip, true, this.bgmVolume);
                } else {
                    console.log("播放背景音乐失败:", err)
                }
            }.bind(this));
        }
    }

    public stopBGM() {
        cc.audioEngine.stop(this.musicId);
    }

    // /**
    //  * 同步加载声音资源
    //  * @param url 
    //  */
    // async preloadAudioClip(soundName: string) {
    //     if (!this._sfxEnabled) {
    //         return;
    //     }

    //     cc.resources.preload(`sounds/${soundName}`, cc.AudioClip)
    // }

    // 播放音效
    public playSound(soundType: string, volume: any = this.soundVolume, ext: string = ".mp3", loop: boolean = false, isFromNet: boolean = false, onStart?: Function) {
        if (this.canPlaySound) {
            const url = `sounds/${soundType}`;

            if (this.soundClipCache[`${url}`]) {
                const audioId = cc.audioEngine.play(this.soundClipCache[`${url}`], loop, volume);
                onStart && onStart();
            } else {
                if (isFromNet) {
                    if (!url.startsWith("https://")) {
                        onStart && onStart();
                        return;
                    }
                    cc.assetManager.loadRemote(url, { ext: ext }, (err, clip: cc.AudioClip) => {
                        if (!err) {
                            const audioId = cc.audioEngine.play(clip, loop, volume);
                            this.audioIds[url] = audioId;
                        } else {
                            console.error(err);
                        }
                        onStart && onStart();
                    });
                } else {
                    cc.resources.load(url, ((err, clip: cc.AudioClip) => {
                        if (!err) {
                            const audioId = cc.audioEngine.play(clip, loop, volume);
                            this.soundClipCache[`${url}`] = clip;
                            this.audioIds[url] = audioId;
                        } else {
                            console.error(err);
                        }
                        onStart && onStart();
                    }));
                }
            }
        } else {
            onStart && onStart();
        }
    }
    public stopSoundByUrl(url) {
        let audioId = this.audioIds[url];
        if (audioId != null) {
            cc.audioEngine.stop(audioId);
        }
    }

    public stopSound(audioId) {
        console.log("audioId", audioId);
        if (audioId != null) {
            cc.audioEngine.stop(audioId);
        }
    }

    // 暂停
    public pauseBGM() {
        if (this.musicId >= 0) {
            cc.audioEngine.pause(this.musicId);
        }
    }

    // 恢复
    public resumeBGM() {
        if (this.musicId >= 0) {
            cc.audioEngine.resume(this.musicId);
        }
    }

    // 卸载音效
    uncache(url) {
        const audioUrl: any = cc.url.raw(url);
        cc.audioEngine.uncache(audioUrl);
        this.soundClipCache[`${url}`] = undefined;
    }

    uncacheAll() {
        cc.audioEngine.uncacheAll();
        this.soundClipCache = {};
    }

    pauseAll() {
        console.log('Pause All Sound');
        cc.audioEngine.pauseAll();
    }

    resumeAll() {
        console.log('Resum All Sound');
        cc.audioEngine.resumeAll();
    }

    stopAll() {
        cc.audioEngine.stopAll();
    }

    clean() {
        this.stopAll();
        this.uncacheAll();
        this.curBgMusic = '';
        this.musicId = -1;
    }

    shake(type: SHAKE_TYPE) {
        if (!window['wx']) return;
        if (type === SHAKE_TYPE.SUPER_HEAVY) {
            wx.vibrateLong();
        } else {
            wx.vibrateShort({ type });
        }
    }
}
export const audioMgr = AudioMgr.Instance;