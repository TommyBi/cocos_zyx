const API_BASE = 'https://api.tcjstory.cn/v1/cocos-zyx';
declare const wx: any;

export type CloudProfile = {
    playerId: string;
    nickname: string;
    avatarUrl: string;
    level: number;
    experience: number;
    happyBottleBalance: number;
    happyBottleProgress: number;
    happyBottleTarget: number;
    totalHappyBottles: number;
    highestSingleGameScore: number;
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

/** 云档案与周榜请求层：失败时保留本地离线玩法，不阻断单局游戏。 */
export default class CloudService {
    private static _instance: CloudService;
    public static get instance(): CloudService {
        if (!this._instance) this._instance = new CloudService();
        return this._instance;
    }

    private token: string = '';
    private deviceId: string = '';

    public async bootstrap(nickname: string, avatarUrl: string, localProfile?: any): Promise<CloudProfile> {
        this.ensureDeviceId();
        const data = await this.request('/players/bootstrap', 'POST', {
            deviceId: this.deviceId,
            nickname,
            avatarUrl,
            localProfile,
        }, false);
        this.token = data.token;
        cc.sys.localStorage.setItem('zyx_cloud_token', this.token);
        return data.profile as CloudProfile;
    }

    public async submitSettlement(roundId: string, startedAt: number, endedAt: number, score: number, moodCount: number): Promise<CloudProfile> {
        const data = await this.request('/games/settlements', 'POST', {
            roundId,
            startedAt,
            endedAt,
            score,
            moodCount,
        }, true);
        return data.settlement.profile as CloudProfile;
    }

    public async getLeaderboard(type: 'power' | 'happiness'): Promise<LeaderboardResult> {
        return await this.request(`/leaderboards?type=${type}`, 'GET', null, true) as LeaderboardResult;
    }

    /** GM：把本地调试后的开心瓶/等级绝对值同步到服务端。 */
    public async syncDebugProfile(profile: {
        happyBottleBalance: number;
        happyBottleProgress: number;
        totalHappyBottles?: number;
        level?: number;
        experience?: number;
        highestSingleGameScore?: number;
    }): Promise<CloudProfile> {
        const data = await this.request('/debug/profile', 'POST', profile, true);
        return data.profile as CloudProfile;
    }

    /** GM：重置云端账号进度。 */
    public async resetAccount(): Promise<CloudProfile> {
        const data = await this.request('/debug/reset', 'POST', {}, true);
        return data.profile as CloudProfile;
    }

    private ensureDeviceId(): void {
        this.token = cc.sys.localStorage.getItem('zyx_cloud_token') || '';
        this.deviceId = cc.sys.localStorage.getItem('zyx_cloud_device_id') || '';
        if (this.deviceId) return;
        this.deviceId = `device_${Date.now()}_${Math.floor(Math.random() * 1000000000)}`;
        cc.sys.localStorage.setItem('zyx_cloud_device_id', this.deviceId);
    }

    private async request(path: string, method: string, body: any, authenticated: boolean): Promise<any> {
        this.ensureDeviceId();
        const headers: { [key: string]: string } = { 'Content-Type': 'application/json' };
        if (authenticated && this.token) headers.Authorization = `Bearer ${this.token}`;
        const url = `${API_BASE}${path}`;
        if (typeof wx !== 'undefined' && wx && typeof wx.request === 'function') {
            return this.requestWithWeChat(url, method, headers, body);
        }
        return this.requestWithFetch(url, method, headers, body);
    }

    private async requestWithFetch(url: string, method: string, headers: { [key: string]: string }, body: any): Promise<any> {
        if (typeof fetch !== 'function') throw new Error('当前平台不支持网络请求');
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        const payload = await response.json();
        if (!response.ok || payload.code !== 0) throw new Error(payload.message || '云端服务暂不可用');
        return payload.data;
    }

    private requestWithWeChat(url: string, method: string, headers: { [key: string]: string }, body: any): Promise<any> {
        return new Promise((resolve, reject) => {
            wx.request({
                url,
                method,
                header: headers,
                data: body || undefined,
                timeout: 10000,
                success: (response: any) => {
                    const payload = response && response.data;
                    const statusCode = Number(response && response.statusCode) || 0;
                    if (statusCode < 200 || statusCode >= 300 || !payload || payload.code !== 0) {
                        reject(new Error(payload && payload.message ? payload.message : '云端服务暂不可用'));
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
