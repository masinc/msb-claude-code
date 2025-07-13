import { z } from "zod";

// Firewall configuration schema
export const FirewallConfigSchema = z.object({
  allowedDomains: z.object({
    github: z.array(z.string()),
    packageManagers: z.array(z.string()),
    developmentTools: z.array(z.string()),
    vscode: z.array(z.string()),
    claude: z.array(z.string()),
    additional: z.array(z.string()).optional(),
  }),
  timeoutSec: z.number().positive(),
  enableGitHubApi: z.boolean(),
});

// Package configuration schema
export const PackageConfigSchema = z.object({
  wingetDefaults: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
  })),
  scoopDefaults: z.array(z.object({
    name: z.string(),
    bucket: z.string().optional(),
    description: z.string().optional(),
  })),
});

// User configuration schema
export const UserConfigSchema = z.object({
  username: z.string(),
  profilePath: z.string(),
  documentsPath: z.string(),
});

// Tool path configuration schema
export const ToolPathConfigSchema = z.object({
  scoop: z.object({
    shimsPath: z.string(),
    rootPath: z.string(),
  }),
  mise: z.object({
    binPath: z.string().optional(),
    configPath: z.string().optional(),
  }),
  additionalPaths: z.array(z.string()).optional(),
});

// Notification configuration schema
export const NotificationConfigSchema = z.object({
  defaultTitle: z.string(),
  messages: z.object({
    starting: z.string(),
    installing: z.string(),
    completed: z.string(),
    ready: z.string(),
  }),
  showDuration: z.number().positive(),
});

// Main script configuration schema
export const ScriptConfigSchema = z.object({
  firewall: FirewallConfigSchema,
  packages: PackageConfigSchema,
  user: UserConfigSchema,
  toolPaths: ToolPathConfigSchema,
  notifications: NotificationConfigSchema,
});

// Type exports
export type FirewallConfig = z.infer<typeof FirewallConfigSchema>;
export type PackageConfig = z.infer<typeof PackageConfigSchema>;
export type UserConfig = z.infer<typeof UserConfigSchema>;
export type ToolPathConfig = z.infer<typeof ToolPathConfigSchema>;
export type NotificationConfig = z.infer<typeof NotificationConfigSchema>;
export type ScriptConfig = z.infer<typeof ScriptConfigSchema>;