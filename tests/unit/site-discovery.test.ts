import assert from "node:assert/strict";
import { test } from "node:test";
import { absolutePublicUrl, collectCanonicalPaths, renderSitemap } from "../../src/lib/site-discovery.ts";
import type { ArtifactEntry, ProjectEntry, SiteData } from "../../src/lib/content/types.ts";
const common = {
  title: "Routing fixture", stage: "seed" as const, draft: false,
  subjects: [], tags: [], related: [], sourceFiles: [],
};
function project(id: string, slug: string): ProjectEntry {
  return { id, collection: "projects", data: {
    ...common, id, slug, projectsIndexMode: "expanded", artifactSequence: false,
    contentGroups: [], sidebarContentIds: [], detailSummaryContentIds: [],
    externalContents: [], roadmap: [],
  } };
}
function artifact(id: string, slug: string, projectIds: string[] = []): ArtifactEntry {
  return { id, collection: "artifacts", data: {
    ...common, id, slug, creationDate: { precision: "year", value: "2026" },
    addedToSite: "2026-10-10", omitFromLog: false, showSummaryInGallery: true,
    translation: false, artifactKind: "poem", showPreviewOnDetail: true,
    previewFit: "contain", previewRendering: "auto",
    projects: projectIds.map((id) => ({ id, highlight: false })),
  } };
}

function data(projects: ProjectEntry[] = [], artifacts: ArtifactEntry[] = []): SiteData {
  return { projects, artifacts, fieldNotes: [], experiments: [], logEntries: [],
    publicProjects: projects.filter(e => !e.data.draft), publicArtifacts: artifacts.filter(e => !e.data.draft),
    publicFieldNotes: [], publicExperiments: [], publicLogEntries: [] };
}
test("canonical uses the configured domain and drops query and fragment", () => {
  assert.equal(absolutePublicUrl("/atlas/?primary=artifact#results", new URL("https://example.org/")), "https://example.org/atlas/");
});
test("a deployment prefix is preserved exactly once", () => {
  assert.equal(absolutePublicUrl("/webhome/projects/visible/piece/", new URL("https://example.org/")), "https://example.org/webhome/projects/visible/piece/");
});
test("missing domain and external paths are errors", () => {
  assert.throws(() => absolutePublicUrl("/atlas/", undefined), /not configured/);
  for (const path of ["atlas/", "https://elsewhere.test/", "//elsewhere.test/"]) {
    assert.throws(() => absolutePublicUrl(path, new URL("https://example.org/")), /internal path/);
  }
});
test("sitemap uses the project slug and excludes its artifact alias and drafts", () => {
  const projects = [project("stable", "visible")];
  const publicPiece = artifact("piece-id", "piece", ["stable"]);
  const draft = artifact("draft-id", "draft"); draft.data.draft = true;
  const paths = collectCanonicalPaths(data(projects, [publicPiece, draft]));
  assert(paths.includes("/projects/visible/piece/"));
  assert(!paths.includes("/artifacts/piece/"));
  assert(!paths.includes("/artifacts/draft/"));
  assert(!paths.includes("/404.html"));
  assert(!paths.some(p => p.startsWith("/previews/")));
  assert(paths.includes("/atlas/"));
});
test("standalone works have their own sitemap URL", () => {
  assert(collectCanonicalPaths(data([], [artifact("one", "standalone")])).includes("/artifacts/standalone/"));
});
test("duplicate canonical paths are rejected", () => {
  assert.throws(() => collectCanonicalPaths(data([project("a", "same"), project("b", "same")])), /Duplicate canonical/);
});
test("sitemap escapes XML characters without adding unsupported dates", () => {
  const xml = renderSitemap(['https://example.org/a?x=1&y=<"test">']);
  assert(xml.includes("&amp;y=&lt;&quot;test&quot;&gt;"));
  assert(!xml.includes("<lastmod>"));
  assert(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
});
