import {
  routeForSiteContentEntry,
} from "./entries";

import {
  automaticReplacementTargetIds,
} from "./log-targets";

import type {
  AutomaticLogType,
  LogEntry,
  LogEventLine,
  LogItem,
  LogOperation,
  LogTarget,
  PublishableEntry,
  SiteContentEntry,
  SiteData,
} from "./types";

const MANUAL_LOG_TYPE_LABELS = {
  "site-update": "SiteUpdate",
  "content-batch": "ContentBatch",
  "content-update": "ContentUpdate",
  "project-update": "ProjUpdate",
  announcement: "Announcement",
  "new-project": "Project",
  "new-note": "Note",
  "new-thought": "Thought",
  "new-experiment": "Experiment",
  "new-fragment": "Fragment",
  "new-artifact": "Artifact",
} satisfies Record<
  LogEntry["data"]["type"],
  string
>;

interface AutomaticLogPresentation {
  type: AutomaticLogType;
  typeLabel: string;
  message: string;
}

function automaticLogPresentation(
  entry: PublishableEntry,
): AutomaticLogPresentation {
  switch (entry.collection) {
    case "fieldNotes":
      return entry.data.entryKind === "site-note"
        ? {
            type: "new-note",
            typeLabel: "Note",
            message: "New note added.",
          }
        : {
            type: "new-thought",
            typeLabel: "Thought",
            message: "New thought added.",
          };

    case "experiments":
      return entry.data.entryKind === "experiment"
        ? {
            type: "new-experiment",
            typeLabel: "Experiment",
            message: "New experiment added!",
          }
        : {
            type: "new-fragment",
            typeLabel: "Fragment",
            message: "New fragment added!",
          };

    case "artifacts":
      switch (entry.data.artifactKind) {
        case "crossword":
        case "game":
          return {
            type: "new-artifact",
            typeLabel: "Games",
            message: "New game added!",
          };

        case "poem":
          return {
            type: "new-artifact",
            typeLabel: "Poem",
            message: "New poem added!",
          };
        case "lyrics":
          return {
            type: "new-artifact",
            typeLabel: "Lyrics",
            message: "New lyrics added!",
          };
        case "image":
          return {
            type: "new-artifact",
            typeLabel: "Image",
            message: "New image added!",
          };
        case "font":
          return {
            type: "new-artifact",
            typeLabel: "Font",
            message: "New font added!",
          };
      }
  }
}

function defaultLogTypeLabel(
  entry: SiteContentEntry,
  operation: LogOperation,
): string {
  switch (entry.collection) {
    case "projects":
      return operation === "update"
        ? "ProjUpdate"
        : "Project";

    case "fieldNotes":
      return entry.data.entryKind === "thought"
        ? "Thought"
        : "Note";

    case "experiments":
      return entry.data.entryKind === "fragment"
        ? "Fragment"
        : "Experiment";

    case "artifacts":
      switch (entry.data.artifactKind) {
        case "crossword":
        case "game":
          return "Games";

        case "poem":
          return "Poem";
        
        case "lyrics":
          return "Lyrics";

        case "font":
          return "Font";
          
        case "image":
          return "Image";
      }
  }
}

const LOG_LANGUAGE_LABELS:
  Record<string, string> = {
    it: "ITA",
    en: "ENG",
    fr: "FRA",
    de: "DEU",
    es: "SPA",
    pt: "POR",
    la: "LAT",
  };

function logLanguageLabel(
  entry: SiteContentEntry,
): string | null {
  const language = entry.data.language;

  if (!language) {
    return null;
  }

  const primaryLanguage =
    new Intl.Locale(language).language;

  return (
    LOG_LANGUAGE_LABELS[
      primaryLanguage
    ] ??
    primaryLanguage.toUpperCase()
  );
}

function visibleContentTitle(
  entry: SiteContentEntry,
): string {
  if (!entry.data.title) {
    throw new Error(
      `Public content ${entry.data.id} has no title`,
    );
  }

  return entry.data.title;
}

function makeLogTarget(
  entry: SiteContentEntry,
): LogTarget {
  return {
    id: entry.data.id,
    title: visibleContentTitle(entry),
    href:
      routeForSiteContentEntry(entry),
  };
}

export function getLogItems(
  data: SiteData,
): LogItem[] {
  const publicContent:
    SiteContentEntry[] = [
      ...data.publicProjects,
      ...data.publicFieldNotes,
      ...data.publicExperiments,
      ...data.publicArtifacts,
    ];

    const automaticallyLoggedContent:
      PublishableEntry[] = [
        ...data.publicFieldNotes,
        ...data.publicExperiments,
        ...data.publicArtifacts,
      ];

  const publicContentById =
    new Map(
      publicContent.map(
        (entry) =>
          [
            entry.data.id,
            entry,
          ] as const,
      ),
    );
  const requirePublicTarget = (
    targetId: string,
    logEntryId: string,
  ): SiteContentEntry => {
    const target =
      publicContentById.get(
        targetId,
      );

    if (!target) {
      throw new Error(
        `Public log entry ${logEntryId} has an unavailable target ${targetId}`,
      );
    }

    return target;
  };
  /*
  * Soltanto le operazioni add appartenenti
  * a voci che dichiarano esplicitamente la
  * sostituzione sopprimono un Log automatico.
  */
  const replacedContentIds =
    new Set(
      data.publicLogEntries.flatMap(
        automaticReplacementTargetIds,
      ),
    );

  const automaticItems:
    LogItem[] = [];

  for (
    const entry of
    automaticallyLoggedContent
  ) {
    if (
      entry.data.omitFromLog ||
      replacedContentIds.has(
        entry.data.id,
      )
    ) {
      continue;
    }

    const loggedOn =
      entry.data.addedToSite;

    if (!loggedOn) {
      /*
       * validateSiteData() dovrebbe aver
       * già intercettato questo caso.
       */
      throw new Error(
        `Public content ${entry.data.id} has no addedToSite date`,
      );
    }

    const presentation =
      automaticLogPresentation(entry);

    const target =
      makeLogTarget(entry);

    automaticItems.push({
      id:
        `automatic:${entry.data.id}`,

      kind: "single",
      source: "automatic",

      loggedOn,
      order: null,

      type:
        presentation.type,

      headlineLayout: "inline",
      changes: [],

      line: {
        operation: "add",

        label:
          target.title,

        message:
          presentation.message,

        href:
          target.href,

        typeLabel:
          presentation.typeLabel,

        language:
          logLanguageLabel(entry),
      },

      /*
      * logComment resta separato dal
      * messaggio automatico della headline.
      */
      comment:
        entry.data.logComment ??
        null,

      targets: [target],
      detailsLink: null,
      manualEntry: null,
    });
  }

  const manualItems: LogItem[] =
    data.publicLogEntries.map(
      (entry): LogItem => {
        /*
        * I batch usano items[].target e
        * producono più righe strutturate.
        */
        if (
          entry.data.type ===
          "content-batch"
        ) {
          const items:
            LogEventLine[] =
            entry.data.items.map(
              (item) => {
                const targetEntry =
                  requirePublicTarget(
                    item.target,
                    entry.data.id,
                  );

                const target =
                  makeLogTarget(
                    targetEntry,
                  );

                return {
                  operation:
                    item.operation,

                  label:
                    item.label ??
                    target.title,

                  message:
                    item.message ??
                    null,

                  href:
                    item.href ??
                    target.href,

                  typeLabel:
                    item.typeLabel ??
                    defaultLogTypeLabel(
                      targetEntry,
                      item.operation,
                    ),

                  language:
                    logLanguageLabel(
                      targetEntry,
                    ),
                };
              },
            );

          return {
            id:
              `manual:${entry.data.id}`,

            kind: "batch",
            source: "manual",

            loggedOn:
              entry.data.loggedOn,

            order:
              entry.data.order ??
              null,

            type:
              "content-batch",

            operation:
              entry.data.operation,

            title:
              entry.data.title,

            items,

            comment:
              entry.data.comment ??
              null,

            detailsLink:
              entry.data.detailsLink ??
              null,

            manualEntry: entry,
          };
        }

        /*
        * Le voci non batch continuano a
        * usare il campo targets.
        */
        const targetEntries =
          entry.data.targets.map(
            (targetId) =>
              requirePublicTarget(
                targetId,
                entry.data.id,
              ),
          );

        const targets =
          targetEntries.map(
            makeLogTarget,
          );

        const soleTargetEntry =
          targetEntries.length === 1
            ? targetEntries[0] ??
              null
            : null;

        const soleTarget =
          targets.length === 1
            ? targets[0] ??
              null
            : null;

        const usesStructuredHeadline =
          entry.data.label !==
            undefined ||
          entry.data.message !==
            undefined;

        /*
        * Solo la headline strutturata collega
        * inline il proprio unico target.
        *
        * Le vecchie voci basate soltanto su
        * title restano indivisibili.
        */
        const linkedTarget =
          usesStructuredHeadline
            ? soleTarget
            : null;

        const lineLabel =
          usesStructuredHeadline
            ? entry.data.label ??
              (
                soleTargetEntry
                  ? visibleContentTitle(
                      soleTargetEntry,
                    )
                  : entry.data.title
              )
            : entry.data.title;

        const line: LogEventLine = {
          operation:
            entry.data.operation,

          label:
            lineLabel,

          message:
            usesStructuredHeadline
              ? entry.data.message ??
                null
              : null,

          href:
            linkedTarget?.href ??
            null,

          typeLabel:
            entry.data.typeLabel ??
            MANUAL_LOG_TYPE_LABELS[
              entry.data.type
            ],

          language:
            soleTargetEntry
              ? logLanguageLabel(
                  soleTargetEntry,
                )
              : null,
        };

        return {
          id:
            `manual:${entry.data.id}`,

          kind: "single",
          source: "manual",

          loggedOn:
            entry.data.loggedOn,

          order:
            entry.data.order ??
            null,

          type:
            entry.data.type,

          headlineLayout:
            entry.data.headlineLayout,

          changes:
            entry.data.changes.map(
              (change) => ({
                operation: change.operation,
                label: change.label,
              }),
            ),

          line,

          comment:
            entry.data.comment ??
            null,

          targets,

          detailsLink:
            entry.data.detailsLink ??
            null,

          manualEntry: entry,
        };
      },
    );

  return [
    ...manualItems,
    ...automaticItems,
  ].sort((a, b) => {
    const dateDifference =
      b.loggedOn.localeCompare(
        a.loggedOn,
      );

    if (dateDifference !== 0) {
      return dateDifference;
    }

    const orderDifference =
      (a.order ??
        Number.MAX_SAFE_INTEGER) -
      (b.order ??
        Number.MAX_SAFE_INTEGER);

    if (orderDifference !== 0) {
      return orderDifference;
    }

    /*
     * A parità di giorno e ordine, una
     * voce manuale precede una automatica.
     */
    const sourceDifference =
      (a.source === "manual"
        ? 0
        : 1) -
      (b.source === "manual"
        ? 0
        : 1);

    if (sourceDifference !== 0) {
      return sourceDifference;
    }

    return a.id.localeCompare(b.id);
  });
}
