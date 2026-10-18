"""Client quotation PDF. Internal costs and margin never enter the client template."""
import frappe
from frappe.utils import escape_html, strip_html


@frappe.whitelist()
def quote_pdf(quotation):
    doc=frappe.get_doc("Quotation",quotation)
    doc.check_permission("read")
    if not doc.sds_estimate:
        frappe.throw("This quotation has no approved SDS estimate.")
    estimate=frappe.get_doc("SDS Estimate",doc.sds_estimate)
    if estimate.docstatus!=1:
        frappe.throw("The supporting estimate is no longer approved.")
    from weasyprint import HTML
    def offline_assets(url,*args,**kwargs):
        raise ValueError("Quotation rendering does not load network or user-supplied file assets.")
    items="".join(f"<tr><td>{escape_html(strip_html(r.description or r.item_name))}</td><td>{r.qty:g}</td><td>{r.rate:,.2f}</td><td>{r.amount:,.2f}</td></tr>" for r in doc.items)
    html=f"""<!doctype html><html><head><meta charset='utf-8'><style>
      @page {{size:A4;margin:22mm}}body{{font-family:sans-serif;color:#152c20;font-size:11pt;line-height:1.6}}
      h1{{font-size:29pt;margin:0}}.brand{{color:#2a6647;letter-spacing:.15em;font-size:10pt}}
      table{{border-collapse:collapse;width:100%;margin:25px 0}}th,td{{border-bottom:1px solid #ced8d0;text-align:left;padding:10px 6px;vertical-align:top}}th{{background:#edf2ed}}.total{{font-size:16pt;text-align:right}}.muted{{color:#657267;font-size:9pt}}
      </style></head><body><p class='brand'>SDS / DATA. DECISIONS. SYSTEMS.</p><h1>Quotation</h1>
      <p>{escape_html(doc.name)} · {escape_html(str(doc.transaction_date))}<br>
      Customer: {escape_html(doc.customer_name or doc.party_name)}<br>Valid until: {escape_html(str(doc.valid_till))}</p>
      <p class='muted'>{'DRAFT — requires final review before release.' if doc.docstatus==0 else 'Issued quotation. Contract acceptance and payment follow the agreed terms.'}</p>
      <table><thead><tr><th>Services</th><th>Qty</th><th>Rate ({escape_html(doc.currency)})</th><th>Amount</th></tr></thead><tbody>{items}</tbody></table>
      <p class='total'>Total: {escape_html(doc.currency)} {doc.grand_total:,.2f}</p>
      <h3>Scope and terms</h3><p>{escape_html(strip_html(doc.terms or ''))}</p>
      <p class='muted'>SDS · contact@datasds.org · datasds.org</p></body></html>"""
    pdf=HTML(string=html,url_fetcher=offline_assets).write_pdf()
    frappe.local.response.filename=f"{doc.name}.pdf"
    frappe.local.response.filecontent=pdf
    frappe.local.response.type="pdf"
    return None
