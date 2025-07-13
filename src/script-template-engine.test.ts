import { assertEquals, assertStringIncludes } from "@std/assert";
import {
  renderFirewallScript,
  renderMiseSetupScript,
  renderNotifyScript,
  renderRefreshEnvironmentScript,
  renderScoopPackageScript,
  renderScriptTemplate,
  renderWingetDefaultsScript,
} from "./script-template-engine.ts";
import { DEFAULT_SCRIPT_CONFIG } from "./script-config.ts";

Deno.test("renderFirewallScript should generate firewall script with default config", () => {
  const result = renderFirewallScript();

  assertStringIncludes(
    result,
    "🔥 Initializing advanced firewall configuration...",
  );
  assertStringIncludes(result, "github.com");
  assertStringIncludes(result, "registry.npmjs.org");
  assertStringIncludes(result, "api.anthropic.com");
  assertStringIncludes(
    result,
    'Invoke-RestMethod -Uri "https://api.github.com/meta" -TimeoutSec 10',
  );
});

Deno.test("renderFirewallScript should handle custom domains", () => {
  const customConfig = {
    allowedDomains: {
      github: ["github.com"],
      packageManagers: ["custom-registry.com"],
      developmentTools: ["tool.example.com"],
      vscode: [],
      claude: [],
      additional: ["extra.domain.com"],
    },
    timeoutSec: 5,
    enableGitHubApi: false,
  };

  const result = renderFirewallScript(customConfig);

  assertStringIncludes(result, "github.com");
  assertStringIncludes(result, "custom-registry.com");
  assertStringIncludes(result, "tool.example.com");
  assertStringIncludes(result, "extra.domain.com");
  assertEquals(result.includes("Invoke-RestMethod"), false); // GitHub API disabled
});

Deno.test("renderWingetDefaultsScript should generate package installation script", () => {
  const result = renderWingetDefaultsScript();

  assertStringIncludes(result, "Installing Windows Terminal...");
  assertStringIncludes(
    result,
    "Install-WinGetPackage -Id Microsoft.WindowsTerminal",
  );
  assertStringIncludes(result, "Installing PowerShell...");
  assertStringIncludes(
    result,
    "Install-WinGetPackage -Id Microsoft.PowerShell",
  );
  assertStringIncludes(result, "Installing Git...");
  assertStringIncludes(result, "Install-WinGetPackage -Id Git.Git");
});

Deno.test("renderWingetDefaultsScript should handle custom packages", () => {
  const customConfig = {
    wingetDefaults: [
      { id: "Custom.Package1", name: "Custom Package 1" },
      { id: "Custom.Package2", name: "Custom Package 2" },
    ],
    scoopDefaults: [],
  };

  const result = renderWingetDefaultsScript(customConfig);

  assertStringIncludes(result, "Installing Custom Package 1...");
  assertStringIncludes(result, "Install-WinGetPackage -Id Custom.Package1");
  assertStringIncludes(result, "Installing Custom Package 2...");
  assertStringIncludes(result, "Install-WinGetPackage -Id Custom.Package2");
});

Deno.test("renderMiseSetupScript should generate mise setup with default user", () => {
  const result = renderMiseSetupScript();

  assertStringIncludes(result, "Setting up mise...");
  assertStringIncludes(
    result,
    '$profilePath = "C:\\Users\\WDAGUtilityAccount\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1"',
  );
  assertStringIncludes(result, "mise activate pwsh");
});

Deno.test("renderMiseSetupScript should handle custom user config", () => {
  const customConfig = {
    username: "CustomUser",
    profilePath:
      "C:\\Users\\CustomUser\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1",
    documentsPath: "C:\\Users\\CustomUser\\Documents",
  };

  const result = renderMiseSetupScript(customConfig);

  assertStringIncludes(
    result,
    '$profilePath = "C:\\Users\\CustomUser\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1"',
  );
});

Deno.test("renderScoopPackageScript should generate scoop installation script", () => {
  const result = renderScoopPackageScript();

  assertStringIncludes(result, "Installing packages with Scoop...");
  assertStringIncludes(result, "scoop install ripgrep");
  assertStringIncludes(result, "scoop install fd");
  assertStringIncludes(result, "scoop install mise");
  assertStringIncludes(result, "$env:SCOOP_PACKAGES");
});

Deno.test("renderScoopPackageScript should handle custom default packages", () => {
  const customConfig = {
    wingetDefaults: [],
    scoopDefaults: [
      { name: "git", description: "Version control" },
      { name: "curl", description: "HTTP client" },
    ],
  };

  const result = renderScoopPackageScript(customConfig);

  assertStringIncludes(result, "scoop install git");
  assertStringIncludes(result, "scoop install curl");
  assertEquals(result.includes("scoop install ripgrep"), false);
});

Deno.test("renderRefreshEnvironmentScript should generate environment refresh script", () => {
  const result = renderRefreshEnvironmentScript();

  assertStringIncludes(result, "Refreshing environment variables...");
  assertStringIncludes(
    result,
    '$scoopShims = "$env:USERPROFILE\\scoop\\shims"',
  );
  assertStringIncludes(
    result,
    '$miseBin = "$env:USERPROFILE\\.local\\share\\mise\\shims"',
  );
});

Deno.test("renderRefreshEnvironmentScript should handle custom tool paths", () => {
  const customConfig = {
    scoop: {
      shimsPath: "C:\\CustomScoop\\shims",
      rootPath: "C:\\CustomScoop",
    },
    mise: {
      binPath: "C:\\CustomMise\\bin",
    },
    additionalPaths: ["C:\\CustomTool\\bin", "C:\\AnotherTool\\bin"],
  };

  const result = renderRefreshEnvironmentScript(customConfig);

  assertStringIncludes(result, '$scoopShims = "C:\\CustomScoop\\shims"');
  assertStringIncludes(result, '$miseBin = "C:\\CustomMise\\bin"');
  assertStringIncludes(result, '$additionalPath = "C:\\CustomTool\\bin"');
  assertStringIncludes(result, '$additionalPath = "C:\\AnotherTool\\bin"');
});

Deno.test("renderNotifyScript should generate notification script", () => {
  const result = renderNotifyScript();

  assertStringIncludes(result, "function Invoke-Notification");
  assertStringIncludes(
    result,
    '[string]$Message = "Initialization completed successfully!"',
  );
  assertStringIncludes(result, '[string]$Title = "Windows Sandbox"');
  assertStringIncludes(result, "ShowBalloonTip(5000)");
  assertStringIncludes(result, "Ready to use the sandbox environment.");
});

Deno.test("renderNotifyScript should handle custom notification config", () => {
  const customConfig = {
    defaultTitle: "Custom Sandbox",
    messages: {
      starting: "Custom starting...",
      installing: "Custom installing...",
      completed: "Custom completed!",
      ready: "Custom ready!",
    },
    showDuration: 3000,
  };

  const result = renderNotifyScript(customConfig);

  assertStringIncludes(result, '[string]$Title = "Custom Sandbox"');
  assertStringIncludes(result, '[string]$Message = "Custom completed!"');
  assertStringIncludes(result, "ShowBalloonTip(3000)");
  assertStringIncludes(result, "Custom ready!");
});

Deno.test("renderScriptTemplate should merge partial config with defaults", () => {
  const partialConfig = {
    firewall: {
      timeoutSec: 15,
    } as Partial<typeof DEFAULT_SCRIPT_CONFIG.firewall>,
  };

  const result = renderScriptTemplate(
    "powershell/setup-firewall.ps1.eta",
    partialConfig,
  );

  // Should use custom timeout
  assertStringIncludes(result, "TimeoutSec 15");
  // Should still include default domains
  assertStringIncludes(result, "github.com");
});

Deno.test("renderScriptTemplate should handle empty config", () => {
  const result = renderScriptTemplate("powershell/notify.ps1.eta", {});

  // Should use all defaults
  assertStringIncludes(result, "Windows Sandbox");
  assertStringIncludes(result, "Initialization completed successfully!");
  assertStringIncludes(result, "Ready to use the sandbox environment.");
});
