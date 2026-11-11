import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { themeCSS } from "../src/lib/theme-css.ts";
import defaults from "../content/config/site-theme.json" with { type: "json" };

test("palette edits and role assignments reach the global stylesheet", () => {
  const css = themeCSS({ palette: { blue: "#123456" }, roles: { bg: "blue" } });
  assert.ok(css.includes("--palette-blue:#123456;"));
  assert.ok(css.includes("--color-bg:var(--palette-blue);"));
  assert.ok(css.includes(`--palette-green:${defaults.palette.green};`));
});

test("invalid colors, unknown roles and CSS injection fall back safely", () => {
  const css = themeCSS({
    palette: { green: "</style><script>alert(1)</script>", extra: "#123456" },
    roles: { bg: "red);}</style>", extra: "blue" },
  });
  assert.ok(!css.includes("<"));
  assert.ok(!css.includes("extra"));
  assert.ok(css.includes(`--palette-green:${defaults.palette.green};`));
  assert.ok(css.includes(`--color-bg:var(--palette-${defaults.roles.bg});`));
});

test("every built public route includes the CMS theme island", async () => {
  let routes = 0;
  async function inspect(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (
        entry.isDirectory() &&
        entry.name !== "admin" &&
        entry.name !== "_astro"
      )
        await inspect(path);
      else if (entry.name === "index.html") {
        const html = await readFile(path, "utf8");
        assert.ok(html.includes('data-tina-island="/tina-island/theme"'), path);
        assert.ok(html.includes(themeCSS(defaults)), path);
        routes++;
      }
    }
  }
  await inspect("dist/client");
  assert.equal(routes, 14);
});

test("Config stays browsable with only the Site Theme document", async () => {
  const { createRequire } = await import("node:module");
  const vm = await import("node:vm");
  const schema = JSON.parse(
    await readFile("tina/tina-lock.json", "utf8"),
  ).schema;
  const config = schema.collections.find(
    (collection) => collection.name === "config",
  );
  assert.equal(config.label, "Config");
  assert.equal(config.templates[0].name, defaults._template);
  assert.equal(config.templates[0].label, defaults.title);
  const source = await readFile(
    createRequire(import.meta.url).resolve("tinacms"),
    "utf8",
  );
  const start = source.indexOf("const shouldAutoOpenCollectionDocument =");
  const end = source.indexOf("const UnableToLoadModal", start);
  assert.ok(start >= 0 && end > start);
  const context = vm.createContext({});
  vm.runInContext(
    source.slice(start, end) +
      "\nthis.autoOpen = shouldAutoOpenCollectionDocument;",
    context,
  );
  const singleton = {
    collection: {
      documents: { edges: [{ node: { __typename: "ConfigSiteTheme" } }] },
    },
    folder: { fullyQualifiedName: "~" },
  };
  assert.equal(
    context.autoOpen({ ...singleton, allowCreate: false, allowDelete: false }),
    true,
  );
  assert.equal(
    context.autoOpen({
      ...singleton,
      allowCreate: config.ui.allowedActions.create,
      allowDelete: config.ui.allowedActions.delete,
    }),
    false,
  );
});
