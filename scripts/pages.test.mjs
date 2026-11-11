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
    assert.notEqual(first.items[0].sections[0].treatment, "panel");
    assert.equal(first.items[1].sections[0].treatment, "panel");
  }
});
