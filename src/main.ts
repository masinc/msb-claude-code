import { generateWSBContent } from "./wsb-generator.ts";
import { createDefaultConfig } from "./config.ts";
import { copyScriptFiles, openOutputFolderOnWindows } from "./file-manager.ts";
import { parseCliArgs, showHelp } from "./cli.ts";
import { configLoader } from "./config-loader.ts";
import { ScriptConfig } from "./schema.ts";

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
      config?: string;
      output?: string;
      memory?: string;
      "protected-client"?: boolean;
      help?: boolean;
    }

    const extendedArgs = args.values as ExtendedArgs;

    // Validate mutual exclusivity of preset and config
    if (extendedArgs.preset && extendedArgs.config) {
      throw new Error("--preset and --config options are mutually exclusive");
    }

    // Load configuration
    let scriptConfig: ScriptConfig;
    let configSourceName: string;

    if (extendedArgs.config) {
      // Load from config file
      const configFile = await configLoader.loadConfigFile(extendedArgs.config);
      scriptConfig = await configLoader.loadConfig(configFile);
      configSourceName = `config file: ${extendedArgs.config}`;
    } else {
      // Use preset (default to claude-code if no preset specified)
      const { presetManager } = await import("./preset-manager.ts");
      const presetName = extendedArgs.preset || "claude-code";
      scriptConfig = await presetManager.loadPreset(presetName);
      configSourceName = `preset: ${presetName}`;
    }

    console.log(`Using ${configSourceName}`);

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
    const config = createDefaultConfig(
      outputDir,
      workspacePath,
      memoryGB,
      extendedArgs["protected-client"] || false,
    );

    const wsbContent = generateWSBContent(config);
    
    // Use new script template engine for init script
    const { renderScriptTemplate } = await import("./script-template-engine.ts");
    const initScript = await renderScriptTemplate(
      "powershell/init.ps1.eta",
      scriptConfig
    );

    // Write main files
    const wsbPath = `${outputDir}/sandbox.wsb`;
    const initPath = `${initDir}/init.ps1`;

    await Deno.writeTextFile(wsbPath, wsbContent);
    console.log(`Created: ${wsbPath}`);

    await Deno.writeTextFile(initPath, initScript);
    console.log(`Created: ${initPath}`);

    // Copy all PowerShell scripts
    await copyScriptFiles(initDir);

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

if (import.meta.main) {
  await main();
}
