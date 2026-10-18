#!/usr/bin/env bash
# Run once as root on a dedicated Debian 13 host. No application data is deleted.
set -euo pipefail
test "$(id -u)" = 0 || { echo 'Run this host preparation script as root.' >&2; exit 1; }
. /etc/os-release
test "$ID:$VERSION_ID" = debian:13 || { echo 'Supported host: Debian 13 (trixie).' >&2; exit 1; }
apt-get update
apt-get install -y ca-certificates curl gnupg git build-essential pkg-config python3-venv python3-dev \
  redis-server nginx certbot python3-certbot-nginx libpango-1.0-0 libpangocairo-1.0-0 fonts-dejavu \
  cron xz-utils file
# MariaDB publishes signed packages for the supported 11.8 series.
install -d -m 0755 /etc/apt/keyrings
curl --fail --location --proto '=https' --proto-redir '=https' --tlsv1.2 https://mariadb.org/mariadb_release_signing_key.pgp \
  -o /etc/apt/keyrings/mariadb.asc
cat > /etc/apt/sources.list.d/sds-mariadb.sources <<'EOF'
Types: deb
URIs: https://deb.mariadb.org/11.8/debian
Suites: trixie
Components: main
Signed-By: /etc/apt/keyrings/mariadb.asc
EOF
apt-get update
apt-get install -y mariadb-server mariadb-client libmariadb-dev libmariadb-dev-compat
cat > /etc/mysql/mariadb.conf.d/60-sds.cnf <<'EOF'
[mysqld]
bind-address=127.0.0.1
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
EOF
case "$(dpkg --print-architecture)" in amd64) node_arch=x64;; arm64) node_arch=arm64;; *) exit 1;; esac
node_version=24.19.0
node_tmp=$(mktemp -d)
trap 'rm -rf "$node_tmp"' EXIT
cd "$node_tmp"
node_file="node-v${node_version}-linux-${node_arch}.tar.xz"
curl --fail --location --proto '=https' --proto-redir '=https' --tlsv1.2 -O "https://nodejs.org/dist/v${node_version}/${node_file}"
curl --fail --location --proto '=https' --proto-redir '=https' --tlsv1.2 -O "https://nodejs.org/dist/v${node_version}/SHASUMS256.txt"
awk -v file="$node_file" '$2==file {print}' SHASUMS256.txt > selected.sha256
test -s selected.sha256
sha256sum --check selected.sha256
install -d /opt/sds-node
tar -xJf "$node_file" --strip-components=1 -C /opt/sds-node
ln -sf /opt/sds-node/bin/node /usr/local/bin/node
ln -sf /opt/sds-node/bin/npm /usr/local/bin/npm
ln -sf /opt/sds-node/bin/npx /usr/local/bin/npx
PATH=/opt/sds-node/bin:$PATH npm install --global yarn@1.22.22
ln -sf /opt/sds-node/bin/yarn /usr/local/bin/yarn
python3 -m venv /opt/sds-tools
/opt/sds-tools/bin/pip install 'uv==0.11.33' 'frappe-bench==5.31.0'
ln -sf /opt/sds-tools/bin/uv /usr/local/bin/uv
ln -sf /opt/sds-tools/bin/bench /usr/local/bin/bench
if ! id sds >/dev/null 2>&1; then useradd --create-home --shell /bin/bash sds; fi
install -d -o sds -g sds -m 0750 /srv/sds
systemctl enable --now mariadb nginx
systemctl restart mariadb
echo 'Host packages prepared. Clone the SDS repository as user sds, then run deploy/install.py as that user.'
