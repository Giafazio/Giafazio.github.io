# Fabrizio’s Webhome

Personal website and evolving collection of projects, writings, experiments, games, and other artifacts by Fabrizio Caragiulo.

The website is statically generated with Astro and is designed around a content model rather than a conventional chronological blog.

## Editorial structure

- **Projects** — coherent bodies of work that develop over time.
- **Field Notes & Thoughts** — notes, essays, reflections, and longer written pieces.
- **Experiments & Fragments** — tests, prototypes, fragments, and deliberately open pieces.
- **Artifacts** — individual works such as games, crosswords, poems, images, translations, and documents.
- **Paths & Atlas** — the site’s navigational layer, currently including the global Index. An interactive Atlas and recommended paths are planned.
- **HomeLog** — a record of additions and significant changes to the site.

Artifacts belonging to a project have canonical URLs inside that project:

```text
/projects/[project]/[artifact]/
```

Standalone artifacts use:

```text
/artifacts/[artifact]/
```

## Technology

- Astro 7 in static-output mode;
- TypeScript with strict checking;
- Astro Content Collections;
- HTML and CSS;
- small client-side scripts for interactive elements such as navigation, filters, games, and the homepage controls;
- locally hosted fonts.


## Local development

Node.js 22 or later is recommended.

Install the dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Astro will print the local address to open in the browser.

## Checks and builds

```bash
npm run check
```
Run Astro and TypeScript diagnostics.

```bash
npm run build
```
The build command performs three operations:

1. Astro and TypeScript checks;
2. static site generation;
3. validation of internal links and required outputs.

### Browser regression tests

Install the test browser once after `npm install` (and again when Playwright is updated):

```bash
npx playwright install chromium
npm run test:browser
```

`test:browser` builds the site and runs the tests against a dedicated preview server
at `127.0.0.1:4392`, which stops when the suite finishes. Keep this port free.
The development server on port 4321 is not used or restarted.
The tests use isolated browser contexts at desktop and mobile sizes; mobile is
emulated, not a substitute for testing a real phone.

The suite covers Index inclusion/exclusion, empty results, resets and entry identities
across views; project title bounds; experiment motion, pauses and reduced motion;
the Welcome raven with delayed or failed GIF loading and language changes; and audio
playback, seeking, errors and page navigation. It does not test development-only
design previews. Motion checks sample rendered geometry, not rasterized video frames.
The MiniCruci screenshot is for manual review, not an automated legibility guarantee.
Existing `scripts/check-*.cjs` remain available as older, targeted diagnostics;
the repeatable build-based suite lives in `tests/browser`.

For a build that is already current, use `npm run test:browser:built`.
Failures retain a screenshot and a trace; open the report with
`npm run test:browser:report`. Reports are ignored by Git.
The browser tests are local for now; the deployment workflow is unchanged.

### Index classification

`src/lib/index/taxonomy-rules.ts` defines the Index vocabulary, tag hierarchy,
cross-cutting sections and allowed secondary types for each primary type.
Both content validation and the browser filters use these rules.
Approved editorial assignments live separately in `index-assignments.ts`;
`index-taxonomy.ts` combines them with the existing content fields.

Renderer and homepage metadata retain their original roles: for example,
`artifactKind: audio` selects the audio renderer while the Index uses `composition`,
and `home-table` controls Featured inclusion. They are not replaced by Index tags.

Content loading validates classifications, assignment IDs and external works;
the vocabulary validates missing parents, cycles and cross-cutting sections.
Run the focused rule tests with `npm run test:taxonomy` (no browser required).

`AtlasIndexPage.astro` renders the current Index with List, Titles, Cards and Wall;
`src/lib/index/index-controller.ts` handles its filters, URL state and interactions.
The earlier `/previews/index/*` design variants have been retired.

## Repository structure

```text
src/
  assets/          imported and optimized visual assets
  components/      reusable Astro components
  content/         editorial content collections
  data/            site-wide configuration and navigation
  layouts/         shared page layouts
  lib/             content loading, routing, and validation
  pages/           Astro routes
  styles/          global and section styles

public/
  files/           downloadable documents
  images/          public images that must retain stable URLs

scripts/
  validate-build.mjs

docs/
  design notes and records of earlier development stages
```

The code, current content schemas, and current routes are authoritative. Some files in `docs/` describe earlier development stages and may retain historical terminology.

## Content lifecycle

Projects and artifacts may use the following botanical stages:

```text
seed
seedling
growing
blooming
full-grown
dormant
```

The `home-table` tag determines which public entries may appear among the homepage Featured items.


## Deployment configuration

The Astro configuration accepts two optional environment variables:

- `SITE_URL` — the canonical public URL;
- `BASE_PATH` — a repository subpath, when required by the hosting platform.

Without overrides, the site uses:

```text
https://fabriziocaragiulo.com
```

as its canonical site URL and `/` as its base path.

## Copyright, credits, and licensing

The repository and website include original work, third-party assets, translations, adaptations, and materials governed by different terms.

The complete credits, disclaimers, privacy information, and applicable licences are maintained on the website’s **Acknowledgements** page. No single licence should be assumed to cover every file in the repository.
