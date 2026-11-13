const test = require('node:test');
const assert = require('node:assert/strict');
const initSqlJs = require('sql.js');
const { createDefaultNickname, normalizeDefaultNickname, migrateDefaultNicknames } = require('../src/defaultNickname');
const { migrateSchema } = require('../src/schema');

test('默认名加入小字，已有小熊小鹿不重复，头像或非默认组合不变', () => {
  assert.equal(normalizeDefaultNickname('快乐的企鹅', ''), '快乐的小企鹅');
  assert.equal(normalizeDefaultNickname('美丽的小熊', ''), '美丽的小熊');
  assert.equal(normalizeDefaultNickname('恬静的小鹿', ''), '恬静的小鹿');
  assert.equal(normalizeDefaultNickname('快乐的小企鹅', ''), '快乐的小企鹅');
  assert.equal(normalizeDefaultNickname('快乐的企鹅', 'https://example.com/avatar.png'), '快乐的企鹅');
  assert.equal(normalizeDefaultNickname('我的企鹅', ''), '我的企鹅');
  assert.equal(normalizeDefaultNickname('狡猾的旅行家', ''), '狡猾的旅行家');
  assert.equal(normalizeDefaultNickname('解忧玩家', '', 'old-player'), normalizeDefaultNickname('解忧玩家', '', 'old-player'));
  assert.match(normalizeDefaultNickname('解忧玩家', '', 'old-player'), /^.{2}的小.+$/);
  for (let i = 0; i < 200; i++) {
    const name = createDefaultNickname();
    assert.match(name, /^.{2}的小.+$/);
    assert.ok(!name.includes('的小小'));
  }
});

test('全量迁移只修改白名单默认名和资产版本，不动排序、资产、身份或历史记录', async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  migrateSchema(db);
  const names = [['old', '快乐的企鹅', ''], ['small', '美丽的小熊', ''],
    ['custom', '我的企鹅', ''], ['authorized', '快乐的企鹅', 'https://example.com/avatar.png']];
  for (const [id, name, avatar] of names) {
    db.run(`INSERT INTO players(player_id,device_id,token,nickname,avatar_url,level,experience,
      mood_bean_balance,total_mood_beans,highest_single_game_score,hammer_count,wand_count,
      stamina_current,asset_revision,created_at,updated_at) VALUES(?,?,?,?,?,7,12,88,999,3440,2,3,6,15,100,200)`,
    [id, id, id, name, avatar]);
  }
  const before = db.exec('SELECT * FROM players ORDER BY player_id')[0];
  assert.equal(migrateDefaultNicknames(db), 1);
  assert.equal(migrateDefaultNicknames(db), 0);
  migrateSchema(db);
  const after = db.exec('SELECT * FROM players ORDER BY player_id')[0];
  const expected = before.values.map(row => {
    const copy = row.slice();
    if (copy[before.columns.indexOf('player_id')] === 'old') {
      copy[before.columns.indexOf('nickname')] = '快乐的小企鹅';
      copy[before.columns.indexOf('asset_revision')] += 1;
    }
    return copy;
  });
  assert.deepEqual(after.values, expected);
  db.close();
});
