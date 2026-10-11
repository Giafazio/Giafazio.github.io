import { isCollectionEntry } from "./collections";

import type {
  PublishableEntry,
} from "./types";

export function collectionNameFor(
  entry: PublishableEntry,
):
  | "fieldNotes"
  | "experiments"
  | "artifacts" {
  if ("artifactKind" in entry.data) {
    return "artifacts";
  }

  if (
    "entryKind" in entry.data &&
    entry.collection === "fieldNotes"
  ) {
    return "fieldNotes";
  }

  return "experiments";
}

export function labelForEntry(
  entry: PublishableEntry,
): string {
  if (isCollectionEntry(entry)) return "Collection";

  if ("artifactKind" in entry.data) {
    return (
      `Artifact · ` +
      entry.data.artifactKind
    );
  }

  return entry.data.entryKind ===
    "site-note"
    ? "Site note"
    : entry.data.entryKind ===
        "thought"
      ? "Thought"
      : entry.data.entryKind ===
          "experiment"
        ? "Experiment"
        : "Fragment";
}
