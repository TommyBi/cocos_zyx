require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const initSqlJs = require('sql.js');

const economy = require('./economyConfig');
const { migrateSchema } = require('./schema');
const { replayRound } = require('./gameEngine');
const { exchangeWeChatLoginCode } = require('./wechatAuth');

const app = express();
const port = Number(process.env.PORT || 8080);
let dbPath = path.resolve(process.env.DB_PATH || path.join(__dirname, '..', 'data', 'game.sqlite'));
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

const DEFAULT_NICKNAME_ADJECTIVES = ['美丽的', '快乐的', '勇敢的', '温柔的', '机灵的', '幸运的', '恬静的', '活泼的', '善良的', '可爱的'];
const DEFAULT_NICKNAME_ANIMALS = ['狐狸', '天鹅', '小熊', '猫咪', '兔子', '企鹅', '小鹿', '松鼠', '熊猫', '海豚', '柴犬', '考拉'];
function createDefaultNickname() {
  const adjective = DEFAULT_NICKNAME_ADJECTIVES[crypto.randomInt(DEFAULT_NICKNAME_ADJECTIVES.length)];
  const animal = DEFAULT_NICKNAME_ANIMALS[crypto.randomInt(DEFAULT_NICKNAME_ANIMALS.length)];
  return `${adjective}${animal}`;
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

/** 体力按服务端时钟懒恢复；低于上限时每 5 分钟恢复 1 点，额外发放可超过上限。 */
function getStaminaState(user, at = now()) {
  let current = Math.max(0, Number.parseInt(user.stamina_current, 10) || 0);
  let updatedAt = Number(user.stamina_updated_at) || at;
  if (current >= economy.STAMINA_MAX) {
    updatedAt = at;
  } else {
    const recovered = Math.max(0, Math.floor((at - updatedAt) / economy.STAMINA_REGEN_MS));
    current = Math.min(economy.STAMINA_MAX, current + recovered);
    updatedAt = current >= economy.STAMINA_MAX ? at : updatedAt + recovered * economy.STAMINA_REGEN_MS;
  }
  const dayKey = new Date(at + chinaOffsetMs).toISOString().slice(0, 10);
  const sharedToday = user.player_id
    ? !!get('SELECT 1 FROM stamina_share_claims WHERE player_id = ? AND day_key = ?', [user.player_id, dayKey])
    : false;
  return {
    current,
    updatedAt,
    max: economy.STAMINA_MAX,
    regenSeconds: economy.STAMINA_REGEN_MS / 1000,
    nextRecoveryAt: current >= economy.STAMINA_MAX ? null : new Date(updatedAt + economy.STAMINA_REGEN_MS).toISOString(),
    serverTime: new Date(at).toISOString(),
    shareAvailableToday: !sharedToday,
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
    stamina: getStaminaState(user),
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

/**
 * 永久单局最高分排行榜。
 * 直接基于 players.highest_single_game_score，无周期、无结算概念：
 * 列表返回全服前 200 名，自己始终单独返回名次与单局最高分（未上榜时 onBoard=false）。
 */
function leaderboard(user) {
  const rows = all(
    `SELECT player_id, nickname, avatar_url, highest_single_game_score AS value
     FROM players WHERE highest_single_game_score > 0
     ORDER BY highest_single_game_score DESC, updated_at ASC, player_id ASC
     LIMIT 200`,
  );
  const entries = rows.map((row, index) => ({
    rank: index + 1,
    playerId: row.player_id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    value: row.value,
    rewardTier: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'normal',
  }));
  const bestScore = Math.max(0, user.highest_single_game_score || 0);
  const onBoard = entries.some((entry) => entry.playerId === user.player_id);
  // 实际名次 = 分数严格高于自己的人数 + 1；同分并列取相同名次。
  let rank = null;
  if (bestScore > 0) {
    const higher = get('SELECT COUNT(*) AS count FROM players WHERE highest_single_game_score > ?', [bestScore]);
    rank = (Number(higher && higher.count) || 0) + 1;
  }
  return { entries, self: { rank, bestScore, onBoard } };
}

app.get(['/health', '/v1/cocos-zyx/health'], (_req, res) => {
  ok(res, { ok: true, service: 'cocos-zyx-cloud', apiVersion: 3, schemaVersion: 5, capabilities: ['wechat-login', 'stamina', 'round-start', 'settlement', 'power-leaderboard', 'daily-share'], checkedAt: new Date().toISOString() });
});

app.post('/v1/cocos-zyx/players/bootstrap', async (req, res) => {
  try {
    const deviceId = stringValue(req.body.deviceId, 128);
    const loginCode = stringValue(req.body.loginCode, 128);
    if (!deviceId) return fail(res, '缺少设备标识', 400, 'DEVICE_ID_REQUIRED');

    // 微信端只信任服务端用一次性 code 换回的 openid；Web 预览才单独使用 deviceId。
    const wechatOpenId = loginCode ? await exchangeWeChatLoginCode(loginCode) : '';
    const deviceUser = get('SELECT * FROM players WHERE device_id = ?', [deviceId]);
    let user = wechatOpenId
      ? get('SELECT * FROM players WHERE wechat_openid = ?', [wechatOpenId])
      : deviceUser;

    // 旧账号首次微信登录时原地绑定，保留 playerId、资产、分数和历史对局。
    if (!user && wechatOpenId && deviceUser && !deviceUser.wechat_openid) {
      run('UPDATE players SET wechat_openid = ?, updated_at = ? WHERE player_id = ?',
        [wechatOpenId, now(), deviceUser.player_id]);
      user = get('SELECT * FROM players WHERE player_id = ?', [deviceUser.player_id]);
    }

    // bootstrap 只负责身份建档，资料只能经显式授权接口修改；其他客户端数值一律忽略。
    if (!user) {
      const createdAt = now();
      // 同一设备切换微信账号时不能再占用旧账号的唯一 deviceId，身份仍以 openid 为准。
      const storedDeviceId = deviceUser ? `wx_${crypto.randomBytes(18).toString('hex')}` : deviceId;
      run(
        `INSERT INTO players (player_id, device_id, wechat_openid, token, nickname, avatar_url, level, experience,
          mood_bean_balance, total_mood_beans, highest_single_game_score, stamina_current, stamina_updated_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, ?, ?, ?, ?)`,
        [newGuestId(), storedDeviceId, wechatOpenId || null, newToken(), createDefaultNickname(), '', economy.STAMINA_MAX, createdAt, createdAt, createdAt],
      );
      // R5：新玩家建档是关键经济事务，落盘成功后才能返回。
      ensurePersisted();
      user = get('SELECT * FROM players WHERE device_id = ?', [storedDeviceId]);
    } else {
      // 历史通用名只迁移一次，之后登录绝不覆盖默认昵称或已授权微信资料。
      if (user.nickname === '解忧玩家' || user.nickname === '顺心朋友') {
        run('UPDATE players SET nickname = ?, updated_at = ? WHERE player_id = ?',
          [createDefaultNickname(), now(), user.player_id]);
      }
      // 建档落盘失败后的重试会走到这里：必须先把内存中的档案可靠写盘才能返回 2xx。
      if (persistDirty || persistPending) ensurePersisted();
      user = get('SELECT * FROM players WHERE player_id = ?', [user.player_id]);
    }
    ok(res, { token: user.token, serverTime: new Date().toISOString(), profile: safeProfile(user) });
  } catch (error) {
    fail(res, error.message || '初始化玩家失败', error.status || 500, error.errorCode);
  }
});

/** 微信资料由玩家主动授权后单独更新，普通 bootstrap 不得覆盖。 */
app.post('/v1/cocos-zyx/players/profile', (req, res) => {
  try {
    const user = authenticate(req, res);
    if (!user) return;
    const nickname = stringValue(req.body.nickname, 24);
    const avatarUrl = stringValue(req.body.avatarUrl, 512);
    if (!nickname) return fail(res, '微信昵称不能为空', 400, 'PROFILE_NICKNAME_INVALID');
    if (avatarUrl && !/^https:\/\//i.test(avatarUrl)) {
      return fail(res, '微信头像地址无效', 400, 'PROFILE_AVATAR_INVALID');
    }
    run('UPDATE players SET nickname = ?, avatar_url = ?, updated_at = ? WHERE player_id = ?',
      [nickname, avatarUrl, now(), user.player_id]);
    ensurePersisted();
    ok(res, { profile: safeProfile(get('SELECT * FROM players WHERE player_id = ?', [user.player_id])) });
  } catch (error) {
    fail(res, error.message || '更新玩家资料失败', 500);
  }
});

/** 入局凭证由服务端记录，体力在这里扣除；同一 roundId 重试不会重复扣点。 */
app.post('/v1/cocos-zyx/games/start', (req, res) => {
  try {
    const user = authenticate(req, res);
    if (!user) return;
    const roundId = stringValue(req.body.roundId, 96);
    if (!roundId) return fail(res, '缺少对局标识', 400, 'ROUND_ID_INVALID');

    const existing = get('SELECT status, seed, is_tutorial FROM game_rounds WHERE player_id = ? AND round_id = ?', [user.player_id, roundId]);
    if (existing) {
      if (existing.status !== 'active') return fail(res, '此对局已结算', 409, 'ROUND_ALREADY_SETTLED');
      ensurePersisted();
      const fresh = get('SELECT * FROM players WHERE player_id = ?', [user.player_id]);
      return ok(res, {
        roundId,
        duplicate: true,
        stamina: getStaminaState(fresh),
        seed: existing.seed,
        isTutorial: !!existing.is_tutorial,
      });
    }

    const startedAt = now();
    const state = getStaminaState(user, startedAt);
    if (state.current < economy.STAMINA_COST_PER_ROUND) {
      return res.status(429).json({
        code: 429,
        message: '体力不足，请等待恢复',
        errorCode: 'STAMINA_EMPTY',
        data: { stamina: state },
      });
    }

    // 生成对局种子：服务端权威随机源，客户端用同一种子驱动棋盘生成
    const seed = crypto.randomBytes(4).readUInt32BE(0) || 1;
    // 判断教学局：完成局数 < 2 时为教学
    const gameCountRow = get('SELECT COUNT(*) AS count FROM round_settlements WHERE player_id = ?', [user.player_id]);
    const gameCount = Number(gameCountRow && gameCountRow.count) || 0;
    const isTutorial = gameCount < 2;

    let stamina;
    withTransaction(() => {
      const spent = state.current - economy.STAMINA_COST_PER_ROUND;
      run('UPDATE players SET stamina_current = ?, stamina_updated_at = ?, updated_at = ? WHERE player_id = ?',
        [spent, state.updatedAt, startedAt, user.player_id]);
      run('INSERT INTO game_rounds (player_id, round_id, started_at, status, seed, is_tutorial) VALUES (?, ?, ?, ?, ?, ?)',
        [user.player_id, roundId, startedAt, 'active', seed, isTutorial ? 1 : 0]);
      stamina = getStaminaState({ player_id: user.player_id, stamina_current: spent, stamina_updated_at: state.updatedAt }, startedAt);
    });
    ensurePersisted();
    ok(res, { roundId, stamina, seed, isTutorial });
  } catch (error) {
    fail(res, error.message || '开始对局失败', 500);
  }
});

/** 分享补体力：每个服务端玩家按北京时间每天领取一次，允许额外体力超过自然恢复上限。 */
app.post('/v1/cocos-zyx/stamina/share-claim', (req, res) => {
  try {
    const user = authenticate(req, res);
    if (!user) return;
    const claimId = stringValue(req.body.claimId, 96);
    if (!/^share_[a-z0-9_]{8,80}$/.test(claimId)) return fail(res, '缺少领取标识', 400, 'SHARE_CLAIM_ID_INVALID');
    const claimedAt = now();
    const dayKey = new Date(claimedAt + chinaOffsetMs).toISOString().slice(0, 10);
    const existing = get('SELECT claim_id FROM stamina_share_claims WHERE player_id = ? AND day_key = ?', [user.player_id, dayKey]);
    if (existing) {
      ensurePersisted();
      const fresh = get('SELECT * FROM players WHERE player_id = ?', [user.player_id]);
      const stamina = getStaminaState(fresh, claimedAt);
      if (existing.claim_id === claimId) return ok(res, { duplicate: true, awarded: economy.STAMINA_SHARE_REWARD, stamina });
      return res.status(429).json({
        code: 429,
        message: '今天的分享体力已经领取，明天再来吧',
        errorCode: 'STAMINA_SHARE_DAILY_LIMIT',
        data: { stamina },
      });
    }
    const state = getStaminaState(user, claimedAt);
    withTransaction(() => {
      run('UPDATE players SET stamina_current = ?, stamina_updated_at = ?, updated_at = ? WHERE player_id = ?',
        [state.current + economy.STAMINA_SHARE_REWARD, state.updatedAt, claimedAt, user.player_id]);
      run('INSERT INTO stamina_share_claims (player_id, day_key, claim_id, claimed_at) VALUES (?, ?, ?, ?)',
        [user.player_id, dayKey, claimId, claimedAt]);
    });
    ensurePersisted();
    const fresh = get('SELECT * FROM players WHERE player_id = ?', [user.player_id]);
    ok(res, { awarded: economy.STAMINA_SHARE_REWARD, stamina: getStaminaState(fresh, claimedAt) });
  } catch (error) {
    fail(res, error.message || '领取分享体力失败', 500);
  }
});

app.post('/v1/cocos-zyx/games/settlements', (req, res) => {
  try {
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

    const startedRound = get('SELECT started_at, status, seed, is_tutorial FROM game_rounds WHERE player_id = ? AND round_id = ?', [user.player_id, roundId]);
    if (!startedRound) return fail(res, '对局未在服务端开始', 409, 'ROUND_NOT_STARTED');
    if (startedRound.status !== 'active') return fail(res, '此对局已结算', 409, 'ROUND_ALREADY_SETTLED');

    if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt)) return fail(res, '对局时间异常', 400, 'INVALID_ROUND_TIME');
    const duration = endedAt - startedAt;
    if (duration < economy.MIN_ROUND_DURATION_MS || duration > economy.MAX_ROUND_DURATION_MS) return fail(res, '对局时长异常', 400, 'INVALID_ROUND_DURATION');
    if (endedAt > now() + economy.MAX_FUTURE_SKEW_MS) return fail(res, '对局时间异常', 400, 'INVALID_ROUND_TIME');
    if (now() - startedRound.started_at < economy.MIN_ROUND_DURATION_MS) return fail(res, '对局时长异常', 400, 'ROUND_TOO_SHORT');
    // 离线补传窗口依据服务端记录的开局时间，客户端改本地时钟不能延长窗口。
    if (startedRound.started_at < now() - economy.MAX_OFFLINE_SETTLEMENT_AGE_MS) return fail(res, '对局超出离线补传窗口', 400, 'SETTLEMENT_TOO_OLD');

    // ---- 种子重放校验：服务端用相同种子重放操作序列，验证分数和心情豆 ----
    const actions = Array.isArray(req.body.actions) ? req.body.actions : [];
    if (actions.length > 0 && startedRound.seed) {
      const replayResult = replayRound(startedRound.seed, !!startedRound.is_tutorial, actions);
      if (!replayResult.valid) {
        return fail(res, '操作序列校验失败', 400, 'REPLAY_INVALID');
      }
      if (replayResult.score !== score || replayResult.collectedMoodBeans !== collectedMoodBeanCount) {
        console.warn(`[结算校验] 玩家 ${user.player_id} 局 ${roundId} 重放不一致: 提交 score=${score} beans=${collectedMoodBeanCount}, 重放 score=${replayResult.score} beans=${replayResult.collectedMoodBeans}`);
        return fail(res, '结算数据校验失败', 400, 'REPLAY_MISMATCH');
      }
    }

    const settledAt = now();
    // 一块一豆：基础心情豆 = 本局收集的带表情心情块数；额外奖励必须经服务端验证，第一版为 0。
    const baseMoodBeans = collectedMoodBeanCount;
    const bonusMoodBeans = 0;
    const awardedMoodBeans = baseMoodBeans + bonusMoodBeans;
    const gainedExperience = collectedMoodBeanCount;
    const experience = addExperience(user, gainedExperience);
    const highestScore = Math.max(user.highest_single_game_score, score);

    let resultData;
    // 结算记录与玩家进度同事务写入；单局最高分直接落在 players，排行榜实时读取，无需额外表。
    withTransaction(() => {
      run('INSERT INTO round_settlements (player_id, round_id, score, mood_token_count, awarded_mood_beans, payload_json, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.player_id, roundId, score, baseMoodBeans, awardedMoodBeans, payloadJson, '', settledAt]);
      run('UPDATE game_rounds SET status = ?, settled_at = ? WHERE player_id = ? AND round_id = ?',
        ['settled', settledAt, user.player_id, roundId]);
      run(`UPDATE players SET mood_bean_balance = mood_bean_balance + ?, total_mood_beans = total_mood_beans + ?,
           highest_single_game_score = ?, level = ?, experience = ?, updated_at = ? WHERE player_id = ?`,
        [awardedMoodBeans, awardedMoodBeans, highestScore, experience.level, experience.experience, settledAt, user.player_id]);
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
    const user = authenticate(req, res);
    if (!user) return;
    if (req.query.type && req.query.type !== 'power') return fail(res, '仅支持单局最高分排行榜', 400, 'LEADERBOARD_TYPE_UNSUPPORTED');
    ok(res, leaderboard(user));
  } catch (error) {
    fail(res, error.message || '读取排行榜失败', 500);
  }
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
       total_mood_beans = 0, highest_single_game_score = 0,
       stamina_current = ?, stamina_updated_at = ?, updated_at = ? WHERE player_id = ?`,
      [economy.STAMINA_MAX, updatedAt, updatedAt, user.player_id],
    );
    run('DELETE FROM round_settlements WHERE player_id = ?', [user.player_id]);
    run('DELETE FROM game_rounds WHERE player_id = ?', [user.player_id]);
    run('DELETE FROM stamina_share_claims WHERE player_id = ?', [user.player_id]);
    ensurePersisted();
    ok(res, { profile: safeProfile(get('SELECT * FROM players WHERE player_id = ?', [user.player_id])) });
  } catch (error) {
    fail(res, error.message || '重置账号失败', 500);
  }
});
}

app.use((_req, res) => fail(res, '接口不存在或已下线', 404, 'ENDPOINT_NOT_FOUND'));
app.use((error, _req, res, _next) => fail(res, error.type === 'entity.parse.failed' ? '请求 JSON 格式错误' : '请求处理失败', error.status || 500, 'REQUEST_INVALID'));

/** 初始化数据库（可选覆盖路径，供测试使用临时库）并返回可挂载的 app。 */
async function start(overrideDbPath) {
  if (overrideDbPath) dbPath = path.resolve(overrideDbPath);
  const SQL = await initSqlJs();
  db = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();
  migrateSchema(db);
  persistNow();
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
