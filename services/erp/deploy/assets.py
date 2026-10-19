#!/usr/bin/env python3
"""Install all upstream frontend dependencies from the official npm registry."""
from pathlib import Path
import subprocess
import sys
import shutil


def main(bench):
    apps=bench/"apps"
    names=["frappe","erpnext","hrms","crm","helpdesk"]
    for name in names:
        # Change download endpoints only; retain upstream versions and integrity hashes.
        for path in (apps/name).rglob("yarn.lock"):
            if "node_modules" not in path.parts:
                path.write_text(path.read_text().replace("https://registry.yarnpkg.com/","https://registry.npmjs.org/"))
        subprocess.run(["yarn","install","--registry","https://registry.npmjs.org","--network-timeout","300000"],cwd=apps/name,check=True)
    # Framework UI is source-linked by CRM and Helpdesk, with its own dependency graph.
    shutil.copyfile(Path(__file__).parent/"locks/frappe-ui.yarn.lock",apps/"frappe/ui/yarn.lock")
    subprocess.run(["yarn","install","--frozen-lockfile","--registry","https://registry.npmjs.org"],cwd=apps/"frappe/ui",check=True)


if __name__=="__main__":main(Path(sys.argv[1]).resolve())
