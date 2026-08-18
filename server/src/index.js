require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const initSqlJs = require('sql.js');

const app = express();
const port = Number(process.env.PORT || 8080);
const dbPath = path.resolve(process.env.DB_PATH || path.join(__dirname, '..', 'data', 'game.sqlite'));
// 与客户端 assets/script/dataModule/ZyxGameModule.ts 的 HAPPY_BOTTLE_TARGET 保持一致。
const bottleTarget = 66;
const maxLeaderboardEntries = 200;
const chinaOffsetMs = 8 * 60 * 60 * 1000;
let db;

function getPuzzleUnlockCost(pieceId) {
  if (pieceId === 'album:album_season') return 1;
  if (pieceId === 'album:album_city') return 10;
  if (pieceId.startsWith('album:')) return 30;
  const firstAlbumArt = /^art:album_season_art_(\d+)$/.exec(pieceId);
  if (firstAlbumArt) return Number(firstAlbumArt[1]) + 1;
  if (/^art:album_city_art_\d+$/.test(pieceId)) return 20;
  if (pieceId.startsWith('art:')) return 30;
  return 0;
}

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '32kb' }));

function ok(res, data) {
  res.json({ code: 0, data });
}

function fail(res, message, status = 400) {
  res.status(status).json({ code: status, message });
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

function persistNow() {
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
  persistPending = false;
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
    if (persistPending) persistNow();
  }, PERSIST_DEBOUNCE_MS);
  if (persistTimer.unref) persistTimer.unref();
}

function flushPersist() {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  if (persistPending) persistNow();
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
    happyBottleBalance: user.happy_bottle_balance,
    happyBottleProgress: user.happy_bottle_progress,
    happyBottleTarget: bottleTarget,
    totalHappyBottles: user.total_happy_bottles,
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
    fail(res, '登录已失效，请重新进入游戏', 401);
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
  const ranks = ['power', 'happiness'];
  for (const rankingType of ranks) {
    const metric = rankingType === 'power' ? 'weekly_high_score' : 'weekly_happy_bottles';
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
}

function leaderboard(type, user) {
  const week = getWeekRange();
  const metric = type === 'happiness' ? 'weekly_happy_bottles' : 'weekly_high_score';
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
      happy_bottle_balance INTEGER NOT NULL DEFAULT 0,
      happy_bottle_progress INTEGER NOT NULL DEFAULT 0,
      total_happy_bottles INTEGER NOT NULL DEFAULT 0,
      highest_single_game_score INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS round_settlements (
      round_id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      mood_count INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS weekly_stats (
      week_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      weekly_high_score INTEGER NOT NULL DEFAULT 0,
      weekly_high_score_at INTEGER NOT NULL DEFAULT 0,
      weekly_happy_bottles INTEGER NOT NULL DEFAULT 0,
      weekly_happy_bottles_at INTEGER NOT NULL DEFAULT 0,
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
    CREATE TABLE IF NOT EXISTS puzzle_unlocks (
      player_id TEXT NOT NULL,
      piece_id TEXT NOT NULL,
      cost INTEGER NOT NULL,
      unlocked_at INTEGER NOT NULL,
      PRIMARY KEY (player_id, piece_id)
    );
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_week_power ON weekly_stats(week_id, weekly_high_score DESC, weekly_high_score_at ASC);
    CREATE INDEX IF NOT EXISTS idx_week_happiness ON weekly_stats(week_id, weekly_happy_bottles DESC, weekly_happy_bottles_at ASC);
  `);
  // 666 旧规则下可能留下大于当前目标的进度；幂等折算为完整瓶与 0..65 的余量。
  db.run(`
    UPDATE players
    SET happy_bottle_balance = happy_bottle_balance + CAST(happy_bottle_progress / ${bottleTarget} AS INTEGER),
        total_happy_bottles = total_happy_bottles + CAST(happy_bottle_progress / ${bottleTarget} AS INTEGER),
        happy_bottle_progress = happy_bottle_progress % ${bottleTarget}
    WHERE happy_bottle_progress >= ${bottleTarget}
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
    const nickname = stringValue(req.body.nickname, 24, '解忧玩家') || '解忧玩家';
    const avatarUrl = stringValue(req.body.avatarUrl, 512);
    const localProfile = req.body.localProfile || {};
    let user = get('SELECT * FROM players WHERE device_id = ?', [deviceId]);
    if (!user) {
      const createdAt = now();
      const level = clampInt(localProfile.level, 1, 1000);
      const experience = clampInt(localProfile.experience, 0, 100000000);
      const balance = clampInt(localProfile.happyBottleBalance, 0, 100000000);
      const progress = clampInt(localProfile.happyBottleProgress, 0, bottleTarget - 1);
      const total = Math.max(balance, clampInt(localProfile.totalHappyBottles, 0, 100000000));
      const highScore = clampInt(localProfile.highestSingleGameScore, 0, 100000000);
      run(
        `INSERT INTO players (player_id, device_id, token, nickname, avatar_url, level, experience,
          happy_bottle_balance, happy_bottle_progress, total_happy_bottles, highest_single_game_score, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newGuestId(), deviceId, newToken(), nickname, avatarUrl, level, experience, balance, progress, total, highScore, createdAt, createdAt],
      );
      user = get('SELECT * FROM players WHERE device_id = ?', [deviceId]);
    } else {
      run('UPDATE players SET nickname = ?, avatar_url = ?, updated_at = ? WHERE player_id = ?',
        [nickname, avatarUrl || user.avatar_url, now(), user.player_id]);
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
    const existing = get('SELECT * FROM round_settlements WHERE round_id = ?', [roundId]);
    if (existing) return ok(res, { accepted: true, duplicate: true, roundId, profile: safeProfile(user) });

    const startedAt = Number(req.body.startedAt);
    const endedAt = Number(req.body.endedAt);
    const duration = endedAt - startedAt;
    const score = clampInt(req.body.score, 0, 1000000);
    const moodCount = clampInt(req.body.moodCount, 0, bottleTarget * 10);
    if (!Number.isFinite(duration) || duration < 5000 || duration > 4 * 60 * 60 * 1000) return fail(res, '对局时长异常');
    if (endedAt > now() + 2 * 60 * 1000 || startedAt < now() - 6 * 60 * 60 * 1000) return fail(res, '对局时间异常');

    const settledAt = now();
    const totalProgress = user.happy_bottle_progress + moodCount;
    const completedHappyBottles = Math.floor(totalProgress / bottleTarget);
    const profileProgress = totalProgress % bottleTarget;
    const experience = addExperience(user, moodCount);
    const highestScore = Math.max(user.highest_single_game_score, score);
    const updated = {
      balance: user.happy_bottle_balance + completedHappyBottles,
      total: user.total_happy_bottles + completedHappyBottles,
      progress: profileProgress,
      level: experience.level,
      exp: experience.experience,
    };

    run('INSERT INTO round_settlements (round_id, player_id, score, mood_count, created_at) VALUES (?, ?, ?, ?, ?)',
      [roundId, user.player_id, score, moodCount, settledAt]);
    run(`UPDATE players SET happy_bottle_balance = ?, happy_bottle_progress = ?, total_happy_bottles = ?,
         highest_single_game_score = ?, level = ?, experience = ?, updated_at = ? WHERE player_id = ?`,
      [updated.balance, updated.progress, updated.total, highestScore, updated.level, updated.exp, settledAt, user.player_id]);
    const week = getWeekRange(settledAt);
    run(`INSERT INTO weekly_stats (week_id, player_id, weekly_high_score, weekly_high_score_at, weekly_happy_bottles, weekly_happy_bottles_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(week_id, player_id) DO UPDATE SET
           weekly_high_score = MAX(weekly_high_score, excluded.weekly_high_score),
           weekly_high_score_at = CASE WHEN excluded.weekly_high_score > weekly_high_score THEN excluded.weekly_high_score_at ELSE weekly_high_score_at END,
           weekly_happy_bottles = weekly_happy_bottles + excluded.weekly_happy_bottles,
           weekly_happy_bottles_at = CASE WHEN excluded.weekly_happy_bottles > 0 THEN excluded.weekly_happy_bottles_at ELSE weekly_happy_bottles_at END`,
      [week.weekId, user.player_id, score, settledAt, completedHappyBottles, settledAt]);
    const fresh = get('SELECT * FROM players WHERE player_id = ?', [user.player_id]);
    ok(res, {
      accepted: true,
      roundId,
      settlement: {
        score,
        gainedExperience: moodCount,
        completedHappyBottles,
        profile: safeProfile(fresh),
      },
    });
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

app.post('/v1/cocos-zyx/puzzles/pieces/unlock', (req, res) => {
  try {
    ensureWeekSettled();
    const user = authenticate(req, res);
    if (!user) return;
    const pieceId = stringValue(req.body.puzzlePieceId, 96);
    const requestedCost = clampInt(req.body.cost, 0, 1000);
    const cost = getPuzzleUnlockCost(pieceId);
    if (!pieceId || cost <= 0) return fail(res, '拼图参数异常');
    if (requestedCost !== cost) return fail(res, '解锁消耗已更新，请重试', 409);
    const unlocked = get('SELECT piece_id FROM puzzle_unlocks WHERE player_id = ? AND piece_id = ?', [user.player_id, pieceId]);
    if (unlocked) return ok(res, { unlocked: true, duplicate: true, profile: safeProfile(user) });
    if (user.happy_bottle_balance < cost) return fail(res, '开心瓶不足', 409);
    run('INSERT INTO puzzle_unlocks (player_id, piece_id, cost, unlocked_at) VALUES (?, ?, ?, ?)', [user.player_id, pieceId, cost, now()]);
    run('UPDATE players SET happy_bottle_balance = happy_bottle_balance - ?, updated_at = ? WHERE player_id = ?', [cost, now(), user.player_id]);
    ok(res, { unlocked: true, profile: safeProfile(get('SELECT * FROM players WHERE player_id = ?', [user.player_id])) });
  } catch (error) {
    fail(res, error.message || '解锁拼图失败', 500);
  }
});

app.get('/v1/cocos-zyx/puzzles/unlocks', (req, res) => {
  const user = authenticate(req, res);
  if (!user) return;
  const pieces = all('SELECT piece_id FROM puzzle_unlocks WHERE player_id = ?', [user.player_id]).map((row) => row.piece_id);
  ok(res, { pieces });
});

app.get('/v1/cocos-zyx/rewards', (req, res) => {
  const user = authenticate(req, res);
  if (!user) return;
  const rewards = all('SELECT week_id, ranking_type, rank, reward_tier, created_at FROM reward_mail WHERE player_id = ? AND claimed_at IS NULL ORDER BY created_at DESC', [user.player_id]);
  ok(res, { rewards });
});

/** GM：把客户端调试后的档案绝对值写回服务端，避免下次 bootstrap/结算覆盖本地发放。 */
app.post('/v1/cocos-zyx/debug/profile', (req, res) => {
  try {
    const user = authenticate(req, res);
    if (!user) return;
    const balance = clampInt(req.body.happyBottleBalance, 0, 100000000);
    const progress = clampInt(req.body.happyBottleProgress, 0, bottleTarget - 1);
    const total = Math.max(balance, clampInt(req.body.totalHappyBottles, balance, 100000000));
    const level = req.body.level === undefined ? user.level : clampInt(req.body.level, 1, 1000);
    const experience = req.body.experience === undefined ? user.experience : clampInt(req.body.experience, 0, 100000000);
    const highScore = req.body.highestSingleGameScore === undefined
      ? user.highest_single_game_score
      : clampInt(req.body.highestSingleGameScore, 0, 100000000);
    const updatedAt = now();
    run(
      `UPDATE players SET happy_bottle_balance = ?, happy_bottle_progress = ?, total_happy_bottles = ?,
       level = ?, experience = ?, highest_single_game_score = ?, updated_at = ? WHERE player_id = ?`,
      [balance, progress, total, level, experience, highScore, updatedAt, user.player_id],
    );
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
      `UPDATE players SET level = 1, experience = 0, happy_bottle_balance = 0, happy_bottle_progress = 0,
       total_happy_bottles = 0, highest_single_game_score = 0, updated_at = ? WHERE player_id = ?`,
      [updatedAt, user.player_id],
    );
    run('DELETE FROM weekly_stats WHERE player_id = ?', [user.player_id]);
    run('DELETE FROM round_settlements WHERE player_id = ?', [user.player_id]);
    run('DELETE FROM puzzle_unlocks WHERE player_id = ?', [user.player_id]);
    run('DELETE FROM reward_mail WHERE player_id = ?', [user.player_id]);
    ok(res, { profile: safeProfile(get('SELECT * FROM players WHERE player_id = ?', [user.player_id])) });
  } catch (error) {
    fail(res, error.message || '重置账号失败', 500);
  }
});

initSqlJs().then((SQL) => {
  db = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();
  initSchema();
  app.listen(port, () => console.log(`cocos-zyx cloud listening on ${port}`));
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
