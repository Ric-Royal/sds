import frappe
from frappe.utils import getdate, nowdate
from sds_ops.controls import require_roles, private_attachment
from sds_ops.pricing import number


def validate_settings(doc, method=None):
    require_roles("SDS Owner")
    doc.outbound_policy = "Gmail drafts only"
    number(doc.owner_income_target, "Owner income target")
    margin = number(doc.minimum_margin_pct, "Minimum margin")
    if margin >= 100:
        frappe.throw("Minimum margin must be below 100%.")
    if doc.live_finance_enabled and not all([doc.legal_identity_reviewed, doc.tax_setup_reviewed,
        doc.opening_balances_reviewed, doc.bank_setup_reviewed]):
        frappe.throw("Review legal identity, tax/payroll setup, opening balances and financial accounts first.")
    if doc.worker_origin != "https://sds-agent-operations.sds-9991a64282bd.workers.dev":
        frappe.throw("The SDS integration currently supports only the approved production Worker origin.")
    if doc.integration_enabled and not doc.get_password("worker_admin_token", raise_exception=False):
        frappe.throw("Enter the existing Worker administrator token privately to enable sync.")
    if doc.gmail_enabled and not all([doc.gmail_client_id, doc.gmail_verified_sender,
        doc.get_password("gmail_client_secret", raise_exception=False),
        doc.get_password("gmail_refresh_token", raise_exception=False)]):
        frappe.throw("Complete the authorised Gmail account configuration before enabling drafts.")


def validate_tender(doc, method=None):
    if doc.status in ("Approved to bid", "Submitted", "Won"):
        require_roles("SDS Owner")
        missing = [r.requirement for r in doc.requirements if r.mandatory and r.status != "Verified"]
        if missing or not doc.deadline_verified or not doc.deadline or not doc.bid_approval_evidence:
            frappe.throw("Verify the official deadline, mandatory requirements and owner bid approval first.")
        if doc.status == "Submitted" and not doc.submission_receipt:
            frappe.throw("Attach the procurement portal receipt before marking a bid Submitted.")
    if doc.tor_file:
        private_attachment(doc.tor_file, "Terms of reference")


def validate_obligation(doc, method=None):
    if doc.status == "Completed" and not doc.evidence:
        frappe.throw("Attach completion evidence before closing an obligation.")
    if doc.evidence:
        private_attachment(doc.evidence, "Obligation evidence")


def validate_expert(doc, method=None):
    number(doc.years_experience or 0, "Experience")
    number(doc.africa_years or 0, "African experience")
    if (doc.africa_years or 0) > (doc.years_experience or 0):
        frappe.throw("African experience cannot exceed total relevant experience.")
    if doc.available_from and doc.available_until and getdate(doc.available_until) < getdate(doc.available_from):
        frappe.throw("The expert availability period is invalid.")
    if doc.verified:
        require_roles("SDS Owner", "SDS People", "SDS Governance")
        if not doc.qualification or not doc.qualification_evidence:
            frappe.throw("Record the qualification and attach credential/reference evidence.")
    for url, label in [(doc.qualification_evidence, "Expert credentials"), (doc.commitment, "Expert commitment")]:
        if url:
            private_attachment(url, label)


def validate_risk(doc, method=None):
    if doc.status in ("Closed", "Accepted by owner") and not doc.closure_evidence:
        frappe.throw("Record the risk closure or acceptance decision.")
    if doc.status == "Accepted by owner":
        require_roles("SDS Owner")


def validate_variation(doc, method=None):
    estimate = frappe.get_doc("SDS Estimate", doc.estimate)
    if doc.status in ("Client approved", "Implemented"):
        require_roles("SDS Owner")
        if estimate.docstatus != 1 or not doc.client_approval:
            frappe.throw("Approve the separate change estimate and attach client approval first.")
        private_attachment(doc.client_approval, "Contract variation approval")


def validate_retainer(doc, method=None):
    number(doc.monthly_fee, "Monthly fee", minimum=0.01)
    if getdate(doc.end_date) < getdate(doc.start_date):
        frappe.throw("The recurring service period is invalid.")
    private_attachment(doc.agreement, "Recurring service agreement")
    if doc.engagement:
        engagement = frappe.get_doc("SDS Engagement", doc.engagement)
        if (doc.customer,doc.company,doc.currency)!=(engagement.customer,engagement.company,engagement.currency):
            frappe.throw("Recurring service customer, company and currency must match the approved engagement.")
        if engagement.warranty_end and getdate(doc.start_date) <= getdate(engagement.warranty_end):
            frappe.throw("The support start overlaps included stabilization. Amend the contract boundary first.")
    if doc.status == "Active":
        require_roles("SDS Owner")
        if getdate(doc.next_invoice_date) < getdate(doc.start_date):
            frappe.throw("The next invoice period precedes the service start.")
