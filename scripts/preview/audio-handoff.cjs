/** 仅用于本机预览，不编入游戏。跨浏览器隔离环境协调播放，不能依赖 focus 或 localStorage。 */
module.exports = function createAudioHandoff() {
    const clients = new Map();
    const session = require('node:crypto').randomBytes(8).toString('hex');
    let owner = null, pending = null, nextToken = 0;
    const events = [];
    const record = (type, details = {}) => {
        events.push({type, ...details, t: Date.now()});
        if (events.length > 100) events.shift();
    };
    const send = (id, type, details = {}) => clients.get(id)?.write(`data: ${JSON.stringify({type, ...details})}\n\n`);
    const grant = () => {
        const id = pending;
        pending = null;
        if (!clients.has(id)) return;
        owner = {id, token: session + '_' + ++nextToken};
        send(id, 'grant', {token: owner.token});
        record('grant', owner);
    };
    return function handle(req, res, url) {
        const route = url.pathname;
        if (!route.startsWith('/__preview/audio-')) return false;
        const id = url.searchParams.get('id') || '';
        if (route === '/__preview/audio-state') {
            res.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
            res.end(JSON.stringify({owner, pending, clients: clients.size, events}));
            return true;
        }
        if (!/^[a-z0-9_-]{5,100}$/i.test(id)) {
            res.writeHead(400); res.end(); return true;
        }
        if (route === '/__preview/audio-events' && req.method === 'GET') {
            res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive'});
            res.write(': connected\n\n');
            // 同一个连接ID的重连先停声，不能凭重连自行恢复音乐。
            clients.get(id)?.end();
            clients.set(id, res);
            send(id, 'waiting');
            record('connect', {id});
            const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 15000);
            res.on('close', () => {
                clearInterval(heartbeat);
                if (clients.get(id) !== res) return;
                clients.delete(id);
                record('disconnect', {id});
                if (pending === id) pending = null;
                // 正常交接等独立静音回执；断线客户端也会在error处理里暂停原生音频。
                // 销毁WebView可能直接终止JS而没有回执，稍后清理已消失的连接。
                if (owner?.id === id) {
                    const disconnectedToken = owner.token;
                    const cleanup = setTimeout(() => {
                        if (owner?.token === disconnectedToken && !clients.has(id)) {
                            record('closed-owner', owner);
                            owner = null;
                            grant();
                        }
                    }, 250);
                    cleanup.unref();
                }
                // 所有预览都退出时清空会话，避免下次启动继承无效播放权。
                if (!clients.size) {owner = null; pending = null;}
            });
            return true;
        }
        if (route === '/__preview/audio-claim' && req.method === 'POST' && clients.has(id)) {
            if (owner?.id === id) {
                pending = null;
                owner = {id, token: session + '_' + ++nextToken};
                send(id, 'grant', {token: owner.token});
                record('retain', owner);
            } else {
                pending = id;
                if (owner) {
                    send(owner.id, 'revoke', {token: owner.token});
                    record('revoke', {id: owner.id, next: id, token: owner.token});
                } else grant();
            }
            res.writeHead(204); res.end(); return true;
        }
        if (route === '/__preview/audio-silent' && req.method === 'POST') {
            if (owner?.id === id && owner.token === url.searchParams.get('token')) {
                record('silent-ack', owner);
                owner = null;
                grant();
            }
            res.writeHead(204); res.end(); return true;
        }
        res.writeHead(400); res.end(); return true;
    };
};
