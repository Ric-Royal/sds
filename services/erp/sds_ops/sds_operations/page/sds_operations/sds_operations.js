// The native page loader creates this wrapper before evaluating the page script.
frappe.pages["sds-operations"].on_page_load = frappe.sds_ops.render_operations_page;
