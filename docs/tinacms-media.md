# TinaCMS media: configuration and recovery

The production editor at <https://isiah-fletcher.netlify.app/admin/> uses the
**Portfolio TinaCMS pilot** TinaCloud project, client ID
`28909069-ee6b-4e67-b140-c8c4516b23ad`. Production and deploy previews use this
same project; their content branches can differ.

## Where images live

`tina/config.ts` configures repository-backed media with `publicFolder: "public"`
and `mediaRoot: ""`. Existing assets live directly in `public/` and its
subdirectories, rather than `public/uploads/`. TinaCloud's media branch is locked
to the repository's default branch, `main`.

Images can load on the public site while the Media Manager is empty: the site
serves repository assets, while the cloud media library needs its own sync.
Changing the content branch or rebuilding the site is not a substitute for
syncing that library.

## Recover an empty Media Manager

1. Open the project's [TinaCloud Media settings](https://app.tina.io/projects/28909069-ee6b-4e67-b140-c8c4516b23ad/media).
2. Verify **Media Branch** is `main`, **Public Folder** is `public`, and
   **Media Root** is empty. Compare these values with `tina/config.ts` if the
   configuration changes later.
3. Click **Resync Media** and wait for **Media synced successfully**.
4. Return to the production editor's **Media Manager** and click **Refresh**.
5. Verify that existing images appear, including `drummer-bubs-transparent.png`,
   `shelbz-website-project.png`, and `isiah-drumming.jpg`.

The **Sync to GitHub default branch** button is a different operation: use it
only if the repository's default branch has changed. The Media page may show
explanatory text mentioning `public/uploads`; use the actual folder settings
above and the repository configuration to determine the media root.

If the library is still empty, clear its search and type filters, confirm the
editor's **Project Config** link points to the project above, and check whether
TinaCloud reported a sync error. Do not re-upload existing files or change their
content paths merely to populate the library.

This recovery was verified on production: **Resync Media**, followed by
**Refresh** in the editor, restored the existing repository images without a
code deployment or content edits.

Reference: [TinaCMS repository-backed media documentation](https://tina.io/docs/reference/media/repo-based).
