from decimal import Decimal
import frappe
from frappe.utils import add_days, add_months, getdate, nowdate
from sds_ops.controls import require_roles, private_attachment
from sds_ops.pricing import cash, number, milestone_amounts


def validate_engagement(doc, method=None):
    estimate = frappe.get_doc("SDS Estimate", doc.estimate)
    if estimate.docstatus != 1:
        frappe.throw("An engagement must link an approved estimate.")
    if estimate.company != doc.company or estimate.customer != doc.customer or estimate.currency != doc.currency:
        frappe.throw("Company, customer and currency must match the approved estimate.")
    if getdate(doc.end_date) < getdate(doc.start_date):
        frappe.throw("The contract end precedes its start.")
    doc.contract_value = estimate.total_price
    doc.baseline_cost = estimate.total_cost
    number(doc.forecast_remaining_cost or 0, "Forecast remaining cost")
    if doc.status in ("Signed", "Active", "Completed"):
        require_roles("SDS Owner")
        if not doc.signed_contract or not doc.signed_on or not doc.acceptance_owner:
            frappe.throw("Record the signed agreement, signing date and client acceptance owner.")
        private_attachment(doc.signed_contract, "Signed contract")
        if not doc.payment_terms_reviewed or doc.payment_due_days is None or doc.payment_due_days<0:
            frappe.throw("Check the invoice payment period against the signed contract.")
    if doc.status == "Completed":
        unfinished = frappe.db.count("SDS Milestone", {"engagement":doc.name,"status":["not in",["Accepted","Invoiced","Cancelled"]]})
        if unfinished:
            frappe.throw("Accept or formally cancel remaining milestones before completing the engagement.")


def validate_milestone(doc, method=None):
    engagement = frappe.get_doc("SDS Engagement", doc.engagement)
    estimate=frappe.get_doc("SDS Estimate",engagement.estimate)
    row=next((r for r in estimate.milestones if r.name==doc.estimate_milestone_row),None)
    amounts=milestone_amounts(estimate.fee_before_tax,[r.fee_pct for r in estimate.milestones])
    expected=next((amount for r,amount in zip(estimate.milestones,amounts,strict=True) if r.name==doc.estimate_milestone_row),None)
    if not row or estimate.docstatus!=1 or abs(Decimal(str(doc.fee_before_tax or 0))-expected)>Decimal("0.005"):
        frappe.throw("Milestone fee must match its approved estimate allocation. Use an approved variation for additional work.")
    if doc.project!=engagement.project and engagement.project:
        frappe.throw("Milestone project must match its signed engagement.")
    if doc.currency != engagement.currency:
        frappe.throw("Milestone currency must match the engagement.")
    number(doc.fee_before_tax, "Milestone fee")
    if doc.status in ("Accepted", "Invoiced"):
        require_roles("SDS Owner", "SDS Delivery")
        if not all([doc.accepted_on, doc.accepted_by, doc.acceptance_evidence, doc.deliverable_file]):
            frappe.throw("Record delivery, written client acceptance, the approver and acceptance date first.")
        private_attachment(doc.acceptance_evidence, "Milestone acceptance")
        private_attachment(doc.deliverable_file, "Milestone deliverable")
    if doc.status == "Submitted" and (not doc.submitted_on or not doc.deliverable_file):
        frappe.throw("Record the submission date and deliverable evidence.")
    if doc.sales_invoice and doc.status != "Invoiced":
        frappe.throw("A milestone with an invoice stays Invoiced; use invoice cancellation for corrections.")


@frappe.whitelist()
def activate_engagement(engagement):
    require_roles("SDS Owner")
    frappe.db.sql("select name from `tabSDS Engagement` where name=%s for update",engagement)
    doc = frappe.get_doc("SDS Engagement", engagement)
    doc.check_permission("write")
    if doc.status not in ("Signed", "Active"):
        frappe.throw("Record the signed contract before activating delivery.")
    if doc.project:
        return doc.project
    estimate = frappe.get_doc("SDS Estimate", doc.estimate)
    if not estimate.milestones:
        frappe.throw("Add and approve a milestone allocation before activating institutional delivery.")
    project = frappe.get_doc({"doctype":"Project","project_name":doc.title,"company":doc.company,
        "customer":doc.customer,"expected_start_date":doc.start_date,"expected_end_date":doc.end_date,
        "status":"Open","sds_engagement":doc.name}).insert()
    amounts=milestone_amounts(estimate.fee_before_tax,[r.fee_pct for r in estimate.milestones])
    for row,amount in zip(estimate.milestones,amounts,strict=True):
        due = add_days(add_months(doc.start_date, row.month), -1)
        task = frappe.get_doc({"doctype":"Task","subject":row.title,"project":project.name,
            "exp_start_date":doc.start_date,"exp_end_date":due,"description":row.acceptance_criteria}).insert()
        frappe.get_doc({"doctype":"SDS Milestone","title":row.title,"engagement":doc.name,
            "estimate_milestone_row":row.name,
            "project":project.name,"task":task.name,"responsible_user":doc.responsible_user,
            "due_date":due,"review_days":row.review_days,"acceptance_criteria":row.acceptance_criteria,
            "currency":doc.currency,"fee_before_tax":amount}).insert()
    doc.project=project.name
    doc.status="Active"
    doc.save()
    doc.add_comment("Info", "Activated delivery under signed terms. No advance payment or client acceptance was inferred.")
    return project.name


def invoice_values(estimate, customer, company, currency, amount, description, project=None, due_days=30):
    company_currency = frappe.db.get_value("Company",company,"default_currency")
    rate = 1 if currency == company_currency else estimate.exchange_rate
    if currency != company_currency and (not estimate.fx_reviewed or not rate):
        frappe.throw("Review the estimate's company-currency exchange rate first.")
    values={"doctype":"Sales Invoice","customer":customer,"company":company,"posting_date":nowdate(),
        "due_date":add_days(nowdate(),due_days),"currency":currency,"conversion_rate":rate,
        "selling_price_list":"Standard Selling","ignore_pricing_rule":1,"project":project,
        "items":[{"item_code":"SDS Implementation","qty":1,"rate":amount,"description":description}],
        "sds_estimate":estimate.name}
    if estimate.tax_pct:
        account=frappe.db.get_single_value("SDS Settings","sales_tax_account")
        if not account:
            frappe.throw("Configure the reviewed sales tax account first.")
        values["taxes"]=[{"charge_type":"On Net Total","account_head":account,
                           "description":estimate.tax_review_note,"rate":estimate.tax_pct}]
    return values


@frappe.whitelist()
def create_milestone_invoice(milestone):
    require_roles("SDS Owner","SDS Finance")
    frappe.db.sql("select name from `tabSDS Milestone` where name=%s for update",milestone)
    doc=frappe.get_doc("SDS Milestone",milestone)
    doc.check_permission("read")
    if doc.sales_invoice:
        return doc.sales_invoice
    if doc.status != "Accepted":
        frappe.throw("Written client acceptance is required before preparing this invoice.")
    validate_milestone(doc)
    engagement=frappe.get_doc("SDS Engagement",doc.engagement)
    estimate=frappe.get_doc("SDS Estimate",engagement.estimate)
    invoice=frappe.get_doc(invoice_values(estimate,engagement.customer,engagement.company,doc.currency,
        doc.fee_before_tax,doc.title,doc.project,engagement.payment_due_days))
    invoice.sds_milestone=doc.name
    invoice.insert()
    doc.sales_invoice=invoice.name
    doc.status="Invoiced"
    doc.save()
    doc.add_comment("Info",f"Prepared draft invoice {invoice.name}; submission, eTIMS and sending remain separate.")
    return invoice.name


@frappe.whitelist()
def create_retainer_invoice(retainer):
    require_roles("SDS Owner","SDS Finance")
    frappe.db.sql("select name from `tabSDS Retainer` where name=%s for update",retainer)
    doc=frappe.get_doc("SDS Retainer",retainer)
    doc.check_permission("read")
    if doc.status != "Active" or getdate(doc.next_invoice_date)>getdate(nowdate()):
        frappe.throw("This retainer has no invoice period due.")
    if getdate(doc.next_invoice_date)>getdate(doc.end_date):
        frappe.throw("The recurring service agreement has ended.")
    key=f"{doc.name}:{doc.next_invoice_date}"
    existing=frappe.db.get_value("Sales Invoice",{"sds_billing_key":key},"name")
    if existing:
        return existing
    if not doc.engagement:
        frappe.throw("Link an approved engagement for currency and tax treatment before automated billing.")
    engagement=frappe.get_doc("SDS Engagement",doc.engagement)
    estimate=frappe.get_doc("SDS Estimate",engagement.estimate)
    invoice=frappe.get_doc(invoice_values(estimate,doc.customer,doc.company,doc.currency,doc.monthly_fee,
        f"{doc.title}: service period from {doc.next_invoice_date}",doc.project,engagement.payment_due_days))
    invoice.sds_billing_key=key
    invoice.items[0].item_code="SDS Monthly Service"
    invoice.insert()
    doc.db_set("next_invoice_date",add_months(doc.next_invoice_date,1))
    return invoice.name
