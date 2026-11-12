import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function migratePage(page) {
  if (page._template === "landing") {
    page.hero ||= {};
    for (const key of ["eyebrow", "heading"]) {
      if (page.hero[key] == null && page[key] != null)
        page.hero[key] = page[key];
      delete page[key];
    }
    page.hero.intro ??= [page.intro, page.hero.lead]
      .filter(Boolean)
      .join("\n\n");
    delete page.intro;
    delete page.hero.lead;
    if (page.hero.backgroundEffect == null && page.hero.treatment != null)
      page.hero.backgroundEffect = page.hero.treatment;
    delete page.hero.treatment;
  }
  const migrateSections = (sections = []) => {
    for (const section of sections || []) {
      if (!section) continue;
      if (
        section._template === "columns" &&
        section.verticalAlignment === "center"
      )
        section.gap ??= "large";
      const decoration = (section.decoration ||= {});
      if (section.treatment === "panel") decoration.padding ??= "medium";
      if (section.treatment === "outline") {
        decoration.padding ??= "medium";
        decoration.radius ??= "medium";
        decoration.border ??= {
          edges: ["top", "right", "bottom", "left"],
          weight: "thin",
          style: "solid",
          color: "border",
          accentEdge: "left",
          accentWeight: "thick",
          accentColor: "strong",
        };
        if (!section.background || section.background === "default")
          section.background = "tint";
      }
      if (section.divider)
        decoration.rules ??= {
          top: true,
          style: "solid",
          weight: "thin",
          color: "border",
          spacing: "large",
        };
      delete section.treatment;
      delete section.divider;
      if (!Object.keys(decoration).length) delete section.decoration;
      for (const item of section.items || []) migrateSections(item?.sections);
    }
  };
  migrateSections(page.sections);
  return page;
}
async function migrate(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await migrate(path);
    else if (entry.name.endsWith(".json")) {
      const old = await readFile(path, "utf8");
      const updated =
        JSON.stringify(migratePage(JSON.parse(old)), null, 2) + "\n";
      if (old !== updated) await writeFile(path, updated);
    }
  }
}
if (
  process.argv[1] &&
  import.meta.url === new URL(process.argv[1], "file://").href
)
  await migrate("content/pages");
