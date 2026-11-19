const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');

const staging = 'https://staging-api.tcjstory.cn/v1/cocos-zyx';
const publicSmoke = process.argv[2] === 'staging';
const bundles = process.argv.slice(4);
assert.equal(bundles.length, 3);

function compiledClient(bundlePath, base, store = new Map([['zyx_cloud_device_id', `review-v21-${randomUUID()}`]])) {
  const bundle = fs.readFileSync(bundlePath, 'utf8');
  const loaderEnd = 'return n}(';
  const start = bundle.indexOf(loaderEnd);
  const end = bundle.lastIndexOf('},{},[');
  assert.ok(start >= 0 && end > start);
  const wx = {
    getAccountInfoSync: () => ({ miniProgram: { envVersion: 'develop' } }),
    request: async options => {
      try {
        assert.ok(options.url.startsWith(staging + '/'), options.url);
        const response = await fetch(base + options.url.slice(staging.length), {
          method: options.method,
          headers: options.header,
          body: options.data && JSON.stringify(options.data),
          signal: AbortSignal.timeout(12000),
        });
        options.success({ statusCode: response.status, data: await response.json() });
      } catch (error) { options.fail({ errMsg: error.message }); }
    },
  };
  const cc = { _RF: { push() {}, pop() {} }, sys: { localStorage: {
    getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value),
  } } };
  const modules = vm.runInNewContext('(' + bundle.slice(start + loaderEnd.length, end + 1) + ')', { window: {}, cc });
  const loaded = new Map([['PlatformAdapter', { getWxApi: () => wx }]]);
  const load = name => {
    if (loaded.has(name)) return loaded.get(name);
    const [factory, imports] = modules[name];
    const module = { exports: {} };
    factory(id => load(imports[id] || id.split('/').pop()), module, module.exports);
    loaded.set(name, module.exports);
    return module.exports;
  };
  const cloud = load('CloudService').cloudService;
  return { cloud, board: load('BoardEngine'), store };
}

function play(Board, begun) {
  const board = new Board();
  board.resetBoard(begun.seed, begun.isTutorial, begun.rulesVersion, begun.heartRescueEligible);
  if (begun.isTutorial) {
    for (let i = 0; i < 3; i++) {
      const move = board.getTutorialMove(i);
      assert.ok(board.movePiece(move.id, move.offset));
      board.resolveBoard();
      board.finishPlayerAction();
    }
    for (let i = 0; i < 3; i++) assert.ok(board.appendNextRow());
    board.resolveBoard();
    board.finishPlayerAction();
  }
  while (board.difficultyActionCount < 30 && !board.isGameOver() && board.getBoardHeight() < 9) {
    const hint = board.findEliminationHint();
    if (!hint) break;
    assert.ok(board.movePiece(hint.id, hint.offset));
    board.resolveBoard();
    assert.ok(board.appendTurnRows());
    board.resolveBoard();
    while (board.getOccupiedRowCount() < board.getRefillRowTarget() && board.actionAppends < 5 && !board.isGameOver()) {
      assert.ok(board.appendNextRow());
      board.resolveBoard();
    }
    board.finishPlayerAction();
  }
  assert.ok(board.score > 0);
  assert.ok(board.canCheckpoint());
  return board;
}

async function lifecycle(base, bundle, version) {
  const client = compiledClient(bundle, base);
  assert.equal(client.board.BOARD_RULES_VERSION, version);
  await client.cloud.bootstrap('', '');
  const roundId = `round_review_${randomUUID().replace(/-/g, '')}`;
  const begun = await client.cloud.startRound(roundId);
  assert.equal(begun.rulesVersion, version);
  const board = play(client.board.default, begun);
  const saved = await client.cloud.saveRoundProgress({ roundId, sessionToken: begun.sessionToken, actions: board.roundActions, elapsedMs: 0 });
  assert.equal(saved.rulesVersion, version);
  const active = await client.cloud.getActiveRound();
  assert.equal(active.roundId, roundId);
  const request = { roundId, requestId: `resume_${roundId}`, expectedGeneration: active.generation };
  if (version === 21) {
    for (const oldBundle of bundles.slice(0, 2)) {
      const oldClient = compiledClient(oldBundle, base, client.store);
      await assert.rejects(oldClient.cloud.resumeRound(request), error => error.businessCode === 'BOARD_RULES_UNSUPPORTED');
      await assert.rejects(oldClient.cloud.startRound(`${roundId}_old`), error => error.businessCode === 'ROUND_RESUME_REQUIRED');
    }
  }
  const restored = await client.cloud.resumeRound(request);
  assert.equal(restored.rulesVersion, version);
  assert.equal(restored.score, board.score);
  assert.equal(restored.actions[0].version, version);
  let settlement;
  if (!publicSmoke) {
    const endedAt = Date.now();
    const args = [roundId, endedAt - 6000, endedAt, board.score, board.roundCollectedMoodBeans, restored.actions, restored.sessionToken];
    settlement = await client.cloud.submitSettlement(...args);
    assert.equal(settlement.settlement.score, board.score);
    assert.equal((await client.cloud.submitSettlement(...args)).duplicate, true);
  }
  return {
    version, opened: true, saved: true, resumed: true, actions: board.difficultyActionCount,
    scoreMatched: true, ...(settlement && { settled: true, duplicateSettlement: true }),
    ...(version === 21 && { olderClientsCannotTakeOver: true }),
  };
}

async function main() {
  let server;
  const realNow = Date.now;
  let clock = realNow();
  if (!publicSmoke) {
    const serverPath = path.resolve(process.argv[3]);
    const { start } = require(path.join(serverPath, 'src/index'));
    Date.now = () => (clock += 700);
    server = (await start('/tmp/compiled-clients-compat.sqlite')).listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
  }
  try {
    const base = publicSmoke ? staging : `http://127.0.0.1:${server.address().port}/v1/cocos-zyx`;
    const health = (await (await fetch(base + '/health')).json()).data;
    assert.equal(health.apiVersion, 26);
    assert.ok(health.capabilities.includes('short-opening-v21'));
    const results = [];
    for (const [index, version] of [15, 20, 21].entries()) results.push(await lifecycle(base, bundles[index], version));
    console.log(JSON.stringify({ passed: true, target: publicSmoke ? 'staging' : 'candidate image', apiVersion: health.apiVersion, results }, null, 2));
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    Date.now = realNow;
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
