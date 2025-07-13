export interface PresetConfig {
  includeDevTools: boolean;
  name: string;
  description: string;
}

export const PRESETS: Record<string, PresetConfig> = {
  default: {
    includeDevTools: true,
    name: "Default",
    description: "Full development environment with firewall protection",
  },
  "firewall-only": {
    includeDevTools: false,
    name: "Firewall Only",
    description: "Firewall configuration only (no development tools)",
  },
};

export function validatePreset(preset: string): PresetConfig {
  if (!(preset in PRESETS)) {
    throw new Error(
      `Invalid preset: ${preset}. Available presets: ${
        Object.keys(PRESETS).join(", ")
      }`,
    );
  }
  return PRESETS[preset];
}

export function getPresetNames(): string[] {
  return Object.keys(PRESETS);
}
