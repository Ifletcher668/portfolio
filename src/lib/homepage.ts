import { requestWithMetadata } from "@tinacms/astro/data";
import client from "../../tina/__generated__/client";

export const getHomepage = () =>
  // The route owns form selection; this shared loader must not override it.
  requestWithMetadata(client.queries.homepage({ relativePath: "home.json" }));

export type Homepage = Awaited<
  ReturnType<typeof getHomepage>
>["data"]["homepage"];
