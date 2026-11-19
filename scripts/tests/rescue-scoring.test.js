const test = require('node:test');
const assert = require('node:assert/strict');
const { default: BoardEngine } = require('../../server/src/boardEngine');
const { replayRound } = require('../../server/src/gameEngine');
const piece = (id, row, col, size = 1, color = 1, bomb = false) =>
    ({ id, row, col, size, color, bomb, stampMood: 0, stampCell: 0, collectibleType: 0, collectibleCell: 0 });

test('V9 道具按实际色块加5分，长块算一块；无目标不加分，V8 保留旧积分', () => {
    for (const version of [8, 9]) {
        const b = new BoardEngine(); b.resetBoard(42, false, version);
        b.pieces = [piece(101, 9, 0, 3), piece(102, 9, 4, 2), piece(103, 8, 0, 1, 2)];
        b.hammerCount = b.colorPurifierCount = 2;
        assert.equal(b.useHammer(101), true);
        assert.equal(b.score, version === 9 ? 5 : 0);
        assert.equal(b.useHammer(101), false);
        assert.deepEqual(b.useColorPurifier(1), [102]);
        assert.equal(b.score, version === 9 ? 10 : 0);
        assert.deepEqual(b.useColorPurifier(1), []);
        assert.equal(b.bestScore, b.score);
    }
});

test('V9 爆炸交叠去重，基础行分和combo照常计算', () => {
    const b = new BoardEngine(); b.resetBoard(42, false, 9); b.combo = 2;
    b.pieces = [piece(1, 9, 0, 3, 1, true), piece(2, 9, 3, 5), piece(3, 8, 2, 1, 1, true)];
    const r = b.eliminateFullRows();
    assert.equal(r.combo, 3);
    assert.equal(r.gainedScore, 10 * 3 + 3 * 5);
    assert.equal(b.score, r.gainedScore);
    assert.equal(b.bestScore, b.score);
});

test('V18同波满两行只升一档，真实重力连消逐波升档并单独加分', () => {
    const board = new BoardEngine(); board.resetBoard(42, false, 18);
    board.pieces = [piece(1,9,0,3), piece(2,9,5,3), piece(3,8,0,4), piece(4,8,4,4), piece(5,7,3,2)];
    board.beginPlayerAction();
    board.applyGravity();
    const scores = [board.eliminateFullRows().gainedScore];
    assert.ok(board.applyGravity().length > 0);
    scores.push(board.eliminateFullRows().gainedScore);
    assert.deepEqual(scores, [12, 24]);
    board.finishPlayerAction();
    for (const [expectedCombo, expectedPoints] of [[3,96],[4,192],[5,240],[5,240]]) {
        board.beginPlayerAction();
        board.pieces = [piece(90,8,0,8), piece(91,9,0,8)];
        const wave = board.eliminateFullRows();
        assert.equal(wave.combo, expectedCombo);
        assert.equal(wave.gainedScore, expectedPoints);
        board.finishPlayerAction();
    }
    board.beginPlayerAction(); board.finishPlayerAction();
    assert.equal(board.combo, 0);
});

test('V18炸弹按实际引爆枚数去重；爆破能续连但不会在无满行时升档', () => {
    const board = new BoardEngine(); board.resetBoard(42, false, 18);
    board.combo = 2;
    board.pieces = [piece(1,9,0,1,1,true), piece(2,9,1,1,1,true), piece(3,8,1,1)];
    const result = board.detonateBomb(1);
    assert.equal(result.detonatedBombs.length, 2);
    assert.equal(result.gainedScore, 100);
    board.finishPlayerAction();
    assert.equal(board.combo, 2);
    assert.equal(board.detonateBomb(1), null);
    board.pieces = [piece(11,9,0,3,1,true), piece(12,9,3,5)];
    const wave = board.eliminateFullRows();
    assert.equal(wave.gainedScore, 48 + 50);
    assert.equal(board.combo, 3);
});

test('V18普通消行先加120，补排再消一行并触发双炸弹加220', () => {
    const board = new BoardEngine(); board.resetBoard(42, false, 18);
    board.combo = 5;
    board.score = 4934;
    board.pieces = [piece(101,9,0,3), piece(102,9,3,3), piece(103,9,6,2), piece(104,8,0,2), piece(105,8,2,3)];
    board.nextPieces = [piece(106,9,5,1,1,true), piece(107,9,6,1,1,true), piece(108,9,7,1)];
    board.beginPlayerAction();
    const first = board.resolveBoard();
    assert.equal(first.gainedScore, 120);
    assert.equal(board.score, 5054);
    assert.ok(board.appendTurnRows());
    const second = board.resolveBoard();
    assert.equal(second.gainedScore, 220);
    assert.equal(board.score, 5274);
    assert.equal(board.score - 4934, 340);
});

test('V18锤和棒按成功使用计固定分；清屏按格宽计；复活不直接计分', () => {
    const board = new BoardEngine(); board.resetBoard(42, false, 18);
    board.pieces = [piece(1,9,0,3), piece(2,9,4,2), piece(3,8,0,1,2)];
    board.hammerCount = board.colorPurifierCount = 1;
    assert.ok(board.useHammer(1)); assert.equal(board.score, 50);
    assert.equal(board.useHammer(1), false);
    assert.deepEqual(board.useColorPurifier(3), []); assert.equal(board.score, 50);
    assert.deepEqual(board.useColorPurifier(1), [2]); assert.equal(board.score, 250);
    board.finishPlayerAction();
    board.pieces = [piece(10,3,0,3), piece(11,4,0,3), piece(12,5,0,3),
        piece(13,6,0,3), piece(14,7,0,3), piece(15,8,0,3), piece(16,8,3,2),
        piece(17,9,0,2), piece(18,9,2,1)];
    board.pieces.at(-1).lightning = true;
    assert.equal(board.offerRoundRescue(20000), 'clear');
    assert.equal(board.applyClearRescue(20001).length, 9);
    assert.equal(board.score, 250 + 230);
    board.finishPlayerAction();
    board.pieces = [piece(31,0,0,3)];
    assert.deepEqual(board.removeTopRowsForRevive(), [31]); assert.equal(board.score, 480);
    board.pieces = [piece(32,0,0,2)];
    assert.deepEqual(board.removeTopRowsForRevive(8, true), [32]); assert.equal(board.score, 480);
});

test('V18普通和暖心气球按实际落点及引爆的额外旧炸弹计分，同一块不重复引爆', () => {
    for (const kind of ['balloon', 'heart']) {
        const board = new BoardEngine(); board.resetBoard(42, false, 18, kind === 'heart');
        board.shuffle = values => values;
        board.pieces = [piece(1,2,0), piece(2,2,1,1,1,true), piece(3,3,1), piece(4,9,6)];
        if (kind === 'heart') assert.ok(board.offerHeartRescue(20000));
        else {
            assert.equal(board.offerRoundRescue(20000), 'clear');
            assert.ok(board.dismissRoundRescue(20001));
            assert.equal(board.offerRoundRescue(40001), 'balloon');
        }
        const result = kind === 'heart' ? board.applyHeartRescue() : board.applyBalloonRescue(40002);
        assert.deepEqual(result.detonatedBombs.map(blast => blast.id), [1, 2]);
        assert.deepEqual(result.detonatedBombs.map(blast => blast.score), kind === 'heart' ? [66, 50] : [50, 50]);
        assert.equal(result.gainedScore, kind === 'heart' ? 116 : 100);
        assert.equal(board.score, result.gainedScore);
    }
});

test('V18暖心气球每个实际落下的爱心分别加66分', () => {
    const board = new BoardEngine();
    board.resetBoard(42, false, 18, true);
    board.shuffle = values => values;
    board.pieces = [piece(1,2,0), piece(2,2,6), piece(3,3,0), piece(4,3,6), piece(5,9,4)];
    assert.ok(board.offerHeartRescue(20000));
    const result = board.applyHeartRescue();
    assert.deepEqual(result.detonatedBombs.map(blast => blast.score), [66, 66]);
    assert.equal(result.gainedScore, 132);
    assert.equal(board.score, 132);
});

test('V18闪电按拆成或击碎的格子加分，爆炸叠加，满行飘字与总分一致', () => {
    const board = new BoardEngine(); board.resetBoard(42, false, 18);
    board.shuffle = values => values;
    board.pieces = [piece(80,9,0,8), ...Array.from({length:5}, (_, index) => piece(90+index,4+index,4,3))];
    board.pieces[0].lightning = true;
    const wave = board.eliminateFullRows();
    assert.equal(wave.gainedScore, board.score);
    assert.equal(wave.gainedScore, 12 + 5 * 3 * 8);
    assert.equal(wave.rowScore, 12);
    assert.deepEqual(board.takeLightningEffects()[0].targets.map(target => target.score), [24, 24, 24, 24, 24]);
    board.pieces = [piece(81,9,0,8), piece(95,8,0,1)];
    board.pieces[0].lightning = true;
    assert.equal(board.eliminateFullRows().gainedScore, 24 + 8);
    assert.equal(board.score - 12 - 24, 128);
    const other = new BoardEngine(); other.resetBoard(42, false, 18);
    other.pieces = [piece(1,9,0,8), piece(2,8,0,1,1,true)];
    other.pieces[0].lightning = true;
    assert.equal(other.eliminateFullRows().gainedScore, 12 + 8 + 50);
    const [target] = other.takeLightningEffects()[0].targets;
    assert.equal(target.score, 8);
    assert.equal(target.shattered.detonatedBombs[0].score, 50);
    assert.equal(other.score, 70);
});

test('V9 气球即使炸空仍补1排，闪电固定整体补2排；各难度阶段相同', () => {
    for (const kind of ['balloon', 'clear']) for (const actions of [0, 25, 40, 100]) {
        const b = new BoardEngine(); b.resetBoard(42, false, 9);
        b.difficultyActionCount = actions; b.score = 501;
        b.pieces = [piece(101, 3, 0), piece(102, 9, 0)];
        b.random = () => kind === 'balloon' ? 0.25 : 0.75;
        assert.equal(b.offerRoundRescue(0), kind);
        b.pieces[0].row = 8;
        const result = kind === 'balloon' ? b.applyBalloonRescue() : b.applyClearRescue();
        assert.ok(result);
        assert.equal(b.pieces.length, 0);
        assert.equal(b.score, 511);
        const rows = kind === 'balloon' ? 1 : 2;
        assert.equal(b.getRiseRowCount(), rows);
        assert.equal(b.appendTurnRows(), true);
        assert.equal(b.actionAppends, rows);
        assert.deepEqual(b.roundActions.at(-1), { type: 'rise', rows });
        b.resolveBoard(); b.finishPlayerAction();
        assert.ok(b.pieces.some(p => { const range = b.getMoveRange(p.id); return range.min < 0 || range.max > 0; }));
        assert.equal(b.applyBalloonRescue(), null);
        assert.equal(b.applyClearRescue(), null);
    }
});

function replayToOffer(kind) {
    const trace = require('../fixtures/board-v8-' + kind + '-replay.json');
    const b = new BoardEngine(); b.resetBoard(trace.seed, false, 9);
    const lastOffer = trace.actions.filter(a => a.type === 'rescueOffer').at(-1);
    for (const a of trace.actions.slice(1)) {
        switch (a.type) {
            case 'move': assert.ok(b.movePiece(a.id, a.offset)); break;
            case 'bomb': assert.ok(b.detonateBomb(a.id)); break;
            case 'settle': b.applyGravity(); b.eliminateFullRows(); break;
            case 'finish': b.finishPlayerAction(); break;
            case 'rise': assert.ok(b.appendTurnRows()); break;
            case 'append': assert.ok(b.appendNextRow()); break;
            case 'rescueOffer': assert.equal(b.offerRoundRescue(a.elapsedMs), a.kind); break;
            case 'rescueDismiss': b.dismissRoundRescue(); break;
            default: throw new Error(a.type);
        }
        if (a === lastOffer) return b;
    }
    throw new Error('missing rescue');
}

test('V9 真实长局气球/清屏双端积分一致，禁止漏补、重复补、改排数和漏结束', () => {
    for (const kind of ['balloon', 'clear']) {
        const b = replayToOffer(kind), seed = b.roundSeed;
        kind === 'balloon' ? b.applyBalloonRescue() : b.applyClearRescue();
        b.resolveBoard(); b.appendTurnRows(); b.resolveBoard(); b.finishPlayerAction();
        assert.deepEqual(replayRound(seed, false, b.roundActions, 9),
            { valid: true, score: b.score, collectedMoodBeans: b.roundCollectedMoodBeans });
        const rise = b.roundActions.map(a => a.type).lastIndexOf('rise');
        const invalid = actions => assert.equal(replayRound(seed, false, actions, 9).valid, false);
        invalid(b.roundActions.filter((_, i) => i !== rise));
        invalid(b.roundActions.map((a, i) => i === rise ? { type: 'rise', rows: 3 - a.rows } : a));
        invalid([...b.roundActions.slice(0, rise + 1), b.roundActions[rise], ...b.roundActions.slice(rise + 1)]);
        invalid(b.roundActions.slice(0, -1));
        invalid(b.roundActions.map((a, i) => i === rise ? { type: 'append' } : a));
    }
});
