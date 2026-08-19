import type {
  CollectionEntry,
} from "astro:content";

export type ProjectEntry =
  CollectionEntry<"projects">;

export type FieldNoteEntry =
  CollectionEntry<"fieldNotes">;

export type ExperimentEntry =
  CollectionEntry<"experiments">;

export type ArtifactEntry =
  CollectionEntry<"artifacts">;

export type LogEntry =
  CollectionEntry<"logEntries">;

export type PublishableEntry =
  | FieldNoteEntry
  | ExperimentEntry
  | ArtifactEntry;

export type SiteContentEntry =
  | ProjectEntry
  | PublishableEntry;

export type CreationDate =
  PublishableEntry["data"]["creationDate"];

export type AutomaticLogType =
  | "new-note"
  | "new-thought"
  | "new-experiment"
  | "new-fragment"
  | "new-artifact";

export type LogOperation =
  | "add"
  | "update";

export type LogHeadlineLayout =
  | "inline"
  | "stacked";

export interface LogChange {
  operation: LogOperation;
  label: string;
}

export interface LogTarget {
  id: string;
  title: string;
  href: string;
}

export interface LogDetailsLink {
  label: string;
  href: string;
}

export interface LogEventLine {
  operation: LogOperation;
  label: string;
  message: string | null;
  href: string | null;
  typeLabel: string;
  language: string | null;
}

interface LogItemBase {
  id: string;
  loggedOn: string;
  order: number | null;
  comment: string | null;
  detailsLink: LogDetailsLink | null;
}

export type LogItem =
  | (
      LogItemBase & {
        kind: "single";
        source: "automatic";
        type: AutomaticLogType;
        headlineLayout: "inline";
        changes: LogChange[];
        line: LogEventLine;
        targets: LogTarget[];
        manualEntry: null;
      }
    )
  | (
      LogItemBase & {
        kind: "single";
        source: "manual";

        type: Exclude<
          LogEntry["data"]["type"],
          "content-batch"
        >;

        headlineLayout:
          LogHeadlineLayout;

        changes: LogChange[];
        line: LogEventLine;
        targets: LogTarget[];
        manualEntry: LogEntry;
      }
    )
  | (
      LogItemBase & {
        kind: "batch";
        source: "manual";
        type: "content-batch";
        operation: LogOperation;
        title: string;
        items: LogEventLine[];
        manualEntry: LogEntry;
      }
    );

export interface SiteData {
  projects: ProjectEntry[];
  fieldNotes: FieldNoteEntry[];
  experiments: ExperimentEntry[];
  artifacts: ArtifactEntry[];
  logEntries: LogEntry[];

  publicProjects: ProjectEntry[];
  publicFieldNotes: FieldNoteEntry[];
  publicExperiments: ExperimentEntry[];
  publicArtifacts: ArtifactEntry[];
  publicLogEntries: LogEntry[];
}