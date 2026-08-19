import {
  routeFor,
} from "../urls";

import type {
  PublishableEntry,
  SiteContentEntry,
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

export function routeForSiteContentEntry(
  entry: SiteContentEntry,
): string {
  const slug = entry.data.slug;

  if (!slug) {
    throw new Error(
      `Entry ${entry.data.id} has no slug`,
    );
  }

  switch (entry.collection) {
    case "projects":
      return routeFor(
        "projects",
        slug,
      );

    case "fieldNotes":
      return routeFor(
        "fieldNotes",
        slug,
      );

    case "experiments":
      return routeFor(
        "experiments",
        slug,
      );

    case "artifacts": {
      const primaryProject =
        entry.data.projects[0];

      if (primaryProject) {
        return (
          `/projects/` +
          `${primaryProject.id}/` +
          `${slug}/`
        );
      }

      return routeFor(
        "artifacts",
        slug,
      );
    }
  }
}

export function routeForEntry(
  entry: PublishableEntry,
): string {
  return routeForSiteContentEntry(
    entry,
  );
}

export function labelForEntry(
  entry: PublishableEntry,
): string {
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