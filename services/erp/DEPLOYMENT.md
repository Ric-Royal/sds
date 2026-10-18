# Installation and recovery

## Supported stack and limits

Use a dedicated Debian 13 Linux host with Python 3.14.8, Node 24.19, MariaDB 11.8 and Redis 7. A planning starting point is 4 CPU cores, 8 GB RAM and 40 GB SSD, with more storage/RAM for client files, users and larger datasets. These are starting assumptions, not capacity measurements or a hosting purchase recommendation. A local computer needs to remain powered and backed up for scheduled work to run.

The native stack was installed and exercised in the build environment. Full app assets, real accounting workflows and encrypted recovery were tested. The production systemd/nginx setup requires validation on the actual host; this transient workspace is not a durable company server. No production ERP URL is claimed.

## Install on a new host

1. Review the pinned source and the scripts. Run `sudo bash services/erp/deploy/bootstrap-debian.sh` as root on a dedicated Debian 13 host. It installs free packages, Node with checksum verification, MariaDB, Redis, nginx, Bench and uv, and creates the unprivileged `sds` service user. It does not provision a paid host.
2. Secure MariaDB administration and configure a root TCP password locally using the host's MariaDB administrative tools. Keep this credential in the owner's password manager, outside Git and command history. The installer reads it interactively without logging or persisting it. Debian's default socket-only root account cannot be used by an unprivileged installer over TCP until an authorised administrative account is configured.
3. As `sds`, clone the reviewed SDS commit into `/srv/sds/source`. Run `/opt/sds-tools/bin/python /srv/sds/source/services/erp/deploy/install.py --bench /srv/sds/bench --site sds.localhost`. It creates a NEW bench, installs every pinned app, installs all frontend dependencies, creates the site, configures SDS and builds production assets. It refuses an existing bench. Keep the repository checkout at this path: the custom app is linked to it.
4. The installer writes the generated administrator password to `/srv/sds/bench/secrets/administrator-password` with mode 0600. Read it privately; do not paste it into a PR, email or screenshot. The site configuration contains encryption/database secrets and must remain mode 0600.
5. Run `sudo bash /srv/sds/source/services/erp/deploy/activate-services.sh /srv/sds/bench`. It copies reviewed units/configuration as root-owned files, starts the services and timers, and creates the encrypted-backup key. The initial listener is **127.0.0.1:8088**, with no public exposure. Database, Redis and backend bind loopback; Socket.IO uses a private Unix socket.
6. Open `http://127.0.0.1:8088/app/sds-operations`. For a remote host use an authorised SSH local port forward. Run `env/bin/python apps/sds_ops/deploy/http_check.py --site sds.localhost --password-file secrets/administrator-password` from the bench. Verify staff access with separate named users before sharing access.
7. Create the owner's named account, assign the SDS Owner profile, configure TOTP MFA and retain Administrator for recovery. Native welcome/reset emails are intentionally blocked: use private administrator-led initial access and TOTP, not email OTP. Set the named owner in SDS Settings. Configure finance, payroll, staff restrictions and real integrations from verified inputs.

The generated units include web, Socket.IO, cache, durable Redis queue, normal/long workers, scheduler, a nightly quiesced encrypted backup and a five-minute independent health check. Worker/provider credentials remain private. Optional telephony is dormant; no paid provider is required.

## External access and integrations

Do not change the loopback nginx listener until an actual domain/subdomain and host are chosen. Point the verified domain to that host, configure nginx server_name/listen for it, obtain TLS using the installed Certbot tooling, update site `host_name` to the HTTPS origin, validate origin/session behaviour and run the acceptance checks through HTTPS. Keep database/Redis/backend ports private. Test file access and TOTP with staff roles, then enable external access. No domain is invented by this build.

In SDS Settings, enter the existing Worker administrator token privately and enable intake sync. Only the approved Worker origin is accepted. Sync reads enquiries and records provenance; it does not accept quotes, change payments or release deliverables. Deploy the accompanying paginated Worker API before importing more than 100 records; old API responses of 100 records fail visibly instead of silently truncating history.

For direct server-to-Gmail drafts, authorise the intended Gmail account with a Google OAuth client and `gmail.compose` scope, store its client ID/secret/refresh token in Settings Password fields, record the verified sender and enable drafts. The server has no send operation, although the Google compose scope itself includes broader provider authority; keep credentials restricted and rotate them on compromise. No connector token is extracted from ChatGPT. Existing connected-Gmail automation can continue independently while server authorisation is unresolved.

## Backup, recovery and monitoring

The nightly timer runs at 03:05 Africa/Nairobi. It gracefully pauses web, workers and scheduler, creates an authenticated AES-256-GCM encrypted bundle as `sds`, verifies it, then restarts the previously active services in a `finally` block. A short maintenance interruption is expected. It includes database, public/private attachments, site encryption settings, configuration and payload checksums. Keep System Settings native backup encryption off for this bundle workflow; the SDS bundle already encrypts all contents and rejects unsupported nested encryption.

Keep a separate protected recovery copy of `secrets/backup.key`, the source commit/stack lock and administrator recovery details. A backup key stored only on the same disk is insufficient. The key is never included in the encrypted bundle. Copy encrypted backups off the host using storage the owner controls. No paid storage is activated. Choose retention against actual data growth and obligations; no backup deletion is automatic in this build.

From `bench/sites`, inspect a bundle:

```bash
../env/bin/python -m sds_ops.backup inspect /protected/backup.sdsbackup --key-file /protected/backup.key
```

Rehearse recovery into a **new**, isolated site on the same pinned stack:

```bash
../env/bin/python -m sds_ops.backup restore /protected/backup.sdsbackup \
  --key-file /protected/backup.key --site sds-rehearsal.localhost \
  --db-root-password-file /protected/db-admin-password \
  --admin-password-file /protected/new-admin-password
```

It refuses existing site paths, verifies authentication/hashes, restores database/files and compares critical record counts. It preserves the original credential-encryption key with the new database identity. Scheduler, live finance, Gmail, intake and recurring preparation are disabled on the restored copy. Review all connections before cutover. Never run both restored and original live automation against the same business records.

Use `systemctl status sds.target`, `systemctl --failed`, `journalctl -u sds-health -u sds-backup` and SDS Alerts. Health checks verify web, database, Redis and the hourly scheduler timestamp. A database/host failure cannot write an internal alert; systemd/journal and the owner's host monitoring must cover that case. No email is sent for alerts.

## Upgrade and rollback

Back up and rehearse restore before changing sources. Create a staging copy, check version compatibility, update the lock intentionally, install dependencies/build assets, run migrations and the isolated integration/HTTP checks, then plan a maintenance window. Stop writers, take a fresh backup, deploy the reviewed source, migrate and restart. Re-run HTTP, permissions and key business workflows. If migration fails, restore the verified backup into a fresh matching stack and cut over after review; do not downgrade app source over a changed database. Keep old data and the failing logs until recovery is verified.

The earlier development-site migration failure was resolved by a clean stable installation. Production installation never installs development branches. Optional Helpdesk legacy NLP corpus downloads were blocked by this environment's network policy; the modern SQLite support search and normal ticket workflows do not require enabling an unsafe proxy override.
