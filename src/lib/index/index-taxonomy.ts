import type { ProjectEntry, PublishableEntry } from "../content";
import { routeForSiteContentEntry } from "../content";
import { tagPath } from "./tag-hierarchy";

// Approved Index classifications, shared by the Atlas and its previews.
const topicAssignments: Record<string, string[]> = {
  Music: ["symphojingles", "avventura-autunno", "passi-sparsi-tra-spicchi-di-mondi", "fortissimi-sumus", "quod-mihi-fatum-est", "hey-fool", "il-silenzio-della-luna"],
  Literature: ["poetry-collection", "chamber-music", "corrispondenze", "ricordami", "un-giorno-scrissi-il-suo-nome", "meriggiare-pallido-e-smorto", "hey-fool", "ho-visto-un-gatto"],
  Mathematics: ["quantum-transport-rg", "math-notes", "risoluzione-esercizi-con-asterisco", "risoluzione-problemi-di-analisi", "un-teorema-sui-continui", "la-signorina-probabilita"],
  Physics: ["quantum-transport-rg"],
  Agronomy: ["agroxel"],
  Simulation: ["agroxel", "esperimenti-di-portafoglio"],
  Finance: ["esperimenti-di-portafoglio"],
  Genealogy: ["caragiulorigin", "albero-fabrizio"],
  Typography: ["quellotondo"],
  Wordplay: ["games-and-riddles", "cruciverba", "cruciverba-1", "cruciverba-2", "cruciverba-3", "mini-cruci-1", "lega-i-4"],
  "Visual arts": ["fumettonzi", "fumettonzi-007", "fumettonzi-008", "fumettonzi-009", "fumettonzi-010", "fumettonzi-013", "fumettonzi-014", "fumettonzi-015", "fumettonzi-nessuno", "fumettonzi-uomo-lasagna", "vaccase", "astruzzeneca", "girapfizer", "lamaderna", "stemma-vaccase", "cervi-units", "virgola"],
};

// The same secondary vocabulary applies to artifacts and experiments.
const secondaryAssignments: Record<string, string> = {
  "avventura-autunno": "composition",
  "risoluzione-esercizi-con-asterisco": "exercises",
  "risoluzione-problemi-di-analisi": "exercises",
  "un-teorema-sui-continui": "article",
  "il-silenzio-della-luna": "lyrics",
  "ho-visto-un-gatto": "nursery-rhyme",
};

export function indexItem(entry: ProjectEntry | PublishableEntry) {
  const d = entry.data;
  let primary: string;
  let secondary = "";
  let review = "";
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
  if (primary === "artifact" || primary === "experiment") {
    secondary = secondaryAssignments[d.id] ?? secondary;
    if (secondary === "image") secondary = "graphics";
  }
  const cross = [...new Set([
    ...Object.entries(topicAssignments).filter(([, ids]) => ids.includes(d.id)).map(([label]) => label.toLowerCase()),
    ...d.subjects,
    ...(("translation" in d && d.translation) || d.tags.includes("translation") ? ["translation"] : []),
    ...(d.tags.includes("solutions") ? ["solutions"] : []),
    // Images span graphic works (including comics) and future photographs.
    ...(tagPath("secondary", secondary).includes("graphics") || secondary === "photo" ? ["image"] : []),
  ])].sort().filter((tag, _, all) => !all.some(other => other !== tag && tagPath("cross", other).includes(tag)));
  if (!cross.length) review += " Tag trasversali ancora da valutare.";
  return { id: d.id, title: d.title ?? ("workingLabel" in d ? d.workingLabel : undefined) ?? d.id,
    href: routeForSiteContentEntry(entry), primary, secondary, cross, review: review.trim(), stage: d.stage,
    language: d.language ?? "", externalDestination: "" };
}

// Explicit assignments for the two approved external works, independent of project tags.
export function externalIndexItems(projects: ProjectEntry[]) {
  const assignments: Record<string, { kind: string; secondary: string; cross: string[]; destination: string }> = {
    "esperimenti-di-portafoglio": { kind: "repository", secondary: "repository", cross: ["finance", "simulation"], destination: "GitHub" },
    "quantum-transport-rg": { kind: "research article", secondary: "article", cross: ["mathematics", "physics"], destination: "Springer" },
  };
  return projects.flatMap(project => {
    const assignment = assignments[project.data.id];
    if (!assignment) return [];
    return project.data.externalContents.filter(item => item.kind === assignment.kind).map(item => ({
      id: `external:${item.href}`, title: item.title, href: item.href, primary: "artifact",
      secondary: assignment.secondary, cross: assignment.cross, stage: item.stage,
      language: item.language, review: "", externalDestination: assignment.destination,
    }));
  });
}
