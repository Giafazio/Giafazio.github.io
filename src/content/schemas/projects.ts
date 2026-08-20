import { z } from "astro/zod";

import {
  slug,
  stableId,
  stage,
} from "./primitives";

import {
  commonFields,
} from "./shared";

export const projectSchema =
  commonFields.extend({
    title: z.string().min(1),
    slug,

    homeOverview:
      z.boolean().default(false),

    projectsIndexMode: z
      .enum([
        "expanded",
        "collapsed",
      ])
      .default("expanded"),

    artifactSequence:
      z.boolean().default(false),

    detailSummaryContentIds:
      z.array(stableId).default([]),

    order: z
      .number()
      .int()
      .nonnegative()
      .optional(),

    preview: z
      .object({
        asset: z.string().min(1),
        alt: z.string().min(1),
      })
      .optional(),

    externalContents: z
      .array(
        z.object({
          title: z.string().min(1),
          kind: z.string().min(1),
          stage,
          language:
            z.string().min(2),
          href: z.url(),

          order: z
            .number()
            .int()
            .nonnegative()
            .optional(),
        }),
      )
      .default([]),

    roadmap: z
      .array(
        z.object({
          id: stableId,
          title: z.string().min(1),
          stage,
          statement:
            z.string().min(1),
        }),
      )
      .default([]),
  });