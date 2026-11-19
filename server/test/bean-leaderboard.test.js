const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const initSqlJs = require('sql.js');
const { migrateSchema } = require('../src/schema');
const { start } = require('../src/index');

test('开心榜只按余额排名：消费后下降、累计获得量不参与、同余额并列且最高分榜保持独立', async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  migrateSchema(db);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-bean-board-')), 'test.sqlite');
  for (const [id, score, balance, total] of [
    ['a', 900, 32, 100], ['b', 100, 60, 60], ['c', 2000, 30, 9000],
    ['d', 0, 60, 60], ['zero', 0, 0, 999999],
  ]) {
    db.run(`INSERT INTO players(player_id,device_id,token,nickname,highest_single_game_score,
      mood_bean_balance,total_mood_beans,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)`,
    [id, id, id, id, score, balance, total, 1, 1]);
  }
  fs.writeFileSync(file, Buffer.from(db.export()));
  db.close();
  const app = await start(file), server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/v1/cocos-zyx`;
  async function request(route, token = 'a', body) {
    const response = await fetch(base + route, { method: body ? 'POST' : 'GET',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, payload: await response.json() };
  }
  try {
    const power = (await request('/leaderboards?type=power')).payload.data;
    assert.deepEqual(power.entries.map(e => e.playerId), ['c', 'a', 'b']);
    const beans = (await request('/leaderboards?type=beans')).payload.data;
    assert.deepEqual(beans.entries.map(e => [e.playerId, e.value, e.rank]),
      [['b', 60, 1], ['d', 60, 1], ['a', 32, 3], ['c', 30, 4]]);
    assert.equal(beans.self.value, 32);
    assert.equal(beans.self.rank, 3);
    assert.equal(beans.self.bestScore, 900);
    assert.equal(beans.self.moodBeanBalance, 32);
    const bought = await request('/shop/exchanges', 'a', { actionId: 'spend-for-rank', item: 'stamina' });
    assert.equal(bought.status, 200);
    const spent = (await request('/leaderboards?type=beans')).payload.data;
    assert.equal(spent.self.value, 29);
    assert.equal(spent.self.rank, 4);
    assert.equal(spent.entries.find(e => e.playerId === 'a').value, 29);
    assert.deepEqual((await request('/leaderboards?type=power')).payload.data.entries, power.entries);
    const zero = (await request('/leaderboards?type=beans', 'zero')).payload.data.self;
    assert.equal(zero.value, 0);
    assert.equal(zero.rank, null);
    assert.equal(zero.onBoard, false);
    assert.equal((await request('/leaderboards?type=happiness')).status, 400);
    assert.equal((await request('/leaderboards?type=beans', 'wrong-token')).status, 401);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
