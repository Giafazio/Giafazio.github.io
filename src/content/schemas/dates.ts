import { z } from "astro/zod";

const yearValue = z
  .string()
  .regex(/^\d{4}$/, "Use a four-digit year");

const yearMonthValue = z
  .string()
  .regex(
    /^\d{4}-(0[1-9]|1[0-2])$/,
    "Use YYYY-MM",
  );

export const creationDate = z.discriminatedUnion(
  "precision",
  [
    z.object({
      precision: z.literal("day"),
      value: z.iso.date(),
    }),

    z.object({
      precision: z.literal("month"),
      value: yearMonthValue,
    }),

    z.object({
      precision: z.literal("year"),
      value: yearValue,
    }),

    z.object({
      precision: z.literal(
        "approximate-year",
      ),
      value: yearValue,
    }),
  ],
);