import { themeCollection } from "./theme";
import { defineConfig } from "tinacms";

// HEAD is Netlify's source branch, including for pull-request deploys.
const branch = process.env.TINA_BRANCH || process.env.HEAD || "main";

export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: { outputFolder: "admin", publicFolder: "public" },
  schema: {
    collections: [
      themeCollection,
      {
        name: "homepage",
        label: "Homepage",
        path: "content/homepage",
        format: "json",
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => "/",
        },
        fields: [
          {
            type: "string",
            name: "headline",
            label: "Homepage headline",
            isTitle: true,
            required: true,
            description: "The main greeting at the top of your homepage.",
          },
        ],
      },
    ],
  },
});
