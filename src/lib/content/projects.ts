import type {
  PublishableEntry,
  SiteData,
} from "./types";

export function getProjectContents(
  data: SiteData,
  projectId: string,
): PublishableEntry[] {
  const contents = [
    ...data.publicFieldNotes,
    ...data.publicExperiments,
    ...data.publicArtifacts,
  ].filter((entry) =>
    entry.data.projects.some(
      (relation) =>
        relation.id === projectId,
    ),
  );

  return contents.sort(
    (firstEntry, secondEntry) => {
      const firstRelation =
        firstEntry.data.projects.find(
          (relation) =>
            relation.id === projectId,
        );

      const secondRelation =
        secondEntry.data.projects.find(
          (relation) =>
            relation.id === projectId,
        );

      if (
        firstRelation?.highlight !==
        secondRelation?.highlight
      ) {
        return firstRelation?.highlight
          ? -1
          : 1;
      }

      return (
        (firstRelation?.order ??
          Number.MAX_SAFE_INTEGER) -
        (secondRelation?.order ??
          Number.MAX_SAFE_INTEGER)
      );
    },
  );
}