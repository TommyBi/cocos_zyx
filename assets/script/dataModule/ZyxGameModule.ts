import {
    DATA_GENERATION,
    DATA_GENERATION_KEY,
    DEAD_ROUND_SETTLEMENTS_KEY,
    MOOD_BEAN_BALANCE_KEY,
    PENDING_ROUND_SETTLEMENTS_KEY,
    PENDING_ROUND_SETTLEMENTS_LIMIT,
    getMoodCollection,
} from './MoodBeanConfig';

import BoardEngine, { RoundToolState } from './BoardEngine';
import { rebuildRound, SavedRoundReplay } from './RoundReplay';
export * from './BoardEngine';
export { default as BoardEngine } from './BoardEngine';
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
    'zyx_revive_card_inventory',
    'zyx_cloud_token',
    'zyx_cloud_device_id',
    'zyx_pending_start_round_id',
    'zyx_pending_stamina_share_id',
    'zyx_pending_tool_exchange',
    'zyx_tool_reward_hammer',
    'zyx_tool_reward_magicWand',
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
 * 一次性数据代际清空：标记与当前发布代际不同时删除全部 zyx_* 本地数据。
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

export type RoundSettlement = {
    roundScore: number;
    /** 历史字段名：实际消除的带表情块原始数，用于重放和经验，不能直接作为豆子奖励。 */
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
    sessionToken?: string;
    roundId: string;
    startedAt: number;
    endedAt: number;
    score: number;
    collectedMoodBeanCount: number;
    actions?: any[];
};

/** 永久失败的结算记录：移出活动队列后保留原因与时间，供排查且不堵塞后续记录。 */
export type DeadRoundSettlement = {
    record: PendingRoundSettlement;
    reason: string;
    deadAt: number;
};

/**
 * 左右消的唯一数据源。
 * UI 只负责展示和手势，棋盘碰撞、重力、消除与计分都集中在这里。
 */
export default class ZyxGameModule extends BoardEngine {
    public moodBeanBalance = 0;
    public reviveCardCount = 0;
    public level = 1;
    public experience = 0;
    public challengeCount = 0;
    public startingBestScore = 0;
    public roundStartedAt = 0;
    private roundSettled = false;
    private seedOverride = 0;
    private pendingServerSeed = 0;
    private pendingServerTutorial: boolean = null;
    private loggedInGameCount = 0;
    private sessionStartedRounds = 0;
    private hasGameCountBaseline = false;
    private cloudPlayerId = '';
    public getPlayerId(): string { return this.cloudPlayerId; }
    private assetRevision = -1;
    public cloudRoundId = '';
    public roundToolClaims = { hammer: 0, magicWand: 0 };

    public applyRoundTools(tools?: RoundToolState): void {
        if (this.rulesVersion < 12 || !tools) return;
        this.roundToolClaims = { hammer: tools.hammer.acquired, magicWand: tools.magicWand.acquired };
        this.hammerCount = tools.hammer.owned;
        this.colorPurifierCount = tools.magicWand.owned;
    }

    private pendingHeartEligible = false;

    public restoreRound(saved: SavedRoundReplay): void {
        const board = rebuildRound(saved.seed, saved.isTutorial, saved.actions, saved.rulesVersion, saved.heartRescueEligible);
        for (const key of Object.keys(board)) {
            if (['hammerCount', 'colorPurifierCount', 'bestScore'].includes(key)) continue;
            (this as any)[key] = (board as any)[key];
        }
        this.roundSettled = false;
        this.roundStartedAt = Date.now() - saved.elapsedMs;
        this.startingBestScore = this.bestScore;
        this.challengeCount = Math.max(1, this.loggedInGameCount + 1);
        this.cloudRoundId = saved.roundId;
        this.pendingServerSeed = 0;
        this.pendingServerTutorial = null;
        this.pendingHeartEligible = false;
        this.takeLightningEffects();
        this.applyRoundTools(saved.roundTools);
        // 临时提示按已过期处理；保留冷却/已用状态，不补发广告或分享奖励。
        this.dismissBalloonRescue(saved.elapsedMs);
        this.dismissHeartRescue();
    }

    public resetRound(): void {
        this.roundToolClaims = { hammer: 0, magicWand: 0 };
        this.hammerCount = Math.max(0, this.readNumber('zyx_hammer_inventory', 0));
        this.colorPurifierCount = Math.max(0, this.readNumber('zyx_magic_wand_inventory', 0));
        this.reviveCardCount = Math.max(0, this.readNumber('zyx_revive_card_inventory', 0));
        this.roundSettled = false;
        this.roundStartedAt = Date.now();
        this.bestScore = this.readNumber('zyx_best_score', 0);
        this.startingBestScore = this.bestScore;
        this.roundSeed = this.pendingServerSeed || this.seedOverride || this.createRandomSeed();
        this.pendingServerSeed = 0;
        this.randomState = this.roundSeed;
        this.generationDebugLog = [];
        this.sessionStartedRounds++;
        const persistedChallengeCount = Math.max(0, Math.floor(this.readNumber(TUTORIAL_CHALLENGE_COUNT_KEY, 0)));
        this.challengeCount = Math.max(
            persistedChallengeCount + 1,
            this.loggedInGameCount + this.sessionStartedRounds,
        );
        cc.sys.localStorage.setItem(TUTORIAL_CHALLENGE_COUNT_KEY, String(this.challengeCount));
        this.currentRoundIsTutorial = this.pendingServerTutorial === null
            ? this.challengeCount > 0 && this.challengeCount <= 2
            : this.pendingServerTutorial;
        this.pendingServerTutorial = null;
        this.syncPersistentProgress();
        cc.log(`[棋盘调试] 本局随机种子 ${this.roundSeed}`);

        this.resetBoard(this.roundSeed, this.currentRoundIsTutorial, undefined, this.pendingHeartEligible);
        this.pendingHeartEligible = false;
    }

    /** 首次启动分流：云端没有完成局数的新用户直接进入消除；无法联网时也优先保证可玩。 */
    public shouldEnterGameOnLaunch(): boolean {
        return !this.hasGameCountBaseline || this.loggedInGameCount === 0;
    }

    /** 调试复现：传入正整数后，后续每局都使用同一随机序列；传 0 恢复随机。 */
    public setRoundSeedOverride(seed: number): void {
        const normalized = Math.floor(Number(seed)) >>> 0;
        this.seedOverride = normalized || 0;
    }

    /** 服务端下发开局配置；在随后的 resetRound 中生效，且仅消费一次。 */
    public setRoundSeed(seed: number, isTutorial?: boolean, heartEligible: boolean = false): void {
        this.pendingHeartEligible = heartEligible;
        this.pendingServerSeed = seed >>> 0 || 1;
        if (typeof isTutorial === 'boolean') this.pendingServerTutorial = isTutorial;
        this.roundSeed = this.pendingServerSeed;
        this.randomState = this.roundSeed;
    }

    /** 在任何本地进度消费方（首页展示、云 bootstrap 建档）之前调用，确保模块字段与持久化存档一致。 */
    public refreshPersistentProgress(): void {
        this.syncPersistentProgress();
        // 冷启动时 bestScore 仍是模块默认值，这里用存储值兜底；max 避免覆盖局内尚未落盘的更高分。
        this.bestScore = Math.max(this.bestScore, this.readNumber('zyx_best_score', 0));
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

        // 原始表情块数用于重放；整颗豆奖励由服务端校验后正式入账，余量不跨局。
        const roundCollectedMoodBeans = this.roundCollectedMoodBeans;
        const roundBonusMoodBeans = 0;
        const roundEarnedMoodBeans = getMoodCollection(roundCollectedMoodBeans).beans + roundBonusMoodBeans;
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
    public registeredAt = '';

    public applyCloudProfile(profile: {
        registeredAt?: string;
        playerId?: string;
        assetRevision?: number;
        inventory?: { hammer: number; magicWand: number; reviveCard?: number };
        level: number;
        experience: number;
        moodBeanBalance: number;
        totalMoodBeans?: number;
        highestSingleGameScore: number;
        gameCount?: number;
    }): boolean {
        if (profile.playerId && profile.playerId !== this.cloudPlayerId) {
            this.cloudPlayerId = profile.playerId;
            this.assetRevision = -1;
        }
        if (typeof profile.assetRevision === 'number') {
            if (profile.assetRevision < this.assetRevision) return false;
            this.assetRevision = profile.assetRevision;
        } else if (this.assetRevision >= 0) return false; // 迁移前的历史回执也不能覆盖当前资产。
        if (profile.inventory) {
            if (this.rulesVersion < 12) {
                this.hammerCount = Math.max(0, Math.floor(profile.inventory.hammer || 0));
                this.colorPurifierCount = Math.max(0, Math.floor(profile.inventory.magicWand || 0));
            }
            this.reviveCardCount = Math.max(0, Math.floor(profile.inventory.reviveCard || 0));
            this.saveToolInventory();
        }
        if (profile.registeredAt) this.registeredAt = profile.registeredAt;
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
        return true;
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
        this.reviveCardCount = 0;
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
        cc.sys.localStorage.removeItem('zyx_first_round_bomb_guides_' + this.cloudPlayerId);
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

    private createRandomSeed(): number {
        const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
        return seed || 1;
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

    protected saveToolInventory(): void {
        cc.sys.localStorage.setItem('zyx_hammer_inventory', String(this.hammerCount));
        cc.sys.localStorage.setItem('zyx_magic_wand_inventory', String(this.colorPurifierCount));
        cc.sys.localStorage.setItem('zyx_revive_card_inventory', String(this.reviveCardCount));
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
