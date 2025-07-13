import { assertEquals } from "@std/assert";
import { escapePowerShell, escapeXml } from "./template-engine.ts";

Deno.test("escapeXml should escape XML special characters", () => {
  assertEquals(escapeXml("Hello & <World>"), "Hello &amp; &lt;World&gt;");
  assertEquals(escapeXml('He said "Hello"'), "He said &quot;Hello&quot;");
  assertEquals(escapeXml("It's a 'test'"), "It&apos;s a &apos;test&apos;");
  assertEquals(escapeXml("Normal text"), "Normal text");
  assertEquals(escapeXml(""), "");
});

Deno.test("escapePowerShell should escape PowerShell special characters", () => {
  assertEquals(escapePowerShell("Hello `world`"), "Hello ``world``");
  assertEquals(escapePowerShell("$variable"), "`$variable");
  assertEquals(escapePowerShell('He said "hello"'), 'He said `"hello`"');
  assertEquals(escapePowerShell("It's a test"), "It''s a test");
  assertEquals(escapePowerShell("Normal text"), "Normal text");
  assertEquals(escapePowerShell(""), "");
});

Deno.test("escapeXml should handle multiple special characters", () => {
  assertEquals(
    escapeXml('<tag attr="value">content & more</tag>'),
    "&lt;tag attr=&quot;value&quot;&gt;content &amp; more&lt;/tag&gt;",
  );
});

Deno.test("escapePowerShell should handle multiple special characters", () => {
  assertEquals(
    escapePowerShell('$env:PATH = "C:\\bin"; echo `$env:PATH`'),
    '`$env:PATH = `"C:\\bin`"; echo ```$env:PATH``',
  );
});
