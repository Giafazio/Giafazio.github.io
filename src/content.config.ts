import {
  defineCollection,
} from "astro:content";

import {
  glob,
} from "astro/loaders";

import {
  artifactSchema,
} from "./content/schemas/artifacts";

import {
  experimentSchema,
} from "./content/schemas/experiments";

import {
  fieldNoteSchema,
} from "./content/schemas/fieldNotes";

import {
  logEntrySchema,
} from "./content/schemas/logEntries";

import {
  projectSchema,
} from "./content/schemas/projects";

const projects = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/projects",
  }),

  schema: projectSchema,
});

const fieldNotes = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base:
      "./src/content/field-notes",
  }),

  schema: fieldNoteSchema,
});

const experiments = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base:
      "./src/content/experiments",
  }),

  schema: experimentSchema,
});

const artifacts = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base:
      "./src/content/artifacts",
  }),

  schema: artifactSchema,
});

const logEntries = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/log",
  }),

  schema: logEntrySchema,
});

export const collections = {
  projects,
  fieldNotes,
  experiments,
  artifacts,
  logEntries,
};