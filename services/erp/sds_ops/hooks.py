app_name = "sds_ops"
app_title = "SDS Operations"
app_publisher = "SDS"
app_description = "Company operations, pricing, institutional delivery and management reporting"
app_email = "contact@datasds.org"
app_license = "GPL-3.0-or-later"
required_apps = ["erpnext", "hrms", "crm", "helpdesk"]
after_install = "sds_ops.setup.install"
after_migrate = "sds_ops.setup.migrate"
app_include_js = ["/assets/sds_ops/js/operations.js"]
app_include_css = ["/assets/sds_ops/css/operations.css"]
before_request = ["sds_ops.controls.draft_only_runtime"]
before_job = ["sds_ops.controls.draft_only_runtime"]
doc_events = {
    "Quotation": {"validate": "sds_ops.commercial.validate_quotation", "before_submit": "sds_ops.commercial.require_estimate"},
    "SDS Estimate": {"validate": "sds_ops.commercial.validate_estimate", "before_submit": "sds_ops.commercial.approve_estimate"},
    "SDS Rate Card": {"validate": "sds_ops.commercial.validate_rate_card"},
    "SDS Engagement": {"validate": "sds_ops.delivery.validate_engagement"},
    "SDS Milestone": {"validate": "sds_ops.delivery.validate_milestone"},
    "SDS Outbound Draft": {"validate": "sds_ops.outbound.validate_draft"},
    "SDS Tender": {"validate": "sds_ops.governance.validate_tender"},
    "SDS Obligation": {"validate": "sds_ops.governance.validate_obligation"},
    "SDS Expert": {"validate": "sds_ops.governance.validate_expert"},
    "SDS Risk": {"validate": "sds_ops.governance.validate_risk"},
    "SDS Settings": {"validate": "sds_ops.governance.validate_settings"},
    "SDS Variation": {"validate": "sds_ops.governance.validate_variation"},
    "SDS Retainer": {"validate": "sds_ops.governance.validate_retainer"},
    "Email Queue": {"before_insert": "sds_ops.controls.block_email_queue"},
    "Sales Invoice": {"validate":"sds_ops.delivery.validate_invoice", "after_insert":"sds_ops.delivery.link_invoice", "on_cancel":"sds_ops.delivery.cancel_invoice", "before_submit": "sds_ops.controls.validate_financial_posting"},
    "GL Entry": {"before_insert": "sds_ops.controls.validate_financial_posting"},
    "Journal Entry": {"before_submit": "sds_ops.controls.validate_financial_posting"},
    "Sales Order": {"before_submit": "sds_ops.controls.validate_financial_posting"},
    "Payment Entry": {"before_submit": "sds_ops.controls.validate_financial_posting"},
    "Purchase Order": {"before_submit": "sds_ops.controls.validate_financial_posting"},
    "Purchase Invoice": {"before_submit": "sds_ops.controls.validate_financial_posting"},
    "Expense Claim": {"before_submit": "sds_ops.controls.validate_financial_posting"},
    "Salary Slip": {"before_submit": "sds_ops.controls.validate_financial_posting"},
}
scheduler_events = {
    "hourly": ["sds_ops.automation.scheduled_checks", "sds_ops.integrations.sync_intake", "sds_ops.automation.prepare_recurring_invoices"],
    "daily": ["sds_ops.automation.prepare_owner_digest"],
}
