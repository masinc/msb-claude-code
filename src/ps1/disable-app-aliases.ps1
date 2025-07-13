# Disable all app execution aliases
Write-Host "Disabling app execution aliases..."

# Get all app execution aliases
$aliases = Get-ChildItem "HKCU:\Software\Microsoft\Windows\CurrentVersion\App Paths"

foreach ($alias in $aliases) {
    $aliasName = $alias.PSChildName
    Write-Host "Disabling alias: $aliasName"
    
    # Set the alias to disabled
    try {
        Set-ItemProperty -Path $alias.PSPath -Name "(default)" -Value "" -ErrorAction SilentlyContinue
    } catch {
        Write-Host "Failed to disable $aliasName" -ForegroundColor Yellow
    }
}

# Also disable common Microsoft Store app aliases via registry
$appAliases = @(
    "python.exe",
    "python3.exe",
    "pip.exe",
    "pip3.exe",
    "node.exe",
    "npm.exe",
    "curl.exe"
)

Write-Host "Disabling Microsoft Store app aliases..."
foreach ($app in $appAliases) {
    try {
        # Remove from Windows Apps folder if exists
        $appPath = "$env:LOCALAPPDATA\Microsoft\WindowsApps\$app"
        if (Test-Path $appPath) {
            Remove-Item $appPath -Force -ErrorAction SilentlyContinue
            Write-Host "Removed: $app"
        }
    } catch {
        Write-Host "Failed to remove $app" -ForegroundColor Yellow
    }
}

Write-Host "App execution aliases disabled."