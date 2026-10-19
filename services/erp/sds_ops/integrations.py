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


def import_project(payload, contact=None):
    """Idempotent import; no quote acceptance, payment or release is sent to the Worker."""
    external_id=payload.get("id")
    if not isinstance(external_id,str) or not external_id or len(external_id)>100:
        frappe.throw("The source project has no valid ID.")
    if contact is not None and (not payload.get("client_id") or contact.get("id")!=payload["client_id"]):
        frappe.throw("The intake contact does not match the source project's registrant.")
    key=hashlib.sha256(json.dumps({"project":payload,"contact":contact},sort_keys=True,default=str).encode()).hexdigest()
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
        lead.first_name=((contact or {}).get("name") or "Website registrant — identity needs review")[:140]
        lead.organization=((contact or {}).get("organisation") or "")[:140]
        lead.email=((contact or {}).get("email") or "")[:140]
        lead.insert(ignore_permissions=True)
        record.lead=lead.name
        lead.add_comment("Info","Imported SDS enquiry "+external_id+". Registrant details are self-reported and email ownership is unverified. Verify buyer identity and recipient before outreach.")
    if existing and record.lead and contact:
        lead=frappe.get_doc("CRM Lead",record.lead)
        changed={}
        for field,value in {"first_name":contact.get("name"),"organization":contact.get("organisation"),"email":contact.get("email")}.items():
            if value and (not lead.get(field) or (field=="first_name" and lead.first_name in (payload.get("title"),"Website registrant — identity needs review"))):
                lead.set(field,value[:140]);changed[field]=value[:140]
        if changed:lead.save(ignore_permissions=True)
        from frappe.utils import escape_html
        lead.add_comment("Info","Updated self-reported registrant details (unverified; compare before outreach): "+escape_html(json.dumps(contact,ensure_ascii=False)))
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
    contacts={}
    for _ in range(100):
        page=source_get("/v2/projects?limit=100"+("&cursor="+quote(cursor,safe="") if cursor else ""),settings)
        projects=page.get("projects",[])
        for project in projects:
            payload=source_get("/v2/projects/"+quote(project["id"],safe=""),settings)
            client_id=payload.get("client_id")
            contact=None
            if client_id:
                if client_id not in contacts:
                    contacts[client_id]=source_get("/v2/customers/"+quote(client_id,safe=""),settings)
                contact=contacts[client_id]
            import_project(payload,contact)
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
