import { join } from "@std/path";
import { ScriptConfig } from "./schema.ts";

export interface ComponentConfig {
  name: string;
  description: string;
  parameters?: Record<string, ParameterDef>;
  config: Partial<ScriptConfig>;
}

export interface ParameterDef {
  type: "string" | "array" | "number" | "boolean";
  required?: boolean;
  default?: unknown;
  items?: string[];
}

export interface ComponentSpec {
  component: string;
  params?: Record<string, unknown>;
}

export interface PresetConfig {
  name: string;
  description: string;
  components: (string | ComponentSpec)[];
  config?: Partial<ScriptConfig>;
}

export class ComponentLoader {
  private componentCache = new Map<string, ComponentConfig>();
  private presetCache = new Map<string, PresetConfig>();

  constructor(
    private componentsBasePath = "src/config/components",
    private presetsBasePath = "src/config/presets"
  ) {}

  async loadComponent(name: string): Promise<ComponentConfig> {
    if (this.componentCache.has(name)) {
      return this.componentCache.get(name)!;
    }

    const filePath = this.getComponentFilePath(name);
    
    try {
      const text = await Deno.readTextFile(filePath);
      const component: ComponentConfig = JSON.parse(text);
      
      // Validate component structure
      if (!component.name || !component.config) {
        throw new Error(`Invalid component structure: ${name}`);
      }

      this.componentCache.set(name, component);
      return component;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Error(`Component not found: ${name}`);
      }
      throw new Error(`Failed to load component ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async loadPreset(name: string): Promise<PresetConfig> {
    if (this.presetCache.has(name)) {
      return this.presetCache.get(name)!;
    }

    // Try builtin presets first, then user presets
    const builtinPath = join(this.presetsBasePath, "builtin", `${name}.json`);
    const userPath = join(this.presetsBasePath, "user", `${name}.json`);

    for (const filePath of [builtinPath, userPath]) {
      try {
        const text = await Deno.readTextFile(filePath);
        const preset: PresetConfig = JSON.parse(text);
        
        // Validate preset structure
        if (!preset.name || !preset.components) {
          throw new Error(`Invalid preset structure: ${name}`);
        }

        this.presetCache.set(name, preset);
        return preset;
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          continue; // Try next path
        }
        throw new Error(`Failed to load preset ${name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    throw new Error(`Preset not found: ${name}`);
  }

  async listComponents(): Promise<string[]> {
    const components: string[] = [];
    
    for await (const dirEntry of Deno.readDir(this.componentsBasePath)) {
      if (dirEntry.isDirectory) {
        const categoryPath = join(this.componentsBasePath, dirEntry.name);
        for await (const fileEntry of Deno.readDir(categoryPath)) {
          if (fileEntry.isFile && fileEntry.name.endsWith('.json')) {
            const componentName = fileEntry.name.replace('.json', '');
            components.push(`${dirEntry.name}.${componentName}`);
          }
        }
      }
    }

    return components.sort();
  }

  async listPresets(): Promise<{ builtin: string[], user: string[] }> {
    const result = { builtin: [] as string[], user: [] as string[] };

    // List builtin presets
    try {
      const builtinPath = join(this.presetsBasePath, "builtin");
      for await (const entry of Deno.readDir(builtinPath)) {
        if (entry.isFile && entry.name.endsWith('.json')) {
          result.builtin.push(entry.name.replace('.json', ''));
        }
      }
    } catch (_error) {
      // Directory might not exist yet
    }

    // List user presets
    try {
      const userPath = join(this.presetsBasePath, "user");
      for await (const entry of Deno.readDir(userPath)) {
        if (entry.isFile && entry.name.endsWith('.json')) {
          result.user.push(entry.name.replace('.json', ''));
        }
      }
    } catch (_error) {
      // Directory might not exist yet
    }

    result.builtin.sort();
    result.user.sort();
    return result;
  }

  private getComponentFilePath(name: string): string {
    const parts = name.split('.');
    if (parts.length < 2) {
      throw new Error(`Invalid component name format: ${name}. Expected format: category.name`);
    }

    const [category, ...nameParts] = parts;
    const fileName = nameParts.join('.') + '.json';
    return join(this.componentsBasePath, category, fileName);
  }

  clearCache(): void {
    this.componentCache.clear();
    this.presetCache.clear();
  }
}