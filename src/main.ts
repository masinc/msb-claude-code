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

    // Validate preset
    const presetName = (args.values as { preset?: string }).preset || "default";
    const presetConfig = validatePreset(presetName);
    
    console.log(`Using preset: ${presetConfig.name} - ${presetConfig.description}`);

    const outputDir = "dist";
    const initDir = `${outputDir}/init`;

    // Create output directories
    await Deno.mkdir(outputDir, { recursive: true });
    await Deno.mkdir(initDir, { recursive: true });

    const workspacePath = args.values.workspace as string | undefined;
    const workspaceName = workspacePath ? workspacePath.split(/[/\\]/).pop() || undefined : undefined;
    const config = createDefaultConfig(outputDir, workspacePath);

    const wsbContent = generateWSBContent(config);
    const initScript = generateInitScript(presetConfig, workspaceName);

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
