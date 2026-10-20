# SDS project context

Technical handover checked against GitHub on **20 October 2026**, with local ERP acceptance on the same date. Read current repository and pull-request status before relying on an older conversation's deployment status.

## Components

- The public Next.js website is a static export on GitHub Pages at [datasds.org](https://datasds.org). Its customer-facing pages include managed analytics and institutional data platforms.
- The customer delivery platform in `services/agents/` uses a Cloudflare Worker and D1. It provides enquiries, customer workspaces, quoted projects, delivery, authenticated downloads and agent integrations. Its [README](../services/agents/README.md), [deployment guide](../services/agents/DEPLOY.md) and [verification record](../services/agents/VERIFICATION.md) describe the operating boundaries.
- The internal company system in `services/erp/` contains pinned ERPNext/Frappe, CRM, HRMS and Helpdesk applications plus `sds_ops`. Its [README](../services/erp/README.md), [daily operations](../services/erp/OPERATIONS.md) and [Windows guide](../services/erp/WINDOWS.md) describe the installation and controls.

## Work already included in master

| Pull request | Included work |
| --- | --- |
| [#6](https://github.com/Ric-Royal/sds/pull/6) | Managed analytics commercial page |
| [#7](https://github.com/Ric-Royal/sds/pull/7) | Metadata and dependency updates, assessment sample and reproducible assessment command |
| [#9](https://github.com/Ric-Royal/sds/pull/9) | USD starting prices and separate tender quotations |
| [#11](https://github.com/Ric-Royal/sds/pull/11) | Institutional data platforms and expanded managed analytics |
| [#12](https://github.com/Ric-Royal/sds/pull/12) | Internal company operations, commercial controls, installation and backup/recovery tooling |

PR #12 merged on 19 October 2026 at commit `b8f14a81aa2db7eeb876343768a3b3f606168508`. Both check workflows passed on its final source commit `cd8810588cac4a48fc16ddeae7eddb5e45702de8`, including clean ERP installations with Redis 7 and 8. A conversation that still describes #12 as unmerged predates that result.

## Remaining environment work

- One dedicated Debian 13.5 WSL 2 installation passed local acceptance on 20 October 2026: authenticated application access, owner MFA enforcement, realtime restart, the native scheduled check, and encrypted backup/recovery outside Linux. See [ERP verification](../services/erp/VERIFICATION.md). Inspect each intended computer's distribution, resources and workloads before installing another runtime.
- The configured host's database, private owner enrollment and verified Windows-volume backups remain outside public Git. The owner still needs to enroll the authenticator device and provide actual company/accounting and integration settings privately. A source checkout does not contain these records or the historical private pipeline snapshot; restore only from an available, verified private backup.
- Check current GitHub Actions and actual service health when assessing production status. Paid providers and mailbox connections require their own configuration and live verification.
- Follow each service's documented authority controls. The ERP Gmail integration prepares drafts; its native outbound email queue is blocked. Keep credentials and customer, accounting and correspondence data outside public Git.

## Continue development

Use [DEVELOPMENT.md](DEVELOPMENT.md) to create a separate checkout on another computer, share committed work and open the correct folder in Codex. Both computers can use the same repository while keeping their local runtimes and private settings independent.
