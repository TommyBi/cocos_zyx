import { getWxApi } from './PlatformAdapter';
import { BOARD_RULES_VERSION } from '../dataModule/BoardEngine';
import { MOOD_COLLECTION_RULE } from '../dataModule/MoodBeanConfig';

const PRODUCTION_API_BASE = 'https://api.tcjstory.cn/v1/cocos-zyx';
const STAGING_API_BASE = 'https://staging-api.tcjstory.cn/v1/cocos-zyx';

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
    avatarUrl: string;
    level: number;
    experience: number;
    moodBeanBalance: number;
    assetRevision?: number;
    inventory?: { hammer: number; magicWand: number };
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

export type StartRoundResult = {
    roundId: string;
    stamina: StaminaState;
    duplicate?: boolean;
    seed: number;
    isTutorial: boolean;
    collectionRule?: string;
    rulesVersion?: number;
    profile?: CloudProfile;
};

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

    /**
     * 微信端用一次性 loginCode 换取服务端权威 openid，本地 deviceId 只用于旧账号迁移与 Web 预览。
     * R1：经济数据一律由服务端结算与事务接口产生，不接受任何客户端本地资产作为建档基线。
     */
    public async bootstrap(nickname: string, avatarUrl: string): Promise<CloudProfile> {
        this.ensureDeviceId();
        const loginCode = await this.requestWeChatLoginCode();
        const data = await this.request('/players/bootstrap', 'POST', {
            deviceId: this.deviceId,
            loginCode,
            nickname,
            avatarUrl,
        }, false);
        this.token = data.token;
        cc.sys.localStorage.setItem('zyx_cloud_token', this.token);
        return data.profile as CloudProfile;
    }

    /** 仅在玩家主动完成微信授权后调用，普通登录不会覆盖服务端资料。 */
    public async updateWeChatProfile(nickname: string, avatarUrl: string): Promise<CloudProfile> {
        const data = await this.request('/players/profile', 'POST', { nickname, avatarUrl }, true);
        return data.profile as CloudProfile;
    }

    /** roundId 由客户端在请求前生成；超时后复用同一 ID 重试，不重复消耗体力。 */
    public async startRound(roundId: string): Promise<StartRoundResult> {
        const health = await this.request('/health', 'GET', null, false);
        if (!health.capabilities || health.capabilities.indexOf('bean-collection-progress') < 0
            || health.capabilities.indexOf('adaptive-combo-v2') < 0
            || health.capabilities.indexOf('bean-collection-1pct') < 0
            || health.capabilities.indexOf('bean-tool-shop') < 0
            || health.capabilities.indexOf('difficulty-ramp-2x') < 0
            || health.capabilities.indexOf('difficulty-pressure-v4') < 0
            || health.capabilities.indexOf('rising-rows-v5') < 0
            || health.capabilities.indexOf('balloon-rescue-v6') < 0
            || health.capabilities.indexOf('balloon-blast-v7') < 0
            || health.capabilities.indexOf('random-rescue-v8') < 0) {
            const error = new Error('游戏服务更新中，请稍后再试') as any;
            error.businessCode = 'COLLECTION_RULE_UNSUPPORTED';
            throw error;
        }
        const result = await this.request('/games/start', 'POST', { roundId, collectionRule: MOOD_COLLECTION_RULE, rulesVersion: BOARD_RULES_VERSION }, true) as StartRoundResult;
        if (result.collectionRule !== MOOD_COLLECTION_RULE || result.rulesVersion !== BOARD_RULES_VERSION) {
            const error = new Error('游戏服务更新中，请稍后再试') as any;
            error.businessCode = 'COLLECTION_RULE_UNSUPPORTED';
            throw error;
        }
        return result;
    }

    /** 每日分享/激励视频补体力；claimId 用于网络超时后的幂等重试。 */
    public async claimSharedStamina(claimId: string): Promise<StaminaShareResult> {
        return await this.request('/stamina/share-claim', 'POST', { claimId }, true) as StaminaShareResult;
    }

    /** 对局结算；roundId 幂等，重复提交返回首次结果。actions 为操作序列，服务端用于种子重放校验。 */
    public async submitSettlement(
        roundId: string,
        startedAt: number,
        endedAt: number,
        score: number,
        collectedMoodBeanCount: number,
        actions?: any[],
    ): Promise<RoundSettlementResult> {
        const data = await this.request('/games/settlements', 'POST', {
            roundId,
            startedAt,
            endedAt,
            score,
            collectedMoodBeanCount,
            actions: actions || [],
        }, true);
        return data as RoundSettlementResult;
    }

    public async getLeaderboard(type: LeaderboardType): Promise<LeaderboardResult> {
        return await this.request(`/leaderboards?type=${type}`, 'GET', null, true) as LeaderboardResult;
    }

    public async exchangeTool(actionId: string, item: 'hammer' | 'magicWand' | 'stamina'): Promise<{ profile: CloudProfile }> {
        return await this.request('/shop/exchanges', 'POST', { actionId, item }, true);
    }

    public async useTool(roundId: string, item: 'hammer' | 'magicWand', actionIndex: number, target: number): Promise<{ profile: CloudProfile }> {
        const actionId = `${roundId}:use:${actionIndex}`;
        return await this.request('/games/tools/use', 'POST', { roundId, item, actionIndex, target, actionId }, true);
    }

    public async claimToolReward(roundId: string, item: 'hammer' | 'magicWand', actionId: string): Promise<{ profile: CloudProfile }> {
        return await this.request('/games/tools/reward', 'POST', { roundId, item, actionId }, true);
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
        if (authenticated && this.token) headers.Authorization = `Bearer ${this.token}`;
        const sentToken = this.token;
        const checkAccount = (): void => {
            if (authenticated && (cc.sys.localStorage.getItem('zyx_cloud_token') || '') !== sentToken) {
                const error = new Error('账号已切换，请重新进入当前操作') as any;
                error.businessCode = 'ACCOUNT_CHANGED';
                throw error;
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
            payload = await response.json();
        } finally { if (timer !== null) clearTimeout(timer); }
        if (!response.ok || payload.code !== 0) {
            // 携带 HTTP 状态码与服务端稳定业务错误码，供队列工作器分类。
            const error = new Error(payload.message || '云端服务暂不可用') as any;
            error.status = response.status;
            if (payload && typeof payload.errorCode === 'string' && payload.errorCode.length > 0) {
                error.businessCode = payload.errorCode;
            }
            if (payload && payload.data && payload.data.stamina) error.stamina = payload.data.stamina;
            throw error;
        }
        return payload.data;
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
                    const payload = response && response.data;
                    const statusCode = Number(response && response.statusCode) || 0;
                    if (statusCode < 200 || statusCode >= 300 || !payload || payload.code !== 0) {
                        const error = new Error(payload && payload.message ? payload.message : '云端服务暂不可用') as any;
                        error.status = statusCode;
                        if (payload && typeof payload.errorCode === 'string' && payload.errorCode.length > 0) {
                            error.businessCode = payload.errorCode;
                        }
                        if (payload && payload.data && payload.data.stamina) error.stamina = payload.data.stamina;
                        reject(error);
                        return;
                    }
                    resolve(payload.data);
                },
                fail: (error: any) => reject(new Error(error && error.errMsg ? error.errMsg : '网络连接失败')),
            });
        });
    }
}

export const cloudService = CloudService.instance;
