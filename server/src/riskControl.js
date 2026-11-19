/** 只记录最小必要核验事实；风险不是封号结论，普通重试/库存不足不计作弊分。 */
const crypto = require('node:crypto');
const WEIGHTS = { REPLAY_MISMATCH: 30, REPLAY_INVALID: 20, TOOL_PROOF_REQUIRED: 20,
  REWARD_PROOF_REQUIRED: 20, REWARD_PROOF_INVALID: 20, REWARD_TOO_EARLY: 10,
  REWARD_CONTEXT_INVALID: 15, PROGRESS_INVALID: 15, PROGRESS_CONFLICT: 5,
  TOOL_PAYLOAD_CONFLICT: 10, ROUND_PAYLOAD_CONFLICT: 5, RATE_LIMITED: 3,
  COLLECTION_COUNT_INVALID: 15, INVALID_ROUND_TIME: 10, INVALID_ROUND_DURATION: 10,
  SECURITY_PROTOCOL_REQUIRED: 0, ROUND_SESSION_CONFLICT: 0 };
const digest = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const text = (value, size = 160) => typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f]/g, ' ').slice(0, size) : '';
function csvCell(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  let result = String(value == null ? '' : value).replace(/[\r\n\x00]/g, ' ');
  if (/^\s*[=+\-@＝＋－＠]|^[\t\r\n]/u.test(result)) result = '\t' + result;
  return '"' + result.replace(/"/g, '""') + '"';
}
function riskSummaries(all, { minScore = 1, limit = 1000, includeOpenId = false } = {}) {
  return all(`SELECT p.player_id AS playerId, p.nickname, ${includeOpenId ? 'p.wechat_openid' : "''"} AS wechatOpenId,
    CASE WHEN p.wechat_openid IS NOT NULL AND p.wechat_openid <> '' THEN 1 ELSE 0 END AS wechatBound,
    p.highest_single_game_score AS highestScore, p.mood_bean_balance AS beanBalance,
    SUM(e.weight) AS riskScore, SUM(e.occurrences) AS eventCount,
    COUNT(DISTINCT CASE WHEN e.weight >= 15 THEN NULLIF(e.round_id, '') END) AS distinctFlaggedRounds,
    MIN(e.first_seen) AS firstSeen, MAX(e.last_seen) AS lastSeen,
    COALESCE(r.status, 'pending') AS reviewStatus, COALESCE(r.notes, '') AS reviewNotes
    FROM risk_events e JOIN players p ON p.player_id=e.player_id
    LEFT JOIN risk_reviews r ON r.player_id=p.player_id GROUP BY p.player_id
    HAVING SUM(e.weight) >= ? ORDER BY riskScore DESC, p.player_id ASC LIMIT ?`, [minScore, limit]).map(row => ({ ...row,
      riskLevel: row.riskScore >= 60 && row.distinctFlaggedRounds >= 3 ? 'high_review' : 'review' }));
}
function toCsv(rows) {
  const columns = ['playerId', 'nickname', 'wechatBound', 'wechatOpenId', 'riskLevel', 'riskScore', 'distinctFlaggedRounds',
    'eventCount', 'firstSeen', 'lastSeen', 'highestScore', 'beanBalance', 'reviewStatus', 'reviewNotes'];
  return '\ufeff' + columns.map(csvCell).join(',') + '\r\n' + rows.map(row => columns.map(key => csvCell(row[key])).join(',')).join('\r\n') + '\r\n';
}
function createRiskControl({ app, get, all, run, ensurePersisted, now, fail }) {
  const buckets = new Map();
  function record(req, user, code, extra = {}) {
    if (!user || !Object.prototype.hasOwnProperty.call(WEIGHTS, code)) return;
    try {
      const at = now(), body = req.body || {}, round = text(body.roundId, 96), weight = WEIGHTS[code];
      const key = digest([user.player_id, round, code, Math.floor(at / 86400000)].join('|'));
      const previous = get('SELECT id FROM risk_events WHERE event_key=?', [key]);
      if (previous) run('UPDATE risk_events SET occurrences=occurrences+1,last_seen=? WHERE id=?', [at, previous.id]);
      else {
        const evidence = { path: text(req.path), actionCount: Array.isArray(body.actions) ? body.actions.length : 0,
          actionsHash: Array.isArray(body.actions) ? digest(JSON.stringify(body.actions)) : '',
          score: Number.isSafeInteger(body.score) ? body.score : null,
          collectedBlocks: Number.isSafeInteger(body.collectedMoodBeanCount) ? body.collectedMoodBeanCount : null,
          ...extra };
        run(`INSERT INTO risk_events(event_key,player_id,round_id,code,category,weight,first_seen,last_seen,evidence_json)
          VALUES (?,?,?,?,?,?,?,?,?)`, [key, user.player_id, round, code,
          weight >= 15 ? 'validation_rejected' : weight ? 'anomaly_review' : 'operational', weight, at, at, JSON.stringify(evidence)]);
      }
      ensurePersisted();
    } catch (_) { console.error('Security audit write unavailable'); }
  }
  function allow(key, max, windowMs) {
    const at = now(), old = buckets.get(key);
    const bucket = old && old.until > at ? old : { count: 0, until: at + windowMs };
    bucket.count++; buckets.set(key, bucket);
    if (buckets.size > 10000) for (const [k, value] of buckets) if (value.until <= at) buckets.delete(k);
    return bucket.count <= max;
  }
  function guard(req, res, user) {
    if (process.env.NODE_ENV !== 'production' && process.env.SECURITY_ENFORCE_LIMITS !== '1') return true;
    const heavy = /^\/v1\/cocos-zyx\/games\/(checkpoint|resume|settlements|revive-card|reward-intents)$/.test(req.path);
    if (!allow('user:' + user.player_id + (heavy ? ':heavy' : ':normal'), heavy ? 30 : 180, 60000)) {
      res.setHeader('Retry-After', '60'); fail(res, '请求过于频繁，请稍后重试', 429, 'RATE_LIMITED'); return false;
    }
    return true;
  }
  function admin(req, res, next) {
    const expected = String(process.env.RISK_ADMIN_TOKEN || '');
    if (expected.length < 32) return res.status(404).json({ code: 404, message: '接口不存在' });
    const supplied = /^Bearer ([^\s]+)$/.exec(String(req.headers.authorization || ''));
    if (!supplied || !crypto.timingSafeEqual(Buffer.from(digest(supplied[1]), 'hex'), Buffer.from(digest(expected), 'hex')))
      return res.status(403).json({ code: 403, message: '无权访问', errorCode: 'ADMIN_FORBIDDEN' });
    res.setHeader('Cache-Control', 'no-store'); next();
  }
  function adminLog(req, action, details = {}) {
    run('INSERT INTO risk_admin_events(action,actor,created_at,detail_json) VALUES(?,?,?,?)',
      [action, text(req.headers['x-audit-actor'] || 'risk-admin', 80), now(), JSON.stringify(details)]); ensurePersisted();
  }
  app.get('/v1/cocos-zyx/admin/risks/users', admin, (req, res) => {
    try {
      const minScore = Number(req.query.minScore || 1), limit = Number(req.query.limit || 200);
      if (!Number.isSafeInteger(minScore) || minScore < 0 || minScore > 1000000 || !Number.isSafeInteger(limit) || limit < 1 || limit > 1000)
        return fail(res, '查询范围无效', 400, 'ADMIN_QUERY_INVALID');
      const rows = riskSummaries(all, { minScore, limit }); adminLog(req, 'list', { minScore, count: rows.length }); ok(res, { users: rows });
    } catch (_) { fail(res, '风险记录暂不可用', 503, 'AUDIT_UNAVAILABLE'); }
  });
  app.get('/v1/cocos-zyx/admin/risks/users/:playerId', admin, (req, res) => {
    try {
      const id = text(req.params.playerId, 96);
      const events = all('SELECT id,round_id AS roundId,code,category,weight,occurrences,first_seen AS firstSeen,last_seen AS lastSeen,evidence_json AS evidence FROM risk_events WHERE player_id=? ORDER BY id DESC LIMIT 500', [id]);
      adminLog(req, 'detail', { playerId: id }); ok(res, { events: events.map(row => ({ ...row, evidence: JSON.parse(row.evidence) })) });
    } catch (_) { fail(res, '风险记录暂不可用', 503, 'AUDIT_UNAVAILABLE'); }
  });
  app.get('/v1/cocos-zyx/admin/risks/export', admin, (req, res) => {
    try {
      const format = req.query.format || 'json';
      if (!['json', 'csv'].includes(format)) return fail(res, '导出格式无效', 400, 'ADMIN_QUERY_INVALID');
      const rows = riskSummaries(all, { limit: 5001 });
      if (rows.length > 5000) return fail(res, '请使用数据库快照离线导出完整数据', 413, 'EXPORT_TOO_LARGE');
      adminLog(req, 'export', { format, count: rows.length });
      res.setHeader('Content-Disposition', 'attachment; filename="risk-users.' + format + '"');
      res.type(format === 'csv' ? 'text/csv' : 'application/json').send(format === 'csv' ? toCsv(rows) : JSON.stringify({ exportedAt: now(), users: rows }));
    } catch (_) { fail(res, '导出暂不可用', 503, 'AUDIT_UNAVAILABLE'); }
  });
  app.post('/v1/cocos-zyx/admin/risks/users/:playerId/review', admin, (req, res) => {
    try {
      const id = text(req.params.playerId, 96), status = req.body.status, notes = text(req.body.notes, 1000);
      if (!['pending', 'cleared', 'confirmed'].includes(status) || !get('SELECT player_id FROM players WHERE player_id=?', [id]))
        return fail(res, '复核参数无效', 400, 'ADMIN_QUERY_INVALID');
      run('INSERT INTO risk_reviews(player_id,status,notes,updated_at) VALUES(?,?,?,?) ON CONFLICT(player_id) DO UPDATE SET status=excluded.status,notes=excluded.notes,updated_at=excluded.updated_at', [id, status, notes, now()]);
      adminLog(req, 'review', { playerId: id, status }); ok(res, { saved: true, status });
    } catch (_) { fail(res, '复核结果暂未保存', 503, 'AUDIT_UNAVAILABLE'); }
  });
  function ok(res, data) { res.json({ code: 0, data }); }
  return { record, guard, allow };
}
module.exports = { createRiskControl, riskSummaries, toCsv, csvCell };
