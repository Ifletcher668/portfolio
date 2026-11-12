import type { TinaField } from "tinacms";
const choice = (name: string, label: string, options: string[]): TinaField => ({
  type: "string",
  name,
  label,
  options,
});
const stroke: TinaField[] = [
  choice("style", "Line style", ["solid", "dashed", "dotted", "double"]),
  choice("weight", "Line weight", ["thin", "medium", "thick"]),
  choice("color", "Theme color", [
    "border",
    "strong",
    "accent",
    "heading",
    "muted",
    "link",
  ]),
];
export const decorationField: TinaField = {
  type: "object",
  name: "decoration",
  label: "Borders and embellishments",
  fields: [
    choice("padding", "Inner padding", ["none", "small", "medium", "large"]),
    choice("radius", "Corner radius", ["none", "small", "medium", "large"]),
    choice("shadow", "Shadow", ["none", "soft", "raised"]),
    {
      type: "object",
      name: "border",
      label: "Border",
      fields: [
        {
          type: "string",
          name: "edges",
          label: "Border edges",
          list: true,
          options: ["top", "right", "bottom", "left"],
        },
        ...stroke,
        choice("accentEdge", "Accent edge", [
          "none",
          "top",
          "right",
          "bottom",
          "left",
        ]),
        choice("accentWeight", "Accent weight", ["thin", "medium", "thick"]),
        choice("accentColor", "Accent color", [
          "border",
          "strong",
          "accent",
          "heading",
          "muted",
          "link",
        ]),
      ],
    },
    {
      type: "object",
      name: "rules",
      label: "Horizontal rules",
      fields: [
        { type: "boolean", name: "top", label: "Rule before content" },
        { type: "boolean", name: "bottom", label: "Rule after content" },
        ...stroke,
        choice("spacing", "Space between rule and content", [
          "none",
          "small",
          "medium",
          "large",
        ]),
      ],
    },
  ],
};
