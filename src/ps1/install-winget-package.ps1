# Ensure WinGet is available in current session
$wingetPath = Get-Command winget -ErrorAction SilentlyContinue
if (-not $wingetPath) {
    Write-Host "WinGet not found in PATH, attempting to locate..."
    # Try common WinGet locations
    $possiblePaths = @(
        "$env:LOCALAPPDATA\Microsoft\WindowsApps\winget.exe",
        "$env:ProgramFiles\WindowsApps\Microsoft.DesktopAppInstaller*\winget.exe"
    )
    
    foreach ($path in $possiblePaths) {
        $resolved = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($resolved) {
            $wingetPath = $resolved.FullName
            Write-Host "Found WinGet at: $wingetPath"
            break
        }
    }
    
    if (-not $wingetPath) {
        Write-Warning "WinGet executable not found. Skipping package installations."
        exit 1
    }
} else {
    $wingetPath = $wingetPath.Source
}

# Install Windows Terminal using WinGet
Write-Host "Installing Windows Terminal..."
& $wingetPath install --id Microsoft.WindowsTerminal --source winget --accept-package-agreements --accept-source-agreements
Write-Host "Windows Terminal installation completed."

# Install PowerShell using WinGet
Write-Host "Installing PowerShell..."
& $wingetPath install --id Microsoft.PowerShell --source winget --accept-package-agreements --accept-source-agreements
Write-Host "PowerShell installation completed."

# Install Git using WinGet
Write-Host "Installing Git..."
& $wingetPath install --id Git.Git --source winget --accept-package-agreements --accept-source-agreements
Write-Host "Git installation completed."

# Install Node.js LTS using WinGet
Write-Host "Installing Node.js LTS..."
& $wingetPath install --id OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements
Write-Host "Node.js LTS installation completed."

# Install Visual Studio Code using WinGet
Write-Host "Installing Visual Studio Code..."
& $wingetPath install --id Microsoft.VisualStudioCode --source winget --accept-package-agreements --accept-source-agreements
Write-Host "Visual Studio Code installation completed."

# Install Microsoft Visual C++ Redistributable (latest)
Write-Host "Installing Microsoft Visual C++ Redistributable..."
& $wingetPath install --id Microsoft.VCRedist.2015+.x64 --source winget --accept-package-agreements --accept-source-agreements
Write-Host "Microsoft Visual C++ Redistributable installation completed."