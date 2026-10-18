/* SDS owner workspace. Financial and approval decisions remain server-authorised. */
(() => {
  const esc = value => frappe.utils.escape_html(String(value ?? ""));
  const route = (type, name) => frappe.set_route(name ? "Form" : "List", type, ...(name ? [name] : []));
  const money = (value, currency = "KES") => new Intl.NumberFormat("en-KE", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value || 0));
  const call = async (method, args = {}) => (await frappe.call({ method: `sds_ops.${method}`, args, freeze: true })).message;
  frappe.pages["sds-operations"] = frappe.pages["sds-operations"] || {};
  frappe.pages["sds-operations"].on_page_load = wrapper => {
    const page = frappe.ui.make_app_page({parent:wrapper,title:"SDS Operations",single_column:true});
    const root = $('<div class="sds-ops"></div>').appendTo(page.body);
    page.set_primary_action("New estimate", () => frappe.new_doc("SDS Estimate"));
    page.add_inner_button("Refresh", () => load());
    page.add_inner_button("Check company controls", async () => { await call("api.run_checks"); await load(); });
    async function load() {
      root.html('<p class="sds-muted">Loading company records…</p>');
      try {
        const data = await call("dashboard.overview");
        root.html(`<div class="sds-hero"><div><p class="sds-eyebrow">SDS / COMPANY OPERATIONS</p><h1>Your business, in view.</h1><p>Sales, delivery, people and money share one operating record.</p></div><div class="sds-owner-target"><span>Monthly owner income minimum</span><strong>${esc(money(data.owner_target, data.currency))}</strong><small>Target. Company revenue and book cash are separate measures.</small></div></div>
          ${data.financial_posting_enabled ? "" : '<div class="sds-notice">Financial posting awaits your company setup review. You can prepare records, estimates and draft invoices.</div>'}
          <div class="sds-metrics">${[
            ["Book income this month", money(data.book_income_month,data.currency)],
            ["Book expenses this month", money(data.book_expenses_month,data.currency)],
            ["Bank / cash ledger balance", money(data.book_cash_balance,data.currency)],
            ["Active engagements", data.engagements], ["Estimates in preparation",data.estimates],
            ["Open support tickets",data.open_support]
          ].map(([label,value])=>`<article><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`).join("")}</div>
          <p class="sds-muted">${esc(data.cash_note)} Values come from submitted accounting entries.</p>
          <section class="sds-section"><h2>Actions requiring attention</h2><div class="sds-alerts">${data.alerts.length ? data.alerts.map(a=>`<button type="button" class="sds-alert ${a.severity==='Critical'?'sds-critical':''}" data-type="SDS Alert" data-name="${esc(a.name)}"><span>${esc(a.severity)}</span><strong>${esc(a.title)}</strong><small>${esc(a.detail)}</small></button>`).join("") : '<p class="sds-muted">No open alerts have been recorded. Review the last successful check below.</p>'}</div></section>
          <div class="sds-finance-grid">${[
            ["Customer balances",data.receivables.map(r=>`${r.currency}: ${money(r.outstanding,r.currency)} outstanding; ${money(r.overdue,r.currency)} overdue`)],
            ["Supplier balances",data.payables.map(r=>`${r.currency}: ${money(r.outstanding,r.currency)} outstanding`)],
            ["Active recurring services",data.retainers.map(r=>`${r.currency}: ${money(r.monthly_fee,r.currency)}/month across ${r.clients} agreements`)]
          ].map(([title,rows])=>`<section><h3>${esc(title)}</h3>${rows.length?rows.map(row=>`<p>${esc(row)}</p>`).join(""):'<p class="sds-muted">No submitted records.</p>'}</section>`).join("")}</div>
          <section class="sds-section"><h2>Company functions</h2><div class="sds-functions">${Object.entries(data.areas).map(([title,types])=>`<article><h3>${esc(title)}</h3>${types.map(t=>`<button type="button" data-type="${esc(t)}">${esc(t.replace(/^SDS /,""))}<span aria-hidden="true">↗</span></button>`).join("")}</article>`).join("")}</div></section>
          <section class="sds-section sds-status"><h2>Automation status</h2><p>Control check: ${esc(data.last_control_check || 'Not run')}</p><p>Intake sync: ${esc(data.last_intake_sync || 'Not connected')}</p><p>Verified backup: ${esc(data.last_backup_verified || 'Not recorded')}</p><p>Gmail drafts: ${data.gmail_connected?'Configured; verify the first real draft':'Awaiting authorised account configuration'}</p><p>Website intake: ${data.intake_connected?'Enabled':'Awaiting the existing Worker access key'}</p><p>Email sending stays with Richard. This workspace prepares drafts and records decisions.</p></section>`);
        root.find("[data-type]").on("click", function () { route(this.dataset.type, this.dataset.name); });
      } catch (error) {
        root.html('<div class="sds-notice">This financial overview requires the SDS Owner or Finance role. Use your assigned workspaces for other company tasks.</div>');
        console.error("SDS workspace could not load", error.message);
      }
    }
    load();
  };

  frappe.ui.form.on("SDS Estimate", {
    refresh(frm) {
      if (!frm.doc.company && frappe.defaults.get_default("company")) frm.set_value("company",frappe.defaults.get_default("company"));
      if (!frm.doc.valid_until) frm.set_value("valid_until",frappe.datetime.add_days(frappe.datetime.get_today(),30));
      if (frm.doc.docstatus === 1) {
        for (const kind of ["Implementation","Monthly support"]) frm.add_custom_button(`Prepare ${kind.toLowerCase()} quote`,async()=>{
          const name=await call("commercial.create_quotation",{estimate:frm.doc.name,kind});route("Quotation",name);
        },"Commercial");
        frm.add_custom_button("Record engagement",()=>frappe.new_doc("SDS Engagement",{estimate:frm.doc.name,company:frm.doc.company,customer:frm.doc.customer,currency:frm.doc.currency,quotation:frm.doc.quotation,title:frm.doc.title,responsible_user:frappe.session.user}),"Commercial");
      }
      if (!frm.is_new()) frm.add_custom_button("Review cash plan",()=>{
        const rows=JSON.parse(frm.doc.cashflow_json || "[]");
        const html=`<div class="table-responsive"><table class="table"><thead><tr><th>Month</th><th>Invoiced</th><th>Collected</th><th>Cost + reserve</th><th>Balance</th></tr></thead><tbody>${rows.map(r=>`<tr>${[r.month,r.invoiced,r.collected,r.cost_and_reserve,r.balance].map(v=>`<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p>Illustrative uniform spend. Excludes tax, withholding and financing. Milestone shares are planning assumptions until agreed.</p>`;
        frappe.msgprint({title:"Implementation cash plan",message:html,wide:true});
      });
    }
  });
  frappe.ui.form.on("SDS Engagement",{refresh(frm){
    if (!frm.is_new() && ["Signed","Active"].includes(frm.doc.status)) frm.add_custom_button("Activate signed delivery",async()=>{
      const name=await call("delivery.activate_engagement",{engagement:frm.doc.name});route("Project",name);
    });
    if (frm.doc.project) frm.add_custom_button("Budget and actual costs",async()=>{
      const r=await call("dashboard.project_costs",{engagement:frm.doc.name});
      frappe.msgprint({title:"Project financial review",message:`<p>Baseline (${esc(r.quote_currency)}): ${esc(r.baseline_cost_quote_currency)}</p><p>Booked expenses in company currency: ${esc(r.booked_expense_company_currency)}</p><p>Submitted hours: ${esc(r.submitted_hours)}</p><p>Forecast total (${esc(r.quote_currency)}): ${esc(r.forecast_total_quote_currency ?? 'Review the cost-to-finish forecast first')}</p><p>${esc(r.note)}</p>`});
    });
  }});
  frappe.ui.form.on("SDS Milestone",{refresh(frm){
    if (frm.doc.status==="Accepted") frm.add_custom_button("Prepare draft invoice",async()=>route("Sales Invoice",await call("delivery.create_milestone_invoice",{milestone:frm.doc.name})));
  }});
  frappe.ui.form.on("SDS Retainer",{refresh(frm){
    if (!frm.is_new() && frm.doc.status==="Active") frm.add_custom_button("Prepare period invoice",async()=>route("Sales Invoice",await call("delivery.create_retainer_invoice",{retainer:frm.doc.name})));
  }});
  frappe.ui.form.on("SDS Outbound Draft",{refresh(frm){
    if (!frm.is_new() && !frm.doc.gmail_draft_id) frm.add_custom_button("Save in Gmail Drafts",async()=>{
      await call("outbound.save_to_gmail",{draft:frm.doc.name});await frm.reload_doc();frappe.msgprint("Saved in Gmail Drafts. Richard reviews and sends it.");
    });
    if (["Creating","Uncertain"].includes(frm.doc.gmail_attempt_state)) frm.add_custom_button("Reconcile Gmail draft",async()=>{await call("outbound.reconcile_gmail_draft",{draft:frm.doc.name});await frm.reload_doc();});
    if (!frm.is_new() && frm.doc.status!=="Owner marked sent" && frappe.user.has_role("SDS Owner")) frm.add_custom_button("Record email I sent",()=>{
      frappe.prompt([{fieldname:"reference",label:"Actual sent message reference",fieldtype:"Data",reqd:1}],async values=>{
        await call("outbound.record_owner_sent",{draft:frm.doc.name,message_reference:values.reference});await frm.reload_doc();
      },"Record your sent message","Save reference");
    });
  }});
  frappe.ui.form.on("Quotation",{refresh(frm){
    if (frm.doc.sds_estimate) frm.add_custom_button("Download client PDF",()=>window.open(`/api/method/sds_ops.printing.quote_pdf?quotation=${encodeURIComponent(frm.doc.name)}`,"_blank","noopener"));
  }});
  frappe.ui.form.on("SDS Settings",{refresh(frm){
    frm.add_custom_button("Create unapproved institutional example",async()=>route("SDS Estimate",await call("commercial.instantiate_institutional_example")));
    frm.add_custom_button("Check controls now",async()=>{await call("api.run_checks");frappe.show_alert("Company checks completed.");});
    frm.add_custom_button("Sync authorised intake",async()=>{const r=await call("api.sync_intake");frappe.msgprint(r.enabled?`Imported ${r.imported} records.`:"Enter the authorised Worker credentials before enabling sync.");});
  }});
})();
