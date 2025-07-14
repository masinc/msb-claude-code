import { Eta } from "eta";
import { join } from "@std/path";

export interface TemplateData {
  [key: string]: unknown;
}

const eta = new Eta({
  views: join(Deno.cwd(), "src", "templates"),
  autoEscape: false,
  cache: false,
  debug: false, // Deno.env.get("DEBUG") === "true",
});

export function renderTemplate(
  templatePath: string,
  data: TemplateData,
): string {
  return eta.render(templatePath, data);
}

export function renderTemplateAsync(
  templatePath: string,
  data: TemplateData,
): Promise<string> {
  return eta.renderAsync(templatePath, data);
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function escapePowerShell(str: string): string {
  return str
    .replace(/`/g, "``")
    .replace(/\$/g, "`$")
    .replace(/"/g, '`"')
    .replace(/'/g, "''");
}

eta.configure({
  plugins: [
    {
      processFnString: (fnString: string) => fnString,
      processAST: (ast: unknown) => ast,
      processTemplate: (template: string) => template,
    },
  ],
});

const helpers = {
  escapeXml,
  escapePowerShell,
  join: (...parts: string[]) => parts.filter(Boolean).join(""),
  joinPath: (first: string, ...rest: string[]) => join(first, ...rest),
};

Object.entries(helpers).forEach(([name, fn]) => {
  eta.config.varName = "it";
  (eta.config as unknown as Record<string, unknown>)[name] = fn;
});

export { eta };
