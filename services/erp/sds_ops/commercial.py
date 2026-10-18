import json
from decimal import Decimal

import frappe
from frappe.utils import getdate, nowdate

from sds_ops.controls import require_roles, private_attachment
from sds_ops.pricing import calculate, PricingError, number


def validate_estimate(doc, method=None):
    try:
        result = calculate(doc.as_dict())
    except PricingError as exc:
        frappe.throw(str(exc))
    for row, calculated in zip(doc.costs, result.pop("costs"), strict=True):
        row.amount = calculated["amount"]
    doc.cashflow_json = json.dumps(result.pop("cashflow"), default=str)
    result.pop("milestone_allocation")
    for key, value in result.items():
        doc.set(key, value)
    doc.funding_calculated=bool(doc.milestones)
    doc.funding_note=("Uniform cost-and-reserve spend; excludes tax, withholding and financing."
                      if doc.milestones else "Funding is not calculated until the milestone allocation is complete.")
    if getdate(doc.valid_until) < getdate(nowdate()) and doc.docstatus == 0:
        frappe.msgprint("This estimate has expired. Revise its validity before approval.", alert=True)
    if doc.margin_exception:
        require_roles("SDS Owner")
        if not doc.exception_reason:
            frappe.throw("Record the reason for the margin exception.")


def approve_estimate(doc, method=None):
    require_roles("SDS Owner")
    if getdate(doc.valid_until) < getdate(nowdate()):
        frappe.throw("The estimate validity has expired.")
    if not doc.tax_reviewed or not doc.tax_review_note:
        frappe.throw("Review and document the bid-specific tax treatment before approval.")
    if doc.product_line=="Institutional Data Platforms" and not doc.milestones:
        frappe.throw("Institutional platform approval requires an agreed milestone allocation.")
    for row in doc.costs:
        if not row.verified or not row.source_reference:
            frappe.throw(f"Verify and reference the cost for {row.description} before approval.")
        if row.rate_card:
            card = frappe.get_doc("SDS Rate Card", row.rate_card)
            if not card.verified or getdate(card.valid_to) < getdate(nowdate()):
                frappe.throw(f"The rate card for {row.description} is unverified or expired.")
            if card.currency != doc.currency:
                frappe.throw("Rate card currency must match the estimate; explicitly cost any conversion.")
    settings = frappe.get_single("SDS Settings")
    if Decimal(str(doc.margin_pct)) < Decimal(str(settings.minimum_margin_pct or 0)) and not doc.margin_exception:
        frappe.throw("The estimate needs an owner-approved margin exception.")
    if doc.tender:
        tender = frappe.get_doc("SDS Tender", doc.tender)
        missing = [r.requirement for r in tender.requirements if r.mandatory and r.status != "Verified"]
        if missing:
            frappe.throw("Mandatory tender requirements remain unverified: " + "; ".join(missing))


def validate_rate_card(doc, method=None):
    number(doc.loaded_cost, "Loaded cost")
    if getdate(doc.valid_to) < getdate(doc.valid_from):
        frappe.throw("The rate card end date precedes its start date.")
    if doc.verified:
        require_roles("SDS Owner", "SDS Finance")
        if not doc.evidence:
            frappe.throw("Attach the supplier quotation / cost evidence before verifying a rate.")
        private_attachment(doc.evidence, "Rate evidence")


def require_estimate(doc, method=None):
    if doc.company == frappe.get_single("SDS Settings").company:
        if not doc.sds_estimate:
            frappe.throw("SDS quotations require an approved SDS Estimate. Prepare and approve the estimate first.")
        validate_quotation(doc)


def validate_quotation(doc, method=None):
    if not doc.get("sds_estimate"):
        return
    estimate=frappe.get_doc("SDS Estimate",doc.sds_estimate)
    if estimate.docstatus!=1:
        frappe.throw("The linked SDS estimate must be approved and active.")
    kind=doc.sds_quote_kind
    if kind not in ("Implementation","Monthly support"):
        frappe.throw("Invalid SDS quotation type.")
    amount=estimate.fee_before_tax if kind=="Implementation" else estimate.support_fee
    item="SDS Implementation" if kind=="Implementation" else "SDS Monthly Service"
    expected_rate=1 if estimate.currency==frappe.db.get_value("Company",estimate.company,"default_currency") else estimate.exchange_rate
    mismatch=(doc.company!=estimate.company or doc.party_name!=estimate.customer or doc.currency!=estimate.currency
        or str(doc.valid_till)!=str(estimate.valid_until) or doc.terms!=estimate.terms
        or abs(float(doc.conversion_rate or 0)-float(expected_rate or 0))>0.0000001
        or len(doc.items)!=1 or doc.items[0].item_code!=item or float(doc.items[0].qty)!=1
        or abs(float(doc.items[0].rate)-float(amount))>0.005
        or doc.items[0].description!=estimate.scope or float(doc.discount_amount or 0)!=0
        or abs(float(doc.net_total)-float(amount))>0.02
        or abs(float(doc.total_taxes_and_charges)-round(float(amount)*float(estimate.tax_pct)/100,2))>0.02)
    if mismatch:
        frappe.throw("Quotation differs from its approved SDS estimate. Revise and approve an estimate before changing commercial terms.")


@frappe.whitelist()
def create_quotation(estimate, kind="Implementation"):
    require_roles("SDS Owner", "SDS Commercial")
    frappe.db.sql("select name from `tabSDS Estimate` where name=%s for update",estimate)
    doc = frappe.get_doc("SDS Estimate", estimate)
    doc.check_permission("read")
    if doc.docstatus != 1:
        frappe.throw("Approve the estimate before creating a client quotation.")
    if kind not in ("Implementation", "Monthly support"):
        frappe.throw("Choose Implementation or Monthly support.")
    target_field = "quotation" if kind == "Implementation" else "support_quotation"
    if doc.get(target_field):
        return doc.get(target_field)
    if not doc.customer:
        frappe.throw("Link a verified ERP customer before issuing a quotation.")
    company_currency = frappe.db.get_value("Company", doc.company, "default_currency")
    if doc.currency != company_currency and (not doc.fx_reviewed or not doc.exchange_rate or doc.exchange_rate <= 0):
        frappe.throw("Review the company-currency exchange rate before creating this quotation.")
    amount = doc.fee_before_tax if kind == "Implementation" else doc.support_fee
    if amount <= 0:
        frappe.throw("This quotation has no priced work.")
    item = "SDS Implementation" if kind == "Implementation" else "SDS Monthly Service"
    quote = frappe.get_doc({"doctype": "Quotation", "quotation_to": "Customer", "party_name": doc.customer,
        "company": doc.company, "transaction_date": nowdate(), "valid_till": doc.valid_until,
        "currency": doc.currency, "conversion_rate": 1 if doc.currency == company_currency else doc.exchange_rate,
        "selling_price_list": "Standard Selling", "ignore_pricing_rule": 1,
        "items": [{"item_code": item, "qty": 1, "rate": amount, "description": doc.scope}],
        "terms": doc.terms, "sds_estimate": doc.name, "sds_quote_kind": kind})
    if doc.tax_pct:
        account = frappe.db.get_single_value("SDS Settings", "sales_tax_account")
        if not account:
            frappe.throw("Select the reviewed sales tax account in SDS Settings.")
        quote.append("taxes", {"charge_type": "On Net Total", "account_head": account,
                              "description": doc.tax_review_note, "rate": doc.tax_pct})
    quote.insert()
    doc.db_set(target_field, quote.name)
    doc.add_comment("Info", f"Created {kind} quotation {quote.name}; client acceptance is not implied.")
    return quote.name


@frappe.whitelist()
def instantiate_institutional_example():
    """Create an editable, unapproved costing example. Never generate a client quotation."""
    require_roles("SDS Owner", "SDS Commercial")
    from frappe.utils import add_days
    settings = frappe.get_single("SDS Settings")
    doc = frappe.new_doc("SDS Estimate")
    doc.update({"title": "Illustrative institutional programme — replace costs with supplier quotes",
        "company": settings.company, "responsible_user": frappe.session.user,
        "product_line": "Institutional Data Platforms", "currency": "USD", "duration_months": 10,
        "collection_lag_months": 2, "valid_until": add_days(nowdate(), 30),
        "scope": "Ten-month illustration. No AGRA budget, eligibility or bid commitment is implied.",
        "terms": "Accepted-deliverable payment profile is illustrative. Replace with the signed contract terms.",
        "overhead_pct": 8, "contingency_pct": 12, "margin_pct": 25, "tax_pct": 0,
        "support_contingency_pct": 10, "tax_reviewed": 0,
        "planning_notes": "Imported workbook assumptions. Rates, staffing, tax and receipt lag require review. Cashflow excludes tax, financing and withholding."})
    for role, fte, rate in [("Team leader MSc/PhD",1,500),("Engineering lead PhD",1,600),
        ("GIS expert",1,400),("Systems developer",1,350),("Data engineer",0.5,400),
        ("QA engineer",0.6,300),("Security specialist",0.1,650),("Training specialist",0.2,300)]:
        doc.append("costs", {"description": role, "allocation": "Implementation", "basis": "FTE months",
            "fte": fte, "months": 10, "days_per_month": 20, "rate": rate,
            "source_reference": "Unverified planning assumption from SDS quote workbook", "verified": 0})
    for title, amount in [("Travel",24000),("Cloud/licences",12000),("Independent security testing",10000),("Translation",8000)]:
        doc.append("costs", {"description":title,"allocation":"Implementation","basis":"Units","quantity":1,"rate":amount,"source_reference":"Unverified planning assumption"})
    for title, qty, rate in [("Engineering",2,400),("Analytics",4,300),("Monitoring",6,250),("Cloud allowance",1,500)]:
        doc.append("costs", {"description":title,"allocation":"Monthly support","basis":"Units","quantity":qty,"rate":rate,"source_reference":"Unverified planning assumption"})
    for month, share in [(1,10),(2,15),(4,15),(6,20),(8,20),(10,20)]:
        doc.append("milestones", {"title":f"Illustrative milestone month {month}","month":month,"fee_pct":share,
            "acceptance_criteria":"Replace with the buyer's deliverable and written acceptance criteria.","review_days":10})
    doc.insert()
    return doc.name
