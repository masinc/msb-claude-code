import { parseArgs } from "node:util";

export function parseCliArgs() {
  return parseArgs({
    args: Deno.args,
    options: {
      workspace: {
        type: "string",
        short: "w",
      },
      preset: {
        type: "string",
        short: "p",
        default: "default",
      },
      output: {
        type: "string",
        short: "o",
        default: "dist",
      },
      memory: {
        type: "string",
        short: "m",
        default: "8",
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
  -p, --preset <preset>     Configuration preset (default, firewall-only)
  -w, --workspace <path>    Workspace directory to mount in sandbox
  -o, --output <directory>  Output directory (default: dist)
  -m, --memory <gb>         Memory allocation in GB (default: 8)
  -h, --help               Show this help message

Presets:
  default       Full development environment with firewall protection
  firewall-only Firewall configuration only (no development tools)

Examples:
  deno run src/main.ts
  deno run src/main.ts --preset firewall-only
  deno run src/main.ts --workspace C:\\path\\to\\project
  deno run src/main.ts --output my-sandbox --memory 16
  deno run src/main.ts --preset default --workspace C:\\path\\to\\project --memory 4

Output:
  <output>\\sandbox.wsb
  <output>\\init\\init.ps1`);
}