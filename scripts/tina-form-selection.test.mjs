import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { once } from "node:events";
import vm from "node:vm";

// Exercise the installed bridge against actual form payloads from the built
// island endpoints: neither shared document may select itself on preview load.
test("shared preview announces both forms without overriding editor selection", async (t) => {
  const server = spawn(process.execPath, ["dist/server/entry.mjs"], {
    env: { ...process.env, HOST: "127.0.0.1", PORT: "4334" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => server.kill());
  await Promise.race([
    once(server.stdout, "data"),
    once(server, "exit").then(([code]) => {
      throw new Error(`Preview server exited: ${code}`);
    }),
  ]);
  const forms = [];
  for (const name of ["theme", "homepage"]) {
    const response = await fetch(`http://127.0.0.1:4334/tina-island/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-tina-preview+json",
        "X-Tina-Prime": "1",
        Origin: "http://127.0.0.1:4334",
      },
      body: "{}",
    });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(
      !html.includes("data-tina-primary"),
      `${name} must not force form selection`,
    );
    const raw = html.match(/data-tina-form="([^"]+)"/)?.[1];
    assert.ok(raw, `${name} must still register its editable form`);
    const decoded = raw
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
    JSON.parse(decoded);
    forms.push({ getAttribute: () => decoded, hasAttribute: () => false });
  }
  const page = await readFile("dist/client/index.html", "utf8");
  assert.ok(!page.includes("data-tina-island-primary"));
  const messages = [];
  const parent = { postMessage: (message) => messages.push(message) };
  const require = createRequire(import.meta.url);
  const source = await readFile(require.resolve("@tinacms/bridge"), "utf8");
  const context = vm.createContext({
    window: {
      self: {},
      top: parent,
      parent,
      location: { origin: "http://localhost" },
      addEventListener() {},
    },
    document: {
      addEventListener() {},
      querySelector: (selector) =>
        selector === "[data-tina-form]" ? forms[0] : null,
      querySelectorAll: (selector) =>
        selector === "[data-tina-form]" ? forms : [],
    },
    console: { log() {} },
    setTimeout: () => 1,
    clearTimeout() {},
  });
  // The distributed bridge is self-contained ESM; expose only its entry points.
  vm.runInContext(
    source.replace(/export\s*\{[^}]*\};?\s*$/, "") +
      "\nthis.run = { init, refreshForms };",
    context,
  );
  context.run.init();
  context.run.refreshForms();
  const announced = messages.filter((message) => message.type === "open");
  assert.equal(new Set(announced.map((message) => message.id)).size, 2);
  assert.ok(!messages.some((message) => message.type === "user-select-form"));
});
