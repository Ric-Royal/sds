# Read-only inventory. Run in Windows PowerShell; no administrator rights needed.
param([string]$Distro)
$ErrorActionPreference = 'Stop'
$os = Get-CimInstance Win32_OperatingSystem
$computer = Get-CimInstance Win32_ComputerSystem
[pscustomobject]@{
    Windows = $os.Caption
    Build = $os.BuildNumber
    RAM_GiB = [math]::Round($computer.TotalPhysicalMemory / 1GB, 1)
    FreeSystemDisk_GiB = [math]::Round((Get-PSDrive -Name $env:SystemDrive.TrimEnd(':')).Free / 1GB, 1)
} | Format-List
if (-not (Get-Command wsl.exe -ErrorAction SilentlyContinue)) {
    Write-Output 'WSL is not installed. No changes made.'
    exit 0
}
& wsl.exe --list --verbose
if ($LASTEXITCODE -ne 0) { throw 'WSL inventory failed. No installation was attempted.' }
if ($Distro) {
    # Starts only the explicitly selected distribution and reads its inventory.
    & wsl.exe --distribution $Distro --exec sh -c 'cat /etc/os-release; printf "\nInit process: "; cat /proc/1/comm; printf "\nLinux memory:\n"; free -h; printf "\nLinux disk:\n"; df -h /'
    if ($LASTEXITCODE -ne 0) { throw 'Could not read the selected Linux distribution.' }
}
