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
        default: "claude-code",
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
      mise: {
        type: "string",
        default: "",
      },
      scoop: {
        type: "string",
        default: "",
      },
      "winget-id": {
        type: "string",
        default: "",
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
  -w, --workspace <path>    Workspace directory to mount in sandbox
  -o, --output <directory>  Output directory (default: dist)
  -m, --memory <gb>         Memory allocation in GB (default: 8)
      --mise <packages>     Install packages via mise (e.g., go@1,python@3)
      --scoop <packages>    Install packages via scoop (e.g., yq,jq)
      --winget-id <ids>     Install packages via WinGet ID (e.g., Microsoft.DotNet.SDK.8)
      --protected-client    Enable app protection (default: false, Windows Terminal may not work)
  -h, --help               Show this help message

Presets:
  claude-code   Full development environment with firewall protection (default)
  minimal       Minimal configuration (basic tools and firewall)
  default       Legacy alias for claude-code
  firewall-only Legacy alias for minimal

Examples:
  deno run src/main.ts
  deno run src/main.ts --preset minimal
  deno run src/main.ts --workspace C:\\path\\to\\project
  deno run src/main.ts --mise go@1,python@3 --scoop yq,jq
  deno run src/main.ts --winget-id Microsoft.DotNet.SDK.8,Microsoft.VisualStudio.2022.BuildTools
  deno run src/main.ts --protected-client  # Enable app protection (Windows Terminal restricted)
  deno run src/main.ts --preset claude-code --workspace C:\\path\\to\\project --memory 4

Output:
  <output>\\sandbox.wsb
  <output>\\init\\init.ps1`);
}
