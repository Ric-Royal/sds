import frappe


def require_roles(*roles):
    if frappe.session.user == "Administrator":
        return
    if not set(roles).intersection(frappe.get_roles()):
        frappe.throw("This action requires an authorised SDS role.", frappe.PermissionError)


def private_attachment(url, label):
    record = frappe.db.get_value("File", {"file_url": url}, ["name", "is_private"], as_dict=True)
    if not record or not record.is_private:
        frappe.throw(f"{label} must be an uploaded private attachment.")
    return record.name


def validate_financial_posting(doc, method=None):
    settings = frappe.get_single("SDS Settings")
    if doc.company == settings.company and not settings.live_finance_enabled:
        frappe.throw("Complete the SDS Settings financial review before posting real company transactions.")


def block_email_queue(doc, method=None):
    frappe.throw("SDS email policy is Gmail drafts only. Create an SDS Outbound Draft; Richard sends it.")


def draft_only_runtime():
    frappe.flags.mute_emails = True
    frappe.conf.mute_emails = True
