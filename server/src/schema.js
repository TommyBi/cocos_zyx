/** 核心消除版本的唯一数据库结构与迁移入口。迁移与持久化成功后才能监听端口。 */
const { migrateDefaultNicknames } = require('./defaultNickname');
function migrateSchema(db) {
  db.run('BEGIN IMMEDIATE');
  try {
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        player_id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL UNIQUE,
        wechat_openid TEXT,
        token TEXT NOT NULL UNIQUE,
        nickname TEXT NOT NULL DEFAULT '解忧玩家',
        avatar_url TEXT NOT NULL DEFAULT '',
        level INTEGER NOT NULL DEFAULT 1,
        experience INTEGER NOT NULL DEFAULT 0,
        mood_bean_balance INTEGER NOT NULL DEFAULT 0,
        total_mood_beans INTEGER NOT NULL DEFAULT 0,
        highest_single_game_score INTEGER NOT NULL DEFAULT 0,
        stamina_current INTEGER NOT NULL DEFAULT 10,
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
      CREATE INDEX IF NOT EXISTS idx_players_high_score ON players(highest_single_game_score DESC);
      CREATE TABLE IF NOT EXISTS release_resets (
        generation TEXT PRIMARY KEY,
        applied_at INTEGER NOT NULL,
        player_count INTEGER NOT NULL
      );
    `);
    // 原地升级保留玩家资产和已结算对局。
    const playerColumns = db.exec('PRAGMA table_info(players)')[0].values.map((row) => row[1]);
    if (!playerColumns.includes('stamina_current')) db.run('ALTER TABLE players ADD COLUMN stamina_current INTEGER NOT NULL DEFAULT 10');
    if (!playerColumns.includes('stamina_updated_at')) db.run('ALTER TABLE players ADD COLUMN stamina_updated_at INTEGER NOT NULL DEFAULT 0');
    if (!playerColumns.includes('wechat_openid')) db.run('ALTER TABLE players ADD COLUMN wechat_openid TEXT');
    for (const column of ['hammer_count', 'wand_count', 'revive_card_count', 'asset_revision', 'security_version']) {
      if (!playerColumns.includes(column)) db.run(`ALTER TABLE players ADD COLUMN ${column} INTEGER NOT NULL DEFAULT 0`);
    }
    db.run(`CREATE TABLE IF NOT EXISTS tool_transactions (
      player_id TEXT NOT NULL, action_id TEXT NOT NULL, kind TEXT NOT NULL,
      item TEXT NOT NULL, round_id TEXT NOT NULL DEFAULT '', action_index INTEGER NOT NULL DEFAULT -1,
      target INTEGER NOT NULL DEFAULT -1, created_at INTEGER NOT NULL,
      PRIMARY KEY (player_id, action_id)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_tool_round_action ON tool_transactions(player_id, round_id, action_index)
      WHERE kind = 'use';`);
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_players_wechat_openid ON players(wechat_openid) WHERE wechat_openid IS NOT NULL AND wechat_openid <> \'\'');
    db.run(`CREATE TABLE IF NOT EXISTS round_checkpoints (
      player_id TEXT NOT NULL, round_id TEXT NOT NULL,
      actions_json TEXT NOT NULL, operation_count INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0, collected_blocks INTEGER NOT NULL DEFAULT 0,
      elapsed_ms INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL,
      session_token TEXT NOT NULL, resume_generation INTEGER NOT NULL DEFAULT 0,
      resume_request_id TEXT NOT NULL DEFAULT '', resume_payload_hash TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (player_id, round_id)
    );`);

    migrateDefaultNicknames(db);

    const roundColumns = db.exec('PRAGMA table_info(game_rounds)')[0].values.map((row) => row[1]);
    if (!roundColumns.includes('seed')) db.run('ALTER TABLE game_rounds ADD COLUMN seed INTEGER NOT NULL DEFAULT 0');
    if (!roundColumns.includes('is_tutorial')) db.run('ALTER TABLE game_rounds ADD COLUMN is_tutorial INTEGER NOT NULL DEFAULT 0');
    // 已开局和历史补传继续使用原规则，新客户端显式选择进度规则。
    if (!roundColumns.includes('collection_rule')) db.run("ALTER TABLE game_rounds ADD COLUMN collection_rule TEXT NOT NULL DEFAULT 'legacy'");

    if (!roundColumns.includes('rules_version')) db.run('ALTER TABLE game_rounds ADD COLUMN rules_version INTEGER NOT NULL DEFAULT 1');
    // 在途旧局保持原道具校验协议，新局才强制服务端扣库存凭据。
    if (!roundColumns.includes('tool_rules_version')) db.run('ALTER TABLE game_rounds ADD COLUMN tool_rules_version INTEGER NOT NULL DEFAULT 0');

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
    // 周排行榜改为永久单局最高分榜，直接读取 players.highest_single_game_score，周表整体废弃。
    db.run(`
      DROP TABLE IF EXISTS official_art_actions;
      DROP TABLE IF EXISTS official_art_progress;
      DROP TABLE IF EXISTS reward_mail;
      DROP TABLE IF EXISTS app_state;
      DROP TABLE IF EXISTS weekly_stats;
      DROP INDEX IF EXISTS idx_week_happiness;
      DROP INDEX IF EXISTS idx_week_power;
    `);
    // 返还与清库存同一事务；版本标记和逐玩家凭据一起提交。
    db.run(`CREATE TABLE IF NOT EXISTS tool_inventory_refunds (
      player_id TEXT PRIMARY KEY, hammer_count INTEGER NOT NULL, wand_count INTEGER NOT NULL,
      awarded_beans INTEGER NOT NULL, created_at INTEGER NOT NULL
    );`);
    const schemaVersion = Number(db.exec('PRAGMA user_version')[0].values[0][0]);
    if (schemaVersion < 11) {
      db.run(`INSERT OR IGNORE INTO tool_inventory_refunds (player_id, hammer_count, wand_count, awarded_beans, created_at)
        SELECT player_id, hammer_count, wand_count, (hammer_count + wand_count) * 3,
          CAST(strftime('%s','now') AS INTEGER) * 1000 FROM players;
        UPDATE players SET mood_bean_balance = mood_bean_balance + (hammer_count + wand_count) * 3,
          hammer_count = 0, wand_count = 0, asset_revision = asset_revision + 1
          WHERE hammer_count > 0 OR wand_count > 0;`);
    }
    if (!roundColumns.includes('security_version')) db.run('ALTER TABLE game_rounds ADD COLUMN security_version INTEGER NOT NULL DEFAULT 0');
    db.run(`CREATE TABLE IF NOT EXISTS reward_intents (
      intent_id TEXT PRIMARY KEY, player_id TEXT NOT NULL, round_id TEXT NOT NULL,
      placement TEXT NOT NULL, action_index INTEGER NOT NULL, effect_type TEXT NOT NULL,
      session_hash TEXT NOT NULL, issued_at INTEGER NOT NULL, min_claim_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL, completed_at INTEGER, consumed_at INTEGER, claim_key TEXT NOT NULL DEFAULT '',
      UNIQUE(player_id, round_id, placement, action_index)
    );
    CREATE INDEX IF NOT EXISTS idx_reward_round ON reward_intents(player_id, round_id, action_index);
    CREATE TABLE IF NOT EXISTS risk_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, event_key TEXT NOT NULL UNIQUE,
      player_id TEXT NOT NULL, round_id TEXT NOT NULL, code TEXT NOT NULL,
      category TEXT NOT NULL, weight INTEGER NOT NULL, occurrences INTEGER NOT NULL DEFAULT 1,
      first_seen INTEGER NOT NULL, last_seen INTEGER NOT NULL, evidence_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_risk_player_time ON risk_events(player_id, last_seen);
    CREATE TABLE IF NOT EXISTS risk_reviews (
      player_id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'pending', notes TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS risk_admin_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, actor TEXT NOT NULL,
      created_at INTEGER NOT NULL, detail_json TEXT NOT NULL
    );`);
    db.run('PRAGMA user_version = 12');
    db.run('COMMIT');
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
}
module.exports = { migrateSchema };
