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
