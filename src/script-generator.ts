import { PresetConfig } from "./presets.ts";

interface ScriptSection {
  comment: string;
  notification: string;
  scriptPath: string;
}

interface PackageOptions {
  mise?: string;
  scoop?: string;
  wingetId?: string;
}

export function generateInitScript(presetConfig: PresetConfig, workspaceName?: string, packageOptions?: PackageOptions): string {
  const sections: string[] = [];
  
  // Always start with base setup and progress system
  sections.push(generateBaseSetup());
  
  // Set up package variables if any packages are specified
  if (packageOptions && (packageOptions.mise || packageOptions.scoop || packageOptions.wingetId)) {
    sections.push(generatePackageVariables(packageOptions));
  }
  
  if (presetConfig.includeDevTools) {
    // Full development environment setup
    sections.push(generateDevToolsSetup(packageOptions));
    sections.push(generateFirewallSetup());
  } else {
    // Package installations before firewall (if any)
    if (packageOptions) {
      sections.push(generatePackageInstallations(packageOptions));
    }
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


# Show start notification
Invoke-Notification -Message "Starting initialization..." -Title "Windows Sandbox"`;
}

function generatePackageVariables(packageOptions: PackageOptions): string {
  const lines: string[] = [];
  lines.push("# Set package variables");
  
  if (packageOptions.mise) {
    lines.push(`$env:MISE_PACKAGES = "${packageOptions.mise}"`);
  }
  
  if (packageOptions.scoop) {
    lines.push(`$env:SCOOP_PACKAGES = "${packageOptions.scoop}"`);
  }
  
  if (packageOptions.wingetId) {
    lines.push(`$env:WINGET_PACKAGE_IDS = "${packageOptions.wingetId}"`);
  }
  
  return lines.join('\n');
}

function generateDevToolsSetup(packageOptions?: PackageOptions): string {
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
      comment: "Install additional WinGet packages",
      notification: "Installing additional WinGet packages...",
      scriptPath: "install-winget-packages.ps1"
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
      comment: "Install mise packages",
      notification: "Installing mise packages...",
      scriptPath: "install-mise-packages.ps1"
    },
    {
      comment: "Install Claude Code CLI",
      notification: "Installing Claude Code CLI...",
      scriptPath: "install-claude-code.ps1"
    }
  ];

  return devToolSteps.map(step => generateScriptStep(step)).join('\n');
}

function generatePackageInstallations(packageOptions: PackageOptions): string {
  const steps: string[] = [];
  
  if (packageOptions.mise) {
    steps.push(generateScriptStep({
      comment: "Install mise packages",
      notification: "Installing mise packages...",
      scriptPath: "install-mise-packages.ps1"
    }));
  }
  
  if (packageOptions.scoop) {
    steps.push(generateScriptStep({
      comment: "Install scoop packages",
      notification: "Installing scoop packages...",
      scriptPath: "install-scoop-package.ps1"
    }));
  }
  
  if (packageOptions.wingetId) {
    steps.push(generateScriptStep({
      comment: "Install WinGet packages",
      notification: "Installing WinGet packages...",
      scriptPath: "install-winget-packages.ps1"
    }));
  }
  
  return steps.join('\n');
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

# Show completion notification
Invoke-Notification -Message "Initialization completed successfully!" -Title "Windows Sandbox"

# Stop transcript
Stop-Transcript`;
}

function generateScriptStep(step: ScriptSection): string {
  return `
# ${step.comment}
Invoke-Notification -Message "${step.notification}" -Title "Windows Sandbox"
. "C:\\init\\${step.scriptPath}"`;
}