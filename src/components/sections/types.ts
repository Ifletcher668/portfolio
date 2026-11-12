import type { Decoration } from "../../lib/section-decoration";
import type { TinaMarkdownContent } from "tinacms/dist/rich-text";
/** Shared section contract used by schema-backed renderers. */
export type CardData = {
  __typename?: string;
  eyebrow?: string | null;
  heading?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  body?: TinaMarkdownContent | null;
  linkLabel?: string | null;
  linkUrl?: string | null;
};
export type SectionData = CardData & {
  decoration?: Decoration | null;
  headingStyle?: string | null;
  verticalAlignment?: string | null;
  gap?: string | null;
  items?:
    | ({
        __typename?: string;
        label?: string | null;
        sections?: (SectionData | null)[] | null;
      } | null)[]
    | null;
  anchor?: string | null;
  label?: string | null;
  width?: string | null;
  spacingTop?: string | null;
  spacingBottom?: string | null;
  alignment?: string | null;
  background?: string | null;
  imageSide?: string | null;
  imageRatio?: string | null;
  columns?: string | null;
  cards?: (CardData | null)[] | null;
  url?: string | null;
  caption?: string | null;
  source?: string | null;
  limit?: number | null;
  presentation?: string | null;
  fallbackText?: string | null;
  fallbackUrl?: string | null;
  fallbackLabel?: string | null;
};
