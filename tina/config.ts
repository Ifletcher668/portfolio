import { configCollection } from "./config-collection";
import { pagesCollection } from "./pages";
import { defineConfig } from "tinacms";

const branch = process.env.TINA_BRANCH || process.env.HEAD || "main";
export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { publicFolder: "public", mediaRoot: "" } },
  schema: { collections: [configCollection, pagesCollection] },
});
