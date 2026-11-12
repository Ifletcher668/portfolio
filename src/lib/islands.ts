import ThemeStyle from "../components/ThemeStyle.astro";
import PageContent from "../components/PageContent.astro";
import { getTheme } from "./theme";
import { getPage, getPageFeeds } from "./pages";
import type { IslandRegistry } from "@tinacms/astro/experimental";

async function fetchPage(relativePath: string) {
  const result = await getPage(relativePath);
  return { result, feeds: await getPageFeeds(result.data.pages) };
}
export const islands: IslandRegistry = {
  theme: {
    fetch: () => getTheme(),
    component: ThemeStyle,
    wrapper: { tag: "div", className: "site-theme" },
    propsFromData: (result) => ({
      data: (result as Awaited<ReturnType<typeof getTheme>>).data.config,
    }),
  },
  page: {
    fetch: (_request, params) =>
      fetchPage(params.get("relativePath") || "home.json"),
    component: PageContent,
    wrapper: { tag: "div", className: "page-editor" },
    propsFromData: (value) => {
      const { result, feeds } = value as Awaited<ReturnType<typeof fetchPage>>;
      return { data: result.data.pages, feeds };
    },
  },
};
