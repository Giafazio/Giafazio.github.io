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

const crosswordData = z.object({
  gridAsset: z
    .string()
    .min(1),

  across: z
    .array(crosswordClue)
    .default([]),

  down: z
    .array(crosswordClue)
    .default([]),
});

const fourWordsRound = z.object({
  id: stableId,

  words: z.tuple([
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
  ]),

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
    ]),

    primaryAsset: z
      .string()
      .min(1)
      .optional(),

    previewAsset: z
      .string()
      .min(1)
      .optional(),

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

    crossword:
      crosswordData.optional(),

    fourWordsGame:
      fourWordsGame.optional(),

    projects: z
      .array(projectRelation)
      .default([]),
  });