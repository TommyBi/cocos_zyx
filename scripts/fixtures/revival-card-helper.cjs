/** 验收夹具：只通过真实棋盘操作推进到失败，不注入棋子或资产。 */
const { default: BoardEngine } = require('../../server/src/boardEngine');
function refill(board) {
    board.resolveBoard();
    while (board.getOccupiedRowCount() < board.getRefillRowTarget() && board.actionAppends < 5) {
        if (!board.appendNextRow()) return false;
        board.resolveBoard();
    }
    board.finishPlayerAction();
    return true;
}
function untilFailure(board) {
    for (let i = 0; i < 3000 && !board.isGameOver(); i++) {
        const move = board.pieces.map(p => ({ id: p.id, offset: board.getMoveRange(p.id).min || board.getMoveRange(p.id).max })).find(p => p.offset);
        if (!move || !board.movePiece(move.id, move.offset)) throw Error('fixture cannot move');
        board.resolveBoard();
        if (!board.appendTurnRows()) break;
        if (!refill(board)) break;
    }
    if (!board.isGameOver()) throw Error('fixture did not reach failure');
    return board;
}
function firstFailure(started) {
    const board = new BoardEngine();
    board.resetBoard(started.seed, started.isTutorial, started.rulesVersion, started.heartRescueEligible);
    if (started.isTutorial) {
        for (let i = 0; i < 3; i++) {
            const move = board.getTutorialMove(i);
            if (!board.movePiece(move.id, move.offset)) throw Error('fixture tutorial');
            board.resolveBoard(); board.finishPlayerAction();
        }
        for (let i = 0; i < 3; i++) board.appendNextRow();
        board.resolveBoard(); board.finishPlayerAction();
    }
    return untilFailure(board);
}
function adRevive(board) {
    if (!board.removeTopRowsForRevive(8).length) throw Error('fixture ad revive');
    board.resolveBoard();
    if (!board.appendTurnRows() || !refill(board)) throw Error('fixture refill');
    return board;
}
function secondFailure(started) { return untilFailure(adRevive(firstFailure(started))); }
module.exports = { firstFailure, secondFailure, adRevive, untilFailure, refill };
