import type { Collection } from "tinacms";
import { siteThemeTemplate } from "./theme";

export const configCollection: Collection = {
  name: "config",
  label: "Config",
  path: "content/config",
  format: "json",
  // Creation keeps Tina's collection list visible even with one document.
  // Each template owns one fixed filename; future config types belong here.
  ui: {
    allowedActions: {
      create: true,
      delete: false,
      createFolder: false,
      createNestedFolder: false,
    },
    filename: {
      readonly: true,
      slugify: (_values, { template }) => {
        if (template.name === "siteTheme") return "site-theme";
        throw new Error(`No config filename registered for ${template.name}`);
      },
    },
    router: ({ document }) =>
      document._sys.template === "siteTheme" ? "/theme-preview" : undefined,
  },
  templates: [siteThemeTemplate],
};
