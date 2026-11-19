import { getWxApi } from './PlatformAdapter';
import { BOARD_RULES_VERSION, RoundToolState } from '../dataModule/BoardEngine';
import { MOOD_COLLECTION_RULE } from '../dataModule/MoodBeanConfig';

const PRODUCTION_API_BASE = 'https://api.tcjstory.cn/v1/cocos-zyx';
const STAGING_API_BASE = 'https://staging-api.tcjstory.cn/v1/cocos-zyx';
const ROUND_START_PROTOCOL = { rulesVersion: BOARD_RULES_VERSION, collectionRule: MOOD_COLLECTION_RULE,
    resumeProtocol: 1, securityProtocol: 1 };
const ROUND_START_CAPABILITIES = [
    'bean-collection-progress', 'adaptive-combo-v2', 'bean-collection-1pct', 'bean-tool-shop',
    'difficulty-ramp-2x', 'difficulty-pressure-v4', 'rising-rows-v5', 'balloon-rescue-v6',
    'balloon-blast-v7', 'random-rescue-v8', 'rescue-scoring-v9', 'heart-rescue-v10',
    'round-checkpoints-v1', 'revive-card-v11', 'round-tools-lightning-v12', 'rising-specials-lightning-v13',
    'reward-intents-v1', 'security-audit-v1', 'round-tool-three-video-v14', 'lightning-ten-rows-v15',
    'auto-rescue-v16', 'difficulty-waves-v17', 'scoring-waves-v18', 'tap-lightning-v19',
    'round-tool-share-v20', 'short-opening-v21',
];

function cloudError(message: string, businessCode: string): Error {
    return Object.assign(new Error(message), { businessCode });
}

function readCloudResponse(status: number, payload: any): any {
    if (status >= 200 && status < 300 && payload && payload.code === 0) return payload.data;
    const error = Object.assign(new Error(payload && payload.message || '云端服务暂不可用'), { status }) as any;
    if (payload && typeof payload.errorCode === 'string' && payload.errorCode) error.businessCode = payload.errorCode;
    if (payload && payload.data && payload.data.stamina) error.stamina = payload.data.stamina;
    throw error;
}

/**
 * 两环境自动切换：
 * - 微信正式版（release） → Production
 * - 微信开发版/体验版（develop/trial） → Staging
 * - 浏览器 Web 预览 → Staging
 *
 * 所有测试统一走 Staging，服务端修改部署到测试服后生效。
 */
export function getApiBase(): string {
    const wxApi = getWxApi();
    if (wxApi && typeof wxApi.request === 'function') {
        if (typeof window !== 'undefined' && (window as any).__ZYX_WECHAT_REVIEW_BUILD__ === true) return STAGING_API_BASE;
        try {
            const accountInfo = wxApi.getAccountInfoSync && wxApi.getAccountInfoSync();
            const envVersion = accountInfo && accountInfo.miniProgram
                ? accountInfo.miniProgram.envVersion : 'release';
            if (envVersion === 'release') return PRODUCTION_API_BASE;
            return STAGING_API_BASE;
        } catch (error) {
            return PRODUCTION_API_BASE;
        }
    }
    // Web Debug 本机联调；微信和远程网页始终按环境固定路由。
    if (typeof CC_DEBUG !== 'undefined' && CC_DEBUG && typeof location !== 'undefined'
        && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
        && /(?:^|[?&])localApi=1(?:&|$)/.test(location.search)) {
        return 'http://127.0.0.1:8080/v1/cocos-zyx';
    }
    return STAGING_API_BASE;
}

/** 当前环境名称，便于日志和 UI 标识。 */
export function getEnvName(): string {
    return getApiBase() === PRODUCTION_API_BASE ? 'production' : 'staging';
}

/** GM 云同步仅在非 Production 环境可用。 */
export function isLocalApiOverrideActive(): boolean {
    return getEnvName() !== 'production';
}

export type CloudProfile = {
    playerId: string;
    nickname: string;
    registeredAt?: string;
    avatarUrl: string;
    level: number;
    experience: number;
    moodBeanBalance: number;
    assetRevision?: number;
    inventory?: { hammer: number; magicWand: number; reviveCard?: number };
    totalMoodBeans: number;
    highestSingleGameScore: number;
    gameCount: number;
    stamina: StaminaState;
};

export type StaminaState = {
    current: number;
    max: number;
    regenSeconds: number;
    nextRecoveryAt: string | null;
    serverTime: string;
    shareAvailableToday?: boolean;
};

export type StaminaShareResult = {
    awarded: number;
    stamina: StaminaState;
    duplicate?: boolean;
    previousDay?: boolean;
};

export type RewardIntent = { intentId: string; completed: boolean; minClaimAt: number };

export type StartRoundResult = {
    roundTools?: RoundToolState;
    sessionToken?: string;
    generation?: number;
    startedAt?: number;
    heartRescueEligible?: boolean;
    roundId: string;
    stamina: StaminaState;
    duplicate?: boolean;
    seed: number;
    isTutorial: boolean;
    collectionRule?: string;
    rulesVersion?: number;
    profile?: CloudProfile;
};

export type ActiveRound = StartRoundResult & {
    mode?: string;
    actionCount: number;
    operationCount: number;
    score: number;
    collectedMoodBeanCount: number;
    elapsedMs: number;
    updatedAt: number;
};
export type ResumeRoundResult = ActiveRound & { actions: any[]; sessionToken: string };

export type LeaderboardEntry = {
    rank: number;
    playerId: string;
    nickname: string;
    avatarUrl: string;
    value: number;
    rewardTier: 'gold' | 'silver' | 'bronze' | 'normal';
};

export type LeaderboardType = 'power' | 'beans';

/** 两种永久榜单：最高分 / 当前余额，均返回前 200 名及自己的记录。 */
export type LeaderboardResult = {
    type?: LeaderboardType;
    entries: LeaderboardEntry[];
    self: {
        playerId?: string;
        avatarUrl?: string;
        /** 实际名次；尚未产生有效分数时为 null。 */
        rank: number | null;
        /** 自己单局最高分。 */
        bestScore: number;
        /** 所选榜单的当前数值；旧最高分响应可用 bestScore 回退。 */
        value?: number;
        moodBeanBalance?: number;
        /** 是否进入前 200 名榜单。 */
        onBoard: boolean;
    };
};

export type RoundSettlementResult = {
    accepted: boolean;
    duplicate?: boolean;
    settlement: {
        score: number;
        baseMoodBeans: number;
        bonusMoodBeans: number;
        awardedMoodBeans: number;
        gainedExperience: number;
        profile: CloudProfile;
    };
};

/** 云档案、体力开局、结算与排行榜请求层。 */
export default class CloudService {
    private static _instance: CloudService;
    public static get instance(): CloudService {
        if (!this._instance) this._instance = new CloudService();
        return this._instance;
    }

    private token: string = '';
    private deviceId: string = '';
    private startProtocol: { base: string; token: string; expiresAt: number } = null;

    /**
     * 微信端用一次性 loginCode 换取服务端权威 openid，本地 deviceId 只用于旧账号迁移与 Web 预览。
     * R1：经济数据一律由服务端结算与事务接口产生，不接受任何客户端本地资产作为建档基线。
     */
    public async bootstrap(nickname: string, avatarUrl: string): Promise<CloudProfile> {
        return (await this.bootstrapSession(nickname, avatarUrl)).profile;
    }

    public async bootstrapSession(nickname: string, avatarUrl: string, includeActiveRound = false): Promise<{ profile: CloudProfile; activeRound?: ActiveRound }> {
        this.ensureDeviceId();
        const base = getApiBase();
        const loginCode = await this.requestWeChatLoginCode();
        const data = await this.request('/players/bootstrap', 'POST', {
            deviceId: this.deviceId,
            loginCode,
            securityProtocol: 1,
            includeRoundStart: true,
            ...(includeActiveRound ? { includeActiveRound: true } : {}),
            nickname,
            avatarUrl,
        }, false);
        this.token = data.token;
        cc.sys.localStorage.setItem('zyx_cloud_token', this.token);
        this.startProtocol = data.roundStart && Object.keys(ROUND_START_PROTOCOL)
            .every(key => data.roundStart[key] === ROUND_START_PROTOCOL[key])
            ? { base, token: this.token, expiresAt: Date.now() + 60000 } : null;
        return data;
    }

    /** 仅在玩家主动完成微信授权后调用，普通登录不会覆盖服务端资料。 */
    public async updateWeChatProfile(nickname: string, avatarUrl: string): Promise<CloudProfile> {
        const data = await this.request('/players/profile', 'POST', { nickname, avatarUrl }, true);
        return data.profile as CloudProfile;
    }

    /** roundId 由客户端在请求前生成；超时后复用同一 ID 重试，不重复消耗体力。 */
    public async startRound(roundId: string, replacement?: { replaceRoundId: string; replacementGeneration: number; replaceSessionToken?: string }): Promise<StartRoundResult> {
        const unavailable = (): Error => cloudError('游戏服务更新中，请稍后再试', 'COLLECTION_RULE_UNSUPPORTED');
        // 复用本次登录返回的开局协议，旧后端仍走完整的能力探测。
        const protocol = this.startProtocol;
        if (!protocol || protocol.base !== getApiBase() || protocol.expiresAt <= Date.now()
            || protocol.token !== cc.sys.localStorage.getItem('zyx_cloud_token')) {
            const { capabilities } = await this.request('/health', 'GET', null, false);
            if (!Array.isArray(capabilities) || !ROUND_START_CAPABILITIES.every(capability => capabilities.includes(capability))) {
                throw unavailable();
            }
        }
        const result = await this.request('/games/start', 'POST', { roundId, ...ROUND_START_PROTOCOL, ...replacement }, true) as StartRoundResult;
        if (result.collectionRule !== MOOD_COLLECTION_RULE || result.rulesVersion !== BOARD_RULES_VERSION
            || typeof result.sessionToken !== 'string' || !result.sessionToken) {
            this.startProtocol = null;
            throw unavailable();
        }
        return result;
    }

    public async useReviveCard(record: { roundId: string; sessionToken: string; actions: any[]; elapsedMs: number }): Promise<{ round: ResumeRoundResult; profile: CloudProfile }> {
        return await this.request('/games/revive-card', 'POST', record, true);
    }

    public async getActiveRound(): Promise<ActiveRound> {
        const result = await this.request('/games/active', 'GET', null, true);
        return result.round || null;
    }

    public async saveRoundProgress(record: { roundId: string; sessionToken: string; actions: any[]; elapsedMs: number }): Promise<ActiveRound> {
        return await this.request('/games/checkpoint', 'POST', record, true);
    }

    public async resumeRound(record: { roundId: string; requestId: string; expectedGeneration: number; actions?: any[]; elapsedMs?: number }): Promise<ResumeRoundResult> {
        return await this.request('/games/resume', 'POST', { ...record, maxRulesVersion: BOARD_RULES_VERSION }, true);
    }

    /** 每日分享/激励视频补体力；claimId 用于网络超时后的幂等重试。 */
    public async claimSharedStamina(claimId: string): Promise<StaminaShareResult> {
        const result = await this.request('/stamina/share-claim', 'POST', { claimId, intentId: this.rewardIntentId('stamina') }, true) as StaminaShareResult;
        this.clearRewardIntent('stamina'); return result;
    }

    /** 对局结算；roundId 幂等，重复提交返回首次结果。actions 为操作序列，服务端用于种子重放校验。 */
    public async submitSettlement(
        roundId: string,
        startedAt: number,
        endedAt: number,
        score: number,
        collectedMoodBeanCount: number,
        actions?: any[],
        sessionToken?: string,
    ): Promise<RoundSettlementResult> {
        const data = await this.request('/games/settlements', 'POST', {
            roundId,
            startedAt,
            endedAt,
            score,
            collectedMoodBeanCount,
            actions: actions || [],
            sessionToken,
        }, true);
        return data as RoundSettlementResult;
    }

    public async getLeaderboard(type: LeaderboardType): Promise<LeaderboardResult> {
        return await this.request(`/leaderboards?type=${type}`, 'GET', null, true) as LeaderboardResult;
    }

    public async exchangeTool(actionId: string, item: 'hammer' | 'magicWand' | 'stamina' | 'reviveCard'): Promise<{ profile: CloudProfile }> {
        return await this.request('/shop/exchanges', 'POST', { actionId, item }, true);
    }

    public async useTool(roundId: string, item: 'hammer' | 'magicWand', actionIndex: number, target: number, sessionToken?: string, proof?: { actions: any[]; elapsedMs: number }): Promise<{ profile: CloudProfile; roundTools?: RoundToolState }> {
        const actionId = `${roundId}:use:${actionIndex}`;
        return await this.request('/games/tools/use', 'POST', { roundId, item, actionIndex, target, actionId, sessionToken, ...proof }, true);
    }

    public async claimToolReward(roundId: string, item: 'hammer' | 'magicWand', actionId: string, sessionToken?: string): Promise<{ profile: CloudProfile; roundTools?: RoundToolState }> {
        const placement = item === 'hammer' ? 'hammer' : 'tool';
        const result = await this.request('/games/tools/reward', 'POST', { roundId, item, actionId, sessionToken, intentId: this.rewardIntentId(placement) }, true);
        this.clearRewardIntent(placement); return result;
    }

    private rewardKey(placement: string): string { return `zyx_reward_intent_${placement}`; }
    private rewardIntentId(placement: string): string {
        try { return cc.sys.localStorage.getItem(this.rewardKey(placement)) || ''; } catch (_) { return ''; }
    }
    private clearRewardIntent(placement: string): void {
        try { cc.sys.localStorage.removeItem(this.rewardKey(placement)); } catch (_) { /* 服务端重复确认仍然幂等。 */ }
    }
    public async prepareRewardIntent(placement: string, record?: { roundId: string; sessionToken: string; actions: any[]; elapsedMs: number }, remember = true): Promise<RewardIntent> {
        const intent = await this.request('/games/reward-intents', 'POST', { placement, ...record }, true);
        if (remember) this.rememberRewardIntent(placement, intent.intentId);
        return intent;
    }
    public rememberRewardIntent(placement: string, intentId: string): void {
        cc.sys.localStorage.setItem(this.rewardKey(placement), intentId);
    }
    public async completeRewardIntent(intent: RewardIntent, sessionToken?: string): Promise<void> {
        if (intent.completed) return;
        const wait = Math.max(0, Math.min(20000, intent.minClaimAt - Date.now()));
        if (wait) await new Promise(resolve => setTimeout(resolve, wait));
        await this.request('/games/reward-intents/complete', 'POST', { intentId: intent.intentId, sessionToken }, true);
    }

    /**
     * 通用已认证 POST：只供 assets/script/gm/ 调试模块访问调试路由。
     * 普通业务必须走上面的专用方法；微信构建不包含任何调用方（gm 目录构建前剥离）。
     */
    public async postAuthenticated(path: string, body: any): Promise<any> {
        return await this.request(path, 'POST', body, true);
    }

    /** 每次建档都获取新 code；code 过期或已使用时由服务端明确报错，禁止退回设备账号冒充登录成功。 */
    private requestWeChatLoginCode(): Promise<string> {
        const wxApi = getWxApi();
        if (!wxApi || typeof wxApi.login !== 'function') return Promise.resolve('');
        return new Promise((resolve, reject) => {
            wxApi.login({
                success: (result: any) => {
                    if (result && result.code) resolve(String(result.code));
                    else reject(new Error(result && result.errMsg ? result.errMsg : '微信登录未返回有效凭证'));
                },
                fail: (error: any) => reject(new Error(error && error.errMsg ? error.errMsg : '微信登录失败')),
            });
        });
    }

    private ensureDeviceId(): void {
        this.token = cc.sys.localStorage.getItem('zyx_cloud_token') || '';
        this.deviceId = cc.sys.localStorage.getItem('zyx_cloud_device_id') || '';
        if (this.deviceId) return;
        this.deviceId = `device_${Date.now()}_${Math.floor(Math.random() * 1000000000)}`;
        cc.sys.localStorage.setItem('zyx_cloud_device_id', this.deviceId);
    }

    private async request(path: string, method: string, body: any, authenticated: boolean, _allowAuthRetry: boolean = true): Promise<any> {
        this.ensureDeviceId();
        const headers: { [key: string]: string } = { 'Content-Type': 'application/json' };
        if ((authenticated || path === '/players/bootstrap') && this.token) headers.Authorization = `Bearer ${this.token}`;
        const sentToken = this.token;
        const checkAccount = (): void => {
            if (authenticated && (cc.sys.localStorage.getItem('zyx_cloud_token') || '') !== sentToken) {
                throw cloudError('账号已切换，请重新进入当前操作', 'ACCOUNT_CHANGED');
            }
        };
        const url = `${getApiBase()}${path}`;
        const wxApi = getWxApi();
        let result: any;
        try {
            if (wxApi && typeof wxApi.request === 'function') {
                result = await this.requestWithWeChat(wxApi, url, method, headers, body);
            } else result = await this.requestWithFetch(url, method, headers, body);
        } catch (error) {
            checkAccount();
            // 401 凭证失效：重新 bootstrap/刷新 token，用相同请求（含相同 roundId/actionId）重试一次。
            // bootstrap 本身不走 authenticated，不会触发重试，避免递归。
            if (authenticated && _allowAuthRetry && Number((error as any).status) === 401) {
                await this.bootstrap('', '');
                if (sentToken) checkAccount();
                return await this.request(path, method, body, authenticated, false);
            }
            throw error;
        }
        checkAccount();
        return result;
    }

    private async requestWithFetch(url: string, method: string, headers: { [key: string]: string }, body: any): Promise<any> {
        if (typeof fetch !== 'function') throw new Error('当前平台不支持网络请求');
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), 10000) : null;
        let response: Response;
        let payload: any;
        try {
            response = await fetch(url, { method, headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: controller ? controller.signal : undefined });
            payload = await response.json().catch(() => null);
        } finally { if (timer !== null) clearTimeout(timer); }
        return readCloudResponse(response.status, payload);
    }

    private requestWithWeChat(wxApi: any, url: string, method: string, headers: { [key: string]: string }, body: any): Promise<any> {
        return new Promise((resolve, reject) => {
            // 统一走 PlatformAdapter 取到的句柄，兼容只注入 window.wx 的预览容器。
            wxApi.request({
                url,
                method,
                header: headers,
                data: body || undefined,
                timeout: 10000,
                success: (response: any) => {
                    try { resolve(readCloudResponse(Number(response && response.statusCode) || 0, response && response.data)); }
                    catch (error) { reject(error); }
                },
                fail: (error: any) => reject(new Error(error && error.errMsg ? error.errMsg : '网络连接失败')),
            });
        });
    }
}

export const cloudService = CloudService.instance;
