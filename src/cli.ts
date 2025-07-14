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
      config: {
        type: "string",
        short: "c",
      },
      "protected-client": {
        type: "boolean",
        default: false,
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
  -p, --preset <preset>     Configuration preset (claude-code, minimal, default, firewall-only)
  -c, --config <file>       Configuration file (JSON format, mutually exclusive with --preset)
  -w, --workspace <path>    Workspace directory to mount in sandbox
  -o, --output <directory>  Output directory (default: dist)
  -m, --memory <gb>         Memory allocation in GB (default: 8)
      --protected-client    Enable app protection (default: false, Windows Terminal may not work)
  -h, --help               Show this help message

Presets:
  claude-code   Full development environment with firewall protection
  minimal       Minimal configuration (basic tools and firewall)
  default       Legacy alias for claude-code
  firewall-only Legacy alias for minimal

Examples:
  deno run src/main.ts --preset claude-code
  deno run src/main.ts --config my-config.json
  deno run src/main.ts --preset minimal --workspace C:\\path\\to\\project
  deno run src/main.ts --config my-config.json --workspace C:\\path\\to\\project --memory 4
  deno run src/main.ts --protected-client

Output:
  <output>\\sandbox.wsb
  <output>\\init\\init.ps1`);
}
