import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { snapshotPrisma, serve } from './helpers/snapshot-api.mjs';

test('persistent matcher state distinguishes failure, active work, completion and rate budgets', async t => {
  const mock = snapshotPrisma({ '/api/profile': { name: 'Fixture', experience: [], socials: [] } });
  globalThis.__portfolioPrisma = mock.prisma;
  const originalFetch = globalThis.fetch, originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'mock-provider-key';
  const { default: app } = await import('../src/app.js');
  const { beginJobMatchRequest, retireJobMatchRequest } = await import('../src/lib/job-match-requests.js');
  const api = await serve(app);
  const job = 'Junior React and TypeScript developer building accessible interfaces and reliable APIs. Explain documented personal contributions to team projects.';
  const result = { matchLevel: 'Moderate Match', overallMatch: 'Recorded overlap.', recruiterSummary: 'Recruiter assessment only.', relevantExperience: [], relevantProjects: [] };
  let calls = 0, mode = 'failure', release, providerSignal;
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /^https:\/\/generativelanguage\.googleapis\.com\//);
    calls++; providerSignal = options.signal;
    if (mode === 'held') await new Promise((resolve, reject) => {
      release = resolve;
      options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
    if (mode === 'failure' || mode === 'quota') return new Response('{}', { status: mode === 'quota' ? 429 : 503 });
    const payload = { candidates: [{ content: { parts: [{ text: mode === 'invalid' ? '{bad JSON' : JSON.stringify(result) }] } }] };
    return new Response(String(url).includes('streamGenerateContent') ? `data: ${JSON.stringify(payload)}\n\n` : JSON.stringify(payload));
  };
  const active = () => [...mock.buckets.keys()].filter(key => key.startsWith('job-active:'));
  const completed = () => [...mock.buckets.keys()].filter(key => key.startsWith('job-completed:'));
  const waitFor = async check => { for (let i = 0; i < 100 && !check(); i++) await delay(10); assert.ok(check()); };
  const fresh = () => { mock.buckets.clear(); calls = 0; mode = 'failure'; release = undefined; providerSignal = undefined; };
  try {
    await t.test('503 then one permitted successful retry; only success starts the completed cooldown', async () => {
      fresh();
      const failed = await api.post('/api/job-match', { jobDescription: job, stream: true });
      assert.match(failed.body, /event: error/); assert.match(failed.body, /"code":"provider"/);
      assert.deepEqual(active(), []); assert.deepEqual(completed(), []); assert.equal(calls, 1);
      mode = 'success';
      const retry = await api.post('/api/job-match', { jobDescription: job, stream: true });
      assert.match(retry.body, /event: result/); assert.match(retry.body, /event: done/); assert.equal(calls, 2);
      const duplicate = await api.post('/api/job-match', { jobDescription: job });
      assert.equal(duplicate.status, 429); assert.equal(JSON.parse(duplicate.body).code, 'completed');
      assert.match(duplicate.body, /report.*generated recently/); assert.equal(duplicate.headers['retry-after'], '30'); assert.equal(calls, 2);
    });
    await t.test('active duplicates and concurrent different jobs do not call the model or consume another attempt', async () => {
      fresh(); mode = 'held';
      const pending = api.post('/api/job-match', { jobDescription: job, stream: true });
      await waitFor(() => Boolean(release));
      for (const description of [job, job + ' Different role.']) {
        const duplicate = await api.post('/api/job-match', { jobDescription: description });
        assert.equal(duplicate.status, 409); assert.equal(JSON.parse(duplicate.body).code, 'active');
        assert.equal(duplicate.headers['retry-after'], '2'); assert.doesNotMatch(duplicate.body, /just analyzed/);
      }
      assert.equal(calls, 1); mode = 'success'; release(); assert.match((await pending).body, /event: done/); assert.deepEqual(active(), []);
    });
    await t.test('failed attempts retain the four/minute budget and an exact remaining cooldown', async () => {
      fresh(); t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-23T12:00:00Z') });
      try {
        for (let n = 0; n < 4; n++) assert.equal((await api.post('/api/job-match', { jobDescription: job })).status, 502);
        t.mock.timers.tick(12_000);
        const blocked = await api.post('/api/job-match', { jobDescription: job });
        assert.equal(blocked.status, 429); assert.equal(JSON.parse(blocked.body).code, 'rate'); assert.equal(blocked.headers['retry-after'], '48'); assert.equal(calls, 4);
        t.mock.timers.tick(48_001); mode = 'success'; assert.equal((await api.post('/api/job-match', { jobDescription: job })).status, 200);
      } finally { t.mock.timers.reset(); }
    });
    await t.test('provider quota applies a real bounded cooldown, not an immediately usable retry', async () => {
      fresh(); mode = 'quota';
      const quota = await api.post('/api/job-match', { jobDescription: job, stream: true });
      assert.match(quota.body, /"code":"quota"/); assert.match(quota.body, /"retryAfter":60/);
      const blocked = await api.post('/api/job-match', { jobDescription: job + ' Another role.' });
      assert.equal(blocked.status, 429); assert.equal(JSON.parse(blocked.body).code, 'provider-quota'); assert.equal(calls, 1); assert.deepEqual(completed(), []);
    });
    for (const stream of [true, false]) await t.test(`${stream ? 'SSE' : 'JSON'} disconnect cancels provider work and retires incomplete state`, async () => {
      fresh(); mode = 'held';
      const req = http.request(`${api.url}/api/job-match`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: stream ? 'text/event-stream' : 'application/json' } });
      req.on('error', () => {}); req.on('response', res => res.resume()); req.end(JSON.stringify({ jobDescription: job, stream }));
      await waitFor(() => Boolean(providerSignal)); req.destroy();
      await waitFor(() => providerSignal.aborted && active().length === 0);
      assert.deepEqual(completed(), []); mode = 'success'; assert.equal((await api.post('/api/job-match', { jobDescription: job })).status, 200);
    });
    await t.test('invalid structured output does not leave a completed state', async () => {
      fresh(); mode = 'invalid'; assert.equal((await api.post('/api/job-match', { jobDescription: job })).status, 502);
      assert.deepEqual(completed(), []); mode = 'success'; assert.equal((await api.post('/api/job-match', { jobDescription: job })).status, 200);
    });
    await t.test('portfolio lookup failure retires its slot without invoking the provider', async () => {
      fresh(); const read = mock.prisma.profile.findFirst;
      mock.prisma.profile.findFirst = async () => null;
      try {
        const failed = await api.post('/api/job-match', { jobDescription: job, stream: true });
        assert.equal(failed.status, 503); assert.equal(JSON.parse(failed.body).code, 'context');
        assert.equal(calls, 0); assert.deepEqual(active(), []); assert.deepEqual(completed(), []);
      } finally { mock.prisma.profile.findFirst = read; }
      mode = 'success'; assert.equal((await api.post('/api/job-match', { jobDescription: job })).status, 200);
    });
    await t.test('lease expiry recovers a crashed request and stale cleanup cannot delete its replacement', async () => {
      fresh(); t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-23T13:00:00Z') });
      try {
        const first = await beginJobMatchRequest('fixture-ip', job); assert.ok(first.lease);
        assert.equal((await beginJobMatchRequest('fixture-ip', job)).issue, 'active');
        t.mock.timers.tick(120_001);
        const replacement = await beginJobMatchRequest('fixture-ip', job); assert.ok(replacement.lease);
        await retireJobMatchRequest(first.lease, { completed: true }); assert.equal(active().length, 1); assert.equal(completed().length, 0);
        await retireJobMatchRequest(replacement.lease); assert.equal(active().length, 0);
      } finally { t.mock.timers.reset(); }
    });
    await t.test('completion and slot release roll back together when storage fails', async () => {
      fresh(); const request = await beginJobMatchRequest('fixture-ip', job);
      const remove = mock.prisma.rateLimitBucket.deleteMany;
      mock.prisma.rateLimitBucket.deleteMany = async () => { throw new Error('Simulated storage failure'); };
      try { await assert.rejects(retireJobMatchRequest(request.lease, { completed: true }), /Simulated storage failure/); }
      finally { mock.prisma.rateLimitBucket.deleteMany = remove; }
      assert.equal(active().length, 1); assert.equal(completed().length, 0);
      await retireJobMatchRequest(request.lease); assert.equal(active().length, 0);
    });
  } finally {
    await api.close(); globalThis.fetch = originalFetch; delete globalThis.__portfolioPrisma;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey;
  }
});
