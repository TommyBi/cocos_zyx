// 仅由本地预览服务器按 friendsDemo=1 注入，不进入游戏构建或微信包。
(async function () {
    const [source, model] = await Promise.all([
        fetch('/__preview/friends-source.js').then(r => r.text()),
        fetch('/__preview/friends-ranking.js').then(r => r.text()),
    ]);
    function findScene(node) {
        const scene = (node._components || []).find(c => c.homeFriendRanking);
        if (scene) return scene;
        for (const child of node.children || []) { const found = findScene(child); if (found) return found; }
    }
    let scene;
    for (let i = 0; i < 350 && !scene; i++) {
        if (window.cc && cc.director.getScene()) scene = findScene(cc.director.getScene());
        if (!scene) await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!scene) throw Error('首页预览未就绪，请刷新重试');
    function hideGM(node) {
        if (node.name === 'gmFloatingBubble') node.active = false;
        (node.children || []).forEach(hideGM);
    }
    hideGM(cc.director.getScene());
    const key = 'zyx_best_score_staging_v1';
    const records = ['小满', '晚风', '预览中的我', '小芽', '春日', '小雨', '栗子', '暖阳', '团团'].map((nickname, i) => {
        const portrait = document.createElement('canvas'); portrait.width = portrait.height = 96;
        const g = portrait.getContext('2d');
        g.fillStyle = ['#d9e9df', '#e8e0ee', '#f4dfcb', '#dbe9f0'][i % 4]; g.fillRect(0, 0, 96, 96);
        g.fillStyle = '#796353'; g.font = '40px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(nickname[0], 48, 50);
        return { openid: i === 2 ? 'preview-self' : `preview-${i}`, nickname, avatarUrl: portrait.toDataURL(),
            KVDataList: [{ key, value: String([3660, 2150, 1280, 960, 850, 630, 290, 170, 90][i]) }] };
    });
    const canvas = document.createElement('canvas');
    let receive;
    const child = { getSharedCanvas: () => canvas, onMessage: cb => { receive = cb; },
        getFriendCloudStorage: opts => opts.success({ data: records }),
        getUserInfo: opts => opts.success({ data: [{ openId: 'preview-self', nickName: '预览中的我', avatarUrl: records[2].avatarUrl }] }),
        getUserCloudStorage: opts => opts.success({ KVDataList: records[2].KVDataList }), createImage: () => new Image() };
    const module = { exports: {} }; new Function('module', model)(module);
    new Function('wx', 'require', source)(child, () => module.exports);
    window.wx = { getOpenDataContext: () => ({ canvas, postMessage: message => receive(message) }),
        getAccountInfoSync: () => ({ miniProgram: { envVersion: 'trial' } }),
        getSetting: opts => opts.success({ authSetting: { 'scope.WxFriendInteraction': true } }),
        shareAppMessage: () => alert('浏览器仅预览邀请入口，实际分享请在微信中体验。') };
    scene.homeFriendRanking.refresh();
    const note = document.createElement('div');
    note.textContent = '好友榜为示例数据 · 按住列表上下拖动';
    note.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:99999;padding:2px 6px;border-radius:8px;background:#fff6e0ed;color:#775649;font:10px sans-serif;white-space:nowrap;pointer-events:none';
    document.body.appendChild(note);
})().catch(console.error);
