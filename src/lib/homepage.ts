import { requestWithMetadata } from "@tinacms/astro/data";
import client from "../../tina/__generated__/client";

export const getHomepage = () =>
  // The homepage shares its preview with the global theme. Let Tina retain
  // the editor-selected form instead of forcing this document on every load.
  requestWithMetadata(client.queries.homepage({ relativePath: "home.json" }));

export type Homepage = Awaited<
  ReturnType<typeof getHomepage>
>["data"]["homepage"];
