# Install Windows Terminal using WinGet
Write-Host "Installing Windows Terminal..."
winget install --id Microsoft.WindowsTerminal --source winget --accept-package-agreements --accept-source-agreements
Write-Host "Windows Terminal installation completed."

# Install PowerShell using WinGet
Write-Host "Installing PowerShell..."
winget install --id Microsoft.PowerShell --source winget --accept-package-agreements --accept-source-agreements
Write-Host "PowerShell installation completed."

# Install Git using WinGet
Write-Host "Installing Git..."
winget install --id Git.Git --source winget --accept-package-agreements --accept-source-agreements
Write-Host "Git installation completed."

# Install Node.js LTS using WinGet
Write-Host "Installing Node.js LTS..."
winget install --id OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements
Write-Host "Node.js LTS installation completed."

# Install Visual Studio Code using WinGet
Write-Host "Installing Visual Studio Code..."
winget install --id Microsoft.VisualStudioCode --source winget --accept-package-agreements --accept-source-agreements
Write-Host "Visual Studio Code installation completed."

# Install Microsoft Visual C++ Redistributable (latest)
Write-Host "Installing Microsoft Visual C++ Redistributable..."
winget install --id Microsoft.VCRedist.2015+.x64 --source winget --accept-package-agreements --accept-source-agreements
Write-Host "Microsoft Visual C++ Redistributable installation completed."