// Run against a local server. PLAYWRIGHT_MODULE can point to an existing runtime
// without adding Playwright to the site's production dependencies.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:4321";

(async () => {
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || "msedge", headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      let audioRequests = 0;
      page.on("request", request => { if (request.url().endsWith(".mp3")) audioRequests++; });
      await page.goto(`${base}/projects/`);
      const card = page.locator("#symphojingles");
      await card.locator("[data-play]").waitFor();
      assert.equal(audioRequests, 0, "Audio must wait for Play");
      await card.locator(".project-title-button").click();
      await page.waitForURL("**/projects/symphojingles/");
      await page.locator(".music-piece a").click();
      await page.waitForURL("**/avventura-autunno/");
      await page.locator("[data-play]").click();
      await page.waitForFunction(() => document.querySelector("audio").currentTime > 0);
      await page.locator("[data-play]").click();
      await page.locator("input[type=range]").fill("50");
      await page.waitForFunction(() => Math.abs(document.querySelector("audio").currentTime / document.querySelector("audio").duration - 0.5) < 0.01);
      await page.locator("[data-restart]").click();
      await page.waitForFunction(() => document.querySelector("audio").currentTime === 0);
      assert.equal(await page.locator(".music-credits").evaluate(e => getComputedStyle(e).textAlign), "left");
      await page.locator(".project-title-button").click();
      await page.waitForURL("**/projects/symphojingles/");
      await page.locator("[data-play]").click();
      await page.waitForFunction(() => document.querySelector("audio").currentTime > 0);
      await page.close();
      console.log(`Music navigation and playback: ${width}px OK`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
