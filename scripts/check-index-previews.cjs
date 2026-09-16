// Run against Astro dev: verify the live Index and its retained previews.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:4321";

(async () => {
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || "msedge", headless: true });
  try {
    for (const width of [1440, 390]) {
      for (const view of ["atlas", "fonts", "proposal", "typography", "ribbons", "margin", "cabinet"]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        await page.goto(`${base}${view === "atlas" ? "/atlas/" : `/previews/index/${view}/`}?primary=project&secondary=poem`);
        await page.locator("[data-taxonomy-index][data-ready]").waitFor();
        assert(await page.locator("[data-filter-group=secondary]").isHidden());
        await page.locator("[data-value=artifact]").click();
        const secondary = page.locator("[data-filter-group=secondary]");
        if (await secondary.getAttribute("open") === null) await secondary.locator("summary").click();
        await page.locator("[data-value=poem]").click();
        assert.equal(await page.locator("[data-index-item]:visible").count(), 6);
        await page.locator("[data-value=collection]").click();
        assert.equal(await page.locator("[data-index-item]:visible").count(), 1);
        assert(await page.locator("[data-value=poem]").isHidden());
        await page.locator("[data-clear]").click();
        assert.equal(await page.locator("[data-index-item]:visible").count(), 53);
        // Selected controls must retain an opaque, contrasting background.
        const selected = page.locator('[data-group=primary][aria-pressed=true]');
        assert(await selected.evaluate(element => {
          const style = getComputedStyle(element);
          return style.color !== style.backgroundColor && !["transparent", "rgba(0, 0, 0, 0)"].includes(style.backgroundColor);
        }));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.deepEqual(errors, []);
        if (["atlas", "fonts", "proposal"].includes(view)) {
          const cross = page.locator('[data-filter-group=cross]');
          assert.equal(await cross.getAttribute('open'), null);
          await cross.locator('summary').click();
          await page.locator('[data-value=mathematics]').click();
          assert(await page.locator('[data-index-item]:visible').count() > 0);
          await cross.locator('summary').click();
          assert.match(await page.locator('[data-selection-label=cross]').textContent(), /mathematics/);
        }
        await page.close();
        console.log(`${view} ${width}px: passed`);
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
