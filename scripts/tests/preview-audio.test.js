const test = require('node:test');
const assert = require('node:assert/strict');
const {EventEmitter} = require('node:events');
const createHandoff = require('../preview/audio-handoff.cjs');
function harness(t) {
    const route = createHandoff(), connections = [];
    const request = (name, id, token) => {
        const req = {method: name === 'events' || name === 'state' ? 'GET' : 'POST'};
        const res = new EventEmitter();
        res.messages = [];
        res.writeHead = () => {};
        res.write = data => {if (data.startsWith('data: ')) res.messages.push(JSON.parse(data.slice(6)));};
        res.end = data => {res.body = data;};
        const url = new URL('http://localhost/__preview/audio-' + name);
        if (id) url.searchParams.set('id', id);
        if (token != null) url.searchParams.set('token', token);
        route(req, res, url);
        if (name === 'events') connections.push(res);
        return res;
    };
    t.after(() => connections.forEach(connection => connection.emit('close')));
    return {request, state: () => JSON.parse(request('state').body)};
}
test('预览交接必须收到旧页静音回执；迟到的旧播放权不能撤销新播放权', t => {
    const {request, state} = harness(t);
    const a = request('events', 'page_a'), b = request('events', 'page_b');
    request('claim', 'page_a'); const first = state().owner;
    request('claim', 'page_b');
    assert.equal(state().owner.id, 'page_a');
    assert.equal(b.messages.filter(m => m.type === 'grant').length, 0);
    request('silent', 'page_b', first.token); assert.equal(state().owner.id, 'page_a');
    request('silent', 'page_a', first.token);
    assert.equal(state().owner.id, 'page_b');
    request('claim', 'page_a'); const second = state().owner;
    request('silent', 'page_b', second.token);
    const third = state().owner;
    request('silent', 'page_a', first.token);
    assert.deepEqual(state().owner, third);
    assert.equal(a.messages.at(-1).type, 'grant');
});
test('快速反复点击以最后操作为准；旧页重新点击后，先前撤销回执不得释放新播放权', t => {
    const {request, state} = harness(t);
    request('events', 'page_a'); request('events', 'page_b'); request('events', 'page_c');
    request('claim', 'page_a'); const first = state().owner;
    request('claim', 'page_b'); request('claim', 'page_c');
    request('silent', 'page_a', first.token); assert.equal(state().owner.id, 'page_c');
    request('claim', 'page_b'); const previous = state().owner;
    request('claim', 'page_c'); const renewed = state().owner;
    assert.notEqual(renewed.token, previous.token);
    request('silent', 'page_c', previous.token);
    assert.deepEqual(state().owner, renewed); assert.equal(state().pending, null);
});
test('连接中断不当作已静音；独立停声回执到达后才允许新预览播放', t => {
    const {request, state} = harness(t);
    const a = request('events', 'page_a'); request('events', 'page_b');
    request('claim', 'page_a'); const first = state().owner;
    request('claim', 'page_b'); a.emit('close');
    assert.equal(state().owner.id, 'page_a');
    request('silent', 'page_a', first.token); assert.equal(state().owner.id, 'page_b');
});

test('WebView直接销毁没有回执时清理失效播放权，不让其他预览永久静音', async t => {
    const {request, state} = harness(t);
    const a = request('events', 'page_a'); request('events', 'page_b');
    request('claim', 'page_a'); a.emit('close'); request('claim', 'page_b');
    assert.equal(state().owner.id, 'page_a');
    await new Promise(resolve => setTimeout(resolve, 300));
    assert.equal(state().owner.id, 'page_b');
});
