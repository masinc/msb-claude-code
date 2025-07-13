import { assertEquals, assertStringIncludes } from "@std/assert";
import { generateWSBContent } from "./wsb-generator.ts";
import type { WSBConfig } from "./types.ts";

Deno.test("generateWSBContent should generate basic WSB configuration", () => {
  const config: WSBConfig = {
    vGPU: "Enable",
    networking: "Enable",
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Disable",
    printScreen: "Enable",
    clipboardRedirection: "Enable",
    memoryInMB: "8192",
  };

  const result = generateWSBContent(config);

  assertStringIncludes(result, "<Configuration>");
  assertStringIncludes(result, "</Configuration>");
  assertStringIncludes(result, "<vGPU>Enable</vGPU>");
  assertStringIncludes(result, "<Networking>Enable</Networking>");
  assertStringIncludes(result, "<AudioInput>Disable</AudioInput>");
  assertStringIncludes(result, "<VideoInput>Disable</VideoInput>");
  assertStringIncludes(result, "<ProtectedClient>Disable</ProtectedClient>");
  assertStringIncludes(result, "<PrintScreen>Enable</PrintScreen>");
  assertStringIncludes(
    result,
    "<ClipboardRedirection>Enable</ClipboardRedirection>",
  );
  assertStringIncludes(result, "<MemoryInMB>8192</MemoryInMB>");
});

Deno.test("generateWSBContent should generate configuration with mapped folders", () => {
  const config: WSBConfig = {
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
        hostFolder: "C:\\temp\\init",
        sandboxFolder: "C:\\init",
        readOnly: true,
      },
      {
        hostFolder: "C:\\workspace",
        sandboxFolder: "C:\\workspace",
        readOnly: false,
      },
    ],
  };

  const result = generateWSBContent(config);

  // Check basic structure
  assertStringIncludes(result, "<Configuration>");
  assertStringIncludes(result, "</Configuration>");

  // Check mapped folders section
  assertStringIncludes(result, "<MappedFolders>");
  assertStringIncludes(result, "</MappedFolders>");

  // Check first mapped folder
  assertStringIncludes(result, "<HostFolder>C:\\temp\\init</HostFolder>");
  assertStringIncludes(result, "<SandboxFolder>C:\\init</SandboxFolder>");
  assertStringIncludes(result, "<ReadOnly>true</ReadOnly>");

  // Check second mapped folder
  assertStringIncludes(result, "<HostFolder>C:\\workspace</HostFolder>");
  assertStringIncludes(result, "<SandboxFolder>C:\\workspace</SandboxFolder>");
  assertStringIncludes(result, "<ReadOnly>false</ReadOnly>");

  // Check memory setting
  assertStringIncludes(result, "<MemoryInMB>4096</MemoryInMB>");
});

Deno.test("generateWSBContent should generate configuration with logon command", () => {
  const config: WSBConfig = {
    vGPU: "Enable",
    networking: "Enable",
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Disable",
    printScreen: "Enable",
    clipboardRedirection: "Enable",
    memoryInMB: "8192",
    logonCommand: {
      command:
        'cmd.exe /c start "Windows Sandbox Initialization" powershell.exe -NoExit -ExecutionPolicy Bypass -File "C:\\init\\init.ps1"',
    },
  };

  const result = generateWSBContent(config);

  assertStringIncludes(result, "<LogonCommand>");
  assertStringIncludes(result, "</LogonCommand>");
  assertStringIncludes(result, "<Command>");
  assertStringIncludes(result, "</Command>");
  assertStringIncludes(result, "cmd.exe");
  assertStringIncludes(result, "powershell.exe");
  assertStringIncludes(result, "init.ps1");
});

Deno.test("generateWSBContent should handle empty mapped folders", () => {
  const config: WSBConfig = {
    vGPU: "Enable",
    networking: "Enable",
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Disable",
    printScreen: "Enable",
    clipboardRedirection: "Enable",
    memoryInMB: "8192",
    mappedFolders: [],
  };

  const result = generateWSBContent(config);

  // Should not include MappedFolders section when array is empty
  assertEquals(result.includes("<MappedFolders>"), false);
  assertEquals(result.includes("</MappedFolders>"), false);
  assertEquals(result.includes("<MappedFolder>"), false);

  // Should still include other sections
  assertStringIncludes(result, "<vGPU>Enable</vGPU>");
  assertStringIncludes(result, "<MemoryInMB>8192</MemoryInMB>");
});

Deno.test("generateWSBContent should handle undefined mapped folders", () => {
  const config: WSBConfig = {
    vGPU: "Enable",
    networking: "Enable",
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Disable",
    printScreen: "Enable",
    clipboardRedirection: "Enable",
    memoryInMB: "8192",
  };

  const result = generateWSBContent(config);

  // Should not include MappedFolders section when undefined
  assertEquals(result.includes("<MappedFolders>"), false);
  assertEquals(result.includes("</MappedFolders>"), false);
  assertEquals(result.includes("<MappedFolder>"), false);
});

Deno.test("generateWSBContent should handle undefined logon command", () => {
  const config: WSBConfig = {
    vGPU: "Enable",
    networking: "Enable",
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Disable",
    printScreen: "Enable",
    clipboardRedirection: "Enable",
    memoryInMB: "8192",
  };

  const result = generateWSBContent(config);

  // Should not include LogonCommand section when undefined
  assertEquals(result.includes("<LogonCommand>"), false);
  assertEquals(result.includes("</LogonCommand>"), false);
  assertEquals(result.includes("<Command>"), false);
});

Deno.test("generateWSBContent should escape XML special characters in folder paths", () => {
  const config: WSBConfig = {
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
        hostFolder: "C:\\temp\\<special>&folder",
        sandboxFolder: "C:\\<test>&folder",
        readOnly: true,
      },
    ],
  };

  const result = generateWSBContent(config);

  // Should escape XML special characters
  assertStringIncludes(result, "&lt;special&gt;&amp;folder");
  assertStringIncludes(result, "&lt;test&gt;&amp;folder");
});

Deno.test("generateWSBContent should escape XML special characters in logon command", () => {
  const config: WSBConfig = {
    vGPU: "Enable",
    networking: "Enable",
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Disable",
    printScreen: "Enable",
    clipboardRedirection: "Enable",
    memoryInMB: "8192",
    logonCommand: {
      command: 'cmd.exe /c "echo <hello> & world"',
    },
  };

  const result = generateWSBContent(config);

  // Should escape XML special characters in command
  assertStringIncludes(result, "&lt;hello&gt; &amp; world");
  assertStringIncludes(result, "&quot;");
});

Deno.test("generateWSBContent should generate valid XML structure", () => {
  const config: WSBConfig = {
    vGPU: "Disable",
    networking: "Disable",
    audioInput: "Enable",
    videoInput: "Enable",
    protectedClient: "Enable",
    printScreen: "Disable",
    clipboardRedirection: "Disable",
    memoryInMB: "2048",
    mappedFolders: [
      {
        hostFolder: "C:\\test",
        sandboxFolder: "C:\\test",
        readOnly: false,
      },
    ],
    logonCommand: {
      command: "notepad.exe",
    },
  };

  const result = generateWSBContent(config);

  // Should start and end with Configuration tags
  assertEquals(result.trim().startsWith("<Configuration>"), true);
  assertEquals(result.trim().endsWith("</Configuration>"), true);

  // Should have proper XML structure (basic validation)
  const lines = result.split("\n").map((line) => line.trim()).filter((line) =>
    line.length > 0
  );
  assertEquals(lines[0], "<Configuration>");
  assertEquals(lines[lines.length - 1], "</Configuration>");

  // Check that all required elements are present
  assertStringIncludes(result, "<vGPU>Disable</vGPU>");
  assertStringIncludes(result, "<Networking>Disable</Networking>");
  assertStringIncludes(result, "<AudioInput>Enable</AudioInput>");
  assertStringIncludes(result, "<VideoInput>Enable</VideoInput>");
  assertStringIncludes(result, "<ProtectedClient>Enable</ProtectedClient>");
  assertStringIncludes(result, "<PrintScreen>Disable</PrintScreen>");
  assertStringIncludes(
    result,
    "<ClipboardRedirection>Disable</ClipboardRedirection>",
  );
  assertStringIncludes(result, "<MemoryInMB>2048</MemoryInMB>");
});

Deno.test("generateWSBContent should handle multiple mapped folders correctly", () => {
  const config: WSBConfig = {
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
        hostFolder: "C:\\init",
        sandboxFolder: "C:\\init",
        readOnly: true,
      },
      {
        hostFolder: "C:\\workspace",
        sandboxFolder: "C:\\workspace",
        readOnly: false,
      },
      {
        hostFolder: "C:\\shared",
        sandboxFolder: "C:\\shared",
        readOnly: true,
      },
    ],
  };

  const result = generateWSBContent(config);

  // Should include all three mapped folders
  const mappedFolderMatches = result.match(/<MappedFolder>/g);
  assertEquals(mappedFolderMatches?.length, 3);

  // Check specific folder configurations
  assertStringIncludes(result, "<HostFolder>C:\\init</HostFolder>");
  assertStringIncludes(result, "<HostFolder>C:\\workspace</HostFolder>");
  assertStringIncludes(result, "<HostFolder>C:\\shared</HostFolder>");
});
