const test = require('node:test');
const assert = require('node:assert/strict');
const { default: BoardEngine } = require('../../server/src/boardEngine');
const { replayRound } = require('../../server/src/gameEngine');
const piece = (id, row, col, size = 1) => ({ id, row, col, size, color: 1, stampMood: 1,
    stampCell: 0, collectibleType: 0, collectibleCell: 0 });

test('V8两种救场共用分数高度条件和60秒CD，不限总次数、超时拒绝也占CD', () => {
    const b = new BoardEngine(); b.resetBoard(42, false, 8);
    b.pieces = [piece(1, 3, 0)]; b.score = 500;
    assert.equal(b.offerRoundRescue(0), null);
    b.score = 501; b.pieces[0].row = 4; assert.equal(b.offerRoundRescue(0), null);
    b.pieces[0].row = 0; assert.equal(b.offerRoundRescue(0), null);
    b.pieces[0].row = 3;
    const kinds = new Set();
    for (let index = 0; index < 100; index++) {
        const elapsed = index * 60000, kind = b.offerRoundRescue(elapsed);
        assert.ok(['balloon', 'clear'].includes(kind)); kinds.add(kind);
        assert.equal(b.offerRoundRescue(elapsed + 60000), null, '已有提示时不能再出现另一个');
        assert.equal(b.dismissRoundRescue(), true);
        const state = b.randomState;
        assert.equal(b.offerRoundRescue(elapsed + 59999), null);
        assert.equal(b.randomState, state, '冷却中不重抽随机类型');
    }
    assert.equal(kinds.size, 2); assert.equal(b.roundActions.filter(a => a.type === 'rescueOffer').length, 100);
    for (const elapsed of [-1, 1.5, NaN, Infinity]) assert.equal(b.offerRoundRescue(elapsed), null);
});

test('V16从底部第7排起不看分数，先清屏后气球；两者共享退场后20秒冷却', () => {
    const board = new BoardEngine(); board.resetBoard(42, false, 16);
    board.pieces = [piece(1, 4, 0), piece(2, 9, 2)];
    assert.equal(board.offerRoundRescue(20000), null, '第6排不触发');
    board.pieces[0].row = 3;
    assert.equal(board.offerRoundRescue(19999), null);
    assert.equal(board.offerRoundRescue(20000), 'clear');
    assert.equal(board.offerRoundRescue(70000), null, '已有提示不能同时出现另一个');
    assert.equal(board.dismissRoundRescue(19999), false);
    assert.equal(board.dismissRoundRescue(71000), true);
    assert.deepEqual(board.roundActions.at(-1), { type: 'rescueDismiss', elapsedMs: 71000 });
    assert.equal(board.offerRoundRescue(90999), null);
    assert.equal(board.offerRoundRescue(91000), 'balloon');
    assert.equal(board.applyBalloonRescue(90000), null);
    assert.ok(board.applyBalloonRescue(115000));
    assert.deepEqual(board.roundActions.at(-1), { type: 'balloon', elapsedMs: 115000 });
    board.finishPlayerAction();
    board.pieces = [piece(3, 3, 0)];
    assert.equal(board.offerRoundRescue(134999), null);
    assert.equal(board.offerRoundRescue(135000), 'clear');
    assert.ok(board.applyClearRescue(170000));
    assert.deepEqual(board.roundActions.at(-1), { type: 'rescueClear', elapsedMs: 170000 });
    assert.equal(board.getRoundRescueReadyAt(), 190000);
});

test('V15仍按出现时刻计算30秒，旧局不需要记录退场时刻', () => {
    const board = new BoardEngine(); board.resetBoard(42, false, 15);
    board.pieces = [piece(1, 3, 0)];
    assert.equal(board.offerRoundRescue(40000), null);
    board.score = 501;
    assert.ok(board.offerRoundRescue(40000));
    assert.equal(board.dismissRoundRescue(), true);
    assert.deepEqual(board.roundActions.at(-1), { type: 'rescueDismiss' });
    assert.equal(board.offerRoundRescue(69999), null);
    assert.ok(board.offerRoundRescue(70000));
});

test('V8救场只能兑换抽中的类型一次，出现后降低高度仍可兑现，清屏沿用原补排规则', () => {
    for (const kind of ['balloon', 'clear']) {
        const b = new BoardEngine(); b.resetBoard(42, false, 8); b.score = 501;
        b.pieces = [piece(1, 3, 0), piece(2, 9, 2)];
        b.random = () => kind === 'balloon' ? 0.25 : 0.75;
        assert.equal(b.offerRoundRescue(0), kind);
        b.pieces[0].row = 9;
        assert.equal(kind === 'balloon' ? b.applyClearRescue() : b.applyBalloonRescue(), null);
        assert.ok(kind === 'balloon' ? b.applyBalloonRescue() : b.applyClearRescue());
        assert.equal(b.applyClearRescue(), null); assert.equal(b.applyBalloonRescue(), null);
        assert.equal(b.offerRoundRescue(59999), null);
        if (kind === 'clear') {
            assert.equal(b.pieces.length, 0); assert.equal(b.score, 501);
            assert.equal(b.roundCollectedMoodBeans, 0);
            assert.equal(b.appendTurnRows(), true); b.resolveBoard(); b.finishPlayerAction();
            assert.ok(b.pieces.length > 0);
        }
    }
});

test('V6双排只允许最高点不超过底部第4排，前25次仍为单排', () => {
    const b = new BoardEngine(); b.resetBoard(42, false, 6);
    for (const actions of [26, 40, 55, 500]) {
        b.difficultyActionCount = actions;
        for (const [row, expected] of [[6, 2], [5, 1], [1, 1]]) {
            b.pieces = [piece(1, row, 0)]; assert.equal(b.getRiseRowCount(), expected);
        }
    }
    b.pieces = []; b.difficultyActionCount = 25; assert.equal(b.getRiseRowCount(), 1);
});

test('热气球严格满足分数>1000且高度>6；随机四分之一不重复且预演不改种子', () => {
    const b = new BoardEngine(); b.resetBoard(20261112, false, 6);
    b.pieces = Array.from({ length: 19 }, (_, i) => piece(100 + i, 9 - Math.floor(i / 2), i % 2 * 4));
    b.pieces = b.pieces.filter(p => p.row >= 3);
    b.score = 1000; assert.equal(b.canOfferBalloonRescue(), false);
    b.score = 1001; assert.equal(b.canOfferBalloonRescue(), true);
    assert.equal(b.offerBalloonRescue(), true);
    const before = b.randomState;
    const targets = b.getBalloonTargets();
    assert.equal(b.randomState, before);
    assert.deepEqual(b.getBalloonTargets(), targets);
    assert.equal(targets.length, Math.ceil(b.pieces.length / 4));
    assert.equal(new Set(targets.map(p => p.id)).size, targets.length);
    const total = b.pieces.length, collected = b.roundCollectedMoodBeans;
    const result = b.applyBalloonRescue();
    assert.deepEqual(result.removedPieceIds, targets.map(p => p.id));
    assert.equal(b.pieces.length, total - targets.length);
    assert.equal(b.roundCollectedMoodBeans - collected, targets.length);
    assert.equal(b.roundActions.at(-1).type, 'balloon');
    assert.equal(b.applyBalloonRescue(), null, '同一机会不能重复兑换');
    b.pieces = [piece(1, 4, 0)]; assert.equal(b.canOfferBalloonRescue(), false);
    b.pieces = [piece(1, 0, 0)]; assert.equal(b.canOfferBalloonRescue(), false);
});

test('热气球投弹与普通炸弹范围一致，覆盖相邻和斜角色块并引爆旧炸弹', () => {
    const pieces = [piece(1, 5, 3), piece(2, 4, 2, 2), { ...piece(3, 6, 4), bomb: true },
        piece(4, 7, 5)];
    const b = new BoardEngine(); b.rulesVersion = 7; b.pieces = pieces.map(p => ({ ...p })); b.balloonAvailable = true;
    b.shuffle = values => values;
    const normal = new BoardEngine(); normal.rulesVersion = 7; normal.pieces = pieces.map(p => ({ ...p, bomb: p.id === 1 || p.bomb }));
    const expected = normal.detonateBomb(1);
    const result = b.applyBalloonRescue();
    assert.deepEqual(result, expected);
    assert.deepEqual(result.removedPieceIds, [1, 2, 3, 4]);
    assert.deepEqual(result.detonatedBombs.map(p => p.id), [1, 3]);
    assert.equal(b.roundCollectedMoodBeans, 4);
    assert.equal(b.score, 0); assert.equal(b.moveCount, 0); assert.equal(b.difficultyActionCount, 0);
    assert.deepEqual(b.roundActions, [{ type: 'balloon' }]);
    assert.equal(b.applyBalloonRescue(), null);
});

test('多枚气球炸弹重叠范围只消除和收集一次，长块按爆心判定且棋盘边缘不越界', () => {
    const b = new BoardEngine(); b.rulesVersion = 7; b.balloonAvailable = true; b.shuffle = values => values;
    b.pieces = [piece(1, 9, 0), piece(2, 9, 1), piece(3, 8, 0), piece(4, 8, 1),
        piece(5, 8, 2), piece(6, 7, 1), piece(7, 9, 3, 3), piece(8, 8, 3, 3)];
    const result = b.applyBalloonRescue();
    assert.deepEqual(result.detonatedBombs.map(p => p.id), [1, 2]);
    assert.deepEqual(result.removedPieceIds, [1, 2, 3, 4, 5]);
    assert.equal(b.roundCollectedMoodBeans, 5);
    assert.deepEqual(b.pieces.map(p => p.id), [6, 7, 8]);

    b.balloonAvailable = true;
    b.pieces = [piece(10, 5, 1, 3), piece(11, 4, 0), piece(12, 4, 1), piece(13, 4, 4, 2)];
    const wide = b.applyBalloonRescue();
    assert.deepEqual(wide.removedPieceIds, [10, 12]);
    assert.deepEqual(b.pieces.map(p => p.id), [11, 13]);
});

test('随机炸弹覆盖所有列，单格左右对称，不再把余数固定塞在最右', () => {
    const b = new BoardEngine(); b.rulesVersion = 12;
    const bombs = Array(8).fill(0), singles = Array(8).fill(0), gaps = Array(8).fill(0);
    for (let i = 1; i <= 4096; i++) {
        b.randomState = Math.imul(i, 0x9e3779b1) >>> 0;
        b.pieces = Array.from({ length: 8 }, (_, col) => piece(col + 1, 9, col));
        bombs[b.awardBomb(2).col]++;
        const row = b.createNextRowCandidate(5);
        row.pieces.filter(p => p.size === 1).forEach(p => singles[p.col]++);
        for (let col = 0; col < 8; col++) if (!row.pieces.some(p => col >= p.col && col < p.col + p.size)) gaps[col]++;
    }
    assert.ok(Math.max(...bombs) / Math.min(...bombs) < 1.3, JSON.stringify(bombs));
    assert.ok(Math.abs(singles[0] - singles[7]) / Math.max(singles[0], singles[7]) < 0.12, JSON.stringify(singles));
    assert.ok(Math.abs(gaps[1] - gaps[6]) / Math.max(gaps[1], gaps[6]) < 0.12, JSON.stringify(gaps));
});

test('冻结V5长局继续结算，新版不接受伪造清屏或不满足条件的热气球', () => {
    const trace = require('../fixtures/board-v5-replay.json');
    assert.deepEqual(replayRound(trace.seed, trace.tutorial, trace.actions, 5), {
        valid: true, score: trace.score, collectedMoodBeans: trace.raw,
    });
    for (const type of ['clear', 'balloon']) {
        assert.equal(replayRound(42, false, [{ type: 'rules', version: 6 }, { type }], 6).valid, false);
    }
});

test('气球出现后的机会允许在降高后兑现，飞出后不能再兑换', () => {
    const b = new BoardEngine(); b.rulesVersion = 7; b.pieces = [piece(1, 3, 0), piece(2, 9, 1)]; b.score = 1001;
    assert.equal(b.offerBalloonRescue(), true);
    b.pieces[0].row = 9;
    assert.ok(b.applyBalloonRescue());
    b.pieces = [piece(3, 3, 0)];
    assert.equal(b.offerBalloonRescue(), true); assert.equal(b.dismissBalloonRescue(), true);
    assert.equal(b.applyBalloonRescue(), null);
});

test('V6真实46步热气球长局双端重放一致，不允许跨版本冒用', () => {
    const t = require('../fixtures/board-v6-balloon-replay.json');
    assert.ok(t.actions.some(a => a.type === 'balloon'));
    assert.deepEqual(replayRound(t.seed, t.tutorial, t.actions, 6), {valid: true, score: t.score, collectedMoodBeans: t.raw});
    assert.equal(replayRound(t.seed, t.tutorial, t.actions, 5).valid, false);
});

test('V7真实长局投弹扩大消除，预演随机数、前后端重放与版本隔离正确', () => {
    const t = require('../fixtures/board-v7-balloon-replay.json');
    const b = new BoardEngine(); b.resetBoard(t.seed, t.tutorial, 7);
    for (const a of t.actions.slice(1)) {
        switch (a.type) {
            case 'move': assert.ok(b.movePiece(a.id, a.offset)); break;
            case 'bomb': assert.ok(b.detonateBomb(a.id)); break;
            case 'rise': assert.ok(b.appendTurnRows()); break;
            case 'append': assert.ok(b.appendNextRow()); break;
            case 'settle': b.applyGravity(); b.eliminateFullRows(); break;
            case 'finish': b.finishPlayerAction(); break;
            case 'balloonOffer': assert.ok(b.offerBalloonRescue()); break;
            case 'balloon': {
                const before = b.randomState, targets = b.getBalloonTargets();
                assert.equal(b.randomState, before);
                const result = b.applyBalloonRescue();
                assert.equal(targets.length, t.targetCount);
                assert.deepEqual(result.detonatedBombs.slice(0, targets.length).map(p => p.id), targets.map(p => p.id));
                assert.equal(result.detonatedBombs.length, t.blastCount);
                assert.equal(result.removedPieceIds.length, t.removedCount);
                assert.ok(t.removedCount > t.targetCount);
                break;
            }
            default: assert.fail(a.type);
        }
    }
    assert.deepEqual(b.roundActions, t.actions);
    assert.equal(b.score, t.score); assert.equal(b.roundCollectedMoodBeans, t.raw);
    assert.deepEqual(replayRound(t.seed, t.tutorial, t.actions, 7), {valid: true, score: t.score, collectedMoodBeans: t.raw});
    assert.equal(replayRound(t.seed, t.tutorial, t.actions, 6).valid, false);
});

for (const kind of ['balloon', 'clear']) test(`V8真实长局${kind}可重放，类型篡改、跨类型短CD和重复兑换被拒绝`, () => {
    const t = require(`../fixtures/board-v8-${kind}-replay.json`);
    assert.deepEqual(replayRound(t.seed, t.tutorial, t.actions, 8), {valid: true, score: t.score, collectedMoodBeans: t.raw});
    assert.equal(replayRound(t.seed, t.tutorial, t.actions, 7).valid, false);
    const offers = t.actions.filter(a => a.type === 'rescueOffer');
    assert.equal(offers.at(-1).kind, kind);
    const wrongKind = t.actions.map(a => a.type === 'rescueOffer' ? {...a, kind: a.kind === 'clear' ? 'balloon' : 'clear'} : a);
    assert.equal(replayRound(t.seed, false, wrongKind, 8).valid, false);
    const missing = t.actions.filter(a => a.type !== 'rescueOffer');
    assert.equal(replayRound(t.seed, false, missing, 8).valid, false);
    const repeated = t.actions.flatMap(a => a.type === (kind === 'clear' ? 'rescueClear' : 'balloon') ? [a, a] : [a]);
    assert.equal(replayRound(t.seed, false, repeated, 8).valid, false);
    if (kind === 'clear') {
        assert.deepEqual(offers.map(a => a.kind), ['balloon', 'balloon', 'clear']);
        const early = t.actions.map(a => a === offers.at(-1) ? {...a, elapsedMs: 119999} : a);
        assert.equal(replayRound(t.seed, false, early, 8).valid, false);
    }
});
