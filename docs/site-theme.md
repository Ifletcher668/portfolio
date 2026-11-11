# Theme design methodology

Color decisions should express one visual system across the site. Editors need
room to change its character without having to understand individual components;
contributors need enough structure to keep those changes coherent. Treat the
theme as a shared design contract, rather than a collection of page overrides.

## Separate available colors from their purpose

Palette names describe colors in generic terms, following terminal and editor
conventions: red, green, blue, cyan, and numbered grays. Avoid names tied to a
brand, mood, page, or current hex value. A palette should remain understandable
when its values change. Tinted grays are appropriate for the site's atmosphere;
keep their dark-to-light ordering useful for reasoning about visual hierarchy.

Roles describe why a color appears: text, background, surface, border, link, or
accent. Components should depend on these purposes so a palette change does not
require revisiting every use. Choose a role because its meaning matches the
component, not because it happens to resolve to the desired color today.

Before adding anything, decide which kind of change is needed:

- Change a palette value when the color itself should change wherever selected.
- Reassign a role when one visual purpose should use a different available color.
- Add a role when a purpose needs independent control, even if it initially shares
  a color with another role. Explain why the existing roles cannot express it.
- Add a palette entry when a needed hue or tonal step is missing. Avoid creating
  near-duplicates to solve a component-specific styling problem.

## Design relationships, not isolated swatches

Judge colors in the contexts where they meet. Text and its background, a link
and its surrounding prose, or a focus indicator and adjacent surfaces form the
useful unit of review. Matching a hue across contexts does not guarantee matching
contrast; light surfaces need their own role assignments.

Preserve readable hierarchy between headings, body text and metadata, and make
interactive states distinguishable. Check hover, focus, overlays and captions as
well as resting states. Translucent effects depend on the surface beneath them;
review the composite result instead of judging the source swatch alone.

Require at least 4.5:1 contrast for normal text and 3:1 for large text. Aim for
at least 3:1 between focus indicators and adjacent colors. A syntactically valid
palette is not evidence that these relationships remain accessible.

## Keep the editor boundary deliberate

Expose choices that help an editor express a coherent theme. Keep layout,
effect geometry and opacity rules in code unless there is a concrete editorial
need to control them. Expanding the form has a cost: every independent choice
creates more combinations to understand and review.

Treat preview values as untrusted input. Preserve validation at the CSS output
boundary as well as in the editing form, and retain usable fallbacks during
incomplete edits. Never make arbitrary CSS an escape hatch for a missing role.

Saved public pages should retain their appearance without an available CMS.
Unsaved previews should exercise the same color relationships as published
pages, including colors consumed outside ordinary stylesheets. When adding a
canvas, browser-level treatment or other color consumer, account for both its
initial value and subsequent preview changes.

Provider-controlled embeds and colors baked into media have separate ownership.
Theme their surrounding surfaces; evaluate the resulting composition without
assuming the palette can recolor their interiors.

## Contribute through the shared contract

Start with the intended relationship and its consumers. Trace an existing role
before introducing a new one, then carry any change through the content model,
CSS fallbacks, schema and preview path together. Keep the fallback appearance
consistent with saved theme content so loading order does not create a second
visual theme. Treat renaming a key as a content migration, not a cosmetic refactor.

Validate at the boundary affected by the change. For palette or role changes,
review contrasting surfaces, interaction states and representative pages at
wide and narrow widths. For schema or rendering changes, also check invalid
input, unsaved preview updates and the saved build. Build and token checks catch
structural mistakes; visual and contrast review establish whether the design
still works.

Keep this document focused on intent and decision rules. Field inventories,
file wiring and command details belong in code or operational documentation;
completed checks and rollout status belong in pull requests.
