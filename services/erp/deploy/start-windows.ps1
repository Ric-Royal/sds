# After installing SDS inside the verified Debian 13 WSL 2 distribution.
param([Parameter(Mandatory=$true)][string]$Distro)
$ErrorActionPreference = 'Stop'
& wsl.exe --distribution $Distro --exec sh -c 'test "$(cat /proc/1/comm)" = systemd && systemctl is-active --quiet sds.target'
if ($LASTEXITCODE -ne 0) { throw 'SDS services are not active. Start the reviewed services inside Linux and check their logs first.' }
$response = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8088/login' -TimeoutSec 20
if ($response.StatusCode -ne 200) { throw 'The SDS local login page did not pass the HTTP check.' }
Start-Process 'http://127.0.0.1:8088/app/sds-operations'
Write-Output 'Leave this window open while SDS runs. Windows sleep, shutdown or restart interrupts scheduled work.'
# A foreground Linux process keeps this local WSL session alive.
& wsl.exe --distribution $Distro --exec sleep infinity
