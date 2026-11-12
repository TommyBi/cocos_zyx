/** V2/V3/V4/V5 重放同一纯棋盘引擎，按对局版本保留对应难度曲线与 settle/finish 边界。 */
const { default: BoardEngine, BOARD_RULES_VERSION } = require('./boardEngine');
function replayBoardEngine(seed, tutorial, actions, rulesVersion) {
    const invalid = { score: -1, collectedMoodBeans: -1, valid: false };
    if (!Array.isArray(actions) || actions[0]?.type !== 'rules'
        || ![2, 3, 4, BOARD_RULES_VERSION].includes(rulesVersion) || actions[0].version !== rulesVersion) return invalid;
    const board = new BoardEngine();
    board.resetBoard(seed, tutorial, actions[0].version);
    let openingRemaining = 0;
    let openingUsed = false;
    let riseRequired = false;
    const stable = () => {
        const prediction = new BoardEngine();
        prediction.pieces = board.pieces.map(piece => ({ ...piece }));
        return prediction.applyGravity().length === 0 && prediction.eliminateFullRows().clearedRows === 0;
    };
    for (const action of actions.slice(1)) {
        if (!action || typeof action.type !== 'string') return invalid;
        // 客户端只能报告真实结算边界，不能跳过掉落/满行后直接继续操作。
        if (['move', 'bomb', 'hammer', 'purify', 'clear', 'revive', 'finish', 'rise'].includes(action.type)
            && !stable()) return invalid;
        const startsAction = ['move', 'bomb', 'hammer', 'purify', 'clear', 'revive'].includes(action.type);
        if (rulesVersion >= 5 && startsAction) {
            // 不能省略上一回合的上升压力后继续刷消除；失败后的救场仍能恢复棋盘。
            if (riseRequired && action.type !== 'clear' && action.type !== 'revive') return invalid;
            riseRequired = !(tutorial && action.type === 'move' && board.moveCount < 3);
        }
        switch (action.type) {
            case 'move':
                openingRemaining = 0;
                if (!Number.isSafeInteger(action.id) || !Number.isSafeInteger(action.offset)
                    || !board.movePiece(action.id, action.offset)) return invalid;
                break;
            case 'bomb':
                openingRemaining = 0;
                if (!Number.isSafeInteger(action.id) || !board.detonateBomb(action.id)) return invalid;
                break;
            case 'rise':
                if (rulesVersion < 5 || action.rows !== board.getRiseRowCount() || !board.appendTurnRows()) return invalid;
                riseRequired = false;
                break;
            case 'append':
                if (openingRemaining > 0) openingRemaining--;
                else if (!stable()) return invalid;
                if (rulesVersion >= 5 && riseRequired) {
                    if (board.getRiseRowCount() !== 1) return invalid;
                    riseRequired = false;
                }
                if (!board.appendNextRow()) return invalid;
                break;
            case 'settle':
                board.applyGravity();
                board.eliminateFullRows();
                break;
            case 'finish':
                board.finishPlayerAction();
                if (tutorial && board.moveCount === 3 && !openingUsed) {
                    openingRemaining = 3;
                    openingUsed = true;
                }
                break;
            // 延续现有道具重放协议；经济授权不属于本轮手感重构。
            case 'hammer':
                board.hammerCount = 1;
                if (!Number.isSafeInteger(action.id) || !board.useHammer(action.id)) return invalid;
                break;
            case 'purify':
                board.colorPurifierCount = 1;
                if (!Number.isSafeInteger(action.color) || !board.useColorPurifier(action.color).length) return invalid;
                break;
            case 'clear': board.removeAllPieces(); break;
            case 'revive':
                if (!Number.isSafeInteger(action.rowCount) || action.rowCount < 1 || action.rowCount > 10
                    || !board.removeTopRowsForRevive(action.rowCount).length) return invalid;
                break;
            default: return invalid;
        }
    }
    return { score: board.score, collectedMoodBeans: board.roundCollectedMoodBeans, valid: true };
}
module.exports = { replayBoardEngine };
