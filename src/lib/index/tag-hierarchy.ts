import { tagParents } from "./taxonomy-rules.ts";
export { tagParents } from "./taxonomy-rules.ts";

export function tagPath(group: string, tag: string): string[] {
  const parent = tagParents[group]?.[tag];
  return parent ? [...tagPath(group, parent), tag] : [tag];
}

export function matchesTag(group: string, selected: string, assigned: string[]) {
  return !selected || assigned.some(tag => tagPath(group, tag).includes(selected));
}
