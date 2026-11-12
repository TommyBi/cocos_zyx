const test = require('node:test');
const assert = require('node:assert/strict');
const { default: BoardEngine, MAX_ACTION_APPENDS, BOARD_RULES_VERSION } = require('../../server/src/boardEngine');
const { replayRound } = require('../../server/src/gameEngine');
const piece = (id, row, col, size, bomb = false) => ({
    id, row, col, size, bomb, color: 1, stampMood: 1, stampCell: 0, collectibleType: 0, collectibleCell: 0,
});

test('满行炸弹及被波及的旧炸弹连锁引爆，交叠范围收集与计分不重复', () => {
    const board = new BoardEngine();
    board.beginPlayerAction();
    board.pieces = [piece(10, 9, 0, 1), piece(11, 9, 1, 1, true), piece(12, 9, 2, 6),
        piece(20, 8, 2, 1, true), piece(21, 7, 3, 1), piece(22, 7, 4, 1)];
    const result = board.eliminateFullRows();
    assert.deepEqual(result.detonatedBombs.map(value => value.id), [11, 20]);
    assert.deepEqual(result.detonatedBombs[0].affectedPieceIds, [10, 11, 12, 20]);
    assert.deepEqual(result.detonatedBombs[1].affectedPieceIds, [11, 12, 20, 21]);
    assert.ok(result.detonatedBombs.every(bomb => !bomb.affectedPieceIds.includes(22)), '恰好相切的格子不显示受击');
    assert.deepEqual(result.removedPieceIds, [10, 11, 12, 20, 21]);
    assert.equal(board.roundCollectedMoodBeans, 5);
    assert.equal(result.gainedScore, 10);
    assert.deepEqual(board.pieces.map(value => value.id), [22]);
    board.eliminateFullRows();
    assert.equal(board.roundCollectedMoodBeans, 5);
});

test('主动炸弹续 combo，不因爆破自动升档；普通无消除移动仍断连', () => {
    const board = new BoardEngine();
    board.combo = 3;
    board.pieces = [piece(1, 9, 1, 1, true), piece(2, 9, 6, 1)];
    board.detonateBomb(1); board.resolveBoard(); board.finishPlayerAction();
    assert.equal(board.combo, 3);
    assert.equal(board.moveCount, 0);
    assert.ok(board.movePiece(2, -1)); board.resolveBoard(); board.finishPlayerAction();
    assert.equal(board.combo, 0);
    assert.equal(board.moveCount, 1);
});

test('双排与三连奖励延迟到操作结束，场上最多三枚，重复结算不能复制', () => {
    const board = new BoardEngine();
    board.combo = 2;
    board.beginPlayerAction();
    board.pieces = [piece(100, 9, 0, 8), piece(101, 8, 0, 8)];
    board.resolveBoard();
    assert.equal(board.pieces.length, 0);
    const rewards = board.finishPlayerAction();
    assert.equal(rewards.length, 2);
    assert.equal(board.roundCollectedMoodBeans, 2);
    assert.deepEqual(board.finishPlayerAction(), []);
    assert.equal(board.awardBomb(2).bomb, true);
    assert.equal(board.awardBomb(2), null);
    assert.equal(board.pieces.filter(value => value.bomb).length, 3);
});

test('补排预算有界，自动补排不推进操作计数；后期阶段封顶', () => {
    const board = new BoardEngine();
    board.resetBoard(42, false);
    board.beginPlayerAction();
    const actions = board.difficultyActionCount;
    for (let index = 0; index < MAX_ACTION_APPENDS; index++) {
        assert.equal(board.appendNextRow(), true); board.resolveBoard();
    }
    assert.equal(board.appendNextRow(), false);
    assert.equal(board.moveCount, 0);
    assert.equal(board.difficultyActionCount, actions);
    board.difficultyActionCount = 55;
    const plateau = board.getDifficulty();
    board.difficultyActionCount = 500;
    assert.deepEqual(board.getDifficulty(), plateau);
});

test('升难速度翻倍：18步结束强辅助、30步高手、42步封顶，旧V2曲线不变', () => {
    const current = new BoardEngine(); current.resetBoard(42, false, 3);
    const previous = new BoardEngine(); previous.resetBoard(42, false, 2);
    for (const [moves, stage, progress] of [[0,0,0],[18,0,0],[19,1,1/24],[29,1,11/24],
        [30,2,0.5],[41,2,23/24],[42,3,1],[500,3,1]]) {
        current.moveCount = moves;
        assert.equal(current.getDifficulty().stage, stage);
        assert.equal(current.getDifficulty().progress, progress);
        previous.moveCount = moves * 2;
        assert.deepEqual(current.getDifficulty(), previous.getDifficulty());
    }
    previous.moveCount = 36; assert.equal(previous.getDifficulty().progress, 0);
    previous.moveCount = 60; assert.equal(previous.getDifficulty().progress, 0.5);
    previous.moveCount = 84; assert.equal(previous.getDifficulty().progress, 1);
});

test('调整前冻结的V2长局仍能原样重放结算，不能更改版本冒充新曲线', () => {
    const trace = require('../fixtures/board-v2-replay.json');
    assert.equal(trace.moveCount, 48, '覆盖新旧曲线产生差异的完整区间');
    assert.deepEqual(replayRound(trace.seed, trace.tutorial, trace.actions, 2), {
        valid: true, score: trace.score, collectedMoodBeans: trace.raw,
    });
    assert.equal(replayRound(trace.seed, trace.tutorial, trace.actions, BOARD_RULES_VERSION).valid, false);
    const altered = [{ type: 'rules', version: BOARD_RULES_VERSION }, ...trace.actions.slice(1)];
    assert.equal(replayRound(trace.seed, trace.tutorial, altered, 2).valid, false);
});

test('V4在9/15/21次有效操作切换阶段，炸弹也升难，后期辅助与提示退坡', () => {
    const board = new BoardEngine(); board.resetBoard(42, false, 4);
    for (const [actions, stage, progress] of [[0,0,0],[9,0,0],[10,1,1/12],[14,1,5/12],
        [15,2,0.5],[20,2,11/12],[21,3,1],[500,3,1]]) {
        board.difficultyActionCount = actions;
        assert.equal(board.getDifficulty().stage, stage);
        assert.equal(board.getDifficulty().progress, progress);
    }
    assert.equal(board.getHintDelay(), 8);
    assert.ok(Math.abs(board.getAssistanceChance(3, 0) - 0.15) < 1e-9);
    board.recentMisses = 10;
    assert.ok(Math.abs(board.getAssistanceChance(8, 0) - 0.29) < 1e-9);
    board.difficultyActionCount = 9;
    board.pieces = [piece(1, 9, 1, 1, true)];
    board.detonateBomb(1); board.resolveBoard(); board.finishPlayerAction();
    assert.equal(board.moveCount, 0);
    assert.equal(board.getDifficulty().stage, 1);
    const legacy = new BoardEngine(); legacy.resetBoard(42, false, 3);
    legacy.moveCount = 42; legacy.recentMisses = 10;
    assert.ok(Math.abs(legacy.getAssistanceChance(8, 0) - 0.62) < 1e-9);
    assert.equal(legacy.getHintDelay(), 2);
});

test('V3冻结长局保持原结果，V2/V3/V4不能互换动作版本', () => {
    const trace = require('../fixtures/board-v3-replay.json');
    assert.deepEqual(replayRound(trace.seed, true, trace.actions, 3), {
        valid: true, score: trace.score, collectedMoodBeans: trace.raw,
    });
    for (const version of [2, BOARD_RULES_VERSION]) assert.equal(replayRound(trace.seed, true, trace.actions, version).valid, false);
});

test('教学三排批量补入的真实事件边界双端一致，且不能用旧规则重放新局', () => {
    const seed = 387276917;
    const board = new BoardEngine(); board.resetBoard(seed, true);
    for (let step = 0; step < 3; step++) {
        const move = board.getTutorialMove(step);
        board.movePiece(move.id, move.offset); board.resolveBoard(); board.finishPlayerAction();
    }
    for (let row = 0; row < 3; row++) board.appendNextRow();
    board.resolveBoard(); board.finishPlayerAction();
    assert.deepEqual(replayRound(seed, true, board.roundActions, BOARD_RULES_VERSION), {
        valid: true, score: board.score, collectedMoodBeans: board.roundCollectedMoodBeans,
    });
    assert.equal(replayRound(seed, true, board.roundActions, 1).valid, false);
    assert.equal(replayRound(seed, true, [{ type: 'rules', version: 9 }], BOARD_RULES_VERSION).valid, false);
});

test('提示是只读的，不影响随机序列和已展示的下一排', () => {
    const first = new BoardEngine(); first.resetBoard(20261111, false);
    const second = new BoardEngine(); second.resetBoard(20261111, false);
    for (let index = 0; index < 10; index++) first.findEliminationHint();
    assert.deepEqual(first.nextPieces, second.nextPieces);
    first.appendNextRow(); second.appendNextRow();
    assert.deepEqual(first.nextPieces, second.nextPieces);
    const preview = JSON.stringify(first.nextPieces);
    first.resolveBoard(); first.finishPlayerAction();
    assert.equal(JSON.stringify(first.nextPieces), preview);
});

test('分支选择回归：新手可选不同容易解，早期持续消除并有双排/连锁', () => {
    const { execFileSync } = require('node:child_process');
    const path = require('node:path');
    const output = execFileSync(process.execPath, [path.join(__dirname, '../simulate-game-feel.js'), '32', 'random-easy', '18'],
        { encoding: 'utf8', timeout: 60000 });
    for (const stats of JSON.parse(output)) {
        assert.equal(stats.replayMismatch, 0);
        assert.equal(stats.perfectRounds, stats.samples);
        assert.ok(stats.firstProtected.cleared / stats.firstProtected.played >= 0.95);
        assert.ok(stats.firstProtected.multiRows / stats.firstProtected.played >= 0.18);
        assert.ok(stats.aliveAtLimit / stats.samples >= 0.95);
    }
});

test('当前规则不接受跳过重力/消除结算就结束或进行下一次移动', () => {
    const board = new BoardEngine(); board.resetBoard(42, true);
    const move = board.getTutorialMove(0);
    board.movePiece(move.id, move.offset);
    const skipped = [...board.roundActions, { type: 'finish' }];
    assert.equal(replayRound(42, true, skipped, BOARD_RULES_VERSION).valid, false);
    board.resolveBoard(); board.finishPlayerAction();
    assert.equal(replayRound(42, true, board.roundActions, BOARD_RULES_VERSION).valid, true);
});


test('V5保护25步，26/40/55切阶段，双排频率与大块明显增加并封顶', () => {
    const b = new BoardEngine(); b.resetBoard(20261111, false);
    for (const [actions, stage, rows] of [[0,0,1],[25,0,1],[26,1,2],[27,1,1],[30,1,2],
        [39,1,1],[40,2,2],[41,2,1],[54,2,2],[55,3,2],[500,3,2]]) {
        b.difficultyActionCount = actions;
        assert.equal(b.getDifficulty().stage, stage);
        assert.equal(b.getRiseRowCount(), rows);
    }
    const late = b.getDifficulty(); b.difficultyActionCount = 55;
    assert.deepEqual(b.getDifficulty(), late);
    b.difficultyActionCount = 25;
    assert.equal(b.getAssistanceChance(3, 0), 1);
    let early = 0, hard = 0;
    for (let i = 0; i < 2000; i++) { b.difficultyActionCount = 0; early += b.pickBlockSize(3) === 3; }
    for (let i = 0; i < 2000; i++) { b.difficultyActionCount = 55; hard += b.pickBlockSize(3) === 3; }
    assert.ok(hard > early * 1.6, `${early} -> ${hard}`);
});

test('V5整次双排原子升起，预告不改牌；顶行或预算不足不进行半次上升', () => {
    const b = new BoardEngine(); b.resetBoard(42, false);
    b.difficultyActionCount = 55; b.beginPlayerAction();
    b.pieces = [piece(99, 5, 0, 1)];
    const first = JSON.parse(JSON.stringify(b.nextPieces));
    const second = JSON.parse(JSON.stringify(b.secondNextPieces));
    assert.ok(b.appendTurnRows());
    assert.equal(b.getPiece(99).row, 3);
    for (const [row, expected] of [[8, first],[9, second]]) {
        assert.deepEqual(b.pieces.filter(p => p.row === row).map(p => [p.col,p.size,p.color]), expected.map(p => [p.col,p.size,p.color]));
    }
    assert.equal(b.actionAppends, 2);
    assert.deepEqual(b.roundActions[b.roundActions.length - 1], { type: 'rise', rows: 2 });
    b.pieces = [piece(99, 1, 0, 1)];
    const before = JSON.stringify([b.pieces,b.nextPieces,b.secondNextPieces,b.roundActions,b.actionAppends]);
    assert.equal(b.appendTurnRows(), false);
    assert.equal(JSON.stringify([b.pieces,b.nextPieces,b.secondNextPieces,b.roundActions,b.actionAppends]), before);
    b.pieces = []; b.actionAppends = 4;
    assert.equal(b.appendTurnRows(), false); assert.equal(b.actionAppends, 4);
});

test('V5三/四/五连和五连后每次消除都奖励，炸弹空爆不刷，旧V4只奖励到三连', () => {
    for (const version of [4, 5]) {
        const b = new BoardEngine(); b.resetBoard(42, false, version); b.combo = 2;
        for (let index = 0; index < 4; index++) {
            b.pieces = [piece(100 + index,9,0,8)]; b.beginPlayerAction(); b.resolveBoard();
            assert.equal(b.finishPlayerAction().length, version === 5 || index === 0 ? 1 : 0);
            assert.deepEqual(b.finishPlayerAction(), []);
        }
        b.pieces = [piece(200,9,0,1,true),piece(201,9,7,1)];
        b.detonateBomb(200); b.resolveBoard();
        assert.deepEqual(b.finishPlayerAction(), []);
    }
});

test('冻结的V4长局保留原始结果；V5双排篡改无法重放', () => {
    const trace = require('../fixtures/board-v4-replay.json');
    assert.deepEqual(replayRound(trace.seed, trace.tutorial, trace.actions, 4), {
        valid: true, score: trace.score, collectedMoodBeans: trace.raw,
    });
    assert.equal(replayRound(trace.seed, trace.tutorial, trace.actions, 5).valid, false);
    const b = new BoardEngine(); b.resetBoard(42, false);
    b.appendTurnRows(); b.resolveBoard(); b.finishPlayerAction();
    assert.equal(replayRound(42,false,b.roundActions,5).valid,true);
    const altered = b.roundActions.map(a => a.type === 'rise' ? { ...a,rows:2 } : a);
    assert.equal(replayRound(42,false,altered,5).valid,false);
});


test('V5不能省略上一回合上升，或把双排篡改为单排后继续刷消除', () => {
    const seed=3,b=new BoardEngine(); b.resetBoard(seed,false);
    for(let i=0;i<30;i++) {
        const hint=b.findEliminationHint(),bomb=b.pieces.find(p=>p.bomb);
        if(hint)b.movePiece(hint.id,hint.offset);else if(bomb)b.detonateBomb(bomb.id);else break;
        b.resolveBoard();if(!b.appendTurnRows())break;b.resolveBoard();
        while(b.getOccupiedRowCount()<b.getRefillRowTarget()&&b.actionAppends<MAX_ACTION_APPENDS){if(!b.appendNextRow())break;b.resolveBoard();}
        b.finishPlayerAction();
    }
    assert.equal(replayRound(seed,false,b.roundActions,5).valid,true);
    const first=b.roundActions.findIndex(a=>a.type==='rise');
    assert.ok(first>0);
    assert.equal(replayRound(seed,false,b.roundActions.filter((_,i)=>i!==first),5).valid,false);
    const dual=b.roundActions.findIndex(a=>a.type==='rise'&&a.rows===2);
    assert.ok(dual>0);
    assert.equal(replayRound(seed,false,b.roundActions.map((a,i)=>i===dual?{type:'append'}:a),5).valid,false);
});
