// Run against Astro dev: verify the current Index.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:4321";

(async () => {
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || "msedge", headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`${base}/atlas/?primary=project&secondary=poem`);
      await page.locator("[data-taxonomy-index][data-ready]").waitFor();
      const totalEntries = await page.locator("[data-index-item]").count();
      assert(await page.locator("[data-filter-group=secondary]").isHidden());
      await page.locator("[data-value=artifact]").click();
      const secondary = page.locator("[data-filter-group=secondary]");
      if (await secondary.getAttribute("open") === null) await secondary.locator("summary").click();
      await page.locator("[data-value=poem]").click();
      await page.locator('[data-index-item]').filter({ has: page.getByRole("link", { name: "Corrispondenze", exact: true }) }).waitFor({ state: "visible" });
      await page.locator("[data-value=collection]").click();
      await page.locator('[data-index-item]').filter({ has: page.locator('a[href$="/field-notes/passi-sparsi-tra-spicchi-di-mondi/"]') }).waitFor({ state: "visible" });
      assert(await page.locator("[data-value=poem]").isHidden());
      await page.locator("[data-clear]").click();
      assert.equal(await page.locator("[data-index-item]:visible").count(), totalEntries);
      // Selected controls must retain an opaque, contrasting background.
      const selected = page.locator('[data-group=primary][aria-pressed=true]');
      assert(await selected.evaluate(element => {
        const style = getComputedStyle(element);
        return style.color !== style.backgroundColor && !["transparent", "rgba(0, 0, 0, 0)"].includes(style.backgroundColor);
      }));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const cross = page.locator('[data-filter-group=cross]');
      assert.equal(await cross.getAttribute('open'), null);
      await cross.locator('summary').click();
      await page.locator('[data-value=mathematics]').click();
      assert(await page.locator('[data-index-item]:visible').count() > 0);
      await cross.locator('summary').click();
      assert.match(await page.locator('[data-selection-label=cross]').textContent(), /mathematics/);
      // Switching primary must clear a subtype unavailable in the new primary.
      await page.goto(`${base}/atlas/?primary=experiment&secondary=nursery-rhyme`);
      await page.locator("[data-taxonomy-index][data-ready]").waitFor();
      assert(await page.getByRole("link", { name: "ho visto un gatto", exact: true }).isVisible());
      await page.locator('[data-group="primary"][data-value="artifact"]').click();
      assert.equal(new URL(page.url()).searchParams.get("secondary"), null);
      assert.equal(await page.locator('[data-group="secondary"][data-value=""]').getAttribute("aria-pressed"), "true");
      assert(await page.locator("[data-index-item]:visible").count() > 0);

      // Hierarchical parents remain available, even when only children match.
      await page.locator('[data-group="secondary"][data-value="game"]').click();
      assert(await page.getByRole("link", { name: "MiniCruci 1", exact: true }).isVisible());

      // Explore by must not silently clear an otherwise valid secondary filter.
      await page.locator('[data-group="secondary"][data-value="poem"]').click();
      await page.locator('[data-filter-group="cross"] summary').click();
      await page.locator('[data-group="cross"][data-value="finance"]').click();
      assert.equal(new URL(page.url()).searchParams.get("secondary"), "poem");
      assert.equal(await page.locator('[data-group="secondary"][data-value="poem"]').getAttribute("aria-pressed"), "true");
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`atlas ${width}px: passed`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
