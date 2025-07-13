import { generateWSBContent } from "./wsb-generator.ts";
import { createDefaultConfig } from "./config.ts";
import { generateInitScript } from "./script-generator.ts";
import { copyScriptFiles, openOutputFolderOnWindows } from "./file-manager.ts";
import { parseCliArgs, showHelp } from "./cli.ts";

async function main() {
  try {
    const args = parseCliArgs();

    if (args.values.help) {
      showHelp();
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

    // Write main files
    const wsbPath = `${outputDir}/sandbox.wsb`;
    const initPath = `${initDir}/init.ps1`;
    
    await Deno.writeTextFile(wsbPath, wsbContent);
    console.log(`Created: ${wsbPath}`);
    
    await Deno.writeTextFile(initPath, initScript);
    console.log(`Created: ${initPath}`);

    // Copy all script files
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
