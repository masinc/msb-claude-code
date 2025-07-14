import { ScriptConfig } from "./schema.ts";
import { validateScriptConfig } from "./validator.ts";

export interface ConfigFile {
  preset?: string;
  config?: Partial<ScriptConfig>;
  components?: (string | { component: string; params?: Record<string, unknown> })[];
}

export class ConfigLoader {
  async loadConfigFile(filePath: string): Promise<ConfigFile> {
    try {
      const text = await Deno.readTextFile(filePath);
      const data = JSON.parse(text);
      
      // Basic validation
      if (typeof data !== 'object' || data === null) {
        throw new Error('Configuration file must contain a JSON object');
      }

      // Validate structure
      const configFile: ConfigFile = {};
      
      if (data.preset !== undefined) {
        if (typeof data.preset !== 'string') {
          throw new Error('preset must be a string');
        }
        configFile.preset = data.preset;
      }

      if (data.config !== undefined) {
        if (typeof data.config !== 'object' || data.config === null) {
          throw new Error('config must be an object');
        }
        configFile.config = data.config;
      }

      if (data.components !== undefined) {
        if (!Array.isArray(data.components)) {
          throw new Error('components must be an array');
        }
        configFile.components = data.components;
      }

      return configFile;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Error(`Configuration file not found: ${filePath}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in configuration file: ${filePath}`);
      }
      throw new Error(`Failed to load configuration file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async loadConfig(configFile: ConfigFile): Promise<ScriptConfig> {
    const { presetManager } = await import("./preset-manager.ts");

    if (configFile.preset && configFile.config) {
      throw new Error('Configuration file cannot specify both preset and config');
    }

    if (configFile.preset && configFile.components) {
      throw new Error('Configuration file cannot specify both preset and components');
    }

    if (configFile.preset) {
      // Load preset
      return await presetManager.loadPreset(configFile.preset);
    }

    if (configFile.components) {
      // Compose from components
      return await presetManager.composeCustom(configFile.components, configFile.config);
    }

    if (configFile.config) {
      // Use config directly merged with default config
      const { DEFAULT_SCRIPT_CONFIG } = await import("./script-config.ts");
      
      // Deep merge with default config
      const mergedConfig = {
        ...DEFAULT_SCRIPT_CONFIG,
        ...configFile.config,
        firewall: {
          ...DEFAULT_SCRIPT_CONFIG.firewall,
          ...configFile.config.firewall
        },
        packages: {
          ...DEFAULT_SCRIPT_CONFIG.packages,
          ...configFile.config.packages
        },
        user: {
          ...DEFAULT_SCRIPT_CONFIG.user,
          ...configFile.config.user
        },
        toolPaths: {
          ...DEFAULT_SCRIPT_CONFIG.toolPaths,
          ...configFile.config.toolPaths
        },
        notifications: {
          ...DEFAULT_SCRIPT_CONFIG.notifications,
          ...configFile.config.notifications
        }
      };
      
      return validateScriptConfig(mergedConfig);
    }

    throw new Error('Configuration file must specify either preset, config, or components');
  }
}

export const configLoader = new ConfigLoader();