import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { once } from "node:events";
import vm from "node:vm";

// Exercise the installed bridge against actual form payloads from the built
// island endpoints: menu intent must win regardless of form registration order.
test("shared preview selects the requested document in either registration order", async (t) => {
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
    forms.push({ name, raw: decoded, id: JSON.parse(decoded).id });
  }
  const page = await readFile("dist/client/index.html", "utf8");
  assert.ok(!/<div[^>]*data-tina-island-primary/.test(page));
  const selectionScript = page.match(
    /<script[^>]*data-tina-document-selection[^>]*>([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(
    selectionScript,
    "Selection must execute inline before bridge initialization",
  );
  const require = createRequire(import.meta.url);
  const source = await readFile(require.resolve("@tinacms/bridge"), "utf8");
  for (const selected of [null, "theme", "homepage", "unknown"]) {
    for (const order of [forms, [...forms].reverse()]) {
      const messages = [];
      const parent = { postMessage: (message) => messages.push(message) };
      const primary = new Set();
      // Mirror primeIsland's documented transfer from the island primary marker
      // to its fetched form payload. The payloads themselves come from the server.
      const payloads = order.map((form) => ({
        getAttribute: () => form.raw,
        hasAttribute: () => primary.has(form.name),
      }));
      const context = vm.createContext({
        URLSearchParams,
        window: {
          self: {},
          top: parent,
          parent,
          location: {
            origin: "http://localhost",
            search: selected ? `?tina-document=${selected}` : "",
          },
          addEventListener() {},
        },
        document: {
          addEventListener() {},
          querySelector: (selector) => {
            if (selector === "[data-tina-form]") return payloads[0];
            const name = selector.match(/tina-island\/(theme|homepage)/)?.[1];
            return name ? { setAttribute: () => primary.add(name) } : null;
          },
          querySelectorAll: (selector) =>
            selector === "[data-tina-form]" ? payloads : [],
        },
        console: { log() {} },
        setTimeout: () => 1,
        clearTimeout() {},
      });
      vm.runInContext(selectionScript, context);
      vm.runInContext(
        source.replace(/export\s*\{[^}]*\};?\s*$/, "") +
          "\nthis.run = { init, refreshForms };",
        context,
      );
      context.run.init();
      context.run.refreshForms();
      const announced = messages.filter((message) => message.type === "open");
      assert.equal(new Set(announced.map((message) => message.id)).size, 2);
      const selections = messages.filter(
        (message) => message.type === "user-select-form",
      );
      if (selected === "theme" || selected === "homepage") {
        assert.ok(selections.length > 0);
        assert.ok(
          selections.every(
            (message) =>
              message.formId ===
              forms.find((form) => form.name === selected).id,
          ),
        );
      } else assert.equal(selections.length, 0);
    }
  }
});
