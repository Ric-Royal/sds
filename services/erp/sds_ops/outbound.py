"""Gmail draft preparation only. This module has no send endpoint."""
import base64
import hashlib
from email.message import EmailMessage

import frappe
import requests
from frappe.utils import validate_email_address
from sds_ops.controls import require_roles, private_attachment


def validate_draft(doc, method=None):
    validate_email_address(doc.recipient, throw=True)
    if any(c in (doc.subject or "") or c in (doc.recipient or "") for c in ("\r", "\n")):
        frappe.throw("Email headers cannot contain newlines.")
    if doc.status == "Owner marked sent":
        require_roles("SDS Owner")
        if not doc.owner_sent_reference:
            frappe.throw("Record the message reference after you send it yourself.")
    if doc.gmail_attempt_state in ("Creating","Uncertain","Saved") and any(doc.has_value_changed(f) for f in ["message","subject","recipient","attachment"]):
        frappe.throw("This content has a Gmail attempt. Reconcile it first; use a new record for a new version.")
    if doc.attachment:
        name=private_attachment(doc.attachment,"Email attachment")
        frappe.get_doc("File",name).check_permission("read")
    if doc.reference_doctype and doc.reference_name:
        frappe.get_doc(doc.reference_doctype,doc.reference_name).check_permission("read")


def google_token(settings):
    response=requests.post("https://oauth2.googleapis.com/token",data={
        "client_id":settings.gmail_client_id,"client_secret":settings.get_password("gmail_client_secret"),
        "refresh_token":settings.get_password("gmail_refresh_token"),"grant_type":"refresh_token"},
        timeout=20,allow_redirects=False)
    if response.status_code != 200:
        frappe.throw("Google rejected the saved authorisation. Reconnect the authorised Gmail account.")
    return response.json()["access_token"]


@frappe.whitelist()
def save_to_gmail(draft):
    require_roles("SDS Owner","SDS Commercial","SDS Finance","SDS Delivery")
    frappe.db.sql("select name from `tabSDS Outbound Draft` where name=%s for update",draft)
    doc=frappe.get_doc("SDS Outbound Draft",draft)
    doc.check_permission("write")
    if doc.gmail_draft_id:
        return {"draft_id":doc.gmail_draft_id,"already_prepared":True}
    if doc.gmail_attempt_state in ("Creating","Uncertain"):
        frappe.throw("A Gmail attempt needs reconciliation before another creation request.")
    if not doc.recipient_verified:
        frappe.throw("Verify the recipient against correspondence or an official source first.")
    validate_draft(doc)
    settings=frappe.get_single("SDS Settings")
    if not settings.gmail_enabled:
        frappe.throw("Gmail is not connected. The prepared message remains saved internally.")
    message=EmailMessage()
    message["To"]=doc.recipient
    message["From"]=settings.gmail_verified_sender
    message["Subject"]=doc.subject
    identity="<sds-"+hashlib.sha256(doc.name.encode()).hexdigest()+"@datasds.org>"
    message["Message-ID"]=identity
    from frappe.utils import strip_html
    message.set_content(strip_html(doc.message))
    message.add_alternative(doc.message,subtype="html")
    if doc.attachment:
        name=private_attachment(doc.attachment,"Email attachment")
        file=frappe.get_doc("File",name)
        file.check_permission("read")
        content=file.get_content()
        if isinstance(content,str):content=content.encode()
        if len(content)>20*1024*1024:
            frappe.throw("Attachment exceeds the 20 MB draft limit.")
        message.add_attachment(content,maintype="application",subtype="octet-stream",filename=file.file_name)
    token=google_token(settings)
    doc.db_set({"gmail_attempt_state":"Creating","gmail_rfc_message_id":identity})
    # Persist the attempt before crossing the network boundary. An ambiguous result must never cause blind retries.
    frappe.db.commit()
    try:
        response=requests.post("https://gmail.googleapis.com/gmail/v1/users/me/drafts",json={
            "message":{"raw":base64.urlsafe_b64encode(message.as_bytes()).decode()}},
            headers={"Authorization":"Bearer "+token},timeout=25,allow_redirects=False)
    except requests.RequestException:
        doc.db_set({"gmail_attempt_state":"Uncertain","last_error":"The network result is unknown. Reconcile Gmail before retrying."})
        frappe.db.commit()
        frappe.throw("The Gmail result is unknown. Use Reconcile Gmail draft before retrying.")
    if response.status_code not in (200,201):
        # A timeout or ambiguous provider response must be reconciled in Gmail before retrying.
        doc.db_set({"gmail_attempt_state":"Uncertain","last_error":f"Google draft creation returned HTTP {response.status_code}. Check Gmail before retrying."})
        frappe.db.commit()
        frappe.throw("Gmail draft creation was not confirmed. Check Gmail before retrying.")
    data=response.json()
    doc.db_set({"gmail_draft_id":data["id"],"gmail_message_id":data.get("message",{}).get("id"),
                "status":"Saved in Gmail","last_error":None,"gmail_attempt_state":"Saved"})
    frappe.get_doc({"doctype":"Notification Log","subject":"Gmail draft prepared: "+doc.subject,
        "for_user":settings.owner_user,"type":"Alert","document_type":doc.doctype,"document_name":doc.name,
        "email_content":"A Gmail draft is ready. Review it and send it yourself."}).insert(ignore_permissions=True)
    return {"draft_id":data["id"],"sent":False}


@frappe.whitelist()
def reconcile_gmail_draft(draft):
    require_roles("SDS Owner")
    doc=frappe.get_doc("SDS Outbound Draft",draft)
    doc.check_permission("write")
    if doc.gmail_draft_id:return {"draft_id":doc.gmail_draft_id}
    if not doc.gmail_rfc_message_id:
        frappe.throw("There is no recorded Gmail creation attempt.")
    settings=frappe.get_single("SDS Settings")
    response=requests.get("https://gmail.googleapis.com/gmail/v1/users/me/drafts",
        params={"q":"rfc822msgid:"+doc.gmail_rfc_message_id,"maxResults":10},
        headers={"Authorization":"Bearer "+google_token(settings)},timeout=20,allow_redirects=False)
    if response.status_code!=200:
        frappe.throw("Gmail reconciliation failed. Check the Drafts folder before making any new attempt.")
    rows=response.json().get("drafts",[])
    if len(rows)!=1:
        frappe.throw("Gmail did not return exactly one matching draft. Review Gmail manually; no new draft was created.")
    doc.db_set({"gmail_draft_id":rows[0]["id"],"gmail_message_id":rows[0].get("message",{}).get("id"),
                "status":"Saved in Gmail","gmail_attempt_state":"Saved","last_error":None})
    return {"draft_id":rows[0]["id"],"sent":False}


@frappe.whitelist()
def record_owner_sent(draft, message_reference):
    require_roles("SDS Owner")
    doc=frappe.get_doc("SDS Outbound Draft",draft);doc.check_permission("write")
    if not isinstance(message_reference,str) or not message_reference.strip():
        frappe.throw("Record the actual sent message reference after sending it yourself.")
    if len(message_reference.strip())>140:
        frappe.throw("Use the sent message ID or a reference of at most 140 characters.")
    doc.owner_sent_reference=message_reference.strip()
    doc.status="Owner marked sent";doc.save()
    return {"status":doc.status,"email_sent_by_this_action":False}
