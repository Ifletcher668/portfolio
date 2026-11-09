# Personal Website — Project Context

## Purpose
A personal home on the internet for Isiah Fletcher, presenting the whole person through software engineering, drumming, writing, and personal interests. Not an agency pitch, résumé landing page, or digital garden.

## Direction
- Original Everforest-inspired atmosphere: forest #252F2C, moss #34443C, sage #91A98C, paper #E2D7BB, copper #BF8F68.
- Literary/editorial typography; serif display, legible sans-serif body; warm, restrained, accessible, responsive.
- Writing voice: personal and reflective, direct and specific, never overwrought or sales-oriented.
- Preserve **/drummer-bubs-transparent.png**, the existing homepage hero image. Do not replace it with stock photography or a generic portrait. Design around its transparency/composition; avoid the current float/shape-outside text-wrapping behavior.
- Code, music, and writing receive balanced editorial importance, not necessarily identical layout or dimensions.

## Working homepage copy
**Hi, I'm Isiah.**
**I build software, play drums, and write.**
I like making things, understanding how they work, and following ideas that interest me. This is a home for the projects, music, writing, and occasional curiosities that come out of that.

Copy remains subject to visual review.

## Information architecture
- Home `/`: intro, featured code, music, writing, brief about, footer.
- Code `/code`: professional experience and selected projects; consolidate existing Work and Projects.
- Music `/music`: performances, recordings, bands, videos.
- Writing `/writing`: Substack showcase and local curated poetry/selected essays; `/writing/poetry`, `/writing/essays`.
- About `/about`: biography, interests, contact.
- Site name links home. No hover-only dropdowns. Preserve existing URLs via redirects where appropriate.

## Content
- Substack (https://isiahfletcher7.substack.com/) is primary home for ongoing essays and reflections. Showcase selected/recent posts on site, link out, avoid full duplication.
- Local Markdown/MDX collections for curated poetry and standalone essays; no fiction or digital garden for now.
- Reuse existing actual projects and YouTube performances; no invented portfolio items.
- Other repository imagery such as `isiah-drumming.jpg` and `aterrima-tour.jpg` may support Music pages; optimize large assets before deployment.

## Implementation
- Retain Astro and existing deployment setup.
- Build design tokens, typography, shared layout/navigation, homepage, then primary pages.
- Refactor inconsistent CSS color-variable usage, ensure mobile and keyboard accessibility.
- Guard against empty/unavailable Substack RSS feeds; avoid assuming `posts[0]` exists.
- Optimize image loading and file sizes; use meaningful alt text.
- Avoid unnecessary CMS, animation libraries, dependencies.
- Review in a browser and test build, contrast, responsiveness, redirects, and performance before merge.

## Workflow
Work on `redesign/personal-home`, not `main`. Open a draft pull request for review; do not merge without user approval.
