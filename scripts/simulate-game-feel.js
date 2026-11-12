/** 无 Cocos/网络依赖的真实操作模拟；node scripts/simulate-game-feel.js [种子数] */
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const { default: BoardEngine, MAX_ACTION_APPENDS, BOARD_RULES_VERSION } = require('../server/src/boardEngine');
const { replayRound } = require('../server/src/gameEngine');
const samples = Number(process.argv[2] || 100);
const policy = process.argv[3] || 'hint';
const limit = Number(process.argv[4] || 36);
const rulesVersion = Number(process.argv[5] || BOARD_RULES_VERSION);

const results = [];
for (const tutorial of [true, false]) {
    const stats = { tutorial, samples, policy, limit, rulesVersion, played: 0, cleared: 0, multiRows: 0, cascade: 0, bombsUsed: 0,
        bombsEarned: 0, perfectRounds: 0, aliveAt36: 0, aliveAtLimit: 0, directAtOpening: 0, replayMismatch: 0,
        reached3000: 0, totalScore: 0,
        stages: Array.from({ length: 4 }, () => ({ actions: 0, cleared: 0, multiRows: 0, heightTotal: 0 })),
        generationMs: [], firstTen: { played: 0, cleared: 0, multiRows: 0 }, firstProtected: { played: 0, cleared: 0, multiRows: 0 }, firstMiss: [] };
    for (let sample = 1; sample <= samples; sample++) {
        const seed = Math.imul(sample, 0x9e3779b1) >>> 0;
        const board = new BoardEngine();
        const start = performance.now();
        board.resetBoard(seed, tutorial, rulesVersion);
        if (tutorial) {
            for (let step = 0; step < 3; step++) {
                const move = board.getTutorialMove(step);
                board.movePiece(move.id, move.offset); board.resolveBoard();
                stats.bombsEarned += board.finishPlayerAction().length;
            }
            for (let row = 0; row < 3; row++) board.appendNextRow();
            board.resolveBoard(); stats.bombsEarned += board.finishPlayerAction().length;
        }
        if (board.findEliminationHint()) stats.directAtOpening++;
        let perfect = board.combo >= 5;
        let firstMiss = null;
        let alive = true;
        let randomState = seed || 1;
        for (let action = 0; action < limit * 4 && board.moveCount < limit; action++) {
            let hint = board.findEliminationHint();
            if (policy === 'random-easy') {
                const moves = board.easyMoves(board.pieces);
                if (moves.length) hint = moves[(sample + action) % moves.length];
            }
            const bomb = board.pieces.find(piece => piece.bomb);
            const before = board.roundClearedRows;
            let moving = false;
            if (hint && !(policy === 'bomb-first' && bomb)) { moving = true; board.movePiece(hint.id, hint.offset); }
            else if (bomb) { stats.bombsUsed++; board.detonateBomb(bomb.id); }
            else {
                const moves = [];
                for (const piece of board.pieces) {
                    const range = board.getMoveRange(piece.id);
                    for (let offset = range.min; offset <= range.max; offset++) if (offset) moves.push({ id: piece.id, offset });
                }
                randomState ^= randomState << 13; randomState ^= randomState >>> 17; randomState ^= randomState << 5;
                const move = moves[Math.floor((randomState >>> 0) / 4294967296 * moves.length)];
                if (!move) { alive = false; break; }
                moving = true; board.movePiece(move.id, move.offset);
            }
            board.resolveBoard();
            if (!board.appendTurnRows()) { alive = false; break; }
            board.resolveBoard();
            while (board.getOccupiedRowCount() < board.getRefillRowTarget() && board.actionAppends < MAX_ACTION_APPENDS) {
                if (!board.appendNextRow()) { alive = false; break; }
                board.resolveBoard();
            }
            stats.bombsEarned += board.finishPlayerAction().length;
            const rows = board.roundClearedRows - before;
            const stage = stats.stages[board.getDifficulty().stage];
            stage.actions++; if (rows) stage.cleared++; if (rows >= 2) stage.multiRows++;
            stage.heightTotal += board.pieces.length ? 10 - Math.min(...board.pieces.map(piece => piece.row)) : 0;
            stats.played++; if (rows) stats.cleared++; if (rows >= 2) stats.multiRows++;
            if (board.actionCascade >= 2) stats.cascade++;
            if (board.getDifficulty().progress === 0 && moving) {
                stats.firstProtected.played++;
                if (rows) stats.firstProtected.cleared++;
                if (rows >= 2) stats.firstProtected.multiRows++;
            }
            if (moving && board.moveCount <= (tutorial ? 13 : 10)) {
                stats.firstTen.played++;
                if (rows) stats.firstTen.cleared++; if (rows >= 2) stats.firstTen.multiRows++;
            }
            if (!rows && moving && firstMiss === null) firstMiss = board.moveCount;
            perfect = perfect || board.combo >= 5;
            if (!alive || board.isGameOver()) { alive = false; break; }
        }
        if (perfect) stats.perfectRounds++;
        if (board.score >= 3000) stats.reached3000++;
        stats.totalScore += board.score;
        if (alive && board.moveCount >= 36) stats.aliveAt36++;
        if (alive && board.moveCount >= limit) stats.aliveAtLimit++;
        stats.firstMiss.push(firstMiss);
        stats.generationMs.push(performance.now() - start);
        const replay = replayRound(seed, tutorial, board.roundActions);
        if (!replay.valid || replay.score !== board.score || replay.collectedMoodBeans !== board.roundCollectedMoodBeans) stats.replayMismatch++;
        assert.ok(board.pieces.filter(piece => piece.bomb).length <= 3);
    }
    stats.averageRoundMs = Math.round(stats.generationMs.reduce((a, b) => a + b, 0) / samples);
    stats.averageScoreAtEnd = Math.round(stats.totalScore / samples);
    delete stats.totalScore;
    delete stats.generationMs;
    stats.noMissBefore15 = stats.firstMiss.filter(value => value === null || value > 15).length;
    delete stats.firstMiss;
    results.push(stats);
}
console.log(JSON.stringify(results, null, 2));
