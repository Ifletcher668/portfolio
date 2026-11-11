import type { Collection, Template, TinaField } from "tinacms";
import { imageFields, sectionTemplates } from "./sections";
const metadata: TinaField[] = [
  {
    type: "string",
    name: "title",
    label: "Page title",
    required: true,
    isTitle: true,
  },
  { type: "string", name: "description", label: "SEO description" },
  {
    type: "boolean",
    name: "draft",
    label: "Draft",
    required: true,
    description:
      "Drafts stay out of the public site. Edit in this form; visual editing is available after publishing and deploying.",
  },
  { type: "string", name: "eyebrow", label: "Eyebrow" },
  { type: "string", name: "heading", label: "Heading", required: true },
  {
    type: "string",
    name: "intro",
    label: "Introduction",
    ui: { component: "textarea" },
  },
];
const introWidth: TinaField = {
  type: "string",
  name: "introWidth",
  label: "Introduction width",
  options: ["prose", "content", "wide"],
};
const sections: TinaField = {
  type: "object",
  name: "sections",
  label: "Sections",
  list: true,
  templates: sectionTemplates,
};
const templates: Template[] = [
  {
    name: "landing",
    label: "Landing",
    fields: [
      ...metadata,
      {
        type: "object",
        name: "hero",
        label: "Hero",
        fields: [
          ...imageFields,
          {
            type: "string",
            name: "treatment",
            label: "Background treatment",
            options: ["plain", "icosahedron"],
          },
          { type: "string", name: "lead", label: "Lead" },
          { type: "rich-text", name: "body", label: "Body" },
          {
            type: "object",
            name: "actions",
            label: "Actions",
            list: true,
            fields: [
              { type: "string", name: "label", label: "Label", required: true },
              { type: "string", name: "url", label: "URL", required: true },
            ],
          },
        ],
      },
      sections,
    ],
  },
  {
    name: "interior",
    label: "Interior",
    fields: [...metadata, introWidth, sections],
  },
  {
    name: "writing",
    label: "Writing",
    fields: [
      ...metadata,
      introWidth,
      { type: "datetime", name: "date", label: "Date" },
      { type: "string", name: "byline", label: "Byline" },
      { type: "rich-text", name: "body", label: "Article body" },
      sections,
    ],
  },
].map((template) => ({
  ...template,
  ui: { defaultItem: { draft: true, sections: [] } },
}));
export const pagesCollection: Collection = {
  name: "pages",
  label: "Pages",
  path: "content/pages",
  format: "json",
  templates,
  ui: {
    allowedActions: {
      create: true,
      delete: true,
      createFolder: true,
      createNestedFolder: true,
    },
    // Collection-list documents contain only _sys, not content fields. Check
    // the deployed route so drafts and newly saved pages stay in form editing
    // until a build actually publishes them.
    router: async ({ document }) => {
      if (document._values?.draft === true) return undefined;
      const path = document._sys.relativePath;
      const url =
        path === "home.json" ? "/" : `/${path.replace(/\.json$/, "")}`;
      try {
        const response = await fetch(url, {
          method: "HEAD",
          cache: "no-store",
        });
        return response.ok ? url : undefined;
      } catch {
        return undefined;
      }
    },
    filename: {
      slugify: (values) =>
        String(values.title || "new-page")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
    },
  },
};
