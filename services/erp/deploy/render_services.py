#!/usr/bin/env python3
"""Render inspectable systemd and nginx configurations; never install or expose them implicitly."""
import argparse
from pathlib import Path
import re


def render(bench,site,user="sds"):
    bench=Path(bench).resolve()
    if not re.fullmatch(r"/[A-Za-z0-9_./-]+",str(bench)) or not re.fullmatch(r"[a-zA-Z0-9.-]+",site):
        raise ValueError("Use a simple absolute bench path and hostname.")
    if not re.fullmatch(r"[a-z_][a-z0-9_-]*",user):raise ValueError("Invalid service user.")
    output=bench/"config/sds-services";output.mkdir(parents=True,exist_ok=True)
    python=bench/"env/bin/python"
    cli=f"{python} -m frappe.utils.bench_helper frappe"
    services={
        "redis-cache":f"/usr/bin/redis-server --bind 127.0.0.1 --port 16379 --save \"\" --appendonly no --maxmemory 256mb --maxmemory-policy allkeys-lru",
        "redis-queue":f"/usr/bin/redis-server --bind 127.0.0.1 --port 16380 --dir {bench}/var/redis --appendonly yes --save \"\"",
        "web":f"{bench}/env/bin/gunicorn --bind 127.0.0.1:8085 --workers 2 --threads 4 --timeout 120 frappe.app:application",
        "socketio":f"/usr/local/bin/node {bench}/apps/frappe/socketio.js",
        "worker":f"{cli} worker --queue short,default",
        "long-worker":f"{cli} worker --queue long",
        "scheduler":f"{cli} schedule",
    }
    (bench/"var/redis").mkdir(parents=True,exist_ok=True)
    for name,command in services.items():
        after="network.target mariadb.service"
        if not name.startswith("redis"):after+=" sds-redis-cache.service sds-redis-queue.service"
        cwd=bench if name in ("socketio","redis-queue","redis-cache") else bench/"sites"
        extra=(f"Environment=FRAPPE_SOCKETIO_UDS={bench}/var/socketio.sock\n"
            f"ExecStartPre=/usr/bin/python3 /usr/local/lib/sds/prepare_socket.py --path {bench}/var/socketio.sock\n") if name=="socketio" else ""
        mask="0007" if name=="socketio" else "0027"
        unit=f"""[Unit]
Description=SDS {name}
After={after}
PartOf=sds.target
[Service]
User={user}
Group={user}
WorkingDirectory={cwd}
Environment=PATH=/opt/sds-node/bin:/usr/local/bin:/usr/bin:/bin
Environment=FRAPPE_BENCH_ROOT={bench}
{extra}ExecStart={command}
Restart=on-failure
RestartSec=5
TimeoutStopSec=180
KillSignal=SIGTERM
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths={bench}
UMask={mask}
[Install]
WantedBy=sds.target
"""
        (output/f"sds-{name}.service").write_text(unit)
    wants=" ".join("sds-"+n+".service" for n in services)
    (output/"sds.target").write_text(f"[Unit]\nDescription=SDS company operations\nWants={wants}\nAfter=mariadb.service\n[Install]\nWantedBy=multi-user.target\n")
    (output/"sds-backup.service").write_text(f"""[Unit]
Description=SDS quiesced encrypted backup
After=mariadb.service
[Service]
Type=oneshot
ExecStart=/usr/bin/python3 /usr/local/lib/sds/backup_job.py --bench {bench} --site {site} --user {user}
TimeoutStartSec=30min
UMask=0077
""")
    (output/"sds-backup.timer").write_text("[Unit]\nDescription=Nightly SDS backup\n[Timer]\nOnCalendar=*-*-* 03:05:00 Africa/Nairobi\nPersistent=true\n[Install]\nWantedBy=timers.target\n")
    (output/"sds-health.service").write_text(f"""[Unit]
Description=SDS local service and scheduler health
[Service]
Type=oneshot
User={user}
WorkingDirectory={bench}/sites
ExecStart={python} -m sds_ops.health --site {site}
UMask=0077
""")
    (output/"sds-health.timer").write_text("[Unit]\nDescription=SDS health checks\n[Timer]\nOnBootSec=2min\nOnUnitActiveSec=5min\n[Install]\nWantedBy=timers.target\n")
    nginx=f"""# Private by default. Add a verified domain and TLS before changing this listener.
server {{
    listen 127.0.0.1:8088;
    server_name {site};
    root {bench}/sites;
    client_max_body_size 25m;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    location /assets/ {{ try_files $uri =404; expires 7d; }}
    location ~ ^/protected/(.*) {{ internal; try_files /{site}/$1 =404; }}
    location /socket.io {{
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Frappe-Site-Name {site};
        proxy_set_header Origin $scheme://$http_host;
        proxy_set_header Host $host;
        proxy_pass http://unix:{bench}/var/socketio.sock:;
    }}
    location / {{ try_files /{site}/public/$uri @sds_backend; }}
    location ~* ^/files/.*\\.(htm|html|svg|xml)$ {{
        add_header Content-Disposition attachment;
        try_files /{site}/public/$uri @sds_backend;
    }}
    location @sds_backend {{
        proxy_set_header X-Frappe-Site-Name {site};
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Use-X-Accel-Redirect True;
        proxy_read_timeout 120;
        proxy_pass http://127.0.0.1:8085;
    }}
}}
"""
    (output/"sds-nginx.conf").write_text(nginx)
    return output


if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--bench",required=True,type=Path);parser.add_argument("--site",required=True);parser.add_argument("--user",default="sds")
    args=parser.parse_args();print(render(args.bench,args.site,args.user))
