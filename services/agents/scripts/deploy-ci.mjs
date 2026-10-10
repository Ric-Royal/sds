import { readFileSync, writeFileSync, mkdtempSync, rmSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { verifyBusiness } from './live-check.mjs';

export function credentials(env) {
  for (const name of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'SDS_ADMIN_TOKEN']) {
    if (!env[name]) throw new Error(`Missing GitHub repository secret: ${name}. See services/agents/DEPLOY.md.`);
  }
  if (!/^[a-f0-9]{32}$/i.test(env.CLOUDFLARE_ACCOUNT_ID)) throw new Error('CLOUDFLARE_ACCOUNT_ID must be the 32-character account ID.');
  if (env.SDS_ADMIN_TOKEN.length < 32 || /\s/.test(env.SDS_ADMIN_TOKEN)) throw new Error('SDS_ADMIN_TOKEN must contain at least 32 characters without whitespace.');
  return { account: env.CLOUDFLARE_ACCOUNT_ID, token: env.CLOUDFLARE_API_TOKEN, admin: env.SDS_ADMIN_TOKEN };
}

export function cloudflare(account, token, request = fetch) {
  return async (path, method = 'GET', body) => {
    const response = await request(`https://api.cloudflare.com/client/v4/accounts/${account}${path}`, {
      method, redirect: 'error', signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      const codes = (data.errors || []).map(x => x.code).filter(Number.isInteger);
      const error = new Error(`Cloudflare ${method} ${path.split('?')[0]} failed: HTTP ${response.status}, codes ${codes.join(',')}. Check token permissions and account ID.`);
      error.codes = codes;
      throw error;
    }
    return data;
  };
}

export async function provision(api, config, account) {
  let subdomain;
  try { subdomain = (await api('/workers/subdomain')).result.subdomain; }
  catch (error) {
    if (!error.codes?.includes(10007)) throw error;
    // Only register if Cloudflare explicitly reports that no subdomain exists.
    const suffix = createHash('sha256').update(account).digest('hex').slice(0, 12);
    subdomain = (await api('/workers/subdomain', 'PUT', { subdomain: `sds-${suffix}` })).result.subdomain;
  }
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(subdomain || '')) throw new Error('Cloudflare returned no valid workers.dev subdomain.');
  const binding = config.d1_databases[0];
  const matches = [];
  for (let page = 1; ; page++) {
    const data = await api(`/d1/database?per_page=100&page=${page}`);
    if (!Array.isArray(data.result)) throw new Error('Unexpected D1 list response.');
    matches.push(...data.result.filter(x => x.name === binding.database_name));
    if (data.result.length < 100 || page >= (data.result_info?.total_pages ?? Infinity)) break;
    if (page >= 100) throw new Error('D1 pagination limit reached; configure the database manually.');
  }
  if (matches.length > 1) throw new Error('Multiple matching databases; refusing to choose one.');
  const database = matches[0] || (await api('/d1/database', 'POST', { name: binding.database_name })).result;
  if (!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(database.uuid || '')) throw new Error('Cloudflare returned no valid D1 UUID.');
  // Refuse to silently redirect a deliberately configured database binding.
  if (binding.database_id !== '00000000-0000-0000-0000-000000000000' && binding.database_id !== database.uuid) throw new Error('Configured D1 ID differs from the account database.');
  binding.database_id = database.uuid;
  return `https://${config.name}.${subdomain}.workers.dev`;
}

async function main() {
  const { account, token, admin } = credentials(process.env);
  if(process.env.TURNSTILE_SECRET&&!process.env.TURNSTILE_SITE_KEY) throw new Error('TURNSTILE_SITE_KEY repository variable is required with TURNSTILE_SECRET.');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const configPath = join(root, 'wrangler.jsonc');
  const original = readFileSync(configPath, 'utf8');
  const config = JSON.parse(original);
  const api = cloudflare(account, token);
  const url = await provision(api, config, account);
  const temp = mkdtempSync(join(tmpdir(), 'sds-deploy-'));
  const run = args => {
    const result = spawnSync(process.execPath, [join(root, 'node_modules/wrangler/bin/wrangler.js'), ...args], { cwd: root, stdio: 'inherit', env: process.env });
    if (result.error || result.status !== 0) throw new Error(`Wrangler ${args[0]} failed. Inspect the preceding build log.`);
  };
  try {
    config.vars.AI_ENABLED = process.env.OPENAI_API_KEY ? 'true' : 'false';
    config.vars.DEPLOYMENT_REV = process.env.GITHUB_SHA || 'manual';
    config.vars.TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || '';
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    const secrets = join(temp, 'secrets.json');
    const values = { ADMIN_TOKEN: admin };
    for (const name of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','SDS_GITHUB_TOKEN','WEBHOOK_ENCRYPTION_KEY','TURNSTILE_SECRET']) if(process.env[name]) values[name]=process.env[name];
    if(process.env.OPENAI_API_KEY) values.AI_API_KEY=process.env.OPENAI_API_KEY;
    writeFileSync(secrets, JSON.stringify(values), { mode: 0o600 });
    run(['d1', 'migrations', 'apply', 'sds-operations', '--remote']);
    run(['deploy', '--secrets-file', secrets]);
    // Poll only read-only endpoints while the new deployment propagates.
    let verified = false;
    let stage = 'health';
    let lastFailure = 'not started';
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        stage = 'health';
        const opts = { redirect: 'error', signal: AbortSignal.timeout(10000) };
        const health = await fetch(url + '/health', opts);
        if (!health.ok) throw Object.assign(new Error(), { check: `HTTP ${health.status}` });
        const healthData = await health.json();
        if (healthData.status !== 'ok' || healthData.deployment !== config.vars.DEPLOYMENT_REV) throw Object.assign(new Error(), { check: 'new deployment has not propagated' });
        stage = 'readiness';
        const ready = await fetch(url + '/ready', opts);
        if (!ready.ok) throw Object.assign(new Error(), { check: `HTTP ${ready.status}` });
        const readyData = await ready.json();
        if (readyData.status !== 'ready' || readyData.deployment !== config.vars.DEPLOYMENT_REV) throw Object.assign(new Error(), { check: 'database or configuration is not ready' });
        stage = 'business routes';
        const catalogue = await fetch(url + '/v2/catalogue', opts);
        if (!catalogue.ok || (await catalogue.json()).schema_version !== '2.0') throw Object.assign(new Error(), { check: 'business catalogue not ready' });
        for (const path of ['/portal/', '/business/', '/api/', '/openapi.json']) {
          const asset = await fetch(url + path, opts);
          if (!asset.ok) throw Object.assign(new Error(), { check: `business asset HTTP ${asset.status}` });
        }
        stage = 'authenticated database';
        const overview = await fetch(url + '/v1/overview', { ...opts, headers: { Authorization: `Bearer ${admin}` } });
        if (!overview.ok) throw Object.assign(new Error(), { check: `HTTP ${overview.status}` });
        if (!Array.isArray((await overview.json()).counts)) throw Object.assign(new Error(), { check: 'unexpected database result' });
        stage = 'anonymous rejection';
        const denied = await fetch(url + '/v1/overview', { ...opts, signal: AbortSignal.timeout(10000) });
        if (denied.status !== 401) throw Object.assign(new Error(), { check: `expected HTTP 401, received ${denied.status}` });
        verified = true; break;
      } catch (error) {
        // Status and transport codes only: never log headers or response bodies.
        const code = error.cause?.code;
        lastFailure = `${stage}: ${error.check || (/^[A-Z0-9_]+$/.test(code || '') ? code : 'network or response failure')}`;
        console.log(`Live check ${attempt + 1}/30: ${lastFailure}`);
        if (attempt < 29) await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    if (!verified) throw new Error(`Deployment uploaded, but live checks did not pass (${lastFailure}): ${url}. Do not treat it as verified.`);
    await verifyBusiness(url, admin);
    const bootstrap=await fetch(url+'/v2/bootstrap',{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${admin}`}});
    if(!bootstrap.ok) throw new Error('Business monitor bootstrap failed.');
    console.log(`Verified operations console: ${url}`);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## SDS business deployment verified\n\n[Business operations](${url}/business/) · [Customer portal](${url}/portal/) · [API documentation](${url}/api/)\n\nLiveness, database readiness, authentication, customer request, quote acceptance, workflow, review gate, released JSON, downloads, hashes and customer isolation passed with synthetic data. Test keys were revoked. AI ${config.vars.AI_ENABLED==='true'?'enabled with the configured API key':'disabled until OPENAI_API_KEY is supplied'}.\n`);
  } finally {
    rmSync(temp, { recursive: true, force: true });
    writeFileSync(configPath, original);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
