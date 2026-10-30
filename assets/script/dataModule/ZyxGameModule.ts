import {
    DATA_GENERATION,
    DATA_GENERATION_KEY,
    DEAD_ROUND_SETTLEMENTS_KEY,
    MOOD_BEAN_BALANCE_KEY,
    PENDING_ROUND_SETTLEMENTS_KEY,
    PENDING_ROUND_SETTLEMENTS_LIMIT,
} from './MoodBeanConfig';

export const BOARD_ROWS = 10;
export const BOARD_COLS = 8;
export const CELL_SIZE = 76;
const TUTORIAL_CHALLENGE_COUNT_KEY = 'zyx_tutorial_challenge_count';

/**
 * 新数据代际清空时必须移除的已知键。
 * Web 环境可枚举 localStorage 时会全量删除 zyx_* 键；微信与测试环境退化为显式清单。
 * 旧开心瓶、旧画册与旧日进度键只出现在这里用于删除，不会被读取或折算。
 */
const KNOWN_STORAGE_KEYS = [
    DATA_GENERATION_KEY,
    MOOD_BEAN_BALANCE_KEY,
    PENDING_ROUND_SETTLEMENTS_KEY,
    DEAD_ROUND_SETTLEMENTS_KEY,
    // 退役功能的本地键只在旧代际清理时删除，不再读取或写入。
    'zyx_official_art_progress_cache',
    'zyx_pending_realm_action',
    TUTORIAL_CHALLENGE_COUNT_KEY,
    'zyx_level',
    'zyx_experience',
    'zyx_best_score',
    'zyx_hammer_inventory',
    'zyx_magic_wand_inventory',
    'zyx_cloud_token',
    'zyx_cloud_device_id',
    'zyx_pending_start_round_id',
    'zyx_wechat_profile',
    'zyx_game_settings_v1',
    'zyx_gm_bubble_pos_v1',
    // 旧经济键：只删除，不读取。
    'zyx_happy_bottle_count',
    'zyx_current_happy_bottle_progress',
    'zyx_unlocked_albums',
    'zyx_unlocked_album_arts',
    'zyx_pending_realm_unlocks',
    'zyx_daily_moods',
    'zyx_daily_wish',
];

/**
 * 一次性数据代际清空：标记不是 mood_bean_v1 时删除全部 zyx_* 本地数据。
 * 不迁移、不折算任何旧值；写入标记后正常重启不会再次清空新档。
 * 返回 true 表示本次启动执行了清空。
 */
export function ensureDataGeneration(): boolean {
    const storage = cc.sys.localStorage;
    if (storage.getItem(DATA_GENERATION_KEY) === DATA_GENERATION) return false;
    // 本地开发的 API 覆盖地址不属于玩家数据，整代清空时保留。
    const apiBaseOverride = storage.getItem('zyx_api_base_override');
    const enumerable = storage as any;
    if (typeof enumerable.length === 'number' && typeof enumerable.key === 'function') {
        const keys: string[] = [];
        for (let index = 0; index < enumerable.length; index++) {
            const key = enumerable.key(index);
            if (key && key.indexOf('zyx_') === 0) keys.push(key);
        }
        keys.forEach((key) => storage.removeItem(key));
    } else {
        KNOWN_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
    }
    storage.setItem(DATA_GENERATION_KEY, DATA_GENERATION);
    if (apiBaseOverride) storage.setItem('zyx_api_base_override', apiBaseOverride);
    return true;
}

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
    /** 本局实际消除并收集的带表情心情块数（一块一豆）。 */
    roundCollectedMoodBeans: number;
    /** 经服务端验证的结算额外奖励；未触发时为 0，结算中单列展示。 */
    roundBonusMoodBeans: number;
    /** 本局收集的待确认开心豆；最终余额以服务端回执为准。 */
    roundEarnedMoodBeans: number;
    gainedExperience: number;
    levelUps: number;
    moodBeanBalanceBefore: number;
    moodBeanBalanceAfter: number;
    levelBefore: number;
    experienceBefore: number;
    experienceTargetBefore: number;
    levelAfter: number;
    experienceAfter: number;
    experienceTargetAfter: number;
};

/** 离线结算待提交队列的单条记录；云端按 roundId 幂等。 */
export type PendingRoundSettlement = {
    roundId: string;
    startedAt: number;
    endedAt: number;
    score: number;
    collectedMoodBeanCount: number;
};

/** 永久失败的结算记录：移出活动队列后保留原因与时间，供排查且不堵塞后续记录。 */
export type DeadRoundSettlement = {
    record: PendingRoundSettlement;
    reason: string;
    deadAt: number;
};

export type MoveHint = {
    id: number;
    offset: number;
};

export type TutorialMove = MoveHint & {
    pieceSize: number;
    targetRow: number;
    targetCol: number;
};

export type AutoPurifyResult = {
    color: number;
    removedPieceIds: number[];
};

export type RowGenerationDebug = {
    seed: number;
    turn: number;
    targetCells: number;
    sizes: number[];
    gaps: number[];
    colors: number[];
    stampCount: number;
    movablePieces: number;
    attempts: number;
};

type GeneratedRowCandidate = {
    pieces: NextPiece[];
    sizes: number[];
    gaps: number[];
    movablePieces: number;
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
    /** 本局实际消除并收集的带表情心情块数；结算时 1:1 入账为开心豆。 */
    public roundCollectedMoodBeans: number = 0;
    /** 开心豆长期余额；服务端是最终权威，本地仅作缓存与离线展示。 */
    public moodBeanBalance: number = 0;
    public level: number = 1;
    public experience: number = 0;
    public challengeCount: number = 0;
    public startingBestScore: number = 0;
    public roundSeed: number = 0;
    /** 本局开始时间（resetRound 时刷新）；暂停重开放弃本局后，新局从重开时刻重新计时。 */
    public roundStartedAt: number = 0;
    public generationDebugLog: RowGenerationDebug[] = [];

    private nextId: number = 1;
    private roundSettled: boolean = false;
    private seedOverride: number = 0;
    private randomState: number = 1;
    private tutorialMoves: TutorialMove[] = [];
    private loggedInGameCount: number = 0;
    private sessionStartedRounds: number = 0;
    private hasGameCountBaseline: boolean = false;

    public resetRound(): void {
        this.score = 0;
        this.turn = 0;
        this.roundClearedRows = 0;
        this.roundCollectedMoodBeans = 0;
        this.nextId = 1;
        this.hammerCount = Math.max(0, this.readNumber('zyx_hammer_inventory', 0));
        this.colorPurifierCount = Math.max(0, this.readNumber('zyx_magic_wand_inventory', 0));
        this.roundSettled = false;
        this.roundStartedAt = Date.now();
        this.bestScore = this.readNumber('zyx_best_score', 0);
        this.startingBestScore = this.bestScore;
        this.roundSeed = this.seedOverride || this.createRandomSeed();
        this.randomState = this.roundSeed;
        this.generationDebugLog = [];
        this.sessionStartedRounds++;
        const persistedChallengeCount = Math.max(0, Math.floor(this.readNumber(TUTORIAL_CHALLENGE_COUNT_KEY, 0)));
        this.challengeCount = Math.max(
            persistedChallengeCount + 1,
            this.loggedInGameCount + this.sessionStartedRounds,
        );
        cc.sys.localStorage.setItem(TUTORIAL_CHALLENGE_COUNT_KEY, String(this.challengeCount));
        this.syncPersistentProgress();
        cc.log(`[棋盘调试] 本局随机种子 ${this.roundSeed}`);

        if (this.isTutorialRound()) {
            this.pieces = this.createTutorialBoard();
            this.nextPieces = this.createTutorialNextRow();
        } else {
            this.tutorialMoves = [];
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
    }

    /** 登录返回的已完成局数与本次会话开局数共同决定是否进入前两局教学。 */
    public isTutorialRound(): boolean {
        return this.challengeCount > 0 && this.challengeCount <= 2;
    }

    /** 首次启动分流：云端没有完成局数的新用户直接进入消除；无法联网时也优先保证可玩。 */
    public shouldEnterGameOnLaunch(): boolean {
        return !this.hasGameCountBaseline || this.loggedInGameCount === 0;
    }

    public getTutorialMove(step: number): TutorialMove {
        const move = this.tutorialMoves[step];
        return move ? { ...move } : null;
    }

    /** 调试复现：传入正整数后，后续每局都使用同一随机序列；传 0 恢复随机。 */
    public setRoundSeedOverride(seed: number): void {
        const normalized = Math.floor(Number(seed)) >>> 0;
        this.seedOverride = normalized || 0;
    }

    /** 在任何本地进度消费方（首页展示、云 bootstrap 建档）之前调用，确保模块字段与持久化存档一致。 */
    public refreshPersistentProgress(): void {
        this.syncPersistentProgress();
        // 冷启动时 bestScore 仍是模块默认值，这里用存储值兜底；max 避免覆盖局内尚未落盘的更高分。
        this.bestScore = Math.max(this.bestScore, this.readNumber('zyx_best_score', 0));
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

    /** 棋盘最高色块进入顶部预留区时，进入濒死救场状态。 */
    public hasEnteredRescueZone(emptyRows: number = 2): boolean {
        if (this.pieces.length === 0) return false;
        const topmostRow = this.pieces.reduce(
            (minimum, piece) => Math.min(minimum, piece.row),
            BOARD_ROWS,
        );
        return topmostRow <= Math.max(0, emptyRows);
    }

    /** 当前棋盘实际占用的高度层数量；同一行有多个色块仍只计为一排。 */
    public getOccupiedRowCount(): number {
        const occupiedRows: { [row: number]: boolean } = {};
        this.pieces.forEach((piece) => occupiedRows[piece.row] = true);
        return Object.keys(occupiedRows).length;
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

    /** 紧急分享救场：一次性清空当前棋盘，并返回需要播放退场动画的色块。 */
    public removeAllPieces(): number[] {
        const removedPieceIds = this.pieces.map((piece) => piece.id);
        this.pieces = [];
        return removedPieceIds;
    }

    /** 复活时清理顶部指定行数；默认清掉 8 行，仅保留底部 2 行继续挑战。 */
    public removeTopRowsForRevive(rowCount: number = 8): number[] {
        const firstPreservedRow = Math.max(0, Math.min(BOARD_ROWS, Math.floor(rowCount)));
        const removedPieceIds = this.pieces
            .filter((piece) => piece.row < firstPreservedRow)
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
        this.roundCollectedMoodBeans += collectedMoodTypes.length;
// 局内消除时只在内存刷新 HUD“可能达到的新纪录”展示，绝不落盘；
// bestScore / zyx_best_score 只能在正式 finishRound() 结算时持久化。
// 暂停重开会走 resetRound()，从 zyx_best_score 重新读取本局开始前的值。
if (this.score > this.bestScore) {
this.bestScore = this.score;
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
        // 余额和等级展示以服务端确认值为准；本局收集数仅作为待结算预览。
        const displayBalanceBefore = this.getDisplayMoodBeanBalance();
        const displayLevelBefore = this.getDisplayLevelAndExperience();
        if (this.roundSettled) {
            return {
                roundScore: this.score,
                roundCollectedMoodBeans: 0,
                roundBonusMoodBeans: 0,
                roundEarnedMoodBeans: 0,
                gainedExperience: 0,
                levelUps: 0,
                moodBeanBalanceBefore: displayBalanceBefore,
                moodBeanBalanceAfter: displayBalanceBefore,
                levelBefore: displayLevelBefore.level,
                experienceBefore: displayLevelBefore.experience,
                experienceTargetBefore: displayLevelBefore.target,
                levelAfter: displayLevelBefore.level,
                experienceAfter: displayLevelBefore.experience,
                experienceTargetAfter: displayLevelBefore.target,
            };
        }
        this.roundSettled = true;
        if (this.score > this.bestScore) this.bestScore = this.score;
        cc.sys.localStorage.setItem('zyx_best_score', String(this.bestScore));

        // 一块一豆是本局收集预览；服务端校验开局凭证后才正式入账。
        const roundCollectedMoodBeans = this.roundCollectedMoodBeans;
        const roundBonusMoodBeans = 0;
        const roundEarnedMoodBeans = roundCollectedMoodBeans + roundBonusMoodBeans;
        const gainedExperience = roundCollectedMoodBeans;
        // 本局奖励不直接写入余额或等级；只有服务端回执才能更新可兑换余额。
        let levelAfter = displayLevelBefore.level;
        let experienceAfter = displayLevelBefore.experience + gainedExperience;
        let experienceTargetAfter = displayLevelBefore.target;
        while (experienceAfter >= experienceTargetAfter) {
            experienceAfter -= experienceTargetAfter;
            levelAfter++;
            experienceTargetAfter = this.getExperienceTargetForLevel(levelAfter);
        }
        return {
            roundScore: this.score,
            roundCollectedMoodBeans,
            roundBonusMoodBeans,
            roundEarnedMoodBeans,
            gainedExperience,
            levelUps: levelAfter - displayLevelBefore.level,
            moodBeanBalanceBefore: displayBalanceBefore,
            moodBeanBalanceAfter: displayBalanceBefore,
            levelBefore: displayLevelBefore.level,
            experienceBefore: displayLevelBefore.experience,
            experienceTargetBefore: displayLevelBefore.target,
            levelAfter,
            experienceAfter,
            experienceTargetAfter,
        };
    }

    /**
     * 云端结算返回后覆盖本地展示缓存；服务端数据是最终权威来源。
     *
     * 开心豆、等级和经验只保存服务端确认值；待提交记录不能提前计入开心豆余额。
     */
    public applyCloudProfile(profile: {
        level: number;
        experience: number;
        moodBeanBalance: number;
        totalMoodBeans?: number;
        highestSingleGameScore: number;
        gameCount?: number;
    }): void {
        this.level = Math.max(1, profile.level || 1);
        this.experience = Math.max(0, profile.experience || 0);
        this.moodBeanBalance = Math.max(0, Math.floor(profile.moodBeanBalance || 0));
        this.bestScore = Math.max(0, Math.floor(profile.highestSingleGameScore || 0));
        if (!this.hasGameCountBaseline) {
            this.loggedInGameCount = Math.max(0, Math.floor(profile.gameCount || 0));
            this.hasGameCountBaseline = true;
            const persistedChallengeCount = Math.max(0, Math.floor(this.readNumber(TUTORIAL_CHALLENGE_COUNT_KEY, 0)));
            this.challengeCount = Math.max(
                this.challengeCount,
                persistedChallengeCount,
                this.loggedInGameCount + this.sessionStartedRounds,
            );
        }
        this.savePersistentProgress();
        cc.sys.localStorage.setItem('zyx_best_score', String(this.bestScore));
    }

    /** 只展示服务端确认的可兑换余额，待结算收集数留在本局展示。 */
    public getDisplayMoodBeanBalance(): number {
        return Math.max(0, Math.floor(this.moodBeanBalance));
    }

    /** 只展示服务端确认的等级和经验。 */
    public getDisplayLevelAndExperience(): { level: number; experience: number; target: number } {
        return { level: this.level, experience: this.experience, target: this.getExperienceTargetForLevel(this.level) };
    }

    public getExperienceTarget(): number {
        return this.getExperienceTargetForLevel(this.level);
    }

    public getExperienceTargetForLevel(level: number): number {
        return Math.max(15, Math.ceil(15 * Math.pow(1.32, Math.max(1, level) - 1)));
    }

    /**
     * 本地 GM 面板的库存发放入口。
     * 先从持久化存档读取，再整体写回，确保首页未开局时不会把已有道具库存覆盖为 0。
     */
    public grantDebugInventory(moodBeans: number, hammers: number, magicWands: number): void {
        const beanReward = Math.max(0, Math.floor(moodBeans));
        const hammerReward = Math.max(0, Math.floor(hammers));
        const wandReward = Math.max(0, Math.floor(magicWands));
        this.syncPersistentProgress();
        this.hammerCount = Math.max(0, this.readNumber('zyx_hammer_inventory', this.hammerCount));
        this.colorPurifierCount = Math.max(0, this.readNumber('zyx_magic_wand_inventory', this.colorPurifierCount));
        this.moodBeanBalance += beanReward;
        this.hammerCount += hammerReward;
        this.colorPurifierCount += wandReward;
        this.savePersistentProgress();
        this.saveToolInventory();
    }

    /** GM：重置本地进度与道具；云端需另行调用 reset。 */
    public resetLocalAccount(): void {
        this.level = 1;
        this.experience = 0;
        this.moodBeanBalance = 0;
        this.hammerCount = 0;
        this.colorPurifierCount = 0;
        this.bestScore = 0;
        this.challengeCount = 0;
        this.loggedInGameCount = 0;
        this.sessionStartedRounds = 0;
        this.hasGameCountBaseline = false;
        cc.sys.localStorage.setItem(TUTORIAL_CHALLENGE_COUNT_KEY, '0');
        this.savePersistentProgress();
        this.saveToolInventory();
        cc.sys.localStorage.setItem('zyx_best_score', '0');
        cc.sys.localStorage.setItem(PENDING_ROUND_SETTLEMENTS_KEY, '[]');
        cc.sys.localStorage.removeItem(DEAD_ROUND_SETTLEMENTS_KEY);
    }

    // ---------- 离线结算待提交队列 ----------

    public getPendingRoundSettlements(): PendingRoundSettlement[] {
        const raw = cc.sys.localStorage.getItem(PENDING_ROUND_SETTLEMENTS_KEY);
        if (!raw) return [];
        try {
            const value = JSON.parse(raw);
            if (!Array.isArray(value)) return [];
            return value.filter((item) => item && typeof item.roundId === 'string' && item.roundId.length > 0);
        } catch (error) {
            return [];
        }
    }

    /** 本地结算后立即入队；同一 roundId 不重复入队，队列封顶并记录异常但不静默覆盖。 */
    public enqueuePendingRoundSettlement(record: PendingRoundSettlement): void {
        const queue = this.getPendingRoundSettlements();
        if (queue.some((item) => item.roundId === record.roundId)) return;
        if (queue.length >= PENDING_ROUND_SETTLEMENTS_LIMIT) {
            cc.warn(`[开心豆] 待提交结算队列已达上限，最新一局 ${record.roundId} 暂不覆盖旧记录`);
            return;
        }
        queue.push(record);
        cc.sys.localStorage.setItem(PENDING_ROUND_SETTLEMENTS_KEY, JSON.stringify(queue));
    }

    /** 开始新一局前的前置检查：队列已满时必须提示玩家先联网同步，不允许“本地入账但无记录”。 */
    public canAcceptPendingRoundSettlement(): boolean {
        return this.getPendingRoundSettlements().length < PENDING_ROUND_SETTLEMENTS_LIMIT;
    }

    /** 永久错误隔离：从活动队列移入 dead-letter，保留原因与时间；后续记录继续补传。 */
    public movePendingRoundSettlementToDeadLetter(roundId: string, reason: string): void {
        const queue = this.getPendingRoundSettlements();
        const target = queue.find((item) => item.roundId === roundId);
        if (!target) return;
        this.removePendingRoundSettlement(roundId);
        const dead = this.getDeadRoundSettlements();
        dead.push({
            record: target,
            reason: String(reason || '未知错误').slice(0, 120),
            deadAt: Date.now(),
        });
        // dead-letter 只保留最近 20 条，避免无限膨胀。
        while (dead.length > 20) dead.shift();
        cc.sys.localStorage.setItem(DEAD_ROUND_SETTLEMENTS_KEY, JSON.stringify(dead));
    }

    public getDeadRoundSettlements(): DeadRoundSettlement[] {
        const raw = cc.sys.localStorage.getItem(DEAD_ROUND_SETTLEMENTS_KEY);
        if (!raw) return [];
        try {
            const value = JSON.parse(raw);
            if (!Array.isArray(value)) return [];
            return value.filter((item) => item && item.record && typeof item.record.roundId === 'string');
        } catch (error) {
            return [];
        }
    }

    /** 云端结算成功后只删除对应 roundId。 */
    public removePendingRoundSettlement(roundId: string): void {
        const queue = this.getPendingRoundSettlements().filter((item) => item.roundId !== roundId);
        cc.sys.localStorage.setItem(PENDING_ROUND_SETTLEMENTS_KEY, JSON.stringify(queue));
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
        const targetCells = this.pickTargetCells();
        let best: GeneratedRowCandidate = null;
        let attempts = 0;
        const minimumMovablePieces = 2;
        while (attempts < 6) {
            attempts++;
            const candidate = this.createNextRowCandidate(targetCells);
            if (!best || candidate.movablePieces > best.movablePieces) best = candidate;
            if (candidate.movablePieces >= minimumMovablePieces) {
                best = candidate;
                break;
            }
        }

        const debug: RowGenerationDebug = {
            seed: this.roundSeed,
            turn: this.turn,
            targetCells,
            sizes: best.sizes.slice(),
            gaps: best.gaps.slice(),
            colors: best.pieces.map((piece) => piece.color),
            stampCount: best.pieces.filter((piece) => piece.stampMood > 0).length,
            movablePieces: best.movablePieces,
            attempts,
        };
        this.generationDebugLog.push(debug);
        if (this.generationDebugLog.length > 120) this.generationDebugLog.shift();
        cc.log(
            `[棋盘生成] seed=${debug.seed} turn=${debug.turn} cells=${debug.targetCells}`
            + ` sizes=${debug.sizes.join('-')} gaps=${debug.gaps.join('-')}`
            + ` movable=${debug.movablePieces} attempts=${debug.attempts}`,
        );
        return best.pieces;
    }

    /**
     * 教学局面完全沿用正式重力：3 格、2 格、1 格依次补满下面三行。
     * 每个预设块都与下一层真实重叠支撑，教学过程不需要冻结重力，也不会出现悬空块。
     */
    private createTutorialBoard(): BoardPiece[] {
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

    /** 三步结束后补入的第一排也固定，避免刚脱离教学就遇到难读的随机局面。 */
    private createTutorialNextRow(): NextPiece[] {
        return [
            { col: 0, size: 2, color: 2, stampMood: 2, stampCell: 0, collectibleType: 0, collectibleCell: 0 },
            { col: 3, size: 1, color: 4, stampMood: 0, stampCell: 0, collectibleType: 0, collectibleCell: 0 },
            { col: 5, size: 2, color: 6, stampMood: 6, stampCell: 1, collectibleType: 0, collectibleCell: 0 },
        ];
    }

    /** 4→5→6 格使用概率坡度过渡，避免第 9/17 排突然阶跃。 */
    private pickTargetCells(): number {
        const fiveCellChance = Math.max(0, Math.min(1, (this.turn - 4) / 8));
        const sixCellChance = Math.max(0, Math.min(1, (this.turn - 13) / 10));
        if (sixCellChance > 0 && this.random() < sixCellChance) return 6;
        if (fiveCellChance > 0 && this.random() < fiveCellChance) return 5;
        return 4;
    }

    private createNextRowCandidate(targetCells: number): GeneratedRowCandidate {
        const emptyCells = BOARD_COLS - targetCells;

        const sizes: number[] = [];
        let cellsLeft = targetCells;
        while (cellsLeft > 0) {
            const maxSize = Math.min(3, cellsLeft);
            const size = 1 + Math.floor(this.random() * maxSize);
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

    /** 至少保留两个可横移块，避免所有空位挤在边缘时只剩单一操作。 */
    private countMovableNextPieces(pieces: NextPiece[]): number {
        let movable = 0;
        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            const leftEdge = i > 0 ? pieces[i - 1].col + pieces[i - 1].size : 0;
            const rightEdge = i < pieces.length - 1 ? pieces[i + 1].col : BOARD_COLS;
            if (piece.col > leftEdge || piece.col + piece.size < rightEdge) movable++;
        }
        return movable;
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
        if (total <= 0) return Math.floor(this.random() * weights.length);
        let roll = this.random() * total;
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

    /** 消除越多，新进入的心情越趋向开心与平静色系。 */
    private pickMoodColor(): number {
        let pool = [1, 2, 3, 4, 5, 6, 1, 3, 5, 7, 8, 9, 10, 7, 9];
        if (this.roundClearedRows >= 12) pool = [1, 2, 2, 3, 5, 5, 6, 6];
        else if (this.roundClearedRows >= 7) pool = [1, 2, 3, 3, 4, 5, 5, 6, 7, 9];
        else if (this.roundClearedRows >= 3) pool = [1, 2, 3, 4, 5, 6, 1, 3, 5, 7, 9];
        return pool[Math.floor(this.random() * pool.length)];
    }

    private createRandomSeed(): number {
        const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
        return seed || 1;
    }

    /** xorshift32：轻量、可复现，足够用于棋盘生成而不改变游戏存档。 */
    private random(): number {
        let value = this.randomState | 0;
        value ^= value << 13;
        value ^= value >>> 17;
        value ^= value << 5;
        this.randomState = value >>> 0;
        return this.randomState / 0x100000000;
    }

    private syncPersistentProgress(): void {
        this.moodBeanBalance = Math.max(0, Math.floor(this.readNumber(MOOD_BEAN_BALANCE_KEY, 0)));
        this.level = Math.max(1, this.readNumber('zyx_level', 1));
        this.experience = Math.max(0, this.readNumber('zyx_experience', 0));
    }

    private savePersistentProgress(): void {
        cc.sys.localStorage.setItem(MOOD_BEAN_BALANCE_KEY, String(this.moodBeanBalance));
        cc.sys.localStorage.setItem('zyx_level', String(this.level));
        cc.sys.localStorage.setItem('zyx_experience', String(this.experience));
    }

    private saveToolInventory(): void {
        cc.sys.localStorage.setItem('zyx_hammer_inventory', String(this.hammerCount));
        cc.sys.localStorage.setItem('zyx_magic_wand_inventory', String(this.colorPurifierCount));
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
        const raw = cc.sys.localStorage.getItem(key);
        // 键不存在时 getItem 返回 null/''，Number(null) 为 0 会让 fallback 失效，必须显式判空。
        if (raw === null || raw === undefined || raw === '') return fallback;
        const value = Number(raw);
        return Number.isFinite(value) ? value : fallback;
    }
}

// 模块加载时执行一次性数据代际清空；标记已是 mood_bean_v1 时不做任何事情。
ensureDataGeneration();

export const zyxGameModule = new ZyxGameModule();
