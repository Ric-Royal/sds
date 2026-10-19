"""Idempotently installed SDS metadata. ERPNext owns the accounting and HR records."""


def field(name, label, kind="Data", options=None, **values):
    result = {"fieldname": name, "label": label, "fieldtype": kind, **values}
    if options is not None:
        result["options"] = options
    return result


def section(name, label):
    return field(name, label, "Section Break")


def select(name, label, options, **values):
    return field(name, label, "Select", "\n".join(options), **values)


def link(name, label, doctype, **values):
    return field(name, label, "Link", doctype, **values)


def currency(name, label, **values):
    return field(name, label, "Currency", "currency", **values)


def permissions(roles, writable=True):
    return [{"role": role, "read": 1, "write": int(writable), "create": int(writable),
             "delete": int(role == "SDS Owner"), "report": 1, "export": 1, "print": 1,
             "share": int(role == "SDS Owner"), "submit": int(role == "SDS Owner"),
             "cancel": int(role == "SDS Owner"), "amend": int(role == "SDS Owner")}
            for role in roles]


ROLES = ["SDS Owner", "SDS Commercial", "SDS Delivery", "SDS Finance", "SDS People", "SDS Governance"]
COMPANY = link("company", "Company", "Company", reqd=1)
CUSTOMER = link("customer", "Customer", "Customer")
PROJECT = link("project", "Project", "Project")
OWNER = link("responsible_user", "Responsible user", "User", reqd=1, default="__user")
RECORDS = [
    {"name": "SDS Cost Line", "istable": 1, "fields": [
        field("description", "Role / cost", reqd=1, in_list_view=1),
        select("allocation", "Allocation", ["Implementation", "Monthly support"], default="Implementation", in_list_view=1, reqd=1),
        select("basis", "Cost basis", ["Units", "Days", "FTE months"], default="Units", reqd=1),
        field("quantity", "Units / days", "Float", default=1, precision=4, in_list_view=1),
        field("fte", "FTE", "Float", default=1, precision=4),
        field("months", "Months", "Float", default=10),
        field("days_per_month", "Days per month", "Float", default=20),
        field("rate", "Loaded cost per unit / day", "Currency", precision=2, reqd=1, in_list_view=1),
        field("amount", "Cost", "Currency", read_only=1, in_list_view=1),
        link("rate_card", "Source rate card", "SDS Rate Card"),
        field("source_reference", "Quote / evidence reference", "Small Text"),
        field("verified", "Verified cost", "Check"),
    ]},
    {"name": "SDS Estimate Milestone", "istable": 1, "fields": [
        field("title", "Deliverable / milestone", reqd=1, in_list_view=1),
        field("month", "Acceptance month", "Int", reqd=1, in_list_view=1),
        field("fee_pct", "Share of implementation fee (%)", "Percent", reqd=1, in_list_view=1),
        field("acceptance_criteria", "Acceptance criteria", "Small Text", reqd=1),
        field("review_days", "Review working days", "Int", default=10),
    ]},
    {"name": "SDS Requirement", "istable": 1, "fields": [
        field("requirement", "Requirement", "Small Text", reqd=1, in_list_view=1),
        select("status", "Status", ["Missing", "In progress", "Verified", "Not applicable"], default="Missing", in_list_view=1),
        field("evidence", "Evidence reference", "Small Text"),
        link("expert", "Expert", "SDS Expert"),
        field("mandatory", "Mandatory", "Check", default=1),
    ]},
    {"name": "SDS Settings", "issingle": 1, "roles": ["SDS Owner"], "fields": [
        COMPANY, currency("owner_income_target", "Monthly owner income minimum", default=250000),
        link("currency", "Management currency", "Currency", default="KES", reqd=1),
        field("owner_user", "Owner user", "Link", "User", default="Administrator", reqd=1),
        field("minimum_margin_pct", "Minimum margin requiring no exception (%)", "Percent", default=0),
        field("live_finance_enabled", "Authorise posting real financial transactions", "Check"),
        field("legal_identity_reviewed", "Legal company identity verified", "Check"),
        field("tax_setup_reviewed", "Accountant reviewed tax and payroll setup", "Check"),
        field("opening_balances_reviewed", "Opening balances reviewed", "Check"),
        field("bank_setup_reviewed", "Bank / M-Pesa accounts reviewed", "Check"),
        link("sales_tax_account", "Reviewed sales tax account", "Account"),
        section("automation", "Automation and access"),
        select("outbound_policy", "Email policy", ["Gmail drafts only"], default="Gmail drafts only", read_only=1),
        field("prepare_recurring_drafts", "Prepare due recurring invoice drafts automatically", "Check"),
        field("integration_enabled", "Enable SDS intake sync", "Check"),
        field("worker_origin", "SDS Worker origin", default="https://sds-agent-operations.sds-9991a64282bd.workers.dev"),
        field("worker_admin_token", "Worker administrator token", "Password"),
        field("gmail_enabled", "Enable Gmail draft creation", "Check"),
        field("gmail_client_id", "Google OAuth client ID"),
        field("gmail_client_secret", "Google OAuth client secret", "Password"),
        field("gmail_refresh_token", "Google refresh token", "Password"),
        field("gmail_verified_sender", "Verified Gmail account", "Data", options="Email"),
        field("last_intake_sync", "Last successful intake sync", "Datetime", read_only=1),
        field("last_control_check", "Last successful control check", "Datetime", read_only=1),
        field("last_scheduler_check", "Last hourly scheduler check", "Datetime", read_only=1),
        field("last_backup_verified", "Last verified backup", "Datetime", read_only=1),
        field("backup_max_age_hours", "Backup age alert (hours)", "Int", default=26),
        field("go_live_notes", "Review notes and remaining actions", "Small Text"),
    ]},
    {"name": "SDS Rate Card", "roles": ["SDS Owner", "SDS Commercial", "SDS Finance"], "fields": [
        field("title", "Role / service", reqd=1), link("expert", "Expert", "SDS Expert"),
        link("currency", "Currency", "Currency", reqd=1, default="USD"),
        currency("loaded_cost", "Loaded cost per day / unit", reqd=1),
        field("valid_from", "Valid from", "Date", reqd=1), field("valid_to", "Valid until", "Date", reqd=1),
        field("verified", "Verified supplier price", "Check"),
        field("evidence", "Supplier quotation / cost evidence", "Attach"),
        field("notes", "Basis and limitations", "Small Text"),
    ]},
    {"name": "SDS Estimate", "roles": ["SDS Owner", "SDS Commercial", "SDS Finance"], "is_submittable": 1, "fields": [
        field("title", "Opportunity / project", reqd=1), COMPANY, CUSTOMER,
        link("opportunity", "ERP opportunity", "Opportunity"),
        link("tender", "Tender", "SDS Tender"), OWNER,
        select("product_line", "Product line", ["Data & Reporting Review", "Managed Decision Analytics", "Institutional Data Platforms", "Platform Operations", "Research & Advisory", "Risk & Compliance", "Applied AI"], reqd=1),
        link("currency", "Quote currency", "Currency", reqd=1, default="USD"),
        field("duration_months", "Implementation months", "Int", default=1, reqd=1),
        field("collection_lag_months", "Receipt lag after acceptance (months)", "Int", default=2),
        field("valid_until", "Quote valid until", "Date", reqd=1),
        field("scope", "Scope and deliverables", "Text Editor", reqd=1),
        field("terms", "Payment, acceptance and change terms", "Text Editor", reqd=1),
        section("build", "Cost and pricing"),
        field("costs", "Cost inputs in quote currency", "Table", "SDS Cost Line", reqd=1),
        field("overhead_pct", "Overhead on direct cost (%)", "Percent", default=8),
        field("contingency_pct", "Implementation contingency (%)", "Percent", default=12),
        field("margin_pct", "Commercial margin on fee (%)", "Percent", default=25),
        field("tax_pct", "Quoted tax allowance (%)", "Percent", default=0),
        field("support_contingency_pct", "Support contingency (%)", "Percent", default=10),
        field("tax_reviewed", "Bid-specific tax treatment reviewed", "Check"),
        field("tax_review_note", "Tax treatment / reviewer", "Small Text"),
        field("margin_exception", "Owner-approved margin exception", "Check"),
        field("exchange_rate", "Company currency per quote currency", "Float", precision=8),
        field("fx_reviewed", "Exchange rate reviewed for quote", "Check"),
        field("exception_reason", "Exception reason", "Small Text"),
        *[currency(n, label, read_only=1) for n, label in [
            ("direct_cost", "Implementation direct cost"), ("overhead_cost", "Overhead"),
            ("contingency_cost", "Implementation contingency"), ("total_cost", "Cost and reserve"),
            ("fee_before_tax", "Implementation fee before tax"), ("tax_amount", "Tax allowance"),
            ("total_price", "Implementation quote total"), ("contribution", "Commercial contribution before company tax"),
            ("support_direct_cost", "Monthly support direct cost"), ("support_cost", "Monthly support cost and reserve"),
            ("support_fee", "Monthly support fee before tax"), ("support_contribution", "Monthly support contribution before tax"),
            ("peak_funding", "Illustrative peak funding need before taxes/financing"),
        ]],
        field("milestones", "Implementation milestone allocation", "Table", "SDS Estimate Milestone"),
        field("cashflow_json", "Calculated cash plan", "Code", "JSON", read_only=1, hidden=1),
        field("funding_calculated", "Funding calculated from a complete milestone plan", "Check", read_only=1),
        field("funding_note", "Funding calculation status", "Small Text", read_only=1),
        field("planning_notes", "Assumptions, exclusions and funding plan", "Small Text"),
        select("workflow_state", "Approval", ["Draft", "Review", "Approved", "Rejected", "Cancelled"], default="Draft", read_only=1),
        link("quotation", "Issued ERP quotation", "Quotation", read_only=1),
        link("support_quotation", "Recurring support quotation", "Quotation", read_only=1),
    ]},
    {"name": "SDS Expert", "roles": ["SDS Owner", "SDS People", "SDS Governance", "SDS Commercial"], "fields": [
        field("full_name", "Full name", reqd=1), field("email", "Verified work email", options="Email"),
        link("supplier", "Supplier / consultancy", "Supplier"), link("employee", "Employee", "Employee"),
        field("specialism", "Specialisms", "Small Text"), field("qualification", "Qualification"),
        field("years_experience", "Relevant years", "Float"), field("africa_years", "Years working in Africa", "Float"),
        field("qualification_evidence", "Qualification / CV evidence", "Attach"),
        field("verified", "Credentials and references verified", "Check"),
        field("available_from", "Available from", "Date"), field("available_until", "Available until", "Date"),
        field("commitment", "Signed availability / teaming commitment", "Attach"),
        field("credential_expiry", "Next credential review / expiry", "Date"),
        field("notes", "Verification and deployment notes", "Small Text"),
    ]},
    {"name": "SDS Tender", "roles": ["SDS Owner", "SDS Commercial", "SDS Governance"], "fields": [
        field("title", "Tender title", reqd=1), field("reference", "Buyer reference", reqd=1),
        field("buyer", "Buying organisation", reqd=1), field("portal_url", "Official procurement URL"),
        field("deadline", "Submission deadline (Nairobi display)", "Datetime"),
        field("deadline_verified", "Deadline verified in official portal", "Check"),
        field("tor_file", "Official terms of reference", "Attach"), OWNER,
        select("status", "Bid decision", ["Assessing", "Partner search", "Ready for owner review", "Approved to bid", "Submitted", "Won", "Lost", "No bid"], default="Assessing"),
        field("requirements", "Eligibility and submission requirements", "Table", "SDS Requirement"),
        field("bid_approval_evidence", "Owner bid approval evidence", "Small Text"),
        field("submission_receipt", "Portal submission receipt", "Attach"),
        field("decision_notes", "Decision and qualification gaps", "Small Text"),
    ]},
    {"name": "SDS Engagement", "roles": ["SDS Owner", "SDS Commercial", "SDS Delivery", "SDS Finance"], "fields": [
        field("title", "Contract / engagement", reqd=1), COMPANY, dict(CUSTOMER, reqd=1),
        link("estimate", "Approved estimate", "SDS Estimate", reqd=1),
        link("quotation", "ERP quotation", "Quotation"), link("sales_order", "Sales order", "Sales Order", read_only=1),
        PROJECT, OWNER,
        select("status", "Status", ["Draft", "Signed", "Active", "On hold", "Completed", "Cancelled"], default="Draft"),
        field("signed_contract", "Signed contract / accepted order", "Attach"),
        field("signed_on", "Signed on", "Date"), field("start_date", "Start date", "Date", reqd=1),
        field("end_date", "End date", "Date", reqd=1),
        field("acceptance_owner", "Client acceptance owner"),
        field("payment_terms", "Contractual payment and acceptance terms", "Small Text", reqd=1),
        field("payment_due_days", "Agreed invoice payment period (days)", "Int", default=30),
        field("payment_terms_reviewed", "Payment period checked against signed contract", "Check"),
        field("warranty_end", "Included stabilization / warranty ends", "Date"),
        field("renewal_date", "Support renewal / decision date", "Date"),
        link("currency", "Currency", "Currency", reqd=1),
        currency("contract_value", "Contract value incl. quoted tax", read_only=1),
        currency("baseline_cost", "Approved baseline cost and reserve", read_only=1),
        currency("forecast_remaining_cost", "Forecast cost to finish", default=0),
        field("forecast_reviewed_on", "Forecast reviewed on", "Date"),
        field("risk_notes", "Dependencies, risks and client decisions", "Small Text"),
    ]},
    {"name": "SDS Milestone", "roles": ["SDS Owner", "SDS Delivery", "SDS Finance"], "fields": [
        field("estimate_milestone_row", "Approved estimate milestone row", read_only=1, reqd=1),
        field("title", "Deliverable / milestone", reqd=1), link("engagement", "Engagement", "SDS Engagement", reqd=1),
        PROJECT, link("task", "ERP task", "Task"), OWNER,
        field("due_date", "Due date", "Date", reqd=1), field("review_days", "Client review working days", "Int", default=10),
        field("acceptance_criteria", "Acceptance criteria", "Small Text", reqd=1),
        select("status", "Status", ["Planned", "In progress", "Submitted", "Accepted", "Rework", "Invoiced", "Cancelled"], default="Planned"),
        field("deliverable_file", "Deliverable evidence", "Attach"),
        field("submitted_on", "Submitted on", "Date"), field("accepted_on", "Accepted on", "Date"),
        field("accepted_by", "Client approver"), field("acceptance_evidence", "Written acceptance evidence", "Attach"),
        link("currency", "Currency", "Currency", reqd=1), currency("fee_before_tax", "Milestone fee before tax", reqd=1),
        link("sales_invoice", "Draft / submitted sales invoice", "Sales Invoice", read_only=1),
        field("notes", "Review and rework notes", "Small Text"),
    ]},
    {"name": "SDS Variation", "roles": ["SDS Owner", "SDS Commercial", "SDS Delivery", "SDS Finance"], "fields": [
        field("title", "Change request", reqd=1), link("engagement", "Engagement", "SDS Engagement", reqd=1),
        field("description", "Scope and schedule impact", "Small Text", reqd=1),
        link("estimate", "Separate change estimate", "SDS Estimate", reqd=1),
        select("status", "Status", ["Draft", "Under review", "Client approved", "Rejected", "Implemented"], default="Draft"),
        field("client_approval", "Client approval evidence", "Attach"), OWNER,
    ]},
    {"name": "SDS Retainer", "roles": ["SDS Owner", "SDS Commercial", "SDS Delivery", "SDS Finance"], "fields": [
        field("title", "Recurring service", reqd=1), COMPANY, dict(CUSTOMER, reqd=1), PROJECT, OWNER,
        link("engagement", "Implementation engagement", "SDS Engagement"),
        link("currency", "Currency", "Currency", reqd=1), currency("monthly_fee", "Monthly fee before tax", reqd=1),
        field("scope", "Sources, outputs, capacity and coverage", "Small Text", reqd=1),
        field("agreement", "Signed recurring service agreement", "Attach", reqd=1),
        field("start_date", "Service start", "Date", reqd=1), field("end_date", "Service ends", "Date", reqd=1),
        field("next_invoice_date", "Next invoice period", "Date", reqd=1),
        field("renewal_notice_days", "Renewal notice days", "Int", default=30),
        select("status", "Status", ["Draft", "Active", "Paused", "Ended"], default="Draft"),
    ]},
    {"name": "SDS Obligation", "roles": ["SDS Owner", "SDS Governance", "SDS Finance", "SDS People"], "fields": [
        field("title", "Obligation / renewal", reqd=1), COMPANY, OWNER,
        select("category", "Category", ["Company filing", "Tax", "Contract", "Insurance", "Credential", "Security", "Backup", "Policy", "Subscription", "Other"], reqd=1),
        field("due_date", "Due date", "Date", reqd=1), field("lead_days", "Alert lead time (days)", "Int", default=14),
        select("status", "Status", ["Open", "In progress", "Completed", "Not applicable"], default="Open"),
        field("evidence", "Completion evidence", "Attach"), field("source_reference", "Authoritative requirement / source", "Small Text"),
        field("notes", "Action and review notes", "Small Text"),
    ]},
    {"name": "SDS Risk", "roles": ["SDS Owner", "SDS Governance", "SDS Delivery", "SDS Finance"], "fields": [
        field("title", "Risk / decision", reqd=1), COMPANY, PROJECT, OWNER,
        select("category", "Category", ["Commercial", "Delivery", "Financial", "People", "Security", "Legal", "Other"], reqd=1),
        select("severity", "Severity", ["Low", "Medium", "High", "Critical"], default="Medium"),
        select("status", "Status", ["Open", "Mitigating", "Accepted by owner", "Closed"], default="Open"),
        field("description", "Cause, consequence and mitigation", "Small Text", reqd=1),
        field("review_date", "Next review", "Date", reqd=1), field("closure_evidence", "Closure / acceptance record", "Small Text"),
    ]},
    {"name": "SDS Alert", "roles": ROLES, "fields": [
        field("alert_key", "Stable event key", reqd=1, unique=1, read_only=1),
        field("title", "Action required", reqd=1),
        select("severity", "Severity", ["Info", "Warning", "Critical"], default="Warning"),
        select("status", "Status", ["Open", "Acknowledged", "Resolved"], default="Open"),
        field("reference_doctype", "Record type", "Link", "DocType"),
        field("reference_name", "Record", "Dynamic Link", "reference_doctype"),
        field("responsible_user", "Responsible user", "Link", "User"),
        field("detail", "Details and next action", "Small Text"),
        field("last_seen", "Last observed", "Datetime", read_only=1),
    ]},
    {"name": "SDS Outbound Draft", "roles": ["SDS Owner", "SDS Commercial", "SDS Delivery", "SDS Finance"], "fields": [
        field("recipient", "Verified recipient", "Data", "Email", reqd=1),
        field("recipient_verified", "Recipient verified against correspondence / official source", "Check"),
        field("recipient_source", "Recipient verification source", "Small Text", reqd=1),
        field("subject", "Subject", reqd=1), field("message", "Message", "Text Editor", reqd=1),
        select("purpose", "Purpose", ["Cold outreach", "Follow-up", "Proposal", "Invoice", "Project update", "Supplier", "Internal", "Other"], reqd=1),
        field("reference_doctype", "Related record type", "Link", "DocType"),
        field("reference_name", "Related record", "Dynamic Link", "reference_doctype"),
        field("attachment", "Approved attachment", "Attach"),
        select("status", "Draft status", ["Prepared", "Saved in Gmail", "Owner marked sent", "Discarded"], default="Prepared", read_only=1),
        field("gmail_draft_id", "Gmail draft ID", read_only=1),
        field("gmail_message_id", "Gmail message ID", read_only=1),
        field("last_error", "Connection error", "Small Text", read_only=1),
        select("gmail_attempt_state", "Gmail request state", ["Not attempted", "Creating", "Uncertain", "Saved"], default="Not attempted", read_only=1),
        field("gmail_rfc_message_id", "Draft message identity", read_only=1),
        field("owner_sent_reference", "Owner's sent message reference"),
        field("origin_key", "Preparation key", unique=1),
    ]},
    {"name": "SDS Integration Record", "roles": ["SDS Owner"], "fields": [
        field("external_id", "SDS platform project ID", reqd=1, unique=1),
        field("external_updated_at", "Source updated at"),
        link("lead", "CRM lead", "CRM Lead"), link("customer", "ERP customer", "Customer"),
        field("source_hash", "Last imported content hash", read_only=1),
        field("last_sync", "Last successful sync", "Datetime", read_only=1),
        field("state", "Source state"), field("source_url", "Source record URL"),
    ]},
]

for definition in RECORDS:
    if not definition.get("istable"):
        definition["permissions"] = permissions(definition.pop("roles", ["SDS Owner"]))
    definition.setdefault("track_changes", not definition.get("istable"))
