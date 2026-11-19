import { ActiveRound, cloudService, getApiBase, ResumeRoundResult, StartRoundResult } from './CloudService';
import { BOARD_RULES_VERSION } from '../dataModule/BoardEngine';

type LocalRound = ResumeRoundResult & { playerId: string; environment: string; acknowledgedActions: number; acknowledgedOperations: number; invalidated?: boolean };

/** 本地每个完整操作落盘，云端每100步串行合并保存；会话与账号/环境绑定。 */
export class RoundProgress {
    private playerId = '';
    private environment = '';
    private record: LocalRound = null;
    private inFlight: Promise<void> = null;
    private forceRequested = false;
    private retryAt = 0;
    private stopped = false;
    private storageFailed = false;
    public onConflict: () => void = null;
    public onStorageFailure: () => void = null;

    private key(): string { return `zyx_round_progress_v1_${this.environment}_${this.playerId}`; }
    public bind(playerId: string): void {
        const environment = getApiBase();
        if (this.playerId === playerId && this.environment === environment) return;
        this.playerId = playerId;
        this.environment = environment;
        this.record = null;
        this.stopped = false;
        this.retryAt = 0;
        this.storageFailed = false;
        try {
            const value = JSON.parse(cc.sys.localStorage.getItem(this.key()) || 'null');
            if (value && value.playerId === playerId && value.environment === environment
                && typeof value.roundId === 'string' && typeof value.sessionToken === 'string'
                && Array.isArray(value.actions) && value.actions.length <= 100000
                && Number.isSafeInteger(value.elapsedMs) && value.elapsedMs >= 0) {
                this.record = value;
                this.stopped = !!value.invalidated;
            }
        } catch (_) { /* 损坏的本地存档不作为可信棋盘；仍可查询云端存档。 */ }
    }
    private persist(): void {
        try {
            cc.sys.localStorage.setItem(this.key(), JSON.stringify(this.record));
            this.storageFailed = false;
        } catch (_) {
            if (!this.storageFailed && this.onStorageFailure) this.onStorageFailure();
            this.storageFailed = true;
        }
    }
    public begin(started: StartRoundResult | ResumeRoundResult, playerId: string): void {
        this.bind(playerId);
        const restored = started as ResumeRoundResult;
        this.record = { ...started, invalidated: false, playerId, environment: this.environment, sessionToken: started.sessionToken,
            actions: restored.actions || [{ type: 'rules', version: started.rulesVersion }],
            actionCount: restored.actionCount || 1, operationCount: restored.operationCount || 0,
            score: restored.score || 0, collectedMoodBeanCount: restored.collectedMoodBeanCount || 0,
            elapsedMs: restored.elapsedMs || 0, updatedAt: restored.updatedAt || Date.now(),
            acknowledgedActions: restored.actionCount || 1, acknowledgedOperations: restored.operationCount || 0 };
        this.stopped = false;
        this.retryAt = 0;
        this.persist();
    }
    public get token(): string { return this.record && !this.stopped ? this.record.sessionToken : undefined; }
    public get roundId(): string { return this.record && this.record.roundId; }
    public getOfflineRound(): ResumeRoundResult {
        const record = this.record;
        if (!record || this.stopped || (record.mode && record.mode !== 'main')
            || !Number.isSafeInteger(record.rulesVersion) || record.rulesVersion < 10 || record.rulesVersion > BOARD_RULES_VERSION
            || !record.sessionToken
            || !Number.isFinite(record.startedAt) || Date.now() - record.startedAt > 7 * 86400000
            || record.startedAt > Date.now() || record.elapsedMs > 4 * 3600000) return null;
        return { ...record, actions: record.actions.map(action => ({ ...action })) };
    }
    public updateTools(tools: StartRoundResult['roundTools']): void {
        if (!this.record || this.stopped || !tools) return;
        this.record.roundTools = tools;
        this.persist();
    }
    public get canLeave(): boolean { return !!this.record && (!this.storageFailed || this.record.acknowledgedActions >= this.record.actions.length); }
    public invalidateSession(): void {
        if (this.stopped) return;
        this.stopped = true;
        if (this.record) { this.record.invalidated = true; this.persist(); }
        if (this.onConflict) this.onConflict();
    }
    public capture(actions: any[], operationCount: number, elapsedMs: number, force = false): void {
        const record = this.record;
        if (!record || this.stopped || !record.sessionToken || actions.length < record.actions.length) return;
        if (record.actions.length !== actions.length || force) {
            record.actions = actions.map(action => ({ ...action }));
            record.operationCount = operationCount;
            record.elapsedMs = Math.max(record.elapsedMs, Math.floor(elapsedMs));
            this.persist();
        }
        if (force || operationCount - record.acknowledgedOperations >= 100 || this.storageFailed) void this.sync(force);
    }
    public sync(force = false): Promise<void> {
        this.forceRequested = this.forceRequested || force;
        if (this.inFlight) return this.inFlight;
        if (!this.record || this.stopped || (!force && Date.now() < this.retryAt)) return Promise.resolve();
        this.inFlight = this.upload().finally(() => { this.inFlight = null; });
        return this.inFlight;
    }
    private async upload(): Promise<void> {
        do {
            this.forceRequested = false;
            const record = this.record;
            if (!record || this.stopped) return;
            const request = { roundId: record.roundId, sessionToken: record.sessionToken,
                actions: record.actions.slice(), elapsedMs: record.elapsedMs };
            try {
                const saved = await cloudService.saveRoundProgress(request);
                if (this.record !== record) return;
                record.acknowledgedActions = saved.actionCount;
                record.acknowledgedOperations = saved.operationCount;
                this.retryAt = 0;
                this.persist();
            } catch (error) {
                if (this.record !== record) return;
                this.retryAt = Date.now() + 30000;
                if (['ROUND_SESSION_CONFLICT', 'PROGRESS_CONFLICT', 'ROUND_NOT_ACTIVE', 'SETTLEMENT_TOO_OLD'].includes(error.businessCode)) {
                    this.invalidateSession();
                }
                return;
            }
        } while (this.forceRequested || (this.record && this.record.operationCount - this.record.acknowledgedOperations >= 100));
    }
    public clear(roundId: string): void {
        if (!this.record || this.record.roundId !== roundId) return;
        this.record = null;
        this.stopped = false;
        try {
            cc.sys.localStorage.removeItem(this.key());
            cc.sys.localStorage.removeItem(`${this.key()}_resume`);
        } catch (_) { /* 服务端状态与已保存结算队列仍决定这局是否已结束。 */ }
    }
    public message(): string {
        if (this.storageFailed) return '本机存储不足，请保持联网保存进度';
        if (!this.record) return '';
        if (this.record.acknowledgedActions >= this.record.actions.length) return '进度已同步，下次可以接着玩';
        return this.retryAt > Date.now() ? '进度已保存在本机，联网后自动同步' : '进度已保存在本机，正在同步';
    }
    public async resume(active: ActiveRound, cloudOnly = false): Promise<ResumeRoundResult> {
        const key = this.key();
        const attemptKey = `${key}_resume`;
        let request;
        try { request = JSON.parse(cc.sys.localStorage.getItem(attemptKey) || 'null'); } catch (_) { /* 创建新请求。 */ }
        if ((cloudOnly && request && request.actions) || !request || request.roundId !== active.roundId
            || active.generation < request.expectedGeneration || active.generation > request.expectedGeneration + 1) {
            request = { roundId: active.roundId, expectedGeneration: active.generation,
                requestId: `resume_${Date.now()}_${Math.random().toString(36).slice(2)}` };
            const local = this.record;
            if (!cloudOnly && local && local.roundId === active.roundId && local.generation === active.generation
                && local.actions.length >= active.actionCount
                && (local.actions.length > local.acknowledgedActions || local.actions.length > active.actionCount)) {
                request.actions = local.actions;
                request.elapsedMs = local.elapsedMs;
            }
            // 超时后的重试必须复用原请求ID、代次与内容。
            cc.sys.localStorage.setItem(attemptKey, JSON.stringify(request));
        }
        let result: ResumeRoundResult;
        try { result = await cloudService.resumeRound(request); }
        catch (error) {
            if (this.key() === key && !cloudOnly && request.actions && ['PROGRESS_INVALID', 'PROGRESS_CONFLICT'].includes(error.businessCode)) {
                return this.resume(active, true);
            }
            if (error.businessCode === 'ROUND_SESSION_CONFLICT') {
                try { cc.sys.localStorage.removeItem(attemptKey); } catch (_) { /* 下次仍会由服务端核验。 */ }
            }
            throw error;
        }
        if (this.key() !== key || getApiBase() !== this.environment) {
            throw Object.assign(new Error('账号已切换，请重新进入游戏'), { businessCode: 'ACCOUNT_CHANGED' });
        }
        this.begin(result, this.playerId);
        if (!this.storageFailed) {
            try { cc.sys.localStorage.removeItem(attemptKey); } catch (_) { /* 同一请求重试仍然幂等。 */ }
        }
        return result;
    }
}
export const roundProgress = new RoundProgress();
