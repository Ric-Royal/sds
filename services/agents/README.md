# SDS agent operations

The existing SDS website stays on GitHub Pages. This service adds a Cloudflare Worker, a D1 database and an operations console. HostAfrica continues to manage DNS; Google Workspace continues to manage company email.

This first operating layer receives authenticated requests, queues jobs, runs an assessment or model draft, and releases results after administrator review. It does not yet operate an unattended company.

## Implemented roles

| Role | Current behaviour |
| --- | --- |
| Delivery | Actual data-quality calculations: missing fields, duplicate rows, mixed types and recommendations. No model charge. |
| Sales | Draft scope and questions from a supplied brief. No binding offer or invented rates. Model required. |
| Marketing | Draft content from supplied audience and facts. No sending/publishing. Model required. |
| Research | Analyse supplied sources and flag gaps. No web retrieval. Model required. |
| Governance | Draft controls and unresolved decisions from system details. Model required. |
| Maintenance | Analyse sanitised logs/code and propose changes. No execution. Model required. |
| Operations | Named clients, access revocation, job states, review, budget reservations and audit. |

Model roles share one configured OpenAI-compatible text-chat API. These are role-specific prompts under a job runner, not unrestricted independent agents. Other provider protocols need an adapter. Coding/deployment remains a GitHub development workflow, not a capability granted to model outputs.

## Architecture and files

- `src/worker.mjs`: HTTP routes, authentication, job processing and provider adapter.
- `src/catalogue.mjs`: service catalogue and deterministic assessment.
- `migrations/0001_operations.sql`: clients, jobs, reservations and audit.
- `public/`: operations screen; untrusted values render with textContent, not HTML.
- `test/worker.test.mjs`: state/access/cost tests with real SQLite queries.
- `wrangler.jsonc`: database, static assets, cron and zero-spend defaults.
- `scripts/`: database binding configuration and public catalogue export.
- `../../public/agent-services.json`: website discovery file; reports deployment pending, with no invented live endpoint.
- `../../.github/workflows/agent-checks.yml`: PR tests and Worker packaging.

Job states: `queued → running → review → approved/rejected`; queued jobs can be cancelled. A failed/interrupted job requires inspection and does not automatically retry paid calls. Cron processes one eligible job every five minutes, after deployment. Administrators can process a job manually. Disabled model jobs do not block free assessments.

Console and API share one origin. No cross-origin browser intake is enabled. The website contact form still opens an email draft; those briefs can be entered in the console. Named clients' server-side agents can submit directly. Never put bearer tokens in public website JavaScript. Protected public intake, anti-abuse checks and a data notice are the next website integration.

## Local use

Use Node 24 or newer for tests. Deployment uses Workers/D1.

```bash
cd services/agents
npm ci
npm test
npm run build
cp .dev.vars.example .dev.vars
```

Replace ADMIN_TOKEN in the ignored `.dev.vars` file with a random value of at least 32 characters. Generate one locally:

```bash
node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
npx wrangler d1 migrations apply sds-operations --local
npm run dev
```

Keep the token out of git, URLs, command arguments and chat. Open the printed local URL, sign in, create a quality assessment, select **Process next job**, review it and select **Release to client**. Administrator credentials stay in tab memory and clear on sign-out/reload. Client tokens appear once; only hashes are stored.

## Cloudflare deployment

Start on the Workers Free plan, subject to its allowances. AI billing is separate. No paid plan, model charge, Google permission or payment account is activated by this branch.

Run in `services/agents`:

```bash
npx wrangler login
npx wrangler d1 create sds-operations
```

Authenticate through Cloudflare's official OAuth page. Copy the non-secret database UUID returned by the second command:

```bash
node scripts/configure-database.mjs YOUR_DATABASE_ID
npx wrangler d1 migrations apply sds-operations --remote
npx wrangler secret put ADMIN_TOKEN
npm test
npm run build
npm run deploy
```

The secret command uses a hidden prompt. Use a new production token, not the local token. The UUID placeholder in the initial config is intentionally unusable remotely until configured.

Use the printed `workers.dev` URL first; no HostAfrica DNS change is required. Check `/health` and `/v1/services`, sign into the console and complete a sample client job through approval and retrieval. A client token must receive HTTP 403 for administrator operations and cannot see another client's jobs.

Do not simply CNAME `api.datasds.org` to a `workers.dev` name: that alone does not provision a custom hostname/TLS. A branded hostname requires a supported Cloudflare zone/custom-domain setup or a host supporting external-DNS custom domains. Keep HostAfrica and current mail records while testing; a custom hostname is optional for launch.

Merging this branch changes the website only by adding the static discovery document. It does not deploy the backend; that has its own command. No Cloudflare credential or automatic backend deployment is stored in GitHub.

## Agent-customer API

Issue a token to a named customer from the console. Their agent uses it to request work. Submission does not agree a price, create a paid contract or authorise a charge. Quote, acceptance and payment remain separate.

| Method | Route | Access |
| --- | --- | --- |
| GET | `/health`, `/v1/services` | Public |
| POST | `/v1/jobs` | Client/admin; Idempotency-Key required |
| GET | `/v1/jobs`, `/v1/jobs/{id}` | Client's own jobs/admin |
| POST | `/v1/jobs/{id}/cancel` | Owner/admin; queued jobs only |
| POST | `/v1/jobs/{id}/approve`, `/reject` | Admin; review state only |
| GET, POST | `/v1/clients` | Admin; list or create a client |
| POST | `/v1/clients/{id}/revoke` | Admin |
| POST | `/v1/run` | Admin; process next eligible job |
| GET | `/v1/overview` | Admin; state, reservations and audit |

Private routes require `Authorization: Bearer <token>`. JSON bodies must be under 24 KB. Submission keys use 8–128 letters, digits, underscores, dots or dashes. Replaying a key returns the same job; changed input returns 409. Job ownership comes from authentication, not a submitted client ID. Client results remain hidden until approval. A rejected result remains hidden. Revoke and issue a new token to rotate access.

Example assessment body:

```json
{"service":"data-quality","input":{"rows":[{"customer":"A","amount":100},{"customer":"A","amount":100},{"customer":"B","amount":null}]}}
```

Example scoping body:

```json
{"service":"sales","input":{"text":"Scope a monthly sales dashboard for a distributor using three CSV exports. Ask about access, users and intended decisions. Prices are not agreed."}}
```

Poll `/v1/jobs/{id}`. The approved response includes `output`. List routes return the latest 100 entries. Initial access is for trusted named clients, not anonymous marketplace use.

## Model activation and spending

Defaults: `AI_ENABLED=false`, `MONTHLY_CAP_MICRO_USD=0`, no model/endpoint/key. Quality work runs; model jobs wait. Cancel unwanted model jobs before activation.

1. Choose a compatible text-chat model with known rates and no reasoning/tool/search/image surcharges.
2. Set `AI_BASE_URL` (clean HTTPS, usually ending `/v1`), `AI_MODEL`, `INPUT_USD_PER_MILLION`, `OUTPUT_USD_PER_MILLION` in Wrangler variables.
3. Run `npx wrangler secret put AI_API_KEY` and enter the key privately.
4. Agree a cap; $1 = 1,000,000 microdollars. Set `MONTHLY_CAP_MICRO_USD`, set `AI_ENABLED=true`, redeploy.
5. Validate one actual provider call and its billed usage before broad access.

The database atomically reserves a conservative maximum before a model call: UTF-8 input bytes plus a 2,048-token system allowance at input price, plus 1,200 output tokens at output price. The request sets `max_tokens=1200`. The monthly counter blocks further calls at the configured reservation ceiling. Failed/timed-out calls retain reservations and do not automatically retry. The console shows reserved allocation, not the provider's final invoice. Month boundaries use UTC; provider billing timing, price changes and surcharges can differ. Set provider-side limits too. This adapter must use a model that honours its text-output bound and has no separately charged reasoning. Disabling AI prevents future calls; an in-flight call may already be charged.

No live paid provider call was made during verification. A ChatGPT/Google Workspace subscription must not be assumed to supply API keys or credits.

## Google Workspace

Email and files are not connected in this release. Company email can handle correspondence while the engine is tested. The console reports `not_connected` for email and payments.

Next: create a company-owned Google Cloud project/OAuth client for Gmail draft creation. Start with draft permission rather than sending; implement per-user consent, encrypted refresh-token storage, revocation and audit before persisting tokens. The Workspace subscription does not itself supply hosting/model credits or the OAuth client. This version stores no Google tokens. No Google password is needed.

## Limits and production checks

- D1 persists inputs/outputs. Use synthetic or sanitised records for the pilot. Quality jobs accept 1–200 rows and at most 50 scalar fields.
- The assessment describes the supplied sample, not an entire database or factual accuracy. Duplicate comparison ignores property order and treats undefined/null as equivalent.
- Model briefs accept at most 6,000 characters. Supplied content is labelled untrusted and models have no external tools.
- Single high-entropy administrator token; separate revocable client tokens. Google sign-in/multiple administrators are future work.
- Intake checks at most 20 outstanding jobs per client. The atomic reservation cap is the hard cost boundary. Add front-door rate limiting before broad public onboarding.
- No retention/deletion task yet. Agree retention and implement export/deletion before personal production data. Audit contains event/actor/job IDs, not raw inputs/tokens.
- No automated outreach, live search, payments, patch execution or public browser intake yet.
- Stale running jobs become failed after two minutes on the next worker invocation; no automatic paid retry.
- Test database backup/recovery before production. Database administrators can alter/delete budget counters; restrict that access.
- `/health` checks Worker liveness, not a full database/provider diagnostic.

## Verification and remaining work

Service checks: `npm test`, `npm run build`. Website check: root `npm run build`. Tests cover ownership, review gate, revocation, replay/racing submissions, zero-spend behaviour, reservations, failed provider calls, duplicate worker claims, validation, cancellation and private/public routes. SQLite emulates D1 semantics; Wrangler checks packaging.

A live Cloudflare deployment, a real provider, Google OAuth, payment integration and browser visual QA are separate acceptance steps. Test mobile layout and keyboard use at the live URL. Until accounts are connected, this is a deployable implementation branch, not a running autonomous business.

48-hour sequence:

1. Built: job backend, client/agent API, quality engine, model role adapter, review console, cost controls and tests.
2. Connect Cloudflare, create D1 and deploy. No DNS change needed.
3. Issue one client token, agree a quote and deliver a sample assessment through review.
4. Optionally connect a model with an agreed cap and test one draft.
5. Add protected website intake and Google drafts; payments and broader unattended operations follow a tested first delivery.

## Official references

- https://developers.cloudflare.com/workers/wrangler/configuration/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/worker-api/d1-database/
- https://docs.cloud.google.com/billing/docs/how-to/create-billing-account

Check current account allowances/prices at activation; no arbitrary workload is guaranteed free.
