
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
        console.warn("TODO:临时屏蔽音效");
        return;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9BdWRpb01nci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTO0FBQ1QsSUFBWSxTQUVYO0FBRkQsV0FBWSxTQUFTO0FBRXJCLENBQUMsRUFGVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUVwQjtBQUVELE9BQU87QUFDUCxJQUFZLFNBWVg7QUFaRCxXQUFZLFNBQVM7SUFDakIsbUNBQXNCLENBQUE7SUFDdEIseUNBQTRCLENBQUE7SUFDNUIscUNBQXdCLENBQUE7SUFDeEIsNEJBQWUsQ0FBQTtJQUVmLHNDQUF5QixDQUFBO0lBQ3pCLHNDQUF5QixDQUFBO0lBQ3pCLG9DQUF1QixDQUFBO0lBRXZCLDJDQUE4QixDQUFBO0lBQzlCLDBDQUE2QixDQUFBO0FBQ2pDLENBQUMsRUFaVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQVlwQjtBQUVELE9BQU87QUFDUCxJQUFZLFVBS1g7QUFMRCxXQUFZLFVBQVU7SUFDbEIsNkJBQWUsQ0FBQTtJQUNmLCtCQUFpQixDQUFBO0lBQ2pCLDZCQUFlLENBQUE7SUFDZiw4QkFBZ0IsQ0FBQTtBQUNwQixDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7QUFFRDtJQUdJO1FBR1EsbUJBQWMsR0FBRyxFQUV4QixDQUFDO1FBQ00sYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUV0QixLQUFLO1FBQ0csZ0JBQVcsR0FBVyxJQUFJLENBQUE7UUFDMUIsZ0JBQVcsR0FBVyxJQUFJLENBQUE7UUFFMUIsa0JBQWEsR0FBUSxJQUFJLENBQUM7UUFDMUIsaUJBQVksR0FBWSxJQUFJLENBQUM7UUFDN0IsaUJBQVksR0FBWSxJQUFJLENBQUMsQ0FBQSxvQkFBb0I7UUFFekQsaUJBQWlCO1FBQ1QsWUFBTyxHQUFXLENBQUMsQ0FBQyxDQUFDO0lBaEI3QixDQUFDO0lBa0JELHVCQUFJLEdBQUo7UUFDSSxF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USxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVELDRCQUFTLEdBQVQ7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0IsRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQsMEJBQU8sR0FBUDtRQUNJLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELHdCQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRUQsd0JBQUssR0FBTCxVQUFNLElBQWdCO1FBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTztRQUMxQixJQUFJLElBQUksS0FBSyxVQUFVLENBQUMsV0FBVyxFQUFFO1lBQ2pDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNwQjthQUFNO1lBQ0gsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksTUFBQSxFQUFFLENBQUMsQ0FBQztTQUM3QjtJQUNMLENBQUM7SUFqTGEsaUJBQVEsR0FBYSxJQUFJLFFBQVEsRUFBRSxDQUFDO0lBa0x0RCxlQUFDO0NBbkxELEFBbUxDLElBQUE7a0JBbkxvQixRQUFRO0FBb0xoQixRQUFBLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLy8g6IOM5pmv6Z+z5LmQ57G75Z6LXG5leHBvcnQgZW51bSBNdXNpY1R5cGUge1xuXG59XG5cbi8vIOmfs+aViOexu+Wei1xuZXhwb3J0IGVudW0gU291bmRUeXBlIHtcbiAgICBNT1ZFX0NPSU4gPSAnbW92ZUNvaW4nLFxuICAgIFBST0RVQ0VfQ09JTiA9ICdwcm9kdWNlQ29pbicsXG4gICAgTUVSR0VfQ09JTiA9ICdtZXJnZUNvaW4nLFxuICAgIEVSUk9SID0gJ2Vycm9yJyxcblxuICAgIFpZWF9TVEFSVCA9ICdzb3VuZF9zdGFydCcsXG4gICAgWllYX0VORCA9ICdzb3VuZF9lbmRkaW5nJyxcbiAgICBaWVhfRFJPUCA9ICdzb3VuZF9kcm9wJyxcblxuICAgIFpZWF9NVVNJQ19NQUlOID0gJ211c2ljX21haW4xJyxcbiAgICBaWVhfTVVTSUNfR0FNRSA9ICdtdXNpY19nYW1lJyxcbn1cblxuLy8g6ZyH5Yqo57G75Z6LXG5leHBvcnQgZW51bSBTSEFLRV9UWVBFIHtcbiAgICBIRUFWWSA9ICdoZWF2eScsXG4gICAgTUVESVVNID0gJ21lZGl1bScsXG4gICAgTElHSFQgPSAnbGlnaHQnLFxuICAgIFNVUEVSX0hFQVZZID0gJycsXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1ZGlvTWdyIHtcbiAgICBwdWJsaWMgc3RhdGljIEluc3RhbmNlOiBBdWRpb01nciA9IG5ldyBBdWRpb01ncigpO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNvdW5kQ2xpcENhY2hlID0ge1xuXG4gICAgfTtcbiAgICBwcml2YXRlIGF1ZGlvSWRzID0ge307XG5cbiAgICAvLyDpn7Pph49cbiAgICBwcml2YXRlIG11c2ljVm9sdW1lOiBudW1iZXIgPSBudWxsXG4gICAgcHJpdmF0ZSBzb3VuZFZvbHVtZTogbnVtYmVyID0gbnVsbFxuXG4gICAgcHJpdmF0ZSBjdXJCZ011c2ljVXJsOiBhbnkgPSBudWxsO1xuICAgIHByaXZhdGUgY2FuUGxheU11c2ljOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIGNhblBsYXlTb3VuZDogYm9vbGVhbiA9IHRydWU7Ly8hR2FtZUNvbmZpZy5ERUJVRztcblxuICAgIC8vIOW9k+WJjeaSreaUvueahOiDjOaZr+mfs+S5kOeahOaSreaUvue0ouW8lVxuICAgIHByaXZhdGUgbXVzaWNJZDogbnVtYmVyID0gLTE7XG5cbiAgICBpbml0KCkge1xuICAgICAgICBjYy5sb2coXCJhdWRpb01nciBpbml0XCIpO1xuICAgICAgICB0aGlzLmN1ckJnTXVzaWNVcmwgPSBudWxsO1xuXG4gICAgICAgIHRoaXMubXVzaWNWb2x1bWUgPSAwLjI7XG4gICAgICAgIHRoaXMuc291bmRWb2x1bWUgPSAxLjA7XG5cbiAgICAgICAgdGhpcy5jYW5QbGF5TXVzaWMgPSB0cnVlO1xuICAgICAgICB0aGlzLmNhblBsYXlTb3VuZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8g6Z+z5LmQXG4gICAgcHVibGljIHBsYXlCR00odXJsKSB7XG4gICAgICAgIC8vIOWmguaenOW3sue7j+aSreaUvuedgOWwseS4jeaSreaUvuS6hlxuICAgICAgICBjb25zb2xlLndhcm4oXCJUT0RPOuS4tOaXtuWxj+iUvemfs+aViFwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5jdXJCZ011c2ljVXJsICYmIHRoaXMuY3VyQmdNdXNpY1VybCA9PSB1cmwpIHJldHVybjtcblxuICAgICAgICB0aGlzLmN1ckJnTXVzaWNVcmwgPSB1cmw7XG4gICAgICAgIGlmICh0aGlzLmNhblBsYXlNdXNpYykge1xuICAgICAgICAgICAgdGhpcy5zdG9wQkdNKCk7XG4gICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChgc291bmRzLyR7dXJsfWAsIChlcnIsIGNsaXA6IGNjLkF1ZGlvQ2xpcCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1ckJnTXVzaWNVcmwgPT0gdXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3BBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tdXNpY0lkID0gY2MuYXVkaW9FbmdpbmUucGxheShjbGlwLCB0cnVlLCB0aGlzLm11c2ljVm9sdW1lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuaSreaUvuiDjOaZr+mfs+S5kOWksei0pTpcIiwgZXJyKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3BCR00oKSB7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3AodGhpcy5tdXNpY0lkKTtcbiAgICB9XG5cbiAgICAvLyAvKipcbiAgICAvLyAgKiDlkIzmraXliqDovb3lo7Dpn7PotYTmupBcbiAgICAvLyAgKiBAcGFyYW0gdXJsIFxuICAgIC8vICAqL1xuICAgIC8vIGFzeW5jIHByZWxvYWRBdWRpb0NsaXAoc291bmROYW1lOiBzdHJpbmcpIHtcbiAgICAvLyAgICAgaWYgKCF0aGlzLl9zZnhFbmFibGVkKSB7XG4gICAgLy8gICAgICAgICByZXR1cm47XG4gICAgLy8gICAgIH1cblxuICAgIC8vICAgICBjYy5yZXNvdXJjZXMucHJlbG9hZChgc291bmRzLyR7c291bmROYW1lfWAsIGNjLkF1ZGlvQ2xpcClcbiAgICAvLyB9XG5cbiAgICAvLyDmkq3mlL7pn7PmlYhcbiAgICBwdWJsaWMgcGxheVNvdW5kKHNvdW5kVHlwZTogc3RyaW5nLCB2b2x1bWU6IGFueSA9IHRoaXMuc291bmRWb2x1bWUsIGV4dDogc3RyaW5nID0gXCIubXAzXCIsIGxvb3A6IGJvb2xlYW4gPSBmYWxzZSwgaXNGcm9tTmV0OiBib29sZWFuID0gZmFsc2UsIG9uU3RhcnQ/OiBGdW5jdGlvbikge1xuICAgICAgICBpZiAodGhpcy5jYW5QbGF5U291bmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGBzb3VuZHMvJHtzb3VuZFR5cGV9YDtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc291bmRDbGlwQ2FjaGVbYCR7dXJsfWBdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXVkaW9JZCA9IGNjLmF1ZGlvRW5naW5lLnBsYXkodGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0sIGxvb3AsIHZvbHVtZSk7XG4gICAgICAgICAgICAgICAgb25TdGFydCAmJiBvblN0YXJ0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpc0Zyb21OZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1cmwuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYy5hc3NldE1hbmFnZXIubG9hZFJlbW90ZSh1cmwsIHsgZXh0OiBleHQgfSwgKGVyciwgY2xpcDogY2MuQXVkaW9DbGlwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF1ZGlvSWQgPSBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIGxvb3AsIHZvbHVtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdWRpb0lkc1t1cmxdID0gYXVkaW9JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25TdGFydCAmJiBvblN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKHVybCwgKChlcnIsIGNsaXA6IGNjLkF1ZGlvQ2xpcCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdWRpb0lkID0gY2MuYXVkaW9FbmdpbmUucGxheShjbGlwLCBsb29wLCB2b2x1bWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc291bmRDbGlwQ2FjaGVbYCR7dXJsfWBdID0gY2xpcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvSWRzW3VybF0gPSBhdWRpb0lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBzdG9wU291bmRCeVVybCh1cmwpIHtcbiAgICAgICAgbGV0IGF1ZGlvSWQgPSB0aGlzLmF1ZGlvSWRzW3VybF07XG4gICAgICAgIGlmIChhdWRpb0lkICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3AoYXVkaW9JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcFNvdW5kKGF1ZGlvSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJhdWRpb0lkXCIsIGF1ZGlvSWQpO1xuICAgICAgICBpZiAoYXVkaW9JZCAhPSBudWxsKSB7XG4gICAgICAgICAgICBjYy5hdWRpb0VuZ2luZS5zdG9wKGF1ZGlvSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5pqC5YGcXG4gICAgcHVibGljIHBhdXNlQkdNKCkge1xuICAgICAgICBpZiAodGhpcy5tdXNpY0lkID49IDApIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBhdXNlKHRoaXMubXVzaWNJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmgaLlpI1cbiAgICBwdWJsaWMgcmVzdW1lQkdNKCkge1xuICAgICAgICBpZiAodGhpcy5tdXNpY0lkID49IDApIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnJlc3VtZSh0aGlzLm11c2ljSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Y246L296Z+z5pWIXG4gICAgdW5jYWNoZSh1cmwpIHtcbiAgICAgICAgY29uc3QgYXVkaW9Vcmw6IGFueSA9IGNjLnVybC5yYXcodXJsKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUudW5jYWNoZShhdWRpb1VybCk7XG4gICAgICAgIHRoaXMuc291bmRDbGlwQ2FjaGVbYCR7dXJsfWBdID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHVuY2FjaGVBbGwoKSB7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnVuY2FjaGVBbGwoKTtcbiAgICAgICAgdGhpcy5zb3VuZENsaXBDYWNoZSA9IHt9O1xuICAgIH1cblxuICAgIHBhdXNlQWxsKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnUGF1c2UgQWxsIFNvdW5kJyk7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBhdXNlQWxsKCk7XG4gICAgfVxuXG4gICAgcmVzdW1lQWxsKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnUmVzdW0gQWxsIFNvdW5kJyk7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnJlc3VtZUFsbCgpO1xuICAgIH1cblxuICAgIHN0b3BBbGwoKSB7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3BBbGwoKTtcbiAgICB9XG5cbiAgICBjbGVhbigpIHtcbiAgICAgICAgdGhpcy5zdG9wQWxsKCk7XG4gICAgICAgIHRoaXMudW5jYWNoZUFsbCgpO1xuICAgICAgICB0aGlzLmN1ckJnTXVzaWNVcmwgPSAnJztcbiAgICAgICAgdGhpcy5tdXNpY0lkID0gLTE7XG4gICAgfVxuXG4gICAgc2hha2UodHlwZTogU0hBS0VfVFlQRSkge1xuICAgICAgICBpZiAoIXdpbmRvd1snd3gnXSkgcmV0dXJuO1xuICAgICAgICBpZiAodHlwZSA9PT0gU0hBS0VfVFlQRS5TVVBFUl9IRUFWWSkge1xuICAgICAgICAgICAgd3gudmlicmF0ZUxvbmcoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHd4LnZpYnJhdGVTaG9ydCh7IHR5cGUgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY29uc3QgYXVkaW9NZ3IgPSBBdWRpb01nci5JbnN0YW5jZTsiXX0=