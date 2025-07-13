import { PresetConfig } from "./presets.ts";

export function generateInitScript(presetConfig: PresetConfig, workspaceName?: string): string {
  const baseScript = `# Start transcript for logging
Start-Transcript -Path "C:\\init.log" -Append

# Source notification script
. "C:\\init\\notify.ps1"

# Show start notification
Invoke-Notification -Message "Starting initialization..." -Title "Windows Sandbox"`;

  const firewallOnlyScript = `
# Setup firewall security
Invoke-Notification -Message "Setting up firewall security..." -Title "Windows Sandbox"
. "C:\\init\\setup-firewall.ps1"`;

  const devToolsScript = `
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

# Setup firewall security (after development tools installation)
Invoke-Notification -Message "Setting up firewall security..." -Title "Windows Sandbox"
. "C:\\init\\setup-firewall.ps1"`;

  const openWorkspaceScript = workspaceName ? `
# Open project directory in Explorer
if (Test-Path "C:\\workspace\\${workspaceName}") {
    explorer.exe "C:\\workspace\\${workspaceName}"
}` : "";

  const endScript = `
# Show completion notification
Invoke-Notification -Message "Initialization completed successfully!" -Title "Windows Sandbox"

# Stop transcript
Stop-Transcript`;

  if (presetConfig.includeDevTools) {
    return baseScript + devToolsScript + openWorkspaceScript + endScript;
  } else {
    return baseScript + firewallOnlyScript + openWorkspaceScript + endScript;
  }
}