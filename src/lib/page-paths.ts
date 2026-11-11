/** A document's relative path is its canonical URL; only home.json maps to /. */
export function pageUrl(relativePath: string): string {
  if (
    !/^(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(
      relativePath,
    )
  ) {
    throw new Error(`Invalid page path: ${relativePath}`);
  }
  return relativePath === "home.json" ? "/" : `/${relativePath.slice(0, -5)}`;
}
export function assertAvailablePagePath(
  relativePath: string,
  reserved: string[],
) {
  const url = pageUrl(relativePath);
  const first = url.split("/")[1];
  if (
    ["admin", "tina-island", "theme-preview", "api", "uploads"].includes(
      first,
    ) ||
    reserved.includes(url)
  ) {
    throw new Error(
      `Page ${relativePath} conflicts with reserved route ${url}`,
    );
  }
  return url;
}

export function publishedPages<
  T extends { relativePath: string; draft?: boolean },
>(documents: T[], reserved: string[]) {
  // Validate drafts too, so publishing cannot reveal a latent route collision.
  return documents
    .map((document) => ({
      ...document,
      url: assertAvailablePagePath(document.relativePath, reserved),
    }))
    .filter((document) => document.draft === false);
}
