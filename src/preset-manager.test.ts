import { assertEquals, assertRejects } from "@std/assert";
import { PresetManager } from "./preset-manager.ts";

const presetManager = new PresetManager();

Deno.test("PresetManager - load minimal preset", async () => {
  const config = await presetManager.loadPreset("minimal");
  
  // Should have PowerShell and Git packages
  assertEquals(config.packages.wingetDefaults.length, 2);
  assertEquals(config.packages.wingetDefaults[0].id, "Microsoft.PowerShell");
  assertEquals(config.packages.wingetDefaults[1].id, "Git.Git");
  
  // Should have GitHub domains enabled
  assertEquals(config.firewall.enableGitHubApi, true);
  assertEquals(config.firewall.allowedDomains.github.includes("github.com"), true);
  
  // Should have minimal notifications
  assertEquals(config.notifications.messages.starting, "Starting setup...");
});

Deno.test("PresetManager - load claude-code preset", async () => {
  const config = await presetManager.loadPreset("claude-code");
  
  // Should have more packages than minimal
  assertEquals(config.packages.wingetDefaults.length, 6);
  assertEquals(config.packages.scoopDefaults.length, 3);
  
  // Should have all domain categories
  assertEquals(config.firewall.allowedDomains.github.length > 0, true);
  assertEquals(config.firewall.allowedDomains.vscode.length > 0, true);
  assertEquals(config.firewall.allowedDomains.packageManagers.length > 0, true);
  assertEquals(config.firewall.allowedDomains.claude.length > 0, true);
  
  // Should have mise path configured
  assertEquals(config.toolPaths.mise.binPath, "$env:USERPROFILE\\.local\\share\\mise\\shims");
});

Deno.test("PresetManager - list presets", async () => {
  const presets = await presetManager.listPresets();
  
  assertEquals(presets.builtin.includes("minimal"), true);
  assertEquals(presets.builtin.includes("claude-code"), true);
  assertEquals(Array.isArray(presets.user), true);
});

Deno.test("PresetManager - list components", async () => {
  const components = await presetManager.listComponents();
  
  assertEquals(components.includes("winget.setup"), true);
  assertEquals(components.includes("winget.install"), true);
  assertEquals(components.includes("scoop.setup"), true);
  assertEquals(components.includes("firewall.setup"), true);
  assertEquals(components.includes("firewall.domains.github"), true);
  assertEquals(components.includes("system.notifications"), true);
});

Deno.test("PresetManager - compose custom configuration", async () => {
  const config = await presetManager.composeCustom([
    "winget.setup",
    {
      component: "winget.install",
      params: {
        packages: [
          { "id": "Microsoft.PowerShell", "name": "PowerShell" }
        ]
      }
    },
    "firewall.setup",
    {
      component: "firewall.allow",
      params: {
        domains: ["custom.company.com"]
      }
    }
  ]);
  
  // Should have the specified package
  assertEquals(config.packages.wingetDefaults.length, 1);
  assertEquals(config.packages.wingetDefaults[0].id, "Microsoft.PowerShell");
  
  // Should have custom domain
  assertEquals(config.firewall.allowedDomains.additional?.includes("custom.company.com"), true);
});

Deno.test("PresetManager - invalid preset name", async () => {
  await assertRejects(
    () => presetManager.loadPreset("nonexistent"),
    Error,
    "Preset not found: nonexistent"
  );
});

Deno.test("PresetManager - cumulative merge behavior", async () => {
  const config = await presetManager.composeCustom([
    {
      component: "winget.install",
      params: {
        packages: [
          { "id": "Microsoft.PowerShell", "name": "PowerShell" }
        ]
      }
    },
    {
      component: "winget.install", 
      params: {
        packages: [
          { "id": "Git.Git", "name": "Git" }
        ]
      }
    }
  ]);
  
  // Should have both packages (cumulative)
  assertEquals(config.packages.wingetDefaults.length, 2);
  assertEquals(config.packages.wingetDefaults[0].id, "Microsoft.PowerShell");
  assertEquals(config.packages.wingetDefaults[1].id, "Git.Git");
});