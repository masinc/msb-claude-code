import { assertEquals, assertStringIncludes } from "@std/assert";
import { generateInitScript } from "./script-generator.ts";
import { generateWSBContent } from "./wsb-generator.ts";
import { PRESETS } from "./presets.ts";
import type { WSBConfig } from "./types.ts";

Deno.test("Integration: dev-full preset generates complete sandbox", () => {
  const presetConfig = PRESETS.default;
  const packageOptions = {
    mise: "node@20,python@3.12",
    scoop: "git,curl",
    wingetId: "Microsoft.PowerShell,Microsoft.VisualStudioCode",
  };

  // Generate PowerShell script
  const initScript = generateInitScript(
    presetConfig,
    "my-project",
    packageOptions,
  );

  // Verify script contains all expected sections
  assertStringIncludes(initScript, "Start-Transcript");
  assertStringIncludes(initScript, "Starting initialization...");
  assertStringIncludes(
    initScript,
    '$env:MISE_PACKAGES = "node@20,python@3.12"',
  );
  assertStringIncludes(initScript, '$env:SCOOP_PACKAGES = "git,curl"');
  assertStringIncludes(
    initScript,
    '$env:WINGET_PACKAGE_IDS = "Microsoft.PowerShell,Microsoft.VisualStudioCode"',
  );
  assertStringIncludes(initScript, "Installing WinGet...");
  assertStringIncludes(initScript, "Installing Scoop...");
  assertStringIncludes(initScript, "C:\\workspace\\my-project");
  assertStringIncludes(initScript, "Stop-Transcript");

  // Generate WSB configuration
  const wsbConfig: WSBConfig = {
    vGPU: "Enable",
    networking: "Enable",
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Disable",
    printScreen: "Enable",
    clipboardRedirection: "Enable",
    memoryInMB: "8192",
    mappedFolders: [
      {
        hostFolder: "/tmp/init",
        sandboxFolder: "C:\\init",
        readOnly: true,
      },
    ],
    logonCommand: {
      command:
        'cmd.exe /c start "Initialization" powershell.exe -ExecutionPolicy Bypass -File "C:\\init\\init.ps1"',
    },
  };

  const wsbContent = generateWSBContent(wsbConfig);

  // Verify WSB contains all expected sections
  assertStringIncludes(wsbContent, "<Configuration>");
  assertStringIncludes(wsbContent, "<vGPU>Enable</vGPU>");
  assertStringIncludes(wsbContent, "<MemoryInMB>8192</MemoryInMB>");
  assertStringIncludes(wsbContent, "<MappedFolders>");
  assertStringIncludes(wsbContent, "<LogonCommand>");
  assertStringIncludes(wsbContent, "powershell.exe");
  assertStringIncludes(wsbContent, "</Configuration>");
});

Deno.test("Integration: firewall-only preset generates minimal sandbox", () => {
  const presetConfig = PRESETS["firewall-only"];
  const packageOptions = {
    mise: "node@20",
  };

  // Generate PowerShell script
  const initScript = generateInitScript(
    presetConfig,
    undefined,
    packageOptions,
  );

  // Verify script contains only essential sections
  assertStringIncludes(initScript, "Start-Transcript");
  assertStringIncludes(initScript, '$env:MISE_PACKAGES = "node@20"');
  assertStringIncludes(initScript, "Installing mise packages...");
  assertStringIncludes(initScript, "Setting up firewall security...");
  assertStringIncludes(initScript, "Stop-Transcript");

  // Should NOT contain dev tools installation
  assertEquals(initScript.includes("Installing WinGet..."), false);
  assertEquals(initScript.includes("Installing Scoop..."), false);
  assertEquals(initScript.includes("install-winget-defaults.ps1"), false);

  // Should NOT contain workspace opening
  assertEquals(initScript.includes("explorer.exe"), false);
});

Deno.test("Integration: XML escaping works in WSB templates", () => {
  const wsbConfig: WSBConfig = {
    vGPU: "Enable",
    networking: "Enable",
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Disable",
    printScreen: "Enable",
    clipboardRedirection: "Enable",
    memoryInMB: "4096",
    mappedFolders: [
      {
        hostFolder: "C:\\temp\\<special>&folder",
        sandboxFolder: "C:\\<test>&folder",
        readOnly: true,
      },
    ],
    logonCommand: {
      command: 'cmd.exe /c "echo <hello> & world"',
    },
  };

  const wsbContent = generateWSBContent(wsbConfig);

  // Verify XML special characters are properly escaped
  assertStringIncludes(wsbContent, "&lt;special&gt;&amp;folder");
  assertStringIncludes(wsbContent, "&lt;test&gt;&amp;folder");
  assertStringIncludes(wsbContent, "&lt;hello&gt; &amp; world");
  assertStringIncludes(wsbContent, "&quot;");
});

Deno.test("Integration: template system handles empty configurations", () => {
  const presetConfig = PRESETS["firewall-only"];

  // Generate script with no packages
  const initScript = generateInitScript(presetConfig);

  // Should still have basic structure
  assertStringIncludes(initScript, "Start-Transcript");
  assertStringIncludes(initScript, "Setting up firewall security...");
  assertStringIncludes(initScript, "Stop-Transcript");

  // Should not have any package variables or installation steps
  assertEquals(initScript.includes("$env:MISE_PACKAGES"), false);
  assertEquals(initScript.includes("$env:SCOOP_PACKAGES"), false);
  assertEquals(initScript.includes("install-mise-packages.ps1"), false);

  // Generate WSB with minimal config
  const wsbConfig: WSBConfig = {
    vGPU: "Disable",
    networking: "Disable",
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Enable",
    printScreen: "Disable",
    clipboardRedirection: "Disable",
    memoryInMB: "2048",
  };

  const wsbContent = generateWSBContent(wsbConfig);

  // Should have basic structure without optional sections
  assertStringIncludes(wsbContent, "<Configuration>");
  assertStringIncludes(wsbContent, "<MemoryInMB>2048</MemoryInMB>");
  assertEquals(wsbContent.includes("<MappedFolders>"), false);
  assertEquals(wsbContent.includes("<LogonCommand>"), false);
});

Deno.test("Integration: preset validation and script generation consistency", () => {
  // Test that both presets generate valid scripts
  for (const [presetName, presetConfig] of Object.entries(PRESETS)) {
    const initScript = generateInitScript(presetConfig);

    // All scripts should have basic structure
    assertStringIncludes(
      initScript,
      "Start-Transcript",
      `${presetName} preset missing transcript start`,
    );
    assertStringIncludes(
      initScript,
      "Stop-Transcript",
      `${presetName} preset missing transcript stop`,
    );
    assertStringIncludes(
      initScript,
      "Setting up firewall security...",
      `${presetName} preset missing firewall setup`,
    );
    assertStringIncludes(
      initScript,
      "Initialization completed successfully!",
      `${presetName} preset missing completion message`,
    );

    // Check dev tools inclusion matches preset
    const hasDevTools = initScript.includes("Installing WinGet...");
    assertEquals(
      hasDevTools,
      presetConfig.includeDevTools,
      `${presetName} preset dev tools inclusion mismatch`,
    );
  }
});
