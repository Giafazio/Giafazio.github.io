// Uses Astro's existing Vite/YAML dependencies; no server port is opened.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import { createServer } from "vite";

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  appType: "custom",
  optimizeDeps: { noDiscovery: true, include: [] },
});

try {
  const { artifactSchema } = await server.ssrLoadModule("/src/content/schemas/artifacts.ts");
  const source = await readFile("src/content/artifacts/avventura-autunno.md", "utf8");
  const current = parse(source.split(/^---\s*$/m)[1]);
  assert(artifactSchema.safeParse(current).success, "The current audio must remain valid");

  // Change only in-memory fixtures, never the editorial source.
  const { primaryAsset, ...withoutAsset } = current;
  const invalid = artifactSchema.safeParse(withoutAsset);
  assert(!invalid.success, "Public audio must declare its file");
  assert(invalid.error.issues.some(issue =>
    issue.path.join(".") === "primaryAsset" && issue.message.includes("audio file")
  ), "The error must identify the missing audio file");
  assert(artifactSchema.safeParse({ ...withoutAsset, draft: true }).success,
    "Draft audio may be incomplete");
  assert(artifactSchema.safeParse({ ...withoutAsset, artifactKind: "poem" }).success,
    "Non-audio content must not require an audio file");
  console.log("Audio schema: 4 cases passed.");
} finally {
  await server.close();
}
