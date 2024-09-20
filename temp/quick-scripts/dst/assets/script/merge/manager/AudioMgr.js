
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/script/merge/manager/AudioMgr.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b545bFTIb1JV5LuLuiz55fk', 'AudioMgr');
// script/merge/manager/AudioMgr.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioMgr = exports.SHAKE_TYPE = exports.SoundType = exports.MusicType = void 0;
// 背景音乐类型
var MusicType;
(function (MusicType) {
})(MusicType = exports.MusicType || (exports.MusicType = {}));
// 音效类型
var SoundType;
(function (SoundType) {
    SoundType["MOVE_COIN"] = "moveCoin";
    SoundType["PRODUCE_COIN"] = "produceCoin";
    SoundType["MERGE_COIN"] = "mergeCoin";
    SoundType["ERROR"] = "error";
    SoundType["ZYX_START"] = "sound_start";
    SoundType["ZYX_END"] = "sound_endding";
    SoundType["ZYX_DROP"] = "sound_drop";
    SoundType["ZYX_MUSIC_MAIN"] = "music_main1";
    SoundType["ZYX_MUSIC_GAME"] = "music_game";
})(SoundType = exports.SoundType || (exports.SoundType = {}));
// 震动类型
var SHAKE_TYPE;
(function (SHAKE_TYPE) {
    SHAKE_TYPE["HEAVY"] = "heavy";
    SHAKE_TYPE["MEDIUM"] = "medium";
    SHAKE_TYPE["LIGHT"] = "light";
    SHAKE_TYPE["SUPER_HEAVY"] = "";
})(SHAKE_TYPE = exports.SHAKE_TYPE || (exports.SHAKE_TYPE = {}));
var AudioMgr = /** @class */ (function () {
    function AudioMgr() {
        this.soundClipCache = {};
        this.audioIds = {};
        // 音量
        this.musicVolume = null;
        this.soundVolume = null;
        this.curBgMusicUrl = null;
        this.canPlayMusic = true;
        this.canPlaySound = true; //!GameConfig.DEBUG;
        // 当前播放的背景音乐的播放索引
        this.musicId = -1;
    }
    AudioMgr.prototype.init = function () {
        cc.log("audioMgr init");
        this.curBgMusicUrl = null;
        this.musicVolume = 0.2;
        this.soundVolume = 1.0;
        this.canPlayMusic = true;
        this.canPlaySound = true;
    };
    // 音乐
    AudioMgr.prototype.playBGM = function (url) {
        var _this = this;
        // 如果已经播放着就不播放了
        if (this.curBgMusicUrl && this.curBgMusicUrl == url)
            return;
        this.curBgMusicUrl = url;
        if (this.canPlayMusic) {
            this.stopBGM();
            cc.resources.load("sounds/" + url, function (err, clip) {
                if (_this.curBgMusicUrl == url) {
                    cc.audioEngine.stopAll();
                    _this.musicId = cc.audioEngine.play(clip, true, _this.musicVolume);
                }
                else {
                    console.log("播放背景音乐失败:", err);
                }
            });
        }
    };
    AudioMgr.prototype.stopBGM = function () {
        cc.audioEngine.stop(this.musicId);
    };
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
    AudioMgr.prototype.playSound = function (soundType, volume, ext, loop, isFromNet, onStart) {
        var _this = this;
        if (volume === void 0) { volume = this.soundVolume; }
        if (ext === void 0) { ext = ".mp3"; }
        if (loop === void 0) { loop = false; }
        if (isFromNet === void 0) { isFromNet = false; }
        if (this.canPlaySound) {
            var url_1 = "sounds/" + soundType;
            if (this.soundClipCache["" + url_1]) {
                var audioId = cc.audioEngine.play(this.soundClipCache["" + url_1], loop, volume);
                onStart && onStart();
            }
            else {
                if (isFromNet) {
                    if (!url_1.startsWith("https://")) {
                        onStart && onStart();
                        return;
                    }
                    cc.assetManager.loadRemote(url_1, { ext: ext }, function (err, clip) {
                        if (!err) {
                            var audioId = cc.audioEngine.play(clip, loop, volume);
                            _this.audioIds[url_1] = audioId;
                        }
                        else {
                            console.error(err);
                        }
                        onStart && onStart();
                    });
                }
                else {
                    cc.resources.load(url_1, (function (err, clip) {
                        if (!err) {
                            var audioId = cc.audioEngine.play(clip, loop, volume);
                            _this.soundClipCache["" + url_1] = clip;
                            _this.audioIds[url_1] = audioId;
                        }
                        else {
                            console.error(err);
                        }
                        onStart && onStart();
                    }));
                }
            }
        }
        else {
            onStart && onStart();
        }
    };
    AudioMgr.prototype.stopSoundByUrl = function (url) {
        var audioId = this.audioIds[url];
        if (audioId != null) {
            cc.audioEngine.stop(audioId);
        }
    };
    AudioMgr.prototype.stopSound = function (audioId) {
        console.log("audioId", audioId);
        if (audioId != null) {
            cc.audioEngine.stop(audioId);
        }
    };
    // 暂停
    AudioMgr.prototype.pauseBGM = function () {
        if (this.musicId >= 0) {
            cc.audioEngine.pause(this.musicId);
        }
    };
    // 恢复
    AudioMgr.prototype.resumeBGM = function () {
        if (this.musicId >= 0) {
            cc.audioEngine.resume(this.musicId);
        }
    };
    // 卸载音效
    AudioMgr.prototype.uncache = function (url) {
        var audioUrl = cc.url.raw(url);
        cc.audioEngine.uncache(audioUrl);
        this.soundClipCache["" + url] = undefined;
    };
    AudioMgr.prototype.uncacheAll = function () {
        cc.audioEngine.uncacheAll();
        this.soundClipCache = {};
    };
    AudioMgr.prototype.pauseAll = function () {
        console.log('Pause All Sound');
        cc.audioEngine.pauseAll();
    };
    AudioMgr.prototype.resumeAll = function () {
        console.log('Resum All Sound');
        cc.audioEngine.resumeAll();
    };
    AudioMgr.prototype.stopAll = function () {
        cc.audioEngine.stopAll();
    };
    AudioMgr.prototype.clean = function () {
        this.stopAll();
        this.uncacheAll();
        this.curBgMusicUrl = '';
        this.musicId = -1;
    };
    AudioMgr.prototype.shake = function (type) {
        if (!window['wx'])
            return;
        if (type === SHAKE_TYPE.SUPER_HEAVY) {
            wx.vibrateLong();
        }
        else {
            wx.vibrateShort({ type: type });
        }
    };
    AudioMgr.Instance = new AudioMgr();
    return AudioMgr;
}());
exports.default = AudioMgr;
exports.audioMgr = AudioMgr.Instance;

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9BdWRpb01nci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTO0FBQ1QsSUFBWSxTQUVYO0FBRkQsV0FBWSxTQUFTO0FBRXJCLENBQUMsRUFGVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUVwQjtBQUVELE9BQU87QUFDUCxJQUFZLFNBWVg7QUFaRCxXQUFZLFNBQVM7SUFDakIsbUNBQXNCLENBQUE7SUFDdEIseUNBQTRCLENBQUE7SUFDNUIscUNBQXdCLENBQUE7SUFDeEIsNEJBQWUsQ0FBQTtJQUVmLHNDQUF5QixDQUFBO0lBQ3pCLHNDQUF5QixDQUFBO0lBQ3pCLG9DQUF1QixDQUFBO0lBRXZCLDJDQUE4QixDQUFBO0lBQzlCLDBDQUE2QixDQUFBO0FBQ2pDLENBQUMsRUFaVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQVlwQjtBQUVELE9BQU87QUFDUCxJQUFZLFVBS1g7QUFMRCxXQUFZLFVBQVU7SUFDbEIsNkJBQWUsQ0FBQTtJQUNmLCtCQUFpQixDQUFBO0lBQ2pCLDZCQUFlLENBQUE7SUFDZiw4QkFBZ0IsQ0FBQTtBQUNwQixDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7QUFFRDtJQUdJO1FBR1EsbUJBQWMsR0FBRyxFQUV4QixDQUFDO1FBQ00sYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUV0QixLQUFLO1FBQ0csZ0JBQVcsR0FBVyxJQUFJLENBQUE7UUFDMUIsZ0JBQVcsR0FBVyxJQUFJLENBQUE7UUFFMUIsa0JBQWEsR0FBUSxJQUFJLENBQUM7UUFDMUIsaUJBQVksR0FBWSxJQUFJLENBQUM7UUFDN0IsaUJBQVksR0FBWSxJQUFJLENBQUMsQ0FBQSxvQkFBb0I7UUFFekQsaUJBQWlCO1FBQ1QsWUFBTyxHQUFXLENBQUMsQ0FBQyxDQUFDO0lBaEI3QixDQUFDO0lBa0JELHVCQUFJLEdBQUo7UUFDSSxF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QyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvQixFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRCwwQkFBTyxHQUFQO1FBQ0ksRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsd0JBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCx3QkFBSyxHQUFMLFVBQU0sSUFBZ0I7UUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPO1FBQzFCLElBQUksSUFBSSxLQUFLLFVBQVUsQ0FBQyxXQUFXLEVBQUU7WUFDakMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ3BCO2FBQU07WUFDSCxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxNQUFBLEVBQUUsQ0FBQyxDQUFDO1NBQzdCO0lBQ0wsQ0FBQztJQS9LYSxpQkFBUSxHQUFhLElBQUksUUFBUSxFQUFFLENBQUM7SUFnTHRELGVBQUM7Q0FqTEQsQUFpTEMsSUFBQTtrQkFqTG9CLFFBQVE7QUFrTGhCLFFBQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDog4zmma/pn7PkuZDnsbvlnotcbmV4cG9ydCBlbnVtIE11c2ljVHlwZSB7XG5cbn1cblxuLy8g6Z+z5pWI57G75Z6LXG5leHBvcnQgZW51bSBTb3VuZFR5cGUge1xuICAgIE1PVkVfQ09JTiA9ICdtb3ZlQ29pbicsXG4gICAgUFJPRFVDRV9DT0lOID0gJ3Byb2R1Y2VDb2luJyxcbiAgICBNRVJHRV9DT0lOID0gJ21lcmdlQ29pbicsXG4gICAgRVJST1IgPSAnZXJyb3InLFxuXG4gICAgWllYX1NUQVJUID0gJ3NvdW5kX3N0YXJ0JyxcbiAgICBaWVhfRU5EID0gJ3NvdW5kX2VuZGRpbmcnLFxuICAgIFpZWF9EUk9QID0gJ3NvdW5kX2Ryb3AnLFxuXG4gICAgWllYX01VU0lDX01BSU4gPSAnbXVzaWNfbWFpbjEnLFxuICAgIFpZWF9NVVNJQ19HQU1FID0gJ211c2ljX2dhbWUnLFxufVxuXG4vLyDpnIfliqjnsbvlnotcbmV4cG9ydCBlbnVtIFNIQUtFX1RZUEUge1xuICAgIEhFQVZZID0gJ2hlYXZ5JyxcbiAgICBNRURJVU0gPSAnbWVkaXVtJyxcbiAgICBMSUdIVCA9ICdsaWdodCcsXG4gICAgU1VQRVJfSEVBVlkgPSAnJyxcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXVkaW9NZ3Ige1xuICAgIHB1YmxpYyBzdGF0aWMgSW5zdGFuY2U6IEF1ZGlvTWdyID0gbmV3IEF1ZGlvTWdyKCk7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuICAgIHByaXZhdGUgc291bmRDbGlwQ2FjaGUgPSB7XG5cbiAgICB9O1xuICAgIHByaXZhdGUgYXVkaW9JZHMgPSB7fTtcblxuICAgIC8vIOmfs+mHj1xuICAgIHByaXZhdGUgbXVzaWNWb2x1bWU6IG51bWJlciA9IG51bGxcbiAgICBwcml2YXRlIHNvdW5kVm9sdW1lOiBudW1iZXIgPSBudWxsXG5cbiAgICBwcml2YXRlIGN1ckJnTXVzaWNVcmw6IGFueSA9IG51bGw7XG4gICAgcHJpdmF0ZSBjYW5QbGF5TXVzaWM6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgY2FuUGxheVNvdW5kOiBib29sZWFuID0gdHJ1ZTsvLyFHYW1lQ29uZmlnLkRFQlVHO1xuXG4gICAgLy8g5b2T5YmN5pKt5pS+55qE6IOM5pmv6Z+z5LmQ55qE5pKt5pS+57Si5byVXG4gICAgcHJpdmF0ZSBtdXNpY0lkOiBudW1iZXIgPSAtMTtcblxuICAgIGluaXQoKSB7XG4gICAgICAgIGNjLmxvZyhcImF1ZGlvTWdyIGluaXRcIik7XG4gICAgICAgIHRoaXMuY3VyQmdNdXNpY1VybCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5tdXNpY1ZvbHVtZSA9IDAuMjtcbiAgICAgICAgdGhpcy5zb3VuZFZvbHVtZSA9IDEuMDtcblxuICAgICAgICB0aGlzLmNhblBsYXlNdXNpYyA9IHRydWU7XG4gICAgICAgIHRoaXMuY2FuUGxheVNvdW5kID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyDpn7PkuZBcbiAgICBwdWJsaWMgcGxheUJHTSh1cmwpIHtcbiAgICAgICAgLy8g5aaC5p6c5bey57uP5pKt5pS+552A5bCx5LiN5pKt5pS+5LqGXG4gICAgICAgIGlmICh0aGlzLmN1ckJnTXVzaWNVcmwgJiYgdGhpcy5jdXJCZ011c2ljVXJsID09IHVybCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuY3VyQmdNdXNpY1VybCA9IHVybDtcbiAgICAgICAgaWYgKHRoaXMuY2FuUGxheU11c2ljKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BCR00oKTtcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKGBzb3VuZHMvJHt1cmx9YCwgKGVyciwgY2xpcDogY2MuQXVkaW9DbGlwKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VyQmdNdXNpY1VybCA9PSB1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm11c2ljSWQgPSBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIHRydWUsIHRoaXMubXVzaWNWb2x1bWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5pKt5pS+6IOM5pmv6Z+z5LmQ5aSx6LSlOlwiLCBlcnIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcEJHTSgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcCh0aGlzLm11c2ljSWQpO1xuICAgIH1cblxuICAgIC8vIC8qKlxuICAgIC8vICAqIOWQjOatpeWKoOi9veWjsOmfs+i1hOa6kFxuICAgIC8vICAqIEBwYXJhbSB1cmwgXG4gICAgLy8gICovXG4gICAgLy8gYXN5bmMgcHJlbG9hZEF1ZGlvQ2xpcChzb3VuZE5hbWU6IHN0cmluZykge1xuICAgIC8vICAgICBpZiAoIXRoaXMuX3NmeEVuYWJsZWQpIHtcbiAgICAvLyAgICAgICAgIHJldHVybjtcbiAgICAvLyAgICAgfVxuXG4gICAgLy8gICAgIGNjLnJlc291cmNlcy5wcmVsb2FkKGBzb3VuZHMvJHtzb3VuZE5hbWV9YCwgY2MuQXVkaW9DbGlwKVxuICAgIC8vIH1cblxuICAgIC8vIOaSreaUvumfs+aViFxuICAgIHB1YmxpYyBwbGF5U291bmQoc291bmRUeXBlOiBzdHJpbmcsIHZvbHVtZTogYW55ID0gdGhpcy5zb3VuZFZvbHVtZSwgZXh0OiBzdHJpbmcgPSBcIi5tcDNcIiwgbG9vcDogYm9vbGVhbiA9IGZhbHNlLCBpc0Zyb21OZXQ6IGJvb2xlYW4gPSBmYWxzZSwgb25TdGFydD86IEZ1bmN0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmNhblBsYXlTb3VuZCkge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYHNvdW5kcy8ke3NvdW5kVHlwZX1gO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdWRpb0lkID0gY2MuYXVkaW9FbmdpbmUucGxheSh0aGlzLnNvdW5kQ2xpcENhY2hlW2Ake3VybH1gXSwgbG9vcCwgdm9sdW1lKTtcbiAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRnJvbU5ldCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXVybC5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNjLmFzc2V0TWFuYWdlci5sb2FkUmVtb3RlKHVybCwgeyBleHQ6IGV4dCB9LCAoZXJyLCBjbGlwOiBjYy5BdWRpb0NsaXApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXVkaW9JZCA9IGNjLmF1ZGlvRW5naW5lLnBsYXkoY2xpcCwgbG9vcCwgdm9sdW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvSWRzW3VybF0gPSBhdWRpb0lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQodXJsLCAoKGVyciwgY2xpcDogY2MuQXVkaW9DbGlwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF1ZGlvSWQgPSBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIGxvb3AsIHZvbHVtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0gPSBjbGlwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9JZHNbdXJsXSA9IGF1ZGlvSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25TdGFydCAmJiBvblN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHN0b3BTb3VuZEJ5VXJsKHVybCkge1xuICAgICAgICBsZXQgYXVkaW9JZCA9IHRoaXMuYXVkaW9JZHNbdXJsXTtcbiAgICAgICAgaWYgKGF1ZGlvSWQgIT0gbnVsbCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcChhdWRpb0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wU291bmQoYXVkaW9JZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImF1ZGlvSWRcIiwgYXVkaW9JZCk7XG4gICAgICAgIGlmIChhdWRpb0lkICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3AoYXVkaW9JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmmoLlgZxcbiAgICBwdWJsaWMgcGF1c2VCR00oKSB7XG4gICAgICAgIGlmICh0aGlzLm11c2ljSWQgPj0gMCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGF1c2UodGhpcy5tdXNpY0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOaBouWkjVxuICAgIHB1YmxpYyByZXN1bWVCR00oKSB7XG4gICAgICAgIGlmICh0aGlzLm11c2ljSWQgPj0gMCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucmVzdW1lKHRoaXMubXVzaWNJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDljbjovb3pn7PmlYhcbiAgICB1bmNhY2hlKHVybCkge1xuICAgICAgICBjb25zdCBhdWRpb1VybDogYW55ID0gY2MudXJsLnJhdyh1cmwpO1xuICAgICAgICBjYy5hdWRpb0VuZ2luZS51bmNhY2hlKGF1ZGlvVXJsKTtcbiAgICAgICAgdGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0gPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdW5jYWNoZUFsbCgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUudW5jYWNoZUFsbCgpO1xuICAgICAgICB0aGlzLnNvdW5kQ2xpcENhY2hlID0ge307XG4gICAgfVxuXG4gICAgcGF1c2VBbGwoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQYXVzZSBBbGwgU291bmQnKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGF1c2VBbGwoKTtcbiAgICB9XG5cbiAgICByZXN1bWVBbGwoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSZXN1bSBBbGwgU291bmQnKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucmVzdW1lQWxsKCk7XG4gICAgfVxuXG4gICAgc3RvcEFsbCgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xuICAgIH1cblxuICAgIGNsZWFuKCkge1xuICAgICAgICB0aGlzLnN0b3BBbGwoKTtcbiAgICAgICAgdGhpcy51bmNhY2hlQWxsKCk7XG4gICAgICAgIHRoaXMuY3VyQmdNdXNpY1VybCA9ICcnO1xuICAgICAgICB0aGlzLm11c2ljSWQgPSAtMTtcbiAgICB9XG5cbiAgICBzaGFrZSh0eXBlOiBTSEFLRV9UWVBFKSB7XG4gICAgICAgIGlmICghd2luZG93Wyd3eCddKSByZXR1cm47XG4gICAgICAgIGlmICh0eXBlID09PSBTSEFLRV9UWVBFLlNVUEVSX0hFQVZZKSB7XG4gICAgICAgICAgICB3eC52aWJyYXRlTG9uZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd3gudmlicmF0ZVNob3J0KHsgdHlwZSB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBhdWRpb01nciA9IEF1ZGlvTWdyLkluc3RhbmNlOyJdfQ==