import type { WSBConfig } from "./types.ts";

export function createDefaultConfig(outputDir: string, workspacePath?: string): WSBConfig {
  const absoluteInitDir = Deno.realPathSync(`${outputDir}/init`);
  const mappedFolders = [
    {
      hostFolder: absoluteInitDir,
      sandboxFolder: "C:\\init",
      readOnly: true,
    },
  ];

  // Add workspace folder if specified
  if (workspacePath) {
    const absoluteWorkspacePath = Deno.realPathSync(workspacePath);
    const workspaceName = workspacePath.split(/[/\\]/).pop() || "workspace";
    mappedFolders.push({
      hostFolder: absoluteWorkspacePath,
      sandboxFolder: `C:\\workspace\\${workspaceName}`,
      readOnly: false,
    });
  }

  return {
    vGPU: "Enable",
    networking: "Enable",
    mappedFolders,
    logonCommand: {
      command:
        `powershell.exe -ExecutionPolicy Bypass -File "C:\\init\\init.ps1"`,
    },
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Enable",
    printScreen: "Enable",
    clipboardRedirection: "Enable",
    memoryInMB: "8192",
  };
}