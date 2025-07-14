import { ComponentLoader } from "./component-loader.ts";
import { PresetComposer } from "./preset-composer.ts";
import { ScriptConfig } from "./schema.ts";
import { validateScriptConfig } from "./validator.ts";

export class PresetManager {
  private componentLoader: ComponentLoader;
  private presetComposer: PresetComposer;

  constructor() {
    this.componentLoader = new ComponentLoader();
    this.presetComposer = new PresetComposer(this.componentLoader);
  }

  async loadPreset(name: string): Promise<ScriptConfig> {
    const config = await this.presetComposer.composePreset(name);
    return validateScriptConfig(config);
  }

  async listPresets(): Promise<{ builtin: string[], user: string[] }> {
    return await this.componentLoader.listPresets();
  }

  async listComponents(): Promise<string[]> {
    return await this.componentLoader.listComponents();
  }

  async composeCustom(
    componentSpecs: (string | { component: string; params?: Record<string, unknown> })[],
    additionalConfig?: Partial<ScriptConfig>
  ): Promise<ScriptConfig> {
    const config = await this.presetComposer.composeFromComponents(
      componentSpecs,
      additionalConfig
    );
    return validateScriptConfig(config);
  }

  clearCache(): void {
    this.componentLoader.clearCache();
  }
}

// Singleton instance for easy access
export const presetManager = new PresetManager();