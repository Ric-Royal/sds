#!/usr/bin/env python3
"""Real clean-site CI installation using the same pinned app sources as deployment."""
import json
import os
from pathlib import Path
import subprocess
import sys
from install import ROOT,LOCK,run,create_bench


def main():
    bench=Path(sys.argv[1]).resolve()
    create_bench(bench,sys.executable)
    for app in LOCK["apps"]:
        source=bench/"apps"/app["name"]
        if not source.exists():
            run("git","init",source)
            run("git","remote","add","origin",app["url"],cwd=source)
        run("git","fetch","--depth=1","origin",app["commit"],cwd=source)
        run("git","checkout","--detach",app["commit"],cwd=source)
        run(bench/"env/bin/pip","install","--editable",source)
    (bench/"apps/sds_ops").symlink_to(ROOT,target_is_directory=True)
    run(bench/"env/bin/pip","install","--editable",ROOT)
    (bench/"sites/apps.txt").write_text("\n".join([a["name"] for a in LOCK["apps"]]+["sds_ops"])+"\n")
    (bench/"sites/common_site_config.json").write_text(json.dumps({"db_host":"127.0.0.1","db_port":3306,
        "redis_cache":"redis://127.0.0.1:6379","redis_queue":"redis://127.0.0.1:6379",
        "redis_socketio":"redis://127.0.0.1:6379","mute_emails":True,"enable_telemetry":False}))
    script="""import os,frappe
from frappe.installer import _new_site
frappe.init('sds-ci.localhost',new_site=True)
_new_site(db_name='sds_ci',site='sds-ci.localhost',db_host='127.0.0.1',db_port=3306,
 db_root_username='root',db_root_password=os.environ['SDS_CI_DB_PASSWORD'],admin_password='Synthetic-CI-only-73dP!',
 mariadb_user_host_login_scope='%',install_apps=['erpnext','hrms','telephony','crm','helpdesk','sds_ops'])
frappe.destroy()
frappe.init('sds-ci.localhost');frappe.connect();frappe.set_user('Administrator');frappe.flags.in_test=True
from sds_ops.test_operations import run
try: print(run())
finally: frappe.db.rollback();frappe.destroy()
"""
    subprocess.run([str(bench/"env/bin/python"),"-c",script],cwd=bench/"sites",check=True)


if __name__=="__main__":main()
