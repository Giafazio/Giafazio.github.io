// Run against the local site with the existing Playwright runtime.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:4321";

function gate() {
  let release;
  const promise = new Promise(resolve => { release = resolve; });
  return { promise, release: () => release() };
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || "msedge", headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      const english = gate();
      const italian = gate();
      await page.route("**/corvo-lessgo.gif", async route => {
        await english.promise;
        await route.continue();
      });
      await page.route("**/corvo-daje-tutta-cartiglio-5.gif", async route => {
        await italian.promise;
        await route.continue();
      });
      await page.goto(base);
      const range = page.locator("[data-welcome-enthusiasm]");
      const englishRequest = page.waitForRequest("**/corvo-lessgo.gif");
      await range.press("End");
      await englishRequest;
      // Observe past the 3.5s scenic delay while the image is still unavailable.
      await page.waitForTimeout(3700);
      assert.equal(await page.locator(".welcome-raven-flight").count(), 0);
      english.release();
      const image = page.locator(".welcome-raven-flight img");
      await image.waitFor();
      assert(await image.evaluate(image => image.complete && image.naturalWidth > 0));

      await page.waitForFunction(() =>
        document.querySelector(".welcome-raven-flight img").getBoundingClientRect().left >= 0);
      const beforeSwitch = await image.evaluate(element => element.getBoundingClientRect().left);
      const italianRequest = page.waitForRequest("**/corvo-daje-tutta-cartiglio-5.gif");
      await page.getByText("ita", { exact: true }).click();
      await italianRequest;
      assert.match(await image.getAttribute("src"), /corvo-lessgo\.gif$/);
      italian.release();
      await page.waitForFunction(() => {
        const image = document.querySelector(".welcome-raven-flight img");
        return image?.src.endsWith("corvo-daje-tutta-cartiglio-5.gif") && image.complete;
      });
      assert(await image.evaluate(element => element.getBoundingClientRect().left) >= beforeSwitch,
        "Changing language must not send the crow back to the left edge");
      await range.press("ArrowLeft");
      assert.equal(await page.locator(".welcome-raven-flight").count(), 0);
      assert.deepEqual(errors, []);
      await page.close();

      // A completed download must not resurrect an effect after leaving the Home.
      const latePage = await browser.newPage({ viewport: { width, height: 844 } });
      const lateImage = gate();
      await latePage.route("**/corvo-lessgo.gif", async route => {
        await lateImage.promise;
        await route.continue();
      });
      await latePage.goto(base);
      const lateRequest = latePage.waitForRequest("**/corvo-lessgo.gif");
      await latePage.locator("[data-welcome-enthusiasm]").press("End");
      await lateRequest;
      await latePage.getByRole("link", { name: "FieldNotes", exact: true }).click();
      await latePage.waitForURL("**/field-notes/");
      lateImage.release();
      await latePage.waitForTimeout(4000);
      assert.equal(await latePage.locator(".welcome-raven-flight").count(), 0);
      await latePage.close();
      console.log(`Welcome raven: ${width}px passed`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
