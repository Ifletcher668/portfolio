import { requestWithMetadata } from "@tinacms/astro/data";
import client from "../../tina/__generated__/client";

export const getTheme = (primary = false) =>
  requestWithMetadata(
    client.queries.config({ relativePath: "site-theme.json" }),
    primary ? { priority: "primary" } : undefined,
  );
