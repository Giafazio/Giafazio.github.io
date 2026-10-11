import type {
  ArtifactEntry,
  ProjectEntry,
  PublishableEntry,
  SiteContentEntry,
} from "./types";
import { routeFor } from "../urls.ts";

export function resolveArtifactRoute(
  artifact: ArtifactEntry,
  projects: readonly ProjectEntry[],
) {
  const artifactSlug = artifact.data.slug;
  if (!artifactSlug) {
    throw new Error(`Entry ${artifact.data.id} has no slug`);
  }
  const standalonePath = routeFor("artifacts", artifactSlug);
  const projectId = artifact.data.projects[0]?.id;

  if (!projectId) {
    return {
      kind: "standalone" as const,
      project: null,
      path: standalonePath,
      standalonePath,
      params: { slug: artifactSlug },
    };
  }

  const project = projects.find((entry) => entry.data.id === projectId);
  if (!project) {
    throw new Error(
      `Artifact ${artifact.data.id} refers to missing project ${projectId}`,
    );
  }

  // L'ID identifica la relazione; lo slug determina l'indirizzo.
  const projectSlug = project.data.slug;
  return {
    kind: "project" as const,
    project,
    path: `${routeFor("projects", projectSlug)}${artifactSlug}/`,
    standalonePath,
    params: { projectSlug, artifactSlug },
  };
}

export function routeForSiteContentEntry(
  entry: SiteContentEntry,
  projects: readonly ProjectEntry[],
): string {
  const slug = entry.data.slug;
  if (!slug) {
    throw new Error(`Entry ${entry.data.id} has no slug`);
  }
  if (entry.collection === "artifacts") {
    return resolveArtifactRoute(entry, projects).path;
  }
  return routeFor(entry.collection, slug);
}

export function routeForEntry(
  entry: PublishableEntry,
  projects: readonly ProjectEntry[],
): string {
  return routeForSiteContentEntry(entry, projects);
}

export function validateContentRoutes(
  entries: readonly SiteContentEntry[],
  projects: readonly ProjectEntry[],
): void {
  const pathOwners = new Map<string, string>();
  const registerPath = (path: string, id: string) => {
    const previousOwner = pathOwners.get(path);
    if (previousOwner !== undefined && previousOwner !== id) {
      throw new Error(`URL ${path} is shared by ${previousOwner} and ${id}`);
    }
    pathOwners.set(path, id);
  };

  for (const entry of entries) {
    // Le bozze possono non avere ancora un indirizzo, come prima.
    if (!entry.data.slug) continue;
    registerPath(routeForSiteContentEntry(entry, projects), entry.data.id);
    if (entry.collection === "artifacts") {
      // Anche l'alias occupa un indirizzo e deve essere univoco.
      registerPath(routeFor("artifacts", entry.data.slug), entry.data.id);
    }
  }
}
