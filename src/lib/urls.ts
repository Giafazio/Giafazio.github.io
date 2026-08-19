type CollectionName =
  | "projects"
  | "fieldNotes"
  | "experiments"
  | "artifacts";

const routes: Record<CollectionName, string> = {
  projects: "/projects/",
  fieldNotes: "/field-notes/",
  experiments: "/experiments/",
  artifacts: "/artifacts/",
};

export function withBase(path: string): string {
  if (/^(?:[a-z]+:|#)/i.test(path)) return path;

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = path.replace(/^\/+/, "");

  return `${normalizedBase}${normalizedPath}`.replace(/\/+/g, "/");
}

export function routeFor(
  collection: CollectionName,
  slug: string,
): string {
  return `${routes[collection]}${slug}/`;
}

export function publicAsset(path: string): string {
  return withBase(path);
}
