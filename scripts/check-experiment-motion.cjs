// Run against a local server, using the same Playwright setup as the other UI checks.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:4321";
const gallerySelector = "[data-experiment-drift]";
const cardSelector = `${gallerySelector} .entry-gallery__card`;

(async () => {
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || "msedge", headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 400 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`${base}/experiments/`);
      await page.locator(`${gallerySelector}[data-initialized]`).waitFor();
      const gallery = page.locator(gallerySelector);
      const card = page.locator(cardSelector).first();

      await card.scrollIntoViewIfNeeded();
      const before = await card.getAttribute("style");
      await page.waitForFunction(({ selector, before }) =>
        document.querySelector(selector).getAttribute("style") !== before,
        { selector: cardSelector, before });

      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForFunction(selector =>
        document.querySelector(selector).getBoundingClientRect().top > innerHeight + 64,
        gallerySelector);
      // Observe a quiet interval; this delay is a test measurement, not initialization.
      await page.waitForTimeout(150);
      const paused = await card.getAttribute("style");
      await page.waitForTimeout(200);
      assert.equal(await card.getAttribute("style"), paused, "Offscreen cards must stay still");

      await card.scrollIntoViewIfNeeded();
      await page.waitForFunction(({ selector, paused }) =>
        document.querySelector(selector).getAttribute("style") !== paused,
        { selector: cardSelector, paused });

      const toggle = page.locator("[data-view-switch]");
      await toggle.click();
      assert(await page.locator("[data-moving-view]").isHidden());
      await toggle.click();
      await card.scrollIntoViewIfNeeded();
      assert(await gallery.isVisible());

      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(150);
      const reduced = await card.getAttribute("style");
      await page.waitForTimeout(200);
      assert.equal(await card.getAttribute("style"), reduced, "Reduced motion must remain still");
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Experiment motion: ${width}px passed`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
