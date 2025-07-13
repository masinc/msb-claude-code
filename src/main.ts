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

function createDefaultConfig(outputDir: string): WSBConfig {
  const absoluteInitDir = Deno.realPathSync(`${outputDir}/init`);
  return {
    vGPU: "Enable",
    networking: "Enable",
    mappedFolders: [
      {
        hostFolder: absoluteInitDir,
        sandboxFolder: "C:\\init",
        readOnly: true,
      },
    ],
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
  return `# Start transcript for logging
Start-Transcript -Path "C:\\init\\init.log" -Append

# Source notification script
. "C:\\init\\notify.ps1"

# Show start notification
Invoke-Notification -Message "Starting initialization..." -Title "Windows Sandbox"

# Disable app execution aliases first
. "C:\\init\\disable-app-aliases.ps1"

# Source WinGet installation script
. "C:\\init\\install-winget.ps1"

# Source Scoop installation script
. "C:\\init\\install-scoop.ps1"

# Install packages using WinGet
. "C:\\init\\install-winget-package.ps1"

# Show completion notification
Invoke-Notification -Message "Initialization completed successfully!" -Title "Windows Sandbox"

# Stop transcript
Stop-Transcript`;
}

async function main() {
  try {
    const args = parseArgs({
      args: Deno.args,
      options: {
        template: {
          type: "string",
          short: "t",
          default: "default",
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
  -t, --template <name>  Template for sandbox configuration (default: "default")
  -h, --help            Show this help message

Examples:
  deno run src/main.ts --template default
  deno run src/main.ts -t default

Output:
  dist/{template}/sandbox.wsb
  dist/{template}/init/init.ps1`);
      return;
    }

    const template = args.values.template as string;
    const outputDir = `dist/${template}`;
    const initDir = `${outputDir}/init`;

    // Create output directories
    await Deno.mkdir(outputDir, { recursive: true });
    await Deno.mkdir(initDir, { recursive: true });

    let config: WSBConfig;

    switch (template) {
      case "default":
        config = createDefaultConfig(outputDir);
        break;
      default:
        throw new Error(`Unknown template: ${template}`);
    }

    const wsbContent = generateWSBContent(config);
    const initScript = generateInitScript();

    const wsbPath = `${outputDir}/sandbox.wsb`;
    const initPath = `${initDir}/init.ps1`;
    const notifyPath = `${initDir}/notify.ps1`;
    const installWingetPath = `${initDir}/install-winget.ps1`;
    const installWingetPackagePath = `${initDir}/install-winget-package.ps1`;
    const installScoopPath = `${initDir}/install-scoop.ps1`;
    const disableAppAliasesPath = `${initDir}/disable-app-aliases.ps1`;

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
    await Deno.writeTextFile(installWingetPackagePath, installWingetPackageScript);

    const disableAppAliasesScript = await Deno.readTextFile(
      "src/ps1/disable-app-aliases.ps1",
    );
    await Deno.writeTextFile(disableAppAliasesPath, disableAppAliasesScript);

    console.log(`Files created:`);
    console.log(`  ${wsbPath}`);
    console.log(`  ${initPath}`);
    console.log(`  ${notifyPath}`);
    console.log(`  ${installWingetPath}`);
    console.log(`  ${installWingetPackagePath}`);
    console.log(`  ${installScoopPath}`);
    console.log(`  ${disableAppAliasesPath}`);
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
