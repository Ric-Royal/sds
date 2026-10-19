#!/usr/bin/env python3
"""Authenticated HTTP acceptance checks. Password is read privately from a file."""
import argparse
from pathlib import Path
import re
import requests


def main():
    parser=argparse.ArgumentParser();parser.add_argument("--url",default="http://127.0.0.1:8088");parser.add_argument("--site",required=True);parser.add_argument("--password-file",required=True)
    args=parser.parse_args();session=requests.Session();session.headers["Host"]=args.site
    base=args.url.rstrip("/")
    response=session.get(base+"/api/method/sds_ops.dashboard.overview",timeout=30)
    assert response.status_code in (401,403),"Guest dashboard access must be denied"
    response=session.post(base+"/api/method/login",data={"usr":"Administrator","pwd":Path(args.password_file).read_text().strip()},timeout=30)
    assert response.status_code==200,"Administrator login failed"
    dashboard=session.get(base+"/api/method/sds_ops.dashboard.overview",timeout=30)
    assert dashboard.status_code==200,"Owner dashboard API failed"
    assert dashboard.json()["message"]["owner_target"]==250000
    assets=set()
    for route in ("/app/sds-operations","/crm","/helpdesk","/hrms","/banking"):
        page=session.get(base+route,timeout=60)
        assert page.status_code==200,f"{route}: HTTP {page.status_code}"
        assert "Traceback (most recent call last)" not in page.text,route
        assets.update(re.findall(r'''(?:src|href)=["'](/assets/[^"'?]+)''',page.text))
        print(route,"HTTP 200")
    assets.add("/assets/sds_ops/js/operations.js");assets.add("/assets/sds_ops/css/operations.css")
    for asset in sorted(assets):
        result=session.get(base+asset,timeout=30)
        assert result.status_code==200,f"Missing asset {asset}: {result.status_code}"
    print(f"Verified login, guest rejection, owner dashboard, five app routes and {len(assets)} static assets.")


if __name__=="__main__":main()
