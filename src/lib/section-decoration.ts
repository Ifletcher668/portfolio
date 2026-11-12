export type Stroke = {
  style?: string | null;
  weight?: string | null;
  color?: string | null;
};
export type Decoration = {
  padding?: string | null;
  radius?: string | null;
  shadow?: string | null;
  border?:
    | (Stroke & {
        edges?: (string | null)[] | null;
        accentEdge?: string | null;
        accentWeight?: string | null;
        accentColor?: string | null;
      })
    | null;
  rules?:
    | (Stroke & {
        top?: boolean | null;
        bottom?: boolean | null;
        spacing?: string | null;
      })
    | null;
};
const spacing = {
  none: "0",
  small: "var(--space-5)",
  medium: "var(--card-padding)",
  large: "var(--gap-section)",
};
const radii = {
  none: "0",
  small: "var(--radius-sm)",
  medium: "var(--radius-md)",
  large: "var(--radius-lg)",
};
const weights = { thin: "1px", medium: "2px", thick: "3px" };
const colors = {
  border: "var(--color-border)",
  strong: "var(--color-border-strong)",
  accent: "var(--color-accent)",
  heading: "var(--color-heading)",
  muted: "var(--color-muted)",
  link: "var(--color-link)",
};
const lightColors = {
  border: "var(--color-border-on-light)",
  strong: "var(--color-rule-on-light)",
  accent: "var(--color-accent-on-light)",
  heading: "var(--color-on-light)",
  muted: "var(--color-muted-on-light)",
  link: "var(--color-link-on-light)",
};
function known<T extends Record<string, string>>(
  map: T,
  value: unknown,
  fallback: keyof T,
): string {
  return typeof value === "string" && Object.hasOwn(map, value)
    ? map[value]
    : map[fallback];
}
function line(stroke: Stroke | null | undefined, light: boolean) {
  const style = ["solid", "dashed", "dotted", "double"].includes(
    stroke?.style || "",
  )
    ? stroke!.style
    : "solid";
  return `${known(weights, stroke?.weight, "thin")} ${style} ${known(light ? lightColors : colors, stroke?.color, "border")}`;
}
const edges = ["top", "right", "bottom", "left"];
/** Only whitelisted geometry and semantic theme roles reach inline CSS. */
export function decorationStyle(decoration?: Decoration | null, light = false) {
  if (!decoration) return undefined;
  const style = [
    `padding:${known(spacing, decoration.padding, "none")}`,
    `border-radius:${known(radii, decoration.radius, "none")}`,
    `box-shadow:${known({ none: "none", soft: "var(--shadow-card)", raised: "var(--shadow-card-hover)" }, decoration.shadow, "none")}`,
  ];
  const border = decoration.border;
  for (const edge of edges)
    if (border?.edges?.includes(edge))
      style.push(`border-${edge}:${line(border, light)}`);
  if (border?.accentEdge && edges.includes(border.accentEdge))
    style.push(
      `border-${border.accentEdge}:${line({ style: border.style, weight: border.accentWeight || "thick", color: border.accentColor || "strong" }, light)}`,
    );
  return style.join(";");
}
export function ruleStyle(
  rules: Decoration["rules"],
  position: "top" | "bottom",
  light = false,
) {
  const gap = known(spacing, rules?.spacing, "medium");
  return `border:0;border-top:${line(rules, light)};margin:${position === "top" ? `0 0 ${gap}` : `${gap} 0 0`}`;
}
