export const BOARD_ROWS = 10;
export const BOARD_COLS = 8;
export const CELL_SIZE = 76;
/** 收集满一瓶所需表情数；满瓶后计入开心瓶数量。 */
export const HAPPY_BOTTLE_TARGET = 666;

export type BoardPiece = {
    id: number;
    row: number;
    col: number;
    size: number;
    color: number;
    stampMood: number;
    stampCell: number;
    /** 未来收藏物预留：0 表示当前没有收藏物。 */
    collectibleType: number;
    collectibleCell: number;
};

export type NextPiece = {
    col: number;
    size: number;
    color: number;
    stampMood: number;
    stampCell: number;
    collectibleType: number;
    collectibleCell: number;
};

export type MoveRange = {
    min: number;
    max: number;
};

export type ResolveResult = {
    clearedRows: number;
    gainedScore: number;
};

export type GravityMove = {
    id: number;
    fromRow: number;
    toRow: number;
};

export type EliminateResult = ResolveResult & {
    removedPieceIds: number[];
    clearedRowIndexes: number[];
    collectedMoodTypes: number[];
};

export type RoundSettlement = {
    roundScore: number;
    roundMoodCount: number;
    collectedMoods: number;
    gainedExperience: number;
    completedHappyBottles: number;
    levelUps: number;
    wishProgressBefore: number;
    wishProgressAfter: number;
    levelBefore: number;
    experienceBefore: number;
    experienceTargetBefore: number;
    levelAfter: number;
    experienceAfter: number;
    experienceTargetAfter: number;
};

export type MoveHint = {
    id: number;
    offset: number;
};

export type AutoPurifyResult = {
    color: number;
    removedPieceIds: number[];
};

/**
 * 左右消的唯一数据源。
 * UI 只负责展示和手势，棋盘碰撞、重力、消除与计分都集中在这里。
 */
export default class ZyxGameModule {
    public pieces: BoardPiece[] = [];
    public nextPieces: NextPiece[] = [];
    public score: number = 0;
    public bestScore: number = 0;
    public hammerCount: number = 0;
    public colorPurifierCount: number = 0;
    public turn: number = 0;
    public roundClearedRows: number = 0;
    public roundCollectedMoods: number = 0;
    /** 当前正在收集的开心瓶进度；满瓶后计入开心瓶数量。 */
    public happyBottleProgress: number = 0;
    /** 已装满的开心瓶数量（解忧秘境等处会使用）。 */
    public happyBottleCount: number = 0;
    public level: number = 1;
    public experience: number = 0;
    public challengeCount: number = 0;
    public startingBestScore: number = 0;

    private nextId: number = 1;
    private roundSettled: boolean = false;

    public resetRound(): void {
        this.score = 0;
        this.turn = 0;
        this.roundClearedRows = 0;
        this.roundCollectedMoods = 0;
        this.nextId = 1;
        this.hammerCount = Math.max(0, this.readNumber('zyx_hammer_inventory', 0));
        this.colorPurifierCount = Math.max(0, this.readNumber('zyx_magic_wand_inventory', 0));
        this.roundSettled = false;
        this.bestScore = this.readNumber('zyx_best_score', 0);
        this.startingBestScore = this.bestScore;
        this.challengeCount = this.readNumber('zyx_challenge_count', 0) + 1;
        cc.sys.localStorage.setItem('zyx_challenge_count', String(this.challengeCount));
        this.syncPersistentProgress();

        this.pieces = [
            // 开局保留一个真实可消除机会：把倒数第二行的 2 格块左移，它会落下并填满底行。
            this.createPiece(9, 0, 3, 8, 8),
            this.createPiece(9, 5, 3, 6, 0),
            this.createPiece(8, 0, 2, 2, 2, 0),
            this.createPiece(8, 2, 1, 9, 0),
            this.createPiece(8, 4, 2, 1, 1),
            this.createPiece(7, 0, 1, 3, 3, 0),
            this.createPiece(7, 4, 2, 7, 0),
        ];
        this.nextPieces = this.generateNextRow();
    }

    public refreshPersistentProgress(): void {
        this.syncPersistentProgress();
    }

    public getPiece(id: number): BoardPiece {
        return this.pieces.find((piece) => piece.id === id) || null;
    }

    public getMoveRange(id: number): MoveRange {
        const piece = this.getPiece(id);
        if (!piece) return { min: 0, max: 0 };

        let minCol = 0;
        let maxCol = BOARD_COLS - piece.size;
        for (const other of this.pieces) {
            if (other.id === id || other.row !== piece.row) continue;
            if (other.col + other.size <= piece.col) {
                minCol = Math.max(minCol, other.col + other.size);
            } else if (other.col >= piece.col + piece.size) {
                maxCol = Math.min(maxCol, other.col - piece.size);
            }
        }
        return {
            min: minCol - piece.col,
            max: maxCol - piece.col,
        };
    }

    public movePiece(id: number, offset: number): boolean {
        const piece = this.getPiece(id);
        if (!piece || offset === 0) return false;
        const range = this.getMoveRange(id);
        const safeOffset = Math.max(range.min, Math.min(range.max, offset));
        if (safeOffset === 0) return false;
        piece.col += safeOffset;
        return true;
    }

    public useHammer(id: number): boolean {
        if (this.hammerCount <= 0 || !this.getPiece(id)) return false;
        this.hammerCount--;
        this.saveToolInventory();
        this.pieces = this.pieces.filter((piece) => piece.id !== id);
        return true;
    }

    /** 发放一次解压锤使用机会；库存跨局保留。 */
    public grantRewardedHammer(): void {
        this.hammerCount++;
        this.saveToolInventory();
    }

    /** 消耗一次魔法棒机会，并移除棋盘上玩家选中的全部同色色块。 */
    public useColorPurifier(color: number): number[] {
        if (this.colorPurifierCount <= 0) return [];
        const removedPieceIds = this.pieces
            .filter((piece) => piece.color === color)
            .map((piece) => piece.id);
        if (removedPieceIds.length === 0) return [];

        this.colorPurifierCount--;
        this.saveToolInventory();
        const removedSet: { [key: number]: boolean } = {};
        removedPieceIds.forEach((id) => removedSet[id] = true);
        this.pieces = this.pieces.filter((piece) => !removedSet[piece.id]);
        return removedPieceIds;
    }

    /** 与解压锤一致：发放一次魔法棒使用机会。 */
    public grantRewardedColorPurifier(): void {
        this.colorPurifierCount++;
        this.saveToolInventory();
    }

    /** 棋盘最高色块进入顶部预留区时，提示本局唯一一次广告救场。 */
    public hasEnteredRescueZone(emptyRows: number = 2): boolean {
        if (this.pieces.length === 0) return false;
        const topmostRow = this.pieces.reduce(
            (minimum, piece) => Math.min(minimum, piece.row),
            BOARD_ROWS,
        );
        return topmostRow <= Math.max(0, emptyRows);
    }

    /** 自动移除出现块数最多的颜色；并列时优先清除占格更多的颜色。 */
    public removeMostCommonColor(): AutoPurifyResult {
        const stats: { [key: number]: { count: number; cells: number } } = {};
        for (const piece of this.pieces) {
            if (!stats[piece.color]) stats[piece.color] = { count: 0, cells: 0 };
            stats[piece.color].count++;
            stats[piece.color].cells += piece.size;
        }

        const colors = Object.keys(stats).map((value) => Number(value));
        if (colors.length === 0) return { color: 0, removedPieceIds: [] };
        colors.sort((left, right) => {
            const countDifference = stats[right].count - stats[left].count;
            if (countDifference !== 0) return countDifference;
            const cellDifference = stats[right].cells - stats[left].cells;
            if (cellDifference !== 0) return cellDifference;
            return left - right;
        });

        const color = colors[0];
        const removedPieceIds = this.pieces
            .filter((piece) => piece.color === color)
            .map((piece) => piece.id);
        const removedSet: { [key: number]: boolean } = {};
        removedPieceIds.forEach((id) => removedSet[id] = true);
        this.pieces = this.pieces.filter((piece) => !removedSet[piece.id]);
        return { color, removedPieceIds };
    }

    /** 复活时清理棋盘上半区，只保留下半区色块继续挑战。 */
    public removeTopHalfForRevive(): number[] {
        const firstBottomRow = Math.ceil(BOARD_ROWS / 2);
        const removedPieceIds = this.pieces
            .filter((piece) => piece.row < firstBottomRow)
            .map((piece) => piece.id);
        if (removedPieceIds.length === 0) return [];

        const removedSet: { [key: number]: boolean } = {};
        removedPieceIds.forEach((id) => removedSet[id] = true);
        this.pieces = this.pieces.filter((piece) => !removedSet[piece.id]);
        return removedPieceIds;
    }

    /** 找到一次移动经重力结算后能产生满行的最短操作，用于 8 秒无操作提示。 */
    public findEliminationHint(): MoveHint {
        const ordered = this.pieces.slice().sort((a, b) => b.row - a.row);
        for (const piece of ordered) {
            const range = this.getMoveRange(piece.id);
            const offsets: number[] = [];
            for (let value = range.min; value <= range.max; value++) {
                if (value !== 0) offsets.push(value);
            }
            offsets.sort((a, b) => Math.abs(a) - Math.abs(b));
            for (const offset of offsets) {
                if (this.wouldCreateFullRow(piece, offset)) return { id: piece.id, offset };
            }
        }
        return null;
    }

    public resolveBoard(): ResolveResult {
        let clearedRows = 0;
        let gainedScore = 0;
        let chain = 1;

        while (true) {
            this.applyGravity();
            const result = this.eliminateFullRows(chain);
            if (result.clearedRows === 0) break;

            clearedRows += result.clearedRows;
            gainedScore += result.gainedScore;
            chain++;
        }
        return { clearedRows, gainedScore };
    }

    /** 执行一次完整重力结算，并返回需要播放掉落动画的色块。 */
    public applyGravity(): GravityMove[] {
        const moves: GravityMove[] = [];
        const ordered = this.pieces.slice().sort((a, b) => b.row - a.row);
        for (const piece of ordered) {
            const fromRow = piece.row;
            while (piece.row < BOARD_ROWS - 1 && this.canOccupy(piece, piece.row + 1)) {
                piece.row++;
            }
            if (piece.row !== fromRow) moves.push({ id: piece.id, fromRow, toRow: piece.row });
        }
        return moves;
    }

    /** 只执行当前稳定棋盘上的一次满行消除，便于界面逐轮播放动画。 */
    public eliminateFullRows(chain: number = 1): EliminateResult {
        const fullRows = this.findFullRows();
        if (fullRows.length === 0) {
            return {
                clearedRows: 0,
                gainedScore: 0,
                removedPieceIds: [],
                clearedRowIndexes: [],
                collectedMoodTypes: [],
            };
        }

        const rowSet: { [key: number]: boolean } = {};
        fullRows.forEach((row) => rowSet[row] = true);
        const removedPieces = this.pieces.filter((piece) => rowSet[piece.row]);
        const removedPieceIds = removedPieces.map((piece) => piece.id);
        const collectedMoodTypes = removedPieces
            .filter((piece) => piece.stampMood > 0)
            .map((piece) => piece.stampMood);
        this.pieces = this.pieces.filter((piece) => !rowSet[piece.row]);

        const gainedScore = fullRows.length * 10 * chain;
        this.score += gainedScore;
        this.roundClearedRows += fullRows.length;
        this.roundCollectedMoods += collectedMoodTypes.length;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            cc.sys.localStorage.setItem('zyx_best_score', String(this.bestScore));
        }
        return {
            clearedRows: fullRows.length,
            gainedScore,
            removedPieceIds,
            clearedRowIndexes: fullRows,
            collectedMoodTypes,
        };
    }

    /** 推进一行；顶部已有色块时无法推进，即本局结束。 */
    public appendNextRow(): boolean {
        if (this.pieces.some((piece) => piece.row === 0)) return false;

        for (const piece of this.pieces) piece.row--;
        for (const next of this.nextPieces) {
            this.pieces.push(this.createPiece(
                BOARD_ROWS - 1,
                next.col,
                next.size,
                next.color,
                next.stampMood,
                next.stampCell,
                next.collectibleType,
                next.collectibleCell,
            ));
        }
        this.turn++;
        this.nextPieces = this.generateNextRow();
        return true;
    }

    public finishRound(): RoundSettlement {
        if (this.roundSettled) {
            const target = this.getExperienceTarget();
            return {
                roundScore: this.score,
                roundMoodCount: this.roundCollectedMoods,
                collectedMoods: 0,
                gainedExperience: 0,
                completedHappyBottles: 0,
                levelUps: 0,
                wishProgressBefore: this.happyBottleProgress,
                wishProgressAfter: this.happyBottleProgress,
                levelBefore: this.level,
                experienceBefore: this.experience,
                experienceTargetBefore: target,
                levelAfter: this.level,
                experienceAfter: this.experience,
                experienceTargetAfter: target,
            };
        }
        this.roundSettled = true;
        if (this.score > this.bestScore) this.bestScore = this.score;
        cc.sys.localStorage.setItem('zyx_best_score', String(this.bestScore));

        this.syncPersistentProgress();
        const wishProgressBefore = this.happyBottleProgress;
        const levelBefore = this.level;
        const experienceBefore = this.experience;
        const experienceTargetBefore = this.getExperienceTarget();
        // 表情与经验同源；进度跨日累积，装满后计入开心瓶数量。
        const gainedExperience = this.roundCollectedMoods;
        const totalMoodProgress = this.happyBottleProgress + this.roundCollectedMoods;
        const completedHappyBottles = Math.floor(totalMoodProgress / HAPPY_BOTTLE_TARGET);
        const collectedMoods = this.roundCollectedMoods;
        this.happyBottleProgress = totalMoodProgress % HAPPY_BOTTLE_TARGET;
        this.happyBottleCount += completedHappyBottles;
        const levelUps = this.addExperience(gainedExperience);
        this.savePersistentProgress();
        return {
            roundScore: this.score,
            roundMoodCount: this.roundCollectedMoods,
            collectedMoods,
            gainedExperience,
            completedHappyBottles,
            levelUps,
            wishProgressBefore,
            wishProgressAfter: this.happyBottleProgress,
            levelBefore,
            experienceBefore,
            experienceTargetBefore,
            levelAfter: this.level,
            experienceAfter: this.experience,
            experienceTargetAfter: this.getExperienceTarget(),
        };
    }

    /** 云端结算返回后覆盖本地展示缓存；服务端数据是最终权威来源。 */
    public applyCloudProfile(profile: {
        level: number;
        experience: number;
        happyBottleBalance: number;
        happyBottleProgress: number;
        highestSingleGameScore: number;
    }): void {
        this.level = Math.max(1, profile.level || 1);
        this.experience = Math.max(0, profile.experience || 0);
        this.happyBottleCount = Math.max(0, profile.happyBottleBalance || 0);
        this.happyBottleProgress = Math.max(0, Math.min(HAPPY_BOTTLE_TARGET - 1, profile.happyBottleProgress || 0));
        this.bestScore = Math.max(this.bestScore, profile.highestSingleGameScore || 0);
        this.savePersistentProgress();
        cc.sys.localStorage.setItem('zyx_best_score', String(this.bestScore));
    }

    public getExperienceTarget(): number {
        return this.getExperienceTargetForLevel(this.level);
    }

    public getExperienceTargetForLevel(level: number): number {
        return Math.max(15, Math.ceil(15 * Math.pow(1.32, Math.max(1, level) - 1)));
    }

    /** 使用开心瓶；数量不足时不改变状态。 */
    public spendHappyBottles(amount: number): boolean {
        const cost = Math.max(0, Math.floor(amount));
        if (this.happyBottleCount < cost) return false;
        this.happyBottleCount -= cost;
        this.savePersistentProgress();
        return true;
    }

    /**
     * 本地 GM 面板的库存发放入口。
     * 先从持久化存档读取，再整体写回，确保首页未开局时不会把已有道具库存覆盖为 0。
     */
    public grantDebugInventory(happyBottles: number, hammers: number, magicWands: number): void {
        const bottleReward = Math.max(0, Math.floor(happyBottles));
        const hammerReward = Math.max(0, Math.floor(hammers));
        const wandReward = Math.max(0, Math.floor(magicWands));
        this.syncPersistentProgress();
        this.hammerCount = Math.max(0, this.readNumber('zyx_hammer_inventory', this.hammerCount));
        this.colorPurifierCount = Math.max(0, this.readNumber('zyx_magic_wand_inventory', this.colorPurifierCount));
        this.happyBottleCount += bottleReward;
        this.hammerCount += hammerReward;
        this.colorPurifierCount += wandReward;
        this.savePersistentProgress();
        this.saveToolInventory();
    }

    /**
     * GM：给当前正在收集的瓶子加表情进度；跨过 666 时自动折算为开心瓶数量。
     */
    public grantDebugHappyBottleProgress(amount: number): { added: number; completedBottles: number; progress: number } {
        const added = Math.max(0, Math.floor(amount));
        this.syncPersistentProgress();
        const total = this.happyBottleProgress + added;
        const completedBottles = Math.floor(total / HAPPY_BOTTLE_TARGET);
        this.happyBottleProgress = total % HAPPY_BOTTLE_TARGET;
        this.happyBottleCount += completedBottles;
        this.savePersistentProgress();
        return {
            added,
            completedBottles,
            progress: this.happyBottleProgress,
        };
    }

    /** GM：重置本地进度与道具；云端需另行调用 reset。 */
    public resetLocalAccount(): void {
        this.level = 1;
        this.experience = 0;
        this.happyBottleCount = 0;
        this.happyBottleProgress = 0;
        this.hammerCount = 0;
        this.colorPurifierCount = 0;
        this.bestScore = 0;
        this.savePersistentProgress();
        this.saveToolInventory();
        cc.sys.localStorage.setItem('zyx_best_score', '0');
        cc.sys.localStorage.setItem('zyx_unlocked_album_arts', '{}');
        cc.sys.localStorage.removeItem('zyx_daily_moods');
        cc.sys.localStorage.removeItem('zyx_daily_wish');
    }

    public getUnlockedAlbumArts(): { [key: string]: boolean } {
        const raw = cc.sys.localStorage.getItem('zyx_unlocked_album_arts');
        if (!raw) return {};
        try {
            const value = JSON.parse(raw);
            return value && typeof value === 'object' ? value : {};
        } catch (error) {
            return {};
        }
    }

    public unlockAlbumArt(artId: string, cost: number): boolean {
        const unlocked = this.getUnlockedAlbumArts();
        if (unlocked[artId]) return true;
        if (!this.spendHappyBottles(cost)) return false;
        unlocked[artId] = true;
        cc.sys.localStorage.setItem('zyx_unlocked_album_arts', JSON.stringify(unlocked));
        return true;
    }

    public isGameOver(): boolean {
        return this.pieces.some((piece) => piece.row === 0);
    }

    private canOccupy(piece: BoardPiece, row: number): boolean {
        return !this.pieces.some((other) => {
            if (other.id === piece.id || other.row !== row) return false;
            const pieceEnd = piece.col + piece.size;
            const otherEnd = other.col + other.size;
            return piece.col < otherEnd && pieceEnd > other.col;
        });
    }

    private findFullRows(): number[] {
        const fullRows: number[] = [];
        for (let row = 0; row < BOARD_ROWS; row++) {
            const occupied = new Array(BOARD_COLS).fill(false);
            for (const piece of this.pieces) {
                if (piece.row !== row) continue;
                for (let col = piece.col; col < piece.col + piece.size; col++) occupied[col] = true;
            }
            if (occupied.every((value) => value)) fullRows.push(row);
        }
        return fullRows;
    }

    /**
     * 生成下一排：先抽块长，再把空位撒到块前/块间/块后。
     * 旧逻辑从左往右填，空格几乎总落在右侧；现在空位会铺开，并略偏向已堆高的一侧。
     */
    private generateNextRow(): NextPiece[] {
        const targetCells = Math.min(6, 4 + Math.floor(this.turn / 8));
        const emptyCells = BOARD_COLS - targetCells;

        const sizes: number[] = [];
        let cellsLeft = targetCells;
        while (cellsLeft > 0) {
            const maxSize = Math.min(3, cellsLeft);
            const size = 1 + Math.floor(Math.random() * maxSize);
            sizes.push(size);
            cellsLeft -= size;
        }

        const gaps = new Array(sizes.length + 1).fill(0);
        const heights = this.getColumnStackHeights();
        let leftPressure = 0;
        let rightPressure = 0;
        for (let c = 0; c < BOARD_COLS; c++) {
            if (c < BOARD_COLS / 2) leftPressure += heights[c];
            else rightPressure += heights[c];
        }

        for (let i = 0; i < emptyCells; i++) {
            const weights = gaps.map((_, slot) => {
                const t = gaps.length <= 1 ? 0.5 : slot / (gaps.length - 1);
                // 哪侧堆得更高，空位就更常落在哪侧，避免单边越堆越高。
                return 1 + leftPressure * (1 - t) + rightPressure * t;
            });
            gaps[this.pickWeightedIndex(weights)]++;
        }

        const pieces: NextPiece[] = [];
        let col = gaps[0];
        for (let i = 0; i < sizes.length; i++) {
            const size = sizes[i];
            const color = this.pickMoodColor();
            const hasStamp = Math.random() < 0.5;
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
        return pieces;
    }

    /** 各列当前堆高（从底往上有块的行数），供下一排空位偏向使用。 */
    private getColumnStackHeights(): number[] {
        const heights = new Array(BOARD_COLS).fill(0);
        for (const piece of this.pieces) {
            const stack = BOARD_ROWS - piece.row;
            for (let c = piece.col; c < piece.col + piece.size; c++) {
                if (c >= 0 && c < BOARD_COLS) heights[c] = Math.max(heights[c], stack);
            }
        }
        return heights;
    }

    private pickWeightedIndex(weights: number[]): number {
        let total = 0;
        for (const weight of weights) total += Math.max(0, weight);
        if (total <= 0) return Math.floor(Math.random() * weights.length);
        let roll = Math.random() * total;
        for (let i = 0; i < weights.length; i++) {
            roll -= Math.max(0, weights[i]);
            if (roll <= 0) return i;
        }
        return weights.length - 1;
    }

    private createPiece(
        row: number,
        col: number,
        size: number,
        color: number,
        stampMood: number = -1,
        stampCell: number = 0,
        collectibleType: number = 0,
        collectibleCell: number = 0,
    ): BoardPiece {
        const resolvedStamp = stampMood < 0 ? (Math.random() < 0.5 ? color : 0) : stampMood;
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

    /** 消除越多，新进入的心情越趋向开心与平静色系。 */
    private pickMoodColor(): number {
        let pool = [1, 2, 3, 4, 5, 6, 1, 3, 5, 7, 8, 9, 10, 7, 9];
        if (this.roundClearedRows >= 12) pool = [1, 2, 2, 3, 5, 5, 6, 6];
        else if (this.roundClearedRows >= 7) pool = [1, 2, 3, 3, 4, 5, 5, 6, 7, 9];
        else if (this.roundClearedRows >= 3) pool = [1, 2, 3, 4, 5, 6, 1, 3, 5, 7, 9];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    private syncPersistentProgress(): void {
        this.happyBottleCount = Math.max(0, this.readNumber('zyx_happy_bottle_count', 0));
        this.level = Math.max(1, this.readNumber('zyx_level', 1));
        this.experience = Math.max(0, this.readNumber('zyx_experience', 0));
        // 兼容旧日进度键；读入后写入永久进度键，不再按自然日清空。
        const legacyValue = this.readNumber('zyx_daily_moods', this.readNumber('zyx_daily_wish', 0));
        this.happyBottleProgress = Math.max(0, Math.min(
            HAPPY_BOTTLE_TARGET - 1,
            this.readNumber('zyx_current_happy_bottle_progress', legacyValue),
        ));
    }

    private savePersistentProgress(): void {
        cc.sys.localStorage.setItem('zyx_current_happy_bottle_progress', String(this.happyBottleProgress));
        cc.sys.localStorage.setItem('zyx_happy_bottle_count', String(this.happyBottleCount));
        cc.sys.localStorage.setItem('zyx_level', String(this.level));
        cc.sys.localStorage.setItem('zyx_experience', String(this.experience));
    }

    private saveToolInventory(): void {
        cc.sys.localStorage.setItem('zyx_hammer_inventory', String(this.hammerCount));
        cc.sys.localStorage.setItem('zyx_magic_wand_inventory', String(this.colorPurifierCount));
    }

    private addExperience(value: number): number {
        let levelUps = 0;
        this.experience += value;
        while (this.experience >= this.getExperienceTarget()) {
            this.experience -= this.getExperienceTarget();
            this.level++;
            levelUps++;
        }
        return levelUps;
    }

    private wouldCreateFullRow(piece: BoardPiece, offset: number): boolean {
        const simulated = this.pieces.map((item) => ({ ...item }));
        const moved = simulated.find((item) => item.id === piece.id);
        if (!moved) return false;
        moved.col += offset;

        const ordered = simulated.slice().sort((a, b) => b.row - a.row);
        for (const falling of ordered) {
            while (falling.row < BOARD_ROWS - 1) {
                const nextRow = falling.row + 1;
                const blocked = simulated.some((other) => {
                    if (other.id === falling.id || other.row !== nextRow) return false;
                    return falling.col < other.col + other.size
                        && falling.col + falling.size > other.col;
                });
                if (blocked) break;
                falling.row = nextRow;
            }
        }

        for (let row = 0; row < BOARD_ROWS; row++) {
            const occupied = new Array(BOARD_COLS).fill(false);
            for (const item of simulated) {
                if (item.row !== row) continue;
                for (let col = item.col; col < item.col + item.size; col++) occupied[col] = true;
            }
            if (occupied.every((value) => value)) return true;
        }
        return false;
    }

    private readNumber(key: string, fallback: number): number {
        const value = Number(cc.sys.localStorage.getItem(key));
        return Number.isFinite(value) ? value : fallback;
    }
}

export const zyxGameModule = new ZyxGameModule();
