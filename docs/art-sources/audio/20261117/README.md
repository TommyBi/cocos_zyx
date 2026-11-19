# 用户提供的音效 · 2026-11-17

用户放入 `assets/bundles/music/` 的两份音频原件保存在本目录；运行文件已移入 `assets/bundles/effects/sound/`，保持逐字节一致，避免本地试听依赖远程音乐CDN。

- sound_bomb.mp3：炸弹爆破，约1.53秒。
- sound_sd.mp3：闪电放电，约1.83秒。
- previous/：被替换的旧炸弹WAV、合成短点击MP3及meta；不进入运行包。

音频完整播放，动画仍保持此前时间及输入保护；静音、音量、后台限制沿用AudioManager。证据 `output/modal-audio-20261117/`。
