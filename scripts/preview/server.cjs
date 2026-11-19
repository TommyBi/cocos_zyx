const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const audioHandoff = require('./audio-handoff.cjs')();
const root = path.resolve(process.env.PREVIEW_BUILD_DIR || path.join(__dirname, '../../build/web-mobile'));
const port = Number(process.env.PREVIEW_PORT || 7458);
const apiPort = Number(process.env.PREVIEW_API_PORT || 8080);
const demoOrigin = process.env.PREVIEW_DEMO_PORT ? 'http://127.0.0.1:' + Number(process.env.PREVIEW_DEMO_PORT) : '';
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
    '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.wasm': 'application/wasm', '.fnt': 'text/plain'};
http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost:' + port);
    // 预览控制脚本独立于游戏资源与构建产物。
    if (url.pathname === '/__preview/audio-gate.js') {
        res.writeHead(200, {'Content-Type': types['.js'], 'Cache-Control': 'no-store'});
        res.end(fs.readFileSync(path.join(__dirname, 'audio-gate.js'))); return;
    }
    if (audioHandoff(req, res, url)) return;
    if (url.pathname === '/' && !['home', 'balloonDemo', 'autostart'].some(key => url.searchParams.has(key))) {
        url.searchParams.set('localApi', '1'); url.searchParams.set('home', '1');
        res.writeHead(302, {Location: url.pathname + url.search}); res.end(); return;
    }
    if (url.pathname === '/' && url.searchParams.get('balloonDemo') === '1' && url.searchParams.get('autostart') !== '1') {
        url.searchParams.set('autostart', '1');
        res.writeHead(302, {Location: url.pathname + url.search}); res.end(); return;
    }
    if (url.pathname.startsWith('/v1/cocos-zyx/')) {
        const proxy = http.request({hostname: '127.0.0.1', port: apiPort, path: req.url, method: req.method,
            headers: {...req.headers, host: '127.0.0.1:' + apiPort}}, reply => {
            res.writeHead(reply.statusCode, reply.headers); reply.pipe(res);
        });
        proxy.on('error', () => {res.writeHead(502); res.end('Local API is unavailable');});
        req.pipe(proxy); return;
    }
    const previewFiles = {'/__balloon_demo.js': path.join(__dirname, 'balloon-demo.js'),
        '/acceptance.html': path.join(__dirname, 'acceptance.html'),
        '/__preview/scoring-demo.js': path.join(__dirname, 'scoring-demo.js'),
        '/__preview/tool-visuals.js': path.join(__dirname, 'tool-visuals.js'),
        '/__preview/friends-demo.js': path.join(__dirname, 'friends-demo.js'),
        '/__preview/friends-source.js': path.join(__dirname, '../../wechat-open-data/index.js'),
        '/__preview/friends-ranking.js': path.join(__dirname, '../../wechat-open-data/ranking.js'),
        '/__balloon_fixture.json': path.join(__dirname, '../fixtures/board-v8-balloon-replay.json'),
        '/__clear_fixture.json': path.join(__dirname, '../fixtures/board-v8-clear-replay.json'),
        '/__heart_fixture.json': path.join(__dirname, '../fixtures/board-v10-heart-replay.json')};
    let file;
    try {file = previewFiles[url.pathname] || path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));}
    catch (_) {res.writeHead(400); res.end(); return;}
    if (!previewFiles[url.pathname] && !file.startsWith(root + path.sep)) {res.writeHead(403); res.end(); return;}
    fs.readFile(file, (error, data) => {
        if (error) {res.writeHead(404); res.end(); return;}
        res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-store');
        if (path.extname(file) === '.html') {
            const rewrite = `<script>(function(){var original=window.fetch;window.fetch=function(input,options){if(typeof input==='string'&&input.indexOf('http://127.0.0.1:8080/v1/cocos-zyx')===0)input=location.origin+input.slice('http://127.0.0.1:8080'.length);return original.call(this,input,options);};})();</script>`;
            const demo = url.searchParams.get('balloonDemo') === '1' ? '<script defer src="/__balloon_demo.js"></script>' : '';
            const friendsDemo = url.searchParams.get('friendsDemo') === '1' ? '<script defer src="/__preview/friends-demo.js"></script>' : '';
            const toolDemo = url.searchParams.get('toolVisuals') === '1' ? '<script defer src="/__preview/tool-visuals.js"></script>' : '';
            const scoringDemo = url.searchParams.get('scoringDemo') === '1' && url.searchParams.get('localApi') === '1' && url.searchParams.get('autostart') === '1'
                ? '<script defer src="/__preview/scoring-demo.js"></script>' : '';
            data = Buffer.from(data.toString().replaceAll('__DEMO_ORIGIN__', demoOrigin)
                .replace('<head>', '<head><script src="/__preview/audio-gate.js?v=5"></script>' + rewrite)
                .replace('</body>', demo + friendsDemo + toolDemo + scoringDemo + '</body>'));
        }
        res.end(data);
    });
}).listen(port, '127.0.0.1', () => console.log('Preview ready: http://localhost:' + port + '/?localApi=1&home=1'));
