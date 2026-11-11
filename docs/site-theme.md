# Site theme: colors

The Tina pilot is live. The next schema adds **Site theme → site** to `/admin/`.
This document controls colors across all public routes, including archive pages
and the standalone Three.js demo. Typography and spacing remain in code.

## Edit and publish

1. Open `/admin/`, choose **Site theme**, then **site**.
2. Under **Palette**, edit a color using its picker or a six-digit hex value.
   Names are generic: black, white, gray 0–19, red, orange, yellow, green, cyan,
   blue, purple, orange dark and green dark. Grays are tinted neutrals ordered
   from dark to light; the defaults preserve the existing appearance.
3. Under **Color roles**, choose which palette color serves each purpose:
   backgrounds, surfaces, text, links, borders, accents, captions and the
   homepage button. Roles ending in “on light” apply to the light writing panel.
4. Check the unsaved preview, then inspect Home, Work and Writing. Check text
   contrast, link hover, keyboard focus and narrow screens. The preview also
   updates the homepage canvas and browser theme color.
5. Save to commit to GitHub. Check the matching Netlify deployment, then verify
   the published pages. Unsaved changes remain in the editor.

The homepage greeting is still editable in **Homepage**. The pilot's separate
Sage/Paper button picker is superseded by **Color roles → homepage button
background**. Its old JSON value is retained for history and no longer used.

The default text/background pairings are unchanged. New combinations are an
editorial choice: check at least 4.5:1 for normal text, 3:1 for large text, and
3:1 for focus indicators against adjacent colors before publishing.

## Implementation and recovery

- `content/theme/site.json` stores palette values and role assignments in Git.
- `tina/theme.ts` defines the singleton form. Creating/deleting themes is disabled.
- `src/styles/tokens.css` supplies fallback tokens; the CMS stylesheet overrides
  palette values and roles. Components continue to consume semantic tokens.
- Only known palette/role keys, six-digit hex colors and allowed palette choices
  reach the stylesheet. Invalid preview values fall back to checked-out values.
- Translucent overlays, ripples, tints and shadows derive from palette/role tokens;
  their opacity and geometry remain code-owned.
- Provider-controlled iframe contents and baked-in images/textures are unchanged.
- The shared Tina island registry refreshes theme styles on unsaved edits. Public
  pages are statically built from Git and do not need TinaCloud at request time.

For an unsaved mistake, discard changes. For a saved mistake, restore the affected
values in Tina and save again. For a failed build, the previous successful deploy
stays live. Follow `docs/tina-pilot.md` for credentials, branch targeting and Git
recovery. Do not publish an offline/local editor as the production admin.

After merging the schema and its generated `tina/tina-lock.json`, exercise a
palette edit and a role edit in the authenticated deployed admin; verify both
unsaved preview and save-to-deployment, then restore them. Local build checks do
not prove TinaCloud publishing works.

## Local verification

- Node 22: Tina local schema/editor build, design-token audit, Astro checks and all
  14 static public routes pass.
- `node --experimental-strip-types --test scripts/theme.test.mjs` checks palette
  edits, role assignment, invalid-value/CSS-injection fallback and theme coverage
  in every built public route (run after building).
- Browser review: Home, Work and Writing render with the existing palette. Home
  computes background `rgb(37, 47, 44)` and text `rgb(195, 208, 191)`, with no
  horizontal overflow at the review viewport.
- Authenticated unsaved editing, phone-width review and save-to-publish on Netlify
  remain deployment acceptance checks; they have not been claimed as completed.
