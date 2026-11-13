const crypto = require('node:crypto');

const ADJECTIVES = ['美丽的', '快乐的', '勇敢的', '温柔的', '机灵的', '幸运的', '恬静的', '活泼的', '善良的', '可爱的'];
const ANIMALS = ['狐狸', '天鹅', '小熊', '猫咪', '兔子', '企鹅', '小鹿', '松鼠', '熊猫', '海豚', '柴犬', '考拉'];
const LEGACY_ADJECTIVES = { 狡猾的: '机灵的', 慵懒的: '温柔的' };
const replacements = new Map();
for (const adjective of [...ADJECTIVES, ...Object.keys(LEGACY_ADJECTIVES)]) {
  for (const animal of ANIMALS) {
    replacements.set(adjective + animal,
      (LEGACY_ADJECTIVES[adjective] || adjective) + (animal.startsWith('小') ? animal : '小' + animal));
  }
}

function createDefaultNickname() {
  const adjective = ADJECTIVES[crypto.randomInt(ADJECTIVES.length)];
  const animal = ANIMALS[crypto.randomInt(ANIMALS.length)];
  return adjective + (animal.startsWith('小') ? animal : '小' + animal);
}

function normalizeDefaultNickname(nickname, avatarUrl, playerId) {
  // 只识别原生成器的完整白名单组合；已授权头像及其他昵称均保留。
  if (avatarUrl) return nickname;
  if (playerId && ['解忧玩家', '顺心朋友'].includes(nickname)) {
    // 最早的通用默认名使用账号哈希分配，离线演练与实际迁移得到同一结果。
    const seed = crypto.createHash('sha256').update(playerId).digest();
    const animal = ANIMALS[seed[1] % ANIMALS.length];
    return ADJECTIVES[seed[0] % ADJECTIVES.length] + (animal.startsWith('小') ? animal : '小' + animal);
  }
  return replacements.get(nickname) || nickname;
}

function migrateDefaultNicknames(db) {
  const rows = db.exec('SELECT player_id, nickname, avatar_url FROM players')[0]?.values || [];
  let changed = 0;
  for (const [playerId, nickname, avatarUrl] of rows) {
    const next = normalizeDefaultNickname(nickname, avatarUrl, playerId);
    if (next === nickname) continue;
    // updated_at 参与同分排序，改名不能改变排行；版本递增以通知旧客户端刷新资料。
    db.run('UPDATE players SET nickname = ?, asset_revision = asset_revision + 1 WHERE player_id = ? AND nickname = ?',
      [next, playerId, nickname]);
    changed += db.getRowsModified();
  }
  return changed;
}

module.exports = { createDefaultNickname, normalizeDefaultNickname, migrateDefaultNicknames };
