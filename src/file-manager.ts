export async function copyScriptFiles(initDir: string): Promise<void> {
  const scripts = [
    { src: "src/ps1/notify.ps1", dest: `${initDir}/notify.ps1` },
    { src: "src/ps1/install-winget.ps1", dest: `${initDir}/install-winget.ps1` },
    { src: "src/ps1/install-scoop.ps1", dest: `${initDir}/install-scoop.ps1` },
    { src: "src/ps1/install-winget-package.ps1", dest: `${initDir}/install-winget-package.ps1` },
    { src: "src/ps1/install-scoop-package.ps1", dest: `${initDir}/install-scoop-package.ps1` },
    { src: "src/ps1/setup-mise.ps1", dest: `${initDir}/setup-mise.ps1` },
    { src: "src/ps1/install-claude-code.ps1", dest: `${initDir}/install-claude-code.ps1` },
    { src: "src/ps1/install-mise-packages.ps1", dest: `${initDir}/install-mise-packages.ps1` },
    { src: "src/ps1/install-winget-packages.ps1", dest: `${initDir}/install-winget-packages.ps1` },
    { src: "src/ps1/setup-firewall.ps1", dest: `${initDir}/setup-firewall.ps1` },
  ];

  for (const script of scripts) {
    const content = await Deno.readTextFile(script.src);
    await Deno.writeTextFile(script.dest, content);
    console.log(`Created: ${script.dest}`);
  }
}


export async function openOutputFolderOnWindows(outputDir: string): Promise<void> {
  if (Deno.build.os === "windows") {
    try {
      const command = new Deno.Command("explorer", {
        args: [outputDir],
      });
      await command.output();
      console.log(`Opened output folder: ${outputDir}`);
    } catch (error) {
      console.warn(`Failed to open output folder: ${error}`);
    }
  }
}