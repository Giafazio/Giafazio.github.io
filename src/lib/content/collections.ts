import type {
  CuratedCollectionData,
  CollectionKind,
} from "../../content/schemas/collections";
import type {
  FieldNoteEntry,
  SiteContentEntry,
  SiteData,
} from "./types";

export type CuratedCollectionEntry =
  FieldNoteEntry & { data: CuratedCollectionData };

export type WrittenFieldNoteEntry = FieldNoteEntry & {
  data: Exclude<FieldNoteEntry["data"], { entryKind: "collection" }>;
};

export function isCollectionEntry(
  entry: SiteContentEntry,
): entry is CuratedCollectionEntry {
  return entry.collection === "fieldNotes"
    && entry.data.entryKind === "collection";
}

export function isWrittenFieldNote(
  entry: FieldNoteEntry,
): entry is WrittenFieldNoteEntry {
  return entry.data.entryKind !== "collection";
}

export const collectionKindLabels = {
  playlist: "Playlist",
  places: "Places",
  shops: "Shops",
  links: "Links",
  endorsements: "Endorsements",
  other: "Other",
} satisfies Record<CollectionKind, string>;

// Solo le viste editoriali chiedono le bozze in anteprima.
// publicFieldNotes resta riservato ai contenuti pubblici, anche per
// Log, Featured, relazioni e controlli sulla pubblicazione.
export function fieldNotesForDisplay(data: SiteData): FieldNoteEntry[] {
  if (process.env.COLLECTION_PREVIEW !== "1") {
    return data.publicFieldNotes;
  }

  return data.fieldNotes.filter(
    (entry) => !entry.data.draft || isCollectionEntry(entry),
  );
}
