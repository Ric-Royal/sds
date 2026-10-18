#!/usr/bin/env python3
"""Systemd root wrapper: pause writes, run backup as service user, resume in finally."""
import argparse
from pathlib import Path
import subprocess


def main():
    parser=argparse.ArgumentParser();parser.add_argument("--bench",required=True,type=Path);parser.add_argument("--site",required=True);parser.add_argument("--user",default="sds")
    args=parser.parse_args();bench=args.bench.resolve()
    services=["sds-web","sds-worker","sds-long-worker","sds-scheduler"]
    active=[s for s in services if subprocess.run(["systemctl","is-active","--quiet",s]).returncode==0]
    try:
        if active:subprocess.run(["systemctl","stop",*active],check=True)
        subprocess.run(["runuser","-u",args.user,"--",str(bench/"env/bin/python"),"-m","sds_ops.backup","create",
            "--site",args.site,"--destination",str(bench/"backups"),"--key-file",str(bench/"secrets/backup.key")],cwd=bench/"sites",check=True)
    finally:
        if active:subprocess.run(["systemctl","start",*active],check=True)


if __name__=="__main__":main()
