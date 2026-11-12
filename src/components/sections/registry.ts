import Columns from "./Columns.astro";
import RichText from "./RichText.astro";
import TextImage from "./TextImage.astro";
import CardGrid from "./CardGrid.astro";
import Video from "./Video.astro";
import Feed from "./Feed.astro";
export const sectionRenderers = {
  columns: Columns,
  richText: RichText,
  textImage: TextImage,
  cardGrid: CardGrid,
  video: Video,
  feed: Feed,
};
export type SectionKind = keyof typeof sectionRenderers;
export function sectionKind(typename?: string): SectionKind | undefined {
  const name = typename?.replace(/^Pages.*Sections/, "");
  const key = name ? name[0].toLowerCase() + name.slice(1) : "";
  return Object.hasOwn(sectionRenderers, key)
    ? (key as SectionKind)
    : undefined;
}
