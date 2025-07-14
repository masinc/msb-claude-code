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
import { ScriptConfig } from "./schema.ts";

Deno.test("renderFirewallScript should generate firewall script with default config", async () => {
  const result = await renderFirewallScript();

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

Deno.test("renderFirewallScript should handle custom domains", async () => {
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

  const result = await renderFirewallScript(customConfig);

  assertStringIncludes(result, "github.com");
  assertStringIncludes(result, "custom-registry.com");
  assertStringIncludes(result, "tool.example.com");
  assertStringIncludes(result, "extra.domain.com");
  assertEquals(result.includes("Invoke-RestMethod"), false); // GitHub API disabled
});

Deno.test("renderWingetDefaultsScript should generate package installation script", async () => {
  const result = await renderWingetDefaultsScript();

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

Deno.test("renderWingetDefaultsScript should handle custom packages", async () => {
  const customConfig = {
    wingetDefaults: [
      { id: "Custom.Package1", name: "Custom Package 1" },
      { id: "Custom.Package2", name: "Custom Package 2" },
    ],
    scoopDefaults: [],
  };

  const result = await renderWingetDefaultsScript(customConfig);

  assertStringIncludes(result, "Installing Custom Package 1...");
  assertStringIncludes(result, "Install-WinGetPackage -Id Custom.Package1");
  assertStringIncludes(result, "Installing Custom Package 2...");
  assertStringIncludes(result, "Install-WinGetPackage -Id Custom.Package2");
});

Deno.test("renderMiseSetupScript should generate mise setup with default user", async () => {
  const result = await renderMiseSetupScript();

  assertStringIncludes(result, "Setting up mise...");
  assertStringIncludes(
    result,
    '$profilePath = "C:\\Users\\WDAGUtilityAccount\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1"',
  );
  assertStringIncludes(result, "mise activate pwsh");
});

Deno.test("renderMiseSetupScript should handle custom user config", async () => {
  const customConfig = {
    username: "CustomUser",
    profilePath:
      "C:\\Users\\CustomUser\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1",
    documentsPath: "C:\\Users\\CustomUser\\Documents",
  };

  const result = await renderMiseSetupScript(customConfig);

  assertStringIncludes(
    result,
    '$profilePath = "C:\\Users\\CustomUser\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1"',
  );
});

Deno.test("renderScoopPackageScript should generate scoop installation script", async () => {
  const result = await renderScoopPackageScript();

  assertStringIncludes(result, "Installing packages with Scoop...");
  assertStringIncludes(result, "scoop install ripgrep");
  assertStringIncludes(result, "scoop install fd");
  assertStringIncludes(result, "scoop install mise");
  assertStringIncludes(result, "$env:SCOOP_PACKAGES");
});

Deno.test("renderScoopPackageScript should handle custom default packages", async () => {
  const customConfig = {
    wingetDefaults: [],
    scoopDefaults: [
      { name: "git", description: "Version control" },
      { name: "curl", description: "HTTP client" },
    ],
  };

  const result = await renderScoopPackageScript(customConfig);

  assertStringIncludes(result, "scoop install git");
  assertStringIncludes(result, "scoop install curl");
  assertEquals(result.includes("scoop install ripgrep"), false);
});

Deno.test("renderRefreshEnvironmentScript should generate environment refresh script", async () => {
  const result = await renderRefreshEnvironmentScript();

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

Deno.test("renderRefreshEnvironmentScript should handle custom tool paths", async () => {
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

  const result = await renderRefreshEnvironmentScript(customConfig);

  assertStringIncludes(result, '$scoopShims = "C:\\CustomScoop\\shims"');
  assertStringIncludes(result, '$miseBin = "C:\\CustomMise\\bin"');
  assertStringIncludes(result, '$additionalPath = "C:\\CustomTool\\bin"');
  assertStringIncludes(result, '$additionalPath = "C:\\AnotherTool\\bin"');
});

Deno.test("renderNotifyScript should generate notification script", async () => {
  const result = await renderNotifyScript();

  assertStringIncludes(result, "function Invoke-Notification");
  assertStringIncludes(
    result,
    '[string]$Message = "Initialization completed successfully!"',
  );
  assertStringIncludes(result, '[string]$Title = "Windows Sandbox"');
  assertStringIncludes(result, "ShowBalloonTip(5000)");
  assertStringIncludes(result, "Ready to use the sandbox environment.");
});

Deno.test("renderNotifyScript should handle custom notification config", async () => {
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

  const result = await renderNotifyScript(customConfig);

  assertStringIncludes(result, '[string]$Title = "Custom Sandbox"');
  assertStringIncludes(result, '[string]$Message = "Custom completed!"');
  assertStringIncludes(result, "ShowBalloonTip(3000)");
  assertStringIncludes(result, "Custom ready!");
});

Deno.test("renderScriptTemplate should merge partial config with defaults", async () => {
  const partialConfig = {
    firewall: {
      timeoutSec: 15,
      allowedDomains: {
        github: ["github.com"],
        packageManagers: [],
        developmentTools: [],
        vscode: [],
        claude: [],
      },
      enableGitHubApi: true,
    } as Partial<typeof DEFAULT_SCRIPT_CONFIG.firewall>,
  };

  const result = await renderScriptTemplate(
    "powershell/setup-firewall.ps1.eta",
    partialConfig as Partial<ScriptConfig>,
  );

  // Should use custom timeout
  assertStringIncludes(result, "TimeoutSec 15");
  // Should still include default domains
  assertStringIncludes(result, "github.com");
});

Deno.test("renderScriptTemplate should handle empty config", async () => {
  const result = await renderScriptTemplate("powershell/notify.ps1.eta", {});

  // Should use all defaults
  assertStringIncludes(result, "Windows Sandbox");
  assertStringIncludes(result, "Initialization completed successfully!");
  assertStringIncludes(result, "Ready to use the sandbox environment.");
});
