import { renderTemplate, TemplateData } from "./template-engine.ts";
import { DEFAULT_SCRIPT_CONFIG, ScriptConfig } from "./script-config.ts";
import { validatePartialConfig } from "./validator.ts";
import { presetManager } from "./preset-manager.ts";

export interface ScriptTemplateData extends TemplateData {
  firewall: ScriptConfig["firewall"];
  packages: ScriptConfig["packages"];
  user: ScriptConfig["user"];
  toolPaths: ScriptConfig["toolPaths"];
  notifications: ScriptConfig["notifications"];
  // Legacy compatibility for old template format
  presetConfig?: {
    includeDevTools: boolean;
  };
  packageOptions?: Record<string, unknown>;
}

function deepMerge<T>(defaults: T, overrides: Partial<T> | undefined): T {
  if (!overrides) return defaults;

  const result = { ...defaults };

  for (const key in overrides) {
    const override = overrides[key];
    if (override !== undefined) {
      if (
        typeof override === "object" && override !== null &&
        !Array.isArray(override)
      ) {
        (result as Record<string, unknown>)[key] = deepMerge((defaults as Record<string, unknown>)[key], override);
      } else {
        (result as Record<string, unknown>)[key] = override;
      }
    }
  }

  return result;
}

export async function renderScriptTemplate(
  templatePath: string,
  configOrPreset: string | Partial<ScriptConfig> = {},
): Promise<string> {
  let config: ScriptConfig;

  if (typeof configOrPreset === 'string') {
    // Load preset
    config = await presetManager.loadPreset(configOrPreset);
  } else {
    // Use provided config with defaults
    const validatedPartialConfig = validatePartialConfig(configOrPreset);
    
    config = {
      firewall: deepMerge(DEFAULT_SCRIPT_CONFIG.firewall, validatedPartialConfig.firewall),
      packages: deepMerge(DEFAULT_SCRIPT_CONFIG.packages, validatedPartialConfig.packages),
      user: deepMerge(DEFAULT_SCRIPT_CONFIG.user, validatedPartialConfig.user),
      toolPaths: deepMerge(
        DEFAULT_SCRIPT_CONFIG.toolPaths,
        validatedPartialConfig.toolPaths,
      ),
      notifications: deepMerge(
        DEFAULT_SCRIPT_CONFIG.notifications,
        validatedPartialConfig.notifications,
      ),
    };
  }

  const templateData: ScriptTemplateData = {
    firewall: config.firewall,
    packages: config.packages,
    user: config.user,
    toolPaths: config.toolPaths,
    notifications: config.notifications,
    // Legacy compatibility for old template format
    presetConfig: {
      includeDevTools: config.packages.wingetDefaults.length > 0 || config.packages.scoopDefaults.length > 0
    },
    packageOptions: {}
  };

  return renderTemplate(templatePath, templateData);
}

// Convenience functions for specific scripts
export async function renderFirewallScript(
  firewallConfig?: Partial<ScriptConfig["firewall"]>,
): Promise<string> {
  return await renderScriptTemplate(
    "powershell/setup-firewall.ps1.eta",
    firewallConfig ? { firewall: firewallConfig } as Partial<ScriptConfig> : {},
  );
}

export async function renderWingetDefaultsScript(
  packageConfig?: Partial<ScriptConfig["packages"]>,
): Promise<string> {
  return await renderScriptTemplate(
    "powershell/install-winget-defaults.ps1.eta",
    packageConfig ? { packages: packageConfig } as Partial<ScriptConfig> : {},
  );
}

export async function renderMiseSetupScript(
  userConfig?: Partial<ScriptConfig["user"]>,
): Promise<string> {
  return await renderScriptTemplate(
    "powershell/setup-mise.ps1.eta",
    userConfig ? { user: userConfig } as Partial<ScriptConfig> : {},
  );
}

export async function renderScoopPackageScript(
  packageConfig?: Partial<ScriptConfig["packages"]>,
): Promise<string> {
  return await renderScriptTemplate(
    "powershell/install-scoop-package.ps1.eta",
    packageConfig ? { packages: packageConfig } as Partial<ScriptConfig> : {},
  );
}

export async function renderRefreshEnvironmentScript(
  toolPathConfig?: Partial<ScriptConfig["toolPaths"]>,
): Promise<string> {
  return await renderScriptTemplate(
    "powershell/refresh-environment.ps1.eta",
    toolPathConfig ? { toolPaths: toolPathConfig } as Partial<ScriptConfig> : {},
  );
}

export async function renderNotifyScript(
  notificationConfig?: Partial<ScriptConfig["notifications"]>,
): Promise<string> {
  return await renderScriptTemplate(
    "powershell/notify.ps1.eta",
    notificationConfig ? { notifications: notificationConfig } as Partial<ScriptConfig> : {},
  );
}
