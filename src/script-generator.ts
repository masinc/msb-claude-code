import { PresetConfig } from "./presets.ts";
import { renderTemplate } from "./template-engine.ts";

interface PackageOptions {
  mise?: string;
  scoop?: string;
  wingetId?: string;
}

export function generateInitScript(
  presetConfig: PresetConfig,
  workspaceName?: string,
  packageOptions?: PackageOptions,
): string {
  const templateData = {
    presetConfig,
    workspaceName,
    packageOptions,
  };

  return renderTemplate("powershell/init.ps1.eta", templateData);
}
