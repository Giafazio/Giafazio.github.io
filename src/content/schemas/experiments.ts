import type {
  SchemaContext,
} from "astro:content";

import { z } from "astro/zod";

import {
  slug,
} from "./primitives";

import {
  datedContentFields,
  projectRelation,
} from "./shared";

export const experimentSchema = ({
  image,
}: SchemaContext) =>
  datedContentFields.extend({
    slug: slug.nullable(),

    entryKind: z.enum([
      "experiment",
      "fragment",
    ]),

    presentation: z
      .enum([
        "standard",
        "verse",
        "image",
        "monospace",
      ])
      .default("standard"),

    interactive:
      z.boolean().default(false),

    fallback: z
      .string()
      .min(1)
      .optional(),

    projects: z
      .array(projectRelation)
      .default([]),

    preview: z
      .object({
        asset: image(),
        alt: z.string().min(1),

        position: z
          .string()
          .min(1)
          .optional(),

        fit: z
          .enum([
            "cover",
            "contain",
          ])
          .default("cover"),
      })
      .optional(),
  });