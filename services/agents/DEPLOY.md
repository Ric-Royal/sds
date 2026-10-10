# Deploy SDS through GitHub

This route runs on GitHub's runner. It does not require this chat's browser, MCP connection, a local Node installation, HostAfrica access or Google Workspace access.

## One-time account setup

1. In the Cloudflare account that should own SDS, open **My Profile → API Tokens → Create Token**. Create a custom token named `SDS GitHub deployment` with account permissions **Workers Scripts: Edit** and **D1: Edit** (the API calls these Write permissions). Restrict account resources to this one account. Do not grant DNS, billing or user-management access. If your dashboard uses the newer Workers roles, use **Workers Editor** for deployment and retain D1 Write. A token limited to an existing Worker cannot create the initial Worker or account subdomain; use account scope for this first setup, then narrow it after provisioning.
2. Copy your Cloudflare **Account ID** from the account dashboard. This is a 32-character ID, not a zone ID.
3. Open [SDS repository Actions secrets](https://github.com/Ric-Royal/sds/settings/secrets/actions). Add these three **repository secrets** using **New repository secret**:

   | Name | Value |
   | --- | --- |
   | `CLOUDFLARE_API_TOKEN` | The scoped token created above |
   | `CLOUDFLARE_ACCOUNT_ID` | The owning Cloudflare account ID |
   | `SDS_ADMIN_TOKEN` | A new random password of at least 32 characters without spaces, generated and saved in your password manager |

The administrator token is your operations-console password. Save it before submitting: GitHub will not display it again. Put tokens directly into GitHub Secrets, never into a commit, issue, chat or workflow input. These secrets become available to workflows on this repository, so restrict repository write access.

No paid plan or AI provider is enabled by this workflow. The account must already be able to use Workers and D1; if Cloudflare requires onboarding or acceptance of terms, complete that in your own account. This workflow does not purchase a plan or accept agreements.

## Run

Open [repository Actions](https://github.com/Ric-Royal/sds/actions), select the latest **Deploy agent operations** run, then **Re-run failed jobs** after adding the secrets. The first run deliberately fails with the names of missing secrets. The assistant can also retry that failed run once you say the secrets are saved, if GitHub Actions write permission is available.

The deployment workflow runs on pushes affecting `services/agents` or its workflow on `agent-operations-v1`; it does not require merging the website PR. Changes pushed to this branch will redeploy once the secrets exist. It never runs from a pull-request event. A manual **Run workflow** option becomes available when the workflow exists on the repository default branch.

The workflow:

1. Installs the locked dependencies, runs tests and packages the Worker.
2. Validates all three secrets before making Cloudflare requests.
3. Reuses the account's existing workers.dev subdomain, or registers `sds-<account-hash>` only if Cloudflare reports none exists.
4. Finds or creates the `sds-operations` D1 database and applies migrations.
5. Deploys `sds-agent-operations`, its assets, cron schedule and administrator secret together.
6. Checks public health, authenticated database access and rejection of anonymous private requests. The Actions summary shows the verified console URL.

Existing databases and subdomains are reused on retries. A rejected permission or failed migration stops deployment. A deployment that fails its live checks is reported as unverified; it is not automatically rolled back. The workflow serializes deployments and never deletes a database. The generated database binding and temporary secret file are not committed or uploaded as artifacts.

Sign in at the URL using the password saved as `SDS_ADMIN_TOKEN`. Complete one sample data-quality job and review/release it before inviting clients. Paid model work stays disabled until a provider and budget are configured. This workflow does not change HostAfrica DNS or the GitHub Pages website.

## Troubleshooting

- **Missing GitHub repository secret:** add the exact named secret to this repository, then retry the failed job.
- **Cloudflare HTTP 401/403:** check the account ID, token expiry, the selected account resources and Workers/D1 write permissions. Do not broaden access to DNS or billing.
- **Subdomain registration rejected:** complete Workers onboarding and choose an available workers.dev subdomain in the Cloudflare dashboard, then retry. An existing subdomain is never renamed.
- **Live checks did not pass:** inspect the Worker deployment and D1 migrations. A green package build alone is not a live deployment confirmation.

Official references: [Cloudflare GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/), [D1 database creation](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/create/), [Worker subdomains](https://developers.cloudflare.com/api/resources/workers/subresources/subdomains/methods/update/).
