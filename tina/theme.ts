import type { Collection } from "tinacms";
import defaults from "../content/theme/site.json";

const label = (name: string) =>
  name.replace(/_/g, " ").replace(/([a-z])(\d|[A-Z])/g, "$1 $2");
export const themeCollection: Collection = {
  name: "theme",
  label: "Site theme",
  path: "content/theme",
  format: "json",
  ui: { allowedActions: { create: false, delete: false }, router: () => "/" },
  fields: [
    {
      type: "object",
      name: "palette",
      label: "Palette",
      required: true,
      description:
        "Generic colors shared by every page. Gray 0–19 run from dark to light. Use six-digit hex values.",
      fields: Object.keys(defaults.palette).map((name) => ({
        type: "string",
        name,
        label: label(name),
        required: true,
        ui: {
          component: "color",
          colorFormat: "hex",
          validate: (value: string) =>
            /^#[0-9a-f]{6}$/i.test(value ?? "")
              ? undefined
              : "Use a six-digit hex color.",
        },
      })),
    },
    {
      type: "object",
      name: "roles",
      label: "Color roles",
      required: true,
      description:
        "Choose a palette color for each site role. Check text, links and focus contrast before saving.",
      fields: Object.keys(defaults.roles).map((name) => ({
        type: "string",
        name,
        label: name === "bg" ? "Background" : label(name),
        required: true,
        options: Object.keys(defaults.palette).map((value) => ({
          value,
          label: label(value),
        })),
      })),
    },
  ],
};
