# Design tokens

The shared source is `src/styles/tokens.css`, imported once by `global.css`.
Keep the root font size at the browser default so rem values respect reader preferences.

## Three layers

1. Foundations describe available values: `--color-forest`, `--space-4`, font families and sizes.
2. Semantic roles describe purpose: `--color-text`, `--color-surface`, `--gap-prose`.
3. Component relationships describe layout: `--card-padding`, `--gap-job`, `--gap-section-heading`.

Use the role or relationship token in a component. Add a new foundation only when the existing scale cannot express a real design requirement. Responsive values belong in tokens; structural grid breakpoints remain in component styles because CSS custom properties cannot be used in media queries.

## Spacing

The scale is 0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px at a 16px root.
The numeric names are scale indices, not pixel multipliers.

| Relationship | Token | Default size |
| --- | --- | --- |
| Label → supporting text | `--gap-label` | 12px |
| Title → summary | `--gap-title-body` | 16px |
| Paragraph → paragraph | `--gap-prose` | 24px |
| Summary → action | `--gap-action` | 32px minimum |
| Section heading → content | `--gap-section-heading` | 32px |
| Grid gutter | `--gap-grid` | 24–32px |
| Compact page intro gaps | `--gap-intro` | 32–48px |
| Between jobs | `--gap-job` | 48px |
| Between sections | `--gap-section` | 64–96px |
| Compact card inset | `--card-padding-compact` | 24px |
| Editorial card inset | `--card-padding` | 24–48px |
| Page side gutter | `--page-gutter` | 16–24px |

Use one owner for each gap. Avoid parent gap plus child margins for the same relationship. Paragraphs and headings have baseline margins; explicit card rules replace those margins. Essay cards keep a 24px date-to-title gap, 16px title-to-summary gap and at least 32px before the action. Actions align at the bottom of each grid row; text remains naturally sized with no line clamping or fixed card heights.

The résumé uses `compactIntro` on its archive layout: title-to-intro and intro-to-Quick-Hits use `--gap-intro`, half the section gap at every viewport width. Other archive pages retain their existing header spacing.

Quick Hits are top-aligned text groups; do not use `justify-content: space-between`, which changes label-to-description distance based on the other cards' content. Résumé section and job gaps are deliberately larger than the gaps inside a job.

## Typography

- Display: Cormorant Garamond with Georgia/serif fallback; regular weight.
- Body: system sans-serif, 17px equivalent, line-height 1.65.
- Metadata: 14px equivalent; eyebrow labels use 12.16px, weight 600 and .16em tracking.
- Page title: 54.4–96px, line-height 1.08.
- Section heading: 36.8–56px; subsection heading: 28–36px.
- Card heading: 28–35.2px; job heading: 24–32px, line-height 1.2.

Size tokens use rem and clamp, with minimums that remain readable on phones. Do not resize the root font per breakpoint.

## Color

Preserve the forest, moss, sage, paper and copper palette. Components use purpose-based names for background, surface, text, headings, metadata, borders, links and focus/accent. The light homepage writing section has separate text/link/border roles for its paper background.

Older RGB-channel variables and size aliases remain available for legacy archive components and effects. New styles use the semantic tokens. Primary layouts, navigation, footer, homepage, interior panels and the résumé consume the shared system; individual historical project/poetry styles still retain some legacy values.

## Validation

Review `/`, `/work` and `/writing` at desktop and phone widths. Check long titles, wrapped metadata, bottom-aligned essay actions, one-column mobile cards, keyboard focus and horizontal overflow. Build with `npm run build`; this includes the repository's existing type check.
