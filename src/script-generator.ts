export function generateInitScript(): string {
  return `# Start transcript for logging
Start-Transcript -Path "C:\\init.log" -Append

# Source notification script
. "C:\\init\\notify.ps1"

# Show start notification
Invoke-Notification -Message "Starting initialization..." -Title "Windows Sandbox"

# Source WinGet installation script
Invoke-Notification -Message "Installing WinGet..." -Title "Windows Sandbox"
. "C:\\init\\install-winget.ps1"

# Source Scoop installation script
Invoke-Notification -Message "Installing Scoop..." -Title "Windows Sandbox"
. "C:\\init\\install-scoop.ps1"

# Install packages using WinGet
Invoke-Notification -Message "Winget package installation in progress..." -Title "Windows Sandbox"
. "C:\\init\\install-winget-package.ps1"

# Install scoop packages
Invoke-Notification -Message "Scoop package installation in progress..." -Title "Windows Sandbox"
. "C:\\init\\install-scoop-package.ps1"

# Setup mise
Invoke-Notification -Message "Setting up mise..." -Title "Windows Sandbox"
. "C:\\init\\setup-mise.ps1"

# Install Claude Code CLI
Invoke-Notification -Message "Installing Claude Code CLI..." -Title "Windows Sandbox"
. "C:\\init\\install-claude-code.ps1"

# Show completion notification
Invoke-Notification -Message "Initialization completed successfully!" -Title "Windows Sandbox"

# Stop transcript
Stop-Transcript`;
}