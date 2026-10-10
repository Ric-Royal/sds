# Verification — 11 October 2026

Base website commit: `88609756f0ec177f6ff3def434376b5012693116`.
Verified production revision: `17f903a65561c05e4415f208779eaf1275e0aeda`.

## Local checks

- 40 service tests pass against real SQLite statements/transactions matching the D1 interface.
- Tests cover readiness against the migrated schema, customer ownership, registration/retry/revocation, quotes/version/expiry/acceptance, partial payments/currency/deduplication, signed checkout settlement, agent coordination/rework, output review, archive hashes, source retrieval controls, web-research evidence/budget, encrypted OAuth/PKCE/replay, Gmail protocol, reviewed GitHub base/path controls, schedules, incidents, webhooks, MCP origin/auth, Cloudflare HTML canonical routing, public intake/CORS, export/erasure and legacy compatibility.
- Wrangler 4.149.0 packages the Worker/assets successfully; Node 24 runs service tests.
- Next.js 16.2.0 compiles and exports all 11 static pages, including connected enquiry intake and approved article feed.
- Provider adapters are exercised using controlled test responses. This verifies request/state handling, not credentials, provider billing or model output quality in a live account.

## Live deployment checks

The GitHub deployment workflow first verifies Worker liveness and database/schema readiness, then performs a synthetic, zero-price quality project from request through quote acceptance, ordered execution, review, release and authenticated customer download. It checks the file hash and another customer's rejection, then erases test content and revokes test keys. Console/portal/API assets and the OpenAPI endpoint must return success before the run is green. The Actions summary records the deployed URL and check result.

The expanded v2 platform was deployed from `master` and verified by [GitHub Actions run 38073694234](https://github.com/Ric-Royal/sds/actions/runs/38073694234) on 10 October 2026. The live Worker reported the same production revision and the public operations, customer portal and API screens returned HTTP 200 during the 11 October recovery audit.

## Account-dependent acceptance

No live paid OpenAI call, Google mailbox authorisation/sending, runtime engineering PR or actual payment charge is counted as completed by local tests. Each needs its account credentials and one scoped live acceptance check. The platform reports missing/configured/unverified states rather than inventing a connection. The $10 monthly platform allocation applies before model/search requests; invoice totals must be checked in the provider account.

Generated implementation files are not executed inside the Worker. Arbitrary customer application deployment, database-scale connectors, native PDF generation, Daraja integration and multi-administrator SSO are outside this implementation. These limits do not disable the implemented customer, agent, sales, marketing, finance, maintenance and governance workflows.
