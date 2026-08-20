import { z } from "astro/zod";

import {
  creationDate,
} from "./dates";

import {
  stableId,
  stage,
} from "./primitives";

export const projectRelation = z.object({
  id: stableId,
  highlight: z.boolean().default(false),
  order: z.number().int().nonnegative().optional(),
});

export const commonFields = z.object({
  id: stableId,
  title: z.string().min(1).nullable(),
  workingLabel: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  language: z.string().min(2).optional(),
  stage,
  draft: z.boolean().default(false),

  subjects: z
    .array(z.string().min(1))
    .default([]),

  tags: z
    .array(stableId)
    .default([]),

  related: z
    .array(stableId)
    .default([]),

  sourceFiles: z
    .array(z.string().min(1))
    .default([]),
});

export const datedContentFields =
  commonFields.extend({
    /*
     * Data di creazione del componente.
     * Può avere precisione diversa:
     * giorno, mese, anno o anno approssimato.
     */
    creationDate,

    /*
     * Data esatta in cui il componente
     * è stato aggiunto al sito.
     *
     * Può essere null nelle bozze; una
     * validazione successiva la rende
     * obbligatoria nei contenuti pubblici.
     */
    addedToSite: z
      .iso
      .date()
      .nullable()
      .default(null),

    /*
     * Se true, il componente non genera
     * la normale voce automatica nel Log.
     */
    omitFromLog: z
      .boolean()
      .default(false),

    /*
     * Commento facoltativo da mostrare
     * nella voce automatica del Log.
     */
    logComment: z
      .string()
      .min(1)
      .optional(),

    /*
     * Ultima modifica sostanziale del
     * componente. Non è una data del Log.
     */
    updated: z
      .iso
      .date()
      .optional(),

    showSummaryInGallery:
      z.boolean().default(true),
  });