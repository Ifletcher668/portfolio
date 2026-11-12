# Pages, templates, and sections

Pages live in `content/pages` and appear in Tina under **Pages**. Choose Landing
for a hero-led page, Interior for flexible composition, or Writing for an article
with optional date and byline. All templates share the section library. Template
names describe structure, not the current portfolio's subject matter.

## Editing and publishing

New pages start as drafts. Edit draft content using the CMS form. Clear **Draft**,
save, and deploy to publish a URL and enable visual editing. This uses a normal
boolean field and does not require Tina's paid Editorial Workflow. Drafts are
excluded from static routes and the sitemap; unpublished visual previews are not
part of this release. Publishing does not automatically add navigation links.

The document path defines the URL: `home.json` maps to `/`, `about.json` to
`/about`, and `guides/getting-started.json` to `/guides/getting-started`. Use Tina
folders for nested paths. Paths use lowercase letters, numbers, and hyphens.
Builds reject collisions with authored routes and reserved infrastructure paths.
Moving a published document changes its URL; add a redirect separately if needed.

## Composition

Add, remove, and reorder Rich text, Text with image, Card grid, Video embed, Feed,
and Columns sections. Columns arrange independently editable sections side by side
and stack on narrow screens; each column accepts any non-container section.
Every section supports theme-based width, top/bottom spacing,
alignment, and background choices. Text/image sections offer image position and
ratio, including an image above the copy; cards offer one to three columns.
Borders and embellishments are independent controls: inner padding, corner radius,
shadow, selected border edges, line style/weight/theme color, an optional accent
edge, and horizontal rules before or after content. Text alignment supports left,
center, and right. Column vertical alignment is Top, Center, or Bottom, with an
independent gap control. Narrow screens stack columns. Meaningful
images need alternative text; decorative images can leave it empty.

Landing's Hero owns its eyebrow, heading, introduction, image, rich text, and actions.
SEO metadata stays at page level; Landing has no second set of introductory fields. Its optional
icosahedron background is an optional effect, not required content. Writing
has a readable article body before its supporting sections. Its introduction width
can be selected independently, including a full content-width introduction for an
editorial index. Neither template
requires a video, feed, or any current portfolio content.

Video sections accept HTTPS YouTube and Vimeo links and emit provider-specific
embeds. Feed sections accept public HTTPS RSS/Atom sources, with featured or list
presentation, an item limit, and editable failure text/link. Published feeds refresh
on rebuild; unsaved visual edits fetch the chosen source through the island render.
Feeds have bounded requests and gracefully fall back when unavailable.

## Extending the library

Register a section's fields in `tina/sections.ts` and its Astro renderer in
`src/components/sections/registry.ts`; update the shared section contract as needed.
Every template consumes the registry, so adding a section does not require a new
template or new content slot. Keep provider-specific feed behavior behind the
`FeedItem` adapter contract in `src/lib/feeds.ts`. Keep all design values in the
shared token system and validate editor-controlled values at rendering boundaries.

Run `npm run validate:pages` for schema generation, token checks, Astro checks, a
saved-content build, and page/preview/theme regressions. `npm run test:pages` runs
the page checks against an existing build; `npm run test:preview` also needs the
local Tina GraphQL server. Browser review should cover unsaved edits, section
reordering, mobile layouts, and theme editing at `/theme-preview`.

## Migrating older content

`node scripts/migrations/page-editor-controls.mjs` migrates older page documents
to Hero-owned copy and independent decoration controls. It preserves existing text
and media paths, walks nested columns, and is safe to rerun.

## Images in visual previews

For an empty production Media Manager, see [TinaCMS media recovery](tinacms-media.md).

Tina may resolve repository image fields to staging CDN URLs inside the editor.
If a CDN image fails, the page retries its corresponding public URL only when it
belongs to this Tina project and is present in the deployed image manifest. This
also covers dynamically refreshed sections and rich-text images. New uploads stay
on the CDN; editor values are never rewritten by this display fallback.

### Image annotations

Hero images, text-with-image sections (including columns), and card images have a **Photo credit / image annotation** field in TinaCMS. Enter the photographer, artist, source, or license there. Unsaved edits appear in the visual preview. For an image inserted in a rich-text body, use the image dialog's caption field for its annotation.

On desktop, hovering an image shows the question-mark help cursor and reveals its credit after one second. The separate question-mark button is mobile-only. The desktop tooltip follows the cursor with a small offset and stays within the viewport. On mobile layouts (up to 800px), the question mark stays at the bottom right; tap the image or question mark to toggle the credit. Keyboard users can focus the question mark to read it. Escape, tapping outside, or moving the mouse away dismisses it. Credits are plain text. Images without a credit show “Photo credit not provided.” Existing archive images use the same interaction; embedded third-party players manage their own media.

Annotation colors use the site theme and adapt to surface, light, and tint section backgrounds.
