// Generated from assets/script/dataModule/BoardEngine.ts; run npm run sync:engine.
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ACTION_APPENDS = exports.MAX_BOARD_BOMBS = exports.ROUND_RESCUE_COOLDOWN_MS = exports.BOARD_RULES_VERSION = exports.BOARD_COLS = exports.BOARD_ROWS = void 0;
/** 纯棋盘规则。客户端直接导入；服务端使用脚本生成的同源 CommonJS 产物。 */
exports.BOARD_ROWS = 10;
exports.BOARD_COLS = 8;
exports.BOARD_RULES_VERSION = 8;
exports.ROUND_RESCUE_COOLDOWN_MS = 60 * 1000;
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
        this.balloonAvailable = false;
        this.rescueKind = null;
        this.rescueLastOfferedAt = -exports.ROUND_RESCUE_COOLDOWN_MS;
    }
    saveToolInventory() { }
    resetBoard(seed, tutorial, rulesVersion = exports.BOARD_RULES_VERSION) {
        this.rulesVersion = rulesVersion;
        this.score = this.combo = this.turn = this.moveCount = 0;
        this.difficultyActionCount = 0;
        this.roundClearedRows = this.roundCollectedMoodBeans = 0;
        this.actionAppends = this.actionCascade = this.recentMisses = 0;
        this.comboActionCleared = this.pendingComboBomb = this.actionOpen = this.actionBlast = false;
        this.actionRows = 0;
        this.balloonAvailable = false;
        this.rescueKind = null;
        this.rescueLastOfferedAt = -exports.ROUND_RESCUE_COOLDOWN_MS;
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
        if (this.hammerCount <= 0 || !this.getPiece(id))
            return false;
        this.beginPlayerAction();
        this.hammerCount--;
        this.saveToolInventory();
        this.pieces = this.pieces.filter((piece) => piece.id !== id);
        this.roundActions.push({ type: 'hammer', id });
        return true;
    }
    grantRewardedHammer() {
        this.hammerCount++;
        this.saveToolInventory();
    }
    useColorPurifier(color) {
        if (this.colorPurifierCount <= 0)
            return [];
        const removedPieceIds = this.pieces
            .filter((piece) => piece.color === color)
            .map((piece) => piece.id);
        if (removedPieceIds.length === 0)
            return [];
        this.beginPlayerAction();
        this.colorPurifierCount--;
        this.saveToolInventory();
        const removedSet = {};
        removedPieceIds.forEach((id) => removedSet[id] = true);
        this.pieces = this.pieces.filter((piece) => !removedSet[piece.id]);
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
        return this.rulesVersion >= 8 && !this.rescueKind && this.score > 500 && this.getBoardHeight() > 6
            && !this.isGameOver() && Number.isSafeInteger(elapsedMs) && elapsedMs >= 0
            && elapsedMs - this.rescueLastOfferedAt >= exports.ROUND_RESCUE_COOLDOWN_MS;
    }
    /** 两种救场共用出现条件和冷却；用对局种子随机选择，重放可验证。 */
    offerRoundRescue(elapsedMs) {
        if (!this.canOfferRoundRescue(elapsedMs))
            return null;
        this.rescueKind = this.random() < 0.5 ? 'balloon' : 'clear';
        this.rescueLastOfferedAt = elapsedMs;
        this.roundActions.push({ type: 'rescueOffer', elapsedMs, kind: this.rescueKind });
        return this.rescueKind;
    }
    dismissRoundRescue() {
        if (!this.rescueKind)
            return false;
        this.rescueKind = null;
        this.roundActions.push({ type: 'rescueDismiss' });
        return true;
    }
    /** 清屏沿用原救场效果：不计行分、不收集表情，之后正常补排。 */
    applyClearRescue() {
        if (this.rulesVersion < 8 || this.rescueKind !== 'clear')
            return null;
        this.rescueKind = null;
        this.beginPlayerAction();
        const ids = this.pieces.map(piece => piece.id);
        this.pieces = [];
        this.roundActions.push({ type: 'rescueClear' });
        return ids;
    }
    offerBalloonRescue() {
        if (!this.canOfferBalloonRescue())
            return false;
        this.balloonAvailable = true;
        this.roundActions.push({ type: 'balloonOffer' });
        return true;
    }
    dismissBalloonRescue() {
        if (this.rulesVersion >= 8)
            return this.dismissRoundRescue();
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
    applyBalloonRescue() {
        // 出现时检查高度，兑换时兑现已出现的机会；期间玩家消行降高也不会白分享。
        if (this.rulesVersion < 6 || (this.rulesVersion >= 8 ? this.rescueKind !== 'balloon' : !this.balloonAvailable))
            return null;
        this.rescueKind = null;
        this.balloonAvailable = false;
        const targets = this.shuffle(this.pieces.slice()).slice(0, Math.ceil(this.pieces.length / 4));
        this.roundActions.push({ type: 'balloon' });
        if (this.rulesVersion >= 7) {
            // 投弹落点视作炸弹，复用普通炸弹范围与旧炸弹连锁；不修改原块或额外上涨。
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
        this.beginPlayerAction();
        const removedPieceIds = this.pieces.map((piece) => piece.id);
        this.pieces = [];
        this.roundActions.push({ type: 'clear' });
        return removedPieceIds;
    }
    removeTopRowsForRevive(rowCount = 8) {
        const firstPreservedRow = Math.max(0, Math.min(exports.BOARD_ROWS, Math.floor(rowCount)));
        const removedPieceIds = this.pieces
            .filter((piece) => piece.row < firstPreservedRow)
            .map((piece) => piece.id);
        if (removedPieceIds.length === 0)
            return [];
        this.beginPlayerAction();
        const removedSet = {};
        removedPieceIds.forEach((id) => removedSet[id] = true);
        this.pieces = this.pieces.filter((piece) => !removedSet[piece.id]);
        this.roundActions.push({ type: 'revive', rowCount });
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
    beginPlayerAction() {
        if (this.actionOpen)
            this.finishPlayerAction();
        this.difficultyActionCount++;
        this.prepareSecondRow(this.difficultyActionCount);
        this.actionOpen = true;
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
        const count = (this.actionRows >= 2 ? 1 : 0) + (this.pendingComboBomb ? 1 : 0);
        for (let index = 0; index < count; index++) {
            const bomb = this.awardBomb(2);
            if (bomb)
                rewards.push(bomb);
        }
        this.pendingComboBomb = false;
        this.actionOpen = false;
        this.prepareSecondRow(this.difficultyActionCount + 1);
        return rewards;
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
        if (clearedRows < 2 || this.pieces.filter((piece) => piece.bomb).length >= exports.MAX_BOARD_BOMBS)
            return null;
        const eligible = this.pieces.filter(piece => !piece.bomb);
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
    /** 对移除集合做炸弹闭包；每枚旧炸弹、每块表情最多结算一次。 */
    removeWithBombs(initial, rows) {
        const removed = new Set(initial.map((piece) => piece.id));
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
            detonations.push({ id: bomb.id, row: bomb.row, col: bomb.col, size: bomb.size, affectedPieceIds });
        }
        const removedPieces = this.pieces.filter((piece) => removed.has(piece.id));
        const moods = removedPieces.filter((piece) => piece.stampMood > 0).map((piece) => piece.stampMood);
        this.pieces = this.pieces.filter((piece) => !removed.has(piece.id));
        this.roundCollectedMoodBeans += moods.length;
        if (queue.length)
            this.actionBlast = true;
        return { clearedRows: rows.length, gainedScore: 0, removedPieceIds: removedPieces.map((piece) => piece.id),
            clearedRowIndexes: rows, collectedMoodTypes: moods, detonatedBombs: detonations };
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
            this.beginPlayerAction();
        const result = this.removeWithBombs(this.pieces.filter((piece) => fullRows.indexOf(piece.row) >= 0), fullRows);
        if (!this.comboActionCleared) {
            this.combo = Math.min(5, this.combo + 1);
            this.comboActionCleared = true;
            if (this.combo === 3 || (this.rulesVersion >= 5 && this.combo >= 3))
                this.pendingComboBomb = true;
        }
        this.actionRows += fullRows.length;
        this.actionCascade++;
        result.combo = this.combo;
        result.cascade = this.actionCascade;
        result.gainedScore = fullRows.length * 10 * this.combo;
        this.score += result.gainedScore;
        this.roundClearedRows += fullRows.length;
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
            this.pieces.push(this.createPiece(exports.BOARD_ROWS - 1, next.col, next.size, next.color, next.stampMood, next.stampCell, next.collectibleType, next.collectibleCell));
        }
        this.turn++;
        if (this.rulesVersion >= 5 && this.secondNextPieces.length) {
            this.nextPieces = this.secondNextPieces;
            this.secondNextPieces = [];
        }
        else
            this.nextPieces = this.generateNextRow();
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
        if (this.rulesVersion < 5 || actions <= 25)
            return 1;
        if (this.rulesVersion >= 6 && this.getBoardHeight() > 4)
            return 1;
        if (actions < 40)
            return (actions - 26) % 4 === 0 ? 2 : 1;
        if (actions < 55)
            return (actions - 40) % 2 === 0 ? 2 : 1;
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
    getDifficulty() {
        if (this.rulesVersion >= 5) {
            const actions = this.difficultyActionCount;
            const stage = actions <= 25 ? 0 : actions < 40 ? 1 : actions < 55 ? 2 : 3;
            return { stage, label: ['连消时刻', '进阶挑战', '高手挑战', '大师挑战'][stage],
                progress: Math.max(0, Math.min(1, (actions - 25) / 30)) };
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
        const current = this.rulesVersion >= 4;
        const base = 1 - this.getDifficulty().progress * (current ? 0.85 : 0.65);
        return Math.min(1, base + (height >= 7 && !bombs ? (current ? 0.08 : 0.15) : 0)
            + Math.min(current ? 0.06 : 0.12, this.recentMisses * (current ? 0.02 : 0.04)));
    }
    preview(pieces) {
        const simulation = new BoardEngine();
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
