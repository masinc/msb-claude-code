import { generateWSBContent } from "./wsb-generator.ts";
import { createDefaultConfig } from "./config.ts";
import { generateInitScript } from "./script-generator.ts";
import { copyScriptFiles, logCreatedFiles } from "./file-manager.ts";
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
    await Deno.writeTextFile(initPath, initScript);

    // Copy all script files
    await copyScriptFiles(initDir);

    // Log created files
    logCreatedFiles(outputDir, initDir);
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
