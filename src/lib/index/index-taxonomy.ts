import type { ProjectEntry, SiteContentEntry, SiteData } from "../content/types";
import { routeForSiteContentEntry } from "../content/routing";
import { externalAssignments, secondaryAssignments, topicAssignments } from "./index-assignments";
import { tagPath } from "./tag-hierarchy";
import { validateClassification, validateContentIds } from "./taxonomy-rules";

// Classification is independent of routing: drafts may not have a slug yet.
function classificationFor(entry: SiteContentEntry) {
  const d = entry.data;
  let primary: string;
  let secondary = "";
  switch (entry.collection) {
    case "projects": primary = "project"; break;
    case "artifacts":
      primary = "artifact";
      if (entry.data.projects.some(p => p.id === "fumettonzi")) secondary = "comic";
      else secondary = entry.data.artifactKind;
      break;
    case "fieldNotes":
      primary = entry.data.entryKind === "site-note" ? "note" : entry.data.entryKind;
      if (entry.data.entryKind === "collection" && entry.data.collectionKind === "playlist") secondary = "playlist";
      break;
    case "experiments":
      primary = entry.data.entryKind;
      break;
  }
  // Translate the existing renderer kind before applying Index-only assignments.
  if (secondary === "image") secondary = "graphics";
  secondary = secondaryAssignments[d.id] ?? secondary;
  const cross = [...new Set([
    ...Object.entries(topicAssignments).filter(([, ids]) => ids.includes(d.id)).map(([label]) => label.toLowerCase()),
    ...d.subjects,
    ...(("translation" in d && d.translation) || d.tags.includes("translation") ? ["translation"] : []),
    ...(d.tags.includes("solutions") ? ["solutions"] : []),
    // Images span graphic works (including comics) and future photographs.
    ...(tagPath("secondary", secondary).includes("graphics") || secondary === "photo" ? ["image"] : []),
  ])].sort().filter((tag, _, all) => !all.some(other => other !== tag && tagPath("cross", other).includes(tag)));
  const classification = { primary, secondary, cross };
  validateClassification({ id: d.id, ...classification });
  return classification;
}

export function indexItem(entry: SiteContentEntry, projects: readonly ProjectEntry[]) {
  const d = entry.data;
  const { primary, secondary, cross } = classificationFor(entry);
  const review = cross.length ? "" : "Tag trasversali ancora da valutare.";
  return { id: d.id, title: d.title ?? ("workingLabel" in d ? d.workingLabel : undefined) ?? d.id,
    href: routeForSiteContentEntry(entry, projects), primary, secondary, cross, review, stage: d.stage,
    language: d.language ?? "", externalDestination: "" };
}

// Explicit assignments for the two approved external works, independent of project tags.
export function externalIndexItems(projects: ProjectEntry[]) {
  return projects.flatMap(project => {
    if (project.data.externalContents.length === 0) return [];
    const assignment = externalAssignments[project.data.id];
    if (!assignment) {
      throw new Error(`External contents of "${project.data.id}" need an Index classification.`);
    }
    for (const item of project.data.externalContents) {
      if (item.kind !== assignment.kind) {
        throw new Error(
          `External content "${item.title}" in "${project.data.id}" ` +
          `needs an Index classification.`,
        );
      }
    }
    return project.data.externalContents.map(item => {
      const result = {
        id: `external:${item.href}`, title: item.title, href: item.href, primary: "artifact",
        secondary: assignment.secondary, cross: assignment.cross, stage: item.stage,
        language: item.language, review: "", externalDestination: assignment.destination,
      };
      validateClassification(result);
      return result;
    });
  });
}

export function validateIndexData(data: SiteData): void {
  const entries = [...data.projects, ...data.fieldNotes, ...data.experiments, ...data.artifacts];
  const knownIds = new Set(entries.map(entry => entry.data.id));
  for (const [topic, ids] of Object.entries(topicAssignments)) {
    validateContentIds(ids, knownIds, `Index topic "${topic}"`);
    validateClassification({ id: `topic assignment: ${topic}`, primary: "project", secondary: "", cross: [topic.toLowerCase()] });
  }
  validateContentIds(Object.keys(secondaryAssignments), knownIds, "Index secondary assignments");
  validateContentIds(Object.keys(externalAssignments), new Set(data.projects.map(project => project.data.id)), "Index external assignments");
  for (const [id, assignment] of Object.entries(externalAssignments)) {
    validateClassification({ id: `external assignment: ${id}`, primary: "artifact", ...assignment });
  }
  for (const entry of entries) {
    classificationFor(entry);
  }
  externalIndexItems(data.projects);
}
