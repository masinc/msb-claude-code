import { assertEquals, assertStringIncludes } from "@std/assert";
import { generateInitScript } from "./script-generator.ts";
import type { PresetConfig } from "./presets.ts";

Deno.test("generateInitScript should generate dev-full preset script", () => {
  const presetConfig: PresetConfig = {
    includeDevTools: true,
    name: "Test",
    description: "Test preset",
  };

  const result = generateInitScript(presetConfig);

  // Check basic structure
  assertStringIncludes(result, "Start-Transcript");
  assertStringIncludes(result, "# Source notification script");
  assertStringIncludes(result, '. "C:\\init\\notify.ps1"');
  assertStringIncludes(result, "Starting initialization...");
  assertStringIncludes(result, "Stop-Transcript");

  // Check dev tools installation steps
  assertStringIncludes(result, "Installing WinGet...");
  assertStringIncludes(result, '. "C:\\init\\install-winget.ps1"');
  assertStringIncludes(result, "Installing Scoop...");
  assertStringIncludes(result, '. "C:\\init\\install-scoop.ps1"');
  assertStringIncludes(result, "install-winget-defaults.ps1");
  assertStringIncludes(result, "install-winget-custom.ps1");
  assertStringIncludes(result, "install-scoop-package.ps1");
  assertStringIncludes(result, "setup-mise.ps1");
  assertStringIncludes(result, "install-mise-packages.ps1");
  assertStringIncludes(result, "install-claude-code.ps1");

  // Check firewall setup
  assertStringIncludes(result, "Setting up firewall security...");
  assertStringIncludes(result, '. "C:\\init\\setup-firewall.ps1"');

  // Check completion
  assertStringIncludes(result, "Initialization completed successfully!");
});

Deno.test("generateInitScript should generate firewall-only preset script", () => {
  const presetConfig: PresetConfig = {
    includeDevTools: false,
    name: "Test Firewall",
    description: "Test firewall preset",
  };

  const result = generateInitScript(presetConfig);

  // Check basic structure
  assertStringIncludes(result, "Start-Transcript");
  assertStringIncludes(result, "Starting initialization...");
  assertStringIncludes(result, "Stop-Transcript");

  // Should NOT include dev tools installation
  assertEquals(result.includes("Installing WinGet..."), false);
  assertEquals(result.includes("Installing Scoop..."), false);
  assertEquals(result.includes("install-winget-defaults.ps1"), false);
  assertEquals(result.includes("install-claude-code.ps1"), false);

  // Should still include firewall setup
  assertStringIncludes(result, "Setting up firewall security...");
  assertStringIncludes(result, '. "C:\\init\\setup-firewall.ps1"');
});

Deno.test("generateInitScript should include workspace opening when provided", () => {
  const presetConfig: PresetConfig = {
    includeDevTools: true,
    name: "Test",
    description: "Test preset",
  };

  const result = generateInitScript(presetConfig, "my-project");

  assertStringIncludes(result, "C:\\workspace\\my-project");
  assertStringIncludes(result, "explorer.exe");
});

Deno.test("generateInitScript should not include workspace opening when not provided", () => {
  const presetConfig: PresetConfig = {
    includeDevTools: true,
    name: "Test",
    description: "Test preset",
  };

  const result = generateInitScript(presetConfig);

  assertEquals(result.includes("explorer.exe"), false);
  assertEquals(result.includes("C:\\workspace\\"), false);
});

Deno.test("generateInitScript should include package variables for dev-full preset", () => {
  const presetConfig: PresetConfig = {
    includeDevTools: true,
    name: "Test",
    description: "Test preset",
  };

  const packageOptions = {
    mise: "node@20,python@3.12",
    scoop: "git,curl",
    wingetId: "Microsoft.PowerShell,Microsoft.VisualStudioCode",
  };

  const result = generateInitScript(presetConfig, undefined, packageOptions);

  assertStringIncludes(result, '$env:MISE_PACKAGES = "node@20,python@3.12"');
  assertStringIncludes(result, '$env:SCOOP_PACKAGES = "git,curl"');
  assertStringIncludes(
    result,
    '$env:WINGET_PACKAGE_IDS = "Microsoft.PowerShell,Microsoft.VisualStudioCode"',
  );
});

Deno.test("generateInitScript should include package variables for firewall-only preset", () => {
  const presetConfig: PresetConfig = {
    includeDevTools: false,
    name: "Test Firewall",
    description: "Test firewall preset",
  };

  const packageOptions = {
    mise: "node@20",
    scoop: "git",
    wingetId: "Microsoft.PowerShell",
  };

  const result = generateInitScript(presetConfig, undefined, packageOptions);

  // Should include package variables
  assertStringIncludes(result, '$env:MISE_PACKAGES = "node@20"');
  assertStringIncludes(result, '$env:SCOOP_PACKAGES = "git"');
  assertStringIncludes(
    result,
    '$env:WINGET_PACKAGE_IDS = "Microsoft.PowerShell"',
  );

  // Should include package installation steps
  assertStringIncludes(result, "Installing mise packages...");
  assertStringIncludes(result, '. "C:\\init\\install-mise-packages.ps1"');
  assertStringIncludes(result, "Installing scoop packages...");
  assertStringIncludes(result, '. "C:\\init\\install-scoop-package.ps1"');
  assertStringIncludes(result, "Installing WinGet packages...");
  assertStringIncludes(result, '. "C:\\init\\install-winget-custom.ps1"');
});

Deno.test("generateInitScript should handle partial package options", () => {
  const presetConfig: PresetConfig = {
    includeDevTools: false,
    name: "Test Firewall",
    description: "Test firewall preset",
  };

  // Only mise packages
  const miseOnlyOptions = { mise: "node@20" };
  const miseResult = generateInitScript(
    presetConfig,
    undefined,
    miseOnlyOptions,
  );

  assertStringIncludes(miseResult, '$env:MISE_PACKAGES = "node@20"');
  assertStringIncludes(miseResult, "install-mise-packages.ps1");
  assertEquals(miseResult.includes("$env:SCOOP_PACKAGES"), false);
  assertEquals(miseResult.includes("install-scoop-package.ps1"), false);

  // Only scoop packages
  const scoopOnlyOptions = { scoop: "git" };
  const scoopResult = generateInitScript(
    presetConfig,
    undefined,
    scoopOnlyOptions,
  );

  assertStringIncludes(scoopResult, '$env:SCOOP_PACKAGES = "git"');
  assertStringIncludes(scoopResult, "install-scoop-package.ps1");
  assertEquals(scoopResult.includes("$env:MISE_PACKAGES"), false);
  assertEquals(scoopResult.includes("install-mise-packages.ps1"), false);
});

Deno.test("generateInitScript should handle empty package options", () => {
  const presetConfig: PresetConfig = {
    includeDevTools: false,
    name: "Test Firewall",
    description: "Test firewall preset",
  };

  const result = generateInitScript(presetConfig, undefined, {});

  // Should not include any package variables or installation steps
  assertEquals(result.includes("$env:MISE_PACKAGES"), false);
  assertEquals(result.includes("$env:SCOOP_PACKAGES"), false);
  assertEquals(result.includes("$env:WINGET_PACKAGE_IDS"), false);
  assertEquals(result.includes("install-mise-packages.ps1"), false);
  assertEquals(result.includes("install-scoop-package.ps1"), false);
  assertEquals(result.includes("install-winget-custom.ps1"), false);

  // Should still include firewall
  assertStringIncludes(result, "setup-firewall.ps1");
});

Deno.test("generateInitScript should escape special characters in workspace name", () => {
  const presetConfig: PresetConfig = {
    includeDevTools: true,
    name: "Test",
    description: "Test preset",
  };

  const result = generateInitScript(presetConfig, "project with spaces");

  assertStringIncludes(result, "C:\\workspace\\project with spaces");
});

Deno.test("generateInitScript should have correct PowerShell structure", () => {
  const presetConfig: PresetConfig = {
    includeDevTools: true,
    name: "Test",
    description: "Test preset",
  };

  const result = generateInitScript(presetConfig);

  // Should start with transcript
  const lines = result.split("\n");
  assertEquals(lines[0].trim(), "# Start transcript for logging");
  assertEquals(
    lines[1].trim(),
    'Start-Transcript -Path "C:\\init.log" -Append',
  );

  // Should end with transcript stop
  const lastLines = lines.slice(-3);
  assertEquals(
    lastLines.some((line) => line.includes("Stop-Transcript")),
    true,
  );

  // Should have proper comment structure
  const commentLines = lines.filter((line) => line.trim().startsWith("#"));
  assertEquals(commentLines.length > 5, true); // Should have multiple comment sections
});
