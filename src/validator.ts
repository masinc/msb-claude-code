import { ZodError } from "zod";
import { ScriptConfigSchema, ScriptConfig } from "./schema.ts";

export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public readonly zodError: ZodError,
  ) {
    super(message);
    this.name = "ConfigValidationError";
  }

  getDetailedErrors(): string[] {
    return this.zodError.errors.map((error) => {
      const path = error.path.join(".");
      return `${path}: ${error.message}`;
    });
  }
}

export function validateScriptConfig(config: unknown): ScriptConfig {
  try {
    return ScriptConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = `Configuration validation failed:\n${
        error.errors.map((e) => `  - ${e.path.join(".")}: ${e.message}`).join(
          "\n",
        )
      }`;
      throw new ConfigValidationError(errorMessage, error);
    }
    throw error;
  }
}

export function validatePartialConfig(config: unknown): Partial<ScriptConfig> {
  try {
    return ScriptConfigSchema.partial().parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = `Partial configuration validation failed:\n${
        error.errors.map((e) => `  - ${e.path.join(".")}: ${e.message}`).join(
          "\n",
        )
      }`;
      throw new ConfigValidationError(errorMessage, error);
    }
    throw error;
  }
}

export function safeValidateConfig(
  config: unknown,
): { success: true; data: ScriptConfig } | { success: false; error: string } {
  try {
    const data = validateScriptConfig(config);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown validation error" };
  }
}

export function safeValidatePartialConfig(
  config: unknown,
): { success: true; data: Partial<ScriptConfig> } | {
  success: false;
  error: string;
} {
  try {
    const data = validatePartialConfig(config);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown validation error" };
  }
}

export async function loadAndValidateConfigFromFile(
  filePath: string,
): Promise<ScriptConfig> {
  try {
    const text = await Deno.readTextFile(filePath);
    const config = JSON.parse(text);
    return validateScriptConfig(config);
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      throw new Error(`Invalid configuration in ${filePath}: ${error.message}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`JSON parse error in ${filePath}: ${error.message}`);
    }
    throw new Error(`Failed to load config from ${filePath}: ${error.message}`);
  }
}