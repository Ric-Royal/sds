import copy
import json
from datetime import date

import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields
from sds_ops.schema import RECORDS, ROLES


PREFIXES = {"SDS Estimate":"EST","SDS Rate Card":"RATE","SDS Expert":"EXP","SDS Tender":"BID",
    "SDS Engagement":"CON","SDS Milestone":"MS","SDS Variation":"CHG","SDS Retainer":"RET",
    "SDS Obligation":"OBL","SDS Risk":"RISK","SDS Alert":"ALT","SDS Outbound Draft":"MAIL",
    "SDS Integration Record":"SYNC"}


def install():
    frappe.flags.mute_emails=True
    frappe.conf.mute_emails=True
    migrate()
    create_company()
    settings=frappe.get_single("SDS Settings")
    if not frappe.db.get_single_value("SDS Settings","company"):
        settings.update({"company":"SDS","currency":"KES","owner_user":"Administrator",
            "owner_income_target":250000,"outbound_policy":"Gmail drafts only",
            "worker_origin":"https://sds-agent-operations.sds-9991a64282bd.workers.dev",
            "go_live_notes":"Review legal identity, tax/payroll, opening balances, banking, authorised integrations and production hosting before real financial posting."})
        settings.save(ignore_permissions=True)
    for item,title in [("SDS Implementation","SDS project services"),("SDS Monthly Service","SDS recurring services")]:
        if not frappe.db.exists("Item",item):
            frappe.get_doc({"doctype":"Item","item_code":item,"item_name":title,"item_group":"Services",
                "stock_uom":"Nos","is_stock_item":0,"is_sales_item":1,"is_purchase_item":1}).insert(ignore_permissions=True)
    create_onboarding()
    frappe.db.commit()


def migrate():
    if not frappe.db.exists("Module Def","SDS Operations"):
        frappe.get_doc({"doctype":"Module Def","module_name":"SDS Operations","app_name":"sds_ops"}).insert(ignore_permissions=True)
    for role in ROLES:
        if not frappe.db.exists("Role",role):
            frappe.get_doc({"doctype":"Role","role_name":role,"desk_access":1}).insert(ignore_permissions=True)
    # Register every linked type first; the complete schemas contain intentional cross-links.
    for definition in RECORDS:
        if not frappe.db.exists("DocType",definition["name"]):
            header={"doctype":"DocType","name":definition["name"],"module":"SDS Operations","custom":1,
                "istable":definition.get("istable",0),"issingle":definition.get("issingle",0),
                "is_submittable":definition.get("is_submittable",0),
                "fields":[{"fieldname":"bootstrap_label","label":"Label","fieldtype":"Data"}],
                "permissions":[] if definition.get("istable") else [{"role":"SDS Owner","read":1,"write":1,"create":1}]}
            frappe.get_doc(header).insert(ignore_permissions=True)
    for source in RECORDS:
        values=copy.deepcopy(source)
        values.update({"doctype":"DocType","module":"SDS Operations","custom":1,
            "autoname":"hash" if values.get("istable") else f"SDS-{PREFIXES.get(values['name'],'REC')}-.YYYY.-.#####",
            "engine":"InnoDB","sort_field":"modified","sort_order":"DESC","title_field":
            "title" if any(f["fieldname"]=="title" for f in values["fields"]) else None})
        if values.get("issingle"):values.pop("autoname",None)
        if not values.get("is_submittable"):
            for permission in values.get("permissions",[]):
                for flag in ["submit","cancel","amend"]:permission[flag]=0
        if frappe.db.exists("DocType",values["name"]):
            doc=frappe.get_doc("DocType",values.pop("name"));doc.update(values);doc.save(ignore_permissions=True)
        else:
            frappe.get_doc(values).insert(ignore_permissions=True)
    custom={
        "Quotation":[{"fieldname":"sds_estimate","label":"Approved SDS estimate","fieldtype":"Link","options":"SDS Estimate","read_only":1},
                     {"fieldname":"sds_quote_kind","label":"SDS quote type","fieldtype":"Data","read_only":1}],
        "Project":[{"fieldname":"sds_engagement","label":"SDS engagement","fieldtype":"Link","options":"SDS Engagement","read_only":1}],
        "Sales Invoice":[{"fieldname":"sds_estimate","label":"SDS estimate","fieldtype":"Link","options":"SDS Estimate","read_only":1},
            {"fieldname":"sds_milestone","label":"Accepted SDS milestone","fieldtype":"Link","options":"SDS Milestone","read_only":1},
            {"fieldname":"sds_billing_key","label":"SDS billing period key","fieldtype":"Data","unique":1,"read_only":1},
            {"fieldname":"sds_cancelled_billing_key","label":"Cancelled SDS billing period","fieldtype":"Data","read_only":1,"no_copy":1}],
    }
    create_custom_fields(custom,update=True)
    create_role_profiles()
    create_workflow()
    create_workspace()
    frappe.clear_cache()


ROLE_PROFILES = {
    "SDS Owner": [*ROLES, "Accounts Manager", "Sales Manager", "Purchase Manager", "Projects Manager",
        "HR Manager", "Payroll Manager", "Asset Manager", "CRM Manager", "Agent Manager"],
    "SDS Commercial": ["SDS Commercial", "Sales User", "CRM User"],
    "SDS Delivery": ["SDS Delivery", "Projects User", "Support Team", "Agent"],
    "SDS Finance": ["SDS Finance", "Accounts User", "Purchase User", "Asset User"],
    "SDS People": ["SDS People", "HR User"],
    "SDS Governance": ["SDS Governance"],
}


def create_role_profiles():
    # Profiles are explicit department bundles. System Manager remains a separately granted admin role.
    for name,roles in ROLE_PROFILES.items():
        available=[r for r in roles if frappe.db.exists("Role",r)]
        values={"role_profile":name,"roles":[{"role":r} for r in available]}
        if frappe.db.exists("Role Profile",name):
            doc=frappe.get_doc("Role Profile",name)
            if {r.role for r in doc.roles}!=set(available):
                doc.update(values);doc.save(ignore_permissions=True)
        else:
            frappe.get_doc({"doctype":"Role Profile",**values}).insert(ignore_permissions=True)


def create_company():
    from erpnext.setup.setup_wizard.operations import install_fixtures
    from erpnext.setup.setup_wizard.setup_wizard import setup_complete
    if not frappe.db.exists("Company","SDS"):
        year=date.today().year
        args=frappe._dict(company_name="SDS",company_abbr="SDS",country="Kenya",currency="KES",
            fy_start_date=f"{year}-01-01",fy_end_date=f"{year}-12-31",chart_of_accounts="Standard",
            domain="Services",bank_account=None)
        setup_complete(args)
        frappe.db.set_value("Company","SDS","enable_perpetual_inventory",0)
    settings=frappe.get_single("System Settings")
    settings.update({"time_zone":"Africa/Nairobi","language":"en","country":"Kenya",
        "enable_onboarding":0,"allow_login_using_mobile_number":0,"enable_scheduler":1})
    settings.save(ignore_permissions=True)
    frappe.db.set_single_value("Global Defaults","default_company","SDS")
    frappe.db.set_single_value("Global Defaults","default_currency","KES")
    frappe.db.set_single_value("System Settings","setup_complete",1)


def create_workflow():
    for label in ["Draft","Review","Approved","Rejected","Cancelled"]:
        if not frappe.db.exists("Workflow State",label):
            frappe.get_doc({"doctype":"Workflow State","workflow_state_name":label}).insert(ignore_permissions=True)
    for action in ["Request approval","Approve","Reject","Revise","Cancel"]:
        if not frappe.db.exists("Workflow Action Master",action):
            frappe.get_doc({"doctype":"Workflow Action Master","workflow_action_name":action}).insert(ignore_permissions=True)
    name="SDS Estimate Approval"
    values={"workflow_name":name,"document_type":"SDS Estimate","workflow_state_field":"workflow_state",
        "is_active":1,"send_email_alert":0,
        "states":[{"state":"Draft","doc_status":"0","allow_edit":"SDS Commercial"},
                  {"state":"Review","doc_status":"0","allow_edit":"SDS Owner"},
                  {"state":"Approved","doc_status":"1","allow_edit":"SDS Owner"},
                  {"state":"Rejected","doc_status":"0","allow_edit":"SDS Owner"},
                  {"state":"Cancelled","doc_status":"2","allow_edit":"SDS Owner"}],
        "transitions":[{"state":"Draft","action":"Request approval","next_state":"Review","allowed":"SDS Commercial","allow_self_approval":1},
            {"state":"Review","action":"Approve","next_state":"Approved","allowed":"SDS Owner","allow_self_approval":1},
            {"state":"Review","action":"Reject","next_state":"Rejected","allowed":"SDS Owner","allow_self_approval":1},
            {"state":"Rejected","action":"Revise","next_state":"Draft","allowed":"SDS Commercial","allow_self_approval":1},
            {"state":"Approved","action":"Cancel","next_state":"Cancelled","allowed":"SDS Owner","allow_self_approval":1}]}
    if frappe.db.exists("Workflow",name):
        doc=frappe.get_doc("Workflow",name);doc.update(values);doc.save(ignore_permissions=True)
    else:frappe.get_doc({"doctype":"Workflow",**values}).insert(ignore_permissions=True)


AREAS = {
    "Sales and tenders":["CRM Lead","CRM Deal","Customer","SDS Tender","SDS Estimate","Quotation","SDS Outbound Draft"],
    "Contracts and delivery":["SDS Engagement","SDS Milestone","SDS Variation","SDS Retainer","Project","Task","Timesheet"],
    "Finance and purchasing":["Sales Order","Sales Invoice","Payment Entry","Purchase Order","Purchase Invoice","Supplier","Expense Claim","Budget","Bank Transaction"],
    "People and company":["SDS Expert","Employee","Job Applicant","Leave Application","Salary Structure","Salary Slip","Asset","SDS Obligation","SDS Risk"],
    "Support and controls":["HD Ticket","SDS Alert","SDS Settings","User","Role Profile","SDS Integration Record"],
}


def create_workspace():
    if not frappe.db.exists("Page","sds-operations"):
        frappe.reload_doc("sds_operations","page","sds_operations",force=True)
    name="SDS Company"
    content=[{"id":"sds-heading","type":"header","data":{"text":"SDS Operations","col":12}},
             {"id":"sds-home","type":"shortcut","data":{"shortcut_name":"Company dashboard","col":12}}]
    links=[]
    for title,doctypes in AREAS.items():
        links.append({"type":"Card Break","label":title})
        links.extend({"type":"Link","link_type":"DocType","link_to":dt,"label":dt,
                      "onboard":0} for dt in doctypes if frappe.db.exists("DocType",dt))
    values={"label":name,"title":name,"module":"SDS Operations","public":1,"icon":"organization",
        "content":json.dumps(content),"sequence_id":1,"links":links,
        "shortcuts":[{"label":"Company dashboard","type":"Page","link_to":"sds-operations","color":"Green"}],
        "roles":[{"role":r} for r in ROLES]}
    if frappe.db.exists("Workspace",name):
        doc=frappe.get_doc("Workspace",name);doc.update(values);doc.save(ignore_permissions=True)
    else:frappe.get_doc({"doctype":"Workspace",**values}).insert(ignore_permissions=True)


def create_onboarding():
    actions=["Verify SDS legal company name and registration records",
        "Review chart of accounts, fiscal year, tax and payroll configuration with the accountant",
        "Enter and reconcile opening balances and approved bank / M-Pesa accounts",
        "Add named user accounts, access roles and MFA before staff access",
        "Configure authorised Worker and Gmail integration secrets privately",
        "Verify eTIMS solution before submitting tax invoices",
        "Choose the permanent SDS host and test TLS, backups and recovery",
        "Record verified supplier rates, expert credentials and availability"]
    for action in actions:
        if not frappe.db.exists("ToDo",{"description":action}):
            frappe.get_doc({"doctype":"ToDo","description":action,"allocated_to":"Administrator","priority":"High"}).insert(ignore_permissions=True)
