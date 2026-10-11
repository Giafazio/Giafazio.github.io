// Shared by the build and the browser. Keep editorial assignments out of this module.
type TagDefinition = { parent?: string; section?: string };
type TagDefinitions = Readonly<Record<string, TagDefinition>>;

export const primaryTags = [
  "artifact", "project", "experiment", "note", "fragment", "thought", "collection",
] as const;
export type PrimaryTag = typeof primaryTags[number];

export const secondaryTags = {
  article: {}, composition: {}, exercises: {},
  game: {}, crossword: { parent: "game" },
  graphics: {}, comic: { parent: "graphics" }, photo: {},
  lyrics: {}, poem: {}, "nursery-rhyme": { parent: "poem" },
  repository: {}, playlist: {},
} satisfies TagDefinitions;
type SecondaryTag = keyof typeof secondaryTags;

export const crossTags = {
  mathematics: { section: "Topics" }, physics: { section: "Topics" },
  literature: { section: "Topics" }, agronomy: { section: "Topics" },
  finance: { section: "Topics" }, genealogy: { section: "Topics" },
  typography: { section: "Topics" }, wordplay: { section: "Topics" },
  "visual arts": { section: "Topics" }, music: { section: "Topics" },
  image: { section: "Media" },
  translation: { section: "Features" }, solutions: { section: "Features" },
  simulation: { section: "Features" },
  "mathematical-analysis": { parent: "mathematics" },
  "set-theory": { parent: "mathematics" }, topology: { parent: "mathematics" },
} satisfies TagDefinitions;

const crossSectionLabels = ["Topics", "Media", "Features"] as const;
const secondaryTagNames = Object.keys(secondaryTags) as SecondaryTag[];
const workSecondaryTags = secondaryTagNames.filter(tag => tag !== "playlist");

const secondaryByPrimary: Readonly<Record<PrimaryTag, readonly SecondaryTag[]>> = {
  artifact: workSecondaryTags,
  experiment: workSecondaryTags,
  collection: ["playlist"],
  project: [], fragment: [], thought: [], note: [],
};

// An empty primary means All in the controls, never a content classification.
export function secondaryOptions(primary: string): readonly string[] {
  if (!primary) return secondaryTagNames;
  return Object.hasOwn(secondaryByPrimary, primary)
    ? secondaryByPrimary[primary as PrimaryTag] : [];
}

export function canAssignSecondary(primary: string, secondary: string): boolean {
  return Object.hasOwn(secondaryByPrimary, primary)
    && (!secondary || secondaryOptions(primary).includes(secondary));
}

export function validateTagDefinitions(
  definitions: TagDefinitions,
  group: string,
  sections?: readonly string[],
): void {
  for (const [tag, definition] of Object.entries(definitions)) {
    if (definition.parent && !Object.hasOwn(definitions, definition.parent)) {
      throw new Error(`Unknown parent "${definition.parent}" of ${group} tag "${tag}".`);
    }
    if (sections && (definition.parent
      ? definition.section !== undefined
      : !sections.includes(definition.section ?? ""))) {
      throw new Error(`Invalid section of ${group} tag "${tag}".`);
    }
    const visited = new Set<string>();
    let current: string | undefined = tag;
    while (current) {
      if (visited.has(current)) throw new Error(`Cycle in ${group} hierarchy at "${current}".`);
      visited.add(current);
      current = definitions[current]?.parent;
    }
  }
}

validateTagDefinitions(secondaryTags, "secondary");
validateTagDefinitions(crossTags, "cross", crossSectionLabels);

function parentsOf(definitions: TagDefinitions): Record<string, string> {
  return Object.fromEntries(Object.entries(definitions)
    .flatMap(([tag, definition]) => definition.parent ? [[tag, definition.parent]] : []));
}

export const tagParents: Record<string, Record<string, string>> = {
  secondary: parentsOf(secondaryTags),
  cross: parentsOf(crossTags),
};

export const crossSections = crossSectionLabels.map(label => ({
  label,
  values: Object.entries(crossTags).filter(([, definition]) =>
    "section" in definition && definition.section === label).map(([tag]) => tag),
}));

export function validateClassification(item: {
  id: string; primary: string; secondary: string; cross: readonly string[];
}): void {
  if (!Object.hasOwn(secondaryByPrimary, item.primary)) {
    throw new Error(`Unknown primary "${item.primary}" in "${item.id}".`);
  }
  if (item.secondary && !Object.hasOwn(secondaryTags, item.secondary)) {
    throw new Error(`Unknown secondary "${item.secondary}" in "${item.id}".`);
  }
  if (!canAssignSecondary(item.primary, item.secondary)) {
    throw new Error(`Secondary "${item.secondary}" is not allowed for ${item.primary} "${item.id}".`);
  }
  for (const tag of item.cross) {
    if (!Object.hasOwn(crossTags, tag)) throw new Error(`Unknown cross-cutting tag "${tag}" in "${item.id}".`);
  }
}

export function validateContentIds(ids: Iterable<string>, known: ReadonlySet<string>, context: string): void {
  for (const id of ids) {
    if (!known.has(id)) throw new Error(`Unknown content "${id}" in ${context}.`);
  }
}
