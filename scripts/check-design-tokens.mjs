import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Audit every authored stylesheet, including Astro style blocks and inline styles.
// Dimensions, breakpoints, border widths and animation geometry are not spacing.
const files = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (/\.(astro|css|js|ts)$/.test(path)) files.push(path);
  }
}
await collect("src");
const tokenFile = "src/styles/tokens.css";
const tokens = await readFile(tokenFile, "utf8");
const defined = new Set(
  [...tokens.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]),
);
const errors = [];
let stylesheets = 0;
for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/var\(\s*(--[\w-]+)/g)) {
    if (!defined.has(match[1]))
      errors.push(`${file}: undefined token ${match[1]}`);
  }
  if (file === tokenFile) continue;
  // Hex literals outside CSS catch canvas theme colors as well.
  if (/(?:#[\da-f]{3,8}\b|0x[\da-f]{6}\b)/i.test(source)) {
    errors.push(`${file}: raw color; use a semantic color token`);
  }
  const styles = file.endsWith(".css")
    ? [source]
    : [
        ...[...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(
          (match) => match[1],
        ),
        ...[...source.matchAll(/\bstyle="([^"]*)"/g)].map((match) => match[1]),
      ];
  for (let css of styles) {
    stylesheets++;
    // Font-face descriptors register a concrete font file; they are not styles.
    css = css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/@font-face\s*\{[^}]*\}/g, "");
    for (const match of css.matchAll(
      /(?:^|[;{}])\s*([\w-]+)\s*:\s*([^;{}]+)/g,
    )) {
      const [, property, value] = match;
      const literal = value
        .replace(/var\(\s*--[\w-]+\s*\)/g, "")
        .replace(/!important/g, "")
        .replace(/\//g, " ")
        .trim();
      if (/^--/.test(property))
        errors.push(
          `${file}: page-local token ${property}; define shared roles in ${tokenFile}`,
        );
      const colorProperty =
        /^(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|fill|stroke|text-decoration-color|box-shadow|filter|mask-image)$/;
      const colorKeywords = new Set([
        "none",
        "transparent",
        "currentcolor",
        "inherit",
        "initial",
        "unset",
        "revert",
        "solid",
        "dashed",
        "dotted",
        "double",
        "inset",
        "linear-gradient",
        "radial-gradient",
        "ellipse",
        "circle",
        "at",
        "to",
        "top",
        "bottom",
        "left",
        "right",
        "center",
        "drop-shadow",
        "blur",
        "repeat",
        "no-repeat",
      ]);
      const colorWords =
        literal
          .replace(/-?(?:\d*\.)?\d+(?:px|rem|em|vw|vh|%|deg)?/g, "")
          .match(/[a-z][a-z-]*/gi) ?? [];
      if (
        /\b(?:rgba?|hsla?|oklch|lab|color-mix)\(/i.test(literal) ||
        (colorProperty.test(property) &&
          colorWords.some((word) => !colorKeywords.has(word.toLowerCase())))
      ) {
        errors.push(`${file}: ${property}: ${value.trim()} uses a raw color`);
      }
      if (
        /^(?:(?:margin|padding|scroll-margin)(?:-[\w-]+)?|gap|row-gap|column-gap)$/.test(
          property,
        ) &&
        /(?:\d*\.)?\d+(?:px|rem|em|vw|vh|%)/.test(literal)
      ) {
        errors.push(
          `${file}: ${property}: ${value.trim()} uses literal spacing`,
        );
      }
      if (
        /^(?:font|font-size|font-family|font-weight|line-height|letter-spacing)$/.test(
          property,
        ) &&
        literal &&
        !/^(?:inherit|normal|initial|unset|revert)$/.test(literal)
      ) {
        errors.push(
          `${file}: ${property}: ${value.trim()} uses literal typography`,
        );
      }
    }
  }
}
if (errors.length) {
  console.error([...new Set(errors)].join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Design tokens: ${stylesheets} stylesheets checked; all references resolve and all authored colors, typography and spacing use shared tokens.`,
  );
}
