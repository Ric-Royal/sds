# SDS business operations platform

SDS has one operating platform for human and AI-agent customers, backed by a Cloudflare Worker and D1. The public website stays on GitHub Pages. HostAfrica DNS and Google Workspace mail records are preserved.

## Workspaces and delivery

- Owner: https://sds-agent-operations.sds-9991a64282bd.workers.dev/business/
- Customers: https://sds-agent-operations.sds-9991a64282bd.workers.dev/portal/
- API guide: https://sds-agent-operations.sds-9991a64282bd.workers.dev/api/
- Machine specification: `/openapi.json`; authenticated MCP: `/mcp`.
- Website: https://datasds.org/contact creates a tracked enquiry; approved platform articles appear at `/insights` after the website deployment.

Customers submit a brief, receive a versioned quote, accept its exact terms, pay using the agreed method, follow the agent workflow, and receive released deliverables. Human and agent customers use the same records and permissions.

| Format | Customer receives |
| --- | --- |
| JSON | Structured role results, project/quote/payment status, sources, review state and authenticated file links |
| HTML | Readable report with evidence links; printable to PDF using the browser |
| Markdown | Editable report |
| CSV | Field statistics for data-quality assessments |
| ZIP + manifest | Proposed implementation files and hashes when the engineering agent produces code |
| Signed webhook | Completion metadata, stable event ID and HMAC signature; the customer then fetches its private result |
| MCP | JSON-RPC tool results through the customer's bearer-authenticated endpoint |

There is no automatically generated binary PDF, audio or arbitrary format converter. Application implementation files are proposals until execution and validation are recorded.

## Agents and business functions

Ten coordinated roles share approved knowledge, project context and earlier outputs: Chief of Staff, sales, research, marketing, delivery, engineering, maintenance, governance, finance and quality. A request can choose any combination of these roles. The catalogue also includes data quality, analytics planning, research, governance, system building, marketing, maintenance, finance and coordinated engagements.

- CRM: customer creation, public consent-based registration, private access, key rotation/revocation, enquiries, project messages and pipeline.
- Sales: qualification, explicit versioned quotes, expiry, exact acceptance, checkout and receipt reconciliation. Agents do not invent binding prices.
- Research: approved text/HTTPS sources and OpenAI hosted web search with recorded source URLs, timestamps and shared budget reservations.
- Marketing: recurring campaigns, reviewed outbound messages and approved public website articles.
- Delivery: ordered agent hand-offs, data-quality calculations, reports, code archives, release controls and rework.
- Engineering: reviewed file proposals can create a draft PR in `Ric-Royal/sds`, checking the reviewed base SHA first. CI/review precede merge. The Worker does not execute generated code or deploy arbitrary customer applications.
- Maintenance: scheduled HTTPS health checks, recorded failures/recoveries and incident projects; paid model work is independent of free health monitoring.
- Governance: source/outbound/monitor host allowlists, chosen automatic-release services, audit, customer export and content erasure.
- Finance: actual recorded receipts by currency and conservative AI allocation. These are not audited accounts or a profit calculation.

Deployment configures two health monitors and standing weekly marketing, research and finance work plus monthly governance, using a company-site profile. You can pause or revise these schedules in the owner console.

Cloudflare cron runs every five minutes and advances up to three business tasks, one legacy job, due schedules, monitors and webhook delivery. Claiming is atomic. Failed paid requests retain their allocation and require a recorded manual retry, rather than silently charging again. Disabled AI leaves model work pending while free assessments and monitors continue.

## Customer API

Public: `GET /health`, `/ready`, `/v2/catalogue`, `/v2/publications`, `/openapi.json`; `POST /v2/register` and `/v2/enquiries`. `/health` reports Worker liveness; `/ready` also verifies administrator configuration and the migrated business schema. Public registration accepts a random UUID v4 `Idempotency-Key`, returns a private customer key, and permits matching retry recovery for 24 hours. Email ownership is not verified. Rate limits and optional Turnstile protect intake.

Authenticated customers use `Authorization: Bearer <customer key>`:

| Route | Purpose |
| --- | --- |
| `GET /v2/me` | Workspace identity |
| `POST /v2/projects` | Request work; requires Idempotency-Key |
| `GET /v2/projects`, `/v2/projects/{id}` | Own project summaries/details |
| `POST /v2/projects/{id}/accept` | Accept the current exact quote with accepted:true |
| `POST /v2/projects/{id}/checkout` | Open a connected payment-provider checkout |
| `POST /v2/projects/{id}/messages` | Project conversation |
| `GET /v2/projects/{id}/files/{fileId}` | Authenticated released file download |
| `GET /v2/projects/{id}/export` | Own project record |
| `POST /v2/webhook`, `DELETE /v2/webhook` | Completion subscription on an approved HTTPS host |
| `POST /mcp` | Services, request, list/status, quote acceptance and messaging tools |

Submission returns HTTP 202, Location and Retry-After. Same-key/same-input replay returns the same project; changed input returns 409. A different customer's project/file returns 404. Results stay hidden until release. Quote acceptance is a financial commitment and must be authorised by the agent's owner. A payment redirect never proves settlement: a matching signed provider event or an owner-recorded verified receipt does.

The legacy `/v1` console/API remains available for existing clients.

## Accounts, cost and authority

The configured additional AI ceiling is **$10 per UTC month**, shared across v1/v2 model and search calls. AI remains disabled without an API key. ChatGPT subscriptions do not supply website API credits. GitHub Actions can activate the configured OpenAI adapter once `OPENAI_API_KEY` is saved privately.

The platform reserves conservative maximum cost before a request, based on input UTF-8 bytes plus a system allowance, bounded output and configured rates. Research additionally reserves one web-search call and its fixed search-input allowance. Reservations are retained after failure and are not provider invoice totals. Prices/configuration changes require review; provider-side billing limits provide an additional control.

Email sending, public content publication and repository writes require their recorded owner approvals. Automatic delivery can be enabled for selected service IDs in policy. All credentials-dependent integrations report their actual connection status; presence of a secret alone is not recorded as a live provider verification.

See [DEPLOY.md](DEPLOY.md) for precise account setup and [VERIFICATION.md](VERIFICATION.md) for completed checks and remaining live-provider checks.

## Development

For an offline data-quality delivery using the same assessment engine, run
`node scripts/assess-file.mjs input.json output-directory` (or supply CSV).
This writes JSON, HTML, Markdown and CSV reports locally; it does not transmit data.
The 5,000-row service limit applies. Business-rule reconciliation needs a scoped review.
The public example at `/samples/data-quality/report.html` uses only invented records.
Regenerate it from the repository root with
`node services/agents/scripts/assess-file.mjs public/samples/data-quality/synthetic-input.json public/samples/data-quality --sample`.

Node 24+ for service tests, Node 22+ for the website:

```bash
cd services/agents
npm ci
npm test
npm run build
cp .dev.vars.example .dev.vars
npx wrangler d1 migrations apply sds-operations --local
npm run dev
```

Use a random local ADMIN_TOKEN of at least 32 characters in the ignored `.dev.vars`; never commit credentials. Production credentials stay in GitHub/Cloudflare secrets. Console keys stay in tab memory and clear on reload/sign-out. Customer keys are stored hashed. Webhook secrets and authorised Google refresh tokens are encrypted in D1.

Limits: request JSON 512 KB; portal uploads 450 KB; quality assessment 5,000 rows/50 scalar fields; model context 100 KB; source retrieval 100 KB; 20 pending requests per customer; list routes show latest 100 projects. Large datasets require a scoped data-access/delivery plan. The service uses Workers/D1 account allowances and is not a claim of unlimited capacity. Export/erasure retain commercial receipt/quote records and audit metadata; agree retention and backup procedures for actual business data.
