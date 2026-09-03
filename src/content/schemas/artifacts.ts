import { z } from "astro/zod";

import {
  slug,
  stableId,
} from "./primitives";

import {
  datedContentFields,
  projectRelation,
} from "./shared";

const crosswordClue = z.object({
  number: z
    .number()
    .int()
    .positive(),

  text: z
    .string()
    .min(1),
});

const crosswordLayout = z
  .array(
    z.string().regex(
      /^[.#]+$/,
      "Ogni riga deve contenere solo punti e cancelletti.",
    ),
  )
  .min(1, "La griglia deve contenere almeno una riga.")
  .refine(
    (rows) =>
      rows.every((row) => row.length === rows[0]?.length),
    {
      message: "Tutte le righe devono avere la stessa lunghezza.",
    },
  )
  .refine(
    (rows) => rows.some((row) => row.includes(".")),
    {
      message: "La griglia deve contenere almeno una casella bianca.",
    },
  );

const crosswordData = z.object({
  gridAsset: z
    .string()
    .min(1),

  layout: crosswordLayout.optional(),

  across: z
    .array(crosswordClue)
    .default([]),

  down: z
    .array(crosswordClue)
    .default([]),
});

const fourWordsRound = z.object({
  id: stableId,

  words: z
    .array(
      z.string().min(1),
    )
    .min(4),

  solution:
    z.string().min(1),
});

const fourWordsGame = z.object({
  rounds: z
    .array(fourWordsRound)
    .min(1),
});

export const artifactSchema =
  datedContentFields.extend({
    title: z.string().min(1),
    slug,

    language: z
      .string()
      .min(2)
      .optional(),

    artifactKind: z.enum([
      "crossword",
      "poem",
      "lyrics",
      "game",
      "image",
      "font",
      "notes",
    ]),

    primaryAsset: z
      .string()
      .min(1)
      .optional(),

    previewAsset: z
      .string()
      .min(1)
      .optional(),

    showPreviewOnDetail:
      z.boolean().default(true),

    previewAlt: z
      .string()
      .min(1)
      .optional(),

    previewPosition: z
      .string()
      .min(1)
      .optional(),

    previewFit: z
      .enum([
        "cover",
        "contain",
      ])
      .default("contain"),

    previewRendering: z
      .enum([
        "auto",
        "pixelated",
      ])
      .default("auto"),

    crossword:
      crosswordData.optional(),

    fourWordsGame:
      fourWordsGame.optional(),

    projects: z
      .array(projectRelation)
      .default([]),
  });
