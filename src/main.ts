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
    </MappedFolder>`
        )
        .join('\n')
    : '';

  const logonCommandXml = config.logonCommand
    ? `  <LogonCommand>
    <Command>${config.logonCommand.command}</Command>
  </LogonCommand>`
    : '';

  return `<Configuration>
  <vGPU>${config.vGPU}</vGPU>
  <Networking>${config.networking}</Networking>
${mappedFoldersXml ? `  <MappedFolders>\n${mappedFoldersXml}\n  </MappedFolders>` : ''}
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
  const absoluteOutputDir = Deno.realPathSync(outputDir);
  return {
    vGPU: "Enable",
    networking: "Enable",
    mappedFolders: [
      {
        hostFolder: absoluteOutputDir,
        sandboxFolder: "C:\\workspace",
        readOnly: true
      }
    ],
    logonCommand: {
      command: `powershell.exe -ExecutionPolicy Bypass -File "C:\\workspace\\init\\init.ps1"`
    },
    audioInput: "Disable",
    videoInput: "Disable",
    protectedClient: "Enable",
    printScreen: "Enable",
    clipboardRedirection: "Enable",
    memoryInMB: "4096"
  };
}

function generateInitScript(): string {
  return `$progressPreference = 'silentlyContinue'
Write-Host "Installing WinGet PowerShell module from PSGallery..."
Install-PackageProvider -Name NuGet -Force | Out-Null
Install-Module -Name Microsoft.WinGet.Client -Force -Repository PSGallery | Out-Null
Write-Host "Using Repair-WinGetPackageManager cmdlet to bootstrap WinGet..."
Repair-WinGetPackageManager -AllUsers
Write-Host "Done."`;
}

async function main() {
  try {
    const args = parseArgs({
      args: Deno.args,
      options: {
        template: {
          type: "string",
          short: "t",
          default: "default"
        },
        help: {
          type: "boolean",
          short: "h",
          default: false
        }
      },
      allowPositionals: false
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

    await Deno.writeTextFile(wsbPath, wsbContent);
    await Deno.writeTextFile(initPath, initScript);
    
    console.log(`Files created:`);
    console.log(`  ${wsbPath}`);
    console.log(`  ${initPath}`);
    
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
