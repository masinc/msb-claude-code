import { assertEquals, assertThrows } from "@std/assert";
import {
  validateScriptConfig,
  validatePartialConfig,
  safeValidateConfig,
  safeValidatePartialConfig,
  ConfigValidationError,
} from "./validator.ts";

Deno.test("validateScriptConfig - valid config", () => {
  const validConfig = {
    firewall: {
      allowedDomains: {
        github: ["github.com"],
        packageManagers: ["registry.npmjs.org"],
        developmentTools: ["mise.jdx.dev"],
        vscode: ["marketplace.visualstudio.com"],
        claude: ["api.anthropic.com"],
      },
      timeoutSec: 10,
      enableGitHubApi: true,
    },
    packages: {
      wingetDefaults: [
        { id: "Microsoft.PowerShell", name: "PowerShell" },
      ],
      scoopDefaults: [
        { name: "ripgrep", description: "Fast search tool" },
      ],
    },
    user: {
      username: "WDAGUtilityAccount",
      profilePath: "C:\\Users\\WDAGUtilityAccount\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1",
      documentsPath: "C:\\Users\\WDAGUtilityAccount\\Documents",
    },
    toolPaths: {
      scoop: {
        shimsPath: "$env:USERPROFILE\\scoop\\shims",
        rootPath: "$env:USERPROFILE\\scoop",
      },
      mise: {
        binPath: "$env:USERPROFILE\\.local\\share\\mise\\shims",
      },
    },
    notifications: {
      defaultTitle: "Windows Sandbox",
      messages: {
        starting: "Starting...",
        installing: "Installing...",
        completed: "Completed!",
        ready: "Ready!",
      },
      showDuration: 5000,
    },
  };

  const result = validateScriptConfig(validConfig);
  assertEquals(result, validConfig);
});

Deno.test("validateScriptConfig - invalid config throws ConfigValidationError", () => {
  const invalidConfig = {
    firewall: {
      allowedDomains: {
        github: ["github.com"],
        packageManagers: ["registry.npmjs.org"],
        developmentTools: ["mise.jdx.dev"],
        vscode: ["marketplace.visualstudio.com"],
        claude: ["api.anthropic.com"],
      },
      timeoutSec: -5, // Invalid: negative number
      enableGitHubApi: true,
    },
    // Missing other required sections
  };

  assertThrows(
    () => validateScriptConfig(invalidConfig),
    ConfigValidationError,
    "Configuration validation failed",
  );
});

Deno.test("validatePartialConfig - valid partial config", () => {
  const partialConfig = {
    firewall: {
      allowedDomains: {
        github: ["github.com"],
        packageManagers: ["registry.npmjs.org"],
        developmentTools: ["mise.jdx.dev"],
        vscode: ["marketplace.visualstudio.com"],
        claude: ["api.anthropic.com"],
      },
      timeoutSec: 15,
      enableGitHubApi: true,
    },
    packages: {
      wingetDefaults: [
        { id: "Test.App", name: "Test App" },
      ],
      scoopDefaults: [],
    },
  };

  const result = validatePartialConfig(partialConfig);
  assertEquals(result, partialConfig);
});

Deno.test("validatePartialConfig - invalid partial config", () => {
  const invalidPartialConfig = {
    firewall: {
      allowedDomains: {
        github: ["github.com"],
        packageManagers: ["registry.npmjs.org"],
        developmentTools: ["mise.jdx.dev"],
        vscode: ["marketplace.visualstudio.com"],
        claude: ["api.anthropic.com"],
      },
      timeoutSec: -1, // Invalid: negative number
      enableGitHubApi: true,
    },
  };

  assertThrows(
    () => validatePartialConfig(invalidPartialConfig),
    ConfigValidationError,
    "Partial configuration validation failed",
  );
});

Deno.test("safeValidateConfig - valid config returns success", () => {
  const validConfig = {
    firewall: {
      allowedDomains: {
        github: ["github.com"],
        packageManagers: ["registry.npmjs.org"],
        developmentTools: ["mise.jdx.dev"],
        vscode: ["marketplace.visualstudio.com"],
        claude: ["api.anthropic.com"],
      },
      timeoutSec: 10,
      enableGitHubApi: true,
    },
    packages: {
      wingetDefaults: [
        { id: "Microsoft.PowerShell", name: "PowerShell" },
      ],
      scoopDefaults: [
        { name: "ripgrep", description: "Fast search tool" },
      ],
    },
    user: {
      username: "WDAGUtilityAccount",
      profilePath: "C:\\Users\\WDAGUtilityAccount\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1",
      documentsPath: "C:\\Users\\WDAGUtilityAccount\\Documents",
    },
    toolPaths: {
      scoop: {
        shimsPath: "$env:USERPROFILE\\scoop\\shims",
        rootPath: "$env:USERPROFILE\\scoop",
      },
      mise: {
        binPath: "$env:USERPROFILE\\.local\\share\\mise\\shims",
      },
    },
    notifications: {
      defaultTitle: "Windows Sandbox",
      messages: {
        starting: "Starting...",
        installing: "Installing...",
        completed: "Completed!",
        ready: "Ready!",
      },
      showDuration: 5000,
    },
  };

  const result = safeValidateConfig(validConfig);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validConfig);
  }
});

Deno.test("safeValidateConfig - invalid config returns error", () => {
  const invalidConfig = {
    firewall: {
      timeoutSec: "invalid", // Should be number
    },
  };

  const result = safeValidateConfig(invalidConfig);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(typeof result.error, "string");
  }
});

Deno.test("safeValidatePartialConfig - valid partial config returns success", () => {
  const partialConfig = {
    firewall: {
      allowedDomains: {
        github: ["github.com"],
        packageManagers: ["registry.npmjs.org"],
        developmentTools: ["mise.jdx.dev"],
        vscode: ["marketplace.visualstudio.com"],
        claude: ["api.anthropic.com"],
      },
      timeoutSec: 15,
      enableGitHubApi: true,
    },
  };

  const result = safeValidatePartialConfig(partialConfig);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, partialConfig);
  }
});

Deno.test("safeValidatePartialConfig - invalid partial config returns error", () => {
  const invalidPartialConfig = {
    firewall: {
      timeoutSec: -1,
    },
  };

  const result = safeValidatePartialConfig(invalidPartialConfig);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(typeof result.error, "string");
  }
});

Deno.test("ConfigValidationError - detailed errors", () => {
  try {
    validateScriptConfig({
      firewall: {
        timeoutSec: -1,
        enableGitHubApi: "invalid",
      },
    });
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      const detailedErrors = error.getDetailedErrors();
      assertEquals(Array.isArray(detailedErrors), true);
      assertEquals(detailedErrors.length > 0, true);
    }
  }
});