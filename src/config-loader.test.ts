import { assertEquals, assertRejects } from "@std/assert";
import { ConfigLoader } from "./config-loader.ts";

const configLoader = new ConfigLoader();

Deno.test("ConfigLoader - load preset-based config file", async () => {
  // Create a temporary config file
  const tempFile = "./temp-preset-config.json";
  const configContent = {
    preset: "minimal"
  };
  
  await Deno.writeTextFile(tempFile, JSON.stringify(configContent, null, 2));
  
  try {
    const configFile = await configLoader.loadConfigFile(tempFile);
    assertEquals(configFile.preset, "minimal");
    assertEquals(configFile.config, undefined);
    assertEquals(configFile.components, undefined);
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("ConfigLoader - load component-based config file", async () => {
  const tempFile = "./temp-component-config.json";
  const configContent = {
    components: [
      "firewall.setup",
      {
        component: "firewall.allow",
        params: {
          domains: ["example.com"]
        }
      }
    ]
  };
  
  await Deno.writeTextFile(tempFile, JSON.stringify(configContent, null, 2));
  
  try {
    const configFile = await configLoader.loadConfigFile(tempFile);
    assertEquals(configFile.preset, undefined);
    assertEquals(configFile.config, undefined);
    assertEquals(configFile.components?.length, 2);
    assertEquals(configFile.components?.[0], "firewall.setup");
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("ConfigLoader - load direct config file", async () => {
  const tempFile = "./temp-direct-config.json";
  const configContent = {
    config: {
      firewall: {
        enableGitHubApi: true,
        timeoutSec: 15
      }
    }
  };
  
  await Deno.writeTextFile(tempFile, JSON.stringify(configContent, null, 2));
  
  try {
    const configFile = await configLoader.loadConfigFile(tempFile);
    assertEquals(configFile.preset, undefined);
    assertEquals(configFile.components, undefined);
    assertEquals(configFile.config?.firewall?.enableGitHubApi, true);
    assertEquals(configFile.config?.firewall?.timeoutSec, 15);
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("ConfigLoader - invalid JSON file", async () => {
  const tempFile = "./temp-invalid-config.json";
  await Deno.writeTextFile(tempFile, "{ invalid json }");
  
  try {
    await assertRejects(
      () => configLoader.loadConfigFile(tempFile),
      Error,
      "Invalid JSON in configuration file"
    );
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("ConfigLoader - file not found", async () => {
  await assertRejects(
    () => configLoader.loadConfigFile("./nonexistent-config.json"),
    Error,
    "Configuration file not found"
  );
});

Deno.test("ConfigLoader - invalid config structure", async () => {
  const tempFile = "./temp-invalid-structure.json";
  const configContent = {
    preset: 123  // Should be string
  };
  
  await Deno.writeTextFile(tempFile, JSON.stringify(configContent));
  
  try {
    await assertRejects(
      () => configLoader.loadConfigFile(tempFile),
      Error,
      "preset must be a string"
    );
  } finally {
    await Deno.remove(tempFile);
  }
});