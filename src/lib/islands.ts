import ThemeStyle from "../components/ThemeStyle.astro";
import { getTheme } from "./theme";
import type { IslandRegistry } from "@tinacms/astro/experimental";
import HomepageIntro from "../components/HomepageIntro.astro";
import { getHomepage } from "./homepage";

export const islands: IslandRegistry = {
  theme: {
    fetch: () => getTheme(),
    component: ThemeStyle,
    wrapper: { tag: "div", className: "site-theme" },
    propsFromData: (result) => ({
      data: (result as Awaited<ReturnType<typeof getTheme>>).data.config,
    }),
  },
  homepage: {
    fetch: () => getHomepage(),
    component: HomepageIntro,
    wrapper: { tag: "div", className: "homepage-editor" },
    propsFromData: (result) => ({
      data: (result as Awaited<ReturnType<typeof getHomepage>>).data.homepage,
    }),
  },
};
