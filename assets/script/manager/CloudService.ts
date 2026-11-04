import { getWxApi } from './PlatformAdapter';

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
};

export type StartRoundResult = {
    roundId: string;
    stamina: StaminaState;
    duplicate?: boolean;
    seed: number;
    isTutorial: boolean;
};

export type LeaderboardEntry = {
    rank: number;
    playerId: string;
    nickname: string;
    avatarUrl: string;
    value: number;
    rewardTier: 'gold' | 'silver' | 'bronze' | 'normal';
};

/** 永久单局最高分榜：前 200 名列表 + 自己独立的名次与最高分。 */
export type LeaderboardResult = {
    entries: LeaderboardEntry[];
    self: {
        /** 实际名次；尚未产生有效分数时为 null。 */
        rank: number | null;
        /** 自己单局最高分。 */
        bestScore: number;
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
        return await this.request('/games/start', 'POST', { roundId }, true) as StartRoundResult;
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

    public async getLeaderboard(type: 'power'): Promise<LeaderboardResult> {
        return await this.request(`/leaderboards?type=${type}`, 'GET', null, true) as LeaderboardResult;
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
        const url = `${getApiBase()}${path}`;
        const wxApi = getWxApi();
        try {
            if (wxApi && typeof wxApi.request === 'function') {
                return await this.requestWithWeChat(wxApi, url, method, headers, body);
            }
            return await this.requestWithFetch(url, method, headers, body);
        } catch (error) {
            // 401 凭证失效：重新 bootstrap/刷新 token，用相同请求（含相同 roundId/actionId）重试一次。
            // bootstrap 本身不走 authenticated，不会触发重试，避免递归。
            if (authenticated && _allowAuthRetry && Number((error as any).status) === 401) {
                await this.bootstrap('', '');
                return await this.request(path, method, body, authenticated, false);
            }
            throw error;
        }
    }

    private async requestWithFetch(url: string, method: string, headers: { [key: string]: string }, body: any): Promise<any> {
        if (typeof fetch !== 'function') throw new Error('当前平台不支持网络请求');
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        const payload = await response.json();
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
