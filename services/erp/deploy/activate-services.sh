#!/usr/bin/env bash
set -euo pipefail
test "$(id -u)" = 0 || { echo 'Run service activation as root.' >&2; exit 1; }
bench_path=${1:-/srv/sds/bench}
test -d "$bench_path/config/sds-services"
test -f "$bench_path/apps/sds_ops/deploy/backup_job.py"
install -d -m 0755 /usr/local/lib/sds
install -m 0644 "$bench_path/apps/sds_ops/deploy/backup_job.py" /usr/local/lib/sds/backup_job.py
for unit in "$bench_path"/config/sds-services/*.service "$bench_path"/config/sds-services/*.timer "$bench_path"/config/sds-services/*.target; do
  install -m 0644 "$unit" /etc/systemd/system/
done
install -m 0644 "$bench_path/config/sds-services/sds-nginx.conf" /etc/nginx/conf.d/sds-operations.conf
usermod -a -G sds www-data
runuser -u sds -- mkdir -p "$bench_path/secrets" "$bench_path/backups"
chmod 0700 "$bench_path/secrets" "$bench_path/backups"
if ! test -e "$bench_path/secrets/backup.key"; then
  runuser -u sds -- "$bench_path/env/bin/python" -m sds_ops.backup keygen "$bench_path/secrets/backup.key"
fi
systemctl daemon-reload
nginx -t
systemctl enable --now sds.target sds-backup.timer sds-health.timer
systemctl restart nginx
echo 'Services started. Private local URL: http://127.0.0.1:8088/app/sds-operations'
