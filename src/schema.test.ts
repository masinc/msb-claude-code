import { assertEquals, assertThrows } from "@std/assert";
import {
  FirewallConfigSchema,
  PackageConfigSchema,
  UserConfigSchema,
  ToolPathConfigSchema,
  NotificationConfigSchema,
  ScriptConfigSchema,
} from "./schema.ts";

Deno.test("FirewallConfigSchema - valid config", () => {
  const validConfig = {
    allowedDomains: {
      github: ["github.com"],
      packageManagers: ["registry.npmjs.org"],
      developmentTools: ["mise.jdx.dev"],
      vscode: ["marketplace.visualstudio.com"],
      claude: ["api.anthropic.com"],
    },
    timeoutSec: 10,
    enableGitHubApi: true,
  };

  const result = FirewallConfigSchema.parse(validConfig);
  assertEquals(result, validConfig);
});

Deno.test("FirewallConfigSchema - invalid timeout", () => {
  const invalidConfig = {
    allowedDomains: {
      github: ["github.com"],
      packageManagers: ["registry.npmjs.org"],
      developmentTools: ["mise.jdx.dev"],
      vscode: ["marketplace.visualstudio.com"],
      claude: ["api.anthropic.com"],
    },
    timeoutSec: -5, // Invalid: negative number
    enableGitHubApi: true,
  };

  assertThrows(() => FirewallConfigSchema.parse(invalidConfig));
});

Deno.test("PackageConfigSchema - valid config", () => {
  const validConfig = {
    wingetDefaults: [
      { id: "Microsoft.PowerShell", name: "PowerShell" },
      { id: "Git.Git", name: "Git", description: "Version control" },
    ],
    scoopDefaults: [
      { name: "ripgrep", description: "Fast search tool" },
      { name: "fd", bucket: "main" },
    ],
  };

  const result = PackageConfigSchema.parse(validConfig);
  assertEquals(result, validConfig);
});

Deno.test("PackageConfigSchema - missing required fields", () => {
  const invalidConfig = {
    wingetDefaults: [
      { id: "Microsoft.PowerShell" }, // Missing required 'name' field
    ],
    scoopDefaults: [],
  };

  assertThrows(() => PackageConfigSchema.parse(invalidConfig));
});

Deno.test("UserConfigSchema - valid config", () => {
  const validConfig = {
    username: "WDAGUtilityAccount",
    profilePath: "C:\\Users\\WDAGUtilityAccount\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1",
    documentsPath: "C:\\Users\\WDAGUtilityAccount\\Documents",
  };

  const result = UserConfigSchema.parse(validConfig);
  assertEquals(result, validConfig);
});

Deno.test("ToolPathConfigSchema - valid config", () => {
  const validConfig = {
    scoop: {
      shimsPath: "$env:USERPROFILE\\scoop\\shims",
      rootPath: "$env:USERPROFILE\\scoop",
    },
    mise: {
      binPath: "$env:USERPROFILE\\.local\\share\\mise\\shims",
    },
  };

  const result = ToolPathConfigSchema.parse(validConfig);
  assertEquals(result, validConfig);
});

Deno.test("ToolPathConfigSchema - optional fields", () => {
  const configWithOptionals = {
    scoop: {
      shimsPath: "$env:USERPROFILE\\scoop\\shims",
      rootPath: "$env:USERPROFILE\\scoop",
    },
    mise: {
      configPath: "$env:USERPROFILE\\.config\\mise\\config.toml",
    },
    additionalPaths: ["C:\\Tools\\bin"],
  };

  const result = ToolPathConfigSchema.parse(configWithOptionals);
  assertEquals(result, configWithOptionals);
});

Deno.test("NotificationConfigSchema - valid config", () => {
  const validConfig = {
    defaultTitle: "Windows Sandbox",
    messages: {
      starting: "Starting...",
      installing: "Installing...",
      completed: "Completed!",
      ready: "Ready!",
    },
    showDuration: 5000,
  };

  const result = NotificationConfigSchema.parse(validConfig);
  assertEquals(result, validConfig);
});

Deno.test("NotificationConfigSchema - invalid duration", () => {
  const invalidConfig = {
    defaultTitle: "Windows Sandbox",
    messages: {
      starting: "Starting...",
      installing: "Installing...",
      completed: "Completed!",
      ready: "Ready!",
    },
    showDuration: 0, // Invalid: must be positive
  };

  assertThrows(() => NotificationConfigSchema.parse(invalidConfig));
});

Deno.test("ScriptConfigSchema - complete valid config", () => {
  const validConfig = {
    firewall: {
      allowedDomains: {
        github: ["github.com"],
        packageManagers: ["registry.npmjs.org"],
        developmentTools: ["mise.jdx.dev"],
        vscode: ["marketplace.visualstudio.com"],
        claude: ["api.anthropic.com"],
        additional: ["custom.domain.com"],
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

  const result = ScriptConfigSchema.parse(validConfig);
  assertEquals(result, validConfig);
});

Deno.test("ScriptConfigSchema - missing required section", () => {
  const invalidConfig = {
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
    // Missing packages, user, toolPaths, notifications sections
  };

  assertThrows(() => ScriptConfigSchema.parse(invalidConfig));
});

Deno.test("ScriptConfigSchema - partial schema validation", () => {
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

  const result = ScriptConfigSchema.partial().parse(partialConfig);
  assertEquals(result, partialConfig);
});