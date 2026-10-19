import frappe
from frappe.utils import get_first_day, nowdate
from sds_ops.controls import require_roles
from sds_ops.setup import AREAS


@frappe.whitelist()
def overview():
    require_roles("SDS Owner","SDS Finance")
    settings=frappe.get_single("SDS Settings")
    company=settings.company
    currency=frappe.db.get_value("Company",company,"default_currency")
    receivables=frappe.db.sql("""select currency,sum(outstanding_amount) outstanding,
        sum(case when due_date<%s then outstanding_amount else 0 end) overdue
        from `tabSales Invoice` where company=%s and docstatus=1 and outstanding_amount>0 group by currency""",
        (nowdate(),company),as_dict=True)
    payables=frappe.db.sql("""select currency,sum(outstanding_amount) outstanding
        from `tabPurchase Invoice` where company=%s and docstatus=1 and outstanding_amount>0 group by currency""",company,as_dict=True)
    retainers=frappe.db.sql("""select currency,sum(monthly_fee) monthly_fee,count(*) clients
        from `tabSDS Retainer` where company=%s and status='Active' and start_date<=%s and end_date>=%s group by currency""",
        (company,nowdate(),nowdate()),as_dict=True)
    books=frappe.db.sql("""select a.root_type,sum(g.debit-g.credit) balance
        from `tabGL Entry` g join `tabAccount` a on a.name=g.account
        where g.company=%s and g.is_cancelled=0 and g.posting_date between %s and %s
        and a.root_type in ('Income','Expense') group by a.root_type""",
        (company,get_first_day(nowdate()),nowdate()),as_dict=True)
    cash=frappe.db.sql("""select coalesce(sum(g.debit-g.credit),0) balance from `tabGL Entry` g
        join `tabAccount` a on a.name=g.account where g.company=%s and g.is_cancelled=0
        and g.posting_date<=%s and a.account_type in ('Bank','Cash')""",(company,nowdate()),as_dict=True)[0].balance
    income=-sum(r.balance for r in books if r.root_type=="Income")
    expense=sum(r.balance for r in books if r.root_type=="Expense")
    return {"company":company,"currency":currency,"owner_target":settings.owner_income_target,
        "financial_posting_enabled":bool(settings.live_finance_enabled),
        "book_income_month":income,"book_expenses_month":expense,"book_cash_balance":cash,
        "cash_note":"Ledger balance, not confirmed bank cash or an owner withdrawal recommendation.",
        "receivables":receivables,"payables":payables,"retainers":retainers,
        "estimates":frappe.db.count("SDS Estimate",{"docstatus":0}),
        "engagements":frappe.db.count("SDS Engagement",{"company":company,"status":"Active"}),
        "open_support":frappe.db.count("HD Ticket",{"status":["not in",["Closed","Resolved"]]}),
        "alerts":frappe.get_all("SDS Alert",filters={"status":["in",["Open","Acknowledged"]]},
            fields=["name","title","severity","reference_doctype","reference_name","detail"],order_by="modified desc",limit=50),
        "areas":AREAS,"last_control_check":settings.last_control_check,
        "last_intake_sync":settings.last_intake_sync,"last_backup_verified":settings.last_backup_verified,
        "gmail_connected":bool(settings.gmail_enabled),"intake_connected":bool(settings.integration_enabled)}


@frappe.whitelist()
def project_costs(engagement):
    require_roles("SDS Owner","SDS Finance","SDS Delivery")
    doc=frappe.get_doc("SDS Engagement",engagement)
    doc.check_permission("read")
    # GL is the booked cost authority. Timesheet cost is shown separately to avoid double counting payroll.
    actual=0
    hours=0
    if doc.project:
        actual=frappe.db.sql("""select coalesce(sum(g.debit-g.credit),0) from `tabGL Entry` g
            join `tabAccount` a on a.name=g.account where g.project=%s and g.company=%s
            and g.is_cancelled=0 and a.root_type='Expense'""",(doc.project,doc.company))[0][0]
        hours=frappe.db.sql("""select coalesce(sum(t.hours),0) from `tabTimesheet Detail` t
            join `tabTimesheet` p on p.name=t.parent where t.project=%s and p.docstatus=1""",doc.project)[0][0]
    estimate=frappe.get_doc("SDS Estimate",doc.estimate)
    rate=1 if doc.currency==frappe.db.get_value("Company",doc.company,"default_currency") else estimate.exchange_rate
    return {"baseline_cost_quote_currency":doc.baseline_cost,"quote_currency":doc.currency,
        "booked_expense_company_currency":actual,"submitted_hours":hours,
        "forecast_remaining_quote_currency":doc.forecast_remaining_cost,
        "forecast_reviewed_on":doc.forecast_reviewed_on,
        "forecast_total_quote_currency":None if not rate or not doc.forecast_reviewed_on else actual/rate+doc.forecast_remaining_cost,
        "note":"Do not add timesheet labour cost to GL expense if it is already posted through payroll or supplier bills."}
