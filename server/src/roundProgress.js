/** 新协议对局的不可回退操作日志。进度不触碰玩家资产。 */
const crypto = require('crypto');
const economy = require('./economyConfig');
const { AUTO_RESCUE_RULES_VERSION, BOARD_RULES_VERSION, MAX_ACTION_APPENDS } = require('./boardEngine');
const { verifyReplay } = require('./replayService');
const fields = { rules: ['version'], move: ['id', 'offset'], hammer: ['id'], purify: ['color'],
  bomb: ['id'], lightning: ['id'], rise: ['rows'], revive: ['rowCount'], reviveCard: ['rowCount'], rescueOffer: ['elapsedMs', 'kind'],
  heartOffer: ['elapsedMs'], settle: [], finish: [], append: [], rescueDismiss: [], rescueClear: [],
  balloonOffer: [], balloonDismiss: [], balloon: [], heartDismiss: [], heart: [] };
function invalid(message, code = 'PROGRESS_INVALID', status = 400) {
  return Object.assign(new Error(message), { businessCode: code, status });
}
function hasRescueEndTimestamp(type, version) {
  return version >= AUTO_RESCUE_RULES_VERSION && ['rescueDismiss', 'rescueClear', 'balloon'].includes(type);
}
function hasRescueTimestamp(type, version) {
  return ['rescueOffer', 'heartOffer'].includes(type) || hasRescueEndTimestamp(type, version);
}
function canonicalActions(input) {
  if (!Array.isArray(input) || !input.length || input.length > 100000) throw invalid('保存记录不完整或过长');
  return input.map(action => {
    if (!action || !Object.prototype.hasOwnProperty.call(fields, action.type)) throw invalid('保存记录含未知操作');
    const result = { type: action.type };
    const actionFields = hasRescueEndTimestamp(action.type, input[0]?.version) ? ['elapsedMs'] : fields[action.type];
    for (const field of actionFields) {
      if (field === 'kind') {
        if (!['balloon', 'clear'].includes(action[field])) throw invalid('救场类型异常');
      } else if (!Number.isSafeInteger(action[field])) throw invalid('操作参数异常');
      result[field] = action[field];
    }
    return result;
  });
}
function samePrefix(a, b) {
  return a.slice(0, Math.min(a.length, b.length)).every((value, i) => JSON.stringify(value) === JSON.stringify(b[i]));
}
function createRoundProgress({ app, get, run, withTransaction, ensurePersisted, authenticate, ok, fail, now, heartRescueEligible, safeProfile, roundToolState, validateRewards = () => {} }) {
  const checkpoint = (player, round) => get('SELECT * FROM round_checkpoints WHERE player_id = ? AND round_id = ?', [player, round]);
  const roundFor = (player, round) => {
    if (typeof round !== 'string' || !round.length || round.length > 96) throw invalid('对局标识异常');
    return get('SELECT * FROM game_rounds WHERE player_id = ? AND round_id = ?', [player, round]);
  };
  function assertLive(round) {
    if (!round || round.status !== 'active') throw invalid('这局状态已更新，请返回首页', 'ROUND_NOT_ACTIVE', 409);
    if (round.started_at < now() - economy.MAX_OFFLINE_SETTLEMENT_AGE_MS) throw invalid('这局已超过7天保存期限', 'SETTLEMENT_TOO_OLD');
  }
  function active(player) {
    return get(`SELECT r.* FROM game_rounds r JOIN round_checkpoints c
      ON r.player_id = c.player_id AND r.round_id = c.round_id
      WHERE r.player_id = ? AND r.status = 'active' AND r.started_at >= ? ORDER BY r.started_at DESC, r.rowid DESC LIMIT 1`,
    [player, now() - economy.MAX_OFFLINE_SETTLEMENT_AGE_MS]);
  }
  function summary(round, saved, full = false) {
    const actions = full || saved.action_count === undefined ? JSON.parse(saved.actions_json) : null;
    return { mode: 'main', roundId: round.round_id, seed: round.seed, isTutorial: !!round.is_tutorial,
      rulesVersion: round.rules_version, collectionRule: round.collection_rule,
      heartRescueEligible: heartRescueEligible(round.player_id, round.round_id), startedAt: round.started_at,
      actionCount: actions ? actions.length : saved.action_count, operationCount: saved.operation_count,
      score: saved.score, collectedMoodBeanCount: saved.collected_blocks, elapsedMs: saved.elapsed_ms,
      updatedAt: saved.updated_at, generation: saved.resume_generation,
      ...(round.rules_version >= 12 ? { roundTools: roundToolState(round.player_id, round.round_id) } : {}),
      ...(full ? { actions, sessionToken: saved.session_token } : {}) };
  }
  function activeSummary(player) {
    const round = active(player);
    if (!round) return null;
    const saved = get(`SELECT json_array_length(actions_json) AS action_count, operation_count, score,
      collected_blocks, elapsed_ms, updated_at, resume_generation FROM round_checkpoints
      WHERE player_id = ? AND round_id = ?`, [player, round.round_id]);
    return summary(round, saved);
  }
  function assertSession(saved, token) {
    if (!saved || typeof token !== 'string' || token !== saved.session_token)
      throw invalid('这局已在别处继续，请返回首页重新确认', 'ROUND_SESSION_CONFLICT', 409);
  }
  function assertElapsed(round, elapsedMs) {
    if (!Number.isSafeInteger(elapsedMs) || elapsedMs < 0 || elapsedMs > economy.MAX_ROUND_DURATION_MS
      || elapsedMs > now() - round.started_at) throw invalid('保存时长异常');
  }
  function assertElapsedNotRewound(saved, elapsedMs) {
    if (elapsedMs < saved.elapsed_ms) throw invalid('保存时长不能倒退', 'PROGRESS_CONFLICT', 409);
  }
  function validate(round, saved, input, elapsedMs, requireReady = true, includeBoard = false) {
    return validateCanonical(round, saved, canonicalActions(input), elapsedMs, requireReady, includeBoard);
  }
  async function validateCanonical(round, saved, actions, elapsedMs, requireReady = true, includeBoard = false) {
    const previous = JSON.parse(saved.actions_json);
    if (!samePrefix(previous, actions)) throw invalid('保存记录与已确认进度不一致', 'PROGRESS_CONFLICT', 409);
    assertElapsed(round, elapsedMs);
    if (actions.length < previous.length) return { stale: true, actions: previous };
    assertElapsedNotRewound(saved, elapsedMs);
    if (actions.filter(a => a.type === 'revive').length > 1
      || actions.filter(a => a.type === 'reviveCard').length > (round.rules_version >= 11 ? 1 : 0)
      || actions.some(a => ['revive', 'reviveCard'].includes(a.type) && a.rowCount !== 8)
      || actions.some(a => hasRescueTimestamp(a.type, round.rules_version) && (a.elapsedMs < 0 || a.elapsedMs > elapsedMs))) throw invalid('救场记录异常');
    for (let index = 0; index < actions.length; index++) {
      const action = actions[index];
      if (!['hammer', 'purify', 'reviveCard'].includes(action.type)) continue;
      const use = get("SELECT item, target FROM tool_transactions WHERE player_id = ? AND round_id = ? AND kind = 'use' AND action_index = ?", [round.player_id, round.round_id, index]);
      if (!use || use.item !== (action.type === 'reviveCard' ? 'reviveCard' : action.type === 'hammer' ? 'hammer' : 'magicWand') || use.target !== (action.type === 'reviveCard' ? 8 : action.type === 'hammer' ? action.id : action.color)) throw invalid('道具使用未获服务端确认');
    }
    validateRewards(round, actions);
    const replay = await verifyReplay({ seed: round.seed, tutorial: !!round.is_tutorial, actions,
      version: round.rules_version, heartEligible: heartRescueEligible(round.player_id, round.round_id), checkpoint: true, includeBoard, strict: round.security_version === 1 });
    // 工作线程等待期间可能已续玩/保存/结算，提交前重新读取权威会话和前缀。
    assertLive(roundFor(round.player_id, round.round_id));
    const current = checkpoint(round.player_id, round.round_id);
    assertSession(current, saved.session_token);
    const confirmed = JSON.parse(current.actions_json);
    if (!samePrefix(confirmed, actions)) throw invalid('进度已在其他请求中更新', 'PROGRESS_CONFLICT', 409);
    if (actions.length < confirmed.length) return { stale: true, actions: confirmed };
    assertElapsedNotRewound(current, elapsedMs);
    if (!replay.valid || (requireReady && actions.length > 1 && !replay.ready)) throw invalid('请保存一次完整操作结束后的进度');
    if (replay.score > 1000000 || replay.collectedMoodBeans > economy.MAX_COLLECTED_MOOD_BLOCKS_PER_ROUND) throw invalid('保存进度超出支持范围');
    return { actions, replay, elapsedMs, sessionToken: saved.session_token };
  }
  function write(round, result) {
    if (result.stale) return;
    // 重放等待期间其他请求可能已续玩或写入更长前缀；事务内再次核对，不能把进度倒回去。
    const current = checkpoint(round.player_id, round.round_id);
    assertSession(current, result.sessionToken);
    const confirmed = JSON.parse(current.actions_json);
    if (!samePrefix(confirmed, result.actions) || result.actions.length < confirmed.length || result.elapsedMs < current.elapsed_ms) {
      throw invalid('进度已在其他请求中更新', 'PROGRESS_CONFLICT', 409);
    }
    run(`UPDATE round_checkpoints SET actions_json = ?, operation_count = ?, score = ?, collected_blocks = ?, elapsed_ms = ?, updated_at = ?
      WHERE player_id = ? AND round_id = ?`, [JSON.stringify(result.actions), result.replay.operationCount, result.replay.score,
      result.replay.collectedMoodBeans, result.elapsedMs, now(), round.player_id, round.round_id]);
  }
  function handleError(res, error) { return fail(res, error.message || '保存进度失败', error.status || 500, error.businessCode); }
  app.get('/v1/cocos-zyx/games/active', (req, res) => {
    try {
      const user = authenticate(req, res); if (!user) return;
      ensurePersisted();
      ok(res, { round: activeSummary(user.player_id) });
    } catch (error) { handleError(res, error); }
  });
  app.post('/v1/cocos-zyx/games/checkpoint', async (req, res) => {
    try {
      const user = authenticate(req, res); if (!user) return;
      const round = roundFor(user.player_id, req.body.roundId); assertLive(round);
      const saved = checkpoint(user.player_id, round.round_id); assertSession(saved, req.body.sessionToken);
      const replayStarted = performance.now();
      const actions = canonicalActions(req.body.actions);
      const { elapsedMs } = req.body;
      // 完全相同的日志已核验过，仅更新时间。走同一同步代码段，不给旧会话留下写入窗口。
      if (JSON.stringify(actions) === saved.actions_json) {
        assertElapsed(round, elapsedMs);
        assertElapsedNotRewound(saved, elapsedMs);
        if (elapsedMs > saved.elapsed_ms) {
          saved.elapsed_ms = elapsedMs;
          saved.updated_at = now();
          run('UPDATE round_checkpoints SET elapsed_ms = ?, updated_at = ? WHERE player_id = ? AND round_id = ?',
            [saved.elapsed_ms, saved.updated_at, user.player_id, round.round_id]);
        }
        ensurePersisted();
        return ok(res, summary(round, { ...saved, action_count: actions.length }));
      }
      const result = await validateCanonical(round, saved, actions, elapsedMs);
      res.locals.timing = { validationMs: Math.round(performance.now() - replayStarted) };
      withTransaction(() => write(round, result)); ensurePersisted();
      ok(res, summary(round, checkpoint(user.player_id, round.round_id)));
    } catch (error) { handleError(res, error); }
  });
  app.post('/v1/cocos-zyx/games/revive-card', async (req, res) => {
    try {
      const user = authenticate(req, res); if (!user) return;
      const round = roundFor(user.player_id, req.body.roundId); assertLive(round);
      const saved = checkpoint(user.player_id, round.round_id); assertSession(saved, req.body.sessionToken);
      if (round.rules_version < 11) throw invalid('这局使用原有的一次复活规则', 'REVIVE_CARD_UNAVAILABLE');
      const actions = canonicalActions(req.body.actions);
      const used = get("SELECT * FROM tool_transactions WHERE player_id = ? AND round_id = ? AND item = 'reviveCard' AND kind = 'use'", [user.player_id, round.round_id]);
      if (used) {
        const committed = JSON.parse(saved.actions_json);
        if (used.action_id !== `${round.round_id}:revive-card:${actions.length}` || !samePrefix(actions, committed)) throw invalid('复活请求内容已改变', 'PROGRESS_CONFLICT', 409);
        ensurePersisted();
        return ok(res, { duplicate: true, round: summary(round, saved, true), profile: safeProfile(user) });
      }
      const result = await validateCanonical(round, saved, actions, req.body.elapsedMs, false, true);
      if (result.stale) throw invalid('请先确认当前进度', 'PROGRESS_CONFLICT', 409);
      const board = result.replay.board;
      if (!board.isGameOver() || actions.filter(a => a.type === 'revive').length !== 1) throw invalid('只能在首次复活后的再次失败时使用', 'REVIVE_CARD_UNAVAILABLE');
      const concurrentUse = get("SELECT 1 FROM tool_transactions WHERE player_id=? AND round_id=? AND item='reviveCard' AND kind='use'", [user.player_id, round.round_id]);
      if (concurrentUse) {
        const latest = checkpoint(user.player_id, round.round_id);
        ensurePersisted(); return ok(res, { duplicate: true, round: summary(round, latest, true), profile: safeProfile(get('SELECT * FROM players WHERE player_id=?', [user.player_id])) });
      }
      if (get('SELECT revive_card_count FROM players WHERE player_id=?', [user.player_id]).revive_card_count < 1) throw invalid('复活卡不足', 'TOOL_INSUFFICIENT', 409);

      if (!board.removeTopRowsForRevive(8, true).length) throw invalid('本局复活卡机会已使用', 'REVIVE_CARD_UNAVAILABLE');
      const actionIndex = board.roundActions.findIndex(a => a.type === 'reviveCard');
      board.resolveBoard();
      if (!board.appendTurnRows()) throw invalid('复活棋盘无法恢复');
      board.resolveBoard();
      while (board.getOccupiedRowCount() < board.getRefillRowTarget() && board.actionAppends < MAX_ACTION_APPENDS) {
        if (!board.appendNextRow()) throw invalid('复活棋盘无法恢复');
        board.resolveBoard();
      }
      board.finishPlayerAction();
      const verified = await verifyReplay({ seed: round.seed, tutorial: !!round.is_tutorial, actions: board.roundActions,
        version: round.rules_version, heartEligible: heartRescueEligible(round.player_id, round.round_id), checkpoint: true, strict: round.security_version === 1 });
      assertLive(roundFor(user.player_id, round.round_id));
      assertSession(checkpoint(user.player_id, round.round_id), saved.session_token);
      if (get("SELECT 1 FROM tool_transactions WHERE player_id=? AND round_id=? AND item='reviveCard' AND kind='use'", [user.player_id, round.round_id])) {
        ensurePersisted(); return ok(res, { duplicate: true, round: summary(round, checkpoint(user.player_id, round.round_id), true), profile: safeProfile(get('SELECT * FROM players WHERE player_id=?', [user.player_id])) });
      }
      if (get('SELECT revive_card_count FROM players WHERE player_id=?', [user.player_id]).revive_card_count < 1) throw invalid('复活卡不足', 'TOOL_INSUFFICIENT', 409);
      if (!verified.valid || !verified.ready) throw invalid('复活记录无法确认');
      withTransaction(() => {
        run('UPDATE players SET revive_card_count = revive_card_count - 1, asset_revision = asset_revision + 1, updated_at = ? WHERE player_id = ?', [now(), user.player_id]);
        run('INSERT INTO tool_transactions (player_id, action_id, kind, item, round_id, action_index, target, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [user.player_id, `${round.round_id}:revive-card:${actions.length}`, 'use', 'reviveCard', round.round_id, actionIndex, 8, now()]);
        write(round, { actions: board.roundActions, replay: verified, elapsedMs: req.body.elapsedMs, sessionToken: saved.session_token });
      });
      ensurePersisted();
      ok(res, { round: summary(round, checkpoint(user.player_id, round.round_id), true),
        profile: safeProfile(get('SELECT * FROM players WHERE player_id = ?', [user.player_id])) });
    } catch (error) { handleError(res, error); }
  });
  app.post('/v1/cocos-zyx/games/resume', async (req, res) => {
    try {
      const user = authenticate(req, res); if (!user) return;
      const round = roundFor(user.player_id, req.body.roundId); assertLive(round);
      if (!Number.isInteger(round.rules_version) || round.rules_version < 10 || round.rules_version > BOARD_RULES_VERSION
        || (round.rules_version >= AUTO_RESCUE_RULES_VERSION && !(Number.isSafeInteger(req.body.maxRulesVersion)
          && req.body.maxRulesVersion >= round.rules_version))) throw invalid('请使用兼容版本继续这局', 'BOARD_RULES_UNSUPPORTED', 409);
      const saved = checkpoint(user.player_id, round.round_id);
      if (!saved) throw invalid('这局没有可恢复存档');
      const { requestId, expectedGeneration, elapsedMs } = req.body;
      if (typeof requestId !== 'string' || !/^[a-zA-Z0-9_-]{8,96}$/.test(requestId) || !Number.isSafeInteger(expectedGeneration)) throw invalid('续玩请求标识异常');
      const actions = req.body.actions ? canonicalActions(req.body.actions) : null;
      const payloadHash = crypto.createHash('sha256').update(JSON.stringify({ expectedGeneration, actions, elapsedMs })).digest('hex');
      if (saved.resume_request_id === requestId) {
        if (payloadHash !== saved.resume_payload_hash) throw invalid('同一续玩请求内容发生改变', 'PROGRESS_CONFLICT', 409);
        ensurePersisted(); return ok(res, summary(round, saved, true));
      }
      if (saved.resume_generation !== expectedGeneration) throw invalid('这局刚在别处更新，请重新查看', 'ROUND_SESSION_CONFLICT', 409);
      const replayStarted = performance.now();
      const result = actions ? await validateCanonical(round, saved, actions, elapsedMs) : null;
      const timing = res.locals.timing = { validationMs: Math.round(performance.now() - replayStarted) };
      const current = checkpoint(user.player_id, round.round_id);
      if (current.resume_request_id === requestId && current.resume_payload_hash === payloadHash) {
        ensurePersisted(); return ok(res, summary(round, current, true));
      }
      if (current.resume_generation !== expectedGeneration) throw invalid('这局刚在别处更新，请重新查看', 'ROUND_SESSION_CONFLICT', 409);
      withTransaction(() => {
        if (result) write(round, result);
        run(`UPDATE round_checkpoints SET session_token = ?, resume_generation = resume_generation + 1,
          resume_request_id = ?, resume_payload_hash = ? WHERE player_id = ? AND round_id = ?`,
        [crypto.randomBytes(24).toString('hex'), requestId, payloadHash, user.player_id, round.round_id]);
      });
      const persistStarted = performance.now();
      ensurePersisted();
      timing.persistMs = Math.round(performance.now() - persistStarted);
      ok(res, summary(round, checkpoint(user.player_id, round.round_id), true));
    } catch (error) { handleError(res, error); }
  });
  return { active, activeSummary, checkpoint, assertSession, assertLive, summary, validate, write,
    initialize(player, roundId, rulesVersion) {
      run('INSERT INTO round_checkpoints (player_id, round_id, actions_json, updated_at, session_token) VALUES (?, ?, ?, ?, ?)',
      [player, roundId, JSON.stringify([{ type: 'rules', version: rulesVersion }]), now(), crypto.randomBytes(24).toString('hex')]);
    },
    guard(player, roundId, token, res) {
      try { const saved = checkpoint(player, roundId); if (saved) assertSession(saved, token); return true; }
      catch (error) { handleError(res, error); return false; }
    },
    async checkSettlement(round, req, res) {
      try {
        const saved = checkpoint(round.player_id, round.round_id); if (!saved) return { replay: null };
        assertSession(saved, req.body.sessionToken);
        const result = await validate(round, saved, req.body.actions, Math.floor(req.body.endedAt - req.body.startedAt), round.security_version === 1);
        if (result.stale) throw invalid('结算不能短于已确认进度', 'PROGRESS_CONFLICT', 409);
        return { replay: result.replay };
      } catch (error) { handleError(res, error); return false; }
    } };
}
module.exports = { createRoundProgress, canonicalActions, hasRescueTimestamp, samePrefix };
