import frappe
from sds_ops.controls import require_roles


@frappe.whitelist()
def run_checks():
    require_roles("SDS Owner","SDS Finance","SDS Governance")
    from sds_ops.automation import run_checks as execute
    return execute()


@frappe.whitelist()
def sync_intake():
    require_roles("SDS Owner")
    from sds_ops.integrations import sync_intake as execute
    return execute()
