/** 正式发布重置：清空进度和资产，保留排行榜所需的身份、昵称、头像和单局最高分。 */
const test = require('node:test');
const assert = require('node:assert/strict');
const initSqlJs = require('sql.js');
const { migrateSchema } = require('../src/schema');
const { DATA_GENERATION, resetProgress } = require('../src/resetProgress');

test('发布重置清空资产和对局，排行榜最高分与名次依据保持不变', async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  migrateSchema(db);
  db.run(`INSERT INTO players (
      player_id, device_id, token, nickname, avatar_url, level, experience,
      mood_bean_balance, total_mood_beans, highest_single_game_score,
      stamina_current, stamina_updated_at, hammer_count, wand_count, asset_revision,
      created_at, updated_at
    ) VALUES
    ('p1', 'd1', 't1', '榜首', 'https://cdn.example/a.png', 8, 40, 120, 300, 9000, 3, 10, 2, 1, 4, 100, 500),
    ('p2', 'd2', 't2', '第二', '', 2, 5, 7, 9, 1000, 10, 20, 0, 0, 1, 100, 400)`);
  db.run(`INSERT INTO game_rounds (player_id, round_id, started_at, status) VALUES ('p1', 'r1', 100, 'settled')`);
  db.run(`INSERT INTO round_settlements (
      player_id, round_id, score, mood_token_count, awarded_mood_beans, created_at
    ) VALUES ('p1', 'r1', 9000, 10, 1, 200)`);
  db.run(`INSERT INTO tool_transactions (
      player_id, action_id, kind, item, created_at
    ) VALUES ('p1', 'exchange_old', 'exchange', 'hammer', 200)`);

  const first = resetProgress(db, DATA_GENERATION, 999);
  assert.equal(first.reset, true);
  assert.equal(first.playerCount, 2);
  const rows = db.exec(`SELECT player_id, nickname, avatar_url, level, experience, mood_bean_balance,
      total_mood_beans, highest_single_game_score, stamina_current, hammer_count, wand_count, updated_at
      FROM players ORDER BY player_id`)[0].values;
  assert.deepEqual(rows, [
    ['p1', '榜首', 'https://cdn.example/a.png', 1, 0, 0, 0, 9000, 10, 0, 0, 500],
    ['p2', '第二', '', 1, 0, 0, 0, 1000, 10, 0, 0, 400],
  ]);
  for (const table of ['game_rounds', 'round_settlements', 'tool_transactions', 'stamina_share_claims']) {
    assert.equal(db.exec(`SELECT COUNT(*) FROM ${table}`)[0].values[0][0], 0);
  }
  const board = db.exec(`SELECT nickname, highest_single_game_score FROM players
      WHERE highest_single_game_score > 0 ORDER BY highest_single_game_score DESC, updated_at ASC`)[0].values;
  assert.deepEqual(board, [['榜首', 9000], ['第二', 1000]]);

  db.run('UPDATE players SET mood_bean_balance = 15 WHERE player_id = ?', ['p2']);
  const second = resetProgress(db, DATA_GENERATION, 1000);
  assert.deepEqual(second, { reset: false, generation: DATA_GENERATION });
  assert.equal(db.exec('SELECT mood_bean_balance FROM players WHERE player_id = \'p2\'')[0].values[0][0], 15);
  db.close();
});

test('重置发生异常时整笔回滚，错误代际不动数据，资产版本递增且同代际不重复重置', async () => {
  const SQL=await initSqlJs();const db=new SQL.Database();migrateSchema(db);
  db.run("INSERT INTO players(player_id,device_id,token,nickname,level,mood_bean_balance,highest_single_game_score,asset_revision,created_at,updated_at) VALUES ('p','d','t','保留身份',9,70,999,10,1,2)");
  assert.throws(()=>resetProgress(db,'wrong-generation'));
  const run=db.run.bind(db);
  db.run=(sql,...args)=>{if(sql.startsWith('INSERT INTO release_resets')) throw new Error('transaction fault');return run(sql,...args);};
  assert.throws(()=>resetProgress(db,DATA_GENERATION,100));db.run=run;
  assert.deepEqual(db.exec('SELECT level,mood_bean_balance,asset_revision FROM players')[0].values[0],[9,70,10]);
  resetProgress(db,DATA_GENERATION,101);
  assert.deepEqual(db.exec('SELECT player_id,token,level,mood_bean_balance,highest_single_game_score,asset_revision FROM players')[0].values[0],['p','t',1,0,999,11]);
  db.close();
});
