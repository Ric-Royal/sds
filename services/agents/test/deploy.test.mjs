import test from 'node:test';
import assert from 'node:assert/strict';
import { credentials, cloudflare, provision } from '../scripts/deploy-ci.mjs';

const uuid = '12345678-1234-1234-1234-123456789abc';
const config = () => ({ name: 'sds-agent-operations', d1_databases: [{ database_name: 'sds-operations', database_id: '00000000-0000-0000-0000-000000000000' }] });
test('deployment requires all secrets and does not echo values', () => {
  assert.throws(() => credentials({}), /Missing GitHub repository secret/);
  assert.throws(() => credentials({ CLOUDFLARE_API_TOKEN: 'private-token', CLOUDFLARE_ACCOUNT_ID: 'wrong', SDS_ADMIN_TOKEN: 'x'.repeat(32) }), /32-character account ID/);
});
test('retry reuses existing resources without mutation', async () => {
  const calls = []; const c = config();
  const url = await provision(async (path, method = 'GET') => {
    calls.push(method);
    return { result: path === '/workers/subdomain' ? { subdomain: 'existing' } : [{ name: 'sds-operations', uuid }] };
  }, c, 'a'.repeat(32));
  assert.deepEqual(calls, ['GET', 'GET']);
  assert.equal(c.d1_databases[0].database_id, uuid);
  assert.equal(url, 'https://sds-agent-operations.existing.workers.dev');
});
test('first deployment provisions absent resources; permissions errors never register a subdomain', async () => {
  const calls = [];
  await provision(async (path, method = 'GET', body) => {
    calls.push([path, method]);
    if (path === '/workers/subdomain' && method === 'GET') throw Object.assign(new Error('absent'), { codes: [10007] });
    if (path === '/workers/subdomain') return { result: { subdomain: body.subdomain } };
    if (method === 'POST') return { result: { uuid } };
    return { result: [] };
  }, config(), 'a'.repeat(32));
  assert.deepEqual(calls.map(x => x[1]), ['GET', 'PUT', 'GET', 'POST']);
  let n = 0;
  await assert.rejects(provision(async () => { n++; throw Object.assign(new Error('denied'), { codes: [10000] }); }, config(), 'a'.repeat(32)), /denied/);
  assert.equal(n, 1);
});
test('API rejects redirects and never returns secret-bearing error messages', async () => {
  const api = cloudflare('a'.repeat(32), 'private-token', async (_url, options) => {
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Authorization, 'Bearer private-token');
    return Response.json({ success: false, errors: [{ code: 10000, message: 'private-token' }] }, { status: 403 });
  });
  await assert.rejects(api('/workers/subdomain'), error => error.message.includes('10000') && !error.message.includes('private-token'));
});
