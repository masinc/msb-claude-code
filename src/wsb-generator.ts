import type { WSBConfig } from "./types.ts";
import { escapeXml, renderTemplate } from "./template-engine.ts";

export function generateWSBContent(config: WSBConfig): string {
  const templateData = {
    ...config,
    escapeXml,
  };

  return renderTemplate("wsb/sandbox.wsb.eta", templateData);
}
