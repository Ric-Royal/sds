"""Local alerts and draft preparation. No email, payment or contract is sent automatically."""
from datetime import timedelta
import frappe
from frappe.utils import add_days, getdate, get_datetime, now_datetime, nowdate


def alert(key,title,severity="Warning",doctype=None,name=None,detail="",user=None):
    existing=frappe.db.get_value("SDS Alert",{"alert_key":key},"name")
    doc=frappe.get_doc("SDS Alert",existing) if existing else frappe.new_doc("SDS Alert")
    doc.update({"alert_key":key,"title":title,"severity":severity,"reference_doctype":doctype,
        "reference_name":name,"detail":detail,"last_seen":now_datetime(),
        "responsible_user":user or frappe.db.get_single_value("SDS Settings","owner_user") or "Administrator"})
    if existing and doc.status=="Resolved":doc.status="Open"
    doc.save(ignore_permissions=True)
    return doc.name


def run_checks():
    today=getdate(nowdate())
    active=set()
    def emit(key,*args,**kwargs):
        active.add(key)
        return alert(key,*args,**kwargs)
    for row in frappe.get_all("SDS Milestone",filters={"status":["not in",["Accepted","Invoiced","Cancelled"]]},fields=["name","title","due_date","responsible_user"]):
        if getdate(row.due_date)<today:
            emit("milestone:"+row.name,"Overdue deliverable: "+row.title,"Warning","SDS Milestone",row.name,
                 "Review delivery, client dependencies and the revised date.",row.responsible_user)
    for row in frappe.get_all("SDS Tender",filters={"status":["in",["Assessing","Partner search","Ready for owner review","Approved to bid"]]},fields=["name","title","deadline","deadline_verified","responsible_user"]):
        if not row.deadline_verified:
            emit("tender-deadline:"+row.name,"Verify official bid deadline: "+row.title,"Warning","SDS Tender",row.name,user=row.responsible_user)
        elif row.deadline and getdate(row.deadline)<=add_days(today,7):
            emit("tender-due:"+row.name,"Bid deadline approaching or passed: "+row.title,"Critical","SDS Tender",row.name,user=row.responsible_user)
    for row in frappe.get_all("SDS Obligation",filters={"status":["in",["Open","In progress"]]},fields=["name","title","due_date","lead_days","responsible_user"]):
        if getdate(row.due_date)<=add_days(today,row.lead_days or 0):
            emit("obligation:"+row.name,"Obligation due: "+row.title,"Critical" if getdate(row.due_date)<today else "Warning",
                 "SDS Obligation",row.name,"Review the authoritative requirement and complete the action.",row.responsible_user)
    for row in frappe.get_all("SDS Expert",fields=["name","full_name","credential_expiry"]):
        if row.credential_expiry and getdate(row.credential_expiry)<=add_days(today,30):
            emit("expert:"+row.name,"Review expert credentials: "+row.full_name,"Warning","SDS Expert",row.name)
    for row in frappe.get_all("SDS Retainer",filters={"status":"Active"},fields=["name","title","end_date","next_invoice_date","renewal_notice_days","responsible_user"]):
        if getdate(row.end_date)<=add_days(today,row.renewal_notice_days or 30):
            emit("retainer:"+row.name,"Recurring service renewal: "+row.title,"Warning","SDS Retainer",row.name,user=row.responsible_user)
        if getdate(row.next_invoice_date)<=today<=getdate(row.end_date):
            emit("retainer-bill:"+row.name,"Prepare recurring service invoice: "+row.title,"Info","SDS Retainer",row.name,user=row.responsible_user)
    settings=frappe.get_single("SDS Settings")
    for row in frappe.get_all("Sales Invoice",filters={"company":settings.company,"docstatus":1,"outstanding_amount":[">",0],"due_date":["<",today]},fields=["name","customer","outstanding_amount","currency"]):
        emit("receivable:"+row.name,"Overdue invoice: "+row.name,"Warning","Sales Invoice",row.name,
             f"{row.currency} {row.outstanding_amount} outstanding for {row.customer}. Prepare a follow-up draft; do not mark paid without reconciliation.")
    for row in frappe.get_all("SDS Risk",filters={"status":["!=","Closed"],"review_date":["<=",today]},fields=["name","title","severity","responsible_user"]):
        emit("risk:"+row.name,"Risk review due: "+row.title,"Critical" if row.severity=="Critical" else "Warning","SDS Risk",row.name,user=row.responsible_user)
    if not settings.last_backup_verified or (now_datetime()-get_datetime(settings.last_backup_verified))>timedelta(hours=settings.backup_max_age_hours or 26):
        emit("backup-age","A verified backup is missing or overdue","Critical","SDS Settings","SDS Settings",
             "Run the backup and restore verification procedure. A file existing is not proof that recovery works.")
    if not settings.live_finance_enabled:
        emit("finance-review","Complete the company financial setup review","Warning","SDS Settings","SDS Settings",
             "Legal identity, tax/payroll, opening balances and banking need owner/accountant review before real posting.")
    # Resolve only alerts owned by this checker. Integration and manually created alerts remain intact.
    prefixes=("milestone:","tender-deadline:","tender-due:","obligation:","expert:","retainer:","retainer-bill:","receivable:","risk:")
    for row in frappe.get_all("SDS Alert",filters={"status":["in",["Open","Acknowledged"]]},fields=["name","alert_key"]):
        if (row.alert_key.startswith(prefixes) or row.alert_key in ("backup-age","finance-review")) and row.alert_key not in active:
            frappe.db.set_value("SDS Alert",row.name,"status","Resolved")
    settings.db_set("last_control_check",now_datetime())
    return {"active_checks":len(active)}


def scheduled_checks():
    result=run_checks()
    frappe.db.set_single_value("SDS Settings","last_scheduler_check",now_datetime())
    return result


def prepare_recurring_invoices():
    settings=frappe.get_single("SDS Settings")
    if not settings.prepare_recurring_drafts:return {"enabled":False,"prepared":0}
    from sds_ops.delivery import create_retainer_invoice
    prepared=0
    for name in frappe.get_all("SDS Retainer",filters={"status":"Active","next_invoice_date":["<=",nowdate()],
        "end_date":[">=",nowdate()]},pluck="name"):
        frappe.db.savepoint("retainer_draft")
        try:
            invoice=create_retainer_invoice(name)
            alert("retainer-draft:"+invoice,"Review recurring invoice draft "+invoice,"Info","Sales Invoice",invoice,
                "A draft was prepared from the signed service agreement. Review accounting and eTIMS; Richard sends the email.")
            prepared+=1
        except Exception:
            frappe.db.rollback(save_point="retainer_draft")
            alert("retainer-draft-error:"+name,"Recurring invoice preparation needs review","Warning","SDS Retainer",name,
                "Check the signed agreement, next period, currency and tax configuration. No invoice was posted or sent.")
    return {"enabled":True,"prepared":prepared}


def prepare_owner_digest():
    settings=frappe.get_single("SDS Settings")
    rows=frappe.get_all("SDS Alert",filters={"status":["in",["Open","Acknowledged"]]},fields=["title","severity","detail"],order_by="modified desc",limit=100)
    from frappe.utils import escape_html
    content="<h3>SDS actions for "+nowdate()+"</h3>"+"".join(
        "<p><strong>"+escape_html(r.severity+": "+r.title)+"</strong><br>"+escape_html(r.detail or "")+"</p>" for r in rows)
    # Internal notification, not an email. One log entry per day.
    subject="SDS daily operations: "+nowdate()
    if not frappe.db.exists("Notification Log",{"subject":subject,"for_user":settings.owner_user}):
        frappe.get_doc({"doctype":"Notification Log","subject":subject,"for_user":settings.owner_user,
            "type":"Alert","email_content":content}).insert(ignore_permissions=True)
    return {"alerts":len(rows),"sent_email":False}
