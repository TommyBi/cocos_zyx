// Generated from assets/script/dataModule/BoardEngine.ts; run npm run sync:engine.
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ACTION_APPENDS = exports.MAX_BOARD_BOMBS = exports.ROUND_RESCUE_COOLDOWN_MS = exports.WAND_SCORE_V18 = exports.HAMMER_SCORE_V18 = exports.SCORING_RULES_VERSION = exports.AUTO_RESCUE_RULES_VERSION = exports.TAP_LIGHTNING_RULES_VERSION = exports.getRoundToolLimit = exports.TOOL_SHARE_RULES_VERSION = exports.BOARD_RULES_VERSION = exports.BOARD_COLS = exports.BOARD_ROWS = void 0;
/** 纯棋盘规则。客户端直接导入；服务端使用脚本生成的同源 CommonJS 产物。 */
exports.BOARD_ROWS = 10;
exports.BOARD_COLS = 8;
exports.BOARD_RULES_VERSION = 21;
exports.TOOL_SHARE_RULES_VERSION = 20;
function getRoundToolLimit(item, rulesVersion) {
    if (rulesVersion >= exports.TOOL_SHARE_RULES_VERSION)
        return 5;
    return item === 'magicWand' && rulesVersion >= 12 && rulesVersion < 14 ? 1 : 3;
}
exports.getRoundToolLimit = getRoundToolLimit;
exports.TAP_LIGHTNING_RULES_VERSION = 19;
exports.AUTO_RESCUE_RULES_VERSION = 16;
exports.SCORING_RULES_VERSION = 18;
const ROW_SCORE_V18 = 12;
const COMBO_MULTIPLIERS_V18 = [1, 2, 4, 8, 10];
const BOMB_SCORE_V18 = 50;
const HEART_SCORE_V18 = 66;
exports.HAMMER_SCORE_V18 = 50;
exports.WAND_SCORE_V18 = 200;
const LIGHTNING_CELL_SCORE_V18 = 8;
const CLEAR_CELL_SCORE_V18 = 10;
const DIFFICULTY_WAVE_RULES_VERSION = 17;
const SHORT_OPENING_RULES_VERSION = 21;
const ORIGINAL_DIFFICULTY_TIMING = { opening: 25, advanced: 40, master: 55, hard: 48 };
const SHORT_DIFFICULTY_TIMING = { opening: 15, advanced: 20, master: 35, hard: 28 };
const HARD_DIFFICULTY_PROGRESS = (ORIGINAL_DIFFICULTY_TIMING.hard - ORIGINAL_DIFFICULTY_TIMING.opening)
    / (ORIGINAL_DIFFICULTY_TIMING.master - ORIGINAL_DIFFICULTY_TIMING.opening);
const RELIEF_DIFFICULTY_PROGRESS = 0.3;
const RELIEF_CLEAR_ROWS = 12;
const RELIEF_RAMP_ROWS = 3;
exports.ROUND_RESCUE_COOLDOWN_MS = 20 * 1000;
exports.MAX_BOARD_BOMBS = 3;
exports.MAX_ACTION_APPENDS = 5;
class BoardEngine {
    constructor() {
        this.pieces = [];
        this.nextPieces = [];
        this.secondNextPieces = [];
        this.score = 0;
        this.combo = 0;
        this.bestScore = 0;
        this.hammerCount = 0;
        this.colorPurifierCount = 0;
        this.turn = 0;
        this.moveCount = 0;
        this.difficultyActionCount = 0;
        this.roundClearedRows = 0;
        this.roundCollectedMoodBeans = 0;
        this.roundSeed = 1;
        this.rulesVersion = exports.BOARD_RULES_VERSION;
        this.roundActions = [];
        this.generationDebugLog = [];
        this.actionAppends = 0;
        this.actionCascade = 0;
        this.recentMisses = 0;
        this.currentRoundIsTutorial = false;
        this.randomState = 1;
        this.nextId = 1;
        this.tutorialMoves = [];
        this.comboActionCleared = false;
        this.pendingComboBomb = false;
        this.actionOpen = false;
        this.actionBlast = false;
        this.actionRows = 0;
        this.actionSource = 'system';
        this.reliefRowsRemaining = 0;
        this.hardMisses = 0;
        this.hardDanger = false;
        this.assistedRowsRemaining = 0;
        this.balloonAvailable = false;
        this.rescueKind = null;
        this.rescueLastOfferedAt = 0;
        this.rescueNextOfferAt = exports.ROUND_RESCUE_COOLDOWN_MS;
        this.lastRescueKind = null;
        this.rescueRiseRows = 0;
        this.heartRescueEligible = false;
        this.heartAvailable = false;
        this.heartOffered = false;
        this.hammerUses = 0;
        this.wandUses = 0;
        this.rescueOfferCounts = { balloon: 0, clear: 0 };
        this.pendingLightningCount = 0;
        this.pendingBombCount = 0;
        this.lastSpecialCol = -1;
        this.lightningEffects = [];
    }
    takeLightningEffects() {
        const effects = this.lightningEffects;
        this.lightningEffects = [];
        return effects;
    }
    saveToolInventory() { }
    resetBoard(seed, tutorial, rulesVersion = exports.BOARD_RULES_VERSION, heartEligible = false) {
        this.rulesVersion = rulesVersion;
        this.hammerUses = this.wandUses = this.pendingLightningCount = 0;
        this.rescueOfferCounts = { balloon: 0, clear: 0 };
        this.lightningEffects = [];
        this.pendingBombCount = 0;
        this.lastSpecialCol = -1;
        if (rulesVersion >= 12)
            this.hammerCount = this.colorPurifierCount = 0;
        this.heartRescueEligible = heartEligible;
        this.score = this.combo = this.turn = this.moveCount = 0;
        this.difficultyActionCount = 0;
        this.roundClearedRows = this.roundCollectedMoodBeans = 0;
        this.actionAppends = this.actionCascade = this.recentMisses = 0;
        this.comboActionCleared = this.pendingComboBomb = this.actionOpen = this.actionBlast = false;
        this.actionRows = 0;
        this.actionSource = 'system';
        this.reliefRowsRemaining = this.hardMisses = this.assistedRowsRemaining = 0;
        this.hardDanger = false;
        this.balloonAvailable = false;
        this.rescueKind = null;
        this.rescueLastOfferedAt = -(rulesVersion >= 14 ? 30000 : 60000);
        this.rescueNextOfferAt = exports.ROUND_RESCUE_COOLDOWN_MS;
        this.lastRescueKind = null;
        this.rescueRiseRows = 0;
        this.heartAvailable = this.heartOffered = false;
        this.nextId = 1;
        this.roundSeed = this.randomState = seed >>> 0 || 1;
        this.currentRoundIsTutorial = tutorial;
        this.roundActions = [{ type: 'rules', version: this.rulesVersion }];
        this.generationDebugLog = [];
        if (tutorial) {
            this.pieces = this.createTutorialBoard();
            this.nextPieces = this.createTutorialNextRow();
        }
        else {
            this.tutorialMoves = [];
            this.pieces = [
                this.createPiece(9, 0, 3, 8, 8), this.createPiece(9, 5, 3, 6, 0),
                this.createPiece(8, 0, 2, 2, 2), this.createPiece(8, 2, 1, 9, 0),
                this.createPiece(8, 4, 2, 1, 1), this.createPiece(7, 0, 1, 3, 3),
                this.createPiece(7, 4, 2, 7, 0),
            ];
            if (this.rulesVersion >= 6 && this.random() < 0.5) {
                this.pieces.forEach(piece => piece.col = exports.BOARD_COLS - piece.col - piece.size);
            }
            this.nextPieces = this.generateNextRow();
        }
        this.secondNextPieces = [];
    }
    isTutorialRound() {
        return this.currentRoundIsTutorial;
    }
    /** 只在完整操作后的静止棋盘保存，避免恢复半段消除或补排。 */
    canCheckpoint() {
        if (this.actionOpen && !this.isGameOver())
            return false;
        if (this.roundActions.length === 1)
            return true;
        const prediction = new BoardEngine();
        prediction.pieces = this.pieces.map(piece => (Object.assign({}, piece)));
        return prediction.applyGravity().length === 0 && prediction.eliminateFullRows().clearedRows === 0;
    }
    getTutorialMove(step) {
        const move = this.tutorialMoves[step];
        return move ? Object.assign({}, move) : null;
    }
    getPiece(id) {
        return this.pieces.find((piece) => piece.id === id) || null;
    }
    getMoveRange(id) {
        const piece = this.getPiece(id);
        if (!piece)
            return { min: 0, max: 0 };
        let minCol = 0;
        let maxCol = exports.BOARD_COLS - piece.size;
        for (const other of this.pieces) {
            if (other.id === id || other.row !== piece.row)
                continue;
            if (other.col + other.size <= piece.col) {
                minCol = Math.max(minCol, other.col + other.size);
            }
            else if (other.col >= piece.col + piece.size) {
                maxCol = Math.min(maxCol, other.col - piece.size);
            }
        }
        return {
            min: minCol - piece.col,
            max: maxCol - piece.col,
        };
    }
    movePiece(id, offset) {
        const piece = this.getPiece(id);
        if (!piece || offset === 0)
            return false;
        const range = this.getMoveRange(id);
        const safeOffset = Math.max(range.min, Math.min(range.max, offset));
        if (safeOffset === 0)
            return false;
        this.beginPlayerAction();
        this.moveCount++;
        piece.col += safeOffset;
        this.roundActions.push({ type: 'move', id, offset: safeOffset });
        return true;
    }
    useHammer(id) {
        if (this.hammerCount <= 0 || !this.getPiece(id) || (this.rulesVersion >= 12 && this.hammerUses >= getRoundToolLimit('hammer', this.rulesVersion)))
            return false;
        this.beginPlayerAction();
        const removed = this.getPiece(id);
        this.hammerUses++;
        this.hammerCount--;
        this.saveToolInventory();
        this.pieces = this.pieces.filter((piece) => piece.id !== id);
        this.dischargeLightning([removed]);
        if (this.rulesVersion >= exports.SCORING_RULES_VERSION)
            this.addScore(exports.HAMMER_SCORE_V18);
        else
            this.addToolScore(1);
        this.roundActions.push({ type: 'hammer', id });
        return true;
    }
    grantRewardedHammer() {
        this.hammerCount++;
        this.saveToolInventory();
    }
    useColorPurifier(color) {
        if (this.colorPurifierCount <= 0 || (this.rulesVersion >= 12 && this.wandUses >= getRoundToolLimit('magicWand', this.rulesVersion)))
            return [];
        const removedPieceIds = this.pieces
            .filter((piece) => piece.color === color)
            .map((piece) => piece.id);
        if (removedPieceIds.length === 0)
            return [];
        this.beginPlayerAction();
        this.wandUses++;
        this.colorPurifierCount--;
        this.saveToolInventory();
        const removedSet = {};
        removedPieceIds.forEach((id) => removedSet[id] = true);
        const removed = this.pieces.filter(piece => removedSet[piece.id]);
        this.pieces = this.pieces.filter((piece) => !removedSet[piece.id]);
        this.dischargeLightning(removed);
        if (this.rulesVersion >= exports.SCORING_RULES_VERSION)
            this.addScore(exports.WAND_SCORE_V18);
        else
            this.addToolScore(removedPieceIds.length);
        this.roundActions.push({ type: 'purify', color });
        return removedPieceIds;
    }
    grantRewardedColorPurifier() {
        this.colorPurifierCount++;
        this.saveToolInventory();
    }
    hasEnteredRescueZone(emptyRows = 2) {
        if (this.pieces.length === 0)
            return false;
        const topmostRow = this.pieces.reduce((minimum, piece) => Math.min(minimum, piece.row), exports.BOARD_ROWS);
        return topmostRow <= Math.max(0, emptyRows);
    }
    getOccupiedRowCount() {
        const occupiedRows = {};
        this.pieces.forEach((piece) => occupiedRows[piece.row] = true);
        return Object.keys(occupiedRows).length;
    }
    getBoardHeight() {
        return this.pieces.length ? exports.BOARD_ROWS - Math.min(...this.pieces.map(piece => piece.row)) : 0;
    }
    canOfferBalloonRescue() {
        return this.rulesVersion >= 6 && this.rulesVersion < 8 && !this.balloonAvailable
            && this.score > 1000 && this.getBoardHeight() > 6 && !this.isGameOver();
    }
    canOfferRoundRescue(elapsedMs) {
        const automatic = this.rulesVersion >= exports.AUTO_RESCUE_RULES_VERSION;
        return this.rulesVersion >= 8 && !this.rescueKind && !this.heartAvailable
            && (automatic ? !this.actionOpen : this.score > 500) && this.getBoardHeight() > 6
            && (this.rulesVersion < 12 || this.rescueOfferCounts.balloon < 4 || this.rescueOfferCounts.clear < 4)
            && !this.isGameOver() && Number.isSafeInteger(elapsedMs) && elapsedMs >= 0
            && (automatic ? elapsedMs >= this.rescueNextOfferAt
                : elapsedMs - this.rescueLastOfferedAt >= (this.rulesVersion >= 14 ? 30000 : 60000));
    }
    getRoundRescueReadyAt() { return this.rescueNextOfferAt; }
    offerRoundRescue(elapsedMs) {
        if (!this.canOfferRoundRescue(elapsedMs))
            return null;
        if (this.rulesVersion >= exports.AUTO_RESCUE_RULES_VERSION) {
            this.rescueKind = this.lastRescueKind === 'clear' ? 'balloon' : 'clear';
            this.lastRescueKind = this.rescueKind;
        }
        else {
            const roll = this.random();
            this.rescueKind = this.rulesVersion >= 12 && this.rescueOfferCounts.balloon >= 4 ? 'clear'
                : this.rulesVersion >= 12 && this.rescueOfferCounts.clear >= 4 ? 'balloon' : roll < 0.5 ? 'balloon' : 'clear';
        }
        this.rescueOfferCounts[this.rescueKind]++;
        this.rescueLastOfferedAt = elapsedMs;
        this.roundActions.push({ type: 'rescueOffer', elapsedMs, kind: this.rescueKind });
        return this.rescueKind;
    }
    closeRoundRescue(type, elapsedMs) {
        if (this.rulesVersion >= exports.AUTO_RESCUE_RULES_VERSION) {
            if (!Number.isSafeInteger(elapsedMs) || elapsedMs < this.rescueLastOfferedAt)
                return false;
            this.rescueNextOfferAt = elapsedMs + exports.ROUND_RESCUE_COOLDOWN_MS;
            this.roundActions.push({ type, elapsedMs });
        }
        else {
            this.roundActions.push({ type });
        }
        this.rescueKind = null;
        return true;
    }
    dismissRoundRescue(elapsedMs) {
        return !!this.rescueKind && this.closeRoundRescue('rescueDismiss', elapsedMs);
    }
    /** V9 清屏按实际色块加分，补排固定为两排；历史局保留原规则。 */
    applyClearRescue(elapsedMs) {
        if (this.rulesVersion < 8 || this.rescueKind !== 'clear' || !this.closeRoundRescue('rescueClear', elapsedMs))
            return null;
        this.beginPlayerAction('video');
        const ids = this.pieces.map(piece => piece.id);
        const removed = this.pieces.slice();
        this.pieces = [];
        this.dischargeLightning(removed);
        if (this.rulesVersion >= exports.SCORING_RULES_VERSION)
            this.addScore(removed.reduce((cells, piece) => cells + piece.size, 0) * CLEAR_CELL_SCORE_V18);
        else
            this.addToolScore(ids.length);
        if (this.rulesVersion >= 9)
            this.rescueRiseRows = 2;
        return ids;
    }
    offerBalloonRescue() {
        if (!this.canOfferBalloonRescue())
            return false;
        this.balloonAvailable = true;
        this.roundActions.push({ type: 'balloonOffer' });
        return true;
    }
    dismissBalloonRescue(elapsedMs) {
        if (this.rulesVersion >= 8)
            return this.dismissRoundRescue(elapsedMs);
        if (!this.balloonAvailable)
            return false;
        this.balloonAvailable = false;
        this.roundActions.push({ type: 'balloonDismiss' });
        return true;
    }
    /** 只读预演，投弹期间棋盘锁定；实际消除时才消费同一段种子序列。 */
    getBalloonTargets() {
        const state = this.randomState;
        try {
            return this.shuffle(this.pieces.slice()).slice(0, Math.ceil(this.pieces.length / 4));
        }
        finally {
            this.randomState = state;
        }
    }
    applyBalloonRescue(elapsedMs) {
        // 出现时检查高度，兑换时兑现已出现的机会；期间玩家消行降高也不会白分享。
        if (this.rulesVersion < 6 || (this.rulesVersion >= 8 ? this.rescueKind !== 'balloon' : !this.balloonAvailable))
            return null;
        if (!this.closeRoundRescue('balloon', elapsedMs))
            return null;
        this.balloonAvailable = false;
        if (this.rulesVersion >= 9) {
            this.beginPlayerAction('video');
            this.rescueRiseRows = 1;
        }
        const targets = this.shuffle(this.pieces.slice()).slice(0, Math.ceil(this.pieces.length / 4));
        if (this.rulesVersion >= 7) {
            // 投弹落点视作炸弹，复用普通炸弹范围与旧炸弹连锁。
            return this.removeWithBombs(targets.map(piece => (Object.assign(Object.assign({}, piece), { bomb: true }))), []);
        }
        const ids = new Set(targets.map(piece => piece.id));
        const moods = targets.filter(piece => piece.stampMood > 0).map(piece => piece.stampMood);
        this.pieces = this.pieces.filter(piece => !ids.has(piece.id));
        this.roundCollectedMoodBeans += moods.length;
        // V6历史对局保留只移除抽中块的规则，确保旧客户端和离线局可结算。
        return { clearedRows: 0, gainedScore: 0, removedPieceIds: targets.map(piece => piece.id),
            clearedRowIndexes: [], collectedMoodTypes: moods, detonatedBombs: [] };
    }
    /** 独立的免费心意救场：每局一次，只检查危险高度，不要求分数、分享或普通救场CD。 */
    canOfferHeartRescue() {
        return this.rulesVersion >= 10 && this.heartRescueEligible && !this.heartOffered && !this.isGameOver()
            && this.hasEnteredRescueZone(2);
    }
    offerHeartRescue(elapsedMs) {
        if (this.rescueKind || !this.canOfferHeartRescue() || !Number.isSafeInteger(elapsedMs) || elapsedMs < 2000)
            return false;
        this.heartOffered = this.heartAvailable = true;
        this.roundActions.push({ type: 'heartOffer', elapsedMs });
        return true;
    }
    dismissHeartRescue() {
        if (!this.heartAvailable)
            return false;
        this.heartAvailable = false;
        this.roundActions.push({ type: 'heartDismiss' });
        return true;
    }
    applyHeartRescue() {
        if (this.rulesVersion < 10 || !this.heartAvailable)
            return null;
        this.heartAvailable = false;
        this.beginPlayerAction('system');
        this.rescueRiseRows = 1;
        const targets = this.shuffle(this.pieces.slice()).slice(0, Math.ceil(this.pieces.length / 4));
        this.roundActions.push({ type: 'heart' });
        return this.removeWithBombs(targets.map(piece => (Object.assign(Object.assign({}, piece), { bomb: true }))), [], true);
    }
    removeMostCommonColor() {
        const stats = {};
        for (const piece of this.pieces) {
            if (!stats[piece.color])
                stats[piece.color] = { count: 0, cells: 0 };
            stats[piece.color].count++;
            stats[piece.color].cells += piece.size;
        }
        const colors = Object.keys(stats).map((value) => Number(value));
        if (colors.length === 0)
            return { color: 0, removedPieceIds: [] };
        colors.sort((left, right) => {
            const countDifference = stats[right].count - stats[left].count;
            if (countDifference !== 0)
                return countDifference;
            const cellDifference = stats[right].cells - stats[left].cells;
            if (cellDifference !== 0)
                return cellDifference;
            return left - right;
        });
        const color = colors[0];
        const removedPieceIds = this.pieces
            .filter((piece) => piece.color === color)
            .map((piece) => piece.id);
        const removedSet = {};
        removedPieceIds.forEach((id) => removedSet[id] = true);
        this.pieces = this.pieces.filter((piece) => !removedSet[piece.id]);
        return { color, removedPieceIds };
    }
    removeAllPieces() {
        this.beginPlayerAction('system');
        const removedPieceIds = this.pieces.map((piece) => piece.id);
        this.pieces = [];
        this.roundActions.push({ type: 'clear' });
        return removedPieceIds;
    }
    removeTopRowsForRevive(rowCount = 8, useCard = false) {
        if (useCard && this.rulesVersion < 11)
            return [];
        if (this.rulesVersion >= 11) {
            const adCount = this.roundActions.filter(action => action.type === 'revive').length;
            const cardCount = this.roundActions.filter(action => action.type === 'reviveCard').length;
            if (rowCount !== 8 || !this.isGameOver() || cardCount > 0 || (useCard ? adCount !== 1 : adCount !== 0))
                return [];
        }
        const firstPreservedRow = Math.max(0, Math.min(exports.BOARD_ROWS, Math.floor(rowCount)));
        const removedPieceIds = this.pieces
            .filter((piece) => piece.row < firstPreservedRow)
            .map((piece) => piece.id);
        if (removedPieceIds.length === 0)
            return [];
        this.beginPlayerAction(useCard ? 'system' : 'video');
        const removedSet = {};
        removedPieceIds.forEach((id) => removedSet[id] = true);
        this.pieces = this.pieces.filter((piece) => !removedSet[piece.id]);
        this.roundActions.push({ type: useCard ? 'reviveCard' : 'revive', rowCount });
        return removedPieceIds;
    }
    findEliminationHint() {
        const easy = this.easyMoves(this.pieces);
        if (easy.length)
            return { id: easy[0].id, offset: easy[0].offset };
        for (const piece of this.pieces.slice().sort((a, b) => b.row - a.row)) {
            const range = this.getMoveRange(piece.id);
            for (let offset = range.min; offset <= range.max; offset++) {
                if (offset && this.wouldCreateFullRow(piece, offset))
                    return { id: piece.id, offset };
            }
        }
        return null;
    }
    beginPlayerAction(source = 'player') {
        if (this.actionOpen)
            this.finishPlayerAction();
        this.difficultyActionCount++;
        this.prepareSecondRow(this.difficultyActionCount);
        this.actionOpen = true;
        this.actionSource = source;
        this.comboActionCleared = this.actionBlast = this.pendingComboBomb = false;
        this.actionRows = this.actionCascade = this.actionAppends = 0;
    }
    /** 整次操作（含补排）结束后才发次生炸弹，新炸弹不会参与自己的出生连锁。 */
    finishPlayerAction() {
        if (!this.actionOpen)
            return [];
        this.roundActions.push({ type: 'finish' });
        if (!this.comboActionCleared && !this.actionBlast)
            this.combo = 0;
        this.recentMisses = this.comboActionCleared || this.actionBlast ? 0 : this.recentMisses + 1;
        const rewards = [];
        // 新闪电在当前连锁完成后出生，不参与产生它的消除；不与炸弹共用宿主。
        while (this.rulesVersion < 13 && this.pendingLightningCount > 0) {
            const candidates = this.pieces.filter(piece => piece.size === 1 && !piece.bomb && !piece.lightning);
            if (!candidates.length) {
                // 没有安全宿主时出现在已展示的下一排，不拆当前长块制造未结算悬空。
                const next = this.nextPieces.find(piece => !piece.lightning);
                if (!next)
                    break;
                const cells = [];
                for (let cell = 0; cell < next.size; cell++)
                    cells.push(Object.assign(Object.assign({}, next), { col: next.col + cell, size: 1, stampMood: cell === next.stampCell ? next.stampMood : 0, stampCell: 0, collectibleType: cell === next.collectibleCell ? next.collectibleType : 0, collectibleCell: 0, lightning: cell === 0 }));
                this.nextPieces.splice(this.nextPieces.indexOf(next), 1, ...cells);
                this.pendingLightningCount--;
                continue;
            }
            const target = candidates[Math.floor(this.random() * candidates.length)];
            const cell = target;
            cell.lightning = true;
            rewards.push(cell);
            this.pendingLightningCount--;
        }
        const count = (this.actionRows >= 2 ? 1 : 0) + (this.pendingComboBomb ? 1 : 0);
        for (let index = 0; index < count; index++) {
            const bomb = this.awardBomb(2);
            if (bomb)
                rewards.push(bomb);
        }
        if (this.rulesVersion >= 13)
            this.placePendingSpecials();
        this.pendingComboBomb = false;
        this.actionOpen = false;
        this.rescueRiseRows = 0;
        this.finishDifficultyWave();
        this.prepareSecondRow(this.difficultyActionCount + 1);
        return rewards;
    }
    finishDifficultyWave() {
        if (this.rulesVersion < DIFFICULTY_WAVE_RULES_VERSION || this.difficultyActionCount < this.getDifficultyTiming().hard)
            return;
        const dangerous = this.getBoardHeight() >= 8;
        const enteredDanger = dangerous && !this.hardDanger;
        this.hardDanger = dangerous;
        if (this.reliefRowsRemaining > 0) {
            if (this.actionSource === 'player')
                this.reliefRowsRemaining = Math.max(0, this.reliefRowsRemaining - this.actionRows);
            return;
        }
        if (this.actionSource === 'video') {
            this.reliefRowsRemaining = RELIEF_CLEAR_ROWS;
            this.assistedRowsRemaining = this.hardMisses = 0;
            return;
        }
        if (this.actionSource !== 'player') {
            this.hardMisses = 0;
            return;
        }
        this.hardMisses = this.actionRows ? 0 : this.hardMisses + 1;
        if (enteredDanger || this.hardMisses >= 3) {
            this.assistedRowsRemaining = Math.max(this.assistedRowsRemaining, enteredDanger ? 2 : 1);
            this.hardMisses = 0;
        }
    }
    resolveBoard() {
        let clearedRows = 0;
        let gainedScore = 0;
        while (true) {
            this.applyGravity();
            const result = this.eliminateFullRows();
            if (result.clearedRows === 0)
                break;
            clearedRows += result.clearedRows;
            gainedScore += result.gainedScore;
        }
        return { clearedRows, gainedScore };
    }
    awardBomb(clearedRows) {
        if (clearedRows < 2)
            return null;
        if (this.rulesVersion >= 13) {
            const reserved = this.pieces.filter(piece => piece.bomb).length
                + this.nextPieces.filter(piece => piece.bomb).length + this.pendingBombCount;
            if (reserved < exports.MAX_BOARD_BOMBS)
                this.pendingBombCount++;
            return null;
        }
        if (this.pieces.filter((piece) => piece.bomb).length >= exports.MAX_BOARD_BOMBS)
            return null;
        const eligible = this.pieces.filter(piece => !piece.bomb && (this.rulesVersion < 12 || !piece.lightning));
        let target = this.rulesVersion >= 6 ? eligible[Math.floor(this.random() * eligible.length)]
            : eligible.sort((a, b) => b.row - a.row || a.col - b.col || a.id - b.id)[0];
        if (!target) {
            if (this.rulesVersion >= 6) {
                for (let row = exports.BOARD_ROWS - 1; row >= 0 && !target; row--) {
                    const empty = Array.from({ length: exports.BOARD_COLS }, (_, col) => col).filter(col => !this.pieces.some(piece => piece.row === row && col >= piece.col && col < piece.col + piece.size));
                    if (empty.length) {
                        target = this.createPiece(row, empty[Math.floor(this.random() * empty.length)], 1, 1, 0);
                        this.pieces.push(target);
                    }
                }
            }
            else {
                // 旧规则保留原先的奖励落点，以便重放历史对局。
                for (let row = exports.BOARD_ROWS - 1; row >= 0 && !target; row--) {
                    for (let col = 0; col < exports.BOARD_COLS && !target; col++) {
                        if (this.pieces.some((piece) => piece.row === row && col >= piece.col && col < piece.col + piece.size))
                            continue;
                        target = this.createPiece(row, col, 1, 1, 0);
                        this.pieces.push(target);
                    }
                }
            }
        }
        if (!target)
            return null;
        target.bomb = true;
        return target;
    }
    detonateBomb(id) {
        const bomb = this.getPiece(id);
        if (!bomb || !bomb.bomb)
            return null;
        this.beginPlayerAction();
        this.roundActions.push({ type: 'bomb', id });
        return this.removeWithBombs([bomb], []);
    }
    activateLightning(id) {
        const piece = this.getPiece(id);
        if (this.rulesVersion < exports.TAP_LIGHTNING_RULES_VERSION || !piece || !piece.lightning || this.isGameOver())
            return null;
        if (this.currentRoundIsTutorial && this.moveCount < this.tutorialMoves.length)
            return null;
        this.beginPlayerAction();
        this.roundActions.push({ type: 'lightning', id });
        this.actionBlast = true;
        return this.removeWithBombs([piece], []);
    }
    /** 对移除集合做炸弹闭包；每枚旧炸弹、每块表情最多结算一次。 */
    removeWithBombs(initial, rows, heart = false) {
        const previousScore = this.score;
        const removed = new Set(initial.map((piece) => piece.id));
        const waveScoring = this.rulesVersion >= exports.SCORING_RULES_VERSION;
        const queue = initial.filter((piece) => piece.bomb);
        const detonations = [];
        for (let index = 0; index < queue.length; index++) {
            const bomb = queue[index];
            const center = bomb.col + bomb.size / 2;
            const affectedPieceIds = [];
            for (const piece of this.pieces) {
                if (Math.abs(piece.row - bomb.row) > 1
                    || piece.col >= center + 1.5 || piece.col + piece.size <= center - 1.5)
                    continue;
                affectedPieceIds.push(piece.id);
                if (removed.has(piece.id))
                    continue;
                removed.add(piece.id);
                if (piece.bomb)
                    queue.push(piece);
            }
            const score = heart && initial.includes(bomb) ? HEART_SCORE_V18 : BOMB_SCORE_V18;
            detonations.push(Object.assign({ id: bomb.id, row: bomb.row, col: bomb.col, size: bomb.size, affectedPieceIds }, (waveScoring ? { score } : {})));
        }
        const removedPieces = this.pieces.filter((piece) => removed.has(piece.id));
        const moods = removedPieces.filter((piece) => piece.stampMood > 0).map((piece) => piece.stampMood);
        this.pieces = this.pieces.filter((piece) => !removed.has(piece.id));
        this.dischargeLightning(removedPieces);
        this.roundCollectedMoodBeans += moods.length;
        if (queue.length)
            this.actionBlast = true;
        let gainedScore;
        if (waveScoring) {
            this.addScore(detonations.reduce((total, blast) => total + blast.score, 0));
            gainedScore = this.score - previousScore;
        }
        else {
            const blastIds = new Set();
            detonations.forEach(bomb => bomb.affectedPieceIds.forEach(id => blastIds.add(id)));
            gainedScore = this.addToolScore(blastIds.size);
        }
        return { clearedRows: rows.length, gainedScore, removedPieceIds: removedPieces.map((piece) => piece.id),
            clearedRowIndexes: rows, collectedMoodTypes: moods, detonatedBombs: detonations };
    }
    addToolScore(count) {
        return this.addScore(this.rulesVersion >= 9 ? count * 5 : 0);
    }
    addScore(gained) {
        this.score += gained;
        this.bestScore = Math.max(this.bestScore, this.score);
        return gained;
    }
    applyGravity() {
        const moves = [];
        const ordered = this.pieces.slice().sort((a, b) => b.row - a.row);
        for (const piece of ordered) {
            const fromRow = piece.row;
            while (piece.row < exports.BOARD_ROWS - 1 && this.canOccupy(piece, piece.row + 1)) {
                piece.row++;
            }
            if (piece.row !== fromRow)
                moves.push({ id: piece.id, fromRow, toRow: piece.row });
        }
        return moves;
    }
    eliminateFullRows() {
        // settle 记录真实结算边界，教学批量补排也能按原顺序重放。
        this.roundActions.push({ type: 'settle' });
        const fullRows = this.findFullRows();
        if (!fullRows.length)
            return { clearedRows: 0, gainedScore: 0, removedPieceIds: [],
                clearedRowIndexes: [], collectedMoodTypes: [], detonatedBombs: [] };
        if (!this.actionOpen)
            this.beginPlayerAction('system');
        const result = this.removeWithBombs(this.pieces.filter((piece) => fullRows.indexOf(piece.row) >= 0), fullRows);
        const waveScoring = this.rulesVersion >= exports.SCORING_RULES_VERSION;
        if (waveScoring || !this.comboActionCleared) {
            this.combo = Math.min(5, this.combo + 1);
            this.comboActionCleared = true;
            if (this.combo === 3 || (this.rulesVersion >= 5 && this.combo >= 3))
                this.pendingComboBomb = true;
        }
        this.actionRows += fullRows.length;
        this.actionCascade++;
        result.combo = this.combo;
        result.cascade = this.actionCascade;
        const baseScore = fullRows.length * (waveScoring ? ROW_SCORE_V18 * COMBO_MULTIPLIERS_V18[this.combo - 1] : 10 * this.combo);
        if (waveScoring)
            result.rowScore = baseScore;
        result.gainedScore += baseScore;
        this.score += baseScore;
        this.roundClearedRows += fullRows.length;
        if (this.rulesVersion >= 12) {
            const lightningInterval = this.rulesVersion >= 15 ? 10 : 20;
            this.pendingLightningCount += Math.floor(this.roundClearedRows / lightningInterval)
                - Math.floor((this.roundClearedRows - fullRows.length) / lightningInterval);
        }
        this.bestScore = Math.max(this.bestScore, this.score);
        return result;
    }
    appendNextRow(recordAction = true) {
        if (this.pieces.some((piece) => piece.row === 0) || this.actionAppends >= exports.MAX_ACTION_APPENDS)
            return false;
        this.actionAppends++;
        if (recordAction)
            this.roundActions.push({ type: 'append' });
        for (const piece of this.pieces)
            piece.row--;
        for (const next of this.nextPieces) {
            const piece = this.createPiece(exports.BOARD_ROWS - 1, next.col, next.size, next.color, next.stampMood, next.stampCell, next.collectibleType, next.collectibleCell);
            if (next.lightning)
                piece.lightning = true;
            if (next.bomb)
                piece.bomb = true;
            this.pieces.push(piece);
        }
        this.turn++;
        if (this.rulesVersion >= 5 && this.secondNextPieces.length) {
            this.nextPieces = this.secondNextPieces;
            this.secondNextPieces = [];
        }
        else
            this.nextPieces = this.generateNextRow();
        if (this.rulesVersion >= 13)
            this.placePendingSpecials();
        return true;
    }
    /** 一次整体升起已预告的1/2排；空间不足时不产生半次上升。 */
    appendTurnRows() {
        if (this.rulesVersion < 5)
            return this.appendNextRow();
        const rows = this.getRiseRowCount();
        if (this.actionAppends + rows > exports.MAX_ACTION_APPENDS || this.pieces.some(piece => piece.row < rows))
            return false;
        this.prepareSecondRow(this.difficultyActionCount);
        this.roundActions.push({ type: 'rise', rows });
        for (let index = 0; index < rows; index++)
            this.appendNextRow(false);
        return true;
    }
    getRiseRowCount(actions = this.difficultyActionCount) {
        if (this.rescueRiseRows)
            return this.rescueRiseRows;
        const timing = this.getDifficultyTiming();
        if (this.rulesVersion < 5 || actions <= timing.opening)
            return 1;
        if (this.rulesVersion >= 6 && this.getBoardHeight() > 4)
            return 1;
        if (this.reliefRowsRemaining > 0)
            return 1;
        if (actions < timing.advanced)
            return (actions - timing.opening - 1) % 4 === 0 ? 2 : 1;
        if (actions < timing.master || this.rulesVersion >= DIFFICULTY_WAVE_RULES_VERSION)
            return (actions - timing.advanced) % 2 === 0 ? 2 : 1;
        return 2;
    }
    isGameOver() {
        return this.pieces.some((piece) => piece.row === 0);
    }
    canOccupy(piece, row) {
        return !this.pieces.some((other) => {
            if (other.id === piece.id || other.row !== row)
                return false;
            const pieceEnd = piece.col + piece.size;
            const otherEnd = other.col + other.size;
            return piece.col < otherEnd && pieceEnd > other.col;
        });
    }
    /** 保留总占格；原ID、表情、收藏物和旧炸弹各自只落在一个对应单格上。 */
    splitPiece(piece) {
        this.nextId = Math.max(this.nextId, ...this.pieces.map(item => item.id + 1));
        const fragments = [];
        for (let cell = 0; cell < piece.size; cell++) {
            fragments.push(Object.assign(Object.assign({}, piece), { id: cell === 0 ? piece.id : this.nextId++, col: piece.col + cell, size: 1, stampMood: piece.stampCell === cell ? piece.stampMood : 0, stampCell: 0, collectibleType: piece.collectibleCell === cell ? piece.collectibleType : 0, collectibleCell: 0, bomb: !!piece.bomb && cell === Math.floor(piece.size / 2), lightning: false }));
        }
        const index = this.pieces.findIndex(item => item.id === piece.id);
        this.pieces.splice(index, 1, ...fragments);
        return fragments;
    }
    /** 在下一排随机列预告，拆出宿主单格；不改动棋盘上的既有块。 */
    placePendingSpecials() {
        for (const kind of ['lightning', 'bomb']) {
            while ((kind === 'lightning' ? this.pendingLightningCount : this.pendingBombCount) > 0) {
                let columns = Array.from({ length: exports.BOARD_COLS }, (_, col) => col).filter(col => !this.nextPieces.some(piece => (piece.lightning || piece.bomb) && col >= piece.col && col < piece.col + piece.size));
                if (!columns.length)
                    break;
                if (columns.length > 1)
                    columns = columns.filter(col => col !== this.lastSpecialCol);
                const col = columns[Math.floor(this.random() * columns.length)];
                this.lastSpecialCol = col;
                const host = this.nextPieces.find(piece => col >= piece.col && col < piece.col + piece.size);
                if (host) {
                    // 左右普通段保持原宽度；表情与收藏只保留在原对应格上。
                    const offset = col - host.col;
                    const segments = [{ start: 0, size: offset }, { start: offset, size: 1 },
                        { start: offset + 1, size: host.size - offset - 1 }].filter(segment => segment.size > 0);
                    const pieces = segments.map(segment => (Object.assign(Object.assign({}, host), { col: host.col + segment.start, size: segment.size, stampMood: host.stampCell >= segment.start && host.stampCell < segment.start + segment.size ? host.stampMood : 0, stampCell: Math.max(0, host.stampCell - segment.start), collectibleType: host.collectibleCell >= segment.start && host.collectibleCell < segment.start + segment.size ? host.collectibleType : 0, collectibleCell: Math.max(0, host.collectibleCell - segment.start), lightning: kind === 'lightning' && segment.start === offset, bomb: kind === 'bomb' && segment.start === offset })));
                    this.nextPieces.splice(this.nextPieces.indexOf(host), 1, ...pieces);
                }
                else {
                    this.nextPieces.push({ col, size: 1, color: 4, stampMood: 0, stampCell: 0,
                        collectibleType: 0, collectibleCell: 0, lightning: kind === 'lightning', bomb: kind === 'bomb' });
                }
                this.nextPieces.sort((a, b) => a.col - b.col);
                if (kind === 'lightning')
                    this.pendingLightningCount--;
                else
                    this.pendingBombCount--;
            }
        }
    }
    /** V13每次抽取最多五个不同存活块，长块拆分，单格碎除；V12仍按旧规则重放。 */
    dischargeLightning(removed) {
        if (this.rulesVersion < 12)
            return;
        for (const source of removed.filter(piece => piece.lightning)) {
            const candidates = this.shuffle(this.pieces.filter(piece => this.rulesVersion >= 13 || (!piece.lightning && piece.size > 1)));
            const effect = { source: Object.assign({}, source), targets: [] };
            this.lightningEffects.push(effect);
            for (const candidate of candidates.slice(0, this.rulesVersion >= 13 ? 5 : 3)) {
                const piece = this.getPiece(candidate.id);
                if (!piece)
                    continue; // 之前命中的单格炸弹可能已将它纳入爆炸闭包。
                const original = Object.assign({}, piece);
                if (piece.size > 1) {
                    const fragments = this.splitPiece(piece).map(cell => (Object.assign({}, cell)));
                    const score = this.rulesVersion >= exports.SCORING_RULES_VERSION ? this.addScore(fragments.length * LIGHTNING_CELL_SCORE_V18) : undefined;
                    effect.targets.push({ original, fragments, score });
                }
                else {
                    const shattered = this.removeWithBombs([piece], []);
                    const score = this.rulesVersion >= exports.SCORING_RULES_VERSION ? this.addScore(LIGHTNING_CELL_SCORE_V18) : undefined;
                    if (score !== undefined)
                        shattered.gainedScore += score;
                    else if (!piece.bomb)
                        shattered.gainedScore += this.addToolScore(1);
                    effect.targets.push({ original, fragments: [], shattered, score });
                }
            }
        }
    }
    findFullRows() {
        const fullRows = [];
        for (let row = 0; row < exports.BOARD_ROWS; row++) {
            const occupied = new Array(exports.BOARD_COLS).fill(false);
            for (const piece of this.pieces) {
                if (piece.row !== row)
                    continue;
                for (let col = piece.col; col < piece.col + piece.size; col++)
                    occupied[col] = true;
            }
            if (occupied.every((value) => value))
                fullRows.push(row);
        }
        return fullRows;
    }
    /** 先给足读盘空间，再增加一层支撑，承接双排和掉落连锁。 */
    getRefillRowTarget() {
        return this.moveCount < 6 ? 3 : 4;
    }
    getDifficultyTiming() {
        return this.rulesVersion >= SHORT_OPENING_RULES_VERSION ? SHORT_DIFFICULTY_TIMING : ORIGINAL_DIFFICULTY_TIMING;
    }
    getDifficulty() {
        if (this.rulesVersion >= 5) {
            const actions = this.difficultyActionCount;
            const timing = this.getDifficultyTiming();
            const original = ORIGINAL_DIFFICULTY_TIMING;
            const stage = actions <= timing.opening ? 0 : actions < timing.advanced ? 1 : actions < timing.master ? 2 : 3;
            let curveAction = actions;
            if (this.rulesVersion >= SHORT_OPENING_RULES_VERSION) {
                // 将缩短的开场映射回原曲线，保持下一阶段起点和封顶难度。
                curveAction = actions < timing.advanced
                    ? original.opening + (actions - timing.opening) * (original.advanced - original.opening) / (timing.advanced - timing.opening)
                    : original.advanced + actions - timing.advanced;
            }
            let progress = Math.max(0, Math.min(1, (curveAction - original.opening) / (original.master - original.opening)));
            if (this.rulesVersion >= DIFFICULTY_WAVE_RULES_VERSION) {
                progress = Math.min(progress, HARD_DIFFICULTY_PROGRESS);
                if (this.reliefRowsRemaining > 0) {
                    const relief = Math.min(this.reliefRowsRemaining, RELIEF_RAMP_ROWS) / RELIEF_RAMP_ROWS;
                    progress += (RELIEF_DIFFICULTY_PROGRESS - progress) * relief;
                }
            }
            return { stage, label: ['连消时刻', '进阶挑战', '高手挑战', '大师挑战'][stage], progress };
        }
        // V4再次加快，并把炸弹/道具等有效操作计入；V2/V3在途局保留各自曲线。
        const difficultyMoves = this.rulesVersion >= 4 ? this.difficultyActionCount * 4
            : this.moveCount * (this.rulesVersion >= 3 ? 2 : 1);
        const progress = Math.max(0, Math.min(1, (difficultyMoves - 36) / 48));
        const stage = difficultyMoves <= 36 ? 0 : difficultyMoves < 60 ? 1 : difficultyMoves < 84 ? 2 : 3;
        return { stage, label: ['连消时刻', '进阶挑战', '高手挑战', '大师挑战'][stage], progress };
    }
    getHintDelay() {
        return this.rulesVersion >= 4 ? 2 + this.getDifficulty().progress * 6 : 2;
    }
    getAssistanceChance(height, bombs) {
        if (this.assistedRowsRemaining > 0)
            return 1;
        const current = this.rulesVersion >= 4;
        const base = 1 - this.getDifficulty().progress * (current ? 0.85 : 0.65);
        return Math.min(1, base + (height >= 7 && !bombs ? (current ? 0.08 : 0.15) : 0)
            + Math.min(current ? 0.06 : 0.12, this.recentMisses * (current ? 0.02 : 0.04)));
    }
    preview(pieces) {
        const simulation = new BoardEngine();
        simulation.rulesVersion = this.rulesVersion;
        simulation.randomState = this.randomState;
        simulation.pieces = pieces.map((piece) => (Object.assign({}, piece)));
        let rows = 0;
        let waves = 0;
        while (true) {
            simulation.applyGravity();
            const full = simulation.findFullRows();
            if (!full.length)
                break;
            rows += full.length;
            waves++;
            simulation.removeWithBombs(simulation.pieces.filter((piece) => full.indexOf(piece.row) >= 0), full);
        }
        return { pieces: simulation.pieces, rows, waves };
    }
    easyMoves(pieces) {
        const simulation = new BoardEngine();
        simulation.pieces = pieces;
        const moves = [];
        for (const piece of pieces) {
            const range = simulation.getMoveRange(piece.id);
            for (const offset of [-1, 1, -2, 2]) {
                if (offset < range.min || offset > range.max)
                    continue;
                const result = this.preview(pieces.map((item) => item.id === piece.id
                    ? Object.assign(Object.assign({}, item), { col: item.col + offset }) : item));
                if (result.rows)
                    moves.push({ id: piece.id, offset, rows: result.rows, waves: result.waves });
            }
        }
        return moves.sort((a, b) => b.rows - a.rows || b.waves - a.waves || Math.abs(a.offset) - Math.abs(b.offset));
    }
    rowWithGap(col, size) {
        const pieces = [];
        for (let cell = 0; cell < exports.BOARD_COLS;) {
            if (cell === col) {
                cell += size;
                continue;
            }
            const available = cell < col ? col - cell : exports.BOARD_COLS - cell;
            const length = this.rulesVersion >= 5 ? this.pickBlockSize(Math.min(3, available))
                : Math.min(available, 1 + Math.floor(this.random() * 3));
            const color = this.pickMoodColor();
            pieces.push({ col: cell, size: length, color, stampMood: this.random() < 0.5 ? color : 0,
                stampCell: 0, collectibleType: 0, collectibleCell: 0 });
            cell += length;
        }
        if (this.rulesVersion >= 6 && this.random() < 0.5) {
            pieces.forEach(piece => piece.col = exports.BOARD_COLS - piece.col - piece.size);
            pieces.sort((a, b) => a.col - b.col);
        }
        return { pieces, sizes: pieces.map((piece) => piece.size), gaps: [], movablePieces: this.countMovableNextPieces(pieces) };
    }
    generateNextRow() {
        const stable = this.preview(this.pieces).pieces;
        const height = stable.length ? exports.BOARD_ROWS - Math.min(...stable.map((piece) => piece.row)) : 0;
        const bombs = stable.filter((piece) => piece.bomb).length;
        const help = this.random() < this.getAssistanceChance(height, bombs);
        if (this.assistedRowsRemaining > 0)
            this.assistedRowsRemaining--;
        const candidates = [];
        const targetCells = this.pickTargetCells();
        for (let index = 0; index < 6; index++)
            candidates.push(this.createNextRowCandidate(targetCells));
        if (help) {
            for (let gap = 1; gap <= 3; gap++) {
                for (let col = 0; col <= exports.BOARD_COLS - gap; col++)
                    candidates.push(this.rowWithGap(col, gap));
            }
        }
        // 同分候选不再总是取枚举最靠左的空位，保留辅助评分但消除固定遍历偏差。
        if (this.rulesVersion >= 6)
            this.shuffle(candidates);
        // 预判下一次容易识别的移动，再选择它之后仍有容易解/连锁的出排。
        const moves = help ? this.easyMoves(stable) : [];
        const plans = [];
        if (new Set(stable.map((piece) => piece.row)).size >= 3 && moves.length) {
            // 覆盖多个容易解分支，避免只照顾提示选中的唯一最优答案。
            const indexes = Array.from(new Set([0, Math.floor(moves.length / 2), moves.length - 1]));
            for (const index of indexes) {
                const move = moves[index];
                plans.push(this.preview(stable.map((piece) => piece.id === move.id
                    ? Object.assign(Object.assign({}, piece), { col: piece.col + move.offset }) : piece)).pieces);
            }
        }
        else
            plans.push(stable);
        let best = candidates[0];
        let bestValue = -Infinity;
        for (const candidate of candidates) {
            const values = [];
            for (const projected of plans) {
                const input = projected.map((piece) => (Object.assign(Object.assign({}, piece), { row: piece.row - 1 })));
                candidate.pieces.forEach((piece, index) => input.push(Object.assign(Object.assign({}, piece), { row: 9, id: -index - 1 })));
                if (input.some((piece) => piece.row < 0)) {
                    values.push(-1000);
                    continue;
                }
                const result = this.preview(input);
                const options = help || this.rulesVersion >= 4 ? this.easyMoves(result.pieces) : [];
                const top = options[0];
                const nextHeight = result.pieces.length ? 10 - Math.min(...result.pieces.map((piece) => piece.row)) : 0;
                values.push(help
                    ? (top ? 30 + Math.min(3, top.rows) * 12 + Math.min(3, top.waves) * 5 : 0)
                        + Math.min(5, options.filter((move) => Math.abs(move.offset) === 1).length) * 4
                        + Math.min(2, result.rows) * 9 - Math.max(0, nextHeight - 5) * 8
                        + Math.min(3, nextHeight) * 3
                    : candidate.movablePieces * 2 - Math.max(0, nextHeight - 8) * 4
                        // 普通排减少自动送消与大量一步答案；辅助排仍负责恢复连消机会。
                        - (this.rulesVersion >= 4 ? result.rows * 20 + Math.min(6, options.length) * 4 : 0));
            }
            const value = Math.min(...values) * 0.65 + values.reduce((sum, value) => sum + value, 0) / values.length * 0.35;
            if (value > bestValue) {
                best = candidate;
                bestValue = value;
            }
        }
        this.generationDebugLog.push({ seed: this.roundSeed, turn: this.turn,
            targetCells: best.pieces.reduce((sum, piece) => sum + piece.size, 0), sizes: best.sizes,
            gaps: best.gaps, colors: best.pieces.map((piece) => piece.color),
            stampCount: best.pieces.filter((piece) => piece.stampMood > 0).length,
            movablePieces: best.movablePieces, attempts: candidates.length });
        if (this.generationDebugLog.length > 120)
            this.generationDebugLog.shift();
        return best.pieces;
    }
    createTutorialBoard() {
        const threeCell = this.createPiece(6, 1, 3, 3, 3, 1);
        const oneCell = this.createPiece(6, 4, 1, 1, 1);
        const twoCell = this.createPiece(6, 5, 2, 5, 5);
        this.tutorialMoves = [
            { id: threeCell.id, offset: -1, pieceSize: 3, targetRow: 7, targetCol: 0 },
            { id: twoCell.id, offset: 1, pieceSize: 2, targetRow: 8, targetCol: 6 },
            { id: oneCell.id, offset: -1, pieceSize: 1, targetRow: 9, targetCol: 3 },
        ];
        return [
            threeCell,
            oneCell,
            twoCell,
            this.createPiece(7, 3, 2, 7, 7, 1),
            this.createPiece(7, 5, 3, 9, 9, 1),
            this.createPiece(8, 0, 3, 4, 0),
            this.createPiece(8, 3, 3, 6, 6, 1),
            this.createPiece(9, 0, 3, 10, 10, 1),
            this.createPiece(9, 4, 2, 8, 0),
            this.createPiece(9, 6, 2, 2, 2),
        ];
    }
    createTutorialNextRow() {
        return [
            { col: 0, size: 2, color: 2, stampMood: 2, stampCell: 0, collectibleType: 0, collectibleCell: 0 },
            { col: 3, size: 1, color: 4, stampMood: 0, stampCell: 0, collectibleType: 0, collectibleCell: 0 },
            { col: 5, size: 2, color: 6, stampMood: 6, stampCell: 1, collectibleType: 0, collectibleCell: 0 },
        ];
    }
    pickTargetCells() {
        const progress = this.getDifficulty().progress;
        return this.random() < progress ? 6 : 5;
    }
    pickBlockSize(maxSize) {
        const progress = this.getDifficulty().progress;
        return 1 + this.pickWeightedIndex([1 - progress * 0.8, 1 + progress * 0.2, 1 + progress * 1.6].slice(0, maxSize));
    }
    prepareSecondRow(actions) {
        if (this.rulesVersion >= 5 && this.getRiseRowCount(actions) === 2 && !this.secondNextPieces.length) {
            this.secondNextPieces = this.generateAfterNextRow();
        }
    }
    /** 提前固定第二排，界面展示后不再改牌，也不在读取预告时消耗随机数。 */
    generateAfterNextRow() {
        const original = this.pieces;
        const future = original.map(piece => (Object.assign(Object.assign({}, piece), { row: piece.row - 1 })));
        this.nextPieces.forEach((piece, index) => future.push(Object.assign(Object.assign({}, piece), { row: exports.BOARD_ROWS - 1, id: -index - 1 })));
        try {
            this.pieces = this.preview(future).pieces;
            return this.generateNextRow();
        }
        finally {
            this.pieces = original;
        }
    }
    createNextRowCandidate(targetCells) {
        const emptyCells = exports.BOARD_COLS - targetCells;
        const sizes = [];
        let cellsLeft = targetCells;
        while (cellsLeft > 0) {
            const maxSize = Math.min(3, cellsLeft);
            const size = this.rulesVersion >= 5 ? this.pickBlockSize(maxSize) : 1 + Math.floor(this.random() * maxSize);
            sizes.push(size);
            cellsLeft -= size;
        }
        // 剩余格数会强制产生单格；打散块长后，单格不再固定排在最右。
        if (this.rulesVersion >= 6)
            this.shuffle(sizes);
        const gaps = new Array(sizes.length + 1).fill(0);
        const heights = this.getColumnStackHeights();
        let leftPressure = 0;
        let rightPressure = 0;
        for (let c = 0; c < exports.BOARD_COLS; c++) {
            if (c < exports.BOARD_COLS / 2)
                leftPressure += heights[c];
            else
                rightPressure += heights[c];
        }
        for (let i = 0; i < emptyCells; i++) {
            const weights = gaps.map((_, slot) => {
                if (this.rulesVersion >= 6)
                    return 1;
                const t = gaps.length <= 1 ? 0.5 : slot / (gaps.length - 1);
                // 哪侧堆得更高，空位就更常落在哪侧，避免单边越堆越高。
                return 1 + leftPressure * (1 - t) + rightPressure * t;
            });
            gaps[this.pickWeightedIndex(weights)]++;
        }
        const pieces = [];
        let col = gaps[0];
        for (let i = 0; i < sizes.length; i++) {
            const size = sizes[i];
            const color = this.pickMoodColor();
            const hasStamp = this.random() < 0.5;
            pieces.push({
                col,
                size,
                color,
                stampMood: hasStamp ? color : 0,
                stampCell: 0,
                collectibleType: 0,
                collectibleCell: 0,
            });
            col += size + gaps[i + 1];
        }
        return {
            pieces,
            sizes,
            gaps,
            movablePieces: this.countMovableNextPieces(pieces),
        };
    }
    countMovableNextPieces(pieces) {
        let movable = 0;
        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            const leftEdge = i > 0 ? pieces[i - 1].col + pieces[i - 1].size : 0;
            const rightEdge = i < pieces.length - 1 ? pieces[i + 1].col : exports.BOARD_COLS;
            if (piece.col > leftEdge || piece.col + piece.size < rightEdge)
                movable++;
        }
        return movable;
    }
    getColumnStackHeights() {
        const heights = new Array(exports.BOARD_COLS).fill(0);
        for (const piece of this.pieces) {
            const stack = exports.BOARD_ROWS - piece.row;
            for (let c = piece.col; c < piece.col + piece.size; c++) {
                if (c >= 0 && c < exports.BOARD_COLS)
                    heights[c] = Math.max(heights[c], stack);
            }
        }
        return heights;
    }
    pickWeightedIndex(weights) {
        let total = 0;
        for (const weight of weights)
            total += Math.max(0, weight);
        if (total <= 0)
            return Math.floor(this.random() * weights.length);
        let roll = this.random() * total;
        for (let i = 0; i < weights.length; i++) {
            roll -= Math.max(0, weights[i]);
            if (roll <= 0)
                return i;
        }
        return weights.length - 1;
    }
    shuffle(items) {
        for (let index = items.length - 1; index > 0; index--) {
            const other = Math.floor(this.random() * (index + 1));
            [items[index], items[other]] = [items[other], items[index]];
        }
        return items;
    }
    createPiece(row, col, size, color, stampMood = -1, stampCell = 0, collectibleType = 0, collectibleCell = 0) {
        const resolvedStamp = stampMood < 0 ? (this.random() < 0.5 ? color : 0) : stampMood;
        return {
            id: this.nextId++,
            row,
            col,
            size,
            color,
            stampMood: resolvedStamp,
            stampCell: resolvedStamp > 0
                ? Math.max(0, Math.min(size - 1, stampCell))
                : 0,
            collectibleType,
            collectibleCell: collectibleType > 0
                ? Math.max(0, Math.min(size - 1, collectibleCell))
                : 0,
        };
    }
    pickMoodColor() {
        let pool = [1, 2, 3, 4, 5, 6, 1, 3, 5, 7, 8, 9, 10, 7, 9];
        if (this.roundClearedRows >= 12)
            pool = [1, 2, 2, 3, 5, 5, 6, 6];
        else if (this.roundClearedRows >= 7)
            pool = [1, 2, 3, 3, 4, 5, 5, 6, 7, 9];
        else if (this.roundClearedRows >= 3)
            pool = [1, 2, 3, 4, 5, 6, 1, 3, 5, 7, 9];
        return pool[Math.floor(this.random() * pool.length)];
    }
    random() {
        let value = this.randomState | 0;
        value ^= value << 13;
        value ^= value >>> 17;
        value ^= value << 5;
        this.randomState = value >>> 0;
        return this.randomState / 0x100000000;
    }
    wouldCreateFullRow(piece, offset) {
        const simulated = this.pieces.map((item) => (Object.assign({}, item)));
        const moved = simulated.find((item) => item.id === piece.id);
        if (!moved)
            return false;
        moved.col += offset;
        const ordered = simulated.slice().sort((a, b) => b.row - a.row);
        for (const falling of ordered) {
            while (falling.row < exports.BOARD_ROWS - 1) {
                const nextRow = falling.row + 1;
                const blocked = simulated.some((other) => {
                    if (other.id === falling.id || other.row !== nextRow)
                        return false;
                    return falling.col < other.col + other.size
                        && falling.col + falling.size > other.col;
                });
                if (blocked)
                    break;
                falling.row = nextRow;
            }
        }
        for (let row = 0; row < exports.BOARD_ROWS; row++) {
            const occupied = new Array(exports.BOARD_COLS).fill(false);
            for (const item of simulated) {
                if (item.row !== row)
                    continue;
                for (let col = item.col; col < item.col + item.size; col++)
                    occupied[col] = true;
            }
            if (occupied.every((value) => value))
                return true;
        }
        return false;
    }
}
exports.default = BoardEngine;
