import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveArtifactRoute, routeForEntry, validateContentRoutes } from "../../src/lib/content/routing.ts";
import type { ArtifactEntry, ExperimentEntry, ProjectEntry } from "../../src/lib/content/types.ts";

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

test("project relation uses the ID while page and link use its different slug", () => {
  const projects = [project("stable-id", "visible-slug")];
  const entry = artifact("piece-id", "piece", ["stable-id"]);
  const route = resolveArtifactRoute(entry, projects);
  assert.equal(route.kind, "project");
  assert.equal(route.project, projects[0]);
  assert.equal(route.path, "/projects/visible-slug/piece/");
  assert.deepEqual(route.params, { projectSlug: "visible-slug", artifactSlug: "piece" });
  assert.equal(routeForEntry(entry, projects), route.path);
  assert.equal(route.standalonePath, "/artifacts/piece/");
  assert.equal(routeForEntry(entry, [project("stable-id", "new-slug")]), "/projects/new-slug/piece/");
});
test("standalone artifact keeps its own page", () => {
  const route = resolveArtifactRoute(artifact("piece-id", "piece"), []);
  assert.equal(route.kind, "standalone");
  assert.equal(route.project, null);
  assert.equal(route.path, "/artifacts/piece/");
  assert.deepEqual(route.params, { slug: "piece" });
});
test("the first relationship stays primary regardless of project array order", () => {
  const projects = [project("second", "second-slug"), project("first", "first-slug")];
  assert.equal(routeForEntry(artifact("piece", "piece", ["first", "second"]), projects), "/projects/first-slug/piece/");
});
test("missing primary project is an error", () => {
  assert.throws(() => resolveArtifactRoute(artifact("piece", "piece", ["missing"]), []), /missing project missing/);
});
test("different projects cannot occupy the same URL", () => {
  const projects = [project("one", "shared"), project("two", "shared")];
  assert.throws(() => validateContentRoutes(projects, projects), /URL .*shared.*one and two/);
});
test("artifact aliases stay unique even when primary paths differ", () => {
  const projects = [project("one", "first"), project("two", "second")];
  const entries = [artifact("a", "shared", ["one"]), artifact("b", "shared", ["two"])];
  assert.throws(() => validateContentRoutes(entries, projects), /URL \/artifacts\/shared\//);
});
test("a standalone page and its identical alias are allowed", () => {
  assert.doesNotThrow(() => validateContentRoutes([artifact("one", "piece")], []));
});
test("distinct primary paths and aliases are allowed", () => {
  const projects = [project("one", "first")];
  assert.doesNotThrow(() => validateContentRoutes([...projects, artifact("a", "piece", ["one"]), artifact("b", "other")], projects));
});
test("a draft without a slug occupies no URL", () => {
  const draft: ExperimentEntry = {
    id: "draft", collection: "experiments", data: {
      ...common, id: "draft", draft: true, slug: null,
      creationDate: { precision: "year", value: "2026" }, addedToSite: null,
      omitFromLog: false, showSummaryInGallery: true, projects: [],
      entryKind: "experiment", presentation: "standard", interactive: false,
    },
  };
  assert.doesNotThrow(() => validateContentRoutes([draft], []));
});
