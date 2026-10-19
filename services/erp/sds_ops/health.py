"""Independent health timer. Writes internal alerts and journal output; never sends email."""
import argparse
from datetime import timedelta
import json
import requests
import frappe
from frappe.utils import get_datetime,now_datetime


def check(site):
    failures=[]
    try:
        response=requests.get("http://127.0.0.1:8085/api/method/ping",headers={"Host":site},timeout=10,allow_redirects=False)
        if response.status_code!=200 or response.json().get("message")!="pong":failures.append("Web health check failed")
    except (requests.RequestException,ValueError):failures.append("Web service is unavailable")
    frappe.init(site);frappe.connect();frappe.set_user("Administrator")
    try:
        from sds_ops.automation import alert,run_checks
        from frappe.utils.background_jobs import get_redis_conn
        frappe.cache.ping();get_redis_conn().ping()
        settings=frappe.get_single("SDS Settings")
        if not settings.last_scheduler_check or now_datetime()-get_datetime(settings.last_scheduler_check)>timedelta(hours=2):
            failures.append("Scheduled company checks are missing or more than two hours old")
        if failures:alert("system-health","SDS service health needs attention","Critical",detail="; ".join(failures))
        else:
            name=frappe.db.get_value("SDS Alert",{"alert_key":"system-health"},"name")
            if name:frappe.db.set_value("SDS Alert",name,"status","Resolved")
        run_checks();frappe.db.commit()
        return {"healthy":not failures,"failures":failures}
    finally:frappe.destroy()


if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--site",required=True);args=parser.parse_args()
    result=check(args.site);print(json.dumps(result))
    if not result["healthy"]:raise SystemExit(1)
