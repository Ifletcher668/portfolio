import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import netlify from "@astrojs/netlify";
import node from "@astrojs/node";
import tina from "@tinacms/astro/integration";
import { tinaAdminDevRedirect } from "@tinacms/astro/vite";

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
    plugins: [tinaAdminDevRedirect()],
    ssr: { noExternal: ["@tinacms/astro", "@tinacms/bridge"] },
  },
});
