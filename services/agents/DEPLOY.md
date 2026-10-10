# SDS deployment and account connections

## Already configured

Cloudflare Worker deployment and D1 use the repository secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `SDS_ADMIN_TOKEN`. The existing Worker is `sds-agent-operations` and the database is `sds-operations`. The administrator key saved as `SDS_ADMIN_TOKEN` signs you into the owner console. GitHub will not display that saved key again.

Open the [owner console](https://sds-agent-operations.sds-9991a64282bd.workers.dev/business/). Optional connection values go into [SDS GitHub Actions secrets](https://github.com/Ric-Royal/sds/settings/secrets/actions) using **New repository secret**, with the exact names below. Do not put secret values in chat, repository files or workflow inputs.

## AI agents: OpenAI API

1. Open [OpenAI API billing](https://platform.openai.com/settings/organization/billing/overview) in the account that will pay for SDS API usage. API billing is separate from ChatGPT Plus. Review the account's credit/payment options and the agreed $10 additional monthly budget.
2. Open [API keys](https://platform.openai.com/api-keys), choose **Create new secret key**, and create a project-owned key for SDS.
3. In GitHub Actions secrets, click **New repository secret**. Name: `OPENAI_API_KEY`. Value: the API key just created. Save it privately.
4. Open [repository Actions](https://github.com/Ric-Royal/sds/actions), select **Deploy agent operations**, then **Run workflow** on `master` after merge (or rerun the latest branch deployment before merge).
5. The deployment sets the Worker secret `AI_API_KEY`, activates the configured GPT-4.1 mini adapter and retains the $10 platform ceiling. Review queued briefs before activation. Authorise one known internal task and compare its result and usage with the API account before opening paid work broadly.

Research uses hosted web search and all roles share the same spending counter. Optional OpenAI project billing limits should also be configured. The platform counter shows reserved allocation, not final invoice spending. Never use a ChatGPT session token as an API key.

## Google Workspace email

The application includes OAuth authorisation, encrypted refresh-token storage, real Gmail draft creation, exact-recipient approval, sending and revocation. Your Workspace subscription provides the mailbox; you must create the application's OAuth client.

1. Open [Google Cloud Console](https://console.cloud.google.com/) with the company administrator account. Select/create a company-owned project called SDS Operations.
2. Open **APIs & Services → Library**, search **Gmail API**, open it and choose **Enable**.
3. Open **Google Auth Platform**. Configure the application's branding/support contact and audience. Select internal access if the company Workspace configuration offers it; for external testing, add the authorising mailbox under test users and follow Google's production requirements before broader use.
4. Open **Clients → Create client**, select **Web application**, name it SDS Operations, and add this exact **Authorised redirect URI**:
   `https://sds-agent-operations.sds-9991a64282bd.workers.dev/v2/google/callback`
5. Copy its client ID and client secret into GitHub secrets named `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Redeploy the Worker.
6. Sign into the owner console → **Connections & policy → Connect Google mailbox**. Google's own page asks you to choose the company mailbox and consent. No Google password is given to SDS or this chat.
7. Return to the console. Under **Messages**, create/review a message, create its Gmail draft, inspect that exact draft in Gmail, then approve its recipient to send.
8. To revoke access, use **Disconnect Google mailbox** and inspect your [Google account connections](https://myaccount.google.com/connections).

The requested `gmail.compose` scope allows draft management and sending. SDS's sending route adds a recorded owner approval; the scope itself is not draft-only. `GOOGLE_REFRESH_TOKEN` is an optional migration alternative, not required when using the built-in authorisation flow. Google verification/account policies must be satisfied before production use.

## Payments

Manual receipts work now: issue an explicit quote with payment instructions, obtain acceptance, then record only money actually received under that quote's currency/reference. Partial payment leaves the project awaiting payment.

For an eligible business using Stripe:

1. In your Stripe account, select test mode first. Open **Developers → API keys**; save its secret key as GitHub secret `STRIPE_SECRET_KEY`.
2. Open **Developers/Webhooks (Workbench)**, add the endpoint:
   `https://sds-agent-operations.sds-9991a64282bd.workers.dev/v2/payments/stripe/webhook`
3. Subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Save the endpoint's signing secret as `STRIPE_WEBHOOK_SECRET`.
4. Redeploy and test an accepted test quote through checkout and the signed webhook. Live mode requires a supported, verified business account and its separate live credentials. No account is opened and no charge is created merely by deployment.

Do not create an account under an inaccurate business location. Existing bank/M-Pesa payment instructions can be used with verified manual receipts; this build does not include a Daraja adapter.

## Reviewed GitHub engineering

To let the runtime engineering agent create reviewed draft PRs, open [GitHub fine-grained tokens](https://github.com/settings/personal-access-tokens/new). Select only `Ric-Royal/sds`, grant repository **Contents: Read and write** and **Pull requests: Read and write**, choose an expiry, and save the token as `SDS_GITHUB_TOKEN`. Redeploy.

In the owner console, review a proposal's exact files/current base SHA, then approve draft PR creation. Runtime proposals cannot change hidden workflow files, inject credentials or merge themselves. The chat's existing GitHub connection is separate from the Worker's runtime credential.

## Optional Turnstile and encryption key

Cloudflare Dashboard → **Turnstile → Add widget**. Add `datasds.org`, `www.datasds.org` and `sds-agent-operations.sds-9991a64282bd.workers.dev` as allowed hostnames. Save the **secret key** as GitHub secret `TURNSTILE_SECRET`; save the public **site key** as repository Actions **variable** `TURNSTILE_SITE_KEY`. The deployment rejects an incomplete pair. Portal and website enquiry form render the challenge once enabled.

For independent secret encryption, save a random 32+ character value as `WEBHOOK_ENCRYPTION_KEY` before enrolling mail/webhooks. Without it, encryption derives from `SDS_ADMIN_TOKEN`. Changing the encryption key or fallback administrator key makes existing encrypted values unreadable; reconnect subscriptions/mailbox after an intentional rotation. Do not delete/change encryption credentials casually.

## Deployment behaviour

**Deploy agent operations** runs on relevant pushes to `agent-operations-v1` and `master`, or manual dispatch. It runs tests and packaging, applies forward D1 migrations, installs secrets, deploys assets/cron, and executes a synthetic complete customer workflow. That live check verifies quote acceptance, free assessment, hidden-before-release results, authenticated delivery/hash and cross-customer denial. Temporary test keys are revoked and test content erased afterwards. It then configures two health monitors without sending messages or making paid model calls.

Existing D1/subdomain resources are reused. Failed live checks stop the run and mark deployment unverified; there is no automatic rollback or database deletion. See Actions job logs for safe errors. `OPENAI_API_KEY` alone activates paid model work, so review the account and queued tasks first.

The **Deploy to GitHub Pages** workflow publishes the website on `master`. Backend deployment is separate. HostAfrica nameservers and Google mail DNS stay as they are. A branded API hostname is optional and needs supported Cloudflare custom-domain/TLS setup; simply adding a CNAME to workers.dev does not complete that setup.

If core deployment access must be replaced, create a Cloudflare API token limited to this account's Workers Scripts Edit and D1 Edit permissions, and update only `CLOUDFLARE_API_TOKEN`. Account ID is an account identifier, not a zone identifier. No DNS or billing access is needed for this deployment path.
