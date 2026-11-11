import { requestWithMetadata } from "@tinacms/astro/data";
import client from "../../tina/__generated__/client";
import { assertAvailablePagePath, pageUrl, publishedPages } from "./page-paths";

const documents = import.meta.glob<{ default: { draft?: boolean } }>(
  "../../content/pages/**/*.json",
  { eager: true },
);
const routes = Object.keys(import.meta.glob("../pages/**/*.{astro,ts,js}"))
  .filter((path) => !path.includes("["))
  .map(
    (path) =>
      path
        .replace(/^\.\.\/pages/, "")
        .replace(/\.(astro|ts|js)$/, "")
        .replace(/\/index$/, "") || "/",
  );
export const pageDocuments = Object.entries(documents).map(([path, module]) => {
  const relativePath = path.replace("../../content/pages/", "");
  return {
    relativePath,
    url: assertAvailablePagePath(relativePath, routes),
    draft: module.default.draft !== false,
  };
});
export const publishedPageDocuments = publishedPages(pageDocuments, routes);
export const getPage = (relativePath: string) => {
  pageUrl(relativePath);
  const document = pageDocuments.find(
    (page) => page.relativePath === relativePath,
  );
  if (!document || document.draft) throw new Error("Page is not published");
  return requestWithMetadata(client.queries.pages({ relativePath }));
};
export type Page = Awaited<ReturnType<typeof getPage>>["data"]["pages"];
export type Section = NonNullable<NonNullable<Page["sections"]>[number]>;

export async function getPageFeeds(data: Page) {
  const { getFeed } = await import("./feeds");
  const sources = [
    ...new Set(
      data.sections?.flatMap((section) =>
        section && "source" in section && section.source
          ? [section.source]
          : [],
      ) || [],
    ),
  ];
  return Object.fromEntries(
    await Promise.all(
      sources.map(async (source) => [source, await getFeed(source)]),
    ),
  );
}
