import {
  existsSync,
} from "node:fs";

import {
  dirname,
  join,
} from "node:path";

import {
  routeFor,
} from "../../urls";

import {
  automaticReplacementTargetIds,
  logTargetIds,
} from "../log-targets";

import type {
  ArtifactEntry,
  ExperimentEntry,
  FieldNoteEntry,
  ProjectEntry,
  SiteContentEntry,
  SiteData,
} from "../types";

const projectRoot = process.env.npm_package_json
  ? dirname(process.env.npm_package_json)
  : process.cwd();

const publicRoot = join(projectRoot, "public");

function canonicalUrl(
  collection: "projects" | "fieldNotes" | "experiments" | "artifacts",
  entry: ProjectEntry | FieldNoteEntry | ExperimentEntry | ArtifactEntry,
): string | null {
  const slug = entry.data.slug;
  if (!slug) return null;
  return routeFor(collection, slug);
}

function validateLanguage(language: string | undefined, id: string): void {
  if (!language) return;
  try {
    Intl.getCanonicalLocales(language);
  } catch {
    throw new Error(`Invalid BCP 47 language code "${language}" in ${id}`);
  }
}

function validatePublicAsset(path: string, id: string): void {
  if (!path.startsWith("/")) {
    throw new Error(`Public asset "${path}" in ${id} must start with /`);
  }

  const filePath = join(publicRoot, path.replace(/^\/+/, ""));
  if (!existsSync(filePath)) {
    throw new Error(`Missing public asset "${path}" declared by ${id}`);
  }
}

export function validateSiteData(data: SiteData): void {
  const allGroups = [
    ["projects", data.projects],
    ["fieldNotes", data.fieldNotes],
    ["experiments", data.experiments],
    ["artifacts", data.artifacts],
  ] as const;

  const idOwners = new Map<string, string>();
  const urlOwners = new Map<string, string>();
  const projectById = new Map(
    data.projects.map((entry) => [entry.data.id, entry])
  );
  const contentById =
    new Map<string, SiteContentEntry>();

  for (const [collection, entries] of allGroups) {
    for (const entry of entries) {
      const {
        id,
        title,
        draft,
        related,
        language,
      } = entry.data;

      if (idOwners.has(id)) {
        throw new Error(
          `Duplicate content id "${id}" in ${collection} and ${idOwners.get(id)}`,
        );
      }
      idOwners.set(id, collection);

      contentById.set(
        id,
        entry as SiteContentEntry,
      );

      if (!draft && !title) {
        throw new Error(`Public entry ${id} has no visible title`);
      }

      if (
        !draft &&
        entry.collection !== "projects"
      ) {
        if (!entry.data.addedToSite) {
          throw new Error(
            `Public entry ${id} has no addedToSite date`,
          );
        }
      }

      validateLanguage(language, id);

      const url = canonicalUrl(collection, entry);
      if (!draft && !url) {
        throw new Error(`Public entry ${id} has no canonical slug`);
      }
      if (url) {
        if (urlOwners.has(url)) {
          throw new Error(`Duplicate canonical URL "${url}"`);
        }
        urlOwners.set(url, id);
      }

      for (const relatedId of related) {
        if (!idOwners.has(relatedId)) {
          // A second pass below catches forward references.
          continue;
        }
      }
    }
  }

  for (const [, entries] of allGroups) {
    for (const entry of entries) {
      for (const relatedId of entry.data.related) {
        if (!idOwners.has(relatedId)) {
          throw new Error(
            `Entry ${entry.data.id} points to missing related id ${relatedId}`,
          );
        }
      }
    }
  }

  const relatedContent = [
    ...data.fieldNotes,
    ...data.experiments,
    ...data.artifacts,
  ];

  for (const entry of relatedContent) {
    for (const relation of entry.data.projects) {
      const project = projectById.get(relation.id);
      if (!project) {
        throw new Error(
          `Entry ${entry.data.id} points to missing project ${relation.id}`,
        );
      }
      if (!entry.data.draft && project.data.draft) {
        throw new Error(
          `Public entry ${entry.data.id} points to draft project ${relation.id}`,
        );
      }
    }
  }
  
  const logIdOwners = new Set<string>();

  for (const logEntry of data.logEntries) {
    const {
      id,
      draft,
      replacesAutomaticEntries,
    } = logEntry.data;

    const targetIds =
      logTargetIds(logEntry);

    if (logIdOwners.has(id)) {
      throw new Error(
        `Duplicate log entry id "${id}"`,
      );
    }

    logIdOwners.add(id);

    if (
      replacesAutomaticEntries &&
      automaticReplacementTargetIds(
        logEntry,
      ).length === 0
    ) {
      throw new Error(
        `Replacing log entry ${id} has no add targets`,
      );
    }

    for (
      const targetId of targetIds
    ) {
      const target =
        contentById.get(targetId);

      if (!target) {
        throw new Error(
          `Log entry ${id} points to missing content ${targetId}`,
        );
      }

      if (
        !draft &&
        target.data.draft
      ) {
        throw new Error(
          `Public log entry ${id} points to draft content ${targetId}`,
        );
      }
    }
  }

  /*
  * Due voci manuali pubbliche non possono
  * entrambe dichiarare di sostituire la voce
  * automatica dello stesso contenuto.
  */
  const replacementOwners =
    new Map<string, string>();

  for (
    const logEntry of
    data.publicLogEntries
  ) {
    for (
      const targetId of
      automaticReplacementTargetIds(
        logEntry,
      )
    ) {
      const previousOwner =
        replacementOwners.get(targetId);

      if (previousOwner) {
        throw new Error(
          `Automatic log entry for ${targetId} is replaced by both ${previousOwner} and ${logEntry.data.id}`,
        );
      }

      replacementOwners.set(
        targetId,
        logEntry.data.id,
      );
    }
  }

  for (const entry of [...data.publicArtifacts, ...data.publicFieldNotes]) {
    if ("primaryAsset" in entry.data && entry.data.primaryAsset) {
      validatePublicAsset(entry.data.primaryAsset, entry.data.id);
    }
    if ("previewAsset" in entry.data && entry.data.previewAsset) {
      validatePublicAsset(entry.data.previewAsset, entry.data.id);
    }
    if ("pdfAsset" in entry.data && entry.data.pdfAsset) {
      validatePublicAsset(entry.data.pdfAsset, entry.data.id);
    }
  }
}