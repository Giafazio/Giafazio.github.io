import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";

import {
  dirname,
  extname,
  join,
  relative,
  resolve,
} from "node:path";

import { fileURLToPath } from "node:url";

const projectRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

const distRoot = join(projectRoot, "dist");

const configuredBase =
  `/${
    (process.env.BASE_PATH || "/")
      .replace(/^\/+|\/+$/g, "")
  }/`.replace(/\/+/g, "/");

if (!existsSync(distRoot)) {
  throw new Error(
    "dist/ is missing; run the Astro build first.",
  );
}

function walk(directory) {
  return readdirSync(directory).flatMap(
    (name) => {
      const path = join(directory, name);

      return statSync(path).isDirectory()
        ? walk(path)
        : [path];
    },
  );
}

function targetExists(path) {
  if (
    existsSync(path) &&
    statSync(path).isFile()
  ) {
    return true;
  }

  if (
    existsSync(path) &&
    statSync(path).isDirectory()
  ) {
    return existsSync(
      join(path, "index.html"),
    );
  }

  if (
    !extname(path) &&
    existsSync(`${path}.html`)
  ) {
    return true;
  }

  if (
    !extname(path) &&
    existsSync(join(path, "index.html"))
  ) {
    return true;
  }

  return false;
}

function normalizeOutputPath(path) {
  return path.replaceAll("\\", "/");
}

function collectReferences(html) {
  const references = [];

  const attributePattern =
    /\b(?:href|src)=["']([^"']+)["']/g;

  for (
    const [, reference] of
    html.matchAll(attributePattern)
  ) {
    references.push(reference);
  }

  const srcsetPattern =
    /\bsrcset=["']([^"']+)["']/g;

  for (
    const [, rawSrcset] of
    html.matchAll(srcsetPattern)
  ) {
    if (rawSrcset.startsWith("data:")) {
      continue;
    }

    for (const candidate of rawSrcset.split(",")) {
      const reference =
        candidate.trim().split(/\s+/, 1)[0];

      if (reference) {
        references.push(reference);
      }
    }
  }

  return references;
}

function isExternalReference(reference) {
  return (
    reference.startsWith("#") ||
    reference.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(
      reference,
    )
  );
}

function removeConfiguredBase(reference) {
  if (
    configuredBase === "/" ||
    !reference.startsWith("/")
  ) {
    return reference;
  }

  const baseRoot =
    configuredBase.replace(/\/$/, "");

  if (reference === baseRoot) {
    return "/";
  }

  if (reference.startsWith(configuredBase)) {
    return (
      "/" +
      reference.slice(configuredBase.length)
    );
  }

  return reference;
}

const htmlFiles = walk(distRoot).filter(
  (path) => path.endsWith(".html"),
);

const relativeHtmlPaths = htmlFiles.map(
  (path) =>
    normalizeOutputPath(
      relative(distRoot, path),
    ),
);

const problems = new Set();

for (const htmlFile of htmlFiles) {
  const relativeHtmlFile =
    normalizeOutputPath(
      relative(distRoot, htmlFile),
    );

  const html =
    readFileSync(htmlFile, "utf8");

  if (
    /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i
      .test(html)
  ) {
    problems.add(
      `${relativeHtmlFile} contains a localhost URL`,
    );
  }

  const ids = new Set();

  for (
    const [, id] of
    html.matchAll(/\bid=["']([^"']+)["']/g)
  ) {
    if (ids.has(id)) {
      problems.add(
        `${relativeHtmlFile} contains duplicate id="${id}"`,
      );
    }

    ids.add(id);
  }

  for (
    const rawReference of
    collectReferences(html)
  ) {
    if (
      !rawReference ||
      isExternalReference(rawReference)
    ) {
      continue;
    }

    const encodedReference =
      rawReference.split(/[?#]/, 1)[0];

    if (!encodedReference) {
      continue;
    }

    let cleanReference;

    try {
      cleanReference =
        decodeURI(encodedReference);
    } catch {
      problems.add(
        `${relativeHtmlFile} contains an invalid URL: ${rawReference}`,
      );

      continue;
    }

    if (
      configuredBase !== "/" &&
      cleanReference.startsWith("/")
    ) {
      const baseRoot =
        configuredBase.replace(/\/$/, "");

      const usesConfiguredBase =
        cleanReference === baseRoot ||
        cleanReference.startsWith(
          configuredBase,
        );

      if (!usesConfiguredBase) {
        problems.add(
          `${relativeHtmlFile} bypasses BASE_PATH: ${rawReference}`,
        );
      }
    }

    const localReference =
      removeConfiguredBase(cleanReference);

    const target =
      localReference.startsWith("/")
        ? join(
            distRoot,
            localReference.replace(
              /^\/+/,
              "",
            ),
          )
        : resolve(
            dirname(htmlFile),
            localReference,
          );

    if (!targetExists(target)) {
      problems.add(
        `${relativeHtmlFile} -> ${rawReference}`,
      );
    }
  }
}

const requiredOutputs = [
  "index.html",
  "404.html",
  "acknowledgements/index.html",
  "atlas/index.html",
  "projects/index.html",
  "field-notes/index.html",
  "experiments/index.html",
  "artifacts/index.html",
  "files/fabrizio-caragiulo-cv.pdf",
  "files/crosswords/cruciverba-1.pdf",
  "files/crosswords/cruciverba-2.pdf",
  "files/crosswords/cruciverba-3.pdf",
  "files/thoughts/la-signorina-probabilita.pdf",
];

for (const output of requiredOutputs) {
  if (
    !existsSync(join(distRoot, output))
  ) {
    problems.add(
      `missing required output: ${output}`,
    );
  }
}

const expectedPageGroups = [
  {
    label: "project detail page",
    pattern:
      /^projects\/[^/]+\/index\.html$/,
  },
  {
    label: "project artifact page",
    pattern:
      /^projects\/[^/]+\/[^/]+\/index\.html$/,
  },
  {
    label: "field-note detail page",
    pattern:
      /^field-notes\/[^/]+\/index\.html$/,
  },
  {
    label: "experiment detail page",
    pattern:
      /^experiments\/[^/]+\/index\.html$/,
  },
  {
    label: "standalone artifact page",
    pattern:
      /^artifacts\/[^/]+\/index\.html$/,
  },
];

for (
  const { label, pattern } of
  expectedPageGroups
) {
  if (
    !relativeHtmlPaths.some(
      (path) => pattern.test(path),
    )
  ) {
    problems.add(
      `no ${label} was generated`,
    );
  }
}

const forbiddenOutputs = [
  "finished-things",
];

for (const output of forbiddenOutputs) {
  if (
    existsSync(join(distRoot, output))
  ) {
    problems.add(
      `obsolete output was generated: ${output}`,
    );
  }
}

if (problems.size > 0) {
  throw new Error(
    `Build validation failed:\n- ${
      [...problems].join("\n- ")
    }`,
  );
}

console.log(
  [
    `Validated ${htmlFiles.length} HTML pages:`,
    "internal links and assets,",
    "BASE_PATH usage,",
    "required output groups,",
    "duplicate IDs,",
    "and local-only URLs are correct.",
  ].join(" "),
);