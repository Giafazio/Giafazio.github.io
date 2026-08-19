import { z } from "astro/zod";

export const stableId = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a stable kebab-case id");

export const slug = stableId;

export const stage = z.enum([
  "seed",
  "seedling",
  "growing",
  "blooming",
  "full-grown",
  "dormant",
]);