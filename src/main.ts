import { parseArgs } from "node:util";

interface WSBConfig {
  vGPU: string;
  networking: string;
  mappedFolders?: Array<{
    hostFolder: string;
    sandboxFolder: string;
    readOnly: boolean;
  }>;
  logonCommand?: {
    command: string;
  };
  audioInput: string;
  videoInput: string;
  protectedClient: string;
  printScreen: string;
  clipboardRedirection: string;
  memoryInMB: string;
}

function generateWSBContent(config: WSBConfig): string {
  const mappedFoldersXml = config.mappedFolders
    ? config.mappedFolders
      .map(
        (folder) =>
          `    <MappedFolder>
      <HostFolder>${folder.hostFolder}</HostFolder>
      <SandboxFolder>${folder.sandboxFolder}</SandboxFolder>
      <ReadOnly>${folder.readOnly}</ReadOnly>
    </MappedFolder>`,
      )
      .join("\n")
    : "";

  const logonCommandXml = config.logonCommand
    ? `  <LogonCommand>
    <Command>${config.logonCommand.command}</Command>
  </LogonCommand>`
    : "";

  return `<Configuration>
  <vGPU>${config.vGPU}</vGPU>
  <Networking>${config.networking}</Networking>
${
    mappedFoldersXml
      ? `  <MappedFolders>\n${mappedFoldersXml}\n  </MappedFolders>`
      : ""
  }
${logonCommandXml}
  <AudioInput>${config.audioInput}</AudioInput>
  <VideoInput>${config.videoInput}</VideoInput>
  <ProtectedClient>${config.protectedClient}</ProtectedClient>
  <PrintScreen>${config.printScreen}</PrintScreen>
  <ClipboardRedirection>${config.clipboardRedirection}</ClipboardRedirection>
  <MemoryInMB>${config.memoryInMB}</MemoryInMB>
</Configuration>`;
}

function createDefaultConfig(outputDir: string, workspacePath?: string): WSBConfig {
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
    mappedFolders.push({
      hostFolder: absoluteWorkspacePath,
      sandboxFolder: "C:\\workspace",
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

function generateInitScript(): string {
  return `# Source notification script
. "C:\\init\\notify.ps1"

# Show start notification
Invoke-Notification -Message "Starting initialization..." -Title "Windows Sandbox"

# Source WinGet installation script
Invoke-Notification -Message "Installing WinGet..." -Title "Windows Sandbox"
. "C:\\init\\install-winget.ps1"

# Source Scoop installation script
Invoke-Notification -Message "Installing Scoop..." -Title "Windows Sandbox"
. "C:\\init\\install-scoop.ps1"

# Install packages using WinGet
Invoke-Notification -Message "Winget package installation in progress..." -Title "Windows Sandbox"
. "C:\\init\\install-winget-package.ps1"

# Install scoop packages
Invoke-Notification -Message "Scoop package installation in progress..." -Title "Windows Sandbox"
. "C:\\init\\install-scoop-package.ps1"

# Setup mise
Invoke-Notification -Message "Setting up mise..." -Title "Windows Sandbox"
. "C:\\init\\setup-mise.ps1"

# Show completion notification
Invoke-Notification -Message "Initialization completed successfully!" -Title "Windows Sandbox"`;
}

async function main() {
  try {
    const args = parseArgs({
      args: Deno.args,
      options: {
        workspace: {
          type: "string",
          short: "w",
        },
        help: {
          type: "boolean",
          short: "h",
          default: false,
        },
      },
      allowPositionals: false,
    });

    if (args.values.help) {
      console.log(`Usage: deno run src/main.ts [options]

Options:
  -w, --workspace <path>  Workspace directory to mount in sandbox
  -h, --help             Show this help message

Examples:
  deno run src/main.ts
  deno run src/main.ts --workspace C:\\path\\to\\project

Output:
  dist\\sandbox.wsb
  dist\\init\\init.ps1`);
      return;
    }

    const outputDir = "dist";
    const initDir = `${outputDir}/init`;

    // Create output directories
    await Deno.mkdir(outputDir, { recursive: true });
    await Deno.mkdir(initDir, { recursive: true });

    const workspacePath = args.values.workspace as string | undefined;
    const config = createDefaultConfig(outputDir, workspacePath);

    const wsbContent = generateWSBContent(config);
    const initScript = generateInitScript();

    const wsbPath = `${outputDir}/sandbox.wsb`;
    const initPath = `${initDir}/init.ps1`;
    const notifyPath = `${initDir}/notify.ps1`;
    const installWingetPath = `${initDir}/install-winget.ps1`;
    const installWingetPackagePath = `${initDir}/install-winget-package.ps1`;
    const installScoopPath = `${initDir}/install-scoop.ps1`;
    const installScoopPackagePath = `${initDir}/install-scoop-package.ps1`;
    const setupMisePath = `${initDir}/setup-mise.ps1`;

    await Deno.writeTextFile(wsbPath, wsbContent);
    await Deno.writeTextFile(initPath, initScript);

    // Copy required scripts
    const notifyScript = await Deno.readTextFile("src/ps1/notify.ps1");
    await Deno.writeTextFile(notifyPath, notifyScript);

    const installWingetScript = await Deno.readTextFile(
      "src/ps1/install-winget.ps1",
    );
    await Deno.writeTextFile(installWingetPath, installWingetScript);

    const installScoopScript = await Deno.readTextFile(
      "src/ps1/install-scoop.ps1",
    );
    await Deno.writeTextFile(installScoopPath, installScoopScript);

    const installWingetPackageScript = await Deno.readTextFile(
      "src/ps1/install-winget-package.ps1",
    );
    await Deno.writeTextFile(
      installWingetPackagePath,
      installWingetPackageScript,
    );

    const installScoopPackageScript = await Deno.readTextFile(
      "src/ps1/install-scoop-package.ps1",
    );
    await Deno.writeTextFile(installScoopPackagePath, installScoopPackageScript);

    const setupMiseScript = await Deno.readTextFile(
      "src/ps1/setup-mise.ps1",
    );
    await Deno.writeTextFile(setupMisePath, setupMiseScript);


    console.log(`Files created:`);
    console.log(`  ${wsbPath}`);
    console.log(`  ${initPath}`);
    console.log(`  ${notifyPath}`);
    console.log(`  ${installWingetPath}`);
    console.log(`  ${installWingetPackagePath}`);
    console.log(`  ${installScoopPath}`);
    console.log(`  ${installScoopPackagePath}`);
    console.log(`  ${setupMisePath}`);
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
