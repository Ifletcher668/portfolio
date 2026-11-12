import { decorationField } from "./decoration";
import type { Template, TinaField } from "tinacms";

const select = (name: string, label: string, options: string[]): TinaField => ({
  type: "string",
  name,
  label,
  options,
});
export const imageFields: TinaField[] = [
  { type: "image", name: "image", label: "Image" },
  {
    type: "string",
    name: "imageAlt",
    label: "Image alternative text",
    description:
      "Describe meaningful images; leave empty only for decorative images.",
  },
];
export const layoutFields: TinaField[] = [
  select("width", "Width", ["prose", "content", "wide"]),
  select("spacingTop", "Top spacing", ["none", "small", "medium", "large"]),
  select("spacingBottom", "Bottom spacing", [
    "none",
    "small",
    "medium",
    "large",
  ]),
  select("alignment", "Text alignment", ["left", "center", "right"]),
  select("background", "Background", ["default", "surface", "light", "tint"]),
];
export const sectionDefaults = {
  width: "content",
  spacingTop: "medium",
  spacingBottom: "medium",
  alignment: "left",
  background: "default",
};
const common: TinaField[] = [
  {
    type: "string",
    name: "label",
    label: "Editor label",
    description: "A name to find this section in the editor.",
  },
  {
    type: "string",
    name: "anchor",
    label: "Anchor",
    description: "Optional unique section ID, such as explore.",
    ui: {
      validate: (value: string) =>
        !value || /^[a-z][a-z0-9-]*$/.test(value)
          ? undefined
          : "Use lowercase letters, numbers and hyphens, starting with a letter.",
    },
  },
  { type: "string", name: "eyebrow", label: "Eyebrow" },
  { type: "string", name: "heading", label: "Heading" },
  decorationField,
  select("headingStyle", "Heading style", ["section", "card"]),
  ...layoutFields,
];
const body: TinaField = { type: "rich-text", name: "body", label: "Body" };
const contentSectionTemplates: Template[] = [
  { name: "richText", label: "Rich text", fields: [...common, body] },
  {
    name: "textImage",
    label: "Text with image",
    fields: [
      ...common,
      body,
      ...imageFields,
      select("imageSide", "Image side", ["left", "right", "above"]),
      select("imageRatio", "Image ratio", ["original", "square", "landscape"]),
    ],
  },
  {
    name: "cardGrid",
    label: "Card grid",
    fields: [
      ...common,
      select("columns", "Columns", ["1", "2", "3"]),
      {
        type: "object",
        name: "cards",
        label: "Cards",
        list: true,
        ui: { itemProps: (item) => ({ label: item?.heading || "Card" }) },
        fields: [
          { type: "string", name: "eyebrow", label: "Eyebrow" },
          { type: "string", name: "heading", label: "Heading" },
          ...imageFields,
          body,
          { type: "string", name: "linkLabel", label: "Link label" },
          { type: "string", name: "linkUrl", label: "Link URL" },
        ],
      },
    ],
  },
  {
    name: "video",
    label: "Video embed",
    fields: [
      ...common,
      {
        type: "string",
        name: "url",
        label: "YouTube or Vimeo URL",
        required: true,
      },
      { type: "string", name: "caption", label: "Caption" },
      body,
    ],
  },
  {
    name: "feed",
    label: "Feed",
    fields: [
      ...common,
      { type: "string", name: "source", label: "RSS feed URL", required: true },
      {
        type: "number",
        name: "limit",
        label: "Item limit",
        ui: {
          validate: (value: number) =>
            Number.isInteger(value) && value >= 1 && value <= 12
              ? undefined
              : "Choose a whole number from 1 to 12.",
        },
      },
      select("presentation", "Presentation", ["featured", "list"]),
      { type: "string", name: "fallbackText", label: "Fallback text" },
      { type: "string", name: "fallbackUrl", label: "Fallback link URL" },
      { type: "string", name: "fallbackLabel", label: "Fallback link label" },
    ],
  },
].map((template) => ({
  ...template,
  ui: {
    defaultItem: {
      ...sectionDefaults,
      columns: "2",
      imageSide: "left",
      imageRatio: "landscape",
      limit: 6,
      presentation: "list",
    },
    itemProps: (item: { label?: string; heading?: string }) => ({
      label: item?.label || item?.heading || template.label,
    }),
  },
})) as Template[];

// A bounded layout container: its columns share the leaf section library.
// Containers do not recursively embed themselves in the Tina schema.
export const sectionTemplates: Template[] = [
  ...contentSectionTemplates,
  {
    name: "columns",
    label: "Columns",
    fields: [
      ...common,
      select("columns", "Columns", ["1", "2", "3"]),
      select("gap", "Column gap", ["small", "medium", "large"]),
      {
        type: "string",
        name: "verticalAlignment",
        label: "Vertical alignment",
        description:
          "Position columns from top to bottom. Text alignment controls left, center, or right.",
        options: [
          { value: "start", label: "Top" },
          { value: "center", label: "Center" },
          { value: "end", label: "Bottom" },
        ],
      },
      {
        type: "object",
        name: "items",
        label: "Column content",
        list: true,
        ui: { itemProps: (item) => ({ label: item?.label || "Column" }) },
        fields: [
          { type: "string", name: "label", label: "Editor label" },
          {
            type: "object",
            name: "sections",
            label: "Sections",
            list: true,
            templates: contentSectionTemplates,
          },
        ],
      },
    ],
    ui: {
      defaultItem: {
        ...sectionDefaults,
        columns: "2",
        verticalAlignment: "start",
        items: [],
      },
    },
  },
];
