import { z } from "astro/zod";

import {
  internalOrExternalHref,
} from "./links";

import {
  stableId,
} from "./primitives";

const logEntryType = z.enum([
  "site-update",
  "content-batch",
  "content-update",
  "project-update",
  "announcement",
  "new-project",
  "new-note",
  "new-thought",
  "new-experiment",
  "new-fragment",
  "new-artifact",
]);

const logOperation = z.enum([
  "add",
  "update",
]);

const logHeadlineLayout = z.enum([
  "inline",
  "stacked",
]);

const logChange = z.object({
  /*
   * Determina il simbolo:
   * add    -> +
   * update -> ~
   */
  operation: logOperation,

  label: z
    .string()
    .min(1),
});

const logBatchItem = z.object({
  /*
   * Contenuto collegato alla sottovoce.
   */
  target: stableId,

  /*
   * Determina il simbolo:
   * add    -> +
   * update -> ~
   */
  operation: logOperation,

  /*
   * Testo collegato alternativo al titolo
   * del contenuto.
   */
  label: z
    .string()
    .min(1)
    .optional(),

  /*
   * Testo normale mostrato dopo il titolo.
   */
  message: z
    .string()
    .min(1)
    .optional(),
  /*
   * Collegamento alternativo a quello
   * ricavato dal target.
   */
  href:
    internalOrExternalHref
      .optional(),
  /*
   * Metadato tecnico facoltativo.
   */
  typeLabel: z
    .string()
    .min(1)
    .optional(),
});

export const logEntrySchema = z
  .object({
    id: stableId,
    title: z.string().min(1),

    /*
     * Data esatta in cui l'aggiornamento
     * viene registrato.
     */
    loggedOn: z.iso.date(),

    type: logEntryType,

    /*
    * Determina il simbolo iniziale:
    * add    -> +
    * update -> ~
    */
    operation: logOperation,

    /*
    * Parte principale della headline.
    *
    * Se la voce ha un solo target,
    * questa parte diventerà il link.
    */
    label: z
      .string()
      .min(1)
      .optional(),

    /*
    * Testo mostrato dopo label,
    * separato graficamente da ":".
    */
    message: z
      .string()
      .min(1)
      .optional(),

    subtitle: z
      .string()
      .min(1)
      .optional(),

    /*
    * inline:
    *   Label: message
    *
    * stacked:
    *   Label:
    *     message
    */
    headlineLayout:
      logHeadlineLayout.default("inline"),

    /*
    * Modifiche interne alla voce del Log.
    * Restano distinte dagli items dei batch,
    * perché non devono puntare a contenuti.
    */
    changes: z
      .array(logChange)
      .default([]),

    /*
     * Permette di sostituire l'etichetta
     * visibile predefinita.
     */
    typeLabel: z.string().min(1).optional(),

    comment: z.string().min(1).optional(),

    /*
     * ID stabili dei contenuti coinvolti.
     * Può essere vuoto per aggiornamenti
     * indipendenti.
     */
    targets: z.array(stableId).default([]),

    /*
    * Sottovoci strutturate di un batch.
    * L'ordine dell'array è anche l'ordine
    * di visualizzazione.
    */
    items: z
      .array(logBatchItem)
      .default([]),

    replacesAutomaticEntries:
      z.boolean().default(false),

    /*
     * Ordine facoltativo tra aggiornamenti
     * aventi la stessa data. I valori più
     * piccoli vengono prima.
     */
    order: z
      .number()
      .int()
      .nonnegative()
      .optional(),

    detailsLink: z
      .object({
        label: z.string().min(1),
        href: internalOrExternalHref,
      })
      .optional(),

    draft: z.boolean().default(false),
  })
  .superRefine((entry, context) => {
    const isBatch =
      entry.type === "content-batch";

    const usesStructuredHeadline =
      entry.label !== undefined ||
      entry.message !== undefined;
    /*
    * I batch di contenuti continuano a usare
    * esclusivamente items.
    */
    if (
      isBatch &&
      entry.changes.length > 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["changes"],
        message:
          "A content-batch cannot contain standalone changes",
      });
    }

    if (
      isBatch &&
      entry.headlineLayout !== "inline"
    ) {
      context.addIssue({
        code: "custom",
        path: ["headlineLayout"],
        message:
          "A content-batch cannot use a stacked headline",
      });
    }

    /*
    * La disposizione stacked richiede
    * necessariamente una seconda riga.
    */
    if (
      !isBatch &&
      entry.headlineLayout === "stacked" &&
      entry.message === undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["message"],
        message:
          "A stacked headline requires a message",
      });
    }

    /*
    * Un batch deve contenere almeno
    * una sottovoce.
    */
    if (
      isBatch &&
      entry.items.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message:
          "A content-batch must contain at least one item",
      });
    }

    /*
    * Un batch usa items[].target,
    * non il campo targets generale.
    */
    if (
      isBatch &&
      entry.targets.length > 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["targets"],
        message:
          "A content-batch must use item.target instead of targets",
      });
    }

    /*
    * La headline principale di un batch
    * è contenuta interamente in title.
    */
    if (
      isBatch &&
      usesStructuredHeadline
    ) {
      context.addIssue({
        code: "custom",
        path: ["label"],
        message:
          "A content-batch uses title as its headline",
      });
    }

    /*
    * Le voci non batch non possono
    * contenere items.
    */
    if (
      !isBatch &&
      entry.items.length > 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message:
          "Items can only be used by a content-batch",
      });
    }

    /*
    * In una headline strutturata possiamo
    * collegare inline al massimo un target.
    */
    if (
      !isBatch &&
      usesStructuredHeadline &&
      entry.targets.length > 1
    ) {
      context.addIssue({
        code: "custom",
        path: ["targets"],
        message:
          "A structured log headline can link to at most one target; use content-batch for multiple contents",
      });
    }

    /*
    * Se manca label, essa può essere
    * ricavata soltanto da un unico target.
    */
    if (
      !isBatch &&
      entry.message !== undefined &&
      entry.label === undefined &&
      entry.targets.length !== 1
    ) {
      context.addIssue({
        code: "custom",
        path: ["label"],
        message:
          "Provide label when message has no single target from which to derive it",
      });
    }

    /*
    * Soltanto un'operazione add può
    * sostituire la voce automatica relativa
    * all'aggiunta iniziale di un contenuto.
    */
    const replaceableTargetIds =
      isBatch
        ? entry.items
            .filter(
              (item) =>
                item.operation === "add",
            )
            .map(
              (item) => item.target,
            )
        : entry.operation === "add"
          ? entry.targets
          : [];

    if (
      entry.replacesAutomaticEntries &&
      replaceableTargetIds.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path:
          isBatch
            ? ["items"]
            : ["targets"],
        message:
          "A replacing log entry must contain at least one add target",
      });
    }

    /*
    * Nelle voci normali lo stesso target
    * non deve apparire due volte.
    */
    if (
      new Set(entry.targets).size !==
      entry.targets.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["targets"],
        message:
          "The same target cannot be listed twice",
      });
    }
  });