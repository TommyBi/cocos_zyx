import { getWxApi } from './PlatformAdapter';

const PRODUCTION_API_BASE = 'https://api.tcjstory.cn/v1/cocos-zyx';
/** 本地开发覆盖：在浏览器/调试环境写入 zyx_api_base_override 后指向本地服务端；线上永远为空。 */
const API_BASE_OVERRIDE_KEY = 'zyx_api_base_override';

function getApiBase(): string {
    try {
        const override = cc.sys.localStorage.getItem(API_BASE_OVERRIDE_KEY);
        if (override) return override;
    } catch (error) {
        // 读取失败时使用线上地址。
    }
    return PRODUCTION_API_BASE;
}

/** 本地开发 API 覆盖是否生效；GM 云同步只允许指向本地开发服务，生产地址一律不调用 /debug/*。 */
export function isLocalApiOverrideActive(): boolean {
    try {
        return !!cc.sys.localStorage.getItem(API_BASE_OVERRIDE_KEY);
    } catch (error) {
        return false;
    }
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
};

export type LeaderboardEntry = {
    rank: number;
    nickname: string;
    avatarUrl: string;
    value: number;
    rewardTier: 'gold' | 'silver' | 'bronze' | 'normal';
};

export type LeaderboardResult = {
    weekId: string;
    type: 'power' | 'happiness';
    entries: LeaderboardEntry[];
    self: { rank: number; isRanked: boolean; value: number; rewardTier: string; distanceToRank200: number };
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

export type RealmArtState = {
    artId: string;
    filledCells: number;
    completedAt: string;
    available: boolean;
};

export type RealmAlbumState = {
    albumId: string;
    openLevel: number;
    opened: boolean;
    totalCells: number;
    arts: RealmArtState[];
};

export type RealmState = {
    moodBeanBalance: number;
    totalCells: number;
    maxContributePerAction: number;
    configVersion: string;
    albums: RealmAlbumState[];
};

export type ContributeResult = {
    duplicate?: boolean;
    artId: string;
    requestedBeans: number;
    actualSpend: number;
    alreadyCompleted: boolean;
    filledCells: number;
    totalCells: number;
    completed: boolean;
    completedAt: string;
    moodBeanBalance: number;
};

/** 云档案、开心豆结算与官方拼画请求层：失败时保留本地离线玩法，不阻断单局游戏。 */
export default class CloudService {
    private static _instance: CloudService;
    public static get instance(): CloudService {
        if (!this._instance) this._instance = new CloudService();
        return this._instance;
    }

    private token: string = '';
    private deviceId: string = '';

    /**
     * 身份建档：只提交设备标识与昵称头像。
     * R1：经济数据一律由服务端结算与事务接口产生，不接受任何客户端本地资产作为建档基线。
     */
    public async bootstrap(nickname: string, avatarUrl: string): Promise<CloudProfile> {
        this.ensureDeviceId();
        const data = await this.request('/players/bootstrap', 'POST', {
            deviceId: this.deviceId,
            nickname,
            avatarUrl,
        }, false);
        this.token = data.token;
        cc.sys.localStorage.setItem('zyx_cloud_token', this.token);
        return data.profile as CloudProfile;
    }

    /** 对局结算；roundId 幂等，重复提交返回首次结果。 */
    public async submitSettlement(
        roundId: string,
        startedAt: number,
        endedAt: number,
        score: number,
        collectedMoodBeanCount: number,
    ): Promise<RoundSettlementResult> {
        const data = await this.request('/games/settlements', 'POST', {
            roundId,
            startedAt,
            endedAt,
            score,
            collectedMoodBeanCount,
        }, true);
        return data as RoundSettlementResult;
    }

    public async getLeaderboard(type: 'power' | 'happiness'): Promise<LeaderboardResult> {
        return await this.request(`/leaderboards?type=${type}`, 'GET', null, true) as LeaderboardResult;
    }

    /** 秘境权威状态：开心豆余额、画册开放与各画作进度。 */
    public async getRealmState(): Promise<RealmState> {
        return await this.request('/realm/state', 'GET', null, true) as RealmState;
    }

    /** 幂等投入开心豆到官方拼画；actionId 重试返回保存过的结果。 */
    public async contributeRealmArt(actionId: string, artId: string, requestedBeans: number): Promise<ContributeResult> {
        const data = await this.request('/realm/arts/contribute', 'POST', {
            actionId,
            artId,
            requestedBeans,
        }, true);
        return data as ContributeResult;
    }

    /**
     * 通用已认证 POST：只供 assets/script/gm/ 调试模块访问调试路由。
     * 普通业务必须走上面的专用方法；微信构建不包含任何调用方（gm 目录构建前剥离）。
     */
    public async postAuthenticated(path: string, body: any): Promise<any> {
        return await this.request(path, 'POST', body, true);
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
