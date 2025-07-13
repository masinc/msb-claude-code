# Install Windows Terminal using WinGet
Write-Host "Installing Windows Terminal..."
Install-WinGetPackage -Id Microsoft.WindowsTerminal -Source winget -Force
Write-Host "Windows Terminal installation completed."

# Install PowerShell using WinGet
Write-Host "Installing PowerShell..."
Install-WinGetPackage -Id Microsoft.PowerShell -Source winget -Force
Write-Host "PowerShell installation completed."

# Install Git using WinGet
Write-Host "Installing Git..."
Install-WinGetPackage -Id Git.Git -Source winget -Force
Write-Host "Git installation completed."

# Install Node.js LTS using WinGet
Write-Host "Installing Node.js LTS..."
Install-WinGetPackage -Id OpenJS.NodeJS.LTS -Source winget -Force
Write-Host "Node.js LTS installation completed."

# Install Visual Studio Code using WinGet
Write-Host "Installing Visual Studio Code..."
Install-WinGetPackage -Id Microsoft.VisualStudioCode -Source winget -Force
Write-Host "Visual Studio Code installation completed."

# Install Microsoft Visual C++ Redistributable (latest)
Write-Host "Installing Microsoft Visual C++ Redistributable..."
Install-WinGetPackage -Id Microsoft.VCRedist.2015+.x64 -Source winget -Force
Write-Host "Microsoft Visual C++ Redistributable installation completed."

# Refresh environment variables
. "C:\init\refresh-environment.ps1"
Refresh-Environment