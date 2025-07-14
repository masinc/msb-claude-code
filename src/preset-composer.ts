import { ScriptConfig } from "./schema.ts";
import { ComponentLoader, ComponentConfig, ComponentSpec } from "./component-loader.ts";

export class PresetComposer {
  constructor(private componentLoader: ComponentLoader) {}

  async composePreset(presetName: string): Promise<ScriptConfig> {
    const preset = await this.componentLoader.loadPreset(presetName);
    return this.composeFromComponents(preset.components, preset.config);
  }

  async composeFromComponents(
    componentSpecs: (string | ComponentSpec)[],
    additionalConfig?: Partial<ScriptConfig>
  ): Promise<ScriptConfig> {
    let result: Partial<ScriptConfig> = {};

    // Process each component in order (cumulative addition)
    for (const spec of componentSpecs) {
      const componentConfig = await this.processComponentSpec(spec);
      result = this.cumulativeMerge(result, componentConfig);
    }

    // Apply additional config if provided
    if (additionalConfig) {
      result = this.cumulativeMerge(result, additionalConfig);
    }

    // Ensure all required fields are present
    return this.ensureCompleteConfig(result);
  }

  private async processComponentSpec(spec: string | ComponentSpec): Promise<Partial<ScriptConfig>> {
    if (typeof spec === 'string') {
      // Static component
      const component = await this.componentLoader.loadComponent(spec);
      return component.config;
    } else {
      // Parameterized component
      const component = await this.componentLoader.loadComponent(spec.component);
      return this.expandParameterizedComponent(component, spec.params || {});
    }
  }

  private expandParameterizedComponent(
    component: ComponentConfig,
    params: Record<string, unknown>
  ): Partial<ScriptConfig> {
    // Validate parameters
    this.validateParameters(component, params);

    // Expand template placeholders in component config
    const configStr = JSON.stringify(component.config);
    const expandedConfigStr = this.expandTemplate(configStr, params);
    
    try {
      return JSON.parse(expandedConfigStr);
    } catch (error) {
      throw new Error(`Failed to expand component ${component.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private validateParameters(component: ComponentConfig, params: Record<string, unknown>): void {
    if (!component.parameters) {
      if (Object.keys(params).length > 0) {
        throw new Error(`Component ${component.name} does not accept parameters`);
      }
      return;
    }

    // Check required parameters
    for (const [paramName, paramDef] of Object.entries(component.parameters)) {
      if (paramDef.required && !(paramName in params)) {
        throw new Error(`Required parameter missing: ${paramName} for component ${component.name}`);
      }
    }

    // Validate parameter types
    for (const [paramName, value] of Object.entries(params)) {
      const paramDef = component.parameters[paramName];
      if (!paramDef) {
        throw new Error(`Unknown parameter: ${paramName} for component ${component.name}`);
      }

      this.validateParameterType(paramName, value, paramDef, component.name);
    }
  }

  private validateParameterType(
    paramName: string,
    value: unknown,
    paramDef: { type: string; items?: string[] },
    componentName: string
  ): void {
    switch (paramDef.type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error(`Parameter ${paramName} must be a string in component ${componentName}`);
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`Parameter ${paramName} must be an array in component ${componentName}`);
        }
        break;
      case 'number':
        if (typeof value !== 'number') {
          throw new Error(`Parameter ${paramName} must be a number in component ${componentName}`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(`Parameter ${paramName} must be a boolean in component ${componentName}`);
        }
        break;
    }
  }

  private expandTemplate(template: string, params: Record<string, unknown>): string {
    let result = template;

    // Handle array parameters specially for component expansion
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        // Convert array to JSON for template replacement
        const placeholder = `"{{${key}}}"`;
        const replacement = JSON.stringify(value);
        result = result.replaceAll(placeholder, replacement);
      } else {
        // Handle primitive values
        const placeholder = `{{${key}}}`;
        const replacement = JSON.stringify(value);
        result = result.replaceAll(placeholder, replacement);
      }
    }

    return result;
  }

  private cumulativeMerge(
    base: Partial<ScriptConfig>,
    addition: Partial<ScriptConfig>
  ): Partial<ScriptConfig> {
    const result = { ...base };

    for (const [key, value] of Object.entries(addition)) {
      if (key in result) {
        const mergedValue = this.mergeValues(
          result[key as keyof ScriptConfig],
          value
        );
        (result as Record<string, unknown>)[key] = mergedValue;
      } else {
        (result as Record<string, unknown>)[key] = value;
      }
    }

    return result;
  }

  private mergeValues(base: unknown, addition: unknown): unknown {
    // Arrays: concatenate (cumulative addition)
    if (Array.isArray(base) && Array.isArray(addition)) {
      return [...base, ...addition];
    }

    // Objects: deep merge
    if (this.isObject(base) && this.isObject(addition)) {
      const result = { ...base };
      for (const [key, value] of Object.entries(addition)) {
        if (key in result) {
          (result as Record<string, unknown>)[key] = this.mergeValues(result[key], value);
        } else {
          (result as Record<string, unknown>)[key] = value;
        }
      }
      return result;
    }

    // Primitives: later value wins
    return addition;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  private ensureCompleteConfig(config: Partial<ScriptConfig>): ScriptConfig {
    // Provide default values for missing required fields
    const defaults: ScriptConfig = {
      firewall: {
        allowedDomains: {
          github: [],
          packageManagers: [],
          developmentTools: [],
          vscode: [],
          claude: [],
        },
        timeoutSec: 10,
        enableGitHubApi: false,
      },
      packages: {
        wingetDefaults: [],
        scoopDefaults: [],
      },
      user: {
        username: "WDAGUtilityAccount",
        profilePath: "C:\\Users\\WDAGUtilityAccount\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1",
        documentsPath: "C:\\Users\\WDAGUtilityAccount\\Documents",
      },
      toolPaths: {
        scoop: {
          shimsPath: "$env:USERPROFILE\\scoop\\shims",
          rootPath: "$env:USERPROFILE\\scoop",
        },
        mise: {},
      },
      notifications: {
        defaultTitle: "Windows Sandbox",
        messages: {
          starting: "Starting setup...",
          installing: "Installing packages...",
          completed: "Setup completed!",
          ready: "Ready to use.",
        },
        showDuration: 5000,
      },
    };

    return this.cumulativeMerge(defaults, config) as ScriptConfig;
  }
}