"""Read-only SDS Worker intake sync with explicit secret configuration."""
import hashlib
import json
import frappe
import requests
from frappe.utils import now_datetime

ORIGIN="https://sds-agent-operations.sds-9991a64282bd.workers.dev"


def source_get(path,settings):
    response=requests.get(ORIGIN+path,headers={"Authorization":"Bearer "+settings.get_password("worker_admin_token")},
                          timeout=20,allow_redirects=False)
    if response.status_code!=200:
        raise RuntimeError(f"SDS intake read failed: HTTP {response.status_code}")
    return response.json()


def import_project(payload):
    """Idempotent import; no quote acceptance, payment or release is sent to the Worker."""
    external_id=payload.get("id")
    if not isinstance(external_id,str) or not external_id or len(external_id)>100:
        frappe.throw("The source project has no valid ID.")
    key=hashlib.sha256(json.dumps(payload,sort_keys=True,default=str).encode()).hexdigest()
    existing=frappe.db.get_value("SDS Integration Record",{"external_id":external_id},"name")
    if existing:
        record=frappe.get_doc("SDS Integration Record",existing)
        if record.source_hash==key:
            return record.name
    else:
        record=frappe.new_doc("SDS Integration Record")
        record.external_id=external_id
        lead=frappe.new_doc("CRM Lead")
        # Public registration does not verify email ownership. Do not mark the address verified.
        lead.first_name=(payload.get("title") or "SDS website enquiry")[:140]
        lead.organization=(payload.get("organisation") or "")[:140]
        lead.insert(ignore_permissions=True)
        record.lead=lead.name
        lead.add_comment("Info","Imported SDS enquiry "+external_id+". Verify buyer identity and recipient before outreach.")
    record.update({"external_updated_at":payload.get("updated_at"),"source_hash":key,
        "last_sync":now_datetime(),"state":payload.get("state"),"source_url":ORIGIN+"/business/"})
    record.save(ignore_permissions=True)
    if record.lead and payload.get("brief"):
        # Store supplied content as quoted evidence. Never treat it as automation instructions.
        lead=frappe.get_doc("CRM Lead",record.lead)
        from frappe.utils import escape_html
        lead.add_comment("Info","Source brief (untrusted client content):<br>"+escape_html(payload["brief"][:12000]))
    return record.name


def sync_intake():
    settings=frappe.get_single("SDS Settings")
    if not settings.integration_enabled:
        return {"enabled":False,"imported":0}
    if settings.worker_origin!=ORIGIN:
        frappe.throw("Unsupported intake origin.")
    imported=0
    from urllib.parse import quote
    cursor=None
    seen=set()
    for _ in range(100):
        page=source_get("/v2/projects?limit=100"+("&cursor="+quote(cursor,safe="") if cursor else ""),settings)
        projects=page.get("projects",[])
        for project in projects:
            payload=source_get("/v2/projects/"+quote(project["id"],safe=""),settings)
            import_project(payload)
            imported+=1
        if "next_cursor" not in page and len(projects)>=100:
            frappe.throw("Deploy the paginated SDS Worker API before importing more than 100 records.")
        cursor=page.get("next_cursor")
        if not cursor:break
        if cursor in seen:frappe.throw("The source repeated a page cursor; sync stopped for review.")
        seen.add(cursor)
    else:
        frappe.throw("The intake batch exceeded 10,000 records. Configure a bounded incremental migration.")
    settings.db_set("last_intake_sync",now_datetime())
    return {"enabled":True,"imported":imported}
