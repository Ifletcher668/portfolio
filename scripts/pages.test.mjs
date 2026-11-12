import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import {
  pageUrl,
  assertAvailablePagePath,
  publishedPages,
} from "../src/lib/page-paths.ts";
import { videoEmbed } from "../src/lib/video.ts";

test("nested paths are canonical and cannot collide with infrastructure or authored pages", () => {
  assert.equal(pageUrl("home.json"), "/");
  assert.equal(
    pageUrl("guides/getting-started.json"),
    "/guides/getting-started",
  );
  assert.equal(
    assertAvailablePagePath("music/new-record.json", ["/music/aterrima"]),
    "/music/new-record",
  );
  for (const path of [
    "../secret.json",
    "About.json",
    "a//b.json",
    "a%2fb.json",
    "a.json.json",
    "a/../b.json",
    "index.json/",
  ])
    assert.throws(() => pageUrl(path));
  for (const path of [
    "admin/test.json",
    "tina-island/page.json",
    "theme-preview.json",
    "work.json",
    "music/aterrima.json",
  ])
    assert.throws(() =>
      assertAvailablePagePath(path, ["/work", "/music/aterrima"]),
    );
});
test("drafts and missing publication state never become public routes", () => {
  const docs = [
    { relativePath: "guides/start.json", draft: false },
    { relativePath: "draft.json", draft: true },
    { relativePath: "missing.json" },
  ];
  assert.deepEqual(
    publishedPages(docs, []).map((page) => page.url),
    ["/guides/start"],
  );
  assert.throws(() =>
    publishedPages([{ relativePath: "admin/secret.json", draft: true }], []),
  );
});
test("video embeds accept supported providers and reject arbitrary iframe destinations", () => {
  for (const url of [
    "https://youtu.be/lc_rCn2em8o",
    "https://www.youtube.com/watch?v=lc_rCn2em8o",
    "https://www.youtube-nocookie.com/embed/lc_rCn2em8o",
  ])
    assert.equal(
      videoEmbed(url),
      "https://www.youtube-nocookie.com/embed/lc_rCn2em8o",
    );
  assert.equal(
    videoEmbed("https://vimeo.com/123456"),
    "https://player.vimeo.com/video/123456",
  );
  for (const url of [
    "javascript:alert(1)",
    "https://example.com/embed/123",
    "https://youtube.com.evil.test/watch?v=lc_rCn2em8o",
    "http://youtu.be/lc_rCn2em8o",
    "https://youtu.be/invalid",
  ])
    assert.equal(videoEmbed(url), undefined);
});
test("all templates offer the same independent section library", async () => {
  const schema = JSON.parse(
    await readFile("tina/tina-lock.json", "utf8"),
  ).schema;
  const pages = schema.collections.find(
    (collection) => collection.name === "pages",
  );
  assert.deepEqual(
    pages.templates.map((template) => template.name),
    ["landing", "interior", "writing"],
  );
  for (const template of pages.templates) {
    const sections = template.fields.find((field) => field.name === "sections");
    assert.equal(sections.list, true);
    assert.deepEqual(
      sections.templates.map((section) => section.name),
      ["richText", "textImage", "cardGrid", "video", "feed", "columns"],
    );
    assert.ok(
      !template.fields.some((field) =>
        ["video", "feed", "substack"].includes(field.name),
      ),
    );
  }
  assert.ok(
    !schema.collections.some((collection) => collection.name === "homepage"),
  );
});
test("migrated saved pages retain rich content, media, and editable page islands", async () => {
  const expected = {
    "": [
      "Hi, I'm Isiah.",
      "I work in software engineering",
      "Drumming has taken me",
      "youtube-nocookie.com/embed/lc_rCn2em8o",
      "drummer-bubs-transparent.png",
    ],
    about: [
      "I like learning how things work",
      "Fantasy, literature, philosophy",
      "A place to return to.",
    ],
    code: [
      "My work has focused on frontend engineering",
      "shelbz-website-project.png",
      "/work",
    ],
    music: [
      "I performed and toured",
      "/music/aterrima",
      "/music/weald-and-woe",
    ],
    writing: [
      "On Substack, I've shared essays",
      "Some of my poems",
      "From Substack",
    ],
  };
  for (const [slug, strings] of Object.entries(expected)) {
    const rawHtml = await readFile(
      `dist/client/${slug ? slug + "/" : ""}index.html`,
      "utf8",
    );
    const html = rawHtml.replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    assert.ok(!html.includes("[object Object]"), slug);
    assert.match(html, /data-tina-island="\/tina-island\/page\?relativePath=/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    for (const value of strings)
      assert.ok(html.includes(value), `${slug}: missing ${value}`);
  }
  const sitemap = await readFile("dist/client/sitemap-0.xml", "utf8");
  assert.ok(!sitemap.includes("theme-preview"));
  for (const file of await readdir("content/pages")) {
    const page = JSON.parse(await readFile(`content/pages/${file}`, "utf8"));
    assert.equal(page.draft, false);
  }
});

test("unavailable and non-public feed inputs produce an empty fallback", async () => {
  const { getFeed } = await import("../src/lib/feeds.ts");
  for (const source of [
    "http://example.com/rss",
    "https://localhost/rss",
    "https://127.0.0.1/rss",
    "https://[::1]/rss",
    "https://user:pass@example.com/rss",
  ])
    assert.deepEqual(await getFeed(source), []);
});

test("public IPv4 addresses remain usable when mapped IPv6 addresses are blocked", async () => {
  const { isPublicFeedAddress } = await import("../src/lib/feeds.ts");
  for (const address of ["172.64.150.56", "104.18.37.200", "8.8.8.8"])
    assert.equal(isPublicFeedAddress(address, 4), true);
  assert.equal(isPublicFeedAddress("2606:4700:4401::ac40:9638", 6), true);
  for (const address of [
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.1.1",
  ])
    assert.equal(isPublicFeedAddress(address, 4), false);
  for (const address of ["::1", "fe80::1", "fd00::1", "::ffff:127.0.0.1"])
    assert.equal(isPublicFeedAddress(address, 6), false);
});

test("migration preserves paired media, split editorial content and open-text interiors", async () => {
  const home = JSON.parse(await readFile("content/pages/home.json", "utf8"));
  const features = home.sections[0];
  assert.equal(features._template, "columns");
  assert.equal(features.columns, "2");
  assert.deepEqual(
    features.items.map((item) => item.sections[0]._template),
    ["textImage", "video"],
  );
  const writing = home.sections[1];
  assert.equal(writing.background, "light");
  assert.deepEqual(
    writing.items.map((item) => item.sections[0]._template),
    ["richText", "feed"],
  );
  for (const name of ["about", "code", "music", "writing"]) {
    const page = JSON.parse(
      await readFile(`content/pages/${name}.json`, "utf8"),
    );
    assert.equal(page.introWidth, "content");
    const first = page.sections[0];
    assert.equal(first._template, "columns");
    assert.notEqual(first.items[0].sections[0].decoration?.padding, "medium");
    assert.equal(first.items[1].sections[0].decoration?.padding, "medium");
  }
});

test("Landing owns visible introductory content exclusively through Hero", async () => {
  const schema = JSON.parse(
    await readFile("tina/tina-lock.json", "utf8"),
  ).schema;
  const templates = schema.collections.find(
    (item) => item.name === "pages",
  ).templates;
  const landing = templates.find((item) => item.name === "landing");
  for (const key of ["eyebrow", "heading", "intro"])
    assert.ok(!landing.fields.some((field) => field.name === key));
  const hero = landing.fields.find((field) => field.name === "hero");
  for (const key of ["eyebrow", "heading", "intro", "body"])
    assert.ok(hero.fields.some((field) => field.name === key));
  assert.ok(!hero.fields.some((field) => field.name === "lead"));
  for (const template of templates.filter((item) => item.name !== "landing"))
    assert.ok(template.fields.some((field) => field.name === "heading"));
});

test("editor exposes independent embellishments and both alignment axes", async () => {
  const schema = JSON.parse(
    await readFile("tina/tina-lock.json", "utf8"),
  ).schema;
  const sections = schema.collections
    .find((item) => item.name === "pages")
    .templates[0].fields.find((field) => field.name === "sections").templates;
  for (const section of sections) {
    assert.ok(
      !section.fields.some((field) =>
        ["treatment", "divider"].includes(field.name),
      ),
    );
    assert.deepEqual(
      section.fields.find((field) => field.name === "alignment").options,
      ["left", "center", "right"],
    );
    const decoration = section.fields.find(
      (field) => field.name === "decoration",
    );
    for (const key of ["padding", "radius", "shadow", "border", "rules"])
      assert.ok(decoration.fields.some((field) => field.name === key));
  }
  const vertical = sections
    .find((item) => item.name === "columns")
    .fields.find((field) => field.name === "verticalAlignment");
  assert.deepEqual(vertical.options, [
    { value: "start", label: "Top" },
    { value: "center", label: "Center" },
    { value: "end", label: "Bottom" },
  ]);
});

test("border and rule CSS accepts theme-based options and rejects arbitrary CSS", async () => {
  const { decorationStyle, ruleStyle } =
    await import("../src/lib/section-decoration.ts");
  const decoration = {
    padding: "small",
    radius: "large",
    shadow: "soft",
    border: {
      edges: ["top", "right"],
      style: "dashed",
      weight: "medium",
      color: "accent",
      accentEdge: "left",
      accentWeight: "thick",
      accentColor: "strong",
    },
  };
  const css = decorationStyle(decoration, true);
  assert.ok(css.includes("border-top:2px dashed var(--color-accent-on-light)"));
  assert.ok(css.includes("border-left:3px dashed var(--color-rule-on-light)"));
  assert.ok(css.includes("padding:var(--space-5)"));
  assert.ok(!css.includes("border-bottom"));
  const bad = decorationStyle({
    padding: "999px; color:red",
    border: {
      edges: ["top;color:red"],
      style: "url(evil)",
      weight: "500px",
      color: "red; color:red",
      accentEdge: "left; color:red",
    },
  });
  assert.ok(!bad.includes("red"));
  assert.ok(!bad.includes("evil"));
  assert.ok(!bad.includes("999"));
  assert.ok(
    ruleStyle(
      { style: "dotted", weight: "thick", color: "link", spacing: "large" },
      "bottom",
    ).includes("margin:var(--gap-section) 0 0"),
  );
});

test("content migration preserves saved copy and is safe to rerun", async () => {
  const { migratePage } = await import("./migrations/page-editor-controls.mjs");
  const old = {
    _template: "landing",
    title: "SEO title",
    eyebrow: "Greeting",
    heading: "A hero heading",
    intro: "",
    hero: { lead: "A lead", body: "Saved editor copy", treatment: "plain" },
    sections: [
      {
        _template: "columns",
        divider: true,
        items: [
          {
            sections: [
              {
                _template: "richText",
                treatment: "outline",
                body: "Nested saved copy",
              },
            ],
          },
        ],
      },
    ],
  };
  const migrated = migratePage(structuredClone(old));
  assert.equal(migrated.hero.heading, "A hero heading");
  assert.equal(migrated.hero.intro, "A lead");
  assert.equal(migrated.hero.body, "Saved editor copy");
  assert.equal(migrated.sections[0].decoration.rules.top, true);
  assert.deepEqual(
    migrated.sections[0].items[0].sections[0].decoration.border.edges,
    ["top", "right", "bottom", "left"],
  );
  assert.equal(
    migrated.sections[0].items[0].sections[0].body,
    "Nested saved copy",
  );
  assert.deepEqual(migratePage(structuredClone(migrated)), migrated);
});

test("saved local page images exist under the configured public media root", async () => {
  const { access } = await import("node:fs/promises");
  const inspect = async (value) => {
    if (!value || typeof value !== "object") return;
    if (typeof value.image === "string" && value.image.startsWith("/"))
      await access(`public${value.image}`);
    for (const child of Object.values(value)) {
      if (Array.isArray(child)) for (const item of child) await inspect(item);
      else await inspect(child);
    }
  };
  for (const file of await readdir("content/pages"))
    await inspect(JSON.parse(await readFile(`content/pages/${file}`, "utf8")));
  const schema = JSON.parse(
    await readFile("tina/tina-lock.json", "utf8"),
  ).schema;
  assert.equal(schema.config.media.tina.mediaRoot, "");
});
