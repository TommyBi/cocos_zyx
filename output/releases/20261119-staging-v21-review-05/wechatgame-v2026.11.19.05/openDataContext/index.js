'use strict';
// 此目录构建时复制到微信开放数据域，不进入 Cocos 主域依赖图。
const { readScore, readOwner, rankFriends } = require('./ranking');
const canvas = wx.getSharedCanvas();
const ctx = canvas.getContext('2d');
const WIDTH = 398, HEIGHT = 320, LIST_HEIGHT = 234, ROW_HEIGHT = 78;
const ink = '#6a4e3e', muted = '#8e765f';
let visible = false, key = '', scrollOffset = 0, generation = 0;
let ranking = { entries: [], self: null }, state = 'loading';
const avatars = new Map();
const reported = new Set();

function report(stage, error) {
    if (reported.has(stage)) return;
    reported.add(stage);
    // 不记录好友资料或托管数据；区分读取失败和绘制失败。
    console.warn(`[WeChatFriends] ${stage} failed`, error && error.name || 'Error');
}

function text(value, x, y, size, color = ink, align = 'left') {
    ctx.font = `${size >= 26 ? 'bold ' : ''}${size}px sans-serif`;
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.fillText(String(value), x, y);
}

function ellipsis(value, maxWidth) {
    let chars = Array.from(value || '微信好友');
    if (ctx.measureText(chars.join('')).width <= maxWidth) return chars.join('');
    while (chars.length && ctx.measureText(chars.join('') + '…').width > maxWidth) chars.pop();
    return chars.join('') + '…';
}

function avatar(url, x, y) {
    const size = 58;
    ctx.save();
    try {
        if (typeof ctx.clip === 'function') {
            ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.clip();
        }
        ctx.fillStyle = '#ede7ce'; ctx.fillRect(x, y, size, size);
        const cached = avatars.get(url);
        if (cached && cached.ready) {
            // 微信原始头像在开放域直接绘制，按中心裁切，不拉伸非正方形头像。
            const w = cached.image.width, h = cached.image.height, edge = Math.min(w, h);
            ctx.drawImage(cached.image, (w - edge) / 2, (h - edge) / 2, edge, edge, x, y, size, size);
        }
        else {
            // 轻盈的小芽作为缺省头像，无额外远程资源。
            // 用基础贝塞尔接口，避免部分微信 Canvas 缺少 ellipse 时整行停止绘制。
            ctx.fillStyle = '#a0b98a'; ctx.beginPath(); ctx.moveTo(x + 29, y + 32);
            ctx.bezierCurveTo(x + 7, y + 30, x + 12, y + 12, x + 29, y + 27);
            ctx.bezierCurveTo(x + 38, y + 7, x + 53, y + 18, x + 29, y + 32); ctx.fill();
            if (url && !cached) {
                const image = wx.createImage();
                const record = { image, ready: false }; avatars.set(url, record);
                image.onload = () => {
                    if (avatars.get(url) !== record) return;
                    record.ready = true; if (visible) render();
                };
                image.onerror = () => { /* 保留小芽占位。 */ };
                image.src = url;
                // 只缓存最近浏览的头像，避免长好友榜一直持有全部头像。
                if (avatars.size > 24) avatars.delete(avatars.keys().next().value);
            }
        }
    } catch (error) {
        report('avatar', error);
    } finally {
        ctx.restore();
    }
}

function row(entry, y, own) {
    if (own || entry.isSelf) {
        ctx.fillStyle = '#e6efd9'; ctx.fillRect(0, y, WIDTH, 66);
    }
    if (!own) text(entry.rank, 16, y + 33, 26, entry.rank <= 3 ? '#aa7046' : muted, 'center');
    avatar(entry.avatarUrl, own ? 8 : 39, y + 4);
    ctx.font = '24px sans-serif';
    const name = own ? (entry.rank ? `我 · 第${entry.rank}名` : '我 · 排名同步中') : `${entry.isSelf ? '我 · ' : ''}${entry.nickname}`;
    text(ellipsis(name, own ? 184 : 148), own ? 78 : 109, y + 33, 24);
    const score = entry.score.toLocaleString('en-US');
    ctx.font = 'bold 28px sans-serif';
    const scoreSize = Math.min(28, Math.floor(28 * 112 / Math.max(1, ctx.measureText(score).width)));
    text(score, WIDTH - 10, y + 33, scoreSize, ink, 'right');
    ctx.strokeStyle = '#e7dac1'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(8, y + 68); ctx.lineTo(WIDTH - 8, y + 68); ctx.stroke();
}

function render() {
    if (!visible) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    try {
        ctx.scale(canvas.width / WIDTH, canvas.height / HEIGHT);
        if (state === 'loading') text('正在寻找好友的好成绩…', WIDTH / 2, 140, 24, muted, 'center');
        else if (state === 'error') {
            text('好友排名暂时没加载出来', WIDTH / 2, 126, 24, muted, 'center');
            text('下次回到首页时再看看吧', WIDTH / 2, 162, 24, muted, 'center');
        } else {
            const count = ranking.entries.length;
            if (count === 0) {
                text('好友们的好成绩，等你来开启', WIDTH / 2, 115, 24, muted, 'center');
                text('邀请好友一起消除吧', WIDTH / 2, 152, 24, muted, 'center');
            } else {
                ctx.save();
                try {
                    // 裁切仅包住滑动列表，自身名次始终固定在下方。
                    if (typeof ctx.clip === 'function') {
                        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(WIDTH, 0);
                        ctx.lineTo(WIDTH, LIST_HEIGHT); ctx.lineTo(0, LIST_HEIGHT); ctx.closePath(); ctx.clip();
                    }
                    const first = Math.floor(scrollOffset / ROW_HEIGHT);
                    const last = Math.min(count, Math.ceil((scrollOffset + LIST_HEIGHT) / ROW_HEIGHT));
                    for (let index = first; index < last; index++) {
                        const y = index * ROW_HEIGHT - scrollOffset;
                        if (typeof ctx.clip !== 'function' && (y < 0 || y + 70 > LIST_HEIGHT)) continue;
                        row(ranking.entries[index], y, false);
                    }
                } finally { ctx.restore(); }
                if (count * ROW_HEIGHT > LIST_HEIGHT) {
                    const thumb = Math.max(24, LIST_HEIGHT * LIST_HEIGHT / (count * ROW_HEIGHT));
                    ctx.fillStyle = '#c4cfae';
                    ctx.fillRect(WIDTH - 3, scrollOffset / maxScroll() * (LIST_HEIGHT - thumb), 3, thumb);
                }
                if (!ranking.entries.some(entry => !entry.isSelf))
                    text('邀请好友来，看看谁分数更高', WIDTH / 2, 170, 24, muted, 'center');
            }
            if (ranking.self) row(ranking.self, 250, true);
            else text('我的成绩同步后显示排名', WIDTH / 2, 283, 24, muted, 'center');
        }
    } catch (error) {
        report('render', error);
    } finally {
        ctx.restore();
    }
}

function api(method, options) {
    return new Promise((resolve, reject) => {
        try { wx[method](Object.assign({}, options, { success: resolve, fail: reject })); }
        catch (error) { reject(error); }
    });
}

function load() {
    const request = ++generation;
    state = 'loading'; render();
    // 三项均在开放数据域执行；任何一项失败都不伪装成空榜或未上榜。
    Promise.all([
        api('getFriendCloudStorage', { keyList: [key, `${key}_owner`] }),
        api('getUserInfo', { openIdList: ['selfOpenId'], lang: 'zh_CN' }),
        api('getUserCloudStorage', { keyList: [key, `${key}_owner`] }),
    ]).then(([friends, self, storage]) => {
        if (!visible || request !== generation) return;
        ranking = rankFriends(friends.data, key, self.data && self.data[0],
            readScore(storage.KVDataList, key), readOwner(storage.KVDataList, key));
        scrollOffset = 0;
        state = 'ready'; render();
    }, error => {
        if (!visible || request !== generation) return;
        report('storage', error);
        state = 'error'; render();
    });
}

function maxScroll() {
    return Math.max(0, ranking.entries.length * ROW_HEIGHT - LIST_HEIGHT);
}

wx.onMessage(message => {
    if (!message || message.fromEngine) return;
    if (message.type === 'friends:hide') {
        visible = false; generation++; avatars.clear();
        ranking = { entries: [], self: null };
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else if (message.type === 'friends:show') {
        visible = true; key = message.key; scrollOffset = 0;
        // 宽高只能由主域设置，此处仅使用共享画布进行2D绘制。
        load();
    } else if (message.type === 'friends:scroll' && visible && state === 'ready') {
        if (!Number.isFinite(message.delta)) return;
        scrollOffset = Math.max(0, Math.min(maxScroll(), scrollOffset + message.delta));
        render();
    }
});
