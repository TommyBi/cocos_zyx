const test = require('node:test');
const assert = require('node:assert/strict');
const { default: BoardEngine } = require('../../server/src/boardEngine');
const { replayRound } = require('../../server/src/gameEngine');
const trace = require('../fixtures/board-v10-heart-replay.json');

test('心意救场需要服务端第5局资格、危险高度与未失败状态，不要求500分', () => {
    const b = new BoardEngine(); b.resetBoard(42, false, 10, true);
    b.pieces.forEach(p => p.row = Math.max(3, p.row));
    assert.equal(b.offerHeartRescue(2000), false);
    b.pieces[0].row = 2;
    assert.equal(b.score, 0);
    assert.equal(b.offerHeartRescue(1999), false);
    b.heartRescueEligible = false; assert.equal(b.offerHeartRescue(2000), false);
    b.heartRescueEligible = true; b.pieces[0].row = 0;
    assert.equal(b.offerHeartRescue(2000), false);
    b.pieces[0].row = 1; assert.equal(b.offerHeartRescue(2000), true);
    assert.equal(b.offerHeartRescue(4000), false);
    assert.equal(b.dismissHeartRescue(), true);
    assert.equal(b.applyHeartRescue(), null);
    assert.equal(b.offerHeartRescue(999999), false, '当局最多一次');
    b.resetBoard(42, false, 10, true); b.pieces[0].row = 2;
    assert.equal(b.offerHeartRescue(2000), true, '新局重置');
});

test('真实低分长局：爱心复用炸弹范围/连锁/去重计分及补1排，资格不能伪造', () => {
    assert.deepEqual(replayRound(trace.seed, false, trace.actions, 10, true),
        { valid: true, score: trace.score, collectedMoodBeans: trace.raw });
    assert.ok(trace.removedCount > trace.targetCount);
    assert.equal(trace.bonus, trace.removedCount * 5);
    assert.equal(replayRound(trace.seed, false, trace.actions, 10, false).valid, false);
    assert.equal(replayRound(trace.seed, false, trace.actions, 9, true).valid, false);
    const invalid = actions => assert.equal(replayRound(trace.seed, false, actions, 10, true).valid, false);
    invalid(trace.actions.filter(a => a.type !== 'heartOffer'));
    invalid(trace.actions.flatMap(a => a.type === 'heart' ? [a, a] : [a]));
    invalid(trace.actions.map(a => a.type === 'heartOffer' ? { ...a, elapsedMs: 1999 } : a));
    const rise = trace.actions.map(a => a.type).lastIndexOf('rise');
    invalid(trace.actions.filter((_, i) => i !== rise));
    invalid(trace.actions.map((a, i) => i === rise ? { ...a, rows: 2 } : a));
});

test('第5局进入危险区后优先免费爱心，普通入口先收回，二者不能同时兑现', () => {
    const b = new BoardEngine(); b.resetBoard(42, false, 10, true);
    b.pieces[0].row = 2; b.score = 501;
    assert.ok(b.offerRoundRescue(2000));
    assert.equal(b.canOfferHeartRescue(), true, '已有普通入口也能判断免费救场优先级');
    assert.equal(b.offerHeartRescue(4000), false, '先收回普通入口');
    assert.equal(b.dismissRoundRescue(), true);
    assert.equal(b.offerHeartRescue(4000), true);
    assert.equal(b.offerRoundRescue(100000), null, '免费救场展示期间普通入口不可出现');
    assert.equal(b.applyClearRescue(), null);
    assert.equal(b.applyBalloonRescue(), null);
    assert.ok(b.applyHeartRescue());
    assert.equal(b.canOfferHeartRescue(), false);
});
