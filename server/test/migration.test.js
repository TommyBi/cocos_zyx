// 显式开启历史协议兼容性夹具；正式服务默认只允许当前规则新开局。
process.env.ALLOW_LEGACY_ROUND_STARTS = '1';
/** 旧数据库升级：保留核心资产，清理退役功能，新增体力。 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const initSqlJs = require('sql.js');
const { start } = require('../src/index.js');
const { migrateSchema } = require('../src/schema.js');

let server;
let baseUrl;
let dbFilePath;
let realDateNow;
const clock = Date.parse('2026-10-28T10:00:00.000Z');

test.before(async () => {
  realDateNow = Date.now;
  Date.now = () => clock;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-legacy-db-'));
  dbFilePath = path.join(tempDir, 'legacy.sqlite');
  const SQL = await initSqlJs();
  const old = new SQL.Database();
  old.run(`
    CREATE TABLE players (
      player_id TEXT PRIMARY KEY, device_id TEXT NOT NULL UNIQUE, token TEXT NOT NULL UNIQUE,
      nickname TEXT NOT NULL, avatar_url TEXT NOT NULL, level INTEGER NOT NULL,
      experience INTEGER NOT NULL, mood_bean_balance INTEGER NOT NULL,
      total_mood_beans INTEGER NOT NULL, highest_single_game_score INTEGER NOT NULL,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE round_settlements (
      round_id TEXT PRIMARY KEY, player_id TEXT NOT NULL, score INTEGER NOT NULL,
      mood_token_count INTEGER NOT NULL DEFAULT 0, awarded_mood_beans INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE weekly_stats (
      week_id TEXT NOT NULL, player_id TEXT NOT NULL,
      weekly_high_score INTEGER NOT NULL DEFAULT 0, weekly_high_score_at INTEGER NOT NULL DEFAULT 0,
      weekly_mood_beans INTEGER NOT NULL DEFAULT 0, weekly_mood_beans_at INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (week_id, player_id)
    );
    CREATE TABLE official_art_progress (player_id TEXT, art_id TEXT, filled_cells INTEGER);
    CREATE TABLE official_art_actions (player_id TEXT, action_id TEXT);
  `);
  old.run('INSERT INTO players VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['legacy_player', 'legacy_device', 'legacy_token', '旧玩家', '', 5, 3, 20, 80, 900, clock - 1000, clock - 1000]);
  old.run('INSERT INTO players VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['legacy_crafty', 'legacy_crafty_device', 'legacy_crafty_token', '狡猾的狐狸', '', 2, 8, 12, 30, 500, clock - 1000, clock - 1000]);
  old.run('INSERT INTO players VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['legacy_lazy', 'legacy_lazy_device', 'legacy_lazy_token', '慵懒的猫咪', '', 3, 9, 15, 40, 600, clock - 1000, clock - 1000]);
  old.run('INSERT INTO players VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['legacy_positive', 'legacy_positive_device', 'legacy_positive_token', '美丽的狐狸', '', 4, 10, 18, 50, 700, clock - 1000, clock - 1000]);
  old.run('INSERT INTO round_settlements (player_id, round_id, score, mood_token_count, awarded_mood_beans, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    ['legacy_player', 'legacy_round', 900, 60, 60, clock - 1000]);
  old.run("INSERT INTO weekly_stats VALUES ('2026-W44', 'legacy_player', 900, 100, 60, 100)");
  old.run('INSERT INTO official_art_progress VALUES (?, ?, ?)', ['legacy_player', 'old_art', 10]);
  fs.writeFileSync(dbFilePath, Buffer.from(old.export()));
  old.close();
  const app = await start(dbFilePath);
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  Date.now = realDateNow;
  await new Promise((resolve) => server.close(resolve));
});

test('旧档案余额不变，体力初始化 10，旧画作表被清理', async () => {
  const response = await fetch(`${baseUrl}/v1/cocos-zyx/players/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: 'legacy_device', nickname: '', avatarUrl: '' }),
  });
  assert.equal(response.status, 200);
  const data = (await response.json()).data;
  assert.equal(data.profile.moodBeanBalance, 20);
  assert.equal(data.profile.level, 5);
  assert.equal(data.profile.stamina.current, 10);
  const begin = await fetch(`${baseUrl}/v1/cocos-zyx/games/start`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` }, body: JSON.stringify({ roundId: 'migrated_round' }) });
  assert.equal(begin.status, 200);
  Date.now = () => clock + 10000;
  const settled = await fetch(`${baseUrl}/v1/cocos-zyx/games/settlements`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` }, body: JSON.stringify({ roundId: 'migrated_round', startedAt: clock, endedAt: clock + 10000, score: 0, collectedMoodBeanCount: 0 }) });
  assert.equal(settled.status, 200);
  const realm = await fetch(`${baseUrl}/v1/cocos-zyx/realm/state`, {
    headers: { Authorization: `Bearer ${data.token}` },
  });
  assert.equal(realm.status, 404);
  const SQL = await initSqlJs();
  const disk = new SQL.Database(fs.readFileSync(dbFilePath));
  assert.equal(disk.exec("SELECT name FROM sqlite_master WHERE name IN ('official_art_progress', 'official_art_actions', 'reward_mail', 'app_state')").length, 0);
  assert.equal(disk.exec('SELECT score FROM round_settlements')[0].values[0][0], 900);
  // 周榜表整体废弃，永久榜直接读取 players 的单局最高分，历史最高分保留。
  assert.equal(disk.exec("SELECT name FROM sqlite_master WHERE name = 'weekly_stats'").length, 0);
  assert.equal(disk.exec('SELECT highest_single_game_score FROM players')[0].values[0][0], 900);
  disk.close();
});

test('历史贬义随机昵称只替换前缀，正常昵称不变且迁移可重复执行', async () => {
  const SQL = await initSqlJs();
  const disk = new SQL.Database(fs.readFileSync(dbFilePath));
  const sql = "SELECT player_id, nickname FROM players WHERE player_id IN ('legacy_crafty', 'legacy_lazy', 'legacy_positive') ORDER BY player_id";
  const expected = [
    ['legacy_crafty', '机灵的狐狸'],
    ['legacy_lazy', '温柔的猫咪'],
    ['legacy_positive', '美丽的狐狸'],
  ];
  assert.deepEqual(disk.exec(sql)[0].values, expected);
  migrateSchema(disk);
  migrateSchema(disk);
  assert.deepEqual(disk.exec(sql)[0].values, expected);
  assert.equal(disk.exec("SELECT COUNT(*) FROM players WHERE substr(nickname, 1, 3) IN ('狡猾的', '慵懒的')")[0].values[0][0], 0);
  assert.equal(disk.exec("SELECT nickname FROM players WHERE player_id = 'legacy_player'")[0].values[0][0], '旧玩家');
  assert.equal(disk.exec('PRAGMA user_version')[0].values[0][0], 8);
  disk.close();
});

test('历史库中的新账号显式获得 10 点体力，不依赖旧列默认值', async () => {
  const response = await fetch(`${baseUrl}/v1/cocos-zyx/players/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: 'legacy_new_device' }),
  });
  assert.equal(response.status, 200);
  const data = (await response.json()).data;
  assert.equal(data.profile.stamina.current, 10);
  assert.equal(data.profile.stamina.max, 10);
});
