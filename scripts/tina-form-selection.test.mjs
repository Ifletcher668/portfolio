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
  const rootPage = await readFile("dist/client/index.html", "utf8");
  assert.match(
    rootPage,
    /data-tina-island="\/tina-island\/homepage"[^>]*data-tina-island-primary/,
  );
  assert.ok(
    !/data-tina-island="\/tina-island\/theme"[^>]*data-tina-island-primary/.test(
      rootPage,
    ),
  );
  const themeResponse = await fetch(
    "http://127.0.0.1:4334/theme-preview?tina-edit=1",
  );
  assert.equal(themeResponse.status, 200);
  const themePage = await themeResponse.text();
  assert.match(themePage, /content="noindex, follow"/);
  const themePayloads = [
    ...themePage.matchAll(
      /<div data-tina-form="([^\"]+)"( data-tina-primary)?/g,
    ),
  ];
  assert.equal(themePayloads.length, 2);
  const primaryPayload = themePayloads.find((match) => match[2]);
  assert.ok(primaryPayload);
  const primaryId = JSON.parse(
    primaryPayload[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
  ).id;
  assert.equal(primaryId, forms.find((form) => form.name === "theme").id);
  const require = createRequire(import.meta.url);
  const source = await readFile(require.resolve("@tinacms/bridge"), "utf8");
  for (const selected of ["theme", "homepage"]) {
    for (const order of [forms, [...forms].reverse()]) {
      const messages = [];
      const parent = { postMessage: (message) => messages.push(message) };
      const payloads = order.map((form) => ({
        getAttribute: () => form.raw,
        hasAttribute: () => form.name === selected,
      }));
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
            selector === "[data-tina-form]" ? payloads[0] : null,
          querySelectorAll: (selector) =>
            selector === "[data-tina-form]" ? payloads : [],
        },
        console: { log() {} },
        setTimeout: () => 1,
        clearTimeout() {},
      });
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
      assert.ok(selections.length > 0);
      assert.ok(
        selections.every(
          (message) =>
            message.formId === forms.find((form) => form.name === selected).id,
        ),
      );
    }
  }
});
