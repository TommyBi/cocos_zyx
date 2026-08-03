export const BOARD_ROWS = 10;
export const BOARD_COLS = 8;
export const CELL_SIZE = 76;
export const DAILY_WISH_TARGET = 666;

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
    public dailyMoodCount: number = 0;
    public level: number = 1;
    public experience: number = 0;
    public challengeCount: number = 0;
    public startingBestScore: number = 0;

    private nextId: number = 1;
    private dailyKey: string = '';
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

    /** 每次完整观看奖励视频发放一次使用机会；首页顺心瓶奖励也复用同一库存。 */
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

    /** 与解压锤一致：完整观看一次视频，发放一次使用机会。 */
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
                levelUps: 0,
                wishProgressBefore: this.dailyMoodCount,
                wishProgressAfter: this.dailyMoodCount,
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
        const wishProgressBefore = this.dailyMoodCount;
        const levelBefore = this.level;
        const experienceBefore = this.experience;
        const experienceTargetBefore = this.getExperienceTarget();
        const availableSpace = Math.max(0, DAILY_WISH_TARGET - this.dailyMoodCount);
        const collectedMoods = Math.min(availableSpace, this.roundCollectedMoods);
        // 表情与经验同源：每收集 1 个表情固定获得 1 点经验，连消不参与经验计算。
        const gainedExperience = this.roundCollectedMoods;
        this.dailyMoodCount += collectedMoods;
        const levelUps = this.addExperience(gainedExperience);
        this.savePersistentProgress();
        return {
            roundScore: this.score,
            roundMoodCount: this.roundCollectedMoods,
            collectedMoods,
            gainedExperience,
            levelUps,
            wishProgressBefore,
            wishProgressAfter: this.dailyMoodCount,
            levelBefore,
            experienceBefore,
            experienceTargetBefore,
            levelAfter: this.level,
            experienceAfter: this.experience,
            experienceTargetAfter: this.getExperienceTarget(),
        };
    }

    public getExperienceTarget(): number {
        return this.getExperienceTargetForLevel(this.level);
    }

    public getExperienceTargetForLevel(level: number): number {
        return Math.max(15, Math.ceil(15 * Math.pow(1.32, Math.max(1, level) - 1)));
    }

    public getMonthRecords(year: number, month: number): { [key: string]: number } {
        const allRecords = this.readJson('zyx_wish_calendar');
        const prefix = `${year}-${this.twoDigits(month + 1)}-`;
        const records: { [key: string]: number } = {};
        Object.keys(allRecords).forEach((key) => {
            if (key.indexOf(prefix) === 0) records[key] = Number(allRecords[key]) || 0;
        });
        if (this.dailyKey.indexOf(prefix) === 0) records[this.dailyKey] = this.getWishTier();
        return records;
    }

    /** 周面板按具体日期读取进度，避免跨月时只能查到当前月份。 */
    public getWishTierForDate(date: Date): number {
        const key = this.getLocalDateKey(date);
        if (key === this.dailyKey) return this.getWishTier();
        const records = this.readJson('zyx_wish_calendar');
        return Math.max(0, Number(records[key]) || 0);
    }

    /** 装满的顺心瓶只能领取一次，领取状态与日进度分开持久化。 */
    public isFullBottleRewardClaimed(date: Date): boolean {
        const key = this.getLocalDateKey(date);
        const claimed = this.readFlagMap('zyx_claimed_bottle_rewards');
        return claimed[key] === true;
    }

    /** 点击装满的瓶子随机获得一个道具，并返回用于界面提示的正式名称。 */
    public claimFullBottleReward(date: Date): '解压锤' | '魔法棒' | null {
        if (this.getWishTierForDate(date) < 3 || this.isFullBottleRewardClaimed(date)) return null;
        const key = this.getLocalDateKey(date);
        const claimed = this.readFlagMap('zyx_claimed_bottle_rewards');
        claimed[key] = true;
        cc.sys.localStorage.setItem('zyx_claimed_bottle_rewards', JSON.stringify(claimed));

        if (Math.random() < 0.5) {
            this.grantRewardedHammer();
            return '解压锤';
        }
        this.grantRewardedColorPurifier();
        return '魔法棒';
    }

    public getWishTier(): number {
        if (this.dailyMoodCount <= 0) return 0;
        if (this.dailyMoodCount >= DAILY_WISH_TARGET) return 3;
        if (this.dailyMoodCount >= Math.ceil(DAILY_WISH_TARGET / 2)) return 2;
        return 1;
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

    private generateNextRow(): NextPiece[] {
        const pieces: NextPiece[] = [];
        const targetCells = Math.min(6, 4 + Math.floor(this.turn / 8));
        let col = 0;
        let filled = 0;

        while (col < BOARD_COLS && filled < targetCells) {
            const remainingTarget = targetCells - filled;
            const remainingBoard = BOARD_COLS - col;
            if (pieces.length > 0 && Math.random() < 0.28 && remainingBoard > remainingTarget) {
                col++;
                continue;
            }

            const maxSize = Math.min(3, remainingTarget, remainingBoard);
            const size = 1 + Math.floor(Math.random() * maxSize);
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
            col += size;
            filled += size;
        }
        return pieces;
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
        const currentKey = this.getLocalDateKey(new Date());
        this.level = Math.max(1, this.readNumber('zyx_level', 1));
        this.experience = Math.max(0, this.readNumber('zyx_experience', 0));
        const storedKey = cc.sys.localStorage.getItem('zyx_daily_key') || '';
        if (storedKey === currentKey) {
            const legacyValue = this.readNumber('zyx_daily_wish', 0);
            this.dailyMoodCount = Math.max(0, Math.min(
                DAILY_WISH_TARGET,
                this.readNumber('zyx_daily_moods', legacyValue),
            ));
        } else {
            this.dailyMoodCount = 0;
            cc.sys.localStorage.setItem('zyx_daily_key', currentKey);
            cc.sys.localStorage.setItem('zyx_daily_moods', '0');
        }
        this.dailyKey = currentKey;
    }

    private savePersistentProgress(): void {
        cc.sys.localStorage.setItem('zyx_daily_key', this.dailyKey);
        cc.sys.localStorage.setItem('zyx_daily_moods', String(this.dailyMoodCount));
        cc.sys.localStorage.setItem('zyx_level', String(this.level));
        cc.sys.localStorage.setItem('zyx_experience', String(this.experience));
        const calendar = this.readJson('zyx_wish_calendar');
        calendar[this.dailyKey] = this.getWishTier();
        cc.sys.localStorage.setItem('zyx_wish_calendar', JSON.stringify(calendar));
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

    private getLocalDateKey(date: Date): string {
        return `${date.getFullYear()}-${this.twoDigits(date.getMonth() + 1)}-${this.twoDigits(date.getDate())}`;
    }

    private twoDigits(value: number): string {
        return value < 10 ? `0${value}` : String(value);
    }

    private readJson(key: string): { [key: string]: number } {
        const raw = cc.sys.localStorage.getItem(key);
        if (!raw) return {};
        try {
            const value = JSON.parse(raw);
            return value && typeof value === 'object' ? value : {};
        } catch (error) {
            return {};
        }
    }

    private readFlagMap(key: string): { [key: string]: boolean } {
        const raw = cc.sys.localStorage.getItem(key);
        if (!raw) return {};
        try {
            const value = JSON.parse(raw);
            return value && typeof value === 'object' ? value : {};
        } catch (error) {
            return {};
        }
    }

    private readNumber(key: string, fallback: number): number {
        const value = Number(cc.sys.localStorage.getItem(key));
        return Number.isFinite(value) ? value : fallback;
    }
}

export const zyxGameModule = new ZyxGameModule();
