/** 通过真实操作生成救场轨迹，不注入棋子或资产。 */
const { default: BoardEngine } = require('../../server/src/boardEngine');
function finishTurn(board, refill = true) {
  board.resolveBoard();
  if (!board.appendTurnRows()) throw Error('fixture rise failed');
  board.resolveBoard();
  while (refill && board.getOccupiedRowCount() < board.getRefillRowTarget() && board.actionAppends < 5) {
    if (!board.appendNextRow()) throw Error('fixture append failed');
    board.resolveBoard();
  }
  board.finishPlayerAction();
}
function offerBoard(seed, kind, tutorial = false, version = 13) {
  const board = new BoardEngine(); board.resetBoard(seed, tutorial, version, kind === 'heart');
  if (tutorial) {
    for (let step = 0; step < 3; step++) {
      const move = board.getTutorialMove(step);
      if (!board.movePiece(move.id, move.offset)) throw Error('fixture tutorial failed');
      board.resolveBoard(); board.finishPlayerAction();
    }
    for (let i = 0; i < 3; i++) board.appendNextRow();
    board.resolveBoard(); board.finishPlayerAction();
  }
  for (let step = 0; step < 250 && !board.isGameOver(); step++) {
    if (kind === 'heart' ? board.canOfferHeartRescue() : board.canOfferRoundRescue(60000)) {
      const offered = kind === 'heart' ? board.offerHeartRescue(60000) && 'heart' : board.offerRoundRescue(60000);
      if (offered !== kind) throw Error('fixture rescue kind mismatch: ' + offered);
      return board;
    }
    const move = board.findEliminationHint() || board.pieces.map(piece => {
      const range = board.getMoveRange(piece.id); return { id: piece.id, offset: range.min || range.max };
    }).find(move => move.offset);
    if (!move || !board.movePiece(move.id, move.offset)) throw Error('fixture move failed');
    finishTurn(board);
  }
  throw Error('fixture cannot reach rescue');
}
function redeem(board, kind) {
  const result = kind === 'clear' ? board.applyClearRescue() : kind === 'heart' ? board.applyHeartRescue() : board.applyBalloonRescue();
  if (!result) throw Error('fixture rescue failed');
  finishTurn(board, false);
  return board;
}
module.exports = { offerBoard, redeem, finishTurn };
