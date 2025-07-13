import { parseArgs } from "node:util";

export function parseCliArgs() {
  return parseArgs({
    args: Deno.args,
    options: {
      workspace: {
        type: "string",
        short: "w",
      },
      help: {
        type: "boolean",
        short: "h",
        default: false,
      },
    },
    allowPositionals: false,
  });
}

export function showHelp(): void {
  console.log(`Usage: deno run src/main.ts [options]

Options:
  -w, --workspace <path>  Workspace directory to mount in sandbox
  -h, --help             Show this help message

Examples:
  deno run src/main.ts
  deno run src/main.ts --workspace C:\\path\\to\\project

Output:
  dist\\sandbox.wsb
  dist\\init\\init.ps1`);
}