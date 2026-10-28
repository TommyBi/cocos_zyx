/**
 * R3：暂停菜单「重新开始」直接放弃本局，不是一种结算方式。
 *
 * - restartFromPause 不得调用 finishRound / 结算提交 / 待提交入队；
 * - 结算面板的「再来一次」仍然先结算上一局（回归保护，防止误删正常链路）。
 *
 * 运行：npm run test:module（仓库根目录）
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const zyxGameSource = path.join(repoRoot, 'assets', 'script', 'zyxGame', 'ZyxGame.ts');
const mainSceneSource = path.join(repoRoot, 'assets', 'script', 'GameMainScene.ts');

function extractMethod(source, signature) {
  const match = source.match(new RegExp(`${signature} \\{([\\s\\S]*?)\\n    \\}`));
  return match ? match[1] : null;
}

test('暂停重开不结算：restartFromPause 不触达任何结算与入队入口', () => {
  const source = fs.readFileSync(zyxGameSource, 'utf8');
  const body = extractMethod(source, 'private restartFromPause\\(\\): void');
  assert.ok(body !== null, '未找到 ZyxGame.restartFromPause');
  assert.ok(!body.includes('finishRound'), '暂停重开不得调用 finishRound()');
  assert.ok(!body.includes('onSettlementExit'), '暂停重开不得触发结算退出回调');
  assert.ok(!body.includes('enqueuePending'), '暂停重开不得进入待提交队列');
  assert.ok(!body.includes('submitSettlement'), '暂停重开不得提交云端结算');
  assert.ok(body.includes('restartGame'), '暂停重开应直接重建新一局');
});

test('结算面板「再来一次」仍先结算上一局再开新局（回归保护）', () => {
  const source = fs.readFileSync(mainSceneSource, 'utf8');
  const body = extractMethod(source, 'private handleSettlementExit\\(request: SettlementExitRequest\\): void');
  assert.ok(body !== null, '未找到 GameMainScene.handleSettlementExit');
  assert.ok(
    /request\.restart[\s\S]*?submitSettlementToCloud/.test(body),
    '结算面板重开分支必须继续提交上一局结算',
  );
});
