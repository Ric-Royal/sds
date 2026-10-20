#!/usr/bin/env python3
"""Pinned complete stack installer. Run as the unprivileged sds service user."""
import argparse
import atexit
import getpass
import json
import os
from pathlib import Path
import secrets
import subprocess
import sys
import socket
import time

ROOT=Path(__file__).resolve().parents[1]
LOCK=json.loads((ROOT/"stack.lock.json").read_text())


def run(*args,cwd=None):
    subprocess.run([str(a) for a in args],cwd=cwd,check=True)


def create_bench(path,python):
    from bench.bench import Bench
    bench=Bench(str(path))
    bench.setup.dirs();bench.setup.logging();bench.setup.env(python=python)
    bench.setup.config(redis=False,procfile=True,additional_config={})
    bench.setup.patches()


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--bench",type=Path,default=Path("/srv/sds/bench"))
    parser.add_argument("--site",default="sds.localhost")
    args=parser.parse_args()
    if os.getuid()==0:parser.error("Run as the unprivileged sds user after bootstrap-debian.sh.")
    if not all(c.isalnum() or c in ".-" for c in args.site):parser.error("Invalid site name.")
    bench=args.bench.resolve()
    if bench.exists():parser.error("Choose a new empty bench path; this installer never replaces an existing site.")
    run("uv","python","install",LOCK["python"],"--python-downloads-json-url",ROOT/"deploy/locks/python-downloads.json")
    python=subprocess.check_output(["uv","python","find",LOCK["python"]],text=True).strip()
    create_bench(bench,python)
    for app in LOCK["apps"]:
        source=bench/"apps"/app["name"]
        if not source.exists():
            run("git","clone","--filter=blob:none","--no-checkout",app["url"],source)
            run("git","checkout","--detach",app["commit"],cwd=source)
        else:
            run("git","fetch","origin",app["ref"],cwd=source)
            run("git","checkout","--detach",app["commit"],cwd=source)
        actual=subprocess.check_output(["git","rev-parse","HEAD"],cwd=source,text=True).strip()
        if actual!=app["commit"]:raise RuntimeError("App pin mismatch: "+app["name"])
    (bench/"apps/sds_ops").symlink_to(ROOT,target_is_directory=True)
    (bench/"sites/apps.txt").write_text("\n".join([a["name"] for a in LOCK["apps"]]+["sds_ops"])+"\n")
    for app in [*(bench/"apps"/a["name"] for a in LOCK["apps"]),ROOT]:
        run(bench/"env/bin/pip","install","--editable",app)
    config={"db_host":"127.0.0.1","db_port":3306,"redis_cache":"redis://127.0.0.1:16379",
        "redis_queue":"redis://127.0.0.1:16380","redis_socketio":"redis://127.0.0.1:16380",
        "socketio_port":9085,"webserver_port":8085,"serve_default_site":True,
        "mute_emails":True,"enable_telemetry":False,"live_reload":False,"gunicorn_workers":2}
    (bench/"sites/common_site_config.json").write_text(json.dumps(config,indent=2))
    run(sys.executable,ROOT/"deploy/assets.py",bench)
    for port in (16379,16380):
        try:
            with socket.create_connection(("127.0.0.1",port),timeout=1):
                raise RuntimeError(f"Port {port} is already in use; choose a dedicated host.")
        except ConnectionRefusedError:pass
        process=subprocess.Popen(["redis-server","--bind","127.0.0.1","--port",str(port),"--save","","--appendonly","no"],stdout=subprocess.DEVNULL)
        atexit.register(process.terminate)
        for attempt in range(50):
            try:
                with socket.create_connection(("127.0.0.1",port),timeout=1):break
            except ConnectionRefusedError:time.sleep(0.1)
        else:raise RuntimeError("Redis did not start.")
    private=bench/"secrets";private.mkdir(mode=0o700)
    password=secrets.token_urlsafe(28)
    (private/"administrator-password").write_text(password);(private/"administrator-password").chmod(0o600)
    database_password=getpass.getpass("Existing MariaDB root TCP password (not saved): ")
    # Anonymous pipes keep passwords out of arguments, environment and logs.
    script="""import json,sys,frappe
from frappe.installer import _new_site
p=json.load(sys.stdin)
frappe.init(p['site'],new_site=True)
_new_site(db_name='sds_company',site=p['site'],db_host='127.0.0.1',db_port=3306,
 db_root_username='root',db_root_password=p['root'],admin_password=p['admin'],
 mariadb_user_host_login_scope='localhost',install_apps=p['apps'])
frappe.destroy()
frappe.init(p['site'])
from frappe.utils.password import get_encryption_key
get_encryption_key()
frappe.destroy()
"""
    subprocess.run([str(bench/"env/bin/python"),"-c",script],cwd=bench/"sites",input=json.dumps({
        "site":args.site,"root":database_password,"admin":password,"apps":[a["name"] for a in LOCK["apps"] if a["name"]!="frappe"]+["sds_ops"]}),text=True,check=True)
    path=bench/"sites"/args.site/"site_config.json"
    site_config=json.loads(path.read_text());site_config.update(mute_emails=True,enable_telemetry=False,
        developer_mode=0,allow_tests=False,disable_scheduler=0,host_name="http://127.0.0.1:8088")
    path.write_text(json.dumps(site_config,indent=2));path.chmod(0o600)
    run("bench","build","--production",cwd=bench)
    run(sys.executable,ROOT/"deploy/render_services.py","--bench",bench,"--site",args.site)
    print("Installed all applications. Private admin password: "+str(private/"administrator-password"))
    print("Install the generated services as root, start them, and verify /app/sds-operations before enabling external access.")


if __name__=="__main__":main()
