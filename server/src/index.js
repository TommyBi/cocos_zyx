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
const { BOARD_RULES_VERSION } = require('./boardEngine');
const { exchangeWeChatLoginCode } = require('./wechatAuth');

const app = express();
const port = Number(process.env.PORT || 8080);
let dbPath = path.resolve(process.env.DB_PATH || path.join(__dirname, '..', 'data', 'game.sqlite'));
const chinaOffsetMs = 8 * 60 * 60 * 1000;
let db;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
// 长局可获得多颗豆子，需要保留完整重放操作，不能因旧 32KB 上限丢弃结算。
app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  if (req.method === 'POST' && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
    return fail(res, '请求内容必须是 JSON 对象', 400, 'REQUEST_INVALID');
  }
  next();
});

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
      fs.writeFileSync(fd, Buffer.from(db.export()));
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
    assetRevision: user.asset_revision,
    inventory: { hammer: user.hammer_count, magicWand: user.wand_count },
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
    rank: rows.findIndex(other => other.value === row.value) + 1,
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
  ok(res, { ok: true, service: 'cocos-zyx-cloud', apiVersion: 8, schemaVersion: 8, capabilities: ['wechat-login', 'stamina', 'round-start', 'settlement', 'power-leaderboard', 'daily-share', 'bean-collection-progress', 'adaptive-combo-v2', 'bean-collection-1pct', 'bean-tool-shop', 'difficulty-ramp-2x', 'difficulty-pressure-v4', 'rising-rows-v5'], checkedAt: new Date().toISOString() });
});

app.post('/v1/cocos-zyx/players/bootstrap', async (req, res) => {
  try {
    const deviceId = stringValue(req.body.deviceId, 128);
    const loginCode = stringValue(req.body.loginCode, 128);
    if (!deviceId) return fail(res, '缺少设备标识', 400, 'DEVICE_ID_REQUIRED');

    // 微信端只信任服务端用一次性 code 换回的 openid；Web 预览才单独使用 deviceId。
    const wechatOpenId = loginCode ? await exchangeWeChatLoginCode(loginCode) : '';
    const deviceUser = get('SELECT * FROM players WHERE device_id = ?', [deviceId]);
    if (!wechatOpenId && deviceUser && deviceUser.wechat_openid) {
      return fail(res, '请通过微信重新登录', 401, 'WECHAT_LOGIN_REQUIRED');
    }
    let user = wechatOpenId
      ? get('SELECT * FROM players WHERE wechat_openid = ?', [wechatOpenId])
      : deviceUser;

    // 旧账号首次微信登录时原地绑定，保留 playerId、资产、分数和历史对局。
    if (!user && wechatOpenId && deviceUser && !deviceUser.wechat_openid) {
      run('UPDATE players SET wechat_openid = ?, updated_at = ?, asset_revision = asset_revision + 1 WHERE player_id = ?',
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
        run('UPDATE players SET nickname = ?, updated_at = ?, asset_revision = asset_revision + 1 WHERE player_id = ?',
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
    run('UPDATE players SET nickname = ?, avatar_url = ?, updated_at = ?, asset_revision = asset_revision + 1 WHERE player_id = ?',
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
    const collectionRule = req.body.collectionRule || 'legacy';
    const rulesVersion = req.body.rulesVersion === undefined ? 1 : Number(req.body.rulesVersion);
    if (![1, 2, 3, 4, BOARD_RULES_VERSION].includes(rulesVersion)) return fail(res, '不支持的棋盘规则', 400, 'BOARD_RULES_UNSUPPORTED');
    if (!['legacy', 'progress_v1', economy.MOOD_COLLECTION_RULE].includes(collectionRule)) return fail(res, '不支持的收集规则', 400, 'COLLECTION_RULE_UNSUPPORTED');

    const existing = get('SELECT status, seed, is_tutorial, collection_rule, rules_version, tool_rules_version FROM game_rounds WHERE player_id = ? AND round_id = ?', [user.player_id, roundId]);
    if (existing) {
      if (existing.status !== 'active') return fail(res, '此对局已结算', 409, 'ROUND_ALREADY_SETTLED');
      if (existing.rules_version !== rulesVersion) return fail(res, '对局棋盘规则不一致', 409, 'BOARD_RULES_UNSUPPORTED');
      if (existing.collection_rule !== collectionRule) return fail(res, '对局收集规则不一致', 409, 'ROUND_COLLECTION_RULE_CONFLICT');
      ensurePersisted();
      const fresh = get('SELECT * FROM players WHERE player_id = ?', [user.player_id]);
      return ok(res, {
        roundId,
        duplicate: true,
        stamina: getStaminaState(fresh),
        seed: existing.seed,
        isTutorial: !!existing.is_tutorial,
        collectionRule: existing.collection_rule,
        rulesVersion: existing.rules_version,
        profile: safeProfile(fresh),
      });
    }

    // 旧协议仅供历史局补传；不能再新建可直接提交原始奖励数的对局。
    if ((rulesVersion !== BOARD_RULES_VERSION || collectionRule !== economy.MOOD_COLLECTION_RULE)
      && process.env.ALLOW_LEGACY_ROUND_STARTS !== '1') {
      return fail(res, '请更新游戏后重新开始', 400, 'COLLECTION_RULE_UNSUPPORTED');
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
      run('UPDATE players SET stamina_current = ?, stamina_updated_at = ?, updated_at = ?, asset_revision = asset_revision + 1 WHERE player_id = ?',
        [spent, state.updatedAt, startedAt, user.player_id]);
      run('INSERT INTO game_rounds (player_id, round_id, started_at, status, seed, is_tutorial, collection_rule, rules_version, tool_rules_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
        [user.player_id, roundId, startedAt, 'active', seed, isTutorial ? 1 : 0, collectionRule, rulesVersion]);
      stamina = getStaminaState({ player_id: user.player_id, stamina_current: spent, stamina_updated_at: state.updatedAt }, startedAt);
    });
    ensurePersisted();
    ok(res, { roundId, stamina, seed, isTutorial, collectionRule, rulesVersion, profile: safeProfile(get('SELECT * FROM players WHERE player_id = ?', [user.player_id])) });
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
    const sameClaim = get('SELECT day_key FROM stamina_share_claims WHERE player_id = ? AND claim_id = ?', [user.player_id, claimId]);
    if (sameClaim) {
      ensurePersisted();
      const previousDay = sameClaim.day_key !== dayKey;
      return ok(res, { duplicate: true, awarded: previousDay ? 0 : economy.STAMINA_SHARE_REWARD,
        previousDay, stamina: getStaminaState(get('SELECT * FROM players WHERE player_id = ?', [user.player_id]), claimedAt) });
    }
    const existing = get('SELECT claim_id FROM stamina_share_claims WHERE player_id = ? AND day_key = ?', [user.player_id, dayKey]);
    if (existing) {
      ensurePersisted();
      const fresh = get('SELECT * FROM players WHERE player_id = ?', [user.player_id]);
      const stamina = getStaminaState(fresh, claimedAt);
      return res.status(429).json({
        code: 429,
        message: '今天的分享体力已经领取，明天再来吧',
        errorCode: 'STAMINA_SHARE_DAILY_LIMIT',
        data: { stamina },
      });
    }
    const state = getStaminaState(user, claimedAt);
    withTransaction(() => {
      run('UPDATE players SET stamina_current = ?, stamina_updated_at = ?, updated_at = ?, asset_revision = asset_revision + 1 WHERE player_id = ?',
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

/** 固定商品表；客户端不能指定价格、数量或库存基线。 */
const TOOL_COLUMNS = { hammer: 'hammer_count', magicWand: 'wand_count' };
const SHOP_PRICES = { hammer: 20, magicWand: 20, stamina: 5 };
function transactTool(req, res, kind) {
  try {
    const user = authenticate(req, res);
    if (!user) return;
    const { actionId, item } = req.body;
    if (typeof actionId !== 'string' || !/^[a-zA-Z0-9_:.-]{8,160}$/.test(actionId)
      || typeof item !== 'string' || !Object.prototype.hasOwnProperty.call(kind === 'exchange' ? SHOP_PRICES : TOOL_COLUMNS, item)) {
      return fail(res, '兑换或道具参数无效', 400, 'TOOL_REQUEST_INVALID');
    }
    const roundId = kind === 'exchange' ? '' : req.body.roundId;
    const actionIndex = kind === 'use' ? req.body.actionIndex : -1;
    const target = kind === 'use' ? req.body.target : -1;
    if (kind !== 'exchange' && (typeof roundId !== 'string' || roundId.length > 96 || !roundId)) {
      return fail(res, '缺少对局标识', 400, 'TOOL_REQUEST_INVALID');
    }
    if (kind === 'use' && (!Number.isSafeInteger(actionIndex) || actionIndex < 1 || actionIndex > 100000
      || !Number.isSafeInteger(target) || target < 0 || target > 1000000)) {
      return fail(res, '道具目标无效', 400, 'TOOL_REQUEST_INVALID');
    }
    const existing = get('SELECT * FROM tool_transactions WHERE player_id = ? AND action_id = ?', [user.player_id, actionId]);
    if (existing) {
      if (existing.kind !== kind || existing.item !== item || existing.round_id !== roundId
        || existing.action_index !== actionIndex || existing.target !== target) {
        return fail(res, '同一操作内容不一致', 409, 'TOOL_PAYLOAD_CONFLICT');
      }
      ensurePersisted();
      return ok(res, { duplicate: true, item, price: kind === 'exchange' ? SHOP_PRICES[item] : 0, profile: safeProfile(user) });
    }
    if (kind !== 'exchange') {
      const round = get('SELECT * FROM game_rounds WHERE player_id = ? AND round_id = ?', [user.player_id, roundId]);
      if (!round || round.status !== 'active' || round.started_at < now() - economy.MAX_OFFLINE_SETTLEMENT_AGE_MS) {
        return fail(res, '当前对局不可使用道具', 409, 'ROUND_NOT_ACTIVE');
      }
      if (kind === 'reward') {
        // 分享/广告补给沿用现有客户端完成回调，每局每种最多三次，限制重复伪造领取。
        const claims = get("SELECT COUNT(*) AS count FROM tool_transactions WHERE player_id = ? AND round_id = ? AND item = ? AND kind = 'reward'", [user.player_id, roundId, item]);
        if (claims.count >= 3) return fail(res, '本局该道具的三次补给已领完', 409, 'TOOL_REWARD_LIMIT');
      } else if (get("SELECT 1 FROM tool_transactions WHERE player_id = ? AND round_id = ? AND action_index = ? AND kind = 'use'", [user.player_id, roundId, actionIndex])) {
        return fail(res, '这一步已经使用过道具', 409, 'TOOL_PAYLOAD_CONFLICT');
      }
    }
    const column = TOOL_COLUMNS[item];
    const price = kind === 'exchange' ? SHOP_PRICES[item] : 0;
    if (kind === 'exchange' && user.mood_bean_balance < price) return fail(res, `开心豆不足，需要 ${price} 颗`, 409, 'BEANS_INSUFFICIENT');
    if (kind === 'use' && user[column] < 1) return fail(res, '道具库存不足', 409, 'TOOL_INSUFFICIENT');
    withTransaction(() => {
      const delta = kind === 'use' ? -1 : 1;
      if (item === 'stamina') {
        const at = now();
        const state = getStaminaState(user, at);
        run('UPDATE players SET mood_bean_balance = mood_bean_balance - ?, stamina_current = ?, stamina_updated_at = ?, asset_revision = asset_revision + 1, updated_at = ? WHERE player_id = ?',
          [price, state.current + 1, state.updatedAt, at, user.player_id]);
      } else {
        run(`UPDATE players SET mood_bean_balance = mood_bean_balance - ?, ${column} = ${column} + ?, asset_revision = asset_revision + 1, updated_at = ? WHERE player_id = ?`,
          [price, delta, now(), user.player_id]);
      }
      run('INSERT INTO tool_transactions (player_id, action_id, kind, item, round_id, action_index, target, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.player_id, actionId, kind, item, roundId, actionIndex, target, now()]);
    });
    ensurePersisted();
    ok(res, { item, price, profile: safeProfile(get('SELECT * FROM players WHERE player_id = ?', [user.player_id])) });
  } catch (error) { fail(res, error.message || '道具操作未确认，请重试', 500); }
}
app.post('/v1/cocos-zyx/shop/exchanges', (req, res) => transactTool(req, res, 'exchange'));
app.post('/v1/cocos-zyx/games/tools/use', (req, res) => transactTool(req, res, 'use'));
app.post('/v1/cocos-zyx/games/tools/reward', (req, res) => transactTool(req, res, 'reward'));

app.post('/v1/cocos-zyx/games/settlements', (req, res) => {
  try {
    const user = authenticate(req, res);
    if (!user) return;
    const roundId = stringValue(req.body.roundId, 96);
    if (!roundId) return fail(res, '缺少对局标识');
    const startedAt = Number(req.body.startedAt);
    const endedAt = Number(req.body.endedAt);
    const score = clampInt(req.body.score, 0, 1000000);
    // 历史字段名表示带表情块原始数，不是奖励豆子数。
    const collectedMoodBeanCount = Number(req.body.collectedMoodBeanCount);
    if (!Number.isSafeInteger(collectedMoodBeanCount) || collectedMoodBeanCount < 0
      || collectedMoodBeanCount > economy.MAX_COLLECTED_MOOD_BLOCKS_PER_ROUND) return fail(res, '收集数量异常', 400, 'COLLECTION_COUNT_INVALID');
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

    const startedRound = get('SELECT started_at, status, seed, is_tutorial, collection_rule, rules_version, tool_rules_version FROM game_rounds WHERE player_id = ? AND round_id = ?', [user.player_id, roundId]);
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
    if (actions.length > 100000) return fail(res, '操作序列过长', 400, 'REPLAY_INVALID');
    if (startedRound.rules_version >= 5) {
      // 救场分享尚无平台侧验签，但不能凭伪造动作无限清屏/复活绕过上升压力。
      // UI 每60秒最多出现一次清屏，复活每局一次且固定清理顶部8排。
      const clearCount = actions.filter(action => action && action.type === 'clear').length;
      const revives = actions.filter(action => action && action.type === 'revive');
      const elapsed = Math.max(0, Math.min(duration, now() - startedRound.started_at));
      if (clearCount > 1 + Math.floor(elapsed / 60000) || revives.length > 1
        || revives.some(action => action.rowCount !== 8)) {
        return fail(res, '救场次数或范围异常', 400, 'REPLAY_INVALID');
      }
    }
    // 新规则中，每一次道具操作都必须有已经扣库存的服务端凭据。
    if (startedRound.tool_rules_version === 1) {
      for (let index = 0; index < actions.length; index++) {
        const action = actions[index];
        if (!action || !['hammer', 'purify'].includes(action.type)) continue;
        const use = get("SELECT item, target FROM tool_transactions WHERE player_id = ? AND round_id = ? AND kind = 'use' AND action_index = ?",
          [user.player_id, roundId, index]);
        if (!use || use.item !== (action.type === 'hammer' ? 'hammer' : 'magicWand')
          || use.target !== (action.type === 'hammer' ? action.id : action.color)) {
          return fail(res, '道具使用记录未确认', 400, 'REPLAY_INVALID');
        }
      }
    }
    const progressRule = ['progress_v1', economy.MOOD_COLLECTION_RULE].includes(startedRound.collection_rule);
    if ((startedRound.rules_version >= 2 || (progressRule && collectedMoodBeanCount > 0))
      && (!actions.length || !startedRound.seed)) {
      return fail(res, '收集结算缺少重放操作', 400, 'REPLAY_INVALID');
    }
    if (!progressRule && collectedMoodBeanCount > economy.MAX_COLLECTED_MOOD_BEANS_PER_ROUND) return fail(res, '收集数量异常', 400, 'COLLECTION_COUNT_INVALID');
    if (actions.length > 0 && startedRound.seed) {
      const replayResult = replayRound(startedRound.seed, !!startedRound.is_tutorial, actions, startedRound.rules_version);
      if (!replayResult.valid) {
        return fail(res, '操作序列校验失败', 400, 'REPLAY_INVALID');
      }
      if (replayResult.score !== score || replayResult.collectedMoodBeans !== collectedMoodBeanCount) {
        console.warn(`[结算校验] 玩家 ${user.player_id} 局 ${roundId} 重放不一致: 提交 score=${score} beans=${collectedMoodBeanCount}, 重放 score=${replayResult.score} beans=${replayResult.collectedMoodBeans}`);
        return fail(res, '结算数据校验失败', 400, 'REPLAY_MISMATCH');
      }
    }

    const settledAt = now();
    // 每局独立换算整颗开心豆；保留旧客户端与历史开局的结算协议。
    const baseMoodBeans = progressRule ? economy.collectedBlocksToBeans(collectedMoodBeanCount, startedRound.collection_rule) : collectedMoodBeanCount;
    const bonusMoodBeans = 0;
    const awardedMoodBeans = baseMoodBeans + bonusMoodBeans;
    const gainedExperience = collectedMoodBeanCount;
    const experience = addExperience(user, gainedExperience);
    const highestScore = Math.max(user.highest_single_game_score, score);

    let resultData;
    // 结算记录与玩家进度同事务写入；单局最高分直接落在 players，排行榜实时读取，无需额外表。
    withTransaction(() => {
      run('INSERT INTO round_settlements (player_id, round_id, score, mood_token_count, awarded_mood_beans, payload_json, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.player_id, roundId, score, collectedMoodBeanCount, awardedMoodBeans, payloadJson, '', settledAt]);
      run('UPDATE game_rounds SET status = ?, settled_at = ? WHERE player_id = ? AND round_id = ?',
        ['settled', settledAt, user.player_id, roundId]);
      run(`UPDATE players SET mood_bean_balance = mood_bean_balance + ?, total_mood_beans = total_mood_beans + ?,
           highest_single_game_score = ?, level = ?, experience = ?, updated_at = ?, asset_revision = asset_revision + 1 WHERE player_id = ?`,
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
       level = ?, experience = ?, highest_single_game_score = ?, hammer_count = ?, wand_count = ?, updated_at = ?, asset_revision = asset_revision + 1 WHERE player_id = ?`,
      [balance, total, level, experience, highScore, req.body.hammerCount === undefined ? user.hammer_count : clampInt(req.body.hammerCount, 0, 100000), req.body.magicWandCount === undefined ? user.wand_count : clampInt(req.body.magicWandCount, 0, 100000), updatedAt, user.player_id],
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
    withTransaction(() => {
      run(
        `UPDATE players SET level = 1, experience = 0, mood_bean_balance = 0,
         total_mood_beans = 0, highest_single_game_score = 0, hammer_count = 0, wand_count = 0,
         stamina_current = ?, stamina_updated_at = ?, updated_at = ?, asset_revision = asset_revision + 1 WHERE player_id = ?`,
        [economy.STAMINA_MAX, updatedAt, updatedAt, user.player_id],
      );
      run('DELETE FROM round_settlements WHERE player_id = ?', [user.player_id]);
      run('DELETE FROM game_rounds WHERE player_id = ?', [user.player_id]);
      run('DELETE FROM stamina_share_claims WHERE player_id = ?', [user.player_id]);
      run('DELETE FROM tool_transactions WHERE player_id = ?', [user.player_id]);
    });
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
