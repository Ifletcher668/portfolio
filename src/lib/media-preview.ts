/** Recover only this project's CDN images that exist in the deployed public assets.
 * Unknown/new uploads remain on Tina's CDN so their unsaved preview stays intact.
 */
export function tinaImageFallback(
  value: string | null,
  projectId: string | undefined,
  publicImages: readonly string[],
): string | undefined {
  if (!value || !projectId) return;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "assets.tina.io" ||
      url.port ||
      url.username ||
      url.password
    )
      return;
    const prefix = `/${projectId}/`;
    if (!url.pathname.startsWith(prefix)) return;
    let path = url.pathname.slice(prefix.length - 1);
    if (path.startsWith("/__staging/")) {
      const match = path.match(/^\/__staging\/.+?\/__file(\/.*)$/);
      if (!match) return;
      path = match[1];
    }
    path = decodeURIComponent(path);
    if (
      path.includes("\\") ||
      path.includes("\0") ||
      path.split("/").some((part) => part === ".." || part === ".") ||
      path.startsWith("//")
    )
      return;
    return publicImages.includes(path) ? path : undefined;
  } catch {
    return;
  }
}
