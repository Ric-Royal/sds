"""Integration checks against a real installed Frappe/ERPNext site. All QA transactions roll back."""
import unittest
from unittest.mock import patch, Mock
import frappe
from frappe.utils import add_days, add_months, nowdate, now_datetime


class OperationsTests(unittest.TestCase):
    def setUp(self):
        frappe.set_user("Administrator")
        frappe.flags.mute_emails=True
        frappe.db.savepoint("sds_test")

    def tearDown(self):
        frappe.set_user("Administrator")
        frappe.db.rollback(save_point="sds_test")
        frappe.clear_cache()

    def customer(self):
        name="SDS QA Customer"
        if not frappe.db.exists("Customer",name):
            frappe.get_doc({"doctype":"Customer","customer_name":name,"customer_type":"Company",
                "customer_group":"Commercial","territory":"All Territories"}).insert()
        return name

    def estimate(self,verified=True):
        doc=frappe.get_doc({"doctype":"SDS Estimate","title":"Synthetic QA project","company":"SDS",
            "customer":self.customer(),"responsible_user":"Administrator","currency":"KES",
            "product_line":"Institutional Data Platforms","duration_months":2,"collection_lag_months":1,
            "valid_until":add_days(nowdate(),30),"scope":"Synthetic QA scope only","terms":"Synthetic QA terms",
            "overhead_pct":0,"contingency_pct":0,"margin_pct":20,"tax_pct":0,"support_contingency_pct":0,
            "tax_reviewed":1,"tax_review_note":"Synthetic QA zero-tax test; not a company tax determination.",
            "costs":[{"description":"QA engineering","allocation":"Implementation","basis":"Days",
                "quantity":10,"rate":100,"verified":verified,"source_reference":"Synthetic QA evidence"}],
            "milestones":[{"title":"QA deliverable 1","month":1,"fee_pct":50,"acceptance_criteria":"Written QA approval"},
                          {"title":"QA deliverable 2","month":2,"fee_pct":50,"acceptance_criteria":"Written QA approval"}]})
        doc.insert()
        return doc

    def approve(self,doc):
        from frappe.model.workflow import apply_workflow
        doc=apply_workflow(doc,"Request approval")
        return apply_workflow(doc,"Approve")

    def file(self,label,doctype,name):
        return frappe.get_doc({"doctype":"File","file_name":label,"is_private":1,
            "content":"Synthetic QA evidence only.","attached_to_doctype":doctype,"attached_to_name":name}).insert().file_url

    def engagement(self):
        from sds_ops.commercial import create_quotation
        estimate=self.approve(self.estimate())
        quotation=create_quotation(estimate.name)
        doc=frappe.get_doc({"doctype":"SDS Engagement","title":"QA signed engagement","company":"SDS",
            "customer":estimate.customer,"currency":"KES","estimate":estimate.name,"quotation":quotation,
            "responsible_user":"Administrator","status":"Signed","signed_on":nowdate(),
            "signed_contract":self.file("qa-contract.txt","SDS Estimate",estimate.name),
            "acceptance_owner":"QA client approver","start_date":nowdate(),"end_date":add_months(nowdate(),2),
            "payment_terms":"QA: accepted deliverables, payment within 45 days.","payment_due_days":45,
            "payment_terms_reviewed":1})
        return doc.insert()

    def test_full_estimate_contract_delivery_invoice_path(self):
        from sds_ops.commercial import create_quotation
        from sds_ops.delivery import activate_engagement,create_milestone_invoice
        engagement=self.engagement()
        estimate=frappe.get_doc("SDS Estimate",engagement.estimate)
        self.assertEqual(estimate.total_price,1250)
        first=create_quotation(estimate.name)
        self.assertEqual(first,create_quotation(estimate.name))
        project=activate_engagement(engagement.name)
        self.assertEqual(project,activate_engagement(engagement.name))
        self.assertEqual(frappe.db.count("SDS Milestone",{"engagement":engagement.name}),2)
        name=frappe.db.get_value("SDS Milestone",{"engagement":engagement.name},"name")
        with self.assertRaises(frappe.ValidationError):create_milestone_invoice(name)
        milestone=frappe.get_doc("SDS Milestone",name)
        evidence=self.file("qa-acceptance.txt",milestone.doctype,milestone.name)
        milestone.update({"status":"Accepted","accepted_by":"QA approver","accepted_on":nowdate(),
            "deliverable_file":evidence,"acceptance_evidence":evidence})
        milestone.save()
        milestone.status="Invoiced"
        with self.assertRaises(frappe.ValidationError):milestone.save()
        milestone.reload()
        finance=frappe.get_doc({"doctype":"User","email":"sds-qa-finance@example.invalid","first_name":"Synthetic QA Finance",
            "send_welcome_email":0,"role_profiles":[{"role_profile":"SDS Finance"}]}).insert()
        frappe.set_user(finance.name)
        invoice_name=create_milestone_invoice(name)
        self.assertEqual(invoice_name,create_milestone_invoice(name))
        frappe.set_user("Administrator")
        invoice=frappe.get_doc("Sales Invoice",invoice_name)
        self.assertEqual(invoice.docstatus,0)
        self.assertEqual(invoice.grand_total,625)
        self.assertEqual(str(invoice.due_date),str(add_days(nowdate(),45)))
        invoice.items[0].rate=1
        with self.assertRaises(frappe.ValidationError):invoice.save()
        invoice.reload()
        invoice.sds_milestone=None;invoice.sds_estimate=None
        with self.assertRaises(frappe.ValidationError):invoice.save()
        invoice.reload()
        with self.assertRaises(frappe.ValidationError):invoice.submit()
        settings=frappe.get_single("SDS Settings")
        settings.update({"live_finance_enabled":1,"legal_identity_reviewed":1,"tax_setup_reviewed":1,
            "opening_balances_reviewed":1,"bank_setup_reviewed":1});settings.save()
        invoice.reload();invoice.submit();invoice.cancel()
        milestone.reload()
        self.assertEqual(milestone.status,"Accepted")
        self.assertFalse(milestone.sales_invoice)
        milestone.status="Invoiced";milestone.sales_invoice=invoice.name
        with self.assertRaises(frappe.ValidationError):milestone.save()
        amended=frappe.copy_doc(invoice);amended.amended_from=invoice.name;amended.docstatus=0
        amended.insert()
        milestone.reload()
        self.assertEqual(milestone.sales_invoice,amended.name)
        self.assertEqual(milestone.status,"Invoiced")
        from sds_ops.automation import run_checks
        run_checks()
        self.assertTrue(frappe.db.exists("SDS Alert",{"alert_key":"invoice-draft:"+amended.name,"status":"Open"}))

    def test_unverified_rate_cannot_be_approved(self):
        doc=self.estimate(verified=False)
        with self.assertRaises(frappe.ValidationError):self.approve(doc)

    def test_no_mail_queue_and_no_guest_authority(self):
        from sds_ops.controls import block_email_queue
        from sds_ops.commercial import create_quotation
        with self.assertRaises(frappe.ValidationError):block_email_queue(None)
        frappe.set_user("Guest")
        with self.assertRaises(frappe.PermissionError):create_quotation("anything")

    def test_tender_gaps_and_public_evidence_are_blocked(self):
        doc=frappe.get_doc({"doctype":"SDS Tender","title":"Synthetic QA tender","reference":"QA-TOR",
            "buyer":"QA Buyer","responsible_user":"Administrator","status":"Approved to bid",
            "requirements":[{"requirement":"PhD engineering lead","mandatory":1,"status":"Missing"}]})
        with self.assertRaises(frappe.ValidationError):doc.insert()

    def test_alerts_are_idempotent_and_resolve(self):
        from sds_ops.automation import run_checks
        doc=frappe.get_doc({"doctype":"SDS Obligation","title":"QA renewal","company":"SDS",
            "category":"Subscription","responsible_user":"Administrator","due_date":add_days(nowdate(),-1),"status":"Open"}).insert()
        run_checks();run_checks()
        self.assertEqual(frappe.db.count("SDS Alert",{"alert_key":"obligation:"+doc.name}),1)
        doc.due_date=add_days(nowdate(),50);doc.save();run_checks()
        self.assertEqual(frappe.db.get_value("SDS Alert",{"alert_key":"obligation:"+doc.name},"status"),"Resolved")

    def test_intake_import_is_idempotent_without_external_actions(self):
        from sds_ops.integrations import import_project
        payload={"id":"qa-source-001","title":"Synthetic QA enquiry","brief":"QA supplied brief",
                 "state":"enquiry","updated_at":"2026-10-18T12:00:00Z"}
        payload["client_id"]="qa-client-001"
        contact={"id":"qa-client-001","name":"Synthetic Buyer","email":"qa-buyer@example.invalid","organisation":"QA Organisation"}
        name=import_project(payload,contact)
        self.assertEqual(name,import_project(payload,contact))
        record=frappe.get_doc("SDS Integration Record",name)
        lead=frappe.get_doc("CRM Lead",record.lead)
        self.assertEqual(lead.first_name,contact["name"])
        self.assertEqual(lead.email,contact["email"])
        self.assertEqual(lead.organization,contact["organisation"])
        with self.assertRaises(frappe.ValidationError):import_project(payload,{**contact,"id":"different"})
        self.assertEqual(frappe.db.count("SDS Integration Record",{"external_id":payload["id"]}),1)

    def test_sync_joins_contacts_once_per_registrant(self):
        from sds_ops.integrations import sync_intake
        settings=frappe.get_single("SDS Settings");settings.integration_enabled=1
        settings.worker_admin_token="synthetic-qa-token-never-used-on-network";settings.save()
        contact={"id":"qa-client-sync","name":"QA Sync Buyer","email":"qa-sync@example.invalid","organisation":"QA Sync Org"}
        def source(path,settings):
            if path=="/v2/projects?limit=100":return {"projects":[{"id":"qa-sync-a"},{"id":"qa-sync-b"}],"next_cursor":None}
            if path=="/v2/customers/qa-client-sync":return contact
            if path.startswith("/v2/projects/"):return {"id":path.rsplit("/",1)[-1],"client_id":contact["id"],"title":"QA sync","state":"enquiry"}
            raise AssertionError(path)
        with patch("sds_ops.integrations.source_get",side_effect=source) as calls:
            self.assertEqual(sync_intake()["imported"],2)
        self.assertEqual(sum(c.args[0]=="/v2/customers/qa-client-sync" for c in calls.call_args_list),1)
        self.assertEqual(frappe.db.count("CRM Lead",{"email":contact["email"]}),2)

    def test_institutional_workbook_template_is_unapproved(self):
        from sds_ops.commercial import instantiate_institutional_example
        name=instantiate_institutional_example()
        doc=frappe.get_doc("SDS Estimate",name)
        self.assertEqual(doc.fee_before_tax,846720)
        self.assertEqual(doc.support_fee,6336)
        self.assertEqual(doc.peak_funding,127008)
        self.assertEqual(doc.docstatus,0)
        self.assertFalse(doc.quotation)

    def test_client_pdf_has_no_internal_costs(self):
        from sds_ops.commercial import create_quotation
        from sds_ops.printing import quote_pdf
        from pypdf import PdfReader
        import io
        estimate=self.approve(self.estimate())
        quotation=create_quotation(estimate.name)
        quote_pdf(quotation)
        content=frappe.local.response.filecontent
        self.assertTrue(content.startswith(b"%PDF"))
        text=" ".join(p.extract_text() for p in PdfReader(io.BytesIO(content)).pages)
        self.assertIn("1,250.00",text)
        self.assertNotIn("QA engineering",text)
        self.assertNotIn("margin",text.lower())

    def test_approved_quotation_cannot_be_discounted_or_issued_without_estimate(self):
        from sds_ops.commercial import create_quotation, require_estimate
        quote=frappe.get_doc("Quotation",create_quotation(self.approve(self.estimate()).name))
        quote.items[0].rate=1
        with self.assertRaises(frappe.ValidationError):quote.save()
        quote.sds_estimate=None
        with self.assertRaises(frappe.ValidationError):require_estimate(quote)

    def test_real_accounting_payment_and_purchase_ledger(self):
        # All synthetic records and temporarily enabled posting roll back in tearDown.
        settings=frappe.get_single("SDS Settings")
        settings.update({"live_finance_enabled":1,"legal_identity_reviewed":1,"tax_setup_reviewed":1,
            "opening_balances_reviewed":1,"bank_setup_reviewed":1});settings.save()
        company=frappe.get_doc("Company","SDS")
        invoice=frappe.get_doc({"doctype":"Sales Invoice","company":"SDS","customer":self.customer(),
            "posting_date":nowdate(),"due_date":add_days(nowdate(),30),
            "items":[{"item_code":"SDS Implementation","qty":1,"rate":1000}]}).insert()
        invoice.submit()
        self.assertEqual(frappe.db.count("GL Entry",{"voucher_no":invoice.name,"is_cancelled":0}),2)
        from erpnext.accounts.doctype.payment_entry.payment_entry import get_payment_entry
        cash=frappe.db.get_value("Account",{"company":"SDS","account_type":"Cash","is_group":0},"name")
        payment=get_payment_entry("Sales Invoice",invoice.name,bank_account=cash)
        payment.reference_no="SYNTHETIC-QA-ONLY";payment.reference_date=nowdate()
        payment.insert();payment.submit();invoice.reload()
        self.assertEqual(invoice.outstanding_amount,0)
        supplier=frappe.get_doc({"doctype":"Supplier","supplier_name":"SDS Synthetic QA Supplier",
            "supplier_group":"Services","supplier_type":"Company"}).insert()
        order=frappe.get_doc({"doctype":"Purchase Order","company":"SDS","supplier":supplier.name,
            "transaction_date":nowdate(),"schedule_date":nowdate(),
            "items":[{"item_code":"SDS Implementation","qty":1,"rate":300,"schedule_date":nowdate()}]}).insert()
        order.submit()
        from erpnext.buying.doctype.purchase_order.purchase_order import make_purchase_invoice
        purchase=make_purchase_invoice(order.name);purchase.insert();purchase.submit()
        self.assertEqual(purchase.outstanding_amount,300)
        self.assertGreater(frappe.db.count("GL Entry",{"voucher_no":purchase.name,"is_cancelled":0}),0)

    def test_department_permission_boundaries(self):
        from sds_ops.dashboard import overview
        from sds_ops.setup import ROLE_PROFILES
        user=frappe.get_doc({"doctype":"User","email":"sds-qa-delivery@example.invalid","first_name":"Synthetic QA",
            "send_welcome_email":0,"role_profiles":[{"role_profile":"SDS Delivery"}]}).insert()
        frappe.set_user(user.name)
        self.assertIn("Projects User",frappe.get_roles())
        self.assertFalse(frappe.has_permission("Salary Slip","read"))
        self.assertFalse(frappe.has_permission("SDS Settings","read"))
        with self.assertRaises(frappe.PermissionError):overview()
        self.assertNotIn("Payroll Manager",ROLE_PROFILES["SDS Delivery"])

    def test_recurring_automation_prepares_one_unsent_draft_per_period(self):
        from sds_ops.automation import prepare_recurring_invoices
        engagement=self.engagement()
        agreement=self.file("qa-retainer.txt",engagement.doctype,engagement.name)
        doc=frappe.get_doc({"doctype":"SDS Retainer","title":"Synthetic QA recurring service","company":"SDS",
            "customer":engagement.customer,"engagement":engagement.name,"currency":"KES","monthly_fee":100,
            "responsible_user":"Administrator","start_date":nowdate(),"end_date":add_months(nowdate(),12),
            "next_invoice_date":nowdate(),"agreement":agreement,"status":"Active",
            "scope":"Synthetic QA analytics refresh","warranty_boundary":"Separate paid support; QA contract."}).insert()
        self.assertFalse(prepare_recurring_invoices()["enabled"])
        frappe.db.set_single_value("SDS Settings","prepare_recurring_drafts",1)
        self.assertEqual(prepare_recurring_invoices()["prepared"],1)
        self.assertEqual(prepare_recurring_invoices()["prepared"],0)
        invoices=frappe.get_all("Sales Invoice",filters={"sds_billing_key":["like",doc.name+":%"]},fields=["name","docstatus","grand_total"])
        self.assertEqual(len(invoices),1);self.assertEqual(invoices[0].docstatus,0);self.assertEqual(invoices[0].grand_total,100)
        settings=frappe.get_single("SDS Settings")
        settings.update({"live_finance_enabled":1,"legal_identity_reviewed":1,"tax_setup_reviewed":1,
            "opening_balances_reviewed":1,"bank_setup_reviewed":1});settings.save()
        invoice=frappe.get_doc("Sales Invoice",invoices[0].name)
        key=invoice.sds_billing_key
        invoice.reload();invoice.submit();invoice.cancel()
        self.assertEqual(invoice.sds_cancelled_billing_key,key)
        self.assertFalse(invoice.sds_billing_key)
        amended=frappe.copy_doc(invoice);amended.amended_from=invoice.name;amended.docstatus=0
        amended.insert()
        self.assertEqual(amended.sds_billing_key,key)
        self.assertEqual(frappe.db.count("Sales Invoice",{"sds_billing_key":key}),1)

    def test_gmail_only_creates_draft_and_recovers_ambiguous_result(self):
        import requests
        from sds_ops.outbound import save_to_gmail,reconcile_gmail_draft,record_owner_sent
        settings=frappe.get_single("SDS Settings")
        settings.gmail_enabled=1;settings.gmail_verified_sender="sds-qa@example.invalid"
        def draft(subject):
            return frappe.get_doc({"doctype":"SDS Outbound Draft","title":subject,"recipient":"recipient@example.invalid",
                "recipient_verified":1,"recipient_source":"Synthetic QA correspondence","subject":subject,
                "message":"<p>Synthetic QA only</p>","purpose":"Cold outreach"}).insert()
        first=draft("Synthetic QA draft")
        response=Mock(status_code=200);response.json.return_value={"id":"qa-draft-1","message":{"id":"qa-message-1"}}
        with patch("sds_ops.outbound.google_token",return_value="qa-token"), \
             patch("sds_ops.outbound.frappe.get_single",return_value=settings), \
             patch("sds_ops.outbound.requests.post",return_value=response) as post, \
             patch.object(frappe.db,"commit") as commit:
            result=save_to_gmail(first.name)
            self.assertFalse(result["sent"])
            self.assertEqual(save_to_gmail(first.name)["draft_id"],"qa-draft-1")
            self.assertEqual(post.call_count,1)
            self.assertTrue(post.call_args.args[0].endswith("/drafts"))
            commit.assert_called_once()
        result=record_owner_sent(first.name,"Synthetic QA sent message reference")
        self.assertFalse(result["email_sent_by_this_action"])
        second=draft("Synthetic QA ambiguous draft")
        with patch("sds_ops.outbound.google_token",return_value="qa-token"), \
             patch("sds_ops.outbound.frappe.get_single",return_value=settings), \
             patch("sds_ops.outbound.requests.post",side_effect=requests.Timeout) as post, \
             patch.object(frappe.db,"commit"):
            with self.assertRaises(frappe.ValidationError):save_to_gmail(second.name)
            self.assertEqual(frappe.db.get_value(second.doctype,second.name,"gmail_attempt_state"),"Uncertain")
            with self.assertRaises(frappe.ValidationError):save_to_gmail(second.name)
            self.assertEqual(post.call_count,1)
            response.json.return_value={"drafts":[{"id":"recovered-qa-draft","message":{"id":"qa-message-2"}}]}
            with patch("sds_ops.outbound.requests.get",return_value=response):
                self.assertEqual(reconcile_gmail_draft(second.name)["draft_id"],"recovered-qa-draft")


def run():
    suite=unittest.defaultTestLoader.loadTestsFromTestCase(OperationsTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    if not result.wasSuccessful():
        raise RuntimeError(f"SDS integration tests failed: {len(result.failures)} failures, {len(result.errors)} errors")
    return {"tests":result.testsRun,"passed":True}
