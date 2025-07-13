// Configuration interfaces for PowerShell script templates

export interface FirewallConfig {
  allowedDomains: {
    github: string[];
    packageManagers: string[];
    developmentTools: string[];
    vscode: string[];
    claude: string[];
    additional?: string[];
  };
  timeoutSec: number;
  enableGitHubApi: boolean;
}

export interface PackageConfig {
  wingetDefaults: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  scoopDefaults: Array<{
    name: string;
    bucket?: string;
    description?: string;
  }>;
}

export interface UserConfig {
  username: string;
  profilePath: string;
  documentsPath: string;
}

export interface ToolPathConfig {
  scoop: {
    shimsPath: string;
    rootPath: string;
  };
  mise: {
    binPath?: string;
    configPath?: string;
  };
  additionalPaths?: string[];
}

export interface NotificationConfig {
  defaultTitle: string;
  messages: {
    starting: string;
    installing: string;
    completed: string;
    ready: string;
  };
  showDuration: number;
}

export interface ScriptConfig {
  firewall: FirewallConfig;
  packages: PackageConfig;
  user: UserConfig;
  toolPaths: ToolPathConfig;
  notifications: NotificationConfig;
}

// Default configurations
export const DEFAULT_FIREWALL_CONFIG: FirewallConfig = {
  allowedDomains: {
    github: [
      "github.com",
      "raw.githubusercontent.com",
      "codeload.github.com",
      "objects.githubusercontent.com",
    ],
    packageManagers: [
      "registry.npmjs.org",
      "deno.land",
      "jsr.io",
    ],
    developmentTools: [
      "mise.jdx.dev",
      "mise-releases.s3.amazonaws.com",
    ],
    vscode: [
      "marketplace.visualstudio.com",
      "vscode.download.prss.microsoft.com",
      "update.code.visualstudio.com",
      "vscode-sync.trafficmanager.net",
      "vscode-sync-insiders.trafficmanager.net",
      "az764295.vo.msecnd.net",
      "vscode.blob.core.windows.net",
      "vscode-extensions.s3.amazonaws.com",
      "login.microsoftonline.com",
    ],
    claude: [
      "api.anthropic.com",
      "sentry.io",
      "statsig.anthropic.com",
      "statsig.com",
    ],
  },
  timeoutSec: 10,
  enableGitHubApi: true,
};

export const DEFAULT_PACKAGE_CONFIG: PackageConfig = {
  wingetDefaults: [
    { id: "Microsoft.WindowsTerminal", name: "Windows Terminal" },
    { id: "Microsoft.PowerShell", name: "PowerShell" },
    { id: "Git.Git", name: "Git" },
    { id: "OpenJS.NodeJS.LTS", name: "Node.js LTS" },
    { id: "Microsoft.VisualStudioCode", name: "Visual Studio Code" },
    {
      id: "Microsoft.VCRedist.2015+.x64",
      name: "Microsoft Visual C++ Redistributable",
    },
  ],
  scoopDefaults: [
    { name: "ripgrep", description: "Fast text search tool" },
    { name: "fd", description: "Fast file finder" },
    { name: "mise", description: "Runtime version manager" },
  ],
};

export const DEFAULT_USER_CONFIG: UserConfig = {
  username: "WDAGUtilityAccount",
  profilePath:
    "C:\\Users\\WDAGUtilityAccount\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1",
  documentsPath: "C:\\Users\\WDAGUtilityAccount\\Documents",
};

export const DEFAULT_TOOL_PATH_CONFIG: ToolPathConfig = {
  scoop: {
    shimsPath: "$env:USERPROFILE\\scoop\\shims",
    rootPath: "$env:USERPROFILE\\scoop",
  },
  mise: {
    binPath: "$env:USERPROFILE\\.local\\share\\mise\\shims",
  },
};

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  defaultTitle: "Windows Sandbox",
  messages: {
    starting: "Starting initialization...",
    installing: "Installing packages...",
    completed: "Initialization completed successfully!",
    ready: "Ready to use the sandbox environment.",
  },
  showDuration: 5000,
};

export const DEFAULT_SCRIPT_CONFIG: ScriptConfig = {
  firewall: DEFAULT_FIREWALL_CONFIG,
  packages: DEFAULT_PACKAGE_CONFIG,
  user: DEFAULT_USER_CONFIG,
  toolPaths: DEFAULT_TOOL_PATH_CONFIG,
  notifications: DEFAULT_NOTIFICATION_CONFIG,
};
