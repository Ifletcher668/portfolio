import defaults from "../../content/config/site-theme.json" with { type: "json" };

// Only known keys and validated values reach CSS, including during unsaved previews.
export function themeCSS(data: { palette?: unknown; roles?: unknown }) {
  const palette = (data.palette ?? {}) as Record<string, unknown>;
  const roles = (data.roles ?? {}) as Record<string, unknown>;
  const colors = Object.entries(defaults.palette).map(([name, fallback]) => {
    const value = palette[name];
    return `--palette-${name}:${typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback};`;
  });
  const assignments = Object.entries(defaults.roles).map(([name, fallback]) => {
    const value = roles[name];
    const color =
      typeof value === "string" && Object.hasOwn(defaults.palette, value)
        ? value
        : fallback;
    const variable = `--palette-${color}`;
    return `--color-${name.replaceAll("_", "-")}:var(${variable});`;
  });
  return `:root{${colors.join("")}${assignments.join("")}}`;
}
