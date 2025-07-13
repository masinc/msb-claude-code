import { renderTemplate, TemplateData } from "./template-engine.ts";
import { DEFAULT_SCRIPT_CONFIG, ScriptConfig } from "./script-config.ts";
import { validatePartialConfig } from "./validator.ts";

export interface ScriptTemplateData extends TemplateData {
  firewall: ScriptConfig["firewall"];
  packages: ScriptConfig["packages"];
  user: ScriptConfig["user"];
  toolPaths: ScriptConfig["toolPaths"];
  notifications: ScriptConfig["notifications"];
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
        (result as any)[key] = deepMerge((defaults as any)[key], override);
      } else {
        (result as any)[key] = override;
      }
    }
  }

  return result;
}

export function renderScriptTemplate(
  templatePath: string,
  scriptConfig: Partial<ScriptConfig> = {},
): string {
  // Validate partial config before processing
  const validatedPartialConfig = validatePartialConfig(scriptConfig);
  
  // Deep merge provided config with defaults
  const config: ScriptConfig = {
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

  const templateData: ScriptTemplateData = {
    firewall: config.firewall,
    packages: config.packages,
    user: config.user,
    toolPaths: config.toolPaths,
    notifications: config.notifications,
  };

  return renderTemplate(templatePath, templateData);
}

// Convenience functions for specific scripts
export function renderFirewallScript(
  firewallConfig?: Partial<ScriptConfig["firewall"]>,
): string {
  return renderScriptTemplate(
    "powershell/setup-firewall.ps1.eta",
    firewallConfig ? { firewall: firewallConfig } : {},
  );
}

export function renderWingetDefaultsScript(
  packageConfig?: Partial<ScriptConfig["packages"]>,
): string {
  return renderScriptTemplate(
    "powershell/install-winget-defaults.ps1.eta",
    packageConfig ? { packages: packageConfig } : {},
  );
}

export function renderMiseSetupScript(
  userConfig?: Partial<ScriptConfig["user"]>,
): string {
  return renderScriptTemplate(
    "powershell/setup-mise.ps1.eta",
    userConfig ? { user: userConfig } : {},
  );
}

export function renderScoopPackageScript(
  packageConfig?: Partial<ScriptConfig["packages"]>,
): string {
  return renderScriptTemplate(
    "powershell/install-scoop-package.ps1.eta",
    packageConfig ? { packages: packageConfig } : {},
  );
}

export function renderRefreshEnvironmentScript(
  toolPathConfig?: Partial<ScriptConfig["toolPaths"]>,
): string {
  return renderScriptTemplate(
    "powershell/refresh-environment.ps1.eta",
    toolPathConfig ? { toolPaths: toolPathConfig } : {},
  );
}

export function renderNotifyScript(
  notificationConfig?: Partial<ScriptConfig["notifications"]>,
): string {
  return renderScriptTemplate(
    "powershell/notify.ps1.eta",
    notificationConfig ? { notifications: notificationConfig } : {},
  );
}
