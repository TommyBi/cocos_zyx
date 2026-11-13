/** 离线核对迁移前后核心业务数据；昵称只允许预期的贬义前缀修正，不输出档案或令牌。 */
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const initSqlJs = require('sql.js');
const { migrateSchema } = require('./schema');
const { normalizeDefaultNickname } = require('./defaultNickname');
function digest(db, sql, transform = row => row) {
  const rows = db.exec(sql)[0]?.values || [];
  return { count: rows.length, sha256: crypto.createHash('sha256').update(JSON.stringify(rows.map(transform))).digest('hex') };
}
function core(db) {
  return {
    players: digest(db, `SELECT player_id, device_id, token,
      nickname,
      avatar_url, level, experience, mood_bean_balance, total_mood_beans, highest_single_game_score, created_at, updated_at
      FROM players ORDER BY player_id`, row => {
        row[3] = normalizeDefaultNickname(row[3], row[4], row[0]);
        return row;
      }),
    settlements: digest(db, 'SELECT player_id, round_id, score, mood_token_count, awarded_mood_beans, created_at FROM round_settlements ORDER BY player_id, round_id'),
    leaderboard: digest(db, 'SELECT player_id, highest_single_game_score FROM players ORDER BY player_id'),
  };
}
(async () => {
  const SQL = await initSqlJs();
  const before = new SQL.Database(fs.readFileSync(process.argv[2]));
  const after = process.argv[3] ? new SQL.Database(fs.readFileSync(process.argv[3])) : before;
  const expected = core(before);
  if (!process.argv[3]) migrateSchema(after); // 用真实库副本演练，不写回文件。
  assert.deepEqual(core(after), expected, '迁移改变了核心业务数据');
  assert.equal(after.exec("SELECT name FROM sqlite_master WHERE name IN ('official_art_progress','official_art_actions','reward_mail','app_state')").length, 0);
  assert.equal(after.exec('PRAGMA integrity_check')[0].values[0][0], 'ok');
  console.log(JSON.stringify({ preserved: expected, integrity: 'ok', retiredTables: 0 }));
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
