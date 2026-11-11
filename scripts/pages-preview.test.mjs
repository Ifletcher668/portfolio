import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";

test("unsaved page overlays add, reorder, remove and configure independent sections", async (t) => {
  const server = spawn(process.execPath, ["dist/server/entry.mjs"], {
    env: { ...process.env, HOST: "127.0.0.1", PORT: "4335" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => server.kill());
  await Promise.race([
    once(server.stdout, "data"),
    once(server, "exit").then(([code]) => {
      throw new Error(`Preview server exited: ${code}`);
    }),
  ]);
  const endpoint =
    "http://127.0.0.1:4335/tina-island/page?relativePath=about.json";
  const headers = {
    "Content-Type": "application/x-tina-preview+json",
    Origin: "http://127.0.0.1:4335",
  };
  const prime = await fetch(endpoint, {
    method: "POST",
    headers: { ...headers, "X-Tina-Prime": "1" },
    body: "{}",
  });
  assert.equal(prime.status, 200);
  const raw = (await prime.text()).match(/data-tina-form="([^"]+)"/)?.[1];
  assert.ok(raw);
  const form = JSON.parse(
    raw
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&"),
  );
  const data = structuredClone(form.data);
  data.pages.heading = "Unsaved page heading";
  data.pages.sections.reverse();
  data.pages.sections[0].background = "light";
  data.pages.sections[0].width = "arbitrary-css-is-not-allowed";
  data.pages.sections.push({
    __typename: "PagesInteriorSectionsRichText",
    heading: "A newly added section",
    body: {
      type: "root",
      children: [
        {
          type: "p",
          children: [{ type: "text", text: "New editable content" }],
        },
      ],
    },
  });
  const render = async (data) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ [form.id]: data }),
    });
    assert.equal(response.status, 200);
    return response.text();
  };
  const html = await render(data);
  assert.ok(html.includes("Unsaved page heading"));
  assert.ok(
    html.indexOf("A place to return to.") <
      html.indexOf("Many interests, one life."),
  );
  assert.ok(html.includes("A newly added section"));
  assert.ok(html.includes("New editable content"));
  assert.ok(html.includes("background-light"));
  assert.ok(html.includes("width-content"));
  assert.ok(!html.includes("arbitrary-css-is-not-allowed"));
  data.pages.sections = data.pages.sections.slice(2);
  const removed = await render(data);
  assert.ok(!removed.includes("Many interests, one life."));
  assert.ok(!removed.includes("A place to return to."));
  assert.ok(removed.includes("New editable content"));
  for (const path of ["../config/site-theme.json", "missing.json"]) {
    const response = await fetch(
      `http://127.0.0.1:4335/tina-island/page?relativePath=${encodeURIComponent(path)}`,
      { method: "POST", headers, body: "{}" },
    );
    assert.notEqual(response.status, 200);
  }
});
