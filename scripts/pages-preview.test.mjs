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
  data.pages.sections[0].alignment = "right";
  data.pages.sections[0].decoration = {
    border: {
      edges: ["right"],
      style: "dashed",
      weight: "medium",
      color: "accent",
    },
    rules: {
      top: true,
      bottom: true,
      style: "dotted",
      weight: "thin",
      color: "muted",
      spacing: "small",
    },
  };
  data.pages.sections[1].verticalAlignment = "end";
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
  assert.ok(html.includes("align-right"));
  assert.ok(html.includes("columns-bottom"));
  assert.ok(
    html.includes("border-right:2px dashed var(--color-accent-on-light)"),
  );
  assert.ok((html.match(/class="section-rule"/g) || []).length >= 2);
  assert.ok(html.includes("width-content"));
  assert.ok(!html.includes("arbitrary-css-is-not-allowed"));
  data.pages.sections[1].items[0].sections[0].heading =
    "An edited column heading";
  const nested = await render(data);
  assert.ok(nested.includes("An edited column heading"));
  assert.ok(!nested.includes("Many interests, one life."));
  data.pages.sections = data.pages.sections.slice(2);
  const removed = await render(data);
  assert.ok(!removed.includes("Many interests, one life."));
  assert.ok(!removed.includes("A place to return to."));
  assert.ok(removed.includes("New editable content"));
  const homeEndpoint =
    "http://127.0.0.1:4335/tina-island/page?relativePath=home.json";
  const homePrime = await fetch(homeEndpoint, {
    method: "POST",
    headers: { ...headers, "X-Tina-Prime": "1" },
    body: "{}",
  });
  const homeRaw = (await homePrime.text()).match(
    /data-tina-form="([^"]+)"/,
  )?.[1];
  assert.ok(homeRaw);
  const home = JSON.parse(
    homeRaw
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&"),
  );
  home.data.pages.hero.body = {
    type: "root",
    children: [
      {
        type: "img",
        url: "/shelbz-website-project.png",
        alt: "Rich image",
        caption: "Rich-text artist credit",
        children: [{ text: "" }],
      },
    ],
  };
  home.data.pages.hero.imageCredit = "Hero art by <Example Artist> & Studio";
  home.data.pages.sections[0].items[0].sections[0].imageCredit =
    "Nested screenshot credit";
  home.data.pages.sections.push({
    __typename: "PagesLandingSectionsCardGrid",
    cards: [
      {
        image: "/shelbz-website-project.png",
        imageCredit: "Card image credit",
      },
    ],
  });
  home.data.pages.hero.heading = "Unsaved Hero heading";
  home.data.pages.hero.intro = "Unsaved Hero introduction";
  home.data.pages.heading = "Obsolete page heading";
  home.data.pages.intro = "Obsolete page introduction";
  const homeResponse = await fetch(homeEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ [home.id]: home.data }),
  });
  assert.equal(homeResponse.status, 200);
  const heroHTML = await homeResponse.text();
  assert.ok(heroHTML.includes("Unsaved Hero heading"));
  assert.ok(
    heroHTML.includes("Hero art by &lt;Example Artist&gt; &amp; Studio"),
  );
  assert.ok(heroHTML.includes("Nested screenshot credit"));
  assert.ok(heroHTML.includes("Card image credit"));
  assert.ok(heroHTML.includes("Rich-text artist credit"));
  assert.ok(heroHTML.includes('aria-label="Show image credit"'));
  assert.match(heroHTML, /<span\b[^>]*role="tooltip"[^>]*\bhidden(?:\s|>)/);
  assert.ok(heroHTML.includes("hero.imageCredit"));
  assert.ok(heroHTML.includes("Unsaved Hero introduction"));
  assert.ok(!heroHTML.includes("Obsolete page heading"));
  assert.ok(!heroHTML.includes("Obsolete page introduction"));
  assert.equal((heroHTML.match(/<h1\b/g) || []).length, 1);
  for (const path of ["../config/site-theme.json", "missing.json"]) {
    const response = await fetch(
      `http://127.0.0.1:4335/tina-island/page?relativePath=${encodeURIComponent(path)}`,
      { method: "POST", headers, body: "{}" },
    );
    assert.notEqual(response.status, 200);
  }
});
