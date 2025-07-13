import { PresetConfig } from "./presets.ts";

interface ScriptSection {
  comment: string;
  notification: string;
  scriptPath: string;
}

export function generateInitScript(presetConfig: PresetConfig, workspaceName?: string): string {
  const sections: string[] = [];
  
  // Always start with base setup and progress system
  sections.push(generateBaseSetup());
  sections.push(generateProgressSetup(presetConfig, workspaceName));
  
  if (presetConfig.includeDevTools) {
    // Full development environment setup
    sections.push(generateDevToolsSetup());
    sections.push(generateFirewallSetup());
  } else {
    // Firewall-only setup
    sections.push(generateFirewallSetup());
  }
  
  // Optional workspace opening
  if (workspaceName) {
    sections.push(generateWorkspaceOpening(workspaceName));
  }
  
  // Always end with completion
  sections.push(generateCompletion());
  
  return sections.join('\n');
}

function generateBaseSetup(): string {
  return `# Start transcript for logging
Start-Transcript -Path "C:\\init.log" -Append

# Source notification script
. "C:\\init\\notify.ps1"

# Source progress management script
. "C:\\init\\progress-manager.ps1"

# Show start notification
Invoke-Notification -Message "Starting initialization..." -Title "Windows Sandbox"`;
}

function generateDevToolsSetup(): string {
  const devToolSteps: ScriptSection[] = [
    {
      comment: "Source WinGet installation script",
      notification: "Installing WinGet...",
      scriptPath: "install-winget.ps1"
    },
    {
      comment: "Source Scoop installation script", 
      notification: "Installing Scoop...",
      scriptPath: "install-scoop.ps1"
    },
    {
      comment: "Install packages using WinGet",
      notification: "Winget package installation in progress...",
      scriptPath: "install-winget-package.ps1"
    },
    {
      comment: "Install scoop packages",
      notification: "Scoop package installation in progress...",
      scriptPath: "install-scoop-package.ps1"
    },
    {
      comment: "Setup mise",
      notification: "Setting up mise...",
      scriptPath: "setup-mise.ps1"
    },
    {
      comment: "Install Claude Code CLI",
      notification: "Installing Claude Code CLI...",
      scriptPath: "install-claude-code.ps1"
    }
  ];

  return devToolSteps.map(step => generateScriptStep(step)).join('\n');
}

function generateFirewallSetup(): string {
  return generateScriptStep({
    comment: "Setup firewall security",
    notification: "Setting up firewall security...",
    scriptPath: "setup-firewall.ps1"
  });
}

function generateWorkspaceOpening(workspaceName: string): string {
  return `
# Open project directory in Explorer
if (Test-Path "C:\\workspace\\${workspaceName}") {
    explorer.exe "C:\\workspace\\${workspaceName}"
}`;
}

function generateCompletion(): string {
  return `
# Complete progress and close GUI
Stop-ProgressGUI

# Show completion notification
Invoke-Notification -Message "Initialization completed successfully!" -Title "Windows Sandbox"

# Stop transcript
Stop-Transcript`;
}

function generateScriptStep(step: ScriptSection): string {
  return `
# ${step.comment}
Invoke-ProgressStep -StepName "${step.notification}" -ScriptBlock {
    . "C:\\init\\${step.scriptPath}"
} -LogMessage "Executing ${step.scriptPath}"`;
}

function generateProgressSetup(presetConfig: PresetConfig, workspaceName?: string): string {
  // Calculate total steps
  let totalSteps = 1; // Base firewall setup
  
  if (presetConfig.includeDevTools) {
    totalSteps += 6; // Dev tools steps
  }
  
  if (workspaceName) {
    totalSteps += 1; // Workspace opening
  }
  
  return `
# Initialize progress tracking system
Initialize-Progress -TotalSteps ${totalSteps}

# Start progress GUI
Start-ProgressGUI

# Wait a moment for GUI to initialize
Start-Sleep -Seconds 2`;
}