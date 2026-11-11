# TinaCMS pilot: edit, publish, and recover

> Historical pilot walkthrough. The pilot is now live. The expanded color editor
> is documented in [Site theme](site-theme.md); its site-wide button role replaces
> the original Sage/Paper picker. Setup and recovery below still apply.

This pilot makes exactly two things editable: the homepage greeting and the
background of its **Explore the site** button. Everything else stays in the site
code. Content lives in `content/homepage/home.json` in GitHub.

## One-time setup

- TinaCloud project: **Portfolio TinaCMS pilot**, client ID
  `28909069-ee6b-4e67-b140-c8c4516b23ad`.
- Use the **Free** plan. No self-hosted backend, database, media service, or paid
  upgrade is needed for this pilot.
- In Netlify's **isiah-fletcher → Project configuration → Environment variables**,
  set `PUBLIC_TINA_CLIENT_ID` to the client ID above. Set secret `TINA_TOKEN` to
  the project's **Content (Readonly)** token from TinaCloud → Tokens. Make both
  available to builds and functions, including production and deploy previews.
  Never put the token in GitHub, chat, or a public-prefixed variable.
- Add the exact deploy-preview origin to TinaCloud → Configuration → Site URLs.
  Keep the production origins and your local development origin (`http://localhost:4322`) there as well.
- Netlify must build from GitHub using `npm run build`. `netlify.toml` provides
  that command, the `dist` publish directory, and the Node version.
- Commit `tina/tina-lock.json`: TinaCloud needs it to index the content schema.

## Everyday editing

1. Open your deployment's `/admin/` page and sign in to TinaCloud.
2. Open **Homepage pilot**, then the existing homepage document.
3. Change **Homepage headline** or choose **Sage/Paper** under **Button color**.
   Clicking the greeting or button in the preview also selects its field.
4. Check the live preview. Unsaved changes stay in the editor.
5. Select **Save**. Tina commits the change to GitHub; Netlify then builds it.
6. Check [Netlify deployments](https://app.netlify.com/projects/isiah-fletcher/deploys).
   Open the successful deployment URL to confirm the published result.

The editor address after rollout is
<https://isiah-fletcher.netlify.app/admin/>. The custom-domain equivalent is
<https://isiahfletcher.com/admin/>. Before merge, use the draft pull request's
Netlify deploy preview, with `/admin/` appended.

The built editor targets `TINA_BRANCH`, then Netlify's `HEAD`, then `main`.
Do not set a global `TINA_BRANCH` on Netlify: deploy previews must target their
own source branch, while production targets `main`. There is no runtime branch
switcher in this pilot.

## Pilot exercise and acceptance

On the **pilot preview**, change the greeting to **Hello from Tina.** and choose
**Paper**. Verify the preview updates before saving and a separate published tab
still shows the previous version. Save, verify GitHub receives the commit, then
wait for the matching successful Netlify deployment. Reopen Tina and confirm the
saved values persist. Restore **Hi, I'm Isiah.** and **Sage**, save, and verify
the restored deployment.

Record the actual save-to-publish time during that exercise; a timing estimate
is not a completed test. Repeat the exercise on production only after the pull
request is reviewed and merged. No production content is changed before merge.

## Recovery

- **Unsaved mistake:** leave/reload the editor and discard the unsaved change.
- **Saved content mistake:** set the two fields back to their previous values
  in Tina and save again. This creates a normal, recoverable Git commit.
- **Failed build:** open the failed deployment's log in Netlify. The previous
  published deployment remains available. Correct the reported problem and save
  or push a fix. Do not click a paid upgrade to resolve a configuration issue.
- **Cannot use Tina:** ask ChatGPT to pull the latest branch, identify the
  specific content commit, revert that commit with `git revert`, and push the
  resulting recovery commit. Review conflicts rather than overwriting newer
  content. A Netlify rollback restores the served version only; the GitHub
  content must also be corrected so the next build does not reintroduce it.
- **Token stops working:** replace it in Netlify environment settings and run
  a new deployment. Do not expose it in support logs.

## Working with ChatGPT

Pull the latest CMS commits before editing code, and keep design/code changes
on a separate branch. Never overwrite `home.json` with an older local copy.
Review pull requests before merging. The CMS does not replace code review.

For local development, use the Node version in `.nvmrc`, run `npm ci`, copy
`.env.example` to ignored `.env`, and fill in project credentials. `npm run dev`
starts Tina and Astro on port 4322, leaving the existing portfolio dev server on
4321 alone. The foreground flag keeps Tina’s local API running alongside Astro
when launched from an agent. If a different port is needed, update the dev
command and TinaCloud’s allowed Site URLs together.

`npm run build:local` builds an offline/local editor for development checks.
It is **not** the production build: production uses `npm run build`, which
generates a cloud-authenticated editor. Public pages build from the checked-out
Git content; only editor refreshes need TinaCloud at request time.

## Verification record

- Rebased onto PR #14 (`191ce70`), preserving its design-token checks and styling.
- Astro 5 upgrade baseline: all 14 routes generated successfully.
- Pilot local build: design-token checks and Astro checks passed; 14 static
  public pages and the Netlify editor-refresh function generated successfully.
- Authenticated browser editing, deployment publishing, timing, and production
  recovery remain pending until the browser and deployment setup are available.
- User approved upgrading beyond Astro 5 to resolve its critical advisory.
  Current Astro 7.4.8 and matching integrations are installed; the dependency
  audit now reports zero critical findings. Other dependency advisories remain
  and are recorded in the pull request.
