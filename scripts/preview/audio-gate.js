/* 本机预览专用，在Cocos启动前注入；不随Web/微信构建发布。 */
(function () {
    const id = 'preview_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2);
    const contexts = new Set(), media = new Set();
    let allowed = false, connected = false, first = true, token = null, chain = Promise.resolve();
    window.__zyxPreviewAudioGranted = false;
    const NativeContext = window.AudioContext || window.webkitAudioContext;
    const nativeResume = NativeContext?.prototype.resume;
    const nativeSuspend = NativeContext?.prototype.suspend;
    if (NativeContext) {
        NativeContext.prototype.resume = function () {
            return allowed ? nativeResume.call(this) : Promise.resolve();
        };
        const Wrapped = new Proxy(NativeContext, {construct(target, args, newTarget) {
            const context = Reflect.construct(target, args, newTarget);
            contexts.add(context);
            if (!allowed) nativeSuspend.call(context).catch(() => {});
            return context;
        }});
        window.AudioContext = Wrapped;
        if (window.webkitAudioContext === NativeContext) window.webkitAudioContext = Wrapped;
    }
    const nativePlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
        media.add(this);
        if (!allowed) {this.pause(); return Promise.resolve();}
        return nativePlay.call(this);
    };
    function manager(value) {
        window.__zyxPreviewAudioGranted = value;
        try {window.__require?.('AudioManager').audioManager.setPreviewAudioOwner(value);} catch (_) {}
    }
    async function silence() {
        allowed = false;
        manager(false);
        media.forEach(item => item.pause());
        await Promise.all([...contexts].map(async context => {
            if (context.state === 'closed') return;
            if (context.state === 'suspended') {
                nativeSuspend.call(context).catch(() => {});
                return;
            }
            try {await nativeSuspend.call(context);} catch (_) {await context.close();}
        }));
        if ([...contexts].some(context => context.state === 'running')) throw Error('Preview audio could not be silenced');
    }
    async function acknowledge(silentToken) {
        if (silentToken == null) return;
        await fetch('/__preview/audio-silent?id=' + id + '&token=' + silentToken, {method: 'POST', keepalive: true});
    }
    async function receive(message) {
        if (message.type === 'grant') {
            token = message.token;
            allowed = true;
            manager(true);
            // 浏览器禁止自动播放时resume可能一直等待点击，不能阻塞后续撤销停声。
            [...contexts].filter(c => c.state !== 'closed').forEach(c => nativeResume.call(c).catch(() => {}));
        } else {
            await silence();
            await acknowledge(message.type === 'revoke' ? message.token : token);
        }
    }
    const events = new EventSource('/__preview/audio-events?id=' + id);
    const claim = () => {
        if (connected) fetch('/__preview/audio-claim?id=' + id, {method: 'POST'}).catch(() => {});
    };
    const enqueue = action => {chain = chain.then(action).catch(error => console.error('Preview audio handoff:', error));};
    events.onopen = () => {connected = true; if (first) {first = false; claim();}};
    events.onmessage = event => enqueue(() => receive(JSON.parse(event.data)));
    events.onerror = () => {connected = false; enqueue(async () => {await silence(); await acknowledge(token);});};
    // 多个嵌入页可能同时报告focus；仅用户操作当前页面才能主动取回播放权。
    document.addEventListener('pointerdown', event => {if (event.isTrusted) claim();}, true);
    window.addEventListener('pagehide', () => {
        connected = false;
        // 先执行同步暂停，再关闭连接；HTTP回执使用keepalive完成交接。
        const quiet = silence();
        events.close();
        quiet.then(() => acknowledge(token)).catch(() => {});
    });
    window.__previewAudioDiagnostics = () => ({
        id, owner: allowed, contexts: [...contexts].map(c => c.state),
        mediaPlaying: [...media].filter(item => !item.paused).length,
    });
})();
