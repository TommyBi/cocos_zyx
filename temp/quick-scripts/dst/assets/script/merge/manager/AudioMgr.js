
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHQvbWVyZ2UvbWFuYWdlci9BdWRpb01nci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTO0FBQ1QsSUFBWSxTQUVYO0FBRkQsV0FBWSxTQUFTO0FBRXJCLENBQUMsRUFGVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUVwQjtBQUVELE9BQU87QUFDUCxJQUFZLFNBTVg7QUFORCxXQUFZLFNBQVM7SUFDakIsbUNBQXNCLENBQUE7SUFDdEIseUNBQTRCLENBQUE7SUFDNUIscUNBQXdCLENBQUE7SUFDeEIsNEJBQWUsQ0FBQTtBQUVuQixDQUFDLEVBTlcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFNcEI7QUFFRCxPQUFPO0FBQ1AsSUFBWSxVQUtYO0FBTEQsV0FBWSxVQUFVO0lBQ2xCLDZCQUFlLENBQUE7SUFDZiwrQkFBaUIsQ0FBQTtJQUNqQiw2QkFBZSxDQUFBO0lBQ2YsOEJBQWdCLENBQUE7QUFDcEIsQ0FBQyxFQUxXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBS3JCO0FBRUQ7SUFHSTtRQUdRLG1CQUFjLEdBQUcsRUFFeEIsQ0FBQztRQUNNLGFBQVEsR0FBRyxFQUFFLENBQUM7UUFFdEIsS0FBSztRQUNHLGdCQUFXLEdBQVcsSUFBSSxDQUFBO1FBQzFCLGdCQUFXLEdBQVcsSUFBSSxDQUFBO1FBRTFCLGVBQVUsR0FBUSxJQUFJLENBQUM7UUFDdkIsaUJBQVksR0FBWSxJQUFJLENBQUM7UUFDN0IsaUJBQVksR0FBWSxJQUFJLENBQUMsQ0FBQSxvQkFBb0I7UUFFekQsaUJBQWlCO1FBQ1QsWUFBTyxHQUFXLENBQUMsQ0FBQyxDQUFDO0lBaEI3QixDQUFDO0lBa0JELHVCQUFJLEdBQUo7UUFDSSxFQUFFLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBRXZCLElBQUksQ0FBQyxXQUFX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Qy9CLENBQUM7SUFFRCwwQkFBTyxHQUFQO1FBQ0ksRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsd0JBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCx3QkFBSyxHQUFMLFVBQU0sSUFBZ0I7UUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPO1FBQzFCLElBQUksSUFBSSxLQUFLLFVBQVUsQ0FBQyxXQUFXLEVBQUU7WUFDakMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ3BCO2FBQU07WUFDSCxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxNQUFBLEVBQUUsQ0FBQyxDQUFDO1NBQzdCO0lBQ0wsQ0FBQztJQS9LYSxpQkFBUSxHQUFhLElBQUksUUFBUSxFQUFFLENBQUM7SUFnTHRELGVBQUM7Q0FqTEQsQUFpTEMsSUFBQTtrQkFqTG9CLFFBQVE7QUFrTGhCLFFBQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDog4zmma/pn7PkuZDnsbvlnotcbmV4cG9ydCBlbnVtIE11c2ljVHlwZSB7XG5cbn1cblxuLy8g6Z+z5pWI57G75Z6LXG5leHBvcnQgZW51bSBTb3VuZFR5cGUge1xuICAgIE1PVkVfQ09JTiA9ICdtb3ZlQ29pbicsXG4gICAgUFJPRFVDRV9DT0lOID0gJ3Byb2R1Y2VDb2luJyxcbiAgICBNRVJHRV9DT0lOID0gJ21lcmdlQ29pbicsXG4gICAgRVJST1IgPSAnZXJyb3InLFxuXG59XG5cbi8vIOmch+WKqOexu+Wei1xuZXhwb3J0IGVudW0gU0hBS0VfVFlQRSB7XG4gICAgSEVBVlkgPSAnaGVhdnknLFxuICAgIE1FRElVTSA9ICdtZWRpdW0nLFxuICAgIExJR0hUID0gJ2xpZ2h0JyxcbiAgICBTVVBFUl9IRUFWWSA9ICcnLFxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdWRpb01nciB7XG4gICAgcHVibGljIHN0YXRpYyBJbnN0YW5jZTogQXVkaW9NZ3IgPSBuZXcgQXVkaW9NZ3IoKTtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzb3VuZENsaXBDYWNoZSA9IHtcblxuICAgIH07XG4gICAgcHJpdmF0ZSBhdWRpb0lkcyA9IHt9O1xuXG4gICAgLy8g6Z+z6YePXG4gICAgcHJpdmF0ZSBtdXNpY1ZvbHVtZTogbnVtYmVyID0gbnVsbFxuICAgIHByaXZhdGUgc291bmRWb2x1bWU6IG51bWJlciA9IG51bGxcblxuICAgIHByaXZhdGUgY3VyQmdNdXNpYzogYW55ID0gbnVsbDtcbiAgICBwcml2YXRlIGNhblBsYXlNdXNpYzogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBjYW5QbGF5U291bmQ6IGJvb2xlYW4gPSB0cnVlOy8vIUdhbWVDb25maWcuREVCVUc7XG5cbiAgICAvLyDlvZPliY3mkq3mlL7nmoTog4zmma/pn7PkuZDnmoTmkq3mlL7ntKLlvJVcbiAgICBwcml2YXRlIG11c2ljSWQ6IG51bWJlciA9IC0xO1xuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgY2MubG9nKFwiYXVkaW9NZ3IgaW5pdFwiKTtcbiAgICAgICAgdGhpcy5jdXJCZ011c2ljID0gbnVsbDtcblxuICAgICAgICB0aGlzLm11c2ljVm9sdW1lID0gMC4yO1xuICAgICAgICB0aGlzLnNvdW5kVm9sdW1lID0gMS4wO1xuXG4gICAgICAgIHRoaXMuY2FuUGxheU11c2ljID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jYW5QbGF5U291bmQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIOmfs+S5kFxuICAgIHB1YmxpYyBwbGF5QkdNKG11c2ljLCBmb3JjZSkge1xuICAgICAgICAvLyDlpoLmnpzlt7Lnu4/mkq3mlL7nnYDlsLHkuI3mkq3mlL7kuoZcbiAgICAgICAgaWYgKHRoaXMuY3VyQmdNdXNpYyAmJiB0aGlzLmN1ckJnTXVzaWMgPT0gbXVzaWMpIHJldHVybjtcblxuICAgICAgICB0aGlzLmN1ckJnTXVzaWMgPSBtdXNpYztcbiAgICAgICAgaWYgKHRoaXMuY2FuUGxheU11c2ljKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BCR00oKTtcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKG11c2ljLCBmdW5jdGlvbiAoZXJyLCBjbGlwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VyQkdNVXJsID09IG11c2ljKSB7XG4gICAgICAgICAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3BBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iZ21BdWRpb0lEID0gY2MuYXVkaW9FbmdpbmUucGxheShjbGlwLCB0cnVlLCB0aGlzLmJnbVZvbHVtZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLmkq3mlL7og4zmma/pn7PkuZDlpLHotKU6XCIsIGVycilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3BCR00oKSB7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3AodGhpcy5tdXNpY0lkKTtcbiAgICB9XG5cbiAgICAvLyAvKipcbiAgICAvLyAgKiDlkIzmraXliqDovb3lo7Dpn7PotYTmupBcbiAgICAvLyAgKiBAcGFyYW0gdXJsIFxuICAgIC8vICAqL1xuICAgIC8vIGFzeW5jIHByZWxvYWRBdWRpb0NsaXAoc291bmROYW1lOiBzdHJpbmcpIHtcbiAgICAvLyAgICAgaWYgKCF0aGlzLl9zZnhFbmFibGVkKSB7XG4gICAgLy8gICAgICAgICByZXR1cm47XG4gICAgLy8gICAgIH1cblxuICAgIC8vICAgICBjYy5yZXNvdXJjZXMucHJlbG9hZChgc291bmRzLyR7c291bmROYW1lfWAsIGNjLkF1ZGlvQ2xpcClcbiAgICAvLyB9XG5cbiAgICAvLyDmkq3mlL7pn7PmlYhcbiAgICBwdWJsaWMgcGxheVNvdW5kKHNvdW5kVHlwZTogc3RyaW5nLCB2b2x1bWU6IGFueSA9IHRoaXMuc291bmRWb2x1bWUsIGV4dDogc3RyaW5nID0gXCIubXAzXCIsIGxvb3A6IGJvb2xlYW4gPSBmYWxzZSwgaXNGcm9tTmV0OiBib29sZWFuID0gZmFsc2UsIG9uU3RhcnQ/OiBGdW5jdGlvbikge1xuICAgICAgICBpZiAodGhpcy5jYW5QbGF5U291bmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGBzb3VuZHMvJHtzb3VuZFR5cGV9YDtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc291bmRDbGlwQ2FjaGVbYCR7dXJsfWBdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXVkaW9JZCA9IGNjLmF1ZGlvRW5naW5lLnBsYXkodGhpcy5zb3VuZENsaXBDYWNoZVtgJHt1cmx9YF0sIGxvb3AsIHZvbHVtZSk7XG4gICAgICAgICAgICAgICAgb25TdGFydCAmJiBvblN0YXJ0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpc0Zyb21OZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1cmwuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYy5hc3NldE1hbmFnZXIubG9hZFJlbW90ZSh1cmwsIHsgZXh0OiBleHQgfSwgKGVyciwgY2xpcDogY2MuQXVkaW9DbGlwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF1ZGlvSWQgPSBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIGxvb3AsIHZvbHVtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdWRpb0lkc1t1cmxdID0gYXVkaW9JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25TdGFydCAmJiBvblN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKHVybCwgKChlcnIsIGNsaXA6IGNjLkF1ZGlvQ2xpcCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdWRpb0lkID0gY2MuYXVkaW9FbmdpbmUucGxheShjbGlwLCBsb29wLCB2b2x1bWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc291bmRDbGlwQ2FjaGVbYCR7dXJsfWBdID0gY2xpcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvSWRzW3VybF0gPSBhdWRpb0lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblN0YXJ0ICYmIG9uU3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9uU3RhcnQgJiYgb25TdGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBzdG9wU291bmRCeVVybCh1cmwpIHtcbiAgICAgICAgbGV0IGF1ZGlvSWQgPSB0aGlzLmF1ZGlvSWRzW3VybF07XG4gICAgICAgIGlmIChhdWRpb0lkICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3AoYXVkaW9JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcFNvdW5kKGF1ZGlvSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJhdWRpb0lkXCIsIGF1ZGlvSWQpO1xuICAgICAgICBpZiAoYXVkaW9JZCAhPSBudWxsKSB7XG4gICAgICAgICAgICBjYy5hdWRpb0VuZ2luZS5zdG9wKGF1ZGlvSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5pqC5YGcXG4gICAgcHVibGljIHBhdXNlQkdNKCkge1xuICAgICAgICBpZiAodGhpcy5tdXNpY0lkID49IDApIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBhdXNlKHRoaXMubXVzaWNJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmgaLlpI1cbiAgICBwdWJsaWMgcmVzdW1lQkdNKCkge1xuICAgICAgICBpZiAodGhpcy5tdXNpY0lkID49IDApIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnJlc3VtZSh0aGlzLm11c2ljSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Y246L296Z+z5pWIXG4gICAgdW5jYWNoZSh1cmwpIHtcbiAgICAgICAgY29uc3QgYXVkaW9Vcmw6IGFueSA9IGNjLnVybC5yYXcodXJsKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUudW5jYWNoZShhdWRpb1VybCk7XG4gICAgICAgIHRoaXMuc291bmRDbGlwQ2FjaGVbYCR7dXJsfWBdID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHVuY2FjaGVBbGwoKSB7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnVuY2FjaGVBbGwoKTtcbiAgICAgICAgdGhpcy5zb3VuZENsaXBDYWNoZSA9IHt9O1xuICAgIH1cblxuICAgIHBhdXNlQWxsKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnUGF1c2UgQWxsIFNvdW5kJyk7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBhdXNlQWxsKCk7XG4gICAgfVxuXG4gICAgcmVzdW1lQWxsKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnUmVzdW0gQWxsIFNvdW5kJyk7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnJlc3VtZUFsbCgpO1xuICAgIH1cblxuICAgIHN0b3BBbGwoKSB7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3BBbGwoKTtcbiAgICB9XG5cbiAgICBjbGVhbigpIHtcbiAgICAgICAgdGhpcy5zdG9wQWxsKCk7XG4gICAgICAgIHRoaXMudW5jYWNoZUFsbCgpO1xuICAgICAgICB0aGlzLmN1ckJnTXVzaWMgPSAnJztcbiAgICAgICAgdGhpcy5tdXNpY0lkID0gLTE7XG4gICAgfVxuXG4gICAgc2hha2UodHlwZTogU0hBS0VfVFlQRSkge1xuICAgICAgICBpZiAoIXdpbmRvd1snd3gnXSkgcmV0dXJuO1xuICAgICAgICBpZiAodHlwZSA9PT0gU0hBS0VfVFlQRS5TVVBFUl9IRUFWWSkge1xuICAgICAgICAgICAgd3gudmlicmF0ZUxvbmcoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHd4LnZpYnJhdGVTaG9ydCh7IHR5cGUgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY29uc3QgYXVkaW9NZ3IgPSBBdWRpb01nci5JbnN0YW5jZTsiXX0=