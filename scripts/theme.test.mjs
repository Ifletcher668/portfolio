import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { themeCSS } from "../src/lib/theme-css.ts";
import defaults from "../content/theme/site.json" with { type: "json" };

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
