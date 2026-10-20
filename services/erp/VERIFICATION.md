# Executed verification — 18 October 2026

Tested against a real MariaDB 11.8.9 / Redis 7 installation with Python 3.14.8 and Node 24.19.0. Exact application source pins are in `stack.lock.json`. The final site was installed from the stable releases, not migrated from development branches.

| Check | Result |
|---|---|
| Pricing and backup unit tests | 10 passed: workbook parity, margin/invalid inputs, receipt lag, absent funding schedule, cost and milestone rounding, streamed authenticated encryption and archive path rejection |
| Real ERP integration suite | 13 passed with synthetic records and transaction rollback |
| End-to-end delivery | Approved estimate → idempotent quotation → signed engagement → Project/Tasks/Milestones → written acceptance → draft invoice with contractual 45-day due date |
| Commercial controls | Unverified supplier rates rejected; unapproved tender qualifications/deadline rejected; edited quote/invoice price rejected; estimate-less SDS quote submission rejected |
| Real accounting | Submitted synthetic Sales Invoice produced GL entries; Payment Entry cleared outstanding balance; Purchase Order mapped to posted Purchase Invoice and supplier balance |
| Permissions | Delivery profile has native project access; cannot read payroll/settings or owner finance overview; Finance user prepared an accepted milestone invoice without delivery approval authority; Guest action denied |
| Email | Native queue creation rejected; mocked Gmail operation creates a draft once; uncertain network result prevents blind retry; reconciliation binds the existing draft; no real email sent |
| Recurring invoices | Disabled by default; enabling it prepared exactly one unsent draft for a due signed retainer; immediate second run produced none |
| Intake/alerts | Duplicate source import did not create a second integration record; repeated checks did not duplicate alerts; resolved obligations cleared their alerts |
| Client PDF | Real PDF generated and parsed; customer price present, internal cost description and margin absent |
| Production frontend builds | Frappe, ERPNext banking, HRMS employee/roster, CRM, Helpdesk and SDS assets built successfully |
| Authenticated HTTP | Administrator login, Guest rejection and owner API passed; five application routes returned HTTP 200; 191 referenced static assets returned HTTP 200 |
| Scheduled job execution | Native scheduler job enqueued and completed through the real Redis worker |
| Backup and recovery | Encrypted database/configuration/public/private-file bundle authenticated and restored into a different site; all 15 selected record-type counts matched; integrations/scheduler disabled on recovery copy |
| Existing SDS Worker | 43 tests passed, including paginated project listing with customer isolation and invalid cursor/limit rejection |
| Installer/service packaging | Native bench creation exercised; Python/shell syntax and diff checks passed; 13 systemd/nginx configuration files rendered |

No test customer, supplier, invoice, payment, employee or contract was committed to the operational books. Native Helpdesk installation adds its onboarding example ticket. The initial development installation was kept separate; its incompatible downgrade migration was not used as the final installation path.

## Remaining deployment validation

The durable host, real domain/TLS, named owner/staff identities, company/tax/payroll details, bank/opening balances and server OAuth/Worker secrets were not supplied. They have not been invented. The stack is installed in a transient build environment; it is not claimed to be an externally accessible production ERP.

The generated production systemd/nginx services must be exercised on the selected Debian host. This sandbox does not run systemd as PID 1 and restricts Unix socket/privilege operations; the build used a native TCP test topology. Browser-level visual/interaction acceptance on that permanent host remains required; HTTP and assets checks do not replace it. There is no eTIMS certification or tax-filing integration in this build.

The environment blocked optional legacy Helpdesk NLTK corpus downloads through its proxy-safety checks. No override was enabled. Modern SQLite ticket search and ordinary Helpdesk workflows remain available. No paid telephony, hosted AI or subscription service was activated.

## 19 October review regression checks

The 18 October transient runtime has reset. Its unsaved private database, credentials and encrypted handover archive are no longer available in this workspace. The source code and completed GitHub CI runs remain durable. The earlier runtime observations above are historical checks, not a current live deployment or an available recovery package.

The follow-up changes require a real clean-site CI run on Redis 7 and 8: invoice provenance cannot be removed, an Invoiced milestone requires a matching non-cancelled invoice, cancelled milestone billing reopens acceptance for replacement, native recurring amendments retain their period key, and accepted/unposted/cancelled billing receives internal alerts. Website intake joins the administrator-only registrant endpoint and preserves the self-reported, unverified identity status. No email is sent.

Local checks: 44 Worker tests and 10 pricing/backup tests passed. The expanded real-site suite has 14 tests; see the latest commit's Check company operations results for its execution status. Full production asset builds and permanent-host browser acceptance are separate from the headless clean-site CI suite.

## Local Windows/WSL acceptance — 20 October 2026

A dedicated Debian 13.5 WSL 2 environment was installed on a Windows 11 computer with the pinned application sources. Python 3.14.8, Node 24.19.0, MariaDB 11.8.9 and Redis 8 were exercised on that host.

- Authenticated HTTP passed for the owner overview, CRM, Helpdesk, HRMS and Banking, including 191 static assets and guest dashboard rejection.
- A named SDS Owner account passed native authenticator MFA, rejection of an incorrect code, authenticated realtime connection, and private-file access with anonymous denial. No System Manager role was granted and the outbound Email Queue remained empty. Private phone enrollment remains an owner action.
- The registered hourly SDS check ran through the native scheduler queue and updated its heartbeat. The independent health monitor passed.
- Realtime restart exposed a stale Unix-socket failure. The owned, inactive-socket cleanup was installed and a subsequent restart passed. Four real filesystem/socket tests cover stale sockets, live listeners, regular files and symbolic links; all 14 pricing, backup and socket tests passed.
- An authenticated encrypted backup was copied outside Linux to a protected Windows data volume and verified by checksum. That Windows copy was restored into a new isolated site. Record counts, a private attachment hash and the encrypted owner authenticator enrollment matched. All 14 ERP integration tests passed on the restored copy; its scheduler, external integrations and live finance remained disabled.
- A final backup was created after removing the synthetic commissioning attachment from the main site. The computer's launch and manual-backup controls use the configured local services. Future installations must repeat host acceptance; this record applies to the configured host.

The local commissioning identified the installer catalogue, initial encryption-key timing, regional MariaDB mirror and realtime restart issues addressed in the deployment changes. The application source pins remain unchanged. Actual legal/accounting inputs, production intake credentials and optional server Gmail authorization still require private configuration. The installation does not restore a historical private pipeline snapshot or establish paying clients.
