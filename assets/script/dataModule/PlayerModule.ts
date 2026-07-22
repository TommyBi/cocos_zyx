import { typeRankResult } from '../define/TypeDefine';
import { httpManager } from '../util/HttpManager';
import { wxApiManager } from '../util/WxApiManager';
import DataModule from './DataModule';
import { zyxGameModule } from './ZyxGameModule';

export default class PlayerModule extends DataModule {
    // 资源信息
    diamond: number = 0;
    flower: number = 0;
    hammer: number = 0;
    bomb: number = 0;
    drill: number = 0;

    // 玩家信息
    nickName: string = '';
    avatar: string = '';
    lv: number = 0;
    exp: number = 0;
    expTar: number = 0;
    token: string = '';
    openId: string = '';

    parseData(data: any): void {
        super.parseData(data);

        this.diamond = data.diamond || 0;
        this.flower = data.flower || 0;
        this.hammer = data.hammer || 0;
        this.bomb = data.bomb || 0;
        this.drill = data.drill || 0;
        this.nickName = data.nickName || data.nickname || '消除玩家';
        this.avatar = data.avatar || '';
        this.lv = data.lv || 1;
        this.exp = data.exp || 0;
        this.expTar = data.expTar || 100;
        this.token = data.token || this.token || cc.sys.localStorage.getItem('zyx_token') || '';
        this.openId = data.openId || data.openid || '';
        if (this.token) cc.sys.localStorage.setItem('zyx_token', this.token);
    }

    async login() {
        const localToken = cc.sys.localStorage.getItem('zyx_token') || '';
        const code = await wxApiManager.login();

        try {
            const res = await httpManager.post('/login', {
                code,
                token: localToken,
                nickName: this.nickName,
                avatar: this.avatar,
            });
            const loginData = res.data || res;
            this.parseData(loginData);
            zyxGameModule.parseData(loginData);
            return;
        } catch (e) {
            console.warn('login fallback to local data', e);
        }

        const scoreRecord = Number(cc.sys.localStorage.getItem('zyx_score_record') || 0);
        const loginData = {
            diamond: 10,
            flower: 3,
            bomb: 0,
            hammer: 3,
            drill: 0,
            nickName: '消除玩家',
            avatar: '',
            lv: 1,
            exp: 10,
            expTar: 100,
            scoreRecord,
            gameInfo: zyxGameModule.createDefaultGameInfo(),
        };

        this.parseData(loginData);
        zyxGameModule.parseData(loginData);
    }

    async submitScore(score: number): Promise<void> {
        if (score > zyxGameModule.scoreRecord) {
            zyxGameModule.scoreRecord = score;
            cc.sys.localStorage.setItem('zyx_score_record', `${score}`);
        }

        if (!this.token) return;

        try {
            const res = await httpManager.post('/score', {
                token: this.token,
                score,
                nickName: this.nickName,
                avatar: this.avatar,
            });
            const data = res.data || res;
            zyxGameModule.scoreRecord = data.highScore || data.scoreRecord || zyxGameModule.scoreRecord;
        } catch (e) {
            console.warn('submit score failed', e);
        }
    }

    async getLeaderboard(limit: number = 500): Promise<typeRankResult> {
        try {
            const res = await httpManager.get('/leaderboard', {
                token: this.token,
                limit,
            });
            const data = res.data || res;
            return {
                list: (data.list || []).slice(0, 500),
                selfRank: data.selfRank || 0,
                selfScore: data.selfScore || zyxGameModule.scoreRecord || 0,
            };
        } catch (e) {
            console.warn('leaderboard fallback to mock data', e);
        }

        const list = [];
        const selfScore = zyxGameModule.scoreRecord || Number(cc.sys.localStorage.getItem('zyx_score_record') || 0);
        for (let i = 0; i < 20; i++) {
            list.push({
                rank: i + 1,
                nickName: i === 0 ? '今日样例玩家' : `样例玩家${i + 1}`,
                score: Math.max(0, selfScore + 320 - i * 16),
            });
        }
        return {
            list,
            selfRank: selfScore > 0 ? 1 : 0,
            selfScore,
        };
    }
}
export const playerModule = new PlayerModule();
