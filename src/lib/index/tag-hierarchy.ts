export const tagParents: Record<string, Record<string, string>> = {
  secondary: { "nursery-rhyme": "poem", crossword: "game", comic: "graphics" },
  cross: { "mathematical-analysis": "mathematics", "set-theory": "mathematics", topology: "mathematics" },
};

export function tagPath(group: string, tag: string): string[] {
  const parent = tagParents[group]?.[tag];
  return parent ? [...tagPath(group, parent), tag] : [tag];
}

export function matchesTag(group: string, selected: string, assigned: string[]) {
  return !selected || assigned.some(tag => tagPath(group, tag).includes(selected));
}
