"""Authenticated, streamed backup bundles; restore only into a NEW isolated site."""
import argparse
import base64
from datetime import datetime,timezone
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import tarfile
import tempfile

from cryptography.hazmat.primitives.ciphers import Cipher,algorithms,modes

MAGIC=b"SDSBKP1\n"
TABLES=["Company","User","Customer","Supplier","SDS Estimate","SDS Engagement","SDS Milestone",
    "SDS Retainer","Sales Invoice","Purchase Invoice","Payment Entry","Employee","Asset","HD Ticket"]


def digest(path):
    with Path(path).open("rb") as stream:
        return hashlib.file_digest(stream,"sha256").hexdigest()


def key_bytes(path):
    path=Path(path)
    if path.stat().st_mode & 0o077:raise ValueError("Backup key must have mode 0600.")
    key=base64.urlsafe_b64decode(path.read_bytes().strip())
    if len(key)!=32:raise ValueError("Backup key must contain 32 random bytes.")
    return key


def encrypt(source,target,key):
    nonce=secrets.token_bytes(12)
    crypt=Cipher(algorithms.AES(key),modes.GCM(nonce)).encryptor();crypt.authenticate_additional_data(MAGIC)
    with Path(source).open("rb") as incoming,Path(target).open("xb") as outgoing:
        os.chmod(target,0o600);outgoing.write(MAGIC+nonce)
        while chunk:=incoming.read(1024*1024):outgoing.write(crypt.update(chunk))
        outgoing.write(crypt.finalize());outgoing.write(crypt.tag)


def decrypt(source,target,key):
    source=Path(source)
    with source.open("rb") as incoming,Path(target).open("xb") as outgoing:
        os.chmod(target,0o600)
        if incoming.read(len(MAGIC))!=MAGIC:raise ValueError("Unknown backup format.")
        nonce=incoming.read(12);incoming.seek(-16,2);tag=incoming.read(16)
        crypt=Cipher(algorithms.AES(key),modes.GCM(nonce,tag)).decryptor();crypt.authenticate_additional_data(MAGIC)
        incoming.seek(len(MAGIC)+12);remaining=source.stat().st_size-len(MAGIC)-12-16
        while remaining:
            chunk=incoming.read(min(1024*1024,remaining))
            if not chunk:raise ValueError("Truncated backup.")
            remaining-=len(chunk);outgoing.write(crypt.update(chunk))
        outgoing.write(crypt.finalize())


def unpack(bundle,key,work):
    archive=work/"bundle.tar";decrypt(bundle,archive,key)
    target=work/"payload";target.mkdir(mode=0o700)
    with tarfile.open(archive) as tar:
        members=tar.getmembers()
        if any(not m.isfile() or "/" in m.name or m.name in (".","..") for m in members):
            raise ValueError("Invalid backup archive member.")
        tar.extractall(target,filter="data")
    manifest=json.loads((target/"manifest.json").read_text())
    for name,checksum in manifest["sha256"].items():
        if Path(name).name!=name or digest(target/name)!=checksum:raise ValueError("Backup checksum mismatch.")
    return target,manifest


def counts():
    import frappe
    return {name:frappe.db.count(name) for name in TABLES}


def create(site,destination,key_file):
    import frappe
    from frappe.utils.backups import new_backup
    from frappe.utils import now_datetime
    destination=Path(destination).resolve();destination.mkdir(parents=True,exist_ok=True,mode=0o700)
    key=key_bytes(key_file)
    with tempfile.TemporaryDirectory(prefix="sds-backup-") as temporary:
        work=Path(temporary);frappe.init(site);frappe.connect();frappe.set_user("Administrator")
        try:
            if frappe.get_system_settings("encrypt_backup"):
                raise ValueError("Use the SDS authenticated backup instead of nested native backup encryption; turn off System Settings > Encrypt Backup for this bundle workflow.")
            backup=new_backup(force=True,ignore_files=False,compress=True,backup_path=str(work))
            sources={"database.sql.gz":backup.backup_path_db,"public-files.tgz":backup.backup_path_files,
                "private-files.tgz":backup.backup_path_private_files,"site-config.json":backup.backup_path_conf}
            payload=work/"payload";payload.mkdir(mode=0o700)
            for name,source in sources.items():shutil.copyfile(source,payload/name)
            shutil.copyfile("common_site_config.json",payload/"common-config.json")
            manifest={"format":1,"site":site,"created_utc":datetime.now(timezone.utc).isoformat(),
                "counts":counts(),"apps":frappe.get_installed_apps(),
                "sha256":{p.name:digest(p) for p in payload.iterdir()}}
            (payload/"manifest.json").write_text(json.dumps(manifest,indent=2))
            archive=work/"bundle.tar"
            with tarfile.open(archive,"w") as tar:
                for path in payload.iterdir():tar.add(path,arcname=path.name)
            target=destination/(datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")+"-"+site+".sdsbackup")
            encrypt(archive,target,key)
            # Verify authentication, archive boundaries and every payload hash before reporting success.
            verification=work/"verification";verification.mkdir();unpack(target,key,verification)
            frappe.db.set_single_value("SDS Settings","last_backup_verified",now_datetime());frappe.db.commit()
            return {"file":str(target),"sha256":digest(target),"counts":manifest["counts"]}
        finally:frappe.destroy()


def restore(bundle,key_file,site,root_user,root_password_file,admin_password_file):
    import frappe
    from frappe.installer import _new_site,extract_files
    if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9.-]{1,120}",site) or Path(site).exists():
        raise ValueError("Restore requires a NEW site name; existing sites are never overwritten.")
    with tempfile.TemporaryDirectory(prefix="sds-restore-") as temporary:
        payload,manifest=unpack(bundle,key_bytes(key_file),Path(temporary))
        current=json.loads(Path("common_site_config.json").read_text())
        frappe.init(site,new_site=True)
        _new_site(db_name="sds_restore_"+secrets.token_hex(6),site=site,db_root_username=root_user,
            db_root_password=Path(root_password_file).read_text().strip(),
            admin_password=Path(admin_password_file).read_text().strip(),db_host=current.get("db_host","127.0.0.1"),
            db_port=current.get("db_port",3306),mariadb_user_host_login_scope="localhost",
            source_sql=str(payload/"database.sql.gz"))
        frappe.destroy()
        path=Path(site)/"site_config.json";new=json.loads(path.read_text())
        original=json.loads((payload/"site-config.json").read_text())
        # Preserve credential encryption, replacing only destination database identity and runtime connections.
        excluded={"db_name","db_user","db_password","db_host","db_port","db_socket","host_name"}
        new.update({k:v for k,v in original.items() if k not in excluded})
        new.update(mute_emails=True,disable_scheduler=1,host_name="http://127.0.0.1:8088")
        path.write_text(json.dumps(new,indent=2));path.chmod(0o600)
        frappe.init(site);frappe.connect();frappe.set_user("Administrator")
        try:
            frappe.destroy()
            for name in ("public-files.tgz","private-files.tgz"):
                extracted=extract_files(site,str(payload/name));Path(extracted).unlink(missing_ok=True)
            frappe.init(site);frappe.connect();frappe.set_user("Administrator")
            restored=counts()
            if restored!=manifest["counts"]:raise ValueError("Restored record counts differ from the backup.")
            for flag in ("integration_enabled","gmail_enabled","live_finance_enabled","prepare_recurring_drafts"):
                frappe.db.set_single_value("SDS Settings",flag,0)
            frappe.db.commit()
            return {"site":site,"counts_match":True,"scheduler_enabled":False,"external_integrations_enabled":False}
        finally:frappe.destroy()


def main():
    parser=argparse.ArgumentParser();sub=parser.add_subparsers(dest="command",required=True)
    key=sub.add_parser("keygen");key.add_argument("key_file",type=Path)
    backup=sub.add_parser("create");backup.add_argument("--site",required=True);backup.add_argument("--destination",required=True);backup.add_argument("--key-file",required=True)
    inspect=sub.add_parser("inspect");inspect.add_argument("bundle");inspect.add_argument("--key-file",required=True)
    recovery=sub.add_parser("restore");recovery.add_argument("bundle");recovery.add_argument("--key-file",required=True);recovery.add_argument("--site",required=True)
    recovery.add_argument("--db-root-user",default="root");recovery.add_argument("--db-root-password-file",required=True);recovery.add_argument("--admin-password-file",required=True)
    args=parser.parse_args()
    if args.command=="keygen":
        with os.fdopen(os.open(args.key_file,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600),"wb") as file:
            file.write(base64.urlsafe_b64encode(secrets.token_bytes(32)))
        print("Created backup key; keep a separate private recovery copy.")
    elif args.command=="create":print(json.dumps(create(args.site,args.destination,args.key_file),indent=2))
    elif args.command=="inspect":
        with tempfile.TemporaryDirectory() as temporary:
            _,manifest=unpack(args.bundle,key_bytes(args.key_file),Path(temporary));print(json.dumps(manifest,indent=2))
    else:print(json.dumps(restore(args.bundle,args.key_file,args.site,args.db_root_user,args.db_root_password_file,args.admin_password_file),indent=2))


if __name__=="__main__":main()
