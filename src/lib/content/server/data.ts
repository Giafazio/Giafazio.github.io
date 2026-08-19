import {
  getCollection,
} from "astro:content";

import {
  compareCreationDate,
} from "../dates";

import type {
  LogEntry,
  ProjectEntry,
  SiteData,
} from "../types";

import {
  validateSiteData,
} from "./validation";

let siteDataPromise: Promise<SiteData> | undefined;

function compareProjectOrder(a: ProjectEntry, b: ProjectEntry): number {
  return (a.data.order ?? Number.MAX_SAFE_INTEGER) -
    (b.data.order ?? Number.MAX_SAFE_INTEGER) ||
    a.data.title.localeCompare(b.data.title);
}

function compareManualLogEntries(
  a: LogEntry,
  b: LogEntry,
): number {
  return (
    b.data.loggedOn.localeCompare(
      a.data.loggedOn,
    ) ||
    (a.data.order ??
      Number.MAX_SAFE_INTEGER) -
      (b.data.order ??
        Number.MAX_SAFE_INTEGER) ||
    a.data.id.localeCompare(b.data.id)
  );
}

async function loadSiteData():
  Promise<SiteData> {
  const [
    projects,
    fieldNotes,
    experiments,
    artifacts,
    logEntries,
  ] = await Promise.all([
    getCollection("projects"),
    getCollection("fieldNotes"),
    getCollection("experiments"),
    getCollection("artifacts"),
    getCollection("logEntries"),
  ]);

  const data: SiteData = {
    projects:
      projects.sort(
        compareProjectOrder,
      ),

    fieldNotes:
      fieldNotes.sort(
        compareCreationDate,
      ),

    experiments:
      experiments.sort(
        compareCreationDate,
      ),

    artifacts:
      artifacts.sort(
        compareCreationDate,
      ),

    logEntries:
      logEntries.sort(
        compareManualLogEntries,
      ),

    publicProjects:
      projects.filter(
        (entry) => !entry.data.draft,
      ),

    publicFieldNotes:
      fieldNotes.filter(
        (entry) => !entry.data.draft,
      ),

    publicExperiments:
      experiments.filter(
        (entry) => !entry.data.draft,
      ),

    publicArtifacts:
      artifacts.filter(
        (entry) => !entry.data.draft,
      ),

    publicLogEntries:
      logEntries.filter(
        (entry) => !entry.data.draft,
      ),
  };

  validateSiteData(data);

  return data;
}

export function getSiteData(): Promise<SiteData> {
  siteDataPromise ??= loadSiteData();
  return siteDataPromise;
}