/** 核心消除版本的唯一数据库结构与迁移入口。迁移与持久化成功后才能监听端口。 */
function migrateSchema(db) {
  db.run('BEGIN IMMEDIATE');
  try {
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
        stamina_current INTEGER NOT NULL DEFAULT 30,
        stamina_updated_at INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS game_rounds (
        player_id TEXT NOT NULL,
        round_id TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        settled_at INTEGER,
        PRIMARY KEY (player_id, round_id)
      );
      CREATE TABLE IF NOT EXISTS stamina_share_claims (
        player_id TEXT NOT NULL,
        day_key TEXT NOT NULL,
        claim_id TEXT NOT NULL,
        claimed_at INTEGER NOT NULL,
        PRIMARY KEY (player_id, day_key),
        UNIQUE (player_id, claim_id)
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
        PRIMARY KEY (week_id, player_id)
      );
      CREATE INDEX IF NOT EXISTS idx_week_power ON weekly_stats(week_id, weekly_high_score DESC, weekly_high_score_at ASC);
    `);
    // 原地升级保留玩家资产和已结算对局。
    const playerColumns = db.exec('PRAGMA table_info(players)')[0].values.map((row) => row[1]);
    if (!playerColumns.includes('stamina_current')) db.run('ALTER TABLE players ADD COLUMN stamina_current INTEGER NOT NULL DEFAULT 30');
    if (!playerColumns.includes('stamina_updated_at')) db.run('ALTER TABLE players ADD COLUMN stamina_updated_at INTEGER NOT NULL DEFAULT 0');

    const settlementColumns = db.exec('PRAGMA table_info(round_settlements)')[0].values.map((row) => row[1]);
    // 最早的线上库以 round_id 单列为主键，尚无幂等快照；统一迁移到玩家作用域。
    if (!settlementColumns.includes('id') || !settlementColumns.includes('payload_json') || !settlementColumns.includes('result_json')) {
      db.run(`
        CREATE TABLE round_settlements_core (
          id INTEGER PRIMARY KEY AUTOINCREMENT, player_id TEXT NOT NULL, round_id TEXT NOT NULL,
          score INTEGER NOT NULL, mood_token_count INTEGER NOT NULL DEFAULT 0,
          awarded_mood_beans INTEGER NOT NULL DEFAULT 0, payload_json TEXT NOT NULL DEFAULT '',
          result_json TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL,
          UNIQUE (player_id, round_id)
        );
        INSERT INTO round_settlements_core
          (player_id, round_id, score, mood_token_count, awarded_mood_beans, payload_json, result_json, created_at)
          SELECT player_id, round_id, score, mood_token_count, awarded_mood_beans,
            ${settlementColumns.includes('payload_json') ? 'payload_json' : "''"},
            ${settlementColumns.includes('result_json') ? 'result_json' : "''"}, created_at
          FROM round_settlements;
        DROP TABLE round_settlements;
        ALTER TABLE round_settlements_core RENAME TO round_settlements;
      `);
    }

    // 这些功能已退役。玩家余额、经验、最高分与历史结算均保留，不返还旧投入。
    db.run(`
      DROP TABLE IF EXISTS official_art_actions;
      DROP TABLE IF EXISTS official_art_progress;
      DROP TABLE IF EXISTS reward_mail;
      DROP TABLE IF EXISTS app_state;
      DROP INDEX IF EXISTS idx_week_happiness;
    `);
    const weeklyColumns = db.exec('PRAGMA table_info(weekly_stats)')[0].values.map((row) => row[1]);
    if (weeklyColumns.includes('weekly_mood_beans')) {
      db.run(`
        CREATE TABLE weekly_stats_core (
          week_id TEXT NOT NULL, player_id TEXT NOT NULL,
          weekly_high_score INTEGER NOT NULL DEFAULT 0,
          weekly_high_score_at INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (week_id, player_id)
        );
        INSERT INTO weekly_stats_core SELECT week_id, player_id, weekly_high_score, weekly_high_score_at FROM weekly_stats;
        DROP TABLE weekly_stats;
        ALTER TABLE weekly_stats_core RENAME TO weekly_stats;
        CREATE INDEX idx_week_power ON weekly_stats(week_id, weekly_high_score DESC, weekly_high_score_at ASC);
      `);
    }
    db.run('PRAGMA user_version = 2');
    db.run('COMMIT');
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
}
module.exports = { migrateSchema };
