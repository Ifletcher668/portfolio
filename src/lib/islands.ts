import type { IslandRegistry } from "@tinacms/astro/experimental";
import HomepageIntro from "../components/HomepageIntro.astro";
import { getHomepage } from "./homepage";

export const islands: IslandRegistry = {
  homepage: {
    fetch: () => getHomepage(),
    component: HomepageIntro,
    wrapper: { tag: "div", className: "homepage-editor" },
    propsFromData: (result) => ({
      data: (result as Awaited<ReturnType<typeof getHomepage>>).data.homepage,
    }),
  },
};
