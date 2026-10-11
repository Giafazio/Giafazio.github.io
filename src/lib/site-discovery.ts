import type { SiteContentEntry, SiteData } from "./content/types";
import { routeForSiteContentEntry } from "./content/routing.ts";

// Pagine pubbliche che non provengono dalle Content Collections.
const sectionPaths = [
  "/", "/projects/", "/field-notes/", "/experiments/", "/atlas/", "/acknowledgements/",
];

export function absolutePublicUrl(path: string, site: URL | undefined): string {
  if (!site) throw new Error("The public site URL is not configured");
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error(`Expected an internal path: ${path}`);
  }
  const url = new URL(path, site);
  // Filtri e frammenti non identificano nuove pagine.
  url.search = "";
  url.hash = "";
  return url.href;
}

export function collectCanonicalPaths(data: SiteData): string[] {
  const entries: SiteContentEntry[] = [
    ...data.publicProjects, ...data.publicFieldNotes,
    ...data.publicExperiments, ...data.publicArtifacts,
  ];
  const paths = [
    ...sectionPaths,
    ...entries.map((entry) => routeForSiteContentEntry(entry, data.publicProjects)),
  ];
  // Un duplicato deve essere segnalato, non nascosto.
  if (new Set(paths).size !== paths.length) {
    throw new Error("Duplicate canonical path in sitemap");
  }
  return paths.sort();
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function renderSitemap(urls: readonly string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    "</urlset>",
  ].join("\n");
}
