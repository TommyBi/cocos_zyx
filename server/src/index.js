require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const initSqlJs = require('sql.js');

const economy = require('./economyConfig');

const app = express();
const port = Number(process.env.PORT || 8080);
let dbPath = path.resolve(process.env.DB_PATH || path.join(__dirname, '..', 'data', 'game.sqlite'));
const maxLeaderboardEntries = 200;
const chinaOffsetMs = 8 * 60 * 60 * 1000;
let db;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '32kb' }));

function ok(res, data) {
  res.json({ code: 0, data });
}

function fail(res, message, status = 400, errorCode) {
  const body = { code: status, message };
  // 稳定业务错误码：客户端按错误码区分“记录本身不可重试”与可恢复错误，不只依赖 HTTP 状态段。
  if (errorCode) body.errorCode = errorCode;
  res.status(status).json(body);
}

function now() {
  return Date.now();
}

function clampInt(value, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return min;
  return Math.max(min, Math.min(max, parsed));
}

function stringValue(value, maxLength, fallback = '') {
  return String(value || fallback).trim().slice(0, maxLength);
}

function newToken() {
  return crypto.randomBytes(24).toString('hex');
}

function newGuestId() {
  return `guest_${crypto.randomBytes(18).toString('hex')}`;
}

const PERSIST_DEBOUNCE_MS = 500;
let persistTimer = null;
let persistPending = false;
/** 上次落盘失败留下的“未持久化”状态；只有成功写盘才能清除。 */
let persistDirty = false;

/**
 * 原子落盘：同目录临时文件写入 → fsync 刷盘 → rename 原子替换，
 * 避免直接覆盖写一半损坏完整数据库。失败时保留 persistDirty，不得伪装成功。
 */
function persistNow() {
  try {
    const tmpPath = `${dbPath}.tmp`;
    const fd = fs.openSync(tmpPath, 'w');
    try {
      fs.writeSync(fd, Buffer.from(db.export()));
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(tmpPath, dbPath);
    persistPending = false;
    persistDirty = false;
  } catch (error) {
    persistDirty = true;
    throw error;
  }
}

/**
 * 防抖落盘：sql.js 每次导出都是整库拷贝，500ms 内的连续写只落盘一次，
 * 避免一次结算多条 UPDATE 引发多次全量写盘阻塞请求。进程退出前强制 flush。
 */
function persist() {
  persistPending = true;
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    if (!persistPending) return;
    try {
      persistNow();
    } catch (error) {
      // 保持 persistDirty，等待下一次关键事务的落盘确认重试。
      console.error('debounced persist failed', error);
    }
  }, PERSIST_DEBOUNCE_MS);
  if (persistTimer.unref) persistTimer.unref();
}

function flushPersist() {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  if (!persistPending && !persistDirty) return;
  try {
    persistNow();
  } catch (error) {
    // 退出阶段无法重试，保持数据库文件为最近一次成功落盘的状态。
  }
}

/**
 * 关键经济事务的落盘确认：只要存在未落盘写入（含此前失败遗留）就立即原子写盘。
 * 所有关键经济接口在返回任何 2xx 前都必须通过本确认；幂等重放同样适用。
 * 写盘失败抛错，由接口返回 5xx，客户端保留相同 roundId/actionId 重试。
 */
function ensurePersisted() {
  if (!persistPending && !persistDirty) return;
  persistNow();
}

process.on('exit', flushPersist);
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    flushPersist();
    process.exit(0);
  });
});

function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

/**
 * 多步写入的事务包裹：任一步失败整体回滚，避免“对局已记录但奖励未入账”这类半完成状态。
 * sql.js 的写操作是同步的，防抖 persist 只会在事务结束后落盘，不会导出中间态。
 */
function withTransaction(fn) {
  db.run('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.run('COMMIT');
    return result;
  } catch (error) {
    try { db.run('ROLLBACK'); } catch (rollbackError) { /* 连接已断开时忽略 */ }
    throw error;
  }
}

function get(sql, params = []) {
  const statement = db.prepare(sql);
  statement.bind(params);
  try {
    return statement.step() ? statement.getAsObject() : null;
  } finally {
    statement.free();
  }
}

function all(sql, params = []) {
  const statement = db.prepare(sql);
  statement.bind(params);
  const rows = [];
  try {
    while (statement.step()) rows.push(statement.getAsObject());
    return rows;
  } finally {
    statement.free();
  }
}

function getWeekRange(timestamp = now()) {
  const shifted = new Date(timestamp + chinaOffsetMs);
  const day = shifted.getUTCDay() || 7;
  const monday = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() - (day - 1),
  ) - chinaOffsetMs;
  const sunday = monday + 7 * 24 * 60 * 60 * 1000;
  const isoThursday = new Date(monday + 3 * 24 * 60 * 60 * 1000 + chinaOffsetMs);
  const year = isoThursday.getUTCFullYear();
  const firstThursday = Date.UTC(year, 0, 4);
  const firstDay = new Date(firstThursday + chinaOffsetMs).getUTCDay() || 7;
  const firstMonday = firstThursday - (firstDay - 1) * 24 * 60 * 60 * 1000;
  const week = Math.floor((monday + chinaOffsetMs - firstMonday) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return {
    weekId: `${year}-W${String(week).padStart(2, '0')}`,
    startAt: monday,
    endAt: sunday,
  };
}

function safeProfile(user) {
  const gameCountRow = get('SELECT COUNT(*) AS count FROM round_settlements WHERE player_id = ?', [user.player_id]);
  return {
    playerId: user.player_id,
    nickname: user.nickname,
    avatarUrl: user.avatar_url,
    registeredAt: new Date(user.created_at).toISOString(),
    level: user.level,
    experience: user.experience,
    moodBeanBalance: user.mood_bean_balance,
    totalMoodBeans: user.total_mood_beans,
    highestSingleGameScore: user.highest_single_game_score,
    gameCount: Number(gameCountRow && gameCountRow.count) || 0,
  };
}

function findUser(token) {
  if (!token) return null;
  return get('SELECT * FROM players WHERE token = ?', [token]);
}

function authenticate(req, res) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '') || String(req.query.token || '');
  const user = findUser(token);
  if (!user) {
    fail(res, '登录已失效，请重新进入游戏', 401, 'UNAUTHORIZED');
    return null;
  }
  return user;
}

function getExperienceTarget(level) {
  return Math.max(15, Math.ceil(15 * Math.pow(1.32, Math.max(1, level) - 1)));
}

function addExperience(user, amount) {
  let level = user.level;
  let experience = user.experience + amount;
  while (experience >= getExperienceTarget(level)) {
    experience -= getExperienceTarget(level);
    level++;
  }
  return { level, experience };
}

function ensureWeekSettled() {
  const currentWeek = getWeekRange();
  const last = get('SELECT value FROM app_state WHERE key = ?', ['last_settled_week_id']);
  if (last && last.value === currentWeek.weekId) return;

  const previous = getWeekRange(currentWeek.startAt - 1);
  // R5：周榜奖励写入是关键经济事务，必须在同一事务内完成并立即落盘。
  withTransaction(() => {
    const ranks = ['power', 'happiness'];
    for (const rankingType of ranks) {
      const metric = rankingType === 'power' ? 'weekly_high_score' : 'weekly_mood_beans';
      const rows = all(
        `SELECT player_id FROM weekly_stats
         WHERE week_id = ? AND ${metric} > 0
         ORDER BY ${metric} DESC, ${metric}_at ASC, player_id ASC
         LIMIT ${maxLeaderboardEntries}`,
        [previous.weekId],
      );
      rows.forEach((row, index) => {
        const rank = index + 1;
        const tier = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'normal';
        const rewardId = `${previous.weekId}:${rankingType}:${row.player_id}`;
        const existing = get('SELECT id FROM reward_mail WHERE reward_id = ?', [rewardId]);
        if (!existing) {
          run(
            `INSERT INTO reward_mail (reward_id, player_id, week_id, ranking_type, rank, reward_tier, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [rewardId, row.player_id, previous.weekId, rankingType, rank, tier, now()],
          );
        }
      });
    }
    run('INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)', ['last_settled_week_id', currentWeek.weekId]);
  });
  ensurePersisted();
}

function leaderboard(type, user) {
  const week = getWeekRange();
  const metric = type === 'happiness' ? 'weekly_mood_beans' : 'weekly_high_score';
  const metricAt = `${metric}_at`;
  const rows = all(
    `SELECT p.player_id, p.nickname, p.avatar_url, w.${metric} AS value,
      ROW_NUMBER() OVER (ORDER BY w.${metric} DESC, w.${metricAt} ASC, w.player_id ASC) AS rank
     FROM weekly_stats w
     INNER JOIN players p ON p.player_id = w.player_id
     WHERE w.week_id = ? AND w.${metric} > 0
     ORDER BY w.${metric} DESC, w.${metricAt} ASC, w.player_id ASC
     LIMIT ${maxLeaderboardEntries}`,
    [week.weekId],
  );
  const entries = rows.map((row) => ({
    rank: row.rank,
    playerId: row.player_id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    value: row.value,
    rewardTier: row.rank === 1 ? 'gold' : row.rank === 2 ? 'silver' : row.rank === 3 ? 'bronze' : 'normal',
  }));
  const self = entries.find((entry) => entry.playerId === user.player_id);
  const selfStat = get(`SELECT ${metric} AS value FROM weekly_stats WHERE week_id = ? AND player_id = ?`, [week.weekId, user.player_id]);
  const boundary = entries.length === maxLeaderboardEntries ? entries[entries.length - 1].value : 0;
  return {
    weekId: week.weekId,
    type,
    periodStartAt: new Date(week.startAt).toISOString(),
    periodEndAt: new Date(week.endAt).toISOString(),
    entries,
    self: self ? {
      rank: self.rank,
      isRanked: true,
      value: self.value,
      rewardTier: self.rewardTier,
      distanceToRank200: 0,
    } : {
      rank: null,
      isRanked: false,
      value: selfStat ? selfStat.value : 0,
      rewardTier: null,
      distanceToRank200: Math.max(0, boundary - (selfStat ? selfStat.value : 0)),
    },
  };
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      player_id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL UNIQUE,
      token TEXT NOT NULL UNIQUE,
      nickname TEXT NOT NULL DEFAULT '解忧玩家',
      avatar_url TEXT NOT NULL DEFAULT '',
      level INTEGER NOT NULL DEFAULT 1,
      experience INTEGER NOT NULL DEFAULT 0,
      mood_bean_balance INTEGER NOT NULL DEFAULT 0,
      total_mood_beans INTEGER NOT NULL DEFAULT 0,
      highest_single_game_score INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS round_settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL,
      round_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      mood_token_count INTEGER NOT NULL DEFAULT 0,
      awarded_mood_beans INTEGER NOT NULL DEFAULT 0,
      payload_json TEXT NOT NULL DEFAULT '',
      result_json TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      UNIQUE (player_id, round_id)
    );
    CREATE TABLE IF NOT EXISTS weekly_stats (
      week_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      weekly_high_score INTEGER NOT NULL DEFAULT 0,
      weekly_high_score_at INTEGER NOT NULL DEFAULT 0,
      weekly_mood_beans INTEGER NOT NULL DEFAULT 0,
      weekly_mood_beans_at INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (week_id, player_id)
    );
    CREATE TABLE IF NOT EXISTS reward_mail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reward_id TEXT NOT NULL UNIQUE,
      player_id TEXT NOT NULL,
      week_id TEXT NOT NULL,
      ranking_type TEXT NOT NULL,
      rank INTEGER NOT NULL,
      reward_tier TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      claimed_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS official_art_progress (
      player_id TEXT NOT NULL,
      art_id TEXT NOT NULL,
      filled_cells INTEGER NOT NULL DEFAULT 0,
      completed_at INTEGER,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (player_id, art_id)
    );
    CREATE TABLE IF NOT EXISTS official_art_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL,
      action_id TEXT NOT NULL,
      art_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      result_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE (player_id, action_id)
    );
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_week_power ON weekly_stats(week_id, weekly_high_score DESC, weekly_high_score_at ASC);
    CREATE INDEX IF NOT EXISTS idx_week_happiness ON weekly_stats(week_id, weekly_mood_beans DESC, weekly_mood_beans_at ASC);
  `);
  persist();
}

app.get(['/health', '/v1/cocos-zyx/health'], (_req, res) => {
  ok(res, { ok: true, service: 'cocos-zyx-cloud', checkedAt: new Date().toISOString() });
});

app.post('/v1/cocos-zyx/players/bootstrap', (req, res) => {
  try {
    ensureWeekSettled();
    const deviceId = stringValue(req.body.deviceId, 128);
    if (!deviceId) return fail(res, '缺少设备标识');
    // R1：bootstrap 只负责身份建档。客户端提交的任何 localProfile/资产/等级/经验/最高分
    // 一律忽略，不建档、不合并；经济数据只来自服务端结算与事务接口。
    const nickname = stringValue(req.body.nickname, 24);
    const avatarUrl = stringValue(req.body.avatarUrl, 512);
    let user = get('SELECT * FROM players WHERE device_id = ?', [deviceId]);
    if (!user) {
      const createdAt = now();
      run(
        `INSERT INTO players (player_id, device_id, token, nickname, avatar_url, level, experience,
          mood_bean_balance, total_mood_beans, highest_single_game_score, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, 0, 0, 0, 0, ?, ?)`,
        [newGuestId(), deviceId, newToken(), nickname || '解忧玩家', avatarUrl, createdAt, createdAt],
      );
      // R5：新玩家建档是关键经济事务，落盘成功后才能返回。
      ensurePersisted();
      user = get('SELECT * FROM players WHERE device_id = ?', [deviceId]);
    } else {
      // 只更新允许变化的昵称和头像；空昵称保留原值，不合并任何客户端经济数值。
      run('UPDATE players SET nickname = ?, avatar_url = ?, updated_at = ? WHERE player_id = ?',
        [nickname || user.nickname, avatarUrl || user.avatar_url, now(), user.player_id]);
      // 建档落盘失败后的重试会走到这里：必须先把内存中的档案可靠写盘才能返回 2xx。
      if (persistDirty) ensurePersisted();
      user = get('SELECT * FROM players WHERE player_id = ?', [user.player_id]);
    }
    ok(res, { token: user.token, serverTime: new Date().toISOString(), currentWeekId: getWeekRange().weekId, profile: safeProfile(user) });
  } catch (error) {
    fail(res, error.message || '初始化玩家失败', 500);
  }
});

app.post('/v1/cocos-zyx/games/settlements', (req, res) => {
  try {
    ensureWeekSettled();
    const user = authenticate(req, res);
    if (!user) return;
    const roundId = stringValue(req.body.roundId, 96);
    if (!roundId) return fail(res, '缺少对局标识');
    const startedAt = Number(req.body.startedAt);
    const endedAt = Number(req.body.endedAt);
    const score = clampInt(req.body.score, 0, 1000000);
    // 心情豆只认本局实际消除收集数；客户端提交的任何奖励/余额字段一律忽略。
    const collectedMoodBeanCount = clampInt(req.body.collectedMoodBeanCount, 0, economy.MAX_COLLECTED_MOOD_BEANS_PER_ROUND);
    // R6：规范化经济载荷后再比较，字段固定顺序，禁止依赖 JSON 属性顺序。
    const payloadJson = JSON.stringify({ startedAt, endedAt, score, collectedMoodBeanCount });

    // R6：幂等按玩家作用域。同一玩家重复提交时先比对载荷：
    // 载荷一致返回第一次保存的结果快照；载荷不同返回 409，不改变任何数据。
    const existing = get('SELECT * FROM round_settlements WHERE player_id = ? AND round_id = ?', [user.player_id, roundId]);
    if (existing) {
      if (existing.payload_json === payloadJson) {
        // 幂等重放也必须先完成落盘确认：上次 2xx 前的写盘可能失败，内存记录不代表已持久化。
        ensurePersisted();
        return ok(res, { duplicate: true, ...JSON.parse(existing.result_json) });
      }
      return fail(res, '同一对局标识的请求内容不一致', 409, 'ROUND_PAYLOAD_CONFLICT');
    }

    if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt)) return fail(res, '对局时间异常', 400, 'INVALID_ROUND_TIME');
    const duration = endedAt - startedAt;
    if (duration < economy.MIN_ROUND_DURATION_MS || duration > economy.MAX_ROUND_DURATION_MS) return fail(res, '对局时长异常', 400, 'INVALID_ROUND_DURATION');
    if (endedAt > now() + economy.MAX_FUTURE_SKEW_MS) return fail(res, '对局时间异常', 400, 'INVALID_ROUND_TIME');
    // R2：7 天离线补传窗口取代旧 6 小时规则；超期由客户端按永久错误隔离，不堵塞队列。
    if (startedAt < now() - economy.MAX_OFFLINE_SETTLEMENT_AGE_MS) return fail(res, '对局超出离线补传窗口', 400, 'SETTLEMENT_TOO_OLD');

    const settledAt = now();
    // 一块一豆：基础心情豆 = 本局收集的带表情心情块数；额外奖励必须经服务端验证，第一版为 0。
    const baseMoodBeans = collectedMoodBeanCount;
    const bonusMoodBeans = 0;
    const awardedMoodBeans = baseMoodBeans + bonusMoodBeans;
    const gainedExperience = collectedMoodBeanCount;
    const experience = addExperience(user, gainedExperience);
    const highestScore = Math.max(user.highest_single_game_score, score);

    const week = getWeekRange(settledAt);
    let resultData;
    // 结算记录、玩家进度、周榜更新必须同生同死；中途异常整体回滚，客户端重试由 roundId 幂等。
    withTransaction(() => {
      run('INSERT INTO round_settlements (player_id, round_id, score, mood_token_count, awarded_mood_beans, payload_json, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.player_id, roundId, score, baseMoodBeans, awardedMoodBeans, payloadJson, '', settledAt]);
      run(`UPDATE players SET mood_bean_balance = mood_bean_balance + ?, total_mood_beans = total_mood_beans + ?,
           highest_single_game_score = ?, level = ?, experience = ?, updated_at = ? WHERE player_id = ?`,
        [awardedMoodBeans, awardedMoodBeans, highestScore, experience.level, experience.experience, settledAt, user.player_id]);
      run(`INSERT INTO weekly_stats (week_id, player_id, weekly_high_score, weekly_high_score_at, weekly_mood_beans, weekly_mood_beans_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(week_id, player_id) DO UPDATE SET
             weekly_high_score = MAX(weekly_high_score, excluded.weekly_high_score),
             weekly_high_score_at = CASE WHEN excluded.weekly_high_score > weekly_high_score THEN excluded.weekly_high_score_at ELSE weekly_high_score_at END,
             weekly_mood_beans = weekly_mood_beans + excluded.weekly_mood_beans,
             weekly_mood_beans_at = CASE WHEN excluded.weekly_mood_beans > 0 THEN excluded.weekly_mood_beans_at ELSE weekly_mood_beans_at END`,
        [week.weekId, user.player_id, score, settledAt, awardedMoodBeans, settledAt]);
      const fresh = get('SELECT * FROM players WHERE player_id = ?', [user.player_id]);
      resultData = {
        accepted: true,
        roundId,
        settlement: {
          score,
          baseMoodBeans,
          bonusMoodBeans,
          awardedMoodBeans,
          gainedExperience,
          profile: safeProfile(fresh),
        },
      };
      // 保存第一次事务完成后的权威结果快照，重复请求原样返回。
      run('UPDATE round_settlements SET result_json = ? WHERE player_id = ? AND round_id = ?',
        [JSON.stringify(resultData), user.player_id, roundId]);
    });
    // R5：关键经济事务落盘成功后才能返回 2xx；写盘失败返回 5xx，客户端用同一 roundId 重试。
    ensurePersisted();
    ok(res, resultData);
  } catch (error) {
    fail(res, error.message || '对局结算失败', 500);
  }
});

app.get('/v1/cocos-zyx/leaderboards', (req, res) => {
  try {
    ensureWeekSettled();
    const user = authenticate(req, res);
    if (!user) return;
    const type = req.query.type === 'happiness' ? 'happiness' : 'power';
    ok(res, leaderboard(type, user));
  } catch (error) {
    fail(res, error.message || '读取排行榜失败', 500);
  }
});

function getArtProgressMap(playerId) {
  const rows = all('SELECT art_id, filled_cells, completed_at FROM official_art_progress WHERE player_id = ?', [playerId]);
  const map = {};
  rows.forEach((row) => {
    map[row.art_id] = {
      filledCells: row.filled_cells,
      completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
    };
  });
  return map;
}

/** 画册按玩家等级开放；册内画作按顺序制作，前一幅未完成时不能投入后一幅。 */
function buildRealmState(user) {
  const progress = getArtProgressMap(user.player_id);
  const albums = economy.ALBUMS.map((album) => {
    const arts = [];
    let previousCompleted = true;
    for (let index = 0; index < album.artCount; index++) {
      const artId = `${album.id}_art_${index}`;
      const state = progress[artId] || { filledCells: 0, completedAt: null };
      const completed = !!state.completedAt;
      arts.push({
        artId,
        filledCells: state.filledCells,
        completedAt: state.completedAt,
        available: previousCompleted && !completed,
      });
      previousCompleted = completed;
    }
    return {
      albumId: album.id,
      openLevel: album.openLevel,
      opened: user.level >= album.openLevel,
      totalCells: economy.ART_TOTAL_CELLS,
      arts,
    };
  });
  return {
    moodBeanBalance: user.mood_bean_balance,
    totalCells: economy.ART_TOTAL_CELLS,
    maxContributePerAction: economy.MAX_CONTRIBUTE_PER_ACTION,
    configVersion: 'mood_bean_v1',
    albums,
  };
}

app.get('/v1/cocos-zyx/realm/state', (req, res) => {
  try {
    const user = authenticate(req, res);
    if (!user) return;
    ok(res, buildRealmState(user));
  } catch (error) {
    fail(res, error.message || '读取秘境状态失败', 500);
  }
});

app.post('/v1/cocos-zyx/realm/arts/contribute', (req, res) => {
  try {
    const user = authenticate(req, res);
    if (!user) return;
    const actionId = stringValue(req.body.actionId, 96);
    if (!actionId) return fail(res, '缺少操作标识');
    const artId = stringValue(req.body.artId, 96);
    const artInfo = economy.getArtInfo(artId);
    if (!artInfo) return fail(res, '画作不存在', 400, 'ART_UNKNOWN');

    const requestedBeans = clampInt(req.body.requestedBeans, 0, economy.MAX_CONTRIBUTE_PER_ACTION);
    if (requestedBeans <= 0) return fail(res, '投入数量异常', 400, 'INVALID_BEAN_AMOUNT');
    // R6：规范化经济载荷后再比较，字段固定顺序。
    const payloadJson = JSON.stringify({ artId, requestedBeans });

    // R6：幂等按玩家作用域。同一玩家同一 actionId：载荷一致返回保存过的结果，载荷不同返回 409。
    const existingAction = get('SELECT payload_json, result_json FROM official_art_actions WHERE player_id = ? AND action_id = ?', [user.player_id, actionId]);
    if (existingAction) {
      if (existingAction.payload_json === payloadJson) {
        // 幂等重放也必须先完成落盘确认。
        ensurePersisted();
        return ok(res, { duplicate: true, ...JSON.parse(existingAction.result_json) });
      }
      return fail(res, '同一操作标识的请求内容不一致', 409, 'ACTION_PAYLOAD_CONFLICT');
    }

    const album = economy.getAlbumById(artInfo.albumId);
    if (!album || user.level < album.openLevel) return fail(res, '画册尚未开放', 409, 'ALBUM_LOCKED');

    let response;
    withTransaction(() => {
      const fresh = get('SELECT * FROM players WHERE player_id = ?', [user.player_id]);
      // 前一幅未完成时不能投入后一幅。
      if (artInfo.index > 0) {
        const previousId = `${artInfo.albumId}_art_${artInfo.index - 1}`;
        const previous = get('SELECT completed_at FROM official_art_progress WHERE player_id = ? AND art_id = ?', [user.player_id, previousId]);
        if (!previous || !previous.completed_at) throw new Error('PREREQUISITE_NOT_COMPLETED');
      }
      const current = get('SELECT filled_cells, completed_at FROM official_art_progress WHERE player_id = ? AND art_id = ?', [user.player_id, artId]);
      const filledBefore = current ? current.filled_cells : 0;
      if (current && current.completed_at) {
        // 已完成画作重复投入不扣豆。
        response = {
          artId,
          requestedBeans,
          actualSpend: 0,
          alreadyCompleted: true,
          filledCells: filledBefore,
          totalCells: economy.ART_TOTAL_CELLS,
          completed: true,
          completedAt: new Date(current.completed_at).toISOString(),
          moodBeanBalance: fresh.mood_bean_balance,
        };
        run(
          'INSERT INTO official_art_actions (player_id, action_id, art_id, payload_json, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [user.player_id, actionId, artId, payloadJson, JSON.stringify(response), now()],
        );
        return;
      }
      const remainingCells = economy.ART_TOTAL_CELLS - filledBefore;
      // 服务端安全裁剪：余额不足不出负数、剩余豆位不足不越界、单次请求不超上限。
      const actualSpend = Math.min(requestedBeans, fresh.mood_bean_balance, remainingCells, economy.MAX_CONTRIBUTE_PER_ACTION);
      const filledAfter = filledBefore + actualSpend;
      const completed = filledAfter >= economy.ART_TOTAL_CELLS;
      const settledAt = now();
      run(`UPDATE players SET mood_bean_balance = mood_bean_balance - ?, updated_at = ? WHERE player_id = ?`,
        [actualSpend, settledAt, user.player_id]);
      run(`INSERT INTO official_art_progress (player_id, art_id, filled_cells, completed_at, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(player_id, art_id) DO UPDATE SET
             filled_cells = excluded.filled_cells,
             completed_at = excluded.completed_at,
             updated_at = excluded.updated_at`,
        [user.player_id, artId, filledAfter, completed ? settledAt : null, settledAt]);
      response = {
        artId,
        requestedBeans,
        actualSpend,
        alreadyCompleted: false,
        filledCells: filledAfter,
        totalCells: economy.ART_TOTAL_CELLS,
        completed,
        completedAt: completed ? new Date(settledAt).toISOString() : null,
        moodBeanBalance: fresh.mood_bean_balance - actualSpend,
      };
      run(
        'INSERT INTO official_art_actions (player_id, action_id, art_id, payload_json, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [user.player_id, actionId, artId, payloadJson, JSON.stringify(response), settledAt],
      );
    });
    // R5：关键经济事务落盘成功后才能返回 2xx；写盘失败返回 5xx，客户端用同一 actionId 重试。
    ensurePersisted();
    ok(res, response);
  } catch (error) {
    if (error && error.message === 'PREREQUISITE_NOT_COMPLETED') {
      return fail(res, '请先完成前一幅画作', 409, 'PREREQUISITE_NOT_COMPLETED');
    }
    fail(res, error.message || '投入心情豆失败', 500);
  }
});

app.get('/v1/cocos-zyx/rewards', (req, res) => {
  const user = authenticate(req, res);
  if (!user) return;
  const rewards = all('SELECT week_id, ranking_type, rank, reward_tier, created_at FROM reward_mail WHERE player_id = ? AND claimed_at IS NULL ORDER BY created_at DESC', [user.player_id]);
  ok(res, { rewards });
});

/**
 * R0：调试路由只在「非生产环境 + 显式启用」双条件同时满足时注册。
 * 任一条件不满足时路由不存在（404），而不是返回 401/403 暗示接口仍存在；
 * 隐藏客户端按钮不属于安全措施，服务端路由隔离才是最终安全边界。
 * 普通玩家 Bearer Token 不是管理员权限；未来线上 GM 需另立管理员身份与审计。
 */
const gmRoutesEnabled = process.env.NODE_ENV !== 'production' && process.env.ENABLE_GM_ROUTES === '1';

if (gmRoutesEnabled) {
/** GM：把客户端调试后的档案绝对值写回服务端，避免下次 bootstrap/结算覆盖本地发放。 */
app.post('/v1/cocos-zyx/debug/profile', (req, res) => {
  try {
    const user = authenticate(req, res);
    if (!user) return;
    const balance = clampInt(req.body.moodBeanBalance, 0, 100000000);
    const total = Math.max(balance, clampInt(req.body.totalMoodBeans, balance, 100000000));
    const level = req.body.level === undefined ? user.level : clampInt(req.body.level, 1, 1000);
    const experience = req.body.experience === undefined ? user.experience : clampInt(req.body.experience, 0, 100000000);
    const highScore = req.body.highestSingleGameScore === undefined
      ? user.highest_single_game_score
      : clampInt(req.body.highestSingleGameScore, 0, 100000000);
    const updatedAt = now();
    run(
      `UPDATE players SET mood_bean_balance = ?, total_mood_beans = ?,
       level = ?, experience = ?, highest_single_game_score = ?, updated_at = ? WHERE player_id = ?`,
      [balance, total, level, experience, highScore, updatedAt, user.player_id],
    );
    ensurePersisted();
    ok(res, { profile: safeProfile(get('SELECT * FROM players WHERE player_id = ?', [user.player_id])) });
  } catch (error) {
    fail(res, error.message || '调试档案同步失败', 500);
  }
});

/** GM：重置当前账号进度（保留 player_id / device_id / token / 昵称头像）。 */
app.post('/v1/cocos-zyx/debug/reset', (req, res) => {
  try {
    const user = authenticate(req, res);
    if (!user) return;
    const updatedAt = now();
    run(
      `UPDATE players SET level = 1, experience = 0, mood_bean_balance = 0,
       total_mood_beans = 0, highest_single_game_score = 0, updated_at = ? WHERE player_id = ?`,
      [updatedAt, user.player_id],
    );
    run('DELETE FROM weekly_stats WHERE player_id = ?', [user.player_id]);
    run('DELETE FROM round_settlements WHERE player_id = ?', [user.player_id]);
    run('DELETE FROM official_art_progress WHERE player_id = ?', [user.player_id]);
    run('DELETE FROM official_art_actions WHERE player_id = ?', [user.player_id]);
    run('DELETE FROM reward_mail WHERE player_id = ?', [user.player_id]);
    ensurePersisted();
    ok(res, { profile: safeProfile(get('SELECT * FROM players WHERE player_id = ?', [user.player_id])) });
  } catch (error) {
    fail(res, error.message || '重置账号失败', 500);
  }
});
}

/** 初始化数据库（可选覆盖路径，供测试使用临时库）并返回可挂载的 app。 */
async function start(overrideDbPath) {
  if (overrideDbPath) dbPath = path.resolve(overrideDbPath);
  const SQL = await initSqlJs();
  db = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();
  initSchema();
  return app;
}

if (require.main === module) {
  start().then(() => {
    app.listen(port, () => console.log(`cocos-zyx cloud listening on ${port}`));
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { app, start };
