import {
  compareCreationDate,
  getProjectContents,
  type ProjectEntry,
  type PublishableEntry,
  type SiteData,
} from "./content";

/*
 * Tag che rende un contenuto candidabile
 * per la homepage.
 */
const HOME_TABLE_TAG = "home-table";

/*
 * L’ordine determina la disposizione
 * nella galleria principale.
 *
 * Gli ID assenti vengono ignorati.
 */
const HOME_GALLERY_IDS = [
  "esperimenti-di-portafoglio",
  "quantum-transport-rg",
  "lega-i-4",
] as const;

const HOME_GALLERY_MAX_ITEMS = 6;
const HOME_GALLERY_FALLBACK_ITEMS = 5;

type HomeTableCandidate = {
  data: {
    tags: readonly string[];
  };
};

export type HomeFeaturedItem =
  | {
      kind: "project";
      id: string;
      project: ProjectEntry;
      contents: PublishableEntry[];
    }
  | {
      kind: "entry";
      id: string;
      entry: PublishableEntry;
    };

export type HomeFeaturedRow = {
  kind:
    | "mixed"
    | "projects"
    | "entries";

  columns: 2 | 3 | 4;
  items: HomeFeaturedItem[];
};

export interface HomeFeatured {
  galleryItems: HomeFeaturedItem[];
  remainingRows: HomeFeaturedRow[];
}

function hasHomeTableTag(
  entry: HomeTableCandidate,
): boolean {
  return entry.data.tags.includes(
    HOME_TABLE_TAG,
  );
}

/*
 * Costruzione automatica delle righe:
 *
 * - righe miste: tre elementi;
 * - soli progetti: due elementi;
 * - soli contenuti: quattro elementi.
 */
function buildFeaturedRows(
  items: HomeFeaturedItem[],
): HomeFeaturedRow[] {
  const projectQueue = items.filter(
    (item) => item.kind === "project",
  );

  const entryQueue = items.filter(
    (item) => item.kind === "entry",
  );

  const rows: HomeFeaturedRow[] = [];

  while (
    projectQueue.length > 0 &&
    entryQueue.length > 0
  ) {
    const projectCount =
      entryQueue.length === 1 &&
      projectQueue.length >= 2
        ? 2
        : 1;

    const entryCount =
      3 - projectCount;

    rows.push({
      kind: "mixed",
      columns: 3,

      items: [
        ...projectQueue.splice(
          0,
          projectCount,
        ),

        ...entryQueue.splice(
          0,
          entryCount,
        ),
      ],
    });
  }

  while (projectQueue.length > 0) {
    rows.push({
      kind: "projects",
      columns: 2,
      items: projectQueue.splice(0, 2),
    });
  }

  while (entryQueue.length > 0) {
    rows.push({
      kind: "entries",
      columns: 4,
      items: entryQueue.splice(0, 4),
    });
  }

  return rows;
}

export function getHomeFeatured(
  data: SiteData,
): HomeFeatured {
  const homeProjects =
    data.publicProjects.filter(
      hasHomeTableTag,
    );

  const homeProjectsWithContents =
    homeProjects.map((project) => ({
      project,

      contents: getProjectContents(
        data,
        project.data.id,
      ).filter(hasHomeTableTag),
    }));

  /*
   * Un contenuto già esposto dentro un
   * progetto Featured non viene ripetuto
   * anche come scheda autonoma.
   */
  const nestedHomeEntryIds = new Set(
    homeProjectsWithContents.flatMap(
      ({ contents }) =>
        contents.map(
          (entry) => entry.data.id,
        ),
    ),
  );

  const homeEntries: PublishableEntry[] = [
    ...data.publicFieldNotes,
    ...data.publicExperiments,
    ...data.publicArtifacts,
  ]
    .filter(hasHomeTableTag)
    .filter(
      (entry) =>
        !nestedHomeEntryIds.has(
          entry.data.id,
        ),
    )
    .sort(compareCreationDate);

  const homeFeaturedItems:
    HomeFeaturedItem[] = [
      ...homeProjectsWithContents.map(
        ({ project, contents }) => ({
          kind: "project" as const,
          id: project.data.id,
          project,
          contents,
        }),
      ),

      ...homeEntries.map((entry) => ({
        kind: "entry" as const,
        id: entry.data.id,
        entry,
      })),
    ];

  const homeItemById = new Map(
    homeFeaturedItems.map(
      (item) =>
        [item.id, item] as const,
    ),
  );

  const configuredGalleryItems =
    HOME_GALLERY_IDS.flatMap(
      (id): HomeFeaturedItem[] => {
        const item =
          homeItemById.get(id);

        return item ? [item] : [];
      },
    ).slice(
      0,
      HOME_GALLERY_MAX_ITEMS,
    );

  /*
   * Se nessun ID configurato è disponibile,
   * vengono usati i primi cinque Featured.
   */
  const galleryItems =
    configuredGalleryItems.length > 0
      ? configuredGalleryItems
      : homeFeaturedItems.slice(
          0,
          HOME_GALLERY_FALLBACK_ITEMS,
        );

  const galleryIds = new Set(
    galleryItems.map(
      (item) => item.id,
    ),
  );

  const remainingItems =
    homeFeaturedItems.filter(
      (item) =>
        !galleryIds.has(item.id),
    );

  return {
    galleryItems,

    remainingRows:
      buildFeaturedRows(
        remainingItems,
      ),
  };
}