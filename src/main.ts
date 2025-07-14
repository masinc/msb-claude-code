import { generateWSBContent } from "./wsb-generator.ts";
import { createDefaultConfig } from "./config.ts";
import { generateInitScript } from "./script-generator.ts";
import { copyScriptFiles, openOutputFolderOnWindows } from "./file-manager.ts";
import { parseCliArgs, showHelp } from "./cli.ts";
import { validatePreset } from "./presets.ts";

async function main() {
  try {
    const args = parseCliArgs();

    if (args.values.help) {
      showHelp();
      return;
    }

    // Define extended args interface
    interface ExtendedArgs {
      workspace?: string;
      preset?: string;
      output?: string;
      memory?: string;
      mise?: string;
      scoop?: string;
      "winget-id"?: string;
      "protected-client"?: boolean;
      help?: boolean;
    }

    const extendedArgs = args.values as ExtendedArgs;

    // Validate preset
    const presetName = extendedArgs.preset || "claude-code";
    const presetConfig = validatePreset(presetName);

    console.log(
      `Using preset: ${presetConfig.name} - ${presetConfig.description}`,
    );

    const outputDir = extendedArgs.output || "dist";
    const memoryGB = parseInt(extendedArgs.memory || "8");
    const initDir = `${outputDir}/init`;

    // Validate memory value
    if (isNaN(memoryGB) || memoryGB < 1 || memoryGB > 64) {
      throw new Error(
        `Invalid memory value: ${extendedArgs.memory}. Must be between 1 and 64 GB.`,
      );
    }

    // Check if output directory already exists
    try {
      const stat = await Deno.stat(outputDir);
      if (stat.isDirectory) {
        throw new Error(
          `Output directory '${outputDir}' already exists. Please choose a different output path or remove the existing directory.`,
        );
      }
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }

    // Create output directories
    await Deno.mkdir(outputDir, { recursive: true });
    await Deno.mkdir(initDir, { recursive: true });

    const workspacePath = extendedArgs.workspace;
    const workspaceName = workspacePath
      ? workspacePath.split(/[/\\]/).pop() || undefined
      : undefined;
    const config = createDefaultConfig(
      outputDir,
      workspacePath,
      memoryGB,
      extendedArgs["protected-client"] || false,
    );

    // Extract package options
    const packageOptions = {
      mise: extendedArgs.mise || "",
      scoop: extendedArgs.scoop || "",
      wingetId: extendedArgs["winget-id"] || "",
    };

    const wsbContent = generateWSBContent(config);
    const initScript = generateInitScript(
      presetConfig,
      workspaceName,
      packageOptions,
    );

    // Write main files
    const wsbPath = `${outputDir}/sandbox.wsb`;
    const initPath = `${initDir}/init.ps1`;

    await Deno.writeTextFile(wsbPath, wsbContent);
    console.log(`Created: ${wsbPath}`);

    await Deno.writeTextFile(initPath, initScript);
    console.log(`Created: ${initPath}`);

    // Copy script files (only firewall setup for firewall-only preset)
    console.log(`includeDevTools: ${presetConfig.includeDevTools}`);
    if (presetConfig.includeDevTools) {
      await copyScriptFiles(initDir);
    } else {
      // Copy only required scripts for firewall-only preset
      await copyRequiredScripts(initDir);
    }

    // Open output folder on Windows
    await openOutputFolderOnWindows(outputDir);
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  }
}

async function copyRequiredScripts(initDir: string) {
  const requiredScripts = [
    "notify.ps1",
    "install-mise-packages.ps1",
    "install-winget-custom.ps1",
    "install-scoop-package.ps1",
    "refresh-environment.ps1",
    "setup-firewall.ps1",
  ];

  console.log(`Copying required scripts for firewall-only preset...`);

  for (const script of requiredScripts) {
    const srcPath = `src/ps1/${script}`;
    const destPath = `${initDir}/${script}`;

    try {
      const content = await Deno.readTextFile(srcPath);
      await Deno.writeTextFile(destPath, content);
      console.log(`Created: ${destPath}`);
    } catch (error) {
      console.error(`Failed to copy ${script}:`, error);
    }
  }
}

if (import.meta.main) {
  await main();
}
