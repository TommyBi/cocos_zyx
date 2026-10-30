/**
 * R3：暂停菜单「重新开始」直接放弃本局，不是一种结算方式。
 *
 * - restartFromPause 不得调用 finishRound / 结算提交 / 待提交入队，且必须申请服务端新局；
 * - 结算面板出现前先保存上一局记录，「再来一次」再申请新局。
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
  const body = extractMethod(source, 'private async restartFromPause\\(\\): Promise<void>');
  assert.ok(body !== null, '未找到 ZyxGame.restartFromPause');
  assert.ok(!body.includes('finishRound'), '暂停重开不得调用 finishRound()');
  assert.ok(!body.includes('onSettlementExit'), '暂停重开不得触发结算退出回调');
  assert.ok(!body.includes('enqueuePending'), '暂停重开不得进入待提交队列');
  assert.ok(!body.includes('submitSettlement'), '暂停重开不得提交云端结算');
  assert.ok(body.includes('onRestartFromPause'), '暂停重开应申请服务端新局');
});

test('结算记录在弹窗前保存，再来一次先申请服务端新局', () => {
  const game = fs.readFileSync(zyxGameSource, 'utf8');
  const finish = extractMethod(game, 'private finishGame\\(_reason: string\\): void');
  assert.ok(finish !== null, '未找到 ZyxGame.finishGame');
  assert.ok(finish.indexOf('onRoundFinished') >= 0 && finish.indexOf('onRoundFinished') < finish.indexOf('showModal'),
    '弹出结算面板前必须保存上一局记录');
  const scene = fs.readFileSync(mainSceneSource, 'utf8');
  const exit = extractMethod(scene, 'private handleSettlementExit\\(request: SettlementExitRequest\\): void');
  assert.ok(exit !== null, '未找到 GameMainScene.handleSettlementExit');
  assert.ok(/request\.restart[\s\S]*?startGame\(\)/.test(exit), '再来一次必须申请服务端新局');
});
