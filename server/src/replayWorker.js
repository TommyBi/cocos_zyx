/** 纯重放工作线程：不接触数据库、凭据或网络。 */
const { parentPort } = require('node:worker_threads');
const { replayRound } = require('./gameEngine');
const { replayBoardEngine } = require('./replayBoardEngine');
parentPort.on('message', ({ id, input }) => {
  try {
    const { seed, tutorial, actions, version, heartEligible, checkpoint, includeBoard, strict } = input;
    const result = checkpoint
      ? replayBoardEngine(seed, tutorial, actions, version, heartEligible, true, includeBoard, strict)
      : replayRound(seed, tutorial, actions, version, heartEligible);
    if (result.board) result.board.takeLightningEffects();
    parentPort.postMessage({ id, result });
  } catch (_) { parentPort.postMessage({ id, result: { valid: false, score: -1, collectedMoodBeans: -1 } }); }
});
