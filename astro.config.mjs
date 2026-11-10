import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import netlify from "@astrojs/netlify";
import tina from "@tinacms/astro/integration";
import { tinaAdminDevRedirect } from "@tinacms/astro/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://isiahfletcher.com",
  output: "static",
  adapter: netlify(),
  integrations: [mdx(), sitemap(), tina()],
  vite: {
    plugins: [tinaAdminDevRedirect()],
    ssr: { noExternal: ["@tinacms/astro", "@tinacms/bridge"] },
  },
});
