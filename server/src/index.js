require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const initSqlJs = require('sql.js');
const { produceLine } = require('./difficulty');

const app = express();
const port = Number(process.env.PORT || 8080);
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '..', 'data', 'game.sqlite');
const appId = process.env.WECHAT_APP_ID || 'wxdc39c78bfd045896';
const appSecret = process.env.WECHAT_APP_SECRET || '';

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
let db;

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '64kb' }));

function ok(res, data) {
  res.json({ code: 0, data });
}

function fail(res, message, status = 400) {
  res.status(status).json({ code: status, message });
}

function clampInt(value, min, max) {
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

function newToken() {
  return crypto.randomBytes(24).toString('hex');
}

function devOpenId(seed) {
  const hash = crypto.createHash('sha256').update(seed || newToken()).digest('hex').slice(0, 24);
  return `dev_${hash}`;
}

async function codeToSession(code) {
  if (!code || !appSecret) {
    return { openid: devOpenId(code), unionid: '' };
  }

  const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
  url.searchParams.set('appid', appId);
  url.searchParams.set('secret', appSecret);
  url.searchParams.set('js_code', code);
  url.searchParams.set('grant_type', 'authorization_code');

  const response = await fetch(url);
  const data = await response.json();
  if (!data.openid) {
    throw new Error(`wechat login failed: ${data.errcode || 'unknown'}`);
  }
  return data;
}

function publicUser(user) {
  return {
    token: user.token,
    openId: user.openid,
    nickName: user.nick_name,
    avatar: user.avatar,
    lv: 1,
    exp: 0,
    expTar: 100,
    diamond: 0,
    flower: 0,
    bomb: 0,
    hammer: 3,
    drill: 0,
    scoreRecord: user.high_score,
    gameInfo: {
      adTimes: 3,
      score: 0,
      flower: 0,
      uniqueId: 9,
      difficultyLevel: 1,
      generatedRows: 0,
      noMergeStreak: 0,
      reliefRows: 0,
      clearCount: 0,
      drillSpawnCharge: 0,
      drillFragments: 0,
    },
  };
}

function findUserByToken(token) {
  if (!token) return null;
  return get('SELECT * FROM users WHERE token = ?', [token]);
}

function persist() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  try {
    if (!stmt.step()) return null;
    return stmt.getAsObject();
  } finally {
    stmt.free();
  }
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  try {
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally {
    stmt.free();
  }
}

// 全局排行榜缓存：最多保留前2000名
let rankCache = null;
let rankCacheAt = 0;
const RANK_CACHE_TTL = 10000; // 10秒缓存
const MAX_RANK_STORE = 2000;

function getGlobalRank() {
  const now = Date.now();
  if (rankCache && (now - rankCacheAt) < RANK_CACHE_TTL) {
    return rankCache;
  }
  rankCache = all(`
    SELECT
      ROW_NUMBER() OVER (ORDER BY high_score DESC, updated_at ASC) AS rank,
      id,
      nick_name AS nickName,
      avatar,
      high_score AS score
    FROM users
    WHERE high_score > 0
    LIMIT ${MAX_RANK_STORE}
  `);
  rankCacheAt = now;
  return rankCache;
}

function invalidateRankCache() {
  rankCache = null;
  rankCacheAt = 0;
}

function initSchema() {
  db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid TEXT NOT NULL UNIQUE,
    unionid TEXT,
    token TEXT NOT NULL UNIQUE,
    nick_name TEXT NOT NULL DEFAULT '消除玩家',
    avatar TEXT NOT NULL DEFAULT '',
    high_score INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_score ON users(high_score DESC, updated_at ASC);
  `);
  persist();
}

app.post(['/api/login', '/v1/xiaochu-fannao/api/login'], async (req, res) => {
  try {
    const now = Date.now();
    const token = String(req.body.token || '');
    const nickName = String(req.body.nickName || req.body.nickname || '消除玩家').slice(0, 32);
    const avatar = String(req.body.avatar || '').slice(0, 512);

    let user = findUserByToken(token);
    if (!user) {
      const session = await codeToSession(String(req.body.code || ''));
      user = get('SELECT * FROM users WHERE openid = ?', [session.openid]);

      if (!user) {
        const createdToken = newToken();
        run(`
          INSERT INTO users (openid, unionid, token, nick_name, avatar, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [session.openid, session.unionid || '', createdToken, nickName, avatar, now, now]);
        user = get('SELECT * FROM users WHERE token = ?', [createdToken]);
      }
    }

    run('UPDATE users SET nick_name = ?, avatar = ?, updated_at = ? WHERE id = ?',
      [nickName || user.nick_name, avatar || user.avatar, now, user.id]);
    user = get('SELECT * FROM users WHERE id = ?', [user.id]);
    ok(res, publicUser(user));
  } catch (error) {
    fail(res, error.message || 'login failed', 500);
  }
});

app.post(['/api/produce', '/v1/xiaochu-fannao/api/produce'], (req, res) => {
  const token = String(req.body.token || '');
  const user = findUserByToken(token);
  if (!user) {
    fail(res, 'invalid token', 401);
    return;
  }

  const result = produceLine({
    gridInfo: req.body.gridInfo,
    gameInfo: req.body.gameInfo,
    comboTimes: req.body.comboTimes,
    diamondInterval: req.body.diamondInterval,
  });
  ok(res, result);
});

app.post(['/api/score', '/v1/xiaochu-fannao/api/score'], (req, res) => {
  const token = String(req.body.token || '');
  const score = clampInt(req.body.score, 0, 2147483647);
  const user = findUserByToken(token);
  if (!user) {
    fail(res, 'invalid token', 401);
    return;
  }

  const highScore = Math.max(user.high_score, score);
  run('UPDATE users SET high_score = ?, updated_at = ? WHERE id = ?',
    [highScore, Date.now(), user.id]);

  invalidateRankCache();
  ok(res, { highScore });
});

app.get(['/api/leaderboard', '/v1/xiaochu-fannao/api/leaderboard'], (req, res) => {
  const limit = clampInt(req.query.limit, 1, 500);
  const token = String(req.query.token || '');

  const allRanks = getGlobalRank();
  const list = allRanks.slice(0, limit).map(({ id, ...item }) => item);

  let selfRank = 0;
  let selfScore = 0;
  const user = findUserByToken(token);
  if (user && user.high_score > 0) {
    selfScore = user.high_score;
    // 在全量排行中查找自己的排名（最多遍历2000条）
    for (let i = 0; i < allRanks.length; i++) {
      if (allRanks[i].id === user.id) {
        const rank = i + 1;
        selfRank = rank <= MAX_RANK_STORE ? rank : 0;
        break;
      }
    }
    // 如果上面没找到（边界情况），重新SQL查一次
    if (selfRank === 0) {
      const higher = get(`
        SELECT COUNT(*) AS cnt FROM users
        WHERE high_score > ?
          OR (high_score = ? AND updated_at < ?)
      `, [user.high_score, user.high_score, user.updated_at]);
      const rank = Number(higher.cnt || 0) + 1;
      selfRank = rank <= MAX_RANK_STORE ? rank : 0;
    }
  }

  ok(res, { list, selfRank, selfScore });
});

app.get(['/health', '/v1/xiaochu-fannao/health'], (_req, res) => {
  ok(res, { status: 'ok' });
});

async function main() {
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    db = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    db = new SQL.Database();
  }
  initSchema();

  app.listen(port, () => {
    console.log(`xiaochu-fannao server listening on ${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
