import { test, expect } from './fixtures';
import type { Locator } from '@playwright/test';

// Check rendered text, not just the outer h3: a child can overflow a fitting box.
async function expectTitleFits(title: Locator) {
  await expect(title).toBeVisible();
  expect(await title.evaluate(e => {
    const box = e.getBoundingClientRect();
    const label = e.querySelector('.project-title-button__label') ?? e;
    const range = document.createRange();
    range.selectNodeContents(label);
    return [...range.getClientRects()].every(r =>
      r.left >= box.left - 1 && r.right <= box.right + 1 &&
      r.top >= box.top - 1 && r.bottom <= box.bottom + 1);
  }), await title.innerText()).toBe(true);
}

test('all featured project titles and project controls fit at critical widths', async ({ page }) => {
  const widths = page.viewportSize()!.width === 390 ? [390] : [1440, 1000, 820];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const featured = page.locator('.home-featured-project .project-title-button');
    expect(await featured.count()).toBeGreaterThan(0);
    for (const title of await featured.all()) {
      await title.scrollIntoViewIfNeeded();
      expect(await title.evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBeLessThanOrEqual(width <= 760 ? 22 : 28);
      await expectTitleFits(title);
    }
    await page.goto('/projects/');
    await page.evaluate(() => document.fonts.ready);
    const titles = page.locator('.project-box__title .project-title-button');
    expect(await titles.count()).toBeGreaterThan(0);
    for (const title of await titles.all()) await expectTitleFits(title);
    expect(await page.locator('#symphojingles .music-controls').evaluate(controls => {
      const box = controls.closest('.project-box')!.getBoundingClientRect();
      return controls.children.length > 0 && [...controls.children].every(child => {
        const rect = child.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.left >= box.left && rect.right <= box.right;
      });
    })).toBe(true);
    const note = page.locator('a[href$="/field-notes/cruciverba/"] .project-content-card__title');
    expect(await note.evaluate(e => getComputedStyle(e).fontFamily)).toMatch(/Spectral/);
  }
});

test('MiniCruci preview loads the approved image; retain a crop for visual review', async ({ page }, testInfo) => {
  await page.goto('/projects/');
  const image = page.locator('a[href$="/mini-cruci-1/"] img');
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute('src', /mini-cruci-1-gallery\.webp$/);
  await expect.poll(() => image.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
  // This attachment supports manual inspection; it does not certify grid-line legibility.
  await testInfo.attach('MiniCruci preview', { body: await image.screenshot(), contentType: 'image/png' });
});
