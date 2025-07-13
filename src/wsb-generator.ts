import type { WSBConfig } from "./types.ts";

function generateMappedFolderXml(
  folder: { hostFolder: string; sandboxFolder: string; readOnly: boolean },
): string {
  return `    <MappedFolder>
      <HostFolder>${folder.hostFolder}</HostFolder>
      <SandboxFolder>${folder.sandboxFolder}</SandboxFolder>
      <ReadOnly>${folder.readOnly}</ReadOnly>
    </MappedFolder>`;
}

function generateMappedFoldersSection(
  mappedFolders?: WSBConfig["mappedFolders"],
): string {
  if (!mappedFolders || mappedFolders.length === 0) {
    return "";
  }

  const foldersXml = mappedFolders.map(generateMappedFolderXml).join("\n");
  return `  <MappedFolders>
${foldersXml}
  </MappedFolders>`;
}

function generateLogonCommandSection(
  logonCommand?: WSBConfig["logonCommand"],
): string {
  if (!logonCommand) {
    return "";
  }

  return `  <LogonCommand>
    <Command>${logonCommand.command}</Command>
  </LogonCommand>`;
}

export function generateWSBContent(config: WSBConfig): string {
  const mappedFoldersSection = generateMappedFoldersSection(
    config.mappedFolders,
  );
  const logonCommandSection = generateLogonCommandSection(config.logonCommand);

  return `<Configuration>
  <vGPU>${config.vGPU}</vGPU>
  <Networking>${config.networking}</Networking>
${mappedFoldersSection}
${logonCommandSection}
  <AudioInput>${config.audioInput}</AudioInput>
  <VideoInput>${config.videoInput}</VideoInput>
  <ProtectedClient>${config.protectedClient}</ProtectedClient>
  <PrintScreen>${config.printScreen}</PrintScreen>
  <ClipboardRedirection>${config.clipboardRedirection}</ClipboardRedirection>
  <MemoryInMB>${config.memoryInMB}</MemoryInMB>
</Configuration>`;
}
