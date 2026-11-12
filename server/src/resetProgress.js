/** 仅供停服后的发布操作；没有 HTTP 入口。同一代际只重置一次，重试不会清空新进度。 */
const DATA_GENERATION = 'mood_bean_v5_20261112';
const { STAMINA_MAX } = require('./economyConfig');

function resetProgress(db, generation, at = Date.now()) {
  if (generation !== DATA_GENERATION) throw new Error('重置代际与当前发布不一致');
  const old = db.exec('SELECT generation FROM release_resets WHERE generation = ?', [generation]);
  if (old.length && old[0].values.length) return { reset: false, generation };
  const playerCount = Number(db.exec('SELECT COUNT(*) FROM players')[0].values[0][0]);
  db.run('BEGIN IMMEDIATE');
  try {
    // 保留身份、昵称、头像和单局最高分，排行榜顺序不变。资产版本递增，避免旧回执写回重置前的余额。
    db.run(`UPDATE players SET level = 1, experience = 0, mood_bean_balance = 0,
      total_mood_beans = 0, hammer_count = 0, wand_count = 0,
      stamina_current = ?, stamina_updated_at = ?, asset_revision = asset_revision + 1`,
    [STAMINA_MAX, at]);
    for (const table of ['round_settlements', 'game_rounds', 'stamina_share_claims', 'tool_transactions']) {
      db.run(`DELETE FROM ${table}`);
    }
    db.run('INSERT INTO release_resets (generation, applied_at, player_count) VALUES (?, ?, ?)', [generation, at, playerCount]);
    db.run('COMMIT');
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
  return { reset: true, generation, playerCount };
}

async function main() {
  const fs = require('fs');
  const path = require('path');
  const initSqlJs = require('sql.js');
  const { migrateSchema } = require('./schema');
  const file = process.argv[2];
  if (!file || process.argv[3] !== '--offline' || process.env.RESET_GAME_GENERATION !== DATA_GENERATION) {
    throw new Error('必须先停止本游戏 API、备份数据，再以 RESET_GAME_GENERATION 指定当前代际并传入数据库路径和 --offline');
  }
  const databasePath = path.resolve(file);
  if (!fs.existsSync(databasePath)) throw new Error('数据库不存在，拒绝创建空库代替重置');
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(databasePath));
  try {
    migrateSchema(db);
    const result = resetProgress(db, DATA_GENERATION);
    if (db.exec('PRAGMA integrity_check')[0].values[0][0] !== 'ok') throw new Error('重置后数据库完整性校验失败');
    const fd = fs.openSync(`${databasePath}.tmp`, 'w', 0o600);
    try { fs.writeFileSync(fd, Buffer.from(db.export())); fs.fsyncSync(fd); }
    finally { fs.closeSync(fd); }
    fs.renameSync(`${databasePath}.tmp`, databasePath);
    console.log(JSON.stringify({ ...result, integrity: 'ok' }));
  } finally { db.close(); }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { DATA_GENERATION, resetProgress };
