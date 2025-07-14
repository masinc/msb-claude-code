export interface PresetConfig {
  includeDevTools: boolean;
  name: string;
  description: string;
}

export const PRESETS: Record<string, PresetConfig> = {
  "claude-code": {
    includeDevTools: true,
    name: "Claude Code",
    description: "Full development environment with firewall protection",
  },
  minimal: {
    includeDevTools: false,
    name: "Minimal",
    description: "Minimal configuration (basic tools and firewall)",
  },
  // Legacy aliases for backward compatibility
  default: {
    includeDevTools: true,
    name: "Default (legacy)",
    description: "Full development environment with firewall protection (use 'claude-code' instead)",
  },
  "firewall-only": {
    includeDevTools: false,
    name: "Firewall Only (legacy)",
    description: "Firewall configuration only (use 'minimal' instead)",
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
