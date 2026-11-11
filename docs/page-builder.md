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

Add, remove, and reorder Rich text, Text with image, Card grid, Video embed, and
Feed sections. Every section supports theme-based width, top/bottom spacing,
alignment, and background choices. Text/image sections offer image position and
ratio; cards offer one to three columns. Narrow screens stack columns. Meaningful
images need alternative text; decorative images can leave it empty.

Landing's hero has editable image, lead, rich text, and actions. Its optional
icosahedron background is a presentation treatment, not required content. Writing
has a readable article body before its supporting sections. Neither template
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
