import { requestWithMetadata } from "@tinacms/astro/data";
import client from "../../tina/__generated__/client";

export const getTheme = () =>
  requestWithMetadata(client.queries.theme({ relativePath: "site.json" }));
