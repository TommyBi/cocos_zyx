
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
exports.audioMgr = exports.SoundType = exports.MusicType = void 0;
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
})(SoundType = exports.SoundType || (exports.SoundType = {}));
var AudioMgr = /** @class */ (function () {
    function AudioMgr() {
        this.soundClipCache = {};
        this.audioIds = {};
        // 音量
        this.musicVolume = null;
        this.soundVolume = null;
        this.curBgMusic = null;
        this.canPlayMusic = true;
        this.canPlaySound = true; //!GameConfig.DEBUG;
        // 当前播放的背景音乐的播放索引
        this.musicId = -1;
    }
    AudioMgr.prototype.init = function () {
        cc.log("audioMgr init");
        this.curBgMusic = null;
        this.musicVolume = 0.2;
        this.soundVolume = 1.0;
        this.canPlayMusic = true;
        this.canPlaySound = true;
    };
    // 音乐
    AudioMgr.prototype.playBGM = function (music, force) {
        // 如果已经播放着就不播放了
        if (this.curBgMusic && this.curBgMusic == music)
            return;
        this.curBgMusic = music;
        if (this.canPlayMusic) {
            this.stopBGM();
            cc.resources.load(music, function (err, clip) {
                if (this.curBGMUrl == music) {
                    cc.audioEngine.stopAll();
                    this.bgmAudioID = cc.audioEngine.play(clip, true, this.bgmVolume);
                }
                else {
                    console.log("播放背景音乐失败:", err);
                }
            }.bind(this));
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
        this.curBgMusic = '';
        this.musicId = -1;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9BdWRpb01nci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTO0FBQ1QsSUFBWSxTQUVYO0FBRkQsV0FBWSxTQUFTO0FBRXJCLENBQUMsRUFGVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUVwQjtBQUVELE9BQU87QUFDUCxJQUFZLFNBTVg7QUFORCxXQUFZLFNBQVM7SUFDakIsbUNBQXNCLENBQUE7SUFDdEIseUNBQTRCLENBQUE7SUFDNUIscUNBQXdCLENBQUE7SUFDeEIsNEJBQWUsQ0FBQTtBQUVuQixDQUFDLEVBTlcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFNcEI7QUFFRDtJQUdJO1FBR1EsbUJBQWMsR0FBRyxFQUV4QixDQUFDO1FBQ00sYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUV0QixLQUFLO1FBQ0csZ0JBQVcsR0FBVyxJQUFJLENBQUE7UUFDMUIsZ0JBQVcsR0FBVyxJQUFJLENBQUE7UUFFMUIsZUFBVSxHQUFRLElBQUksQ0FBQztRQUN2QixpQkFBWSxHQUFZLElBQUksQ0FBQztRQUM3QixpQkFBWSxHQUFZLElBQUksQ0FBQyxDQUFBLG9CQUFvQjtRQUV6RCxpQkFBaUI7UUFDVCxZQUFPLEdBQVcsQ0FBQyxDQUFDLENBQUM7SUFoQjdCLENBQUM7SUFrQkQsdUJBQUksR0FBSjtRQUNJLEVBQUUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFFdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFFdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUVELEtBQUs7SUFDRSwwQkFBTyxH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LElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQXRLYSxpQkFBUSxHQUFhLElBQUksUUFBUSxFQUFFLENBQUM7SUF1S3RELGVBQUM7Q0F4S0QsQUF3S0MsSUFBQTtrQkF4S29CLFFBQVE7QUF5S2hCLFFBQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDog4zmma/pn7PkuZDnsbvlnotcbmV4cG9ydCBlbnVtIE11c2ljVHlwZSB7XG5cbn1cblxuLy8g6Z+z5pWI57G75Z6LXG5leHBvcnQgZW51bSBTb3VuZFR5cGUge1xuICAgIE1PVkVfQ09JTiA9ICdtb3ZlQ29pbicsXG4gICAgUFJPRFVDRV9DT0lOID0gJ3Byb2R1Y2VDb2luJyxcbiAgICBNRVJHRV9DT0lOID0gJ21lcmdlQ29pbicsXG4gICAgRVJST1IgPSAnZXJyb3InLFxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1ZGlvTWdyIHtcbiAgICBwdWJsaWMgc3RhdGljIEluc3RhbmNlOiBBdWRpb01nciA9IG5ldyBBdWRpb01ncigpO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNvdW5kQ2xpcENhY2hlID0ge1xuXG4gICAgfTtcbiAgICBwcml2YXRlIGF1ZGlvSWRzID0ge307XG5cbiAgICAvLyDpn7Pph49cbiAgICBwcml2YXRlIG11c2ljVm9sdW1lOiBudW1iZXIgPSBudWxsXG4gICAgcHJpdmF0ZSBzb3VuZFZvbHVtZTogbnVtYmVyID0gbnVsbFxuXG4gICAgcHJpdmF0ZSBjdXJCZ011c2ljOiBhbnkgPSBudWxsO1xuICAgIHByaXZhdGUgY2FuUGxheU11c2ljOiBib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIGNhblBsYXlTb3VuZDogYm9vbGVhbiA9IHRydWU7Ly8hR2FtZUNvbmZpZy5ERUJVRztcblxuICAgIC8vIOW9k+WJjeaSreaUvueahOiDjOaZr+mfs+S5kOeahOaSreaUvue0ouW8lVxuICAgIHByaXZhdGUgbXVzaWNJZDogbnVtYmVyID0gLTE7XG5cbiAgICBpbml0KCkge1xuICAgICAgICBjYy5sb2coXCJhdWRpb01nciBpbml0XCIpO1xuICAgICAgICB0aGlzLmN1ckJnTXVzaWMgPSBudWxsO1xuXG4gICAgICAgIHRoaXMubXVzaWNWb2x1bWUgPSAwLjI7XG4gICAgICAgIHRoaXMuc291bmRWb2x1bWUgPSAxLjA7XG5cbiAgICAgICAgdGhpcy5jYW5QbGF5TXVzaWMgPSB0cnVlO1xuICAgICAgICB0aGlzLmNhblBsYXlTb3VuZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8g6Z+z5LmQXG4gICAgcHVibGljIHBsYXlCR00obXVzaWMsIGZvcmNlKSB7XG4gICAgICAgIC8vIOWmguaenOW3sue7j+aSreaUvuedgOWwseS4jeaSreaUvuS6hlxuICAgICAgICBpZiAodGhpcy5jdXJCZ011c2ljICYmIHRoaXMuY3VyQmdNdXNpYyA9PSBtdXNpYykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuY3VyQmdNdXNpYyA9IG11c2ljO1xuICAgICAgICBpZiAodGhpcy5jYW5QbGF5TXVzaWMpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcEJHTSgpO1xuICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQobXVzaWMsIGZ1bmN0aW9uIChlcnIsIGNsaXApIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJCR01VcmwgPT0gbXVzaWMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJnbUF1ZGlvSUQgPSBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIHRydWUsIHRoaXMuYmdtVm9sdW1lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuaSreaUvuiDjOaZr+mfs+S5kOWksei0pTpcIiwgZXJyKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcEJHTSgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcCh0aGlzLm11c2ljSWQpO1xuICAgIH1cblxuICAgIC8vIC8qKlxuICAgIC8vICAqIOWQjOatpeWKoOi9veWjsOmfs+i1hOa6kFxuICAgIC8vICAqIEBwYXJhbSB1cmwgXG4gICAgLy8gICovXG4gICAgLy8gYXN5bmMgcHJlbG9hZEF1ZGlvQ2xpcChzb3VuZE5hbWU6IHN0cmluZykge1xuICAgIC8vICAgICBpZiAoIXRoaXMuX3NmeEVuYWJsZWQpIHtcbiAgICAvLyAgICAgICAgIHJldHVybjtcbiAgICAvLyAgICAgfVxuXG4gICAgLy8gICAgIGNjLnJlc291cmNlcy5wcmVsb2FkKGBzb3VuZHMvJHtzb3VuZE5hbWV9YCwgY2MuQXVkaW9DbGlwKVxuICAgIC8vIH1cblxuICAgIC8vIOaSreaUvumfs+aViFxuICAgIHB1YmxpYyBwbGF5U291bmQoc291bmRUeXBlOiBzdHJpbmcsIHZvbHVtZTogYW55ID0gdGhpcy5zb3VuZFZvbHVtZSwgZXh0OiBzdHJpbmcgPSBcIi5tcDNcIiwgbG9vcDogYm9vbGVhbiA9IGZhbHNlLCBpc0Zyb21OZXQ6IGJvb2xlYW4gPSBmYWxzZSwgb25TdGFydD86IEZ1bmN0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmNhblBsYXlTb3VuZCkge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYHNvdW5kcy8ke3NvdW5kVHlwZX1gO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdWRpb0lkID0gY2MuYXVkaW9FbmdpbmUucGxheSh0aGlzLnNvdW5kQ2xpcENhY2hlW2Ake3VybH1gXSwgbG9vcCwgdm9sdW1lKTtcbiAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRnJvbU5ldCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXVybC5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNjLmFzc2V0TWFuYWdlci5sb2FkUmVtb3RlKHVybCwgeyBleHQ6IGV4dCB9LCAoZXJyLCBjbGlwOiBjYy5BdWRpb0NsaXApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXVkaW9JZCA9IGNjLmF1ZGlvRW5naW5lLnBsYXkoY2xpcCwgbG9vcCwgdm9sdW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvSWRzW3VybF0gPSBhdWRpb0lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQodXJsLCAoKGVyciwgY2xpcDogY2MuQXVkaW9DbGlwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF1ZGlvSWQgPSBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIGxvb3AsIHZvbHVtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0gPSBjbGlwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9JZHNbdXJsXSA9IGF1ZGlvSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25TdGFydCAmJiBvblN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHN0b3BTb3VuZEJ5VXJsKHVybCkge1xuICAgICAgICBsZXQgYXVkaW9JZCA9IHRoaXMuYXVkaW9JZHNbdXJsXTtcbiAgICAgICAgaWYgKGF1ZGlvSWQgIT0gbnVsbCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcChhdWRpb0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wU291bmQoYXVkaW9JZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImF1ZGlvSWRcIiwgYXVkaW9JZCk7XG4gICAgICAgIGlmIChhdWRpb0lkICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3AoYXVkaW9JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmmoLlgZxcbiAgICBwdWJsaWMgcGF1c2VCR00oKSB7XG4gICAgICAgIGlmICh0aGlzLm11c2ljSWQgPj0gMCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGF1c2UodGhpcy5tdXNpY0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOaBouWkjVxuICAgIHB1YmxpYyByZXN1bWVCR00oKSB7XG4gICAgICAgIGlmICh0aGlzLm11c2ljSWQgPj0gMCkge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucmVzdW1lKHRoaXMubXVzaWNJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDljbjovb3pn7PmlYhcbiAgICB1bmNhY2hlKHVybCkge1xuICAgICAgICBjb25zdCBhdWRpb1VybDogYW55ID0gY2MudXJsLnJhdyh1cmwpO1xuICAgICAgICBjYy5hdWRpb0VuZ2luZS51bmNhY2hlKGF1ZGlvVXJsKTtcbiAgICAgICAgdGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0gPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdW5jYWNoZUFsbCgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUudW5jYWNoZUFsbCgpO1xuICAgICAgICB0aGlzLnNvdW5kQ2xpcENhY2hlID0ge307XG4gICAgfVxuXG4gICAgcGF1c2VBbGwoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQYXVzZSBBbGwgU291bmQnKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGF1c2VBbGwoKTtcbiAgICB9XG5cbiAgICByZXN1bWVBbGwoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSZXN1bSBBbGwgU291bmQnKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucmVzdW1lQWxsKCk7XG4gICAgfVxuXG4gICAgc3RvcEFsbCgpIHtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xuICAgIH1cblxuICAgIGNsZWFuKCkge1xuICAgICAgICB0aGlzLnN0b3BBbGwoKTtcbiAgICAgICAgdGhpcy51bmNhY2hlQWxsKCk7XG4gICAgICAgIHRoaXMuY3VyQmdNdXNpYyA9ICcnO1xuICAgICAgICB0aGlzLm11c2ljSWQgPSAtMTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgYXVkaW9NZ3IgPSBBdWRpb01nci5JbnN0YW5jZTsiXX0=