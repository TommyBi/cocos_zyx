/** 在受保护的服务器终端对一致数据库快照导出；不导出账号/对局令牌。 */
const fs = require('node:fs');
const path = require('node:path');
const initSqlJs = require('sql.js');
const { riskSummaries, toCsv } = require('./riskControl');
async function main() {
  const args = process.argv.slice(2), option = name => args[args.indexOf(name) + 1];
  if (!args.includes('--db') || !args.includes('--output')) throw Error('用法: node src/exportRisk.js --db snapshot.sqlite --output private.json [--format json|csv] [--include-openid]');
  const format = args.includes('--format') ? option('--format') : 'json';
  if (!['json', 'csv'].includes(format)) throw Error('格式只能为json或csv');
  const SQL = await initSqlJs(), db = new SQL.Database(fs.readFileSync(option('--db')));
  try {
    const all = (sql, params) => { const stmt = db.prepare(sql); stmt.bind(params); const rows = []; try { while (stmt.step()) rows.push(stmt.getAsObject()); } finally { stmt.free(); } return rows; };
    const rows = riskSummaries(all, { limit: 2147483647, includeOpenId: args.includes('--include-openid') });
    const output = path.resolve(option('--output'));
    fs.writeFileSync(output, format === 'csv' ? toCsv(rows) : JSON.stringify({ exportedAt: Date.now(), users: rows }, null, 2), { mode: 0o600, flag: 'wx' });
    console.log(JSON.stringify({ exported: rows.length, path: output }));
  } finally { db.close(); }
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
