export async function copyScriptFiles(initDir: string): Promise<void> {
  const scripts = [
    { src: "src/ps1/notify.ps1", dest: `${initDir}/notify.ps1` },
    { src: "src/ps1/install-winget.ps1", dest: `${initDir}/install-winget.ps1` },
    { src: "src/ps1/install-scoop.ps1", dest: `${initDir}/install-scoop.ps1` },
    { src: "src/ps1/install-winget-package.ps1", dest: `${initDir}/install-winget-package.ps1` },
    { src: "src/ps1/install-scoop-package.ps1", dest: `${initDir}/install-scoop-package.ps1` },
    { src: "src/ps1/setup-mise.ps1", dest: `${initDir}/setup-mise.ps1` },
  ];

  for (const script of scripts) {
    const content = await Deno.readTextFile(script.src);
    await Deno.writeTextFile(script.dest, content);
  }
}

export function logCreatedFiles(outputDir: string, initDir: string): void {
  const files = [
    `${outputDir}/sandbox.wsb`,
    `${initDir}/init.ps1`,
    `${initDir}/notify.ps1`,
    `${initDir}/install-winget.ps1`,
    `${initDir}/install-winget-package.ps1`,
    `${initDir}/install-scoop.ps1`,
    `${initDir}/install-scoop-package.ps1`,
    `${initDir}/setup-mise.ps1`,
  ];

  console.log("Files created:");
  files.forEach(file => console.log(`  ${file}`));
}