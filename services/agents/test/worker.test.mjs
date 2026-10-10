import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker, { runOne, costBound } from '../src/worker.mjs';

// Exercise real SQL constraints and state transitions against SQLite, matching D1 semantics.
class DB {
  constructor() { this.sql = new DatabaseSync(':memory:'); this.sql.exec(readFileSync(new URL('../migrations/0001_operations.sql', import.meta.url), 'utf8')); }
  prepare(query) {
    const statement = this.sql.prepare(query); let values = [];
    return { bind(...args) { values = args; return this; },
      async first() { return statement.get(...values) ?? null; },
      async all() { return { results: statement.all(...values) }; },
      async run() { const r = statement.run(...values); return { meta: { changes: Number(r.changes) } }; }
    };
  }
  async batch(statements) {
    this.sql.exec('BEGIN');
    try { const results = []; for (const s of statements) results.push(await s.run()); this.sql.exec('COMMIT'); return results; }
    catch (e) { this.sql.exec('ROLLBACK'); throw e; }
  }
}
const admin = 'a'.repeat(40);
const env = () => ({ DB: new DB(), ADMIN_TOKEN: admin, AI_ENABLED: 'false', MONTHLY_CAP_MICRO_USD: '0' });
async function call(e, path, method = 'GET', value, token = admin, key = 'request-0001') {
  const r = await worker.fetch(new Request('https://ops.example' + path, {
    method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: value ? JSON.stringify(value) : undefined
  }), e);
  return { status: r.status, value: await r.json() };
}
const quality = { service: 'data-quality', input: { rows: [{ name: 'A', amount: 10 }, { amount: 10, name: 'A' }, { name: '', amount: null }] } };
test('client isolation, review gate, approval, revocation and audit', async () => {
  const e = env(); const a = (await call(e, '/v1/clients', 'POST', { name: 'Customer A' })).value;
  const b = (await call(e, '/v1/clients', 'POST', { name: 'Customer B' })).value;
  const submitted = await call(e, '/v1/jobs', 'POST', quality, a.token);
  assert.equal(submitted.status, 201); const id = submitted.value.id;
  assert.equal((await call(e, '/v1/jobs/' + id, 'GET', undefined, b.token)).status, 404);
  assert.equal((await call(e, '/v1/jobs/' + id + '/approve', 'POST', undefined, a.token)).status, 403);
  assert.equal((await runOne(e)).state, 'review');
  assert.equal((await call(e, '/v1/jobs/' + id, 'GET', undefined, a.token)).value.output, undefined);
  assert.equal((await call(e, '/v1/jobs/' + id + '/approve', 'POST')).status, 200);
  const result = (await call(e, '/v1/jobs/' + id, 'GET', undefined, a.token)).value.output;
  assert.equal(result.duplicate_rows, 1); assert.equal(result.row_count, 3);
  assert.equal((await call(e, '/v1/jobs/' + id + '/reject', 'POST')).status, 409);
  await call(e, '/v1/clients/' + a.id + '/revoke', 'POST');
  assert.equal((await call(e, '/v1/jobs', 'GET', undefined, a.token)).status, 401);
  assert.ok((await call(e, '/v1/overview')).value.audit.some(x => x.event === 'approve'));
  assert.ok(!e.DB.sql.prepare('SELECT token_hash FROM clients WHERE id=?').get(a.id).token_hash.includes(a.token));
});
test('idempotency replays one job and rejects changed payloads', async () => {
  const e = env(); const a = await call(e, '/v1/jobs', 'POST', quality);
  const b = await call(e, '/v1/jobs', 'POST', quality);
  assert.equal(b.status, 200); assert.equal(a.value.id, b.value.id);
  const c = await call(e, '/v1/jobs', 'POST', { ...quality, input: { rows: [{ x: 5 }] } });
  assert.equal(c.status, 409); assert.equal((await call(e, '/v1/jobs')).value.length, 1);
});
test('concurrent duplicate submissions resolve to the same job', async () => {
  const e = env(); const [a, b] = await Promise.all([call(e, '/v1/jobs', 'POST', quality), call(e, '/v1/jobs', 'POST', quality)]);
  assert.equal(a.value.id, b.value.id); assert.equal((await call(e, '/v1/jobs')).value.length, 1);
});
test('spending disabled queues model jobs and still processes free assessments', async () => {
  const e = env(); await call(e, '/v1/jobs', 'POST', { service: 'sales', input: { text: 'Scope a dashboard.' } });
  await call(e, '/v1/jobs', 'POST', quality, admin, 'request-0002');
  let calls = 0;
  assert.equal((await runOne(e, async () => { calls++; })).state, 'review');
  assert.equal((await runOne(e)).processed, false); assert.equal(calls, 0);
});
test('budget reserves before network calls and blocks a second charge', async () => {
  const e = { ...env(), AI_ENABLED: 'true', AI_BASE_URL: 'https://provider.example/v1', AI_MODEL: 'text-only', AI_API_KEY: 'secret',
    INPUT_USD_PER_MILLION: '1', OUTPUT_USD_PER_MILLION: '2' };
  const input = { text: 'Use supplied facts only.' }; e.MONTHLY_CAP_MICRO_USD = '1000000';
  e.MONTHLY_CAP_MICRO_USD = String(costBound(e, JSON.stringify(input)));
  for (let n = 0; n < 2; n++) await call(e, '/v1/jobs', 'POST', { service: 'sales', input }, admin, 'sales-000' + n);
  let calls = 0;
  const provider = async (_url, options) => {
    calls++; const payload = JSON.parse(options.body); assert.equal(payload.max_tokens, 1200);
    assert.ok(!payload.tools); return Response.json({ choices: [{ message: { content: 'Draft scope for review.' } }] });
  };
  assert.equal((await runOne(e, provider)).state, 'review');
  assert.equal((await runOne(e, provider)).state, 'failed'); assert.equal(calls, 1);
});
test('a failed paid call retains reservation and never auto retries', async () => {
  const e = { ...env(), AI_ENABLED: 'true', MONTHLY_CAP_MICRO_USD: '1000000', AI_BASE_URL: 'https://provider.example/v1',
    AI_MODEL: 'text-only', AI_API_KEY: 'secret', INPUT_USD_PER_MILLION: '1', OUTPUT_USD_PER_MILLION: '2' };
  await call(e, '/v1/jobs', 'POST', { service: 'research', input: { text: 'Source material.' } });
  let calls = 0; const provider = async () => { calls++; return new Response('sensitive-provider-response', { status: 500 }); };
  assert.equal((await runOne(e, provider)).state, 'failed');
  assert.equal((await runOne(e, provider)).processed, false); assert.equal(calls, 1);
  const summary = (await call(e, '/v1/overview')).value; assert.ok(summary.reserved_micro_usd > 0);
  assert.ok(!JSON.stringify((await call(e, '/v1/jobs')).value).includes('sensitive-provider-response'));
});
test('queue claims prevent two workers making duplicate calls', async () => {
  const e = env(); await call(e, '/v1/jobs', 'POST', quality);
  const results = await Promise.all([runOne(e), runOne(e)]);
  assert.equal(results.filter(x => x.processed).length, 1);
});
test('validation rejects nested data, oversized bodies, missing tokens and missing idempotency', async () => {
  const e = env();
  assert.equal((await call(e, '/v1/jobs', 'POST', { service: 'data-quality', input: { rows: [{ a: { nested: 1 } }] } })).status, 400);
  assert.equal((await call(e, '/v1/jobs', 'POST', { service: 'sales', input: { text: 'x'.repeat(25000) } })).status, 413);
  assert.equal((await call(e, '/v1/jobs', 'POST', quality, 'invalid')).status, 401);
  assert.equal((await call(e, '/v1/jobs', 'POST', quality, admin, '')).status, 400);
  assert.equal((await call({ ...e, ADMIN_TOKEN: '' }, '/v1/jobs')).status, 503);
});
test('cancelled and rejected jobs cannot run or release', async () => {
  const e = env(); const id = (await call(e, '/v1/jobs', 'POST', quality)).value.id;
  assert.equal((await call(e, '/v1/jobs/' + id + '/cancel', 'POST')).status, 200);
  assert.equal((await runOne(e)).processed, false);
  assert.equal((await call(e, '/v1/jobs/' + id + '/approve', 'POST')).status, 409);
});
test('public catalogue is available without credentials; overview remains protected', async () => {
  const e = env(); assert.equal((await call(e, '/v1/services', 'GET', undefined, '')).status, 200);
  assert.equal((await call(e, '/v1/overview', 'GET', undefined, '')).status, 401);
});
