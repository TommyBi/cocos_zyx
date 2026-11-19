/** 服务端奖励意图、观察时间及动作凭据；不是广告平台服务端验签。 */
const crypto = require('node:crypto');
const { getRoundToolLimit, TOOL_SHARE_RULES_VERSION } = require('./boardEngine');
const error = (message, code, status = 409) => Object.assign(new Error(message), { businessCode: code, status });
const hash = value => crypto.createHash('sha256').update(String(value || '')).digest('hex');
function createRewardSecurity({ app, get, all, run, withTransaction, ensurePersisted, authenticate, ok, fail, now, progress, roundToolState }) {
  const secure = round => round && round.security_version === 1;
  function checkActions(round, actions) {
    if (!secure(round)) return;
    actions.forEach((action, index) => {
      if (!['revive', 'balloon', 'rescueClear'].includes(action.type)) return;
      const receipt = get(`SELECT intent_id FROM reward_intents WHERE player_id=? AND round_id=? AND action_index=?
        AND effect_type=? AND completed_at IS NOT NULL`, [round.player_id, round.round_id, index, action.type]);
      if (!receipt) throw error('这次奖励尚未获得服务端确认', 'REWARD_PROOF_REQUIRED', 400);
    });
  }
  function consume(req, user, placement, round, claimKey) {
    if (!(secure(round) || (placement === 'stamina' && (user.security_version === 1 || process.env.REQUIRE_SECURITY_PROTOCOL === '1')))) return;
    const id = req.body.intentId;
    const intent = typeof id === 'string' && get('SELECT * FROM reward_intents WHERE intent_id=? AND player_id=?', [id, user.player_id]);
    if (!intent || intent.placement !== placement || intent.round_id !== (round ? round.round_id : '') || !intent.completed_at)
      throw error('奖励凭据无效或尚未确认', 'REWARD_PROOF_INVALID', 400);
    if (placement === 'stamina' && intent.action_index !== Math.floor((now() + 8 * 3600000) / 86400000))
      throw error('请重新领取今天的奖励', 'REWARD_PROOF_INVALID', 400);
    if (intent.consumed_at && intent.claim_key !== claimKey) throw error('这份奖励已领取', 'REWARD_PROOF_INVALID', 400);
    if (!intent.consumed_at) run('UPDATE reward_intents SET consumed_at=?,claim_key=? WHERE intent_id=? AND consumed_at IS NULL', [now(), claimKey, id]);
  }
  function delay(placement, round) {
    const video = (['tool', 'revive', 'rescue'].includes(placement)
      || (placement === 'hammer' && round && round.rules_version >= 14 && round.rules_version < TOOL_SHARE_RULES_VERSION));
    const floor = video ? 5000 : 3000;
    const configured = Number(process.env[video ? 'REWARD_MIN_VIDEO_MS' : 'REWARD_MIN_SHARE_MS']);
    return Number.isFinite(configured) && configured >= 0 ? (process.env.NODE_ENV === 'production' ? Math.max(floor, configured) : configured) : floor;
  }
  const sendError = (res, err) => fail(res, err.message || '奖励未确认，请重试', err.status || 500, err.businessCode);
  app.post('/v1/cocos-zyx/games/reward-intents', async (req, res) => {
    try {
      const user = authenticate(req, res); if (!user) return;
      const requestedAt = now();
      const placement = req.body.placement;
      if (!['tool', 'hammer', 'revive', 'rescue', 'stamina'].includes(placement)) throw error('奖励类型无效', 'REWARD_CONTEXT_INVALID', 400);
      let round = null, result = null, index, effectType = placement;
      if (placement === 'stamina') {
        index = Math.floor((now() + 8 * 3600000) / 86400000);
        if (get('SELECT 1 FROM stamina_share_claims WHERE player_id=? AND day_key=?', [user.player_id, new Date(now() + 8 * 3600000).toISOString().slice(0, 10)]))
          throw error('今天的补充已经领取', 'STAMINA_SHARE_DAILY_LIMIT', 429);
      } else {
        round = get('SELECT * FROM game_rounds WHERE player_id=? AND round_id=?', [user.player_id, req.body.roundId]); progress.assertLive(round);
        const saved = progress.checkpoint(user.player_id, round.round_id); progress.assertSession(saved, req.body.sessionToken);
        const validationStarted = performance.now();
        result = await progress.validate(round, saved, req.body.actions, req.body.elapsedMs, false, true);
        res.locals.timing = { validationMs: Math.round(performance.now() - validationStarted) };
        if (result.stale) throw error('请先确认当前进度', 'PROGRESS_CONFLICT');
        const board = result.replay.board; index = result.actions.length;
        if (placement === 'revive') {
          if (!board.isGameOver() || result.actions.some(action => action.type === 'revive')) throw error('现在不能广告复活', 'REWARD_CONTEXT_INVALID', 400);
        } else if (placement === 'rescue') {
          if (!['balloon', 'clear'].includes(board.rescueKind)) throw error('救场机会已失效', 'REWARD_CONTEXT_INVALID', 400);
          effectType = board.rescueKind === 'balloon' ? 'balloon' : 'rescueClear';
        } else {
          const item = placement === 'tool' ? 'magicWand' : 'hammer', tool = roundToolState(user.player_id, round.round_id)[item];
          if (tool.owned) throw error('请先使用已领取的道具', 'TOOL_ALREADY_OWNED');
          if (tool.acquired >= getRoundToolLimit(item, round.rules_version)) throw error('本局领取机会已用完', 'TOOL_REWARD_LIMIT');
          if (board.isGameOver() || !board.canCheckpoint()) throw error('请在正常对局中领取', 'REWARD_CONTEXT_INVALID', 400);
        }
      }
      const roundId = round ? round.round_id : '';
      const sessionHash = hash(req.body.sessionToken);
      let intentId;
      withTransaction(() => {
        if (result) progress.write(round, result);
        let intent = get('SELECT * FROM reward_intents WHERE player_id=? AND round_id=? AND placement=? AND action_index=?', [user.player_id, roundId, placement, index]);
        if (intent && !intent.completed_at && (intent.expires_at < now() || intent.session_hash !== sessionHash)) {
          run('UPDATE reward_intents SET issued_at=?,min_claim_at=?,expires_at=?,session_hash=? WHERE intent_id=? AND completed_at IS NULL', [requestedAt, requestedAt + delay(placement, round), now() + 900000, sessionHash, intent.intent_id]);
        } else if (!intent) {
          intent = { intent_id: crypto.randomBytes(24).toString('hex') };
          run(`INSERT INTO reward_intents(intent_id,player_id,round_id,placement,action_index,effect_type,session_hash,issued_at,min_claim_at,expires_at)
            VALUES(?,?,?,?,?,?,?,?,?,?)`, [intent.intent_id, user.player_id, roundId, placement, index, effectType, sessionHash, requestedAt, requestedAt + delay(placement, round), now() + 900000]);
        }
        intentId = intent.intent_id;
      });
      ensurePersisted(); const intent = get('SELECT * FROM reward_intents WHERE intent_id=?', [intentId]);
      ok(res, { intentId: intent.intent_id, completed: !!intent.completed_at, minClaimAt: intent.min_claim_at, expiresAt: intent.expires_at });
    } catch (err) { sendError(res, err); }
  });
  app.post('/v1/cocos-zyx/games/reward-intents/complete', (req, res) => {
    try {
      const user = authenticate(req, res); if (!user) return;
      const intent = typeof req.body.intentId === 'string' && get('SELECT * FROM reward_intents WHERE intent_id=? AND player_id=?', [req.body.intentId, user.player_id]);
      if (!intent) throw error('奖励凭据不存在', 'REWARD_PROOF_INVALID', 400);
      if (intent.round_id) {
        const round = get('SELECT * FROM game_rounds WHERE player_id=? AND round_id=?', [user.player_id, intent.round_id]); progress.assertLive(round);
        progress.assertSession(progress.checkpoint(user.player_id, intent.round_id), req.body.sessionToken);
      }
      if (intent.completed_at) { ensurePersisted(); return ok(res, { intentId: intent.intent_id, completed: true, duplicate: true }); }
      if (intent.session_hash !== hash(req.body.sessionToken) || intent.expires_at < now()) throw error('奖励机会已更新，请重新领取', 'REWARD_PROOF_INVALID', 400);
      if (now() < intent.min_claim_at) throw error('奖励尚未完成，请稍后重新确认', 'REWARD_TOO_EARLY');
      run('UPDATE reward_intents SET completed_at=? WHERE intent_id=? AND completed_at IS NULL', [now(), intent.intent_id]); ensurePersisted();
      ok(res, { intentId: intent.intent_id, completed: true });
    } catch (err) { sendError(res, err); }
  });
  return { checkActions, consume, secure };
}
module.exports = { createRewardSecurity };
