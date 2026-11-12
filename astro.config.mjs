import { readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import netlify from "@astrojs/netlify";
import node from "@astrojs/node";
import tina from "@tinacms/astro/integration";
import { tinaAdminDevRedirect } from "@tinacms/astro/vite";

// Build a filename-only manifest; no media bytes are bundled into the browser.
function publicImages(directory = "public", prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${prefix}/${entry.name}`;
    return entry.isDirectory()
      ? publicImages(join(directory, entry.name), path)
      : /\.(png|jpe?g|webp|gif|avif|svg|ico|bmp|tiff?)$/i.test(entry.name)
        ? [path]
        : [];
  });
}

// https://astro.build/config
export default defineConfig({
  site: "https://isiahfletcher.com",
  output: "static",
  // Use a portable Node server locally; production uses Netlify Functions.
  adapter: process.env.NETLIFY ? netlify() : node({ mode: "standalone" }),
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        new URL(page).pathname.replace(/\/$/, "") !== "/theme-preview",
    }),
    tina(),
  ],
  vite: {
    define: { __PUBLIC_IMAGE_PATHS__: JSON.stringify(publicImages()) },
    plugins: [tinaAdminDevRedirect()],
    ssr: { noExternal: ["@tinacms/astro", "@tinacms/bridge"] },
  },
});
