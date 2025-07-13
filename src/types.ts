export interface WSBConfig {
  vGPU: string;
  networking: string;
  mappedFolders?: Array<{
    hostFolder: string;
    sandboxFolder: string;
    readOnly: boolean;
  }>;
  logonCommand?: {
    command: string;
  };
  audioInput: string;
  videoInput: string;
  protectedClient: string;
  printScreen: string;
  clipboardRedirection: string;
  memoryInMB: string;
}
