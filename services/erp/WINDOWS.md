# SDS on Richard's Windows computer

The owner selected his computer for the first installation, with migration to another server later. Windows is confirmed; its version, memory and existing Linux distribution remain unverified. No installation on Richard's computer has been performed from the remote build workspace.

## Inspect existing Linux before installing anything

In Windows PowerShell, run `wsl --list --verbose`. This lists installed WSL distributions and their WSL version. From the reviewed checkout, `powershell -File services/erp/deploy/windows-preflight.ps1` also reports Windows build, RAM and free system-drive space. Add `-Distro Debian` only if that is the exact distribution name listed; it reads Linux release, init system, memory and disk information. These scripts do not install, upgrade, convert or remove a distribution.

Use an existing **dedicated Debian 13 WSL 2** distribution when it meets the requirements. The installed Linux must be checked; a name such as Debian does not establish its version. Do not upgrade an existing working distribution or convert WSL 1 without first reviewing its other projects and backing it up. A separate Linux instance is preferable when the existing one hosts unrelated work.

If WSL/Linux is absent, Microsoft's supported path is an administrator PowerShell `wsl --install -d Debian`, followed by any requested Windows restart and first-run Linux user setup. Check the resulting Debian version before running SDS bootstrap. WSL 2, Debian and the SDS stack have no hosting subscription requirement. No Docker Desktop or VirtualBox Extension Pack is needed.

## Configure the verified Linux instance

Follow [Microsoft's WSL systemd instructions](https://learn.microsoft.com/en-us/windows/wsl/systemd). Debian needs systemd and systemd-sysv installed. Merge a `[boot]` section with `systemd=true` into `/etc/wsl.conf` without discarding other settings, then stop the selected distribution after saving work and reopen it. Confirm `cat /proc/1/comm` reports `systemd`. This requires WSL 0.67.6 or newer. Do not run a blanket shutdown while other Linux work is active.

Keep the repository and database inside Linux storage at `/srv/sds`, not a mounted Windows folder under `/mnt/c`. The existing native deployment scripts bind services to loopback and open the local ERP at `http://127.0.0.1:8088/app/sds-operations`. The backend, MariaDB and Redis stay private. No public firewall rule, LAN access or domain change is part of the local setup.

Only install a reviewed commit after both GitHub CI workflows pass on that exact commit. Use the pinned source commit from PR #12 and follow [DEPLOYMENT.md](DEPLOYMENT.md), steps 1–7, inside the selected Debian 13 instance. The installer refuses an existing bench. Review the bootstrap only for a dedicated instance: it installs packages and configures MariaDB/nginx for SDS. Administrator and database credentials are created/read privately, never pasted into commands, Git or email. Create Richard's named SDS Owner account, enable TOTP, and retain Administrator for recovery. Live financial posting remains blocked until actual company/accounting inputs are reviewed.

After services and HTTP checks pass, use `powershell -File services/erp/deploy/start-windows.ps1 -Distro Debian` with the actual distribution name. This opens the login page and holds a foreground WSL session. It stops visibly on a failed service or HTTP check. Windows-specific scripts have been reviewed but have not been executed on the owner's computer; local installation/browser acceptance is still required.

## Daily availability and backups

Keep the computer powered, awake and connected while operations should run. A personal computer's sleep, shutdown, reboot or user-session closure can interrupt jobs. WSL systemd services alone do not keep the instance alive; the start script keeps a foreground session open. No Windows sleep policy or unattended login setting is changed automatically.

The native backup timer is scheduled for 03:05 Africa/Nairobi. If the computer will be off then, choose an actual awake window before relying on the timer. Run and verify a backup before shutdown after material changes. Review SDS Alerts after restarting; stale scheduler/backup timestamps remain visible. Do not confuse the independent connected-Gmail daily task with the local ERP scheduler.

Store encrypted backup bundles and a separate protected backup-key copy on storage outside the Linux virtual disk, preferably a different physical device under Richard's control. An extra copy on the same computer helps recover a distribution but does not cover computer loss. Keep the private pipeline snapshot outside public Git. It preserves verified correspondence and existing Gmail draft identifiers; it is not a database backup and must not trigger duplicate draft creation.

## Migration to another server

1. Install the same pinned app stack on a new supported Linux server. Copy the source commit and lock file, not development branches.
2. Stop or pause new writes on the old instance, create the encrypted full backup, authenticate it and copy it with a separately transferred key.
3. Restore into a new isolated site using the procedure in DEPLOYMENT.md. Recovery keeps integrations, recurring drafts, scheduler and live finance disabled.
4. Compare record counts and attachment hashes; test Richard's login, MFA, role permissions, quotations, invoice correction, support, file privacy and backup recovery through the new host.
5. Configure the selected server's TLS/access and private credentials. Enable only the new site's intended jobs after stopping the old site's integrations/scheduler. Keep the old instance read-only until acceptance and rollback needs are settled.

Native encrypted recovery is the primary migration path. A WSL export may be an additional private machine snapshot, but it can contain unencrypted secrets and does not replace the authenticated application backup/recovery test. No migration deletes the original instance automatically.

Sources: [Microsoft WSL commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands), [systemd in WSL](https://learn.microsoft.com/en-us/windows/wsl/systemd), [Debian 13 release](https://www.debian.org/releases/trixie/).
