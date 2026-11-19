/** 限流工作池隔离不可信重放，防止一个长日志阻塞登录、结算和健康检查。 */
const path = require('node:path');
const { Worker } = require('node:worker_threads');
const { default: BoardEngine } = require('./boardEngine');
const slots = [], queue = []; let nextId = 0;
const busy = () => Object.assign(new Error('核验繁忙，请保留原请求稍后重试'), { status: 503, businessCode: 'REPLAY_BUSY' });
function makeSlot() {
  const worker = new Worker(path.join(__dirname, 'replayWorker.js'), { resourceLimits: { maxOldGenerationSizeMb: 96 } });
  const slot = { worker, job: null }; slots.push(slot); worker.unref();
  worker.on('message', message => {
    const job = slot.job;
    if (!job || job.id !== message.id) return;
    clearTimeout(job.timer); slot.job = null; worker.unref();
    if (message.result.board) message.result.board = Object.assign(new BoardEngine(), message.result.board);
    job.resolve(message.result); pump();
  });
  const stop = () => {
    const index = slots.indexOf(slot); if (index < 0) return; slots.splice(index, 1);
    if (slot.job) { clearTimeout(slot.job.timer); slot.job.reject(busy()); slot.job = null; }
    worker.terminate().catch(() => {}); pump();
  };
  worker.on('error', stop); worker.on('exit', stop); slot.stop = stop;
  return slot;
}
function pump() {
  while (queue.length) {
    const slot = slots.find(value => !value.job) || (slots.length < 2 ? makeSlot() : null);
    if (!slot) return;
    const job = queue.shift(); slot.job = job; slot.worker.ref();
    job.timer = setTimeout(slot.stop, 8000);
    try { slot.worker.postMessage({ id: job.id, input: job.input }); }
    catch (_) { slot.stop(); }
  }
}
function verifyReplay(input) {
  if (!Array.isArray(input.actions) || input.actions.length > 100000) return Promise.resolve({ valid: false, score: -1, collectedMoodBeans: -1 });
  if (queue.length >= 8) return Promise.reject(busy());
  return new Promise((resolve, reject) => { queue.push({ id: ++nextId, input, resolve, reject }); pump(); });
}
module.exports = { verifyReplay };
