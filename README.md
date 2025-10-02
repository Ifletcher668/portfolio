# Portfolio Website

My personal portfolio and blog built with Astro, featuring drum session work, programming projects, and philosophical writing.

## Stack

- **Astro 4.3** - Static site generation
- **Three.js** - 3D graphics and animations
- **TypeScript** - Type safety
- **MDX** - Markdown with JSX components
- **RSS Parser** - Substack feed integration

## Blog Integration

Blog posts are pulled from Substack RSS feed at build time. **Manual rebuild required** after publishing new Substack posts:

```bash
npm run build && netlify deploy --prod
```

Or trigger via Netlify dashboard: Deploys → Trigger deploy

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
