/** V2 及后续版本重放同一纯棋盘引擎，按对局版本保留难度曲线与 settle/finish 边界。 */
const { default: BoardEngine, BOARD_RULES_VERSION } = require('./boardEngine');
function replayBoardEngine(seed, tutorial, actions, rulesVersion, heartEligible = false, checkpoint = false, includeBoard = false, strict = false) {
    const invalid = { score: -1, collectedMoodBeans: -1, valid: false };
    if (!Array.isArray(actions) || actions[0]?.type !== 'rules'
        || ![2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, BOARD_RULES_VERSION].includes(rulesVersion) || actions[0].version !== rulesVersion) return invalid;
    const board = new BoardEngine();
    board.resetBoard(seed, tutorial, actions[0].version, heartEligible);
    let openingRemaining = 0;
    let openingUsed = false;
    let riseRequired = false;
    let rescueRefill = false;
    const stable = () => {
        const prediction = new BoardEngine();
        prediction.pieces = board.pieces.map(piece => ({ ...piece }));
        return prediction.applyGravity().length === 0 && prediction.eliminateFullRows().clearedRows === 0;
    };
    for (const action of actions.slice(1)) {
        if (!action || typeof action.type !== 'string') return invalid;
        // 客户端只能报告真实结算边界，不能跳过掉落/满行后直接继续操作。
        if (['move', 'bomb', 'lightning', 'hammer', 'purify', 'clear', 'revive', 'reviveCard', 'finish', 'rise', 'balloon', 'balloonOffer', 'rescueOffer', 'rescueClear', 'heartOffer', 'heart'].includes(action.type)
            && !stable()) return invalid;
        const startsAction = ['move', 'bomb', 'lightning', 'hammer', 'purify', 'clear', 'revive', 'reviveCard'].includes(action.type);
        if (strict && startsAction && board.isGameOver() && !['revive', 'reviveCard'].includes(action.type)) return invalid;
        if (rescueRefill && (startsAction || ['rescueOffer', 'balloon', 'heartOffer', 'heart'].includes(action.type))) return invalid;
        if (rulesVersion >= 5 && startsAction) {
            // 不能省略上一回合的上升压力后继续刷消除；失败后的救场仍能恢复棋盘。
            if (riseRequired && action.type !== 'clear' && action.type !== 'revive' && action.type !== 'reviveCard') return invalid;
            riseRequired = !(tutorial && action.type === 'move' && board.moveCount < 3);
        }
        switch (action.type) {
            case 'heartOffer':
                if (rulesVersion < 10 || riseRequired || !board.offerHeartRescue(action.elapsedMs)) return invalid;
                break;
            case 'heartDismiss':
                if (rulesVersion < 10 || !board.dismissHeartRescue()) return invalid;
                break;
            case 'heart':
                if (rulesVersion < 10 || riseRequired || !board.applyHeartRescue()) return invalid;
                riseRequired = rescueRefill = true;
                break;
            case 'rescueOffer':
                if (rulesVersion < 8 || riseRequired || !['balloon', 'clear'].includes(action.kind)
                    || board.offerRoundRescue(action.elapsedMs) !== action.kind) return invalid;
                break;
            case 'rescueDismiss':
                if (rulesVersion < 8 || !board.dismissRoundRescue(action.elapsedMs)) return invalid;
                break;
            case 'rescueClear':
                if (rulesVersion < 8 || riseRequired || !board.applyClearRescue(action.elapsedMs)) return invalid;
                riseRequired = true;
                rescueRefill = rulesVersion >= 9;
                break;
            case 'move':
                openingRemaining = 0;
                if (!Number.isSafeInteger(action.id) || !Number.isSafeInteger(action.offset)
                    || !board.movePiece(action.id, action.offset)) return invalid;
                break;
            case 'bomb':
                openingRemaining = 0;
                if (!Number.isSafeInteger(action.id) || !board.detonateBomb(action.id)) return invalid;
                break;
            case 'lightning':
                openingRemaining = 0;
                if (!Number.isSafeInteger(action.id) || !board.activateLightning(action.id)) return invalid;
                break;
            case 'rise':
                if (strict && !riseRequired) return invalid;
                if (rulesVersion < 5 || (rescueRefill && !riseRequired)
                    || action.rows !== board.getRiseRowCount() || !board.appendTurnRows()) return invalid;
                riseRequired = false;
                break;
            case 'append':
                if (strict && openingRemaining <= 0 && !riseRequired && board.getOccupiedRowCount() >= board.getRefillRowTarget()) return invalid;
                if (rescueRefill) return invalid;
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
                if (strict && !board.isGameOver() && (riseRequired
                    || (!rescueRefill && board.actionOpen && !(tutorial && board.moveCount <= 3) && board.getOccupiedRowCount() < board.getRefillRowTarget() && board.actionAppends < 5))) return invalid;
                if (rescueRefill && riseRequired) return invalid;
                board.finishPlayerAction();
                rescueRefill = false;
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
            case 'balloonOffer':
                if (rulesVersion < 6 || riseRequired || !board.offerBalloonRescue()) return invalid;
                break;
            case 'balloonDismiss':
                if (rulesVersion < 6 || !board.dismissBalloonRescue(action.elapsedMs)) return invalid;
                break;
            case 'balloon':
                if (rulesVersion < 6 || riseRequired || !board.applyBalloonRescue(action.elapsedMs)) return invalid;
                if (rulesVersion >= 9) riseRequired = rescueRefill = true;
                break;
            case 'clear':
                if (rulesVersion >= 6) return invalid;
                board.removeAllPieces(); break;
            case 'reviveCard':
                if (rulesVersion < 11) return invalid;
            case 'revive':
                if (!Number.isSafeInteger(action.rowCount) || action.rowCount < 1 || action.rowCount > 10
                    || !board.removeTopRowsForRevive(action.rowCount, action.type === 'reviveCard').length) return invalid;
                break;
            default: return invalid;
        }
    }
    if (rescueRefill) return invalid;
    const result = { score: board.score, collectedMoodBeans: board.roundCollectedMoodBeans, valid: true };
    return checkpoint ? { ...result, operationCount: board.difficultyActionCount,
        ...(includeBoard ? { board } : {}), ready: stable() && (board.isGameOver() || (!board.actionOpen && !riseRequired && openingRemaining === 0)) } : result;
}
module.exports = { replayBoardEngine };
