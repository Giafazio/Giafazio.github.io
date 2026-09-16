// Use an existing Playwright installation; no production dependency is needed.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:4321";

(async () => {
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || "msedge", headless: true });
  try {
    for (const width of [1440, 1000, 820, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`${base}/`);
      const homeTitle = page.locator('.home-featured-project .project-title-button').first();
      const homeTitleSize = await homeTitle.evaluate(e => parseFloat(getComputedStyle(e).fontSize));
      assert(homeTitleSize <= (width <= 760 ? 22 : 28), 'Featured titles must retain their own responsive sizing');
      await page.goto(`${base}/projects/`);
      assert.match(await page.locator('a[href$="/mini-cruci-1/"] img').getAttribute('src'), /mini-cruci-1-gallery\.webp$/);
      const title = page.locator('a[href$="/field-notes/cruciverba/"] .project-content-card__title');
      assert.match(await title.evaluate(e => getComputedStyle(e).fontFamily), /Spectral/);
      await page.evaluate(() => document.fonts.ready);
      assert(await page.locator('.project-box__title').evaluateAll(titles => titles.every(title => title.scrollWidth <= title.clientWidth)));
      assert(await page.locator('#symphojingles .music-controls').evaluate(controls => {
        const card = controls.closest('.project-box').getBoundingClientRect();
        return [...controls.children].every(child => {
          const rect = child.getBoundingClientRect();
          return rect.left >= card.left && rect.right <= card.right;
        });
      }));
      await page.goto(`${base}/experiments/`);
      const button = page.locator("[data-view-switch]");
      for (let state = 0; state < 2; state++) {
        await button.hover();
        await page.mouse.down();
        assert.equal(await button.evaluate(e => getComputedStyle(e).transform), "matrix(1, 0, 0, 1, 0, 2)");
        const before = await button.getAttribute("aria-pressed");
        await page.mouse.up();
        await page.waitForFunction(previous => document.querySelector("[data-view-switch]").getAttribute("aria-pressed") !== previous, before);
        assert.equal(await button.evaluate(e => getComputedStyle(e).transform), "none");
      }
      await button.focus();
      await page.keyboard.down("Space");
      assert.equal(await button.evaluate(e => getComputedStyle(e).transform), "matrix(1, 0, 0, 1, 0, 2)");
      await page.keyboard.up("Space");
      await page.close();
      console.log(`Note font and switch press: ${width}px OK`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
