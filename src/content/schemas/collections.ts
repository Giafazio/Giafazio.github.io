import type { SchemaContext } from "astro:content";
import { z } from "astro/zod";
import { slug } from "./primitives";
import { creationDate } from "./dates";
import { datedContentFields, projectRelation } from "./shared";

const text = z.string().trim().min(1);
const externalUrl = z.url({
  protocol: /^https?$/,
  error: "Use an absolute HTTP(S) URL for an external item",
});

export function collectionVisualSchema({ image }: SchemaContext) {
  return z.discriminatedUnion("type", [
    z.object({
      type: z.literal("image"),
      asset: image(),
      // Una stringa vuota indica una visual intenzionalmente decorativa.
      alt: z.string(),
      credit: text.optional(),
      fit: z.enum(["contain", "cover"]).default("contain"),
      position: text.default("50% 50%"),
      textColor: z.string().trim().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i,
        "Use a hexadecimal color such as #fff or #1c1c1c").default("#fff"),
      textPosition: z.enum(["bottom", "center"]).default("bottom"),
      textShadow: z.boolean().default(false),
      textScrim: z.number().min(0).max(1).default(0),
    }),
    z.object({
      type: z.literal("text"),
      text: text.optional(),
    }),
    z.object({ type: z.literal("none") }),
  ]);
}

export function curatedCollectionSchema(context: SchemaContext) {
  const visual = collectionVisualSchema(context);
  const item = z.object({
    title: text,
    url: externalUrl,
    note: text.optional(),
    visual: visual.default({ type: "none" }),
  });

  const playlistItem = item.extend({
    shortTitle: text.optional(),
    titleLines: z.array(text).min(2).optional(),
    creator: text.optional(),
    creatorSmallCaps: z.array(text).optional(),
    album: z.object({
      title: text,
      year: z.number().int().min(1).max(9999),
      source: externalUrl.optional(),
    }).optional(),
    lyricsExcerpt: text.optional(),
    year: z.number().int().min(1).max(9999).optional(),
    mediaKind: z.enum(["music", "video"]).optional(),
  });

  const placeItem = item.extend({
    area: text.optional(),
    category: text.optional(),
  });

  const linkItem = item.extend({ source: text.optional() });
  const endorsementItem = item.extend({ category: text.optional() });

  const base = datedContentFields.extend({
    entryKind: z.literal("collection"),
    title: text,
    summary: text.optional(),
    creationDate: creationDate.optional(),
    slug,
    projects: z.array(projectRelation).default([]),
    preview: visual.optional(),
  });

  // La famiglia valida dati e display insieme. Gli items rimangono
  // oggetti esterni senza id, slug o riferimenti al registro del sito.
  return z.discriminatedUnion("collectionKind", [
    base.extend({
      collectionKind: z.literal("playlist"),
      display: z.enum(["mixtape", "wall", "list"])
        .default("mixtape"),
      items: z.array(playlistItem).min(1),
    }),
    base.extend({
      collectionKind: z.literal("places"),
      display: z.enum(["cards", "list"]).default("cards"),
      items: z.array(placeItem).min(1),
    }),
    base.extend({
      collectionKind: z.literal("shops"),
      display: z.enum(["cards", "list"]).default("cards"),
      items: z.array(placeItem).min(1),
    }),
    base.extend({
      collectionKind: z.literal("links"),
      display: z.enum(["bookmarks", "list"]).default("bookmarks"),
      items: z.array(linkItem).min(1),
    }),
    base.extend({
      collectionKind: z.literal("endorsements"),
      display: z.enum(["cards", "list"]).default("cards"),
      items: z.array(endorsementItem).min(1),
    }),
    base.extend({
      collectionKind: z.literal("other"),
      display: z.enum(["cards", "list"]).default("cards"),
      items: z.array(item).min(1),
    }),
  ]);
}

export type CuratedCollectionData =
  z.output<ReturnType<typeof curatedCollectionSchema>>;
export type CollectionKind = CuratedCollectionData["collectionKind"];
export type CollectionItem = CuratedCollectionData["items"][number];
export type CollectionVisual =
  z.output<ReturnType<typeof collectionVisualSchema>>;
export type PlaylistData =
  Extract<CuratedCollectionData, { collectionKind: "playlist" }>;
export type PlaylistItem = PlaylistData["items"][number];
