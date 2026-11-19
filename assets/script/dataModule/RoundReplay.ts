import BoardEngine, { RoundToolState } from './BoardEngine';

export type SavedRoundReplay = {
    roundId: string; seed: number; isTutorial: boolean; actions: any[];
    rulesVersion?: number; heartRescueEligible?: boolean; elapsedMs: number;
    roundTools?: RoundToolState;
};

/** 只从后端核验返回的操作重建随机状态和棋盘；不导入客户端序列化对象。 */
export function rebuildRound(seed: number, tutorial: boolean, actions: any[], version: number, heartEligible: boolean): BoardEngine {
    const board = new BoardEngine();
    board.resetBoard(seed, tutorial, version, heartEligible);
    for (const action of actions.slice(1)) {
        switch (action.type) {
            case 'move': board.movePiece(action.id, action.offset); break;
            case 'bomb': board.detonateBomb(action.id); break;
            case 'lightning': board.activateLightning(action.id); break;
            case 'hammer': board.hammerCount = 1; board.useHammer(action.id); break;
            case 'purify': board.colorPurifierCount = 1; board.useColorPurifier(action.color); break;
            case 'settle': board.applyGravity(); board.eliminateFullRows(); break;
            case 'finish': board.finishPlayerAction(); break;
            case 'rise': board.appendTurnRows(); break;
            case 'append': board.appendNextRow(); break;
            case 'revive': board.removeTopRowsForRevive(action.rowCount); break;
            case 'reviveCard': board.removeTopRowsForRevive(action.rowCount, true); break;
            case 'rescueOffer': board.offerRoundRescue(action.elapsedMs); break;
            case 'rescueDismiss': board.dismissRoundRescue(action.elapsedMs); break;
            case 'rescueClear': board.applyClearRescue(action.elapsedMs); break;
            case 'balloonOffer': board.offerBalloonRescue(); break;
            case 'balloonDismiss': board.dismissBalloonRescue(action.elapsedMs); break;
            case 'balloon': board.applyBalloonRescue(action.elapsedMs); break;
            case 'heartOffer': board.offerHeartRescue(action.elapsedMs); break;
            case 'heartDismiss': board.dismissHeartRescue(); break;
            case 'heart': board.applyHeartRescue(); break;
            default: throw new Error('保存记录包含不支持的操作');
        }
    }
    return board;
}
