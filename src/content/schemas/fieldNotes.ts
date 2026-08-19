import { z } from "astro/zod";

import {
  slug,
} from "./primitives";

import {
  datedContentFields,
  projectRelation,
} from "./shared";

export const fieldNoteSchema =
  datedContentFields.extend({
    slug: slug.nullable(),

    entryKind: z.enum([
      "site-note",
      "thought",
    ]),

    presentation: z
      .enum([
        "standard",
        "longform",
      ])
      .default("standard"),

    showTableOfContents:
      z.boolean().default(true),

    hyphenate:
      z.boolean().default(false),

    indentParagraphs:
      z.boolean().default(false),

    authorialCredit: z
      .string()
      .min(1)
      .optional(),

    authorialDateLabel: z
      .string()
      .min(1)
      .optional(),

    pdfAsset: z
      .string()
      .min(1)
      .optional(),

    texSource: z
      .string()
      .min(1)
      .optional(),

    projects: z
      .array(projectRelation)
      .default([]),
  });