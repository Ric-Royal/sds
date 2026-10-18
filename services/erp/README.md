# SDS company operations

SDS's internal operating system: ERPNext, HRMS, CRM, Helpdesk and the `sds_ops` application. The public website and customer delivery Worker remain separate services. This stack provides business records, approvals, accounting and internal controls; it is not a public dashboard containing customer data.

The owner income target is **KES 250,000 a month**. It is a minimum personal-income goal, not a contract price ceiling, company revenue, cash received or permission to withdraw company funds.

| Company function | Working records and actions |
|---|---|
| Acquisition and sales | CRM leads/deals, contacts, activities, website-enquiry import, verified-recipient Gmail drafts and follow-up evidence |
| Tenders and partnerships | Official deadline, private TOR, eligibility checklist, qualified experts, credential/availability evidence and owner bid decision |
| Costing and quotes | Verified cost inputs, rate cards, FTE/day/unit costing, overhead, reserve, margin, tax review, FX review, milestone cash plan, approval workflow and client quotation PDF |
| Contracts and delivery | Private signed agreement, native project/tasks, acceptance criteria, deliverable evidence, written acceptance, invoice preparation, changes and warranty boundary |
| Recurring services | Signed support scope, separate monthly fee, renewal dates and one draft invoice per service period; optional hourly draft preparation |
| Finance | Native multi-currency receivables/payables, invoices, payment entries, bank reconciliation, GL, financial statements, budgets and cost centres |
| Purchasing | Suppliers, purchase requests/orders, supplier bills, expenses and payment evidence |
| People | Employees, applicants, leave, attendance, timesheets, payroll structures/slips and verified contractor/expert records |
| Assets and support | Asset records/depreciation, Helpdesk tickets, priorities, teams, service policies and project-linked work |
| Governance | Obligations, authoritative due dates, risks, decisions, access profiles, audit history and private evidence |
| Management and continuity | Owner overview, currency-separated balances, project cost/forecast review, hourly alerts, daily internal digest, independent health timer and encrypted backup/recovery |

All components are free/open-source software. Exact source commits and upstream licences are in [stack.lock.json](stack.lock.json). SDS code is GPL-3.0-or-later; preserve upstream MIT/GPL/AGPL notices and source obligations when distributing or modifying those applications. Optional telephony providers are not connected. No paid AI, hosting plan or subscription is activated.

## Use the system

After installation, open `/app/sds-operations` for the owner overview and **SDS Company** for all operating records. CRM is `/crm`, support is `/helpdesk`, employee self-service is `/hrms`, banking is `/banking`; other records use native Desk.

Read [OPERATIONS.md](OPERATIONS.md) for the daily work and [DEPLOYMENT.md](DEPLOYMENT.md) for installation, access, recovery and upgrades.

## Commercial model

The estimate computes `fee = (direct cost + overhead + contingency) / (1 - margin)`. Monthly support is costed separately. All cost inputs use the quote currency. A cost reference and verification are required before approval; the institutional example is unverified and cannot become an approved quotation as supplied.

The example reproduces the earlier planning workbook: ten-month implementation **USD 846,720 before tax**, separate support **USD 6,336/month**, illustrative peak funding **USD 127,008** with a two-month receipt lag. These are assumptions, not AGRA's budget, an offer, secured staffing or an award. Tax zero means unresolved until reviewed, not exemption. Cash plans assume uniform spending and exclude tax, withholding and financing. Without a complete milestone allocation, funding is explicitly uncalculated. The final milestone absorbs rounding so the allocation reconciles to the full fee.

The approval workflow is Draft → Review → Approved, with rejection/revision and cancellation. Only the owner approves. A client quotation cannot change its customer, currency, rate, discount, scope or terms away from the approved estimate. The PDF omits internal costs and margins. Client acceptance is separate from estimate approval.

Signed engagements create projects/tasks without requiring full advance payment. Written acceptance evidence is required for a milestone invoice. The contractual payment period supplies the due date. Additional scope uses a separate approved estimate and written variation. Retainers must match their engagement and cannot overlap included stabilization.

## Automation and email authority

Hourly work checks deliverables, tenders, obligations, credential reviews, renewals, receivables and risks. The owner can enable preparation of due recurring **draft** invoices. A daily digest appears in internal notifications. The independent host timer checks service and scheduler health every five minutes. None of these jobs submits invoices, makes payments, commits a bid or sends email.

**Richard sends every email.** Native Email Queue creation is blocked and runtime email is muted. The Gmail integration only creates drafts, alerts the owner internally and records draft IDs. It never calls a send endpoint. Each attempt has a deterministic message identity. An uncertain network response blocks repeat creation until reconciliation finds the existing draft or the owner reviews Gmail manually. A new content version uses a new record.

The connected ChatGPT Gmail account is not an OAuth credential for this self-hosted server. Continue the existing connected-Gmail draft workflow while separately authorising this server if desired. No further Apollo login attempts are part of this system.

## Access and launch inputs

Profiles cover Owner, Commercial, Delivery, Finance, People and Governance. Profiles grant the relevant native app roles; they do not grant System Manager. Staff use named accounts, TOTP MFA and appropriate Company/Employee/Project User Permissions. Contractors need restricted project access; do not assign broad company profiles by default. Administrator is for setup/recovery.

Real financial posting is blocked until legal identity, tax/payroll setup, opening balances and banking have been reviewed in SDS Settings. The standard Kenya/KES company is provisional configuration. No registration number, KRA PIN, bank balance, tax rate, payroll entitlement or real client is invented. Configure eTIMS through an appropriate authorised route before issuing relevant tax invoices; this application is not a certified eTIMS integration.

Deployment needs a durable computer/server under the owner's control. Local-only installation is supported without a hosting subscription. External access additionally needs a verified domain, TLS and tested access controls. Business credentials, actual company details and opening balances are configuration inputs; they are never committed to this public repository.

## Verification

```bash
PYTHONPATH=services/erp python -m unittest discover -s services/erp/tests -v
```

The full integration suite runs only against an isolated installed Frappe site. It uses synthetic records and rolls back transactions, including accounting tests. Never run it against live books. The CI workflow installs the pinned applications into a fresh MariaDB/Redis-backed site before running the suite. See [VERIFICATION.md](VERIFICATION.md) for the executed checks and remaining host validation.
