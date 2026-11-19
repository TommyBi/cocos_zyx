const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { setTimeout: pause } = require('node:timers/promises');

const base = 'https://staging-api.tcjstory.cn/v1/cocos-zyx';

async function api(route, body, token) {
  const started = performance.now();
  const response = await fetch(base + route, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });
  return { status: response.status, elapsedMs: Math.round(performance.now() - started), ...await response.json() };
}

function ok(response, step) {
  assert.equal(response.status, 200, `${step}: ${response.errorCode || response.status}`);
  return response.data;
}

async function checkRound(version, item, waitMs) {
  const deviceId = `review_v20_${randomUUID()}`;
  const bootstrap = await api('/players/bootstrap', { deviceId, includeActiveRound: true });
  const { token, activeRound } = ok(bootstrap, 'bootstrap');
  assert.equal(activeRound, null);
  const roundId = `preview_${randomUUID()}`;
  const start = await api('/games/start', { roundId, rulesVersion: version, collectionRule: 'progress_v2', resumeProtocol: 1, securityProtocol: 1 }, token);
  const { sessionToken, startedAt } = ok(start, 'start');
  const refreshed = await api('/players/bootstrap', { deviceId, includeActiveRound: true }, token);
  const summary = ok(refreshed, 'bootstrap with checkpoint').activeRound;
  assert.equal(summary.roundId, roundId);
  assert.equal(summary.actions, undefined);
  let renewedReward;
  if (item) {
    const placement = item === 'hammer' ? 'hammer' : 'tool';
    const requestAt = Date.now();
    const intentResponse = await api('/games/reward-intents', { roundId, sessionToken, placement, actions: [{ type: 'rules', version }], elapsedMs: Math.max(0, requestAt - startedAt) }, token);
    const intent = ok(intentResponse, 'issue reward intent');
    assert.ok(intent.minClaimAt >= requestAt + waitMs - 750);
    assert.ok(intent.minClaimAt <= requestAt + waitMs + intentResponse.elapsedMs + 750);
    const proof = { intentId: intent.intentId, sessionToken };
    const early = await api('/games/reward-intents/complete', proof, token);
    assert.equal(early.errorCode, 'REWARD_TOO_EARLY');
    await pause(Math.max(0, intent.minClaimAt - Date.now()) + 800);
    assert.equal(ok(await api('/games/reward-intents/complete', proof, token), 'complete reward').completed, true);
    const claim = { ...proof, roundId, item, actionId: `claim_${roundId}` };
    assert.equal(ok(await api('/games/tools/reward', claim, token), 'grant tool').roundTools[item].acquired, 1);
    assert.equal(ok(await api('/games/tools/reward', claim, token), 'retry same claim').duplicate, true);
    renewedReward = { acquired: 1, used: 0, owned: 1 };
  }
  const resume = await api('/games/resume', { roundId, expectedGeneration: summary.generation, requestId: `resume_${roundId}`, maxRulesVersion: 20 }, token);
  const restored = ok(resume, 'resume');
  assert.equal(restored.rulesVersion, version);
  if (item) assert.deepEqual(restored.roundTools[item], renewedReward);
  return { version, item, minimumClaimMs: waitMs, bootstrapWithActiveRoundMs: refreshed.elapsedMs, resumeMs: resume.elapsedMs };
}

async function main() {
  const healthResponse = await api('/health');
  const health = ok(healthResponse, 'health');
  assert.equal(health.apiVersion, 25);
  assert.ok(health.capabilities.includes('round-tool-share-v20'));
  assert.equal((await api('/games/active')).status, 401);
  const rounds = await Promise.all([checkRound(20, 'hammer', 3000), checkRound(20, 'magicWand', 5000), checkRound(19)]);
  console.log(JSON.stringify({ passed: true, apiVersion: health.apiVersion, healthMs: healthResponse.elapsedMs, rounds }, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
